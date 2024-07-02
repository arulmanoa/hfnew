import { Component, OnInit, Input } from '@angular/core';
import { EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { AdditionalPaymentProducts, RateType } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { AlertService } from 'src/app/_services/service';
import { PaygroupProductOverrides } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { UIMode } from 'src/app/_services/model';
import { PaymentType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-salarybreakupmodal',
  templateUrl: './salarybreakupmodal.component.html',
  styleUrls: ['./salarybreakupmodal.component.css']
})
export class SalarybreakupmodalComponent implements OnInit {

  @Input() NewRt = [];
  @Input() employeedetails: EmployeeDetails;
  @Input() lstOfPaygroupOverrideProducts = [];
  @Input() NewELCTransaction: EmployeeLifeCycleTransaction;

  isRecalculate: boolean = true;
  IsRateSetValue: boolean = false;
  isMinimumwageAdhered: boolean = false;
  isDailyOrHourlyWages: boolean = false;


  additionalApplicableProducts: AdditionalPaymentProducts = null;
  baseDaysForAddlApplicableProduct: number = 0;
  baseHoursForAddlApplicableProduct: number = 1;
  showDailyOrHourlyWageTable: boolean = false;
  wageType: string = '';
  isOverrideMonthlyValue: boolean = false;
  minimumWagesApplicableProductsList = [];
  Label_PFLogic: string = '';
  reviewCancelled: boolean = false;
  wageTypeString: string = 'Daily';
  IsAutoSalaryConfirmRequiredOnEmployee = environment.environment.IsAutoSalaryConfirmRequiredOnEmployee;

  IsZeroBasedCalculationRequired = environment.environment.IsZeroBasedCalculationRequired;
  IsRecalculateButtonRequiredOnEmployee = environment.environment.IsRecalculateButtonRequiredOnEmployee;
  EditableAnnualPayComponent = environment.environment.EditableAnnualPayComponent;
  DisabledProductsComponentsList = environment.environment.DisabledProductsComponentsList;
  roundingMethod = environment.environment.DefaultRoundingFunctionForSalary;
  HiddenProductsComponentsList = environment.environment.HiddenProductsComponentsList;

  TotalCTC: number = 0;
  constructor(
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
  ) { }

  ngOnInit() {

    // this.NewRt.find(a => a.ProductCode == "PFWAGES").IsOverridableProductGroup = true;

    console.log('lstOfPaygroupOverrideProducts', this.lstOfPaygroupOverrideProducts);


    if (!this.IsZeroBasedCalculationRequired && this.NewELCTransaction) {
      this.IsRateSetValue = this.NewELCTransaction.IsRateSetValid;
      this.isMinimumwageAdhered = this.NewELCTransaction.IsMinimumwageAdhere;
    }
    if (!this.IsZeroBasedCalculationRequired) {
      this._update_tableStructure()
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


          // if (element.ProductCTCPayrollRuleMappingId != null && element.ProductCTCPayrollRuleMappingId > 0) {
          //   element['defaultValue'] = lstProductGroup.find(x => x.ProductCTCPayrollRuleMappingId == element.ProductCTCPayrollRuleMappingId).Id;
          // } else {
          element['defaultValue'] = lstProductGroup.find(x => x.IsDefault == true).Id;
          // }



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
    this.calculateCTC();

  }

  roundDown(number: number): number {
    return Math.floor(number);
  }
  roundUp(number: number): number {
    return Math.ceil(number);
  }
  nearest(number: number): number {
    return Math.round(number);
  }

  calculateCTC() {
    //Sum of all products which includes the foll types: Earning, OnCost and Deductions
    // let ctc = 0;
    // this.NewRt.forEach(element => {
    //   if (element.ProductTypeCode !== "Total") {
    //     ctc = ctc + (this.doCheckEditableAnnualPayComponent(element) ? 0 : element.Value)
    //   }
    // })

    // // Apply rounding method based on config
    // // if (this.roundingMethod === 'down') {
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
      console.log("Element value:", element.Value); // Add this line for debugging
      if (this.doCheckEditableAnnualPayComponent(element) && element.Value > 0) {
        totalCTCAmount += element.Value;
      } else if(element.Value > 0 && element.ProductCode != "GrossEarn" && element.ProductCode != "CTC") {
        totalCTCAmount += element.Value * 12;
      }
    });

    this.NewRt.forEach(element => {
      if (element.ProductCode == "CTC") {
        element.Value = Number(totalCTCAmount) /12;
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

      try {

        const output = { NewRt: this.NewRt, Activity: 'ReviewLater' };
        this.activeModal.close(output);
        // this.employeedetails.EmployeeRatesets[0].RatesetProducts = [];
        // this.employeedetails.EmploymentContracts[0].LstRateSets[0].RatesetProducts = [];
        // this.employeedetails.ELCTransactions[0].EmployeeRatesets[0].RatesetProducts = [];
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

      let selectedSalaryBreakupType = this.NewELCTransaction.EmployeeRatesets[0].SalaryBreakUpType;
      console.log('selectedSalaryBreakupType', selectedSalaryBreakupType);
      let annualSalaryAmount = this.NewELCTransaction.EmployeeRatesets[0].AnnualSalary;



      if (this.NewRt && this.NewRt.length > 0 && selectedSalaryBreakupType == 2) {
        var GrossEarnAmount = this.NewRt.find(a => a.ProductCode.toUpperCase() == 'GROSSEARN') ? this.NewRt.find(a => a.ProductCode.toUpperCase() == 'GROSSEARN').Value * 12 : 0;

        // if (GrossEarnAmount != annualSalaryAmount) {
        //   this.alertService.showInfo("The Gross Earning amount is not same as your annual salary. Please review and update");
        //   return;
        // }
      }
      if (this.NewRt && this.NewRt.length > 0 && selectedSalaryBreakupType == 1) {
        var CTCAmount = this.NewRt.find(a => a.ProductCode.toUpperCase() == 'CTC') ? this.NewRt.find(a => a.ProductCode.toUpperCase() == 'CTC').Value * 12 : 0;

        // if (CTCAmount != annualSalaryAmount) {
        //   this.alertService.showInfo("The CTC amount is not same as your annual salary. Please review and update");
        //   return;
        // }

      }

      if (this.NewRt && this.NewRt.length > 0 && selectedSalaryBreakupType == 3) {
        var NetPayAmount = this.NewRt.find(a => a.ProductCode.toUpperCase() == 'NETPAY') ? this.NewRt.find(a => a.ProductCode.toUpperCase() == 'NETPAY').Value * 12 : 0;

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
        const output = { NewRt: this.NewRt, Activity: 'Confirm' };
        this.activeModal.close(output);
        return;

      }).catch(error => {
        return;
      });
      return;
    }

    if (this.IsRateSetValue == false) {
      const output = { NewRt: this.NewRt, Activity: 'Confirm' };
      this.activeModal.close(output);
      this.alertService.showInfo("Hi there!, Changes you made may not be valid");
      return;
    }
    if (!this.isRecalculate) {
      this.alertService.showInfo("Some Breakup products will not be avaliable until you re-calculate it.");
      return;
    } else {

      const output = { NewRt: this.NewRt, Activity: 'Confirm' };
      this.activeModal.close(output);
      // $('#popup_new_salary_breakup').modal('hide');
    }

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

  recalculateCTC(): void {
    const output = { NewRt: this.NewRt, Activity: 'RecalculateCTC' };
    this.activeModal.close(output);
  }
}
