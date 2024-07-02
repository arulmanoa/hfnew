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
import { DomSanitizer } from '@angular/platform-browser';

// services 

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { TransitionService } from '../../../_services/service/transition.service';

import * as _ from 'lodash';
import { Country } from '../../../_services/model/country';
import Swal from "sweetalert2";
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl } from '../../../_services/model/Common/LoginResponses';

import { Subscription } from 'rxjs';
import { OnboardingGrid } from '../../../_services/model/OnboardingGrid.model';
import { apiResult } from '../../../_services/model/apiResult';
import { EmployeeTransitionGroup, CandidateEmployeeMigration, _EmployeeTransitionGroup, _CandidateEmployeeMigration, MigrationResult } from '../../../_services/model/Migrations/Transition';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { CandidateModel, _CandidateModel } from '../../../_services/model/Candidates/CandidateModel';
import { CandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';


@Component({
    selector: 'app-migration-list',
    templateUrl: './migration-list.component.html',
    styleUrls: ['./migration-list.component.scss']
})
export class MigrationListComponent implements OnInit {

    _loginSessionDetails: LoginResponses;
    candidateModel: CandidateModel = new CandidateModel();
    _NewCandidateDetails: CandidateDetails = new CandidateDetails();

    //#region Common Variables

    customCopyFormatter: Formatter;
    customTimelineFormatter: Formatter;
    previewFormatter: Formatter;
    reviseFormatter: Formatter;
    //#endregion

    // ** Session logged details

    UserId: any;
    RoleId: any;
    CompanyId: any;
    UserName: any;
    ImplementationCompanyId: any;
    userAccessControl;
    accessControl_Migration: UserInterfaceControlLst = new UserInterfaceControlLst;
    // ** 

    //#region migration related variables

    migrationGridInstance: AngularGridInstance;
    migrationtGrid: any;
    migrationGridService: GridService;
    migrationDataView: any;

    migrationColumnDefinitions: Column[];
    migrationGridOptions: GridOption;
    migrationDataset: any;

    migrationList: OnBoardingGrid[] = [];

    currentmigrationRecord: any;
    selectedmigrationRecords: any[];
    ALRemarks: any;
    //#endregion


    //#region Consturctor

    spinner: boolean = false;
    isLoading: boolean = false;
    empty_data: boolean = false;

    TransitionGroup: EmployeeTransitionGroup = new EmployeeTransitionGroup();
    LstCandidateEmployeeMigration: CandidateEmployeeMigration[] = [];
    workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;

    iframeContent: any;

    isSuccessMigration: boolean = false;

    disableBtn = true;

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
        public transitionService: TransitionService,
        private sanitizer: DomSanitizer,
    ) {

        history.pushState(null, null, document.URL);
        window.addEventListener('popstate', function () {
            history.pushState(null, null, document.URL);
        });

    }

    //#endregion

    //#region migration Grid events

    migrationGridReady(angularGrid: AngularGridInstance) {
        this.migrationGridInstance = angularGrid;
        this.migrationDataView = angularGrid.dataView;
        this.migrationtGrid = angularGrid.slickGrid;
        this.migrationGridService = angularGrid.gridService;
    }

    //#endregion

    /* #region  OnInit method */


    ngOnInit() {

        this.headerService.setTitle('Employee Transition');

        this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
        this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
        this.UserId = this._loginSessionDetails.UserSession.UserId;
        this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
        this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
        this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
        this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
        this.accessControl_Migration = this.userAccessControl.filter(a => a.ControlName == "btnMigrate");

        this.doRefresh(); // initialization


    }

    // first time and pre-load table data's from API calls

    doRefresh() {

         this.empty_data = false;
        this.spinner = true;
        this.migrationDataset = [];
        this.migrationDataset.length = 0;
        this.selectedmigrationRecords = []
        this.selectedmigrationRecords.length = 0;
        this.LstCandidateEmployeeMigration = [];
        this.LstCandidateEmployeeMigration.length = 0;
        //  this.loadingScreenService.startLoading();

        this.customCopyFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>` : '<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>';
        this.customTimelineFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>` : '<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>';
        this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-eye" style="cursor:pointer" title="Preview"></i>` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';
        this.reviseFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-redo-variant" style="cursor:pointer" title="Revise" ></i>` : '<i class="mdi mdi-redo-variant" style="cursor:pointer" title="Revise"></i>';


        this.migrationColumnDefinitions = [

            {
                id: 'Client', name: 'Client', field: 'ClientName',
                sortable: false,
                type: FieldType.string,
                filterable: false, filter: { model: Filters.compoundInputText }
                // editor: 
                // {
                //   model: Editors.longText
                // }
            },
            {
                id: 'Contract', name: 'Contract', field: 'ClientContractCode',
                sortable: false,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Mandate', name: 'Mandate', field: 'Mandate',
                sortable: false,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Candidate', name: 'Candidate', field: 'CandidateName',
                sortable: false,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Requested For', name: 'Requested For', field: 'RequestedFor',
                sortable: false,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
                formatter: Formatters.dateIso,
                sortable: false,
                type: FieldType.date
            },
            {
                id: 'ExpectedDOJ', name: 'Expected DOJ', field: 'ExpectedDOJ',
                formatter: Formatters.dateIso,
                sortable: false,
                type: FieldType.date
            },
            {
                id: 'Status', name: 'Status', field: 'Status',
                sortable: false,
                type: FieldType.string
            },
            {
                id: 'PendingAtDisplayName', name: 'Pending At', field: 'PendingAt',
                sortable: false,
                type: FieldType.string
            },
            {
                id: 'preview',
                field: 'Id',
                excludeFromHeaderMenu: true,
                formatter: this.previewFormatter,
                minWidth: 30,
                maxWidth: 30,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    console.log(args.dataContext);
                    this.previewLetter(args.dataContext);

                }
            },
            // {
            //     id: 'revise',
            //     field: 'Id',
            //     excludeFromHeaderMenu: true,
            //     formatter: this.reviseFormatter,
            //     minWidth: 30,
            //     maxWidth: 30,
            //     // use onCellClick OR grid.onClick.subscribe which you can see down below
            //     onCellClick: (e: Event, args: OnEventArgs) => {

            //         this.router.navigate(['app/onboarding/onboarding'], {
            //             queryParams: {
            //                 "Idx": btoa(args.dataContext.Id),
            //                 "Cdx": btoa(args.dataContext.CandidateId),
            //             }
            //         });
            //     }
            // }


        ];
        this.migrationGridOptions = {
            asyncEditorLoading: false,
            autoResize: {
                containerId: 'grid-container',
            },
            enableAutoResize: true,
            editable: false,
            enableColumnPicker: true,
            enableCellNavigation: false,
            enableRowSelection: false,
            enableCheckboxSelector: true,
            enableFiltering: false,
            showHeaderRow: false,
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
        this.loadmigrationRecords(true);

    }



    /* #endregion */

    /* #region  initial load and refresh load for migration records */
    loadmigrationRecords(isRefresh: boolean) {
        this.spinner = true;
        let ScreenType = CandidateListingScreenType.ReadyToMigrate;
        let searchParam = "Transition";
        this.onboardingApi.getOnboardingListingInfo(ScreenType, this.RoleId, searchParam).subscribe((data) => {

            let apiResult: apiResult = data;
            if (apiResult.Result != "" && apiResult.Status) {
                this.migrationList = JSON.parse(apiResult.Result);
                this.empty_data = false;
                this.migrationDataset = JSON.parse(apiResult.Result);
                this.spinner = false;
            }
            else {
                this.empty_data = true;
            }
        }), ((err) => {
            this.spinner = false;
        });
    }

    /* #endregion */

    /* #region  On Select rows using checkbox */
    onSelectedRowsChanged(data, args) {
        console.log(args);

        this.selectedmigrationRecords = [];
        if (args != null && args.rows != null && args.rows.length > 0) {
            for (let i = 0; i < args.rows.length; i++) {
                this.selectedmigrationRecords.push(this.migrationList[args.rows[i]]);
            }
        }
        console.log(this.selectedmigrationRecords);
    }
    /* #endregion */

    /* #region  Release AL -  click event function */




    releaseAL() {

        this.disableBtn = false;

        if (this.selectedmigrationRecords.length != 0) {

            $('#popup_release_AL').modal({
                backdrop: 'static',
                keyboard: false,
                show: true
            });
            // $('#popup_release_AL').modal({backdrop:'static', keyboard:false});
            // $('#popup_release_AL').modal({backdrop: false, keyboard: false, show: true});

            this.selectedmigrationRecords.forEach(element => {

                element["Message"] = null;
                element["Status"] = null;
            });


        }
        else {
            this.alertService.showWarning("Please select at least one candidate for transition from the list    ");

        }
    }

    modal_dismiss() {
        this.disableBtn = true;
        this.doRefresh();
        this.isSuccessMigration = false;
        this.ALRemarks = null;
        $('#popup_release_AL').modal('hide');
        $('#popup_previewLetter').modal('hide');
        this.migrationGridInstance.gridService.clearAllFiltersAndSorts();
        this.iframeContent = null;

    }

    confirmRelease(myString) {

        if (this.ALRemarks == undefined || this.ALRemarks == null || this.ALRemarks == '') {
            this.alertService.showWarning("Please enter the remarks. This field is required ");
            return;
        }

        this.loadingScreenService.startLoading();
        this.LstCandidateEmployeeMigration = [];
        // (document.querySelector('.readonly') as HTMLElement).setAttribute('readonly', 'readonly');
        // this.TransitionGroup.Status = this.isALRelease;
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

            //commented the below code and used the above as i felt that the same obj is being assinged to all candidates
            // this.workFlowInitiation.Remarks = "";
            // this.workFlowInitiation.EntityId = element.CandidateId;
            // this.workFlowInitiation.EntityType = EntityType.CandidateDetails;
            // this.workFlowInitiation.CompanyId = this.CompanyId;
            // this.workFlowInitiation.ClientContractId = element.ClientContractId;
            // this.workFlowInitiation.ClientId = element.ClientId;

            // this.workFlowInitiation.ActionProcessingStatus = 4000;
            // this.workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
            // this.workFlowInitiation.WorkFlowAction = 1;
            // this.workFlowInitiation.RoleId = this.RoleId;
            // this.workFlowInitiation.DependentObject = JSON.stringify(element);
            // this.workFlowInitiation.UserInterfaceControlLst = this.accessControl_Migration;

            this.LstCandidateEmployeeMigration.push({
                ModuleTransactionId: element.Id,
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
                CCMails : '',
                EffectivePayPeriod: element.EffectivePayPeriodId,
                TeamId: element.TeamId,
                ActualDateOfJoining: element.ActualDateOfJoining,
            }

            )
        });

        this.TransitionGroup.LstCandidateEmployeeMigration = (this.LstCandidateEmployeeMigration);

        console.log(this.LstCandidateEmployeeMigration);
        console.log(this.TransitionGroup);

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
                                e.Status = element.Status
                            }
                        });
                    });
                    console.log(MigrationResult.LstCandidateEmployeeMigration);


                    this.loadingScreenService.stopLoading();
                    this.isSuccessMigration = true;
                    // this.doRefresh();
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
            this.loadingScreenService.stopLoading();


        })


    }


    /* #endregion */
    Continue() {
        this.disableBtn = true;
        this.ALRemarks = null;
        this.isSuccessMigration = false;
        $('#popup_release_AL').modal('hide');
       // this.doRefresh();
    }

    delete(item) {

        var index = this.selectedmigrationRecords.map(function (el) {
            return el.Id
        }).indexOf(item.Id)
        // Delete  the item by index.
        this.selectedmigrationRecords.splice(index, 1)
        console.log(this.selectedmigrationRecords);

    }


    /* #region  Preview AL Letter (Popup) */
    previewLetter(myObject) {

        this.iframeContent = null;
        $('#popup_previewLetter').modal('show');

        let req_param_uri = `Id=${myObject.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
        this.onboardingApi.getCandidate(req_param_uri).subscribe((data: any) => {
            let apiResponse: apiResponse = data;
            this.candidateModel = (apiResponse.dynamicObject);
            this._NewCandidateDetails = this.candidateModel.NewCandidateDetails;

            var req_post_param = JSON.stringify({

                ModuleProcessTranscId: this._NewCandidateDetails.LstCandidateOfferDetails[0].ModuleTransactionId,
                CandidateDetails: this._NewCandidateDetails
            });
            console.log(JSON.stringify(req_post_param));
            this.onboardingApi.postPreviewLetter(req_post_param)
                .subscribe(data => {
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

                            // const newPdfWindow = window.open('', '');
                            // const content = encodeURIComponent(base64);
                            // // tslint:disable-next-line:max-line-length
                            // const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';
                            // const iframeEnd = '\'><\/iframe>';
                            // newPdfWindow.document.write(iframeStart + content + iframeEnd);
                            // newPdfWindow.document.title = fileName;

                            var content = 'data:' + contentType + ';base64,' + encodeURIComponent(base64);
                            this.iframeContent = this.sanitizer.bypassSecurityTrustResourceUrl(content);
                            console.log(this.iframeContent);

                        }
                    }
                });
        },
            (err) => {
                this.alertService.showWarning(`Something is wrong!  ${err}`);
            });

    }
    /* #endregion */
}