import { Component, OnInit, ViewChild, Inject, OnDestroy, ElementRef, EventEmitter, Renderer2 } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs/Rx';
import {
  AngularGridInstance,
  Column,
  Formatters,
  GridOption,
  OnEventArgs,
  Formatter,

} from 'angular-slickgrid';
import { CandidateService } from 'src/app/_services/service/candidate.service';

import { DatePipe } from '@angular/common';
import Swal from "sweetalert2";
import { Lightbox } from 'ngx-lightbox';
import 'rxjs/add/operator/pairwise';
import { DomSanitizer } from '@angular/platform-browser';
import { Location } from '@angular/common';

// services

import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { UIBuilderService } from '../../../_services/service//UIBuilder.service';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { StatesService } from '../../../_services/service/states.service';
import { FileUploadService } from '../../../_services/service/fileUpload.service';
// directives

import { enumHelper } from '../../../shared/directives/_enumhelper';

// modal popup
import { WorkexperienceModalComponent, _NoticePeriod } from 'src/app/shared/modals/workexperience-modal/workexperience-modal.component';
import { NomineeModalComponent } from 'src/app/shared/modals/nominee-modal/nominee-modal.component';
import { AcademicModalComponent } from 'src/app/shared/modals/academic-modal/academic-modal.component';
import { BankModalComponent } from 'src/app/shared/modals/bank-modal/bank-modal.component';

// model calss
import { SourceType, TenureType, CandidateOfferDetails, RequestType, OnBoardingType, IsClientApprovedBasedOn, OfferStatus } from '../../../_services/model/Candidates/CandidateOfferDetails';
import { Gender, Nationality, BloodGroup, MaritalStatus, GraduationType, CourseType, ScoringType, AcceptanceStatus } from '../../../_services/model/Base/HRSuiteEnums';
import { SalaryBreakUpType } from '../../../_services/model/PayGroup/PayGroup';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingInfo, ClientList, ClientContactList, RecruiterList, ClientContractList, MandatesAssignment, ExternalCandidateInfo, OnboardingAdditionalInfo, AdditionalColumns } from '../../../_services/model/OnBoarding/OnBoardingInfo';

import * as _ from 'lodash';
import { find, pull } from 'lodash';


import { CandidateInfo, CountryList } from '../../../_services/model/OnBoarding/CandidateInfo';
import { OfferInfo, IndustryList, ClientLocationList, PayGroupList, ZoneList, SkillCategoryList, LetterTemplateList } from '../../../_services/model/OnBoarding/OfferInfo';
import { CandidateDetails, CandidateStatus, DuplicateCandidateDetails, Approvals, ApprovalFor, ApproverType } from '../../../_services/model/Candidates/CandidateDetails';
import { CandidateModel, _CandidateModel } from '../../../_services/model/Candidates/CandidateModel';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { WorkPermit, WorkExperience, Qualification } from '../../../_services/model/Candidates/CandidateCareerDetails';
import { AdditionalPaymentProducts, CandidateRateset } from '../../../_services/model/Candidates/CandidateRateSet';
import { CandidateStatutoryDetails, CandidateOtherData } from '../../../_services/model/Candidates/CandidateOtherData';
import { UIMode } from '../../../_services/model/UIMode';
import { ContactDetails, AddressDetails, CommunicationCategoryType } from '../../../_services/model/Communication/CommunicationType';
import { CandidateCommunicationDetails } from '../../../_services/model/Candidates/CandidateCommunicationDetails';
import { apiResponse } from '../../../_services/model/apiResponse';
import { CommunicationInfo, StateList, CityList } from '../../../_services/model/OnBoarding/CommunicationInfo';
import { Claim, CandidateFamilyDetails, Relationship, ClaimType, _CustomCandidateFamilyDetails } from '../../../_services/model/Candidates/CandidateFamilyDetails';
import { WorkFlowInitiation, UserInterfaceControlLst } from '../../../_services/model/OnBoarding/WorkFlowInitiation';
import { CandidateBankDetails, BankBranchIdentifierType } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { BankInfo, BankList } from 'src/app/_services/model/OnBoarding/BankInfo';

import { Documents } from 'src/app/_services/model/OnBoarding/Document';
import { CandidateDocuments, ApprovalStatus, DocumentVerificationMode } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { DocumentInfo, DocumentCategoryist } from 'src/app/_services/model/OnBoarding/DocumentInfo';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';

import { PreviewCtcModalComponent } from 'src/app/shared/modals/preview-ctc-modal/preview-ctc-modal.component';

import { NgSelectComponent } from '@ng-select/ng-select';
import { ApprovalModalComponent } from 'src/app/shared/modals/approval-modal/approval-modal.component';
import { EntityType } from 'src/app/_services/model/Base/EntityType';

import { HeaderService } from 'src/app/_services/service/header.service';

import { MigrationInfo, ManagerList, LeaveGroupList, CostCodeList, PayPeriodList, OnboardingOperationalConfigurationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';

import * as moment from 'moment';
import { WorklocationModalComponent } from 'src/app/shared/modals/worklocation-modal/worklocation-modal.component';
import { environment } from "../../../../environments/environment";

import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { DynamicFieldDetails, DynamicFieldsValue, FieldValues } from 'src/app/_services/model/OnBoarding/DynamicFIeldDetails';
import { ControlElement } from '../../generic-form/form-models';
import { ESSService, EmployeeService, PagelayoutService } from 'src/app/_services/service';
import { DynamicfieldformComponent } from '../../generic-form/dynamicfieldform/dynamicfieldform.component';
import { CommunicationModalComponent } from 'src/app/shared/modals/communication-modal/communication-modal.component';
import * as JSZip from 'jszip'; //JSZip

import { NoPanDeclarationModelComponent } from 'src/app/shared/modals/no-pan-declaration-model/no-pan-declaration-model.component';
import { NzDrawerService, defaultFilterOption } from 'ng-zorro-antd';
import { AdditionalApplicableProductsComponent } from 'src/app/shared/modals/additional-applicable-products/additional-applicable-products.component';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserverificationComponent } from '../../common/shared/userverification/userverification.component';
import { OnboardingadditionalinfoComponent } from '../shared/modals/onboardingadditionalinfo/onboardingadditionalinfo.component';
import { arrayJoin } from 'src/app/utility-methods/utils';
import { AdditionaloperationalinfoComponent } from '../shared/modals/additionaloperationalinfo/additionaloperationalinfo.component';
import { AdditionalOperationalDetails } from '@services/model/Candidates/AdditionalOperationalDetails';
import { EmploymentReferenceDetailsComponent } from 'src/app/shared/modals/employment-reference-details/employment-reference-details.component';
import { ClientContractOperations } from '@services/model/Client/ClientContractOperations';
import { EmploymentReferenceDetails } from '@services/model/Candidates/EmploymentReferenceDetails';
import { LanguagesKnownDetails } from '@services/model/Candidates/LanguagesKnownDetails';
import { UUID } from 'angular2-uuid';
import { CookieService } from 'ngx-cookie-service';
import { ClientContract } from '@services/model/Client/ClientContract';
import { FindField } from '@services/service/findfield';

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
  selector: 'app-onboardingrequest',
  templateUrl: './onboardingrequest.component.html',
  styleUrls: ['./onboardingrequest.component.scss']
})
export class OnboardingrequestComponent implements OnInit, OnDestroy {
  private stopper: EventEmitter<any> = new EventEmitter();
  @ViewChild('validateChildComponentForm') private DynamicfieldformComponent: DynamicfieldformComponent;

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
  isAdditionalInfo: boolean = false;

  isAdditionalOperationalInfo: boolean = false;
  isLanguageKnownInfo: boolean = false;
  isReferenceDetails: boolean = false;
  IsPhotoMandatory: boolean = false;
  IsCandidateSignatureMandatory: boolean = false;
  IsEvaluationsheetRequired: boolean = false;
  IsDeclarationContextRequired: boolean = false;
  DeclarationContextMessage: string = '';

  isRateCardType: boolean = false;
  isClose: boolean = true;
  isSubmit: boolean = true;
  isSave: boolean = true;
  isReject: boolean = true;
  previewLetter: boolean = true;
  previewCTC: boolean = true;
  isValidateCandidate: boolean = true;
  // dropdown List from API resposnse

  OnBoardingInfoListGrp: OnBoardingInfo;
  CandidateInfoListGrp: CandidateInfo;
  OfferInfoListGrp: OfferInfo;
  OfferInfoListGrp1: OfferInfo; // Handle for spliting two seprate list Skills and Zone list
  CommunicationListGrp: CommunicationInfo;
  BankInfoListGrp: BankInfo;
  DocumentInfoListGrp: DocumentInfo;
  MigrationInfoGrp: MigrationInfo;
  OnboardingOperationalConfiguration: OnboardingOperationalConfigurationInfo;

  TeamList: any;
  ManagerList: ManagerList[] = [];
  LeaveGroupList: LeaveGroupList[] = [];
  CostCodeList: CostCodeList[] = [];
  EffectivePayPeriodList: PayPeriodList[] = []
  ActualDOJ: any;
  EmploymentTypeList: any[] = [];

  BankList: BankList[] = [];
  ClientList?: ClientList[] = [];
  ClientContactList: ClientContactList[] = [];
  ClientContractList: ClientContractList[] = [];
  RecruiterList: RecruiterList[] = [];
  MandatesList: MandatesAssignment[] = [];
  CandidateList: ExternalCandidateInfo[] = [];
  CountryList: CountryList[] = [];
  CountryList_NonIndian: CountryList[] = [];
  InActiveOfferedCandidateList: any[] = [];

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
  NoticePeriodDaysList: any[] = [];
  InsuranceList: any[] = [];
  DesignationList: any[] = [];
  filteredDesignationList: any[] = [];
  filteredSkillCategoryList: any[] = [];
  categoryList: any[] = [];
  filteredCategoryList: any[] = [];
  filteredSalaryTypes: any[] = [];
  // candidate save model

  candidateModel: CandidateModel = new CandidateModel();
  candidateDetails: CandidateDetails = new CandidateDetails;
  candidateOfferDetails: CandidateOfferDetails = new CandidateOfferDetails;
  OldcandidateOfferDetails: CandidateOfferDetails = new CandidateOfferDetails;

  workPermitDetails: WorkPermit = new WorkPermit;
  candidateRateSetDetails: CandidateRateset = new CandidateRateset;
  candidateOtherDetails: CandidateOtherData = new CandidateOtherData();
  candidateStatutoryDetails: CandidateStatutoryDetails = new CandidateStatutoryDetails;
  candidateMiscellanousDetails: any;
  candidateContactDetails: ContactDetails = new ContactDetails;
  candidateCommunicationDetails: CandidateCommunicationDetails = new CandidateCommunicationDetails;
  candidateAddressDetails: AddressDetails = new AddressDetails;
  candidateFamilyDetails: CandidateFamilyDetails = new CandidateFamilyDetails();
  // candidateExperienceDetails: WorkExperience = new WorkExperience();
  // candidateBankDetails: CandidateBankDetails = new CandidateBankDetails();
  // candidateQualificationDetails: Qualification = new Qualification();
  candidateDocumentDetails: CandidateDocuments = new CandidateDocuments();
  DynamicFieldDetails: DynamicFieldDetails = new DynamicFieldDetails();
  Dynamicfieldvalue: DynamicFieldsValue = new DynamicFieldsValue();
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
  lstDocumentDetails_additional: CandidateDocuments[] = [];
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
  maritalStatus: any = [];
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

  /* #region  _Emergency Slick Grid */
  columnDefinitions_Emergency: Column[] = [];
  gridOptions_Emergency: GridOption = {};
  LstEmergency = [];
  angularGrid_Emergency: AngularGridInstance;
  gridObj1_Emergency: any;
  /* #endregion */

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

  ClientId: any = 0;
  ClientContractId: any;
  MandateAssignmentId: any;

  nonIndian: boolean = false;
  ClientLocationId: any;


  Label_CurrentStatus: any;
  candidateListingObj: any = null;


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

  PayCycleDetails: any;

  accordionhighlights_documents: boolean = false;
  invaid_fields = [];
  OnBoarding_Title_Label: any;
  localURL_Path: any;

  isNewTransfer = false;
  // isRedoOffer = false;

  modalOption: NgbModalOptions = {};
  GroupControlName: any;

  testtt: Number;

  // only for CC email address book input ccmailtags
  @ViewChild('tagInput') tagInputRef: ElementRef;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;


  isAssamState: boolean = false;
  documentURL: any;
  documentURLId: any;

  _selected_reoffer_candidate: any;
  IsReOffer: boolean = false;
  BusinessType: any;
  RoleCode: any;
  clientLogoLink: any;
  clientminiLogoLink: any;

  common_gridOption = {
    enableAutoResize: true,       // true by default
    enableCellNavigation: true,
    datasetIdPropertyName: 'Id',
    editable: true,
    forceFitColumns: true,
    presets: {
      pagination: { pageNumber: 2, pageSize: 20 }
    },
    enableCheckboxSelector: false,
    enableRowSelection: false,
    checkboxSelector: {
      hideSelectAllCheckbox: true,
    },
    rowSelectionOptions: {
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
  };

  isDuplicateBankInfo: any;
  managerId: any;

  asciiCount: number = 0
  asciiKey: string = ''
  isInvalidCandidateInformation: boolean = false;
  DuplicateCheckMessage: string = '';
  relationship1: any = [];
  ShouldShowBankUploadBtn: boolean = false;
  nameofrelationship: string = '';

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
  _OrginalPanNo: any;
  additionalApplicableProducts: AdditionalPaymentProducts = null;
  baseDaysForAddlApplicableProduct: number = 0;
  minimumWagesApplicableProducts = [];
  IsReporingManagerRequired: boolean = false;

  isMobileResolution: boolean;
  isDynamicFieldLoaded: boolean = false;

  // AADHAAR INTEGRATION
  aadhaarDetails: aadhaarResponse = null;
  myDefaultClientObject = {
    ClientId: 0,
    ClientContractId: 0,
    ClientName: "",
    ClientContractName: "",
    IsNapsBased: false,
    Client: null,
    ClientContract: null
  }

  KYCProfileDocumentId: number = 0;
  IsAadhaarKYC: boolean = false;
  KYCAadhaarDocumentId: number = 0;
  IsUANKYC: boolean = false;
  IsPANKYC: boolean = false;
  smallspinner: boolean = false;
  IsUANVerificationRequired: boolean = environment.environment.IsUANVerificationRequired;
  IsPANVerificationRequired: boolean = environment.environment.IsPANVerificationRequired;

  IsMisMatchingAadhaar: boolean = false;
  arrayJoin = arrayJoin;
  // Additional Info Details
  onboardingAdditionalInfo: OnboardingAdditionalInfo = {
    LstEmployeeDivision: [],
    LstEmployeeDepartment: [],
    LstEmployeeDesignation: [],
    LstEmployeeLevel: [],
    LstEmployeeCategory: [],
    LstReligion: [],
    LstSubEmploymentType: [],
    LstSubEmploymentCategory: [],
    LstCostCityCenter: [],
    LstBuildings: [],
    LstJobProfile: [],
    LstClientZone : []
  };
  @ViewChild('onboardingAdditionalViewChild') onboardingAdditionalViewChild: OnboardingadditionalinfoComponent;
  @ViewChild('onboardingAdditionalOperationalViewChild') onboardingAdditionalOperationalViewChild: AdditionaloperationalinfoComponent;


  activeAccordionName: string = "";
  failedFieldsForAdditionalInformation = [];
  // additionalColumns: AdditionalColumns = new AdditionalColumns();
  additionalColumns: AdditionalColumns = {
    MarriageDate: null,
    Religion: null,
    // Department: null,
    JobProfile: null,
    SubEmploymentType: null,
    // Division: null,
    Level: null,
    SubEmploymentCategory: null,
    CostCityCenter: null,
    Building: null,
    EmploymentZone : null,
  };

  apiCallMade: boolean = false;
  IsCandidate: boolean = true;

  additionalOperationalDetails: AdditionalOperationalDetails = {
    Id: 0,
    CandidateId: 0, // Default value for numbers
    OfferDetailsId: 0,
    EmployeeId: 0,
    IsUniformIssued: false, // Default value for booleans
    NumberOfUniformSetsIssued: 0,
    IsFingerPrintRegistered: false,
    IsFormScanned: false,
    IsIDCardIssued: false,
    IsInterviewedEarlier: false,
    EarlierInterviewedOn: null, // new Date(), // Default value for Date
    EarlierInterviewedBy: '', // Default value for strings
    EarlierInterviewResult: '',
    IsEmployedByUsEarlier: false,
    EarlierEmployeeId: '',
    EarlierEmploymentStartDate: null, // new Date(),
    EarlierEmploymentEndDate: null, //new Date(),
    EarlierDivision: null,
    EarlierDepartment: null,
    ReasonForLeaving: '',
    IsChronicIllness: false,
    ChronicIllnessDetails: '',
    IsPreparingForCompetitiveExam: false,
    CompetitiveExamDetails: '',
    IsConvictedByPolice: false,
    PoliceCaseDetails: '',
    IsBlackListCheckDone: false,
    Modetype: UIMode.None,
    Status: 1,
  };
  /* #region  Constrcutror */

  requiredAdditionalColumnSettingValue = [];
  currentRoleCode: string;
  currentEntityType: string = "Candidate";


  // languages known details
  LstLanguage = [];
  LstEducationDocumentTypes = [];
  LstWorkExperienceDocumentTypes = [];


  LstLanguageKnown = [];
  @ViewChild('speakCheckbox') speakCheckbox: ElementRef;
  @ViewChild('writeCheckbox') writeCheckbox: ElementRef;
  @ViewChild('readCheckbox') readCheckbox: ElementRef;
  selectLanguageProficiencyElement: any = null;
  LstReligion = [];

  // Reference Details

  LstReference: any[] = [];
  // allen check
  isAllenDigital: boolean = false;
  apiCallMadeForAdditionalOperationals: boolean = false;
  shouldShowRejectBtn: boolean = false;
  currentDate: Date = new Date();
  LstEPSStatus = [{ Id: 1, Name: "Yes" }, { Id: 0, Name: "No" }]
  WorkState: any;
  WorkCity: any;
  AttendanceStartDate: Date;

  isDynamicApiCalled: boolean = false;
  isEditLangProf: boolean = false;
  isPANMandatory: boolean = environment.environment.OnBoardingRequest_CandidateInfo_PAN_Mandatory;
  selectedDesignationLevelId: any;
  CityList: CityList[] = [];
  CityList1:CityList[] = [];

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
    private sanitizer: DomSanitizer,
    private utitlityService: UtilityService,
    private pageLayoutService: PagelayoutService,
    private candidateService: CandidateService,
    private essservice: ESSService,
    private drawerService: NzDrawerService,
    private http: HttpClient,
    private employeeService: EmployeeService,
    private cookieService: CookieService,
    public findField: FindField,
  ) {

    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

    this.route.queryParams.subscribe((params) => {
      console.log('params', params);

    });

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
    this.IsCandidate = true;
    const currentRoute = this.route.snapshot;
    console.log('currentRoute', currentRoute);
    const routePathWithoutParams = currentRoute.routeConfig.path;

    console.log(routePathWithoutParams);
    const routeSegments = [currentRoute.routeConfig.path];
    let currentChild = currentRoute.firstChild;
    while (currentChild) {
      if (currentChild.routeConfig) {
        routeSegments.push(currentChild.routeConfig.path);
      }
      currentChild = currentChild.firstChild;
    }


    // Join the segments to form the route path
    const routePathWithChildren = routeSegments.join('/');
    console.log('routePathWithChildren', routePathWithChildren);
    this.isDynamicFieldLoaded = false;
    this.titleService.setTitle('OnBoarding');
    this.localURL_Path = this.router.url.includes('candidate_information');

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

    this.headerService.presentObject.subscribe(candidateObj => {
      this.candidateListingObj = candidateObj;
      if (this.candidateListingObj) {
        console.log('candidateListingObj', this.candidateListingObj);
      }
    });


    this.headerService.isNewTransfer.subscribe(isNewTransfer => {
      this.isNewTransfer = isNewTransfer;
    });
    // alert(sessionStorage.getItem('isNewTransfer').toString());

    this.isNewTransfer = (Boolean(sessionStorage.getItem('isNewTransfer')) == true ? true : false)

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    console.log('Session Details :: ', this._loginSessionDetails)
    this.accessControl_submit = this.userAccessControl.filter(a => a.ControlName == "btn_onboarding_submit");
    this.accessControl_reject = this.userAccessControl.filter(a => a.ControlName == "btn_Opsonboarding_reject");
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
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


    // this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    this.MenuId = environment.environment.OnboardingMenuId;
    this.countryCode = "91";
    // For use in url path implementing
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        var encodedCdx = atob(params["Cdx"]);
        this.Id = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.CandidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);

      }
    });

    const urlRegex = /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/;
    // used for form groups
    // Only keep the most recent form control names
    this.candidatesForm = this.formBuilder.group({
      requestBy: ['self'],
      requestFor: ['OL'],
      onboardingType: ['flash'],
      recruiterName: [null],
      onBehalfRemarks: [''],


      firstName: [''],
      gender: [null],
      email: [''],
      mobile: [''],
      dateOfBirth: [null],
      fatherName: [''],
      relationshipType: [null],
      relationshipName: [''],
      AadhaarNumber: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(12), Validators.pattern(urlRegex)]],
      PAN: [''],
      nationality: [null],
      isDifferentlyabled: [false],
      differentlyabledPercentage: ['', [Validators.max(100), Validators.min(0)]],

      presentCommunicationCategoryTypeId: [''],
      presentAddressdetails: [''],
      presentAddressdetails1: [''],
      presentAddressdetails2: [''],
      presentStateName: [null],
      presentCountryName: [null],
      presentPincode: [''],
      presentCity: [''],

      permanentCommunicationCategoryTypeId: [''],
      permanentAddressdetails: [''],
      permanentAddressdetails1: [''],
      permanentAddressdetails2: [''],
      permanentStateName: [null],
      permanentCountryName: [null],
      permanentPincode: [''],
      permanentCity: [''],


      proxyRemarks: [''],
      clientSPOC: [null],


      location: [null],
      reportingLocation: [null],
      industryType: [null],
      skillCategory: [null],
      Department: [null],
      Category: [null],
      Division: [null],

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
      reportingTime: [null],
      tenureType: [null],
      tenureMonth: [''],
      tenureEndate: [''],
      onCostInsuranceAmount: [''],
      ManagerId: [null],

      ClientId: [null],
      clientContract: [null],
      mandateName: [null],
      candidateName: [null],
      onApprovalType: ['attachment'],
      sourceType: [null],
      isRateCardType: [true],
      clientApprovalAttachment: [null],

      newName: [''],
      isNameChange: [false],
      country: [null],
      isValidFrom: [''],
      isValidTill: [''],
      workPermitType: [''],

      locationLabel: [''],
      Remarks: [''],
      insurance: [null],
      insuranceplan: [null],
      fixedDeductionAmount: [''],
      isOLcandidateacceptance: [false],
      isAlaccept: [false],
      Gmc: [150000],
      Gpa: [300000],
      NoticePeriod: [null],
      ccemail: [''],
      AnnaulCTC: [0],
      AnnualNTH: [0],
      AnnualGross: [0],
      MonthlyCTC: [0],
      MonthlyNTH: [0],
      MonthlyGross: [0],

      emergencyContactnumber: [''],
      landLine: [''],
      emergencyContactPersonName: [''],

      bloodGroup: [null],
      maritalStatus: [null],
      MarriageDate: [null],
      Religion: [null],
      isPANNoExists: [false],
      PANNO: [''],
      ackowledgmentNumber: [''],
      isAadharExemptedState: [false],
      aAdharNumber: [''],
      UAN: [''],
      PFNumber: [''],
      ESICNumber: [''],
      PRAN: [''],
      EPSStatus: [null],
      haveApplied: [false],

      ActualDOJ: [null],
      TeamId: [null],
      EffectivePayPeriod: [null],
      CostCodeId: [null],
      LeaveGroupId: [null],
      AppointmentLetterTemplateId: [null],
      employmentType: [null],
      _isFresher: [false],
      relationshipNameType: ['fathername'],
      minimumWagesApplicableProducts: [null],

      NameasPerProof: [null],
      DOBasPerProof: [null],


      // new operational fields for (allen mainly)
      SpouseName: [""],
      MotherName: [""],
      IsFormScanned: [false],
      IsInterviewedEarlier: [false],
      EarlierInterviewedOn: [null],
      EarlierInterviewResult: [""],
      IsEmployedByUsEarlier: [false],
      EarlierEmployeeId: [null],
      EarlierEmploymentStartDate: [null],
      EarlierEmploymentEndDate: [null],
      EarlierDivision: [null],
      EarlierDepartment: [null],
      ReasonForLeaving: [null],
      IsChronicIllness: [null],

      joiningTime: [null],
    });
    // ONLY FOR ALLEN DIGITALS
    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    this.isAllenDigital = (cookieValue.toUpperCase() == 'ALLEN' && (businessType === 1 || businessType === 2)) ? true : false;

    if (this.isAllenDigital && this.RoleCode != 'Candidate') {
      this.updateValidation(true, this.candidatesForm.get('reportingLocation'))
      this.updateValidation(true, this.candidatesForm.get('industryType'))
      this.updateValidation(true, this.candidatesForm.get('skillCategory'))
      this.updateValidation(true, this.candidatesForm.get('zone'))
    }

    this.sourceTypes = this.utilsHelper.transform(SourceType);
    this.gender = this.utilsHelper.transform(Gender);
    this.nationality = this.utilsHelper.transform(Nationality);
    this.salaryType = this.utilsHelper.transform(SalaryBreakUpType);
    this.filteredSalaryTypes = this.salaryType;
    this.tenureType = this.utilsHelper.transform(TenureType)
    this.bloodGroup = this.utilsHelper.transform(BloodGroup)
    this.maritalStatus = this.utilsHelper.transform(MaritalStatus)
    this.ApprovalForList = this.utilsHelper.transform(ApprovalFor);
    this.ApprovalTypeList = this.utilsHelper.transform(ApproverType);
    this.relationship1 = this.utilsHelper.transform(Relationship);
    const filterArray = [4, 5, 6];
    this.relationship1 = this.relationship1.filter(({ id }) => filterArray.includes(id));
    this.candidatesForm.controls['nationality'].setValue(this.nationality.find(a => a.id == 1).id);
    this.DOBmaxDate = new Date();
    this.workPermitminDate = new Date();
    this.TenureminDate = new Date();
    this.tblminDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);
    this.candidatesForm.controls['onApprovalType'].disable();
    this.currentRoleCode = this.RoleCode;
    if (this.RoleCode == 'Candidate') {
      this.isValidateCandidate = false;
    }
    // Adds the same handler methods for all of the specified slick grid table
    this.doNomineeSlickGrid();
    this.doExperienceSlickGrid();
    this.doEducationSlickGrid();
    this.doBankSlickGrid();

    // this.headerService.isRedoOffer.subscribe(isRedoOffer => {
    //   this.isRedoOffer = isRedoOffer;
    // });

    this.additionalOperationalDetails = {
      Id: 0,
      CandidateId: 0,
      OfferDetailsId: 0,
      EmployeeId: 0,
      IsUniformIssued: false,
      NumberOfUniformSetsIssued: 0,
      IsFingerPrintRegistered: false,
      IsFormScanned: false,
      IsIDCardIssued: false,
      IsInterviewedEarlier: false,
      EarlierInterviewedOn: null,
      EarlierInterviewedBy: '',
      EarlierInterviewResult: '',
      IsEmployedByUsEarlier: false,
      EarlierEmployeeId: '',
      EarlierEmploymentStartDate: null,
      EarlierEmploymentEndDate: null,
      EarlierDivision: null,
      EarlierDepartment: null,
      ReasonForLeaving: '',
      IsChronicIllness: false,
      ChronicIllnessDetails: '',
      IsPreparingForCompetitiveExam: false,
      CompetitiveExamDetails: '',
      IsConvictedByPolice: false,
      PoliceCaseDetails: '',
      IsBlackListCheckDone: false,
      Modetype: UIMode.None,
      Status: 1,
    };


    this.init()
    
  }

  doCheckAadhaarMaxlength(event: any, formCtrl: any) {
    if (event.target.value.length > 12) {
      formCtrl.setValue(event.target.value.slice(0, 12));
    }
  }

  init() {

    try {

      this.removeValidation();
      let mode = this.Id == 0 ? 1 : 2; // add-1, edit-2, view, 3
      this.isEditMode = this.Id == 0 ? true : false;
      // RE-OFFER - START
      // this.IsReOffer == true ?( mode = 1, this.isEditMode = true) : null;
      // RE-OFFER - END

      var isExistsGroupControl = false;
      isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = this.candidatesForm.get("onboardingType").value == 'proxy' ? "Detailed" : "Flash";
      this.UIBuilderService.doApply(mode, this, this.MenuId, isExistsGroupControl == false ? "" : this.GroupControlName);
      // i dont know why dharanee commentted this set of code 
      // this.candidatesForm.controls['emergencyContactPersonName'] != null ? this.updateValidation(false, this.candidatesForm.get('emergencyContactPersonName')) : true;
      // this.candidatesForm.controls['emergencyContactnumber'] != null ? this.updateValidation(false, this.candidatesForm.get('emergencyContactnumber')) : true;

      //Enable fields
      this.candidatesForm.controls['ClientId'].enable();
      this.candidatesForm.controls['clientContract'].enable();
      this.candidatesForm.controls['clientSPOC'].enable();

      if (this.RoleCode == 'Candidate') {
        this.isValidateCandidate = false;
      }

      if (this.isNewTransfer && this.BusinessType == 3) {
        this.candidatesForm.controls['sourceType'].setValue(2);

      }
      this.onSourceTypeAsTransfer(); // only ops new request
      this.adjustFormControlValidationForAllenDigital();

    } catch (Exception) {

      console.error("ON INIT METHOD EXCEPTION :: ", Exception);

    }


    // this.isAdditionalInfo = true;

    try {
      this.apiCallMadeForAdditionalOperationals = false;
      this.should_spin_onboarding = true;
      if (this.Id != 0) {
        try {
          this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data
        } catch (error) { }

        this.do_Edit();
      } else {
        this.apiCallMadeForAdditionalOperationals = true;
        this.shouldShowRejectBtn = false;
      }
      setTimeout(() => {
        this.doCheckAccordion("isCandidateInfo"); // for edit pre loading - Returns a function to use in accordion data for buttons click
      }, 2500);


      setTimeout(() => {
        //  this.disableBtn = true;
      }, 3000);


    } catch (error) {
    }

    this.headerService.aadhaarDetails.subscribe(aadhaarDetails => {
      console.log('Aadhaar Details ::', aadhaarDetails);
      this.aadhaarDetails = aadhaarDetails;
      if (aadhaarDetails != null) {
        if (this.aadhaarDetails && this.Id == 0) {
          this.KYCAadhaarDocumentId = 0;
          this.KYCProfileDocumentId = 0;
          this.patchAadhaarDetails()
        }
      }
    });



    this.candidatesForm.get('sourceType').value == 2 && this.Id == 0 && this.BusinessType == 3 ? this.candidatesForm.controls['requestFor'].setValue('AL') : null;
    if (this.candidatesForm.get('requestFor').value != null && this.candidatesForm.get('requestFor').value.toString() === "AL") {
      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));
      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(true, this.candidatesForm.get('TeamId'));
      this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
      this.isAllenDigital && this.updateValidation(false, this.candidatesForm.get('joiningTime'));

    }
    else {
      this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(true, this.candidatesForm.get('letterTemplate'));

      this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(false, this.candidatesForm.get('TeamId'));
      this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));
      this.isAllenDigital && this.updateValidation(false, this.candidatesForm.get('joiningTime'));


    }

    this.headerService.myDefaultClientObject.subscribe(myDefaultClientObject => {
      this.myDefaultClientObject = myDefaultClientObject;
      console.log('this.myDefaultClientObject', this.myDefaultClientObject);
      console.log('this.Id', this.Id);
      if (this.myDefaultClientObject && this.Id == 0) {
        this.ClientId = this.myDefaultClientObject.ClientId;
        this.ClientContractId = this.myDefaultClientObject.ClientContractId;
        this.candidatesForm.controls['ClientId'] != null ? this.candidatesForm.controls['ClientId'].setValue(this.ClientId) : null;
        this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this.ClientContractId) : null;
        this.doCheckAdditionalColumns();
        this.getOnboardingConfiguration();
      }
      else if (this.BusinessType != 3) {

        const clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
        const clientIdSME = this.sessionService.getSessionStorage("default_SME_ClientId");
        const clientcontractSME = JSON.parse(this.sessionService.getSessionStorage("SME_ClientContract"));
        const clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");

        const clientContractId = clientcontractIdSME;
        const clientId = clientIdSME;

        this.myDefaultClientObject = {
          ClientId: 0,
          ClientContractId: 0,
          ClientName: "",
          ClientContractName: "",
          IsNapsBased: false,
          Client: null,
          ClientContract: null
        };

        this.myDefaultClientObject.ClientId = clientId;
        this.myDefaultClientObject.ClientContractId = clientContractId;
        this.myDefaultClientObject.Client = clientSME as any;
        this.myDefaultClientObject.ClientContract = clientcontractSME as any;

        this.ClientId = this.myDefaultClientObject.ClientId;
        this.ClientContractId = this.myDefaultClientObject.ClientContractId;
        this.candidatesForm.controls['ClientId'] != null ? this.candidatesForm.controls['ClientId'].setValue(this.ClientId) : null;
        this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this.ClientContractId) : null;
        this.doCheckAdditionalColumns();
        this.getOnboardingConfiguration();
      }
    });
  }

  doCheckAdditionalColumns() {

    const requiredColumns = environment.environment.RequiredClientIdsForOnboardingAdditionalColumns;
    const clientId = Number(this.ClientId);
    if (this.RoleCode != 'Candidate' && requiredColumns && requiredColumns.length > 0) {
      const clientSetting = requiredColumns.find(a => a.ClientId === clientId);

      if (clientSetting && clientSetting.SettingValue && clientSetting.SettingValue.length > 0) {
        this.isAdditionalInfo = true;
        this.requiredAdditionalColumnSettingValue = clientSetting.SettingValue;
      }
    }
    this.doCheckAllenDigital() ? this.isAllenDigital = true : this.isAllenDigital = false;


  }


  _load_SME_Properties() {

    if (this.BusinessType != 3 && this.RoleCode != 'Candidate') {
      this.ClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
      if (this.ClientId != null && this.ClientId != undefined) {
        this.ClientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
        this.refreshContractAndContact(this.ClientId);
        this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this.ClientContractId) : null;
        let _clientIdAsNum = parseFloat(this.ClientId);
        this.candidatesForm.controls['ClientId'].setValue(_clientIdAsNum);

      }

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
    else {
      this.onLoadRequestFor();
    }

  }

  check_ActualDOJ_minDate() {

    this.ActualDOJminDate = new Date();
    this.ActualDOJmaxDate = new Date();

    this.ActualDOJminDate.setDate(this.ActualDOJminDate.getDate() - (!this.isESICapplicable ? environment.environment.ActualDOJminDate : environment.environment.ActualDOJminDate_withESIC));
    this.ActualDOJminDate.setMonth(this.ActualDOJminDate.getMonth());
    this.ActualDOJminDate.setFullYear(this.ActualDOJminDate.getFullYear());


    this.ActualDOJmaxDate.setDate(this.ActualDOJmaxDate.getDate() + environment.environment.ActualDOJmaxDate);
    this.ActualDOJmaxDate.setMonth(this.ActualDOJmaxDate.getMonth());
    this.ActualDOJmaxDate.setFullYear(this.ActualDOJmaxDate.getFullYear());
  }

  onLoadRequestFor() {

    if (this.candidatesForm.get('requestFor').value == "OL" && this.isOfferInfo) {

      this.DOJminDate = new Date();
      this.DOJmaxDate = new Date();

      this.DOJmaxDate.setDate(this.DOJmaxDate.getDate() + environment.environment.ExpectedDOJmaxDate);
      this.DOJmaxDate.setMonth(this.DOJmaxDate.getMonth());
      this.DOJmaxDate.setFullYear(this.DOJmaxDate.getFullYear());

      this.DOJminDate.setDate(this.DOJminDate.getDate() - environment.environment.ExpectedDOJminDate);
      this.DOJminDate.setMonth(this.DOJminDate.getMonth());
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
    console.log('accordion_Name', accordion_Name);
    console.log('this.activeAccordionName', this.activeAccordionName);
    console.log('addiona', this.additionalOperationalDetails);
    if ((this.activeAccordionName != '' && this.activeAccordionName != null && this.activeAccordionName == "isAdditionalInfo")) {
      try {
        this.onboardingAdditionalViewChild.ngOnDestroy();
      } catch (error) {

      }

    }

    if ((this.activeAccordionName != '' && this.activeAccordionName != null && this.activeAccordionName == "isAdditionalOperationalInfo")) {


      this.onboardingAdditionalOperationalViewChild.ngOnDestroy();
    }

    this.activeAccordionName = accordion_Name;

    if (accordion_Name == "isOnboardingInfo") {
      this.OnBoardingInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isCandidateInfo") {
      this.CandidateInfoListGrp == undefined ? this.doAccordionLoading(accordion_Name) : undefined;
    }
    else if (accordion_Name == "isOfferInfo") {
      const clientId = (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0;
      const clientContractId = this.ClientContractId;
      this.onboardingService.GetOnboardingAdditionalInfo(clientId, clientContractId).subscribe((response: apiResult) => {
        this.apiCallMade = true
        if (response.Status) {
          this.onboardingAdditionalInfo = JSON.parse(response.Result);
          this.categoryList = this.onboardingAdditionalInfo.LstEmployeeCategory
          this.filteredCategoryList = this.categoryList
        }
      }, (error) => {
        this.disableBtn = true;
      });
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
      if (this.LetterTemplateList && this.LetterTemplateList.length == 0) {
        // this.doletterTemplate();
      }
    }
    else if (accordion_Name == "isAdditionalInfo" || accordion_Name == "isAdditionalOperationalInfo") {

      const clientId = (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0;
      const clientContractId = this.ClientContractId;
      this.onboardingService.GetOnboardingAdditionalInfo(clientId, clientContractId).subscribe((response: apiResult) => {
        console.log('response', response);
        this.apiCallMade = true
        if (response.Status) {
          this.onboardingAdditionalInfo = JSON.parse(response.Result);
          console.log('this.onboardingAdditionalInfo', this.onboardingAdditionalInfo);
        }
      }, (error) => {
        this.disableBtn = true;
      });
    }

  }


  public doAccordionLoading(accordion_Name: any) {
    this.disableBtn = false;

    // to avoid calling api multiple times
    if (accordion_Name == "isDocumentInfo" && this.DocumentInfoListGrp && this.DocumentInfoListGrp.DocumentCategoryist) {
      return;
    }

    this.should_spin_onboarding = true;
    this.onboardingService.getOnboardingInfo(accordion_Name, this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;


        // console.log('RESULT OF ACCORD ::', (apiResult.Result));
        // console.log(' ID ::', this.Id);;


        if (apiResult.Status && apiResult.Result != "") {
          if (accordion_Name == "isOnboardingInfo") {

            var i = (apiResult.Result).toString();
            this.OnBoardingInfoListGrp = (JSON.parse((apiResult.Result)));

            this.ClientList = _.orderBy(this.OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);            
            this.RecruiterList = _.orderBy(this.OnBoardingInfoListGrp.RecruiterList, ["Name"], ["asc"]);

            // this._load_SME_Properties()

            if (this.myDefaultClientObject != null && this.Id == 0) {
              this.refreshContractAndContact(this.ClientId);
            }

            if (this.Id > 0) {
              try {
                this.refreshContractAndContact(this.ClientId);
                environment.environment.RequiredToCallMandatesAPI ? this.onClickMandateAssignment(null) : true;
                environment.environment.RequiredToCallMandatesAPI ? this.onClickCandidate(null) : true;

              } catch (error) { }
            } else {
              this.should_spin_onboarding = false;
            }

            if (!isNaN(this.Id) && this.BusinessType != 3) {
              this._load_SME_Properties();
            }

          }

          else if (accordion_Name == "isCandidateInfo") {
            this.CandidateInfoListGrp = JSON.parse(apiResult.Result);
            this.CountryList_NonIndian = this.CandidateInfoListGrp.CountryList;
            this.CountryList_NonIndian = this.CountryList_NonIndian.filter(a => a.Id != 100);
            this.InActiveOfferedCandidateList = _.orderBy(this.CandidateInfoListGrp.OfferedList, ["Name"], ["asc"]);
            this.InActiveOfferedCandidateList.length > 0 && this.InActiveOfferedCandidateList.forEach(element => {
              element['isSelected'] = false;
            });
            if (this.Id == 0) {
              this.should_spin_onboarding = false;
            }
          }

          else if (accordion_Name == "isOfferInfo") {
            this.getSkillaAndZoneByStateAndIndustry()
            if(this._NewCandidateDetails.LstCandidateOfferDetails) {
              this.selectedDesignationLevelId = this.getDesignationLevelDisplayName(this._NewCandidateDetails.LstCandidateOfferDetails[0].Level)
            }
            this.ClientContractId = this.candidatesForm.get('clientContract').value;

            this.getDynamicFieldDetailsConfig(this.CompanyId, this.ClientId, this.ClientContractId)
              .then(() => {
                console.log("Task Complete!");
              });


            this.OfferInfoListGrp = JSON.parse(apiResult.Result);
            this.EmploymentTypeList = this.OfferInfoListGrp.EmploymentTypeList != null && this.OfferInfoListGrp.EmploymentTypeList.length > 0 ? this.OfferInfoListGrp.EmploymentTypeList : [];
            this.IndustryList = (this.OfferInfoListGrp.IndustryList);
            this.ClientLocationList = this.OfferInfoListGrp.ClientLocationList != null && this.OfferInfoListGrp.ClientLocationList.length > 0 ? (this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId)) : [];

            if (this.ClientContractList != null && this.ClientContractList.length > 0 && this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value == null) {
              this.candidatesForm.controls['tenureType'].setValue(this.ClientContractList.find(z => z.Id == this.candidatesForm.get('clientContract').value).DefaultTenureType);
            }

            if (this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value != null && this.candidatesForm.get('tenureType').value != '' && this.candidatesForm.get('tenureType').value == 2) {
              this.updateValidation(true, this.candidatesForm.get('tenureMonth'));
            }

            if (this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value != null && this.candidatesForm.get('tenureType').value != '' && this.candidatesForm.get('tenureType').value == 1) {
              this.updateValidation(true, this.candidatesForm.get('tenureEndate'));
            }

            if (this.ClientContractList != null && this.ClientContractList.length > 0 && this.candidatesForm.controls['employmentType'] != null && this.candidatesForm.get('employmentType').value == null) {
              this.candidatesForm.controls['employmentType'].setValue(this.ClientContractList.find(z => z.Id == this.candidatesForm.get('clientContract').value).DefaultEmploymentType);
            }

            if (this.LetterTemplateList && this.LetterTemplateList.length == 0) {
              this.doletterTemplate();
            }

            this.doCheckAccordion("isMigrationInfo");

            // this.EmploymentTypeList = this.OfferInfoListGrp.EmploymentTypeList != null && this.OfferInfoListGrp.EmploymentTypeList.length > 0 ? this.OfferInfoListGrp.EmploymentTypeList : [];
            // this.IndustryList = _.orderBy(this.OfferInfoListGrp.IndustryList, ["Name"], ["asc"]);
            // this.OfferInfoListGrp.ClientLocationList != null && this.OfferInfoListGrp.ClientLocationList.length > 0 ? this.ClientLocationList = _.orderBy(this.OfferInfoListGrp.ClientLocationList.filter(z => z.ClientId == this.ClientId), ["LocationName"], ["asc"]) : true;
            // // PORT[2] 9.1 CHANGES
            // (this.ClientContractList != null && this.ClientContractList.length > 0 && this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value == null) ?
            //   this.candidatesForm.controls['tenureType'].setValue(this.ClientContractList.find(z => z.Id == this.candidatesForm.get('clientContract').value).DefaultTenureType) : true;

            // if (this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value != null && this.candidatesForm.get('tenureType').value != '' && this.candidatesForm.get('tenureType').value == 2) {
            //   this.updateValidation(true, this.candidatesForm.get('tenureMonth'));
            // }
            // if (this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.get('tenureType').value != null && this.candidatesForm.get('tenureType').value != '' && this.candidatesForm.get('tenureType').value == 1) {
            //   this.updateValidation(true, this.candidatesForm.get('tenureEndate'));
            // }
            // (this.ClientContractList != null && this.ClientContractList.length > 0 && this.candidatesForm.controls['employmentType'] != null && this.candidatesForm.get('employmentType').value == null) ?
            //   this.candidatesForm.controls['employmentType'].setValue(this.ClientContractList.find(z => z.Id == this.candidatesForm.get('clientContract').value).DefaultEmploymentType) : true;

            // if (this.LetterTemplateList && this.LetterTemplateList.length == 0) {
            //   this.doletterTemplate();
            // }
            // this.doCheckAccordion("isMigrationInfo");
            if (this.BusinessType != 3 && this.IndustryList != null && this.IndustryList.length > 0) {
              let _industryId = (this.IndustryList[0].Id);
              var payEvent = {
                id: 0
              }
              // SME CHANGES ONLY
              this.BusinessType != 3 ? this.candidatesForm.controls['industryType'] != null && (this.candidatesForm.get('industryType').value == null || this.candidatesForm.get('industryType').value == 0) ? this.candidatesForm.controls['industryType'].setValue(_industryId) : null : true;
              this.BusinessType != 3 ? this.candidatesForm.controls['salaryType'] != null && (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0) ? this.candidatesForm.controls['salaryType'].setValue(1) : null : true;
              this.BusinessType != 3 ? (payEvent.id = (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0) ? 0 : this.candidatesForm.get('salaryType').value) : null;
              this.BusinessType != 3 ? this.editOnChangeSalary(payEvent) : null;
              this.onChangeIndustryType(null, 'WhenEdit');
            }
            if (this.Id) {
              this.onChangeOfferLocation(([0, null, undefined].includes(this.candidatesForm.get('location').value)) ? null :
                this.ClientLocationList.length > 0 && this.ClientLocationList.find(a => a.Id == this.candidatesForm.get('location').value), 'WhenEdit');
              try {
                if (this.BusinessType == 3) {
                  var payEvent = {
                    id: 0
                  }
                  payEvent.id = (this.candidatesForm.get('salaryType').value == null || this.candidatesForm.get('salaryType').value == 0) ? 0 : this.candidatesForm.get('salaryType').value;
                  this.onChangeIndustryType(null, 'WhenEdit');
                  this.editOnChangeSalary(payEvent);
                }
              } catch (error) {
                console.log('err : ', error);
              }
              this.should_spin_onboarding = false;
            } else { this.should_spin_onboarding = false; }

          }

          else if (accordion_Name == "isCommunicationdetails") {
            this.CommunicationListGrp = JSON.parse(apiResult.Result);            
            this.CountryList = this.CommunicationListGrp.CountryList;

            if (this.Id != 0) {
              try {
                var countryEventId = (this.candidatesForm.get('presentCountryName').value == null || this.candidatesForm.get('presentCountryName').value == 0 ? null : this.candidatesForm.get('presentCountryName').value);
                var countryEvent1Id = (this.candidatesForm.get('permanentCountryName').value == null || this.candidatesForm.get('permanentCountryName').value == 0 ? null : this.candidatesForm.get('permanentCountryName').value);
                this.StateList = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId == Number(countryEventId)), ["Name"], ["asc"]);
                this.StateList1 = _.orderBy(_.filter(this.CommunicationListGrp.StateList, (a) => a.CountryId === Number(countryEvent1Id)), ["Name"], ["asc"]);
                let stateEventId = (this.candidatesForm.get('presentStateName').value == null || this.candidatesForm.get('presentStateName').value == 0 ? null : this.candidatesForm.get('presentStateName').value);
                let stateEvent1Id = (this.candidatesForm.get('permanentStateName').value == null || this.candidatesForm.get('permanentStateName').value == 0 ? null : this.candidatesForm.get('permanentStateName').value);
                this.CityList = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId == Number(stateEventId)),["Name"], ["asc"]);
                this.CityList1 = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId == Number(stateEvent1Id)), ["Name"],["asc"]);
                this.should_spin_onboarding = false;

              } catch (error) { }
            } else { this.should_spin_onboarding = false; }
          }

          else if (accordion_Name == "isBankInfo") {
            this.BankInfoListGrp = JSON.parse(apiResult.Result);
            this.BankList = this.BankInfoListGrp.BankList;
            setTimeout(() => {
              this.should_spin_onboarding = false;
            }, 25000);
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
        this.disableBtn = true;
      }, (error) => {
        this.should_spin_onboarding = false;
        this.disableBtn = true;
      });

  }

  /* #endregion */

  patchAadhaarDetails() {
    this.IsMisMatchingAadhaar = false;
    this.IsAadhaarKYC = true;
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


    // let dob = moment(this.aadhaarDetails.dob).format('YYYY-MM-DD');
    const date = moment(aadhaarResponseData.dob, 'YYYY-MM-DD').format('YYYY-MM-DD');
    console.log(new Date(date))


    if (this.RoleCode == 'Candidate') {

      const text1 = aadhaarResponseData.name.replace(" ", "");
      const text2 = this.candidatesForm.get('firstName').value.replace(" ", "");

      const actualDOB = moment(this._NewCandidateDetails.DateOfBirth);
      const aadhaarDOB = moment(date);

      if (text1.toUpperCase().toString() != text2.toUpperCase().toString()) {
        this.IsMisMatchingAadhaar = true;
      } else {
        this.candidatesForm.controls['firstName'].setValue(aadhaarResponseData.name);
        this.candidatesForm.controls['firstName'].disable();
      }

      if (moment(aadhaarDOB).format('YYYY-MM-DD') != moment(actualDOB).format('YYYY-MM-DD')) {
        this.IsMisMatchingAadhaar = true;
      }
      else {
        this.candidatesForm.controls['dateOfBirth'] != null ? this.candidatesForm.controls['dateOfBirth'].setValue(this.datePipe.transform(new Date(date).toString(), "dd-MM-yyyy")) : null;
        this.candidatesForm.controls['dateOfBirth'].disable();
      }

      this.candidatesForm.controls['DOBasPerProof'] != null ? this.candidatesForm.controls['DOBasPerProof'].setValue(this.datePipe.transform(new Date(date).toString(), "dd-MM-yyyy")) : null;
      this.candidatesForm.controls['NameasPerProof'].setValue(aadhaarResponseData.name);



    } else {
      this.candidatesForm.controls['firstName'].setValue(aadhaarResponseData.name);
      this.candidatesForm.controls['dateOfBirth'] != null ? this.candidatesForm.controls['dateOfBirth'].setValue(this.datePipe.transform(new Date(date).toString(), "dd-MM-yyyy")) : null;
      this.candidatesForm.controls['firstName'].disable();
      this.candidatesForm.controls['dateOfBirth'].disable();
    }

    if (this.aadhaarDetails && aadhaarResponseData) {
      let fathername = "";
      fathername = aadhaarResponseData.fatherName;


      if (aadhaarResponseData.gender == 'M') {
        this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(1) : null;
      }
      else if (aadhaarResponseData.gender == 'F') {
        this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(2) : null;
      }
      else {
        this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(3) : null;
      }

      // addressobj = this.aadhaarDetails.address;
      // const str1 = addressobj.careof;
      // let fathername = "";
      // if (str1.indexOf('S/O') > -1) {
      //   this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(1) : null;
      //   fathername = str1.replace('S/O', '');
      // }
      // if (str1.indexOf('D/O') > -1) {
      //   this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(2) : null;
      //   fathername = str1.replace('D/O', '');
      // }

      // if (this.candidateDetails.RelationshipId != Relationship.Father && this.candidateDetails.RelationshipId > 0) {
      //   this.updateValidation(false, this.candidatesForm.get('fatherName'));
      //   this.updateValidation(true, this.candidatesForm.get('relationshipType'));
      //   this.updateValidation(true, this.candidatesForm.get('relationshipName'));
      //   this.nameofrelationship = this.relationship1.find(a => a.id == this._NewCandidateDetails.RelationshipId).name;
      //   this.candidatesForm.controls['relationshipNameType'].setValue('others');
      //   this.candidatesForm.controls['relationshipType'] != null ? this.candidatesForm.controls['relationshipType'].setValue(this._NewCandidateDetails.RelationshipId != null && this._NewCandidateDetails.RelationshipId != undefined ? this._NewCandidateDetails.RelationshipId : null) : null;
      //   this.candidatesForm.controls['relationshipName'] != null ? this.candidatesForm.controls['relationshipName'].setValue(this._NewCandidateDetails.RelationshipName) : null;

      // } else {
      //   this.updateValidation(true, this.candidatesForm.get('fatherName'));
      //   this.updateValidation(false, this.candidatesForm.get('relationshipType'));
      //   this.updateValidation(false, this.candidatesForm.get('relationshipName'));
      //   this.candidatesForm.controls['relationshipNameType'].setValue('fathername');
      //   this.candidatesForm.controls['fatherName'] != null ? this.candidatesForm.controls['fatherName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName) : null;

      // }

      // this.candidatesForm.controls['relationshipType'] != null ? this.candidatesForm.controls['relationshipType'].setValue(1) : null;
      this.candidatesForm.controls['relationshipName'] != null ? this.candidatesForm.controls['relationshipName'].setValue(null) : null;
      this.candidatesForm.controls['relationshipNameType'].setValue('fathername');
      this.nameofrelationship = 'Father';
      this.candidatesForm.controls['fatherName'] != null ? this.candidatesForm.controls['fatherName'].setValue(fathername) : null;


      const address1 = `${aadhaarResponseData.address.splitAddress.houseNumber != null ? aadhaarResponseData.address.splitAddress.houseNumber : ''}, ${aadhaarResponseData.address.splitAddress.street != null ? aadhaarResponseData.address.splitAddress.street : ''}, ${aadhaarResponseData.address.splitAddress.location != null ? aadhaarResponseData.address.splitAddress.location : ''}`;
      const address2 = `${aadhaarResponseData.address.splitAddress.postOffice != null ? aadhaarResponseData.address.splitAddress.postOffice : ''}, ${aadhaarResponseData.address.splitAddress.subdistrict != null ? aadhaarResponseData.address.splitAddress.subdistrict : ''}`;
      const address3 = aadhaarResponseData.address.splitAddress.landmark != null ? `${aadhaarResponseData.address.splitAddress.landmark}` : '';
      this.candidatesForm.controls['presentAddressdetails'] != null ? this.candidatesForm.controls['presentAddressdetails'].setValue(address1) : null;
      this.candidatesForm.controls['presentAddressdetails1'] != null ? this.candidatesForm.controls['presentAddressdetails1'].setValue(address2) : null;
      this.candidatesForm.controls['presentAddressdetails2'] != null ? this.candidatesForm.controls['presentAddressdetails2'].setValue(address3) : null;
      this.candidatesForm.controls['presentPincode'] != null ? this.candidatesForm.controls['presentPincode'].setValue(aadhaarResponseData.address.splitAddress.pincode) : null;
      this.candidatesForm.controls['presentCountryName'] != null ? this.candidatesForm.controls['presentCountryName'].setValue(environment.environment.DefaultCountryId_India) : null;
      this.candidatesForm.controls['presentCity'] != null ? this.candidatesForm.controls['presentCity'].setValue(aadhaarResponseData.address.splitAddress.vtcName != null ? aadhaarResponseData.address.splitAddress.vtcName : '') : null;

      this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(address1) : null;
      this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(address2) : null;
      this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(address3) : null;
      this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue(environment.environment.DefaultCountryId_India) : null;
      this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(aadhaarResponseData.address.splitAddress.pincode) : null;
      this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue(aadhaarResponseData.address.splitAddress.vtcName != null ? aadhaarResponseData.address.splitAddress.vtcName : '') : null;


      this.onboardingService.GetStateListByCountryId(environment.environment.DefaultCountryId_India).subscribe((result) => {
        if (result && result.length > 0) {
          let stateId = result.find(a => a.Name.toUpperCase() == aadhaarResponseData.address.splitAddress.state.toUpperCase()).Id;
          this.candidatesForm.controls['presentStateName'] != null ? this.candidatesForm.controls['presentStateName'].setValue((Number(stateId) == Number(0) || stateId == null) ? null : (Number(stateId))) : null;
          this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue((Number(stateId) == Number(0) || stateId == null) ? null : (Number(stateId))) : null;
          this.StateList = result;
          this.StateList1 = result;
        }

      })

      console.log('VAL ::', this.candidatesForm.value);

      this.candidatesForm.controls['firstName'].disable();
      this.candidatesForm.controls['dateOfBirth'].disable();

      var urll = 'data:image/png;base64,' + encodeURIComponent(aadhaarResponseData.image);
      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);



    }
    //     house
    // ,street,vtc
    // ,po,subdist,dist, country, pc

  }

  // Pre laoding api calls for edit
  do_Edit() {
    this.loadingScreenService.startLoading();
    this.disableBtn = false;
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
        this.shouldShowRejectBtn = this._NewCandidateDetails.CreatedBy != this.UserId ? true : false;
        this.DataBinding_for_Edit();
      }
      else {
        // this._location.back();
        // var path = localStorage.getItem('previousPath');
        // this.router.navigateByUrl(path);
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${apiResponse.Message}`);

      }
    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });
  }

  getSkillaAndZoneByStateAndIndustry() {
    if(this._NewCandidateDetails.LstCandidateOfferDetails) {
      let stateid = this._NewCandidateDetails.LstCandidateOfferDetails[0].State
      let industryId = this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId
      if (industryId && stateid) {
        this.onboardingService.getSkillaAndZoneByStateAndIndustry(industryId, stateid)
          .subscribe(response => {
            const apiResult: apiResult = response;
            if (apiResult.Status && apiResult.Result != "") {
              this.SkillCategoryList = [];
              this.filteredSkillCategoryList = [];
              this.ZoneList = [];
              this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);              
              this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
              this.filteredSkillCategoryList = this.SkillCategoryList
              this.ZoneList = this.OfferInfoListGrp1.ZoneList;
              if (this.ZoneList.length > 0) {
                this.candidatesForm.get('zone').setValue(this.ZoneList[0].Id);
              }
              this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == 0 ? null : (this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory)) : null;
            }
          },
            ((err) => {
  
            }));
      }
    }
 
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
      this.disableBtn = false;
      let mode = this.Id == 0 ? 1 : 2; // add-1, edit-2, view, 3
      this.isEditMode = this.Id == 0 ? true : false;
      // RE-OFFER - START
      //  this.IsReOffer == true ?( mode = 1, this.isEditMode = true) : null;
      // RE-OFFER - END
      var isExistsGroupControl = false;
      isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == 2 ? "Detailed" : "Flash";
      this.UIBuilderService.doApply(mode, this, this.MenuId, isExistsGroupControl == false ? "" : this.GroupControlName);
      // this.candidatesForm.controls['emergencyContactPersonName'] != null ? this.updateValidation(false, this.candidatesForm.get('emergencyContactPersonName')) : true;
      // this.candidatesForm.controls['emergencyContactnumber'] != null ? this.updateValidation(false, this.candidatesForm.get('emergencyContactnumber')) : true;

      //Enable fields
      this.candidatesForm.controls['ClientId'].enable();
      this.candidatesForm.controls['clientContract'].enable();
      this.candidatesForm.controls['clientSPOC'].enable();

      if (this.RoleCode == 'Candidate') {
        this.isValidateCandidate = false;
      }

      this.adjustFormControlValidationForAllenDigital();

    } catch (Exception) {

      console.log("exception ", Exception);

    }

    this.isDocumentInfo == true ? this.doCheckAccordion("isDocumentInfo") : null;

    this.candidateDetails = this._NewCandidateDetails;
    this.OldcandidateOfferDetails[0] = this._NewCandidateDetails.LstCandidateOfferDetails;

    if (this.router.url.includes('onboarding_revise')) {
      // make module transaction id = 0 for new offer
      this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId = 0;
      this.candidateOfferDetails.ModuleTransactionId = 0;
    }

    this.CandidateAcceptanceStatus = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus == AcceptanceStatus.AL_Rejected || this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus == AcceptanceStatus.OL_Rejected ? true : false;
    this.CandidateAcceptanceRejectRemarks = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks : '';
    this.ApprovalStatus = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalStatus == ApprovalStatus.Rejected ? true : false;
    // For Candidate Information accordion  (Edit)

    this.IsAadhaarKYC = this._NewCandidateDetails.IsAadhaarKYCVerified;
    this.IsUANKYC = this._NewCandidateDetails.IsUANKYCVerified;
    this.IsPANKYC = this._NewCandidateDetails.IsPANKYCVerified;



    this.candidatesForm.controls['firstName'].setValue(this._NewCandidateDetails.FirstName);
    this.candidatesForm.controls['gender'] != null ? this.candidatesForm.controls['gender'].setValue(this._NewCandidateDetails.Gender == 0 as any ? null : this._NewCandidateDetails.Gender) : null;

    this.candidatesForm.controls['MotherName'].setValue(this._NewCandidateDetails.MotherName);

    this.candidatesForm.controls['dateOfBirth'] != null ? this.candidatesForm.controls['dateOfBirth'].setValue((this._NewCandidateDetails.DateOfBirth == null ? null : this.datePipe.transform(new Date(this._NewCandidateDetails.DateOfBirth).toString(), "dd-MM-yyyy"))) : null;
    this.filterMartialStatus()
    // if (this.candidatesForm.controls['dateOfBirth'].value == "01-01-0001") {
    //   this.candidatesForm.controls['dateOfBirth'].setValue(null);
    // }

    if (this.RoleCode == "Candidate") {

      this.candidatesForm.controls['NameasPerProof'].setValue(this._NewCandidateDetails.NameasPerProof);
      this.candidatesForm.controls['DOBasPerProof'].setValue((this._NewCandidateDetails.DOBasPerProof == null ? null : this.datePipe.transform(new Date(this._NewCandidateDetails.DOBasPerProof).toString(), "dd-MM-yyyy")));

    }

    this.DOB = this._NewCandidateDetails != null && this._NewCandidateDetails.DateOfBirth != null ? this._NewCandidateDetails.DateOfBirth : null;

    if (this.candidateDetails.RelationshipId != Relationship.Father && this.candidateDetails.RelationshipId > 0) {
      this.updateValidation(false, this.candidatesForm.get('fatherName'));
      this.updateValidation(true, this.candidatesForm.get('relationshipType'));
      this.updateValidation(true, this.candidatesForm.get('relationshipName'));
      this.nameofrelationship = this.relationship1.find(a => a.id == this._NewCandidateDetails.RelationshipId).name;
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


      //  this.candidatesForm.controls['isOLcandidateacceptance'] != null ? this.candidatesForm.controls['isOLcandidateacceptance'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL : false) : false;
      //  this.candidatesForm.controls['isAlaccept'] != null ? this.candidatesForm.controls['isAlaccept'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL : false) : false;


      if (this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == OnBoardingType.Proxy) {

        this.updateValidation(true, this.candidatesForm.get('proxyRemarks'));
        this.candidatesForm.controls['proxyRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ProxyRemarks);

      }
      this.alternativeUserId_For_Mandates = this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestedBy;
      this.ClientId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId; // 3rd Party
      this.MandateAssignmentId = this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId; // 3rd party
      this.candidatesForm.controls['onBehalfRemarks'] != null ? this.candidatesForm.controls['onBehalfRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamProxyRequest) : null;
      this.candidatesForm.controls['proxyRemarks'] != null ? this.candidatesForm.controls['proxyRemarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ProxyRemarks) : null;
      this.candidatesForm.controls['ClientId'] != null ? this.candidatesForm.controls['ClientId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId) : null;
      this.candidatesForm.controls['clientContract'] != null ? this.candidatesForm.controls['clientContract'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId) : null;
      this.ClientContractId = (this.candidatesForm.get('clientContract').value);

      // this.doCheckAdditionalColumns(); -- NREQ
      // this.getOnboardingConfiguration(); -- NREQ

      var temp = new Array();
      // this will return an array with strings "1", "2", etc.
      temp = this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != "" && this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != undefined ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC.split(",") : [];
      this.ccmailtags = temp;

      this.candidatesForm.controls['mandateName'] != null ? this.candidatesForm.controls['mandateName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].MandateRequirementId) : null;
      this.candidatesForm.controls['candidateName'] != null ? this.candidatesForm.controls['candidateName'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId) : null;
      this.candidatesForm.controls['clientSPOC'] != null ? this.candidatesForm.controls['clientSPOC'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContactId) : null;
      this.candidatesForm.controls['onApprovalType'] != null ? this.candidatesForm.controls['onApprovalType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsClientApprovedBasedOn == 1 ? "online" : "attachment") : null;
      this.candidatesForm.controls['sourceType'] != null ? this.candidatesForm.controls['sourceType'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType != 0 as any) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].SourceType : null) : null;
      // this.candidatesForm.controls['sourceType'].setValue(1);
      this.ApprovalRemarks = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ApprovalRemarks : null;
      this.isFresher = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].IsFresher : false;
      this.candidatesForm.controls['_isFresher'] != null ? this.candidatesForm.controls['_isFresher'].setValue(this.isFresher) : false
      this.isWorkExperienceFlag = this.isFresher;

      this.candidatesForm.controls['MarriageDate'] != null ? this.candidatesForm.controls['MarriageDate'].setValue(this._NewCandidateDetails.MarriageDate == '0001-01-01T00:00:00' as any ? null : new Date(this._NewCandidateDetails.MarriageDate)) : null;

      this.candidatesForm.controls['Religion'] != null ? this.candidatesForm.controls['Religion'].setValue(this._NewCandidateDetails.Religion == 0 ? null : this._NewCandidateDetails.Religion) : null;
      this.candidatesForm.controls['Division'] != null ? this.candidatesForm.controls['Division'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Division):null;
      this.candidatesForm.controls['Category'] != null ? this.candidatesForm.controls['Category'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Category):null;
      this.candidatesForm.controls['Department'] != null ? this.candidatesForm.controls['Department'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].DepartmentId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].DepartmentId): null;
      
      // ADDITIONAL ONBOARDING INFO
      if (this.isAdditionalInfo) {        
        // this.additionalColumns.MarriageDate = (this._NewCandidateDetails.MarriageDate == '0001-01-01T00:00:00' as any) ? null : this._NewCandidateDetails.MarriageDate;
        // this.additionalColumns.Religion = this._NewCandidateDetails.Religion;
        // this.additionalColumns.Department = this._NewCandidateDetails.LstCandidateOfferDetails[0].DepartmentId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].DepartmentId;

        // this.additionalColumns.Division = this._NewCandidateDetails.LstCandidateOfferDetails[0].Division;
        this.additionalColumns.Level = this._NewCandidateDetails.LstCandidateOfferDetails[0].Level;
        this.additionalColumns.SubEmploymentType = this._NewCandidateDetails.LstCandidateOfferDetails[0].SubEmploymentType;

        this.additionalColumns.JobProfile = this._NewCandidateDetails.LstCandidateOfferDetails[0].JobProfileId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].JobProfileId;


        this.additionalColumns.SubEmploymentCategory = this._NewCandidateDetails.LstCandidateOfferDetails[0].SubEmploymentCategory == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].SubEmploymentCategory;

        this.additionalColumns.CostCityCenter = this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCityCenter == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCityCenter;
        this.additionalColumns.EmploymentZone = this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentZone == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentZone;
        
        // this.additionalColumns.Building = this._NewCandidateDetails.LstCandidateOfferDetails[0].Building == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].Building;

      }

      // if(this.isAdditionalOperationalInfo){
      this._NewCandidateDetails.AdditionalOperationalDetails != null ? this.additionalOperationalDetails = this._NewCandidateDetails.AdditionalOperationalDetails : true;
      // }
      if (
        this._NewCandidateDetails &&
        this._NewCandidateDetails.LstCandidateOfferDetails &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this.additionalOperationalDetails
      ) {
        const firstOfferDetail = this._NewCandidateDetails.LstCandidateOfferDetails[0];

        if (firstOfferDetail.Id) {
          this.additionalOperationalDetails.OfferDetailsId = firstOfferDetail.Id;
        }
      }

      this.apiCallMadeForAdditionalOperationals = true;

      console.log('this.additionalOperationalDetails 10', this.additionalOperationalDetails);

      // For Offer Information accordion (Edit)
      // ignore to fill data in offer information for make an offer
      if (!this.router.url.includes('onboarding_revise')) {
        this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.controls['industryType'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId) == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId) : null;
        this.candidatesForm.controls['location'] != null ? this.candidatesForm.controls['location'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Location) : null;

        this.candidatesForm.controls['reportingLocation'] != null ? this.candidatesForm.controls['reportingLocation'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].ReportingLocation) : null;

        this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == 0 ? null : (this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory)) : null;
        this.candidatesForm.controls['designation'] != null ? this.candidatesForm.controls['designation'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].DesignationId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].DesignationId) : null;
        this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone == 0 ? null : (this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone)) : null;
        this.candidatesForm.controls['Remarks'] != null ? this.candidatesForm.controls['Remarks'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SalaryRemarks) : null;
        
        if (this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType == 1) {
          this.DateOfJoining = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining != "0001-01-01T00:00:00" ? this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining : null;
        } else {
          this.DateOfJoining = this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining : null;
        }
        this.candidatesForm.controls['insuranceplan'] != null ? this.candidatesForm.controls['insuranceplan'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].InsurancePlan) : null;

        this.candidatesForm.controls['Gmc'] != null ? this.candidatesForm.controls['Gmc'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount) : 0;
        this.candidatesForm.controls['Gpa'] != null ? this.candidatesForm.controls['Gpa'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount) : 0;
        this.candidatesForm.controls['NoticePeriod'] != null ? this.candidatesForm.controls['NoticePeriod'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays) : null;
        this.candidatesForm.controls['expectedDOJ'] != null ? this.candidatesForm.controls['expectedDOJ'].setValue((this.datePipe.transform(this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining, "dd-MM-yyyy"))) : null;

        // this.candidatesForm.controls['reportingTime'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].ReportingTime))

        this.candidatesForm.controls['joiningTime'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].JoiningTime))

        this.candidatesForm.controls['AadhaarNumber'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].Aadhaar))



        // if (this.candidatesForm.controls['expectedDOJ'].value == "01-01-0001") {
        //   this.candidatesForm.controls['expectedDOJ'].setValue(null);
        // }
        this.candidatesForm.controls['tenureType'] != null ? this.candidatesForm.controls['tenureType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType == null || (this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType == -1 as any) ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType) : null;
        this.candidatesForm.controls['tenureEndate'] != null ? this.candidatesForm.controls['tenureEndate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate) : null) : null;
        this.candidatesForm.controls['tenureMonth'] != null ? this.candidatesForm.controls['tenureMonth'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval : null) : null;
        var tenureEvent = {
          id: 0
        }
        this.candidatesForm.controls['tenureType'] != null && this.candidatesForm.controls['tenureType'] != undefined ? tenureEvent.id = (this.candidatesForm.get('tenureType').value == null || this.candidatesForm.get('tenureType').value == -1 ? null : this.candidatesForm.get('tenureType').value) : null;
        this.candidatesForm.controls['tenureType'] != null && this.onchangeTenureValidation(tenureEvent);

        this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidatesForm.controls['onCostInsuranceAmount'].setValue((this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != null || this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance != "" as any) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance : null) : null;
        this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidatesForm.controls['fixedDeductionAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].FixedInsuranceDeduction) : null;
        this.candidatesForm.controls['monthlyAmount'] != null ? this.candidatesForm.controls['monthlyAmount'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount == 0 || this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].MonthlyBillingAmount) : null;

        this.candidatesForm.controls['ActualDOJ'] != null ? this.candidatesForm.controls['ActualDOJ'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != "0001-01-01T00:00:00" && this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining != null ? new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining) : null) : null;
        // if (this.candidatesForm.controls['ActualDOJ'].value == "01-01-0001") {
        //   this.candidatesForm.controls['ActualDOJ'].setValue(null);
        // }


        this.candidatesForm.controls['EffectivePayPeriod'] != null ? this.candidatesForm.controls['EffectivePayPeriod'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId : null) : null;
        this.candidatesForm.controls['TeamId'] != null ? this.candidatesForm.controls['TeamId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null) : null;
        this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ManagerId : null) : null;
        this.candidatesForm.controls['LeaveGroupId'] != null ? this.candidatesForm.controls['LeaveGroupId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LeaveGroupId : null) : null;
        this.candidatesForm.controls['CostCodeId'] != null ? this.candidatesForm.controls['CostCodeId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].CostCodeId : null) : null;
        this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidatesForm.controls['AppointmentLetterTemplateId'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId : null) : null;
        this.candidatesForm.controls['employmentType'] != null ? this.candidatesForm.controls['employmentType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType != 0 as any ? this._NewCandidateDetails.LstCandidateOfferDetails[0].EmploymentType : null) : null;
      }
      this.StateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].State;
      this.CityId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CityId;
      this.isRateSetValid = true;
      this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = true;
      this.IsMinimumwageAdhere = this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere;
      // ignore to fill data in offer information for make an offer
      if (!this.router.url.includes('onboarding_revise')) {
        if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
          this.candidatesForm.controls['salaryType'] != null ? this.candidatesForm.controls['salaryType'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType == 0 as any || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType == null ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType) : null;
          // if (this.candidatesForm.controls['salaryType'] != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType != 1) {
          //   this.candidatesForm.controls['annualSalary'] != null ? this.candidatesForm.controls['annualSalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary * 12) : null;
          // } else {
          //   this.candidatesForm.controls['annualSalary'] != null ? this.candidatesForm.controls['annualSalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary) : null;
          // }
          this.candidatesForm.controls['annualSalary'] != null ? this.candidatesForm.controls['annualSalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary) : null;
          this.candidatesForm.controls['paystructure'] != null ? this.candidatesForm.controls['paystructure'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId == 0 ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId) : null;
          this.candidatesForm.controls['MonthlySalary'] != null ? this.candidatesForm.controls['MonthlySalary'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary) : null;
          this.candidatesForm.controls['forMonthlyValue'] != null ? this.candidatesForm.controls['forMonthlyValue'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].IsMonthlyValue) : null;
          this.SalaryFormat = (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary);
          this.isESICapplicable = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;
        }
        this.candidatesForm.controls['letterTemplate'] != null ? this.candidatesForm.controls['letterTemplate'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId : null) : null;
      }
      // For Candidate other details accordion (Edit)
      this.candidatesForm.controls['isAadharExemptedState'] != null ? this.candidatesForm.controls['isAadharExemptedState'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsAadhaarExemptedState) : null;
      this.candidatesForm.controls['isPANNoExists'] != null ? this.candidatesForm.controls['isPANNoExists'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsPANExists) : null;
      this.candidatesForm.controls['haveApplied'] != null ? this.candidatesForm.controls['haveApplied'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].IsPanApplied) : null;
      this.candidatesForm.controls['ackowledgmentNumber'] != null ? this.candidatesForm.controls['ackowledgmentNumber'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].PANAckowlegementNumber) : null;

      // this.candidatesForm.controls['EPSStatus'] != null ? this.candidatesForm.controls['EPSStatus'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].EPSStatus) : null;

      // this.candidatesForm.controls['PRAN'] != null ? this.candidatesForm.controls['PRAN'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].PRAN) : null;

      this.candidatesForm.controls['bloodGroup'] != null ? this.candidatesForm.controls['bloodGroup'].setValue(this._NewCandidateDetails.BloodGroup != null && this._NewCandidateDetails.BloodGroup != 0 ? this._NewCandidateDetails.BloodGroup : null) : null;

      this.candidatesForm.controls['maritalStatus'] != null ? this.candidatesForm.controls['maritalStatus'].setValue(this._NewCandidateDetails.MaritalStatus != null && this._NewCandidateDetails.MaritalStatus != 0 ? this._NewCandidateDetails.MaritalStatus : null) : null;

    }
    if (this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0) {
      this.candidatesForm.controls['PAN'] != null ? this.candidatesForm.controls['PAN'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PAN) : null;

      this.candidatesForm.controls['PANNO'] != null ? this.candidatesForm.controls['PANNO'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PAN) : null;

      if (this.candidatesForm.controls['PANNO'] !== null && this.candidatesForm.controls['PANNO'].value !== null && this.candidatesForm.controls['isPANNoExists'] != null && this.candidatesForm.controls

      ['isPANNoExists'].value == true) {
        this.updateValidation(true, this.candidatesForm.get('PANNO'));
      } else {
        if (this.router.url.includes('candidate_information') && this.candidatesForm.controls['isPANNoExists'] != null && this.candidatesForm.controls['isPANNoExists'].value) {
          this.updateValidation(this.candidatesForm.controls['isPANNoExists'].value, this.candidatesForm.get('PANNO'));
        }
      }
      this.candidatesForm.controls['UAN'] != null ? this.candidatesForm.controls['UAN'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].UAN) : null;
      // this.candidatesForm.controls['PFNumber'] != null ? this.candidatesForm.controls['PFNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].PFNumber) : null;
      this.candidatesForm.controls['ESICNumber'] != null ? this.candidatesForm.controls['ESICNumber'].setValue(this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].ESICNumber) : null;
    }

    // this.candidateMiscellanousDetails = this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.MiscellaneousData != null && this._NewCandidateDetails.CandidateOtherData.MiscellaneousData.length > 0 ? this._NewCandidateDetails.CandidateOtherData.MiscellaneousData : null;
    // For Candidate Communication accordion  (Edit)
    if (this._NewCandidateDetails.CandidateCommunicationDtls != null) {
      let _addressDetails: AddressDetails[] = [];
      _addressDetails = this._NewCandidateDetails.CandidateCommunicationDtls.LstAddressdetails;
      try {
        _addressDetails.forEach(element => {
          if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Present) {
            this.candidatesForm.controls['presentAddressdetails'] != null ? this.candidatesForm.controls['presentAddressdetails'].setValue(element.Address1) : null;
            this.candidatesForm.controls['presentAddressdetails1'] != null ? this.candidatesForm.controls['presentAddressdetails1'].setValue(element.Address2) : null;
            this.candidatesForm.controls['presentAddressdetails2'] != null ? this.candidatesForm.controls['presentAddressdetails2'].setValue(element.Address3) : null;
            this.candidatesForm.controls['presentCountryName'] != null ? this.candidatesForm.controls['presentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
            this.candidatesForm.controls['presentPincode'] != null ? this.candidatesForm.controls['presentPincode'].setValue(element.PinCode) : null;
            this.candidatesForm.controls['presentStateName'] != null ? this.candidatesForm.controls['presentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
            this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['presentCity'].setValue((Number(element.City) == Number(0) || element.City == null) ? null : (Number(element.City))) : null;
          }
          if (element.CommunicationCategoryTypeId == CommunicationCategoryType.Permanent) {
            this.candidatesForm.controls['permanentAddressdetails'] != null ? this.candidatesForm.controls['permanentAddressdetails'].setValue(element.Address1) : null;
            this.candidatesForm.controls['permanentAddressdetails1'] != null ? this.candidatesForm.controls['permanentAddressdetails1'].setValue(element.Address2) : null;
            this.candidatesForm.controls['permanentAddressdetails2'] != null ? this.candidatesForm.controls['permanentAddressdetails2'].setValue(element.Address3) : null;
            this.candidatesForm.controls['permanentCountryName'] != null ? this.candidatesForm.controls['permanentCountryName'].setValue((Number(element.CountryName) == Number(0) || element.CountryName == null) ? null : (Number(element.CountryName))) : null;
            this.candidatesForm.controls['permanentPincode'] != null ? this.candidatesForm.controls['permanentPincode'].setValue(element.PinCode) : null;
            this.candidatesForm.controls['permanentStateName'] != null ? this.candidatesForm.controls['permanentStateName'].setValue((Number(element.StateName) == Number(0) || element.StateName == null) ? null : (Number(element.StateName))) : null;
            this.candidatesForm.controls['permanentCity'] != null ? this.candidatesForm.controls['permanentCity'].setValue((Number(element.City) == Number(0) || element.City == null) ? null : (Number(element.City))) : null;
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

        console.log('****BANK DETAILS CHECK ***', checkBankId, this._NewCandidateDetails.LstCandidateBankDetails);

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
          IsNominee: element.IsNominee,
          IsDependent: element.IsDependent,
          WeddingDate: element.WeddingDate,
          IsAlive: element.IsAlive,
          FamilyEmployeeID: element.FamilyEmployeeID,
          Occupation: element.Occupation,
        })
        element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Family_Details");

      });

      console.log(this.LstNominees);

    }

    // For Employment Reference Details
    if (this._NewCandidateDetails.EmploymentReferenceDetails != null && this._NewCandidateDetails.EmploymentReferenceDetails.length > 0) {
      this.LstReference = [];
      this._NewCandidateDetails.EmploymentReferenceDetails.forEach(element => {
        this.LstReference.push(element);
      });
    }

    // For Language Known Details
    if (this._NewCandidateDetails.LanguagesKnownDetails != null && this._NewCandidateDetails.LanguagesKnownDetails.length > 0) {
      this.LstLanguageKnown = [];
      this._NewCandidateDetails.LanguagesKnownDetails.forEach(element => {
        this.LstLanguageKnown.push(element);
      });
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
          EndDate: this.datePipe.transform(element.EndDate, "dd-MM-yyyy"),

          OldEmployeeId: element.OldEmployeeId,
          HREmailID: element.HREmailID,
          ManagerName: element.ManagerName,
          ManagerEmailID: element.ManagerEmailID,
          ManagerContactNumber: element.ManagerContactNumber,
          ManagerDesignation: element.ManagerDesignation,

        })

        element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Experience_Details");

      });
    }

    // For Candidate Documents accordion (Edit)
    console.log('ddd', this._NewCandidateDetails.LstCandidateDocuments);
    console.log('profile ', this.DocumentCategoryist);

    // FIX FOR BUG ID #3165
    if (this.utitlityService.isNullOrUndefined(this.contentmodalurl) && this._NewCandidateDetails.LstCandidateDocuments && this.BusinessType != 3) {
      console.log('PROFILE PICTURE -->', this.contentmodalurl);
      this.BindingProfilePicWhileEditing();
    }

    if (this._NewCandidateDetails.LstCandidateDocuments != null) {
      this._NewCandidateDetails.LstCandidateDocuments.forEach(element => {
        if (element.IsSelfDocument == true) {

          this.lstDocumentDetails.push(element);
          if ((element.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && element.Status == ApprovalStatus.Approved)) {

            if (this.isDocumentInfo) {
              this.candidatesForm.controls['AadhaarNumber'].disable();
              this.candidatesForm.controls['AadhaarNumber'].setValue(Number(element.DocumentNumber))
            }
          }

          if ((element.DocumentTypeId == environment.environment.PANDocumentTypeId && element.Status == ApprovalStatus.Approved)) {

            if (this.isDocumentInfo) {
              this.candidatesForm.controls['PAN'].disable();
              this.candidatesForm.controls['PAN'].setValue(Number(element.DocumentNumber))
            }
          }
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
              IsKYCVerified: (this.RoleCode == 'Candidate' && this.IsAadhaarKYC && element.Status != 1) ? false : (this.RoleCode == 'Candidate' && this.IsAadhaarKYC && element.Status == 1) ? true : (this.RoleCode == 'Candidate' && !this.IsAadhaarKYC && element.Status == 1) ? false : (this.RoleCode == 'Candidate' && !this.IsAadhaarKYC && element.Status != 1) ? false : element.DocumentVerificationMode == 1 ? false : true,
            }
          )

          element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Document_Details");


        }
        // New Changes
        else {
          // New Changes
          this.lstDocumentDetails_additional.push(element);
        }
        // New Changes
      });
    }


    // var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
    // if (isAadhaarExists != undefined) {
    //   this.napsForm.controls['AadhaarNumber'].setValue(Number(isAadhaarExists.DocumentNumber))
    //   isAadhaarExists.Status == 1 ? this.napsForm.controls['AadhaarNumber'].disable() : true;
    // }


    // For Client Approval accordion (Edit)
    if (this._NewCandidateDetails.ExternalApprovals != null && !this.router.url.includes('onboarding_revise')) {
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
    console.log('jdjfjds', this.clientApprovalTbl);

    // For Client Approval accordion (Edit)
    if (this.router.url.includes('onboarding_revise') && this._NewCandidateDetails.ExternalApprovals != null) {
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

    // this.Id != 0 && this.candidatesForm.get('requestFor').value == 'AL'
    //             && (this.clientApprovalTbl.find(a => a.ApprovalFor == ApprovalFor.CandidateJoiningConfirmation) != null)
    //            && environment.environment.RequestType_isDisabled == true ? this.candidatesForm.controls['requestFor'].disable() : null;

    if (!this.router.url.includes('onboarding_revise')) {
      if (this.Id != 0 && this.clientApprovalTbl.find(a => a.ApprovalFor == ApprovalFor.CandidateJoiningConfirmation) != null) {
        this.candidatesForm.controls['requestFor'].setValue("AL");
        this.onRequestFor("AL");
        if (environment.environment.RequestType_isDisabled == true) {
          this.candidatesForm.controls['requestFor'].disable();
        }
      }
    }

    this.onSourceTypeAsTransfer(); // only ops new request

    if (this.candidatesForm.get('requestFor').value.toString() === "AL") {

      this.updateValidation(false, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(false, this.candidatesForm.get('letterTemplate'));
      this.updateValidation(true, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(true, this.candidatesForm.get('TeamId'));
      this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
      this.isAllenDigital && this.updateValidation(true, this.candidatesForm.get('joiningTime'));

      this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' && this.IsReporingManagerRequired == true ? this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;
    }
    else {
      this.updateValidation(true, this.candidatesForm.get('expectedDOJ'));
      this.updateValidation(true, this.candidatesForm.get('letterTemplate'));

      this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));
      this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
      this.updateValidation(false, this.candidatesForm.get('TeamId'));
      this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
      this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));
      this.isAllenDigital && this.updateValidation(false, this.candidatesForm.get('joiningTime'));
      if (this.isAllenDigital) {
        this.updateValidation(true, this.candidatesForm.get('TeamId'));
      }
      // this.candidatesForm.controls['ManagerId'] != null ? this.updateValidation(false, this.candidatesForm.get('ManagerId')) : true;
      this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' && this.IsReporingManagerRequired == true ? this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;
    }

    if (this.candidatesForm.controls['requestFor'].value == 'AL' && this.router.url.includes('onboarding_revise')) {
      if (environment.environment.RequestType_isDisabled == true) {
        this.candidatesForm.controls['requestFor'].disable();

      }
    }

    // if (this.ClientContractId > 0) {
    //   this.getDynamicFieldDetailsConfig(this.CompanyId, this.ClientId, this.ClientContractId).then(() =>
    //     console.log("Task Complete!")
    //   );
    // }

    if (this.RoleCode == 'Candidate' && this.aadhaarDetails != null && this.aadhaarDetails != undefined) {
      this.patchAadhaarDetails();
    }
    this.disableBtn = true;
  }



  // New Changes
  BindingProfilePicWhileEditing() {

    if (this._NewCandidateDetails.LstCandidateDocuments != null) {
      this._NewCandidateDetails.LstCandidateDocuments.forEach(element => {
        if (this.DocumentCategoryist != null && this.DocumentCategoryist.length > 0 && element.IsSelfDocument == false && this.DocumentCategoryist.find(a => a.Code == 'ProfileAvatar') != undefined && (element.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == 'ProfileAvatar').DocumentTypeId) == true) {
          var contentType = this.fileuploadService.getContentType(element.FileName);
          if (contentType === 'application/pdf' || contentType.includes('image')) {
            try {

              this.fileuploadService.getObjectById(element.DocumentId)
                .subscribe(dataRes => {
                  try {
                    console.log('S3 BUKCKET DATA ::', dataRes);
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
                      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                      console.log(this.contentmodalurl);
                    }
                  } catch (error) {
                    alert(error)
                  }
                });
            } catch (error) {

              alert('ERROR :: ' + error)
            }

          }
        }
        if (this.DocumentCategoryist != null && this.DocumentCategoryist.length > 0 && element.IsSelfDocument == false && this.DocumentCategoryist.find(a => a.Code == 'CandidateSignature') != undefined && (element.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == 'CandidateSignature').DocumentTypeId) == true) {
          var contentType = this.fileuploadService.getContentType(element.FileName);
          if (contentType === 'application/pdf' || contentType.includes('image')) {
            try {

              this.fileuploadService.getObjectById(element.DocumentId)
                .subscribe(dataRes => {
                  try {
                    console.log('S3 BUKCKET DATA ::', dataRes);
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
                      this.contentmodalurl1 = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                      console.log(this.contentmodalurl1);
                    }
                  } catch (error) {
                    alert(error)
                  }
                });
            } catch (error) {

              alert('ERROR :: ' + error)
            }

          }
        }
      });
    }
  }

  adjustFormControlValidationForAllenDigital() {

    if (this.isAllenDigital) {
      this.candidatesForm.controls['AadhaarNumber'] != null ? this.updateValidation(true, this.candidatesForm.get('AadhaarNumber')) : true;
      this.candidatesForm.controls['PAN'] != null ? this.updateValidation(true, this.candidatesForm.get('PAN')) : true;
      this.candidatesForm.controls['reportingLocation'] != null ? this.updateValidation(true, this.candidatesForm.get('reportingLocation')) : true;

      this.candidatesForm.controls['industryType'] != null ? this.updateValidation(true, this.candidatesForm.get('industryType')) : true;
      this.candidatesForm.controls['skillCategory'] != null ? this.updateValidation(true, this.candidatesForm.get('skillCategory')) : true;
      this.candidatesForm.controls['zone'] != null ? this.updateValidation(true, this.candidatesForm.get('zone')) : true;

      this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' ? this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;

    }
  }
  // New Changes

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
      // RE-OFFER - START
      //  this.IsReOffer == true ?( mode = 1, this.isEditMode = true) : null;
      // RE-OFFER - END
      // This method is called once and a list of permissions is stored in the permissions property
      // Call API to retrieve the list of actions this user is permitted to perform. (Details / Flash provided here.)
      // In this case, the method returns a Promise, but it could have been implemented as an Observable
      var isExistsGroupControl = false;
      isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      this.GroupControlName = event == 'proxy' ? "Detailed" : "Flash";
      console.log('this.GroupControlName', this.GroupControlName);
      console.log('isExistsGroupControl', isExistsGroupControl);

      this.UIBuilderService.doApply(mode, this, this.MenuId, isExistsGroupControl == false ? "" : this.GroupControlName);
      // this.candidatesForm.controls['emergencyContactPersonName'] != null ? this.updateValidation(false, this.candidatesForm.get('emergencyContactPersonName')) : true;
      // this.candidatesForm.controls['emergencyContactnumber'] != null ? this.updateValidation(false, this.candidatesForm.get('emergencyContactnumber')) : true;

      //Enable fields
      this.candidatesForm.controls['ClientId'].enable();
      this.candidatesForm.controls['clientContract'].enable();
      this.candidatesForm.controls['clientSPOC'].enable();

      if (this.RoleCode == 'Candidate') {
        this.isValidateCandidate = false;
      }
      this.adjustFormControlValidationForAllenDigital();
      this.relationshipNameType(this.candidatesForm.get('relationshipNameType').value);

      if (this.isNewTransfer && this.BusinessType == 3) {
        this.candidatesForm.controls['sourceType'].setValue(2);

      }

      if (this.GroupControlName == 'Detailed') {
        this.updateValidation(this.candidatesForm.get('isPANNoExists').value, this.candidatesForm.get('PANNO'));
      } else {
        this.updateValidation(false, this.candidatesForm.get('PANNO'));
      }


      this.onRequestFor(this.candidatesForm.get('requestFor').value)
      if (this.Id != 0 && this.clientApprovalTbl.find(a => a.ApprovalFor == ApprovalFor.CandidateJoiningConfirmation) != null) {
        this.candidatesForm.controls['requestFor'].setValue("AL");
        this.onRequestFor("AL");
        if (environment.environment.RequestType_isDisabled == true) {
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
      this.DOJmaxDate.setDate(this.DOJmaxDate.getDate() + environment.environment.ExpectedDOJmaxDate);
      this.DOJmaxDate.setMonth(this.DOJmaxDate.getMonth());
      this.DOJmaxDate.setFullYear(this.DOJmaxDate.getFullYear());

      this.DOJminDate.setDate(this.DOJminDate.getDate() - environment.environment.ExpectedDOJminDate);
      this.DOJminDate.setHours(this.DOJminDate.getHours());
      this.DOJminDate.setFullYear(this.DOJminDate.getFullYear());


      this.updateValidation(false, this.candidatesForm.get('ActualDOJ'));

      if (this.previewCTC) {

        this.updateValidation(false, this.candidatesForm.get('TeamId'));
        // this.updateValidation(false, this.candidatesForm.get('ManagerId'));
        this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
        // this.updateValidation(false, this.candidatesForm.get('LeaveGroupId'));
        this.updateValidation(false, this.candidatesForm.get('AppointmentLetterTemplateId'));
        this.updateValidation(false, this.candidatesForm.get('EffectivePayPeriod'));
        this.isAllenDigital && this.updateValidation(false, this.candidatesForm.get('joiningTime'));
        if (this.isAllenDigital) {
          this.updateValidation(true, this.candidatesForm.get('TeamId'));
        }
        this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' && this.IsReporingManagerRequired == true ? this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;



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
        this.updateValidation(true, this.candidatesForm.get('EffectivePayPeriod'));
        this.isAllenDigital && this.updateValidation(true, this.candidatesForm.get('joiningTime'));

        this.updateValidation(true, this.candidatesForm.get('TeamId'));
        // this.updateValidation(true, this.candidatesForm.get('ManagerId'));
        this.updateValidation(true, this.candidatesForm.get('CostCodeId'));
        // this.updateValidation(true, this.candidatesForm.get('LeaveGroupId'));
        this.updateValidation(true, this.candidatesForm.get('AppointmentLetterTemplateId'));
        this.candidatesForm.controls['ManagerId'] != null && this.RoleCode != 'Candidate' && this.IsReporingManagerRequired == true ? this.updateValidation(true, this.candidatesForm.get('ManagerId')) : true;

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
    this.candidatesForm.controls['reportingLocation'] != null ? this.candidatesForm.controls['reportingLocation'].setValue(null) : null;
    this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(null) : null;
    this.candidatesForm.controls['zone'] != null ? this.candidatesForm.controls['zone'].setValue(null) : null;
    this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.controls['industryType'].setValue(null) : null;
    this.candidatesForm.controls['TeamId'] != null ? this.candidatesForm.controls['TeamId'].setValue(null) : null;
    this.candidatesForm.controls['CostCodeId'] != null ? this.candidatesForm.controls['CostCodeId'].setValue(null) : null;
    this.candidatesForm.controls['EffectivePayPeriod'] != null ? this.candidatesForm.controls['EffectivePayPeriod'].setValue(null) : null;
    this.candidatesForm.controls['LeaveGroupId'] != null ? this.candidatesForm.controls['LeaveGroupId'].setValue(null) : null;
    this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(null) : null;
    this.OfferInfoListGrp1 = null;

    this.SkillCategoryList = [];
    this.filteredSkillCategoryList = [];
    this.ZoneList = [];

    this.Id == 0 ? this.OfferInfoListGrp = undefined : null
    if (this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = null;
    }
    this.isRateCardType = false;
    if (item != null) {
      this.doCheckAdditionalColumns();
      this.refreshContractAndContact(item.Id);
      this.getOnboardingConfiguration();
    }


  }

  onChangeContract(item: ClientContractList) {
    console.log('item CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC', item);

    this.ClientContractId = item.Id;
    this.doAccordionLoading('isOfferInfo');
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

    // this.getDynamicFieldDetailsConfig(this.CompanyId, this.ClientId, this.ClientContractId).then(() => console.log("Task Complete!"));
    this.isDynamicApiCalled = false;
    this.getDynamicFieldDetailsConfig(this.CompanyId, this.ClientId, this.ClientContractId).then(() => console.log("Task Complete!"));

  }

  refreshContractAndContact(ClientId): any {
    return new Promise((resolve, reject) => {
      this.ClientId = ClientId;
      console.log('onboarding info ::', this.OnBoardingInfoListGrp);
      if ((this.OnBoardingInfoListGrp.ClientContractList != null && this.OnBoardingInfoListGrp.ClientContractList.length > 0)) {
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
    try {
      if (control) {
        if (value) {
          control.setValidators([Validators.required]);
        } else {
          control.clearValidators();
          control.setErrors(null);
        }
        control.updateValueAndValidity();
      }
    }
    catch (error) {
      console.log('VALIDATION CONTROL CATCH ERR ::', error, value, control);

    }

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

    if (this.LetterTemplateList.length == 0) {
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
  }


  onFocus_OfferAccordion(newValue, Formindex) {

    console.log('newValue """""""""""', newValue);
    console.log('Formindex """""""""""', Formindex);

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

  onChangeWorkLocation(event: ClientLocationList) {
    if (event == null) {
      this.WorkCity = null
      this.WorkState = null;
    } else {
      this.WorkCity = event.CityName
      this.WorkState = event.StateName
    }
    if (!this.isAllenDigital) {
      this.onChangeOfferLocation(event, 'DOM')
    }
  }

  onChangeOfferLocation(event: ClientLocationList, atWhatAction: string = "DOM") {
    
    if (event == null) {
      this.CityName = null;
      this.StateName = null;
    }
    else {
      this.CityName = event.CityName;
      this.StateName = event.StateName;
      if(atWhatAction == 'DOM') {
        this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(null) : null;
        this.candidatesForm.controls['reportingLocation'] != null ? this.candidatesForm.controls['reportingLocation'].setValue(null) : null;  
      }

    }
    // ! FOR ITC - to clear branch and distributor when location is changed
    if (this.isDynamicFieldLoaded && this.DynamicFieldDetails && this.DynamicFieldDetails.ControlElemetsList) {
      if (this.DynamicFieldDetails.ControlElemetsList.some(a => a.ParentFields !== null && Array.isArray(a.ParentFields) && a.ParentFields[0] === 'location')) {
        this.DynamicFieldDetails.ControlElemetsList.forEach(controlElem => {
          if (event == null && this.candidatesForm.get('location').value == null) {
            controlElem.Value = null;
          } else {
            controlElem.Value = (controlElem.Value != null && Number(controlElem.Value) === event.Id) ? controlElem.Value : null;
          }
        });
      }
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
            this.filteredSkillCategoryList = [];
            this.ZoneList = [];
            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);            
            this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
            this.filteredSkillCategoryList = this.SkillCategoryList;
            this.ZoneList = this.OfferInfoListGrp1.ZoneList;
            if (this.ZoneList.length > 0) {
              this.candidatesForm.get('zone').setValue(this.ZoneList[0].Id);
            }
            if(this.isEditMode) {
              this.candidatesForm.controls['skillCategory'] != null ? this.candidatesForm.controls['skillCategory'].setValue(this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == 0 ? null : (this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory == Number("") ? null : this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory)) : null;
            }
          }
        },
          ((err) => {

          }));      
    }

    if (atWhatAction == "DOM") {
      event != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('location').value), 'location') : null;
    }
  }

  onChangeIndustryType(event, atWhatAction: string = 'DOM') {
    console.log(event);
    if (atWhatAction == 'DOM') {
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
              this.filteredSkillCategoryList = [];
              this.ZoneList = [];
              this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
              this.filteredSkillCategoryList = this.SkillCategoryList
              this.ZoneList = this.OfferInfoListGrp1.ZoneList;
              if (this.ZoneList.length > 0) {
                this.candidatesForm.get('zone').setValue(this.ZoneList[0].Id);
              }
            }
          },
            ((err) => {
            }));

    }

    event != null ? this.onFocus_OfferAccordion((this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.get('industryType').value : 0), 'industryType') : null;




  }

  onChangePayGroup(event) {

    event != null && (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId), 'paystructure') : null;

  }

  onChangeSalary(event) {
    if (event != undefined) {

      this.PayGroupList = [];
      this.candidatesForm.controls['paystructure'] != null ? this.candidatesForm.controls['paystructure'].setValue(null) : true;
      this.PayGroupList = this.OfferInfoListGrp.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
      this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);

      if (this.PayGroupList && this.PayGroupList.length > 0 && this.PayGroupList.length == 1) {
        this.candidatesForm.controls['paystructure'].setValue(this.PayGroupList[0].PayGroupId);
      }
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

    const requestForValue = this.candidatesForm.get('requestFor').value.toString();
    const expectedDOJValue = this.candidatesForm.get('expectedDOJ').value;

    if (this.EffectivePayPeriodList.length > 0 && requestForValue === "OL") {
      if (this.DateOfJoining != null) {
        var expectedDOJDate = new Date(this.DateOfJoining);
        console.log('EFPPID :: ', this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
        this.candidatesForm.controls['EffectivePayPeriod'].setValue(this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
      }
    }
    if (this.EffectivePayPeriodList.length > 0 && this.isAllenDigital) {
      var expectedDOJDate = new Date(this.DateOfJoining);
      this.candidatesForm.controls['EffectivePayPeriod'].setValue(this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
    }



    // }
  }

  findNavigation() {
    let allFields = this.candidatesForm.controls;
    let erorrValue = [];
    let selectedLabel = [
      "industryType",
      "skillCategory",
      "zone",
      "salaryType",
      "MonthlySalary",
      "paystructure",
      "letterTemplate",
      "annualSalary",
      "reportingLocation",
      "designation",
    ];
    if(this.isAllenDigital) {
      selectedLabel.push("location")
    }
    for (const name in allFields) {
      if (allFields[name].invalid) {
        erorrValue.push(name);
        console.log("name", name);
        if (
          selectedLabel.includes(name) &&
          name !== "ActualDOJ" &&
          name !== "expectedDOJ"
        ) {
          if (this.candidatesForm.controls[name].invalid) {
            let spacedName = name.replace(/([A-Z])/g, " $1").trim();
            let capitalLetter =
              spacedName.charAt(0).toUpperCase() + spacedName.slice(1);
            this.alertService.showWarning(
              capitalLetter +
              " is required; kindly fill it out and try again."
            );
            this.findField.offerInfoAccordion(name);
            break;
          }
        }
      }
    }
  }



  PreviewCTC(): void {

    try {


      let isValid = false;
      let isDirty = false;
      if (


        (this.isAllenDigital ? this.candidatesForm.controls['location'].valid : true) &&
        (this.candidatesForm.controls['industryType'] != null && this.candidatesForm.controls['industryType'].valid) &&
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
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.");
          this.findField.offerInfoAccordion(name);
          return;
        }
        else if (this.candidatesForm.get('requestFor').value.toString() === "OL" && (this.candidatesForm.get('expectedDOJ').value == null || this.candidatesForm.get('expectedDOJ').value == undefined)) {
          isValid = false;
          this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.");
          this.findField.offerInfoAccordion(name);
          return;
        }
        else if (this.asciiCount > 0) {
          this.alertService.showWarning("Entered special characters are not valid in Designation field.")
          return;
        }
        else {
          isValid = true;
        }
      } else {

        isValid = false;
        this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.");
        this.findNavigation();
        return;
      }

      if (
        this.candidatesForm.controls['location'].dirty ||
        (this.candidatesForm.controls['industryType'] != null && this.candidatesForm.controls['industryType'].dirty) ||
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
        this.previewCTC_OfferDetails.IndustryId = this.candidatesForm.controls['industryType'] != null ? this.candidatesForm.get('industryType').value : 0;
        this.previewCTC_OfferDetails.State = Number(this.StateId)
        this.previewCTC_OfferDetails.CityId = Number(this.CityId)
        this.previewCTC_OfferDetails.ClientContractId = Number(this.ClientContractId);
        this.previewCTC_OfferDetails.ClientId = Number(this.ClientId);
        this.previewCTC_OfferDetails.SkillCategory = this.candidatesForm.get('skillCategory').value;
        this.previewCTC_OfferDetails.Zone = this.candidatesForm.get('zone').value;
        this.previewCTC_OfferDetails.Location = this.candidatesForm.get('location').value;
        (this.candidatesForm.get('reportingLocation').value != 0 && this.candidatesForm.get('reportingLocation').value != null) ? this.previewCTC_OfferDetails.ReportingLocation = this.candidatesForm.get('reportingLocation').value : true;
        this.previewCTC_OfferDetails.DateOfJoining = DOJ;
        this.DOB != null && this.DOB != undefined ? this.previewCTC_OfferDetails.DOB = moment(this.DOB).format('YYYY-MM-DD').toString() : true;

        this.previewCTC_OfferDetails.ActualDateOfJoining = DOJ;
        this.previewCTC_OfferDetails.GMCAmount = this.candidatesForm.get('Gmc').value == null ? 0 : this.candidatesForm.get('Gmc').value;;
        this.previewCTC_OfferDetails.GPAAmount = this.candidatesForm.get('Gpa').value == null ? 0 : this.candidatesForm.get('Gpa').value;;
        this.previewCTC_OfferDetails.NoticePeriodDays = this.candidatesForm.controls['NoticePeriod'] != null ? this.candidatesForm.get('NoticePeriod').value == null ? 0 : this.candidatesForm.get('NoticePeriod').value : 0;;
        this.previewCTC_OfferDetails.OnCostInsurance = this.candidatesForm.controls['onCostInsuranceAmount'] != null ? (this.candidatesForm.get('onCostInsuranceAmount').value == null || this.candidatesForm.get('onCostInsuranceAmount').value == '') ? 0 : this.candidatesForm.get('onCostInsuranceAmount').value : 0;
        this.previewCTC_OfferDetails.IsRateSetValid = this._NewCandidateDetails.Id == undefined ? true : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid;

        this.previewCTC_OfferDetails.IsMinimumwageAdhere = this._NewCandidateDetails.Id == undefined ? true : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere;

        this.previewCTC_OfferDetails.CalculationRemarks = this._NewCandidateDetails.Id == undefined ? "" : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks;

        this.previewCTC_OfferDetails.LstPayGroupProductOverrRides =
          this._NewCandidateDetails.Id == undefined ? [] : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides;

        this.previewCTC_OfferDetails.Gender = this.candidatesForm.get('gender').value == undefined || this.candidatesForm.get('gender').value == null ? 0 : this.candidatesForm.get('gender').value;

        // CalculationRemarks

        // this.previewCTC_OfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount').value;
        this.previewCTC_OfferDetails.FixedInsuranceDeduction = this.candidatesForm.controls['fixedDeductionAmount'] != null ? (this.candidatesForm.get('fixedDeductionAmount').value != null && this.candidatesForm.get('fixedDeductionAmount').value != "") ? this.candidatesForm.get('fixedDeductionAmount').value : 0 : 0;

        this.previewCTC_OfferDetails.LetterTemplateId = this.candidatesForm.controls['letterTemplate'] != null ? this.candidatesForm.get('letterTemplate').value != null && this.candidatesForm.get('letterTemplate').value != 0 ? this.candidatesForm.get('letterTemplate').value : 0 : this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidatesForm.get('AppointmentLetterTemplateId').value != null && this.candidatesForm.get('AppointmentLetterTemplateId').value != 0 ? this.candidatesForm.get('AppointmentLetterTemplateId').value : 0 : null;
        console.log('before', this._NewCandidateDetails);

        let ListRateSet = [];
        // ListRateSet = this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        // this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        // this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
        // this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet;
        // console.log('after', this._NewCandidateDetails);
        this.DOB != null && this.DOB != undefined && this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].DOB = moment(this.DOB).format('YYYY-MM-DD').toString() : true;

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

    } catch (error) {
      this.alertService.showWarning(`An error occurred while previewing Salary Breakup :${error}`);
      return;
    }

  }

  fieldOpen(selectectLabel) {
    console.log("selectedLabel", selectectLabel);
    let candidateInfoArr = [
      "firstName",
      "gender",
      "email",
      "mobile",
      "dateOfBirth",
      "fatherName",
      "relationshipType",
      "relationshipName",
      "nationality",
      "emergencyContactnumber",
      "emergencyContactPersonName",
      "AadhaarNumber",
      "PAN"
    ];
    let onboardingRequestArr = [
      "ClientId",
      "clientContract",
      "clientSPOC",
      "proxyRemarks",
    ];
    let offerInformationArr = [
      "location",
      "reportingLocation",
      "industryType",
      "skillCategory",
      "designation",
      "zone",
      "salaryType",
      "annualSalary",
      "MonthlySalary",
      "paystructure",
      "letterTemplate",
      "expectedDOJ",
      "reportingTime",
      "tenureMonth",
      "tenureType",
      "tenureEndate",
      "insuranceplan",
      "onCostInsuranceAmount",
      "fixedDeductionAmount",
      "Gmc",
      "Gpa",
      "NoticePeriod",
      "ManagerId",
      "ccemail",
      "Remarks",
      "ActualDOJ",
      "TeamId",
      "EffectivePayPeriod",
      "LeaveGroupId",
      "CostCodeId",
      "AppointmentLetterTemplateId",
      "employmentType",
      "PSR Id",
      "District Code",
      "Branch",
      "Primary Distributor",
      "Secondary Distributor",
    ];
    let CommunicationDetailsArr = [
      "presentAddressdetails",
      "presentCountryName",
      "presentStateName",
      "presentCity",
      "presentPincode",
      "permanentAddressdetails",
      "permanentCountryName",
      "permanentStateName",
      "permanentCity",
      "permanentPincode",
    ];
    let AdditionalInfoArr = [
      // "Department",
      "JobProfile",
      "SubEmploymentType",
      // "Category",
      // "Division",
      "Level",
    ];
    let candiOtherDetailsDetailsArr = ["PANNO", "maritalStatus"];

    if (candidateInfoArr.find((item) => item === selectectLabel)) {
      this.doCheckAccordion("isCandidateInfo")
      this.findField.candidateInfoAccordion(selectectLabel)
    }
    else if (onboardingRequestArr.find((item) => item === selectectLabel)) {
      this.doCheckAccordion("isOnboardingInfo")
      this.findField.onbRequestAccordion(selectectLabel)

    } else if (offerInformationArr.find((item) => item === selectectLabel)) {
      this.doCheckAccordion("isOfferInfo")
      this.findField.offerInfoAccordion(selectectLabel)

    } else if (CommunicationDetailsArr.find((item) => item === selectectLabel)) {
      this.doCheckAccordion("isCommunicationdetails")
      this.findField.comDetailsAccordion(selectectLabel)

    } else if (AdditionalInfoArr.find((item) => item === selectectLabel)) {
      this.doCheckAccordion("isAdditionalInfo")
      this.findField.AdditionalInfoAccordion(selectectLabel)

    } else if (candiOtherDetailsDetailsArr.find((item) => item === selectectLabel)) {
      this.doCheckAccordion("isCandidateOtherdetails")
      this.findField.candiOtherDetailsAccordion(selectectLabel)

    }
  }

  confirmPrevieCTC() {
    console.log('MINIM', this._NewCandidateDetails.LstCandidateOfferDetails[0]);

    if ((this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {

      sessionStorage.removeItem('LstRateSet');
      sessionStorage.setItem('LstRateSet', JSON.stringify(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet));
      this.loadingScreenService.stopLoading();
      const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
      modalRef.componentInstance.id = 0;
      modalRef.componentInstance.baseDaysForAddlApplicableProduct = Number(this.baseDaysForAddlApplicableProduct);
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
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].WageType = result.LstCandidateRateSet[0].WageType;
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

        console.log(JSON.stringify(this.previewCTC_OfferDetails));
        this.previewCTC_OfferDetails.DateOfJoining = this.datePipe.transform(new Date(this.previewCTC_OfferDetails.DateOfJoining).toString(), "yyyy-MM-dd")
        this.previewCTC_OfferDetails.ActualDateOfJoining = this.datePipe.transform(new Date(this.previewCTC_OfferDetails.DateOfJoining).toString(), "yyyy-MM-dd")
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
              modalRef.componentInstance.baseDaysForAddlApplicableProduct = Number(this.baseDaysForAddlApplicableProduct);
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
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].WageType = result.LstCandidateRateSet[0].WageType;
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
    try {
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
          this.candidatesForm.get('annualSalary').value > 0 &&
          (this.isAllenDigital && this.candidatesForm.controls['reportingLocation'].valid)
          // this.DateOfJoining != null
          // this.candidatesForm.get('onCostInsuranceAmount').value > 0 &&

        ) {

          if (this.isAllenDigital && this.candidatesForm.controls['reportingLocation'].invalid) {
            isValid = false;
            this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
            return;
          }

          if (this.candidatesForm.get('tenureType').value == 1 && this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.get('tenureEndate').value == null) {
            isValid = false;
            this.alertService.showWarning("( * ) Denotes required field. Please check the form and Preview again.")
            return;
          }
          else if ((this.candidatesForm.get('tenureType').value == 2 && this.candidatesForm.controls['tenureMonth'] != null) && (this.candidatesForm.get('tenureMonth').value == null || this.candidatesForm.get('tenureMonth').value == '')) {

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
          else if (this.asciiCount > 0) {
            this.alertService.showWarning("Entered special characters are not valid in Designation field.")
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
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
            this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = this.candidatesForm.get('requestFor').value;
            this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount = this.candidatesForm.get('Gpa').value == null ? 0 : this.candidatesForm.get('Gpa').value;;
            this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount = this.candidatesForm.get('Gmc').value == null ? 0 : this.candidatesForm.get('Gmc').value;;
            this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays = this.candidatesForm.controls['NoticePeriod'] != null ? this.candidatesForm.get('NoticePeriod').value == null ? 0 : this.candidatesForm.get('NoticePeriod').value : 0;;
            this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType = this.candidatesForm.get('tenureType').value;
            // this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining = this.candidatesForm.get('ActualDOJ').value;           // no need
            this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate = this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.get('tenureEndate').value != null && this.candidatesForm.get('tenureEndate').value != '' ? this.datePipe.transform(new Date(this.candidatesForm.get('tenureEndate').value).toString(), "yyyy-MM-dd") : null;
            this.candidatesForm.get('requestFor').value == 'OL' ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = this.candidatesForm.get('letterTemplate').value : this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId = this.candidatesForm.get('AppointmentLetterTemplateId').value;
            this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureInterval = this.candidatesForm.controls['tenureMonth'] != null ? Number(this.candidatesForm.get('tenureMonth').value) : null;


            var req_post_param = JSON.stringify({

              ModuleProcessTranscId: this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
              CandidateDetails: this._NewCandidateDetails
            });

            console.log(req_post_param, 'req_post_param');


            console.log(JSON.stringify(req_post_param));
            this.onboardingService.postPreviewLetter(req_post_param)
              .subscribe(data => {

                this.loadingScreenService.stopLoading();


                let apiResult: apiResult = data;

                if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
                  console.log(apiResult.Result);
                  let base64 = apiResult.Result;
                  let contentType = 'application/pdf';
                  let fileName = "previewletter";
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
    } catch (error) {
      this.alertService.showWarning(`An error occurred while previewing letter :${error}`);
      return;
    }

  }
  // PreviewAndEditLetter(){
  //   //Remove Preview Letter and keep only Preview & edit
  //   //Need to stop letter generation, and modify communication email code to first check if document already present in DB take that else do onFly generation of Doc.
  //   //once html getter api is done , replace the api in the service file 
  //   let previewLetterHtmlContent: any;
  //   let base64String;
  //   let modalRef;
  //   const req_post_param = JSON.stringify({
  //     IsReturnasHTMLString: true,
  //     CandidateDetails: this._NewCandidateDetails
  //   });
  //   this.onboardingService.postPreviewLetter(req_post_param).pipe(takeUntil(this.stopper)).subscribe((data: any) => {
  //     base64String = data;
  //     console.log(base64String)
  //     // previewLetterHtmlContent = decodeURIComponent(escape(window.atob(base64String)));
  //     previewLetterHtmlContent = data;
  //     modalRef = this.modalService.open(PreviewEditHtmlComponent)
  //     modalRef.componentInstance.htmlContent = previewLetterHtmlContent;
  //   })
  //   //get the html base64 from api resp 
  //   //convert the base64 to html
  //   // pass the converted html to the modal to preview & edit
  //   modalRef.result.then((result) => {  

  //     if (result != "Modal Closed") {
  //       console.log(result);
  //       this.EditedLetterBase64 = btoa(result);
  //       this.IsLetterEdited = true;
  //       //edited html content is fetched here convert to pdf format for preview
  //       this.loadingScreenService.startLoading();
  //       var htmlToPDFSrc = new HtmlToPDFSrc()
  //       htmlToPDFSrc.htmldata = result.toString();
  //       htmlToPDFSrc.footer = "";
  //       htmlToPDFSrc.header = "";
  //       htmlToPDFSrc.hasHeader = true;
  //       htmlToPDFSrc.hasFooter = true;
  //       htmlToPDFSrc.headerHeight = 30;
  //       htmlToPDFSrc.footerHeight = 30;
  //       htmlToPDFSrc.baseUrlForCssAndImgs = "https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css";
  //       htmlToPDFSrc.putHeaderOnFirstPage = true;
  //       htmlToPDFSrc.putHeaderOnOddPages = true;
  //       htmlToPDFSrc.putHeaderOnEvenPages = true;
  //       htmlToPDFSrc.putFooterOnFirstPage = true;
  //       htmlToPDFSrc.putFooterOnOddPages = true;
  //       htmlToPDFSrc.putFooterOnEvenPages = true;
  //       htmlToPDFSrc.isPageNumRequired = true;
  //       let req = JSON.stringify(htmlToPDFSrc);
  //       console.log(htmlToPDFSrc, req)
  //       this.employeeService.DownLoadHTMLtoPDF(req).pipe(
  //         takeUntil(this.stopper)
  //       ).subscribe((result) => {
  //        console.log(result);
  //           const linkSource = 'data:application/pdf;base64,' + result.Result;
  //           let FileBytes = (linkSource.split(",")[1]);
  //           const downloadLink = document.createElement("a");
  //           const fileName = `editedLetter`;
  //           // const fileName = `${this.employeedetails.Code}_${this.FinancialYearDescription}_FormNo12BB.pdf`;
  //           downloadLink.href = linkSource;
  //           downloadLink.download = fileName;
  //           downloadLink.click();
  //           this.spinner_fileuploading = true;
  //        //call putCandidate api to upload this doc against the letterTransaction
  //         this.loadingScreenService.stopLoading();
  //       }, er => {
  //         this.loadingScreenService.stopLoading();
  //       }) 
  //     // send this converted pdf to the s3 for storage
  //     }

  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }

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

  onPanCard(event?: any) {
    if (this.candidatesForm.get('isPANNoExists').value == false) {
      this.candidatesForm.controls['haveApplied'].setValue(false);

      this.updateValidation(true, this.candidatesForm.get('PANNO'));
      this.updateValidation(false, this.candidatesForm.get('ackowledgmentNumber'));


    } else {
      this.updateValidation(false, this.candidatesForm.get('PANNO'));


    }
  }
  // function to restrict mobile number to 10 digits
  mobileNumberLengthRestrict(event: any, formCtrl: any) {
    if (event.target.value.length > 10) {
      formCtrl.setValue(event.target.value.slice(0, 10));
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
      this.onboardingService.getOnboardingInfo("isBankInfo", this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
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


  addContact() {
    const modalRef = this.modalService.open(CommunicationModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.LstEmergency = this.LstEmergency;
    var objStorageJson = JSON.stringify({ CandidateName: this.candidatesForm.get('firstName').value, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {

      if (result != "Modal Closed") {
        console.log(result);

        let isAlreadyExists = false;
        let isSameResult = false;
        let relationshipLst: any;
        relationshipLst = this.utilsHelper.transform(Relationship);
        result.RelationShip = relationshipLst.find(a => a.id == result.relationship).name;
        result.id = result.Id
        isAlreadyExists = _.find(this.LstEmergency, (a) => a.Id != result.Id && a.relationship == result.relationship) != null ? true : false;

        if (isAlreadyExists) {

          this.alertService.showWarning("The specified family detail already exists");

        } else {

          isSameResult = _.find(this.LstEmergency, (a) => a.Id == result.Id) != null ? true : false;
          if (isSameResult) {
            this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

          } else {
            this.angularGrid.gridService.addItemToDatagrid(result);
          }
        }

        console.log(this.LstEmergency);


      }

    }).catch((error) => {
      console.log(error);
    });
  }
  // open nominee popup modal screen

  addNominee(newString) {
    this.loadingScreenService.startLoading();
    this.onboardingService.getOnboardingInfo('isDocumentInfo', this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
      .subscribe(authorized => {
        this.loadingScreenService.stopLoading();
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
          modalRef.componentInstance.LstNominees = this.LstNominees as any;
          modalRef.componentInstance.maritalStatus = this.candidatesForm.get('maritalStatus').value;
          modalRef.componentInstance.OT = this.candidatesForm.get('onboardingType').value;
          modalRef.componentInstance.isESICapplicable = this.isESICapplicable;

          var objStorageJson = JSON.stringify({ CandidateName: this.candidatesForm.get('firstName').value, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
          modalRef.componentInstance.objStorageJson = objStorageJson;
          modalRef.result.then((result) => {

            if (result != "Modal Closed") {
              console.log(result);

              result.hasOwnProperty('WeddingDate') && result.WeddingDate != null ?
                result.WeddingDate = moment(new Date(result.WeddingDate)).format('YYYY-MM-DD') : true;
              let isAlreadyExists = false;
              let isSameResult = false;
              let relationshipLst: any;

              relationshipLst = this.utilsHelper.transform(Relationship);
              result.RelationShip = relationshipLst.find(a => a.id == result.relationship).name;
              result.isMedical = result.mediclaim == true ? "Yes" : "No";
              result.IDProof = result.idProoftype;
              // result.DateofBirth = this.datePipe.transform(result.DOB, "dd-MM-yyyy");
              result.DateofBirth = result.DOB;
              result.FamilyEmployeeID = result.FamilyEmployeeID;
              result.Occupation = result.Occupation;

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
                candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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
                candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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


              isAlreadyExists = _.find(this.LstNominees, (a) => a.Id != result.Id && a.relationship == result.relationship && ![Relationship['Son'], Relationship['Daughter']].includes(result.relationship)) != null ? true : false;

              if (isAlreadyExists) {

                this.alertService.showWarning("The specified family detail already exists");

              } else {

                isSameResult = _.find(this.LstNominees, (a) => a.Id == result.Id) != null ? true : false;
                if (isSameResult) {
                  this.LstNominees[this.LstNominees.findIndex(el => el.id === result.id)] = result;

                  // this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

                } else {
                  this.LstNominees.push(result);

                  // this.angularGrid.gridService.addItemToDatagrid(result);
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
      json_edit_object.idProoftype = json_edit_object.CandidateDocument.DocumentTypeId;

    }


    const modalRef = this.modalService.open(WorkexperienceModalComponent, this.modalOption);

    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.LstExperience = this.LstExperience;
    modalRef.componentInstance.LstWorkExperienceDocumentTypes = this.LstWorkExperienceDocumentTypes;

    var objStorageJson = JSON.stringify({ CandidateName: this.candidatesForm.get('firstName').value, IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
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
          candidateDets.DocumentCategoryId = this.LstWorkExperienceDocumentTypes.length > 0
            && result.idProoftype > 0 ? this.LstWorkExperienceDocumentTypes.find(a => a.DocumentTypeId == result.idProoftype).DocumentCategoryId : 0;
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
          candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;


        }
        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {


          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = this.LstWorkExperienceDocumentTypes.length > 0
            && result.idProoftype > 0 ? this.LstWorkExperienceDocumentTypes.find(a => a.DocumentTypeId == result.idProoftype).DocumentCategoryId : 0;
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
          candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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
          this.LstExperience[this.LstExperience.findIndex(el => el.id === result.id)] = result;

          // this.angularGrid_Experience.gridService.updateDataGridItemById(result.Id, result, true, true);

        } else {
          this.LstExperience.push(result);

          // this.angularGrid_Experience.gridService.addItemToDatagrid(result);
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
      json_edit_object.idProoftype = json_edit_object.CandidateDocument.DocumentTypeId;
    }

    const modalRef = this.modalService.open(AcademicModalComponent, this.modalOption);
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    var objStorageJson = JSON.stringify({ CandidateName: this.candidatesForm.get('firstName').value, IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstEducation = this.LstEducation;
    modalRef.componentInstance.LstEducationDocumentTypes = this.LstEducationDocumentTypes;

    modalRef.result.then((result) => {
      console.log(result);
      if (result != "Modal Closed") {

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {


          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = this.LstEducationDocumentTypes.length > 0
            && result.idProoftype > 0 ? this.LstEducationDocumentTypes.find(a => a.DocumentTypeId == result.idProoftype).DocumentCategoryId : 0;
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
          candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = this.LstEducationDocumentTypes.length > 0
            && result.idProoftype > 0 ? this.LstEducationDocumentTypes.find(a => a.DocumentTypeId == result.idProoftype).DocumentCategoryId : 0;
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
          candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;


        }
        else if (result.IsDocumentDelete == true && !this.isGuid(result.Id)) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = this.LstEducationDocumentTypes.length > 0
            && result.idProoftype > 0 ? this.LstEducationDocumentTypes.find(a => a.DocumentTypeId == result.idProoftype).DocumentCategoryId : 0;
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
          candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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

            this.LstEducation[this.LstEducation.findIndex(el => el.id === result.id)] = result;

            // this.angularGrid_Education.gridService.updateDataGridItemById(result.Id, result, true, true);

          } else {
            this.LstEducation.push(result);
            // this.angularGrid_Education.gridService.addItemToDatagrid(result);
          }

        }
      }


    }).catch((error) => {
      console.log(error);
    });
  }

  // open Bank info popup modal screen

  addBank(json_edit_object, actionName) {
    this.loadingScreenService.startLoading();
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

    this.onboardingService.getOnboardingInfo('isDocumentInfo', this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.ClientId == null ? 0 : this.ClientId) : 0)
      .subscribe(authorized => {
        this.loadingScreenService.stopLoading();
        let apiResult: apiResult = (authorized);
        try {
          this.DocumentList = JSON.parse(apiResult.Result);
          // if (this.Id != 0) {

          // if (json_edit_object != undefined && json_edit_object.CandidateDocument != null && json_edit_object.CandidateDocument.Status == 1) {
          //   this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
          //   return;
          // }

          if (json_edit_object == undefined && this.LstBank.length > 0 && this.LstBank.filter(a => a.DocumentStatus == "Approved" || a.DocumentStatus == "Pending").length > 0) {
            this.alertService.showWarning("The bank information have already been added. if the details are incorrect, kindly edit/remove them and input new ones, or get in touch with the support admin for more help.");
            return;
          }

          // this.doCheckAccordion("isBankInfo");   // For Bank Information Pre-loading data

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
          var objStorageJson = JSON.stringify({ CandidateName: this.candidatesForm.get('firstName').value, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
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
                candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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
                candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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

                this.alertService.showWarning("The bank information have already been added. if the details are incorrect, kindly edit/remove them and input new ones, or get in touch with the support admin for more help.");

              } else {

                let isSameResult = false;
                isSameResult = _.find(this.LstBank, (a) => a.Id == result.Id) != null ? true : false;

                if (isSameResult) {
                  this.LstBank[this.LstBank.findIndex(el => el.id === result.id)] = result;

                  // this.angularGrid_Bank.gridService.updateDataGridItemById(result.Id, result, true, true);

                } else {
                  this.LstBank.push(result);

                  // this.angularGrid_Bank.gridService.addItemToDatagrid(result);
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
      this.CityList1 = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId === this.candidatesForm.get('presentStateName').value),['Name'],['asc']);
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
      this.CityList1 = [];
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
          console.log(args.dataContext);

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

  doEmergencySlickGrid() {


    this.columnDefinitions_Emergency = [

      { id: 'nomineeName', name: 'Contact Person Name', field: 'nomineeName', sortable: true, },
      { id: 'RelationShip', name: 'Relationship', field: 'RelationShip', sortable: true, },
      { id: 'DateofBirth', name: 'Mobile Number', field: 'DateofBirth', sortable: true, },
      {
        id: 'edit',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e, args: OnEventArgs) => {
          this.addNominee(args.dataContext);
        }
      },
      {
        id: 'delete',
        field: 'id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon,
        minWidth: 30,
        maxWidth: 30,
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
    this.gridOptions_Emergency = this.common_gridOption;
  }


  doNomineeSlickGrid() {

    this.columnDefinitions = [

      { id: 'nomineeName', name: 'Nominee Name', field: 'nomineeName', sortable: true, },
      { id: 'RelationShip', name: 'Relationship', field: 'RelationShip', sortable: true, },
      { id: 'DateofBirth', name: 'Date of Birth', field: 'DateofBirth', sortable: true, formatter: Formatters.dateIso, },
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

    this.gridOptions = this.common_gridOption;

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
          this.doDeleteFile(args.DocumentId, null).then(() => {
            if (whicharea == "Education") {
              this.deletedLstEducation.push(args);
              var taskIndex = this.LstEducation.indexOf(args);
              if (taskIndex !== -1) {
                this.LstEducation.splice(taskIndex, 1);
              }
            } else if (whicharea == "Experience") {
              this.deletedLstExperience.push(args);
              var taskIndex = this.LstExperience.indexOf(args);
              if (taskIndex !== -1) {
                this.LstExperience.splice(taskIndex, 1);
              }
            }
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
            var taskIndex = this.LstNominees.indexOf(args);
            if (taskIndex !== -1) {
              this.LstNominees.splice(taskIndex, 1);
            }
          }
          else if (whicharea == "Experience") {
            this.deletedLstExperience.push(args);
            var taskIndex = this.LstExperience.indexOf(args);
            if (taskIndex !== -1) {
              this.LstExperience.splice(taskIndex, 1);
            }

          } else if (whicharea == "Education") {

            this.deletedLstEducation.push(args);
            var taskIndex = this.LstEducation.indexOf(args);
            if (taskIndex !== -1) {
              this.LstEducation.splice(taskIndex, 1);
            }
          }
          else if (whicharea == "Bank") {
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



  doBankSlickGrid() {

    let previewFormatter: Formatter;
    previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
      class="mdi mdi-eye m-r-xs"></i> View </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';


    this.columnDefinitions_Bank = [

      { id: 'bankFullName', name: 'Bank Name', field: 'bankFullName', sortable: true },
      { id: 'accountHolderName', name: 'Account Holder Name', field: 'accountHolderName', sortable: true },
      { id: 'accountNumber', name: 'Account Number', field: 'accountNumber', sortable: true },
      { id: 'bankBranchId', name: 'IFSC Code', field: 'bankBranchId', sortable: true },
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
          } else {
            // this.document_file_view(args.dataContext.CandidateDocument, 'Bank');
            this.document_file_view_old(args.dataContext.CandidateDocument, 'Bank');
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
          this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));
          // if (args.dataContext.DocumentStatus != "Approved") {
          //   this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));
          // }
          // else
          //  if (this.isDuplicateBankInfo) {
          //   this.addBank(args.dataContext, (((args.dataContext.bankName == null || args.dataContext.bankName == undefined || args.dataContext.bankName == '') && this.RoleCode == 'Recruiter') ? "StaticMode" : 'NormalMode'));

          // } else {
          //   this.alertService.showWarning("Note: The system must not allow you to change your bank information. because bank information has already been approved.");
          //   return;
          // }
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

  angularGridReady_Emergency(angularGrid: AngularGridInstance) {
    this.angularGrid_Emergency = angularGrid;
    this.gridObj1_Emergency = angularGrid && angularGrid.slickGrid || {};
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
    // this.ClientId = this.ClientId;
    this.ClientContractId = this.ClientContractId;

    this.onboardingService.getDocumentList(this.EntityId, this.CompanyId, this.ClientId, this.ClientContractId, 0)
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
            element['IsKYCVerified'] = false;
            if (this.isAllenDigital) {
              if (this.isPANMandatory) {
                if (element['DocumentTypeId'] == 21) {//PAN
                  element['IsMandatory'] = 'True'
                }
              } else if (!this.isPANMandatory) {
                if (this.candidatesForm.get('PAN').value) {
                  if (element['DocumentTypeId'] == 21) {//PAN
                    element['IsMandatory'] = 'True'
                  }
                } else {
                  if (element['DocumentTypeId'] == 22) {//PAN ACK
                    element['IsMandatory'] = 'True'
                  }
                }
              }
            }
          });

          this.documentTbl = [];
          this.DocumentList.forEach(element => {

            this.documentTbl.push(element);

          });


          console.log('docum', this.DocumentCategoryist);
          this.BindingProfilePicWhileEditing();
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
                  // element_new.Id = ele_edit.Id
                  element_new.IsKYCVerified = ele_edit.IsKYCVerified
                  element_new.Status = ele_edit.Status
                  element_new.CategoryType = tem_c;// element_new[tem_c.find(d=>d.Name)]

                }

              });


            });


          }



          console.log('documentTbl :::', this.documentTbl); if (this.Id == 0) {
            this.IsAadhaarKYC && this.KYCAadhaarDocumentId == 0 ? this.uploadAadhaarKYCFile(this.aadhaarDetails.file.pdfContent, `${this.aadhaarDetails.name.trim()}_aadhaarDoc.pdf`, "Aadhaar") : true;
            this.IsAadhaarKYC && this.KYCProfileDocumentId == 0 ? this.uploadAadhaarKYCFile(this.aadhaarDetails.image, `${this.aadhaarDetails.name.trim()}_profileAvatarDoc.png`, "Profile") : true;
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

  getFilteredCatType(catArr) {
    return catArr.filter((ele) => ele.isChecked);
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
  // //NEW Change
  // getFileList(item, whicharea) {

  //   console.log('item', item);

  //   let DocId = whicharea == 'ClientApproval' ? item.ObjectStorageId : item.DocumentId;
  //   this.docList = [];
  //   this.fileuploadService.getObjectById(DocId)
  //     .subscribe((dataRes) => {
  //       if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
  //         return;
  //       }
  //       var objDtls = dataRes.Result;
  //       console.log(objDtls);
  //       var zip = new JSZip();
  //       let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
  //       this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
  //       zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
  //         Object.keys(contents.files).forEach((filename) => {
  //           if (filename) {
  //             this.docList.push(contents.files[filename]);
  //           }
  //         });
  //       });
  //     })


  // }


  document_file_edit(item) {

    this.document_file_upload(item);

  }

  document_file_delete(item) {

    this.alertService.confirmSwal("Are you sure you want to delete this document?", "Do you really want to delete these document?  After you delete this item you will not able to get this!", "Yes, Delete").then(result => {
      console.log('item', item);
      this.doDelete_document(item);

    }).catch(error => {

    });

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
    console.log('last lst', this.lstDocumentDetails);

  }



  document_file_upload(item) {
    console.log(item);
    if (item.DocumentName == 'Non PAN holder') {
      let OldDocumentDetails = this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
      const modalRef = this.modalService.open(NoPanDeclarationModelComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.jsonObj = item;
      modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;

      var objStorageJson = JSON.stringify({ IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {


        console.log(result);

        if (result != "Modal Closed") {

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

            this.documentURL = null;
            this.documentURLId = null;
            this.documentURLId = item.DocumentId;
          }
          /* #endregion */
          result.CategoryType.forEach(element_doc => {
            var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete);
            console.log('non pan holder::: doc insert', doc);

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
      }).catch((error) => {
        console.log(error);
      });
    } else {
      let OldDocumentDetails = this._OldCandidateDetails != null && this._OldCandidateDetails.LstCandidateDocuments != null && this._OldCandidateDetails.LstCandidateDocuments.length > 0 ? this._OldCandidateDetails.LstCandidateDocuments : null;
      const modalRef = this.modalService.open(DocumentsModalComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.jsonObj = item;
      modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;
      modalRef.componentInstance.DocumentNumber = (item.DocumentTypeId == environment.environment.AadhaarDocumentTypeId) ? this.candidatesForm.get('AadhaarNumber').value : (item.DocumentTypeId == environment.environment.PANDocumentTypeId) ? this.candidatesForm.get('PAN').value : "";
      modalRef.componentInstance.IsNAPS = true;

      var objStorageJson = JSON.stringify({ IsCandidate: true, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {


        console.log(result);

        if (result != "Modal Closed") {

          if (item.DocumentTypeId == environment.environment.AadhaarDocumentTypeId) {
            this.candidatesForm.controls['AadhaarNumber'].setValue(result.DocumentNumber);
          }
          if (item.DocumentTypeId == environment.environment.PANDocumentTypeId) {
            this.candidatesForm.controls['PAN'].setValue(result.DocumentNumber);
          }

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

            this.documentURL = null;
            this.documentURLId = null;
            this.documentURLId = item.DocumentId;
            // // JSZIP
            // this.fileuploadService.getObjectById(this.documentURLId)
            //   .subscribe((dataRes) => {
            //     if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            //       return;
            //     }
            //     try {


            //     var objDtls = dataRes.Result;
            //     this.docList = [];
            //     console.log(objDtls);
            //     var zip = new JSZip();
            //     let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
            //     this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            //     zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            //       Object.keys(contents.files).forEach((filename) => {
            //         if (filename) {
            //           this.docList.push(contents.files[filename]);
            //         }
            //       });
            //     });
            //   } catch (error) {
            //         console.log('EX ZIP :', error);

            //   }
            //   })

            // // jszip
          }
          /* #endregion */



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
      ListDocumentList.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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

    console.log('state ::', this.StateList);

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

  onChangeInsurancePlan(item) {
    console.log('item', item);

    this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidatesForm.controls['onCostInsuranceAmount'].setValue(item.InsuranceAmount) : null;
    this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidatesForm.controls['fixedDeductionAmount'].setValue(item.InsuranceDeductionAmount) : null;
    this.candidatesForm.controls['Gmc'] != null ? this.candidatesForm.controls['Gmc'].setValue(item.GMC) : null;
    this.candidatesForm.controls['Gpa'] != null ? this.candidatesForm.controls['Gpa'].setValue(item.GPA) : null;
    item != null ? this.onFocus_OfferAccordion((this.candidatesForm.get('onCostInsuranceAmount').value), 'onCostInsuranceAmount') : null;

  }


  getMigrationMasterInfo(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {


      let apiResult: apiResult = (result);

      if (apiResult.Status && apiResult.Result != null) {
        this.MigrationInfoGrp = JSON.parse(apiResult.Result);

        this.TeamList = this.MigrationInfoGrp;
        var iii = this.MigrationInfoGrp.PaygroupProductOverridesList;
        // clientContractOperation changes
        if (this.MigrationInfoGrp && this.MigrationInfoGrp[0].ClientContractOperationList
          && this.MigrationInfoGrp[0].ClientContractOperationList.length > 0) {
          const clientContractOperationObj = this.MigrationInfoGrp[0].ClientContractOperationList[0];

          // check AdditionalApplicableProducts key is present in the object
          this.additionalApplicableProducts = clientContractOperationObj.hasOwnProperty('AdditionalApplicableProducts') ?
            clientContractOperationObj.AdditionalApplicableProducts : [];

          // check BreakupBasedays key is present in the object
          this.baseDaysForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasedays') ?
            clientContractOperationObj.BreakupBasedays : 0;

          // check MinimumWagesApplicableProducts key is present in the object
          this.minimumWagesApplicableProducts = clientContractOperationObj.hasOwnProperty('MinimumWagesApplicableProducts') ?
            clientContractOperationObj.MinimumWagesApplicableProducts : [];
          // set value in minimumWagesApplicableProducts - form control
          this.minimumWagesApplicableProducts && this.minimumWagesApplicableProducts.length > 0 ? this.candidatesForm.controls['minimumWagesApplicableProducts'].setValue(this.minimumWagesApplicableProducts[0].Code)
            : this.candidatesForm.controls['minimumWagesApplicableProducts'].setValue(null);
        }

        console.log('MigrationInfoGrp', this.MigrationInfoGrp, this.additionalApplicableProducts, this.minimumWagesApplicableProducts);
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
        this.AttendanceStartDate = this.MigrationInfoGrp[0].AttendanceStartDate != null ? new Date(this.MigrationInfoGrp[0].AttendanceStartDate) : this.DOJminDate;

        this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
        this.NoticePeriodDaysList.forEach(element => {
          element.Description = Number(element.Description);
        });
        let isZeroExist = this.NoticePeriodDaysList.length > 0 && this.NoticePeriodDaysList.filter(a => a.Description == 0).length > 0 ? true : false;

        if (this.NoticePeriodDaysList.length > 0 && (!isZeroExist && (this.candidatesForm.get('NoticePeriod').value == 0 || this.candidatesForm.get('NoticePeriod').value == null || this.candidatesForm.get('NoticePeriod').value == undefined))) {
          this.candidatesForm.get('NoticePeriod').setValue(this.NoticePeriodDaysList.find(a => a.Description == environment.environment.DefaultNoticePeriodDays).Description);
        }


        this.InsuranceList = this.MigrationInfoGrp[0].InsuranceList;
        this.DesignationList = this.MigrationInfoGrp[0].LstEmployeeDesignation;;
        this.filteredDesignationList = this.DesignationList;
        this.getDesignationList();
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
          if (this.LetterTemplateList && this.LetterTemplateList.length == 0) {
            this.doletterTemplate();
          }
        }


      } else {

      }

    }), ((error) => {

    })
  }
  onChangeNoticePeriod(event) {
    console.log('Notice Period :', event);
  }

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
    if (filterList.IsReportingManagerRequired) {
      this.IsReporingManagerRequired = true;

    }
    if (from_action === "DOM" && item != null && item.defaultManagerId > 0) {
      this.candidatesForm.controls['ManagerId'] != null ? this.candidatesForm.controls['ManagerId'].setValue(item.defaultManagerId) : null
    } else if (from_action === "DOM" && item != null && (item.defaultManagerId == 0 || item.defaultManagerId == null)) {
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

    const requestForValue = this.candidatesForm.get('requestFor').value.toString();
    const expectedDOJValue = this.candidatesForm.get('expectedDOJ').value;


    if (this.EffectivePayPeriodList.length > 0 && this.isAllenDigital) {
      if (expectedDOJValue != null && expectedDOJValue != undefined && expectedDOJValue != '') {
        var expectedDOJDate = new Date(expectedDOJValue);
        this.candidatesForm.controls['EffectivePayPeriod'].setValue(this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
      }
    }

    if (this.EffectivePayPeriodList.length > 0 && requestForValue === "OL") {
      if (expectedDOJValue != null && expectedDOJValue != undefined && expectedDOJValue != '') {
        var expectedDOJDate = new Date(expectedDOJValue);
        console.log('EFPPID :: ', this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
        this.candidatesForm.controls['EffectivePayPeriod'].setValue(this.getDateOfJoiningPeriod(expectedDOJDate as any, this.EffectivePayPeriodList));
      }
    }


  }

  getDateOfJoiningPeriod(dateOfJoining: string, payPeriods): number | null {
    const joiningDate = new Date(dateOfJoining);

    for (const payPeriod of payPeriods) {
      const startDate = new Date(payPeriod.StartDate);
      const endDate = new Date(payPeriod.EndDate);

      if (moment(joiningDate).format('YYYY-MM-DD') as any >= moment(startDate).format('YYYY-MM-DD') as any && moment(joiningDate).format('YYYY-MM-DD') as any <= moment(endDate).format('YYYY-MM-DD') as any) {
        return payPeriod.Id;
      }
    }

    return null;
  }

  /* #endregion */

  isNullOrWhiteSpace(value: any): boolean {
    if (value === null || value === undefined) {
      return true;
    }

    return (typeof value === 'string') ? value.trim() === '' : false;
  }

  public findInvalidControls() {
    this.invaid_fields = [];
    const invalid = [];
    const controls = this.candidatesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        this.invaid_fields.push(name);
        if (this.fieldOpen(name) == null) {
          break;
        }
      }
    }

    // console.log(' this.DynamicFieldDetails.ControlElemetsList', this.DynamicFieldDetails.ControlElemetsList);

    this.DynamicFieldDetails != null && !this.isEmptyObject(this.DynamicFieldDetails) && this.DynamicFieldDetails.ControlElemetsList.length > 0 && this.DynamicFieldDetails.ControlElemetsList.forEach(a => {
      console.log(' a.Value', a.Value);

      if (a.Validators != null && a.Validators.length > 0 && a.Validators[0].Name == 'required' && this.isNullOrWhiteSpace(a.Value)) {
        this.invaid_fields.push(a.Label);
        this.fieldOpen(a.Label);
      }
      else {
        while (this.invaid_fields.indexOf(a.Label) !== -1) {
          delete this.invaid_fields[this.invaid_fields.indexOf(a.Label)];
        }
      }
    });

    if (this.isAdditionalInfo) {

      const filteredValues = this.requiredAdditionalColumnSettingValue
        .filter(setting => setting.DisplayRoleCodes.includes(this.currentRoleCode))
        .filter(setting => setting.EntityTypes.includes(this.currentEntityType))
        .filter(setting => setting.MandatoryRoleCodes.includes(this.currentRoleCode))
      console.log(filteredValues);


      filteredValues.forEach(e1 => {
        if (this.failedFieldsForAdditionalInformation.find(a => a == e1.ColumnName) != undefined) {
          this.invaid_fields.push(this.failedFieldsForAdditionalInformation.find(a => a == e1.ColumnName));
        }
        // if (this.fieldOpen(e1.ColumnName) == null) {
        //   return;
        // }
      });
    }


    // this.invaid_fields.push(...this.failedFieldsForAdditionalInformation);
    console.log('this.failedFieldsForAdditionalInformation', this.failedFieldsForAdditionalInformation);
    console.log('invalid', invalid);

    if (this.invaid_fields != null) {
      for (let i = 0; i < this.invaid_fields.length; i++) {
        if (this.fieldOpen(this.invaid_fields[i]) == null) {
          break;
        }
      }
    }    
    return this.invaid_fields;
  }

  doSaveOrSubmit(index: any): void {

    console.log('this.lstDocumentDetails', this.lstDocumentDetails);

    const onCostInsuranceAmountControl = this.candidatesForm.get('onCostInsuranceAmount');
    if (onCostInsuranceAmountControl.value == "" || onCostInsuranceAmountControl.value == null || onCostInsuranceAmountControl.value == undefined) {
      onCostInsuranceAmountControl.setValue(0);
    }
    const fixedDeductionAmountControl = this.candidatesForm.get('fixedDeductionAmount');
    if (fixedDeductionAmountControl.value == "" || fixedDeductionAmountControl.value == null || fixedDeductionAmountControl.value == undefined) {
      fixedDeductionAmountControl.setValue(0);
    }

    const invalid = [];
    const controls = this.candidatesForm.controls;
    for (const name in controls) {
      if (controls[name].errors != null && controls[name].errors.hasOwnProperty('pattern') == true) {
        invalid.push(name);
      }
    }

    console.log('invdd pater', invalid);

    // if (this.candidatesForm.controls['isPANNoExists'] && this.candidatesForm.controls['isPANNoExists'].value == true) {
    //   if (this.candidatesForm.controls['PANNO'].value != null && this.candidatesForm.controls['PANNO'].value != '' && this.candidatesForm.controls['PANNO'].value != 'NULL') {
    //     let isValidPan = /[a-zA-Z]{3}[pPcCHhaAbBgGlLfFTtjJ]{1}[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{1}$/.test(this.candidatesForm.controls['PANNO'].value);
    //     if (!isValidPan) {
    //       this.alertService.showWarning("PAN Number is invalid or Please match the requested format. (Ex: ABCPD1234E)");
    //       this.loadingScreenService.stopLoading();
    //       return;
    //     }
    //   } else {
    //     console.log('PAN exists --->', this.candidatesForm.controls['PANNO']);
    //     this.alertService.showWarning("PAN Number is not entered or Please match the requested format. (Ex: ABCPD1234E)");
    //     this.loadingScreenService.stopLoading();
    //     return;
    //   }
    // }





    if (invalid != null && invalid != undefined && invalid.length > 0) {
      let listOfFields = []
      for (let i of invalid) {
        //listOfFields.push(i.toUpperCase() + i.substring(1))
        let element = i.replace(/([a-z])([A-Z])/g, '$1 $2')
        listOfFields.push(element[0].toUpperCase() + element.substring(1))
      }
      let action = index == "Submit" ? "Submit" : (index == "onlySave" ? "Save" : null);
      this.alertService.showWarning(`The mentioned fields having special charecters please change and ${action} : ${listOfFields}`);

    }
    else {
      console.log('DY VALUES ::', this.DynamicFieldDetails);
      // unused codee
      // if (this.DynamicFieldDetails.ControlElemetsList.filter(a => a.Validators != null && a.Validators[0].Name == 'required' && a.Value == null).length > 0) {
      //   this.alertService.showWarning(`Pleaes note following mentioned fields are required for submission : ${_.union(invalidDynamicFields).join(",")}`);
      //   return;
      // }
      if (this.candidatesForm.get('requestFor').value.toString() === "AL") {
        this.candidatesForm.controls['employmentType'] != null ? this.updateValidation(true, this.candidatesForm.get('employmentType')) : true;
      }
      // ! : Observations made while mentioning the client approval group was AL (candidate joining),The expected DOJ was getting cleared
      if (this.candidatesForm.get('requestFor').value.toString() === "OL") {
        if (this.DateOfJoining == null && this.candidatesForm.get('expectedDOJ').value != null && this.candidatesForm.get('expectedDOJ').value != undefined && this.candidatesForm.get('expectedDOJ').value != '') {
          this.DateOfJoining = new Date(this.candidatesForm.get('expectedDOJ').value);
        }
        this.isAllenDigital ? this.updateValidation(true, this.candidatesForm.get('employmentType')) : this.updateValidation(false, this.candidatesForm.get('employmentType'));
      }

      // this.ChildComponent.validateChildForm(true);
      console.log('this.DocumentList', this.DocumentList);
      if (this.isDocumentInfo && index == "Submit" && !this.utitlityService.isNullOrUndefined(this.candidatesForm.get('isDifferentlyabled').value) && this.candidatesForm.get('isDifferentlyabled').value == true) {
        if (this.utitlityService.isNullOrUndefined(this.candidatesForm.get('differentlyabledPercentage').value) || this.candidatesForm.get('differentlyabledPercentage').value < 0 || this.candidatesForm.get('differentlyabledPercentage').value > 100) {
          this.alertService.showWarning("If differently abled, please enter percentage.");
          this.findField.candidateInfoAccordion();
          return;
        }
        else if (this.candidatesForm.get('differentlyabledPercentage').value >= environment.environment.AmountOfDifferentlyabled) {
          // Fix for bug #5199
          if (Array.isArray(this.DocumentList) && this.DocumentList != null && this.DocumentList.length > 0 && !this.utitlityService.isNullOrUndefined(this.DocumentList.find(a => a.IsDisablityProof == 0)) && this.DocumentList.find(a => a.IsDisablityProof == 0).DocumentId == null) {
            this.alertService.showWarning("If differently abled, please upload a proof document.");
            this.findField.docDetailsAccordion();
            return;
          } else if (typeof (this.DocumentList) == 'object' && this.DocumentList != null && this.DocumentList.hasOwnProperty("DocumentCategoryist") && this.DocumentList['DocumentCategoryist'].find(a => a.IsDisablityProof == 0).DocumentId == null) {

            this.alertService.showWarning("If differently abled, please upload a proof document.");
            this.findField.docDetailsAccordion();
            return;
          }
        }
      }

      if (index != "Submit" && !this.apiCallMade && this.isAdditionalInfo) {
        this.failedFieldsForAdditionalInformation = [];
        for (const prop of Object.keys(this.additionalColumns)) {
          if (this.additionalColumns[prop] == null || this.additionalColumns[prop] == 0 || this.additionalColumns[prop] == "") {
            this.failedFieldsForAdditionalInformation.push(prop);
            this.fieldOpen(prop);
          }
        }
      }
      else if (index == "Submit" && !this.apiCallMade && this.isAdditionalInfo) {
        this.failedFieldsForAdditionalInformation = [];
        for (const prop of Object.keys(this.additionalColumns)) {
          if (this.additionalColumns[prop] == null || this.additionalColumns[prop] == 0 || this.additionalColumns[prop] == "") {
            this.failedFieldsForAdditionalInformation.push(prop);
            if (this.fieldOpen(prop) == null) {
              break;
            }
          }
        }
      }
      else if (this.apiCallMade && this.isAdditionalInfo) {
        this.onboardingAdditionalViewChild.ngOnDestroy();
      }

      if (this.RoleCode != 'Candidate' && this.apiCallMadeForAdditionalOperationals && this.isAdditionalOperationalInfo) {
        this.onboardingAdditionalOperationalViewChild.ngOnDestroy();
      }


      if (index == "Submit") {
        this.submitted = true;
        if (this.BusinessType == 3 && this.isCandidateOtherdetails) {
          const objIndex = this.documentTbl.findIndex((obj => obj.DocumentName == 'Non PAN holder'));
          this.documentTbl[objIndex].IsMandatory = "False";
          if ((this.candidatesForm.get('PANNO').value && this.candidatesForm.get('PANNO').value == '') ||
            (this.candidatesForm.get('haveApplied').value == false && this.candidatesForm.get('isPANNoExists').value == false)) {
            if ((this.router.url.includes('candidate_information') || this.GroupControlName == 'Detailed')) {
              if (objIndex > -1 && (this.documentTbl[objIndex].FileName == null || this.documentTbl[objIndex].FileName == '')) {
                this.documentTbl[objIndex].IsMandatory = "True";
                this.alertService.showWarning("Please upload \'NO PAN DECLARATION\' from document details !");
                this.findField.docDetailsAccordion();
                console.log('non-pan-mandatory', this.documentTbl, objIndex);
                return;
              } else {
                this.documentTbl[objIndex].IsMandatory = "False";
              }
            } else {
              if (objIndex > -1) {
                this.documentTbl[objIndex].IsMandatory = "False";
              }
            }
            console.log('non-pan', this.documentTbl, objIndex);
          }
        }
        if (this.BusinessType != 3 && this.candidatesForm.controls.requestFor.value === 'AL') {
          this.updateValidation(false, this.candidatesForm.get('CostCodeId'));
          this.candidatesForm.controls['CostCodeId'].setValue(this.CostCodeList.length == 0 ? null : this.CostCodeList[0].Id);
        }





        if (this.candidatesForm.invalid) {
          this.findInvalidControls();
          this.alertService.showWarning("Uh-oh! Before you move forward, please ensure all mandatory fields are filled in. Don't leave anything blank! ");
          return;

        }
        if (this.invaid_fields.length > 0) {
          this.findInvalidControls();
          this.alertService.showWarning("Uh-oh! Before you move forward, please ensure all mandatory fields are filled in. Don't leave anything blank! ");
          return;
        }


      }

      // 1. client name, client Contract, cleint location ,name, these - only on save click ;
      if (index == "onlySave") {
        console.log(this.candidatesForm.get('email').valid);

        if ((this.candidatesForm.controls['ClientId'].value == null) ||
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
        // if(!this.candidatesForm.get('email').valid){
        //   this.alertService.showWarning("Please enter valid email (pattern mismatch)");
        //   return;
        // }
        if ((this.candidatesForm.controls['mobile'].value).length != 10) {
          this.alertService.showWarning("Mobile Number should be minimum 10 characters")
          return;
        }
      }
      if (this.candidatesForm.get('mobile').value != null && this.candidatesForm.get('emergencyContactnumber').value != null
        && this.candidatesForm.get('mobile').value != '' && this.candidatesForm.get('emergencyContactnumber').value != ''
        && this.candidatesForm.get('mobile').value != undefined && this.candidatesForm.get('emergencyContactnumber').value != undefined
        && this.candidatesForm.get('emergencyContactnumber').value == this.candidatesForm.get('mobile').value) {
        this.alertService.showWarning('The alternate mobile number should not be the same as the mobile number.')
        return;
      }



      if (this.isInvalidCandidateInformation) {
        this.alertService.showWarning(this.DuplicateCheckMessage);
        return;
      }


      if (index == "Submit" && this.isOfferInfo && this.previewCTC && this._NewCandidateDetails.LstCandidateOfferDetails == undefined && this.candidatesForm.get('sourceType').value == 2) {
        this.alertService.showWarning("Hold on! It seems you forgot to preview the candidate CTC. Kindly take a moment to review and verify all details before submitting. ");
        this.findField.offerInfoAccordion('ctc');
        return;
      }
      if (index == "Submit" && this.isOfferInfo && this.previewCTC && this._NewCandidateDetails.LstCandidateOfferDetails == undefined && this.BusinessType !== 3) {
        this.alertService.showWarning("Hold on! It seems you forgot to preview the candidate CTC. Kindly take a moment to review and verify all details before submitting. ");
        this.findField.offerInfoAccordion('ctc');
        return;
      }

      if ((this.candidatesForm.get('permanentCountryName').value == 100) && (this.candidatesForm.get('permanentStateName').value == 4)) {
        this.isAssamState = true;
      } else {
        this.isAssamState = false;
      }



      if (this.isCandidateOtherdetails) {
        this.findInvalidControls();

        if (this.LstNominees.length > 0 && this.candidatesForm.controls['maritalStatus'].value == 1) {
          if (!!this.LstNominees.find((nominee: any) => [3, 4, 5, 7, 8].includes(nominee.relationship))) {
            this.alertService.showWarning("You cannot choose an unrelated relationship since your marital status is single. Please try again with a different option. :) Family Details");
            this.findField.familyDetailsAccordion();
            return
          }
        }

      }
      // if (this.isOfferInfo && this.previewLetter && !this.isRateSetValid) {
      //   if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
      //     this.alertService.showWarning("Hold on! It seems you forgot to preview the candidate CTC. Kindly take a moment to review and verify all details before submitting. ")
      //     return;
      //   }

      // }
      // if (this.isOfferInfo && this.previewLetter && this.isRateSetValid) {
      //   if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
      //     this.alertService.showWarning("Hold on! It seems you forgot to preview the candidate CTC. Kindly take a moment to review and verify all details before submitting. ")
      //     return;
      //   }

      // }


      if (this.isOfferInfo && this.previewCTC && index == "Submit") {
        if (this._NewCandidateDetails.LstCandidateOfferDetails != null
          && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0
          && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null
          && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0
          && (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null || this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length == 0)) {
          this.alertService.showWarning("Hold on! It seems you forgot to preview the candidate CTC. Kindly take a moment to review and verify all details before submitting. ");
          this.findField.offerInfoAccordion('ctc');
          return;
        }

      }

      // if (this.isOfferInfo && this.previewLetter && index == "Submit" && !this.isRateSetValid) {
      //   if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
      //     this.alertService.showWarning("Hold on! It seems you forgot to preview the candidate CTC. Kindly take a moment to review and verify all details before submitting. ")
      //     return;
      //   }
      // }

      if (this.isDocumentInfo && index == "Submit" && !this.utitlityService.isNullOrUndefined(this.candidatesForm.get('isDifferentlyabled').value) && this.candidatesForm.get('isDifferentlyabled').value == true) {
        if (this.utitlityService.isNullOrUndefined(this.candidatesForm.get('differentlyabledPercentage').value) || this.candidatesForm.get('differentlyabledPercentage').value < 0 || this.candidatesForm.get('differentlyabledPercentage').value > 100) {
          this.alertService.showWarning("If differently abled, please enter percentage. ");
          this.findField.candidateInfoAccordion();
          return;
        } else if (this.candidatesForm.get('differentlyabledPercentage').value >= environment.environment.AmountOfDifferentlyabled) {
          // Fix for bug #5199
          if (Array.isArray(this.DocumentList) && this.DocumentList != null && this.DocumentList.length > 0 && !this.utitlityService.isNullOrUndefined(this.DocumentList.find(a => a.IsDisablityProof == 0)) && this.DocumentList.find(a => a.IsDisablityProof == 0).DocumentId == null) {
            this.alertService.showWarning("If differently abled, please upload a proof document.");
            this.findField.candidateInfoAccordion();
            return;
          } else if (typeof (this.DocumentList) == 'object' && this.DocumentList != null && this.DocumentList.hasOwnProperty("DocumentCategoryist") && this.DocumentList['DocumentCategoryist'].find(a => a.IsDisablityProof == 0).DocumentId == null) {

            this.alertService.showWarning("If differently abled, please upload a proof document.");
            this.findField.candidateInfoAccordion();
            return;
          }
        }
      }



      if (this.isDocumentInfo && index == "Submit") {
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
              this.findField.docDetailsAccordion();
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

        else if (!this.isAssamState || !this.IsAadhaarKYC) {
          this.alertService.showWarning(" This alert is to inform you about your pending documents.  :) Document Details");
          this.findField.docDetailsAccordion();
          return;
        }

        if (isdocsFiles) {
          this.alertService.showWarning("This alert is to inform you about your pending documents.  :) Document Details");
          this.findField.docDetailsAccordion();
          return;
        }

      }


      if (this.isDocumentInfo && index === 'Submit' && this.isAllenDigital) {
        let documentTypeCodesForPAN = [];
        if (this.isPANMandatory) {
          documentTypeCodesForPAN = ['PAN'];
        } else if (!this.isPANMandatory) {
          if (this.candidatesForm.get('PAN').value) {
            documentTypeCodesForPAN = ['PAN'];
          } else {
            documentTypeCodesForPAN = ['PANAck'];
          }
        }
          let requiredDocumentTypeCodeIdsForPAN = [];
          requiredDocumentTypeCodeIdsForPAN = this.documentTbl.filter(a => documentTypeCodesForPAN.includes(a.DocumentTypeCode));

          const hasAnyRequiredDoc = requiredDocumentTypeCodeIdsForPAN.some(requiredDoc => {
            return this.lstDocumentDetails.some(
              candidateDoc => candidateDoc.DocumentTypeId  == requiredDoc.DocumentTypeId
            );
          });
          if (!hasAnyRequiredDoc) {
            let docName = documentTypeCodesForPAN.includes('PAN') ? 'PAN' : 'PAN Acknowledge'
            this.alertService.showWarning(docName + ' document is required. Please upload a pending');
            return;
          
        }
      }




      if (this.isDocumentInfo) {
        var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
        if (isAadhaarExists && isAadhaarExists != undefined && isAadhaarExists.Status != 2 && this.candidatesForm.get('AadhaarNumber').value != null &&
          this.candidatesForm.get('AadhaarNumber').value != isAadhaarExists.DocumentNumber) {
          this.alertService.showWarning("The candidate's aadhaar number is mismatched with the candidate document details document number. Please correct it and try again.");
          this.findField.candidateInfoAccordion();
          return;
        }

      }



      // if (this.isCandidateOtherdetails) {
      //   if (this.candidatesForm.get('maritalStatus').value != null && this.candidatesForm.get('maritalStatus').value != 0 && this.candidatesForm.get('maritalStatus').value == 1 && this.LstNominees.length > 0) {
      //     if (!!this.LstNominees.find((nominee: any) => [3, 4, 5, 7, 8].includes(nominee.relationship))) {
      //       this.alertService.showWarning("You cannot choose an unrelated relationship since your marital status is single. Please try again with a different option. :) Nominee Details")
      //       return
      //     }

      //   }
      // }


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


      console.log('ssss test iii ');





      if (this.previewCTC && index == "Submit" && this.isClientApproval && this.candidatesForm.get('onApprovalType').value == "attachment" || this.candidatesForm.get('onApprovalType').value == "online") {

        if (this.IsMinimumwageAdhere == false && this._NewCandidateDetails.Id != undefined &&
          this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {

          var existAL = _.find(this.clientApprovalTbl, (item) => item.ApprovalFor == 3) != null ? false : true;
          if (existAL) {
            this.findField.clientApproveAccordion();
            this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Minimumwages Adherence. :) Client Approvals") : null;
            this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Minimumwages Adherence. :) Supporting / Approval Documents") : null;

            return;
          }
        }
      }


      if (this.isClientApproval && index == "Submit" && this.candidatesForm.get('onApprovalType').value == "attachment") {

        if (this.clientApprovalTbl.length == 0) {
          this.findField.clientApproveAccordion();
          this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Client approval.  :) Client Approvals") : null;
          this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Supporting / Approval Documents.  :) Supporting / Approval Documents") : null;

          return;
        }

        if (this.candidatesForm.get('requestFor').value.toString() === "OL") {

          var existOL = _.find(this.clientApprovalTbl, (item) => item.ApprovalFor == 1) != null ? false : true;
          if (existOL) {
            this.findField.clientApproveAccordion();
            this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Offer Letter  :) Client Approvals") : null;
            this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Offer Letter  :) Supporting / Approval Documents") : null;
            return;
          }
        }

        if (this.candidatesForm.get('requestFor').value.toString() === "AL") {

          var existAL = _.find(this.clientApprovalTbl, (item) => item.ApprovalFor == 4) != null ? false : true;
          if (existAL) {
            this.findField.clientApproveAccordion();
            this.BusinessType == 3 ? this.alertService.showWarning("Please add required attachments for Appointment Letter :) Client Approvals") : null;
            this.BusinessType != 3 ? this.alertService.showWarning("Please add required attachments for Appointment Letter :) Supporting / Approval Documents") : null;

            return;
          }
        }

        if (this.clientApprovalTbl.find(z => z.Status == 2) != null && this.ApprovalStatus) {
          this.findField.clientApproveAccordion();
          this.BusinessType == 3 ? this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Client Approvals") : null;
          this.BusinessType != 3 ? this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Supporting / Approval Documents") : null; return;

        }


      }



      if (this.isOfferInfo && this.previewLetter && index == "Submit" && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].Status == OfferStatus.InActive) {
        this.alertService.showWarning("You are not allowed to edit this part. Please contact admin.");
        return;

      }


      if (this.isFamilydetails && index == "Submit" && this.RoleCode != 'Recruiter' && this.RoleCode != 'RegionalHR' && this.LstNominees.length == 0) {
        this.findField.familyDetailsAccordion();
        this.alertService.showWarning("Oops!  Please provide at least one Family to confirm it. You cannot publish without Family (minimum one detail is required)");
        return;
      }

      if (this.isCandidateOtherdetails && index == "Submit" && this.IsPhotoMandatory && this.contentmodalurl == null) {
        this.findField.candiOtherDetailsAccordion();
        this.alertService.showWarning("Oops! Please upload a candidate profile photo to confirm it :) Candidate Other Details");
        return;
      }
      if (this.isCandidateOtherdetails && index == "Submit" && this.IsCandidateSignatureMandatory && this.contentmodalurl == null) {
        this.findField.candiOtherDetailsAccordion();
        this.alertService.showWarning("Oops! Please upload a candidate signature to confirm it :) Candidate Other Details");
        return;
      }

      // if (this.isBankInfo && index == "Submit" && this.RoleCode != 'Recruiter' && this.LstBank.length == 0 && this.isESICapplicable) {
      if (this.isBankInfo && index == "Submit" && this.RoleCode != 'Recruiter' && this.RoleCode != 'RegionalHR' && this.LstBank.length == 0) {
        this.findField.bankInfoAccordion();
        this.alertService.showWarning("Oops!  Please provide at least One Bank Details to confirm it. You cannot publish without Bank Details (minimum one detail is required)");
        return;
      }
      if (this.isBankInfo && this.RoleCode != 'Recruiter' && this.RoleCode != 'RegionalHR' && (this.LstBank.length > 0 && this.LstBank.filter(a => a.accountNumber == '' || a.bankBranchId == '' || a.bankName == null || a.bankName == undefined || a.bankName == 0 || a.BankId == 0).length > 0)) {
        this.findField.bankInfoAccordion();
        this.alertService.showWarning("Oops!  Please fill the bank details to confirm it. You cannot publish without Bank Details (minimum one detail is required)");
        return;
      }

      let rejectedNomineeList = this.LstNominees.find(family => family.isDocumentStatus != null && family.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
      if (this.isFamilydetails && rejectedNomineeList && this.ApprovalStatus) {
        this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Family Details");
        return;
      }

      let rejectedEducationList = this.LstEducation.find(family => family.isDocumentStatus != null && family.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
      if (this.isAcademicInfo && rejectedEducationList && this.ApprovalStatus) {
        this.findField.academicInfoAccordion();
        this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Academic Information");
        return;
      }

      let rejectedExperienceList = this.LstExperience.find(family => family.isDocumentStatus != null && family.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
      if (this.isEmploymentInfo && rejectedExperienceList && this.ApprovalStatus) {
        this.findField.workExperienceAccordion();
        this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Work Experience");
        return;
      }

      if (this.isBankInfo && this.LstBank.length > 0 && this.RoleCode != 'Recruiter') {
        for (let item of this.LstBank) {
          if (!item.bankName && !item.IFSCCode && !item.accountNumber && !item.accountHolderName) {
            this.alertService.showWarning("Please fill the mandatory fileds in bank details");
            this.findField.bankInfoAccordion();
            return
          }
        }
      }

      let rejectedBankList = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Rejected) != null ? true : false;
      if (this.isBankInfo && rejectedBankList && this.ApprovalStatus) {
        this.alertService.showWarning("This alert says that, there are some rejected file(s) in your  :) Bank Information");
        this.findField.bankInfoAccordion();
        return;
      }

      console.log('this.ccmailtags', this.ccmailtags);


      if (this.candidatesForm.get('ccemail').value != null && this.candidatesForm.get('ccemail').value != '' && this.candidatesForm.get('ccemail').value != undefined) {

        const matches = this.candidatesForm.get('ccemail').value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
        if (matches) {
          this.ccmailtags.push(this.candidatesForm.get('ccemail').value)
        }
        else {
          this.CCemailMismatch = true;
          this.alertService.showWarning("This alert says that, Please type your CC e-mail address in the format example@domain.com  :) Offer Information");
          this.findField.offerInfoAccordion();
          return;
        }

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




      if (this.isBankInfo && this.candidatesForm.get('firstName').value
        && this.LstBank.filter(bank => bank.isDocumentStatus != ApprovalStatus.Rejected && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2).length > 0

        && this.candidatesForm.get('firstName').value != this.LstBank.find(bank => bank.isDocumentStatus != ApprovalStatus.Rejected
          && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2).accountHolderName) {

        this.alertService.showWarning("The candidate's name is mismatched with the bank account holder's name. Please correct it and try again.")
        return;
      }

      // when approved pennyd drop
      if (
        this.LstBank.length > 0
        &&
        this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2).length > 0

      ) {

        let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved
          && bank.Modetype != UIMode.Delete && bank.VerificationMode == 2);

        if (index == "Submit") {
          existingBank.Attribute1 = this.candidatesForm.get('firstName').value;
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
        != this.candidatesForm.get('firstName').value
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
          existingBank.Attribute1 = this.candidatesForm.get('firstName').value;
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
        // != this.candidatesForm.get('firstName').value
      ) {

        let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved
          && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1);

        if (existingBank && this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Approved && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
          != this.candidatesForm.get('firstName').value) {
          existingBank.isDocumentStatus = ApprovalStatus.Pending;
          existingBank.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;

          existingBank.CandidateDocument != null && existingBank.CandidateDocument != undefined ?
            existingBank.CandidateDocument.Status = ApprovalStatus.Pending : true
          existingBank.CandidateDocument.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
        }

        if (index == "Submit") {
          existingBank.Attribute1 = this.candidatesForm.get('firstName').value;
        }

      }

      // -- when pending
      if (
        this.LstBank.length > 0
        &&
        this.LstBank.filter(bank => bank.isDocumentStatus == ApprovalStatus.Pending && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).length > 0
        // &&
        // this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Pending && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
        // != this.candidatesForm.get('firstName').value
      ) {

        let existingBank = this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Pending
          && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1);

        if (existingBank &&
          this.LstBank.find(bank => bank.isDocumentStatus == ApprovalStatus.Pending && bank.Modetype != UIMode.Delete && bank.VerificationMode == 1).accountHolderName
          != this.candidatesForm.get('firstName').value) {
          existingBank.isDocumentStatus = ApprovalStatus.Pending;
          // existingBank.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
          existingBank.CandidateDocument != null && existingBank.CandidateDocument != undefined ?
            existingBank.CandidateDocument.Status = ApprovalStatus.Pending : true
          // existingBank.CandidateDocument.Remarks = `${' Please review and reapprove the bank details since the candidates name has changed'}`;
        }

        if (index == "Submit") {
          existingBank.Attribute1 = this.candidatesForm.get('firstName').value;
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

      if (index == "Submit" && this.IsDeclarationContextRequired && this.RoleCode == 'Candidate') {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true,
        })

        swalWithBootstrapButtons.fire({
          title: 'Declaration',
          text: this.DeclarationContextMessage,
          type: 'warning',
          showCancelButton: false,
          animation: false,
          showCloseButton: true,
          confirmButtonText: 'Do Agree',
          cancelButtonText: 'Disagree',
          allowOutsideClick: false,
          reverseButtons: false
        }).then((result) => {
          console.log(result);
          if (result.value) {

            this.triggerSaveOrSubmitAPI(index)

          }
        })
      }
      else {
        this.sweetalertConfirm(index);
      }


    }

  }




  // confirmation dialog from sweet alert

  sweetalertConfirm(index: any): void {

    if (index == "Submit") {
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

          this.triggerSaveOrSubmitAPI(index)

        } else if (result.dismiss === Swal.DismissReason.cancel) {

          swalWithBootstrapButtons.fire(
            'Cancelled',
            'Your request has been cancelled',
            'error'
          )
        }
      })
    } else {
      this.triggerSaveOrSubmitAPI(index)
    }


  }

  triggerSaveOrSubmitAPI(index: any) {


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


      let LstdynamicFieldsValue = [];
      let LstfieldValue = [];

      this.DynamicFieldDetails != null && !this.isEmptyObject(this.DynamicFieldDetails) && this.DynamicFieldDetails.ControlElemetsList.length > 0 && this.DynamicFieldDetails.ControlElemetsList.forEach(element => {
        var fieldValue = new FieldValues();
        fieldValue.FieldName = element.FieldName;
        fieldValue.ParentFieldName = element.TabName;
        fieldValue.MultipleValues = element.MultipleValues;
        fieldValue.Value = element.MultipleValues ? null : element.Value;
        LstfieldValue.push(fieldValue);
      });


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

      if (this.RoleCode == 'Candidate' && this.IsAadhaarKYC && this.candidatesForm.get('DOBasPerProof').value != null) {
        var dobasPerProof = moment(this.candidatesForm.get('DOBasPerProof').value, 'DD-MM-YYYY');
        console.log('this.candidatesForm.get(', moment(this.candidatesForm.get('DOBasPerProof').value, 'DD-MM-YYYY'));
        console.log('this.candidatesForm.get(', new Date(dobasPerProof.toString()));
        this.candidateDetails.NameasPerProof = this.candidatesForm.get('NameasPerProof').value == null || this.candidatesForm.get('NameasPerProof').value == "" ? null : this.candidatesForm.get('NameasPerProof').value;
        this.candidateDetails.DOBasPerProof = this.datePipe.transform(new Date(dobasPerProof.toString()).toString(), "yyyy-MM-dd");

      }
      // if (this.candidateDetails.DateOfBirth == "1970-01-01") {
      //   this.candidateDetails.DateOfBirth = null;
      // }
      // alert(this.candidatesForm.get('dateOfBirth').value)
      this.candidatesForm.controls['isDifferentlyabled'] != null ? this.candidateDetails.IsDifferentlyabled = this.candidatesForm.get('isDifferentlyabled').value : null;
      this.candidatesForm.controls['differentlyabledPercentage'] != null ? this.candidateDetails.DisabilityPercentage = this.candidateDetails.IsDifferentlyabled == true ? this.candidatesForm.get('differentlyabledPercentage').value : 0 : null;
      this.candidatesForm.controls['nationality'] != null ? this.candidateDetails.Nationality = this.candidatesForm.get('nationality').value == 1 ? Nationality.Indian : Nationality.Non_Indian : null;
      this.candidatesForm.controls['country'] != null ? this.candidateDetails.CountryOfOrigin = this.candidateDetails.Nationality == 1 ? 1 : this.candidatesForm.get('country').value : null;
      this.candidatesForm.controls['bloodGroup'] != null ? this.candidateDetails.BloodGroup = this.candidatesForm.get('bloodGroup').value == null || this.candidatesForm.get('bloodGroup').value == "" ? 0 : this.candidatesForm.get('bloodGroup').value : null;
      this.candidatesForm.controls['maritalStatus'] != null ? this.candidateDetails.MaritalStatus = this.candidatesForm.get('maritalStatus').value == null || this.candidatesForm.get('maritalStatus').value == "" ? 0 : this.candidatesForm.get('maritalStatus').value : null;
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
      this.candidatesForm.controls['requestBy'] != null && this.candidatesForm.controls['requestBy'].disabled == false ? this.candidateOfferDetails.RequestedBy = this.candidatesForm.get('requestBy').value == "self" ? this.UserId : this.candidatesForm.get('recruiterName').value : null;;

      this.candidatesForm.controls['requestBy'] != null && (this.BusinessType == 1 || this.BusinessType == 2) ? this.candidateOfferDetails.IsSelfRequest = this.candidatesForm.get('requestBy').value == "self" ? true : false : null;
      this.candidatesForm.controls['requestBy'] != null && (this.BusinessType == 1 || this.BusinessType == 2) ? this.candidateOfferDetails.RequestedBy = this.candidatesForm.get('requestBy').value == "self" ? this.UserId : this.candidatesForm.get('recruiterName').value : null;

      // for ops transfer condition only
      if (this.Id == 0 && this.candidatesForm.get('sourceType').value == 2) {
        this.candidateOfferDetails.IsSelfRequest = true;
        this.candidateOfferDetails.RequestedBy = this.UserId;
      }

      if (this.router.url.includes('onboarding_revise')) {
        this.candidateOfferDetails.IsSelfRequest = true;
        this.candidateOfferDetails.RequestedBy = this.UserId;
        this.candidateOfferDetails.CreatedBy = null;
        this.candidateOfferDetails.LastUpdatedBy = null;
      }

      if (this.candidatesForm.get('relationshipNameType').value == 'fathername') {
        this.updateValidation(true, this.candidatesForm.get('fatherName'));
        this.updateValidation(false, this.candidatesForm.get('relationshipType'));
        this.updateValidation(false, this.candidatesForm.get('relationshipName'));
        this.candidateDetails.RelationshipId = Relationship.Father;
        this.candidateDetails.RelationshipName = this.candidatesForm.get('fatherName').value || null;
        this.candidatesForm.controls['fatherName'] != null ? this.candidateOfferDetails.FatherName = this.candidatesForm.get('fatherName').value : null;;
      } else {
        this.updateValidation(false, this.candidatesForm.get('fatherName'));
        this.updateValidation(true, this.candidatesForm.get('relationshipType'));
        this.updateValidation(true, this.candidatesForm.get('relationshipName'));
        this.candidateOfferDetails.FatherName = '';
        this.candidatesForm.controls['relationshipType'] != null ? this.candidateDetails.RelationshipId = this.candidatesForm.get('relationshipType').value : 0;;
        this.candidatesForm.controls['relationshipName'] != null ? this.candidateDetails.RelationshipName = this.candidatesForm.get('relationshipName').value : null;;

      }
      this.candidatesForm.controls['MarriageDate'] != null && this.candidatesForm.get('MarriageDate').value != "Invalid date" ? this.candidateDetails.MarriageDate = moment(this.candidatesForm.get('MarriageDate').value).format('YYYY-MM-DD') as any : true;

      this.candidateDetails.MarriageDate == '0001-01-01T00:00:00' || this.candidateDetails.MarriageDate == ("Invalid date" as any) ?
        this.candidateDetails.MarriageDate = null : true;

      if (this.candidateDetails.MarriageDate == null) {
        delete this.candidateDetails.MarriageDate;
      }



      this.candidatesForm.controls['Religion'] != null ? this.candidateDetails.Religion = this.candidatesForm.get('Religion').value == null ? 0 : this.candidatesForm.get('Religion').value : true;
      this.candidatesForm.controls['Division'] != null ? this.candidateOfferDetails.Division = this.candidatesForm.get('Division').value == null ? 0 : this.candidatesForm.get('Division').value : true;
      this.candidatesForm.controls['Category'] != null ? this.candidateOfferDetails.Category = this.candidatesForm.get('Category').value == null ? 0 : this.candidatesForm.get('Category').value : true;

      if (this.onboardingAdditionalInfo.LstEmployeeDepartment != null &&
        this.onboardingAdditionalInfo.LstEmployeeDepartment.length > 0) {
        this.candidateOfferDetails.Department =
          this.onboardingAdditionalInfo.LstEmployeeDepartment.find(a => a.Id == this.candidatesForm.get('Department').value) != undefined ? this.onboardingAdditionalInfo.LstEmployeeDepartment.find(a => a.Id == this.candidatesForm.get('Department').value).Name : "";
      }
      this.candidatesForm.controls['Department'] != null ? this.candidateOfferDetails.DepartmentId = this.candidatesForm.get('Department').value == null ? 0 : this.candidatesForm.get('Department').value : true;

      if (this.isAdditionalInfo) {



        // this.candidateOfferDetails.Department = this.additionalColumns.Department != null ? this.additionalColumns.Department : 0;

        // if (this.onboardingAdditionalInfo.LstEmployeeDepartment != null &&
        //   this.onboardingAdditionalInfo.LstEmployeeDepartment.length > 0) {
        //   this.candidateOfferDetails.Department =
        //     this.onboardingAdditionalInfo.LstEmployeeDepartment.find(a => a.Id == this.additionalColumns.Department) != undefined ? this.onboardingAdditionalInfo.LstEmployeeDepartment.find(a => a.Id == this.additionalColumns.Department).Name : "";
        // }

        if (this.onboardingAdditionalInfo.LstJobProfile != null &&
          this.onboardingAdditionalInfo.LstJobProfile.length > 0) {
          this.candidateOfferDetails.JobProfile =
            this.onboardingAdditionalInfo.LstJobProfile.find(a => a.Id == this.additionalColumns.JobProfile) != undefined ? this.onboardingAdditionalInfo.LstJobProfile.find(a => a.Id == this.additionalColumns.JobProfile).Name : "";
        }

        this.additionalColumns.JobProfile != null ? this.candidateOfferDetails.JobProfileId = this.additionalColumns.JobProfile == null ? 0 : this.additionalColumns.JobProfile : true;

        // this.additionalColumns.Department != null ? this.candidateOfferDetails.DepartmentId = this.additionalColumns.Department == null ? 0 : this.additionalColumns.Department : true;

        // this.additionalColumns.Division != null ? this.candidateOfferDetails.Division = this.additionalColumns.Division : true;


        this.additionalColumns.SubEmploymentType != null ? this.candidateOfferDetails.SubEmploymentType = this.additionalColumns.SubEmploymentType : true;
      
        this.additionalColumns.SubEmploymentCategory != null ? this.candidateOfferDetails.SubEmploymentCategory = this.additionalColumns.SubEmploymentCategory : true;
        this.additionalColumns.Level != null ? this.candidateOfferDetails.Level = this.additionalColumns.Level : true;
        this.additionalColumns.CostCityCenter != null ? this.candidateOfferDetails.CostCityCenter = this.additionalColumns.CostCityCenter : true;
        this.additionalColumns.EmploymentZone != null ? this.candidateOfferDetails.EmploymentZone = this.additionalColumns.EmploymentZone : true;

        // this.additionalColumns.Building != null ? this.candidateOfferDetails.Building = this.additionalColumns.Building : true;

      }

      // this.additionalColumns 


      (this.candidateDetails.RelationshipId == null || this.candidateDetails.RelationshipId == undefined) ? this.candidateDetails.RelationshipId = 0 : true;

      this.candidatesForm.controls['requestFor'] != null ? this.candidateOfferDetails.RequestType = this.candidatesForm.get('requestFor').value == "OL" ? RequestType.OL : RequestType.AL : null;;
      this.candidatesForm.controls['onboardingType'] != null ? this.candidateOfferDetails.OnBoardingType = this.candidatesForm.get('onboardingType').value == "flash" ? OnBoardingType.Flash : OnBoardingType.Proxy : null;
      this.candidatesForm.controls['onBehalfRemarks'] != null ? this.candidateOfferDetails.TeamProxyRequest = this.candidatesForm.get('onBehalfRemarks').value : null;
      this.candidatesForm.controls['proxyRemarks'] != null ? this.candidateOfferDetails.ProxyRemarks = this.candidatesForm.get('proxyRemarks').value : null;;
      this.candidatesForm.controls['isOLcandidateacceptance'] != null ? this.candidateOfferDetails.IsCandidateAcceptanceRequiredForOL = this.candidatesForm.get('isOLcandidateacceptance').value != null || this.candidatesForm.get('isOLcandidateacceptance').value != "" ? this.candidatesForm.get('isOLcandidateacceptance').value : false : null;;
      this.candidatesForm.controls['isAlaccept'] != null ? this.candidateOfferDetails.IsCandidateAcceptanceRequiredForAL = this.candidatesForm.get('isAlaccept').value != null || this.candidatesForm.get('isAlaccept').value != "" ? this.candidatesForm.get('isAlaccept').value : false : null;

      this.candidatesForm.controls['ClientId'] != null ? this.candidateOfferDetails.ClientId = this.candidatesForm.get('ClientId').value : null;
      this.candidatesForm.controls['clientContract'] != null ? this.candidateOfferDetails.ClientContractId = this.candidatesForm.get('clientContract').value == null || this.candidatesForm.get('clientContract').value == "" ? 0 : this.candidatesForm.get('clientContract').value : null;
      this.candidatesForm.controls['mandateName'] != null ? this.candidateOfferDetails.MandateRequirementId = this.candidatesForm.get('mandateName').value == null || this.candidatesForm.get('mandateName').value == "" ? 0 : this.candidatesForm.get('mandateName').value : null;
      this.candidatesForm.controls['candidateName'] != null ? this.candidateOfferDetails.CandidateId = this.candidatesForm.get('candidateName').value == null || this.candidatesForm.get('candidateName').value == "" ? 0 : this.candidatesForm.get('candidateName').value : null;
      this.candidatesForm.controls['clientSPOC'] != null ? this.candidateOfferDetails.ClientContactId = this.candidatesForm.get('clientSPOC').value == null || this.candidatesForm.get('clientSPOC').value == "" ? 0 : this.candidatesForm.get('clientSPOC').value : null;
      this.candidatesForm.controls['onApprovalType'] != null ? this.candidateOfferDetails.IsClientApprovedBasedOn = this.candidatesForm.get('onApprovalType').value == "online" ? IsClientApprovedBasedOn.Online : IsClientApprovedBasedOn.Attachment : null;
      this.candidatesForm.controls['sourceType'] != null ? this.candidateOfferDetails.SourceType = this.candidatesForm.get('sourceType').value : null;
      this.candidatesForm.controls['industryType'] != null ? this.candidateOfferDetails.IndustryId = this.candidatesForm.get('industryType').value == "" || this.candidatesForm.get('industryType').value == null ? 0 : this.candidatesForm.get('industryType').value : null;
      this.candidatesForm.controls['location'] != null ? this.candidateOfferDetails.Location = this.candidatesForm.get('location').value : null;
      if (this.isAllenDigital) {
        this.candidatesForm.controls['reportingLocation'] != null ? this.candidateOfferDetails.ReportingLocation = this.candidatesForm.get('reportingLocation').value : null;

        // this.candidatesForm.controls['reportingTime'] != null ? this.candidateOfferDetails.ReportingTime = (this.candidatesForm.get('reportingTime').value) : null;

        this.candidatesForm.controls['joiningTime'] != null ? this.candidateOfferDetails.JoiningTime = (this.candidatesForm.get('joiningTime').value) : null;
      }

      this.candidatesForm.controls['skillCategory'] != null ? this.candidateOfferDetails.SkillCategory = this.candidatesForm.get('skillCategory').value == "" || this.candidatesForm.get('skillCategory').value == null ? 0 : this.candidatesForm.get('skillCategory').value : null;

      this.candidatesForm.controls['designation'] != null ? this.candidateOfferDetails.DesignationId = this.candidatesForm.get('designation').value == "" || this.candidatesForm.get('designation').value == null ? 0 : this.candidatesForm.get('designation').value : null;

      this.candidatesForm.controls['Remarks'] != null ? this.candidateOfferDetails.SalaryRemarks = this.candidatesForm.get('Remarks').value : null;

      this.candidatesForm.controls['designation'] != null && this.DesignationList.length > 0 && this.DesignationList.find(a => a.Id == this.candidatesForm.get('designation').value) != undefined ? this.candidateOfferDetails.Designation = this.DesignationList.find(a => a.Id == this.candidatesForm.get('designation').value).Name : "";

      this.candidatesForm.controls['zone'] != null ? this.candidateOfferDetails.Zone = this.candidatesForm.get('zone').value == "" || this.candidatesForm.get('zone').value == null ? 0 : this.candidatesForm.get('zone').value : null;
      this.candidatesForm.controls['onCostInsuranceAmount'] != null ? this.candidateOfferDetails.OnCostInsurance = this.candidatesForm.get('onCostInsuranceAmount') != null ? Number(this.candidatesForm.get('onCostInsuranceAmount').value) : 0 : null;
      this.candidatesForm.controls['fixedDeductionAmount'] != null ? this.candidateOfferDetails.FixedInsuranceDeduction = this.candidatesForm.get('fixedDeductionAmount') != null ? Number(this.candidatesForm.get('fixedDeductionAmount').value) : 0 : null;

      this.candidatesForm.controls['insuranceplan'] != null ? this.candidateOfferDetails.InsurancePlan = this.candidatesForm.get('insuranceplan') != null ? Number(this.candidatesForm.get('insuranceplan').value) : 0 : null;

      this.candidatesForm.controls['Gpa'] != null ? this.candidateOfferDetails.GPAAmount = this.candidatesForm.get('Gpa') != null ? Number(this.candidatesForm.get('Gpa').value) : 0 : null;
      this.candidatesForm.controls['Gmc'] != null ? this.candidateOfferDetails.GMCAmount = this.candidatesForm.get('Gmc') != null ? Number(this.candidatesForm.get('Gmc').value) : 0 : null;
      this.candidatesForm.controls['NoticePeriod'] != null ? this.candidateOfferDetails.NoticePeriodDays = this.candidatesForm.get('NoticePeriod') != null ? Number(this.candidatesForm.get('NoticePeriod').value) : null : null;

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
      // if (this._NewCandidateDetails != null) {
      //   this.candidateOfferDetails.AcceptanceStatus = this.Id != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != 0 as any && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceStatus : 0;
      //   this.candidateOfferDetails.AcceptanceRemarks = this.Id != 0 && this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].AcceptanceRemarks : null;
      // }

      if (this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0) {
        const offerDetails = this._NewCandidateDetails.LstCandidateOfferDetails[0];
        if (offerDetails != null) {
          this.candidateOfferDetails.AcceptanceStatus = offerDetails.AcceptanceStatus != null && offerDetails.AcceptanceStatus !== 0 ? offerDetails.AcceptanceStatus : 0;
          this.candidateOfferDetails.AcceptanceRemarks = offerDetails.AcceptanceRemarks != null ? offerDetails.AcceptanceRemarks : null;
        }
      }

      this.candidatesForm.controls['salaryType'] != null ? this.candidateRateSetDetails.SalaryBreakUpType = this.candidatesForm.get('salaryType').value == null ? 0 : this.candidatesForm.get('salaryType').value : null;
      this.candidatesForm.controls['paystructure'] != null ? this.candidateRateSetDetails.PayGroupdId = this.candidatesForm.get('paystructure').value == null ? 0 : this.candidatesForm.get('paystructure').value : null;
      this.candidatesForm.controls['MonthlySalary'] != null ? this.candidateRateSetDetails.MonthlySalary = this.candidatesForm.get('MonthlySalary').value == null || this.candidatesForm.get('MonthlySalary').value == "" ? 0 : this.candidatesForm.get('MonthlySalary').value : null;
      this.candidatesForm.controls['forMonthlyValue'] != null ? this.candidateRateSetDetails.IsMonthlyValue = this.candidatesForm.get('forMonthlyValue').value : null;



      this.candidateRateSetDetails.Modetype = UIMode.Edit;;
      this.candidateRateSetDetails.Status = 1;
      this.candidateRateSetDetails.Id = this.Id != 0 ? (this._NewCandidateDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null
        && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) ? this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].Id : 0 : 0;

      // this.candidateRateSetDetails.LstRateSet = this.Id != 0 && this._NewCandidateDetails != null && // old for staffing updated for sme
      if ((this.BusinessType == 1 || this.BusinessType == 2)) {
        this.candidateRateSetDetails.LstRateSet = this._NewCandidateDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null ?
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet :

          this.candidatesForm.get('sourceType').value == 2 && this._NewCandidateDetails.Id != undefined &&
            this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0
            ? (

              this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet

            ) : null
      }
      else {
        this.candidateRateSetDetails.LstRateSet = this.Id != 0 && this._NewCandidateDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0 ?
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet :
          this.candidatesForm.get('sourceType').value == 2 && this._NewCandidateDetails.Id != undefined &&
            this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.length > 0
            ? (

              this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet

            ) : null

      }

      if (this.candidatesForm.get('requestFor').value == "OL") {
        this.candidatesForm.controls['letterTemplate'] != null ? this.candidateOfferDetails.LetterTemplateId = this.candidatesForm.get('letterTemplate') != null && this.candidatesForm.get('letterTemplate').value != null ? this.candidatesForm.get('letterTemplate').value : 0 : null;
        this.DateOfJoining != "Invalid Date" && this.DateOfJoining != null && this.DateOfJoining != undefined && this.candidatesForm.controls['expectedDOJ'] != null && this.candidatesForm.controls['expectedDOJ'] != undefined ? this.candidateOfferDetails.DateOfJoining = this.candidatesForm.get('expectedDOJ').value == null ? null : this.datePipe.transform(new Date(this.DateOfJoining).toString(), "yyyy-MM-dd") : null;

        // if (this.candidateOfferDetails.DateOfJoining == '1970-01-01') {
        //   this.candidateOfferDetails.DateOfJoining = null;
        // }

      }

      if (this.candidatesForm.controls['salaryType'] != null && this.candidatesForm.get('salaryType').value != null) {
        if (this.candidateRateSetDetails.LstRateSet != null && this.candidateRateSetDetails.LstRateSet.length > 0) {
          var _CTC = this.candidateRateSetDetails.LstRateSet.find(s => s.ProductCode == 'CTC').Value;
          this.candidatesForm.controls['AnnualCTC'] != null ? this.candidateRateSetDetails.AnnualCTC = (_CTC * 12) : true;
          this.candidatesForm.controls['MonthlyCTC'] != null ? this.candidateRateSetDetails.MonthlyCTC = (_CTC) : true;

          let _NetPayObj = this.candidateRateSetDetails.LstRateSet.find(s => s.ProductCode == 'NetPay');
          let _NetPay;
          if (_NetPayObj) {
            _NetPay = _NetPayObj.Value;
            this.candidatesForm.controls['AnnualNTH'] != null ? this.candidateRateSetDetails.AnnualNTH = (_NetPay * 12) : true;
            this.candidatesForm.controls['MonthlyNTH'] != null ? this.candidateRateSetDetails.MonthlyNTH = (_NetPay) : true;
          } else {
            _NetPay = null;
          }

          var _Gross = this.candidateRateSetDetails.LstRateSet.find(s => s.ProductCode == 'GrossEarn').Value;
          this.candidatesForm.controls['AnnualGross'] != null ? (this.candidateRateSetDetails.AnnualGross = (_Gross * 12)) : true;
          this.candidatesForm.controls['MonthlyGross'] != null ? (this.candidateRateSetDetails.MonthlyGross = (_Gross)) : true;

        }

        this.candidatesForm.controls['annualSalary'] != null ? this.candidateRateSetDetails.AnnualSalary = (this.candidatesForm.get('annualSalary').value == null || this.candidatesForm.get('annualSalary').value == "")
          ? 0 : this.candidatesForm.get('annualSalary').value : null;

      } else {
        this.candidatesForm.controls['annualSalary'] != null ? this.candidateRateSetDetails.AnnualSalary = (this.candidatesForm.get('annualSalary').value == null || this.candidatesForm.get('annualSalary').value == "")
          ? 0 : this.candidatesForm.get('annualSalary').value : null;

      }

      if (this.minimumWagesApplicableProducts && this.minimumWagesApplicableProducts.length > 0) {
        this.candidatesForm.controls['minimumWagesApplicableProducts'] != null ? this.candidateRateSetDetails.MinimumWagesApplicability = (this.candidatesForm.get('minimumWagesApplicableProducts').value == null || this.candidatesForm.get('minimumWagesApplicableProducts').value == "")
          ? [] : this.minimumWagesApplicableProducts.filter(e => e.Code == this.candidatesForm.get('minimumWagesApplicableProducts').value)[0] : null;
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
      // this.candidatesForm.controls['PRAN'] != null ? this.candidateOfferDetails.PRAN = this.candidatesForm.get('PRAN').value : null;
      // this.candidatesForm.controls['EPSStatus'] != null ? this.candidateOfferDetails.EPSStatus = this.candidatesForm.get('EPSStatus').value : null;


      this.candidateStatutoryDetails.Id = this.Id != 0 ? this._NewCandidateDetails.CandidateOtherData != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls != null && this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls.length > 0 ? this._NewCandidateDetails.CandidateOtherData.LstCandidateStatutoryDtls[0].Id : 0 : 0;
      // this.candidateMiscellanousDetails

      this.candidatesForm.controls['TeamId'] != null ? this.candidateOfferDetails.TeamId = this.candidatesForm.get('TeamId') != null && this.candidatesForm.get('TeamId').value != null ? this.candidatesForm.get('TeamId').value : 0 : null;

      this.candidatesForm.controls['employmentType'] != null ? this.candidateOfferDetails.EmploymentType = this.candidatesForm.get('employmentType') != null && this.candidatesForm.get('employmentType').value != null ? this.candidatesForm.get('employmentType').value : 0 : null;
 

      if (this.isMigrationInfo && this.candidatesForm.get('requestFor').value == "AL") {
        // this.candidateOfferDetails.LetterTemplateId = 0;
        // this.candidateOfferDetails.DateOfJoining = this.datePipe.transform(new Date(this.candidatesForm.get('ActualDOJ').value).toString(), "yyyy-MM-dd");
        this.candidatesForm.controls['ActualDOJ'] != null && this.candidatesForm.controls['ActualDOJ'] != undefined ? this.candidateOfferDetails.ActualDateOfJoining = this.candidatesForm.get('ActualDOJ').value == null ? null : this.datePipe.transform(new Date(this.candidatesForm.get('ActualDOJ').value).toString(), "yyyy-MM-dd") : null;

        // if (this.candidateOfferDetails.ActualDateOfJoining == '1970-01-01') {
        //   this.candidateOfferDetails.ActualDateOfJoining = null;
        // }
        // console.log('date', this.candidateOfferDetails.ActualDateOfJoining);
        this.candidatesForm.controls['EffectivePayPeriod'] != null ? this.candidateOfferDetails.EffectivePayPeriodId = this.candidatesForm.get('EffectivePayPeriod') != null && this.candidatesForm.get('EffectivePayPeriod').value != null ? this.candidatesForm.get('EffectivePayPeriod').value : 0 : null;


        this.candidatesForm.controls['LeaveGroupId'] != null ? this.candidateOfferDetails.LeaveGroupId = this.candidatesForm.get('LeaveGroupId') != null && this.candidatesForm.get('LeaveGroupId').value != null ? this.candidatesForm.get('LeaveGroupId').value : 0 : null;
        this.candidatesForm.controls['CostCodeId'] != null ? this.candidateOfferDetails.CostCodeId = this.candidatesForm.get('CostCodeId') != null && this.candidatesForm.get('CostCodeId').value != null ? this.candidatesForm.get('CostCodeId').value : 0 : null;
        this.candidatesForm.controls['AppointmentLetterTemplateId'] != null ? this.candidateOfferDetails.AppointmentLetterTemplateId = this.candidatesForm.get('AppointmentLetterTemplateId') != null && this.candidatesForm.get('AppointmentLetterTemplateId').value != null ? this.candidatesForm.get('AppointmentLetterTemplateId').value : 0 : null;

      }

      if (this.isMigrationInfo && this.candidatesForm.get('requestFor').value == "OL") {
        this.candidatesForm.controls['EffectivePayPeriod'] != null ? this.candidateOfferDetails.EffectivePayPeriodId = this.candidatesForm.get('EffectivePayPeriod') != null && this.candidatesForm.get('EffectivePayPeriod').value != null ? this.candidatesForm.get('EffectivePayPeriod').value : 0 : null;
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
        this.candidatesForm.controls['tenureEndate'] != null && this.candidatesForm.controls['tenureEndate'] != undefined ? this.candidateOfferDetails.EndDate = (this.candidatesForm.get('tenureEndate').value == null || this.candidatesForm.get('tenureEndate').value == '' || this.candidatesForm.get('tenureEndate').value == undefined) ? null : this.datePipe.transform(new Date(this.candidatesForm.get('tenureEndate').value).toString(), "yyyy-MM-dd") : null;
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
          familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01T00:00:00" : moment(element.DOB).format('YYYY-MM-DD'),
          familyDets.LstClaims = element.lstClaim,
          familyDets.IsEmployed = element.FamilyisEmployed,

          familyDets.Modetype = element.Modetype,
          familyDets.Id = this.isGuid(element.Id) == true ? 0 : element.Id,
          familyDets.CandidateDocument = element.CandidateDocument
        familyDets.IsNominee = element.IsNominee
        familyDets.IsDependent = element.IsDependent
        element.WeddingDate != null ? familyDets.WeddingDate = element.WeddingDate : true,
          familyDets.IsAlive = element.IsAlive,
          familyDets.FamilyEmployeeID = element.FamilyEmployeeID,
          familyDets.Occupation = element.Occupation,
          this.lstFamilyDetails.push(

            familyDets

          )


      });


      this.deletedLstNominee.forEach(element => {

        var familyDets = new CandidateFamilyDetails();
        familyDets.Name = element.nomineeName,
          familyDets.RelationshipId = element.relationship,
          familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01T00:00:00" : element.DOB,
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

          candidateExperienceDetails.OldEmployeeId = element.OldEmployeeId,
            candidateExperienceDetails.HREmailID = element.HREmailID,
            candidateExperienceDetails.ManagerName = element.ManagerName,
            candidateExperienceDetails.ManagerEmailID = element.ManagerEmailID,
            candidateExperienceDetails.ManagerContactNumber = element.ManagerContactNumber,
            candidateExperienceDetails.ManagerDesignation = element.ManagerDesignation,

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



      // REFERENCE DETAILS
      this.candidateDetails.EmploymentReferenceDetails = [];
      this.LstReference.forEach(element => {
        const referenceDetails = new EmploymentReferenceDetails();
        referenceDetails.Type = element.Type;
        referenceDetails.Name = element.Name;
        referenceDetails.Organization = element.Organization;
        referenceDetails.Designation = element.Designation;
        referenceDetails.Email = element.Email;
        referenceDetails.ContactNumber = element.ContactNumber;
        referenceDetails.Department = element.Department;
        referenceDetails.Location = element.Location;
        referenceDetails.Modetype = element.Modetype;
        referenceDetails.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
        referenceDetails.CandidateId = this.CandidateId;
        referenceDetails.CompanyId = this.CompanyId;
        referenceDetails.ClientId = this.ClientId;
        referenceDetails.Status = element.Status;
        this.candidateDetails.EmploymentReferenceDetails.push(referenceDetails);
      })

      // LANGUAGE KNOWN DETAILS
      this.candidateDetails.LanguagesKnownDetails = [];
      this.LstLanguageKnown.forEach(element => {
        const lagProficiency = new LanguagesKnownDetails();
        lagProficiency.LanguageProficiency = element.LanguageProficiency;
        lagProficiency.IsRead = element.IsRead;
        lagProficiency.IsWrite = element.IsWrite;
        lagProficiency.IsSpeak = element.IsSpeak;
        lagProficiency.Modetype = element.Modetype;
        lagProficiency.Id = this.isGuid(element.Id) == true ? 0 : element.Id;
        lagProficiency.CandidateId = this.CandidateId;
        lagProficiency.CompanyId = this.CompanyId;
        lagProficiency.ClientId = this.ClientId;
        lagProficiency.ClientContractId = this.ClientContractId;
        lagProficiency.Status = element.Status == true ? 1 : 0;
        this.candidateDetails.LanguagesKnownDetails.push(lagProficiency);
      })

      // ADDITIONAL OPERATIONAL DETAILS

      this.additionalOperationalDetails = this.additionalOperationalDetails;

      if (this.isAdditionalOperationalInfo && this.additionalOperationalDetails != null) {
        if (this.activeAccordionName != '' && this.activeAccordionName != null && this.activeAccordionName == "isAdditionalOperationalInfo") {
          this.onboardingAdditionalOperationalViewChild.ngOnDestroy();
        }
        this.additionalOperationalDetails.Id = this.isGuid(this.additionalOperationalDetails.Id) == true ? 0 : this.additionalOperationalDetails.Id;
        // this.additionalOperationalDetails.Status = this.additionalOperationalDetails.Status == true ? 1 : 0;
        this.candidateDetails.AdditionalOperationalDetails = this.additionalOperationalDetails;
        this.candidateDetails.AdditionalOperationalDetails.Modetype = UIMode.Edit;
      }



      /* #endregion */


      this.lstDocumentDetails.forEach(element => {
        element.Id = this.isGuid(element.Id) == true ? 0 : element.Id;

      });

      console.log('CANDIDATE DOCUMENTS :', this.lstDocumentDetails);

      this.candidatesForm.controls['MotherName'] != null ? this.candidateDetails.MotherName = this.candidatesForm.get('MotherName').value == null || this.candidatesForm.get('MotherName').value == "" ? "" : this.candidatesForm.get('MotherName').value : null;

      this.candidateOfferDetails.Aadhaar = Number(this.candidatesForm.get('AadhaarNumber').value);
      this.candidateOfferDetails.IsPANExists = true,
        this.candidateStatutoryDetails.PAN = this.candidatesForm.get('PAN').value;

      // var isAadhaarExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.AadhaarDocumentTypeId && a.DocumentCategoryId != 0)
      // isAadhaarExists != undefined && (this.candidateOfferDetails.Aadhaar = Number(isAadhaarExists.DocumentNumber));

      // var isPANNOExists = this.lstDocumentDetails != null && this.lstDocumentDetails.length > 0 && this.lstDocumentDetails.find(a => a.DocumentTypeId == environment.environment.PANDocumentTypeId && a.DocumentCategoryId != 0)
      // isPANNOExists != undefined && (this.candidateOfferDetails.IsPANExists = true, this.candidateStatutoryDetails.PAN = (isPANNOExists.DocumentNumber));

      if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
        this.lstDocumentDetails = this.lstDocumentDetails.concat(this.new_ProfileAvatarDocument);
      }
      if (this.delete_ProfileAvatarDocument != null && this.delete_ProfileAvatarDocument.length > 0) {
        this.lstDocumentDetails = this.lstDocumentDetails.concat(this.delete_ProfileAvatarDocument);
      }

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
      // this.candidateOfferDetails.WorkersCompensationBenefits = null;
      // this.candidateOfferDetails.ClientEmployeeCode = null;
      this.candidateDetails.Qualifications = this.lstQualificationDetails;
      // this.candidateOfferDetails.IsLetterEdited = this.IsLetterEdited;
      // this.candidateOfferDetails.SourceDocBytes = this.EditedLetterBase64;

      this.candidateOfferDetails.SourceDocBytes == null ?
        this.candidateOfferDetails.SourceDocBytes = '' : true;
      ''

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
      // this.IsReOffer == true ? this.candidateDetails.LstCandidateOfferDetails[0].Id = 0 : null;

      // this.candidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForAL = false;
      // this.candidateDetails.LstCandidateOfferDetails[0].IsCandidateAcceptanceRequiredForOL = false;

      this.candidateCommunicationDetails.LstContactDetails = this.lstContactDetails;
      this.candidateCommunicationDetails.Modetype = UIMode.Edit;

      this.candidateOtherDetails.Modetype = UIMode.Edit;;
      this.candidateOtherDetails.Id = (this.Id != 0 && this._NewCandidateDetails.CandidateOtherData != null) ? this._NewCandidateDetails.CandidateOtherData.Id : 0;
      this.candidateOtherDetails.LstCandidateStatutoryDtls = (this.lstStatutoryDetails.length != 0 ? this.lstStatutoryDetails : null);


      this.candidateOfferDetails.LstCandidateRateSet = this.lstRateSetDetails;

      if (this._NewCandidateDetails.LstCandidateOfferDetails != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null &&
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].additionalApplicableProducts = this.additionalApplicableProducts;
      }

      this.candidateDetails.CandidateOtherData = this.candidateOtherDetails;
      this.candidateDetails.CandidateCommunicationDtls = this.candidateCommunicationDetails;

      console.log('reactiveForm', this.candidateDetails);

      // this.candidateDetails.candidateOtherData.lstCandidateStatutoryDtls = (this.candidateOtherDetails.lstCandidateStatutoryDtls);
      // this.candidateDetails.workPermits.push(this.workPermitDetails);
      // this.candidateOfferDetails.lstCandidateRateSet.push(this.candidateRateSetDetails);
      this.candidateDetails.Gender = this.candidateDetails.Gender == null ? 0 : this.candidateDetails.Gender;

      this.candidateDetails.IsAadhaarKYCVerified = this.IsAadhaarKYC ? true : false;
      this.candidateDetails.IsUANKYCVerified = this.IsUANKYC ? true : false;
      this.candidateDetails.IsPANKYCVerified = this.IsPANKYC ? true : false;

      if (this.isAllenDigital && this.candidateDetails.LstCandidateOfferDetails[0].RequestType == 1) {
        this.candidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining =
          this.candidateDetails.LstCandidateOfferDetails[0].DateOfJoining;
      }

      this.candidateDetails.LstCandidateOfferDetails[0].TenureType == null || this.candidateDetails.LstCandidateOfferDetails[0].TenureType == -1 ?
        this.candidateDetails.LstCandidateOfferDetails[0].TenureType = TenureType.Open : true;

      if (this.Id != 0) {

        this.candidateDetails.Modetype = UIMode.Edit;
        this.candidateModel.NewCandidateDetails = this.candidateDetails;

      }
      else {
        this.candidateDetails.Modetype = UIMode.None;
        this.candidateModel = _CandidateModel;
        this.candidateModel.NewCandidateDetails = this.candidateDetails;

      }
      console.log("before saving", JSON.stringify(this.candidateModel));
      let candidate_req_json = this.candidateModel;

      // this.onboardingService.putCandidate(JSON.stringify(candidate_req_json))
      //   .subscribe(
      //     (data: any) => {
      //       this.handleCandidateData(data, index, LstfieldValue);
      //     },
      //     (error) => {
      //       this.handleError(error);
      //     }
      //   );

      this.onboardingService.putCandidate(JSON.stringify(candidate_req_json)).subscribe((data: any) => {
        this.isDuplicateBankInfo = false;
        let apiResponse: apiResponse = data;
        try {
          if (apiResponse.Status == false && apiResponse.Message == "Account number already exists") {
            this.isDuplicateBankInfo = true;
          }
          if (apiResponse.Status) {

            /* #region  dynamic field value  */

            var candidate_newObject: any = apiResponse.dynamicObject;
            var candidate_Id = candidate_newObject.NewCandidateDetails.Id as any;
            this.CandidateId = candidate_Id;
            if (LstfieldValue != null && LstfieldValue.length > 0) {
              var dynamicFieldsValue = new DynamicFieldsValue();
              dynamicFieldsValue.CandidateId = candidate_Id as any;
              dynamicFieldsValue.EmployeeId = 0;
              dynamicFieldsValue.FieldValues = LstfieldValue;
              dynamicFieldsValue.Id = this.Dynamicfieldvalue != null ? this.Dynamicfieldvalue.Id : 0;
              LstdynamicFieldsValue.push(dynamicFieldsValue);
            }

            this.onboardingService.UpsertDynamicFieldsValue(JSON.stringify(LstdynamicFieldsValue))
              .subscribe((rs) => {
                console.log('DY RESPONSE :: ', rs);
              })

            /* #endregion dynamic field value  */


            if (index == "Submit") {
              let UAC: any;
              if (this.RoleCode == 'CorporateHR' && this.candidateListingObj && this.candidateListingObj.ProcessstatusId == 4300 &&
                this.candidatesForm.controls.onboardingType.value == 'flash') {
                UAC = this.userAccessControl.filter(a => a.ControlName == "btn_centerhr_release")
              }
              if (this.RoleCode == 'CorporateHR' && this.candidateListingObj && this.candidateListingObj.ProcessstatusId == 4300 &&
                this.candidatesForm.controls.onboardingType.value == 'proxy') {
                UAC = this.userAccessControl.filter(a => a.ControlName == "btn_centerhr_submits")
              }

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
              this.workFlowInitiation.UserInterfaceControlLst = this.RoleCode == 'CorporateHR' && UAC != undefined && UAC != null && this.candidateListingObj && this.candidateListingObj.ProcessstatusId == 4300 ? UAC : this.accessControl_submit;
              console.log('WFI ::', this.workFlowInitiation)
              // this.loadingScreenService.stopLoading();
              // return;
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
                // this.loadingScreenService.stopLoading();
                this.alertService.showSuccess("Your details has been saved successfully!");

                // page do refresh done here
                // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                // this.router.onSameUrlNavigation = 'reload';
                let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
                this.router.navigate(['candidate_information'], {
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
                // var path = sessionStorage.getItem('previousPath');
                // this.router.navigateByUrl(path);


                this.alertService.showSuccess("Your candidate has been saved successfully!");

                // page do refresh done here
                // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
                // this.router.onSameUrlNavigation = 'reload';
                let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
                this.router.navigate([], {
                  queryParams: {
                    "Idx": btoa(this.Id.toString()),
                    "Cdx": btoa(_CandidateId.toString()),
                  }
                });

              };
              this.invaid_fields = [];
              this.clientApprovalTbl = [];
              this.LstBank = [];
              this.lstDocumentDetails = [];
              this.LstEducation = [];
              this.LstExperience = [];
              this.LstNominees = [];
              this.deletedLstBank = [];
              this.deletedLstEducation = [];
              this.deletedLstExperience = [];
              this.deletedLstNominee = [];
              this.deletedLstClientApproval = [];
              this.deletedLstCandidateDocument = [];
              this.loadingScreenService.stopLoading();
              this.ngOnInit();

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

      { this.alertService.showWarning(error + " Failed!  Candidate save wasn't completed"), this.loadingScreenService.stopLoading() };

    }

  }

  // handleCandidateData(data: any, index: string, LstfieldValue: any) {
  //   this.isDuplicateBankInfo = false;
  //   const apiResponse: apiResponse = data;
  //   try {
  //     if (apiResponse.Status === false && apiResponse.Message === "Account number already exists") {
  //       this.isDuplicateBankInfo = true;
  //     }

  //     if (apiResponse.Status) {
  //       const candidateDetails = apiResponse.dynamicObject.NewCandidateDetails;
  //       const candidateId = candidateDetails.Id as any;

  //       if (LstfieldValue != null && LstfieldValue.length > 0) {
  //         this.upsertDynamicFieldsValue(candidateId, LstfieldValue);
  //       }

  //       if (index === "Submit") {
  //         this.handleSubmit(candidateDetails, apiResponse.dynamicObject);
  //       } else {
  //         this.handleSave(candidateDetails, apiResponse);
  //       }
  //     } else {
  //       this.alertService.showWarning(`Failed! Candidate save wasn't completed ${apiResponse.Message || ''}`);
  //       this.loadingScreenService.stopLoading();
  //     }
  //   } catch (error) {

  //     { this.alertService.showWarning(error + " Failed!   Candidate save wasn't completed "), this.loadingScreenService.stopLoading() };
  //   }
  // }

  // handleSubmit(candidateDetails: any, dynamicObject) {
  //   this.candidateModel = dynamicObject;

  //   this.workFlowInitiation.Remarks = "";
  //   this.workFlowInitiation.EntityId = candidateDetails.LstCandidateOfferDetails[0].CandidateId;
  //   this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
  //   this.workFlowInitiation.CompanyId = this.CompanyId;
  //   this.workFlowInitiation.ClientContractId = candidateDetails.LstCandidateOfferDetails[0].ClientContractId;
  //   this.workFlowInitiation.ClientId = candidateDetails.LstCandidateOfferDetails[0].ClientId;

  //   this.workFlowInitiation.ActionProcessingStatus = 4000;
  //   this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
  //   this.workFlowInitiation.WorkFlowAction = 1;
  //   this.workFlowInitiation.RoleId = this.RoleId;
  //   this.workFlowInitiation.DependentObject = (this.candidateModel.NewCandidateDetails);
  //   this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_submit;
  //   this.finalSubmit(this.workFlowInitiation, "submit");
  // }

  // // Helper function to handle saving
  // handleSave(candidateDetails: any, apiResponse) {
  //   if (this.deleted_DocumentIds_List.length > 0) {
  //     this.deleted_DocumentIds_List.forEach((e) => {
  //       this.doDeleteFile(e.Id, e);
  //     });
  //   }

  //   if (this.localURL_Path) {
  //     var dynamicobj = {} as any;
  //     dynamicobj = (apiResponse.dynamicObject);
  //     var objString = dynamicobj["NewCandidateDetails"];
  //     this._NewCandidateDetails = dynamicobj["NewCandidateDetails"];
  //     this.Id = Number(objString.Id);
  //     this.candidateModel = (apiResponse.dynamicObject);
  //     // this.loadingScreenService.stopLoading();
  //     this.alertService.showSuccess("Your details has been saved successfully!");

  //     // page do refresh done here
  //     // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  //     // this.router.onSameUrlNavigation = 'reload';
  //     let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
  //     this.router.navigate(['candidate_information'], {
  //       queryParams: {
  //         "Idx": btoa(this.Id.toString()),
  //         "Cdx": btoa(_CandidateId.toString()),
  //       }
  //     });

  //     // this.router.navigateByUrl('success');
  //   } else {

  //     var dynamicobj = {} as any;
  //     dynamicobj = (apiResponse.dynamicObject);
  //     var objString = dynamicobj["NewCandidateDetails"];
  //     this._NewCandidateDetails = dynamicobj["NewCandidateDetails"];
  //     this.Id = Number(objString.Id);
  //     this.candidateModel = (apiResponse.dynamicObject);
  //     console.log('new candi', this._NewCandidateDetails);

  //     // this.Id = dynamicobj.NewCandidateDetails.Id;
  //     // var path = sessionStorage.getItem('previousPath');
  //     // this.router.navigateByUrl(path);


  //     this.alertService.showSuccess("Your candidate has been saved successfully!");

  //     // page do refresh done here
  //     // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  //     // this.router.onSameUrlNavigation = 'reload';
  //     let _CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
  //     this.router.navigate([], {
  //       queryParams: {
  //         "Idx": btoa(this.Id.toString()),
  //         "Cdx": btoa(_CandidateId.toString()),
  //       }
  //     });


  //   };

  //   this.resetAndRefresh();
  // }

  // navigateCandidateInformation(candidateId) {
  //   this.router.navigate([], {
  //     queryParams: {
  //       "Idx": btoa(this.Id.toString()),
  //       "Cdx": btoa(candidateId.toString()),
  //     }
  //   });
  // }

  // handleError(error: any) {
  //   this.loadingScreenService.stopLoading();
  //   this.alertService.showWarning(`Something is wrong! ${error}`);
  //   console.log("Something is wrong! : ", error);
  // }

  // // to upsert dynamic field values
  // upsertDynamicFieldsValue(candidateId: any, LstfieldValue: any) {
  //   const dynamicFieldsValue = new DynamicFieldsValue();
  //   dynamicFieldsValue.CandidateId = candidateId as any;
  //   dynamicFieldsValue.EmployeeId = 0;
  //   dynamicFieldsValue.FieldValues = LstfieldValue;
  //   dynamicFieldsValue.Id = this.Dynamicfieldvalue != null ? this.Dynamicfieldvalue.Id : 0;

  //   this.onboardingService.UpsertDynamicFieldsValue(JSON.stringify([dynamicFieldsValue]))
  //     .subscribe((rs) => {
  //       console.log('DY RESPONSE :: ', rs);
  //     });
  // }

  // // to reset arrays, stop loading, and refresh the page
  // resetAndRefresh() {
  //   this.clientApprovalTbl = [];
  //   this.LstBank = [];
  //   this.LstEducation = [];
  //   this.LstExperience = [];
  //   this.LstNominees = [];
  //   this.loadingScreenService.stopLoading();
  //   this.ngOnInit();
  // }

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
            sessionStorage.setItem('isAllenDigital', (this.ClientId == 1988 || this.ClientId == '1988') ? 'true' : 'false')
            this.loadingScreenService.stopLoading();
            // this.router.navigateByUrl('success');
            this.router.navigate(['success'], {
              queryParams: {
                "Cdx": btoa(this.ClientId)
              }
            });
          } else {
            this.loadingScreenService.stopLoading();
            // this._location.back();
            // var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboardingList' // localStorage.getItem('previousPath');
            var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboarding/onboardingList' // localStorage.getItem('previousPath');
            this.router.navigateByUrl(path);
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
        // var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboardingList' // localStorage.getItem('previousPath');
        var path = (this.RoleCode == 'OpsMember' || this.RoleCode == 'PayrollOps') ? '/app/onboarding/onboarding_ops' : '/app/onboarding/onboardingList' // localStorage.getItem('previousPath');
        this.router.navigateByUrl(path);
        // this._location.back();

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
        this.fileuploadService.deleteObjectStorage((Id)).subscribe((res) => {
          if (res.Status) {
            this.LstNominees = this.LstNominees.filter((nominee: any) => nominee.DocumentId !== Id);
            if (this.unsavedDocumentLst.length > 0) {
              var index = this.unsavedDocumentLst.map(function (el) {
                return el.Id
              }).indexOf(Id);

              // Delete  the item by index.
              this.unsavedDocumentLst.splice(index, 1);

            };
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
  };

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
    var objStorageJson = JSON.stringify({ CandidateName: this.candidatesForm.get('firstName').value, CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId });
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    modalRef.componentInstance.ClientLocationList = this.ClientLocationList;
    modalRef.componentInstance.OnboardingMode = 1;
    modalRef.componentInstance.ContractCode = "";
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
          if (environment.environment.RequestType_isDisabled == true) {
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
    if (controlName == 'ManagerId') {
      console.log("test")
    }

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
        showCancelButton: false,
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
        this.workFlowInitiation = new WorkFlowInitiation();
        console.log('ss', this.accessControl_reject)
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
    var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId })
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


  /* #endregion */

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



  chooseCandidate() {
    $('#popup_chooseCandidate').modal('show');

  }

  modal_dismiss() {
    $('#popup_chooseCandidate').modal('hide');

  }
  selected_Candidate_For_Offer(event, item) {

    this.InActiveOfferedCandidateList.forEach(e => {

      if (item.CandidateOfferId == e.CandidateOfferId) {
        e.isSelected = true;
        this._selected_reoffer_candidate = e
      } else {
        e.isSelected = false;
      }
    });
  }

  confirm_Candidate() {
    this.candidatesForm.reset();
    this.ClientList = [];
    this.ClientContractList = [];
    this.ClientContactList = [];
    this.OnBoardingInfoListGrp = undefined;
    this.Id = this._selected_reoffer_candidate.CandidateId;
    this.IsReOffer = true;
    this.CandidateId = this._selected_reoffer_candidate.CandidateId;
    // this.Id
    this.init();
    // this.do_Edit();
    this.modal_dismiss();


  }

  isArrayOfStrings(arr: any[]): boolean {
    return Array.isArray(arr) && arr.every((item) => typeof item === 'string');
  }

  getDynamicFieldDetailsConfig(_companyId, _clientId, _clientContractId) {
    var promise = new Promise((resolve, reject) => {
      this.should_spin_onboarding = true;
      this.DynamicFieldDetails = null;
      this.onboardingService.getDynamicFieldDetails(_companyId, _clientId, _clientContractId, null)
        .subscribe((response) => {
          console.log('DFD RES ::', response);
          let apiresult: apiResult = response;
          this.isDynamicApiCalled = true;
          if (apiresult.Status && apiresult.Result != null) {
            this.DynamicFieldDetails = apiresult.Result as any;
            var filteredItems = [];
            filteredItems = this.DynamicFieldDetails.ControlElemetsList.filter(z => z.ExtraProperities.ViewableRoleCodes.includes(this.RoleCode) == true);
            this.DynamicFieldDetails.ControlElemetsList = filteredItems;
            this.DynamicFieldDetails.ControlElemetsList.forEach(ele => {
              ele.LoadDataOnPageLoad == true ? this.getDropDownList(ele) : true;
            });
            console.log('DFD ::', filteredItems);
            console.log('DFD ID ::', this.Id);
            this.isDynamicFieldLoaded = this.Id == 0 ? true : false;
            this.Id != 0 && this.onboardingService.GetDynamicFieldsValue(this.CandidateId)
              .subscribe((getValue) => {
                console.log('DFD VALUES ::', getValue);
                let apires: apiResult = getValue;
                if (apires.Status && apires.Result != null) {
                  this.Dynamicfieldvalue = apires.Result as any;
                  if (filteredItems.length > 0 && this.Dynamicfieldvalue != null && this.Dynamicfieldvalue.FieldValues != null && this.Dynamicfieldvalue.FieldValues.length > 0) {
                    this.Dynamicfieldvalue.FieldValues.forEach(ee => {
                      const isExists = this.DynamicFieldDetails.ControlElemetsList.find(a => a.FieldName == ee.FieldName);
                      isExists != null && isExists != undefined && (isExists.Value = ee.Value != null ? isExists.InputControlType == 3 ? (ee.Value) as any : (ee.Value) : null);
                      // ! For ITC
                      isExists != null && isExists != undefined && (isExists.MultipleValues = ee.MultipleValues != null ? (ee.MultipleValues = this.isArrayOfStrings(ee.MultipleValues) ? ee.MultipleValues.map(Number) : ee.MultipleValues) as any : null);
                    });
                  }
                  this.isDynamicFieldLoaded = true;
                  console.log('mapped values', this.DynamicFieldDetails);

                  this.should_spin_onboarding = false;
                } else {
                  this.isDynamicFieldLoaded = true;
                  this.should_spin_onboarding = false;
                }
              })
            this.should_spin_onboarding = false;
          }
          else {
            this.isDynamicFieldLoaded = true;
            this.should_spin_onboarding = false;
          }

        }, error => {
          this.isDynamicFieldLoaded = true;
          this.should_spin_onboarding = false;
        })

      resolve(true);
    });
    return promise;
  }
  isDynamicAccordionAvailable(AccordionName) {

    return this.DynamicFieldDetails.ControlElemetsList.find(item => item.TabName == AccordionName) != undefined ? true : false;
  }

  isEmptyObject(obj) {
    return (obj && (Object.keys(obj).length === 0));
  }

  getDynamicAccordionFields(AccordionName) {

    if (this.candidatesForm.get('requestFor').value == 'AL') {
      return this.DynamicFieldDetails.ControlElemetsList.filter(item => item.TabName == AccordionName && item.ExtraProperities.IsAL == true);
    } else {
      return this.DynamicFieldDetails.ControlElemetsList.filter(item => item.TabName == AccordionName && item.ExtraProperities.IsOL == true);
    }
  }

  getDropDownList(controlElement: ControlElement) {
    controlElement.DropDownList = null;
    let parentElementList: any[] = null;
    this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {
      if (dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '')
        controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
      controlElement.DropDownList = _.orderBy(controlElement.DropDownList, [controlElement.DisplayField], ["asc"]);
      if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
        controlElement.DropDownList = [];
      }
    }, error => {
      console.log(error);
      controlElement.DropDownList = [];
    })
  }

  ngOnDestroy(): void {
    sessionStorage.removeItem('isNewTransfer');
    this.headerService.setCandidateDetailsForAadhaar(null);
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
    this.stopper.next();
    this.stopper.complete();
  }

  checkAscii(event, data) {
    console.log("ascii keyword", event)
    console.log("ascii data", data)
    // let str=this.candidatesForm.get('designation').value
    let str = this.candidatesForm.get('designation').value
    this.asciiCount = 0
    this.asciiKey = ''
    let index: number
    for (var i = 0; i < str.length; i++) {
      if (str.charCodeAt(i) > 127) {
        this.asciiCount++
        if (this.asciiCount == 1) {
          index = i
          this.asciiKey = str[index]
        }

      }
    }
  }

  duplicateCheck() {
    console.log('sss');
    const aadhaarNumber = this.candidatesForm.controls['AadhaarNumber'].value.toString();



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

    else if (this.isAllenDigital && this.utitlityService.isNullOrUndefined(this.candidatesForm.get('AadhaarNumber').value) == true) {
      this.alertService.showWarning('Kindly provide the Aadhaar number to proceed.');
      return;
    }

    else if (this.isAllenDigital && typeof aadhaarNumber === 'string' && aadhaarNumber.trim().length !== 12) {
      this.alertService.showWarning('Aadhaar: Please match the requested format (e.g., 2XXX XXXX 1111)');
      return;
    }



    else if (this.isAllenDigital && this.utitlityService.isNullOrUndefined(this.candidatesForm.get('PAN').value) == true) {
      this.alertService.showWarning('Kindly provide the PAN to proceed.');
      return;
    }
    else if (this.isAllenDigital && this.candidatesForm.get('PAN').valid == false) {
      this.alertService.showWarning('PAN : Please match the requested format (e.g., ABCPD1234E)');
      return;
    }

    var date = moment(this.candidatesForm.get('dateOfBirth').value);
    if (!date.isValid) {
      this.alertService.showWarning('Please enter valid Date of Birth (DD-MM-YYYY)');
      return;
    } else if (moment(date).isAfter(moment(this.DOBmaxDate), 'day')) {
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
      this.candidatesForm.controls['AadhaarNumber'] != null ? duplicateCandidateDetails.Aadhaar = this.candidatesForm.get('AadhaarNumber').value == null || this.candidatesForm.get('AadhaarNumber').value == "" ? "" : this.candidatesForm.get('AadhaarNumber').value : null;
      this.candidatesForm.controls['PAN'] != null ? duplicateCandidateDetails.PAN = this.candidatesForm.get('PAN').value == null || this.candidatesForm.get('PAN').value == "" ? "" : this.candidatesForm.get('PAN').value : null;

      console.log('duplicateCandidateDetails', duplicateCandidateDetails);

      this.onboardingService.ValidateCandidateInformation(duplicateCandidateDetails).subscribe((result) => {
        console.log('result', result);

        let apiResult: apiResult = (result);
        this.alertService.showSuccess("The candidate was successfully validated.");
        if (apiResult.Status && apiResult.Result != null) {
          this.loadingScreenService.stopLoading();
        } else if (!apiResult.Status && apiResult.Message != null && apiResult.Message != '') {
          this.isInvalidCandidateInformation = true;
          if (apiResult.Message.includes('Record updation failed:')) {
            apiResult.Message = apiResult.Message.replace('Record updation failed:', '');
          }
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
    if (input.target.files && input.target.files[0]) {
      if (input.target.files[0].size > environment.environment.AttachmentMaxSize) {
        this.alertService.showWarning("File size exceeds the limit. Please upload a file with a size of up to " + environment.environment.AttachmentMaxSizeLabel + ".")
        return;
      }
    }
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
    if (input.target.files && input.target.files[0]) {
      if (input.target.files[0].size > environment.environment.AttachmentMaxSize) {
        this.alertService.showWarning("File size exceeds the limit. Please upload a file with a size of up to " + environment.environment.AttachmentMaxSizeLabel + ".")
        return;
      }
    }
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
                ListDocumentList.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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
              ListDocumentList.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
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

  close_documentviewer() {
    this.documentURLId = null;
    this.downLoadFileName = null;
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


  //NEW Change
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
                  console.log('this.docList', this.docList);
                  return;
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
  close_documentviewer2() {
    this.documentURLId = null;
    this.downLoadFileName = null;
    $("#documentviewer2").modal('hide');

  }

  showApplicableProducts() {
    console.log('Applicable Products Drawer');
    // check if modify applicable products already added and update the values
    if (this._NewCandidateDetails.LstCandidateOfferDetails && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet
      && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
      this.additionalApplicableProducts = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].additionalApplicableProducts;
    }
    const drawerRef = this.drawerService.create<AdditionalApplicableProductsComponent, { data: any }, string>({
      nzTitle: 'APPLICABLE PRODUCTS',
      nzContent: AdditionalApplicableProductsComponent,
      nzWidth: 950,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        data: this.additionalApplicableProducts
      }
    });
    drawerRef.afterOpen.subscribe(() => {
      console.log('Applicable Products Drawer Opened');

    });
    drawerRef.afterClose.subscribe((data?: any) => {
      console.log('Applicable Products Drawer Closed', data);
      if (data) {
        this.additionalApplicableProducts = data;
      }
    });
  }

  onChangeMinWagesApplicableProducts(e: any) {
    console.log('Min.Wages Applicable Products -->', e, this.candidatesForm.controls.minimumWagesApplicableProducts);
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
            this.isLoading = true;

            if (docTypeName == 'Aadhaar') {
              this.KYCAadhaarDocumentId = apiResult.Result as any;
              this.BindingEverifiedAadhaarDetails();
            }
            else if (docTypeName == 'Profile') {
              this.KYCProfileDocumentId = apiResult.Result as any;
              this.BindingEverifiedProfileDetails();
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
  /* #endregion */


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
            // element.Status = this.IsMisMatchingAadhaar ? ApprovalStatus.Pending : ApprovalStatus.Approved;
            element.Status = this.IsMisMatchingAadhaar ? ApprovalStatus.Pending : ApprovalStatus.Approved;
            element.CategoryType = _.uniqBy(element.CategoryType, 'Id');
            // element.IsKYCVerified = this.IsMisMatchingAadhaar ? false : true;
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
              // ListDocumentList.Status = this.IsMisMatchingAadhaar ? ApprovalStatus.Pending : ApprovalStatus.Approved;
              ListDocumentList.Status = this.IsMisMatchingAadhaar ? ApprovalStatus.Pending : ApprovalStatus.Approved;

              ListDocumentList.IsOtherDocument = false;
              ListDocumentList.Modetype = UIMode.Edit;
              ListDocumentList.DocumentCategoryName = "";
              ListDocumentList.StorageDetails = null;
              // ListDocumentList.DocumentVerificationMode = this.IsMisMatchingAadhaar ? DocumentVerificationMode.QcVerification : DocumentVerificationMode.KYC;
              ListDocumentList.DocumentVerificationMode = this.IsMisMatchingAadhaar ? DocumentVerificationMode.QcVerification : DocumentVerificationMode.KYC;
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

  BindingEverifiedProfileDetails() {
    if (this.aadhaarDetails) {
      var aadhaarDocs = [];
      try {


        this.documentTbl && this.documentTbl.length > 0 && this.documentTbl.forEach(element => {
          if (this.DocumentCategoryist != null && this.DocumentCategoryist.length > 0 && this.DocumentCategoryist.find(a => a.Code == 'ProfileAvatar') != undefined && (element.DocumentTypeId == this.DocumentCategoryist.find(a => a.Code == 'ProfileAvatar').DocumentTypeId) == true) {

            element.DocumentNumber = this.aadhaarDetails.maskedAadhaarNumber;
            element.DocumentId = this.KYCProfileDocumentId;
            element.FileName = `${this.aadhaarDetails.name.trim()}_profileAvatarDoc.png`;
            element.Modetype = UIMode.Edit;
            element.Status = this.IsMisMatchingAadhaar ? ApprovalStatus.Pending : ApprovalStatus.Approved;

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
              ListDocumentList.IsSelfDocument = false;
              ListDocumentList.DocumentId = this.KYCProfileDocumentId;
              ListDocumentList.DocumentCategoryId = e1.Id;
              ListDocumentList.DocumentTypeId = element.DocumentTypeId;
              ListDocumentList.DocumentNumber = this.aadhaarDetails.maskedAadhaarNumber;
              ListDocumentList.FileName = `${this.aadhaarDetails.name.trim()}_profileAvatarDoc.png`;
              ListDocumentList.ValidFrom = null;
              ListDocumentList.ValidTill = null;
              ListDocumentList.Status = this.IsMisMatchingAadhaar ? ApprovalStatus.Pending : ApprovalStatus.Approved;
              ListDocumentList.IsOtherDocument = true;
              ListDocumentList.Modetype = UIMode.Edit;
              ListDocumentList.DocumentCategoryName = "";
              ListDocumentList.StorageDetails = null;
              ListDocumentList.DocumentVerificationMode = this.IsMisMatchingAadhaar ? DocumentVerificationMode.QcVerification : DocumentVerificationMode.KYC;
              this.lstDocumentDetails.push(ListDocumentList);

            });

          }

        });

        console.log('this.lstDocumentDetails', this.lstDocumentDetails);


      }
      catch (error) {
        console.log('E', error)
      }
    }

  }

  verifyUserOfficialNumber(propName) {


    if (this.candidatesForm.get('firstName').value == null || this.candidatesForm.get('firstName').value == '' || this.candidatesForm.get('firstName').value == undefined) {
      this.alertService.showWarning('Please enter the candidate name');
      return;
    }
    if (this.candidatesForm.get('mobile').value == null || this.candidatesForm.get('mobile').value == '' || this.candidatesForm.get('mobile').value == undefined) {
      this.alertService.showWarning('Please enter the mobile number');
      return;
    }
    if (propName == "UAN" && (this.candidatesForm.get('UAN').value == null || this.candidatesForm.get('UAN').value == "" || this.candidatesForm.get('UAN').value.length < 12 || this.candidatesForm.get('UAN').value.length > 12)) {
      this.alertService.showWarning('Please match the requested format. (Ex: 1012 3456 7891) | Number must be start with greater than 0');
      return;
    }

    if (propName == "PAN" && (this.candidatesForm.get('PANNO').value == null || this.candidatesForm.get('PANNO').value == "" || this.candidatesForm.get('PANNO').value.length < 10 || this.candidatesForm.get('PANNO').value.length > 10)) {
      this.alertService.showWarning('Please match the requested format. (Ex: ABCPD1234E)');
      return;
    }

    var userDetails = {
      Name: this.candidatesForm.get('firstName').value,
      MobileNumber: this.candidatesForm.get('mobile').value,
      ComponentName: "Candidate",
      VerificationRequest: propName,
      OfficialNumber: propName == "UAN" ? this.candidatesForm.get('UAN').value : this.candidatesForm.get('PANNO').value,
      CompanyId: this.CompanyId
    }

    this.openVerificationModal(userDetails, propName);

  }


  openVerificationModal(userDetails, propName) {

    propName == "UAN" ? this.IsUANKYC = false : true;
    propName == "PAN" ? this.IsPANKYC = false : true;
    let responseData = {
      status: "",
      data: {
        nameLookup: null,
        uan: [{
          employer: [],
          uan: "",
          uanSource: ""
        }]
      }
    };

    const modalRef1 = this.modalService.open(UserverificationComponent, this.modalOption);
    modalRef1.componentInstance.userDetails = userDetails
    modalRef1.result.then((result) => {
      if (result != 'Modal Closed') {
        console.log('responseData', result);
        let previewSource = {
          OfficialNumber: "",
          IsVerified: false
        }
        previewSource = result as any;
        if (previewSource.IsVerified && propName == "UAN") {
          this.candidatesForm.controls['UAN'].disable();
          this.candidatesForm.controls['UAN'].setValue(previewSource.OfficialNumber);
          this.IsUANKYC = true;
        }
        if (previewSource.IsVerified && propName == "PAN") {
          this.candidatesForm.controls['PANNO'].disable();
          this.candidatesForm.controls['PANNO'].setValue(previewSource.OfficialNumber);
          this.IsPANKYC = true;
        }
      }

    }).catch((error) => {
      console.log(error);
    });
    return;

  }


  onboardingAdditionalInfoChangeHandler(additionalInfo: AdditionalColumns) {
    this.failedFieldsForAdditionalInformation = [];
    this.additionalColumns = additionalInfo;
    for (const prop of Object.keys(additionalInfo)) {
      if (this.additionalColumns[prop] == null || this.additionalColumns[prop] == 0 || this.additionalColumns[prop] == "") {
        this.failedFieldsForAdditionalInformation.push(prop);
      }
      console.log(`Property Name: ${prop}, Value: ${additionalInfo[prop]}`);
    }
  }

  // LANGUAGE KNOWN PROFICIENCY

  onchangeLanguageProficiency(lpitem) {
    this.selectLanguageProficiencyElement = lpitem.Id;
  }

  addLanguageProficiency() {
    const isReadChecked = this.readCheckbox.nativeElement.checked;
    const isWriteChecked = this.writeCheckbox.nativeElement.checked;
    const isSpeakChecked = this.speakCheckbox.nativeElement.checked;
    const updatedLanguageProficiency = this.selectLanguageProficiencyElement;

    if (updatedLanguageProficiency == null || updatedLanguageProficiency == undefined) {
      this.alertService.showWarning('Select a Language Proficiency.');
      return;
    }

    if (!isReadChecked && !isWriteChecked && !isSpeakChecked) {
      this.alertService.showWarning('Choose at least one Ability (Read, Write, or Speak).');
      return;
    }
    console.log('updatedLanguageProficiency', updatedLanguageProficiency);

    const existingIndex = this.LstLanguageKnown.findIndex(item => item.LanguageProficiency === updatedLanguageProficiency);

    console.log('existingIndex', existingIndex);


    // If the LanguageProficiency exists in the list, update its properties
    if (existingIndex !== -1) {
      this.LstLanguageKnown[existingIndex].IsRead = isReadChecked;
      this.LstLanguageKnown[existingIndex].IsWrite = isWriteChecked;
      this.LstLanguageKnown[existingIndex].IsSpeak = isSpeakChecked;
      this.LstLanguageKnown[existingIndex].Modetype = UIMode.Edit;
      this.LstLanguageKnown[existingIndex].Status = true
    } else {
      // If the LanguageProficiency doesn't exist, push a new item to the list
      this.LstLanguageKnown.push({
        LanguageProficiency: updatedLanguageProficiency,
        IsRead: isReadChecked,
        IsWrite: isWriteChecked,
        IsSpeak: isSpeakChecked,
        Modetype: UIMode.Edit,
        Status: true,
        Id: UUID.UUID()
      });
    }

    this.readCheckbox.nativeElement.checked = false;
    this.writeCheckbox.nativeElement.checked = false;
    this.speakCheckbox.nativeElement.checked = false;
    this.selectLanguageProficiencyElement = null;
    this.isEditLangProf = false
  }

  getLanguageName(languageProficiency: number): string {
    const language = this.LstLanguage.find(lang => lang.Id === languageProficiency);
    return language ? language.Name : 'Unknown Language';
  }

  deleteLangProf(item, index) {

    if (this.isGuid(item.Id)) {
      this.LstLanguageKnown.splice(index, 1);
    }
    else {
      const existingIndex = this.LstLanguageKnown.findIndex(i => i.Id == item.Id);
      if (existingIndex !== -1) {
        this.LstLanguageKnown[existingIndex].Modetype = UIMode.Edit;
        this.LstLanguageKnown[existingIndex].Status = false;
      }
    }
  }

  editLangProf(item) {
    this.isEditLangProf = true;
    this.readCheckbox.nativeElement.checked = item.IsRead;
    this.writeCheckbox.nativeElement.checked = item.IsWrite;
    this.speakCheckbox.nativeElement.checked = item.IsSpeak;
    this.selectLanguageProficiencyElement = item.LanguageProficiency;
  }


  // REFERENCE DETAILS

  addReference(item = null) {

    const modalRef = this.modalService.open(EmploymentReferenceDetailsComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.jsonObj = item;
    modalRef.componentInstance.EntityType = "Candidate";
    modalRef.result.then((result) => {

      console.log('result', result);

      if (result != "Modal Closed") {

        const activeItems = this.LstReference.filter(a => a.Modetype !== UIMode.Delete);

        if (activeItems.length > 0 && activeItems.some(a => a.Id != result.Id && (a.ContactNumber == result.ContactNumber || a.Email == result.Email))) {
          this.alertService.showWarning('Duplicate email or contact number found. Please use unique values.');
          return;
        }


        let isSameResult = false;
        isSameResult = _.find(this.LstReference, (a) => a.Id == result.Id) != null ? true : false;

        if (isSameResult) {
          this.LstReference[this.LstReference.findIndex(el => el.id === result.id)] = result;
        } else {
          this.LstReference.push(result);
        }
      }

    }).catch((error) => {
      console.log(error);
    });

  }

  deleteReference(item, index) {

    this.alertService.confirmSwal("Warning", "Are you sure you want to delete this record? ", "Yes, Delete").then(result => {

      if (this.isGuid(item.Id)) {
        this.LstReference.splice(index, 1);
      }
      else {
        const existingIndex = this.LstReference.findIndex(i => i.Id == item.Id);
        console.log('existingIndex', existingIndex);

        if (existingIndex !== -1) {
          this.LstReference[existingIndex].Modetype = UIMode.Edit;
          this.LstReference[existingIndex].Status = false;
        }

      }

    }).catch(error => {

    });

  }

  getActiveReferenceDetails() {
    return this.LstReference.length == 0 || this.LstReference.filter(a => a.Status).length == 0 ? true : false;
  }


  async getOnboardingConfiguration() {
    try {
      const data = await this.onboardingService.GetOnboardingConfiguration(this.ClientContractId, "Candidate").toPromise();
      console.log('CONFI', data);

      if (data.Status) {
        this.OnboardingOperationalConfiguration = data.Result as any;

        if (this.OnboardingOperationalConfiguration.LstLanguage.length > 0) {
          this.LstLanguage = this.OnboardingOperationalConfiguration.LstLanguage;
        }
        if (this.OnboardingOperationalConfiguration.LstReligion.length > 0) {
          this.LstReligion = this.OnboardingOperationalConfiguration.LstReligion;
        }

        this.LstEducationDocumentTypes = this.OnboardingOperationalConfiguration.EducationDocumentTypes;
        this.LstWorkExperienceDocumentTypes = this.OnboardingOperationalConfiguration.WorkExperienceDocumentTypes;

        if (this.OnboardingOperationalConfiguration.ClientContractOperations != null) {
          this.isLanguageKnownInfo = this.OnboardingOperationalConfiguration.ClientContractOperations.IsLanguageDetailsRequired;
          this.isAdditionalOperationalInfo = this.OnboardingOperationalConfiguration.ClientContractOperations.IsOperationDetailsRequried;
          this.IsPhotoMandatory = this.OnboardingOperationalConfiguration.ClientContractOperations.IsPhotoMandatory;
          this.IsCandidateSignatureMandatory = this.OnboardingOperationalConfiguration.ClientContractOperations.hasOwnProperty('IsCandidateSignatureMandatory') ? this.OnboardingOperationalConfiguration.ClientContractOperations.IsCandidateSignatureMandatory : false;
          this.IsEvaluationsheetRequired = this.OnboardingOperationalConfiguration.ClientContractOperations.IsEvaluationSheetRequired;
          this.isReferenceDetails = this.OnboardingOperationalConfiguration.ClientContractOperations.IsReferenceDetailsRequied;
          this.IsDeclarationContextRequired = this.OnboardingOperationalConfiguration.ClientContractOperations.IsDeclarationContextRequired;
          this.DeclarationContextMessage = this.OnboardingOperationalConfiguration.ClientContractOperations.OnboardingDeclarationText;
          // this.isClientApproval = this.OnboardingOperationalConfiguration.ClientContractOperations.IsClientApprovalRequired;

        }
      }
      this.loadingScreenService.stopLoading();
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(error);
    }
  }


  onboardingAdditionalOperationalInfoChangeHandler(additionalOperationalDetails: AdditionalOperationalDetails) {
    this.additionalOperationalDetails = additionalOperationalDetails;
    console.log('additionalOperationalDetails', additionalOperationalDetails);

    // for (const prop of Object.keys(additionalOperationalDetails)) {
    //   if (this.additionalOperationalDetails[prop] == null || this.additionalOperationalDetails[prop] == 0 || this.additionalOperationalDetails[prop] == "") {
    //     // this.failedFieldsForAdditionalInformation.push(prop);
    //   }
    //   console.log(`Property Name: ${prop}, Value: ${additionalOperationalDetails[prop]}`);
    // }
  }

  doCheckExtendedSection(sectionName) {
    const onboardingType = this.candidatesForm.get('onboardingType').value == "flash" ? OnBoardingType.Flash : OnBoardingType.Proxy;
    if ((sectionName == 'Reference' || sectionName == 'LanguageProficiency') && onboardingType == 1 && this.RoleCode == 'Candidate') {
      return true;
    }
    else if ((sectionName == 'Reference' || sectionName == 'LanguageProficiency') && onboardingType == 2 && this.RoleCode != 'Candidate') {
      return true;
    }
  }

  shouldDisplayAddBankButton() {
    return this.LstBank.length == 0 ? false : this.LstBank.filter(a => a.Modetype != UIMode.Edit).length > 0 ? false : true; 
  }

  doCheckAllenDigital() {

    return this.BusinessType == 1 && Number(environment.environment.ACID) == Number(this.ClientId) ? true : false;

  }

  onChangeMartialStatus(event) {
    if(event.id == 2 || event.id == 3) { // Married || Separated
      this.updateValidation(true, this.candidatesForm.get('MarriageDate'));
    } else {
      this.updateValidation(false, this.candidatesForm.get('MarriageDate'));
      this.candidatesForm.controls['MarriageDate'].setValue(null)
    }
  }

  filterMartialStatus(id?) {
    this.maritalStatus = this.utilsHelper.transform(MaritalStatus)
    //Filtering the dropdown
    if (this.candidatesForm.get('gender').value == 1) {//Male
      this.maritalStatus = this.maritalStatus.filter(item => item.id !== 5)
      if (this.candidatesForm.get('maritalStatus').value == 5) {//Updating the martial status when the gender is updated
        this.candidatesForm.controls['maritalStatus'].setValue(6)
      }
    } else if (this.candidatesForm.get('gender').value == 2) {//Female
      this.maritalStatus = this.maritalStatus.filter(item => item.id !== 6)
      if (this.candidatesForm.get('maritalStatus').value == 6) {//Updating the martial status when the gender is updated
        this.candidatesForm.controls['maritalStatus'].setValue(5)
      }
    } else {
      this.candidatesForm.controls['maritalStatus'].setValue(null)
    }
  }

  onChangeOfferInfoFields(event, fieldName) {
    if (fieldName == 'Category') {
      this.candidateOfferDetails.Level = null;
      this.selectedDesignationLevelId = "";
      this.candidatesForm.controls['designation'].setValue(null);
      this.candidatesForm.controls['salaryType'].setValue(null);
      this.getDesignationList();
      this.getSalaryBreakupType(event.Code);
    }
    else if (fieldName == "Designation") {
      this.additionalColumns.Level = event.LevelId
      this.filteredSkillCategoryList = this.getSkillCategoryList();      
      this.selectedDesignationLevelId = this.getDesignationLevelDisplayName(event.LevelId);
    }
  }

    getSalaryBreakupType(categoryCode: string = "") {
    let salaryTypes = this.salaryType;
    let filteredSalaryTypes;
    if (['', null, undefined].includes(categoryCode)) {
      filteredSalaryTypes = salaryTypes;
    } else if (categoryCode.toUpperCase() === 'EXECUTIVE') {
      filteredSalaryTypes = salaryTypes.filter(a => a.id === 1);
    } else {
      filteredSalaryTypes = salaryTypes;
    }

    this.filteredSalaryTypes = filteredSalaryTypes;
    
    if (filteredSalaryTypes.length === 1) {
      this.candidatesForm.controls['salaryType'].setValue(filteredSalaryTypes[0].id);
    }
  }
  
  getDesignationList() {
    let categoryValue = this.candidatesForm.get('Category').value;
    var designations = this.DesignationList;

    if (['', null, undefined].includes(categoryValue)) {
      this.filteredDesignationList = designations;
    } else {
      this.filteredDesignationList = designations.filter(a => a.CategoryId === categoryValue);
    }

  }

  getDesignationLevelDisplayName(levelId) {
    return levelId != null && levelId != 0 && this.onboardingAdditionalInfo.LstEmployeeLevel &&
      this.onboardingAdditionalInfo.LstEmployeeLevel.length > 0 && this.onboardingAdditionalInfo.LstEmployeeLevel.find(a => a.Id == levelId) ?
      this.onboardingAdditionalInfo.LstEmployeeLevel.find(a => a.Id == levelId).Name : "";
  }

  getSkillCategoryList() {
    let designationValue = this.candidatesForm.get('designation').value;    
    let locationValue = this.candidatesForm.get('location').value;
    let industryValue = this.candidatesForm.get('industryType').value;
    let skillCategories = this.SkillCategoryList;
    if (!['', null, undefined].includes(designationValue) && ( this.isAllenDigital ? !['', null, undefined].includes(locationValue): true) && !['', null, undefined].includes(industryValue)) {
      const defaultSkillId = this.DesignationList.length > 0 && this.DesignationList.find(a => a.Id == designationValue).SkillCategoryId;
      if (defaultSkillId > 0 && defaultSkillId != undefined && defaultSkillId != null) {
        this.candidatesForm.controls['skillCategory'].setValue(skillCategories.find(a => a.Id == defaultSkillId).Id)
        return skillCategories;
      }

    } else {
      return skillCategories;
    }
  }  

  isFieldRequired(fieldName: string): boolean {    
    let isRequired = this.requiredAdditionalColumnSettingValue && this.requiredAdditionalColumnSettingValue.length > 0 && this.requiredAdditionalColumnSettingValue.filter(a => a.ColumnName == fieldName).length > 0 ? this.requiredAdditionalColumnSettingValue.find(a => a.ColumnName == fieldName).MandatoryRoleCodes.includes(this.currentRoleCode) ? true : false : false;
    if(isRequired) {
      this.updateValidation(true, this.candidatesForm.get(fieldName));
    } else {
      this.updateValidation(false, this.candidatesForm.get(fieldName));

    }
    return isRequired;
  }

  getClientLocationList() {

    let cityValue = this.CityId;
    var workLocation = this.ClientLocationList;
    return ['', null, undefined].includes(cityValue) ? workLocation :
      workLocation.filter(a => Number(a.CityId) == Number(cityValue));
  }

  onChangeCityByStateId(state){
    this.candidatesForm.controls['presentCity'].setValue(null);
    this.CityList = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId === state.Id), ['Name'], ['asc']);
  }

  onChangeCityByStateId1(state){
    this.candidatesForm.controls['permanentCity'].setValue(null);
    this.CityList1 = _.orderBy(_.filter(this.CommunicationListGrp.CityList, (a) => a.StateId === state.Id),['Name'],['asc']);
  }
}



// Bank func :
