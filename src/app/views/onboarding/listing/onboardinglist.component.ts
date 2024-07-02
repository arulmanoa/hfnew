import { Component, OnInit, HostListener, Inject, Input, ViewEncapsulation, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';
import { DOCUMENT } from '@angular/common';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { CandidateListingScreenType } from '../../../_services/model/OnBoarding/CandidateListingScreenType';
import {
  AngularGridInstance,
  Column,
  Editors,
  EditorArgs,
  EditorValidator,
  FieldType,
  Filters,
  Formatters,
  Formatter,
  GridOption,
  OnEventArgs,
  OperatorType,
  Sorters,
  Statistic,
  GridService,
  GridOdataService,
} from 'angular-slickgrid';
import { UUID } from 'angular2-uuid';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

// services 
import { environment } from 'src/environments/environment';

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { SearchService } from '../../../_services/service/search.service';


import * as _ from 'lodash';
import { Country } from '../../../_services/model/country';
import Swal from "sweetalert2";
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl } from '../../../_services/model/Common/LoginResponses';

import { Subscription } from 'rxjs';
import { OnboardingGrid } from '../../../_services/model/OnboardingGrid.model';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
import { TransactionsModalComponent } from 'src/app/shared/modals/transactions-modal/transactions-modal.component';
import { DownloadService, PagelayoutService } from 'src/app/_services/service';
import { CookieService } from 'ngx-cookie-service';
import { PageLayout, SearchConfiguration, SearchElement } from '../../personalised-display/models';
import { takeUntil } from 'rxjs/operators';
import { ClientContract } from '@services/model/Client/ClientContract';


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
  selector: 'app-onboardinglist',
  templateUrl: './onboardinglist.component.html',
  styleUrls: ['./onboardinglist.component.scss'],

})
export class OnboardingListComponent implements OnInit {

  _loginSessionDetails: LoginResponses;
  modalOption: NgbModalOptions = {};


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
  //makeanofferFormatter: Formatter;
  viewFormatter: Formatter;
  //#endregion

  //#region InBucket related variables

  inBucketGridInstance: AngularGridInstance;
  inBucketGrid: any;
  inBucketGridService: GridService;
  inBucketDataView: any;

  inRejectedBucketGridInstance: AngularGridInstance;
  inRejectedBucketGrid: any;
  inRejectedBucketGridService: GridService;
  inRejectedBucketDataView: any;

  inBucketColumnDefinitions: Column[];
  inBucketGridOptions: GridOption;
  inBucketDataset: any;

  // for Rejected tab
  inRejectedBucketColumnDefinitions: Column[];
  inRejectedBucketGridOptions: GridOption;
  inRejectedBucketDataset: any;

  //  inBucketList: OnboardingGrid[]; //

  inBucketList: OnBoardingGrid[] = [];
  inRejectedBucketList: OnBoardingGrid[] = [];

  currentInBucketRecord: any;
  selectedInBucketRecords: any[];
  selectedSavedItems: any[];
  selectedRejectedItems: any[];
  //#endregion

  //#region Search Grid related variables

  searchGridInstance: AngularGridInstance;
  searchGrid: any;
  searchGridService: GridService;
  searchDataView: any;

  searchColumnDefinitions: Column[];
  searchGridOptions: GridOption;
  searchDataset: any;

  searchList: OnboardingGrid[];

  currentSearchRecord: any;
  selectedSearchRecords: any[];

  //#endregion

  // ** Session logged details

  UserId: any;
  RoleId: any;
  tblminDate: Date;
  // ** 

  //#region Consturctor
  selectedmigrationRecords: any[];
  spinner: boolean = false;
  BusinessType: any;
  IsExtraTabRequired: boolean = true;
  RoleCode: any;
  AlternativeText: any = 'In My Bucket';
  AlternativeText1: any = "Unclaimed";
  IsDownloadBtnShown: boolean = false;
  activeChildTabName: string;

  isAllenDigital: boolean = false;
  @ViewChild('showAllTabset') template: TemplateRef<any>;
  code: string = "pendingOnboardingRequest";
  pageLayout: PageLayout = null;
  isBtnDisabledRequired: boolean = false;
  clientId: number = 0;
  clientContractId: number = 0;
  private stopper: EventEmitter<any> = new EventEmitter();

  
  searchConfiguration: SearchConfiguration;
  searchElementList: SearchElement[];
  clientSME: any;
  clientcontractSME: any;
  clientIdSME: number;
  clientcontractIdSME: number;

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

  spinner2 : boolean = false;

  constructor(
    private onboardingApi: OnboardingService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private alertService: AlertService,
    private countryService: CountryService,
    private titleService: Title,
    public UIBuilderService: UIBuilderService,
    @Inject(DOCUMENT) document,
    public sessionService: SessionStorage,
    private headerService: HeaderService,
    private loadingScreenService: LoadingScreenService,
    public modalService: NgbModal,
    public searchService: SearchService,
    private loadingSreenService: LoadingScreenService,
    private downloadService: DownloadService,
    private cookieService :CookieService,
    private pageLayoutService: PagelayoutService,


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

  //#region OnInit

  ngOnInit() {


    this.headerService.setTitle('Onboarding');
    this.headerService.getTransactionRemars("");
    this.headerService.getOnboardingStatus(null);

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.selectedSavedItems = [];
    this.selectedRejectedItems = [];
    this.IsDownloadBtnShown = false;
    this.activeChildTabName = "myBucket_saved";


    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    
    // ONLY FOR ALLEN DIGITALS
    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    this.isAllenDigital = (cookieValue.toUpperCase() == 'ALLEN' && (businessType === 1 || businessType === 2)) ? true : false;

    var LstCompanySettings = [];
    LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));
    if (LstCompanySettings != null && LstCompanySettings.length > 0) {

      LstCompanySettings = LstCompanySettings.filter(a => a.RoleCode == this.RoleCode);
      if (LstCompanySettings.length > 0) {
        var isExist = LstCompanySettings.find(z => z.ModuleName == 'OnboardigRecruiterList');
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
            this.loadInBucketRecords();;
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
        this.loadInBucketRecords();
      }
      else if (this.activeChildTabName == "myBucket_rejected") {
        this.loadInRejectedBucketRecords();
      }
      else if (this.activeChildTabName == "myBucket_separated") {

      }

    }
   

  }
  // first time and ra-load table data's from API calls

  doRefresh() {
    //  this.loadingScreenService.startLoading();

    this.spinner2 = true;

    this.inRejectedBucketList.length = 0;
    this.inRejectedBucketList = [];

    this.inBucketList.length = 0;
    this.inBucketList = [];

    this.customCopyFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>` : '<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>';
    this.customTimelineFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>` : '<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>';
    this.docsFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="fa fa-files-o"  style="cursor:pointer !important"></i>` : '<i class="mdi mdi-eye" style="cursor:pointer !important"></i>';
    // this.voidFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //   value ? `<i class="mdi mdi-account-remove"  style="cursor:pointer !important"></i>` : '<i class="mdi mdi-account-remove" style="cursor:pointer !important"></i>';
    //this.claimFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //  value ? `<i class="mdi mdi-thumb-up-outline"  style="cursor:pointer !important"></i>` : '<i class="mdi mdi-thumb-up-outline" style="cursor:pointer !important"></i>';
    //this.makeanofferFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    //value ? `<i class="mdi mdi-redo-variant" title="Make an Offer"  style="cursor:pointer !important"></i>` : '<i class="mdi mdi-redo-variant" title="Make an Offer" style="cursor:pointer !important"></i>';
    this.viewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="fa fa-eye" title="Details"  style="cursor:pointer !important"></i>` : '<i class="fa fa-eye" title="Details" style="cursor:pointer !important"></i>';


    this.inBucketColumnDefinitions = [];
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
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: false,
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
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: false,
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
      enableRowSelection: true,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: false,
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

    if (this.activeChildTabName == 'myBucket_separated') {

    }
    else if (this.activeChildTabName == 'myBucket_pending') {

      this.clientId > 0 ? this.loadInBucketRecords() : true;
    }
    else if (this.activeChildTabName == 'myBucket_saved') {

      this.clientId > 0 ? this.loadInBucketRecords() : true;
    }
    else if (this.activeChildTabName == 'myBucket_rejected') {
      this.clientId > 0 ? this.loadInRejectedBucketRecords() : true;
    }
   
    this.setSearchGridColumns();

  }


  //#endregion

  //#region Private Methods

  setSearchGridColumns() {
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
        type: FieldType.string,

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
      //         this.claim_void_record(args.dataContext, "Claim");


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
      //         this.claim_void_record(args.dataContext, "Void");


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
      //         this.make_an_offer(args.dataContext);


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
    this.BusinessType == 3 ? (this.searchColumnDefinitions = staffingObject.concat(this.searchColumnDefinitions as any)) : true;

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


    let ScreenType = CandidateListingScreenType.Saved;
    let searchParam = "test";
    this.spinner2 = true;
    if(this.isAllenDigital){

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
    }

    let apiCallEndPoint =  this.isAllenDigital ?  this.onboardingApi.GetAllenOnboardingCandidates(`filterObject=${filterObject}`) : this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam);
    apiCallEndPoint.subscribe((data) => {
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

      this.inBucketColumnDefinitions = [
        {
          id: 'Candidate', name: 'Candidate Name', field: 'CandidateName',
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


            this.router.navigate(['app/onboarding/onboardingRequest'], {
              queryParams: {
                "Idx": btoa(args.dataContext.Id),
                "Cdx": btoa(args.dataContext.CandidateId),
              }
            });
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
      this.BusinessType == 3 ? (this.inBucketColumnDefinitions = staffingObject.concat(this.inBucketColumnDefinitions as any)) : true;
      this.inBucketList = [];
      let apiResult: apiResult = data;
      if (apiResult.Result != "")
        this.inBucketList = JSON.parse(apiResult.Result);
      if (this.BusinessType != 3 && this.inBucketList.length > 0) {
        this.inBucketList = this.inBucketList.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
      }
      // this.inBucketList.forEach(element => {

      //     element.Id =  Math.floor((Math.random() * 10) + 1);

      // });
      // console.log(this.inBucketList);
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
  loadInRejectedBucketRecords() {

    this.spinner2 = true;
    let ScreenType = CandidateListingScreenType.Rejected;
    let searchParam = "test";

    if(this.isAllenDigital){

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
    }

    let apiCallEndPoint =  this.isAllenDigital ?  this.onboardingApi.GetAllenOnboardingCandidates(`filterObject=${filterObject}`) : this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam);

    apiCallEndPoint.subscribe((data) => {


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
      this.inRejectedBucketColumnDefinitions = [
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

            this.headerService.doCheckRedoOffer(false);
            this.headerService.checkNewTransfer(false);

            this.headerService.getOnboardingStatus("");
            this.headerService.getOnboardingStatus(`${args.dataContext.CandidateName.toUpperCase()} | ${args.dataContext.RequestedFor} | ${args.dataContext.Status} - ${args.dataContext.ClientName}`);

            this.router.navigate(['app/onboarding/onboardingRequest'], {
              queryParams: {
                "Idx": btoa(args.dataContext.Id),
                "Cdx": btoa(args.dataContext.CandidateId),
              }
            });
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

      this.BusinessType == 3 ? (this.inRejectedBucketColumnDefinitions = staffingObject.concat(this.inRejectedBucketColumnDefinitions as any)) : true;
      let apiResult: apiResult = data;
      this.spinner2 = false;
      if (apiResult.Result != "") {
        this.inRejectedBucketList = JSON.parse(apiResult.Result);
        if (this.BusinessType != 3 && this.inRejectedBucketList.length > 0) {
          this.inRejectedBucketList = this.inRejectedBucketList.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
        }
        // this.inRejectedBucketDataset = this.inRejectedBucketList;
       
      }
    }), ((err) => {

      this.spinner2 = false;
    });

  }

  //#endregion


  addCandidates() {

    this.headerService.checkNewTransfer("");
    this.headerService.checkNewTransfer(false);

    sessionStorage.removeItem('isNewTransfer')
    this.headerService.doCheckRedoOffer(false);
    sessionStorage.removeItem('previousPath');
    sessionStorage.setItem('previousPath', '/app/onboarding/onboardingList');
    this.router.navigate(['/app/onboarding/onboardingRequest']);


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
    this.spinner2 = true;
    var searchObj = JSON.stringify({
      CandidateName: this.candName,
      FromDate: this.fromDate,
      Todate: this.toDate,

    })

    console.log(searchObj);

    this.onboardingApi.getOnboardingListingInfo(CandidateListingScreenType.All, this.RoleId, (searchObj)).subscribe((data) => {

      let apiResult: apiResult = data;
      if (apiResult.Result != "") {
        this.searchList = JSON.parse(apiResult.Result);
        this.searchDataset = this.searchList;
        console.log(this.searchDataset);
        this.spinner2 = false;

        // this.loadingScreenService.stopLoading();
        return;
      }
      else {
        this.spinner2 = false;
        this.searchList = [];
        this.searchDataset = this.searchList;
      }

    }), ((err) => {
      // this.loadingScreenService.stopLoading();
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

  claim_void_record(item, whichAction) {



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
          this.searchService.updateClaimOnBoardRequest(request_params).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.searchData();

            }
          })
        }
        else if (whichAction == "Void") {
          this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Status) {

              this.loadingScreenService.stopLoading();
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
    this.searchService.getValidToMakeOffer(request_params).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status) {

        if (apiResult.Message == "") {

          this.headerService.checkNewTransfer("");
          this.headerService.checkNewTransfer(false);

          this.headerService.doCheckRedoOffer(false);
          this.headerService.doCheckRedoOffer(true);

          this.loadingScreenService.stopLoading();
          this.router.navigate(['app/onboarding/onboarding_revise'], {
            queryParams: {
              "Idx": btoa(item[0].Id),
              "Cdx": btoa(item[0].CandidateId),
            }
          });
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

        this.searchService.updateClaimOnBoardRequest(request_params).subscribe((result) => {
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
  revise_offer(item) {
    let request_params = `candidateId=${item[0].CandidateId}`;
    this.searchService.getValidToMakeOffer(request_params).subscribe((result) => {
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

          this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
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

          this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
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
  // revise_offer(item) {
  //     this.make_an_offer(item);
  //     this.alertService.confirmSwal("Are you sure you want to revise the offer?", `This action will cancel the existing offer and allow you to make a submit a new request.`, "Yes, Continue").then(result => {
  //         const swalWithBootstrapButtons = Swal.mixin({
  //             customClass: {
  //                 confirmButton: 'btn btn-primary',
  //                 cancelButton: 'btn btn-danger'
  //             },
  //             buttonsStyling: true
  //         })

  //     //     swalWithBootstrapButtons.fire({
  //     //         animation: false,
  //     //         showCancelButton: false, // There won't be any cancel button
  //     //         input: 'textarea',
  //     //         inputPlaceholder: 'Type your message here...',
  //     //         allowEscapeKey: false,
  //     //         inputAttributes: {
  //     //             autocorrect: 'off',
  //     //             autocapitalize: 'on',
  //     //             maxlength: '120',
  //     //             'aria-label': 'Type your message here',
  //     //         },
  //     //         allowOutsideClick: false,
  //     //         inputValidator: (value) => {
  //     //             if (value.length >= 120) {
  //     //                 return 'Maximum 120 characters allowed.'
  //     //             }
  //     //             if (!value) {
  //     //                 return 'You need to write something!'
  //     //             }
  //     //         },

  //     //     }).then((inputValue) => {

  //     //         let jsonObj = inputValue;
  //     //         let jsonStr = jsonObj.value;
  //             let jsonStr=null;
  //             this.loadingScreenService.startLoading();
  //             let request_params = `moduletransactionId=${item[0].Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

  //             this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
  //                 let apiResult: apiResult = result;
  //                 if (apiResult.Status) {
  //                     this.loadingScreenService.stopLoading()

  //                   //  this.make_an_offer(item);
  //                     console.log('makeofferitem',item);

  //                 }
  //             })
  //        // })
  //     })

  //         .catch(error => this.loadingScreenService.stopLoading());


  // }


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

        this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
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



  childTabLoadData(event) {
    if (event.nextId == 'myBucket_saved') {
      this.selectedSavedItems = [];
      this.inBucketList.length == 0 ? this.loadInBucketRecords() : true;
    }
    else if (event.nextId == 'myBucket_rejected') {
      this.selectedRejectedItems = [];
      this.inRejectedBucketList.length == 0 ? this.loadInRejectedBucketRecords() : true;
    }
    this.activeChildTabName = event.nextId;
  }


  /* #region  On Select rows using checkbox */


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
    let _ClientId =
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].ClientId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].ClientId : 0;
    this.IsDownloadBtnShown = environment.environment.RequiredClientIdsForDownlaodCandidateInformationBtn.ClientIds.includes(_ClientId) == true
      // &&
      // environment.environment.RequiredClientIdsForDownlaodCandidateInformationBtn.Roles.includes(this.RoleCode) == true
      ? true : false;
  }

  DownloadCandidateEntireInformation() {

    if (
      (this.activeChildTabName == 'myBucket_rejected' && this.selectedRejectedItems.length > 1) ||
      (this.activeChildTabName == 'myBucket_saved' && this.selectedSavedItems.length > 1) ||

      (this.activeChildTabName == 'myBucket_rejected' && this.selectedRejectedItems.length == 0) ||
      (this.activeChildTabName == 'myBucket_saved' && this.selectedSavedItems.length == 0)) {

      this.alertService.showWarning("Please select only one item at a time.");
      return;
    }

    let _CandidateId =
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].CandidateId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].CandidateId : 0;

    let _ClientId =
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].ClientId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].ClientId : 0;

    let _ClientContractId =
      this.activeChildTabName == 'myBucket_saved' ? this.selectedSavedItems[0].ClientContractId :
        this.activeChildTabName == 'myBucket_rejected' ? this.selectedRejectedItems[0].ClientContractId : 0;


    let _CandidateName =
      this.activeChildTabName == 'myBucket_saved' ? `${this.selectedSavedItems[0].CandidateName}_ ${this.selectedSavedItems[0].PrimaryMobile}` :
        this.activeChildTabName == 'myBucket_rejected' ? `${this.selectedRejectedItems[0].CandidateName}_ ${this.selectedRejectedItems[0].PrimaryMobile}` : '';

    this.loadingSreenService.startLoading();
    this.onboardingApi.DownloadCandidateEntireInformation(_ClientId, _ClientContractId, _CandidateId).subscribe(data => {
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

}