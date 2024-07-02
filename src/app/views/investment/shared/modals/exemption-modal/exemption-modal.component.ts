import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';
import * as JSZip from 'jszip'; //JSZip

import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { AlertService, EmployeeService, ESSService, FileUploadService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { UIMode } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { EmployeeInvestmentDeductions, EmployeeInvestmentDocuments, InvestmentLogHistory } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
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
import { NgbModalConfig, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Relationship, RelationshipDependent } from '@services/model/Base/HRSuiteEnums';
import { EmployeeJourneyDetails } from '@services/model/Employee/EmployeeJourneyDetails';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-exemption-modal',
  templateUrl: './exemption-modal.component.html',
  styleUrls: ['./exemption-modal.component.scss']
})
export class ExemptionModalComponent implements OnInit {

  @ViewChild('myInput')
  myInputVariable: ElementRef;

  @Input() employeedetails: EmployeeDetails;
  @Input() currentTaxMode: number;
  @Input() LstAllDeclarationProducts: any[] = [];
  @Input() selectedFinYear: any;
  @Input() IsNewTaxRegimeOpted: boolean;
  @Input() LstEmployeeInvestmentLookup: EmployeeLookUp;
  @Input() UserId: number;
  @Input() RoleCode: string;

  BillCounts = { Saved: 0, Pending: 0, Approved: 0, Rejected: 0 };

  EmployeeId: any = 0;
  employeeModel: EmployeeModel = new EmployeeModel();
  isrendering_spinner: boolean = true;
  activeTabName: any;
  selectedStatusBox: any = 'All';
  TotalApprovedAmount: number = 0;
  TotalClaimedAmount: number = 0;
  SelectedExempTotalClaimedAmount: number = 0;
  SelectedExempTotalApprovedAmount: number = 0;
  selectAll: boolean = false;
  // TAX EXEMPTION 
  LstTaxExemptionProduct = [];
  popupTaxBills: any = [];

  IsOpenBillsCard: boolean = false;
  IsBillsAdded: boolean = false;

  LstExmptionBillDetails = [];
  LstSelectedBillitems = [];
  public hideRuleContent: boolean[] = [];
  public hideRuleContent_LTA: boolean[] = [];

  Id: any;
  BillAmount: number;
  BillApprovedAmount: number;
  BillNumber: string = null;
  BillDate: any;
  BillRemarks: string = "";
  BillId: any = 0;
  FileName: string = null;
  EmployeeTaxExemptionId: number;
  originalMode: any;
  selectedBillObject: any;
  IsProposed: boolean = false;

  isLoading: boolean = true;
  docSpinnerText: string = "Uploading";
  unsavedDocumentLst = [];

  modalOption: NgbModalOptions = {};
  IsApiTriggered: boolean = false;

  modalRef: NgbModalRef;
  relationship: any = [];
  relationshipDependent: any = [];
  IsDependentAdded: boolean = false;

  LstDependent = [];

  TravelID: string;
  TravellerName: string;
  TravelDateFrom: string;
  TravelDateTo: string;
  RelationshipType: string;
  DateOfBirth: string;
  Expense: string;
  OtherDetails: string;
  TravelType: string;
  TravelReceiptDocumentId: number = 0;
  TravelReceiptFileName: string = "";

  TravelFromCity: string = "";
  TravelToCity: string = "";
  TravelStartDate: any;
  TravelEndDate: any;


  TravelTypes = [
    { id: 1, name: 'Bus' },
    { id: 2, name: 'Flight' },
    { id: 3, name: 'Train' },
    { id: 4, name: 'Cab' },
    { id: 5, name: 'Own vehicle' },
    { id: 6, name: 'Others' },
  ];

  IsLTA: boolean = false;
  maxDateOfDOB = new Date();
  incurredExpense: boolean = false;
  TravelDetails = [];
  JourneyBills = [];

  isTravelBillAdded: boolean = false;
  groupedEmployeeJourneys = [];
  EmployeeJourneys = [];
  EmployeeJourneyId: any = 0;
  selectedLTADeclarationOption: string = '';
  incurredBillDeclaration: boolean = false;

  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZI
  contentmodalurl: SafeResourceUrl;
  IsAllowToAddMultipleJourneyCounts = environment.environment.IsAllowToAddMultipleJourneyCounts;
  EnddateminDate: Date;

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
    config: NgbModalConfig,
    private utilsHelper: enumHelper,
    private sanitizer: DomSanitizer,
  ) {
    config.backdrop = 'static';
    config.keyboard = false;
    this.relationship = this.utilsHelper.transform(Relationship);
    this.relationshipDependent = this.utilsHelper.transform(RelationshipDependent);
  }

  ngOnInit() {
    this.onRefresh();
  }

  // if you do not understand this code please text me. 
  onRefresh() {
    this.selectedStatusBox = 'All';
    let empRateSets = [];
    this.popupTaxBills = [];
    this.selectAll = false;
    this.LstSelectedBillitems = [];

    console.log('this.LstEmployeeInvestmentLookup', this.LstEmployeeInvestmentLookup);
    console.log('NonMandatoryExemptionColumns :', this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns);


    empRateSets = this.LstEmployeeInvestmentLookup.ApplicableExemptionProducts;
    this.LstTaxExemptionProduct = this.LstAllDeclarationProducts.filter(exe => exe.TaxCodeTypeId == TaxCodeType.Exemptions);

    console.log('EXEM PROD ::', this.LstTaxExemptionProduct);
    console.log('RATESET ::', empRateSets);

    empRateSets != null && empRateSets.length > 0 && this.LstTaxExemptionProduct != null && empRateSets.forEach(element => {
      var category = this.LstTaxExemptionProduct.find(a => a.ProductCode.toUpperCase() == element.ProductCode.toUpperCase());
      console.log('category', category);

      if (category != undefined && category.ProductCode.toUpperCase() != 'HRA') {
        this.popupTaxBills.push(category)
      }
    });

    // this.popupTaxBills = this.LstTaxExemptionProduct;

    this.popupTaxBills.length > 0 ? this.activeTabName = this.popupTaxBills[0].ProductId : true;
    this.popupTaxBills.length > 0 ? this.IsLTA = this.popupTaxBills[0].ProductCode == 'LTA' ? true : false : true;
    console.log('Filtered Item ::', this.popupTaxBills);
    console.log('emp exemption details :: ', this.employeedetails);

    this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
    if (this.EmployeeId == 0) {
      this.close_slider_exemptions();
      return;
    }
    this.GetEmployeeExemptionBillDetails();

  }

  GetEmployeeRequiredDetailsById(currentFinYear) {
    this.isrendering_spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, currentFinYear).subscribe((result) => {
          this.isrendering_spinner = false;
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            resolve(true);
            try {
              this.employeedetails = apiR.Result as any;
              this.employeeModel.oldobj = Object.assign({}, result.Result);

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

  doCaclculateDeclaredApprovedAmount() {
    this.TotalClaimedAmount = 0;
    this.TotalApprovedAmount = 0;

    this.SelectedExempTotalClaimedAmount = 0;
    this.SelectedExempTotalApprovedAmount = 0;


    this.LstExmptionBillDetails != null &&
      this.LstExmptionBillDetails.length > 0 &&
      this.LstExmptionBillDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear) { this.TotalClaimedAmount += parseInt(Number(e.BillAmount).toString()) } });

    this.LstExmptionBillDetails != null &&
      this.LstExmptionBillDetails.length > 0 &&
      this.LstExmptionBillDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ApprovedAmount != null) { this.TotalApprovedAmount += parseInt(Number(e.ApprovedAmount).toString()) } });

    this.LstExmptionBillDetails != null &&
      this.LstExmptionBillDetails.length > 0 &&
      this.LstExmptionBillDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ProductId == this.activeTabName) { this.SelectedExempTotalClaimedAmount += parseInt(Number(e.BillAmount).toString()) } });

    this.LstExmptionBillDetails != null &&
      this.LstExmptionBillDetails.length > 0 &&
      this.LstExmptionBillDetails.forEach(e => { if (e.FinancialYearId == this.selectedFinYear && e.ApprovedAmount != null && e.ProductId == this.activeTabName) { this.SelectedExempTotalApprovedAmount += parseInt(Number(e.ApprovedAmount).toString()) } });


    if (this.popupTaxBills.length == 0) {
      this.TotalClaimedAmount = 0;
      this.TotalApprovedAmount = 0;
    }
  }

  GetEmployeeExemptionBillDetails() {
    this.isrendering_spinner = true;
    this.LstExmptionBillDetails = [];
    this.EmployeeJourneys = [];
    this.JourneyBills = [];
    this.IsOpenBillsCard = false;
    this.employeeService.
      GetEmployeeExemptionBillDetails(this.EmployeeId)
      .subscribe((result) => {
        let apiR: apiResult = result;
        console.log('GET BILL ENTRY ::', apiR.Result);

        if (apiR.Status && apiR.Result != null) {

          this.EmployeeJourneys = [];
          this.LstExmptionBillDetails = result.Result;
          this.LstExmptionBillDetails = this.LstExmptionBillDetails.length > 0 ? this.LstExmptionBillDetails.filter(a => a.FinancialYearId == this.selectedFinYear) : [];
          this.LstExmptionBillDetails.length > 0 && this.LstExmptionBillDetails.forEach(e1 => {
            e1['isSelected'] = false;
          });

          this.LstExmptionBillDetails.length > 0 && this.LstExmptionBillDetails.forEach(e2 => {
            if (e2.isSelected) {
              e2.isSelected = false;
            }
          });
          console.log('PRID ::', this.activeTabName);
          this.getBillCounts();
          this.getLimitedBillDetails();
          this.doCaclculateDeclaredApprovedAmount();

          this.isrendering_spinner = false;

          if (this.IsLTA) {

            this.groupedEmployeeJourneys =
              _.chain(this.LstExmptionBillDetails)
                .groupBy("EmployeeJourneyId")
                .map((value, key) => ({ EmployeeJourneyId: key, Bills: value }))
                .value();
            console.log('groupedEmployeeJourneys', this.groupedEmployeeJourneys);

            this.groupedEmployeeJourneys != null && this.groupedEmployeeJourneys.length > 0 && this.groupedEmployeeJourneys.forEach(element => {
              this.EmployeeJourneys.push({
                JourneyStartDate: element.Bills[0].EmployeeJourneyDetails.TravelStartDate,
                JourneyEndDate: element.Bills[0].EmployeeJourneyDetails.TravelEndDate,
                TotalDeclaredAmount: this.calculateTotalBillAmount(element.Bills),
                TotalApprovedAmount: this.calculateTotalApprovedBillAmount(element.Bills),
                TotalBills: element.Bills.length,
                Bills: [...element.Bills],

              })
            });
            console.log('EmployeeJourneys', this.EmployeeJourneys);
          }
        }
        else {
          this.getBillCounts();
          this.getLimitedBillDetails();
          this.doCaclculateDeclaredApprovedAmount();
          this.isrendering_spinner = false;
        }
      }, err => {
        this.isrendering_spinner = false;
      });
  }

  private calculateTotalBillAmount(bills: any[]): number {
    return bills.reduce((sum, bill) => sum + bill.BillAmount, 0);
  }
  private calculateTotalApprovedBillAmount(bills: any[]): number {
    return bills.reduce((sum, bill) => sum + bill.ApprovedAmount, 0);
  }

  getBillCounts() {
    let filteredItems = [];
    filteredItems = this.LstExmptionBillDetails;
    this.BillCounts.Saved = filteredItems.length > 0 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId == 0).length : 0;
    this.BillCounts.Pending = filteredItems.length > 0 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId > 0 && z.Status == 0).length : 0;
    this.BillCounts.Approved = filteredItems.length > 0 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId > 0 && z.Status == 1).length : 0;
    this.BillCounts.Rejected = filteredItems.length > 0 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId > 0 && z.Status == 2).length : 0;

  }

  doCheckStatusBox(statusCode) {
    this.selectedStatusBox = statusCode;
  }

  getLimitedBillDetails() {
    let filteredItems = [];
    filteredItems = this.LstExmptionBillDetails;

    return filteredItems.length > 0 ? this.selectedStatusBox == 'All' ? filteredItems.filter(z => z.ProductId == this.activeTabName) :
      this.selectedStatusBox == -1 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId == 0) :
        this.selectedStatusBox == 0 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId > 0 && z.Status == 0) :
          this.selectedStatusBox == 1 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId > 0 && z.Status == 1) :
            this.selectedStatusBox == 2 ? filteredItems.filter(z => z.ProductId == this.activeTabName && z.EmployeeTaxExemptionId > 0 && z.Status == 2) : filteredItems : [];

  }

  onChangetabset(event) {
    this.LstDependent = [];
    this.activeTabName = event.nextId;
    this.popupTaxBills.length > 0 ? this.IsLTA = this.popupTaxBills.find(a => a.ProductId == event.nextId).ProductCode == 'LTA' ? true : false : true;

    this.LstSelectedBillitems = [];
    this.LstExmptionBillDetails.forEach(e2 => {

      if (e2.isSelected && e2.ProductId.toString() == event.activeId.toString()) {
        console.log("e2");

        e2.isSelected = false;
      }
    });
    console.log('this.LstSelectedBillitems', this.LstExmptionBillDetails);

    this.selectAll = false;
    this.clear();
    this.getBillCounts();
    // this.selectedStatusBox = 'All';
    this.getLimitedBillDetails();
    this.doCaclculateDeclaredApprovedAmount();
    // console.log('nn', this.activeTabName);


  }

  toggle(index) {
    this.hideRuleContent[index] = !this.hideRuleContent[index];
  }

  toggle_LTA(index) {
    this.hideRuleContent_LTA[index] = !this.hideRuleContent_LTA[index];
  }

  AddBills(targetValue) {
    this.LstSelectedBillitems = [];
    this.incurredExpense = false;
    this.LstExmptionBillDetails.length > 0 && this.LstExmptionBillDetails.forEach(e => {
      if (this.activeTabName == e.ProductId) {
        e.isSelected = false;
      }
    });

    this.TravelFromCity = null;
    this.TravelToCity = null;
    this.TravelType = null;
    // this.LstDependent = [];
    this.EmployeeTaxExemptionId = 0;
    this.BillNumber = null;
    this.BillAmount = null;
    this.BillApprovedAmount = null;
    this.BillDate = null;
    this.BillRemarks = null;
    this.Id = null;
    this.BillId = 0;
    this.FileName = null;
    this.EmployeeTaxExemptionId = 0;
    this.IsProposed = this.currentTaxMode == 1 ? true : false;

    this.Id = UUID.UUID();
    this.IsOpenBillsCard = targetValue;

    if (this.IsLTA) {
      this.EmployeeJourneyId = 0;
      this.JourneyBills = [];
      this.TravelStartDate = null;
      this.TravelEndDate = null
    }
  }
  doEditBills(item, index) {

    this.selectedBillObject = item;
    this.originalMode = item.BillId > 0 ? 2 : 1;
    this.BillAmount = item.BillAmount;
    this.BillApprovedAmount = item.ApprovedAmount;
    this.BillDate = item.BillDate == null ? null : new Date(item.BillDate);
    this.BillNumber = item.BillNumber;
    this.Id = item.Id;
    this.BillId = item.BillId;
    this.IsProposed = item.IsProposed;
    this.FileName = item.FileName;
    this.EmployeeTaxExemptionId = item.EmployeeTaxExemptionId;
    this.IsOpenBillsCard = true;
    this.BillRemarks = item.Remarks;

    document.getElementById('modalform').scrollTop = 0;

    let element = document.getElementById('modalform');
    element.scrollIntoView(true);
    $('#modalform').animate({
      scrollTop: 0
    }, 'slow');
    $('#modalform').scrollTop(0);
  }

  doEditBillsLTA(item, index) {
    console.log('itemss', item);

    // this.selectedBillObject = item;
    // this.originalMode = item.BillId > 0 ? 2 : 1;

    // this.BillAmount = item.BillAmount;
    // this.BillApprovedAmount = item.ApprovedAmount;
    // this.BillDate = item.BillDate == null ? null : new Date(item.BillDate);
    // this.BillNumber = item.BillNumber;
    // this.Id = item.Id;
    // this.BillId = item.BillId;
    // this.IsProposed = item.IsProposed;
    // this.FileName = item.FileName;
    // this.EmployeeTaxExemptionId = item.EmployeeTaxExemptionId;
    this.IsOpenBillsCard = true;
    this.EmployeeJourneyId = 0;
    // this.BillRemarks = item.Remarks;
    if (this.IsLTA) {
      this.TravelStartDate = new Date(item.JourneyStartDate);
      this.TravelEndDate = new Date(item.JourneyEndDate);
      this.LstDependent = item.Bills[0].EmployeeJourneyDetails.TravellerDetails != null ?
        JSON.parse(item.Bills[0].EmployeeJourneyDetails.TravellerDetails) : [];
      this.JourneyBills = item.Bills;
      this.EmployeeJourneyId = item.Bills[0].EmployeeJourneyDetails.Id;
      this.selectedLTADeclarationOption = item.Bills[0].EmployeeJourneyDetails.DeclarationAcceptanceForLTABlockYear.toString();

      this.EnddateminDate = new Date(this.TravelStartDate);
    }


    document.getElementById('modalform').scrollTop = 0;

    let element = document.getElementById('modalform');
    element.scrollIntoView(true);
    $('#modalform').animate({
      scrollTop: 0
    }, 'slow');
    $('#modalform').scrollTop(0);
  }

  doDeleteBills(item, index) {
    let TaxExmParentId = item.EmployeeTaxExemptionId;
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
        this.isrendering_spinner = true;
        item.ApprovalStatus = 0;
        item.Modetype = UIMode.Edit;
        item.EmployeeTaxExemptionId = 0;
        item.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(item, item.BillAmount, item.Remarks, item.ApprovedAmount, "", 'BILL');
        this.employeeService.insertEmployeeExemptionBillDetails(item).subscribe((result) => {
          let apiR: apiResult = result;
          console.log('Individual Delete ::: ', apiR);
          this.isrendering_spinner = false;
          if (apiR.Status) {
            if (TaxExmParentId > 0) {
              console.log('TaxExmParentId', TaxExmParentId);

              this.doEditOrDeleteBillEntries('Delete', item, TaxExmParentId);
            } else {
              this.GetEmployeeExemptionBillDetails();
              this.isrendering_spinner = false;
              this.BillNumber = null;
              this.BillAmount = null;
              this.BillApprovedAmount = null;
              this.BillDate = null;
              this.BillRemarks = null;
              this.Id = null;
              this.IsProposed = this.currentTaxMode == 1 ? true : false;
              this.IsProposed =
                this.FileName = null;
              this.EmployeeTaxExemptionId = 0;
            }
          }
        });

      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    })
  }

  CheckIsNullOrEmpty(FieldName) {

    if (FieldName == 'BillId') {
      return this.BillId > 0 ? true : this.Id > 0 && this.IsProposed ? true : false;
    } else {

      if (this.currentTaxMode == 1 && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
        const isExists = this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(FieldName);
        return isExists ? true : (this[FieldName] === undefined || this[FieldName] === null || this[FieldName] === "") ? false : true;
      } else {
        if (this.Id > 0 && this.IsProposed && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
          const isExists = this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(FieldName);
          return isExists ? true : (this[FieldName] === undefined || this[FieldName] === null || this[FieldName] === "") ? false : true;
        }
      }

      return (this[FieldName] === undefined || this[FieldName] === null || this[FieldName] === "") ? false : true;

    }
  }

  clear() {
    this.IsOpenBillsCard = false;
    this.BillNumber = null;
    this.BillAmount = null;
    this.BillApprovedAmount = null;
    this.BillDate = null;
    this.BillRemarks = null;
    this.Id = null;
    this.BillId = 0;
    this.IsProposed = this.currentTaxMode == 1 ? true : false;
    this.FileName = null;
    this.EmployeeTaxExemptionId = 0;
    this.IsBillsAdded = false;
  }


  PushBills() {
    this.LstSelectedBillitems = [];
    this.incurredExpense = false;
    this.LstExmptionBillDetails.length > 0 && this.LstExmptionBillDetails.forEach(e => {
      if (this.activeTabName == e.ProductId) {
        e.isSelected = false;
      }
    });

    this.IsBillsAdded = true;
    let RequiredFields = ["BillAmount", "BillNumber", "BillDate", "BillId"];

    if (this.currentTaxMode == 1 && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
      RequiredFields = RequiredFields.filter(item => !this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(item));
    }

    console.log('this.BillDate', this.BillDate);
    console.log('this.BillDate', this.BillNumber);
    let InvalidFields = [];

    if (this.currentTaxMode == 2 && this.BillId == 0) {
      this.BillId = null;
    }

    if (this.currentTaxMode == 1) {
      RequiredFields = RequiredFields.filter(e => e !== "BillId");
    }

    if (this.Id > 0 && this.IsProposed) {
      RequiredFields = RequiredFields.filter(e => e !== "BillId");
    }

    if (this.Id > 0 && this.IsProposed && this.BillId == null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
      RequiredFields = RequiredFields.filter(item => !this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(item));
    }

    RequiredFields.forEach(reqItems => {
      if ((this[reqItems] === undefined || this[reqItems] === null || this[reqItems] === "")) {
        reqItems =
          reqItems == "BillId" ? "Attachments" : reqItems;

        InvalidFields.push(reqItems.replace(/[A-Z]/g, ' $&').trim());
      }
    });

    if (InvalidFields.length > 0) {
      this.alertService.showWarning("Please complete all required fields : " + InvalidFields.join(', '));
      return;
    }
    this.IsOpenBillsCard = false;
    this.selectedBillObject = null;
    console.log('billid ::', this.BillId);;

    if (this.BillId == undefined || this.BillId == null || this.BillId == '') {
      this.BillId = 0;
    }


    // return;

    this.doInsertExemptionEntries();

  }

  doMapInvestmentLogHistory(item, Amount, Remarks, ApprovedAmount, ApproverRemarks, sectionName) {
    let LstLogHistory = [];
    let isNewRecord: boolean = false;
    console.log('item', item);
    console.log('this.LstExmptionBillDetails', this.LstExmptionBillDetails);


    if (item.Id == 0) {
      isNewRecord = true;
    } else {
      isNewRecord = false;
      if (sectionName == 'BILL') {
        LstLogHistory = this.LstExmptionBillDetails != null &&
          this.LstExmptionBillDetails.length > 0 &&
          this.LstExmptionBillDetails.filter(z => z.Id == item.Id).length > 0 &&
          this.LstExmptionBillDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.LstExmptionBillDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];
      }
      else if (sectionName == 'TAX') {
        LstLogHistory = this.employeedetails.LstEmployeeTaxExemptionDetails != null &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstEmployeeTaxExemptionDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstEmployeeTaxExemptionDetails.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

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

  doMapExemptionBillsOldandNew(billRequest, existingParentTaxObject) {
    let UpdatedTaxExemptionDetails = [];
    if (existingParentTaxObject) {
      let existingChildTaxObject = existingParentTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);


      if (existingChildTaxObject) {
        let index = existingParentTaxObject.LstEmployeeExemptionBillDetails.indexOf(existingChildTaxObject);
        if (index > -1) {
          existingParentTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
        }
        let totalAmount = 0;

        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            totalAmount = Number(totalAmount) + Number(element.BillAmount);
        });
        let ApprovedtotalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);
        });

        existingParentTaxObject.ApprovedAmount = ApprovedtotalAmount;
        existingParentTaxObject.Amount = totalAmount;
        existingParentTaxObject.Modetype = UIMode.Edit;
        UpdatedTaxExemptionDetails.push(existingParentTaxObject);
      }

    }

    let existingParentProofTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.FinancialYearId == this.selectedFinYear && a.IsProposed == false && a.ProductId == this.activeTabName);

    console.log('PROOF TAX OBJ :: ', existingParentProofTaxObject);

    if (existingParentProofTaxObject) {

      console.log('enterd');

      let childBills = existingParentProofTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);
      if (childBills) {
        let index = existingParentProofTaxObject.LstEmployeeExemptionBillDetails.indexOf(childBills);
        if (index > -1) {
          existingParentProofTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
        }
      }

      var billObj = new EmployeeExemptionBillDetails();
      billObj.Id = billRequest.Id;
      billObj.Modetype = UIMode.Edit;
      billObj.EmployeeId = this.EmployeeId;
      billObj.FinancialYearId = billRequest.FinancialYearId;
      billObj.ProductId = billRequest.ProductId;
      billObj.BillAmount = billRequest.BillAmount;
      billObj.BillNumber = billRequest.BillNumber;
      billObj.BillDate = moment(this.BillDate).format('YYYY-MM-DD') as any; billRequest.BillDate;
      billObj.BillId = billRequest.BillId;
      billObj.FileName = billRequest.FileName;
      billObj.Remarks = billRequest.Remarks;
      billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
      billObj.IsProposed = billObj.BillId > 0 ? false : true;
      billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
      billObj.ApprovalStatus = 1;
      billObj.EmployeeTaxExemptionId = existingParentProofTaxObject.Id;
      billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');

      existingParentProofTaxObject.LstEmployeeExemptionBillDetails.push(billObj);

      let totalAmount = 0;
      existingParentProofTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
        if (element.ApprovalStatus == 1)
          totalAmount = Number(totalAmount) + Number(element.BillAmount);
      });
      let ApprovedtotalAmount = 0;
      existingParentProofTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
        console.log('element', element);

        if (element.ApprovalStatus == 1) {
          ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);

        }
      });

      existingParentProofTaxObject.ApprovedAmount = ApprovedtotalAmount;

      existingParentProofTaxObject.Amount = totalAmount;
      existingParentProofTaxObject.Modetype = UIMode.Edit;
      existingParentProofTaxObject.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(existingParentProofTaxObject, existingParentProofTaxObject.Amount, existingParentProofTaxObject.InputsRemarks, existingParentProofTaxObject.ApprovedAmount, existingParentProofTaxObject.ApproverRemarks, 'TAX');

      UpdatedTaxExemptionDetails.push(existingParentProofTaxObject);

    } else {

      console.log('enterd 3');
      var billObj = new EmployeeExemptionBillDetails();
      billObj.Id = billRequest.Id;
      billObj.Modetype = UIMode.Edit;
      billObj.EmployeeId = this.EmployeeId;
      billObj.FinancialYearId = billRequest.FinancialYearId;
      billObj.ProductId = billRequest.ProductId;
      billObj.BillAmount = billRequest.BillAmount;
      billObj.BillNumber = billRequest.BillNumber;
      billObj.BillDate = billRequest.BillDate;
      billObj.BillId = billRequest.BillId;
      billObj.FileName = billRequest.FileName;
      billObj.Remarks = billRequest.Remarks;
      billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
      billObj.IsProposed = billObj.BillId > 0 ? false : true;
      billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
      billObj.ApprovalStatus = 1;
      billObj.EmployeeTaxExemptionId = 0;
      billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');

      var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
      empTaxExceptionObj.Id = 0;
      empTaxExceptionObj.Modetype = UIMode.Edit;
      empTaxExceptionObj.EmployeeId = this.EmployeeId;
      empTaxExceptionObj.FinancialYearId = this.selectedFinYear;
      empTaxExceptionObj.Status = 1;
      empTaxExceptionObj.ApprovedAmount = billRequest.BillId > 0 ? billRequest.ApprovedAmount : 0;
      empTaxExceptionObj.ProductId = this.activeTabName;
      empTaxExceptionObj.Amount = billRequest.BillAmount;
      empTaxExceptionObj.DocumentId = 0;
      empTaxExceptionObj.IsProposed = billRequest.BillId > 0 ? false : true;
      empTaxExceptionObj.LstEmployeeExemptionBillDetails = [];
      empTaxExceptionObj.LstEmployeeExemptionBillDetails.push(billObj);
      empTaxExceptionObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empTaxExceptionObj, empTaxExceptionObj.Amount, "", empTaxExceptionObj.ApprovedAmount, "", 'TAX');

      UpdatedTaxExemptionDetails.push(empTaxExceptionObj);
    }

    this.UpsertEmployeeInvestmentDetails(UpdatedTaxExemptionDetails);
    return;


  }

  doInsertExemptionEntries() {


    // Save or Edit (An Individual Bill Details)

    this.isrendering_spinner = true;
    var billRequest = new EmployeeExemptionDetails();
    billRequest.Id = this.essService.isGuid(this.Id) ? 0 : this.Id;
    billRequest.EmployeeId = this.EmployeeId;
    billRequest.FinancialYearId = this.selectedFinYear;
    billRequest.ProductId = this.activeTabName;
    billRequest.BillAmount = this.BillAmount
    billRequest.Remarks = this.BillRemarks;
    billRequest.ApproverRemarks = null
    billRequest.IsProposed = this.BillId > 0 ? false : true;
    billRequest.ApprovedAmount = this.BillId > 0 ? ((this.essService.isGuid(this.Id) && this.investmentService.PermissibleRoles(this.RoleCode)) ? (this.BillApprovedAmount == null || this.BillApprovedAmount == undefined) ? this.BillAmount : this.BillApprovedAmount :
      (!this.essService.isGuid(this.Id) && this.investmentService.PermissibleRoles(this.RoleCode)) ? this.BillApprovedAmount :
        0) : 0;
    billRequest.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
    billRequest.ApprovalStatus = 1;
    billRequest.BillId = this.BillId
    billRequest.BillNumber = this.BillNumber;
    billRequest.FileName = this.FileName
    billRequest.BillDate = this.BillDate == null ? null : moment(this.BillDate).format('YYYY-MM-DD') as any;
    billRequest.RejectedRemarks = '';
    billRequest.Modetype = UIMode.Edit;
    billRequest.EmployeeTaxExemptionId = this.EmployeeTaxExemptionId;
    billRequest.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(billRequest, billRequest.BillAmount, billRequest.Remarks, billRequest.ApprovedAmount, billRequest.ApproverRemarks, 'BILL');
    billRequest.LstTravellerDetails = this.LstDependent;

    console.log('billRequest', billRequest);

    if (this.investmentService.PermissibleRoles(this.RoleCode) && (this.BillId > 0)) {
      let existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.ProductId == this.activeTabName && a.FinancialYearId == this.selectedFinYear && a.IsProposed == true);
      console.log('Exists ORG AUTO APPROVE', existingParentTaxObject);
      if (!existingParentTaxObject) {
        existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.ProductId == this.activeTabName && a.FinancialYearId == this.selectedFinYear && a.IsProposed == false);
        console.log('Exists ORG AUTO APP ISPROS FAL', existingParentTaxObject);
      }
      // this.loadingScreenService.stopLoading();
      // this.isrendering_spinner = false;
      // return;
      this.doMapExemptionBillsOldandNew(billRequest, existingParentTaxObject);
      return;

    }

    if (this.investmentService.PermissibleRoles(this.RoleCode) && (this.BillId == 0 || this.BillId == null)) {
      console.log(this.employeedetails);

      let existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.ProductId == this.activeTabName && a.FinancialYearId == this.selectedFinYear && a.IsProposed == true);
      console.log('Exists ORG AUTO APPROVE', existingParentTaxObject);

      if (existingParentTaxObject) {


        let existingChildTaxObject = existingParentTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);
        let index = existingParentTaxObject.LstEmployeeExemptionBillDetails.indexOf(existingChildTaxObject);
        if (index > -1) {
          existingParentTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
        }

      }
      let UpdatedTaxExemptionDetails = [];

      if (existingParentTaxObject) {
        var billObj = new EmployeeExemptionBillDetails();
        billObj.Id = billRequest.Id;
        billObj.Modetype = UIMode.Edit;
        billObj.EmployeeId = this.EmployeeId;
        billObj.FinancialYearId = billRequest.FinancialYearId;
        billObj.ProductId = billRequest.ProductId;
        billObj.BillAmount = billRequest.BillAmount;
        billObj.BillNumber = billRequest.BillNumber;
        billObj.BillDate = this.BillDate == null ? null : moment(this.BillDate).format('YYYY-MM-DD') as any; billRequest.BillDate;
        billObj.BillId = billRequest.BillId;
        billObj.FileName = billRequest.FileName;
        billObj.Remarks = billRequest.Remarks;
        billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
        billObj.IsProposed = billObj.BillId > 0 ? false : true;
        billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
        billObj.ApprovalStatus = 1;
        billObj.EmployeeTaxExemptionId = existingParentTaxObject.Id;
        billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');
        billObj.LstTravellerDetails = billRequest.LstTravellerDetails;

        existingParentTaxObject.LstEmployeeExemptionBillDetails.push(billObj);

        let totalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            totalAmount = Number(totalAmount) + Number(element.BillAmount);
        });
        let ApprovedtotalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);
        });

        existingParentTaxObject.ApprovedAmount = ApprovedtotalAmount;

        existingParentTaxObject.Amount = totalAmount;
        existingParentTaxObject.Modetype = UIMode.Edit;
        existingParentTaxObject.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(existingParentTaxObject, existingParentTaxObject.Amount, existingParentTaxObject.InputsRemarks, existingParentTaxObject.ApprovedAmount, existingParentTaxObject.ApproverRemarks, 'TAX');

        UpdatedTaxExemptionDetails.push(existingParentTaxObject);

      } else { // new record has to be created 

        var billObj = new EmployeeExemptionBillDetails();
        billObj.Id = billRequest.Id;
        billObj.Modetype = UIMode.Edit;
        billObj.EmployeeId = this.EmployeeId;
        billObj.FinancialYearId = billRequest.FinancialYearId;
        billObj.ProductId = billRequest.ProductId;
        billObj.BillAmount = billRequest.BillAmount;
        billObj.BillNumber = billRequest.BillNumber;
        billObj.BillDate = billRequest.BillDate;
        billObj.BillId = billRequest.BillId;
        billObj.FileName = billRequest.FileName;
        billObj.Remarks = billRequest.Remarks;
        billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
        billObj.IsProposed = billObj.BillId > 0 ? false : true;
        billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
        billObj.ApprovalStatus = 1;
        billObj.EmployeeTaxExemptionId = 0;
        billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');
        billObj.LstTravellerDetails = billRequest.LstTravellerDetails;

        var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
        empTaxExceptionObj.Id = 0;
        empTaxExceptionObj.Modetype = UIMode.Edit;
        empTaxExceptionObj.EmployeeId = this.EmployeeId;
        empTaxExceptionObj.FinancialYearId = this.selectedFinYear;
        empTaxExceptionObj.Status = 1;
        empTaxExceptionObj.ApprovedAmount = billRequest.BillId > 0 ? billRequest.ApprovedAmount : 0;
        empTaxExceptionObj.ProductId = this.activeTabName;
        empTaxExceptionObj.Amount = billRequest.BillAmount;
        empTaxExceptionObj.DocumentId = 0;
        empTaxExceptionObj.IsProposed = billRequest.BillId > 0 ? false : true;
        empTaxExceptionObj.LstEmployeeExemptionBillDetails = [];
        empTaxExceptionObj.LstEmployeeExemptionBillDetails.push(billObj);
        empTaxExceptionObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empTaxExceptionObj, empTaxExceptionObj.Amount, "", empTaxExceptionObj.ApprovedAmount, "", 'TAX');


        UpdatedTaxExemptionDetails.push(empTaxExceptionObj);

      }

      UpdatedTaxExemptionDetails.length > 0 && this.UpsertEmployeeInvestmentDetails(UpdatedTaxExemptionDetails);
      return;

    }

    if (this.BillId > 0 && this.originalMode == 1 && this.EmployeeTaxExemptionId > 0) {

      console.log('originalMode :::', 1);


      let UpdatedTaxExemptionDetails = [];
      // remove that item from declaration mode
      let existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.Id == this.EmployeeTaxExemptionId && a.FinancialYearId == this.selectedFinYear && a.IsProposed == true);
      console.log('Exists ORG 2', existingParentTaxObject);

      if (!existingParentTaxObject) {
        existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.Id == this.EmployeeTaxExemptionId && a.FinancialYearId == this.selectedFinYear && a.IsProposed == false);
        console.log('Exists ORG ISPROS FAL', existingParentTaxObject);
      }

      if (existingParentTaxObject) {
        let existingChildTaxObject = existingParentTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);
        let index = existingParentTaxObject.LstEmployeeExemptionBillDetails.indexOf(existingChildTaxObject);
        if (index > -1) {
          existingParentTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
        }
        let totalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            totalAmount = Number(totalAmount) + Number(element.BillAmount);
        });
        let ApprovedtotalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);
        });

        existingParentTaxObject.ApprovedAmount = ApprovedtotalAmount;
        existingParentTaxObject.Amount = totalAmount;
        existingParentTaxObject.Modetype = UIMode.Edit;
        UpdatedTaxExemptionDetails.push(existingParentTaxObject);


        let existingParentProofTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.FinancialYearId == this.selectedFinYear && a.IsProposed == false && a.ProductId == this.activeTabName);

        console.log('PROOF TAX OBJ :: ', existingParentProofTaxObject);

        if (existingParentProofTaxObject) {

          let childBills = existingParentProofTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);
          if (childBills) {
            let index = existingParentProofTaxObject.LstEmployeeExemptionBillDetails.indexOf(childBills);
            if (index > -1) {
              existingParentProofTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
            }
          }


          var billObj = new EmployeeExemptionBillDetails();
          billObj.Id = billRequest.Id;
          billObj.Modetype = UIMode.Edit;
          billObj.EmployeeId = this.EmployeeId;
          billObj.FinancialYearId = billRequest.FinancialYearId;
          billObj.ProductId = billRequest.ProductId;
          billObj.BillAmount = billRequest.BillAmount;
          billObj.BillNumber = billRequest.BillNumber;
          billObj.BillDate = moment(this.BillDate).format('YYYY-MM-DD') as any; billRequest.BillDate;
          billObj.BillId = billRequest.BillId;
          billObj.FileName = billRequest.FileName;
          billObj.Remarks = billRequest.Remarks;
          billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
          billObj.IsProposed = billObj.BillId > 0 ? false : true;
          billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
          billObj.ApprovalStatus = 1;
          billObj.EmployeeTaxExemptionId = existingParentProofTaxObject.Id;
          billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');
          billObj.LstTravellerDetails = billRequest.LstTravellerDetails;

          existingParentProofTaxObject.LstEmployeeExemptionBillDetails.push(billObj);

          let totalAmount = 0;
          existingParentProofTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              totalAmount = Number(totalAmount) + Number(element.BillAmount);
          });
          let ApprovedtotalAmount = 0;
          existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);
          });

          existingParentTaxObject.ApprovedAmount = ApprovedtotalAmount;

          existingParentProofTaxObject.Amount = totalAmount;
          existingParentProofTaxObject.Modetype = UIMode.Edit;
          existingParentProofTaxObject.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(existingParentProofTaxObject, existingParentProofTaxObject.Amount, existingParentProofTaxObject.InputsRemarks, existingParentProofTaxObject.ApprovedAmount, existingParentProofTaxObject.ApproverRemarks, 'TAX');
          UpdatedTaxExemptionDetails.push(existingParentProofTaxObject);

        } else {
          var billObj = new EmployeeExemptionBillDetails();
          billObj.Id = billRequest.Id;
          billObj.Modetype = UIMode.Edit;
          billObj.EmployeeId = this.EmployeeId;
          billObj.FinancialYearId = billRequest.FinancialYearId;
          billObj.ProductId = billRequest.ProductId;
          billObj.BillAmount = billRequest.BillAmount;
          billObj.BillNumber = billRequest.BillNumber;
          billObj.BillDate = billRequest.BillDate;
          billObj.BillId = billRequest.BillId;
          billObj.FileName = billRequest.FileName;
          billObj.Remarks = billRequest.Remarks;
          billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
          billObj.IsProposed = billObj.BillId > 0 ? false : true;
          billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
          billObj.ApprovalStatus = 1;
          billObj.EmployeeTaxExemptionId = 0;
          billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');
          billObj.LstTravellerDetails = billRequest.LstTravellerDetails;

          var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
          empTaxExceptionObj.Id = 0;
          empTaxExceptionObj.Modetype = UIMode.Edit;
          empTaxExceptionObj.EmployeeId = this.EmployeeId;
          empTaxExceptionObj.FinancialYearId = this.selectedFinYear;
          empTaxExceptionObj.Status = 1;
          empTaxExceptionObj.ApprovedAmount = billRequest.BillId > 0 ? billRequest.ApprovedAmount : 0;
          empTaxExceptionObj.ProductId = this.activeTabName;
          empTaxExceptionObj.Amount = billRequest.BillAmount;
          empTaxExceptionObj.DocumentId = 0;
          empTaxExceptionObj.IsProposed = billRequest.BillId > 0 ? false : true;
          empTaxExceptionObj.LstEmployeeExemptionBillDetails = [];
          empTaxExceptionObj.LstEmployeeExemptionBillDetails.push(billObj);
          empTaxExceptionObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empTaxExceptionObj, empTaxExceptionObj.Amount, "", empTaxExceptionObj.ApprovedAmount, "", 'TAX');

          UpdatedTaxExemptionDetails.push(empTaxExceptionObj);
        }

        this.UpsertEmployeeInvestmentDetails(UpdatedTaxExemptionDetails);
        return;
      }



    }

    if (this.BillId > 0 && this.originalMode == 2 && this.EmployeeTaxExemptionId > 0) {
      console.log('originalMode :::', 2);

      let UpdatedTaxExemptionDetails = [];
      // remove that item from declaration mode
      let existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.Id == this.EmployeeTaxExemptionId && a.FinancialYearId == this.selectedFinYear && a.IsProposed == true);
      console.log('ORG 2 EXISTS', existingParentTaxObject);

      if (!existingParentTaxObject) {
        existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.Id == this.EmployeeTaxExemptionId && a.FinancialYearId == this.selectedFinYear && a.IsProposed == false);
        console.log('ORG 2 EXISTS 2', existingParentTaxObject);

      }

      if (existingParentTaxObject) {
        let existingChildTaxObject = existingParentTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);
        let index = existingParentTaxObject.LstEmployeeExemptionBillDetails.indexOf(existingChildTaxObject);
        if (index > -1) {
          existingParentTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
        }
        let totalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
          if (element.ApprovalStatus == 1)
            totalAmount = Number(totalAmount) + Number(element.BillAmount);
        });
        let ApprovedtotalAmount = 0;
        existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {

          if (element.ApprovalStatus == 1) {
            ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);

          }
        });
        existingParentTaxObject.ApprovedAmount = ApprovedtotalAmount;

        existingParentTaxObject.Amount = totalAmount;
        existingParentTaxObject.Modetype = UIMode.Edit;
        UpdatedTaxExemptionDetails.push(existingParentTaxObject);


        let existingParentProofTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.FinancialYearId == this.selectedFinYear && a.IsProposed == false && a.ProductId == this.activeTabName);

        console.log('ggg', existingParentProofTaxObject);

        if (existingParentProofTaxObject) {

          let childBills = existingParentProofTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);
          if (childBills) {
            let index = existingParentProofTaxObject.LstEmployeeExemptionBillDetails.indexOf(childBills);
            if (index > -1) {
              existingParentProofTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
            }
          }


          var billObj = new EmployeeExemptionBillDetails();
          billObj.Id = billRequest.Id;
          billObj.Modetype = UIMode.Edit;
          billObj.EmployeeId = this.EmployeeId;
          billObj.FinancialYearId = billRequest.FinancialYearId;
          billObj.ProductId = billRequest.ProductId;
          billObj.BillAmount = billRequest.BillAmount;
          billObj.BillNumber = billRequest.BillNumber;
          billObj.BillDate = moment(this.BillDate).format('YYYY-MM-DD') as any; billRequest.BillDate;
          billObj.BillId = billRequest.BillId;
          billObj.FileName = billRequest.FileName;
          billObj.Remarks = billRequest.Remarks;
          billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
          billObj.IsProposed = billObj.BillId > 0 ? false : true;
          billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
          billObj.ApprovalStatus = 1;
          billObj.EmployeeTaxExemptionId = existingParentProofTaxObject.Id;
          billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');
          billObj.LstTravellerDetails = billRequest.LstTravellerDetails;

          existingParentProofTaxObject.LstEmployeeExemptionBillDetails.push(billObj);

          let totalAmount = 0;
          existingParentProofTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              totalAmount = Number(totalAmount) + Number(element.BillAmount);
          });
          existingParentProofTaxObject.Amount = totalAmount;
          existingParentProofTaxObject.Modetype = UIMode.Edit;
          existingParentProofTaxObject.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(existingParentProofTaxObject, existingParentProofTaxObject.Amount, existingParentProofTaxObject.InputsRemarks, existingParentProofTaxObject.ApprovedAmount, existingParentProofTaxObject.ApproverRemarks, 'TAX');
          UpdatedTaxExemptionDetails.push(existingParentProofTaxObject);

        } else {
          var billObj = new EmployeeExemptionBillDetails();
          billObj.Id = billRequest.Id;
          billObj.Modetype = UIMode.Edit;
          billObj.EmployeeId = this.EmployeeId;
          billObj.FinancialYearId = billRequest.FinancialYearId;
          billObj.ProductId = billRequest.ProductId;
          billObj.BillAmount = billRequest.BillAmount;
          billObj.BillNumber = billRequest.BillNumber;
          billObj.BillDate = billRequest.BillDate;
          billObj.BillId = billRequest.BillId;
          billObj.FileName = billRequest.FileName;
          billObj.Remarks = billRequest.Remarks;
          billObj.ApprovedAmount = billObj.BillId > 0 ? billRequest.ApprovedAmount : 0;// billRequest.ApprovedAmount;
          billObj.IsProposed = billObj.BillId > 0 ? false : true;
          billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;
          billObj.ApprovalStatus = 1;
          billObj.EmployeeTaxExemptionId = 0;
          billObj.LstInvestmentLogHistory = billRequest.LstInvestmentLogHistory;// this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, 'BILL');
          billObj.LstTravellerDetails = billRequest.LstTravellerDetails;
          var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
          empTaxExceptionObj.Id = 0;
          empTaxExceptionObj.Modetype = UIMode.Edit;
          empTaxExceptionObj.EmployeeId = this.EmployeeId;
          empTaxExceptionObj.FinancialYearId = this.selectedFinYear;
          empTaxExceptionObj.Status = 1;
          empTaxExceptionObj.ApprovedAmount = billRequest.BillId > 0 ? billRequest.ApprovedAmount : 0;
          empTaxExceptionObj.ProductId = this.activeTabName;
          empTaxExceptionObj.Amount = billRequest.BillAmount;
          empTaxExceptionObj.DocumentId = 0;
          empTaxExceptionObj.IsProposed = billRequest.BillId > 0 ? false : true;
          empTaxExceptionObj.LstEmployeeExemptionBillDetails = [];
          empTaxExceptionObj.LstEmployeeExemptionBillDetails.push(billObj);
          empTaxExceptionObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empTaxExceptionObj, empTaxExceptionObj.Amount, "", empTaxExceptionObj.ApprovedAmount, "", 'TAX');

          UpdatedTaxExemptionDetails.push(empTaxExceptionObj);
        }

        this.UpsertEmployeeInvestmentDetails(UpdatedTaxExemptionDetails);
        return;
      }

    }


    this.employeeService.insertEmployeeExemptionBillDetails(billRequest).subscribe((result) => {
      let apiR: apiResult = result;
      console.log('Individual Insert ::: ', apiR);
      if (apiR.Status) {
        this.IsApiTriggered = true;
        this.doEditOrDeleteBillEntries('Edit', billRequest, billRequest.EmployeeTaxExemptionId);
      }
    });
  }

  doEditOrDeleteBillEntries(cardActivity, billRequest, EmployeeTaxExemptionId) {
    console.log(cardActivity);
    console.log(billRequest);
    console.log(EmployeeTaxExemptionId);

    try {
      this.isrendering_spinner = true;

      if (EmployeeTaxExemptionId > 0) {
        let UpdatedTaxExemptionDetails = [];
        let existingParentTaxObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(a => a.Id == EmployeeTaxExemptionId && a.FinancialYearId == this.selectedFinYear);
        console.log('existingParentTaxObject', existingParentTaxObject);

        if (existingParentTaxObject) {

          let existingChildTaxObject = existingParentTaxObject.LstEmployeeExemptionBillDetails.find(a => a.Id == billRequest.Id);

          if (existingChildTaxObject)
            existingChildTaxObject.BillAmount = billRequest.BillAmount;
          existingChildTaxObject.BillNumber = billRequest.BillNumber;
          existingChildTaxObject.BillDate = billRequest.BillDate;
          existingChildTaxObject.BillId = billRequest.BillId;
          existingChildTaxObject.ApprovedAmount = billRequest.BillId > 0 ? billRequest.ApprovedAmount : 0
          existingChildTaxObject.FileName = billRequest.FileName;
          existingChildTaxObject.Remarks = billRequest.Remarks;
          existingChildTaxObject.Modetype = UIMode.Edit;
          existingChildTaxObject.ApprovalStatus = cardActivity == 'Delete' ? 0 : 1;
          existingChildTaxObject.Status = billRequest.Status;
          existingChildTaxObject.EmployeeTaxExemptionId = cardActivity == 'Delete' ? 0 : EmployeeTaxExemptionId;

          if (cardActivity == 'Delete') {
            let index = existingParentTaxObject.LstEmployeeExemptionBillDetails.indexOf(existingChildTaxObject);
            if (index > -1) {
              existingParentTaxObject.LstEmployeeExemptionBillDetails.splice(index, 1);
            }
          }


          let totalAmount = 0;
          existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              totalAmount = Number(totalAmount) + Number(element.BillAmount);
          });

          let ApprovedtotalAmount = 0;
          existingParentTaxObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);
          });

          existingParentTaxObject.ApprovedAmount = ApprovedtotalAmount;
          existingParentTaxObject.Amount = totalAmount;
          existingParentTaxObject.Modetype = UIMode.Edit;
          existingParentTaxObject.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(existingParentTaxObject, existingParentTaxObject.Amount, "", existingParentTaxObject.ApprovedAmount, "", 'TAX');

          UpdatedTaxExemptionDetails.push(existingParentTaxObject);
          // console.log('existingParentTaxObject',existingParentTaxObject);
          // console.log('UpdatedTaxExemptionDetails',UpdatedTaxExemptionDetails);
          // this.loadingScreenService.stopLoading();
          // return;
          this.employeeModel.oldobj = Object.assign({}, this.employeedetails);
          this.employeeModel.newobj = this.employeedetails;
          this.employeeModel.newobj.Modetype = UIMode.Edit;
          this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = UpdatedTaxExemptionDetails;
          console.log("Reupdate Employee Details :: ", this.employeeModel)

          var Employee_request_param = JSON.stringify(this.employeeModel);
          if (this.employeedetails.Id > 0) {
            this.employeeService.UpsertEmployeeInvestmentDetails(Employee_request_param).subscribe((data: any) => {
              console.log('REUPDATED RESULT  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', data);
              this.IsApiTriggered = true;
              if (data.Status) {
                this.loadingScreenService.stopLoading();

              }
              else {
                this.alertService.showWarning(data.Message);
                this.loadingScreenService.stopLoading();
                this.isrendering_spinner = false;
              }

            },
              (err) => {
                this.isrendering_spinner = false;
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(`Something is wrong!  ${err}`);
                console.log("Something is wrong! : ", err);
              });
          }
        } else {
          this.GetEmployeeExemptionBillDetails();
          this.clear();
        }
      }

      this.GetEmployeeExemptionBillDetails();
      this.isrendering_spinner = false;
      this.BillNumber = null;
      this.BillAmount = null;
      this.BillApprovedAmount = null;
      this.BillDate = null;
      this.BillRemarks = null;
      this.Id = null;
      this.BillId = 0;
      this.IsProposed = this.currentTaxMode == 1 ? true : false;
      this.FileName = null;
      this.EmployeeTaxExemptionId = 0;

    } catch (error) {
      this.isrendering_spinner = false;
    }

    // if (this.LstExmptionBillDetails.length > 0) {
    //   let isExistsBills = this.LstExmptionBillDetails.find(x => x.Id == this.Id);
    //   if (isExistsBills) {
    //     let index = this.LstExmptionBillDetails.indexOf(isExistsBills);
    //     if (index > -1) {
    //       this.LstExmptionBillDetails.splice(index, 1);
    //     }
    //   }
    // }
    // this.LstExmptionBillDetails = this.LstExmptionBillDetails.concat(apiR.Result);




  }


  selectAllClaimRequest(event: any) {
    this.LstSelectedBillitems = [];
    this.LstExmptionBillDetails.forEach(e => {
      if (this.activeTabName == e.ProductId) {
        event.target.checked == true ? e.isSelected = true : e.isSelected = false;
      }
    });
    if (event.target.checked) {
      this.LstExmptionBillDetails.forEach(e => {
        if (e.Status == 0 && e.EmployeeTaxExemptionId == 0 && this.activeTabName == e.ProductId) {
          this.LstSelectedBillitems.push(e);
        }
      })
    } else {
      this.LstSelectedBillitems = [];
    }
  }

  selectBillEntries(obj, isSelectd, event) {

    let updateItem = this.LstExmptionBillDetails.find(i => i.Id == obj.Id);
    let index = this.LstSelectedBillitems.indexOf(updateItem);

    if (index > -1) {
      this.LstSelectedBillitems.splice(index, 1);
    }
    else {
      if (obj.Status == 0 && obj.EmployeeTaxExemptionId == 0 && obj.ProductId == this.activeTabName) {
        this.LstSelectedBillitems.push(obj);
      }
    }

    if (this.LstExmptionBillDetails.length === this.LstSelectedBillitems.length) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }

  }


  async sendForApproval() {

    console.log('sss', this.LstSelectedBillitems)
    this.IsOpenBillsCard = false;
    // return;
    try {

      if (this.LstSelectedBillitems.length == 0) {
        this.alertService.showWarning("There are no saved bills or an empty entry in your bucket.");
        return;
      }

      const proofsCount = this.LstSelectedBillitems.filter(a => a.IsProposed).length;
      const declarationCount = this.LstSelectedBillitems.filter(a => !a.IsProposed).length;

      if (proofsCount >= 1 && declarationCount >= 1) {
        this.alertService.showWarning("Please select either the proof bills or the declaration bills before submitting");
        return;
      }

      await this.alertService.confirmSwal("Confirmation", "Are you sure you want to submit?", "Yes, Confirm").then(result => {

        this.loadingScreenService.startLoading();
        var billDetList = [];
        let totalAmount = 0;
        let taxExemptionParentId = 0;
        let existingObject = null;
        this.employeeModel.oldobj = Object.assign({}, this.employeedetails);
        this.employeeModel.newobj = this.employeedetails;
        var _empTaxExceptionDet = [];

        this.LstSelectedBillitems.forEach(obj => {

          var billObj = new EmployeeExemptionBillDetails();
          obj.Modetype = UIMode.Edit
          billObj.Id = obj.Id;
          billObj.Modetype = UIMode.Edit;
          billObj.EmployeeId = this.EmployeeId;
          billObj.FinancialYearId = obj.FinancialYearId;
          billObj.ProductId = obj.ProductId;
          billObj.BillAmount = obj.BillAmount;
          billObj.BillNumber = obj.BillNumber;
          billObj.BillDate = obj.BillDate;
          billObj.BillId = obj.BillId;
          billObj.FileName = obj.FileName;
          billObj.Remarks = obj.Remarks;
          billObj.ApprovedAmount = billObj.BillId > 0 ? obj.ApprovedAmount : 0;
          billObj.ApprovedBy = obj.ApprovedBy;
          billObj.ApprovedOn = obj.ApprovedOn;
          billObj.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;;
          billObj.IsProposed = billObj.BillId > 0 ? false : true;
          billObj.ApprovalStatus = 1;
          billObj.RejectedBy = obj.RejectedBy;
          billObj.RejectedOn = obj.RejectedOn;
          billObj.RejectedRemarks = obj.RejectedRemarks;
          billObj.EmployeeTaxExemptionId = 0;
          billObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(billObj, billObj.BillAmount, billObj.Remarks, billObj.ApprovedAmount, "", 'BILL');
          billObj.LstTravellerDetails = obj.LstTravellerDetails;
          billObj.EmployeeJourneyId = obj.EmployeeJourneyId;
          billDetList.push(billObj);
          totalAmount += obj.BillAmount

        });

        let IsProp: boolean = false;

        IsProp = billDetList.filter(a => a.BillId > 0).length > 0 ? false : true;

        console.log('IsProp', IsProp);

        if (this.employeedetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0) {
          if (this.employeedetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.selectedFinYear && x.ProductId == this.activeTabName && x.IsProposed == IsProp) != undefined) {
            taxExemptionParentId = this.employeedetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.selectedFinYear && x.ProductId == this.activeTabName && x.IsProposed == IsProp).Id;
            existingObject = this.employeedetails.LstEmployeeTaxExemptionDetails.find(x => x.FinancialYearId == this.selectedFinYear && x.ProductId == this.activeTabName && x.IsProposed == IsProp);
          }
        }
        let totalAmount1 = 0;
        let ApprovedtotalAmount = 0;

        console.log('existingObject', existingObject);


        if (existingObject) {

          existingObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              totalAmount1 = Number(totalAmount1) + Number(element.BillAmount);
          });

          existingObject.LstEmployeeExemptionBillDetails.forEach(element => {
            if (element.ApprovalStatus == 1)
              ApprovedtotalAmount = Number(ApprovedtotalAmount) + Number(element.ApprovedAmount);
          });
        }
        let totalInvestedAmount: number = (Number(totalAmount1) + Number(totalAmount));

        var empTaxExceptionObj = new EmployeeTaxExemptionDetails();
        empTaxExceptionObj.Id = taxExemptionParentId;
        empTaxExceptionObj.Modetype = UIMode.Edit;
        empTaxExceptionObj.EmployeeId = this.EmployeeId;
        empTaxExceptionObj.FinancialYearId = this.selectedFinYear;
        empTaxExceptionObj.Status = 1;
        empTaxExceptionObj.ApprovedAmount = existingObject == null ? ApprovedtotalAmount : ApprovedtotalAmount; // existingObject.ApprovedAmount;
        empTaxExceptionObj.ProductId = this.activeTabName;
        empTaxExceptionObj.Amount = totalInvestedAmount;
        empTaxExceptionObj.DocumentId = 0;
        empTaxExceptionObj.IsProposed = billDetList.filter(a => a.BillId > 0).length > 0 ? false : true;
        empTaxExceptionObj.LstEmployeeExemptionBillDetails = billDetList;
        empTaxExceptionObj.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empTaxExceptionObj, empTaxExceptionObj.Amount, "", empTaxExceptionObj.ApprovedAmount, "", 'TAX');

        _empTaxExceptionDet.push(empTaxExceptionObj);

        this.employeeModel.newobj.Modetype = UIMode.Edit;
        this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = _empTaxExceptionDet;
        console.log("SEND FOR APPROVAL :: ", this.employeeModel)
        this.IsApiTriggered = true;

        var Employee_request_param = JSON.stringify(this.employeeModel);
        if (this.employeedetails.Id > 0) {
          this.employeeService.UpsertEmployeeInvestmentDetails(Employee_request_param).subscribe((data: any) => {
            console.log('RESULT SEND FOR APPROVAL >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', data);
            this.IsApiTriggered = true;
            this.LstSelectedBillitems = [];
            this.selectAll = false;
            this.incurredExpense = false;
            this.incurredBillDeclaration = false;
            this.EmployeeJourneyId = 0;
            if (data.Status) {
              this.loadingScreenService.stopLoading();
              this.close_slider_exemptions();
              // this.GetEmployeeRequiredDetailsById(this.selectedFinYear).then((result) => {
              //   this.onRefresh();
              // })
            }
            else {
              this.alertService.showWarning(data.Message);
              this.loadingScreenService.stopLoading();
            }

          },
            (err) => {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(`Something is wrong!  ${err}`);
              console.log("Something is wrong! : ", err);
            });
        }

      }).catch(error => {

      });
    }
    catch (error) {
      this.alertService.showWarning("An error occurred while trying to submit!" + error);
    }

  }

  UpsertEmployeeInvestmentDetails(UpdatedTaxExemptionDetails) {

    this.isrendering_spinner = true;
    this.loadingScreenService.startLoading();
    this.employeeModel.oldobj = Object.assign({}, this.employeedetails);
    this.employeeModel.newobj = this.employeedetails;
    this.employeeModel.newobj.Modetype = UIMode.Edit;
    this.employeeModel.newobj.LstEmployeeTaxExemptionDetails = UpdatedTaxExemptionDetails;
    console.log("Reupdate Employee Details 5 :: ", this.employeeModel)

    var Employee_request_param = JSON.stringify(this.employeeModel);
    if (this.employeedetails.Id > 0) {
      this.employeeService.UpsertEmployeeInvestmentDetails(Employee_request_param).subscribe((data: any) => {
        console.log('REUPDATED RESULT  >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', data);
        this.isrendering_spinner = false;
        this.loadingScreenService.stopLoading();
        this.IsApiTriggered = true;
        if (data.Status) {
          this.alertService.showSuccess(data.Message);
          this.GetEmployeeRequiredDetailsById(this.selectedFinYear).then((result) => {
            this.onRefresh();
          })
        }
        else {
          this.alertService.showWarning(data.Message);
        }
      },
        (err) => {
          this.isrendering_spinner = false;
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
          console.log("Something is wrong! : ", err);
        });
    }
  }


  close_slider_exemptions() {
    if (this.IsApiTriggered) {
      this.activeModal.close('Done');
    } else {
      this.activeModal.close('Modal Closed');

    }
  }


  onFileUpload(e) {
    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
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
        let FileUrl = (reader.result as string).split(",")[1];
        // this.doAsyncUpload(FileUrl, file.name, item);
        this.investmentService.doAsyncUpload(FileUrl, file.name, '', this.employeedetails.Id).then((s3DocumentId) => {
          if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
            this.BillId = s3DocumentId;
            this.FileName = file.name;
            this.IsProposed = false;

            this.unsavedDocumentLst.push({
              Id: s3DocumentId
            })

            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file!")

          }
          else {
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to delete! ");

          }
        });


      };
    }
  }




  doDeleteFile(item, photo, layout) {

    console.log('this.selectedBillObject', this.selectedBillObject);

    if (this.selectedBillObject != undefined && this.selectedBillObject.Status == 1) {
      this.alertService.showWarning("Attention : This action was blocked. One or more attachement cannot be deleted because the status is in an invalid state.");
      return;
    }

    this.alertService.confirmSwal("Are you sure you want to delete?", "This item will be deleted immediately. You can't undo this file.", "Yes, Delete").then(result => {
      this.isLoading = false;
      this.docSpinnerText = "Deleting";

      if (!this.essService.isGuid(this.Id)) {
        // var index = this.unsavedDocumentLst.map(function (el) {
        //   return el.Id
        // }).indexOf(photo.DocumentId)
        // this.unsavedDocumentLst.splice(index, 1);

        this.BillId = 0;
        this.FileName = null;
        this.IsProposed = this.currentTaxMode == 1 ? true : false;


        this.isLoading = true;
        this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
      }

      else {
        this.isLoading = false;
        this.docSpinnerText = "Deleting";
        this.investmentService.deleteAsync(this.selectedBillObject == undefined ? this.BillId : this.selectedBillObject.BillId).then((s3DeleteObjectResult) => {

          if (s3DeleteObjectResult == true) {
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            // var index = this.unsavedDocumentLst.map(function (el) {
            //   return el.Id
            // }).indexOf(photo.DocumentId)
            // this.unsavedDocumentLst.splice(index, 1);

            this.BillId = 0;
            this.FileName = null;
            this.IsProposed = this.currentTaxMode == 1 ? true : false;

            this.isLoading = true;
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            this.myInputVariable.nativeElement.value = "";

          } else {
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to delete! ")

          }
        });
      }


    })
      .catch(error => { });

  }

  doViewFile(_billId) {
    let object = { DocumentId: _billId, FileName: this.FileName };
    var fileNameSplitsArray = object.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      let item = { BillId: _billId, FileName: this.FileName };
      // this.getFileList('Approval Details', item, '');
      this.downloadBillDocument(item);

      return;
    } else {
      const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
      modalRef.componentInstance.docsObject = object;
      modalRef.componentInstance.employeedetails = this.employeedetails;
      modalRef.result.then((result) => {
        if (result != "Model Closed") {

        }
      }).catch((error) => {
        console.log(error);
      });
    }


    // return;
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

  onChangeApprovedAmount(item) {
    item.Modetype = UIMode.Edit;
    item.Status = 1;

  }
  PermissibleRoles() {
    return this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;
  }

  getRequired(controlName) {

    if (this.currentTaxMode == 1 && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
      var columnName = this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.find(function (a) {
        return a == controlName;
      });
      if (columnName != undefined) {
        return "";
      } else {
        return "*";
      }
    }
    else {
      if (this.Id > 0 && this.IsProposed && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
        var columnName = this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.find(function (a) {
          return a == controlName;
        });
        if (columnName != undefined) {
          return "";
        } else {
          return "*";
        }
      }
      return "*";
    }

  }


  openModal(content, whichaction) {

    if (this.TravelStartDate == null || this.TravelStartDate == '' || this.TravelEndDate == null || this.TravelEndDate == '') {
      this.alertService.showWarning("Travel Start and End date is Required. Please fill out and try to add family/travellers details");
      return;
    }

    if (whichaction == 'New') {
      this.RelationshipType = null;
      this.TravellerName = null;
      this.DateOfBirth = null;
    }

    $('#dependentDetailsModal').modal('show');
    // this.modalRef = this.modalService.open(content, { size: 'lg' });
  }

  getRelationShipName(RId) {
    return this.relationship.find(a => a.id == RId).name;
  }
  getRelationShipName1(RId) {
    return this.relationshipDependent.find(a => a.id == RId).name;
  }


  getDateOfBirthFormat(DateOfBirth) {
    return moment(new Date(DateOfBirth)).format('DD-MM-YYYY');
  }

  closeModal() {
    $('#dependentDetailsModal').modal('hide');
    // this.modalRef.close();
  }

  PushDependent() {
    this.IsDependentAdded = true;
    this.LstDependent == null ? this.LstDependent = [] : true;
    if (!this.utilityService.isNullOrUndefined(this.TravellerName) && !this.utilityService.isNullOrUndefined(this.RelationshipType) && !this.utilityService.isNullOrUndefined(this.DateOfBirth)) {
      if (this.RelationshipType != '9' && this.RelationshipType != '10' && this.RelationshipType != '5' && this.RelationshipType != '4' && this.LstDependent.length > 0 && _.find(this.LstDependent, (a) => a.Id != this.TravelID && a.RelationshipType == this.RelationshipType) != null


      ) {
        this.IsDependentAdded = false;
        this.alertService.showWarning("The specified dependent relationship detail already exists");
        return;
      }


      if (this.LstDependent.length > 0) {
        const indexToUpdate = this.LstDependent.findIndex(dependent => dependent.Id == this.TravelID);

        if (indexToUpdate !== -1) {
          this.LstDependent[indexToUpdate] = {
            Id: this.LstDependent[indexToUpdate].Id,
            TravellerName: this.TravellerName,
            RelationshipType: this.RelationshipType,
            DateOfBirth: new Date(this.DateOfBirth),
            TravelType: this.TravelType,
            TravelDateFrom: new Date(this.TravelDateFrom),
            TravelDateTo: new Date(this.TravelDateTo),
            Expense: this.Expense,
            OtherDetails: this.OtherDetails

          };
        } else {
          this.LstDependent.push({
            Id: UUID.UUID(),
            TravellerName: this.TravellerName,
            RelationshipType: this.RelationshipType,
            DateOfBirth: new Date(this.DateOfBirth),
            TravelType: this.TravelType,
            TravelDateFrom: new Date(this.TravelDateFrom),
            TravelDateTo: new Date(this.TravelDateTo),
            Expense: this.Expense,
            OtherDetails: this.OtherDetails,
            TravelReceiptDocumentId: 0,
            TravelReceiptFileName: ""
          });
        }
      } else {

        this.LstDependent.push({
          Id: UUID.UUID(),
          TravellerName: this.TravellerName,
          RelationshipType: this.RelationshipType,
          DateOfBirth: new Date(this.DateOfBirth),
          TravelType: this.TravelType,
          TravelDateFrom: new Date(this.TravelDateFrom),
          TravelDateTo: new Date(this.TravelDateTo),
          Expense: this.Expense,
          OtherDetails: this.OtherDetails,
          TravelReceiptDocumentId: 0,
          TravelReceiptFileName: ""
        });
      }




      // this.LstMedicalDependent.length > 0 && this.LstMedicalDependent.find(x => this.Relationship != '5' && this.Relationship != '4' && x.Relationship == this.Relationship) ? this.LstMedicalDependent.find(x => this.Relationship != '5' && this.Relationship != '4' && x.Relationship == this.Relationship).DependentName = this.DependentName : true;

      this.IsDependentAdded = false;
      this.TravellerName = null;
      this.RelationshipType = null;
      this.DateOfBirth = null;
      this.TravelType = null,
        this.TravelDateFrom = null,
        this.TravelDateTo = null,
        this.Expense = null,
        this.OtherDetails = null,
        this.TravelID = null;
      console.log(' this.LstDependent', this.LstDependent);

      this.closeModal();
    }


  }


  editDependent(item, indx, content) {
    this.TravelID = item.Id;
    this.TravellerName = item.TravellerName;
    this.RelationshipType = item.RelationshipType;
    this.DateOfBirth = new Date(item.DateOfBirth) as any;
    this.TravelType = item.TravelType,
      this.TravelDateFrom = new Date(item.TravelDateFrom) as any,
      this.TravelDateTo = new Date(item.TravelDateTo) as any,
      this.Expense = item.Expense,
      this.OtherDetails = item.OtherDetails,
      this.TravelReceiptDocumentId = item.TravelReceiptDocumentId,
      this.TravelReceiptFileName = item.TravelReceiptFileName,
      // this.LstDependent.splice(indx, 1);
      this.openModal(content, 'Edit');
  }

  deleteDependent(item, indx) {
    this.LstDependent.splice(indx, 1);
  }


  onClickIncurredExpenseLTA(event) {
    console.log('event', event)
    console.log('event', event.target.checked)

    this.selectAllClaimRequest(event);

  }


  doDeleteJourneyBills(item, index) {

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


        if (this.essService.isGuid(item.Id) || item.Id == 0) {
          this.JourneyBills.splice(index, 1);
        } else {
          item.ApprovalStatus = 0;
          item.Modetype = UIMode.Delete;
          item.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(item, item.BillAmount, item.Remarks, item.ApprovedAmount, "", 'BILL');
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    })
  }

  doEditJourneyBills(item) {


    this.selectedBillObject = item;
    this.originalMode = item.BillId > 0 ? 2 : 1;
    this.BillAmount = item.BillAmount;
    this.BillApprovedAmount = item.ApprovedAmount;
    this.BillDate = item.BillDate == null ? null : new Date(item.BillDate);
    this.BillNumber = item.BillNumber;
    this.Id = item.Id;
    this.BillId = item.BillId;
    this.IsProposed = item.IsProposed;
    this.FileName = item.FileName;
    this.EmployeeTaxExemptionId = item.EmployeeTaxExemptionId;
    this.BillRemarks = item.Remarks;
    this.TravelFromCity = item.LstTravellerDetails[0].TravelFromCity;
    this.TravelToCity = item.LstTravellerDetails[0].TravelToCity;
    this.TravelType = item.LstTravellerDetails[0].TravelType;
  }

  AddNewLTABills() {
    this.Id == null ? this.Id = UUID.UUID() : true;

    if (this.BillAmount == 0) {
      this.alertService.showWarning("The Expense amount should be greater than 0");
      return;
    }
    let RequiredFields = ["TravelFromCity", "TravelToCity", "TravelTypes", "BillAmount", "BillNumber", "BillDate", "BillId"];

    let InvalidFields = [];

    if (this.currentTaxMode == 2 && this.BillId == 0) {
      this.BillId = null;
    }

    if (this.currentTaxMode == 1) {
      RequiredFields = RequiredFields.filter(e => e !== "BillId");
    }

    if (this.Id > 0 && this.IsProposed) {
      RequiredFields = RequiredFields.filter(e => e !== "BillId");
    }

    if (this.Id > 0 && this.IsProposed && this.BillId == null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
      RequiredFields = RequiredFields.filter(item => !this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(item));
    }

    RequiredFields.forEach(reqItems => {
      if ((this[reqItems] === undefined || this[reqItems] === null || this[reqItems] === "")) {
        reqItems = reqItems == "TravelTypes" ? "TransportMode" :
          reqItems == "BillAmount" ? "Ticket/ExpenseAmount" :
            reqItems == "BillNumber" ? "Invoice/Ticket/BoardingPassNumber" :
              reqItems == "BillDate" ? "Invoice/Ticket/BoardingPassDate" :
                reqItems == "BillId" ? "Attachments" : reqItems;
        InvalidFields.push(reqItems.replace(/[A-Z]/g, ' $&').trim());
      }
    });

    if (InvalidFields.length > 0) {
      this.alertService.showWarning("Please complete all required fields : " + InvalidFields.join(', '));
      return;
    }
    // this.IsOpenBillsCard = false;
    this.selectedBillObject = null;
    console.log('billid ::', this.BillId);;

    if (this.BillId == undefined || this.BillId == null || this.BillId == '') {
      this.BillId = 0;
    }

    const isInRange = moment(moment(this.BillDate).format('YYYY-MM-DD')).isBetween(moment(this.TravelStartDate).format('YYYY-MM-DD'), moment(this.TravelEndDate).format('YYYY-MM-DD'), null, '[]');
    const isSameAsStartDate = moment(moment(this.BillDate).format('YYYY-MM-DD')).isSame(moment(this.TravelStartDate).format('YYYY-MM-DD'));
    const isSameAsEndDate = moment(moment(this.BillDate).format('YYYY-MM-DD')).isSame(moment(this.TravelEndDate).format('YYYY-MM-DD'));
    if (isInRange || isSameAsStartDate || isSameAsEndDate) {

    } else {
      this.alertService.showWarning("Invoice/Ticket/Boarding Pass date should fall between the travel start and end dates.");
      return;
    }

    var TravelDetails = [{
      TravelFromCity: this.TravelFromCity,
      TravelToCity: this.TravelToCity,
      TravelType: this.TravelType
    }]

    // if (this.JourneyBills.length == 0) {
    var employeeExemptionBillDetails = new EmployeeExemptionBillDetails();
    employeeExemptionBillDetails.Id = this.essService.isGuid(this.Id) ? 0 : this.Id;
    employeeExemptionBillDetails.EmployeeId = this.EmployeeId;
    employeeExemptionBillDetails.FinancialYearId = this.selectedFinYear;

    employeeExemptionBillDetails.ProductId = this.activeTabName;

    employeeExemptionBillDetails.BillAmount = this.BillAmount;

    employeeExemptionBillDetails.BillNumber = this.BillNumber;
    employeeExemptionBillDetails.BillDate = this.BillDate == null ? null : moment(this.BillDate).format('YYYY-MM-DD') as any;
    employeeExemptionBillDetails.BillId = this.BillId;
    employeeExemptionBillDetails.FileName = this.FileName;
    employeeExemptionBillDetails.Remarks = this.BillRemarks;
    // employeeExemptionBillDetails.ApprovedAmount = 0;
    employeeExemptionBillDetails.IsProposed = this.BillId > 0 ? false : true;
    employeeExemptionBillDetails.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? ApprovalStatus.Approved : ApprovalStatus.Pending;

    employeeExemptionBillDetails.Modetype = UIMode.Edit;
    employeeExemptionBillDetails.ApprovalStatus = 1;
    employeeExemptionBillDetails.EmployeeTaxExemptionId = this.EmployeeTaxExemptionId;
    employeeExemptionBillDetails.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(employeeExemptionBillDetails, employeeExemptionBillDetails.BillAmount, employeeExemptionBillDetails.Remarks, employeeExemptionBillDetails.ApprovedAmount, "", 'BILL');
    employeeExemptionBillDetails.LstTravellerDetails = TravelDetails;
    employeeExemptionBillDetails.ApprovedAmount = this.BillApprovedAmount != null ? this.BillApprovedAmount : 0;

    if (this.JourneyBills.length > 0) {
      const indexToUpdate = this.JourneyBills.findIndex(dependent => dependent.Id == this.Id);

      if (indexToUpdate !== -1) {

        this.JourneyBills[indexToUpdate].BillAmount = employeeExemptionBillDetails.BillAmount;
        this.JourneyBills[indexToUpdate].BillNumber = employeeExemptionBillDetails.BillNumber;
        this.JourneyBills[indexToUpdate].BillDate = moment(employeeExemptionBillDetails.BillDate).format('YYYY-MM-DD');
        this.JourneyBills[indexToUpdate].BillId = employeeExemptionBillDetails.BillId;
        this.JourneyBills[indexToUpdate].FileName = employeeExemptionBillDetails.FileName;
        this.JourneyBills[indexToUpdate].Remarks = employeeExemptionBillDetails.Remarks;
        this.JourneyBills[indexToUpdate].IsProposed = employeeExemptionBillDetails.IsProposed;
        this.JourneyBills[indexToUpdate].Status = employeeExemptionBillDetails.Status;
        this.JourneyBills[indexToUpdate].ApprovedAmount =  employeeExemptionBillDetails.ApprovedAmount ?  employeeExemptionBillDetails.ApprovedAmount : 0;

      } else {
        this.JourneyBills.push(employeeExemptionBillDetails);
      }
    } else {

      this.JourneyBills.push(employeeExemptionBillDetails);
    }


    console.log('this.JourneyBills', this.JourneyBills);
    this.isTravelBillAdded = true;

    this.TravelFromCity = null;
    this.TravelToCity = null;
    this.TravelType = null;
    this.BillAmount = null;
    this.BillNumber = null;
    this.BillDate = null;
    this.BillRemarks = null;
    this.BillId = 0;
    this.FileName = null;
    this.Id = null;
    this.selectedBillObject = null;
    this.BillApprovedAmount = null;


  }


  PushBillsForLTA() {

    if (this.JourneyBills.length == 0) {
      this.alertService.showWarning('There are no billing entries. If you already filled out anything into the travel details, please click the add bill option to save the bills.');
      return;
    }

    if (this.LstDependent.length == 0) {
      this.alertService.showWarning('There are no family/travellers details . Please add it and try again.');
      return;
    }

    if (this.selectedLTADeclarationOption == null || this.selectedLTADeclarationOption == '') {
      this.alertService.showWarning("Please select whether you have availed LTA benefit in the current LTA block year or in an earlier year.");
      return;
    }
    // this.LstSelectedBillitems = [];
    // this.incurredExpense = false;
    // this.LstExmptionBillDetails.length > 0 && this.LstExmptionBillDetails.forEach(e => {
    //   if (this.activeTabName == e.ProductId) {
    //     e.isSelected = false;
    //   }
    // });

    // this.IsBillsAdded = true;
    // let RequiredFields = ["BillAmount", "BillNumber", "BillDate", "BillId"];

    // if (this.currentTaxMode == 1 && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
    //   RequiredFields = RequiredFields.filter(item => !this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(item));
    // }

    // console.log('this.BillDate', this.BillDate);
    // console.log('this.BillDate', this.BillNumber);
    // let InvalidFields = [];

    // if (this.currentTaxMode == 2 && this.BillId == 0) {
    //   this.BillId = null;
    // }

    // if (this.currentTaxMode == 1) {
    //   RequiredFields = RequiredFields.filter(e => e !== "BillId");
    // }

    // if (this.Id > 0 && this.IsProposed) {
    //   RequiredFields = RequiredFields.filter(e => e !== "BillId");
    // }

    // if (this.Id > 0 && this.IsProposed && this.BillId == null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns != null && this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.length > 0) {
    //   RequiredFields = RequiredFields.filter(item => !this.LstEmployeeInvestmentLookup.NonMandatoryExemptionColumns.includes(item));
    // }

    // RequiredFields.forEach(reqItems => {
    //   if ((this[reqItems] === undefined || this[reqItems] === null || this[reqItems] === "")) {
    //     InvalidFields.push(reqItems.replace(/[A-Z]/g, ' $&').trim());
    //   }
    // });

    // if (InvalidFields.length > 0) {
    //   this.alertService.showWarning("Please complete all required fields : " + InvalidFields.join(', '));
    //   return;
    // }
    // this.IsOpenBillsCard = false;
    // this.selectedBillObject = null;
    // console.log('billid ::', this.BillId);;

    // if (this.BillId == undefined || this.BillId == null || this.BillId == '') {
    //   this.BillId = 0;
    // }

    this.loadingScreenService.startLoading();
    var employeejourneyDetails = new EmployeeJourneyDetails();
    employeejourneyDetails.Id = this.EmployeeJourneyId;
    employeejourneyDetails.Amount = 0;
    employeejourneyDetails.EmployeeId = this.EmployeeId;
    employeejourneyDetails.FinancialYearId = this.selectedFinYear;
    employeejourneyDetails.ProductId = this.activeTabName;
    employeejourneyDetails.TravelStartDate = moment(this.TravelStartDate).format('YYYY-MM-DD');
    employeejourneyDetails.TravelEndDate = moment(this.TravelEndDate).format('YYYY-MM-DD');
    employeejourneyDetails.DeclarationAcceptanceForLTABlockYear = Number(this.selectedLTADeclarationOption);
    employeejourneyDetails.IsAcceptanceAcknowledged = this.incurredBillDeclaration;
    employeejourneyDetails.Status = 1;
    employeejourneyDetails.Modetype = 1;
    employeejourneyDetails.LstEmployeeExemptionBillDetails = this.JourneyBills;
    employeejourneyDetails.LstTravellerDetails = this.LstDependent;

    console.log('employeejourneyDetails', employeejourneyDetails);

    this.employeeService.UpsertEmployeeJourneyDetails((employeejourneyDetails)).subscribe((result) => {
      let apiR: apiResult = result;
      console.log('EMPLOYEE JOURNEY DETAILS ::: ', apiR);
      this.loadingScreenService.stopLoading();
      if (apiR.Status) {
        this.IsApiTriggered = true;
        this.TravelFromCity = null;
        this.TravelToCity = null;
        this.TravelType = null;
        // this.GetEmployeeExemptionBillDetails();
        this.clear();
        this.GetEmployeeRequiredDetailsById(this.selectedFinYear).then((result) => {
          this.onRefresh();
        })
      } else {
        this.alertService.showWarning(apiR.Message);
        return;
      }
    });

  }


  download_FAQ() {
    const fileUrl = 'assets/file/LTA_Rules_and_FAQs.pdf';
    this.fileuploadService.downloadFAQFile(fileUrl);
    return;
  }


  getFileList(type: string, item: any, format: string) {


    this.loadingScreenService.startLoading();
    console.log('item', item);
    // this.currentModalDetailsFormat = '';
    // this.currentModalHeading = '';
    // this.contentmodalurl = null;

    // this.currentModalItem = item;
    // this.currentModalHeading = type;
    // this.currentModalDetailsFormat = format;

    let DocId = item.ObjectStorageId;
    this.docList = [];
    try {


      this.fileuploadService.getObjectById(DocId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.loadingScreenService.stopLoading();
            const Message = dataRes.Message ? dataRes.Message : 'Couldn\'t fetch data !'
            return this.alertService.showWarning(Message);
          }
          this.docList = [];
          var objDtls = dataRes.Result;
          console.log(objDtls);
          var zip = new JSZip();
          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);
                  this.loadingScreenService.stopLoading();
                  var modalDiv = $('#documentviewer');
                  modalDiv.modal({ backdrop: false, show: true });


                });

              }
            });
          });


        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }

  getTargetOffSetImage(item: any) {

    const promise = new Promise((res, rej) => {
      var contentType = this.fileuploadService.getContentType(item.name);
      var blob = new Blob([item._data.compressedContent]);
      var file = new File([blob], item.name, {
        type: typeof item,
        lastModified: Date.now()
      });
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64String = (reader.result as string).split(",")[1];
        if (file !== null) {
          var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(' DOCUMENT URL :', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl })
        }
      }
    })
    return promise;
  }

  shouldShowJourneyAddButton() {
    return this.EmployeeJourneys.length == 0 ? true : (!this.IsAllowToAddMultipleJourneyCounts && this.EmployeeJourneys.length > 0) ? false : true;
  }

  onChangeTravelStartDate(event) {

    const startDateValue = this.TravelStartDate;
    if (startDateValue !== null && startDateValue !== undefined || event !== null && event !== undefined) {
      this.TravelEndDate = null;
      const startDate = new Date(event || startDateValue);
      if (!isNaN(startDate.getTime())) {
        this.EnddateminDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
      }
    }
  }

  getPendingExemptionBills() {
 
    return this.LstExmptionBillDetails.length > 0 &&
      this.LstExmptionBillDetails.filter(a => a.ProductId == this.activeTabName && a.Status == 0 &&
        a.EmployeeTaxExemptionId == 0).length > 0 ? true : false;
  }
}

