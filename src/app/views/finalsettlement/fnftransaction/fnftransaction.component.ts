import { Component, OnInit } from '@angular/core';
import { PageLayout, SearchElement, SearchConfiguration, DataSource } from '../../personalised-display/models';
import { PagelayoutService, AlertService, SessionStorage, PayrollService, DownloadService, ExcelService, FileUploadService, EmployeeService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Column, GridOption, AngularGridInstance } from 'angular-slickgrid';
import { NavigationExtras, Router } from '@angular/router';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import Swal from 'sweetalert2';
import { PayrollVerificationRequestDetails, PayrollVerificationRequest, PVRStatus } from 'src/app/_services/model/Payroll/PayrollVerificationRequest';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import moment from 'moment';
import { apiResult } from './../../../_services/model/apiResult';
import _ from 'lodash';
import { PayrollModel, _PayrollModel } from 'src/app/_services/model/Payroll/ParollModel';
import { searchObject, _searchObject } from 'src/app/_services/model/Common/SearchObject';
import { DataSourceType, InputControlType, SearchPanelType } from '../../personalised-display/enums';
import { RowDataService } from '../../personalised-display/row-data.service';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { InitiateSaleOrderModalComponent } from 'src/app/shared/modals/payroll/initiate-sale-order-modal/initiate-sale-order-modal.component';
import { PayrollQueueMessage } from 'src/app/_services/model/Payroll/PayrollQueueMessage';
import { ProcessTimeCardsModel } from 'src/app/_services/model/Payroll/ProcessTimeCardsModel';
import { TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { GeneratePIS } from 'src/app/_services/model/Payroll/generatePIS';
import { environment } from 'src/environments/environment';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { PayRun, PayRunDetails, PayRunStatus, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { NoDueCertificateComponent } from 'src/app/shared/modals/noDueCertificate-modal/noDueCertificate-modal.component';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, of } from 'rxjs';
import { catchError, takeUntil } from 'rxjs/operators';
import { ResignationHistoryComponent } from '../../ESS/ess/employee-resignation/resignation-history/resignation-history.component';


@Component({
  selector: 'app-fnftransaction',
  templateUrl: './fnftransaction.component.html',
  styleUrls: ['./fnftransaction.component.scss']
})
export class FnftransactionComponent implements OnInit {

  //PageLayouts
  addPageLayout: PageLayout;
  outputPageLayout: PageLayout;
  payrunPageLayout: PageLayout;
  addPageLayoutCode: string = 'addNewFnF';
  readonly outputPageLayoutCode: string = 'FnFTransaction';
  readonly payrunPageLayoutCode: string = 'FnFPayrun';

  spinner: boolean = false;
  searchElementList: SearchElement[];
  searchConfiguration: SearchConfiguration;
  searchPanel: boolean = false;
  searchObject: searchObject;
  employeeObject: any;
  isSearchElemetsFilledLocally: boolean = false;

  disableSearchForProcess: boolean = true;
  diableSearchForAdd: boolean = true;

  //Tabs
  activeTabName: string = "Add"
  process_ActiveTabName: string = "PAYINPUTS";

  //Add grid
  addColumnDefinitions: Column[];
  addGridOptions: GridOption;
  addDataset: any[];
  addAngularGrid: AngularGridInstance;
  addGridObj: any;
  addDataviewObj: any;
  addSelectedItems: any[];

  //output grid
  outputColumnDefinitions: Column[];
  outputGridOptions: GridOption;
  outputDataset: any[];
  outputAngularGrid: AngularGridInstance;
  outputGridObj: any;
  outputDataviewObj: any;
  outputSelectedItems: any[];

  //Process - Payrun
  payrunColumnDefinitions: Column[];
  payrunGridOptions: GridOption;
  payrunDataset: any[];
  payrunAngularGrid: AngularGridInstance;
  payrunGridObj: any;
  payrunDataviewObj: any;
  payrunSelectedItems: any[];

  //Choose Employee Popup
  beforeEmployee: boolean = false;
  isLoading: boolean;
  ActiveEmployeeList: any[];
  employeeSelected: any;
  isProceed: boolean = false;
  label_EmployeeCode: string;
  label_EmployeeName: string;
  label_ClientContractCode: string;
  label_ClientName: string;
  Label_DOJ: string;
  isResignation: boolean = true;
  isTermination: boolean = true;
  editing: boolean;


  searchedClientId: number;
  searchClientContractId: number;
  searchedTeamId: number;
  searchedPayperiodId: number;
  searchedPayPeriodName: string;
  payrollModel: PayrollModel;

  rowRecord: any;
  Payitems: any;
  visible: boolean = false;

  selectedItems: any[] = [];

  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;

  //Session
  sessionDetails: LoginResponses;
  userId: number;
  companyId: number;
  businessType: number;
  roleId: number;

  // SME 
  clientSME: any;
  clientcontractSME: any;
  clientIdSME: number;
  clientcontractIdSME: number;


  hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
    value != null && value != -1 ? '<a href="javascript:;">' + value + '</a>' : '---';
  LstProceeTimeCards: any[];
  processedEMP: any[];
  resultList: any[];

  isAddDSDuplicateEntry: boolean = false;
  isOutputDuplicateEntry: boolean = false;
  isPayRunDuplicateEntry: boolean = false;
  roleCode: string = '';
  modalOption: NgbModalOptions = {};
  showEmpStatusDrawer: boolean = false;
  selectedEmpStatusView: any = {};
  IsNDCAddFormRequired: boolean = environment.environment.IsNDCAddFormRequired;
  isAllenClient: boolean = environment.environment.IsAllenClient;

  employeeProfile: any = null;

  constructor(
    private pagelayoutservice: PagelayoutService,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private router: Router,
    private sessionService: SessionStorage,
    private modalService: NgbModal,
    private payrollService: PayrollService,
    private rowDataService: RowDataService,
    private downloadService: DownloadService,
    private utilityService: UtilityService,
    private excelService: ExcelService,
    private fileUploadService: FileUploadService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit() {

    this.spinner = true;

    //#region hard coded search configuration
    // this.searchConfiguration = {
    //   SearchElementList : [
    //     {
    //       DataSource: {
    //         EntityType: 0,
    //         IsCoreEntity: false,
    //         Name: "ActiveClientView",
    //         Type: 1
    //       },
    //       DefaultValue : "1846",
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
    //       DefaultValue : '230',
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
    //       DataSource: {Type: 1, Name: "team", EntityType: 0, IsCoreEntity: false},
    //       DefaultValue: "218",
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
    //     {
    //       DataSource: {Type: 1, Name: "payperiodview", EntityType: 0, IsCoreEntity: false},
    //       DefaultValue: "0",
    //       DisplayFieldInDataset: "Name",
    //       DisplayName: "Pay Period",
    //       DropDownList: [],
    //       FieldName: "@payperiodId",
    //       ForeignKeyColumnNameInDataset: "Id",
    //       InputControlType: 2,
    //       IsIncludedInDefaultSearch: true,
    //       MultipleValues: [],
    //       ParentFields: ['@clientcontractId'],
    //       ParentHasValue: [],
    //       ReadOnly: false,
    //       RelationalOperatorValue: null,
    //       RelationalOperatorsRequired: false,
    //       TriggerSearchOnChange: false,
    //       Value: null,
    //       GetValueFromUser : false,
    //       SendElementToGridDataSource : true,
    //     },
    //   ],

    //   SearchPanelType : SearchPanelType.Panel,
    //   SearchButtonRequired : true,
    //   ClearButtonRequired : true,
    //   SaveSearchElementsLocally : true
    // };

    // this.searchElementList = this.searchConfiguration.SearchElementList;
    //#endregion



    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userId = this.sessionDetails.UserSession.UserId;
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.companyId = this.sessionDetails.Company.Id;
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;

    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    console.log('selected role code ', this.roleCode);
    if (this.businessType !== 3) {
      this.clientIdSME = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      console.log('clientid sme ', this.clientIdSME);
    }

    this.addPageLayoutCode = (this.businessType == 1 && environment.environment.ACID == this.clientIdSME && (this.roleCode == 'RegionalHR' || this.roleCode == 'CorporateHR')) ? "hrFnF" : "addNewFnF";

    // Add / Edit pagelayout
    if (this.roleCode == 'RegionalHR' && this.isAllenClient && this.clientIdSME == environment.environment.ACID) {
      this.activeTabName = 'Add';
      this.addDataset = [];

      this.rowDataService.dataInterface = {
        SearchElementValuesList: null,
        RowData: null
      }

      // this.getaddDataset();
      this.getPageLayoutForAddNewFnf();
      this.searchPanel = true;
    }

    if (this.roleCode != 'RegionalHR') {
      // input/ output pagelayout
      this.pagelayoutservice.getPageLayout(this.outputPageLayoutCode).subscribe(data => {
        this.disableSearchForProcess = false;
        // console.log(" ouput pagelayout Data : :" , data);
        if (data !== undefined && data !== null) {
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
              clientSearchElement.ReadOnly = true;
              clientcontractSearchElement.Value = this.clientcontractSME.Id;
              clientcontractSearchElement.DropDownList = clientcontractDropDownList;
              clientcontractSearchElement.ReadOnly = true;

              clientSearchElement.IsIncludedInDefaultSearch = false;
              clientcontractSearchElement.IsIncludedInDefaultSearch = false;

              pageLayout.SearchConfiguration.ClearButtonRequired = false;

              this.searchConfiguration = pageLayout.SearchConfiguration;
              this.searchElementList = this.searchConfiguration.SearchElementList;
            }
            else {
              this.searchConfiguration = pageLayout.SearchConfiguration;
              this.searchElementList = this.searchConfiguration.SearchElementList;
            }



            // console.log("Search configuration ::" , this.searchConfiguration);

            this.outputPageLayout = pageLayout;

            // console.log("outputPageLayout" , this.outputPageLayout);
            this.setGrid("output");
            this.spinner = false;


            let commonSearchElementsString: string = sessionStorage.getItem('CommonSearchCriteria');

            if (commonSearchElementsString !== undefined && commonSearchElementsString !== null && commonSearchElementsString !== '') {
              this.pagelayoutservice.fillSearchElementFromLocalStorage(this.searchElementList);

              if (this.searchElementList.find(x => x.FieldName.toLowerCase() === '@payperiodid').Value !== null) {
                this.isSearchElemetsFilledLocally = true;
                this.re_Binding_searchPanel();
                this.bind_SearchIds();
              }


              // if(this.activeTabName == 'Add' && !this.diableSearchForAdd){
              //   this.onClickingSearchButton(null);
              // }
              // else if(this.activeTabName == 'Process' && !this.disableSearchForProcess){
              //   this.onClickingSearchButton(null);
              // }

            }
            else {
              this.isSearchElemetsFilledLocally = false;
            }

            if (this.isSearchElemetsFilledLocally) {
              this.getDatasetBasedOnActiveTab();
            }

            if (this.rowDataService.dataInterface.SearchElementValuesList != undefined &&
              this.rowDataService.dataInterface.SearchElementValuesList != null &&
              this.rowDataService.dataInterface.SearchElementValuesList.length > 0) {

              this.rowDataService.applyValuesTOSearchElements(this.searchConfiguration.SearchElementList);
              this.isSearchElemetsFilledLocally = false;
              console.log("SearchObject ::", this.rowDataService.dataInterface.SearchObject);
              if (this.roleCode == 'RegionalHR' && this.clientIdSME == 1988 && this.isAllenClient) {
                this.activeTabName = 'Add';
              }
              if (this.roleCode == 'PayrollOps' && this.clientIdSME == 1988 && this.isAllenClient) {
                this.activeTabName = 'Process';
              }
              if (this.roleCode == 'PayrollOps' && this.clientIdSME != 1988 && !this.isAllenClient) {
                this.activeTabName = 'Process'
              }

              this.searchObject = this.rowDataService.dataInterface.SearchObject;

              this.searchPanel = true;

              this.rowDataService.dataInterface = {
                SearchElementValuesList: null,
                RowData: null
              }

              console.log(this.searchConfiguration);

              this.bind_SearchIds();
            }


            // if(this.activeTabName == 'Add' && !this.diableSearchForAdd){
            //   this.onClickingSearchButton(null);
            // }
            // else if(this.activeTabName == 'Process' && !this.disableSearchForProcess){
            //   this.onClickingSearchButton(null);
            // }

          }
          else {
            this.isSearchElemetsFilledLocally = false;
          }

          if (this.isSearchElemetsFilledLocally) {
            this.getDatasetBasedOnActiveTab();
          }

          if (this.rowDataService.dataInterface.SearchElementValuesList != undefined &&
            this.rowDataService.dataInterface.SearchElementValuesList != null &&
            this.rowDataService.dataInterface.SearchElementValuesList.length >= 0) {

            this.rowDataService.applyValuesTOSearchElements(this.searchConfiguration.SearchElementList);
            this.isSearchElemetsFilledLocally = false;
            console.log("SearchObject ::", this.rowDataService.dataInterface.SearchObject);
            this.activeTabName = 'Process';

            this.searchObject = this.rowDataService.dataInterface.SearchObject;

            this.searchPanel = true;

            this.rowDataService.dataInterface = {
              SearchElementValuesList: null,
              RowData: null
            }

            console.log(this.searchConfiguration);

            this.bind_SearchIds();

            this.addDataset = [];
            this.outputDataset = [];
            this.payrunDataset = [];
            if (this.activeTabName == 'Add') {
              this.getaddDataset();
            }
            else {
              if (this.process_ActiveTabName == 'PAYINPUTS') {
                this.getoutputDataset();
              }
              else {

              }
            }

          }
        } else if (data.Status === false) {
          this.spinner = false;
          this.alertService.showWarning("Error Occured while loading UI! Please contact Support.");
          this.router.navigate(["app/dashboard"]);
        }
      }, error => {
        this.spinner = false;
      })
      //   this.pagelayoutservice.getPageLayout(this.payrunPageLayoutCode).subscribe(data => {
      //     if (data.Status === true && data.dynamicObject != null) {
      //       this.payrunPageLayout = (data.dynamicObject);
      //       // console.log("payrunPageLayout" , this.payrunPageLayout);
      //       this.setGrid("payrun");
      //       // console.log("PayrunColumns ::" , this.payrunColumnDefinitions);
      //       this.spinner = false;

      //     }
      //   })

      // payrun pagelayout
      this.pagelayoutservice.getPageLayout(this.payrunPageLayoutCode).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.payrunPageLayout = (data.dynamicObject);
          // console.log("payrunPageLayout" , this.payrunPageLayout);
          this.setGrid("payrun");
          // console.log("PayrunColumns ::" , this.payrunColumnDefinitions);
          this.spinner = false;

          if (this.isSearchElemetsFilledLocally) {
            this.getDatasetBasedOnActiveTab();
          }
        } else {
          this.spinner = false;
        }
      }, error => {
        this.spinner = false;
      })
    }

    this.pagelayoutservice.getPageLayout(this.addPageLayoutCode).subscribe(data => {
      this.diableSearchForAdd = false;
      if (data.Status === true && data.dynamicObject != null) {
        this.addPageLayout = (data.dynamicObject);
        // console.log("addPageLayout" , this.addPageLayout);
        // this.searchElementList = (this.pageLayout.SearchConfiguration.SearchElementList);
        // this.searchConfiguration = this.pageLayout.SearchConfiguration;
        this.setGrid("add");
        this.spinner = false;
        if (this.isSearchElemetsFilledLocally) {
          this.getDatasetBasedOnActiveTab();
        }
        //console.log("Seach elements" , this.searchElementList);

      }
      else {
        this.spinner = false;
      }
    }, error => {
      this.spinner = false;

    })


    if (this.roleCode == 'PayrollOps' && this.businessType == 1 && this.clientIdSME != environment.environment.ACID && !this.isAllenClient) {
      this.getPageLayoutForAddNewFnf();
    }

  }

  getPageLayoutForAddNewFnf() {
    this.pagelayoutservice.getPageLayout(this.addPageLayoutCode).subscribe(data => {
      this.diableSearchForAdd = false;
      if (data.Status === true && data.dynamicObject != null) {
        this.addPageLayout = (data.dynamicObject);
        console.log("add/edit pagelayout", this.addPageLayout);
        this.setGrid("add");
        this.spinner = false;
        // if (this.isSearchElemetsFilledLocally) {
        // this.getDatasetBasedOnActiveTab();
        // }     
        this.getDatasetBasedOnActiveTab();

      }
      else {
        this.spinner = false;
      }
    }, error => {
      this.spinner = false;
    })
  }






  setGrid(tab: string) {


    let pageLayout: PageLayout = this[tab + "PageLayout"]
    this[tab + "ColumnDefinitions"] = this.pagelayoutservice.setColumns(pageLayout.GridConfiguration.ColumnDefinitionList);
    this[tab + "GridOptions"] = this.pagelayoutservice.setGridOptions(pageLayout.GridConfiguration);


    if (tab == "output") {
      let column = this.outputColumnDefinitions.find(x => x.id == 'NetPay');
      column.formatter = this.hyperlinkFormatter;
    }
    else if (tab == "payrun") {
      let column = this.payrunColumnDefinitions.find(x => x.id == 'PayRunId');
      column.formatter = this.hyperlinkFormatter;
    }

  }

  onClickingSearchButton(event: any) {

    this.re_Binding_searchPanel();
    this.bind_SearchIds();

    this.addDataset = [];
    this.outputDataset = [];
    this.payrunDataset = [];
    if (this.isAllenClient && this.clientIdSME == 1988) {
      if (this.roleCode == 'RegionalHR') {
        this.getaddDataset();
      }
      if (this.roleCode == 'PayrollOps') {
        if (this.process_ActiveTabName == 'PAYINPUTS') {
          this.getoutputDataset();
        }
        else {
          this.getpayrunDataset();
        }
      }
    } else {
      if (this.activeTabName == 'Add') {
        this.getaddDataset();
      }
      else {
        if (this.process_ActiveTabName == 'PAYINPUTS') {
          this.getoutputDataset();
        }
        else {
          this.getpayrunDataset();
        }
      }
    }
  }

  bind_SearchIds() {
    this.searchedClientId = this.searchElementList.find(x => x.FieldName == '@clientId').Value;
    this.searchClientContractId = this.searchElementList.find(x => x.FieldName == '@clientcontractId').Value;
    this.searchedTeamId = this.searchElementList.find(x => x.FieldName == '@teamId').Value;
    let PayPeriod = this.searchElementList.find(x => x.FieldName == '@payperiodId');
    this.searchedPayperiodId = PayPeriod.Value;
  }

  re_Binding_searchPanel() {
    // console.log('loca', localStorage.getItem("SearchPanel"));

    //if (localStorage.getItem("SearchPanel") != null) {
    this.searchPanel = true;
    //this.pageLayout.SearchConfiguration.SearchElementList = JSON.parse(localStorage.getItem("SearchPanel"));
    //console.log('search items :', JSON.parse(localStorage.getItem("SearchPanel")));
    //this.getDataset();


    this.searchObject = new searchObject();
    var clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@clientId");
    clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.ClientName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId");
    clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.ContractName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@payperiodId");
    clientList.DropDownList != null && clientList.DropDownList.length > 0 && (this.searchObject.PayPeriodName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);

    clientList = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@teamId");
    clientList.Value != null && clientList.Value != undefined && (this.searchObject.TeamName = clientList.DropDownList.find(z => z.Id == clientList.Value).Name);

    this.searchedPayPeriodName = this.searchObject.PayPeriodName;

    // console.log('this.searchObject', this.searchObject);
    //}
  }

  openSearch() {
    this.searchPanel = false;
  }

  isCloseContent(event) {
    // if (localStorage.getItem("SearchPanel") == null) {
    //   this.searchObject = undefined;
    //   this.searchObject = _searchObject;
    // }
    this.searchPanel = true;
  }

  beforeTabChange(event) {
    if (event.nextId == 'Add') {
      if (this.addDataset == undefined || this.addDataset == null || this.addDataset.length <= 0) {
        this.addDataset = [];
        this.getaddDataset();
      }
    }
    else if (event.nextId == 'Process') {
      this.getoutputDataset();
    }
    this.activeTabName = event.nextId;
  }

  onChange_Processtabset(event) {

    if (event.nextId == 'PAYRUN') {


      if (this.payrunDataset == undefined || this.payrunDataset == null || this.payrunDataset.length <= 0) {

        if (this.payrunPageLayout == undefined || this.payrunPageLayout == null) {
          this.alertService.showInfo("PageLayout not available. Please try again in a minute");
          return;
        }

        this.payrunDataset = [];
        this.getpayrunDataset();
      }
    }
    else if (event.nextId == 'PAYINPUTS') {
      if (this.outputDataset == undefined || this.outputDataset == null || this.outputDataset.length <= 0) {
        this.outputDataset = [];
        this.getoutputDataset();
      }
    }

    this.process_ActiveTabName = event.nextId;
  }

  getDatasetBasedOnActiveTab() {
    if (this.isAllenClient && this.clientIdSME == 1988) {
      if ((this.roleCode == 'RegionalHR') && this.addPageLayout !== undefined && this.addPageLayout !== null) {
        this.getaddDataset();
      }
      else {
        if ((this.roleCode == 'PayrollOps') && this.process_ActiveTabName == 'PAYINPUTS' && this.outputPageLayout !== undefined && this.outputPageLayout !== null) {
          this.getoutputDataset();
        }
        else if (this.payrunPageLayout !== undefined && this.payrunPageLayout !== null) {
          this.getpayrunDataset();
        }
      }
    } else {
      if (this.activeTabName == 'Add' && this.addPageLayout !== undefined && this.addPageLayout !== null) {
        this.getaddDataset();
      }
      else {
        if (this.process_ActiveTabName == 'PAYINPUTS' && this.outputPageLayout !== undefined && this.outputPageLayout !== null) {
          this.getoutputDataset();
        }
        else if (this.payrunPageLayout !== undefined && this.payrunPageLayout !== null) {
          this.getpayrunDataset();
        }
      }
    }
  }

  getaddDataset() {
    this.addDataset = [];
    let searchElements = this.addPageLayout.SearchConfiguration.SearchElementList;
    if (this.roleCode === 'RegionalHR' && this.isAllenClient && this.clientIdSME === environment.environment.ACID) {
      const searchConfiguration = this.addPageLayout ? this.addPageLayout.SearchConfiguration : null;
      const searchElementList = searchConfiguration ? searchConfiguration.SearchElementList : null;

      if (searchElementList && searchElementList.length > 0) {
        const defaultSMEClientId = this.sessionService.getSessionStorage('default_SME_ClientId');
        const defaultSMEContractId = this.sessionService.getSessionStorage('default_SME_ContractId');

        const clientIdItem = searchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTID');
        if (clientIdItem) clientIdItem.Value = defaultSMEClientId;

        const contractIdItem = searchElementList.find(item => item.FieldName.toUpperCase() == '@CLIENTCONTRACTID');
        if (contractIdItem) contractIdItem.Value = defaultSMEContractId;

        const userIdItem = searchElementList.find(item => item.FieldName.toUpperCase() == '@USERID');
        if (userIdItem) userIdItem.Value = this.userId;

        const roleIdItem = searchElementList.find(item => item.FieldName.toUpperCase() == '@ROLEID');
        if (roleIdItem) roleIdItem.Value = this.roleId;

        searchElements = searchElementList;

        this.addPageLayout.SearchConfiguration.SearchElementList = searchElements;

      }
    } else {
      searchElements.find(x => x.FieldName == "ClientId").Value = this.searchedClientId;
      searchElements.find(x => x.FieldName == "ClientContractId").Value = this.searchClientContractId;
      searchElements.find(x => x.FieldName == "TeamId").Value = this.searchedTeamId;
    }

    console.log('searchElements', searchElements);

    this.spinner = true;
    this.pagelayoutservice.getDataset(this.addPageLayout.GridConfiguration.DataSource, searchElements).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.addDataset = JSON.parse(dataset.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.addDataset).then((result) => {
          result == true ? this.isAddDSDuplicateEntry = true : this.isAddDSDuplicateEntry = false;
        }, err => {

        })
        // console.log(dataset);
        //this.updateFilters();
      }
      else {
        // console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }

  getoutputDataset() {

    // console.log(this.outputPageLayout);

    this.outputDataset = [];
    this.spinner = true;

    let searchElementsForOutputDataset = _.cloneDeep(this.searchConfiguration.SearchElementList);
    searchElementsForOutputDataset.push({
      FieldName: "@PVRId",
      Value: 0,
      DefaultValue: 0,
      SendElementToGridDataSource: false,
      IsIncludedInDefaultSearch: false,
      DropDownList: []
    });

    searchElementsForOutputDataset.push({
      FieldName: "@processCategory",
      Value: 4,
      SendElementToGridDataSource: false,
      IsIncludedInDefaultSearch: false,
      DropDownList: []
    });

    this.pagelayoutservice.getDataset(this.outputPageLayout.GridConfiguration.DataSource, this.searchConfiguration.SearchElementList).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.outputDataset = JSON.parse(dataset.dynamicObject);
        this.utilityService.ensureIdUniqueness(this.outputDataset).then((result) => {
          result == true ? this.isOutputDuplicateEntry = true : this.isOutputDuplicateEntry = false;
        }, err => {

        })

        // console.log(dataset);
        this.pagelayoutservice.updateCollection(this.outputColumnDefinitions, this.outputDataset);

        // if(this.outputAngularGrid !== undefined && this.outputAngularGrid !== null){
        //   console.log("Updating Filter");
        //   this.pagelayoutservice.setColumnSettings(this.outputAngularGrid);
        // }
        // this.outputColumnDefinitions = this.pagelayoutservice.setColumns(this.outputPageLayout.GridConfiguration.ColumnDefinitionList , this.outputDataset);
        // this.outputGridOptions = this.pagelayoutservice.setGridOptions(this.outputPageLayout.GridConfiguration);
        this.spinner = false;

        //this.updateFilters();
      }
      else {
        // console.log('Sorry! Could not Fetch Data|', dataset);
        this.spinner = false;
      }
    }, error => {
      this.spinner = false;
      console.error(error);
    })
  }

  getpayrunDataset() {

    if (this.payrunPageLayout == undefined || this.payrunPageLayout == null) {
      this.alertService.showInfo("PageLayout not available. Please try again in a minute");
      return;
    }

    this.spinner = true;

    let searchElementsForPayrunDataset = _.cloneDeep(this.searchConfiguration.SearchElementList);
    // searchElementsForPayrunDataset.push({
    //   FieldName : "@processCategory" , 
    //   Value  : 4 , 
    //   SendElementToGridDataSource : false ,
    //   IsIncludedInDefaultSearch : false,
    //   DropDownList : []
    // });

    searchElementsForPayrunDataset = searchElementsForPayrunDataset.filter(x => x.FieldName !== "@PVRId");

    this.pagelayoutservice.getDataset(this.payrunPageLayout.GridConfiguration.DataSource,
      searchElementsForPayrunDataset).subscribe(data => {
        this.spinner = false;
        // console.log(data);
        if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
          this.payrunDataset = JSON.parse(data.dynamicObject);
          this.utilityService.ensureIdUniqueness(this.payrunDataset).then((result) => {
            result == true ? this.isPayRunDuplicateEntry = true : this.isPayRunDuplicateEntry = false;
          }, err => {

          })
        }
        else {
          this.alertService.showInfo("No Payrun for the choosen client exist");
          this.payrunDataset = null;
        }
      }, error => {
        this.alertService.showWarning("Error Occured while fetching Records");
        console.error(error);
      })
  }



  chooseEmployee() {

    this.getActiveEmployeeList();

    // this.searchText = null;
    $('#popup_chooseEmployee').modal('show');

    this.beforeEmployee = true;
    //this.ActiveEmployeeList.length = 0;

    var searchObj = JSON.stringify({

      TransactionStatus: 2
    })


  }

  getActiveEmployeeList() {
    let datasource: DataSource = {
      Name: "GetEmployeeELCDetails",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    if (this.searchConfiguration == undefined && this.roleCode == 'RegionalHR') {
      this.searchConfiguration = this.addPageLayout.SearchConfiguration;

    }

    let searchElementsForEmployeeList: SearchElement[] = _.cloneDeep(this.searchConfiguration.SearchElementList);

    searchElementsForEmployeeList = searchElementsForEmployeeList.filter(x => x.FieldName !== "@userId");

    searchElementsForEmployeeList = searchElementsForEmployeeList.filter(x => x.FieldName !== "@roleId");

    if (searchElementsForEmployeeList && searchElementsForEmployeeList.length > 0) {

      const defaultSMEClientId = this.sessionService.getSessionStorage('default_SME_ClientId');
      const defaultSMEContractId = this.sessionService.getSessionStorage('default_SME_ContractId');

      const clientIdItem = searchElementsForEmployeeList.find(item => item.FieldName.toUpperCase() == '@CLIENTID');
      if (clientIdItem) clientIdItem.Value = defaultSMEClientId;

      const contractIdItem = searchElementsForEmployeeList.find(item => item.FieldName.toUpperCase() == '@CLIENTCONTRACTID');
      if (contractIdItem) contractIdItem.Value = defaultSMEContractId;

    }

    searchElementsForEmployeeList = searchElementsForEmployeeList.filter(x => x.FieldName.toLocaleLowerCase() !== "@payperiodid");
    searchElementsForEmployeeList = searchElementsForEmployeeList.filter(x => x.FieldName.toLocaleLowerCase() !== "@pvrid");
    searchElementsForEmployeeList = searchElementsForEmployeeList.filter(x => x.FieldName.toLocaleLowerCase() !== "@processcategory");
    searchElementsForEmployeeList.push({
      FieldName: "@companyId",
      Value: this.companyId
    })
    searchElementsForEmployeeList.push({
      FieldName: "@roleCode",
      Value: this.roleCode
    })
    searchElementsForEmployeeList.push({
      FieldName: "@userId",
      Value: this.userId
    })


    console.log('searchElementsForEmployeeList', searchElementsForEmployeeList);


    this.ActiveEmployeeList = [];
    this.isLoading = true;

    this.pagelayoutservice.getDataset(datasource, searchElementsForEmployeeList).subscribe(data => {
      this.isLoading = false;
      if (data.Status) {
        if (data.dynamicObject != '') {

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
        // console.log("Error : "  , data)
        this.ActiveEmployeeList = [];
      }

    }, error => {
      this.isLoading = false;
      this.alertService.showWarning("Error Occured! Could not get records");
      console.log(error);
      this.ActiveEmployeeList = [];
    })

  }

  selectedEmployee(event, item) {



    if (this.employeeSelected != undefined && this.employeeSelected != null) {
      if (this.employeeSelected == item) {
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
    else {
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

  }

  proceed() {
    this.isProceed = false;
    // this.editing = false;
    this.preview_employee();
  }

  preview_employee() {

    this.beforeEmployee = false;
    $('#popup_chooseEmployee').modal('show');

  }

  start() {
    console.log("isResignation ::", this.isResignation);

    this.employeeObject.isResignation = this.isResignation;

    let employeeObject = {
      EmployeeId: this.employeeObject.EmployeeId,
      isResignation: this.employeeObject.isResignation
    }

    $('#popup_chooseEmployee').modal('hide');

    this.router.navigate(['app/fnf/finalsettlement'], {
      queryParams: {
        "Odx": btoa(JSON.stringify(employeeObject)),
      }
    });





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

  modal_dismiss() {
    $('#popup_chooseEmployee').modal('hide');
    this.isProceed = false;
    // this.isLoading = false;
    // this.selectedTTypes = [];

  }
  showNDCPopup() {
    this.addNODueCertificates();
    $('#popup_chooseEmployee').modal('hide');
    this.isProceed = false;
  }

  async do_initiate_Sale_order(index: string) {
    console.log('selected', this.selectedItems);



    let rowData = {
      "clientId": this.searchedClientId,
      "clientcontractId": this.searchClientContractId,
      "payperiodId": this.searchedPayperiodId,
      "ClientName": this.searchObject.ClientName,
      "ContractCode": this.searchObject.ContractName,
      "PayPeriod": this.searchObject.PayPeriodName
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
        "Value": this.searchedPayperiodId.toString(),
        "ReadOnly": false
      },
      {
        "InputFieldName": "",
        "OutputFieldName": "@processCategory",
        "Value": "4",
        "ReadOnly": false
      },
      ];
      // console.log('rowdata', this.rowDataService);
      const modalRef = this.modalService.open(InitiateSaleOrderModalComponent, modalOption);
      modalRef.componentInstance.ParentrowDataService = JSON.stringify(this.rowDataService);
      modalRef.result.then((result) => {

        // console.log('POPUP RESULT :', result);
        if (this.outputDataset == undefined || this.outputDataset == null || this.outputDataset.length <= 0) {
          this.outputDataset = [];
          this.getoutputDataset();
        }
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

    let payRunModel: PayRunModel = new PayRunModel();

    let clientName = this.searchObject.ClientName;
    let clientcontractName = this.searchObject.ContractName;
    let payperiodName = this.searchObject.PayPeriodName;
    let payperiodId = this.searchedPayperiodId

    this.alertService.confirmSwal1("Confirm Stage?", "Are you sure you want to initiate these employees to the Payrun?", "OK", "Cancel")
      .then((result) => {
        let LstPayRunDetails = [];
        this.loadingScreenService.startLoading();
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
        submitObject.Name = `${clientName}_${clientcontractName}_${payperiodName}`;
        submitObject.CompanyId = this.sessionDetails.Company.Id;
        submitObject.ClientContractId = this.searchClientContractId;
        submitObject.ClientId = this.searchedClientId;
        submitObject.PayPeriodId = payperiodId;
        submitObject.TeamIds = [];
        this.outputSelectedItems.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
        submitObject.TeamIds = _.union(submitObject.TeamIds);
        submitObject.NumberOfEmpoyees = this.outputSelectedItems.length;
        submitObject.NoOfSaleOrders = 0;
        submitObject.PayRunStatus = PayRunStatus.Intitated;
        submitObject.Id = 0;
        submitObject.LstPayrunDetails = LstPayRunDetails;
        submitObject.ModeType = UIMode.Edit;
        submitObject.ProcessCategory = ProcessCategory.Termination;
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
                this.loadingScreenService.stopLoading();
                this._redirect_to_payrun(_payRun_answer.Id);
              }, 300);
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
            }
          }, error => {
            this.loadingScreenService.stopLoading();

          });
      }).catch(cancel => {

      });

  }

  _redirect_to_payrun(PayRunId) {

    let payperiodName = this.searchObject.PayPeriodName;
    let payperiodId = this.searchedPayperiodId
    let contractCode: string = '';

    let clientcontractSearchElement = this.searchConfiguration.SearchElementList.find(a => a.FieldName == "@clientcontractId");
    clientcontractSearchElement.DropDownList != null && clientcontractSearchElement.DropDownList.length > 0 && (contractCode = clientcontractSearchElement.DropDownList.find(z => z.Id === clientcontractSearchElement.Value).Code);

    let rowData = {
      "clientId": this.searchedClientId,
      "clientcontractId": this.searchClientContractId,
      "payperiodId": this.searchedPayperiodId,
      "ClientName": this.searchObject.ClientName,
      "ContractCode": contractCode,
      "PayPeriod": payperiodName,
      "ProcessCategory": 2

    }

    this.rowDataService.dataInterface.RowData = rowData;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": PayRunId,
      "ReadOnly": false
    }];
    // console.log('initiate pay urn', this.rowDataService.dataInterface);

    this.businessType == 1 ? this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun') : this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')

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

    // console.log('test', isProcessedExist);

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
        this.loadingScreenService.startLoading();
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
        submitObject.CompanyId = this.sessionDetails.Company.Id;
        submitObject.ClientContractId = this.searchClientContractId;
        submitObject.ClientId = this.searchedClientId;
        submitObject.PayPeriodId = this.searchedPayperiodId;
        submitObject.PayPeriodName = this.searchedPayPeriodName;
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
              this.loadingScreenService.stopLoading();
              this.alertService.showSuccess(apiResult.Message);
              this.getoutputDataset();
            } else {
              this.loadingScreenService.stopLoading();
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

  do_process_TimeCard() {
    this.LstProceeTimeCards = [];
    this.processedEMP = [];
    if (this.outputSelectedItems.length > 0) {

      // let isAvaliable = [];
      // isAvaliable = this.selectedItems.filter(r => environment.environment.IsAllowableStatusForReProcess.indexOf(Number(r.StatusCode)) >= 0);
      // if (isAvaliable.length != this.selectedItems.length) {
      //   this.alertService.showWarning('Error : One or more Employee items cannot be processed because the status is in an invalid state. Please contact your support admin.');
      //   return;
      // }

      this.loadingScreenService.startLoading();
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
      processTimeCardsModel.ProcessCategory = 4;

      this.payrollService.post_processAnyTimeCard(processTimeCardsModel)
        .subscribe((result) => {
          console.log('PROCESS TIME CARD RESPONSE :: ', result);
          this.loadingScreenService.stopLoading();
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            this.processedEMP = apiResult.Result as any;
            // this.alertService.showSuccess(apiResult.Message);
            this.getoutputDataset();
            $('#popup_chooseCategory').modal('show');

          } else {
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

    // console.log("TImeCards ::", lstTimeCard);

    this.loadingScreenService.startLoading();
    this.payrollService.post_voidTimeCard(lstTimeCard).subscribe(data => {
      this.loadingScreenService.stopLoading();
      // console.log("Void TIme Card Result ::" , data);
      if (data.Status) {
        this.alertService.showSuccess(data.Message);
        this.getoutputDataset();
      }
      else {
        this.alertService.showWarning(data.Message);
      }

    }, error => {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Error occured");
    })

  }

  revokeFnF(tab: string) {
    // console.log(tab , this[tab + "SelectedItems"]);
    if (this[tab + "SelectedItems"] == undefined || this[tab + "SelectedItems"] == null || this[tab + "SelectedItems"].length <= 0) {
      this.alertService.showWarning("Please select atleast one row!");
      return;
    }

    let lstEmployeeId: number[] = [];

    this[tab + "SelectedItems"].forEach(obj => {
      lstEmployeeId.push(obj.EmployeeId);
    })

    let dataSource: DataSource = {
      Name: 'RevokeFnF',
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElementList: SearchElement[] = [
      {
        FieldName: '@employeeIds',
        Value: JSON.stringify(lstEmployeeId)
      }
    ]

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

    //     this.loadingScreenService.startLoading();
    //     this.pagelayoutservice.getDataset(dataSource, searchElementList).subscribe(data => {
    //       console.log("Revoke FnF result", data);
    //       this.loadingScreenService.stopLoading();
    //       if (data.Status && data.dynamicObject != null && data.dynamicObject != '') {
    //         this.resultList = JSON.parse(data.dynamicObject);
    //         $('#popup_displayResult').modal('show');
    //         this["get" + tab + "Dataset"]();
    //       }
    //       else {
    //         this.alertService.showWarning("Error Occured. Error ->" + data.Message);
    //       }

    //     }, error => {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning("Something went wrong, Please try again");
    //       console.error(error);
    //     })

    //   } else if (result.dismiss === Swal.DismissReason.cancel) {

    //     swalWithBootstrapButtons.fire(
    //       'Cancelled',
    //       'Your request has been cancelled',
    //       'error'
    //     )
    //   }
    // })

    this.alertService.confirmSwalWithClose('Confirm?', "Are you sure you want to proceed?", 'Ok!', 'No, cancel!',).then((result) => {
      this.alertService.confirmSwalWithRemarks('Revoke Remarks').then((result) => {
        if (result != false) {
          const payload = {
            "employeeIds": JSON.stringify(lstEmployeeId),
            "remarks": result as any
          }
          this.callRevokeSeparation(payload, tab);
          return;
        }
      }).catch(error => {
      });
    }).catch(error => {
    });

  }

  callRevokeSeparation(payload, tab) {
    this.loadingScreenService.startLoading();
    this.employeeService.RevokeSeparation(payload).subscribe(data => {
      console.log("Revoke FnF result", data);
      this.loadingScreenService.stopLoading();
      if (data.Status && data.Result != null && data.Result != '') {
        this.resultList = JSON.parse(data.Result);
        $('#popup_displayResult').modal('show');
        this["get" + tab + "Dataset"]();
      } else {
        this.alertService.showWarning("Error Occured. Error ->" + data.Message);
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Something went wrong, Please try again");
      console.error(error);
    })
  }

  viewEmployeeStatus() {
    this.showEmpStatusDrawer = true;
    console.log('add selected items ', this.addSelectedItems);
    this.selectedEmpStatusView = this.addSelectedItems[0];
  }

  closeEmpStatusDrawer() {
    this.showEmpStatusDrawer = false;
  }

  refreshAddDataset() {
    this.getaddDataset();
  }

  refreshOuputDataset() {
    this.getoutputDataset();
  }


  addAngularGridReady(angularGrid: AngularGridInstance) {
    this.addAngularGrid = angularGrid;
    this.addGridObj = angularGrid.slickGrid; // grid object
    this.addDataviewObj = angularGrid.dataView;
  }

  outputAngularGridReady(angularGrid: AngularGridInstance) {
    this.outputAngularGrid = angularGrid;
    this.outputGridObj = angularGrid.slickGrid; // grid object
    this.outputDataviewObj = angularGrid.dataView;

    // console.log("Output grid ready");

    if (this.outputPageLayout.GridConfiguration.SaveColumnSettingsLocally !== undefined
      && this.outputPageLayout.GridConfiguration.SaveColumnSettingsLocally !== null
      && this.outputPageLayout.GridConfiguration.SaveColumnSettingsLocally) {
      this.outputAngularGrid.filterService.onFilterChanged.subscribe(x => {
        // console.log("Filter changes ::" , x);

        this.pagelayoutservice.saveColumnFilterSettingsInLocalStorage(x);

      })

      this.outputAngularGrid.sortService.onSortChanged.subscribe(x => {
        // console.log("sorting changesd ::" , x);

        this.pagelayoutservice.saveColumnSortingSettingsInLocalStorage(x);
      })
    }

    if (this.outputPageLayout.GridConfiguration.SetColumnSettingsFromLocal !== undefined
      && this.outputPageLayout.GridConfiguration.SetColumnSettingsFromLocal !== null
      && this.outputPageLayout.GridConfiguration.SetColumnSettingsFromLocal) {
      this.pagelayoutservice.setColumnSettings(this.outputAngularGrid);
    }


  }

  payrunAngularGridReady(angularGrid: AngularGridInstance) {
    this.payrunAngularGrid = angularGrid;
    this.payrunGridObj = angularGrid.slickGrid; // grid object
    this.payrunDataviewObj = angularGrid.dataView;
  }

  onAddCellClicked(e, args) {
    const column = this.addAngularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'edit') {

      // console.log("Editing ::" , column.dataContext);

      this.label_EmployeeName = column.dataContext.EmployeeName;
      this.label_EmployeeCode = column.dataContext.EmployeeCode;
      this.label_ClientName = column.dataContext.ClientName;
      this.label_ClientContractCode = column.dataContext.ClientContractCode;
      this.Label_DOJ = column.dataContext.DOJ;

      this.employeeObject = column.dataContext;
      this.editing = true;

      if (this.IsNDCAddFormRequired) {
        this.addNODueCertificates();
      } else {
        this.preview_employee();
      }




    }
  }

  onOuputCellClicked(e, args) {
    const metadata = this.outputAngularGrid.gridService.getColumnFromEventArguments(args);

    const column = this.outputAngularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'NetPay') {
      this.onNetPay_Slider(column.dataContext);
    }

    if (column.columnDef.id == 'edit') {

      let status: TimeCardStatus = column.dataContext["StatusCode"] as number
      let canEdit: boolean = (status == TimeCardStatus.Initiated ||
        status == TimeCardStatus.PayrollCalculationFailed ||
        status == TimeCardStatus.InPayrollQueue || status == TimeCardStatus.PayrollCalculated ||
        status == TimeCardStatus.QcRejected);

      if (!canEdit) {
        this.alertService.showWarning("Cant Edit record! Please check the processing status!");
        return;
      }

      this.router.navigate(['app/fnf/finalsettlement'], {
        queryParams: {
          "Odx": btoa(JSON.stringify(column.dataContext)),
        }
      });
    }

  }

  onpayrunCellClicked(e, args) {

    const column = this.payrunAngularGrid.gridService.getColumnFromEventArguments(args);

    if (column.columnDef.id == 'PayRunId') {
      this.onClickPayRun(column.dataContext)
    }
  }

  onAddSelectedRowsChanged(eventData, args) {
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
  addNODueCertificates() {
    const modalRef = this.modalService.open(NoDueCertificateComponent, this.modalOption);
    modalRef.componentInstance.rowData = this.employeeObject;

    modalRef.result.then((result) => {
      if (result == 'Modal Saved') {
        this.getaddDataset();
      }
      if (result == 'Modal OnNext') {
        this.preview_employee();
      }
    }).catch((error) => {
      console.log(error);
    });

  }
  onOutputSelectedRowsChanged(eventData, args) {

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


  // onNetPay_Slider(rowRecord) { // old code Harvis
  //   // if (rowRecord.NetPay > 0) {
  //     this.rowRecord = rowRecord;
  //     console.log("Row Record ::" , rowRecord );
  //     if (  rowRecord.Payitem == null || rowRecord.Payitem == "") {
  //       this.alertService.showInfo("No Pay items record found!");
  //       return;
  //     }
  //     this.Payitems = JSON.parse(rowRecord.Payitem);
  //     this.Payitems = this.Payitems.filter(a => a.ProductTypeId === 1 || a.ProductTypeId === 2 || a.ProductTypeId === 6)
  //     console.log('payItem', this.Payitems);

  //     this.open();


  //   // }
  // }

  async onNetPay_Slider(rowRecord) { // updated by mano
    this.rowRecord = rowRecord;
    this.loadingScreenService.startLoading();
    await this.payrollService.GetPaytransactionDetails(rowRecord.PaytransactionId)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          let answer = JSON.parse(apiResult.Result);
          this.Payitems = answer.find(a => a.EmployeeId == rowRecord.EmployeeId);
          this.loadingScreenService.stopLoading();
          if (this.Payitems == undefined || this.Payitems.length == 0) {
            this.alertService.showInfo("No Pay items record found!");
            return;
          }
          this.Payitems = this.Payitems.PayItemdata;
          this.Payitems = this.Payitems.filter(a => a.ProductTypeId === 1 || a.ProductTypeId === 2 || a.ProductTypeId === 6)
          this.open();
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo("No Pay items record found!");
          return;
        }
      })

  }

  previewSlips(paytransactionId) {
    this.loadingScreenService.startLoading();
    this.payrollService.previewSettlement(paytransactionId).subscribe((result) => {
      let apiResult: apiResult = result;
      try {
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();
          if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {
            let base64 = apiResult.Result;
            let contentType = 'application/pdf';
            let fileName = "preview_settlement_" + Date.now();
            const byteArray = atob(base64);
            const blob = new Blob([byteArray], { type: contentType });
            let file = new File([blob], fileName, {
              type: contentType,
              lastModified: Date.now()
            });
            if (file !== null) {
              const newPdfWindow = window.open('', '');
              const content = encodeURIComponent(base64);
              // tslint:disable-next-line:max-line-length
              const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';
              const iframeEnd = '\'><\/iframe>';
              newPdfWindow.document.write(iframeStart + content + iframeEnd);
              newPdfWindow.document.title = fileName;
            }
          }
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);

        }
      }
      catch (err) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(err);
      }
    });
  }



  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }




  modal_dismiss_display() {
    $('#popup_chooseCategory').modal('hide');

  }

  modal_dismiss_displayResult() {
    $('#popup_displayResult').modal('hide');

  }

  downloadPaysheet() {

    if (this.outputSelectedItems.length > 0) {
      this.loadingScreenService.startLoading();
      const jobj = new GeneratePIS();
      jobj.ClientId = this.searchedClientId;
      jobj.ClientContractId = this.searchClientContractId;
      jobj.EmployeeIds = [];
      jobj.TeamIds = [];
      this.outputSelectedItems.forEach(function (item) { jobj.TeamIds.push(item.teamId) })
      this.outputSelectedItems.forEach(function (item) { jobj.EmployeeIds.push(item.EmployeeId) })
      jobj.TeamIds = _.union(jobj.TeamIds)

      jobj.PayPeriodId = this.searchedPayperiodId;
      jobj.PISId = 0;
      jobj.IsDownloadExcelRequired = true;
      jobj.ObjectStorageId = 0;
      jobj.RequestedBy = this.userId;
      jobj.RequestedOn = 0;
      jobj.GeneratedRecords = 0;
      jobj.IsPushrequired = true;
      jobj.ProcessCategory = 4;

      this.payrollService.put_downloadPaysheet(jobj)
        .subscribe((result) => {
          console.log('PAY SHEET DOWNLOAD RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            var payperiodName = this.searchObject.PayPeriodName.substring(0, 3)
            var dynoFileName = `PAYSHEET_FnF_${this.searchObject.ClientName}_${this.searchObject.TeamName}_${this.searchObject.PayPeriodName}`;
            this.downloadService.base64ToBlob(apiResult.Result, dynoFileName);
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, (err) => {

        })
    } else {
      this.alertService.showWarning("Oh ho! As per the paysheet requirement, You must make a selection(s) from the list.")
    }

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


  doOpenEmployeePreviewScreen() {
    if (this.addSelectedItems.length == 0 || this.addSelectedItems.length > 1) {
      this.alertService.showWarning("To display the employee details, please choose just one item at a time.");
      return;
    }
    this.employeeProfile = this.addSelectedItems[0];
    $("#modal_employeepreview_aside_left").modal('show');
  }

  dismiss_employeepreview() {
    this.employeeProfile = null;
    $("#modal_employeepreview_aside_left").modal('hide');
  }

  downloadAttachments() {
    const documentName = this.employeeProfile.DocumentName;
    const documentId = this.employeeProfile.DocumentId;

    this.loadingScreenService.startLoading();
    this.fileUploadService.downloadObjectAsBlob(documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (!res) {
            this.handleDownloadError();
            return;
          }
          console.log('res', res);
          saveAs(res);
        },
        (error) => {
          console.log('error', error);
          this.loadingScreenService.stopLoading();
          if (error instanceof HttpErrorResponse && error.status === 500) {
          } else {
            this.handleDownloadError();
          }
        },
        () => {
          this.loadingScreenService.stopLoading();
        }
      );
  }
  private handleDownloadError() {
    this.loadingScreenService.stopLoading();
    this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
  }


  getResignationHistory() {

    const employeeId = this.employeeProfile.EmployeeId;
    const transactionType = this.employeeProfile.EmployeeFnFTransactionId == 0 ? 1 : 2;
    this.loadingScreenService.startLoading();
    this.employeeService.GetEmployeeExitTransactionHistory(employeeId, transactionType)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.handleError(error);
          return of(null);
        }))
      .subscribe((result) => {
        let apiResponse: apiResult = result;
        this.loadingScreenService.stopLoading();
        try {
          if (apiResponse.Status) {
            let data = { ExitTransactionHistoryLog: JSON.parse(apiResponse.Result) };
            const modalRef = this.modalService.open(ResignationHistoryComponent);
            modalRef.componentInstance.data = data;
            modalRef.result.then((result) => {
              if (result) {
                console.log(result);
              }
            });
          } else {
            this.alertService.showWarning(apiResponse.Message);
            return;
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
          console.log('Exception Error : ', error);
        }
      }, error => {
        this.loadingScreenService.stopLoading();
      });
  }

  handleError(err: any): void {
    this.alertService.showWarning(`Something is wrong! ${err}`);
  }



  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

}

