import { Component, OnInit, HostListener, Inject, Input, ViewEncapsulation } from '@angular/core';
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

// services 

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';


import * as _ from 'lodash';
import { Country } from '../../../_services/model/country';
import Swal from "sweetalert2";
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl } from '../../../_services/model/Common/LoginResponses';

import { Subscription } from 'rxjs';
import { OnboardingGrid } from '../../../_services/model/OnboardingGrid.model';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
import { WorkflowService } from '../../../_services/service/workflow.service';
import { UrlResolver } from '@angular/compiler';


@Component({
    selector: 'app-onboarding-qc-list',
    templateUrl: './onboarding-qc-list.component.html',
    styleUrls: ['./onboarding-qc-list.component.css']
})
export class OnboardingQcListComponent implements OnInit {

    _loginSessionDetails: LoginResponses;
    fromDate: Date;
    toDate: Date;
    clientId: number;
    mandateId: number;
    candName: string;
    showMine: boolean;
    actionStatusId: number;

    //#region Common Variables

    customCopyFormatter: Formatter;
    customTimelineFormatter: Formatter;
    customClaimFormatter: Formatter;
    isNAPS_Formatter : Formatter;

    //#endregion

    //#region InBucket related variables

    inBucketGridInstance: AngularGridInstance;
    inBucketGrid: any;
    inBucketGridService: GridService;
    inBucketDataView: any;

    inBucketColumnDefinitions: Column[];
    inBucketGridOptions: GridOption;
    inBucketDataset: any;

    inBucketList: OnBoardingGrid[] = [];

    currentInBucketRecord: any;
    selectedInBucketRecords: any[];

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
    activeTabName: string;
    //#endregion

    // ** Session logged details

    UserId: any;
    RoleId: any;

    // ** 

    //#region Consturctor


    spinner: boolean = false;
    BusinessType: any;
    IsExtraTabRequired: boolean = true;
    RoleCode: any;
    AlternativeText: any = 'Claimed';
    AlternativeText1: any = "Unclaimed";

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

        public sessionService: SessionStorage,
        private headerService: HeaderService,
        private loadingScreenService: LoadingScreenService,
        private workFlowApi: WorkflowService,

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

    //#endregion

    //#region Unclaimed Grid events

    unClaimedGridReady(angularGrid: AngularGridInstance) {
        this.unclaimedGridInstance = angularGrid;
        this.inBucketDataView = angularGrid.dataView;
        this.inBucketGrid = angularGrid.slickGrid;
        this.inBucketGridService = angularGrid.gridService;
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

        this.activeTabName = 'claimed';
        this.customCopyFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>` : '<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>';
        this.customTimelineFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>` : '<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>';
        this.customClaimFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-thumb-up-outline" style="cursor:pointer"></i>` : '<i class="mdi mdi-thumb-up-outline" style="cursor:pointer"></i>';

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
        this.activeTabName = 'claimed';
        this.headerService.setTitle('Onboarding QC Requests');

        this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
        this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
        this.UserId = this._loginSessionDetails.UserSession.UserId;
        this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

        this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
        var LstCompanySettings = [];
        LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));
        if (LstCompanySettings != null && LstCompanySettings.length > 0) {

            LstCompanySettings = LstCompanySettings.filter(a => a.RoleCode == this.RoleCode);
            if (LstCompanySettings.length > 0) {
                var isExist = LstCompanySettings.find(z => z.ModuleName == 'OnboardingQcList');
                if (isExist != undefined) {
                    this.IsExtraTabRequired = isExist.IsExtraTabRequired;
                    this.AlternativeText = isExist.AlternativeText;
                    this.AlternativeText1 = isExist.AlternativeText1;

                }
            }
        }

        (this.AlternativeText == null || this.AlternativeText == '') ? "Claimed" : true;
        (this.AlternativeText1 == null || this.AlternativeText1 == '') ? "Unclaimed" : true;

        // this.RoleId = 3;
        this.initializeGrids();
        this.loadInBucketRecords(true);
    }

    // first time and ra-load table data's from API calls

    initializeGrids() {
        //  this.loadingScreenService.startLoading();

        this.inBucketColumnDefinitions = [];
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

        this.unclaimedColumnDefinitions = [
            {
                id: 'Candidate', name: 'Candidate', field: 'CandidateName',
                sortable: true,
                type: FieldType.string,
                filterable: true,

            },

            {
                id: 'Mandate', name: 'Mandate', field: 'Mandate',
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
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'IsNapsBased', name: 'Request Mode', field: 'IsNapsBased',
                formatter: this.isNAPS_Formatter,
                excludeFromExport: true
            },

            {
                id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
                type: FieldType.string,
                sortable: true,
            },
            {
                id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
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
                formatter: this.customClaimFormatter,
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

                    // localStorage.removeItem('previousPath');
                    // localStorage.setItem('previousPath', '/app/onboardingqc/onbqclist');

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
        this.BusinessType == 3 ? (this.unclaimedColumnDefinitions = staffingObject.concat(this.unclaimedColumnDefinitions as any)) : true;

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

        this.searchColumnDefinitions = [
            {
                id: 'Candidate', name: 'Candidate', field: 'CandidateName',
                sortable: true,
                type: FieldType.string,
                filterable: true,

            },

            {
                id: 'Mandate', name: 'Mandate', field: 'Mandate',
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
                id: 'RequestedOn', name: 'Requested On', field: 'RequestedCreatedon',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
                type: FieldType.string,
                sortable: true,
            },
            {
                id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
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
            }

        ];
        let staffingObject1 = [
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
        this.BusinessType == 3 ? (this.searchColumnDefinitions = staffingObject1.concat(this.searchColumnDefinitions as any)) : true;

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

        //this.setSearchGridColumns();

    }

    //#endregion

    //#region Private Methods

    setSearchGridColumns() {
        this.searchColumnDefinitions = [
            {
                id: 'Candidate', name: 'Candidate', field: 'CandidateName',
                sortable: true,
                type: FieldType.string,
                filterable: true,

            },

            {
                id: 'Mandate', name: 'Mandate', field: 'Mandate',
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
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
                type: FieldType.string,
                sortable: true,
            },
            {
                id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
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
                id: 'edit',
                field: 'id',
                excludeFromHeaderMenu: true,
                formatter: Formatters.editIcon,
                minWidth: 30,
                maxWidth: 30,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    //   this.selectedTemplates = [];
                    //   this.selectedTemplates.push(args.dataContext);
                    //   this.editTemplate(false);
                }
            },
            {
                id: 'copy',
                field: 'id',
                excludeFromHeaderMenu: true,
                formatter: this.customCopyFormatter,
                minWidth: 30,
                maxWidth: 30,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    //   this.selectedTemplates = [];
                    //   this.selectedTemplates.push(args.dataContext);
                    //   this.editTemplate(false);
                }
            },
            {
                id: 'timeline',
                field: 'id',
                excludeFromHeaderMenu: true,
                formatter: this.customTimelineFormatter,
                minWidth: 30,
                maxWidth: 30,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    //   this.selectedTemplates = [];
                    //   this.selectedTemplates.push(args.dataContext);
                    //   this.editTemplate(false);
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
                onCellClick: (e: Event, args: OnEventArgs) => {
                    if (confirm('Are you sure you want to delete this template?')) {
                        // this.selectedTemplates = [];
                        // this.selectedTemplates.push(args.dataContext);
                        // //this.deleteRuleSet();
                        // //this.angularGrid.gridService.deleteDataGridItemById(args.dataContext.id);
                    }
                }
            }
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

    loadInBucketRecords(isRefresh: boolean) {
        this.spinner = true;
        if (isRefresh || this.inBucketDataset == null || this.inBucketList == null || this.inBucketList.length == 0) {

            let ScreenType = CandidateListingScreenType.Pending;
            let searchParam = "test";
            this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam).subscribe((data) => {
                this.inBucketColumnDefinitions = [
                    {
                        id: 'Candidate', name: 'Candidate', field: 'CandidateName',
                        sortable: true,
                        type: FieldType.string,
                        filterable: true,

                    },

                    {
                        id: 'Mandate', name: 'Mandate', field: 'Mandate',
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
                        formatter: Formatters.dateIso,
                        sortable: true,
                        type: FieldType.date
                    },
                    {
                        id: 'IsNapsBased', name: 'Request Mode', field: 'IsNapsBased',
                        formatter: this.isNAPS_Formatter,
                        excludeFromExport: true
                    },
                    {
                        id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
                        type: FieldType.string,
                        sortable: true,
                    },
                    {
                        id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
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

                            if (args.dataContext.EmploymentTypeName != null && args.dataContext.EmploymentTypeName != '' && args.dataContext.EmploymentTypeName.toUpperCase() == "VENDOR") {


                                sessionStorage.removeItem('previousPath');
                                sessionStorage.setItem('previousPath', '/app/onboardingqc/onbqclist');


                                this.router.navigate(['app/vendorOnboarding_qc'], {
                                    queryParams: {
                                        "Idx": btoa(args.dataContext.Id),
                                        "Cdx": btoa(args.dataContext.CandidateId),
                                    }
                                });

                            }
                            else {
                                sessionStorage.removeItem('previousPath');
                                sessionStorage.setItem('previousPath', '/app/onboardingqc/onbqclist');


                                this.router.navigate(['app/onboardingqc/onboarding_qc'], {
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
                    }
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
                console.log('this.BusinessType', this.BusinessType);

                if (this.BusinessType != 3 && this.inBucketList.length > 0) {
                    this.inBucketList = this.inBucketList.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
                }

                // this.inBucketList.length > 0?   this.inBucketList = this.inBucketList.filter(a=>a.EmploymentType != -100) : true; 

                // this.inBucketList.forEach(element => {

                //     element.Id =  Math.floor((Math.random() * 10) + 1);

                // });
                // console.log(this.inBucketList);
                this.inBucketDataset = this.inBucketList;
                this.spinner = false;
                // this.loadingScreenService.stopLoading();
            }), ((err) => {
                this.spinner = false;
                // this.loadingScreenService.stopLoading();
            });

        }




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

    loadUnClaimedRecords(isRefresh: boolean) {
        this.spinner = true;
        if (isRefresh || this.unclaimedDataset == null || this.unclaimedList == null || this.unclaimedList.length == 0) {
            let ScreenType = CandidateListingScreenType.Team;
            let searchParam = "nil";

            var searchObj = JSON.stringify({
                ClientId: this.BusinessType != 3 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0
            })

            this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, (this.BusinessType != 3 ? searchObj : searchParam)).subscribe((data) => {

                if (!data.Status) {

                    this.spinner = false;
                    return;
                }


                let apiResult: apiResult = data;
                if (apiResult.Result != "")
                    this.unclaimedList = JSON.parse(apiResult.Result);

                this.unclaimedDataset = this.unclaimedList;
                if (this.BusinessType != 3) {
                    this.unclaimedDataset = this.unclaimedDataset.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
                }
                // this.unclaimedDataset.length > 0?   this.unclaimedDataset = this.unclaimedDataset.filter(a=>a.EmploymentType != -100) : true; 

                this.spinner = false;

            }), ((err) => {
                this.spinner = false;
                // this.loadingScreenService.stopLoading();
            });
        }
    }

    //#endregion

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

                        this.alertService.confirmSwal("Confirmation", 'Request(s) claimed successfully, please click Yes to goto Your Claimed requests tab', "Yes").then(result => {
                            this.loadingScreenService.startLoading();
                            this.loadInBucketRecords(true);
                            this.activeTabName = 'claimed';
                            this.loadingScreenService.stopLoading();
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

    searchData() {
        //TODO: do the validations properly so that numerous data is not returned
        if ((this.fromDate == null || this.fromDate == undefined) &&
            (this.toDate == null || this.toDate == undefined) &&
            (this.candName == null || this.candName == undefined || this.candName.trim() == '')) {
            alert('Please provide any search criteria');
            return;
        }

        var searchObj =
            [{
                CandidateName: this.candName,
                FromDate: this.fromDate,
                Todate: this.toDate,
                MandateRequirementId: 0,
                ActionStatus: 0,
                MyRequest: 0,
                ClientId: this.BusinessType != 3 ? this.sessionService.getSessionStorage("default_SME_ClientId") : 0
            }]

        this.onboardingApi.getOnboardingListingInfo(CandidateListingScreenType.All, this.RoleId, JSON.stringify(searchObj)).subscribe((data) => {

            let apiResult: apiResult = data;
            if (apiResult.Result != "") {
                this.searchList = JSON.parse(apiResult.Result);
                this.searchDataset = this.searchList;
                if (this.BusinessType != 3 && this.searchDataset.length > 0) {
                    this.searchDataset = this.searchDataset.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
                }
                this.searchDataset.length > 0 ? this.searchDataset = this.searchDataset.filter(a => a.EmploymentType != -100) : true;
                // this.loadingScreenService.stopLoading();
                return;
            }

            alert('No data found');
            this.searchList = [];
            this.searchDataset = this.searchList;

        }), ((err) => {
            // this.loadingScreenService.stopLoading();
        });

    }

    clearSearchCriteria() {
        this.fromDate = null;
        this.toDate = null;
        this.candName = '';

    }

    //#region Events

    loadData(event) {
        if (event.nextId == 'unclaimed') {
            this.loadUnClaimedRecords(true);//to be changed to false after proper api check is implemented
        }
        else if (event.nextId == 'claimed') {
            this.loadInBucketRecords(true);//to be changed to false after proper api check is implemented
        }
        this.activeTabName = event.nextId;
    }

    onSelectedRowsChanged(data, args) {
        this.selectedUnclaimedRecords = [];
        if (args != null && args.rows != null && args.rows.length > 0) {
            for (let i = 0; i < args.rows.length; i++) {
                this.selectedUnclaimedRecords.push(this.unclaimedList[args.rows[i]].Id);
            }

        }
        console.log(this.selectedUnclaimedRecords);
    }

    refreshCurrentTab() {
        if (this.activeTabName == 'claimed') {
            this.loadInBucketRecords(true);
        }
        else if (this.activeTabName == 'unclaimed') {
            this.loadUnClaimedRecords(true);
        }
        else {
            //call search button again??
        }
    }

    @HostListener('window:scroll', ['$event'])
    onWindowScroll(e) {

        if (window.pageYOffset > 50) {
            let element = document.getElementById('navbar');
            element.classList.add('sticky');
        } else {
            let element = document.getElementById('navbar');
            element.classList.remove('sticky');
        }
    }


    //#endregion


}