import { DownloadService } from '../../../_services/service/download.service';
import { HeaderService } from 'src/app/_services/service/header.service';
import { InputControlType, SearchPanelType, DataSourceType, RowSelectionType } from '../../personalised-display/enums';

import { Component, OnInit } from '@angular/core';
import { GridConfiguration, PageLayout, SearchElementValues, ColumnDefinition } from '../../personalised-display/models'
import { Column, GridOption, AngularGridInstance, Aggregators, Grouping, GroupTotalFormatters, Formatters, Formatter, GridService, FieldType, Filters } from 'angular-slickgrid';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as _ from 'lodash';

// POPUP MODAL 
import { DownloadBillingSheetModalComponent } from 'src/app/shared/modals/payroll/download-billing-sheet-modal/download-billing-sheet-modal.component';
import { SaleorderSummaryModalComponent } from 'src/app/shared/modals/payroll/saleorder-summary-modal/saleorder-summary-modal.component';
import { PayrollImportdataComponent } from 'src/app/shared/modals/payroll/payroll-importdata/payroll-importdata.component';

// SERVICES
import { PayrollService } from '../../../_services/service/payroll.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { RowDataService } from '../../personalised-display/row-data.service';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';

// MODEL CLASS (INTERFACE)
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { PVRStatus, PayrollVerificationRequestDetails, PayrollVerificationRequest, SubmittionForVerification } from '../../../_services/model/Payroll/PayrollVerificationRequest';
import { apiResult } from '../../../_services/model/apiResult';
import { GeneratePIS } from '../../../_services/model/Payroll/generatePIS';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { PayrollModel, _PayrollModel } from '../../../_services/model/Payroll/ParollModel';
import { element } from '@angular/core/src/render3';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { PayOutStatus } from 'src/app/_services/model/Payroll/PayOut';
import { searchObject, _searchObject } from 'src/app/_services/model/Common/SearchObject';
import { InitiateSaleOrderModalComponent } from 'src/app/shared/modals/payroll/initiate-sale-order-modal/initiate-sale-order-modal.component';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { RemarksModalComponent } from 'src/app/shared/modals/remarks-modal/remarks-modal.component';
import { PayrollhistorylogModalComponent } from 'src/app/shared/modals/payroll/payrollhistorylog-modal/payrollhistorylog-modal.component';
import { UtilityService } from 'src/app/_services/service/utitlity.service';


@Component({
  selector: 'app-salarytransaction',
  templateUrl: './salarytransaction.component.html',
  styleUrls: ['./salarytransaction.component.css']
})
export class SalarytransactionComponent implements OnInit {

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;

  //GENERAL - PAGELAYOUT CONFIGURATIONS - SLICKGRID
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  spinner: boolean;
  spinner2: boolean = true;
  loadingSpinner: boolean = false;
  //GROUPING 
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  draggableGroupingPlugin: any;
  //BASIC SLICKGRID STUFF
  dataset: any;
  columnDefinition: Column[];
  gridOptions: GridOption;

  dataset_payrun: any;
  columnDefinition_payrun: Column[];
  gridOptions_payrun: GridOption;

  dataset_payout: any;
  columnDefinition_payout: Column[];
  gridOptions_payout: GridOption;

  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };
  previewFormatter: Formatter;
  approveFormatter: Formatter;
  rejectFormatter: Formatter;
  hyperlinkFormatter: Formatter;
  modalOption: NgbModalOptions = {};

  // COMMON PROPERTIES
  selectedItems: any[];
  BehaviourObject_Data: any;

  // PAYROLL INPUTS LISTING SCREEN - GENERATE PIS BUTTON ACTION PROPERTY
  LstGeneratePIS: any[];
  payrollModel: PayrollModel = new PayrollModel();

  code_for_pay: string; // PAGE ROUTING CODE (USER INPUTS FROM CONFIG JSON) - THIS IS USED TO HOW THE COMPONENT IS FORMED
  activeTabName: string;

  searchObject: searchObject
  searchPanel: boolean = false;
  PayTransaction: string = 'PayTransaction';

  // FOR PAY RUN TAB SET
  inEmployeesGridInstance: AngularGridInstance;
  inEmployeesGrid: any;
  inEmployeesGridService: GridService;
  inEmployeesDataView: any;
  inEmployeesColumnDefinitions: Column[];
  inEmployeesGridOptions: GridOption;
  inEmployeesDataset: any;
  inEmployeesList = [];
  inEmployeesSelectedItems = [];
  PVRIds_Modal: any;
  TeamName_Modal: any;
  isRejectedChkbox: boolean = true;
  isProcessedChkbox: boolean = true;
  isAlertPIS: boolean = true;
  isAlertPIS1: boolean = false;
  OverAllRemarks: any;
  visible = false;
  isValidForSubmit: boolean = true;
  lstEmpForSubmitQC = [];

  lengendForStatus = [];
  //  SME COnfigurations
  isEnableForSME_SubmitQC : boolean = true;
  isEnableForSME_EmpForPayrun : boolean  = true;
  BusinessType: any;
  isPayInputsDuplicateEntry : boolean = false;
  isPayRunDuplicateEntry : boolean = false;
  isPayOutDuplicateEntry : boolean = false;
  isBtnDisabledRequired: boolean = false;
  constructor(

    private headerService: HeaderService,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router,
    private modalService: NgbModal,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private payrollService: PayrollService,
    public sessionService: SessionStorage,
    public downloadService: DownloadService,
    public utilsHelper: enumHelper,
    private utilityService : UtilityService


  ) { }

  openSearch() {
    sessionStorage.removeItem('SearchPanel');
    this.searchPanel = false;
  }

  /* #region  ON INIT - TO SUBSCRIBE AND PRE DEFINED PROPERTY VALUES */
  ngOnInit() {
    this.titleService.setTitle('Loading...');
    this.headerService.setTitle('Salary Transaction');

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item=>item.CompanyId ==  this.sessionDetails.Company.Id).BusinessType;
    // this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item=>item.CompanyId ==  1).BusinessType;

    this.searchPanel = this.BusinessType == 1 ? true : this.BusinessType == 2 ? true : false;

    this.PayTransaction = this.BusinessType == 1 ? "SME" : this.BusinessType == 2 ? "OutSource" : "PayTransaction"
    this.selectedItems = [];
    this.isEnableForSME_SubmitQC = this.BusinessType == 3 ? true : false; // coming from access control temp control 
    this.isEnableForSME_EmpForPayrun = this.BusinessType == 3 ? true : true; // coming from access control temp control 

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    this.route.paramMap.subscribe((params: ParamMap) => {
      this.code_for_pay = params.get('code')
    })
    this.inEmployeesList = [];
    this.inEmployeesSelectedItems = [];

    this.getPageLayout(this.code_for_pay);
    this.gridCustomButtons(); // for slick grid table custom buttons link 
    this.loadinEmployeesRecords();
    this.activeTabName = 'PAYINPUTS';
  }
  /* #endregion */

  /* #region  SLICK GRID AND SEARCH ELEMENT LAYOUT RESPONSE FROM WEB API USING CODE */
  gridCustomButtons() {
    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-download m-r-xs" title="Download PIS" style="cursor:pointer"></i> ` : '<i class="mdi mdi-download" style="cursor:pointer"></i>';
    this.approveFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
     class="mdi mdi-checkbox-multiple-marked-outline m-r-xs"></i> Approve </button>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';
    this.rejectFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? ` <button  class="btn btn-default btn-sm" style="padding: 2px 12px; font-size: 11px; border: 1px solid #d8d9dd;"><i
    class="mdi mdi-close-box-outline m-r-xs"></i> Reject </button>` : '<i class="mdi mdi-close-box-outline" style="cursor:pointer"></i>';
    this.hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value != null && value != -1 ? '<a href="javascript:;">' + value + '</a> ' : '---';
  }

  getPageLayout(code) {

    sessionStorage.removeItem("PVRIds");
    this.dataset = [];
    this.pageLayout = null;
    this.spinner = true;
    this.titleService.setTitle('Loading...');
    this.headerService.setTitle('Loading...');
    this.pageLayoutService.getPageLayout(code).subscribe(data => {
      if (data.Status === true && data.dynamicObject != null) {
        this.pageLayout = data.dynamicObject;
        console.log(this.pageLayout);
        console.log("Search Panel ::" , JSON.parse(sessionStorage.getItem("SearchPanel")));
        if(this.BusinessType != 3){
          this.spinner = false;
        } 
        this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
        this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
        this.setGridConfiguration();
        this.dataset = [];
        this.re_Binding_searchPanel();
        this.route.data.subscribe(data => {

          if ((!_.isEmpty(data)) && data.DataInterface.SearchElementValuesList !== null && data.DataInterface.SearchElementValuesList.length > 0) {

            this.BehaviourObject_Data = data.DataInterface.RowData;
            data.DataInterface.SearchElementValuesList.forEach(searchElementValues => {
              this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
                if (searchElementValues.OutputFieldName === searchElement.FieldName) {
                  searchElement.Value = searchElementValues.Value;
                  searchElement.ReadOnly = searchElementValues.ReadOnly;
                }
              })
            })
            this.rowDataService.dataInterface = {
              SearchElementValuesList: [],
              RowData: null
            }
            this.getDataset();
          }
          else if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
        }, error => {

          console.log(error)
        })

      

      }
      else {
        this.titleService.setTitle('Get started on HRSuite');
        this.spinner = false;

      }

    }, error => {
      console.log(error);
      this.spinner = false;
      this.titleService.setTitle('Get started on HRSuite');
    }
    );
  }


  setGridConfiguration() {
    // this.columnDefinition = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
  //   for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
  //     if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id !== 'edit') {
  //       // this.tempColumn.formatter = this.hyperlinkFormatter;
  //     }
  // }
  const CD = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
  (this.code_for_pay == 'salaryTransaction' || this.code_for_pay == 'salaryTransactions') ? this.columnDefinition = CD :
    (this.code_for_pay == 'payrun' || this.code_for_pay == 'payruns') ? this.columnDefinition_payrun = CD :
      (this.code_for_pay == 'payout' || this.code_for_pay == 'payouts') ? this.columnDefinition_payout = CD : null


    this.gridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.gridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      deleteIconCssClass: 'fa fa-times',
      onGroupChanged: (e, args) => this.onGroupChange(),
      onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }
  }

  // API CALLS USING TABLE ROUTING AND SEARCHELEMENTS IF NEEDED
  getDataset() {
    this.selectedItems = [];
    this.dataset = [];
    this.dataset_payrun = [];
    this.dataset_payout = [];

    this.spinner = true;
    
    //To send processCategory to Payrun
    let searchElements = _.cloneDeep(this.pageLayout.SearchConfiguration.SearchElementList);
    if(this.code_for_pay == 'payrun' && 
      searchElements.find( x => x.FieldName == '@processCategory') == null){
      searchElements.push({
        FieldName : '@processCategory',
        Value : 1
      })
    }

    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, searchElements).subscribe(dataset => {
      this.isBtnDisabledRequired = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        const response = JSON.parse(dataset.dynamicObject);
       
        (this.code_for_pay == 'salaryTransaction' || this.code_for_pay == 'salaryTransactions') ? this.dataset = response :
          (this.code_for_pay == 'payrun' || this.code_for_pay == 'payruns') ? this.dataset_payrun = response :
            (this.code_for_pay == 'payout' || this.code_for_pay == 'payouts') ? this.dataset_payout = response : []

        if (this.code_for_pay == 'salaryTransaction' || this.code_for_pay == 'salaryTransactions') {
          const lengendForStatus = (this.dataset.filter(a => a.Id == -1)) as any;
          this.lengendForStatus = (lengendForStatus);

        }
        if (this.code_for_pay == 'salaryTransaction' || this.code_for_pay == 'salaryTransactions') {
          this.dataset = this.dataset.filter(a => a.Id != -1) as any;
        }

        if ((this.code_for_pay == 'payout' || this.code_for_pay == 'payouts')) {
          let LstPayOutStatus = this.utilsHelper.transform(PayOutStatus) as any;
          this.dataset_payout.forEach(element => {
            element["Status"] = element.Status == 0 ? "In-Active" : "Active";
            if (this.code_for_pay == "payout" || this.code_for_pay == "payouts") { element["StatusCode"] = LstPayOutStatus.find(a => a.id === element.StatusCode).name }
          });
        }
        // duplicate check 
        // this.dataset_payrun = this.dataset_payrun.concat(this.dataset_payrun);
        // this.dataset_payout = this.dataset_payout.concat(this.dataset_payout);

        var arrayObject : any[] = [];
        arrayObject =  (this.code_for_pay == 'salaryTransaction' || this.code_for_pay == 'salaryTransactions') ? this.dataset : 
        (this.code_for_pay == 'payrun' || this.code_for_pay == 'payruns') ? this.dataset_payrun :
        (this.code_for_pay == 'payout' || this.code_for_pay == 'payouts') ? this.dataset_payout : [];

        this.utilityService.ensureIdUniqueness(arrayObject).then((result) => {
          (this.code_for_pay == 'salaryTransaction' || this.code_for_pay == 'salaryTransactions') ?  (this.isPayInputsDuplicateEntry = result == true ? true : false) :
          (this.code_for_pay == 'payrun' || this.code_for_pay == 'payruns') ?  (this.isPayRunDuplicateEntry = result == true ? true : false) :
          (this.code_for_pay == 'payout' || this.code_for_pay == 'payouts') ? (this.isPayOutDuplicateEntry = result == true ? true : false) : null;
        }, err => {

        })


        this.spinner = false;

      }
      else {
        this.spinner = false;
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }
  // PARENT AND CHILD COMPONENT - DATA TRANSACTION
  resetSearchObject() {
    this.searchObject.ClientName = null;
    this.searchObject.ContractName = null;
    this.searchObject.PayPeriodName = null;
    this.searchObject.TeamName = null;
    this.searchObject = undefined;
  }

  onClickingSearchButton(event: any) {
    this.isBtnDisabledRequired = true;
    console.log('event', event);
    
    this.searchPanel = true;
    //  this.resetSearchObject();
    //  this.searchObject.ClientName = null;
    //  this.searchObject.ContractName = null;
    //  this.searchObject.PayPeriodName = null;
    //  this.searchObject.TeamName = null;
    this.searchObject = _searchObject;
    sessionStorage.removeItem('SearchPanel');
    console.log('FIRST TIME SEARCH ::', this.pageLayout.SearchConfiguration.SearchElementList);
    this.pageLayout.SearchConfiguration.SearchElementList = _.cloneDeep(event);
    console.log('SECOND TIME SEARCH ::', this.pageLayout.SearchConfiguration.SearchElementList);
    this.pageLayout != null && this.pageLayout.SearchConfiguration.SearchElementList.length > 0  && sessionStorage.setItem("SearchPanel", JSON.stringify(this.pageLayout.SearchConfiguration.SearchElementList));
    this.re_Binding_searchPanel();
    this.getDataset();
  }
  isCloseContent(event) {
    if (sessionStorage.getItem("SearchPanel") == null) {
      this.searchObject = undefined;
      this.searchObject = _searchObject;
    }
    this.searchPanel = true;
    this.getDataset();
  }

  re_Binding_searchPanel() {
    // console.log('loca', sessionStorage.getItem("SearchPanel"));

    if (sessionStorage.getItem("SearchPanel") != null) {
      this.searchPanel = true;
      this.pageLayout.SearchConfiguration.SearchElementList = JSON.parse(sessionStorage.getItem("SearchPanel"));
      console.log('search items :', JSON.parse(sessionStorage.getItem("SearchPanel")));
      this.getDataset();

      // this.resetSearchObject();
      // this.searchObject.ClientName = null;
      // this.searchObject.ContractName = null;
      // this.searchObject.PayPeriodName = null;
      // this.searchObject.TeamName = null;
      this.searchObject = _searchObject;
      var clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId");
      // this.searchObject.ClientName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name;
      // clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId");
      // this.searchObject.ContractName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name;
      // clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId");
      // this.searchObject.PayPeriodName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name;
      // clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@teamId");
      // clientList.Value != null && clientList.Value != undefined && (this.searchObject.TeamName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name);
      // console.log('this.searchObject', this.searchObject);

      clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.ClientName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);
      clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId");
      clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.ContractName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name);
      clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId");
      clientList.DropDownList != null &&  clientList.DropDownList.length > 0 && ( this.searchObject.PayPeriodName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name);
      clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@teamId");
      console.log('clientList', clientList); 
      clientList.Value == null  ? this.searchObject.TeamName = null : null;
      clientList.Value != null && clientList.Value != undefined && (this.searchObject.TeamName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name);
      console.log('this.searchObject', this.searchObject);
    }
  }
  /* #endregion */

  /* #region  SLICK GRID EXTRA PROPERTIES */
  // SLICK GRID EXTRA PROPERTIES LIKE - FEATURES BEGIN
  onGroupChange() {
    if (!this.pageLayout.GridConfiguration.IsPaginationRequired && this.gridObj)
      this.updateFooter(this.gridObj);
  }
  showPreHeader() {
    this.gridObj.setPreHeaderPanelVisibility(true);
  }
  clearGrouping() {
    if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups) {
      this.draggableGroupingPlugin.clearDroppedGroups();
    }
  }
  gridChange() {
    console.log("cell changed");
    if (this.gridObj && this.gridObj.setOptions) {
      this.gridObj.setOptions({
        frozenRow: this.pageLayout.GridConfiguration.PinnedRowCount,
        frozenColumn: this.pageLayout.GridConfiguration.PinnedColumnCount,
        frozenBottom: this.pageLayout.GridConfiguration.PinRowFromBottom,
      })
    }
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
      if (this.draggableGroupingPlugin && this.draggableGroupingPlugin.setDroppedGroups && this.pageLayout.GridConfiguration.DefaultGroupingFields) {
        this.draggableGroupingPlugin.setDroppedGroups(this.pageLayout.GridConfiguration.DefaultGroupingFields);
        this.gridObj.invalidate();
        this.gridObj.render();
      }

      if (!this.pageLayout.GridConfiguration.IsPaginationRequired)
        this.updateFooter(this.gridObj);
    }
    if (this.pageLayout.GridConfiguration.DisplayFilterByDefault) {
      this.gridObj.setHeaderRowVisibility(true);
    }
  }

  onSelectedRowsChanged(eventData, args) {

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.dataviewObj.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('answer', this.selectedItems);
    if (this.code_for_pay === 'salaryTransaction') {
      this.selectedItems.length == 0 ? this.isValidForSubmit = true : this.checkKey();
    }
  }
  checkKey() {
    return this.isValidForSubmit = _.findIndex(this.selectedItems, function (o) { return o.PVRId !== -1; }) === -1 ? false : true;
  }
  onCellClicked(e, args) {
    var iskeyValue: boolean = false;
    const column = this.angularGrid.gridService.getColumnFromEventArguments(args);
    if (column.dataContext.hasOwnProperty("PVRId")) {
      var value = column.dataContext['PVRId'];
      if (value > 0) {

        iskeyValue = true;
      }
    }

    var flag = false;
    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      //console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
      if (column.columnDef.id === this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id) {
        console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
        flag = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable;
        if (flag) {
          if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName !== null
            && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName !== '') {
            this.executeFunction(this.pageLayout.GridConfiguration.ColumnDefinitionList[i], column.dataContext, column)
          }
          else if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink !== null
            && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink !== '') {

            if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
              this.rowDataService.dataInterface.RowData = column.dataContext;
              if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
                this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(searchElementValue => {
                  searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
                }
                )
                this.rowDataService.dataInterface.SearchElementValuesList = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
              }
            }
            else {
              this.rowDataService.dataInterface.RowData = null;
              this.rowDataService.dataInterface.SearchElementValuesList = [];
            }

            if (iskeyValue && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && this.code_for_pay == 'salaryTransaction') {
              this.rowDataService.dataInterface.RowData.PVRId = -1;
              this.rowDataService.dataInterface.SearchElementValuesList.forEach(e => {
                if (e.OutputFieldName == '@PVRId') {
                  e.Value = 0 as any;
                }
              });
            }

            sessionStorage.removeItem("RowDataInterface");
            sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));

            // if (iskeyValue && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && this.code_for_pay == "salaryTransaction") {
            //   // this.alertService.showWarning("You do not have permission to access this link.")
            //   // return;
            // }

            this.router.navigate([this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink])

          }
        }
        break;
      }
    }

  }

  updateFooter(gridObj) {
    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
        var value;
        switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
          case 'sum': {
            value = this.getSum(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix + value.toString() + this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix;
            break;
          }

          case 'min': {
            value = this.getMin(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');
            break;
          }

          case 'max': {
            value = this.getMax(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');

            break;
          }

          case 'average': {
            value = this.getAverage(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            var columnElement = gridObj.getFooterRowColumn(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName);
            columnElement.innerHTML = (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '') + value.toString() + (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '');
            break;
          }

        }
      }
    }
  }

  getSum(fieldName: string) {
    var sum = 0;
    for (var i = 0; i < this.dataset.length; ++i) {
      var num: number = this.dataset[i][fieldName];
      sum += num;
    }
    return sum;
  }

  getMin(fieldName: string) {
    var min = Number.MAX_SAFE_INTEGER;
    for (var i = 0; i < this.dataset.length; ++i) {
      var num: number = this.dataset[i][fieldName];
      min = Math.min(num, min);
    }
    return min;

  }

  getMax(fieldName: string) {
    var max = Number.MIN_SAFE_INTEGER;
    for (var i = 0; i < this.dataset.length; ++i) {
      var num: number = this.dataset[i][fieldName];
      max = Math.max(num, max);
    }
    return max;
  }

  getAverage(fieldName: string) {
    var sum = this.getSum(fieldName);
    var avg = sum / this.dataset.length;
    return avg;
  }

  mockData(count: number) {
    const mockDatadet = [];

    for (let i = 0; i < count; ++i) {
      const randomCode = Math.floor(Math.random() * 1000);

      mockDatadet[i] = {
        Id: i,
        Code: randomCode,
        Name: 'Banglore',
        StatusCode: 'Active'
      };
    }

    return mockDatadet;
  }

  executeFunction(columnDefinition: ColumnDefinition, rowData: any, column: any) {
    switch (columnDefinition.FunctionName) {

      case 'delete': {
        this.delete(rowData);
        break;
      }

      case 'executeQuery': {
        if (columnDefinition.SendDataToFunction)
          this.executeQuery(rowData, columnDefinition.FunctionData);
        break;
      }

      case 'onClickPVRID': {
        this.onClickPVRID(columnDefinition, rowData, column)
        break;
      }

      case 'onClickPayRun': {
        this.onClickPayRun(columnDefinition, rowData, column)
        break;

      }
      case 'onClickPayOut': {
        this.onClickPayOut(columnDefinition, rowData, column)
        break;
      }

      case 'onClickHistoryLogs': {
        this.onClickHistoryLogs(columnDefinition, rowData, column)
        break;
      }
    }
  }

  executeQuery(rowData: any, data: any) {
    alert("Delete Button Clicked with id" + rowData.Id);

    let dataSource = data[0];
    let params: {
      FieldName: string,
      Value: string
    }[] = [];
    let keys = Object.keys(data[1]);
    for (let key of keys) {

      params.push({
        FieldName: key,
        Value: rowData[data[1][key]]
      })

    }

    console.log(dataSource, params);

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, confirm!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.loadingSpinner = true;
        this.pageLayoutService.executeQuery(dataSource, params).subscribe(
          data => {
            this.loadingSpinner = false;
            if (data.Status) {
              console.log(data);
              this.alertService.showSuccess(data.Message);
              this.getDataset();
            }
            else {
              console.log(data);
              this.alertService.showWarning(data.Message)
            }
          },
          error => {
            this.loadingSpinner = false;
            this.alertService.showWarning("Error occured! Please Try Again");
            console.log(error);
          }
        )

      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })

  }

  delete(rowData: any, data: any = null) {
    alert("Delete Clicked with Id " + rowData.Id);
  }
  // SLICK GRID EXTRA FEATURES END HERE
  /* #endregion */

  /* #region  TABSET ON CHANGE */
  onChange_tabset(event) {
    this.selectedItems = [];
    if (event.nextId == 'PAYINPUTS') {
      this.dataset = [];
      this.BusinessType == 3 ?  this.code_for_pay = "salaryTransaction" :  this.code_for_pay = "salaryTransactions";
      this.getPageLayout(this.code_for_pay);
    }
    else if (event.nextId == 'PAYRUN') {
      this.dataset = [];
      this.BusinessType == 3 ?  this.code_for_pay = "payrun" :  this.code_for_pay = "payruns";
      this.getPageLayout(this.code_for_pay);
    }
    else if (event.nextId == 'PAYOUT') {
      this.dataset = [];
      this.BusinessType == 3 ?  this.code_for_pay = "payout" :  this.code_for_pay = "payouts";
      this.getPageLayout(this.code_for_pay);
    }
    this.activeTabName = event.nextId;
  }
  /* #endregion */

  /* #region  ON CLICK FUNCTIONS FOR PVR #, PAY RUN #, PAY OUT # AND DO INITIATE SO */

  async onClickPayRun(columnDefinition, rowData, column) {

    if (this.BusinessType != undefined && this.BusinessType != 3) {
      this.rowDataService.dataInterface.RowData = rowData;
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayRunIds",
        "OutputFieldName": "@PayRunIds",
        "Value": rowData.PayRunId,
        "ReadOnly": false
      }];
      await this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun')
    }
    else {
      this.rowDataService.dataInterface.RowData = rowData;
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayRunIds",
        "OutputFieldName": "@PayRunIds",
        "Value": rowData.PayRunId,
        "ReadOnly": false
      }];
      await this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')
    }
   
    
  }
  async onClickPayOut(columnDefinition, rowData, column) {
    console.log('rowData', rowData);

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayOutIds",
      "OutputFieldName": "@PayOutIds",
      "Value": rowData.Id,
      "ReadOnly": false
    }];
    await this.router.navigateByUrl('app/payroll/payrolltransaction/PayOut_Edit')
  }

  async do_initiate_Sale_order(index) {
    if (this.selectedItems.length > 0) {
      console.log('selected', this.selectedItems);


      if (index === "PAYINPUTS") {
        let teamIds = [];
        this.selectedItems.forEach(element => {
          teamIds.push(element.teamId)
        });
        var rmdups = _.union(teamIds);
        var teamId = (rmdups).join(",");
        sessionStorage.removeItem("teamId");
        sessionStorage.setItem("teamId", teamId);

        this.rowDataService.dataInterface.RowData = this.selectedItems[0];
        this.rowDataService.dataInterface.SearchElementValuesList = [
          {
            "InputFieldName": "TeamIds",
            "OutputFieldName": "@TeamIds",
            "Value": teamId,
            "ReadOnly": false
          },
          {
            "InputFieldName": "payperiodId",
            "OutputFieldName": "@payperiodId",
            "Value": this.selectedItems[0].payperiodId,
            "ReadOnly": false
          },
          {
            "InputFieldName": "",
            "OutputFieldName": "@processCategory",
            "Value": 1,
            "ReadOnly": false
          },
        ];
        console.log('rowdata', this.rowDataService);
        const modalRef = this.modalService.open(InitiateSaleOrderModalComponent, this.modalOption);
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
        this.selectedItems.forEach(element => {
          PayrunIds.push(element.PayRunId)
        });
        console.log('selectedItems', this.selectedItems);
        var dupPayRunId = _.union(PayrunIds);
        var PayRunId = (dupPayRunId).join(",");
        sessionStorage.removeItem("PayRunIds");
        sessionStorage.setItem("PayRunIds", PayRunId);

        console.log('PayRunId', PayRunId);

        this.rowDataService.dataInterface.RowData = this.selectedItems[0];
        this.rowDataService.dataInterface.SearchElementValuesList = [{
          "InputFieldName": "PayRunIds",
          "OutputFieldName": "@PayRunIds",
          "Value": PayRunId,
          "ReadOnly": false,
        }];
        this.sessionService.delSessionStorage('SO_Navigation_URL');
        this.sessionService.setSesstionStorage('SO_Navigation_URL', 'Non-SaleOrder');
        await this.router.navigateByUrl('app/payroll/payrolltransaction/initiatePayOut')

      }

    } else {
      this.alertService.showWarning( index === "PAYRUN" ? "Oh ho! As per the initiate Payout requirement, You must make a selection(s) from the list." : index === "PAYINPUTS" ?  "Oh ho! As per the initiate payrun requirement, You must make a selection(s) from the list." :  "Oh ho! As per the sale order requirement, You must make a selection(s) from the list.")
    }
  }

  /* #endregion */

  /* #region  PAYROLL INPUTS TAB LISTING SCREEN  */
  // ON CLICK ON PVR ID IF ANY (BUTTON ACTION)
  onClickPVRID(columnDefinition, columndata, column): void {
    console.log(column);
    var flag = false;
    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      if (column.columnDef.id === this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id) {
        console.log(this.pageLayout.GridConfiguration.ColumnDefinitionList[i]);
        flag = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable;
        if (flag) {
          console.log("clicked", column)
          if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
            this.rowDataService.dataInterface.RowData = column.dataContext;
            if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList !== null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.length > 0) {
              this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(searchElementValue => {
                searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
              }
              )
              this.rowDataService.dataInterface.SearchElementValuesList = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
            }
          }
          else {
            this.rowDataService.dataInterface.RowData = null;
            this.rowDataService.dataInterface.SearchElementValuesList = [];
          }


          sessionStorage.removeItem("RowDataInterface");
          sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));
          if (column.dataContext.PVRId == 0 || column.dataContext.PVRId === -1) {
            this.alertService.showWarning("You do not have permission to access this link.")
            return;
          }
          this.router.navigate(['app/payroll/payrolltransactions'])

        }
        break;
      }
    }

  }

  // ON CLICK PVR STATUS - TO EXPLORE HISTOY LOG FOR TEAM TRANSACTION 
  async onClickHistoryLogs(columnDefinition, rowData, column) {
    console.log('rowdata', rowData);

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "teamId",
      "OutputFieldName": "@teamId",
      "Value": rowData.teamId,
      "ReadOnly": false
    },
    {
      "InputFieldName": "payperiodId",
      "OutputFieldName": "@payperiodId",
      "Value": rowData.payperiodId,
      "ReadOnly": false
    }
    ];
    const modalRef = this.modalService.open(PayrollhistorylogModalComponent, this.modalOption);
    modalRef.componentInstance.rowData = JSON.stringify(rowData);
    modalRef.result.then((result) => {
      console.log('POPUP RESULT :', result);
      this.getDataset();
      this.selectedItems = []
    }).catch((error) => {
      console.log(error);
    });
  }

  onChangeConfirmationAlert(event, indexValue) {

  }

  // GENERATE PIS BASED SELECTIONS ITEMS FROM THE LIST

  do_generate_PIS_PostConfirmation() {
    this.selectedItems.forEach(i => {
      if (i.PVRId == -1) {
        i.PVRId = 0;
      }
    });
    console.log(this.selectedItems);

    this.loadingScreenService.startLoading();
    const jobj = new GeneratePIS();
    jobj.ClientId = this.selectedItems[0].clientId;
    jobj.ClientContractId = this.selectedItems[0].clientcontractId;
    jobj.EmployeeIds = null;
    jobj.TeamIds = [];
    this.selectedItems.forEach(function (item) { jobj.TeamIds.push(item.teamId) })
    jobj.TeamIds = _.union(jobj.TeamIds)
    jobj.PayPeriodId = this.selectedItems[0].payperiodId;
    jobj.PISId = 0;
    jobj.PVRIds = [];
    this.selectedItems.forEach(function (item) { jobj.PVRIds.push(item.PVRId) });
    jobj.PVRIds = _.union(jobj.PVRIds)
    jobj.IsDownloadExcelRequired = true;
    jobj.ObjectStorageId = 0;
    jobj.RequestedBy = this.UserId;
    jobj.RequestedOn = 0;
    jobj.GeneratedRecords = 0;
    jobj.IsPushrequired = true;
    this.LstGeneratePIS.push(jobj);
    var payperiodName = this.selectedItems[0].PayPeriod.substring(0, 3)
    const teamNames = [];
    this.selectedItems.forEach(function (item) { teamNames.push(item.Team) });
    console.log('teamNames', teamNames.join(','));
    var dynoFileName = `PIS_${this.selectedItems[0].ClientName}_${teamNames.join(',')}_${payperiodName}`;
    this.payrollService.post_generatePIS(JSON.stringify(this.LstGeneratePIS))
      .subscribe((result) => {
        console.log('GENERATE PIS RESPONSE ::', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          const jsonobj = JSON.stringify(apiResult.Result)
          const docsBytes = JSON.parse(jsonobj);
          docsBytes[0].docbytes != null && docsBytes[0].docbytes != undefined && this.base64ToBlob(docsBytes[0].docbytes as String, dynoFileName)
          docsBytes[0].docbytes != null && docsBytes[0].docbytes != undefined && this.alertService.showSuccess1("PIS generated successfully. (Please note that any employee(s) who are added in payrun will not be included in the PIS)");
          docsBytes[0].docbytes == null && this.alertService.showWarning("Data Generation Failed!. Unable to generate the PIS file. Please try again")
          this.gridObj.getSelectionModel().setSelectedRows([]);
          this.getDataset();
          this.selectedItems = [];
          this.loadingScreenService.stopLoading();
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      });
  }
  do_generate_PIS() {
    this.LstGeneratePIS = [];
    if (this.selectedItems.length > 0) {
      var EmployeeCount = [];
      EmployeeCount = this.selectedItems.filter(z => z.EmployeeCount == 0);
      if (EmployeeCount.length > 0) {
        this.alertService.showWarning("There are no active employee list for selected record!");
        return;
      }
      // if (this.dataset.length > 1) {
      //   $('#popup_confirmationAlert').modal({
      //     backdrop: 'static',
      //     keyboard: false,
      //     show: true
      //   });
      // } else {
      var isInitiatedRecord = this.selectedItems.find(z => z.PVRStatus == 'Initiated');
      if (isInitiatedRecord != undefined) {
        this.alertService.showWarning("This request cannot be processed because the PVR Status of one or more selected records is 'Initiated'");
        return;
      }
      this.do_generate_PIS_PostConfirmation();
      // }


    } else {
      this.alertService.showWarning("Cannot proceed to generate PIS action due to empty items. Please select at least one item");
      return;
    }

  }
  public base64ToBlob(b64Data, dynoFileName, sliceSize = 512) {
    var dynoFileNames = dynoFileName.replace(/\./g, ' ')
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
    const file = new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    FileSaver.saveAs(file, dynoFileNames);
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // IMPORT DATA POPUP - IF YOU WANT TO POST GENERATED PIS DATA INTO DATABASE (API)
  importData_popup() {
    console.log('BEHAVIOUR OBJECT REC :', this.pageLayout.SearchConfiguration.SearchElementList);

    if (this.pageLayout == null || this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId").Value == null) {
      this.alertService.showWarning("Some information was missing. There were problems with the following fields : Client, Client Contract, Pay Period and Team name")
      return;
    }
    if(this.BusinessType == 3){
    var clientList = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId");
    var clientName = clientList.DropDownList.find(z => z.Id === clientList.Value).Name;
    const modalRef = this.modalService.open(PayrollImportdataComponent, this.modalOption);
    modalRef.componentInstance.ClientName = clientName;
    var objStorageJson = JSON.stringify(
      {
        clientId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId").Value,
        clientcontractId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId").Value,
        payperiodId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId").Value

      });
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {
      console.log('POPUP RESULT :', result);
      this.getDataset();
      this.selectedItems = []
    }).catch((error) => {
      console.log(error);
    });
  }else {
    const modalRef = this.modalService.open(PayrollImportdataComponent, this.modalOption);
    modalRef.componentInstance.ClientName = '';
    var objStorageJson = JSON.stringify(
      {
        clientId: this.sessionService.getSessionStorage('default_SME_ClientId'),
        clientcontractId: this.sessionService.getSessionStorage('default_SME_ContractId'),
        payperiodId: this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId").Value

      });
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.result.then((result) => {
      console.log('POPUP RESULT :', result);
      this.getDataset();
      this.selectedItems = []
    }).catch((error) => {
      console.log(error);
    });
  }
  }
  /* #endregion */

  /* #region  DESTORY METHOD - UNSUBSCRIBE ALL THE OBSERVABLE METHODS */
  ngOnDestroy(): void {
    // localStorage.removeItem("SearchPanel");
  }
  /* #endregion */

  /* #region  FOR PAY RUN CREATION */



  /* #endregion */
  close_submitQC() {
    // $('#popup_submitToQC').modal('hide');
    this.isValidForSubmit = true;
    this.visible = false;
    this.OverAllRemarks = null;
    this.selectedItems = [];
    this.getDataset();

  }

  submitForVerification() {
    // $('#popup_submitToQC').modal('show');
    if (this.selectedItems.length === 0) {
      this.alertService.showWarning("No Team record(s) have been selected! Please first select");
      return;
    }

    this.loadingScreenService.startLoading();
    var currentDate = new Date()
    var submitToQC = new SubmittionForVerification();
    submitToQC.CompanyId = this.sessionDetails.Company.Id;
    submitToQC.ClientId = this.selectedItems[0].clientId
    submitToQC.ClientContractId = this.selectedItems[0].clientcontractId;
    submitToQC.TeamIds = [];
    // submitToQC.TeamIds.push(this.selectedItems[0].teamId)
    this.selectedItems.forEach(function (item) { submitToQC.TeamIds.push(item.teamId) })
    submitToQC.PVRIds = _.union(submitToQC.PVRIds)

    submitToQC.PayPeriodId = this.selectedItems[0].payperiodId;
    submitToQC.EmployeeIds = [];
    submitToQC.PISId = 0;
    submitToQC.PVRId = 0;
    submitToQC.PVRIds = [];
    this.selectedItems.forEach(function (item) { if (item.PVRId !== -1) { submitToQC.PVRIds.push(item.PVRId) } });
    submitToQC.IsDownloadExcelRequired = false;
    submitToQC.ObjectStorageId = 0;
    submitToQC.RequestedBy = this.UserId;
    submitToQC.RequestedOn = 0;
    submitToQC.GeneratedRecords = 0;
    submitToQC.IsPushrequired = false;
    submitToQC.docbytes = '';

    console.log('submitToQC', submitToQC);

    this.payrollService.get_PayrollDetailsForQCSubmit(submitToQC)
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();
          this.PVRIds_Modal = (submitToQC.PVRIds).join(",");
          this.TeamName_Modal = this.selectedItems[0].Team;
          this.visible = true;

          // $('#popup_submitToQC').modal({
          //   backdrop: 'static',
          //   keyboard: false,
          //   show: true
          // });
          // document.getElementById('popup_submitToQC').style.height = '500px';
          // document.getElementById('popup_submitToQC').style.width = '800px';

          // this.getPageLayout('processedOutputs');
          this.inEmployeesList = apiResult.Result != null ? JSON.parse(apiResult.Result) : [];
          this.lstEmpForSubmitQC = apiResult.Result != null ? JSON.parse(apiResult.Result) : [];
          this.alertService.showSuccess(apiResult.Message);
          console.log('lstEmpForSubmitQC', this.lstEmpForSubmitQC);

        } else { this.loadingScreenService.stopLoading(); this.alertService.showWarning(apiResult.Message) }
      }, err => {

      })

  }
  onNativeChangeProcessed(e, indexOf) {

    console.log('isProcessedChkbox', this.isProcessedChkbox);
    console.log('isRejectedChkbox', this.isRejectedChkbox);

    this.lstEmpForSubmitQC = [];
    if (this.isProcessedChkbox && this.isRejectedChkbox) {
      this.lstEmpForSubmitQC = this.inEmployeesList.filter(z => Number(z.StatusCode) == TimeCardStatus.PayrollCalculated
        || Number(z.StatusCode) == TimeCardStatus.QcRejected)

    }
    else if (!this.isProcessedChkbox && this.isRejectedChkbox) {
      this.lstEmpForSubmitQC = this.inEmployeesList.filter(z => Number(z.StatusCode) != TimeCardStatus.PayrollCalculated
        && Number(z.StatusCode) == TimeCardStatus.QcRejected)
    }
    else if (this.isProcessedChkbox && !this.isRejectedChkbox) {
      this.lstEmpForSubmitQC = this.inEmployeesList.filter(z => Number(z.StatusCode) == TimeCardStatus.PayrollCalculated
        && Number(z.StatusCode) != TimeCardStatus.QcRejected)
    }
    else if (!this.isProcessedChkbox && !this.isRejectedChkbox) {
      this.lstEmpForSubmitQC = this.inEmployeesList.filter(z => Number(z.StatusCode) != TimeCardStatus.PayrollCalculated
        && Number(z.StatusCode) != TimeCardStatus.QcRejected)

    }

  }

  ConfirmToQC() {

    if (this.inEmployeesSelectedItems.length === 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
    var isopen = [];
    isopen = this.inEmployeesSelectedItems.filter(a => a.StatusCode > TimeCardStatus.MarkupCalculationFailed || a.StatusCode == TimeCardStatus.SentForQc);
    if (isopen.length > 0) {
      this.alertService.showWarning("This request cannot be processed because the PVR Status of selected records is 'SentForQC'");
      return;
    }

    if (this.OverAllRemarks == null || this.OverAllRemarks == undefined || this.OverAllRemarks == '') {
      this.alertService.showWarning('Overall request remarks is required! You need to write something!')
      return;
    }
    // const modalRef = this.modalService.open(RemarksModalComponent, this.modalOption);
    // modalRef.componentInstance.headerText = 'Confirmation Remarks';
    // modalRef.componentInstance.subHeaderText = 'Submit to QC';
    // modalRef.componentInstance.remarksText = 'Overall Request Remarks';

    // modalRef.result.then((result) => {
    //   console.log('POPUP RESULT :', result);
    //   if(result !== 'Modal Closed'){

    //   }

    // }).catch((error) => {
    //   console.log(error);
    // });
    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-primary',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: true
    // })
    // swalWithBootstrapButtons.fire({
    //   title: 'Overall Request Remarks',
    //   animation: false,
    //   showCancelButton: true, // There won't be any cancel button
    //   input: 'textarea',
    //   // inputValue:  result.ApproverRemarks ,
    //   inputPlaceholder: 'Type your message here...',
    //   allowEscapeKey: false,
    //   inputAttributes: {
    //     autocorrect: 'off',
    //     autocapitalize: 'on',
    //     maxlength: '120',
    //     'aria-label': 'Type your message here',
    //   },
    //   allowOutsideClick: false,
    //   inputValidator: (value) => {
    //     if (value.length >= 120) {
    //       return 'Maximum 120 characters allowed.'
    //     }
    //     if (!value) {
    //       return 'You need to write something!'
    //     }
    //   },

    // }).then((inputValue) => {
    //   if (inputValue.value) {
    //     let jsonObj = inputValue;
    //     let jsonStr = jsonObj.value;
    var currentDate = new Date();
    var LstSubmitForVerifcation = []
    this.loadingScreenService.startLoading();
    var PVRId = 0;
    this.inEmployeesSelectedItems.forEach(event => {
      PVRId = event.PVRId;
      var submitListObject = new PayrollVerificationRequestDetails();
      submitListObject.Id = 0;
      submitListObject.PVRId = 0;
      submitListObject.TimeCardId = event.Id;
      submitListObject.EmployeeId = event.EmployeeId;
      submitListObject.EmployeeName = event.EmployeeName;
      submitListObject.IsActive = true;
      submitListObject.LastUpdatedBy = this.UserId;
      submitListObject.LastUpdatedOn =  moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
      submitListObject.RequestRemarks = this.OverAllRemarks;
      submitListObject.ApproverRemarks = "";
      submitListObject.Status = TimeCardStatus.SentForQc;
      submitListObject.ModeType = UIMode.Edit;
      LstSubmitForVerifcation.push(submitListObject);
    });
    var submitObject = new PayrollVerificationRequest();
    submitObject.Id = PVRId == -1 ? 0 : PVRId;
    submitObject.CompanyId = this.sessionDetails.Company.Id;
    submitObject.ClientContractId = this.selectedItems[0].clientcontractId;
    submitObject.ClientId = this.selectedItems[0].clientId;
    submitObject.PayPeriodId = this.selectedItems[0].payperiodId;
    submitObject.PayPeriodName = this.selectedItems[0].PayPeriod;
    submitObject.AttdanceStartDate = this.selectedItems[0].AttendanceStartDate;
    submitObject.AttdanceEndDate = this.selectedItems[0].AttendanceEndDate;
    submitObject.ClientContactId = 0;
    submitObject.TeamIds = [];
    submitObject.ClientContactDetails = "";
    // submitObject.TeamIds.push(this.selectedItems[0].teamId)
    this.selectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
    submitObject.TeamIds = _.union(submitObject.TeamIds)

    submitObject.RequestedBy = this.UserId;
    submitObject.RequestedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss'); 
    submitObject.ApproverId = null;
    submitObject.ApproverLogOn = '1900-01-01 00:00:00'
    submitObject.RequestRemarks = this.OverAllRemarks;
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
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
          this.close_submitQC()
          this.inEmployeesSelectedItems = [];
          this.getDataset();
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {

      });
    //   } else if (
    //     /* Read more about handling dismissals below */
    //     inputValue.dismiss === Swal.DismissReason.cancel

    //   ) {
    //   }
    // });

  }



  inEmployeesGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesGridInstance = angularGrid;
    this.inEmployeesDataView = angularGrid.dataView;
    this.inEmployeesGrid = angularGrid.slickGrid;
    this.inEmployeesGridService = angularGrid.gridService;
  }

  loadinEmployeesRecords() {
    //   textWidth = function(font) {
    //     var f = font || '12px Helvetica,​Arial,​sans-serif',
    //       o = $('<div>' + this + '</div>')
    //             .css({'position': 'absolute', 'float': 'left', 'white-space': 'nowrap', 'visibility': 'hidden', 'font': f})
    //             .appendTo($('body')),
    //       w = o.width();

    //     o.remove();
    //   return w;
    // }
    this.inEmployeesColumnDefinitions = [
      {
        id: 'EmployeeCode', name: 'Employee Code', field: "EmployeeCode",
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },

      {
        id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'DOJ', name: 'DOJ', field: 'DOJ',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'CostCode', name: 'Cost Code', field: 'CostCode',
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      {
        id: 'DaytobePaid', name: 'Day to be Paid', field: 'DaytobePaid',
        filterable: true,
        sortable: true,
        type: FieldType.string,

      },
      {
        id: 'NetPay', name: 'Net Pay', field: 'NetPay',
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      {
        id: 'ProcessingStatus', name: 'Processing Status', field: 'ProcessingStatus',
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },

    ];

    this.inEmployeesGridOptions = {
      //General
      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: true,
      enableFiltering: true,
      showHeaderRow: true,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: true,
      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,
      editable: true,

      //For Footer Summary
      createFooterRow: true,
      showFooterRow: false,
      footerRowHeight: 30,

      //For Grouping
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


  }

  onSelectedEmployeeChange(data, args) {
    this.inEmployeesSelectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inEmployeesDataView.getItem(row);
        this.inEmployeesSelectedItems.push(row_data);
      }
    }
    console.log('SELECTED ITEMS SO :', this.inEmployeesSelectedItems);

  }

}
