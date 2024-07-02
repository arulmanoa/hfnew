import { DownloadService } from './../../../_services/service/download.service';
import { NgForm, FormGroup, FormBuilder, Validators, FormControl, NG_VALUE_ACCESSOR, AbstractControl } from '@angular/forms';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { HeaderService } from 'src/app/_services/service/header.service';
import { InputControlType, SearchPanelType, DataSourceType, RowSelectionType, DefaultLayoutType } from '../enums';
import { catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

//import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { Component, OnInit, ɵConsole, ViewChild, ElementRef, Input, OnDestroy } from '@angular/core';
import { GridConfiguration, PageLayout, SearchElementValues, ColumnDefinition, SearchElement, DataSource } from '../models'
import { Column, GridOption, AngularGridInstance, Aggregators, Grouping, GroupTotalFormatters, Formatters, Formatter, Filters, ColumnFilter, AngularUtilService } from 'angular-slickgrid';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal, { SweetAlertOptions } from "sweetalert2";
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as _ from 'lodash';
import { find, get, pull } from 'lodash';
export let browserRefresh = false;
import { NzMessageService } from 'ng-zorro-antd/message';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { ClientContractService } from 'src/app/_services/service/clientContract.service';
import * as JSZip from 'jszip';
import * as jsPDF from 'jspdf';


// POPUP MODAL 
import { DownloadBillingSheetModalComponent } from 'src/app/shared/modals/payroll/download-billing-sheet-modal/download-billing-sheet-modal.component';
import { SaleorderSummaryModalComponent } from 'src/app/shared/modals/payroll/saleorder-summary-modal/saleorder-summary-modal.component';
import { PayrollImportdataComponent } from 'src/app/shared/modals/payroll/payroll-importdata/payroll-importdata.component';

// SERVICES
import { PayrollService } from '../../../_services/service/payroll.service';
import { SessionStorage } from './../../../_services/service/session-storage.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { RowDataService } from '../row-data.service';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';
import { EmployeeService } from 'src/app/_services/service/employee.service';
import { SearchService } from '../../../_services/service/search.service';

// MODEL CLASS (INTERFACE)
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { PVRStatus, PayrollVerificationRequestDetails, PayrollVerificationRequest } from './../../../_services/model/Payroll/PayrollVerificationRequest';
import { apiResult } from './../../../_services/model/apiResult';
import { GeneratePIS } from './../../../_services/model/Payroll/generatePIS';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { PayrollModel, _PayrollModel } from './../../../_services/model/Payroll/ParollModel';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { SaleOrderStatus, SaleOrder, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { PayOutStatus, PayoutInformationDetails, PayoutInformation, _PayOutModel, PayOutModel, PayOutDetailsStatus } from 'src/app/_services/model/Payroll/PayOut';
import { PayoutFinanceModalComponent } from 'src/app/shared/modals/payroll/payout-finance-modal/payout-finance-modal.component';
import { PayoutViewrequestModalComponent } from 'src/app/shared/modals/payroll/payout-viewrequest-modal/payout-viewrequest-modal.component';
import { searchObject, _searchObject } from 'src/app/_services/model/Common/SearchObject';
import { SaleorderModalComponent } from 'src/app/shared/modals/payroll/saleorder-modal/saleorder-modal.component';
import { ConfirmationAlertModalComponent } from 'src/app/shared/modals/common/confirmation-alert-modal/confirmation-alert-modal.component';
import { FileUploadService, CommonService, ExcelService, OnboardingService, ClientService, ProductService, PaygroupService, ScaleService, HttpService } from 'src/app/_services/service';
import { InvoiceModalComponent } from 'src/app/shared/modals/invoices/invoice-modal/invoice-modal.component';
import { Invoice, InvoiceStatus } from 'src/app/_services/model/Payroll/Invoice';
import { RollOverlog } from 'src/app/_services/model/Payroll/RollOverLog';
import { environment } from "../../../../environments/environment";
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { ELCTRANSACTIONTYPE, EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { TransactionStatus } from 'src/app/_services/model/Employee/EmployeeFFTransaction';
import { result } from 'lodash';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { NzDrawerService } from 'ng-zorro-antd';
import { PaymentstatusComponent } from 'src/app/shared/modals/payroll/paymentstatus/paymentstatus.component';
import { EntitlementAvailmentRequest, EntitlementRequestStatus, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { LeaveregularizeComponent } from 'src/app/shared/modals/leaveManagement/leaveregularize/leaveregularize.component';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
import { Attendance, AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { EmployeeAttendanceBreakUpDetails, EmployeeAttendancePunchInDetails, SubmitAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { AttendanceBreakUpDetailsStatus, EmployeeAttendancModuleProcessStatus } from 'src/app/_services/model/Attendance/AttendanceEnum';
import { EmployeebulkattendanceModalComponent } from 'src/app/shared/modals/attendance/employeebulkattendance-modal/employeebulkattendance-modal.component';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { CommonApiMethodService } from 'src/app/_services/service/commonapimethod.service';
import { UUID } from 'angular2-uuid';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { InvestmentpreviewComponent } from '../../Employee/investmentpreview/investmentpreview.component';
import { CandidateModel, _CandidateModel } from '../../../_services/model/Candidates/CandidateModel';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { EmployeeTransitionGroup, CandidateEmployeeMigration, _EmployeeTransitionGroup, _CandidateEmployeeMigration, MigrationResult } from '../../../_services/model/Migrations/Transition';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { PayPeriodList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { UsersComponent } from 'src/app/shared/modals/users/users.component';
import { ResignationListDetailsComponent } from 'src/app/shared/modals/resignation-list-details/resignation-list-details.component';
import { ResignationApproveRejectModalComponent } from 'src/app/shared/modals/resignation-approve-reject-modal/resignation-approve-reject-modal.component';
import { TransitionService } from '../../../_services/service/transition.service';
import { UpdateInvestmentSubmissionSlotComponent } from 'src/app/shared/modals/update-investment-submission-slot/update-investment-submission-slot.component';
import { UpdateFbpSubmissionSlotComponent } from 'src/app/shared/modals/update-fbp-submission-slot-component/update-fbp-submission-slot-component';
import { SharedDataService } from 'src/app/_services/service/share.service';
import { TaxcalculatorComponent } from '../../investment/taxcalculator/taxcalculator.component';
import { ViewEmployeeInSalaryCreditReportComponent } from 'src/app/shared/modals/view-employee-in-salary-credit-report/view-employee-in-salary-credit-report.component';
import { ClientComponent } from '../../settings/client/client.component';
import { TeamComponent } from '../../settings/team/team.component';
import { CostcodeComponent } from '../../settings/costcode/costcode.component';
import { Approvals, ApproverType, CandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';
import { ApprovalFor } from 'src/app/_services/model/OnBoarding/QC';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { OnboardingExtendedDetailsComponent } from '../../onboarding/shared/modals/onboarding-extended-details/onboarding-extended-details.component';
import { UpdateManagerMappingModalComponent } from 'src/app/shared/modals/update-manager-mapping-modal/update-manager-mapping-modal.component';
import { NapsOnboardingComponent } from '../../onboarding/shared/modals/naps-onboarding/naps-onboarding.component';
import { ClientContract } from 'src/app/_services/model/Client/ClientContract';
import { ClientContractList, ClientList } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import * as XLSX from 'xlsx';

import { ApproveRejectEmployeeRegularizationModalComponent } from 'src/app/shared/modals/attendance/approve-reject-employee-regularization-modal/approve-reject-employee-regularization-modal.component';
import { LowerCasePipe } from '@angular/common';
import { WorkflowService } from '@services/service/workflow.service';

import { Subscription, Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ShiftWeekoffMappingByManagerComponent } from 'src/app/shared/modals/attendance/shift-weekoff-mapping-by-manager/shift-weekoff-mapping-by-manager.component';
import { EmployeeEntitlement, Entitlement, EntitlementDefinition } from '@services/model/Attendance/AttendanceEntitlment';
import { ChangeDetectorRef } from '@angular/core';
import { ResignationHistoryComponent } from '../../ESS/ess/employee-resignation/resignation-history/resignation-history.component';

export interface DefaultSearchInputs {
  ClientId: number;
  ClientContractId: number;
  ClientName: string;
  ClientContractName: string;
  IsNapBased: boolean,
  Client?: any,
  ClientContract?: ClientContract,
  IsReOnboard: boolean;
}

export interface CardConfiguration {
  RequiredCardSize: any;
  LstCardItems: CardItems[];
}
export interface CardItems {
  CardTitle?: any;
  DefaultValue?: any;
  OutputText?: any;
  IconName?: any;
  CardBodyBackgroundColor?: any;
  CardTitleColor?: any;
  CardBodyTextColor?: any;
}

type AOA = any[][];

@Component({
  selector: 'app-user-end-ui',
  templateUrl: './user-end-ui.component.html',
  styleUrls: ['./user-end-ui.component.scss']
})
export class UserEndUiComponent implements OnInit, OnDestroy {

  private unsubscribe$: Subject<void> = new Subject<void>();

  // only for CC email address book input ccmailtags
  @ViewChild('tagInput') tagInputRef: ElementRef;
  @Input() objStorageJson: any;

  //@Input() employeedetails: EmployeeDetails;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;
  unsavedDocumentLst = [];
  isBtnDisabledRequired: boolean = false;
  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  //Security 
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any;
  PersonName: any;
  RoleCode: any;
  genericMasterType: number;
  //General
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  code: string;
  spinner: boolean;
  loadingSpinner: boolean = false;

  //Grouping
  draggableGroupingPlugin: any;
  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  RevisionForm: FormGroup;
  employeedetails: any;
  noOfAttachmentsList: any;
  //angular grid properties
  dataset: any;
  columnDefinition: Column[];
  gridOptions: GridOption;
  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  noOfAttachments: any;

  //Basic
  previewFormatter: Formatter;
  approveFormatter: Formatter;
  rejectFormatter: Formatter;
  hyperlinkFormatter: Formatter;
  modalOption: NgbModalOptions = {};
  lstBlockItems: [];
  PAN: string;
  UAN: string;
  BANK: string;
  NOMINEE: string;
  AADHAAR: string;

  showApprovemode: boolean = true;
  selectedDocument: any;
  documentFileName: any = null;
  documentFileName1: any;
  database: PageLayout[] = [

    {

      Description: "config1",
      Code: "employee",

      CompanyId: 1,
      ClientId: 2,

      SearchConfiguration: {
        SearchElementList: [
          {
            DisplayName: "Enter Country",
            FieldName: "CountryId",
            InputControlType: InputControlType.AutoFillTextBox,
            Value: null,
            MultipleValues: [],
            RelationalOperatorsRequired: false,
            RelationalOperatorValue: "=",
            DataSource: {
              Type: DataSourceType.View,
              Name: "Country"
            },
            IsIncludedInDefaultSearch: true,
            DropDownList: null,
            ParentFields: null,
          },
          {
            DisplayName: "Enter State",
            FieldName: "StateId",
            InputControlType: InputControlType.AutoFillTextBox,
            MultipleValues: null,
            RelationalOperatorsRequired: false,
            RelationalOperatorValue: null,
            Value: null,
            DataSource: {
              Type: DataSourceType.View,
              Name: 'State'
            },
            IsIncludedInDefaultSearch: true,
            DropDownList: [],
            ParentFields: ["CountryId"]
          }
          // {
          //   DisplayName : "Enter city",
          //   FieldName : "CityId",
          //   InputControlType : InputControlType.AutoFillTextBox,
          //   MultipleValues : null,
          //   RelationalOperatorsRequired : false,
          //   RelationalOperatorValue : null,
          //   Value : null, 
          //   DataSource : {
          //     Type : DataSourceType.View,
          //     Name : 'State'
          //   },
          //   IsIncludedInDefaultSearch : true,
          //   PlaceHolder : 'Enter State',
          //   DropDownList : [],
          //   ParentFields : ["StateId"]
          // }
        ],
        SearchPanelType: SearchPanelType.Panel
      },

      GridConfiguration: {
        ColumnDefinitionList: [
          //{ Id: 'id', DisplayName: 'ID', FieldName: 'id', IsSortable: true, IsFilterable : true , IsSummarizable : true, AggregatorType : "average",   Params : { GroupFormatterPrefix : "<strong>Avg: </strong>"} },
          { Id: 'Code', DisplayName: 'Code', FieldName: 'Code', IsSortable: true, IsFilterable: true, IsSummarizable: true, SummaryRequiredInGrouping: true, AggregatorType: "sum", Params: { GroupFormatterPrefix: "<strong>Total: </strong>", GroupFormatterSuffix: " USD" }, GroupAggregatorColumnAndType: [{ Column: "Code", Type: "sum" }, { Column: "id", Type: "average" }] },
          { Id: 'Name', DisplayName: 'Name', FieldName: 'Name', IsSortable: true, IsFilterable: false, SummaryRequiredInGrouping: true, GroupAggregatorColumnAndType: [{ Column: "Code", Type: "sum" }, { Column: "id", Type: "average" }], Clickable: true, RouteLink: 'app/fakeLink' },
          { Id: 'Status', DisplayName: 'Status', FieldName: 'StatusCode', IsSortable: true, IsFilterable: true },
        ],

        DataSource: {
          Type: DataSourceType.View,
          Name: 'City'
        },

        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,

        IsSummaryRequired: true,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,

      },

      PageProperties: {
        PageTitle: "City List",
        BannerText: "City",
      }



    },
  ];

  // COMMON PROPERTIES
  selectedItems: any[];
  BehaviourObject_Data: any;
  // PAYROLL INPUTS LISTING SCREEN - GENERATE PIS BUTTON ACTION PROPERTY
  LstGeneratePIS: any[];

  //PAYROLL VERIFICATION REQUEST
  LstSubmitForVerifcation: any[] // SUBMIT FOR VERFICATION - ARRAY LIST
  payrollModel: PayrollModel = new PayrollModel();
  pageTitle: any;
  ContentValue: string = "Other";
  searchObject: searchObject
  searchPanel: boolean = false;
  processedEMP = [];
  //INVOICE LISTING SCREEN
  invoiceSliderVisible: boolean = false;
  _InvoiceSliderJson: any;
  LstinvoiceDocs = [];
  //INITIATE PAYOUT
  payOutModel: PayOutModel = new PayOutModel();
  disbaleButtonAfterClicked: boolean = false;

  isResignation: boolean = true;
  isTermination: boolean = true;
  // PREVIEW AND CHECK PAYMENTSTATUS 
  LstEmployeeForPayout: any;
  isPaymentStatus_spinner: boolean = true;
  visible_PamentStatusSlider: boolean = false;
  payoutdetailStatus = [];

  markFnf_ResignationDate: any;
  markFnf_LastWorkingDate: any;
  markfnf_Reason: any;
  markfnf_AttachmentInfo: any = { documentId: 0, documentName: '' }
  BusinessType: any;
  attendanceTypeList: any[] = [];
  Mailbodyvalue: any;
  // SME 
  clientSME: any;
  clientcontractSME: any;
  clientIdSME: number;
  clientcontractIdSME: number;
  cardConfiguration: CardConfiguration;
  isCardBarViewRequired: boolean = false;
  isDuplicateEntry: boolean = false;
  bodyValue: any;
  isLoading: boolean = true;
  spinnerText: string = "Uploading";
  FileName: any;
  selectedmigrationRecords: any[];
  ReleaseAlType: any;
  iframeContent: any;
  UserName: any;
  userAccessControl: any;
  CompanyId: any;
  ImplementationCompanyId: any;
  TeamListForReleaseAL: any;
  EffectivePayPeriodListForReleaseAL: PayPeriodList[] = []
  clientLogoLink: any;
  clientminiLogoLink: any;
  MinDate: any;
  MaxDate: any;
  EndDateMinDate: any;

  accessControl_Migration: UserInterfaceControlLst = new UserInterfaceControlLst;
  LstCandidateEmployeeMigration: CandidateEmployeeMigration[] = [];
  TransitionGroup: EmployeeTransitionGroup = new EmployeeTransitionGroup();
  isSuccessMigration: boolean = false;
  ALRemarks: any;

  InitialPayPeriodId: number = 0;
  InitialDOJ: Date = null;
  DoesSupportiveDocsRequired: boolean = false;
  hasFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];
  isUploadingSpinner: boolean = false;
  uploadingSpinnerText: string = "...";
  supportingDocumentName: string = "";
  approvalsObject: any;

  IsESICApplicable: boolean = false;

  defaultSearchInputs: DefaultSearchInputs = {
    ClientContractId: 0,
    ClientId: -1,
    ClientName: "",
    ClientContractName: "",
    IsNapBased: false,
    Client: null,
    ClientContract: null,
    IsReOnboard: true
  };
  LstClientContract: ClientContractList[] = [];
  LstClient: ClientList[] = [];
  hasFailedInput: boolean = false;
  failedAlertMessage: string = "";

  //Shift, Weekoff Bulk Upload
  file: File;
  @ViewChild("fileInput") bulkFile: ElementRef;
  shiftWeekOffBulkImportData: any[] = [];
  bulkUploadHasError: boolean = false;
  modalSpinner: boolean = false;
  uploadedErrorMessage: string = "";

  failedUnConfirmedEmployees = [];
  failedBlacklistedEmployees = [];
  blacklistedEmployeeRemarks: string = '';

  // Onboarding Offer Request
  showOfferRequestsSlider: boolean = false;
  candidateDetails: CandidateDetails = new CandidateDetails();
  isrendering_spinner: boolean = false;
  OfferData: any;

  // Leave balance history and update entitlement

  showLeaevBalanceHistory: boolean = false;
  leaveBalanceHistoryData: any = {
    ProcessLog: [],
    UtilizationLog: []
  };
  showEditLeaevBalanceSlider: boolean = false;
  newAvailableBalance: number = 0;
  newEligibleBalance: number = 0;
  leaveTypeStatus: boolean = true;
  leaveBalanceRemarks: string = "";

  private updateBalanceSubscription: Subscription;
  private viewLeaveBalanceSubscription: Subscription;
  showNewEntitlementSlider: boolean = false;
  statusLabels = {
    100: 'Applied',
    200: 'Cancelled',
    300: 'Rejected',
    400: 'Approved',
    500: 'Availed',
    600: 'CancelApplied',
  };

  entltEmpCode: string = "";
  employeeApplicableEntitlement: Entitlement[] = [];
  entitlmentDefinition: EntitlementDefinition = null; // new EntitlementDefinition();
  formData: {
    empCode: string, empName: string, empGender: string, empMaritalStatus: string, empId: number, entltEmpCode: string, entitId: number, units: number, NextCreditDate: any, NextLapseDate: any, Remarks: string, MaxBalance: number,
    DOJ: any, EmploymentType: any, IsEsicApplicable: any
  } = {
      empCode: '',
      empName: '',
      empGender: '',
      empMaritalStatus: '',
      empId: 0,
      entltEmpCode: '',
      entitId: null,
      units: 0,
      NextCreditDate: null,
      NextLapseDate: null,
      Remarks: '',
      MaxBalance: 0,
      DOJ: null,
      EmploymentType: null,
      IsEsicApplicable: null
    };

  showCreditRequiredForAssignLeave: boolean = true;
  showLapseRequiredForAssignLeave: boolean = true;
  editCreditRequiredForAssignLeave: boolean = false;
  editLapseRequiredForAssignLeave: boolean = false;
  showDownloadExcelBtn: boolean = false;
  showDownloadPdfBtn: boolean = false;
  showUploadSpin = false;
  revokeFnfCoprHRresponseList = [];

  BlackListReasons = [];
  showBlacklistedHistory: boolean = false;
  BlacklistingHistory = [];
  showTable = true;

  NotRequiredClientIdsForAddEmployeeBtn = environment.environment.NotRequiredClientIdsForAddEmployeeBtn;
  RequiredRoleCodesToShowAddEmployeeBtn = environment.environment.RequiredRoleCodesToShowAddEmployeeBtn;
  $clientId: any;

  employeeProfile: any = null;
  employeeProfileCandidateDocuments = [];

  bloodGroup = {
    1: 'O Positive',
    2: 'O Negative',
    3: 'A Negative',
    4: 'A Positive',
    5: 'B Negative',
    6: 'B Positive',
    7: 'AB Negative',
    8: 'AB Positive'

  };

  maritalStatus = {
    1: 'Single',
    2: 'Married',
    3: 'Separated',
    4: 'Divorced',
    5: 'Widow',
    6: 'Widower'
  }

  contentmodalurl: any = null;
  contentmodalDocumentId: any = 0;
  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  documentURL: any;
  IsNewEmployeeRequest: boolean = false;
  EditableAnnualPayComponent = environment.environment.EditableAnnualPayComponent;

  constructor(
    private elementRef: ElementRef,
    private headerService: HeaderService,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router,
    private modalService: NgbModal,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private payrollService: PayrollService,
    public sessionService: SessionStorage,
    public downloadService: DownloadService,
    private utilsHelper: enumHelper,
    private employeeService: EmployeeService,
    private scaleService: ScaleService,
    private fileuploadService: FileUploadService,
    private commonService: CommonService,
    private message: NzMessageService,
    private notification: NzNotificationService,
    private drawerService: NzDrawerService,
    private attendanceService: AttendanceService,
    private utilityService: UtilityService,
    private commonapimethod: CommonApiMethodService,
    private formBuilder: FormBuilder,
    public clientcontractService: ClientContractService,
    private excelService: ExcelService,
    public searchService: SearchService,
    private onboardingApi: OnboardingService,
    private sanitizer: DomSanitizer,
    public transitionService: TransitionService,
    private clientservice: ClientService,
    private productService: ProductService,
    private paygroupService: PaygroupService,
    private sharedDataService: SharedDataService,
    private onboardingService: OnboardingService,
    private workflowApi: WorkflowService,
    private cd: ChangeDetectorRef,
    private http: HttpService
  ) {
    this.createForm();
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
  }
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '10rem',
    minHeight: '10rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  }
  openSearch() {
    this.searchPanel = false;
  }
  /* #region  REACTIVE FORM INITIALIZATION AND VALIATION */

  get g() { return this.RevisionForm.controls; } // reactive forms validation
  createForm() {

    this.RevisionForm = this.formBuilder.group({
      // employeeCode: ['', Validators.required],
      // employeeName: ['', Validators.required],
      location: [null, Validators.required],
      designation: ['', Validators.required],
      emailList: [''],
      industryType: [null, Validators.required],
      skillCategory: [null, Validators.required],
      zone: [null, Validators.required],
      salaryType: [null, Validators.required],
      forMonthlyValue: [false],
      monthlyAmount: ['', Validators.required],
      annualSalary: ['', Validators.required],
      insuranceplan: [null, Validators.required],
      onCostInsuranceAmount: [0, Validators.required],
      fixedDeductionAmount: [0, Validators.required],
      // Gmc: ['', Validators.required],
      // Gpa: ['', Validators.required],
      effectiveDate: ['', Validators.required],
      effectivePeriod: [null, Validators.required],
      revisionTemplate: [null, Validators.required],
      sendmailimmediately: [false],
      hiketype: [null],
      hiketypeinput: [''],
      payGroup: [null, Validators.required],
      contractEndDate: [{ value: null, disabled: true }, Validators.required],
      specifyExactDate: [false],
      extensionPeriod: [null],
      LetterRemarks: [''],
      subject: [''],
      bodyValue: [''],
      Id: [UUID.UUID()],
      ApprovalFor: [null, Validators.required],
      ApprovalType: [null, Validators.required],
      DocumentName: ['', Validators.required],
      ObjectStorageId: ['', Validators.required],
      IsApproved: [true],
      Status: [0],
      Remarks: [''],
      IsDocumentDelete: [false], // extra prop
      ApprovalForName: [''],
      ApprovalTypeName: [''],
      DocumentId: [null],
      BlockEdRemarks: [''],
      BlockedReasonId: ['']
    });

  }

  ngOnInit() {
    //debugger;
    //this.objStorageJson = JSON.parse(this.objStorageJson);
    this.noOfAttachments = JSON.parse(JSON.stringify(environment.environment.NoOfAttachmentsSendMail));
    this.selectedItems = [];
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.CompanyId = this.sessionDetails.Company.Id;
    this.ImplementationCompanyId = this.sessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.userAccessControl = this.sessionDetails.UIRoles[0].UserInterfaceControls;
    this.accessControl_Migration = this.userAccessControl.filter(a => a.ControlName == "btnMigrate");
    this.PersonName = this.sessionDetails.UserSession.PersonName;
    this.UserName = this.sessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.clientLogoLink = 'logo.png';
    if (this.sessionDetails.CompanyLogoLink != "" && this.sessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this.sessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;
    } else if (this.sessionDetails.ClientList != null && this.sessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this.sessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));

      this.$clientId = this.BusinessType != 3 ? Number(this.sessionService.getSessionStorage("default_SME_ClientId")) : 0;

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

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.code = params.get('code')
      this.getPageLayout();
    })
    console.log(this.code);

    if (this.code == 'leaveBalanceHistory') {
      this.editCreditRequiredForAssignLeave = environment.environment.EditNextCreditOnNewAssignLeave ? environment.environment.EditNextCreditOnNewAssignLeave : false;
      this.showCreditRequiredForAssignLeave = environment.environment.ShowNextCreditOnNewAssignLeave ? environment.environment.ShowNextCreditOnNewAssignLeave : false;


      this.editLapseRequiredForAssignLeave = environment.environment.EditLapseCreditOnNewAssignLeave ? environment.environment.EditLapseCreditOnNewAssignLeave : false;
      this.showLapseRequiredForAssignLeave = environment.environment.ShowLapseCreditOnNewAssignLeave ? environment.environment.ShowLapseCreditOnNewAssignLeave : false;

    }
    this.attendanceTypeList = this.utilsHelper.transform(AttendanceType) as any;


    // this.pageLayoutService.postPageLayout(this.database[0]).subscribe(data =>
    //   {
    //     console.log(data);
    //   }, error =>
    //   {
    //     console.log(error);
    //   });

    // this.dataset = this.mockData(999);
    // this.pageLayout = this.database[0];      // replace this with an API call to load the gridCongif using entity key
    // this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
    // this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
    // this.setGridConfiguration();

    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-download m-r-xs" title="Download PIS" style="cursor:pointer"></i> ` : '<i class="mdi mdi-download" style="cursor:pointer"></i>';

    this.approveFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
  class="mdi mdi-checkbox-multiple-marked-outline m-r-xs"></i> Approve </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';

    this.rejectFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
class="mdi mdi-close-box-outline m-r-xs"></i> Reject </button>` : '<i class="mdi mdi-close-box-outline" style="cursor:pointer"></i>';

    this.hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>

      value != null && value != -1 ? '<a href="javascript:;">' + value + '</a> <i class="fa fa-external-link" aria-hidden="true"></i>' : '---';
    this.payoutdetailStatus = this.utilsHelper.transform(PayOutDetailsStatus) as any;


  }

  getPageLayout() {

    console.log('searchobj', this.searchObject);
    this.columnDefinition = null;
    this.pageLayout = null;
    this.spinner = true;
    this.titleService.setTitle('Loading');
    this.headerService.setTitle('');
    this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
      console.log(data);
      this.spinner = false;
      if (data.Status === true && data.dynamicObject != null) {

        this.pageLayout = data.dynamicObject;
        this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
        this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
        // show common download button
        this.showDownloadExcelBtn = this.pageLayout.PageProperties.IsDownloadExcelRequired ? this.pageLayout.PageProperties.IsDownloadExcelRequired : false;
        this.showDownloadPdfBtn = this.pageLayout.PageProperties.IsDownloadPdfRequired ? this.pageLayout.PageProperties.IsDownloadPdfRequired : false;
        // table config
        this.setGridConfiguration();
        this.dataset = [];

        if (this.pageLayout.SearchConfiguration.FillSearchElementsFromLocal) {
          this.pageLayoutService.fillSearchElementFromLocalStorage(this.pageLayout.SearchConfiguration.SearchElementList);
        }

        if (this.BusinessType !== 3) {
          this.pageLayoutService.fillSearchElementsForSME(this.pageLayout.SearchConfiguration.SearchElementList);
        }

        this.pageLayoutService.fillSearchElementsForSecurityKeys(this.pageLayout.SearchConfiguration.SearchElementList);

        console.log("Search Configuration ::", this.pageLayout.SearchConfiguration);

        // AUTO FILL 
        // this.code == 'SaleOrders' && this.re_Binding_searchPanel();
        // this.code == 'payoutrequest' &&  this.re_Binding_searchPanel();

        this.pageTitle = this.pageLayout.PageProperties.BannerText

        this.route.data.subscribe(data => {
          console.log('row', data);


          if (data.DataInterface.SearchElementValuesList !== null && data.DataInterface.SearchElementValuesList.length > 0) {
            this.BehaviourObject_Data = data.DataInterface.RowData;
            data.DataInterface.SearchElementValuesList.forEach(searchElementValues => {
              this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
                if (searchElementValues.OutputFieldName === searchElement.FieldName) {
                  searchElement.Value = searchElementValues.Value;
                  searchElement.ReadOnly = searchElementValues.ReadOnly;
                }
              })
            })
            this.rowDataService.dataInterface = {
              SearchElementValuesList: [],
              RowData: null
            }
            this.getDataset();
          }

          // else if (this.pageLayout.GridConfiguration.IsDynamicColumns) {
          //   this.getDataset();
          // }
          else if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
        }, error => {
          console.log(error)
        })

      }
      else {
        this.titleService.setTitle('HR Suite');
      }

    }, error => {
      console.log(error);
      this.spinner = false;
      this.titleService.setTitle('HR Suite');
    }
    );
  }

  setGridConfiguration() {
    //this.setColumns();
    //this.setGridOptions();
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns && this.pageLayout.GridConfiguration.ColumnDefinitionList != null) {
      this.columnDefinition = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.gridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    // to enable filter
    this.gridOptions.enableFiltering = true;
    if (this.code == 'migrationlist') {
      this.gridOptions.enableCheckboxSelector = true;
      this.gridOptions.enableColumnPicker = true;
      this.gridOptions.enableRowSelection = true;
      this.gridOptions.enableFiltering = true;
      this.gridOptions.rowSelectionOptions = {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      };
    }
    if (this.code == 'exitRequest') {
      this.gridOptions.enableCheckboxSelector = true;
      this.gridOptions.enableColumnPicker = true;
      this.gridOptions.enableRowSelection = true;
      this.gridOptions.rowSelectionOptions = {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      };
    }

    // ONLY FOR CONFIRM PAYOUT LISTING SCREEN (CFO)
    if (this.code == 'payoutApprove') {
      let pre_selectedIds = [];
      let payoutStatus = this.utilsHelper.transform(PayOutStatus) as any;
      payoutStatus.forEach(function (item) { if (item.id == 7501 || item.id == 7500) { pre_selectedIds.push(item.name) } })
      //&& this.columnDefinition.find(i=>i.field == "PayStatus").filter.collection.filter(x=>x.PayStatus == 'ReleaseBatchPrepared').length > 0
      this.gridOptions.presets = { filters: [{ columnId: 'PayStatus', searchTerms: pre_selectedIds, operator: 'IN' }] }
    }
    if (this.code == 'rollOverList') {
      this.gridOptions.enableDraggableGrouping = true;
      this.gridOptions.showPreHeaderPanel = false;
    }
    this.gridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      onGroupChanged: (e, args) => this.onGroupChange(),
      onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }

  //#region Old Code shifted to PageLayout Service
  // setColumns() {
  //   this.columnDefinition = [];
  //   for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {

  //     this.columnName = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].DisplayName;


  //     this.tempColumn = {
  //       id: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id,
  //       name: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].DisplayName,
  //       field: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName,
  //       sortable: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSortable,
  //       cssClass: "pointer",
  //       filterable: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsFilterable,
  //       excludeFromHeaderMenu: !this.pageLayout.GridConfiguration.ColumnDefinitionList[i].ShowInHeader,
  //       // params: {
  //       //    groupFormatterPrefix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '', 
  //       //    groupFormatterSuffix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '' ,
  //       // },  
  //       grouping: {
  //         getter: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName,
  //         formatter: (g) => `${Object.keys(g.rows[0]).filter((key) => { return g.rows[0][key] === g.value })[0]}: ${g.value} <span style="color:green">(${g.count} items)</span>`,
  //         aggregators: [],
  //         aggregateCollapsed: false,
  //         collapsed: false
  //       }

  //     }

  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'edit') {
  //       this.tempColumn.formatter = Formatters.editIcon;
  //       this.tempColumn.excludeFromExport = true;
  //     }
  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'delete') {
  //       this.tempColumn.formatter = Formatters.deleteIcon;
  //       this.tempColumn.excludeFromExport = true;
  //     }
  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'preview') {
  //       this.tempColumn.formatter = this.previewFormatter,
  //         this.tempColumn.excludeFromExport = true;
  //     }
  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'approve') {
  //       this.tempColumn.formatter = this.approveFormatter,
  //         this.tempColumn.excludeFromExport = true;
  //     }
  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'reject') {
  //       this.tempColumn.formatter = this.rejectFormatter,
  //         this.tempColumn.excludeFromExport = true;
  //     }
  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null) {
  //         this.tempColumn.formatter = this.hyperlinkFormatter;
  //     }



  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
  //       switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
  //         case 'sum': {
  //           this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.sumTotals;
  //           break;
  //         }

  //         case 'min': {
  //           this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.minTotals;
  //           break;
  //         }

  //         case 'max': {
  //           this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.maxTotals;
  //           break;
  //         }

  //         case 'average': {
  //           this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.avgTotals;
  //           break;
  //         }
  //       }
  //       this.tempColumn.params = {
  //         groupFormatterPrefix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '',
  //         groupFormatterSuffix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '',
  //       }
  //     }

  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SummaryRequiredInGrouping) {

  //       for (var j = 0; j < this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType.length; ++j) {
  //         switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Type) {
  //           case 'sum': {
  //             //var temp = new Aggregators.Sum(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
  //             this.tempColumn.grouping.aggregators.push(new Aggregators.Sum(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
  //             break;
  //           }

  //           case 'min': {
  //             //var temp = new Aggregators.Min(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
  //             this.tempColumn.grouping.aggregators.push(new Aggregators.Avg(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
  //             break;
  //           }

  //           case 'max': {
  //             //var temp = new Aggregators.Max(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
  //             this.tempColumn.grouping.aggregators.push(new Aggregators.Max(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
  //             break;
  //           }

  //           case 'average': {
  //             //var temp = new Aggregators.Avg(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
  //             this.tempColumn.grouping.aggregators.push(new Aggregators.Avg(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
  //             break;
  //           }

  //         }
  //       }
  //     }

  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Width) {
  //       this.tempColumn.width = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Width;
  //       this.tempColumn.maxWidth = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Width
  //     }

  //     this.columnDefinition.push(this.tempColumn);
  //   }

  // }



  // setGridOptions() {
  //   this.gridOptions = {

  //     //General
  //     enableGridMenu: true,
  //     enableColumnPicker: false,
  //     enableAutoResize: true,
  //     enableSorting: true,
  //     datasetIdPropertyName: "Id",
  //     enableColumnReorder: this.pageLayout.GridConfiguration.EnableColumnReArrangement,
  //     enableFiltering: true,
  //     showHeaderRow: true,
  //     enablePagination: false,
  //     enableAddRow: false,
  //     leaveSpaceForNewRows: true,
  //     autoEdit: false,
  //     alwaysShowVerticalScroll: false,
  //     enableCellNavigation: true,


  //     //For Footer Summary
  //     createFooterRow: true,
  //     showFooterRow: this.pageLayout.GridConfiguration.IsSummaryRequired,
  //     footerRowHeight: 30,

  //     //For Grouping
  //     createPreHeaderPanel: true,
  //     showPreHeaderPanel: false,
  //     preHeaderPanelHeight: 40,
  //     draggableGrouping: {
  //       dropPlaceHolderText: 'Drop a column header here to group by the column',
  //       // groupIconCssClass: 'fa fa-outdent',
  //       deleteIconCssClass: 'fa fa-times',
  //       onGroupChanged: (e, args) => this.onGroupChange(),
  //       onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,

  //     },

  //     //For Pinning Rows and columns
  //     frozenRow: this.pageLayout.GridConfiguration.PinnedRowCount,
  //     frozenColumn: this.pageLayout.GridConfiguration.PinnedColumnCount,
  //     frozenBottom: this.pageLayout.GridConfiguration.PinRowFromBottom,

  //   };

  //   if (this.pageLayout.GridConfiguration.IsPaginationRequired === true) {
  //     this.gridOptions.enablePagination = true;
  //     this.gridOptions.pagination = this.pagination;
  //     this.gridOptions.showFooterRow = false;
  //     this.gridOptions.frozenRow = -1;
  //     this.gridOptions.frozenColumn = -1;
  //     this.gridOptions.frozenBottom = false;
  //   }

  //   if (this.pageLayout.GridConfiguration.PinnedRowCount >= 0) {
  //     this.gridOptions.showFooterRow = false;
  //   }

  //   // if(this.pageLayout.GridConfiguration.DisplayFilterByDefault === false){
  //   //   this.gridOptions.showHeaderRow = false;
  //   // }

  //   if (this.pageLayout.GridConfiguration.IsGroupingEnabled) {
  //     this.gridOptions.enableDraggableGrouping = true;
  //     this.gridOptions.showPreHeaderPanel = true;
  //     this.gridOptions.frozenRow = -1;
  //     this.gridOptions.frozenColumn = -1;
  //     this.gridOptions.frozenBottom = false;
  //   }

  //   if (this.pageLayout.GridConfiguration.RowSelectionCheckBoxRequired) {
  //     this.gridOptions.enableCheckboxSelector = true;
  //     this.gridOptions.enableRowSelection = true;

  //     if (this.pageLayout.GridConfiguration.RowSelectionType === RowSelectionType.Multiple) {
  //       this.gridOptions.rowSelectionOptions = {
  //         selectActiveRow: false
  //       }
  //     }
  //   }


  // }
  //#endregion

  getDataset() {

    console.log(this.pageLayout);
    this.selectedItems = [];
    if (this.code == 'rollOver') {
      this.pageLayout.SearchConfiguration.SearchElementList != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 &&
        (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage('default_SME_ContractId'));
    }
    if (this.code == 'payoutApproval') {
      this.pageLayout.SearchConfiguration.SearchElementList != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 &&
        (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == '@CLIENTID').Value = this.sessionService.getSessionStorage('default_SME_ClientId'));
    }
    if (this.BusinessType != 3 && this.code == 'employeeLeaveBalance') {
      this.pageLayout.SearchConfiguration.SearchElementList != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 &&
        (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == '@CLIENTID').Value = this.sessionService.getSessionStorage('default_SME_ClientId'));
    }

    if (this.code == 'teamAttendanceList' || this.code === 'attendanceDetailedRegularizationRequestsForManager') {
      this.pageLayout.SearchConfiguration.SearchElementList != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 &&
        (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@managerId').Value = this.UserId);
    }
    if (this.code == 'employeeLeaveBalance') {
      this.pageLayout.SearchConfiguration.SearchElementList != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 &&
        (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@userId').Value = this.UserId);
    }
    if (this.code == 'leaveRequestList') {
      this.pageLayout.SearchConfiguration.SearchElementList != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 &&
        (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@managerId').Value = this.UserId);
    }
    if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@roleCode') != undefined) {
      this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@roleCode').Value = this.RoleCode
    }
    if (this.BusinessType != 3) {

      if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == "@CLIENTCONTRACTID") != undefined) {
        this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase().toString() == '@CLIENTCONTRACTID').Value = this.sessionService.getSessionStorage('default_SME_ContractId')
      }
    }

    console.log('SCS :', this.pageLayout.SearchConfiguration.SearchElementList);

    this.dataset = [];
    this.spinner = true;
    this.isBtnDisabledRequired = true;
    if (this.code == 'attendanceBreakupDetails') {
      this.isBtnDisabledRequired = false;
      this.spinner = false;
      if (this.pageLayout.SearchConfiguration.SearchElementList && this.pageLayout.SearchConfiguration.SearchElementList.length) {
        this.loadingScreenService.startLoading();
        const selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@clientId').Value;
        this.attendanceService.CreateEmployeeAttendanceBreakUpDetails(selectedClientId).subscribe(result => {
          console.log('***:: Create Employee Attendance BreakUp Details API ::****', result);
          this.loadingScreenService.stopLoading();
          if (result && result.Status) {
            this.alertService.showSuccess(result.Message);
            return;
          } else {
            this.alertService.showWarning(result.Message);
            return;
          }
        }, error => {
          this.loadingScreenService.stopLoading();
          console.log(error);
          return this.alertService.showWarning(error);
        });
      }
    } else if (this.code == 'attendanceBreakupDetailsForNextPeriod') {
      this.isBtnDisabledRequired = false;
      this.spinner = false;
      if (this.pageLayout.SearchConfiguration.SearchElementList && this.pageLayout.SearchConfiguration.SearchElementList.length) {
        this.loadingScreenService.startLoading();
        const selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@clientId').Value;
        this.attendanceService.CreateEmployeeAttendanceBreakUpDetailsForNextPeriod(selectedClientId).subscribe(result => {
          console.log('***:: Create Employee Attendance BreakUp Details For NEXT PERIOD API ::****', result);
          this.loadingScreenService.stopLoading();
          if (result && result.Status) {
            this.alertService.showSuccess(result.Message);
            return;
          } else {
            this.alertService.showWarning(result.Message);
            return;
          }
        }, error => {
          this.loadingScreenService.stopLoading();
          console.log(error);
          return this.alertService.showWarning(error);
        });
      }
    } else {
      this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
        this.spinner = false;

        if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
          if (this.code == "GetWeekOffDetails" || this.code == "GetEmployeeWeekOffDetailsForManager") {
            const parsedData = JSON.parse(dataset.dynamicObject);
            const keysToRemove = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            this.dataset = parsedData.map(item => {
              item.WeekOff = this.getWeekOffForEachEmployee(item);
              return keysToRemove.reduce((acc, key) => {
                const { [key]: omitted, ...rest } = acc;
                return rest;
              }, item);
            });
            console.log(parsedData, this.dataset);
          } else {
            this.dataset = JSON.parse(dataset.dynamicObject);
            console.log(dataset);
          }

          //console.log(this.dataset);
          let SOStatus = this.utilsHelper.transform(SaleOrderStatus) as any;
          let PayoutStatus = this.utilsHelper.transform(PayOutStatus) as any;
          let InvStatus = this.utilsHelper.transform(InvoiceStatus) as any;
          try {

            if (this.code == 'employeelist') {
              this.fetchBlacklistReasons();
            }

            this.dataset.forEach(element => {
              // this.code != 'employeeLeaveBalance'  && this.code != 'FBPSubmissionList' && this.code != "fbpSlot" && this.code != "InvesmentSlot" 
              //   && this.code != "resignationList" && this.code != 'migrationlist' 
              //   && this.code != 'leaveRequestHistory' && this.code != 'employeeRequestHistory' && this.code != "SaleOrders" && (this.code != "Invoices") && (element["Status"] = element.Status == 0 ? "In-Active" : "Active");
              if (this.code == "client") { element.Status = element.Status == 1 ? 'Active' : 'InActive' }

              if (this.code == "SaleOrders") { element.Status = SOStatus.find(a => a.id === element.StatusCode).name }
              if (this.code === "payoutrequest" || this.code === "payoutApprovals"
                || this.code == 'payoutApproval' || this.code == 'payoutApprove') {

                //element.PayStatus = PayoutStatus.find(a => a.id === element.StatusCode).name
                element.StatusCode = 7500;
                var isStatusAppear = PayoutStatus.find(a => a.id === element.StatusCode)
                element.PayStatus = isStatusAppear != undefined ? isStatusAppear.name : ''
              }
              if (this.code == "Invoices" || this.code == 'invoices') { element.InvoiceStatus = InvStatus.find(a => a.id === element.StatusCode).name }
              var _statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
              (this.code === 'onDutyRequestHistory' || this.code == 'leaveRequestHistory' || this.code == "leaveRequests") ? element['StatusName'] = _statusList.find(z => z.id == element.Status).name : true;
              if (this.code == 'leaveRequestHistory' || this.code === 'onDutyRequestHistory') {
                this.dataset = this.dataset.filter(a => a.PendingAtUserId == this.UserId);
              }

              if (this.code == 'attendanceList') {
                element['Id'] = element.EmployeeId;
              }
            });


            // this.dataset = this.dataset.concat(this.dataset);

            // // this.dataviewObj.onRowCountChanged.subscribe(function (e, args) {
            // //   this.gridObj.updateRowCount();
            // //   alert("hi");
            // //   this.gridObj.render();
            // // });

            // this.dataviewObj.ensureIdUniqueness(function (e, args) {
            //   this.gridObj.invalidateRows(args.rows);
            //   alert("bye");
            //   this.gridObj.render();
            // });


            if (this.code == 'attendanceList') {
              this.cardConfiguration = {
                RequiredCardSize: 3,
                LstCardItems: [{
                  CardTitle: 'No Of Request',
                  OutputText: this.dataset.length,
                  CardBodyTextColor: '#FF945B'
                },
                {
                  CardTitle: 'Approved',
                  OutputText: this.dataset.length > 0 ? this.dataset.filter(a => a.IsApproved == 1).length : 0,
                  CardBodyTextColor: '#63E59F'

                },
                {
                  CardTitle: 'Submitted',
                  OutputText: this.dataset.length > 0 ? this.dataset.filter(a => a.IsSubmitted == 1).length : 0,
                  CardBodyTextColor: '#f44336'

                }
                ]
              };
              this.isCardBarViewRequired = true;
            }

            this.utilityService.ensureIdUniqueness(this.dataset).then((result) => {
              result == true ? this.isDuplicateEntry = true : this.isDuplicateEntry = false;
            }, err => {

            })

          } catch (error) {
            console.error(error);

          }
          console.log('DATASET', this.dataset);

          if (this.pageLayout.GridConfiguration.IsDynamicColumns != undefined && this.pageLayout.GridConfiguration.IsDynamicColumns != null
            && this.pageLayout.GridConfiguration.IsDynamicColumns) {
            console.log("Creating Dynamic Columns");
            let keys = Object.keys(this.dataset[0]);
            keys = keys.filter(x => x !== 'ID' && x !== 'Id' && x !== 'id');
            this.columnDefinition = this.pageLayoutService.setDynamicColumns(keys);
            console.log("Dynamic Columns :: ", this.columnDefinition);
          }
          else {
            this.pageLayoutService.updateFilterCollection(this.columnDefinition, this.pageLayout.GridConfiguration.ColumnDefinitionList, this.dataset)
            // this.updateFilters();
          }

          if (this.pageLayout.GridConfiguration.DefaultLayoutType == DefaultLayoutType.Excel && this.dataset != null && this.dataset.length > 0) {
            this.loadingScreenService.startLoading();
            this.DownloadExternalExcel(this.dataset);
            return;
          }

          setTimeout(() => {
            this.isBtnDisabledRequired = false;
          }, environment.environment.TimeOutForSearchDisable);
        }
        else {
          this.dataset = [];
          this.isBtnDisabledRequired = false;
          console.log('Sorry! Could not Fetch Data|', dataset);
          if (dataset.Status == false) {
            return this.alertService.showWarning(dataset.Message);
          } else if (dataset.Status == true && dataset.dynamicObject && dataset.dynamicObject == '') {
            return this.alertService.showSuccess('No Data found !');
          }
        }
      }, error => {
        this.isBtnDisabledRequired = false;
        this.spinner = false;
        return this.alertService.showWarning(error);
        console.log(error);
      })
    }
  }



  updateFilters() {
    //this.columnDefinition = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList , this.dataset);


    for (let columnDefinition of this.pageLayout.GridConfiguration.ColumnDefinitionList) {
      const requisiteColumnDef = this.columnDefinition.find((column: Column) => column.id === columnDefinition.Id);

      if (requisiteColumnDef && columnDefinition.IsFilterable && this.dataset != null) {
        console.log("updating filters");

        //Getting distint values from dataset
        const distintCollection: [] = this.dataset.filter((notCheckedDataElement, notCheckedIndex, array) =>
          array.findIndex((checkedDataElement) =>
            notCheckedDataElement[columnDefinition.FieldName] === checkedDataElement[columnDefinition.FieldName]) === notCheckedIndex
        );

        requisiteColumnDef.filter = {
          collection: distintCollection,
          customStructure: {
            value: columnDefinition.FieldName,
            label: columnDefinition.FieldName
          },
          model: Filters[columnDefinition.FilterType]
        }

      }

    }

    if (this.code == 'teamAttendanceList') {
      this.columnDefinition.forEach(element => {



        if (element.id == 'IsPayrollSubmitted') {
          element.filter = {
            collection: [{ value: '', label: 'All' }, { value: true, label: 'Submitted' }, { value: false, label: 'Not Submitted' }],
            model: Filters.singleSelect,
          }
          console.log('tes', element);
        }
        if (element.id == 'IsMigrated') {
          element.filter = {
            collection: [{ value: '', label: 'All' }, { value: true, label: 'Submitted' }, { value: false, label: 'Not Submitted' }],
            model: Filters.singleSelect,
          }
        }
      });
    }
  }

  onClickingSearchButton(event: any) {

    this.isBtnDisabledRequired = true;
    // if (this.isBtnDisabledRequired == true) {
    //   event.stopImmediatePropagation();
    //   event.stopPropagation();
    // }

    if (this.code == 'MonthlyATReport') {
      this.searchObject = _searchObject;
      sessionStorage.removeItem("SearchPanel1");
      this.searchObject = undefined;
      console.log('<--- ATReport --->', this.searchObject, event);
      const ClientId = event[0].Value;
      const ClientContractId = event[1].Value;
      const AttendancePeriod = event[2].Value;
      // Navigate to attendanceMonthlyReportView page
      this.router.navigate(['app/attendance/attendanceMonthlyReportView'], {
        queryParams: {
          "Idx": btoa(ClientId), // pass ClientId
          "Cdx": btoa(ClientContractId),
          "Mdx": btoa(AttendancePeriod), // pass periodId

        }
      });
    } else if (this.code == 'attendanceBaseReport') {
      console.log('<--- Base Report --->', event);
      this.rowDataService.dataInterface.RowData = event;
      this.router.navigate(['app/attendance/attendanceBaseReportView']);
    } else if (this.code == 'attendanceSummaryReport') {
      console.log('<--- Summary Report --->', event);
      const ClientId = event[0].Value;
      const ClientContractId = event[1].Value;
      const AttendancePeriod = event[2].Value;
      const branchId = event[3].Value;
      this.router.navigate(['app/attendance/attendanceSummaryDailyReportView'], {
        queryParams: {
          "Idx": btoa(ClientId), // pass ClientId
          "Cdx": btoa(ClientContractId), // pass ClientContractId
          "Bdx": btoa(branchId), // pass BranchId
          "Mdx": btoa(AttendancePeriod), // pass periodId
        }
      });
    } else if (this.code == 'MLReport') {
      this.searchObject = _searchObject;
      sessionStorage.removeItem("SearchPanel1");
      this.searchObject = undefined;
      console.log('<--- MLReport --->', this.searchObject, event);
      const ClientId = event[0].Value;
      const AttendancePeriod = event[1].Value;
      // Navigate to attendanceMonthlyReportView page
      this.router.navigate(['app/leaves/leaveRequestReportView'], {
        queryParams: {
          "Idx": btoa(ClientId), // pass ClientId
          "Mdx": btoa(AttendancePeriod), // pass attendancePeriodId
        }
      });

    } else if (this.code == 'MLReportITC') {
      console.log('<--- MLReport --->', event);
      this.rowDataService.dataInterface.RowData = event;
      this.router.navigate(['app/attendance/MLReportViewITC']);

    } else if (this.pageLayout.GridConfiguration.DataSource.Type === DataSourceType.ExternalAPI) {
      console.log('ExternalAPI', event);
      this.selectedItems = [];
      this.dataset = [];
      this.spinner = true;
      const url = this.constructUrlForExternalAPI(event);
      this.http.get_ExternalAPICall(url).subscribe((response) => {
        console.log('response', response);
        this.spinner = false;
        if (response.Status && response.Result && response.Result !== '') {
          try {
            const parsedResult = JSON.parse(response.Result);
            if (this.code === 'MusterAttendanceReport') {
              parsedResult.forEach((e, idx) => {
                e.Id = idx + 1;
              });
            }
            this.dataset = parsedResult;
            this.utilityService.ensureIdUniqueness(this.dataset).then((result) => {
              result == true ? this.isDuplicateEntry = true : this.isDuplicateEntry = false;
            }, err => { })
            console.log('DATASET', this.dataset);
            if (this.pageLayout.GridConfiguration.IsDynamicColumns && this.pageLayout.GridConfiguration.IsDynamicColumns &&
              this.pageLayout.GridConfiguration.IsDynamicColumns) {
              console.log("Creating Dynamic Columns");
              let keys = Object.keys(this.dataset[0]);
              keys = keys.filter(x => x !== 'ID' && x !== 'Id' && x !== 'id');
              this.columnDefinition = this.pageLayoutService.setDynamicColumns(keys);
              console.log("Dynamic Columns :: ", this.columnDefinition);
            } else {
              this.pageLayoutService.updateFilterCollection(this.columnDefinition, this.pageLayout.GridConfiguration.ColumnDefinitionList, this.dataset);
            }
            setTimeout(() => {
              this.isBtnDisabledRequired = false;
            }, environment.environment.TimeOutForSearchDisable);
          } catch (error) {
            console.error(error);
          }
        } else {
          this.isBtnDisabledRequired = false;
          this.dataset = [];
          console.log('Sorry! Could not Fetch Data|', response);
          if (!response.Status) {
            return this.alertService.showWarning(response.Message);
          } else if (response.Status && response.Result && response.Result == '') {
            return this.alertService.showSuccess('No Data found !');
          }
        }
      }, error => {
        this.isBtnDisabledRequired = false;
        this.spinner = false;
        console.log(error);
        return this.alertService.showWarning(error);
      });
    } else {
      if (this.code == 'taxComputationList' || this.code == 'paysheetList'
        || this.code == 'taxComputationDetailsbyMonthYear' || this.code == 'taxComputationDetailsbyFiscalYear' || this.code == 'pfchallan') {
        this.loadingScreenService.startLoading();
        this.code == 'taxComputationList' ? this.callExternalAPI() :
          this.code == 'taxComputationDetailsbyMonthYear' ? this.callExternalAPI_TaxCompByMonthYear() :
            this.code == 'taxComputationDetailsbyFiscalYear' ? this.callExternalAPI_TaxCompByFiscalYear() :
              this.code == 'pfchallan' ? this.callExternalAPI_pfChallan()
                : this.callExternalAPI_PaySheet()
        return;
      }
      console.log(event);
      this.searchObject = _searchObject;
      sessionStorage.removeItem("SearchPanel1");
      this.searchObject = undefined;
      console.log('sarch', this.searchObject);

      this.pageLayout != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && sessionStorage.setItem("SearchPanel1", JSON.stringify(this.pageLayout.SearchConfiguration.SearchElementList));
      this.code === ("SaleOrders") && this.re_Binding_searchPanel();
      this.code === ("payoutrequest") && this.re_Binding_searchPanel();
      this.getDataset();
    }
  }

  re_Binding_searchPanel() {
    if (sessionStorage.getItem("SearchPanel1") != null) {
      this.searchPanel = true;
      this.pageLayout.SearchConfiguration.SearchElementList = JSON.parse(sessionStorage.getItem("SearchPanel1"));
      console.log('search items :', JSON.parse(sessionStorage.getItem("SearchPanel1")));
      this.getDataset();
      this.searchObject = _searchObject;
      var clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName.toUpperCase() == "@CLIENTID");
      if (clientList.DropDownList.length > 0) {
        this.searchObject.ClientName = clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)).Name;
        clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId");
        this.searchObject.ContractName = clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)) ? clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)).Name : null;
        clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId");
        this.searchObject.PayPeriodName = clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)) ? clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)).Name : null;
        this.code !== ("payoutrequest") && (clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@teamId"));
        this.code !== ("payoutrequest") && (this.searchObject.TeamName = clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)).Name);
        console.log('searchObject', this.searchObject);
      }
    }
  }

  onGroupChange() {
    console.log("changed");
    if (!this.pageLayout.GridConfiguration.IsPaginationRequired && this.gridObj && this.pageLayout.GridConfiguration
      && !this.pageLayout.GridConfiguration.IsDynamicColumns)
      this.updateFooter(this.gridObj);
  }

  showPreHeader() {
    this.gridObj.setPreHeaderPanelVisibility(true);
  }

  clearGrouping() {
    if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups) {

      this.draggableGroupingPlugin.clearDroppedGroups();
    }
  }

  gridChange() {
    console.log("cell changed");
    if (this.gridObj && this.gridObj.setOptions) {
      this.gridObj.setOptions({
        frozenRow: this.pageLayout.GridConfiguration.PinnedRowCount,
        frozenColumn: this.pageLayout.GridConfiguration.PinnedColumnCount,
        frozenBottom: this.pageLayout.GridConfiguration.PinRowFromBottom,
      })
    }
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid; // grid object
    this.dataviewObj = angularGrid.dataView;

    if (this.gridObj && this.gridObj.setOptions) {

      this.gridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.pageLayout.GridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.pageLayout.GridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }

      if (!this.pageLayout.GridConfiguration.IsPaginationRequired && !this.pageLayout.GridConfiguration.IsDynamicColumns)
        this.updateFooter(this.gridObj);
    }
    if (this.pageLayout.GridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }

  onSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.dataset);

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('answer', this.selectedItems);
  }

  onCellClicked(e, args) {
    if (this.pageLayout.GridConfiguration.IsDynamicColumns == undefined || this.pageLayout.GridConfiguration.IsDynamicColumns == null
      || !this.pageLayout.GridConfiguration.IsDynamicColumns) {

      const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
      if (metadata.columnDef.id === 'edit' && this.code === "SaleOrders") {
        if (metadata.dataContext.StatusCode >= SaleOrderStatus.SaleOrderApproved) {
          this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Sale Order items cannot be edited because the status is in an invalid state.");
          return;
        }

        this.do_editSO_SingleItem(metadata.dataContext, "PayInputs");
        return;
      }
      if (metadata.columnDef.id === 'edit' && this.code === "Invoices" || this.code == 'invoices') {
        if (metadata.dataContext.StatusCode != InvoiceStatus.Initiated) {
          this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Sale Order items cannot be edited because the status is in an invalid state.");
          return;
        }
        this.do_editInvoice_SingleItem(metadata.dataContext);
        return;
      }
      if (metadata.columnDef.id === 'preview' && this.code === "Invoices" || this.code == 'invoices') {
        this.do_PreviewInvoice_SingleItem(metadata.dataContext);
        return;
      }
      if (metadata.columnDef.id === 'docs' && this.code === "Invoices" || this.code == 'invoices') {
        this.preview_invoice_docs(metadata.dataContext);
        return;
      }

      if (metadata.columnDef.id === 'delete' && this.code.toLowerCase() === 'productlist') {
        this.deleteProduct(metadata.dataContext);
        return;
      }

      if (metadata.columnDef.id === 'delete' && this.code.toLowerCase() === 'paygroup') {
        this.deletePayGroup(metadata.dataContext);
        return;
      }
      // else if (metadata.columnDef.id === 'delete') {
      //    this.sweetalertConfirm(metadata.dataContext);
      // }


      var iskeyValue: boolean = false;
      var isApprovedEmployee: boolean = false;

      const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

      // console.log(column.dataContext);

      if (column.dataContext.hasOwnProperty("PVRId")) {
        var value = column.dataContext['PVRId'];
        if (value > 0) {
          iskeyValue = true;
        }
      }
      if (this.code == 'savedEmployees' && column.dataContext.hasOwnProperty("TransactionStatus")) {
        var value = column.dataContext['TransactionStatus'];
        if (value == 2 || value == 3) {
          isApprovedEmployee = true;
        }
      }
      console.log(column);
      var flag = false;
      for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
        //console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
        if (column.columnDef.id === this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id) {
          console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
          flag = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable;
          if (flag) {
            console.log("clicked", column)
            if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName !== null
              && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName !== '') {
              this.executeFunction(this.pageLayout.GridConfiguration.ColumnDefinitionList[i], column.dataContext, column)
            }
            else if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink !== null
              && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink !== '') {

              if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
                this.rowDataService.dataInterface.RowData = column.dataContext;
                if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
                  this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(searchElementValue => {
                    searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
                  }
                  )
                  this.rowDataService.dataInterface.SearchElementValuesList = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
                }
              }
              else {
                this.rowDataService.dataInterface.RowData = null;
                this.rowDataService.dataInterface.SearchElementValuesList = [];
              }

              console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList);

              console.log('tt', this.rowDataService);
              sessionStorage.removeItem("RowDataInterface");
              sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));


              if (iskeyValue && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && this.code == "payrollinputs_list") {
                this.alertService.showWarning("You do not have permission to access this link.")
                return;
              }
              if (isApprovedEmployee && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && this.code == "savedEmployees") {
                this.alertService.showWarning(`This employment record cannot be edited. ${column.dataContext['TransactionStatus'] == 2 ? `The record is pending for approval` : column.dataContext['TransactionStatus'] == 3 ? `The record has already had approval.` : ''} `)
                return;
              }
              sessionStorage.removeItem('_StoreLstinvestment');
              sessionStorage.removeItem("IsFromBillEntry");
              if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink == 'app/ess/employee' && column.dataContext.EmployeeId > 0) {
                this.loadingScreenService.startLoading(); this.employeeService.getEmployeeTabInfo(column.dataContext.ClientId, column.dataContext.EmployeeId).subscribe(res => {
                  console.log('res', res);
                  this.loadingScreenService.stopLoading(); if (res.Status && res.Result && res.Result != '') {
                    this.employeeService.getEmpVisibleTabs(JSON.parse(res.Result));
                    this.sessionService.setItem('essEmpName', column.dataContext.EmployeeName);
                    this.router.navigate([`${this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink}/${btoa(column.dataContext.Id)}`])
                  } else {
                    this.rowDataService.dataInterface.RowData = null;
                    this.rowDataService.dataInterface.SearchElementValuesList = [];
                    sessionStorage.removeItem("RowDataInterface");
                    this.alertService.showWarning(res.Message);
                    return;
                  }
                })
              } else {
                this.router.navigate([this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink])
              };
            }
          }
          break;
        }
      }


    }

  }



  updateFooter(gridObj) {
    console.log("im in update footer")
    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
        var value;
        switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
          case 'sum': {
            value = this.getSum(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix + value.toString() + this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix;
            break;
          }

          case 'min': {
            value = this.getMin(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');
            break;
          }

          case 'max': {
            value = this.getMax(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');

            break;
          }

          case 'average': {
            value = this.getAverage(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');
            break;
          }

        }
      }
    }
  }

  getSum(fieldName: string) {
    var sum = 0;
    for (var i = 0; i < this.dataset.length; ++i) {
      var num: number = this.dataset[i][fieldName];
      sum += num;
    }
    return sum;
  }

  getMin(fieldName: string) {
    var min = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < this.dataset.length; ++i) {
      var num: number = this.dataset[i][fieldName];
      min = Math.min(num, min);
    }
    return min;

  }

  getMax(fieldName: string) {
    var max = Number.MIN_SAFE_INTEGER;
    for (var i = 0; i < this.dataset.length; ++i) {
      var num: number = this.dataset[i][fieldName];
      max = Math.max(num, max);
    }
    return max;
  }

  getAverage(fieldName: string) {
    var sum = this.getSum(fieldName);
    var avg = sum / this.dataset.length;
    return avg;
  }

  mockData(count: number) {
    const mockDatadet = [];

    for (let i = 0; i < count; ++i) {
      const randomCode = Math.floor(Math.random() * 1000);

      mockDatadet[i] = {
        Id: i,
        Code: randomCode,
        Name: 'Banglore',
        StatusCode: 'Active'
      };
    }

    return mockDatadet;
  }

  executeFunction(columnDefinition: ColumnDefinition, rowData: any, column: any) {


    switch (columnDefinition.FunctionName) {

      case 'delete': {
        this.delete(rowData);
        break;
      }

      case 'executeQuery': {
        if (columnDefinition.SendDataToFunction)
          this.executeQuery(rowData, columnDefinition.FunctionData);
        break;
      }

      case 'approve_pvr': {
        this.approve_pvr(rowData);
        break;
      }

      case 'reject_pvr': {
        this.reject_pvr(rowData);
        break;
      }
      case 'onClickPVRID': {
        this.onClickPVRID(columnDefinition, rowData, column)
        break;
      }
      case 'downloadFile': {
        this.downloadFile(columnDefinition, rowData, column)
        break;
      }
      case 'callApi': {
        this.callApi(columnDefinition, rowData, column)
        break;
      }
      case 'onPaymentStatus': {
        this.onPaymentStatus(rowData);
        break;
      }
      case 'onClickRegularize': {
        this.onClickRegularize(rowData);
        break;
      }
      case 'previewInvestments': {
        this.onClickPreviewInvestment(rowData)
        break;
      }
      case 'editUserDetails': {
        this.do_add_users(rowData)
        break;
      }

      case 'resignationDetailsView': {
        this.openResignationDetailsDrawer(rowData);
        break;

      }
      case 'previewEmployeeDetails': {
        this.doOpenEmployeePreviewScreen(rowData);
        break;

      }

      case 'approveResignationView': {
        if (this.RoleCode != 'CorporateHR') {
          this.approveRejectResignationDrawer(rowData, 'approve');
        } else {
          this.approveResignationByCorporateHR(rowData, 'approve');
        }
        break;
      }

      case 'rejectResignationView': {
        this.approveRejectResignationDrawer(rowData, 'reject');
        break;
      }


      case 'releaseAL': {
        this.releaseAL(rowData, 'S');
        break;
      }

      case 'onboardingPreviewLetter': {
        this.previewLetterForMigration(rowData);
        break;
      }


      case 'editTeam': {
        this.addNewTeam(rowData, true);
        break;
      }
      case 'editCostcode': {
        this.addNewCostCode(rowData);
        break;
      }
      case 'editClient': {
        this.doaddNewClient(rowData);
        break;
      }
      case 'showSalaryPaidCount': {
        this.showSalaryCountForSalaryCreditReport(rowData, 1);
        break;
      }
      case 'showSalaryNotPaidCount': {
        this.showSalaryCountForSalaryCreditReport(rowData, 2);
        break;
      }
      case 'editMangerMapping': {
        this.updateManagerMapping(rowData);
        break;
      }
      case 'showRegularizedDetailedView': {
        this.showRegularizedDetailedViewDrawer(rowData);
        break;
      }
      case 'approveRegularizationDetailType': {
        this.selectedItems = this.selectedItems && this.selectedItems.length === 0 ? [rowData] : this.selectedItems;
        this.approveRejectRegularizationDetailedType('Approve');
        break;
      }
      case 'rejectRegularizationDetailType': {
        this.selectedItems = this.selectedItems && this.selectedItems.length === 0 ? [rowData] : this.selectedItems;
        this.approveRejectRegularizationDetailedType('Reject');
        break;
      }
      case 'MapShiftFromManager': {
        this.selectedItems = this.selectedItems && this.selectedItems.length === 0 ? [rowData] : this.selectedItems;
        this.add_shift_weekoff_from_manager_login('Shift');
        break;
      }
      case 'onClickDecline': {
        this.selectedItems = [];
        this.selectedItems.push(rowData);
        this.common_approve_reject('edit', false, rowData);
        break;
      }
      case 'onClickApprove': {
        this.selectedItems = [];
        this.selectedItems.push(rowData);
        this.common_approve_reject('edit', true, rowData);
        break;
      }

      case 'onViewHistory': {
        this.onViewBlacklistedHistory(rowData);
        break;
      }
    }
  }
  deleteEmployeeItem(EmployeeId) {
    this.loadingScreenService.startLoading();
    this.employeeService.DeleteEmployeeDetailsByEmployeeId(EmployeeId).subscribe((result) => {
      const apiresponse: apiResponse = result;
      if (apiresponse.Status) {
        this.loadingScreenService.stopLoading();
        this.alertService.showSuccess(apiresponse.Message);
        this.selectedItems = [];
        this.getDataset();
      } else {
        this.alertService.showWarning(apiresponse.Message);
        this.loadingScreenService.stopLoading();
      }
    })
  }
  deleteScaleListItem(scalelist) {
    this.loadingScreenService.startLoading();
    this.scaleService.DeleteScaleDetailesByScaleId(scalelist).subscribe((result) => {
      const apiresponse: apiResponse = result;
      if (apiresponse.Status) {
        this.loadingScreenService.stopLoading();
        this.alertService.showSuccess(apiresponse.Message);
        this.selectedItems = [];
        this.getDataset();
      } else {
        this.alertService.showWarning(apiresponse.Message);
        this.loadingScreenService.stopLoading();
      }
    })
  }

  executeQuery(rowData: any, data: any) {


    let dataSource = data[0];
    let params: {
      FieldName: string,
      Value: string
    }[] = [];
    let keys = Object.keys(data[1]);
    for (let key of keys) {

      params.push({
        FieldName: key,
        Value: rowData[data[1][key]]
      })

    }

    console.log(dataSource, params);

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
      confirmButtonText: 'Yes, confirm!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.loadingSpinner = true;
        this.pageLayoutService.executeQuery(dataSource, params).subscribe(
          data => {
            this.loadingSpinner = false;
            if (data.Status) {
              console.log(data);
              this.alertService.showSuccess(data.Message);
              this.getDataset();
            }
            else {
              console.log(data);
              this.alertService.showWarning(data.Message)
            }
          },
          error => {
            this.loadingSpinner = false;
            this.alertService.showWarning("Error occured! Please Try Again");
            console.log(error);
          }
        )

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }

  delete(rowData: any, data: any = null) {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, confirm!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        if (this.code == 'scalelist') {
          this.deleteScaleListItem(rowData);
          // console.log('rowdata',rowData)
          return;
        }
      }
      // else if (this.code == 'employeelist') {
      //   this.deleteEmployeeItem(rowData.Id);
      //   return;
      // }
      else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })
  }

  /// button actions


  separateEmployee() {
    if (this.selectedItems.length > 1) {
      this.alertService.showInfo("Please choose only 1 employee");
    }

    if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
      this.alertService.showInfo("Please choose an employee to separate.");
    }

    let eLCTransaction: EmployeeLifeCycleTransaction;

    let employeeObject = this.selectedItems[0];


    eLCTransaction = employeeObject.ELCTransactions != undefined && employeeObject.ELCTransactions != null
      && employeeObject.ELCTransactions.length > 0 ? _.orderBy(employeeObject.ELCTransactions, ["Id"], ["desc"]).find(x =>
        (x.ELCTransactionTypeId == ELCTRANSACTIONTYPE.Resignation || x.ELCTransactionTypeId == ELCTRANSACTIONTYPE.Termination)
        && (x.EmployeeFnFTransaction.Status !== TransactionStatus.Voided)) : null;

    console.log("ELC Transaction ::", eLCTransaction);

    if (eLCTransaction != undefined && eLCTransaction != null) {
      this.alertService.showWarning("Settlement for " + employeeObject.EmployeeName + " is already under process!");
      return;
    }


    $("#popup_fnfType").modal('show');


    // let employee = this.selectedemployeeRecords[0];
    // employee["EmployeeId"] = employee.Id;

    // this.router.navigate(['app/fnf/finalsettlement'], {
    //     queryParams: {
    //      "Odx": btoa(JSON.stringify(this.selectedemployeeRecords[0])),
    //     }
    //   });
  }

  modal_dismiss() {
    $("#popup_fnfType").modal('hide');
  }

  proceed() {
    $("#popup_fnfType").modal('hide');

    let employeeObject = this.selectedItems[0];
    employeeObject["EmployeeId"] = employeeObject.Id;
    employeeObject["isResignation"] = this.isResignation;

    console.log("Resignation::", this.isResignation);

    this.router.navigate(['app/fnf/finalsettlement'], {
      queryParams: {
        "Odx": btoa(JSON.stringify(employeeObject)),
      }
    });
  }



  download_billingsheet_modal() {

    if (this.selectedItems.length > 0) {
      const modalRef = this.modalService.open(DownloadBillingSheetModalComponent, this.modalOption);
      modalRef.componentInstance.ClientName = this.selectedItems[0].ClientName;
      modalRef.componentInstance.PayPeriod = this.selectedItems[0].PayPeriod;
      modalRef.componentInstance.Team = this.selectedItems[0].Team;

      modalRef.componentInstance.LstSaleOrders = this.selectedItems;
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          this.selectedItems = [];
          this.getDataset();
        }
      }).catch((error) => {
        console.log(error);
      });

    } else {
      this.alertService.showWarning("At least one checkbox must be selected.");
    }

  }


  proceedConfirmationAlert() {

    if (!this.showApprovemode) {
      this.triggerApproveSO();
      this.showApprovemode = true;
      return;
    }

    var payrunIds = []
    this.selectedItems.forEach(element => {
      payrunIds.push(element.PayRunId)
    });
    let ArrpayrunIds = (payrunIds).join(",");
    var clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId");
    var clientName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name;

    const modalRef = this.modalService.open(SaleorderSummaryModalComponent, this.modalOption);
    modalRef.componentInstance.PayRunIds = ArrpayrunIds;
    var objStorageJson = JSON.stringify(
      {
        clientId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId").Value,
        clientcontractId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId").Value,
        payperiodId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId").Value

      })
    modalRef.componentInstance.CoreJson = objStorageJson;
    modalRef.componentInstance.lstSelectedObj = JSON.stringify(this.selectedItems);


    modalRef.result.then((result) => {
      if (result != "Model Closed") {
        this.getDataset();
        this.selectedItems = [];
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  do_Approve_SaleOrder(index) {

    if (this.selectedItems.length > 0) {

      if (index == "Approve") {
        var isApprovedItems = this.selectedItems.filter(a => a.StatusCode == SaleOrderStatus.SaleOrderApproved || a.StatusCode == SaleOrderStatus.Invoiced || a.StatusCode == SaleOrderStatus.SaleOrderMerged);
        if (isApprovedItems.length > 0) {
          this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Sale Order items cannot be Approved because the status is in an invalid state.");
          return;
        }

        const modalRef = this.modalService.open(ConfirmationAlertModalComponent, this.modalOption);
        modalRef.result.then((result) => {
          if (result == 'Proceed') {
            this.proceedConfirmationAlert();
          } else if (result == 'Only Approve') {
            this.triggerApproveSO();
          } else {
            this.selectedItems = [];
            this.getDataset();
          }
        }).catch((error) => {
          console.log(error);
        });

        return;
      }
      if (index != "Approve") {
        var isApprovedItems = this.selectedItems.filter(a => a.StatusCode == SaleOrderStatus.SaleOrderRejected || a.StatusCode == SaleOrderStatus.Invoiced || a.StatusCode == SaleOrderStatus.SaleOrderMerged);
        if (isApprovedItems.length > 0) {
          this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Sale Order items cannot be Reject because the status is in an invalid state.");
          return;
        }
      }

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: 'Are you sure?',
        text: `Are you sure you want to ${index} this record!`,
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, confirm!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
      }).then((result) => {
        if (result.value) {
          this.loadingScreenService.startLoading();
          var lstOfRecords = [];
          this.selectedItems.forEach(element => {
            console.log('ppp', element);

            var so = new SaleOrder();
            so.Id = element.Id;
            so.Status = index === "Approve" ? SaleOrderStatus.SaleOrderApproved : SaleOrderStatus.SaleOrderRejected;
            lstOfRecords.push(so);
          });
          this.payrollService.put_UpdateSaleOrdersStatusDetails(lstOfRecords)
            .subscribe((result) => {
              let apiResult: apiResult = result;
              if (apiResult.Status) {
                this.alertService.showSuccess(apiResult.Message);
                this.loadingScreenService.stopLoading();
                this.selectedItems = [];
                this.getDataset();
              } else { this.loadingScreenService.stopLoading }
            }, err => {

            });
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {

        }
      })


      // // var payrunIds = []
      // // this.selectedItems.forEach(element => {
      // //   payrunIds.push(element.PayRunId)
      // // });
      // // let ArrpayrunIds = (payrunIds).join(",");
      // // var clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId");
      // // var clientName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name;

      // // const modalRef = this.modalService.open(SaleorderSummaryModalComponent, this.modalOption);
      // // modalRef.componentInstance.PayRunIds = ArrpayrunIds;
      // // var objStorageJson = JSON.stringify(
      // //   {
      // //     clientId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId").Value,
      // //     clientcontractId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId").Value,
      // //     payperiodId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId").Value

      // //   })
      // // modalRef.componentInstance.CoreJson = objStorageJson;
      // // modalRef.componentInstance.lstSelectedObj = JSON.stringify(this.selectedItems);


      // // modalRef.result.then((result) => {
      // //   if(result != "Model Closed"){
      // //     this.getDataset();
      // //     this.selectedItems = [];
      // //   }
      // }).catch((error) => {
      //   console.log(error);
      // });
    } else {
      this.alertService.showWarning("At least one checkbox must be selected.");
    }
  }

  triggerApproveSO() {

    this.loadingScreenService.startLoading();
    var lstOfRecords = [];
    this.selectedItems.forEach(element => {
      var so = new SaleOrder();
      so.Id = element.Id;
      so.Status = SaleOrderStatus.SaleOrderApproved;
      // so.ShipToClientContactId = element.ShipToClientContactId;
      // so.ShipToAddressDetails = element.ShipToAddressDetails;
      // so.CompanyBankAccountId = element.CompanyBankAccountId;
      // so.Narration = element.Narration;
      // so.Remarks = element.Remarks;
      // so.PurchaseOrderNo = element.PurchaseOrderNo;
      lstOfRecords.push(so);
    });
    this.payrollService.put_UpdateSaleOrdersStatusDetails(lstOfRecords)
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.selectedItems = [];
          this.getDataset();
        } else { this.loadingScreenService.stopLoading }
      }, err => {

      });
  }

  MergeSO() {

    if (this.selectedItems.length === 0) {
      this.alertService.showWarning("At least one checkbox must be selected.");
      return;
    }
    this.loadingScreenService.startLoading();
    var LstMergeSO = [];
    this.selectedItems.forEach(element => {
      LstMergeSO.push({
        Id: element.Id,
        Status: element.StatusCode
      })

    });

    this.payrollService.put_MergeSaleOrder(LstMergeSO)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();
        } else { this.loadingScreenService.stopLoading(); this.alertService.showWarning(apiResult.Message) }
      })

  }

  downloadFile(columnDefinition, columndata, column) {
    // console.log('column.dataContext', column.dataContext.ObjectId);
    this.loadingScreenService.startLoading();
    this.fileuploadService.downloadObjectAsBlob(column.dataContext.ObjectId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        console.log('res', res);
        var dynoFileNames = column.dataContext.FileName.replace(/\./g, ' ')
        saveAs(res);
        this.loadingScreenService.stopLoading();
      });

  }



  callApi(columnDefinition, columndata, column) {
    // this.commonService.callApi(url, urlParameters)
    // .subscribe((result)=> {
    //   const apiResult: apiResult = result;
    //   if()
    // });

  }


  /* #region PAYROLL INPUTS LISTING SCREEN  */
  onClickPVRID(columnDefinition, columndata, column) {
    console.log(column);
    var flag = false;
    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      if (column.columnDef.id === this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id) {
        console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
        flag = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable;
        if (flag) {
          console.log("clicked", column)
          if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
            this.rowDataService.dataInterface.RowData = column.dataContext;
            if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
              this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(searchElementValue => {
                searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
              }
              )
              this.rowDataService.dataInterface.SearchElementValuesList = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
            }
          }
          else {
            this.rowDataService.dataInterface.RowData = null;
            this.rowDataService.dataInterface.SearchElementValuesList = [];
          }
          sessionStorage.removeItem("RowDataInterface");
          sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));
          this.router.navigate(['app/payroll/payrolltransactions'])

        }
        break;
      }
    }

  }
  do_generate_PIS() {
    this.LstGeneratePIS = [];
    if (this.selectedItems.length > 0) {
      var EmployeeCount = [];
      EmployeeCount = this.selectedItems.filter(z => z.EmployeeCount == 0);
      if (EmployeeCount.length > 0) {
        this.alertService.showWarning("There are no active employee list for selected record!");
        return;
      }
      console.log(this.selectedItems);
      this.loadingScreenService.startLoading();
      const jobj = new GeneratePIS();
      jobj.ClientId = this.selectedItems[0].clientId;
      jobj.ClientContractId = this.selectedItems[0].clientcontractId;
      jobj.EmployeeIds = null;
      jobj.TeamIds = [];
      this.selectedItems.forEach(function (item) { jobj.TeamIds.push(item.teamId) })
      jobj.TeamIds = _.union(jobj.TeamIds)

      jobj.PayPeriodId = this.selectedItems[0].payperiodId;
      jobj.PISId = 0;
      jobj.IsDownloadExcelRequired = true;
      jobj.ObjectStorageId = 0;
      jobj.RequestedBy = this.UserId;
      jobj.RequestedOn = 0;
      jobj.GeneratedRecords = 0;
      jobj.IsPushrequired = true;
      this.LstGeneratePIS.push(jobj);
      var dynoFileName = `PIS_${this.selectedItems[0].ClientName}_${this.selectedItems[0].Team}_`;
      this.payrollService.post_generatePIS(JSON.stringify(this.LstGeneratePIS))
        .subscribe((result) => {
          console.log('GENERATE PIS RESPONSE ::', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            const jsonobj = JSON.stringify(apiResult.Result)
            const docsBytes = JSON.parse(jsonobj);
            docsBytes[0].docbytes != null && docsBytes[0].docbytes != undefined && this.base64ToBlob(docsBytes[0].docbytes as String, dynoFileName)
            this.alertService.showSuccess("PIS successfully generated!");
            this.gridObj.getSelectionModel().setSelectedRows([]);
            this.getDataset();
            this.selectedItems = [];
            this.loadingScreenService.stopLoading();
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        });
    } else {
      this.alertService.showWarning("Please select at least one record!");
      return;
    }

  }
  public base64ToBlob(b64Data, dynoFileName, sliceSize = 512) {
    var dynoFileNames = dynoFileName.replace(/\./g, ' ')

    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(file, dynoFileNames + new Date().getTime());
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  importData_popup() {
    console.log('BEHAVIOUR OBJECT REC :', this.selectedItems);
    const modalRef = this.modalService.open(PayrollImportdataComponent, this.modalOption);
    modalRef.componentInstance.ClientName = this.selectedItems[0].ClientName;
    var objStorageJson = JSON.stringify(this.selectedItems[0])
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {
      console.log('POPUP RESULT :', result);
      this.getDataset();
      this.selectedItems = []
    }).catch((error) => {
      console.log(error);
    });
  }
  /* #endregion */


  /* #region  PAYROLL - PAYROLL VERFICATION REQUEST - EMPLOYEE LISI WITH EDIT PART */
  downloadPIS_paysheet() {
    if (this.code === "payrollVerificationRequest") {
      if (this.selectedItems.length > 0) {
        this.loadingScreenService.startLoading();
        this.selectedItems.forEach(obj => {
          this.verifid_and_Download(obj)
        });
      } else {
        this.alertService.showWarning("At least one checkbox must be selected.");
      }
    } else if (this.code == "pvr_verified_revise" && this.BehaviourObject_Data.PVRId > 0) {
      this.loadingScreenService.startLoading();
      this.verifid_and_Download(this.BehaviourObject_Data)
    }

  }
  verifid_and_Download(obj) {
    this.payrollService.get_payrollInputOutputByPVRId(obj.PVRId)
      .subscribe((result) => {
        console.log('paysheet result : ', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          var dynoFileName = `PIS&Paysheet_${obj.ClientName}_${obj.TeamName}_PVR(${obj.PVRId})_`;
          this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
          this.loadingScreenService.stopLoading();
        } else {
          this.loadingScreenService.stopLoading();
        }
      }, (error) => {
        this.loadingScreenService.stopLoading();

      })

  }
  approve_pvr(result: any) {
    this.update_pvr_item('approve', result);
  }
  reject_pvr(result: any) {
    this.update_pvr_item('reject', result);
  }
  update_pvr_item(which: any, result: any) {
    var title = which == 'reject' ? "Rejection Remarks " : "Approve Remarks";
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: title,
      animation: false,
      showCancelButton: true, // There won't be any cancel button
      input: 'textarea',
      inputValue: result.ApproverRemarks,
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
        result.VerificationStatus = which == 'reject' ? "Rejected" : "Approved";
        result.CustomStatus = which == 'reject' ? TimeCardStatus.QcRejected : TimeCardStatus.QcApproved;
        result.ApproverRemarks = jsonStr;
        this.angularGrid.gridService.updateDataGridItemById(result.Id, result, false, false, false);
      } else if (
        /* Read more about handling dismissals below */
        inputValue.dismiss === Swal.DismissReason.cancel

      ) {
        if (which === "approve") {
          result.VerificationStatus = which == 'reject' ? "Rejected" : "Approved";
          result.CustomStatus = which == 'reject' ? TimeCardStatus.QcRejected : TimeCardStatus.QcApproved;
          result.ApproverRemarks = '';
          this.angularGrid.gridService.updateDataGridItemById(result.Id, result, false, false, false);
        }
      }
    })

  }

  do_approve_reject_pvr(indexObject: any): void {
    if (this.selectedItems.length > 0) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: "Overall Remarks",
        animation: false,
        showCancelButton: true, // There won't be any cancel button
        input: 'textarea',

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


          // this.selectedItems.forEach(obj => {
          //   var initlist =[];
          //   initlist = this.selectedItems.filter(a=>a.CustomStatus == PVRStatus.Initiated);
          //   if(initlist.length > 0){

          //   }
          this.selectedItems.forEach(element => {
            if (element.CustomStatus == TimeCardStatus.SentForQc) {

              element.VerificationStatus = indexObject == "reject" ? "Rejected" : "Approved";
              element.CustomStatus = indexObject == "reject" ? TimeCardStatus.QcRejected : TimeCardStatus.QcApproved;
              element.ApproverRemarks = jsonStr;
              this.angularGrid.gridService.updateDataGridItemById(element.Id, element, false, false, false);
            }
          });
          this.do_submit_pvr(jsonStr, indexObject);
          // obj.VerificationStatus = indexObject == "reject" ? "Rejected" : "Approved";
          // obj.CustomStatus = indexObject == "reject" ? PVRStatus.Rejected : PVRStatus.Approved;
          // obj.ApproverRemarks = jsonStr;
          // this.angularGrid.gridService.updateDataGridItemById(obj.Id, obj, false, false, false);
          // this.angularGrid.gridService.updateDataGridItemById(obj.Id, obj, true, true);
          // updateDataGridItemById(itemId: number | string, item: any, shouldHighlightRow?: boolean, shouldTriggerEvent?: boolean, shouldSelectRow?: boolean): number;

          // });
        } else if (
          /* Read more about handling dismissals below */
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
        }
      })
    } else {
      this.alertService.showWarning("At least one checkbox must be selected.");
    }
  }
  do_submit_pvr(remarks: any, indexObject: any) {
    if (this.selectedItems.length > 0) {

      console.log('bfore submit', this.selectedItems);
      var isInitiatedExist = []
      isInitiatedExist = this.selectedItems.filter(a => a.CustomStatus == TimeCardStatus.SentForQc);
      if (isInitiatedExist.length > 0) {
        this.alertService.showWarning("Please update your selected employee verification status : Rejected / Approved");
        return;
      }
      var isRejected = [];
      var isApproved = [];
      var partiallyApproved = false;
      isRejected = this.selectedItems.filter(a => a.CustomStatus == TimeCardStatus.QcRejected);
      isApproved = this.selectedItems.filter(a => a.CustomStatus == TimeCardStatus.QcApproved);
      if (isRejected.length > 0 && isApproved.length > 0) {
        partiallyApproved = true;
      }
      if (this.dataset.length > 0) {
        var initvalue = [];
        initvalue = this.dataset.filter(x => x.CustomStatus == TimeCardStatus.SentForQc);
        if (initvalue.length > 0) {
          partiallyApproved = true;
        }
      }

      if (this.dataset.length != this.selectedItems.length) {
        this.alertService.showInfo("Information : The action was blocked. Kindly select all employee(s) across pages");
        return;
      }
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: `Are you sure`,
        text: "Are you sure you want to submit the Request?",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: "Yes, Continue",
        cancelButtonText: 'No, cancel!',
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((res) => {
        if (res.value) {

          this.loadingScreenService.startLoading();

          this.LstSubmitForVerifcation = [];
          var currentDate = new Date();
          console.log('BEHAVIOUS OBJECT DATA : ', this.BehaviourObject_Data);

          this.selectedItems.forEach(event => {
            var submitListObject = new PayrollVerificationRequestDetails();
            submitListObject.Id = event.PVRDId;
            submitListObject.PVRId = event.PVRId == -1 ? 0 : event.PVRId;
            submitListObject.TimeCardId = event.TimeCardId;
            submitListObject.EmployeeId = event.EmployeeId;
            submitListObject.EmployeeName = event.EmployeeName;
            submitListObject.IsActive = true;
            submitListObject.LastUpdatedBy = this.UserId;
            submitListObject.LastUpdatedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss'); // new Date().toLocaleString(); // moment(currentDate).format('YYYY-MM-DD');
            submitListObject.RequestRemarks = this.BehaviourObject_Data.RequestRemarks;
            submitListObject.ApproverRemarks = event.ApproverRemarks;
            submitListObject.Status = event.CustomStatus;
            submitListObject.ModeType = UIMode.Edit;
            this.LstSubmitForVerifcation.push(submitListObject);
          });
          var submitObject = new PayrollVerificationRequest();
          submitObject.Id = this.BehaviourObject_Data.PVRId;
          submitObject.CompanyId = this.sessionDetails.Company.Id;
          submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
          submitObject.ClientId = this.BehaviourObject_Data.clientId;
          submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
          submitObject.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
          submitObject.AttdanceStartDate = this.BehaviourObject_Data.AttendanceStartDate;
          submitObject.AttdanceEndDate = this.BehaviourObject_Data.AttendanceEndDate;
          submitObject.ClientContactId = this.BehaviourObject_Data.ClientContactId;
          submitObject.ClientContactDetails = this.BehaviourObject_Data.ClientContactDetails;
          submitObject.TeamIds = [];
          submitObject.ModeType = UIMode.Edit;
          // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);\
          this.selectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
          submitObject.TeamIds = _.union(submitObject.TeamIds)

          submitObject.TeamIds = _.union(submitObject.TeamIds)
          submitObject.RequestedBy = this.BehaviourObject_Data.RequestedBy
          submitObject.RequestedOn = moment(this.BehaviourObject_Data.RequestedOn).format('YYYY-MM-DD hh:mm:ss');
          submitObject.ApproverId = this.UserId;
          submitObject.ApproverLogOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');   // moment(currentDate).format('YYYY-MM-DD');
          submitObject.RequestRemarks = this.BehaviourObject_Data.RequestRemarks;
          submitObject.ApproverRemarks = remarks;
          submitObject.ObjectStorageId = 0;
          submitObject.Status = partiallyApproved == true ? PVRStatus.PartiallyApproved : indexObject == "reject" ? PVRStatus.Rejected : PVRStatus.Approved;
          submitObject.LstPVRDetails = this.LstSubmitForVerifcation;
          this.payrollModel = _PayrollModel;
          this.payrollModel.NewDetails = submitObject;
          this.payrollModel.OldDetails = "";
          console.log('PAYROLL MODEL : ', this.payrollModel);

          this.loadingScreenService.startLoading();
          this.loadingScreenService.stopLoading();

          this.payrollService.put_PVRSubmission(JSON.stringify(this.payrollModel))
            .subscribe((result) => {
              console.log('SUBMIT FOR VERIFICATION RESPONSE :: ', result);
              const apiResult: apiResult = result;
              if (apiResult.Status && apiResult.Result) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(apiResult.Message);
                this.selectedItems = [];
                this.router.navigateByUrl('app/listing/ui/payrollVerificationRequest');


              } else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiResult.Message);
              }
            }, error => {
              this.loadingScreenService.stopLoading();

            });

        } else if (
          /* Read more about handling dismissals below */
          res.dismiss === Swal.DismissReason.cancel

        ) {
          this.loadingScreenService.stopLoading(); this.getDataset(); this.selectedItems = [];
        }
      })

    } else {
      this.alertService.showWarning("At least one checkbox must be selected.");
    }
  }
  do_cancel_pvr() {
    this.router.navigateByUrl('app/listing/ui/payrollVerificationRequest')
  }
  /* #endregion  */

  hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
        || type === '[object Array]';

    } catch (err) {
      return false;
    }
  }

  async do_editSO_SingleItem(args, index) {
    console.log('BEHAVIOUR OBJECT REC :', args);
    var object = await this.fetchSaleOrderByPayRunId(args.PayRunId).then((result) => {
      console.log('object :', result);
      const modalRef = this.modalService.open(SaleorderModalComponent, this.modalOption);
      modalRef.componentInstance.objJson = JSON.stringify(result);
      modalRef.componentInstance.CoreJson = JSON.stringify({ ClientName: args.ClientName, ClientContractId: args.clientcontractId, ClientId: args.clientId });
      modalRef.componentInstance.ContentArea = index;
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          console.log('RESULT OF EDITED SO DETAILS :', result);
          this.getDataset();
          this.selectedItems = [];
          // index === "PayInputs" && this.inSaleOrdersGridInstance.gridService.updateDataGridItemById(result.Id, result, true, true);
          // index === "PayOut" && this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);
        }
      }).catch((error) => {
        console.log(error);
      });
    });

  }

  fetchSaleOrderByPayRunId(PayRunId) {
    return new Promise((resolve, reject) => {
      this.payrollService.get_SaleOrdersbyPayrunId(PayRunId)
        .subscribe((result) => {
          console.log('SO RESULT :', result);
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            resolve(apiResult.Result[0] as any);
          }

        }, err => {

        })
    });
  }
  //PAY OUT REQUEST
  do_generate_file() {
    if (this.selectedItems.length > 0) {
      var isBatchexist = [];
      isBatchexist = this.selectedItems.filter(a => a.StatusCode > PayOutStatus.Approved);

      if (isBatchexist.length > 0) {
        this.alertService.showWarning("Your request cannot make and confirm! You have selected item(s) that contains invalid Status.");
        return;
      }
      if (this.selectedItems.filter(a => a.hasOwnProperty("PaymentMode") && a.PaymentMode == 3).length > 0) {
        this.alertService.showWarning("An error has occurred while attempting to generate the bank file. One or more Batch items cannot be generated because the payment mode is in CheQue.")
        return;
      }
      const modalRef = this.modalService.open(PayoutFinanceModalComponent, this.modalOption);
      modalRef.componentInstance.lstSelectedObj = JSON.stringify(this.selectedItems);
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          this.selectedItems = [];
          this.getDataset();
        }
      }).catch((error) => {
        console.log(error);
      });
    } else {
      this.alertService.showWarning("Oh ho! As per the requirements, You must make a selection(s) from the list.")
    }

  }

  //PAYOUT REQUEST EXCEL DOWNLOAD CHEQUE
  do_download_cheque_file() {
    if (this.selectedItems.filter(a => a.hasOwnProperty("PaymentMode") && a.PaymentMode == 2).length > 0) {
      this.alertService.showWarning("An error has occurred while attempting to generate the bank file. One or more Batch items cannot be generated because the payment mode is in CheQue.")
      return;
    }

    this.commonapimethod.get_payoutinformationdetailsById(this.selectedItems[0].Id);
  }
  async do_view_request() {

    if (this.selectedItems.length > 0) {
      var isBatchexist = [];
      isBatchexist = this.selectedItems.filter(a => a.StatusCode != PayOutStatus.Approved);
      console.log('test', isBatchexist);

      // if (this.code != 'payoutApprove' && isBatchexist.length > 0) {
      //   this.alertService.showWarning("Your request cannot make and confirm! You have selected item(s) that contains invalid Status.");
      //   return;
      // }

      this.rowDataService.dataInterface.RowData = this.selectedItems;
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "batchId",
        "OutputFieldName": "@batchId",
        "Value": this.selectedItems[0].batchId,
        "ReadOnly": true
      }];
      await this.code === 'payoutApprove' ? this.router.navigateByUrl('app/payroll/payoutTransaction') : this.code === 'payoutApprovals' ? this.router.navigateByUrl('app/payroll/payoutTransaction_finance') : this.code === 'payoutrequest' ? this.router.navigateByUrl('app/payroll/payoutTransaction_ops') : this.router.navigateByUrl('app/payroll/payoutTransaction_ops');

      // const modalRef = this.modalService.open(PayoutViewrequestModalComponent, this.modalOption);
      // modalRef.componentInstance.lstSelectedObj = JSON.stringify(this.selectedItems);
      // modalRef.componentInstance.ROLE = this.code === 'payoutApprovals' ? "Finance" : "Ops";

      // modalRef.result.then((result) => { 
      //   if (result != "Modal Closed") {
      //     this.selectedItems = [];
      //     this.getDataset();
      //   }
      // }).catch((error) => {
      //   console.log(error);
      // });
    } else {
      this.alertService.showWarning("Oh ho! As per the requirements, You must make a selection(s) from the list.")
    }


  }
  close_PamentStatusSlider() {
    this.visible_PamentStatusSlider = false
  }
  onPaymentStatus(rowData) {
    // const interval = setInterval(() => {
    //   this.getStarted();
    // }, 5000);

    const drawerRef = this.drawerService.create<PaymentstatusComponent, { rowData }, string>({
      nzTitle: 'Payment Status : Batch #' + rowData.Id,
      nzContent: PaymentstatusComponent,
      nzWidth: 940,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: rowData
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log('data', data);

      var modalResult = (data) as any;
      if (data != undefined) {

      }

    });


    // console.log('ROW DATA :', rowData);
    // this.commonService.Get_PayOut_LookupDetails(rowData.clientId).then((answer) => {
    //   if (answer != null) {
    //     var companyBankList_temp: any[] = [];
    //     companyBankList_temp = answer as any;
    //     console.log('companyBankList_temp', companyBankList_temp);

    //     this.visible_PamentStatusSlider = true;
    //     this.isPaymentStatus_spinner = true;
    //     this.LstEmployeeForPayout = null;

    //     this.payrollService.GetPayoutInformationbyId(rowData.Id).subscribe((result) => {
    //       const apiResult: apiResult = result;
    //       if (apiResult.Status) {
    //         const lstEmps = apiResult.Result as any;
    //         console.log('PAYOUT INFO : ', lstEmps);
    //         lstEmps != null && lstEmps.LstPayoutInformationDetails.length > 0 && lstEmps.LstPayoutInformationDetails.forEach(element => {
    //           element['CompanyBankName'] = companyBankList_temp.length > 0 ? element.CompanyBankAccountId != null && element.CompanyBankAccountId != 0 ? companyBankList_temp.find(x => x.Id == element.CompanyBankAccountId).Details : '' : '';
    //         });
    //         this.LstEmployeeForPayout = lstEmps != null && lstEmps;
    //         this.isPaymentStatus_spinner = false;
    //       } else {
    //         this.isPaymentStatus_spinner = false;
    //         this.alertService.showWarning("No Records found!");
    //       }
    //     })
    //   }
    // })

  }
  getPayoutDetailsName(status) {
    return this.payoutdetailStatus.find(a => a.id == status).name;
  }

  isLast(word) {
    return $(word).next().length > 0 ? false : true;
  }

  getNext(word) {
    return $(word).next();
  }

  getVisible() {
    return document.getElementsByClassName('is-visible');
  }

  getFirst() {
    var node = $('.words-wrapper').children().first();
    return node;
  }

  switchWords(current, next) {
    $(current).removeClass('is-visible').addClass('is-hidden');
    $(next).removeClass('is-hidden').addClass('is-visible');
  }

  getStarted() {
    var first = this.getVisible();
    var next = this.getNext(first);
    if (next.length !== 0) {
      this.isLast(next);
      this.switchWords(first, next);
    } else {
      $(first).removeClass('is-visible').addClass('is-hidden');
      var newEl = this.getFirst();
      $(newEl).removeClass('is-hidden').addClass('is-visible');
    }
  }




  checkPaymentStatus(_payoutInformation, item) {
    var payoutJObject = new PayoutInformation();
    payoutJObject.ApprovedId = _payoutInformation.ApprovedId
    payoutJObject.ApprovedOn = _payoutInformation.ApprovedOn
    payoutJObject.ApproverName = _payoutInformation.ApproverName
    payoutJObject.ClientContractId = _payoutInformation.ClientContractId
    payoutJObject.ClientId = _payoutInformation.ClientId
    payoutJObject.ClientName = _payoutInformation.ClientName
    payoutJObject.CompanyBankAccountId = _payoutInformation.CompanyBankAccountId
    payoutJObject.CompanyId = _payoutInformation.CompanyId
    payoutJObject.ErrorMessage = _payoutInformation.ErrorMessage
    payoutJObject.Id = _payoutInformation.Id
    payoutJObject.IsLocked = _payoutInformation.IsLocked
    payoutJObject.IsLockedBy = _payoutInformation.IsLockedBy;
    payoutJObject.LstPayoutInformationDetails = [];
    payoutJObject.LstPayoutInformationDetails.push(item);
    payoutJObject.PayOutDate = _payoutInformation.PayOutDate
    payoutJObject.PayPeriodId = _payoutInformation.PayPeriodId
    payoutJObject.PayPeriodName = _payoutInformation.PayPeriodName
    payoutJObject.PaymentMode = _payoutInformation.PaymentMode
    payoutJObject.PayrunIds = _payoutInformation.PayrunIds
    payoutJObject.ProcessCategory = _payoutInformation.ProcessCategory
    payoutJObject.RequestedBy = _payoutInformation.RequestedBy
    payoutJObject.RequestedOn = _payoutInformation.RequestedOn
    payoutJObject.RequesterName = _payoutInformation.RequesterName
    payoutJObject.Status = _payoutInformation.Status
    payoutJObject.TransactionRemarks = _payoutInformation.TransactionRemarks;

    // var cls = document.getElementsByClassName('is-visible')
    // $(cls).removeClass('is-hidden').addClass('is-visible'); 
    // this.message.info('succwess');;
    this.loadingScreenService.startLoading();
    this.payrollService.GetYBPaymentDetailsStatus(payoutJObject)
      .subscribe((response) => {
        const apiResult: apiResult = response;
        if (apiResult.Status) {
          const lstEmps = apiResult.Result as any;
          var status = lstEmps != null && lstEmps.LstPayoutInformationDetails.length > 0 && lstEmps.LstPayoutInformationDetails[0].Status
          lstEmps != null && (status = this.payoutdetailStatus.find(c => c.id == status).name);
          this.loadingScreenService.stopLoading();
          this.notification.blank(
            'Payment Status',
            lstEmps != null ? `Payment ${status}: The final confirmation coming from bank and payment gateway` : apiResult.Message,
            {
              nzStyle: {
                width: '600px',
                marginLeft: '-265px'
              },
              nzClass: 'test-class'
            }
          );
        } else {

          this.loadingScreenService.stopLoading();

        }
      })
  }

  do_approveorhold_payout(indexOf) {

    // old  (before SME)
    // var isBatchexist = [];
    // isBatchexist = this.selectedItems.filter(a => a.StatusCode === PayOutStatus.ReleaseBatchPrepared);

    var isBatchexist = [];
    isBatchexist = this.selectedItems.filter(a => a.StatusCode > PayOutStatus.ReleaseBatchPrepared);


    if (isBatchexist.length > 0) {
      this.alertService.showWarning("Your request cannot make and confirm! You have selected item(s) that contains invalid Status.");
      return;
    } else {
      isBatchexist = [];
      if (indexOf === "Approve") {


        isBatchexist = this.selectedItems.filter(a => a.StatusCode == PayOutStatus.Approved || a.StatusCode == PayOutStatus.PartiallyApproved || a.StatusCode == PayOutStatus.APIPaymentTransferInitiated || a.StatusCode == PayOutStatus.ReleaseBatchPrepared);
        if (isBatchexist.length > 0) {
          this.alertService.showWarning("You could not be Approved because a file or batch has been changed.");
          return;
        }
      }
      if (indexOf === "Hold") {
        if (this.code === 'payoutrequest' && this.selectedItems.filter(a => a.StatusCode == PayOutStatus.Approved || a.StatusCode === PayOutStatus.PartiallyApproved).length > 0) {
          this.alertService.showWarning("You cannot Hold bbecause a file or batch has been changed.");
          return;
        }
        isBatchexist = this.selectedItems.filter(a => a.StatusCode === PayOutStatus.Hold);
        if (isBatchexist.length > 0) {
          this.alertService.showWarning("You cannot Hold because a file or batch has been changed.");
          return;
        }
      }
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: `Review and Confirm changes`,
      text: indexOf === "Approve" ? "Are you sure you want to Approve this request?" : "Are you sure you want to Hold this request?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Yes, Continue",
      cancelButtonText: 'No, Cancel!',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {

        this.loadingScreenService.startLoading();
        let lstPayout_UpdatedDet = [];
        this.selectedItems.forEach(obj => {
          let submitobjePayOut = new PayoutInformation();
          submitobjePayOut.Id = obj.Id;
          submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
          submitobjePayOut.ClientId = obj.clientId;
          submitobjePayOut.ClientContractId = obj.clientcontractId;
          submitobjePayOut.ClientName = obj.ClientName
          submitobjePayOut.CompanyBankAccountId = obj.CompanyBankAccountId;
          submitobjePayOut.ApprovedId = this.UserId;
          indexOf == "Approve" ? submitobjePayOut.Status = PayOutStatus.Approved : submitobjePayOut.Status = PayOutStatus.Hold;
          submitobjePayOut.LstPayoutInformationDetails = [];
          submitobjePayOut.ProcessCategory = obj.ProcessCategory;
          lstPayout_UpdatedDet.push(submitobjePayOut)
        });

        if (indexOf !== "Approve") {
          this.payrollService.put_UpdatePayoutInformation(lstPayout_UpdatedDet)
            .subscribe((result) => {
              const apiResult: apiResult = result;
              if (apiResult.Status) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(apiResult.Message);
                this.getDataset();
                this.selectedItems = [];
              } else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiResult.Message);
              }
            }, err => {
              this.loadingScreenService.stopLoading();

            })
        } else {
          lstPayout_UpdatedDet.forEach(element => {
            this.do_approve_batch_submethod(element)
          });
        }

      } else if (
        res.dismiss === Swal.DismissReason.cancel

      ) {
        this.loadingScreenService.stopLoading();
      }
    })
  }

  getPayoutInformationById(payOutInformationId) {
    const promise = new Promise((res, rej) => {
      this.payrollService.GetPayoutInformationbyId(payOutInformationId).subscribe((result) => {
        const answer: apiResult = result;
        if (answer.Status) {
          res(answer.Result)
        } else {
          res(null);
        }
      });
    })
    return promise;
  }
  do_approve_batch_submethod(element) {

    this.loadingScreenService.startLoading();
    var tempObject: any;
    this.getPayoutInformationById(element.Id).then((result) => {
      console.log('result', result);
      if (result != null) {

        tempObject = result;
        let LstPayOutDet = [];
        var PayOutInfoId = 0;
        tempObject.LstPayoutInformationDetails.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = obj.PayOutInformationId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = obj.PayPeriodId;
          childDetails.PayPeriodName = obj.PayPeriodName;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = PayOutDetailsStatus.Approved;
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.CompanyBankAccountId = obj.companybankaccountid;
          childDetails.PaymentMode = obj.PaymentMode;

          childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
          childDetails.IsLocked = false;
          childDetails.IsLockedBy = null;
          LstPayOutDet.push(childDetails)
        });

        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = tempObject.Id;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = tempObject.ClientId;
        submitobjePayOut.ClientContractId = tempObject.ClientContractId;
        submitobjePayOut.ClientName = tempObject.ClientName;
        submitobjePayOut.PayPeriodId = tempObject.PayPeriodId;
        submitobjePayOut.PayPeriodName = tempObject.PayPeriodName;
        submitobjePayOut.CompanyBankAccountId = tempObject.CompanyBankAccountId;
        submitobjePayOut.PayrunIds = [];
        tempObject.PayrunIds.forEach(ee => {
          submitobjePayOut.PayrunIds.push(ee);

        });
        submitobjePayOut.PayrunIds = _.union(submitobjePayOut.PayrunIds);

        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        // submitobjePayOut.PayrunIds = JSON.stringify(tempObject.PayrunIds)
        //  submitobjePayOut.PayrunIds = JSON.stringify(tempObject.PayrunIds);
        submitobjePayOut.RequestedBy = tempObject.RequestedBy;
        submitobjePayOut.RequesterName = tempObject.RequesterName;
        submitobjePayOut.RequestedOn = moment(tempObject.RequestedOn).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedOn = moment(tempObject.ApprovedOn).format('YYYY-MM-DD');
        submitobjePayOut.ProcessCategory = tempObject.ProcessCategory;
        submitobjePayOut.ApprovedId = tempObject.ApprovedId;
        submitobjePayOut.ApproverName = tempObject.ApproverName;
        submitobjePayOut.PayOutDate = moment(tempObject.PayOutDate).format('YYYY-MM-DD');
        submitobjePayOut.Status = PayOutStatus.Approved;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.IsLocked = false;
        submitobjePayOut.PaymentMode = tempObject.PaymentMode;
        submitobjePayOut.IsLockedBy = null;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = submitobjePayOut;
        console.log('PAYOUT MODEL : ', this.payOutModel);
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            const rep = result as apiResult
            if (rep.Status) {
              console.log('PAYOUT BATCH RESPONSE LOCK: ', rep);
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess('Payout Information updated successfully');
              this.getDataset();
              // this.close_batch();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(rep.Message)
            }
          }, err => {
            this.loadingScreenService.stopLoading();

          })

      } else {
        this.alertService.showWarning('Attention : No records found!');
        this.loadingScreenService.stopLoading();

      }
    });
  }

  confirmMarkFnF() {

    if (this.markFnf_ResignationDate == null || this.markFnf_ResignationDate == '' || this.markFnf_ResignationDate == undefined) {
      this.alertService.showWarning("Please enter resignation date")
      return;
    }
    else if (this.markFnf_LastWorkingDate == null || this.markFnf_LastWorkingDate == '' || this.markFnf_LastWorkingDate == undefined) {
      this.alertService.showWarning("Please enter last working date")
      return;
    }
    else if (moment(new Date(this.markFnf_ResignationDate)).isAfter(new Date(this.markFnf_LastWorkingDate))) {
      this.alertService.showWarning("Resignation date should be less than last working date.")
      return;
    }
    else if (this.markfnf_Reason == null || this.markfnf_Reason == '' || this.markfnf_Reason == undefined) {
      this.alertService.showWarning("Reason is required!. You need to write something!")
      return;
    } else {
      var LstmarkFandF_temp = [];
      LstmarkFandF_temp = this.selectedItems;
      this.loadingScreenService.startLoading();

      var lstEmpContract = []
      LstmarkFandF_temp.forEach(event => {
        lstEmpContract.push({
          EmployeeName: event.EmployeeName,
          EmploymentContractId: event.EmployeeContractId,
          Resignationdate: moment(new Date(this.markFnf_ResignationDate)).format('YYYY-MM-DD'),
          LWD: moment(new Date(this.markFnf_LastWorkingDate)).format('YYYY-MM-DD'),
          Reason: this.markfnf_Reason,
          DocumentId: (this.markfnf_AttachmentInfo.documentId != undefined && this.markfnf_AttachmentInfo.documentId != null) ? this.markfnf_AttachmentInfo.documentId : 0,
          DocumentName: (this.markfnf_AttachmentInfo.documentName != undefined && this.markfnf_AttachmentInfo.documentName != null) ? this.markfnf_AttachmentInfo.documentName : ''
        })

      });
      console.log('LstmarkFandF_temp ', LstmarkFandF_temp);
      console.log(lstEmpContract);
      this.employeeService.put_MarkEmploymentContractsForSeperation(JSON.stringify(lstEmpContract))
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            $('#popup_contractSeparation').modal('hide');
            this.processedEMP = apiResult.Result as any;
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            this.selectedItems = [];
            this.getDataset();
            $('#popup_chooseCategory').modal('show');
          } else {
            this.alertService.showWarning(apiResult.Message);
            this.loadingScreenService.stopLoading();
          }
        }, err => {

        })
    }
  }


  modal_dismiss_contractSeparation() {
    $('#popup_contractSeparation').modal('hide');
  }



  do_MarkFandF(index) {


    if (this.selectedItems.length > 1) {
      this.alertService.showWarning("Please select only one employee at a time of process.");
      return;
    }



    this.markFnf_LastWorkingDate = null;
    this.markFnf_ResignationDate = null;
    this.markfnf_Reason = null;
    this.markfnf_AttachmentInfo = { documentId: 0, documentName: '' }

    $('#popup_contractSeparation').modal('show');

    return;


    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-primary',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: true
    // })
    // swalWithBootstrapButtons.fire({
    //   title: 'Reason for Mark F&F',
    //   animation: false,
    //   showCancelButton: true, // There won't be any cancel button
    //   input: 'textarea',
    //   // inputValue:  result.ApproverRemarks ,
    //   inputPlaceholder: 'Type your message here...',
    //   allowEscapeKey: false,
    //   inputAttributes: {
    //     autocorrect: 'off',
    //     autocapitalize: 'on',
    //     maxlength: '120',
    //     'aria-label': 'Type your message here',
    //   },
    //   allowOutsideClick: false,
    //   inputValidator: (value) => {
    //     if (value.length >= 120) {
    //       return 'Maximum 120 characters allowed.'
    //     }
    //     if (!value) {
    //       return 'You need to write something!'
    //     }
    //   },

    // }).then((inputValue) => {
    //   if (inputValue.value) {
    //     let jsonObj = inputValue;
    //     let jsonStr = jsonObj.value;
    //     this.loadingScreenService.startLoading();
    //     var lstEmpContract = []
    //     this.selectedItems.forEach(event => {
    //       lstEmpContract.push({
    //         EmployeeName: event.EmployeeName,
    //         EmploymentContractId: event.EmployeeContractId,
    //         Reason: jsonStr
    //       })
    //     });

    //     this.employeeService.put_MarkEmploymentContractsForSeperation(JSON.stringify(lstEmpContract))
    //       .subscribe((result) => {
    //         let apiResult: apiResult = result;
    //         if (apiResult.Result) {
    //           this.processedEMP = apiResult.Result as any;
    //           this.alertService.showSuccess(apiResult.Message);
    //           this.loadingScreenService.stopLoading();
    //           this.selectedItems = [];
    //           this.getDataset();
    //           $('#popup_chooseCategory').modal('show');
    //         } else {
    //           this.alertService.showWarning(apiResult.Message);
    //           this.loadingScreenService.stopLoading();
    //         }
    //       }, err => {

    //       })

    //   } else if (
    //     /* Read more about handling dismissals below */
    //     inputValue.dismiss === Swal.DismissReason.cancel

    //   ) {
    //   }
    // });
    // [{ "EmploymentContractId": 2, "Reason": "abc" }]

  }

  onAddAttachment(files: { base64: string, filename: string }[]) {
    console.log(files);
    if (files.length > 0) {
      this.showUploadSpin = true;
      files.forEach((file: { base64: string, filename: string }) => this.doFnfAsyncUpload(file.base64, file.filename));
    }
  }

  doDeleteAttachment() {
    this.markfnf_AttachmentInfo = { documentId: 0, documentName: '' }
  }

  doFnfAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = 0;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = this.defaultSearchInputs.ClientContractId;
      objStorage.ClientId = this.defaultSearchInputs.ClientId;
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
        if (apiResult && apiResult.Status) {
          this.showUploadSpin = false
          console.log('apiResult ', apiResult);
          this.markfnf_AttachmentInfo = { documentId: apiResult.Result, documentName: filename };
          this.alertService.showSuccess('File uploaded successfully !');
        } else {
          this.showUploadSpin = false;
        }
      })
    } catch (error) {

    }
  }

  modal_dismiss2() {
    $('#popup_chooseCategory').modal('hide');
  }

  async linkForPayrun(item) {

    $('#popup_chooseCategory').modal('hide');
    this.rowDataService.dataInterface.RowData = item;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": item.PayRunId,
      "ReadOnly": false
    }];

    await this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')
  }

  /* #region  INVOICE LADING PAGE (LIST AND API ACTIONS) */
  //INVOICE LISTING SCREEN

  async do_editInvoice_SingleItem(args) {
    if (Number(args.CollectionType) != 0) {
      this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Invoice items cannot be edited because the status is in an invalid state.");
      return;
    }

    console.log('BEHAVIOUR OBJECT REC :', args);
    var object = await this.fetchInvoiceDetailsById(args.Id).then((result) => {
      console.log('object :', result);
      const modalRef = this.modalService.open(InvoiceModalComponent, this.modalOption);
      modalRef.componentInstance.objJson = JSON.stringify(result);
      modalRef.componentInstance.CoreJson = JSON.stringify({ ClientName: args.ClientName, ClientContractId: args.clientcontractId, ClientId: args.clientId });
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          console.log('RESULT OF EDITED SO DETAILS :', result);
          this.getDataset();
          this.selectedItems = [];
          // index === "PayInputs" && this.inSaleOrdersGridInstance.gridService.updateDataGridItemById(result.Id, result, true, true);
          // index === "PayOut" && this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);
        } else {
          this.getDataset();
          this.selectedItems = [];
        }
      }).catch((error) => {
        console.log(error);
      });
    });

  }

  fetchInvoiceDetailsById(Id) {
    this.loadingScreenService.startLoading();
    return new Promise((resolve, reject) => {
      this.payrollService.get_InvoiceDetailsbyId(Id)
        .subscribe((result) => {
          console.log('INVOICE RESULT :', result);
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            resolve(apiResult.Result as any);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }

        }, err => {

        })
    });
  }

  async do_PreviewInvoice_SingleItem(args) {
    console.log('OBJECT :', args);
    var object = await this.fetchInvoiceDetailsById(args.Id).then((result) => {
      this._InvoiceSliderJson = result;
      this.invoiceSliderVisible = true;
    });
  }

  previewInvoices(InvoiceId) {
    return new Promise((resolve, reject) => {
      this.payrollService.get_PreviewInvoice(InvoiceId)
        .subscribe((result) => {
          console.log('PREVIEW INVOICE RESULT :', result);
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            resolve(apiResult.Result as any);
          }

        }, err => {

        })
    });
  }
  close_invoiceSliderVisible() {
    this.invoiceSliderVisible = false;
  }

  CancelInv() {
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("At least one checkbox must be selected.");
      return;
    }
    if (this.selectedItems.filter(a => Number(a.CollectionType) != 0).length > 0) {
      this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Invoice items cannot be edited because the status is in an invalid state.");
      return;
    }

    if (this.selectedItems.filter(a => Number(a.StatusCode) != InvoiceStatus.Initiated).length > 0) {
      this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Invoice items cannot be cencelled because the status is in an invalid state.");
      return;
    }

    this.alertService.confirmSwal1("Confirmation", "Do you want to Cancel this Invoice(s)", "Yes, I want to Cancel", "No, Do it later").then((result) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Cancellation Remarks',
        animation: false,
        showCancelButton: true, // There won't be any cancel button
        input: 'textarea',
        // inputValue:  result.ApproverRemarks ,
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
          this.loadingScreenService.startLoading();
          var cancelInvoiceList = [];
          this.selectedItems.forEach(element => {
            const item = new Invoice();
            item.Status = InvoiceStatus.Voided;
            item.Id = element.Id;
            item.Remarks = inputValue.value;
            cancelInvoiceList.push(item);
          });
          this.payrollService.put_VoidInvoices(cancelInvoiceList)
            .subscribe((result) => {
              const apiResult: apiResult = result;
              if (apiResult.Status) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(apiResult.Message)
                this.selectedItems = [];
                this.getDataset();
              } else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiResult.Message)
              }

            }, err => {

            })
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });

    }).catch(error => {
    });
  }

  do_Create_Invoice() {

    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("No Sale Order have been selected from the list. Please select at least one and try again.")
      return;
    }

    if (this.selectedItems.filter(a => Number(a.StatusCode) != SaleOrderStatus.SaleOrderApproved).length > 0) {
      this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Invoice items cannot be invoiced because the status is in an invalid state.");
      return;
    }

    this.alertService.confirmSwal1("Confirmation", "Are you sure you want to create Invoice", "Yes, Confirm", "No, Do it later").then((result) => {
      this.disbaleButtonAfterClicked = true;
      this.loadingScreenService.startLoading();
      var lstOfRecords = [];
      this.selectedItems.forEach(element => {
        var so = new SaleOrder();
        so.Id = element.Id;
        so.Status = SaleOrderStatus.Invoiced;
        lstOfRecords.push(so);
      });
      this.payrollService.put_generateInvoice(lstOfRecords)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.disbaleButtonAfterClicked = false;
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            lstOfRecords = [];
            this.selectedItems = [];
            this.getDataset();
          } else {
            this.disbaleButtonAfterClicked = false;
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
            lstOfRecords = [];
          }
        }, err => {

        });

    }).catch(error => {
    });

  }
  do_previewInvoice() {

    this.loadingScreenService.startLoading();
    this.payrollService.get_PreviewInvoice(this.selectedItems[0].Id)
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          // this.commonService.openNewtab(apiResult.Result);
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, err => {

      });
  }


  preview_invoice_docs(args) {
    this.LstinvoiceDocs = args.InvoiceDocument;
    $('#popup_preview_download_docs').modal('show');
  }
  closeModal_invoice_docs() {
    this.LstinvoiceDocs = [];
    $('#popup_preview_download_docs').modal('hide');
  }
  // download_invoice(){

  //   if (this.selectedItems.length == 0) {
  //     this.alertService.showWarning("At least one checkbox must be selected.");
  //     return;
  //   }

  //   forec
  // }

  /* #endregion */


  public inputElement: HTMLInputElement;
  public inputElement1: HTMLInputElement;
  do_rolloverlog() {

    // Swal.fire({
    //   title: 'Are you sure you want to Save the Notes?',
    //   type: 'info',
    //   showCancelButton: true,
    //   confirmButtonColor: '#3085d6',
    //   cancelButtonColor: '#d33',
    //   confirmButtonText: 'Yes'
    // }).then((result) => {


    // });



    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("No Contract have been selected from the list. Please select at least one and try again.")
      return;
    }

    if (this.selectedItems.filter(a => a.IsValid == false).length > 0) {
      var invalidStack = [];
      this.selectedItems.forEach(function (item) { if (item.IsValid == false) { invalidStack.push(item.TeamCode) } });
      this.alertService.showWarning(`An error has occurred while attempting to save your changes. One or more Contract items cannot be Initiated because the status is in an invalid state.  ${invalidStack.join(', ')}`);
      return;
    }

    this.alertService.confirmSwal1("Are you sure you want to rollover the following items, and all of their employees?", "WARNING: This will be remove all usage history currently recorded and cannot be undone. ", "Yes, Confirm", "No, Cancel").then((result) => {

      Swal.fire({
        title: "Please type the word '" + environment.environment.RollOverText + "' in all caps below to confirm",
        html: "<div class='b'></div><input id='swal-input2' class='swal2-input' required/><div class='b'><label>Remarks</label></div><textarea class='form-control' rows='2' placeholder='Type your message here...' style='margin-bottom:5px !important' spellcheck='false'id='swal-textarea'></textarea>",
        confirmButtonText: 'Confirm',
        cancelButtonText: 'Cancel',
        allowEscapeKey: false,
        showCancelButton: true,
        preConfirm: () => {
          this.inputElement = document.getElementById('swal-input2') as HTMLInputElement
          this.inputElement1 = document.getElementById('swal-textarea') as HTMLInputElement

          if ((this.inputElement.value == "") || (this.inputElement.value == '') || ((this.inputElement.value == null))) {
            Swal.showValidationMessage(
              `Confirm word is a required field`
            )
          }
          if ((this.inputElement.value != environment.environment.RollOverText)) {
            Swal.showValidationMessage(
              `Confirm word is not valid`
            )
          }

          else if (this.inputElement1.value.length >= 120) {
            Swal.showValidationMessage(
              `Maximum 120 characters allowed.`
            )

          } else if ((this.inputElement1.value == "") || (this.inputElement1.value == '') || ((this.inputElement1.value == null))) {
            Swal.showValidationMessage(
              `Remarks is required. You need to write something!`
            )

          }
        }
      }).then((result) => {

        if (result.value) {
          this.loadingScreenService.startLoading();
          const jobj = new RollOverlog();
          jobj.ClientId = this.selectedItems != null && this.selectedItems.length > 0 ? this.selectedItems[0].ClientId : 0;
          jobj.ClientContractIds = [];
          this.selectedItems.forEach(function (item) { jobj.ClientContractIds.push(item.ClientContractId) });
          jobj.Remarks = this.inputElement1.value;
          this.payrollService.put_ContractRollOver(jobj)
            .subscribe((result) => {
              const apiResult: apiResult = result;
              if (apiResult.Status) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(apiResult.Message);
                this.selectedItems = [];
                this.getDataset();
              } else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiResult.Message);
              }
            })
        } else if (
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });

    }).catch(error => {
    });
  }



  // INITIATE PAYOUT
  async do_initiate_Payout() {
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("No Sale Order have been selected from the list. Please select at least one and try again.")
      return;
    }
    if (this.code == 'SaleOrders' && this.selectedItems.filter(a => Number(a.StatusCode) < SaleOrderStatus.SaleOrderApproved).length > 0) {
      this.alertService.showWarning("An error has occurred while attempting to save your changes. One or more Sale Order items cannot be Initiated because the status is in an invalid state.");
      return;
    }

    let processCategory = this.selectedItems[0].ProcessCategory;
    if (this.selectedItems.filter(a => a.ProcessCategory !== processCategory).length > 0) {
      this.alertService.showWarning("2 or more different Processes can not be combined. Please choose Sale Orders with same Process");
      return;
    }

    if (this.code == 'SaleOrders') {

      let PayrunIds = [];
      this.selectedItems.forEach(element => {
        PayrunIds.push(element.PayRunId)
      });
      console.log('selectedItems', this.selectedItems);
      var dupPayRunId = _.union(PayrunIds);
      var PayRunId = (dupPayRunId).join(",");

      sessionStorage.removeItem("PayRunIds");
      sessionStorage.setItem("PayRunIds", PayRunId);

      console.log('PayRunId', PayRunId);

      this.rowDataService.dataInterface.RowData = this.selectedItems[0];
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayRunIds",
        "OutputFieldName": "@PayRunIds",
        "Value": PayRunId,
        "ReadOnly": false,
      }];
      this.sessionService.delSessionStorage('SO_Navigation_URL');
      this.sessionService.setSesstionStorage('SO_Navigation_URL', 'SaleOrder');
      await this.router.navigateByUrl('app/payroll/payrolltransaction/initiatePayOut');

      return;
    }
    else if (this.code == 'rejectedPayout') {
      let PayoutIds = [];
      this.selectedItems.forEach(element => {
        PayoutIds.push(element.batchId)
      });
      console.log('selectedItems', this.selectedItems);
      var dupPayOutId = _.union(PayoutIds);
      var PayOutId = (dupPayOutId).join(",");

      sessionStorage.removeItem("PayOutIds");
      sessionStorage.setItem("PayOutIds", PayOutId);

      console.log('PayOutId', PayOutId);

      this.rowDataService.dataInterface.RowData = this.selectedItems[0];
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayOutIds",
        "OutputFieldName": "@PayOutIds",
        "Value": PayOutId,
        "ReadOnly": false
      }];
      await this.router.navigateByUrl('app/payroll/payrolltransaction/reinitiatePayOut');

      return;
    }


    return;

    this.disbaleButtonAfterClicked = true;
    let LstPayOutDet = [];
    let count = 0;
    // await this.selectedItems.forEach(parentobj => 
    for (let parentobj of this.selectedItems) {
      count = count + 1;
      var currentDate = new Date();
      if (parentobj.EmpBankDetails.length == 0) {
        this.disbaleButtonAfterClicked = false;
        this.alertService.showWarning(`SO# ${parentobj.Number} : ` + "There are no employee in the Sale Order you have chosen or Payout has already been intiated.")
        return;
      }
      console.log("Loop didnt break");
      this.disbaleButtonAfterClicked = true;
      this.loadingScreenService.startLoading();
      if (parentobj.EmpBankDetails.length > 0) {
        parentobj.EmpBankDetails.forEach(obj => {

          var childDetails = new PayoutInformationDetails();
          childDetails.Id = 0;
          childDetails.PayoutInformationId = 0;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = parentobj.payperiodId
          childDetails.PayPeriodName = parentobj.PayPeriod;
          childDetails.Narration = "";
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = false
          childDetails.Status = PayOutDetailsStatus.Initiated;
          childDetails.IsPaymentHold = false;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          LstPayOutDet.push(childDetails);
        });
      }
    };

    let submitobjePayOut = new PayoutInformation();
    submitobjePayOut.Id = 0;
    submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
    submitobjePayOut.ClientId = this.selectedItems[0].clientId;
    submitobjePayOut.ClientContractId = this.selectedItems[0].clientcontractId;
    submitobjePayOut.ClientName = this.selectedItems[0].ClientName
    submitobjePayOut.PayPeriodId = this.selectedItems[0].payperiodId;
    submitobjePayOut.PayPeriodName = this.selectedItems[0].PayPeriod;
    submitobjePayOut.PayrunIds = [];
    this.selectedItems.forEach(function (item) { submitobjePayOut.PayrunIds.push(item.PayRunId) });
    submitobjePayOut.RequestedBy = this.UserId;
    submitobjePayOut.RequesterName = this.PersonName;
    submitobjePayOut.RequestedOn = moment(currentDate).format('YYYY-MM-DD');
    submitobjePayOut.ApprovedId = '';
    submitobjePayOut.ApproverName = '';
    submitobjePayOut.PayOutDate = moment(currentDate).format('YYYY-MM-DD');;
    submitobjePayOut.Status = PayOutStatus.Initiated;
    submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;

    submitobjePayOut.ProcessCategory = this.selectedItems[0].ProcessCategory;

    this.payOutModel = _PayOutModel;
    this.payOutModel.NewDetails = submitobjePayOut;
    this.payOutModel.OldDetails = {};

    console.log('PAYOUT MODEL : ', this.payOutModel);


    if (JSON.stringify(this.payOutModel) != JSON.stringify({})) {
      console.log('count', count);
      console.log('count 2', this.selectedItems.length);

      if (count == this.selectedItems.length) {
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            console.log('UPSERT PAY OUT RESPONSE:: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {
              this.loadingScreenService.stopLoading();
              this.disbaleButtonAfterClicked = false;
              this.alertService.showSuccess(apiResult.Message);
              this.onClickPayOut(apiResult.Result)
              this.selectedItems = [];
              this.getDataset();
            } else {
              this.selectedItems = [];
              this.getDataset();
              this.loadingScreenService.stopLoading();
              this.disbaleButtonAfterClicked = false;
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });
      }
    }


  }

  callExternalAPI_pfChallan() {
    var clientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID').Value;
    var month = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@MONTH').Value;
    var year = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@YEAR').Value;
    if (clientId == null || month == null || year == null) {
      this.loadingScreenService.stopLoading();
      this.isBtnDisabledRequired = false;
      this.alertService.showWarning('An entry must be entered or has an invalid value.  Please correct and give it another try.');
      return;
    }
    this.payrollService.GetPFChallanReport(clientId, month, year).subscribe((response) => {
      console.log('tax response', response);
      const apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result) {
        this.isBtnDisabledRequired = false;
        var dynoFileName = `PFChallanReport`;
        this.downloadService.base64ToZip(apiResult.Result, dynoFileName);
        this.loadingScreenService.stopLoading();
      } else {
        this.isBtnDisabledRequired = false;
        this.alertService.showWarning(apiResult.Message)
        this.loadingScreenService.stopLoading();
      }
    })
  }

  async onClickPayOut(rowData) {
    console.log('rowData', rowData);
    var rowData1 = {
      ClientName: rowData.ClientName,
      ContractCode: "",
      EmployeeCount: 0,
      Id: rowData.Id,
      PayOutDate: rowData.PayOutDate,
      PayPeriod: rowData.PayPeriodName,
      RequestedOn: rowData.RequestedOn,
      Status: rowData.Status,
      StatusCode: rowData.Status,
      clientId: rowData.ClientId,
      clientcontractId: rowData.ClientContractId,
      payperiodId: rowData.PayPeriodId
    }

    this.rowDataService.dataInterface.RowData = rowData1;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayOutIds",
      "OutputFieldName": "@PayOutIds",
      "Value": rowData1.Id.toString(),
      "ReadOnly": false
    }];
    await this.router.navigateByUrl('app/payroll/payrolltransaction/PayOut_Edit')
  }


  callExternalAPI() {
    var clientContractId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@clientcontractId').Value;
    var payperiodId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@payperiodId').Value;
    if (clientContractId == null || payperiodId == null) {
      this.loadingScreenService.stopLoading();
      this.isBtnDisabledRequired = false;
      this.alertService.showWarning('An entry must be entered or has an invalid value.  Please correct and give it another try.');
      return;
    }

    this.payrollService.GetTaxComputationDetails(clientContractId, payperiodId).subscribe((response) => {
      console.log('tax response', response);
      const apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result) {
        var dynoFileName = `TaxComputation`;
        this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
        this.isBtnDisabledRequired = false;
        this.loadingScreenService.stopLoading();
      } else {
        this.alertService.showWarning(apiResult.Message);
        this.isBtnDisabledRequired = false;
        this.loadingScreenService.stopLoading();
      }
    })

  }

  callExternalAPI_TaxCompByMonthYear() {
    var clientContractId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTCONTRACTID').Value;
    var month = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@MONTH').Value;
    var year = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@YEAR').Value;

    if (clientContractId == null || month == null || year == null) {

      this.loadingScreenService.stopLoading();
      this.isBtnDisabledRequired = false;
      this.alertService.showWarning('An entry must be entered or has an invalid value.  Please correct and give it another try.');
      return;
    }

    this.payrollService.GetTaxComputationDetailsbyMonthYear(clientContractId, month, year).subscribe((response) => {
      console.log('tax month year response', response);
      const apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result) {
        var dynoFileName = `TaxComputationByMonthYear`;
        this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
        this.isBtnDisabledRequired = false;
        this.loadingScreenService.stopLoading();
      } else {
        this.alertService.showWarning(apiResult.Message)
        this.isBtnDisabledRequired = false;
        this.loadingScreenService.stopLoading();
      }
    })

  }

  DownloadExternalExcel(dataset) {
    var dynoFileName = `${this.code}`;
    let dataForExcel = [];
    dataset.forEach((row: any) => {
      dataForExcel.push(Object.values(row))
    })
    try {


      var length = dataset.sort((a, b) => b.length - a.length);
      console.log(Object.keys(length[0]))


      let reportData = {
        title: dynoFileName,
        data: dataForExcel,
        headers: (Object.keys(length[0]))
      }
      this.excelService.exportExcel_UI(reportData);
      this.isBtnDisabledRequired = false;
      this.loadingScreenService.stopLoading();
    } catch (error) {
      this.isBtnDisabledRequired = false;
      this.loadingScreenService.stopLoading();

    }

  }

  callExternalAPI_TaxCompByFiscalYear() {
    var clientContractId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTCONTRACTID').Value;
    var finyearId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@FINANCIALYEARID').Value;
    if (clientContractId == null || finyearId == null) {
      this.loadingScreenService.stopLoading();
      this.isBtnDisabledRequired = false;
      this.alertService.showWarning('An entry must be entered or has an invalid value.  Please correct and give it another try.');
      return;
    }

    this.payrollService.GetTaxComputationDetailsbyFiscalYear(clientContractId, finyearId).subscribe((response) => {
      console.log('tax response', response);
      const apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result) {
        this.isBtnDisabledRequired = false;
        var dynoFileName = `TaxComputationByFiscalYear`;
        this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
        this.loadingScreenService.stopLoading();
      } else {
        this.isBtnDisabledRequired = false;
        this.alertService.showWarning(apiResult.Message)
        this.loadingScreenService.stopLoading();
      }
    })

  }

  // getMonthName = function(date, fullName){
  // 	var monthName = this.months[date.getMonth()]
  // 	return fullName ? monthName : monthName.substring(0, 3);
  // }

  callExternalAPI_PaySheet() {
    var clientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@clientId').Value;
    var clientContractId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@ClientContractId').Value;
    var month = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@month').Value;
    var year = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@year').Value;
    if (clientContractId == null || clientId == null || month == null || year == null) {
      this.loadingScreenService.stopLoading();
      this.isBtnDisabledRequired = true;
      this.alertService.showWarning('An entry must be entered or has an invalid value.  Please correct and give it another try.');
      return;
    }

    this.payrollService.GetMonthlyPayrollData(clientId, clientContractId, month, year).subscribe((response) => {
      const apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result) {
        this.isBtnDisabledRequired = false;
        var dynoFileName = `Paysheet for the month of ${this.months[(month - 1)]}_${year}`;
        this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
        this.loadingScreenService.stopLoading();
      } else {
        this.isBtnDisabledRequired = false;
        this.loadingScreenService.stopLoading();
      }
    })

  }

  downloadFiles() {
    if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
      this.alertService.showInfo("Please select a record");
      return;
    }

    let documentIds: number[] = [];

    for (let row of this.selectedItems) {
      if (row.DocumentId != undefined && row.DocumentId != null) {
        documentIds.push(row.DocumentId);
      }

    }

    // this.downloadService.downloadFiles(documentIds);

    this.downloadService.downloadFilesInZip(documentIds, this.code);

  }

  do_Refresh() {
    // this.route.paramMap.subscribe((params: ParamMap) => {
    //   this.code = params.get('code')
    this.getDataset();
    // })
  }


  routertest() {
    this.router.navigate(["/app/ess/profile"]);
  }

  // addNewTeam() {

  //   this.rowDataService.dataInterface = {
  //     SearchElementValuesList: [],
  //     RowData: null
  //   }

  //   this.router.navigate(["app/forms/form/Team"]);
  // }

  // addNewCostCode() {
  //   this.rowDataService.dataInterface = {
  //     SearchElementValuesList: [],
  //     RowData: null
  //   }

  //   this.router.navigate(["app/forms/form/CostCode"]);
  // }

  /* #region  ONLINE LEAVE REQUEST REGULARIZATION FOR HR/MANAGER */

  reviseLeaveRequest() {
    console.log('object :', result);
    const modalRef = this.modalService.open(LeaveregularizeComponent, this.modalOption);
    modalRef.componentInstance.rowData = JSON.stringify(this.selectedItems[0]);
    modalRef.componentInstance.isReviseRequest = true;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.do_Refresh();
        console.log('RESULT OF EDITED SO DETAILS :', result);
      } else {
        this.do_Refresh();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  onClickRegularize(rowData) {

    console.log('object :', result);
    const modalRef = this.modalService.open(LeaveregularizeComponent, this.modalOption);
    modalRef.componentInstance.rowData = JSON.stringify(rowData);
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.do_Refresh();
        console.log('RESULT OF EDITED SO DETAILS :', result);
      } else {
        this.do_Refresh();
      }
    }).catch((error) => {
      console.log(error);
    });

  }
  onClickPreviewInvestment(rowData) {
    console.log('rowdata', rowData);;
    const drawerRef = this.drawerService.create<InvestmentpreviewComponent, { employeeId: number, finId: number, clientId: number }, string>({
      nzTitle: 'IT Declarations',
      nzContent: InvestmentpreviewComponent,
      nzWidth: 1250,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        employeeId: rowData.Id,
        finId: 3,
        clientId: rowData.ClientId
      }
    });

    drawerRef.afterOpen.subscribe(() => {
    });

    drawerRef.afterClose.subscribe(data => {

      var modalResult = (data) as any;
      if (data != undefined) {

      }

    });
  }
  bulk_approve_reject(whichaction) {

    if (this.selectedItems.filter(a => a.Status != 100).length > 0) {
      this.alertService.showWarning('Leave request cannot be processed as it has already been approved/rejected.')
      return;
    }
    this.common_approve_reject('Multiple', whichaction, '');
  }

  common_approve_reject(_index, whichaction, item) {
    let actionName = whichaction == true ? 'Approve' : "Reject";

    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      if (!whichaction) {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })
        swalWithBootstrapButtons.fire({
          title: 'Rejection Comments',
          animation: false,
          showCancelButton: true, // There won't be any cancel button
          input: 'textarea',
          inputValue: '',
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
            this.callMultipleFuction(whichaction, jsonStr);

          } else if (

            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }
      else {
        this.callMultipleFuction(whichaction, '');
      }

    }).catch(error => {
      this.selectedItems.length = 0;
    });
  }

  // callMultipleFuction(whichaction, jsonStr) {

  //   this.loadingScreenService.startLoading();
  //   let count = 0;
  //   this.selectedItems.length > 0 && this.selectedItems.forEach(item => {
  //     count = count + 1;
  //     this.Bulk_validateEAR(item, '', whichaction, 'Multiple')

  //   });

  //   if (count == this.selectedItems.length) {
  //     this.do_Refresh();
  //   }

  // }

  callMultipleFuction(whichAction: string, jsonStr: string): void {
    this.loadingScreenService.startLoading();

    if (this.selectedItems.length === 0) {
      this.loadingScreenService.stopLoading();
      return;
    }

    let count = 0;
    this.selectedItems.forEach(item => {
      count++;
      this.Bulk_validateEAR(item, '', whichAction, 'Multiple');
    });

    setTimeout(() => {
      if (count == this.selectedItems.length) {
        this.do_Refresh();
      }
    }, 2000);

  }


  Bulk_validateEAR(item, jstring, whichaction, index) {
    this.loadingScreenService.startLoading();
    let currentDate = new Date();
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = whichaction == false ? 0 : item.CalculatedAppliedUnits;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(item.AppliedOn).format('YYYY-MM-DD');;
    entitlementAvailmentRequest.ValidatedOn = moment(item.currentDate).format('YYYY-MM-DD');
    entitlementAvailmentRequest.ValidatedBy = this.UserId;
    entitlementAvailmentRequest.ApplierRemarks = item.ApplierRemarks;
    entitlementAvailmentRequest.CancellationRemarks = whichaction == false ? jstring : '';
    entitlementAvailmentRequest.ValidatorRemarks = whichaction == false ? '' : jstring;
    entitlementAvailmentRequest.Status = whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved;
    entitlementAvailmentRequest.AppliedBy = item.AppliedBy;
    entitlementAvailmentRequest.CalculatedAppliedUnits = item.CalculatedAppliedUnits;
    entitlementAvailmentRequest.AppliedUnits = item.AppliedUnits;
    entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
    entitlementAvailmentRequest.Id = item.Id;
    entitlementAvailmentRequest.EmployeeId = item.EmployeeId;
    entitlementAvailmentRequest.EmployeeEntitlementId = item.EmployeeEntitlementId;
    entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
    entitlementAvailmentRequest.EntitlementId = item.EntitlementId;
    entitlementAvailmentRequest.EntitlementDefinitionId = item.EntitlementDefinitionId;
    entitlementAvailmentRequest.EntitlementMappingId = item.EntitlementMappingId;
    entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
    entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
    entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
    entitlementAvailmentRequest.AppliedFrom = moment(new Date(item.AppliedFrom)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedFromSecondHalf = item.IsAppliedFromSecondHalf;
    entitlementAvailmentRequest.IsAppliedForFirstHalf = item.IsAppliedForFirstHalf;
    entitlementAvailmentRequest.AppliedTill = moment(new Date(item.AppliedTill)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedTillFirstHalf = item.IsAppliedTillFirstHalf;
    entitlementAvailmentRequest.ActivityList = [];
    entitlementAvailmentRequest.PendingAtUserId = item.AppliedBy;
    entitlementAvailmentRequest.ValidatedUserName = this.PersonName;
    entitlementAvailmentRequest.LastUpdatedOn = item.LastUpdatedOn; // moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    console.log('ENTILMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);
    this.attendanceService.ValidateEntitlementAvailmentRequest(entitlementAvailmentRequest).
      subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          whichaction == false ? null : this.callback_upsertAttendance(entitlementAvailmentRequest);
          this.alertService.showSuccess(apiResult.Message);
        } else {
          this.alertService.showWarning(apiResult.Message);
        }
        this.loadingScreenService.stopLoading();

      }, err => {
        this.loadingScreenService.stopLoading();

      })
  }


  enumerateDaysBetweenDates(startDate, endDate) {
    const promise = new Promise((resolve, reject) => {
      let date = [];
      while (moment(startDate) <= moment(endDate)) {
        const weekEndDays = new Date(startDate);
        // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {     
        // }
        date.push(
          {
            _startDate: startDate,
            _endDate: startDate,
            _IsFirstDayHalf: false,
            _IsSecondDayHalf: false,
          });
        startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
        // }
      }
      return resolve(date);

    })
    return promise;
  }



  callback_upsertAttendance(entitlementAvailmentRequest) {
    const promise = new Promise((resolve, reject) => {
      this.enumerateDaysBetweenDates(entitlementAvailmentRequest.AppliedFrom, entitlementAvailmentRequest.AppliedTill).then((result) => {
        let daterangeList = [];
        let attendanceList = [];
        daterangeList = result as any;
        console.log(' BUILD RESULT ::', daterangeList);

        daterangeList.forEach(element => {
          let attendance = new Attendance();
          attendance.Id = 0;
          attendance.TimeCardId = 0;
          attendance.FromDate = moment(element._startDate).format('YYYY-MM-DD'); // moment(new Date(element._startDate)).format('YYYY-DD-MM')
          attendance.ToDate = moment(element._endDate).format('YYYY-MM-DD');// moment(new Date(element._endDate)).format('YYYY-DD-MM')
          attendance.NumberOfDays = 1
          attendance.NumberOfHours = 0
          attendance.IsFirstDayHalf = false
          attendance.IsSecondDayHalf = false
          attendance.Type = this.attendanceTypeList.find(a => a.id == entitlementAvailmentRequest.EntitlementId).name; // AttendanceType.SL;
          attendance.ReferencedTimeCardId = 0
          attendance.Modetype = UIMode.Edit;
          attendance.EmployeeId = entitlementAvailmentRequest.EmployeeId;
          attendance.AttendancePeriodId = entitlementAvailmentRequest.ApplicableAttendancePeriodId;
          attendanceList.push(attendance)
        });

        let lstIndex = attendanceList.length;

        if (entitlementAvailmentRequest.IsApprovedForFirstHalf == true) {
          attendanceList[0].IsFirstHalf = true;
        }
        if (entitlementAvailmentRequest.IsApprovedFromSecondHalf == true) {
          attendanceList[0].IsSecondDayHalf = true;
        }
        if (entitlementAvailmentRequest.IsApprovedTillFirstHalf == true) {
          attendanceList[lstIndex].IsFirstHalf = true;
        }
        if (entitlementAvailmentRequest.IsApprovedTillSecondHalf == true) {
          attendanceList[lstIndex].IsSecondDayHalf = true;
        }

        console.log('Attendance ::', attendanceList);

        this.attendanceService.UpsertTimecardAttendance(attendanceList).
          subscribe((result) => {
            let apiResult: apiResult = result;
            resolve(true);
            if (apiResult.Status) {
              // this.alertService.showSuccess(apiResult.Message);
            } else {
              // this.alertService.showWarning(apiResult.Message);
            }
            this.loadingScreenService.stopLoading();
            // index != 'Multiple' ? this.close_leaverequest_approval_slider() : null;
            // index != 'Multiple' ? this.onRefresh() : null;

          }, err => {
            this.loadingScreenService.stopLoading();

          })
      });
    })
    return promise;
  }
  /* #endregion */

  sendMail() {
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning('Select at least one record to proceed.');
      return;
    }
    this.loadingScreenService.startLoading();
    let empObj = [];
    this.selectedItems.forEach(element => {
      empObj.push({
        Id: element.Id,
        EmployeeCode: element.EmployeeCode
      });
    });
    this.employeeService.SendLoginCredentials(JSON.stringify(empObj))
      .subscribe((result) => {
        let apiResult: apiResult = result
        this.loadingScreenService.stopLoading();
        apiResult.Status == true ? apiResult.Message == "The e - mail has been sent successfully." ? this.alertService.showSuccess(apiResult.Message) : this.alertService.showInfo(apiResult.Message) : this.alertService.showInfo(apiResult.Message);
      })
  }


  /* #region  Leave | Entitlement Master */
  createNewEntitlement() {
    this.router.navigate(['app/forms/form/entitlement'])
  }
  createNewEmpEntitlement() {
    this.router.navigate(['app/forms/form/employeeentitlement'])
  }
  createNewAttendanceConfiguration() {
    this.router.navigate(['app/forms/form/attendanceConfiguration'])

  }
  /* #endregion */



  /* #region  ATTENDANCE BULK */
  do_view_attendance_request() {
    var IsProxy = (this.selectedItems[0].ManagerId == this.UserId ? false : true) as any;
    sessionStorage.setItem('isattendance_redirection', "true");
    sessionStorage.removeItem('IsProxy');
    sessionStorage.setItem('IsProxy', IsProxy);
    this.router.navigate(['app/attendance/attendanceentries'], {
      queryParams: {
        "Idx": btoa(this.selectedItems[0].TeamId),
        "Mdx": btoa(this.selectedItems[0].ManagerId),
        "IsBulk": btoa('false').toString(),
      }
    });
  }
  /* #endregion */

  /* #region  Leave BULK */
  do_view_leave_request() {
    if (this.selectedItems[0].EmployeeCount <= 0) {
      this.alertService.showWarning("No employee data available to this manager. There isn't any data for the manager selected to view.")
      return;
    }

    var IsProxy = (this.selectedItems[0].ManagerId == this.UserId ? false : true) as any;
    sessionStorage.setItem('isattendance_redirection', "true");
    sessionStorage.removeItem('IsProxy');
    sessionStorage.setItem('IsProxy', IsProxy);
    this.router.navigate(['app/leaves/teamleaveentries'], {
      queryParams: {
        "Idx": btoa(this.selectedItems[0].UserId),
      }
    });
  }
  /* #endregion */


  /* #region  attendance approve and reject */
  bulk_approve_attendance_reject(whichaction) {

    if (this.selectedItems.length == 0) {
      this.alertService.showWarning('Note : Select a minimum of one record to continue.');
      return;
    }

    if (this.selectedItems.filter(z => z.IsSubmitted == 1).length > 0) {
      this.alertService.showWarning('Note : one or more records have been submitted');
      return;
    }

    this.selectedItems[0].IsSubmitted
    let invalidEmployees = [];
    this.selectedItems.forEach(x => {
      if (x.EmployeeAttendanceBreakUpDetails == null) {
        invalidEmployees.push(x.EmployeeCode);
      }
    });
    if (this.selectedItems.length > 0 && this.selectedItems.filter(z => z.EmployeeAttendanceBreakUpDetails == null).length > 0) {

      this.alertService.showInfo(`One of the employees has no details regarding the attendance breakdown... Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      return;
    }

    let actionName = whichaction == true ? 'Approve' : "Reject";

    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: `${actionName} Comments`,
        animation: false,
        showCancelButton: true, // There won't be any cancel button
        input: 'textarea',
        inputValue: '',
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


          let LstEmployeeBreakupDetails = [];
          this.loadingScreenService.startLoading();
          this.selectedItems.forEach(element => {
            if (element.EmployeeAttendanceBreakUpDetails != null && element.EmployeeAttendanceBreakUpDetails.length > 0) {
              element.EmployeeAttendanceBreakUpDetails.forEach(item => {
                if (item.EmployeeAttendancePunchInDetails != null && item.EmployeeAttendancePunchInDetails.length > 0) {
                  item.EmployeeAttendancePunchInDetails.forEach(subitem => {
                    subitem.ApproverRemarks = jsonStr;
                    subitem.ApprovedHours = subitem.SubmittedHours.toFixed(2);
                  });
                }
                item.Status = whichaction == true ? AttendanceBreakUpDetailsStatus.ManagerApproved : AttendanceBreakUpDetailsStatus.ManagerRejected;
                item.TotalApprovedHours = item.TotalSubmittedHours.toFixed(2);
                item.ApproverRemarks = jsonStr;
                LstEmployeeBreakupDetails.push(item);

              });
            }

          });


          let submitAttendanceUIModel = new SubmitAttendanceUIModel();
          submitAttendanceUIModel.LstEmployeeAttendanceBreakUpDetails = LstEmployeeBreakupDetails;
          submitAttendanceUIModel.ModuleProcessAction = EmployeeAttendancModuleProcessStatus.ManagerSubmitAttendance;
          submitAttendanceUIModel.Role = {
            IsCompanyHierarchy: false,
            RoleId: this.RoleId
          }

          this.attendanceService.SubmitEmployeeAttendanceBreakUpDetails(submitAttendanceUIModel)
            .subscribe((result) => {
              console.log(result);
              let apiresult: apiResult = result;
              if (apiresult.Status) {
                this.loadingScreenService.stopLoading();
                // this.alertService.showSuccess(apiresult.Message);       
              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiresult.Message);
              }

            })



        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {

        }
      })


    }).catch(error => {

    });


  }

  viewAttendanceBreakupRequest() {
    var object = null;
    object = JSON.stringify({
      EmployeeId: this.selectedItems[0].EmployeeId,
      EmployeeName: this.selectedItems[0].EmployeeName,
      EmployeeCode: this.selectedItems[0].EmployeeCode,
      DOJ: this.selectedItems[0].DOJ,
    })
    this.openDrawer(object);


  }
  openDrawer(chosenEmployeeObject) {
    const drawerRef = this.drawerService.create<EmployeebulkattendanceModalComponent, { chosenEmployeeObject: any, AttendancePeriodId: any, RoleId: any, IsSubmitted: any }, string>({
      nzTitle: 'Regularize : Employee Attendance Review',
      nzContent: EmployeebulkattendanceModalComponent,
      nzWidth: 740,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {

        chosenEmployeeObject: JSON.parse(chosenEmployeeObject),
        AttendancePeriodId: this.selectedItems[0].EmployeeAttendanceBreakUpDetails[0].AttendancePeriodId,
        RoleId: this.RoleId,
        IsSubmitted: this.selectedItems[0].IsSubmitted
      }
    });

    drawerRef.afterOpen.subscribe(() => {
    });

    drawerRef.afterClose.subscribe(data => {

      var modalResult = (data) as any;
      console.log('data', data);

      if (data != undefined) {

      }

    });
  }
  /*Block Employee*/
  EmployeeBlockClickFn(sitems) {
    debugger;
    this.genericMasterType = 10;
    this.clientcontractService.GetAllGenericMasterData().subscribe((result) => {
      if (result) {
        this.lstBlockItems = result.filter(a => a.GenericMasterTypeId == this.genericMasterType);
        $('#popup_Block_Employee').modal('show');
      }

    });

  }
  /*send an email */
  sendAnEmail(sitems) {
    //debugger;
    $('#popup_email').modal('show');
    this.employeedetails = sitems[0];
    //this.documentFileName = null;
    //this.unsavedDocumentLst = null;
    this.noOfAttachments = environment.environment.NoOfAttachmentsSendMail;
    for (var i in this.noOfAttachments) {
      this.noOfAttachments[i].documentFileName = null;
      this.noOfAttachments[i].Id = null;
    }
    //this.RevisionForm.controls.bodyValue.setValue('Dear &lt;EmployeeName&gt;,');
  }
  /*change shift fn*/
  ChangeShiftFn(sitem) {
    if (sitem.length == 1) {
      this.router.navigate(['app/masters/shiftmapping'], {
        queryParams: {
          "dtls": btoa(JSON.stringify(sitem)),
        }
      });
    }
    else {
      this.alertService.showWarning("Please select one employee only");
    }
  }

  /*send an email for missed documents*/
  sendMissdDocAnEmail(items) {
    //debugger;
    $('#popup_email').modal('show');
    this.employeedetails = items[0];
    // items.forEach(ele => {
    //   this.ccmailtags.push(ele.EMail);
    // })

  }
  closeEmailPopup() {
    //debugger;
    // if (this.unsavedDocumentLst && this.unsavedDocumentLst[0] && this.unsavedDocumentLst[0].Id) {
    //   this.doDeleteFile(this.noOfAttachments);
    // }
    for (var i in this.noOfAttachments) {
      if (this.noOfAttachments[i].Id) {
        //this.doDeleteFile(this.noOfAttachments[i]);
        this.deleteAsync(this.noOfAttachments[i]);
      }
    }
    this.RevisionForm.controls.subject.setValue('');
    this.RevisionForm.controls.bodyValue.setValue('');
    this.RevisionForm.controls.emailList.setValue('');
    this.ccmailtags = [];
    this.noOfAttachments = JSON.parse(JSON.stringify(environment.environment.NoOfAttachmentsSendMail));
    $('#popup_email').modal('hide');
  }
  submtMailBtnEnable() {
    // if (this.RevisionForm.controls.subject.value.length > 0 && this.RevisionForm.controls.bodyValue.value.length > 0 && this.ccmailtags.length > 0) {
    //   return false;
    // }
    if (this.RevisionForm.controls.subject.value.length > 0 && this.RevisionForm.controls.bodyValue.value.length > 0) {
      return false;
    }
    else {
      return true;
    }
  }
  onClickSendMailFn() {
    //debugger;
    this.Mailbodyvalue = null;
    this.Mailbodyvalue = this.RevisionForm.controls.bodyValue.value;
    if (this.code == 'employeeMissingDoc') {
      //this.Mailbodyvalue += `</div><div><br><table style="border: 1px solid black;border-collapse: collapse;width: 100%;"><thead><tr><th style="border: 1px solid black; border-collapse: collapse; text-align: center;">PAN</th><th style="border: 1px solid black; border-collapse: collapse;text-align: center;">UAN</th><th style="border: 1px solid black; border-collapse: collapse;text-align: center;">BANK</th><th style=" border: 1px solid black; border-collapse: collapse;text-align: center;">NOMINEE</th><th style=" border: 1px solid black; border-collapse: collapse;text-align: center;">AADHAR</th></tr></thead><tbody><tr><td style=" border: 1px solid black; border-collapse: collapse; text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;"><span contenteditable="false" style=" border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;">~~PAN~~</span></div></td><td style="border: 1px solid black; border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;"><span contenteditable="false" style=" border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;">~~UAN~~</span></div></td><td style="    border: 1px solid black;    border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;"><span contenteditable="false" style="border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;">~~BANK~~</span></div></td><td style=" border: 1px solid black; border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;"><span contenteditable="false" style=" border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;">~~Nominee~~</span></div></td><td style=" border: 1px solid black;    border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;"><span contenteditable="false" style=" border-style: solid;border-width: thin;border-color: #b9b9b9;padding-left: 5px;padding-right: 5px;padding-top: 2px;padding-bottom: 2px;border-radius: 15px;margin-left: 0px;margin-right: 2px;background-color: lightcyan;">~~Aadhaar~~</span></div></td></tr></tbody></table><br></div>`;
      var BodyArr = [];
      var inputparms = {
        Subject: this.RevisionForm.controls.subject.value,
        Body: '',
        CCMailIds: this.ccmailtags,
        PersonDetails: {},
        AttachmentList: []
      }
      for (var j in this.noOfAttachments) {
        var obj1 = {
          Name: this.noOfAttachments[j].documentFileName,
          DocumentId: this.noOfAttachments[j].Id
        }
        if (this.noOfAttachments[j].Id) {
          inputparms.AttachmentList.push(obj1);
          obj1 = null;
        }
      }
      for (var i in this.selectedItems) {
        var obj = {
          EmailId: this.selectedItems[i].EmailId || this.selectedItems[i].EMail || '',
          Name: this.selectedItems[i].EmployeeName || this.selectedItems[i].Name,
          Gender: this.selectedItems[i].Gender,
          Code: this.selectedItems[i].EmployeeCode || this.selectedItems[i].Code
        }
        inputparms.PersonDetails = JSON.parse(JSON.stringify(obj));
        this.PAN = this.selectedItems[i].PAN;
        this.UAN = this.selectedItems[i].UAN;
        this.BANK = this.selectedItems[i].BANK;
        this.NOMINEE = this.selectedItems[i].Nominee;
        this.AADHAAR = this.selectedItems[i].Aadhaar;

        inputparms.Body = this.Mailbodyvalue + `<div><br><table style="border: 1px solid black;border-collapse: collapse;width: 100%;"><thead><tr><th style="border: 1px solid black; border-collapse: collapse; text-align: center;">PAN</th><th style="border: 1px solid black; border-collapse: collapse;text-align: center;">UAN</th><th style="border: 1px solid black; border-collapse: collapse;text-align: center;">BANK</th><th style=" border: 1px solid black; border-collapse: collapse;text-align: center;">NOMINEE</th><th style=" border: 1px solid black; border-collapse: collapse;text-align: center;">AADHAR</th></tr></thead><tbody><tr><td style=" border: 1px solid black; border-collapse: collapse; text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;">${this.PAN}</div></td><td style="border: 1px solid black; border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;">${this.UAN}<br></div></td><td style="border: 1px solid black;border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;">${this.BANK}<br></div></td><td style=" border: 1px solid black; border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;">${this.NOMINEE}<br></div></td><td style=" border: 1px solid black;border-collapse: collapse;text-align: center;"><div style="--tw-shadow:0 0 #0000; --tw-ring-inset:var(--tw-empty, ); --tw-ring-offset-width:0px; --tw-ring-offset-color:#fff; --tw-ring-color:rgba(59, 130, 246, 0.5); --tw-ring-offset-shadow:0 0 #0000; --tw-ring-shadow:0 0 #0000;">${this.AADHAAR}<br></div></td></tr></tbody></table><br></div>`;
        BodyArr.push(JSON.parse(JSON.stringify(inputparms)));
        obj = null;
      }
      console.log('send Email Parms', BodyArr);
    }
    else {
      var inputparms2 = {
        Subject: this.RevisionForm.controls.subject.value,
        Body: this.Mailbodyvalue,
        CCMailIds: this.ccmailtags,
        PersonDetailsList: [],
        // AttachmentList: [{ Name: this.documentFileName, DocumentId: this.unsavedDocumentLst ? this.unsavedDocumentLst[0].Id : 0 }]
        AttachmentList: []
      }
      for (var j in this.noOfAttachments) {
        var obj1 = {
          Name: this.noOfAttachments[j].documentFileName,
          DocumentId: this.noOfAttachments[j].Id
        }
        if (this.noOfAttachments[j].Id) {
          inputparms.AttachmentList.push(obj1);
          obj1 = null;
        }
      }
      for (var i in this.selectedItems) {
        var obj2 = {
          EmailId: this.selectedItems[i].EmailId || this.selectedItems[i].EMail || '',
          Name: this.selectedItems[i].EmployeeName || this.selectedItems[i].Name,
          Gender: this.selectedItems[i].Gender == 'Male' ? 1 : (this.selectedItems[i].Gender == 'Female' ? 2 : 3),
          Code: this.selectedItems[i].EmployeeCode || this.selectedItems[i].Code
        }
        inputparms2.PersonDetailsList.push(obj2);
        obj2 = null;
      }
      console.log('send Email Parms', inputparms2);
    }

    if (this.code == 'employeeMissingDoc') {
      this.loadingScreenService.startLoading();
      this.fileuploadService.PostEmpMissingDocumentsMail(JSON.stringify(BodyArr)).subscribe((res) => {
        let apiResult: apiResult = (res);
        this.loadingScreenService.stopLoading();
        try {
          inputparms = null;
          this.alertService.showSuccess(apiResult.Message);
          $('#popup_email').modal('hide');
          this.RevisionForm.controls.subject.setValue('');
          this.RevisionForm.controls.bodyValue.setValue('');
          this.RevisionForm.controls.emailList.setValue('');
          this.ccmailtags = [];
          this.noOfAttachments = JSON.parse(JSON.stringify(environment.environment.NoOfAttachmentsSendMail));
        } catch (error) {
          inputparms = null;
          this.alertService.showSuccess(apiResult.Message);
        }

      }), ((err) => {
        this.documentFileName = null;
      })
    }
    else {
      this.loadingScreenService.startLoading();
      this.fileuploadService.postGeneralMail(JSON.stringify(inputparms2)).subscribe((res) => {
        let apiResult: apiResult = (res);
        this.loadingScreenService.stopLoading();
        try {
          inputparms2 = null;
          this.alertService.showSuccess(apiResult.Message);
          $('#popup_email').modal('hide');
          this.RevisionForm.controls.subject.setValue('');
          this.RevisionForm.controls.bodyValue.setValue('');
          this.RevisionForm.controls.emailList.setValue('');
          this.ccmailtags = [];
        } catch (error) {
          inputparms = null;
          this.alertService.showSuccess(apiResult.Message);
        }

      }), ((err) => {
        this.documentFileName = null;
      })
    }

  }
  /* #region  CC EMAIL ADDRESS BOOK INPUTS METHOD */
  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent): void {
    this.CCemailMismatch = false;
    const inputValue: string = this.RevisionForm.controls.emailList.value;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue);
        this.RevisionForm.controls.emailList.setValue('');
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
  doDeleteFile(obj) {
    //debugger;
    // this.RevisionForm.controls['DocumentId'].setValue(this.unsavedDocumentLst[0].Id);
    this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted,  you cannot undo this action.", "OK, Delete").then(result => {
      this.deleteAsync(obj);
    })
      .catch(error => { });
  }
  deleteAsync(obj) {
    // var x = this.RevisionForm.get('DocumentId').value;
    this.fileuploadService.deleteObjectStorage(obj.Id).subscribe((res) => {
      //debugger;
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          // var index = this.unsavedDocumentLst.map(function (el) {
          //   return el.Id
          // }).indexOf(this.RevisionForm.get('DocumentId').value)

          // Delete  the item by index.
          //this.unsavedDocumentLst.splice(index, 1)
          //this.RevisionForm.controls['DocumentId'].setValue(null);
          for (var i in this.noOfAttachments) {
            if (this.noOfAttachments[i].Id == obj.Id) {
              this.noOfAttachments[i].Id = null;
              this.noOfAttachments[i].documentFileName = null;
            }
          }
          //this.RevisionForm.controls['FileName'].setValue(null);
          this.RevisionForm.controls['IsDocumentDelete'].setValue(false);
          //this.documentFileName = null;
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }

    }), ((err) => {

    })
  }
  onFileUpload(e, obj) {
    //debugger;
    this.RevisionForm.get('ObjectStorageId').valid;
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
        this.spinnerText = "Uploading";
        this.FileName = file.name;
        this.RevisionForm.controls['DocumentName'].setValue(file.name);
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, this.FileName, obj)

      };
    }
  }
  doAsyncUpload(filebytes, filename, obj) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = 0;//this.objStorageJson.CandidateId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.employeedetails.ClientContractId;
      objStorage.ClientId = this.employeedetails.ClientId;
      objStorage.CompanyId = this.sessionDetails.Company.Id;// this.objStorageJson.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";
      this.documentFileName1 = filename;
      //this.noOfAttachments[obj.Idx].documentFileName = filename;
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {
            this.noOfAttachments[obj.Idx].documentFileName = this.documentFileName1;
            this.noOfAttachments[obj.Idx].Id = apiResult.Result;
            this.RevisionForm.controls['ObjectStorageId'].setValue(apiResult.Result);
            this.RevisionForm.controls['IsDocumentDelete'].setValue(false);
            // this.unsavedDocumentLst.push({
            //  Id: apiResult.Result
            //  })
            // this.RevisionForm.controls['DocumentId'].setValue(this.unsavedDocumentLst[0].Id);
            //apiResult.Result ? '' : this.documentFileName = null;
            apiResult.Result ? '' : this.noOfAttachments[obj.Idx].documentFileName = null;
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")

          }
          else {
            this.FileName = null;
            this.RevisionForm.controls['DocumentName'].setValue(null);
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.FileName = null;
          this.RevisionForm.controls['DocumentName'].setValue(null);
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }

      }), ((err) => {
        //this.documentFileName = null;
        this.noOfAttachments[obj.Idx].documentFileName = null;
      })

      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.RevisionForm.controls['DocumentName'].setValue(null);
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }
  onClickBlockFn() {
    debugger;
    console.log('Selected Items', this.selectedItems);
    this.RevisionForm.controls;

  }
  closeBlockPopup() {
    this.RevisionForm.controls.BlockedReasonId.setValue(null);
    this.RevisionForm.controls.BlockEdRemarks.setValue('');
    $('#popup_Block_Employee').modal('hide');
  };
  /* #endregion */

  viewWeekOffConfig() {
    this.router.navigate(['app/masters/weekoffconfig'], {
      queryParams: {
        "Odx": btoa(JSON.stringify(this.selectedItems)),
      }
    });
  }

  cancelOfferInMigration(item: any) {
    console.log('item', item);

    this.alertService.confirmSwal("Are you sure you want to cancel the offer?", `This action will cancel the offer request.`, "Yes, Continue").then(result => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: "Remarks",
        animation: false,
        showCancelButton: false, // There won't be any cancel button
        input: 'textarea',
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
        }
      }).then((inputValue) => {
        let jsonObj = inputValue;
        let jsonStr = jsonObj.value;
        this.loadingScreenService.startLoading();
        let request_params = `moduletransactionId=${item[0].ModuletransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;
        this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
          let apiResult: apiResult = result;
          // this.getPageLayout();
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        });
      });
    });
  }

  modal_dismiss_Release_AL() {
    $('#popup_modal_release_AL').modal('hide');
    this.isSuccessMigration = false;
    this.ALRemarks = null;
    this.selectedItems = [];
    this.selectedmigrationRecords = [];
    this.getDataset();

  }

  Continue() {
    //this.disableBtn = true;
    this.ALRemarks = null;
    this.isSuccessMigration = false;
    $('#popup_modal_release_AL').modal('hide');
    this.selectedmigrationRecords = [];
    this.selectedItems = [];
    // this.getPageLayout();

  }

  releaseAL(item: any, releaseType: string) {
    this.ReleaseAlType = releaseType;
    this.selectedmigrationRecords = [];
    this.DoesSupportiveDocsRequired = false;
    if (item.constructor.name == "Array") {
      this.selectedmigrationRecords = item;
    } else {
      this.selectedmigrationRecords.push(item);
    }
    let isValidToRelease: boolean = true;

    for (let i = 0; i < this.selectedmigrationRecords.length; i++) {
      const element = this.selectedmigrationRecords[i];
      if (element.Status && !['Ready to Migrate', 'Employee Transition Completed', 'Migration Failed'].includes(element.Status)) {
        this.alertService.showWarning('The action was blocked. Selected candidate items cannot be released because the status is in an invalid state.');
        isValidToRelease = false;
        break;
      }
    }

    if (isValidToRelease == true) {
      // this.disableBtn = false;
      var currentDate = new Date();
      var Non_EsicDate_backward = moment();
      var Non_EsicDate_forward = moment();
      var EsicDate_backward = moment();
      var EsicDate_forward = moment();


      let isBetween: boolean = true;
      let isRevised: boolean = false;
      let isESICApplicable: boolean = false;
      for (let index = 0; index < this.selectedmigrationRecords.length; index++) {

        const element = this.selectedmigrationRecords[index];
        if (moment(element.ProposedDOJ).format('YYYY-MM-DD') == moment('1900-01-01').format('YYYY-MM-DD')) {
          element.ProposedDOJ = null;
        }
        isESICApplicable = element.Esicvalue > 0 ? true : false;
        let currentDate = moment();
        let startDate_nonEsic = moment(element.PayPeriodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
        let endDate = moment(element.PayPeriodEndDate);
        let startDate_Esic = moment(element.PayPeriodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

        Non_EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
        EsicDate_backward = moment().subtract(this.ReleaseAlType == 'S' ? environment.environment.MinExtendedDOJDays : environment.environment.ActualDOJminDate_withESIC, 'days'); // 7 days

        EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days
        Non_EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days

        if (moment(Non_EsicDate_forward).format('YYYY-MM-DD') >= moment(element.PayPeriodEndDate).format('YYYY-MM-DD')) {
          Non_EsicDate_forward = moment(element.PayPeriodEndDate);
        }
        if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(element.PayPeriodEndDate).format('YYYY-MM-DD')) {
          EsicDate_forward = moment(element.PayPeriodEndDate);
        }

        if (moment(Non_EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_nonEsic).format('YYYY-MM-DD')) {
          Non_EsicDate_backward = moment(startDate_nonEsic);
        }
        if (moment(EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_Esic).format('YYYY-MM-DD')) {
          EsicDate_backward = moment(startDate_Esic);
        }


        if (element.hasOwnProperty('IsRevisedDOJ') && element.hasOwnProperty('ProposedDOJ') && element.IsRevisedDOJ && element.ProposedDOJ != null && moment(element.ProposedDOJ).format('YYYY-MM-DD') != moment(new Date("1900-01-01")).format('YYYY-MM-DD')) {

          isRevised = true

        }

        // } else {
        //   Non_EsicDate_backward = moment(currentDate).subtract(environment.environment.ActualDOJminDate, 'days');
        //   Non_EsicDate_forward = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days');

        //   if (moment(Non_EsicDate_forward).format('YYYY-MM-DD') >= moment(element.PayPeriodEndDate).format('YYYY-MM-DD')) {
        //     Non_EsicDate_forward = moment(element.PayPeriodEndDate);
        //   }

        //   EsicDate_backward = moment(currentDate).subtract(environment.environment.ActualDOJminDate_withESIC, 'days');
        //   EsicDate_forward = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days');

        //   if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(element.PayPeriodEndDate).format('YYYY-MM-DD')) {
        //     EsicDate_forward = moment(element.PayPeriodEndDate);
        //   }
        // }

        console.log(moment(EsicDate_backward).format('YYYY-MM-DD'));
        console.log(moment(EsicDate_forward).format('YYYY-MM-DD'));
        console.log(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
        console.log(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));

        this.InitialDOJ = new Date(element.ActualDateOfJoining);
        this.InitialPayPeriodId = element.EffectivePayPeriodId;
        this.IsESICApplicable = element.Esicvalue > 0 ? true : false;

        this.DoesSupportiveDocsRequired = false;
        if (this.InitialDOJ != null) {
          let subtractDate = moment().subtract(environment.environment.MinDaysofNewRequestDOJWorkflow, 'days');
          let addDate = moment().add(environment.environment.MaxDaysofNewRequestDOJWorkflow, 'days');

          let isBetween_BW: boolean = false;
          let isBetween_FW: boolean = false;
          isBetween_BW = moment(this.InitialDOJ).isBetween(moment(subtractDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')); // true
          if (!isBetween_BW) {
            this.DoesSupportiveDocsRequired = true;
            this.GettingExistingCandidateHistory();
          }

          if (!isBetween_BW) {
            isBetween_FW = moment(this.InitialDOJ).isBetween(moment().format('YYYY-MM-DD'), moment(addDate).format('YYYY-MM-DD')); // true
            if (!isBetween_FW && !this.DoesSupportiveDocsRequired) {
              this.DoesSupportiveDocsRequired = true;
              this.GettingExistingCandidateHistory();
            } else {
              this.DoesSupportiveDocsRequired = false;
            }
          }
        }

        let formattedADOJ = moment(element.ActualDateOfJoining).format('YYYY-MM-DD')
        if (element.Esicvalue > 0) {
          this.MinDate = new Date(moment(EsicDate_backward).format('YYYY-MM-DD'));
          this.MaxDate = new Date(moment(EsicDate_forward).format('YYYY-MM-DD'));
          isBetween = moment(formattedADOJ).isBetween(moment(EsicDate_backward).format('YYYY-MM-DD'), moment(EsicDate_forward).format('YYYY-MM-DD')); // true
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(EsicDate_backward).format('YYYY-MM-DD')) : null;
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(EsicDate_forward).format('YYYY-MM-DD')) : null;
          if (!isBetween) {
            break;
          }

        }
        else {
          this.MinDate = new Date(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
          this.MaxDate = new Date(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));
          this.EndDateMinDate = this.MaxDate;
          isBetween = moment(formattedADOJ).isBetween(moment(Non_EsicDate_backward).format('YYYY-MM-DD'), moment(Non_EsicDate_forward).format('YYYY-MM-DD')); // true
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(Non_EsicDate_backward).format('YYYY-MM-DD')) : null;
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(Non_EsicDate_forward).format('YYYY-MM-DD')) : null;
          if (!isBetween) {
            break;
          }
        }

      }


      if (!isRevised && !isBetween && this.ReleaseAlType != 'S') {
        this.alertService.showWarning(environment.environment.ErrorMessageForMigrationTimeSlot1);
        return;
      }

      if (!isBetween && this.ReleaseAlType == 'S') {
        this.alertService.confirmSwalWithClose("Confirmation", environment.environment.ErrorMessageForMigrationTimeSlot, "No, Cancel", "Yes, Continue").then((result) => {

        }).catch(error => {
          this.newDOJRequestModal(isBetween);
        });

        return;

      }

      this.newDOJRequestModal(isBetween);

    }
  }

  newDOJRequestModal(isBetween) {
    this.selectedmigrationRecords = this.selectedmigrationRecords.filter(a => a.Id);

    console.log('selectedmigrationRecords', this.selectedmigrationRecords);

    // if(!isBetween){
    //   this.singleNewDOJRequest();
    // }

    if (this.selectedmigrationRecords.length != 0) {
      $('#popup_modal_release_AL').modal({
        backdrop: 'static',
        keyboard: false,
        show: true
      });
      this.selectedmigrationRecords.forEach(element => {
        element["Message"] = null;
        element["Status"] = this.code == 'migrationlist' ? element["Status"] : null;
        element["ccmailtags"] = new Array();
        element.ccmailtags = element.CCMails != null && element.CCMails != "" && element.CCMails != undefined ? element.CCMails.split(",") : [];
      });
    } else {
      this.alertService.showWarning("Please select at least one candidate for transition from the list");
    }

    if (this.ReleaseAlType == 'S') {
      this.singleNewDOJRequest();
    }
  }

  singleNewDOJRequest() {
    const obj = this.selectedmigrationRecords[0];
    this.loadingScreenService.startLoading();
    this.onboardingApi.getMigrationMasterInfo(obj.ClientContractId).subscribe((result) => {
      let apiResult: apiResult = (result);
      this.loadingScreenService.stopLoading();
      if (apiResult.Status && apiResult.Result != null) {
        this.TeamListForReleaseAL = JSON.parse(apiResult.Result);;
        console.log('TeamList', this.TeamListForReleaseAL);
        this.onChangeTeamForReleaseAL(obj);
      }
    }), ((error) => {
      console.log('ERROR - release AL', error);
    })
  }

  doChangeExtendedDOJ(event) {
    console.log('DOJ NEW :', event);
    this.DoesSupportiveDocsRequired = false;
    if (event != null) {
      let subtractDate = moment().subtract(environment.environment.MinDaysofNewRequestDOJWorkflow, 'days');
      let addDate = moment().add(environment.environment.MaxDaysofNewRequestDOJWorkflow, 'days');
      let isBetween_BW: boolean = false;
      let isBetween_FW: boolean = false;
      isBetween_BW = moment(event).isBetween(moment(subtractDate).format('YYYY-MM-DD'), moment().format('YYYY-MM-DD')); // true
      if (!isBetween_BW) {
        this.DoesSupportiveDocsRequired = true;
        this.GettingExistingCandidateHistory();
      }

      if (!isBetween_BW) {
        isBetween_FW = moment(event).isBetween(moment().format('YYYY-MM-DD'), moment(addDate).format('YYYY-MM-DD')); // true
        if (!isBetween_FW) {
          this.DoesSupportiveDocsRequired = true;
          this.GettingExistingCandidateHistory();
        } else {
          this.DoesSupportiveDocsRequired = false;
        }
      }

    }
    // if (moment(this.InitialDOJ).format('YYYY-MM-DD') != moment(event).format('YYYY-MM-DD')) {

    // }
  }

  onChangePP(event) {
    console.log('event', event);

    //  var Non_EsicDate_backward = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
    //  var Non_EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 days
    this.DoesSupportiveDocsRequired = false;
    let isESICApplicable = this.IsESICApplicable;
    let currentDate = moment();
    let startDate_nonEsic = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
    let endDate = moment(event.EndDate);
    let startDate_Esic = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

    var Non_EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
    var EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

    var EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days
    var Non_EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days

    if (moment(Non_EsicDate_forward).format('YYYY-MM-DD') >= moment(event.EndDate).format('YYYY-MM-DD')) {
      Non_EsicDate_forward = moment(event.EndDate);
    }
    if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(event.EndDate).format('YYYY-MM-DD')) {
      EsicDate_forward = moment(event.EndDate);
    }

    if (moment(Non_EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_nonEsic).format('YYYY-MM-DD')) {
      Non_EsicDate_backward = moment(startDate_nonEsic);
    }
    if (moment(EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_Esic).format('YYYY-MM-DD')) {
      EsicDate_backward = moment(startDate_Esic);
    }


    // var EsicDate_backward = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
    // var EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 days

    // if (this.IsESICApplicable) {
    //   EsicDate_backward = moment(event.EndDate).subtract(environment.environment.ActualDOJminDate_withESIC, 'days'); // 7 days
    // }

    // if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(event.EndDate).format('YYYY-MM-DD')) {
    //   EsicDate_forward = moment(event.EndDate);

    // }

    if (this.IsESICApplicable) {
      this.MinDate = new Date(moment(EsicDate_backward).format('YYYY-MM-DD'));
      this.MaxDate = new Date(moment(EsicDate_forward).format('YYYY-MM-DD'));
    } else {

      this.MinDate = new Date(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
      this.MaxDate = new Date(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));
    }

    this.selectedmigrationRecords[0].ProposedDOJ = null;
    this.EndDateMinDate = this.MaxDate;

  }

  onChangeTeamForReleaseAL(item) {
    item.TeamId ? item.TeamId = item.TeamId : item.TeamId = item.Id;
    this.EffectivePayPeriodListForReleaseAL = [];
    console.log(item);
    let filterList = this.TeamListForReleaseAL.find(a => a.Id == item.TeamId);
    this.EffectivePayPeriodListForReleaseAL = filterList.PayPeriodList;
  }

  /*this function enables and disables the  save changes button in release al popup*/
  savechangesdisFn(obj) {
    if (obj && obj.TenureType == 1) {
      if (obj.ActualDateOfJoining && obj.Designation && obj.Department && obj.EffectivePayPeriodId && obj.TeamId && obj.EndDate) {
        return false;
      } else {
        return true;
      }
    }
    else if (obj && obj.TenureType == 2) {
      if (obj.ActualDateOfJoining && obj.Designation && obj.Department && obj.EffectivePayPeriodId && obj.TeamId && obj.TenureInterval != 0) {
        return false;
      } else {
        return true;
      }
    }
    else if (obj && obj.TenureType == 0) {
      if (obj.ActualDateOfJoining && obj.Designation && obj.Department && obj.EffectivePayPeriodId && obj.TeamId) {
        return false;
      } else {
        return true;
      }
    }
  }

  confirmALRelease() {
    console.log('CONFIRM AL RELEASE-SELECTED ITEM & REMARKS', this.selectedmigrationRecords, this.ALRemarks);
    if (this.ALRemarks == undefined || this.ALRemarks == null || this.ALRemarks == '') {
      this.alertService.showWarning("Please enter the remarks. This field is required ");
      return;
    }

    this.loadingScreenService.startLoading();
    this.LstCandidateEmployeeMigration = [];
    this.TransitionGroup.Remarks = this.ALRemarks;
    this.selectedmigrationRecords.forEach(element => {

      var tmpWorkflowInitiation: WorkFlowInitiation = new WorkFlowInitiation();

      tmpWorkflowInitiation.Remarks = "";
      tmpWorkflowInitiation.EntityId = element.CandidateId;
      tmpWorkflowInitiation.EntityType = EntityType.CandidateDetails;
      tmpWorkflowInitiation.CompanyId = this.CompanyId;
      tmpWorkflowInitiation.ClientContractId = element.ClientContractId;
      tmpWorkflowInitiation.ClientId = element.ClientId;

      tmpWorkflowInitiation.ActionProcessingStatus = 4000;
      tmpWorkflowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
      tmpWorkflowInitiation.WorkFlowAction = 1;
      tmpWorkflowInitiation.RoleId = this.RoleId;
      tmpWorkflowInitiation.DependentObject = JSON.stringify(element);
      tmpWorkflowInitiation.UserInterfaceControlLst = this.accessControl_Migration;

      this.LstCandidateEmployeeMigration.push({
        ModuleTransactionId: element.ModuletransactionId,
        CandidateId: element.CandidateId,
        UserId: this.UserId,
        PersonId: 0,
        ClientId: element.ClientId,
        ClientContractId: element.ClientContractId,
        EmployeeCode: "",
        CreatedBy: "",
        PersonDetails: { Id: 0, FirstName: element.CandidateName, LastName: "", DOB: element.DateOfBirth, FatherName: element.FatherName, PrimaryMobileCountryCode: "91", PrimaryMobile: element.PrimaryMobile, PrimaryEmail: element.PrimaryEmail, CreatedCompanyId: 0, LastUpdatedCompanyId: 0, Status: 0 },
        IsValid: true,
        Message: "",
        Status: 1,
        IsReleaseAppointmentLetter: true,
        objWorkflowInitiation: tmpWorkflowInitiation,//this.workFlowInitiation,
        TransitionGroupId: 0,
        EffectivePayPeriod: element.EffectivePayPeriodId,
        TeamId: element.TeamId,
        ActualDateOfJoining: element.ActualDateOfJoining ? moment(element.ActualDateOfJoining).format('YYYY-MM-DD') : null,// console.log(moment(EsicDate_backward).format('YYYY-MM-DD'));
        CCMails: element.ccmailtags.join(",")

      }
      )
    });

    this.TransitionGroup.LstCandidateEmployeeMigration = (this.LstCandidateEmployeeMigration);
    console.log('confirm al release', this.LstCandidateEmployeeMigration);
    console.log('confirm al release', JSON.stringify(this.TransitionGroup));
    this.transitionService.putEmployeeTransition(JSON.stringify(this.TransitionGroup)).subscribe((response) => {
      console.log(response);
      try {
        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != "") {
          this.alertService.showSuccess(apiResult.Message);
          const MigrationResult: MigrationResult = (apiResult.Result) as any;
          MigrationResult.LstCandidateEmployeeMigration.forEach(element => {
            this.selectedmigrationRecords.forEach(e => {
              if (e.CandidateId == element.CandidateId) {
                e.Message = element.Message;
                e.Name = element.PersonDetails ? element.PersonDetails.FirstName : '';
                e.Status = element.Status
              }
            });
          });
          console.log(this.selectedmigrationRecords, MigrationResult.LstCandidateEmployeeMigration);
          this.loadingScreenService.stopLoading();
          this.selectedItems = [];
          this.isSuccessMigration = true;
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(error);
      }
    }), ((ERROR) => {
      this.alertService.showWarning(ERROR);
      this.loadingScreenService.stopLoading();
    });
  }

  confirmALReleaseSingle(data) {
    console.log(data);
    var currentDate = new Date();

    var Non_EsicDate_backward = moment();
    var Non_EsicDate_forward = moment();
    var EsicDate_backward = moment();
    var EsicDate_forward = moment();




    let isRange: boolean = false;
    let isESICApplicable: boolean = false;
    let isBetween: boolean = true;

    for (let index = 0; index < this.selectedmigrationRecords.length; index++) {
      const element = this.selectedmigrationRecords[index];
      isESICApplicable = element.Esicvalue > 0 ? true : false;
      let currentDate = moment();
      let startDate_nonEsic = moment(element.PayPeriodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
      let endDate = moment(element.PayPeriodEndDate);
      let startDate_Esic = moment(element.PayPeriodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

      Non_EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
      EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

      EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days
      Non_EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days

      if (moment(Non_EsicDate_forward).format('YYYY-MM-DD') >= moment(element.PayPeriodEndDate).format('YYYY-MM-DD')) {
        Non_EsicDate_forward = moment(element.PayPeriodEndDate);
      }
      if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(element.PayPeriodEndDate).format('YYYY-MM-DD')) {
        EsicDate_forward = moment(element.PayPeriodEndDate);
      }

      if (moment(Non_EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_nonEsic).format('YYYY-MM-DD')) {
        Non_EsicDate_backward = moment(startDate_nonEsic);
      }
      if (moment(EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_Esic).format('YYYY-MM-DD')) {
        EsicDate_backward = moment(startDate_Esic);
      }

      // if (element.hasOwnProperty('IsRevisedDOJ') && element.hasOwnProperty('ProposedDOJ') && element.IsRevisedDOJ && element.ProposedDOJ != null && moment(element.ProposedDOJ).format('YYYY-MM-DD') != moment(new Date("1900-01-01")).format('YYYY-MM-DD')) {

      //   Non_EsicDate_backward = moment(element.PayPeriodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days');
      //   Non_EsicDate_forward = moment(element.PayPeriodEndDate).add(environment.environment.MaximumExtendedDOJDays, 'days');

      //   EsicDate_backward = moment(element.PayPeriodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days');
      //   EsicDate_forward = moment(element.PayPeriodEndDate).add(environment.environment.MaximumExtendedDOJDays, 'days');

      // } else {
      //   Non_EsicDate_backward = moment(currentDate).subtract(environment.environment.ActualDOJminDate, 'days');
      //   Non_EsicDate_forward = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days');

      //   EsicDate_backward = moment(currentDate).subtract(environment.environment.ActualDOJminDate_withESIC, 'days');
      //   EsicDate_forward = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days');
      // }

      let formattedADOJ = moment(element.ActualDateOfJoining).format('YYYY-MM-DD')
      if (element.Esicvalue > 0) {

        this.MinDate = new Date(moment(EsicDate_backward).format('YYYY-MM-DD'));
        this.MaxDate = new Date(moment(EsicDate_forward).format('YYYY-MM-DD'));
        isBetween = moment(formattedADOJ).isBetween(moment(EsicDate_backward).format('YYYY-MM-DD'), moment(EsicDate_forward).format('YYYY-MM-DD')); // true
        isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(EsicDate_backward).format('YYYY-MM-DD')) : null;
        isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(EsicDate_forward).format('YYYY-MM-DD')) : null;
        if (!isBetween) {
          break;
        }

      }
      else {
        this.MinDate = new Date(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
        this.MaxDate = new Date(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));
        this.EndDateMinDate = this.MaxDate;
        isBetween = moment(formattedADOJ).isBetween(moment(Non_EsicDate_backward).format('YYYY-MM-DD'), moment(Non_EsicDate_forward).format('YYYY-MM-DD')); // true
        isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(Non_EsicDate_backward).format('YYYY-MM-DD')) : null;
        isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(Non_EsicDate_forward).format('YYYY-MM-DD')) : null;
        if (!isBetween) {
          break;
        }
      }

    }

    // if (!isBetween) {
    //   console.log('MIGRATION TIME HAS BEEN CLOSED. PLEASE CONTACT SUPPORT ADMIN', isBetween);
    //   this.alertService.showWarning("Migration time has been closed. Please contact support admin.");
    //   return;
    // }



    // if (!isRange) {
    //   console.log('Invalid date range selection.', isRange);
    //   this.alertService.showWarning("Invalid date range selection.");
    //   return;
    // }

    if (this.DoesSupportiveDocsRequired && (data[0].SalaryRemarks == null || data[0].SalaryRemarks == '' || data[0].SalaryRemarks == undefined)) {
      this.alertService.showWarning('Please enter a valid remarks');
      return;
    }

    if (this.DoesSupportiveDocsRequired && this.fileList.length == 0) {
      this.alertService.showWarning('Supportive Attachment is required');
      return;
    }

    if (this.DoesSupportiveDocsRequired && data[0].ProposedDOJ == null) {
      this.alertService.showWarning('Please select a valid New DOJ');
      return;
    }


    this.selectedmigrationRecords[0].ccmailtags;
    if (data[0].TenureType == 2) {
      var myDate = new Date(data[0].ActualDateOfJoining);
      var newDate = moment(myDate);
      let nextMonth = newDate.add('month', Number(data[0].TenureInterval));
      nextMonth.subtract(1, "days")
      data[0].EndDate = moment(nextMonth).format('YYYY-MM-DD');
    }
    else if (data[0].TenureType == 1) {
      data[0].EndDate = moment(data[0].EndDate).format('YYYY-MM-DD')
    }
    var emails = '';
    for (var i in this.selectedmigrationRecords[0].ccmailtags) {
      emails += this.selectedmigrationRecords[0].ccmailtags[i] + (this.selectedmigrationRecords[0].ccmailtags[parseInt(i) + 1] ? ',' : '');
    }
    var parms = {
      Id: data[0].CandidateOfferDetailsId,
      ActualDateOfJoining: this.DoesSupportiveDocsRequired ? moment(data[0].ActualDateOfJoining).format('YYYY-MM-DD') : (data[0].ProposedDOJ == null ? moment(data[0].ActualDateOfJoining).format('YYYY-MM-DD') : moment(data[0].ProposedDOJ).format('YYYY-MM-DD')),
      Designation: data[0].Designation,
      SalaryRemarks: data[0].SalaryRemarks,
      Department: data[0].Department,
      TeamId: data[0].TeamId,
      EffectivePayPeriodId: data[0].EffectivePayPeriodId,
      OLCCMAILIDCC: emails,
      EndDate: data[0].EndDate
    }

    console.log('PYL #110 :: ', parms);

    if (!this.DoesSupportiveDocsRequired) {

      this.loadingScreenService.startLoading();
      this.transitionService.postEmployeeMigrationSingle(parms).subscribe((response) => {
        console.log(response);
        try {
          this.loadingScreenService.stopLoading();
          let apiResult: apiResult = response;
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.modal_dismiss_Release_AL();
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(error);
        }
      }), ((ERROR) => {
        this.alertService.showWarning(ERROR);
        this.loadingScreenService.stopLoading();
      });
    } else {
      this.loadingScreenService.startLoading();
      this.onFileUpload_RequestDOJ(data, parms);
    }


  }

  onFileUpload_RequestDOJ(data, parms) {

    try {

      let fileSize = 0;
      for (let i = 0; i < this.fileList.length; i++) {
        fileSize = Number(fileSize) + this.fileList[i].size
      }
      var FileSize = fileSize / 1024 / 1024;
      var maxfilesize = fileSize / 1024;
      if ((FileSize > 2)) {
        this.isUploadingSpinner = false;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        this.loadingScreenService.stopLoading();
        return;
      }
      this.isUploadingSpinner = true;

      this.uploadingSpinnerText = "Confirming...";

      if (this.hasFileChange && this.fileList.length > 0) {
        var zip = new JSZip();
        var files = this.fileList;
        this.supportingDocumentName = `${this.selectedmigrationRecords[0].CandidateName}_supportingDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
        if (files && files[0]) {
          for (let i = 0; i < files.length; i++) {
            let b: any;
            if (files[i].type) {
              b = new Blob([files[i]], { type: '' + files[i].type + '' });
            } else {
              this.fileObject.forEach(el => {
                if (el.name == files[i].name) {
                  files[i] = el;
                  b = new Blob([files[i]], { type: '' + files[i].type + '' });
                }
              });
            }
            zip.file(files[i].name, b, { base64: true });
          }

          zip.generateAsync({
            type: "base64",
          }).then((_content) => {
            if (_content && this.supportingDocumentName) {
              const objStorageJson = JSON.stringify({ IsCandidate: true, CompanyId: this.CompanyId, ClientId: this.selectedmigrationRecords[0].ClientId, ClientContractId: this.selectedmigrationRecords[0].ClientContractId })
              this.doAsyncUpload_RequestDOJ(_content, this.supportingDocumentName, null, true, this.selectedmigrationRecords[0].CandidateId, objStorageJson).then((result) => {

                const approval: Approvals = new Approvals();
                approval.ApprovalFor = ApprovalFor.RequestForNewDOJ;
                approval.Id = 0;
                approval.ApprovalType = ApproverType.Internal;
                approval.DocumentName = this.supportingDocumentName;
                approval.Modetype = UIMode.Edit;
                approval.EntityId = this.selectedmigrationRecords[0].CandidateId;
                approval.EntityType = EntityType.CandidateDetails;
                approval.Remarks = data[0].SalaryRemarks;
                approval.ObjectStorageId = Number(result);
                approval.Status = ApprovalStatus.Pending;

                const payload = JSON.stringify(
                  {
                    CandidateId: this.selectedmigrationRecords[0].CandidateId,
                    MPId: this.selectedmigrationRecords[0].Id,
                    FieldName: "ProposedDOJ",
                    ProposedDOJ: moment(data[0].ProposedDOJ).format('YYYY-MM-DD'),
                    Approvals: JSON.stringify(approval),
                    Remarks: data[0].SalaryRemarks,
                    OtherData: JSON.parse(JSON.stringify(parms))

                  })

                console.log('payload :: ', payload);
                // this.spinner = false;
                // return;
                this.onboardingService.UpdateCandidateOfferNewDOJ(payload).subscribe((data: apiResult) => {
                  console.log('apires :::', data);
                  this.loadingScreenService.stopLoading();
                  if (data.Status) {
                    this.alertService.showSuccess(data.Message);
                  } else {
                    this.alertService.showWarning(data.Message);
                  }

                  this.transitionService.postEmployeeMigrationSingle(parms).subscribe((response) => {
                    console.log(response);
                    try {
                      this.loadingScreenService.stopLoading();
                      let apiResult: apiResult = response;
                      if (apiResult.Status) {
                        this.alertService.showSuccess(apiResult.Message);
                        this.modal_dismiss_Release_AL();
                      } else {
                        this.loadingScreenService.stopLoading();
                        this.alertService.showWarning(apiResult.Message);
                      }
                    } catch (error) {
                      this.loadingScreenService.stopLoading();
                      this.alertService.showWarning(error);
                    }
                  }), ((ERROR) => {
                    this.alertService.showWarning(ERROR);
                    this.loadingScreenService.stopLoading();
                  });
                  // this.modal_dismiss_Release_AL();
                }, err => {

                })

                this.isUploadingSpinner = false;
              });
            } else {

            }
          });
        }

      }
      else {

        console.log('ste', this.approvalsObject);

        const approval: Approvals = new Approvals();
        approval.ApprovalFor = ApprovalFor.RequestForNewDOJ;
        approval.Id = this.approvalsObject.Id;
        approval.ApprovalType = ApproverType.Internal;
        approval.DocumentName = this.approvalsObject.DocumentName;
        approval.Modetype = UIMode.Edit;
        approval.EntityId = this.selectedmigrationRecords[0].CandidateId;
        approval.EntityType = EntityType.CandidateDetails;
        approval.Remarks = data[0].SalaryRemarks;
        approval.ObjectStorageId = Number(this.approvalsObject.ObjectStorageId);
        approval.Status = ApprovalStatus.Pending;

        const payload = JSON.stringify(
          {
            CandidateId: this.selectedmigrationRecords[0].CandidateId,
            MPId: this.selectedmigrationRecords[0].Id,
            FieldName: "PropsedDOJ",
            ProposedDOJ: moment(data[0].ActualDateOfJoining).format('YYYY-MM-DD'),
            Approvals: JSON.stringify(approval),
            Remarks: data[0].SalaryRemarks,
            OtherData: JSON.parse(JSON.stringify(parms))

          })

        console.log('payload :: ', payload);
        // this.spinner = false;
        // return;
        this.onboardingService.UpdateCandidateOfferNewDOJ(payload).subscribe((data: apiResult) => {
          console.log('apires :::', data);
          this.loadingScreenService.stopLoading();
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
          } else {
            this.alertService.showWarning(data.Message);
          }
          this.transitionService.postEmployeeMigrationSingle(parms).subscribe((response) => {
            console.log(response);
            try {
              this.loadingScreenService.stopLoading();
              let apiResult: apiResult = response;
              if (apiResult.Status) {
                this.alertService.showSuccess(apiResult.Message);
                this.modal_dismiss_Release_AL();
              } else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiResult.Message);
              }
            } catch (error) {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(error);
            }
          }), ((ERROR) => {
            this.alertService.showWarning(ERROR);
            this.loadingScreenService.stopLoading();
          });
          // this.modal_dismiss_Release_AL();
        }, err => {

        })
      }

    }
    catch (error) {
      this.loadingScreenService.stopLoading();
      console.log('confirm button error details : ', error);

    }

  }




  previewLetterForMigration(myObject) {
    this.iframeContent = null;
    $('#popup_previewLetter').modal('show');
    const objId = myObject.hasOwnProperty('CandidateId') ? myObject.CandidateId : myObject.Id;
    let req_param_uri = `Id=${objId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingApi.getCandidate(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      let candidateModel: CandidateModel = new CandidateModel();
      candidateModel = apiResponse.dynamicObject;
      console.log('** candidateModel **', candidateModel);
      let _NewCandidateDetails = candidateModel.NewCandidateDetails;

      var req_post_param = JSON.stringify({

        ModuleProcessTranscId: _NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
        CandidateDetails: _NewCandidateDetails
      });
      console.log(JSON.stringify(req_post_param));
      this.onboardingApi.postPreviewLetter(req_post_param).subscribe(data => {
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
            var content = 'data:' + contentType + ';base64,' + encodeURIComponent(base64);
            this.iframeContent = this.sanitizer.bypassSecurityTrustResourceUrl(content);
            console.log(this.iframeContent);
          }
        } else {
          this.alertService.showWarning(apiResult.Message);
        }
      });
    }, (err) => {
      this.alertService.showWarning(`Something is wrong!  ${err}`);
    });
  }

  revise_offer(item) {
    console.log('make an offer', item);
    this.selectedmigrationRecords = [];
    this.selectedmigrationRecords = item;
    if (this.selectedmigrationRecords.length > 1) {
      this.alertService.showWarning("Sorry! Please select only one candidate to make a new offer");
      this.loadingScreenService.stopLoading();
    } else {
      this.alertService.confirmSwal("Are you sure you want to make a new offer?", "", "Yes, Continue").then(result => {
        let jsonStr = null;

        // this.loadingScreenService.startLoading();
        // let request_params = `moduletransactionId=${item[0].ModuleTransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;
        // this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
        //   let apiResult: apiResult = result;
        //   if (apiResult.Status) {
        //     this.loadingScreenService.stopLoading();
        //     this.headerService.doCheckRedoOffer(false);
        //     this.headerService.doCheckRedoOffer(true);
        //     const _Id = 0;

        if (item[0].IsNapsBased) {

          if (sessionStorage.getItem("SearchPanel1") != null) {
            var SearchElementList: SearchElement[] = JSON.parse(sessionStorage.getItem("SearchPanel1"));
            var clientList = SearchElementList.find(a => a.FieldName.toUpperCase() == "@CLIENTID");
            console.log('clientList', clientList);

            if (clientList.DropDownList.length > 0) {
              this.LstClient = clientList.DropDownList;
              this.onChangeClient((clientList.DropDownList.find(a => a.Id == clientList.Value)), 'TS');
            }
          }

          this.defaultSearchInputs.ClientId = item[0].ClientId;
          this.defaultSearchInputs.ClientContractId = item[0].ClientContractId;
          this.defaultSearchInputs.ClientName = item[0].ClientName;
          this.defaultSearchInputs.ClientContractName = item[0].ClientContractName;
          this.defaultSearchInputs.IsNapBased = item[0].IsNapsBased;
          this.defaultSearchInputs.IsReOnboard = true;

          $('#popup_reonboarding').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
          });
          return;
        }
        this.router.navigate(['app/onboarding/onboarding_revise'], {
          queryParams: {
            "Idx": btoa(item[0].Id),
            "Cdx": btoa(item[0].CandidateId),
          }
        });

        //   } else {
        //     this.loadingScreenService.stopLoading();
        //     this.alertService.showWarning(apiResult.Message);
        //   }
        // });
      })
        .catch(error => this.loadingScreenService.stopLoading());
    }
  }


  makeAnOfferInMigrationList(item) {
    console.log('migration-make offer', item);
    const jsonStr = null;
    let request_params = `moduletransactionId=${item[0].ModuletransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;
    this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status) {

        this.loadingScreenService.stopLoading();
        this.headerService.doCheckRedoOffer(false);
        this.headerService.doCheckRedoOffer(true);

        this.loadingScreenService.stopLoading();
        this.alertService.confirmSwal("Are you sure you want to make an offer?", "", "Yes, Continue").then(result => {
          if (result) {
            try {
              this.router.navigate(['app/onboarding/onboarding_revise'], {
                queryParams: {
                  "Idx": btoa(item[0].Id),
                  "Cdx": btoa(item[0].CandidateId),
                }
              });
            } catch (error) {
              console.log('make an offer error while redirecting', error);
            }
          }
        })
      }
    });
  }

  updateCandidateOfferDetailAsNotJoined(item) {
    this.selectedmigrationRecords = [];
    this.selectedmigrationRecords = item;
    if (this.selectedmigrationRecords[0].IsPayrolled == 1) {
      this.alertService.showWarning("Oops! the selected employee is not valid");
      return;
    }
    else {
      this.alertService.confirmSwal("Are you sure you want to cancel the offer?", `This action will cancel the offer request.`, "Yes, Continue").then(result => {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })

        swalWithBootstrapButtons.fire({
          title: "Remarks",
          animation: false,
          showCancelButton: false, // There won't be any cancel button
          input: 'textarea',
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
          let jsonObj = inputValue;
          let jsonStr = jsonObj.value;
          this.loadingScreenService.startLoading();
          console.log('item', item);
          let request_params = `moduletransactionId=${item[0].ModuleTransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;
          this.searchService.updateCandidateOfferDetailAsNotJoined(request_params).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.selectedmigrationRecords = [];
              // this.getPageLayout();
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          });
        });
      })
        .catch(error => this.loadingScreenService.stopLoading());
    }
  }

  ReGenerateAL(item) {
    this.selectedmigrationRecords = [];
    this.selectedmigrationRecords = item;
    console.log('ReGenerateAL', this.selectedmigrationRecords);
    if (this.selectedmigrationRecords[0].IsReadyForRegenerate == 0) {
      this.alertService.showWarning("Oops! the selected employee is not valid for regenerate AL");
    } else {
      this.router.navigate(['app/onboarding/regenerateLetter'], {
        queryParams: {
          "Idx": btoa(this.selectedmigrationRecords[0].CandidateId),
        }
      });
    }
  }

  onKeyUpInCCMail(event: KeyboardEvent, item, e): void {
    const inputValue: string = e.target.value;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addCCTag(inputValue, item);
        e.target.value = '';
        // this.tagInputRef.nativeElement.value  = '';
      }
    }
  }

  onchangeCCMail(event: any, item) {
    console.log('event', event.target.value);;
    console.log('item', item);
    let tag = event.target.value;

    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
        tag = tag.slice(0, -1);
      }
      if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
        this.ccmailtags.push(tag);
        this.selectedmigrationRecords.forEach(element => {
          if (element.Id == item.Id) {
            element.ccmailtags.push(tag);
          }
        });
      }
      event.target.value = null;
    }
    else {
      event.target.value = null;
    }
  }

  removeCCTag(tag?: string, items?: any): void {
    console.log('t', tag);
    console.log('b', items);
    this.selectedmigrationRecords.forEach(element => {
      if (element.Id === items.Id) {
        const index: number = element.ccmailtags.indexOf(tag);
        if (index !== -1) {
          element.ccmailtags.splice(index, 1);
        }
      }
    });
  }

  addCCTag(tag: any, item): void {
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
          this.selectedmigrationRecords.forEach(element => {
            if (element.Id == item.Id) {
              element.ccmailtags.push(tag);
            }
          });
        }
      } else {
        this.CCemailMismatch = true;
      }
      // return matches ? null : { 'invalidEmail': true };
    } else {
      return null;
    }
  }


  // ADD NEW USER DETAILS 

  public do_add_users(rowData): void {

    console.log('click::::::::::::::');
    const modalRef = this.modalService.open(UsersComponent, this.modalOption);
    modalRef.componentInstance.rowData = rowData;

    modalRef.result.then((result) => {
      this.do_Refresh();
    }).catch((error) => {
      console.log(error);
    });


  }


  // show drawer for resignation details
  openResignationDetailsDrawer(rowData) {
    console.log('rowData', rowData.Status)
    const drawerRef = this.drawerService.create<ResignationListDetailsComponent, { rowData }, string>({
      nzTitle: 'Employee Exit Details',
      nzContent: ResignationListDetailsComponent,
      nzWidth: 940,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: rowData
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Resignation Details Drawer(Component) Open');
    });
    drawerRef.afterClose.subscribe((data: any) => {
      console.log('Resignation Details Closed', data);
      if (data != undefined && data.isOpenRejectDrawer == true) {
        this.approveRejectResignationDrawer(rowData, 'reject');
      } else if (data != undefined && data.isOpenApproveDrawer == true) {
        if (this.RoleCode == 'CorporateHR') {
          this.approveResignationByCorporateHR(rowData, 'approve');
        } else {
          this.approveRejectResignationDrawer(rowData, 'approve'); // manager showing drawer 
        }
      } else {
        this.getPageLayout();
      }
    });
  }

  approveResignationByCorporateHR(rowData, status) {

    const resignationMgrData = {
      "Comments": '',
      "RelievingDate": rowData.ApprovedRelievingDate,
      "ResigId": rowData.Id,
      "Button": status,
      "FnFTransactionType": rowData.FnFTransactionType
    }
    console.log('approve resignation by corp hr rowData ', rowData);
    console.log('resignationMgrData', resignationMgrData);
    this.loadingScreenService.startLoading()
    this.employeeService.ValidateResignationByHR(JSON.stringify(resignationMgrData)).subscribe((result) => {
      let apiR: apiResult = result;
      this.loadingScreenService.stopLoading();
      if (apiR.Status) {
        this.alertService.showSuccess('The request was successfully verified.');
        this.do_Refresh();
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiR.Message);
        this.do_Refresh();
      }
    })
  }

  revokeFnF() {
    let selectedEmployeeLst = this.selectedItems;
    if (selectedEmployeeLst == undefined || selectedEmployeeLst == null || selectedEmployeeLst.length == 0) {
      this.alertService.showWarning('Please select atleast one row!');
      return;
    }

    let lstEmployeeId: number[] = [];

    selectedEmployeeLst.forEach(obj => {
      lstEmployeeId.push(obj.EmployeeId);
    })


    let dataSource: DataSource = {
      Name: 'RevokeFnF',
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    // let searchElementList: SearchElement[] = [
    //   {
    //     FieldName: '@employeeIds',
    //     Value: JSON.stringify(lstEmployeeId)
    //   }
    // ]

    this.alertService.confirmSwalWithClose('Confirm?', "Are you sure you want to proceed?", 'Ok!', 'No, cancel!',).then((result) => {
      this.alertService.confirmSwalWithRemarks('Revoke Remarks').then((result) => {
        if (result != false) {
          const payload = {
            "employeeIds": JSON.stringify(lstEmployeeId),
            "remarks": result as any
          }
          this.callRevokeSeparation(payload);
          return;
        }
      }).catch(error => {
      });
    }).catch(error => {
    });

    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-primary',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: true,
    // })

    // swalWithBootstrapButtons.fire({
    //   title: 'Confirm?',
    //   text: "Are you sure you want to proceed?",
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Ok!',
    //   cancelButtonText: 'No, cancel!',
    //   allowOutsideClick: false,
    //   reverseButtons: true
    // }).then((result) => {
    //   console.log(result);

    //   if (result.value) {


    // this.pageLayoutService.getDataset(dataSource, searchElementList).subscribe(data => {
    //   console.log("Revoke FnF result", data);
    //   this.loadingScreenService.stopLoading();
    //   if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
    //     this.revokeFnfCoprHRresponseList = JSON.parse(data.dynamicObject);
    //     $('#popup_displayResult').modal('show');
    //     this.do_Refresh();
    //   } else {
    //     this.alertService.showWarning("Error Occured. Error ->" + data.Message);
    //   }
    // }, error => {
    //   this.loadingScreenService.stopLoading();
    //   this.alertService.showWarning("Something went wrong, Please try again");
    //   console.error(error);
    // })
    //   } else if (result.dismiss === Swal.DismissReason.cancel) {

    //     swalWithBootstrapButtons.fire(
    //       'Cancelled',
    //       'Your request has been cancelled',
    //       'error'
    //     )
    //   }
    // })
  }

  callRevokeSeparation(payload) {
    this.loadingScreenService.startLoading();
    this.employeeService.RevokeSeparation(payload).subscribe(data => {
      console.log("Revoke FnF result", data);
      this.loadingScreenService.stopLoading();
      if (data.Status) {
        // this.revokeFnfCoprHRresponseList = this.parseIfJson(data.Result);
        // $('#popup_displayResult').modal('show');
        this.do_Refresh();
      } else {
        this.alertService.showWarning("Error Occured. Error ->" + data.Message);
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Something went wrong, Please try again");
      console.error(error);
    })
  }

  parseIfJson(value: any): any {
    try {
        return JSON.parse(value);
    } catch (e) {
        return value;
    }
}

  modal_dismiss_displayResult() {
    $('#popup_displayResult').modal('hide');
  }


  getResignationHistory() {
    if (this.selectedItems.length == 0 || this.selectedItems.length > 1) {
      this.alertService.showWarning('Please select exactly one item to view the resignation history.');
      return;
    }
    const employeeId = this.selectedItems[0].EmployeeId;
    const transactionType = this.selectedItems[0].FnFTransactionType == 0 ? 1 : 2;
    this.loadingScreenService.startLoading();
    this.employeeService.GetEmployeeExitTransactionHistory(employeeId, transactionType)
      .pipe(
        takeUntil(this.unsubscribe$),
        catchError(error => {
          this.handleError(error);
          return of(null);
        }))
      .subscribe((result) => {
        let apiResponse: apiResult = result;
        this.loadingScreenService.stopLoading();
        try {
          if (apiResponse.Status) {
            let data = { ExitTransactionHistoryLog : JSON.parse(apiResponse.Result)};
            const modalRef = this.modalService.open(ResignationHistoryComponent);
            modalRef.componentInstance.data = data;
            modalRef.result.then((result) => {
              if (result) {
                console.log(result);
              }
            });
          } else {
            this.alertService.showWarning(apiResponse.Message);
            return;
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
          console.log('Exception Error : ', error);
        }
      }, error=> {
        this.loadingScreenService.stopLoading();
      });


  }

  // show drawer for manager to approve/reject resignation
  approveRejectResignationDrawer(rowData, status) {
    console.log('rowData', status)
    if (rowData.Status == 'Pending') {
      const drawerRef = this.drawerService.create<ResignationApproveRejectModalComponent, { rowData: any, title: string, RoleCode: string }, string>({
        nzTitle: '',
        nzContent: ResignationApproveRejectModalComponent,
        nzWidth: 553,
        nzClosable: false,
        nzMaskClosable: false,
        nzContentParams: {
          rowData: rowData,
          title: status,
          RoleCode: this.RoleCode
        }
      });

      drawerRef.afterOpen.subscribe(() => {
        console.log('Resignation Details Drawer(Component) Open');

      });
      drawerRef.afterClose.subscribe(data => {
        this.getPageLayout();
      });
    } else {
      this.alertService.showWarning('Cannot change since the status for the selected employee is ' + rowData.Status);
    }
  }

  // to redirect to online kit page for OPS login
  showOnlineJoiningKitForAnEmployee() {
    console.log('ONLINE KIT', this.selectedItems);
    const employeeId = this.selectedItems[0].EmployeeId;
    const candidateId = this.selectedItems[0].CandidateId;
    if (this.selectedItems.length > 1) {
      return this.alertService.showInfo("Please choose only 1 employee");
    } else {
      this.router.navigate(['/app/ess/onlineJoiningKit'], {
        queryParams: {
          "Idx": btoa(employeeId),
          "Cdx": btoa(candidateId),
          "status": btoa(this.selectedItems[0].Status)
        }
      });
    }
  }

  // EMPLOYEE REQUEST FOR MAKER CHECKER
  doOpenEmployeePreviewScreen(rowData) {
    this.employeeProfile = rowData;
    this.IsNewEmployeeRequest = false;
    this.employeeProfileCandidateDocuments = [];
    let empNewValue = JSON.parse(this.employeeProfile.NewValue);
    this.IsNewEmployeeRequest = empNewValue.Id > 0 ? false : true;
    this.employeeProfileCandidateDocuments = empNewValue.CandidateDocuments;
    console.log('empNewValue Documents', empNewValue);

    $("#modal_employeepreview_aside_left").modal('show');
  }

  dismiss_employeepreview() {
    this.employeeProfile = null;
    $("#modal_employeepreview_aside_left").modal('hide');
  }

  previewSalaryBreakup() {
    let empNewValue = JSON.parse(this.employeeProfile.NewValue);
    this.OfferData = empNewValue.EmploymentContracts[0].LstRateSets[0].RatesetProducts;
    console.log('sdfds', this.OfferData);

    $("#modal_employeepreview_breakup").modal('show');

  }

  doCheckEditableAnnualPayComponent(item) {

    if (this.EditableAnnualPayComponent != null && this.EditableAnnualPayComponent.length > 0) {
      return this.EditableAnnualPayComponent.includes(item.ProductCode) ? true : false;
    } else {
      return true;
    }
  }

  getDocumentTypeName(documentTypeId) {


    return this.employeeProfile && this.employeeProfile.DocumentTypes && this.employeeProfile.DocumentTypes != null && this.employeeProfile.DocumentTypes.length > 0 &&
      this.employeeProfile.DocumentTypes.find(a => a.Id == documentTypeId) != undefined ?
      this.employeeProfile.DocumentTypes.find(a => a.Id == documentTypeId).Name : "---"
  }

  doApproveReject(isApprove) {

    if (!isApprove) {
      $("#modal_employeepreview_aside_left").modal('hide');
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
        title: "Are you sure you wish to reject the new employee request? Please provide a rejection reason.",
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputValue: '',
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
          this.loadingScreenService.startLoading();
          this.employeeRequestFinalSubmission(jsonStr, isApprove)
        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
          $("#modal_employeepreview_aside_left").modal('show');
        }
      })
    }
    else {
      this.alertService.confirmSwal1("Confirmation", "An employee code will be generated for this approval. Would you really want to approve this request?", "Yes, Approve", "No, Cancel").then((result) => {
        this.employeeRequestFinalSubmission('', isApprove);
      }).catch(error => {
      });
    }

  }

  employeeRequestFinalSubmission(remarks: string = '', isApprove) {
    const empApprovalData = {
      "Comments": remarks,
      "MCTransactionId": this.employeeProfile.Id,
      "Status": isApprove ? 'APPROVE' : 'REJECT',
      "EmployeeId": 0

    }
    console.log('PYD #0034 ::', empApprovalData);
    this.loadingScreenService.startLoading()
    this.employeeService.ValidateEmployeeRequestApprovalByHR(JSON.stringify(empApprovalData)).subscribe((result) => {
      let apiR: apiResult = result;
      $("#modal_employeepreview_aside_left").modal('hide');
      this.loadingScreenService.stopLoading();
      if (apiR.Status) {
        this.alertService.showSuccess1(apiR.Message, 20000);
        this.do_Refresh();
        this.dismiss_employeepreview();
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiR.Message);
        this.do_Refresh();
        this.dismiss_employeepreview();
      }
    })
  }

  editEmployeeDetails() {
    this.rowDataService.dataInterface.RowData = this.selectedItems[0];
    this.router.navigate(['app/ess/employee']);
    this.dismiss_employeepreview();
  }

  addNewInvestmentSubmissionSlot() {
    this.router.navigate(['app/investmentSubmissionSlot']);
  }

  editInvestmentSubmissionSlot() {
    console.log('EDIT SLOT', this.selectedItems[0]);
    const drawerRef = this.drawerService.create<UpdateInvestmentSubmissionSlotComponent, { rowData: any, action: string }, string>({
      nzTitle: 'UPDATE',
      nzContent: UpdateInvestmentSubmissionSlotComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: this.selectedItems[0],
        action: 'edit'
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Investment slot Drawer(Component) Open');

    });
    drawerRef.afterClose.subscribe(data => {
      this.selectedItems = [];
      this.getPageLayout();
    });
  }

  inactiveOrDeleteInvestmentSubmissionSlot() {
    console.log('DELETE SLOT', this.selectedItems);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'NO, make it inactive!',
      reverseButtons: true
    }).then((result) => {
      console.log(result);
      if (result.value) {
        const drawerRef = this.drawerService.create<UpdateInvestmentSubmissionSlotComponent, { rowData: any, action: string }, string>({
          nzTitle: '',
          nzContent: UpdateInvestmentSubmissionSlotComponent,
          nzWidth: 553,
          nzClosable: false,
          nzMaskClosable: false,
          nzContentParams: {
            rowData: this.selectedItems[0],
            action: 'delete'
          }
        });

        drawerRef.afterOpen.subscribe(() => {
          console.log('Investment slot Drawer(Component) Open');

        });
        drawerRef.afterClose.subscribe(data => {
          this.selectedItems = [];
          this.getPageLayout();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const drawerRef = this.drawerService.create<UpdateInvestmentSubmissionSlotComponent, { rowData: any, action: string }, string>({
          nzTitle: '',
          nzContent: UpdateInvestmentSubmissionSlotComponent,
          nzWidth: 553,
          nzClosable: false,
          nzMaskClosable: false,
          nzContentParams: {
            rowData: this.selectedItems[0],
            action: 'inactive'
          }
        });

        drawerRef.afterOpen.subscribe(() => {
          console.log('Investment slot Drawer(Component) Open');

        });
        drawerRef.afterClose.subscribe(data => {
          this.selectedItems = [];
          this.getPageLayout();
        });
      }
    });

  }

  addNewFBPSubmissionSlot() {
    this.router.navigate(['app/flexibleBenefitPlan/createNewFbpSlot']);
  }

  editFBPSubmissionSlot() {
    console.log('EDIT FBP SLOT', this.selectedItems[0]);
    const drawerRef = this.drawerService.create<UpdateFbpSubmissionSlotComponent, { rowData: any, action: string }, string>({
      nzTitle: 'UPDATE',
      nzContent: UpdateFbpSubmissionSlotComponent,
      nzWidth: 553,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: this.selectedItems[0],
        action: 'edit'
      }
    });
    drawerRef.afterOpen.subscribe(() => {
      console.log('FBP slot Drawer(Component) Open');

    });
    drawerRef.afterClose.subscribe(data => {
      this.selectedItems = [];
      this.getPageLayout();
    });
  }

  inactiveOrDeleteFBPSubmissionSlot() {
    console.log('DELETE FBP SLOT', this.selectedItems);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'NO, make it inactive!',
      reverseButtons: true
    }).then((result) => {
      console.log(result);
      if (result.value) {
        const drawerRef = this.drawerService.create<UpdateFbpSubmissionSlotComponent, { rowData: any, action: string }, string>({
          nzTitle: '',
          nzContent: UpdateFbpSubmissionSlotComponent,
          nzWidth: 553,
          nzClosable: false,
          nzMaskClosable: false,
          nzContentParams: {
            rowData: this.selectedItems[0],
            action: 'delete'
          }
        });
        drawerRef.afterOpen.subscribe(() => {
          console.log('FBP slot Drawer(Component) Open');

        });
        drawerRef.afterClose.subscribe(data => {
          this.selectedItems = [];
          this.getPageLayout();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        const drawerRef = this.drawerService.create<UpdateFbpSubmissionSlotComponent, { rowData: any, action: string }, string>({
          nzTitle: '',
          nzContent: UpdateFbpSubmissionSlotComponent,
          nzWidth: 553,
          nzClosable: false,
          nzMaskClosable: false,
          nzContentParams: {
            rowData: this.selectedItems[0],
            action: 'inactive'
          }
        });
        drawerRef.afterOpen.subscribe(() => {
          console.log('FBP slot Drawer(Component) Open');

        });
        drawerRef.afterClose.subscribe(data => {
          this.selectedItems = [];
          this.getPageLayout();
        });
      }
    });
  }

  viewFBPSubmissionForApprovalRejection() {
    if (this.selectedItems[0].Status.toLowerCase() === "submitted") {
      this.router.navigate(['app/flexibleBenefitPlan/flexiBenefitPlanDeclaration'], {
        queryParams: {
          "Mdx": btoa('approval'),
          "Edx": btoa(this.selectedItems[0].FBPSlotId),
          "Idx": btoa(this.selectedItems[0].EmployeeId),
          "Rdx": btoa('manager')
        }
      });
    } else {
      this.router.navigate(['app/flexibleBenefitPlan/flexiBenefitPlanDeclaration'], {
        queryParams: {
          "Mdx": btoa('view'),
          "Edx": btoa(this.selectedItems[0].FBPSlotId),
          "Idx": btoa(this.selectedItems[0].EmployeeId),
          "Rdx": btoa('manager')
        }
      });
    }
  }

  deleteProduct(data: any) {
    this.alertService.confirmSwal1("Confirmation", "Are you sure you want to delete this product ?", "Yes, Delete", "No, Cancel").then((result) => {
      this.loadingScreenService.startLoading();
      let deleteData = {
        Id: data.Id,
        Code: data.Code
      };
      console.log('DELETE PRODUCT', deleteData);
      this.productService.deleteProduct(deleteData).subscribe(result => {
        this.loadingScreenService.stopLoading();
        if (result.Status) {
          this.alertService.showSuccess(result.Message);
          this.getDataset();
        } else {
          this.alertService.showWarning(result.Message);
        }
      }, (error) => {
        console.log('DELETE PRODUCT API ERROR--->', error);
      });

    }).catch(error => {
    });
  }

  deletePayGroup(data: any) {
    this.alertService.confirmSwal1("Confirmation", "Are you sure you want to delete this paygroup ?", "Yes, Delete", "No, Cancel").then((result) => {
      this.loadingScreenService.startLoading();
      let deleteData = {
        Id: data.Id,
        Code: data.Code
      };
      console.log('DELETE PAYGROUP', deleteData);
      this.paygroupService.deletePaygroup(deleteData).subscribe(result => {
        this.loadingScreenService.stopLoading();
        if (result.Status) {
          this.alertService.showSuccess(result.Message);
          this.getDataset();
        } else {
          this.alertService.showWarning(result.Message);
        }
      }, (error) => {
        console.log('DELETE PAY GROUP API ERROR--->', error);
      });

    }).catch(error => {
    });
  }


  // doTaxCalculator() {

  //   if (this.selectedItems.length > 1) {
  //     this.alertService.showInfo("Please choose only one employee");
  //   }

  //   if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
  //     this.alertService.showInfo("Choose an employee so that tax calculations can be performed.");
  //   }



  //   let empTransObject = {
  //     ActionMenuName: "EMPLOYEELIST",
  //     EmployeeId: this.selectedItems[0].EmployeeId,
  //     EmployeeRateSet: null,
  //     ReDirectURL: this.router.url
  //   }


  //   this.sharedDataService.SetEmployeeObjecct(empTransObject);
  //   this.router.navigate(['/app/investment/taxCalculator']);
  // }


  doTaxCalculator() {

    if (this.selectedItems.length > 1) {
      this.alertService.showInfo("Please choose only one employee");
      return;
    }

    if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
      this.alertService.showInfo("Choose an employee so that tax calculations can be performed.");
      return;
    }


    const modalRef = this.modalService.open(TaxcalculatorComponent, this.modalOption);
    modalRef.componentInstance.EmployeeId = this.selectedItems[0].EmployeeId;
    modalRef.componentInstance.employeedetails = null;
    modalRef.componentInstance.RedirectPage = 'StandAlone';
    modalRef.componentInstance.LstAllDeclarationProducts = [];
    modalRef.componentInstance.selectedFinYear = 0;
    modalRef.componentInstance.IsNewTaxRegimeOpted = null;
    modalRef.componentInstance.currentFinYear = 0;
    modalRef.componentInstance.currentEmployeeRateset = null;
    modalRef.componentInstance.LstEmployeeInvestmentLookup = null;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  // Notification History - Message Queue

  resendNotificationMessage() {

    if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
      this.alertService.showInfo("Please select at least one item to trigger the message.");
      return;
    }

    this.loadingScreenService.startLoading();
    const notificationIds = [];

    this.selectedItems.forEach(e1 => {
      notificationIds.push(e1.Id);
    });

    console.log('NotificationIds :: ', notificationIds);

    this.employeeService.ResendNotificationMessage(notificationIds).subscribe(result => {
      const apiR: apiResult = result;
      console.log('NOTIFICATION RESULT ::', apiR);
      this.loadingScreenService.stopLoading();
      this.getDataset();
      // if (result.Status) {
      //   this.alertService.showSuccess(result.Message);

      // } else {
      //   this.alertService.showWarning(result.Message);
      // }
    }, (error) => {
      console.log('DELETE PAY GROUP API ERROR--->', error);
    });
  }

  doExtendingDOJ() {

    if (this.selectedItems.length > 1) {
      this.alertService.showInfo("possible to select only one item at a time");
      return;
    }

    if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
      this.alertService.showInfo("Choose an item so that extended DOJ can be performed.");
      return;
    }

    if (this.selectedItems[0].ProcessstatusId != 9800) {
      this.alertService.showWarning('The action was blocked. One or more candidate items cannot be released because the status is in an invalid state.');
      return;
    }



    console.log('this.selectedItems', this.selectedItems);

    let selectedObject = {
      CandidateName: this.selectedItems[0].CandidateName,
      ActualDateOfJoining: this.selectedItems[0].ActualDateOfJoining,
      ClientName: this.selectedItems[0].ClientName,
      Designation: this.selectedItems[0].Designation,
      CandidateId: this.selectedItems[0].CandidateId,
      ClientId: this.selectedItems[0].ClientId,
      ClientContractId: this.selectedItems[0].ClientContractId,
      Id: this.selectedItems[0].Id,
    };

    const modalRef = this.modalService.open(OnboardingExtendedDetailsComponent, this.modalOption);
    modalRef.componentInstance.currentRowObject = selectedObject;
    modalRef.componentInstance.selectedmigrationRecords = this.selectedmigrationRecords;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.getDataset();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  showSalaryCountForSalaryCreditReport(rowData, salaryType) {
    const params = {
      distributorId: rowData.DistributorId ? rowData.DistributorId : this.pageLayout.SearchConfiguration.SearchElementList.find(c => c.FieldName === "@DistributorId").Value,
      payPeriodId: this.pageLayout.SearchConfiguration.SearchElementList.find(c => c.FieldName === "@payperiodId").Value,
      type: salaryType
    }
    console.log('params', params);
    const drawerRef = this.drawerService.create<ViewEmployeeInSalaryCreditReportComponent, { rowData: any, params: any }, string>({
      nzTitle: 'Salary Credit Report',
      nzContent: ViewEmployeeInSalaryCreditReportComponent,
      nzWidth: 940,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: rowData,
        params: params
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Drawer(Component) open');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log('data', data);

      var modalResult = (data) as any;
      if (data != undefined) {

      }

    });

  }
  // Add new employee record

  addNewEmployee(): void {

    this.router.navigate(['app/ess/employee'])
      .then(nav => {
        console.log(nav);
      }, err => {
        console.log(err)
      });

  }

  // doExtendingDOJ() {

  //   if (this.selectedItems.length > 1) {
  //     this.alertService.showInfo("possible to select only one item at a time");
  //     return;
  //   }

  //   if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
  //     this.alertService.showInfo("Choose an item so that extended DOJ can be performed.");
  //     return;
  //   }

  //   if (this.selectedItems[0].ProcessstatusId != 9800) {
  //     this.alertService.showWarning('The action was blocked. One or more candidate items cannot be released because the status is in an invalid state.');
  //     return;
  //   }

  //   console.log('this.selectedItems', this.selectedItems);

  //   let selectedObject = {
  //     CandidateName: this.selectedItems[0].CandidateName,
  //     ActualDateOfJoining: this.selectedItems[0].ActualDateOfJoining,
  //     ClientName: this.selectedItems[0].ClientName,
  //     Designation: this.selectedItems[0].Designation,
  //     CandidateId: this.selectedItems[0].CandidateId,
  //     ClientId: this.selectedItems[0].ClientId,
  //     ClientContractId: this.selectedItems[0].ClientContractId,
  //     Id: this.selectedItems[0].Id,
  //   };

  //   const modalRef = this.modalService.open(OnboardingExtendedDetailsComponent, this.modalOption);
  //   modalRef.componentInstance.currentRowObject = selectedObject;
  //   modalRef.result.then((result) => {
  //     if (result != "Modal Closed") {
  //       this.getDataset();
  //     } else {
  //     }
  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }

  doaddNewClient(rowData) {
    const modalRef = this.modalService.open(ClientComponent, this.modalOption);
    modalRef.componentInstance.Id = rowData.Id;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.getDataset();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }



  addNewTeam(rowData, isEditMode: boolean = false) {

    const modalRef = this.modalService.open(TeamComponent, this.modalOption);
    if (isEditMode) modalRef.componentInstance.Id = rowData.Id;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.getDataset();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  addNewCostCode(rowData) {
    console.log('rowData', rowData);

    const modalRef = this.modalService.open(CostcodeComponent, this.modalOption);
    modalRef.componentInstance.Id = rowData.Id;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.getDataset();
      } else {
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  addNewClientContract() {
    this.rowDataService.dataInterface.RowData = 'isAdd';
    this.router.navigate(['app/masters/clientContract'])
      .then(nav => {
        this.rowDataService.dataInterface.RowData = 'isAdd';
      }, err => {
        console.log(err)
      });

  }


  // RELEAS AL
  onAddingFile(e) {

    let files = e.target.files;
    let fileSize: any = 0;
    for (let i = 0; i < files.length; i++) {
      fileSize += files[i].size;
    }
    var compressedFileSize = fileSize / 1024 / 1024;
    if ((compressedFileSize > 2)) {
      this.alertService.showWarning('The attachment size exceeds the allowable limit.');
      return;
    }
    this.fileList.push(...files);
    this.hasFileChange = true;

  }

  generateZipFile(approvalsObject) {
    const initialDocumentId = approvalsObject.ObjectStorageId;
    /* #region  AFTER JSZIP */
    if (initialDocumentId) {
      this.uploadingSpinnerText = "Loading";
      try {

        this.fileuploadService.getObjectById(initialDocumentId)
          .subscribe((dataRes) => {
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              return;
            }
            var objDtls = dataRes.Result;
            this.fileList = [];
            this.fileObject = [];
            var fileNameSplitsArray = approvalsObject.DocumentName.split('.');
            var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
            if (ext.toUpperCase().toString() != "ZIP") {
              this.urltoFile(`data:${objDtls.Attribute1};base64,${objDtls.Content}`, objDtls.ObjectName, objDtls.Attribute1)
                .then((file) => {
                  console.log(file);
                  try {
                    this.fileList.push(file)
                    this.hasFileChange = false;
                  } catch (error) {
                    alert((error))
                    console.log('push ex', error);
                  }
                });
            }
            if (ext.toUpperCase().toString() == "ZIP") {
              var zip = new JSZip();
              zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
                Object.keys(contents.files).forEach((filename) => {
                  if (filename) {
                    this.fileList.push(contents.files[filename]);
                    zip.files[filename].async('blob').then((fileData) => {
                      this.fileObject.push(new File([fileData], filename));
                      console.log('fileObject', this.fileObject);
                    });
                  }
                });
              });
            }
          });


      } catch (error) {
        console.log('EDX', error);

      }
    }
  }

  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }


  doAsyncUpload_RequestDOJ(filebytes, filename, item, IsCandidate, entityId, objStorageJson) { // already exists need to club it into one file 


    const promise = new Promise((resolve, reject) => {

      try {
        let objStorage = new ObjectStorageDetails();
        objStorage.Id = 0;
        IsCandidate == true ? objStorage.CandidateId = entityId :
          objStorage.EmployeeId = entityId;

        objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
        objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
        objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

        objStorage.ClientContractId = objStorageJson.ClientContractId;
        objStorage.ClientId = objStorageJson.ClientId;
        objStorage.CompanyId = objStorageJson.CompanyId;

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

              resolve(apiResult.Result);
            }
            else {

              this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
              resolve(0);
            }
          } catch (error) {
            this.alertService.showWarning("An error occurred while  trying to upload! " + error);
            resolve(0);
          }
        }), ((err) => {

        })

      } catch (error) {
        this.alertService.showWarning("An error occurred while  trying to upload! " + error);
        resolve(0);
      }
    });
    return promise;

  }



  deleteAsync_RequestDOJ(DocumentId) { // already exists need to club it into one file 


    const promise = new Promise((resolve, reject) => {
      this.fileuploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status) {
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            resolve(true);
          } else {
            this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message);
            resolve(false);
          }
        } catch (error) {

          this.alertService.showWarning("An error occurred while  trying to delete! " + error)
          resolve(false);
        }

      }), ((err) => {

      })
    });
    return promise;

  }

  unsavedDeleteFile(DocumentId) {
    this.fileuploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {

      } catch (error) {
      }
    }), ((err) => {
    })
  }


  doDeleteFile_RequestDOJ(file) { // already exists need to club it into one file 

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })
    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "This item will be deleted immediately. You can't undo this file.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.fileList.splice(this.fileList.indexOf(file), 1);
        this.hasFileChange = true;
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }
  async GettingExistingCandidateHistory() {

    const _candidateId = this.selectedmigrationRecords[0].CandidateId;
    try {
      await this.onboardingService.GetCandidateNewDOJRequestHistorybyCandidateId(_candidateId).subscribe((data) => {
        const apiR: apiResult = data
        if (apiR.Status && apiR.Result) {
          console.log('HISTORY RESULT ::', apiR.Result);
          const apiResult: any = JSON.parse(apiR.Result);
          let payperiodEndDate: Date;
          payperiodEndDate = apiResult.LstPayperiod.EndDate;
          this.approvalsObject = apiResult.LstApprovals != null && apiResult.LstApprovals.length > 0 &&
            apiResult.LstApprovals.find(a => a.ApprovalFor == ApprovalFor.RequestForNewDOJ) != undefined
            ? apiResult.LstApprovals.find(a => a.ApprovalFor == ApprovalFor.RequestForNewDOJ) : null;
          if (this.approvalsObject) {

            this.generateZipFile(this.approvalsObject);
          }

          // if (payperiodEndDate) {
          //   // const new_date = moment(this.payperiodEndDate).add(environment.environment.MaximumExtendedDOJDays, 'days').format("YYYY-MM-DD");
          //   // this.DOJMaxDate = new Date(new_date.toString());
          //   const new_date = moment().add(environment.environment.MaximumExtendedDOJDays, 'days').format("YYYY-MM-DD");
          //   this.MaxDate = new Date(new_date.toString());
          //   if (moment(new_date).format('YYYY-MM-DD') >= moment(payperiodEndDate).format('YYYY-MM-DD')) {
          //     this.MaxDate = new Date(payperiodEndDate);
          //   }
          //   console.log('DOJMaxDate', this.MaxDate);
          //   const new_mindate = moment(payperiodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days').format("YYYY-MM-DD");
          //   this.MinDate = new Date(new_mindate.toString());
          //   console.log('DOJMinDate', this.MinDate);

          //   this.EndDateMinDate = this.MaxDate;
          // }
        }


      }, err => {

      });
    } catch (err) {
      console.error(err);
    }


  }

  exportExcelForITC(code) {
    // console.log(this.dataset);
    if (this.dataset && this.dataset.length > 0) {
      const fileNameMapping = {
        EmployeeDetailsITC: 'employeeDetails_',
        NewJoineeReportITC: 'NewJoineeReport_',
        ResignedReportITC: 'ResignedReport_',
        TDSReportITC: 'TDSReport_',
        LWFReportITC: 'LWFReport_',
        PFReportITC: 'ProvidentFundReport_',
        PTReportITC: 'PTReport_',
        PaysheetITC: 'PaySheetReport_',
        CandidateDetailsReport: 'CandidateDetailsReport_',
        ESICReportITC: 'ESICReport_'
      };

      const fileName = fileNameMapping[code];
      if (fileName) {
        const exportDataWithoutId = this.dataset.map(({ Id, ...rest }) => rest);
        console.log(`:::: EXPORT ${fileName}::::`, exportDataWithoutId);
        this.excelService.exportAsExcelFile(exportDataWithoutId, fileName);
      }
    }



  }


  updateManagerMapping(rowData) {
    console.log(rowData);
    const drawerRef = this.drawerService.create<UpdateManagerMappingModalComponent, { rowData: any }, string>({
      nzTitle: 'Update Manager Mapping',
      nzContent: UpdateManagerMappingModalComponent,
      nzWidth: 500,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        rowData: Array.isArray(rowData) ? rowData : [rowData]
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('Manager Mapping Cmp Opened');
    });

    drawerRef.afterClose.subscribe(data => {
      console.log('data', data);
      this.getDataset();
    });
  }

  async onChangeClientContract(ev, actionName) {
    try {
      console.log('ev', ev);

      this.hasFailedInput = false;
      this.failedAlertMessage = "";

      if (!ev.IsNapBased) {
        this.hasFailedInput = true;
        this.failedAlertMessage = "Kindly, choose a contract based on NAPS. The contract you've selected is unavailable for NAPS onboarding.";
        return;
      }
      this.defaultSearchInputs.ClientContractId = ev.Id;
      this.defaultSearchInputs.ClientContractName = ev.Name;
      this.defaultSearchInputs.IsNapBased = true;

    } catch (error) {
    }
  }

  async onChangeClient(ev, actionName) {
    try {
      if (actionName == "DOM") {
        this.defaultSearchInputs.ClientContractId = null;
        this.LstClientContract = [];
      }
      await this.clientcontractService.getClientContract(ev.Id).subscribe((response: apiResponse) => {
        if (response.Status) {

          this.LstClientContract = response.dynamicObject;
        }
      },
        (err) => {

        });
    } catch (error) {

    }
  }

  doConfirmReOnboard() {

    this.hasFailedInput = false;
    this.failedAlertMessage = "";

    if (this.defaultSearchInputs.ClientContractId == null || this.defaultSearchInputs.ClientId == null) {
      this.hasFailedInput = true;
      this.failedAlertMessage = "You must choose a Client/Contract before moving ahead.";
      return;
    }
    if (!this.defaultSearchInputs.IsNapBased) {
      this.hasFailedInput = true;
      this.failedAlertMessage = "Kindly, choose a contract based on NAPS. The contract you've selected is unavailable for NAPS onboarding.";
      return;
    }

    $('#popup_reonboarding').modal('hide');
    console.log('this.defaultSearchInputs', this.defaultSearchInputs);

    const modalRef1 = this.modalService.open(NapsOnboardingComponent, this.modalOption);
    modalRef1.componentInstance.CandidateBasicDetails = null;
    modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
    modalRef1.componentInstance.CandidateId = this.selectedmigrationRecords[0].CandidateId;
    modalRef1.result.then((result) => {
      console.log('result', result);
      if (result == 'Modal Closed') {
        this.getDataset();
      }

    }).catch((error) => {
      console.log(error);
    });

  }
  modaldismiss3() {
    $('#popup_reonboarding').modal('hide');
  }

  modalDismissBulkUpload() {
    this.onFileInputChange();
    this.modalSpinner = false;
    $('#popup_bulkUpload').modal('hide');
  }

  getWeekOffForEachEmployee(obj) {
    return Object.keys(obj)
      .filter(key => obj[key] === true)
      .toString();
  }

  doShiftWeekOffBulkUpload(code) {
    $('#popup_bulkUpload').modal('show');
  }

  onFileInputChange() {
    this.file = null;
    this.uploadedErrorMessage = "";
    this.bulkFile.nativeElement.files = null;
    this.bulkFile.nativeElement.value = '';
    this.shiftWeekOffBulkImportData = [];
  }


  handleFileInput(files: FileList) {
    this.file = files.item(0);
    if (this.file == undefined || this.file == null) {
      this.alertService.showWarning("Please select a file to upload");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e: any) => {
      // read workbook
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellText: false, cellDates: true, dateNF: 'dd-mm-yyyy' });
      // grab first sheet
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];
      // save data
      let jsonData = XLSX.utils.sheet_to_json(ws, { raw: false, dateNF: 'dd-mm-yyyy' });
      // check Excel file has data
      if (jsonData && jsonData.length == 0) {
        this.shiftWeekOffBulkImportData = [];
        this.uploadedErrorMessage = "There is no data available !";
      } else {
        // validate headers first
        const headers = this.getHeadersForShiftWeekOffUploadTemplate(ws);
        const validateHeaders = this.validateBulkUploadedShiftWoHeaders(headers);
        if (validateHeaders && validateHeaders.length > 0) {
          this.shiftWeekOffBulkImportData = [];
          this.uploadedErrorMessage = `${validateHeaders.toString()} is missing`;
        } else {
          this.bulkUploadHasError = false;
          // check data has value
          const getMissingKeys = (obj: any) => {
            const weekOffHeaders = ['EmployeeCode', 'Day_Name', 'EffectiveFrom', 'EffectiveTo'];
            const shiftHeaders = ['EmployeeCode', 'ShiftCode', 'EffectiveFrom', 'EffectiveTo'];

            const expectedHeaders = this.code === 'GetWeekOffDetails' || this.code === 'GetEmployeeWeekOffDetailsForManager' ? weekOffHeaders : shiftHeaders;
            return expectedHeaders.filter(key => !Object.keys(obj).includes(key));
          }
          jsonData.forEach((obj: any) => {
            if ((this.code === 'GetWeekOffDetails' || this.code === 'GetEmployeeWeekOffDetailsForManager') && obj && obj.Day_Name) {
              obj.Day_Name = obj.Day_Name.replace(/\s/g, '');
            }
            obj.ErrorMessage = "";
            const missingKeys = getMissingKeys(obj);
            if (missingKeys.length > 0) {
              obj.ErrorMessage = `Please check the value for ${missingKeys.join(', ')}`;
              this.bulkUploadHasError = true;
            }
          });
          this.shiftWeekOffBulkImportData = this.bulkUploadHasError ? jsonData : [];
          // check other details entered are valid
          if (!this.bulkUploadHasError) {
            // validate uploaded data 
            const validateData = this.validateBulkUploadedShiftWoData(jsonData);
            // sort to show data with error first
            this.shiftWeekOffBulkImportData = validateData.sort((a, b) => {
              if (a.ErrorMessage !== "" && b.ErrorMessage === "") {
                return -1;
              } else if (a.ErrorMessage === "" && b.ErrorMessage !== "") {
                return 1;
              } else {
                return 0;
              }
            });
          }
          console.log(validateHeaders, this.shiftWeekOffBulkImportData);
        }
      }
    }
    reader.readAsBinaryString(this.file);
  }

  getHeadersForShiftWeekOffUploadTemplate(worksheet: XLSX.WorkSheet): string[] {
    const headers: string[] = [];
    const range = XLSX.utils.decode_range(worksheet['!ref']);

    for (let C = range.s.c; C <= range.e.c; ++C) {
      const header = XLSX.utils.encode_col(C);
      const cell = worksheet[header + '1'];
      if (cell && cell.v) {
        headers.push(cell.v);
      }
    }

    return headers;
  }

  validateBulkUploadedShiftWoHeaders(headers: any) {
    const weekOffHeaders = ['EmployeeCode', 'Day_Name', 'EffectiveFrom', 'EffectiveTo'];
    const shiftHeaders = ['EmployeeCode', 'ShiftCode', 'EffectiveFrom', 'EffectiveTo'];

    const expectedHeaders = this.code === 'GetWeekOffDetails' || this.code === 'GetEmployeeWeekOffDetailsForManager' ? weekOffHeaders : shiftHeaders;
    const missingHeaders = expectedHeaders.filter(name => !headers.includes(name));
    return missingHeaders;
  }

  validateBulkUploadedShiftWoData(data: any[]) {
    this.modalSpinner = true;
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const duplicateItems = this.findDuplicatesInShiftWeekOffBulkUpload(data);
    data.forEach(item => {
      item.ErrorMessage = "";
      this.bulkUploadHasError = false;

      if (this.code !== 'GetEmployeeWeekOffDetailsForManager' && this.code !== 'GetWeekOffDetails' && duplicateItems && duplicateItems.length > 0 && duplicateItems.some(a => a.EmployeeCode === item.EmployeeCode &&
        a.ShiftCode === item.ShiftCode && a.EffectiveFrom == item.EffectiveFrom && a.EffectiveTo == item.EffectiveTo)) {
        item.ErrorMessage = "Duplicate record. Please check the data";
        this.bulkUploadHasError = true;
      }

      if ((this.code == 'GetWeekOffDetails' || this.code == 'GetEmployeeWeekOffDetailsForManager') && duplicateItems && duplicateItems.length > 0 && duplicateItems.some(a => a.EmployeeCode === item.EmployeeCode &&
        a.Day_Name === item.Day_Name && a.EffectiveFrom == item.EffectiveFrom && a.EffectiveTo == item.EffectiveTo)) {
        item.ErrorMessage = "Duplicate record. Please check the data";
        this.bulkUploadHasError = true;
      }

      // const effectiveFrom = new Date(item.EffectiveFrom);
      // const effectiveTo = new Date(item.EffectiveTo);

      // get DateObj when date is coming in "dd-mm-yyyy" format.
      const parseDate = (dateStr) => {
        const dateRegex = /^(\d{2})-(\d{2})-(\d{4})$/;
        const match = dateStr.match(dateRegex);

        if (!match) {
          item.ErrorMessage = "Date format is not valid. Please enter the date in DD-MM-YYYY format.";
          this.bulkUploadHasError = true;
          return null;
        } else {
          const [_, day, month, year] = match.map(Number);
          const parsedDate = new Date(year, month - 1, day);
          // Validate month (1 to 12)
          if (month < 1 || month > 12) {
            item.ErrorMessage = 'Invalid month value. Please enter the date in DD-MM-YYYY format.';
            this.bulkUploadHasError = true;
          }
          // Validate day (1 to 31)
          if (day < 1 || day > 31) {
            item.ErrorMessage = 'Invalid day value. Please enter the date in DD-MM-YYYY format.';
            this.bulkUploadHasError = true;
          }
          if (isNaN(parsedDate.getTime())) {
            item.ErrorMessage = "Date format is not valid. Please enter the date in DD-MM-YYYY format.";
            this.bulkUploadHasError = true;
          }
          return parsedDate;
        }
      };

      const fromDate = parseDate(item.EffectiveFrom);
      const toDate = parseDate(item.EffectiveTo);

      const date = new Date();

      if (!this.bulkUploadHasError && (fromDate && toDate)) {
        // Separate date to avoid formatting issues
        const from = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate());
        const to = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate());

        // Convert to UTC
        from.setUTCHours(0, 0, 0, 0);
        to.setUTCHours(0, 0, 0, 0);
        date.setUTCHours(0, 0, 0, 0);

        if (isNaN(from.getTime()) || isNaN(to.getTime())) {
          item.ErrorMessage = "Date format is not valid. Please enter the date in DD-MM-YYYY format.";
          this.bulkUploadHasError = true;
        } else if (fromDate > toDate) {
          const formattedDate = this.utilityService.formatDate(fromDate, 'DD-MM-YYYY');
          item.ErrorMessage = `Effective To should be same or greater than ${formattedDate}. Please ensure the date format is DD-MM-YYYY.`;
          this.bulkUploadHasError = true;
        }
        // allowing to select past effective date
        // else if (fromDate <= date) {
        //   const formattedDate = this.utilityService.formatDate(date, 'DD-MM-YYYY');
        //   item.ErrorMessage = `Effective From should be greater than ${formattedDate}. Please ensure the date format is DD-MM-YYYY.`;
        //   this.bulkUploadHasError = true;
        // }
      }

      //  check week off spelling
      if (this.code == 'GetWeekOffDetails' || this.code == 'GetEmployeeWeekOffDetailsForManager') {
        item.Day_Name = item.Day_Name.replace(/\s/g, '');
        let dayName = item.Day_Name.toUpperCase().split(',');
        daysOfWeek.forEach(day => {
          item[day.charAt(0) + day.slice(1).toLowerCase()] = dayName.includes(day);
        });

        const incorrectSpellings = dayName.filter(w => !daysOfWeek.includes(w));
        if (incorrectSpellings.length > 0) {
          incorrectSpellings.forEach(w => {
            if (w) {
              item.ErrorMessage += `The spelling for '${w}' is incorrect.`;
              this.bulkUploadHasError = true;
            }
          });
        }
      }

    });

    this.modalSpinner = false;
    return data;
  }

  findDuplicatesInShiftWeekOffBulkUpload(data) {
    const seen = new Map();
    const duplicates = [];

    for (const item of data) {
      const itemKey = JSON.stringify(item); // Convert the object to a string for comparison
      if (seen.has(itemKey)) {
        duplicates.push(item);
      } else {
        seen.set(itemKey, true);
      }
    }
    return duplicates;
  }



  downloadShiftWeekOffUploadTemplate(code) {
    let link = document.createElement('a');
    link.setAttribute('type', 'hidden');
    link.href = code === 'GetShiftDetails' || code == 'GetEmployeeShiftDetailForManager' ? 'assets/file/ShiftBulkImportTemplate.xlsx' : 'assets/file/WeekOffBulkImportTemplate.xlsx';
    link.download = code === 'GetShiftDetails' || code == 'GetEmployeeShiftDetailForManager' ? 'ShiftBulkImportTemplate.xlsx' : 'WeekOffBulkImportTemplate.xlsx';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  doConfirmBulkUpload() {
    this.modalSpinner = true;
    this.uploadedErrorMessage = "";
    let isDataToBeValidated = this.shiftWeekOffBulkImportData.every(obj => obj.IsValid === true && obj.ErrorMessage === "") ? 0 : 1;
    // to include correct date format to save in DB
    if (isDataToBeValidated == 1) {
      this.shiftWeekOffBulkImportData.forEach(e => {
        e.EffectiveTo = moment(e.EffectiveTo, 'DD-MM-YYYY').format('MM-DD-YYYY')
        e.EffectiveFrom = moment(e.EffectiveFrom, 'DD-MM-YYYY').format('MM-DD-YYYY')
      });
    }
    const spName = this.code == 'GetWeekOffDetails' || this.code == 'GetEmployeeWeekOffDetailsForManager' ? "MapWeekOffForEmployees" : "MapShiftForEmployees";
    let datasource: DataSource = {
      Name: spName,
      Type: DataSourceType.SP,
      IsCoreEntity: false,
      EntityType: 120, // staging DB
    };

    let searctElements: SearchElement[] = [
      {
        FieldName: "@clientId",
        Value: this.BusinessType != 3 ? Number(this.sessionService.getSessionStorage("default_SME_ClientId")) : 0
      },
      {
        FieldName: "@data",
        Value: JSON.stringify(this.shiftWeekOffBulkImportData)
      },
      {
        FieldName: "@isDataToBeValidated",
        Value: isDataToBeValidated
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      },
      {
        FieldName: "@roleId",
        Value: this.RoleId
      }
    ];

    console.log(JSON.stringify(this.shiftWeekOffBulkImportData), searctElements);
    // return;
    // this.shiftWeekOffBulkImportData = [];
    // this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
    //   console.log('BULK RESULT', result);
    //   if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
    //     const parsedResponse = JSON.parse(result.dynamicObject);
    //     // sort to show data with error first
    //     this.shiftWeekOffBulkImportData = parsedResponse.sort((a, b) => a.IsValid - b.IsValid);
    //     console.log('parsedResponse', this.shiftWeekOffBulkImportData);
    //     isDataToBeValidated = this.shiftWeekOffBulkImportData.every(obj => obj.IsValid === true) ? 0 : 1;
    //     if (isDataToBeValidated == 1) {
    //       this.shiftWeekOffBulkImportData.forEach(e => {
    //         e.EffectiveTo = moment(e.EffectiveTo, 'YYYY-MM-DD').format('DD-MM-YYYY')
    //         e.EffectiveFrom = moment(e.EffectiveFrom, 'YYYY-MM-DD').format('DD-MM-YYYY')
    //       });
    //     }
    //     this.modalSpinner = false;
    //     // if data is valid, then process the bulk uploaded data
    //     if (isDataToBeValidated == 0) {
    //       this.doConfirmBulkUpload();
    //     }
    //   } else if (result.Status && result.dynamicObject != null && result.dynamicObject === '') {
    //     this.modalSpinner = false;
    //     this.alertService.showSuccess('Data uploaded successfully !');
    //     $('#popup_bulkUpload').modal('hide');
    //   }
    //   else {
    //     this.alertService.showWarning(result.Message);
    //     this.modalSpinner = false;
    //   }
    // });
    let clientId = this.BusinessType != 3 ? Number(this.sessionService.getSessionStorage("default_SME_ClientId")) : 0
    let bulkImportData: any = {};
    bulkImportData['ClientId'] = clientId.toString();
    bulkImportData['UserId'] = this.UserId;
    bulkImportData['RoleId'] = this.RoleId;
    bulkImportData['IsDataToBeValidated'] = isDataToBeValidated ? true : false;
    bulkImportData['Data'] = this.shiftWeekOffBulkImportData;
    console.log(bulkImportData);
    if (this.code == 'GetWeekOffDetails' || this.code == 'GetEmployeeWeekOffDetailsForManager') {
      this.shiftWeekOffBulkImportData = [];
      this.attendanceService.MapWeekOffForEmployees(JSON.stringify(bulkImportData)).subscribe((result1) => {
        console.log('Mark Week Off For Employee ', result1);
        if (result1.Status && result1.Result != null && result1.Result != '' && result1.Result != undefined) {
          const parsedResponse = JSON.parse(result1.Result);
          // sort to show data with error first
          this.shiftWeekOffBulkImportData = parsedResponse.sort((a, b) => a.IsValid - b.IsValid);
          console.log('parsedResponse', this.shiftWeekOffBulkImportData);
          isDataToBeValidated = this.shiftWeekOffBulkImportData.every(obj => obj.IsValid === true) ? 0 : 1;
          if (isDataToBeValidated == 1) {
            this.shiftWeekOffBulkImportData.forEach(e => {
              e.EffectiveTo = moment(e.EffectiveTo, 'YYYY-MM-DD').format('DD-MM-YYYY')
              e.EffectiveFrom = moment(e.EffectiveFrom, 'YYYY-MM-DD').format('DD-MM-YYYY')
            });
          }
          this.modalSpinner = false;
          // if data is valid, then process the bulk uploaded data
          if (isDataToBeValidated == 0) {
            this.doConfirmBulkUpload();
          }
        } else if (result1.Status && result1.Result != null && result1.Result == '' && result1.Result != undefined) {
          this.modalSpinner = false;
          this.file = null;
          this.alertService.showSuccess('Data uploaded successfully !');
          $('#popup_bulkUpload').modal('hide');
          this.getDataset();
        }
        else {
          this.alertService.showWarning(result1.Message);
          this.modalSpinner = false;
        }
      }, (err) => {
        this.modalSpinner = false;
        this.file = null;
        console.error('error in MapWeekOffForEmployees api', err);
      })

    } else {
      this.shiftWeekOffBulkImportData = [];
      this.attendanceService.MapShiftForEmployees(JSON.stringify(bulkImportData)).subscribe((result2) => {
        console.log('MapShift For Employees ', result2);
        if (result2.Status && result2.Result != null && result2.Result != '' && result2.Result != undefined) {
          const parsedResponse = JSON.parse(result2.Result);
          // sort to show data with error first
          this.shiftWeekOffBulkImportData = parsedResponse.sort((a, b) => a.IsValid - b.IsValid);
          console.log('parsedResponse', this.shiftWeekOffBulkImportData);
          isDataToBeValidated = this.shiftWeekOffBulkImportData.every(obj => obj.IsValid === true) ? 0 : 1;
          if (isDataToBeValidated == 1) {
            this.shiftWeekOffBulkImportData.forEach(e => {
              e.EffectiveTo = moment(e.EffectiveTo, 'YYYY-MM-DD').format('DD-MM-YYYY')
              e.EffectiveFrom = moment(e.EffectiveFrom, 'YYYY-MM-DD').format('DD-MM-YYYY')
            });
          }
          this.modalSpinner = false;
          // if data is valid, then process the bulk uploaded data
          if (isDataToBeValidated == 0) {
            this.doConfirmBulkUpload();
          }
        } else if (result2.Status && result2.Result != null && result2.Result == '') {
          this.modalSpinner = false;
          this.file = null;
          this.alertService.showSuccess('Data uploaded successfully !');
          $('#popup_bulkUpload').modal('hide');
          this.getDataset();
        }
        else {
          this.alertService.showWarning(result2.Message);
          this.modalSpinner = false;
        }
      }, (err) => {
        this.modalSpinner = false;
        this.file = null;
        console.error('error in MapShiftForEmployees api', err);
      })
    }
  }

  showRegularizedDetailedViewDrawer(rowData) {
    console.log(rowData);
    const modalRef = this.modalService.open(ApproveRejectEmployeeRegularizationModalComponent, this.modalOption);
    modalRef.componentInstance.data = rowData;
    modalRef.result.then((result) => {
      this.getDataset();
    }).catch((error) => {
      console.log(error);
    });
  }

  approveRejectRegularizationDetailedType(approvalType: string) {
    const reqIds = this.selectedItems.map(a => a.Id).toString();
    const status = approvalType != 'Approve' ? 3 : 2;
    console.log('select', this.selectedItems, reqIds, status);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: approvalType != 'Approve' ? 'btn btn-danger' : 'btn btn-success',
        cancelButton: 'btn'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: `Are you sure, you want to ${approvalType.toLowerCase()} ?`,
      text: `you won't be able to revert this action !`,
      type: 'warning',
      animation: false,
      showCancelButton: true, // There won't be any cancel button
      confirmButtonText: approvalType,
      input: 'textarea',
      inputPlaceholder: 'Type your message here...',
      allowEscapeKey: false,
      inputAttributes: {
        autocorrect: 'off',
        autocapitalize: 'on',
        maxlength: '200',
      },
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value.length >= 200) {
          return 'Maximum 200 characters allowed.'
        }
        if (!value && approvalType === "Reject") {
          return 'You need to write something!'
        }
      },

    }).then((inputValue) => {
      if (inputValue.value && inputValue.value != "") {
        this.loadingScreenService.startLoading();
        this.attendanceService.approveRejectRegularation_DetailedType(reqIds, this.UserId, inputValue.value, status).subscribe(res => {
          this.loadingScreenService.stopLoading();
          if (res.Status && res.Result && res.Result != "") {
            this.alertService.showSuccess(res.Message);
            this.getDataset();
          } else {
            res.Status ? this.alertService.showSuccess(res.Message) : this.alertService.showWarning(res.Message);
            this.getDataset();
          }
        }, error => {
          this.loadingScreenService.stopLoading();
          console.log(error);
          return this.alertService.showWarning(error);
        });
      } else if (inputValue.value == "" && approvalType === "Approve") {
        this.loadingScreenService.startLoading();
        this.attendanceService.approveRejectRegularation_DetailedType(reqIds, this.UserId, inputValue.value, status).subscribe(res => {
          this.loadingScreenService.stopLoading();
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.getDataset();
          } else {
            this.alertService.showWarning(res.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();
          console.log(error);
          return this.alertService.showWarning(error);
        });
      } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
    });
  }
  confirmEmployeeDates() {
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("Please select at least one employee for confirmation from the list");
      return;
    }
    const dateOfConfirmationInput = this.elementRef.nativeElement.querySelector('#dateOfConfirmation');
    if (dateOfConfirmationInput) {
      dateOfConfirmationInput.value = '';
    }
    this.failedUnConfirmedEmployees = [];
    try {

      $('#modal_dateofconfirmation').modal({
        backdrop: 'static',
        keyboard: false,
        show: true
      });
    } catch (error) {
      console.log('error', error);

    }
    return;
  }

  doConfirmDate() {
    const inputElement = this.elementRef.nativeElement.querySelector('#dateOfConfirmation');
    let inputValue = '';
    if (inputElement) {
      inputValue = inputElement.value;
    }


    try {
      if (!inputValue || inputValue === "Invalid date") {
        this.alertService.showWarning('Please select a confirmation date and try again.');
        return;
      }

      this.loadingScreenService.startLoading();
      const employeeData = this.selectedItems.map(element => ({
        EmployeeCode: element.Code,
        ConfirmationDate: moment(inputValue, 'DD-MM-YYYY').format('YYYY-MM-DD')
      }));

      const selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID').Value;
      const payload = JSON.stringify({
        ClientId: selectedClientId,
        Data: employeeData
      });

      console.log("PYD ##121 ::", payload);

      this.employeeService.UpdateEmployeeConfirmationDate(payload).subscribe(
        (data: apiResult) => {
          this.loadingScreenService.stopLoading();
          console.log('Employee Confirmation Date:', data);

          try {


            if (data.Status) {
              if (data.Result === '' || data.Result == null) {
                // this.alertService.showSuccess('The date of the specified employee(s) has been successfully confirmed.');
                this.alertService.showSuccess(data.Message);
              } else {
                const apiR = (data.Result);
                this.failedUnConfirmedEmployees = apiR as any;
                console.log('failed UnConfirmed Employees', this.failedUnConfirmedEmployees);

                // let message = "Please check the log --> ";
                // apiR.forEach(element => {
                //   message = `${message}${element.Code} : ${element.Error}, `;
                // });
                this.alertService.showWarning_withTimeOut('There is a problem in confirming the employee(s).', 5000);
                return;
              }

              this.dismiss();
              this.getDataset();
            } else {
              this.alertService.showWarning(data.Message);
            }
          } catch (error) {
            this.dismiss();
            this.getDataset();
            this.alertService.showWarning(error);
          }
        },
        (err) => {
          // Handle error
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(err);
        }
      );
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(error);
    }


  }
  dismiss() {
    $('#modal_dateofconfirmation').modal('hide');
  }

  fetchBlacklistReasons() {
    // if(this.BlackListReasons.length == 0){}
    this.BlackListReasons = [];
    let selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID').Value;
    this.employeeService.FetchBlackListingReasons(selectedClientId).subscribe((data: apiResult) => {
      console.log('data', data);
      this.BlackListReasons = JSON.parse(data.Result);

    })
  }

  markanemployeeasblacklisted() {
    this.alertService.confirmSwal1("Warning", "Are you sure you want to mark the selected employee(s) as blacklisted?", "Yes, Confirm", "No, Cancel").then((result) => {

      const checkboxes = this.BlackListReasons;

      // <div class="custom-control custom-checkbox chkbox_custom">
      //     <input type="checkbox" class="custom-control-input" id="${checkbox.id}">
      //     <label class="custom-control-label" for="${checkbox.id}">${checkbox.label}</label>
      //    </div>

      const checkboxInputs = checkboxes
        .map(
          (checkbox) =>
            `<div class="form-check" style="width:100%;width: 100%;text-align: left;font-size: 14px;          padding-top: 5px;
          padding-bottom: 5px;">
            <input type="checkbox" class="form-check-input" style="top: 4px" id="${checkbox.Id}">
            <label class="form-check-label" for="${checkbox.Id}">${checkbox.Reason}</label>
          </div>`
        )
        .join('');

      const options: SweetAlertOptions = {
        title: 'Reason for Marking an Employee as Blacklisted',
        html:
          `${checkboxInputs}
          <textarea class="form-control remarksBlacklist" id="remarksBlacklist" name="remarks" rows="4" [(ngModel)]="blacklistedEmployeeRemarks" style="margin-top:25px"></textarea>`,
        showCancelButton: true,
        confirmButtonText: 'Submit',
        cancelButtonText: 'Cancel',
        animation: false,
        preConfirm: () => {
          const checkboxValues = checkboxes.reduce((result, checkbox) => {
            result[checkbox.Id] = (document.getElementById(checkbox.Id as any) as HTMLInputElement).checked;
            return result;
          }, {});
          this.cd.detectChanges();

          //   const selectedCheckboxes = checkboxes
          // .filter((option) => (document.getElementById(option.Id) as HTMLInputElement).checked)
          // .map((option) => option.Reason);

          const remarks = (document.getElementById('remarksBlacklist') as HTMLTextAreaElement).value;

          const allValuesFalse = Object.values(checkboxValues).every(value => value == false);
          console.log('remarks S', this.blacklistedEmployeeRemarks);
          console.log('remarks S', remarks);
          this.blacklistedEmployeeRemarks = remarks;

          if (allValuesFalse) {
            Swal.showValidationMessage('Please select at least one checkbox.');
            return;//At least one checkbox must be selected.
          }

          if (remarks == '') {
            Swal.showValidationMessage('Remarks is required.');
            return;
          }


          return {
            ...checkboxValues,
            // remarks,
          };
        },
      };
      Swal.fire(options).then((result) => {
        if (result) {
          console.log(result.value);
          this.loadingScreenService.startLoading();

          const employeeData = [];
          this.selectedItems.forEach(element => {
            employeeData.push(element.Id)
          });

          let selectedCheckboxes = Object.keys(result.value)
            .filter(key => result.value[key])
            .map(Number);

          const payload = JSON.stringify({
            empIds: employeeData,
            entityType: 6, // EMPLOYEE DETAILS 
            IdentificationType: selectedCheckboxes, // AADHAAR, PAN, EMAIL, MOBILENUMBER ...
            remarks: this.blacklistedEmployeeRemarks == '' ? '' : this.blacklistedEmployeeRemarks,
            status: true // MOVING TO BLACKLIST BUCKET
          });

          console.log('#PYD 901 : ', payload);
          this.failedBlacklistedEmployees = [];
          this.employeeService.MarkAnEmployeeAsBlackListed(payload)
            .pipe(
              takeUntil(this.unsubscribe$)
            )
            .subscribe(
              (result: apiResult) => {
                console.log('Result: ', result);
                this.loadingScreenService.stopLoading();

                if (result.Status) {
                  this.failedBlacklistedEmployees = result.Result as any;

                  if (this.failedBlacklistedEmployees != null && this.failedBlacklistedEmployees.length > 0) {
                    $('#modal_blacklistedemployee').modal({
                      backdrop: 'static',
                      keyboard: false,
                      show: true
                    });
                  }
                  this.alertService.showSuccess(result.Message);
                  this.getDataset();
                } else {
                  this.alertService.showWarning(result.Message);
                }
              },
              (error) => {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning("An error occurred while updating an employee status");
                console.error('Error: ', error);
              }
            );


        } else {
          // Handle the canceled or dismissed case
          console.log('Alert was dismissed');
        }
      });

    }).catch(error => {
    });

  }

  dismiss_blacklistedemployee() {
    $('#modal_blacklistedemployee').modal('hide');
  }

  viewOfferRequests() {
    this.showOfferRequestsSlider = true;
    this.get_candidateRecord(this.selectedItems[0])
  }

  get_candidateRecord(dataSet) {
    this.isrendering_spinner = true;
    // const req_param_uri = `candidateId=${dataSet.CandidateId}`;
    let req_param_uri = `Id=${dataSet.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingApi.getCandidate(req_param_uri)
      // this.onboardingApi.FetchCandidateDataUsingCandidateId(req_param_uri)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(
        (data: any) => this.handleApiResponse(data),
        (err) => this.handleError(err)
      );
  }

  handleApiResponse(data: any): void {
    this.isrendering_spinner = false;
    // const apiResponse: apiResult = data;
    const apiResponse: apiResponse = data;
    if (apiResponse.Status) {
      // const candidateModel: CandidateModel = JSON.parse(apiResponse.Result);
      // this.candidateDetails = JSON.parse(apiResponse.Result);
      let candidateModel: CandidateModel = (apiResponse.dynamicObject);
      this.candidateDetails = candidateModel.NewCandidateDetails;
      this.OfferData = this.candidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0];

      console.log(this.candidateDetails);
    } else {
      this.alertService.showWarning(`Something is wrong! ${apiResponse.Message}`);
    }
  }

  handleError(err: any): void {
    this.isrendering_spinner = false;
    this.alertService.showWarning(`Something is wrong! ${err}`);
  }


  closeOfferRequestsSlider() {
    this.showOfferRequestsSlider = false;
  }

  toggleTableVisibility() {
    this.showTable = !this.showTable;
  }

  downloadLetter() {

    const selectedLetterId = this.selectedItems[0].LetterTransactionId;
    if (selectedLetterId === 0) {
      this.PreviewALOLLetter();
      return;
    }

    this.loadingScreenService.startLoading();
    this.fileuploadService.getObjectById(this.selectedItems[0].LetterTransactionId)
      .subscribe(data => {
        let apiResult: any = data;
        console.log(apiResult.Result);
        this.loadingScreenService.stopLoading();
        if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
          let base64 = apiResult.Result.Content;
          let contentType = 'application/pdf';
          let fileName = "letter";
          const byteCharacters = atob(base64);

          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: contentType });
          const blobUrl = URL.createObjectURL(blob);
          console.log(blobUrl);
          this.loadingScreenService.stopLoading();
          window.open(blobUrl);
        }
        else {
          this.loadingScreenService.stopLoading();
        }
      });


  }

  PreviewALOLLetter() {
    this.loadingScreenService.startLoading();
    try {


      const req_post_param = JSON.stringify({
        ModuleProcessTranscId: this.candidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
        CandidateDetails: this.candidateDetails
      });

      this.onboardingApi.postPreviewLetter(req_post_param).subscribe(data => {
        this.loadingScreenService.stopLoading();

        const apiResult: any = data;

        if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
          console.log(apiResult.Result);
          let base64 = apiResult.Result;
          let contentType = 'application/pdf';
          let fileName = "offerletter";
          const byteArray = atob(base64);
          const blob = new Blob([byteArray], { type: contentType });
          let file = new File([blob], fileName, {
            type: contentType,
            lastModified: Date.now()
          });

          this.loadingScreenService.stopLoading();
          if (file !== null) {
            let fileURL = null;

            const newPdfWindow = window.open('', '');

            const content = encodeURIComponent(base64);
            const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

            const iframeEnd = '\'><\/iframe>';
            newPdfWindow.document.write(iframeStart + content + iframeEnd);
            newPdfWindow.document.title = fileName;

          }
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();
      });
    } catch (error) {
      console.log('PREV LETTER CATCH ERROR: ', error);
    }
  }

  approveOrRejectOfferRequest(actionStatus) {

    actionStatus ? this.callCandidateWorkflow("", actionStatus) :
      this.alertService.confirmSwalWithRemarks("Are you sure you want to reject this offer request?").then((result) => {
        if (result != false) {
          this.callCandidateWorkflow(result as any, actionStatus);
          return;
        }
      }).catch(error => {

      });


  }

  callCandidateWorkflow(rejectionRemarks = "", actionStatus) {
    this.loadingScreenService.startLoading();
    let userAccessControl: any;
    userAccessControl = this.sessionDetails.UIRoles[0].UserInterfaceControls;

    this.candidateDetails['CandidateId'] = this.selectedItems[0].CandidateId;
    const workFlowInitiation = new WorkFlowInitiation()
    workFlowInitiation.Remarks = rejectionRemarks;
    workFlowInitiation.EntityId = this.selectedItems[0].CandidateId;
    workFlowInitiation.EntityType = 11;
    workFlowInitiation.CompanyId = this.CompanyId
    workFlowInitiation.ClientContractId = this.selectedItems[0].ClientContractId;
    workFlowInitiation.ClientId = this.selectedItems[0].ClientId;

    workFlowInitiation.ActionProcessingStatus = 4000;
    workFlowInitiation.ImplementationCompanyId = 0;
    workFlowInitiation.WorkFlowAction = actionStatus ? 84 : 83;
    workFlowInitiation.RoleId = this.RoleId
    workFlowInitiation.DependentObject = (this.candidateDetails);
    workFlowInitiation.UserInterfaceControlLst = userAccessControl.filter(a => actionStatus ? a.ControlName == "btn_hr_approves" : a.ControlName == "btn_hr_rejects") as any;

    console.log('workFlowInitiation', workFlowInitiation);

    this.workflowApi.postWorkFlow(JSON.stringify(workFlowInitiation)).subscribe((response) => {
      this.loadingScreenService.stopLoading();
      if (response != null && response != undefined && !response.Status) {
        this.alertService.showInfo(response != null && response != undefined ? response.Message : 'Data saved but unable to submit, please contact support team');
        this.loadingScreenService.stopLoading();
        return;
      }
      this.showOfferRequestsSlider = false;
      this.loadingScreenService.stopLoading();
      this.alertService.showSuccess('Response submitted successfully');
      this.getDataset();

    }), ((error) => {

    });
  }


  // LEAVE BALANCE EDITOR

  viewLeaveBalanceHistory() {

    if (this.selectedItems.length !== 1) {
      this.alertService.showWarning("Please select only one employee to view the balance history");
      return;
    }

    this.leaveBalanceHistoryData = {
      ProcessLog: [],
      UtilizationLog: []
    }
    this.loadingScreenService.startLoading();

    this.viewLeaveBalanceSubscription = this.attendanceService.GetEmployeeEntitlementLog(this.selectedItems[0].Id)
      .pipe(
        takeUntil(this.unsubscribe$) // Automatically unsubscribe when the `unsubscribe$` subject emits
      )
      .subscribe(
        (result: apiResult) => {
          console.log('Result', result);
          this.loadingScreenService.stopLoading();

          if (result.Status) {
            const apiData = JSON.parse(result.Result);

            this.leaveBalanceHistoryData = {
              ProcessLog: apiData.ProcessLog,
              UtilizationLog: apiData.UtilizationLog
            };

            console.log('Api Data', apiData);
            this.showLeaevBalanceHistory = true;
          }
        },
        (error) => {
          // Handle the error here
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("An error occurred while fetching the balance history.");
          console.error('Error', error);
        }
      );
  }

  closeLeaevBalanceHistory() {
    this.showLeaevBalanceHistory = false;
    this.leaveBalanceHistoryData = {
      ProcessLog: [],
      UtilizationLog: []
    }
  }

  editLeaveBalance() {
    if (this.selectedItems.length == 0) {
      this.alertService.showWarning("Please select at least one employee to edit the leave type balance");
      return;
    }
    const leaveTypeIds = new Set(this.selectedItems.map(item => item.leaveTypeId));
    if (leaveTypeIds.size > 1) {
      this.alertService.showWarning('Choose the same leave type for all items and edit the balance.');
      return;
    }

    if (this.selectedItems.filter(a => a.IsDefaultLOP).length > 0) {
      this.alertService.showWarning('You cannot edit the balance for this leave type.');
      return;
    }



    this.newAvailableBalance = 0;
    this.newEligibleBalance = 0;
    this.leaveBalanceRemarks = "";
    this.leaveTypeStatus = this.selectedItems[0].EmployeeEntitlementStatus;
    this.showEditLeaevBalanceSlider = true;
  }
  closeEditLeaevBalanceSlider() {

    this.showEditLeaevBalanceSlider = false;
  }

  doConfirmLeaveBalance() {
    const maxLeaveBalance = this.selectedItems[0].MaxBalance;
    const isNegativeBalanceAllowed = this.selectedItems[0].IsNegativeBalanceAllowed;
    const maxNegativeBalanceAllowed = this.selectedItems[0].MaxNegativeBalanceAllowed;

    let selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID').Value;
    selectedClientId = Number(selectedClientId);
    const requiredClientIdsToCheckMaxBalance = environment.environment.RequiredClientIdsToCheckMaxBalance.includes(selectedClientId);

    if (
      (this.newAvailableBalance === null || this.newAvailableBalance === undefined) ||
      (this.newEligibleBalance === null || this.newEligibleBalance === undefined) ||
      (this.leaveBalanceRemarks === null || this.leaveBalanceRemarks === undefined || this.leaveBalanceRemarks === '')
    ) {
      this.alertService.showWarning("Please enter valid values for available balance, eligible balance, and remarks.");
      return;
    }

    if (this.newEligibleBalance > this.newAvailableBalance) {
      this.alertService.showWarning('Eligible units should not be greater than available units.');
      return;
    }

    if (requiredClientIdsToCheckMaxBalance && maxLeaveBalance != 0 && (this.newAvailableBalance > maxLeaveBalance || this.newEligibleBalance > maxLeaveBalance)) {
      this.alertService.showWarning('Units should not exceed the maximum leave balance amount :' + maxLeaveBalance);
      return;
    }



    // if (isNegativeBalanceAllowed && maxNegativeBalanceAllowed > 0 && (this.newAvailableBalance > maxNegativeBalanceAllowed || this.newEligibleBalance > maxNegativeBalanceAllowed)) {
    //   this.alertService.showWarning('Units should not exceed the maximum allowed leave balance amount :' + maxNegativeBalanceAllowed);
    //   return;
    // }

    let areBalancesInConsistent =
      (this.newAvailableBalance === 0 && this.newEligibleBalance > 0) ||
      (this.newAvailableBalance > 0 && this.newEligibleBalance == 0);

    if (areBalancesInConsistent) {
      this.alertService.showWarning('Balance inconsistency: Either both balances should be zero or both non-zero.');
      return;
    }

    const IsGreatherThanMaxBalance = this.newEligibleBalance > maxLeaveBalance;
    const confirmMessage = IsGreatherThanMaxBalance ? `The new balance entered is greater than the maximum allowable balance. Max balance : ${maxLeaveBalance} |  New Balance : ${this.newEligibleBalance} Are you sure you want to update the balance(s)?` : 'Are you sure you want to update the balance(s)?';

    this.alertService.confirmSwal1(
      "Confirmation",
      this.leaveTypeStatus ? confirmMessage : "Are you sure you want to inactivate the chosen leave type for selected employee(s)?",
      "Yes, Confirm",
      "No, Do it later"
    ).then((result) => {
      this.loadingScreenService.startLoading();

      const employeeData = this.selectedItems.map(element => ({
        EmployeeEntitlementId: element.Id,
        AvailableUnits: this.newAvailableBalance,
        EligibleUnits: this.newEligibleBalance,
        Status: this.leaveTypeStatus
      }));

      const payload = JSON.stringify({
        Remarks: this.leaveBalanceRemarks,
        Data: employeeData
      });

      console.log("PYD #123: ", payload);

      this.updateBalanceSubscription = this.attendanceService.UpdateEmployeeEntitlementBalance(payload)
        .pipe(
          takeUntil(this.unsubscribe$) // Automatically unsubscribe when the `unsubscribe$` subject emits
        )
        .subscribe(
          (result: apiResult) => {
            console.log('Result: ', result);
            this.loadingScreenService.stopLoading();

            if (result.Status) {
              this.alertService.showSuccess(result.Message);
              this.closeEditLeaevBalanceSlider();
              this.selectedItems = [];
              this.getDataset();
            } else {
              this.alertService.showWarning(result.Message);
            }
          },
          (error) => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning("An error occurred while updating the balance.");
            console.error('Error: ', error);
          }
        );
    }).catch(error => {
    });
  }


  getLeaveRequestStatus(status) {
    switch (status) {
      case 100:
        return 'Applied';
        break;
      case 200:
        return 'Cancelled';
        break;
      case 300:
        return 'Rejected';
        break;
      case 400:
        return 'Approved';
        break;
      case 500:
        return 'Availed';
        break;
      case 600:
        return 'Cancel Applied';
        break;
      default:
        return '';
        break;
    }
  }


  add_shift_weekoff_from_manager_login(title: string) {
    //console.log('%%', this.selectedItems);
    const modalRef = this.modalService.open(ShiftWeekoffMappingByManagerComponent, this.modalOption);
    modalRef.componentInstance.data = this.selectedItems;
    modalRef.componentInstance.searchData = this.pageLayout.SearchConfiguration.SearchElementList;
    modalRef.componentInstance.title = title;

    modalRef.result.then((result) => {
      this.selectedItems = [];
      this.getPageLayout();
    }).catch((error) => {
      console.log(error);
    });
  }

  addNewEmployeeEntlt() {

    this.showNewEntitlementSlider = true

  }
  getEmployeeCodeDetails(form: NgForm) {

    if (form.valid) {
      console.log('Form Data:', this.formData);
    }

    if (this.formData.entltEmpCode == null || this.formData.entltEmpCode == "") {
      this.alertService.showWarning('Employee Code is required');
      return;
    }

    this.loadingScreenService.startLoading();
    this.employeeApplicableEntitlement = [];
    const selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID').Value;

    const payload = `${selectedClientId}/${this.formData.entltEmpCode}`;

    this.attendanceService.GetLeavesToMapToEmployee(payload)
      .pipe(
        takeUntil(this.unsubscribe$)
      )
      .subscribe(
        (result: apiResult) => {
          console.log('Result', result);
          this.loadingScreenService.stopLoading();
          if (result.Result != '' && result.Status) {
            const data = JSON.parse(result.Result);
            this.employeeApplicableEntitlement = data.LeaveList;
            console.log('this.employeeApplicableEntitlement', data, this.employeeApplicableEntitlement);
            this.formData.empId = data.EmployeeId;
            this.formData.empName = data.EmployeeName;
            this.formData.empGender = data.EmployeeGender;
            this.formData.DOJ = data.DOJ;
            this.formData.EmploymentType = data.EmploymentType;
            this.formData.IsEsicApplicable = data.IsEsicApplicable;
            this.formData.EmploymentType = data.EmploymentType;
            this.formData.empMaritalStatus = data.EmployeeMaritalStatus;
          } else {
            result.Status && result.Message != null ? this.alertService.showSuccess(result.Message) : this.alertService.showWarning(result.Message);
          }
        },
        (error) => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("An error occurred while fetching the employee leave details.");
          console.error('Error', error);
        }
      );
  }

  onChangeEmpEntitlements(ev: any) {
    // this.formData.empId = ev.EmployeeId;
    // this.formData.empName = ev.EmployeeName;
    // this.formData.empGender = ev.EmployeeGender;
    // this.formData.empMaritalStatus = ev.EmployeeMaritalStatus;

    this.formData.MaxBalance = ev.EntitlementDefinition.MaxBalance;
    this.entitlmentDefinition = ev.EntitlementDefinition;
    console.log('eve', ev);

  }

  saveEntitlement() {

    console.log('Form Data:', this.formData);

    if ((this.formData.units <= 0)) {
      this.alertService.showWarning('Units should be greater than zero. Kindly give and try again.');
      return;
    }
    if ((this.formData.entitId == 0 || this.formData.entitId == null)) {
      this.alertService.showWarning('Leave type is required');
      return;
    }

    if (this.editCreditRequiredForAssignLeave && (this.entitlmentDefinition.IsCreditRequired && this.formData.NextCreditDate == null)) {
      this.alertService.showWarning('Next Credit Date is required');
      return;
    }

    if (this.editLapseRequiredForAssignLeave && (this.entitlmentDefinition.IsLapseRequired && this.formData.NextLapseDate == null)) {
      this.alertService.showWarning('Next Lapse Date is required');
      return;
    }


    if ((!this.formData.Remarks)) {
      this.alertService.showWarning('Remarks is required');
      return;
    }
    let selectedClientId = this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID').Value;
    selectedClientId = Number(selectedClientId);
    const requiredClientIdsToCheckMaxBalance = environment.environment.RequiredClientIdsToCheckMaxBalance.includes(selectedClientId);

    if (requiredClientIdsToCheckMaxBalance && this.formData.MaxBalance != 0 && (Number(this.formData.units) > this.formData.MaxBalance)) {
      this.alertService.showWarning('Units should not exceed the maximum leave balance amount :' + this.formData.MaxBalance);
      return;
    }

    const IsGreatherThanMaxBalance = this.formData.units > this.formData.MaxBalance;
    const confirmMessage = IsGreatherThanMaxBalance ? `The new balance entered is greater than the maximum allowable balance. Max balance : ${this.formData.MaxBalance} |  New Balance : ${this.formData.units} Are you sure you want to assign a new leave type ?` : 'Are you sure you want to assign a new leave type ?';

    this.alertService.confirmSwal1(
      "Confirmation",
      confirmMessage,
      "Yes, Confirm",
      "No, Cancel"
    ).then((result) => {
      this.loadingScreenService.startLoading();
      const payload = {
        EmployeeId: this.formData.empId,
        EntitlementId: this.formData.entitId,
        Balance: this.formData.units,
        NextCreditDate: this.formData.NextCreditDate == null ? '1909-01-01' : moment(this.formData.NextCreditDate).format('YYYY-MM-DD'),
        NextLapseDate: this.formData.NextLapseDate == null ? '1909-01-01' : moment(this.formData.NextLapseDate).format('YYYY-MM-DD'),
        Remarks: this.formData.Remarks,
      }

      console.log('#PYD 900 : ', payload);


      this.attendanceService.MapEntitlementToEmployee(payload)
        .pipe(
          takeUntil(this.unsubscribe$)
        )
        .subscribe(
          (result: apiResult) => {
            console.log('Result: ', result);
            this.loadingScreenService.stopLoading();
            if (result.Status) {
              this.alertService.showSuccess(result.Message);
              this.closeNewEntitlementSlider();
              this.resetFormData();
            } else {
              this.alertService.showWarning(result.Message);
            }
          },
          (error) => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning("An error occurred while creating an entitlement.");
            console.error('Error: ', error);
          }
        );

    }).catch(error => {
    });



  }
  closeNewEntitlementSlider() {
    this.showNewEntitlementSlider = false;
    this.resetFormData();
  }

  resetFormData() {
    this.formData.empCode = '',
      this.formData.empName = '',
      this.formData.empGender = '',
      this.formData.empMaritalStatus = '',
      this.formData.empId = 0,
      this.formData.entltEmpCode = '',
      this.formData.entitId = null,
      this.formData.units = 0,
      this.formData.NextCreditDate = null,
      this.formData.NextLapseDate = null,
      this.formData.Remarks = '',
      this.formData.MaxBalance = 0;
    this.formData.DOJ = null;
    this.formData.IsEsicApplicable = null;
    this.formData.EmploymentType = null;
    this.entitlmentDefinition = null;
    this.employeeApplicableEntitlement = [];
  }

  do_common_download_excel() {
    const fileNameForDownloadExcel = this.code + '_';
    if (!this.pageLayout.PageProperties.IsExternalAPICallRequiredToDownloadFile) {
      const exportDataWithoutId = this.dataset.map(({ Id, id, ID, ...rest }) => rest);
      console.log(`:::: EXPORT ${fileNameForDownloadExcel}::::`, exportDataWithoutId);
      this.excelService.exportAsExcelFile(exportDataWithoutId, fileNameForDownloadExcel);
    }
  }

  do_common_download_pdf() {
    const fileNameForDownloadPdf = this.code + '_export_' + new Date().getTime();
    if (!this.pageLayout.PageProperties.IsExternalAPICallRequiredToDownloadFile) {
      let keys = Object.keys(this.dataset[0]);
      keys = keys.filter(x => x !== 'ID' && x !== 'Id' && x !== 'id');
      const headers = this.createHeadersForCommonPdfDownload(keys);
      const exportDataWithoutId = this.dataset.map(({ Id, id, ID, ...rest }) => rest);
      var doc = new jsPDF({
        orientation: 'p',
        format: 'b1',
        putOnlyUsedFonts: true
      });
      doc.table(1, 1, exportDataWithoutId, headers, { autoSize: false, fontSize: 14 });
      doc.save(fileNameForDownloadPdf + '.pdf');
      console.log(`:::: EXPORT ${fileNameForDownloadPdf}::::`, exportDataWithoutId);
    }
  }

  createHeadersForCommonPdfDownload(keys) {
    return keys.map(key => ({
      id: key,
      name: key,
      prompt: key,
      width: 65,
      align: 'center',
      padding: 0
    }));
  }

  onViewBlacklistedHistory(rowData) {
    console.log('rowData', rowData);

    this.selectedItems.push(rowData);
    this.BlacklistingHistory = [];
    this.BlacklistingHistory = rowData.BlacklistingHistory;
    this.showBlacklistedHistory = true;
  }
  closeBlacklistedHistory() {
    this.BlacklistingHistory = [];
    this.showBlacklistedHistory = false;
  }
  markanemployeeaswhitelist() {
    this.alertService.confirmSwalWithRemarks("Are you sure you want to remove it from blacklist?").then((remarks) => {

      if (remarks != false) {
        console.log('rem', remarks);

        this.loadingScreenService.startLoading();
        const employeeData = [];
        this.selectedItems.forEach(element => {
          employeeData.push(element.EntityId)
        });

        const payload = JSON.stringify({
          empIds: employeeData,
          entityType: this.selectedItems[0].EntityType,
          IdentificationType: [],
          remarks: remarks,
          status: false
        });

        console.log('#PYD 902 : ', payload);
        this.failedBlacklistedEmployees = [];

        this.employeeService.MarkAnEmployeeAsBlackListed(payload)
          .pipe(
            takeUntil(this.unsubscribe$)
          )
          .subscribe(
            (result: apiResult) => {
              console.log('Result: ', result);
              this.loadingScreenService.stopLoading();

              if (result.Status) {
                this.failedBlacklistedEmployees = result.Result as any;
                this.alertService.showSuccess(result.Message);
                this.getDataset();
              } else {
                this.alertService.showWarning(result.Message);
              }
            },
            (error) => {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning("An error occurred while updating an employee status");
              console.error('Error: ', error);
            }
          );
      }
    }).catch(error => {

    });



  }

  constructUrlForExternalAPI(data) {
    const path = this.pageLayout.GridConfiguration.DataSource.Name;
    const baseUrl = path.split('?');
    let newURL = `${baseUrl[0]}?`;
    data.forEach(field => {
      // Check if the field has no value
      if (field.Value == undefined && field.Value == null) {
        field.Value = '';
      }
      // for datepicker 
      if (field.Value == '' && field.InputControlType === InputControlType.AutoFillTextBox) {
        field.Value = 0;
      }
      // for empcode 
      if (field.Value !== '' && field.FieldName === 'employeeCodes') {
        let extractedArray: string[] = JSON.parse(field.Value);
        let employeeCodes: string = extractedArray.join(',');
        field.Value = employeeCodes;
      }
      // for datepicker 
      if (field.Value != '' && field.InputControlType === InputControlType.DatePicker) {
        field.Value = moment(field.Value).format('YYYY-MM-DD');
      }
      newURL += `${field.FieldName}=${encodeURIComponent(field.Value)}&`;
    });
    // Remove the trailing "&" if any
    newURL = newURL.endsWith('&') ? newURL.slice(0, -1) : newURL;
    console.log(newURL);
    return newURL;
  }



  viewAttachments(item, section) {
    const documentName = item.FileName;
    const documentId =
      item.DocumentId;
    this.contentmodalDocumentId = documentId;
    var fileNameSplitsArray = documentName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    console.log('fileNameSplitsArray', fileNameSplitsArray);
    console.log('ext', ext);

    if (ext.toUpperCase().toString() == "ZIP") {
      this.getFileList(documentId);
      return;
    } else {

      this.loadingScreenService.startLoading();

      var contentType = this.fileuploadService.getContentType(documentName);
      if (contentType === 'application/pdf' || contentType.includes('image')) {

        return this.fileuploadService.getObjectById(documentId).subscribe(
          (dataRes: apiResult) => {
            this.loadingScreenService.stopLoading();
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              const Message = dataRes.Message ? dataRes.Message : 'Couldn\'t fetch data !'
              return this.alertService.showWarning(Message);
            }

            let file = null;
            var objDtls = dataRes.Result as any;
            const byteArray = atob(objDtls.Content);
            const blob = new Blob([byteArray], { type: contentType });
            file = new File([blob], objDtls.ObjectName, {
              type: contentType,
              lastModified: Date.now()
            });
            if (file !== null) {

              var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);

              if (contentType.includes('image')) {
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              } else {
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              }

              var modalDiv = $('#documentviewer2');
              modalDiv.modal({ backdrop: false, show: true });

            }
          },
          (err) => {
            this.loadingScreenService.stopLoading();

          }
        );

      }
      else if (contentType === 'application/msword' ||
        contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        var appUrl = this.fileuploadService.getUrlToGetObject(documentId);
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        this.loadingScreenService.stopLoading();
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
        var modalDiv = $('#documentviewer2');
        modalDiv.modal({ backdrop: false, show: true });

      }

    }
  }

  close_documentviewer2() {
    this.contentmodalurl = null;
    $("#documentviewer2").modal('hide');
  }

  getFileList(documentId) {

    this.loadingScreenService.startLoading();

    let DocId = documentId;
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
          // rechecking file extension 
          var fileNameSplitsArray = objDtls.ObjectName.split('.');
          var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];

          if (ext.toUpperCase().toString() != "ZIP") {
            this.previewNonZipFiles(dataRes, objDtls.Attribute1);
            return;
          }


          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);

          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            const promises = [];
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                promises.push(this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);
                }));
              }
            });
            Promise.all(promises).then(() => {
              this.loadingScreenService.stopLoading();
              var modalDiv = $('#documentviewer');
              modalDiv.modal({ backdrop: false, show: true });
              $('#carouselExampleCaptions').carousel();
            });
          });

        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }


  previewNonZipFiles(dataRes, contentType) {
    let file = null;
    var objDtls = dataRes.Result as any;
    const byteArray = atob(objDtls.Content);
    const blob = new Blob([byteArray], { type: contentType });
    file = new File([blob], objDtls.ObjectName, {
      type: contentType,
      lastModified: Date.now()
    });
    if (file !== null) {

      var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);

      if (contentType.includes('image')) {
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
      } else {
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
      }

      var modalDiv = $('#documentviewer2');
      modalDiv.modal({ backdrop: false, show: true });
      this.loadingScreenService.stopLoading();
    }
  }

  getTargetOffSetImage(item: any) {
    const promise = new Promise((res, rej) => {
      const contentType = this.fileuploadService.getContentType(item.name);
      const blob = new Blob([item._data.compressedContent], { type: contentType });

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        if (blob !== null) {
          const urll = 'data:' + contentType + ';base64,' + base64String;
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log('DOCUMENT URL:', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl });
        }
      };
    });

    return promise;
  }


  close_documentviewer3() {
    $("#documentviewer").modal('hide');
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
    if (this.updateBalanceSubscription) {
      this.updateBalanceSubscription.unsubscribe();
    }
  }
}

