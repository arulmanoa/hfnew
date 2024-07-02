import { DownloadService } from './../../../_services/service/download.service';
import { HeaderService } from 'src/app/_services/service/header.service';
import { InputControlType, SearchPanelType, DataSourceType, RowSelectionType } from '../../personalised-display/enums';

import { Component, OnInit, HostListener } from '@angular/core';
import { GridConfiguration, PageLayout, SearchElementValues, ColumnDefinition, DataSource, SearchElement } from '../../personalised-display/models'
import { Column, GridOption, AngularGridInstance, Aggregators, Grouping, GroupTotalFormatters, Formatters, Formatter, GridService, Filters, FieldType, OnEventArgs } from 'angular-slickgrid';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, ParamMap, NavigationEnd, NavigationStart } from '@angular/router';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from "sweetalert2";
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import * as _ from 'lodash';
export let browserRefresh = false;
import { Subscription } from 'rxjs';

// POPUP MODAL 
import { DownloadBillingSheetModalComponent } from 'src/app/shared/modals/payroll/download-billing-sheet-modal/download-billing-sheet-modal.component';
import { SaleorderSummaryModalComponent } from 'src/app/shared/modals/payroll/saleorder-summary-modal/saleorder-summary-modal.component';
import { PayrollImportdataComponent } from 'src/app/shared/modals/payroll/payroll-importdata/payroll-importdata.component';

// SERVICES
import { PayrollService } from '../../../_services/service/payroll.service';
import { SessionStorage } from './../../../_services/service/session-storage.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AlertService } from 'src/app/_services/service/alert.service';
import { RowDataService } from '../../personalised-display/row-data.service';
import { PagelayoutService } from 'src/app/_services/service/pagelayout.service';

// MODEL CLASS (INTERFACE)
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { PVRStatus, PayrollVerificationRequestDetails, PayrollVerificationRequest } from './../../../_services/model/Payroll/PayrollVerificationRequest';
import { apiResult } from './../../../_services/model/apiResult';
import { GeneratePIS } from './../../../_services/model/Payroll/generatePIS';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { PayrollModel, _PayrollModel } from './../../../_services/model/Payroll/ParollModel';
import { element } from '@angular/core/src/render3';
import { PayRunDetails, PayRun, PayRunStatus, SaleOrder, ProcessCategory, BillingTransaction, RemovePayRunDetails, CollectionMode, SaleOrderStatus, MarkupCalculationMessage } from 'src/app/_services/model/Payroll/PayRun';
import { _PayRun, PayRunModel } from 'src/app/_services/model/Payroll/PayRunModel';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { UUID } from 'angular2-uuid';
import { SaleorderModalComponent } from 'src/app/shared/modals/payroll/saleorder-modal/saleorder-modal.component';
import { AddemployeeModalComponent } from 'src/app/shared/modals/payroll/addemployee-modal/addemployee-modal.component';
import { PayoutInformation, PayOutStatus, PayoutInformationDetails, PayOutModel, _PayOutModel, PayOutDetailsStatus, PaymentMode } from 'src/app/_services/model/Payroll/PayOut';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { UtilityService } from 'src/app/_services/service/utitlity.service';


@Component({
  selector: 'app-saleorders',
  templateUrl: './saleorders.component.html',
  styleUrls: ['./saleorders.component.css']
})
export class SaleordersComponent implements OnInit {
  subscription: Subscription;

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any;
  PersonName: any;

  //General
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  spinner: boolean;
  Screenspinner: boolean = false;
  loadingSpinner: boolean = false;

  //Grouping
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  draggableGroupingPlugin: any;


  //Basic
  dataset: any;
  columnDefinition: Column[];
  gridOptions: GridOption;
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

  //PAYROLL VERIFICATION REQUEST
  LstSubmitForPayRun: any[] // SUBMIT FOR VERFICATION - ARRAY LIST
  payRunModel: PayRunModel = new PayRunModel();
  payOutModel: PayOutModel = new PayOutModel();

  code_for_SO: string; // PAGE ROUTING CODE (USER INPUTS FROM CONFIG JSON) - THIS IS USED TO HOW THE COMPONENT IS FORMED
  activeTabName: string;

  // FOR SALE ORDER TAB SET
  inSaleOrdersGridInstance: AngularGridInstance;
  inSaleOrdersGrid: any;
  inSaleOrdersGridService: GridService;
  inSaleOrdersDataView: any;

  inSaleOrdersColumnDefinitions: Column[];
  inSaleOrdersGridOptions: GridOption;
  inSaleOrdersDataset: any;

  inSaleOrdersList: any[];
  selectedItems1: any[];
  SO_OP: PayRun;
  // for slider
  visible = false;
  billingTransaction = [];
  _SliderJson: any;
  processedEMP = [];
  isEmptySO: boolean = false;

  // PAY RUN

  _PayOutInfo: PayoutInformation;

  // FOR PAY RUN TAB SET
  inEmployeesGridInstance: AngularGridInstance;
  inEmployeesGrid: any;
  inEmployeesGridService: GridService;
  inEmployeesDataView: any;

  inEmployeesColumnDefinitions: Column[];
  inEmployeesGridOptions: GridOption;
  inEmployeesDataset: any;

  inEmployeesList = [];
  inEmployeesSelectedItems: any[];
  _LstPayoutEmployees_codemapping = [];
  // TRANSACTION SOURCE PROPERTIES
  transactionName: any;
  transactionValue: any;
  SubmitButtonText: any
  RaiseButtonText: any;
  BusinessType: any;
  firstTimeCount: number = 0;
  disbaleButtonAfterClicked: boolean = false;
  isReProcessed: boolean = false;
  validatedEmployees = [];
  isEmployeePayRunDuplicateEntry: boolean = false;
  isSODuplicateEntry: boolean = false;
  isEmployeeDuplicateEntry: boolean = false;
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
    private utilityService: UtilityService


  ) {
    this.activeTabName = "EMPLOYEES";
    //   this.subscription = router.events.subscribe((event) => {
    //     if (event instanceof NavigationStart) {
    //       alert('ss')
    //       browserRefresh = !router.navigated;
    //     }
    // });
    //   @HostListener("window:beforeunload", ["$event"]) unloadHandler(event: Event) {
    //     console.log("Processing beforeunload...");
    //     // this.processData(); 
    // }
    // window.addEventListener("beforeunload", function (e) {
    //   if (window.confirm('yes/no?')) {
    //   }
    //   else {
    //   }

    //   var confirmationMessage = "\o/";
    //   console.log("cond");
    //   e.returnValue = confirmationMessage;
    //   console.log(confirmationMessage);

    //   // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
    //   return confirmationMessage;              // Gecko, WebKit, Chrome <34
    // });
    //   window.onbeforeunload = (ev) => {
    //     // this.myFunction();

    //     // OR

    //     // this.yuorService.doActon().subscribe(() => {
    //         alert('did something before refresh');  
    //     // });

    //      // OR

    //     alert('goin to refresh');

    //     // finally return the message to browser api.
    //     var dialogText = 'Changes that you made may not be saved.';
    //     ev.returnValue = dialogText;
    //     return dialogText;
    // }; 


  }
  // @HostListener('window:beforeunload', ['$event'])
  // beforeunloadHandler(event) {
  //     alert('By refreshing this page you may lost all data.');
  // }
  ngOnInit() {
    this.inSaleOrdersList = [];
    this.Screenspinner = true;
    this.dataset = [];
    this.selectedItems = [];
    this.selectedItems1 = [];
    this.inEmployeesSelectedItems = [];
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;

    // this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == 1).BusinessType;


    this.PersonName = this.sessionDetails.UserSession.PersonName;
    this.titleService.setTitle('Scaffolding...');
    this.headerService.setTitle('Payroll');
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.code_for_SO = params.get('code')
    })
    this.transactionName = this.code_for_SO === "initiateSaleOrder" ? "PVR #" : this.code_for_SO === "initiatePayOut" ? "Pay Run #" : this.code_for_SO === "editPayRun" || this.code_for_SO === "managePayRun" ? "Pay Run #" : (this.code_for_SO === "PayOut_Edit") ? "Pay Out #" : this.code_for_SO === "reinitiatePayOut" ? "Old Pay Out #" : null;
    this.SubmitButtonText = this.code_for_SO === "initiateSaleOrder" ? "Submit Employees" : (this.code_for_SO === "initiatePayOut" || this.code_for_SO === "reinitiatePayOut") ? "Submit Employees for Payout" : this.code_for_SO === "editPayRun" || this.code_for_SO === "managePayRun" ? "Submit Employees for SO Creation" : this.code_for_SO === "PayOut_Edit" ? "Submit Employees for Payout" : null;
    this.RaiseButtonText = this.code_for_SO === "initiateSaleOrder" ? "Confirm Sale Order Creation" : this.code_for_SO === "initiatePayOut" ? "Confirm Sale Order Creation" : this.code_for_SO === "editPayRun" || this.code_for_SO === "managePayRun" ? "Save Sale Order(s)" : this.code_for_SO === "PayOut_Edit" ? "Confirm Sale Order Creation" : null;

    // if (this.code_for_SO === "initiatePayOut") {
    //   this.getEmployeesList();

    // } else { 
    this.getPageLayout(this.code_for_SO);
    // }

    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-eye m-r-xs" title="Preview" style="cursor:pointer"></i> ` : '<i class="mdi mdi-eye" style="cursor:pointer"></i>';


  }


  getPageLayout(code) {

    this.pageLayout = null;
    this.spinner = true;
    this.titleService.setTitle('Loading');
    this.headerService.setTitle('');
    this.pageLayoutService.getPageLayout(code).subscribe(data => {
      console.log(data);

      if (data.Status === true && data.dynamicObject != null) {
        this.pageLayout = data.dynamicObject;
        this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
        this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
        let titleExtraText = ` #` + this.code_for_SO == "initiateSaleOrder" ? sessionStorage.getItem("PVRIds") : sessionStorage.getItem("PayRunIds");
        this.headerService.setTitle(`${this.pageLayout.PageProperties.BannerText} - #${titleExtraText}`);
        // if (this.code_for_SO == "initiateSaleOrder") {
        //   this.pageLayout.SearchConfiguration.SearchElementList.forEach(ob => {
        //     if (ob.FieldName === "@PVRIds") {
        //       ob.Value = null;
        //       ob.Value =  localStorage.getItem("PVRIds");
        //     }
        //   });
        // }

        this.setGridConfiguration();
        this.dataset = [];
        this.route.data.subscribe(data => {

          if (data.DataInterface.SearchElementValuesList !== null && data.DataInterface.SearchElementValuesList.length > 0) {
            this.BehaviourObject_Data = data.DataInterface.RowData;
            console.log('PAYRUN SELECTED ITEM DETAILS : ', this.BehaviourObject_Data);

            data.DataInterface.SearchElementValuesList.forEach(searchElementValues => {
              this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
                if (searchElementValues.OutputFieldName === searchElement.FieldName) {
                  searchElement.Value = searchElementValues.Value;
                  this.transactionValue = searchElementValues.Value; // for global readonly text 
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

        // this.spinner = false;

      }
      else {
        this.titleService.setTitle('PORT - Get Started');
        this.spinner = false;

      }

    }, error => {
      console.log(error);
      this.spinner = false;
      this.titleService.setTitle('PORT - Get Started');
    }
    );
  }

  setGridConfiguration() {
    this.columnDefinition = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
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

    this.dataset = [];
    this.spinner = true;
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {

      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.dataset = JSON.parse(dataset.dynamicObject);
        console.log(dataset);
        console.log(this.dataset);
        // this.dataset.forEach(element => {
        //   if (element.Status) {
        //     element["Status"] = element.Status == 0 ? "In-Active" : "Active";
        //   }
        // });
        this.firstTimeCount = this.dataset.length;

        (this.code_for_SO === "editPayRun" || this.code_for_SO === "managePayRun" || this.code_for_SO === "PayOut_Edit") && this._old_Details_Builder().then(
          (val) => console.log(val),
          (err) => console.error(err)
        );
        this.code_for_SO === "PayOut_Edit" && this.loadinEmployeesRecords();
        if (this.code_for_SO === "PayOut_Edit") {
          this.inEmployeesList = this.dataset;

          this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
            result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
          }, err => {

          })
        }
        if (this.code_for_SO != "PayOut_Edit") {
          this.utilityService.ensureIdUniqueness(this.dataset).then((result) => {
            result == true ? this.isEmployeePayRunDuplicateEntry = true : this.isEmployeePayRunDuplicateEntry = false;
          }, err => {

          })
        }

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
  onClickingSearchButton(event: any) {
    this.getDataset();
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

            sessionStorage.removeItem("RowDataInterface");
            sessionStorage.setItem("RowDataInterface", JSON.stringify(this.rowDataService));
            if (iskeyValue && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && this.code_for_SO == "payrollinputs_list") {
              this.alertService.showWarning("You do not have permission to access this link.")
              return;
            }
            this.router.navigate([this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink])
          }
        } else {

          this.code_for_SO === "initiatePayOut" && this.do_editSO_SingleItem(column.dataContext, "PayOut");


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
    }
  }

  executeQuery(rowData: any, data: any) {
    alert("Delete Button Clicked with id" + rowData.Id);

  }

  delete(rowData: any, data: any = null) {
    alert("Delete Clicked with Id " + rowData.Id);
  }
  // SLICK GRID EXTRA FEATURES END HERE
  /* #endregion */

  //  // COMMON REFRESH BUTTON FOR SPECIFIC TABS
  //   do_Refresh() {

  //     this.route.paramMap.subscribe((params: ParamMap) => {
  //       this.code = params.get('code')
  //       this.getPageLayout(code);
  //     })
  //   }
  // ON CHANGE METHOD FOR TAB SET
  onChange_tabset(event) {
    if (event.nextId == 'PAYINPUTS') {
      this.code_for_SO = "payrollinputs_list";
      // this.getPageLayout(this.code_for_SO);
    }
    else if (event.nextId == 'SALEORDER') {
      this.loadinSaleOrdersRecords();
    }

    else if (event.nextId == 'EMPLOYEES') {

      this.BusinessType != undefined && this.BusinessType != 3 ? this.getPageLayout('managePayRun') : this.getPageLayout('editPayRun');


    }
    else if (event.nextId == 'BATCH') {
      this.inEmployeesList = [];
      this.loadinEmployeesRecords();
    }
    this.activeTabName = event.nextId;
  }

  /* #region RECREATE OR INITIATE SALE ORDER USING PAY RUN MODEL */
  do_initiate_Sale_order() {


    if (this.code_for_SO === "initiatePayOut" || this.code_for_SO === "PayOut_Edit" || this.code_for_SO === "reinitiatePayOut") {
      this.Upsert_Payout();
      return;
    }

    else {

      if (this.code_for_SO == "dummay") {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })

        swalWithBootstrapButtons.fire({
          title: `Are you sure you want to Submit?`,
          text: "Do you want to continue?",
          type: 'warning',
          showCancelButton: true,
          confirmButtonText: "Yes, Continue",
          cancelButtonText: 'Not now',
          reverseButtons: true,
          allowEscapeKey: false,
          allowOutsideClick: false
        }).then((res) => {
          if (res.value) {
            this.submitEmployees();
          } else if (res.dismiss === Swal.DismissReason.cancel) {
          }
        })
      } else {
        this.submitEmployees();
      }

    }
  }
  submitEmployees() {
    this.LstSubmitForPayRun = [];
    this.inSaleOrdersList = [];

    if (this.selectedItems.length > 0) {
      var isBatchexist = [];
      isBatchexist = this.selectedItems.filter(a => a.StatusCode != TimeCardStatus.BillingTransactionCreated);

      if (isBatchexist.length > 0) {
        this.alertService.showWarning("Your request cannot make and Submit! You have selected item that contains invalid transaction status");
        return;
      }

      // if (this.selectedItems.filter(a => Number(Math.sign(a.NetPay)) == -1 || Number(Math.sign(a.NetPay)) == 0).length > 0) {
      //   this.alertService.showWarning("Note: It is not possible to confirm that some employees do not have net compensation details.");
      //   return;
      // } // sudhansu and kiran only told me to comment the validation


      this.loadingScreenService.startLoading();
      let PayRunId = 0;
      this.selectedItems.forEach(event => {
        var submitListObject = new PayRunDetails();
        PayRunId = event.PayRunId;
        submitListObject.EmployeeId = event.EmployeeId;
        submitListObject.EmployeeCode = event.EmployeeCode;
        submitListObject.TimeCardId = event.TimeCardId;
        submitListObject.EmployeeName = event.EmployeeName;
        submitListObject.TimecardStatus = this.code_for_SO == "initiatePayOut" ? TimeCardStatus.SaleOrderCreated : TimeCardStatus.BillingTransactionCreated;
        submitListObject.PaytransactionId = event.PaytransactionId;
        submitListObject.GrossEarn = event.GrossEarn;
        submitListObject.GrossDedn = event.GrossDedn;
        submitListObject.NetPay = event.NetPay;
        submitListObject.InvoiceIds = null;
        submitListObject.ModeType = UIMode.Edit;
        submitListObject.Id = this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun" ? event.Id : 0;
        this.LstSubmitForPayRun.push(submitListObject);
      });
      var submitObject = new PayRun();
      submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
      submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
      submitObject.CompanyId = this.sessionDetails.Company.Id;
      submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      submitObject.ClientId = this.BehaviourObject_Data.clientId;
      submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      submitObject.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
      submitObject.TeamIds = [];
      this.selectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
      submitObject.TeamIds = _.union(submitObject.TeamIds)

      // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
      submitObject.NumberOfEmpoyees = this.selectedItems.length;
      submitObject.NoOfSaleOrders = 0;
      submitObject.PayRunStatus = PayRunStatus.Intitated;
      submitObject.Id = this.code_for_SO == "editPayRun" || this.code_for_SO == "managePayRun" ? PayRunId : 0;
      submitObject.LstPayrunDetails = this.LstSubmitForPayRun;
      submitObject.ModeType = UIMode.Edit;
      this.payRunModel = _PayRun;
      this.payRunModel.NewDetails = submitObject;
      // this.payRunModel.OldDetails = {};
      console.log('PAYRUN MODEL : ', this.payRunModel);

      // if (this.code_for_SO === "editPayRun") {

      this.payrollService.PUT_UpsertPayRun(JSON.stringify(this.payRunModel))
        .subscribe((result) => {
          console.log('SUBMIT FOR UPSERT PAYRUN RESPONSE ::', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            // this.loadingScreenService.stopLoading();
            let result = (apiResult.Result) as any;
            this._initiate_SaleOrders(apiResult.Result)
            // this.code_for_SO !== "editPayRun" ? this.transactionName = "Pay Run #" : null;
            // this.code_for_SO !== "editPayRun" ? this.transactionValue = (result.Id) : null;

            // this.alertService.showSuccess(apiResult.Message);
            // this.selectedItems = [];
            // this.getDataset();
            // this.SO_OP = (apiResult.Result) as any;
            // this.inSaleOrdersList = this.SO_OP.SaleOrders;

            // this.payRunModel = _PayRun;
            // this.payRunModel.OldDetails = this.SO_OP;

            // // this.inSaleOrdersList.forEach(element => {
            // //   element.Id = 0;
            // //   element.Id = UUID.UUID();
            // // });

            // this.activeTabName = "SALEORDER";
            // this.loadinSaleOrdersRecords();
            // console.log('LstSaleOrderOutput : ', this.inSaleOrdersList);

            // this.router.n  avigateByUrl('app/ui/payrollVerificationRequest');

          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();

        });

      // } else {

      //   this._initiate_SaleOrders(submitObject)

      // }

    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
  }

  do_update_PayRun() {

    if (this.selectedItems.length === 0) {
      this.alertService.showWarning("No Employee record(s) have been selected. Kindly first select");
      return;
    }

    this.loadingScreenService.startLoading();
    let PayRunId = 0;
    this.selectedItems.forEach(event => {
      var submitListObject = new PayRunDetails();
      PayRunId = event.PayRunId;
      submitListObject.EmployeeId = event.EmployeeId;
      submitListObject.EmployeeCode = event.EmployeeCode;
      submitListObject.TimeCardId = event.TimeCardId;
      submitListObject.EmployeeName = event.EmployeeName;
      submitListObject.TimecardStatus = TimeCardStatus.BillingTransactionCreated;
      submitListObject.PaytransactionId = event.PaytransactionId;
      submitListObject.GrossEarn = event.GrossEarn;
      submitListObject.GrossDedn = event.GrossDedn;
      submitListObject.NetPay = event.NetPay;
      submitListObject.InvoiceIds = null;
      submitListObject.ModeType = UIMode.Edit;
      submitListObject.Id = this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun" ? event.Id : 0;
      this.LstSubmitForPayRun.push(submitListObject);
    });
    var submitObject = new PayRun();
    submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
    submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
    submitObject.CompanyId = this.sessionDetails.Company.Id;
    submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
    submitObject.ClientId = this.BehaviourObject_Data.clientId;
    submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
    submitObject.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
    submitObject.TeamIds = [];
    this.selectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
    submitObject.TeamIds = _.union(submitObject.TeamIds);
    submitObject.NumberOfEmpoyees = this.selectedItems.length;
    submitObject.NoOfSaleOrders = 0;
    submitObject.PayRunStatus = PayRunStatus.Intitated;
    submitObject.Id = this.code_for_SO == "editPayRun" || this.code_for_SO == "managePayRun" ? PayRunId : 0;
    submitObject.LstPayrunDetails = this.LstSubmitForPayRun;
    submitObject.ModeType = UIMode.Edit;
    this.payRunModel = _PayRun;
    this.payRunModel.NewDetails = submitObject;
    console.log('PAYRUN MODEL : ', this.payRunModel);
    this.payrollService.PUT_UpsertPayRun(JSON.stringify(this.payRunModel))
      .subscribe((result) => {
        console.log('SUBMIT FOR UPSERT PAYRUN RESPONSE ::', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess("Payrun updated successfully.");
          this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();

      });
  }

  do_create_Payout() {
    if (this.selectedItems.length === 0) {
      this.alertService.showWarning("No Employee record(s) have been selected. Kindly first select");
      return;
    }

    this.alertService.confirmSwal1("Confirm Stage?", "Are you sure you want to initiate these employees to the Payout?", "OK", "Cancel").then((result) => {
      this.Upsert_Payout();

    }).catch(cancel => {

    });

  }

  _initiate_SaleOrders(submitObject) {

    this.payrollService.put_InitiateSaleOrder(JSON.stringify(submitObject))
      .subscribe((result) => {
        console.log('SUBMIT FOR PAYRUN RESPONSE :: ', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
          this.selectedItems = [];
          // this.getDataset();
          this.SO_OP = (apiResult.Result) as any;
          this.inSaleOrdersList = this.SO_OP as any;



          (this.code_for_SO !== "editPayRun" && this.code_for_SO != "managePayRun") ? this.transactionName = "Pay Run #" : null;
          (this.code_for_SO !== "editPayRun" && this.code_for_SO != "managePayRun") ? this.transactionValue = (submitObject.Id) : null;

          // this.payRunModel = _PayRun;
          // this.payRunModel.OldDetails = this.SO_OP;

          // this.inSaleOrdersList.forEach(element => {
          //   element.Id = 0;
          //   element.Id = UUID.UUID();
          // });
          this.get_SaleOrdersByPayRunId(submitObject.Id);
          this.activeTabName = "SALEORDER";
          this.loadinSaleOrdersRecords();
          console.log('LstSaleOrderOutput : ', this.inSaleOrdersList);

          this.utilityService.ensureIdUniqueness(this.inSaleOrdersList).then((result) => {
            result == true ? this.isSODuplicateEntry = true : this.isSODuplicateEntry = false;
          }, err => {

          })

          // this.router.n  avigateByUrl('app/ui/payrollVerificationRequest');

        } else {
          this.code_for_SO !== "editPayRun" && this.code_for_SO != "managePayRun" ? this.delete_payrun(submitObject.Id) : null;
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
          this.selectedItems = [];
          this.getDataset();

        }
      }, error => {
        this.loadingScreenService.stopLoading();

      });

  }
  addEmployee_btn() {
    console.log(this.BehaviourObject_Data);
    const modalRef = this.modalService.open(AddemployeeModalComponent, this.modalOption);
    modalRef.componentInstance.ContentArea = (this.code_for_SO === "initiatePayOut" || this.code_for_SO === "reinitiatePayOut") ? "Payout" : "Payinput";
    modalRef.componentInstance.CoreJson =
      JSON.stringify({
        payperiodId: this.BehaviourObject_Data.payperiodId,
        clientcontractId: this.BehaviourObject_Data.clientcontractId,
        PayrunId: this.transactionValue,
        BusinessType: this.BusinessType,
        ProcessCategory: this.BusinessType == 1 ? 1 : this.BehaviourObject_Data.ProcessCategory
      })
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        result = JSON.parse(result);
        console.log('RESULT OF EDITED SO DETAILS :', result.LstOfItems);
        let empIdExist = this.dataset.find(z => z.EmployeeId == result.LstOfItems[0].EmployeeId);
        if (empIdExist != null || empIdExist != undefined) {
          this.alertService.showWarning("The specified Employee detail already exists");
          return;
        } else {
          if (this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun") {
            this.loadingScreenService.startLoading();
            this.insertPayRun(result.LstOfItems, result.isCreate);
          }
        }
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  re_processEmployee() {
    if (this.code_for_SO == "editPayRun" || this.code_for_SO == "managePayRun") {
      // RE-PROCESS BILLING FROM PAYRUN AND RE-CREATE SALE ORDER
      if (this.selectedItems.length == 0) {
        this.alertService.showWarning("No Employee record(s) have been selected! Please first select.");
        return;
      }

      this.validateTimeCardtoReprocessBilling();

    }
  }

  validateTimeCardtoReprocessBilling() {
    this.alertService.confirmSwal("Confirmation", "This system operates by taking only the success employee(s).", "Confirm").then((result) => {
      this.disbaleButtonAfterClicked = true;
      this.loadingScreenService.startLoading();
      const timeCardIds = [];
      this.selectedItems.forEach(function (item) { timeCardIds.push(item.TimeCardId) });
      this.payrollService.ValidateTimecardsToReprocessBilling(timeCardIds)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          this.disbaleButtonAfterClicked = false;
          if (apiResult.Status) {
            this.validatedEmployees = JSON.parse(apiResult.Result);

            this.processEmployee();
            // this.loadingScreenService.stopLoading();
            // $('#popup_ValidateTCReprocessBilling').modal('show');
          } else { this.loadingScreenService.stopLoading(); this.alertService.showWarning(apiResult.Message) }
        }, err => {

        })
    }).catch(error => {


    });

  }

  modal_dismiss_validateTCReprocessBilling() {
    $('#popup_ValidateTCReprocessBilling').modal('hide');

  }
  processEmployee() {

    this.validatedEmployees.forEach(eve => {
      eve['PayCycleId'] = this.dataset.find(x => x.EmployeeId == eve.EmployeeId && x.TimeCardId == eve.TimeCardId).PayCycleId;
      eve['EmploymentContractId'] = this.dataset.find(x => x.EmployeeId == eve.EmployeeId && x.TimeCardId == eve.TimeCardId).EmploymentContractId;
    });
    setTimeout(() => {

      // $('#popup_ValidateTCReprocessBilling').modal('hide');
      if (this.validatedEmployees.filter(z => z.EmployeeStatus == '').length > 0) {
        // var isBatchexist = [];
        // isBatchexist = this.selectedItems.filter(a => a.StatusCode === TimeCardStatus.MarkupCalculationFailed);

        // if (isBatchexist.length == 0) {
        //   this.alertService.showWarning("Your request cannot make and Process! You have selected item that contains already invalid transaction status.");
        //   return;
        // }
        console.log('this.validatedEmployees', this.validatedEmployees);

        this.disbaleButtonAfterClicked = true;
        this.loadingScreenService.startLoading();
        var lstMarkUpCalc = [];
        this.validatedEmployees.forEach(obj => {
          if (obj.EmployeeStatus == '') {
            var markupCalculationMessage = new MarkupCalculationMessage();
            markupCalculationMessage.CompanyId = this.sessionDetails.Company.Id;
            markupCalculationMessage.ClientContractId = this.BehaviourObject_Data.clientcontractId;
            markupCalculationMessage.TeamId = this.BehaviourObject_Data.payperiodId
            markupCalculationMessage.PayCycleId = obj.PayCycleId;
            markupCalculationMessage.EmployeeId = obj.EmployeeId;
            markupCalculationMessage.EmploymentContractId = obj.EmploymentContractId;
            markupCalculationMessage.ProcessCategory = ProcessCategory.Any;
            markupCalculationMessage.TimeCardId = obj.TimeCardId;
            markupCalculationMessage.IsPushedtoQueue = true;
            markupCalculationMessage.Remarks = "";
            markupCalculationMessage.SessionDetails = null;
            lstMarkUpCalc.push(markupCalculationMessage);
          }
        });


        this.payrollService.post_ProcessBilling(lstMarkUpCalc)
          .subscribe((result) => {
            this.disbaleButtonAfterClicked = false;
            let apiResult: apiResult = result;
            if (apiResult.Status) {
              // this.SubmitButtonText = "Re-Create SO";
              this.processedEMP = apiResult.Result as any;
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.selectedItems = [];
              this.validatedEmployees = [];
              this.getDataset();
              $('#popup_chooseCategory').modal('show');
            } else { this.loadingScreenService.stopLoading; this.alertService.showWarning(apiResult.Message) }
          }, err => {

          })
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning("Some  employee(s) cannot be processed. They were either already initiated or access was denied.");
        return;
      }
    }, 1000);
  }
  modal_dismiss2() {
    $('#popup_chooseCategory').modal('hide');

  }

  re_CreateSaleOrder() {
    this.alertService.confirmSwal("Confirmation", "Are you sure want to re-create Sale Order", "Confirm").then((result) => {

      this.loadingScreenService.startLoading();
      this.payrollService.get_ValidateRecreateSo(this.transactionValue)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            let jobj = JSON.parse(apiResult.Result);
            console.log('jobj', jobj);
            if (jobj[0].IsValid != true && jobj[0].IsPayOutExists != false) {
              this.alertService.showWarning(jobj[0].Message);
              this.loadingScreenService.stopLoading();
              return;
            } else {


              this.ValidateAndRemoveSO(this.inSaleOrdersList);
            }
          }
        }, err => {


        })
    }).catch(error => {


    });
  }

  ValidateAndRemoveSO(saleOrdersList) {

    this.payrollService.put_VoidSaleOrder(saleOrdersList)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.inSaleOrdersList = [];
          this.re_createSO();
        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();
        }

      }, err => {

      })
  }

  re_createSO() {
    console.log('dataset', this.dataset);

    let PayRunId = 0;
    let LstSubmitForPayRun = [];
    this.dataset.forEach(event => {
      var submitListObject = new PayRunDetails();
      PayRunId = event.PayRunId;
      submitListObject.EmployeeId = event.EmployeeId;
      submitListObject.EmployeeCode = event.EmployeeCode;
      submitListObject.TimeCardId = event.TimeCardId;
      submitListObject.EmployeeName = event.EmployeeName;
      submitListObject.TimecardStatus = TimeCardStatus.BillingTransactionCreated;
      submitListObject.PaytransactionId = event.PaytransactionId;
      submitListObject.GrossEarn = event.GrossEarn;
      submitListObject.GrossDedn = event.GrossDedn;
      submitListObject.NetPay = event.NetPay;
      submitListObject.InvoiceIds = null;
      submitListObject.ModeType = UIMode.Edit;
      submitListObject.Id = this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun" ? event.Id : 0;
      LstSubmitForPayRun.push(submitListObject);
    });
    var submitObject = new PayRun();
    submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
    submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
    submitObject.CompanyId = this.sessionDetails.Company.Id;
    submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
    submitObject.ClientId = this.BehaviourObject_Data.clientId;
    submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
    submitObject.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
    submitObject.TeamIds = [];
    this.selectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
    submitObject.TeamIds = _.union(submitObject.TeamIds)
    // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
    submitObject.NumberOfEmpoyees = this.dataset.length;
    submitObject.NoOfSaleOrders = 0;
    submitObject.PayRunStatus = PayRunStatus.Intitated;
    submitObject.Id = this.code_for_SO == "editPayRun" || this.code_for_SO == "managePayRun" ? PayRunId : 0;
    submitObject.LstPayrunDetails = LstSubmitForPayRun;
    submitObject.ModeType = UIMode.Edit;
    this._initiate_SaleOrders(submitObject)
  }

  removeEmployee_btn() {

    if (this.code_for_SO === 'PayOut_Edit' && this.inEmployeesSelectedItems.length == 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
    else if (this.code_for_SO !== 'PayOut_Edit' && this.code_for_SO !== "initiatePayOut" && this.selectedItems.length == 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    } else if ((this.code_for_SO === "initiatePayOut" || this.code_for_SO === "reinitiatePayOut") && this.inEmployeesSelectedItems.length == 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }


    else if (this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun") {
      if ((this.code_for_SO === 'editPayRun' || this.code_for_SO == "managePayRun") && this.selectedItems.filter(a => a.Status === 'PayoutBatchCreated').length > 0) {
        this.alertService.showWarning("The Employee(s) record cannot be removed. This version of this payout batch is already Prepared.");
        return;
      }


      this.alertService.confirmSwalWithClose("Confirmation", "Do you want to remove more employee(s)", "Yes, I want to Remove", "No, Proceed").then((result) => {

        if (this.BusinessType == 3) {
          this.payrollService.get_ValidateRecreateSo(this.selectedItems[0].PayRunId)
            .subscribe((result) => {
              let apiResult: apiResult = result;
              if (apiResult.Status) {
                let jobj = JSON.parse(apiResult.Result);
                console.log('jobj', jobj);
                if (jobj[0].IsValid != true && jobj[0].IsPayOutExists != false) {
                  this.alertService.showWarning(jobj[0].Message);
                  return;
                } else {

                  this.removeSO(this.inSaleOrdersList, false);
                }
              }
            }, err => {

            })
        } else {
          this.delete_employee_record(false);
        }
      }).catch(error => {

        this.BusinessType == 3 ? this.removeSO(this.inSaleOrdersList, true) : this.delete_employee_record(false);;

      });
    }


    else {

      if (this.code_for_SO === 'PayOut_Edit' && _.findIndex(this.inEmployeesSelectedItems, function (o) { return o.PayOutStatus === PayOutStatus.ReleaseBatchPrepared; }) === 0) {
        this.alertService.showWarning("The Employee(s) record cannot be removed. This version of this payout batch is already Prepared.");
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
        title: `Are you sure you want to remove this Employee?`,
        text: (this.code_for_SO === "initiatePayOut" || this.code_for_SO === "PayOut_Edit") ? "Once deleted, you cannot undo this action." : "This action will create and open the new sale record.",
        type: 'warning',
        showCancelButton: true,
        confirmButtonText: (this.code_for_SO === "initiatePayOut" || this.code_for_SO === "PayOut_Edit") ? "Yes, Remove" : "Yes, Create Sale",
        cancelButtonText: 'Not now',
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false
      }).then((res) => {
        if (res.value) {
          (this.code_for_SO === "initiatePayOut" || this.code_for_SO === "PayOut_Edit") ? this.delete_employee_record_payout() : this.delete_employee_record(true);
        } else if (res.dismiss === Swal.DismissReason.cancel) {
        }
      })
    }
  }
  removeSO(saleOrdersList, btnaction) {

    this.payrollService.put_VoidSaleOrder(saleOrdersList)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.inSaleOrdersList = [];
          btnaction === true ? this.delete_employee_record(true) : this.delete_employee_record(false);
        }

      }, err => {

      })
  }

  delete_employee_record_payout() {
    const LstRemoveEmployees = [];
    if (this.inEmployeesSelectedItems.length > 0) {
      this.loadingScreenService.startLoading();
      this.inEmployeesSelectedItems.forEach(element => {
        this.inEmployeesGridInstance.gridService.deleteDataGridItemById(element.Id);
        var rmObject = new PayoutInformationDetails();
        rmObject.Id = element.Id;
        rmObject.PayoutInformationId = element.PayoutInformationId;
        rmObject.TimeCardId = element.TimeCardId;
        rmObject.EmployeeId = element.EmployeeId;
        rmObject.EmployeeName = element.EmployeeName;
        rmObject.BankName = element.BankName;
        rmObject.IFSCCode = element.IFSCCode;
        rmObject.AccountNumber = element.AccountNumber;
        rmObject.MobileNumber = element.MobileNumber;
        rmObject.UPIId = element.UPIId;
        rmObject.PayPeriodId = element.PayPeriodId;
        rmObject.PayPeriodName = element.PayPeriodName;
        rmObject.Narration = element.Narration;
        rmObject.NetPay = element.NetPay;
        rmObject.ExternalRefCode = element.ExternalRefCode;
        rmObject.AcknowledgmentDetail = element.AcknowledgmentDetail;
        rmObject.IsPaymentDone = element.IsPaymentDone;
        rmObject.Status = PayOutDetailsStatus.Voided;
        rmObject.IsPaymentHold = element.IsPaymentHold;
        rmObject.PayTransactionId = element.PayTransactionId;
        rmObject.ModeType = UIMode.Delete;
        LstRemoveEmployees.push(rmObject);
      });

      this.payrollService.remove_PayoutInformationDetails(JSON.stringify(LstRemoveEmployees))
        .subscribe((result) => {
          console.log('REMOVE FOR PAYOUT EMPLOYEE RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
            this.inEmployeesSelectedItems = []
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();

        });
    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
  }

  delete_employee_record(doRecreate: boolean) {
    const LstRemoveEmployees = [];
    const Lstforrm = [];
    console.log('this.dataset', this.dataset);
    this.selectedItems.forEach(element => {
      var rmObject = new RemovePayRunDetails();
      rmObject.Id = this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun" ? element.Id : this.SO_OP.Id;
      rmObject.EmployeeId = element.EmployeeId;
      rmObject.EmployeeCode = element.EmployeeCode;
      rmObject.EmployeeName = element.EmployeeName;
      rmObject.TimeCardId = element.TimeCardId;
      rmObject.TimeCardSatus = element.StatusCode;
      rmObject.PaytransactionId = element.PaytransactionId;
      rmObject.GrossDedn = element.GrossDedn;
      rmObject.GrossEarn = element.GrossEarn;
      rmObject.NetPay = element.NetPay;
      rmObject.InvoiceIds = '';
      rmObject.ModeType = UIMode.Delete;
      rmObject.PayrunId = this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun" ? element.PayRunId : this.SO_OP.Id;
      LstRemoveEmployees.push(rmObject);
      this.angularGrid.gridService.deleteDataGridItemById(element.Id);

    });

    this.payrollService.put_RemovePayrunDetails(JSON.stringify(LstRemoveEmployees))
      .subscribe((result) => {
        console.log('REMOVE FOR EMPLOYEE RESPONSE :: ', result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {

          this.loadingScreenService.stopLoading();
          if (doRecreate === true) { this.selectedItems = []; this.selectedItems = this.dataset }
          doRecreate === true && this.do_initiate_Sale_order();
          doRecreate === false && this.alertService.showSuccess(apiResult.Message)
          doRecreate === false && this.alertService.showSuccess(apiResult.Message);
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
          this.selectedItems = [];
          this.dataset();
        }
      }, error => {
        this.loadingScreenService.stopLoading();

      });
  }
  insertPayRun(insertItems, doCreateSO) {
    this.LstSubmitForPayRun = [];
    insertItems.forEach(event => {
      var submitListObject = new PayRunDetails();
      submitListObject.EmployeeId = event.EmployeeId;
      submitListObject.EmployeeCode = event.EmployeeCode;
      submitListObject.TimeCardId = event.TimeCardId;
      submitListObject.EmployeeName = event.EmployeeName;
      submitListObject.TimecardStatus = this.BusinessType == 1 ? TimeCardStatus.ClientApproved : TimeCardStatus.BillingTransactionCreated;
      submitListObject.PaytransactionId = event.PayTransactionId;
      submitListObject.GrossEarn = event.GrossEarn;
      submitListObject.GrossDedn = event.GrossDedn;
      submitListObject.NetPay = event.NetPay;
      submitListObject.InvoiceIds = null;
      submitListObject.ModeType = UIMode.Edit;
      submitListObject.Id = 0;
      this.LstSubmitForPayRun.push(submitListObject);
      // this.angularGrid.gridService.addItems(result);

    });
    var submitObject = new PayRun();
    submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
    submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
    submitObject.CompanyId = this.sessionDetails.Company.Id;
    submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
    submitObject.ClientId = this.BehaviourObject_Data.clientId;
    submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
    submitObject.TeamIds = [];
    submitObject.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
    //  submitObject.TeamIds.push();
    insertItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) });
    submitObject.TeamIds = _.union(submitObject.TeamIds)

    submitObject.NumberOfEmpoyees = this.selectedItems.length;
    submitObject.NoOfSaleOrders = 0;
    submitObject.PayRunStatus = PayRunStatus.Intitated;
    submitObject.Id = this.transactionValue;
    submitObject.LstPayrunDetails = this.LstSubmitForPayRun;
    submitObject.ModeType = UIMode.Edit;
    this.payRunModel = _PayRun;
    this.payRunModel.NewDetails = submitObject;
    console.log('INSERT PAYRUN MODEL : ', this.payRunModel);
    this.payrollService.PUT_UpsertPayRun(JSON.stringify(this.payRunModel))
      .subscribe((result) => {
        console.log('INSERT FOR UPSERT PAYRUN RESPONSE ::', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          // this.loadingScreenService.stopLoading();
          let result = (apiResult.Result) as any;
          this.selectedItems = [];
          this.dataset = [];
          if (this.BusinessType == 3) {
            this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
              this.spinner = false;
              if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
                this.dataset = JSON.parse(dataset.dynamicObject);
                const LstSubmitForPayRun = [];
                let PayRunId = 0;
                console.log('dataset', this.dataset);
                console.log('dataset leng', this.dataset.length);

                this.dataset.forEach(event => {
                  var submitListObject = new PayRunDetails();
                  PayRunId = event.PayRunId;
                  submitListObject.EmployeeId = event.EmployeeId;
                  submitListObject.EmployeeCode = event.EmployeeCode;
                  submitListObject.TimeCardId = event.TimeCardId;
                  submitListObject.EmployeeName = event.EmployeeName;
                  submitListObject.TimecardStatus = TimeCardStatus.BillingTransactionCreated;
                  submitListObject.PaytransactionId = event.PaytransactionId;
                  submitListObject.GrossEarn = event.GrossEarn;
                  submitListObject.GrossDedn = event.GrossDedn;
                  submitListObject.NetPay = event.NetPay;
                  submitListObject.InvoiceIds = null;
                  submitListObject.ModeType = UIMode.Edit;
                  submitListObject.Id = event.Id;
                  LstSubmitForPayRun.push(submitListObject);
                });
                var submitObject = new PayRun();
                submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
                submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
                submitObject.CompanyId = this.sessionDetails.Company.Id;
                submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
                submitObject.ClientId = this.BehaviourObject_Data.clientId;
                submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
                submitObject.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
                submitObject.TeamIds = [];
                // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
                this.dataset.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
                submitObject.TeamIds = _.union(submitObject.TeamIds)

                submitObject.NumberOfEmpoyees = this.dataset.length;
                submitObject.NoOfSaleOrders = 0;
                submitObject.PayRunStatus = PayRunStatus.Intitated;
                submitObject.Id = PayRunId;
                submitObject.LstPayrunDetails = LstSubmitForPayRun;
                submitObject.ModeType = UIMode.Edit;
                console.log('initiate so', submitObject);
                doCreateSO === true ? this._initiate_SaleOrders(submitObject) : this.loadingScreenService.stopLoading();
                doCreateSO === false ? this.inSaleOrdersList = [] : null;
              }
            }, error => {
              this.spinner = false;
              console.log(error);
            })
          } else {
            this.getDataset();
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
          }

        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();

      });
  }


  /* #endregion */


  // FOR SALE ORDER TABSET ACTIONS AND TABLE CONFIGUARION MANUAL SETTINGS

  inSaleOrdersGridReady(angularGrid: AngularGridInstance) {
    this.inSaleOrdersGridInstance = angularGrid;
    this.inSaleOrdersDataView = angularGrid.dataView;
    this.inSaleOrdersGrid = angularGrid.slickGrid;
    this.inSaleOrdersGridService = angularGrid.gridService;
  }
  loadinSaleOrdersRecords() {
    this.inSaleOrdersGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
      },
      enableAutoResize: true,
      editable: false,
      enableColumnPicker: true,
      enableCellNavigation: false,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true,
      rowSelectionOptions: {
        selectActiveRow: false
      },
      checkboxSelector: {
        hideSelectAllCheckbox: false
      },
      datasetIdPropertyName: "Id"
    };
    this.inSaleOrdersColumnDefinitions = [
      {
        id: 'Number', name: 'SO #', field: 'Number',
        sortable: true,
        minWidth: 100,
        maxWidth: 100,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'BillToContactName', name: 'Bill To', field: 'BillToContactName',
        filterable: true,
        sortable: true,
        type: FieldType.string
      },
      {
        id: 'BillableAmount', name: 'Bill Amt', field: 'BillableAmount',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'TotalMarkup', name: 'Service Fee', field: 'TotalMarkup',
        sortable: true,
        type: FieldType.string,
        filterable: true,

      },
      {
        id: 'TotalServiceTax', name: 'Service Tax', field: 'TotalServiceTax',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'TotalBillAmount', name: 'Total Bill Amt', field: 'TotalBillAmount',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'Status', name: 'Status', field: 'Status',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },

      {
        id: 'edit',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: Formatters.editIcon,
        minWidth: 50,
        maxWidth: 50,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          this.do_editSO_SingleItem(args.dataContext, "PayInputs");

        }
      },

      {
        id: 'preview',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.previewFormatter,
        minWidth: 50,
        maxWidth: 50,
        // use onCellClick OR grid.onClick.subscribe which you can see down below
        onCellClick: (e: Event, args: OnEventArgs) => {
          console.log(args.dataContext);
          this.preview_Employees(args.dataContext);

        }
      },

    ];
  }

  onSelectedRowsChanged1(data, args) {
    this.selectedItems1 = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inSaleOrdersDataView.getItem(row);
        this.selectedItems1.push(row_data);
      }
    }
    console.log('SELECTED ITEMS SO :', this.selectedItems1);
  }

  do_editSO_SingleItem(args, index) {

    console.log('BEHAVIOUR OBJECT REC :', args);
    const modalRef = this.modalService.open(SaleorderModalComponent, this.modalOption);
    var objJson = JSON.stringify(args)
    modalRef.componentInstance.objJson = objJson;
    modalRef.componentInstance.CoreJson = JSON.stringify({ ClientName: this.BehaviourObject_Data.ClientName, ClientContractId: this.BehaviourObject_Data.clientcontractId, ClientId: this.BehaviourObject_Data.clientId });
    modalRef.componentInstance.ContentArea = index;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('RESULT OF EDITED SO DETAILS :', result);
        index === "PayInputs" && this.get_SaleOrdersByPayRunId(this.transactionValue);
        index === "PayOut" && this.angularGrid.gridService.updateDataGridItemById(result.Id, result, true, true);

      }


    }).catch((error) => {
      console.log(error);
    });

  }

  hasJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
        || type === '[object Array]';

    } catch (err) {
      return false;
    }
  }


  preview_Employees(args) {
    console.log('args', args);

    this._SliderJson = null;
    this.billingTransaction = [];
    this.billingTransaction = args.BillingTransactionList;
    this._SliderJson = args;
    this._SliderJson.BillToAddressDetails = this.hasJsonStructure(this._SliderJson.BillToAddressDetails) === true ? JSON.parse(this._SliderJson.BillToAddressDetails) : this._SliderJson.BillToAddressDetails;
    this._SliderJson.ShipToAddressDetails = this.hasJsonStructure(this._SliderJson.ShipToAddressDetails) === true ? JSON.parse(this._SliderJson.ShipToAddressDetails) : this._SliderJson.ShipToAddressDetails;
    this.visible = true;
  }
  close(): void {
    this.visible = false;
  }

  // invalidValue(typ: any, val: any): never {
  //   throw Error(`Invalid value ${JSON.stringify(val)} for type ${JSON.stringify(typ)}`);
  // }

  do_confirm_Sale_order() {

    console.log('BehaviourObject_Data', this.BehaviourObject_Data);

    if (this.inSaleOrdersList.length != this.selectedItems1.length) {
      this.alertService.showWarning("Note: For Confirm sale order requires all the items!");
      return;
    }

    if (this.selectedItems1.length > 0) {
      this.loadingScreenService.startLoading();
      // let LstSO = [];
      // let LstConfirmPayRunSO = [];

      // this.selectedItems1.forEach((e) => {

      //   console.log('ee',e);

      //   let LstBillingTransaction = [];
      //   // e.BillingTransactionList.forEach(bill => {
      //   //   var confirmBillingTransaction = new BillingTransaction();
      //   //   confirmBillingTransaction.CompanyId = bill.CompanyId;
      //   //   confirmBillingTransaction.ClientId = bill.ClientId;
      //   //   confirmBillingTransaction.ClientContractId = bill.ClientContractId;
      //   //   confirmBillingTransaction.TeamId = bill.TeamId;
      //   //   confirmBillingTransaction.PersonId = bill.PersonId;
      //   //   confirmBillingTransaction.EmployeeId = bill.EmployeeId;
      //   //   confirmBillingTransaction.EmployeeName = bill.EmployeeName;
      //   //   confirmBillingTransaction.CandidateId = bill.CandidateId;
      //   //   confirmBillingTransaction.TimeCardId = bill.TimeCardId;
      //   //   confirmBillingTransaction.PayCycleId = bill.PayCycleId;
      //   //   confirmBillingTransaction.PayPeriodId = bill.PayPeriodId;
      //   //   confirmBillingTransaction.FinancialPeriodId = bill.FinancialPeriodId;
      //   //   confirmBillingTransaction.SaleOrderId = bill.SaleOrderId;
      //   //   confirmBillingTransaction.InvoiceId = bill.InvoiceId;
      //   //   confirmBillingTransaction.ProcessCategory = bill.ProcessCategory;
      //   //   // confirmBillingTransaction.BillProductId = bill.BillProductId;
      //   //   // confirmBillingTransaction.OriginalBillingItemId = bill.OriginalBillingItemId;
      //   //   // confirmBillingTransaction.Remarks = bill.Remarks;
      //   //   confirmBillingTransaction.Cost = bill.Cost;
      //   //   confirmBillingTransaction.Markup = bill.Markup;
      //   //   confirmBillingTransaction.AdjustedMarkup = bill.AdjustedMarkup;
      //   //   confirmBillingTransaction.BillableAmount = bill.BillableAmount;
      //   //   confirmBillingTransaction.BillableUnits = bill.BillableUnits;
      //   //   confirmBillingTransaction.TotalMarkup = bill.TotalMarkup;
      //   //   confirmBillingTransaction.TotalTax = bill.TotalTax;
      //   //   confirmBillingTransaction.TotalBillAmount = bill.TotalBillAmount;
      //   //   confirmBillingTransaction.Id = bill.Id;
      //   //   LstBillingTransaction.push(confirmBillingTransaction);
      //   // });



      // console.log('this.SO_OP',this.inSaleOrdersList);



      //   var confrimSO_Obj = new SaleOrder();
      //   confrimSO_Obj.Number = e.Number;
      //   confrimSO_Obj.ClientId = e.ClientId;
      //   confrimSO_Obj.ClientName = e.ClientName
      //   confrimSO_Obj.ClientContractId = e.ClientContractId;
      //   confrimSO_Obj.ProcessCategory = ProcessCategory.Salary;

      //   confrimSO_Obj.PayCycleId = e.PayCycleId;
      //   confrimSO_Obj.PayPeriodId= e.PayPeriodId;
      //   confrimSO_Obj.FinancialYearId= e.FinancialYearId;
      //   confrimSO_Obj.Month= e.Month;
      //   confrimSO_Obj.Year= e.Year;
      //   confrimSO_Obj.BillableAmount= e.BillableAmount;
      //   confrimSO_Obj.BillableAmountForMarkup= e.BillableAmountForMarkup;
      //   confrimSO_Obj.BillableAmountForServiceTax= e.BillableAmountForServiceTax;
      //   confrimSO_Obj.TotalDiscount= e.TotalDiscount;
      //   confrimSO_Obj.TotalMarkup= e.TotalMarkup;
      //   confrimSO_Obj.TotalServiceTax= e.TotalServiceTax;
      //   confrimSO_Obj.TotalBillAmount= e.TotalBillAmount;
      //   confrimSO_Obj.AdjustedBillAmount= e.AdjustedBillAmount;
      //   confrimSO_Obj.AdjustedInvoiceId= e.AdjustedInvoiceId;

      //   confrimSO_Obj.Currency= e.Currency;
      //   confrimSO_Obj.CompanyGSTN= e.CompanyGSTN;
      //   confrimSO_Obj.ClientGSTN= e.ClientGSTN;

      //   confrimSO_Obj.CompanyBankAccountId= e.CompanyBankAccountId;
      //   confrimSO_Obj.CompanyBankAccountDetails= e.CompanyBankAccountDetails;


      //   confrimSO_Obj.CompanyBranchId= e.CompanyBranchId;
      //   confrimSO_Obj.CompanyBranchName= e.CompanyBranchName;
      //   confrimSO_Obj.CompanyAddressDetails= e.CompanyAddressDetails;

      //   confrimSO_Obj.BillToClientContactLocationMappingId= e.BillToClientContactLocationMappingId;
      //   confrimSO_Obj.BillToClientContactId= e.BillToClientContactId;
      //   confrimSO_Obj.BillToClientLocationId= e.BillToClientLocationId;        
      //   confrimSO_Obj.BillToContactName= e.BillToContactName;
      //   confrimSO_Obj.BillToAddressDetails= e.BillToAddressDetails;

      //   confrimSO_Obj.ShipToClientContactId= e.ShipToClientContactId;
      //   confrimSO_Obj.ShipToContactName= e.ShipToContactName;
      //   confrimSO_Obj.ShipToAddressDetails= e.ShipToAddressDetails;
      //   confrimSO_Obj.Narration= e.Narration;
      //   confrimSO_Obj.Remarks= e.Remarks;
      //   confrimSO_Obj.GroupingInfo= e.GroupingInfo;
      //   confrimSO_Obj.BillingTransactionList=LstBillingTransaction;
      //   confrimSO_Obj.ServiceTaxList = e.ServiceTaxList;
      //   // confrimSO_Obj.AppliedPOList: AppliedPOInfo[];//tempfor now
      //   confrimSO_Obj.ValidationInfoList = e.ValidationInfoList;
      //   confrimSO_Obj.AdjustmentList = e.AdjustmentList;
      //   confrimSO_Obj.Status = e.Status;
      //   confrimSO_Obj.PayRunId = e.PayRunId;

      //   confrimSO_Obj.ReferenceSaleOrder= e.ReferenceSaleOrder;
      //   confrimSO_Obj.ExpectedCollectionMode = e.CollectionMode;
      //   LstSO.push(confrimSO_Obj);
      // });

      // var submitObject = new PayRun();
      // submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
      // submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
      // submitObject.CompanyId = this.sessionDetails.Company.Id;
      // submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      // submitObject.ClientId = this.BehaviourObject_Data.clientId;
      // submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      // submitObject.TeamIds = [];
      // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
      // submitObject.NumberOfEmpoyees = 0;
      // submitObject.NoOfSaleOrders = this.selectedItems1.length;
      // submitObject.PayRunStatus = PayRunStatus.Intitated;
      // submitObject.Id = this.payRunModel.OldDetails.Id;
      // submitObject.LstPayrunDetails = this.payRunModel.OldDetails.LstPayrunDetails;
      // submitObject.SaleOrders = LstSO;
      // LstConfirmPayRunSO.push(submitObject);
      // this.payRunModel.NewDetails = submitObject;
      // console.log('PAYRUN MODEL : ', this.payRunModel);

      this.selectedItems1.forEach((e: SaleOrder) => {
        e.ProcessCategory = ProcessCategory.Salary;
      });
      this.payrollService.put_ConfirmSaleOrder(JSON.stringify(this.selectedItems1))
        .subscribe((result) => {
          console.log('SUBMIT FOR SO CONFIRM RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.selectedItems1.forEach(element => {
              this.alertService.showSuccess('Well done! Your Sale Order has been updated. Sale Order No : ' + element.Number)
            });
            this.alertService.showSuccess(apiResult.Message);
            // this.selectedItems = [];
            // this.getDataset();
            // const SO_OP: PayRun = (apiResult.Result) as any;
            // this.inSaleOrdersList = SO_OP.SaleOrders;
            // this.inSaleOrdersList.forEach(element => {
            //   element.Id = 0;
            //   element.Id = UUID.UUID();
            // });

            // this.activeTabName = "SALEORDER";
            // this.loadinSaleOrdersRecords();
            // console.log('LstSaleOrderOutput : ', this.inSaleOrdersList);

            this.router.navigateByUrl('app/payroll/salaryTransaction');

          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();

        });

    } else {
      this.alertService.showWarning("No Sale Order record(s) have been selected! Please first select");
      return;
    }
  }

  confirmExit() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: this.SO_OP ? `Do you want to leave this transaction?` : "Are you sure?",
      text: this.SO_OP ? "Are you sure you want to leave this page" : "Are you sure you want to leave this page",
      // text: this.SO_OP ? "Changes you made may not be saved. All associated data will also be deleted. Please submit your pending Sale Order Creation!" : "Are you sure you want to leave this page",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: "Stay on this page",
      cancelButtonText: 'Leave this page',
      reverseButtons: true,
      allowEscapeKey: false,
      allowOutsideClick: false
    }).then((res) => {
      if (res.value) {

      } else if (res.dismiss === Swal.DismissReason.cancel) {
        let urlName = this.sessionService.getSessionStorage("SO_Navigation_URL");


        if (this.code_for_SO == 'reinitiatePayOut') {
          this.router.navigateByUrl('app/listing/ui/rejectedPayout')
        }
        else if (this.code_for_SO != "initiatePayOut" && this.SO_OP) {
          // this.BusinessType == 3 ? this.router.navigateByUrl('app/payroll/salaryTransaction') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');

          if (this.BusinessType === 3) {

            if (this.BehaviourObject_Data != undefined && this.BehaviourObject_Data != null) {
              if (this.BehaviourObject_Data.ProcessCategory == 2) {
                this.router.navigateByUrl('app/payroll/adhoc');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 3) {
                this.router.navigateByUrl('app/payroll/reimbursement');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 4) {
                this.router.navigateByUrl('app/fnf/fnftransaction');
              }
              else {
                this.router.navigateByUrl('app/payroll/payroll/salaryTransaction')
              }
            }
            else {
              this.router.navigateByUrl('app/payroll/payroll/salaryTransaction');
            }
          }
          else if (this.BusinessType !== 3) {

            if (this.BehaviourObject_Data !== undefined && this.BehaviourObject_Data !== null) {
              if (this.BehaviourObject_Data.ProcessCategory == 2) {
                this.router.navigateByUrl('app/payroll/adhoc');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 3) {
                this.router.navigateByUrl('app/payroll/reimbursement');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 4) {
                this.router.navigateByUrl('app/fnf/fnftransaction');
              }
              else {
                this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')
              }
            }
            else {
              this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
            }
          }

          // this.loadingScreenService.startLoading();
          // this.payrollService.delete_PayRun(this.SO_OP.Id)
          //   .subscribe((result) => {
          //     console.log('DELETE PAYRUN :: ', result);
          //     const apiResult: apiResult = result;
          //     if (apiResult.Status) {
          //       this.loadingScreenService.stopLoading();
          //       this.router.navigateByUrl('app/payroll/salaryTransaction');

          //     } else {
          //       this.loadingScreenService.stopLoading();
          //     }
          //   }, error => {
          //     this.loadingScreenService.stopLoading();

          //   });
        } else if (this.code_for_SO === "initiatePayOut" && this._PayOutInfo) {

          // this.BusinessType == 3 ? this.router.navigateByUrl('app/payroll/salaryTransaction') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
          if (this.BusinessType === 3) {

            if (this.BehaviourObject_Data != undefined && this.BehaviourObject_Data != null) {
              if (urlName != "SaleOrder" && this.BehaviourObject_Data.ProcessCategory == 2) {
                this.router.navigateByUrl('app/payroll/adhoc');
              }
              else if (urlName != "SaleOrder" && this.BehaviourObject_Data.ProcessCategory == 3) {
                this.router.navigateByUrl('app/payroll/reimbursement');
              }
              else if (urlName != "SaleOrder" && this.BehaviourObject_Data.ProcessCategory == 4) {
                this.router.navigateByUrl('app/fnf/fnftransaction');
              }
              else {
                urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransaction')
              }
            }
            else {
              urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransaction')

              // this.router.navigateByUrl('app/payroll/salaryTransaction');
            }
          }
          else if (this.BusinessType !== 3) {

            if (this.BehaviourObject_Data !== undefined && this.BehaviourObject_Data !== null) {
              if (this.BehaviourObject_Data.ProcessCategory == 2) {
                this.router.navigateByUrl('app/payroll/adhoc');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 3) {
                this.router.navigateByUrl('app/payroll/reimbursement');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 4) {
                this.router.navigateByUrl('app/fnf/fnftransaction');
              }
              else {
                urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')

                // this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')
              }
            }
            else {
              urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')

              // this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
            }
          }

          // this.loadingScreenService.startLoading();
          // this.payrollService.delete_PayOut(this._PayOutInfo.Id)
          //   .subscribe((result) => {
          //     console.log('DELETE PAYOUT :: ', result);
          //     const apiResult: apiResult = result;
          //     if (apiResult.Status) {
          //       this.loadingScreenService.stopLoading();
          //       this.router.navigateByUrl('app/payroll/salaryTransaction');

          //     } else {
          //       this.loadingScreenService.stopLoading();
          //     }
          //   }, error => {
          //     this.loadingScreenService.stopLoading();

          //   });
        }

        else {
          if (this.BusinessType == 3) {
            if (this.BehaviourObject_Data != undefined && this.BehaviourObject_Data != null) {
              if (urlName != "SaleOrder" && this.BehaviourObject_Data.ProcessCategory == 2) {
                this.router.navigateByUrl('app/payroll/adhoc');
              }
              else if (urlName != "SaleOrder" && this.BehaviourObject_Data.ProcessCategory == 3) {
                this.router.navigateByUrl('app/payroll/reimbursement');
              }
              else if (urlName != "SaleOrder" && this.BehaviourObject_Data.ProcessCategory == 4) {
                this.router.navigateByUrl('app/fnf/fnftransaction');
              }
              else {
                urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransaction')

                // this.router.navigateByUrl('app/payroll/salaryTransaction')
              }
            }
            else {
              urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransaction')

              // this.router.navigateByUrl('app/payroll/salaryTransaction');
            }
          }
          else if (this.BusinessType == 1) {
            if (this.BehaviourObject_Data !== undefined && this.BehaviourObject_Data !== null) {
              if (this.BehaviourObject_Data.ProcessCategory == 2) {
                this.router.navigateByUrl('app/payroll/adhoc');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 3) {
                this.router.navigateByUrl('app/payroll/reimbursement');
              }
              else if (this.BehaviourObject_Data.ProcessCategory == 4) {
                this.router.navigateByUrl('app/fnf/fnftransaction');
              }
              else {
                urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')

                // this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')
              }
            }
            else {
              urlName == "SaleOrder" ? this.router.navigateByUrl('app/listing/ui/SaleOrders') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions')

              // this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
            }
          }
        }

      }
    })
  }

  delete_payrun(Id) {
    this.payrollService.delete_PayRun(Id)
      .subscribe((result) => {
        console.log('DELETE PAYRUN :: ', result);
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          // this.loadingScreenService.stopLoading();
          // this.router.navigateByUrl('app/payroll/salaryTransaction');

        } else {
          // this.loadingScreenService.stopLoading();
        }
      }, error => {
        // this.loadingScreenService.stopLoading();

      });
  }





  download_billingsheet_modal() {

    if (this.selectedItems1.length > 0) {
      const modalRef = this.modalService.open(DownloadBillingSheetModalComponent, this.modalOption);
      modalRef.componentInstance.ClientName = this.BehaviourObject_Data.ClientName;
      modalRef.componentInstance.PayPeriod = this.BehaviourObject_Data.PayPeriod;
      modalRef.componentInstance.Team = this.BehaviourObject_Data.Team;
      modalRef.componentInstance.ContentArea = "PayRun";


      modalRef.componentInstance.LstSaleOrders = this.selectedItems1;
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          this.selectedItems1 = [];
          this.getDataset();
        }
      }).catch((error) => {
        console.log(error);
      });

    } else {
      this.alertService.showWarning("At least one checkbox must be selected.");
    }


  }


  getEmployeesList() {
    this.loadinEmployeesRecords();
    var rowData: any
    this.route.data.subscribe(data => {
      rowData = data.DataInterface.RowData;
      console.log('row', rowData);

    });

    this.payrollService.get_EmployeePayOutDetails(rowData.clientcontractId, rowData.payperiodId)
      .subscribe((result) => {
        console.log('rsult', result);
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.inEmployeesList = apiResult.Result as any;
          this.inEmployeesList.forEach(element => {
            element["Id"] = element.TimeCardId;
          });

          this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
            result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
          }, err => {

          })

        }
      })

  }

  // FOR PAY OUT EMPLOYEES TABSET ACTIONS AND TABLE CONFIGUARION MANUAL SETTINGS

  inEmployeesGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesGridInstance = angularGrid;
    this.inEmployeesDataView = angularGrid.dataView;
    this.inEmployeesGrid = angularGrid.slickGrid;
    this.inEmployeesGridService = angularGrid.gridService;
  }

  loadinEmployeesRecords() {
    this.inEmployeesGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
      },
      enableAutoResize: true,
      editable: false,
      enableColumnPicker: true,
      enableCellNavigation: false,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      showHeaderRow: true,
      rowSelectionOptions: {
        selectActiveRow: false
      },
      checkboxSelector: {
        hideSelectAllCheckbox: false
      },
      datasetIdPropertyName: "Id"
    };
    // if (this.code_for_SO != "PayOut_Edit") {
    let payoutinfoName = this.code_for_SO !== "PayOut_Edit" ? "PayoutInformationId" : "PayOutInformationId";

    this.inEmployeesColumnDefinitions = [
      {
        id: payoutinfoName, name: 'Batch #', field: payoutinfoName,
        sortable: true,
        type: FieldType.string,
        filterable: true

      },
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
        id: 'MobileNumber', name: 'Mobile No.', field: 'MobileNumber',
        sortable: true,
        type: FieldType.string,
        filterable: true
      },
      {
        id: 'IFSCCode', name: 'IFSC Code', field: 'IFSCCode',
        sortable: true,
        type: FieldType.string,
        filterable: true
      },
      {
        id: 'AccountNumber', name: 'Acc. No.', field: 'AccountNumber',
        sortable: true,
        type: FieldType.string,
        filterable: true
      },



      {
        id: 'NetPay', name: 'Net Pay', field: 'NetPay',
        sortable: true,
        type: FieldType.string,
        filterable: true
      },
      {
        id: 'AcknowledgmentDetail', name: 'UTR', field: 'AcknowledgmentDetail',
        sortable: true,
        type: FieldType.string,
        filterable: true

      },
      // // {
      // //   id: 'Status', name: 'Status', field: 'Status',
      // //   sortable: true,
      // //   type: FieldType.string,
      // //   filterable: true, filter: { model: Filters.compoundInputText }
      // // },
      // // {
      // //   id: 'edit',
      // //   field: 'Id',
      // //   excludeFromHeaderMenu: true,
      // //   formatter: Formatters.editIcon,
      // //   minWidth: 50,
      // //   maxWidth: 50,
      // //   // use onCellClick OR grid.onClick.subscribe which you can see down below
      // //   onCellClick: (e: Event, args: OnEventArgs) => {
      // //     console.log(args.dataContext);
      // //     this.do_editSO_SingleItem(args.dataContext, "PayOut");

      // //   }
      // },
    ];
    // }


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

  distinct(items, mapper) {
    if (!mapper) mapper = (item) => item;
    return items.map(mapper).reduce((acc, item) => {
      if (acc.indexOf(item) === -1) acc.push(item);
      return acc;
    }, []);
  }
  do_Raise_Request() { // unused method code 

    console.log(this.inEmployeesSelectedItems.length);
    console.log(this.inEmployeesList.length);
    if (this.inEmployeesSelectedItems.length === this.inEmployeesList.length) {
      if (this.inEmployeesSelectedItems.length > 0) {
        this.loadingScreenService.startLoading();
        let LstPayOutDet = [];
        var currentDate = new Date();
        this.inEmployeesSelectedItems.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = obj.PayoutInformationId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = this.BehaviourObject_Data.payperiodId
          childDetails.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
          childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = false
          childDetails.Status = PayOutDetailsStatus.Initiated;
          childDetails.IsPaymentHold = false;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          LstPayOutDet.push(childDetails)
        });

        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = this.payOutModel.OldDetails.Id;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName
        submitobjePayOut.CompanyBankAccountId = this.payOutModel.OldDetails.CompanyBankAccountId;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;

        this.code_for_SO !== "PayOut_Edit" ? submitobjePayOut.PayrunIds = [] : null;
        this.code_for_SO !== "PayOut_Edit" ? this.selectedItems.forEach(function (item) { submitobjePayOut.PayrunIds.push(item.PayrunId) }) : null;
        submitobjePayOut.PayrunIds = _.union(submitobjePayOut.PayrunIds)


        // this.code_for_SO !== "PayOut_Edit" ? 
        // submitobjePayOut.PayrunIds =  this.distinct(this.selectedItems, (item)=>item.PayrunId) : null;
        submitobjePayOut.RequestedBy = this.UserId;
        submitobjePayOut.RequesterName = this.PersonName;
        submitobjePayOut.RequestedOn = moment(currentDate).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedId = '';
        submitobjePayOut.ApproverName = '';
        submitobjePayOut.PayOutDate = moment(currentDate).format('YYYY-MM-DD');;
        submitobjePayOut.Status = PayOutStatus.Initiated;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;

        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = {};

        console.log('PAYRUN MODEL 2: ', this.payOutModel);
        // this.loadingScreenService.stopLoading();

        // return;
        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            console.log('UPSERT PAY RUN RESPONSE:: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(`PayOut # ${apiResult.Result} ` + apiResult.Message);
              this.inEmployeesSelectedItems = [];
              this.router.navigateByUrl('app/payroll/payroll/salaryTransaction');
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });

      } else {
        this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
        return;
      }
    } else {
      this.alertService.showWarning("Kindly Select all the records!");
      return;
    }

  }

  upsert2() {


    if (this.selectedItems.length > 0) {
      this.loadingScreenService.startLoading();
      let LstPayOutDet = [];
      var PayOutInfoId = 0;
      var currentDate = new Date();
      this.selectedItems.forEach(obj => {
        var childDetails = new PayoutInformationDetails();
        PayOutInfoId = obj.PayOutInformationId;
        childDetails.Id = obj.Id;
        childDetails.PayoutInformationId = obj.PayOutInformationId;
        childDetails.TimeCardId = obj.TimeCardId;
        childDetails.EmployeeId = obj.EmployeeId;
        childDetails.EmployeeName = obj.EmployeeName;
        childDetails.BankName = obj.BankName;
        childDetails.IFSCCode = obj.IFSCCode;
        childDetails.AccountNumber = obj.AccountNumber;
        childDetails.MobileNumber = obj.MobileNumber;
        childDetails.UPIId = obj.UPIId;
        childDetails.PayPeriodId = this.BehaviourObject_Data.payperiodId
        childDetails.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
        // childDetails.Narration = obj.Narration;
        childDetails.NetPay = obj.NetPay;
        childDetails.ExternalRefCode = "";
        childDetails.AcknowledgmentDetail = "";
        childDetails.IsPaymentDone = false
        childDetails.Status = PayOutDetailsStatus.Initiated;
        childDetails.IsPaymentHold = false;
        childDetails.ModeType = UIMode.Edit;
        childDetails.PayTransactionId = obj.PayTransactionId;
        LstPayOutDet.push(childDetails)
      });
      console.log('Payout Id', PayOutInfoId);

      let submitobjePayOut = new PayoutInformation();
      submitobjePayOut.Id = PayOutInfoId;
      submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
      submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
      submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
      // submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      // submitobjePayOut.CompanyBankAccountId = this.payOutModel.OldDetails.CompanyBankAccountId;
      // submitobjePayOut.PayrunIds = [];
      // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
      // submitobjePayOut.PayrunIds = this.selectedItems[0].PayrunId;
      submitobjePayOut.RequestedBy = this.UserId;
      submitobjePayOut.RequesterName = this.PersonName;
      submitobjePayOut.RequestedOn = moment(currentDate).format('YYYY-MM-DD');
      submitobjePayOut.ApprovedId = '';
      submitobjePayOut.ApproverName = '';
      submitobjePayOut.PayOutDate = moment(currentDate).format('YYYY-MM-DD');;
      submitobjePayOut.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
      submitobjePayOut.Status = PayOutStatus.Initiated;
      submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;

      this.payOutModel = _PayOutModel;
      this.payOutModel.NewDetails = submitobjePayOut;
      this.payOutModel.OldDetails = submitobjePayOut;

      console.log('PAYRUN MODEL 3: ', this.payOutModel);
      // this.loadingScreenService.stopLoading();

      // return;
      this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
        .subscribe((result) => {
          console.log('UPSERT PAY RUN RESPONSE:: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            this._PayOutInfo = apiResult.Result as any;
            this._LstPayoutEmployees_codemapping = []
            this.activeTabName = "BATCH";
            this.loadinEmployeesRecords();
            let datasource: DataSource = {
              Name: "GET_EMPLOYEELISTUSING_BATCHID",
              Type: DataSourceType.SP,
              IsCoreEntity: false
            }
            let searctElements: SearchElement[] = [
              {
                FieldName: "@batchId",
                Value: this._PayOutInfo.Id
              }
            ];
            this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
              this.spinner = false;
              if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
                let apiResult1 = JSON.parse(result.dynamicObject);
                console.log('apiResult', apiResult1);
                let PayoutStatus = this.utilsHelper.transform(PayOutStatus) as any;
                this._PayOutInfo["StatusName"] = PayoutStatus.find(a => a.id === this._PayOutInfo.Status).name;
                this._LstPayoutEmployees_codemapping = apiResult1;
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(apiResult.Message);
                this.payOutModel.OldDetails = apiResult.Result;
                this.inEmployeesList = this._PayOutInfo.LstPayoutInformationDetails;
                this.inEmployeesList.length > 0 && this.inEmployeesList.forEach(element => {
                  element['EmployeeCode'] = this._LstPayoutEmployees_codemapping.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
                });
                this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
                  result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
                }, err => {

                })
              }
            });

          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();

        });

    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }


  }


  getPayoutInformationById(payOutInformationId) {
    const promise = new Promise((res, rej) => {
      this.payrollService.GetPayoutInformationbyId(payOutInformationId).subscribe((result) => {
        const answer: apiResult = result;
        if (answer.Status) {
          res(answer.Result)
        } else {
          res(null);
        }
      });
    })
    return promise;
  }

  Upsert_Payout() {

    let invalidEmployees = [];
    console.log('Behavious Object :', this.BehaviourObject_Data);
    if (this.code_for_SO === "PayOut_Edit") {
      this.upsert2();
      return;
    }
    this.loadingScreenService.startLoading();
    var format = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;

    function isNumeric(n, x) {
      let isnum = /^\d+$/.test(n);
      if (isnum == false) {
        console.log('isnum', x);
        invalidEmployees.push(x.EmployeeCode);
      }
      // else {
      //   console.log('isnum :::::::::::::::::::::::::::', isnum);
      // }
      return isnum;

      // return !isNaN(parseFloat(n)) && isFinite(n);
    }

    this.loadingScreenService.startLoading();

    this.selectedItems.forEach(x => {
      if (x.AccountNumber == null || x.AccountNumber == '' || x.MobileNumber == null || x.MobileNumber == '') {
        invalidEmployees.push(x.EmployeeCode);
      }
      if (format.test(x.MobileNumber) == true || format.test(x.AccountNumber) == true) {
        invalidEmployees.push(x.EmployeeCode);

      }
      if (isNumeric(x.MobileNumber, x) == false || isNumeric(x.AccountNumber, x) == false) {
        invalidEmployees.push(x.EmployeeCode);

      }
      // if (x.NetPay == 0) {
      //   invalidEmployees.push(x.EmployeeCode);

      // }
      if ((Number(Math.sign(x.NetPay)) == -1 || Number(Math.sign(x.NetPay)) == 0)) {
        invalidEmployees.push(x.EmployeeCode);
      }
    });

    console.log('INVALID EMP ::', _.union(invalidEmployees).join(","));


    if (this.BusinessType == 3 && this.selectedItems.filter(z => z.MobileNumber == null || z.MobileNumber == '').length > 0) {
      this.alertService.showWarning(`The payout cannot be confirmed some of the employees does not have mobile number. Please provide the technical details and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }

    else if (this.BusinessType == 3 && this.selectedItems.filter(x => x.AccountNumber == null || x.AccountNumber == '').length > 0) {
      this.alertService.showWarning(`Attention : Payout cannot submit the employee: user does not have account details or Account Number contains some of special character (\/ :*?<>|). Please check the account details and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }

    else if (this.BusinessType == 3 && this.selectedItems.filter(x => format.test(x.MobileNumber) == true).length > 0) {
      this.alertService.showWarning(`Attention : Payout cannot submit the employee: Mobile Number is invalid . Please check the mobile number and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }
    else if (this.BusinessType == 3 && this.selectedItems.filter(x => isNumeric(x.MobileNumber, x) == false).length > 0) {
      this.alertService.showWarning(`Attention : Payout cannot submit the employee: Mobile Number is invalid - Make sure an input contains ONLY digits and no other characters.. Please check the mobile number and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }

    else if (this.BusinessType == 3 && this.selectedItems.filter(x => (x.MobileNumber).length < 10 || x.MobileNumber.length > 10).length > 0) {
      this.alertService.showWarning(`Attention : Payout cannot submit the employee: Mobile Number is invalid. Please check the mobile number and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }
    else if (this.BusinessType == 3 && this.selectedItems.filter(x => format.test(x.AccountNumber) == true).length > 0) {
      this.alertService.showWarning(`Attention : Payout cannot submit the employee: Account Number contains some of special character (\/ :*?<>|). Please check the account details and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }
    else if (this.BusinessType == 3 && this.selectedItems.filter(x => isNumeric(x.AccountNumber, x) == false).length > 0) {
      this.alertService.showWarning(`Attention : Payout cannot submit the employee: Account Number is invalid - Make sure an input contains ONLY digits and no other characters. Please check the account details and try again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }

    else if (this.BusinessType == 3 && this.selectedItems.filter(a => Number(Math.sign(a.NetPay)) == -1 || Number(Math.sign(a.NetPay)) == 0).length > 0) {
      this.alertService.showWarning(`Attention : The payout release cannot be confirmed some of the employee(s) does not have Net Pay details. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      this.loadingScreenService.stopLoading();
      return;
    }

    // if (this.BusinessType != 3) {
    //   this.triggerPayoutCall();
    //   this.alertService.showInfo(`Attention : One or more employee does not have account details/mobile number/net pay. Employee Codes : ${_.union(invalidEmployees).join(",")}`);

    // } else {
    //   this.triggerPayoutCall();
    // }


    if (this.selectedItems.length > 0) {

      // ONLY FOR RE INIITATE PAYOUT (IF ANY FAILED TRANSACTION PAYOUT)
      if (this.code_for_SO == 'reinitiatePayOut') {
        this.reiniitatePayout(invalidEmployees);
        return;
      }
      this.loadingScreenService.startLoading();

      // var BatchFileModeEmployees = [];
      // var ChequeModeEmployees = [];
      // BatchFileModeEmployees = this.selectedItems.filter(a => !invalidEmployees.includes(a.EmployeeCode));
      // ChequeModeEmployees = this.selectedItems.filter(a => invalidEmployees.includes(a.EmployeeCode));

      // console.log('BatchFileModeEmployees', BatchFileModeEmployees);
      // console.log('ChequeModeEmployees', ChequeModeEmployees);

      // if (BatchFileModeEmployees.length > 0) {

      let LstPayOutDet = [];
      let LstPayOutDet_Cheque = [];

      var currentDate = new Date();

      this.selectedItems.forEach(obj => {
        var childDetails = new PayoutInformationDetails();
        childDetails.Id = this.code_for_SO == 'reinitiatePayOut' ? obj.Id : 0;
        childDetails.PayoutInformationId = this.code_for_SO == 'reinitiatePayOut' ? obj.PayOutInformationId : 0;
        childDetails.TimeCardId = obj.TimeCardId;
        childDetails.EmployeeId = obj.EmployeeId;
        childDetails.EmployeeName = obj.EmployeeName;
        childDetails.BankName = obj.BankName;
        childDetails.IFSCCode = obj.IFSCCode;
        childDetails.AccountNumber = obj.AccountNumber;
        childDetails.MobileNumber = obj.MobileNumber;
        childDetails.UPIId = obj.UPIId;
        childDetails.PayPeriodId = this.BehaviourObject_Data.payperiodId
        childDetails.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
        childDetails.Narration = obj.Narration;
        childDetails.NetPay = obj.NetPay;
        childDetails.ExternalRefCode = obj.ExternalRefCode;
        childDetails.AcknowledgmentDetail = obj.AcknowledgmentDetail;
        childDetails.IsPaymentDone = obj.IsPaymentDone
        childDetails.Status = this.code_for_SO == 'reinitiatePayOut' ? 7849 : PayOutDetailsStatus.Initiated;
        childDetails.IsPaymentHold = obj.IsPaymentHold;
        childDetails.PaymentMode = this.BusinessType != 3 ? invalidEmployees.includes(obj.EmployeeCode) ? PaymentMode.CheQue : PaymentMode.BatchFile : PaymentMode.BatchFile;
        // childDetails.CompanyBankAccountId = 
        childDetails.ModeType = UIMode.Edit;
        childDetails.PayTransactionId = obj.PayTransactionId;
        childDetails.IsReInitiated = this.code_for_SO == 'reinitiatePayOut' ? true : false;
        this.BusinessType != 3 ? invalidEmployees.includes(obj.EmployeeCode) ? LstPayOutDet_Cheque.push(childDetails) : LstPayOutDet.push(childDetails) : LstPayOutDet.push(childDetails);
      });

      let submitobjePayOut = new PayoutInformation();
      submitobjePayOut.Id = this.code_for_SO == 'reinitiatePayOut' ? this.BehaviourObject_Data.Id : 0;
      submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
      submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
      submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName
      // submitobjePayOut.CompanyBankAccountId = 0;
      submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      submitobjePayOut.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
      // submitobjePayOut.PayrunIds = JSON.stringify( this.BehaviourObject_Data.PayrunIds) as any;
      // console.log('submitobjePayOut.PayrunIds', submitobjePayOut.PayrunIds);
      // submitobjePayOut.PayrunIds = [];
      // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
      // submitobjePayOut.PayrunIds = this.selectedItems[0].PayrunId;

      submitobjePayOut.PayrunIds = [];
      this.code_for_SO != 'reinitiatePayOut' ? this.selectedItems.forEach(function (item) { submitobjePayOut.PayrunIds.push(item.PayrunId) }) :
        this.BehaviourObject_Data.PayrunIds.forEach(function (item) { submitobjePayOut.PayrunIds.push(item) });

      submitobjePayOut.PayrunIds = _.union(submitobjePayOut.PayrunIds)

      submitobjePayOut.RequestedBy = this.UserId;
      submitobjePayOut.RequesterName = this.PersonName;
      submitobjePayOut.RequestedOn = moment(currentDate).format('YYYY-MM-DD');
      submitobjePayOut.ApprovedId = '';
      submitobjePayOut.ApproverName = '';
      submitobjePayOut.PaymentMode = PaymentMode.BatchFile;
      submitobjePayOut.PayOutDate = moment(currentDate).format('YYYY-MM-DD');;
      submitobjePayOut.Status = this.code_for_SO == 'reinitiatePayOut' ? this.BehaviourObject_Data.PayStatus : PayOutStatus.Initiated;
      submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
      submitobjePayOut.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;

      this.payOutModel = _PayOutModel;
      this.payOutModel.NewDetails = submitobjePayOut;
      this.payOutModel.OldDetails = {};

      console.log('PAYRUN MODEL FIRST: ', this.payOutModel);
      // this.loadingScreenService.stopLoading(); 
      // return;
      this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
        .subscribe((result) => {
          console.log('UPSERT PAY RUN RESPONSE:: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {

            var Result = apiResult.Result as any;
            if (this.code_for_SO == 'reinitiatePayOut') {
              // this.createRejectedPayout()
            } else {
              this._PayOutInfo = Result as any;
              this._LstPayoutEmployees_codemapping = []
              this.activeTabName = "BATCH";
              this.loadinEmployeesRecords();
              let datasource: DataSource = {
                Name: "GET_EMPLOYEELISTUSING_BATCHID",
                Type: DataSourceType.SP,
                IsCoreEntity: false
              }
              let searctElements: SearchElement[] = [
                {
                  FieldName: "@batchId",
                  Value: this._PayOutInfo.Id
                }
              ];
              this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
                this.spinner = false;
                if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
                  let apiResult1 = JSON.parse(result.dynamicObject);
                  console.log('apiResult', apiResult1);
                  let PayoutStatus = this.utilsHelper.transform(PayOutStatus) as any;
                  this._PayOutInfo["StatusName"] = PayoutStatus.find(a => a.id === this._PayOutInfo.Status).name;
                  this._LstPayoutEmployees_codemapping = apiResult1;
                  this.BusinessType != 3 ? LstPayOutDet_Cheque.length == 0 ? this.loadingScreenService.stopLoading() : true : this.loadingScreenService.stopLoading();
                  this.BusinessType != 3 ? LstPayOutDet_Cheque.length == 0 ? this.alertService.showSuccess(apiResult.Message) : true : this.loadingScreenService.stopLoading();
                  this.payOutModel.OldDetails = apiResult.Result;
                  this.inEmployeesList = this._PayOutInfo.LstPayoutInformationDetails;
                  this.inEmployeesList.length > 0 && this.inEmployeesList.forEach(element => {
                    element['EmployeeCode'] = this._LstPayoutEmployees_codemapping.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
                  });
                  this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
                    result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
                  }, err => {

                  })
                }
              });

            }


            if (this.BusinessType != 3 && LstPayOutDet_Cheque.length > 0) {
              this.loadingScreenService.startLoading();
              this.doCreateChequeBatchPayout(submitobjePayOut, LstPayOutDet_Cheque); // creating one more batch for cheque payment if the length of item is greater then zero
            }


          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();

        });

      // }

    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      this.loadingScreenService.stopLoading();
      return;
    }
    // else if (this.selectedItems.filter(a => a.NetPay == 0).length > 0) {
    //   this.alertService.showWarning(`Attention : The payout release cannot be confirmed some of the employee(s) does not have Net Pay details. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
    //   this.loadingScreenService.stopLoading();
    //   return;
    // }


  }

  doCreateChequeBatchPayout(submitobjePayOut, LstPayOutDet_Cheque) {


    submitobjePayOut.PaymentMode = PaymentMode.CheQue;
    submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet_Cheque;

    this.payOutModel = _PayOutModel;
    this.payOutModel.NewDetails = submitobjePayOut;
    this.payOutModel.OldDetails = {};
    console.log('PAYRUN MODEL FIRST CHEQUE: ', this.payOutModel);

    this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
      .subscribe((result) => {
        console.log('UPSERT PAY RUN RESPONSE:: ', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {

          this.doGetCreatedBatchPayout(apiResult);



        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();

      });

  }

  doGetCreatedBatchPayout(apiResult) {
    var Result = apiResult.Result as any;
    if (this.code_for_SO == 'reinitiatePayOut') {
      // this.createRejectedPayout()
    } else {
      this._PayOutInfo = Result as any;
      this._LstPayoutEmployees_codemapping = []
      this.activeTabName = "BATCH";
      this.loadinEmployeesRecords();
      let datasource1: DataSource = {
        Name: "GET_EMPLOYEELISTUSING_BATCHID",
        Type: DataSourceType.SP,
        IsCoreEntity: false
      }
      let searctElements1: SearchElement[] = [
        {
          FieldName: "@batchId",
          Value: this._PayOutInfo.Id
        }
      ];
      this.pageLayoutService.getDataset(datasource1, searctElements1).subscribe((result) => {
        this.spinner = false;
        if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
          let apiResult1 = JSON.parse(result.dynamicObject);
          let PayoutStatus = this.utilsHelper.transform(PayOutStatus) as any;
          this._PayOutInfo["StatusName"] = PayoutStatus.find(a => a.id === this._PayOutInfo.Status).name;
          this._LstPayoutEmployees_codemapping = apiResult1;
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
          this.payOutModel.OldDetails = apiResult.Result;
          this.inEmployeesList = this.inEmployeesList.concat(this._PayOutInfo.LstPayoutInformationDetails);
          this.inEmployeesList.length > 0 && this.inEmployeesList.forEach(element => {
            element['EmployeeCode'] = this._LstPayoutEmployees_codemapping.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
          });
          this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
            result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
          }, err => {

          })
        }
      });

    }

  }

  reiniitatePayout(invalidEmployees) {
    var _selEmps = [];
    _selEmps = this.selectedItems;
    this.loadingScreenService.startLoading();
    let LstPayOutDet = [];
    var currentDate = new Date();
    this.getPayoutInformationById(_selEmps[0].PayOutInformationId).then((result) => {
      console.log('result', result);
      let LstOffilterdEmp = [];
      var apiresult = result as any;
      if (apiresult != null) {
        apiresult.LstPayoutInformationDetails.forEach(e => {
          var isExist = _selEmps.find(a => a.Id == e.Id);
          isExist != undefined && LstOffilterdEmp.push(e)
        });
        console.log('OLD POL :: ', LstOffilterdEmp);

        LstOffilterdEmp.forEach(obj => {
          var childDetails = new PayoutInformationDetails();
          childDetails.Id = this.code_for_SO == 'reinitiatePayOut' ? obj.Id : 0;
          childDetails.PayoutInformationId = this.code_for_SO == 'reinitiatePayOut' ? obj.PayOutInformationId : 0;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = this.BehaviourObject_Data.payperiodId
          childDetails.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
          childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = obj.ExternalRefCode;
          childDetails.AcknowledgmentDetail = obj.AcknowledgmentDetail;
          childDetails.IsPaymentDone = obj.IsPaymentDone
          childDetails.Status = (this.code_for_SO == 'reinitiatePayOut' ? 7849 : PayOutDetailsStatus.Initiated);
          childDetails.IsPaymentHold = obj.IsPaymentHold;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          childDetails.IsReInitiated = this.code_for_SO == 'reinitiatePayOut' ? true : false;
          childDetails.ReleasePayoutInformationId = obj.ReleasePayoutInformationId;
          childDetails.CompanyBankAccountId = obj.CompanyBankAccountId;
          childDetails.PaymentMode = obj.PaymentMode;
          // childDetails.PaymentMode = invalidEmployees.includes(obj.EmployeeCode) ? PaymentMode.CheQue : PaymentMode.BatchFile;

          LstPayOutDet.push(childDetails)
        });

        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = this.code_for_SO == 'reinitiatePayOut' ? this.BehaviourObject_Data.Id : 0;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName
        // submitobjePayOut.CompanyBankAccountId = 0;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitobjePayOut.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
        // submitobjePayOut.PayrunIds = JSON.stringify( this.BehaviourObject_Data.PayrunIds) as any;
        // console.log('submitobjePayOut.PayrunIds', submitobjePayOut.PayrunIds);
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        // submitobjePayOut.PayrunIds = this.selectedItems[0].PayrunId;

        submitobjePayOut.PayrunIds = [];
        this.code_for_SO != 'reinitiatePayOut' ? LstOffilterdEmp.forEach(function (item) { submitobjePayOut.PayrunIds.push(item.PayrunId) }) :
          this.BehaviourObject_Data.PayrunIds.forEach(function (item) { submitobjePayOut.PayrunIds.push(item) });

        submitobjePayOut.PayrunIds = _.union(submitobjePayOut.PayrunIds)

        submitobjePayOut.RequestedBy = this.UserId;
        submitobjePayOut.RequesterName = this.PersonName;
        submitobjePayOut.RequestedOn = moment(currentDate).format('YYYY-MM-DD');
        submitobjePayOut.ApprovedId = '';
        submitobjePayOut.ApproverName = '';
        submitobjePayOut.PayOutDate = moment(currentDate).format('YYYY-MM-DD');;
        submitobjePayOut.Status = this.code_for_SO == 'reinitiatePayOut' ? this.BehaviourObject_Data.PayStatus : PayOutStatus.Initiated;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
        this.payOutModel = _PayOutModel;
        this.payOutModel.NewDetails = submitobjePayOut;
        this.payOutModel.OldDetails = {};

        console.log('PAYRUN MODEL FIRST 1: ', this.payOutModel);
        // this.loadingScreenService.stopLoading();

        // return;


        this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
          .subscribe((result) => {
            console.log('UPSERT PAY RUN RESPONSE:: ', result);
            const apiResult: apiResult = result;
            if (apiResult.Status && apiResult.Result) {

              if (this.code_for_SO == 'reinitiatePayOut') {
                this.createRejectedPayout(this.selectedItems, invalidEmployees)
              } else {
                this._PayOutInfo = apiResult.Result as any;
                this._LstPayoutEmployees_codemapping = []
                this.activeTabName = "BATCH";
                this.loadinEmployeesRecords();
                let datasource: DataSource = {
                  Name: "GET_EMPLOYEELISTUSING_BATCHID",
                  Type: DataSourceType.SP,
                  IsCoreEntity: false
                }
                let searctElements: SearchElement[] = [
                  {
                    FieldName: "@batchId",
                    Value: this._PayOutInfo.Id
                  }
                ];
                this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
                  this.spinner = false;
                  if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
                    let apiResult1 = JSON.parse(result.dynamicObject);
                    console.log('apiResult', apiResult1);
                    let PayoutStatus = this.utilsHelper.transform(PayOutStatus) as any;
                    this._PayOutInfo["StatusName"] = PayoutStatus.find(a => a.id === this._PayOutInfo.Status).name;
                    this._LstPayoutEmployees_codemapping = apiResult1;
                    this.loadingScreenService.stopLoading();
                    this.alertService.showSuccess(apiResult.Message);
                    this.payOutModel.OldDetails = apiResult.Result;
                    this.inEmployeesList = this._PayOutInfo.LstPayoutInformationDetails;
                    this.inEmployeesList.length > 0 && this.inEmployeesList.forEach(element => {
                      element['EmployeeCode'] = this._LstPayoutEmployees_codemapping.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
                    });
                    this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
                      result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
                    }, err => {

                    })
                  }
                });

              }
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });

      }
    });
  }

  createRejectedPayout(LstEmp, invalidEmployees) {
    var payOutModel1: PayOutModel = new PayOutModel();
    if (LstEmp.length > 0) {
      this.loadingScreenService.startLoading();
      let LstPayOutDet1 = [];
      let LstPayOutDet1_Cheque = [];
      var currentDate = new Date();
      LstEmp.forEach(obj => {
        var childDetails1 = new PayoutInformationDetails();
        childDetails1.Id = 0;
        childDetails1.PayoutInformationId = 0;
        childDetails1.TimeCardId = obj.TimeCardId;
        childDetails1.EmployeeId = obj.EmployeeId;
        childDetails1.EmployeeName = obj.EmployeeName;
        childDetails1.BankName = obj.BankName;
        childDetails1.IFSCCode = obj.IFSCCode;
        childDetails1.AccountNumber = obj.AccountNumber;
        childDetails1.MobileNumber = obj.MobileNumber;
        childDetails1.UPIId = obj.UPIId;
        childDetails1.PayPeriodId = this.BehaviourObject_Data.payperiodId
        childDetails1.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
        childDetails1.Narration = "";
        childDetails1.NetPay = obj.NetPay;
        childDetails1.ExternalRefCode = "";
        childDetails1.AcknowledgmentDetail = "";
        childDetails1.IsPaymentDone = false
        childDetails1.Status = PayOutDetailsStatus.Initiated;
        childDetails1.IsPaymentHold = false;
        childDetails1.ModeType = UIMode.Edit;
        childDetails1.PayTransactionId = obj.PayTransactionId;
        childDetails1.IsReInitiated = false;
        childDetails1.PaymentMode = this.BusinessType != 3 ? invalidEmployees.includes(obj.EmployeeCode) ? PaymentMode.CheQue : PaymentMode.BatchFile : PaymentMode.BatchFile;
        // LstPayOutDet1.push(childDetails1)
        this.BusinessType != 3 ? invalidEmployees.includes(obj.EmployeeCode) ? LstPayOutDet1_Cheque.push(childDetails1) : LstPayOutDet1.push(childDetails1) : LstPayOutDet1.push(childDetails1);

      });
      let submitobjePayOut1 = new PayoutInformation();
      submitobjePayOut1.Id = 0;
      submitobjePayOut1.CompanyId = this.sessionDetails.Company.Id;
      submitobjePayOut1.ClientId = this.BehaviourObject_Data.clientId;
      submitobjePayOut1.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      submitobjePayOut1.ClientName = this.BehaviourObject_Data.ClientName
      // submitobjePayOut.CompanyBankAccountId = 0;
      submitobjePayOut1.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      submitobjePayOut1.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
      // submitobjePayOut.PayrunIds = [];
      // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
      // submitobjePayOut.PayrunIds = this.selectedItems[0].PayrunId;
      submitobjePayOut1.PayrunIds = [];
      this.code_for_SO != 'reinitiatePayOut' ? LstEmp.forEach(function (item) { submitobjePayOut1.PayrunIds.push(item.PayrunId) }) :
        this.BehaviourObject_Data.PayrunIds.forEach(function (item) { submitobjePayOut1.PayrunIds.push(item) });
      submitobjePayOut1.PayrunIds = _.union(submitobjePayOut1.PayrunIds)

      submitobjePayOut1.RequestedBy = this.UserId;
      submitobjePayOut1.RequesterName = this.PersonName;
      submitobjePayOut1.RequestedOn = moment(currentDate).format('YYYY-MM-DD');
      submitobjePayOut1.ApprovedId = '';
      submitobjePayOut1.ApproverName = '';
      submitobjePayOut1.PayOutDate = moment(currentDate).format('YYYY-MM-DD');;
      submitobjePayOut1.Status = PayOutStatus.Initiated;
      submitobjePayOut1.PaymentMode = PaymentMode.BatchFile;
      submitobjePayOut1.LstPayoutInformationDetails = LstPayOutDet1;
      submitobjePayOut1.ProcessCategory = this.BehaviourObject_Data.ProcessCategory; //ProcessCategory.Salary; 
      payOutModel1 = _PayOutModel;
      payOutModel1.NewDetails = submitobjePayOut1;
      payOutModel1.OldDetails = {};
      console.log('PAYRUN MODEL 1: ', payOutModel1);
      // this.loadingScreenService.stopLoading();

      // return;
      this.payrollService.put_UpsertPayoutInformation(JSON.stringify(this.payOutModel))
        .subscribe((result) => {
          console.log('UPSERT PAY RUN RESPONSE:: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            this._PayOutInfo = apiResult.Result as any;
            this._LstPayoutEmployees_codemapping = []
            this.activeTabName = "BATCH";
            this.loadinEmployeesRecords();
            let datasource: DataSource = {
              Name: "GET_EMPLOYEELISTUSING_BATCHID",
              Type: DataSourceType.SP,
              IsCoreEntity: false
            }
            let searctElements: SearchElement[] = [
              {
                FieldName: "@batchId",
                Value: this._PayOutInfo.Id
              }
            ];
            this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
              this.spinner = false;
              if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
                let apiResult1 = JSON.parse(result.dynamicObject);
                console.log('apiResult', apiResult1);
                this._LstPayoutEmployees_codemapping = apiResult1;
                this.BusinessType != 3 ? LstPayOutDet1_Cheque.length == 0 ? this.loadingScreenService.stopLoading() : true : this.loadingScreenService.stopLoading();
                this.BusinessType != 3 ? LstPayOutDet1_Cheque.length == 0 ? this.alertService.showSuccess(apiResult.Message) : true : this.loadingScreenService.stopLoading();
                this.payOutModel.OldDetails = apiResult.Result;
                this.inEmployeesList = this._PayOutInfo.LstPayoutInformationDetails;
                this.inEmployeesList.length > 0 && this.inEmployeesList.forEach(element => {
                  element['EmployeeCode'] = this._LstPayoutEmployees_codemapping.find(a => a.EmployeeId == element.EmployeeId).EmployeeCode;
                });
                this.utilityService.ensureIdUniqueness(this.inEmployeesList).then((result) => {
                  result == true ? this.isEmployeeDuplicateEntry = true : this.isEmployeeDuplicateEntry = false;
                }, err => {

                })

              }
            });

            if (this.BusinessType != 3 && LstPayOutDet1_Cheque.length > 0) {
              this.loadingScreenService.startLoading();
              this.doCreateChequeBatchPayout(submitobjePayOut1, LstPayOutDet1_Cheque); // creating one more batch for cheque payment if the length of item is greater then zero
            }

          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {
          this.loadingScreenService.stopLoading();

        });
    }
  }

  _old_Details_Builder() {
    return new Promise((resolve, reject) => {

      if (this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun") {
        this.LstSubmitForPayRun = [];
        let PayRunId = 0;
        this.dataset.forEach(event => {
          var submitListObject = new PayRunDetails();
          PayRunId = event.PayRunId;
          submitListObject.EmployeeId = event.EmployeeId;
          submitListObject.EmployeeCode = event.EmployeeCode;
          submitListObject.TimeCardId = event.TimeCardId;
          submitListObject.EmployeeName = event.EmployeeName;
          submitListObject.TimecardStatus = this.code_for_SO == "initiatePayOut" ? TimeCardStatus.SaleOrderCreated : TimeCardStatus.PayrollCalculated;
          submitListObject.PaytransactionId = event.PayTransactionId;
          submitListObject.GrossEarn = event.GrossEarn;
          submitListObject.GrossDedn = event.GrossDedn;
          submitListObject.NetPay = event.NetPay;
          submitListObject.InvoiceIds = null;
          submitListObject.Id = this.code_for_SO === "editPayRun" || this.code_for_SO == "managePayRun" ? event.Id : 0;
          this.LstSubmitForPayRun.push(submitListObject);
        });
        var submitObject = new PayRun();
        submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
        submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
        submitObject.CompanyId = this.sessionDetails.Company.Id;
        submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitObject.ClientId = this.BehaviourObject_Data.clientId;
        submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        submitObject.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
        submitObject.TeamIds = [];
        // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
        this.dataset.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
        submitObject.TeamIds = _.union(submitObject.TeamIds)

        submitObject.NumberOfEmpoyees = this.dataset.length;
        submitObject.NoOfSaleOrders = 0;
        submitObject.PayRunStatus = PayRunStatus.Intitated;
        submitObject.Id = this.code_for_SO == "editPayRun" || this.code_for_SO == "managePayRun" ? PayRunId : 0;
        submitObject.LstPayrunDetails = this.LstSubmitForPayRun;
        this.payRunModel.OldDetails = submitObject;
        this.BusinessType == 3 && this.get_SaleOrdersByPayRunId(PayRunId);
        resolve(submitObject); // pass values
      }
      else if (this.code_for_SO === "PayOut_Edit") {
        let LstPayOutDet = [];
        let PayOutInfoId = 0;
        this.dataset.forEach(obj => {
          console.log('Test obj', obj);

          var childDetails = new PayoutInformationDetails();
          PayOutInfoId = obj.PayOutInformationId;
          childDetails.Id = obj.Id;
          childDetails.PayoutInformationId = obj.PayOutInformationId;
          childDetails.TimeCardId = obj.TimeCardId;
          childDetails.EmployeeId = obj.EmployeeId;
          childDetails.EmployeeName = obj.EmployeeName;
          childDetails.BankName = obj.BankName;
          childDetails.IFSCCode = obj.IFSCCode;
          childDetails.AccountNumber = obj.AccountNumber;
          childDetails.MobileNumber = obj.MobileNumber;
          childDetails.UPIId = obj.UPIId;
          childDetails.PayPeriodId = this.BehaviourObject_Data.payperiodId
          childDetails.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
          // childDetails.Narration = obj.Narration;
          childDetails.NetPay = obj.NetPay;
          childDetails.ExternalRefCode = "";
          childDetails.AcknowledgmentDetail = "";
          childDetails.IsPaymentDone = false
          childDetails.Status = obj.StatusCode;
          childDetails.IsPaymentHold = false;
          childDetails.ModeType = UIMode.Edit;
          childDetails.PayTransactionId = obj.PayTransactionId;
          LstPayOutDet.push(childDetails)
        });
        let submitobjePayOut = new PayoutInformation();
        submitobjePayOut.Id = PayOutInfoId;
        submitobjePayOut.CompanyId = this.sessionDetails.Company.Id;
        submitobjePayOut.ClientId = this.BehaviourObject_Data.clientId;
        submitobjePayOut.ClientContractId = this.BehaviourObject_Data.clientcontractId;
        submitobjePayOut.ClientName = this.BehaviourObject_Data.ClientName;
        // submitobjePayOut.ProcessCategory = this.BehaviourObject_Data.ProcessCategory;
        // submitobjePayOut.CompanyBankAccountId = this.payOutModel.OldDetails.CompanyBankAccountId;
        // submitobjePayOut.PayrunIds = [];
        // submitobjePayOut.PayrunIds.push(this.selectedItems[0].PayrunId);
        // submitobjePayOut.PayrunIds = this.selectedItems[0].PayrunId;
        // submitobjePayOut.RequestedBy = this.UserId;
        // submitobjePayOut.RequesterName = this.PersonName;

        submitobjePayOut.RequestedOn = this.BehaviourObject_Data.RequestedOn;
        submitobjePayOut.ApprovedId = '';
        submitobjePayOut.ApproverName = '';
        submitobjePayOut.PayOutDate = this.BehaviourObject_Data.PayOutDate;;
        submitobjePayOut.Status = this.BehaviourObject_Data.StatusCode;
        submitobjePayOut.LstPayoutInformationDetails = LstPayOutDet;
        submitobjePayOut.PayPeriodId = this.BehaviourObject_Data.payperiodId
        submitobjePayOut.PayPeriodName = this.BehaviourObject_Data.PayPeriod;
        this.payOutModel.OldDetails = submitobjePayOut;
        this._PayOutInfo = submitobjePayOut;
        resolve(submitobjePayOut); // pass values

      }
    });


  }

  get_SaleOrdersByPayRunId(PayRunId) {
    this.inSaleOrdersList = [];
    this.payrollService.get_SaleOrdersbyPayrunId(PayRunId)
      .subscribe((result) => {
        console.log('SO RESULT :', result);
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          apiResult.Result === null ? this.isEmptySO = true : this.isEmptySO = false;
          let SOStatus = this.utilsHelper.transform(SaleOrderStatus) as any;
          this.inSaleOrdersList = apiResult.Result as any !== null ? apiResult.Result as any : [];
          console.log('length', this.inSaleOrdersList.length);
          this.inSaleOrdersList.forEach(element => {
            element.Status = SOStatus.find(a => a.id === element.Status).name

          });
          this.utilityService.ensureIdUniqueness(this.inSaleOrdersList).then((result) => {
            result == true ? this.isSODuplicateEntry = true : this.isSODuplicateEntry = false;
          }, err => {

          })

        }

      }, err => {

      })

  }
  /* #endregion */



  ngOnDestroy() {

    // if (this.code_for_SO != "initiatePayOut" && this.SO_OP) {
    //   this.payrollService.delete_PayRun(this.SO_OP.Id)
    //     .subscribe((result) => {
    //       console.log('DELETE PAYRUN :: ', result);
    //       const apiResult: apiResult = result;
    //     }, error => {

    //     });
    // }

  }

}
