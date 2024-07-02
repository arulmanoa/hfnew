import { Component, OnInit, ViewChild, HostListener, ElementRef, Inject, OnDestroy, Input, EventEmitter, ViewEncapsulation, Renderer2 } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, Event, NavigationStart, RoutesRecognized } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/Rx';
import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
  Formatter,

} from 'angular-slickgrid';
import { HttpParams } from '@angular/common/http';
import { NgLabelTemplateDirective } from '@ng-select/ng-select/ng-select/ng-templates.directive';
import { DatePipe, CurrencyPipe } from '@angular/common';
import Swal from "sweetalert2";
import { UUID } from 'angular2-uuid';
import { Lightbox } from 'ngx-lightbox';
import 'rxjs/add/operator/pairwise';
import { DomSanitizer } from '@angular/platform-browser';
import { Location, PlatformLocation } from '@angular/common';
import { find, get, pull } from 'lodash';

// services   

import { AlertService } from 'src/app/_services/service/alert.service';
import { CountryService } from 'src/app/_services/service/country.service';
import { UIBuilderService } from 'src/app/_services/service//UIBuilder.service';
import { SessionStorage } from 'src/app/_services/service//session-storage.service';
import { OnboardingService } from 'src/app/_services/service/onboarding.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { StatesService } from 'src/app/_services/service/states.service';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
// directives 
import * as JSZip from 'jszip'; //JSZip

import { enumHelper } from 'src/app/shared/directives/_enumhelper';

// modal popup 
import { WorkexperienceModalComponent, NoticePeriod, _NoticePeriod } from 'src/app/shared/modals/workexperience-modal/workexperience-modal.component';
import { NomineeModalComponent } from 'src/app/shared/modals/nominee-modal/nominee-modal.component';
import { AcademicModalComponent } from 'src/app/shared/modals/academic-modal/academic-modal.component';
import { BankModalComponent } from 'src/app/shared/modals/bank-modal/bank-modal.component';

// model calss
import { SourceType, TenureType, CandidateOfferDetails, RequestType, OnBoardingType, IsClientApprovedBasedOn, OfferStatus } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { Gender, Nationality, BloodGroup, MaritalStatus, GraduationType, CourseType, ScoringType, AcceptanceStatus } from 'src/app/_services/model/Base/HRSuiteEnums';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { apiResult } from 'src/app/_services/model/apiResult';
import { OnBoardingInfo, ClientList, ClientContactList, RecruiterList, ClientContractList, MandatesAssignment, ExternalCandidateInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';

import * as _ from 'lodash';
import { CandidateInfo, CountryList } from 'src/app/_services/model/OnBoarding/CandidateInfo';
import { OfferInfo, IndustryList, ClientLocationList, PayGroupList, ZoneList, SkillCategoryList, LetterTemplateList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { CandidateDetails, CandidateStatus, DuplicateCandidateDetails, Approvals, ApprovalFor, ApproverType, ApprovalType } from 'src/app/_services/model/Candidates/CandidateDetails';
import { CandidateModel, _CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { WorkPermit, WorkExperience, Qualification } from 'src/app/_services/model/Candidates/CandidateCareerDetails';
import { CandidateRateset } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { CandidateStatutoryDetails, CandidateOtherData } from 'src/app/_services/model/Candidates/CandidateOtherData';
import { UIMode } from 'src/app/_services/model/UIMode';
import { ContactDetails, CommunicationDetails, AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CandidateCommunicationDetails } from 'src/app/_services/model/Candidates/CandidateCommunicationDetails';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { State, Branch, Contract } from 'src/app/components/Models/look-up-model';
import { CommunicationInfo, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { Claim, CandidateFamilyDetails, Relationship, ClaimType, _CustomCandidateFamilyDetails, RelationShip } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { CandidateBankDetails, BankBranchIdentifierType } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { BankInfo, BankList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { isNullOrUndefined } from 'util';
import { Documents } from 'src/app/_services/model/OnBoarding/Document';
import { CandidateDocuments, ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { DocumentInfo, DocumentCategoryist } from 'src/app/_services/model/OnBoarding/DocumentInfo';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { async, npost } from 'q';
import { CandidateDocumentDelete } from 'src/app/_services/model/OnBoarding/CandidateDocumentDelete';
import { PreviewCtcModalComponent } from 'src/app/shared/modals/preview-ctc-modal/preview-ctc-modal.component';

import { NgSelectComponent } from '@ng-select/ng-select';
import { ApprovalModalComponent } from 'src/app/shared/modals/approval-modal/approval-modal.component';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { elementEnd, element } from '@angular/core/src/render3';
import { ThrowStmt } from '@angular/compiler';
import { HeaderService } from 'src/app/_services/service/header.service';
import { forEach } from '@angular/router/src/utils/collection';
import { MigrationInfo, ManagerList, LeaveGroupList, CostCodeList, PayPeriodList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';

import ConfigJson from 'src/assets/json/config.json';
import * as moment from 'moment';
import { WorklocationModalComponent } from 'src/app/shared/modals/worklocation-modal/worklocation-modal.component';
import { CandidateService, SearchService } from 'src/app/_services/service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import { NoPanDeclarationModelComponent } from 'src/app/shared/modals/no-pan-declaration-model/no-pan-declaration-model.component';

@Component({
  selector: 'app-onboarding-makeoffer',
  templateUrl: './onboarding-makeoffer.component.html',
  styleUrls: ['./onboarding-makeoffer.component.scss']
})
export class OnboardingMakeofferComponent implements OnInit, OnDestroy {


  @ViewChild(NgSelectComponent) ngSelect: NgSelectComponent;
  private subscription: Subscription;

  // Local component vars

  _loginSessionDetails: LoginResponses;

  // onboarding screen radio/checkbox action event, option would be true or false based

  isOnBehalfOf: boolean = false;
  isProxy: boolean = false;
  isAttachment: boolean = false;
  isNationality: boolean = false;
  isPanCardExists: boolean = false;
  ifNoPanno: boolean = false;

  /// General dropdown description 
  selectedClient: any;
  selectedContract: any;
  selectedMandate: any;
  selectedCandidate: any;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;

  // ** Access control base prop desc
  MenuId: any;

  isOnboardingInfo: boolean = true;
  isCandidateInfo: boolean = true;
  isOfferInfo: boolean = true;
  isCommunicationdetails: boolean = true;
  isCandidateOtherdetails: boolean = true;
  isFamilydetails: boolean = true;
  isEmploymentInfo: boolean = true;
  isAcademicInfo: boolean = true;
  isBankInfo: boolean = true;
  isDocumentInfo: boolean = true;
  isClientApproval: boolean = true;
  isMigrationInfo: boolean = true;

  isRateCardType: boolean = false;
  isClose: boolean = true;
  isSubmit: boolean = true;
  isSave: boolean = true;
  isReject: boolean = true;
  previewLetter: boolean = true;
  previewCTC: boolean = true;

  // dropdown List from API resposnse 

  OnBoardingInfoListGrp: OnBoardingInfo;
  CandidateInfoListGrp: CandidateInfo;
  OfferInfoListGrp: OfferInfo;
  OfferInfoListGrp1: OfferInfo; // Handle for spliting two seprate list Skills and Zone list
  CommunicationListGrp: CommunicationInfo;
  BankInfoListGrp: BankInfo;
  DocumentInfoListGrp: DocumentInfo;
  MigrationInfoGrp: MigrationInfo;

  TeamList: any;
  ManagerList: ManagerList[] = [];
  LeaveGroupList: LeaveGroupList[] = [];
  CostCodeList: CostCodeList[] = [];
  ActualDOJ: any;
  EffectivePayPeriodList: PayPeriodList[] = []

  BankList: BankList[] = [];
  ClientList?: ClientList[] = [];
  ClientContactList: ClientContactList[] = [];
  ClientContractList: ClientContractList[] = [];
  RecruiterList: RecruiterList[] = [];
  MandatesList: MandatesAssignment[] = [];
  CandidateList: ExternalCandidateInfo[] = [];
  CountryList: CountryList[] = [];
  CountryList_NonIndian: CountryList[] = [];

  StateList: StateList[] = [];
  StateList1: StateList[] = [];
  IndustryList: IndustryList[] = [];
  ClientLocationList: ClientLocationList[] = [];
  PayGroupList: PayGroupList[] = [];
  SkillCategoryList: SkillCategoryList[] = [];
  ZoneList: ZoneList[] = [];
  DocumentList: Documents[] = [];
  DocumentCategoryist = [];
  LetterTemplateList: LetterTemplateList[] = [];
  LetterTemplateListOL: LetterTemplateList[] = [];
  LetterTemplateListAL: LetterTemplateList[] = [];

  // candidate save model 

  candidateModel: CandidateModel = new CandidateModel();
  candidateDetails: CandidateDetails = new CandidateDetails;
  candidateOfferDetails: CandidateOfferDetails = new CandidateOfferDetails;
  OldcandidateOfferDetails: CandidateOfferDetails = new CandidateOfferDetails;

  workPermitDetails: WorkPermit = new WorkPermit;
  candidateRateSetDetails: CandidateRateset = new CandidateRateset;
  candidateOtherDetails: CandidateOtherData = new CandidateOtherData();
  candidateStatutoryDetails: CandidateStatutoryDetails = new CandidateStatutoryDetails;
  candidateContactDetails: ContactDetails = new ContactDetails;
  candidateCommunicationDetails: CandidateCommunicationDetails = new CandidateCommunicationDetails;
  candidateAddressDetails: AddressDetails = new AddressDetails;
  candidateFamilyDetails: CandidateFamilyDetails = new CandidateFamilyDetails();
  // candidateExperienceDetails: WorkExperience = new WorkExperience();
  // candidateBankDetails: CandidateBankDetails = new CandidateBankDetails();
  // candidateQualificationDetails: Qualification = new Qualification();
  candidateDocumentDetails: CandidateDocuments = new CandidateDocuments();

  lstCandidateOfferDetails: CandidateOfferDetails[] = [];

  lstWorkPermitDetails: WorkPermit[] = [];
  lstStatutoryDetails: CandidateStatutoryDetails[] = [];
  lstContactDetails: ContactDetails[] = [];
  lstRateSetDetails: CandidateRateset[] = []
  lstAddressDetails: AddressDetails[] = [];
  lstFamilyDetails: CandidateFamilyDetails[] = [];
  lstExperienceDetails: WorkExperience[] = [];
  lstBankDetails: CandidateBankDetails[] = [];
  lstQualificationDetails: Qualification[] = [];
  lstDocumentDetails: CandidateDocuments[] = [];
  lstStorageDetails: ObjectStorageDetails;
  lstClaim: Claim[] = [];
  lstClientApporval: Approvals[] = [];

  deletedLstNominee = []; // for server delete 
  deletedLstEducation = [];
  deletedLstExperience = [];
  deletedLstBank = [];
  deletedLstCandidateDocument = [];
  deletedLstClientApproval = [];

  lstCandidateFamilyDocuments: CandidateDocuments[] = [];
  previewCTC_OfferDetails: CandidateOfferDetails = new CandidateOfferDetails();
  // for Edit binding data

  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  _OldCandidateDetails: CandidateDetails = new CandidateDetails();

  // spinner 

  should_spin_onboarding: boolean = true;
  isLoading: boolean = false;

  // hardcodded json list - remove it forom production

  // url: string = "";

  sourceTypes: any = [];
  gender: any = [];
  nationality: any = [];
  salaryType: any = [];
  tenureType: any = [];
  bloodGroup: any = [];
  maritialStatus: any = [];
  ApprovalForList: any = [];
  ApprovalTypeList: any = [];

  relationship: any = [];
  graduationType: any = [];
  courseType: any = [];
  scoringType: any = [];

  DateOfJoining: any;

  countryCode: any;
  LstcountryCode = [
    {
      id: 1,
      name: "91"
    },
    {
      id: 2,
      name: "01"
    },
    {
      id: 3,
      name: "99"
    },
    {
      id: 4,
      name: "66"
    },
    {
      id: 5,
      name: "65"
    },
    {
      id: 6,
      name: "60"
    },
    {
      id: 1,
      name: "983"
    }
  ];


  /* #region  Nominee Slick Grid */
  columnDefinitions: Column[] = [];
  gridOptions: GridOption = {};
  LstNominees = [];
  angularGrid: AngularGridInstance;
  gridObj1: any;
  /* #endregion */

  /* #region  Experience Slick grid */
  columnDefinitions_Experience: Column[] = [];
  gridOptions_Experience: GridOption = {};
  LstExperience: any[] = [];
  angularGrid_Experience: AngularGridInstance;
  gridObj_Experience: any;
  /* #endregion */

  /* #region  Education Slick grid */
  columnDefinitions_Education: Column[] = [];
  gridOptions_Education: GridOption = {};
  LstEducation: any[] = [];
  angularGrid_Education: AngularGridInstance;
  gridObj_Education: any;
  /* #endregion */

  /* #region  Bank Slick Grid */
  columnDefinitions_Bank: Column[] = [];
  gridOptions_Bank: GridOption = {};
  LstBank: any[] = [];
  angularGrid_Bank: AngularGridInstance;
  gridObj_Bank: any;
  /* #endregion */


  candidatesForm: FormGroup;
  Id: number = 0;
  CandidateId: number = 0;
  UserId: any;
  UserName: any;
  alternativeUserId_For_Mandates: any
  RoleId: any;
  CompanyId: any;
  ImplementationCompanyId: any;
  EntityId: any;
  salaryInwords: any;
  DOB: any;
  CandidateAcceptanceStatus: boolean = false;
  CandidateAcceptanceRejectRemarks: any;
  TransactionRemarks: any;
  _LstRateSet: any[] = [];

  ClientId: any;
  ClientContractId: any;
  MandateAssignmentId: any;

  nonIndian: boolean = false;
  ClientLocationId: any;


  Label_CurrentStatus: any;


  counter = 0;
  LocationLabel: string = ""; // We don't want to classify *any* DOM node as a function.
  IndustryId: any;
  StateId: any;
  CityId: any;
  SalaryFormat: any;
  MonthlySalaryFormat: any;
  StateName: any;
  CityName: any;
  isRateSetValid: boolean = false;
  IsMinimumwageAdhere: boolean = true;
  isESICapplicable: boolean = false;
  AcceptanceStatus: any;
  ApprovalRemarks: any;
  ApprovalStatus: any;

  isSameAddress = false;
  isFresher = false;
  isWorkExperienceFlag: boolean = false;
  fileName: string;
  isEditMode: boolean = true;
  // final submit 

  workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;
  accessControl_submit: UserInterfaceControlLst = new UserInterfaceControlLst;
  accessControl_reject: UserInterfaceControlLst = new UserInterfaceControlLst;
  userAccessControl;
  model = Date();

  myDateValue: Date;

  DOBmaxDate: Date;
  DOJminDate: Date;
  DOJmaxDate: Date;
  TenureminDate: Date;
  ActualDOJminDate: Date;
  ActualDOJmaxDate: Date;
  workPermitminDate: Date;

  documentTbl = [];
  duplicateDocumentTbl = [];
  currentId: any;
  isUploadFlag: any;
  edit_document_lst = [];
  unsavedDocumentLst = [];
  deleted_DocumentIds_List = [];
  private _albums: Array<string> = [];
  clientApprovalTbl = [];

  fileToUpload: File = null;
  spinner_fileuploading: boolean = false;

  tblminDate: Date;
  istblloading: boolean = false;
  previousUrl: string;
  RateCardTypelable: any;

  imagePath: any;

  rejectedLst = [];
  isValidateCandidate: boolean = true;

  PayCycleDetails: any;

  accordionhighlights_documents: boolean = false;
  invaid_fields = [];
  OnBoarding_Title_Label: any;
  localURL_Path: any;

  isNewTransfer = false;
  // isRedoOffer = false;

  modalOption: NgbModalOptions = {};
  GroupControlName: any;
  isAssamState: boolean = false;

  // only for CC email address book input ccmailtags
  @ViewChild('tagInput') tagInputRef: ElementRef;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;
  NoticePeriodDaysList: any[] = [];
  InsuranceList: any[] = [];
  BusinessType: any;
  EmploymentTypeList: any[] = [];

  isDuplicateBankInfo: any;

  isInvalidCandidateInformation: boolean = false;
  DuplicateCheckMessage: string = '';
  relationship1: any = [];
  ShouldShowBankUploadBtn: boolean = false;
  nameofrelationship : string = '';
  RoleCode: any;
  documentURL: any;
  documentURLId: any;
  clientLogoLink: any;
  clientminiLogoLink: any;

  
  // Multiple File Upload
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  docList: any[];//jszip
  bankDocList: any[] = [];//jszip

  // Profile/ Signature
  profileImageDocumentId: any;
  signatureDocumentId: any;
  delete_ProfileAvatarDocument: any[] = [];
  new_ProfileAvatarDocument: any[] = [];
  FileName: string;
  DocumentId: any;
  contentmodalurl: any;
  contentmodalurl1: any;
  lstDocumentDetails_additional = [];
  IsReporingManagerRequired : boolean = false;

  /* #region  Constrcutror */
  constructor(

    @Inject(DOCUMENT) document,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private countryService: CountryService,
    private titleService: Title,
    public UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    public modalService: NgbModal,
    private utilsHelper: enumHelper,
    public onboardingService: OnboardingService,
    private datePipe: DatePipe,
    private loadingScreenService: LoadingScreenService,
    private stateService: StatesService,
    private fileuploadService: FileUploadService,
    private _lightbox: Lightbox,
    private _sanitizer: DomSanitizer,
    private renderer: Renderer2,
    private _location: Location,
    public headerService: HeaderService,
    public searchService: SearchService,
    private utitlityService: UtilityService,
    private candidateService : CandidateService,
    private  sanitizer : DomSanitizer

  ) {


    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

  }

  /* #endregion */


  // @HostListener('window:scroll', ['$event'])
  // onWindowScroll(e) {

  //   if (window.pageYOffset > 350) {
  //     let element = document.getElementById('navbar');
  //     element.classList.add('sticky');
  //   } else {
  //     let element = document.getElementById('navbar');
  //     element.classList.remove('sticky');
  //   }
  // }


  get g() { return this.candidatesForm.controls; } // reactive forms validation 

  removeValidation() {

    Object.keys(this.candidatesForm.controls).forEach(key => {

      this.candidatesForm.get(key).clearValidators();
      this.candidatesForm.get(key).setErrors(null);
      this.candidatesForm.get(key).updateValueAndValidity();

    });


  }

  /* #region ngOnInit initialization -  Pre loading data's */

  ngOnInit() {

    this.titleService.setTitle('OnBoarding');
    this.localURL_Path = this.router.url.includes('onboarding/candidate_information');

    if (this.localURL_Path) {

      this.OnBoarding_Title_Label = "Profile Information";
      history.pushState(null, null, document.URL);
      window.addEventListener('popstate', function () {
        history.pushState(null, null, document.URL);
      });

    }
    else {
      this.OnBoarding_Title_Label = "OnBoarding Request";
    }
    // For internal use only.
    // Behaves like an string. handle content title.
    this.headerService.remarks.subscribe(remarks => {
      this.TransactionRemarks = remarks;
    });
    this.headerService.status.subscribe(status => {
      this.Label_CurrentStatus = status;

    });

    this.headerService.isNewTransfer.subscribe(isNewTransfer => {
      this.isNewTransfer = isNewTransfer;
    });

    this.isNewTransfer = (Boolean(sessionStorage.getItem('isNewTransfer')) == true ? true : false)


    // this.headerService.isRedoOffer.subscribe(isRedoOffer => {
    //   this.isRedoOffer = isRedoOffer;
    // });

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.accessControl_submit = this.userAccessControl.filter(a => a.ControlName == "btn_onboarding_submit");
    this.accessControl_reject = this.userAccessControl.filter(a => a.ControlName == "btn_Opsonboarding_reject");
    this.MenuId =  environment.environment.OnboardingMenuId;
    this.countryCode = "91";
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.ShouldShowBankUploadBtn = environment.environment.IsAllowToShowUploadBankFileBtnForRec == true && this.RoleCode == 'Recruiter' ? true : false;

    this.clientLogoLink = 'logo.png';

    if (this._loginSessionDetails.CompanyLogoLink != "" && this._loginSessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this._loginSessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;
    } else if (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList[0].ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      }
    }
    // For use in url path implementing
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        var encodedCdx = atob(params["Cdx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.CandidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
      }
    });

    // used for form groups
    // Only keep the most recent form control names
    this.candidatesForm = this.formBuilder.group({
      requestBy: ['self'],
      requestFor: ['OL'],
      onboardingType: ['flash'],
      recruiterName: [null],
      onBehalfRemarks: [''],
      proxyRemarks: [''],

      clientName: [null],
      clientContract: [null],
      mandateName: [null],
      candidateName: [null],
      clientSPOC: [null],
      onApprovalType: ['attachment'],
      sourceType: [null],
      isRateCardType: [true],
      clientApprovalAttachment: [null],

      firstName: [''],
      newName: [''],
      isNameChange: [false],
      gender: [null],
      email: [''],
      mobile: [''],
      dateOfBirth: [null],
      isDifferentlyabled: [false],
      differentlyabledPercentage: ['', [Validators.max(100), Validators.min(0)]],
      nationality: [null],
      fatherName: [''],
      country: [null],
      isValidFrom: [''],
      isValidTill: [''],
      workPermitType: [''],

      industryType: [null],
      locationLabel: [''],
      location: [null],
      skillCategory: [null],
      designation: [''],
      zone: [null],
      salaryType: [null],
      annualSalary: [''],
      monthlyAmount: [''],
      forMonthlyValue: [false],
      MonthlySalary: [''],
      paystructure: [null],
      letterTemplate: [null],
      expectedDOJ: [''],
      tenureType: [null],
      tenureMonth: [''],
      tenureEndate: [''],
      insurance: [null],
      Remarks: [''],
      onCostInsuranceAmount: [null],
      fixedDeductionAmount: [''],
      isOLcandidateacceptance: [false],
      isAlaccept: [false],
      Gmc: [150000],
      Gpa: [300000],
      NoticePeriod: [null],
      ccemail: [''],

      permanentCommunicationCategoryTypeId: [''],
      permanentAddressdetails: [''],
      permanentAddressdetails1: [''],
      permanentAddressdetails2: [''],
      permanentStateName: [null],
      permanentCountryName: [null],
      permanentPincode: [''],
      permanentCity: [''],

      presentCommunicationCategoryTypeId: [''],
      presentAddressdetails: [''],
      presentAddressdetails1: [''],
      presentAddressdetails2: [''],
      presentStateName: [null],
      presentCountryName: [null],
      presentPincode: [''],
      presentCity: [''],

      emergencyContactnumber: [''],
      landLine: [''],
      emergencyContactPersonName: [''],

      bloodGroup: [null],
      maritialStatus: [null],
      isPANNoExists: [false],
      PANNO: [''],
      ackowledgmentNumber: [''],
      isAadharExemptedState: [false],
      aAdharNumber: [''],
      UAN: [''],
      PFNumber: [''],
      ESICNumber: [''],
      haveApplied: [false],

      ActualDOJ: [null],
      TeamId: [null],
      EffectivePayPeriod: [null],
      ManagerId: [null],
      CostCodeId: [null],
      LeaveGroupId: [null],
      AppointmentLetterTemplateId: [null],
      employmentType: [null],
      _isFresher: [false],
      relationshipNameType: ['fathername'],
      relationshipType: [null],
      relationshipName: ['']
    });

    // this.candidatesForm.valueChanges.subscribe((changedObj: any) => {
    //   // this.disableBtn = true;
    //   // this.submitted = false;
    // });

    this.sourceTypes = this.utilsHelper.transform(SourceType);
    this.gender = this.utilsHelper.transform(Gender);
    this.nationality = this.utilsHelper.transform(Nationality);
    this.salaryType = this.utilsHelper.transform(SalaryBreakUpType);
    this.tenureType = this.utilsHelper.transform(TenureType)
    this.bloodGroup = this.utilsHelper.transform(BloodGroup)
    this.maritialStatus = this.utilsHelper.transform(MaritalStatus)
    this.ApprovalForList = this.utilsHelper.transform(ApprovalFor);
    this.ApprovalTypeList = this.utilsHelper.transform(ApproverType);
    this.relationship1 = this.utilsHelper.transform(Relationship);
    const filterArray = [2, 3, 4, 5, 6];
    this.relationship1 = this.relationship1.filter(({ id }) => filterArray.includes(id));

    this.candidatesForm.controls['nationality'].setValue(this.nationality.find(a => a.id == 1).id);
    this.DOBmaxDate = new Date();
    this.workPermitminDate = new Date();
    this.TenureminDate = new Date();
    this.tblminDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);
    this.candidatesForm.controls['onApprovalType'].disable();

    if(this.RoleCode == 'Candidate'){
      this.isValidateCandidate = false;
    }
    // Adds the same handler methods for all of the specified slick grid table
    this.doNomineeSlickGrid();
    this.doExperienceSlickGrid();
    this.doEducationSlickGrid();
    this.doBankSlickGrid();



    try {

      this.removeValidation();
      let mode = this.Id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.isEditMode = this.Id == 0 ? true : false;
      var isExistsGroupControl = false;
      isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = this.candidatesForm.get("onboardingType").value == 'proxy' ? "Detailed" : "Flash";
      this.UIBuilderService.doApply(mode, this, this.MenuId, isExistsGroupControl == false ? "" : this.GroupControlName);


      //Enable fields
      this.candidatesForm.controls['clientName'].enable();
      this.candidatesForm.controls['clientContract'].enable();
      this.candidatesForm.controls['clientSPOC'].enable();


      if (this.RoleCode == 'Candidate') {
        this.isValidateCandidate = false;
      }
      if (this.isNewTransfer && this.BusinessType == 3) {
        this.candidatesForm.controls['sourceType'].setValue(2);

      }


      this.onSourceTypeAsTransfer(); // only ops new request

    } catch (Exception) {

      console.log("exception ", Exception);

    }


    try {

      this.should_spin_onboarding = true;
      if (this.BusinessType != 3) {
        this.ClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
        this.ClientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
      }
      if (this.Id != 0) {
        try {
          this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data
        } catch (error) { }
        this.do_Edit();
      }
      setTimeout(() => {
        this.should_spin_onboarding = true;
        this.doCheckAccordion("isOnboardingInfo"); // for edit pre loading - Returns a function to use in accordion data for buttons click 
      }, 25000);

      setTimeout(() => {
        this.disableBtn = true;
        this.should_spin_onboarding = false;
      }, 1500);


    } catch (error) {
    }


    // this.candidatesForm.controls['location'].valueChanges.subscribe(change => {
    //   console.log(change, 'ddddddddddddd'); // Value inside the input field as soon as it changes
    // });
    this.candidatesForm.get('sourceType').value == 2 && this.Id == 0 && this.BusinessType == 3 ? this.candidatesForm.controls['requestFor'].setValue('AL') : null;


    if (this.candidatesForm.get('requestFor').value.toString() === "AL") {

      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));
      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(true, this.candidatesForm.get('TeamId'));
      this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));

    }
    else {
      this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(true, this.candidatesForm.get('letterTemplate'));

      this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(false, this.candidatesForm.get('TeamId'));
      this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));

    }


  }

  _load_SME_Properties() {
    if (this.BusinessType != 3) {
      this.ClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
      this.ClientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
      this.refreshContractAndContact(this.ClientId);
      this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this.ClientContractId) : null;
      let _clientIdAsNum = parseFloat(this.ClientId);
      this.candidatesForm.controls['clientName'].setValue(_clientIdAsNum);

    }
  }
  // only for OPS new request method

  onSourceTypeAsTransfer() {

    this.Id != 0 && this.CandidateId != 0 &&
      this.candidatesForm.controls['sourceType'] != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType != null ? this.candidatesForm.controls['sourceType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType) : null;

    if (this.candidatesForm.get('sourceType').value == 2) {
      this.candidatesForm.removeControl('requestBy')
      // this.candidatesForm.controls['requestFor'].disable();
      // this.Id == 0 ?  this.candidatesForm.controls['requestFor'].setValue('AL') : null; 
      // this.candidatesForm.removeControl('expectedDOJ');
      // this.candidatesForm.removeControl('letterTemplate');
      this.candidatesForm.removeControl('mandateName');
      this.candidatesForm.removeControl('candidateName');

      // this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      // this.updateValidation(false, this.candidatesForm.get('letterTemplate'));

      this.check_ActualDOJ_minDate();
      // this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      // this.updateValidation(true, this.candidatesForm.get('TeamId'));
      // this.updateValidation(true, this.candidatesForm.get('ManagerId'));
      // this.updateValidation(true, this.candidatesForm.get('LeaveGroupId'));
      // this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      // this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));


    }

  }

   // function to restrict mobile number to 10 digits
   mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
    }
  }

  check_ActualDOJ_minDate() {

    this.ActualDOJminDate = new Date();
    this.ActualDOJmaxDate = new Date();

    this.ActualDOJminDate.setDate(this.ActualDOJminDate.getDate() - (!this.isESICapplicable ? ConfigJson.ActualDOJminDate : ConfigJson.ActualDOJminDate_withESIC));
    this.ActualDOJminDate.setMonth(this.ActualDOJminDate.getMonth());
    this.ActualDOJminDate.setFullYear(this.ActualDOJminDate.getFullYear());


    this.ActualDOJmaxDate.setDate(this.ActualDOJmaxDate.getDate() + ConfigJson.ActualDOJmaxDate);
    this.ActualDOJmaxDate.setMonth(this.ActualDOJmaxDate.getMonth());
    this.ActualDOJmaxDate.setFullYear(this.ActualDOJmaxDate.getFullYear());
  }

  onLoadRequestFor() {

    if (this.candidatesForm.get('requestFor').value == "OL" && this.isOfferInfo) {

      this.DOJminDate = new Date();
      this.DOJmaxDate = new Date();

      this.DOJmaxDate.setDate(this.DOJmaxDate.getDate() + ConfigJson.ExpectedDOJmaxDate);
      this.DOJmaxDate.setMonth(this.DOJmaxDate.getMonth());
      this.DOJmaxDate.setFullYear(this.DOJmaxDate.getFullYear());

      this.DOJminDate.setDate(this.DOJminDate.getDate() - ConfigJson.ExpectedDOJminDate);
      this.DOJminDate.setHours(this.DOJminDate.getHours());
      this.DOJminDate.setFullYear(this.DOJminDate.getFullYear());

      // this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      // this.updateValidation(true, this.candidatesForm.get('letterTemplate'));



      this.updateValidation(true, this.candidatesForm.controls['expectedDOJ'] != null && this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(true, this.candidatesForm.controls['letterTemplate'] != null && this.candidatesForm.get('letterTemplate'));

    }
    else {


      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));

      this.check_ActualDOJ_minDate();
      // this.candidatesForm.controls['letterTemplate'] != null && this.candidatesForm.controls['letterTemplate'].setValue(0);
    }
  }

  /* #endregion */

  /* #region Accordion Click event and API Calls */

  /**
   * Recursively find workflow-map accordion based on the path strings
   */
  public doCheckAccordion(accordion_Name: any): void {

    if (accordion_Name == "isOnboardingInfo") {
      this.OnBoardingInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isCandidateInfo") {
      this.CandidateInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isOfferInfo") {
      this.OfferInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isCommunicationdetails") {
      this.CommunicationListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isBankInfo") {
      this.BankInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isDocumentInfo") {

      this.DocumentInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isMigrationInfo") {

      this.getMigrationMasterInfo(this.ClientContractId);
      this.doletterTemplate();
    }
    else { }
  }
  public doAccordionLoading(accordion_Name: any) {

    this.should_spin_onboarding = true;
    this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? this.ClientId : 0)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {
          if (accordion_Name == "isOnboardingInfo") {
            this.OnBoardingInfoListGrp = JSON.parse(apiResult.Result);

            this.ClientList = _.orderBy(this.OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);
            this.RecruiterList = _.orderBy(this.OnBoardingInfoListGrp.RecruiterList, ["Name"], ["asc"]);
            if (this.Id) {
              try {
                this.refreshContractAndContact(this.ClientId);
                this.onClickMandateAssignment(null);
                this.onClickCandidate(null);

              } catch (error) { }
            }
            this.should_spin_onboarding = false;
            this._load_SME_Properties();
          }


          else if (accordion_Name == "isCandidateInfo") {
            this.CandidateInfoListGrp = JSON.parse(apiResult.Result);
            this.CountryList_NonIndian = _.orderBy(this.CandidateInfoListGrp.CountryList, ["Name"], ["asc"]);
            this.CountryList_NonIndian = this.CountryList_NonIndian.filter(a => a.Id != 100);
            this.should_spin_onboarding = false;
          }

          else if (accordion_Name == "isOfferInfo") {

            this.ClientContractId = (this.candidatesForm.get('clientContract').value);
            this.OfferInfoListGrp = JSON.parse(apiResult.Result);
            this.IndustryList = _.orderBy(this.OfferInfoListGrp.IndustryList, ["Name"], ["asc"]);
            this.EmploymentTypeList = this.OfferInfoListGrp.EmploymentTypeList != null && this.OfferInfoListGrp.EmploymentTypeList.length > 0 ? this.OfferInfoListGrp.EmploymentTypeList : [];

            this.ClientLocationList = _.orderBy(this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]);
            // PORT[2] 9.1 CHANGES
            (this.ClientContractList != null && this.ClientContractList.length > 0 && this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value == null) ?
              this.candidatesForm.controls['tenureType'].setValue(this.ClientContractList.find(z => z.Id == this.candidatesForm.get('clientContract').value).DefaultTenureType) : true;

            if (this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value != null && this.candidatesForm.get('tenureType').value != '' && this.candidatesForm.get('tenureType').value == 2) {
              this.updateValidation(true, this.candidatesForm.get('tenureMonth'));
            }
            if (this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value != null && this.candidatesForm.get('tenureType').value != '' && this.candidatesForm.get('tenureType').value == 1) {
              this.updateValidation(true, this.candidatesForm.get('tenureEndate'));
            }

            (this.ClientContractList != null && this.ClientContractList.length > 0 && this.candidatesForm.controls['employmentType'] != null && this.candidatesForm.get('employmentType').value == null) ?
              this.candidatesForm.controls['employmentType'].setValue(this.ClientContractList.find(z => z.Id == this.candidatesForm.get('clientContract').value).DefaultEmploymentType) : true;

            this.doletterTemplate();
            this.doCheckAccordion("isMigrationInfo");
            if ((this.BusinessType == 1 || this.BusinessType == 2) && this.IndustryList != null && this.IndustryList.length > 0) {
              let _industryId = (this.IndustryList[0].Id);
              console.log('_industryId', _industryId);
              var payEvent = {
                id: 0
              }
              // SME CHANGES ONLY
              this.BusinessType != 3 ? this.candidatesForm.controls['industryType'] != null && (this.candidatesForm.get('industryType').value == null || this.candidatesForm.get('industryType').value == 0) ? this.candidatesForm.controls['industryType'].setValue(_industryId) : null : true;
              this.BusinessType != 3 ? this.candidatesForm.controls['salaryType'] != null && (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0) ? this.candidatesForm.controls['salaryType'].setValue(1) : null : true;
              // this.BusinessType == 1 ? this.candidatesForm.controls['tenureType'] != null && (this.candidatesForm.get('tenureType').value == null || this.candidatesForm.get('tenureType').value == 0) ? this.candidatesForm.controls['tenureType'].setValue(0) : null : true; // UNUSED CODE 
              this.BusinessType != 3 ? (payEvent.id = (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0) ? 0 : this.candidatesForm.get('salaryType').value) : null;
              this.BusinessType != 3 ? this.editOnChangeSalary(payEvent) : null;
              this.onChangeIndustryType(null);
            }

            if (this.Id) {
              this.onChangeOfferLocation(null);
              try {
                var payEvent = {
                  id: 0
                }
                payEvent.id = (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0 ? 0 : this.candidatesForm.get('salaryType').value);
                this.onChangeIndustryType(null);
              } catch (error) { }
              this.editOnChangeSalary(payEvent);

              this.should_spin_onboarding = false;

            } else { this.should_spin_onboarding = false; }

          }

          else if (accordion_Name == "isCommunicationdetails") {
            this.CommunicationListGrp = JSON.parse(apiResult.Result);
            this.CountryList = _.orderBy(this.CommunicationListGrp.CountryList, ["Name"], ["asc"]);
            console.log('list', this.CountryList);

            if (this.Id != 0) {
              try {
                var countryEventId = (this.candidatesForm.get('presentCountryName').value == null || this.candidatesForm.get('presentCountryName').value == 0 ? null : this.candidatesForm.get('presentCountryName').value);
                var countryEvent1Id = (this.candidatesForm.get('permanentCountryName').value == null || this.candidatesForm.get('permanentCountryName').value == 0 ? null : this.candidatesForm.get('permanentCountryName').value);
                this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);
                this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === Number(countryEvent1Id)), ["Name"], ["asc"]);
                this.should_spin_onboarding = false;

              } catch (error) { }
            } else { this.should_spin_onboarding = false; }
          }

          else if (accordion_Name == "isBankInfo") {
            this.BankInfoListGrp = JSON.parse(apiResult.Result);
            this.BankList = this.BankInfoListGrp.BankList;
            this.should_spin_onboarding = false;
          }

          else if (accordion_Name == "isDocumentInfo") {
            this.istblloading = true;
            this.DocumentInfoListGrp = JSON.parse(apiResult.Result);
            this.DocumentCategoryist = this.DocumentInfoListGrp.DocumentCategoryist;

            try {
              this.onDocumentClick();


            } catch (error) { }

            this.istblloading = false;
          }

          else if (accordion_Name == "isClientApproval") {


            this.should_spin_onboarding = false;

          }

        }

        else {
          // this.alertService.showWarning("Show Message for empty flatlist")
          this.should_spin_onboarding = false;
        }
      }, (error) => {
        this.should_spin_onboarding = false;
      });
  }

  /* #endregion */

  // Pre laoding api calls for edit
  do_Edit() {
    this.loadingScreenService.startLoading();
    this.relationship = this.utilsHelper.transform(Relationship);
    this.graduationType = this.utilsHelper.transform(GraduationType);
    this.courseType = this.utilsHelper.transform(CourseType);
    this.scoringType = this.utilsHelper.transform(ScoringType);

    let req_param_uri = `Id=${this.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingService.getCandidate(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      this.loadingScreenService.stopLoading();
      if (apiResponse.Status) {
        this.candidateModel = (apiResponse.dynamicObject);
        this._NewCandidateDetails = this.candidateModel.NewCandidateDetails;
        this._OldCandidateDetails = this.candidateModel.OldCandidateDetails
        console.log('edit details ::', this._NewCandidateDetails);

        this.DataBinding_for_Edit();
      }
      else {
        this._location.back();
        this.alertService.showWarning(`Something is wrong!  ${apiResponse.Message}`);

      }
    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });
  }

  DataBinding_for_Edit(): void {

    // this.candidateRateSetDetails[0].LstCandidateOfferDetails[0].LstCandidateRateSet = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet;
    // this.candidateDetails.LstCandidateBankDetails = this._NewCandidateDetails.LstCandidateBankDetails;
    // this.candidateDetails.LstCandidateDocuments = this._NewCandidateDetails.LstCandidateDocuments;
    // this.candidateDetails.LstCandidateFamilyDetails = this._NewCandidateDetails.LstCandidateFamilyDetails;
    // this.candidateDetails.LstCandidateLetterTransaction = this._NewCandidateDetails.LstCandidateLetterTransaction;
    // this.candidateDetails.LstCandidateProfileDetails = this._NewCandidateDetails.LstCandidateProfileDetails;
    // this.candidateDetails.LstSkillDetails = this._NewCandidateDetails.LstSkillDetails;
    // this.candidateDetails.Qualifications = this._NewCandidateDetails.Qualifications;
    // this.candidateDetails.WorkExperiences = this._NewCandidateDetails.WorkExperiences;
    // this.workPermitDetails[0] = this._NewCandidateDetails.WorkPermits;


    try {
      this.removeValidation();
      let mode = this.Id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.isEditMode = this.Id == 0 ? true : false;
      var isExistsGroupControl = false;
      isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == 2 ? "Detailed" : "Flash";
      this.UIBuilderService.doApply(mode, this, this.MenuId, isExistsGroupControl == false ? "" : this.GroupControlName);
      //Enable below fields for edit 
      this.candidatesForm.controls['clientName'].enable();
      this.candidatesForm.controls['clientContract'].enable();
      this.candidatesForm.controls['clientSPOC'].enable();

    } catch (Exception) {

      console.log("exception ", Exception);

    }

    this.isDocumentInfo == true ? this.doCheckAccordion("isDocumentInfo") : null;

    this.candidateDetails = this._NewCandidateDetails;
    this.OldcandidateOfferDetails[0] = this._NewCandidateDetails.LstCandidateOfferDetails;
    // make module transaction id = 0 for new offer
    this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId = 0;
    this.candidateOfferDetails.ModuleTransactionId = 0;

    this.CandidateAcceptanceStatus = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus == AcceptanceStatus.AL_Rejected || this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus == AcceptanceStatus.OL_Rejected ? true : false;
    this.CandidateAcceptanceRejectRemarks = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks : '';
    this.ApprovalStatus = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus == ApprovalStatus.Rejected ? true : false;
    // For Candidate Information accordion  (Edit)
    this.candidatesForm.controls['firstName'].setValue(this._NewCandidateDetails.FirstName);
    this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(this._NewCandidateDetails.Gender == 0 as any ? null : this._NewCandidateDetails.Gender) : null;

    this.candidatesForm.controls['dateOfBirth'] != null ? this.candidatesForm.controls['dateOfBirth'].setValue((this._NewCandidateDetails.DateOfBirth == null ? null : this.datePipe.transform(new Date(this._NewCandidateDetails.DateOfBirth).toString(), "dd-MM-yyyy"))) : null;

    // if (this.candidatesForm.controls['dateOfBirth'].value == "01-01-0001") {
    //   this.candidatesForm.controls['dateOfBirth'].setValue(null);
    // }

    this.DOB = this._NewCandidateDetails != null && this._NewCandidateDetails.DateOfBirth != null ? this._NewCandidateDetails.DateOfBirth : null;

    
    if (this.candidateDetails.RelationshipId != Relationship.Father && this.candidateDetails.RelationshipId > 0) {
      this.updateValidation(false, this.candidatesForm.get('fatherName'));
      this.updateValidation(true, this.candidatesForm.get('relationshipType'));
      this.updateValidation(true, this.candidatesForm.get('relationshipName'));
      this.nameofrelationship = this.relationship1.find(a=>a.id == this._NewCandidateDetails.RelationshipId).name;
      this.candidatesForm.controls['relationshipNameType'].setValue('others');
      this.candidatesForm.controls['relationshipType'] != null ? this.candidatesForm.controls['relationshipType'].setValue(this._NewCandidateDetails.RelationshipId != null && this._NewCandidateDetails.RelationshipId != undefined ? this._NewCandidateDetails.RelationshipId : null) : null;
      this.candidatesForm.controls['relationshipName'] != null ? this.candidatesForm.controls['relationshipName'].setValue(this._NewCandidateDetails.RelationshipName) : null;

    } else {
      this.updateValidation(true, this.candidatesForm.get('fatherName'));
      this.updateValidation(false, this.candidatesForm.get('relationshipType'));
      this.updateValidation(false, this.candidatesForm.get('relationshipName'));
      this.candidatesForm.controls['relationshipNameType'].setValue('fathername');
      this.candidatesForm.controls['fatherName'] != null ? this.candidatesForm.controls['fatherName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName) : null;

    }

    this.candidatesForm.controls['isDifferentlyabled'] != null ? this.candidatesForm.controls['isDifferentlyabled'].setValue(this._NewCandidateDetails.IsDifferentlyabled) : null;
    this.candidatesForm.controls['differentlyabledPercentage'] != null ? this.candidatesForm.controls['differentlyabledPercentage'].setValue(this._NewCandidateDetails.DisabilityPercentage) : null;
    this.candidatesForm.controls['nationality'] != null ? this.candidatesForm.controls['nationality'].setValue(this._NewCandidateDetails.Nationality) : null;
    this.candidatesForm.controls['country'] != null ? this.candidatesForm.controls['country'].setValue(this._NewCandidateDetails.CountryOfOrigin) : null;
    this.candidateDetails.Status = CandidateStatus.Active;
    this.candidateDetails.Modetype = UIMode.Edit;
    if (this._NewCandidateDetails.WorkPermits != null && this._NewCandidateDetails.WorkPermits.length > 0) {
      this.candidatesForm.controls['workPermitType'] != null ? this.candidatesForm.controls['workPermitType'].setValue(this._NewCandidateDetails.WorkPermits.length != 0 ? this._NewCandidateDetails.WorkPermits[0].WorkPermitType : 0) : null;
      this.candidatesForm.controls['isValidFrom'] != null ? this.candidatesForm.controls['isValidFrom'].setValue(this._NewCandidateDetails.WorkPermits.length != 0 && this._NewCandidateDetails.WorkPermits[0].ValidFrom != "0001-01-01T00:00:00" ? new Date(this._NewCandidateDetails.WorkPermits[0].ValidFrom) : null) : null;
      this.candidatesForm.controls['isValidTill'] != null ? this.candidatesForm.controls['isValidTill'].setValue(this._NewCandidateDetails.WorkPermits.length != 0 && this._NewCandidateDetails.WorkPermits[0].ValidTill != "0001-01-01T00:00:00" ? new Date(this._NewCandidateDetails.WorkPermits[0].ValidTill) : null) : null;
    }
    if (this._NewCandidateDetails.CandidateCommunicationDtls != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.length > 0 && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal) != undefined) {
      this.candidatesForm.controls['email'] != null ? this.candidatesForm.controls['email'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryEmail) : null;
      this.candidatesForm.controls['mobile'] != null ? this.candidatesForm.controls['mobile'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryMobile) : null;
      this.countryCode = this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Personal).PrimaryMobileCountryCode;
    }

    if (this._NewCandidateDetails.CandidateCommunicationDtls != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails != null && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.length > 0 && this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Emergency) != undefined) {
      this.candidatesForm.controls['emergencyContactnumber'] != null ? this.candidatesForm.controls['emergencyContactnumber'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Emergency).EmergencyContactNo) : null;
      this.candidatesForm.controls['emergencyContactPersonName'] != null ? this.candidatesForm.controls['emergencyContactPersonName'].setValue(this._NewCandidateDetails.CandidateCommunicationDtls.LstContactDetails.find(a => a.CommunicationCategoryTypeId == CommunicationCategoryType.Emergency).EmergencyContactPersonName) : null;

    }
    

    if (this._NewCandidateDetails.LstCandidateOfferDetails != null) {

      (this._NewCandidateDetails.LstCandidateOfferDetails[0].IsSelfRequest == false ? this.onC("onbehalfof") : null)
      // For Onbaording accordion  (Edit)

      this.candidatesForm.controls['requestBy'] != null ? this.candidatesForm.controls['requestBy'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsSelfRequest == true ? "self" : "onbehalfof") : null;
      this.candidatesForm.controls['recruiterName'] != null ? this.candidatesForm.controls['recruiterName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsSelfRequest == true ? this.UserId : this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestedBy) : null;
      this.candidatesForm.controls['requestFor'] != null ? this.candidatesForm.controls['requestFor'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType == 1 ? "OL" : "AL") : null;
      this.candidatesForm.controls['onboardingType'] != null ? this.candidatesForm.controls['onboardingType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == 1 ? "flash" : "proxy") : null;
      // this.candidatesForm.controls['isOLcandidateacceptance'] != null ? this.candidatesForm.controls['isOLcandidateacceptance'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL : false) : false;
      // this.candidatesForm.controls['isAlaccept'] != null ? this.candidatesForm.controls['isAlaccept'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL : false) : false;


      if (this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == OnBoardingType.Proxy) {

        this.updateValidation(true, this.candidatesForm.get('proxyRemarks'));
        this.candidatesForm.controls['proxyRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ProxyRemarks);

      }
      this.alternativeUserId_For_Mandates = this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestedBy;
      this.ClientId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId; // 3rd Party
      this.MandateAssignmentId = this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId; // 3rd party
      this.candidatesForm.controls['onBehalfRemarks'] != null ? this.candidatesForm.controls['onBehalfRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamProxyRequest) : null;
      this.candidatesForm.controls['proxyRemarks'] != null ? this.candidatesForm.controls['proxyRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ProxyRemarks) : null;
      this.candidatesForm.controls['clientName'] != null ? this.candidatesForm.controls['clientName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId) : null;
      this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId) : null;
      this.ClientContractId = (this.candidatesForm.get('clientContract').value);

      var temp = new Array();
      // this will return an array with strings "1", "2", etc.
      temp = this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != "" && this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != undefined ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC.split(",") : [];
      console.log('temp array', temp);
      this.ccmailtags = temp;

      this.candidatesForm.controls['mandateName'] != null ? this.candidatesForm.controls['mandateName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId) : null;
      this.candidatesForm.controls['candidateName'] != null ? this.candidatesForm.controls['candidateName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId) : null;
      this.candidatesForm.controls['clientSPOC'] != null ? this.candidatesForm.controls['clientSPOC'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId) : null;
      this.candidatesForm.controls['onApprovalType'] != null ? this.candidatesForm.controls['onApprovalType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsClientApprovedBasedOn == 1 ? "online" : "attachment") : null;
      this.candidatesForm.controls['sourceType'] != null ? this.candidatesForm.controls['sourceType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType != 0 as any ? this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType : null) : null;
      // this.candidatesForm.controls['sourceType'].setValue(1);
      this.ApprovalRemarks = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalRemarks : null;
      this.isFresher = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsFresher : false;
      this.candidatesForm.controls['_isFresher'] != null ? this.candidatesForm.controls['_isFresher'].setValue(this.isFresher) : false
      this.isWorkExperienceFlag = this.isFresher
      // For Offer Information accordion (Edit)
      // this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.controls['industryType'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId) == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId) : null;
      // this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Location) : null;
      // this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory) : null;
      // this.candidatesForm.controls['designation'] != null ? this.candidatesForm.controls['designation'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation) : null;
      // this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone) : null;
      // this.candidatesForm.controls['Remarks'] != null ? this.candidatesForm.controls['Remarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SalaryRemarks) : null;

      // if (this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType == 1) {
      //   this.DateOfJoining = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining != "0001-01-01T00:00:00" ? this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining : null;
      // } else {
      //   this.DateOfJoining = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining : null;
      // }
      // this.candidatesForm.controls['Gmc'] != null ? this.candidatesForm.controls['Gmc'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount) : 0;
      // this.candidatesForm.controls['Gpa'] != null ? this.candidatesForm.controls['Gpa'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount) : 0;
      // this.candidatesForm.controls['NoticePeriod'] != null ? this.candidatesForm.controls['NoticePeriod'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays) : 0;

      // this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.controls['expectedDOJ'].setValue((this.datePipe.transform(this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining, "dd-MM-yyyy"))) : null;
      // // if (this.candidatesForm.controls['expectedDOJ'].value == "01-01-0001") {
      // //   this.candidatesForm.controls['expectedDOJ'].setValue(null);
      // // }
      // this.candidatesForm.controls['tenureType'] != null ? this.candidatesForm.controls['tenureType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType == -1 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType) : null;
      // this.candidatesForm.controls['tenureEndate'] != null ? this.candidatesForm.controls['tenureEndate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate) : null) : null;
      // this.candidatesForm.controls['tenureMonth'] != null ? this.candidatesForm.controls['tenureMonth'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval : null) : null;
      // var tenureEvent = {
      //   id: 0
      // }
      // this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.controls['tenureType'] != undefined ? tenureEvent.id = (this.candidatesForm.get('tenureType').value == null || this.candidatesForm.get('tenureType').value == -1 ? null : this.candidatesForm.get('tenureType').value) : null;
      // this.candidatesForm.controls['tenureType'] != null && this.onchangeTenureValidation(tenureEvent);

      // this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidatesForm.controls['onCostInsuranceAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance : null) : null;
      // this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidatesForm.controls['fixedDeductionAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].FixedInsuranceDeduction) : null;
      // this.candidatesForm.controls['monthlyAmount'] != null ? this.candidatesForm.controls['monthlyAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount) : null;

      // this.candidatesForm.controls['ActualDOJ'] != null ? this.candidatesForm.controls['ActualDOJ'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining) : null) : null;
      // // if (this.candidatesForm.controls['ActualDOJ'].value == "01-01-0001") {
      // //   this.candidatesForm.controls['ActualDOJ'].setValue(null);
      // // }
      // this.candidatesForm.controls['TeamId'] != null ? this.candidatesForm.controls['TeamId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null) : null;
      // this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId : null) : null;
      // this.candidatesForm.controls['LeaveGroupId'] != null ? this.candidatesForm.controls['LeaveGroupId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId : null) : null;
      // this.candidatesForm.controls['CostCodeId'] != null ? this.candidatesForm.controls['CostCodeId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId : null) : null;
      // this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidatesForm.controls['AppointmentLetterTemplateId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId : null) : null;
      // this.candidatesForm.controls['employmentType'] != null ? this.candidatesForm.controls['employmentType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType != 0 as any ? this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType : null) : null;

      // this.StateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].State;
      // this.CityId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CityId;
      // this.isRateSetValid = true;
      // this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = true;
      // this.IsMinimumwageAdhere = this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere;
      // if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
      //   this.candidatesForm.controls['salaryType'] != null ? this.candidatesForm.controls['salaryType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType) : null;
      //   this.candidatesForm.controls['annualSalary'] != null ? this.candidatesForm.controls['annualSalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary) : null;
      //   this.candidatesForm.controls['paystructure'] != null ? this.candidatesForm.controls['paystructure'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId) : null;
      //   this.candidatesForm.controls['MonthlySalary'] != null ? this.candidatesForm.controls['MonthlySalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary) : null;
      //   this.candidatesForm.controls['forMonthlyValue'] != null ? this.candidatesForm.controls['forMonthlyValue'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].IsMonthlyValue) : null;
      //   this.SalaryFormat = (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary);
      //   this.isESICapplicable = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;
      // }
      // this.candidatesForm.controls['letterTemplate'] != null ? this.candidatesForm.controls['letterTemplate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId : null) : null;


      // For Candidate other details accordion (Edit)
      this.candidatesForm.controls['isAadharExemptedState'] != null ? this.candidatesForm.controls['isAadharExemptedState'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsAadhaarExemptedState) : null;
      this.candidatesForm.controls['isPANNoExists'] != null ? this.candidatesForm.controls['isPANNoExists'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsPANExists) : null;
      this.candidatesForm.controls['haveApplied'] != null ? this.candidatesForm.controls['haveApplied'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsPanApplied) : null;
      this.candidatesForm.controls['ackowledgmentNumber'] != null ? this.candidatesForm.controls['ackowledgmentNumber'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].PANAckowlegementNumber) : null;
      this.candidatesForm.controls['bloodGroup'] != null ? this.candidatesForm.controls['bloodGroup'].setValue(this._NewCandidateDetails.BloodGroup) : null;
      this.candidatesForm.controls['maritialStatus'] != null ? this.candidatesForm.controls['maritialStatus'].setValue(this._NewCandidateDetails.MaritalStatus) : null;

    }
    if (this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0) {
      this.candidatesForm.controls['PANNO'] != null ? this.candidatesForm.controls['PANNO'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PAN) : null;
      this.candidatesForm.controls['UAN'] != null ? this.candidatesForm.controls['UAN'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].UAN) : null;
      // this.candidatesForm.controls['PFNumber'] != null ? this.candidatesForm.controls['PFNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PFNumber) : null;
      this.candidatesForm.controls['ESICNumber'] != null ? this.candidatesForm.controls['ESICNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].ESICNumber) : null;
    }

    // For Candidate Communication accordion  (Edit)
    if (this._NewCandidateDetails.CandidateCommunicationDtls != null) {
      let _addressDetails: AddressDetails[] = [];
      _addressDetails = this._NewCandidateDetails.CandidateCommunicationDtls.LstAddressdetails;
      console.log(this._NewCandidateDetails.CandidateCommunicationDtls.LstAddressdetails);
      try {
        _addressDetails.forEach(element => {
          if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Present) {
            this.candidatesForm.controls['presentAddressdetails'] != null ? this.candidatesForm.controls['presentAddressdetails'].setValue(element.Address1) : null;
            this.candidatesForm.controls['presentAddressdetails1'] != null ? this.candidatesForm.controls['presentAddressdetails1'].setValue(element.Address2) : null;
            this.candidatesForm.controls['presentAddressdetails2'] != null ? this.candidatesForm.controls['presentAddressdetails2'].setValue(element.Address3) : null;
            this.candidatesForm.controls['presentCountryName'] != null ? this.candidatesForm.controls['presentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
            this.candidatesForm.controls['presentPincode'] != null ? this.candidatesForm.controls['presentPincode'].setValue(element.PinCode) : null;
            this.candidatesForm.controls['presentStateName'] != null ? this.candidatesForm.controls['presentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
            this.candidatesForm.controls['presentCity'] != null ? this.candidatesForm.controls['presentCity'].setValue(element.City) : null;
          }
          if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Permanent) {
            this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(element.Address1) : null;
            this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(element.Address2) : null;
            this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(element.Address3) : null;
            this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
            this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(element.PinCode) : null;
            this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
            this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(element.City) : null;
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
            Remarks: element.Remarks
          })

          element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Bank_Details");



        });
      }
      console.log('dd', this.BankList);
    } catch (error) { }


    // For Family Details accordion (Edit)
    if (this._NewCandidateDetails.LstCandidateFamilyDetails != null && this._NewCandidateDetails.LstCandidateFamilyDetails.length > 0) {
      this.LstNominees = [];
      this._NewCandidateDetails.LstCandidateFamilyDetails.forEach(element => {
        if (element.CandidateDocument != null) {
          element.CandidateDocument.Modetype = UIMode.Edit;
        }


        this.LstNominees.push({
          Id: element.Id,
          id: element.Id,
          nomineeName: (element.Name),
          RelationShip: this.relationship.find(a => a.id == element.RelationshipId).name,
          DOB: element.DOB == "1900-01-01T00:00:00" ? null : element.DOB,
          IDProof: "",
          FamilyPF: element.LstClaims.find(a => a.ClaimType == ClaimType.PF) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.PF).Percentage : null,
          FamilyGratuity: element.LstClaims.find(a => a.ClaimType == ClaimType.Gratuity) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.Gratuity).Percentage : null,
          FamilyESIC: element.LstClaims.find(a => a.ClaimType == ClaimType.ESIC) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.ESIC).Percentage : null,
          FamilyaAdhar: "",
          FamilyisEmployed: element.IsEmployed,
          mediclaim: false,
          idProoftype: "",
          relationship: element.RelationshipId,
          Age: 0,
          CandidateDocument: element.CandidateDocument,
          DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
          isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
          Modetype: UIMode.Edit,
          DateofBirth: element.DOB == "1900-01-01T00:00:00" ? null : element.DOB,
        })
        element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Family_Details");

      });

      console.log(this.LstNominees);

    }

    // For Candidate Education Information accordion (Edit)
    if (this._NewCandidateDetails.Qualifications != null) {
      this.LstEducation = [];
      this._NewCandidateDetails.Qualifications.forEach(element => {
        if (element.CandidateDocument != null) {
          element.CandidateDocument.Modetype = UIMode.Edit;
        }
        console.log(element.CandidateDocument);

        this.LstEducation.push({
          Id: element.Id,
          id: element.Id,
          GraduationType: this.graduationType.find(a => a.id == element.GraduationType).name,
          educationDegree: element.EducationDegree,
          yearOfPassing: element.YearOfPassing,
          scoringValue: element.ScoringValue,
          courseType: element.CourseType,
          graduationType: element.GraduationType,
          institutaion: element.InstitutionName,
          scoringType: element.ScoringType,
          universityName: element.UniversityName,
          CandidateDocument: element.CandidateDocument,
          DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
          isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
          Modetype: UIMode.Edit
        })
        element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Education_Details");

      });
    }

    // For Candidate Experience Information accordion (Edit)
    if (this._NewCandidateDetails.WorkExperiences != null) {
      this.LstExperience = [];
      this._NewCandidateDetails.WorkExperiences.forEach(element => {

        if (element.CandidateDocument != null) {
          element.CandidateDocument.Modetype = UIMode.Edit;
        } this.LstExperience.push({
          Id: element.Id,
          id: element.Id,
          companyName: element.CompanyName,
          enddate: element.EndDate,
          fucntionalArea: null,
          isCurrentCompany: element.IsCurrentCompany,
          isFresher: false,
          lastDrawnSalary: element.LastDrawnSalary,
          noticePeriod: element.NoticePeriod == 0 ? null : element.NoticePeriod,
          rolesAndResponsiabilities: element.ResponsibleFor,
          startdate: element.StartDate,
          title: element.DesignationHeld,
          workLocation: element.WorkLocation,
          CandidateDocument: element.CandidateDocument,
          DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
          isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
          Modetype: UIMode.Edit,
          StartDate: this.datePipe.transform(element.StartDate, "dd-MM-yyyy"),
          EndDate: this.datePipe.transform(element.EndDate, "dd-MM-yyyy")
        })

        element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Experience_Details");

      });
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
              Modetype: element.Modetype
            }
          )

          element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Document_Details");


        }
      });
    }

    // For Client Approval accordion (Edit)
    if (this._NewCandidateDetails.ExternalApprovals != null) {
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
            Modetype: UIMode.Delete,
          }
        )

        element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Client_Approvals");



      });
    }
    console.log('jdjfjds', this.deletedLstClientApproval);

    this.onLoadRequestFor();
    if (this.isNewTransfer && this.BusinessType == 3) {
      this.candidatesForm.controls['sourceType'].setValue(2);
    }


    // if (this.Id != 0 && this.clientApprovalTbl.find(a => a.ApprovalFor == ApprovalFor.CandidateJoiningConfirmation) != null) {
    //   this.candidatesForm.controls['requestFor'].setValue("AL");
    //   this.onRequestFor("AL");

    //   if (ConfigJson.RequestType_isDisabled == true) {
    //     this.candidatesForm.controls['requestFor'].disable();
    //   }
    // }

    this.onSourceTypeAsTransfer(); // only ops new request

    if (this.candidatesForm.get('requestFor').value.toString() === "AL") {

      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));
      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(true, this.candidatesForm.get('TeamId'));
      this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
      this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' && this.IsReporingManagerRequired == true ?  this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;

    }
    else {
      this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(true, this.candidatesForm.get('letterTemplate'));

      this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(false, this.candidatesForm.get('TeamId'));
      this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));
      this.candidatesForm.controls['ManagerId'] != null ? this.updateValidation(false, this.candidatesForm.get('ManagerId')) : true;

    }

    if (this.candidatesForm.controls['requestFor'].value == 'AL') {
      if (ConfigJson.RequestType_isDisabled == true) {
        this.candidatesForm.controls['requestFor'].disable();

      }
    }

  }

  rejectedDocs_init(element, AccordionName) {

    this.rejectedLst.push({

      CandidateId: AccordionName == "Client_Approvals" ? element.EntityId : element.CandidateId,
      FileName: element.DocumentName,
      Remarks: AccordionName == "Client_Approvals" ? element.RejectionRemarks : element.Remarks,
      Accordion: AccordionName
    });
    console.log('reject', this.rejectedLst);
  }




  /* #region  Onboarding accordion */

  onC(event) {

    this.isOnBehalfOf = false;
    this.isOnBehalfOf = event == "onbehalfof" ? true : false;
    if (this.isOnBehalfOf) {
      try {

        this.candidatesForm.controls['recruiterName'].setValue(null);
        this.updateValidation(true, this.candidatesForm.get('recruiterName'));
        this.updateValidation(true, this.candidatesForm.get('onBehalfRemarks'));


      } catch (error) { }
    }
    else if (!this.isOnBehalfOf)
      try {

        this.updateValidation(false, this.candidatesForm.get('recruiterName'));
        this.updateValidation(false, this.candidatesForm.get('onBehalfRemarks'));
      } catch (e) { }


  }

  changeRecruiter(event: any) { } // choose recruiter options list with change event
  relationshipNameType(event) {

    if (event == 'fathername') {
      this.updateValidation(true, this.candidatesForm.get('fatherName'));
      this.updateValidation(false, this.candidatesForm.get('relationshipType'));
      this.updateValidation(false, this.candidatesForm.get('relationshipName'));

      this.candidatesForm.controls['relationshipType'].setValue(null);
      this.candidatesForm.controls['relationshipName'].setValue(null);

    } else {
      this.updateValidation(false, this.candidatesForm.get('fatherName'));
      this.updateValidation(true, this.candidatesForm.get('relationshipType'));
      this.updateValidation(true, this.candidatesForm.get('relationshipName'));
      this.candidatesForm.controls['fatherName'].setValue(null);

    }
  }

  onOnboard(event: any) {

    try {
      this.removeValidation();
      this.invaid_fields = [];
      let mode = this.Id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.isEditMode = this.Id == 0 ? true : false;
      // This method is called once and a list of permissions is stored in the permissions property
      // Call API to retrieve the list of actions this user is permitted to perform. (Details / Flash provided here.)
      // In this case, the method returns a Promise, but it could have been implemented as an Observable
      var isExistsGroupControl = false;
      isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = event == 'proxy' ? "Detailed" : "Flash";
      this.UIBuilderService.doApply(mode, this, this.MenuId, isExistsGroupControl == false ? "" : this.GroupControlName);
      //Enable fields
      this.candidatesForm.controls['clientName'].enable();
      this.candidatesForm.controls['clientContract'].enable();
      this.candidatesForm.controls['clientSPOC'].enable();

      if (this.RoleCode == 'Candidate') {
        this.isValidateCandidate = false;
      }
      this.relationshipNameType(this.candidatesForm.get('relationshipNameType').value);


      if (this.isNewTransfer && this.BusinessType == 3) {
        this.candidatesForm.controls['sourceType'].setValue(2);

      }


      this.onRequestFor(this.candidatesForm.get('requestFor').value)
      if (this.Id != 0 && this.clientApprovalTbl.find(a => a.ApprovalFor == ApprovalFor.CandidateJoiningConfirmation) != null) {
        this.candidatesForm.controls['requestFor'].setValue("AL");
        this.onRequestFor("AL");
        if (ConfigJson.RequestType_isDisabled == true) {
          this.candidatesForm.controls['requestFor'].disable();
        }
      }

      this.candidatesForm.valueChanges.subscribe((changedObj: any) => {
        // this.disableBtn = true;
        // this.submitted = false;
        this.getRequired(changedObj);
      });

      this.onSourceTypeAsTransfer(); // only ops new request

    } catch (Exception) {

      console.log("exception ", Exception);

    }

    this.isProxy = event == "proxy" ? true : false;
    if (this.isProxy) {
      this.candidatesForm.controls["proxyRemarks"].setValidators([Validators.required]);
      this.candidatesForm.controls['proxyRemarks'].updateValueAndValidity()
    }
    else {
      this.candidatesForm.controls["proxyRemarks"].clearValidators();
      this.candidatesForm.controls['proxyRemarks'].setErrors(null);
    }
  }

  onRequestFor(event: any) {

    // this.candidatesForm.controls['expectedDOJ'].setValue(null);

    if (event == "OL") {

      this.DOJminDate = new Date();
      this.DOJmaxDate = new Date();
      this.DOJmaxDate.setDate(this.DOJmaxDate.getDate() + ConfigJson.ExpectedDOJmaxDate);
      this.DOJmaxDate.setMonth(this.DOJmaxDate.getMonth());
      this.DOJmaxDate.setFullYear(this.DOJmaxDate.getFullYear());

      this.DOJminDate.setDate(this.DOJminDate.getDate() - ConfigJson.ExpectedDOJminDate);
      this.DOJminDate.setHours(this.DOJminDate.getHours());
      this.DOJminDate.setFullYear(this.DOJminDate.getFullYear());


      this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));

      if (this.previewCTC) {

        // this.updateValidation(false, this.candidatesForm.get('TeamId'));
        // this.updateValidation(false, this.candidatesForm.get('ManagerId'));
        // this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
        // this.updateValidation(false, this.candidatesForm.get('LeaveGroupId'));
        this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
        this.updateValidation(false, this.candidatesForm.get('TeamId'));
        this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
        this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));

      }
      this.candidatesForm.controls['expectedDOJ'] != null ? this.updateValidation(true, this.candidatesForm.get('expectedDOJ')) : null;
      this.candidatesForm.controls['letterTemplate'] != null ? this.updateValidation(true, this.candidatesForm.get('letterTemplate')) : null;
      // this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      // this.updateValidation(true, this.candidatesForm.get('letterTemplate'));

    } else if (event == "AL") {
      this.check_ActualDOJ_minDate();

      this.candidatesForm.controls['expectedDOJ'] != null ? this.updateValidation(false, this.candidatesForm.get('expectedDOJ')) : null;
      this.candidatesForm.controls['letterTemplate'] != null ? this.updateValidation(false, this.candidatesForm.get('letterTemplate')) : null;

      // this.candidatesForm.controls["letterTemplate"].clearValidators();
      // this.candidatesForm.controls['letterTemplate'].setErrors(null);
      // this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      // this.updateValidation(false, this.candidatesForm.get('letterTemplate'));



      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      if (this.previewCTC) {

        // this.updateValidation(true, this.candidatesForm.get('TeamId'));
        // this.updateValidation(true, this.candidatesForm.get('ManagerId'));
        // this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
        // this.updateValidation(true, this.candidatesForm.get('LeaveGroupId'));
        this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
        this.updateValidation(true, this.candidatesForm.get('TeamId'));
        this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
        this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
        this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' && this.IsReporingManagerRequired == true ?  this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;

      }

    }

    this.DateOfJoining = null; // 
  }

  changeSourceType(event: any) { }

  onApproval(event: any) {
    this.isAttachment = event == "attachment" ? true : false;
    // if (this.isAttachment) {
    //   this.isClientApproval = true;
    // } else this.isClientApproval = false;
  }
  onChangeClient(item: ClientList) {

    this.MandatesList = [];
    this.CandidateList = [];
    this.ClientContractId = null;
    this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(null) : null;
    this.candidatesForm.controls['mandateName'] != null ? this.candidatesForm.controls['mandateName'].setValue(null) : null;
    this.candidatesForm.controls['candidateName'] != null ? this.candidatesForm.controls['candidateName'].setValue(null) : null;
    this.candidatesForm.controls['clientSPOC'] != null ? this.candidatesForm.controls['clientSPOC'].setValue(null) : null;
    this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(null) : null;
    this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(null) : null;
    this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(null) : null;
    this.OfferInfoListGrp1 = null;

    this.SkillCategoryList = [];
    this.ZoneList = [];

    this.Id == 0 ? this.OfferInfoListGrp = undefined : null
    if (this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = null;
    }

    this.isRateCardType = false;
    if (item != null)
      this.refreshContractAndContact(item.Id);

  }

  onChangeContract(item: ClientContractList) {

    this.ClientContractId = item.Id;
    this.doAccordionLoading('isDocumentInfo');
    this.isRateCardType = item.IsRateCardModel == true ? true : false;
    if (this.isRateCardType) {
      this.RateCardTypelable = "Is Ratecard type should be applicable";
      this.updateValidation(true, this.candidatesForm.get('monthlyAmount'));
    }
    else {
      this.RateCardTypelable = "";
      this.updateValidation(false, this.candidatesForm.get('monthlyAmount'));

    }


  }

  refreshContractAndContact(ClientId): any {
    return new Promise((resolve, reject) => {
      this.ClientId = ClientId;
      let i = this.OnBoardingInfoListGrp.ClientContractList.filter(a => a.ClientId == ClientId);
      let filterd = _.filter(this.OnBoardingInfoListGrp.ClientContractList, (a) => a.ClientId === ClientId);
      console.log(i);
      this.ClientContractList = _.orderBy(i, ["Name"], ["asc"]);
      console.log(this.OnBoardingInfoListGrp);
      this.ClientContactList = _.orderBy(this.OnBoardingInfoListGrp.ClientContactList.filter(a => a.ClientId == ClientId), ["Name"], ["asc"]);
      console.log(this.ClientContractList);
      let exists = this.ClientContractList.find(a => a.Id == this.ClientContractId);
      if (exists != null) {
        this.onChangeContract(exists);
      }
      resolve(true);
    });
  }

  // Onboarding Request details ** region begin **
  onClickMandateAssignment(event): any {

    // let userId = this.Id != 0 ? this.alternativeUserId_For_Mandates : this.UserId;
    let userId = this.Id == 0 && this.candidatesForm.controls['requestBy'] != null && this.isOnBehalfOf ? this.candidatesForm.controls['recruiterName'] != null ? this.candidatesForm.get('recruiterName').value : this.UserId : this.Id != 0 &&
      this.candidatesForm.controls['requestBy'] != null && this.isOnBehalfOf ? this.candidatesForm.controls['recruiterName'] != null ? this.candidatesForm.get('recruiterName').value : this.alternativeUserId_For_Mandates : this.UserId;


    if (this.ClientId && userId) {

      this.MandatesList = [];
      this.isLoading = false;
      this.onboardingService.getMandatesForOnboarding(userId, this.ClientId)
        .subscribe(response => {

          console.log('sss', response);

          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.MandatesList = _.orderBy(JSON.parse(apiResult.Result), ["Name"], ["asc"]);
            this.isLoading = true;
          } else {

            this.isLoading = true;

          }

        }, (error) => {

          this.should_spin_onboarding = false;
        });
    }
    else {
      this.MandatesList = [];
      this.candidatesForm.controls['mandateName'] != null ? this.candidatesForm.controls['mandateName'].setValue(null) : null;

      // this.alertService.showInfo('Choose your client and select mandate');
    }
  }
  onClickCandidate(event): any {

    this.MandateAssignmentId = (this.candidatesForm.get('mandateName').value);

    if (this.MandateAssignmentId != null) {
      this.isLoading = true;

      this.onboardingService.getCandidateByAssignmentId(this.MandateAssignmentId)
        .subscribe(response => {

          // console.log(response);

          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {

            console.log(apiResult.Result);

            this.CandidateList = _.orderBy(JSON.parse(apiResult.Result), ["Name"], ["asc"]);
            this.isLoading = false;

          } else {

            this.isLoading = false;

          }

        }, (error) => {
          this.should_spin_onboarding = false;
        });
    }
    else {
      // alert("please choose mandate before proceed")
    }
  }


  onChangeCandidate(item: ExternalCandidateInfo): void {
    if (item) {
      this.CandidateId = item.CandidateId;
      this.candidatesForm.controls['firstName'].setValue(item.Name);
      this.candidatesForm.controls['gender'].setValue(item.Gender == Number("") ? null : item.Gender);
      this.candidatesForm.controls['nationality'].setValue(item.Nationality == Number("") ? null : item.Nationality);
      this.candidatesForm.controls['email'].setValue(item.PrimaryEmail);
      this.countryCode = (item.PrimaryMobileCountryCode);
      this.candidatesForm.controls['mobile'].setValue(item.PrimaryMobile);
      this.candidatesForm.controls['dateOfBirth'].setValue(this.datePipe.transform(item.DateOfBirth, "dd-MM-yyyy"));
    }
  }

  // Onboarding Request details ** region end **

  /* #endregion */

  /* #region  Candidate Information accordion */
  onChangeWorkPermitDate(event) {

    if (this._NewCandidateDetails == null) {

      this.candidatesForm.controls['isValidTill'].setValue(null);
    }
    if (this.candidatesForm.get('isValidFrom').value != null || this.candidatesForm.get('isValidFrom').value != undefined) {
      var workpermitValidFrom = new Date(event);
      this.workPermitminDate.setDate(workpermitValidFrom.getDate() + 1);
      this.workPermitminDate.setMonth(workpermitValidFrom.getMonth());
      this.workPermitminDate.setFullYear(workpermitValidFrom.getFullYear());
    }
  }
  theFunction(item) {
    this.countryCode = item.name;
  }
  onNationality(event: any) {
    this.isNationality = event == "nonindian" ? true : false;
  }

  //TODO:To update formgroup validation
  updateValidation(value, control: AbstractControl) {

    console.log('updateValidation', control);

    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  onChangeNationality(event) {
    this.nonIndian = event.id == 2 ? true : false;
    if (this.nonIndian) {
      try {
        this.updateValidation(true, this.candidatesForm.get('country'));
        this.updateValidation(true, this.candidatesForm.get('workPermitType'));
        this.updateValidation(true, this.candidatesForm.get('isValidFrom'));
        this.updateValidation(true, this.candidatesForm.get('isValidTill'));
      } catch (error) {
      }
    }
    else if (!this.nonIndian)
      try {
        this.updateValidation(false, this.candidatesForm.get('country'));

        this.updateValidation(false, this.candidatesForm.get('workPermitType'));
        this.updateValidation(false, this.candidatesForm.get('isValidFrom'));
        this.updateValidation(false, this.candidatesForm.get('isValidTill'));
      } catch (error) {
      }

  }
  /* #endregion */

  /* #region  Offer Information accordion */


  doletterTemplate() {

    this.onboardingService.getLetterTemplate(this.CompanyId, this.ClientId, this.ClientContractId)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;
        if (apiResult.Status && apiResult.Result != "") {
          this.LetterTemplateList = JSON.parse(apiResult.Result);
          this.LetterTemplateListOL = this.LetterTemplateList.filter(a => a.RequestType == ApprovalFor.OL);
          this.LetterTemplateListAL = this.LetterTemplateList.filter(a => a.RequestType == ApprovalFor.AL);
        }
      }), ((err) => {

      })
  }


  onFocus_OfferAccordion(newValue, Formindex) {


    return new Promise((resolve, reject) => {

      if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
        this._LstRateSet = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      }


      if (this._LstRateSet != null && this._LstRateSet.length > 0) {

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

          this._LstRateSet = null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = [];
        })



      }

    });




  }




  onChangeOfferLocation(event: ClientLocationList) {

    if (event == null) {
      this.CityName = null;
      this.StateName = null;
    }
    else {
      this.CityName = event.CityName;
      this.StateName = event.StateName;
      this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(null) : null;
      this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(null) : null;
    }

    this.IndustryId = (this.candidatesForm.controls['industryType'] != null ? (this.candidatesForm.get('industryType').value) : null);

    if (event != null) {

      this.StateId = event.StateId;
      this.CityId = event.CityId;
    }
    if (this.IndustryId && this.StateId) {
      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {
          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.SkillCategoryList = [];
            this.ZoneList = [];
            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
            this.ZoneList = this.OfferInfoListGrp1.ZoneList;
          }
        },
          ((err) => {

          }));
    }

    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('location').value), 'location') : null;
  }


  onChangeIndustryType(event) {
    console.log(event);
    if (event != null) {
      this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(null) : true;
      this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(null) : true;
    }
    this.IndustryId = (this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.get('industryType').value : 0);
    if (this.StateId && this.IndustryId && this.IndustryId > 0)

      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {
          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            this.SkillCategoryList = [];
            this.ZoneList = [];
            this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
            this.ZoneList = this.OfferInfoListGrp1.ZoneList;
          }
        },
          ((err) => {
          }));

    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.get('industryType').value : 0), 'industryType') : null;


  }
  onChangePayGroup(event) {
    event != null ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId), 'paystructure') : null;

  }

  onChangeSalary(event) {
    if (event != undefined) {

      this.PayGroupList = [];
      this.candidatesForm.controls['paystructure'].setValue(null);
      this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
      this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);
      event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('salaryType').value), 'salaryType') : null;

    }
  }
  onChangeAnnaulSalary(event) {
    this.salaryInwords = this.inWords(this.SalaryFormat);
    this.SalaryFormat = this.candidatesForm.get('annualSalary').value;
    this.candidatesForm.controls['MonthlySalary'].setValue(Math.floor(this.candidatesForm.get('annualSalary').value / 12))
    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('annualSalary').value), 'annualSalary') : null;

  }

  onChangeMonthlySalary(event) {

    this.candidatesForm.controls['annualSalary'].setValue(Math.floor(this.candidatesForm.get('MonthlySalary').value * 12))
    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('MonthlySalary').value), 'MonthlySalary') : null;

  }


  onChangeMonthlyAmount(event) {

    this.MonthlySalaryFormat = this.candidatesForm.get('monthlyAmount').value;
  }

  editOnChangeSalary(event) {

    if (this.OfferInfoListGrp != null && this.OfferInfoListGrp != undefined && this.OfferInfoListGrp.PayGroupList != null && this.OfferInfoListGrp.PayGroupList.length > 0) {
      this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
      console.log('this.PayGroupList', this.PayGroupList);

      this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);
      let payGrpId = this.candidatesForm.controls['paystructure'] != null ? this.candidatesForm.get('paystructure').value : null;
      if (payGrpId != null && this.PayGroupList.length != 0 && payGrpId != undefined) {
        var payGrpFilterd = _.find(this.PayGroupList, (item) => item.PayGroupId == payGrpId);
        this.candidatesForm.controls['paystructure'] != null ? this.candidatesForm.controls['paystructure'].setValue(payGrpFilterd.PayGroupId) : true;
      }
    }
  }

  // editOnChangeSalary(event) {
  //   this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
  //   this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);
  //   let payGrpId = this.candidatesForm.get('paystructure').value;
  //   if (payGrpId != null && this.PayGroupList.length != 0) {
  //     var payGrpFilterd = _.find(this.PayGroupList, (item) => item.PayGroupId == payGrpId);
  //     this.candidatesForm.controls['paystructure'].setValue(payGrpFilterd.PayGroupId);
  //   }
  // }

  onchangeTenureValidation(event) {
    if (event.id == 1) {

      this.updateValidation(true, this.candidatesForm.get('tenureEndate'));
      this.updateValidation(false, this.candidatesForm.get('tenureMonth'));

    } else if (event.id == 2) {
      this.updateValidation(true, this.candidatesForm.get('tenureMonth'));
      this.updateValidation(false, this.candidatesForm.get('tenureEndate'));

    }
    else {

      this.updateValidation(false, this.candidatesForm.get('tenureMonth'));
      this.updateValidation(false, this.candidatesForm.get('tenureEndate'));

    }
  }

  onChangeTenureType(event) {
    if (event.id == 1) {

      this.updateValidation(true, this.candidatesForm.get('tenureEndate'));
      this.updateValidation(false, this.candidatesForm.get('tenureMonth'));

    } else if (event.id == 2) {
      this.updateValidation(true, this.candidatesForm.get('tenureMonth'));
      this.updateValidation(false, this.candidatesForm.get('tenureEndate'));

    }
    else {


      this.updateValidation(false, this.candidatesForm.get('tenureMonth'));
      this.updateValidation(false, this.candidatesForm.get('tenureEndate'));

    }
    this.candidatesForm.controls['tenureEndate'] != null ? this.candidatesForm.controls['tenureEndate'].setValue(null) : null;
    this.candidatesForm.controls['tenureMonth'] != null ? this.candidatesForm.controls['tenureMonth'].setValue(null) : null;
  }

  onChangeDOB(dobDate) {

    this.DOB = dobDate;

  }


  onChangeDOJ(dojDate) {
    //  this.counter = this.counter + 1;

    //  if (this.counter > 2 && dojDate.length != 0) {

    if (dojDate != null)

      var including = dojDate.toString().includes("-");


    if (including) {
      var dateParts = dojDate.split("-");
      var dateObject = new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0]);
      this.DateOfJoining = dateObject;
      dojDate = dateObject;
    } else {

      this.DateOfJoining = new Date(dojDate);
    }


    // this.candidatesForm.controls['tenureEndate'].setValue(null);

    if (this.candidatesForm.get('requestFor').value == "OL" && this.candidatesForm.controls['expectedDOJ'] != null != undefined && this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.get('expectedDOJ').value != null || this.candidatesForm.get('expectedDOJ').value != undefined : null) {

      this.DateOfJoining = new Date(dojDate);
      var tenureEndDate = new Date(dojDate);
      this.TenureminDate.setDate(tenureEndDate.getDate() + 1);
      this.TenureminDate.setMonth(tenureEndDate.getMonth());
      this.TenureminDate.setFullYear(tenureEndDate.getFullYear());
      // }

    }

    if (this.candidatesForm.get('requestFor').value == "AL" && this.candidatesForm.controls['ActualDOJ'] != null && this.candidatesForm.get('ActualDOJ').value != null && this.candidatesForm.get('ActualDOJ').value != undefined) {

      this.DateOfJoining = new Date(dojDate);
      var tenureEndDate = new Date(dojDate);
      this.TenureminDate.setDate(tenureEndDate.getDate() + 1);
      this.TenureminDate.setMonth(tenureEndDate.getMonth());
      this.TenureminDate.setFullYear(tenureEndDate.getFullYear());

      // }
    }


    if (this.datePipe.transform((this.DateOfJoining).toString(), 'yyyy-MM-dd') == "1970-01-01") {
      this.DateOfJoining = null;
    }


    // }
  }




  PreviewCTC(): void {

    let isValid = false;
    let isDirty = false;
    if 

    (this.candidatesForm.controls['industryType'] != null &&   this.candidatesForm.controls['industryType'].valid &&
      this.candidatesForm.controls['location'].valid &&
      this.candidatesForm.controls['skillCategory'].valid &&
      this.candidatesForm.controls['zone'].valid &&
      this.candidatesForm.controls['salaryType'].valid &&
      this.candidatesForm.controls['annualSalary'].valid &&
      this.candidatesForm.controls['paystructure'].valid &&
      this.candidatesForm.get('annualSalary').value > 0
      // this.candidatesForm.get('onCostInsuranceAmount').value > 0 &&
      // this.DateOfJoining != null

    ) {


      if (this.candidatesForm.get('requestFor').value.toString() === "AL" && (this.candidatesForm.get('ActualDOJ').value == null || this.candidatesForm.get('ActualDOJ').value == undefined)) {

        isValid = false;
        this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        return;
      }
      else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && (this.candidatesForm.get('expectedDOJ').value == null || this.candidatesForm.get('expectedDOJ').value == undefined)) {
        isValid = false;
        this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        return;
      }

      else {
        isValid = true;
      }
    } else {

      isValid = false;
      this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
      return;
    }

    if (this.candidatesForm.controls['industryType'] != null && this.candidatesForm.controls['industryType'].dirty ||
      this.candidatesForm.controls['location'].dirty ||
      this.candidatesForm.controls['skillCategory'].dirty ||
      this.candidatesForm.controls['zone'].dirty ||
      this.candidatesForm.controls['salaryType'].dirty ||
      this.candidatesForm.controls['annualSalary'].dirty ||
      this.candidatesForm.controls['paystructure'].dirty ||
      // this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.controls['expectedDOJ'].dirty : null ||
      this.candidatesForm.controls['onCostInsuranceAmount'].dirty
    ) {
      isDirty = true;
    } else { isDirty = false; }



    if (isValid) {

      let DOJ = this.candidatesForm.get("requestFor").value == "AL" ? new Date(this.candidatesForm.get("ActualDOJ").value) : this.DateOfJoining;

      this.previewCTC_OfferDetails.IndustryId = this.candidatesForm.get('industryType').value;
      this.previewCTC_OfferDetails.State = Number(this.StateId)
      this.previewCTC_OfferDetails.CityId = Number(this.CityId)
      this.previewCTC_OfferDetails.ClientContractId = Number(this.ClientContractId);
      this.previewCTC_OfferDetails.ClientId = Number(this.ClientId);
      this.previewCTC_OfferDetails.SkillCategory = this.candidatesForm.get('skillCategory').value;
      this.previewCTC_OfferDetails.Zone = this.candidatesForm.get('zone').value;
      this.previewCTC_OfferDetails.Location = this.candidatesForm.get('location').value;
      this.previewCTC_OfferDetails.DateOfJoining = DOJ;
      this.previewCTC_OfferDetails.GMCAmount = this.candidatesForm.get('Gmc').value == null ? 0 : this.candidatesForm.get('Gmc').value;;
      this.previewCTC_OfferDetails.GPAAmount = this.candidatesForm.get('Gpa').value == null ? 0 : this.candidatesForm.get('Gpa').value;;
      this.previewCTC_OfferDetails.NoticePeriodDays = this.candidatesForm.get('NoticePeriod').value == null ? 0 : this.candidatesForm.get('NoticePeriod').value;;
      // this.previewCTC_OfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount').value == null || this.candidatesForm.get('onCostInsuranceAmount').value == '' ? 0 : this.candidatesForm.get('onCostInsuranceAmount').value;
      this.previewCTC_OfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount').value == null ? 0 : this.candidatesForm.get('onCostInsuranceAmount').value;

      this.previewCTC_OfferDetails.IsRateSetValid = this._NewCandidateDetails.Id == undefined ? true : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid;

      this.previewCTC_OfferDetails.IsMinimumwageAdhere = this._NewCandidateDetails.Id == undefined ? true : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere;

      this.previewCTC_OfferDetails.CalculationRemarks = this._NewCandidateDetails.Id == undefined ? "" : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks;
      // CalculationRemarks
      this.previewCTC_OfferDetails.LstPayGroupProductOverrRides =
        this._NewCandidateDetails.Id == undefined ? [] : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides;

      // this.previewCTC_OfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount').value;
      this.previewCTC_OfferDetails.FixedInsuranceDeduction = this.candidatesForm.get('fixedDeductionAmount').value != null && this.candidatesForm.get('fixedDeductionAmount').value != "" ? this.candidatesForm.get('fixedDeductionAmount').value : 0;
      this.previewCTC_OfferDetails.LetterTemplateId = this.candidatesForm.controls['letterTemplate'] != null ? this.candidatesForm.get('letterTemplate').value != null && this.candidatesForm.get('letterTemplate').value != 0 ? this.candidatesForm.get('letterTemplate').value : 0 : this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidatesForm.get('AppointmentLetterTemplateId').value != null && this.candidatesForm.get('AppointmentLetterTemplateId').value != 0 ? this.candidatesForm.get('AppointmentLetterTemplateId').value : 0 : null;
      console.log('before', this._NewCandidateDetails);

      let ListRateSet = [];
      // ListRateSet = this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      // this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      // this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      // this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet;
      // console.log('after', this._NewCandidateDetails);

      ListRateSet.push({
        AnnualSalary: this.candidatesForm.get('annualSalary').value,
        Salary: this.candidatesForm.get('annualSalary').value,
        SalaryBreakUpType: this.candidatesForm.get('salaryType').value,
        PayGroupdId: this.candidatesForm.get('paystructure').value,
        IsMonthlyValue: this.candidatesForm.get('forMonthlyValue').value,
        MonthlySalary: this.candidatesForm.get('MonthlySalary').value,
        LstRateSet: this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet : null,
      })


      console.log(ListRateSet);
      this.previewCTC_OfferDetails.LstCandidateRateSet = (ListRateSet);

      console.log('after', this.previewCTC_OfferDetails);

      // this.previewCTC_OfferDetails.LstCandidateRateSet[0].LstRateSet = this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
      //   this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet : null;

      if (this._NewCandidateDetails.Id == undefined) {
        this._NewCandidateDetails.Id = 0;
        this._NewCandidateDetails.LstCandidateOfferDetails = []
        this._NewCandidateDetails.LstCandidateOfferDetails[0] = (this.previewCTC_OfferDetails);
      }

      console.log(this._NewCandidateDetails);

      this.loadingScreenService.startLoading();
      this.confirmPrevieCTC();


    } else {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Preview is not available!");
    }

  }

  confirmPrevieCTC() {

    console.log('MINIM', this._NewCandidateDetails.LstCandidateOfferDetails[0]);

    if (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {

      sessionStorage.removeItem('LstRateSet');
      sessionStorage.setItem('LstRateSet', JSON.stringify(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet));
      this.loadingScreenService.stopLoading();
      const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
      modalRef.componentInstance.id = 0;
      modalRef.componentInstance.PayGroupId = this.candidatesForm.get('paystructure').value;
      modalRef.componentInstance.ClientContractId = this.ClientContractId;
      modalRef.componentInstance.jsonObj = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      modalRef.componentInstance.newCandidateOfferObj = this._NewCandidateDetails.LstCandidateOfferDetails[0];

      modalRef.result.then((result) => {

        console.log('ss', result);
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks = result.CalculationRemarks;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = result.RequestType;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = result.LetterTemplateId;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = result.IsRateSetValid;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        // this._NewCandidateDetails.LstCandidateOfferDetails[0] =(result);
        this._LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        this.isRateSetValid = result.IsRateSetValid;
        this.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this.isESICapplicable = result.LstCandidateRateSet[0].LstRateSet != null && result.LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;

        console.log(this._NewCandidateDetails, 'ddd');

      }).catch((error) => {
        console.log(error);
      });

    } else {

      this.getPaygroupProductOverrideItems().then((result) => {
        console.log('rsult', result);
        if (result != null) {
          this.previewCTC_OfferDetails.LstPayGroupProductOverrRides = result as any;
        } else {
          this.previewCTC_OfferDetails.LstPayGroupProductOverrRides = null
        }

        this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(this.previewCTC_OfferDetails))).subscribe((res) => {
          let apiResult: apiResult = res;

          try {

            if (apiResult.Status && apiResult.Result != null) {

              var _LstSalaryBreakUp: any;
              _LstSalaryBreakUp = (apiResult.Result)
              let LstRateSet = _LstSalaryBreakUp.LstCandidateRateSet[0].LstRateSet;
              sessionStorage.removeItem('LstRateSet');
              sessionStorage.setItem('LstRateSet', JSON.stringify(LstRateSet));
              this.loadingScreenService.stopLoading();
              const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
              modalRef.componentInstance.id = 0;
              modalRef.componentInstance.PayGroupId = this.candidatesForm.get('paystructure').value;
              modalRef.componentInstance.ClientContractId = this.ClientContractId;
              modalRef.componentInstance.jsonObj = LstRateSet;
              modalRef.componentInstance.newCandidateOfferObj = apiResult.Result;

              modalRef.result.then((result) => {

                console.log('ss', result);
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere = result.IsMinimumwageAdhere;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks = result.CalculationRemarks;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = result.RequestType;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = result.LetterTemplateId;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = result.IsRateSetValid;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
                // this._NewCandidateDetails.LstCandidateOfferDetails[0] = (result);
                // this._LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
                this.isRateSetValid = result.IsRateSetValid;
                this.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
                this.isESICapplicable = result.LstCandidateRateSet[0].LstRateSet != null && result.LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;

                console.log(this._NewCandidateDetails, 'testet');

              }).catch((error) => {
                console.log(error);
              });


            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message)
            }
          } catch (error) {

            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(error);
          }

          console.log(apiResult.Result);


        }), ((err) => {

        })
      });
    }

  }
  getPaygroupProductOverrideItems() {
    return new Promise((resolve, reject) => {
      this.onboardingService.getMigrationMasterInfo(this.ClientContractId).subscribe((result) => {
        let apiResult: apiResult = (result);
        console.log(apiResult);
        var lstOfPaygroupOverrideProducts = [];
        if (apiResult.Status && apiResult.Result != null) {
          var offerMasterInfo = JSON.parse(apiResult.Result);
          var MigrationInfoGrp = offerMasterInfo[0];
          var lstOfPaygroupOverrideProducts = [];
          if (MigrationInfoGrp.PaygroupProductOverridesList != null && MigrationInfoGrp.PaygroupProductOverridesList.length > 0) {
            lstOfPaygroupOverrideProducts = MigrationInfoGrp.PaygroupProductOverridesList;
            var lstOfPaygroupOverrideProducts = lstOfPaygroupOverrideProducts.filter(item => item.PayGroupId == this.candidatesForm.get('paystructure').value);
            lstOfPaygroupOverrideProducts = lstOfPaygroupOverrideProducts.filter(a => a.IsDefault == true);
          }
          resolve(lstOfPaygroupOverrideProducts);
        } else {
          resolve(lstOfPaygroupOverrideProducts);
        }

      }), ((error) => {
      })
    });
  }
  PreviewLetter(): void {

    if (this.CandidateId != 0 && this.Id != 0) {

      let isValid = false;
      if (

        this.candidatesForm.controls['industryType'].valid &&
        this.candidatesForm.controls['location'].valid &&
        this.candidatesForm.controls['skillCategory'].valid &&
        this.candidatesForm.controls['zone'].valid &&
        this.candidatesForm.controls['salaryType'].valid &&
        this.candidatesForm.controls['annualSalary'].valid &&
        this.candidatesForm.controls['paystructure'].valid &&
        this.candidatesForm.controls['tenureType'].valid &&
        this.candidatesForm.get('annualSalary').value > 0
        // this.DateOfJoining != null
        // this.candidatesForm.get('onCostInsuranceAmount').value > 0 &&


      ) {

        if (this.candidatesForm.get('tenureType').value == 1 && this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.get('tenureEndate').value == null) {
          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
          return;
        }
        else if (this.candidatesForm.get('tenureType').value == 2 && this.candidatesForm.controls['tenureMonth'] != null && this.candidatesForm.get('tenureMonth').value == null || this.candidatesForm.get('tenureMonth').value == '') {

          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
          return;
        }
        else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && this.candidatesForm.get('letterTemplate').value == null || this.candidatesForm.get('letterTemplate').value == 0) {
          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
          return;
        }
        else if (this.candidatesForm.get('requestFor').value.toString() === "AL" && this.candidatesForm.get('AppointmentLetterTemplateId').value == null || this.candidatesForm.get('AppointmentLetterTemplateId').value == 0) {
          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
          return;
        }
        else if (this.candidatesForm.get('requestFor').value.toString() === "AL" && (this.candidatesForm.get('ActualDOJ').value == null || this.candidatesForm.get('ActualDOJ').value == undefined)) {

          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
          return;
        }
        else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && (this.candidatesForm.get('expectedDOJ').value == null || this.candidatesForm.get('expectedDOJ').value == undefined)) {
          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
          return;
        }
        else {

          isValid = true;
        }
      } else {
        isValid = false;
        this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
        return;
      }


      this.loadingScreenService.startLoading();
      if (isValid) {

        console.log(this._NewCandidateDetails.LstCandidateOfferDetails, 'kkkk');

        if (this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
          this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = this.candidatesForm.get('requestFor').value;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount = this.candidatesForm.get('Gpa').value == null ? 0 : this.candidatesForm.get('Gpa').value;;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount = this.candidatesForm.get('Gmc').value == null ? 0 : this.candidatesForm.get('Gmc').value;;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays = this.candidatesForm.get('NoticePeriod').value == null ? 0 : this.candidatesForm.get('NoticePeriod').value;;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount').value == null ? 0 : this.candidatesForm.get('onCostInsuranceAmount').value;;

          this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType = this.candidatesForm.get('tenureType').value;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate = this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.get('tenureEndate').value != null ? this.datePipe.transform(new Date(this.candidatesForm.get('tenureEndate').value).toString(), "yyyy-MM-dd") : null;
          this.candidatesForm.get('requestFor').value == 'OL' ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = this.candidatesForm.get('letterTemplate').value : this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId = this.candidatesForm.get('AppointmentLetterTemplateId').value;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval = this.candidatesForm.controls['tenureMonth'] != null ? Number(this.candidatesForm.get('tenureMonth').value) : null;


          var req_post_param = JSON.stringify({

            ModuleProcessTranscId: this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
            CandidateDetails: this._NewCandidateDetails
          });
          console.log(JSON.stringify(req_post_param));
          this.onboardingService.postPreviewLetter(req_post_param)
            .subscribe(data => {

              this.loadingScreenService.stopLoading();


              let apiResult: apiResult = data;

              if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
                console.log(apiResult.Result);
                let base64 = apiResult.Result;
                let contentType = 'application/pdf';
                let fileName = "integrum_previewLetter";
                // let file = null;

                const byteArray = atob(base64);
                const blob = new Blob([byteArray], { type: contentType });
                let file = new File([blob], fileName, {
                  type: contentType,
                  lastModified: Date.now()
                });
                if (file !== null) {
                  let fileURL = null;

                  const newPdfWindow = window.open('', '');

                  const content = encodeURIComponent(base64);

                  // tslint:disable-next-line:max-line-length
                  const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

                  const iframeEnd = '\'><\/iframe>';

                  newPdfWindow.document.write(iframeStart + content + iframeEnd);
                  newPdfWindow.document.title = fileName;
                  // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));


                }
              }
              else
                this.alertService.showWarning(apiResult.Message)
            }),

            ((error) => {

            });


        }
        else {

          this.loadingScreenService.stopLoading();

          this.alertService.showWarning("Please update your CTC breakup ")
        }

      } else { this.loadingScreenService.stopLoading(); this.alertService.showWarning("Preview letter is not available!") }
    }
    else {
      this.alertService.showInfo("Please save this form to preview the letter")
    }

  }

  /* #endregion */

  /* #region  Candidate Other details accordion */

  onHavingPan(event) {

    if (this.candidatesForm.get('haveApplied').value == false) {

      this.updateValidation(true, this.candidatesForm.get('ackowledgmentNumber'));
      this.updateValidation(false, this.candidatesForm.get('PANNO'));

      this.updateValidation(true, this.candidatesForm.get('ackowledgmentNumber'));
      this.updateValidation(false, this.candidatesForm.get('PANNO'));

    } else {

      this.updateValidation(false, this.candidatesForm.get('ackowledgmentNumber'));

    }

  }

  onPanCard(event) {
    if (this.candidatesForm.get('isPANNoExists').value == false) {
      this.candidatesForm.controls['haveApplied'].setValue(false);

      this.updateValidation(true, this.candidatesForm.get('PANNO'));
      this.updateValidation(false, this.candidatesForm.get('ackowledgmentNumber'));


    } else {
      this.updateValidation(false, this.candidatesForm.get('PANNO'));


    }
  }

  /* #endregion */

  onChangetblDate(event, item) {
    item.ValidTill = null;
    if (item.ValidFrom != null) {
      var validFrom = new Date(event);
      this.tblminDate.setDate(validFrom.getDate() + 1);
    }
  }

  functionAccordion(): Promise<any> {
    return Promise.resolve((() => {
      this.onboardingService.getOnboardingInfo("isBankInfo", this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? this.ClientId : 0)
        .subscribe(authorized => {

          const apiResult: apiResult = authorized;
          this.BankInfoListGrp = JSON.parse(apiResult.Result);
          this.BankList = this.BankInfoListGrp.BankList;

          return this.BankList;

        });
    })());
  }

  async fetchBank(BankId) {
    const users = await this.functionAccordion();
    return this.BankList.find(a => a.Id == BankId).Name;
  }
  // open nominee popup modal screen

  // addNominee(newString) {

  //   if (newString != undefined && newString.CandidateDocument != null) {

  //     newString.DocumentId = newString.CandidateDocument.DocumentId;
  //     newString.FileName = newString.CandidateDocument.FileName;
  //     newString.idProoftype = newString.CandidateDocument.DocumentTypeId;
  //   }

  //   const modalRef = this.modalService.open(NomineeModalComponent, this.modalOption);
  //   modalRef.componentInstance.UserId = this.UserId;
  //   modalRef.componentInstance.id = newString == undefined ? 0 : newString.Id;
  //   modalRef.componentInstance.jsonObj = newString;
  //   modalRef.componentInstance.LstNominees = this.LstNominees;
  //   modalRef.componentInstance.OT = this.candidatesForm.get('onboardingType').value;
  //   modalRef.componentInstance.isESICapplicable = this.isESICapplicable;

  //   var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
  //   modalRef.componentInstance.objStorageJson = objStorageJson;
  //   modalRef.result.then((result) => {

  //     if (result != "Modal Closed") {
  //       console.log(result);

  //       let isAlreadyExists = false;
  //       let isSameResult = false;
  //       let relationshipLst: any;

  //       relationshipLst = this.utilsHelper.transform(Relationship);
  //       result.RelationShip = relationshipLst.find(a => a.id == result.relationship).name;
  //       result.isMedical = result.mediclaim == true ? "Yes" : "No";
  //       result.IDProof = result.idProoftype;
  //       // result.DateofBirth = this.datePipe.transform(result.DOB, "dd-MM-yyyy");
  //       result.DateofBirth = result.DOB;

  //       result.Age = this.AgeCalculator(result.DOB);

  //       if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {

  //         var candidateDets = new CandidateDocuments();
  //         candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
  //         candidateDets.CandidateId = this.CandidateId;
  //         candidateDets.IsSelfDocument = false;
  //         candidateDets.DocumentId = result.DocumentId;
  //         candidateDets.DocumentCategoryId = 0;
  //         candidateDets.DocumentTypeId = result.idProoftype
  //         candidateDets.DocumentNumber = "0";
  //         candidateDets.FileName = result.FileName;
  //         candidateDets.ValidFrom = null;
  //         candidateDets.ValidTill = null;
  //         candidateDets.Status = ApprovalStatus.Pending // 
  //         candidateDets.IsOtherDocument = true;
  //         candidateDets.Modetype = UIMode.Edit;
  //         candidateDets.DocumentCategoryName = "";
  //         candidateDets.StorageDetails = null;
  //         result.CandidateDocument = candidateDets;
  //         result.Modetype = UIMode.Edit;


  //       }
  //       else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {


  //         var candidateDets = new CandidateDocuments();
  //         candidateDets.Id = result.CandidateDocument.Id;
  //         candidateDets.CandidateId = result.CandidateDocument.CandidateId;
  //         candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
  //         candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
  //         candidateDets.DocumentCategoryId = 0;
  //         candidateDets.DocumentTypeId = result.idProoftype
  //         candidateDets.DocumentNumber = "0";
  //         candidateDets.FileName = result.FileName;
  //         candidateDets.ValidFrom = null;
  //         candidateDets.ValidTill = null;
  //         candidateDets.Status = ApprovalStatus.Pending // 
  //         candidateDets.IsOtherDocument = true;
  //         candidateDets.Modetype = UIMode.Edit;
  //         candidateDets.DocumentCategoryName = "";
  //         candidateDets.StorageDetails = null;
  //         result.CandidateDocument = candidateDets;
  //         result.Modetype = UIMode.Edit;


  //       }

  //       else {

  //         result.CandidateDocument = null;

  //         result.Modetype = this.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
  //         result.isDocumentStatus = null;
  //         result.DocumentStatus = null;
  //       }

  //       result.isDocumentStatus = ApprovalStatus.Pending;
  //       result.DocumentStatus = "Pending";
  //       result.id = result.Id



  //       isAlreadyExists = _.find(this.LstNominees, (a) => a.Id != result.Id && a.relationship == result.relationship) != null ? true : false;

  //       if (isAlreadyExists) {

  //         this.alertService.showWarning("The specified Nominee detail already exists");

  //       } else {

  //         isSameResult = _.find(this.LstNominees, (a) => a.Id == result.Id) != null ? true : false;
  //         if (isSameResult) {

  //           this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

  //         } else {
  //           this.angularGrid.gridService.addItemToDatagrid(result);
  //         }

  //       }

  //       console.log(this.LstNominees);


  //     }

  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }
  addNominee(newString) {
    this.onboardingService.getOnboardingInfo('isDocumentInfo', this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
      .subscribe(authorized => {

        let apiResult: apiResult = (authorized);
        try {
          this.DocumentList = JSON.parse(apiResult.Result);
          if (newString != undefined && newString.CandidateDocument != null) {
            newString.DocumentId = newString.CandidateDocument.DocumentId;
            newString.FileName = newString.CandidateDocument.FileName;
            newString.idProoftype = newString.CandidateDocument.DocumentTypeId;
          }

          const modalRef = this.modalService.open(NomineeModalComponent, this.modalOption);
          modalRef.componentInstance.UserId = this.UserId;
          modalRef.componentInstance.id = newString == undefined ? 0 : newString.Id;
          modalRef.componentInstance.jsonObj = newString;
          modalRef.componentInstance.DocumentsList = this.DocumentList;
          modalRef.componentInstance.LstNominees = this.LstNominees;
          modalRef.componentInstance.OT = this.candidatesForm.get('onboardingType').value;
          modalRef.componentInstance.isESICapplicable = this.isESICapplicable;

          var objStorageJson = JSON.stringify({  CandidateName : this.candidatesForm.get('firstName').value , CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
          modalRef.componentInstance.objStorageJson = objStorageJson;
          modalRef.result.then((result) => {

            if (result != "Modal Closed") {
              console.log(result);

              let isAlreadyExists = false;
              let isSameResult = false;
              let relationshipLst: any;

              relationshipLst = this.utilsHelper.transform(Relationship);
              result.RelationShip = relationshipLst.find(a => a.id == result.relationship).name;
              result.isMedical = result.mediclaim == true ? "Yes" : "No";
              result.IDProof = result.idProoftype;
              // result.DateofBirth = this.datePipe.transform(result.DOB, "dd-MM-yyyy"); 
              result.DateofBirth = result.DOB;

              result.Age = this.AgeCalculator(result.DOB);

              if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {

                var candidateDets = new CandidateDocuments();
                candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
                candidateDets.CandidateId = this.CandidateId;
                candidateDets.IsSelfDocument = false;
                candidateDets.DocumentId = result.DocumentId;
                candidateDets.DocumentCategoryId = 0;
                candidateDets.DocumentTypeId = result.idProoftype
                candidateDets.DocumentNumber = "0";
                candidateDets.FileName = result.FileName;
                candidateDets.ValidFrom = null;
                candidateDets.ValidTill = null;
                candidateDets.Status = ApprovalStatus.Pending // 
                candidateDets.IsOtherDocument = true;
                candidateDets.Modetype = UIMode.Edit;
                candidateDets.DocumentCategoryName = "";
                candidateDets.StorageDetails = null;
                result.CandidateDocument = candidateDets;
                result.Modetype = UIMode.Edit;


              }
              else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {


                var candidateDets = new CandidateDocuments();
                candidateDets.Id = result.CandidateDocument.Id;
                candidateDets.CandidateId = result.CandidateDocument.CandidateId;
                candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
                candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
                candidateDets.DocumentCategoryId = 0;
                candidateDets.DocumentTypeId = result.idProoftype
                candidateDets.DocumentNumber = "0";
                candidateDets.FileName = result.FileName;
                candidateDets.ValidFrom = null;
                candidateDets.ValidTill = null;
                candidateDets.Status = ApprovalStatus.Pending // 
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

              result.isDocumentStatus = ApprovalStatus.Pending;
              result.DocumentStatus = "Pending";
              result.id = result.Id


              isAlreadyExists = _.find(this.LstNominees, (a) => a.Id != result.Id && a.relationship == result.relationship) != null ? true : false;

              if (isAlreadyExists) {

                this.alertService.showWarning("The specified Nominee detail already exists");

              } else {

                isSameResult = _.find(this.LstNominees, (a) => a.Id == result.Id) != null ? true : false;
                if (isSameResult) {

                  this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

                } else {
                  this.angularGrid.gridService.addItemToDatagrid(result);
                }

              }

              console.log(this.LstNominees);


            }

          }).catch((error) => {
            console.log(error);
          });
        }
        catch {

        }
      })
  }


  // open work experience popup modal screen

  addExperience(json_edit_object) {

    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;

    }


    const modalRef = this.modalService.open(WorkexperienceModalComponent, this.modalOption);

    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.LstExperience = this.LstExperience;

    var objStorageJson = JSON.stringify({ CandidateName : this.candidatesForm.get('firstName').value , IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;

    modalRef.result.then((result) => {

      if (result != "Modal Closed") {

        result.StartDate = this.datePipe.transform(result.startdate, "dd-MM-yyyy");
        result.EndDate = this.datePipe.transform(result.enddate, "dd-MM-yyyy");

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;

          candidateDets.CandidateId = this.CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;


        }
        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {


          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
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
        result.isDocumentStatus = ApprovalStatus.Pending;
        result.DocumentStatus = "Pending";
        result.id = result.Id
        console.log(result, 'exper');

        // result.UIMode = edit or delete 

        let isAlreadyExists = false;

        let isSameResult = false;
        console.log(result);

        isSameResult = _.find(this.LstExperience, (a) => a.Id == result.Id) != null ? true : false;

        if (isSameResult) {

          this.angularGrid_Experience.gridService.updateDataGridItemById(result.Id, result, true, true);

        } else {
          this.angularGrid_Experience.gridService.addItemToDatagrid(result);
        }

        console.log(this.LstExperience);

      }
    }).catch((error) => {
      console.log(error);
    });
  }
  // open education popup modal screen

  addEducation(json_edit_object) {

    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;

    }

    const modalRef = this.modalService.open(AcademicModalComponent, this.modalOption);
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    var objStorageJson = JSON.stringify({  CandidateName : this.candidatesForm.get('firstName').value , IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstEducation = this.LstEducation;

    modalRef.result.then((result) => {
      console.log(result);
      if (result != "Modal Closed") {

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {


          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;


        }
        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
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

        result.isDocumentStatus = ApprovalStatus.Pending;
        result.DocumentStatus = "Pending";
        result.id = result.Id
        let isAlreadyExists = false;
        let graduationLst: any;

        graduationLst = this.utilsHelper.transform(GraduationType);
        result.GraduationType = graduationLst.find(a => a.id == result.graduationType).name;


        isAlreadyExists = _.find(this.LstEducation, (a) => a.Id != result.Id && a.graduationType == result.graduationType) != null ? true : false; // not working

        if (isAlreadyExists) {

          this.alertService.showWarning("The specified Education detail already exists");

        } else {

          let isSameResult = false;
          isSameResult = _.find(this.LstEducation, (a) => a.Id == result.Id) != null ? true : false;

          if (isSameResult) {

            this.angularGrid_Education.gridService.updateDataGridItemById(result.Id, result, true, true);

          } else {
            this.angularGrid_Education.gridService.addItemToDatagrid(result);
          }

        }
      }


    }).catch((error) => {
      console.log(error);
    });
  }

  // open Bank info popup modal screen

  // addBank(json_edit_object) {

  //   this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data

  //   console.log(json_edit_object);

  //   if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

  //     json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
  //     json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
  //     json_edit_object.proofType = json_edit_object.CandidateDocument.DocumentTypeId;
  //   }

  //   const modalRef = this.modalService.open(BankModalComponent, this.modalOption);
  //   modalRef.componentInstance.UserId = this.UserId;
  //   modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
  //   modalRef.componentInstance.jsonObj = json_edit_object;
  //   modalRef.componentInstance.OT = this.candidatesForm.get('onboardingType').value;
  //   var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
  //   modalRef.componentInstance.objStorageJson = objStorageJson;
  //   modalRef.result.then((result) => {
  //     console.log(result);

  //     if (result != "Modal Closed") {


  //       if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {
  //         var candidateDets = new CandidateDocuments();
  //         candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
  //         candidateDets.CandidateId = this.CandidateId;
  //         candidateDets.IsSelfDocument = true;
  //         candidateDets.DocumentId = result.DocumentId;
  //         candidateDets.DocumentCategoryId = 0;
  //         candidateDets.DocumentTypeId = result.proofType
  //         candidateDets.DocumentNumber = "0";
  //         candidateDets.FileName = result.FileName;
  //         candidateDets.ValidFrom = null;
  //         candidateDets.ValidTill = null;
  //         candidateDets.Status = ApprovalStatus.Pending;
  //         candidateDets.IsOtherDocument = true;
  //         candidateDets.Modetype = UIMode.Edit;
  //         candidateDets.DocumentCategoryName = "";
  //         candidateDets.StorageDetails = null;
  //         result.CandidateDocument = candidateDets;
  //         result.Modetype = UIMode.Edit;
  //         console.log(candidateDets);

  //       }
  //       else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

  //         var candidateDets = new CandidateDocuments();
  //         candidateDets.Id = result.CandidateDocument.Id;
  //         candidateDets.CandidateId = result.CandidateDocument.CandidateId;
  //         candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
  //         candidateDets.DocumentId = result.DocumentId;
  //         candidateDets.DocumentCategoryId = 0;
  //         candidateDets.DocumentTypeId = result.proofType
  //         candidateDets.DocumentNumber = "0";
  //         candidateDets.FileName = result.FileName;
  //         candidateDets.ValidFrom = null;
  //         candidateDets.ValidTill = null;
  //         candidateDets.Status = ApprovalStatus.Pending; //  
  //         candidateDets.IsOtherDocument = true;
  //         candidateDets.Modetype = UIMode.Edit;
  //         candidateDets.DocumentCategoryName = "";
  //         candidateDets.StorageDetails = null;
  //         result.CandidateDocument = candidateDets;
  //         result.Modetype = UIMode.Edit;

  //       }

  //       else {

  //         result.CandidateDocument = null;
  //         result.Modetype = this.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
  //         result.isDocumentStatus = null;
  //         result.DocumentStatus = null;
  //       }

  //       result.isDocumentStatus = ApprovalStatus.Pending;
  //       result.DocumentStatus = "Pending";
  //       result.id = result.Id
  //       result.bankFullName = this.BankList.find(a => a.Id == result.bankName).Name;
  //       let isAlreadyExists = false;

  //       if (this.LstBank.length >= 1 && this.LstBank.find(z => z.Id != result.Id)) {

  //         this.alertService.showWarning("You are only allowed to enter one item");

  //       } else {

  //         let isSameResult = false;
  //         isSameResult = _.find(this.LstBank, (a) => a.Id == result.Id) != null ? true : false;

  //         if (isSameResult) {

  //           this.angularGrid_Bank.gridService.updateDataGridItemById(result.Id, result, true, true);

  //         } else {
  //           this.angularGrid_Bank.gridService.addItemToDatagrid(result);
  //         }


  //       }
  //     }
  //     // this.LstBank = (result);


  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }


  addBank(json_edit_object, actionName) {

    this.onboardingService.getOnboardingInfo('isDocumentInfo', this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
      .subscribe(authorized => {

        let apiResult: apiResult = (authorized);
        try {
          this.DocumentList = JSON.parse(apiResult.Result);
          // if (this.Id != 0) {

          if (json_edit_object != undefined && json_edit_object.CandidateDocument != null && json_edit_object.CandidateDocument.Status == 1) {
            this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
            return;
          }

          if (json_edit_object == undefined && this.LstBank.length > 0 && this.LstBank.filter(a => a.DocumentStatus == "Approved" || a.DocumentStatus == "Pending").length > 0) {
            this.alertService.showWarning("You are only allowed to enter one more item");
            return;
          }

          this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data

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
          modalRef.componentInstance.OT = this.candidatesForm.get('onboardingType').value;
          modalRef.componentInstance.candidateDetailsBasic = { CandidateName: this.candidatesForm.get('firstName').value, MobileNumber: this.candidatesForm.get('mobile').value, EmailId: this.candidatesForm.get('email').value };
          modalRef.componentInstance.area = "Candidate";
          modalRef.componentInstance.DocumentList = this.DocumentList;
          var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
          modalRef.componentInstance.objStorageJson = objStorageJson;
          modalRef.result.then((result) => {
            console.log(result);

            if (result != "Modal Closed") {

              /* #region  JSZip */
              if (result.DocumentId) {
                //JSZip
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
                ////jszip
              }
              /* #endregion */

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

              result.bankFullName = result.bankName != null ? this.BankList.find(a => a.Id == result.bankName).Name : '';
              let isAlreadyExists = false;

              if (this.LstBank.length >= 1 && this.LstBank.find(z => z.Id != result.Id)) {

                this.alertService.showWarning("You are only allowed to enter one more item");

              } else {

                let isSameResult = false;
                isSameResult = _.find(this.LstBank, (a) => a.Id == result.Id) != null ? true : false;

                if (isSameResult) {

                  this.angularGrid_Bank.gridService.updateDataGridItemById(result.Id, result, true, true);

                } else {
                  this.angularGrid_Bank.gridService.addItemToDatagrid(result);
                }


              }
              this.isDuplicateBankInfo = false;
            }
            // this.LstBank = (result);


          }).catch((error) => {
            console.log(error);
          });

          // }
          // else {
          //   this.alertService.showWarning("You must record the candidate's basic information and attempt to include bank information.");
          //   return;
          // }
        }
        catch {

        }
      })
  }

  public onSameAddressPresentChanged(value: boolean) {

    this.isSameAddress = value;

    if (this.isSameAddress) {

      this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(this.candidatesForm.get('presentAddressdetails').value) : null;
      this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(this.candidatesForm.get('presentAddressdetails1').value) : null;
      this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(this.candidatesForm.get('presentAddressdetails2').value) : null;
      this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue(this.candidatesForm.get('presentCountryName').value) : null;
      this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(this.candidatesForm.get('presentPincode').value) : null;
      this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === this.candidatesForm.get('presentCountryName').value), ["Name"], ["asc"]);
      this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue(this.candidatesForm.get('presentStateName').value) : null;
      this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(this.candidatesForm.get('presentCity').value) : null;

    } else {


      this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(null) : null;
      this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(null) : null;
      this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(null) : null;
      this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue(null) : null;
      this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue(null) : null;
      this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(null) : null;
      this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(null) : null;

      this.StateList1 = [];
    }
  }

  public onFresher(value: boolean) {

    this.isFresher = value;
    this.isWorkExperienceFlag = value;

  }





  doExperienceSlickGrid() {



    this.columnDefinitions_Experience = [

      { id: 'companyName', name: 'Company Name', field: 'companyName', sortable: true },
      { id: 'title', name: 'Designation', field: 'title', sortable: true },
      { id: 'StartDate', name: 'Start date', field: 'StartDate', sortable: true },
      { id: 'EndDate', name: 'End date', field: 'EndDate', sortable: true },
      { id: 'workLocation', name: 'Work Location', field: 'workLocation' },
      { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },

      {
        id: 'edit',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args);

          this.addExperience(args.dataContext);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          // this.angularGrid_Experience.gridService.highlightRow(args.row, 1500);
          // this.angularGrid_Experience.gridService.setSelectedRow(args.row);
        }
      },
      {
        id: 'delete',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args);
          this.removeSelectedRow(args.dataContext, "Experience").then((result) => {
          });
          this.angularGrid_Experience.gridService.deleteDataGridItemById(args.dataContext.Id);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          this.angularGrid_Experience.gridService.highlightRow(args.row, 1500);
          this.angularGrid_Experience.gridService.setSelectedRow(args.row);
        }
      },

    ];

    this.gridOptions_Experience = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,

      forceFitColumns: true,
      // enableFiltering: true,

      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,

      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };





  }


  // Returns a function to use in pseudos for input types

  doNomineeSlickGrid() {



    this.columnDefinitions = [

      { id: 'nomineeName', name: 'Nominee Name', field: 'nomineeName', sortable: true },
      { id: 'RelationShip', name: 'Relationship', field: 'RelationShip', sortable: true },
      { id: 'DateofBirth', name: 'Date of Birth', field: 'DateofBirth', sortable: true, formatter: Formatters.dateIso },
      // { id: 'IDProof', name: 'ID Proof', field: 'IDProof', sortable: true },

      {
        id: 'edit',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,

        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {

          this.addNominee(args.dataContext);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          // this.angularGrid.gridService.highlightRow(args.row, 1500);
          // this.angularGrid.gridService.setSelectedRow(args.row);
        }
      },
      {
        id: 'delete',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {


          var x = confirm("Are you sure you want to delete?");
          if (x) {
            this.removeSelectedRow(args.dataContext, "Nominee").then((result) => {

            });
            this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.Id);
            return true;
          }
          else
            return false;



        }
      },

    ];

    this.gridOptions = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      // enableHeaderMenu: false,
      // enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      // enableFiltering: true,
      // enableFiltering: true,

      // presets: {

      //   pagination: { pageNumber: 2, pageSize: 20 }
      // },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,

      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };


  }

  removeSelectedRow(args, whicharea) {

    return new Promise((resolve, reject) => {
      const isCheck = this.isGuid(args.Id);
      if (isCheck && args.DocumentId != null) {
        this.doDeleteFile(args.DocumentId, null).then(() => {
          resolve(true);
        });
      }
      else {
        args.Modetype = UIMode.Delete;
        if (args.CandidateDocument != null && args.CandidateDocument.DocumentId != null) {
          args.CandidateDocument.Modetype = UIMode.Delete;
        }

        if (whicharea == "Nominee") {
          this.deletedLstNominee.push(args);
        }
        else if (whicharea == "Experience") {
          this.deletedLstExperience.push(args);
        } else if (whicharea == "Education") {
          this.deletedLstEducation.push(args);
        }
        else if (whicharea == "Bank") {
          this.deletedLstBank.push(args);
        }

        resolve(true);
      }
    });
  }

  doEducationSlickGrid() {

    this.columnDefinitions_Education = [


      { id: 'GraduationType', name: 'Graduation Type', field: 'GraduationType', sortable: true },
      { id: 'educationDegree', name: 'Education Degree', field: 'educationDegree', sortable: true },
      { id: 'yearOfPassing', name: 'Year of Passing', field: 'yearOfPassing', sortable: true },
      { id: 'scoringValue', name: 'Scoring Value', field: 'scoringValue', sortable: true },
      { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },

      {
        id: 'edit',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args);

          this.addEducation(args.dataContext);
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          // this.angularGrid_Education.gridService.highlightRow(args.row, 1500);
          // this.angularGrid_Education.gridService.setSelectedRow(args.row);
        }
      },
      {
        id: 'delete',
        field: 'id',


        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args);



          this.removeSelectedRow(args.dataContext, "Education").then((result) => {


            // this.alertWarning = `Editing: ${args.dataContext.title}`;
            // this.angularGrid.gridService.highlightRow(args.row, 1500);
            // this.angularGrid.gridService.setSelectedRow(args.row);

          });
          this.angularGrid_Education.gridService.deleteDataGridItemById(args.dataContext.Id);

          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          this.angularGrid_Education.gridService.highlightRow(args.row, 1500);
          this.angularGrid_Education.gridService.setSelectedRow(args.row);
        }
      },

    ];

    this.gridOptions_Education = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      // enableFiltering: true,

      enableColumnReorder: false,
      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        // sidePadding: 15
      },
      asyncEditorLoading: false,

      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };




  }



  // doBankSlickGrid() {

  //   this.columnDefinitions_Bank = [

  //     { id: 'bankFullName', name: 'Bank Name', field: 'bankFullName', sortable: true },
  //     { id: 'accountNumber', name: 'Account Number', field: 'accountNumber', sortable: true },

  //     { id: 'bankBranchId', name: 'IFSC Code', field: 'bankBranchId', sortable: true },
  //     { id: 'allocation', name: 'Allocation', field: 'allocation', sortable: true },
  //     { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },
  //     {
  //       id: 'edit',
  //       field: 'id',

  //       excludeFromHeaderMenu: true,
  //       formatter: Formatters.editIcon,
  //       minWidth: 30,
  //       maxWidth: 30,
  //       // use onCellClick OR grid.onClick.subscribe which you can see down below
  //       onCellClick: (e, args: OnEventArgs) => {
  //         console.log(args);

  //         this.addBank(args.dataContext);

  //         // this.alertWarning = `Editing: ${args.dataContext.title}`;
  //         this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
  //         this.angularGrid_Bank.gridService.setSelectedRow(args.row);
  //       }
  //     },
  //     {
  //       id: 'delete',
  //       field: 'id',
  //       excludeFromHeaderMenu: true,
  //       formatter: Formatters.deleteIcon,
  //       minWidth: 30,
  //       maxWidth: 30,
  //       // use onCellClick OR grid.onClick.subscribe which you can see down below
  //       onCellClick: (e, args: OnEventArgs) => {
  //         console.log(args);
  //         this.removeSelectedRow(args.dataContext, "Bank").then((result) => {
  //         });
  //         this.angularGrid_Bank.gridService.deleteDataGridItemById(args.dataContext.Id);

  //         // this.alertWarning = `Editing: ${args.dataContext.title}`;
  //         this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
  //         this.angularGrid_Bank.gridService.setSelectedRow(args.row);
  //       }
  //     },

  //   ];

  //   this.gridOptions_Bank = {
  //     enableAutoResize: true,       // true by default
  //     enableCellNavigation: true,
  //     datasetIdPropertyName: "Id",
  //     editable: true,
  //     forceFitColumns: true,
  //     // enableFiltering: true,

  //     presets: {

  //       pagination: { pageNumber: 2, pageSize: 20 }
  //     },
  //     enableCheckboxSelector: false,
  //     enableRowSelection: false,
  //     checkboxSelector: {
  //       // remove the unnecessary "Select All" checkbox in header when in single selection mode
  //       hideSelectAllCheckbox: true,

  //       // you can override the logic for showing (or not) the expand icon
  //       // for example, display the expand icon only on every 2nd row
  //       // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
  //     },
  //     rowSelectionOptions: {
  //       // True (Single Selection), False (Multiple Selections)
  //       selectActiveRow: false
  //     },
  //     autoCommitEdit: false,
  //     autoResize: {
  //       containerId: 'demo-container',
  //       sidePadding: 15
  //     },
  //     asyncEditorLoading: false,

  //     enableColumnPicker: false,
  //     enableExcelCopyBuffer: true,
  //     // enableFiltering: true,
  //   };




  // }

  

  doBankSlickGrid() {

    let previewFormatter: Formatter
    previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
      class="mdi mdi-eye m-r-xs"></i> View </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';


    this.columnDefinitions_Bank = [

      { id: 'bankFullName', name: 'Bank Name', field: 'bankFullName', sortable: true },
      { id: 'accountNumber', name: 'Account Number', field: 'accountNumber', sortable: true },
      { id: 'bankBranchId', name: 'IFSC Code', field: 'bankBranchId', sortable: true },
      { id: 'allocation', name: 'Allocation', field: 'allocation', sortable: true },
      { id: 'DocumentStatus', name: 'Status', field: 'DocumentStatus', sortable: true, cssClass: `` },
      {
        id: 'preview',
        field: 'id',
        name: 'Preview',
        excludeFromHeaderMenu: true,
        formatter: previewFormatter,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {

          if (args.dataContext.CandidateDocument == null) {
            this.alertService.showInfo('Note: Preview of document not available.');
            return;
          }

          var fileNameSplitsArray = args.dataContext.CandidateDocument.FileName.split('.');
          var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
          if (ext.toUpperCase().toString() == "ZIP") {
            this.GetBankZipFile(args.dataContext.CandidateDocument)
          }else{
            this.document_file_view(args.dataContext.CandidateDocument, 'Bank');

          }
        }
      },
      {
        id: 'edit',
        field: 'id',

        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {
          console.log(args);
          if (args.dataContext.DocumentStatus != "Approved") {
            this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));
          }
          else if (this.isDuplicateBankInfo) {
            this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));

          } else {

            this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));
           // this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
           // return;
          }
          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          // this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
          // this.angularGrid_Bank.gridService.setSelectedRow(args.row);
        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e, args: OnEventArgs) => {

          this.removeSelectedRow(args.dataContext, "Bank").then((result) => {
          });
          this.angularGrid_Bank.gridService.deleteDataGridItemById(args.dataContext.Id);

          // this.alertWarning = `Editing: ${args.dataContext.title}`;
          this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
          this.angularGrid_Bank.gridService.setSelectedRow(args.row);

          // if (args.dataContext.DocumentStatus != "Approved") {
          //   this.removeSelectedRow(args.dataContext, "Bank").then((result) => {
          //   });
          //   this.angularGrid_Bank.gridService.deleteDataGridItemById(args.dataContext.Id);

          //   // this.alertWarning = `Editing: ${args.dataContext.title}`;
          //   this.angularGrid_Bank.gridService.highlightRow(args.row, 1500);
          //   this.angularGrid_Bank.gridService.setSelectedRow(args.row);

          // } else {
          //   this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
          //   return;
          // }

        }
      },

    ];

    this.gridOptions_Bank = {
      enableAutoResize: true,       // true by default
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      // enableFiltering: true,

      presets: {

        pagination: { pageNumber: 2, pageSize: 20 }
      },
      enableCheckboxSelector: false,
      enableRowSelection: false,
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true,

        // you can override the logic for showing (or not) the expand icon
        // for example, display the expand icon only on every 2nd row
        // selectableOverride: (row: number, dataContext: any, grid: any) => (dataContext.id % 2 === 1)
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      autoCommitEdit: false,
      autoResize: {
        containerId: 'demo-container',
        sidePadding: 15
      },
      asyncEditorLoading: false,

      enableColumnPicker: false,
      enableExcelCopyBuffer: true,
      // enableFiltering: true,
    };




  }


  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }


  angularGridReady_Experience(angularGrid: AngularGridInstance) {
    this.angularGrid_Experience = angularGrid;
    this.gridObj_Experience = angularGrid && angularGrid.slickGrid || {};
  }

  angularGridReady_Education(angularGrid: AngularGridInstance) {
    this.angularGrid_Education = angularGrid;
    this.gridObj_Education = angularGrid && angularGrid.slickGrid || {};
  }


  angularGridReady_Bank(angularGrid: AngularGridInstance) {
    this.angularGrid_Bank = angularGrid;
    this.gridOptions_Bank = angularGrid && angularGrid.slickGrid || {};
  }


  // API calls 





  onDocumentClick() {

    this.EntityId = this.CandidateId;
    this.CompanyId = this.CompanyId;
    this.ClientId = this.ClientId;
    this.ClientContractId = this.ClientContractId;

    this.onboardingService.getDocumentList(this.EntityId, this.CompanyId, this.ClientId, this.ClientContractId)
      .subscribe(authorized => {

        let apiResult: apiResult = (authorized);
        try {
          this.DocumentList = JSON.parse(apiResult.Result);

          console.log('docuemt', this.DocumentList);

          this.DocumentList.forEach(element => {

            element['DocumentId'] = null;
            element['CategoryType'] = null;
            element['FileName'] = null;
            // element['Id'] = 0;
            element['DeletedIds'] = null;

          });

          this.documentTbl = [];
          this.DocumentList.forEach(element => {

            this.documentTbl.push(element);

          });


          console.log('docum', this.DocumentCategoryist);

          console.log('edit', this.edit_document_lst);


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


          if (this.Id != 0) {

            this.documentTbl.forEach(element_new => {


              this.edit_document_lst.forEach(ele_edit => {


                if (element_new.DocumentTypeId == ele_edit.DocumentTypeId) {
                  let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == ele_edit.DocumentTypeId)).ApplicableCategories;


                  // tem_c.forEach(element => {
                  //   element['isChecked'] = 0;

                  // });
                  (Object.keys(element_new).forEach(key => {

                    let i = tem_c.find(a => a.Name == key);
                    if (i != undefined) {
                      i['isChecked'] = element_new[key] == 1 ? true : false;
                    }

                    //   (Object.values(element_new[i.Name]).forEach(value => {

                    //   console.log('k',value);
                    // }));
                  }));

                  element_new.DocumentId = ele_edit.DocumentId
                  element_new.DocumentNumber = ele_edit.DocumentNumber
                  element_new.CandidateId = ele_edit.CandidateId
                  element_new.FileName = ele_edit.FileName
                  element_new.ValidFrom = (this.datePipe.transform(ele_edit.ValidFrom, "yyyy-MM-dd"))
                  element_new.ValidTill = (this.datePipe.transform(ele_edit.ValidTill, "yyyy-MM-dd"))
                  // element_new.Id = ele_edit.Id
                  element_new.Status = ele_edit.Status
                  element_new.CategoryType = tem_c;// element_new[tem_c.find(d=>d.Name)]
                  console.log('edit after', this.documentTbl);

                }

              });


            });


          }





          // this.DocumentList.forEach(element => {

          //   this.documentTbl.push({

          //     CandidateId: this.CandidateId,
          //     DocumentId: 0,
          //     DocumentTypeId: element.DocumentTypeId,
          //     DocumentNumber: 0,
          //     FileName: "",
          //     isValidFrom: element.IsDateValidationRequired == "True" ? element.IsDateValidationRequired : null,
          //     isValidTill: element.IsDateValidationRequired == "True" ? element.IsDateValidationRequired : null,
          //     ValidFrom: null,
          //     ValidTill: null,
          //     DocumentName: element.DocumentName,
          //     IsAddress: element.IsAddress == -1 ? null : element.IsAddress == 0 ? false : element.IsAddress,
          //     IsIdentity: element.IsIdentity == -1 ? null : element.IsIdentity == 0 ? false : element.IsIdentity,
          //     IsMandatory: element.IsMandatory == "True" ? true : false,
          //     IsVerificationRequired: element.IsVerificationRequired,
          //     FileUrl: null,
          //     Id: 0,
          //     Modetype: UIMode.Edit

          //   });

          //   this.duplicateDocumentTbl.push({

          //     CandidateId: this.CandidateId,
          //     DocumentId: 0,
          //     DocumentTypeId: element.DocumentTypeId,
          //     DocumentNumber: 0,
          //     FileName: "",
          //     isValidFrom: element.IsDateValidationRequired == "True" ? element.IsDateValidationRequired : null,
          //     isValidTill: element.IsDateValidationRequired == "True" ? element.IsDateValidationRequired : null,
          //     ValidFrom: null,
          //     ValidTill: null,
          //     DocumentName: element.DocumentName,
          //     IsAddress: element.IsAddress == -1 ? null : element.IsAddress == 0 ? false : element.IsAddress,
          //     IsIdentity: element.IsIdentity == -1 ? null : element.IsIdentity == 0 ? false : element.IsIdentity,
          //     IsMandatory: element.IsMandatory == "True" ? true : false,
          //     IsVerificationRequired: element.IsVerificationRequired,
          //     FileUrl: null,
          //     Id: 0,
          //     Modetype: UIMode.Edit

          //   });


          // });

          // if (this.Id != 0) {

          //   this.documentTbl.forEach(element_new => {

          //     this.edit_document_lst.forEach(ele_edit => {

          //       if (element_new.DocumentTypeId == ele_edit.DocumentTypeId) {

          //         element_new.DocumentId = ele_edit.DocumentId
          //         element_new.DocumentNumber = ele_edit.DocumentNumber
          //         element_new.CandidateId = ele_edit.CandidateId
          //         element_new.FileName = ele_edit.FileName
          //         element_new.ValidFrom = (this.datePipe.transform(ele_edit.ValidFrom, "yyyy-MM-dd"))
          //         element_new.ValidTill = (this.datePipe.transform(ele_edit.ValidTill, "yyyy-MM-dd"))
          //         element_new.Id = ele_edit.Id
          //         element_new.Status = ele_edit.Status

          //       }

          //     });


          //   });


          //   this.duplicateDocumentTbl.forEach(element_new => {

          //     this.edit_document_lst.forEach(ele_edit => {

          //       if (element_new.DocumentTypeId == ele_edit.DocumentTypeId) {

          //         element_new.DocumentId = ele_edit.DocumentId
          //         element_new.DocumentNumber = ele_edit.DocumentNumber
          //         element_new.CandidateId = ele_edit.CandidateId
          //         element_new.FileName = ele_edit.FileName
          //         element_new.ValidFrom = (this.datePipe.transform(ele_edit.ValidFrom, "yyyy-MM-dd"))
          //         element_new.ValidTill = (this.datePipe.transform(ele_edit.ValidTill, "yyyy-MM-dd"))
          //         element_new.Id = ele_edit.Id
          //         element_new.Status = ele_edit.Status
          //       }

          //     });

          //   });

          // }
          this.should_spin_onboarding = false;
        } catch (error) {
          this.should_spin_onboarding = false;
        }



      }), ((err) => {

      });




  }

  getCategoryValues(docTypeId,) {

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
  //NEW Change
  getFileList(item, whicharea) {

    console.log('item', item);

    let DocId = whicharea == 'ClientApproval' ? item.ObjectStorageId : item.DocumentId;
    this.docList = [];
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
              this.docList.push(contents.files[filename]);
            }
          });
        });
      })


  }


  document_file_edit(item) {

    this.document_file_upload(item);

  }

  document_file_delete(item) {

    this.alertService.confirmSwal("Are you sure you want to delete this document?", "Do you really want to delete these document?  After you delete this item you will not able to get this!", "Yes, Delete").then(result => {

      console.log('item', item);
      try {
        item.CategoryType.forEach(element_doc => {



          var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id);
          console.log('lst', this.lstDocumentDetails);

          console.log('doc', doc);

          if (doc != undefined && doc.Id != 0) {

            doc.Modetype = UIMode.Delete;
          }
          else {
            const index = this.lstDocumentDetails.indexOf(doc);
            this.lstDocumentDetails.splice(index, 1);
          }
        });

        let OldDocumentDetails = this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
        if (OldDocumentDetails != null) {

          let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == item.DocumentId) != null ? true : false;
          if (alreadyExists == false) {
            this.deleted_DocumentIds_List.push({ Id: item.DocumentId });
            console.log(this.deleted_DocumentIds_List);
          }
        }

        var table_doc = this.documentTbl.find(a => a.CandidateDocumentId == item.CandidateDocumentId && a.DocumentTypeId == item.DocumentTypeId);

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

      } catch (error) {

        console.log('exceptions ', error);

      }

    }).catch(error => {

    });
    console.log('last lst', this.lstDocumentDetails);



  }



  document_file_upload(item) {

    console.log('ss', item)
    if (item.DocumentName == 'Non PAN holder') {
      let OldDocumentDetails = this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
      const modalRef = this.modalService.open(NoPanDeclarationModelComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.jsonObj = item;
      modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;

      var objStorageJson = JSON.stringify({  CandidateName : this.candidatesForm.get('firstName').value , IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {

        console.log('item', item);

        console.log(result);
        if (result != "Modal Closed") {
          item.Status = result.Status;
          item.DocumentNumber = result.DocumentNumber;
          item.CategoryType = result.CategoryType;
          item.FileName = result.FileName;
          item.DocumentId = result.DocumentId;
          item.ValidTill = result.ValidTill;
          item.ValidFrom = result.ValidFrom;
          // item.Id = result.Id;
          result.CategoryType.forEach(element_doc => {

            var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete);
            console.log('doc insert', doc);

            if (doc == null && element_doc.isChecked == true) {

              this.add_edit_document_details(result, element_doc, item, true)
            }
            if (doc != null && element_doc.isChecked == true) {

              // doc.Id = result.Id;
              doc.DocumentId = result.DocumentId;
              doc.DocumentNumber = result.DocumentNumber;
              doc.FileName = result.FileName;
              doc.ValidTill = result.ValidTill;
              doc.ValidFrom = result.ValidFrom;
              doc.Modetype = UIMode.Edit;
              doc.Status = doc.Status != ApprovalStatus.Approved ? ApprovalStatus.Pending : doc.Status;

            }
            if (doc != null && element_doc.isChecked == false) {

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

          console.log('list of item', this.lstDocumentDetails);

        }
      }).catch((error) => {console.log(error);});
    } else {
      let OldDocumentDetails = this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
      const modalRef = this.modalService.open(DocumentsModalComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.jsonObj = item;
      modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;

      var objStorageJson = JSON.stringify({  CandidateName : this.candidatesForm.get('firstName').value , IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {

        console.log('item', item);

        console.log(result);
        if (result != "Modal Closed") {
          item.Status = result.Status;
          item.DocumentNumber = result.DocumentNumber;
          item.CategoryType = result.CategoryType;
          item.FileName = result.FileName;
          item.DocumentId = result.DocumentId;
          item.ValidTill = result.ValidTill;
          item.ValidFrom = result.ValidFrom;
          // item.Id = result.Id;



          // result.DeletedIds.forEach(deleted_item => {

          //   this.deleted_DocumentIds_List.push({ Id: deleted_item.Id });
          //   console.log(this.deleted_DocumentIds_List);


          // });



          result.CategoryType.forEach(element_doc => {


            var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete);
            console.log('doc insert', doc);

            if (doc == null && element_doc.isChecked == true) {

              this.add_edit_document_details(result, element_doc, item, true)
            }
            if (doc != null && element_doc.isChecked == true) {

              // doc.Id = result.Id;
              doc.DocumentId = result.DocumentId;
              doc.DocumentNumber = result.DocumentNumber;
              doc.FileName = result.FileName;
              doc.ValidTill = result.ValidTill;
              doc.ValidFrom = result.ValidFrom;
              doc.Modetype = UIMode.Edit;
              doc.Status = doc.Status != ApprovalStatus.Approved ? ApprovalStatus.Pending : doc.Status;

            }
            if (doc != null && element_doc.isChecked == false) {

              let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == result.DocumentId) != null ? true : false;
              if (alreadyExists) {
                doc.Modetype = UIMode.Delete;
              }
              else {
                const index = this.lstDocumentDetails.indexOf(doc);
                this.lstDocumentDetails.splice(index, 1);
              }

            }

            // console.log('ele', element_doc);
            // if (element_doc.isChecked == true) {

            //   alert('sdfsda')
            //   let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentCategoryId == element_doc.Id)
            //   if (isexists != null) {

            //     alert('vvvv')
            //     isexists.Id = result.Id;
            //     isexists.DocumentId = result.DocumentId;
            //     isexists.DocumentNumber = result.DocumentNumber;
            //     isexists.FileName = result.FileName;
            //     isexists.ValidTill = result.ValidTill;
            //     isexists.ValidFrom = result.ValidFrom;
            //     isexists.Modetype = UIMode.Edit;

            //   } else {
            //     this.add_edit_document_details(result, element_doc, item, true)
            //   }
            // }
            // else {
            //     'edit')
            //   if (this.isGuid(result.Id)) {

            //   }
            //   let isexist_doc = this.lstDocumentDetails.find(a => a.Id == result.Id)
            //   if (isexist_doc != null) {

            //     this.add_edit_document_details(result, element_doc, item, false)

            //   }

            // }
          });

          console.log('list of item', this.lstDocumentDetails);


        }
      }).catch((error) => {
        console.log(error);
      });
    }

  }
  // Candidate information details ** region begin **

  add_edit_document_details(result, element_doc, item, area: any) {

    if (area) {

      let ListDocumentList: CandidateDocuments = new CandidateDocuments();
      ListDocumentList.Id = 0;
      ListDocumentList.CandidateId = this.Id != 0 ? this.CandidateId : 0;
      ListDocumentList.IsSelfDocument = true;
      ListDocumentList.DocumentId = result.DocumentId;
      ListDocumentList.DocumentCategoryId = element_doc.Id;
      ListDocumentList.DocumentTypeId = item.DocumentTypeId;
      ListDocumentList.DocumentNumber = result.DocumentNumber;
      ListDocumentList.FileName = result.FileName;
      ListDocumentList.ValidFrom = result.ValidFrom;
      ListDocumentList.ValidTill = result.ValidTill;
      ListDocumentList.Status = ApprovalStatus.Pending;
      ListDocumentList.IsOtherDocument = false;
      ListDocumentList.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
      ListDocumentList.DocumentCategoryName = "";
      ListDocumentList.StorageDetails = null;
      this.addCandidateDocumentList(ListDocumentList);
      console.log('list of item w', this.lstDocumentDetails);

    }
    else {
      console.log(item);
      console.log(element_doc.Id);

      if (this.isGuid(result.Id) && !area) {

        let already_exists = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId) != null ? true : false;
        if (already_exists == false) {
        } else {

          let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)

          console.log('sis', isexists);

          if (isexists != null) {

            // alert('xxx')
            // isexists.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
            // isexists.DocumentId = result.DocumentId;
            const index = this.lstDocumentDetails.indexOf(isexists);
            this.lstDocumentDetails.splice(index, 1);
          }



        }

      }
      else {

        let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)

        if (isexists != null) {


          isexists.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
          isexists.DocumentId = result.DocumentId;

        }
      }

    }

  }


  //  Offer Information details ** region start ** 

  onChangeStateByCountryId(country) {

    this.candidatesForm.controls['presentStateName'].setValue(null);
    this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }
  onChangeStateByCountryId1(country) {
    this.candidatesForm.controls['permanentStateName'].setValue(null);
    this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === country.Id), ["Name"], ["asc"]);

  }
  //  Offer Information details ** region end ** 


  onSelectFile(fileInput) {
    if (fileInput.target.files && fileInput.target.files[0]) {
      var reader = new FileReader();

      reader.readAsDataURL(fileInput.target.files[0]);

      reader.onload = (event: any) => {
        let file = fileInput.target.files[0];
        this.fileName = file.name;
        // this.url = fileInput.target.result;
        // console.log(this.url);

      }
    }
  }
  public async addCandidateDocumentList(listDocs) {
    await this.lstDocumentDetails.push(listDocs);
  }
  /* #region  Migrtion Info accordion */


  // getMigrationMasterInfo(ClientContractId) {

  //   this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {



  //     let apiResult: apiResult = (result);
  //     console.log(apiResult);

  //     if (apiResult.Status && apiResult.Result != null) {
  //       this.MigrationInfoGrp = JSON.parse(apiResult.Result);
  //       this.TeamList = this.MigrationInfoGrp;

  //       if (this.Id != 0 && this.candidatesForm.get('TeamId').value != null) {
  //         let temp_TeamList = this.TeamList.find(a => a.Id == this.candidatesForm.get('TeamId').value).PayCycleDetails;
  //         let item = { Id: this.candidatesForm.get('TeamId').value, PayCycleDetails: temp_TeamList.PayCycleDetails };
  //         this.onChangeTeam(item, 'other');
  //         this.doletterTemplate();
  //       }


  //     } else {

  //     }

  //   }), ((error) => {

  //   })
  // }

  // getMigrationMasterInfo(ClientContractId) {

  //   this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {


  //     this.NoticePeriodDaysList = [];
  //     this.InsuranceList = [];
  //     let apiResult: apiResult = (result);
  //     console.log(apiResult);

  //     if (apiResult.Status && apiResult.Result != null) {
  //       this.MigrationInfoGrp = JSON.parse(apiResult.Result);

  //       this.TeamList = this.MigrationInfoGrp;
  //       var iii = this.MigrationInfoGrp.PaygroupProductOverridesList;
  //       console.log('MigrationInfoGrp', this.MigrationInfoGrp);
  //       this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
  //       this.NoticePeriodDaysList.forEach(element => {
  //         element.Description = Number(element.Description);
  //       });

  //       this.InsuranceList = _.filter(this.MigrationInfoGrp[0].InsuranceList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableInsurancePlans, v.Id))
  //       this.BusinessType != 3 ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList : true;

  //       this.InsuranceList.forEach(element => {
  //         element.Description = Number(element.Description);
  //       });
  //       console.log('this.NoticePeriodDaysList', this.NoticePeriodDaysList) // assign it to some variable

  //       if (this.Id != 0 && this.candidatesForm.get('TeamId').value != null) {
  //         let temp_TeamList = this.TeamList.find(a => a.Id == this.candidatesForm.get('TeamId').value).PayCycleDetails;
  //         let item = { Id: this.candidatesForm.get('TeamId').value, PayCycleDetails: temp_TeamList.PayCycleDetails };
  //         this.onChangeTeam(item, 'other');
  //         this.doletterTemplate();
  //       }


  //     } else {

  //     }

  //   }), ((error) => {

  //   })
  // }

  getMigrationMasterInfo(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {


      let apiResult: apiResult = (result);

      if (apiResult.Status && apiResult.Result != null) {
        this.MigrationInfoGrp = JSON.parse(apiResult.Result);

        this.TeamList = this.MigrationInfoGrp;
        var iii = this.MigrationInfoGrp.PaygroupProductOverridesList;
        console.log('MigrationInfoGrp', this.MigrationInfoGrp);
        // const filterdNoticePeriodDays = this.MigrationInfoGrp.NoticePeriodDaysList != null ?? this.MigrationInfoGrp.NoticePeriodDaysList.length > 0 ??
        // this.MigrationInfoGrp.ClientContractOperationList != null ??  this.MigrationInfoGrp.ClientContractOperationList.length > 0 ??
        // this.MigrationInfoGrp.ClientContractOperationList[0].ApplicableNoticePeriodDays.length > 0 ??
        //   var noticedays = this.MigrationInfoGrp[0].NoticePeriodDaysList;
        //   var cco = this.MigrationInfoGrp[0].ClientContractOperationList[0];

        //   console.log('nnn',  noticedays);
        //   console.log('cco',  cco);

        //   var filtered_ids = _.filter(noticedays.NoticePeriodDaysList, function(p){
        //     return _.includes(cco.ApplicableNoticePeriodDays, p.Id);
        // });
        // console.log('filtered_ids',filtered_ids);
        this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
        this.NoticePeriodDaysList.forEach(element => {
          element.Description = Number(element.Description);
        });
        this.InsuranceList = this.MigrationInfoGrp[0].InsuranceList;
        this.BusinessType != 3 ? this.ManagerList = this.MigrationInfoGrp[0].ReportingManagerList : true;
        // this.InsuranceList = _.filter(this.MigrationInfoGrp[0].InsuranceList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableInsurancePlans, v.Id))
        this.InsuranceList.forEach(element => {
          element.Description = Number(element.Description);
        });

        console.log('InsuranceList', this.InsuranceList);

        console.log('this.NoticePeriodDaysList', this.NoticePeriodDaysList) // assign it to some variable

        if (this.Id != 0 && this.candidatesForm.get('TeamId').value != null) {
          let temp_TeamList = this.TeamList.find(a => a.Id == this.candidatesForm.get('TeamId').value).PayCycleDetails;
          let item = { Id: this.candidatesForm.get('TeamId').value, PayCycleDetails: temp_TeamList.PayCycleDetails };
          this.onChangeTeam(item, 'other');
          this.doletterTemplate();
        }


      } else {

      }

    }), ((error) => {

    })
  }

  onChangeNoticePeriod(event) {
    console.log('Notice Period :', event);
  }
  onChangeInsurancePlan(item) {
    console.log('item', item);

    this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidatesForm.controls['onCostInsuranceAmount'].setValue(item.InsuranceAmount) : null;
    this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidatesForm.controls['fixedDeductionAmount'].setValue(item.InsuranceDeductionAmount) : null;
    this.candidatesForm.controls['Gmc'] != null ? this.candidatesForm.controls['Gmc'].setValue(item.GMC) : null;
    this.candidatesForm.controls['Gpa'] != null ? this.candidatesForm.controls['Gpa'].setValue(item.GPA) : null;
    item != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('onCostInsuranceAmount').value), 'onCostInsuranceAmount') : null;

  }

  

  // onChangeTeam(item, from_action) {

  //   this.PayCycleDetails = item.PayCycleDetails;
  //   if (from_action == "DOM") {

  //     this.candidatesForm.controls['ManagerId'].setValue(null);
  //     this.candidatesForm.controls['CostCodeId'].setValue(null);
  //     this.candidatesForm.controls['LeaveGroupId'].setValue(null);
  //   }

  //   this.BusinessType == 3 ? this.ManagerList = [] : true;;
  //   // this.ManagerList = []
  //   this.LeaveGroupList = [];
  //   this.CostCodeList = [];
  //   this.EffectivePayPeriodList = [];

  //   console.log(item);

  //   let filterList = this.TeamList.find(a => a.Id == item.Id);
  //   this.BusinessType == 3 ? this.ManagerList = filterList.ManagerList : true;
  //   // this.BusinessType != 3 ? this.ManagerList = (filterList.ReportingManagerList != null && filterList.ReportingManagerList.length > 0) ? filterList.ReportingManagerList.filter(a => a.EC[0].TeamId == item.Id) : [] : true;

  //   // this.ManagerList = filterList.ManagerList
  //   this.LeaveGroupList = filterList.LeaveGroupList;
  //   this.CostCodeList = filterList.CostCodeList;
  //   this.EffectivePayPeriodList = filterList.PayPeriodList;

  // }


  
  onChangeTeam(item, from_action) {

    this.PayCycleDetails = item.PayCycleDetails;
    if (from_action == "DOM") {
      // if(this.BusinessType != 3){
      //   //item.ReportingManagerList.find(a.managerId==)
      // }

      this.BusinessType == 3 && this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(null) : true;
      this.candidatesForm.controls['CostCodeId'].setValue(null);
      this.candidatesForm.controls['LeaveGroupId'].setValue(null);
      this.candidatesForm.controls['EffectivePayPeriod'].setValue(null);

    }

    this.BusinessType == 3 ? this.ManagerList = [] : true;;
    // this.ManagerList = []
    this.LeaveGroupList = [];
    this.CostCodeList = [];
    this.EffectivePayPeriodList = [];
    console.log(item);

    let filterList = this.TeamList.find(a => a.Id == item.Id);
    this.BusinessType == 3 ? this.ManagerList = filterList.ManagerList : true;

    this.IsReporingManagerRequired = false; ///  If the selected client wants to or candidate wants to do the attendance or leave, you must be referred to this flag.
    if(filterList.IsReportingManagerRequired)
    {
      this.IsReporingManagerRequired = true;
      
    }

    if (from_action == "DOM" && item != null && item.defaultManagerId > 0) {
      this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(item.defaultManagerId) : null
    } else if (from_action == "DOM" && item != null && item.defaultManagerId == 0 || item.defaultManagerId == null) {
      this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(null) : null;
    }



    // this.managerId =  this.ManagerList.find(a=>item.defaultManagerId==a.ManagerId)
    // if(this.managerId!=undefined &&this.managerId!=null){
    //   this.candidatesForm.controls['ManagerId'].setValue(this.managerId.managerId)
    // }

    // !=undeinf && .find(a.-d).id
    // this.BusinessType != 3 ? this.ManagerList = (filterList.ReportingManagerList != null && filterList.ReportingManagerList.length > 0) ? filterList.ReportingManagerList.filter(a => a.EC[0].TeamId == item.Id) : [] : true;

    // this.ManagerList = filterList.ManagerList
    this.LeaveGroupList = filterList.LeaveGroupList;
    this.CostCodeList = filterList.CostCodeList;
    this.EffectivePayPeriodList = filterList.PayPeriodList;

  }

  /* #endregion */

  public findInvalidControls() {
    this.invaid_fields = [];
    const invalid = [];
    const controls = this.candidatesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        this.invaid_fields.push(name)
      }
    }
    // console.log(' this.DynamicFieldDetails.ControlElemetsList', this.DynamicFieldDetails.ControlElemetsList);

    // !this.isEmptyObject(this.DynamicFieldDetails) && this.DynamicFieldDetails.ControlElemetsList.length > 0 && this.DynamicFieldDetails.ControlElemetsList.forEach(a => {
    //   console.log(' a.Value', a.Value);

    //   if (a.Validators != null && a.Validators[0].Name == 'required' && a.Value == null) {
    //     this.invaid_fields.push(a.Label)
    //   }
    //   else {
    //     while (this.invaid_fields.indexOf(a.Label) !== -1) {
    //       delete this.invaid_fields[this.invaid_fields.indexOf(a.Label)];
    //     }
    //   }
    // });

    console.log('invalid', invalid);



    return this.invaid_fields;
  }

  doSaveOrSubmit(index: any): void {

    if (index == "Submit" && this.BusinessType == 3 && this.GroupControlName == "Detailed" && (this.candidatesForm.get('haveApplied').value == false && this.candidatesForm.get('isPANNoExists').value ==  false)) {
      const objIndex = this.documentTbl.findIndex((obj =>  obj.DocumentName == 'Non PAN holder'));
      if (objIndex > -1 && (this.documentTbl[objIndex].FileName == null || this.documentTbl[objIndex].FileName == '')) {
        this.documentTbl[objIndex].IsMandatory = "True";
        this.alertService.showWarning("Please upload  \'NO PAN DECLARATION\'  from document details !");
        return;
      } else {
        if (objIndex > -1) {
          this.documentTbl[objIndex].IsMandatory = this.documentTbl[objIndex].IsMandatory !== 'True' ? this.documentTbl[objIndex].IsMandatory : 'False';
        }
        console.log('non-pan', this.documentTbl, objIndex);
      }
     
    }

    if (this.candidatesForm.get('requestFor').value.toString() === "AL") {
      this.candidatesForm.controls['employmentType'] != null ? this.updateValidation(true, this.candidatesForm.get('employmentType')) : true;
    }
    // ! : Observations made while mentioning the client approval group was AL (candidate joining),The expected DOJ was getting cleared 
    if (this.candidatesForm.get('requestFor').value.toString() === "OL") {
      if (this.DateOfJoining == null && this.candidatesForm.get('expectedDOJ').value != null && this.candidatesForm.get('expectedDOJ').value != undefined && this.candidatesForm.get('expectedDOJ').value != '') {
        this.DateOfJoining = new Date(this.candidatesForm.get('expectedDOJ').value);
      }
      this.updateValidation(false, this.candidatesForm.get('employmentType'));
    }

    // this.ChildComponent.validateChildForm(true);

    if (this.isDocumentInfo && index == "Submit" && !this.utitlityService.isNullOrUndefined(this.candidatesForm.get('isDifferentlyabled').value) && this.candidatesForm.get('isDifferentlyabled').value == true) {
      if (this.candidatesForm.get('differentlyabledPercentage').value < 0 || this.candidatesForm.get('differentlyabledPercentage').value > 100) {
        this.alertService.showWarning("Spend some time to making your differently abled percentage.");
        return;
      }
      else if (this.candidatesForm.get('differentlyabledPercentage').value >= environment.environment.AmountOfDifferentlyabled && this.DocumentList != null && this.DocumentList.length > 0 && !this.utitlityService.isNullOrUndefined(this.DocumentList.find(a => a.IsDisablityProof == 0)) && this.DocumentList.find(a => a.IsDisablityProof == 0).DocumentId == null) {
        this.alertService.showWarning("You are required to upload a document for people with other abilities.");
        return;
      }
    }

    if (index == "Submit") {
      this.submitted = true;
      // check for tenureType and if null, set default value as 'open'
      if (this.candidatesForm.controls['tenureType'] == null || this.candidatesForm.controls['tenureType'].value  == null ) {
        this.candidatesForm.controls['tenureType'].setValue(this.tenureType.find((o) => o.name.toUpperCase() === 'OPEN')['id']);
      }
      if (this.BusinessType != 3 && this.candidatesForm.controls.requestFor.value === 'AL') {
        this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
        this.candidatesForm.controls['CostCodeId'].setValue(this.CostCodeList.length == 0 ? null : this.CostCodeList[0].Id);
      }

      this.findInvalidControls();
      if (this.candidatesForm.invalid) {
        this.alertService.showWarning("Oops! Please fill in all required fields ")
        return;

      }
      if (this.invaid_fields.length > 0) {
        this.alertService.showWarning("Oops! Please fill in all required fields ")
        return;
      }
      
    }


    // 1. client name, client Contract, cleint location ,name, these - only save click ;
    if (index == "onlySave") {
      console.log('ss', this.candidatesForm.controls['clientName'])
      if ((this.candidatesForm.controls['clientName'].value == null) ||
        (this.candidatesForm.controls['clientContract'].value == null) ||
        (this.candidatesForm.controls['email'].value == "") ||
        (this.candidatesForm.controls['mobile'].value == "") ||
        (this.candidatesForm.controls['firstName'].value == "")
      ) {
        if (this.BusinessType == 3) {
          this.alertService.showWarning("Some information was missing. There were problems with the following fields : Client, Client Contract, Candidate Name, Email and Mobile number")
          return;
        } else {
          this.alertService.showWarning("Some information was missing. There were problems with the following fields : Candidate Name, Email and Mobile number")
          return;
        }
      }
      if ((this.candidatesForm.controls['mobile'].value).length != 10) {
        this.alertService.showWarning("Mobile Number should be minimum 10 characters")
        return;
      }

      if (this.candidatesForm.get('mobile').value != null && this.candidatesForm.get('emergencyContactnumber').value != null
      && this.candidatesForm.get('mobile').value != '' && this.candidatesForm.get('emergencyContactnumber').value != ''
      && this.candidatesForm.get('mobile').value != undefined && this.candidatesForm.get('emergencyContactnumber').value != undefined
      && this.candidatesForm.get('emergencyContactnumber').value == this.candidatesForm.get('mobile').value) {
      this.alertService.showWarning('The alternate mobile number should not be the same as the mobile number.')
      return;
    }

    }

    if (index == "Submit" && this.isOfferInfo && this.previewCTC && this._NewCandidateDetails.LstCandidateOfferDetails == undefined && this.candidatesForm.get('sourceType').value == 2) {
      this.alertService.showWarning("Oops! You must preview candidate CTC before submitting")
      return;
    }

    if ((this.candidatesForm.get('permanentCountryName').value == 100) && (this.candidatesForm.get('permanentStateName').value == 4)) {
      this.isAssamState = true;
    } else {
      this.isAssamState = false;

    }

    // if (this.isOfferInfo && this.previewLetter && !this.isRateSetValid) {
    //   if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
    //     this.alertService.showWarning("Oops! You must preview candidate CTC before submitting")
    //     return;
    //   }

    // }
    // if (this.isOfferInfo && this.previewLetter && this.isRateSetValid) {
    //   if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
    //     this.alertService.showWarning("Oops! You must preview candidate CTC before submitting")
    //     return;
    //   }

    // }

    if (this.isOfferInfo && this.previewCTC && index == "Submit") {
      if (this._NewCandidateDetails.LstCandidateOfferDetails != null
        && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0
        && (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length == 0)) {
        this.alertService.showWarning("Oops! You must preview candidate CTC before submitting")
        return;
      }

    }

    // if (this.isOfferInfo && this.previewLetter && index == "Submit" && !this.isRateSetValid) {
    //   if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
    //     this.alertService.showWarning("Oops! You must preview candidate CTC before submitting")
    //     return;
    //   }
    // }

    if (this.isDocumentInfo && index == "Submit" && !this.utitlityService.isNullOrUndefined(this.candidatesForm.get('isDifferentlyabled').value) && this.candidatesForm.get('isDifferentlyabled').value == true) {
      if (this.candidatesForm.get('differentlyabledPercentage').value < 0 || this.candidatesForm.get('differentlyabledPercentage').value > 100) {
        this.alertService.showWarning("Spend some time to making your differently abled percentage.");
        return;
      }
      else if (this.candidatesForm.get('differentlyabledPercentage').value >= environment.environment.AmountOfDifferentlyabled && this.DocumentList != null && this.DocumentList.length > 0 && !this.utitlityService.isNullOrUndefined(this.DocumentList.find(a => a.IsDisablityProof == 0)) && this.DocumentList.find(a => a.IsDisablityProof == 0).DocumentId == null) {
        this.alertService.showWarning("You are required to upload a document for people with other abilities.");
        return;
      }
    }

    if (this.isDocumentInfo && index == "Submit") {
      let isdocsFiles = false;
      if (this.lstDocumentDetails.length != 0) {
        for (let index = 0; index < this.documentTbl.length; index++) {
          const element_new = this.documentTbl[index];


          if (element_new.IsMandatory == "True" && !this.isAssamState) {
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
        }
      }
      else if (!this.isAssamState) {
        this.alertService.showWarning(" This alert is to inform you about your pending documents.  :) Document Details");
        return;
      }

      if (isdocsFiles) {
        this.alertService.showWarning("This alert is to inform you about your pending documents.  :) Document Details");
        return;
      }


    }


    // if (this.isDocumentInfo) {
    //   let isdocsFiles = false;
    //   if (this.documentTbl.length != 0) {



    //     for (let index = 0; index < this.documentTbl.length; index++) {
    //       const element_new = this.documentTbl[index];
    //       console.log(element_new);

    //       if (element_new.IsMandatory || element_new.FileName != '') {

    //         if (element_new.DocumentNumber == null || element_new.DocumentNumber == "") {

    //           const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //           parent.style.background = '#f9ecda'
    //           parent.style.borderLeft = '4px solid red'
    //           isdocsFiles = true;
    //           break;



    //         }
    //         else if (element_new.IsIdentity == false && element_new.IsAddress == null) {
    //           const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //           parent.style.background = '#f9ecda'
    //           parent.style.borderLeft = '4px solid red'
    //           isdocsFiles = true;
    //           break;

    //         }
    //         else if (element_new.IsIdentity == null && element_new.IsAddress == false) {
    //           const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //           parent.style.background = '#f9ecda'
    //           parent.style.borderLeft = '4px solid red'
    //           isdocsFiles = true;
    //           break;


    //         }
    //         else if (element_new.IsIdentity == false && element_new.IsAddress == false) {
    //           const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //           parent.style.background = '#f9ecda'
    //           parent.style.borderLeft = '4px solid red'
    //           isdocsFiles = true;
    //           break;

    //         }
    //         else if (element_new.isValidFrom == "True" && element_new.isValidTill == "True") {
    //           if (element_new.ValidFrom == null || element_new.ValidTill) {
    //             const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //             parent.style.background = '#f9ecda'
    //             parent.style.borderLeft = '4px solid red'
    //             isdocsFiles = true;
    //             break;

    //           }
    //         }
    //         else if (element_new.FileName == null || element_new.FileName == "") {
    //           const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //           parent.style.background = '#f9ecda'
    //           parent.style.borderLeft = '4px solid red'
    //           isdocsFiles = true;
    //           break;


    //         }
    //         else {

    //           const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //           parent.style.background = null;
    //           parent.style.borderLeft = null;
    //           isdocsFiles = false;

    //         }
    //       }
    //       else {

    //         const parent: HTMLElement = document.getElementById(element_new.DocumentName + '_border');
    //         parent.style.background = null;
    //         parent.style.borderLeft = null;
    //         isdocsFiles = false;

    //       }


    //     }

    //   }
    //   else {
    //     this.alertService.showWarning("This alert is to inform you about your pending documents.  :) Document Details");
    //     return;
    //   }


    //   if (isdocsFiles) {
    //     this.alertService.showWarning("This alert is to inform you about your pending documents.  :) Document Details");
    //     return;
    //   }

    // }

    // let isdocumentValid = false;
    // if (this.isDocumentInfo) {
    //   if (this.documentTbl.length != 0) {

    //     this.documentTbl.forEach(element_new => {

    //       for (let k = 0; k < this.documentTbl.length; k++) {
    //         const element_new = this.documentTbl[k];
    //         if (element_new.Status == ApprovalStatus.Rejected && element_new.Modetype == UIMode.Edit && this.ApprovalStatus) {
    //           this.alertService.showWarning("There are some rejected file(s) in your  :) Document Details");
    //           isdocumentValid = true;
    //           break;
    //         } else {
    //           isdocumentValid = false;
    //         }
    //       }


    //     });
    //   }
    // }
    // if (isdocumentValid) {
    //   this.alertService.showWarning("There are some rejected file(s) in your  :) Document Details");
    //   return;
    // }



    if (this.previewCTC && index == "Submit" && this.isClientApproval && this.candidatesForm.get('onApprovalType').value == "attachment" || this.candidatesForm.get('onApprovalType').value == "online") {

      if (this.IsMinimumwageAdhere == false && this._NewCandidateDetails.Id != undefined &&
        this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {

        var existAL = _.find(this.clientApprovalTbl, (item) => item.ApprovalFor == 3) != null ? false : true;
        if (existAL) {

          this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Minimumwages Adherence. :) Client Approvals") : null;
          this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Minimumwages Adherence. :) Manager Approvals") : null;
          return;
        }
      }
    }


    if (this.isClientApproval && index == "Submit" && this.candidatesForm.get('onApprovalType').value == "attachment") {

      if (this.clientApprovalTbl.length == 0) {

        this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Client approval.  :) Client Approvals") : null;
        this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Manager approval.  :) Manager Approvals") : null;
        return;
      }

      if (this.candidatesForm.get('requestFor').value.toString() === "OL") {

        var existOL = _.find(this.clientApprovalTbl, (item) => item.ApprovalFor == 1) != null ? false : true;
        if (existOL) {


          this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Offer Letter  :) Client Approvals") : null;
          this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Offer Letter  :) Manager Approvals") : null;
          return;
        }
      }

      if (this.candidatesForm.get('requestFor').value.toString() === "AL") {

        var existAL = _.find(this.clientApprovalTbl, (item) => item.ApprovalFor == 4) != null ? false : true;
        if (existAL) {
          this.BusinessType != 1 ? this.alertService.showWarning("Please add required attachments for Appointment Letter :) Client Approvals") : null;
          this.BusinessType == 1 ? this.alertService.showWarning("Please add required attachments for Appointment Letter :) Manager Approvals") : null;
          return;
        }
      }

      if (this.clientApprovalTbl.find(z => z.Status == 2) != null && this.ApprovalStatus) {
        this.BusinessType == 3 ? this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Client Approvals") : null;
        this.BusinessType != 3 ? this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Manager Approvals") : null; return;
      }


    }



    if (this.isOfferInfo && this.previewLetter && index == "Submit" && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].Status == OfferStatus.InActive) {
      this.alertService.showWarning("You are not allowed to edit this part. Please contact admin.");
      return;

    }


    if (this.isFamilydetails &&  this.RoleCode != 'Recruiter' && index == "Submit" && this.LstNominees.length == 0) {
      this.alertService.showWarning("Oops!  Please provide at least One Nominee to confirm it. You cannot publish without Nominee (minimum one detail is required)");
      return;
    }

    if (this.isBankInfo &&  this.RoleCode != 'Recruiter' && index == "Submit" && this.LstBank.length == 0 && this.isESICapplicable) {
      this.alertService.showWarning("Oops!  Please provide at least One Bank Details to confirm it. You cannot publish without Bank Details (minimum one detail is required)");
      return;
    }

    if (this.isBankInfo && index == "Submit" && this.LstBank.length == 0 && this.isESICapplicable) {
      this.alertService.showWarning("Oops!  Please provide at least One Bank details to confirm it. You cannot publish without Bank details (minimum one detail is required)");
      return;
    }


    let rejectedNomineeList = this.LstNominees.find(family => family.isDocumentStatus != null && family.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
    if (this.isFamilydetails && rejectedNomineeList && this.ApprovalStatus) {
      this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Family Details");
      return;
    }

    let rejectedEducationList = this.LstEducation.find(family => family.isDocumentStatus != null && family.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
    if (this.isAcademicInfo && rejectedEducationList && this.ApprovalStatus) {
      this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Academic Information");
      return;
    }

    let rejectedExperienceList = this.LstExperience.find(family => family.isDocumentStatus != null && family.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
    if (this.isEmploymentInfo && rejectedExperienceList && this.ApprovalStatus) {
      this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Work Experience");
      return;
    }
    
    if (this.isBankInfo && this.LstBank.length > 0 && this.RoleCode != 'Recruiter') {
      for (let item of this.LstBank) {
        if (!item.bankName && !item.IFSCCode && !item.accountNumber && !item.accountHolderName) {
          this.alertService.showWarning("Please fill the mandatory fileds in bank details");
          return
        }
      }
    }


    let rejectedBankList = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
    if (this.isBankInfo && rejectedBankList && this.ApprovalStatus) {
      this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Bank Information");
      return;
    }
    if (this.DOB != null) {
      var birth = new Date(this.DOB);
      console.log('this.DateOfJoining', this.DateOfJoining);
      console.log('this.ACT DateOfJoining', this.candidatesForm.get('ActualDOJ').value);
      let today = new Date();
      if (this.DateOfJoining != null && this.DateOfJoining != undefined && this.DateOfJoining.toString() != ("Invalid Date").toString()) {
        if (this.utitlityService.isNotNullAndUndefined(this.DateOfJoining) == true || this.utitlityService.isNotNullAndUndefined(this.candidatesForm.get('ActualDOJ').value) == true) {
          today = this.candidatesForm.get('requestFor').value == "OL" ? this.DateOfJoining : new Date(this.candidatesForm.get('ActualDOJ').value).toString();
        }
        today = new Date(today);
        console.log('today', today);
        var years = moment(birth).diff(today, 'years');
        console.log('years', years.toString());;
        years = Math.abs(years)
        if (years.toString() < '18' || years.toString() == '0' || years < 18 || years == 0) {
          this.alertService.showWarning("The action was blocked. We require candidate to be 18 years old or over. Please confirm your DOJ/DOB")
          return;
        }

      }
    }





    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-primary',
    //     cancelButton: 'btn btn-info'
    //   },
    //   buttonsStyling: true,
    // })
    // swalWithBootstrapButtons.fire({
    //   animation: false,
    //   title: 'Confirm?',
    //   text: "Do you want to re-generate AL letter",
    //   type: 'info',
    //   showCancelButton: true,
    //   confirmButtonText: 'Yes',
    //   cancelButtonText: 'No',
    //   allowOutsideClick: false,
    //   reverseButtons: true
    // }).then((result) => {
    //   console.log(result);

    //   if (result.value) {
    //     this.candidateOfferDetails.ReissueLetter = true;
    //     this.sweetalertConfirm(index);

    //   } else if (

    //     result.dismiss === Swal.DismissReason.cancel
    //   ) {
    //     this.candidateOfferDetails.ReissueLetter = false;
    //     this.sweetalertConfirm(index);
    //   }
    // })


    this.sweetalertConfirm(index);

  }




  // confirmation dialog from sweet alert

  sweetalertConfirm(index: any): void {


    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        try {


          // else if (this.isEmploymentInfo) {

          //   this.LstExperience.length == 0 && !this.isFresher ? this.alertService.showWarning("Oops!  Please provide at leaset one experience deatils!") : '';
          //   return;
          // }
          // else if (this.isAcademicInfo) {
          //   this.LstEducation.length == 0 ? this.alertService.showWarning("Please file out in Education details") : '';
          //   return;

          // }
          // else if (this.isBankInfo) {
          //   this.LstBank.length == 0 ? this.alertService.showWarning("Please file out in Bank details") : '';
          //   return;

          // }


          //debugger;
          this.loadingScreenService.startLoading();
          this.clearListofItems();

          // isRateCardType
          // upload attachment

          if (this.Id != 0) {

            this.candidateDetails.Id = this._NewCandidateDetails.Id;
            this.candidateDetails.LastUpdatedBy = this.UserId;
            this.candidateOfferDetails = this._NewCandidateDetails.LstCandidateOfferDetails[0];
          }
          else {

            this.candidateDetails.Id = 0;
            this.candidateDetails.LastUpdatedBy = this.UserId;

          }
          // this.candidateDetails.Id = this.Id;
          // this.candidateDetails.LastUpdatedBy = this.UserId;

          this.candidatesForm.controls['firstName'] != null ? this.candidateDetails.FirstName = this.candidatesForm.get('firstName').value == null || this.candidatesForm.get('firstName').value == "" ? "" : this.candidatesForm.get('firstName').value : null;
          this.candidateDetails.LastName = "";
          this.candidatesForm.controls['gender'] != null ? this.candidateDetails.Gender = this.candidatesForm.get('gender').value == 1 ? Gender.Male : this.candidatesForm.get('gender').value == 2 ? Gender.Female : this.candidatesForm.get('gender').value == 3 ? Gender.TransGender : 0 : null;
          // this.candidateDetails.DateOfBirth = this.datePipe.transform(new Date(this.candidatesForm.get('dateOfBirth').value).toString(), "yyyy-MM-dd");
          this.candidatesForm.controls['dateOfBirth'] != null ? this.candidateDetails.DateOfBirth = this.candidatesForm.get('dateOfBirth').value == null ? null : this.datePipe.transform(new Date(this.DOB).toString(), "yyyy-MM-dd") : null;

          // if (this.candidateDetails.DateOfBirth == "1970-01-01") {
          //   this.candidateDetails.DateOfBirth = null; 
          // }
          // alert(this.candidatesForm.get('dateOfBirth').value)
          this.candidatesForm.controls['isDifferentlyabled'] != null ? this.candidateDetails.IsDifferentlyabled = this.candidatesForm.get('isDifferentlyabled').value : null;
          this.candidatesForm.controls['differentlyabledPercentage'] != null ? this.candidateDetails.DisabilityPercentage = this.candidateDetails.IsDifferentlyabled == true ? this.candidatesForm.get('differentlyabledPercentage').value : 0 : null;
          this.candidatesForm.controls['nationality'] != null ? this.candidateDetails.Nationality = this.candidatesForm.get('nationality').value == 1 ? Nationality.Indian : Nationality.Non_Indian : null;
          this.candidatesForm.controls['country'] != null ? this.candidateDetails.CountryOfOrigin = this.candidateDetails.Nationality == 1 ? 1 : this.candidatesForm.get('country').value : null;
          this.candidatesForm.controls['bloodGroup'] != null ? this.candidateDetails.BloodGroup = this.candidatesForm.get('bloodGroup').value == null || this.candidatesForm.get('bloodGroup').value == "" ? 0 : this.candidatesForm.get('bloodGroup').value : null;
          this.candidatesForm.controls['maritialStatus'] != null ? this.candidateDetails.MaritalStatus = this.candidatesForm.get('maritialStatus').value == null || this.candidatesForm.get('maritialStatus').value == "" ? 0 : this.candidatesForm.get('maritialStatus').value : null;
          this.candidateDetails.Status = CandidateStatus.Active;


          this.candidatesForm.controls['workPermitType'] != null ? this.workPermitDetails.WorkPermitType = this.candidatesForm.get('workPermitType').value : null;
          this.candidatesForm.controls['isValidFrom'] != null ? this.workPermitDetails.ValidFrom = this.candidatesForm.get('isValidFrom').value : null;;
          this.candidatesForm.controls['isValidTill'] != null ? this.workPermitDetails.ValidTill = this.candidatesForm.get('isValidTill').value : null;;
          this.workPermitDetails.Modetype = UIMode.Edit;;
          this.workPermitDetails.Id = this.Id != 0 ? (this._NewCandidateDetails != null && this._NewCandidateDetails.WorkPermits != null && this._NewCandidateDetails.WorkPermits.length > 0) ? this._NewCandidateDetails.WorkPermits[0].Id : 0 : 0;

          this.candidatesForm.controls['email'] != null ? this.candidateContactDetails.PrimaryEmail = this.candidatesForm.get('email').value : null;;
          this.candidatesForm.controls['mobile'] != null ? this.candidateContactDetails.PrimaryMobile = this.candidatesForm.get('mobile').value : null;;
          this.candidateContactDetails.PrimaryMobileCountryCode = this.countryCode;
          this.candidateContactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Personal;


          this.candidatesForm.controls['requestBy'] != null && this.candidatesForm.controls['requestBy'].disabled == false ? this.candidateOfferDetails.IsSelfRequest = this.candidatesForm.get('requestBy').value == "self" ? true : false : null;;
          this.candidatesForm.controls['requestBy'] != null && this.candidatesForm.controls['requestBy'].disabled == false ? this.candidateOfferDetails.RequestedBy =  this.UserId  : null;;

          this.BusinessType != 3 ? this.candidateOfferDetails.IsSelfRequest = this.candidatesForm.get('requestBy').value == "self" ? true : false : null;
          this.BusinessType != 3 ? this.candidateOfferDetails.RequestedBy = this.UserId : null;



          // for ops transfer condition only 
          if (this.Id == 0 && this.candidatesForm.get('sourceType').value == 2) {
            this.candidateOfferDetails.IsSelfRequest = true;
            this.candidateOfferDetails.RequestedBy = this.UserId;
          }
          this.candidateOfferDetails.IsSelfRequest = true;
          this.candidateOfferDetails.RequestedBy = this.UserId;

          if (this.candidatesForm.get('relationshipNameType').value == 'fathername') {
            this.updateValidation(true, this.candidatesForm.get('fatherName'));
            this.updateValidation(false, this.candidatesForm.get('relationshipType'));
            this.updateValidation(false, this.candidatesForm.get('relationshipName'));
            this.candidateDetails.RelationshipId = Relationship.Father;
            this.candidateDetails.RelationshipName  = this.candidatesForm.get('fatherName').value||null;
          
            this.candidatesForm.controls['fatherName'] != null ? this.candidateOfferDetails.FatherName = this.candidatesForm.get('fatherName').value : null;;
          } else {
            this.updateValidation(false, this.candidatesForm.get('fatherName'));
            this.updateValidation(true, this.candidatesForm.get('relationshipType'));
            this.updateValidation(true, this.candidatesForm.get('relationshipName'));
            this.candidateOfferDetails.FatherName = '';
            this.candidatesForm.controls['relationshipType'] != null ? this.candidateDetails.RelationshipId = this.candidatesForm.get('relationshipType').value : 0;;
            this.candidatesForm.controls['relationshipName'] != null ? this.candidateDetails.RelationshipName = this.candidatesForm.get('relationshipName').value : null;;
    
          }
    

          this.candidatesForm.controls['requestFor'] != null ? this.candidateOfferDetails.RequestType = this.candidatesForm.get('requestFor').value == "OL" ? RequestType.OL : RequestType.AL : null;;
          this.candidatesForm.controls['onboardingType'] != null ? this.candidateOfferDetails.OnBoardingType = this.candidatesForm.get('onboardingType').value == "flash" ? OnBoardingType.Flash : OnBoardingType.Proxy : null;
          this.candidatesForm.controls['onBehalfRemarks'] != null ? this.candidateOfferDetails.TeamProxyRequest = this.candidatesForm.get('onBehalfRemarks').value : null;
          this.candidatesForm.controls['proxyRemarks'] != null ? this.candidateOfferDetails.ProxyRemarks = this.candidatesForm.get('proxyRemarks').value : null;;
          // this.candidatesForm.controls['fatherName'] != null ? this.candidateOfferDetails.FatherName = this.candidatesForm.get('fatherName').value : null;;
          this.candidatesForm.controls['isOLcandidateacceptance'] != null ? this.candidateOfferDetails.IsCandidateAcceptanceRequiredForOL = this.candidatesForm.get('isOLcandidateacceptance').value != null || this.candidatesForm.get('isOLcandidateacceptance').value != "" ? this.candidatesForm.get('isOLcandidateacceptance').value : false : null;;
          this.candidatesForm.controls['isAlaccept'] != null ? this.candidateOfferDetails.IsCandidateAcceptanceRequiredForAL = this.candidatesForm.get('isAlaccept').value != null || this.candidatesForm.get('isAlaccept').value != "" ? this.candidatesForm.get('isAlaccept').value : false : null;

          this.candidatesForm.controls['clientName'] != null ? this.candidateOfferDetails.ClientId = this.candidatesForm.get('clientName').value : null;
          this.candidatesForm.controls['clientContract'] != null ? this.candidateOfferDetails.ClientContractId = this.candidatesForm.get('clientContract').value == null || this.candidatesForm.get('clientContract').value == "" ? 0 : this.candidatesForm.get('clientContract').value : null;
          this.candidatesForm.controls['mandateName'] != null ? this.candidateOfferDetails.MandateRequirementId = this.candidatesForm.get('mandateName').value == null || this.candidatesForm.get('mandateName').value == "" ? 0 : this.candidatesForm.get('mandateName').value : null;
          this.candidatesForm.controls['candidateName'] != null ? this.candidateOfferDetails.CandidateId = this.candidatesForm.get('candidateName').value == null || this.candidatesForm.get('candidateName').value == "" ? 0 : this.candidatesForm.get('candidateName').value : null;
          this.candidatesForm.controls['clientSPOC'] != null ? this.candidateOfferDetails.ClientContactId = this.candidatesForm.get('clientSPOC').value == null || this.candidatesForm.get('clientSPOC').value == "" ? 0 : this.candidatesForm.get('clientSPOC').value : null;
          this.candidatesForm.controls['onApprovalType'] != null ? this.candidateOfferDetails.IsClientApprovedBasedOn = this.candidatesForm.get('onApprovalType').value == "online" ? IsClientApprovedBasedOn.Online : IsClientApprovedBasedOn.Attachment : null;
          this.candidatesForm.controls['sourceType'] != null ? this.candidateOfferDetails.SourceType = this.candidatesForm.get('sourceType').value : null;
          this.candidatesForm.controls['industryType'] != null ? this.candidateOfferDetails.IndustryId = this.candidatesForm.get('industryType').value == "" || this.candidatesForm.get('industryType').value == null ? 0 : this.candidatesForm.get('industryType').value : null;
          this.candidatesForm.controls['location'] != null ? this.candidateOfferDetails.Location = this.candidatesForm.get('location').value : null;
          this.candidatesForm.controls['skillCategory'] != null ? this.candidateOfferDetails.SkillCategory = this.candidatesForm.get('skillCategory').value == "" || this.candidatesForm.get('skillCategory').value == null ? 0 : this.candidatesForm.get('skillCategory').value : null;
          this.candidatesForm.controls['designation'] != null ? this.candidateOfferDetails.Designation = this.candidatesForm.get('designation').value : null;
          this.candidatesForm.controls['Remarks'] != null ? this.candidateOfferDetails.SalaryRemarks = this.candidatesForm.get('Remarks').value : null;

          this.candidatesForm.controls['zone'] != null ? this.candidateOfferDetails.Zone = this.candidatesForm.get('zone').value == "" || this.candidatesForm.get('zone').value == null ? 0 : this.candidatesForm.get('zone').value : null;
          // this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidateOfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount') != null ? Number(this.candidatesForm.get('onCostInsuranceAmount').value) : 0 : null;
          this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidateOfferDetails.FixedInsuranceDeduction = this.candidatesForm.get('fixedDeductionAmount') != null ? Number(this.candidatesForm.get('fixedDeductionAmount').value) : 0 : null;
          this.candidatesForm.controls['insuranceplan'] != null ? this.candidateOfferDetails.InsurancePlan = this.candidatesForm.get('insuranceplan') != null ? Number(this.candidatesForm.get('insuranceplan').value) : 0 : null;

          this.candidatesForm.controls['Gpa'] != null ? this.candidateOfferDetails.GPAAmount = this.candidatesForm.get('Gpa') != null ? Number(this.candidatesForm.get('Gpa').value) : 0 : null;
          this.candidatesForm.controls['Gmc'] != null ? this.candidateOfferDetails.GMCAmount = this.candidatesForm.get('Gmc') != null ? Number(this.candidatesForm.get('Gmc').value) : 0 : null;
          this.candidatesForm.controls['NoticePeriod'] != null ? this.candidateOfferDetails.NoticePeriodDays = this.candidatesForm.get('NoticePeriod') != null ? Number(this.candidatesForm.get('NoticePeriod').value) : 0 : null;
          this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidateOfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount') != null ? Number(this.candidatesForm.get('onCostInsuranceAmount').value) : null : null;

          this.candidateOfferDetails.OLCCMailIdCC = _.union(this.ccmailtags).join(",");
          this.candidateOfferDetails.ALCCMailIdCC = _.union(this.ccmailtags).join(",");

          this.candidateOfferDetails.State = this.StateId;
          this.candidateOfferDetails.CityId = this.CityId;
          this.candidateOfferDetails.IsFresher = this.isFresher;
          this.candidateOfferDetails.IsRateSetValid = this.isRateSetValid;
          this.candidatesForm.controls['monthlyAmount'] != null ? this.candidateOfferDetails.MonthlyBillingAmount = this.candidatesForm.get('monthlyAmount').value == "" || this.candidatesForm.get('monthlyAmount').value == null ? 0 : this.candidatesForm.get('annualSalary').value : null;
          this.candidateOfferDetails.ModuleTransactionId = (this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId : 0;
          this.candidateOfferDetails.Modetype = UIMode.Edit;;
          this.candidateOfferDetails.Id = this.Id != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].Id : 0 : 0;
          // this.candidateOfferDetails.ApprovalStatus = this.Id != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus == ApprovalStatus.Rejected  ? ApprovalStatus.Pending : this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus : ApprovalStatus.Pending : ApprovalStatus.Pending;
          this.candidateOfferDetails.ApprovalRemarks = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalRemarks : null;
          if (this._NewCandidateDetails != null) {
            this.candidateOfferDetails.AcceptanceStatus = this.Id != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != 0 as any && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus : 0;
            this.candidateOfferDetails.AcceptanceRemarks = this.Id != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks : null;

          }

          this.candidatesForm.controls['salaryType'] != null ? this.candidateRateSetDetails.SalaryBreakUpType = this.candidatesForm.get('salaryType').value == null ? 0 : this.candidatesForm.get('salaryType').value : null;
          this.candidatesForm.controls['annualSalary'] != null ? this.candidateRateSetDetails.AnnualSalary = this.candidatesForm.get('annualSalary').value == null || this.candidatesForm.get('annualSalary').value == "" ? 0 : this.candidatesForm.get('annualSalary').value : null;
          this.candidatesForm.controls['paystructure'] != null ? this.candidateRateSetDetails.PayGroupdId = this.candidatesForm.get('paystructure').value == null ? 0 : this.candidatesForm.get('paystructure').value : null;
          this.candidatesForm.controls['MonthlySalary'] != null ? this.candidateRateSetDetails.MonthlySalary = this.candidatesForm.get('MonthlySalary').value == null || this.candidatesForm.get('MonthlySalary').value == "" ? 0 : this.candidatesForm.get('MonthlySalary').value : null;
          this.candidatesForm.controls['forMonthlyValue'] != null ? this.candidateRateSetDetails.IsMonthlyValue = this.candidatesForm.get('forMonthlyValue').value : null;

          this.candidateRateSetDetails.Modetype = UIMode.Edit;
          this.candidateRateSetDetails.Status = 1;
          this.candidateRateSetDetails.Id = this.Id != 0 ? (this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null
            && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].Id : 0 : 0;

          this.candidateRateSetDetails.LstRateSet = this.Id != 0 && this._NewCandidateDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null ?
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet :

            this.candidatesForm.get('sourceType').value == 2 && this._NewCandidateDetails.Id != undefined ? (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet) : null

          if (this.candidatesForm.get('requestFor').value == "OL") {
            this.candidatesForm.controls['letterTemplate'] != null ? this.candidateOfferDetails.LetterTemplateId = this.candidatesForm.get('letterTemplate') != null && this.candidatesForm.get('letterTemplate').value != null ? this.candidatesForm.get('letterTemplate').value : 0 : null;
            this.DateOfJoining != null && this.DateOfJoining != undefined && this.candidatesForm.controls['expectedDOJ'] != null && this.candidatesForm.controls['expectedDOJ'] != undefined ? this.candidateOfferDetails.DateOfJoining = this.candidatesForm.get('expectedDOJ').value == null ? null : this.datePipe.transform(new Date(this.DateOfJoining).toString(), "yyyy-MM-dd") : null;

            // if (this.candidateOfferDetails.DateOfJoining == '1970-01-01') {
            //   this.candidateOfferDetails.DateOfJoining = null;
            // }

          }

          this.candidatesForm.controls['isAadharExemptedState'] != null ? this.candidateOfferDetails.IsAadhaarExemptedState = this.candidatesForm.get('isAadharExemptedState').value : null;
          this.candidatesForm.controls['isPANNoExists'] != null ? this.candidateOfferDetails.IsPANExists = this.candidatesForm.get('isPANNoExists').value : null;
          this.candidatesForm.controls['haveApplied'] != null ? this.candidateOfferDetails.IsPanApplied = this.candidatesForm.get('haveApplied').value : null;
          this.candidatesForm.controls['ackowledgmentNumber'] != null ? this.candidateOfferDetails.PANAckowlegementNumber = this.candidatesForm.get('ackowledgmentNumber').value : null;
          this.candidateOfferDetails.Status = (this.Id != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].Status : OfferStatus.Active;
          this.previewCTC ? this.candidateOfferDetails.IsMinimumwageAdhere = this.IsMinimumwageAdhere : null;
          this.candidatesForm.controls['PANNO'] != null ? this.candidateStatutoryDetails.PAN = this.candidatesForm.get('PANNO').value : null;
          this.candidatesForm.controls['UAN'] != null ? this.candidateStatutoryDetails.UAN = this.candidatesForm.get('UAN').value : null;
          // this.candidatesForm.controls['PFNumber'] != null ? this.candidateStatutoryDetails.PFNumber = this.candidatesForm.get('PFNumber').value : null;
          this.candidatesForm.controls['ESICNumber'] != null ? this.candidateStatutoryDetails.ESICNumber = this.candidatesForm.get('ESICNumber').value : null;
          this.candidateStatutoryDetails.Id = this.Id != 0 ? this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0 ? this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].Id : 0 : 0;

          if (this.isMigrationInfo && this.candidatesForm.get('requestFor').value == "AL") {
            // this.candidateOfferDetails.LetterTemplateId = 0;
            // this.candidateOfferDetails.DateOfJoining = this.datePipe.transform(new Date(this.candidatesForm.get('ActualDOJ').value).toString(), "yyyy-MM-dd");
            this.candidatesForm.controls['ActualDOJ'] != null && this.candidatesForm.controls['ActualDOJ'] != undefined ? this.candidateOfferDetails.ActualDateOfJoining = this.candidatesForm.get('ActualDOJ').value == null ? null : this.datePipe.transform(new Date(this.candidatesForm.get('ActualDOJ').value).toString(), "yyyy-MM-dd") : null;

            // if (this.candidateOfferDetails.ActualDateOfJoining == '1970-01-01') {
            //   this.candidateOfferDetails.ActualDateOfJoining = null;
            // }
            // console.log('date', this.candidateOfferDetails.ActualDateOfJoining);
            this.candidatesForm.controls['EffectivePayPeriod'] != null ? this.candidateOfferDetails.EffectivePayPeriodId = this.candidatesForm.get('EffectivePayPeriod') != null && this.candidatesForm.get('EffectivePayPeriod').value != null ? this.candidatesForm.get('EffectivePayPeriod').value : 0 : null;
            this.candidatesForm.controls['TeamId'] != null ? this.candidateOfferDetails.TeamId = this.candidatesForm.get('TeamId') != null && this.candidatesForm.get('TeamId').value != null ? this.candidatesForm.get('TeamId').value : 0 : null;
            this.candidatesForm.controls['LeaveGroupId'] != null ? this.candidateOfferDetails.LeaveGroupId = this.candidatesForm.get('LeaveGroupId') != null && this.candidatesForm.get('LeaveGroupId').value != null ? this.candidatesForm.get('LeaveGroupId').value : 0 : null;
            this.candidatesForm.controls['CostCodeId'] != null ? this.candidateOfferDetails.CostCodeId = this.candidatesForm.get('CostCodeId') != null && this.candidatesForm.get('CostCodeId').value != null ? this.candidatesForm.get('CostCodeId').value : 0 : null;
            this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidateOfferDetails.AppointmentLetterTemplateId = this.candidatesForm.get('AppointmentLetterTemplateId') != null && this.candidatesForm.get('AppointmentLetterTemplateId').value != null ? this.candidatesForm.get('AppointmentLetterTemplateId').value : 0 : null;
            this.candidatesForm.controls['employmentType'] != null ? this.candidateOfferDetails.EmploymentType = this.candidatesForm.get('employmentType') != null && this.candidatesForm.get('employmentType').value != null ? this.candidatesForm.get('employmentType').value : 0 : null;

          }
          this.candidatesForm.controls['ManagerId'] != null ? this.candidateOfferDetails.ManagerId = this.candidatesForm.get('ManagerId') != null && this.candidatesForm.get('ManagerId').value != null ? this.candidatesForm.get('ManagerId').value : 0 : null;


          // this is only for tenure date 
          if (this.isOfferInfo && this.candidatesForm.get('requestFor').value == "AL" && this.candidateOfferDetails.ActualDateOfJoining != null && this.candidateOfferDetails.ActualDateOfJoining != undefined) {

            this.DateOfJoining = new Date(this.candidateOfferDetails.ActualDateOfJoining)
          }
          else if (this.isOfferInfo && this.candidatesForm.get('requestFor').value == "OL" && this.candidateOfferDetails.DateOfJoining != null && this.candidateOfferDetails.DateOfJoining != undefined) {

            this.DateOfJoining = new Date(this.candidateOfferDetails.DateOfJoining)
          }
          else if (this.isOfferInfo) {

            this.DateOfJoining = null;
          }


          this.candidatesForm.controls['tenureType'] != null ? this.candidateOfferDetails.TenureType = this.candidatesForm.get('tenureType').value : null;
          if (this.candidateOfferDetails.TenureType == null) {
            this.candidateOfferDetails.TenureType = -1;
          }
          let skipdate = (this.datePipe.transform(new Date(this.DateOfJoining).toString(), "yyyy-MM-dd"));

          if (this.candidateOfferDetails.TenureType == TenureType.Custom) {
            try {
              if (this.candidatesForm.controls['tenureEndate'] && this.candidatesForm.controls['tenureEndate'].value !== '') {
                this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.controls['tenureEndate'] != undefined ? this.candidateOfferDetails.EndDate = (this.candidatesForm.get('tenureEndate').value == null || this.candidatesForm.get('tenureEndate').value == undefined) ? null : this.datePipe.transform(new Date(this.candidatesForm.get('tenureEndate').value).toString(), "yyyy-MM-dd") : null;
              } else {
                this.candidatesForm.controls['tenureEndate'] = null;
              }
            } catch (err) {
              this.candidatesForm.controls['tenureEndate'] = null;
              console.log ('ERROR INSIDE TENURE DATE FOR CUSTOM -->', err);
            }
          }
          
          else if (this.candidateOfferDetails.TenureType == TenureType.Month && this.isOfferInfo) {

            this.candidatesForm.controls['tenureMonth'] != null ? this.candidateOfferDetails.TenureInterval = this.candidatesForm.get('tenureMonth').value : null;
            if (this.candidatesForm.controls['tenureMonth'] != null && this.candidatesForm.get('tenureMonth').value != null && this.isOfferInfo && skipdate != "1970-01-01") {
              this.DateOfJoining = this.DateOfJoining == "0001-01-01T00:00:00" ? null : this.DateOfJoining;
              let enddate_custom = this.DateOfJoining;
              // Creaate the new date

              if (this.DateOfJoining != null) {
                var myDate = new Date(enddate_custom);
                var newDate = moment(myDate);
                let nextMonth = newDate.add('month', Number(this.candidatesForm.get('tenureMonth').value));
                nextMonth.subtract(1, "days")
                this.candidateOfferDetails.EndDate = moment(nextMonth).format('YYYY-MM-DD')
              }


            }
            else {

              this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.controls['tenureEndate'] != undefined ? this.candidateOfferDetails.EndDate = null : null;
            }
          }
          else if (this.isOfferInfo) {

            this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.controls['tenureEndate'] != undefined ? this.candidateOfferDetails.EndDate = null : null;
          }

          this.isOfferInfo && this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.controls['tenureEndate'] != undefined ? this.candidateOfferDetails.EndDate = this.candidateOfferDetails.EndDate == "0001-01-01T00:00:00" || skipdate == "1970-01-01" ? null : this.candidateOfferDetails.EndDate : null;




          /* #region  Communication Details  */
          this.lstAddressDetails.push({
            Address1: this.candidatesForm.controls['presentAddressdetails'] != null ? this.candidatesForm.get('presentAddressdetails').value : null,
            Address2: this.candidatesForm.controls['presentAddressdetails1'] != null ? this.candidatesForm.get('presentAddressdetails1').value : null,
            Address3: this.candidatesForm.controls['presentAddressdetails2'] != null ? this.candidatesForm.get('presentAddressdetails2').value : null,
            CountryName: this.candidatesForm.controls['presentCountryName'] != null ? this.candidatesForm.get('presentCountryName').value : null,
            StateName: this.candidatesForm.controls['presentStateName'] != null ? this.candidatesForm.get('presentStateName').value : null,
            City: this.candidatesForm.controls['presentCity'] != null ? this.candidatesForm.get('presentCity').value : null,
            PinCode: this.candidatesForm.controls['presentPincode'] != null ? this.candidatesForm.get('presentPincode').value : null,
            CommunicationCategoryTypeId: this.candidatesForm.controls['presentAddressdetails'] != null ? CommunicationCategoryType.Present : null
          })
          this.lstAddressDetails.push({
            Address1: this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.get('permanentAddressdetails').value : null,
            Address2: this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.get('permanentAddressdetails1').value : null,
            Address3: this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.get('permanentAddressdetails2').value : null,
            CountryName: this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.get('permanentCountryName').value : null,
            StateName: this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.get('permanentStateName').value : null,
            City: this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.get('permanentCity').value : null,
            PinCode: this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.get('permanentPincode').value : null,
            CommunicationCategoryTypeId: this.candidatesForm.controls['permanentAddressdetails'] != null ? CommunicationCategoryType.Permanent : null
          })
          this.candidateCommunicationDetails.LstAddressdetails = this.lstAddressDetails;
          // this.candidateCommunicationDetails.Id = 0;
          if (this._NewCandidateDetails != null && this._NewCandidateDetails.CandidateCommunicationDtls != null) {

            if (this._NewCandidateDetails.CandidateCommunicationDtls.Id != null) {
              this.candidateCommunicationDetails.Id = this._NewCandidateDetails.CandidateCommunicationDtls.Id;
            }
          } else {
            this.candidateCommunicationDetails.Id = 0;
          }
          // this.candidateCommunicationDetails.Id = this.Id != 0 ? this._NewCandidateDetails.CandidateCommunicationDtls != null &&  this._NewCandidateDetails.CandidateCommunicationDtls.Id != null ? 0 : this._NewCandidateDetails.CandidateCommunicationDtls.Id : 0;


          /* #endregion */

          this.LstNominees.forEach(element => {
            element["lstClaim"] = []
            if (element.FamilyPF) {


              element.lstClaim.push({


                ClaimType: ClaimType.PF,
                Percentage: element.FamilyPF,
                Remarks: ''

              })
            }
            if (element.FamilyESIC) {


              element.lstClaim.push({


                ClaimType: ClaimType.ESIC,
                Percentage: element.FamilyESIC,
                Remarks: ''

              })
            }

            if (element.FamilyGratuity) {


              element.lstClaim.push({


                ClaimType: ClaimType.Gratuity,
                Percentage: element.FamilyGratuity,
                Remarks: ''

              })
            }

          });



          this.LstNominees.forEach(element => {

            var familyDets = new CandidateFamilyDetails();

            familyDets.Name = element.nomineeName,
              familyDets.RelationshipId = element.relationship,
              familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01" : element.DOB,
              familyDets.LstClaims = element.lstClaim,
              familyDets.IsEmployed = element.FamilyisEmployed,

              familyDets.Modetype = element.Modetype,
              familyDets.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
              familyDets.CandidateDocument = element.CandidateDocument

            this.lstFamilyDetails.push(

              familyDets

            )


          });


          this.deletedLstNominee.forEach(element => {

            var familyDets = new CandidateFamilyDetails();
            familyDets.Name = element.nomineeName,
              familyDets.RelationshipId = element.relationship,
              familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01" : element.DOB,
              familyDets.LstClaims = element.lstClaim,
              familyDets.IsEmployed = element.FamilyisEmployed,
              familyDets.Modetype = element.Modetype,
              familyDets.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
              familyDets.CandidateDocument = element.CandidateDocument;
            this.lstFamilyDetails.push(familyDets);
          });


          this.candidateDetails.LstCandidateFamilyDetails = this.lstFamilyDetails;


          if (this.isFresher == false) {

            this.LstExperience.forEach(element => {

              var candidateExperienceDetails = new WorkExperience();

              candidateExperienceDetails.CompanyName = element.companyName;
              candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
              candidateExperienceDetails.DesignationHeld = element.title;
              candidateExperienceDetails.WorkLocation = element.workLocation;

              candidateExperienceDetails.StartDate = element.startdate;
              candidateExperienceDetails.EndDate = element.enddate;
              candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
              candidateExperienceDetails.FunctionalArea = null;

              candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
              candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
              // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
              candidateExperienceDetails.Modetype = element.Modetype,
                candidateExperienceDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
                candidateExperienceDetails.CandidateDocument = element.CandidateDocument

              this.lstExperienceDetails.push(

                candidateExperienceDetails
              )

            });
          }

          this.deletedLstExperience.forEach(element => {

            var candidateExperienceDetails = new WorkExperience();

            candidateExperienceDetails.CompanyName = element.companyName;
            candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
            candidateExperienceDetails.DesignationHeld = element.title;
            candidateExperienceDetails.WorkLocation = element.workLocation;

            candidateExperienceDetails.StartDate = element.startdate;
            candidateExperienceDetails.EndDate = element.enddate;
            candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
            candidateExperienceDetails.FunctionalArea = null;

            candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
            candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
            // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
            candidateExperienceDetails.Modetype = element.Modetype,
              candidateExperienceDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
              candidateExperienceDetails.CandidateDocument = element.CandidateDocument

            this.lstExperienceDetails.push(

              candidateExperienceDetails
            )

          });

          this.candidateDetails.WorkExperiences = this.lstExperienceDetails;

          this.LstBank.forEach(element => {

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
              candidateBankDetails.CandidateDocument = element.CandidateDocument,
              candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
          element.PayoutLogId = 0
        }
        candidateBankDetails.PayoutLogId = element.PayoutLogId
            this.lstBankDetails.push(

              candidateBankDetails
            )

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
              candidateBankDetails.CandidateDocument = element.CandidateDocument,
              candidateBankDetails.VerificationMode = element.VerificationMode
              candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
          element.PayoutLogId = 0
        }
        candidateBankDetails.PayoutLogId = element.PayoutLogId

            this.lstBankDetails.push(

              candidateBankDetails
            )

          });

          this.candidateDetails.LstCandidateBankDetails = this.lstBankDetails;


          this.LstEducation.forEach(element => {

            var candidateQualificationDetails = new Qualification();

            candidateQualificationDetails.GraduationType = element.graduationType;
            candidateQualificationDetails.EducationDegree = element.educationDegree;
            candidateQualificationDetails.CourseType = element.courseType;
            candidateQualificationDetails.InstitutionName = element.institutaion;
            candidateQualificationDetails.UniversityName = element.universityName;
            candidateQualificationDetails.CandidateId = this.CandidateId;
            candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
            candidateQualificationDetails.ScoringType = element.scoringType;
            candidateQualificationDetails.ScoringValue = element.scoringValue;
            candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
            // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
            candidateQualificationDetails.Modetype = element.Modetype,
              candidateQualificationDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
              candidateQualificationDetails.CandidateDocument = element.CandidateDocument

            this.lstQualificationDetails.push(

              candidateQualificationDetails
            )

          });

          this.deletedLstEducation.forEach(element => {

            var candidateQualificationDetails = new Qualification();


            candidateQualificationDetails.GraduationType = element.graduationType;
            candidateQualificationDetails.EducationDegree = element.educationDegree;
            candidateQualificationDetails.CourseType = element.courseType;
            candidateQualificationDetails.InstitutionName = element.institutaion;
            candidateQualificationDetails.UniversityName = element.universityName;
            candidateQualificationDetails.CandidateId = this.CandidateId;
            candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
            candidateQualificationDetails.ScoringType = element.scoringType;
            candidateQualificationDetails.ScoringValue = element.scoringValue;
            candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
            // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
            candidateQualificationDetails.Modetype = element.Modetype,
              candidateQualificationDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
              candidateQualificationDetails.CandidateDocument = element.CandidateDocument

            this.lstQualificationDetails.push(

              candidateQualificationDetails
            )

          });


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
            this.candidateDetails.ExternalApprovals = this.lstClientApporval;
          }



          /* #endregion */


          this.lstDocumentDetails.forEach(element => {
            element.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
          });

          console.log('CANDIDATE DOCUMENTS :', this.lstDocumentDetails);
          var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
          isAadhaarExists != undefined && (this.candidateOfferDetails.Aadhaar = Number(isAadhaarExists.DocumentNumber));
    
          var isPANNOExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.PANDocumentTypeId && a.DocumentCategoryId != 0)
          isPANNOExists != undefined && (this.candidateOfferDetails.IsPANExists = true, this.candidateStatutoryDetails.PAN = (isPANNOExists.DocumentNumber));
    
    

          this.candidateDetails.LstCandidateDocuments = this.lstDocumentDetails;

          /* #endregion */
          // }

          let isRejectedItem_Document = false;
          let isRejectedItem_Approvals = false;

          isRejectedItem_Document = this.lstDocumentDetails.find(a => a.Status == ApprovalStatus.Rejected && a.Modetype != UIMode.Delete) != null ? true : false
          isRejectedItem_Approvals = this.lstClientApporval.find(a => a.Status == ApprovalStatus.Rejected && a.Modetype != UIMode.Delete) != null ? true : false;

          if (this.ApprovalStatus && !isRejectedItem_Approvals && !isRejectedItem_Document) {
            this.candidateOfferDetails.ApprovalStatus = ApprovalStatus.Pending;

          }


          this.candidateDetails.Qualifications = this.lstQualificationDetails;

          this.lstCandidateOfferDetails.push(this.candidateOfferDetails);
          if (this.candidateDetails.Nationality != 1) {

            this.lstWorkPermitDetails.push(this.workPermitDetails);

          }

          if (this.candidateStatutoryDetails.PAN != "" || this.candidateStatutoryDetails.PFNumber != "" || this.candidateStatutoryDetails.UAN != "" || this.candidateStatutoryDetails.ESICNumber != "") {

            this.lstStatutoryDetails.push(this.candidateStatutoryDetails);
          }

            // -- for emergency contact details 
      if (this.candidatesForm.get('emergencyContactPersonName').value != null && this.candidatesForm.get('emergencyContactPersonName').value != undefined) {
        let emergencyObject = new ContactDetails();
        this.candidatesForm.controls['emergencyContactPersonName'] != null ? emergencyObject.EmergencyContactPersonName = this.candidatesForm.get('emergencyContactPersonName').value : null;;
        this.candidatesForm.controls['emergencyContactnumber'] != null ? emergencyObject.EmergencyContactNo = this.candidatesForm.get('emergencyContactnumber').value : null;;
        emergencyObject.CommunicationCategoryTypeId = CommunicationCategoryType.Emergency;
        emergencyObject.EmergencyContactNoCountryCode = this.countryCode;
        this.lstContactDetails.push(emergencyObject)
      }

          this.lstContactDetails.push(this.candidateContactDetails);

          this.lstRateSetDetails.push(this.candidateRateSetDetails);

          this.candidateDetails.WorkPermits = this.lstWorkPermitDetails;
          this.candidateDetails.LstCandidateOfferDetails = this.lstCandidateOfferDetails;
          this.candidateCommunicationDetails.LstContactDetails = this.lstContactDetails;
          this.candidateCommunicationDetails.Modetype = UIMode.Edit;

          this.candidateOtherDetails.Modetype = UIMode.Edit;;
          this.candidateOtherDetails.Id = this.Id != 0 ? this._NewCandidateDetails.CandidateOtherData.Id : 0;
          this.candidateOtherDetails.LstCandidateStatutoryDtls = (this.lstStatutoryDetails.length != 0 ? this.lstStatutoryDetails : null);


          this.candidateOfferDetails.LstCandidateRateSet = this.lstRateSetDetails;
          this.candidateDetails.CandidateOtherData = this.candidateOtherDetails;
          this.candidateDetails.CandidateCommunicationDtls = this.candidateCommunicationDetails;

          console.log('reactiveForm', this.candidateDetails);


          // this.candidateDetails.candidateOtherData.lstCandidateStatutoryDtls = (this.candidateOtherDetails.lstCandidateStatutoryDtls);
          // this.candidateDetails.workPermits.push(this.workPermitDetails);
          // this.candidateOfferDetails.lstCandidateRateSet.push(this.candidateRateSetDetails);
          this.candidateDetails.Gender = this.candidateDetails.Gender == null ? 0 : this.candidateDetails.Gender;

          if (this.Id != 0) {

            this.candidateDetails.Modetype = UIMode.Edit;
            this.candidateModel.NewCandidateDetails = this.candidateDetails;
            this.candidateOfferDetails.ModuleTransactionId = 0;
          }
          else {
            this.candidateDetails.Modetype = UIMode.None;
            this.candidateModel = _CandidateModel;
            this.candidateModel.NewCandidateDetails = this.candidateDetails;

          }


          console.log(JSON.stringify(this.candidateModel));

          let candidate_req_json = this.candidateModel;
          this.onboardingService.putCandidate(JSON.stringify(candidate_req_json)).subscribe((data: any) => {

            ``
            let apiResponse: apiResponse = data;
            try {
              if (apiResponse.Status) {


                if (index == "Submit") {
                  this.candidateModel = apiResponse.dynamicObject;
                  let _NewCandidateDetails: CandidateDetails = this.candidateModel.NewCandidateDetails;

                  this.workFlowInitiation.Remarks = "";
                  this.workFlowInitiation.EntityId = _NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
                  this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
                  this.workFlowInitiation.CompanyId = this.CompanyId;
                  this.workFlowInitiation.ClientContractId = _NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId;
                  this.workFlowInitiation.ClientId = _NewCandidateDetails.LstCandidateOfferDetails[0].ClientId;

                  this.workFlowInitiation.ActionProcessingStatus = 4000;
                  this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
                  this.workFlowInitiation.WorkFlowAction = 1;
                  this.workFlowInitiation.RoleId = this.RoleId;
                  this.workFlowInitiation.DependentObject = (this.candidateModel.NewCandidateDetails);
                  this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_submit;

                  this.finalSubmit(this.workFlowInitiation, "submit");
                } else {

                  if (this.deleted_DocumentIds_List.length > 0) {

                    this.deleted_DocumentIds_List.forEach(e => {

                      this.doDeleteFile(e.Id, e);
                    });

                  }


                  if (this.localURL_Path) {
                    var dynamicobj = {} as any;
                    dynamicobj = (apiResponse.dynamicObject);
                    var objString = dynamicobj["NewCandidateDetails"];
                    this._NewCandidateDetails = dynamicobj["NewCandidateDetails"];
                    this.Id = Number(objString.Id);
                    this.candidateModel = (apiResponse.dynamicObject);
                    this.loadingScreenService.stopLoading();
                    this.alertService.showSuccess("Your details has been saved successfully!");

                    // page do refresh done here
                    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                    this.router.onSameUrlNavigation = 'reload';
                    let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
                    this.router.navigate(['onboarding/candidate_information'], {
                      queryParams: {
                        "Idx": btoa(this.Id.toString()),
                        "Cdx": btoa(_CandidateId.toString()),
                      }
                    });
                    // this.router.navigateByUrl('success');
                  } else {

                    var dynamicobj = {} as any;
                    dynamicobj = (apiResponse.dynamicObject);
                    var objString = dynamicobj["NewCandidateDetails"];
                    this._NewCandidateDetails = dynamicobj["NewCandidateDetails"];
                    this.Id = Number(objString.Id);
                    this.candidateModel = (apiResponse.dynamicObject);
                    console.log('new candi', this._NewCandidateDetails);

                    // this.Id = dynamicobj.NewCandidateDetails.Id;
                    // var path = localStorage.getItem('previousPath');
                    // this.router.navigateByUrl(path);
                    this.loadingScreenService.stopLoading();

                    this.alertService.showSuccess("Your candidate has been saved successfully!");

                    // page do refresh done here
                    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                    // this.router.onSameUrlNavigation = 'reload';
                    // let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
                    // this.router.navigate(['app/onboarding/onboarding'], {
                    //   queryParams: {
                    //       "Idx": btoa(this.Id.toString()),
                    //       "Cdx": btoa(_CandidateId.toString()),
                    //   }
                    // });
                    // this.router.navigate(["/app/onboarding/onboarding?Idx=MTUxNDM%3D&Cdx=MTUxNDM%3D"]);
                    // window.location.reload();
                    this._location.back();
                    // this.alertService.confirmSwal("Are you sure you want to navigate away from this page?", "The data was saved successfully, Press OK to continue, or Cancel to stay on the current page.", "Yes, OK").then(result => {
                    //   this._location.back();
                    // })
                    //   .catch(error => {

                    //   });
                  }


                }
                // this.alertService.showSuccess("Canidate added successfully");

              }
              else {

                this.alertService.showWarning("Failed!   Candidate save wasn't completed " + apiResponse.Message != null ? apiResponse.Message : ''), this.loadingScreenService.stopLoading()
              };
            } catch (error) {

              { this.alertService.showWarning(error + " Failed!   Candidate save wasn't completed "), this.loadingScreenService.stopLoading() };
            }

          },
            (err) => {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(`Something is wrong!  ${err}`);
              console.log("Something is wrong! :  ", err);

            });


        } catch (error) {

          { this.alertService.showWarning(error + " Failed!   Candidate save wasn't completed"), this.loadingScreenService.stopLoading() };

        }


      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }


  clearListofItems() {

    this.lstAddressDetails = [];
    this.lstFamilyDetails = [];
    this.lstExperienceDetails = [];
    this.lstBankDetails = [];
    this.lstQualificationDetails = [];
    this.lstWorkPermitDetails = [];
    this.lstStatutoryDetails = [];
    this.lstContactDetails = [];
    this.lstRateSetDetails = [];
    this.lstCandidateOfferDetails = [];
    // this.lstDocumentDetails = [];
    this.lstClientApporval = [];

  }


  finalSubmit(workFlowJsonObj: WorkFlowInitiation, fromWhich: any): void {

    console.log(workFlowJsonObj);
    this.onboardingService.postWorkFlow(JSON.stringify(workFlowJsonObj)).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          if (this.localURL_Path) {
            this.loadingScreenService.stopLoading();
            // this.router.navigateByUrl('success');
            this.router.navigate(['success'], {
              queryParams: {
                "Cdx": btoa(this.ClientId)
              }
            });
          } else {
            this.loadingScreenService.stopLoading();
            this._location.back();
            this.alertService.showSuccess(`Your candidate has been ${fromWhich == "submit" ? "submitted" : "rejected"} successfully! ` + apiResult.Message != null ? apiResult.Message : '');

          }

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

  AgeCalculator(birthdate) {

    if (birthdate) {
      var timeDiff = Math.abs(Date.now() - new Date(birthdate).getTime());
      return Math.floor(timeDiff / (1000 * 3600 * 24) / 365.25);

    }
  }


  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        try {
          this.loadingScreenService.startLoading();

          if (this.sessionService.getSessionStorage("IsSeparatedCandidate") != null && this.sessionService.getSessionStorage("IsSeparatedCandidate") == 'true') {
            this.doReUpdateSeparatedCandidateOfferAsActive();
          }
          if (this.unsavedDocumentLst.length > 0) {

            this.unsavedDocumentLst.forEach(e => {

              this.doDeleteFile(e.Id, e);
            });

          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
        }

        this.loadingScreenService.stopLoading();
        console.log(this.previousUrl);
        // var path = localStorage.getItem('previousPath');
        // this.router.navigateByUrl(path);
        this._location.back();
        // this.router.navigate(['app/onboarding/onboarding']);

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }



  onSelect(selectedItem: any, e) {
    console.log("Selected item Id: ", selectedItem, e.target.files); // You get the Id of the selected item here
  }

  setClickedRow(item, i) {
    console.log(item);

  }


  public onFileSelected(event: EventEmitter<File[]>, i) {

    this.currentId = i.DocumentName;
    this.isUploadFlag = true;
    this.spinner_fileuploading = true;
    const file: File = event[0];
    // const file.even
    console.log(file);
    console.log(i)

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {

      var filesize = (file.size / 1024);
      // iSize = (Math.round(iSize * 100) / 100)


      var filename = (file.name);
      var filebytes = ((reader.result as string).split(",")[1]);
      this.doFileUpload(filebytes, filename, filesize, i);

    };



  }

  documentChecking() {
    this.documentTbl.forEach(element => {


      if (element.IsMandatory == true) {

        if (element.DocumentNumber == 0 || element.DocumentNumber == undefined || element.FileName == "") {
          document.getElementById(element.DocumentName + '_border').style.color = 'red';

        }
      }
    });
  }

  doFileUpload(filebytes, filename, filesize, i) {




    try {

      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this.CandidateId;

      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.ClientContractId;
      objStorage.ClientId = this.ClientId;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";



      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {

        console.log(res);
        this.spinner_fileuploading = false;
        let apiResult: apiResult = (res);
        if (apiResult.Status && apiResult.Result != "") {

          this.documentTbl.forEach(element => {

            if (element.DocumentName === i.DocumentName) {

              element.FileName = filename;
              element.DocumentId = apiResult.Result;
              element.Status = ApprovalStatus.Pending;
              element.UIMode = UIMode.Edit;
              console.log(element);

            }
          });


          this.unsavedDocumentLst.push({
            Id: apiResult.Result
          })


        }
        else {
          this.alertService.showWarning("Failed to upload. Please try after sometimes!")
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.spinner_fileuploading = true;
    }

  }

  onFileUpload(e, item) {

    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      // const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);

      // if (!file.type.match(pattern)) {
      //   alert('You are trying to upload not Image. Please choose image.');
      //   return;
      // }


      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {

        this.documentTbl.forEach(element => {

          if (element.DocumentName === item.DocumentName) {
            console.log(element.DocumentName);
            console.log(item.DocumentName);


            element.FileName = file.name;
            element.FileUrl = (reader.result as string).split(",")[1];
          }
          else {
            element.FileName = "";
            element.FileUrl = null;
          }
        });

      };

    }

  }
  forIdentity(item, event) {


    this.documentTbl.forEach(element => {
      if (element.Status != ApprovalStatus.Approved) {
        if (element.IsIdentity == item.IsIdentity && element.DocumentName == item.DocumentName) {

        }
        else {

          if (element.IsIdentity) {

            element.IsIdentity = false;
          }
        }
      }
    });


  }

  forAddress(item, event) {


    this.documentTbl.forEach(element => {
      if (element.Status != ApprovalStatus.Approved) {
        if (element.IsAddress === item.IsAddress && element.DocumentName == item.DocumentName) {
        }
        else {
          if (element.IsAddress) {
            element.IsAddress = false;
          }
        }
      }
    });



  }

  deleteFile(item) {


    this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted,  you cannot undo this action.", "OK, Delete").then(result => {
      this.loadingScreenService.startLoading();
      this.documentTbl.forEach(element => {

        console.log('dupliac', this.duplicateDocumentTbl);
        console.log('dufffpliac', this.documentTbl);


        if (element.DocumentName == item.DocumentName) {

          element.FileName = "";
          element.FileUrl = null;


          if (element.Id != 0) {


            var dupelement = this.duplicateDocumentTbl.find(a => a.Id == element.Id);
            dupelement.Modetype = UIMode.Delete;
            dupelement.FileName = "";
            if (element.IsIdentity && this.duplicateDocumentTbl.find(a => a.Id == element.Id && a.IsIdentity == true)) {
              this.deletedLstCandidateDocument.push(dupelement);
            }
            if (element.IsAddress && this.duplicateDocumentTbl.find(a => a.Id == element.Id && a.IsAddress == true)) {
              this.deletedLstCandidateDocument.push(dupelement);
            }

            element.Id = 0;

          } else {

            this.doDeleteFile(element.DocumentId, element);

          }


        }



      });

      this.loadingScreenService.stopLoading()

    })
      .catch(error => this.loadingScreenService.stopLoading());


  }

  doDeleteFile(Id, element) {


    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var candidateDocumentDelete = [];

        this.fileuploadService.deleteObjectStorage((Id)).subscribe((res) => {

          console.log(res);

          if (res.Status) {

            if (this.unsavedDocumentLst.length > 0) {




              var index = this.unsavedDocumentLst.map(function (el) {
                return el.Id
              }).indexOf(Id);

              // Delete  the item by index.
              this.unsavedDocumentLst.splice(index, 1);

            }
            // if (element != null) {

            //   candidateDocumentDelete.push({
            //     CandidateId: this.CandidateId,
            //     IsSelfDocument: true,
            //     DocumentId: element.DocumentId,
            //     DocumentCategoryId: 3,
            //     DocumentTypeId: element.DocumentTypeId,
            //     DocumentNumber: element.DocumentNumber,
            //     FileName: element.FileName,
            //     Remarks: "empty",
            //     ValidFrom: element.ValidFrom,
            //     ValidTill: element.ValidTill,
            //     Status: 1,
            //     IsOtherDocument: false,
            //     storageDetails: null,
            //     Modetype: UIMode.Delete,
            //     DocumentType: null,
            //     DocumentCategoryName: null,
            //     Id: this.Id
            //   })

            //   this.fileuploadService.deletCandidateDocuments((JSON.stringify(candidateDocumentDelete[0]))).subscribe((res) => {

            //     console.log('dlete', res);


            //   });

            // }
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
    // return promise;
  }



  slickGridDeleting() {

  }





  deleteCandidateDocuments() {

  }

  public a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  public b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

  inWords(num) {
    // if ((num = num).length > 9) return 'overflow';
    let n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (this.a[Number(n[1])] || this.b[n[1][0]] + ' ' + this.a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (this.a[Number(n[2])] || this.b[n[2][0]] + ' ' + this.a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (this.a[Number(n[3])] || this.b[n[3][0]] + ' ' + this.a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (this.a[Number(n[4])] || this.b[n[4][0]] + ' ' + this.a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (this.a[Number(n[5])] || this.b[n[5][0]] + ' ' + this.a[n[5][1]]) + 'only ' : '';
    return str;
  }


  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }


  previewFile(item, index): void {

    console.log(item);
    this.loadingScreenService.startLoading();
    this.fileuploadService.getObjectStorage(item.DocumentId).subscribe((result) => {

      if (result.Status && result.Result != "") {

        console.log(result.Result);

        const src = `data:image/svg;${result.Result.Content}`;
        const caption = item.FileName;
        const thumb = item.DocumentName;
        // open lightbox
        let ale = [];
        ale.push({
          src: src,
          caption: caption,
          thumb: thumb
        })
        this._lightbox.open(ale, index);
        this.loadingScreenService.stopLoading();
      } else {
        this.alertService.showInfo("Preview is not available. Please try again after sometime!");
        this.loadingScreenService.stopLoading();
      }


    })

  }

  /* #region  Client Approval accordion */
  addAttachment(json_edit_object) {

    const modalRef = this.modalService.open(ApprovalModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.RequestType = this.candidatesForm.get('requestFor').value == "OL" ? RequestType.OL : RequestType.AL;
    var objStorageJson = JSON.stringify({  CandidateName : this.candidatesForm.get('firstName').value , CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId });
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    modalRef.componentInstance.ClientLocationList = this.ClientLocationList;
    modalRef.result.then((result) => {
      console.log(result);

      // if (result.ApprovalFor == 4 && this.candidatesForm.get('requestFor').value == 'OL') {

      //   this.onRequestFor("AL");
      //   this.candidatesForm.controls['requestFor'].setValue("AL");

      // }
      // else {

      //   this.onRequestFor("AL");
      //   this.candidatesForm.controls['requestFor'].setValue("AL");
      // }

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

      console.log(this.candidateOfferDetails);

      // this.clientApprovalTbl.forEach(element => {

      // if (result.ApprovalFor == 4 && this.candidatesForm.get('requestFor').value == 'OL') {

      //   this.onRequestFor("AL");
      //   this.candidatesForm.controls['requestFor'].setValue("AL");

      // }
      // if (result.ApprovalFor != 4 && this.candidatesForm.get('requestFor').value == 'OL') {

      //   this.onRequestFor("OL");
      //   this.candidatesForm.controls['requestFor'].setValue("OL");
      // }

      // });

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

      //if (this.candidatesForm.get('sourceType').value != 2) {
      if (this.candidatesForm.get('requestFor').value == "OL") {
        var existType = this.clientApprovalTbl.find(a => a.ApprovalFor == 4) != null ? true : false;
        if (existType) {

          this.candidatesForm.controls['requestFor'].setValue("AL");
          this.onRequestFor("AL");
          if (ConfigJson.RequestType_isDisabled == true) {
            this.candidatesForm.controls['requestFor'].disable();
          }
        }
      }

      else if (this.candidatesForm.get('requestFor').value == "AL") {
        var existType = this.clientApprovalTbl.find(a => a.ApprovalFor == 4) == null ? true : false;
        if (existType) {

          this.candidatesForm.controls['requestFor'].setValue("OL");
          this.onRequestFor("OL");
          this.candidatesForm.controls['requestFor'].enable();
        }
      }
      //}


    }).catch((error) => {
      console.log(error);
    });
  }

  editApprovalFile(item, indx) {

    console.log(item);


    this.addAttachment(item);




  }

  deleteApprovalFile(item) {


    this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted, you cannot undo this action.", "Ok, Delete").then(result => {
      this.loadingScreenService.startLoading();
      if (item.ApprovalFor == '4') {

        this.onRequestFor("OL");
        this.candidatesForm.controls['requestFor'].setValue("OL");

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

          //search for the index.
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
  /* #endregion */

  getRequired(controlName) {

    let _userAccessControl = this.userAccessControl.filter(z => (this.GroupControlName == "" ? true : this.GroupControlName == z.GroupControlName) && z.PropertyName === "required" && z.PropertyName != "div" && z.PropertyName != "button" && z.PropertyName != "accordion");
    var _filter = _userAccessControl.find(a => (a.ControlName == controlName));
    if (_filter != undefined) {
      return _filter.EditValue != "false" && _filter.EditValue != null && _filter.EditValue == "true" ? "*" : "";
    } else {
      return "";
    }
  }

  getLetterSpace(string) {
    return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }


  async rejectCandidate() {



    this.alertService.confirmSwal("Are you sure?", "Are you sure you want to reject this candidate?", "Yes, Reject").then(result => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        animation: false,
        allowEscapeKey: false,
        showCancelButton: false, // There won't be any cancel button
        input: 'textarea',
        inputPlaceholder: 'Type your message here...',
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

        this.loadingScreenService.startLoading();
        let jsonObj = inputValue;
        let jsonStr = jsonObj.value;

        this.workFlowInitiation.Remarks = jsonStr;
        this.workFlowInitiation.EntityId = this.CandidateId;
        this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
        this.workFlowInitiation.CompanyId = this.CompanyId;
        this.workFlowInitiation.ClientContractId = this.ClientContractId;
        this.workFlowInitiation.ClientId = this.ClientId;

        this.workFlowInitiation.ActionProcessingStatus = 4000;
        this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
        this.workFlowInitiation.WorkFlowAction = 1;
        this.workFlowInitiation.RoleId = this.RoleId;
        this.workFlowInitiation.DependentObject = (this.candidateModel.OldCandidateDetails);
        this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_reject;

        console.log(this.workFlowInitiation);

        this.finalSubmit(this.workFlowInitiation, "other");

        // this.loadingScreenService.stopLoading();
      })






    })
      .catch(error => this.loadingScreenService.stopLoading());

  }

  redirectTo(uri: string) {
    this.router.routeReuseStrategy.shouldReuseRoute = function () { return false; };

    let currentUrl = this.router.url + '?';

    this.router.navigateByUrl(currentUrl)
      .then(() => {
        this.router.navigated = false;
        this.router.navigate([this.router.url]);
      });
  }

  createNew() {

    const modalRef = this.modalService.open(WorklocationModalComponent, this.modalOption);
    modalRef.componentInstance.id = 0;
    var objStorageJson = JSON.stringify({  CandidateName : this.candidatesForm.get('firstName').value , CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;

    modalRef.result.then((result) => {

      console.log(result);
      if (result != "Modal Closed") {
        this.doAccordionLoading("isOfferInfo");
        this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(result.Id) : null;
      }
    }).catch((error) => {
      console.log(error);
    });


  }


  /* #region  CC Email address book input ccmailtags function */

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent): void {
    this.CCemailMismatch = false;
    const inputValue: string = this.candidatesForm.controls.ccemail.value;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue);
        this.candidatesForm.controls.ccemail.setValue('');
      }
    }
  }

  addTag(tag: any): void {
    console.log((tag));


    if (tag) {
      const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (matches) {
        this.CCemailMismatch = false;
        if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
          tag = tag.slice(0, -1);
        }
        if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
          this.ccmailtags.push(tag);
        }
      } else {
        this.CCemailMismatch = true;
      }
      // return matches ? null : { 'invalidEmail': true };
    } else {

      return null;
    }


  }

  removeTag(tag?: string): void {
    if (!!tag) {
      pull(this.ccmailtags, tag); // lodash 
    } else {
      this.ccmailtags.splice(-1);
    }
  }


  onchangeCC(event) {

    let tag = event.target.value;
    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      this.CCemailMismatch = false;
      if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
        tag = tag.slice(0, -1);
      }
      if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
        this.ccmailtags.push(tag);
        event.target.value = null;
      }
    } else {
      this.CCemailMismatch = true;
    }
  }

  doReUpdateSeparatedCandidateOfferAsActive() {

    let request_params = `candidateId=${this.CandidateId}`;
   
    this.searchService.ReUpdateSeparatedCandidateOfferAsActive(request_params).subscribe((result) => {
      
    })
  }

  /* #endregion */

  ngOnDestroy(): void {
    sessionStorage.removeItem('isNewTransfer')
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
  }

  
  // document_file_view(item, whichdocs) {
  //   console.log('item', item);
  //   $("#popup_viewDocs").modal('show');
  //   this.documentURL = null;
  //   this.documentURLId = null;
  //   this.documentURLId = item.DocumentId;
  //   var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
  //   if (contentType === 'application/pdf' || contentType.includes('image')) {
  //     this.fileuploadService.getObjectById(item.DocumentId)
  //       .subscribe(dataRes => {

  //         if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
  //           return;
  //         }
  //         let file = null;
  //         var objDtls = dataRes.Result;
  //         const byteArray = atob(objDtls.Content);
  //         const blob = new Blob([byteArray], { type: contentType });
  //         file = new File([blob], objDtls.ObjectName, {
  //           type: contentType,
  //           lastModified: Date.now()
  //         });
  //         if (file !== null) {
  //           var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
  //           this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
  //           console.log(' DOCUMENT URL :', this.documentURL);

  //         }
  //       });
  //   } else if (contentType === 'application/msword' ||
  //     contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  //     var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
  //     var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
  //     this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
  //   }

  // }


  

  // 07-01-2020 TO-D-ITEMS AS WELL AS NEW IMPLEMENTATION
  // 

  // earlier version of file upload

  // document_file_view(item, whichdocs) {
  //   console.log('item', item);
  //   $("#popup_viewDocs").modal('show');
  //   this.documentURL = null;
  //   this.documentURLId = null;
  //   this.documentURLId = item.DocumentId;
  //   var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
  //   if (contentType === 'application/pdf' || contentType.includes('image')) {
  //     this.fileuploadService.getObjectById(item.DocumentId)
  //       .subscribe(dataRes => {

  //         if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
  //           return;
  //         }
  //         let file = null;
  //         var objDtls = dataRes.Result;
  //         const byteArray = atob(objDtls.Content);
  //         const blob = new Blob([byteArray], { type: contentType });
  //         file = new File([blob], objDtls.ObjectName, {
  //           type: contentType,
  //           lastModified: Date.now()
  //         });
  //         if (file !== null) {
  //           var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
  //           this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
  //           console.log(' DOCUMENT URL :', this.documentURL);

  //         }
  //       });
  //   } else if (contentType === 'application/msword' ||
  //     contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
  //     var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
  //     var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
  //     this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
  //   }

  // }


  // /* #region After  JSZip Bank Document View */

  // ViewBank
  bankdoc_files_view() {
    $("#popup_viewBankDocs").modal('show');
  }
  document_file_view(item, whichdocs) {
    if (whichdocs == "BankDoc") {
      this.modal_dismiss5();
    }
    // JSZIP
    console.log('item', item);
    $("#popup_viewDocs").modal('show');
    let modalContent: any = $('#popup_viewDocs');
    // modalContent.draggable({
    //   handle: '.modal-header',
    //   revert: true,
    //   revertDuration: 300
    // });

    this.downLoadFileName = item.name;
    var contentType = this.fileuploadService.getContentType(item.name);
    var blob = new Blob([item._data.compressedContent]);
    var file = new File([blob], item.name, {
      type: typeof item,
      lastModified: Date.now()
    });
    console.log(file);
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var base64String = (reader.result as string).split(",")[1];
      console.log(reader.result);
      if (file !== null) {
        var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
        this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
        console.log(' DOCUMENT URL :', this.documentURL);

      }
    }

    // JSZIP    

    // if (contentType === 'application/zip' || contentType.includes('image')) {
    //   this.fileuploadService.getObjectById(item.DocumentId)
    //     .subscribe(dataRes => {

    //       if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
    //         return;
    //       }
    //       let file = null;
    //       // const byteArray = atob(objDtls.Content);
    //       // const blob = new Blob([byteArray], { type: contentType });
    //       // file = new File([blob], objDtls.ObjectName, {
    //       //   type: contentType,
    //       //   lastModified: Date.now()
    //       // });
    //       // if (file !== null) {
    //       //   var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
    //       //   this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
    //       //   console.log(' DOCUMENT URL :', this.documentURL);

    //       // }
    //     });
    // // } else if (contentType === 'application/msword' ||
    // //   contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    // //   var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
    // //   var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
    // //   this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    // // }

  }

  downLoadFile() {
    saveAs(this.documentURL);
  }
  modal_dismiss5() {
    $("#popup_viewBankDocs").modal('hide');
  }
  // /* #endregion */

  modal_dismiss4() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs").modal('hide');
  }



  
  duplicateCheck() {
    console.log('sss');

    if (this.utitlityService.isNullOrUndefined(this.candidatesForm.get('firstName').value) == true) {
      this.alertService.showWarning('Please enter the Candidate Name');
      return;
    }

    else if (this.utitlityService.isNullOrUndefined(this.candidatesForm.get('email').value) == true) {
      this.alertService.showWarning('Candidate E-Mail is required');
      return;
    }
    else if (this.candidatesForm.get('email').valid == false) {
      this.alertService.showWarning('Please enter valid email (pattern mismatch)');
      return;
    }

    else if (this.utitlityService.isNullOrUndefined(this.candidatesForm.get('mobile').value) == true) {
      this.alertService.showWarning('Please enter the Candidate Mobile No.');
      return;
    }
    else if (this.candidatesForm.get('mobile').valid == false) {
      this.alertService.showWarning('Mobile No should be minimum 10 characters');
      return;
    }

    else if (this.utitlityService.isNullOrUndefined(this.candidatesForm.get('dateOfBirth').value) == true) {
      this.alertService.showWarning('Please enter the Date of Birth');
      return;
    }

    var date = moment(this.candidatesForm.get('dateOfBirth').value);
    if (!date.isValid) {
      this.alertService.showWarning('Please enter valid Date of Birth (DD-MM-YYYY)');
      return;
    }



    try {
      this.loadingScreenService.startLoading();
      this.isInvalidCandidateInformation = false;
      this.DuplicateCheckMessage = '';
      var duplicateCandidateDetails = new DuplicateCandidateDetails();
      duplicateCandidateDetails.CandidateId = this.CandidateId == 0 ? 0 : this.CandidateId;
      this.candidatesForm.controls['firstName'] != null ? duplicateCandidateDetails.FirstName = this.candidatesForm.get('firstName').value == null || this.candidatesForm.get('firstName').value == "" ? "" : this.candidatesForm.get('firstName').value : null;
      this.candidatesForm.controls['dateOfBirth'] != null ? duplicateCandidateDetails.dateOfBirth = this.candidatesForm.get('dateOfBirth').value == null ? null : this.datePipe.transform(new Date(this.DOB).toString(), "yyyy-MM-dd") : null;
      this.candidatesForm.controls['mobile'] != null ? duplicateCandidateDetails.PrimaryMobile = this.candidatesForm.get('mobile').value == null || this.candidatesForm.get('mobile').value == "" ? "" : this.candidatesForm.get('mobile').value : null;
      this.candidatesForm.controls['email'] != null ? duplicateCandidateDetails.PrimaryEmail = this.candidatesForm.get('email').value == null || this.candidatesForm.get('email').value == "" ? "" : this.candidatesForm.get('email').value : null;
      console.log('duplicateCandidateDetails',duplicateCandidateDetails);
      
      this.onboardingService.ValidateCandidateInformation(duplicateCandidateDetails).subscribe((result) => {
        console.log('result', result);

        let apiResult: apiResult = (result);
        this.alertService.showSuccess("The candidate was successfully validated.");
        if (apiResult.Status && apiResult.Result != null) {
          this.loadingScreenService.stopLoading();
        } else if (!apiResult.Status && apiResult.Message != null && apiResult.Message != '') {
          this.isInvalidCandidateInformation = true;
          this.DuplicateCheckMessage = apiResult.Message;
          this.loadingScreenService.stopLoading();
        } else {
          this.loadingScreenService.stopLoading();
        }
      }, err => {
        this.loadingScreenService.stopLoading();
      })
    } catch (error) {
      this.loadingScreenService.stopLoading();
      console.log('ex error :', error);

    }

  }
  


  document_file_view_old(item, whichdocs) {
    console.log('item', item);
    $("#popup_viewDocs").modal('show');
    // whichdocs == "Document" ? item['DocumentId'] = item.CandidateDocumentId : true;
    // whichdocs == "Document" ? item['FileName'] = item.DocumentName : true;

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


  
  viewApprovalFile(item) {
    item['DocumentId'] = item.ObjectStorageId;
    item['FileName'] = item.DocumentName;
    this.document_file_view_old(item, 'Documents');
  }
  viewUploadedFile(item) {
    this.document_file_view_old(item, 'Documents');

  }

  checktest() {
    let req_params = `candidateId=${15066}&acceptanceStatus=${1}&rejectionReason=${0}&remarks=${null}`;
    this.candidateService.rejectAcceptanceLetter(req_params).subscribe((res) => {
      console.log('setere');

    });
  }

  uploadBankFile() {
    this.addBank(undefined, "StaticMode");
  }

  onChangeRelationship(event) {
    this.nameofrelationship = this.relationship1.find(a => a.id == event.id).name;

  }

  // Profile and Signature New changes

  readURL(input) {
    if (this.profileImageDocumentId != null) {
      this.deleteProfileImgFile('Profile');
    }

    if (input.target.files && input.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.target.files[0]);
      reader.onloadend = (e) => {
        const FileName = input.target.files[0].name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, FileName, 'Profile')
        this.contentmodalurl = reader.result;
        //$('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
        $('#imagePreview').hide();
        $('#imagePreview').fadeIn(650);

      }
    }
  }

  readURL1(input) {
    if (this.signatureDocumentId != null) {
      this.deleteProfileImgFile('Signature');
    }

    if (input.target.files && input.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.target.files[0]);
      reader.onloadend = (e) => {
        const FileName = input.target.files[0].name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, FileName, 'Signature')
        this.contentmodalurl1 = reader.result;
        // $('#imagePreview').css('background-image', 'url(' + e.target.result + ')');
        $('#imagePreview').hide();
        $('#imagePreview').fadeIn(650);

      }
    }
  }

  doAsyncUpload(filebytes, filename, whichSection) {
    // if (this.router.url == '')

    try {

      this.loadingScreenService.startLoading();
      // this.Customloadingspinner.show();
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this.CandidateId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = 0;
      objStorage.ClientId = 0;
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

            whichSection == 'Profile' ? this.profileImageDocumentId = apiResult.Result : this.signatureDocumentId = apiResult.Result;
            if (this.lstDocumentDetails_additional != null && this.lstDocumentDetails_additional.length > 0) {
              this.lstDocumentDetails_additional.forEach(element => {
                if (element.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == (whichSection == 'Profile' ? 'ProfileAvatar' : 'CandidateSignature')).DocumentTypeId) {
                  element.Modetype = UIMode.Delete;
                  this.delete_ProfileAvatarDocument.push(element);
                }
              });
            }
            if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {

              if (this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == (whichSection == 'Profile' ? 'ProfileAvatar' : 'CandidateSignature')).DocumentTypeId) == true) {
                this.unsavedDocumentLst.push(this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == (whichSection == 'Profile' ? 'ProfileAvatar' : 'CandidateSignature')).DocumentTypeId).DocumentId);
              } else {
                let ListDocumentList: CandidateDocuments = new CandidateDocuments();
                ListDocumentList.Id = 0;
                ListDocumentList.CandidateId = this.Id != 0 ? this.CandidateId : 0;
                ListDocumentList.IsSelfDocument = false;
                ListDocumentList.DocumentId = whichSection == 'Profile' ? this.profileImageDocumentId : this.signatureDocumentId;
                ListDocumentList.DocumentCategoryId = 0;
                ListDocumentList.DocumentTypeId = this.DocumentCategoryist.find(a => a.Code == (whichSection == 'Profile' ? 'ProfileAvatar' : 'CandidateSignature')).DocumentTypeId;
                ListDocumentList.DocumentNumber = '';
                ListDocumentList.FileName = whichSection == 'Profile' ? `profileavatar_${this.candidatesForm.get('firstName').value.replace(/\s/g, '')}.png` : `candidateSignature_${this.candidatesForm.get('firstName').value.replace(/\s/g, '')}.png`;
                ListDocumentList.ValidFrom = null;
                ListDocumentList.ValidTill = null;
                ListDocumentList.Status = ApprovalStatus.Approved;
                ListDocumentList.IsOtherDocument = true;
                ListDocumentList.Modetype = UIMode.Edit;
                ListDocumentList.DocumentCategoryName = "";
                ListDocumentList.StorageDetails = null;
                ListDocumentList.EmployeeId = 0;
                this.new_ProfileAvatarDocument.push(ListDocumentList);
              }
            } else {
              let ListDocumentList: CandidateDocuments = new CandidateDocuments();
              ListDocumentList.Id = 0;
              ListDocumentList.CandidateId = this.Id != 0 ? this.CandidateId : 0;
              ListDocumentList.IsSelfDocument = false;
              ListDocumentList.DocumentId = whichSection == 'Profile' ? this.profileImageDocumentId : this.signatureDocumentId;
              ListDocumentList.DocumentCategoryId = 0;
              ListDocumentList.DocumentTypeId = this.DocumentCategoryist.find(a => a.Code == (whichSection == 'Profile' ? 'ProfileAvatar' : 'CandidateSignature')).DocumentTypeId;
              ListDocumentList.DocumentNumber = '';
              ListDocumentList.FileName = whichSection == 'Profile' ? `profileavatar_${this.candidatesForm.get('firstName').value.replace(/\s/g, '')}.png` : `candidateSignature_${this.candidatesForm.get('firstName').value.replace(/\s/g, '')}.png`;
              ListDocumentList.ValidFrom = null;
              ListDocumentList.ValidTill = null;
              ListDocumentList.Status = ApprovalStatus.Approved;
              ListDocumentList.IsOtherDocument = true;
              ListDocumentList.Modetype = UIMode.Edit;
              ListDocumentList.DocumentCategoryName = "";
              ListDocumentList.StorageDetails = null;
              ListDocumentList.EmployeeId = 0
              this.new_ProfileAvatarDocument.push(ListDocumentList);
            }

            this.loadingScreenService.stopLoading();
            // this.Customloadingspinner.hide();
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file")
            this.isLoading = true;

          }
          else {

            this.loadingScreenService.stopLoading();
            // this.Customloadingspinner.hide();
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message)
          }
        } catch (error) {

          this.loadingScreenService.stopLoading();
          // this.Customloadingspinner.hide();
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to upload! " + error)
        }

      }), ((err) => {

      })

    } catch (error) {

      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.FileName = null;
      this.alertService.showWarning("An error occurred while trying to upload! " + error)
      this.isLoading = true;
    }

  }

  deleteProfileImgFile(action) {
    this.fileuploadService.deleteObjectStorage((action == 'Profile' ? this.profileImageDocumentId : this.signatureDocumentId)).subscribe((res) => {
      var index = this.unsavedDocumentLst.map(function (el) {
        return el.Id
      }).indexOf(this.DocumentId);
      this.unsavedDocumentLst.splice(index, 1)
      action == 'Profile' ? this.profileImageDocumentId = null : this.signatureDocumentId = null;
    }), ((err) => {

    })

  }

  
  //NEW Change
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


                // let TempList = [];
                // TempList.push({
                //     contentType : 
                // })
              }
            });
          });
         

        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }

  close_documentviewer(){
    this.documentURLId = null;
    this.downLoadFileName =  null;
    $("#documentviewer").modal('hide');

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

}

