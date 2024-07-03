import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, ClientLocationService, FileUploadService, HeaderService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Gender, OnBoardingType, Relationship } from 'src/app/_services/model/Base/HRSuiteEnums';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { CountryList, StateList } from 'src/app/_services/model/ClientLocationAllList';
import _ from 'lodash';
import { CostCodeList, MigrationInfo, PayPeriodList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { ClientLocationList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { CandidateOfferDetails, RequestType, SourceType, TenureType } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { CandidateRateset } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { AddressDetails, CommunicationCategoryType, ContactDetails } from 'src/app/_services/model/Communication/CommunicationType';
import { ApprovalFor, Approvals, ApproverType, CandidateDetails, CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
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
import { ApprovalStatus, CandidateDocuments, DocumentVerificationMode } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { DocumentInfo } from 'src/app/_services/model/OnBoarding/DocumentInfo';
import * as JSZip from 'jszip'; //JSZip
import { BankModalComponent } from 'src/app/shared/modals/bank-modal/bank-modal.component';
import { BankList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { BankBranchIdentifierType, CandidateBankDetails } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { environment } from 'src/environments/environment';
import { CandidateOtherData, CandidateStatutoryDetails } from 'src/app/_services/model/Candidates/CandidateOtherData';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { ApprovalModalComponent } from 'src/app/shared/modals/approval-modal/approval-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { UserInterfaceControlLst, WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import Swal from 'sweetalert2';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';


export interface aadhaarResponse {
  address: {
    splitAddress: {

      country: "",
      district: "",
      houseNumber: "",
      landmark: "",
      location: "",
      pincode: "",
      postOffice: "",
      state: "",
      street: "",
      subdistrict: "",
      vtcName: ""
    },
    combinedAddress: ""
  },
  dob: "",
  emailHash: "",
  fatherName: "",
  file: {
    pdfContent: "",
    xmlContent: ""
  },
  gender: "",
  image: "",
  name: "",
  mobileHash: "",
  maskedAadhaarNumber: ""
};

@Component({
  selector: 'app-naps-onboarding',
  templateUrl: './naps-onboarding.component.html',
  styleUrls: ['./naps-onboarding.component.scss']
})
export class NapsOnboardingComponent implements OnInit, OnDestroy {

  @Input() defaultSearchInputs: any = {
    ClientContractId: 0,
    ClientId: 0,
    ClientName: "",
    ClientContractName: "",
    IsNapBased: false,
    IsReOnboard: false
  };
  @Input() CandidateBasicDetails: any = null;
  @Input() CandidateId: number = 0;

  RoleId: number = 0;
  RoleCode: string = "";
  CompanyId: number = 0;
  UserId: number = 0;
  sessionDetails: LoginResponses;
  isMobileResolution: boolean = false;
  BusinessType: number;
  clientLogoLink: any;
  clientminiLogoLink: any;
  UserName: string = "";
  ImplementationCompanyId: number = 0;
  accessControl_submit: UserInterfaceControlLst = new UserInterfaceControlLst;

  ClientId: number = 3;
  ClientContractId: number = 4;

  apispinner: boolean = false;
  spinner: boolean = false;

  napsForm: FormGroup;
  submitted: boolean = false;
  LstGender: any = [];

  index: number = 1;
  DOBmaxDate: Date;

  minDate: Date;
  maxDate: Date;

  CountryList: CountryList[] = [];
  StateList: StateList[] = [];
  StateList1: StateList[] = [];

  present_CountryId: number = 0;
  present_StateId: number = 0;

  permanent_CountryId: number = 0;
  permanent_StateId: number = 0;

  PayGroupId: number = 0;
  LstPayGroupProductOverrRides = [];
  StateId: number = 0;
  CityId: number = 0;
  SkillCategoryId: number = 0;
  ZoneId: number = 0;
  IndustryId: number = 0;
  MigrationInfoGrp: MigrationInfo[];
  LstTeam: any;
  LstClientLocation: ClientLocationList[] = []
  LstInsurance: any[] = [];
  LstPayPeriod: PayPeriodList[] = []
  IsVanBasedAccount: boolean = false;
  IsTeamNapsBased: boolean = false;
  IsNapsBasedContract: boolean = false;
  EndDateMinDate: Date = new Date();
  lstContactDetails: ContactDetails[] = [];
  lstAddressDetails: AddressDetails[] = [];
  candidateModel: CandidateModel = new CandidateModel();

  modalOption: NgbModalOptions = {};

  // Documents
  DocumentInfoListGrp: DocumentInfo;
  DocumentList: Documents[] = [];
  DocumentCategoryist = [];
  documentTbl = [];
  edit_document_lst = [];
  lstDocumentDetails: CandidateDocuments[] = [];
  IsAadhaarKYC: boolean = false;
  isAssamState: boolean = false;

  // EDIT
  ApprovalStatus: any;
  ApprovalRemarks: string;

  // BANK
  LstBank: any[] = [];
  isDuplicateBankInfo: any;
  bankDocList: any[] = [];//jszip
  BankList: BankList[] = [];
  deletedLstBank = [];
  lstBankDetails: CandidateBankDetails[] = [];

  unsavedDocumentLst = [];

  IsRateSetCalculated: boolean = false;

  // CLIENT APPROVALS
  deletedLstClientApproval = [];
  clientApprovalTbl = [];
  lstClientApporval: Approvals[] = [];
  ApprovalForList: any = [];
  ApprovalTypeList: any = [];

  documentURL: any;
  documentURLId: any;
  // Multiple File Upload
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  docList: any[];//jszip
  contentmodalurl: any;

  Id: number = 0;
  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  _OldCandidateDetails: CandidateDetails = new CandidateDetails();
  lstDocumentDetails_additional: CandidateDocuments[] = [];
  rejectedLst = [];

  candidateOfferBreakupDetails: CandidateOfferDetails = null;

  // aadhaar

  aadhaarDetails: aadhaarResponse = null;
  KYCProfileDocumentId: number = 0;
  KYCAadhaarDocumentId: number = 0;
  IsUANKYC: boolean = false;

  candidateStatutoryDetails: CandidateStatutoryDetails = new CandidateStatutoryDetails;
  lstStatutoryDetails: CandidateStatutoryDetails[] = [];

  CostCodeList: CostCodeList[] = [];
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
    private fileuploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private utitlityService: UtilityService,
    private headerService: HeaderService

  ) {
    this.createReactiveForm();
    this.detectScreenSize();
  }
  ngAfterViewInit() {
    this.detectScreenSize();
  }
  private detectScreenSize() {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

  get g() { return this.napsForm.controls; } // reactive forms validation 

  createReactiveForm() {
    const urlRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    this.napsForm = this.formBuilder.group({
      FirstName: ['', [Validators.required]],
      ApprenticeCode: ['', [Validators.required]],
      AadhaarNumber: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern(urlRegex)]],
      Gender: [null, [Validators.required]],
      FathersName: [''],
      PrimaryEmail: ['', [Validators.required]],
      MobileNumber: [null, [Validators.required]],
      DOB: [null, [Validators.required]],
      Nationality: [null],
      IsDifferentlyAbled: [false],
      PANNumber: [''],

      permanentCommunicationCategoryTypeId: [''],
      permanentAddressdetails: [''],
      permanentAddressdetails1: [''],
      permanentAddressdetails2: [''],
      permanentStateName: [null],
      permanentCountryName: [100],
      permanentPincode: [''],
      permanentCity: [''],

      presentCommunicationCategoryTypeId: [''],
      presentAddressdetails: [''],
      presentAddressdetails1: [''],
      presentAddressdetails2: [''],
      presentStateName: [null],
      presentCountryName: [100],
      presentPincode: [''],
      presentCity: [''],

      ContractCode: ['', [Validators.required]],
      Stipend: [0, [Validators.required]],
      Insurance: [null],
      WorkLocation: [null, [Validators.required]],
      Team: [null, [Validators.required]],
      StartDate: [null, [Validators.required]],
      EndDate: [null, [Validators.required]],
      PayPeriod: [null, [Validators.required]],
      CostCodeId: [null, [Validators.required]],
      PayGroup: [null, [Validators.required]],
      Gmc: [150000],
      Gpa: [300000],
      FixedDeductionAmount: [''],
      OnCostInsuranceAmount: [''],
      clientName: [this.defaultSearchInputs.ClientId, [Validators.required]],
      clientContract: [this.defaultSearchInputs.ClientContractId, [Validators.required]]


    });
  }

  ngOnInit() {
    console.log('defaultSearchInputs', this.defaultSearchInputs);
    console.log('CandidateBasicDetails', this.CandidateBasicDetails);
    console.log('CandidateId', this.CandidateId);

    fetch('assets/json/bankList.json').then(res => res.json())
      .then(jsonData => {
        console.log('Bank List :::::', jsonData);
        this.BankList = jsonData.BankList;
      });

    this.IsNapsBasedContract = this.defaultSearchInputs.IsNapBased;
    this.LstGender = this.utilsHelper.transform(Gender);
    this.ApprovalForList = this.utilsHelper.transform(ApprovalFor);
    this.ApprovalTypeList = this.utilsHelper.transform(ApproverType);
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.DOBmaxDate = new Date();
    this.minDate = new Date();
    this.maxDate = new Date();
    this.minDate.setFullYear(this.minDate.getFullYear() - 35);
    this.maxDate.setFullYear(this.maxDate.getFullYear() - 17);

    // this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.CompanyId = this.sessionDetails.Company.Id;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.ImplementationCompanyId = this.sessionDetails.ImplementationCompanyId;
    let userAccessControl = this.sessionDetails.UIRoles[0].UserInterfaceControls as any;
    this.accessControl_submit = userAccessControl.filter(a => a.ControlName == "btn_onboarding_submit");



    this.getCompanyLogo();



    if (this.CandidateId == 0 && this.CandidateBasicDetails) {
      this.napsForm.patchValue({
        FirstName: this.CandidateBasicDetails.CandidateName,
        AadhaarNumber: this.CandidateBasicDetails.AadhaarNumber,
        DOB: this.CandidateBasicDetails.DOB,
        FathersName: this.CandidateBasicDetails.FathersName,
        Gender: this.CandidateBasicDetails.Gender,
        MobileNumber: this.CandidateBasicDetails.MobileNumber,
        PANNumber: this.CandidateBasicDetails.PANNumber,
        PrimaryEmail: this.CandidateBasicDetails.PrimaryEmail,
        ApprenticeCode: this.CandidateBasicDetails.ApprenticeCode,
      });

      // this.napsForm.controls['FirstName'].disable();
      // this.napsForm.controls['DOB'].disable();
      // this.napsForm.controls['AadhaarNumber'].disable();
      // this.napsForm.controls['Gender'].disable();
      // this.napsForm.controls['MobileNumber'].disable();
      // this.napsForm.controls['PrimaryEmail'].disable();

      this.index = 3;
      // if (this.index == 2) {
      // this.getCountryList();
      // }
    }
    this.getMigrationMasterInfo(this.defaultSearchInputs.ClientContractId).then((response) => { this.spinner = false });

    if (this.CandidateId > 0) {
      this.init();
    }

    this.autoFill();

  }

  init() {
    this.spinner = true
    this.getCandidateDetailsById('New').then(result => {
      if (result) {
        this.getCountryList();
        this.spinner = false
      }

    })
  }

  getCompanyLogo() {

    this.clientLogoLink = 'logo.png';
    this.clientminiLogoLink = 'cielminilogo.png';

    if (this.sessionDetails.CompanyLogoLink != "" && this.sessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this.sessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;
    } else if (this.sessionDetails.ClientList != null && this.sessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this.sessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this.sessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this.sessionDetails.ClientList[0].ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      }
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

  mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
    }
  }

  getRequired(controlName) {
    return "*";
  }

  showAccordian(index) {
    this.index = index;
    if (this.index == 2) { // COMMUNICATION DETAILS
      this.CountryList.length == 0 ? this.getCountryList() : true;
    }
    if (this.index == 4) { // DOCUMENT DETAILS
      this.DocumentList.length == 0 ? this.onDocumentClick() : true;
    }
  }

  getMigrationMasterInfo(ClientContractId) {
    this.spinner = true;
    const promise = new Promise((res, rej) => {
      this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result: apiResult) => {
        let apiResult: apiResult = (result);

        if (apiResult.Status && apiResult.Result != null) {
          this.MigrationInfoGrp = JSON.parse(apiResult.Result);
          console.log('this.MigrationInfoGrp', this.MigrationInfoGrp);
          this.MigrationInfoGrp && this.MigrationInfoGrp.length > 0 ? this.LstClientLocation = this.MigrationInfoGrp[0].ClientLocationList : true;
          this.MigrationInfoGrp && this.MigrationInfoGrp.length > 0 ? this.IndustryId = this.MigrationInfoGrp[0].DefaultIndustryId : true;
          this.LstTeam = this.MigrationInfoGrp;

          this.getOnboardingMasterInfo('isDocumentInfo');

          if (this.CandidateId > 0 && this.napsForm.get('Team').value != null && this.napsForm.get('Team').value > 0) {
            let filterList = this.LstTeam && this.LstTeam.length > 0 ? this.LstTeam.find(a => a.Id == this.napsForm.get('Team').value) : null;
            if (filterList) {
              this.IsVanBasedAccount = filterList.IsVanBasedAccount;
              this.IsTeamNapsBased = filterList.IsNapBased;
              this.LstInsurance = filterList.InsuranceList;
              this.LstPayPeriod = filterList.PayPeriodList;
              this.CostCodeList = filterList.CostCodeList;
              this.PayGroupId = filterList.PayGroupId;
              this.LstPayGroupProductOverrRides = [];
              this.LstPayGroupProductOverrRides = filterList.PaygroupProductOverridesList && filterList.PaygroupProductOverridesList.length > 0 ? filterList.PaygroupProductOverridesList.filter(a => a.PayGroupId == this.PayGroupId) : [];

              if (this.LstClientLocation.length > 0 && this.napsForm.get('WorkLocation').value != null && this.napsForm.get('WorkLocation').value > 0) {
                this.StateId = this.LstClientLocation.find(a => a.Id == this.napsForm.get('WorkLocation').value).StateId;
                this.CityId = this.LstClientLocation.find(a => a.Id == this.napsForm.get('WorkLocation').value).CityId;
              }

            }
          }
          res(true);
        } else {
          res(true);
        }

      }), ((error) => {

      })
    });

    return promise;
  }

  getOnboardingMasterInfo(accordion_Name) {
    this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;
        if (apiResult.Status && apiResult.Result != "") {
          if (accordion_Name == "isDocumentInfo") {
            this.DocumentInfoListGrp = JSON.parse(apiResult.Result);
            this.DocumentCategoryist = this.DocumentInfoListGrp.DocumentCategoryist;
          }
        }
      }, (error) => {
      });

  }

  doCheckAadhaarMaxlength(event: any, formCtrl: any) {
    if (event.target.value.length > 12) {
      formCtrl.setValue(event.target.value.slice(0, 12));
    }
  }

  getCountryList(): void {
    this.apispinner = true;
    this.clientLocationService.getcountry()
      .subscribe((result) => {
        console.log('result', result);
        this.CountryList = result;
        if (this.CountryList && this.CountryList.length > 0) {
          this.CountryList = _.orderBy(this.CountryList, ["Name"], ["asc"]);
          this.CandidateId == 0 && this.StateList.length == 0 ? this.getStateList(this.napsForm.get('presentCountryName').value, "Edit") : true;
          this.napsForm.get('presentCountryName').value != null && this.CandidateId > 0 ? this.getStateList(this.napsForm.get('presentCountryName').value, "Edit") : true;
        }
        this.apispinner = false;
      });
  }

  onChangeCountry1(item, communicationType) {
    console.log('Country Ev :', item)
    try {
      this.permanent_CountryId = item.Id;
      this.getStateList(item.Id, communicationType);
    } catch (error) {
      console.log('#002 COUNTRY EX ::', error);
    }
  }

  onChangeCountry(item, communicationType) {
    console.log('Country Ev :', item)
    try {
      this.present_CountryId = item.Id;
      this.getStateList(item.Id, communicationType);
    } catch (error) {
      console.log('#002 COUNTRY EX ::', error);
    }

  }

  getStateList(countryId, communicationType): void {

    this.clientLocationService.getstate(countryId).subscribe((res) => {
      communicationType == 'Edit' ? (this.StateList = res, this.StateList1 = res) : communicationType == 'Present' ? this.StateList = res : communicationType == 'Permanent' ? this.StateList1 = res : true;
      if (this.StateList && this.StateList.length > 0) {
        this.StateList = this.StateList && this.StateList.length > 0 ? _.orderBy(this.StateList, ["Name"], ["asc"]) : [];
      }
      if (this.StateList1 && this.StateList1.length > 0) {
        this.StateList1 = this.StateList1 && this.StateList1.length > 0 ? _.orderBy(this.StateList1, ["Name"], ["asc"]) : [];
      }
    }), ((err) => {

    })
  }


  public onSameAddressPresentChanged(value: boolean) {

    if (value) {

      this.napsForm.controls['permanentAddressdetails'] != null ? this.napsForm.controls['permanentAddressdetails'].setValue(this.napsForm.get('presentAddressdetails').value) : null;
      this.napsForm.controls['permanentAddressdetails1'] != null ? this.napsForm.controls['permanentAddressdetails1'].setValue(this.napsForm.get('presentAddressdetails1').value) : null;
      this.napsForm.controls['permanentAddressdetails2'] != null ? this.napsForm.controls['permanentAddressdetails2'].setValue(this.napsForm.get('presentAddressdetails2').value) : null;
      this.napsForm.controls['permanentCountryName'] != null ? this.napsForm.controls['permanentCountryName'].setValue(this.napsForm.get('presentCountryName').value) : null;
      this.napsForm.controls['permanentPincode'] != null ? this.napsForm.controls['permanentPincode'].setValue(this.napsForm.get('presentPincode').value) : null;
      this.StateList1 = this.StateList;
      this.napsForm.controls['permanentStateName'] != null ? this.napsForm.controls['permanentStateName'].setValue(this.napsForm.get('presentStateName').value) : null;
      this.napsForm.controls['permanentCity'] != null ? this.napsForm.controls['permanentCity'].setValue(this.napsForm.get('presentCity').value) : null;

    } else {


      this.napsForm.controls['permanentAddressdetails'] != null ? this.napsForm.controls['permanentAddressdetails'].setValue(null) : null;
      this.napsForm.controls['permanentAddressdetails1'] != null ? this.napsForm.controls['permanentAddressdetails1'].setValue(null) : null;
      this.napsForm.controls['permanentAddressdetails2'] != null ? this.napsForm.controls['permanentAddressdetails2'].setValue(null) : null;
      this.napsForm.controls['permanentCountryName'] != null ? this.napsForm.controls['permanentCountryName'].setValue(null) : null;
      this.napsForm.controls['permanentStateName'] != null ? this.napsForm.controls['permanentStateName'].setValue(null) : null;
      this.napsForm.controls['permanentPincode'] != null ? this.napsForm.controls['permanentPincode'].setValue(null) : null;
      this.napsForm.controls['permanentCity'] != null ? this.napsForm.controls['permanentCity'].setValue(null) : null;
    }
  }

  onChangeWorkLocation(event: ClientLocationList) {
    if (event != null) {
      this.StateId = event.StateId;
      this.CityId = event.CityId;
      this.SkillCategoryId = event.DefaultSkillCategoryId;
      this.ZoneId = event.DefaultZoneId;
      event != null && this.IsRateSetCalculated ? this.onFocus_OfferAccordion(null, 'location') : null;
    }

  }
  onChangeTeam(item, from_action) {
    this.CostCodeList = [];
    let filterList = this.LstTeam && this.LstTeam.length > 0 ? this.LstTeam.find(a => a.Id == item.Id) : null;
    if (filterList) {
      this.IsVanBasedAccount = filterList.IsVanBasedAccount;
      this.IsTeamNapsBased = filterList.IsNapBased;
      this.LstInsurance = filterList.InsuranceList;
      this.CostCodeList = filterList.CostCodeList;
      this.LstPayPeriod = filterList.PayPeriodList;
      this.PayGroupId = filterList.PayGroupId;
      this.napsForm.controls['PayGroup'].setValue(this.PayGroupId);
      this.LstPayGroupProductOverrRides = [];
      this.LstPayGroupProductOverrRides = filterList.PaygroupProductOverridesList && filterList.PaygroupProductOverridesList.length > 0 ? filterList.PaygroupProductOverridesList.filter(a => a.PayGroupId == this.PayGroupId) : [];
      item != null && this.IsRateSetCalculated ? this.onFocus_OfferAccordion(null, 'location') : null;
    }


  }
  onChangeInsurancePlan(item) {

    this.napsForm.controls['OnCostInsuranceAmount'] != null ? this.napsForm.controls['OnCostInsuranceAmount'].setValue(item.InsuranceAmount) : null;
    this.napsForm.controls['FixedDeductionAmount'] != null ? this.napsForm.controls['FixedDeductionAmount'].setValue(item.InsuranceDeductionAmount) : null;
    this.napsForm.controls['Gmc'] != null ? this.napsForm.controls['Gmc'].setValue(item.GMC) : null;
    this.napsForm.controls['Gpa'] != null ? this.napsForm.controls['Gpa'].setValue(item.GPA) : null;

  }

  onChangeDOJ(event) {
    this.EndDateMinDate = new Date(event);
    this.napsForm.controls['EndDate'].setValue(null);
    event != null && this.IsRateSetCalculated ? this.onFocus_OfferAccordion(null, 'location') : null;
  }
  onChangeDOJ1(event) {
    event != null && this.IsRateSetCalculated ? this.onFocus_OfferAccordion(null, 'location') : null;
  }

  onFocus_OfferAccordion(newValue, Formindex) {
    return new Promise((resolve, reject) => {

      if (this.IsRateSetCalculated) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true,
        })
        swalWithBootstrapButtons.fire({
          title: 'Confirmation!',
          text: "The change you made as an impact on the salary calculation hence please re-calculate the salary by clicking  'View Salary Breakup' button ",
          type: 'warning',
          showCancelButton: false,
          confirmButtonText: 'Ok!',
          cancelButtonText: 'No, cancel!',
          allowOutsideClick: false,
          reverseButtons: true
        }).then((result) => {

          try {
            if (this.CandidateId > 0) {
              this.IsRateSetCalculated = false;
              this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 ?
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = [] : true;

              this.candidateOfferBreakupDetails != null &&
                this.candidateOfferBreakupDetails.LstCandidateRateSet != null &&
                this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0 ?
                this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet = [] : true;
            } else {
              this.IsRateSetCalculated = false;
              this.candidateOfferBreakupDetails != null &&
                this.candidateOfferBreakupDetails.LstCandidateRateSet != null &&
                this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0 ?
                this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet = [] : true;
            }

          } catch (error) {
            console.log('CLER ISS :', error);
          }

        })
      }

    });

  }


  onDocumentClick() {

    this.CompanyId = this.CompanyId;
    this.onboardingService.getDocumentList(this.CandidateId, this.CompanyId, this.ClientId, this.ClientContractId, 0, this.IsNapsBasedContract)
      .subscribe(authorized => {

        let apiResult: apiResult = (authorized);
        console.log('DOC RES ::', apiResult);

        try {
          this.DocumentList = JSON.parse(apiResult.Result);
          this.DocumentList.forEach(element => {
            element['DocumentId'] = null;
            element['CategoryType'] = null;
            element['FileName'] = null;
            element['DeletedIds'] = null;
            element['IsKYCVerified'] = false;
            // element['DocumentNumber'] = '';
            // element['Status'] = null;

          });

          this.documentTbl = [];
          this.DocumentList.forEach(element => {

            this.documentTbl.push(element);

          });

          console.log('DOCU LIST MASTER :: ', this.documentTbl);

          this.documentTbl.forEach(element_new => {
            let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == element_new.DocumentTypeId)).ApplicableCategories;
            (Object.keys(element_new).forEach(key => {
              let i = tem_c.find(a => a.Name == key);
              if (i != undefined) {
                i['isChecked'] = element_new[key] == 1 ? true : false;
              }
            }));
            element_new.CategoryType = tem_c;
          });

          if (this.CandidateId != 0) {

            this.documentTbl.forEach(element_new => {
              this.edit_document_lst.forEach(ele_edit => {

                if (Number(element_new.DocumentTypeId).toString() == Number(ele_edit.DocumentTypeId).toString()) {
                  let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == ele_edit.DocumentTypeId)).ApplicableCategories;
                  (Object.keys(element_new).forEach(key => {
                    let i = tem_c.find(a => a.Name == key);
                    if (i != undefined) {
                      i['isChecked'] = element_new[key] == 1 ? true : false;
                    }
                  }));

                  element_new.DocumentId = ele_edit.DocumentId
                  element_new.DocumentNumber = ele_edit.DocumentNumber
                  element_new.CandidateId = ele_edit.CandidateId
                  element_new.FileName = ele_edit.FileName
                  element_new.ValidFrom = (this.datePipe.transform(ele_edit.ValidFrom, "yyyy-MM-dd"))
                  element_new.ValidTill = (this.datePipe.transform(ele_edit.ValidTill, "yyyy-MM-dd"))
                  element_new.Status = ele_edit.Status
                  element_new.CategoryType = tem_c;

                }

              });

            });
          }

          if (this.Id == 0) {
            this.KYCAadhaarDocumentId == 0 ? this.uploadAadhaarKYCFile(this.aadhaarDetails.file.pdfContent, `${this.aadhaarDetails.name.trim()}_aadhaarDoc.pdf`, "Aadhaar") : true;
          }
        } catch (error) {
        }

      }), ((err) => {

      });
  }


  uploadAadhaarKYCFile(filebytes, filename, docTypeName) {
    try {

      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = 0;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.ClientContractId as any;
      objStorage.ClientId = this.ClientId as any;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";

      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })

            if (docTypeName == 'Aadhaar') {
              this.KYCAadhaarDocumentId = apiResult.Result as any;
              this.BindingEverifiedAadhaarDetails();
            }

          }
          else {

          }
        } catch (error) {
          console.log('"An error occurred while  trying to upload! " + error');
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
    }

  }


  BindingEverifiedAadhaarDetails() {
    if (this.aadhaarDetails) {
      var aadhaarDocs = [];
      try {

        this.documentTbl && this.documentTbl.length > 0 && this.documentTbl.forEach(element => {
          if (this.DocumentCategoryist != null && this.DocumentCategoryist.length > 0 && this.DocumentCategoryist.find(a => a.Code == 'Aadhar') != undefined && (element.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == 'Aadhar').DocumentTypeId) == true) {

            element.DocumentNumber = this.aadhaarDetails.maskedAadhaarNumber;
            element.DocumentId = this.KYCAadhaarDocumentId;
            element.FileName = `${this.aadhaarDetails.name.trim()}_aadhaarDoc.pdf`;
            element.Modetype = UIMode.Edit;
            element.Status = ApprovalStatus.Approved;
            element.CategoryType = _.uniqBy(element.CategoryType, 'Id');
            element.IsKYCVerified = true;
            element.CategoryType && element.CategoryType.length > 0 && element.CategoryType.forEach(e2 => {
              e2.isChecked = true;
            });

            let ApplicableCategories = [];
            ApplicableCategories = _.uniqBy(element.CategoryType, 'Id');

            ApplicableCategories && ApplicableCategories.length > 0 && ApplicableCategories.forEach(e1 => {

              let ListDocumentList: CandidateDocuments = new CandidateDocuments();
              ListDocumentList.Id = 0;
              ListDocumentList.CandidateId = this.Id != 0 ? this.CandidateId : 0;
              ListDocumentList.IsSelfDocument = true;
              ListDocumentList.DocumentId = this.KYCAadhaarDocumentId;
              ListDocumentList.DocumentCategoryId = e1.Id;
              ListDocumentList.DocumentTypeId = element.DocumentTypeId;
              ListDocumentList.DocumentNumber = this.aadhaarDetails.maskedAadhaarNumber;
              ListDocumentList.FileName = `${this.aadhaarDetails.name.trim()}_aadhaarDoc.pdf`;
              ListDocumentList.ValidFrom = null;
              ListDocumentList.ValidTill = null;
              ListDocumentList.Status = ApprovalStatus.Approved;
              ListDocumentList.IsOtherDocument = false;
              ListDocumentList.Modetype = UIMode.Edit;
              ListDocumentList.DocumentCategoryName = "";
              ListDocumentList.StorageDetails = null;
              ListDocumentList.DocumentVerificationMode = DocumentVerificationMode.KYC;
              this.lstDocumentDetails.push(ListDocumentList);

            });

          }

        });

      }
      catch (error) {
        console.log('E', error)
      }
    }

  }


  document_file_upload(item) {
    console.log('item', item);
    item.Id == undefined ? item.Id = 0 : true;
    let OldDocumentDetails = null;// this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
    var objStorageJson = JSON.stringify({ IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    console.log('objStorageJson', objStorageJson);
    console.log('UserId', this.UserId);
    console.log('OldDocumentDetails', OldDocumentDetails);

    const modalRef = this.modalService.open(DocumentsModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.jsonObj = item;
    modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

        try {
          console.log('r', result);


          if (result.DocumentId == undefined || result.DocumentId == null || result.DocumentId == 0) {
            this.doDelete_document(result);
            return;
          }
          item.Status = result.Status;
          item.DocumentNumber = result.DocumentNumber;
          item.CategoryType = result.CategoryType;
          item.FileName = result.FileName;
          item.DocumentId = result.DocumentId;
          item.ValidTill = result.ValidTill;
          item.ValidFrom = result.ValidFrom;

          /* #region  JSZip */
          if (item.DocumentId) {
            // this.documentURL = null;
            // this.documentURLId = null;
            // this.documentURLId = item.DocumentId;

            result.CategoryType.forEach(element_doc => {
              var doc = null;
              doc = this.lstDocumentDetails.length > 0 ? this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete) : null;
              if ((doc == undefined || doc == null) && element_doc.isChecked == true) {

                this.add_edit_document_details(result, element_doc, item, true)
              }
              if (doc != undefined && doc != null && element_doc.isChecked == true) {

                // doc.Id = result.Id;
                doc.DocumentId = result.DocumentId;
                doc.DocumentNumber = result.DocumentNumber;
                doc.FileName = result.FileName;
                doc.ValidTill = result.ValidTill;
                doc.ValidFrom = result.ValidFrom;
                doc.Modetype = UIMode.Edit;
                doc.Status = doc.Status != ApprovalStatus.Approved ? ApprovalStatus.Pending : doc.Status;

              }
              if (doc != undefined && doc != null && element_doc.isChecked == false) {

                let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == result.DocumentId) != null ? true : false;
                if (alreadyExists) {
                  doc.Modetype = UIMode.Delete;
                }
                else {
                  const index = this.lstDocumentDetails.indexOf(doc);
                  this.lstDocumentDetails.splice(index, 1);
                }

              }

            });
          }
          console.log('k', this.lstDocumentDetails);
          console.log('k', this.documentTbl);
        } catch (error) {
          console.log('DOC MODAL EX ::', error);

        }
      }
    })

      .catch((error) => {
        console.log(error);
      });

  }

  checkIsZipFile(item, whicharea) {
    whicharea == 'ClientApproval' ? item['DocumentId'] = item.ObjectStorageId : true;
    whicharea == 'ClientApproval' ? item['FileName'] = item.DocumentName : true;

    var fileNameSplitsArray = item.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      return true;
    } else {
      return false;
    }
  }

  async doDelete_document(item) {

    try {
      console.log('de :', item)

      const uniqueArray = await item.CategoryType.filter(
        (obj, index, self) =>
          index === self.findIndex((o) => o.Id === obj.Id)
      );

      await uniqueArray && uniqueArray.forEach(element_doc => {
        var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == Number(item.DocumentTypeId) && a.DocumentCategoryId == element_doc.Id);
        const index1 = this.lstDocumentDetails.indexOf(doc);
        console.log('index1', index1);
        if (doc != undefined && doc.Id != 0) {
          doc.Modetype = UIMode.Delete;
          return;
        }
        else {
          const index = this.lstDocumentDetails.indexOf(doc);
          console.log('index', index);
          if (index > -1) {
            this.lstDocumentDetails.splice(index, 1);
          }
        }
      });

      // let OldDocumentDetails = this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
      // if (OldDocumentDetails != null) {

      //   let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == item.DocumentId) != null ? true : false;
      //   if (alreadyExists == false) {
      //     this.deleted_DocumentIds_List.push({ Id: item.DocumentId });
      //     console.log(this.deleted_DocumentIds_List);
      //   }
      // }

      var table_doc = await this.documentTbl.find(a => a.CandidateDocumentId == item.CandidateDocumentId && a.DocumentTypeId == item.DocumentTypeId);
      table_doc.DocumentId = null;
      table_doc.CandidateId = null;
      table_doc.CandidateDocumentId = null;
      table_doc.DeletedIds = null;
      table_doc.FileName = null;
      table_doc.DocumentNumber = null;
      table_doc.ValidFrom = null;
      table_doc.ValidTill = null;
      table_doc.Status = null;
      table_doc.ValidTill = null;
      table_doc.CategoryType.forEach(element => {
        element.isChecked = false;
      });

      console.log('this.lstDocumentDetails', this.lstDocumentDetails);


    } catch (error) {
      console.log('DOC DELETION CATCH ERR :: ', error);

    }
  }

  add_edit_document_details(result, element_doc, item, area: any) {
    if (area) {
      let candidateDocs: CandidateDocuments = new CandidateDocuments();
      candidateDocs.Id = 0;
      candidateDocs.CandidateId = this.CandidateId != 0 ? this.CandidateId : 0;
      candidateDocs.IsSelfDocument = true;
      candidateDocs.DocumentId = result.DocumentId;
      candidateDocs.DocumentCategoryId = element_doc.Id;
      candidateDocs.DocumentTypeId = item.DocumentTypeId;
      candidateDocs.DocumentNumber = result.DocumentNumber;
      candidateDocs.FileName = result.FileName;
      candidateDocs.ValidFrom = result.ValidFrom;
      candidateDocs.ValidTill = result.ValidTill;
      candidateDocs.Status = ApprovalStatus.Pending;
      candidateDocs.IsOtherDocument = false;
      candidateDocs.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
      candidateDocs.DocumentCategoryName = "";
      candidateDocs.StorageDetails = null;
      this.addCandidateDocumentList(candidateDocs);

    }
    else {

      if (this.isGuid(result.Id) && !area) {
        let already_exists = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId) != null ? true : false;
        if (already_exists == false) {
        } else {

          let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)
          if (isexists != null) {
            const index = this.lstDocumentDetails.indexOf(isexists);
            this.lstDocumentDetails.splice(index, 1);
          }
        }
      } else {
        let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)
        if (isexists != null) {
          isexists.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
          isexists.DocumentId = result.DocumentId;
        }
      }
    }

  }

  public async addCandidateDocumentList(listDocs) {
    await this.lstDocumentDetails.push(listDocs);
  }

  document_file_edit(item) {
    this.document_file_upload(item);
  }
  document_file_delete(item) {
    this.alertService.confirmSwal("Are you sure you want to delete this document?", "Do you really want to delete these document?  After you delete this item you will not able to get this!", "Yes, Delete").then(result => {
      this.doDelete_document(item);
    }).catch(error => {

    });

  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }


  addBank(json_edit_object, actionName) {

    if (actionName == null && json_edit_object != null && json_edit_object.DocumentStatus != "Approved") {

      actionName = (((json_edit_object.bankName == null || json_edit_object.bankName == undefined || json_edit_object.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode')
      // this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));
    }
    else if (actionName == null && json_edit_object != null && this.isDuplicateBankInfo) {
      actionName = (((json_edit_object.bankName == null || json_edit_object.bankName == undefined || json_edit_object.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode')

    }
    else if (json_edit_object != null && json_edit_object.DocumentStatus == "Approved") {
      actionName = (((json_edit_object.bankName == null || json_edit_object.bankName == undefined || json_edit_object.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode')

      // this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
      // return;
    }

    if (json_edit_object == undefined && this.LstBank.length > 0 && this.LstBank.filter(a => a.DocumentStatus == "Approved" || a.DocumentStatus == "Pending").length > 0) {
      this.alertService.showWarning("You are only allowed to enter one more item");
      return;
    }

    console.log(json_edit_object);

    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
      json_edit_object.proofType = json_edit_object.CandidateDocument.DocumentTypeId;
    }
    const modalRef = this.modalService.open(BankModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.ActionName = actionName;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.OT = OnBoardingType.Proxy;
    modalRef.componentInstance.candidateDetailsBasic = { CandidateName: this.napsForm.get('FirstName').value, MobileNumber: this.napsForm.get('MobileNumber').value, EmailId: this.napsForm.get('PrimaryEmail').value };
    modalRef.componentInstance.area = "Candidate";
    modalRef.componentInstance.DocumentList = this.DocumentList;
    var objStorageJson = JSON.stringify({ CandidateName: this.napsForm.get('FirstName').value, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {
      console.log(result);

      if (result != "Modal Closed") {

        if (result.DocumentId) {
          this.fileuploadService.getObjectById(result.DocumentId)
            .subscribe((dataRes) => {
              if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
                return;
              }
              var objDtls = dataRes.Result;
              this.bankDocList = [];
              console.log(objDtls);
              var zip = new JSZip();
              zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
                Object.keys(contents.files).forEach((filename) => {
                  if (filename) {
                    this.bankDocList.push(contents.files[filename]);
                  }
                });
              });
            })
        }

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {
          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.proofType
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending;;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;
          console.log(candidateDets);

        }
        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.proofType
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending; //  
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

        }

        else {

          result.CandidateDocument = null;
          result.Modetype = this.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
          result.isDocumentStatus = null;
          result.DocumentStatus = null;
        }

        result.isDocumentStatus = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending;;
        result.DocumentStatus = result.VerificationMode == 2 ? "Approved" : "Pending";
        result.id = result.Id

        result.bankFullName = result.bankName != null ? this.BankList.length > 0 ? this.BankList.find(a => a.Id == result.bankName).Name : '' : '---';
        let isAlreadyExists = false;

        if (this.LstBank.length >= 1 && this.LstBank.find(z => z.Id != result.Id)) {

          this.alertService.showWarning("You are only allowed to enter one more item");

        } else {

          let isSameResult = false;
          isSameResult = _.find(this.LstBank, (a) => a.Id == result.Id) != null ? true : false;

          if (isSameResult) {
            this.LstBank[this.LstBank.findIndex(el => el.id === result.id)] = result;
          } else {
            this.LstBank.push(result);
          }


        }
        this.isDuplicateBankInfo = false;
      }

    }).catch((error) => {
      console.log(error);
    });

  }

  viewBankfile(item) {

    if (item.CandidateDocument == null) {
      this.alertService.showInfo('Note: Preview of document not available.');
      return;
    }

    var fileNameSplitsArray = item.CandidateDocument.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      this.GetBankZipFile(item.CandidateDocument)
    } else {
      // this.document_file_view(args.dataContext.CandidateDocument, 'Bank');
      this.document_file_view_old(item.CandidateDocument, 'Bank');
    }
  }

  GetBankZipFile(item: any) {
    this.loadingScreenService.startLoading();
    console.log('item', item);
    this.documentURLId = item.DocumentId;
    this.downLoadFileName = item.FileName;
    let DocId = item.DocumentId;
    this.docList = [];
    try {

      this.fileuploadService.getObjectById(DocId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
          }
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

                  console.log('this.docList 1', this.docList);
                  this.loadingScreenService.stopLoading();
                  $("#documentviewer").modal('show');

                });

              }
            });
          });


        })
    } catch (error) {
      this.loadingScreenService.stopLoading();
    }

  }

  removeSelectedRow(args, whicharea) {

    if (whicharea == "Bank") {
      if (args.DocumentStatus == "Approved") {
        this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
        return;
      }
    }

    return new Promise((resolve, reject) => {
      var x = confirm("Are you sure you want to delete?");
      if (x) {
        const isCheck = this.isGuid(args.Id);
        if (isCheck && args.DocumentId != null) {

          this.unsavedDocumentLst.push({
            Id: args.DocumentId
          })
          this.doDeleteFile(args.DocumentId, null).then(() => {
            var taskIndex = this.LstBank.indexOf(args);
            if (taskIndex !== -1) {
              this.LstBank.splice(taskIndex, 1);
            }
            resolve(true);
          });
        }
        else {
          args.Modetype = UIMode.Delete;
          if (args.CandidateDocument != null && args.CandidateDocument.DocumentId != null) {
            args.CandidateDocument.Modetype = UIMode.Delete;
          }

          if (whicharea == "Bank") {
            this.deletedLstBank.push(args);
            var taskIndex = this.LstBank.indexOf(args);
            if (taskIndex !== -1) {
              this.LstBank.splice(taskIndex, 1);
            }
          }

          resolve(true);
        }
      } else {
        resolve(false);
      }
    });
  }


  doDeleteFile(Id, element) {


    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.fileuploadService.deleteObjectStorage((Id)).subscribe((res) => {
          if (res.Status) {
            if (this.unsavedDocumentLst.length > 0) {
              var index = this.unsavedDocumentLst.map(function (el) {
                return el.Id
              }).indexOf(Id);
              // Delete  the item by index.
              this.unsavedDocumentLst.splice(index, 1);
            }
            resolve(true);
          } else {
            reject();
          }
          console.log('aysnc funciond delte');


        }), ((err) => {
          reject();
        })
      }, 1000);
    });

  }





  // APPROVALS

  /* #region  Client Approval accordion */
  addAttachment(json_edit_object) {

    const modalRef = this.modalService.open(ApprovalModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.RequestType = RequestType.AL;
    var objStorageJson = JSON.stringify({ CandidateName: this.napsForm.get('FirstName').value, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    modalRef.componentInstance.ClientLocationList = this.LstClientLocation;
    modalRef.componentInstance.OnboardingMode = 2;
    modalRef.componentInstance.ContractCode = this.napsForm.get('ContractCode').value;
    modalRef.result.then((result) => {
      console.log(result);

      if (result.ContractCode != null && result.ContractCode != "") {
        this.napsForm.controls['ContractCode'].setValue(result.ContractCode);
      }

      if (result.ObjectStorageId != null && result.IsDocumentDelete == false) {

        result.EntityId = this.CandidateId;
        result.EntityType = EntityType.CandidateDetails;
        result.Status = ApprovalStatus.Pending;
        result.Modetype = UIMode.Edit;


      }
      else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

        result.EntityId = this.CandidateId;
        result.EntityType = EntityType.CandidateDetails;
        result.Status = ApprovalStatus.Pending;
        result.Modetype = UIMode.Delete;

      }
      else {
        result.Modetype = this.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
      }

      let isSameResult = false;
      isSameResult = _.find(this.clientApprovalTbl, (a) => a.Id == result.Id) != null ? true : false;

      if (isSameResult) {

        var index = this.clientApprovalTbl.map(function (el) {
          return el.Id
        }).indexOf(result.Id)
        this.clientApprovalTbl.splice(index, 1)
        this.clientApprovalTbl.push(result);

      } else {

        this.clientApprovalTbl.push(result);

      }

    }).catch((error) => {
      console.log(error);
    });
  }

  editApprovalFile(item, indx) {
    this.addAttachment(item);
  }

  deleteApprovalFile(item) {
    this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted, you cannot undo this action.", "Ok, Delete").then(result => {
      this.loadingScreenService.startLoading();
      if (item.ApprovalFor == '4') {

      }
      if (!this.isGuid(item.Id)) {
        var index = this.clientApprovalTbl.map(function (el) {
          return el.Id
        }).indexOf(item.Id);
        this.clientApprovalTbl.splice(index, 1);
        this.deletedLstClientApproval.push(item);
        this.loadingScreenService.stopLoading()
      }
      else {
        this.deleteFromStorage(item.ObjectStorageId);
      }
    })
      .catch(error => this.loadingScreenService.stopLoading());

  }

  deleteFromStorage(_DocumentId) {
    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          var index = this.clientApprovalTbl.map(function (el) {
            return el.Id
          }).indexOf(_DocumentId);
          this.clientApprovalTbl.splice(index, 1);
          this.loadingScreenService.stopLoading()
        } else {
          this.loadingScreenService.stopLoading()
        }
      } catch (error) {
        this.loadingScreenService.stopLoading()
      }
    }), ((err) => {
      this.loadingScreenService.stopLoading()
    })
  }

  viewApprovalFile(item) {
    try {
      item['DocumentId'] = item.ObjectStorageId;
      item['FileName'] = item.DocumentName;
      this.document_file_view_old(item, 'Documents');
    } catch (error) {
      console.error('EXE ::', error);

    }
  }
  document_file_view_old(item, whichdocs) {
    console.log('item', item);
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
            console.log(' DOCUMENT URL :', this.documentURL);

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

  getFileList(item, whicharea) {

    this.loadingScreenService.startLoading();
    let DocId = whicharea == 'ClientApproval' ? item.ObjectStorageId : item.DocumentId;
    this.documentURLId = DocId;
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
                  var modalDiv = $('#documentviewer2');
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

  close_documentviewer2() {
    this.contentmodalurl = null;
    this.downLoadFileName = null;
    $("#documentviewer2").modal('hide');

  }
  close_documentviewer() {
    this.contentmodalurl = null;
    this.downLoadFileName = null;
    $("#documentviewer").modal('hide');

  }



  /* #endregion */



  doContinue(index) {

    // if (index == 'Save') {
    //   this.index = this.index + 1;
    // }

    try {


      index == "Submit" ? this.submitted = true : true;

      console.log(this.napsForm.valid);
      console.log(this.napsForm.value);

      // this.index = this.index + 1;
      // if (this.index == 2) { // COMMUNICATION DETAILS
      //   this.CountryList.length == 0 ? this.getCountryList() : true;
      // }
      // if (this.index == 4) { // DOCUMENT DETAILS
      //   this.onDocumentClick()
      // }
      // return;

      const invalid = [];
      const controls = this.napsForm.controls;
      for (const name in controls) {
        if (controls[name].invalid) {
          invalid.push(name);
        }
      }

      // const invalid = [];
      // const controls = this.napsForm.controls;
      // for (const name in controls) {
      //   if (controls[name].errors != null && controls[name].errors.hasOwnProperty('pattern') == true) {
      //     invalid.push(name);
      //   }
      // }

      console.log('invdd pater', invalid);

      if (index == "Submit" && invalid != null && invalid != undefined && invalid.length > 0) {
        let listOfFields = []
        for (let i of invalid) {
          let element = i.replace(/([a-z])([A-Z])/g, '$1 $2')
          listOfFields.push(element[0].toUpperCase() + element.substring(1))
        }
        let action = index == "Submit" ? "Submit" : (index == "Save" ? "Save" : null);
        this.alertService.showWarning(`The mentioned fields having special charecters OR empty data please change and ${action} : ${listOfFields}`);

      }

      // 1. client name, client Contract, cleint location ,name, these - only on save click ;
      if (index == "Save") {
        if ((this.napsForm.controls['clientName'].value == null) ||
          (this.napsForm.controls['clientContract'].value == null) ||
          (this.napsForm.controls['PrimaryEmail'].value == "") ||
          (this.napsForm.controls['MobileNumber'].value == "") ||
          (this.napsForm.controls['FirstName'].value == "")
        ) {

          if (this.BusinessType == 3) {
            this.alertService.showWarning("Some information was missing. There were problems with the following fields : Client, Client Contract, Candidate Name, Email and Mobile number")
            return;
          } else {
            this.alertService.showWarning("Some information was missing. There were problems with the following fields : Candidate Name, Email and Mobile number")
            return;
          }
        }
        if ((this.napsForm.controls['MobileNumber'].value).length != 10) {
          this.alertService.showWarning("Mobile Number should be minimum 10 characters")
          return;
        }

      }

      if (index == "Submit" && !this.napsForm.valid) {
        this.alertService.showWarning('You must have filled out all the required fields and try to submit onboarding Request');
        return;
      }

      if (index == "Submit" && this.utilityService.isNullOrUndefined(this.napsForm.get('Stipend').value) == false && (this.napsForm.get('Stipend').value) == 0) {
        this.alertService.showWarning("The Stipend amount should be greater than 0");
        return;
      }



      if (index == "Submit") {
        if (this.clientApprovalTbl.length == 0) {
          this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for letters  :) Contract Letters") : null;
          this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for letters  :) Contract Letters") : null;
          return;
        }
      }

      if ((this.napsForm.get('permanentCountryName').value == 100) && (this.napsForm.get('permanentStateName').value == 4)) {
        this.isAssamState = true;
      } else {
        this.isAssamState = false;
      }


      console.log('REJECTED ITEMS');


      if (index == "Submit") {
        let isdocsFiles = false;
        if (this.lstDocumentDetails.length != 0) {
          for (let index = 0; index < this.documentTbl.length; index++) {
            const element_new = this.documentTbl[index];

            if (element_new.IsMandatory == "True" && (!this.isAssamState || !this.IsAadhaarKYC)) {
              if (element_new.DocumentNumber == null || element_new.DocumentNumber == "") {
                const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
                parent.style.background = '#f9ecda'
                parent.style.borderLeft = '4px solid red'
                isdocsFiles = true;
                break;
              }
            }
            if (element_new.Status == ApprovalStatus.Rejected && this.ApprovalStatus) {
              this.alertService.showWarning(" There are some rejected file(s) in your  :) Document Details");
              return;
            }

            if (element_new.DocumentId > 0 && (element_new.DocumentNumber == null || element_new.DocumentNumber == "")) {
              const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
              parent.style.background = '#f9ecda'
              parent.style.borderLeft = '4px solid red'
              isdocsFiles = true;
              break;
            }
          }
        }

        if (this.documentTbl.length == 0 && this.rejectedLst.length > 0 && this.rejectedLst.filter(a => a.Accordion == "Document_Details").length > 0) {
          this.alertService.showWarning(" There are some rejected file(s) in your  :) Document Details");
          return;
        }

        else if (this.lstDocumentDetails.length == 0 && !this.IsAadhaarKYC) {
          this.alertService.showWarning(" This alert is to inform you about your pending documents.  :) Document Details");
          return;
        }

        if (isdocsFiles) {
          this.alertService.showWarning("This alert is to inform you about your pending documents.  :) Document Details");
          return;
        }

      }

      if (index == "Submit" && this.RoleCode != 'Recruiter' && this.LstBank.length == 0) {
        this.alertService.showWarning("Oops!  Please provide at least One Bank Details to confirm it. You cannot publish without Bank Details (minimum one detail is required)");
        return;
      }

      let rejectedBankList = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
      if (index == 'Submit' && rejectedBankList && this.ApprovalStatus) {
        this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Bank Information");
        return;
      }

      if (index == 'Submit' && this.clientApprovalTbl.find(z => z.Status == 2) != null && this.ApprovalStatus) {
        this.BusinessType == 3 ? this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Contract Letter") : null;
        this.BusinessType != 3 ? this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Contract Letter") : null; return;
      }


      // if (this.napsForm.get('DOB').value != null) {
      //   var birth = new Date(this.napsForm.get('DOB').value);
      //   let today = new Date();
      //   if (this.napsForm.get('StartDate').value != null != null && this.napsForm.get('StartDate').value != undefined && this.napsForm.get('StartDate').value.toString() != ("Invalid Date").toString()) {
      //     if (this.utitlityService.isNotNullAndUndefined(this.napsForm.get('StartDate').value) == true || this.utitlityService.isNotNullAndUndefined(this.napsForm.get('StartDate').value) == true) {
      //       today = new Date(this.napsForm.get('StartDate').value);
      //     }
      //     today = new Date(today);
      //     console.log('today', today);
      //     var years = moment(birth).diff(today, 'years');
      //     console.log('years', years.toString());;
      //     years = Math.abs(years)
      //     if (years.toString() < '18' || years.toString() == '0' || years < 18 || years == 0) {
      //       this.alertService.showWarning("The action was blocked. We require candidate to be 18 years old or over. Please confirm your Start Date/DOB")
      //       return;
      //     }
      //   }
      // }

      if (this.napsForm.get('FirstName').value
        && this.LstBank.length > 0
        && this.LstBank.filter(bank => bank.isDocumentStatus != ApprovalStatus.Rejected && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2).length > 0

        && this.napsForm.get('FirstName').value != this.LstBank.find(bank => bank.isDocumentStatus != ApprovalStatus.Rejected
          && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2).accountHolderName) {

        this.alertService.showWarning("The candidate's name is mismatched with the bank account holder's name. Please correct it and try again.")
        return;
      }

      var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
      console.log('isAadhaarExists', isAadhaarExists);

      if (isAadhaarExists != undefined && isAadhaarExists.Status != 2 && this.napsForm.get('AadhaarNumber').value != null &&
        this.napsForm.get('AadhaarNumber').value != isAadhaarExists.DocumentNumber) {
        this.alertService.showWarning("The candidate's aadhaar number is mismatched with the candidate document details document number. Please correct it and try again.")
        return;
      }

      if (index == 'Submit') {
        this.loadingScreenService.startLoading();
        this.PreviewSalaryBreakup(index).then(result => {

        })
      } else {
        this.postSalaryBreakup(index);
      }




    }
    catch (err) {
      console.log('EXE ERR ::', err);
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(`Something is wrong!  ${err}`);

    }
  }

  postSalaryBreakup(index) {
    let IsEditMode: boolean = false;
    if (this._NewCandidateDetails && this._NewCandidateDetails.Id > 0) {
      IsEditMode = true;
    }


    var candidateDetails = new CandidateDetails();
    var candidateOfferDetails = new CandidateOfferDetails();
    var candidateCommunicationDetails = new CandidateCommunicationDetails();
    var candidateContactDetails = new ContactDetails();
    var candidateStatutoryDetails = new CandidateStatutoryDetails();
    var candidateRateset = new CandidateRateset();
    var candidateOtherDetails = new CandidateOtherData();

    // CANDIDATE DETAILS
    candidateDetails = IsEditMode ? this._NewCandidateDetails : new CandidateDetails();

    const date = moment(this.napsForm.get('DOB').value, 'DD-MM-YYYY').format('YYYY-MM-DD');

    this.napsForm.controls['FirstName'] != null ? candidateDetails.FirstName = this.napsForm.get('FirstName').value == null || this.napsForm.get('FirstName').value == "" ? "" : this.napsForm.get('FirstName').value : null;
    candidateDetails.LastName = "";
    this.napsForm.controls['Gender'] != null ? candidateDetails.Gender = this.napsForm.get('Gender').value == 1 ? Gender.Male : this.napsForm.get('Gender').value == 2 ? Gender.Female : this.napsForm.get('Gender').value == 3 ? Gender.TransGender : 0 : null;
    this.napsForm.controls['DOB'] != null ? candidateDetails.DateOfBirth = this.napsForm.get('DOB').value == null ? null : moment(new Date(date)).format('YYYY-MM-DD') : null;
    candidateDetails.Status = CandidateStatus.Active;
    candidateDetails.Modetype = UIMode.Edit;
    candidateDetails.RelationshipId = Relationship.Father;
    candidateDetails.RelationshipName = this.napsForm.get('FathersName').value || null;

    this.napsForm.controls['PrimaryEmail'] != null ? candidateContactDetails.PrimaryEmail = this.napsForm.get('PrimaryEmail').value : null;;
    this.napsForm.controls['MobileNumber'] != null ? candidateContactDetails.PrimaryMobile = this.napsForm.get('MobileNumber').value : null;;
    candidateContactDetails.PrimaryMobileCountryCode = '91';
    candidateContactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Personal;


    // CANDIDATE RATESET 
    candidateRateset = IsEditMode && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 ?
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0] : new CandidateRateset();

    candidateRateset.AnnualSalary = (this.napsForm.get('Stipend').value * 12);
    candidateRateset.IsMonthlyValue = true;
    this.defaultSearchInputs.IsReOnboard ? candidateRateset.LstRateSet = [] : !IsEditMode ? candidateRateset.LstRateSet = [] : true;
    candidateRateset.MonthlySalary = this.napsForm.get('Stipend').value;
    this.napsForm.get('PayGroup').value != null && this.napsForm.get('PayGroup').value > 0 ? candidateRateset.PayGroupdId = this.napsForm.get('PayGroup').value : true;
    this.napsForm.get('StartDate').value != null ? candidateRateset.EffectiveDate = moment(this.napsForm.get('StartDate').value).format('YYYY-MM-DD') : true
    candidateRateset.Status = 1;

    candidateRateset.Salary = (this.napsForm.get('Stipend').value * 12);
    candidateRateset.SalaryBreakUpType = environment.environment.DefaultSBT;
    candidateRateset.Id = this.defaultSearchInputs.IsReOnboard ? 0 : (IsEditMode && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 ?
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].Id : 0);
    candidateRateset.Modetype = UIMode.Edit;

    this.candidateOfferBreakupDetails != null && this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0
      && this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet != null
      && this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet.length > 0 ?
      candidateRateset.LstRateSet = this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet : true;

    if (this.candidateOfferBreakupDetails != null) {
      candidateOfferDetails.IsMinimumwageAdhere = this.candidateOfferBreakupDetails.IsMinimumwageAdhere;
      candidateOfferDetails.IsRateSetValid = this.candidateOfferBreakupDetails.IsRateSetValid;
      candidateOfferDetails.LstPayGroupProductOverrRides = this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides;
    }


    // CANDIDATE OFFER DETAILS
    candidateOfferDetails = IsEditMode && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ?
      this._NewCandidateDetails.LstCandidateOfferDetails[0] : new CandidateOfferDetails();


    candidateOfferDetails.FatherName = this.napsForm.get('FathersName').value;
    candidateOfferDetails.IsSelfRequest = true;
    candidateOfferDetails.RequestedBy = this.UserId;
    candidateOfferDetails.RequestType = RequestType.AL
    candidateOfferDetails.OnBoardingType = OnBoardingType.Proxy;
    candidateOfferDetails.ClientId = this.defaultSearchInputs.ClientId;
    candidateOfferDetails.ClientContractId = this.defaultSearchInputs.ClientContractId;;
    candidateOfferDetails.SourceType = SourceType.Transfer;
    candidateOfferDetails.ClientContactId = 0;
    candidateOfferDetails.IndustryId = 0;
    candidateOfferDetails.Aadhaar = this.napsForm.get('AadhaarNumber').value;
    this.napsForm.get('WorkLocation').value != null && this.napsForm.get('WorkLocation').value > 0 ? candidateOfferDetails.Location = this.napsForm.get('WorkLocation').value : true;
    this.napsForm.get('Team').value != null && this.napsForm.get('Team').value > 0 ? candidateOfferDetails.TeamId = this.napsForm.get('Team').value : true;
    this.napsForm.get('Insurance').value != null ? candidateOfferDetails.InsurancePlan = this.napsForm.get('Insurance').value : true;
    this.napsForm.get('OnCostInsuranceAmount').value != "" && this.napsForm.get('OnCostInsuranceAmount').value != null ? candidateOfferDetails.OnCostInsurance = this.napsForm.get('OnCostInsuranceAmount').value : true;
    this.napsForm.get('FixedDeductionAmount').value != "" && this.napsForm.get('FixedDeductionAmount').value != null ? candidateOfferDetails.FixedInsuranceDeduction = this.napsForm.get('FixedDeductionAmount').value : true;
    this.napsForm.get('Gmc').value != "" && this.napsForm.get('Gmc').value != null ? candidateOfferDetails.GMCAmount = this.napsForm.get('Gmc').value : true;
    this.napsForm.get('Gpa').value != "" && this.napsForm.get('Gpa').value != null ? candidateOfferDetails.GPAAmount = this.napsForm.get('Gpa').value : true;
    candidateOfferDetails.NapsContractCode = this.napsForm.get('ContractCode').value;
    this.napsForm.get('PayPeriod').value != null && this.napsForm.get('PayPeriod').value > 0 ? candidateOfferDetails.EffectivePayPeriodId = this.napsForm.get('PayPeriod').value : true;
    this.napsForm.get('CostCodeId').value != null && this.napsForm.get('CostCodeId').value > 0 ? candidateOfferDetails.CostCodeId = this.napsForm.get('CostCodeId').value : true;

    this.napsForm.get('StartDate').value != null ? candidateOfferDetails.ActualDateOfJoining = moment(this.napsForm.get('StartDate').value).format('YYYY-MM-DD') : true
    candidateOfferDetails.TenureType = TenureType.Custom;
    this.napsForm.get('EndDate').value != null ? candidateOfferDetails.EndDate = moment(this.napsForm.get('EndDate').value).format('YYYY-MM-DD') : true
    candidateOfferDetails.Status = 1;
    candidateOfferDetails.SkillCategory = 0
    candidateOfferDetails.Designation = "";
    candidateOfferDetails.Zone = 0
    candidateOfferDetails.State = this.StateId;
    candidateOfferDetails.CityId = this.CityId;
    candidateOfferDetails.Modetype = UIMode.Edit;;
    candidateOfferDetails.IsNapsBased = true;
    candidateOfferDetails.ApprenticeCode = this.napsForm.get('ApprenticeCode').value;
    // candidateOfferDetails.NapsContractCode = this.napsForm.get('ContractCode').value;
    candidateOfferDetails.LstCandidateRateSet = [];
    candidateOfferDetails.LstCandidateRateSet.push(candidateRateset);
    candidateOfferDetails.Id = this.defaultSearchInputs.IsReOnboard ? 0 : (IsEditMode && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ?
      this._NewCandidateDetails.LstCandidateOfferDetails[0].Id : 0);

    this.lstAddressDetails = [];
    this.lstClientApporval = [];
    this.lstContactDetails = [];

    /* #region  Communication Details  */
    this.lstAddressDetails.push({
      Address1: this.napsForm.controls['presentAddressdetails'] != null ? this.napsForm.get('presentAddressdetails').value : null,
      Address2: this.napsForm.controls['presentAddressdetails1'] != null ? this.napsForm.get('presentAddressdetails1').value : null,
      Address3: this.napsForm.controls['presentAddressdetails2'] != null ? this.napsForm.get('presentAddressdetails2').value : null,
      CountryName: this.napsForm.controls['presentCountryName'] != null ? this.napsForm.get('presentCountryName').value : null,
      StateName: this.napsForm.controls['presentStateName'] != null ? this.napsForm.get('presentStateName').value : null,
      City: this.napsForm.controls['presentCity'] != null ? this.napsForm.get('presentCity').value : null,
      PinCode: this.napsForm.controls['presentPincode'] != null ? this.napsForm.get('presentPincode').value : null,
      CommunicationCategoryTypeId: this.napsForm.controls['presentAddressdetails'] != null ? CommunicationCategoryType.Present : null
    })
    this.lstAddressDetails.push({
      Address1: this.napsForm.controls['permanentAddressdetails'] != null ? this.napsForm.get('permanentAddressdetails').value : null,
      Address2: this.napsForm.controls['permanentAddressdetails1'] != null ? this.napsForm.get('permanentAddressdetails1').value : null,
      Address3: this.napsForm.controls['permanentAddressdetails2'] != null ? this.napsForm.get('permanentAddressdetails2').value : null,
      CountryName: this.napsForm.controls['permanentCountryName'] != null ? this.napsForm.get('permanentCountryName').value : null,
      StateName: this.napsForm.controls['permanentStateName'] != null ? this.napsForm.get('permanentStateName').value : null,
      City: this.napsForm.controls['permanentCity'] != null ? this.napsForm.get('permanentCity').value : null,
      PinCode: this.napsForm.controls['permanentPincode'] != null ? this.napsForm.get('permanentPincode').value : null,
      CommunicationCategoryTypeId: this.napsForm.controls['permanentAddressdetails'] != null ? CommunicationCategoryType.Permanent : null
    })

    candidateCommunicationDetails = IsEditMode && this._NewCandidateDetails.CandidateCommunicationDtls != null ?
      this._NewCandidateDetails.CandidateCommunicationDtls : new CandidateCommunicationDetails();

    candidateCommunicationDetails.LstContactDetails = [];
    candidateCommunicationDetails.LstContactDetails.push(candidateContactDetails);
    candidateCommunicationDetails.LstAddressdetails = this.lstAddressDetails;
    candidateCommunicationDetails.Id = IsEditMode && this._NewCandidateDetails.CandidateCommunicationDtls != null ?
      this._NewCandidateDetails.CandidateCommunicationDtls.Id : 0;
    candidateCommunicationDetails.Modetype = UIMode.Edit;
    /* #endregion */

    candidateDetails.LstCandidateOfferDetails = [];
    candidateDetails.LstCandidateOfferDetails.push(candidateOfferDetails);
    candidateDetails.CandidateCommunicationDtls = new CandidateCommunicationDetails();
    candidateDetails.CandidateCommunicationDtls = candidateCommunicationDetails;
    candidateDetails.Modetype = UIMode.None;
    candidateDetails.Id = IsEditMode && this._NewCandidateDetails ? this._NewCandidateDetails.Id : 0;

    // OTHER DATA

    this.napsForm.controls['PANNumber'] != null ? this.candidateStatutoryDetails.PAN = this.napsForm.get('PANNumber').value : null;
    this.candidateStatutoryDetails.Id =
      IsEditMode && this._NewCandidateDetails.CandidateOtherData != null &&
        this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null &&
        this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0 ?
        this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].Id :
        0;
    this.lstStatutoryDetails = [];

    if (this.candidateStatutoryDetails.PAN != "" || this.candidateStatutoryDetails.PFNumber != "" || this.candidateStatutoryDetails.UAN != "" || this.candidateStatutoryDetails.ESICNumber != "") {
      this.lstStatutoryDetails.push(this.candidateStatutoryDetails);
    }

    candidateOtherDetails.Modetype = UIMode.Edit;;
    candidateOtherDetails.Id = (IsEditMode && this._NewCandidateDetails.CandidateOtherData != null) ? this._NewCandidateDetails.CandidateOtherData.Id : 0;
    candidateOtherDetails.LstCandidateStatutoryDtls = (this.lstStatutoryDetails.length != 0 ? this.lstStatutoryDetails : null);

    candidateDetails.CandidateOtherData = new CandidateOtherData();
    candidateDetails.CandidateOtherData = candidateOtherDetails;

    // when approved pennyd drop
    if (
      this.LstBank.length > 0
      &&
      this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2).length > 0

    ) {

      let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved
        && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2);

      if (index == "Submit") {
        existingBank.Attribute1 = this.napsForm.get('FirstName').value;
      }

    }

    // when approved with attrib


    if (
      this.LstBank.length > 0
      &&
      this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).length > 0
      &&
      this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1 && (bank.Attribute1 != null && bank.Attribute1 != '' && bank.Attribute1 != undefined)).length > 0
      &&
      this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).Attribute1
      != this.napsForm.get('FirstName').value
    ) {

      let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved
        && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1);

      if (existingBank) {
        existingBank.isDocumentStatus = ApprovalStatus.Pending;
        existingBank.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
        existingBank.CandidateDocument != null && existingBank.CandidateDocument != undefined ?
          existingBank.CandidateDocument.Status = ApprovalStatus.Pending : true
        existingBank.CandidateDocument.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;

      }

      if (index == "Submit") {
        existingBank.Attribute1 = this.napsForm.get('FirstName').value;
      }

    }

    // when approved 

    if (
      this.LstBank.length > 0
      &&
      this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).length > 0
      &&
      this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1 && (bank.Attribute1 == null || bank.Attribute1 == '' || bank.Attribute1 == undefined)).length > 0
      // &&
      // this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
      // != this.napsForm.get('firstName').value
    ) {

      let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved
        && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1);

      if (existingBank && this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
        != this.napsForm.get('FirstName').value) {
        existingBank.isDocumentStatus = ApprovalStatus.Pending;
        existingBank.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;

        existingBank.CandidateDocument != null && existingBank.CandidateDocument != undefined ?
          existingBank.CandidateDocument.Status = ApprovalStatus.Pending : true
        existingBank.CandidateDocument.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
      }

      if (index == "Submit") {
        existingBank.Attribute1 = this.napsForm.get('FirstName').value;
      }

    }

    // -- when pending 
    if (
      this.LstBank.length > 0
      &&
      this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Pending && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).length > 0
      // &&
      // this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Pending && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
      // != this.napsForm.get('firstName').value
    ) {

      let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Pending
        && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1);

      if (existingBank &&
        this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Pending && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
        != this.napsForm.get('FirstName').value) {
        existingBank.isDocumentStatus = ApprovalStatus.Pending;
        // existingBank.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
        existingBank.CandidateDocument != null && existingBank.CandidateDocument != undefined ?
          existingBank.CandidateDocument.Status = ApprovalStatus.Pending : true
        // existingBank.CandidateDocument.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
      }

      if (index == "Submit") {
        existingBank.Attribute1 = this.napsForm.get('FirstName').value;
      }

    }








    this.loadingScreenService.startLoading()


    console.log('#0011 PLD ::', candidateDetails);
    this.lstBankDetails = [];
    this.LstBank.forEach(element => {

      var candidateBankDetails = new CandidateBankDetails();
      candidateBankDetails.BankId = element.bankName == undefined ? 0 : element.bankName;
      candidateBankDetails.BankBranchId = element.IFSCCode == undefined ? 0 : element.IFSCCode;
      candidateBankDetails.AccountNumber = element.accountNumber == undefined ? '' : element.accountNumber;
      candidateBankDetails.AccountHolderName = element.accountHolderName == undefined ? '' : element.accountHolderName;
      candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
      candidateBankDetails.IdentifierValue = element.bankBranchId == undefined ? 0 : element.bankBranchId;
      candidateBankDetails.SalaryContributionPercentage = element.allocation == undefined ? 100 : element.allocation;
      candidateBankDetails.IsDefault = true;
      candidateBankDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
      // this.candidateBankDetails.Modetype =  UIMode.Edit;;
      candidateBankDetails.Modetype = element.Modetype,
        candidateBankDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
        candidateBankDetails.CandidateDocument = element.CandidateDocument
      candidateBankDetails.VerificationMode = element.VerificationMode
      candidateBankDetails.VerificationAttempts = element.VerificationAttempts
      if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
        element.PayoutLogId = 0
      }
      candidateBankDetails.PayoutLogId = element.PayoutLogId
      candidateBankDetails.Remarks = element.Remarks
      candidateBankDetails.Attribute1 = element.hasOwnProperty("Attribute1") ? element.Attribute1 : '';
      this.lstBankDetails.push(candidateBankDetails)
    });

    this.deletedLstBank.forEach(element => {
      var candidateBankDetails = new CandidateBankDetails();
      candidateBankDetails.BankId = element.bankName;
      candidateBankDetails.BankBranchId = element.IFSCCode;
      candidateBankDetails.AccountNumber = element.accountNumber;
      candidateBankDetails.AccountHolderName = element.accountHolderName;
      candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;

      candidateBankDetails.IdentifierValue = element.bankBranchId;
      candidateBankDetails.SalaryContributionPercentage = element.allocation;
      candidateBankDetails.IsDefault = true;
      candidateBankDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
      // this.candidateBankDetails.Modetype =  UIMode.Edit;;
      candidateBankDetails.Modetype = element.Modetype,
        candidateBankDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
        candidateBankDetails.CandidateDocument = element.CandidateDocument
      candidateBankDetails.VerificationMode = element.VerificationMode
      candidateBankDetails.VerificationAttempts = element.VerificationAttempts
      if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
        element.PayoutLogId = 0
      }
      candidateBankDetails.Remarks = element.Remarks,
        candidateBankDetails.PayoutLogId = element.PayoutLogId
      this.lstBankDetails.push(
        candidateBankDetails
      )

    });
    candidateDetails.LstCandidateBankDetails = this.lstBankDetails; // BANK



    this.lstDocumentDetails.forEach(element => {
      element.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
    });
    var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
    isAadhaarExists != undefined && (candidateOfferDetails.Aadhaar = Number(isAadhaarExists.DocumentNumber));

    var isPANNOExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.PANDocumentTypeId && a.DocumentCategoryId != 0)
    isPANNOExists != undefined && (candidateOfferDetails.IsPANExists = true, candidateStatutoryDetails.PAN = (isPANNOExists.DocumentNumber));

    candidateDetails.LstCandidateDocuments = this.lstDocumentDetails; // DOCUMENT



    // if(candidateDetails.LstCandidateDocuments.length > 0){

    //   candidateDetails.LstCandidateDocuments.forEach(element => {
    //     element.rmah
    //   });
    //   if (columnData === null || (Array.isArray(columnData) && columnData.length === 0)) {
    //     columnData = null;
    //   } 
    //   In this code:

    //   We first check if columnData is null or an empty array using conditional statements.
    //   If columnData is null or an empty array, we set it to null.
    //   If columnData contains some value (e.g., [{MPId:23,Rolecode:34}]), you can replace the comment with your code to make an API call or perform any other desired action.
    //   This code ensures that columnData is set to null if it contains null or an empty array, and it performs the specified action if it contains a value.






    // }

    /* #region  Client approval document insert update delete (Save/Edit) */
    this.clientApprovalTbl.forEach(element => {
      var Lstapproval = new Approvals();
      Lstapproval.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
        Lstapproval.EntityType = element.EntityType,
        Lstapproval.EntityId = element.EntityId,
        Lstapproval.ApprovalFor = element.ApprovalFor,
        Lstapproval.ApprovalType = element.ApprovalType,
        Lstapproval.Remarks = element.Remarks,
        Lstapproval.DocumentName = element.DocumentName,
        Lstapproval.ObjectStorageId = element.ObjectStorageId,
        Lstapproval.Status = element.Status,
        Lstapproval.Modetype = element.Modetype
      this.lstClientApporval.push(Lstapproval)

    });

    this.deletedLstClientApproval.forEach(element => {
      var Lstapproval = new Approvals();
      Lstapproval.Id = element.Id,
        Lstapproval.EntityType = element.EntityType,
        Lstapproval.EntityId = element.EntityId,
        Lstapproval.ApprovalFor = element.ApprovalFor,
        Lstapproval.ApprovalType = element.ApprovalType,
        Lstapproval.Remarks = element.Remarks,
        Lstapproval.DocumentName = element.DocumentName,
        Lstapproval.ObjectStorageId = element.ObjectStorageId,
        Lstapproval.Status = element.Status,
        Lstapproval.Modetype = UIMode.Delete
      this.lstClientApporval.push(Lstapproval)
    });

    if (this.lstClientApporval != null && this.lstClientApporval.length > 0) {
      candidateDetails.ExternalApprovals = this.lstClientApporval;
    }

    /* #endregion */

    this.candidateModel = _CandidateModel;
    this.candidateModel.NewCandidateDetails = null;
    this.candidateModel.OldCandidateDetails = this.Id == 0 ? candidateDetails : this._OldCandidateDetails;
    this.candidateModel.NewCandidateDetails = candidateDetails;
    this.candidateModel.Id = 0;
    let candidate_req_json = this.candidateModel;

    console.log('#0011 PLD ::', this.candidateModel);
    // this.loadingScreenService.stopLoading()
    // return;
    this.onboardingService.putCandidate(JSON.stringify(candidate_req_json)).subscribe((data: apiResponse) => {
      let apiResponse: apiResponse = data;
      this.loadingScreenService.stopLoading()
      // this.activeModal.close('Modal Closed');

      if (!apiResponse.Status) {
        this.alertService.showWarning(apiResponse.Message);
        return;
      }

      try {
        if (!apiResponse.Status && apiResponse.Message == "Account number already exists") {
          this.isDuplicateBankInfo = true;
        }

        if (apiResponse.Status && index == "Save") {
          this.doRefreshPage(apiResponse.dynamicObject, apiResponse)
        } else if (apiResponse.Status && index == "Submit") {
          if (index == "Submit") {
            this.loadingScreenService.startLoading()
            this.candidateModel = apiResponse.dynamicObject;
            let _NewCandidateDetails: CandidateDetails = this.candidateModel.NewCandidateDetails;
            let workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation();
            workFlowInitiation.Remarks = "";
            workFlowInitiation.EntityId = _NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
            workFlowInitiation.EntityType = EntityType.CandidateDetails;
            workFlowInitiation.CompanyId = this.CompanyId;
            workFlowInitiation.ClientContractId = _NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId;
            workFlowInitiation.ClientId = _NewCandidateDetails.LstCandidateOfferDetails[0].ClientId;

            workFlowInitiation.ActionProcessingStatus = 4000;
            workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
            workFlowInitiation.WorkFlowAction = 1;
            workFlowInitiation.RoleId = this.RoleId;
            workFlowInitiation.DependentObject = (this.candidateModel.NewCandidateDetails);
            workFlowInitiation.UserInterfaceControlLst = this.accessControl_submit;

            this.finalSubmit(workFlowInitiation, "submit");
          }
        }
      } catch (error) {
        this.alertService.showWarning(error + " Failed!   Candidate save wasn't completed "),
          this.loadingScreenService.stopLoading()
      }

    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! :  ", err);

      });

  }


  finalSubmit(workFlowJsonObj: WorkFlowInitiation, fromWhich: any): void {
    this.onboardingService.postWorkFlow(JSON.stringify(workFlowJsonObj)).subscribe((response) => {
      try {
        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          this.alertService.showSuccess(`Your candidate has been ${fromWhich == "submit" ? "submitted" : "rejected"} successfully! ` + apiResult.Message != null ? apiResult.Message : '');
          this.loadingScreenService.stopLoading();
          this.activeModal.close('Workflow initiated successfully');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to ${fromWhich == "submit" ? "submission" : "reject"}!  ` + apiResult.Message != null ? apiResult.Message : '');
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to ${fromWhich == "submit" ? "submission" : "reject"}!` + error);

      }


    }), ((error) => {

    });


  }

  doRefreshPage(apiResponse, data) {
    var dynamicobj = {} as any;
    dynamicobj = (apiResponse);
    var objString = dynamicobj["NewCandidateDetails"];
    this._NewCandidateDetails = dynamicobj["NewCandidateDetails"];
    this.Id = Number(objString.Id);
    this.candidateModel = (apiResponse);
    this.alertService.showSuccess("Your onboarding request has been saved successfully!");
    this.CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
    this.rejectedLst = [];
    this.clientApprovalTbl = [];
    this.LstBank = [];
    this.lstDocumentDetails = [];
    this.deletedLstClientApproval = [];
    this.deletedLstBank = [];
    // this.doPatch(data,mode).then((result) => { });
    this.spinner = true;
    this.getCandidateDetailsById('Existing');
    // this.init(); // not required bcoz which will call the api again and map  
  }

  viewSalaryBreakup() {

    // this.submitted = true;

    // if (this.napsForm.invalid) {
    //   this.alertService.showWarning('You must have filled out all the required fields and try to verify');
    //   return;
    // }

    if (this.utilityService.isNullOrUndefined(this.napsForm.get('FirstName').value) == true) {
      this.alertService.showWarning("Please enter the name of the candidate");
      return;
    }

    else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Gender').value) == true) {
      this.alertService.showWarning('Please select a gender');
      return;
    }
    else if (this.utilityService.isNullOrUndefined(this.napsForm.get('WorkLocation').value) == true) {
      this.alertService.showWarning('Please select a work location for the candidate.');
      return;
    }
    else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Team').value) == true) {
      this.alertService.showWarning('Please select a team.');
      return;
    }
    else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Stipend').value) == true) {
      this.alertService.showWarning("Enter the candidate's Stipend");
      return;
    }
    else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Stipend').value) == false && (this.napsForm.get('Stipend').value) == 0) {
      this.alertService.showWarning("The Stipend amount should be greater than 0");
      return;
    }

    else if (this.utilityService.isNullOrUndefined(this.napsForm.get('StartDate').value) == true) {
      this.alertService.showWarning('Please choose the Start date.');
      return;
    }

    var date = moment(this.napsForm.get('StartDate').value);
    if (!date.isValid) {
      this.alertService.showWarning('Please enter valid Start Date (DD-MM-YYYY)');
      return;
    }

    this.spinner = true;
    console.log('this.candidateOfferBreakupDetails', this.candidateOfferBreakupDetails);


    if (this.CandidateId == 0 && this.candidateOfferBreakupDetails != null && this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0 &&
      this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet != null && this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet.length > 0) {
      this.candidateOfferBreakupDetails.IsRateSetValid = true;
      this.populateSalaryBreakupModal(this.candidateOfferBreakupDetails);
      return;

    }
    if (this.CandidateId > 0 && this.candidateOfferBreakupDetails != null && this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0 &&
      this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet != null && this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet.length > 0) {
      this.candidateOfferBreakupDetails.IsRateSetValid = true;
      this.populateSalaryBreakupModal(this.candidateOfferBreakupDetails);
      return;

    }

    else if (this.CandidateId > 0 && this._NewCandidateDetails && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0) {
      this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = true;
      this.populateSalaryBreakupModal(this._NewCandidateDetails.LstCandidateOfferDetails[0]);
      return;
    }

    this.loadingScreenService.startLoading();
    this.spinner = true;
    var candidateR = new CandidateRateset();
    candidateR.AnnualSalary = this.napsForm.get('Stipend').value * 12;
    candidateR.IsMonthlyValue = true;
    candidateR.LstRateSet = null;
    candidateR.MonthlySalary = this.napsForm.get('Stipend').value;
    candidateR.PayGroupdId = this.PayGroupId;
    candidateR.Salary = (this.napsForm.get('Stipend').value * 12);
    candidateR.SalaryBreakUpType = environment.environment.DefaultSBT;

    var candidateOffer = new CandidateOfferDetails();
    candidateOffer.ActualDateOfJoining = moment(this.napsForm.get('StartDate').value).format('YYYY-MM-DD');
    candidateOffer.CalculationRemarks = "";
    candidateOffer.CityId = this.CityId;
    candidateOffer.ClientContractId = this.defaultSearchInputs.ClientContractId;
    candidateOffer.ClientId = this.defaultSearchInputs.ClientId;
    candidateOffer.DateOfJoining = moment(this.napsForm.get('StartDate').value).format('YYYY-MM-DD');
    candidateOffer.Gender = this.napsForm.get('Gender').value;
    // candidateOffer.IndustryId = 38;
    candidateOffer.IsMinimumwageAdhere = true;
    candidateOffer.IsRateSetValid = true;
    candidateOffer.Location = this.napsForm.get('WorkLocation').value;
    // candidateOffer.SkillCategory = 177;
    candidateOffer.State = this.StateId;
    // candidateOffer.Zone = 2;
    candidateOffer.LstCandidateRateSet = [];
    candidateOffer.LstCandidateRateSet.push(candidateR);
    this.napsForm.get('Insurance').value != null ? candidateOffer.InsurancePlan = this.napsForm.get('Insurance').value : true;
    this.napsForm.get('OnCostInsuranceAmount').value != "" && this.napsForm.get('OnCostInsuranceAmount').value != null ? candidateOffer.OnCostInsurance = this.napsForm.get('OnCostInsuranceAmount').value : true;
    this.napsForm.get('FixedDeductionAmount').value != "" && this.napsForm.get('FixedDeductionAmount').value != null ? candidateOffer.FixedInsuranceDeduction = this.napsForm.get('FixedDeductionAmount').value : true;
    this.napsForm.get('Gmc').value != "" && this.napsForm.get('Gmc').value != null ? candidateOffer.GMCAmount = this.napsForm.get('Gmc').value : true;
    this.napsForm.get('Gpa').value != "" && this.napsForm.get('Gpa').value != null ? candidateOffer.GPAAmount = this.napsForm.get('Gpa').value : true;

    candidateOffer.LstPayGroupProductOverrRides = this.LstPayGroupProductOverrRides;
    candidateOffer.IsMinimumWageCheckNotRequired = true;

    console.log('BREAKUP DETAILS :: ', candidateOffer);
    this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(candidateOffer))).subscribe((res) => {
      let apiResult: apiResult = res;
      this.spinner = false;
      console.log('apiResult', apiResult);
      if (apiResult.Status) {
        let offerDetails: CandidateOfferDetails;

        if (typeof apiResult.Result === 'string') {
          try {
            offerDetails = JSON.parse(apiResult.Result) as CandidateOfferDetails;
          } catch (error) {
            console.error('Failed to parse apiResult.Result as JSON:', error);
            offerDetails = new CandidateOfferDetails();
          }
        } else {
          offerDetails = apiResult.Result as CandidateOfferDetails;
        }

        this.candidateOfferBreakupDetails = new CandidateOfferDetails();
        this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = [];
        this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = offerDetails.LstPayGroupProductOverrRides;
        this.candidateOfferBreakupDetails.IsMinimumwageAdhere = offerDetails.IsMinimumwageAdhere;
        this.candidateOfferBreakupDetails.CalculationRemarks = offerDetails.CalculationRemarks;
        // this.candidateOfferBreakupDetails.RequestType = offerDetails.RequestType;
        // this.candidateOfferBreakupDetails.LetterTemplateId = offerDetails.LetterTemplateId;
        this.candidateOfferBreakupDetails.IsRateSetValid = offerDetails.IsRateSetValid;
        this.candidateOfferBreakupDetails.LstCandidateRateSet = [];
        this.IsRateSetCalculated = offerDetails.IsRateSetValid;
        let cRt = new CandidateRateset();
        cRt.LstRateSet = [];
        cRt.LstRateSet = offerDetails.LstCandidateRateSet[0].LstRateSet;
        this.candidateOfferBreakupDetails.LstCandidateRateSet.push(cRt);
        console.log('Candidate Offer Breakup Details', this.candidateOfferBreakupDetails);

        this.loadingScreenService.stopLoading();
        this.populateSalaryBreakupModal(offerDetails);
      }
      else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
      }

      console.log(apiResult.Result);

    }), ((err) => {

    })

  }

  PreviewSalaryBreakup(index) {

    const promise = new Promise((res, rej) => {
      var candidateR = new CandidateRateset();
      candidateR.AnnualSalary = this.napsForm.get('Stipend').value * 12;
      candidateR.IsMonthlyValue = true;
      candidateR.LstRateSet = null;
      candidateR.MonthlySalary = this.napsForm.get('Stipend').value;
      candidateR.PayGroupdId = this.PayGroupId;
      candidateR.Salary = (this.napsForm.get('Stipend').value * 12);
      candidateR.SalaryBreakUpType = environment.environment.DefaultSBT;

      var candidateOffer = new CandidateOfferDetails();
      candidateOffer.ActualDateOfJoining = moment(this.napsForm.get('StartDate').value).format('YYYY-MM-DD');
      candidateOffer.CalculationRemarks = "";
      candidateOffer.CityId = this.CityId;
      candidateOffer.ClientContractId = this.defaultSearchInputs.ClientContractId;
      candidateOffer.ClientId = this.defaultSearchInputs.ClientId;
      candidateOffer.DateOfJoining = moment(this.napsForm.get('StartDate').value).format('YYYY-MM-DD');
      candidateOffer.Gender = this.napsForm.get('Gender').value;
      // candidateOffer.IndustryId = 38;
      candidateOffer.IsMinimumwageAdhere = true;
      candidateOffer.IsRateSetValid = true;
      candidateOffer.Location = this.napsForm.get('WorkLocation').value;
      // candidateOffer.SkillCategory = 177;
      candidateOffer.State = this.StateId;
      // candidateOffer.Zone = 2;
      candidateOffer.LstCandidateRateSet = [];
      candidateOffer.LstCandidateRateSet.push(candidateR);
      this.napsForm.get('Insurance').value != null ? candidateOffer.InsurancePlan = this.napsForm.get('Insurance').value : true;
      this.napsForm.get('OnCostInsuranceAmount').value != "" && this.napsForm.get('OnCostInsuranceAmount').value != null ? candidateOffer.OnCostInsurance = this.napsForm.get('OnCostInsuranceAmount').value : true;
      this.napsForm.get('FixedDeductionAmount').value != "" && this.napsForm.get('FixedDeductionAmount').value != null ? candidateOffer.FixedInsuranceDeduction = this.napsForm.get('FixedDeductionAmount').value : true;
      this.napsForm.get('Gmc').value != "" && this.napsForm.get('Gmc').value != null ? candidateOffer.GMCAmount = this.napsForm.get('Gmc').value : true;
      this.napsForm.get('Gpa').value != "" && this.napsForm.get('Gpa').value != null ? candidateOffer.GPAAmount = this.napsForm.get('Gpa').value : true;

      candidateOffer.LstPayGroupProductOverrRides = this.LstPayGroupProductOverrRides;
      candidateOffer.IsMinimumWageCheckNotRequired = true;

      console.log('BREAKUP DETAILS :: ', candidateOffer);
      this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(candidateOffer))).subscribe((res) => {
        let apiResult: apiResult = res;
        // this.spinner = false;
        console.log('apiResult', apiResult);
        if (apiResult.Status) {
          var offerDetails: CandidateOfferDetails = apiResult.Result as any;
          this.candidateOfferBreakupDetails = new CandidateOfferDetails();
          this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = [];
          this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = offerDetails.LstPayGroupProductOverrRides;
          this.candidateOfferBreakupDetails.IsMinimumwageAdhere = offerDetails.IsMinimumwageAdhere;
          this.candidateOfferBreakupDetails.CalculationRemarks = offerDetails.CalculationRemarks;
          // this.candidateOfferBreakupDetails.RequestType = offerDetails.RequestType;
          // this.candidateOfferBreakupDetails.LetterTemplateId = offerDetails.LetterTemplateId;
          this.candidateOfferBreakupDetails.IsRateSetValid = offerDetails.IsRateSetValid;
          this.candidateOfferBreakupDetails.LstCandidateRateSet = [];
          this.IsRateSetCalculated = offerDetails.IsRateSetValid;
          let cRt = new CandidateRateset();
          cRt.LstRateSet = [];
          cRt.LstRateSet = offerDetails.LstCandidateRateSet[0].LstRateSet;
          this.candidateOfferBreakupDetails.LstCandidateRateSet.push(cRt);

          console.log('Candidate Offer Breakup Details', this.candidateOfferBreakupDetails);
          this.postSalaryBreakup(index);
          res(true);
          // this.loadingScreenService.stopLoading();
          // this.populateSalaryBreakupModal(offerDetails);
        }
        else {
          var LstRS = [
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 288,
              "ProductCode": "Stipend",
              "DisplayName": "Stipend",
              "Value": this.napsForm.get('Stipend').value,
              "IsOveridable": true,
              "DisplayOrder": 1,
              "IsDisplayRequired": true,
              "ProductTypeCode": "Earning",
              "ProductTypeId": 1,
              "RuleId": 406,
              "ProductCTCPayrollRuleMappingId": 115,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 8,
              "ProductCode": "LTA",
              "DisplayName": "Leave Travel Allowance",
              "Value": 0,
              "IsOveridable": true,
              "DisplayOrder": 15,
              "IsDisplayRequired": true,
              "ProductTypeCode": "Earning",
              "ProductTypeId": 1,
              "RuleId": 0,
              "ProductCTCPayrollRuleMappingId": 34,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 11,
              "ProductCode": "GrossEarn",
              "DisplayName": "Gross Earning",
              "Value": this.napsForm.get('Stipend').value,
              "IsOveridable": false,
              "DisplayOrder": 44,
              "IsDisplayRequired": true,
              "ProductTypeCode": "Total",
              "ProductTypeId": 6,
              "RuleId": 379,
              "ProductCTCPayrollRuleMappingId": 6,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 14,
              "ProductCode": "Insurance",
              "DisplayName": "Insurance",
              "Value": this.napsForm.get('OnCostInsuranceAmount').value,
              "IsOveridable": true,
              "DisplayOrder": 51,
              "IsDisplayRequired": true,
              "ProductTypeCode": "OnCost",
              "ProductTypeId": 4,
              "RuleId": 0,
              "ProductCTCPayrollRuleMappingId": 43,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 50,
              "ProductCode": "WorkmenComp",
              "DisplayName": "WorkmenComp",
              "Value": 0,
              "IsOveridable": true,
              "DisplayOrder": 61,
              "IsDisplayRequired": true,
              "ProductTypeCode": "OnCost",
              "ProductTypeId": 4,
              "RuleId": 0,
              "ProductCTCPayrollRuleMappingId": 61,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 17,
              "ProductCode": "CTC",
              "DisplayName": "CTC",
              "Value": this.napsForm.get('OnCostInsuranceAmount').value != "" ? (this.napsForm.get('OnCostInsuranceAmount').value + this.napsForm.get('Stipend').value) : this.napsForm.get('Stipend').value,
              "IsOveridable": false,
              "DisplayOrder": 65,
              "IsDisplayRequired": true,
              "ProductTypeCode": "Total",
              "ProductTypeId": 6,
              "RuleId": 382,
              "ProductCTCPayrollRuleMappingId": 1,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 21,
              "ProductCode": "GrossDedn",
              "DisplayName": "Gross Deduction",
              "Value": 0,
              "IsOveridable": false,
              "DisplayOrder": 81,
              "IsDisplayRequired": true,
              "ProductTypeCode": "Total",
              "ProductTypeId": 6,
              "RuleId": 380,
              "ProductCTCPayrollRuleMappingId": 5,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            },
            {
              "Id": 0,
              "EmployeeRatesetId": 0,
              "EmployeeId": 0,
              "ProductId": 22,
              "ProductCode": "NetPay",
              "DisplayName": "Net Pay",
              "Value": this.napsForm.get('Stipend').value,
              "IsOveridable": false,
              "DisplayOrder": 83,
              "IsDisplayRequired": true,
              "ProductTypeCode": "Total",
              "ProductTypeId": 6,
              "RuleId": 381,
              "ProductCTCPayrollRuleMappingId": 7,
              "Modetype": 0,
              "ClientId": 0,
              "CandidateId": 0,
              "PaymentType": 0,
              "PayableRate": 0,
              "BillableRate": 0,
              "BillingType": 0
            }
          ];

          this.candidateOfferBreakupDetails = new CandidateOfferDetails();
          this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = [];
          this.candidateOfferBreakupDetails.IsMinimumwageAdhere = offerDetails.IsMinimumwageAdhere;
          this.candidateOfferBreakupDetails.CalculationRemarks = "";
          this.candidateOfferBreakupDetails.IsRateSetValid = true;
          this.candidateOfferBreakupDetails.LstCandidateRateSet = [];
          let cRt = new CandidateRateset();
          cRt.LstRateSet = [];
          cRt.LstRateSet = LstRS;
          this.candidateOfferBreakupDetails.LstCandidateRateSet.push(cRt);

          console.log('Candidate Offer Breakup Details', this.candidateOfferBreakupDetails);
          this.postSalaryBreakup(index);
          res(true);
          // this.loadingScreenService.stopLoading();
          // this.alertService.showWarning(apiResult.Message);
        }
        res(true);
        console.log(apiResult.Result);

      }), ((err) => {

      })
      res(true);
    });
    return promise;



    // this.submitted = true;

    // if (this.napsForm.invalid) {
    //   this.alertService.showWarning('You must have filled out all the required fields and try to verify');
    //   return;
    // }

    // if (this.utilityService.isNullOrUndefined(this.napsForm.get('FirstName').value) == true) {
    //   this.alertService.showWarning("Please enter the name of the candidate");
    //   return;
    // }

    // else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Gender').value) == true) {
    //   this.alertService.showWarning('Please select a gender');
    //   return;
    // }
    // else if (this.utilityService.isNullOrUndefined(this.napsForm.get('WorkLocation').value) == true) {
    //   this.alertService.showWarning('Please select a work location for the candidate.');
    //   return;
    // }
    // else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Team').value) == true) {
    //   this.alertService.showWarning('Please select a team.');
    //   return;
    // }
    // else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Stipend').value) == true) {
    //   this.alertService.showWarning("Enter the candidate's Stipend");
    //   return;
    // }
    // else if (this.utilityService.isNullOrUndefined(this.napsForm.get('Stipend').value) == false && (this.napsForm.get('Stipend').value) == 0) {
    //   this.alertService.showWarning("The Stipend amount should be greater than 0");
    //   return;
    // }

    // else if (this.utilityService.isNullOrUndefined(this.napsForm.get('StartDate').value) == true) {
    //   this.alertService.showWarning('Please choose the Start date.');
    //   return;
    // }

    // var date = moment(this.napsForm.get('StartDate').value);
    // if (!date.isValid) {
    //   this.alertService.showWarning('Please enter valid Start Date (DD-MM-YYYY)');
    //   return;
    // }

    // this.spinner = true;
    // console.log('this.candidateOfferBreakupDetails', this.candidateOfferBreakupDetails);


    // if (this.CandidateId == 0 && this.candidateOfferBreakupDetails != null && this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0 &&
    //   this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet != null && this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet.length > 0) {
    //   this.candidateOfferBreakupDetails.IsRateSetValid = true;
    //   this.populateSalaryBreakupModal(this.candidateOfferBreakupDetails);
    //   return;

    // }
    // if (this.CandidateId > 0 && this.candidateOfferBreakupDetails != null && this.candidateOfferBreakupDetails.LstCandidateRateSet.length > 0 &&
    //   this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet != null && this.candidateOfferBreakupDetails.LstCandidateRateSet[0].LstRateSet.length > 0) {
    //   this.candidateOfferBreakupDetails.IsRateSetValid = true;
    //   this.populateSalaryBreakupModal(this.candidateOfferBreakupDetails);
    //   return;

    // }

    // else if (this.CandidateId > 0 && this._NewCandidateDetails && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
    //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
    //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
    //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0) {
    //   this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = true;
    //   this.populateSalaryBreakupModal(this._NewCandidateDetails.LstCandidateOfferDetails[0]);
    //   return;
    // }


  }

  populateSalaryBreakupModal(offerDetails: CandidateOfferDetails) {
    console.log('offerDetails', offerDetails);

    try {
      const modalRef = this.modalService.open(SalaybreakupdetailsComponent, this.modalOption);
      modalRef.componentInstance.id = 0;
      modalRef.componentInstance.baseDaysForAddlApplicableProduct = null;
      modalRef.componentInstance.PayGroupId = this.napsForm.get('PayGroup').value;;
      modalRef.componentInstance.ClientContractId = this.defaultSearchInputs.ClientContractId;
      modalRef.componentInstance.jsonObj = offerDetails.LstCandidateRateSet[0].LstRateSet;
      modalRef.componentInstance.newCandidateOfferObj = offerDetails;
      modalRef.componentInstance.fromComponent = "NAPS";
      modalRef.componentInstance.IsMinimumWageCheckNotRequired = true;//  offerDetails.IsMinimumWageCheckNotRequired;

      modalRef.result.then((result) => {
        console.log('result', result);
        this.spinner = false;
        this.candidateOfferBreakupDetails = new CandidateOfferDetails();
        this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = [];
        this.candidateOfferBreakupDetails.LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
        this.candidateOfferBreakupDetails.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this.candidateOfferBreakupDetails.CalculationRemarks = result.CalculationRemarks;
        this.candidateOfferBreakupDetails.RequestType = result.RequestType;
        this.candidateOfferBreakupDetails.LetterTemplateId = result.LetterTemplateId;
        this.candidateOfferBreakupDetails.IsRateSetValid = result.IsRateSetValid;
        this.candidateOfferBreakupDetails.LstCandidateRateSet = [];
        this.IsRateSetCalculated = result.IsRateSetValid;
        let cRt = new CandidateRateset();
        cRt.LstRateSet = [];
        cRt.LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        this.candidateOfferBreakupDetails.LstCandidateRateSet.push(cRt);

        console.log('this.candidateOfferBreakupDetails', this.candidateOfferBreakupDetails);


      }).catch((error) => {
        console.log(error);
      });


    } catch (error) {

      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(error);
    }
  }

  autoFill() {
    // this.getMigrationMasterInfo(this.defaultSearchInputs.ClientContractId).then((response) => { });
    this.headerService.aadhaarDetails.subscribe(aadhaarDetails => {
      console.log('Aadhaar Details ::', aadhaarDetails);
      this.aadhaarDetails = aadhaarDetails;
      if (this.aadhaarDetails && this.CandidateId == 0) {
        this.KYCAadhaarDocumentId = 0;
        this.KYCProfileDocumentId = 0;
        this.IsAadhaarKYC = true;
        this.patchAadhaarDetails()
        this.spinner = false;
      }
    });
  }

  patchAadhaarDetails() {
    let aadhaarResponseData = {
      address: {
        splitAddress: {

          country: "",
          district: "",
          houseNumber: "",
          landmark: "",
          location: "",
          pincode: "",
          postOffice: "",
          state: "",
          street: "",
          subdistrict: "",
          vtcName: ""
        },
        combinedAddress: ""
      },
      dob: "",
      emailHash: "",
      fatherName: "",
      file: {
        pdfContent: "",
        xmlContent: ""
      },
      gender: "",
      image: "",
      name: "",
      mobileHash: "",
      maskedAadhaarNumber: ""
    };

    aadhaarResponseData = this.aadhaarDetails;
    this.napsForm.controls['FirstName'].setValue(aadhaarResponseData.name);
    this.napsForm.controls['AadhaarNumber'].setValue(aadhaarResponseData.maskedAadhaarNumber);
    const date = moment(aadhaarResponseData.dob, 'YYYY-MM-DD').format('YYYY-MM-DD');
    console.log(new Date(date))

    this.napsForm.controls['DOB'] != null ? this.napsForm.controls['DOB'].setValue(this.datePipe.transform(new Date(date).toString(), "dd-MM-yyyy")) : null;

    if (this.aadhaarDetails && aadhaarResponseData) {
      let fathername = "";
      fathername = aadhaarResponseData.fatherName;

      if (aadhaarResponseData.gender == 'M') {
        this.napsForm.controls['Gender'] != null ? this.napsForm.controls['Gender'].setValue(1) : null;
      }
      else if (aadhaarResponseData.gender == 'F') {
        this.napsForm.controls['Gender'] != null ? this.napsForm.controls['Gender'].setValue(2) : null;
      }
      else {
        this.napsForm.controls['Gender'] != null ? this.napsForm.controls['Gender'].setValue(3) : null;
      }

      this.napsForm.controls['FathersName'] != null ? this.napsForm.controls['FathersName'].setValue(fathername) : null;


      const address1 = `${aadhaarResponseData.address.splitAddress.houseNumber != null ? aadhaarResponseData.address.splitAddress.houseNumber : ''}, ${aadhaarResponseData.address.splitAddress.street != null ? aadhaarResponseData.address.splitAddress.street : ''}, ${aadhaarResponseData.address.splitAddress.location != null ? aadhaarResponseData.address.splitAddress.location : ''}`;
      const address2 = `${aadhaarResponseData.address.splitAddress.postOffice != null ? aadhaarResponseData.address.splitAddress.postOffice : ''}, ${aadhaarResponseData.address.splitAddress.subdistrict != null ? aadhaarResponseData.address.splitAddress.subdistrict : ''}`;
      const address3 = aadhaarResponseData.address.splitAddress.landmark != null ? `${aadhaarResponseData.address.splitAddress.landmark}` : '';

      this.napsForm.controls['presentAddressdetails'] != null ? this.napsForm.controls['presentAddressdetails'].setValue(address1) : null;
      this.napsForm.controls['presentAddressdetails1'] != null ? this.napsForm.controls['presentAddressdetails1'].setValue(address2) : null;
      this.napsForm.controls['presentAddressdetails2'] != null ? this.napsForm.controls['presentAddressdetails2'].setValue(address3) : null;
      this.napsForm.controls['presentPincode'] != null ? this.napsForm.controls['presentPincode'].setValue(aadhaarResponseData.address.splitAddress.pincode) : null;
      this.napsForm.controls['presentCountryName'] != null ? this.napsForm.controls['presentCountryName'].setValue(environment.environment.DefaultCountryId_India) : null;
      this.napsForm.controls['presentCity'] != null ? this.napsForm.controls['presentCity'].setValue(aadhaarResponseData.address.splitAddress.vtcName != null ? aadhaarResponseData.address.splitAddress.vtcName : '') : null;

      this.napsForm.controls['permanentAddressdetails'] != null ? this.napsForm.controls['permanentAddressdetails'].setValue(address1) : null;
      this.napsForm.controls['permanentAddressdetails1'] != null ? this.napsForm.controls['permanentAddressdetails1'].setValue(address2) : null;
      this.napsForm.controls['permanentAddressdetails2'] != null ? this.napsForm.controls['permanentAddressdetails2'].setValue(address3) : null;
      this.napsForm.controls['permanentCountryName'] != null ? this.napsForm.controls['permanentCountryName'].setValue(environment.environment.DefaultCountryId_India) : null;
      this.napsForm.controls['permanentPincode'] != null ? this.napsForm.controls['permanentPincode'].setValue(aadhaarResponseData.address.splitAddress.pincode) : null;
      this.napsForm.controls['permanentCity'] != null ? this.napsForm.controls['permanentCity'].setValue(aadhaarResponseData.address.splitAddress.vtcName != null ? aadhaarResponseData.address.splitAddress.vtcName : '') : null;
      this.getCountryList();

      this.onboardingService.GetStateListByCountryId(environment.environment.DefaultCountryId_India).subscribe((result) => {
        if (result && result.length > 0) {
          let stateId = result.find(a => a.Name.toUpperCase() == aadhaarResponseData.address.splitAddress.state.toUpperCase()).Id;
          this.napsForm.controls['presentStateName'] != null ? this.napsForm.controls['presentStateName'].setValue((Number(stateId) == Number(0) || stateId == null) ? null : (Number(stateId))) : null;
          this.napsForm.controls['permanentStateName'] != null ? this.napsForm.controls['permanentStateName'].setValue((Number(stateId) == Number(0) || stateId == null) ? null : (Number(stateId))) : null;
          this.StateList = result;
          this.StateList1 = result;
        }

      })
      console.log('VAL ::', this.napsForm.value);
      this.napsForm.controls['FirstName'].disable();
      this.napsForm.controls['DOB'].disable();
      this.napsForm.controls['AadhaarNumber'].disable();
      // var urll = 'data:image/png;base64,' + encodeURIComponent(aadhaarResponseData.image);
      // this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
    }

  }



  // EDIT 

  getCandidateDetailsById(mode) {

    const promise = new Promise((res, rej) => {

      let req_param_uri = `Id=${this.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
      this.onboardingService.getCandidate(req_param_uri).subscribe((data: apiResponse) => {
        let apiResponse: apiResponse = data;

        this.doPatch(apiResponse, mode).then((result) => { if (result) { res(true); } });

      },
        (err) => {
          res(false);
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`Something is wrong!  ${err}`);
        });

    })
    return promise;
  }

  doPatch(apiResponse, mode) {
    const promise = new Promise((res, rej) => {

      try {
        this.spinner = true
        if (apiResponse.Status) {
          this.candidateModel = (apiResponse.dynamicObject);
          this._NewCandidateDetails = this.candidateModel.NewCandidateDetails;
          this._OldCandidateDetails = Object.assign({}, this.candidateModel.OldCandidateDetails)

          if (this._NewCandidateDetails.CandidateCommunicationDtls != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.length > 0 && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal) != undefined) {
            this.napsForm.controls['PrimaryEmail'] != null ? this.napsForm.controls['PrimaryEmail'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryEmail) : null;
            this.napsForm.controls['MobileNumber'] != null ? this.napsForm.controls['MobileNumber'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryMobile) : null;
          }

          this.napsForm.patchValue({
            FirstName: this._NewCandidateDetails.FirstName,
            Gender: this._NewCandidateDetails.Gender == 0 as any ? null : this._NewCandidateDetails.Gender,
            DOB: (this._NewCandidateDetails.DateOfBirth == null ? null : this.datePipe.transform(new Date(this._NewCandidateDetails.DateOfBirth).toString(), "dd-MM-yyyy")),
          })

          if (this._NewCandidateDetails.LstCandidateOfferDetails != null) {

            // RE-ONBOARDING CANDIDATE

            if (this.defaultSearchInputs.IsReOnboard) {

              this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId = 0;
              this.napsForm.patchValue({
                ApprenticeCode: "",
                FathersName: this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName,
                clientName: this.defaultSearchInputs.ClientId,
                clientContract: this.defaultSearchInputs.ClientContractId,
                AadhaarNumber: this._NewCandidateDetails.LstCandidateOfferDetails[0].Aadhaar,
                ContractCode: "",
                Stipend: 0,
                Insurance: null,
                WorkLocation: null,
                Team: null,
                StartDate: null,
                EndDate: null,
                PayPeriod: null,
                CostCodeid: null,
                PayGroup: null,
                Gmc: 0,
                Gpa: 0,
                FixedDeductionAmount: "",
                OnCostInsuranceAmount: "",
              });

              this._NewCandidateDetails.LstCandidateOfferDetails[0].CreatedBy = null;
              this._NewCandidateDetails.LstCandidateOfferDetails[0].LastUpdatedBy = null;

            } else {

              this.napsForm.patchValue({

                ApprenticeCode: this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprenticeCode,
                FathersName: this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName,
                clientName: this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId,
                clientContract: this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId,
                AadhaarNumber: this._NewCandidateDetails.LstCandidateOfferDetails[0].Aadhaar,
                ContractCode: this._NewCandidateDetails.LstCandidateOfferDetails[0].NapsContractCode,
                Stipend: this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary : null,
                Insurance: this._NewCandidateDetails.LstCandidateOfferDetails[0].InsurancePlan,
                WorkLocation: this._NewCandidateDetails.LstCandidateOfferDetails[0].Location,
                Team: this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null,
                StartDate: this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining) : null,
                EndDate: this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate) : null,
                PayPeriod: this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId : null,
                PayGroup: this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId : null,
                CostCodeId: this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId : null,

                Gmc: this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount,
                Gpa: this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount,
                FixedDeductionAmount: this._NewCandidateDetails.LstCandidateOfferDetails[0].FixedInsuranceDeduction,
                OnCostInsuranceAmount: (this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != null || this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != "" as any) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance : null,

              });



              this.ApprovalStatus = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus != null && (this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus == ApprovalStatus.Rejected || this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus == ApprovalStatus.Approved) ? true : false;
              this.ApprovalRemarks = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalRemarks : null;

              this.IsRateSetCalculated = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ? true : false;

            }


          }

          // OTHER DATA

          if (this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0) {
            this.napsForm.controls['PANNumber'] != null ? this.napsForm.controls['PANNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PAN) : null;
          }

          // For Candidate Communication accordion  (Edit)
          if (this._NewCandidateDetails.CandidateCommunicationDtls != null) {
            let _addressDetails: AddressDetails[] = [];
            _addressDetails = this._NewCandidateDetails.CandidateCommunicationDtls.LstAddressdetails;
            try {
              _addressDetails.forEach(element => {
                if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Present) {
                  this.napsForm.controls['presentAddressdetails'] != null ? this.napsForm.controls['presentAddressdetails'].setValue(element.Address1) : null;
                  this.napsForm.controls['presentAddressdetails1'] != null ? this.napsForm.controls['presentAddressdetails1'].setValue(element.Address2) : null;
                  this.napsForm.controls['presentAddressdetails2'] != null ? this.napsForm.controls['presentAddressdetails2'].setValue(element.Address3) : null;
                  this.napsForm.controls['presentCountryName'] != null ? this.napsForm.controls['presentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
                  this.napsForm.controls['presentPincode'] != null ? this.napsForm.controls['presentPincode'].setValue(element.PinCode) : null;
                  this.napsForm.controls['presentStateName'] != null ? this.napsForm.controls['presentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
                  this.napsForm.controls['presentCity'] != null ? this.napsForm.controls['presentCity'].setValue(element.City) : null;
                }
                if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Permanent) {
                  this.napsForm.controls['permanentAddressdetails'] != null ? this.napsForm.controls['permanentAddressdetails'].setValue(element.Address1) : null;
                  this.napsForm.controls['permanentAddressdetails1'] != null ? this.napsForm.controls['permanentAddressdetails1'].setValue(element.Address2) : null;
                  this.napsForm.controls['permanentAddressdetails2'] != null ? this.napsForm.controls['permanentAddressdetails2'].setValue(element.Address3) : null;
                  this.napsForm.controls['permanentCountryName'] != null ? this.napsForm.controls['permanentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
                  this.napsForm.controls['permanentPincode'] != null ? this.napsForm.controls['permanentPincode'].setValue(element.PinCode) : null;
                  this.napsForm.controls['permanentStateName'] != null ? this.napsForm.controls['permanentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
                  this.napsForm.controls['permanentCity'] != null ? this.napsForm.controls['permanentCity'].setValue(element.City) : null;
                }
              });
            }
            catch (error) { }
          }

          try {
            // For Bank Information accordion (Edit)
            if (this._NewCandidateDetails.LstCandidateBankDetails != null && this._NewCandidateDetails.LstCandidateBankDetails.length > 0) {
              this.LstBank = [];
              this._NewCandidateDetails.LstCandidateBankDetails.forEach(element => {
                if (element.CandidateDocument != null) {
                  element.CandidateDocument.Modetype = UIMode.Edit;
                }
                if (this.utitlityService.isNullOrUndefined(element.BankId) || element.BankId == 0) {
                  this.alertService.showInfo('Bank Details did not load');
                }
                this.LstBank.push({
                  Id: element.Id,
                  id: element.Id,
                  bankName: (element.BankId),
                  accountNumber: element.AccountNumber,
                  IFSCCode: element.BankBranchId,
                  allocation: element.SalaryContributionPercentage,
                  accountHolderName: element.AccountHolderName,
                  bankBranchId: element.IdentifierValue,
                  status: element.Status,
                  proofType: "",
                  CandidateDocument: element.CandidateDocument,
                  DocumentStatus: element.CandidateDocument == null ? 'Approved' : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
                  isDocumentStatus: element.CandidateDocument == null ? 1 : element.CandidateDocument.Status,
                  Modetype: UIMode.Edit,
                  bankFullName: this.BankList.find(a => a.Id == element.BankId) != null ? this.BankList.find(a => a.Id == element.BankId).Name : '',
                  VerificationMode: element.VerificationMode,
                  VerificationAttempts: element.VerificationAttempts,
                  PayoutLogId: element.PayoutLogId,
                  Remarks: element.Remarks,
                  Attribute1: element.Attribute1

                })
                element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Bank_Details");

              });
              const checkBankId = this.LstBank.filter(a => {
                if (this.utitlityService.isNullOrUndefined(a.bankName) || a.bankName == 0) {
                  this.alertService.showInfo('Bank Details did not load');
                  return a;
                }
              });
            }
          } catch (error) {
            console.error('BANK EXCEPTION ::', error);
          }

          // For Candidate Documents accordion (Edit)
          if (this._NewCandidateDetails.LstCandidateDocuments != null) {
            this._NewCandidateDetails.LstCandidateDocuments.forEach(element => {
              if (element.IsSelfDocument == true) {
                this.lstDocumentDetails.push(element);
                this.edit_document_lst.push(
                  {
                    CandidateId: element.CandidateId,
                    DocumentId: element.DocumentId,
                    DocumentTypeId: element.DocumentTypeId,
                    DocumentNumber: element.DocumentNumber,
                    FileName: element.FileName,
                    ValidFrom: element.ValidFrom,
                    ValidTill: element.ValidTill,
                    Id: element.Id,
                    Status: element.Status,
                    Modetype: element.Modetype,
                    IsKYCVerified: element.DocumentVerificationMode == 1 ? false : true,
                  }
                )
                element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Document_Details");

              }
              else {
                this.lstDocumentDetails_additional.push(element);
              }
            });
          }

          var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
          if (isAadhaarExists != undefined) {
            this.napsForm.controls['AadhaarNumber'].setValue(Number(isAadhaarExists.DocumentNumber))
            isAadhaarExists.Status == 1 ? this.napsForm.controls['AadhaarNumber'].disable() : true;
          }


          // For Client Approval accordion (Edit)
          if (this._NewCandidateDetails.ExternalApprovals != null && !this.defaultSearchInputs.IsReOnboard) {
            this._NewCandidateDetails.ExternalApprovals.forEach(element => {
              this.clientApprovalTbl.push(
                {
                  EntityType: element.EntityType,
                  EntityId: element.EntityId,
                  ApprovalFor: element.ApprovalFor,
                  ApprovalType: element.ApprovalType,
                  ApprovalForName: this.ApprovalForList.find(z => z.id == element.ApprovalFor).name,
                  ApprovalTypeName: this.ApprovalTypeList.find(z => z.id == element.ApprovalType).name,
                  Remarks: element.Remarks,
                  DocumentName: element.DocumentName,
                  ObjectStorageId: element.ObjectStorageId,
                  Id: element.Id,
                  Status: element.Status,
                  IsApproved: element.IsApproved,
                  Modetype: element.Modetype,
                }
              )
              element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Client_Approvals");
            });
          }
          // REONBOARDING (REVISE)
          if (this._NewCandidateDetails.ExternalApprovals != null && this.defaultSearchInputs.IsReOnboard) {
            this._NewCandidateDetails.ExternalApprovals.forEach(element => {
              this.deletedLstClientApproval.push(
                {
                  EntityType: element.EntityType,
                  EntityId: element.EntityId,
                  ApprovalFor: element.ApprovalFor,
                  ApprovalType: element.ApprovalType,
                  ApprovalForName: this.ApprovalForList.find(z => z.id == element.ApprovalFor).name,
                  ApprovalTypeName: this.ApprovalTypeList.find(z => z.id == element.ApprovalType).name,
                  Remarks: element.Remarks,
                  DocumentName: element.DocumentName,
                  ObjectStorageId: element.ObjectStorageId,
                  Id: element.Id,
                  Status: element.Status,
                  IsApproved: element.IsApproved,
                  Modetype: element.Modetype,
                }
              )
              element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Client_Approvals");
            });
          }
          if (mode == 'New') {
            this.getMigrationMasterInfo(this.defaultSearchInputs.ClientContractId).then((response) => {
              this.spinner = false;
              res(true);
            });
          } else {
            this.spinner = false;
          }


        }
        else {
          this.alertService.showWarning(`Something is wrong!  ${apiResponse.Message}`);
          res(false);
        }
      } catch (error) {
        res(false);
        console.error('FETCHING CANDIDATE DETAILS EXCEPTION ERROR ::', error);

      }
    })
    return promise;
  }

  rejectedDocs_init(element, AccordionName) {
    this.rejectedLst.push({
      CandidateId: AccordionName == "Client_Approvals" ? element.EntityId : element.CandidateId,
      FileName: element.DocumentName,
      Remarks: AccordionName == "Client_Approvals" ? element.RejectionRemarks : element.Remarks,
      Accordion: AccordionName
    });
    console.log('REJECTED LIST OF ONBOARDING REQUEST :: ', this.rejectedLst);
  }

  ngOnDestroy(): void {

    sessionStorage.removeItem('isNewTransfer');
    this.headerService.setCandidateDetailsForAadhaar(null);
    this.napsForm.reset();
  }

}
