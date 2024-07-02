import { Component, OnInit, Input } from '@angular/core';
import { PageLayout, ColumnDefinition, SearchElement } from 'src/app/views/personalised-display/models';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters } from 'angular-slickgrid';
import { NgbModalOptions, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { PagelayoutService, AlertService, PayrollService, CommonService } from 'src/app/_services/service';
import { Router, ActivatedRoute } from '@angular/router';
import { RowDataService } from 'src/app/views/personalised-display/row-data.service';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { PayRunDetails, PayRun, PayRunStatus, MarkupCalculationMessage, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import * as _ from 'lodash';

@Component({
  selector: 'app-initiate-sale-order-modal',
  templateUrl: './initiate-sale-order-modal.component.html',
  styleUrls: ['./initiate-sale-order-modal.component.css']
})
export class InitiateSaleOrderModalComponent implements OnInit {
  @Input() ParentrowDataService: any;
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

  processCategory: SearchElement;

  //Grouping
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  draggableGroupingPlugin: any;
  dataser: GridService;

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
  overallStatus: any[] = [];

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

  LstSubmitForPayRun: any[] // SUBMIT FOR VERFICATION - ARRAY LIST
  payRunModel: PayRunModel = new PayRunModel();
  code_for_SO: any;
  shouldhide: boolean = false;
  summaryText = 'Show Employee(s) Status';
  processedEMP = [];

  // SME CONFIGURATIN AND PROPERTIES
  BusinessType: any;
  isEnableForSME_Process: boolean = true;
  isFnFEmployee: boolean = false;
  isActionInProgress:boolean = false;
  constructor(
    private pageLayoutService: PagelayoutService,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private payrollService: PayrollService,
    private router: Router,
    public sessionService: SessionStorage,
    private commonService: CommonService

  ) { }

  ngOnInit() {
    this.inEmployeesInitiateSelectedItems = [];
    this.loadinEmployeesInitiateRecords1();
    this.ParentrowDataService = JSON.parse(this.ParentrowDataService)
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    // this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item=>item.CompanyId ==  1).BusinessType;

    this.isEnableForSME_Process = this.BusinessType == 3 ? true : false; // coming from access control temp control 


    this.BusinessType == 3 ? this.code_for_SO = "initiateSaleOrder" : this.code_for_SO = 'initiatePayRun';
    this.getPageLayout(this.code_for_SO);
  }
  closeModal() {
    this.activeModal.close('Modal Closed');
  }
  getPageLayout(code) {

    this.pageLayout = null;
    this.spinner = true;
    this.pageLayoutService.getPageLayout(code).subscribe(data => {
      console.log(data);

      if (data.Status === true && data.dynamicObject != null) {
        this.pageLayout = data.dynamicObject;
        this.setGridConfiguration();
        this.dataset = [];
        // this.route.data.subscribe(data => {
        data = this.ParentrowDataService
        console.log(data);
        if (data.dataInterface.SearchElementValuesList !== null && data.dataInterface.SearchElementValuesList.length > 0) {
          this.BehaviourObject_Data = data.dataInterface.RowData;
          data.dataInterface.SearchElementValuesList.forEach(searchElementValues => {
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
        this.spinner = false;
        this.processCategory = this.pageLayout.SearchConfiguration.SearchElementList.find(x => x.FieldName == '@processCategory');
        console.log("Process ::", this.processCategory);
      }
      else {
        this.spinner = false;

      }

    }, error => {
      console.log(error);
      this.spinner = false;
    }
    );
  }


  setGridConfiguration() {
    this.columnDefinition = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    this.gridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.gridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      deleteIconCssClass: 'fa fa-times',
      // onGroupChanged: (e, args) => this.onGroupChange(),
      onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }
  }

  // API CALLS USING TABLE ROUTING AND SEARCHELEMENTS IF NEEDED
  getDataset() {

    this.inEmployeesInitiateSelectedItems = [];
    this.dataset = [];
    this.inEmployeesInitiateList = [];
    this.overallStatus = [];
    this.spinner = true;

    //let searchElementList = this.pageLayout.SearchConfiguration.SearchElementList.concat([{FieldName : "@processCategory" , Value : this.BehaviourObject_Data.process}])

    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.dataset = JSON.parse(dataset.dynamicObject);
        this.overallStatus = this.commonService.hasJsonStructure(this.dataset[0].Summary) === true ? JSON.parse(this.dataset[0].Summary) : this.dataset[0].Summary;
        this.dataset.forEach(element => {
          if (element.Id != -1) {
            // this.inEmployeesInitiateList.push(element);
          }

        });
        this.inEmployeesInitiateList = this.dataset.filter(item => item.Id != -1 && item.ProcessCategory != 4);
        console.log('inEmployeesInitiateList', this.inEmployeesInitiateList);
        console.log(this.dataset);
      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  } // PARENT AND CHILD COMPONENT - DATA TRANSACTION
  onClickingSearchButton(event: any) {
    this.getDataset();
  }

  /* #endregion */



  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  loadinEmployeesInitiateRecords1() {

    this.inEmployeesInitiateGridOptions = {
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

    var costcode = {
      id: 'CostCode', name: 'Cost Code', field: 'CostCode',
      sortable: true,
      type: FieldType.string,
      filterable: true,
    }
    this.inEmployeesInitiateColumnDefinitions = [
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
        filterable: true,
        type: FieldType.string,
      },
      {
        id: 'Designation', name: 'Designation', field: 'Designation',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },

      {
        id: 'StatusName', name: 'Processing Status', field: 'StatusName',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },
      {
        id: 'ErrorMessage', name: 'Failed Msg.', field: 'ErrorMessage',
        sortable: true,
        type: FieldType.string,
        filterable: true,
      },

    ];
    this.BusinessType == 3 && this.inEmployeesInitiateColumnDefinitions.push(costcode);


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
    console.log('SELECTED ITEMS SO :', this.inEmployeesInitiateSelectedItems);

  }

  Confirm() {
    this.isActionInProgress = true;
    if (this.inEmployeesInitiateSelectedItems.length === 0) {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      this.isActionInProgress = false;
      return;
    }

      
    // if (this.inEmployeesInitiateSelectedItems.filter(a => Number(Math.sign(a.NetPay)) == -1 || Number(Math.sign(a.NetPay)) == 0).length > 0) {
    //   this.alertService.showWarning("Note: It is not possible to confirm that some employees do not have net compensation details.");
    //   return;
    // }

    // var isBatchexist = [];
    // isBatchexist = this.inEmployeesInitiateSelectedItems.filter(a => a.StatusCode != TimeCardStatus.BillingTransactionCreated);

    // if (isBatchexist.length > 0) {
    //   this.alertService.showWarning("Your request cannot make and Submit! invalid transaction status");
    //   return;
    // }
    if (this.BusinessType == 3) {
      this.alertService.confirmSwalWithClose("Do you want to add or remove employee(s) from Pay Run?", "If No is selected Sale Orde will be created directly!", "No, Create SaleOrders", "Yes, Don't Create SaleOrders").then(result => {
        this.isActionInProgress = false;
        this._UpsertPayrun('NoTab')

      }).catch(error => {
        this.isActionInProgress = false;
        this._UpsertPayrun('YesTab')

      });
    } else { 
      this.isActionInProgress = false;
      this._UpsertPayrun('SME') 
    }
    
  }
  _UpsertPayrun(index) {
   
    this.LstSubmitForPayRun = [];
    this.loadingScreenService.startLoading();
    let PayRunId = 0;
    this.inEmployeesInitiateSelectedItems.forEach(event => {
      var submitListObject = new PayRunDetails();
      PayRunId = event.PayRunId;
      submitListObject.EmployeeId = event.EmployeeId;
      submitListObject.EmployeeCode = event.EmployeeCode;
      submitListObject.TimeCardId = event.TimeCardId;
      submitListObject.EmployeeName = event.EmployeeName;
      submitListObject.TimecardStatus = index === 'SME' ? TimeCardStatus.ClientApproved : TimeCardStatus.BillingTransactionCreated;
      submitListObject.PaytransactionId = event.PaytransactionId;
      submitListObject.GrossEarn = event.GrossEarn;
      submitListObject.GrossDedn = event.GrossDedn;
      submitListObject.NetPay = event.NetPay;
      submitListObject.InvoiceIds = null;
      submitListObject.ModeType = UIMode.Edit;
      submitListObject.Id = this.code_for_SO === "editPayRun" ? event.Id : 0;
      this.LstSubmitForPayRun.push(submitListObject);
    });
    var submitObject = new PayRun();
    submitObject.Code = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}`;
    submitObject.Name = `${this.BehaviourObject_Data.ClientName}_${this.BehaviourObject_Data.ContractCode}_${this.BehaviourObject_Data.PayPeriod}`;
    submitObject.CompanyId = this.sessionDetails.Company.Id;
    submitObject.ClientContractId = this.BehaviourObject_Data.clientcontractId;
    submitObject.ClientId = this.BehaviourObject_Data.clientId;
    submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
    submitObject.TeamIds = [];
    submitObject.ProcessCategory = this.processCategory != undefined && this.processCategory != null ? this.processCategory.Value : 0;
    this.inEmployeesInitiateSelectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
    // submitObject.TeamIds.push(this.BehaviourObject_Data.teamId);
    submitObject.TeamIds = _.union(submitObject.TeamIds);
    submitObject.NumberOfEmpoyees = this.inEmployeesInitiateSelectedItems.length;
    submitObject.NoOfSaleOrders = 0;
    submitObject.PayRunStatus = PayRunStatus.Intitated;
    submitObject.Id = this.code_for_SO == "editPayRun" ? PayRunId : 0;
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
          index === "NoTab" && this._initiate_SaleOrders(apiResult.Result)
          index === "YesTab" && this._redirect_to_payrun(result.Id)
          index === 'SME' && this._redirect_to_payrun(result.Id)
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();

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
          this.inEmployeesInitiateSelectedItems = [];
          let SO_OP = (apiResult.Result) as any;
          console.log('SO oOp', SO_OP);
          console.log('SO oOp PayRunId', SO_OP.PayRunId);

          // this.router.navigateByUrl('app/ui/payrollVerificationRequest');
          this._redirect_to_payrun(SO_OP[0].PayRunId)
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
          this.inEmployeesInitiateSelectedItems = [];
          this.getDataset();

        }
      }, error => {
        this.loadingScreenService.stopLoading();

      });

  }

  _redirect_to_payrun(PayRunId) {
    this.activeModal.close('Modal Closed');
    if (this.BusinessType != undefined && this.BusinessType != 3) {
      this.BehaviourObject_Data["ProcessCategory"] = this.processCategory != undefined && this.processCategory != null ?
        this.processCategory.Value : 0;
      this.rowDataService.dataInterface.RowData = this.BehaviourObject_Data;
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayRunIds",
        "OutputFieldName": "@PayRunIds",
        "Value": PayRunId,
        "ReadOnly": false
      }];
      this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun')
    } else {

      this.BehaviourObject_Data["ProcessCategory"] = this.processCategory != undefined && this.processCategory != null ?
        this.processCategory.Value : 0;
      this.rowDataService.dataInterface.RowData = this.BehaviourObject_Data;
      this.rowDataService.dataInterface.SearchElementValuesList = [{
        "InputFieldName": "PayRunIds",
        "OutputFieldName": "@PayRunIds",
        "Value": PayRunId,
        "ReadOnly": false
      }];
      this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')
    }
  }



  processEmployee() {

    if (this.inEmployeesInitiateSelectedItems.length > 0) {
      this.processedEMP = [];
      // var isBatchexist = [];
      // isBatchexist = this.inEmployeesInitiateSelectedItems.filter(a => a.StatusCode === TimeCardStatus.MarkupCalculationFailed);

      // if (isBatchexist.length == 0) {
      //   this.alertService.showWarning("Your request cannot make and Process! You have selected item that contains already invalid status.");
      //   return;
      // }
      this.loadingScreenService.startLoading();
      var lstMarkUpCalc = [];
      this.inEmployeesInitiateSelectedItems.forEach(obj => {

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
      });

      this.payrollService.post_ProcessBilling(lstMarkUpCalc)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            // this.alertService.showSuccess(apiResult.Message);
            this.processedEMP = apiResult.Result as any;
            this.processedEMP.forEach(e => {
              e['EmployeeName'] = this.inEmployeesInitiateSelectedItems.find(a => a.EmployeeId == e.EmployeeId).EmployeeName;
            });
            $('#popup_processingbilling').modal('show');
            setTimeout(() => {
              this.inEmployeesInitiateSelectedItems = [];
              this.getDataset();
            }, 500);

          } else { this.loadingScreenService.stopLoading; this.alertService.showWarning(apiResult.Message) }
        }, err => {

        })
    } else {
      this.alertService.showWarning("At least one checkbox must be selected.");
    }
  }
  modal_dismiss_processBilling() {
    $('#popup_processingbilling').modal('hide');
  }

  showteams() {
    if (this.shouldhide == false) {
      this.shouldhide = true;
      this.summaryText = "Hide Employee(s) Status";
    } else {
      this.shouldhide = false;
      this.summaryText = "Show Employee(s) Status"
    }
  }

  // CHECKMARK FOR FINA AND FULL SETTLEMENT EMPLOYEES
  onChangeFnFCheckmark(event, buttontext) {
    if(event.target.checked){
      this.inEmployeesInitiateList = this.dataset.filter(item => item.Id != -1);
    }else {
      this.inEmployeesInitiateList = this.dataset.filter(item => item.Id != -1  && item.ProcessCategory != 4);

    }
  }
}
