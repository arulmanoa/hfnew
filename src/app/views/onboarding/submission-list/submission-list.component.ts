import { Component, OnInit, ElementRef, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
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
import { OnboardingGrid } from '../../../_services/model/OnboardingGrid.model';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
import { AlertService } from '../../../_services/service/alert.service';
import Swal, { SweetAlertOptions } from "sweetalert2";
import { LoadingScreenService } from '../../../shared/components/loading-screen/loading-screen.service';
import { SearchService } from '../../../_services/service/search.service';
import { HeaderService } from '../../../_services/service/header.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { EmployeeTransitionGroup, CandidateEmployeeMigration, _EmployeeTransitionGroup, _CandidateEmployeeMigration, MigrationResult } from '../../../_services/model/Migrations/Transition';
import { WorkFlowInitiation, UserInterfaceControlLst } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { TransitionService } from '../../../_services/service/transition.service';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { find, pull } from 'lodash';
import { CandidateModel, _CandidateModel } from '../../../_services/model/Candidates/CandidateModel';
import { CandidateDetails } from 'src/app/_services/model/Candidates/CandidateDetails';
import { DomSanitizer } from '@angular/platform-browser';
import { IfStmt } from '@angular/compiler';
import { Tree } from '@angular/router/src/utils/tree';
import * as moment from 'moment';
import { environment } from "../../../../environments/environment";
import { PayPeriodList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { Action } from 'rxjs/internal/scheduler/Action';
import { OnboardingExtendedDetailsComponent } from '../shared/modals/onboarding-extended-details/onboarding-extended-details.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeService, FileUploadService } from '@services/service';
import * as JSZip from 'jszip'; //JSZip
import { NzDrawerService } from 'ng-zorro-antd';
import { ViewOnboardingProcessLogsComponent } from 'src/app/shared/modals/view-onboarding-process-logs/view-onboarding-process-logs.component';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RequestType } from '@services/model/Candidates/CandidateOfferDetails';


const highlightingFormatter = (row, cell, value, columnDef, dataContext) => {
  if (value) {
    let res = calculateDiff(dataContext.ActualDateOfJoining)
    if (res <= 2) {
      return `<div style="color:red;">${value}</div>`;
    }
    else if (res >= 3 && res <= 5) {
      return `<div style="color:orange;">${value}</div>`;
    } else {
      return `<div style="color:green;">${value}</div>`;
    }

  }
};

export function calculateDiff(dateSent) {
  let currentDate = new Date();
  dateSent = new Date(dateSent);
  return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
}

@Component({
  selector: 'app-submission-list',
  templateUrl: './submission-list.component.html',
  styleUrls: ['./submission-list.component.css']
})
export class SubmissionListComponent implements OnInit, OnDestroy {
  searchGridInstance: AngularGridInstance;
  searchGrid: any;
  searchGridService: GridService;
  searchDataView: any;
  _loginSessionDetails: LoginResponses;
  searchColumnDefinitions: Column[];
  searchGridOptions: GridOption;
  searchDataset = [];
  selectedmigrationRecords: any[];
  searchList: OnboardingGrid[];
  UserId: any;
  UserName: any;
  RoleId: any;
  CompanyId: any;
  ImplementationCompanyId: any;
  tblminDate: Date;
  spinner: boolean = false;
  userAccessControl;
  isSuccessMigration: boolean = false;
  ALRemarks: any;
  iframeContent: any;
  ReleaseAlTyp: any;
  previewFormatter: Formatter;
  ActionFormatter: Formatter;
  TeamList: any;
  EffectivePayPeriodList: PayPeriodList[] = []
  MinDate: any;
  MaxDate: any;
  EndDateMinDate: any;
  LstCandidateEmployeeMigration: CandidateEmployeeMigration[] = [];
  TransitionGroup: EmployeeTransitionGroup = new EmployeeTransitionGroup();
  accessControl_Migration: UserInterfaceControlLst = new UserInterfaceControlLst;


  isALReleaseBtn: boolean = false;
  BusinessType: any;
  clientLogoLink: any;
  clientminiLogoLink: any;
  // only for CC email address book input ccmailtags
  @ViewChild('tagInput') tagInputRef: ElementRef;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;
  ccemail: any;
  isCCMailError: boolean = false;

  candidateModel: CandidateModel = new CandidateModel();
  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  modalOption: NgbModalOptions = {};

  showCandidateLetterTransaction: boolean = false;

  approvalForLabels = {
    1: 'OL',
    2: 'AL',
    3: 'MinimumWages Non Adherence',
    4: 'Candidate Joining Confirmation',
    5: 'Others',
    6: 'ELC',
    7: 'Request For New DOJ',
    8: 'Contract Letter',
    9: 'Evaluation Sheet',
  };

  relationshipLabels = {
    1: 'Father',
    2: 'Mother',
    3: 'Spouse',
    4: 'Son',
    5: 'Daughter',
    6: 'Guardian',
    7: 'Father-in-law',
    8: 'Mother-in-law',

  };

  contentmodalurl: any = null;
  contentmodalDocumentId: any = 0;
  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  documentURL: any;

  LstEmployeeDesignation = [];
  LstEmployeeDepartment = [];
  ConvertToEmployeeText: string = environment.environment.hasOwnProperty('ConvertToEmployeeText') ? environment.environment.ConvertToEmployeeText : "Release Letter";
  private unsubscribe$: Subject<void> = new Subject<void>();
  BlackListReasons = [];
  blacklistedEmployeeRemarks: string = "";
  btnBlacklistspinner: boolean = false;

  constructor(
    private onboardingApi: OnboardingService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    public searchService: SearchService,
    private headerService: HeaderService,
    private router: Router,
    public sessionService: SessionStorage,
    public transitionService: TransitionService,
    private sanitizer: DomSanitizer,
    private onboardingService: OnboardingService,
    private modalService: NgbModal,
    private fileUploadService: FileUploadService,
    private drawerService: NzDrawerService,
    private employeeService: EmployeeService,
    private cd: ChangeDetectorRef
  ) {

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
  }

  ngOnInit() {
    this.headerService.setTitle('Submission List');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.accessControl_Migration = this.userAccessControl.filter(a => a.ControlName == "btnMigrate");
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
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

    console.log('userId', this.UserId);
    this.tblminDate = new Date();
    this.setSearchGridColumns();

    this.initial_getSubmisionList_load();

  }
  initial_getSubmisionList_load() {
    this.spinner = true;
    this.onboardingApi.getOnboardingSubmissionListInfo(this.RoleId).subscribe((data) => {

      let apiResult: apiResult = data;
      if (apiResult.Result != "") {
        this.searchList = JSON.parse(apiResult.Result);
        this.searchDataset = this.searchList;
        console.log(this.searchDataset);
        this.spinner = false;
        this.searchDataset.forEach(element => {
          element["OfferStatus"] = element.OfferStatus == 0 ? "In-Active" : "Active";

        });
        if (this.BusinessType != 3 && this.searchDataset.length > 0) {
          this.searchDataset = this.searchDataset.filter(a => a.ClientContractId == Number(this.sessionService.getSessionStorage("default_SME_ContractId")))
        }



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

  searchGridReady(angularGrid: AngularGridInstance) {
    this.searchGridInstance = angularGrid;
    this.searchDataView = angularGrid.dataView;
    this.searchGrid = angularGrid.slickGrid;
    this.searchGridService = angularGrid.gridService;

  }

  setSearchGridColumns() {

    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {
      // console.log(this.searchDataset);
      // console.log(this.searchDataset.find(x=>x.Id === parseInt(value)));
      // console.log(this.searchDataset.find(x=>x.Id == parseInt(value)));
      // console.log(this.searchDataset.find(x=>x.Id.toString() == value.toString()));

      if (this.searchDataset.find(x => x.Id === parseInt(value)).Status == 'Ready to Migrate' || this.searchDataset.find(x => x.Id === parseInt(value)).Status == 'Migration Failed') {
        return (value ? `<i class="mdi mdi-eye" style="cursor:pointer" title="Preview"></i>` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>');
      }

      return '';
    }
    this.ActionFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {
      if (this.searchDataset.find(x => x.Id === parseInt(value)).Status == 'Ready to Migrate') {
        return (value ? `<i class="mdi mdi-pencil" style="cursor:pointer" title="Action Edit"></i>` : '<i class="mdi mdi-pencil" style="cursor:pointer"></i>');
      }

      return '';
    }
    this.searchColumnDefinitions = [
      {
        id: 'Candidate', name: 'Candidate Name', field: 'CandidateName',
        sortable: true,
        type: FieldType.string,
        formatter: highlightingFormatter,
        filterable: true,

      },

      // {
      //     id: 'CandidateId', name: 'CandidateId', field: 'Id',
      //     sortable: true,
      //     type: FieldType.number,

      // },    
      //   {
      //     id: 'Contract', name: 'Contract', field: 'ContractName',
      //     sortable: true,
      //     type: FieldType.string,
      //     filterable: true, 

      // },     

      {
        id: 'Mobile', name: 'Mobile', field: 'PrimaryMobile',
        sortable: true,
        formatter: highlightingFormatter,
        type: FieldType.number

      },
      // {
      //     id: 'RequestedFor', name: 'Requested For', field: 'RequestedFor',
      //     sortable: true,
      //     type: FieldType.string,
      //     filterable: true, 

      // },
      // {
      //     id: 'RequestedOn', name: 'Requested On', field: 'RequestedOn',
      //     formatter: Formatters.dateIso,
      //     sortable: true,
      //     type: FieldType.date
      // },
      {
        id: 'ActualDateOfJoining', name: 'Date of Joining (DOJ)', field: 'ActualDateOfJoining',
        //   formatter: Formatters.dateIso,
        formatter: Formatters.multiple,
        params: {
          // list of Formatters (the order is very important)
          formatters: [Formatters.dateIso, highlightingFormatter],
        },
        sortable: true,
        type: FieldType.date
      },
      {
        id: 'Status', name: 'Status', field: 'Status',
        sortable: true,
        formatter: highlightingFormatter,
        type: FieldType.string,
        filterable: true,
      },
      // {
      //     id: 'OfferStatus', name: 'OfferStatus', field: 'OfferStatus',
      //     sortable: true,
      //     type: FieldType.number
      // },
      {
        id: 'PendingAt', name: 'Pending At', field: 'PendingAt',
        sortable: true,
        type: FieldType.string,
        formatter: highlightingFormatter,
        filterable: true,
      },
      {
        id: 'preview',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.multiple,
        params: {
          // list of Formatters (the order is very important)
          formatters: [this.previewFormatter, highlightingFormatter],
        },
        // params: { options: optionList },
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {

          console.log(args.dataContext);
          if (args.dataContext.Status != 'Ready to Migrate') {
            return;
          }
          this.previewLetter(args.dataContext);

        }
      },
      {
        id: 'Action',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.multiple,
        params: {
          // list of Formatters (the order is very important)
          formatters: [this.ActionFormatter, highlightingFormatter],
        },
        // params: { options: optionList },
        minWidth: 30,
        maxWidth: 30,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {

          console.log(args.dataContext);
          if (args.dataContext.Status != 'Ready to Migrate') {
            return;
            //this.acctionEdit(args.dataContext);
          }
          if (args.dataContext.ClientId == 1988) {
            return;
            //this.acctionEdit(args.dataContext);
          }
          this.acctionEdit(args.dataContext);

        }
      },


    ];
    let staffingObject = [
      {
        id: 'Client', name: 'Client', field: 'ClientName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },

    ];
    this.BusinessType == 3 ? (this.searchColumnDefinitions = staffingObject.concat(this.searchColumnDefinitions as any)) : true;


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
      enablePagination: true,
      pagination: {
        pageSizes: [10, 15, 25, 50, 75, 100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      },
      presets: {
        pagination: { pageNumber: 1, pageSize: 15 },
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"
    };

    // this.searchDataView.getItemMetadata = metadata(this.searchDataView.getItemMetadata);

    // function metadata(old_metadata) {
    //   return function(row) {
    //     var item = this.getItem(row);
    //     var meta = old_metadata(row) || {};

    //     if (item) {
    //       // Make sure the "cssClasses" property exists
    //       meta.cssClasses = meta.cssClasses || '';

    //       if (item.canBuy) {                    // If the row object has a truthy "canBuy" property
    //         meta.cssClasses += ' buy-row';      // add a class of "buy-row" to the row element.
    //       } // Note the leading ^ space.

    //       if (item.qty < 1) {                   // If the quantity (qty) for this item less than 1
    //         meta.cssClasses += ' out-of-stock'; // add a class of "out-of-stock" to the row element.
    //       }

    //    /* Here is just a random example that will add an HTML class to the row element
    //       that is the value of your row's "rowClass" property. Be careful with this as
    //       you may run into issues if the "rowClass" property isn't a string or isn't a
    //       valid class name. */
    //       if (item.rowClass) {
    //         var myClass = ' '+item.rowClass;
    //         meta.cssClasses += myClass;
    //       }
    //     }

    //     return meta;
    //   }
    // }



  }

  acctionEdit(obj) {
    this.releaseAL(obj, 'S');
    this.EndDateMinDate = new Date(obj.ActualDateOfJoining);
  }
  // onCellClicked(e, args) {

  //     const metadata = this.searchGridInstance.gridService.getColumnFromEventArguments(args);
  //     console.log('meta',metadata.dataContext);

  // }

  onSelectedRowsChanged(data, args) {
    // const metadata = this.searchGridInstance.gridService.getColumnFromEventArguments(data);
    console.log('selecteddata', args);
    console.log('selected', data);
    console.log('selected2', this.searchList);

    //   var row = this.searchDataView.getItem(5);
    //   console.log('row', row);



    //   this.searchDataset.forEach(element => {

    //     element.rowClass = 'highlight';
    //     // this.searchDataView.updateItem(element.id, element);
    //     this.searchGridInstance.gridService.updateDataGridItemById(element.Id, element, true, true);


    //   });
    //   data.getItemMetadata = function (row) {
    // alert('ss');
    //     console.log('ROW :', row);

    //     if (this[row].Id == 104195){
    //         return {
    //             cssClasses: 'highlight'

    //         };

    //     }
    //     return null;

    // }

    this.selectedmigrationRecords = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      console.log('length ar', args.rows.length);
      for (let i = 0; i < args.rows.length; i++) {
        console.log('element4', args.rows)
        var row = args.rows[i];

        var row_data = this.searchDataView.getItem(row);
        this.selectedmigrationRecords.push(row_data);

      }
    }

    console.log('answer', this.selectedmigrationRecords);
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
        let request_params = `moduletransactionId=${item[0].ModuletransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

        this.searchService.updateClaimOnBoardRequest(request_params).subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading()
            this.alertService.showSuccess(apiResult.Message);
            //this.searchData();

          }
        })
      })
    })

      .catch(error => this.loadingScreenService.stopLoading());


  }

  revise_offer(item) {

    if (this.selectedmigrationRecords.length > 1) {
      this.alertService.showWarning("Sorry! Please select only one candidate to make an offer");
      this.loadingScreenService.stopLoading();
    }
    else {
      this.loadingScreenService.startLoading();
      let request_params = `candidateId=${item[0].Id}`;
      this.searchService.getValidToMakeOffer(request_params).subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Message != '') {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
          this.alertService.confirmSwal("Are you sure you want to cancle and make an offer?", `This action will cancel the existing offer and allow you to make a submit a new request.${apiResult.Message}`, "Yes, Continue").then(result => {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: true
            })



            let jsonStr = null;
            this.loadingScreenService.startLoading();
            let request_params = `moduletransactionId=${item[0].ModuletransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

            this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
              let apiResult: apiResult = result;
              if (apiResult.Status) {
                this.loadingScreenService.stopLoading()

                // this.make_an_offer(item);
                //  this.headerService.checkNewTransfer("");
                //  this.headerService.checkNewTransfer(true);

                this.headerService.doCheckRedoOffer(false);
                this.headerService.doCheckRedoOffer(true);

                this.loadingScreenService.stopLoading();
                const _Id = 0;
                this.router.navigate(['app/onboarding/onboarding_revise'], {
                  queryParams: {
                    "Idx": btoa(item[0].ModuletransactionId),
                    "Cdx": btoa(item[0].Id),
                  }
                });
              }
            })
            // })
          })

            .catch(error => this.loadingScreenService.stopLoading());


        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.confirmSwal("Are you sure you want to make an offer?", `This action will cancel the existing offer and allow you to make a submit a new request.`, "Yes, Continue").then(result => {
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: true
            })


            let jsonStr = null;
            this.loadingScreenService.startLoading();
            let request_params = `moduletransactionId=${item[0].ModuletransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;

            this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
              let apiResult: apiResult = result;
              if (apiResult.Status) {
                this.loadingScreenService.stopLoading()

                //  this.make_an_offer(item);
                // this.headerService.checkNewTransfer("");
                // this.headerService.checkNewTransfer(true);

                this.headerService.doCheckRedoOffer(false);
                this.headerService.doCheckRedoOffer(true);

                this.loadingScreenService.stopLoading();
                const _Id = 0;
                this.router.navigate(['app/onboarding/onboarding_revise'], {
                  queryParams: {
                    "Idx": btoa(item[0].ModuletransactionId),
                    "Cdx": btoa(item[0].Id),
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
  }
  ValidateCandidateToCancelOffer(item) {
    const promise = new Promise((resolve, reject) => {
      let request_params = `moduletransactionId=${item[0].ModuletransactionId}`;
      this.searchService.ValidateCandidateToCancelOffer(request_params).subscribe((result) => {
        var res = result as apiResult;
        const answer = JSON.parse(res.Result);
        answer[0].IsValidForCancel == true ? resolve(true) : resolve(false);

      })
    });
    return promise;
  }


  cancel_offer(item) {
    if (this.selectedmigrationRecords.length > 1) {
      this.alertService.showWarning("Sorry! Please select only one candidate to cancle the offer");
      //   this.alertService.showInfo("Hi there!, Changes you made may not be valid, please recalcute");

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



          this.ValidateCandidateToCancelOffer(item).then((response) => {
            if (response == true) {
              let request_params = `moduletransactionId=${item[0].ModuletransactionId}&remarks=${jsonStr}&userId=${this.UserId}&roleId=${this.RoleId}`;
              this.searchService.updateVoidOnBoardRequest(request_params).subscribe((result) => {
                let apiResult: apiResult = result;
                if (apiResult.Status) {
                  this.loadingScreenService.stopLoading()
                  this.alertService.showSuccess(apiResult.Message);
                  this.initial_getSubmisionList_load();
                  this.selectedmigrationRecords = [];

                }
              })
            } else {
              this.alertService.showWarning('This action was blocked. The selected candidate which is not a valid status for cancel the offer.');
              this.loadingScreenService.stopLoading()
            }
          });




        })
      })

        .catch(error => this.loadingScreenService.stopLoading());
    }

  }
  public utcDateTime: any;

  getteamDropDownList(obj) {
    const promise = new Promise((resolve, reject) => {
      this.LstEmployeeDepartment = [];
      this.LstEmployeeDesignation = [];
      this.loadingScreenService.startLoading();
      this.onboardingService.getMigrationMasterInfo(obj.ClientContractId).subscribe((result) => {
        let apiResult: apiResult = (result);
        this.loadingScreenService.stopLoading();
        if (apiResult.Status && apiResult.Result != null) {

          this.TeamList = JSON.parse(apiResult.Result);
          this.LstEmployeeDepartment = this.TeamList && this.TeamList.length > 0 ? this.TeamList[0].LstEmployeeDepartment : [];
          this.LstEmployeeDesignation = this.TeamList && this.TeamList.length > 0 ? this.TeamList[0].LstEmployeeDesignation : [];
          this.updateDesignationAndDepartment(obj);
          console.log('TeamList', this.TeamList);
          this.onChangeTeam(obj);

          resolve(true);
        }
      }), ((error) => {

      })
    })
    return promise;
  }
  onChangeTeam(item) {
    item.TeamId ? item.TeamId = item.TeamId : item.TeamId = item.Id;
    this.EffectivePayPeriodList = [];
    console.log(item);
    let filterList = this.TeamList.find(a => a.Id == item.TeamId);
    this.EffectivePayPeriodList = filterList.PayPeriodList;
  }

  updateDesignationAndDepartment(obj) {
    console.log('obj', obj);

    obj.DesignationId > 0 && (obj.Designation == '' || obj.Designation == null) ? obj.Designation = this.LstEmployeeDesignation.length > 0 ? this.LstEmployeeDesignation.find(a => a.Id == obj.DesignationId).Name : '' : true;

    obj.DepartmentId > 0 && obj.DepartmentId == '' || obj.DepartmentId == null ? obj.Department = this.LstEmployeeDepartment.length > 0 ? this.LstEmployeeDepartment.find(a => a.Id == obj.DepartmentId).Name : '' : true;




  }

  onChangeCommon(event, item = null, type = "") {

    if (type == 'Designation') {
      item.Designation = this.LstEmployeeDesignation.find(a => a.Id == event.Id).Name;
    }
    if (type == 'Department') {
      item.Department = this.LstEmployeeDepartment.find(a => a.Id == event.Id).Name;
    }
  }
  async releaseAL(obj, typ) {
    this.ReleaseAlTyp = typ;


    if (this.ReleaseAlTyp == 'S') {
      this.selectedmigrationRecords = [];
      this.selectedmigrationRecords.push(obj);
    }


    let isValidToRelease: boolean = true;
    for (let i = 0; i < this.selectedmigrationRecords.length; i++) {
      const element = this.selectedmigrationRecords[i];
      if (!['Ready to Migrate', 'Employee Transition Completed', 'Migration Failed', 'OnbOpsSubmittedMigrationRequest'].includes(element.Status)) {
        this.alertService.showWarning('The action was blocked. One or more candidate items cannot be released because the status is in an invalid state.');
        isValidToRelease = false;
        break;

      }
    }

    if (isValidToRelease == true) {

      //this.disableBtn = false;
      var currentDate = new Date();
      var Non_EsicDate_backward = moment(currentDate).subtract(environment.environment.ActualDOJminDate, 'days');
      var Non_EsicDate_forward = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days');

      var EsicDate_backward = moment(currentDate).subtract(environment.environment.ActualDOJminDate_withESIC, 'days');
      var EsicDate_forward = moment(currentDate).add(environment.environment.ActualDOJmaxDate, 'days');


      console.log(moment(EsicDate_backward).format('YYYY-MM-DD'));
      console.log(moment(EsicDate_forward).format('YYYY-MM-DD'));

      console.log(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
      console.log(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));
      let isBetween: boolean = true;

      for (let index = 0; index < this.selectedmigrationRecords.length; index++) {
        const element = this.selectedmigrationRecords[index];
        let formattedADOJ = moment(element.ActualDateOfJoining).format('YYYY-MM-DD')
        if (element.Esicvalue > 0) {
          isBetween = moment(formattedADOJ).isBetween(moment(EsicDate_backward).format('YYYY-MM-DD'), moment(EsicDate_forward).format('YYYY-MM-DD')); // true
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(EsicDate_backward).format('YYYY-MM-DD')) : null;
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(EsicDate_forward).format('YYYY-MM-DD')) : null;
          if (!isBetween) {
            break;
          }
          this.MinDate = new Date(moment(EsicDate_backward).format('YYYY-MM-DD'));
          this.MaxDate = new Date(moment(EsicDate_forward).format('YYYY-MM-DD'));
        }
        else {
          this.MinDate = new Date(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
          this.MaxDate = new Date(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));
          isBetween = moment(formattedADOJ).isBetween(moment(Non_EsicDate_backward).format('YYYY-MM-DD'), moment(Non_EsicDate_forward).format('YYYY-MM-DD')); // true
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(Non_EsicDate_backward).format('YYYY-MM-DD')) : null;
          isBetween == false ? isBetween = moment(formattedADOJ).isSame(moment(Non_EsicDate_forward).format('YYYY-MM-DD')) : null;
          if (!isBetween) {
            break;
          }
        }
      }

      if (!isBetween) {
        this.alertService.showWarning("Migration time has been closed. Please contact support admin.");
        return;
      }


      // let A = moment(currentDate).format('YYYY-MM-DD');
      // if (this.selectedmigrationRecords.filter(z => z.Esicvalue > 0 && moment(z.ActualDateOfJoining).format('YYYY-MM-DD') < A).length > 0) {
      //     this.alertService.showWarning("Migration time has been closed. Please contact support admin.");
      //     return;
      // }

      this.selectedmigrationRecords = this.selectedmigrationRecords.filter(a => a.Id);
      if (this.selectedmigrationRecords.length != 0) {

        $('#popup_release_AL').modal({
          backdrop: 'static',
          keyboard: false,
          show: true
        });

        this.selectedmigrationRecords.forEach(element => {

          element["Message"] = null;
          element["Status"] = null;
          element["ccmailtags"] = new Array();
          element.ccmailtags = element.CCMails != null && element.CCMails != "" && element.CCMails != undefined ? element.CCMails.split(",") : [];
          element.DesignationId = element.DesignationId == '' || element.DesignationId == 0 ? null : element.DesignationId;
          element.DepartmentId = element.DepartmentId == '' || element.DepartmentId == 0 ? null : element.DepartmentId;
          element.EffectivePayPeriodId = element.EffectivePayPeriodId == '' || element.EffectivePayPeriodId == 0 ? null : element.EffectivePayPeriodId;
          element.TeamId = element.TeamId == '' || element.TeamId == 0 ? null : element.TeamId;


        });


      }
      else {
        this.alertService.showWarning("Please select at least one candidate for transition from the list    ");
      }

      if (this.ReleaseAlTyp == 'S' || this.BusinessType == 1) {
        await this.getteamDropDownList(this.selectedmigrationRecords[0]);
      }
    }
  }

  // Get_CandidateRecord(selectedmigrationRecords) {

  //     let req_param_uri = `Id=${selectedmigrationRecords[0].Id}&userId=${this.UserId}&UserName=${this.UserName}`;
  //     this.onboardingService.getCandidate(req_param_uri).subscribe((data: any) => {

  //         let apiResponse: apiResponse = data;
  //         if (apiResponse.Status) {

  //             console.log('api', apiResponse);

  //         }
  //     });
  // }

  modal_dismiss() {

    this.isSuccessMigration = false;
    this.ALRemarks = null;
    $('#popup_release_AL').modal('hide');
    this.initial_getSubmisionList_load();
    this.selectedmigrationRecords = [];

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

  confirmRelease(myString) {


    const fieldMappings = {
      'Department': 'Department',
      'DepartmentId': 'Department',
      'Designation': 'Designation',
      'DesignationId': 'Designation',
      'TeamId': 'Team',
      'EffectivePayPeriodId': 'Effective Pay Period',
      'ActualDateOfJoining': 'Actual Date Of Joining'
    };

    for (let i = 0; i < this.selectedmigrationRecords.length; i++) {
      const element = this.selectedmigrationRecords[i];

      if (this.doShowAdditionalFieldsForEmployeeConfirmation(element)) {
        for (const fieldName of Object.keys(fieldMappings)) {
          const fieldValue = element[fieldName];

          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            const displayFieldName = fieldMappings[fieldName];
            this.alertService.showWarning(`Please enter the ${displayFieldName}. This field is required.`);
            return;
          }
        }
      }

    }

    if (this.ALRemarks == undefined || this.ALRemarks == null || this.ALRemarks == '') {
      this.alertService.showWarning("Please enter the remarks. This field is required ");
      return;
    }

    this.loadingScreenService.startLoading();
    this.LstCandidateEmployeeMigration = [];
    this.TransitionGroup.Remarks = this.ALRemarks;
    this.selectedmigrationRecords.forEach(element => {

      // if (this.BusinessType == 1 && environment.environment.NotRequiredClientIdsForMigrationAdditionalColumns.includes(element.ClientId) && this.TeamList.length > 0) {
      //   // const team = this.TeamList.find(a => a.Id == (element.CategoryCode.toUpperCase().toString() == 'Executive') ? 633 : 634);
      //   // element.TeamId = team.Id;
      //   // const payperiodList = team.PayPeriodList;
      //   // if (team.PayPeriodList.length > 0) {
      //   //   element.EffectivePayPeriodId = this.getDateOfJoiningPeriod(element.ActualDateOfJoining, team.PayPeriodList);
      //   // }
      // }

      var tmpWorkflowInitiation: WorkFlowInitiation = new WorkFlowInitiation();

      tmpWorkflowInitiation.Remarks = "";
      tmpWorkflowInitiation.EntityId = element.Id;
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
        CandidateId: element.Id,
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

    console.log(this.LstCandidateEmployeeMigration);
    console.log(JSON.stringify(this.TransitionGroup));
    // this.loadingScreenService.stopLoading();
    // return;
    if (this.BusinessType == 1) {
      this.editAndSaveMigrationData("Migration");

    } else {
      this.operateSecondApiCall();
    }

    // this.transitionService.putEmployeeTransition(JSON.stringify(this.TransitionGroup)).subscribe((response) => {

    //   console.log(response);
    //   try {

    //     let apiResult: apiResult = response;
    //     if (apiResult.Status && apiResult.Result != "") {
    //       this.alertService.showSuccess(apiResult.Message);
    //       const MigrationResult: MigrationResult = (apiResult.Result) as any;

    //       MigrationResult.LstCandidateEmployeeMigration.forEach(element => {

    //         this.selectedmigrationRecords.forEach(e => {

    //           if (e.Id == element.CandidateId) {
    //             e.Message = element.Message;
    //             e.Status = element.Status
    //           }
    //         });
    //       });
    //       console.log(MigrationResult.LstCandidateEmployeeMigration);


    //       this.loadingScreenService.stopLoading();
    //       this.isSuccessMigration = true;
    //       // this.doRefresh();
    //     }
    //     else {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning(apiResult.Message);
    //     }

    //   } catch (error) {
    //     this.loadingScreenService.stopLoading();
    //     this.alertService.showWarning(error);
    //   }

    // }), ((ERROR) => {
    //   this.loadingScreenService.stopLoading();


    // })


  }
  confirmReleaseSingle(data) {
    console.log(data);
    this.loadingScreenService.startLoading();
    this.editAndSaveMigrationData('SaveChanges');

    // if (!data[0].ActualDateOfJoining) {
    //     return this.alertService.showWarning('please enter actual DOJ');
    // }
    // if (data[0].TenureType == 1 && !data[0].EndDate) {
    //     return this.alertService.showWarning('please enter EndDate');
    // }
    // this.selectedmigrationRecords[0].ccmailtags;
    // if (data[0].TenureType == 2) {
    //   var myDate = new Date(data[0].ActualDateOfJoining);
    //   var newDate = moment(myDate);
    //   let nextMonth = newDate.add('month', Number(data[0].TenureInterval));
    //   nextMonth.subtract(1, "days")
    //   data[0].EndDate = moment(nextMonth).format('YYYY-MM-DD');
    // }
    // else if (data[0].TenureType == 1) {
    //   data[0].EndDate = moment(data[0].EndDate).format('YYYY-MM-DD')
    // }
    // var emails = '';
    // for (var i in this.selectedmigrationRecords[0].ccmailtags) {
    //   emails += this.selectedmigrationRecords[0].ccmailtags[i] + (this.selectedmigrationRecords[0].ccmailtags[parseInt(i) + 1] ? ',' : '');
    // }
    // var parms = {
    //   Id: data[0].CandidateOfferDetailsId,
    //   ActualDateOfJoining: moment(data[0].ActualDateOfJoining).format('YYYY-MM-DD'),
    //   DesignationId: data[0].DesignationId,
    //   Designation: data[0].Designation,
    //   SalaryRemarks: data[0].SalaryRemarks,
    //   DepartmentId: data[0].DepartmentId,
    //   Department: data[0].Department,
    //   TeamId: data[0].TeamId,
    //   EffectivePayPeriodId: data[0].EffectivePayPeriodId,
    //   OLCCMAILIDCC: emails,
    //   EndDate: data[0].EndDate
    // }
    // console.log('migrationupdateparms', parms);
    // this.loadingScreenService.startLoading();
    // this.transitionService.postEmployeeMigrationSingle(parms).subscribe((response) => {
    //   console.log(response);
    //   try {
    //     this.loadingScreenService.stopLoading();
    //     let apiResult: apiResult = response;
    //     if (apiResult.Status) {
    //       this.alertService.showSuccess(apiResult.Message);
    //       this.modal_dismiss();
    //     }
    //   } catch (error) {
    //     this.loadingScreenService.stopLoading();
    //     this.alertService.showWarning(error);
    //   }
    // }), ((ERROR) => {
    //   this.loadingScreenService.stopLoading();
    // })
  }

  editAndSaveMigrationData(actionName) {
    try {
      const data = this.selectedmigrationRecords;
      if (data[0].TenureType === 2) {
        const myDate = new Date(data[0].ActualDateOfJoining);
        const newDate = moment(myDate);
        const nextMonth = newDate.add('month', Number(data[0].TenureInterval)).subtract(1, "days");
        data[0].EndDate = moment(nextMonth).format('YYYY-MM-DD');
      } else if (data[0].TenureType === 1) {
        data[0].EndDate = moment(data[0].EndDate).format('YYYY-MM-DD');
      }
      const emails = this.selectedmigrationRecords[0].ccmailtags.join(',');

      const parms = {
        Id: data[0].CandidateOfferDetailsId,
        ActualDateOfJoining: moment(data[0].ActualDateOfJoining).format('YYYY-MM-DD'),
        DesignationId: data[0].DesignationId,
        Designation: data[0].Designation,
        SalaryRemarks: data[0].SalaryRemarks,
        DepartmentId: data[0].DepartmentId,
        Department: data[0].Department,
        TeamId: data[0].TeamId,
        EffectivePayPeriodId: data[0].EffectivePayPeriodId,
        OLCCMAILIDCC: emails,
        EndDate: data[0].EndDate
      };

      this.transitionService.postEmployeeMigrationSingle(parms)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (response) => {
            console.log(response);
            this.callApiResponse(response, actionName);
          },
          (error) => {
            this.callError(error);
          }
        );
    } catch (error) {
      this.alertService.showWarning(`An error occurred while updating candidate migration details: ${error}`);
    }
  }

  callApiResponse(response, actionName) {
    try {

      const apiResult: apiResult = response;
      if (apiResult.Status) {
        if (this.BusinessType === 1 && actionName === 'Migration') {
          this.operateSecondApiCall();
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
          this.modal_dismiss();
        }
      }
    } catch (error) {
      this.callError(error);
    }
  }

  callError(error) {
    this.loadingScreenService.stopLoading();
    this.alertService.showWarning(`An error occurred: ${error.message}`);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  operateSecondApiCall() {
    try {
      this.transitionService.putEmployeeTransition(JSON.stringify(this.TransitionGroup))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (response) => {
            console.log(response);
            this.manageSecondApiResponse(response);
          },
          (error) => {
            this.manageSecondApiError(error);
          }
        );
    } catch (error) {
      this.manageSecondApiError(error);
    }
  }

  manageSecondApiResponse(response) {
    try {
      let apiResult: apiResult = response;
      if (apiResult.Status && apiResult.Result !== "") {
        this.alertService.showSuccess(apiResult.Message);
        const MigrationResult: MigrationResult = apiResult.Result as any;

        MigrationResult.LstCandidateEmployeeMigration.forEach(element => {
          this.selectedmigrationRecords.forEach(e => {
            if (e.Id === element.CandidateId) {
              e.Message = element.Message;
              e.Status = element.Status;
            }
          });
        });

        console.log(MigrationResult.LstCandidateEmployeeMigration);
        this.loadingScreenService.stopLoading();
        this.isSuccessMigration = true;
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
      }
    } catch (error) {
      this.manageSecondApiError(error);
    }
  }

  manageSecondApiError(error) {
    this.loadingScreenService.stopLoading();
    this.alertService.showWarning(`An error occurred in the API call: ${error.message}`);
  }

  /*save changes button enable and disable*/
  savechangesdisFn(obj) {


    if (obj && obj.TenureType == 1) {
      if (obj.ActualDateOfJoining && obj.Designation && obj.Department && obj.EffectivePayPeriodId && obj.TeamId && obj.EndDate) {
        return false;
      }
      else {
        return true;
      }
    }
    else if (obj && obj.TenureType == 2) {
      if (obj.ActualDateOfJoining && obj.Designation && obj.Department && obj.EffectivePayPeriodId && obj.TeamId && obj.TenureInterval != 0) {
        return false;
      }
      else {
        return true;
      }
    }
    else if (obj && obj.TenureType == 0) {
      if (obj.ActualDateOfJoining && obj.Designation && obj.Department && obj.EffectivePayPeriodId && obj.TeamId) {
        return false;
      }
      else {
        return true;
      }
    }
  }
  /* #endregion */
  Continue() {
    //this.disableBtn = true;
    this.ALRemarks = null;
    this.isSuccessMigration = false;
    $('#popup_release_AL').modal('hide');
    this.initial_getSubmisionList_load();
    this.selectedmigrationRecords = [];
    this.isCCMailError = false;

  }



  /* #region  CC Email address book input ccmailtags function */

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent, item, e): void {

    const inputValue: string = e.target.value;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue, item);
        e.target.value = '';
        // this.tagInputRef.nativeElement.value  = '';
      }
    }
  }



  addTag(tag: any, item): void {
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

  removeTag(tag?: string, items?: any): void {
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

    // if (!!tag) {
    //   pull(items, tag); // lodash 
    // } else {
    //     items.ccmailtags.splice(-1);
    // }
  }

  onchangeCC(event: any, item) {
    console.log('event', event.target.value);;
    console.log('item', item);
    let tag = event.target.value;

    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      this.isCCMailError = false;
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
      this.isCCMailError = true;
      event.target.value = null;

    }
  }
  /* #endregion */



  /* #region  Preview AL Letter (Popup) */
  previewLetter(myObject) {
    console.log('newnobjobj', myObject);
    this.iframeContent = null;
    $('#popup_previewLetter').modal('show');

    let req_param_uri = `Id=${myObject.Id}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingApi.getCandidate(req_param_uri).subscribe((data: any) => {
      let apiResponse: apiResponse = data;
      this.candidateModel = (apiResponse.dynamicObject);
      console.log('newnewnewcan', this.candidateModel);
      this._NewCandidateDetails = this.candidateModel.NewCandidateDetails;

      if (this.BusinessType == 1 && this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId == 1988) { // for allen only since we are not doing the al process
        this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = RequestType.OL;
      }
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

  ReGenerate() {
    console.log(this.selectedmigrationRecords);
    if (this.selectedmigrationRecords.length > 1) {
      this.alertService.showWarning("Oops! Please select only one employee to regenerate AL");
      //   this.alertService.showInfo("Hi there!, Changes you made may not be valid, please recalcute");

    }
    else {
      this.validateCandidateToRegenerateAL(this.selectedmigrationRecords[0].Id).then((result) => {
        if (result == true) {
          this.router.navigate(['app/onboarding/regenerateLetter'], {
            queryParams: {
              "Idx": btoa(this.selectedmigrationRecords[0].Id),
            }
          });
        }
      })

    }
  }
  validateCandidateToRegenerateAL(CandidateId) {
    const promise = new Promise((success, failed) => {
      this.loadingScreenService.startLoading();
      let request_params = `CandidateId=${CandidateId}`;
      this.onboardingService.ValidateCandidateToRegenerateAL(request_params).subscribe((result) => {
        var res = result as apiResult;
        const answer = JSON.parse(res.Result);
        this.loadingScreenService.stopLoading();
        answer[0].IsValidForGenerate == false ? this.alertService.showWarning(answer[0].Remarks) : true;
        answer[0].IsValidForGenerate == true ? success(true) : failed(false);
      })
    });
    return promise;
  }



  doExtendingDOJ() {

    if (this.selectedmigrationRecords.length > 1) {
      this.alertService.showInfo("possible to select only one item at a time");
      return;
    }

    if (this.selectedmigrationRecords == undefined || this.selectedmigrationRecords == null || this.selectedmigrationRecords.length <= 0) {
      this.alertService.showInfo("Choose an item so that extended DOJ can be performed.");
      return;
    }

    console.log('this.selectedItems', this.selectedmigrationRecords);

    let selectedObject = {
      CandidateName: this.selectedmigrationRecords[0].CandidateName,
      ActualDateOfJoining: this.selectedmigrationRecords[0].ActualDateOfJoining,
      ClientName: this.selectedmigrationRecords[0].ClientName,
      Designation: this.selectedmigrationRecords[0].Designation,
      CandidateId: this.selectedmigrationRecords[0].Id,
      ClientId: this.selectedmigrationRecords[0].ClientId,
      ClientContractId: this.selectedmigrationRecords[0].ClientContractId,
      Id: this.selectedmigrationRecords[0].ModuletransactionId,
    };

    const modalRef = this.modalService.open(OnboardingExtendedDetailsComponent, this.modalOption);
    modalRef.componentInstance.currentRowObject = selectedObject;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.initial_getSubmisionList_load();
      } else {

      }
    }).catch((error) => {
      console.log(error);
    });
  }

  ViewDocuments() {
    this.showCandidateLetterTransaction = true;
  }

  closeCandidateLetterTransaction() {
    this.showCandidateLetterTransaction = false;
  }



  viewAttachments(item, section) {
    const documentName = section == 'ClientApprovals' ? item.DocumentName : item.DocumentName;
    const documentId = section == 'ClientApprovals' ? item.ObjectStorageId :
      section == 'Family' ? item.CD[0].hasOwnProperty('ObjectStorageId') ? item.CD[0].ObjectStorageId : 0 :
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

      var contentType = this.fileUploadService.getContentType(documentName);
      if (contentType === 'application/pdf' || contentType.includes('image')) {

        return this.fileUploadService.getObjectById(documentId).subscribe(
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
        var appUrl = this.fileUploadService.getUrlToGetObject(documentId);
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        this.loadingScreenService.stopLoading();
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
        var modalDiv = $('#documentviewer2');
        modalDiv.modal({ backdrop: false, show: true });

      }

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

  close_documentviewer2() {
    this.contentmodalurl = null;
    $("#documentviewer2").modal('hide');

  }



  getFileList(documentId) {
    console.log('coming');


    this.loadingScreenService.startLoading();

    let DocId = documentId;
    this.docList = [];
    try {


      this.fileUploadService.getObjectById(DocId)
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

  close_documentviewer3() {

    $("#documentviewer").modal('hide');

  }


  getTargetOffSetImage(item: any) {
    const promise = new Promise((res, rej) => {
      const contentType = this.fileUploadService.getContentType(item.name);
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

  viewTransaction() {

    const transactionId = this.selectedmigrationRecords[0].ModuletransactionId
      ;

    const drawerRef = this.drawerService.create<ViewOnboardingProcessLogsComponent, { transactionId }, string>({
      nzTitle: 'Onboarding Transaction History',
      nzContent: ViewOnboardingProcessLogsComponent,
      nzWidth: 980,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        transactionId: transactionId,
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

  fetchBlacklistReasons() {
    this.btnBlacklistspinner = true;
    this.BlackListReasons = [];
    try {
      let selectedClientId = this.selectedmigrationRecords[0].ClientId;
      this.employeeService.FetchBlackListingReasons(selectedClientId).subscribe((data: apiResult) => {
        console.log('data', data);
        this.btnBlacklistspinner = false;
        if (data.Status && data.Result != null && data.Result != "") {
          this.BlackListReasons = JSON.parse(data.Result);
          this.markanemployeeasblacklisted();
        } else {
          this.btnBlacklistspinner = false;
          this.alertService.showWarning('an error occurred while marking an employee as blacklisted');

        }
      })
    } catch (error) {
      this.btnBlacklistspinner = false;
      this.alertService.showWarning('an error occurred while marking an employee as blacklisted');

    }
  }


  markanemployeeasblacklisted() {
    this.alertService.confirmSwal1("Warning", "Are you sure you want to mark the selected employee(s) as blacklisted?", "Yes, Confirm", "No, Cancel").then((result) => {

      const checkboxes = this.BlackListReasons;
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
          this.selectedmigrationRecords.forEach(element => {
            employeeData.push(element.Id)
          });

          let selectedCheckboxes = Object.keys(result.value)
            .filter(key => result.value[key])
            .map(Number);

          const payload = JSON.stringify({
            empIds: employeeData,
            entityType: 11, // EMPLOYEE DETAILS 
            IdentificationType: selectedCheckboxes, // AADHAAR, PAN, EMAIL, MOBILENUMBER ...
            remarks: this.blacklistedEmployeeRemarks == '' ? '' : this.blacklistedEmployeeRemarks,
            status: true // MOVING TO BLACKLIST BUCKET
          });

          console.log('#PYD 901 : ', payload);
          // this.failedBlacklistedEmployees = [];
          this.employeeService.MarkAnEmployeeAsBlackListed(payload)
            .pipe(
              takeUntil(this.unsubscribe$)
            )
            .subscribe(
              (result: apiResult) => {
                console.log('Result: ', result);
                this.loadingScreenService.stopLoading();

                if (result.Status) {
                  // this.failedBlacklistedEmployees = result.Result as any;

                  // if (this.failedBlacklistedEmployees != null && this.failedBlacklistedEmployees.length > 0) {
                  //   $('#modal_blacklistedemployee').modal({
                  //     backdrop: 'static',
                  //     keyboard: false,
                  //     show: true
                  //   });
                  // }
                  this.alertService.showSuccess(result.Message);
                  this.initial_getSubmisionList_load();
                  this.selectedmigrationRecords = [];
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
          console.log('Alert was dismissed');
        }
      });

    }).catch(error => {
    });

  }

  dismiss_blacklistedemployee() {
    $('#modal_blacklistedemployee').modal('hide');
  }

  doShowAdditionalFieldsForEmployeeConfirmation(item) {
    return this.BusinessType == 1 && environment.environment.NotRequiredClientIdsForMigrationAdditionalColumns.includes(item.ClientId) ? false : true;
  }


}