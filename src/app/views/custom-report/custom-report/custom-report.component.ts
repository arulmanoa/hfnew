import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AngularGridInstance, Column, GridOption } from 'angular-slickgrid';
import FileSaver from 'file-saver';
import _, { find, pull } from 'lodash';
import moment from 'moment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { ReportQueueMessage } from 'src/app/_services/model/CustomReport/ReportQueueMessage';
import { ReportQueueMessageStatus } from 'src/app/_services/model/CustomReport/ReportQueueMessageStatus';
import { AlertService, DownloadService, FileUploadService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { ReportService } from 'src/app/_services/service/report.service';
import Swal from 'sweetalert2';
import { DataSourceType, InputControlType, SearchPanelType } from '../../personalised-display/enums';
import { DataSource, PageLayout, SearchConfiguration, SearchElement } from '../../personalised-display/models';

@Component({
  selector: 'app-custom-report',
  templateUrl: './custom-report.component.html',
  styleUrls: ['./custom-report.component.css']
})
export class CustomReportComponent implements OnInit {

  readonly PayPeriodSearchCriteria : string = "PayPeriod";
  readonly FromAndToPayPeriodSearchCriteria : string = "FromAndToPayPeriod";
  readonly FinancialYearSearchCriteria : string = "FinancialYear";
  readonly TrackPageLayoutCode : string = "CustomReportTrackTab";

  //General 
  spinner : boolean = false;
  trackSpinner : boolean = false;
  reportConfiguration : any;
  messageObjectAttributes : string[] = null;
  additionalSearchCriteria : string = '';
  searchText : string;
  isMailRequired : boolean = false;
  ccMailIds : any;
  CCemailMismatch: boolean = false;
  ccmailtags: string[] = [];
  @ViewChild('tagInput') tagInputRef: ElementRef;
  resultList : any[];
  showRegenerateButton : boolean = true;

  //Security Details
  _loginSessionDetails: LoginResponses;
  userId : number;
  businessType : number;
  
  //Adition Search Elements 
  payPeriodSearchElements : SearchElement[];
  fromAndToPayPeriodSearchElements : SearchElement[];
  financialYearSearchElemets : SearchElement[];

  //Search 
  searchConfiguration : SearchConfiguration;
  searchConfigurationForTrack : SearchConfiguration;
  defaultSearchElementList : SearchElement[];

  //Grid
  addColumnDefinitions : Column[];
  addGridOptions : GridOption;
  addDataset : any[];
  addAngularGrid: AngularGridInstance;
  addGridObj: any;
  addDataviewObj: any;
  addSelectedItems: any[] = [];
  dataset : any[] = [];
  showGrid : boolean = false;

  //output grid
  outputColumnDefinitions : Column[];
  outputGridOptions : GridOption;
  outputDataset : any[] = [];
  outputAngularGrid: AngularGridInstance;
  outputGridObj: any;
  outputDataviewObj: any;
  outputSelectedItems: any[] = [];

  //Tabs
  activeTabName : string = 'Add';

  //PageLayout
  pageLayout : PageLayout = null;
  trackPageLayout : PageLayout = null;

  constructor(
    private pagelayoutservice : PagelayoutService,
    private alertService : AlertService,
    private reportService : ReportService,
    private sessionService : SessionStorage,
    private fileUploadService : FileUploadService,
    private downloadService :  DownloadService,
    private loadingSreenService : LoadingScreenService
  ) { }

  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.userId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item=>item.CompanyId ==  this._loginSessionDetails.Company.Id).BusinessType;


    this.defaultSearchElementList  = [
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
        DefaultValue : 0,
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
        SendElementToGridDataSource : true,
        ReadOnly : false
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
        DefaultValue : 0,
        DisplayFieldInDataset : 'Name',
        FieldName : "@clientcontractId",
        DisplayName : 'Contract Name',
        ForeignKeyColumnNameInDataset : "Id",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@clientId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true
      } ,
      {
        DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
        DefaultValue: 0,
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
      // {
      //   DisplayName : "Employee Codes",
      //   FieldName : '@employeeCodes',
      //   DefaultValue : '[]',
      //   Value : null,
      //   DisplayFieldInDataset : 'Name',
      //   ForeignKeyColumnNameInDataset : 'Id',
      //   InputControlType : InputControlType.CommaSeparatedStrings,
      //   IsIncludedInDefaultSearch : true,
      //   TriggerSearchOnChange : false,
      //   MultipleValues : null,
      //   DropDownList : [],
      //   ParentFields : null,
      //   ParentHasValue : [],
      //   SendElementToGridDataSource : true,
      // },
      {
        DisplayName : "Report",
        FieldName : '@reportConfigurationId',
        Value : null,
        InputControlType : InputControlType.DropDown,
        DataSource : {
          Name : 'GetReportType',
          Type : DataSourceType.SP,
          IsCoreEntity : false
        },
        DropDownList : [],
        ParentFields : ["@clientId" , "@clientcontractId" , "@teamId"],
        ParentDependentReadOnly : [true , false , false],
        ParentHasValue : null,
        IsIncludedInDefaultSearch : true,
        MultipleValues : null,
        FireEventOnChange : true,
        ForeignKeyColumnNameInDataset : 'Id',
        DisplayFieldInDataset : 'Name',
        ReadOnly : false
      }
    ]

    this.payPeriodSearchElements = [
      {
        DataSource: {Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false},
        DefaultValue: "0",
        DisplayFieldInDataset: "Name",
        DisplayName: "Pay Period",
        DropDownList: [],
        FieldName: "@payperiodId",
        ForeignKeyColumnNameInDataset: "Id",
        InputControlType: 2,
        IsIncludedInDefaultSearch: true,
        MultipleValues: [],
        ParentFields: ['@clientcontractId'],
        ParentHasValue: [],
        ReadOnly: false,
        RelationalOperatorValue: null,
        RelationalOperatorsRequired: false,
        TriggerSearchOnChange: false,
        Value: null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
      },
    ]

    this.fromAndToPayPeriodSearchElements = [
      {
        DataSource: {Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false},
        DefaultValue: "0",
        DisplayFieldInDataset: "Name",
        DisplayName: "From Pay Period",
        DropDownList: [],
        FieldName: "@fromPayperiodId",
        ForeignKeyColumnNameInDataset: "Id",
        InputControlType: 2,
        IsIncludedInDefaultSearch: true,
        MultipleValues: [],
        ParentFields: [],
        ParentHasValue: [],
        ReadOnly: false,
        RelationalOperatorValue: null,
        RelationalOperatorsRequired: false,
        TriggerSearchOnChange: false,
        Value: null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
      },
      {
        DataSource: {Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false},
        DefaultValue: "0",
        DisplayFieldInDataset: "Name",
        DisplayName: "To Pay Period",
        DropDownList: [],
        FieldName: "@toPayperiodId",
        ForeignKeyColumnNameInDataset: "Id",
        InputControlType: 2,
        IsIncludedInDefaultSearch: true,
        MultipleValues: [],
        ParentFields: [],
        ParentHasValue: [],
        ReadOnly: false,
        RelationalOperatorValue: null,
        RelationalOperatorsRequired: false,
        TriggerSearchOnChange: false,
        Value: null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
      },
    ]

    this.financialYearSearchElemets = [
      {
        DataSource: {Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false},
        DefaultValue: "0",
        DisplayFieldInDataset: "Name",
        DisplayName: "Financial Year",
        DropDownList: [],
        FieldName: "@financialYearId",
        ForeignKeyColumnNameInDataset: "Id",
        InputControlType: 2,
        IsIncludedInDefaultSearch: true,
        MultipleValues: [],
        ParentFields: [],
        ParentHasValue: [],
        ReadOnly: false,
        RelationalOperatorValue: null,
        RelationalOperatorsRequired: false,
        TriggerSearchOnChange: false,
        Value: null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
      },
    ]

    this.searchConfiguration = {
      IsDataLevelSecurityRequired: true,
      SecurityKeys:[['UserId'], ['RoleId']],
      SearchElementList : _.cloneDeep(this.defaultSearchElementList),
      SearchPanelType : SearchPanelType.Panel,
      SearchButtonRequired : true,
      ClearButtonRequired : true
    }

    this.searchConfigurationForTrack = {
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
          DefaultValue : 0,
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
          DefaultValue : 0,
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
          DefaultValue: 0,
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
          DisplayName : "Employee Codes",
          FieldName : '@employeeCodes',
          DefaultValue : '[]',
          Value : null,
          DisplayFieldInDataset : 'Name',
          ForeignKeyColumnNameInDataset : 'Id',
          InputControlType : InputControlType.CommaSeparatedStrings,
          IsIncludedInDefaultSearch : true,
          TriggerSearchOnChange : false,
          MultipleValues : null,
          DropDownList : [],
          ParentFields : null,
          ParentHasValue : [],
          SendElementToGridDataSource : true,
        },
        {
          DisplayName : "Report",
          FieldName : '@reportConfigurationId',
          Value : null,
          InputControlType : InputControlType.DropDown,
          DataSource : {
            Name : 'GetTrackReportType',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          DropDownList : [],
          DefaultValue : 0,
          ParentFields : ["@clientId" , "@clientcontractId" , "@teamId"],
          ParentDependentReadOnly : [true , false , false],
          ParentHasValue : null,
          IsIncludedInDefaultSearch : true,
          MultipleValues : null,
          FireEventOnChange : true,
          ForeignKeyColumnNameInDataset : 'Id',
          DisplayFieldInDataset : 'Name',
          ReadOnly : false
        },
        {
          DisplayName : "Generated From(YYYY-MM-DD)",
          FieldName : '@generatedFromDate',
          Value : null,
          DefaultValue : '1900-01-01',
          DisplayValue : null,
          InputControlType : InputControlType.DatePicker,
          DataSource : {
            Name : 'GetReportType',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          DropDownList : [],
          ParentFields : [],
          ParentDependentReadOnly : [],
          ParentHasValue : null,
          IsIncludedInDefaultSearch : true,
          MultipleValues : null,
          FireEventOnChange : true,
          ForeignKeyColumnNameInDataset : 'ReportTypeId',
          DisplayFieldInDataset : 'Name'
        },
        {
          DisplayName : "Generated Till(YYYY-MM-DD)",
          FieldName : '@generatedToDate',
          Value : null,
          DefaultValue : '1900-01-01',
          DisplayValue : null,
          InputControlType : InputControlType.DatePicker,
          DataSource : {
            Name : 'GetReportType',
            Type : DataSourceType.SP,
            IsCoreEntity : false
          },
          DropDownList : [],
          ParentFields : [],
          ParentDependentReadOnly : [],
          ParentHasValue : null,
          IsIncludedInDefaultSearch : true,
          MultipleValues : null,
          FireEventOnChange : true,
          ForeignKeyColumnNameInDataset : 'ReportTypeId',
          DisplayFieldInDataset : 'Name'
        },
      ],
      SearchPanelType : SearchPanelType.Panel,
      SearchButtonRequired : true,
      ClearButtonRequired : true
    }

    if(this.businessType !== 3){
      this.pagelayoutservice.fillSearchElementsForSME(this.searchConfiguration.SearchElementList);
      this.pagelayoutservice.fillSearchElementsForSME(this.searchConfigurationForTrack.SearchElementList);
    }



    this.getTrackPageLayout(this.TrackPageLayoutCode);
      
  }

  getTrackPageLayout(code : string){
    this.trackSpinner = true;
    this.pagelayoutservice.getPageLayout(code).subscribe(data => {
      this.trackSpinner = false;
      if(data.Status && data.dynamicObject != null){
        this.trackPageLayout = data.dynamicObject;
        this.setGrid("output" , this.trackPageLayout );
      }
      else{
        this.trackPageLayout = null
      }
    } , error => {
      this.trackSpinner = false;
      this.trackPageLayout = null;
    })
  }

  onSearchElementValueChange(searchElement : SearchElement){
    console.log("SearchElement value changed  ::" , searchElement);
    
    if(searchElement.FieldName == '@reportConfigurationId'){
      this.addDataset = [];

      //Check For null
      if(searchElement.Value != null && searchElement.Value > 0 && searchElement.DropDownList != undefined &&
        searchElement.DropDownList != null && searchElement.DropDownList.length > 0){
        
        //Get Report Configuration from dropdown list  
        this.reportConfiguration = searchElement.DropDownList.find( x => x.Id === searchElement.Value);
        console.log("Report Configuratoin ::" , this.reportConfiguration);  

        //Get Message Object Attributes
        if(this.reportConfiguration.MessageObjectAttributes != undefined && this.reportConfiguration.MessageObjectAttributes != null &&
          this.reportConfiguration.MessageObjectAttributes.length > 0){
            this.messageObjectAttributes = this.reportConfiguration.MessageObjectAttributes;
        }
        else {
          this.messageObjectAttributes = null;
        }
        console.log("Message Object Attributes ::" , this.messageObjectAttributes);

        //Get PageLayout
        if(this.reportConfiguration.PageLayout != undefined && this.reportConfiguration.PageLayout != null){
          this.pageLayout = this.reportConfiguration.PageLayout;
          console.log("Pagelayout ::" , this.pageLayout);
        }
        else{
          this.pageLayout = null;
        }

        // Check if re generatable
        if(this.activeTabName == 'Track'){
          if(this.reportConfiguration.AllowReGenerationFromUI !== undefined &&
            this.reportConfiguration.AllowReGenerationFromUI !== null &&
            this.reportConfiguration.AllowReGenerationFromUI === true){
            this.showRegenerateButton = true;
          }
          else{
            this.showRegenerateButton = false;
          }
        }


        this.checkForAdditionalSearchCriteria(this.reportConfiguration);
      }
      else{
        this.reportConfiguration = null;
        this.messageObjectAttributes = null;
        this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.filter( x => 
          x.FieldName !== '@payperiodId' && x.FieldName !== '@fromPayperiodId' && x.FieldName !== '@toPayperiodId' && x.FieldName !== '@financialYearId' 
        );
        this.pageLayout = null;
        this.addDataset = [];
      }

    }
  

  }

  checkForAdditionalSearchCriteria(reportConfiguration : any){

    this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.filter( x => 
      x.FieldName !== '@payperiodId' && x.FieldName !== '@fromPayperiodId' && x.FieldName !== '@toPayperiodId' && x.FieldName !== '@financialYearId' 
    );

    if(reportConfiguration.AdditionalSearchCriteria != undefined && reportConfiguration.AdditionalSearchCriteria != null){
      this.additionalSearchCriteria = reportConfiguration.AdditionalSearchCriteria;

      if(this.additionalSearchCriteria == this.PayPeriodSearchCriteria){
        this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.concat(this.payPeriodSearchElements);
      }
      else if(this.additionalSearchCriteria == this.FromAndToPayPeriodSearchCriteria){

        this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.concat(this.fromAndToPayPeriodSearchElements);
      }
      else if(this.additionalSearchCriteria == this.FinancialYearSearchCriteria){

        this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.concat(this.financialYearSearchElemets);
      }

      console.log("SearchElementlist ::" , this.searchConfiguration.SearchElementList);

    }
  }  

  onClickingSearchButton(event: any) {
    $('#CanCollapse').collapse('hide');
    this.setGrid('add' , this.pageLayout);
    this.showGrid = true;
    this.getAddDataset();
    
  }

  onClickingTrackSearchButton(event : any){
    $('#TrackCollapable').collapse('hide');
    this.showGrid = true;
    this.getOutputDataset();
  }

  setGrid(tab : string , pageLayout : PageLayout){
    
    
    // let pageLayout : PageLayout = this[tab + "PageLayout"]
    this.spinner = true;
    console.log("PageLayout :: " , pageLayout )
    this[tab + "ColumnDefinitions"] = this.pagelayoutservice.setColumns(pageLayout.GridConfiguration.ColumnDefinitionList);
    this[tab + "GridOptions"] = this.pagelayoutservice.setGridOptions(pageLayout.GridConfiguration);
    this.spinner = false;
    

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

  onAddSelectedRowsChanged(eventData, args){
    this.addSelectedItems = [];

    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.addDataviewObj.getItem(row);
        this.addSelectedItems.push(row_data);
      }
    }
    console.log('answer', this.addSelectedItems);
  }

  onOutputSelectedRowsChanged(eventData, args){
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

  onAddCellClicked(e , args){
    const column = this.addAngularGrid.gridService.getColumnFromEventArguments(args);
    
    if(column.columnDef.id == 'edit'){
    }
  }

  onOutputCellClicked(e , args){
    const column = this.outputAngularGrid.gridService.getColumnFromEventArguments(args);
    
    if(column.columnDef.id == 'edit'){
    }
  }
  
  refreshOuputDataset(){
    this.getOutputDataset();
  }

  getAddDataset(){

    this.addDataset = [];
    // let searchElements = this.addPageLayout.SearchConfiguration.SearchElementList;
    // searchElements.find( x => x.FieldName == "ClientId").Value =this.searchedClientId;
    // searchElements.find( x => x.FieldName == "ClientContractId").Value =this.searchClientContractId;
    // searchElements.find( x => x.FieldName == "TeamId").Value =this.searchedTeamId;

    this.spinner = true;
    this.pagelayoutservice.getDataset(this.pageLayout.GridConfiguration.DataSource, this.searchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.addDataset = JSON.parse(dataset.dynamicObject);
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

  getOutputDataset(){
    this.outputDataset = [];
    // let searchElements = this.addPageLayout.SearchConfiguration.SearchElementList;
    // searchElements.find( x => x.FieldName == "ClientId").Value =this.searchedClientId;
    // searchElements.find( x => x.FieldName == "ClientContractId").Value =this.searchClientContractId;
    // searchElements.find( x => x.FieldName == "TeamId").Value =this.searchedTeamId;

    let dataSource : DataSource = {
      Name : '',
      Type : DataSourceType.SP,
      IsCoreEntity : false
    }

    console.log("Track Search Element::" , this.searchConfigurationForTrack.SearchElementList);

    this.trackSpinner = true;
    this.pagelayoutservice.getDataset(this.trackPageLayout.GridConfiguration.DataSource, this.searchConfigurationForTrack.SearchElementList).subscribe(dataset => {
      this.trackSpinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.outputDataset = JSON.parse(dataset.dynamicObject);
        console.log(dataset);
        //this.updateFilters();
      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.trackSpinner = false;
      console.log(error);
    })
  }

  generateReport(){
    if(this.addSelectedItems == undefined || this.addSelectedItems == null || this.addSelectedItems.length <= 0) {
      this.alertService.showInfo("Please choose one or more employee");
      return;
    }

    $('#popup_employee_confirmation').modal('show');

  }

  onEmployeeConfirmation(){
    
    this.resultList = [];
    let reportQueueMessageList : ReportQueueMessage[] = [];

    this.addSelectedItems.forEach(employee => {
      let reportQueueMsg : ReportQueueMessage = new ReportQueueMessage();
      
      reportQueueMsg.Id = 0;
      reportQueueMsg.CompanyId = employee.CompanyId;
      reportQueueMsg.ClientId = employee.ClientId;
      reportQueueMsg.ClientContractId = employee.ClientContractId;
      reportQueueMsg.TeamId = employee.TeamId;
      reportQueueMsg.EmployeeId = employee.EmployeeId;
      reportQueueMsg.Status = ReportQueueMessageStatus.Created;
      reportQueueMsg.ReportTypeId = this.reportConfiguration.ReportTypeId;
      reportQueueMsg.IsPreviewMode = false;
      reportQueueMsg.Remarks = '';
      reportQueueMsg.ErrorMessage = '';
      reportQueueMsg.CreatedBy = this.userId.toString();
      reportQueueMsg.LastUpdatedBy = this.userId.toString();
      reportQueueMsg.IsEmailRequired = this.isMailRequired;
      reportQueueMsg.CCEMailIds = _.union(this.ccmailtags).join(",");
      // reportQueueMsg.SessionDetails = this

      let messageObject  = {}; 
      let allAttributeExists : boolean = true;
      let notFoundKey : string = '';

      if(this.messageObjectAttributes != null){
        
        for(let i : number = 0 ; i < this.messageObjectAttributes.length; ++i){
          let key : string = this.messageObjectAttributes[i];
          if(!employee.hasOwnProperty(key)){
            allAttributeExists = false;
            notFoundKey = key;
            break;
          }
          messageObject[key] = employee[key];
        }

        if(allAttributeExists){
          reportQueueMsg.MessageObject = messageObject;
          reportQueueMessageList.push(reportQueueMsg);
        }
        else{
          let result = {
            EmployeeId : employee.EmployeeId,
            ErrorMessage : 'Key -> ' + notFoundKey + ' not found for this employee',
            Status : false
          }
          this.resultList.push(result);
        }
        
      }
      else{
        reportQueueMsg.MessageObject = {};
        reportQueueMessageList.push(reportQueueMsg);
      }
      

      
      
    })

    this.postReportQueueMessage(reportQueueMessageList);
    

  }

  postReportQueueMessage(reportQueueMessageList : ReportQueueMessage[]){
    console.log("Report Msg Lst ::" , reportQueueMessageList);
    console.log(JSON.stringify(reportQueueMessageList));

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
        this.reportService.BulkInsertReportQueueMessage(reportQueueMessageList).subscribe( result => {
          
          this.loadingSreenService.stopLoading();
          if(result.Status){
            this.alertService.showSuccess("Uploaded Successfully");
            this.modal_dismiss();

            if(result.Result != undefined &&  result.Result != null){
              
              result.Result.forEach(x => {
                let employee =  this.addDataset.find(employee => (employee.EmployeeId == x.EmployeeId));
                if(employee != undefined && employee != null){
                  x.EmployeeName = employee.EmployeeName;
                  x.EmployeeCode = employee.EmployeeCode;
                }
                if(x.ErrorMessage != null && x.ErrorMessage != ''){
                  x.QueueStatus = x.Status;
                  x.Status = false;
                }
                else{
                  x.Status = true;
                }
              })
            }

            this.resultList = this.resultList.concat(result.Result);


            this.addDataset =  this.addDataset.filter(  x  => {
              let result =  this.resultList.find(y => (y.EmployeeId == x.EmployeeId && y.Status == false));
              console.log("Result ::" , result);
              return result !== undefined && result !== null;
            })
            console.log("Add Dataset ::" , this.addDataset);

            $('#popup_displayResult').modal('show');
            
          }
          else{
            this.alertService.showWarning(result.Message);
            console.log("Api Response::" , result);

            this.modal_dismiss();

            if(result.Result != undefined &&  result.Result != null){
              result.Result.forEach(x => {
                let employee =  this.addDataset.find(employee => (employee.EmployeeId == x.EmployeeId));
                if(employee != undefined && employee != null){
                  x.EmployeeName = employee.EmployeeName;
                  x.EmployeeCode = employee.EmployeeCode;
                }
                if(x.ErrorMessage != null && x.ErrorMessage != ''){
                  x.QueueStatus = x.Status;
                  x.Status = false;
                }
                else{
                  x.Status = true;
                }
              })
            }

            this.resultList = this.resultList.concat(result.Result);

            console.log("Result List ::" , this.resultList);

            this.addDataset =  this.addDataset.filter(  (x)  => {
              let result =  this.resultList.find(y => (y.EmployeeId == x.EmployeeId && y.Status == false));
              console.log("Result ::" , result);
              return result !== undefined && result !== null;
            })
            console.log("Add Dataset ::" , this.addDataset);

            $('#popup_displayResult').modal('show');

          }
        } , error => {
          this.loadingSreenService.stopLoading();
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

  pushReportMsgToQueue(reportQueueMessageList : ReportQueueMessage[]){
    console.log("Report Msg Lst ::" , reportQueueMessageList);
    // console.log(JSON.stringify(reportQueueMessageList));

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
        this.reportService.PushReportMessagesToQueue(reportQueueMessageList).subscribe( result => {
          
          this.loadingSreenService.stopLoading();
          if(result.Status){
            this.alertService.showSuccess("Uploaded Successfully");

            if(result.Result != undefined &&  result.Result != null){
              
              result.Result.forEach(x => {
                let employee =  this.outputDataset.find(employee => (employee.EmployeeId == x.EmployeeId));
                if(employee != undefined && employee != null){
                  x.EmployeeName = employee.EmployeeName;
                  x.EmployeeCode = employee.EmployeeCode;
                }
                if(x.ErrorMessage != null && x.ErrorMessage != ''){
                  x.QueueStatus = x.Status;
                  x.Status = false;
                }
                else{
                  x.Status = true;
                }
              })
            }

            this.resultList = this.resultList.concat(result.Result);

            $('#popup_displayResult').modal('show');
            
          }
          else{
            this.alertService.showWarning(result.Message);
            console.log("Api Response::" , result);

            this.modal_dismiss();

            if(result.Result != undefined &&  result.Result != null){
              result.Result.forEach(x => {
                let employee =  this.outputDataset.find(employee => (employee.EmployeeId == x.EmployeeId));
                if(employee != undefined && employee != null){
                  x.EmployeeName = employee.EmployeeName;
                  x.EmployeeCode = employee.EmployeeCode;
                }
                if(x.ErrorMessage != null && x.ErrorMessage != ''){
                  x.QueueStatus = x.Status;
                  x.Status = false;
                }
                else{
                  x.Status = true;
                }
              })
            }

            this.resultList = this.resultList.concat(result.Result);

            console.log("Result List ::" , this.resultList);

            // this.addDataset =  this.addDataset.filter(  (x)  => {
            //   let result =  this.resultList.find(y => (y.EmployeeId == x.EmployeeId && y.Status == false));
            //   console.log("Result ::" , result);
            //   return result !== undefined && result !== null;
            // })
            // console.log("Add Dataset ::" , this.addDataset);

            $('#popup_displayResult').modal('show');

          }
        } , error => {
          this.loadingSreenService.stopLoading();
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
  

  downloadReport(){
    if(this.outputSelectedItems == undefined || this.outputSelectedItems == null || this.outputSelectedItems.length <= 0){
      this.alertService.showInfo("Please select a record");
      return;
    }

    // if(this.outputSelectedItems.length > 1){
    //   this.alertService.showInfo("Please select only one record");
    //   return;
    // }

    let canDownload : boolean = true;
    this.outputSelectedItems.forEach(row => {
      if(row.Status !== 4)
        canDownload = false;
    })

    if(!canDownload){
      this.alertService.showInfo("Documents can be only downloaded for records with status success");
      return;
    }


    let documentIds : number[] = [];

    for(let row of this.outputSelectedItems)  {
      if(row.DocumentIds != undefined && row.DocumentIds != null){
        documentIds = documentIds.concat(row.DocumentIds);
      }

    }

    console.log("Document Ids ::" , documentIds);

    this.downloadService.downloadFilesInZip(documentIds , "Custom_Reports");

    // for(let documentId of documentIds){
    //   this.loadingSreenService.startLoading();
    //   this.fileUploadService.getObjectStorage(documentId).subscribe(data => {
    //     console.log('Document Data ::' , data);
    //     this.loadingSreenService.startLoading();
    //     if (data.Status == false || data.Result == null || data.Result == undefined) {
    //       return;
    //     }

    //     let file = null;
    //     var objDtls = data.Result;
    //     var contentType =  this.fileUploadService.getContentType(objDtls.ObjectName);
        
    //     // const byteArray = atob(objDtls.Content);
    //     // const blob = new Blob([byteArray], { type: contentType });
    //     // file = new File([blob], objDtls.ObjectName, {
    //     //   type: contentType,
    //     //   lastModified: Date.now()
    //     // });

    //     // // saveAs(file);
    //     // FileSaver.saveAs(blob, objDtls.ObjectName);

    //     this.base64ToBlob(objDtls.Content , contentType , objDtls.ObjectName);
    //     this.loadingSreenService.stopLoading();

    //   } , error => {
    //     this.alertService.showWarning("Unknown Error Occured");
    //     this.loadingSreenService.stopLoading();
    //     console.error(error);
    //   })



    //   // this.loadingSreenService.startLoading();
    //   // this.fileUploadService.downloadObjectAsBlob(documentId)
    //   //   .subscribe(res => {
    //   //     if (res == null || res == undefined) {
    //   //       this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
    //   //       return;
    //   //     }
    //   //     console.log('res', res);
    //   //     // saveAs(file, dynoFileName + new Date().getTime());
    //   //     saveAs(res);
    //   //     this.loadingSreenService.stopLoading();
    //   //   });

    // }  
    
  }

  do_process_Record(){
    let reportQueueMessageList : ReportQueueMessage[] = [];

    if(this.outputSelectedItems === undefined || this.outputSelectedItems === null || this.outputSelectedItems.length <= 0){
      this.alertService.showWarning("Please select atleast one record to process");
      return;
    }

    this.outputSelectedItems.forEach(report => {
      let reportQueueMsg : ReportQueueMessage = _.cloneDeep(report);

      reportQueueMsg.MessageObject = reportQueueMsg.MessageObject !== undefined && reportQueueMsg.MessageObject !== null ?
         JSON.parse(reportQueueMsg.MessageObject) : {} ;
      
      reportQueueMsg.Result = reportQueueMsg.Result !== undefined && reportQueueMsg.Result !== null && reportQueueMsg.Result !== '' ?
      JSON.parse(reportQueueMsg.Result) : {} ;   

      reportQueueMessageList.push(reportQueueMsg);
    });

    this.resultList = [];
    this.pushReportMsgToQueue(reportQueueMessageList);

  }


  public base64ToBlob(b64Data, contentType : string , dynoFileName : string, sliceSize = 512) {
    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);
      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    const file = new Blob(byteArrays, { type: contentType });
    FileSaver.saveAs(file, dynoFileName);
    return new Blob(byteArrays, { type: contentType });
  }

  onchangeCC(event) {

    let tag = event.target.value;
    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      this.CCemailMismatch = false;
      if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
        tag = tag.slice(0, -1);
      }
      if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
        this.ccmailtags.push(tag);
        event.target.value = null;
      }
    } else {
      this.CCemailMismatch = true;
    }
  }

  addTag(tag: any): void {
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
        }
      } else {
        this.CCemailMismatch = true;
      }
      // return matches ? null : { 'invalidEmail': true };
    } else {

      return null;
    }


  }


  removeTag(tag?: string): void {
    if (!!tag) {
      pull(this.ccmailtags, tag); // lodash 
    } else {
      this.ccmailtags.splice(-1);
    }
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent): void {
    this.CCemailMismatch = false;
    const inputValue: string = this.ccMailIds;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue);
        this.ccMailIds = '';
      }
    }
  }


  modal_dismiss(){
    $('#popup_employee_confirmation').modal('hide');

  }

  modal_dismiss_displayResult(){
    $('#popup_displayResult').modal('hide');

  }

  beforeTabChange(event){


    if(event.nextId == 'Add'){
      
      this.searchConfigurationForTrack.SearchElementList.forEach(currentSearchElement => {
        this.searchConfiguration.SearchElementList.forEach(newSearchElement => {
          if (currentSearchElement.FieldName === newSearchElement.FieldName  && newSearchElement.Value == null ) {
            newSearchElement.Value = currentSearchElement.Value;
            // searchElement.ReadOnly = currentSearchElement.ReadOnly;
          }
        })
      })

      if(this.addDataset == undefined || this.addDataset == null || this.addDataset.length <=0){
        this.addDataset = [];
        // this.getAddDataset();
      }
    }
    else if(event.nextId == 'Track'){
      console.log("Filling search values");
      this.searchConfiguration.SearchElementList.forEach(currentSearchElement => {
        this.searchConfigurationForTrack.SearchElementList.forEach(newSearchElement => {
          if (currentSearchElement.FieldName === newSearchElement.FieldName && newSearchElement.Value == null) {
            newSearchElement.Value = currentSearchElement.Value;
            // searchElement.ReadOnly = currentSearchElement.ReadOnly;
          }
        })
      })

      if(this.trackPageLayout != null){
        // this.getOutputDataset();
      }
    }
    this.activeTabName = event.nextId;
  }

  
}
