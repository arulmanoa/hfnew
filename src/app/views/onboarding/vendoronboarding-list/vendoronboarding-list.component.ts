import { Component, OnInit, HostListener, Inject, Input, ViewEncapsulation, ElementRef, ViewChild } from '@angular/core';
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
import * as XLSX from 'xlsx';

// services 

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
import { ExcelService } from 'src/app/_services/service/excel.service';
import { WorkflowService } from '../../../_services/service/workflow.service';
import { ImportLayoutService } from 'src/app/_services/service';
import { ImportLayout } from '../../generic-import/import-models';
import moment from 'moment';
import FileSaver from 'file-saver';
import { apiResponse } from 'src/app/_services/model/apiResponse';

@Component({
  selector: 'app-vendoronboarding-list',
  templateUrl: './vendoronboarding-list.component.html',
  styleUrls: ['./vendoronboarding-list.component.css']
})
export class VendoronboardingListComponent implements OnInit {
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

  UserId: any;
  RoleId: any;

  tblminDate: Date;
  // ** 

  //#region Consturctor
  selectedmigrationRecords: any[];
  activeTabName: string;

  spinner: boolean = false;
  modalOption: NgbModalOptions = {};


  convertedJSON: any;
  showFailed: boolean = false;
  showFailed_item: any;
  globalJSON: any;
  willDownload = false;
  BusinessType: any;
  IsExtraTabRequired : boolean = true;
  RoleCode: any;
  AlternativeText : any = 'In My Bucket';
  AlternativeText1 : any = "Unclaimed";

  readonly ImportLayoutCode : string = 'Onboarding';
  importLayout : ImportLayout;

  @ViewChild('inputFile') myInputVariable: ElementRef;
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
      public excelService: ExcelService,
      private workFlowApi: WorkflowService,
      private importLayoutService : ImportLayoutService,
      private loadingSreenService : LoadingScreenService
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

      this.headerService.setTitle('Onboarding');
      this.headerService.getTransactionRemars("");
      this.headerService.getOnboardingStatus(null);

      this.modalOption.backdrop = 'static';
      this.modalOption.keyboard = false;

      this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
      this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
      this.UserId = this._loginSessionDetails.UserSession.UserId;
      this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
      console.log('get sesssion of list ',   ((JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"))))); 
   
      this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
      var LstCompanySettings = [];
      LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));  
      if(LstCompanySettings != null && LstCompanySettings.length > 0)      {
      LstCompanySettings = LstCompanySettings.filter(a=>a.RoleCode == this.RoleCode);
      if(LstCompanySettings.length > 0){
          var isExist = LstCompanySettings.find(z=>z.ModuleName == 'OnboardigOpsList');
          if(isExist != undefined){
             this.IsExtraTabRequired = isExist.IsExtraTabRequired;
             this.AlternativeText = isExist.AlternativeText;
             this.AlternativeText1 = isExist.AlternativeText1;

          }
      }
  }
      (this.AlternativeText == null ||  this.AlternativeText == '') ? "In My Bucket" : true;
      (this.AlternativeText1 == null ||  this.AlternativeText1 == '') ? "Unclaimed" : true;
      console.log('userId', this.UserId);
      this.tblminDate = new Date();
      this.doRefresh();
  }

  // first time and ra-load table data's from API calls

  doRefresh() {
      //  this.loadingScreenService.startLoading();
      this.spinner = true;

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
          enableRowSelection: false,
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
              id: 'Candidate', name: 'Vendor', field: 'CandidateName',
              sortable: true,
              type: FieldType.string,
              filterable: true, 

          },
       
        
          {
              id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
              formatter: Formatters.dateIso,
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



      this.loadInBucketRecords();
      this.loadInSavedBucketRecords();
      this.loadInRejectedBucketRecords();
      this.setSearchGridColumns();
      this.loadUnClaimedRecords(true);

  }


  //#endregion

  //#region Private Methods 

  onChangeFromdate(event) {

  }

  setSearchGridColumns() {

      this.searchColumnDefinitions = [
          {
              id: 'Candidate', name: 'Vendor', field: 'CandidateName',
              sortable: true,
              type: FieldType.string,
              filterable: true, 

          },
        
         
          {
              id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
              formatter: Formatters.dateIso,
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


              this.workFlowApi.UpdatePendingAtUserId(JSON.stringify(param)).subscribe((data) => {
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


      let ScreenType = CandidateListingScreenType.Pending;
      let searchParam = "Pending";
      this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam).subscribe((data) => {
          this.inBucketColumnDefinitions = [
              {
                  id: 'Candidate', name: 'Vendor', field: 'CandidateName',
                  sortable: true,
                  type: FieldType.string,
                  filterable: true, 

              },
            
              {
                  id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
                  formatter: Formatters.dateIso,
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


                      this.headerService.getTransactionRemars("");
                      this.headerService.getTransactionRemars(args.dataContext.TransactionRemarks);


                      this.headerService.getOnboardingStatus("");
                      this.headerService.getOnboardingStatus(`${args.dataContext.CandidateName.toUpperCase()} | ${args.dataContext.RequestedFor} | ${args.dataContext.Status} - ${args.dataContext.ClientName}`);


                      this.router.navigate(['app/onboarding/vendorOnboarding'], {
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
              if(this.BusinessType != 3  &&  this.inBucketList.length > 0){
                  this.inBucketList = this.inBucketList.filter(a=>a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")))
              }

              this.inBucketList.length > 0?   this.inBucketList = this.inBucketList.filter(a=>a.EmploymentType == -100) : true; 
          // this.inBucketList.forEach(element => {

          //     element.Id =  Math.floor((Math.random() * 10) + 1);

          // });
          // console.log(this.inBucketList);
          // this.inBucketDataset = this.inBucketList;
          this.spinner = false;
          // this.loadingScreenService.stopLoading();
      }), ((err) => {
          this.spinner = false;
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


      let ScreenType = CandidateListingScreenType.Saved;
      let searchParam = "Saved";
      this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam).subscribe((data) => {
          this.inSavedBucketColumnDefinitions = [
            
            {
                  id: 'Candidate', name: 'Vendor', field: 'CandidateName',
                  sortable: true,
                  type: FieldType.string,
                  filterable: true, 

              },
                          
              {
                  id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
                  formatter: Formatters.dateIso,
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


                      this.router.navigate(['app/onboarding/vendorOnboarding'], {
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
         
          // this.BusinessType == 3 ? this.inSavedBucketColumnDefinitions = this.inSavedBucketColumnDefinitions.filter((item) => item.id !== 'Client' && item.id != 'Contract') : true;

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
              if(this.BusinessType != 3 &&  this.inSavedBucketList.length > 0){
                  this.inSavedBucketList = this.inSavedBucketList.filter(a=>a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")))
              }
              this.inSavedBucketList.length > 0?   this.inSavedBucketList = this.inSavedBucketList.filter(a=>a.EmploymentType == -100) : true; 
              // this.inSavedBucketDataset = this.inSavedBucketList;
              console.log('SV', JSON.parse(apiResult.Result));
              
              this.spinner = false;
          }
      }), ((err) => {

          this.spinner = false;
      });

  }

  loadInRejectedBucketRecords() {


      let ScreenType = CandidateListingScreenType.Rejected;
      let searchParam = "Rejected";
      this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam).subscribe((data) => {
          this.inRejectedBucketColumnDefinitions = [
              {
                  id: 'Candidate', name: 'Vendor', field: 'CandidateName',
                  sortable: true,
                  type: FieldType.string,
                  filterable: true, 

              },
           
            
              {
                  id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
                  formatter: Formatters.dateIso,
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

                      this.router.navigate(['app/onboarding/vendorOnboarding'], {
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
              if(this.BusinessType != 3 &&  this.inRejectedBucketList.length > 0){
                  this.inRejectedBucketList = 
                  this.inRejectedBucketList.filter(a=>a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")))
              }
              this.inRejectedBucketList.length > 0?   this.inRejectedBucketList = this.inRejectedBucketList.filter(a=>a.EmploymentType == -100) : true; 

              // this.inRejectedBucketDataset = this.inRejectedBucketList;
              this.spinner = false;
          }
      }), ((err) => {

          this.spinner = false;
      });

  }

  loadUnClaimedRecords(isRefresh: boolean) {
      this.spinner = true;
      if (isRefresh || this.unclaimedDataset == null || this.unclaimedList == null || this.unclaimedList.length == 0) {
          let ScreenType = CandidateListingScreenType.Team;
          let searchParam = "nil"; 

          var searchObj = JSON.stringify({
              ClientId: (this.BusinessType == 1 || this.BusinessType == 2) ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0
          })


          this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, ((this.BusinessType == 1 || this.BusinessType == 2) ? searchObj : searchParam)).subscribe((data) => {

              if (!data.Status) {
                  this.spinner = false;
                  return;
              }


              let apiResult: apiResult = data;
              if (apiResult.Result != "")
                  this.unclaimedList = JSON.parse(apiResult.Result);

              this.unclaimedDataset = this.unclaimedList;
              if(this.BusinessType != 3  &&  this.unclaimedDataset.length > 0){
                  this.unclaimedDataset = this.unclaimedDataset.filter(a=>a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")))
              }
              this.unclaimedDataset.length > 0?   this.unclaimedDataset = this.unclaimedDataset.filter(a=>a.EmploymentType == -100) : true; 
              this.spinner = false;

          }), ((err) => {
              this.spinner = false;
              // this.loadingScreenService.stopLoading();
          });
      }
  }

  //#endregion


  addCandidates() {

      this.headerService.checkNewTransfer("");
      this.headerService.checkNewTransfer(true);

      this.headerService.doCheckRedoOffer(false);

      sessionStorage.removeItem('previousPath');
      sessionStorage.setItem('previousPath', '/app/onboarding/vendorOnboardingList');
      this.router.navigate(['/app/onboarding/vendorOnboarding']);

      // this.router.navigate(['app/onboarding/onboarding'], {
      //     queryParams: {
      //         "Idx": btoa('115390'),
      //         "Cdx": btoa('115390'),
      //     }
      // });


      



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

      this.onboardingApi.getOnboardingListingInfo(CandidateListingScreenType.All, this.RoleId, (searchObj)).subscribe((data) => {

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
                  this.searchService.updateClaimOnBoardRequest(request_params).subscribe((result) => {
                      let apiResult: apiResult = result;
                      if (apiResult.Status) {
                          this.loadingScreenService.stopLoading()
                          this.alertService.showSuccess(apiResult.Message);
                          this.searchData();

                      }
                  })
              }
              else if (whichAction == "Void") {
                  this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
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
      this.searchService.getValidToMakeOffer(request_params).subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {

              if (apiResult.Message == "") {

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


  loadData(event) {
      if (event.nextId == 'myBucket') {

          this.selectedmigrationRecords = [];
      }
      else if (event.nextId == 'searchAll') {
      }
      this.activeTabName = event.nextId;
  }



  import_data() {
      this.showFailed = false;
      this.convertedJSON = [];
      this.globalJSON = [];
      this.myInputVariable.nativeElement.value = '';
      

      this.importLayoutService.getImportLayout(this.ImportLayoutCode).subscribe(data => {
          console.log("import layout::" , data);
          if(data != undefined && data != null){
              if(data.Status){
                  this.importLayout = data.dynamicObject;
                  $('#popup_import_data').modal({
                      backdrop: 'static',
                      keyboard: false,
                      show: true
                  });
              }
              else{
                  this.alertService.showWarning("Could not get template configuration");
                  // $('#popup_import_data').modal("hide");
              }
          }
          else{
              this.alertService.showWarning("Could not get template configuration");
              // $('#popup_import_data').modal("hide");
          }        
      },
      error => {

      } )

  }
  modal_dismiss() {
      this.convertedJSON = [];
      this.globalJSON = [];
      $('#popup_import_data').modal('hide');
  }

  onFileChange(ev) {
      let workBook = null;
      let jsonData = null;
      const reader = new FileReader();
      const file = ev.target.files[0];
      reader.onload = (event) => {
          const data = reader.result;
          workBook = XLSX.read(data, { type: 'binary', cellDates: true });

          jsonData = workBook.SheetNames.reduce((initial, name) => {
              const sheet = workBook.Sheets[name];
              initial[name] = XLSX.utils.sheet_to_json(sheet, { raw: false });
              return initial;
          }, {});
          console.log(jsonData);

          this.convertedJSON = (jsonData.Query);

          if (typeof this.convertedJSON == 'undefined') {
              this.alertService.showWarning("Runtime Execution error: The file is incorrect or worksheet name is wrong! Please try again"); this.myInputVariable.nativeElement.value = ''; return;
          }


          if (this.convertedJSON.length > 100) {
              this.alertService.showWarning('The imported file has exceeded the maximum allowed file limits (100).')
              this.myInputVariable.nativeElement.value = '';
              return;
          } else {


              $('#popup_import_data').modal('hide');
          }


          //   document.getElementById('output').innerHTML = dataString.slice(0, 300).concat("...");
          //   this.setDownload(dataString);
      }
      reader.readAsBinaryString(file);
  }
  getLetterSpace(string) {
      return string.replace(/([a-z])([A-Z])/g, '$1 $2')
  }

  ValidateAndSubmit() {

      // this.loadingScreenService.startLoading();
      // var request_params = `userId=${this.UserId}&roleId=${this.RoleId}&Isimport=${true}`;
      // var jsonData = JSON.stringify({
      //     Result: this.showFailed == true ? this.globalJSON : this.convertedJSON
      // })
      // console.log(request_params);
      // this.onboardingApi.bulkCandidateUpload(request_params, jsonData).subscribe((response) => {

      //     console.log('res', response);
      //     let apiResult: apiResult = response;
      //     this.alertService.showSuccess(apiResult.Message);
      //     this.loadingScreenService.stopLoading();


      // });
      this.Validate(true);
  }

  Validate(isimport) {
      this.showFailed_item = false;
      this.willDownload = false;
      this.loadingScreenService.startLoading();
      var request_params = `userId=${this.UserId}&roleId=${this.RoleId}&Isimport=${isimport}`;
      var jsonData = JSON.stringify({
          Result: this.showFailed == true ? this.globalJSON : this.convertedJSON
      })
      console.log(request_params);
      this.onboardingApi.bulkCandidateUpload(request_params, jsonData).subscribe((response) => {

          console.log('res', response);
          let apiResult: apiResult = response;

          if (apiResult.Status) {
              this.showFailed = true;

              let list: any;
              list = apiResult.Result;

              this.convertedJSON = [];

              const profile = list;

              list.forEach(element => {
                  this.convertedJSON.push(this.deleteProperty(element, ["IsNotEdited", "Remarks", "CandidateObject", "IsDataImported"]));
              });
              console.log(profile);
              console.log(this.convertedJSON);


              this.globalJSON = this.convertedJSON;
              console.log('ddfg', this.globalJSON);
              this.alertService.showSuccess(apiResult.Message);
              // this.convertedJSON =  _.omit(this.convertedJSON,'IsNotEdited');
              this.loadingScreenService.stopLoading();
          } else {

              this.alertService.showWarning('An error has occurred during the execution of Bulk import. See the tips for further information.');
              this.loadingScreenService.stopLoading();
          }

      });
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
      this.doRefresh();
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

  download_template() {

      // let link = document.createElement('a');
      // link.setAttribute('type', 'hidden');
      // link.href = 'assets/file/BulkImportTemplate.xlsx';
      // // link.download = 'assets/file/BulkImportTemplate.xlsx';
      // document.body.appendChild(link);
      // link.click();
      // link.remove();

      this.loadingScreenService.startLoading();
      this.importLayoutService.getExcelTemplate(this.importLayout).subscribe(
          data => {
            this.loadingSreenService.stopLoading();
            console.log(data);
            if (data.Status) {
              let byteCharacters = atob(data.dynamicObject);
              const file = this.importLayoutService.convertByteToFile(byteCharacters);
              FileSaver.saveAs(file, "VendorOnboarding"  + '_' + moment(new Date()).format('DD-MM-YYYY'));
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



}