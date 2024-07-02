import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AngularGridInstance, AngularUtilService, Column, Formatters, GridOption, OnEventArgs } from 'angular-slickgrid';
import FileSaver from 'file-saver';
import _ from 'lodash';
import moment from 'moment';
import { CommaSeparatedStringsFilterComponent } from 'src/app/grid-filters/comma-separated-strings/comma-separated-strings-filter/comma-separated-strings-filter.component';
import { CommaSeparatedStringFilterHandler } from 'src/app/grid-filters/comma-separated-strings/CommaSeparatedStringFilterHandler'
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { ViewdocsModalComponent } from 'src/app/shared/modals/expense/viewdocs-modal/viewdocs-modal.component';
import { InitiateSaleOrderModalComponent } from 'src/app/shared/modals/payroll/initiate-sale-order-modal/initiate-sale-order-modal.component';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, Role, UserHierarchyRole } from 'src/app/_services/model';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { searchObject, _searchObject } from 'src/app/_services/model/Common/SearchObject';
import { ExpenseClaimRequest } from 'src/app/_services/model/Expense/ExpenseClaimRequest';
import { ExpenseClaimRequestStatus, MigrateExpenseModel, SubmitExpenseClaimRequestModel } from 'src/app/_services/model/Expense/ExpenseEligibilityCriteria';
import { AdjustmentType } from 'src/app/_services/model/Payroll/Adjustment';
import { Expense, ExpenseStatus, ExpenseType } from 'src/app/_services/model/Payroll/Expense';
import { GeneratePIS } from 'src/app/_services/model/Payroll/generatePIS';
import { PayrollModel, _PayrollModel } from 'src/app/_services/model/Payroll/ParollModel';
import { PayrollQueueMessage } from 'src/app/_services/model/Payroll/PayrollQueueMessage';
import { PayrollVerificationRequest, PayrollVerificationRequestDetails, PVRStatus } from 'src/app/_services/model/Payroll/PayrollVerificationRequest';
import { PayRun, PayRunDetails, PayRunStatus, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { ProcessTimeCardsModel } from 'src/app/_services/model/Payroll/ProcessTimeCardsModel';
import { ReimbursementConfiguration } from 'src/app/_services/model/Payroll/ReimbursementConfiguration';
import { ReimbursementProductConfiguration } from 'src/app/_services/model/Payroll/ReimbursementProductConfiguration';
import { BillUnitType, PayUnitType, TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { AlertService, DownloadService, ExcelService, ImportLayoutService, PagelayoutService, PayrollService, SessionStorage } from 'src/app/_services/service';
import { ReimbursementService } from 'src/app/_services/service/reimbursement.service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { isUndefined } from 'util';
import { FormInputControlType, RelationWithParent } from '../../generic-form/enums';
import { ApiRequestType, DataFormat, ImportControlElementType } from '../../generic-import/import-enums';
import { ImportLayout } from '../../generic-import/import-models';
import { TimeCardModel } from '../../payroll/payrollinputtransaction/payrollinputtransaction.component';
import { DataSourceType, InputControlType, RowSelectionType, SearchPanelType } from '../../personalised-display/enums';
import { DataSource, PageLayout, SearchConfiguration, SearchElement, SearchElementValues } from '../../personalised-display/models';
import { RowDataService } from '../../personalised-display/row-data.service';
import { apiResult } from './../../../_services/model/apiResult';


@Component({
  selector: 'app-reimbursement',
  templateUrl: './reimbursement.component.html',
  styleUrls: ['./reimbursement.component.css']
})
export class ReimbursementComponent implements OnInit {

  //Pagelayouts
  outputPageLayout: PageLayout;
  readonly outputPageLayoutCode: string = 'ReimbursementOutput';

  //Properties to disable search until UI is completely loaded
  disableSearchForProcess: boolean = true;


  spinner: boolean = false;
  slider: boolean = false;
  isAdd: boolean = true;
  isEdit: Boolean = false;
  isChanged: Boolean = false;
  netPaySlider: boolean = false;
  employeeCode: string;
  payPeriod: SearchElement;
  processPayPeriod: SearchElement;
  processClient: SearchElement;
  processClientContract: SearchElement;
  processTeam: SearchElement;
  searchPanel: boolean = false;
  searchObject: searchObject;
  teamOpenPayPeriodId: number;
  teamOpenPayPeriod: any = 0;

  isProcess: boolean = false;

  activeTabName: string = 'PendingExpense';
  processActiveTabName: string = 'PAYINPUTS';

  rowRecord: any;
  Payitems: any;


  addRowRecord: any;
  reimbursementProducts: any[];
  reimbursementConfiguration: any;


  //Add
  searchConfiguration: SearchConfiguration;
  searchConfigurationProcess: SearchConfiguration;
  columnDefinition: Column[];
  gridOptions: GridOption;
  dataset: any[];
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  selectedItems: any[];



  //Upload
  file: File;
  @ViewChild("fileInput") inputFile: ElementRef;

  //Import
  importColumnDefinition: Column[];
  importGridOptions: GridOption;
  importDataset: any[];
  importAngularGrid: AngularGridInstance;
  importGridObj: any;
  importDataviewObj: any;
  importSelectedItems: any[];

  //apiGrid
  apiGridColumnDefinition: Column[];
  apiGridGridOptions: GridOption;
  apiGridDataset: any[];
  apiGridAngularGrid: AngularGridInstance;
  apiGridGridObj: any;
  apiGridDataviewObj: any;
  apiGridSelectedItems: any[];

  //Process - Input/Output
  outputColumnDefinition: Column[];
  outputGridOptions: GridOption;
  outputDataset: any[];
  outputAngularGrid: AngularGridInstance;
  outputGridObj: any;
  outputDataviewObj: any;
  outputSelectedItems: any[];

  //Process - Payrun
  payrunColumnDefinition: Column[];
  payrunGridOptions: GridOption;
  payrunDataset: any[];
  payrunAngularGrid: AngularGridInstance;
  payrunGridObj: any;
  payrunDataviewObj: any;
  payrunSelectedItems: any[];

  //History
  searchConfigurationForHistroy: SearchConfiguration;
  historyColumnDefinition: Column[];
  historyGridOptions: GridOption;
  historyDataset: any[];
  historyAngularGrid: AngularGridInstance;
  historyGridObj: any;
  historyDataviewObj: any;
  historySelectedItems: any[];

  // PENDING EXPENSE
  searchConfigurationForexpense: SearchConfiguration;
  expenseColumnDefinition: Column[];
  expenseGridOptions: GridOption;
  expenseDataset: any[];
  expenseAngularGrid: AngularGridInstance;
  expenseGridObj: any;
  expenseDataviewObj: any;
  expenseSelectedItems: any[];

  importLayout: ImportLayout;

  //Session Details
  _loginSessionDetails: LoginResponses;
  companyId: number;
  clientId: number;
  clientContractId: number;
  implementationCompanyId: number;
  userId: number;
  userName: string = '';
  currentRole: Role;
  roleCode: string;
  pageLayout: PageLayout;
  businessType: number;
  Role: Role;


  //TimeCard
  newTimeCardList: TimeCard[];


  hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value != null && value != -1 ? '<a href="javascript:;">' + value + '</a>' : '---';

  //PVR 
  payrollModel: PayrollModel;
  searchedClientId: any;
  searchClientContractId: any;
  searchedPayperiodId: any;
  searchedPayPeriodName: any;
  seacrhedteamId: number;
  LstProceeTimeCards: any[];
  processedEMP: any[];
  resultList: any[];

  // SME 
  clientSME: any;
  clientcontractSME: any;
  clientIdSME: number;
  clientcontractIdSME: number;

  isImportDuplicateEntry: boolean = false;
  isOutputDuplicateEntry: boolean = false;
  isPayRunDuplicateEntry: boolean = false;
  isHistoryDuplicateEntry: boolean = false;
  isNormalDSDuplicateEntry: boolean = false;

  // EXPANSE CLAIM REQUEST

  expenseClaimRequestSlider: boolean = false;
  rowData: any = null;
  expenseClaimRequestStatus: any[] = [];
  selectAll = false;
  expenseConfiguration: ReimbursementConfiguration = new ReimbursementConfiguration();
  LstCategory: any[] = [];
  AllowedTabsForFinAdmRole = ["New Request", "Add/Import"]
  selectedClaimRequests: any[] = [];
  requiredListTabsTobeDisplayed = ['PendingExpense'];;
  modalOption: NgbModalOptions = {};


  constructor(
    private pageLayoutService: PagelayoutService,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private importLayoutService: ImportLayoutService,
    private reimbursementService: ReimbursementService,
    private loadingSreenService: LoadingScreenService,
    private router: Router,
    private payrollService: PayrollService,
    private rowDataService: RowDataService,
    private modalService: NgbModal,
    private angularUtilService: AngularUtilService,
    private downloadService: DownloadService,
    private utilityService: UtilityService,
    private excelService: ExcelService,
    private utilsHelper: enumHelper

  ) { }

  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.userId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.userName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.companyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.implementationCompanyId = this._loginSessionDetails.ImplementationCompanyId;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    this.roleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.expenseClaimRequestStatus = this.utilsHelper.transform(ExpenseClaimRequestStatus) as any;
    this.Role = this._loginSessionDetails.UIRoles[0].Role;


    this.pageLayoutService.getPageLayout(this.outputPageLayoutCode).subscribe(data => {
      this.disableSearchForProcess = false;
      console.log("Reimbursement pagelayout ::", data);
      if (data.Status === true && data.dynamicObject != null) {

        let pageLayout: PageLayout = data.dynamicObject;

        if (this.businessType !== 3) {

          this.clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
          this.clientIdSME = this.sessionService.getSessionStorage("default_SME_ClientId");
          this.clientcontractSME = JSON.parse(this.sessionService.getSessionStorage("SME_ClientContract"));
          this.clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");

          let clientDropDownList: any[] = [];
          let clientcontractDropDownList: any[] = [];

          if (this.clientSME !== undefined && this.clientSME !== null) {
            clientDropDownList.push(this.clientSME);
          }

          if (this.clientcontractSME !== undefined && this.clientcontractSME !== null) {
            clientcontractDropDownList.push(this.clientcontractSME);
          }

          let clientSearchElement = pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@clientid');
          let clientcontractSearchElement = pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@clientcontractid');

          clientSearchElement.Value = this.clientSME.Id;
          clientSearchElement.DropDownList = clientDropDownList;
          clientcontractSearchElement.Value = this.clientcontractSME.Id;
          clientcontractSearchElement.DropDownList = clientcontractDropDownList;

          clientSearchElement.IsIncludedInDefaultSearch = false;
          clientcontractSearchElement.IsIncludedInDefaultSearch = false;

          pageLayout.SearchConfiguration.ClearButtonRequired = false;


          this.searchConfiguration = pageLayout.SearchConfiguration;
          this.searchConfigurationProcess = this.searchConfiguration;
        }
        else {
          this.searchConfiguration = pageLayout.SearchConfiguration;
          this.searchConfigurationProcess = this.searchConfiguration;
        }



        this.outputPageLayout = pageLayout;
        console.log("outputPageLayout", this.outputPageLayout);
        this.setGrid("output");
        this.spinner = false;






        let commonSearchElementsString: string = sessionStorage.getItem('CommonSearchCriteria');

        if (commonSearchElementsString !== undefined && commonSearchElementsString !== null && commonSearchElementsString !== '') {
          this.pageLayoutService.fillSearchElementFromLocalStorage(this.searchConfiguration.SearchElementList);
          console.log("Search elements locally filled", this.searchConfiguration.SearchElementList);
          let teamSearchELement = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@teamid')
          if (teamSearchELement.Value !== null && teamSearchELement.DropDownList !== null && teamSearchELement.DropDownList.length > 0) {
            let team = teamSearchELement.DropDownList.find(x => x.Id === teamSearchELement.Value);
            if (team.OpenPayPeriodId !== undefined && team.OpenPayPeriodId !== null &&
              team.PayPeriod !== undefined && team.PayPeriod !== null) {
              this.onClickingSearchButton();
            }
            else {
              teamSearchELement.Value = null;
              teamSearchELement.DropDownList = [];
            }
          }
        }

        // this.getDatasetBasedOnActiveTab();

        if (this.rowDataService.dataInterface.SearchElementValuesList != undefined &&
          this.rowDataService.dataInterface.SearchElementValuesList != null &&
          this.rowDataService.dataInterface.SearchElementValuesList.length >= 0) {

          this.rowDataService.dataInterface = {
            SearchElementValuesList: null,
            RowData: null
          }

          console.log(this.searchConfiguration);

          this.bind_SearchIds();

          this.getDatasetBasedOnActiveTab();

        }

        this.processClient = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLowerCase() == '@clientid');
        this.processClientContract = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLowerCase() == '@clientcontractid');
        this.processTeam = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLowerCase() == '@teamid');
      }
      else {
        this.spinner = false;
        this.router.navigate(['app/dashboard']);
        this.alertService.showWarning("Pagelayout not found. Please contact support");
      }
    }, error => {
      this.spinner = false;

    })

    this.importDataset = [];



    // this.searchConfiguration = {
    //   SearchElementList : [
    //     {
    //       DataSource: {
    //         EntityType: 0,
    //         IsCoreEntity: false,
    //         Name: "GetUserMappedClientList",
    //         Type: DataSourceType.SP
    //       },
    //       DefaultValue : "0",
    //       DisplayFieldInDataset : "Name",
    //       FieldName : "@clientId",
    //       DisplayName : 'Client Name',
    //       ForeignKeyColumnNameInDataset : "Id",
    //       InputControlType : InputControlType.AutoFillTextBox,
    //       IsIncludedInDefaultSearch : true,
    //       TriggerSearchOnChange : false,
    //       MultipleValues : null,
    //       Value : null,
    //       DropDownList : [],
    //       ParentFields : null,
    //       ParentHasValue : [],
    //       GetValueFromUser : false,
    //       SendElementToGridDataSource : true,
    //       DataSecurityConfiguration : {
    //         IsMappedData : true,
    //         RoleBasedConfigurationList : [
    //           {
    //             RoleCode : "OpsMember",
    //             IsDataLeverSecurityRequired : true,
    //           }
    //         ]
    //       }
    //     },
    //     { 
    //       DataSource : {
    //         IsCoreEntity : false,
    //         Name : "GetUserMappedClientContractList",
    //         Type : DataSourceType.SP
    //       },
    //       DefaultValue : '0',
    //       DisplayFieldInDataset : 'Name',
    //       FieldName : "@clientcontractId",
    //       DisplayName : 'Contract Name',
    //       ForeignKeyColumnNameInDataset : "Id",
    //       IsIncludedInDefaultSearch : true,
    //       InputControlType : InputControlType.AutoFillTextBox,
    //       Value : null,
    //       TriggerSearchOnChange : false,
    //       ReadOnly : true,
    //       DropDownList : [],
    //       ParentHasValue : [],
    //       ParentFields : ["@clientId"],
    //       MultipleValues : null,
    //       GetValueFromUser : false,
    //       SendElementToGridDataSource : true,
    //       DataSecurityConfiguration : {
    //         IsMappedData : true,
    //         RoleBasedConfigurationList : [
    //           {
    //             RoleCode : "OpsMember",
    //             IsDataLeverSecurityRequired : true,
    //           }
    //         ]
    //       }
    //     } ,
    //     {
    //       DataSource: {Type: 1, Name: "TeamView", EntityType: 0, IsCoreEntity: false},
    //       DefaultValue: "0",
    //       DisplayFieldInDataset: "Name",
    //       DisplayName: "Team Name",
    //       DropDownList: [],
    //       FieldName: "@teamId",
    //       ForeignKeyColumnNameInDataset: "Id",
    //       InputControlType: 2,
    //       IsIncludedInDefaultSearch: true,
    //       MultipleValues: [],
    //       ParentFields: ["@clientcontractId"],
    //       ParentHasValue: [],
    //       ReadOnly: true,
    //       RelationalOperatorValue: null,
    //       RelationalOperatorsRequired: false,
    //       TriggerSearchOnChange: false,
    //       Value: null,
    //       GetValueFromUser : false,
    //       SendElementToGridDataSource : true
    //     },
    //     // {
    //     //   DataSource: {Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false},
    //     //   DefaultValue: "0",
    //     //   DisplayFieldInDataset: "Name",
    //     //   DisplayName: "Pay Period",
    //     //   DropDownList: [],
    //     //   FieldName: "@payperiodId",
    //     //   ForeignKeyColumnNameInDataset: "Id",
    //     //   InputControlType: 2,
    //     //   IsIncludedInDefaultSearch: true,
    //     //   MultipleValues: [],
    //     //   ParentFields: ['@clientcontractId'],
    //     //   ParentHasValue: [],
    //     //   ReadOnly: false,
    //     //   RelationalOperatorValue: null,
    //     //   RelationalOperatorsRequired: false,
    //     //   TriggerSearchOnChange: false,
    //     //   Value: null,
    //     //   GetValueFromUser : false,
    //     //   SendElementToGridDataSource : true,
    //     // },
    //   ],

    //   SearchPanelType : SearchPanelType.Panel,
    //   SearchButtonRequired : true,
    //   ClearButtonRequired : true,
    //   SaveSearchElementsLocally : true,
    //   IsDataLevelSecurityRequired : false,
    //   SecurityKeys : [['UserId'] , ['RoleId']]
    // };
    // this.searchConfigurationProcess = this.searchConfiguration;

    this.searchConfigurationForHistroy = {
      SearchElementList: [
        {
          DataSource: {
            EntityType: 0,
            IsCoreEntity: false,
            Name: "client",
            Type: 1
          },
          DefaultValue: "1846",
          DisplayFieldInDataset: "Name",
          FieldName: "@clientId",
          DisplayName: 'Client Name',
          ForeignKeyColumnNameInDataset: "Id",
          InputControlType: InputControlType.AutoFillTextBox,
          IsIncludedInDefaultSearch: false,
          TriggerSearchOnChange: false,
          MultipleValues: null,
          Value: null,
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
          IsIncludedInDefaultSearch: false,
          InputControlType: InputControlType.AutoFillTextBox,
          Value: null,
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
        {
          DataSource: { Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false },
          DefaultValue: "[]",
          DisplayFieldInDataset: "Name",
          DisplayName: "Pay Period",
          DropDownList: [],
          FieldName: "@payperiodIds",
          ForeignKeyColumnNameInDataset: "Id",
          InputControlType: InputControlType.MultiSelectDropDown,
          IsIncludedInDefaultSearch: true,
          MultipleValues: [],
          ParentFields: ['@clientcontractId'],
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
          DisplayName: "NetPay (From)",
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
          DisplayName: "NetPay (Till)",
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
        }

      ],
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: true,
      SaveSearchElementsLocally: false
    }

    this.searchConfigurationForexpense = {
      SearchElementList: [
        {
          DataSource: { Type: 1, Name: "", EntityType: 0, IsCoreEntity: false },
          DefaultValue: "0",
          DisplayFieldInDataset: "Name",
          DisplayName: "User Name",
          DropDownList: [],
          FieldName: "@userId",
          ForeignKeyColumnNameInDataset: "Id",
          InputControlType: 2,
          IsIncludedInDefaultSearch: false,
          MultipleValues: [],
          ParentFields: [],
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
          DataSource: { Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false },
          DefaultValue: "0",
          DisplayFieldInDataset: "Name",
          DisplayName: "Role Name",
          DropDownList: [],
          FieldName: "@roleCode",
          ForeignKeyColumnNameInDataset: "Id",
          InputControlType: 2,
          IsIncludedInDefaultSearch: false,
          MultipleValues: [],
          ParentFields: [],
          ParentHasValue: [],
          ReadOnly: true,
          RelationalOperatorValue: null,
          RelationalOperatorsRequired: false,
          TriggerSearchOnChange: false,
          Value: null,
          GetValueFromUser: false,
          SendElementToGridDataSource: true
        },

      ],
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: true,
      SaveSearchElementsLocally: false
    }

    // this.payPeriod = this.searchConfiguration.SearchElementList.find(x => x.FieldName == '@payperiodId');
    // this.processPayPeriod = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName == '@payperiodId');

    // let searchElementsForDynamicProducts = this.searchConfiguration.SearchElementList;
    // searchElementsForDynamicProducts.push({
    //   FieldName : "@employeeId" , 
    //   Value  : 0 , 
    //   SendElementToGridDataSource : false ,
    //   IsIncludedInDefaultSearch : false,
    //   DropDownList : []
    // });

    this.importLayout = {
      Id: 0,
      Code: '',
      Name: '',
      CompanyId: 0,
      ClientId: 0,
      ImportTree: {
        DataSource: {
          Name: "Reimbursement",
          Type: DataSourceType.View,
          IsCoreEntity: false
        },
        RelationWithParent: RelationWithParent.None,
        Children: []
      },
      ControlElementsList: [
        // {//Employee ID
        //   Label : 'Employee Id',
        //   FieldName : 'EmployeeId',
        //   EntityList : ["Reimbursement"],
        //   InputControlType : FormInputControlType.TextBox,
        //   Type : ImportControlElementType.Basic,
        // },
        {//Employee Code
          Label: 'Employee Code',
          FieldName: 'EmployeeCode',
          EntityList: ["Reimbursement"],
          InputControlType: FormInputControlType.TextBox,
          Type: ImportControlElementType.Basic,
        },
        {//Employee Name
          Label: 'Employee Name',
          FieldName: 'EmployeeName',
          EntityList: ["Reimbursement"],
          InputControlType: FormInputControlType.TextBox,
          Type: ImportControlElementType.Basic,
        },
        {// Client Name
          Label: 'Client Name',
          FieldName: 'ClientName',
          EntityList: ['Reimbursement'],
          InputControlType: FormInputControlType.TextBox,
          Type: ImportControlElementType.Basic
        },
        {// Date of joining
          Label: 'Date of Joining',
          FieldName: 'DOJ',
          EntityList: ['Reimbursement'],
          InputControlType: FormInputControlType.TextBox,
          Type: ImportControlElementType.Basic
        },
        {//Dynamic Products
          Label: '',
          FieldName: 'DynamicProducts',
          EntityList: ["Reimbursement"],
          InputControlType: FormInputControlType.TextBox,
          Type: ImportControlElementType.Dynamic,
          DisplayField: "DisplayName",
          ValueField: "DisplayName",
          DataSource: {
            Name: 'GetReimbursementProducts',
            Type: DataSourceType.SP,
            IsCoreEntity: false
          },
          SearchElements: []
        },

      ],
      CreateExcelConfiguration: {
        DataSource: {
          Name: '',
          Type: DataSourceType.SP,
          IsCoreEntity: false
        },
        GridConfiguration: {
          ColumnDefinitionList: [
            {
              Id: "EmployeeCode",
              FieldName: "EmployeeCode",
              DisplayName: "Employee Code",
              IsFilterable: true,
              Width: 0
            },
            {
              Id: "EmployeeName",
              FieldName: "EmployeeName",
              DisplayName: "Employee Name"
            },
            {
              Id: "ClientName",
              FieldName: "ClientName",
              DisplayName: "ClientName",
              IsFilterable: true,

              Width: 0
            },
            {
              Id: "DOJ",
              FieldName: "DOJ",
              DisplayName: "Date of Joining",
              IsFilterable: true,
              Width: 0,
              DataType: "date"
            },


          ],
          ShowDataOnLoad: false,
          IsPaginationRequired: false,
          EnableColumnReArrangement: true,
          IsColumnPickerRequired: true,

          //Row Selection
          IsMultiSelectAllowed: true,
          RowSelectionCheckBoxRequired: true,
          RowSelectionType: RowSelectionType.Multiple,

          PinnedRowCount: -1,
          PinnedColumnCount: -1,
          PinRowFromBottom: false,
        },
        SearchConfiguration: {
          SearchElementList: [
            {
              DataSource: {
                EntityType: 0,
                IsCoreEntity: false,
                Name: "client",
                Type: 1
              },
              DefaultValue: "1846",
              DisplayFieldInDataset: "Name",
              FieldName: "@clientId",
              DisplayName: 'Client Name',
              ForeignKeyColumnNameInDataset: "Id",
              InputControlType: InputControlType.AutoFillTextBox,
              IsIncludedInDefaultSearch: true,
              TriggerSearchOnChange: false,
              MultipleValues: null,
              Value: null,
              ReadOnly: true,
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
              IsIncludedInDefaultSearch: true,
              InputControlType: InputControlType.AutoFillTextBox,
              Value: null,
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
              IsIncludedInDefaultSearch: true,
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
            }
          ],
          SearchPanelType: SearchPanelType.Panel,
          SearchButtonRequired: true
        },
        FillWithDataAllowed: false
      },
      SaveExcelDataConfiguration: {
        EntityRelations: {
        },
        UniqueIdentifiers: {},
        UseGeneralApi: false,
        ApiName: '',
        ApiRequestType: ApiRequestType.put,
        UseGeneralSP: false,
        DataSource: {
          Name: "EmploymentDetailsImport",
          Type: DataSourceType.SP,
          IsCoreEntity: false
        },
        DisplayDataGridAfterApiResult: true,
        BeforeUploadGridConfiguration: {
          DataSource: {
            Name: "FillDataForSalaryRevisionImport",
            Type: DataSourceType.SP,
            IsCoreEntity: false,
          },
          ColumnDefinitionList: [
            {
              Id: "EmployeeId",
              FieldName: "EmployeeId",
              DisplayName: "Employee Id",
              IsFilterable: true,
              Width: 0
            },
            {
              Id: "EmployeeName",
              FieldName: "EmployeeName",
              DisplayName: "Employee Name",
              IsFilterable: true,
            },
            {
              Id: "PayTransactionId",
              FieldName: "PayTransactionId",
              DisplayName: "PayTransactionId",
              IsFilterable: true,
            },
            {
              Id: "NetPay",
              FieldName: "NetPay",
              DisplayName: "NetPay",
              IsFilterable: true,
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
          IsMultiSelectAllowed: true,
          RowSelectionCheckBoxRequired: false,
          RowSelectionType: RowSelectionType.Multiple
        },
        ApiResultGridConfiguration: {
          DataSource: {
            Name: '',
            Type: DataSourceType.View,
            IsCoreEntity: false
          },
          ColumnDefinitionList: [
            {
              Id: "EmployeeId",
              FieldName: "EmployeeId",
              DisplayName: "Employee Id",
              IsFilterable: true,
              Width: 0
            },
            {
              Id: "EmployeeName",
              FieldName: "EmployeeName",
              DisplayName: "Employee Name"
            },
            {
              Id: "StatusDisplay",
              FieldName: "StatusDisplay",
              DisplayName: "Status",
              IsFilterable: true,
              Width: 0,

            },
            {
              Id: "Message",
              FieldName: "Message",
              DisplayName: "Error Message",
              IsFilterable: false,
              Width: 0
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
          IsMultiSelectAllowed: true,
          RowSelectionCheckBoxRequired: true,
          RowSelectionType: RowSelectionType.Multiple
        },
        ShowAlertWarningIfFailed: false,
        DataFormat: DataFormat.RawData
      },
      Status: false
    }

    this.defineColumns();



    $('#CanCollapse').on('hidden.bs.collapse', () => {
      // do something...
      // console.log("collapesed");
      if (this.historyAngularGrid !== undefined && this.historyAngularGrid !== null)
        this.historyAngularGrid.resizerService.resizeGrid();

    })
  }

  setGrid(tab: string) {


    let pageLayout: PageLayout = this[tab + "PageLayout"]
    console.log("PageLayout :: ", pageLayout)
    this[tab + "ColumnDefinition"] = this.pageLayoutService.setColumns(pageLayout.GridConfiguration.ColumnDefinitionList);
    this[tab + "GridOptions"] = this.pageLayoutService.setGridOptions(pageLayout.GridConfiguration);


    if (tab == "output") {
      let column = this.outputColumnDefinition.find(x => x.id == 'NetPay');
      column.formatter = this.hyperlinkFormatter;
    }
    else if (tab == "payrun") {
      let column = this.payrunColumnDefinition.find(x => x.id == 'PayRunId');
      column.formatter = this.hyperlinkFormatter;
    }
    else if (tab == 'add') {
      // this.addGridOptions.datasetIdPropertyName = 'id';
    }

  }

  defineColumns() {

    this.columnDefinition =
      this.pageLayoutService.setColumns(this.importLayout.CreateExcelConfiguration.GridConfiguration.ColumnDefinitionList);


    this.gridOptions =
      this.pageLayoutService.setGridOptions(this.importLayout.CreateExcelConfiguration.GridConfiguration);


    console.log(this.columnDefinition);

    this.importColumnDefinition = [

      {
        id: 'EmployeeCode',
        field: "EmployeeCode",
        name: 'Employee Code',
      },
      {
        id: 'EmployeeName',
        field: "EmployeeName",
        name: 'Employee Name',
      },
      {
        id: 'ClientName',
        field: 'ClientName',
        name: 'Client Name',
      },
      {
        id: 'edit',
        field: 'Id',
        name: '',
        width: 10,
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon
      },
      {
        id: 'delete',
        field: 'Id',
        name: '',
        width: 10,
        excludeFromHeaderMenu: true,
        formatter: Formatters.deleteIcon
      }

    ]

    this.importGridOptions = {
      //General
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "id",
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
      // forceFitColumns : true,
      // enableAutoSizeColumns : true,
      enableAutoTooltip: true,
      autoFitColumnsOnFirstLoad: true,

      //Row Selection
      enableCheckboxSelector: true,
      enableRowSelection: true,
    }

    this.apiGridColumnDefinition = [
      {
        id: 'EmployeeId',
        field: "EmployeeId",
        name: 'Employee Code',
      },
      {
        id: 'EmployeeName',
        field: "EmployeeName",
        name: 'Employee Name',
      },
      {
        id: 'ClientName',
        field: 'ClientName',
        name: 'Client Name',
      },
      {
        id: 'Status',
        field: 'StatusMsg',
        name: 'Status'
      },
      {
        id: 'ErrorMsg',
        field: 'ErrorMessage',
        name: 'Error Msg.'
      }
    ]

    this.apiGridGridOptions = {
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

    this.outputColumnDefinition = [
      {
        id: 'EmployeeCode',
        field: "EmployeeCode",
        name: 'Employee Code',
        filterable: true,
        filter: {
          model: new CommaSeparatedStringFilterHandler(),
          params: {
            component: CommaSeparatedStringsFilterComponent,
            angularUtilService: this.angularUtilService
          }
        }
        // CommaSeparatedStringsFilterComponent
      },
      {
        id: 'EmployeeName',
        field: "EmployeeName",
        filterable: true,
        name: 'Employee Name'
      },
      {
        id: 'PayPeriod',
        field: 'PayPeriod',
        name: 'Pay Period',
      },
      {
        id: 'NetPay',
        field: 'NetPay',
        name: 'Net Pay',
        formatter: this.hyperlinkFormatter
      },
      {
        id: 'ProcessingStatus',
        field: 'ProcessingStatus',
        filterable: true,
        name: 'Processing Status'
      },
      {
        id: 'ErrorMessage',
        field: 'ErrorMessage',
        name: 'Error Message'
      },
      {
        id: 'edit',
        field: 'id',
        name: '',
        width: 30,
        formatter: Formatters.editIcon,
        excludeFromHeaderMenu: true,
      }
    ]

    this.outputGridOptions = {
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

    this.payrunColumnDefinition = [
      {
        id: "PayRunId",
        field: "PayRunId",
        name: "Pay Run #",
        formatter: this.hyperlinkFormatter
      },
      {
        id: "ClientName",
        field: "ClientName",
        name: "Client Name"
      },
      {
        id: "ContractCode",
        field: "ContractCode",
        name: "Contract Code"
      },
      {
        id: 'Team',
        field: 'Team',
        name: 'Team Name'
      },
      {
        id: 'PayPeriod',
        field: 'PayPeriod',
        name: 'Pay Period'
      },
      {
        id: 'NumberOfEmpoyees',
        field: 'NumberOfEmpoyees',
        name: 'Empoyee Count'
      }
    ]

    this.payrunGridOptions = {
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
        id: 'NetPay',
        field: 'NetPay',
        name: 'Net Pay',
        formatter: this.hyperlinkFormatter
      },
      {
        id: 'PayPeriod',
        field: 'PayPeriod',
        name: 'PayPeriod',
      },
      {
        id: 'ProcessingStatus',
        field: 'ProcessingStatus',
        filterable: true,
        name: 'Processing Status'
      },
      {
        id: 'ErrorMessage',
        field: 'ErrorMessage',
        name: 'Error Message'
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

    // expense pending table slick grid
    this.expenseColumnDefinition = [
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
        id: 'TotalApprovedAmount',
        field: 'TotalApprovedAmount',
        name: 'Total Amount',
        // formatter : this.hyperlinkFormatter
      },
      {
        id: 'StatusName',
        field: 'StatusName',
        name: 'Status',
      },
      {
        id: 'ProcessStatusId',
        field: 'ProcessStatusId',
        filterable: true,
        name: 'Processing Status'
      },
      {
        id: 'ErrorMessage',
        field: 'ErrorMessage',
        name: 'Error Message'
      },
      {
        id: 'edit',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 30,
        maxWidth: 30,
        onCellClick: (e: Event, args: OnEventArgs) => {
          // FETCH EXPENSE CONFIGURATION 
          this.loadingSreenService.startLoading();
          this.reimbursementService.FetchReimbursementConfigurationByEmployeeId(args.dataContext.EmployeeId)
            .subscribe((expenseConfigObj) => {
              try {
                this.selectAll = false;
                this.rowData = null;
                console.log('EXPENSE CONFIGURATION ::', expenseConfigObj);
                let resultObj: apiResult = expenseConfigObj;
                if (resultObj.Status && resultObj.Result != null) {
                  this.expenseConfiguration = resultObj.Result as any;
                  if (this.expenseConfiguration.ProductConfigurationList != null && this.expenseConfiguration.ProductConfigurationList.length > 0) {
                    this.spinner = false;
                    this.LstCategory = this.expenseConfiguration.ProductConfigurationList;
                    this.rowData = args.dataContext;
                    this.rowData.ExpenseClaimRequestList != null && this.rowData.ExpenseClaimRequestList.length > 0 && this.rowData.ExpenseClaimRequestList.forEach(ee => {
                      ee['ProductName'] = this.LstCategory != null && this.LstCategory.length > 0 && this.LstCategory.find(a => a.ProductId == ee.ProductId) != undefined ? this.LstCategory.find(a => a.ProductId == ee.ProductId).DisplayName : '---';
                      ee['isSelected'] = false;
                    });
                    this.loadingSreenService.stopLoading();
                    this.expenseClaimRequestSlider = true;

                  } else {
                    this.loadingSreenService.stopLoading();
                    this.spinner = false;
                    this.alertService.showWarning('Employee expense product information is not available');
                    return;
                  }
                }
              } catch (Exception) {
                this.loadingSreenService.stopLoading();
                this.alertService.showWarning('Expense Configuration : Something bas has happend ! ' + Exception);
                this.spinner = false;
              }

            }, err => {

            })

        }
      },
    ]

    this.expenseGridOptions = {
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

    if (this.businessType !== 3) {
      this.columnDefinition = this.columnDefinition.filter(x => x.field !== 'ClientName');
      this.importColumnDefinition = this.importColumnDefinition.filter(x => x.field !== 'ClientName');
      this.payrunColumnDefinition = this.payrunColumnDefinition.filter(x => x.field !== 'ClientName' && x.field !== 'ContractCode');
    }

  }
  close_expenseClaimRequestSlider() {

    this.rowData &&  this.rowData.ExpenseClaimRequestList != null && this.rowData.ExpenseClaimRequestList.length > 0 && this.rowData.ExpenseClaimRequestList.forEach(ee => {
      ee.Status = 200;
      ee.ApprovedAmount = 0;

    });

    // this.rowData = null;
    this.expenseClaimRequestSlider = false;
  }

  re_Binding_searchPanel() {
    // console.log('loca', localStorage.getItem("SearchPanel"));

    //if (localStorage.getItem("SearchPanel") != null) {
    this.searchPanel = true;
    //this.pageLayout.SearchConfiguration.SearchElementList = JSON.parse(localStorage.getItem("SearchPanel"));
    //console.log('search items :', JSON.parse(localStorage.getItem("SearchPanel")));
    //this.getDataset();


    this.searchObject = new searchObject();
    var clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() == "@clientid");
    clientList.DropDownList != null && clientList.DropDownList.length > 0 &&
      (this.searchObject.ClientName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() == "@clientcontractid");
    clientList.DropDownList != null && clientList.DropDownList.length > 0 &&
      (this.searchObject.ContractName = clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)) ? clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)).Name : null);

    // clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId");
    // clientList.DropDownList != null &&  clientList.DropDownList.length > 0 && ( this.searchObject.PayPeriodName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name);

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() == "@teamid");
    if (clientList.Value != null && clientList.Value != undefined) {
      let team = clientList.DropDownList.find(z => z.Id === clientList.Value)
      this.searchObject.TeamName = team.Name;
      this.searchObject.PayPeriodName = team.PayPeriod !== undefined && team.PayPeriod !== null ? team.PayPeriod : '';
    }



    console.log('this.searchObject', this.searchObject, this.searchConfiguration.SearchElementList);

    this.activeTabName = 'PendingExpense';
    this.expenseSelectedItems = [];
    this.getExpenseData();

    //}
  }

  bind_SearchIds() {

    console.log('sarc ', this.searchConfigurationProcess.SearchElementList);


    this.searchedClientId = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLocaleLowerCase() == '@clientid').Value;
    this.searchClientContractId = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLocaleLowerCase() == '@clientcontractid').Value;
    this.seacrhedteamId = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLocaleLowerCase() == '@teamid').Value;
    let PayPeriod = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLocaleLowerCase() == '@payperiodid');


    let teamSearchELement = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@teamid')
    if (teamSearchELement.Value !== null && teamSearchELement.DropDownList !== null && teamSearchELement.DropDownList.length > 0) {
      let team = teamSearchELement.DropDownList.find(x => x.Id === teamSearchELement.Value);
      if (team.OpenPayPeriodId !== undefined && team.OpenPayPeriodId !== null) {
        this.teamOpenPayPeriodId = team.OpenPayPeriodId;
      }
    }

  }


  openSearch() {
    this.searchPanel = false;
  }

  isCloseContent(event) {
    // if (localStorage.getItem("SearchPanel") == null) {
    //   this.searchObject = undefined;
    //   this.searchObject = _searchObject;
    // }
    console.log("closed")
    this.searchPanel = true;
  }

  onClickingSearchButton() {

    if (this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@teamid').Value === undefined
      || this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@teamid').Value === null) {
      this.alertService.showWarning("Please choose team to proceed !");
      return;
    }

    console.log('clicked');

    try {
      this.re_Binding_searchPanel();
    } catch (error) {
      console.log('error', error);

    }

    this.bind_SearchIds();

    // this.searchedPayperiodId = PayPeriod.Value;
    // if(PayPeriod.DropDownList != undefined && PayPeriod.DropDownList != null && PayPeriod.DropDownList.length > 0){
    //   this.searchedPayPeriodName = PayPeriod.DropDownList.find(x => x.Id == this.searchedPayperiodId).PayCyclePeriodName;

    // }

    this.importDataset = [];
    this.outputDataset = [];
    this.payrunDataset = [];
    this.getDatasetBasedOnActiveTab();

    this.fillHistorySearchElements();

    this.searchPanel = true;

  }

  onClickingHistorySearchButton() {
    $('#CanCollapse').collapse('hide');
    this.getHistoryDataset();
  }




  onClickingAddFromChooseEmployee() {

    if (this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0) {
      this.alertService.showInfo("Please choose an employee");
      return;
    }

    if (this.selectedItems.length > 1) {
      this.alertService.showInfo("Please cho0se only 1 employee");
      return;
    }

    this.isAdd = true;
    this.isProcess = false;
    this.slider = true;
    this.isChanged = false;
    this.employeeCode = this.selectedItems[0].EmployeeCode;
    this.onConfirmingEmployeeCode();
    $('#Download_Template').modal('hide');
  }

  add() {
    this.isAdd = true;
    this.isProcess = false;
    this.slider = true;
    this.isChanged = false;
  }

  edit(data: any) {
    this.isProcess = false;
    this.isAdd = false;
    this.addRowRecord = data;
    this.slider = true;
    this.isChanged = false;
  }

  onConfirmingEmployeeCode() {
    let resultData: any;

    if (!this.isProcess) {
      for (let row of this.importDataset) {
        if (row.EmployeeCode == this.employeeCode) {
          this.edit(row);
          return;
        }
      }
    }


    this.loadingSreenService.startLoading();
    this.getReimbursementDetails(this.employeeCode).subscribe(data => {
      this.slider = true;
      this.loadingSreenService.stopLoading();
      console.log(data);
      console.log('sss', this.searchedClientId);
      if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        resultData = JSON.parse(data.dynamicObject);
        console.log(resultData);



        if (resultData.ClientId != this.searchedClientId) {
          this.alertService.showInfo("Employee Doesn't Belong to the searched client!");
          this.close_slider();
          return;
        }
        else if (resultData.ClientId == this.searchedClientId && resultData.ClientContractId != this.searchClientContractId) {
          this.alertService.showInfo("Employee Doesn't Belong to the searched client contract!");
          this.close_slider();
          return;
        }
        else if (resultData.ClientId == this.searchedClientId &&
          resultData.ClientContractId == this.searchClientContractId
          && resultData.TeamId != this.seacrhedteamId) {
          this.alertService.showInfo("Employee Doesn't Belong to the searched team!");
          this.close_slider();
          return
            ;
        }

        if (resultData.ReimbursementConfiguration != undefined && resultData.ReimbursementConfiguration != null &&
          resultData.ReimbursementConfiguration.ProductConfigurationList != null &&
          resultData.ReimbursementConfiguration.ProductConfigurationList.length > 0) {
          this.reimbursementProducts = resultData.ReimbursementConfiguration.ProductConfigurationList;
          this.addRowRecord = resultData;
          this.checkForOldTimeCard(this.addRowRecord);
        }
        else {
          resultData.ReimbursementConfiguration = new ReimbursementConfiguration();
          resultData.ReimbursementConfiguration.ProductConfigurationList = [];
          this.reimbursementProducts = [];

          this.addRowRecord = null;
          this.alertService.showWarning("Reimbursement Configuration for the given employee not found! Please contract support!")
        }

      }
      else {
        this.alertService.showWarning("No data exist , please check the employee code");

      }
    }, error => {
      this.loadingSreenService.stopLoading();
      this.alertService.showWarning("Something went wrong!")
      console.error(error);
    })


  }

  checkForOldTimeCard(data: any) {
    let timeCardsList: TimeCard[] = data.TimeCards;
    let oldTimeCard: TimeCard = null;

    if (timeCardsList != undefined && timeCardsList != null) {
      oldTimeCard = timeCardsList.find(x => (x.Status < 2300 || x.Status == 2349) && x.Status != 401);
    }

    let newTimeCard: TimeCard;

    if (oldTimeCard != null) {
      newTimeCard = _.cloneDeep(oldTimeCard);

      if (newTimeCard.ExpenseList != undefined && newTimeCard.ExpenseList != null && newTimeCard.ExpenseList.length > 0) {
        for (let expense of newTimeCard.ExpenseList) {
          let product = data.ReimbursementConfiguration.ProductConfigurationList.find(x => x.ProductId == expense.ProductId);
          if (product != null) {
            product.PayableAmount = expense.PayUnitValue;
            product.BillingAmount = expense.BillUnitValue;
          }
          else {
            expense.Modetype = UIMode.Delete;
          }
        }

      }

    }
    else {
      newTimeCard = new TimeCard();

      newTimeCard.Id = 0;
      newTimeCard.CompanyId = data.CompanyId;
      newTimeCard.ClientId = data.ClientId;
      newTimeCard.ClientContractId = data.ClientContractId;
      newTimeCard.TeamId = data.TeamId;
      newTimeCard.EmployeeId = data.Id;
      newTimeCard.PersonId = data.PersonId;
      newTimeCard.EmployeeName = data.EmployeeName;


      newTimeCard.PayCycleId = data.PayCycleId;
      newTimeCard.PayPeriodId = data.TeamOpenPayPeriodId;
      newTimeCard.PeriodStartDate = data.PeriodStartDate;
      newTimeCard.PeriodEndDate = data.PeriodEndDate;
      newTimeCard.ProcessPeriodId = data.PayPeriodId;
      newTimeCard.ProcessCategory = ProcessCategory.Expense;

      newTimeCard.Status = 1000;
      newTimeCard.IsTaxBasedOnProof = true;
      newTimeCard.IsNewJoiner = false;
      newTimeCard.IsSalaryRevised = false;
      newTimeCard.FinancialYearId = data.FinancialYearId;
      newTimeCard.PayGroupId = data.PayGroupId;
      newTimeCard.EmploymentContractId = data.EmploymentContractId;
      newTimeCard.CostCode = data.CostCode || 0;

      newTimeCard.ExpenseList = [];
    }

    data.oldTimeCard = oldTimeCard;
    data.newTimeCard = newTimeCard;
  }

  editTimeCard(rowData: any) {
    let resultData: any;


    this.loadingSreenService.startLoading();
    this.getReimbursementDetails(this.employeeCode).subscribe(data => {
      this.slider = true;
      this.loadingSreenService.stopLoading();
      console.log(data);
      if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        resultData = JSON.parse(data.dynamicObject);
        console.log(resultData);

        if (resultData.ClientId != this.searchedClientId) {
          this.alertService.showInfo("Employee Doesn't Belong to the searched client!");
          this.close_slider();
          return;
        }
        else if (resultData.ClientId == this.searchedClientId && resultData.ClientContractId != this.searchClientContractId) {
          this.alertService.showInfo("Employee Doesn't Belong to the searched client contract!");
          this.close_slider();
          return;
        }
        else if (resultData.ClientId == this.searchedClientId &&
          resultData.ClientContractId == this.searchClientContractId
          && resultData.TeamId != this.seacrhedteamId) {
          this.alertService.showInfo("Employee Doesn't Belong to the searched team!");
          this.close_slider();
          return
            ;
        }

        if (resultData.ReimbursementConfiguration != undefined && resultData.ReimbursementConfiguration != null &&
          resultData.ReimbursementConfiguration.ProductConfigurationList != null &&
          resultData.ReimbursementConfiguration.ProductConfigurationList.length > 0) {
          this.reimbursementProducts = resultData.ReimbursementConfiguration.ProductConfigurationList;
          this.addRowRecord = resultData;
          this.putEditTimeCardInProductConfiguration(this.addRowRecord, rowData["TimeCardId"]);
        }
        else {
          resultData.ReimbursementConfiguration = new ReimbursementConfiguration();
          resultData.ReimbursementConfiguration.ProductConfigurationList = [];
          this.reimbursementProducts = [];

          this.addRowRecord = null;
          this.alertService.showWarning("Reimbursement Configuration for the given employee not found! Please contract support!")
        }

      }
      else {
        this.alertService.showWarning("No data exist , please check the employee code");

      }
    }, error => {
      this.loadingSreenService.stopLoading();
      this.alertService.showWarning("Something went wrong!")
      console.error(error);
    })


  }

  putEditTimeCardInProductConfiguration(data: any, timeCardId: number) {
    let timeCardsList: TimeCard[] = data.TimeCards;
    let oldTimeCard: TimeCard = null;

    if (timeCardsList != undefined && timeCardsList != null) {
      oldTimeCard = timeCardsList.find(x => x.Id == timeCardId);
    }

    let newTimeCard: TimeCard;

    if (oldTimeCard != null) {
      newTimeCard = _.cloneDeep(oldTimeCard);

      if (newTimeCard.ExpenseList != undefined && newTimeCard.ExpenseList != null && newTimeCard.ExpenseList.length > 0) {
        for (let expense of newTimeCard.ExpenseList) {
          let product = data.ReimbursementConfiguration.ProductConfigurationList.find(x => x.ProductId == expense.ProductId);
          if (product != null) {
            product.PayableAmount = expense.PayUnitValue;
            product.BillingAmount = expense.BillUnitValue;
          }
          else {
            expense.Modetype = UIMode.Delete;
          }
        }

      }

    }
    else {
      this.alertService.showWarning("Could not find the timecard");
      return;
    }

    data.oldTimeCard = oldTimeCard;
    data.newTimeCard = newTimeCard;
  }

  getReimbursementDetails(employeeCode: string) {

    let resultData: any;

    let dataSource: DataSource = {
      Name: "GetReimbursementDetailsUsingEmployeeCode",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [
      {
        FieldName: '@employeeCode',
        Value: employeeCode
      },
    ]

    return this.pageLayoutService.getDataset(dataSource, searchElements);

    // .subscribe( data => {
    //   console.log(data);
    //   if(data.Status && data.dynamicObject != null && data.dynamicObject != '') {
    //     resultData = JSON.parse(data.dynamicObject);
    //     if(resultData.ReimbursementConfiguration != undefined && resultData.ReimbursementConfiguration!= null ){
    //       this.reimbursementProducts = resultData.ReimbursementConfiguration.ProductConfigurationList
    //     }
    //     else{
    //       resultData.ReimbursementConfiguration = new ReimbursementConfiguration();
    //       resultData.ReimbursementConfiguration.ProductConfigurationList = [];
    //       this.reimbursementProducts = [];

    //     }
    //     console.log(resultData);
    //     return resultData;
    //   }
    //   else{
    //     this.alertService.showWarning("No data exist , please check the employee code");
    //     return null;
    //   }
    // } , error => {
    //   this.alertService.showWarning("Something went wrong!")
    //   console.error(error);
    //   return null;
    // })

  }

  onPayableAmountChange(event, item) {
    console.log("Payable amount changed");
    this.isChanged = true;
    if (item.AllowToInputBillableAmount) {
      if (item.BillingAmount == undefined || item.BillingAmount == null || item.BillingAmount == 0) {
        console.log("Changing Billing amount");
        item.BillingAmount = item.PayableAmount;
      }

    }
  }

  onBillingAmountChange($event, item) {
    this.isChanged = true;

    if (item.BillingAmount <= 0) {
      if (!item.AllowNegativeValue) {
        this.alertService.showWarning("Connot enter 0 or negative value!");
        item.BillingAmount = item.PayableAmount;
      }
    }

  }

  save() {
    this.isChanged = false;

    console.log("Add , Process ::" + this.isAdd + " " + this.isProcess);

    if (this.isAdd) {

      let id = this.importDataset == undefined || this.importDataset == null || this.importDataset.length <= 0 ? 0 : this.importDataset.length;
      this.addRowRecord.id = id;

      this.updateNewTimeCard(this.addRowRecord);


      if (this.importDataset == undefined || this.importDataset == null) {
        this.importDataset = [];
        this.importDataset.push(this.addRowRecord)
      }
      else {
        this.importAngularGrid.gridService.addItem(this.addRowRecord, { highlightRow: false });
      }



      // this.importDataset.push(this.addRowRecord);
      console.log("adding item", this.addRowRecord);

      console.log("Import Dataset", this.importDataset)
      this.addRowRecord = null;
      this.slider = false;

    }
    else {
      if (this.isProcess) {
        this.updateNewTimeCard(this.addRowRecord);

        let timeCardModels: TimeCardModel[] = [
          {
            NewDetails: this.addRowRecord.newTimeCard,
            OldDetails: this.addRowRecord.oldTimeCard,
            Id: 0,
            customObject1: null,
            customObject2: null
          }
        ]

        this.processTimeCard(timeCardModels);
      }
      else {
        this.updateNewTimeCard(this.addRowRecord);
        this.addRowRecord = null;
        this.slider = false;
      }
    }






  }

  updateNewTimeCard(data: any) {
    let oldTimeCard: TimeCard = data.oldTimeCard;
    let newTimeCard: TimeCard = data.newTimeCard;
    let expenseList: Expense[] = newTimeCard.ExpenseList;

    for (let product of data.ReimbursementConfiguration.ProductConfigurationList) {

      let expense: Expense = expenseList.find(x => x.ProductId == product.ProductId);



      if (expense != undefined && expense != null) {
        if (product.PayableAmount != undefined && product.PayableAmount != null && product.PayableAmount != 0) {
          console.log("Updating Expense ::", expense);
          expense.PayUnitValue = product.PayableAmount;
          if (product.AllowToInputBillableAmount) {
            expense.BillUnitValue = product.BillingAmount !== undefined && product.BillingAmount != null ? product.BillingAmount : product.PayableAmount;
          }
          else {
            expense.BillUnitValue = product.PayableAmount;
          }
          expense.Modetype = UIMode.Edit;
        }
        else {

          if (expense.Id > 0) {
            console.log("Deleting Expense ::", expense);
            expense.Modetype = UIMode.Delete;
          }
          else {
            console.log("Filtering Expense ::", expense);
            expenseList = expenseList.filter(x => x.ProductId != product.ProductId);
          }
        }

      }
      else {
        if (product.PayableAmount != null && product.PayableAmount != 0) {
          let newExpense = new Expense();

          newExpense.Id = 0;
          newExpense.DisplayName = product.DisplayName;
          newExpense.Type = ExpenseType.None;
          newExpense.ProductId = product.ProductId;
          newExpense.Status = ExpenseStatus.Active;

          newExpense.PayQuantity = 1;
          newExpense.PayUnitType = PayUnitType.Amount;
          newExpense.PayUnitValue = product.PayableAmount;

          newExpense.BillQuantity = 1;
          newExpense.BillUnitType = BillUnitType.Amount;
          if (product.AllowToInputBillableAmount) {
            newExpense.BillUnitValue = product.BillingAmount !== undefined && product.BillingAmount != null ?
              product.BillingAmount : product.PayableAmount;
          }
          else {
            newExpense.BillUnitValue = product.PayableAmount;
          }

          newExpense.Modetype = UIMode.Edit;

          console.log("Adding expense", newExpense);

          expenseList.push(newExpense);
        }
      }



    }

    console.log("Final Expense List ::", expenseList);
    newTimeCard.ExpenseList = expenseList;
  }

  processTimeCard(timeCardModels: TimeCardModel[]) {
    let newTimeCardList = [];

    for (let timecard of timeCardModels) {
      newTimeCardList.push(timecard.NewDetails);
    }

    console.log("TimecardMOdel ::", timeCardModels)
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
      type: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {
        this.loadingSreenService.startLoading();
        this.reimbursementService.upsertTimeCards(newTimeCardList).subscribe(data => {
          this.loadingSreenService.stopLoading();
          console.log(data);
          this.addRowRecord = null;
          this.isProcess = false;
          this.slider = false;
        }, error => {
          this.loadingSreenService.stopLoading();
          this.addRowRecord = null;
          this.isProcess = false;
          this.slider = false;
          this.alertService.showWarning("Something went wrong! Try Again!");
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


  onClickingDownloadTemplateButton() {
    $('#Download_Template').modal('show');

    this.spinner = true;
    this.getDataset();
  }

  onUploadButtonClicked() {
    console.log("clicked");
    this.file = null;
    this.inputFile.nativeElement.files = null;
    this.inputFile.nativeElement.value = '';
  }

  handleFileInput(files: FileList) {


    this.file = files.item(0);
    //console.log(this.file);

    let data: any[]

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      data = this.importLayoutService.getEntityMappedDataFromExcel(e);
      console.log("Excel Data :: ", data);

      // if(this.importDataset == undefined || this.importDataset == null){
      //   this.importDataset = [];
      // }

      let resultData: any;
      let tempDataset = [];

      let employeeCodes: any[] = [];
      for (let i = 0; i < data.length; ++i) {
        let employeeCode = {
          "EmployeeCode": data[i]["Reimbursement"]["EmployeeCode"]
        }
        employeeCodes.push(employeeCode);
      }

      let datasource: DataSource = {
        Name: 'GetReimbursementDetailsUsingEmployeeCodes',
        Type: DataSourceType.SP,
        IsCoreEntity: false
      }

      // let searchElementsForBulk : SearchElement[] = _.cloneDeep(this.searchConfiguration.SearchElementList);

      // searchElementsForBulk = searchElementsForBulk.concat( [
      //   {
      //     FieldName : '@employeeCodes',
      //     Value : JSON.stringify(employeeCodes)
      //   },
      //   {
      //     FieldName : '@companyId',
      //     Value : this.companyId
      //   }
      // ])

      let searchElementsForBulk: SearchElement[] = [
        {
          FieldName: '@clientId',
          Value: null,
          DefaultValue: 0
        },
        {
          FieldName: '@clientContractId',
          Value: null,
          DefaultValue: 0
        },
        {
          FieldName: '@teamId',
          Value: null,
          DefaultValue: 0
        }
        ,
        {
          FieldName: '@employeeCodes',
          Value: JSON.stringify(employeeCodes),
          DefaultValue: "[]"
        },
        {
          FieldName: '@companyId',
          Value: this.companyId,
          DefaultValue: 0
        },
        {
          FieldName: '@payperiodId',
          Value: 0,
          DefaultValue: 0
        }
      ]

      this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList, searchElementsForBulk);

      //Get Data for all the rows from database
      this.loadingSreenService.startLoading();
      this.pageLayoutService.getDataset(datasource, searchElementsForBulk).subscribe(result => { // ! Change to get client level configuration
        this.loadingSreenService.stopLoading();
        console.log("Reimbursement Details ::", result);
        if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
          resultData = JSON.parse(result.dynamicObject);
          console.log(resultData);
          if (resultData[0].ReimbursementConfiguration != undefined && resultData[0].ReimbursementConfiguration != null) {
            this.reimbursementProducts = resultData[0].ReimbursementConfiguration.ProductConfigurationList;
            this.reimbursementConfiguration = resultData[0].ReimbursementConfiguration;
          }
          else {
            resultData[0].ReimbursementConfiguration = new ReimbursementConfiguration();
            resultData[0].ReimbursementConfiguration.ProductConfigurationList = [];
            this.reimbursementProducts = [];

          }

          console.log("Reimbursement Products ::", this.reimbursementProducts);

          let id = this.importDataset == undefined || this.importDataset == null || this.importDataset.length <= 0 ? 0 : this.importDataset.length;
          let oldRowCount = 0;

          for (let i = 0; i < data.length; ++i) {
            let reimbursement = data[i]["Reimbursement"];

            let oldrowRecord = this.importDataset.find(x => x["EmployeeCode"] == reimbursement["EmployeeCode"])

            if (oldrowRecord != null) {
              let keys = Object.keys(reimbursement);

              let productlist = oldrowRecord["ReimbursementConfiguration"]["ProductConfigurationList"];
              for (let product of productlist) {
                let key = keys.find(x => x == product.DisplayName)
                if (key != null) {
                  product.PayableAmount = reimbursement[key];
                  if (product.AllowToInputBillableAmount) {
                    product.BillingAmount = reimbursement[key];
                  }
                }
                else {
                  product.PayableAmount = null;
                  product.BillingAmount = null;
                }
              }

              this.updateNewTimeCard(oldrowRecord);
              ++oldRowCount;

              continue;

              // for(let key of keys){

              //   let product = oldrowRecord["ReimbursementConfiguration"]["ProductConfigurationList"].find(x => x.DisplayName == key);
              //   if(product != null){
              //     product.PayableAmount = reimbursement[key];
              //     product.BillingAmount = 0;
              //   }

              // }
            }

            let rowRecord = resultData.find(x => x["EmployeeCode"] == reimbursement["EmployeeCode"])

            console.log("Row Record ::", rowRecord);
            if (rowRecord == null) {
              continue;
            }

            reimbursement["Id"] = reimbursement["EmployeeId"];

            reimbursement.id = id + i - oldRowCount;
            rowRecord.id = id + i - oldRowCount;

            this.checkForOldTimeCard(rowRecord);

            let keys = Object.keys(reimbursement);
            for (let key of keys) {
              let product = rowRecord["ReimbursementConfiguration"]["ProductConfigurationList"].find(x => x.DisplayName == key);
              if (product != null) {
                product.PayableAmount = reimbursement[key];
                if (product.AllowToInputBillableAmount) {
                  product.BillingAmount = reimbursement[key];
                }
              }
            }
            this.updateNewTimeCard(rowRecord);

            tempDataset.push(rowRecord);

          }

          console.log(tempDataset);
          if (this.importDataset == undefined || this.importDataset == null || this.importDataset.length <= 0) {
            this.importDataset = tempDataset;
          }
          else {
            tempDataset = tempDataset.concat(this.importDataset);
            this.importDataset = tempDataset;
          }

          console.log(this.importDataset);

          this.utilityService.ensureIdUniqueness(this.importDataset).then((result) => {
            result == true ? this.isImportDuplicateEntry = true : this.isImportDuplicateEntry = false;
          }, err => {

          })

        }
        else {
          this.alertService.showWarning("No data exist , please check the employee code in the excel");

        }
      }, error => {
        this.loadingSreenService.stopLoading();
        this.alertService.showWarning("Something went wrong!");
        console.error(error);
      });



    }

    reader.readAsBinaryString(this.file);

  }

  onClickingProcessButton() {
    let timeCard: TimeCard;
    let newTimeCardList = [];
    let timeCardModels: TimeCardModel[] = [];
    this.resultList = [];

    if (this.importDataset == undefined || this.importDataset == null || this.importDataset.length <= 0) {
      this.alertService.showWarning("Please add/import employee to process!");
      return;
    }
    for (let row of this.importDataset) {
      let pushToTimeCardList: boolean = false;

      for (let product of row.ReimbursementConfiguration.ProductConfigurationList) {
        if (product.PayableAmount != undefined && product.PayableAmount != null && product.PayableAmount != 0) {
          pushToTimeCardList = true;
        }
      }
      if (pushToTimeCardList) {
        let timeCardModel: TimeCardModel = new TimeCardModel();
        timeCardModel.NewDetails = row.newTimeCard;
        timeCardModel.OldDetails = row.oldTimeCard;
        timeCardModels.push(timeCardModel);
        newTimeCardList.push(row.newTimeCard);
      }
      else {
        let result: any = {
          EmployeeId: row.Id,
          EmployeeName: row.EmployeeName,
          Status: false,
          ErrorMessage: "No Amount was specified for any reimbursement product",
        }
        this.resultList.push(result);
      }

    }
    console.log("TimeCard list :: ", timeCardModels);

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
      type: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {
        this.loadingSreenService.startLoading();
        this.reimbursementService.upsertTimeCards(newTimeCardList).subscribe(data => {
          console.log(data);
          this.loadingSreenService.stopLoading();
          if (data.Status) {
            this.alertService.showSuccess("Success");
            // this.importDataset = [];

            // for (let row of data.dynamicObject) {

            //   row.TimeCard = JSON.parse(row.TimeCard);
            //   row.EmployeeId = row.TimeCard.EmployeeId;
            //   row.EmployeeName = row.TimeCard.EmployeeName;
            //   // if(row.Status){
            //   //   row.StatusMsg = "Success";
            //   // }
            //   // else{
            //   //   row.StatusMsg = "Failed";
            //   // }
            // }


            // this.resultList = this.resultList.concat(data.dynamicObject);
            // console.log("result list ::", this.resultList);

            if (this.resultList != undefined && this.resultList != null && this.resultList.length > 0) {
              this.importDataset = this.importDataset.filter(x => {
                let result = this.resultList.find(y => (y.EmployeeId == x.Id && y.Status == false));
                console.log("Result ::", result);
                return result !== undefined && result !== null;
              })
              console.log("import Dataset ::", this.importDataset);
              $('#popup_displayResult').modal('show');

            }
            else {
              this.importDataset = [];
            }
            // this.apiGridDataset = data.dynamicObject;
          }
          else {
            this.alertService.showWarning(data.Message);
          }
        }, error => {
          this.loadingSreenService.stopLoading();
          this.alertService.showWarning("Something went wrong! Try Again!");
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

  getDatasetBasedOnActiveTab() {
    if (this.activeTabName == 'Process') {


      if (this.processActiveTabName == 'PAYINPUTS' && this.outputPageLayout !== undefined && this.outputPageLayout !== null) {
        this.getProcessedOutputDataset();
      }
      else {
        this.getPayrunDataset();
      }

    }
  }


  getDataset() {
    this.spinner = true;
    let datasource: DataSource = {
      Name: "GetCompleteEmployeeUIList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }
    let searchElementsForEmployee: SearchElement[] = [
      {
        FieldName: '@clientId',
        Value: null,
        DefaultValue: 0
      },
      {
        FieldName: '@clientcontractId',
        Value: null,
        DefaultValue: 0
      },
      {
        FieldName: '@teamId',
        Value: null,
        DefaultValue: 0
      }
    ]
      ;

    this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList, searchElementsForEmployee)

    this.pageLayoutService.getDataset(datasource,
      searchElementsForEmployee).subscribe(data => {
        this.spinner = false;
        console.log(data);
        if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
          this.dataset = JSON.parse(data.dynamicObject);
          this.utilityService.ensureIdUniqueness(this.dataset).then((result) => {
            result == true ? this.isNormalDSDuplicateEntry = true : this.isNormalDSDuplicateEntry = false;
          }, err => {

          })
        }
        else {
          this.alertService.showWarning("No Active Employees for the choosen client exist");
          this.dataset = null;
        }
      }, error => {
        this.alertService.showWarning("Error Occured while fetching Records");
        console.error(error);
      })
  }

  getProcessedOutputDataset() {

    this.outputDataset = [];

    let datasource: DataSource = {
      Name: 'UI_TimeCard_List',
      Type: DataSourceType.SP,
      IsCoreEntity: false,
    }

    let searchElementsForOutputDataset = _.cloneDeep(this.searchConfigurationProcess.SearchElementList);
    // searchElementsForOutputDataset.push({
    //   FieldName : "@PVRId" , 
    //   Value  : 0 , 
    //   SendElementToGridDataSource : false ,
    //   IsIncludedInDefaultSearch : false,
    //   DropDownList : []
    // });

    searchElementsForOutputDataset.push({
      FieldName: "@processCategory",
      Value: 3,
      SendElementToGridDataSource: false,
      IsIncludedInDefaultSearch: false,
      DropDownList: []
    });

    console.log("Search Elements before API ::", searchElementsForOutputDataset);

    this.outputDataset = [];
    this.spinner = true;
    this.pageLayoutService.getDataset(this.outputPageLayout.GridConfiguration.DataSource, this.searchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.outputDataset = JSON.parse(dataset.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.outputDataset).then((result) => {
          result == true ? this.isOutputDuplicateEntry = true : this.isOutputDuplicateEntry = false;
        }, err => {

        })
        console.log(dataset);
        //this.updateFilters();
      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }

  getPayrunDataset() {
    this.spinner = true;
    this.payrunDataset = [];

    let datasource: DataSource = {
      Name: "GET_PAYROLL_PAYRUNLIST",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElementsForPayrunDataset = _.cloneDeep(this.searchConfigurationProcess.SearchElementList);

    // searchElementsForPayrunDataset.push({
    //   FieldName : "@processCategory" , 
    //   Value  : 3 , 
    //   SendElementToGridDataSource : false ,
    //   IsIncludedInDefaultSearch : false,
    //   DropDownList : []
    // });

    searchElementsForPayrunDataset.find(x => x.FieldName.toLowerCase() === '@payperiodid').Value = this.teamOpenPayPeriodId;

    this.pageLayoutService.getDataset(datasource, searchElementsForPayrunDataset).subscribe(data => {
      this.spinner = false;
      console.log(data);
      if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        this.payrunDataset = JSON.parse(data.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.payrunDataset).then((result) => {
          result == true ? this.isPayRunDuplicateEntry = true : this.isPayRunDuplicateEntry = false;
        }, err => {

        })
      }
      else {
        // this.alertService.showWarning("No Payrun for the choosen client exist");
        this.payrunDataset = null;
      }
    }, error => {
      this.alertService.showWarning("Error Occured while fetching Records");
      console.error(error);
    })
  }

  getHistoryDataset() {
    this.spinner = true;
    this.historyDataset = [];

    let datasource: DataSource = {
      Name: "GetHistoryTimeCardUIList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElementsForHistoryDataset = _.cloneDeep(this.searchConfigurationForHistroy.SearchElementList);

    this.pageLayoutService.getDataset(datasource, searchElementsForHistoryDataset).subscribe(data => {
      this.spinner = false;
      console.log(data);
      if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        this.historyDataset = JSON.parse(data.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.historyDataset).then((result) => {
          result == true ? this.isHistoryDuplicateEntry = true : this.isHistoryDuplicateEntry = false;
        }, err => {

        })
      }
      else {
        this.historyDataset = [];
      }
    }, error => {
      this.alertService.showWarning("Error Occured while fetching Records");
      console.error(error);
    })
  }

  getExpenseData() {
    this.spinner = true;
    this.expenseDataset = [];

    let datasource: DataSource = {
      Name: "GetApprovedExpenseBatchList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }


    if (this.searchConfigurationForexpense.SearchElementList.find(item => item.FieldName == '@userId') != undefined) {
      this.searchConfigurationForexpense.SearchElementList.find(item => item.FieldName == '@userId').Value = this.userId
    }
    if (this.searchConfigurationForexpense.SearchElementList.find(item => item.FieldName == '@roleCode') != undefined) {
      this.searchConfigurationForexpense.SearchElementList.find(item => item.FieldName == '@roleCode').Value = this.roleCode
    }

    this.pageLayoutService.getDataset(datasource, this.searchConfigurationForexpense.SearchElementList).subscribe(data => {
      this.spinner = false;
      console.log(data);
      if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        var dynoData = [];
        dynoData = JSON.parse(data.dynamicObject);
        console.log('dynoData', dynoData);
        console.log('this.searchedClientId', this.searchedClientId);

        dynoData != null && dynoData.length > 0 ? this.expenseDataset = dynoData.filter(a => a.ClientId == (this.businessType == 3 ? this.searchedClientId : this.clientIdSME) && a.ClientContractId == (this.businessType == 3 ? this.searchClientContractId : this.clientcontractIdSME) && a.TeamId == this.seacrhedteamId) : true
        console.log('data', this.expenseDataset);

        // this.utilityService.ensureIdUniqueness(this.historyDataset).then((result) => {
        //   result == true ? this.isHistoryDuplicateEntry = true : this.isHistoryDuplicateEntry = false;
        // }, err => {

        // })
      }
      else {
        this.expenseDataset = [];
      }
    }, error => {
      this.alertService.showWarning("Error Occured while fetching Records");
      console.error(error);
    })
  }

  onClickCreatePayoutBatch() {

    if (this.expenseSelectedItems.length == 0) {
      this.alertService.showWarning("Please select at least one record and try again");
      return;
    }
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to Process it`, "Yes, Confirm", "No, Cancel").then((result) => {
      this.loadingSreenService.startLoading();
      var expenseClaimRequests = [];

      this.expenseSelectedItems.forEach(e => {
        if (e.ExpenseClaimRequestList !== undefined && e.ExpenseClaimRequestList !== null) {
          expenseClaimRequests = expenseClaimRequests.concat(e.ExpenseClaimRequestList)
        }
      });

      expenseClaimRequests.length > 0 && expenseClaimRequests.forEach(e1 => {
        e1.ApprovedLevel = (Number(e1.ApprovedLevel) + 1);
      });

      let payload = JSON.stringify({"ExpenseList": expenseClaimRequests, "IsMergeRequired": false });
      console.log('Create Exp Payload::', payload)

      this.reimbursementService.CreateExpensePayoutBatch(payload)
        .subscribe((expenseBatchReqgObj) => {
          try {
            console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
            let resultObj: apiResult = expenseBatchReqgObj;
            if (resultObj.Status && resultObj.Result != null) {
              this.loadingSreenService.stopLoading();
              this.alertService.showSuccess(resultObj.Message);
              this.alertService.showSuccess('Please click transaction tab for processing');
              this.getExpenseData();

            }
            else {
              this.loadingSreenService.stopLoading();
              this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
            }
          } catch (Exception) {
            this.loadingSreenService.stopLoading();
            this.alertService.showWarning('Expense Batch Request : Something bad has happend ! ' + Exception);
          }

        }, err => {
          this.loadingSreenService.stopLoading();
          this.alertService.showWarning('Expense Batch Request : Something bad has happend ! ' + err);

        })
    }).catch(error => {

    });
  }

  /* #region  COMMON APPROVE AND REJECT BUTTON ACTION */

  onClickRejectClaimRequest() {

    if (this.expenseSelectedItems.length == 0) {
      this.alertService.showWarning("Please select at least one record and try again");
      return;
    }


    let actionName = "Reject";
    var confirmationMsg = 'Confirmation';
    let claimRequests = [];

    let totalNoOfRequests: number = 0;
    let totalRequestedAmount: number = 0;
    let totalApprovedAmount: number = 0;



    this.expenseSelectedItems.forEach(batch => {

      totalNoOfRequests = totalNoOfRequests + batch.ExpenseClaimRequestList.length;

      batch.ExpenseClaimRequestList.forEach(claimRequest => {

        claimRequest.Status = ExpenseClaimRequestStatus.Rejected;
        claimRequest.ModeType = UIMode.Edit;
        claimRequest.ApprovedAmount = 0;

        totalRequestedAmount = totalRequestedAmount + claimRequest.RequestedAmount;
        totalApprovedAmount = totalApprovedAmount + claimRequest.ApprovedAmount;
      })

      claimRequests = claimRequests.concat(batch.ExpenseClaimRequestList);

    })

    console.log("Selected list ::", this.expenseSelectedItems);
    console.log("Claim requests ::", claimRequests);

    // var subText = whichaction == true ? `No of Claims ${totalNoOfRequests} and Total Requested Amount : ${this.inEmployeesInitiateSelectedItems[0].TotalRequestedAmount} , Total Approved Amount : ${this.inEmployeesInitiateSelectedItems[0].TotalRequestedAmount}` : `Are you sure you want to ${actionName}?`;
    var subText = `Are you sure you want to ${actionName}?`;
    this.alertService.confirmSwal1(confirmationMsg, subText, "Yes, Confirm", "No, Cancel").then((result) => {

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
          this.loadingSreenService.startLoading();

          var role = new UserHierarchyRole();
          role.IsCompanyHierarchy = false;
          role.RoleCode = this.Role.Code;
          role.RoleId = this.Role.Id;

          var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
          submitExpenseClaimRequestModel.ExpenseClaimRequestList = claimRequests;
          submitExpenseClaimRequestModel.ModuleProcessAction = 41;
          submitExpenseClaimRequestModel.Role = role;
          submitExpenseClaimRequestModel.ActionProcessingStatus = 30200;
          submitExpenseClaimRequestModel.Remarks = jsonStr;
          submitExpenseClaimRequestModel.ClientId = this.expenseSelectedItems[0].ClientId;
          submitExpenseClaimRequestModel.ClientContractId = this.expenseSelectedItems[0].ClientContractId;
          submitExpenseClaimRequestModel.CompanyId = this.expenseSelectedItems[0].CompanyId;
          console.log('Reject Data ::: ', submitExpenseClaimRequestModel);
          // this.loadingScreenService.stopLoading();

          // return;
          this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
            .subscribe((expenseClaimReqgObj) => {
              try {
                console.log('RJECTED EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
                let resultObj: apiResult = expenseClaimReqgObj;
                if (resultObj.Status && resultObj.Result != null) {
                  this.loadingSreenService.stopLoading();
                  this.alertService.showSuccess(resultObj.Message);
                  this.getExpenseData();
                }
                else {
                  this.loadingSreenService.stopLoading();
                  this.alertService.showWarning('An error occurred : ' + resultObj.Message);
                }
              } catch (Exception) {
                this.loadingSreenService.stopLoading();
                this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
              }

            }, err => {
              this.loadingSreenService.stopLoading();
              this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

            })

        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {

        }
      })



    }).catch(error => {

    });
  }

  /* #endregion */


  onClickMigrateExpense() {

    if (this.expenseSelectedItems.length == 0) {
      this.alertService.showWarning("Please select at least one record and try again");
      return;
    }



    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to Process it`, "Yes, Confirm", "No, Cancel").then((result) => {
      this.loadingSreenService.startLoading();
      var ids = [];
      var claimRequests = [];
      this.expenseSelectedItems.forEach(e => { ids.push(e.Id) });
      this.expenseSelectedItems.forEach(e => {
        if (e.ExpenseClaimRequestList !== undefined && e.ExpenseClaimRequestList !== null) {
          claimRequests = claimRequests.concat(e.ExpenseClaimRequestList)
        }
      });

      var role = new UserHierarchyRole();
      role.IsCompanyHierarchy = false;
      role.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
      role.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;


      var migrateExpenseModel = new MigrateExpenseModel();
      migrateExpenseModel.ExpenseClaimIds = ids;
      migrateExpenseModel.IsMergeBatches = false
      migrateExpenseModel.ModuleProcessAction = 43;
      migrateExpenseModel.Role = role;
      migrateExpenseModel.ActionProcessingStatus = 30500;
      migrateExpenseModel.Remarks = '';
      migrateExpenseModel.ClientId = this.businessType == 3 ? this.searchedClientId : this.clientIdSME;
      migrateExpenseModel.ExpenseClaimRequestList = claimRequests;
      migrateExpenseModel.ClientContractId = this.businessType == 3 ? this.searchClientContractId : this.clientcontractIdSME;

      this.reimbursementService.MigrateExpense(migrateExpenseModel)
        .subscribe((expenseBatchReqgObj) => {
          try {
            console.log('UPSERT EXPENSE BATCH ::', expenseBatchReqgObj);
            let resultObj: apiResult = expenseBatchReqgObj;
            if (resultObj.Status && resultObj.Result != null) {
              this.loadingSreenService.stopLoading();
              this.alertService.showSuccess(resultObj.Message);
              this.alertService.showSuccess('Please click transaction tab for processing');
              this.getExpenseData();

            }
            else {
              this.loadingSreenService.stopLoading();
              this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
            }
          } catch (Exception) {
            this.loadingSreenService.stopLoading();
            this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + Exception);
          }

        }, err => {
          this.loadingSreenService.stopLoading();
          this.alertService.showWarning('Expense Batch Request : Something bas has happend ! ' + err);

        })
    }).catch(error => {

    });

  }
  onClickingProcessOutupSearchButton(event: any) {

    this.searchedClientId = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLowerCase() == '@clientid').Value;
    this.searchClientContractId = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLowerCase() == '@clientcontractid').Value;
    let PayPeriod = this.searchConfigurationProcess.SearchElementList.find(x => x.FieldName.toLowerCase() == '@payperiodid');
    // this.searchedPayperiodId = PayPeriod.Value;
    // if(PayPeriod.DropDownList != undefined && PayPeriod.DropDownList != null && PayPeriod.DropDownList.length > 0){

    //   this.searchedPayPeriodName = PayPeriod.DropDownList.find(x => x.Id == this.searchedPayperiodId).PayCyclePeriodName;

    // }

    this.getProcessedOutputDataset();
  }

  modal_dismiss() {
    $('#Download_Template').modal('hide');

  }

  apiResult_dismiss() {
    this.searchConfiguration.SearchElementList.forEach(searchElementValues => {
      this.searchConfigurationProcess.SearchElementList.forEach(searchElement => {
        if (searchElementValues.FieldName === searchElement.FieldName) {
          searchElement.Value = searchElementValues.Value;
        }
      })
    })
    $('#api_Grid').modal('hide');
    this.activeTabName = 'Process';
    this.onClickingProcessOutupSearchButton(null);

  }

  modal_dismiss_displayResult() {
    $('#popup_displayResult').modal('hide');

  }

  downloadTemplate() {

    // let searchElementsForDynamicProducts = _.cloneDeep(this.searchConfiguration.SearchElementList);
    // searchElementsForDynamicProducts.push({
    //   FieldName : "@employeeId" , 
    //   Value  : 0 , 
    //   SendElementToGridDataSource : false ,
    //   IsIncludedInDefaultSearch : false,
    //   DropDownList : []
    // });
    // searchElementsForDynamicProducts.push({
    //   FieldName : "@companyId" , 
    //   Value  : this.companyId , 
    //   SendElementToGridDataSource : false ,
    //   IsIncludedInDefaultSearch : false,
    //   DropDownList : []
    // });

    // searchElementsForDynamicProducts = searchElementsForDynamicProducts.filter( x => x.FieldName.toLowerCase() !== '@processcategory');
    // searchElementsForDynamicProducts = searchElementsForDynamicProducts.filter( x => x.FieldName.toLowerCase() !== '@payperiodid');

    // searchElementsForDynamicProducts.forEach( x=> x.DropDownList = null);

    let searchElementsForDynamicProducts: SearchElement[] = [
      {
        FieldName: '@clientId',
        Value: null,
        DefaultValue: 0
      },
      {
        FieldName: '@clientContractId',
        Value: null,
        DefaultValue: 0
      },
      {
        FieldName: '@teamId',
        Value: null,
        DefaultValue: 0
      }
      ,
      {
        FieldName: '@employeeId',
        Value: null,
        DefaultValue: 0
      },
      {
        FieldName: '@companyId',
        Value: this.companyId,
        DefaultValue: 0
      },

    ]

    this.pageLayoutService.fillSearchElementsWithoutDropdown(this.searchConfiguration.SearchElementList, searchElementsForDynamicProducts);


    this.importLayout.ControlElementsList.forEach((x) => {
      x.FieldName == 'DynamicProducts' ? x.SearchElements = searchElementsForDynamicProducts : null;
    })

    this.loadingSreenService.startLoading();
    this.importLayoutService.getExcelTemplate(this.importLayout, this.selectedItems).subscribe(
      data => {
        this.loadingSreenService.stopLoading();
        console.log(data);
        if (data.Status) {
          let byteCharacters = atob(data.dynamicObject);
          const file = this.importLayoutService.convertByteToFile(byteCharacters);
          FileSaver.saveAs(file, "Reimbursement" + '_' + moment(new Date()).format('DD-MM-YYYY'));
          this.modal_dismiss();
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

  onSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.dataset);

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('answer', this.selectedItems);
  }

  onimportSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.outputDataset);

    this.importSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.importDataviewObj.getItem(row);
        this.importSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.importSelectedItems);
  }

  onOutputSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.outputDataset);

    this.outputSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.outputDataviewObj.getItem(row);
        this.outputSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.outputSelectedItems);
  }

  onpayrunSelectedRowsChanged(eventData, args) {
    this.payrunSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.payrunDataviewObj.getItem(row);
        this.payrunSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.payrunSelectedItems);
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

  onexpenseSelectedRowsChanged(eventData, args) {
    if (Array.isArray(args.rows)) {
      console.log('checkbox selected');
    }

    console.log('dataset', this.expenseDataset);

    this.expenseSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.expenseDataviewObj.getItem(row);
        this.expenseSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.expenseSelectedItems);
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid; // grid object
    this.dataviewObj = angularGrid.dataView;

    if (this.gridObj && this.gridObj.setOptions) {

      this.gridObj.setOptions(
        {
          enableColumnPicker: false
        }
      )
      // if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.importLayout.CreateExcelConfiguration.GridConfiguration.DefaultGroupingFields) {
      //   this.draggableGroupingPlugin.setDroppedGroups(this.importLayout.CreateExcelConfiguration.GridConfiguration.DefaultGroupingFields);
      //   this.gridObj.invalidate();
      //   this.gridObj.render();
      // }


    }
    if (this.importLayout.CreateExcelConfiguration.GridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }

  importAngularGridReady(angularGrid: AngularGridInstance) {
    this.importAngularGrid = angularGrid;
    this.importGridObj = angularGrid.slickGrid; // grid object
    this.importDataviewObj = angularGrid.dataView;
  }

  outputAngularGridReady(angularGrid: AngularGridInstance) {
    this.outputAngularGrid = angularGrid;
    this.outputGridObj = angularGrid.slickGrid; // grid object
    this.outputDataviewObj = angularGrid.dataView;
  }

  payrunAngularGridReady(angularGrid: AngularGridInstance) {
    this.payrunAngularGrid = angularGrid;
    this.payrunGridObj = angularGrid.slickGrid; // grid object
    this.payrunDataviewObj = angularGrid.dataView;
  }

  historyAngularGridReady(angularGrid: AngularGridInstance) {
    this.historyAngularGrid = angularGrid;
    this.historyGridObj = angularGrid.slickGrid; // grid object
    this.historyDataviewObj = angularGrid.dataView;
  }
  expenseAngularGridReady(angularGrid: AngularGridInstance) {
    this.expenseAngularGrid = angularGrid;
    this.expenseGridObj = angularGrid.slickGrid; // grid object
    this.expenseDataviewObj = angularGrid.dataView;
  }

  beforeTabChange(event) {
    if (event.nextId == 'Process') {
      this.getProcessedOutputDataset();
    }
    if (event.nextId == 'PendingExpense') {
      this.expenseSelectedItems = [];
      this.getExpenseData();
    }
    this.activeTabName = event.nextId;
    // console.log("Tab Changed" , this.activeTabName);
  }

  onChange_Processtabset(event) {
    if (event.nextId == 'PAYRUN') {
      this.payrunDataset = [];
      this.getPayrunDataset();
    }
    this.processActiveTabName = event.nextId;
  }

  close_slider() {
    if (this.isChanged) {
      this.alertService.showWarning("Please save the inputs");
    }
    this.addRowRecord = null;
    this.slider = false;
    this.employeeCode = '';
  }

  close_netPaySlider() {
    this.netPaySlider = false;
  }

  onImportCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

    const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'edit') {
      this.edit(column.dataContext);
    }


    if (column.columnDef.id == 'delete') {
      this.importAngularGrid.gridService.deleteItemById(column.dataContext["id"]);
    }
  }

  onOutputCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

    const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'NetPay') {
      this.onNetPay_Slider(column.dataContext);
    }

    if (column.columnDef.id == 'edit') {

      let status: TimeCardStatus = column.dataContext["StatusCode"] as number
      let canEdit: boolean = (status == TimeCardStatus.Initiated ||
        status == TimeCardStatus.PayrollCalculationFailed ||
        status == TimeCardStatus.InPayrollQueue || status == TimeCardStatus.PayrollCalculated ||
        status == TimeCardStatus.QcRejected
      );

      console.log(status, canEdit);

      if (!canEdit) {
        this.alertService.showWarning("Can't Edit record! Please check the processing status!");
        return;
      }

      this.isAdd = false;
      this.isProcess = true;
      this.isChanged = false;
      this.employeeCode = column.dataContext["EmployeeCode"];
      // this.payPeriod.Value = this.processPayPeriod.Value;
      this.editTimeCard(column.dataContext);

      // this.router.navigate(['app/fnf/finalsettlement'], {
      //   queryParams: {
      //    "Odx": btoa(JSON.stringify(column.dataContext)),
      //   }
      // });


    }

  }

  onpayrunCellClicked(e, args) {

    const column = this.payrunAngularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'PayRunId') {
      this.onClickPayRun(column.dataContext)
    }
  }

  onHistoryCellClicked(e, args) {
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

    const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'NetPay') {
      this.onNetPay_Slider(column.dataContext);
    }

  }

  onClickPayRun(rowData) {

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": rowData.PayRunId,
      "ReadOnly": false
    }];
    this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')
  }

  do_process_TimeCard(): void {
    this.LstProceeTimeCards = [];
    this.processedEMP = [];
    if (this.outputSelectedItems.length > 0) {

      // let isAvaliable = [];
      // isAvaliable = this.selectedItems.filter(r => environment.environment.IsAllowableStatusForReProcess.indexOf(Number(r.StatusCode)) >= 0);
      // if (isAvaliable.length != this.selectedItems.length) {
      //   this.alertService.showWarning('Error : One or more Employee items cannot be processed because the status is in an invalid state. Please contact your support admin.');
      //   return;
      // }

      this.loadingSreenService.startLoading();
      this.outputSelectedItems.forEach(e => {
        const processObj = new PayrollQueueMessage();
        processObj.EmployeeName = e.EmployeeName,
          processObj.TimeCardId = e.TimeCardId,
          processObj.IsPushedToQueue = true,
          processObj.MessageObject = null,
          processObj.OldMessageObject = null,
          processObj.Remarks = "",
          processObj.RuleSetCode = null;
        processObj.SessionDetails = null;
        this.LstProceeTimeCards.push(processObj);
      });

      let processTimeCardsModel: ProcessTimeCardsModel = new ProcessTimeCardsModel();

      processTimeCardsModel.MsgsList = this.LstProceeTimeCards;
      processTimeCardsModel.ProcessCategory = 3;

      this.payrollService.post_processAnyTimeCard(processTimeCardsModel)
        .subscribe((result) => {
          console.log('PROCESS TIME CARD RESPONSE :: ', result);
          this.loadingSreenService.stopLoading();
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            this.processedEMP = apiResult.Result as any;
            // this.alertService.showSuccess(apiResult.Message);
            this.getProcessedOutputDataset();
            $('#popup_chooseCategory').modal('show');

          } else {
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingSreenService.stopLoading();

        });
    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
  }

  void_TimeCard() {
    if (this.outputSelectedItems == undefined || this.outputSelectedItems == null || this.outputSelectedItems.length <= 0) {
      this.alertService.showWarning("Please select atleast one row!");
      return;
    }

    let lstTimeCard: TimeCard[] = [];

    this.outputSelectedItems.forEach(obj => {
      let timeCard: TimeCard = new TimeCard();
      timeCard.Id = obj.TimeCardId;
      timeCard.EmployeeId = obj.EmployeeId;

      lstTimeCard.push(timeCard);
    })

    console.log("TImeCards ::", lstTimeCard);

    this.loadingSreenService.startLoading();
    this.payrollService.post_voidTimeCard(lstTimeCard).subscribe(data => {
      this.loadingSreenService.stopLoading();
      console.log("Void TIme Card Result ::", data);
      if (data.Status) {
        this.alertService.showSuccess(data.Message);
        this.getProcessedOutputDataset();
      }
      else {
        this.alertService.showWarning(data.Message);
      }

    }, error => {
      this.loadingSreenService.stopLoading();
      this.alertService.showWarning("Error occured");
    })

  }

  modal_dismiss_display() {
    $('#popup_chooseCategory').modal('hide');

  }

  submitForVerification() {
    let LstSubmitForVerifcation = [];
    var currentDate = new Date();

    if (this.outputSelectedItems == undefined || this.outputSelectedItems == null || this.outputSelectedItems.length <= 0) {
      this.alertService.showInfo("At least one checkbox must be selected.");
      return;
    }

    var isProcessedExist = [];
    isProcessedExist = this.outputSelectedItems.filter(a => a.StatusCode != TimeCardStatus.PayrollCalculated);

    console.log('test', isProcessedExist);

    if (isProcessedExist.length > 0) {
      this.alertService.showWarning("Please check your processing status of records!");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
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
        this.loadingSreenService.startLoading();


        // let payperiodIds = [];
        // this.outputSelectedItems.forEach( x => payperiodIds.push(x.PayPeriodId));

        // let uniquePayPeriod = _.union(payperiodIds);

        // uniquePayPeriod.forEach(payPeriodId => {
        //   let LstSubmitForVerifcation = [];
        //   var PVRId = 0;

        //   let filleteredOutputList = this.outputSelectedItems.filter(x => x.PayPeriodId === payPeriodId);

        //   if(filleteredOutputList !== undefined && filleteredOutputList !== null && filleteredOutputList.length > 0 ){

        //     let payperiodName = filleteredOutputList[0].PayPeriod;

        //     filleteredOutputList.forEach(event => {
        //       PVRId = event.PVRId;
        //       var submitListObject = new PayrollVerificationRequestDetails();
        //       submitListObject.Id = event.PVRDId == -1 ? 0 : event.Id;
        //       submitListObject.PVRId = 0 
        //       submitListObject.TimeCardId = event.TimeCardId;
        //       submitListObject.EmployeeId = event.EmployeeId;
        //       submitListObject.EmployeeName = event.EmployeeName;
        //       submitListObject.IsActive = true;
        //       submitListObject.LastUpdatedBy = this.userId.toString();
        //       submitListObject.LastUpdatedOn = moment(currentDate).format('YYYY-MM-DD');
        //       submitListObject.RequestRemarks = jsonStr;
        //       submitListObject.ApproverRemarks = "";
        //       submitListObject.Status = TimeCardStatus.SentForQc;
        //       submitListObject.ModeType = UIMode.Edit;
        //       LstSubmitForVerifcation.push(submitListObject);
        //     });

        //     var submitObject = new PayrollVerificationRequest();
        //     submitObject.Id = PVRId == -1 ? 0 : PVRId;
        //     submitObject.CompanyId = this._loginSessionDetails.Company.Id;
        //     submitObject.ClientContractId = this.searchClientContractId;
        //     submitObject.ClientId = this.searchedClientId;
        //     submitObject.PayPeriodId = payPeriodId;
        //     submitObject.PayPeriodName = payperiodName;
        //     submitObject.AttdanceStartDate = moment().format('YYYY-MM-DD');
        //     submitObject.AttdanceEndDate =  moment().format('YYYY-MM-DD');
        //     submitObject.ClientContactId = 0;
        //     submitObject.TeamIds = [];
        //     submitObject.ClientContactDetails = "";
        //     // submitObject.TeamIds.push(this.header_items.teamId)
        //     filleteredOutputList.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
        //     submitObject.TeamIds = _.union(submitObject.TeamIds)
        //     submitObject.RequestedBy = this.userId.toString();
        //     submitObject.ApproverLogOn = moment(currentDate).format('YYYY-MM-DD');
        //     submitObject.ApproverId = null;
        //     submitObject.ApproverLogOn = moment(currentDate).format('YYYY-MM-DD');
        //     submitObject.RequestRemarks = jsonStr;
        //     submitObject.ApproverRemarks = "";
        //     submitObject.ObjectStorageId = 0;
        //     submitObject.Status = PVRStatus.Initiated;
        //     submitObject.LstPVRDetails = LstSubmitForVerifcation;

        //     this.payrollModel = _PayrollModel;
        //     this.payrollModel.NewDetails = submitObject;
        //     this.payrollModel.OldDetails = "";
        //     console.log('dd', this.payrollModel);

        //     this.payrollService.put_PVRSubmission(JSON.stringify(this.payrollModel))
        //       .subscribe((result) => {
        //         console.log('SUBMIT FOR VERIFICATION RESPONSE :: ', result);
        //         const apiResult: apiResult = result;
        //         if (apiResult.Status && apiResult.Result) {
        //           this.loadingSreenService.stopLoading();
        //           this.alertService.showSuccess(apiResult.Message);
        //           this.getProcessedOutputDataset();
        //         } else {
        //           this.loadingSreenService.stopLoading();
        //           this.alertService.showWarning(apiResult.Message);
        //         }
        //       }, error => {

        //       });
        //   }



        // })

        var PVRId = 0;
        this.outputSelectedItems.forEach(event => {
          PVRId = event.PVRId;
          var submitListObject = new PayrollVerificationRequestDetails();
          submitListObject.Id = event.PVRDId == -1 ? 0 : event.Id;
          submitListObject.PVRId = 0
          submitListObject.TimeCardId = event.TimeCardId;
          submitListObject.EmployeeId = event.EmployeeId;
          submitListObject.EmployeeName = event.EmployeeName;
          submitListObject.IsActive = true;
          submitListObject.LastUpdatedBy = this.userId.toString();
          submitListObject.LastUpdatedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
          submitListObject.RequestRemarks = jsonStr;
          submitListObject.ApproverRemarks = "";
          submitListObject.Status = TimeCardStatus.SentForQc;
          submitListObject.ModeType = UIMode.Edit;
          LstSubmitForVerifcation.push(submitListObject);
        });

        let payperiodName = this.outputSelectedItems[0].PayPeriod;
        let payperiodId = this.outputSelectedItems[0].PayPeriodId;

        var submitObject = new PayrollVerificationRequest();
        submitObject.Id = PVRId == -1 ? 0 : PVRId;
        submitObject.CompanyId = this._loginSessionDetails.Company.Id;
        submitObject.ClientContractId = this.searchClientContractId;
        submitObject.ClientId = this.searchedClientId;
        submitObject.PayPeriodId = payperiodId;
        submitObject.PayPeriodName = payperiodName;
        submitObject.AttdanceStartDate = this.outputSelectedItems[0].AttendanceStartDate;
        submitObject.AttdanceEndDate = this.outputSelectedItems[0].AttendanceEndDate;
        submitObject.ClientContactId = 0;
        submitObject.TeamIds = [];
        submitObject.ClientContactDetails = "";
        // submitObject.TeamIds.push(this.header_items.teamId)
        this.outputSelectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
        submitObject.TeamIds = _.union(submitObject.TeamIds)
        submitObject.RequestedBy = this.userId.toString();
        submitObject.RequestedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
        submitObject.ApproverId = null;
        submitObject.ApproverLogOn = '1900-01-01 00:00:00'
        submitObject.RequestRemarks = jsonStr;
        submitObject.ApproverRemarks = "";
        submitObject.ObjectStorageId = 0;
        submitObject.Status = PVRStatus.Initiated;
        submitObject.LstPVRDetails = LstSubmitForVerifcation;

        this.payrollModel = _PayrollModel;
        this.payrollModel.NewDetails = submitObject;
        this.payrollModel.OldDetails = "";
        console.log('dd', this.payrollModel);

        this.payrollService.put_PVRSubmission(JSON.stringify(this.payrollModel))
          .subscribe((result) => {
            console.log('SUBMIT FOR VERIFICATION RESPONSE :: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {
              this.loadingSreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.getProcessedOutputDataset();
            } else {
              this.loadingSreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {

          });
      } else if (
        /* Read more about handling dismissals below */
        inputValue.dismiss === Swal.DismissReason.cancel

      ) {
      }
    });



  }

  refreshOuputDataset() {
    this.getProcessedOutputDataset();
  }

  onNetPay_Slider(rowRecord) {
    // if (rowRecord.NetPay > 0) {
    this.rowRecord = rowRecord;
    console.log("Row Record ::", rowRecord);
    if (rowRecord.Payitem == null || rowRecord.Payitem == "") {
      this.alertService.showInfo("No Pay items record found!");
      return;
    }
    // this.Payitems = JSON.parse(rowRecord.Payitem);
    this.Payitems = rowRecord.Payitem;
    this.Payitems = this.Payitems.filter(a => a.ProductTypeCode === 'Reimb' || a.ProductTypeCode === 'Billing' || a.ProductTypeCode === 'Total')
    console.log('payItem', this.Payitems);

    this.netPaySlider = true;
    // }
  }

  async do_initiate_Sale_order(index: string) {
    // console.log('selected', this.outputSelectedItems);

    if (this.processClient.Value == null) {
      this.alertService.showWarning("PLease choose Client first");
      return;
    }

    if (this.processClientContract.Value == null) {
      this.alertService.showWarning("PLease choose client contract first");
      return;
    }

    if (this.processTeam.Value == null) {
      this.alertService.showWarning("PLease choose Team first");
      return;
    }

    let teamOpenPayPeriodId = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).PayPeriod;

    let rowData = {
      "clientId": this.processClient.Value,
      "clientcontractId": this.processClientContract.Value,
      "payperiodId": teamOpenPayPeriodId, //this.processPayPeriod.Value,
      "ClientName": this.processClient.DropDownList.find(x => x.Id == this.processClient.Value)["Name"],
      "ContractCode": this.processClientContract.DropDownList.find(x => x.Id == this.processClientContract.Value)["Code"],
      "PayPeriod": teamOpenPayPeriod, //this.processPayPeriod.DropDownList.find(x => x.Id == this.processPayPeriod.Value)["Name"],
      "ProcessCategory": 3
    }

    console.log("Row Data ::", rowData);

    let modalOption: NgbModalOptions = {};

    modalOption.backdrop = 'static';
    modalOption.keyboard = false;

    if (index === "PAYINPUTS") {
      let teamIds = [];
      // this.selectedItems.forEach(element => {
      //   teamIds.push(element.teamId)
      // });
      teamIds.push(this.processTeam.Value);
      var rmdups = _.union(teamIds);
      var teamId = (rmdups).join(",");
      sessionStorage.removeItem("teamId");
      sessionStorage.setItem("teamId", teamId);

      this.rowDataService.dataInterface.RowData = rowData;
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "TeamIds",
        "OutputFieldName": "@TeamIds",
        "Value": teamId,
        "ReadOnly": false
      },
      {
        "InputFieldName": "payperiodId",
        "OutputFieldName": "@payperiodId",
        "Value": teamOpenPayPeriodId, //this.processPayPeriod.Value,
        "ReadOnly": false
      },
      {
        "InputFieldName": "",
        "OutputFieldName": "@processCategory",
        "Value": 3,
        "ReadOnly": false
      },
      ];
      console.log('rowdata', this.rowDataService);
      const modalRef = this.modalService.open(InitiateSaleOrderModalComponent, modalOption);
      modalRef.componentInstance.ParentrowDataService = JSON.stringify(this.rowDataService);
      modalRef.result.then((result) => {

        console.log('POPUP RESULT :', result);
        this.getDataset();
        this.outputSelectedItems = []
      }).catch((error) => {
        console.log(error);
      });

      // await this.router.navigateByUrl('app/payrolltransaction/initiateSaleOrder')

    } else if (index === "PAYRUN") {
      let PayrunIds = [];

      if (this.payrunSelectedItems === undefined || this.payrunSelectedItems === null || this.payrunSelectedItems.length <= 0) {
        this.alertService.showInfo("Please choose atleast one record.");
        return;
      }

      this.payrunSelectedItems.forEach(element => {
        PayrunIds.push(element.PayRunId)
      });
      console.log('selectedItems', this.payrunSelectedItems);
      var dupPayRunId = _.union(PayrunIds);
      var PayRunId = (dupPayRunId).join(",");

      sessionStorage.removeItem("PayRunIds");
      sessionStorage.setItem("PayRunIds", PayRunId);

      console.log('PayRunId', PayRunId);

      this.rowDataService.dataInterface.RowData = this.payrunSelectedItems[0];
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayRunIds",
        "OutputFieldName": "@PayRunIds",
        "Value": PayRunId,
        "ReadOnly": false
      }];
      await this.router.navigateByUrl('app/payroll/payrolltransaction/initiatePayOut')
    }
  }

  downloadPaysheet() {

    if (this.processTeam.Value == null) {
      this.alertService.showWarning("PLease choose Team first");
      return;
    }

    let teamOpenPayPeriodId = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).OpenPayPeriodId;



    if (this.outputSelectedItems.length > 0) {
      // this.loadingSreenService.startLoading();
      // const jobj = new GeneratePIS();
      // jobj.ClientId = this.searchedClientId;
      // jobj.ClientContractId = this.searchClientContractId;
      // jobj.EmployeeIds = [];
      // jobj.TeamIds = [];
      // this.outputSelectedItems.forEach(function (item) { jobj.TeamIds.push(item.teamId) })
      // this.outputSelectedItems.forEach(function (item) { jobj.EmployeeIds.push(item.EmployeeId) })
      // jobj.TeamIds = _.union(jobj.TeamIds)

      // jobj.PayPeriodId = teamOpenPayPeriodId;
      // jobj.PISId = 0;
      // jobj.IsDownloadExcelRequired = true;
      // jobj.ObjectStorageId = 0;
      // jobj.RequestedBy = this.userId;
      // jobj.RequestedOn = 0;
      // jobj.GeneratedRecords = 0;
      // jobj.IsPushrequired = true;
      // jobj.ProcessCategory = 3;

      // this.payrollService.put_downloadPaysheet(jobj)
      //   .subscribe((result) => {
      //     console.log('PAY SHEET DOWNLOAD RESPONSE :: ', result);
      //     const apiResult: apiResult = result;
      //     if (apiResult.Status && apiResult.Result) {
      //       var payperiodName = this.searchObject.PayPeriodName.substring(0, 3)
      //       var dynoFileName = `PAYSHEET_${this.searchObject.ClientName}_${this.searchObject.TeamName}_${this.searchObject.PayPeriodName}`;
      //       this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
      //       this.loadingSreenService.stopLoading();
      //       this.alertService.showSuccess(apiResult.Message);
      //     } else {
      //       this.loadingSreenService.stopLoading();
      //       this.alertService.showWarning(apiResult.Message);
      //     }
      //   }, (err) => {

      //   })

      let lsttimecard = [];
      this.loadingSreenService.startLoading();

      this.outputSelectedItems.forEach(item => {
        let timecard = new TimeCard();
        timecard.Id = item.TimeCardId;
        timecard.ProcessCategory = 3;
        timecard.PayPeriodId = item.PayPeriodId;
        lsttimecard.push(timecard)
      });
      this.payrollService.put_downloadPaySheet_Timecard(lsttimecard)
        .subscribe((result) => {
          console.log('PAY SHEET DOWNLOAD RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            var payperiodName = this.searchObject.PayPeriodName.substring(0, 3)
            var dynoFileName = `PAYSHEET_Reimb_${this.searchObject.ClientName}_${this.searchObject.TeamName}_${payperiodName}`;
            this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
            this.loadingSreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
          } else {
            this.loadingSreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, (err) => {

        })
    } else {
      this.alertService.showWarning("Oh ho! As per the paysheet requirement, You must make a selection(s) from the list.")
    }

  }

  fillHistorySearchElements() {
    this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList,
      this.searchConfigurationForHistroy.SearchElementList);

    // console.log("History Search Elements filled ::" , this.searchConfigurationForHistroy.SearchElementList);  
  }

  do_Create_PayRun() {
    if (this.outputSelectedItems === undefined || this.outputSelectedItems === null ||
      this.outputSelectedItems.length === 0) {
      this.alertService.showWarning("No Employee record(s) have been selected. Kindly first select");
      return;
    }

    let isAvaliable = [];
    isAvaliable = this.outputSelectedItems.filter(r => environment.environment.IsApplicableStatusForInitiatePayrun.indexOf(Number(r.StatusCode)) >= 0);
    if (isAvaliable.length != this.outputSelectedItems.length) {
      this.alertService.showWarning('Error : One or more Employee records cannot be initiated because the status is in an invalid state. Please contact your support admin.');
      return;
    }

    let payRunModel: PayRunModel = new PayRunModel();

    let clientName = this.processClient.DropDownList.find(x => x.Id == this.processClient.Value)["Name"];
    let clientcontractName = this.processClientContract.DropDownList.find(x => x.Id == this.processClientContract.Value)["Code"];
    let teamOpenPayPeriod = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).PayPeriod;
    let teamOpenPayPeriodId = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).OpenPayPeriodId;

    this.alertService.confirmSwal1("Confirm Stage?", "Are you sure you want to initiate these employees to the Payrun?", "OK", "Cancel")
      .then((result) => {
        let LstPayRunDetails = [];
        this.loadingSreenService.startLoading();
        let PayRunId = 0;
        this.outputSelectedItems.forEach(event => {
          var submitListObject = new PayRunDetails();
          PayRunId = event.PayRunId;
          submitListObject.EmployeeId = event.EmployeeId;
          submitListObject.EmployeeCode = event.EmployeeCode;
          submitListObject.TimeCardId = event.TimeCardId;
          submitListObject.EmployeeName = event.EmployeeName;
          submitListObject.TimecardStatus = TimeCardStatus.ClientApproved;
          submitListObject.PaytransactionId = event.PaytransactionId;
          submitListObject.GrossEarn = event.GrossEarn;
          submitListObject.GrossDedn = event.GrossDedn;
          submitListObject.NetPay = event.NetPay;
          submitListObject.InvoiceIds = null;
          submitListObject.ModeType = UIMode.Edit;
          submitListObject.Id = 0;
          LstPayRunDetails.push(submitListObject);
        });
        var submitObject = new PayRun();
        submitObject.Code = `${clientName}_${clientcontractName}`;
        submitObject.Name = `${clientName}_${clientcontractName}_${teamOpenPayPeriod}`;
        submitObject.CompanyId = this._loginSessionDetails.Company.Id;
        submitObject.ClientContractId = this.processClientContract.Value;
        submitObject.ClientId = this.processClient.Value;
        submitObject.PayPeriodId = teamOpenPayPeriodId;
        submitObject.TeamIds = [];
        this.outputSelectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
        submitObject.TeamIds = _.union(submitObject.TeamIds);
        submitObject.NumberOfEmpoyees = this.outputSelectedItems.length;
        submitObject.NoOfSaleOrders = 0;
        submitObject.PayRunStatus = PayRunStatus.Intitated;
        submitObject.Id = 0;
        submitObject.LstPayrunDetails = LstPayRunDetails;
        submitObject.ModeType = UIMode.Edit;
        submitObject.ProcessCategory = ProcessCategory.Expense;
        payRunModel = _PayRun;
        payRunModel.NewDetails = submitObject;
        console.log('PAYRUN MODEL : ', payRunModel);
        this.payrollService.PUT_UpsertPayRun(JSON.stringify(payRunModel))
          .subscribe((result) => {
            console.log('SUBMIT FOR UPSERT PAYRUN RESPONSE ::', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {
              this.alertService.showSuccess(apiResult.Message);
              const _payRun_answer = apiResult.Result as any;
              setTimeout(() => {
                this.loadingSreenService.stopLoading();
                this._redirect_to_payrun(_payRun_answer.Id);
              }, 300);
            } else {
              this.loadingSreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingSreenService.stopLoading();

          });
      }).catch(cancel => {

      });

  }

  _redirect_to_payrun(PayRunId) {

    let teamOpenPayPeriodId = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.processTeam.DropDownList.find(x => x.Id == this.processTeam.Value).PayPeriod;

    let rowData = {
      "clientId": this.processClient.Value,
      "clientcontractId": this.processClientContract.Value,
      "payperiodId": teamOpenPayPeriodId, //this.processPayPeriod.Value,
      "ClientName": this.processClient.DropDownList.find(x => x.Id == this.processClient.Value)["Name"],
      "ContractCode": this.processClientContract.DropDownList.find(x => x.Id == this.processClientContract.Value)["Code"],
      "PayPeriod": teamOpenPayPeriod, //this.processPayPeriod.DropDownList.find(x => x.Id == this.processPayPeriod.Value)["Name"],
      "ProcessCategory": 3
    }

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": PayRunId,
      "ReadOnly": false
    }];
    console.log('initiate pay urn', this.rowDataService.dataInterface);

    this.businessType == 1 ? this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun') : this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')

  }
  downloadExcel(): void {
    let exportExcelDate = [];
    this.Payitems.forEach(element => {

      exportExcelDate.push({
        ProductCode: element.ProductCode,
        ProductName: element.ProductDisplayName,
        ActualAmount: element.ActualAmount,
        EarnedAmount: element.PayTotal
      })

    });

    this.excelService.exportAsExcelFile(exportExcelDate, `${this.rowRecord.EmployeeCode}_${this.rowRecord.PayPeriod} _Employee_Reimbursement`);
  }


  getStatusName(status) {
    return this.expenseClaimRequestStatus.find(a => a.id == status).name;
  }

  selectAllClaimRequest(event: any) {

    this.selectedClaimRequests = [];
    this.rowData.ExpenseClaimRequestList.forEach(e => {
      event.target.checked == true ? e.isSelected = true : e.isSelected = false
    });
    if (event.target.checked) {
      this.rowData.ExpenseClaimRequestList.forEach(e => {
        this.selectedClaimRequests.push(e);
      });
    } else {
      this.selectedClaimRequests = [];
    }
  }

  

  do_viewDocuments(item) {

    const modalRef = this.modalService.open(ViewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.editObject = item;
    modalRef.componentInstance.Role = this.Role;
    modalRef.componentInstance.IsVerification = false;
    modalRef.componentInstance.objStorageJson = { CompanyId: this.rowData.CompanyId, ClientId: this.rowData.ClientId, ClientContractId: this.rowData.ClientContractId, EmployeeId: this.rowData.EmployeeId }

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('result', result);
      }
    }).catch((error) => {
      console.log(error);
    });

  }



}
