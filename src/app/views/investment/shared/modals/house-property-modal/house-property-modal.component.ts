import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { AlertService, EmployeeService, ESSService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { UIMode } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { EmployeeInvestmentDeductions, EmployeeInvestmentDocuments, InvestmentLogHistory } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { I, X } from '@angular/cdk/keycodes';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { apiResult } from 'src/app/_services/model/apiResult';
import _ from 'lodash';

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

@Component({
  selector: 'app-house-property-modal',
  templateUrl: './house-property-modal.component.html',
  styleUrls: ['./house-property-modal.component.scss']
})
export class HousePropertyModalComponent implements OnInit {

  @ViewChild('myInput')
  myInputVariable: ElementRef;

  @Input() employeedetails: EmployeeDetails;
  @Input() currentTaxMode: number;
  @Input() LstAllDeclarationProducts: any[] = [];
  @Input() selectedFinYear: any;
  @Input() CurrentFinYearHouseProperty: any[] = [];
  @Input() IsNewTaxRegimeOpted: boolean;
  @Input() UserId: number;
  @Input() RoleCode: string;
@Input() HousePropertyDisclaimer : string = "";

  EmployeeId: any = 0;
  employeeModel: EmployeeModel = new EmployeeModel();
  isrendering_spinner: boolean = true;

  lhpForm: FormGroup;
  submitted = false;
  IsValidToTakeHomeLoanAmount: boolean = false;
  IsValidToTakeStampDutyFee: boolean = false;
  ChildProductJson = [];
  LstEmployeeHousePropertyDetails: EmployeeHousePropertyDetails[] = [];
  LstemployeeInvestmentDeductions: EmployeeInvestmentDeductions[] = [];

  DeclarationAttachments = [];
  ValidHomeLoanObject_HPD: any;
  ValidStampDutyObject_HPD: any;

  isLoading: boolean = true;
  docSpinnerText: string = "Uploading";
  selectedUploadIndex: number;
  unsavedDocumentLst = [];

  IsHPataExists: boolean = false;
  isEditable: boolean = true;
  StatusNumber: number = 0;
  approverRemarks: string = "";

  modalOption: NgbModalOptions = {};

  LstHousePropertyDetails: any[] = [];
  IsEditMode: boolean = false;
  IsApiTriggered: boolean = false;

  ChildProducts = [];
  StampDutyFeeProduct = [];
  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private loadingScreenService: LoadingScreenService,
    private essService: ESSService,
    private employeeService: EmployeeService,
    private investmentService: InvestmentService,
    private utilityService: UtilityService,
    private modalService: NgbModal

  ) {

    this.employeeModel.oldobj = Object.assign({}, this.employeedetails);

  }
  get g() { return this.lhpForm.controls; } // reactive forms validation 

  createForm() {

    this.lhpForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      FirstTimeHomeOwner: [false, Validators.required],
      LetOut: ['selfOccupied', Validators.required],
      AddressDetails: [null, Validators.required],
      OwnershipPercentage: [null, Validators.required],
      GrossAnnualValue: [0],
      MunicipalTax: [0],
      LoanDate: [null, Validators.required],
      PossessionDate: [null, Validators.required],
      InterestAmount: [null, Validators.required],
      PrincipalAmount: [null, Validators.required], // extra prop
      PreConstructionInterestAmount: [null, Validators.required],
      InstallmentNumber: [null, Validators.required],
      NameOfLender: [null, Validators.required],
      LenderPANNO: [null, Validators.required],
      AddressOfLender: [null, Validators.required],
      Sec24ChildProductAmount: [0],
      StampDutyFee: [0],
      InputsRemarks: [''],
      IsProposed: [false],
      DeclarationAttachments: [this.DeclarationAttachments, this.currentTaxMode == 2 && Validators.required],
      GrossAnnualValueApprovedAmount: [0],
      PreConstructionInterestApprovedAmount: [0],
      InterestAmountApprovedAmount: [0],
      MunicipalTaxApprovedAmount: [0],
      ApproverRemarks: [""],
      employeeInvestmentDeduction: [null]
    });

  }
  ngOnInit() {
    this.onRefresh();
  }
  onRefresh() {
    this.StampDutyFeeProduct = []; // 80c
    this.ChildProductJson = []; // 80ee, 80eea
    this.ChildProducts = []; // glb
    this.ValidStampDutyObject_HPD = this.StampDutyFeeProduct.length > 0 ? this.StampDutyFeeProduct[0] : null;
    this.createForm();
    this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
    if (this.EmployeeId == 0) {
      this.close_slider_hp();
    }
    this.GetEmployeeRequiredDetailsById(this.selectedFinYear).then((rs) => {

    });

  }

  GetEmployeeRequiredDetailsById(currentFinYear) {
    this.isrendering_spinner = true;
    this.IsEditMode = false;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, currentFinYear).subscribe((result) => {
          this.isrendering_spinner = false;
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            resolve(true);
            this.employeedetails = apiR.Result as any;
            this.employeeModel.oldobj = Object.assign({}, result.Result);
            this.LstHousePropertyDetails = this.employeedetails.LstEmployeeHousePropertyDetails;
            console.log('LHPD >>>>>>>>>>>>>>> ', this.LstHousePropertyDetails);
            if (this.LstHousePropertyDetails.length == 0) {
              this.addNewHPD();
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

  addNewHPD() {

    this.ValidHomeLoanObject_HPD = null;
    this.ValidStampDutyObject_HPD = null;
    this.IsValidToTakeHomeLoanAmount = false;
    this.IsValidToTakeStampDutyFee = false;
    this.createForm();
    this.IsHPataExists = false;
    this.IsEditMode = true;
    this.StatusNumber = 0;
    this.lhpForm.controls['IsProposed'].setValue(this.currentTaxMode == 1 ? true : false);
    this.currentTaxMode == 2 ? this.updateValidation(true, this.lhpForm.get('DeclarationAttachments')) : this.updateValidation(false, this.lhpForm.get('DeclarationAttachments'));

    this.ChildProducts = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];
    this.StampDutyFeeProduct = this.ChildProducts.length > 0 && this.ChildProducts.filter(a => a.Code == 'Sec80C').length > 0
      ? this.ChildProducts.filter(a => a.Code == 'Sec80C') : [];
    this.ChildProductJson = this.ChildProducts.filter(val => !this.StampDutyFeeProduct.includes(val));

    console.log('this.ChildProducts', this.StampDutyFeeProduct);
    console.log('this.ChildProducts', this.ChildProductJson);
    console.log('this.ChildProducts', this.ChildProducts);


  }

  doEditHPD(item) {

    try {

      console.log('item', item);
      this.ValidHomeLoanObject_HPD = null;
      this.ValidStampDutyObject_HPD = null;
      this.IsValidToTakeHomeLoanAmount = false;
      this.IsValidToTakeStampDutyFee = false;

      this.lhpForm.controls['IsProposed'].setValue(this.currentTaxMode == 1 ? true : false);
      this.currentTaxMode == 2 ? this.updateValidation(true, this.lhpForm.get('DeclarationAttachments')) : this.updateValidation(false, this.lhpForm.get('DeclarationAttachments'));

      this.ChildProducts = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];
      this.StampDutyFeeProduct = this.ChildProducts.length > 0 && this.ChildProducts.filter(a => a.Code == 'Sec80C').length > 0
        ? this.ChildProducts.filter(a => a.Code == 'Sec80C') : [];
      this.ChildProductJson = this.ChildProducts.filter(val => !this.StampDutyFeeProduct.includes(val));

      if (item != null) {

        let CurrentFinYearHouseProperty = item;
        if (CurrentFinYearHouseProperty) {
          try {
            console.log('CurrentFinYearHouseProperty', CurrentFinYearHouseProperty);

            this.IsHPataExists = true;

            this.StatusNumber = CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments != null &&
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.length > 0 &&
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1).length > 0 ? 1 :
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 0).length > 0 ? 0 :
                CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 2).length > 0 ? 2 :
                  0;

            this.isEditable = (this.StatusNumber == 3 || this.StatusNumber == 1) ? false : true;
            this.lhpForm.patchValue(CurrentFinYearHouseProperty);


            this.lhpForm.controls['LetOut'].setValue(CurrentFinYearHouseProperty.LetOut == false ? 'selfOccupied' : 'rentedOut');
            this.lhpForm.controls['LoanDate'].setValue(new Date(CurrentFinYearHouseProperty.LoanDate))
            this.lhpForm.controls['PossessionDate'].setValue(new Date(CurrentFinYearHouseProperty.PossessionDate));
            this.lhpForm.controls['DeclarationAttachments'].setValue(CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments);
            this.lhpForm.controls['employeeInvestmentDeduction'].setValue(CurrentFinYearHouseProperty.employeeInvestmentDeduction)
            if (CurrentFinYearHouseProperty.employeeInvestmentDeduction != null) {
              this.IsValidToTakeHomeLoanAmount = true;
              this.lhpForm.controls['Sec24ChildProductAmount'].setValue((CurrentFinYearHouseProperty.employeeInvestmentDeduction.Amount));
              this.ValidHomeLoanObject_HPD = this.ChildProductJson.find(a => a.ProductId == CurrentFinYearHouseProperty.employeeInvestmentDeduction.ProductID);
            } else {
              if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
                let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == item.Id && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
                  this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == item.Id && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)
                console.log('ExsitingChildProduct', ExsitingChildProduct);
                if (ExsitingChildProduct) {
                  this.IsValidToTakeHomeLoanAmount = true;
                  this.lhpForm.controls['Sec24ChildProductAmount'].setValue((ExsitingChildProduct.Amount));
                  this.ValidHomeLoanObject_HPD = this.ChildProductJson.find(a => a.ProductId == ExsitingChildProduct.ProductID);
                }
              }
            }

            // stamp duty fee -begins
            if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
                this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null)
              console.log('ExsitingChildProduct', ExsitingChildProduct);
              if (ExsitingChildProduct) {
                this.lhpForm.controls['StampDutyFee'].setValue((ExsitingChildProduct.Amount));
                this.ValidStampDutyObject_HPD = this.ChildProductJson.find(a => a.ProductId == ExsitingChildProduct.ProductID);
              }
            }
            // end

            this.approverRemarks = this.lhpForm.controls.ApproverRemarks.value;


            // this.isEditable == false ? this.lhpForm.disable() : this.lhpForm.enable();
          } catch (error) {

            console.log('execption patch value ::', error);

          }
        }
      }
      this.IsEditMode = true;
    } catch (error) {
      console.log('EXEPTION ::::', error);

    }
  }
  doDeleteHPD(item) {
    this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {
      this.loadingScreenService.startLoading();
      console.log('item', item);
      this.ValidHomeLoanObject_HPD = null;
      this.IsValidToTakeHomeLoanAmount = false;

      this.lhpForm.controls['IsProposed'].setValue(this.currentTaxMode == 1 ? true : false);
      this.currentTaxMode == 2 ? this.updateValidation(true, this.lhpForm.get('DeclarationAttachments')) : this.updateValidation(false, this.lhpForm.get('DeclarationAttachments'));
      this.ChildProductJson = this.LstAllDeclarationProducts.length > 0 ? this.LstAllDeclarationProducts.filter(pro => environment.environment.HousePropertiesChildProductCodes.includes(pro.ProductCode.toUpperCase())) : [];


      if (item != null) {

        let CurrentFinYearHouseProperty = item;
        if (CurrentFinYearHouseProperty) {
          try {
            console.log('CurrentFinYearHouseProperty', CurrentFinYearHouseProperty);

            this.IsHPataExists = true;

            this.StatusNumber = CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments != null &&
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.length > 0 &&
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1).length > 0 ? 1 :
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 0).length > 0 ? 0 :
                CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 2).length > 0 ? 2 :
                  0;

            this.isEditable = (this.StatusNumber == 3 || this.StatusNumber == 1) ? false : true;
            this.lhpForm.patchValue(CurrentFinYearHouseProperty);


            this.lhpForm.controls['LetOut'].setValue(CurrentFinYearHouseProperty.LetOut == false ? 'selfOccupied' : 'rentedOut');
            this.lhpForm.controls['LoanDate'].setValue(new Date(CurrentFinYearHouseProperty.LoanDate))
            this.lhpForm.controls['PossessionDate'].setValue(new Date(CurrentFinYearHouseProperty.PossessionDate));
            this.lhpForm.controls['DeclarationAttachments'].setValue(CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments);
            this.lhpForm.controls['employeeInvestmentDeduction'].setValue(CurrentFinYearHouseProperty.employeeInvestmentDeduction)
            if (CurrentFinYearHouseProperty.employeeInvestmentDeduction != null) {
              this.IsValidToTakeHomeLoanAmount = true;
              this.lhpForm.controls['Sec24ChildProductAmount'].setValue((CurrentFinYearHouseProperty.employeeInvestmentDeduction.Amount));
              this.ValidHomeLoanObject_HPD = this.ChildProductJson.find(a => a.ProductId == CurrentFinYearHouseProperty.employeeInvestmentDeduction.ProductID);
            } else {
              if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
                let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
                  this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)
                console.log('ExsitingChildProduct', ExsitingChildProduct);
                if (ExsitingChildProduct) {
                  this.IsValidToTakeHomeLoanAmount = true;
                  this.lhpForm.controls['Sec24ChildProductAmount'].setValue((ExsitingChildProduct.Amount));
                  this.ValidHomeLoanObject_HPD = this.ChildProductJson.find(a => a.ProductId == ExsitingChildProduct.ProductID);
                }
              }
            }

            // stamp duty fee -begins
            if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
              let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
                this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null)
              console.log('ExsitingChildProduct', ExsitingChildProduct);
              if (ExsitingChildProduct) {
                this.lhpForm.controls['StampDutyFee'].setValue((ExsitingChildProduct.Amount));
                this.ValidStampDutyObject_HPD = this.ChildProductJson.find(a => a.ProductId == ExsitingChildProduct.ProductID);
              }
            }
            // end

            this.approverRemarks = this.lhpForm.controls.ApproverRemarks.value;


            // this.isEditable == false ? this.lhpForm.disable() : this.lhpForm.enable();
          } catch (error) {

            console.log('execption patch value ::', error);

          }
        }
      }
      this.doPushNewHouseProperty('delete');
    }).catch(cancel => {

    });

  }


  doChangeHomeLoanDate(event) {
    this.IsValidToTakeHomeLoanAmount = false;
    this.doCheckIsAvailToTakeHomeLoanAmount();
  }

  doChangeHomeLoanPossessionDate(event) {
    this.IsValidToTakeHomeLoanAmount = false;
    this.doCheckIsAvailToTakeHomeLoanAmount();
  }

  doCheckIsAvailToTakeHomeLoanAmount() {
    this.IsValidToTakeHomeLoanAmount = false;
    this.ValidHomeLoanObject_HPD = null;
    for (let index = 0; index < this.ChildProductJson.length; index++) {

      const element = this.ChildProductJson[index];
      console.log('e', element);

      this.IsValidToTakeHomeLoanAmount = moment(this.lhpForm.get('LoanDate').value).isBetween(moment(element.ValidFrom).format('YYYY-MM-DD'), moment(element.ValidTill).format('YYYY-MM-DD')); // true
      this.IsValidToTakeHomeLoanAmount == false ? this.IsValidToTakeHomeLoanAmount = moment(element.ValidFrom).isSame(moment(this.lhpForm.get('LoanDate').value).format('YYYY-MM-DD')) : null;
      this.IsValidToTakeHomeLoanAmount == false ? this.IsValidToTakeHomeLoanAmount = moment(element.ValidTill).isSame(moment(this.lhpForm.get('LoanDate').value).format('YYYY-MM-DD')) : null;
      if (this.IsValidToTakeHomeLoanAmount) {
        this.ValidHomeLoanObject_HPD = element;
        break;
      }
    }
  }

  //TODO:To update formgroup validation
  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }
  OnChangeLetOut(index) {
    if (index == 1) {
      this.updateValidation(true, this.lhpForm.get('GrossAnnualValue'));
      this.updateValidation(true, this.lhpForm.get('MunicipalTax'));
      this.lhpForm.controls['LoanDate'].setValue(null)
      this.lhpForm.controls['PossessionDate'].setValue(null);
      this.lhpForm.controls['MunicipalTax'].setValue(null)
      this.lhpForm.controls['GrossAnnualValue'].setValue(null);
      this.lhpForm.controls['InterestAmount'].setValue(null);
      this.lhpForm.controls['PrincipalAmount'].setValue(null)
      this.lhpForm.controls['InstallmentNumber'].setValue(null);
    } else {
      this.updateValidation(false, this.lhpForm.get('GrossAnnualValue'));
      this.updateValidation(false, this.lhpForm.get('MunicipalTax'));
      this.lhpForm.controls['StampDutyFee'].setValue(null);
      this.lhpForm.controls['LoanDate'].setValue(null)
      this.lhpForm.controls['PossessionDate'].setValue(null);
      this.lhpForm.controls['MunicipalTax'].setValue(null)
      this.lhpForm.controls['GrossAnnualValue'].setValue(null);
      this.lhpForm.controls['InterestAmount'].setValue(null);
      this.lhpForm.controls['PrincipalAmount'].setValue(null)
      this.lhpForm.controls['InstallmentNumber'].setValue(null);
    }





  }


  CalcLHP() {
    var calculatedAmt = this.lhpForm.controls.LetOut.value === 'rentedOut' ?
      Number(this.lhpForm.controls.GrossAnnualValue.value) - Number(this.lhpForm.controls.MunicipalTax.value) -
      (Number(this.lhpForm.controls.GrossAnnualValue.value) - Number(this.lhpForm.controls.MunicipalTax.value) % 30) -
      Number(this.lhpForm.controls.InterestAmount.value) : Number(this.lhpForm.controls.InterestAmount.value);
    return calculatedAmt;
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


  doPushOldHouseProperty() {

    if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
      let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
        this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)
      console.log('ExsitingChildProduct', ExsitingChildProduct);


      if (ExsitingChildProduct) {
        this.IsValidToTakeHomeLoanAmount = true;
        this.lhpForm.controls['Sec24ChildProductAmount'].setValue((ExsitingChildProduct.Amount));
        this.ValidHomeLoanObject_HPD = this.ChildProductJson.find(a => a.ProductId == ExsitingChildProduct.ProductID);
      }
    }

    // stamp duty fee 
    if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {
      let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
        this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null)
      console.log('ExsitingChildProduct 3', ExsitingChildProduct);


      if (ExsitingChildProduct) {
        this.IsValidToTakeHomeLoanAmount = true;
        this.lhpForm.controls['StampDutyFee'].setValue((ExsitingChildProduct.Amount));
        this.ValidStampDutyObject_HPD = this.ChildProductJson.find(a => a.ProductId == ExsitingChildProduct.ProductID);
      }
    }
    // end

    if (this.employeedetails.LstEmployeeHousePropertyDetails.length > 0) {

      let CurrentFinYearHouseProperty = this.employeedetails.LstEmployeeHousePropertyDetails.find(a => a.FinancialYearId == this.selectedFinYear);
      if (CurrentFinYearHouseProperty) {
        try {
          console.log('CurrentFinYearHouseProperty', CurrentFinYearHouseProperty);

          this.IsHPataExists = true;

          this.StatusNumber = CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments != null &&
            CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.length > 0 &&
            CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 1).length > 0 ? 1 :
            CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 0).length > 0 ? 0 :
              CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments.filter(a => a.Status == 2).length > 0 ? 2 :
                0;

          this.isEditable = (this.StatusNumber == 3 || this.StatusNumber == 1) ? false : true;
          this.lhpForm.patchValue(CurrentFinYearHouseProperty);


          this.lhpForm.controls['LetOut'].setValue(CurrentFinYearHouseProperty.LetOut == false ? 'selfOccupied' : 'rentedOut');
          this.lhpForm.controls['LoanDate'].setValue(new Date(CurrentFinYearHouseProperty.LoanDate))
          this.lhpForm.controls['PossessionDate'].setValue(new Date(CurrentFinYearHouseProperty.PossessionDate));
          this.lhpForm.controls['DeclarationAttachments'].setValue(CurrentFinYearHouseProperty.LstEmployeeInvestmentDocuments);

          this.approverRemarks = this.lhpForm.controls.ApproverRemarks.value;


          // this.isEditable == false ? this.lhpForm.disable() : this.lhpForm.enable();
        } catch (error) {

          console.log('execption patch value ::', error);

        }
      }
    } else {

    }


  }


  doMapInvestmentLogHistory(Id, Amount, Remarks, ApprovedAmount, ApproverRemarks, sectionName) {
    let LstLogHistory = [];
    let isNewRecord: boolean = false;
    if (Id == 0) {
      isNewRecord = true;
    } else {
      isNewRecord = false;
      if (sectionName == 'HP') {
        LstLogHistory = this.employeedetails.LstEmployeeHousePropertyDetails != null &&
          this.employeedetails.LstEmployeeHousePropertyDetails.length > 0 &&
          this.employeedetails.LstEmployeeHousePropertyDetails.filter(z => z.Id == Id).length > 0 &&
          this.employeedetails.LstEmployeeHousePropertyDetails.find(z => z.Id == Id).LstInvestmentLogHistory != null ? this.employeedetails.LstEmployeeHousePropertyDetails.find(z => z.Id == Id).LstInvestmentLogHistory : [];

      } else if (sectionName == 'INVT') {
        LstLogHistory = this.employeedetails.LstemployeeInvestmentDeductions != null &&
          this.employeedetails.LstemployeeInvestmentDeductions.length > 0 &&
          this.employeedetails.LstemployeeInvestmentDeductions.filter(z => z.Id == Id).length > 0 &&
          this.employeedetails.LstemployeeInvestmentDeductions.find(z => z.Id == Id).LstInvestmentLogHistory != null ? this.employeedetails.LstemployeeInvestmentDeductions.find(z => z.Id == Id).LstInvestmentLogHistory : [];

      }
    }
    LstLogHistory = LstLogHistory == null ? [] : LstLogHistory;
    var investmentLogHistory = new InvestmentLogHistory();
    investmentLogHistory.DeclaredAmount = Amount;
    investmentLogHistory.DeclaredRemarks = Remarks;
    investmentLogHistory.DeclaredBy = this.UserId;
    investmentLogHistory.DeclaredOn = moment(new Date()).format('YYYY-MM-DD');
    investmentLogHistory.ApprovedAmount = ApprovedAmount == null ? 0 : ApprovedAmount;
    investmentLogHistory.ApproverRemarks = ApproverRemarks == null ? "" : ApproverRemarks;
    investmentLogHistory.ApprovedBy = this.investmentService.PermissibleRoles(this.RoleCode) ? this.UserId : 0;
    investmentLogHistory.ApprovedOn = this.investmentService.PermissibleRoles(this.RoleCode) ? moment(new Date()).format('YYYY-MM-DD HH:mm:ss') : null;

    LstLogHistory.push(investmentLogHistory);
    return LstLogHistory;
  }


  doMapEmployeeInvestmentDocuments(DeclarationAttachments, isAutoApprove) {
    let LstAttachments = [];

    console.log('isAutoApprove', isAutoApprove);

    DeclarationAttachments != null && DeclarationAttachments.length > 0
      && DeclarationAttachments.forEach(el => {

        var employeeInvestmentDocuments = new EmployeeInvestmentDocuments();
        employeeInvestmentDocuments.EmployeeId = this.EmployeeId;
        employeeInvestmentDocuments.ProductId = 0;
        employeeInvestmentDocuments.Date = new Date();
        employeeInvestmentDocuments.DocumentNumber = "0";
        employeeInvestmentDocuments.DocumentId = el.DocumentId;
        employeeInvestmentDocuments.FileName = el.FileName;
        employeeInvestmentDocuments.Amount = 0;
        employeeInvestmentDocuments.ApprovedAmount = this.lhpForm.controls.GrossAnnualValueApprovedAmount.value;
        employeeInvestmentDocuments.OtherInfo = "";
        employeeInvestmentDocuments.FromDate = new Date();
        employeeInvestmentDocuments.ToDate = new Date();
        employeeInvestmentDocuments.Remarks = '';
        employeeInvestmentDocuments.Status = (this.investmentService.PermissibleRoles(this.RoleCode) || isAutoApprove) ? 1 : (el.Status == 2 ? 0 : 0); // el.Status);
        LstAttachments.push(employeeInvestmentDocuments);
      });
    return LstAttachments;
  }


  doPushNewHouseProperty(actionName) {
    try {

      let isAutoApprove: boolean = false;
      isAutoApprove = this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;
      this.LstEmployeeHousePropertyDetails = [];
      var empHousePropDetails = new EmployeeHousePropertyDetails();
      empHousePropDetails.EmployeeId = this.EmployeeId;
      empHousePropDetails.FinancialYearId = this.selectedFinYear;
      empHousePropDetails.LetOut = this.lhpForm.controls.LetOut.value == 'rentedOut' ? true : false;
      empHousePropDetails.GrossAnnualValue = this.lhpForm.controls.LetOut.value != 'rentedOut' ? this.CalcLHP() : this.lhpForm.controls.GrossAnnualValue.value;
      empHousePropDetails.MunicipalTax = this.lhpForm.controls.MunicipalTax.value == null ? 0 : this.lhpForm.controls.MunicipalTax.value;
      empHousePropDetails.InterestAmount = this.lhpForm.controls.InterestAmount.value == null ? 0 : this.lhpForm.controls.InterestAmount.value;
      empHousePropDetails.PreConstructionInterestAmount = this.lhpForm.controls.PreConstructionInterestAmount.value == null ? 0 : this.lhpForm.controls.PreConstructionInterestAmount.value; 
      empHousePropDetails.InstallmentNumber = this.lhpForm.controls.InstallmentNumber.value == null ? 0 : empHousePropDetails.InstallmentNumber;
      empHousePropDetails.LoanDate = moment(this.lhpForm.controls.LoanDate.value, 'DD-MM-YYYY').format('YYYY-MM-DD');
      empHousePropDetails.PossessionDate = moment(this.lhpForm.controls.PossessionDate.value, 'DD-MM-YYYY').format('YYYY-MM-DD');
      empHousePropDetails.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
      empHousePropDetails.DocumentId = 0;
      empHousePropDetails.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
      empHousePropDetails.AddressOfLender = this.lhpForm.controls.AddressOfLender.value;
      empHousePropDetails.GrossAnnualValueApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? (this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? empHousePropDetails.GrossAnnualValue : !this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? this.lhpForm.controls.GrossAnnualValueApprovedAmount.value : 0) : 0; // this.lhpForm.controls.GrossAnnualValueApprovedAmount.value;
      empHousePropDetails.MunicipalTaxApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? (this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? empHousePropDetails.MunicipalTax : !this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? this.lhpForm.controls.MunicipalTaxApprovedAmount.value : 0) : 0;// this.lhpForm.controls.MunicipalTaxApprovedAmount.value;
      empHousePropDetails.InterestAmountApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? (this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? empHousePropDetails.InterestAmount : !this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? this.lhpForm.controls.InterestAmountApprovedAmount.value : 0) : 0;// this.lhpForm.controls.InterestAmountApprovedAmount.value;
      empHousePropDetails.PreConstructionInterestApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? (this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? empHousePropDetails.PreConstructionInterestAmount : !this.essService.isGuid(this.lhpForm.controls.Id.value) && this.investmentService.PermissibleRoles(this.RoleCode) ? this.lhpForm.controls.PreConstructionInterestApprovedAmount.value : 0) : 0;// this.lhpForm.controls.PreConstructionInterestApprovedAmount.value;
      empHousePropDetails.ApproverRemarks = this.lhpForm.controls.ApproverRemarks.value;
      empHousePropDetails.PrincipalAmount = this.lhpForm.controls.PrincipalAmount.value == null ? 0 : this.lhpForm.controls.PrincipalAmount.value;
      empHousePropDetails.AddressDetails = this.lhpForm.controls.AddressDetails.value;
      empHousePropDetails.Status = 1;
      empHousePropDetails.FirstTimeHomeOwner = this.lhpForm.controls.FirstTimeHomeOwner.value;
      empHousePropDetails.OwnershipPercentage = this.lhpForm.controls.OwnershipPercentage.value;
      empHousePropDetails.LenderPANNO = this.lhpForm.controls.LenderPANNO.value;
      empHousePropDetails.Modetype = (actionName == 'delete' ? UIMode.Delete : UIMode.Edit);
      empHousePropDetails.NameOfLender = this.lhpForm.controls.NameOfLender.value;
      empHousePropDetails.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value, isAutoApprove);

      empHousePropDetails.Id = this.essService.isGuid(this.lhpForm.controls.Id.value) == true ? 0 : this.lhpForm.controls.Id.value;
      empHousePropDetails.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empHousePropDetails.Id, empHousePropDetails.InterestAmount, empHousePropDetails.InputsRemarks, empHousePropDetails.InterestAmountApprovedAmount, empHousePropDetails.ApproverRemarks, 'HP');

      this.LstEmployeeHousePropertyDetails.push(empHousePropDetails)
      this.employeedetails.LstEmployeeHousePropertyDetails = this.LstEmployeeHousePropertyDetails;
      console.log('sss', this.ValidHomeLoanObject_HPD);
      console.log('sss', this.lhpForm.value);
      console.log('sss 3', this.ValidStampDutyObject_HPD);

      // while changing the let out - setting up the by default value
      if (this.ValidStampDutyObject_HPD == undefined) {
        this.ValidStampDutyObject_HPD = this.StampDutyFeeProduct.length > 0 ? this.StampDutyFeeProduct[0] : null;
      }

      if (this.ValidStampDutyObject_HPD && this.lhpForm.controls.LetOut.value == 'selfOccupied') {
        this.doPushStampDutyProductDeclarationData(actionName);
      } else if (this.ValidStampDutyObject_HPD && this.lhpForm.controls.LetOut.value != 'selfOccupied' && this.lhpForm.controls.Id.value > 0 && !this.essService.isGuid(this.lhpForm.controls.Id.value)) {
        this.doPushStampDutyProductDeclarationData('delete');
      }

      if (this.ValidHomeLoanObject_HPD) {
        // this.doPushNewDeclarationData(actionName);
        if (this.lhpForm.controls.employeeInvestmentDeduction.value != null && this.lhpForm.controls.employeeInvestmentDeduction.value.ProductID == this.ValidHomeLoanObject_HPD.ProductId) {
          console.log('sss');

          var empInvestmentDeduction = new EmployeeInvestmentDeductions();
          empInvestmentDeduction.Id = this.lhpForm.controls.employeeInvestmentDeduction.value == null ? 0 : this.lhpForm.controls.employeeInvestmentDeduction.value.Id;
          console.log('empInvestmentDeduction :::::::::::::::::::::::', empInvestmentDeduction.Id);

          empInvestmentDeduction.EmployeeId = this.EmployeeId;
          empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
          empInvestmentDeduction.ProductID = this.ValidHomeLoanObject_HPD.ProductId;
          empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
          empInvestmentDeduction.IsDifferentlyabled = false;
          empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('Sec24ChildProductAmount').value) ? 0 : this.lhpForm.get('Sec24ChildProductAmount').value;
          empInvestmentDeduction.Details = '';
          empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; //this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
          empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
          empInvestmentDeduction.ApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ?
            ((this.isGuidId(empInvestmentDeduction.Id) || empInvestmentDeduction.Id == 0) && this.investmentService.PermissibleRoles(this.RoleCode) ?

              empInvestmentDeduction.Amount : this.lhpForm.controls.employeeInvestmentDeduction.value == null ? 0 : this.lhpForm.controls.employeeInvestmentDeduction.value.ApprovedAmount) : 0;
          empInvestmentDeduction.ApproverRemarks = this.lhpForm.controls.employeeInvestmentDeduction.value == null ? "" : this.lhpForm.controls.employeeInvestmentDeduction.value.ApproverRemarks;
          empInvestmentDeduction.Status = 1;
          empInvestmentDeduction.DocumentId = 0;
          empInvestmentDeduction.LstEmpInvDepDetails = [];
          empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : UIMode.Edit;


          let isAutoApprove: boolean = false;
          isAutoApprove = empInvestmentDeduction.Id == 0 && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;


          empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value, isAutoApprove);
          empInvestmentDeduction.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(empInvestmentDeduction.Id, empInvestmentDeduction.Amount, empInvestmentDeduction.InputsRemarks, empInvestmentDeduction.ApprovedAmount, empInvestmentDeduction.ApproverRemarks, 'INVT');

          empInvestmentDeduction.EHPId = empHousePropDetails.Id;
          empHousePropDetails.employeeInvestmentDeduction = empInvestmentDeduction;
        } else {

          let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
            this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)

          if (ExsitingChildProduct != null && ExsitingChildProduct.ProductID != this.ValidHomeLoanObject_HPD.ProductId) {



            ExsitingChildProduct.Modetype = UIMode.Delete;

            var empInvestmentDeduction = new EmployeeInvestmentDeductions();
            empInvestmentDeduction.Id = 0
            empInvestmentDeduction.EmployeeId = this.EmployeeId;
            empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
            empInvestmentDeduction.ProductID = this.ValidHomeLoanObject_HPD.ProductId;
            empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
            empInvestmentDeduction.IsDifferentlyabled = false;
            empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('Sec24ChildProductAmount').value) ? 0 : this.lhpForm.get('Sec24ChildProductAmount').value;
            empInvestmentDeduction.Details = '';
            empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
            empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
            empInvestmentDeduction.ApprovedAmount = this.investmentService.PermissibleRoles(this.RoleCode) && (this.isGuidId(empInvestmentDeduction.Id) || empInvestmentDeduction.Id == 0) ? empInvestmentDeduction.Amount :
              this.investmentService.PermissibleRoles(this.RoleCode) && empInvestmentDeduction.Id > 0 ? empInvestmentDeduction.Amount :
                0;
            empInvestmentDeduction.ApproverRemarks = "";
            empInvestmentDeduction.Status = 1;
            empInvestmentDeduction.DocumentId = 0;
            empInvestmentDeduction.LstEmpInvDepDetails = [];

            let isAutoApprove: boolean = false;
            isAutoApprove = empInvestmentDeduction.Id == 0 && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;

            empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : (this.ValidHomeLoanObject_HPD && this.IsValidToTakeHomeLoanAmount ? UIMode.Edit : UIMode.Delete);
            empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value, isAutoApprove);
            empInvestmentDeduction.EHPId = empHousePropDetails.Id;
            empHousePropDetails.employeeInvestmentDeduction = empInvestmentDeduction;
          } else {
            var empInvestmentDeduction = new EmployeeInvestmentDeductions();
            empInvestmentDeduction.Id = 0

            empInvestmentDeduction.EmployeeId = this.EmployeeId;
            empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
            empInvestmentDeduction.ProductID = this.ValidHomeLoanObject_HPD.ProductId;
            empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
            empInvestmentDeduction.IsDifferentlyabled = false;
            empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('Sec24ChildProductAmount').value) ? 0 : this.lhpForm.get('Sec24ChildProductAmount').value;
            empInvestmentDeduction.Details = '';
            empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
            empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
            empInvestmentDeduction.ApprovedAmount = this.investmentService.PermissibleRoles(this.RoleCode) && (this.isGuidId(empInvestmentDeduction.Id) || empInvestmentDeduction.Id == 0) ? empInvestmentDeduction.Amount :
              this.investmentService.PermissibleRoles(this.RoleCode) && empInvestmentDeduction.Id > 0 ? empInvestmentDeduction.Amount :
                0;
            empInvestmentDeduction.ApproverRemarks = "";
            empInvestmentDeduction.Status = 1;
            empInvestmentDeduction.DocumentId = 0;
            empInvestmentDeduction.LstEmpInvDepDetails = [];

            let isAutoApprove: boolean = false;
            isAutoApprove = empInvestmentDeduction.Id == 0 && this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;

            empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : UIMode.Edit;
            empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value, isAutoApprove);
            empInvestmentDeduction.EHPId = empHousePropDetails.Id;
            empHousePropDetails.employeeInvestmentDeduction = empInvestmentDeduction;
          }
        }



      } else {


        let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
          this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)
        if (ExsitingChildProduct != null) {
          ExsitingChildProduct.Modetype = UIMode.Delete;
        }


      }


      // STAMP DUTY FEE

      // if (this.ValidStampDutyObject_HPD) {
      //   // this.doPushNewDeclarationData(actionName);
      //   if (this.lhpForm.controls.employeeInvestmentDeduction.value != null && this.lhpForm.controls.employeeInvestmentDeduction.value.ProductID == this.ValidStampDutyObject_HPD.ProductId) {
      //     console.log('sss');

      //     var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      //     empInvestmentDeduction.EmployeeId = this.EmployeeId;
      //     empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
      //     empInvestmentDeduction.ProductID = this.ValidStampDutyObject_HPD.ProductId;
      //     empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      //     empInvestmentDeduction.IsDifferentlyabled = false;
      //     empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('StampDutyFee').value) ? 0 : this.lhpForm.get('StampDutyFee').value;
      //     empInvestmentDeduction.Details = '';
      //     empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; //this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
      //     empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
      //     empInvestmentDeduction.ApprovedAmount = this.lhpForm.controls.employeeInvestmentDeduction.value == null ? 0 : this.lhpForm.controls.employeeInvestmentDeduction.value.ApprovedAmount;
      //     empInvestmentDeduction.ApproverRemarks = this.lhpForm.controls.employeeInvestmentDeduction.value == null ? "" : this.lhpForm.controls.employeeInvestmentDeduction.value.ApproverRemarks;
      //     empInvestmentDeduction.Status = 1;
      //     empInvestmentDeduction.DocumentId = 0;
      //     empInvestmentDeduction.LstEmpInvDepDetails = [];
      //     empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : UIMode.Edit;
      //     empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value);
      //     empInvestmentDeduction.Id = this.lhpForm.controls.employeeInvestmentDeduction.value == null ? 0 : this.lhpForm.controls.employeeInvestmentDeduction.value.Id;
      //     empInvestmentDeduction.EHPId = empHousePropDetails.Id;
      //     empHousePropDetails.employeeInvestmentDeduction = empInvestmentDeduction;
      //   } else {

      //     let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
      //       this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null)

      //     if (ExsitingChildProduct != null && ExsitingChildProduct.ProductID != this.ValidStampDutyObject_HPD.ProductId) {
      //       ExsitingChildProduct.Modetype = UIMode.Delete;
      //       var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      //       empInvestmentDeduction.EmployeeId = this.EmployeeId;
      //       empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
      //       empInvestmentDeduction.ProductID = this.ValidStampDutyObject_HPD.ProductId;
      //       empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      //       empInvestmentDeduction.IsDifferentlyabled = false;
      //       empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('StampDutyFee').value) ? 0 : this.lhpForm.get('StampDutyFee').value;
      //       empInvestmentDeduction.Details = '';
      //       empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
      //       empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
      //       empInvestmentDeduction.ApprovedAmount = 0;
      //       empInvestmentDeduction.ApproverRemarks = "";
      //       empInvestmentDeduction.Status = 1;
      //       empInvestmentDeduction.DocumentId = 0;
      //       empInvestmentDeduction.LstEmpInvDepDetails = [];
      //       empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : (this.ValidStampDutyObject_HPD && this.IsValidToTakeHomeLoanAmount ? UIMode.Edit : UIMode.Delete);
      //       empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value);
      //       empInvestmentDeduction.Id = 0
      //       empInvestmentDeduction.EHPId = empHousePropDetails.Id;
      //       empHousePropDetails.employeeInvestmentDeduction = empInvestmentDeduction;
      //     } else {
      //       var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      //       empInvestmentDeduction.EmployeeId = this.EmployeeId;
      //       empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
      //       empInvestmentDeduction.ProductID = this.ValidStampDutyObject_HPD.ProductId;
      //       empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      //       empInvestmentDeduction.IsDifferentlyabled = false;
      //       empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('StampDutyFee').value) ? 0 : this.lhpForm.get('StampDutyFee').value;
      //       empInvestmentDeduction.Details = '';
      //       empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
      //       empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
      //       empInvestmentDeduction.ApprovedAmount = 0;
      //       empInvestmentDeduction.ApproverRemarks = "";
      //       empInvestmentDeduction.Status = 1;
      //       empInvestmentDeduction.DocumentId = 0;
      //       empInvestmentDeduction.LstEmpInvDepDetails = [];
      //       empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : UIMode.Edit;
      //       empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value);
      //       empInvestmentDeduction.Id = 0
      //       empInvestmentDeduction.EHPId = empHousePropDetails.Id;
      //       empHousePropDetails.employeeInvestmentDeduction = empInvestmentDeduction;
      //     }
      //   }



      // } else {


      //   let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
      //     this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && x.EHPId == empHousePropDetails.Id && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null)
      //   if (ExsitingChildProduct != null) {
      //     ExsitingChildProduct.Modetype = UIMode.Delete;
      //   }


      // }

      this.finalSave();

    } catch (err) {
      console.log('HP PUSH EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }
  }


  doPushNewDeclarationData(actionName) {
    try {
      console.log('lsdfsd', this.employeedetails.LstemployeeInvestmentDeductions);

      let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
        this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.ChildProductJson.filter(a => a.ProductId == x.ProductID).length > 0) : null)

      console.log('ExsitingChildProduct', ExsitingChildProduct);
      console.log('this.ValidHomeLoanObject_HPD', this.ValidHomeLoanObject_HPD);

      this.LstemployeeInvestmentDeductions = [];

      var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      empInvestmentDeduction.Id = ExsitingChildProduct == null ? 0 : ExsitingChildProduct.Id;

      empInvestmentDeduction.EmployeeId = this.EmployeeId;
      empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
      empInvestmentDeduction.ProductID = this.ValidHomeLoanObject_HPD.ProductId;
      empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      empInvestmentDeduction.IsDifferentlyabled = false;
      empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('Sec24ChildProductAmount').value) ? 0 : this.lhpForm.get('Sec24ChildProductAmount').value;
      empInvestmentDeduction.Details = '';
      empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
      empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
      empInvestmentDeduction.ApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ?
        this.investmentService.PermissibleRoles(this.RoleCode) && (this.isGuidId(empInvestmentDeduction.Id) || empInvestmentDeduction.Id == 0) ? empInvestmentDeduction.Amount : this.investmentService.PermissibleRoles(this.RoleCode) && empInvestmentDeduction.Id > 0 ?
          empInvestmentDeduction.Amount:
      (ExsitingChildProduct == null ? 0 : ExsitingChildProduct.ApprovedAmount): 0;
      empInvestmentDeduction.ApproverRemarks = ExsitingChildProduct == null ? "" : ExsitingChildProduct.ApproverRemarks;
      empInvestmentDeduction.Status = 1;
      empInvestmentDeduction.DocumentId = 0;
      empInvestmentDeduction.LstEmpInvDepDetails = [];
      empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : (this.ValidHomeLoanObject_HPD && this.IsValidToTakeHomeLoanAmount ? UIMode.Edit : UIMode.Delete);
      empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value, empInvestmentDeduction.Id == 0 ? true : false);

      this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);

      this.employeedetails.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;
      this.finalSave();

    } catch (err) {
      console.log('INVESTMENT EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }

  }

  doPushStampDutyProductDeclarationData(actionName) {
    try {
      console.log('lsdfsd', this.employeedetails.LstemployeeInvestmentDeductions);

      let ExsitingChildProduct = (this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) != undefined ?
        this.employeedetails.LstemployeeInvestmentDeductions.find(x => x.FinancialYearId == this.selectedFinYear && this.StampDutyFeeProduct.filter(a => a.ProductId == x.ProductID).length > 0) : null)

      console.log('ExsitingChildProduct', ExsitingChildProduct);
      console.log('this.ValidHomeLoanObject_HPD', this.ValidHomeLoanObject_HPD);

      this.LstemployeeInvestmentDeductions = [];

      var empInvestmentDeduction = new EmployeeInvestmentDeductions();
      empInvestmentDeduction.Id = ExsitingChildProduct == null ? 0 : ExsitingChildProduct.Id;

      empInvestmentDeduction.EmployeeId = this.EmployeeId;
      empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
      empInvestmentDeduction.ProductID = this.ValidStampDutyObject_HPD.ProductId;
      empInvestmentDeduction.CLAIMINGSEVEREDISABILITY = false;
      empInvestmentDeduction.IsDifferentlyabled = false;
      empInvestmentDeduction.Amount = !this.utilityService.isNotNullAndUndefined(this.lhpForm.get('StampDutyFee').value) ? 0 : this.lhpForm.get('StampDutyFee').value;
      empInvestmentDeduction.Details = '';
      empInvestmentDeduction.IsProposed = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ? false : true; // this.lhpForm.controls.IsProposed.value; // this.currentTaxMode == 1 ? true : false;
      empInvestmentDeduction.InputsRemarks = this.lhpForm.controls.InputsRemarks.value;
      empInvestmentDeduction.ApprovedAmount = this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 ?
        (this.investmentService.PermissibleRoles(this.RoleCode) && (this.isGuidId(empInvestmentDeduction.Id) || empInvestmentDeduction.Id == 0)) ? empInvestmentDeduction.Amount :
          (this.investmentService.PermissibleRoles(this.RoleCode) && empInvestmentDeduction.Id > 0) ? ExsitingChildProduct.Amount :
            (ExsitingChildProduct == null ? 0 : ExsitingChildProduct.ApprovedAmount) : 0;
      empInvestmentDeduction.ApproverRemarks = ExsitingChildProduct == null ? "" : ExsitingChildProduct.ApproverRemarks;
      empInvestmentDeduction.Status = 1;
      empInvestmentDeduction.DocumentId = 0;
      empInvestmentDeduction.LstEmpInvDepDetails = [];
      empInvestmentDeduction.Modetype = actionName == 'delete' ? UIMode.Delete : (this.ValidStampDutyObject_HPD ? UIMode.Edit : UIMode.Delete);

      empInvestmentDeduction.LstEmployeeInvestmentDocuments = this.doMapEmployeeInvestmentDocuments(this.lhpForm.controls.DeclarationAttachments.value, empInvestmentDeduction.Id == 0 ? true : false);
      empInvestmentDeduction.EHPId = 0;// empInvestmentDeduction.Id == 0 ? 0 : this.essService.isGuid(this.lhpForm.controls.Id.value) ? 0 : this.lhpForm.controls.Id.value;
      this.LstemployeeInvestmentDeductions.push(empInvestmentDeduction);
      (empInvestmentDeduction.Amount == 0 && empInvestmentDeduction.Id == 0) ? true : this.employeedetails.LstemployeeInvestmentDeductions = this.LstemployeeInvestmentDeductions;

    } catch (err) {
      console.log('INVESTMENT EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }

  }


  doChangeHomeLoanAvailAmount(event) {
    if (this.ValidHomeLoanObject_HPD && this.ValidHomeLoanObject_HPD.ThresholdLimit < Number(event.target.value)) {
      this.alertService.showWarning('Please ensure the entered home loan avail amount is valid. It must be equal to or less than:' + this.ValidHomeLoanObject_HPD.ThresholdLimit);
      this.lhpForm.controls['Sec24ChildProductAmount'].setValue(0);
      return;
    }
  }

  doChangeStampDutyFeeAmount(event) {
    // if (event.target.value > 0) {
    this.ValidStampDutyObject_HPD = this.StampDutyFeeProduct.length > 0 ? this.StampDutyFeeProduct[0] : null;
    // }
  }



  saveDeclarations(layout) {
    this.submitted = true;
    console.log(this.lhpForm.value);
    console.log('this.employeedetails.LstEmployeeHousePropertyDetails', this.employeedetails.LstEmployeeHousePropertyDetails);
    console.log('vvvv', this.lhpForm.controls.Id.value);


    if (this.lhpForm.invalid) {
      this.alertService.showWarning("This alert is to inform you about your required fields");
      return;
    }
    if (!this.lhpForm.controls.IsProposed.value && this.currentTaxMode == 2 && this.lhpForm.controls.DeclarationAttachments.value.length == 0) {
      return;
    }

    // if ((this.lhpForm.controls.LetOut.value != 'rentedOut' ? this.CalcLHP() : this.lhpForm.controls.GrossAnnualValue.value) > 200000) {
    //   this.alertService.showWarning('Note : The annual amount should be equal to or less than the qualifying amount.');
    //   return;
    // }

    let isAlreadyExists = false;
    console.log('das', _.find(this.employeedetails.LstEmployeeHousePropertyDetails, (a) => this.lhpForm.controls.LetOut.value == 'selfOccupied' && a.Id != 0 && a.Id != this.lhpForm.controls.Id.value && a.FinancialYearId == this.selectedFinYear && a.LetOut == false));

    isAlreadyExists = _.find(this.employeedetails.LstEmployeeHousePropertyDetails, (a) => this.lhpForm.controls.LetOut.value == 'selfOccupied' && a.Id != 0 && a.Id != this.lhpForm.controls.Id.value && a.FinancialYearId == this.selectedFinYear && a.LetOut == false) != null ? true : false;
    if (isAlreadyExists) {
      this.alertService.showWarning('Note : The self-occupied type already exists.');
      return;
    }

    if (this.IsHPataExists && !this.lhpForm.controls.IsProposed.value && this.StatusNumber == 1) {

      if (this.investmentService.PermissibleRoles(this.RoleCode)) {
        this.loadingScreenService.startLoading();
        this.doPushNewHouseProperty('new');
      } else {
        this.alertService.confirmSwal("Are you sure?", "This record has already been verified. Are you sure you want to resubmit it?", "Ok").then((result) => {
          this.loadingScreenService.startLoading();
          this.doPushNewHouseProperty('new');
        }).catch(cancel => {

        });
      }
    } else {
      this.loadingScreenService.startLoading();
      this.doPushNewHouseProperty('new');
    }


  }
  finalSave() {
    try {
      this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;

      if (this.IsNewTaxRegimeOpted) {



        if (this.employeedetails.LstemployeeInvestmentDeductions.length > 0) {

          this.employeedetails.LstemployeeInvestmentDeductions = this.employeedetails.LstemployeeInvestmentDeductions.filter(a => a.Id != 0)
          this.employeedetails.LstemployeeInvestmentDeductions.forEach(e1 => {
            if (e1.FinancialYearId == this.selectedFinYear && (e1.EHPId <= 0 || e1.EHPId == null)) {
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

          this.loadingScreenService.stopLoading();
          if (data.Status) {
            this.IsEditMode = false;
            this.IsApiTriggered = true;
            // if(this.employeedetails.LstemployeeInvestmentDeductions != null && this.employeedetails.LstemployeeInvestmentDeductions.length > 0 && this.employeedetails.LstemployeeInvestmentDeductions.filter(a=>a.ProductID == this.StampDutyFeeProduct.find(z=>z.ProductId)).length > 0){
            //  let stampdutyItem =  this.employeedetails.LstemployeeInvestmentDeductions.find(a=>a.ProductID == this.StampDutyFeeProduct.find(z=>z.ProductId));
            //  if(stampdutyItem && stampdutyItem.EHPId == 0){
            //   stampdutyItem.EHPId  = data.dynamicObject.newobj.LstEmployeeHousePropertyDetails != null &&
            //   data.dynamicObject.newobj.LstEmployeeHousePropertyDetails.length > 0 ? data.dynamicObject.newobj.LstEmployeeHousePropertyDetails[0].Id : 0;
            //   stampdutyItem.
            //  }
            // }
            this.onRefresh();
            // this.activeModal.close('Done');
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

  delete_hp(actionName) {
    this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {
      this.loadingScreenService.startLoading();
      this.doPushNewHouseProperty(actionName);
    }).catch(cancel => {

    });


  }

  getStatusName(list, status) {
    return list != null && list.length > 0 ? list.filter(a => a.Status == status).length : 0;
  }


  close_slider_hp() {
    if (this.IsApiTriggered) {
      this.activeModal.close('Done');

    } else {
      this.activeModal.close('Modal Closed');

    }
  }
  cancel_slider_hp() {
    this.IsEditMode = false;
    if (this.LstHousePropertyDetails.length == 0) {
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
            let LstAttachments = [{
              FileName: file.name,
              DocumentId: s3DocumentId,
              Status: 0,
              ApprovedAmount: 0
            }];
            this.lhpForm.controls['DeclarationAttachments'].setValue(this.lhpForm.controls.DeclarationAttachments.value.concat(LstAttachments));
            this.unsavedDocumentLst.push({
              Id: s3DocumentId
            })

            this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 && this.lhpForm.controls.DeclarationAttachments.value.forEach(e1 => {
              this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
            });

            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file!")
            this.selectedUploadIndex = null;

            this.StatusNumber = this.lhpForm.controls.DeclarationAttachments.value != null &&
              this.lhpForm.controls.DeclarationAttachments.value.length > 0 &&
              this.lhpForm.controls.DeclarationAttachments.value.filter(a => a.Status == 1).length > 0 ? 1 :
              this.lhpForm.controls.DeclarationAttachments.value.filter(a => a.Status == 0).length > 0 ? 0 :
                this.lhpForm.controls.DeclarationAttachments.value.filter(a => a.Status == 2).length > 0 ? 2 :
                  0;
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
    // if (photo.Status == 1) {
    //   this.alertService.showWarning("Attention : This action was blocked. One or more attachement cannot be deleted because the status is in an invalid state.");
    //   return;
    // }

    this.alertService.confirmSwal("Are you sure you want to delete?", "This item will be deleted immediately. You can't undo this file.", "Yes, Delete").then(result => {
      this.isLoading = false;
      this.docSpinnerText = "Deleting";

      if (!this.essService.isGuid(this.lhpForm.controls.Id.value)) {
        var index = this.unsavedDocumentLst.map(function (el) {
          return el.Id
        }).indexOf(photo.DocumentId)
        this.unsavedDocumentLst.splice(index, 1);

        var index1 = this.lhpForm.controls.DeclarationAttachments.value.map(function (el) {
          return el.DocumentId
        }).indexOf(photo.DocumentId)
        this.lhpForm.controls.DeclarationAttachments.value.splice(index1, 1);
        this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 && this.lhpForm.controls.DeclarationAttachments.value.forEach(e1 => {
          this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
        });

        this.isLoading = true;
        this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
      }

      else {
        this.investmentService.deleteAsync(photo.DocumentId).then((s3DeleteObjectResult) => {

          if (s3DeleteObjectResult == true) {
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            var index = this.unsavedDocumentLst.map(function (el) {
              return el.Id
            }).indexOf(photo.DocumentId)
            this.unsavedDocumentLst.splice(index, 1);

            var index1 = this.lhpForm.controls.DeclarationAttachments.value.map(function (el) {
              return el.DocumentId
            }).indexOf(photo.DocumentId)
            this.lhpForm.controls.DeclarationAttachments.value.splice(index1, 1);
            this.lhpForm.controls.DeclarationAttachments.value != null && this.lhpForm.controls.DeclarationAttachments.value.length > 0 && this.lhpForm.controls.DeclarationAttachments.value.forEach(e1 => {
              this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 1 : e1.Status = 0;
            });
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
    // return;
  }

  isGuidId(Id) {
    return this.essService.isGuid(Id);
  }
  PermissibleRoles() {
    return this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;
  }
}
