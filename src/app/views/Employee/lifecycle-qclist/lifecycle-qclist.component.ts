import { Component, OnInit, HostListener } from '@angular/core';
import { GridOption, Formatter, Column, Formatters, FieldType, AngularGridInstance, GridService, OnEventArgs } from 'angular-slickgrid';
import { EmployeeService, AlertService, SessionStorage, DownloadService, ImportLayoutService } from 'src/app/_services/service';
import { CandidateListingScreenType } from 'src/app/_services/model/OnBoarding/CandidateListingScreenType';
import { apiResult } from 'src/app/_services/model/apiResult';
import { ELCGrid } from 'src/app/_services/model/Employee/ELCGrid';
import { NavigationExtras, Router } from '@angular/router';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';


import { SessionKeys } from '../../../_services/configs/app.config';
import { WorkflowService } from 'src/app/_services/service/workflow.service';
import { ELCStatus, ELCTRANSACTIONTYPE, EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import _ from 'lodash';
import { ApiRequestType, DataFormat, ImportControlElementType } from '../../generic-import/import-enums';
import { DataSourceType, InputControlType, RowSelectionType, SearchPanelType } from '../../personalised-display/enums';
import { FormInputControlType, RelationWithParent } from '../../generic-form/enums';
import { ImportLayout } from '../../generic-import/import-models';
import Swal from 'sweetalert2';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { BulkELCWorkflowParams } from 'src/app/_services/model/BulkELCWorkflowParams';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { catchError, takeUntil } from 'rxjs/operators';
import { Subject, of } from 'rxjs';


@Component({
  selector: 'app-lifecycle-qclist',
  templateUrl: './lifecycle-qclist.component.html',
  styleUrls: ['./lifecycle-qclist.component.css']
})
export class LifecycleQclistComponent implements OnInit {

  // * Login Properties
  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  userAccessControl;

  // * General Properties
  activeTabName: string = 'claimed';
  spinner: Boolean;
  readonly MODULEPROCESSTRANSACTIONID : string = "ModuleProcessTransactionId";

  // * Unclaimed Tab Properties
  unclaimedGridOptions: GridOption;
  unclaimedColumnDefinitions: Column[];
  unclaimedDataset: any;

  selected_Unclaimed_ModuleProcessTransactionsIds: number[];
  unclaimedList : ELCGrid[]

  unclaimedGridInstance: AngularGridInstance;
  unclaimedGrid: any;
  unclaimedGridService: GridService;
  unclaimedDataView: any;


  // * Claimed Tab Properties
  claimedGridOptions : GridOption;
  claimedColumnDefinitions : Column[];
  claimedDataset: any[];
  claimedSeletedItems : any[]
  claimedBucketangularGrid: AngularGridInstance;
  claimedBucketGridObj: any;
  claimedBucketDataviewObj: any;
 
  claimedList : ELCGrid[];

  TransactionTypeData: Formatter;
  customApprovalFormatter : Formatter;
  viewCTCFormatter : Formatter;
  pendingStatusFormatterForHistory : Formatter;


  historyColumnDefinitions : Column[] = [];
  historyGridOptions: GridOption = {};
  historyDataset: any[] = [];
  isAllenDigital : any;
  businessType : number;


  //Login Details
  CompanyId: any;
  ImplementationCompanyId: any;

  //view CTC
  modalRateset : EmployeeRateset;

  importLayout : ImportLayout = {// Salary Revision
    Id : 1,
    Code : "SalaryRevision",
    Name : 'Employee Salary Revision',
    CompanyId : 5,
    ImportTree : {
      DataSource : {
        Name : "RateSet",
        Type : DataSourceType.View
      },
      RelationWithParent : RelationWithParent.None,
      Children : [
        {
          DataSource : {
            Name : "RateSetProduct",
            Type : DataSourceType.View
          },
          RelationWithParent : RelationWithParent.None,
          Children : [],
          ControlElementsList : []
        }
      ],
      ControlElementsList : []
    },
    ControlElementsList : [
      {//Employee Code
        Label : 'Employee Code',
        FieldName : 'EmployeeCode',
        EntityList : ['RateSet'],
        InputControlType : FormInputControlType.TextBox,
        Type : ImportControlElementType.Basic,
      },
      {//Employee Name
        Label : 'Employee Name',
        FieldName : 'EmployeeName',
        EntityList : ['RateSet'],
        InputControlType : FormInputControlType.TextBox,
        Type : ImportControlElementType.Basic
      },
      {// Client Name
        Label : 'Client Name',
        FieldName : 'ClientName',
        EntityList : ['RateSet'],
        InputControlType : FormInputControlType.TextBox,
        Type : ImportControlElementType.Basic
      }, 
      {// Date of joining
        Label : 'Date of Joining',
        FieldName : 'DOJ',
        EntityList : ['RateSet'],
        InputControlType : FormInputControlType.TextBox,
        Type : ImportControlElementType.Basic
      },
      {// Pan Card
        Label : 'PAN Card',
        FieldName : 'PANCard',
        EntityList : ['RateSet'],
        InputControlType : FormInputControlType.TextBox,
        Type : ImportControlElementType.Basic
      },
      {//Annual Salary
        Label : 'Annual Salary',
        FieldName : "AnnualSalary",
        EntityList : ['RateSet'],
        InputControlType : FormInputControlType.TextBox,
        Type : ImportControlElementType.Basic
      },
      //#region Extra Columns
      // {//State
      //   Label : 'State',
      //   FieldName : 'State',
      //   EntityList : ['RateSet'],
      //   Type : ImportControlElementType.Basic,
      //   InputControlType : FormInputControlType.DropDown,
      //   DataSource : {
      //     Name : 'State',
      //     Type : DataSourceType.View,
      //     IsCoreEntity : false
      //   },
      //   SearchElements : [
      //     {
      //       FieldName : 'Status',
      //       Value : 1
      //     }
      //   ],
      //   DisplayField : 'Name',
        
      // },
      // {//Industry
      //   Label : 'Industry',
      //   FieldName : 'Industry',
      //   EntityList : ['RateSet'],
      //   InputControlType : FormInputControlType.DropDown,
      //   DataSource : {
      //     Name : 'Industry',
      //     Type : DataSourceType.View,
      //     IsCoreEntity : true
      //   },
      //   Type : ImportControlElementType.Basic,
      //   DisplayField : "Name"
      // },
      // {//Skill Category
      //   Label : 'Skill Category',
      //   FieldName : 'SkillCategory',
      //   EntityList : ['RateSet'],
      //   InputControlType : FormInputControlType.DropDown,
      //   DataSource : {
      //     Name : 'GroupedSkillCategoryView',
      //     Type : DataSourceType.View,
      //     IsCoreEntity : true
      //   },
      //   DisplayField : "name",
      //   Type : ImportControlElementType.Basic,
      //   ParentFields : ["State" , "Industry"],
      // },
      // {//Zone
      //   Label : 'Zone',
      //   FieldName : 'Zone',
      //   EntityList : ['RateSet'],
      //   InputControlType : FormInputControlType.DropDown,
      //   DataSource : {
      //     Name : 'GroupedZoneView',
      //     Type : DataSourceType.View,
      //     IsCoreEntity : true
      //   },
      //   DisplayField : "Name",
      //   Type : ImportControlElementType.Basic,
      //   ParentFields : ["State" , "Industry"],
      // },
      // {// Salary Type
      //   Label : 'Salary Type',
      //   FieldName : 'SalaryBreakUpType',
      //   EntityList : ['RateSet'],
      //   InputControlType : FormInputControlType.DropDown,
      //   DataSource : {
      //     Name : "",
      //     Type : DataSourceType.FixedValues
      //   },
      //   DropDownList : ["CTC" , "GROSS" , "NetPay"],
      //   Type : ImportControlElementType.Basic
      // },
      // {// Pay group Id
      //   Label : 'Pay Group Id',
      //   FieldName : 'PayGroupId',
      //   EntityList : ['RateSet'],
      //   InputControlType : FormInputControlType.TextBox,
      //   Type : ImportControlElementType.Basic,
      // },
      // {// Pay group
      //   Label : 'Pay Group',
      //   FieldName : 'PayGroup',
      //   EntityList : ['RateSet'],
      //   InputControlType : FormInputControlType.TextBox,
      //   Type : ImportControlElementType.Basic,
      //   DataSource : {
      //     Name : 'PayGroupContractView',
      //     IsCoreEntity : false,
      //     Type : DataSourceType.View
      //   },
      //   SearchElements : [
      //     {
      //       FieldName : "ClientContractId",
      //       Value : 4
      //     }
      //   ],
      //   DisplayField : 'Name',

        
      // },
      // {// Effective date
      //   Label : "Effective Date",
      //   FieldName : "EffectiveDateInt",
      //   EntityList : ["RateSet"],
      //   InputControlType : FormInputControlType.TextBox,
      //   Type : ImportControlElementType.Basic

      // },
      // {// Pay period
      //   Label : "Effective Pay Period",
      //   FieldName : "EffectivePeriod",
      //   EntityList : ["RateSet"],
      //   InputControlType : FormInputControlType.DropDown,
      //   Type : ImportControlElementType.Basic,
      //   DataSource : {
      //     Name : 'GetPayPeriodUsingClientContract',
      //     Type : DataSourceType.SP,
      //     IsCoreEntity : false
      //   },
      //   SearchElements : [
      //     {
      //       FieldName : '@clientcontractId',
      //       GetValueFromUser : true,
      //       RefrenceFieldNameInSearchElements : '@clientcontractId',
      //       Value : null
            
      //     },
      //     // {
      //     //   DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
      //     //   DefaultValue: "218",
      //     //   DisplayFieldInDataset: "Name",
      //     //   DisplayName: "Team Name",
      //     //   DropDownList: [],
      //     //   FieldName: "@teamId",
      //     //   ForeignKeyColumnNameInDataset: "Id",
      //     //   InputControlType: 2,
      //     //   IsIncludedInDefaultSearch: true,
      //     //   MultipleValues: [],
      //     //   TriggerSearchOnChange: false,
      //     //   Value: null,
      //     //   GetValueFromUser : true,
      //     //   RefrenceFieldNameInSearchElements : '@teamId',
      //     //   SendElementToGridDataSource : true,

      //     // },
      //   ],
      //   DisplayField : 'PayCyclePeriodName',
      // },
      // {// Auto Breakup
      //   Label : 'Is Auto Breakup',
      //   FieldName : "IsAutoBreakUp",
      //   EntityList : ["RateSet"],
      //   InputControlType : FormInputControlType.DropDown,
      //   Type : ImportControlElementType.Basic,
      //   DataSource : {
      //     Name : '',
      //     Type : DataSourceType.FixedValues
      //   },
      //   DropDownList : [ {value : 'True'} ,{ value : 'False' }],
      //   DisplayField : 'value',
      //   ParentFields : [],
      // },
      //#endregion
      {// Products
        FieldName : '',
        Type : ImportControlElementType.Dynamic,
        DataSource : {
          Name : 'GetPaygroupProductsForBulkDisplay',
          IsCoreEntity : false,
          Type : DataSourceType.SP
        },
        SearchElements : [
          
          {
            DisplayName : "Pay Group",
            FieldName : '@paygroupId',
            Value : null,
            GetValueFromUser : true,
            DataSource : {
              Name : "select * from paygroup where Id in (4,5,6,7,8,9) for json auto",
              Type : DataSourceType.None,
              IsCoreEntity : false
            },
            DisplayFieldInDataset : 'Name',
            ForeignKeyColumnNameInDataset : 'Id',
            InputControlType : InputControlType.DropDown,
            IsIncludedInDefaultSearch : true,
            TriggerSearchOnChange : false,
            MultipleValues : null,
            DropDownList : [],
            ParentFields : null,
            ParentHasValue : [],
            SendElementToGridDataSource : true,
            RefrenceFieldNameInSearchElements : "@paygroupId"
          },
          
        ],
        DisplayField : 'Name',
        ValueField : 'ProductCode',
        EntityList : ['RateSetProduct'],
        

      }

      
    ],
    CreateExcelConfiguration : {
      DataSource: {
        Name : 'FillDataForSalaryRevisionImport',
        Type : DataSourceType.SP,
        IsCoreEntity : false,
      },
      SearchConfiguration : {
        SearchElementList : [
          {
            DataSource: {
              EntityType: 0,
              IsCoreEntity: false,
              Name: "client",
              Type: 1
            },
            DefaultValue : "1846",
            DisplayFieldInDataset : "Name",
            FieldName : "@clientId",
            DisplayName : 'Client Name',
            ForeignKeyColumnNameInDataset : "Id",
            InputControlType : InputControlType.AutoFillTextBox,
            IsIncludedInDefaultSearch : true,
            TriggerSearchOnChange : false,
            MultipleValues : null,
            Value : null,
            DropDownList : [],
            ParentFields : null,
            ParentHasValue : [],
            GetValueFromUser : false,
            SendElementToGridDataSource : true
          },
          { 
            DataSource : {
              IsCoreEntity : false,
              Name : "clientcontract",
              Type : 1
            },
            DefaultValue : '230',
            DisplayFieldInDataset : 'Name',
            FieldName : "@clientcontractId",
            DisplayName : 'Contract Name',
            ForeignKeyColumnNameInDataset : "Id",
            IsIncludedInDefaultSearch : true,
            InputControlType : InputControlType.AutoFillTextBox,
            Value : null,
            TriggerSearchOnChange : false,
            ReadOnly : true,
            DropDownList : [],
            ParentHasValue : [],
            ParentFields : ["@clientId"],
            MultipleValues : null,
            GetValueFromUser : false,
            SendElementToGridDataSource : true
          } ,
          {
            DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
            DefaultValue: "218",
            DisplayFieldInDataset: "Name",
            DisplayName: "Team Name",
            DropDownList: [],
            FieldName: "@teamId",
            ForeignKeyColumnNameInDataset: "Id",
            InputControlType: 2,
            IsIncludedInDefaultSearch: true,
            MultipleValues: [],
            ParentFields: ["@clientcontractId"],
            ParentHasValue: [],
            ReadOnly: true,
            RelationalOperatorValue: null,
            RelationalOperatorsRequired: false,
            TriggerSearchOnChange: false,
            Value: null,
            GetValueFromUser : false,
            SendElementToGridDataSource : true
          },
          {
            DisplayName : "Pay Group",
            FieldName : '@paygroupId',
            Value : null,
            GetValueFromUser : true,
            DataSource : {
              Name : "select * from paygroup where Id in (4,5,6,7,8,9) for json auto",
              Type : DataSourceType.None,
              IsCoreEntity : false
            },
            DisplayFieldInDataset : 'Name',
            ForeignKeyColumnNameInDataset : 'Id',
            InputControlType : InputControlType.DropDown,
            IsIncludedInDefaultSearch : true,
            TriggerSearchOnChange : false,
            MultipleValues : null,
            DropDownList : [],
            ParentFields : null,
            ParentHasValue : [],
            SendElementToGridDataSource : true,
          },
        ],
        
        SearchPanelType : SearchPanelType.Panel,
        SearchButtonRequired : true,
        ClearButtonRequired : false
      },
      GridConfiguration : {
        DataSource : {
          Name : "FillDataForSalaryRevisionImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false, 
        },
        ColumnDefinitionList : [
          {
            Id : "EmployeeCode",
            FieldName : "EmployeeCode",
            DisplayName : "Employee Code",
            IsFilterable : true,
            Width : 0
          },
          {
            Id : "EmployeeName",
            FieldName : "EmployeeName",
            DisplayName : "Employee Name"
          },
          {
            Id : "ClientName",
            FieldName : "ClientName",
            DisplayName : "ClientName",
            IsFilterable : true,

            Width : 0
          },
          {
            Id : "DOJ",
            FieldName : "DOJ",
            DisplayName : "Date of Joining",
            IsFilterable : true,
            Width : 0,
            DataType : "date"
          },
          

        ],
        ButtonList : [],
        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,

        IsSummaryRequired: false,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,

        //Row Selection
        IsMultiSelectAllowed : true,
        RowSelectionCheckBoxRequired : true,
        RowSelectionType : RowSelectionType.Multiple
      },
      FillWithDataAllowed : true


    },
    SaveExcelDataConfiguration : {
      DataFormat : DataFormat.EntityMappedData,
      EntityRelations : {
      },
      UniqueIdentifiers : {},
      UseGeneralApi : false,
      ApiName : 'api/Employee/InsertBulkELCTransaction',
      ApiRequestType : ApiRequestType.post,
      UseGeneralSP : false,
      DataSource : {
        Name : "EmploymentDetailsImport",
        Type : DataSourceType.SP,
        IsCoreEntity : false
      },
      BeforeUploadGridConfiguration : {
        DataSource : {
          Name : "FillDataForSalaryRevisionImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false, 
        },  
        ColumnDefinitionList : [  
          {
            Id : "Employee Code",
            FieldName : "Employee Code",
            DisplayName : "Employee Code",
            IsFilterable : true,
            Width : 0
          },
          {
            Id : "Employee Name",
            FieldName : "Employee Name",
            DisplayName : "Employee Name",
            IsFilterable : true,
          },
          {
            Id : "Client Name",
            FieldName : "Client Name",
            DisplayName : "Client Name",
            IsFilterable : true,

            Width : 0
          },  
          {
            Id : "Annual Salary",
            FieldName : "Annual Salary",
            DisplayName : "Annual Salary",
            IsFilterable : true,

            Width : 0
          },  
          {
            Id : 'Is Auto Breakup',
            FieldName : 'Is Auto Breakup',
            DisplayName : 'Is Auto Breakup',
            IsFilterable : true,
            Width : 0
          }
          

        ],
        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,

        IsSummaryRequired: false,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,

        //Row Selection
        IsMultiSelectAllowed : true,
        RowSelectionCheckBoxRequired : false,
        RowSelectionType : RowSelectionType.Multiple
      },
      DisplayDataGridAfterApiResult : true,
      ApiResultGridConfiguration : {
        DataSource : {
          Name : "FillDataForSalaryRevisionImport",
          Type : DataSourceType.SP,
          IsCoreEntity : false, 
        },  
        ColumnDefinitionList : [
          {
            Id : "EmployeeCode",
            FieldName : "EmployeeCode",
            DisplayName : "Employee Code",
            IsFilterable : true,
            Width : 0
          },
          {
            Id : "EmployeeName",
            FieldName : "EmployeeName",
            DisplayName : "Employee Name"
          },
          {
            Id : "ClientName",
            FieldName : "ClientName",
            DisplayName : "Client Name",
            IsFilterable : true,

            Width : 0
          },
          {
            Id : "StatusDisplay",
            FieldName : "StatusDisplay",
            DisplayName : "Status",
            IsFilterable : true,
            Width : 0,

          },
          {
            Id : "Message",
            FieldName : "Message",
            DisplayName : "Error Message",
            IsFilterable : false,
            Width : 0
          }
          

        ],
        ShowDataOnLoad: true,
        IsPaginationRequired: false,
        DisplayFilterByDefault: false,
        EnableColumnReArrangement: true,
        IsColumnPickerRequired: true,

        IsSummaryRequired: false,
        IsGroupingEnabled: false,
        DefaultGroupingFields: ["Code", "Name"],
        PinnedRowCount: -1,
        PinnedColumnCount: -1,
        PinRowFromBottom: true,

        //Row Selection
        IsMultiSelectAllowed : true,
        RowSelectionCheckBoxRequired : true,
        RowSelectionType : RowSelectionType.Multiple
      },

      ShowAlertWarningIfFailed : true,
      WarningMessage : "Salary Revision For some records have failed! Please check grid for details."
      
    },
    Status : true

  };
  IsExtraTabRequired : boolean = true;
    RoleCode: any;
    AlternativeText : any = 'Claimed';
    AlternativeText1 : any = "Unclaimed";

  isHistoryHidden : boolean = true;

  private unsubscribe$ = new Subject<void>();

  constructor(
    private employeeService: EmployeeService,
    private alertService: AlertService,
    private router: Router,
    private loadingScreenService : LoadingScreenService,
    private sessionService : SessionStorage,
    private workFlowApi: WorkflowService,
    private importLayoutService : ImportLayoutService,
    private downloadService : DownloadService

  ) {}

  ngOnInit() {
    
    this.customApprovalFormatter = (row : number , column : number , value : any , columnDef : Column, dataContext :any) =>
      value ? `<i class="mdi mdi-arrow-expand" style="cursor:pointer; font-size : 23px"></i>` : '<i class="mdi mdi-arrow-expand" style="cursor:pointer; font-size : 23px"></i>';

    this.TransactionTypeData = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {
      return (dataContext.ELCTransactionType == 2 ? "Salary Revision" : 
      dataContext.ELCTransactionType == 3 ? "Relocation" : 
      dataContext.ELCTransactionType == 4 ? "ReDesignation" : 
      dataContext.ELCTransactionType == 5 ? "Salary & Location" : 
      dataContext.ELCTransactionType == 6 ? "Salary & Designation" : 
      dataContext.ELCTransactionType == 7 ? "Location & Designation" : 
      dataContext.ELCTransactionType == 8 ? "Contract Extension" : 
      dataContext.ELCTransactionType == 9 ? "Salary / Location / Designation" : 
      dataContext.ELCTransactionType == 10 ? "SalaryRevision / ContractExtension" : 
      "");
    }
   
    this.viewCTCFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value ? ` <button  class="btn btn-default btn-sm" title="View Calculated CTC" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
    class="fa fa-files-o m-r-xs"></i> View CTC </button>` : '';
    
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;  
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;

    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;    
    const ACID = environment.environment.ACID;
    this.isAllenDigital = (Number(ACID) === 1988 && ( this.businessType === 1 ||  this.businessType === 2)) ? true : false;
    
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    var LstCompanySettings = [];
    LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));  
    if(LstCompanySettings != null && LstCompanySettings.length > 0)      {
      
    LstCompanySettings = LstCompanySettings.filter(a=>a.RoleCode == this.RoleCode);
    if(LstCompanySettings.length > 0){
        var isExist = LstCompanySettings.find(z=>z.ModuleName == 'ELCQcList');
        if(isExist != undefined){
           this.IsExtraTabRequired = isExist.IsExtraTabRequired;
           this.AlternativeText = isExist.AlternativeText;
           this.AlternativeText1 = isExist.AlternativeText1;

        }
    }
  }
    (this.AlternativeText == null ||  this.AlternativeText == '') ? "Claimed" : true;
    (this.AlternativeText1 == null ||  this.AlternativeText1 == '') ? "Unclaimed" : true;
    this.activeTabName = "claimed";
    this.initializeGrids();
    this.loadclaimedRecords(true);
   // this.claimedDataset = this.mockData(999);
    
    this.pendingStatusFormatterForHistory = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {

      if (dataContext.TransactionStatusText != 'Pending') {
        return `<div style="text-align: center;"><span>--</span></div>`;
      }
      let isRequestClaimed = false;
      if (value.length > 0 && value[0].ActionTakenBy) {
        isRequestClaimed = (value[0].ActionTakenBy != '' && value[0].ActionTakenBy != null && value[0].ActionTakenBy != undefined) ? true : false;
      }
      if (isRequestClaimed) {
        return value[0].ActionTakenBy;
      } else {
        return 'CORPORATE HR (unclaimed)'
      }

    }
  }
  initializeGrids() {
    this.claimedColumnDefinitions = [];
    this.claimedGridOptions = {
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
          selectActiveRow: false
      },
      checkboxSelector: {
          // remove the unnecessary "Select All" checkbox in header when in single selection mode
          hideSelectAllCheckbox: false
      },
      datasetIdPropertyName: "Id"
    };

    this.claimedColumnDefinitions = [

    { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.number, minWidth: 60, maxWidth: 150 },
    { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
    { id: 'ClientName', name: 'Client Name', field: 'ClientName', sortable: true, filterable: true, type: FieldType.string },
    { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, type: FieldType.date, formatter: Formatters.dateIso },
    { id: 'EffectivePayPeriod', name: 'Effective Pay Period', field: 'EffectivePayPeriod', sortable: true, minWidth: 60, },
    {
      id: 'ELCTransactionType',
      field: 'ELCTransactionType',
      name: 'Transaction Type',
      formatter: this.TransactionTypeData,
      minWidth: 120,
    },
    {
      id: 'viewCTC',
      field: 'SalaryRevised',
      name: '',
      formatter: this.viewCTCFormatter,
      width : 70,
      minWidth: 100,

      onCellClick : (e: Event, args: OnEventArgs) => {
        
        let employeeObject = args.dataContext;

        if(!employeeObject.SalaryRevised){
          return;
        }

        let elcTransaction = JSON.parse(employeeObject.EmployeeLifeCycleTransaction);

        if(elcTransaction == undefined || elcTransaction == null){
          this.alertService.showWarning("ELC Transaction undefined! Please contact support");
          return;
        }

        let ratesets = JSON.parse(elcTransaction.EmployeeRateset);

        if(ratesets != undefined && ratesets != null && ratesets.length > 0){
          let rateset = ratesets[0];

          rateset.RatesetProducts = _.orderBy(rateset.RatesetProducts , ['DisplayOrder'] , ["asc"]);
          console.log("ELC ::" , elcTransaction , rateset);
          
          this.modalRateset =  rateset;

          $('#viewCTC').modal('show');
        }
        else{
          this.alertService.showInfo("No Rateset Found!")
        }
        

      }
    },
    {
      id: 'edit',
      field: 'Id',
      excludeFromHeaderMenu: true,
      formatter: this.customApprovalFormatter,
      minWidth: 30,
      maxWidth: 30,
      // use onCellClick OR grid.onClick.subscribe which you can see down below
      onCellClick: (e: Event, args: OnEventArgs) => {
         console.log("clicked here");
         console.log("this");
                            console.log(args.dataContext);

                            sessionStorage.removeItem('previousPath');
                            sessionStorage.setItem('previousPath', '/app/componentUI');

                            this.router.navigate(['app/elc/lifecycle_qc'], {
                                queryParams: {
                                    "Idx": btoa(args.dataContext.Id),
                                    "Cdx": btoa(JSON.stringify(args.dataContext)),
                                }
                            });
                           
      }
    },
    ];


     

  
    this.unclaimedGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: "grid-container",
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
      enablePagination: true,
      pagination: {
        pageSizes: [10, 15, 20, 25, 39, 40, 50, 75, 100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      },
      presets: {
        pagination: { pageNumber: 1, pageSize: 15 },
      },
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false,
      },
      
      datasetIdPropertyName: "Id",
    };
    this.unclaimedColumnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      // { id: 'ClientContractCode', name: 'Client Code', field: 'ClientContractCode', sortable: true, filterable: true, type: FieldType.string },
      {
        id: "EmployeeCode",
        name: "Employee Code",
        field: "EmployeeCode",
        sortable: true,
        filterable: true,
        type: FieldType.number,
        minWidth: 60,
        maxWidth: 150,
      },
      {
        id: "EmployeeName",
        name: "Employee Name",
        field: "EmployeeName",
        formatter: Formatters.uppercase,
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: "ClientName",
        name: "Client Name",
        field: "ClientName",
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: "EffectiveDate",
        name: "Effective Date",
        field: "EffectiveDate",
        sortable: true,
        filterable: true,
        type: FieldType.date,
        formatter: Formatters.dateIso,
      },
      {
        id: "EffectivePayPeriod",
        name: "Effective Pay Period",
        field: "EffectivePayPeriod",
        sortable: true,
        minWidth: 60,
      },
      {
        id: "ELCTransactionType",
        field: "ELCTransactionType",
        name: "Transaction Type",
        formatter: this.TransactionTypeData,
        minWidth: 120,
      },
    ];


    this.historyGridOptions = {
      asyncEditorLoading: false,
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: false,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
      enableAutoTooltip : true,
      pagination: {
        pageSizes: [10, 15, 20, 25, 39, 40, 50, 75, 100],
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
      datasetIdPropertyName: "Id"
    };

    

    this.historyColumnDefinitions = [
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.string, minWidth: 60, maxWidth: 150 },
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
      { id: 'ELCTransactionType',field: 'ELCTransactionType',name: 'Transaction Type',formatter: this.TransactionTypeData,},
      { id: 'RequestedAt', name: 'Transaction Requested At', field: 'RequestedAt', sortable: true, filterable: false, type: FieldType.string, formatter : this.actionTakenFormatter },
      { id: 'Status', name: 'Transaction Status', field: 'TransactionStatusText', sortable: true, filterable: true, type: FieldType.string, formatter : this.StatusFormatter },
      { id: 'ActionBy', name: 'Approved By/ Rejected By', field: 'ActionTakenBy', sortable: true, filterable: false, type: FieldType.string, formatter : this.actionTakenFormatter},
      { id: 'ActionAt', name: 'Approved At/ Rejected At', field: 'ActionTakenAt', sortable: true, filterable: false, type: FieldType.string, formatter : this.actionTakenFormatter},
      { id: 'Remarks', name: 'Remarks', field: 'QcRemarks', sortable: true, filterable: false, type: FieldType.string, formatter : this.nullFormatter },
    ];

  }

  loadData(event) {
    console.log(event);
    if (event.nextId == "unclaimed") {
      if(this.unclaimedDataset == undefined || this.unclaimedDataset == null){
        this.loadUnClaimedRecords();
      }
    } else if (event.nextId == "claimed") {
      if(this.claimedDataset == undefined || this.claimedDataset == null){
        this.loadclaimedRecords(true);
      
      }
      
    }
    this.activeTabName = event.nextId;
  }

  loadclaimedRecords(isRefresh: boolean) {
    console.log("inside load claimed");

    // this.unclaimedDataset = this.mockData(999);
    let screenType = CandidateListingScreenType.Pending;
    this.spinner = true;
    this.claimedDataset = [];
    this.employeeService.getEmployeeList(screenType, this.RoleId, null)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      (data) => {
        this.spinner = false;
        let apiResult: apiResult = data;
        console.log(apiResult);
        if (apiResult.Status) {
          if (apiResult.Result != "") {
            this.claimedList = JSON.parse(apiResult.Result);
            this.claimedDataset = this.claimedList;

            this.claimedDataset.forEach(x => {
              let elcTransaction : EmployeeLifeCycleTransaction= JSON.parse(x.EmployeeLifeCycleTransaction);
              if(elcTransaction.ELCTransactionTypeId == ELCTRANSACTIONTYPE.SalaryRevision ||
                  elcTransaction.ELCTransactionTypeId == ELCTRANSACTIONTYPE.SalaryRevision_ReDesignation ||
                  elcTransaction.ELCTransactionTypeId == ELCTRANSACTIONTYPE.SalaryRevision_ReLocation ||
                  elcTransaction.ELCTransactionTypeId == ELCTRANSACTIONTYPE.SalaryRevision_ReLocation_ReDesignation 
                ){
                  x["SalaryRevised"] = true;
              }
              else {
                x["SalaryRevised"] = false;
              }

            })

            console.log(this.claimedDataset);
          } else {
            this.alertService.showInfo(apiResult.Message);
          }
        } else {
          this.alertService.showInfo(apiResult.Message);
        }
      },
      (error) => {
        this.spinner = false;
        this.alertService.showWarning("Error occured while Fetching details!");
      }
    );
  }

  loadUnClaimedRecords() {
    console.log("inside load unclaimed");

    // this.unclaimedDataset = this.mockData(999);
    let screenType = CandidateListingScreenType.Team;
    this.spinner = true;
    this.employeeService.getEmployeeList(screenType, this.RoleId, null)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe(
      (data) => {
        this.spinner = false;
        let apiResult: apiResult = data;
        console.log(apiResult);
        if (apiResult.Status) {
          if (apiResult.Result != "") {
            this.unclaimedList = JSON.parse(apiResult.Result);
            this.unclaimedDataset = this.unclaimedList;
            console.log(this.unclaimedDataset);
          } else {
            this.alertService.showInfo(apiResult.Message);
          }
        } else {
          this.alertService.showInfo(apiResult.Message);
        }
      },
      (error) => {
        this.spinner = false;
        this.alertService.showWarning("Error occured while Fetching details!");
      }
    );
  }

  refreshCurrentTab(){
    if(this.activeTabName == "claimed"){
      this.loadclaimedRecords(true);
    }
    else if(this.activeTabName == "unclaimed"){
      this.loadUnClaimedRecords();
    }

  }

  unClaimedGridReady(angularGrid: AngularGridInstance) {
    this.unclaimedGridInstance = angularGrid;
    this.unclaimedDataView = angularGrid.dataView;
    this.unclaimedGrid = angularGrid.slickGrid;
    this.unclaimedGridService = angularGrid.gridService;
  }

  @HostListener("window:scroll", ["$event"])
  onWindowScroll(e) {
    if (window.pageYOffset > 50) {
      let element = document.getElementById("navbar");
      element.classList.add("sticky");
    } else {
      let element = document.getElementById("navbar");
      element.classList.remove("sticky");
    }
  }

  mockData(count: number) {
    const mockDatadet = [];

    for (let i = 0; i < count; ++i) {
      const randomCode = Math.floor(Math.random() * 1000);

      mockDatadet[i] = {
        Id: i,
        EmployeeCode: randomCode,
        EmployeeName: "Name " + i.toString(),
        ClientName: "client " + i.toString(),
        EffectiveDate: "20 May 2005",
        EffectivePayPeriod: "April 2020",
      };
    }

    return mockDatadet;
  }

  onClaimedSelectedRowsChanged(e,args){
    this.claimedSeletedItems = [];
    
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.claimedBucketDataviewObj.getItem(row);
        this.claimedSeletedItems.push(row_data);
      }
    }
    console.log('answer', this.claimedSeletedItems);
  }

  onSelectedRowsChanged(data, args) {
    this.selected_Unclaimed_ModuleProcessTransactionsIds = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      console.log("length ar", args.rows.length);
      for (let i = 0; i < args.rows.length; i++) {
        console.log("element4", args.rows);
        var row = args.rows[i];
        var row_data = this.unclaimedDataView.getItem(row);
        this.selected_Unclaimed_ModuleProcessTransactionsIds.push(row_data[this.MODULEPROCESSTRANSACTIONID]);
      }
    }

    console.log("answer", this.selected_Unclaimed_ModuleProcessTransactionsIds);
  }



  claimRequest() {
    console.log("in claim request button");
    console.log(this.selected_Unclaimed_ModuleProcessTransactionsIds);

    if (this.selected_Unclaimed_ModuleProcessTransactionsIds == undefined ||
      this.selected_Unclaimed_ModuleProcessTransactionsIds == null ||
      this.selected_Unclaimed_ModuleProcessTransactionsIds.length == 0) {
      this.alertService.showWarning('No request selected to Claim');
      return;
  }



  this.alertService.confirmSwal("Are you sure?", 'Are you sure you want to claim the selected request(s)', "Yes, Continue").then(result => {
      this.loadingScreenService.startLoading();
      try {

          
          this.spinner = true;
          var param = { ModuleProcessTransactionIds: this.selected_Unclaimed_ModuleProcessTransactionsIds, UserId: this.UserId };


          this.workFlowApi.UpdatePendingAtUserId(JSON.stringify(param)).subscribe((data) => {
              if (data != null && data != undefined && data.Status) {
                  this.unclaimedList = this.unclaimedList.filter(x => data.Result.ModuleProcessTransactionIds.find(y => y == x.ModuleProcessTransactionId) == null);
                  this.unclaimedDataset = null;
                  this.unclaimedDataset = this.unclaimedList;

                  this.alertService.showSuccess("Requests claimed successfully");
                  this.activeTabName = 'claimed';
                  

                  
                  this.spinner = false;
                  this.loadclaimedRecords(true);

              }
              else {
                  this.spinner = false;

                  this.alertService.showWarning('Failed to claim the request(s): ' + (data != undefined && data != null && data.Message != null ? data.Message : ''));
              }
          });
      }
      catch (error) {
          this.spinner = false;
          this.alertService.showWarning(error.message);
      }
      finally {
          this.selected_Unclaimed_ModuleProcessTransactionsIds = [];
          this.loadingScreenService.stopLoading();
      }

  })   
  }

  claimedGridReady(angularGrid: AngularGridInstance){
    this.claimedBucketangularGrid = angularGrid;
    this.claimedBucketGridObj = angularGrid && angularGrid.slickGrid || {};
    this.claimedBucketDataviewObj = angularGrid.dataView;
  }

  modal_dismiss_Current_SalaryBreakup(){
    $('#viewCTC').modal('hide');
    this.modalRateset = null;
  }

  // downloadCTCSheet(){
  //   // this.importLayout = this.database.find( x => x.Code === this.code);
  //   console.log(this.importLayout);

  //   if(this.claimedSeletedItems == null || this.claimedSeletedItems.length <= 0){
  //     this.alertService.showInfo("Please Choose one or more records!");
  //     return;
  //   }

  //   let salaryNotRevised = this.claimedSeletedItems.find(x => !x.SalaryRevised);
    
  //   if(salaryNotRevised != undefined && salaryNotRevised != null){
  //     this.alertService.showInfo("Please choose employess where transaction type includes salary revision only");
  //   }

  //   let fillData = _.cloneDeep(this.claimedSeletedItems);

  //   for(let data of fillData){
  //     let elctran = JSON.parse(data.EmployeeLifeCycleTransaction);

  //     let ratesets = JSON.parse(elctran.EmployeeRateset);

  //     if(ratesets != undefined && ratesets != null && ratesets.length > 0){
  //       let rateset = ratesets[0];

  //       // rateset.RatesetProducts = _.orderBy(rateset.RatesetProducts , ['DisplayOrder'] , ["asc"]);
  //       // console.log("ELC ::" , elctran , rateset);

  //       for(let product of rateset.RatesetProducts){
  //         data[product.ProductCode] = product.Value
  //       }        

  //       data["AnnualSalary"] = rateset.AnnualSalary;

  //     }

  //   }

    
  //   for(let controlElement of this.importLayout.ControlElementsList){
      
  //     if(controlElement.SearchElements != undefined && controlElement.SearchElements != null 
  //       && controlElement.SearchElements.length >= 0){
  //         for(let searchElement of controlElement.SearchElements){
  //           if(searchElement.GetValueFromUser){
  //             // this.searchElemetsList.push(searchElement);
  //             let refrenceSearchElement = this.searchElementList.find( x => x.FieldName == searchElement.RefrenceFieldNameInSearchElements );
  //             if(refrenceSearchElement != null){
  //               searchElement.Value = refrenceSearchElement.Value;
  //             }
  //           }
  //         }
  //     }
  //   }

  //   console.log("Fill Data ::" , fillData);

  //   this.loadingScreenService.startLoading();
  //   this.importLayoutService.getExcelTemplate(this.importLayout , fillData , this.searchElementList).subscribe(
  //     data => {
  //       this.loadingScreenService.stopLoading();
  //       console.log(data);
  //       if(data.Status){
  //         this.downloadService.base64ToBlob(data.dynamicObject , 'CTCSheet');
  //       }
  //       else{
  //         this.alertService.showWarning(data.Message);
  //       }
  //     },
  //     error => {
  //       this.loadingScreenService.stopLoading();
  //       console.log(error);
  //     }
  //   )
  // }
  
  updateQcELCTransaction(isApproved : boolean){
    if(this.claimedSeletedItems == null || this.claimedSeletedItems.length <= 0){
      this.alertService.showInfo("Please Choose one or more records!");
      return;
    }

    let workFlowInitiationList : WorkFlowInitiation[] = [];

    

    // CONFIMATION ACTION - OK OR CANCEL THE SAVE OR SUBMIT ACTION
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Overall Request Remarks',
      animation: false,
      showCancelButton: true, // There won't be any cancel button
      input: 'textarea',
      // inputValue:  result.ApproverRemarks ,
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

        for(let obj of  this.claimedSeletedItems){
          let workFlowInitiation = new WorkFlowInitiation();
          let elcTran : EmployeeLifeCycleTransaction = JSON.parse(obj.EmployeeLifeCycleTransaction);
          
          let gender = obj.hasOwnProperty("EmployeeDetails") ? obj.EmployeeDetails[0].Gender : 0;
          elcTran["Gender"] = gender ;
          elcTran.Status = isApproved? ELCStatus.Approved : ELCStatus.Rejected;
          elcTran.QcRemarks =  jsonStr;
          
          if(typeof elcTran["EmployeeRateset"] == 'string' && elcTran["EmployeeRateset"] != ''){
            elcTran.EmployeeRatesets = JSON.parse(elcTran["EmployeeRateset"]);
          }
    
          workFlowInitiation.Remarks = jsonStr;
          workFlowInitiation.EntityId = obj.EmployeeId;
          workFlowInitiation.EntityType = EntityType.Employee;
          workFlowInitiation.CompanyId = this.CompanyId;
          workFlowInitiation.ClientContractId = obj.ClientContractId;
          workFlowInitiation.ClientId = obj.ClientId;
    
          workFlowInitiation.ActionProcessingStatus = 15500;
          workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
          workFlowInitiation.WorkFlowAction =  isApproved ? 69 : 68;
          workFlowInitiation.RoleId = this.RoleId;
          workFlowInitiation.DependentObject = { "ClientContractId": obj.ClientContractId, "EmployeeLifeCycleTransaction": elcTran };
          workFlowInitiation.UserInterfaceControlLst = this.userAccessControl.filter(a => a.ControlName == "btn_qc_submit");
    
          workFlowInitiationList.push(workFlowInitiation);  
        }

        try {
          this.finalSubmit(workFlowInitiationList);
        } 
        catch (error) {
          this.alertService.showWarning(error + " Failed! ELC submit wasn't completed");
          this.loadingScreenService.stopLoading() ;
        }

      }
      else if (
        /* Read more about handling dismissals below */
        inputValue.dismiss === Swal.DismissReason.cancel

      ) {
      }

    })

    
  }

  // WORKFLOW INITIATION 
  finalSubmit(workFlowJsonObj: WorkFlowInitiation[]): void {

    console.log(workFlowJsonObj);
    let bulkElcParams : BulkELCWorkflowParams = new BulkELCWorkflowParams();  

    bulkElcParams.workFlowInititationList = workFlowJsonObj;
    bulkElcParams.updateStatus = false;
    bulkElcParams.newStatus = 3;

    console.log("params ::" , bulkElcParams);

    this.loadingScreenService.startLoading();
    this.employeeService.post_BulkELCWorkFlow(bulkElcParams).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {

          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`ELC Data has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');


        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

        this.loadclaimedRecords(true);

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submission!` + error);

      }


    }), ((error) => {

    });


  }


  fetchElcHistory(){

    this.isHistoryHidden = false;

    let screenType = CandidateListingScreenType.ReadyToMigrate;
    this.spinner = true;
    this.employeeService.getEmployeeList(screenType, this.RoleId, null)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((data) => {
        this.spinner = false;
        let apiResult: apiResult = data;
        console.log(apiResult);
        if (apiResult.Status) {
          if (apiResult.Result != "") {
            this.historyDataset = JSON.parse(apiResult.Result);
          } else {
            this.alertService.showInfo(apiResult.Message);
          }
        } else {
          this.alertService.showWarning(apiResult.Message);
        }
      },
      (error) => {
        this.spinner = false;
        this.alertService.showWarning("Error occured while Fetching details!");
      }
    );

  }

  hideElcHistory(){
    this.isHistoryHidden = true;
  }
  
  StatusFormatter(row, cell, value, columnDef, dataContext, grid) {
   
    
    if (value == null || value === "") {
      return "--";
    } else {
      let formattedValue: string;

      if (value == "Approved") {
        formattedValue = `
        <span style=" display: inline-block;
       padding: .55em .8em;
       font-weight: 500;
       line-height: 1;
       text-align: center;
       white-space: nowrap;
       vertical-align: baseline;
       border-radius: .375rem;
       transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #2DA05E;background-color: #E2FEEE
       ;">${value.toUpperCase()}</span>
     `
      } else if (value == "Rejected") {

        formattedValue = `<span style=" display: inline-block;
        padding: .55em .8em;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color:  #e63757;background-color: #fad7dd;">${value.toUpperCase()}</span>`;
      }
      return formattedValue;

    }
  }


  actionTakenFormatter(row, cell, value, columnDef, dataContext, grid) {

    if (columnDef.id == "ActionBy" ) {
      if (value && dataContext.TransactionStatusText != 'Pending') {
        return (value != '' && value != null && value != undefined) ? value : '--';
      }else {
        return `<div style="text-align: center;"><span>--</span></div>`;
      }
    } else if (columnDef.id == "ActionAt" || columnDef.id == "RequestedAt") {
      if (value) {
        let dateValue = (value != '' && value != null && value != undefined) ? value : '--';
        if (dateValue != '--') {
          let inputDate = moment(dateValue);
          let formattedDate = inputDate.format('DD-MM-YYYY');
          return formattedDate;
        } else {
          return `<div style="text-align: center;"><span>--</span></div>`;
        }
      }
    }

  }

  nullFormatter(row, cell, value, columnDef, dataContext, grid){
    if(value == "" || value == null || value == undefined){
      return `<div style="text-align: center;"><span>--</span></div>`;
    }else {
      return value;
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
