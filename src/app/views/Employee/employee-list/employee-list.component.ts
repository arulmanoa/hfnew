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
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

// services 

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';
import { CountryService } from '../../../_services/service/country.service';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { EmployeeService } from '../../../_services/service/employee.service';

import * as _ from 'lodash';
import { Country } from '../../../_services/model/country';
import Swal from "sweetalert2";
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl } from '../../../_services/model/Common/LoginResponses';

import { Subscription } from 'rxjs';
import { OnboardingGrid } from '../../../_services/model/OnboardingGrid.model';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { CandidateModel, _CandidateModel } from '../../../_services/model/Candidates/CandidateModel';
import { CandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { saveAs } from 'file-saver';
import { ELCTRANSACTIONTYPE, EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { TransactionStatus } from 'src/app/_services/model/Employee/EmployeeFFTransaction';
//import { RegenerateModalComponent } from 'src/app/shared/modals/regenerate-modal/regenerate-modal.component';

@Component({
    selector: 'app-employee-list',
    templateUrl: './employee-list.component.html',
    styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {

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
    accessControl_Employee: UserInterfaceControlLst = new UserInterfaceControlLst;
    // ** 

    //#region employee related variables

    employeeGridInstance: AngularGridInstance;
    employeetGrid: any;
    employeeGridService: GridService;
    employeeDataView: any;
    employeeColumnDefinitions: Column[];
    employeeGridOptions: GridOption;
    employeeDataset: any;
    employeeList: OnBoardingGrid[] = [];

    currentemployeeRecord: any;
    selectedemployeeRecords: any[];
    //#endregion

    /* #region  Non Payrol variable declaration */
    nonPayrollGridInstance: AngularGridInstance;
    nonPayrollGrid: any;
    nonPayrollGridService: GridService;
    nonPayrollDataView: any;
    nonPayrollColumnDefinitions: Column[];
    nonPayrollGridOptions: GridOption;
    nonPayrollDataset: any;
    nonPayrollList: OnBoardingGrid[];

    /* #endregion */

    /* #region  void employee ariable declaration */
    voidEmployeeGridInstance: AngularGridInstance;
    voidEmployeeGrid: any;
    voidEmployeeGridService: GridService;
    voidEmployeeDataView: any;
    voidEmployeeColumnDefinitions: Column[];
    voidEmployeeGridOptions: GridOption;
    voidEmployeeDataset: any;
    voidEmployeeList: OnBoardingGrid[] = [];

    /* #endregion */
    //#region Consturctor

    spinner: boolean = false;
    isLoading: boolean = false;

    workFlowInitiation: WorkFlowInitiation = new WorkFlowInitiation;

    iframeContent: any;

    EmployeeName: any;
    EmployeeCode: any;
    ClientName: any;
    PreviewList: any;
    DocumentList: any;

    isResignation: boolean = true;
    isTermination: boolean = true;

    selectedmigrationRecords: any[];
    modalOption: NgbModalOptions = {};


    constructor(

        private activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private alertService: AlertService,
        private fileuploadService: FileUploadService,
        private titleService: Title,
        public UIBuilderService: UIBuilderService,
        public sessionService: SessionStorage,
        private headerService: HeaderService,
        private loadingScreenService: LoadingScreenService,
        public employeeService: EmployeeService,
        private sanitizer: DomSanitizer,
        public modalService: NgbModal,

    ) { }

    //#endregion

    //#region employee Grid events

    employeeGridReady(angularGrid: AngularGridInstance) {
        this.employeeGridInstance = angularGrid;
        this.employeeDataView = angularGrid.dataView;
        this.employeetGrid = angularGrid.slickGrid;
        this.employeeGridService = angularGrid.gridService;
    }

    //#endregion

    /* #region  Non Payroll grid events */
    nonPayrollGridReady(angularGrid: AngularGridInstance) {
        this.nonPayrollGridInstance = angularGrid;
        this.nonPayrollDataView = angularGrid.dataView;
        this.nonPayrollGrid = angularGrid.slickGrid;
        this.nonPayrollGridService = angularGrid.gridService;
    }
    /* #endregion */

    /* #region  void employee grid events */
    voidEmployeeGridReady(angularGrid: AngularGridInstance) {
        this.voidEmployeeGridInstance = angularGrid;
        this.voidEmployeeDataView = angularGrid.dataView;
        this.voidEmployeeGrid = angularGrid.slickGrid;
        this.voidEmployeeGridService = angularGrid.gridService;
    }
    /* #endregion */

    /* #region  OnInit method */

    ngOnInit() {

        this.headerService.setTitle('Employees');
        this.modalOption.backdrop = 'static';
        this.modalOption.keyboard = false;

        this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
        this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
        this.UserId = this._loginSessionDetails.UserSession.UserId;
        this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
        this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
        this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
        this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
        this.accessControl_Employee = this.userAccessControl.filter(a => a.ControlName == "btnMigrate");

        this.doRefresh(); // initialization


    }

    // first time and pre-load table data's from API calls

    doRefresh() {

        this.selectedmigrationRecords = [];
        this.selectedmigrationRecords.length = 0;
        this.selectedemployeeRecords = []

        this.nonPayrollList = [];
        this.nonPayrollDataset = [];

        this.employeeList = [];
        this.employeeDataset = [];

        this.voidEmployeeList = [];
        this.voidEmployeeDataset = []

        //  this.loadingScreenService.startLoading();
        this.spinner = true;
        this.customCopyFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>` : '<i class="mdi mdi-content-duplicate" style="cursor:pointer"></i>';
        this.customTimelineFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>` : '<i class="mdi mdi-chart-timeline" style="cursor:pointer"></i>';
        this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
          class="fa fa-files-o m-r-xs"></i> Docs </button>` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';
        this.reviseFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-account-remove" style="cursor:pointer" title="Void" ></i>` : '<i class="mdi mdi-account-remove" style="cursor:pointer" title="Void"></i>';


        /* #region  Payroll grid definition, columns */
        this.employeeColumnDefinitions = [

            {
                id: 'Client', name: 'Client', field: 'ClientName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Contract', name: 'Contract', field: 'ClientContractCode',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Employee Name', name: 'Employee Name', field: 'EmployeeName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Employee Code', name: 'Employee Code', field: 'EmployeeCode',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Team Name', name: 'Team Name', field: 'TeamName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'DOJ', name: 'DOJ', field: 'DOJ',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'Onboarded On', name: 'Onboarded On', field: 'Onboardedon',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'Onboarded By', name: 'Onboarded By', field: 'OnboardedBy',
                sortable: true,
                type: FieldType.string
            },
            {
                id: 'preview',
                field: 'Id',
                excludeFromHeaderMenu: true,
                formatter: this.previewFormatter,
                minWidth: 100,
                maxWidth: 100,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    console.log(args.dataContext);
                    this.EmployeeName = args.dataContext.EmployeeName;
                    this.EmployeeCode = args.dataContext.EmployeeCode;
                    this.ClientName = args.dataContext.ClientName;
                    this.PreviewList = args.dataContext.Letters;
                    this.DocumentList = args.dataContext.CandidateDocument;
                    this.preview_employee(args.dataContext);

                }
            },

        ];



        this.employeeGridOptions = {
            asyncEditorLoading: false,
            autoResize: {
                containerId: 'grid-container',
            },
            enableAutoResize: true,
            editable: false,
            enableColumnPicker: true,
            enableCellNavigation: true,
            enableRowSelection: true,
            enableCheckboxSelector: true,
            enableFiltering: true,
            showHeaderRow: false,
            // rowSelectionOptions: {
            //     // True (Single Selection), False (Multiple Selections)
            //     selectActiveRow: false
            // },
            // checkboxSelector: {
            //     // remove the unnecessary "Select All" checkbox in header when in single selection mode
            //     hideSelectAllCheckbox: false
            // },
            datasetIdPropertyName: "Id"
        };

        /* #endregion */

        /* #region  Non Payroll grid definition, an columns */
        this.nonPayrollGridOptions = {
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
        this.nonPayrollColumnDefinitions = [

            {
                id: 'Client', name: 'Client', field: 'ClientName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Contract', name: 'Contract', field: 'ClientContractCode',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Employee Name', name: 'Employee Name', field: 'EmployeeName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Employee Code', name: 'Employee Code', field: 'EmployeeCode',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Team Name', name: 'Team Name', field: 'TeamName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'DOJ', name: 'DOJ', field: 'DOJ',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'Onboarded On', name: 'Onboarded On', field: 'Onboardedon',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'Onboarded By', name: 'Onboarded By', field: 'OnboardedBy',
                sortable: true,
                type: FieldType.string
            },
            {
                id: 'preview',
                field: 'Id',
                excludeFromHeaderMenu: true,
                formatter: this.previewFormatter,
                minWidth: 100,
                maxWidth: 100,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    console.log(args.dataContext);
                    this.EmployeeName = args.dataContext.EmployeeName;
                    this.EmployeeCode = args.dataContext.EmployeeCode;
                    this.ClientName = args.dataContext.ClientName;
                    this.PreviewList = args.dataContext.Letters;
                    this.DocumentList = args.dataContext.CandidateDocument;
                    this.preview_employee(args.dataContext);

                }
            },
            {
                id: 'void',
                field: 'Id',
                excludeFromHeaderMenu: true,
                formatter: this.reviseFormatter,
                minWidth: 30,
                maxWidth: 30,
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                onCellClick: (e: Event, args: OnEventArgs) => {

                    console.log(args.dataContext);
                    this.doVoid_as_Employee(args.dataContext)

                }
            },

        ];

        /* #endregion */

        this.voidEmployeeGridOptions = {
            asyncEditorLoading: false,
            autoResize: {
                containerId: 'grid-container',
            },
            enableAutoResize: true,
            editable: false,
            enableColumnPicker: true,
            enableCellNavigation: true,
            enableRowSelection: false,
            enableCheckboxSelector: false,
            enableFiltering: true,
            showHeaderRow: false,
            datasetIdPropertyName: "Id",
            enableExport: true,

        };
        this.voidEmployeeColumnDefinitions = [

            {
                id: 'Client', name: 'Client', field: 'ClientName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Contract', name: 'Contract', field: 'ClientContractCode',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Employee Name', name: 'Employee Name', field: 'EmployeeName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }
            },
            {
                id: 'Employee Code', name: 'Employee Code', field: 'EmployeeCode',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'Team Name', name: 'Team Name', field: 'TeamName',
                sortable: true,
                type: FieldType.string,
                filterable: true, filter: { model: Filters.compoundInputText }

            },
            {
                id: 'DOJ', name: 'DOJ', field: 'DOJ',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'Onboarded On', name: 'Onboarded On', field: 'Onboardedon',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'Onboarded By', name: 'Onboarded By', field: 'OnboardedBy',
                sortable: true,
                type: FieldType.string
            },


        ];


        this.loademployeeRecords(true);
      
    }



    /* #endregion */

    /* #region  initial load and refresh load for employee records */
    loademployeeRecords(isRefresh: boolean) {
        
        this.spinner = true;
        let ScreenType = CandidateListingScreenType.Payroll;
        let searchParam = "Payroll";
        this.employeeService.getEmployeeList(ScreenType, this.RoleId, searchParam).subscribe((data) => {

            let apiResult: apiResult = data;
            this.loadnonPayrollRecords();
          
            if (apiResult.Result != "")
                this.employeeList = JSON.parse(apiResult.Result);
            console.log('PAYROLL EMPS ::', this.employeeList);
            this.employeeDataset = this.employeeList;
            this.spinner = false;
        }), ((err) => {
            this.spinner = false;
        });
    }

    /* #endregion */

    /* #region  initial load and refresh load for non payroll records */
    loadnonPayrollRecords() {
        this.spinner = true;
        let ScreenType = CandidateListingScreenType.NonPayroll;
        let searchParam = "NonPayroll";
        this.employeeService.getEmployeeList(ScreenType, this.RoleId, searchParam).subscribe((data) => {
            let apiResult: apiResult = data;
            this.loadvoidEmployeeRecords();
            if (apiResult.Result != "")
                this.nonPayrollList = JSON.parse(apiResult.Result);
            console.log('NONPAY EMPS ::', this.nonPayrollList);
            this.nonPayrollDataset = this.nonPayrollList;
            this.spinner = false;
        }), ((err) => {
            this.spinner = false;
        });
    }

    /* #endregion */



    /* #region  initial load and refresh load for void employees records */
    loadvoidEmployeeRecords() {
        this.spinner = true;
        let ScreenType = CandidateListingScreenType.Void;
        let searchParam = "Void";
        this.employeeService.getEmployeeList(ScreenType, this.RoleId, searchParam).subscribe((data) => {
            let apiResult: apiResult = data;
            if (apiResult.Result != "")
                this.voidEmployeeList = JSON.parse(apiResult.Result);
            console.log('VOIDED EMPS ::', this.voidEmployeeList);

            this.voidEmployeeDataset = this.voidEmployeeList;
            this.spinner = false;
        }), ((err) => {
            this.spinner = false;
        });
    }

    /* #endregion */

    closeModal() {
        $('#popup_preview_download').modal('hide');

    }


    preview_employee(args) {

        $('#popup_preview_download').modal('show');

    }

    // previewLetter(btn_item) {
    //     console.log(btn_item);
    //     let thefile = {};
    //     var letterURL = this.fileuploadService.downloadObjectAsBlob(btn_item.DocumentId)
    //         .subscribe(res => {
    //             if (res == null || res == undefined) {
    //                 alert('Sorry, unable to get the document. Please get in touch with the support team');
    //                 return;
    //             }

    //             saveAs(res);

    //         });



    // }

    doVoid_as_Employee(item) {

        this.alertService.confirmSwal("Are you sure?", "Are you sure you want to void this employee?", "Yes, Proceed").then(result => {

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
                allowEscapeKey: false,
                allowOutsideClick: false,
                inputPlaceholder: 'Type your message here...',
                inputAttributes: {
                    autocorrect: 'off',
                    autocapitalize: 'on',
                    maxlength: '120',
                    'aria-label': 'Type your message here',
                },

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

                let req_params = `employeeId=${item.Id}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;
                this.employeeService.updateEmployeeVoidTransaction(req_params).subscribe((result) => {

                    console.log(result);
                    let apiResult: apiResult = result;
                    if (apiResult.Status) {

                        this.doRefresh();
                        this.alertService.showSuccess(apiResult.Message);
                        this.loadingScreenService.stopLoading();

                    } else {
                        this.alertService.showWarning(apiResult.Message);
                    }
                })
            })
        })
            .catch(error => this.loadingScreenService.stopLoading());
    }


    /* #region  On Select rows using checkbox */
    onSelectedRowsChanged(data, args) {
        console.log(args);

        this.selectedmigrationRecords = [];
        if (args != null && args.rows != null && args.rows.length > 0) {
            console.log('length ar', args.rows.length);
            for (let i = 0; i < args.rows.length; i++) {
                console.log('element4', args.rows)
                var row = args.rows[i];
                var row_data = this.nonPayrollDataView.getItem(row);
                console.log('row_data', row_data);
                this.selectedmigrationRecords.push(row_data);

            }
        }

        // this.selectedmigrationRecords = [];
        // if (args != null && args.rows != null && args.rows.length > 0) {
        //     for (let i = 0; i < args.rows.length; i++) {
        //         this.selectedmigrationRecords.push(this.nonPayrollList[args.rows[i]]);
        //     }
        // }
        console.log(this.selectedmigrationRecords);
    }
    /* #endregion */


    // ReGenerate() {

    //     console.log(this.selectedmigrationRecords);

    //     const modalRef = this.modalService.open(RegenerateModalComponent, this.modalOption);
    //     modalRef.componentInstance.UserId = this.UserId;
    //     modalRef.componentInstance.CandidateId = this.selectedmigrationRecords[0].CandidateId;
    //     modalRef.componentInstance.UserName = this.UserName;
    //     modalRef.componentInstance.CompanyId = this.CompanyId;

    //     modalRef.result.then((result) => {
    //         this.doRefresh();
    //     }).catch((error) => {
    //         console.log(error);

    //         this.doRefresh();
    //       });


    // }
    ReGenerate() {
        console.log(this.selectedmigrationRecords);

        this.router.navigate(['app/onboarding/regenerateLetter'], {
            queryParams: {
                "Idx": btoa(this.selectedmigrationRecords[0].CandidateId),
            }
        });

    }

    onSelectedPayrollRowsChanged(eventData, args) {
        if (Array.isArray(args.rows)) {
            console.log('checkbox selected');
        }

        // console.log('dataset', this.selectedemployeeRecords);

        this.selectedemployeeRecords = [];

        if (args != null && args.rows != null && args.rows.length > 0) {
            for (let i = 0; i < args.rows.length; i++) {
                var row = args.rows[i];
                var row_data = this.employeeDataView.getItem(row);
                this.selectedemployeeRecords.push(row_data);
            }
        }
        console.log('answer', this.selectedemployeeRecords);
    }

    separateEmployee() {
        if (this.selectedemployeeRecords.length > 1) {
            this.alertService.showWarning("Please choose only 1 employee");
        }

        let eLCTransaction: EmployeeLifeCycleTransaction;

        let employeeObject = this.selectedemployeeRecords[0];


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

        let employeeObject = this.selectedemployeeRecords[0];
        employeeObject["EmployeeId"] = employeeObject.Id;
        employeeObject["isResignation"] = this.isResignation;

        console.log("Resignation::", this.isResignation);

        this.router.navigate(['app/fnf/finalsettlement'], {
            queryParams: {
                "Odx": btoa(JSON.stringify(employeeObject)),
            }
        });
    }

}