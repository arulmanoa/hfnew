import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
// services

import { OnboardingService } from '../../../_services/service/onboarding.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { UIMode } from 'src/app/_services/model/UIMode';
import { CandidateOfferDetails, PaygroupProductOverrides } from 'src/app/_services/model/Candidates/CandidateOfferDetails';

import { AlertService } from '../../../_services/service/alert.service';
import { ExcelService } from '../../../_services/service/excel.service';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';

import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { PaymentType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { RateType } from 'src/app/_services/model/Candidates/CandidateRateSet';


@Component({
  selector: 'app-preview-ctc-modal',
  templateUrl: './preview-ctc-modal.component.html',
  styleUrls: ['./preview-ctc-modal.component.css']
})
export class PreviewCtcModalComponent implements OnInit {

  @Input() id: number = 0;
  @Input() ClientContractId: any;
  @Input() jsonObj: any;
  @Input() newCandidateOfferObj: any;
  @Input() PayGroupId: any;
  @Input() baseDaysForAddlApplicableProduct?: any;


  isloading: boolean = false;
  IsMinimumwageAdhere: boolean = true;
  IsRateSetValue: boolean = true;
  CalculationRemarks: any;

  oldJsonObj: any;
  _oldCandidateOfferDetails: any;
  isRecalculate: boolean = true;

  _newCandidateOfferDetails: CandidateOfferDetails;
  MigrationInfoGrp: MigrationInfo;
  lstOfPaygroupOverrideProducts = [];
  isDailyOrHourlyWages = false;
  wageTypeString: string = 'Daily';
  isOverrideMonthlyValue = false;
  _loginSessionDetails: LoginResponses;
  BusinessType: any;
  baseHoursForAddlApplicableProduct: number = 1;
  wageType: number;

  constructor(

    private activeModal: NgbActiveModal,
    private onboardingService: OnboardingService,
    private alertService: AlertService,
    private excelService: ExcelService,
    public sessionService: SessionStorage,
    private utilService: UtilityService

  ) {

    this.oldJsonObj = this.jsonObj;
    console.log(this.oldJsonObj);


  }

  ngOnInit() {


    console.log('ClientContractId', this.ClientContractId);

    console.log('preview', this.newCandidateOfferObj);

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    console.log('Session Details :: ', this._loginSessionDetails);
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    
    this.isloading = true;
    this.jsonObj = _.filter(this.jsonObj, (a => a.IsDisplayRequired));
    this.jsonObj = _.orderBy(this.jsonObj, ["DisplayOrder"], ["asc"]);
    this._newCandidateOfferDetails = this.newCandidateOfferObj;
    this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = this.jsonObj;
    this.IsMinimumwageAdhere = this.newCandidateOfferObj.IsMinimumwageAdhere;
    this.CalculationRemarks = this.newCandidateOfferObj.CalculationRemarks;
    this.IsRateSetValue = this.newCandidateOfferObj.IsRateSetValid;
    this.isloading = false;
    this.getMigrationMasterInfo(this.ClientContractId);
    // (this._newCandidateOfferDetails.LstPayGroupProductOverrRides == null || this._newCandidateOfferDetails.LstPayGroupProductOverrRides.length == 0) &&  this.getMigrationMasterInfo(this.ClientContractId);
    // this._newCandidateOfferDetails.LstPayGroupProductOverrRides != null && this._newCandidateOfferDetails.LstPayGroupProductOverrRides.length != 0 && (this.lstOfPaygroupOverrideProducts = this._newCandidateOfferDetails.LstPayGroupProductOverrRides);
    // this._newCandidateOfferDetails.LstPayGroupProductOverrRides != null && this._newCandidateOfferDetails.LstPayGroupProductOverrRides.length != 0 && this._update_tableStructure();
  }


  closeModal() {


    if (this.IsRateSetValue == false) {

      this.alertService.showInfo("Hi there!, Changes you made may not be valid");

    } else {

      this._oldCandidateOfferDetails = JSON.parse(sessionStorage.getItem("LstRateSet"));
      console.log(this._oldCandidateOfferDetails);
      console.log(this.jsonObj);

      let results = this.jsonObj != null && this.jsonObj.filter(o1 => this._oldCandidateOfferDetails.some(o2 => o1.ProductCode == o2.ProductCode && o1.Value == o2.Value));

      if (!this.isRecalculate) {
        this.alertService.showInfo("Some Breakup products will not be avaliable until you re-calculate it.");
        return;
      } else {
        this._build_PaygroupOverride().then((res) => {
          console.log(' this._newCandidateOfferDetails.LstPayGroupProductOverrRides', this._newCandidateOfferDetails.LstPayGroupProductOverrRides);

          this.activeModal.close(this._newCandidateOfferDetails);

        });
      }

    }
    console.log('test', this._newCandidateOfferDetails);

  }

  _build_PaygroupOverride() {
    return new Promise((resolve, reject) => {
      var tempList = [];
      this.jsonObj.forEach(obj => {
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
      this._newCandidateOfferDetails.LstPayGroupProductOverrRides = tempList;
      resolve(tempList);
    });

  }

  onChangeAmount(event, item): void {

    console.log(event);

    this.jsonObj.forEach(element => {

      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.Value = Number(event);
        element.PaymentType = 0;
        element.BillingType = 0;
      }


    });
    this.isRecalculate = false;
  }

  onWageTypeChangeFn(e): void {
    if (this.isDailyOrHourlyWages) {
      this._newCandidateOfferDetails.LstCandidateRateSet[0].WageType = this.wageTypeString == 'Hourly' ? RateType.Hourly : RateType.Daily;
      this.setDefaultValuesForWageRateSetProducts();
    }
  }

  setDefaultValuesForWageRateSetProducts() {
    for (const el of this.jsonObj) {
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
  

  onChangePayRateAmount(event, item): void {
    console.log(event);
    this.jsonObj.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.PaymentType = this.wageType;
        element.PayableRate = Number(event);
        element.BillingType = this.wageType;
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
    this.jsonObj.forEach(element => {
      if (item.ProductId == element.ProductId) {
        element.Modetype = UIMode.Edit;
        element.BillingType = this.wageType;
        element.BillableRate = Number(event);
      }
    });
    this.isRecalculate = false;
  }

  onChangePayGroup(e,i): void {
    this.isRecalculate = false;
  }

  getMigrationMasterInfo(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {



      let apiResult: apiResult = (result);
      console.log(apiResult);

      if (apiResult.Status && apiResult.Result != null) {
        var offerMasterInfo = JSON.parse(apiResult.Result);
        this.MigrationInfoGrp = offerMasterInfo[0];
        console.log('this.MigrationInfoGrp', this.MigrationInfoGrp);

        if (this.MigrationInfoGrp && this.MigrationInfoGrp.ClientContractOperationList 
          && this.MigrationInfoGrp.ClientContractOperationList.length > 0) {
            
          const clientContractOperationObj = this.MigrationInfoGrp.ClientContractOperationList[0];
          // check wageType key is present in the object
          this.wageType = clientContractOperationObj.hasOwnProperty('WageType') ?
          clientContractOperationObj.WageType : 0;

          this.baseHoursForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasehours') ?
          clientContractOperationObj.BreakupBasehours : 1;
  
          if (this.wageType === 1) {
            this.wageTypeString = 'Hourly';
            this.isDailyOrHourlyWages = true;
          } else if (this.wageType === 2) {
            this.wageTypeString = 'Daily';
            this.isDailyOrHourlyWages = true;
          } else {
            this.wageTypeString = 'Monthly';
            this.isDailyOrHourlyWages = false;
            this.baseDaysForAddlApplicableProduct = 0;
          }
        
        }
        this.lstOfPaygroupOverrideProducts = this.MigrationInfoGrp.PaygroupProductOverridesList;
        this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0 && ( this.lstOfPaygroupOverrideProducts = this.lstOfPaygroupOverrideProducts.filter(item=>item.PayGroupId == this.PayGroupId));
        this._update_tableStructure();


      } else {

      }

    }), ((error) => {

    })
  }
  _update_tableStructure() {
    var lstProductGroup = [];
    this.jsonObj.forEach(element => {
      lstProductGroup = [];
      console.log('lst', this.lstOfPaygroupOverrideProducts);
      if (this.lstOfPaygroupOverrideProducts != null && this.lstOfPaygroupOverrideProducts.length > 0) {
        var isExistProduct = this.lstOfPaygroupOverrideProducts.find(a => a.ProductId == element.ProductId);
        if (isExistProduct != undefined) {
          lstProductGroup = (this.lstOfPaygroupOverrideProducts.filter(a => a.ProductId == element.ProductId))
          console.log('lst', lstProductGroup);
          
          element['IsOverridableProductGroup'] = true;
          element['lstOfProducts'] = lstProductGroup;
          element['defaultValue'] = lstProductGroup.find(x => x.IsDefault == true).Id;
          this._newCandidateOfferDetails.LstPayGroupProductOverrRides != null && this._newCandidateOfferDetails.LstPayGroupProductOverrRides.length > 0 && (element.defaultValue = this._newCandidateOfferDetails.LstPayGroupProductOverrRides.find(x => x.ProductId == element.ProductId).Id);
        } else {
          element['IsOverridableProductGroup'] = false;
        }
      }
      else {
        element['IsOverridableProductGroup'] = false;

      }
    });


    this._newCandidateOfferDetails.LstPayGroupProductOverrRides
    if (this.isDailyOrHourlyWages) {
      this._newCandidateOfferDetails.LstCandidateRateSet[0].WageType = this.wageTypeString == 'Hourly' ? RateType.Hourly : RateType.Daily;
      this.setDefaultValuesForWageRateSetProducts();
    }
    console.log('list of obj', this.jsonObj);
  }



  doCalculateCTC(): void {
    this._build_PaygroupOverride().then((result) => {


      this.isRecalculate = true;
      this.isloading = true;
      this.IsMinimumwageAdhere = true;
      this.IsRateSetValue = true;
      this.CalculationRemarks = null;
      this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = this.jsonObj;
      console.log(this.jsonObj);
      this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(this._newCandidateOfferDetails))).subscribe((res) => {
        let apiResult: apiResult = res;
        try {
          if (apiResult.Status) {

            let _LstSalaryBreakUp: any = (apiResult.Result);
            console.log('new', _LstSalaryBreakUp);
            let LstRateSet = _LstSalaryBreakUp.LstCandidateRateSet[0].LstRateSet;
            this._newCandidateOfferDetails = _LstSalaryBreakUp;
            this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = LstRateSet;

            this.jsonObj = LstRateSet;
            this.jsonObj = _.filter(this.jsonObj, (a => a.IsDisplayRequired));
            this.jsonObj = _.orderBy(this.jsonObj, ["DisplayOrder"], ["asc"]);
            this.oldJsonObj = [];
            this.oldJsonObj = LstRateSet;
            this.IsMinimumwageAdhere = _LstSalaryBreakUp.IsMinimumwageAdhere;
            this.CalculationRemarks = _LstSalaryBreakUp.CalculationRemarks;
            this.IsRateSetValue = _LstSalaryBreakUp.IsRateSetValid;
            this.isloading = false;
            this.alertService.showSuccess("Well done! Salary breakup calculated")
            console.log('da', this.CalculationRemarks);
            this._update_tableStructure();


          } else {
            console.log('ds', this.CalculationRemarks);
            this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = [];
            this.jsonObj = [];
            this.jsonObj = this.oldJsonObj;
            this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = this.oldJsonObj;
            this.isloading = false;
            this.alertService.showInfo("An error occurred, while trying to calculate. Please try again! " + apiResult.Message)
            this._update_tableStructure();


          }
        }
        catch (Exception) {

          this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = [];
          this.jsonObj = [];
          this.jsonObj = this.oldJsonObj;
          this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = this.oldJsonObj
          this.alertService.showInfo("An error occurred, while trying to calculate. Please try again! " + apiResult.Message + Exception)
          this._update_tableStructure();

        }

        console.log(apiResult.Result);


      }), ((err) => {
        this.isloading = false;
      })
    })
  }


  reviewLater() {

    this.alertService.confirmSwal("Confirmation?", "This will clear the current salary breakup, however you must calculate breakup before submitting this request.", "OK, Yes").then(result => {

      this._newCandidateOfferDetails.LstCandidateRateSet[0].LstRateSet = null;
      this._newCandidateOfferDetails.IsRateSetValid = true;
      this._newCandidateOfferDetails.IsMinimumwageAdhere = true;

      this.activeModal.close(this._newCandidateOfferDetails);

    })
      .catch(error => {
        this.closeModal();
      });
  }

  exportAsXLSX(): void {
    let exportExcelDate = [];
    console.log(' this.jsonObj',  this.jsonObj);
    
    this.jsonObj.forEach(element => {
      const exportData: any = {
        ProductCode: element.ProductCode,
        ProductName: element.DisplayName,
        Monthly: element.Value,
        Annually: (Number(element.Value) * 12)
      };
    
      if (this.isDailyOrHourlyWages) {
        const wageType = this.wageTypeString === 'Daily' ? 'Daily' : 'Hourly';
        exportData[`${wageType} Pay Rate`] = element.PayableRate;
        if (this.BusinessType == 3) {
          exportData[`${wageType} Bill Rate`] = element.BillableRate;
        }
      }
      
    
      exportExcelDate.push(exportData);
    });    

    this.excelService.exportAsExcelFile(exportExcelDate, 'Paystructure');
  }

}
