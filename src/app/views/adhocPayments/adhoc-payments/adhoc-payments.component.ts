import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AngularGridInstance, Column, GridOption } from 'angular-slickgrid';
import FileSaver from 'file-saver';
import _ from 'lodash';
import moment from 'moment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { InitiateSaleOrderModalComponent } from 'src/app/shared/modals/payroll/initiate-sale-order-modal/initiate-sale-order-modal.component';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses, Role, UIMode } from 'src/app/_services/model';
import { searchObject, _searchObject } from 'src/app/_services/model/Common/SearchObject';
import { AdhocPayment, AdhocPaymentStatus, AdhocPaymentType } from 'src/app/_services/model/Payroll/AdhocPayment';
import { GeneratePIS } from 'src/app/_services/model/Payroll/generatePIS';
import { PayrollModel, _PayrollModel } from 'src/app/_services/model/Payroll/ParollModel';
import { PayrollQueueMessage } from 'src/app/_services/model/Payroll/PayrollQueueMessage';
import { PayrollVerificationRequest, PayrollVerificationRequestDetails, PVRStatus } from 'src/app/_services/model/Payroll/PayrollVerificationRequest';
import { PayRun, PayRunDetails, PayRunStatus, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { ProcessTimeCardsModel } from 'src/app/_services/model/Payroll/ProcessTimeCardsModel';
import { BillUnitType, PayUnitType, TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { TimeCardModel } from 'src/app/_services/model/Payroll/TimeCardModel';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { AlertService, DownloadService, ExcelService, ImportLayoutService, PagelayoutService, PayrollService, SessionStorage } from 'src/app/_services/service';
import { ReimbursementService } from 'src/app/_services/service/reimbursement.service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { FormInputControlType, RelationWithParent } from '../../generic-form/enums';
import { DataFormat, ImportControlElementType } from '../../generic-import/import-enums';
import { ImportLayout } from '../../generic-import/import-models';
import { DataSourceType, InputControlType, SearchPanelType } from '../../personalised-display/enums';
import { DataSource, PageLayout, SearchConfiguration, SearchElement } from '../../personalised-display/models';
import { RowDataService } from '../../personalised-display/row-data.service';
import { apiResult } from './../../../_services/model/apiResult';


@Component({
  selector: 'app-adhoc-payments',
  templateUrl: './adhoc-payments.component.html',
  styleUrls: ['./adhoc-payments.component.css']
})
export class AdhocPaymentsComponent implements OnInit {

  //PageLayouts
  addPageLayout : PageLayout;
  outputPageLayout : PageLayout;
  payrunPageLayout : PageLayout;
  historyPageLayout : PageLayout;
  readonly addPageLayoutCode : string = 'AdhocAddNew';
  readonly outputPageLayoutCode : string = 'AdhocOutput';
  readonly payrunPageLayoutCode : string = 'AdhocPayrun';
  readonly historyPageLayoutCode : string = 'AdhocHistory';
  
  //Properties to disable search until UI is completely loaded
  disableSearchForProcess : boolean = true;
  diableSearchForAdd : boolean = true;

  //General
  spinner: boolean;
  searchPanel: boolean;
  searchObject: searchObject;
  slider : boolean = false;
  isAdd : boolean = true;
  isProcess : boolean = false;
  isChanged : Boolean = false;
  netPaySlider : boolean = false;
  addRowRecord : any;
  rowRecord: any;
  Payitems: any;
  employeeCode : string;
  defaultFormValue : any;
  teamOpenPayPeriodId : number;

  //Upload
  file : File;
  @ViewChild("fileInput") inputFile : ElementRef;
  
  //Add
  searchConfiguration : SearchConfiguration ;
  searchElementList : SearchElement[];

  // searchConfigurationProcess : SearchConfiguration ;
  addColumnDefinition : Column[];
  addGridOptions : GridOption;
  addDataset : any[];
  addAngularGrid: AngularGridInstance;
  addGridObj: any;
  addDataviewObj: any;
  addSelectedItems: any[];

  //Tabs
  activeTabName : string = "Add"
  processActiveTabName : string = "PAYINPUTS";

  //Choose Employee
  columnDefinition : Column[];
  gridOptions : GridOption;
  dataset : any[];
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  selectedItems: any[];

  //apiGrid
  apiGridColumnDefinition : Column[];
  apiGridGridOptions : GridOption;
  apiGridDataset : any[];
  apiGridAngularGrid: AngularGridInstance;
  apiGridGridObj: any;
  apiGridDataviewObj: any;
  apiGridSelectedItems: any[];

  //Process - Input/Output
  outputColumnDefinition : Column[];
  outputGridOptions : GridOption;
  outputDataset : any[];
  outputAngularGrid: AngularGridInstance;
  outputGridObj: any;
  outputDataviewObj: any;
  outputSelectedItems: any[];

  //Process - Payrun
  payrunColumnDefinition : Column[];
  payrunGridOptions : GridOption;
  payrunDataset : any[];
  payrunAngularGrid: AngularGridInstance;
  payrunGridObj: any;
  payrunDataviewObj: any;
  payrunSelectedItems: any[];

  //History
  searchConfigurationForHistroy : SearchConfiguration ;
  historyColumnDefinition : Column[];
  historyGridOptions : GridOption;
  historyDataset : any[];
  historyAngularGrid: AngularGridInstance;
  historyGridObj: any;
  historyDataviewObj: any;
  historySelectedItems: any[];

  searchedClientId : number;
  searchClientContractId : number;
  searchedTeamId : number;
  searchedPayperiodId : number;
  searchedPayPeriodName : string;
  payrollModel : PayrollModel;

  importLayout : ImportLayout ;

  //Session Details
  _loginSessionDetails: LoginResponses;
  companyId : number;
  clientId : number;
  clientContractId : number;
  implementationCompanyId : number;
  userId : number;
  userName : string = '';
  currentRole : Role;
  roleCode : string;
  businessType : number;

  LstProceeTimeCards: any[];
  processedEMP: any[];


  //Search Elements
  payPeriod : SearchElement;
  client : SearchElement;
  clientContract : SearchElement;
  team : SearchElement;

  //Form
  adhocProductForm : FormGroup;

  //popup display result
  resultList : any[];

  // SME 
  clientSME : any;
  clientcontractSME : any;
  clientIdSME : number;
  clientcontractIdSME : number;



  hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value != null && value != -1 ? '<a href="javascript:;">' + value + '</a>' : '---';
  newTimeCardList: any[];
  
  isAddDuplicateEntry : boolean = false;
  isOutputDuplicateEntry : boolean = false;
  isPayRunDuplicateEntry : boolean = false;
  isHistoryDuplicateEntry : boolean  = false;
  isNormalDSDuplicateEntry : boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private pageLayoutService : PagelayoutService,
    private alertService : AlertService,
    private sessionService : SessionStorage,
    private reimbursementService : ReimbursementService,
    private importLayoutService : ImportLayoutService,
    private loadingSreenService : LoadingScreenService,
    private router : Router,
    private payrollService : PayrollService,
    private rowDataService: RowDataService,
    private modalService: NgbModal,
    private downloadService : DownloadService,
    private utilityService : UtilityService,
    private excelService: ExcelService
  ) { 
    this.createReactiveForm();
  }
  
  createReactiveForm(){
    this.adhocProductForm = this.formBuilder.group({
      ProductConfiguration : [null],
      PayUnitValue: [null , {updateOn: 'blur'}],
      BillUnitValue : [null , {updateOn: 'blur'}],
    })
  }

  get g() { return this.adhocProductForm.controls; } // reactive forms validation 
  
  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.userId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.userName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.companyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.implementationCompanyId = this._loginSessionDetails.ImplementationCompanyId;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item=>item.CompanyId ==  this._loginSessionDetails.Company.Id).BusinessType;

    console.log("Business Type ::" , this.businessType);

    this.pageLayoutService.getPageLayout(this.addPageLayoutCode).subscribe(data => {
      this.diableSearchForAdd  = false;
      if (data.Status === true && data.dynamicObject != null) {
        this.addPageLayout = (data.dynamicObject);
        console.log("addPageLayout" , this.addPageLayout);
        // this.searchElementList = (this.pageLayout.SearchConfiguration.SearchElementList);
        // this.searchConfiguration = this.pageLayout.SearchConfiguration;
        this.setGrid("add");
        this.spinner = false;

        

        //console.log("Seach elements" , this.searchElementList);
        
      }
      else{
        this.spinner = false;
      }
    } , error => {
      this.spinner = false;

    })

    this.pageLayoutService.getPageLayout(this.outputPageLayoutCode).subscribe(data => {
      
      this.disableSearchForProcess = false;

      if (data.Status === true && data.dynamicObject != null) {

        let pageLayout : PageLayout = data.dynamicObject;

        if(this.businessType !== 3){

          this.clientSME = JSON.parse(this.sessionService.getSessionStorage("SME_Client"));
          this.clientIdSME = this.sessionService.getSessionStorage("default_SME_ClientId");
          this.clientcontractSME = JSON.parse(this.sessionService.getSessionStorage("SME_ClientContract"));
          this.clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");

          let  clientDropDownList  : any[] = [];
          let  clientcontractDropDownList  : any[] = [];
   
          if(this.clientSME !== undefined && this.clientSME !== null){
           clientDropDownList.push(this.clientSME);
          }
   
          if(this.clientcontractSME !== undefined && this.clientcontractSME !== null){
           clientcontractDropDownList.push(this.clientcontractSME);
          }

          let clientSearchElement =  pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@clientid');
          let clientcontractSearchElement =  pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@clientcontractid');

          clientSearchElement.Value = this.clientSME.Id;
          clientSearchElement.DropDownList = clientDropDownList;
          clientcontractSearchElement.Value = this.clientcontractSME.Id;
          clientcontractSearchElement.DropDownList = clientcontractDropDownList ;

          clientSearchElement.IsIncludedInDefaultSearch = false;
          clientcontractSearchElement.IsIncludedInDefaultSearch = false;

          pageLayout.SearchConfiguration.ClearButtonRequired = false;

          this.searchConfiguration = pageLayout.SearchConfiguration;
          this.searchElementList = this.searchConfiguration.SearchElementList;
        }
        else{
          this.searchConfiguration = pageLayout.SearchConfiguration;
          this.searchElementList = this.searchConfiguration.SearchElementList;
        } 

        console.log("Search configuration ::" , this.searchConfiguration);
        this.client = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@clientid');
        this.clientContract = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@clientcontractid');
        this.team = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@teamid');

        this.outputPageLayout = pageLayout;
        console.log("outputPageLayout" , this.outputPageLayout);
        this.setGrid("output");
        this.spinner = false;

        

        let commonSearchElementsString : string = sessionStorage.getItem('CommonSearchCriteria');
        
        if(commonSearchElementsString !== undefined && commonSearchElementsString !== null && commonSearchElementsString !== ''){
         this.pageLayoutService.fillSearchElementFromLocalStorage(this.searchElementList);
          console.log('LOCAL', this.searchElementList );
          let payPeriodElement = this.searchConfiguration.SearchElementList.find(p => p.FieldName.toLowerCase() === "@payperiodid");
          let teamSearchELement = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@teamid')
          if(teamSearchELement.Value !== null && teamSearchELement.DropDownList !== null && teamSearchELement.DropDownList.length > 0){
            let team = teamSearchELement.DropDownList.find(x => x.Id === teamSearchELement.Value);
            if(team.OpenPayPeriodId !== undefined && team.OpenPayPeriodId !== null && 
              team.PayPeriod !== undefined && team.PayPeriod !== null) {
              // fix for bug id 3876
              if (payPeriodElement.Value !== undefined && payPeriodElement.Value !== null && 
                team.OpenPayPeriodId !== payPeriodElement.Value) {
                  payPeriodElement.Value = team.OpenPayPeriodId;
              }
              // end region
              this.re_Binding_searchPanel();
              this.bind_SearchIds();
            }
            else{
              teamSearchELement.Value = null;
              teamSearchELement.DropDownList = [];
            }
          } 
          // this.fillHistorySearchElements();
        }

        if( this.rowDataService.dataInterface.SearchElementValuesList != undefined &&
          this.rowDataService.dataInterface.SearchElementValuesList != null && 
          this.rowDataService.dataInterface.SearchElementValuesList.length >=0){
    
          this.rowDataService.dataInterface = {
            SearchElementValuesList: null,
            RowData: null
          } 
    
          console.log(this.searchConfiguration);

          // this.bind_SearchIds();

          this.addDataset = [];
          this.outputDataset = [];
          this.payrunDataset = [];
          if(this.activeTabName == 'Add'){
            // this.getAddDataset();
          }
          else{
            if(this.processActiveTabName == 'PAYINPUTS'){
              this.getProcessedOutputDataset();
            }
            else {

            }
          }
    
        }

        if(this.activeTabName == 'Process' && this.processActiveTabName == 'PAYINPUTS'){
          this.getProcessedOutputDataset();
        }
      }
      else{
        this.spinner = false;
      }
    } , error => {
      this.spinner = false;

    })

    this.pageLayoutService.getPageLayout(this.payrunPageLayoutCode).subscribe(data => {
      if (data.Status === true && data.dynamicObject != null) {
        this.payrunPageLayout = (data.dynamicObject);
        console.log("payrunPageLayout" , this.payrunPageLayout);
        this.setGrid("payrun");
        console.log("PayrunColumns ::" , this.payrunColumnDefinition);
        this.spinner = false;

        
        if(this.activeTabName == 'Process' && this.processActiveTabName == 'PAYINPUTS'){
          this.getPayrunDataset();
        }
      }
      else{
        this.spinner = false;
      }
    } , error => {
      this.spinner = false;

    })

    this.pageLayoutService.getPageLayout(this.historyPageLayoutCode).subscribe(data => {

      if (data.Status === true && data.dynamicObject != null) {
        this.historyPageLayout = (data.dynamicObject);
        this.setGrid("history");
        this.searchConfigurationForHistroy = this.historyPageLayout.SearchConfiguration;
        this.spinner = false;
        this.fillHistorySearchElements();

        console.log("SearchConfiguration for history ::" , this.searchConfigurationForHistroy);

        if(this.activeTabName == 'History'){
          this.getProcessedHistoryDataset();
        }
        
      }
      else{
        this.spinner = false;
      }
    } , error => {
      this.spinner = false;

    })

    this.addDataset = [];




    
    // this.searchConfiguration = {
    //   SearchElementList : [
    //     {
    //       DataSource: {
    //         EntityType: 0,
    //         IsCoreEntity: false,
    //         Name: "client",
    //         Type: 1
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
    //       SendElementToGridDataSource : true
    //     },
    //     { 
    //       DataSource : {
    //         IsCoreEntity : false,
    //         Name : "clientcontract",
    //         Type : 1
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
    //       SendElementToGridDataSource : true
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
        
    //   ],
      
    //   SearchPanelType : SearchPanelType.Panel,
    //   SearchButtonRequired : true,
    //   ClearButtonRequired : true,
    //   SaveSearchElementsLocally : true
    // };
    // this.searchElementList = this.searchConfiguration.SearchElementList;

    // this.payPeriod = this.searchConfiguration.SearchElementList.find(x => x.FieldName == '@payperiodId');




    this.setChooseEmployeeGrid();

    this.importLayout = {
      Id : 0,
      Code : '',
      Name : '',
      CompanyId : 0 ,
      ClientId : 0 ,
      ImportTree : {
        DataSource : {
          Name : "AdhocPayment",
          Type : DataSourceType.View,
          IsCoreEntity : false
        },
        RelationWithParent : RelationWithParent.None,
        Children : []
      },
      ControlElementsList : [
         {//Employee Code
          Label : 'Employee Code',
          FieldName : 'EmployeeCode',
          EntityList : ["AdhocPayment"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {//Employee Name
          Label : 'Employee Name',
          FieldName : 'EmployeeName',
          EntityList : ["AdhocPayment"],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic,
        },
        {// Client Name
          Label : 'Client Name',
          FieldName : 'ClientName',
          EntityList : ['AdhocPayment'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        }, 
        {// Date of joining
          Label : 'Date of Joining',
          FieldName : 'DOJ',
          EntityList : ['AdhocPayment'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic
        },
        {//Product
          Label : 'Product',
          FieldName : 'Product',
          EntityList : ['AdhocPayment'],
          InputControlType : FormInputControlType.DropDown,
          DataSource : {
            Name : 'GetAdhocPaymentProducts',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          SearchElements : [],
          DisplayField : 'DisplayName',
          ValueField : 'DisplayName',
          Type : ImportControlElementType.Basic
        },
        {//PayUnitValue
          Label : 'Payable Amount',
          FieldName : 'PayUnitValue',
          EntityList : ['AdhocPayment'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic   
        },
        {
          Label : 'Billable Amount',
          FieldName : 'BillUnitValue',
          EntityList : ['AdhocPayment'],
          InputControlType : FormInputControlType.TextBox,
          Type : ImportControlElementType.Basic   
        },
      ],
      CreateExcelConfiguration : {
        DataSource : {
          Name : '',
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        SearchConfiguration : {
          SearchElementList : [],
          SearchPanelType : SearchPanelType.None
        }
      },
      SaveExcelDataConfiguration : {
        EntityRelations : {
        },
        UniqueIdentifiers : {},
        DataFormat : DataFormat.RawData
      }
    }

    this.defaultFormValue = {
      ProductConfiguration : null,
      PayUnitValue: null ,
      BillUnitValue : null 
    }

    this.adhocProductForm.get('PayUnitValue').valueChanges.subscribe(val => {
      console.log("payunitvalue changed ::" , val);
      if(this.g.ProductConfiguration.value != null){
        let billUnitValue = this.adhocProductForm.get('BillUnitValue').value;
        if(this.adhocProductForm.get('ProductConfiguration').value.AllowToInputBillableAmount){
          if(billUnitValue == undefined || billUnitValue == null || billUnitValue == 0){
            console.log("Changing Bill unit value from pay unit value");
            this.g.BillUnitValue.setValue(this.g.PayUnitValue.value);
          }
        }
      }
      
      
    })

    this.g.BillUnitValue.valueChanges.subscribe(val => {
      console.log("billunitvalue changed ::" , val);
      console.log("Product Configuration ::" , this.adhocProductForm.get('ProductConfiguration').value );
      if(this.adhocProductForm.get('ProductConfiguration').value != null){
        if(val <= 0){
          if(!this.adhocProductForm.get('ProductConfiguration').value.AllowNegativeValue &&
          this.adhocProductForm.get('ProductConfiguration').value.AllowToInputBillableAmount){
            this.alertService.showWarning("Connot enter 0 or negative value!");
            this.g.BillUnitValue.setValue(this.g.PayUnitValue.value);
          }
        }
      }
      
    })



  }

  setGrid(tab : string){
    
    
    let pageLayout : PageLayout = this[tab + "PageLayout"]
    console.log("PageLayout :: " , pageLayout )
    this[tab + "ColumnDefinition"] = this.pageLayoutService.setColumns(pageLayout.GridConfiguration.ColumnDefinitionList);
    this[tab + "GridOptions"] = this.pageLayoutService.setGridOptions(pageLayout.GridConfiguration);
    
   
    if(tab == "output"){
      let column = this.outputColumnDefinition.find( x=> x.id == 'NetPay');
      column.formatter = this.hyperlinkFormatter;
    }
    else if(tab == "payrun"){
      let column = this.payrunColumnDefinition.find( x=> x.id == 'PayRunId');
      column.formatter = this.hyperlinkFormatter;
    }
    else if(tab == 'add'){
      this.addGridOptions.datasetIdPropertyName = 'id';
    }

  }

  setChooseEmployeeGrid(){
    this.columnDefinition = [
      {
        id : 'EmployeeCode',
        field : "EmployeeCode",
        name : 'Employee Code',
      },
      {
        id : 'EmployeeName',
        field : "EmployeeName",
        name : 'Employee Name',
      },
      {
        id : 'ClientName',
        field : 'ClientName',
        name : 'Client Name',
      },
      {
        id : 'DOJ',
        field : 'DOJ',
        name : 'Date of Joining'
      },
      
     ]
  
     this.gridOptions = {
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
      editable : true,
      //forceFitColumns : true,
      enableAutoSizeColumns : true,
      enableAutoTooltip : true,
  
      //Row Selection
      enableCheckboxSelector : true,
      enableRowSelection : true,
      rowSelectionOptions : {
        selectActiveRow: false
      }
    }
  }

  

  bind_SearchIds(){
    this.searchedClientId = this.searchElementList.find(x => x.FieldName.toLowerCase() == '@clientid').Value;
    this.searchClientContractId = this.searchElementList.find(x => x.FieldName.toLowerCase() == '@clientcontractid').Value;
    this.searchedTeamId = this.searchElementList.find(x => x.FieldName.toLowerCase() == '@teamid').Value;

    let teamSearchELement = this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() === '@teamid')
    if(teamSearchELement.Value !== null && teamSearchELement.DropDownList !== null && teamSearchELement.DropDownList.length > 0){
      let team = teamSearchELement.DropDownList.find(x => x.Id === teamSearchELement.Value);
      if(team.OpenPayPeriodId !== undefined && team.OpenPayPeriodId !== null){
        this.teamOpenPayPeriodId = team.OpenPayPeriodId;
      }
    }


    // let PayPeriod = this.searchElementList.find(x => x.FieldName == '@payperiodId');
    // this.searchedPayperiodId = PayPeriod.Value;
  }

  // bind_importLayoutSearchElements(){
  //   let searchElementList = this.importLayout.ControlElementsList.find( x => x.FieldName == 'Product').SearchElements;

  //   let client = searchElementList.find(x => x.FieldName == '@clientId');
  //   client.Value = this.searchedClientId;
    
  //   let clientContract = searchElementList.find(x => x.FieldName == '@clientcontractId');
  //   client.Value = this.searchClientContractId;
    
  //   let team = searchElementList.find(x => x.FieldName == '@teamId');
  //   client.Value = this.searchedTeamId;
  // }

  onClickingSearchButton(event: any) {
    
    if(this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@teamid').Value === undefined 
    || this.searchConfiguration.SearchElementList.find(x => x.FieldName.toLowerCase() == '@teamid').Value === null ){
      this.alertService.showWarning("Please choose team to proceed !");
      return;
    }


    this.re_Binding_searchPanel();
    this.bind_SearchIds();
    
    this.addDataset = [];
    this.outputDataset = [];
    this.payrunDataset = [];
    this.getDatasetBasedOnActiveTab();

    this.fillHistorySearchElements();

  }

  onClickingHistorySearchButton(event : any){
    this.getProcessedHistoryDataset();
  }

  openSearch() {
    this.searchPanel = false;
  }

  re_Binding_searchPanel() {

    //if (localStorage.getItem("SearchPanel") != null) {
    this.searchPanel = true;
    //this.pageLayout.SearchConfiguration.SearchElementList = JSON.parse(localStorage.getItem("SearchPanel"));
    //console.log('search items :', JSON.parse(localStorage.getItem("SearchPanel")));
    //this.getDataset();


    this.searchObject = new searchObject();
    var clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() == "@clientid");


    clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.ClientName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);
    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() === "@clientcontractid");
    clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.ContractName =  clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)) ? clientList.DropDownList.find(z => z.Id === parseInt(clientList.Value)).Name : null);

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName.toLowerCase() === "@teamid");
    if(clientList.Value != null && clientList.Value != undefined) {
      let team = clientList.DropDownList.find(z => z.Id === clientList.Value)
      this.searchObject.TeamName = team.Name;
      this.searchObject.PayPeriodName = team.PayPeriod !== undefined && team.PayPeriod !== null ? team.PayPeriod : '';
    }
    console.log('this.searchObject', this.searchObject);
    //}
  }

  getDatasetBasedOnActiveTab(){
    if(this.activeTabName == 'Process'){
    
  
      if(this.processActiveTabName == 'PAYINPUTS' && this.outputPageLayout !== undefined && this.outputPageLayout !== null){
        this.getProcessedOutputDataset();
      }
      else{
        this.getPayrunDataset();
      }
    
    }
  }

  getDataset(){
    this.spinner = true;
    let datasource : DataSource = {
      Name : "GetCompleteEmployeeUIList",
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }
    
    let searchElementsForEmployee : SearchElement[] = [
      {
        FieldName : '@clientId',
        Value : null,
        DefaultValue : 0
      },
      {
        FieldName : '@clientcontractId',
        Value : null,
        DefaultValue : 0
      },
      {
        FieldName : '@teamId',
        Value : null,
        DefaultValue : 0
      }
    ];

    this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList , searchElementsForEmployee)


    this.pageLayoutService.getDataset(datasource ,
       searchElementsForEmployee).subscribe( data => {
      this.spinner = false;
      console.log(data);
      if(data.Status && data.dynamicObject != null && data.dynamicObject != ''){
        this.dataset = JSON.parse(data.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.dataset).then((result) => {
          result == true ? this.isNormalDSDuplicateEntry = true : this.isNormalDSDuplicateEntry = false;
        }, err => {

        })
      }
      else{
        this.alertService.showWarning("No Active Employees for the choosen client exist");
        this.dataset = null;
      }
    } , error => {
      this.alertService.showWarning("Error Occured while fetching Records");
      console.error(error);
    })
  }

  getProcessedOutputDataset() {


    let datasource : DataSource = {
      Name : 'UI_Payroll_List',
      Type : DataSourceType.SP,
      IsCoreEntity : false,
    }

    let searchElementsForOutputDataset = this.outputPageLayout.SearchConfiguration.SearchElementList;

    // this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList , searchElementsForOutputDataset);


    this.outputDataset = [];
    this.spinner = true;
    this.pageLayoutService.getDataset(this.outputPageLayout.GridConfiguration.DataSource,searchElementsForOutputDataset ).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.outputDataset = JSON.parse(dataset.dynamicObject);
        console.log(dataset);

        this.utilityService.ensureIdUniqueness(this.outputDataset).then((result) => {
          result == true ? this.isOutputDuplicateEntry = true : this.isOutputDuplicateEntry = false;
        }, err => {

        })

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

  getPayrunDataset(){
    this.spinner = true;
    let datasource : DataSource = {
      Name : "GET_PAYROLL_PAYRUNLIST",
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }

    let searchElementsForPayrunDataset = _.cloneDeep(this.searchConfiguration.SearchElementList);

    searchElementsForPayrunDataset.find(x => x.FieldName.toLowerCase() === '@payperiodid').Value = this.teamOpenPayPeriodId;


    this.pageLayoutService.getDataset(datasource ,searchElementsForPayrunDataset).subscribe( data => {
      this.spinner = false;
      console.log(data);
      if(data.Status && data.dynamicObject != null && data.dynamicObject != ''){
        this.payrunDataset = JSON.parse(data.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.payrunDataset).then((result) => {
          result == true ? this.isPayRunDuplicateEntry = true : this.isPayRunDuplicateEntry = false;
        }, err => {

        })
      }
      else{
        this.alertService.showInfo("No Payrun for the choosen client exist");
        this.payrunDataset = null;
      }
    } , error => {
      this.alertService.showWarning("Error Occured while fetching Records");
      console.error(error);
    })
  }

  getProcessedHistoryDataset(){

    let searchElementsForHistoryDataset = _.cloneDeep(this.searchConfigurationForHistroy.SearchElementList);

    this.historyDataset = [];
    this.spinner = true;
    this.pageLayoutService.getDataset(this.historyPageLayout.GridConfiguration.DataSource,
      searchElementsForHistoryDataset ).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.historyDataset = JSON.parse(dataset.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.historyDataset).then((result) => {
          result == true ? this.isHistoryDuplicateEntry = true : this.isHistoryDuplicateEntry = false;
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

  edit(data : any){
    this.isProcess = false;
    this.isAdd = false;
    this.addRowRecord = data;
    this.adhocProductForm.patchValue(data.AdhocProductForm);
    this.slider = true;
    this.isChanged = false;
  }

  onClickingAddButton(){
    this.isAdd = true;
    this.isProcess = false;
    this.slider = true;
    this.isChanged = false;
  }

  onClickingAddFromChooseEmployee(){

    if(this.selectedItems == undefined || this.selectedItems == null || this.selectedItems.length <= 0){
      this.alertService.showInfo("Please choose an employee");
      return;
    }

    if(this.selectedItems.length > 1){
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

  onConfirmingEmployeeCode(){
    let resultData : any;

    if(!this.isProcess){
      for(let row of this.addDataset){
        if(row.EmployeeCode == this.employeeCode){
          this.edit(row);
          return;
        }
      }
    }
    

    this.loadingSreenService.startLoading();
    this.getAdhocPaymentDetails(this.employeeCode).subscribe( data => {
      this.slider = true;
      this.loadingSreenService.stopLoading();
      console.log(data);
      if(data.Status && data.dynamicObject != null && data.dynamicObject != '') {
        resultData = JSON.parse(data.dynamicObject);
        console.log(resultData);

        if(resultData.ClientId != this.searchedClientId){
          this.alertService.showInfo("Employee Doesn't Belong to the searched client!");
          this.close_slider();
          return;
        }
        else if (resultData.ClientId == this.searchedClientId && resultData.ClientContractId != this.searchClientContractId){
          this.alertService.showInfo("Employee Doesn't Belong to the searched client contract!");
          this.close_slider();
          return;
        }
        else if (resultData.ClientId == this.searchedClientId && 
          resultData.ClientContractId == this.searchClientContractId 
          && resultData.TeamId != this.searchedTeamId){
          this.alertService.showInfo("Employee Doesn't Belong to the searched team!");
          this.close_slider();
          return;
        }

        if(resultData.AdhocPaymentConfiguration != undefined && resultData.AdhocPaymentConfiguration!= null &&
          resultData.AdhocPaymentConfiguration.ProductConfigurationList != null &&
          resultData.AdhocPaymentConfiguration.ProductConfigurationList.length > 0 ){
            // this.reimbursementProducts = resultData.ReimbursementConfiguration.ProductConfigurationList;
            this.addRowRecord =  resultData;

            let inProcessTimeCards = this.getInProcessTimeCards(this.addRowRecord);

            if(inProcessTimeCards != null && inProcessTimeCards.length > 0){
              this.alertService.showInfo
              ("An Adhoc Payment TimeCard is already under process for this employee. A new request can only be created after payout");
              this.close_slider();
              return;
            }

            let oldTimeCard =  this.checkForOldTimeCard(this.addRowRecord);

            if(oldTimeCard != null){
              this.alertService.showInfo("Hey , processing this timecard will overide the old timecard");
            }
        }
        else{
          // resultData.ReimbursementConfiguration = new ReimbursementConfiguration();
          // resultData.ReimbursementConfiguration.ProductConfigurationList = [];
          // this.reimbursementProducts = [];

          this.addRowRecord = null;
          this.adhocProductForm.reset();
          this.alertService.showWarning("Adhoc Configuration for the given employee not found! Please contact support!")
        }
        
      }
      else{
        this.alertService.showWarning("No data exist , please check the employee code");

      }
    } , error => {
      this.loadingSreenService.stopLoading();
      this.alertService.showWarning("Something went wrong!")
      console.error(error);
    })

    
  }

  onClickingChooseEmployeeButton(){
    $('#Download_Template').modal('show');

    this.spinner = true;
    this.getDataset();
  }

  downloadTemplate(){

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


    
    let searchElementsForDynamicProducts : SearchElement[] = [
      {
        FieldName : '@clientId',
        Value : null,
        DefaultValue : 0
      },
      {
        FieldName : '@clientContractId',
        Value : null , 
        DefaultValue : 0
      },
      {
        FieldName : '@teamId',
        Value : null , 
        DefaultValue : 0
      }
      ,
      {
        FieldName : '@employeeId',
        Value : null , 
        DefaultValue : 0
      },
      {
        FieldName : '@companyId',
        Value : this.companyId , 
        DefaultValue : 0
      },
      
    ]

    this.pageLayoutService.fillSearchElementsWithoutDropdown(this.searchConfiguration.SearchElementList , searchElementsForDynamicProducts);

    this.importLayout.ControlElementsList.forEach((x) => {
      x.FieldName == 'Product' ? x.SearchElements = searchElementsForDynamicProducts : null;
    } )

    this.loadingSreenService.startLoading();
    this.importLayoutService.getExcelTemplate(this.importLayout , this.selectedItems ).subscribe(
      data => {
        this.loadingSreenService.stopLoading();
        console.log(data);
        if(data.Status){
          let byteCharacters = atob(data.dynamicObject);
          const file = this.importLayoutService.convertByteToFile(byteCharacters);
          FileSaver.saveAs(file, "AdhocPayment" + moment(new Date()).format('DD-MM-YYYY'));
          this.modal_dismiss();
        }
        else{
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

  onUploadButtonClicked(){
    this.file = null;
    this.inputFile.nativeElement.files = null;
    this.inputFile.nativeElement.value = '';
  }

  handleFileInput(files: FileList) {

    // if(this.payPeriod.Value == null){
    //   this.alertService.showInfo("Please select pay period first");
    //   return;
    // }

    this.resultList = [];
    
    this.file = files.item(0); 
    //console.log(this.file);

    let data : any[]

    const reader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      data =  this.importLayoutService.getEntityMappedDataFromExcel(e);
      console.log("Excel Data :: " ,data);

      // if(this.importDataset == undefined || this.importDataset == null){
      //   this.importDataset = [];
      // }

      let resultData : any;
      let adhocDetailsList : any[];
      let tempDataset = [];

      let employeeCodes : any[] = [];
      for(let i = 0 ; i < data.length; ++i){
        let employeeCode = {
          "EmployeeCode" : data[i]["AdhocPayment"]["EmployeeCode"]
        }
        employeeCodes.push(employeeCode);
      }

      let datasource : DataSource = {
        Name : 'GetAdhocDetailsUsingEmployeeCodes',
        Type : DataSourceType.SP ,
        IsCoreEntity : false
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

      let searchElementsForBulk : SearchElement[] = [
        {
          FieldName : '@clientId',
          Value : null,
          DefaultValue : 0
        },
        {
          FieldName : '@clientContractId',
          Value : null , 
          DefaultValue : 0
        },
        {
          FieldName : '@teamId',
          Value : null , 
          DefaultValue : 0
        }
        ,
        {
          FieldName : '@employeeCodes',
          Value : JSON.stringify(employeeCodes) , 
          DefaultValue : "[]"
        },
        {
          FieldName : '@companyId',
          Value : this.companyId , 
          DefaultValue : 0
        },
        {
          FieldName : '@payperiodId',
          Value : 0 , 
          DefaultValue : 0
        }
      ]

      this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList , searchElementsForBulk);


      this.loadingSreenService.startLoading();
      this.pageLayoutService.getDataset(datasource , searchElementsForBulk).subscribe(result => { // ! Change to get client level configuration
        this.loadingSreenService.stopLoading();        
        console.log("Adhoc Payment Details ::" ,  result);
        if(result.Status && result.dynamicObject != null && result.dynamicObject != '') {
          resultData = JSON.parse(result.dynamicObject);
          adhocDetailsList = resultData;
          console.log(resultData);
          if(resultData[0].AdhocPaymentConfiguration != undefined && resultData[0].AdhocPaymentConfiguration!= null ){
            // this.reimbursementProducts = resultData[0].ReimbursementConfiguration.ProductConfigurationList;
            // this.reimbursementConfiguration = resultData[0].ReimbursementConfiguration;
          }
          else{
            // resultData[0].ReimbursementConfiguration = new ReimbursementConfiguration();
            // resultData[0].ReimbursementConfiguration.ProductConfigurationList = [];
            // this.reimbursementProducts = [];
  
          }

          // console.log( "Reimbursement Products ::" ,  this.reimbursementProducts);

          let id = this.addDataset == undefined || this.addDataset == null || this.addDataset.length <= 0 ? 0 : this.addDataset.length ;
          let oldRowCount = 0;

          for(let i = 0 ; i < data.length ; ++i){
            let adhocPayment = data[i]["AdhocPayment"];

            let oldrowRecord = this.addDataset.find(x => x["EmployeeCode"] == adhocPayment["EmployeeCode"])
            
            if(oldrowRecord != null){

              let product = oldrowRecord["AdhocPaymentConfiguration"]["ProductConfigurationList"]
              .find(x => x.DisplayName == adhocPayment["Product"]);
              if(product != null){
                oldrowRecord.AdhocProductForm.PayUnitValue = adhocPayment["PayUnitValue"];
                if(product.AllowToInputBillableAmount){
                  oldrowRecord.AdhocProductForm.BillUnitValue = adhocPayment["BillUnitValue"] != undefined && 
                    adhocPayment["BillUnitValue"] != null ? adhocPayment["BillUnitValue"] : adhocPayment["PayUnitValue"];
                }
                oldrowRecord.AdhocProductForm.ProductConfiguration = product;

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

            let rowRecord = adhocDetailsList.find(x => x["EmployeeCode"] == adhocPayment["EmployeeCode"])

            console.log("Row Record ::",rowRecord);
            if(rowRecord == null){
              continue;
            }

            adhocPayment["Id"] = adhocPayment["EmployeeId"];

            adhocPayment.id = id + i - oldRowCount - this.resultList.length;
            rowRecord.id = id + i - oldRowCount - this.resultList.length;

            let inProcessTimeCards = this.getInProcessTimeCards(rowRecord);

            if(inProcessTimeCards != null && inProcessTimeCards.length > 0){
              let result = {
                EmployeeName : rowRecord.EmployeeName,
                Status : false,
                ErrorMessage : "An Adhoc Time Card is already under process"
              }
              this.resultList.push(result);
              continue;
            }

            this.checkForOldTimeCard(rowRecord);

            let keys = Object.keys(adhocPayment);
            // for(let key of keys){
            //   let product = rowRecord["ReimbursementConfiguration"]["ProductConfigurationList"].find(x => x.DisplayName == key);
            //   if(product != null){
            //     product.PayableAmount = reimbursement[key];
            //     if(product.AllowToInputBillableAmount){
            //       product.BillingAmount = reimbursement[key];
            //     }
            //   }
            // }
            let product = rowRecord["AdhocPaymentConfiguration"]["ProductConfigurationList"]
            .find(x => x.DisplayName == adhocPayment["Product"]);
            console.log("Product ::" , product);
            if(product != null){
              rowRecord.AdhocProductForm.PayUnitValue = adhocPayment["PayUnitValue"];
              if(product.AllowToInputBillableAmount){
                rowRecord.AdhocProductForm.BillUnitValue = adhocPayment["BillUnitValue"] != undefined && 
                  adhocPayment["BillUnitValue"] != null ? adhocPayment["BillUnitValue"] : adhocPayment["PayUnitValue"];
              }
              rowRecord.AdhocProductForm.ProductConfiguration = product;
            }
            this.updateNewTimeCard(rowRecord);
            
            tempDataset.push(rowRecord);
            
          } 

          console.log(tempDataset);
          if(this.addDataset == undefined || this.addDataset == null || this.addDataset.length <= 0){
            this.addDataset = tempDataset;
          }
          else{
            tempDataset = tempDataset.concat(this.addDataset);
            this.addDataset = tempDataset;
          }

          this.utilityService.ensureIdUniqueness(this.addDataset).then((result) => {
            result == true ? this.isAddDuplicateEntry = true : this.isAddDuplicateEntry = false;
          }, err => {

          })
          
          console.log(this.addDataset);
          console.log("Upload Result ::" , this.resultList);
          if(this.resultList.length > 0){
            $('#popup_displayResult').modal('show');

          }
          
        }
        else{
          this.alertService.showWarning("No data exist , please check the employee code in the excel");
  
        }


      } , error => {
        this.loadingSreenService.stopLoading();
        this.alertService.showWarning("Something went wrong!");
        console.error(error);
      });

      

    }

    reader.readAsBinaryString(this.file);

  }

  getAdhocPaymentDetails(employeeCode : string){

    let resultData : any;

    let dataSource : DataSource = {
      Name : "GetAdhocDetailsUsingEmployeeCode",
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }

    let searchElements : SearchElement[] = [
      {
        FieldName : '@employeeCode',
        Value : employeeCode
      },
    ]

    return this.pageLayoutService.getDataset(dataSource,searchElements);

  }

  getInProcessTimeCards(data : any):TimeCard[]{
    let timeCardsList : TimeCard[] = data.TimeCards;

    let inProcessTimeCards = timeCardsList.filter( x=> x.Status >= 2300  && x.Status < 10000);

    return inProcessTimeCards;
  }

  checkForOldTimeCard(data : any){
    let timeCardsList : TimeCard[] = data.TimeCards;
    let oldTimeCard : TimeCard = null;

    if(timeCardsList != undefined && timeCardsList != null){
      oldTimeCard = timeCardsList.find( x=> (x.Status < 2300  || x.Status == 2349) && x.Status != 401 );
    }


    

    if(data.AdhocProductForm == undefined || data.AdhocProductForm == null){
      data.AdhocProductForm = {
        ProductConfiguration : null,
        PayUnitValue : null,
        BillUnitValue : null
      };
    }

    let newTimeCard : TimeCard;

    if(oldTimeCard !=  null){
      newTimeCard = _.cloneDeep(oldTimeCard);

      if(newTimeCard.AdhocPaymentList != undefined && newTimeCard.AdhocPaymentList != null && newTimeCard.AdhocPaymentList.length > 0){
        let adhocPayment = newTimeCard.AdhocPaymentList[0]
          let product = data.AdhocPaymentConfiguration.ProductConfigurationList.find(x => x.ProductId == adhocPayment.ProductId);
          if(product != null){
            // product.PayableAmount = expense.PayUnitValue;
            // product.BillingAmount = expense.BillUnitValue;
            data.AdhocProductForm.PayUnitValue = adhocPayment.PayUnitValue;
            data.AdhocProductForm.BillUnitValue = adhocPayment.BillUnitValue;
            data.AdhocProductForm.ProductConfiguration = product;
            if(this.slider){
              this.adhocProductForm.patchValue(_.cloneDeep(data.AdhocProductForm));
            }

          }
          else{
            adhocPayment.Modetype = UIMode.Delete;
            if(this.slider){
              this.adhocProductForm.reset();
            }
          }
        

      }

    }
    else{
      newTimeCard = new TimeCard();

      newTimeCard.Id = 0;
      newTimeCard.CompanyId = data.CompanyId;
      newTimeCard.ClientId = data.ClientId ;
      newTimeCard.ClientContractId = data.ClientContractId;
      newTimeCard.TeamId = data.TeamId;
      newTimeCard.EmployeeId = data.Id;
      newTimeCard.PersonId = data.PersonId; 
      newTimeCard.EmployeeName = data.EmployeeName;


      newTimeCard.PayCycleId = data.PayCycleId;
      newTimeCard.PayPeriodId = data.TeamOpenPayPeriodId;   
      newTimeCard.PeriodStartDate = data.PeriodStartDate;
      newTimeCard.PeriodEndDate = data.PeriodEndDate;
      newTimeCard.ProcessPeriodId = data.PayPeriodId ;
      newTimeCard.ProcessCategory = ProcessCategory.AdhocPayment

      newTimeCard.Status = 1000;
      newTimeCard.IsTaxBasedOnProof = true;
      newTimeCard.IsNewJoiner = false;
      newTimeCard.IsSalaryRevised = false;
      newTimeCard.FinancialYearId = data.FinancialYearId;
      newTimeCard.PayGroupId = data.PayGroupId;
      newTimeCard.EmploymentContractId = data.EmploymentContractId;
      newTimeCard.CostCode = data.CostCode || 0;

      newTimeCard.AdhocPaymentList = [];
    }

    data.oldTimeCard = oldTimeCard;
    data.newTimeCard = newTimeCard;

    return oldTimeCard;
  }

  save(){
    this.isChanged = false;
    
    console.log("Add , Process ::" + this.isAdd  + " " +  this.isProcess);
    console.log("Saving Form ::" , this.adhocProductForm.getRawValue());
    this.addRowRecord.AdhocProductForm = _.cloneDeep(this.adhocProductForm.getRawValue());

    if(this.isAdd){

      let id = this.addDataset == undefined || this.addDataset == null || this.addDataset.length <= 0 ? 0 : this.addDataset.length;
      this.addRowRecord.id =  id;

      this.updateNewTimeCard(this.addRowRecord);


      if( this.addDataset == undefined || this.addDataset == null ){
        this.addDataset = [];
        this.addDataset.push(this.addRowRecord)
      }
      else{
        this.addAngularGrid.gridService.addItem(this.addRowRecord , {highlightRow : false});
      }

      
      
      // this.importDataset.push(this.addRowRecord);
      console.log("adding item to dataset" , this.addRowRecord);

      console.log("Import Dataset" , this.addDataset)
      this.addRowRecord = null;
      this.slider = false;
      this.adhocProductForm.reset();

    }
    else{
      if(this.isProcess){
        this.updateNewTimeCard(this.addRowRecord);
  
        let timeCardModels : TimeCardModel[] = [
          {
            NewDetails : this.addRowRecord.newTimeCard,
            OldDetails : this.addRowRecord.oldTimeCard,
            Id : 0 ,
            customObject1 : null,
            customObject2 : null
          }
        ]
  
        this.processTimeCard(timeCardModels);
      }
      else{
        this.updateNewTimeCard(this.addRowRecord);
        this.addRowRecord = null;
        this.slider = false;  
        this.adhocProductForm.reset();
      }
    } 
    
    
  }

  updateNewTimeCard(data : any){
    let oldTimeCard : TimeCard = data.oldTimeCard;
    let newTimeCard : TimeCard = data.newTimeCard;
    let adhocPaymentList : AdhocPayment[] = newTimeCard.AdhocPaymentList;
    let product = data.AdhocProductForm.ProductConfiguration;
    let AdhocProductForm = data.AdhocProductForm;

      
    let adhocPayment : AdhocPayment = adhocPaymentList.find(x => x.ProductId == product.ProductId);
      
    if(adhocPayment != undefined && adhocPayment != null){
   
      console.log("Updating Adhoc ::" , adhocPayment);
      adhocPayment.PayUnitValue = AdhocProductForm.PayUnitValue;
      if(product.AllowToInputBillableAmount){
        adhocPayment.BillUnitValue = AdhocProductForm.BillUnitValue !== undefined && 
        AdhocProductForm.BillUnitValue != null ? AdhocProductForm.BillUnitValue : AdhocProductForm.PayUnitValue;
      }
      else{
        adhocPayment.BillUnitValue = AdhocProductForm.PayUnitValue;
      }
      adhocPayment.Modetype = UIMode.Edit;
      
      
    }
    else{
      
      let newAdhocPayment = new AdhocPayment();

      newAdhocPayment.Id = 0;
      newAdhocPayment.DisplayName = product.DisplayName;
      newAdhocPayment.Type =  AdhocPaymentType.None;
      newAdhocPayment.ProductId = product.ProductId;
      newAdhocPayment.Status = AdhocPaymentStatus.Active;
      newAdhocPayment.ProductCode = product.ProductCode;

      newAdhocPayment.PayQuantity = 1;
      newAdhocPayment.PayUnitType = PayUnitType.Amount;
      newAdhocPayment.PayUnitValue = AdhocProductForm.PayUnitValue;

      newAdhocPayment.BillQuantity = 1;
      newAdhocPayment.BillUnitType = BillUnitType.Amount;
      if(product.AllowToInputBillableAmount){
        newAdhocPayment.BillUnitValue = AdhocProductForm.BillUnitValue !== undefined && AdhocProductForm.BillUnitValue != null ? 
                        AdhocProductForm.BillUnitValue : AdhocProductForm.PayUnitValue;
      }
      else{
        newAdhocPayment.BillUnitValue = AdhocProductForm.PayUnitValue;
      }

      newAdhocPayment.Modetype = UIMode.Edit;

      console.log("Adding adhoc" , newAdhocPayment);
      
      adhocPaymentList.push(newAdhocPayment);
      
    }

    //check for old adhoc payment list
    let oldAdhocPayments : AdhocPayment[] = adhocPaymentList.filter(x => x.ProductId !== product.ProductId); 
    
    if(oldAdhocPayments != null && oldAdhocPayments.length > 0){
      for(let oldAdhocPayment of oldAdhocPayments ){
        oldAdhocPayment.Modetype = UIMode.Delete;
      }
    }

    



    console.log("Final AdhocPayment List ::" , adhocPaymentList);
    newTimeCard.AdhocPaymentList = adhocPaymentList;
  }

  processTimeCard(timeCardModels : TimeCardModel[]){
    let newTimeCardList = [];

    for(let timecard of timeCardModels){
      newTimeCardList.push(timecard.NewDetails);
    }

    console.log("TimecardMOdel ::" , timeCardModels)
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
          this.adhocProductForm.reset();
          this.isProcess = false;
          this.slider = false;
        } , error => {
          this.loadingSreenService.stopLoading();
          this.addRowRecord = null;
          this.adhocProductForm.reset();
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

  onClickingProcessButton(){
    let timeCard : TimeCard;
    let newTimeCardList = [];
    let timeCardModels : TimeCardModel[] = [];
    
    if(this.addDataset == undefined || this.addDataset == null || this.addDataset.length <= 0  ){
      this.alertService.showWarning("Please add/import employee to process!");
      return ;
    }
    for(let row of this.addDataset){
      

      let timeCardModel : TimeCardModel = new TimeCardModel();
      timeCardModel.NewDetails = row.newTimeCard;
      timeCardModel.OldDetails = row.oldTimeCard;
      timeCardModels.push(timeCardModel);
      newTimeCardList.push(row.newTimeCard)
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
        console.log("TimeCardModel string ::" , JSON.stringify(timeCardModels[0]));
        this.reimbursementService.upsertTimeCards(newTimeCardList).subscribe(data => {
          console.log(data);
          this.loadingSreenService.stopLoading();
          if(data.Status){
            this.alertService.showSuccess("Success");
            this.addDataset = [];
            // this.addDataset = [];
            // for(let row of data.dynamicObject){
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

            // this.resultList = data.dynamicObject;
            
            // if(this.resultList != undefined && this.resultList != null && this.resultList.length > 0){
            //   this.addDataset =  this.addDataset.filter(  x  => {
            //     let result =  this.resultList.find(y => (y.EmployeeId == x.EmployeeId && y.Status == false));
            //     console.log("Result ::" , result);
            //     return result !== undefined && result !== null;
            //   })
            //   console.log("Add Dataset ::" , this.addDataset);
            //   $('#popup_displayResult').modal('show');
              
            // }
            
            // this.apiGridDataset = data.dynamicObject;
            

            

            // $('#api_Grid').modal('show');
            

            // this.searchConfiguration.SearchElementList.forEach(searchElementValues => {
            //   this.searchConfigurationProcess.SearchElementList.forEach(searchElement => {
            //     if (searchElementValues.FieldName === searchElement.FieldName) {
            //       searchElement.Value = searchElementValues.Value;
            //     }
            //   })
            // })
            // this.activeTabName = 'Process';
            // this.onClickingProcessOutupSearchButton(null);
          }
        } , error => {
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

  modal_dismiss(){
    $('#Download_Template').modal('hide');

  }

  apiResult_dismiss(){
    this.searchConfiguration.SearchElementList.forEach(searchElementValues => {
      this.searchConfiguration.SearchElementList.forEach(searchElement => {
        if (searchElementValues.FieldName === searchElement.FieldName) {
          searchElement.Value = searchElementValues.Value;
        }
      })
    })
    $('#api_Grid').modal('hide');
    this.activeTabName = 'Process';
    // this.onClickingProcessOutupSearchButton(null);
    
  }

  modal_dismiss_display(){
    $('#popup_chooseCategory').modal('hide');

  }

  modal_dismiss_displayResult(){
    $('#popup_displayResult').modal('hide');

  }

  close_slider(){
    if(this.isChanged){
      this.alertService.showWarning("Please save the inputs");
    }
    console.log("Resetting form");
    this.adhocProductForm.reset();
    this.addRowRecord = null;
    this.slider = false;
    this.employeeCode = '';
  }

  close_netPaySlider(){
    this.netPaySlider = false;
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid.slickGrid; // grid object
    this.dataviewObj = angularGrid.dataView;
    
  }

  addAngularGridReady(angularGrid: AngularGridInstance){
    this.addAngularGrid = angularGrid;
    this.addGridObj = angularGrid.slickGrid; // grid object
    this.addDataviewObj = angularGrid.dataView;
  }

  outputAngularGridReady(angularGrid: AngularGridInstance){
    this.outputAngularGrid = angularGrid;
    this.outputGridObj = angularGrid.slickGrid; // grid object
    this.outputDataviewObj = angularGrid.dataView;
  }

  payrunAngularGridReady(angularGrid: AngularGridInstance){
    this.payrunAngularGrid = angularGrid;
    this.payrunGridObj = angularGrid.slickGrid; // grid object
    this.payrunDataviewObj = angularGrid.dataView;
  }

  historyAngularGridReady(angularGrid: AngularGridInstance){
    this.historyAngularGrid = angularGrid;
    this.historyGridObj = angularGrid.slickGrid; // grid object
    this.historyDataviewObj = angularGrid.dataView;
  }

  onSelectedRowsChanged(eventData, args){

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

  onOutputSelectedRowsChanged(eventData, args){
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

  onpayrunSelectedRowsChanged(eventData, args){
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

  onAddCellClicked(e, args){
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

    const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

    if(column.columnDef.id == 'edit'){
      this.edit(column.dataContext); 
    }

    
    if(column.columnDef.id == 'delete'){
      this.addAngularGrid.gridService.deleteItemById(column.dataContext["id"]);
    }
  }

  onOutputCellClicked(e, args){
    const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);

    const column = this.angularGrid.gridService.getColumnFromEventArguments(args);

    if(column.columnDef.id == 'NetPay'){
      this.onNetPay_Slider(column.dataContext); 
    }

    if(column.columnDef.id == 'edit'){
      
      let status : TimeCardStatus =  column.dataContext["StatusCode"] as number
      let canEdit : boolean =  ( status == TimeCardStatus.Initiated || 
        status == TimeCardStatus.PayrollCalculationFailed ||
        status == TimeCardStatus.InPayrollQueue || status == TimeCardStatus.PayrollCalculated || 
        status == TimeCardStatus.QcRejected
        );
      
      console.log(status , canEdit);  

      if(!canEdit){
        this.alertService.showWarning("Can't Edit record! Please check the processing status!");
        return;
      }  

      this.isAdd = false;
      this.isProcess = true;
      this.isChanged = false;
      this.employeeCode = column.dataContext["EmployeeCode"];
      // this.payPeriod.Value = this.processPayPeriod.Value;
      this.onConfirmingEmployeeCode();

      // this.router.navigate(['app/fnf/finalsettlement'], {
      //   queryParams: {
      //    "Odx": btoa(JSON.stringify(column.dataContext)),
      //   }
      // });

      
    }

  }

  onpayrunCellClicked(e , args){

    const column = this.payrunAngularGrid.gridService.getColumnFromEventArguments(args);

    if(column.columnDef.id == 'PayRunId'){
     this.onClickPayRun(column.dataContext)
    }
  }

  onClickPayRun( rowData) {

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": rowData.PayRunId,
      "ReadOnly": false
    }];
    this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')
  }


  beforeTabChange(event){
    if(event.nextId == 'Process'){
      this.getProcessedOutputDataset();
    }
    this.activeTabName = event.nextId;
    // console.log("Tab Changed" , this.activeTabName);
  }

  onChange_Processtabset(event){
    if (event.nextId == 'PAYRUN') {
      this.payrunDataset = [];
      this.getPayrunDataset();
    }
    this.processActiveTabName = event.nextId;
  }

  refreshOuputDataset(){
    this.getProcessedOutputDataset();
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

      let processTimeCardsModel : ProcessTimeCardsModel = new ProcessTimeCardsModel();
      
      processTimeCardsModel.MsgsList = this.LstProceeTimeCards;
      processTimeCardsModel.ProcessCategory = 2;

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

  void_TimeCard(){
    if(this.outputSelectedItems == undefined || this.outputSelectedItems == null || this.outputSelectedItems.length <= 0){
      this.alertService.showWarning("Please select atleast one row!");
      return;
    }

    let lstTimeCard : TimeCard[] = [];

    this.outputSelectedItems.forEach(obj => {
      let timeCard : TimeCard = new TimeCard();
      timeCard.Id = obj.TimeCardId;
      timeCard.EmployeeId = obj.EmployeeId;

      lstTimeCard.push(timeCard);
    })

    console.log("TImeCards ::", lstTimeCard);

    this.loadingSreenService.startLoading();
    this.payrollService.post_voidTimeCard(lstTimeCard).subscribe( data => {
      this.loadingSreenService.stopLoading();
      console.log("Void TIme Card Result ::" , data);
      if(data.Status){
        this.alertService.showSuccess(data.Message);
        this.getProcessedOutputDataset();
      }
      else{
        this.alertService.showWarning(data.Message);
      }

    } , error => {
      this.loadingSreenService.stopLoading();
      this.alertService.showWarning("Error occured");
    })

  }

  submitForVerification() {
    let LstSubmitForVerifcation = [];

    var currentDate = new Date();

    if(this.outputSelectedItems == undefined || this.outputSelectedItems == null || this.outputSelectedItems.length <= 0) {
      this.alertService.showInfo("At least one checkbox must be selected.");
      return;
    }

    if(this.team.Value == null){
      this.alertService.showWarning("Please choose Team first");
      return;
    }

    let teamOpenPayPeriodId = this.team.DropDownList.find(x => x.Id == this.team.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.team.DropDownList.find(x => x.Id == this.team.Value).PayPeriod;
    
    var isNotProcessedExist = [];
    isNotProcessedExist = this.outputSelectedItems.filter(a => a.StatusCode != TimeCardStatus.PayrollCalculated);

    console.log('test', isNotProcessedExist);

    if (isNotProcessedExist.length > 0) {
      this.alertService.showWarning("Only \"PayrollCalculated\" records can be submitted to qc!");
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

        var submitObject = new PayrollVerificationRequest();
        submitObject.Id = PVRId == -1 ? 0 : PVRId;
        submitObject.CompanyId = this._loginSessionDetails.Company.Id;
        submitObject.ClientContractId = this.searchClientContractId;
        submitObject.ClientId = this.searchedClientId;
        submitObject.PayPeriodId = teamOpenPayPeriodId;
        submitObject.PayPeriodName = teamOpenPayPeriod;
        submitObject.AttdanceStartDate = moment().format('YYYY-MM-DD');
        submitObject.AttdanceEndDate = moment().format('YYYY-MM-DD');
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

  onNetPay_Slider(rowRecord) {
    // if (rowRecord.NetPay > 0) {
      this.rowRecord = rowRecord;
      console.log("Row Record ::" , rowRecord );
      if (  rowRecord.Payitem == null || rowRecord.Payitem == "") {
        this.alertService.showInfo("No Pay items record found!");
        return;
      }
      // let isstringfy = function isJson(rowRecord) {
      //   try {
      //       JSON.parse(rowRecord.Payitem);
      //   } catch (e) {
      //       return false;
      //   }
      //   return true;
      // }

      this.Payitems =  JSON.parse(JSON.stringify(rowRecord.Payitem));
      this.Payitems = this.Payitems.filter(a => a.ProductTypeCode === 'Earning' || a.ProductTypeCode === 'Billing' || a.ProductTypeCode === 'Total')
      console.log('payItem', this.Payitems);

      this.netPaySlider = true;
    // }
  }

  



  async do_initiate_Sale_order(index : string){
    // console.log('selected', this.selectedItems);

    if(this.searchedClientId == null || this.searchedClientId == 0){
      this.alertService.showWarning("Please choose Client first");
      return;
    }

    if(this.searchClientContractId == null || this.searchClientContractId == 0){
      this.alertService.showWarning("Please choose client contract first");
      return;
    }

    if(this.team.Value == null){
      this.alertService.showWarning("Please choose Team first");
      return;
    }

    let teamOpenPayPeriodId = this.team.DropDownList.find(x => x.Id == this.team.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.team.DropDownList.find(x => x.Id == this.team.Value).PayPeriod;

    // if(this.searchedPayperiodId == null || this.searchedPayperiodId == 0){
    //   this.alertService.showWarning("Please choose payperiod first");
    //   return;
    // }

    let rowData = {
      "clientId" : this.searchedClientId,
      "clientcontractId" : this.searchClientContractId,
      "payperiodId" : teamOpenPayPeriodId,
      "ClientName" : this.searchObject.ClientName,
      "ContractCode" : this.clientContract.DropDownList.find(x => x.Id == this.searchClientContractId)["Code"],
      "PayPeriod" : teamOpenPayPeriod,
      "ProcessCategory" : 2

    }

    console.log("Row Data ::" , rowData);

    let modalOption: NgbModalOptions = {};

    modalOption.backdrop = 'static';
    modalOption.keyboard = false;

      if (index === "PAYINPUTS") {
        let teamIds = [];
        // this.selectedItems.forEach(element => {
        //   teamIds.push(element.teamId)
        // });
        teamIds.push(this.searchedTeamId);
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
          "Value": teamOpenPayPeriodId.toString(),
          "ReadOnly": false
        },
        {
          "InputFieldName": "",
          "OutputFieldName": "@processCategory",
          "Value": "2",
          "ReadOnly": false
        },
      ];
        console.log('rowdata', this.rowDataService);
        const modalRef = this.modalService.open(InitiateSaleOrderModalComponent, modalOption);
        modalRef.componentInstance.ParentrowDataService = JSON.stringify(this.rowDataService);
        modalRef.result.then((result) => {

          console.log('POPUP RESULT :', result);
          this.getDataset();
          this.selectedItems = []
        }).catch((error) => {
          console.log(error);
        });

        // await this.router.navigateByUrl('app/payrolltransaction/initiateSaleOrder')

      } else if (index === "PAYRUN") {
        let PayrunIds = [];
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

    let payRunModel : PayRunModel = new PayRunModel();

    let clientName = this.searchObject.ClientName;
    let clientcontractName =  this.searchObject.ContractName;
    let teamOpenPayPeriodId = this.team.DropDownList.find(x => x.Id == this.team.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.team.DropDownList.find(x => x.Id == this.team.Value).PayPeriod;
    
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
      submitObject.ClientContractId = this.searchClientContractId;
      submitObject.ClientId = this.searchedClientId;
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
      submitObject.ProcessCategory = ProcessCategory.AdhocPayment;
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

    let teamOpenPayPeriodId = this.team.DropDownList.find(x => x.Id == this.team.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.team.DropDownList.find(x => x.Id == this.team.Value).PayPeriod;

    let rowData = {
      "clientId" : this.searchedClientId,
      "clientcontractId" : this.searchClientContractId,
      "payperiodId" : teamOpenPayPeriodId,
      "ClientName" : this.searchObject.ClientName,
      "ContractCode" : this.clientContract.DropDownList.find(x => x.Id == this.searchClientContractId)["Code"],
      "PayPeriod" : teamOpenPayPeriod,
      "ProcessCategory" : 2

    }

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": PayRunId,
      "ReadOnly": false
    }];
    console.log('initiate pay urn', this.rowDataService.dataInterface);

    this.businessType == 1 ?  this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun') :  this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')

  }

  downloadPaysheet() {

    if(this.team.Value == null){
      this.alertService.showWarning("Please choose Team first");
      return;
    }

    let teamOpenPayPeriodId = this.team.DropDownList.find(x => x.Id == this.team.Value).OpenPayPeriodId;
    let teamOpenPayPeriod = this.team.DropDownList.find(x => x.Id == this.team.Value).PayPeriod;

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
      // jobj.ProcessCategory = 2;

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
        timecard.ProcessCategory = 2;
        timecard.PayPeriodId = item.PayPeriodId;
        lsttimecard.push(timecard)
      });
      this.payrollService.put_downloadPaySheet_Timecard(lsttimecard)
        .subscribe((result) => {
          console.log('PAY SHEET DOWNLOAD RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            var payperiodName = this.searchObject.PayPeriodName.substring(0, 3)
            var dynoFileName = `PAYSHEET_Adhoc_${this.searchObject.ClientName}_${this.searchObject.TeamName}_${payperiodName}`;
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

  fillHistorySearchElements(){

    if(this.searchConfiguration === undefined || this.searchConfiguration === null || this.searchConfigurationForHistroy === undefined ||
      this.searchConfigurationForHistroy === null){
        return;
      }

    this.pageLayoutService.fillSearchElements(this.searchConfiguration.SearchElementList , 
      this.searchConfigurationForHistroy.SearchElementList);

    // console.log("History Search Elements filled ::" , this.searchConfigurationForHistroy.SearchElementList);  
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

    this.excelService.exportAsExcelFile(exportExcelDate, 'Employee_PayTransaction');
  }

}


