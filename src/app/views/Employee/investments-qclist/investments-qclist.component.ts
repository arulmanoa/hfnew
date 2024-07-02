import { Component, OnInit, HostListener } from '@angular/core';
import { GridOption, Formatter, Column, Formatters, FieldType, AngularGridInstance, GridService, OnEventArgs } from 'angular-slickgrid';
import { EmployeeService, AlertService, SessionStorage } from 'src/app/_services/service';
import { CandidateListingScreenType } from 'src/app/_services/model/OnBoarding/CandidateListingScreenType';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ELCGrid } from 'src/app/_services/model/Employee/ELCGrid';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';

import { SessionKeys } from '../../../_services/configs/app.config';
import { WorkflowService } from 'src/app/_services/service/workflow.service';
import { dateFormatLocalStringAmPm } from 'src/app/utility-methods/utils';

@Component({
    selector: 'app-investments-qclist',
    templateUrl: './investments-qclist.component.html',
    styleUrls: ['./investments-qclist.component.css']
})
export class InvestmentsQclistComponent implements OnInit {

    // * Login Properties
    _loginSessionDetails: LoginResponses;
    UserId: any;
    RoleId: any;

    // * General Properties
    activeTabName: string;
    spinner: Boolean;
    readonly MODULEPROCESSTRANSACTIONID: string = "ModuleProcessTransactionId";

    // * Unclaimed Tab Properties
    unclaimedGridOptions: GridOption;
    unclaimedColumnDefinitions: Column[];
    unclaimedDataset: any;

    unclaimedList: any[] = [];
    unclaimedGridInstance: AngularGridInstance;
    unclaimedGrid: any;
    unclaimedGridService: GridService;
    unclaimedDataView: any;

    // * Claimed Tab Properties
    claimedGridOptions: GridOption;
    claimedColumnDefinitions: Column[];
    claimedDataset: any;
    claimedList: any[] = [];
    claimedGridInstance: AngularGridInstance;
    claimedGrid: any;
    claimedGridService: GridService;
    claimedDataView: any;
    selectedUnclaimedRecords: any[];

    customClaimFormatter: Formatter;
    IsExtraTabRequired: boolean = true;
    RoleCode: any;
    AlternativeText: any = 'Claimed';
    AlternativeText1: any = "Unclaimed";
    BusinessType: any;
    constructor(
        private employeeService: EmployeeService,
        private alertService: AlertService,
        private router: Router,
        private loadingScreenService: LoadingScreenService,
        private sessionService: SessionStorage,
        private workFlowApi: WorkflowService,

    ) { }
    dummy() {
        this.router.navigate(['app/investment'], {
            queryParams: {
                "Idx": btoa('15001'),
                "Cdx": btoa('15001'),
            }
        });
    }


    ngOnInit() {

        this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
        this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
        this.UserId = this._loginSessionDetails.UserSession.UserId;
        this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

        this.customClaimFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-thumb-up-outline" style="cursor:pointer"></i>` : '<i class="mdi mdi-thumb-up-outline" style="cursor:pointer"></i>';

        this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
        var LstCompanySettings = [];
        LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));
        if (LstCompanySettings != null && LstCompanySettings.length > 0) {

            LstCompanySettings = LstCompanySettings.filter(a => a.RoleCode == this.RoleCode);
            if (LstCompanySettings.length > 0) {
                var isExist = LstCompanySettings.find(z => z.ModuleName == 'InvestmentQcList');
                if (isExist != undefined) {
                    this.IsExtraTabRequired = isExist.IsExtraTabRequired;
                    this.AlternativeText = isExist.AlternativeText;
                    this.AlternativeText1 = isExist.AlternativeText1;

                }
            }
        }
        (this.AlternativeText == null || this.AlternativeText == '') ? "Claimed" : true;
        (this.AlternativeText1 == null || this.AlternativeText1 == '') ? "Unclaimed" : true;
        this.activeTabName = "claimed";
        this.initializeGrids();
    }

    //#region Inbucket Grid events
    claimedGridReady(angularGrid: AngularGridInstance) {
        this.claimedGridInstance = angularGrid;
        this.claimedDataView = angularGrid.dataView;
        this.claimedGrid = angularGrid.slickGrid;
        this.claimedGridService = angularGrid.gridService;
    }
    //#endregion
    //#region Unclaimed Grid events

    unClaimedGridReady(angularGrid: AngularGridInstance) {
        this.unclaimedGridInstance = angularGrid;
        this.unclaimedDataView = angularGrid.dataView;
        this.unclaimedGrid = angularGrid.slickGrid;
        this.unclaimedGridService = angularGrid.gridService;
    }

    //#endregion
    // first time and ra-load table data's from API calls

    initializeGrids() {
        //  this.loadingScreenService.startLoading();

        this.claimedColumnDefinitions = [];
        this.claimedGridOptions = {
            asyncEditorLoading: false,
            autoResize: {
                containerId: 'grid-container',
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
                selectActiveRow: true
            },
            checkboxSelector: {
                hideSelectAllCheckbox: true
            },
            datasetIdPropertyName: "Id"
        };
        this.claimedColumnDefinitions = [

            {
                id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode',
                sortable: true,
                type: FieldType.string,
                filterable: true
            },

            {
                id: 'Employee', name: 'Employee Name', field: 'EmployeeName',
                sortable: true,
                type: FieldType.string,
                filterable: true
            },
            {
                id: 'RequestedFor', name: 'Requested For', field: 'RequestedFor',
                sortable: true,
                type: FieldType.string,
                filterable: true

            },
            {
                id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
                formatter: dateFormatLocalStringAmPm,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'SlotClosureDate', name: 'Slot Closure Date', field: 'SlotClosureDate',
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
                type: FieldType.string,
                // onCellClick: (e: Event, args: OnEventArgs) => {
                //     console.log(args.dataContext);
                //     let navigationExtras: NavigationExtras = {
                //         queryParams: {
                //             "id": args.dataContext.Id,
                //         }
                //     };
                //     this.router.navigate(['app/investment/investmentVerification'], {
                //         queryParams: {
                //             "Idx": btoa(args.dataContext.Id),
                //             "Cdx": btoa(args.dataContext.EmployeeId),
                //         }
                //     });
                // }
            },
            {
                id: 'edit',
                field: 'Id',
                excludeFromHeaderMenu: true,
                formatter: Formatters.editIcon,
                minWidth: 30,
                maxWidth: 30,

                onCellClick: (e: Event, args: OnEventArgs) => {
                    console.log(args.dataContext);
                    let navigationExtras: NavigationExtras = {
                        queryParams: {
                            "id": args.dataContext.Id,
                        }
                    };
                    this.router.navigate(['app/investment/investmentVerification'], {
                        queryParams: {
                            "Idx": btoa(args.dataContext.Id),
                            "Cdx": btoa(args.dataContext.EmployeeId),
                        }
                    });
                }
                
                // use onCellClick OR grid.onClick.subscribe which you can see down below
                // onCellClick: (e: Event, args: OnEventArgs) => {
                //     console.log(args.dataContext);
                //     let navigationExtras: NavigationExtras = {
                //         queryParams: {
                //             "id": args.dataContext.Id,
                //         }
                //     };
                //     // if (args.dataContext.RequestedFor == "Investment Proof") {
                //     //     this.router.navigate(['app/exemptions_qc'], {
                //     //         queryParams: {
                //     //             "Idx": btoa(args.dataContext.Id),
                //     //             "Cdx": btoa(args.dataContext.EmployeeId),
                //     //         }
                //     //     });
                //     // }
                //     // else{
                //     try {


                //         this.router.navigate(['app/onboardingqc/investmentqc'], {
                //             queryParams: {
                //                 "Idx": btoa(args.dataContext.Id),
                //                 "Cdx": btoa(args.dataContext.EmployeeId),
                //             }
                //         });
                //     } catch (error) {
                //         console.log('sd', error);

                //     }

                //     // }

                //     // this.router.navigate(['action-selection'], { state: { example: 'bar' } });

                //     //   this.selectedTemplates = [];
                //     //   this.selectedTemplates.push(args.dataContext);
                //     //   this.editTemplate(false);
                // }
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
                selectActiveRow: true
            },
            checkboxSelector: {
                // remove the unnecessary "Select All" checkbox in header when in single selection mode
                hideSelectAllCheckbox: false
            },
            datasetIdPropertyName: "Id"
        };

        this.unclaimedColumnDefinitions = [

            {
                id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode',
                sortable: true,
                type: FieldType.string,
                filterable: true
            },

            {
                id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName',
                sortable: true,
                type: FieldType.string,
                filterable: true

            },
            {
                id: 'Requested For', name: 'Requested For', field: 'RequestedFor',
                sortable: true,
                type: FieldType.string,
                filterable: true

            },
            {
                id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
                formatter: Formatters.dateIso,
                sortable: true,
                type: FieldType.date
            },
            {
                id: 'SlotClosureDate', name: 'Slot Closure Date', field: 'SlotClosureDate',
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
                    console.log(args.dataContext);
                    let navigationExtras: NavigationExtras = {
                        queryParams: {
                            "id": args.dataContext.Id,
                        }
                    };
                    this.selectedUnclaimedRecords = [];
                    this.selectedUnclaimedRecords.push(args.dataContext.Id);
                    this.claimRequest();
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

        this.loadUnClaimedRecords(true);

    }

    //#endregion
    loadData(event) {
        if (event.nextId == "unclaimed") {
            this.loadUnClaimedRecords(false);
        } else if (event.nextId == "claimed") {
            this.loadUnClaimedRecords(true);

        }
        this.activeTabName = event.nextId;
    }

    loadUnClaimedRecords(isClaimed: boolean) {
        console.log("inside load unclaimed");
        this.spinner = true;
        // this.unclaimedDataset = this.mockData(999);
        let screenType = isClaimed == true ? CandidateListingScreenType.Pending : CandidateListingScreenType.Team;
        this.employeeService.GetInvestmentProofList(screenType, 3, null).subscribe(
            // this.employeeService.GetInvestmentProofList(5, 3, null).subscribe(
            (data) => {

                let apiResult: apiResult = data;
                console.log(apiResult);
                if (apiResult.Status) {
                    if (apiResult.Result != "") {
                        isClaimed == true ? this.claimedList = JSON.parse(apiResult.Result) : this.unclaimedList = JSON.parse(apiResult.Result);
                        isClaimed == true ? this.claimedList = JSON.parse(apiResult.Result) : this.unclaimedDataset = this.unclaimedList;
                        // console.log(this.unclaimedDataset);
                        if (this.BusinessType != 3 && this.claimedList.length > 0) {
                            this.claimedList = this.claimedList.filter(a => a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")) && a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
                        }
                        if (this.BusinessType != 3 && this.unclaimedDataset != null && this.unclaimedDataset.length > 0) {
                            this.unclaimedDataset = this.unclaimedDataset.filter(a => a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")) && a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
                        }

                        this.spinner = false;
                    } else {
                        this.spinner = false;
                        this.alertService.showInfo("No Data to show");
                    }

                } else {
                    this.spinner = false;
                    this.alertService.showWarning("Could not get records");
                }
            },
            (error) => {
                this.spinner = false;
                this.alertService.showWarning("Error occured while Fetching details!");
            }
        );

        // this.unclaimedDataset = [{"ClientId":1976,"ClientName":"Property Guru","ClientContractId":418,"ClientContractCode":"SME_Demo","EmployeeId":15478,"EmployeeCode":"11225","EmployeeName":"Vivek Kumar Sharma ","RequestedFor":"Investment Proof","RequestedOn":"2021-12-23T05:56:59.307","ActionType":0,"TransactionRemarks":"","RequestedCreatedon":"2021-12-22T13:04:22.147","RequestedBy":"Vivek Kumar Sharma","Status":"Investment Request Awaiting QcResponse","PendingAtDisplayName":"","PendingAtUserId":0,"InitiatorUserId":17155,"PendingAtRoleId":3,"ProcessstatusId":29300,"Id":473,"Transactionstatus":2,"PendingAtGroupId":6,"SlotClosureDate":"2021-08-21T00:00:00"}];
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
        this.customClaimFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
            value ? `<i class="mdi mdi-thumb-up-outline" style="cursor:pointer"></i>` : '<i class="mdi mdi-thumb-up-outline" style="cursor:pointer"></i>';
        this.initializeGrids();
    }

    claimRequest() {
        console.log("in claim request button");
        console.log(this.selectedUnclaimedRecords);

        if (this.selectedUnclaimedRecords == undefined ||
            this.selectedUnclaimedRecords == null ||
            this.selectedUnclaimedRecords.length == 0) {
            this.alertService.showWarning('No request selected to Claim');
            return;
        }

        this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to claim the selected request(s)', "Yes, Continue").then(result => {
            this.loadingScreenService.startLoading();
            try {

                this.spinner = true;
                var param = { ModuleProcessTransactionIds: this.selectedUnclaimedRecords, UserId: this.UserId };
                console.log('param', param);

                this.workFlowApi.UpdatePendingAtUserId(JSON.stringify(param)).subscribe((data) => {
                    if (data != null && data != undefined && data.Status) {
                        this.unclaimedList = this.unclaimedList.filter(x => data.Result.ModuleProcessTransactionIds.find(y => y == x.ModuleProcessTransactionId) == null);
                        this.unclaimedDataset = null;
                        this.unclaimedDataset = this.unclaimedList;

                        this.alertService.showSuccess("Requests claimed successfully");
                        this.activeTabName = 'claimed';

                        this.spinner = false;
                        this.loadUnClaimedRecords(true);

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
    }
}
