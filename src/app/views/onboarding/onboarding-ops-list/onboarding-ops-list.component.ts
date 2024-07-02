import { Component, ElementRef, EventEmitter, Inject, OnInit, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { Router, NavigationExtras } from '@angular/router';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { CandidateListingScreenType } from '../../../_services/model/OnBoarding/CandidateListingScreenType';
import {
  AngularGridInstance,
  Column,
  FieldType,
  Formatters,
  Formatter,
  GridOption,
  OnEventArgs,
  GridService
} from 'angular-slickgrid';
import { UUID } from 'angular2-uuid';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as XLSX from 'xlsx';

// services 

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { SearchService } from '../../../_services/service/search.service';

import Swal from "sweetalert2";
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';

import { Subscription } from 'rxjs';
import { OnboardingGrid } from '../../../_services/model/OnboardingGrid.model';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
import { TransactionsModalComponent } from 'src/app/shared/modals/transactions-modal/transactions-modal.component';
import { ExcelService } from 'src/app/_services/service/excel.service';
import { WorkflowService } from '../../../_services/service/workflow.service';
import { ClientService, DownloadService, FileUploadService, ImportLayoutService, PagelayoutService } from 'src/app/_services/service';
import { ImportLayout } from '../../generic-import/import-models';
import moment from 'moment';
import FileSaver from 'file-saver';
import { MultiButtonWidgetComponent } from 'src/app/shared/modals/common/multi-button-widget/multi-button-widget.component';
import { MultiButtonWidget } from 'src/app/_services/model/Common/Widget';
import { environment } from 'src/environments/environment';
import { SeparationListComponent } from '../separation-list/separation-list.component';
import { AadhaarVerificationComponent } from '../shared/modals/aadhaar-verification/aadhaar-verification.component';
import { IntegrationTransactionalDetails } from 'src/app/_services/model/OnBoarding/IntegrationTransactionalDetails';
import { ApprovalFor, Approvals, ApproverType, CandidateDetails, CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
import { NapsOnboardingComponent } from '../shared/modals/naps-onboarding/naps-onboarding.component';
import { PageLayout, SearchConfiguration, SearchElement } from '../../personalised-display/models';
import { CandidatebasicinformationComponent } from '../shared/modals/candidatebasicinformation/candidatebasicinformation.component';
import { SalaryCalculatorComponent } from '../shared/modals/salary-calculator/salary-calculator.component';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { ClientContract } from 'src/app/_services/model/Client/ClientContract';
import { Paygroup } from 'src/app/_services/model/paygroupproduct';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';

// NAPS ONBOARDING
import { Gender, OnBoardingType, RequestFor } from 'src/app/_services/model/Base/HRSuiteEnums';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { CandidateOfferDetails, RequestType, SourceType, TenureType } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { CandidateCommunicationDetails } from 'src/app/_services/model/Candidates/CandidateCommunicationDetails';
import { CommunicationCategoryType, ContactDetails } from 'src/app/_services/model/Communication/CommunicationType';
import { CandidateOtherData, CandidateStatutoryDetails } from 'src/app/_services/model/Candidates/CandidateOtherData';
import { CandidateRateset } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { UIMode } from 'src/app/_services/model/UIMode';
import { Relationship } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { BankBranchIdentifierType, CandidateBankDetails, VerificationMode } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { ApprovalStatus, CandidateDocuments, DocumentVerificationMode } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { CandidateModel, _CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import regionJsonList from '../../../../assets/json/regionList.json';

import { UserInterfaceControlLst, WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { DataValidatorKey, capitalizeFirstLetter, dataValidator, isObjectEmpty, isStringsIdentical } from 'src/app/utility-methods/utils';
import { takeUntil } from 'rxjs/operators';
import { CommonFileUploaderComponent } from 'src/app/shared/components/common-file-uploader/common-file-uploader.component';
import { SurveyComponent } from '../shared/survey/survey.component';

export interface DocumentInfo {
  ApprovalFor: ApprovalFor;
  ApprovalType: ApproverType;
  DocumentId: number;
  DocumentName: string;
}

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
@Component({
  selector: 'app-onboarding-ops-list',
  templateUrl: './onboarding-ops-list.component.html',
  styleUrls: ['./onboarding-ops-list.component.scss']
})
export class OnboardingOpsListComponent implements OnInit {

  _loginSessionDetails: LoginResponses;

  fromDate: Date;
  toDate: Date;
  clientName: any;
  candName: any;
  mandName: any;
  actionStatus: any;
  onlyRequest: any;
  onlyClaim: any;


  //#region Common Variables

  customCopyFormatter: Formatter;
  customTimelineFormatter: Formatter;
  docsFormatter: Formatter;
  voidFormatter: Formatter;
  claimFormatter: Formatter;
  makeanofferFormatter: Formatter;
  viewFormatter: Formatter;
  isKYC_Formatter: Formatter;
  isNAPS_Formatter: Formatter;
  //#endregion

  //#region InBucket related variables

  inBucketGridInstance: AngularGridInstance;
  inBucketGrid: any;
  inBucketGridService: GridService;
  inBucketDataView: any;

  inSavedBucketGridInstance: AngularGridInstance;
  inSavedBucketGrid: any;
  inSavedBucketGridService: GridService;
  inSavedBucketDataView: any;

  inRejectedBucketGridInstance: AngularGridInstance;
  inRejectedBucketGrid: any;
  inRejectedBucketGridService: GridService;
  inRejectedBucketDataView: any;

  inBucketColumnDefinitions: Column[];
  inBucketGridOptions: GridOption;
  inBucketDataset: any;

  // for Saved tab
  inSavedBucketColumnDefinitions: Column[];
  inSavedBucketGridOptions: GridOption;
  inSavedBucketDataset: any;

  // for Rejected tab
  inRejectedBucketColumnDefinitions: Column[];
  inRejectedBucketGridOptions: GridOption;
  inRejectedBucketDataset: any;

  //  inBucketList: OnboardingGrid[]; //

  inBucketList: OnBoardingGrid[] = [];
  inSavedBucketList: OnBoardingGrid[] = [];
  inRejectedBucketList: OnBoardingGrid[] = [];

  currentInBucketRecord: any;
  selectedInBucketRecords: any[];

  //#endregion

  //#region Search Grid related variables

  searchGridInstance: AngularGridInstance;
  searchGrid: any;
  searchGridService: GridService;
  searchDataView: any;

  searchColumnDefinitions: Column[];
  searchGridOptions: GridOption;
  searchDataset = [];

  searchList: OnboardingGrid[];

  currentSearchRecord: any;
  selectedSearchRecords: any[];

  //#endregion

  //#region Unclaimed related variables

  unclaimedGridInstance: AngularGridInstance;
  unclaimedtGrid: any;
  unclaimedGridService: GridService;
  unclaimedDataView: any;

  unclaimedColumnDefinitions: Column[];
  unclaimedGridOptions: GridOption;
  unclaimedDataset: any;

  unclaimedList: OnBoardingGrid[] = [];

  currentUnclaimedRecord: any;
  selectedUnclaimedRecords: any[];

  //#endregion

  // ** Session logged details

  UserId: number;
  RoleId: number;
  CompanyId: number;

  tblminDate: Date;
  // ** 

  //#region Consturctor
  selectedmigrationRecords: any[];
  selectedRejectedItems: any[];
  selectedSavedItems: any[];
  selectedPendingItems: any[];
  activeTabName: string = "myBucket";
  activeChildTabName: string;

  spinner: boolean = false;
  spinner2: boolean = false;
  modalOption: NgbModalOptions = {};


  convertedJSON: any;
  showFailed: boolean = false;
  showFailed_item: any;
  globalJSON: any;
  willDownload = false;
  BusinessType: any;
  IsExtraTabRequired: boolean = true;
  RoleCode: any;
  AlternativeText: any = 'In My Bucket';
  AlternativeText1: any = "Unclaimed";
  IsDownloadBtnShown: boolean = false;
  readonly ImportLayoutCode: string = 'Onboarding';
  importLayout: ImportLayout;

  @ViewChild('inputFile') myInputVariable: ElementRef;
  @ViewChild('inputFile1') myInputVariable1: ElementRef;
  @ViewChild('separatedCandidate') separatedCandidate: SeparationListComponent;

  code: string = "pendingOnboardingRequest";
  pageLayout: PageLayout = null;
  isBtnDisabledRequired: boolean = false;
  clientId: number = 0;
  clientContractId: number = 0;

  IsNotRequired: boolean = false;
  defaultSearchInputs: DefaultSearchInputs = {
    ClientContractId: 0,
    ClientId: -1,
    ClientName: "",
    ClientContractName: "",
    IsNapBased: false,
    Client: null,
    ClientContract: null,
    IsReOnboard: false
  };

  payGroupId: number = null;
  obs: Subscription;
  LstPayGroup = [];
  smallspinner: boolean = false;
  hasFailedInput: boolean = false;
  failedInputErrorMessage: string = "";
  payGroupObj: Paygroup = null
  btnspinner: boolean = false;
  requestFor: any = [];
  requestForId: any = null;

  // Document Upload
  isLoading: boolean = true;
  spinnerText: string = "Please wait";
  FileName: string = "";
  unsavedDocumentLst = [];
  DocumentId: number = 0;

  searchConfiguration: SearchConfiguration;
  searchElementList: SearchElement[];
  clientSME: any;
  clientcontractSME: any;
  clientIdSME: number;
  clientcontractIdSME: number;

  DocumentInfo: DocumentInfo = {
    DocumentId: 0,
    DocumentName: "",
    ApprovalFor: ApprovalFor.OL,
    ApprovalType: ApproverType.Internal
  };

  selectedExcelItems = [];
  LstApprovalFor = [
    {
      id: 1,
      name: 'OL'
    },
    {
      id: 4,
      name: 'CandidateJoiningConfirmation'
    },
    {
      id: 3,
      name: 'MinimumWagesNonAdherence'
    },
  ]
  approvalForId: any = null;
  teamId: number = null;
  payPeriodId: number = null;
  LstTeam = [];
  activeBulkMode: string = "Regular";

  // BULK NAPS
  candidateModel: CandidateModel = new CandidateModel();
  BankBranchList = [];
  documentCategory = [];
  cRt = new CandidateRateset();
  regionList = {
    StateList: [],
    CityList: []
  };
  LstClientLocation = [];
  LstCostCode = [];
  gender: any = [];
  progressRequest = {
    totalRequest: [],
    completedRequest: [],
    failedRequest: []
  };
  onboardingType: any = [];
  onboardingTypeId: any = null;
  unsavedDocumentIds = [];

  apiSpinner: boolean = false;
  btnNapsspinner: boolean = false;
  ImplementationCompanyId: number = 0;
  accessControl_submit: UserInterfaceControlLst = new UserInterfaceControlLst;
  IsCompleted: boolean = false;
  environment: any = environment;
  isBankDocUploading: boolean = false;
  capitalizeFirstLetter = capitalizeFirstLetter;
  private stopper: EventEmitter<any> = new EventEmitter();
  @ViewChild(CommonFileUploaderComponent) fileUploader: CommonFileUploaderComponent;
  invalidMinimumWages: boolean = false;

  doDisableReleaseOfferBtn: boolean = true;
  UserName: string = "";
  constructor(
    private onboardingApi: OnboardingService,
    private router: Router,
    private alertService: AlertService,
    private titleService: Title,
    public UIBuilderService: UIBuilderService,
    @Inject(DOCUMENT) document,
    public sessionService: SessionStorage,
    private headerService: HeaderService,
    private loadingScreenService: LoadingScreenService,
    public modalService: NgbModal,
    public searchService: SearchService,
    public excelService: ExcelService,
    private workFlowApi: WorkflowService,
    private importLayoutService: ImportLayoutService,
    private loadingSreenService: LoadingScreenService,
    private downloadService: DownloadService,
    private pageLayoutService: PagelayoutService,
    private utilsHelper: enumHelper,
    private fileuploadService: FileUploadService,
    private clientService: ClientService,
  ) {

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {
      history.pushState(null, null, document.URL);
    });



  }

  //#endregion

  //#region Inbucket Grid events

  inBucketGridReady(angularGrid: AngularGridInstance) {
    this.inBucketGridInstance = angularGrid;
    this.inBucketDataView = angularGrid.dataView;
    this.inBucketGrid = angularGrid.slickGrid;
    this.inBucketGridService = angularGrid.gridService;
  }
  inSavedBucketGridReady(angularGrid: AngularGridInstance) {
    this.inSavedBucketGridInstance = angularGrid;
    this.inSavedBucketDataView = angularGrid.dataView;
    this.inSavedBucketGrid = angularGrid.slickGrid;
    this.inSavedBucketGridService = angularGrid.gridService;
  }
  inRejectedBucketGridReady(angularGrid: AngularGridInstance) {
    this.inRejectedBucketGridInstance = angularGrid;
    this.inRejectedBucketDataView = angularGrid.dataView;
    this.inRejectedBucketGrid = angularGrid.slickGrid;
    this.inRejectedBucketGridService = angularGrid.gridService;
  }

  //#endregion

  //#region Search Grid events

  searchGridReady(angularGrid: AngularGridInstance) {
    this.searchGridInstance = angularGrid;
    this.searchDataView = angularGrid.dataView;
    this.searchGrid = angularGrid.slickGrid;
    this.searchGridService = angularGrid.gridService;
  }

  //#endregion

  //#region Unclaimed Grid events

  unClaimedGridReady(angularGrid: AngularGridInstance) {
    this.unclaimedGridInstance = angularGrid;
    this.unclaimedDataView = angularGrid.dataView;
    this.unclaimedtGrid = angularGrid.slickGrid;
    this.unclaimedGridService = angularGrid.gridService;
  }

  //#endregion

  //#region OnInit

  ngOnInit() {
    try {
      fetch('assets/json/bankbranch.json').then(res => res.json())
        .then(jsonData => {
          console.log('Branch List :::::', jsonData);
          this.BankBranchList = jsonData;
        });

      // console.log('bankBranchJsonList ', bankBranchJsonList);
      this.regionList = regionJsonList;
      console.log('regionList ', this.regionList);

    }
    catch (e) {
      console.log('err', e);
    }

    this.requestFor = this.utilsHelper.transform(RequestFor);
    this.gender = this.utilsHelper.transform(Gender);
    this.onboardingType = this.utilsHelper.transform(OnBoardingType);


    this.IsNotRequired = false;
    this.headerService.setTitle('Onboarding');
    this.headerService.getTransactionRemars("");
    this.headerService.getOnboardingStatus(null);
    this.headerService.getCandidatePresentObject(null);
    this.activeChildTabName = "myBucket_pending";
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    this.selectedPendingItems = [];
    this.selectedSavedItems = [];
    this.selectedRejectedItems = [];
    this.IsDownloadBtnShown = false;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.UserName = this._loginSessionDetails.UserSession.PersonName;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    console.log('get sesssion of list ', ((JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue")))));
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    var LstCompanySettings = [];
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId;
    let userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls as any;
    this.accessControl_submit = userAccessControl.filter(a => a.ControlName == "btn_onboarding_submit");

    LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));
    if (LstCompanySettings != null && LstCompanySettings.length > 0) {
      LstCompanySettings = LstCompanySettings.filter(a => a.RoleCode == this.RoleCode);
      if (LstCompanySettings.length > 0) {
        var isExist = LstCompanySettings.find(z => z.ModuleName == 'OnboardigOpsList');
        if (isExist != undefined) {
          this.IsExtraTabRequired = isExist.IsExtraTabRequired;
          this.AlternativeText = isExist.AlternativeText;
          this.AlternativeText1 = isExist.AlternativeText1;

        }
      }
    }
    (this.AlternativeText == null || this.AlternativeText == '') ? "In My Bucket" : true;
    (this.AlternativeText1 == null || this.AlternativeText1 == '') ? "Unclaimed" : true;
    console.log('userId', this.UserId);
    this.tblminDate = new Date();
    this.doRefresh();
    this.getPageLayout();
  }

  getPageLayout() {

    this.pageLayout = null;
    this.spinner = true;
    this.titleService.setTitle('Loading');
    this.headerService.setTitle('');
    this.pageLayoutService.getPageLayout(this.code).pipe(takeUntil(this.stopper)).subscribe(data => {
      console.log(data);
      this.spinner = false;
      this.titleService.setTitle('OnBoarding');
      if (data.Status === true && data.dynamicObject != null) {
        this.pageLayout = data.dynamicObject;
        let pageLayout: PageLayout = data.dynamicObject;
        if (this.BusinessType !== 3) {

          this.clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
          this.clientIdSME = this.sessionService.getSessionStorage("default_SME_ClientId");
          this.clientcontractSME = JSON.parse(this.sessionService.getSessionStorage("SME_ClientContract"));
          this.clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");

          this.clientContractId = this.clientcontractIdSME;
          this.clientId = this.clientIdSME;

          let clientDropDownList: any[] = [];
          let clientcontractDropDownList: any[] = [];

          if (this.clientSME !== undefined && this.clientSME !== null) {
            clientDropDownList.push(this.clientSME);
          }

          if (this.clientcontractSME !== undefined && this.clientcontractSME !== null) {
            clientcontractDropDownList.push(this.clientcontractSME);
          }

          let clientSearchElement = pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@clientid');
          let clientcontractSearchElement = pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@clientcontractid');

          clientSearchElement.Value = this.clientSME.Id;
          clientSearchElement.DropDownList = clientDropDownList;
          clientcontractSearchElement.Value = this.clientcontractSME.Id;
          clientcontractSearchElement.DropDownList = clientcontractDropDownList;

          clientSearchElement.IsIncludedInDefaultSearch = false;
          clientcontractSearchElement.IsIncludedInDefaultSearch = false;

          // pageLayout.SearchConfiguration.ClearButtonRequired = false;
          // pageLayout.SearchConfiguration.SearchButtonRequired = false;

          this.searchConfiguration = pageLayout.SearchConfiguration;
          this.searchElementList = this.searchConfiguration.SearchElementList;

          this.defaultSearchInputs.ClientId = this.clientId;
          this.defaultSearchInputs.ClientContractId = this.clientContractId;
          this.defaultSearchInputs.ClientName = clientDropDownList.find(b => b.Id == this.clientId).Name;
          this.defaultSearchInputs.ClientContractName = clientcontractDropDownList.find(b => b.Id == this.clientContractId).Name;
          this.defaultSearchInputs.IsNapBased = clientcontractDropDownList.find(b => b.Id == this.clientContractId).IsNapBased;
          this.defaultSearchInputs.Client = this.clientSME;
          this.defaultSearchInputs.ClientContract = this.clientcontractSME;

          if (this.activeChildTabName == "myBucket_pending") {
            this.loadInBucketRecords();
          }
          else if (this.activeChildTabName == "myBucket_saved") {
            this.loadInSavedBucketRecords();
          }
          else if (this.activeChildTabName == "myBucket_rejected") {
            this.loadInRejectedBucketRecords();
          }
          else if (this.activeChildTabName == "myBucket_separated") {

          }

          $(document).ready(function () {
            $('#dropDown').click(function () {
              $('.drop-down').toggleClass('drop-down--active');
            });
          });


        }
        else {
          this.searchConfiguration = pageLayout.SearchConfiguration;
          this.searchElementList = this.searchConfiguration.SearchElementList;
        }

        let commonSearchElementsString: string = sessionStorage.getItem('CommonSearchCriteria');
        if (commonSearchElementsString !== undefined && commonSearchElementsString !== null && commonSearchElementsString !== '') {
          this.pageLayoutService.fillSearchElementFromLocalStorage(this.searchElementList);
        }
      }
    }, error => {
      console.log(error);
      this.spinner = false;
      this.titleService.setTitle('HR Suite');
    }
    );
  }

  onClickingSearchButton(event: any) {

    var myElement = document.getElementsByClassName('drop-down--active');
    if (myElement[0]) {
      myElement[0].classList.remove("drop-down--active");
    }

    // this.isBtnDisabledRequired = true;

    console.log('event', event);
    if (event && event.length > 0) {

      if (event.find(a => a.FieldName == '@clientId') != undefined && event.find(a => a.FieldName == '@clientId').Value == null) {
        this.alertService.showWarning("You must have provided the client's name and hit on the search operation ");
        return;
      }
      if (event.find(a => a.FieldName == '@clientContractId') != undefined && event.find(a => a.FieldName == '@clientContractId').Value == null) {
        this.alertService.showWarning("You must have provided the client contract's name and hit on the search operation ");
        return;
      }



      this.spinner2 = true;
      this.clientContractId = event.find(a => a.FieldName == '@clientContractId').Value;
      this.clientId = event.find(a => a.FieldName == '@clientId').Value;
      this.defaultSearchInputs.ClientId = this.clientId;
      this.defaultSearchInputs.ClientContractId = this.clientContractId;
      this.defaultSearchInputs.ClientName = event.find(a => a.FieldName == '@clientId').DropDownList.find(b => b.Id == this.clientId).Name;
      this.defaultSearchInputs.ClientContractName = event.find(a => a.FieldName == '@clientContractId').DropDownList.find(b => b.Id == this.clientContractId).Name;
      this.defaultSearchInputs.IsNapBased = event.find(a => a.FieldName == '@clientContractId').DropDownList.find(b => b.Id == this.clientContractId).IsNapBased;
      this.defaultSearchInputs.Client = event.find(a => a.FieldName == '@clientId').DropDownList.find(b => b.Id == this.clientId);
      this.defaultSearchInputs.ClientContract = event.find(a => a.FieldName == '@clientContractId').DropDownList.find(b => b.Id == this.clientContractId);
      this.pageLayout.SearchConfiguration.SearchElementList = event;
      console.log('pagelayout :::: ', this.pageLayout);

      if (this.activeChildTabName == "myBucket_pending") {
        this.loadInBucketRecords();
      }
      else if (this.activeChildTabName == "myBucket_saved") {
        this.loadInSavedBucketRecords();
      }
      else if (this.activeChildTabName == "myBucket_rejected") {
        this.loadInRejectedBucketRecords();
      }
      else if (this.activeChildTabName == "myBucket_separated") {

      }

    }

    $(document).ready(function () {
      $('#dropDown').click(function () {
        $('.drop-down').toggleClass('drop-down--active');
      });
    });



  }
  onb() {
    $(document).ready(function () {
      $('#dropDown').click(function () {
        $('.drop-down').toggleClass('drop-down--active');
      });
    });
  }


  // first time and ra-load table data's from API calls

  doRefresh() {
    //  this.loadingScreenService.startLoading();
    // this.spinner = true;

    var myElement = document.getElementsByClassName('drop-down--active');
    if (myElement[0]) {
      myElement[0].classList.remove("drop-down--active");
    }




    this.inRejectedBucketList.length = 0;
    this.inRejectedBucketList = [];

    this.inSavedBucketList.length = 0;
    this.inSavedBucketList = [];

    this.inBucketList.length = 0;
    this.inBucketList = [];

    this.customCopyFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>` : '<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>';
    this.customTimelineFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>` : '<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>';
    this.docsFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="fa fa-files-o"  style="cursor:pointer !important"></i>` : '<i class="mdi mdi-eye" style="cursor:pointer !important"></i>';
    this.voidFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-account-remove" title="Cancel Offer" style="cursor:pointer !important"></i>` : '<i class="mdi mdi-account-remove" title="Cancel Offer" style="cursor:pointer !important"></i>';
    this.claimFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-thumb-up-outline" title="Recall" style="cursor:pointer !important"></i>` : '<i class="mdi mdi-thumb-up-outline" title="Recall" style="cursor:pointer !important"></i>';
    this.makeanofferFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-redo-variant" title="Revise Offer"  style="cursor:pointer !important"></i>` : '<i class="mdi mdi-redo-variant" title="Revise Offer" style="cursor:pointer !important"></i>';
    this.viewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="fa fa-eye" title="Details"  style="cursor:pointer !important"></i>` : '<i class="fa fa-eye" title="Details" style="cursor:pointer !important"></i>';



    this.isKYC_Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      dataContext.IsAadhaarKYCVerified ? (`${dataContext.CandidateName} <img src="assets/Images/bookmark.png" style="width: 18px;display: inline-block;">`) : `${dataContext.CandidateName} `;

    this.isNAPS_Formatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && dataContext.IsNapsBased ? (`<a href="javascript:;" class="btn action-edit" style="font-size: 11px;
            background: #e0f5d4;
            min-width: 80px;
            min-height: 24px;
            padding: 4px;
            border-radius: 4%;display: inline-block;
            color: #212529;"> NAPS
          </a>`) : `<a href="javascript:;" class="btn action-edit" style="font-size: 11px;
          background: #a8c6e9;
          min-width: 80px;
          min-height: 24px;
          padding: 4px;
          border-radius: 4%;display: inline-block;
          color: #212529;"> Regular
        </a>`;




    this.inBucketColumnDefinitions = [];
    this.inSavedBucketColumnDefinitions = [];
    this.inRejectedBucketColumnDefinitions = [];

    this.inBucketGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true, // to show search filter
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"

    };

    this.inSavedBucketGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true, // to show search filter
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"
    };

    this.inRejectedBucketGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true, // to show search filter
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"
    };

    let staffingObject = [
      {
        id: 'Client', name: 'Client', field: 'ClientName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
        // editor: 
        // {
        //   model: Editors.longText
        // }
      },
      {
        id: 'Contract', name: 'Contract', field: 'ClientContractCode',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
    ];

    this.unclaimedColumnDefinitions = [
      {
        id: 'Candidate', name: 'Candidate', field: 'CandidateName',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },

      {
        id: 'PrimaryMobile', name: 'Mobile', field: 'PrimaryMobile',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },

      {
        id: 'PrimaryEmail', name: 'Email', field: 'PrimaryEmail',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'Requested For', name: 'Requested For', field: 'RequestedFor',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',

        sortable: true,
        type: FieldType.date
      },
      // {
      //   id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
      //   type: FieldType.string,
      //   sortable: true,
      // },
      {
        id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',

        sortable: true,
        type: FieldType.date
      },
      {
        id: 'Status', name: 'Status', field: 'Status',
        sortable: true,
        type: FieldType.string
      },

      {
        id: 'PendingAtDisplayName', name: 'Pending At', field: 'PendingAt',
        sortable: true,
        type: FieldType.string
      },
      {
        id: 'claim',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.claimFormatter,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          //console.log(args.dataContext);
          let navigationExtras: NavigationExtras = {
            queryParams: {
              "id": args.dataContext.Id,
            }
          };

          this.selectedUnclaimedRecords = [];
          this.selectedUnclaimedRecords.push(args.dataContext.Id);
          this.claimRequest();

          sessionStorage.removeItem('previousPath');
          sessionStorage.setItem('previousPath', '/app/onboardingqc/onbqclist');

          // this.router.navigate(['app/onboarding_qc'], {
          //     queryParams: {
          //         "Idx": btoa(args.dataContext.Id),
          //         "Cdx": btoa(args.dataContext.CandidateId),
          //     }
          // });
          // this.router.navigate(['action-selection'], { state: { example: 'bar' } });

          //   this.selectedTemplates = [];
          //   this.selectedTemplates.push(args.dataContext);
          //   this.editTemplate(false);
        }
      }

    ];
    this.unclaimedGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: false,
      // enableRowSelection:true,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false
      },
      datasetIdPropertyName: "Id"
    };

    this.searchColumnDefinitions = [];
    this.searchGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
        //sidePadding: 15
      },
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: true
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"
    };

    // if (this.clientId > 0 && this.clientContractId > 0) {
    //     this.loadInBucketRecords();
    //     return;
    // }
    // this.spinner = false;



    if (this.activeChildTabName == 'myBucket_separated') {

    }
    else if (this.activeChildTabName == 'myBucket_pending') {

      this.clientId > 0 ? this.loadInBucketRecords() : true;
    }
    else if (this.activeChildTabName == 'myBucket_saved') {

      this.clientId > 0 ? this.loadInSavedBucketRecords() : true;
    }
    else if (this.activeChildTabName == 'myBucket_rejected') {
      this.clientId > 0 ? this.loadInRejectedBucketRecords() : true;
    }

    // this.loadInSavedBucketRecords();
    // this.loadInRejectedBucketRecords();
    // this.setSearchGridColumns();
    // this.loadUnClaimedRecords(true);

  }


  //#endregion

  //#region Private Methods 

  onChangeFromdate(event) {

  }

  setSearchGridColumns() {

    this.searchColumnDefinitions = [
      {
        id: 'Candidate', name: 'Candidate', field: 'CandidateName',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },

      {
        id: 'PrimaryMobile', name: 'Mobile', field: 'PrimaryMobile',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },

      {
        id: 'PrimaryEmail', name: 'Email', field: 'PrimaryEmail',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      // {
      //   id: 'Mandate', name: 'Mandate', field: 'Mandate',
      //   sortable: true,
      //   type: FieldType.string,
      //   filterable: true,
      // },

      {
        id: 'RequestedFor', name: 'Requested For', field: 'RequestedFor',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
        sortable: true,
        type: FieldType.date
      },
      // {
      //   id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
      //   type: FieldType.string,
      //   sortable: true,
      // },
      {
        id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
        sortable: true,
        type: FieldType.date
      },
      {
        id: 'Status', name: 'Status', field: 'Status',

        sortable: true,
        type: FieldType.string
      },
      {
        id: 'PendingAt', name: 'Pending At', field: 'PendingAtUserName',

        sortable: true,
        type: FieldType.string
      },
      {
        id: 'Docs',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.docsFormatter,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {

          console.log(args.dataContext);
          this.preview_docs(args.dataContext);


        }
      },
      // {
      //     id: 'claim',
      //     field: 'Id',
      //     excludeFromHeaderMenu: true,
      //     formatter: this.claimFormatter,
      //     minWidth: 30,
      //     maxWidth: 30,
      //     // use onCellClick OR grid.onClick.subscribe which you can see down below
      //     onCellClick: (e: Event, args: OnEventArgs) => {

      //         console.log(args.dataContext);
      //         this.claim_void_revise_record(args.dataContext, "Claim");


      //     }
      // },
      // {
      //     id: 'void',
      //     field: 'Id',
      //     excludeFromHeaderMenu: true,
      //     formatter: this.voidFormatter,
      //     minWidth: 30,
      //     maxWidth: 30,
      //     // use onCellClick OR grid.onClick.subscribe which you can see down below
      //     onCellClick: (e: Event, args: OnEventArgs) => {

      //         console.log(args.dataContext);
      //         this.claim_void_revise_record(args.dataContext, "Void");


      //     }
      // },
      // {
      //     id: 'offer',
      //     field: 'Id',
      //     excludeFromHeaderMenu: true,
      //     formatter: this.makeanofferFormatter,
      //     minWidth: 30,
      //     maxWidth: 30,
      //     // use onCellClick OR grid.onClick.subscribe which you can see down below
      //     onCellClick: (e: Event, args: OnEventArgs) => {

      //         console.log(args.dataContext);
      //         this.claim_void_revise_record(args.dataContext, "Revise");


      //     }
      // },
      {
        id: 'details',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.viewFormatter,
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {

          console.log(args.dataContext);
          this.editButtonClick(args.dataContext);


        }
      },
    ];
    let staffingObject = [
      {
        id: 'Client', name: 'Client', field: 'ClientName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
        // editor: 
        // {
        //   model: Editors.longText
        // }
      },
      {
        id: 'Contract', name: 'Contract', field: 'ClientContractCode',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
    ];
    this.BusinessType == 3 ? (this.searchColumnDefinitions = staffingObject.concat(this.searchColumnDefinitions as any)) : true;

  }


  claimRequest() {

    if (this.selectedUnclaimedRecords == null || this.selectedUnclaimedRecords == undefined || this.selectedUnclaimedRecords.length == 0) {
      this.alertService.showWarning('No request selected to Claim');
      return;
    }



    this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to claim the selected request(s)', "Yes, Continue").then(result => {
      this.loadingScreenService.startLoading();
      try {


        this.spinner = true;
        var param = { ModuleProcessTransactionIds: this.selectedUnclaimedRecords, UserId: this.UserId };


        this.workFlowApi.UpdatePendingAtUserId(JSON.stringify(param)).pipe(takeUntil(this.stopper)).subscribe((data) => {
          if (data != null && data != undefined && data.Status) {
            this.unclaimedList = this.unclaimedList.filter(x => data.Result.ModuleProcessTransactionIds.find(y => y == x.Id) == null);
            this.unclaimedDataset = null;
            this.unclaimedDataset = this.unclaimedList;
            this.loadingScreenService.stopLoading();
            this.alertService.confirmSwal("Confirmation", 'Request(s) claimed successfully, please click Yes to goto Your Pending requests tab', "Yes").then(result => {
              this.loadingScreenService.startLoading();
              this.loadInBucketRecords();
              this.loadInRejectedBucketRecords();
              this.activeTabName = 'myBucket';
              this.loadingScreenService.stopLoading();
              this.loadUnClaimedRecords(true);

            })
              .catch(error => this.loadingScreenService.stopLoading());
            this.spinner = false;

          }
          else {
            this.spinner = false;

            this.alertService.showWarning('Failed to claim the request(s): ' + (data != undefined && data != null && data.Message != null ? data.Message : ''));
          }
        });
      }
      catch (error) {
        this.spinner = false;
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(error.message);
      }
      finally {
        this.selectedUnclaimedRecords = [];
      }

    })
    //.catch(error => this.loadingScreenService.stopLoading());


    // if (!confirm('Are you sure you want to claim the selected request(s)?')) {
    //     return;
    // }



  }


  editButtonClick(item) {

    let navigationExtras: NavigationExtras = {
      queryParams: {
        "Id": item.Id,
      }
    };

    this.router.navigate(['app/onboarding/onboardingDetails'], {
      queryParams: {
        "Idx": btoa(item.CandidateId),
      }
    });

  }

  loadInBucketRecords() {
    // --- PENDING 
    this.spinner2 = true;
    let ScreenType = CandidateListingScreenType.Pending;

    let candidateName = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@candname') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@candname').Value : "";

    let mobileNumber = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@mobilenumber') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@mobilenumber').Value : "";
    let candEmail = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@email') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@email').Value : "";


    var searchObj = JSON.stringify({
      ClientId: this.BusinessType != 3 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0, CandidateName: candidateName, mobilenumber: mobileNumber, email: candEmail
    })

    var filterObject = JSON.stringify({
      CandidateListingScreenType: ScreenType,
      RoleId: this.RoleId,
      SearchParameter: searchObj,
      ClientId: this.clientId,
      ClientContractId: this.clientContractId
    });


    this.onboardingApi.GetAllenOnboardingCandidates(`filterObject=${filterObject}`).pipe(takeUntil(this.stopper)).subscribe((data) => {
      this.inBucketColumnDefinitions = [
        {
          id: 'Candidate', name: 'Candidate', field: 'CandidateName',
          sortable: true,
          type: FieldType.string,
          filterable: true,
          formatter: this.isKYC_Formatter

        },

        {
          id: 'PrimaryMobile', name: 'Mobile', field: 'PrimaryMobile',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },

        {
          id: 'PrimaryEmail', name: 'Email', field: 'PrimaryEmail',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },

        // {
        //   id: 'Mandate', name: 'Mandate', field: 'Mandate',
        //   sortable: true,
        //   type: FieldType.string,
        //   filterable: true,
        // },

        {
          id: 'RequestedFor', name: 'Requested For', field: 'RequestedFor',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },
        {
          id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
          // formatter: Formatters.dateIso,
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'IsNapsBased', name: 'Request Mode', field: 'IsNapsBased',
          formatter: this.isNAPS_Formatter,
          excludeFromExport: true
        },
        // {
        //   id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
        //   type: FieldType.string,
        //   sortable: true,
        // },
        {
          id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'Status', name: 'Status', field: 'Status',
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'PendingAt', name: 'Pending At', field: 'PendingAt',
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'edit',
          field: 'Id',
          excludeFromHeaderMenu: true,
          formatter: Formatters.editIcon,
          minWidth: 30,
          maxWidth: 30,
          // use onCellClick OR grid.onClick.subscribe which you can see down below
          onCellClick: (e: Event, args: OnEventArgs) => {
            console.log(args.dataContext);

            if(args.dataContext.ProcessstatusId == 4300){
              this.alertService.showWarning('The candidate detail cannot be edited since the record has already been approved by HR.');
              return;
            }

            if (args.dataContext.IsNapsBased) {
              const modalRef1 = this.modalService.open(NapsOnboardingComponent, this.modalOption);
              modalRef1.componentInstance.CandidateBasicDetails = null;
              modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
              modalRef1.componentInstance.CandidateId = args.dataContext.CandidateId;
              modalRef1.result.then((result) => {
                console.log('result', result);
                if (result != 'Modal Closed') {
                  this.doRefresh();
                }

              }).catch((error) => {
                console.log(error);
              });
              return;
            }


            if (args.dataContext.IsNapsBased) {
              const modalRef1 = this.modalService.open(NapsOnboardingComponent, this.modalOption);
              modalRef1.componentInstance.CandidateBasicDetails = null;
              modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
              modalRef1.componentInstance.CandidateId = args.dataContext.CandidateId;
              modalRef1.result.then((result) => {
                console.log('result', result);
                if (result != 'Modal Closed') {
                  this.doRefresh();
                }

              }).catch((error) => {
                console.log(error);
              });
              return;
            }


            this.headerService.getTransactionRemars("");
            this.headerService.getTransactionRemars(args.dataContext.TransactionRemarks);


            this.headerService.getOnboardingStatus("");
            this.headerService.getOnboardingStatus(`${args.dataContext.CandidateName.toUpperCase()} | ${args.dataContext.RequestedFor} | ${args.dataContext.Status} - ${args.dataContext.ClientName}`);

            this.headerService.getCandidatePresentObject(args.dataContext);


            // this.router.navigate(['app/onboarding/onboarding'], {
            //     queryParams: {
            //         "Idx": btoa(args.dataContext.Id),
            //         "Cdx": btoa(args.dataContext.CandidateId),
            //     }
            // });

            if (args.dataContext.EmploymentTypeName != null && args.dataContext.EmploymentTypeName != '' && args.dataContext.EmploymentTypeName.toUpperCase() == "VENDOR") {
              this.router.navigate(['app/onboarding/vendorOnboarding'], {
                queryParams: {
                  "Idx": btoa(args.dataContext.Id),
                  "Cdx": btoa(args.dataContext.CandidateId),
                }
              });
            }
            else {
              this.router.navigate(['app/onboarding/onboardingRequest'], {
                queryParams: {
                  "Idx": btoa(args.dataContext.Id),
                  "Cdx": btoa(args.dataContext.CandidateId),
                }
              });
            }

            // this.router.navigate(['action-selection'], { state: { example: 'bar' } });

            //   this.selectedTemplates = [];
            //   this.selectedTemplates.push(args.dataContext);
            //   this.editTemplate(false);
          }
        },
        // {
        //     id: 'copy',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: this.customCopyFormatter,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {


        //         // this.router.navigateByUrl('/dynamic', { state: { id:1 , name:'Angular' } });
        //         // this.router.navigateByUrl('/dynamic', { state: this.product });
        //         //   this.selectedTemplates = [];
        //         //   this.selectedTemplates.push(args.dataContext);
        //         //   this.editTemplate(false);
        //     }
        // },
        // {
        //     id: 'timeline',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: this.customTimelineFormatter,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {

        //         //   this.selectedTemplates = [];
        //         //   this.selectedTemplates.push(args.dataContext);
        //         //   this.editTemplate(false);
        //     }
        // },
        // {
        //     id: 'delete',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: Formatters.deleteIcon,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {
        //         if (confirm('Are you sure you want to delete this template?')) {
        //             // this.selectedTemplates = [];
        //             // this.selectedTemplates.push(args.dataContext);
        //             // //this.deleteRuleSet();
        //             // //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
        //         }
        //     }
        // }
      ];
      let staffingObject = [
        {
          id: 'Client', name: 'Client', field: 'ClientName',
          sortable: true,
          type: FieldType.string,
          filterable: true,
          // editor: 
          // {
          //   model: Editors.longText
          // }
        },
        {
          id: 'Contract', name: 'Contract', field: 'ClientContractCode',
          sortable: true,
          type: FieldType.string,
          filterable: true,
        },
      ];
      this.BusinessType == 3 ? (this.inBucketColumnDefinitions = staffingObject.concat(this.inBucketColumnDefinitions as any)) : true;

      let apiResult: apiResult = data;
      if (apiResult.Result != "")
        this.inBucketList = JSON.parse(apiResult.Result);
      if (this.BusinessType != 3 && this.inBucketList.length > 0) {
        this.inBucketList = this.inBucketList.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
      }
      // this.inBucketList.length > 0 ? this.inBucketList = this.inBucketList.filter(a => a.EmploymentType != -100) : true;

      // this.inBucketList.forEach(element => {

      //     element.Id =  Math.floor((Math.random() * 10) + 1);

      // });
      console.log('PENDING :: ', this.inBucketList);
      // this.inBucketDataset = this.inBucketList;
      this.spinner2 = false;
      // this.loadingScreenService.stopLoading();
    }), ((err) => {
      this.spinner2 = false;
      // this.loadingScreenService.stopLoading();
    });






    // this.onboardingApi.getRecordsInMyBucket(1)
    //     .subscribe((data) => {



    //         //this.rulesetGrid.setColumns(this.columnDefinitions);


    //         //  console.log(this.inBucketList);
    //         //this.dataView.setItems(this.dataset);
    //         //this.rulesetGrid.render();
    //     },
    //         //error => this.msg = <any>error
    //     );
  }

  loadInSavedBucketRecords() {
    this.spinner2 = true;

    let ScreenType = CandidateListingScreenType.Saved;
    // let searchParam = "Saved";
    let candidateName = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@candname') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@candname').Value : "";

    let mobileNumber = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@mobilenumber') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@mobilenumber').Value : "";
    let candEmail = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@email') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@email').Value : "";


    var searchObj = JSON.stringify({
      ClientId: this.BusinessType != 3 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0, CandidateName: candidateName, mobilenumber: mobileNumber, email: candEmail
    })

    var filterObject = JSON.stringify({
      CandidateListingScreenType: ScreenType,
      RoleId: this.RoleId,
      SearchParameter: searchObj,
      ClientId: this.clientId,
      ClientContractId: this.clientContractId
    });


    this.onboardingApi.GetAllenOnboardingCandidates(`filterObject=${filterObject}`).pipe(takeUntil(this.stopper)).subscribe((data) => {
      this.inSavedBucketColumnDefinitions = [
        {
          id: 'Candidate', name: 'Candidate', field: 'CandidateName',
          sortable: true,
          type: FieldType.string,
          filterable: true,
          formatter: this.isKYC_Formatter

        },

        {
          id: 'PrimaryMobile', name: 'Mobile', field: 'PrimaryMobile',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },

        {
          id: 'PrimaryEmail', name: 'Email', field: 'PrimaryEmail',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },

        {
          id: 'RequestedFor', name: 'Requested For', field: 'RequestedFor',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },
        {
          id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'IsNapsBased', name: 'Request Mode', field: 'IsNapsBased',

          formatter: this.isNAPS_Formatter
        },
        // {
        //   id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
        //   type: FieldType.string,
        //   sortable: true,
        // },
        {
          id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'Status', name: 'Status', field: 'Status',
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'PendingAt', name: 'Pending At', field: 'PendingAt',
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'edit',
          field: 'Id',
          excludeFromHeaderMenu: true,
          formatter: Formatters.editIcon,
          minWidth: 30,
          maxWidth: 30,
          // use onCellClick OR grid.onClick.subscribe which you can see down below
          onCellClick: (e: Event, args: OnEventArgs) => {
            console.log(args.dataContext);
            let navigationExtras: NavigationExtras = {
              queryParams: {
                "id": args.dataContext.Id,
              }
            };
            this.headerService.getTransactionRemars("");
            this.headerService.getTransactionRemars(args.dataContext.TransactionRemarks);
            this.headerService.getOnboardingStatus("");
            this.headerService.getOnboardingStatus(`${args.dataContext.CandidateName.toUpperCase()} | ${args.dataContext.RequestedFor} | ${args.dataContext.Status} - ${args.dataContext.ClientName}`);

            this.headerService.getCandidatePresentObject(args.dataContext);
            // this.router.navigate(['app/onboarding/onboarding'], {
            //     queryParams: {
            //         "Idx": btoa(args.dataContext.Id),
            //         "Cdx": btoa(args.dataContext.CandidateId),
            //     }
            // });

            if (args.dataContext.IsNapsBased) {
              const modalRef1 = this.modalService.open(NapsOnboardingComponent, this.modalOption);
              modalRef1.componentInstance.CandidateBasicDetails = null;
              modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
              modalRef1.componentInstance.CandidateId = args.dataContext.CandidateId;
              modalRef1.result.then((result) => {
                console.log('result', result);
                if (result != 'Modal Closed') {
                  this.doRefresh();
                }

              }).catch((error) => {
                console.log(error);
              });
              return;
            }

            if (args.dataContext.EmploymentTypeName != null && args.dataContext.EmploymentTypeName != '' && args.dataContext.EmploymentTypeName.toUpperCase() == "VENDOR") {
              this.router.navigate(['app/onboarding/vendorOnboarding'], {
                queryParams: {
                  "Idx": btoa(args.dataContext.Id),
                  "Cdx": btoa(args.dataContext.CandidateId),
                }
              });
            }
            else {
              this.router.navigate(['app/onboarding/onboardingRequest'], {
                queryParams: {
                  "Idx": btoa(args.dataContext.Id),
                  "Cdx": btoa(args.dataContext.CandidateId),
                }
              });
            }
            // this.router.navigate(['action-selection'], { state: { example: 'bar' } });

            //   this.selectedTemplates = [];
            //   this.selectedTemplates.push(args.dataContext);
            //   this.editTemplate(false);
          }
        },
        // {
        //     id: 'copy',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: this.customCopyFormatter,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {


        //         // this.router.navigateByUrl('/dynamic', { state: { id:1 , name:'Angular' } });
        //         // this.router.navigateByUrl('/dynamic', { state: this.product });
        //         //   this.selectedTemplates = [];
        //         //   this.selectedTemplates.push(args.dataContext);
        //         //   this.editTemplate(false);
        //     }
        // },
        // {
        //     id: 'timeline',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: this.customTimelineFormatter,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {

        //         //   this.selectedTemplates = [];
        //         //   this.selectedTemplates.push(args.dataContext);
        //         //   this.editTemplate(false);
        //     }
        // },
        // {
        //     id: 'delete',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: Formatters.deleteIcon,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {
        //         if (confirm('Are you sure you want to delete this template?')) {
        //             // this.selectedTemplates = [];
        //             // this.selectedTemplates.push(args.dataContext);
        //             // //this.deleteRuleSet();
        //             // //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
        //         }
        //     }
        // }
      ];
      let staffingObject = [
        {
          id: 'Client', name: 'Client', field: 'ClientName',
          sortable: true,
          type: FieldType.string,
          filterable: true,
          // editor: 
          // {
          //   model: Editors.longText
          // }
        },
        {
          id: 'Contract', name: 'Contract', field: 'ClientContractCode',
          sortable: true,
          type: FieldType.string,
          filterable: true,
        },
      ];
      this.BusinessType == 3 ? (this.inSavedBucketColumnDefinitions = staffingObject.concat(this.inSavedBucketColumnDefinitions as any)) : true;

      let apiResult: apiResult = data;
      if (apiResult.Result != "") {
        this.inSavedBucketList = JSON.parse(apiResult.Result);
        if (this.BusinessType != 3 && this.inSavedBucketList.length > 0) {
          this.inSavedBucketList = this.inSavedBucketList.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
        }
        // this.inSavedBucketList.length > 0 ? this.inSavedBucketList = this.inSavedBucketList.filter(a => a.EmploymentType != -100) : true;

        console.log('inSavedBucketList', this.inSavedBucketList);

        // this.inSavedBucketDataset = this.inSavedBucketList;
        this.spinner2 = false;
      } else {
        this.spinner2 = false;
      }
    }), ((err) => {

      this.spinner2 = false;
    });

  }

  loadInRejectedBucketRecords() {

    this.spinner2 = true;
    let ScreenType = CandidateListingScreenType.Rejected;


    let candidateName = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@candname') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@candname').Value : "";

    let mobileNumber = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@mobilenumber') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@mobilenumber').Value : "";
    let candEmail = this.pageLayout && this.pageLayout.SearchConfiguration.SearchElementList.length > 0 && this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@email') != undefined ? this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@email').Value : "";


    var searchObj = JSON.stringify({
      ClientId: this.BusinessType != 3 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0, CandidateName: candidateName, mobilenumber: mobileNumber, email: candEmail
    })

    var filterObject = JSON.stringify({
      CandidateListingScreenType: ScreenType,
      RoleId: this.RoleId,
      SearchParameter: searchObj,
      ClientId: this.clientId,
      ClientContractId: this.clientContractId
    });


    this.onboardingApi.GetAllenOnboardingCandidates(`filterObject=${filterObject}`).pipe(takeUntil(this.stopper)).subscribe((data) => {
      this.inRejectedBucketColumnDefinitions = [
        {
          id: 'Candidate', name: 'Candidate', field: 'CandidateName',
          sortable: true,
          type: FieldType.string,
          filterable: true,
          formatter: this.isKYC_Formatter

        },

        {
          id: 'PrimaryMobile', name: 'Mobile', field: 'PrimaryMobile',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },

        {
          id: 'PrimaryEmail', name: 'Email', field: 'PrimaryEmail',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },

        {
          id: 'RequestedFor', name: 'Requested For', field: 'RequestedFor',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },
        {
          id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'IsNapsBased', name: 'Request Mode', field: 'IsNapsBased',
          sortable: true,
          type: FieldType.string,
          formatter: this.isNAPS_Formatter
        },
        // {
        //   id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
        //   type: FieldType.string,
        //   sortable: true,
        // },
        {
          id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'Status', name: 'Status', field: 'Status',
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'PendingAt', name: 'Pending At', field: 'PendingAt',
          sortable: true,
          type: FieldType.string
        },
        {
          id: 'edit',
          field: 'Id',
          excludeFromHeaderMenu: true,
          formatter: Formatters.editIcon,
          minWidth: 30,
          maxWidth: 30,
          // use onCellClick OR grid.onClick.subscribe which you can see down below
          onCellClick: (e: Event, args: OnEventArgs) => {
            console.log(args.dataContext);
            let navigationExtras: NavigationExtras = {
              queryParams: {
                "id": args.dataContext.Id,
              }
            };

            this.headerService.checkNewTransfer("");
            this.headerService.checkNewTransfer(false);
            this.headerService.doCheckRedoOffer(false);
            this.headerService.getTransactionRemars("");
            this.headerService.getTransactionRemars(args.dataContext.TransactionRemarks);


            this.headerService.getOnboardingStatus("");
            this.headerService.getOnboardingStatus(`${args.dataContext.CandidateName.toUpperCase()} | ${args.dataContext.RequestedFor} | ${args.dataContext.Status} - ${args.dataContext.ClientName}`);

            this.headerService.getCandidatePresentObject(args.dataContext);

            if (args.dataContext.IsNapsBased) {
              const modalRef1 = this.modalService.open(NapsOnboardingComponent, this.modalOption);
              modalRef1.componentInstance.CandidateBasicDetails = null;
              modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
              modalRef1.componentInstance.CandidateId = args.dataContext.CandidateId;
              modalRef1.result.then((result) => {
                console.log('result', result);
                if (result != 'Modal Closed') {
                  this.doRefresh();
                }

              }).catch((error) => {
                console.log(error);
              });
              return;
            }

            if (args.dataContext.EmploymentTypeName != null && args.dataContext.EmploymentTypeName != '' && args.dataContext.EmploymentTypeName.toUpperCase() == "VENDOR") {
              this.router.navigate(['app/onboarding/vendorOnboarding'], {
                queryParams: {
                  "Idx": btoa(args.dataContext.Id),
                  "Cdx": btoa(args.dataContext.CandidateId),
                }
              });
            }
            else {
              this.router.navigate(['app/onboarding/onboardingRequest'], {
                queryParams: {
                  "Idx": btoa(args.dataContext.Id),
                  "Cdx": btoa(args.dataContext.CandidateId),
                }
              });
            }

            // this.router.navigate(['action-selection'], { state: { example: 'bar' } });

            //   this.selectedTemplates = [];
            //   this.selectedTemplates.push(args.dataContext);
            //   this.editTemplate(false);
          }
        },
        // {
        //     id: 'copy',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: this.customCopyFormatter,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {


        //         // this.router.navigateByUrl('/dynamic', { state: { id:1 , name:'Angular' } });
        //         // this.router.navigateByUrl('/dynamic', { state: this.product });
        //         //   this.selectedTemplates = [];
        //         //   this.selectedTemplates.push(args.dataContext);
        //         //   this.editTemplate(false);
        //     }
        // },
        // {
        //     id: 'timeline',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: this.customTimelineFormatter,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {

        //         //   this.selectedTemplates = [];
        //         //   this.selectedTemplates.push(args.dataContext);
        //         //   this.editTemplate(false);
        //     }
        // },
        // {
        //     id: 'delete',
        //     field: 'Id',
        //     excludeFromHeaderMenu: true,
        //     formatter: Formatters.deleteIcon,
        //     minWidth: 30,
        //     maxWidth: 30,
        //     // use onCellClick OR grid.onClick.subscribe which you can see down below
        //     onCellClick: (e: Event, args: OnEventArgs) => {
        //         if (confirm('Are you sure you want to delete this template?')) {
        //             // this.selectedTemplates = [];
        //             // this.selectedTemplates.push(args.dataContext);
        //             // //this.deleteRuleSet();
        //             // //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
        //         }
        //     }
        // }
      ];
      let staffingObject = [
        {
          id: 'Client', name: 'Client', field: 'ClientName',
          sortable: true,
          type: FieldType.string,
          filterable: true,
          // editor: 
          // {
          //   model: Editors.longText
          // }
        },
        {
          id: 'Contract', name: 'Contract', field: 'ClientContractCode',
          sortable: true,
          type: FieldType.string,
          filterable: true,
        },
      ];

      this.BusinessType == 3 ? (this.inRejectedBucketColumnDefinitions = staffingObject.concat(this.inRejectedBucketColumnDefinitions as any)) : true;

      let apiResult: apiResult = data;
      if (apiResult.Result != "") {
        this.inRejectedBucketList = JSON.parse(apiResult.Result);
        if (this.BusinessType != 3 && this.inRejectedBucketList.length > 0) {
          this.inRejectedBucketList = this.inRejectedBucketList.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
        }
        // this.inRejectedBucketList.length > 0 ? this.inRejectedBucketList = this.inRejectedBucketList.filter(a => a.EmploymentType != -100) : true;

        // this.inRejectedBucketDataset = this.inRejectedBucketList;
        this.spinner2 = false;
      } else {
        this.spinner2 = false;
      }
    }), ((err) => {

      this.spinner2 = false;
    });

  }

  loadUnClaimedRecords(isRefresh: boolean) {
    this.spinner2 = true;
    if (isRefresh || this.unclaimedDataset == null || this.unclaimedList == null || this.unclaimedList.length == 0) {
      let ScreenType = CandidateListingScreenType.Team;
      let searchParam = "nil";

      var searchObj = JSON.stringify({
        ClientId: (this.BusinessType == 1 || this.BusinessType == 2) ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0
      })


      this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, ((this.BusinessType == 1 || this.BusinessType == 2) ? searchObj : searchParam)).pipe(takeUntil(this.stopper)).subscribe((data) => {

        if (!data.Status) {
          this.spinner2 = false;
          return;
        }


        let apiResult: apiResult = data;
        if (apiResult.Result != "")
          this.unclaimedList = JSON.parse(apiResult.Result);

        this.unclaimedDataset = this.unclaimedList;
        if (this.BusinessType != 3 && this.unclaimedDataset.length > 0) {
          this.unclaimedDataset = this.unclaimedDataset.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
        }
        // this.unclaimedDataset.length > 0?   this.unclaimedDataset = this.unclaimedDataset.filter(a=>a.EmploymentType != -100) : true; 
        this.spinner2 = false;


      }), ((err) => {
        this.spinner2 = false;
        // this.loadingScreenService.stopLoading();
      });
    }
  }

  //#endregion
  addCandidates1() {
    this.headerService.checkNewTransfer("");
    this.headerService.checkNewTransfer(true);
    this.headerService.doCheckRedoOffer(false);

    sessionStorage.removeItem('previousPath');
    sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');

    this.router.navigate(['/app/onboarding/onboardingRequest1']);
    return;
  }

  addCandidates() {
    var _widgetObject: MultiButtonWidget =
    {
      modalTitle: "Onboarding Request",
      modalSubTitle: "---",
      parentScreenName: "Onboarding",
      parentScreenNavigator: "onboarding_ops",
      modalDesciption: "",
      buttonWidgetList: [
        {
          buttonTitle: "Candidate Onboarding",
          buttonSubTitle: "--",
          buttonDescription: "Process of introducing a new hires into an organization",
          pageNavigator: "onboardingRequest",
          isNavigationRequired: true,
          icon: 'candidate.png',
          isRequired: true,
          pageName: "Onboarding"
        },
        {
          buttonTitle: "Aadhaar Onboarding",
          buttonSubTitle: "--",
          buttonDescription: "It captures candidate basic data through e-verification based application",
          pageNavigator: "Aadhaar",
          isNavigationRequired: false,
          icon: 'id-cards.png',
          isRequired: true,
          pageName: "Aadhaar"
        },
        {
          buttonTitle: "NAPS Onboarding",
          buttonSubTitle: "--",
          buttonDescription: "Providing financial incentives, technology and advocacy support",
          pageNavigator: "NAPS",
          icon: 'policy.png',
          isNavigationRequired: false,
          isRequired: true,
          pageName: "NAPS"
        },
        // {
        //     buttonTitle: "Vendor Request",
        //     buttonSubTitle: "--",
        //     buttonDescription: "Process of guiding new vendors into your company's network",
        //     pageNavigator: "vendorOnboarding",
        //     icon: 'vendor.png',
        //     isNavigationRequired : true,
        //     isRequired: environment.environment.IsVendorOnboardingRequired,
        //     pageName :"Vendor"
        // }
      ]
    }

    if (_widgetObject.buttonWidgetList.filter(a => a.isRequired == true).length == 1) {

      this.headerService.checkNewTransfer("");
      this.headerService.checkNewTransfer(true);
      this.headerService.doCheckRedoOffer(false);

      sessionStorage.removeItem('previousPath');
      sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');

      this.router.navigate(['/app/onboarding/onboardingRequest']);
      return;
    }

    const modalRef = this.modalService.open(MultiButtonWidgetComponent, this.modalOption);
    modalRef.componentInstance.MultiButtonWidget = _widgetObject;

    modalRef.result.then((result) => {
      console.log('WIDGET ACTION :', result);

      if (result == "Onboarding") {
        this.headerService.checkNewTransfer("");
        this.headerService.checkNewTransfer(true);

        this.headerService.doCheckRedoOffer(false);

        sessionStorage.removeItem('previousPath');
        sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');
        this.router.navigate(['/app/onboarding/onboardingRequest']);
      }
      if (result == "Aadhaar") {
        const modalRef = this.modalService.open(AadhaarVerificationComponent, this.modalOption);
        modalRef.componentInstance.CompanyId = this.CompanyId;
        modalRef.result.then((result) => {
          console.log('result', result);
          if (result != 'Modal Closed') {

            let integ = new IntegrationTransactionalDetails();
            integ = result;
            const responseDate = JSON.parse(integ.ResponseData);
            console.log('responseDate', responseDate);
            this.headerService.setCandidateDetailsForAadhaar(responseDate.data);

            this.headerService.checkNewTransfer("");
            this.headerService.checkNewTransfer(true);
            this.headerService.doCheckRedoOffer(false);

            sessionStorage.removeItem('previousPath');
            sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');
            this.router.navigate(['/app/onboarding/onboardingRequest']);
          }

        }).catch((error) => {
          console.log(error);
        });
      }
      if (result == "NAPS") {
        // const modalRef = this.modalService.open(MycontractwizardComponent, this.modalOption);
        // modalRef.componentInstance.CompanyId = this.CompanyId;
        // modalRef.componentInstance.RoleId = this.RoleId;
        // modalRef.componentInstance.UserId = this.UserId;
        // modalRef.result.then((result) => {
        //     console.log('result', result);
        //     if (result != 'Modal Closed') {

        // let myDefaultClientObject = result;
        // this.headerService.setDefaultClientObject(this.defaultSearchInputs);
        console.log('defaultSearchInputs', this.defaultSearchInputs);

        const modalRef = this.modalService.open(NapsOnboardingComponent, this.modalOption);
        modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;

        modalRef.result.then((result) => {
          console.log('result', result);
          if (result != 'Modal Closed') {
            this.doRefresh();

          }

        }).catch((error) => {
          console.log(error);
        });

        // let integ = new IntegrationTransactionalDetails();
        // integ = result;
        // const responseDate = JSON.parse(integ.ResponseData);
        // console.log('responseDate', responseDate);
        // this.headerService.setCandidateDetailsForAadhaar(responseDate.data);

        // this.headerService.checkNewTransfer("");
        // this.headerService.checkNewTransfer(true);
        // this.headerService.doCheckRedoOffer(false);

        // sessionStorage.removeItem('previousPath');
        // sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');
        // this.router.navigate(['/app/onboarding/onboardingRequest']);
        // }

        // }).catch((error) => {
        //     console.log(error);
        // });
      }



    }).catch((error) => {
      console.log(error);
    });



    //  this.router.navigate(['/app/onboarding/onboarding']);

    // this.router.navigate(['app/onboarding/onboarding'], {
    //     queryParams: {
    //         "Idx": btoa('115390'),
    //         "Cdx": btoa('115390'),
    //     }
    // });



  }

  doCalculateSalary() {


    // $('.drop-down--active').removeClass('drop-down');

    // $('.drop-down__item').click(function () {
    // $('.drop-down drop-down--active').removeClass('drop-down--active');
    // $('drop-down drop-down--active').toggleClass('drop-down');
    // });

    var myElement = document.getElementsByClassName('drop-down--active');
    if (myElement[0]) {
      myElement[0].classList.remove("drop-down--active");
    }


    if ((this.clientId == 0 || this.clientContractId == 0)) {
      this.alertService.showWarning('You must have filled out the client and client contract to continue the onboarding request.');
      return;
    }

    const modalRef1 = this.modalService.open(SalaryCalculatorComponent, this.modalOption);
    modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
    modalRef1.componentInstance.BusinessType = this.BusinessType;

    modalRef1.result.then((result) => {
      console.log('result', result);
      if (result != 'Modal Closed') {
      }

    }).catch((error) => {
      console.log(error);
    });
  }

  onboardingNewRequest(RequestType) {



    // var myElement = document.getElementsByClassName('drop-down--active');
    // if (myElement[0]) {
    //     myElement[0].classList.remove("drop-down--active");
    // }

    // $('.drop-down').removeClass("drop-down--active");

    var myElement = document.getElementsByClassName('drop-down--active');
    if (myElement[0]) {
      myElement[0].classList.remove("drop-down--active");
    }

    if (RequestType == 'NAPS' && (this.clientId == 0 || this.clientContractId == 0)) {
      this.alertService.showWarning('You must have filled out the client and client contract to continue the onboarding request.');
      return;
    }

    if (!environment.environment.IsAadhaarOnboardingRequired) {

      if (RequestType == 'NAPS') {
        this.callNapsOnboarding();
        return;
      } else {
        this.callRegularOnboarding();
        return;
      }
    }

    this.alertService.confirmSwalWithClose("Confirmation", "Do you want to use this onboarding Request via digital onboarding (Aadhaar) or manual onboarding?", "Manual", "Aadhaar").then((result) => {
      // REGULAR
      if (RequestType == 'Regular') {
        this.callRegularOnboarding();
      } else {
        this.callNapsOnboarding();
      }


    }).catch(error => {
      // AADHAAR
      if ((this.clientId == 0 || this.clientContractId == 0)) {
        this.alertService.showWarning('You must have filled out the client and client contract to continue the onboarding request.');
        return;
      }

      const modalRef = this.modalService.open(AadhaarVerificationComponent, this.modalOption);
      modalRef.componentInstance.CompanyId = this.CompanyId;
      modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
      modalRef.result.then((result) => {
        console.log('result', result);
        if (result != 'Modal Closed') {

          let integ = new IntegrationTransactionalDetails();
          integ = result;
          const sourceData = JSON.parse(integ.SourceData);
          const responseData = JSON.parse(integ.ResponseData);
          console.log('responseDate', responseData);
          responseData.data.result.dataFromAadhaar.maskedAadhaarNumber = sourceData.aadhaarNo;

          this.headerService.setCandidateDetailsForAadhaar(responseData.data.result.dataFromAadhaar);
          this.headerService.setDefaultClientObject(this.defaultSearchInputs);

          if (RequestType == 'Regular') {
            this.headerService.checkNewTransfer("");
            this.headerService.checkNewTransfer(true);

            this.headerService.doCheckRedoOffer(false);
            this.headerService.setCandidateBasicInformation(result);
            sessionStorage.removeItem('previousPath');
            sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');
            this.router.navigate(['/app/onboarding/onboardingRequest']);
          } else {

            this.headerService.setDefaultClientObject(this.defaultSearchInputs);
            const modalRef = this.modalService.open(NapsOnboardingComponent, this.modalOption);
            modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
            modalRef.componentInstance.CandidateId = 0;

            modalRef.result.then((result) => {
              console.log('result', result);
              if (result != 'Modal Closed') {
                this.doRefresh();
              }

            }).catch((error) => {
              console.log(error);
            });
          }
        }

      }).catch((error) => {
        console.log(error);
      });
    });
  }
  onChangetblDate(event) {

    var validFrom = new Date(event);
    this.tblminDate.setDate(validFrom.getDate() + 1);
  }



  searchData() {
    //TODO: do the validations properly so that numerous data is not returned
    if ((this.fromDate == null || this.fromDate == undefined) &&
      (this.toDate == null || this.toDate == undefined) &&
      (this.candName == null || this.candName == undefined || this.candName.trim() == '')
      // (this.clientName == null || this.clientName == undefined || this.clientName.trim() == '') && 
      // (this.mandName == null || this.mandName == undefined || this.mandName.trim() == '')
    ) {

      this.alertService.showInfo("Please provide any search criteria")
      return;
    }
    this.spinner = true;
    var searchObj = JSON.stringify({
      CandidateName: this.candName,
      FromDate: this.fromDate,
      Todate: this.toDate,
      ClientId: (this.BusinessType == 1 || this.BusinessType == 2) ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0

    })

    console.log(searchObj);

    this.onboardingApi.getOnboardingListingInfo(CandidateListingScreenType.All, this.RoleId, (searchObj)).pipe(takeUntil(this.stopper)).subscribe((data) => {

      let apiResult: apiResult = data;
      if (apiResult.Result != "") {
        this.searchList = JSON.parse(apiResult.Result);
        this.searchDataset = this.searchList;
        console.log(this.searchDataset);

        this.spinner = false;

        // this.loadingScreenService.stopLoading();
        return;
      }
      else {
        this.spinner = false;
        this.searchList = [];
        this.searchDataset = this.searchList;
      }

    }), ((err) => {
      // this.loadingScreenService.stopLoading();
    });

  }
  callRegularOnboarding() {
    this.headerService.checkNewTransfer("");
    this.headerService.checkNewTransfer(true);

    this.headerService.doCheckRedoOffer(false);
    this.headerService.setDefaultClientObject(this.defaultSearchInputs);
    this.headerService.setCandidateBasicInformation(null);

    sessionStorage.removeItem('previousPath');
    sessionStorage.setItem('previousPath', '/app/onboarding/onboarding_ops');
    this.router.navigate(['/app/onboarding/onboardingRequest']);
  }

  callNapsOnboarding() {

    const modalRef = this.modalService.open(CandidatebasicinformationComponent, this.modalOption);
    modalRef.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
    modalRef.result.then((result) => {
      console.log('result', result);
      if (result != 'Modal Closed') {
        this.headerService.setCandidateBasicInformation(result);
        const modalRef1 = this.modalService.open(NapsOnboardingComponent, this.modalOption);
        modalRef1.componentInstance.CandidateBasicDetails = result;
        modalRef1.componentInstance.defaultSearchInputs = this.defaultSearchInputs;
        modalRef1.componentInstance.CandidateId = 0;

        modalRef1.result.then((result) => {
          console.log('result', result);
          if (result != 'Modal Closed') {
            this.doRefresh();
          }

        }).catch((error) => {
          console.log(error);
        });
      }

    }).catch((error) => {
      console.log(error);
    });

  }

  clearSearchCriteria() {

    this.fromDate = null;
    this.toDate = null;
    this.candName = null;
    this.searchDataset = [];
  }

  preview_docs(item) {

    const modalRef = this.modalService.open(TransactionsModalComponent, this.modalOption);
    modalRef.componentInstance.CandidateInfo = item;

    modalRef.result.then((result) => {

    }).catch((error) => {
      console.log(error);
    });

  }

  claim_void_revise_record(item, whichAction) {



    this.alertService.confirmSwal("Are you sure?", `Are you sure you want to ${whichAction} the selected request(s)`, "Yes, Continue").then(result => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
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
        let request_params = `moduletransactionId=${item.Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

        if (whichAction == "Claim") {
          this.searchService.updateClaimOnBoardRequest(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading()
              this.alertService.showSuccess(apiResult.Message);
              this.searchData();

            }
          })
        }
        else if (whichAction == "Void") {
          this.searchService.updateVoidOnBoardRequest(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading()
              this.alertService.showSuccess(apiResult.Message);
              this.searchData();

            }
          })
        }
      })
    })

      .catch(error => this.loadingScreenService.stopLoading());
  }


  make_an_offer(item) {

    this.loadingScreenService.startLoading();
    let request_params = `candidateId=${item[0].CandidateId}`;
    this.searchService.getValidToMakeOffer(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status) {

        if (apiResult.Message == "") {

          this.headerService.checkNewTransfer("");
          this.headerService.checkNewTransfer(true);

          this.headerService.doCheckRedoOffer(false);
          this.headerService.doCheckRedoOffer(true);

          this.loadingScreenService.stopLoading();
          const _Id = 0;
          this.sessionService.delSessionStorage("IsSeparatedCandidate");
          this.sessionService.setSesstionStorage('IsSeparatedCandidate', false);
          this.router.navigate(['app/onboarding/onboarding_revise'], {
            queryParams: {
              "Idx": btoa(item[0].Id),
              "Cdx": btoa(item[0].CandidateId),
            }
          });


          // this.alertService.s\
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
          this.searchData();
        }


      }
    })


  }

  /* #region  On Select rows using checkbox */
  onSelectedRowsChanged(data, args) {
    console.log(args);

    this.selectedmigrationRecords = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        this.selectedmigrationRecords.push(this.searchList[args.rows[i]]);
      }
    }
    console.log(this.selectedmigrationRecords);
  }
  /* #endregion */


  recall(item) {


    this.alertService.confirmSwal("Are you sure you want to claim the offer?", `This action will reterive and re-assign the request to you?`, "Yes, Continue").then(result => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
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
        let request_params = `moduletransactionId=${item[0].Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

        this.searchService.updateClaimOnBoardRequest(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status == true || apiResult.Result != null) {
            this.loadingScreenService.stopLoading()
            this.alertService.showSuccess(apiResult.Message);
            this.searchData();

          } else {
            this.loadingScreenService.stopLoading()
            this.alertService.showWarning(apiResult.Message);
          }
        })
      })
    })

      .catch(error => this.loadingScreenService.stopLoading());


  }

  revise_offer(item) {
    let request_params = `candidateId=${item[0].CandidateId}`;
    this.searchService.getValidToMakeOffer(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status) {
        this.alertService.showWarning(apiResult.Message);
        this.alertService.confirmSwal("Are you sure you want to cancle and revise the offer?", `This action will cancel the existing offer and allow you to make a submit a new request.${apiResult.Message}`, "Yes, Continue").then(result => {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-danger'
            },
            buttonsStyling: true
          })


          let jsonStr = null;
          this.loadingScreenService.startLoading();
          let request_params = `moduletransactionId=${item[0].Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

          this.searchService.updateVoidOnBoardRequest(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading()

              // this.make_an_offer(item);
              this.headerService.checkNewTransfer("");
              this.headerService.checkNewTransfer(true);

              this.headerService.doCheckRedoOffer(false);
              this.headerService.doCheckRedoOffer(true);

              this.loadingScreenService.stopLoading();
              const _Id = 0;
              this.sessionService.delSessionStorage("IsSeparatedCandidate");
              this.sessionService.setSesstionStorage('IsSeparatedCandidate', false);
              this.router.navigate(['app/onboarding/onboarding_revise'], {
                queryParams: {
                  "Idx": btoa(item[0].Id),
                  "Cdx": btoa(item[0].CandidateId),
                }
              });
            }
          })
          // })
        })

          .catch(error => this.loadingScreenService.stopLoading());


      }
      else {
        this.alertService.confirmSwal("Are you sure you want to revise the offer?", `This action will cancel the existing offer and allow you to make a submit a new request.`, "Yes, Continue").then(result => {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-danger'
            },
            buttonsStyling: true
          })


          let jsonStr = null;
          this.loadingScreenService.startLoading();
          let request_params = `moduletransactionId=${item[0].Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

          this.searchService.updateVoidOnBoardRequest(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading()

              //  this.make_an_offer(item);
              this.headerService.checkNewTransfer("");
              this.headerService.checkNewTransfer(true);

              this.headerService.doCheckRedoOffer(false);
              this.headerService.doCheckRedoOffer(true);

              this.loadingScreenService.stopLoading();
              const _Id = 0;
              this.sessionService.delSessionStorage("IsSeparatedCandidate");
              this.sessionService.setSesstionStorage('IsSeparatedCandidate', false);
              this.router.navigate(['app/onboarding/onboarding_revise'], {
                queryParams: {
                  "Idx": btoa(item[0].Id),
                  "Cdx": btoa(item[0].CandidateId),
                }
              });
            }
          })
          // })
        })

          .catch(error => this.loadingScreenService.stopLoading());


      }
    })

  }


  cancel_offer(item) {
    this.alertService.confirmSwal("Are you sure you want to cancel the offer?", `This action will cancel the offer request.`, "Yes, Continue").then(result => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })

      swalWithBootstrapButtons.fire({
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
        let request_params = `moduletransactionId=${item[0].Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

        this.searchService.updateVoidOnBoardRequest(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading()
            this.alertService.showSuccess(apiResult.Message);
            this.searchData();

          }
        })
      })
    })

      .catch(error => this.loadingScreenService.stopLoading());


  }


  loadData(event) {
    if (event.nextId == 'myBucket') {

      this.selectedmigrationRecords = [];
    }
    else if (event.nextId == 'searchAll') {
    }
    this.activeTabName = event.nextId;
  }

  childTabLoadData(event) {
    if (event.nextId == 'myBucket_separated') {
      this.selectedPendingItems = [];
      this.selectedSavedItems = [];
      this.selectedRejectedItems = [];
    }
    else if (event.nextId == 'myBucket_pending') {
      this.selectedSavedItems = [];
      this.selectedRejectedItems = [];
      this.inBucketList.length == 0 ? this.loadInBucketRecords() : true;
    }
    else if (event.nextId == 'myBucket_saved') {
      this.selectedPendingItems = [];
      this.selectedRejectedItems = [];
      this.inSavedBucketList.length == 0 ? this.loadInSavedBucketRecords() : true;
    }
    else if (event.nextId == 'myBucket_rejected') {
      this.selectedSavedItems = [];
      this.selectedRejectedItems = [];
      this.inRejectedBucketList.length == 0 ? this.loadInRejectedBucketRecords() : true;
    }
    this.activeChildTabName = event.nextId;
  }

  makeAnNewOffer() {
    this.separatedCandidate.subscribeEmitter();
  }

  separatedCandidateChangeHandler(items: any) {
    console.log('emit', items);
    if (items != undefined && items != null && items.length != 0 && items.length == 1) {

      this.alertService.confirmSwal("Are you sure?", `This action will validate the existing offer and allow you to make a submit a new request.`, "Yes, Continue").then(result => {

        this.loadingScreenService.startLoading();
        let request_params = `candidateId=${items[0].CandidateId}&employeeId=${items[0].EmployeeId}&remarks=''`;
        console.log('request_params', request_params);

        this.searchService.ValidateAndUpdateToMakeOfferForSeparation(request_params).pipe(takeUntil(this.stopper)).subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.sessionService.delSessionStorage("IsSeparatedCandidate");
            this.sessionService.setSesstionStorage('IsSeparatedCandidate', true);
            this.router.navigate(['app/onboarding/onboarding_revise'], {
              queryParams: {
                "Idx": btoa(items[0].Id),
                "Cdx": btoa(items[0].CandidateId),
              }
            });
            // this.router.navigate(['app/onboarding_revise'], {
            //     queryParams: {
            //         "Idx": btoa(item[0].ModuletransactionId),
            //         "Cdx": btoa(item[0].Id),
            //     }
            // });
          } else {
            this.alertService.showWarning(apiResult.Message);
            this.loadingScreenService.stopLoading();
          }
        })

      })

        .catch(error => this.loadingScreenService.stopLoading());

    } else {
      this.alertService.showWarning('Please select only one candidate to make an offer');
      return;
    }

  }

  import_data() {
    this.btnspinner = true;
    this.showFailed = false;
    this.convertedJSON = [];
    this.globalJSON = [];
    this.activeBulkMode = "Regular";
    this.myInputVariable.nativeElement.value = "";
    this.DocumentId = null;
    console.log('importLayout', this.importLayout);

    try {
      this.importLayoutService.getImportLayout(this.ImportLayoutCode)
        .pipe(takeUntil(this.stopper))
        .subscribe(data => {
          console.log("import layout:", data);

          if (data != undefined && data != null) {
            if (data.Status) {
              this.importLayout = data.dynamicObject;

              this.getPayGroupDetails().then(() => {
                this.btnspinner = false;
                $('#popup_import_data').modal({
                  backdrop: 'static',
                  keyboard: false,
                  show: true
                });
              });
            } else {
              this.handleTemplateConfigurationError();
            }
          } else {
            this.handleTemplateConfigurationError();
          }
        },
          error => {
            console.log('Error:', error);
          });
    } catch (error) {
      console.log('Exception:', error);
    }
  }

  handleTemplateConfigurationError() {
    this.btnspinner = false;
    this.alertService.showWarning("Could not get template configuration");
    // You might want to consider whether to hide the modal here or not.
  }

  modal_dismiss1(activityName: string) {
    $('#popup_uploadClientApproval').modal('hide');
    this.selectedExcelItems.length = 0;
    this.approvalForId = null;
    this.myInputVariable1.nativeElement.value = "";
    this.convertedJSON.forEach(element => element.IsSelected = false);
  }
  modal_dismiss(activityName: string) {
    this.clearJSONData();
    const modalId = activityName === "Regular" ? '#popup_import_data' : '#popup_import_data_naps';
    $(modalId).modal('hide');
  }
  clearJSONData() {
    this.convertedJSON = [];
    this.globalJSON = [];
  }

  async doOpenBulkNaps() {
    try {
      this.activeBulkMode = "NAPS";
      this.btnNapsspinner = true;

      const clientId = this.BusinessType === 3
        ? this.defaultSearchInputs.ClientId
        : this.sessionService.getSessionStorage('default_SME_ClientId');

      const clientContractId = this.BusinessType === 3
        ? this.defaultSearchInputs.ClientContractId
        : this.sessionService.getSessionStorage('default_SME_ContractId');

      const DataSource = { Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false };
      const DataSourceForCL = { Type: 1, Name: "clientlocation", EntityType: 0, IsCoreEntity: false };
      const SearchElementList = [
        { FieldName: '@clientId', Value: clientId, IsIncludedInDefaultSearch: true, ReadOnly: false },
        { FieldName: '@clientContractId', Value: clientContractId, IsIncludedInDefaultSearch: true, ReadOnly: false }
      ];
      const DataSource_CC = { Type: 1, Name: "invoicefromandtomapping", EntityType: 0, IsCoreEntity: false };
      const SearchElementList_CC = [
        { FieldName: '@clientId', Value: clientId, IsIncludedInDefaultSearch: true, ReadOnly: false },
        { FieldName: '@clientContractId', Value: clientContractId, IsIncludedInDefaultSearch: true, ReadOnly: false }
      ];

      this.LstClientLocation = await this.getClientLocationByClientId(clientId);
      this.LstTeam = await this.getDataset(DataSource, SearchElementList);
      this.LstCostCode = await this.getDataset(DataSource_CC, SearchElementList_CC);

      this.btnNapsspinner = false;
      $('#popup_import_data_naps').modal({
        backdrop: 'static',
        keyboard: false,
        show: true
      });
    } catch (error) {
      console.error('Error in doOpenBulkNaps:', error);
    }
  }

  async getClientLocationByClientId(clientId) {
    try {
      const dataset = await this.clientService.GetClientLocationByClientId(clientId).pipe(takeUntil(this.stopper)).toPromise();
      return (dataset.Status && dataset.dynamicObject !== null && dataset.dynamicObject !== '')
        ? dataset.dynamicObject
        : [];
    } catch (error) {
      console.log('Error in getClientLocationByClientId:', error);
      return [];
    }
  }
  async GetCostCodeByTeamId(TeamId) {
    try {
      const dataset = await this.clientService.GetCostCodeByTeamId(TeamId).pipe(takeUntil(this.stopper)).toPromise();
      return (dataset.Status && dataset.dynamicObject !== null && dataset.dynamicObject !== '')
        ? dataset.dynamicObject
        : [];
    } catch (error) {
      console.log('Error in GetCostCodeByTeamId:', error);
      return [];
    }
  }

  async getDataset(dataSource, searchElementList) {
    try {
      const dataset = await this.pageLayoutService.getDataset(dataSource, searchElementList).pipe(takeUntil(this.stopper)).toPromise();
      return (dataset.Status && dataset.dynamicObject !== null && dataset.dynamicObject !== '')
        ? JSON.parse(dataset.dynamicObject)
        : [];
    } catch (error) {
      console.log('Error in getDataset:', error);
      return [];
    }
  }

  async OnChangeTeam(ev) {
    console.log('ev ', ev);
  }

  openClientApprovalModal() {
    $('#popup_uploadClientApproval').modal({
      backdrop: 'static',
      keyboard: false,
      show: true
    });
  }

  modal_dismiss_clientapproval() {
    $('#popup_uploadClientApproval').modal('hide');
  }


  getPayGroupDetails() {
    const promise = new Promise((res, rej) => {

      this.obs = this.onboardingApi.GetPayGroupDetails(this.defaultSearchInputs.ClientContractId).pipe(takeUntil(this.stopper)).subscribe((result: apiResponse) => {
        console.log('result', result);
        // const dynoResponse: apiResponse = result.dynamicObject;
        // this.LstPayGroup = dynoResponse.dynamicObject;
        this.LstPayGroup = result.dynamicObject
        res(true);
      })
    })
    return promise;
  }
  OnChangePayGroup(event) {
    this.payGroupObj = event;
  }
  OnChangeRequestFor(event) {
    this.requestForId = event.id;
  }

  onFileChange(ev, activityName) {
    const regularActivityCheck = activityName === "Regular";
    const teamName = regularActivityCheck ? "" : (this.LstTeam.find(a => a.Id == this.teamId) || {}).Name;

    const isInvalidInput = () => {
      ev.target.value = '';
      return true;
    };

    if (regularActivityCheck) {
      if ((this.payGroupId === null || this.requestForId === null)) {
        return isInvalidInput() && this.alertService.showWarning('Please fill out the pay structure and request for type before choosing a sheet and try again.');
      }

      if ((this.DocumentId === null || this.DocumentId === 0)) {
        return isInvalidInput() && this.alertService.showWarning('Supportive documents are required: Client Approval');
      }
    } else {
      if (this.teamId === null || this.teamId === 0) {
        return isInvalidInput() && this.alertService.showWarning('Please pick a name for your team');
      }
    }

    this.apiSpinner = false;
    this.IsCompleted = true;
    this.progressRequest.totalRequest.length = 0;
    this.progressRequest.failedRequest.length = 0;
    this.progressRequest.completedRequest.length = 0;

    const reader = new FileReader();
    const file = ev.target.files[0];
    let count = 0;

    reader.onload = (event) => {
      const data = reader.result;
      const workBook = XLSX.read(data, { type: 'binary', cellDates: true });
      var jsonOpts = regularActivityCheck ? { raw: false, range: "A1:DO100", header: 0, defval: null } : { header: 0, raw: false, defval: null };
      const jsonData = workBook.SheetNames.reduce((initial, name) => {
        count = count + 1;
        const sheet = workBook.Sheets[name];
        const jsondata = XLSX.utils.sheet_to_json(sheet);
        if (count == 1) {
        }
        initial[name] = XLSX.utils.sheet_to_json(sheet, jsonOpts);
        return initial;
      }, {});

      console.log(jsonData);
      const jsonSheetName = jsonData.hasOwnProperty('Template') ? 'Template' : 'Query';
      this.convertedJSON = jsonData[jsonSheetName];

      if (!this.convertedJSON || this.convertedJSON.length === 0) {
        isInvalidInput() && this.alertService.showWarning("Runtime Execution error: The file is incorrect or the worksheet name is wrong! Please try again");
        return;
      }

      if (regularActivityCheck) {
        const obj = [{
          DocumentId: this.DocumentId,
          DocumentName: this.FileName,
          ApprovalFor: this.requestForId !== null ? (this.requestForId === 1 ? ApprovalFor.OL : ApprovalFor.CandidateJoiningConfirmation) : ApprovalFor.OL,
          ApprovalType: ApproverType.Internal
        }];

        this.convertedJSON.forEach(e1 => {
          e1['IsSelected'] = false;
          e1['CandidateId'] = 0;
          e1['ClientCode'] = this.defaultSearchInputs.Client.Code;
          e1['ContractCode'] = this.defaultSearchInputs.ClientContract.Code;
          e1['RequestFor'] = this.requestForId !== null ? (this.requestForId === 1 ? 'OL' : 'AL') : 'OL';
          e1['OnBoardingType'] = this.onboardingTypeId !== null ? (this.onboardingTypeId === 1 ? 'FLASH' : 'DETAILED') : 'FLASH';
          e1['PayGroup'] = this.payGroupObj ? this.payGroupObj.Code : '';
          e1['DocumentInfo'] = obj;
          e1['Id'] = UUID.UUID();
          e1['IsValid'] = true;
          e1['ValidationRemarks'] = '';
          e1['InvalidCells'] = [];
        });
      } else {
        this.convertedJSON.forEach(e1 => {
          e1['IsSelected'] = false;
          e1['Id'] = UUID.UUID();
          e1['TeamName'] = teamName;
          e1['Remarks'] = "";
          e1['InvalidCells'] = [];
          e1['IsFailedRequest'] = false;
        });
      };

      if (this.activeBulkMode == "Regular") {
        this.checkRequiredAndValidate();
      };

      if (this.convertedJSON.length > 100) {
        isInvalidInput() && this.alertService.showWarning('The imported file has exceeded the maximum allowed file limit (100).');
        return;
      } else {

        const baseString = "__EMPTY";
        const maxSuffix = 30;

        let suffix = 1;
        const propertiesToRemove = ['__EMPTY', '__EMPTY_1'];

        while (suffix <= maxSuffix) {
          const newString = suffix === 1 ? baseString : `${baseString}_${suffix}`;
          propertiesToRemove.push(newString);
          suffix++;
        }

        this.convertedJSON = this.convertedJSON.map(obj => {
          const newObj = { ...obj };
          for (const prop of propertiesToRemove) {
            if (newObj.hasOwnProperty(prop)) {
              delete newObj[prop];
            }
          }
          return newObj;
        });


        ev.target.value = '';
        $(`#popup_import_data${regularActivityCheck ? '' : '_naps'}`).modal('hide');
      }
    };

    reader.readAsBinaryString(file);
    ev.target.value = '';
  }

  hasCheckBoxProperty(item) {
    return item.hasOwnProperty('IsSelected') ? true : false
  }

  isJSONString(str) {
    try {
      JSON.parse(str);
      return true;
    } catch (error) {
      return false;
    }
  }


  async Validate(isimport: boolean, isSubmit: string) {

    if (this.invalidMinimumWages) {

      const minimumwagesCand = this.convertedJSON.filter(a => a.hasOwnProperty('MinimumWages') && a.MinimumWages == 'Yes');
      if (minimumwagesCand.length > 0) {

        minimumwagesCand.forEach(item => {
          item.DocumentInfo = this.isJSONString(item.DocumentInfo) ? JSON.parse(item.DocumentInfo) : item.DocumentInfo;
          if (item.DocumentInfo.filter(c => c.ApprovalFor == 3).length > 0) {
            item.MinimumWages = "No";
          }
        });
      }

    }

    if (this.invalidMinimumWages) {
      const minimumwagesCand = this.convertedJSON.filter(a => a.hasOwnProperty('MinimumWages') && a.MinimumWages == 'Yes');
      if (minimumwagesCand.length > 0) {
        this.alertService.showWarning('Please check the grid table and upload a supporting document for minimum wages.');
        return;
      }
    }
    try {
      this.resetState();
      this.loadingScreenService.startLoading();

      const requestParams = `userId=${this.UserId}&roleId=${this.RoleId}&Isimport=${isimport}&IsSubmit=${isSubmit == 'Submit' ? true : false}`;

      // const propertiesToRemove = ['__EMPTY', '__EMPTY1', '__EMPTY2', '__EMPTY3'];

      const baseString = "__EMPTY";
      const maxSuffix = 30;

      let suffix = 1;
      const propertiesToRemove = ['__EMPTY', '__EMPTY_1'];

      while (suffix <= maxSuffix) {
        const newString = suffix === 1 ? baseString : `${baseString}_${suffix}`;
        propertiesToRemove.push(newString);
        suffix++;
      }

      this.convertedJSON = this.convertedJSON.map(obj => {
        const newObj = { ...obj };
        for (const prop of propertiesToRemove) {
          if (newObj.hasOwnProperty(prop)) {
            delete newObj[prop];
          }
        }
        return newObj;
      });




      this.convertedJSON.forEach(e1 => {
        e1.DocumentInfo = this.isJSONString(e1.DocumentInfo) ? JSON.stringify(JSON.parse(e1.DocumentInfo)) : JSON.stringify((e1.DocumentInfo));
      });

      const jsonData = JSON.stringify({
        Result: this.showFailed ? this.globalJSON : this.convertedJSON
      });

      console.log('PYD #121 ::', jsonData);

      const response = await this.onboardingApi.bulkCandidateUpload(requestParams, jsonData).toPromise();

      if (!response || !response.hasOwnProperty('Result')) {
        this.handleServerError();
        return;
      }

      const apiResult: apiResult = response;

      if (apiResult.Status) {
        this.handleSuccessfulResponse(apiResult.Result, apiResult.Message);
      } else {
        this.handleErrorResponse(apiResult.Message);
      }
    } catch (error) {
      this.handleException(error);
    } finally {
      this.loadingScreenService.stopLoading();
    }
  }

  resetState() {
    this.selectedExcelItems.length = 0;
    this.showFailed_item = false;
    this.willDownload = false;
    this.showFailed = false;
  }

  handleServerError() {
    this.alertService.showWarning('The server encountered a temporary error. Please try again.');
  }

  handleSuccessfulResponse(list: any, message: string) {
    this.alertService.showSuccess(message);
    this.convertedJSON = list.map(e2 =>
      this.deleteProperty(e2, ["IsNotEdited", "Remarks", "CandidateObject", "IsDataImported"])
    );

    // this.invalidMinimumWages = this.convertedJSON.some(element =>
    //     element.IsValid && element.ValidationRemarks.includes("Minimum wages for the Component Basic is not adhered of your criteria")
    // );

    this.invalidMinimumWages = false;
    this.convertedJSON.forEach(element => {
      const searchText = "Minmum wages for the Component Basic is not adhered of your criteria";
      const normalizedText = element.ValidationRemarks.replace(/\s+/g, '').toLowerCase();
      const normalizedSearchText = searchText.replace(/\s+/g, '').toLowerCase();

      if (element.IsValid && element.ValidationRemarks.indexOf(searchText) !== -1) {
        console.log("The text contains the search text.");
        this.invalidMinimumWages = true;
        element["MinimumWages"] = 'Yes';
      } else {
        element["MinimumWages"] = 'No';
        console.log("The text does not contain the search text.");
      }
      // if (!element.IsValid && regex.test(text)) {
      //     element["MinimumWages"] = 'Yes';
      //     this.invalidMinimumWages = true;
      // } else {
      //     element["MinimumWages"] = 'No';
      // }
    });
    // this.convertedJSON.forEach(element => {
    //     element.IsValid = element.IsValid.toLowerCase() === "true"
    //         ? true
    //         : element.IsValid.toLowerCase() === "false"
    //             ? false
    //             : element.IsValid;
    // });

    console.log('this.convertedJSON;', this.convertedJSON)
    this.globalJSON = this.convertedJSON;

    this.showFailed = this.convertedJSON.some(a => !a.IsValid);
  };

  handleErrorResponse(message: string) {
    this.alertService.showWarning(`An error occurred during the execution of Bulk import. See the tips for further information. ${message}`);
  }

  handleException(error: any) {
    console.error('An error occurred:', error);
  }

  deleteProperty(object, property) {
    var clonedObject = JSON.parse(JSON.stringify(object));
    property.forEach(e => {
      delete clonedObject[e];

    });
    return clonedObject;
  }

  showonlyFailedItems() {
    this.showFailed = true;
    this.convertedJSON = [];
    this.convertedJSON = this.globalJSON;
    if (this.showFailed_item === true) {
      this.willDownload = true;
      this.convertedJSON = this.convertedJSON.filter(a => a.IsValid == false);

    } else {
      this.willDownload = false;
      this.convertedJSON = this.globalJSON;
    }

    console.log('ddf vvvvg', this.globalJSON);


  }

  cancelRequest() {
    this.willDownload = false;
    this.showFailed = false;
    this.myInputVariable.nativeElement.value = '';
    this.convertedJSON = [];
    this.globalJSON = [];
    this.selectedExcelItems = [];
    $(document).ready(function () {
      $('#dropDown').click(function () {
        $('.drop-down').toggleClass('drop-down--active');
      });
    });

    // if (this.activeBulkMode == 'NAPS') {
    //     this.progressRequest.completedRequest = [];
    //     this.progressRequest.totalRequest = [];
    //     this.progressRequest.failedRequest = [];
    //     this.teamId = 0;
    // }

    // this.doRefresh();
  }


  setDownload() {

    this.willDownload = true;
    let failedList = [];
    const profile = this.convertedJSON;
    function deleteProperty(object, property) {
      var clonedObject = JSON.parse(JSON.stringify(object));
      property.forEach(e => {
        delete clonedObject[e];

      });
      return clonedObject;
    }
    profile.forEach(element => {
      failedList.push(deleteProperty(element, ["IsValid", "ValidationRemarks"]));
    });


    this.excelService.exportAsExcelFile(failedList, 'FailedTeamplate');

  }



  download_template(activityName) {

    if (activityName == 'NAPS') {
      let link = document.createElement('a');
      link.setAttribute('type', 'hidden');
      link.href = 'assets/file/NAPSBulkImportTemplate.xlsx';
      // link.download = 'assets/file/BulkImportTemplate.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      return;
    }
    // let link = document.createElement('a');
    // link.setAttribute('type', 'hidden');
    // link.href = 'assets/file/BulkImportTemplate.xlsx';
    // // link.download = 'assets/file/BulkImportTemplate.xlsx';
    // document.body.appendChild(link);
    // link.click();
    // link.remove();
    this.hasFailedInput = false;
    this.failedInputErrorMessage = "";
    if (activityName == "Regular" && (this.payGroupId == null || this.payGroupId == 0)) {
      this.hasFailedInput = true;
      this.failedInputErrorMessage = "You must choose the pay structure and request for to download a sample Excel file.";
      return;
    }
    if (activityName == "NAPS" && (this.teamId == null || this.teamId == 0)) {
      this.hasFailedInput = true;
      this.failedInputErrorMessage = "You must choose the team to download a sample Excel file.";
      return;
    }

    this.smallspinner = true;
    this.loadingScreenService.startLoading();
    var extraParameters = {
      ClientId: this.defaultSearchInputs.ClientId,
      ClientContractId: this.defaultSearchInputs.ClientContractId,
      paygroupId: this.payGroupId
    };

    let searchInputs = { "ClientId": this.defaultSearchInputs.ClientId, "ClientContractId": this.defaultSearchInputs.ClientContractId, "paygroupId": this.payGroupObj.Id }
    this.importLayoutService.getExcelTemplate(this.importLayout, null, null, searchInputs).pipe(takeUntil(this.stopper)).subscribe(
      data => {
        this.smallspinner = false;
        this.loadingSreenService.stopLoading();
        console.log(data);
        if (data.Status) {
          let byteCharacters = atob(data.dynamicObject);
          const file = this.importLayoutService.convertByteToFile(byteCharacters);
          FileSaver.saveAs(file, "Onboarding" + '_' + moment(new Date()).format('DD-MM-YYYY'));
          // this.modal_dismiss();
        }
        else {
          this.alertService.showWarning(data.Message);
        }
      },
      error => {
        this.loadingSreenService.stopLoading();
        this.spinner = false;
        console.log(error);
      }
    )
  }
  viewProcessLogsSearchPage() {
    this.router.navigate(['app/onboarding/onboardProcessLogs']);
  }

  /* #region  On Select rows using checkbox */

  onSelectedPendingRowsChanged(eventData, args) {

    this.selectedPendingItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inBucketDataView.getItem(row);
        this.selectedPendingItems.push(row_data);
      }
    }
    console.log('Answer : ', this.selectedPendingItems);
    this.doDisableReleaseOfferBtn = (this.selectedPendingItems.length > 1 ||
      this.selectedPendingItems.length == 0) ? true :
      this.selectedPendingItems.length > 0 && this.selectedPendingItems[0].ProcessstatusId != 4300
        ? true : false;

    this.selectedPendingItems != null && this.selectedPendingItems.length > 0 ? this.DownloadBtnShown() : this.IsDownloadBtnShown = false;
  }
  onSelectedSavedRowsChanged(eventData, args) {

    this.selectedSavedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inBucketDataView.getItem(row);
        this.selectedSavedItems.push(row_data);
      }
    }
    console.log('Answer : ', this.selectedSavedItems);
    this.selectedSavedItems != null && this.selectedSavedItems.length > 0 ? this.DownloadBtnShown() : this.IsDownloadBtnShown = false;
  }
  onSelectedRejectedRowsChanged(eventData, args) {

    this.selectedRejectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inBucketDataView.getItem(row);
        this.selectedRejectedItems.push(row_data);
      }
    }
    console.log('Answer : ', this.selectedRejectedItems);
    this.selectedRejectedItems != null && this.selectedRejectedItems.length > 0 ? this.DownloadBtnShown() : this.IsDownloadBtnShown = false;
  }
  /* #endregion */

  DownloadBtnShown() {
    let _ClientId = this.activeChildTabName == 'myBucket_pending' ? this.selectedPendingItems[0].ClientId :
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].ClientId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].ClientId : 0;
    this.IsDownloadBtnShown = environment.environment.RequiredClientIdsForDownlaodCandidateInformationBtn.ClientIds.includes(_ClientId) == true
      &&
      environment.environment.RequiredClientIdsForDownlaodCandidateInformationBtn.Roles.includes(this.RoleCode) == true
      ? true : false;
  }

  DownloadCandidateEntireInformation() {

    if ((this.activeChildTabName == 'myBucket_pending' && this.selectedPendingItems.length > 1) ||
      (this.activeChildTabName == 'myBucket_rejected' && this.selectedRejectedItems.length > 1) ||
      (this.activeChildTabName == 'myBucket_saved' && this.selectedSavedItems.length > 1) ||
      (this.activeChildTabName == 'myBucket_pending' && this.selectedPendingItems.length == 0) ||
      (this.activeChildTabName == 'myBucket_rejected' && this.selectedRejectedItems.length == 0) ||
      (this.activeChildTabName == 'myBucket_saved' && this.selectedSavedItems.length == 0)) {

      this.alertService.showWarning("Please select only one item at a time.");
      return;
    }

    let _CandidateId = this.activeChildTabName == 'myBucket_pending' ? this.selectedPendingItems[0].CandidateId :
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].CandidateId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].CandidateId : 0;

    let _ClientId = this.activeChildTabName == 'myBucket_pending' ? this.selectedPendingItems[0].ClientId :
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].ClientId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].ClientId : 0;

    let _ClientContractId = this.activeChildTabName == 'myBucket_pending' ? this.selectedPendingItems[0].ClientContractId :
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].ClientContractId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].ClientContractId : 0;

    let _CandidateName = this.activeChildTabName == 'myBucket_pending' ? `${this.selectedPendingItems[0].CandidateName}_ ${this.selectedPendingItems[0].PrimaryMobile}` :
      this.activeChildTabName == 'myBucket_saved' ? `${this.selectedSavedItems[0].CandidateName}_ ${this.selectedSavedItems[0].PrimaryMobile}` :
        this.activeChildTabName == 'myBucket_rejected' ? `${this.selectedRejectedItems[0].CandidateName}_ ${this.selectedRejectedItems[0].PrimaryMobile}` : '';

    this.loadingSreenService.startLoading();
    this.onboardingApi.DownloadCandidateEntireInformation(_ClientId, _ClientContractId, _CandidateId).pipe(takeUntil(this.stopper)).subscribe(data => {
      this.loadingSreenService.stopLoading();
      if (data.Status !== false && data.Result !== null && data.Result !== undefined) {
        this.downloadService.base64ToZip(data.Result.Content, _CandidateName);
        this.loadingSreenService.stopLoading();
      }
      else {
        this.alertService.showWarning(data.Message);
      }

    }, err => {
      this.alertService.showWarning("Unknown Error Occured");
      this.loadingSreenService.stopLoading();
      console.error(err);
    })

  }


  onFileUpload(e, whichAction) {

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
        let FileUrl = (reader.result as string).split(",")[1];
        e.target.value = '';
        this.doAsyncUpload(FileUrl, this.FileName, whichAction)

      };
    }
  }

  doAsyncUpload(filebytes, filename, whichAction) {
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
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).pipe(takeUntil(this.stopper)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            if (whichAction === "BankUpload") {
              this.isBankDocUploading = false;
              this.convertedJSON.forEach((item: any) => {
                if (item.BankDoc == filename) {
                  item["BankDocumentId"] = apiResult.Result
                }
              });
            } else {
              this.DocumentId = apiResult.Result as any;
              this.FileName = filename;
              this.unsavedDocumentLst.push({
                Id: apiResult.Result
              });
              let obj = {
                DocumentId: this.DocumentId,
                DocumentName: this.FileName,
                ApprovalFor: this.approvalForId == 4 ? ApprovalFor.CandidateJoiningConfirmation : this.approvalForId == 1 ? ApprovalFor.OL : this.approvalForId == 3 ? ApprovalFor.MinimumWagesNonAdherence : whichAction == 'Individual' ? ApprovalFor.OL : ApprovalFor.MinimumWagesNonAdherence,
                ApprovalType: ApproverType.Internal
              };
              if (this.convertedJSON.length > 0) {
                this.selectedExcelItems = this.selectedExcelItems.map((item: any) => {
                  item.DocumentInfo = this.isJSONString(item.DocumentInfo) ? JSON.parse(item.DocumentInfo) : item.DocumentInfo;
                  if (this.approvalForId == 1 && item.DocumentInfo.length > 0 && item.DocumentInfo.find(z => z.ApprovalFor == ApprovalFor.OL) != undefined) {
                    return {
                      ...item,
                      DocumentInfo: item.DocumentInfo.map(doc => {
                        if (doc.ApprovalFor === ApprovalFor.OL) {
                          // Update the existing object
                          return { ...doc, ...obj };
                        }
                        return doc; // Keep other objects unchanged
                      })
                    };
                  }
                  else if (this.approvalForId == 4 && item.DocumentInfo.length > 0 && item.DocumentInfo.find(z => z.ApprovalFor == ApprovalFor.CandidateJoiningConfirmation) != undefined) {
                    return {
                      ...item,
                      DocumentInfo: item.DocumentInfo.map(doc => {
                        if (doc.ApprovalFor === ApprovalFor.CandidateJoiningConfirmation) {
                          // Update the existing object
                          return { ...doc, ...obj };
                        }
                        return doc; // Keep other objects unchanged
                      })
                    };

                  }
                  else if (this.approvalForId == 3 && item.DocumentInfo.length > 0 && item.DocumentInfo.find(z => z.ApprovalFor == ApprovalFor.MinimumWagesNonAdherence) != undefined) {
                    return {
                      ...item,
                      DocumentInfo: item.DocumentInfo.map(doc => {
                        if (doc.ApprovalFor === ApprovalFor.MinimumWagesNonAdherence) {
                          // Update the existing object
                          return { ...doc, ...obj };
                        }
                        return doc; // Keep other objects unchanged
                      })
                    };
                  }
                  else {
                    return {
                      ...item,
                      DocumentInfo: [...item.DocumentInfo, obj]
                    };
                  }
                });
              };
              this.convertedJSON = this.convertedJSON.map(obj => this.selectedExcelItems.find(o => o.Aadhaar === obj.Aadhaar) || obj);
              console.log('JSON Data ::', this.convertedJSON);

              this.isLoading = true;
              this.alertService.showSuccess("You have successfully uploaded this file")

              if (whichAction == 'Approvals') {
                this.approvalForId = null;
                this.modal_dismiss1('ClientApprovals');
              }
            }
          }
          else {
            this.FileName = null;
            this.DocumentId = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.FileName = null;
          this.DocumentId = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.DocumentId = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }
  /* #endregion */
  /* #region  File delete object stroage (S3) */

  doDeleteFile() {

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
      console.log(result);

      if (result.value) {

        // if (this.isGuid(this.popupId)) {

        //   this.deleteAsync();
        // }
        // else if (this.firstTimeDocumentId != this.approvalForm.get('ObjectStorageId').value) {


        this.deleteAsync();

        // }

        // else {


        //   this.FileName = null;
        //   this.approvalForm.controls['IsDocumentDelete'].setValue(true);
        //   this.approvalForm.controls['DocumentName'].setValue(null);

        // }
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })

  }

  deleteAsync() {


    this.isLoading = false;
    this.spinnerText = "Deleting";


    this.fileuploadService.deleteObjectStorage((this.DocumentId)).pipe(takeUntil(this.stopper)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.DocumentId = null;
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while trying to delete! " + error)
      }

    }), ((err) => {

    })

  }


  /* #endregion */


  onChangeFile(e, whichAction) {


    if (whichAction == 'Approvals' && (this.approvalForId == null || this.approvalForId == undefined)) {
      e.target.value = '';
      this.alertService.showWarning('Please select the option for client approval.');
      return;
    }

    if (e.target.files && e.target.files[0]) {
      this.isLoading = false;
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
        let FileUrl = (reader.result as string).split(",")[1];
        // e.target.value = '';
        this.doAsyncUpload(FileUrl, this.FileName, whichAction)
      };
    }
  }

  onChangeRow(item, event, index) {
    console.log('item,', item);
    console.log('event,', event);
    console.log('index,', index);

    if (event.target.checked) {
      this.selectedExcelItems.push((item));
    } else {
      const index = this.selectedExcelItems.indexOf((item));
      if (index > -1) {
        this.selectedExcelItems.splice(index, 1);
      }
    }

    console.log('ss', this.selectedExcelItems)
    // if (this.selectedExcelItems.length > 0) {
    //     const isExist = this.selectedExcelItems.find(a => a.CandidateName == item.CandidateName && a.DOB == item.DOB);
    //     if (isExist) {
    //         return;
    //     }
    // } else {

    // }

  }

  selectAllRows(event: boolean) {
    if (event) {
      this.convertedJSON.forEach((item: any) => {
        this.selectedExcelItems.push((item));
        item["IsSelected"] = true
      });
    } else {
      this.selectedExcelItems = [];
      this.convertedJSON = this.convertedJSON.map((item: any) => {
        return {
          ...item,
          IsSelected: false
        }
      });
    }
  }

  openBankDocUploadDialog() {
    this.alertService.confirmSwal("Confirmation", "The File Name for the bank documents should be the aadhar number respectively(eg:- 346576546787.png, 372839827872.pdf)", "Proceed").then((result) => {
      if (result) {
        this.fileUploader.openFileDialog();
      };
    })
  }

  onBankUpload(files: { base64: string, filename: string }[]) {
    let docNotFound: any = [];
    if (files.length == this.selectedExcelItems.length) {
      this.convertedJSON = this.convertedJSON.map((item: any) => {
        console.log('ite', item);
        if (this.selectedExcelItems.filter(selectedExcelItem => selectedExcelItem.Aadhaar == item.Aadhaar).length) {
          let bankDoc = files.find((bankDoc: any) => item.Aadhaar == bankDoc.filename.split('.')[0]);
          if (bankDoc != undefined) {
            return {
              ...item,
              BankDoc: bankDoc.filename
            }
          } else {
            docNotFound.push(item)
            return {
              ...item,
              BankDoc: "The bank proof document was not found. Please reupload and try to save.",
            }
          }
        } else {
          return item;
        };
      });
      this.selectedExcelItems = [];
      this.isBankDocUploading = true;
      files.forEach((file: { base64: string, filename: string }) => this.doAsyncUpload(file.base64, file.filename, "BankUpload"));
      this.alertService.showSuccess('File uploaded successfully !');
    };
  }

  showAlertErr = (event: string) => this.alertService.showWarning(event);

  validateResourceName(inputString, propPattern) {
    console.log(inputString.length);

    var pattern = /^[a-z]+\\[a-z]+\\[a-z]+$/;
    if (!propPattern.test(inputString)) {
      // alert("not a match");
      return false;
    } else {
      // alert("match");
      return true;
    }
  }

  removeCandidate() {
    this.alertService.confirmSwalWithClose("Confirmation", "Are you sure you want to remove the chosen candidate(s)?", "No, Cancel", "Yes, Remove").then((result) => {

    }).catch(error => {
      this.selectedExcelItems.forEach((e2) => {
        this.convertedJSON = this.convertedJSON.filter((a) => a.Id != e2.Id);
      });
      this.selectedExcelItems = [];
    });
  };

  checkRequiredAndValidate() {
    let requiredFields: Array<string> = [];
    let IdsArray: Array<{ clientLocationId?: number, genderId?: number, cityId?: number, stateId?: number, costCodeId?: number, bankObj?: any, mandatoryFieldsMissing?: Array<number> }> = [];
    if (this.activeBulkMode == 'NAPS') {
      requiredFields = ["NAPSContractCode", "CostCode", "ApprenticeCode", "ApprenticeName", "DOB", "Gender", "Mobile", "EmailId", "City", "State", "NAPSStartDate", "NAPSEndDate", "Stipend", "Aadhaar", "Bank", "IFSCCode", "AccountNumber", "LetterURL", "AadhaarURL", "WorkLocation"];

    } else {
      requiredFields = ["DOB", "Mobile", "EmailId", "Aadhaar", "FatherName"];
    }

    this.convertedJSON.map((row: any, index: number) => {
      let Ids: { clientLocationId?: number, genderId?: number, cityId?: number, stateId?: number, costCodeId?: number, bankObj?: any, mandatoryFieldsMissing?: Array<number> } = {};
      if (this.activeBulkMode == 'NAPS') {
        row.InvalidCells = [];
        Ids = {
          clientLocationId: null,
          genderId: null,
          cityId: null,
          stateId: null,
          costCodeId: null,
          bankObj: {},
          mandatoryFieldsMissing: []
        };
      };     // column to store all the invalid cells names

      Object.keys(row).filter(value => {
        if (requiredFields.includes(value)) {
          if (row[value] != null && row[value] != undefined && row[value] != "") {
            switch (value) {
              case 'WorkLocation': {
                let clientLocationObj = this.LstClientLocation.find(a => isStringsIdentical(a.LocationName, row[value]));
                Ids.clientLocationId = isObjectEmpty(clientLocationObj) ? row.InvalidCells.push(value.toString()) : clientLocationObj.Id;
                break;
              };
              case 'CostCode': {
                console.log('row[value]', row[value])
                let costCodeObj = this.LstCostCode.find(a => a.Code == row[value]);
                Ids.costCodeId = isObjectEmpty(costCodeObj) ? row.InvalidCells.push(value.toString()) : costCodeObj.Id;
                break;
              };
              case 'Gender': {
                let genderObj = this.gender.find(a => isStringsIdentical(a.name, row[value]));
                Ids.genderId = isObjectEmpty(genderObj) ? row.InvalidCells.push(value.toString()) : genderObj.id;
                break;
              };
              case 'City': {
                let cityObj = this.regionList.CityList.find(a => isStringsIdentical(a.Name, row[value]));
                Ids.cityId = isObjectEmpty(cityObj) ? row.InvalidCells.push(value.toString()) : cityObj.Id;
                break;
              };
              case 'State': {
                let stateObj = this.regionList.StateList.find(a => isStringsIdentical(a.Name, row[value]));
                Ids.stateId = isObjectEmpty(stateObj) ? row.InvalidCells.push(value.toString()) : stateObj.Id;
                break;
              };
              case 'IFSCCode': {
                let bankObj = this.BankBranchList.find(a => isStringsIdentical(a.FinancialSystemCode, row[value]));
                Ids.bankObj = isObjectEmpty(bankObj) ? row.InvalidCells.push(value.toString()) : bankObj;
                break;
              };
              case 'Mobile': {
                !dataValidator(DataValidatorKey.Mobile, row[value], { dataType: "string", minLength: 0, maxLength: 10 }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'MobileNumber': {
                !dataValidator(DataValidatorKey.MobileNumber, row[value], { dataType: "string", minLength: 0, maxLength: 10 }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'EmailId': {
                !dataValidator(DataValidatorKey.Email, row[value], { dataType: "string" }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'Stipend': {
                !dataValidator(DataValidatorKey.Stipend, row[value], { dataType: "number" }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'OnCostInsurance': {
                !dataValidator(DataValidatorKey.OnCostInsurance, row[value], { dataType: "number" }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'FixedDeduction': {
                !dataValidator(DataValidatorKey.FixedDeduction, row[value], { dataType: "number" }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'AccountNumber': {
                !dataValidator(DataValidatorKey.AccountNumber, row[value]) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'DOB': {
                !dataValidator(DataValidatorKey.DOB, row[value], { dateFormat: "DD/MM/YYYY" }) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'Aadhaar': {
                !dataValidator(DataValidatorKey.Aadhaar, row[value]) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'PAN': {
                !dataValidator(DataValidatorKey.PAN, row[value]) && row.InvalidCells.push(value.toString());
                break;
              };
              case 'FatherName': {
                !dataValidator(DataValidatorKey.FatherName, row[value]) && row.InvalidCells.push(value.toString());
                break;
              };
              default: break;
            }
          } else {
            if (this.activeBulkMode == 'NAPS') {
              row.InvalidCells.push(value.toString()); //inserting invalid cells
              Ids.mandatoryFieldsMissing.length ? null : Ids.mandatoryFieldsMissing.push(index + 1);
            } else {
              row.InvalidCells.push(value.toString());
            };
          };
        };
      });
      if (this.activeBulkMode == 'NAPS') {
        IdsArray.push(Ids);
        if (row.InvalidCells.length > 0) {
          row.Remarks = `The following field is mandatory or incorrect data in the cell. Make the necessary adjustments and try again : ${(row.InvalidCells).join(",")}`;
        };
      } else if (this.activeBulkMode == 'Regular' && row.InvalidCells.length > 0) {
        row.ValidationRemarks = `The following field is mandatory or incorrect data in the cell. Make the necessary adjustments and try again : ${(row.InvalidCells).join(",")}`;
      };
    });
    if (this.activeBulkMode == 'NAPS') return IdsArray;
  };



  async doSubmitNaps() {
    let bankDocIds = [];
    if (this.convertedJSON.filter(item => !(item.hasOwnProperty("BankDocumentId") && (item.BankDocumentId != null || item.BankDocumentId != undefined))).length) {
      this.alertService.showWarning("Bank Documents Not Found. Please Upload.");
      return;
    }
    if (this.convertedJSON.length == 0) {
      this.alertService.showWarning("There is no record found on the sheet. Please try again"); this.myInputVariable.nativeElement.value = ''; return;
    }
    this.IsCompleted = false



    let IdsList = this.checkRequiredAndValidate();
    console.log('this.convertedJSON', this.convertedJSON);

    if (IdsList.some(item => !!item.mandatoryFieldsMissing.length)) {
      this.alertService.showWarning(`There are mandatory field values missing in the following row(s) : ${(IdsList.map(item => item.mandatoryFieldsMissing)).join(",")}`);
      return;
    }
    if (this.convertedJSON.filter(z => z.InvalidCells.length > 0).length > 0) {
      this.alertService.showWarning(`There is an error in the candidate record(s). Please review the remarks and try again.`);
      return;
    }

    if (this.convertedJSON.filter(z => z.IsFailedRequest).length > 0) {
      this.alertService.showWarning(`There is an error in the candidate record(s). Please review the remarks and try again.`);
      return;
    }

    this.apiSpinner = true;
    this.progressRequest.totalRequest = this.convertedJSON;


    try {


      for (let index = 0; index < this.convertedJSON.length; index++) {
        const e1 = this.convertedJSON[index];
        bankDocIds.push(this.convertedJSON[index].BankDocumentId)


        var candidateDetails = new CandidateDetails();
        var candidateOfferDetails = new CandidateOfferDetails();
        var candidateCommunicationDetails = new CandidateCommunicationDetails();
        var candidateContactDetails = new ContactDetails();
        var candidateStatutoryDetails = new CandidateStatutoryDetails();
        var candidateRateset = new CandidateRateset();


        let aadhaarDocumentId = await this.uploadDocument(e1.AadhaarURL, `${this.generateFileName(e1.ApprenticeName)}_aadhaarDoc.png`);
        let letterDocumentId = await this.uploadDocument(e1.LetterURL, `${this.generateFileName(e1.ApprenticeName)}_contractLetterDoc.png`);


        candidateDetails.FirstName = e1.ApprenticeName;
        candidateDetails.LastName = "";
        candidateDetails.Gender = IdsList[index].genderId;
        candidateDetails.DateOfBirth = moment(e1.DOB, 'DD/MM/YYYY').format('YYYY-MM-DD');
        candidateDetails.Status = CandidateStatus.Active;
        candidateDetails.Modetype = UIMode.Edit;
        candidateDetails.RelationshipId = Relationship.Father;
        candidateDetails.RelationshipName = "";

        candidateContactDetails.PrimaryEmail = e1.EmailId;
        candidateContactDetails.PrimaryMobile = e1.Mobile;
        candidateContactDetails.PrimaryMobileCountryCode = '91';
        candidateContactDetails.CommunicationCategoryTypeId = CommunicationCategoryType.Personal;

        const lstAddressDetails = [];
        lstAddressDetails.push({
          Address1: e1.Address1,
          Address2: e1.Address2,
          Address3: "",
          CountryName: "100",
          StateName: "0",
          City: "",
          PinCode: "",
          CommunicationCategoryTypeId: CommunicationCategoryType.Present
        });
        lstAddressDetails.push({
          Address1: e1.Address1,
          Address2: e1.Address2,
          Address3: "",
          CountryName: "100",
          StateName: "0",
          City: "",
          PinCode: "",
          CommunicationCategoryTypeId: CommunicationCategoryType.Permanent
        });

        candidateCommunicationDetails.LstContactDetails = [];
        candidateCommunicationDetails.LstContactDetails.push(candidateContactDetails);
        candidateCommunicationDetails.LstAddressdetails = lstAddressDetails;
        candidateCommunicationDetails.Id = 0;
        candidateCommunicationDetails.Modetype = UIMode.Edit;

        candidateRateset.AnnualSalary = e1.Stipend * 12;
        candidateRateset.IsMonthlyValue = true;
        candidateRateset.LstRateSet = []
        candidateRateset.MonthlySalary = e1.Stipend;
        candidateRateset.PayGroupdId = this.LstTeam.find(a => a.Id == this.teamId).PayGroupId;

        candidateRateset.EffectiveDate = this.formatDate(e1.NAPSStartDate);
        candidateRateset.Status = 1;
        candidateRateset.Salary = e1.Stipend;
        candidateRateset.SalaryBreakUpType = environment.environment.DefaultSBT;
        candidateRateset.Id = 0;
        candidateRateset.Modetype = UIMode.Edit;

        candidateOfferDetails = new CandidateOfferDetails();
        candidateOfferDetails.FatherName = "";
        candidateOfferDetails.IsSelfRequest = true;
        candidateOfferDetails.RequestedBy = this.UserId;
        candidateOfferDetails.RequestType = RequestType.AL
        candidateOfferDetails.OnBoardingType = OnBoardingType.Proxy;
        candidateOfferDetails.ClientId = this.defaultSearchInputs.ClientId;
        candidateOfferDetails.ClientContractId = this.defaultSearchInputs.ClientContractId;;
        candidateOfferDetails.SourceType = SourceType.Transfer;
        candidateOfferDetails.ClientContactId = 0;
        candidateOfferDetails.IndustryId = 0;
        candidateOfferDetails.Aadhaar = e1.Aadhaar;
        candidateOfferDetails.Location = IdsList[index].clientLocationId;
        candidateOfferDetails.CostCodeId = IdsList[index].costCodeId;
        candidateOfferDetails.TeamId = this.teamId
        candidateOfferDetails.EffectivePayPeriodId = this.LstTeam.find(a => a.Id == this.teamId).OpenPayPeriodId;
        candidateOfferDetails.InsurancePlan = 0;
        candidateOfferDetails.OnCostInsurance = e1.OnCostInsurance;
        candidateOfferDetails.FixedInsuranceDeduction = e1.FixedDeduction;
        candidateOfferDetails.NapsContractCode = e1.NAPSContractCode;
        candidateOfferDetails.ActualDateOfJoining = moment(e1.NAPSStartDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        candidateOfferDetails.TenureType = TenureType.Custom;
        candidateOfferDetails.EndDate = moment(e1.NAPSEndDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        candidateOfferDetails.Status = 1;
        candidateOfferDetails.SkillCategory = 0
        candidateOfferDetails.Designation = "";
        candidateOfferDetails.Zone = 0
        candidateOfferDetails.State = IdsList[index].stateId;
        candidateOfferDetails.CityId = IdsList[index].cityId;
        candidateOfferDetails.Modetype = UIMode.Edit;;
        candidateOfferDetails.IsNapsBased = true;
        candidateOfferDetails.ApprenticeCode = e1.ApprenticeCode;
        candidateOfferDetails.IsMinimumWageCheckNotRequired = true;
        candidateOfferDetails.CalculationRemarks = "";
        candidateOfferDetails.DateOfJoining = moment(e1.NAPSStartDate, 'DD/MM/YYYY').format('YYYY-MM-DD');
        candidateOfferDetails.Gender = IdsList[index].genderId;

        candidateOfferDetails.LstCandidateRateSet = [];
        candidateOfferDetails.LstCandidateRateSet.push(candidateRateset);
        candidateOfferDetails.Id = 0;

        candidateDetails.CandidateCommunicationDtls = new CandidateCommunicationDetails();
        candidateDetails.CandidateCommunicationDtls = candidateCommunicationDetails;

        // OTHER DATA
        candidateStatutoryDetails.PAN = null;
        var lstStatutoryDetails = [];
        if (e1.PAN != null && e1.PAN != "") {
          candidateStatutoryDetails.PAN = e1.PAN;
        }
        if (candidateStatutoryDetails.PAN != "") {
          lstStatutoryDetails.push(candidateStatutoryDetails);
        }
        candidateDetails.CandidateOtherData = new CandidateOtherData();
        candidateDetails.CandidateOtherData.Id = 0;
        candidateDetails.CandidateOtherData.Modetype = UIMode.Edit;
        candidateDetails.CandidateOtherData.LstCandidateStatutoryDtls = lstStatutoryDetails

        //AADHAAR 
        var lstDocumentDetails = [];
        let candidateDocs: CandidateDocuments = new CandidateDocuments();
        // candidateDocs.Id = 0;
        // candidateDocs.CandidateId =  0;
        // candidateDocs.IsSelfDocument = true; 
        // candidateDocs.DocumentId = aadhaarDocumentId;
        // candidateDocs.DocumentCategoryId = 6;
        // candidateDocs.DocumentTypeId = 4;
        // candidateDocs.DocumentNumber = e1.Aadhaar;
        // candidateDocs.FileName = `${e1.ApprenticeName.replace(/\s/g, "")}_aadhaarDoc${new Date().getTime().toString()}.png` ;
        // candidateDocs.ValidFrom = null;
        // candidateDocs.ValidTill = null;
        // candidateDocs.Status = ApprovalStatus.Pending;
        // candidateDocs.IsOtherDocument = false;
        // candidateDocs.Modetype = UIMode.Edit;
        // candidateDocs.DocumentCategoryName = "IsAddress";
        // candidateDocs.StorageDetails = null;
        // lstDocumentDetails.push(candidateDocs);


        candidateDocs.Id = 0;
        candidateDocs.CandidateId = 0;
        candidateDocs.IsSelfDocument = true;
        candidateDocs.DocumentId = aadhaarDocumentId;
        candidateDocs.DocumentCategoryId = 6;
        candidateDocs.DocumentTypeId = 3;
        candidateDocs.DocumentNumber = e1.Aadhaar;
        candidateDocs.FileName = `${e1.ApprenticeName.replace(/\s/g, "")}_aadhaarDoc${new Date().getTime().toString()}.png`;
        candidateDocs.ValidFrom = null;
        candidateDocs.ValidTill = null;
        candidateDocs.Status = ApprovalStatus.Pending;
        candidateDocs.IsOtherDocument = false;
        candidateDocs.Modetype = UIMode.Edit;
        candidateDocs.DocumentCategoryName = "IsIdentity";
        candidateDocs.StorageDetails = null;
        candidateDocs.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
        lstDocumentDetails.push(candidateDocs);

        candidateDetails.LstCandidateDocuments = lstDocumentDetails;

        //BANK DOC 
        var lstDocumentDetails = [];
        let candidateBankDocs: CandidateDocuments = new CandidateDocuments();


        candidateBankDocs.Id = 0;
        candidateBankDocs.CandidateId = 0;
        candidateBankDocs.IsSelfDocument = false;
        candidateBankDocs.DocumentId = e1.BankDocumentId;
        candidateBankDocs.DocumentCategoryId = environment.environment.BankDocumentCategoryId;
        candidateBankDocs.DocumentTypeId = environment.environment.BankDocumentTypeId;
        candidateBankDocs.DocumentNumber = e1.AccountNumber;
        candidateBankDocs.FileName = e1.BankDoc;
        candidateBankDocs.ValidFrom = null;
        candidateBankDocs.ValidTill = null;
        candidateBankDocs.Status = ApprovalStatus.Pending;
        candidateBankDocs.IsOtherDocument = true;
        candidateBankDocs.Modetype = UIMode.Edit;
        // candidateBankDocs.DocumentCategoryName = "IsIdentity";
        candidateBankDocs.StorageDetails = null;
        candidateBankDocs.DocumentVerificationMode = DocumentVerificationMode.QcVerification;
        lstDocumentDetails.push(candidateDocs);

        candidateDetails.LstCandidateDocuments = lstDocumentDetails;

        // BANK
        let bankObj = this.BankBranchList.find(a => a.FinancialSystemCode.toUpperCase() == e1.IFSCCode.toUpperCase());
        if (bankObj) {
          var candidateBankDetails = new CandidateBankDetails();
          candidateBankDetails.BankId = bankObj.BankId;
          candidateBankDetails.BankBranchId = bankObj.Id;
          candidateBankDetails.AccountNumber = e1.AccountNumber;
          candidateBankDetails.AccountHolderName = e1.ApprenticeName;
          candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
          candidateBankDetails.IdentifierValue = e1.IFSCCode;
          candidateBankDetails.SalaryContributionPercentage = 100;
          candidateBankDetails.IsDefault = true;
          candidateBankDetails.Status = CandidateStatus.Active;
          candidateBankDetails.Modetype = UIMode.Edit;
          candidateBankDetails.Id = 0;
          candidateBankDetails.CandidateDocument = candidateBankDocs;// element.CandidateDocument
          candidateBankDetails.VerificationMode = VerificationMode.QcVerification;
          candidateBankDetails.VerificationAttempts = 0;
          candidateBankDetails.PayoutLogId = 0;
          candidateBankDetails.Remarks = "";
          candidateBankDetails.Attribute1 = e1.ApprenticeName;
          candidateDetails.LstCandidateBankDetails = [];
          candidateDetails.LstCandidateBankDetails.push(candidateBankDetails)
        }

        // CLIENT APPROVALS
        var Lstapproval = new Approvals();
        Lstapproval.Id = 0;
        Lstapproval.EntityType = EntityType.CandidateDetails;
        Lstapproval.EntityId = 0;
        Lstapproval.ApprovalFor = ApprovalFor.ContractLetter;
        Lstapproval.ApprovalType = ApproverType.Internal;
        Lstapproval.Remarks = "";
        Lstapproval.DocumentName = `${e1.ApprenticeName.replace(/\s/g, "")}_contractLetterDoc${new Date().getTime().toString()}.png`;
        Lstapproval.ObjectStorageId = letterDocumentId;
        Lstapproval.Status = ApprovalStatus.Pending;
        Lstapproval.Modetype = UIMode.Edit;
        candidateDetails.ExternalApprovals = [];
        candidateDetails.ExternalApprovals.push(Lstapproval);

        var LstRS = [
          {
            "Id": 0,
            "EmployeeRatesetId": 0,
            "EmployeeId": 0,
            "ProductId": environment.environment.StipendProductId,
            "ProductCode": "Stipend",
            "DisplayName": "Stipend",
            "Value": e1.Stipend,
            "IsOveridable": true,
            "DisplayOrder": 1,
            "IsDisplayRequired": true,
            "ProductTypeCode": "Earning",
            "ProductTypeId": 1,
            "RuleId": 0,
            "ProductCTCPayrollRuleMappingId": 0,
            "Modetype": 1,
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
            "ProductId": 0,
            "ProductCode": "GrossEarn",
            "DisplayName": "Gross Earning",
            "Value": e1.Stipend,
            "IsOveridable": false,
            "DisplayOrder": 2,
            "IsDisplayRequired": true,
            "ProductTypeCode": "Total",
            "ProductTypeId": 6,
            "RuleId": 0,
            "ProductCTCPayrollRuleMappingId": 0,
            "Modetype": 1,
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
            "ProductId": 0,
            "ProductCode": "Insurance",
            "DisplayName": "Insurance",
            "Value": e1.OnCostInsurance,
            "IsOveridable": true,
            "DisplayOrder": 3,
            "IsDisplayRequired": true,
            "ProductTypeCode": "OnCost",
            "ProductTypeId": 4,
            "RuleId": 0,
            "ProductCTCPayrollRuleMappingId": 0,
            "Modetype": 1,
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
            "ProductId": 0,
            "ProductCode": "CTC",
            "DisplayName": "CTC",
            "Value": e1.OnCostInsurance != "" && e1.OnCostInsurance != 0 ? (Number(e1.OnCostInsurance) + Number(e1.Stipend)) : e1.Stipend,
            "IsOveridable": false,
            "DisplayOrder": 4,
            "IsDisplayRequired": true,
            "ProductTypeCode": "Total",
            "ProductTypeId": 6,
            "RuleId": 0,
            "ProductCTCPayrollRuleMappingId": 0,
            "Modetype": 1,
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
            "ProductId": 0,
            "ProductCode": "GrossDedn",
            "DisplayName": "Gross Deduction",
            "Value": 0,
            "IsOveridable": false,
            "DisplayOrder": 5,
            "IsDisplayRequired": true,
            "ProductTypeCode": "Total",
            "ProductTypeId": 6,
            "RuleId": 0,
            "ProductCTCPayrollRuleMappingId": 0,
            "Modetype": 1,
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
            "ProductId": 0,
            "ProductCode": "NetPay",
            "DisplayName": "Net Pay",
            "Value": e1.Stipend,
            "IsOveridable": false,
            "DisplayOrder": 6,
            "IsDisplayRequired": true,
            "ProductTypeCode": "Total",
            "ProductTypeId": 6,
            "RuleId": 0,
            "ProductCTCPayrollRuleMappingId": 0,
            "Modetype": 1,
            "ClientId": 0,
            "CandidateId": 0,
            "PaymentType": 0,
            "PayableRate": 0,
            "BillableRate": 0,
            "BillingType": 0
          }
        ];

        if (candidateOfferDetails != null) {
          // await this.PreviewSalaryBreakup(candidateOfferDetails).then(result => {
          //     console.log('BRK', result);
          //     if (!result) {
          //         e1['ValidationRemarks'] = 'Failed to make a salary brakup';
          //         return;
          //     }
          //     else {
          candidateOfferDetails.LstCandidateRateSet = [];
          candidateRateset.LstRateSet = LstRS //this.cRt.LstRateSet;
          candidateOfferDetails.LstCandidateRateSet.push(candidateRateset);
          candidateDetails.LstCandidateOfferDetails = [];
          candidateDetails.LstCandidateOfferDetails.push(candidateOfferDetails);

          candidateDetails.Modetype = UIMode.None;
          candidateDetails.Id = 0;

          this.candidateModel = _CandidateModel;
          this.candidateModel.NewCandidateDetails = null;
          this.candidateModel.OldCandidateDetails = null;
          this.candidateModel.OldCandidateDetails = candidateDetails;
          this.candidateModel.NewCandidateDetails = candidateDetails;
          this.candidateModel.Id = 0;
          let candidate_req_json = this.candidateModel;
          console.log('#0011 PLD ::', this.candidateModel);
          e1.IsFailedRequest = false;

          // this.progressRequest.completedRequest.push(candidateDetails);

          // if (this.progressRequest.totalRequest.length == this.progressRequest.completedRequest.length) {
          //     this.apiSpinner = false;
          //     this.IsCompleted = true;
          // }
          // return;
          this.onboardingApi.putCandidate(JSON.stringify(candidate_req_json)).pipe(takeUntil(this.stopper)).subscribe((data: apiResponse) => {
            console.log('apiResponse ::', data);

            this.progressRequest.completedRequest.push(candidateDetails);

            if (data.hasOwnProperty('dynamicObject')) {
              let apiResponse: apiResponse = data;
              if (apiResponse.Status) {
                e1.Remarks = "Apprentice details saved successfully."


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

                // this.finalSubmit(workFlowInitiation, "submit");

                this.onboardingApi.postWorkFlow(JSON.stringify(workFlowInitiation)).pipe(takeUntil(this.stopper)).subscribe((response) => {
                  try {
                    let apiResult: apiResult = response;
                    if (apiResult.Status && apiResult.Result != null) {
                      // this.alertService.showSuccess(`Your candidate has been ${fromWhich == "submit" ? "submitted" : "rejected"} successfully! ` + apiResult.Message != null ? apiResult.Message : '');
                      // this.loadingScreenService.stopLoading();
                      // this.activeModal.close('Workflow initiated successfully');
                    } else {
                      // this.loadingScreenService.stopLoading();
                      // this.alertService.showWarning(`An error occurred while trying to ${fromWhich == "submit" ? "submission" : "reject"}!  ` + apiResult.Message != null ? apiResult.Message : '');
                    }

                  } catch (error) {
                    //   this.loadingScreenService.stopLoading();
                    //   this.alertService.showWarning(`An error occurred while trying to ${fromWhich == "submit" ? "submission" : "reject"}!` + error);

                  }


                }), ((error) => {

                });

              }
              else {
                e1.Remarks = apiResponse.Message;
                e1.IsFailedRequest = true;
                this.progressRequest.failedRequest.push(candidateDetails);

                if (this.unsavedDocumentIds.length === 0) {
                  this.unsavedDocumentIds.push(letterDocumentId, aadhaarDocumentId, bankDocIds);
                } else {
                  this.unsavedDocumentIds.push(...[letterDocumentId, aadhaarDocumentId, bankDocIds]);
                }
                console.log('this.unsavedDocumentIds', this.unsavedDocumentIds);
              }

            } else {
              e1.Remarks = 'Apprentice detail is not getting submitted. Since it has some invalid data in the Excel sheet.'
              e1.IsFailedRequest = true;
              this.progressRequest.failedRequest.push(candidateDetails);

              if (this.unsavedDocumentIds.length === 0) {
                this.unsavedDocumentIds.push(letterDocumentId, aadhaarDocumentId, bankDocIds);
              } else {
                this.unsavedDocumentIds.push(...[letterDocumentId, aadhaarDocumentId, bankDocIds]);
              }

            }

            if (this.progressRequest.totalRequest.length == this.progressRequest.completedRequest.length) {
              this.apiSpinner = false;
              this.IsCompleted = true;
              this.unsavedDocumentIds.length > 0 ? this.deleteunsavedDocumentIds() : true;
            }

            console.log('failedNAPSRequest', this.progressRequest.failedRequest);


          },
            (err) => {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(`Something is wrong!  ${err}`);
              console.log("Something is wrong! :  ", err);

            });



          // }

          // });
        }

      }

    } catch (error) {
      console.log('SAVE or SUBMIT EX ::', error);

    }



  }

  async uploadDocument(url, fileName) {
    if (url && url !== "") {
      const documentId = await this.uploadDocs(url, fileName);
      return documentId as number;
    }
    return 0;
  }

  generateFileName(name) {
    return `${name.replace(/\s/g, "")}_${new Date().getTime().toString()}`;
  }

  formatDate(date) {
    return moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD');
  }

  deleteunsavedDocumentIds() {
    this.unsavedDocumentIds.forEach(documentId => {
      this.fileuploadService.deleteObjectStorage((documentId)).subscribe((res) => {
        if (res.Status) {
          var index = this.unsavedDocumentIds.map(function (el) {
            return el.Id
          }).indexOf(documentId);
          this.unsavedDocumentIds.splice(index, 1);
        }
      }), ((err) => {

      });
    });
  }

  download_failed_request() {

    let failedList = [];
    const profile = this.convertedJSON.filter(a => a.IsFailedRequest == true);
    function deleteProperty(object, property) {
      var clonedObject = JSON.parse(JSON.stringify(object));
      property.forEach(e => {
        delete clonedObject[e];

      });
      return clonedObject;
    }
    profile.forEach(element => {
      failedList.push(deleteProperty(element, ["Id", "TeamName", "InvalidCells", "IsFailedRequest", "Remarks", "IsSelected"]));
    });

    this.excelService.exportAsExcelFile(failedList, 'FailedNAPSTeamplate');

  }

  async getBase64FromUrl(url) {
    const data = await fetch(url);
    const blob = await data.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        // console.log('blob', blob);
        let FileUrl = (reader.result as string).split(",")[1];
        // const base64data = reader.result;
        resolve(FileUrl);
      }
    });
  }

  getColorCodeValueEvent() {

    if (this.progressRequest.completedRequest.length == this.progressRequest.totalRequest.length) {
      return { 'width': 100 + '%' };
    }
    if (this.progressRequest.totalRequest.length > 0) {
      var DA_percentage = ((this.progressRequest.completedRequest.length) / (this.progressRequest.totalRequest.length) * 100 % 100);
      return { 'width': DA_percentage + '%' };
    } else {
      return { 'width': 5 + '%' };
    }

  }

  toDataURL(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function () {
      var reader = new FileReader();
      reader.onloadend = function () {
        console.log(reader.result)
        callback(reader.result);
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
  }

  // this.toDataURL(
  //     'https://avatars0.githubusercontent.com/u/5053266?s=460&v=4',
  //     function (dataUrl) {
  //       console.log(dataUrl);
  //       console.log((dataUrl as string).split(",")[1]);

  //     }
  //   );


  uploadDocs(url, fileName) {
    const promise = new Promise((resolve) => {
      // this.toDataURL(url,
      //     function (dataUrl) {

      this.getBase64FromUrl(url).then(base64 => {
        try {

          const filebytes = base64.toString();
          const objStorage = new ObjectStorageDetails();
          objStorage.Id = 0;
          objStorage.CandidateId = 0;
          objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
          objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
          objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
          objStorage.ClientContractId = this.defaultSearchInputs.ClientContractId;
          objStorage.ClientId = this.defaultSearchInputs.ClientId;
          objStorage.CompanyId = this.CompanyId;
          objStorage.Status = true;
          objStorage.Content = filebytes as any;
          objStorage.SizeInKB = 12;
          objStorage.ObjectName = fileName;
          objStorage.OriginalObjectName = fileName;
          objStorage.Type = 0;
          objStorage.ObjectCategoryName = "Proofs";

          console.log('OBJ STO ::', objStorage);

          this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).pipe(takeUntil(this.stopper)).subscribe((res) => {

            let apiResult: apiResult = (res);
            try {
              if (apiResult.Status && apiResult.Result != "") {
                resolve(apiResult.Result);
              }
              else {
                resolve(0);
              }
            } catch (error) {

            }
          }), ((err) => {

          })

        } catch (error) {

        }
      });

    });
    return promise;
  }


  PreviewSalaryBreakup(candidateOfferDetails) {

    const promise = new Promise((resolve) => {
      // console.log('BREAKUP DETAILS :: ', candidateOfferDetails);
      this.onboardingApi.postCalculateSalaryBreakUp((JSON.stringify(candidateOfferDetails))).pipe(takeUntil(this.stopper)).subscribe((res) => {
        let apiResult: apiResult = res;
        if (apiResult.Status) {
          var offerDetails: CandidateOfferDetails = apiResult.Result as any;
          this.cRt.LstRateSet = [];
          this.cRt.LstRateSet = offerDetails.LstCandidateRateSet[0].LstRateSet;
          resolve(true);
        } else {
          resolve(false);
        }

      }), ((err) => {

      })
    });
    return promise;
  }

  getApprovalForItems() {

    return (this.requestForId > 0 && this.requestForId == 1) ? this.LstApprovalFor.filter(a => a.id != 4) :
      (this.requestForId > 0 && this.requestForId == 2) ? this.LstApprovalFor.filter(a => a.id != 1) : this.LstApprovalFor;
  }




  ngOnDestroy() {
    this.stopper.next();
    this.stopper.complete();
  }

  openSurveyQuestions() {

    const modalRef = this.modalService.open(SurveyComponent, this.modalOption);
    modalRef.componentInstance.entityData = { EntityId: 100324, EntityType: EntityType.CandidateDetails };
    modalRef.result.then((result) => {
      console.log('result', result);
      if (result != 'Modal Closed') {
        // this.SurveyResponded = true;
      }

    }).catch((error) => {
      console.log(error);
    });
  }

  releaseOffer() {

    if (this.selectedPendingItems.length == 0) {
      this.alertService.showWarning('Please choose at least one candidate.');
      return;
    }
    this.loadingScreenService.startLoading();
    let UAC: any;
    var userAccessControl = []
    userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls as any;
    OnBoardingType

    let req_param_uri = `Id=${this.selectedPendingItems[0].CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingApi.getCandidate(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      console.log('apiResponse', apiResponse);


      if (this.RoleCode == 'CorporateHR' && this.selectedPendingItems[0].ProcessstatusId == 4300 &&
        this.selectedPendingItems[0].OnBoardingType == 1) {
        UAC = userAccessControl.filter(a => a.ControlName == "btn_centerhr_release")
      }
      if (this.RoleCode == 'CorporateHR' && this.selectedPendingItems[0].ProcessstatusId == 4300 &&
        this.selectedPendingItems[0].OnBoardingType == 2) {
        UAC = userAccessControl.filter(a => a.ControlName == "btn_centerhr_submits")
      }

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
      workFlowInitiation.UserInterfaceControlLst = this.RoleCode == 'CorporateHR' && UAC != undefined && UAC != null && this.selectedPendingItems[0].ProcessstatusId == 4300 ? UAC : this.accessControl_submit;
      console.log('WFI ::', workFlowInitiation)
      this.finalSubmit(workFlowInitiation, "submit");
     
    });


  }

  finalSubmit(workFlowJsonObj: WorkFlowInitiation, fromWhich: any): void {
    console.log('FNS :',workFlowJsonObj);
    
    this.onboardingApi.postWorkFlow(JSON.stringify(workFlowJsonObj)).pipe(takeUntil(this.stopper)).subscribe((response) => {

      this.loadingScreenService.stopLoading();
      this.doDisableReleaseOfferBtn = true;
      this.selectedPendingItems = [];

      try {
        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
        } else {

        }
        this.doRefresh();
      } catch (error) {

      }

    }), ((error) => {

    });

  }

}