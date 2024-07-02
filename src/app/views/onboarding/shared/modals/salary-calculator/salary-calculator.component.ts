import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, ClientLocationService, FileUploadService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Gender, OnBoardingType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { CountryList, StateList } from 'src/app/_services/model/ClientLocationAllList';
import _ from 'lodash';
import { MigrationInfo, PayPeriodList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { ClientLocationList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { CandidateOfferDetails, RequestType } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { CandidateRateset } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { AddressDetails, CommunicationCategoryType, ContactDetails } from 'src/app/_services/model/Communication/CommunicationType';
import { CandidateDetails, CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
import { CandidateCommunicationDetails } from 'src/app/_services/model/Candidates/CandidateCommunicationDetails';
import moment from 'moment';
import { RelationShip } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { CandidateModel, _CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SalaybreakupdetailsComponent } from '../salaybreakupdetails/salaybreakupdetails.component';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { Documents } from 'src/app/_services/model/OnBoarding/Document';
import { DatePipe } from '@angular/common';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';
import { ApprovalStatus, CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { DocumentInfo } from 'src/app/_services/model/OnBoarding/DocumentInfo';
import * as JSZip from 'jszip'; //JSZip
import { BankModalComponent } from 'src/app/shared/modals/bank-modal/bank-modal.component';
import { BankList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { OfferInfo } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-salary-calculator',
  templateUrl: './salary-calculator.component.html',
  styleUrls: ['./salary-calculator.component.scss']
})
export class SalaryCalculatorComponent implements OnInit {

  @Input() defaultSearchInputs: any = {
    ClientContractId: 0,
    ClientId: 0,
    ClientName: "",
    ClientContractName: ""
  };
  @Input() BusinessType: number = 0;

  RoleId: number = 0;
  RoleCode: string = "";
  CompanyId: number = 0;
  CandidateId: number = 0;
  UserId: number = 0;

  spinner: boolean = false;

  napsForm: FormGroup;
  submitted: boolean = false;
  LstGender: any = [];

  modalOption: NgbModalOptions = {};
  DOBmaxDate: Date;

  PayGroupId: number = 0;
  LstPayGroupProductOverrRides = [];
  StateId: number = 0;
  CityId: number = 0;
  SkillCategoryId: number = 0;
  ZoneId: number = 0;
  IndustryId: number = 0;
  MigrationInfoGrp: MigrationInfo[];
  LstSalaryBreakUpType: any = [];
  LstTeam: any;
  LstClientLocation: ClientLocationList[] = []
  LstInsurance: any[] = [];
  LstPayPeriod: PayPeriodList[] = []
  LstPayGroup: any[] = [];
  LstIndustry: any[] = [];
  LstSkillCategory: any[] = [];
  LstZone: any[] = [];
  LstCity: any[] = [];
  PaygroupProductOverridesList = [];

  OfferInfoListGrp1: OfferInfo;

  regionJson = {
    StateList: [],
    CityList: []
  }
  MasterDate = {
    IndustryList: [],
    PayGroupList: [],
    PaygroupProductOverridesList: []
  };

  IsFailedStatus: boolean = false;
  CalculationRemarks: string = "";

  obs: Subscription;

  constructor(
    private formBuilder: FormBuilder,
    private sessionService: SessionStorage,
    private router: Router,
    private activeModal: NgbActiveModal,
    private onboardingService: OnboardingService,
    private alertService: AlertService,
    private utilityService: UtilityService,
    private utilsHelper: enumHelper,
    private clientLocationService: ClientLocationService,
    private loadingScreenService: LoadingScreenService,
    public modalService: NgbModal,
    private datePipe: DatePipe,
    private fileuploadService: FileUploadService
  ) {
    this.createReactiveForm();
  }

  get g() { return this.napsForm.controls; } // reactive forms validation 

  createReactiveForm() {
    this.napsForm = this.formBuilder.group({
      Gender: [null, [Validators.required]],
      DOB: ['2001-01-01'],
      Stipend: [null, [Validators.required]],
      WorkLocation: [null],
      SalaryType: [null, [Validators.required]],
      PayGroupId: [null, [Validators.required]],
      Industry: [null],
      SkillCategory: [null],
      Zone: [null],
      State: [null, [Validators.required]],
      City: [null, [Validators.required]],
      IsMinimumWagesEnabled: [false]

    });
  }
  ngOnInit() {
    fetch('assets/json/regionList.json').then(res => res.json())
      .then(jsonData => {
        console.log('Region List :::::', jsonData);
        this.regionJson = jsonData;

      });

    console.log('BusinessType', this.BusinessType);

    console.log('defaultSearchInputs', this.defaultSearchInputs);
    this.LstGender = this.utilsHelper.transform(Gender);
    this.LstSalaryBreakUpType = this.utilsHelper.transform(SalaryBreakUpType);
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.DOBmaxDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);
    this.onChangeValidation();

    this.GetLookUpDetailsForSB(this.defaultSearchInputs.ClientContractId).then((response) => { });
  }

  onChangeValidation() {


    if (this.napsForm.get('IsMinimumWagesEnabled').value == true) {
      this.updateValidation(true, this.napsForm.get('Industry'));
      this.updateValidation(true, this.napsForm.get('SkillCategory'));
      this.updateValidation(true, this.napsForm.get('Zone'));
      // this.BusinessType != 3 ? this.updateValidation(true, this.napsForm.get('WorkLocation')) : true;
      // this.BusinessType == 3 ? this.updateValidation(true, this.napsForm.get('State')) : true;
      // this.BusinessType == 3 ? this.updateValidation(true, this.napsForm.get('City')) : true;
    }
    else {
      this.updateValidation(false, this.napsForm.get('Industry'));
      this.updateValidation(false, this.napsForm.get('SkillCategory'));
      this.updateValidation(false, this.napsForm.get('Zone'));
      // this.BusinessType != 3 ? this.updateValidation(false, this.napsForm.get('WorkLocation')) : true;
      // this.BusinessType == 3 ? this.updateValidation(false, this.napsForm.get('State')) : true;
      // this.BusinessType == 3 ? this.updateValidation(false, this.napsForm.get('City')) : true;
    }
  }



  doCancel(_actionName): void {
    this.activeModal.close(_actionName);
  }

  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  GetLookUpDetailsForSB(ClientContractId) {

    this.spinner = true;
    const promise = new Promise((res, rej) => {
      this.obs = this.onboardingService.GetLookUpDetailsForSB(ClientContractId).subscribe((result: apiResponse) => {
        let apiResult: apiResponse = (result);
        this.spinner = false;
        if (apiResult.Status && apiResult.dynamicObject != null) {
          this.MasterDate = {
            IndustryList: [],
            PayGroupList: [],
            PaygroupProductOverridesList: []
          }
          this.MasterDate = apiResult.dynamicObject as any;
          this.LstPayGroup = this.MasterDate.PayGroupList;
          this.LstIndustry = this.MasterDate.IndustryList;
        }
        else {

        }

      }), ((error) => {

      })
    });

    return promise;

  }
  // getMigrationMasterInfo(ClientContractId) {
  //   this.spinner = true;
  //   const promise = new Promise((res, rej) => {
  //     this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result: apiResult) => {
  //       let apiResult: apiResult = (result);
  //       this.spinner = false;
  //       if (apiResult.Status && apiResult.Result != null) {
  //         this.MigrationInfoGrp = JSON.parse(apiResult.Result);
  //         console.log('this.MigrationInfoGrp', this.MigrationInfoGrp);
  //         this.MigrationInfoGrp && this.MigrationInfoGrp.length > 0 ? this.LstClientLocation = this.MigrationInfoGrp[0].ClientLocationList : true;
  //         this.MigrationInfoGrp && this.MigrationInfoGrp.length > 0 ? this.IndustryId = this.MigrationInfoGrp[0].DefaultIndustryId : true;
  //         this.LstTeam = this.MigrationInfoGrp;
  //       }
  //       else {

  //       }

  //     }), ((error) => {

  //     })
  //   });

  //   return promise;
  // }
  onChangePayStructure(item, from_action) {
    this.PayGroupId = item.PayGroupId;
    this.LstPayGroupProductOverrRides = this.MasterDate.PaygroupProductOverridesList && this.MasterDate.PaygroupProductOverridesList.length > 0 ? this.MasterDate.PaygroupProductOverridesList.filter(a => a.PayGroupId == item.PayGroupId) : [];

  }

  onChangeMinimumWages(e) {
    this.onChangeValidation();
  }

  onChangeState(event) {
    this.StateId = event.Id;
    this.napsForm.controls['City'].setValue(null);
    this.napsForm.controls['SkillCategory'].setValue(null);
    this.napsForm.controls['Zone'].setValue(null);
    this.LstCity = this.regionJson.CityList.length > 0 ? this.regionJson.CityList.filter(a => a.StateId == event.Id) : [];
    this.getSkillnZoneByIndustrynStateId();
  }

  getSkillnZoneByIndustrynStateId() {

    if (this.IndustryId && this.StateId) {
      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {
          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.LstSkillCategory = [];
            this.LstZone = [];
            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            this.LstSkillCategory = this.OfferInfoListGrp1.SkillCategoryList;
            this.LstZone = this.OfferInfoListGrp1.ZoneList;
          }
        },
          ((err) => {

          }));
    }
  }

  onChangeSalary(event) {
    // this.LstPayGroup = this.MasterDate.PayGroupList.filter(a => a.SalaryBreakupType == event.Id);
  }

  onChangeTeam(item, from_action) {

    let filterList = this.LstTeam && this.LstTeam.length > 0 ? this.LstTeam.find(a => a.Id == item.Id) : null;
    if (filterList) {
      this.LstInsurance = filterList.InsuranceList;
      this.LstPayPeriod = filterList.PayPeriodList;
      this.PayGroupId = filterList.PayGroupId;
      this.LstPayGroupProductOverrRides = [];
      this.LstPayGroupProductOverrRides = filterList.PaygroupProductOverridesList && filterList.PaygroupProductOverridesList.length > 0 ? filterList.PaygroupProductOverridesList.filter(a => a.PayGroupId == this.PayGroupId) : [];
    }
  }

  onChangeWorkLocation(event: ClientLocationList) {
    if (event != null) {
      this.StateId = event.StateId;
      this.CityId = event.CityId;
      this.SkillCategoryId = event.DefaultSkillCategoryId;
      this.ZoneId = event.DefaultZoneId;
    }
  }

  onChangeIndustry(event) {
    this.napsForm.controls['SkillCategory'].setValue(null);
    this.napsForm.controls['Zone'].setValue(null);
    this.IndustryId = event.Id;
    this.getSkillnZoneByIndustrynStateId();
  }

  PreviewSalaryBreakup() {
    this.submitted = true;
    this.IsFailedStatus = false;
    this.CalculationRemarks = "";

    if (this.napsForm.invalid) {
      this.alertService.showWarning('You must have filled out all the required fields and try to verify');
      return;
    }

    this.spinner = true;
    var candidateR = new CandidateRateset();
    candidateR.AnnualSalary = this.napsForm.get('Stipend').value;
    candidateR.IsMonthlyValue = false;
    candidateR.LstRateSet = null;
    candidateR.MonthlySalary = this.napsForm.get('Stipend').value / 12;
    candidateR.PayGroupdId = this.napsForm.get('PayGroupId').value == null ? 0 : this.napsForm.get('PayGroupId').value;
    candidateR.Salary = this.napsForm.get('Stipend').value;
    candidateR.SalaryBreakUpType = this.napsForm.get('SalaryType').value;

    var candidateOffer = new CandidateOfferDetails();
    candidateOffer.ActualDateOfJoining = moment(new Date()).format('YYYY-MM-DD');
    candidateOffer.CalculationRemarks = "";
    candidateOffer.CityId = this.napsForm.get('City').value == null ? 0 : this.napsForm.get('City').value;;
    candidateOffer.ClientContractId = this.defaultSearchInputs.ClientContractId;
    candidateOffer.ClientId = this.defaultSearchInputs.ClientId;
    candidateOffer.DateOfJoining = moment(new Date()).format('YYYY-MM-DD');
    candidateOffer.Gender = this.napsForm.get('Gender').value;
    candidateOffer.IndustryId = this.napsForm.get('Industry').value == null ? 0 : this.napsForm.get('Industry').value;;
    candidateOffer.IsMinimumwageAdhere = false;
    candidateOffer.IsRateSetValid = false;
    candidateOffer.Location = this.napsForm.get('WorkLocation').value == null ? 0 : this.napsForm.get('WorkLocation').value;
    candidateOffer.SkillCategory = this.napsForm.get('SkillCategory').value == null ? 0 : this.napsForm.get('SkillCategory').value;
    candidateOffer.State = this.StateId;
    candidateOffer.Zone = this.napsForm.get('Zone').value == null ? 0 : this.napsForm.get('Zone').value;
    candidateOffer.LstCandidateRateSet = [];
    candidateOffer.LstCandidateRateSet.push(candidateR);
    candidateOffer.LstPayGroupProductOverrRides = this.LstPayGroupProductOverrRides;
    candidateOffer.IsMinimumWageCheckNotRequired = this.napsForm.get('IsMinimumWagesEnabled').value == false ? true : false;

    console.log('candidateOffer', candidateOffer);
    this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(candidateOffer))).subscribe((res) => {
      let apiResult: apiResult = res;
      this.spinner = false;

      console.log('apiResult', apiResult);

      if (apiResult.Status) {
        var offerDetails: CandidateOfferDetails = apiResult.Result as any;

        try {
          const modalRef = this.modalService.open(SalaybreakupdetailsComponent, this.modalOption);
          modalRef.componentInstance.id = 0;
          modalRef.componentInstance.baseDaysForAddlApplicableProduct = null;
          modalRef.componentInstance.PayGroupId = 5;
          modalRef.componentInstance.ClientContractId = 0
          modalRef.componentInstance.jsonObj = offerDetails.LstCandidateRateSet[0].LstRateSet;
          modalRef.componentInstance.newCandidateOfferObj = offerDetails;
          modalRef.componentInstance.fromComponent = "SalaryCalculator";
          modalRef.componentInstance.IsMinimumWageCheckNotRequired = offerDetails.IsMinimumWageCheckNotRequired;


          modalRef.result.then((result) => {

          }).catch((error) => {
            console.log(error);
          });


        } catch (error) {

          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(error);
        }
      }
      else {
        this.IsFailedStatus = true;
        this.CalculationRemarks = apiResult.Message;
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
      }

      console.log(apiResult.Result);


    }), ((err) => {

    })
  }

  ngOnDestroy() {
    this.obs.unsubscribe();
  }


}
