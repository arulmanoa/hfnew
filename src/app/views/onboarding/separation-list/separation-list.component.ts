import { Component, OnInit, HostListener, Inject, Input, ViewEncapsulation, ElementRef, ViewChild, EventEmitter, Output } from '@angular/core';
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
import { MultiButtonWidgetComponent } from 'src/app/shared/modals/common/multi-button-widget/multi-button-widget.component';
import { MultiButtonWidget } from 'src/app/_services/model/Common/Widget';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-separation-list',
  templateUrl: './separation-list.component.html',
  styleUrls: ['./separation-list.component.css']
})
export class SeparationListComponent implements OnInit {
  @Output() separatedCandidateChangeHandler = new EventEmitter();
  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  RoleCode: any;
  BusinessType: any;
  spinner: boolean = false;

  inBucketGridInstance1: AngularGridInstance;
  inBucketGrid1: any;
  inBucketGridService1: GridService;
  inBucketDataView1: any;
  inBucketList1: OnBoardingGrid[] = [];

  inBucketColumnDefinitions1: Column[];
  inBucketGridOptions1: GridOption;
  inBucketDataset1: any;

  selectedSeparatedRecords: any[];

  constructor(
    private onboardingApi: OnboardingService,
    private router: Router,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private headerService: HeaderService,
    private loadingScreenService: LoadingScreenService,
    public modalService: NgbModal,
    public searchService: SearchService,
    public excelService: ExcelService,
    private workFlowApi: WorkflowService,
    private importLayoutService: ImportLayoutService,
    private loadingSreenService: LoadingScreenService
  ) { }

  inBucketGridReady1(angularGrid: AngularGridInstance) {
    this.inBucketGridInstance1 = angularGrid;
    this.inBucketDataView1 = angularGrid.dataView;
    this.inBucketGrid1 = angularGrid.slickGrid;
    this.inBucketGridService1 = angularGrid.gridService;
  }
  ngOnInit() {

    this.headerService.setTitle('Onboarding');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.doRefresh();
  }

  doRefresh() {
    //  this.loadingScreenService.startLoading();
    this.spinner = true;
    this.loadInBucketRecords();


  }


  loadInBucketRecords() {

    this.inBucketList1.length = 0;
    this.inBucketList1 = [];
    this.inBucketColumnDefinitions1 = [];
    this.inBucketGridOptions1 = {
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
      showHeaderRow: true,
      rowSelectionOptions: {
        selectActiveRow: false
      },
      checkboxSelector: {
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"

    };

    let _clientId = this.BusinessType == 3 ? 0 : this.sessionService.getSessionStorage("default_SME_ClientId");
    let _clientContractId = this.BusinessType == 3 ? 0 : this.sessionService.getSessionStorage("default_SME_ContractId");
    this.onboardingApi.GetSeparatedCandidateList(_clientId, _clientContractId, this.RoleCode).subscribe((data) => {

      this.inBucketColumnDefinitions1 = [
        {
          id: 'Candidate', name: 'Candidate', field: 'CandidateName',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },
        {
          id: 'EmploymentTypeName', name: 'Employment Type', field: 'EmploymentTypeName',
          type: FieldType.string,
          sortable: true,
          filterable: true,
        },
        {
          id: 'ActualDateOfJoining', name: 'Date of Joining', field: 'ActualDateOfJoining',
          formatter: Formatters.dateIso,
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'LWD', name: 'Last Working Day', field: 'LWD',
          formatter: Formatters.dateIso,
          sortable: true,
          type: FieldType.date
        },
        {
          id: 'Status', name: 'Status', field: 'Status',
          sortable: true,
          type: FieldType.string
        },
        // {
        //   id: 'PendingAt', name: 'Pending At', field: 'PendingAt',
        //   sortable: true,
        //   type: FieldType.string
        // },
        // {
        //   id: 'edit',
        //   field: 'Id',
        //   excludeFromHeaderMenu: true,
        //   formatter: Formatters.editIcon,
        //   minWidth: 30,
        //   maxWidth: 30,
        //   onCellClick: (e: Event, args: OnEventArgs) => {
        //     console.log(args.dataContext);


        //     this.headerService.getTransactionRemars("");
        //     this.headerService.getTransactionRemars(args.dataContext.TransactionRemarks);


        //     this.headerService.getOnboardingStatus("");
        //     this.headerService.getOnboardingStatus(`${args.dataContext.CandidateName.toUpperCase()} | ${args.dataContext.RequestedFor} | ${args.dataContext.Status} - ${args.dataContext.ClientName}`);

        //     if (args.dataContext.EmploymentTypeName != null && args.dataContext.EmploymentTypeName != '' && args.dataContext.EmploymentTypeName.toUpperCase() == "VENDOR") {
        //       this.router.navigate(['app/onboarding/vendorOnboarding'], {
        //         queryParams: {
        //           "Idx": btoa(args.dataContext.Id),
        //           "Cdx": btoa(args.dataContext.CandidateId),
        //         }
        //       });
        //     }
        //     else {
        //       this.router.navigate(['app/onboarding/onboarding'], {
        //         queryParams: {
        //           "Idx": btoa(args.dataContext.Id),
        //           "Cdx": btoa(args.dataContext.CandidateId),
        //         }
        //       });
        //     }
        //   }
        // },

      ];
      let staffingObject = [
        {
          id: 'Client', name: 'Client', field: 'ClientName',
          sortable: true,
          type: FieldType.string,
          filterable: true,

        },
        {
          id: 'Contract', name: 'Contract', field: 'ClientContractCode',
          sortable: true,
          type: FieldType.string,
          filterable: true,
        },
      ];
      this.BusinessType == 3 ? (this.inBucketColumnDefinitions1 = staffingObject.concat(this.inBucketColumnDefinitions1 as any)) : true;

      let apiResult: apiResult = data;
      console.log('G', data);
      this.spinner = false;

      if (apiResult.Result != "")
        this.inBucketList1 = JSON.parse(apiResult.Result);
      // if (this.BusinessType != 3 && this.inBucketList.length > 0) {
      //   this.inBucketList = this.inBucketList.filter(a => a.ClientId == Number(this.sessionService.getSessionStorage("default_SME_ClientId")))
      // }    
      console.log('SEPARATION :: ', this.inBucketList1);
      this.spinner = false;
    }), ((err) => {
      this.spinner = false;
    });
  }

  onSelectedRowsSeparated(data, args) {

    this.selectedSeparatedRecords = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        this.selectedSeparatedRecords.push(this.inBucketList1[args.rows[i]]);
      }
    }
    console.log('SELECTED ITEMS ::', this.selectedSeparatedRecords);
  }
  subscribeEmitter() {  
    this.separatedCandidateChangeHandler.emit(this.selectedSeparatedRecords);
  }

}
