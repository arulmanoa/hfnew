import { Component, OnInit } from '@angular/core';
import { CandidateListingScreenType } from '../../../_services/model/OnBoarding/CandidateListingScreenType';
import { apiResult } from '../../../_services/model/apiResult';
import { OnBoardingGrid } from '../../../_services/model/OnBoarding/OnboardingGrid';
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
} from 'angular-slickgrid';

import { NgbModal, NgbModalOptions, NgbTabChangeEvent } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

import { HeaderService } from '../../../_services/service/header.service';
import { AlertService } from '../../../_services/service/alert.service';

import Swal from "sweetalert2";
import * as _ from 'lodash';

import { LoginResponses, UIMode } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';

import { EmployeeService } from '../../../_services/service/employee.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { ELCTransactionType } from "../../../_services/model/Base/HRSuiteEnums";
import { enumHelper } from '../../../shared/directives/_enumhelper';
import { isoStringToDate } from '@angular/common/src/i18n/format_date';
import { InputControlType, SearchPanelType, DataSourceType, RowSelectionType } from '../../personalised-display/enums';
import { SearchConfiguration, DataSource, SearchElement } from '../../personalised-display/models';
import { DownloadService, FileUploadService, ImportLayoutService, PagelayoutService } from 'src/app/_services/service';
import { EmployeeLifeCycleTransaction, ELCStatus, ELCTRANSACTIONTYPE } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { ImportLayout } from '../../generic-import/import-models';
import { FormInputControlType, RelationWithParent } from '../../generic-form/enums';
import { ApiRequestType, DataFormat, ImportControlElementType } from '../../generic-import/import-enums';
import { ClientList } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { BulkELCWorkflowParams } from 'src/app/_services/model/BulkELCWorkflowParams';
import { ElcApprovalModalComponent } from 'src/app/shared/modals/elc-approval-modal/elc-approval-modal.component';
import { DocumentApprovalFor, DocumentApprovalStatus } from 'src/app/_services/model/Approval/DocumentApproval';
import moment from 'moment';
import { environment } from 'src/environments/environment';
import { CookieService } from 'ngx-cookie-service';
interface Employee {
  Id: number;
  ClientContractCode: string;
  ClientName: string;
  EmployeeCode: string;
  EmployeeName: string;
}

@Component({
  selector: 'app-lifecycle-list',
  templateUrl: './lifecycle-list.component.html',
  styleUrls: ['./lifecycle-list.component.scss']
})
export class LifecycleListComponent implements OnInit {

  _loginSessionDetails: LoginResponses;
  UserId : number;
  businessType : number;

  spinner: boolean = true;
  isContent: boolean = false;
  editing : boolean = false;

  // Saved Bucked Grid Properties
  inSavedBucketColumnDefinitions: Column[] = [];
  inSavedBucketGridOptions: GridOption = {};
  dataset: any[] = [];
  inSavedBucketangularGrid: AngularGridInstance;
  inSavedBucketSelectedTitles: any[];
  inSavedBucketSelectedTitle: any;
  inSavedBucketGridObj1: any;
  isAutoEdit = true;
  selectedItems: any[];
  inSavedBucketDataviewObj: any;

  //Rejected Bucket Grid Properties
  rejectedBucketColumnDefinitions : Column[] = [];
  rejectedBucketGridOptions: GridOption = {};
  rejectedBucketangularGrid: AngularGridInstance;
  rejectedBucketSelectedTitles: any[];
  rejectedBucketSelectedTitle: any;
  rejectedBucketGridObj1: any;

  //pending Bucket Grid Properties
  pendingBucketColumnDefinitions : Column[] = [];
  historyColumnDefinitions : Column[] = [];
  pendingBucketGridOptions: GridOption = {};
  historyGridOptions: GridOption = {};
  pendingBucketangularGrid: AngularGridInstance;
  pendingBucketSelectedTitles: any[];
  pendingBucketSelectedTitle: any;
  pendingBucketGridObj1: any;
  pendingBucketDataviewObj : any;
  pendingBucketSelectedItems : any[];

  //search all Bucket Grid Properties
  searchAllBucketColumnDefinitions : Column[] = [];
  searchAllBucketGridOptions: GridOption = {};
  searchAllBucketangularGrid: AngularGridInstance;
  searchAllBucketSelectedTitles: any[];
  searchAllBucketSelectedTitle: any;
  searchAllBucketGridObj1: any;
  searchAllBucketDataviewObj : any;
  searchAllDataset : any[];
  searchAllSelectedItems : any[];

  RoleId: any;
  employeeList = [];

  employeeDataset: any;

  previewFormatter: Formatter;
  previewFormatterForPending: Formatter;
  TransactionTypeData: Formatter;
  viewCTCFormatter : Formatter;
  pendingStatusFormatter : Formatter;
  pendingStatusFormatterForHistory : Formatter;
  EmployeeName: any;
  EmployeeCode: any;
  ClientName: any;
  ClientCode: any;
  TeamName : string;
  TransactionStatus: any;
  PayGroupId : any;
  isAllenDigital : any;
  isEditingCurrentELC : boolean  = false;

  label_EmployeeName: any;
  label_EmployeeCode: any;
  label_ClientName: any;
  label_ClientContractCode: any;
  Label_DOJ: any;

  searchList: any;
  searchDataset: any

  ELCTypes: any = [];

  employeeObject: any;


  Idx: any;
  ELCStatusList = [];
  ActiveEmployeeList: any = [];
  beforeEmployee: boolean = true;
  isLoading: boolean = false;
  isProceed: boolean = false;
  searchText: any;

  selectedTTypes = [];
  employeeSelected : any;

  //Search configuration for choose employee modal search bar
  searchConfiguration : SearchConfiguration ;
  searchElementList : SearchElement[];
  searchConfigurationForSearchAll : SearchConfiguration;
  searchedClientId : number = 0;
  searchClientContractId : number = 0;
  searchedTeamId : number = 0;
  searchedPayGroupId : number = 0;

  // SME
  searchConfiguration_SME : SearchConfiguration;
  clientSME : any;
  clientcontractSME : any;
  clientIdSME : number;
  clientcontractIdSME : number;


  // searchConfigurationForDataset : SearchConfiguration ;

  //Modal
  modalOption: NgbModalOptions = {};

  //Tab Properties
  activeTabName : string = "myBucket";
  activeMyBucketTabName : string = "Saved";

  //view CTC
  modalRateset : EmployeeRateset;

  CompanyId: any;
  ImplementationCompanyId: any;

  //which controls to show
  SalaryRevision : boolean = false;
  ReLocation : boolean = false;
  ReDesignation : boolean = false;
  ContractExtension : boolean = false;

  isHistoryHidden : boolean = true;
  //Document Approval 
  clientApprovalTbl : any[];

  importLayout : ImportLayout = {// Salary Revision
    Id : 0,
    Code : "CTCSheet",
    Name : 'CTC Sheet',
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
  resultList: any[];
  IsExtraTabRequired : boolean = true;
    RoleCode: any;
    AlternativeText : any = 'In My Bucket';
    AlternativeText1 : any = "Unclaimed";
  constructor(

    private headerService: HeaderService,
    private alertService: AlertService,
    private router: Router,
    public employeeService: EmployeeService,
    public modalService: NgbModal,
    public onboardingApi: OnboardingService,
    private utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    public pageLayoutService : PagelayoutService,
    private importLayoutService : ImportLayoutService,
    private downloadService : DownloadService,
    private fileuploadService : FileUploadService,
    private loadingScreenService : LoadingScreenService,
    private cookieService: CookieService,

  ) { }

  ngOnInit() {
    // set header page ttile 

    this.headerService.setTitle('Employee Life Cycle Transaction');

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    // this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    
    // this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    // this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    // this.ELCTypes = this.utilsHelper.transform(ELCTransactionType);//get a enum dropdown names

    const ACID = environment.environment.ACID;
    this.isAllenDigital = (Number(ACID) === 1988 && ( this.businessType === 1 ||  this.businessType === 2)) ? true : false;

    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    var LstCompanySettings = [];
    LstCompanySettings = JSON.parse(this.sessionService.getSessionStorage("UserGroupCompanySettingValue"));      
    if(LstCompanySettings != null && LstCompanySettings.length > 0)      {
  
    LstCompanySettings = LstCompanySettings.filter(a=>a.RoleCode == this.RoleCode);
    if(LstCompanySettings.length > 0){
        var isExist = LstCompanySettings.find(z=>z.ModuleName == 'ELCList');
        if(isExist != undefined){
           this.IsExtraTabRequired = isExist.IsExtraTabRequired;
           this.AlternativeText = isExist.AlternativeText;
           this.AlternativeText1 = isExist.AlternativeText1;

        }
    }
  }
    (this.AlternativeText == null ||  this.AlternativeText == '') ? "In My Bucket" : true;
    (this.AlternativeText1 == null ||  this.AlternativeText1 == '') ? "Unclaimed" : true;

    if(this.businessType !== 3 ){
       this.clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
       this.clientIdSME = this.sessionService.getSessionStorage("default_SME_ClientId");
       this.clientcontractSME = JSON.parse(this.sessionService.getSessionStorage("SME_ClientContract"));
       this.clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");

       console.log("Client id " , this.clientIdSME ); 
       console.log("Client id , act id" ,  this.clientSME);
       console.log("Client id , client co" , this.clientcontractSME);

       let  clientDropDownList  : any[] = [];
       let  clientcontractDropDownList  : any[] = [];

       if(this.clientSME !== undefined && this.clientSME !== null){
        clientDropDownList.push(this.clientSME);
       }

       if(this.clientcontractSME !== undefined && this.clientcontractSME !== null){
        clientcontractDropDownList.push(this.clientcontractSME);
       }

       this.searchConfiguration = {
        SearchElementList : [
          
          {
            DataSource: {
              EntityType: 0,
              IsCoreEntity: false,
              Name: "Client",
              Type: 1
            },
            DefaultValue : "0",
            DisplayFieldInDataset : "Name",
            FieldName : "@clientId",
            DisplayName : 'Client Name',
            ForeignKeyColumnNameInDataset : "Id",
            InputControlType : InputControlType.AutoFillTextBox,
            IsIncludedInDefaultSearch : false,
            TriggerSearchOnChange : false,
            MultipleValues : null,
            Value : this.clientSME.Id,
            DropDownList : clientDropDownList,
            ParentFields : ["@companyId"],
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
            DefaultValue : '0',
            DisplayFieldInDataset : 'Name',
            FieldName : "@clientcontractId",
            DisplayName : 'Contract Name',
            ForeignKeyColumnNameInDataset : "Id",
            IsIncludedInDefaultSearch : false,
            InputControlType : InputControlType.AutoFillTextBox,
            Value : this.clientcontractIdSME, // this.clientcontractSME.Id,
            TriggerSearchOnChange : false,
            ReadOnly : true,
            DropDownList : clientcontractDropDownList,
            ParentHasValue : [],
            ParentFields : ["@clientId"],
            MultipleValues : null,
            GetValueFromUser : false,
            SendElementToGridDataSource : true
          } ,
          {
            DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
            DefaultValue: "0",
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
            ReadOnly: false,
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
              Name : "PayGroupContractView",
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            DisplayFieldInDataset : 'Name',
            ForeignKeyColumnNameInDataset : 'PayGroupId',
            InputControlType : InputControlType.DropDown,
            IsIncludedInDefaultSearch : true,
            TriggerSearchOnChange : false,
            MultipleValues : null,
            DropDownList : [],
            ParentFields : ['@clientcontractId'],
            ParentHasValue : [],
            SendElementToGridDataSource : false,
          },
          {
            DataSource : null,
            DisplayName : "CompanyId",
            FieldName : "@companyId",
            Value : this._loginSessionDetails.Company.Id,
            DropDownList : [],
            MultipleValues : null,
            TriggerSearchOnChange : false,
            ParentFields : null,
            SendElementToGridDataSource : true,
            //InputControlType : InputControlType.TextBox,
            IsIncludedInDefaultSearch : false,
            
            
          },
          {
            DataSource : null,
            DisplayName : "RoleCode",
            FieldName : "@roleCode",
            Value : this.RoleCode,
            DropDownList : [],
            MultipleValues : null,
            TriggerSearchOnChange : false,
            ParentFields : null,
            SendElementToGridDataSource : true,
            //InputControlType : InputControlType.TextBox,
            IsIncludedInDefaultSearch : false,
            
            
          },
          {
            DataSource : null,
            DisplayName : "UserId",
            FieldName : "@userId",
            Value : this.UserId,
            DropDownList : [],
            MultipleValues : null,
            TriggerSearchOnChange : false,
            ParentFields : null,
            SendElementToGridDataSource : true,
            //InputControlType : InputControlType.TextBox,
            IsIncludedInDefaultSearch : false,
            
            
          },
        ],
        SearchPanelType : SearchPanelType.Panel,
        SearchButtonRequired : true,
        ClearButtonRequired : false,
        SaveSearchElementsLocally : true
      }
  
      this.searchElementList = this.searchConfiguration.SearchElementList;

    }
    else{
      this.searchConfiguration = {
        IsDataLevelSecurityRequired: true,
        SecurityKeys:[['UserId'], ['RoleId']],
        SearchElementList : [
          
          {
            DataSecurityConfiguration: {
              IsMappedData: true,
              RoleBasedConfigurationList:[{
                IsDataLeverSecurityRequired: true,
                OveridedUsers : [],
                RoleCode : "PayrollOps",
                RoleId : 0
              }, {
                IsDataLeverSecurityRequired: true,
                OveridedUsers : [],
                RoleCode : "OpsMember",
                RoleId : 0
              }, {
                IsDataLeverSecurityRequired: true,
                OveridedUsers : [],
                RoleCode : "PayrollAdmin",
                RoleId : 0
              }]
            },
            DataSource: {
              EntityType: 0,
              IsCoreEntity: false,
              Name: "GetUserMappedClientList",
              Type: 0
            },
            DefaultValue : "0",
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
            DataSecurityConfiguration: {
              IsMappedData: true,
              RoleBasedConfigurationList:[{
                IsDataLeverSecurityRequired: true,
                OveridedUsers : [],
                RoleCode : "PayrollOps",
                RoleId : 0
              }, {
                IsDataLeverSecurityRequired: true,
                OveridedUsers : [],
                RoleCode : "OpsMember",
                RoleId : 0
              }, {
                IsDataLeverSecurityRequired: true,
                OveridedUsers : [],
                RoleCode : "PayrollAdmin",
                RoleId : 0
              }]
            },
            DataSource : {
              IsCoreEntity : false,
              Name : "GetUserMappedClientContractList",
              Type : 0
            },
            DefaultValue : '0',
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
            DefaultValue: "0",
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
              Name : "PayGroupContractView",
              Type : DataSourceType.View,
              IsCoreEntity : false
            },
            DisplayFieldInDataset : 'Name',
            ForeignKeyColumnNameInDataset : 'PayGroupId',
            InputControlType : InputControlType.DropDown,
            IsIncludedInDefaultSearch : true,
            TriggerSearchOnChange : false,
            MultipleValues : null,
            DropDownList : [],
            ParentFields : ['@clientcontractId'],
            ParentHasValue : [],
            SendElementToGridDataSource : false,
          },
          {
            DataSource : null,
            DisplayName : "CompanyId",
            FieldName : "@companyId",
            Value : this._loginSessionDetails.Company.Id,
            DropDownList : [],
            MultipleValues : null,
            TriggerSearchOnChange : false,
            ParentFields : null,
            SendElementToGridDataSource : true,
            //InputControlType : InputControlType.TextBox,
            IsIncludedInDefaultSearch : false,
            
            
          },
        ],
        SearchPanelType : SearchPanelType.Panel,
        SearchButtonRequired : true,
        ClearButtonRequired : false,
        SaveSearchElementsLocally : true
      }
  
      this.searchElementList = this.searchConfiguration.SearchElementList;
    }

    console.log("Search Configuration ::" , this.searchConfiguration);

    this.ELCTypes = [
      // {
      //   name: "Salary Revision",
      //   id: 2,
      //   icon: "mdi-cash-multiple",
      //   checked: false
      // },
      {
        name: "Re Location",
        id: 3,
        icon: "mdi-map-marker-multiple",
        checked: false
      },
      {
        name: "Re Designation",
        id: 4,
        icon: "mdi-briefcase-check",
        checked: false
      },
      // {
      //   name: "Contract Extension",
      //   id: 8,
      //   icon: "mdi-account-clock",
      //   checked: false
      // },
    ];



    this.ELCStatusList = [


      {
        id: 3,
        name: "Initiated"
      },
      {
        id: 2,
        name: "Active"
      },
      {
        id: 0,
        name: "Cancelled Transaction"
      },
      {
        id : 1,
        name : "Saved"
      },
      {
        id : 4,
        name : "Rejected"
      }


    ];
    this.TransactionStatus = 1;

    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {

      if (this.dataset.find(x => { return x.TransactionStatus == 1 || x.TransactionStatus == 4 || x.TransactionStatus == 7 })) {
        return (value ? `<i class="fa fa-pencil-square-o"  style="cursor:pointer;font-size: 18px; text-align: center;
          display: block;" title="Edit transaction"></i> ` : '');
      } else {

        return '';
      }
    }

    this.previewFormatterForPending = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {

      if(dataContext.ErrorMessage == ""){
        return "";
      }
      if (this.dataset.find(x => { return x.TransactionStatus == 1 || x.TransactionStatus == 4 || x.TransactionStatus == 7 })) {
        return (value ? `<i class="fa fa-pencil-square-o"  style="cursor:pointer;font-size: 18px; text-align: center;
          display: block;" title="Edit transaction"></i> ` : '');
      } else {

        return '';
      }
    }


    this.TransactionTypeData = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {

      return (
      dataContext.ELCTransactionType == 1 ? "Offer" : 
      dataContext.ELCTransactionType == 2 ? "Salary Revision" : 
      dataContext.ELCTransactionType == 3 ? "Relocation" : 
      dataContext.ELCTransactionType == 4 ? "ReDesignation" : 
      dataContext.ELCTransactionType == 5 ? "Salary & Location" : 
      dataContext.ELCTransactionType == 6 ? "Salary & Designation" : 
      dataContext.ELCTransactionType == 7 ? "Location & Designation" : 
      dataContext.ELCTransactionType == 8 ? "Contract Extension" : 
      dataContext.ELCTransactionType == 9 ? "Salary / Location / Designation" : 
      dataContext.ELCTransactionType == 10 ? "SalaryRevision / ContractExtension" : 
      dataContext.ELCTransactionType == 11 ? "ReLocation / ContractExtension" : 
      dataContext.ELCTransactionType == 12 ? "ReDesignation / ContractExtension" : 
      dataContext.ELCTransactionType == 13 ? "SalaryRevision / ReLocation / ContractExtension" : 
      dataContext.ELCTransactionType == 14 ? "SalaryRevision / ReDesignation / ContractExtension" : 
      dataContext.ELCTransactionType == 15 ? "ReLocation / ReDesignation / ContractExtension" : 
      dataContext.ELCTransactionType == 17 ? "SalaryRevision / ReLocation / ReDesignation / ContractExtension" : 
      "");

    }

    this.viewCTCFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value ? ` <button  class="btn btn-default btn-sm" title="View Calculated CTC" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
  class="fa fa-files-o m-r-xs"></i> View CTC </button>` : '';

    this.pendingStatusFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {

      if(dataContext.ErrorMessage == ""){
       return   dataContext.hasOwnProperty('PendingAtUserName')  ? dataContext.PendingAtUserName : `CORPORATE HR (unclaimed)`;
      }else {
        return "Failed to submit"
      }
    }

    this.pendingStatusFormatterForHistory = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) => {

      if(dataContext.TransactionStatusText != 'Pending'){
        return `<div style="text-align: center;"><span>--</span></div>`;
      }
      let isRequestClaimed = false;
      if (value) {
        isRequestClaimed = (value != '' && value != null && value != undefined) ? true : false;
      }
      if (isRequestClaimed) {
        return value; //ActionTakenBy
      } else {
        return 'CORPORATE HR (unclaimed)';
      }

    }



    this.searchConfigurationForSearchAll = {
      SearchElementList : [
        
        {
          DataSource: {
            EntityType: 0,
            IsCoreEntity: false,
            Name: "ActiveClientView",
            Type: DataSourceType.View
          },
          DefaultValue : "0",
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
          DefaultValue : "[]",
          DisplayFieldInDataset : "Name",
          FieldName : "@employeeCodes",
          DisplayName : 'Employee Codes',
          ForeignKeyColumnNameInDataset : "Id",
          InputControlType : InputControlType.CommaSeparatedStrings,
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
          DataSource: {
            EntityType: 0,
            IsCoreEntity: false,
            Name: "",
            Type: DataSourceType.FixedValues
          },
          DefaultValue : 0,
          DisplayFieldInDataset : "Name",
          FieldName : "@TransactionStatus",
          DisplayName : 'Transaction Status',
          ForeignKeyColumnNameInDataset : "Id",
          InputControlType : InputControlType.DropDown,
          IsIncludedInDefaultSearch : true,
          TriggerSearchOnChange : false,
          MultipleValues : null,
          Value : null,
          DropDownList : [{Id : 1 , Name : "Saved" } , {Id : 4 , Name : "Rejected"} , {Id : 7 , Name : "Awaiting Qc"} , {Id : 2 , Name : "Approved"}],
          ParentFields : null,
          ParentHasValue : [],
          GetValueFromUser : false,
          SendElementToGridDataSource : true
        }
      ],
      SearchPanelType : SearchPanelType.Panel,
      SearchButtonRequired : true,
      ClearButtonRequired : false
    }

    if(this.businessType !== 3){
      this.pageLayoutService.fillSearchElementsForSME(this.searchConfigurationForSearchAll.SearchElementList);
    }

    this.setGrid();

      let filledFromLocalStorage : boolean

      if(!this.isAllenDigital){ // prevents filter to be added on relaod of the tab for allen; 
        filledFromLocalStorage =  this.pageLayoutService.fillSearchElementFromLocalStorage(this.searchConfiguration.SearchElementList); 
      }
      
      if(filledFromLocalStorage){
        this.bind_SearchNames();
        this.searchData();
      }

    this.dataset = [];
    this.dataset.length = 0;
    this.spinner = false;

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    $('#CanCollapse').on('hidden.bs.collapse', () => {
      // do something...
      console.log("collapesed");

      if(this.inSavedBucketangularGrid !== undefined && this.inSavedBucketangularGrid !== null)
        this.inSavedBucketangularGrid.resizerService.resizeGrid();

      if(this.rejectedBucketangularGrid !== undefined && this.rejectedBucketangularGrid !== null)
        this.rejectedBucketangularGrid.resizerService.resizeGrid();
    })

    let saveEventParam = {
      "activeId": "Rejected",
      "nextId": "Saved",
      "nonNative" : true
    }
    this.beforeMyBucketTabChange(saveEventParam);
  }

  setGrid(){
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
      showHeaderRow: true,
      enablePagination: false,
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

    this.inSavedBucketColumnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      // { id: 'ClientContractCode', name: 'Client Code', field: 'ClientContractCode', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.string, minWidth: 60, maxWidth: 150 },
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
      { id: 'ClientName', name: 'Client Name', field: 'ClientName', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, type: FieldType.string, formatter: Formatters.dateIso },
      { id: 'EffectivePayPeriod', name: 'Effective Pay Period', field: 'EffectivePayPeriod', sortable: true, minWidth: 60, },
      { id: 'ELCTransactionType',
        field: 'ELCTransactionType',
        name: 'Transaction Type',
        formatter: this.TransactionTypeData,
        minWidth: 120,
      },
      { id: 'viewCTC',
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
      { id: 'preview',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.previewFormatter,
        minWidth: 100,
        maxWidth: 100,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          if (args.dataContext.TransactionStatus == 2 || args.dataContext.TransactionStatus == 3 || 
            args.dataContext.TransactionStatus == 5 || args.dataContext.TransactionStatus == 0) {
            return;
          }


          this.ELCTypes.forEach(element => {
            element.checked = false;
          });

          this.ELCTypes = [
            // {
            //   name: "Salary Revision",
            //   id: 2,
            //   icon: "mdi-cash-multiple",
            //   checked: false
            // },
            {
              name: "Re Location",
              id: 3,
              icon: "mdi-map-marker-multiple",
              checked: false
            },
            {
              name: "Re Designation",
              id: 4,
              icon: "mdi-briefcase-check",
              checked: false
            },
            // {
            //   name: "Contract Extension",
            //   id: 8,
            //   icon: "mdi-account-clock",
            //   checked: false
            // },
          ];


          this.label_EmployeeName = args.dataContext.EmployeeName;
          this.label_EmployeeCode = args.dataContext.EmployeeCode;
          this.label_ClientName = args.dataContext.ClientName;
          this.label_ClientContractCode = args.dataContext.ClientContractCode;
          this.Label_DOJ = args.dataContext.DOJ;

          this.employeeObject = args.dataContext;
          this.selectedTTypes.push(Number(args.dataContext.ELCTransactionType));

          let ELCTransactionType = Number(args.dataContext.ELCTransactionType);
          // ELCTransactionType == 2 || ELCTransactionType == 5 || ELCTransactionType == 6 || ELCTransactionType == 9 || ELCTransactionType == 10 || ELCTransactionType == 13 || ELCTransactionType == 14 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 2).checked = true : null;
          ELCTransactionType == 3 || ELCTransactionType == 5 || ELCTransactionType == 7 || ELCTransactionType == 9 || ELCTransactionType == 11 || ELCTransactionType == 13 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 3).checked = true : null;
          ELCTransactionType == 4 || ELCTransactionType == 6 || ELCTransactionType == 7 || ELCTransactionType == 9 || ELCTransactionType == 12 || ELCTransactionType == 14 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 4).checked = true : null;
          // ELCTransactionType == 8 || ELCTransactionType == 10 || ELCTransactionType == 11 || ELCTransactionType == 12 || ELCTransactionType == 13 || ELCTransactionType == 14 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 8).checked = true : null;
          // ELCTransactionType == 5 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 3).checked = true : null;
          // ELCTransactionType == 6 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 4).checked = true : null;
          // ELCTransactionType == 7 ?  this.ELCTypes.find(a=>a.id == 4 && a.id == 3).checked = true : null;
          // ELCTransactionType == 9 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 3 && a.id == 4).checked = true : null;

          if(this.isAllenDigital){
          
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: true,
            })
        
            swalWithBootstrapButtons.fire({
              title: 'Confirmation ',
              text: "If you wish to edit the current transaction type, please click the 'Edit' button. Otherwise, click 'Continue' to go with the existing transaction type.",
              type: 'question',
              showCancelButton: true,
              confirmButtonText: 'Continue',
              cancelButtonText: 'Edit',
              allowOutsideClick: false,
              reverseButtons: false,
              width: '600px',
              showCloseButton: true
            }).then((result) => {
              console.log(result);
        
              if (result.value) {
                this.isEditingCurrentELC = true;
                this.start();
        
              } else if (result.dismiss === Swal.DismissReason.cancel) {

                this.editing = true;
                this.preview_employee();

              }
            })

        
          }else {
            this.editing = true;
            this.preview_employee();
          }

        }
      },
    ];

    this.rejectedBucketGridOptions = {
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
      enableCheckboxSelector: false,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
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
        selectActiveRow: true
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: true
      },
      datasetIdPropertyName: "Id"
    };

    this.rejectedBucketColumnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      // { id: 'ClientContractCode', name: 'Client Code', field: 'ClientContractCode', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.string, minWidth: 60, maxWidth: 150 },
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
      { id: 'ClientName', name: 'Client Name', field: 'ClientName', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, type: FieldType.string, formatter: Formatters.dateIso },
      { id: 'EffectivePayPeriod', name: 'Effective Pay Period', field: 'EffectivePayPeriod', sortable: true, minWidth: 60, },
      { id: 'ELCTransactionType' , name: 'Transaction Type' , field: 'ELCTransactionType' , formatter: this.TransactionTypeData , minWidth: 120,
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
          if (args.dataContext.TransactionStatus == 2 || args.dataContext.TransactionStatus == 3 || 
            args.dataContext.TransactionStatus == 5 || args.dataContext.TransactionStatus == 0) {
            return;
          }


          this.ELCTypes.forEach(element => {
            element.checked = false;
          });

          this.ELCTypes = [
            // {
            //   name: "Salary Revision",
            //   id: 2,
            //   icon: "mdi-cash-multiple",
            //   checked: false
            // },
            {
              name: "Re Location",
              id: 3,
              icon: "mdi-map-marker-multiple",
              checked: false
            },
            {
              name: "Re Designation",
              id: 4,
              icon: "mdi-briefcase-check",
              checked: false
            },
            // {
            //   name: "Contract Extension",
            //   id: 8,
            //   icon: "mdi-account-clock",
            //   checked: false
            // }
          ];


          this.label_EmployeeName = args.dataContext.EmployeeName;
          this.label_EmployeeCode = args.dataContext.EmployeeCode;
          this.label_ClientName = args.dataContext.ClientName;
          this.label_ClientContractCode = args.dataContext.ClientContractCode;
          this.Label_DOJ = args.dataContext.DOJ;

          this.employeeObject = args.dataContext;
          this.selectedTTypes.push(Number(args.dataContext.ELCTransactionType));

          let ELCTransactionType = Number(args.dataContext.ELCTransactionType);
          // ELCTransactionType == 2 || ELCTransactionType == 5 || ELCTransactionType == 6 || ELCTransactionType == 9 || ELCTransactionType == 10 || ELCTransactionType == 13 || ELCTransactionType == 14 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 2).checked = true : null;
          ELCTransactionType == 3 || ELCTransactionType == 5 || ELCTransactionType == 7 || ELCTransactionType == 9 || ELCTransactionType == 11 || ELCTransactionType == 13 || ELCTransactionType == 15 || ELCTransactionType == 17  ? this.ELCTypes.find(a => a.id == 3).checked = true : null;
          ELCTransactionType == 4 || ELCTransactionType == 6 || ELCTransactionType == 7 || ELCTransactionType == 9 || ELCTransactionType == 12 || ELCTransactionType == 14 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 4).checked = true : null;
          // ELCTransactionType == 8 || ELCTransactionType == 10 || ELCTransactionType == 11 || ELCTransactionType == 12 || ELCTransactionType == 13 || ELCTransactionType == 14 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 8).checked = true : null;
          // ELCTransactionType == 5 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 3).checked = true : null;
          // ELCTransactionType == 6 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 4).checked = true : null;
          // ELCTransactionType == 7 ?  this.ELCTypes.find(a=>a.id == 4 && a.id == 3).checked = true : null;
          // ELCTransactionType == 9 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 3 && a.id == 4).checked = true : null;

          if(this.isAllenDigital){
          
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: true,
            })
        
            swalWithBootstrapButtons.fire({
              title: 'Confirmation ',
              text: "If you wish to edit the current transaction type, please click the 'Edit' button. Otherwise, click 'Continue' to go with the existing transaction type.",
              type: 'question',
              showCancelButton: true,
              confirmButtonText: 'Continue',
              cancelButtonText: 'Edit',
              allowOutsideClick: false,
              reverseButtons: false,
              width: '600px',
              showCloseButton: true
            }).then((result) => {
              console.log(result);
        
              if (result.value) {
                this.isEditingCurrentELC = true;
                this.start();
        
              } else if (result.dismiss === Swal.DismissReason.cancel) {

                this.editing = true;
                this.preview_employee();

              }
            })

        
          }else {
            this.editing = true;
            this.preview_employee();
          }

        }
      },
    ];

    this.pendingBucketGridOptions = {
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

    this.pendingBucketColumnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      // { id: 'ClientContractCode', name: 'Client Code', field: 'ClientContractCode', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.string, minWidth: 60, maxWidth: 150 },
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
      { id: 'ClientName', name: 'Client Name', field: 'ClientName', sortable: true, filterable: true, type: FieldType.string },
      // { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, type: FieldType.date, formatter: Formatters.dateIso },
      // { id: 'EffectivePayPeriod', name: 'Effective Pay Period', field: 'EffectivePayPeriod', sortable: true, minWidth: 60, },
      { id: 'ELCTransactionType',field: 'ELCTransactionType',name: 'Transaction Type',formatter: this.TransactionTypeData,minWidth: 120,},
      { id: 'Status', name: 'Pending at', field: 'Status', sortable: true, filterable: false, type: FieldType.string , formatter : this.pendingStatusFormatter },
      { id: 'ErrorMessage', name: 'Error Msg.', field: 'ErrorMessage', sortable: true, filterable: false, type: FieldType.string },

      // { id: 'viewCTC',
      //   field: 'SalaryRevised',
      //   name: '',
      //   formatter: this.viewCTCFormatter,
      //   width : 70,
      //   minWidth: 100,

      //   onCellClick : (e: Event, args: OnEventArgs) => {
          
      //     let employeeObject = args.dataContext;

      //     if(!employeeObject.SalaryRevised){
      //       return;
      //     }

      //     let elcTransaction = JSON.parse(employeeObject.EmployeeLifeCycleTransaction);

      //     if(elcTransaction == undefined || elcTransaction == null){
      //       this.alertService.showWarning("ELC Transaction undefined! Please contact support");
      //       return;
      //     }

      //     let ratesets = JSON.parse(elcTransaction.EmployeeRateset);

      //     if(ratesets != undefined && ratesets != null && ratesets.length > 0){
      //       let rateset = ratesets[0];

      //       rateset.RatesetProducts = _.orderBy(rateset.RatesetProducts , ['DisplayOrder'] , ["asc"]);
      //       console.log("ELC ::" , elcTransaction , rateset);
            
      //       this.modalRateset =  rateset;
  
      //       $('#viewCTC').modal('show');
      //     }
      //     else{
      //       this.alertService.showInfo("No Rateset Found!")
      //     }
          

      //   }
      // },
      { id: 'preview',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.previewFormatterForPending,
        minWidth: 100,
        maxWidth: 100,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          if(args.dataContext.ErrorMessage == ""){
            return ;
          }
          if (args.dataContext.TransactionStatus == 2 || args.dataContext.TransactionStatus == 3 || 
            args.dataContext.TransactionStatus == 5 || args.dataContext.TransactionStatus == 0) {
            return;
          }


          this.ELCTypes.forEach(element => {
            element.checked = false;
          });

          this.ELCTypes = [
            // {
            //   name: "Salary Revision",
            //   id: 2,
            //   icon: "mdi-cash-multiple",
            //   checked: false
            // },
            {
              name: "Re Location",
              id: 3,
              icon: "mdi-map-marker-multiple",
              checked: false
            },
            {
              name: "Re Designation",
              id: 4,
              icon: "mdi-briefcase-check",
              checked: false
            },
            // {
            //   name: "Contract Extension",
            //   id: 8,
            //   icon: "mdi-account-clock",
            //   checked: false
            // },
          ];


          this.label_EmployeeName = args.dataContext.EmployeeName;
          this.label_EmployeeCode = args.dataContext.EmployeeCode;
          this.label_ClientName = args.dataContext.ClientName;
          this.label_ClientContractCode = args.dataContext.ClientContractCode;
          this.Label_DOJ = args.dataContext.DOJ;

          this.employeeObject = args.dataContext;
          this.selectedTTypes.push(Number(args.dataContext.ELCTransactionType));

          let ELCTransactionType = Number(args.dataContext.ELCTransactionType);
          // ELCTransactionType == 2 || ELCTransactionType == 5 || ELCTransactionType == 6 || ELCTransactionType == 9 || ELCTransactionType == 10 || ELCTransactionType == 13 || ELCTransactionType == 14 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 2).checked = true : null;
          ELCTransactionType == 3 || ELCTransactionType == 5 || ELCTransactionType == 7 || ELCTransactionType == 9 || ELCTransactionType == 11 || ELCTransactionType == 13 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 3).checked = true : null;
          ELCTransactionType == 4 || ELCTransactionType == 6 || ELCTransactionType == 7 || ELCTransactionType == 9 || ELCTransactionType == 12 || ELCTransactionType == 14 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 4).checked = true : null;
          // ELCTransactionType == 8 || ELCTransactionType == 10 || ELCTransactionType == 11 || ELCTransactionType == 12 || ELCTransactionType == 13 || ELCTransactionType == 14 || ELCTransactionType == 15 || ELCTransactionType == 17 ? this.ELCTypes.find(a => a.id == 8).checked = true : null;
          // ELCTransactionType == 5 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 3).checked = true : null;
          // ELCTransactionType == 6 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 4).checked = true : null;
          // ELCTransactionType == 7 ?  this.ELCTypes.find(a=>a.id == 4 && a.id == 3).checked = true : null;
          // ELCTransactionType == 9 ?  this.ELCTypes.find(a=>a.id == 2 && a.id == 3 && a.id == 4).checked = true : null;

          if(this.isAllenDigital){
          
            const swalWithBootstrapButtons = Swal.mixin({
              customClass: {
                confirmButton: 'btn btn-primary',
                cancelButton: 'btn btn-danger'
              },
              buttonsStyling: true,
            })
        
            swalWithBootstrapButtons.fire({
              title: 'Confirmation ',
              text: "If you wish to edit the current transaction type, please click the 'Edit' button. Otherwise, click 'Continue' to go with the existing transaction type.",
              type: 'question',
              showCancelButton: true,
              confirmButtonText: 'Continue',
              cancelButtonText: 'Edit',
              allowOutsideClick: false,
              reverseButtons: false,
              width: '600px',
              showCloseButton: true
            }).then((result) => {
              console.log(result);
        
              if (result.value) {
                this.isEditingCurrentELC = true;
                this.start();
        
              } else if (result.dismiss === Swal.DismissReason.cancel) {

                this.editing = true;
                this.preview_employee();

              }
            })

          }else {
            this.editing = true;
            this.preview_employee();
          }

        }
      },
    ];

    this.searchAllBucketGridOptions = {
      asyncEditorLoading: false,
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
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

    this.historyGridOptions = {
      asyncEditorLoading: false,
      enableAutoResize: true,
      editable: true,
      enableColumnPicker: true,
      enableCellNavigation: true,
      enableRowSelection: false,
      enableCheckboxSelector: false,
      enableAutoTooltip : true,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
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

    this.searchAllBucketColumnDefinitions = [
      // { id: 'Id', name: 'Id', field: 'Id', sortable: true },
      // { id: 'ClientContractCode', name: 'Client Code', field: 'ClientContractCode', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.number, minWidth: 60, maxWidth: 150 },
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
      { id: 'ClientName', name: 'Client Name', field: 'ClientName', sortable: true, filterable: true, type: FieldType.string },
      { id: 'EffectiveDate', name: 'Effective Date', field: 'EffectiveDate', sortable: true, filterable: true, type: FieldType.date, formatter: Formatters.dateIso },
      { id: 'EffectivePayPeriod', name: 'Effective Pay Period', field: 'EffectivePayPeriod', filterable: true , sortable: true, minWidth: 60, },
      { id: 'ELCTransactionType',field: 'ELCTransactionType',name: 'Transaction Type',formatter: this.TransactionTypeData,minWidth: 120,},
      { id: 'TransactionStatus', name: 'Transaction Status', field: 'TransactionStatus', sortable: true, filterable: true, type: FieldType.string },
    ];

    this.historyColumnDefinitions = [
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable: true, type: FieldType.string, minWidth: 60, maxWidth: 150 },
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', formatter: Formatters.uppercase, sortable: true, filterable: true, type: FieldType.string },
      { id: 'ELCTransactionType',field: 'ELCTransactionType',name: 'Transaction Type',formatter: this.TransactionTypeData,},
      { id: 'RequestedAt', name: 'Transaction Requested At', field: 'RequestedAt', sortable: true, filterable: false, type: FieldType.string, formatter : this.actionTakenFormatter },
      { id: 'Status', name: 'Transaction Status', field: 'TransactionStatusText', sortable: true, filterable: true, type: FieldType.string, formatter : this.StatusFormatter },
      { id: 'PendingAt', name: 'Pending at', field: 'ActionTakenBy', sortable: true, filterable: false, type: FieldType.string , formatter : this.pendingStatusFormatterForHistory },
      { id: 'ActionBy', name: 'Approved By/ Rejected By', field: 'ActionTakenBy', sortable: true, filterable: false, type: FieldType.string, formatter : this.actionTakenFormatter},
      { id: 'ActionAt', name: 'Approved At/ Rejected At', field: 'ActionTakenAt', sortable: true, filterable: false, type: FieldType.string, formatter : this.actionTakenFormatter},
      { id: 'Remarks', name: 'Remarks', field: 'QcRemarks', sortable: true, filterable: false, type: FieldType.string, formatter : this.nullFormatter },
    ];

    if(this.businessType !== 3){
      this.inSavedBucketColumnDefinitions = this.inSavedBucketColumnDefinitions.filter(x => x.field !== 'ClientName');
      this.rejectedBucketColumnDefinitions = this.rejectedBucketColumnDefinitions.filter(x => x.field !== 'ClientName');
      this.pendingBucketColumnDefinitions = this.pendingBucketColumnDefinitions.filter(x => x.field !== 'ClientName');
      this.searchAllBucketColumnDefinitions = this.searchAllBucketColumnDefinitions.filter(x => x.field !== 'ClientName');
    }
  }

  loademployeeRecords(isRefresh: boolean) {
    this.spinner = true;
    this.isContent = false;
    let ScreenType = CandidateListingScreenType.Payroll;
    var searchObj = JSON.stringify({
      ClientContractCode: this.ClientCode,
      ClientName: this.ClientName,
      EmployeeCode: this.EmployeeCode,
      EmployeeName: this.EmployeeName,
      TransactionStatus: this.TransactionStatus

    })
    this.employeeService.getEmployeeList(ScreenType, this.RoleId, searchObj).subscribe((data) => {
      let apiResult: apiResult = data;
      if (apiResult.Result != "")
        this.employeeDataset = JSON.parse(apiResult.Result);
      console.log('result', this.employeeDataset);

      this.spinner = false;
      this.isContent = true;
      this.dataset = this.employeeDataset;

    }, (err) => {
      this.spinner = false;
      this.isContent = true;
    });
  }

  searchData() {
    this.dataset = null;
    //this.dataset.length = 0;
    //TODO: do the validations properly so that numerous data is not returned
    if (this.TransactionStatus == null || undefined || '') {
      this.alertService.showWarning("Please choose at least one transaction status and proceed!");
      return;

    }
    // if ((this.ClientCode == null || this.ClientCode == undefined || this.ClientCode.trim() == '') &&
    //   (this.ClientName == null || this.ClientName == undefined || this.ClientName.trim() == '') &&
    //   (this.EmployeeCode == null || this.EmployeeCode == undefined || this.EmployeeCode.trim() == '') &&
    //   (this.EmployeeName == null || this.EmployeeCode == undefined || this.EmployeeCode.trim() == '')

    // ) {

    //   this.alertService.showInfo("Please provide any search criteria")
    //   return;
    // }
    this.spinner = true;
    var searchObj = JSON.stringify({
      // ClientContractCode: this.ClientCode,
      // ClientName: this.ClientName,
      // EmployeeCode: this.EmployeeCode,
      // EmployeeName: this.EmployeeName,
      TransactionStatus: this.TransactionStatus,
      ClientId : this.searchedClientId,
      ClientContractId : this.searchClientContractId,
      TeamId : this.searchedTeamId,
      PayGroupId : this.PayGroupId,

    })

    console.log("Search obj ::" , searchObj);

    this.employeeService.getEmployeeList(CandidateListingScreenType.ELC, this.RoleId, (searchObj)).subscribe((data) => {

      let apiResult: apiResult = data;
      console.log('data', data);
      if (apiResult.Result != "" && apiResult.Status) {
        this.dataset = JSON.parse(apiResult.Result);
        console.log(this.dataset);

        if(this.isHistoryHidden) { 
          this.dataset.forEach(x => {
            x["Gender"] = (x.hasOwnProperty("EmployeeDetails")) ? x.EmployeeDetails[0].Gender : 0;
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
        }

        this.spinner = false;
        this.isContent = true;
        return;
      }
      else {
        this.spinner = false;
        this.dataset = [];
        this.alertService.showInfo("No Data Found!")
      }

    }), ((err) => {

    });

  }

  getSearchAllDataset(){
    this.spinner = true;

    let dataSource : DataSource = {
      Name : "GetCompleteELCLUIList" ,
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }

    this.searchAllDataset = [];
    this.pageLayoutService.getDataset(dataSource , this.searchConfigurationForSearchAll.SearchElementList).subscribe(response => {
      this.spinner = false;
      if(response.Status && response.dynamicObject !== ''){
        this.searchAllDataset = JSON.parse(response.dynamicObject);
        console.log(this.searchAllDataset);
      }
      else if(!response.Status){
        this.searchAllDataset = [];
        this.alertService.showWarning("Error Occured while fetching data");
      }
    } , error => {
      console.error(error);
      
    })
  }


  clearSearchCriteria() {
    this.ClientCode = null;
    this.ClientName = null;
    this.EmployeeName = null;
    this.EmployeeCode = null;
    this.dataset = [];
    this.dataset.length = 0;
    this.spinner = false;
    //  this.loademployeeRecords(true);
  }

  modal_dismiss_client_approval(){
    $('#popup_client_approval').modal('hide');

  }

  editApprovalFile(item, indx) {

    console.log(item);

    let elcIds : number[] = [];
    for(let elcTransaction of this.selectedItems){
      elcIds.push(elcTransaction.Id)
    }

    // this.addAttachment(item);

    $('#popup_client_approval').modal('hide');
    let employeeDetails  = {
      CompanyId : this.selectedItems[0].CompanyId,
      ClientId : this.selectedItems[0].ClientId,
      ClientContractId : 0,
      CandidateId : 0,
      ELCIds : elcIds
    } 

    const modalRef = this.modalService.open(ElcApprovalModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.employeeDetails = employeeDetails;
    modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    modalRef.componentInstance.clientApprovalObj = item;
    modalRef.result.then((result) => {
      console.log("Approval Obj ::" , result);

      if(result.Idx === 0){
        result.Idx = this.clientApprovalTbl.length + 1;
        this.clientApprovalTbl.push(result);
      }
      else{
        this.clientApprovalTbl =  this.clientApprovalTbl.map(obj => obj.Idx === result.Idx ? result : obj);
      }

      console.log("clientApprovalTbl" , this.clientApprovalTbl);

      $('#popup_client_approval').modal('show');

    });

  }

  addAttachment(){

    let elcIds : number[] = [];
    for(let elcTransaction of this.selectedItems){
      elcIds.push(elcTransaction.Id)
    }

    $('#popup_client_approval').modal('hide');
    let employeeDetails  = {
      CompanyId : this.selectedItems[0].CompanyId,
      ClientId : this.selectedItems[0].ClientId,
      ClientContractId : 0,
      CandidateId : 0,
      ELCIds : elcIds
    } 

    const modalRef = this.modalService.open(ElcApprovalModalComponent, this.modalOption);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.employeeDetails = employeeDetails;
    modalRef.result.then((result) => {
      console.log("Approval Obj ::" , result);

      if(result.Idx === 0){
        result.Idx = this.clientApprovalTbl.length + 1;
        this.clientApprovalTbl.push(result);
      }
      else{
        this.clientApprovalTbl.map(obj => obj.Idx === result.Idx ? result : obj);
      }

      $('#popup_client_approval').modal('show');


    });
    // modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    // modalRef.componentInstance.RequestType = this.candidatesForm.get('requestFor').value == "OL" ? RequestType.OL : RequestType.AL;
    // var objStorageJson = JSON.stringify({ CandidateId: this.CandidateId, CompanyId: this.CompanyId, ClientId: this.ClientId, ClientContractId: this.ClientContractId });
    // modalRef.componentInstance.objStorageJson = objStorageJson;
    // modalRef.componentInstance.LstClientApproval = this.clientApprovalTbl;
    // modalRef.componentInstance.ClientLocationList = this.ClientLocationList;
  }

  deleteApprovalFile(item){
    // Check if the passed Approval can be deleted.
    // An approval can only be deleted if it doesnot containt refrence to any other elc. 
    let refrenceObject : number[] = item.RefrenceObject != undefined && item.RefrenceObject != null ? 
    JSON.parse(item.RefrenceObject) : []
    
    console.log("Approval obj ::" , item);
    console.log("refrenceObject" , refrenceObject);

    if(item.ObjectStorageId > 0){
      this.loadingScreenService.startLoading();
      this.fileuploadService.deleteObjectStorage(item.ObjectStorageId).subscribe((res) => {
        console.log(res);
        let apiResult  = (res);
        try {
          if (apiResult.Status) {
            //Remove from table.
            this.clientApprovalTbl.splice( this.clientApprovalTbl.findIndex(x => x.id === item.id) , 1);
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess("Your file is deleted successfully!")
          } else {
            this.loadingScreenService.stopLoading();
  
            this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
  
          this.alertService.showWarning("An error occurred while trying to delete! " + error)
        }
  
      }), ((err) => {
  
      })
    }
    else{
      this.clientApprovalTbl.splice( this.clientApprovalTbl.findIndex(x => x.id === item.id) , 1);
    }

    console.log("Approval Tbl ::" , this.clientApprovalTbl);
  }

  onClickingPendingBucketSubmitButton(){
    if(this.pendingBucketSelectedItems == undefined || this.pendingBucketSelectedItems == null || this.pendingBucketSelectedItems.length <= 0){
      this.alertService.showInfo("Please choose one or more records!");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        let workFlowInitiationList : WorkFlowInitiation[] = [];

        for(let obj of  this.pendingBucketSelectedItems){
          let workFlowInitiation = new WorkFlowInitiation();
          let elcTran  = JSON.parse(obj.EmployeeLifeCycleTransaction);
          elcTran.Status = 7;
    
          if(typeof elcTran["EmployeeRateset"] == 'string' && elcTran["EmployeeRateset"] != ''){
            elcTran.EmployeeRatesets = JSON.parse(elcTran["EmployeeRateset"]);
          }
    
          workFlowInitiation.Remarks = "";
          workFlowInitiation.EntityId = obj.EmployeeId;
          workFlowInitiation.EntityType = EntityType.Employee;
          workFlowInitiation.CompanyId = this.CompanyId;
          workFlowInitiation.ClientContractId = obj.ClientContractId;
          workFlowInitiation.ClientId = obj.ClientId;
    
          workFlowInitiation.ActionProcessingStatus = 15000;
          workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
          workFlowInitiation.WorkFlowAction =  14;
          workFlowInitiation.RoleId = this.RoleId;
          workFlowInitiation.DependentObject = { "ClientContractId": obj.ClientContractId, "EmployeeLifeCycleTransaction": elcTran };
          workFlowInitiation.UserInterfaceControlLst = {
            AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
              : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
            ViewValue: null
          };
    
          workFlowInitiationList.push(workFlowInitiation);  
        }
    
        this.reSubmitWorkflow(workFlowInitiationList);

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })


  }

  onClickingSubmitButton(){

    if(this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0){
      this.alertService.showInfo("Please choose one or more records!");
      return;
    }

    $('#popup_client_approval').modal('show');
    this.clientApprovalTbl = [];

    return;


    let workFlowInitiationList : WorkFlowInitiation[] = [];

    for(let obj of  this.selectedItems){
      let workFlowInitiation = new WorkFlowInitiation();
      let elcTran  = JSON.parse(obj.EmployeeLifeCycleTransaction);
      elcTran.Status = 7;

      if(typeof elcTran["EmployeeRateset"] == 'string' && elcTran["EmployeeRateset"] != ''){
        elcTran.EmployeeRatesets = JSON.parse(elcTran["EmployeeRateset"]);
      }

      workFlowInitiation.Remarks = "";
      workFlowInitiation.EntityId = obj.EmployeeId;
      workFlowInitiation.EntityType = EntityType.Employee;
      workFlowInitiation.CompanyId = this.CompanyId;
      workFlowInitiation.ClientContractId = obj.ClientContractId;
      workFlowInitiation.ClientId = obj.ClientId;

      workFlowInitiation.ActionProcessingStatus = 15000;
      workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
      workFlowInitiation.WorkFlowAction =  14;
      workFlowInitiation.RoleId = this.RoleId;
      workFlowInitiation.DependentObject = { "ClientContractId": obj.ClientContractId, "EmployeeLifeCycleTransaction": elcTran };
      workFlowInitiation.UserInterfaceControlLst = {
        AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
          : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
        ViewValue: null
      };

      workFlowInitiationList.push(workFlowInitiation);  
    }

    // CONFIMATION ACTION - OK OR CANCEL THE SAVE OR SUBMIT ACTION
    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-primary',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: true,
    // })

    // swalWithBootstrapButtons.fire({
    //   title: 'Confirm?',
    //   text: "Are you sure you want to proceed?",
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Ok!',
    //   cancelButtonText: 'No, cancel!',
    //   allowOutsideClick: false,
    //   reverseButtons: true
    // }).then((result) => {
    //   console.log(result);

    //   if (result.value) {

    //     try {
    //       this.finalSubmit(workFlowInitiationList);
    //     } catch (error) {

    //       this.alertService.showWarning(error + " Failed! ELC submit wasn't completed"), this.loadingScreenService.stopLoading() ;

    //     }


    //   } else if (result.dismiss === Swal.DismissReason.cancel) {

    //     swalWithBootstrapButtons.fire(
    //       'Cancelled',
    //       'Your request has been cancelled',
    //       'error'
    //     )
    //   }
    // })


  }

  submitForVerification(){

    let elcTrans : any[] = [];
    this.resultList = [];  
    let workFlowInitiationList : WorkFlowInitiation[] = [];


    for(let obj of  this.selectedItems){
      
      let isMinimumwageAdhered = true;
      let isratesetValid = true;
      let elcTran  = JSON.parse(obj.EmployeeLifeCycleTransaction);
      elcTran["Gender"] = obj.Gender ? obj.Gender : 0;
      console.log("ELC Tran ::" , elcTran);

      if(typeof elcTran["EmployeeRateset"] == 'string' && elcTran["EmployeeRateset"] != ''){
        elcTran.EmployeeRatesets = JSON.parse(elcTran["EmployeeRateset"]);
      }

      // if(elcTran["DocumentApprovalIds"] !== undefined && elcTran["DocumentApprovalIds"] !== null &&
      // typeof elcTran["DocumentApprovalIds"] == 'string' && elcTran["DocumentApprovalIds"] != ''){
      //   elcTran.DocumentApprovalIds = JSON.parse(elcTran["DocumentApprovalIds"]);
      // }
      // else if(elcTran["DocumentApprovalIds"] === ''){
      //   elcTran["DocumentApprovalIds"] = [];
      // }

      if(elcTran.DocumentApprovalIds === undefined || elcTran.DocumentApprovalIds === null){
        elcTran.DocumentApprovalIds = [];
      }

      if(elcTran.DocumentApprovalLst === undefined || elcTran.DocumentApprovalLst === null){
        elcTran.DocumentApprovalLst = [];
      }
      else{
        for(let documentApproval of elcTran["DocumentApprovalLst"]){
          documentApproval.ModeType = UIMode.None;
          documentApproval.UIStatus = documentApproval.Status;
        }
      }

      this.setELCTransactionTypeProperties(elcTran.ELCTransactionTypeId);

      if(this.SalaryRevision && !elcTran.IsRateSetValid){
        isratesetValid = false;
      }

      if(this.SalaryRevision && !elcTran.IsMinimumwageAdhere){
        let oldDocumentApproval = elcTran.DocumentApprovalLst.find( x => x.DocumentApprovalFor === DocumentApprovalFor.MinimumWagesNonAdherence);
        let newDocumentApproval = this.clientApprovalTbl.find( x => x.DocumentApprovalFor === DocumentApprovalFor.MinimumWagesNonAdherence);

        if((oldDocumentApproval === undefined || oldDocumentApproval === null) && 
          (newDocumentApproval === undefined || newDocumentApproval === null) ){
            isMinimumwageAdhered = false;
          }
      }

      

      elcTrans.push(elcTran);

      if(!isratesetValid){
        let result : any = {
          EmployeeCode : obj.EmployeeCode,
          EmployeeName : obj.EmployeeName,
          ELCId : obj.Id,
          Status : false,
          ErrorMessage : "Rateset not valid! Please check salary breakup.",
        }
        this.resultList.push(result);
      }

      else if(!isMinimumwageAdhered){
        let result : any = {
          EmployeeCode : obj.EmployeeCode,
          EmployeeName : obj.EmployeeName,
          ELCId : obj.Id,
          Status : false,
          ErrorMessage : "Please provide proof for minimum wage non-adherance.",
        }
        this.resultList.push(result);
      }

      else{
        let result : any = {
          EmployeeCode : obj.EmployeeCode,
          EmployeeName : obj.EmployeeName,
          ELCId : obj.Id,
          Status : true,
          ErrorMessage : "Successfully submitted.",
        }
        this.resultList.push(result);
      }



    }

    let uploadData = {
      EmployeeLifeCycleTransactions : elcTrans,
      DocumentApprovalLst :  this.clientApprovalTbl
    }

    console.log("client approval tbl ::" , this.clientApprovalTbl);
    console.log("Data ::" , uploadData);
    console.log("ResultList ::" , this.resultList);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.loadingScreenService.startLoading();
        this.employeeService.SaveClientApprovalFoELC(uploadData).subscribe(data => {
          this.loadingScreenService.stopLoading();
          console.log("ELC Saved Result ::" , data);
          if(data.Status){
            
            let newElcTrans : any[];
            if(data.Result !== undefined && data.Result !== null){
              newElcTrans  = _.cloneDeep(data.Result);
            }
            else{
              newElcTrans = [];
            }

            if(this.resultList != undefined && this.resultList != null && this.resultList.length > 0){
              newElcTrans =  newElcTrans.filter(  x  => {
                let result =  this.resultList.find(y => (y.ELCId === x.Id && y.Status === true));
                console.log("Result ::" , result);
                return result !== undefined && result !== null;
              })
              console.log("filtered new elc trans ::" , newElcTrans);
              
              
            }

            for(let obj of  newElcTrans){
              let workFlowInitiation = new WorkFlowInitiation();
              let elcTran  = obj
              elcTran.Status = 7;
        
              // if(typeof elcTran["EmployeeRateset"] == 'string' && elcTran["EmployeeRateset"] != ''){
              //   elcTran.EmployeeRatesets = JSON.parse(elcTran["EmployeeRateset"]);
              // }
        
              workFlowInitiation.Remarks = "";
              workFlowInitiation.EntityId = obj.EmployeeId;
              workFlowInitiation.EntityType = EntityType.Employee;
              workFlowInitiation.CompanyId = this.CompanyId;
              workFlowInitiation.ClientContractId = obj.ClientContractId;
              workFlowInitiation.ClientId = obj.ClientId;
        
              workFlowInitiation.ActionProcessingStatus = 15000;
              workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
              workFlowInitiation.WorkFlowAction =  14;
              workFlowInitiation.RoleId = this.RoleId;
              workFlowInitiation.DependentObject = { "ClientContractId": obj.ClientContractId, "EmployeeLifeCycleTransaction": elcTran };
              workFlowInitiation.UserInterfaceControlLst = {
                AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
                  : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
                ViewValue: null
              };
        
              workFlowInitiationList.push(workFlowInitiation);  
            }

            this.finalSubmit(workFlowInitiationList);
          }
          else{
            this.alertService.showWarning(data.Message);
          }
        } , error => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Unknown error occured while submitting, please try again.");
          console.error(error);
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })

  }

  // WORKFLOW INITIATION 
  finalSubmit(workFlowJsonObj: WorkFlowInitiation[]): void {

    console.log("workflow obj" ,  workFlowJsonObj);
    let bulkElcParams : BulkELCWorkflowParams = new BulkELCWorkflowParams();  

    bulkElcParams.workFlowInititationList = workFlowJsonObj;
    bulkElcParams.updateStatus = false;
    bulkElcParams.newStatus = 7;

    this.loadingScreenService.startLoading();
    this.employeeService.post_BulkELCWorkFlow(bulkElcParams).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {

          $('#popup_client_approval').modal('hide');
          this.clientApprovalTbl = [];

          $('#popup_displayResult').modal('show');
          this.searchData();

          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`ELC Data has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');


        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

        this.searchData();

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submission!` + error);

      }


    }), ((error) => {

    });


  }

  reSubmitWorkflow(workFlowJsonObj: WorkFlowInitiation[]): void {

    console.log("workflow obj" ,  workFlowJsonObj);
    let bulkElcParams : BulkELCWorkflowParams = new BulkELCWorkflowParams();  

    bulkElcParams.workFlowInititationList = workFlowJsonObj;
    bulkElcParams.updateStatus = false;
    bulkElcParams.newStatus = 7;

    this.loadingScreenService.startLoading();
    this.employeeService.post_BulkELCWorkFlow(bulkElcParams).subscribe((response) => {

      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {

          // $('#popup_client_approval').modal('hide');
          this.clientApprovalTbl = [];

          // $('#popup_displayResult').modal('show');
          // this.searchData();

          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(`ELC Data has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');


        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submit!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

        this.searchData();

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submission!` + error);

      }


    }), ((error) => {

    });


  }

  pendingBucketGridReady(angularGrid : AngularGridInstance){
    this.pendingBucketangularGrid = angularGrid;
    this.pendingBucketGridObj1 = angularGrid && angularGrid.slickGrid || {};
    this.pendingBucketDataviewObj = angularGrid.dataView;
  }

  inSavedBucketGridReady(angularGrid: AngularGridInstance) {
    this.inSavedBucketangularGrid = angularGrid;
    this.inSavedBucketGridObj1 = angularGrid && angularGrid.slickGrid || {};
    this.inSavedBucketDataviewObj = angularGrid.dataView;
  }

  rejectedBucketGridReady(angularGrid: AngularGridInstance){
    this.rejectedBucketangularGrid = angularGrid;
    this.rejectedBucketGridObj1 = angularGrid && angularGrid.slickGrid || {};

  }

  searchAllBucketGridReady(angularGrid : AngularGridInstance){
    this.searchAllBucketangularGrid = angularGrid;
    this.searchAllBucketGridObj1 = angularGrid && angularGrid.slickGrid || {};
    this.searchAllBucketDataviewObj = angularGrid.dataView;
  }

  ttypechange(event, Month) {

    // if (event.target.checked) {

    //   this.selectedTTypes.push(Number(event.target.value));

    // } else {

    //   const index = this.selectedTTypes.indexOf(Number(event.target.value));
    //   if (index > -1) {
    //     this.selectedTTypes.splice(index, 1);
    //   }

    // }
    console.log('SELECTED ELC :: ', this.ELCTypes);
  }


  chooseEmployee() {

    let datasource : DataSource = {
      Name : "GetEmployeeELCDetails",
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }
    this.ActiveEmployeeList = [];

    this.isLoading = true;

    this.pageLayoutService.getDataset(datasource , 
      this.searchConfiguration.SearchElementList.filter( x => x.SendElementToGridDataSource == true)).subscribe(data => {
      this.isLoading = false;
      if(data.Status){
        if(data.dynamicObject != ''){

          this.ActiveEmployeeList = JSON.parse(data.dynamicObject);
          this.ActiveEmployeeList.length > 0 && this.ActiveEmployeeList.forEach(element => {
            element['isSelected'] = false;
          });
          console.log('active', this.ActiveEmployeeList);

        }
        else {
          this.alertService.showWarning("No Active employee found for the choosen parameters");
          this.ActiveEmployeeList = [];
        }
      }
      else {
        this.alertService.showWarning("Error Occured! Could not get records");
        console.log("Error : "  , data)
        this.ActiveEmployeeList = [];
      }
      
    } , error => {
      this.isLoading = false;
      this.alertService.showWarning("Error Occured! Could not get records");
      console.log(error);
      this.ActiveEmployeeList = [];
    })

    this.ELCTypes.forEach(element => {
      element.checked = false;
    });

    this.searchText = null;
    $('#popup_salary_breakup').modal('show');
    
    this.beforeEmployee = true;
    this.ActiveEmployeeList.length = 0;

    var searchObj = JSON.stringify({

      TransactionStatus: 2
    })

    

    // this.employeeService.getEmployeeList(CandidateListingScreenType.ELC, this.RoleId, (searchObj)).subscribe((data) => {

    //   let apiResult: apiResult = data;

    //   if (apiResult.Result != "" && apiResult.Status) {

    //     this.ActiveEmployeeList = JSON.parse(apiResult.Result);
    //     this.ActiveEmployeeList.length > 0 && this.ActiveEmployeeList.forEach(element => {
    //       element['isSelected'] = false;
    //     });
    //     console.log('active', this.ActiveEmployeeList);
    //     this.isLoading = false;
    //     return;
    //   }
    //   else {
    //     this.isLoading = false;
    //     this.ActiveEmployeeList = [];
    //   }

    // }), ((err) => {

    // });

    

    
  }

  onClickingSearchButton($event){
    $('#CanCollapse').collapse('hide');
    this.bind_SearchNames();
    this.searchData();

  }

  onClickingSearchAllSearchButton(event){
    $('#CanCollapse').collapse('hide');
    this.getSearchAllDataset();
  }
  

  bind_SearchNames(){
    // this.ClientName = this.searchElementList.find(x => x.FieldName == '@clientId').Value;
    // this.ClientCode = this.searchElementList.find(x => x.FieldName == '@clientcontractId').Value;
    // this.TeamName = this.searchElementList.find(x => x.FieldName == '@teamId').Value;

    console.log("search elements ::" , this.searchConfiguration.SearchElementList);

    var clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId");
    if(clientList.Value !== undefined && clientList.Value !== null && clientList.Value !== ''){
      this.searchedClientId = clientList.Value;

      if(clientList.DropDownList !== null && clientList.DropDownList.length > 0){
        let client = clientList.DropDownList.find(z => z.Id == clientList.Value)
        this.ClientName = client.Name;
      }
      else{
        this.ClientName = '';
      }
    }
    else {
      this.searchedClientId = 0;
    }

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() == "@clientcontractid");
    if(clientList.Value !== undefined && clientList.Value !== null && clientList.Value !== ''){
      this.searchClientContractId = clientList.Value;
      clientList.DropDownList !== null && clientList.DropDownList.length > 0 ? 
        (this.ClientCode = clientList.DropDownList.find(z => Number(z.Id) === Number(clientList.Value)).Code) : this.ClientCode = '';
    }
    else{
      this.searchClientContractId = 0;
    }

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@teamId");
    if(clientList.Value != undefined && clientList.Value !== null && clientList.Value != ''){
      this.searchedTeamId = clientList.Value;
      clientList.DropDownList != null && clientList.DropDownList != undefined ? 
      (this.TeamName = clientList.DropDownList.find(z => Number(z.Id) === Number(clientList.Value)).Name) : this.TeamName = '';
    }
    else{
      this.searchedTeamId = 0;
    }

    let PayGroup = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@paygroupId");
    if(PayGroup.Value !== undefined && PayGroup.Value !== null){
      this.PayGroupId = PayGroup.Value;
    }
    else{
      this.PayGroupId = 0;
    }

  }

  selectedEmployee(event, item) {

    if(item.EmployeeLifeCycleTransaction != undefined && item.EmployeeLifeCycleTransaction != null && 
      item.EmployeeLifeCycleTransaction.length >0 ){
      let elcTran : EmployeeLifeCycleTransaction;
      for(elcTran  of item.EmployeeLifeCycleTransaction){
        if(elcTran.Status == ELCStatus.Submitted || elcTran.Status == ELCStatus.Initiated || elcTran.Status == ELCStatus.ReSubmitted || 
          elcTran.Status == ELCStatus.Rejected || elcTran.Status == ELCStatus.Saved || elcTran.Status == ELCStatus.Approved){
            this.alertService.showWarning("Transaction for Employee " +  item.EmployeeName + " is already under process! \n\n Please select another employee");
            return ;
          }
      }
    }

    if(this.employeeSelected != undefined && this.employeeSelected != null){
      if(this.employeeSelected == item){
        item.isSelected = !item.isSelected;
        this.employeeSelected = null;
        this.isProceed = false;
        return;
      }
      else {
        this.employeeSelected.isSelected = false;
        item.isSelected = true;
        this.employeeSelected = item;


      }
    }
    else{
      item.isSelected = true;
      this.employeeSelected = item;
    }
    
    this.isProceed = true;
    this.label_EmployeeCode = item.EmployeeCode;
    this.label_EmployeeName = item.EmployeeName;
    this.label_ClientContractCode = item.ClientContractCode;
    this.label_ClientName = item.ClientName;
    this.Label_DOJ = item.DOJ;
    this.employeeObject = item;

    // this.ActiveEmployeeList.forEach(element => {
      
    //   if (element.EmployeeId == item.EmployeeId) {
        
    //     if(element.EmployeeLifeCycleTransaction != undefined && element.EmployeeLifeCycleTransaction != null && 
    //       element.EmployeeLifeCycleTransaction.length >0 ){
    //         let elcTran : EmployeeLifeCycleTransaction;
    //         for(elcTran  of element.EmployeeLifeCycleTransaction){
    //           if(elcTran.Status == ELCStatus.Initiated || elcTran.Status == ELCStatus.ReSubmitted || 
    //             elcTran.Status == ELCStatus.Rejected || elcTran.Status == ELCStatus.Saved){
    //               this.alertService.showWarning("Transaction for Employee " +  element.EmployeeName + " is already under process! \n\n Please select another employee");
    //               return ;
    //             }
    //         }
    //       }
        
    //     this.isProceed = true;
    //     this.label_EmployeeCode = item.EmployeeCode;
    //     this.label_EmployeeName = item.EmployeeName;
    //     this.label_ClientContractCode = item.ClientContractCode;
    //     this.label_ClientName = item.ClientName;
    //     this.Label_DOJ = item.DOJ;
    //     element.Id == item.Id ? element.isSelected = true : element.isSelected = false;
    //     this.employeeObject = element;
    //   }
    //   else {
    //     element.isSelected = false;
    //   }
    // });

  }

  proceed() {

    this.isProceed = false;
    this.editing = false;
    this.preview_employee();


  }

  preview_employee() {

    this.beforeEmployee = false;
    $('#popup_salary_breakup').modal('show');

  }

  downloadCTCSheet(){
    // this.importLayout = this.database.find( x => x.Code === this.code);
    console.log(this.importLayout);

    if(this.selectedItems == null || this.selectedItems.length <= 0){
      this.alertService.showInfo("Please Choose one or more records!");
      return;
    }

    let salaryNotRevised = this.selectedItems.find(x => !x.SalaryRevised);
    
    if(salaryNotRevised != undefined && salaryNotRevised != null){
      this.alertService.showInfo("Please choose employess where transaction type includes salary revision only");
    }

    let fillData = _.cloneDeep(this.selectedItems);

    for(let data of fillData){
      let elctran = JSON.parse(data.EmployeeLifeCycleTransaction);

      let ratesets = JSON.parse(elctran.EmployeeRateset);

      if(ratesets != undefined && ratesets != null && ratesets.length > 0){
        let rateset = ratesets[0];

        // rateset.RatesetProducts = _.orderBy(rateset.RatesetProducts , ['DisplayOrder'] , ["asc"]);
        // console.log("ELC ::" , elctran , rateset);

        for(let product of rateset.RatesetProducts){
          data[product.ProductCode] = product.Value
        }        

        data["AnnualSalary"] = rateset.AnnualSalary;

      }

    }

    
    for(let controlElement of this.importLayout.ControlElementsList){
      
      if(controlElement.SearchElements != undefined && controlElement.SearchElements != null 
        && controlElement.SearchElements.length >= 0){
          for(let searchElement of controlElement.SearchElements){
            if(searchElement.GetValueFromUser){
              // this.searchElemetsList.push(searchElement);
              let refrenceSearchElement = this.searchElementList.find( x => x.FieldName == searchElement.RefrenceFieldNameInSearchElements );
              if(refrenceSearchElement != null){
                searchElement.Value = refrenceSearchElement.Value;
              }
            }
          }
      }
    }

    console.log("Fill Data ::" , fillData);

    this.loadingScreenService.startLoading();
    this.importLayoutService.getExcelTemplate(this.importLayout , fillData , this.searchElementList).subscribe(
      data => {
        this.loadingScreenService.stopLoading();
        console.log(data);
        if(data.Status){
          this.downloadService.base64ToBlob(data.dynamicObject , 'CTCSheet');
        }
        else{
          this.alertService.showWarning(data.Message);
        }
      },
      error => {
        this.loadingScreenService.stopLoading();
        console.log(error);
      }
    )
  }

  modal_dismiss() {
    $('#popup_salary_breakup').modal('hide');
    this.isProceed = false;
    this.isLoading = false;
    this.selectedTTypes = [];

    this.ELCTypes.forEach(element => {

      element.checked = false;

    });

    console.log("ELC UPDATES ::", this.ELCTypes);

  }

  modal_dismiss_Current_SalaryBreakup(){
    $('#viewCTC').modal('hide');
    this.modalRateset = null;
  }

  modal_dismiss_displayResult(){
    $('#popup_displayResult').modal('hide');
  }

  lifeCycleChange(event) {

    console.log(event.target.value);

    this.Idx = event;

    console.log(event.target.checked);



    // $('#popup_salary_breakup').modal('hide');

    // console.log(this.employeeObject);

    // let navigationExtras: NavigationExtras = {
    //   queryParams: {
    //     "Idx": this.Idx.id,
    //     "Edx": this.employeeObject == null ? null : JSON.stringify(this.employeeObject.Id),
    //     "Cdx": this.employeeObject == null ? null : JSON.stringify(this.employeeObject.ClientId)


    //   }
    // };
    // if (!this.Idx) {
    //   this.alertService.showWarning("Please choose your Life Cycle before proceed!")
    // }
    // else {
    //   this.router.navigate(['/app/Revisonsalary'], navigationExtras);
    // }
  }


  start() {
    console.log(this.Idx);

    var atleastOne = this.ELCTypes.filter(a => a.checked);

    if(this.isEditingCurrentELC && atleastOne.length == 0 && this.isAllenDigital){
      this.alertService.showWarning("Please select a valid Life Cycle type");
      this.isEditingCurrentELC = false;
      return;
    }
    if (atleastOne.length == 0) {
      this.alertService.showWarning("Please choose your Life Cycle type before proceed!")
      return;
    }
    else {
      this.Idx = 0;
      this.ELCTypes.forEach(element => {
        if (element.checked == true) {
          this.Idx = Number(this.Idx) + Number(element.id);
        }
      });
      console.log("Idx :: ", this.Idx);
      console.log("Employee Obj ::" , this.employeeObject);
      let employee = {
        EmployeeId: this.employeeObject.EmployeeId,
        ClientId: this.employeeObject.ClientId,
        ClientContractId: this.employeeObject.ClientContractId,
        ClientName: this.employeeObject.ClientName,
        EmployeeCode: this.employeeObject.EmployeeCode,
        Id: this.employeeObject.Id,
      } 
      // console.log("b to a ::"  , employee , btoa(JSON.stringify(employee)))
      $('#popup_salary_breakup').modal('hide');
      let navigationExtras: NavigationExtras = {
        queryParams: {
          "Idx": btoa(this.Idx),
          "Odx": btoa(JSON.stringify(employee)),
        }
      };
      this.router.navigate(['/app/elc/revisionSalary'], navigationExtras);


    }


    // if (this.Idx == null || this.Idx == undefined || this.Idx == "") {
    //   this.alertService.showWarning("Please choose your Life Cycle type before proceed!")
    // }
    // else {
    //   $('#popup_salary_breakup').modal('hide');
    //   let navigationExtras: NavigationExtras = {
    //     queryParams: {
    //       "Idx": btoa(this.Idx),
    //       "Odx": btoa(JSON.stringify(this.employeeObject)),
    //     }
    //   };
    //   this.router.navigate(['/app/revisionSalary'], navigationExtras);
    // }

  }

  beforeTabChange(event : NgbTabChangeEvent){
    console.log(event);
    this.activeTabName = event.nextId;
    console.log("Tab Changed" , this.activeTabName);
    $('#CanCollapse').collapse('show');

  }

  beforeMyBucketTabChange(event : any){

    console.log("tab changed to" , event.nextId);
    console.log("Search elements ::" , this.searchElementList);

    let currentTabName = event.activeId;

    this.selectedItems = [];
    this.dataset = [];
    if(this.dataset == undefined || this.dataset == null){
      if(event.nonNative){
        return
      }else{
        event.preventDefault();
        return;
      }
      
    }

    this.activeMyBucketTabName = event.nextId;
    if(this.activeMyBucketTabName == "Saved"){
      this.TransactionStatus = 1;
    this.bind_SearchNames();
    this.searchData();
    }
    else if(this.activeMyBucketTabName == 'Pending'){
      this.TransactionStatus = 7;
      this.bind_SearchNames();
      this.searchData();
    }
    else{
      this.TransactionStatus = 4;
      this.bind_SearchNames();
      this.searchData();
    }
  }
  
  pendingBucketSelectedRowsChanged(e,args){
    this.pendingBucketSelectedItems = [];
    
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.pendingBucketDataviewObj.getItem(row);
        this.pendingBucketSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.pendingBucketSelectedItems);
  }

  inSavedBucketSelectedRowsChanged(e,args){
    this.selectedItems = [];
    
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inSavedBucketDataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('answer', this.selectedItems);
  }

  searchAllBucketSelectedRowsChanged(e,args){
    this.searchAllSelectedItems = [];
    
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.searchAllBucketDataviewObj.getItem(row);
        this.searchAllSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.searchAllSelectedItems);
  }

  voidElcTransactions(){
    if(this.selectedItems == null || this.selectedItems.length <= 0){
      this.alertService.showInfo("Please Choose one or more records!");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.loadingScreenService.startLoading();
        let elcIds : number[] = [];

        this.selectedItems.forEach(elcTran => elcIds.push(elcTran.Id));
    
        this.employeeService.VoidELCTransactions(elcIds).subscribe(data => {
          this.loadingScreenService.stopLoading();
          if(data.Status){
            this.alertService.showSuccess("Selected transactions have been cancelled successfully");
            this.searchData();
          }
          else{
            this.alertService.showWarning("Error Occured! Error -> " + data.Message);
          }
        } , error => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Unknown error occured while voiding transaction, please try again.");
          console.error(error);
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })

    
  }

  cancelAnyELCTransaction(){
    if(this.searchAllSelectedItems == null || this.searchAllSelectedItems.length <= 0){
      this.alertService.showInfo("Please Choose one or more records!");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.loadingScreenService.startLoading();
        this.resultList = [];
        this.employeeService.CancelAnyELCTransactions(this.searchAllSelectedItems).subscribe(data => {
          this.loadingScreenService.stopLoading();
          if(data.Status){
            this.alertService.showSuccess("Selected transactions have been cancelled successfully");
            this.getSearchAllDataset();

            if(data.Result !== ''){
              this.resultList = JSON.parse(data.Result);
              $('#popup_displayResult').modal('show');
            }
            

          }
          else{
            this.alertService.showWarning(data.Message);
          }
        } , error => {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("Unknown error occured while voiding transaction, please try again.");
          console.error(error);
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }

  downloadLetters(){
    if(this.searchAllSelectedItems == undefined || this.searchAllSelectedItems == null || this.searchAllSelectedItems.length <= 0){
      this.alertService.showInfo("Please select a record");
      return;
    }

    let canDownload : boolean = true;
    this.searchAllSelectedItems.forEach(row => {
      if(row.Status !== 2)
        canDownload = false;
    })

    if(!canDownload){
      this.alertService.showInfo("Letters can be only downloaded for elc transactions with status active");
      return;
    }

    let documentIds : number[] = [];

    for(let row of this.searchAllSelectedItems)  {
      if(row.LetterDocumentId != undefined && row.LetterDocumentId != null && row.LetterDocumentId !== 0){
        documentIds = documentIds.concat(row.LetterDocumentId);
      }
    }

    console.log("Document Ids ::" , documentIds);

    this.downloadService.downloadFilesInZip(documentIds , 'ELC_Letters_' + moment(new Date()).format('DD-MM-YYYY'));
  }

  setELCTransactionTypeProperties(Idx : number){
    if (Idx == 2) {
      this.SalaryRevision = true;
    }
    else if (Idx == 3) {
      this.ReLocation = true;
    }
    else if (Idx == 4) {
      this.ReDesignation = true;
    }
    else if (Idx == 5) {
      this.SalaryRevision = true;
      this.ReLocation = true;
    }
    else if (Idx == 6) {
      this.SalaryRevision = true;
      this.ReDesignation = true;

    }
    else if (Idx == 7) {
      this.ReLocation = true;
      this.ReDesignation = true;
    }
    else if (Idx == 8) {
      this.ContractExtension = true;
    }
    else if (Idx == 9) {
      this.SalaryRevision = true;
      this.ReLocation = true;
      this.ReDesignation = true;
    }
    else if (Idx == 10) {
      this.SalaryRevision = true;
    }
    else if (Idx == 11) {
      this.ReLocation = true;
      this.ContractExtension = true;
    }
    else if (Idx == 12) {
      this.ReDesignation = true;
      this.ContractExtension = true;
    }
    else if (Idx == 13) {
      this.SalaryRevision = true;
      this.ReLocation = true;
      this.ContractExtension = true;
    }
    else if (Idx == 14) {
      this.SalaryRevision = true;
      this.ReDesignation = true;
      this.ContractExtension = true;
    }
    else if (Idx == 15) {
      this.ReDesignation = true;
      this.ReLocation = true;
      this.ContractExtension = true;
    }
    else if (Idx == 17) {
      this.SalaryRevision = true;
      this.ReLocation = true;
      this.ReDesignation = true;
      this.ContractExtension = true;
    }
  }

  fetchElcHistory(){
    this.isHistoryHidden = false;
    this.TransactionStatus = 0;
    this.bind_SearchNames();
    this.searchData();

  }

  hideElcHistory(){
    this.isHistoryHidden = true;
    let saveEventParam = {
      "activeId": "Rejected",
      "nextId": "Saved",
      "nonNative" : true
    }
    this.beforeMyBucketTabChange(saveEventParam);
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
      else if (value == "Pending") {

        formattedValue = `<span style=" display: inline-block;
        padding: .55em .8em;
        font-weight: 500;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color:  #EE9A15;background-color: #FFE9C7;">${value.toUpperCase()}</span>`;
      }
      return formattedValue;

    }
  }

  actionTakenFormatter(row, cell, value, columnDef, dataContext, grid) {

    if (columnDef.id == "ActionBy" ) {
      if (value && dataContext.TransactionStatusText != 'Pending') {
        return (value != '' && value != null && value != undefined) ? value : '--';
      }else {
        return `<div style="text-align: center;"><span>--</span></div>`; //ActionTakenBy 
      }
    } else if (columnDef.id == "ActionAt" || columnDef.id == "RequestedAt") {
      if (value) {
        let dateValue = (value != '' && value != null && value != undefined) ? value : '--';
        if (dateValue != '--') {
          let inputDate = moment(dateValue);
          let formattedDate = inputDate.format('DD-MM-YYYY');
          return formattedDate;
        } else {
          return `<div style="text-align: center;"><span>--</span></div>`; //RequestedAt, ActionAt
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
}
