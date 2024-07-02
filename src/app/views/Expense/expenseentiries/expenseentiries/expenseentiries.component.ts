import { Component, OnInit } from '@angular/core';
import { ExpenseBatch, _ExpenseBatch, ExpenseClaimRequest, ExpenseClaimRequestStatus, SubmitExpenseBatchModel, SubmitExpenseClaimRequestModel } from 'src/app/_services/model/Expense/ExpenseEligibilityCriteria';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
import * as _ from 'lodash';
import { SessionStorage } from '../../../../_services/service/session-storage.service';
import { apiResult } from '../../../../_services/model/apiResult';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, UserHierarchyRole } from 'src/app/_services/model';
import { AlertService, EmployeeService, PagelayoutService } from 'src/app/_services/service';
import { AddexpenseModalComponent } from 'src/app/shared/modals/expense/addexpense-modal/addexpense-modal.component';
import { ViewdocsModalComponent } from 'src/app/shared/modals/expense/viewdocs-modal/viewdocs-modal.component';

import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters, OnEventArgs } from 'angular-slickgrid';
import * as moment from 'moment';
import { ReimbursementService } from 'src/app/_services/service/reimbursement.service';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ReimbursementConfiguration } from 'src/app/_services/model/Payroll/ReimbursementConfiguration';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { DataSource, PageLayout, SearchConfiguration } from '../../../personalised-display/models';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { DataSourceType, InputControlType, SearchPanelType } from 'src/app/views/personalised-display/enums';
import { ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { Title } from '@angular/platform-browser';



const highlightingFormatter = (row, cell, value, columnDef, dataContext) => {
  if (value) {
    if (dataContext.Status == 100) {
      return `<span style=" display: inline-block;
          padding: .55em .8em;
          font-size: 90%;
          font-weight: 400;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: .375rem;
          transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    } else if (dataContext.Status == 400) {
      return `<span style=" display: inline-block;
       padding: .55em .8em;
       font-size: 90%;
        font-weight: 400;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #00d97e;
        background-color: #ccf7e5;">${dataContext.StatusName}</span>`;
    }
    else if (dataContext.Status == 200 || dataContext.Status == 300) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #e63757;
      background-color: #fad7dd;">${dataContext.StatusName}</span>`;
    }
    else if (dataContext.Status == 600) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    }
  }
};



@Component({
  selector: 'app-expenseentiries',
  templateUrl: './expenseentiries.component.html',
  styleUrls: ['./expenseentiries.component.css']
})
export class ExpenseentiriesComponent implements OnInit {
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  Role: any;
  RoleCode: any;
  searchText: any = null;
  spinner: boolean = false;

  expenseConfiguration: ReimbursementConfiguration = new ReimbursementConfiguration();

  filterItem: any[] = [];

  LstExpenseClaimedRequest: any[] = [];
  LstExpenseClaimedRequestSubmitted: any[] = [];
  LstExpenseUnClaimedRequest: any[] = [];
  LstCategory: any[] = [];

  // GRID TABLE PROPERTIES 
  editFormatter: Formatter;
  viewFormatter: Formatter;
  // COMMON PROPERTIES
  selectedItems: any[];
  BehaviourObject_Data: any;
  inEmployeesInitiateGridInstance: AngularGridInstance;
  inEmployeesInitiateGrid: any;
  inEmployeesInitiateGridService: GridService;
  inEmployeesInitiateDataView: any;
  inEmployeesInitiateColumnDefinitions: Column[];
  inEmployeesInitiateGridOptions: GridOption;
  inEmployeesInitiateDataset: any;
  inEmployeesInitiateList = [];
  inEmployeesInitiateSelectedItems: any[];

  isCliekedPendingBtn: boolean = false;
  isCliekedSubmittedBtn: boolean = false;

  _employeeId: any;

  //General
  pageLayout: PageLayout = null;
  pageLayout1: PageLayout = null;

  tempColumn: Column;
  columnName: string;
  code: string;
  code1: string;
  columnDefinition: Column[];
  gridOptions: GridOption;
  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };

  isEnabled: any = '1';
  _statusList: any[] = [];
  countOfExpense: any = 0;
  selectedClaimReqs = [];
  expenseBatchName: any;
  objStorageJson: any;
  invoiceSliderVisible: boolean = false;
  rowData: any;

  modalOption: NgbModalOptions = {};
  selectAll: boolean = false;

  TotalRequestedAmount: number = 0;
  NoOfClaims: number = 0;
  ExpenseClaimRequestList = [];

  //History
  searchConfigurationForHistroy: SearchConfiguration;
  historyColumnDefinition: Column[];
  historyGridOptions: GridOption;
  historyDataset: any[];
  historyAngularGrid: AngularGridInstance;
  historyGridObj: any;
  historyDataviewObj: any;
  historySelectedItems: any[];
  businessType: any;
  activeTabName: 'newRequest';
  spinner1: boolean = false;
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    public fileuploadService: FileUploadService,
    private drawerService: NzDrawerService,
    private modalService: NgbModal,
    private reimbursementService: ReimbursementService,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private pageLayoutService: PagelayoutService,
    public utilsHelper: enumHelper,
    public attendanceService: AttendanceService,
    private titleService: Title,


  ) { }

  beforeTabChange(event) {
    if (event.nextId == 'newRequest') {
      // this.getProcessedOutputDataset();
    }
    if (event.nextId == 'history') {
      // this.expenseSelectedItems = [];
      // this.getExpenseData();
      // this.historyTab();
    }
    this.activeTabName = event.nextId;
  }

  ngOnInit() {
    this.titleService.setTitle('Claim Requests');

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.Role = this.sessionDetails.UIRoles[0].Role;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.onRefresh();

  }

  historyTab() {
    this.historyDataset = [];
    this.historyColumnDefinition = [
      {
        id: 'EmployeeCode',
        field: "EmployeeCode",
        name: 'Employee Code',
        filterable: true,
      },
      {
        id: 'EmployeeName',
        field: "EmployeeName",
        filterable: true,
        name: 'Employee Name'
      },
      {
        id: 'BatchName',
        field: "BatchName",
        filterable: true,
        name: 'Batch Name'
      },
      // {
      //   id : 'CostCode',
      //   field : 'CostCode',
      //   name : 'Cost Code'
      // },
      // {
      //   id : 'DaytobePaid',
      //   field : 'DaytobePaid',
      //   name : 'Day to be Paid'
      // },
      {
        id: 'DisplayName',
        field: 'DisplayName',
        name: 'Category Name',
        filterable: true,

        // formatter: this.hyperlinkFormatter
      },
      {
        id: 'Amount',
        field: 'Amount',
        name: 'Req. Amount',
        filterable: true,

      },
      {
        id: 'ApprovedAmount',
        field: 'ApprovedAmount',
        name: 'App. Amount',
        filterable: true,

      },
      {
        id: 'Status',
        field: 'Status',
        filterable: true,
        name: 'Status'
      },
      {
        id: 'ApprovedOn',
        field: 'ApprovedOn',
        name: 'Approved On',
        filterable: true,

      },
    ]

    this.historyGridOptions = {
      //General
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: true,
      //forceFitColumns : true,
      enableAutoSizeColumns: true,
      enableAutoTooltip: true,

      //Row Selection
      enableCheckboxSelector: true,
      enableRowSelection: true,
      rowSelectionOptions: {
        selectActiveRow: false
      }
    }



    this.searchConfigurationForHistroy = {
      SearchElementList: [
        {
          DataSource: {
            EntityType: 0,
            IsCoreEntity: false,
            Name: "GetUserMappedClientList",
            Type: 1
          },
          DefaultValue: "1846",
          DisplayFieldInDataset: "Name",
          FieldName: "@clientId",
          DisplayName: 'Client Name',
          ForeignKeyColumnNameInDataset: "Id",
          InputControlType: InputControlType.AutoFillTextBox,
          IsIncludedInDefaultSearch: this.businessType == 3 ? true : false,
          TriggerSearchOnChange: false,
          MultipleValues: null,
          Value: this.businessType == 3 ? null : this.sessionService.getSessionStorage("default_SME_ClientId"),
          DropDownList: [],
          ParentFields: null,
          ParentHasValue: [],
          GetValueFromUser: false,
          SendElementToGridDataSource: true
        },
        {
          DataSource: {
            IsCoreEntity: false,
            Name: "clientcontract",
            Type: 1
          },
          DefaultValue: '230',
          DisplayFieldInDataset: 'Name',
          FieldName: "@clientcontractId",
          DisplayName: 'Contract Name',
          ForeignKeyColumnNameInDataset: "Id",
          IsIncludedInDefaultSearch: this.businessType == 3 ? true : false,
          InputControlType: InputControlType.AutoFillTextBox,
          Value: this.businessType == 3 ? null : this.sessionService.getSessionStorage("default_SME_ContractId"),
          TriggerSearchOnChange: false,
          ReadOnly: true,
          DropDownList: [],
          ParentHasValue: [],
          ParentFields: ["@clientId"],
          MultipleValues: null,
          GetValueFromUser: false,
          SendElementToGridDataSource: true
        },
        {
          DataSource: { Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false },
          DefaultValue: "218",
          DisplayFieldInDataset: "Name",
          DisplayName: "Team Name",
          DropDownList: [],
          FieldName: "@teamId",
          ForeignKeyColumnNameInDataset: "Id",
          InputControlType: 2,
          IsIncludedInDefaultSearch: false,
          MultipleValues: [],
          ParentFields: ["@clientcontractId"],
          ParentHasValue: [],
          ReadOnly: true,
          RelationalOperatorValue: null,
          RelationalOperatorsRequired: false,
          TriggerSearchOnChange: false,
          Value: null,
          GetValueFromUser: false,
          SendElementToGridDataSource: true
        },
        {
          DataSource: { Type: 1, Name: "ProcessCategory", EntityType: 0, IsCoreEntity: false },
          FieldName: "@processCategory",
          DefaultValue: ProcessCategory.Expense,
          DropDownList: [],
          IsIncludedInDefaultSearch: false,
          TriggerSearchOnChange: false,
          InputControlType: InputControlType.TextBox,
          SendElementToGridDataSource: true,
          ParentFields: [],
          Value: ProcessCategory.Expense,
        },
        {
          DisplayName: "Employee Codes",
          FieldName: '@employeeCodes',
          DefaultValue: '[]',
          Value: null,
          DisplayFieldInDataset: 'Name',
          ForeignKeyColumnNameInDataset: 'Id',
          InputControlType: InputControlType.CommaSeparatedStrings,
          IsIncludedInDefaultSearch: true,
          TriggerSearchOnChange: false,
          MultipleValues: null,
          DropDownList: [],
          ParentFields: null,
          ParentHasValue: [],
          SendElementToGridDataSource: true,
        },
        // {
        //   DataSource: { Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false },
        //   DefaultValue: "[]",
        //   DisplayFieldInDataset: "Name",
        //   DisplayName: "Pay Period",
        //   DropDownList: [],
        //   FieldName: "@payperiodIds",
        //   ForeignKeyColumnNameInDataset: "Id",
        //   InputControlType: InputControlType.MultiSelectDropDown,
        //   IsIncludedInDefaultSearch: true,
        //   MultipleValues: [],
        //   ParentFields: ['@clientcontractId'],
        //   ParentHasValue: [],
        //   ReadOnly: false,
        //   RelationalOperatorValue: null,
        //   RelationalOperatorsRequired: false,
        //   TriggerSearchOnChange: false,
        //   Value: null,
        //   GetValueFromUser: false,
        //   SendElementToGridDataSource: true,
        // },
        {
          DisplayName: "Batch Name",
          FieldName: '@batchName',
          DefaultValue: '[]',
          Value: null,
          DisplayFieldInDataset: 'Name',
          ForeignKeyColumnNameInDataset: 'Id',
          InputControlType: InputControlType.TextBox,
          IsIncludedInDefaultSearch: true,
          TriggerSearchOnChange: false,
          MultipleValues: null,
          DropDownList: [],
          ParentFields: null,
          ParentHasValue: [],
          SendElementToGridDataSource: true,
        },
        {
          DisplayName: "Amount (From)",
          FieldName: '@fromNetPay',
          Value: null,
          DefaultValue: 1000000.509,
          DisplayValue: null,
          InputControlType: InputControlType.TextBox,
          DataSource: {
            Name: 'GetReportType',
            Type: DataSourceType.SP,
            IsCoreEntity: false
          },
          DropDownList: [],
          ParentFields: [],
          ParentDependentReadOnly: [],
          ParentHasValue: null,
          IsIncludedInDefaultSearch: true,
          MultipleValues: null,
          FireEventOnChange: true,
          ForeignKeyColumnNameInDataset: 'ReportTypeId',
          DisplayFieldInDataset: 'Name'
        },
        {
          DisplayName: "Amount (Till)",
          FieldName: '@tillNetPay',
          Value: null,
          DefaultValue: 1000000.509,
          DisplayValue: null,
          InputControlType: InputControlType.TextBox,
          DataSource: {
            Name: 'GetReportType',
            Type: DataSourceType.SP,
            IsCoreEntity: false
          },
          DropDownList: [],
          ParentFields: [],
          ParentDependentReadOnly: [],
          ParentHasValue: null,
          IsIncludedInDefaultSearch: true,
          MultipleValues: null,
          FireEventOnChange: true,
          ForeignKeyColumnNameInDataset: 'ReportTypeId',
          DisplayFieldInDataset: 'Name'
        },
        {
          DataSource: { Type: 1, Name: "reimbursementproductconfiguration", EntityType: 0, IsCoreEntity: false },
          DefaultValue: "[]",
          DisplayFieldInDataset: "DisplayName",
          DisplayName: "Category Name",
          DropDownList: [],
          FieldName: "@productIds",
          ForeignKeyColumnNameInDataset: "ProductId",
          InputControlType: InputControlType.MultiSelectDropDown,
          IsIncludedInDefaultSearch: true,
          MultipleValues: [],
          ParentFields: [],
          ParentHasValue: [],
          ReadOnly: false,
          RelationalOperatorValue: null,
          RelationalOperatorsRequired: false,
          TriggerSearchOnChange: false,
          Value: null,
          GetValueFromUser: false,
          SendElementToGridDataSource: true,
        },
        {
          DisplayName: "From Date",
          FieldName: '@fromDate',
          Value: null,
          DefaultValue: '1900-01-01',
          DisplayValue: null,
          InputControlType: InputControlType.DatePicker,
          DataSource: {
            Name: 'GetReportType',
            Type: DataSourceType.SP,
            IsCoreEntity: false
          },
          DropDownList: [],
          ParentFields: [],
          ParentDependentReadOnly: [],
          ParentHasValue: null,
          IsIncludedInDefaultSearch: true,
          MultipleValues: null,
          FireEventOnChange: true,
          ForeignKeyColumnNameInDataset: 'ReportTypeId',
          DisplayFieldInDataset: 'Name'
        },
        {
          DisplayName: "To Date",
          FieldName: '@toDate',
          Value: null,
          DefaultValue: '1900-01-01',
          DisplayValue: null,
          InputControlType: InputControlType.DatePicker,
          DataSource: {
            Name: 'GetReportType',
            Type: DataSourceType.SP,
            IsCoreEntity: false
          },
          DropDownList: [],
          ParentFields: [],
          ParentDependentReadOnly: [],
          ParentHasValue: null,
          IsIncludedInDefaultSearch: true,
          MultipleValues: null,
          FireEventOnChange: true,
          ForeignKeyColumnNameInDataset: 'ReportTypeId',
          DisplayFieldInDataset: 'Name'
        },
      ],
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: true,
      SaveSearchElementsLocally: false
    }
  }

  claimEnabled(value) {
    this.isEnabled = value;
  }
  onRefresh() {
    this.inEmployeesInitiateSelectedItems = [];
    this.rowData = null;
    this.expenseBatchName = '';
    this.inEmployeesInitiateList = [];
    this._statusList = this.utilsHelper.transform(ExpenseClaimRequestStatus) as any;
    this.selectedClaimReqs = [];
    this.isCliekedPendingBtn = true;
    this.LstExpenseClaimedRequest = [];
    this.LstExpenseUnClaimedRequest = [];
    this.countOfExpense = 0;
    this.code = 'expenseBatchForManager';
    this.get_pagelayout();
    this.historyTab();
    this.filterItem = [

      {
        Id: 1,
        Name: "Unclaimed"
      },
      {
        Id: 2,
        Name: "Claimed"
      }
    ];
    this.editFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;
    font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    text-align: center;
    vertical-align: middle;
   matTooltip="Edit Request">
      <i class="fa fa-pencil-square-o" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';
    this.viewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;
      font-weight: 800 !important;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center;
      vertical-align: middle;margin-right :5px
      matTooltip="View Documents" title="View Documents">
      <i class="fa fa-file-text" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>
` : '<i class="mdi mdi-close-box-outline" style="cursor:pointer"></i>';

    this.loadinEmployeesInitiateRecords1();
    $('#CanCollapse').on('hidden.bs.collapse', () => {
      // do something...
      // console.log("collapesed");
      if (this.historyAngularGrid !== undefined && this.historyAngularGrid !== null)
        this.historyAngularGrid.resizerService.resizeGrid();

    })
  }

  // OPEN DRAWER (ADD AND EDIT)

  openDrawerAddExpense() {
    this.openDrawer(null);
  }

  openDrawer(object) {
    const drawerRef = this.drawerService.create<AddexpenseModalComponent, { CategoryList: any, editObject: any, objStorageJson: any }, string>({
      nzTitle: 'Add Expense Request',
      nzContent: AddexpenseModalComponent,
      nzWidth: 740,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {
        CategoryList: this.LstCategory,
        editObject: object,
        objStorageJson: this.objStorageJson
      }
    });

    drawerRef.afterOpen.subscribe(() => {
    });

    drawerRef.afterClose.subscribe(data => {
      var modalResult = (data) as any;
      console.log('data', data);
      if (data != undefined) {
        var formValue: ExpenseClaimRequest = data as any;
        if (this.LstExpenseUnClaimedRequest.length == 0 || this.LstExpenseUnClaimedRequest.filter(a => a.Id == formValue.Id).length == 0) {
          this.LstExpenseUnClaimedRequest.push(formValue)
        } else {
          var existingExpenseClaimRequest = this.LstExpenseUnClaimedRequest.find(a => a.Id == formValue.Id);
          existingExpenseClaimRequest != undefined && (existingExpenseClaimRequest = formValue)
        }
      }

      console.log('this.LstExpenseUnClaimedRequest', this.LstExpenseUnClaimedRequest);



    });
  }


  // GRID TABLE 
  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
  }

  loadinEmployeesInitiateRecords1() {

    this.inEmployeesInitiateGridOptions = {
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: false,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: false,
      createFooterRow: true,
      showFooterRow: false,
      footerRowHeight: 30,
      createPreHeaderPanel: true,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 40,
      enablePagination: false,
      enableCheckboxSelector: true,
      enableRowSelection: true,
      rowSelectionOptions: {
        selectActiveRow: false
      }
    };


    this.inEmployeesInitiateColumnDefinitions = [
      // {
      //   id: 'ProductName', name: 'Category', field: 'ProductName',
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,
      // },
      // {
      //   id: 'ExpenseIncurredDate', name: 'Expense Date', field: "ExpenseIncurredDate",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,


      // },
      // {
      //   id: 'DocumentNumber', name: 'Bill No', field: 'DocumentNumber',
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,
      // },

      // {
      //   id: 'DocumentDate', name: 'Bill Date', field: 'DocumentDate',
      //   sortable: true,
      //   type: FieldType.string,
      //   filterable: true,
      //   formatter: this.DateFormatter

      //   // minWidth: 80,
      //   // maxWidth: 80,
      // },
      // {
      //   id: 'RequestedAmount', name: 'Amount (₹)', field: "RequestedAmount",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,


      // },
      // {
      //   id: 'Remarks', name: 'Remarks', field: "Remarks",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,

      // },
      // {
      //   id: 'StatusName', name: 'Status', field: 'StatusName',
      //   sortable: true,
      //   type: FieldType.string,
      //   formatter: highlightingFormatter,
      //   filterable: true,
      //   filter: {
      //     model: Filters.singleSelect,
      //     collection: [{ value: '', label: 'All' }, { value: "Applied", label: 'Applied' }, { value: "Cancelled", label: 'Cancelled' }, { value: "Rejected", label: 'Rejected' },
      //     { value: "Approved", label: 'Approved' }],
      //   },
      //   // minWidth: 90, 
      //   // maxWidth: 90,  Applied = 100,

      // },
      // {
      //   id: 'edit',
      //   field: 'Id',
      //   excludeFromHeaderMenu: true,
      //   formatter: this.editFormatter,
      //   minWidth: 40,
      //   maxWidth: 40,
      //   onCellClick: (e: Event, args: OnEventArgs) => {


      //   }
      // },
      // {
      //   id: 'cancel',
      //   field: 'Id',
      //   excludeFromHeaderMenu: true,
      //   formatter: this.viewFormatter,
      //   minWidth: 40,
      //   maxWidth: 40,
      //   onCellClick: (e: Event, args: OnEventArgs) => {


      //   }
      // },

      {
        id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode',
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: 'EmployeeName', name: 'Employee Name', field: "EmployeeName",
        sortable: true,
        filterable: true,
        type: FieldType.string,


      },
      // {
      //   id: 'Id', name: 'Batch #', field: 'Id',
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,
      // },

      {
        id: 'Name', name: 'Batch Name', field: 'Name',
        sortable: true,
        type: FieldType.string,
        filterable: true,

        // minWidth: 80,
        // maxWidth: 80,
      },

      {
        id: 'TotalRequestedAmount', name: 'Req. Amount (₹)', field: "TotalRequestedAmount",
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      // {
      //   id: 'TotalApprovedAmount', name: 'App. Amount (₹)', field: "TotalApprovedAmount",
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,

      // },
      {
        id: 'CreatedOn', name: 'Requested Date', field: 'CreatedOn',
        sortable: true,
        type: FieldType.string,
        filterable: true,
        formatter: this.DateFormatter
        // minWidth: 80,
        // maxWidth: 80,
      },
      {
        id: 'StatusName', name: 'Status', field: 'StatusName',
        sortable: true,
        type: FieldType.string,
        // minWidth: 90, 
        // maxWidth: 90,  Applied = 100,

      },
      // {
      //   id: 'edit',
      //   field: 'Id',
      //   excludeFromHeaderMenu: true,
      //   formatter: this.editFormatter,
      //   minWidth: 40,
      //   maxWidth: 40,
      //   onCellClick: (e: Event, args: OnEventArgs) => {


      //   }
      // },
      {
        id: 'cancel',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.editFormatter,
        minWidth: 40,
        maxWidth: 40,
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log('args', args.dataContext);
          this.loadingScreenService.startLoading();
          var expenseBatch = args.dataContext;
          console.log('expenseBatch', expenseBatch);

          // FETCH EXPENSE CONFIGURATION 
          this.reimbursementService.FetchReimbursementConfigurationByEmployeeId(expenseBatch.EmployeeId)
            .subscribe((expenseConfigObj) => {
              try {
                this.selectAll = false;
                this.rowData = expenseBatch;
                console.log('EXPENSE CONFIGURATION ::', expenseConfigObj);
                let resultObj: apiResult = expenseConfigObj;
                if (resultObj.Status && resultObj.Result != null) {
                  this.expenseConfiguration = resultObj.Result as any;
                  if (this.expenseConfiguration.ProductConfigurationList != null && this.expenseConfiguration.ProductConfigurationList.length > 0) {
                    this.spinner = false;
                    this.LstCategory = this.expenseConfiguration.ProductConfigurationList;


                    expenseBatch.ExpenseClaimRequestList = expenseBatch.ExpenseClaimRequestList != null && expenseBatch.ExpenseClaimRequestList.length > 0 ?
                      expenseBatch.ExpenseClaimRequestList.filter(a => a.Status == 200) : [];

                    this.TotalRequestedAmount = 0;
                    this.NoOfClaims = 0;
                    expenseBatch.ExpenseClaimRequestList.length > 0 && expenseBatch.ExpenseClaimRequestList.forEach(e1 => {
                      this.TotalRequestedAmount += e1.RequestedAmount;
                    });
                    this.NoOfClaims = expenseBatch.ExpenseClaimRequestList.length;
                    this.ExpenseClaimRequestList = [];
                    this.ExpenseClaimRequestList = expenseBatch.ExpenseClaimRequestList;

                    this.rowData = expenseBatch;
                    this.rowData.ExpenseClaimRequestList != null && this.rowData.ExpenseClaimRequestList.length > 0 && this.rowData.ExpenseClaimRequestList.forEach(ee => {
                      ee['ProductName'] = this.LstCategory != null && this.LstCategory.length > 0 && this.LstCategory.find(a => a.ProductId == ee.ProductId) != undefined ? this.LstCategory.find(a => a.ProductId == ee.ProductId).DisplayName : '---';
                      ee['isSelected'] = false;
                      ee['RejectionRemarks'] = "";
                      ee.Status = 200;
                      ee.ApprovedAmount = 0;

                    });
                    this.loadingScreenService.stopLoading();
                    this.invoiceSliderVisible = true;

                  } else {
                    this.loadingScreenService.stopLoading();
                    this.spinner = false;
                    this.alertService.showWarning('Employee expense product information is not available');
                    return;
                  }
                }
              } catch (Exception) {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning('Expense Configuration : Something bas has happend ! ' + Exception);
                this.spinner = false;
              }

            }, err => {

            })


        }
      },


    ];

  }

  close_invoiceSliderVisible() {

    this.rowData && this.rowData.ExpenseClaimRequestList != null && this.rowData.ExpenseClaimRequestList.length > 0 && this.rowData.ExpenseClaimRequestList.forEach(ee => {
      ee.Status = 200;
      ee.ApprovedAmount = 0;

    });

    // this.rowData = null;
    this.invoiceSliderVisible = false;

  }
  onSelectedEmployeeChange(data, args) {
    this.inEmployeesInitiateSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesInitiateDataView.getItem(row);
        this.inEmployeesInitiateSelectedItems.push(row_data);
      }
    }
    console.log('SELECTED ITEMS ::', this.inEmployeesInitiateSelectedItems);

  }

  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  clickEvent(whichButton) {
    if (whichButton == '1') {
      this.isCliekedPendingBtn = true;
      this.isCliekedSubmittedBtn = false;


    } else if (whichButton == '2') {
      this.isCliekedSubmittedBtn = true;
      this.isCliekedPendingBtn = false;

    }
  }

  do_editAppliedRequest(item) {
    console.log('item', item);
    this.openDrawer(item);

  }






  /* #region EVERTHING THAT WORKS PAGELAYOUT IS WRITTERN HERE  */

  get_pagelayout() {

    const promise = new Promise((res, rej) => {
      this.spinner = true;
      this.pageLayout = null;
      this.spinner = true;
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.pageLayout = data.dynamicObject;
          console.log('EXPENSE UNCLAIM/CLAIM REQUEST LIST ::', this.pageLayout);
          this.setGridConfiguration();
          if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
          res(true)
        }
        else {
          res(true)
        }

      }, error => {
        console.log(error);
        this.spinner = false;
      }
      );
    })
    return promise;
  }



  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      // let  collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }];
      // this.inEmployeesInitiateColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.inEmployeesInitiateGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.inEmployeesInitiateGridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      // onGroupChanged: (e, args) => this.onGroupChange(),
      // onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }


  getDataset() {
    this.selectedItems = [];
    this.LstExpenseUnClaimedRequest = [];
    if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@userId') != undefined) {
      this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@userId').Value = this.UserId
    }
    if (this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@roleCode') != undefined) {
      this.pageLayout.SearchConfiguration.SearchElementList.find(item => item.FieldName == '@roleCode').Value = this.RoleCode
    }
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.LstExpenseUnClaimedRequest = JSON.parse(dataset.dynamicObject);
        console.log('Unclaimed Request List : ', this.LstExpenseUnClaimedRequest);

        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }
  onCellClicked(e, args) {
    const metadata = this.inEmployeesInitiateGridInstance.gridService.getColumnFromEventArguments(args);

    if (metadata.columnDef.id === 'expenseEdit' && metadata.dataContext.Status == 100) {

      // this.common_approve_reject('edit', false, (metadata.dataContext), 'parent');
      return;
    }
    else if (metadata.columnDef.id === 'expenseDelete' && metadata.dataContext.Status == 100) {

      // this.common_approve_reject('edit', true, (metadata.dataContext), 'parent');
      return;
    }

    else {
      return;
      // this.alertService.showWarning('Action was blocked : Invalid Leave request - that  leave request is already approved/rejected.')
    }
  }

  /* #endregion */


  getStatusName(status) {
    return this._statusList.find(a => a.id == status).name;
  }



  submitForApproval() {
    if (this.selectedClaimReqs.length == 0) {
      this.alertService.showWarning('Please select at leaset one item and try again.');
      return;
    }

    $('#expense_batch').modal('show');
    // this.reimbursementService.UpsertExpenseClaimRequest()
  }

  confirm_submit_claimApproval() {
    var sum = 0;
    this.selectedClaimReqs.forEach(e => { sum += parseInt(e.RequestedAmount) });

    var expenseBatch = new ExpenseBatch();
    expenseBatch.EmployeeId = this._employeeId;
    expenseBatch.Name = this.expenseBatchName;
    expenseBatch.TotalRequestedAmount = sum;
    expenseBatch.TotalApprovedAmount = 0;
    expenseBatch.TotalNoOfRequests = this.selectedClaimReqs.length;
    expenseBatch.RejectedClaimIds = [];
    // expenseBatch.ModuleProcessTransactionId = 0;
    // expenseBatch.TimeCardId = 0;
    // expenseBatch.ApproverUserId = 0;
    expenseBatch.Status = 0;
    expenseBatch.ExpenseClaimRequestList = this.selectedClaimReqs;
    expenseBatch.ModeType = UIMode.Edit;

    console.log('expenseBatch', expenseBatch);

    //  return;
    this.reimbursementService.UpsertExpenseBatch(expenseBatch)
      .subscribe((expenseBatchReqgObj) => {
        try {
          console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
          let resultObj: apiResult = expenseBatchReqgObj;
          if (resultObj.Status && resultObj.Result != null) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(resultObj.Message);

          }
          else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
          }
        } catch (Exception) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
        }

      }, err => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

      })



  }
  close_expensebatch_popup() {
    $('#expense_batch').modal('hide');
  }

  do_viewDocuments(item) {

    const modalRef = this.modalService.open(ViewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.editObject = item;
    modalRef.componentInstance.Role = this.Role;
    modalRef.componentInstance.IsVerification = true;
    modalRef.componentInstance.objStorageJson = { CompanyId: this.rowData.CompanyId, ClientId: this.rowData.ClientId, ClientContractId: this.rowData.ClientContractId, EmployeeId: this.rowData.EmployeeId }

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('result', result);
      }
    }).catch((error) => {
      console.log(error);
    });

  }




  triggerSubmitExpense(jsonObj) {

    this.loadingScreenService.startLoading();
    var sum = 0;
    this.selectedClaimReqs.forEach(e => { sum += parseInt(e.RequestedAmount) });

    var expenseBatch = new ExpenseBatch();
    expenseBatch.EmployeeId = this._employeeId;
    expenseBatch.Name = this.expenseBatchName;
    expenseBatch.TotalRequestedAmount = sum;
    expenseBatch.TotalApprovedAmount = 0;
    expenseBatch.TotalNoOfDocuments = this.selectedClaimReqs.length;
    expenseBatch.TotalNoOfRequests = this.selectedClaimReqs.length;
    expenseBatch.RejectedClaimIds = [];
    // expenseBatch.ModuleProcessTransactionId = 0;
    // expenseBatch.TimeCardId = 0;
    // expenseBatch.ApproverUserId = 0;
    expenseBatch.Status = 1;
    expenseBatch.ExpenseClaimRequestList = this.selectedClaimReqs;
    expenseBatch.ModeType = UIMode.Edit;
    var role = new UserHierarchyRole();
    role.IsCompanyHierarchy = false;
    role.RoleCode = this.Role.Code;
    role.RoleId = this.Role.Id;

    var submitExpenseBatchModel = new SubmitExpenseBatchModel();
    submitExpenseBatchModel.ExpenseBatch = expenseBatch;
    submitExpenseBatchModel.ModuleProcessAction = 40;
    submitExpenseBatchModel.Role = role;
    submitExpenseBatchModel.ActionProcessingStatus = 0
    submitExpenseBatchModel.Remarks = jsonObj;
    submitExpenseBatchModel.ClientId = this.objStorageJson.ClientId;
    submitExpenseBatchModel.ClientContractId = this.objStorageJson.ClientContractId;
    submitExpenseBatchModel.CompanyId = this.objStorageJson.CompanyId;


    console.log('expenseBatch', expenseBatch);

    //  return;
    this.reimbursementService.SubmitExpenseBatch(submitExpenseBatchModel)
      .subscribe((expenseBatchReqgObj) => {
        try {
          console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
          let resultObj: apiResult = expenseBatchReqgObj;
          if (resultObj.Status && resultObj.Result != null) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(resultObj.Message);
            this.onRefresh();

          }
          else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
          }
        } catch (Exception) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
        }

      }, err => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

      })

  }

  /* #region  AGAINST INDIVIDUAL CLAIM REQUEST ACTION (SUBMIT INCLJUDING APPROEVED AND REJECTED) */

  submitExpenseRequest(action) {

    console.log('row', this.rowData);


    // this.ExpenseClaimRequestList.forEach(e2 => {
    //   var foundIndex = this.rowData.ExpenseClaimRequestList.findIndex(x => x.id == e2.Id);
    //   this.rowData.ExpenseClaimRequestList[foundIndex] = e2;

    // });
    this.rowData.ExpenseClaimRequestList.forEach((element, index) => {
      let item = this.ExpenseClaimRequestList.find(a => a.Id == element.Id);
      this.rowData.ExpenseClaimRequestList[index] = item;
    });

    console.log('row1', this.rowData);
    // return;

    if (this.selectedClaimReqs.length == 0) {
      this.alertService.showWarning('Please select the validated records before submitting.');
      return false;
    }


    if (this.selectedClaimReqs.length > 0) {
      if ((this.selectedClaimReqs.filter(a => a.Status <= 200).length > 0)) {
        this.alertService.showWarning('Please validate all Approvals before submitting');
        return false;
      }

      var sum = 0;
      var sum1 = 0;
      this.selectedClaimReqs.forEach(e => {
        sum += parseInt(e.RequestedAmount);
        sum1 += parseInt(e.ApprovedAmount)

      });

      this.alertService.confirmSwal1("Are you sure you want to submit ", `No of Claims ${this.selectedClaimReqs.length} and Total Requested Amount : ${sum} , Total Approved Amount : ${sum1}`, "Yes, Confirm", "No, Cancel").then((result) => {
        this.loadingScreenService.startLoading();
        this.selectedClaimReqs.forEach(e => { e.ModeType = UIMode.Edit });


        this.selectedClaimReqs.forEach(e1 => {
          if (e1.RejectionRemarks) {
            let Remarks = `Employee : ${e1.Remarks} | Manager : ${e1.RejectionRemarks}`
            e1.Remarks = Remarks;
          }
        });

        var role = new UserHierarchyRole();
        role.IsCompanyHierarchy = false;
        role.RoleCode = this.Role.Code;
        role.RoleId = this.Role.Id;

        var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
        submitExpenseClaimRequestModel.ExpenseClaimRequestList = this.selectedClaimReqs;
        submitExpenseClaimRequestModel.ModuleProcessAction = 42;
        submitExpenseClaimRequestModel.Role = role;
        submitExpenseClaimRequestModel.ActionProcessingStatus = 30200;
        submitExpenseClaimRequestModel.Remarks = '';
        submitExpenseClaimRequestModel.ClientId = this.rowData.ClientId;
        submitExpenseClaimRequestModel.ClientContractId = this.rowData.ClientContractId;
        submitExpenseClaimRequestModel.CompanyId = this.rowData.CompanyId;


        console.log('submitExpenseClaimRequestModel', submitExpenseClaimRequestModel);


        this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
          .subscribe((expenseClaimReqgObj) => {
            try {
              console.log('UPSERT EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
              let resultObj: apiResult = expenseClaimReqgObj;
              if (resultObj.Status && resultObj.Result != null) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(resultObj.Message);
                this.close_invoiceSliderVisible();
                this.onRefresh();
              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning('An error occurred : ' + resultObj.Message);
              }
            } catch (Exception) {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
            }

          }, err => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

          })



      }).catch(error => {

      });


    }

    // if (this.rowData.ExpenseClaimRequestList != null && this.rowData.ExpenseClaimRequestList.length > 0) {

    //   if ((this.rowData.ExpenseClaimRequestList.filter(a => a.Status <= 200).length > 0)) {
    //     this.alertService.showWarning('Please validate all Approvals before submitting');
    //     return false;
    //   }

    //   var sum = 0;
    //   var rejectedIds = [];
    //   this.rowData.ExpenseClaimRequestList.forEach(e => { if (e.Status == 400) { sum += parseInt(e.RequestedAmount) } });
    //   this.rowData.ExpenseClaimRequestList.forEach(e => { if (e.Status == 300) { rejectedIds.push(e.Id) } });
    //   this.rowData.TotalApprovedAmount = sum;
    //   this.rowData.RejectedClaimIds = rejectedIds;
    //   var expenseBatch = new ExpenseBatch();
    //   expenseBatch = this.rowData;
    //   expenseBatch.ModeType = UIMode.Edit;

    //   var role = new UserHierarchyRole();
    //   role.IsCompanyHierarchy = false;
    //   role.RoleCode = this.Role.Code;
    //   role.RoleId = this.Role.Id;

    //   var submitExpenseBatchModel = new SubmitExpenseBatchModel();
    //   submitExpenseBatchModel.ExpenseBatch = expenseBatch;
    //   submitExpenseBatchModel.ModuleProcessAction = 42;
    //   submitExpenseBatchModel.Role = role;
    //   submitExpenseBatchModel.ActionProcessingStatus = 30200;
    //   submitExpenseBatchModel.Remarks = '';
    //   submitExpenseBatchModel.ClientId = this.rowData.ClientId;
    //   submitExpenseBatchModel.ClientContractId = this.rowData.ClientContractId;
    //   submitExpenseBatchModel.CompanyId = this.rowData.CompanyId;
    //   console.log('expenseBatch', submitExpenseBatchModel);

    //   this.reimbursementService.SubmitExpenseBatch(submitExpenseBatchModel)
    //     .subscribe((expenseBatchReqgObj) => {
    //       try {
    //         console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
    //         let resultObj: apiResult = expenseBatchReqgObj;
    //         if (resultObj.Status && resultObj.Result != null) {
    //           this.loadingScreenService.stopLoading();
    //           this.alertService.showSuccess(resultObj.Message);
    //           this.onRefresh();

    //         }
    //         else {
    //           this.loadingScreenService.stopLoading();
    //           this.alertService.showWarning('An error occurred : ' + resultObj.Message);
    //         }
    //       } catch (Exception) {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
    //       }

    //     }, err => {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

    //     })

    // }

  }
  /* #endregion */
  approveorReject(whichaction, item) {
    let actionName = whichaction == true ? 'Approve' : "Reject";
    // var confirmationMsg = whichaction == true ? "Are you sure you want to submit " : 'Confirmation';
    // var subText = whichaction == true ? `No of Claims ${this.inEmployeesInitiateSelectedItems[0].TotalNoOfRequests} and Total Requested Amount : ${this.inEmployeesInitiateSelectedItems[0].TotalRequestedAmount} , Total Approved Amount : ${this.inEmployeesInitiateSelectedItems[0].TotalRequestedAmount}` : `Are you sure you want to ${actionName}?`;
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}`, "Yes, Confirm", "No, Cancel").then((result) => {
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
          inputValue: item.RejectionRemarks,
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
            console.log('item', item);
            item.RejectionRemarks = jsonStr;
            item.Status = ExpenseClaimRequestStatus.Rejected;
            item.ModeType = UIMode.Edit;
            item.ApprovedAmount = 0;

          } else if (
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }
      else {
        if (item.ApprovedAmount > 0) {
          item.Status = ExpenseClaimRequestStatus.Approved;
          item.ModeType = UIMode.Edit;
        } else {
          const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn btn-primary',
              cancelButton: 'btn btn-danger'
            },
            buttonsStyling: true
          })
          swalWithBootstrapButtons.fire({
            title: 'Approved Amount',
            animation: false,
            showCancelButton: true, // There won't be any cancel button
            input: 'number',
            inputValue: item.RequestedAmount,
            inputPlaceholder: 'Type your amount here...',
            allowEscapeKey: false,
            inputAttributes: {
              autocorrect: 'off',
              autocapitalize: 'on',
              maxlength: '12000000000',
              'aria-label': 'Type amount amount here',
            },
            allowOutsideClick: false,
            inputValidator: (value) => {

              if (value > item.RequestedAmount) {
                return 'Approved amount should not be greater than requested amount.'
              }

              if (!value) {
                return 'You need to enter something!'
              }
            },

          }).then((inputValue) => {
            if (inputValue.value) {
              let jsonObj = inputValue;
              let jsonStr = jsonObj.value;
              item.ApprovedAmount = jsonStr;
              item.Status = ExpenseClaimRequestStatus.Approved;
              item.ModeType = UIMode.Edit;

            }
          })

        }
      }

    }).catch(error => {

    });

  }

  /* #region  COMMON APPROVE AND REJECT BUTTON ACTION */

  tiggerApiCall_expenseBatch(whichaction) {


    let actionName = whichaction == true ? 'Approve' : "Reject";
    var confirmationMsg = whichaction == true ? "Are you sure you want to submit " : 'Confirmation';
    let claimRequests = [];

    let totalNoOfRequests: number = 0;
    let totalRequestedAmount: number = 0;
    let totalApprovedAmount: number = 0;



    this.inEmployeesInitiateSelectedItems.forEach(batch => {

      totalNoOfRequests = totalNoOfRequests + batch.ExpenseClaimRequestList.length;
      // totalRequestedAmount = totalRequestedAmount + batch.TotalRequestedAmount

      //Update Claim Requests and get total requested / approved amount
      batch.ExpenseClaimRequestList.forEach(claimRequest => {

        claimRequest.Status = whichaction == true ? ExpenseClaimRequestStatus.Approved : ExpenseClaimRequestStatus.Rejected;
        claimRequest.ModeType = UIMode.Edit;
        claimRequest.ApprovedAmount = whichaction == true ? claimRequest.RequestedAmount : 0;

        totalRequestedAmount = totalRequestedAmount + claimRequest.RequestedAmount;
        totalApprovedAmount = totalApprovedAmount + claimRequest.ApprovedAmount;
      })

      claimRequests = claimRequests.concat(batch.ExpenseClaimRequestList);


    })



    console.log("Selected list ::", this.inEmployeesInitiateSelectedItems);
    console.log("Claim requests ::", claimRequests);

    // var subText = whichaction == true ? `No of Claims ${totalNoOfRequests} and Total Requested Amount : ${this.inEmployeesInitiateSelectedItems[0].TotalRequestedAmount} , Total Approved Amount : ${this.inEmployeesInitiateSelectedItems[0].TotalRequestedAmount}` : `Are you sure you want to ${actionName}?`;
    var subText = whichaction == true ? `No of Claims ${totalNoOfRequests} and Total Requested Amount : ${totalRequestedAmount} , Total Approved Amount : ${totalApprovedAmount}` : `Are you sure you want to ${actionName}?`;
    this.alertService.confirmSwal1(confirmationMsg, subText, "Yes, Confirm", "No, Cancel").then((result) => {
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
            var rejectedIds = [];
            this.loadingScreenService.startLoading();

            var role = new UserHierarchyRole();
            role.IsCompanyHierarchy = false;
            role.RoleCode = this.Role.Code;
            role.RoleId = this.Role.Id;

            claimRequests.forEach(e1 => {
              if (e1.Status == 300) {
                let Remarks = `Employee : ${e1.Remarks} | Manager : ${jsonStr}`
                e1.Remarks = Remarks;
              }
            });

            var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
            submitExpenseClaimRequestModel.ExpenseClaimRequestList = claimRequests;
            submitExpenseClaimRequestModel.ModuleProcessAction = 41;
            submitExpenseClaimRequestModel.Role = role;
            submitExpenseClaimRequestModel.ActionProcessingStatus = 30200;
            submitExpenseClaimRequestModel.Remarks = jsonStr;
            submitExpenseClaimRequestModel.ClientId = this.inEmployeesInitiateSelectedItems[0].ClientId;
            submitExpenseClaimRequestModel.ClientContractId = this.inEmployeesInitiateSelectedItems[0].ClientContractId;
            submitExpenseClaimRequestModel.CompanyId = this.inEmployeesInitiateSelectedItems[0].CompanyId;
            console.log('data', submitExpenseClaimRequestModel);
            // this.loadingScreenService.stopLoading();

            // return;
            this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
              .subscribe((expenseClaimReqgObj) => {
                try {
                  console.log('UPSERT EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
                  let resultObj: apiResult = expenseClaimReqgObj;
                  if (resultObj.Status && resultObj.Result != null) {
                    this.loadingScreenService.stopLoading();
                    this.alertService.showSuccess(resultObj.Message);
                    this.onRefresh();
                  }
                  else {
                    this.loadingScreenService.stopLoading();
                    this.alertService.showWarning('An error occurred : ' + resultObj.Message);
                  }
                } catch (Exception) {
                  this.loadingScreenService.stopLoading();
                  this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
                }

              }, err => {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

              })



            // this.inEmployeesInitiateSelectedItems.forEach(e => {
            //   e.ExpenseClaimRequestList.forEach(ee => {
            //     ee.Status = ExpenseClaimRequestStatus.Rejected;
            //     ee.ModeType = UIMode.Edit;
            //     rejectedIds.push(ee.Id);
            //   });
            // });

            // console.log('this.inEmployeesInitiateSelectedItems', this.inEmployeesInitiateSelectedItems);
            // var expenseBatch = new ExpenseBatch();
            // expenseBatch = this.inEmployeesInitiateSelectedItems[0] as any;
            // expenseBatch.ModeType = UIMode.Edit;
            // expenseBatch.RejectedClaimIds = rejectedIds

            // var role = new UserHierarchyRole();
            // role.IsCompanyHierarchy = false;
            // role.RoleCode = this.Role.Code;
            // role.RoleId = this.Role.Id;     


            // var submitExpenseBatchModel = new SubmitExpenseBatchModel();
            // submitExpenseBatchModel.ExpenseBatch = expenseBatch;
            // submitExpenseBatchModel.ModuleProcessAction = 41; // RejectExpenseClaimRequest
            // submitExpenseBatchModel.Role = role;
            // submitExpenseBatchModel.ActionProcessingStatus = 30200; //ExpenseClaimRequestRejected
            // submitExpenseBatchModel.Remarks = jsonStr;
            // submitExpenseBatchModel.ClientId = this.inEmployeesInitiateSelectedItems[0].ClientId;
            // submitExpenseBatchModel.ClientContractId = this.inEmployeesInitiateSelectedItems[0].ClientContractId;
            // submitExpenseBatchModel.CompanyId = this.inEmployeesInitiateSelectedItems[0].CompanyId;

            // this.reimbursementService.SubmitExpenseBatch(submitExpenseBatchModel)
            //   .subscribe((expenseBatchReqgObj) => {
            //     try {
            //       console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
            //       let resultObj: apiResult = expenseBatchReqgObj;
            //       if (resultObj.Status && resultObj.Result != null) {
            //         this.loadingScreenService.stopLoading();
            //         this.alertService.showSuccess(resultObj.Message);
            //         this.onRefresh();

            //       }
            //       else {
            //         this.loadingScreenService.stopLoading();
            //         this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
            //       }
            //     } catch (Exception) {
            //       this.loadingScreenService.stopLoading();
            //       this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
            //     }

            //   }, err => {
            //     this.loadingScreenService.stopLoading();
            //     this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

            //   })

          } else if (
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }
      else {

        // $('#expense_batch').modal('show');
        // this.triggerSubmitExpense('');
        this.confirm_submit_Approval(claimRequests);

      }

    }).catch(error => {

    });
  }

  /* #endregion */

  /* #region  COMMON EXPENSE APPROVE BUTTON ACTION (ONLY ONE AT A TIME OF APROVE) */

  confirm_submit_Approval(claimRequests) {
    this.loadingScreenService.startLoading();

    // var isInvalidExpenseBatch: boolean = false;
    // for (let i = 0; i < this.inEmployeesInitiateSelectedItems.length; i++) {
    //   const element = this.inEmployeesInitiateSelectedItems[i];
    //   if (element.TotalApprovedAmount > element.TotalRequestedAmount) {
    //     isInvalidExpenseBatch = true;
    //     this.alertService.showWarning('Please ensure Total Approved Amount should be less than or equal to requested amount');
    //     break;
    //   }
    //   else if (element.TotalApprovedAmount == null || element.TotalApprovedAmount == '' || element.TotalApprovedAmount == undefined) {
    //     isInvalidExpenseBatch = true;
    //     this.alertService.showWarning('Please enter total approved amount');
    //     break;
    //   }
    // }

    // if (isInvalidExpenseBatch == false) {

    try {


      // this.inEmployeesInitiateSelectedItems.forEach(e => {
      //   e.ExpenseClaimRequestList.forEach(ee => {
      //     ee.Status = ExpenseClaimRequestStatus.Approved;
      //     ee.ApprovedAmount = ee.RequestedAmount;
      //     ee.ModeType = UIMode.Edit;
      //   });
      // });


      var role = new UserHierarchyRole();
      role.IsCompanyHierarchy = false;
      role.RoleCode = this.Role.Code;
      role.RoleId = this.Role.Id;



      var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
      submitExpenseClaimRequestModel.ExpenseClaimRequestList = claimRequests;
      submitExpenseClaimRequestModel.ModuleProcessAction = 42;
      submitExpenseClaimRequestModel.Role = role;
      submitExpenseClaimRequestModel.ActionProcessingStatus = 30200;
      submitExpenseClaimRequestModel.Remarks = '';
      submitExpenseClaimRequestModel.ClientId = this.inEmployeesInitiateSelectedItems[0].ClientId;
      submitExpenseClaimRequestModel.ClientContractId = this.inEmployeesInitiateSelectedItems[0].ClientContractId;
      submitExpenseClaimRequestModel.CompanyId = this.inEmployeesInitiateSelectedItems[0].CompanyId;

      console.log('data', submitExpenseClaimRequestModel);

      // this.loadingScreenService.stopLoading();

      // return;
      this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
        .subscribe((expenseClaimReqgObj) => {
          try {
            console.log('UPSERT EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
            let resultObj: apiResult = expenseClaimReqgObj;
            if (resultObj.Status && resultObj.Result != null) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(resultObj.Message);
              this.onRefresh();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning('An error occurred : ' + resultObj.Message);
            }
          } catch (Exception) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
          }

        }, err => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

        })

    } catch (error) {
      this.alertService.showWarning('Expense Claim Request Submission : Something bas has happend ! ' + error);

    }


    // console.log('this.inEmployeesInitiateSelectedItems', this.inEmployeesInitiateSelectedItems);
    // var expenseBatch = new ExpenseBatch();
    // expenseBatch = this.inEmployeesInitiateSelectedItems[0] as any;
    // expenseBatch.ModeType = UIMode.Edit;
    // expenseBatch.RejectedClaimIds = [];

    // var role = new UserHierarchyRole();
    // role.IsCompanyHierarchy = false;
    // role.RoleCode = this.Role.Code;
    // role.RoleId = this.Role.Id;

    // var submitExpenseBatchModel = new SubmitExpenseBatchModel();
    // submitExpenseBatchModel.ExpenseBatch = expenseBatch;
    // submitExpenseBatchModel.ModuleProcessAction = 42; // ApproveExpenseClaimRequest
    // submitExpenseBatchModel.Role = role;
    // submitExpenseBatchModel.ActionProcessingStatus = 30200; // ExpenseClaimRequestApproved
    // submitExpenseBatchModel.Remarks = '';
    // submitExpenseBatchModel.ClientId = this.inEmployeesInitiateSelectedItems[0].ClientId;
    // submitExpenseBatchModel.ClientContractId = this.inEmployeesInitiateSelectedItems[0].ClientContractId;
    // submitExpenseBatchModel.CompanyId = this.inEmployeesInitiateSelectedItems[0].CompanyId;
    // console.log('expenseBatch', submitExpenseBatchModel);

    // this.reimbursementService.SubmitExpenseBatch(submitExpenseBatchModel)
    //   .subscribe((expenseBatchReqgObj) => {
    //     try {
    //       console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
    //       let resultObj: apiResult = expenseBatchReqgObj;
    //       if (resultObj.Status && resultObj.Result != null) {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showSuccess(resultObj.Message);
    //         this.onRefresh();

    //       }
    //       else {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
    //       }
    //     } catch (Exception) {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
    //     }

    //   }, err => {
    //     this.loadingScreenService.stopLoading();
    //     this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

    //   })
    // }

  }

  submit_Approval() {
    this.loadingScreenService.startLoading();

    // var isInvalidExpenseBatch: boolean = false;
    // for (let i = 0; i < this.inEmployeesInitiateSelectedItems.length; i++) {
    //   const element = this.inEmployeesInitiateSelectedItems[i];
    //   if (element.TotalApprovedAmount > element.TotalRequestedAmount) {
    //     isInvalidExpenseBatch = true;
    //     this.alertService.showWarning('Please ensure Total Approved Amount should be less than or equal to requested amount');
    //     break;
    //   }
    //   else if (element.TotalApprovedAmount == null || element.TotalApprovedAmount == '' || element.TotalApprovedAmount == undefined) {
    //     isInvalidExpenseBatch = true;
    //     this.alertService.showWarning('Please enter total approved amount');
    //     break;
    //   }
    // }

    // if (isInvalidExpenseBatch == false) {

    try {


      this.inEmployeesInitiateSelectedItems.forEach(e => {
        e.ExpenseClaimRequestList.forEach(ee => {
          ee.Status = ExpenseClaimRequestStatus.Approved;
          ee.ApprovedAmount = ee.RequestedAmount;
          ee.ModeType = UIMode.Edit;
        });
      });


      var role = new UserHierarchyRole();
      role.IsCompanyHierarchy = false;
      role.RoleCode = this.Role.Code;
      role.RoleId = this.Role.Id;



      var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
      submitExpenseClaimRequestModel.ExpenseClaimRequestList = this.inEmployeesInitiateSelectedItems[0].ExpenseClaimRequestList;
      submitExpenseClaimRequestModel.ModuleProcessAction = 42;
      submitExpenseClaimRequestModel.Role = role;
      submitExpenseClaimRequestModel.ActionProcessingStatus = 30200;
      submitExpenseClaimRequestModel.Remarks = '';
      submitExpenseClaimRequestModel.ClientId = this.inEmployeesInitiateSelectedItems[0].ClientId;
      submitExpenseClaimRequestModel.ClientContractId = this.inEmployeesInitiateSelectedItems[0].ClientContractId;
      submitExpenseClaimRequestModel.CompanyId = this.inEmployeesInitiateSelectedItems[0].CompanyId;

      console.log('data', submitExpenseClaimRequestModel);

      // this.loadingScreenService.stopLoading();

      // return;
      this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
        .subscribe((expenseClaimReqgObj) => {
          try {
            console.log('UPSERT EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
            let resultObj: apiResult = expenseClaimReqgObj;
            if (resultObj.Status && resultObj.Result != null) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(resultObj.Message);
              this.onRefresh();
            }
            else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning('An error occurred : ' + resultObj.Message);
            }
          } catch (Exception) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
          }

        }, err => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

        })

    } catch (error) {
      this.alertService.showWarning('Expense Claim Request Submission : Something bas has happend ! ' + error);

    }


    // console.log('this.inEmployeesInitiateSelectedItems', this.inEmployeesInitiateSelectedItems);
    // var expenseBatch = new ExpenseBatch();
    // expenseBatch = this.inEmployeesInitiateSelectedItems[0] as any;
    // expenseBatch.ModeType = UIMode.Edit;
    // expenseBatch.RejectedClaimIds = [];

    // var role = new UserHierarchyRole();
    // role.IsCompanyHierarchy = false;
    // role.RoleCode = this.Role.Code;
    // role.RoleId = this.Role.Id;

    // var submitExpenseBatchModel = new SubmitExpenseBatchModel();
    // submitExpenseBatchModel.ExpenseBatch = expenseBatch;
    // submitExpenseBatchModel.ModuleProcessAction = 42; // ApproveExpenseClaimRequest
    // submitExpenseBatchModel.Role = role;
    // submitExpenseBatchModel.ActionProcessingStatus = 30200; // ExpenseClaimRequestApproved
    // submitExpenseBatchModel.Remarks = '';
    // submitExpenseBatchModel.ClientId = this.inEmployeesInitiateSelectedItems[0].ClientId;
    // submitExpenseBatchModel.ClientContractId = this.inEmployeesInitiateSelectedItems[0].ClientContractId;
    // submitExpenseBatchModel.CompanyId = this.inEmployeesInitiateSelectedItems[0].CompanyId;
    // console.log('expenseBatch', submitExpenseBatchModel);

    // this.reimbursementService.SubmitExpenseBatch(submitExpenseBatchModel)
    //   .subscribe((expenseBatchReqgObj) => {
    //     try {
    //       console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
    //       let resultObj: apiResult = expenseBatchReqgObj;
    //       if (resultObj.Status && resultObj.Result != null) {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showSuccess(resultObj.Message);
    //         this.onRefresh();

    //       }
    //       else {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
    //       }
    //     } catch (Exception) {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
    //     }

    //   }, err => {
    //     this.loadingScreenService.stopLoading();
    //     this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

    //   })
    // }

  }

  /* #endregion */



  selectClaimRequest(obj) {

    console.log('Object ', obj);

    let updateItem = this.rowData.ExpenseClaimRequestList.find(i => i.Id == obj.Id);
    let index = this.selectedClaimReqs.indexOf(updateItem);

    console.log(index);

    if (index > -1) {
      this.selectedClaimReqs.splice(index, 1);
    }
    else {
      this.selectedClaimReqs.push(obj);
    }

    var totalLength = 0;
    this.rowData.ExpenseClaimRequestList.forEach(e => {
      totalLength = totalLength + 1;
    });
    if (totalLength === this.selectedClaimReqs.length) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }

    this.countOfExpense = this.selectedClaimReqs.length;
    console.log('Selected_Claim_Reqs : ', this.selectedClaimReqs);

  }
  selectAllClaimRequest(event: any) {
    this.selectedClaimReqs = [];

    this.rowData.ExpenseClaimRequestList.forEach(e => {

      event.target.checked == true ? e.isSelected = true : e.isSelected = false
    });


    if (event.target.checked) {
      this.rowData.ExpenseClaimRequestList.forEach(e => {
        this.selectedClaimReqs.push(e);
      });
    } else {
      this.selectedClaimReqs = [];
    }
  }




  onClickingHistorySearchButton() {
    $('#CanCollapse').collapse('hide');
    this.getHistoryDataset();
  }


  getHistoryDataset() {
    this.spinner1 = true;
    this.historyDataset = [];

    let datasource: DataSource = {
      Name: "GetHistoryClaimRequestUIList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }


    let searchElementsForHistoryDataset = _.cloneDeep(this.searchConfigurationForHistroy.SearchElementList);

    console.log(
      'searchElementsForHistoryDataset', searchElementsForHistoryDataset
    );

    this.pageLayoutService.getDataset(datasource, searchElementsForHistoryDataset).subscribe(data => {
      this.spinner1 = false;
      console.log(data);
      if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        this.historyDataset = JSON.parse(data.dynamicObject);
        // this.utilityService.ensureIdUniqueness(this.historyDataset).then((result) => {
        //   result == true ? this.isHistoryDuplicateEntry = true : this.isHistoryDuplicateEntry = false;
        // }, err => {

        // })
      }
      else {
        this.historyDataset = [];
      }
    }, error => {
      this.alertService.showWarning("Error Occured while fetching Records");
      console.error(error);
    })
  }

  historyAngularGridReady(angularGrid: AngularGridInstance) {
    this.historyAngularGrid = angularGrid;
    this.historyGridObj = angularGrid.slickGrid; // grid object
    this.historyDataviewObj = angularGrid.dataView;
  }

  onHistorySelectedRowsChanged(eventData, args) {

    this.historySelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.historyDataviewObj.getItem(row);
        this.historySelectedItems.push(row_data);
      }
    }
    console.log('answer', this.historySelectedItems);
  }


}
