import { PayrollModel, _PayrollModel } from './../../../_services/model/Payroll/ParollModel';
import { PayrollVerificationRequestDetails, PVRStatus } from './../../../_services/model/Payroll/PayrollVerificationRequest';
import { BehaviorSubject } from 'rxjs';
import {
  subMonths,
  addMonths,
  addDays,
  addWeeks,
  subDays,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isBefore,
} from 'date-fns';

import { Subject, Observable } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent, CalendarMonthViewDay,
  CalendarView,
} from 'angular-calendar';
import { Component, OnInit, HostListener } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Column, GridOption, AngularGridInstance, Aggregators, Grouping, GroupTotalFormatters, Formatters, Formatter, GridService, FieldType, Filters, OnEventArgs, MultipleSelectOption, OperatorType, AngularUtilService } from 'angular-slickgrid';
import { Title } from '@angular/platform-browser';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as FileSaver from 'file-saver';
import Swal from "sweetalert2";

// MODEL CLASS AND INTEFACE
import { PageLayout, ColumnDefinition, SearchElement } from '../../personalised-display/models';
import { PayrollQueueMessage } from './../../../_services/model/Payroll/PayrollQueueMessage';
import { DataSource } from './../../personalised-display/models';
import { apiResult } from './../../../_services/model/apiResult';
import { GeneratePIS } from './../../../_services/model/Payroll/generatePIS';
import { DataInterface } from './../../personalised-display/row-data.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';

//SERVICE

import { RowDataService } from '../../personalised-display/row-data.service';
import { SlickgridService } from 'src/app/_services/service/slickgrid.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { DownloadService, HeaderService, PagelayoutService, AlertService, PayrollService, ExcelService, SessionStorage, EmployeeService } from 'src/app/_services/service/index';
//CONFIG JSON (ASSETS)
import { environment } from "../../../../environments/environment";

// POPUP MODAL COMPONENTS
import { PayrollImportdataComponent } from 'src/app/shared/modals/payroll/payroll-importdata/payroll-importdata.component';
import { PayrollVerificationRequest } from 'src/app/_services/model/Payroll/PayrollVerificationRequest';
import { UIMode, BaseModel } from 'src/app/_services/model/Common/BaseModel';
import { TimeCardStatus, TimeCardStatus_SME } from 'src/app/_services/model/Payroll/TimecardStatus';
import { TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { Attendance, AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { Allowance, AllowanceType, PayUnitType } from 'src/app/_services/model/Payroll/Allowance';
import { Adjustment, AdjustmentType, BillUnitType } from 'src/app/_services/model/Payroll/Adjustment';
import { ProductType } from 'src/app/_services/model/ProductType';
import { AttendancelogModalComponent } from 'src/app/shared/modals/payroll/attendancelog-modal/attendancelog-modal.component';
import { PayRunDetails, PayRun, PayRunStatus, ProcessCategory } from 'src/app/_services/model/Payroll/PayRun';
import { PayRunModel, _PayRun } from 'src/app/_services/model/Payroll/PayRunModel';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
// import { TimeCardModel,_TimeCardModel } from 'src/app/_services/model/Payroll/TimeCardModel';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { CommaSeparatedStringFilterHandler } from 'src/app/grid-filters/comma-separated-strings/CommaSeparatedStringFilterHandler';
import { CommaSeparatedStringsFilterComponent } from 'src/app/grid-filters/comma-separated-strings/comma-separated-strings-filter/comma-separated-strings-filter.component';
import { InstanceLoader } from 'src/app/_services/service/InstanceLoader';


export class TimeCardModel extends BaseModel {
  NewDetails?: TimeCard;
  OldDetails?: any;
  customObject1: any;
  customObject2: any;
}

export const _TimeCardModel: TimeCardModel = {

  NewDetails: null,
  OldDetails: null,
  customObject1: {},
  customObject2: {},
  Id: 0

}
const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  green: {
    primary: '#3BBD72',
    secondary: '#3BBD72'
  }
};
type CalendarPeriod = 'day' | 'week' | 'month';

@Component({
  selector: 'app-payrollinputtransaction',
  templateUrl: './payrollinputtransaction.component.html',
  styleUrls: ['./payrollinputtransaction.component.scss']
})
export class PayrollinputtransactionComponent implements OnInit {

  // PAGE LAYOUT CONFIGURATION - WE USE IT FOR THIS DB PURPOSE

  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  code_payrollInput: string; // PAGE ROUTING CODE (USER INPUTS FROM CONFIG JSON) - THIS IS USED TO HOW THE COMPONENT IS FORMED
  code_processedOutput: string; // PAGE ROUTING CODE (USER INPUTS FROM CONFIG JSON) - THIS IS USED TO HOW THE COMPONENT IS FORMED

  //ALL OF THIS MAKES SENSE FOR THE NEW GRID ORGS - SLICKGRID INSTANCE CONFIG LIKE DATASET, GRIDOPTIONS, COLUMN, PAGINATION

  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  draggableGroupingPlugin: any;
  dataset: any[];
  columnDefinition: Column[];
  gridOptions: GridOption;
  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };

  spinner: boolean;
  post_load_spinner: boolean = false;

  modalOption: NgbModalOptions = {};

  previewFormatter: Formatter;
  hyperlinkFormatter: Formatter;
  approveFormatter: Formatter;
  rejectFormatter: Formatter;
  errorLog: Formatter;

  activeTabName: string;
  _slider_activeTabName: string;

  inPayrollInputsGridInstance: AngularGridInstance;
  inPayrollInputsGrid: any;
  inPayrollInputsGridService: GridService;
  inPayrollInputsDataView: any;

  inProcessedOutputsGridInstance: AngularGridInstance;
  inProcessedOutputsGrid: any;
  inProcessedOutputsGridService: GridService;
  inProcessedOutputsDataView: any;

  // for Saved tab
  inPayrollInputsColumnDefinitions: Column[];
  inPayrollInputsGridOptions: GridOption;
  inPayrollInputsDataset: any;

  // for Rejected tab
  inProcessedOutputsColumnDefinitions: Column[];
  inProcessedOutputsGridOptions: GridOption;
  inProcessedOutputsDataset: any;

  inPayrollInputsList = [];
  inProcessedOutputsList = [];
  TeamList = [];

  PVRId: any;
  ClientName: any;
  ClientContractName: any;
  PayPeriodName: any;
  AttendanceCycle: any;
  TeamName: any;
  TeamId: any;
  selectedItems: any[];
  selectedItems1: any[];
  LstGeneratePIS: any[]; // GENERATE PIS API - ARRAY LIST
  LstProceeTimeCards: any[]; // PROCESS TIME CARD API - ARRAY LIST 
  LstSubmitForVerifcation: any[] // SUBMIT FOR VERFICATION - ARRAY LIST
  header_items: any;
  processedEMP = [];
  lstImportHistory = [];
  processedEMPMarkFnF = [];
  searchElementList1 = [];
  searchElementList = [];
  DataSourceTemp = [];

  BehaviourObject_Data: any;

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any;

  payrollModel: PayrollModel = new PayrollModel();
  visible = false;
  rowRecord: any; Payitems: any;
  // FOR PAYROLLINPUT EDIT (SALARY INPUT/ATTENDANCE CYCLE)
  payrollSlider_visible = false;
  LstTimeCardAllowanceProducts: any[] = [];
  LstTimeCardAdjustmentProducts: any[] = [];
  TimeCardDetails = new TimeCard();

  TimeCardOldDetials = new TimeCard();
  // timeCardModel : TimeCardModel = new TimeCardModel(); 

  // LOP Calendar
  view: CalendarView | CalendarPeriod = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  minDate: Date = subMonths(new Date(), 1);
  maxDate: Date = addMonths(new Date(), 1);
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;
  noOfP = 0; noOfA = 0;
  timecardEditDOJ: any;
  refresh: Subject<any> = new Subject();


  // Revoke LOP Calendar
  view_revoke: CalendarView | CalendarPeriod = CalendarView.Month;
  viewDate_revoke: Date = new Date();
  events_revoke: CalendarEvent[] = [];
  minDate_revoke: Date = subMonths(new Date(), 1);
  maxDate_revoke: Date = addMonths(new Date(), 1);
  prevBtnDisabled_revoke: boolean = false;
  nextBtnDisabled_revoke: boolean = false;
  noOfP_revoke = 0; noOfA_revoke = 0;
  timecardEditDOJ_revoke: any;
  refresh_revoke: Subject<any> = new Subject();
  // SME CONFIGURATIONS
  BusinessType: any;
  isEnableForSME_Process: boolean = true;
  isEnableForSME_MarkFnF: boolean = true;
  isEnableForSME_SubmitQC: boolean = true;
  isEnableForSME_EmpForPayrun: boolean = true;
  payRunModel: PayRunModel = new PayRunModel();
  preTMSelectedIds = [];
  timecardStatus = [];

  // ATTENDANCE DETAILS TAB
  attendanceLOPDays: any;
  attendanceTotalDays: any;
  isattendanceFullMonthLOP: any = null;
  isattendancePeriodType: any = null;
  LstnonMustorRoleAttendance = [];
  remove_LOPAttendanceList = [];
  isEdited: boolean = false; attendancePresentDays: any;
  // REVOKE LOP
  isFullMonthLOP: any;
  Lst_PrevPayPeriod: any[] = [];
  _RevokeLOPDays: any;
  _LOPDays: any = null;
  Lst_LOPDetails: any[] = [];
  RevokeLOPAttendance = [];
  Lst_LOPTimeCardDetails: any;
  TeamDetails: any;
  remove_RevokeLOPAttendanceList = [];
  isEdited_Revoked: boolean = false;
  _RevokePayPeriod: any;
  isPeriodBased: boolean = true;
  isfullmonthremoveAtte = [];
  TimecardDetails_RevokeLOP: any;
  isChangedPayPeriod: boolean = false;

  markFnf_ResignationDate: any;
  markFnf_LastWorkingDate: any;
  markfnf_Reason: any;
  markfnf_minDate = new Date();
  markfnf_maxDate = new Date();
  IsAttendanceStampingBasedonLastDate: boolean = false;
  glbReferencedTimeCardId: any;

  revokLopdays_attendanceList = [];
  selectedPayPeriodId_Revoke: any;
  revokeLOP_payperiodDetails = [];;
  revokeLOP_calendar_payperiodDetails = [];
  current_Payperiod_Details: any;
  alreadyRevokedDays: any = 0;
  updatedRevokeLopDaysList = [];
  isPayrollInputsDuplicateEntry: boolean = false;
  isProcessedOutputDuplicateEntry: boolean = false;
  empDOJ: any;
  taxDetailsForm: FormGroup
  constructor(

    private headerService: HeaderService,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router,
    public slickgridService: SlickgridService,
    private modalService: NgbModal,
    private loadingScreenService: LoadingScreenService,
    private alertService: AlertService,
    private payrollService: PayrollService,
    public sessionService: SessionStorage,
    public downloadService: DownloadService,
    private excelService: ExcelService,
    private employeeService: EmployeeService,
    private utilsHelper: enumHelper,
    private utilityService: UtilityService,
    private formBuilder: FormBuilder,
    private angularUtilService: AngularUtilService
    // private enumCustomHelper : enumCustomHelper



  ) {
    this.createReactiveForm();
  }
  get g() { return this.taxDetailsForm.controls; } // reactive forms validation 


  createReactiveForm() {

    this.taxDetailsForm = this.formBuilder.group({
      IsPanExist: [false],
      IsTaxExempted: [false],
      IsNewTaxRegime: [false],
      proofMode: [false],
      remarks: ['']
      // IsNewTaxRegimeOpted: [false],

    });
  }


  inPayrollInputsGridReady(angularGrid: AngularGridInstance) {
    this.inPayrollInputsGridInstance = angularGrid;
    this.inPayrollInputsDataView = angularGrid.dataView;
    this.inPayrollInputsGrid = angularGrid.slickGrid;
    this.inPayrollInputsGridService = angularGrid.gridService;
  }
  inProcessedOutputsGridReady(angularGrid: AngularGridInstance) {
    this.inProcessedOutputsGridInstance = angularGrid;
    this.inProcessedOutputsDataView = angularGrid.dataView;
    this.inProcessedOutputsGrid = angularGrid.slickGrid;
    this.inProcessedOutputsGridService = angularGrid.gridService;
  }



  ngOnInit() {
    this.route.data.subscribe(data => {
      data = JSON.parse(sessionStorage.getItem("RowDataInterface"));
      this.BehaviourObject_Data = data.dataInterface.RowData;
      this.header_items = data.dataInterface.RowData;
    });
    // this.header_items.PVRId === -1 ? this.activeTabName = 'payrollInputs' : this.activeTabName = 'processedOutput';
    this.activeTabName = 'payrollInputs'
    this.titleService.setTitle('Payroll');
    this.headerService.setTitle('Payroll Inputs / Employee');
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    // this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == 1).BusinessType;

    this.isEnableForSME_Process = this.BusinessType == 3 ? true : false; // coming from access control temp control 
    this.isEnableForSME_MarkFnF = this.BusinessType == 3 ? true : true; // coming from access control temp control 
    this.isEnableForSME_SubmitQC = this.BusinessType == 3 ? true : false; // coming from access control temp control 
    this.isEnableForSME_EmpForPayrun = this.BusinessType == 3 ? false : true; // coming from access control temp control 

    // this.code_payrollInput = this.header_items.PVRId === -1 ? environment.environment.PAYROLLINPUTS_LAYOUT_CODE : environment.environment.PROCESSEDOUTPUTS_LAYOUT_CODE;
    this.code_payrollInput = environment.environment.PAYROLLINPUTS_LAYOUT_CODE;
    this.get_pagelayout_configurations(this.code_payrollInput);
    // this.get_pagelayout_configuration_1(environment.environment.PROCESSEDOUTPUTS_LAYOUT_CODE);

    this.selectedItems = [];
    this.selectedItems1 = [];

    this.previewFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<i class="mdi mdi-download m-r-xs" title="Download PIS" style="cursor:pointer"></i> ` : '<i class="mdi mdi-download" style="cursor:pointer"></i>';
    this.hyperlinkFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value != null && value != -1 ? '<a  href="javascript:;">' + value + '</a> ' : '---';
    this.errorLog = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value != null && value != -1 ? '<div style="cursor:pointer">' + value + '</div> ' : '';

    if (this.BusinessType != 3) {
      this.timecardStatus = this.utilsHelper.transform(TimeCardStatus_SME) as any;

    } else {
      this.timecardStatus = this.utilsHelper.transform(TimeCardStatus) as any;

    }

  }

  fetch_gridRecord_config() {
    this.route.data.subscribe(data => {
      // if (_.isEmpty(data)) {
      data = JSON.parse(sessionStorage.getItem("RowDataInterface"))
      if (data.dataInterface.SearchElementValuesList !== null && data.dataInterface.SearchElementValuesList.length > 0) {
        this.BehaviourObject_Data = data.dataInterface.RowData;
        this.header_items = data.dataInterface.RowData; // extra line (for production remove it)
        this.ClientName = data.dataInterface.RowData.ClientName;
        this.PVRId = data.dataInterface.RowData.PVRId;
        var titleText = this.PVRId != 0 && this.PVRId != -1 ? `Payroll Inputs / Employee PVR # ${this.PVRId}` : `Payroll Inputs / Employee`
        this.headerService.setTitle(titleText);
        this.ClientContractName = data.dataInterface.RowData.ContractCode;
        this.PayPeriodName = data.dataInterface.RowData.PayPeriod;
        this.TeamName = data.dataInterface.RowData.Team;
        this.TeamId = data.dataInterface.RowData.teamId;
        // const attcycle_convert = new Date(data.dataInterface.RowData.AttendanceCycle);
        // const new_date = moment(attcycle_convert, "DD-MM-YYYY");
        // const day = new_date.format('DD');
        // const day_plus29days = Number(day) + Number(29);
        // this.AttendanceCycle = `${day} th - ${day_plus29days} th`;

        this.searchElementList1.forEach(element => {
          if (element.FieldName == "@clientcontractId") {
            element.Value = data.dataInterface.SearchElementValuesList.find(z => z.OutputFieldName == "@clientcontractId").Value;
          } else if (element.FieldName == "@teamId") {
            element.Value = data.dataInterface.SearchElementValuesList.find(z => z.OutputFieldName == "@teamId").Value;
          }
        });
        this.DataSourceTemp = this.searchElementList1.filter(x => x.FieldName == "@teamId")[0].DataSource;
        console.log(this.DataSourceTemp);
        this.searchElementList = this.searchElementList1.filter(x => x.FieldName == "@clientcontractId");
        console.log('sech , ', this.searchElementList);
        // for team list purpose  this.getTeamList_UsingDataset(this.searchElementList, this.DataSourceTemp);
        data.dataInterface.SearchElementValuesList.forEach(searchElementValues => {
          this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
            if (searchElementValues.OutputFieldName === searchElement.FieldName) {
              searchElement.Value = searchElementValues.Value;
              searchElement.ReadOnly = searchElementValues.ReadOnly;
            }
          })
          // this.pageLayout_second.SearchConfiguration.SearchElementList.forEach(searchElement => {
          //   if (searchElementValues.OutputFieldName === searchElement.FieldName) {
          //     searchElement.Value = searchElementValues.Value;
          //     searchElement.ReadOnly = searchElementValues.ReadOnly;
          //   }
          // })
        })
        var PVRId = this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@PVRId").Value;
        if (PVRId == null) {
          this.pageLayout.SearchConfiguration.SearchElementList.find(a => a.FieldName == "@PVRId").Value = 0;
        }
        console.log(this.pageLayout.SearchConfiguration);
        this.getDataset();
      }
      else {
        alert('no data');
      }
      this.rowDataService.dataInterface.RowData = null;
      this.rowDataService.dataInterface.SearchElementValuesList = [];
      // }
    }, error => {
      console.log(error);
      this.rowDataService.dataInterface.RowData = null;
      this.rowDataService.dataInterface.SearchElementValuesList = [];
    })


    // this.inProcessedOutputsList = []; this.inPayrollInputsList = [];
    // this.inProcessedOutputsList.length == 0 &&  (this.inProcessedOutputsList = []);
    // this.inPayrollInputsList.length == 0 && (this.inPayrollInputsList = []);
    this.preTMSelectedIds = [];
    this.timecardStatus.forEach(element => {
      element.id != 401 && this.preTMSelectedIds.push(element.name);
    });


    this.inPayrollInputsGridOptions = {
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
      enableAutoTooltip: true,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false
      },
      presets: {
        filters: [{ columnId: 'ProcessingStatus', searchTerms: this.preTMSelectedIds, operator: 'IN' }]
      },
      datasetIdPropertyName: "Id"
    };

    this.inProcessedOutputsGridOptions = {
      asyncEditorLoading: false,
      autoResize: {
        containerId: 'grid-container',
      },
      enableAsyncPostRender: true,
      enableAutoResize: true,
      editable: false,
      enableColumnPicker: true,
      enableCellNavigation: false,
      enableRowSelection: false,
      enableCheckboxSelector: true,
      enableFiltering: true,
      enableAutoTooltip: true,
      showHeaderRow: true,
      rowSelectionOptions: {
        // True (Single Selection), False (Multiple Selections)
        selectActiveRow: false
      },
      checkboxSelector: {
        // remove the unnecessary "Select All" checkbox in header when in single selection mode
        hideSelectAllCheckbox: false
      },
      presets: {
        filters: [{ columnId: 'ProcessingStatus', searchTerms: this.preTMSelectedIds, operator: 'IN' }]
      },
      datasetIdPropertyName: "Id"
    };

  }

  onChange_tabset(event) {
    if (event.nextId == 'payrollInputs' && (this.inPayrollInputsList.length == 0)) {
      this.code_payrollInput = environment.environment.PAYROLLINPUTS_LAYOUT_CODE;
      this.get_pagelayout_configurations(this.code_payrollInput);
    }
    else if (event.nextId == 'processedOutput' && (this.inProcessedOutputsList.length == 0)) {
      this.code_payrollInput = this.BusinessType == 3 ? environment.environment.PROCESSEDOUTPUTS_LAYOUT_CODE : 'processedOutputs';
      this.get_pagelayout_configurations(this.code_payrollInput);
    }
    this.activeTabName = event.nextId;
  }


  // get_pagelayout_configuration_1(code) {
  //   this.pageLayout_second = null;
  //   this.spinner = true;  
  //   this.pageLayoutService.getPageLayout(code).subscribe(data => {
  //     if (data.Status === true && data.dynamicObject != null) {
  //       this.pageLayout_second = (data.dynamicObject);
  //       this.searchElementList1 = (this.pageLayout_second.SearchConfiguration.SearchElementList);
  //       this.fetch_gridRecord_config();
  //       this.setGridConfiguration(this.pageLayout_second);
  //     }
  //   }, (error) => {
  //     console.log(error);
  //     this.spinner = false;
  //   }
  //   );
  // }


  // IN THIS WE GIVE THE NEW CODE TO GET THE NEW STRUCTURE
  get_pagelayout_configurations(code) {
    this.pageLayout = null;
    this.spinner = true;
    // this.titleService.setTitle('Loading');
    // this.headerService.setTitle('');
    this.pageLayoutService.getPageLayout(code).subscribe(data => {
      if (data.Status === true && data.dynamicObject != null) {
        this.pageLayout = (data.dynamicObject);
        this.searchElementList1 = (this.pageLayout.SearchConfiguration.SearchElementList);
        this.fetch_gridRecord_config();
        // this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle + ' - PORT');
        // this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
        this.setGridConfiguration(this.pageLayout);
        // this.dataset = null;

        // this.route.data.subscribe(data => {
        //   if (_.isEmpty(data)) {
        //     data = JSON.parse(localStorage.getItem("RowDataInterface"))
        //     console.log('row', data.dataInterface.SearchElementValuesList);

        //     if (data.dataInterface.SearchElementValuesList !== null && data.dataInterface.SearchElementValuesList.length > 0) {
        //       alert('yes')
        //       data.dataInterface.SearchElementValuesList.forEach(searchElementValues => {
        //         this.pageLayout.SearchConfiguration.SearchElementList.forEach(searchElement => {
        //           if (searchElementValues.OutputFieldName === searchElement.FieldName) {
        //             searchElement.Value = searchElementValues.Value;
        //             searchElement.ReadOnly = searchElementValues.ReadOnly;
        //           }
        //         })
        //       })
        //       this.rowDataService.dataInterface = {
        //         SearchElementValuesList: [],
        //         RowData: null
        //       }
        //       this.getDataset();
        //     }

        //     else if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
        //       this.getDataset();
        //     }
        //   }
        // }, error => {
        //   console.log(error)
        // })

      }

    }, (error) => {
      console.log(error);
      this.spinner = false;
    }
    );

  }

  setGridConfiguration(pageLayout_Config) {
    // this.setColumns();
    // this.setGridOptions();
    this.setColumn_Config(pageLayout_Config);
  }

  setColumns() {
    var RequiredTimeCardStatus = [];
    this.preTMSelectedIds = [];
    this.timecardStatus.forEach(element => {
      RequiredTimeCardStatus.push({
        value: element.name,
        label: element.name
      });
      element.id != 401 && this.preTMSelectedIds.push(element.name);
    });

    console.log('RequiredTimeCardStatus', RequiredTimeCardStatus);
    console.log('this.preTMSelectedIds', this.preTMSelectedIds);

    this.inPayrollInputsColumnDefinitions = [];
    this.inProcessedOutputsColumnDefinitions = [];
    this.columnDefinition = [];

    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      this.columnName = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].DisplayName;
      this.tempColumn = {
        id: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id,
        name: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].DisplayName,
        field: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName,
        sortable: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSortable,
        cssClass: "pointer",
        filterable: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsFilterable,
        excludeFromHeaderMenu: !this.pageLayout.GridConfiguration.ColumnDefinitionList[i].ShowInHeader,
        // params: {
        //    groupFormatterPrefix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '', 
        //    groupFormatterSuffix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '' ,
        // },  
        grouping: {
          getter: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FieldName,
          formatter: (g) => `${Object.keys(g.rows[0]).filter((key) => { return g.rows[0][key] === g.value })[0]}: ${g.value} <span style="color:green">(${g.count} items)</span>`,
          aggregators: [],
          aggregateCollapsed: false,
          collapsed: false
        }

      }

      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsFilterable && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FilterType == 'multipleSelect') {
        this.tempColumn.filterable = true;
        this.tempColumn.sortable = true;
        this.tempColumn.filter = {
          model: Filters.multipleSelect,
          collection: RequiredTimeCardStatus,
          filterOptions: {
            filter: true // adds a filter on top of the multi-select dropdown
          } as MultipleSelectOption
        }
      }



      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'edit') {
        this.tempColumn.formatter = Formatters.editIcon;
        this.tempColumn.excludeFromExport = true;
      }
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'delete') {
        this.tempColumn.formatter = Formatters.deleteIcon;
        this.tempColumn.excludeFromExport = true;
      }
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'preview') {
        this.tempColumn.formatter = this.previewFormatter,
          this.tempColumn.excludeFromExport = true;
      }
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id === 'errorLog') {
        this.tempColumn.formatter = this.errorLog,
          this.tempColumn.excludeFromExport = false;
      }
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id !== 'edit') {
        this.tempColumn.formatter = this.hyperlinkFormatter;
      }
      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id !== 'edit') {
        this.tempColumn.formatter = this.hyperlinkFormatter;
      }
      // if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id !== 'edit' ) {
      //   this.tempColumn.formatter = this.hyperlinkFormatter;      }

      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
        switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
          case 'sum': {
            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.sumTotals;
            break;
          }

          case 'min': {
            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.minTotals;
            break;
          }

          case 'max': {
            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.maxTotals;
            break;
          }

          case 'average': {
            this.tempColumn.groupTotalsFormatter = GroupTotalFormatters.avgTotals;
            break;
          }
        }
        this.tempColumn.params = {
          groupFormatterPrefix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '',
          groupFormatterSuffix: this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '',
        }
      }

      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SummaryRequiredInGrouping) {

        for (var j = 0; j < this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType.length; ++j) {
          switch (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Type) {
            case 'sum': {
              //var temp = new Aggregators.Sum(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              this.tempColumn.grouping.aggregators.push(new Aggregators.Sum(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'min': {
              //var temp = new Aggregators.Min(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              this.tempColumn.grouping.aggregators.push(new Aggregators.Avg(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'max': {
              //var temp = new Aggregators.Max(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              this.tempColumn.grouping.aggregators.push(new Aggregators.Max(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'average': {
              //var temp = new Aggregators.Avg(this.gridConfig.ColumnDefinition[i].GroupAggregatorColumnAndType[j].column);
              this.tempColumn.grouping.aggregators.push(new Aggregators.Avg(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

          }
        }
      }

      if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Width) {
        this.tempColumn.width = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Width;
        this.tempColumn.maxWidth = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Width
      }

      this.columnDefinition.push(this.tempColumn);
      this.inPayrollInputsColumnDefinitions = this.columnDefinition;
      this.inProcessedOutputsColumnDefinitions = this.columnDefinition;
      console.log('cikum defin :', this.columnDefinition);

    }

  }

  setColumn_Config(pageLayout_Config) {

    console.log('pageLayout_Config', pageLayout_Config);
    this.columnDefinition = [];

    let columnConfig: Column;
    let columnNameConfig: string;
    var RequiredTimeCardStatus = [];
    this.preTMSelectedIds = [];
    this.timecardStatus.forEach(element => {
      RequiredTimeCardStatus.push({
        value: element.name,
        label: element.name
      });
      element.id != 401 && this.preTMSelectedIds.push(element.name);
    });

    console.log('RequiredTimeCardStatus', RequiredTimeCardStatus);
    console.log('this.preTMSelectedIds', this.preTMSelectedIds);


    for (var i = 0; i < pageLayout_Config.GridConfiguration.ColumnDefinitionList.length; ++i) {
      columnNameConfig = pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].DisplayName;
      columnConfig = {
        id: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id,
        name: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].DisplayName,
        field: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FieldName,
        sortable: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsSortable,
        cssClass: "pointer",
        filterable: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsFilterable,
        excludeFromHeaderMenu: !pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].ShowInHeader,

        grouping: {
          getter: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FieldName,
          formatter: (g) => `${Object.keys(g.rows[0]).filter((key) => { return g.rows[0][key] === g.value })[0]}: ${g.value} <span style="color:green">(${g.count} items)</span>`,
          aggregators: [],
          aggregateCollapsed: false,
          collapsed: false
        }

      }

      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsFilterable && pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FilterType == 'multipleSelect') {
        columnConfig.filterable = true;
        columnConfig.sortable = true;
        columnConfig.filter = {
          model: Filters.multipleSelect,
          collection: RequiredTimeCardStatus,
          filterOptions: {
            filter: true // adds a filter on top of the multi-select dropdown
          } as MultipleSelectOption
        }
      }



      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsFilterable) {

        let instanceLoaderForFilterHandler = new InstanceLoader(window,);
        let dataset = null;
        if (dataset === undefined || dataset === null) {
          dataset = [];
        }

        if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsCustomFilter !== undefined && pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsCustomFilter !== null &&
          pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsCustomFilter) {

          if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].CustomFilterComponentName === "CommaSeparatedStringsFilterComponent") 
            {
              columnConfig.filterable = true,
              columnConfig.filter ={
                // collection : this.inPayrollInputsList,
                model: new CommaSeparatedStringFilterHandler(),
                  params: {
                  component: CommaSeparatedStringsFilterComponent,
                    angularUtilService: this.angularUtilService
                }
              }

            }

          // if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].CustomFilterComponentName === "CommaSeparatedStringsFilterComponent") {
          // this.tempColumn.filter = {
          //   // collection: dataset,
          //   model: new CommaSeparatedStringFilterHandler(),
          //   params: {
          //     component: CommaSeparatedStringsFilterComponent,
          //     angularUtilService: this.angularUtilService
          //   }
          // }

          // }
        }
        // else {
        //   this.tempColumn.filter = {
        //     collection: dataset,
        //     customStructure: {
        //       value: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FieldName,
        //       label: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FieldName
        //     },
        //     model: Filters[pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FilterType]
        //   }
        // }

      }


      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id === 'edit') {
        columnConfig.formatter = Formatters.editIcon;
        columnConfig.excludeFromExport = true;
      }
      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id === 'delete') {
        columnConfig.formatter = Formatters.deleteIcon;
        columnConfig.excludeFromExport = true;
      }
      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id === 'preview') {
        columnConfig.formatter = this.previewFormatter,
          columnConfig.excludeFromExport = true;
      }
      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id === 'errorLog') {
        columnConfig.formatter = this.errorLog,
          columnConfig.excludeFromExport = false;
      }
      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].RouteLink != null && pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id !== 'edit') {
        columnConfig.formatter = this.hyperlinkFormatter;
      }
      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Clickable != null && pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].FunctionName != null && pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Id !== 'edit') {
        columnConfig.formatter = this.hyperlinkFormatter;
      }

      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].IsSummarizable) {
        switch (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].AggregatorType) {
          case 'sum': {
            columnConfig.groupTotalsFormatter = GroupTotalFormatters.sumTotals;
            break;
          }

          case 'min': {
            columnConfig.groupTotalsFormatter = GroupTotalFormatters.minTotals;
            break;
          }

          case 'max': {
            columnConfig.groupTotalsFormatter = GroupTotalFormatters.maxTotals;
            break;
          }

          case 'average': {
            columnConfig.groupTotalsFormatter = GroupTotalFormatters.avgTotals;
            break;
          }
        }
        columnConfig.params = {
          groupFormatterPrefix: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterPrefix || '',
          groupFormatterSuffix: pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Params.GroupFormatterSuffix || '',
        }
      }

      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].SummaryRequiredInGrouping) {

        for (var j = 0; j < pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType.length; ++j) {
          switch (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Type) {
            case 'sum': {
              columnConfig.grouping.aggregators.push(new Aggregators.Sum(pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'min': {
              columnConfig.grouping.aggregators.push(new Aggregators.Avg(pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'max': {
              columnConfig.grouping.aggregators.push(new Aggregators.Max(pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

            case 'average': {
              columnConfig.grouping.aggregators.push(new Aggregators.Avg(pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].GroupAggregatorColumnAndType[j].Column));
              break;
            }

          }
        }
      }

      if (pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Width) {
        columnConfig.width = pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Width;
        columnConfig.maxWidth = pageLayout_Config.GridConfiguration.ColumnDefinitionList[i].Width
      }

      this.columnDefinition.push(columnConfig);
      this.code_payrollInput == 'payrollInputs' && (this.inPayrollInputsColumnDefinitions = [], this.inPayrollInputsColumnDefinitions = this.columnDefinition);
      this.code_payrollInput == 'processedOutputs' && (this.inProcessedOutputsColumnDefinitions = [], this.inProcessedOutputsColumnDefinitions = this.columnDefinition);

    }
  }

  setGridOptions() {
    this.gridOptions = {

      enableGridMenu: true,
      enableColumnPicker: false,
      enableAutoResize: true,
      enableSorting: true,
      datasetIdPropertyName: "Id",
      enableColumnReorder: this.pageLayout.GridConfiguration.EnableColumnReArrangement,
      enableFiltering: true,
      showHeaderRow: true,
      enablePagination: false,
      enableAddRow: false,
      leaveSpaceForNewRows: true,
      autoEdit: false,

      alwaysShowVerticalScroll: false,
      enableCellNavigation: true,

      createFooterRow: true,
      showFooterRow: this.pageLayout.GridConfiguration.IsSummaryRequired,
      footerRowHeight: 30,

      createPreHeaderPanel: true,
      showPreHeaderPanel: false,
      preHeaderPanelHeight: 40,
      draggableGrouping: {
        dropPlaceHolderText: 'Drop a column header here to group by the column',
        // groupIconCssClass: 'fa fa-outdent',
        deleteIconCssClass: 'fa fa-times',
        onGroupChanged: (e, args) => this.onGroupChange(),
        onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,

      },

      frozenRow: this.pageLayout.GridConfiguration.PinnedRowCount,
      frozenColumn: this.pageLayout.GridConfiguration.PinnedColumnCount,
      frozenBottom: this.pageLayout.GridConfiguration.PinRowFromBottom,

    };

    if (this.pageLayout.GridConfiguration.IsPaginationRequired === true) {
      this.gridOptions.enablePagination = true;
      this.gridOptions.pagination = this.pagination;
      this.gridOptions.showFooterRow = false;
      this.gridOptions.frozenRow = -1;
      this.gridOptions.frozenColumn = -1;
      this.gridOptions.frozenBottom = false;
    }

    if (this.pageLayout.GridConfiguration.PinnedRowCount >= 0) {
      this.gridOptions.showFooterRow = false;
    }

    // if(this.pageLayout.GridConfiguration.DisplayFilterByDefault === false){
    //   this.gridOptions.showHeaderRow = false;
    // }

    if (this.pageLayout.GridConfiguration.IsGroupingEnabled) {
      this.gridOptions.enableDraggableGrouping = true;
      this.gridOptions.showPreHeaderPanel = true;
      this.gridOptions.frozenRow = -1;
      this.gridOptions.frozenColumn = -1;
      this.gridOptions.frozenBottom = false;
    }


  }
  // unused function
  getTeamList_UsingDataset(searchList, datasource) {

    this.spinner = true;
    this.pageLayout.GridConfiguration.DataSource = null;
    this.activeTabName == 'payrollInputs' ? this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_PAYROLL_PAYROLLINPUTS' }
      : this.BusinessType == 3 ? this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_PAYROLL_PROCESSEDOUTPUT' } : this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_SME_PAYROLL_PROCESSEDOUTPUT' };

    let obj = JSON.stringify({
      SearchElementList: searchList,
      DataSource: datasource
    })
    this.pageLayoutService.getDataset(datasource, searchList).subscribe(dataset => {
      this.spinner = false;
      console.log('test', dataset);
      if (dataset.Status == true && dataset.dynamicObject) {
        this.TeamList = JSON.parse(dataset.dynamicObject)
        console.log(this.TeamList);

      }
      else {
        this.alertService.showWarning('There is no active employee in this Client. So try again later.');
        this.BusinessType == 3 ? this.router.navigateByUrl('app/payroll/payroll/salaryTransaction') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }

  getDataset() {
    this.selectedItems = [];
    this.spinner = true;
    this.pageLayout.GridConfiguration.DataSource = null;
    this.activeTabName == 'payrollInputs' ? this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_Payroll_List' }
      : this.BusinessType == 3 ? this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_Payroll_List' } : this.pageLayout.GridConfiguration.DataSource = { Type: 0, Name: 'UI_Payroll_List' } //  { Type: 0, Name: 'UI_SME_PAYROLL_PROCESSEDOUTPUT' };

    console.log(' this.pageLayout.SearchConfiguration.SearchElementList :::::::::', this.pageLayout.SearchConfiguration.SearchElementList);


    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      
      console.log('roces', dataset);
      if (dataset.Status == true && dataset.dynamicObject) {

        if (this.activeTabName == 'payrollInputs') {
          this.inPayrollInputsList = [];
          this.inPayrollInputsList = JSON.parse(dataset.dynamicObject);
          this.inPayrollInputsList.forEach(element => {
            element["EmployeeStatus"] = element.Status == 0 ? "In-Active" : "Active";
          });

        }
        else if (this.activeTabName == 'processedOutput') {
          this.inProcessedOutputsList = [];
          this.inProcessedOutputsList = JSON.parse(dataset.dynamicObject);
          this.inProcessedOutputsList.forEach(element => {
            element["EmployeeStatus"] = element.Status == 0 ? "In-Active" : "Active";
          });
        }
        var arrayObject: any[] = [];
        arrayObject = this.activeTabName == 'payrollInputs' ? this.inPayrollInputsList : this.activeTabName == 'processedOutput' ? this.inProcessedOutputsList : []
        this.utilityService.ensureIdUniqueness(arrayObject).then((result) => {
          this.activeTabName == 'payrollInputs' ? (this.isPayrollInputsDuplicateEntry = result == true ? true : false) :
            this.activeTabName == 'processedOutput' ? (this.isProcessedOutputDuplicateEntry = result == true ? true : false) : null
        }, err => {

        })
      }
      else {
        this.alertService.showWarning('There is no active employee in this Client. So try again later.');
        this.BusinessType == 3 ? this.router.navigateByUrl('app/payroll/payroll/salaryTransaction') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
      }
      
      this.spinner = false;
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }

  onClickingSearchButton(event: any) {
    console.log(event);
    this.getDataset();
  }

  onGroupChange() {
    console.log("changed");
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
  onCellClicked_payrollinput(e, args) {
    var column = this.inPayrollInputsGridInstance.gridService.getColumnFromEventArguments(args);
    if (column.columnDef.id === 'edit') {
      this.edit_timeCardDetails(column.dataContext);
      return;
    }
  }

  onCellClicked(e, args) {
    // const metadata = this.angularGrid.gridService.getColumnFromEventArguments(args);
    // if (metadata.columnDef.id === 'edit') {
    //   this.CitiesObject = metadata.dataContext;
    //   this.addCity();
    // }
    // else if (metadata.columnDef.id === 'delete') {
    //    this.sweetalertConfirm(metadata.dataContext);
    // }

    var column = this.inProcessedOutputsGridInstance.gridService.getColumnFromEventArguments(args);
    console.log(column);

    var flag = false;
    for (var i = 0; i < this.pageLayout.GridConfiguration.ColumnDefinitionList.length; ++i) {
      if (column.columnDef.id == this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Id) {
        flag = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].Clickable;
        if (flag) {
          if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName != null && this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName != "") {
            this.executeFunction(this.pageLayout.GridConfiguration.ColumnDefinitionList[i].FunctionName, column.dataContext)
          }
          else if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink != null) {
            this.rowDataService.dataInterface.RowData = column.dataContext;
            if (this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SendValuesToSearchElements) {
              this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList.forEach(searchElementValue => {
                searchElementValue.Value = column.dataContext[searchElementValue.InputFieldName];
              }
              )
              this.rowDataService.dataInterface.SearchElementValuesList = this.pageLayout.GridConfiguration.ColumnDefinitionList[i].SearchElementValuesList;
            }
            this.router.navigate([this.pageLayout.GridConfiguration.ColumnDefinitionList[i].RouteLink])
          }
        }
        break;
      }
    }


  }

  updateFooter(gridObj) {
    console.log("im in update footer")
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

  executeFunction(name: string, data: any) {
    console.log('name', name);
    console.log('data', data);

    switch (name) {
      case 'delete': {
        this.delete(data);
      }
      case 'onNetPay_Slider': {
        this.onNetPay_Slider(data);
      }


    }
  }

  delete(data: any) {
    alert("Delete Button Clicked with id" + data.Id)
  }
  async onNetPay_Slider(rowRecord) {
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
          this.open();
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showInfo("No Pay items record found!");
          return;
        }
      })

  }

  open(): void {
    this.visible = true;
  }

  close(): void {
    this.visible = false;
  }

  importData_popup() {

    console.log('BEHAVIOUR OBJECT REC :', this.BehaviourObject_Data);

    const modalRef = this.modalService.open(PayrollImportdataComponent, this.modalOption);
    modalRef.componentInstance.ClientName = this.ClientName;
    var objStorageJson = JSON.stringify(this.BehaviourObject_Data)
    modalRef.componentInstance.objStorageJson = objStorageJson;

    modalRef.result.then((result) => {
      this.getDataset();
    }).catch((error) => {
      console.log(error);
    });
  }

  onSelectedRowsChanged(data, args) {

    this.selectedItems = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inPayrollInputsDataView.getItem(row);
        this.selectedItems.push(row_data);
      }
    }
    console.log('answer', this.selectedItems);
  }

  onSelectedRowsChanged1(data, args) {

    this.selectedItems1 = [];
    if (args != null && args.rows != null && args.rows.length > 0) {
      for (let i = 0; i < args.rows.length; i++) {
        var row = args.rows[i];
        var row_data = this.inProcessedOutputsDataView.getItem(row);
        this.selectedItems1.push(row_data);
      }
    }
    console.log('answer', this.selectedItems1);
  }


  /* #region PAYROLL INPUTS LISTING SCREEN  */

  // BUTTON ACTION  - GENERATE PIS API CALLS
  do_generate_PIS() {
    this.LstGeneratePIS = [];
    if (this.selectedItems.length > 0) {
      var isopen = [];
      isopen = this.selectedItems.filter(a => a.StatusCode > TimeCardStatus.MarkupCalculationFailed || a.StatusCode == TimeCardStatus.SentForQc);
      if (isopen.length > 0) {
        this.alertService.showWarning("Error : One or more Employee items cannot be generated because the status is in an invalid state. ");
        return;
      }
      this.loadingScreenService.startLoading();
      const jobj = new GeneratePIS();
      jobj.ClientId = this.header_items.clientId;
      jobj.ClientContractId = this.header_items.clientcontractId;
      jobj.EmployeeIds = [];
      jobj.TeamIds = [];
      const i = this.header_items.teamId;
      this.selectedItems.forEach(function (item) { jobj.EmployeeIds.push(item.EmployeeId) })
      // jobj.TeamIds.push(i);
      this.selectedItems.forEach(function (item) { jobj.TeamIds.push(item.teamId) })
      jobj.TeamIds = _.union(jobj.TeamIds)

      jobj.PayPeriodId = this.header_items.payperiodId;
      jobj.PISId = 0;
      jobj.IsDownloadExcelRequired = true;
      jobj.ObjectStorageId = 0;
      jobj.RequestedBy = this.UserId;
      jobj.RequestedOn = 0;
      jobj.GeneratedRecords = 0;
      jobj.IsPushrequired = true;
      this.LstGeneratePIS.push(jobj);
      this.payrollService.post_generatePIS(JSON.stringify(this.LstGeneratePIS))
        .subscribe((result) => {
          console.log('GENERATE PIS RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            const jsonobj = JSON.stringify(apiResult.Result)
            const docsBytes = JSON.parse(jsonobj);
            docsBytes[0].docbytes != null && docsBytes[0].docbytes != undefined && this.base64ToBlob(docsBytes[0].docbytes as String)
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess("PIS successfully generated!");
            this.getDataset();
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {

        });
    } else {
      this.alertService.showWarning("Please select at lease one record!");
      return;
    }
  }
  public base64ToBlob(b64Data, sliceSize = 512) {

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
    var payperiodName = this.PayPeriodName.substring(0, 3)
    var filname = `PIS_${this.ClientName}${'_'}${this.TeamName}${'_'}${payperiodName}`
    var dynoFileNames = filname.replace(/\./g, ' ');
    dynoFileNames = dynoFileNames.replace(/\s/g, "");
    FileSaver.saveAs(file, dynoFileNames);
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  // BUTTON ACTION - PROCESS TIME CARD API CALLS
  do_process_TimeCard(): void {
    this.LstProceeTimeCards = [];
    this.processedEMP = [];
    if (this.selectedItems.length > 0) {

      // let isAvaliable = [];
      // isAvaliable = this.selectedItems.filter(r => environment.environment.IsAllowableStatusForReProcess.indexOf(Number(r.StatusCode)) >= 0);
      // if (isAvaliable.length != this.selectedItems.length) {
      //   this.alertService.showWarning('Error : One or more Employee items cannot be processed because the status is in an invalid state. Please contact your support admin.');
      //   return;
      // }

      this.loadingScreenService.startLoading();
      this.selectedItems.forEach(e => {
        const processObj = new PayrollQueueMessage();
        processObj.EmployeeName = e.EmployeeName,
          processObj.TimeCardId = e.Id,
          processObj.IsPushedToQueue = true,
          processObj.MessageObject = null,
          processObj.OldMessageObject = null,
          processObj.Remarks = "",
          processObj.RuleSetCode = null;
        processObj.SessionDetails = null;
        this.LstProceeTimeCards.push(processObj);
      });
      this.payrollService.post_processTimeCard(JSON.stringify(this.LstProceeTimeCards))
        .subscribe((result) => {
          console.log('PROCESS TIME CARD RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            this.processedEMP = apiResult.Result as any;
            this.loadingScreenService.stopLoading();
            // this.alertService.showSuccess(apiResult.Message);
            this.getDataset();
            $('#popup_chooseCategory').modal('show');

          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        }, error => {

        });
    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
  }
  modal_dismiss2() {
    $('#popup_chooseCategory').modal('hide');

  }
  /* #endregion *

  I want to thank you for giving me the opportunity 
  /

  /* #region  submit for pvr verification */
  submitForVerification() {
    this.LstSubmitForVerifcation = [];
    var currentDate = new Date();
    if (this.selectedItems1.length > 0) {
      var isProcessedExist = [];
      isProcessedExist = this.selectedItems1.filter(a => a.StatusCode != TimeCardStatus.PayrollCalculated);

      console.log('test', isProcessedExist);

      if (isProcessedExist.length > 0) {
        this.alertService.showInfo("Information : The action was blocked. One or more Employee items cannot be submitted because the status is in an invalid state. Please try again later.");
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
          this.selectedItems1.forEach(event => {
            PVRId = event.PVRId;
            var submitListObject = new PayrollVerificationRequestDetails();
            submitListObject.Id = event.PVRDId == -1 ? 0 : event.Id;
            submitListObject.PVRId = this.header_items.PVRId == -1 ? 0 : this.header_items.PVRId;
            submitListObject.TimeCardId = event.TimeCardId;
            submitListObject.EmployeeId = event.EmployeeId;
            submitListObject.EmployeeName = event.EmployeeName;
            submitListObject.IsActive = true;
            submitListObject.LastUpdatedBy = this.UserId;
            submitListObject.LastUpdatedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');  // moment(currentDate).format('YYYY-MM-DD');
            submitListObject.RequestRemarks = jsonStr;
            submitListObject.ApproverRemarks = "";
            submitListObject.Status = TimeCardStatus.SentForQc;
            submitListObject.ModeType = UIMode.Edit;
            this.LstSubmitForVerifcation.push(submitListObject);
          });
          var submitObject = new PayrollVerificationRequest();
          submitObject.Id = PVRId == -1 ? 0 : PVRId;
          submitObject.CompanyId = this.sessionDetails.Company.Id;
          submitObject.ClientContractId = this.header_items.clientcontractId;
          submitObject.ClientId = this.header_items.clientId;
          submitObject.PayPeriodId = this.header_items.payperiodId;
          submitObject.PayPeriodName = this.PayPeriodName;
          submitObject.AttdanceStartDate = this.header_items.AttendanceStartDate;
          submitObject.AttdanceEndDate = this.header_items.AttendanceEndDate;
          submitObject.ClientContactId = 0;
          submitObject.TeamIds = [];
          submitObject.ClientContactDetails = "";
          // submitObject.TeamIds.push(this.header_items.teamId)
          this.selectedItems1.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
          submitObject.TeamIds = _.union(submitObject.TeamIds)

          submitObject.RequestedBy = this.UserId;
          submitObject.RequestedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss'); // moment(currentDate).fo  rmat('YYYY-MM-DD');
          submitObject.ApproverId = null;
          submitObject.ApproverLogOn = '1900-01-01 00:00:00' // moment(currentDate).format('YYYY-MM-DD'); 
          submitObject.RequestRemarks = jsonStr;
          submitObject.ApproverRemarks = null; // "";
          submitObject.ObjectStorageId = 0;
          submitObject.Status = PVRStatus.Initiated;
          submitObject.LstPVRDetails = this.LstSubmitForVerifcation;
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
                this.router.navigateByUrl('app/payroll/payroll/salaryTransaction')
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
    else {
      this.alertService.showWarning("At least one checkbox must be selected.");
      return;
    }
  }
  /* #endregion */

  do_close() {
    this.BusinessType == 3 ? this.router.navigateByUrl('app/payroll/payroll/salaryTransaction') : this.router.navigateByUrl('app/payroll/payroll/salaryTransactions');
  }

  close_historylog() {
    $('#popup_history').modal('hide');
  }

  viewHistoryLog() {
    this.lstImportHistory = [];
    this.loadingScreenService.startLoading();
    this.payrollService.get_allImportedPISLog(this.header_items.clientId, this.header_items.clientcontractId, this.header_items.teamId, this.header_items.payperiodId).
      subscribe((result) => {
        console.log('IMPORTED PIS LOG RESPONSE :: ', result);
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          this.lstImportHistory = apiResult.Result as any;
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
          $('#popup_history').modal('show');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, (error) => {

      })

  }
  downloadPaysheet() {



    if (this.selectedItems1.length > 0) {
      let lsttimecard = [];
      this.loadingScreenService.startLoading();
      // const jobj = new GeneratePIS();
      // jobj.ClientId = this.BehaviourObject_Data.clientId;
      // jobj.ClientContractId = this.BehaviourObject_Data.clientcontractId;
      // jobj.EmployeeIds = [];
      // jobj.TeamIds = [];
      // this.selectedItems1.forEach(function (item) { jobj.TeamIds.push(item.teamId) })
      // this.selectedItems1.forEach(function (item) { jobj.EmployeeIds.push(item.EmployeeId) })
      // jobj.TeamIds = _.union(jobj.TeamIds)
      // jobj.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      // jobj.PISId = 0;
      // jobj.IsDownloadExcelRequired = true;
      // jobj.ObjectStorageId = 0;
      // jobj.RequestedBy = this.UserId;
      // jobj.RequestedOn = 0;
      // jobj.GeneratedRecords = 0;
      // jobj.IsPushrequired = true;
      // jobj.ProcessCategory = 1;
      this.selectedItems1.forEach(item => {
        let timecard = new TimeCard();
        timecard.Id = item.TimeCardId;
        timecard.ProcessCategory = 1;
        timecard.PayPeriodId = this.BehaviourObject_Data.payperiodId;
        lsttimecard.push(timecard)
      });
      this.payrollService.put_downloadPaySheet_Timecard(lsttimecard)
        .subscribe((result) => {
          console.log('PAY SHEET DOWNLOAD RESPONSE :: ', result);
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result) {
            var payperiodName = this.PayPeriodName.substring(0, 3)
            var dynoFileName = `PAYSHEET_${this.BehaviourObject_Data.ClientName}_${this.TeamName}_${payperiodName}`;
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

  confirmMarkFnF() {

    if (this.markFnf_ResignationDate == null || this.markFnf_ResignationDate == '' || this.markFnf_ResignationDate == undefined) {
      this.alertService.showWarning("Please enter resignation date")
      return;
    }
    else if (this.markFnf_LastWorkingDate == null || this.markFnf_LastWorkingDate == '' || this.markFnf_LastWorkingDate == undefined) {
      this.alertService.showWarning("Please enter last working date")
      return;
    }
    else if (moment(new Date(this.markFnf_ResignationDate)).isAfter(new Date(this.markFnf_LastWorkingDate))) {
      this.alertService.showWarning("Resignation date should be less than last working date.")
      return;
    }
    else if (moment(new Date(this.empDOJ)).isAfter(new Date(this.markFnf_LastWorkingDate))) {
      this.alertService.showWarning("Date of Joining should not be less than last working date.")
      return;
    }
    else if (this.markfnf_Reason == null || this.markfnf_Reason == '' || this.markfnf_Reason == undefined) {
      this.alertService.showWarning("Reason is required!. You need to write something!")
      return;
    } else {
      var LstmarkFandF_temp = [];
      LstmarkFandF_temp = this.code_payrollInput === "ProcessedOutputs" ? this.selectedItems1 : this.selectedItems;
      this.loadingScreenService.startLoading();

      var lstEmpContract = []
      LstmarkFandF_temp.forEach(event => {
        lstEmpContract.push({
          EmploymentContractId: event.EmploymentContractId,
          Resignationdate: moment(new Date(this.markFnf_ResignationDate)).format('YYYY-MM-DD'),
          LWD: moment(new Date(this.markFnf_LastWorkingDate)).format('YYYY-MM-DD'),
          Reason: this.markfnf_Reason
        })

      });
      this.processedEMPMarkFnF = [];
      this.employeeService.put_MarkEmploymentContractsForSeperation(JSON.stringify(lstEmpContract))
        .subscribe((result) => {
          let apiResult: apiResult = result;
          $('#popup_contractSeparation').modal('hide');
          if (apiResult.Result) {
            this.processedEMPMarkFnF = apiResult.Result as any;
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();
            $('#popup_markFnf').modal('show');

            this.code_payrollInput === "ProcessedOutputs" ? this.selectedItems1 = [] : this.selectedItems = [];
            this.getDataset();
          } else {
            this.alertService.showWarning(apiResult.Message);
            this.loadingScreenService.stopLoading();
          }
        }, err => {

        })
    }
  }

  modal_dismiss_contractSeparation() {
    $('#popup_contractSeparation').modal('hide');
  }

  do_MarkFandF(index) {
    var LstmarkFandF_temp = [];
    LstmarkFandF_temp = index === "ProcessedOutputs" ? this.selectedItems1 : this.selectedItems;
    if (LstmarkFandF_temp.length == 0) {
      this.alertService.showWarning("Oh ho! As per the Mark F&F requirement, You must make a selection(s) from the list.")
      return;
    }

    if (LstmarkFandF_temp.length > 1) {
      this.alertService.showWarning("Please select only one employee at a time of process.");
      return;
    }
    this.markfnf_minDate = new Date();
    this.markfnf_maxDate = new Date();

    this.markFnf_LastWorkingDate = null;
    this.markFnf_ResignationDate = null;
    this.markfnf_Reason = null;

    var currentDate = moment(new Date(LstmarkFandF_temp[0].AttendanceStartDate));
    var currentDate1 = moment(new Date(LstmarkFandF_temp[0].AttendanceEndDate));
    this.empDOJ = LstmarkFandF_temp[0].DOJ
    var futureMonth2 = moment(currentDate).subtract(environment.environment.MarkFnFLWDminDate, 'M');
    var futureMonth3 = moment(currentDate1).add(environment.environment.MarkFnfLWDmaxDate, 'days')
    const startOfMonth1 = moment(futureMonth2).startOf('month').format('YYYY-MM-DD');
    const startOfMonth2 = moment(futureMonth3).startOf('day').format('YYYY-MM-DD');

    this.markfnf_minDate = new Date(startOfMonth1);
    this.markfnf_maxDate = new Date(startOfMonth2);

    console.log('startOfMonth1', startOfMonth1);
    console.log('startOfMonth2', startOfMonth2);

    if (LstmarkFandF_temp.filter(a => Number(a.StatusCode) == TimeCardStatus.SentForQc).length > 0) {
      this.alertService.showWarning('Information : The action was blocked. Because the status is in an invalid state (SentForQC).');
      return;
    }


    $('#popup_contractSeparation').modal('show');

    return;

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: 'Reason for Mark F&F',
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

        var lstEmpContract = []
        LstmarkFandF_temp.forEach(event => {
          lstEmpContract.push({
            EmploymentContractId: event.EmploymentContractId,
            Reason: jsonStr
          })

        });
        this.processedEMPMarkFnF = [];
        this.employeeService.put_MarkEmploymentContractsForSeperation(JSON.stringify(lstEmpContract))
          .subscribe((result) => {
            let apiResult: apiResult = result;
            if (apiResult.Result) {
              this.processedEMPMarkFnF = apiResult.Result as any;
              this.alertService.showSuccess(apiResult.Message);
              this.loadingScreenService.stopLoading();
              $('#popup_markFnf').modal('show');

              index === "ProcessedOutputs" ? this.selectedItems1 = [] : this.selectedItems = [];
              this.getDataset();
            } else {
              this.alertService.showWarning(apiResult.Message);
              this.loadingScreenService.stopLoading();
            }
          }, err => {

          })

      } else if (
        /* Read more about handling dismissals below */
        inputValue.dismiss === Swal.DismissReason.cancel

      ) {
      }
    });
    // [{ "EmploymentContractId": 2, "Reason": "abc" }]

  }

  modal_dismiss_popup_markFnf() {
    $('#popup_markFnf').modal('hide');
  }
  async linkForPayrun(item) {

    $('#popup_markFnf').modal('hide');
    this.rowDataService.dataInterface.RowData = item;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": item.PayRunId,
      "ReadOnly": false
    }];

    await this.BusinessType == 1 ? this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun') : this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')
  }
  refreshProcessingStatus() {
    this.getDataset();
  }

  // PAYROLL INPUT SLIDER ACTION

  loadData_slider(event) {
    if (event.nextId == 'Allowance') {
    }
    else if (event.nextId == 'attendanceDetails') {

    }
    else {
      // this.viewDate_revoke = null
    }
    this._slider_activeTabName = event.nextId;
  }



  async edit_timeCardDetails(item) {
    // if (Number(item.StatusCode) > TimeCardStatus.MarkupCalculationFailed || item.StatusCode == TimeCardStatus.SentForQc || ) {
    //   this.alertService.showWarning('You cannot able to edit this record!. Please contact support admin.');
    //   return;
    // }

    if (environment.environment.IsAllowableStatusForEditTimeCard.includes(Number(item.StatusCode)) == false) {
      this.alertService.showWarning('Information : The action was blocked. One or more Employee items cannot be edited because the status is in an invalid state.');
      return;
    }
    this.alreadyRevokedDays = 0;
    this.events = [];
    this.LstnonMustorRoleAttendance = [];
    this.remove_LOPAttendanceList = [];
    this.isfullmonthremoveAtte = [];
    this.isfullmonthremoveAtte.length = 0;
    this.remove_RevokeLOPAttendanceList = [];
    this.revokeLOP_payperiodDetails = [];
    this.revokeLOP_calendar_payperiodDetails = [];
    this.isEdited = false;
    this.isEdited_Revoked = false;
    this.revokLopdays_attendanceList = [];
    // reset revoke lop tab pre records
    this._RevokePayPeriod = null;
    this._LOPDays = 0;
    this._RevokeLOPDays = 0;
    // this.events_revoke = [];
    this.loadingScreenService.startLoading();
    this.LstTimeCardAllowanceProducts = [];
    this.LstTimeCardAdjustmentProducts = [];
    // this.timeCardModel = _TimeCardModel;
    this._slider_activeTabName = "Allowance";
    await this.lookupDetailsTimeCardUI(item).then((response: any) => {
      const response_lookup = response;
      let LstTimeCardProducts = (JSON.parse(response_lookup));
      this.Lst_PrevPayPeriod = LstTimeCardProducts.PreviousPeriods;
      this.TeamDetails = LstTimeCardProducts.Team[0];

      this.TeamDetails.IsMustorRollApplicable = this.TeamDetails.IsMustorRollApplicable; // true; // static testig purpose 
      this.IsAttendanceStampingBasedonLastDate = this.TeamDetails.IsAttendanceStampingBasedonLastDate;
      console.log('LstTimeCardProducts', LstTimeCardProducts);
      console.log('TeamDetails', this.TeamDetails);

      LstTimeCardProducts.AllowanceProducts != null && LstTimeCardProducts.AllowanceProducts.forEach(element => {
        element["Id"] = 0;
        element['ExistingAmount'] = 0;
        element['NewAmount'] = 0;

      });
      LstTimeCardProducts.AdjustmentProducts != null && LstTimeCardProducts.AdjustmentProducts.forEach(element => {
        element["Id"] = 0;
        element['ExistingAmount'] = 0;
        element['NewAmount'] = 0;

      });
      this.LstTimeCardAllowanceProducts = LstTimeCardProducts.AllowanceProducts;
      this.LstTimeCardAdjustmentProducts = LstTimeCardProducts.AdjustmentProducts;
      this.payrollService.getTimeCardDetailsById(item.Id)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.TimeCardDetails = apiResult.Result as any;
            var TimecardDetails_RevokeLOP = apiResult.Result as any;
            this.TimecardDetails_RevokeLOP = TimecardDetails_RevokeLOP.AttendanceList;
            this.TimeCardOldDetials = { ...apiResult.Result as any };
            /**tax details tab data binding */
            this.taxDetailsForm.controls['IsPanExist'].setValue(this.TimeCardDetails.IsTaxIdentificationNumberExists);
            this.taxDetailsForm.controls['IsTaxExempted'].setValue(this.TimeCardDetails.IsTaxExempted);
            this.taxDetailsForm.controls['proofMode'].setValue(this.TimeCardDetails.IsTaxBasedOnProof);
            this.taxDetailsForm.controls['IsNewTaxRegime'].setValue(this.TimeCardDetails.TaxRegimeId == 0 ? false : true);
            //this.taxDetailsForm.controls['remarks'].setValue(this.TimeCardDetails.AdditionalData);

            this.TimeCardDetails.IsFullMonthLOP == true ? this.isattendanceFullMonthLOP = 1 : this.isattendanceFullMonthLOP = 2;
            this.TimeCardDetails.IsFullMonthLOP == false && this.TimeCardDetails.IsLOPBasedOnPayrollMonth == true ? this.isattendanceFullMonthLOP = 2 : this.isattendanceFullMonthLOP = 1;
            this.TimeCardDetails.IsFullMonthLOP == false && this.TimeCardDetails.IsLOPBasedOnPayrollMonth == false ? this.isattendanceFullMonthLOP = 3 : null;
            (this.isattendanceFullMonthLOP == 1 || this.isattendanceFullMonthLOP == 2) ? this.isPeriodBased = true : this.isPeriodBased = false;
            // this._LOPDays =  this.TimeCardDetails.LopDays;
            // this._RevokeLOPDays = this.TimeCardDetails.LopDaysRevoked;
            this.TimeCardDetails.IsFullMonthLOP == false && this.TimeCardDetails.IsLOPBasedOnPayrollMonth == false ? this.isPeriodBased = false : null;

            this.TimeCardDetails.AttendanceList.forEach(element => {
              if (element.Type == AttendanceType.LOP) {
                var attendance = new Attendance();
                attendance.TimeCardId = this.TimeCardDetails.Id;
                attendance.Type = element.Type;
                attendance.Id = element.Id as number;
                attendance.FromDate = moment(element.FromDate).format('YYYY-MM-DD');
                attendance.ToDate = moment(element.ToDate).format('YYYY-MM-DD');
                attendance.IsFirstDayHalf = element.IsFirstDayHalf;
                attendance.NumberOfDays = element.NumberOfDays;
                attendance.ReferencedTimeCardId = element.ReferencedTimeCardId;
                attendance.Modetype = UIMode.Edit;

                // this.TeamDetails.IsMustorRollApplicable == false && this.LstnonMustorRoleAttendance.push(attendance);                 
                this.TimeCardDetails.IsFullMonthLOP == false && this.remove_LOPAttendanceList.push(attendance)
                this.TimeCardDetails.IsFullMonthLOP == true && this.isfullmonthremoveAtte.push(attendance);
              }
              else if (element.Type == AttendanceType.RevokeLOP) {
                var attendance = new Attendance();
                attendance.TimeCardId = this.TimeCardDetails.Id;
                attendance.Type = element.Type;
                attendance.Id = element.Id as number;
                attendance.FromDate = moment(element.FromDate).format('YYYY-MM-DD');
                attendance.ToDate = moment(element.ToDate).format('YYYY-MM-DD');
                attendance.IsFirstDayHalf = false;
                attendance.NumberOfDays = 1;
                attendance.ReferencedTimeCardId = element.ReferencedTimeCardId;
                attendance.Modetype = UIMode.None;
                this.remove_RevokeLOPAttendanceList.push(attendance);

              }
            });
            // BY DEFAULT SET REMOVING ATTENDANCE 
            this.isfullmonthremoveAtte.length > 0 && this.isfullmonthremoveAtte.forEach(function (item) {
              item.Modetype = UIMode.Delete
            });
            // this.remove_LOPAttendanceList.length > 0 && this.remove_LOPAttendanceList.forEach(function (item) {
            //   item.Modetype = UIMode.Delete
            // });
            this.remove_RevokeLOPAttendanceList.length > 0 && this.remove_RevokeLOPAttendanceList.forEach(function (item) {

              item.Modetype = UIMode.Edit
              // this.TeamDetails != null &&  this.TeamDetails.IsMustorRollApplicable == true ? item.Modetype = UIMode.Delete : item.Modetype = UIMode.Edit
            });
            // Stamping Period Cycle
            var getStartEndDate = [];
            var stampingDates = [];
            this.TimeCardDetails.AttendanceList.length > 0 && (getStartEndDate = this.TimeCardDetails.AttendanceList.filter(a => a.Type == AttendanceType.LOP));
            getStartEndDate.length > 0 && (stampingDates = _.orderBy(getStartEndDate, function (o) { return moment(o.FromDate); }, ['desc']));

            if (stampingDates.length > 0 && this.isattendanceFullMonthLOP == 1) {
              var DBattendanceDate = moment(stampingDates[0].FromDate).format('YYYY-MM-DD');
              if (DBattendanceDate == moment(this.TimeCardDetails.AttendanceEndDate).format('YYYY-MM-DD') && DBattendanceDate == moment(this.TimeCardDetails.PeriodEndDate).format('YYYY-MM-DD')) {
                this.isPeriodBased = true;
              } else if (DBattendanceDate == moment(this.TimeCardDetails.AttendanceEndDate).format('YYYY-MM-DD') && DBattendanceDate != moment(this.TimeCardDetails.PeriodEndDate).format('YYYY-MM-DD')) {
                this.isPeriodBased = true;
              } else if (DBattendanceDate != moment(this.TimeCardDetails.AttendanceEndDate).format('YYYY-MM-DD') && DBattendanceDate == moment(this.TimeCardDetails.PeriodEndDate).format('YYYY-MM-DD')) {
                this.isPeriodBased = false;
              } else {
                this.isPeriodBased = true;
              }

            }


            this.isattendanceFullMonthLOP == 1 && !this.TeamDetails.IsMustorRollApplicable && this.lopDay_builder(this.isPeriodBased == false ? this.doCheckNonMustorRollMinMaxDate() : this.doCheckNonMustorRollMinMaxDate1(), this.isPeriodBased == false ? this.TimeCardDetails.AttendanceEndDate : this.TimeCardDetails.PeriodEndDate, 0);
            // this.attendanceLOPDays = this.TimeCardDetails.LopDays; 
            this.attendanceLOPDays = this.TimeCardDetails.AttendanceList != null && this.TimeCardDetails.AttendanceList.length > 0 ? (this.TimeCardDetails.AttendanceList.filter(z => z.Type == 0).length) - (this.TimeCardDetails.AttendanceList.filter(x => x.IsFirstDayHalf && x.Type == 0).length * 0.5) : 0;
            this.TimeCardDetails.IsFullMonthLOP == false && this.TimeCardDetails.IsLOPBasedOnPayrollMonth == false ? this.isPeriodBased = false : this.isPeriodBased = true;

            if (this.isattendanceFullMonthLOP == 3 && this.isPeriodBased == false) {
              var a = moment(this.doCheckNonMustorRollMinMaxDate());
              var b = moment(this.TimeCardDetails.AttendanceEndDate);
              this.attendanceTotalDays = b.diff(a, 'days') + 1;
              // if ( this.attendanceLOPDays != this.attendanceTotalDays) {
              //   this.attendanceLOPDays = this.attendanceTotalDays;
              // }
            }
            else if (this.isattendanceFullMonthLOP == 1 || this.isattendanceFullMonthLOP == 2 && this.isPeriodBased == true) {
              var a = moment(this.doCheckNonMustorRollMinMaxDate1());
              var b = moment(this.TimeCardDetails.PeriodEndDate);
              this.attendanceTotalDays = b.diff(a, 'days') + 1;
              // if ( this.attendanceLOPDays != this.attendanceTotalDays) {
              //   this.attendanceLOPDays = this.attendanceTotalDays;
              // }

            }

            else {
              var a = moment(this.TimeCardDetails.PeriodStartDate);
              var b = moment(this.TimeCardDetails.PeriodEndDate);
              this.attendanceTotalDays = b.diff(a, 'days') + 1;
            }
            this.attendancePresentDays = Number(this.attendanceTotalDays) - Number(this.attendanceLOPDays);
            this.TimeCardDetails.AllowanceList.forEach(e => {
              var _reUpdateAmt = this.LstTimeCardAllowanceProducts.find(a => a.ProductId === e.ProductId);
              _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id, _reUpdateAmt.NewAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
            });
            this.TimeCardDetails.AdjustmentList.forEach(e => {
              var _reUpdateAmt = this.LstTimeCardAdjustmentProducts.find(a => a.ProductId === e.ProductId)
              _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id, _reUpdateAmt.NewAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
            });

            this.load_AttendanceLog();
            this.payrollSlider_visible = true;
            // this.isattendanceFullMonthLOP = 3;
            console.log('remove_RevokeLOPAttendanceList 2', this.remove_RevokeLOPAttendanceList);


          } else { this.loadingScreenService.stopLoading(); this.alertService.showWarning(apiResult.Message) }
        }, err => {

        })
    });


  }
  lookupDetailsTimeCardUI(item) {
    console.log('item', item);
    // item.DOJ = new Date('2021-04-25');
    this.timecardEditDOJ = item.DOJ;
    return new Promise((resolve, reject) => {
      this.payrollService.getTimeCardUILookUpDetails(item.teamId).subscribe((result) => {
        console.log('item of result', result);
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          resolve(apiResult.Result);
        } else {
          reject(apiResult.Message);
        }
      })
    })
  }
  saveTimeCardDetails() {

    if (this.attendanceTotalDays != 0 && this.attendanceLOPDays > this.attendanceTotalDays) {
      this.alertService.showWarning('LOP day(s) should be less than or equal to allowable  day(s)');
      return;
    }
    if (this._LOPDays != 0 && this._LOPDays > this.alreadyRevokedDays) {
      this.alertService.showWarning('Revoke LOP day(s) should be less than or equal to LOP day(s)');
      return;
    }
    this.loadingScreenService.startLoading();
    var AllowanceList = [];
    var AdjustmentList = [];
    var AttendanceList = [];
    console.log('this.LstTimeCardAllowanceProducts', this.LstTimeCardAllowanceProducts);
    console.log('remove_LOPAttendanceList vbggd', this.remove_LOPAttendanceList);
    this.LstTimeCardAllowanceProducts != null && this.LstTimeCardAllowanceProducts.length > 0 && this.LstTimeCardAllowanceProducts.forEach(element => {
      console.log('e;emen', element);
      if (element.NewAmount == 0 && element.ExistingAmount == 0) {
      } else {
        var allowance = new Allowance();
        allowance.TimeCardId = this.TimeCardDetails.Id;
        allowance.Type = 0;
        allowance.Id = element.Id != 0 ? element.Id : 0,
          allowance.ProductCode = element.Code;
        allowance.ProductId = element.ProductId;
        allowance.PayQuantity = 1;
        allowance.PayUnitType = 1;
        allowance.PayUnitValue = element.NewAmount;
        allowance.Status = true;
        allowance.Remarks = '';
        allowance.Modetype = UIMode.Edit;
        AllowanceList.push(allowance)
      }
    });

    this.LstTimeCardAdjustmentProducts != null && this.LstTimeCardAdjustmentProducts.length > 0 && this.LstTimeCardAdjustmentProducts.forEach(element => {
      if (element.NewAmount == 0 && element.ExistingAmount == 0) {
      } else {
        var adjustment = new Adjustment();
        adjustment.TimeCardId = this.TimeCardDetails.Id;
        adjustment.Type = 0;
        adjustment.Id = element.Id != 0 ? element.Id : 0;
        adjustment.PayQuantity = 1;
        adjustment.PayUnitType = 1;
        adjustment.PayUnitValue = element.NewAmount;
        adjustment.ProductId = element.ProductId;
        adjustment.BillQuantity = 1;
        adjustment.BillUnitType = 1;
        adjustment.BillUnitValue = element.NewAmount;
        adjustment.ImpingeOnRevision = false;
        adjustment.Remarks = '';
        adjustment.Status = true;
        adjustment.ProductTypeId = 0.;
        adjustment.Modetype = UIMode.Edit;
        AdjustmentList.push(adjustment);
      }
    });
    this.TeamDetails.IsMustorRollApplicable == true && this.events != null && this.events.length > 0 && this.events.forEach(element => {
      // console.log('lop element', element);

      if (element.color == colors.red) {
        var attendance = new Attendance();
        attendance.TimeCardId = this.TimeCardDetails.Id;
        attendance.Type = AttendanceType.LOP;
        attendance.Id = element.id as number;
        attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
        attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
        attendance.IsFirstDayHalf = element.meta.IsFirstDayHalf;
        attendance.NumberOfDays = element.meta.IsFirstDayHalf == true ? 0.5 : 1;
        attendance.ReferencedTimeCardId = 0;
        attendance.Modetype = UIMode.Edit;
        AttendanceList.push(attendance);
      } else if (element.id > 0) {
        var attendance = new Attendance();
        attendance.TimeCardId = this.TimeCardDetails.Id;
        attendance.Type = AttendanceType.LOP;
        attendance.Id = element.id as number;
        attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
        attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
        attendance.IsFirstDayHalf = false;
        attendance.NumberOfDays = 1;
        attendance.ReferencedTimeCardId = 0;
        attendance.Modetype = UIMode.Delete;
        AttendanceList.push(attendance);
      }

    });

    this.events_revoke = [];
    console.log('revokeLOP_calendar_payperiodDetails', this.revokeLOP_calendar_payperiodDetails);

    if (this.revokeLOP_calendar_payperiodDetails != null && this.revokeLOP_calendar_payperiodDetails.length > 0) {
      this.revokeLOP_calendar_payperiodDetails.forEach(ev => {
        ev.RevokeLOPDays_Attendance != null && ev.RevokeLOPDays_Attendance.length > 0 && ev.RevokeLOPDays_Attendance.forEach(el => {
          el.meta['TimeCardId'] = ev.TimeCardId;
          this.events_revoke.push(el)
        });
      });
    }

    console.log('event revoke :', this.events_revoke);


    this.isEdited_Revoked == true && this.TeamDetails.IsMustorRollApplicable == true && this.events_revoke != null && this.events_revoke.length > 0 && this.events_revoke.forEach(element => {
      console.log(element);
      if (element.color === colors.yellow) {
        var attendance = new Attendance();
        attendance.TimeCardId = this.TimeCardDetails.Id;
        attendance.Type = AttendanceType.RevokeLOP;
        attendance.Id = 0;
        attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
        attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
        attendance.IsFirstDayHalf = element.meta.IsFirstDayHalf;
        attendance.NumberOfDays = element.meta.IsFirstDayHalf == true ? 0.5 : 1;
        attendance.ReferencedTimeCardId = element.meta.TimeCardId;//this.revokeLOP_calendar_payperiodDetails.find(y=>y.RevokeLOPDays_Attendance.find(x=>x. moment(element.start).format('YYYY-MM-DD') == attendance.FromDate).TimeCardId) // this.glbReferencedTimeCardId;
        attendance.Modetype = UIMode.Edit;
        AttendanceList.push(attendance);
      }
    });

    console.log('his.TimeCardDetails.AttendanceList', this.TimeCardDetails.AttendanceList);

    console.log('this.LstnonMustorRoleAttendance 2', this.LstnonMustorRoleAttendance);

    this.LstnonMustorRoleAttendance.length > 0 && this.LstnonMustorRoleAttendance.forEach(function (item) {
      item.Modetype = UIMode.Edit
    });

    this.isfullmonthremoveAtte.length > 0 && this.isfullmonthremoveAtte.forEach(function (item) {
      item.Modetype = UIMode.Delete
    });

    this.remove_LOPAttendanceList.length > 0 && this.remove_LOPAttendanceList.forEach(function (item) {
      item.Modetype = UIMode.Delete
    });

    // this.TimeCardDetails.AttendanceList.splice(this.TimeCardDetails.AttendanceList.indexOf(element), 1);


    console.log('revokeLOP_payperiodDetails', this.revokeLOP_payperiodDetails);

    this.RevokeLOPAttendance = [];
    if (this.revokeLOP_payperiodDetails != null && this.revokeLOP_payperiodDetails.length > 0) {
      this.revokeLOP_payperiodDetails.forEach(ev => {
        ev.RevokeLOPDays_Attendance != null && ev.RevokeLOPDays_Attendance.length > 0 && ev.RevokeLOPDays_Attendance.forEach(el => {
          this.RevokeLOPAttendance.push(el)
        });
      });
    }

    AllowanceList.length > 0 && (this.TimeCardDetails.AllowanceList = AllowanceList);
    AdjustmentList.length > 0 && (this.TimeCardDetails.AdjustmentList = AdjustmentList);
    this.TeamDetails.IsMustorRollApplicable == true && AttendanceList.length > 0 && (this.TimeCardDetails.AttendanceList = AttendanceList);
    this.TeamDetails.IsMustorRollApplicable == false && this.LstnonMustorRoleAttendance.length > 0 && (this.TimeCardDetails.AttendanceList = this.LstnonMustorRoleAttendance);
    this.isEdited_Revoked == true && this.RevokeLOPAttendance != null && this.RevokeLOPAttendance.length > 0 && (this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.RevokeLOPAttendance));
    // this.TimeCardDetails.isfu
    console.log('AttendanceList', AttendanceList);

    console.log('.RevokeLOPAttendance 2', this.RevokeLOPAttendance);
    console.log('this.TimeCardDetails.AttendanceList 2', this.TimeCardDetails.AttendanceList);
    console.log('this.isfullmonthremoveAtte 2', this.isfullmonthremoveAtte);
    // alert(this.isattendanceFullMonthLOP)
    // alert(this.RevokeLOPAttendance.length);
    // alert(this.isEdited_Revoked)
    // alert(this.isEdited);
    // alert(this.isChangedPayPeriod);
    this.isattendanceFullMonthLOP == 1 && this.TeamDetails.IsMustorRollApplicable == false && this.isfullmonthremoveAtte.length > 0 ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.isfullmonthremoveAtte) : null;
    (this.isattendanceFullMonthLOP == 2 || this.isattendanceFullMonthLOP == 3) && this.isfullmonthremoveAtte.length > 0 ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.isfullmonthremoveAtte) : null;
    (this.isattendanceFullMonthLOP == 1 || this.isattendanceFullMonthLOP == 2 || this.isattendanceFullMonthLOP == 3) && this.isEdited == true && this.remove_LOPAttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.remove_LOPAttendanceList) : null;
    this.isattendanceFullMonthLOP == 1 && this.isChangedPayPeriod && this.isfullmonthremoveAtte.length > 0 ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.isfullmonthremoveAtte) : null;
    // for delete old record (on edit)
    this.TeamDetails.IsMustorRollApplicable == false && this.isEdited == true && this.remove_LOPAttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.remove_LOPAttendanceList) : null;
    // (this.LstnonMustorRoleAttendance.length > 0 || this.remove_LOPAttendanceList.length > 0) ? this.isEdited = true : null; // extra line
    // this.isEdited == true ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.remove_LOPAttendanceList) : null;
    // this.isEdited == false && this.isattendanceFullMonthLOP == true && this.remove_LOPAttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.remove_LOPAttendanceList) : null;
    this.isEdited_Revoked == true ? this.TimeCardDetails.AttendanceList = this.TimeCardDetails.AttendanceList.concat(this.remove_RevokeLOPAttendanceList) : null;
    console.log('remove_LOPAttendanceList', this.remove_LOPAttendanceList);
    console.log('remove_RevokeLOPAttendanceList', this.remove_RevokeLOPAttendanceList);
    console.log('this.TimeCardDetails.AttendanceList', this.TimeCardDetails.AttendanceList);

    // this.TimeCardDetails.AttendanceList.forEach(element => {
    //   console.log('bb', this.TimeCardDetails.AttendanceList.map(item2 => item2.Id > 0 && (Number(item2.Id) == element.Id && item2.Modetype === UIMode.Edit)))

    // });

    // var res1 = this.TimeCardDetails.AttendanceList.filter(item1 => item1.Id > 0 &&
    //   this.TimeCardDetails.AttendanceList.map(item2 => item2.Id > 0 && (Number(item2.Id) == item1.Id && item2.Modetype === UIMode.Edit)))
    // console.log('res', res1);
    // res1 != null && res1.length > 0 && res1.forEach(e => {
    //   // e.Id = 0
    //   var test = this.TimeCardDetails.AttendanceList.find(it => it.Id > 0 && it.Id == e.Id && it.Modetype == UIMode.Edit);
    //   test != undefined && test != null && (test.Id = 0);
    // });

    var result = this.TimeCardDetails.AttendanceList.reduce((unique, o) => {
      if (!unique.some(obj => obj.Id === o.Id && obj.Id > 0 && obj.Modetype != 0)) {
        unique.push(o);
      }
      return unique;
    }, []);
    console.log('n', result);

    this.TimeCardDetails.AttendanceList = result;
    // this.isfullmonthremoveAtte.forEach(element => {
    //   if (element.Id > 0) {
    //     console.log('eeee', element);

    //     var g = this.TimeCardDetails.AttendanceList.find(k => k.Id == element.Id)
    //     console.log('g', g);

    //     // (g.Modetype = UIMode.Edit, g.Id = 0)
    //   }

    // });
    console.log('final atten', this.TimeCardDetails.AttendanceList);

    // var res11 = this.TimeCardDetails.AttendanceList.filter(item1 => item1.Id > 0 &&
    //   this.TimeCardDetails.AttendanceList.map(item2 => item2.Id > 0 && (Number(item2.Id) == item1.Id)))
    // console.log('res', _.uniqBy(res11, 'Id'));
    // console.log(!_.uniqBy(this.TimeCardDetails.AttendanceList.filter(i=>i.Id > 0), 'Id'))

    // console.log(!_.map(this.TimeCardDetails.AttendanceList.filter(i=>i.Id > 0))



    // this.loadingScreenService.stopLoading();
    //  return;

    this.TimeCardDetails.LopDays = this.TimeCardDetails.AttendanceList.filter(x => x.Type == AttendanceType.LOP && x.Modetype != UIMode.Delete).length;
    this.TimeCardDetails.LopDaysRevoked = this.TimeCardDetails.AttendanceList.filter(x => x.Type == AttendanceType.RevokeLOP && x.Modetype != UIMode.Delete).length;
    this.TimeCardDetails.Modetype = UIMode.Edit;
    this.TimeCardDetails.Status = TimeCardStatus.Initiated;
    this.TimeCardDetails.IsFullMonthLOP = this.isattendanceFullMonthLOP == 1 ? true : false;
    this.TimeCardDetails.IsLOPBasedOnPayrollMonth = this.isattendanceFullMonthLOP == 2 ? true : false;
    // return;

    this.TimeCardDetails.IsTaxIdentificationNumberExists = this.taxDetailsForm.get('IsPanExist').value
    this.TimeCardDetails.IsTaxExempted = this.taxDetailsForm.get('IsTaxExempted').value
    this.TimeCardDetails.IsTaxBasedOnProof = this.taxDetailsForm.get('proofMode').value;
    this.TimeCardDetails.TaxRegimeId = this.taxDetailsForm.get('IsNewTaxRegime').value == true ? 1 : 0
    if (this.TimeCardDetails.AdditionalData == undefined || this.TimeCardDetails.AdditionalData == null || this.TimeCardDetails.AdditionalData == '') {
      this.TimeCardDetails.AdditionalData = this.taxDetailsForm.get('remarks').value;
    }
    else {
      let userAdditionalDetails = `${this.TimeCardDetails.AdditionalData}|${this.taxDetailsForm.get('remarks').value}`;
      this.TimeCardDetails.AdditionalData = userAdditionalDetails;
    }

    this.SaveTimeCard_hitting()

  }

  SaveTimeCard_hitting() {

    let timecardModel: TimeCardModel;
    timecardModel = _TimeCardModel;
    timecardModel.NewDetails = this.TimeCardDetails;
    timecardModel.OldDetails = "";
    timecardModel.OldDetails = this.TimeCardOldDetials;

    console.log(' this.TimeCardModel', timecardModel);
    // this.loadingScreenService.stopLoading();
    this.payrollService.put_SaveTimeCardDetails(timecardModel)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.close_payrollinputs_edit();
        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.close_payrollinputs_edit();


        }
      }, err => {

      })
  }

  close_payrollinputs_edit() {

    this.taxDetailsForm.reset();
    this.payrollSlider_visible = false;
  }

  dedicatedMonthyearMatch(doj, attnStartDate) {

    var isAfterDOJ = false;
    var isBeforeDOJ = false
    var check = moment(doj, 'YYYY/MM/DD');
    var check1 = moment(attnStartDate, 'YYYY/MM/DD');
    var lastmonthlastdate = moment(attnStartDate).subtract(1, 'months').startOf('month');
    var nextmonthlastdate = moment(attnStartDate).add(1, 'months').endOf('month');



    var month = check.format('M');
    var year = check.format('YYYY');
    var month1 = check1.format('M');
    var year1 = check1.format('YYYY');
    var month2 = lastmonthlastdate.format('M');
    var year2 = lastmonthlastdate.format('YYYY');
    var month3 = nextmonthlastdate.format('M');
    var year3 = nextmonthlastdate.format('YYYY');


    if (month == month1 && year == year1) {
      isAfterDOJ = moment(doj).isAfter(attnStartDate);
      isBeforeDOJ = moment(doj).isBefore(attnStartDate);

    } else if (month == month2 && year == year2) {
      isBeforeDOJ = true;
    }

    else if (month == month3 && year == year3) {
      isAfterDOJ = true;
    }
    else {
      isAfterDOJ = false;
      isBeforeDOJ = false;
    }
    return { isBeforeDOJ, isAfterDOJ }
  }

  load_AttendanceLog() {
    console.log('DOJ', this.timecardEditDOJ);
    var doj = moment(this.timecardEditDOJ).format('YYYY-MM-DD');
    var attStart = moment(this.TimeCardDetails.AttendanceStartDate).format('YYYY-MM-DD');
    var isAfterDOJ = false; // moment(doj).isAfter(attStart);
    var isBeforeDOJ = false // moment(doj).isAfter(attStart);
    var _Output = this.dedicatedMonthyearMatch(doj, attStart);
    console.log('_Output', _Output);
    isAfterDOJ = _Output.isAfterDOJ as any;
    isBeforeDOJ = _Output.isBeforeDOJ as any;
    this.viewDate = new Date(this.TimeCardDetails.AttendanceStartDate);
    this.events = [];
    // isAfterDOJ == true ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = new Date(this.TimeCardDetails.AttendanceStartDate);
    (isAfterDOJ == true || isBeforeDOJ == true) ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceStartDate) : new Date(this.TimeCardDetails.PeriodStartDate);
    // this.minDate = this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceStartDate) : new Date(this.TimeCardDetails.PeriodStartDate);
    this.maxDate = this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate);
    console.log('min date', this.minDate);

    this.dateOrViewChanged();
    // const output = this.enumerateDaysBetweenDates(this.isPeriodBased == true ? ((isAfterDOJ == true ? new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.AttendanceStartDate))) : new Date(this.TimeCardDetails.PeriodStartDate), this.isPeriodBased == true ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate)); // first implementation 
    // alert(this.isPeriodBased)
    // alert(this.timecardEditDOJ);
    // alert(isAfterDOJ); 
    //  const output = this.enumerateDaysBetweenDates(this.isPeriodBased == false ? ((isAfterDOJ == true ? new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.AttendanceStartDate))) : new Date(this.TimeCardDetails.PeriodStartDate), this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate)); // third chagnes
    const output = this.enumerateDaysBetweenDates((this.isPeriodBased == false && (isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) : ((this.isPeriodBased == false && isAfterDOJ == false && isBeforeDOJ == false) ? new Date(this.TimeCardDetails.AttendanceStartDate) : (this.isPeriodBased == true && (isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.PeriodStartDate)), this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate)); // 2nd dec 2021 v15 changes 
    console.log('output', output);
    console.log('timecard ', this.TimeCardDetails.AttendanceList);
    var templist = [];
    templist = this.TimeCardDetails.AttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList : [];
    templist.length > 0 && templist.forEach(element => {
      element['customFromDate'] = element.FromDate
    }), this.updateAttendanceEvents(templist);
    this.calculatePADays();
  }


  updateAttendanceEvents(templist) {
    templist.forEach(element => {

      while (moment(element.customFromDate) <= moment(element.ToDate)) {
        const weekEndDays = new Date(element.customFromDate);
        // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
        var isExist = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(weekEndDays).format('YYYY-MM-DD'))
        isExist != undefined && (isExist.start = new Date(weekEndDays),
          (isExist.meta = {
            IsFirstDayHalf: element.IsFirstDayHalf,
          }),
          isExist.id = element.Id, isExist.title = '',
          (isExist.color = colors.red))

        // }
        element.customFromDate = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD');

      }
    });
  }

  enumerateDaysBetweenDates(startDate, endDate) {
    console.log('endDate', endDate);
    console.log('startDate', startDate);

    let date = []
    while (moment(startDate) <= moment(endDate)) {
      const weekEndDays = new Date(startDate);
      // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
      this.events.push({
        start: new Date(startDate),
        id: 0,
        end: new Date(startDate),
        title: '',
        color: this.isattendanceFullMonthLOP == 1 ? colors.red : colors.green,
        // title: (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-04') || (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-08') ? 'Absent' : 'Present',
        // color: (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-04') || (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-08') ? colors.red : colors.green,
        meta: {
          IsFirstDayHalf: false,
          WFHStatus: 0,
          ODStatus: 0,
        },
      })
      // }
      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
      // }
    }
    // console.log('exm f', date);
    // console.log('events', this.events);
    // this.events.push({
    //   start: new Date('2020-06-15'),
    //   end: new Date('2020-06-15'),
    //   title: 'Absent',
    //   color: colors.red
    // })
    this.calculatePADays();
    return date;
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    // console.log(event);
  }
  dayClicked({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent<{}>[];
  }): void {

    // if(this.TeamDetails.IsMustorRollApplicable && this.isattendanceFullMonthLOP){
    //   this.alertService.showWarning("service not avaliable to revise");
    //   return;
    // }
    // console.log('events', events);;

    const modalRef = this.modalService.open(AttendancelogModalComponent, this.modalOption);
    modalRef.componentInstance.objJson = events[0];
    modalRef.componentInstance.IsLOP = true;

    modalRef.result.then((result) => {
      if (result != 'Modal Closed') {
        // console.log(result);;
        while (moment(result.StartDate) <= moment(result.EndDate)) {
          const weekEndDays = new Date(result.StartDate);
          // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
          // console.log(this.events);
          // console.log('test', moment(result.StartDate).format('YYYY-MM-DD'));
          //  this.events.forEach(element => {
          //     console.log( moment(element.start).format('YYYY-MM-DD'));

          //  });
          var existingValue = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(result.StartDate).format('YYYY-MM-DD'));
          // console.log('existingValue', existingValue);

          existingValue != undefined && (existingValue.start = new Date(result.StartDate), (existingValue.title = ""),
            existingValue.meta = {
              IsFirstDayHalf: result.isHalfDay,
            },
            (existingValue.color = result.Action == 'Present' ? colors.green : result.Action == 'Absent' ? colors.red : colors.yellow))

          // }
          result.StartDate = moment(result.StartDate).add(1, 'days').format('YYYY-MM-DD');

        }

        // if (result.isHalfDay) {
        //   this.events.push({
        //     start: new Date(result.StartDate),
        //     end: new Date(result.StartDate),
        //     title: result.NameofTitle,
        //     color: colors.red,
        //     meta: {
        //       IsFirstDayHalf: result.isHalfDay,
        //     },
        //   })
        // }
        this.calculatePADays();
      }
    }).catch((error) => {
      console.log(error);
    });

  }

  addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
    return {
      day: addDays,
      week: addWeeks,
      month: addMonths,
    }[period](date, amount);
  }

  subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
    return {
      day: subDays,
      week: subWeeks,
      month: subMonths,
    }[period](date, amount);
  }

  startOfPeriod(period: CalendarPeriod, date: Date): Date {
    return {
      day: startOfDay,
      week: startOfWeek,
      month: startOfMonth,
    }[period](date);
  }

  endOfPeriod(period: CalendarPeriod, date: Date): Date {
    return {
      day: endOfDay,
      week: endOfWeek,
      month: endOfMonth,
    }[period](date);
  }

  increment(): void {
    this.changeDate(this.addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(this.subPeriod(this.view, this.viewDate, 1));
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return moment(date).format('YYYY-MM-DD') >= moment(this.minDate).format('YYYY-MM-DD') && moment(date).format('YYYY-MM-DD') <= moment(this.maxDate).format('YYYY-MM-DD');
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  changeView(view: CalendarPeriod): void {
    this.view = view;
    this.dateOrViewChanged();
  }

  dateOrViewChanged(): void {
    this.prevBtnDisabled = !this.dateIsValid(
      this.endOfPeriod(this.view, this.subPeriod(this.view, this.viewDate, 1))
    );
    this.nextBtnDisabled = !this.dateIsValid(
      this.startOfPeriod(this.view, this.addPeriod(this.view, this.viewDate, 1))
    );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }
  refreshView(): void {
    this.refresh.next();
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {


      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
      if (this.isattendanceFullMonthLOP == 1) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  calculatePADays() {
    this.noOfP = 0;
    this.noOfA = 0;
    // console.log('test');
    // console.log('th', this.events);

    this.events.forEach(e => { (e.color === colors.red && e.meta.IsFirstDayHalf ? this.noOfA += 0.5 : e.color === colors.red ? this.noOfA += 1 : null) })
    this.events.forEach(e => { (e.color === colors.green ? this.noOfP += 1 : null) })
  }

  // REVOKE LOP



  addPeriod_revoke(period: CalendarPeriod, date: Date, amount: number): Date {
    return {
      day: addDays,
      week: addWeeks,
      month: addMonths,
    }[period](date, amount);
  }

  subPeriod_revoke(period: CalendarPeriod, date: Date, amount: number): Date {
    return {
      day: subDays,
      week: subWeeks,
      month: subMonths,
    }[period](date, amount);
  }

  startOfPeriod_revoke(period: CalendarPeriod, date: Date): Date {
    return {
      day: startOfDay,
      week: startOfWeek,
      month: startOfMonth,
    }[period](date);
  }

  endOfPeriod_revoke(period: CalendarPeriod, date: Date): Date {
    return {
      day: endOfDay,
      week: endOfWeek,
      month: endOfMonth,
    }[period](date);
  }

  refreshView_revoke(): void {
    this.refresh_revoke.next();
  }

  eventClicked_revoke({ event }: { event: CalendarEvent }): void {
    console.log(event);
  }
  dayClicked_revoke({
    date,
    events,
  }: {
    date: Date;
    events: CalendarEvent<{}>[];
  }): void {
    // console.log('events', events);;
    this.isEdited_Revoked = true;
    const modalRef = this.modalService.open(AttendancelogModalComponent, this.modalOption);
    modalRef.componentInstance.objJson = events[0];
    modalRef.componentInstance.IsLOP = false;
    modalRef.result.then((result) => {
      if (result != 'Modal Closed') {
        // console.log(result);;
        while (moment(result.StartDate) <= moment(result.EndDate)) {
          const weekEndDays = new Date(result.StartDate);
          // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
          // console.log(this.events_revoke);
          // console.log('test', moment(result.StartDate).format('YYYY-MM-DD'));
          //  this.events.forEach(element => {
          //     console.log( moment(element.start).format('YYYY-MM-DD'));

          //  });
          var existingValue = this.events_revoke.find(item => moment(item.start).format('YYYY-MM-DD') == moment(result.StartDate).format('YYYY-MM-DD'));
          // console.log('existingValue Rvk', existingValue);

          existingValue != undefined && (existingValue.start = new Date(result.StartDate), (existingValue.title = ""),
            existingValue.meta = {
              IsFirstDayHalf: result.isHalfDay,
            },
            (existingValue.color = result.Action == 'Present' ? colors.green : result.Action == 'Absent' ? colors.red : colors.yellow))

          // }
          result.StartDate = moment(result.StartDate).add(1, 'days').format('YYYY-MM-DD');

        }


        if (this.remove_RevokeLOPAttendanceList != null && this.remove_RevokeLOPAttendanceList.length > 0) {
          this.remove_RevokeLOPAttendanceList.forEach(element => {

            // var isexists = this.remove_RevokeLOPAttendanceList.find(x => x.ReferencedTimeCardId == this.current_Payperiod_Details.TimeCardList[0].Id && x.Id > 0);
            // isexists != undefined && ();
            if (element.ReferencedTimeCardId == this.current_Payperiod_Details.TimeCardList[0].Id && element.Id > 0) {
              element.Modetype = UIMode.Delete // result.Action == 'Absent' ?  UIMode.Delete :  UIMode.None;
              // this.updatedRevokeLopDaysList.push(element);
              // this.remove_RevokeLOPAttendanceList.splice(this.remove_RevokeLOPAttendanceList.indexOf(element), 1);
            }


          });
        }

        console.log('remove_RevokeLOPAttendanceList', this.remove_RevokeLOPAttendanceList);
        console.log('updatedRevokeLopDaysList', this.updatedRevokeLopDaysList);


        if (this.selectedPayPeriodId_Revoke != null && this.TeamDetails.IsMustorRollApplicable) {
          if (this.revokeLOP_calendar_payperiodDetails != null && this.revokeLOP_calendar_payperiodDetails.length > 0) {
            var isRevokeExist = this.revokeLOP_calendar_payperiodDetails.find(a => a.PayPeriodId == this.selectedPayPeriodId_Revoke);
            isRevokeExist != undefined && (isRevokeExist.RevokeLOPDays_Attendance = [], isRevokeExist.RevokeLOPDays_Attendance = this.events_revoke)
            isRevokeExist == undefined &&
              (
                this.revokeLOP_calendar_payperiodDetails.push({
                  PayPeriodId: this.selectedPayPeriodId_Revoke,
                  RevokeLOPDays_Attendance: this.events_revoke,
                  TimeCardId: this.Lst_LOPTimeCardDetails.Id
                })
              )
            isRevokeExist != undefined && (this._RevokeLOPDays = isRevokeExist.RevokeLOPDays_Attendance.filter(x => x.Type == 1).length)

          } else {
            this.revokeLOP_calendar_payperiodDetails.push({
              PayPeriodId: this.selectedPayPeriodId_Revoke,
              RevokeLOPDays_Attendance: this.events_revoke,
              TimeCardId: this.Lst_LOPTimeCardDetails.Id
            })
          }
        }
      }
    }).catch((error) => {
      console.log(error);
    });

    // this.calculatePADays();


  }
  increment_revoke(): void {
    this.changeDate_revoke(this.addPeriod_revoke(this.view_revoke, this.viewDate_revoke, 1));
  }
  decrement_revoke(): void {
    this.changeDate_revoke(this.subPeriod_revoke(this.view_revoke, this.viewDate_revoke, 1));
  }
  today_revoke(): void {
    this.changeDate_revoke(new Date());
  }

  dateIsValid_revoke(date: Date): boolean {
    this.minDate_revoke.setHours(0);
    this.minDate_revoke.setMinutes(0);
    this.maxDate_revoke.setHours(0);
    this.maxDate_revoke.setMinutes(0);

    return date >= this.minDate_revoke && date <= this.maxDate_revoke;
  }

  changeDate_revoke(date: Date): void {
    this.viewDate_revoke = date;
    this.dateOrViewChanged_revoke();
  }

  changeView_revoke(view: CalendarPeriod): void {
    this.view_revoke = view;
    this.dateOrViewChanged_revoke();
  }

  dateOrViewChanged_revoke(): void {
    this.prevBtnDisabled_revoke = !this.dateIsValid_revoke(
      this.endOfPeriod_revoke(this.view_revoke, this.subPeriod_revoke(this.view_revoke, this.viewDate_revoke, 1))
    );
    this.nextBtnDisabled_revoke = !this.dateIsValid_revoke(
      this.startOfPeriod_revoke(this.view_revoke, this.addPeriod_revoke(this.view_revoke, this.viewDate_revoke, 1))
    );
    if (this.viewDate_revoke < this.minDate_revoke) {
      this.changeDate_revoke(this.minDate_revoke);
    } else if (this.viewDate_revoke > this.maxDate_revoke) {
      this.changeDate_revoke(this.maxDate_revoke);
    }
  }
  beforeMonthViewRender_revoke({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {

      // if (this.isattendanceFullMonthLOP) { // for revoke lop is not based on is full month lop
      //   day.cssClass = 'cal-disabled'; 

      // } else {
      if (!this.dateIsValid_revoke(day.date)) {
        day.cssClass = 'cal-disabled';
      }
      if (day.events.length > 0 && day.events[0].color.primary == "#3BBD72") {
        day.cssClass = 'cal-disabled';
        // }

      }

    });
  }

  enumerateDaysBetweenDates_revoke(startDate, endDate) {
    // console.log('endDate', endDate);
    // console.log('startDate', startDate);

    let date = []
    while (moment(startDate) <= moment(endDate)) {
      const weekEndDays = new Date(startDate);
      // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
      this.events_revoke.push({
        start: new Date(startDate),
        id: 0,
        end: new Date(startDate),
        title: 'Present',
        // color: this.isattendanceFullMonthLOP == true ? colors.yellow : colors.green,
        color: colors.green,
        meta: {
          IsFirstDayHalf: false,
          WFHStatus: 0,
          ODStatus: 0,
        }

      })

      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

    }

    // console.log('exm d f', date);
    // console.log('eventsd ', this.events_revoke);
    return date;

  }
  doCheckNonMustorRollMinMaxDate() {
    var doj = moment(this.timecardEditDOJ).format('YYYY-MM-DD');
    var attStart = moment(this.TimeCardDetails.AttendanceStartDate).format('YYYY-MM-DD');
    var isAfterDOJ = false; // moment(doj).isAfter(attStart);
    var isBeforeDOJ = false // moment(doj).isAfter(attStart);
    var _Output = this.dedicatedMonthyearMatch(doj, attStart);
    isAfterDOJ = _Output.isAfterDOJ as any;
    isBeforeDOJ = _Output.isBeforeDOJ as any;
    //const output = this.enumerateDaysBetweenDates((isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) : ((this.isPeriodBased == false && isAfterDOJ == false && isBeforeDOJ == false) ? new Date(this.TimeCardDetails.AttendanceStartDate) :  (this.isPeriodBased == true && (isAfterDOJ == true || isBeforeDOJ == true)) ?   new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.PeriodStartDate)), this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate)); // 2nd dec 2021 v15 changes 
    let _a = (isAfterDOJ == true || isBeforeDOJ == true) ? new Date(this.timecardEditDOJ) :
      (isAfterDOJ == false && isBeforeDOJ == false) ? new Date(this.TimeCardDetails.AttendanceStartDate) :
        (isAfterDOJ == true as any || isBeforeDOJ == true as any) ? new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.PeriodStartDate)

    return _a;
  }
  doCheckNonMustorRollMinMaxDate1() {
    var doj = moment(this.timecardEditDOJ).format('YYYY-MM-DD');
    var attStart = moment(this.TimeCardDetails.PeriodStartDate).format('YYYY-MM-DD');
    var isAfterDOJ = false; // moment(doj).isAfter(attStart);
    var isBeforeDOJ = false // moment(doj).isAfter(attStart);
    var _Output = this.dedicatedMonthyearMatch(doj, attStart);
    isAfterDOJ = _Output.isAfterDOJ as any;
    isBeforeDOJ = _Output.isBeforeDOJ as any;

    // const output = this.enumerateDaysBetweenDates((this.isPeriodBased == false && (isAfterDOJ == true || isBeforeDOJ == true)) ? 
    // new Date(this.timecardEditDOJ) : ((this.isPeriodBased == false && isAfterDOJ == false && isBeforeDOJ == false) ? new Date(this.TimeCardDetails.AttendanceStartDate) :
    //  (this.isPeriodBased == true && (isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.PeriodStartDate)), this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate)); // 2nd dec 2021 v15 changes 

    //const output = this.enumerateDaysBetweenDates((isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) : ((this.isPeriodBased == false && isAfterDOJ == false && isBeforeDOJ == false) ? new Date(this.TimeCardDetails.AttendanceStartDate) :  (this.isPeriodBased == true && (isAfterDOJ == true || isBeforeDOJ == true)) ?   new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.PeriodStartDate)), this.isPeriodBased == false ? new Date(this.TimeCardDetails.AttendanceEndDate) : new Date(this.TimeCardDetails.PeriodEndDate)); // 2nd dec 2021 v15 changes 
    let _a1 = (this.isPeriodBased == false && (isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) :
      (this.isPeriodBased == false && isAfterDOJ == false && isBeforeDOJ == false) ? new Date(this.TimeCardDetails.PeriodStartDate) :
        (this.isPeriodBased == true && (isAfterDOJ == true || isBeforeDOJ == true)) ? new Date(this.timecardEditDOJ) : new Date(this.TimeCardDetails.PeriodStartDate)

    return _a1;
  }

  attendancePeriod(period, eve) {
    // console.log('eve', eve);
    this.isEdited = true;
    if (eve.target.checked) {
      // period == 1 ? this.isFullMonthLOP = false : this.isFullMonthLOP = true;
      period == 1 ? this.isattendanceFullMonthLOP = 1 : this.isattendanceFullMonthLOP = 2;
      this.isattendanceFullMonthLOP == 1 ? this.isPeriodBased = true : this.isPeriodBased = true
      // alert('come')
      this.isEdited = true;
      this.isattendanceFullMonthLOP == 1 && this.dostampingPeriod(2);
      // this.refreshView();
      // this.isPeriodBased == true ? this.isPeriodBased = true : this.isPeriodBased = false;
      if (!this.TeamDetails.IsMustorRollApplicable && this.isattendanceFullMonthLOP == 1) {
        // alert('bn');


        var a = moment(this.doCheckNonMustorRollMinMaxDate());
        var b = moment(this.TimeCardDetails.AttendanceEndDate);
        this.attendanceTotalDays = b.diff(a, 'days') + 1;
        this.attendanceLOPDays = this.attendanceTotalDays;
        this.attendancePresentDays = Number(this.attendanceTotalDays) - Number(this.attendanceLOPDays);
      }
      if (!this.TeamDetails.IsMustorRollApplicable && this.isattendanceFullMonthLOP == 2) {
        // alert('bn 4')
        var a = moment(this.doCheckNonMustorRollMinMaxDate1());
        var b = moment(this.TimeCardDetails.PeriodEndDate);
        this.attendanceTotalDays = b.diff(a, 'days') + 1;
        this.attendanceLOPDays = this.attendanceTotalDays; // you can cahgne as
        this.attendancePresentDays = Number(this.attendanceTotalDays) - Number(this.attendanceLOPDays);
        this.lopDay_builder(this.doCheckNonMustorRollMinMaxDate1(), this.TimeCardDetails.PeriodEndDate, this.attendanceLOPDays)
      }
      if (this.TeamDetails.IsMustorRollApplicable && this.isattendanceFullMonthLOP == 2) {
        this.load_AttendanceLog();
        this.refreshView();
      }
    } else {
      this.isattendanceFullMonthLOP = 3;
      this.isPeriodBased = false;
      this.load_AttendanceLog();
    }

  }

  async dostampingPeriod(cycle) {
    this.attendanceTotalDays = 0;
    // console.log('this.TimeCardDetails', this.TimeCardDetails);
    // this.isEdited_Revoked = true;
    // alert(this.isattendanceFullMonthLOP);
    this.isattendanceFullMonthLOP == 1 && (this.isEdited = true);
    this.isattendanceFullMonthLOP == 1 && (this.isChangedPayPeriod = true)
    if (cycle == 1) {
      // alert('4')
      this.isattendancePeriodType = true;
      var a = moment(this.doCheckNonMustorRollMinMaxDate1());
      var b = moment(this.TimeCardDetails.PeriodEndDate);
      this.attendanceTotalDays = b.diff(a, 'days') + 1;


      this.isattendanceFullMonthLOP == 1 && (this.attendanceLOPDays = this.attendanceTotalDays);
      this.isattendanceFullMonthLOP == 1 && await this.lopDay_builder(this.doCheckNonMustorRollMinMaxDate1(), this.TimeCardDetails.PeriodEndDate, 0)
    } else if (cycle == 2 && !this.TeamDetails.IsMustorRollApplicable) {
      // alert('6')
      this.isattendancePeriodType = false;
      var a = moment(this.doCheckNonMustorRollMinMaxDate());
      var b = moment(this.TimeCardDetails.AttendanceEndDate);
      this.attendanceTotalDays = b.diff(a, 'days') + 1;
      this.isattendanceFullMonthLOP == 1 && (this.attendanceLOPDays = this.attendanceTotalDays);
      this.isattendanceFullMonthLOP == 1 && await this.lopDay_builder(this.doCheckNonMustorRollMinMaxDate(), this.TimeCardDetails.AttendanceEndDate, 0)

    } else if (cycle == 2 && this.TeamDetails.IsMustorRollApplicable) {
      this.isattendancePeriodType = false;
      var a = moment(this.doCheckNonMustorRollMinMaxDate());
      var b = moment(this.TimeCardDetails.AttendanceEndDate);
      this.attendanceTotalDays = b.diff(a, 'days') + 1;
      this.isattendanceFullMonthLOP == 1 && (this.attendanceLOPDays = this.attendanceTotalDays);
      this.isPeriodBased = true;
      this.load_AttendanceLog();
      this.TimeCardDetails.AttendanceList = []; // test and update it
      this.refreshView();
      // this.isattendanceFullMonthLOP == true && await this.lopDay_builder(this.TimeCardDetails.AttendanceStartDate, this.TimeCardDetails.AttendanceEndDate, 0)

    }
  }
  async onChangeattendanceLOPDays(eventValue) {
    // alert('cime 2')

    if ((this.attendanceLOPDays <= this.attendanceTotalDays)) {
      const result = await this.lopDay_builder(this.isPeriodBased == true ? this.doCheckNonMustorRollMinMaxDate1() : this.doCheckNonMustorRollMinMaxDate(), this.isPeriodBased == true ? this.TimeCardDetails.PeriodEndDate : this.TimeCardDetails.AttendanceEndDate, eventValue)
      this.isEdited = true;
      this.attendancePresentDays = Number(this.attendanceTotalDays) - Number(this.attendanceLOPDays);

      // this.LstnonMustorRoleAttendance = result;
    } else {
      this.attendancePresentDays = 0;
    }
  }

  isInt(n) {
    return n % 1 === 0;
  }

  async lopDay_builder(startDate, endDate, lopdays) {
    var AttendanceList = [];
    this.events = [];
    while (moment(startDate) <= moment(endDate)) {
      var attendance = new Attendance();
      attendance.TimeCardId = this.TimeCardDetails.Id;
      attendance.Type = AttendanceType.LOP;
      attendance.Id = 0;
      attendance.FromDate = moment(startDate).format('YYYY-MM-DD');
      attendance.ToDate = moment(startDate).format('YYYY-MM-DD');
      attendance.IsFirstDayHalf = false;
      attendance.NumberOfDays = 1;
      attendance.ReferencedTimeCardId = 0;
      attendance.Modetype = UIMode.Edit;

      if (this.isattendanceFullMonthLOP == 1 && this.TeamDetails.IsMustorRollApplicable) {
        this.events.push({
          start: new Date(startDate),
          id: 0,
          end: new Date(startDate),
          title: 'Absent',
          color: colors.red,
          meta: {
            IsFirstDayHalf: false,
            WFHStatus: 0,
            ODStatus: 0,
          }

        })
      }
      AttendanceList.push(attendance);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

    }

    this.isInt(lopdays) == false ? lopdays = Number(lopdays) + 1 : null;

    this.isattendanceFullMonthLOP == 1 && this.TeamDetails.IsMustorRollApplicable && this.calculatePADays();
    let orderby = this.IsAttendanceStampingBasedonLastDate == true ? "desc" : "asc" as any;
    AttendanceList = _.orderBy(AttendanceList, function (o) { return moment(o.FromDate); }, [orderby]);
    (this.isattendanceFullMonthLOP == 2 || this.isattendanceFullMonthLOP == 3) && (AttendanceList = _.take(AttendanceList, lopdays));
    if (this.isInt(lopdays) == false) {
      var last: any = AttendanceList[AttendanceList.length - 1];
      last.IsFirstDayHalf = true;
      last.NumberOfDays = 0.5;
    }
    this.LstnonMustorRoleAttendance = AttendanceList;
    console.log('AttendanceList', AttendanceList);
    console.log('events', this.events);
    console.log('LstnonMustorRoleAttendance', this.LstnonMustorRoleAttendance);

    return AttendanceList;
  }

  updateAttendanceRevokeCalender(filterLOP_Days) {

    console.log('FILTERD LOP DAYS :', filterLOP_Days);

    filterLOP_Days.forEach(element => {
      while (moment(element.customFromDate) <= moment(element.ToDate)) {
        const weekEndDays = new Date(element.customFromDate);
        var isExist = this.events_revoke.find(item => moment(item.start).format('YYYY-MM-DD') == moment(element.customFromDate).format('YYYY-MM-DD'))
        isExist != undefined && (isExist.start = new Date(element.customFromDate),
          (isExist.meta = {
            IsFirstDayHalf: element.IsFirstDayHalf,
          }),
          isExist.id = element.Id, isExist.title = '',

          (isExist.color = element.Type == 0 ? colors.red : colors.yellow))

        element.customFromDate = moment(element.customFromDate).add(1, 'days').format('YYYY-MM-DD');
        // console.log('day el', element);

      }
    });

  }

  rewamp_revokelopBuilder(revoke_canlendar_events) {
    const promise = new Promise((res, rej) => {
      var revokelop_attendance = [];

      revoke_canlendar_events.length > 0 && revoke_canlendar_events.forEach(e => {
        var attendance = new Attendance();
        attendance.TimeCardId = this.TimeCardDetails.Id;
        attendance.Type = AttendanceType.RevokeLOP;
        attendance.Id = 0;
        attendance.FromDate = moment(e.start).format('YYYY-MM-DD');
        attendance.ToDate = moment(e.end).format('YYYY-MM-DD');
        attendance.IsFirstDayHalf = false;
        attendance.NumberOfDays = 1;
        attendance.ReferencedTimeCardId = 0;
        attendance.Modetype = UIMode.Edit;
        revokelop_attendance.push(attendance);
      });
      console.log('ATTEN : ', revokelop_attendance);
      res(revokelop_attendance);
    });

    return promise;


    // if (this.isattendanceFullMonthLOP == 1 && this.TeamDetails.IsMustorRollApplicable) {
    //   this.events.push({
    //     start: new Date(startDate),
    //     id: 0,
    //     end: new Date(startDate),
    //     title: 'Absent',
    //     color: colors.red,
    //     meta: {
    //       IsFirstDayHalf: false
    //     }
    //   })
    // }
    // AttendanceList.push(attendance);
    // startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

  }

  onChangePayPeriod(event) {
    // console.log('event', event);
    if (this.revokeLOP_calendar_payperiodDetails.length == 0) {
      this.events_revoke = [];
    }
    this._RevokeLOPDays = 0;

    // rewrap prebuilded attendance details


    // commentted with duplicate record has inserted 
    // if (this.selectedPayPeriodId_Revoke != null && this.TeamDetails.IsMustorRollApplicable) {
    //   if (this.revokeLOP_calendar_payperiodDetails != null && this.revokeLOP_calendar_payperiodDetails.length > 0) {
    //     var isRevokeExist = this.revokeLOP_calendar_payperiodDetails.find(a => a.PayPeriodId == this.selectedPayPeriodId_Revoke);
    //     isRevokeExist != undefined && (isRevokeExist.RevokeLOPDays_Attendance = [], isRevokeExist.RevokeLOPDays_Attendance = this.events_revoke)
    //     isRevokeExist == undefined &&
    //       (
    //         this.revokeLOP_calendar_payperiodDetails.push({
    //           PayPeriodId: this.selectedPayPeriodId_Revoke,
    //           RevokeLOPDays_Attendance: this.events_revoke,
    //           TimeCardId: 0
    //         })
    //       )
    //     isRevokeExist != undefined && (this._RevokeLOPDays = isRevokeExist.RevokeLOPDays_Attendance.filter(x => x.Type == 1).length)

    //   } else {
    //     this.revokeLOP_calendar_payperiodDetails.push({
    //       PayPeriodId: this.selectedPayPeriodId_Revoke,
    //       RevokeLOPDays_Attendance: this.events_revoke,
    //       TimeCardId: 0
    //     })
    //   }
    // }

    this.selectedPayPeriodId_Revoke = null;

    console.log('REVOKE CALENDAR LOP ::', this.revokeLOP_calendar_payperiodDetails);
    console.log('EVENT FOR REVOKE LOP ::', this.events_revoke);

    // console.log('this.TimeCardDetails', this.TimeCardDetails);
    this.Lst_LOPDetails = [];
    this.current_Payperiod_Details = null;
    this._LOPDays = 0;
    this.alreadyRevokedDays = 0;

    this.payrollService.GetLopDetailsForRevokal(this.TimeCardDetails.EmployeeId, event.Id).subscribe((result) => {
      // this._RevokePayPeriod = event;      

      const response = result as apiResult;
      const answer = JSON.parse(response.Result);
      console.log('CURRENT PAYPERID DETAILS ::', answer);

      this.current_Payperiod_Details = answer;
      var ReferencedTimeCardId = 0;
      this.glbReferencedTimeCardId = 0;
      this.events_revoke = [];
      this.Lst_LOPDetails = answer.AttendanceList;
      this.Lst_LOPTimeCardDetails = this.Lst_LOPDetails.length > 0 ? answer.TimeCardList.filter(z => z.Id == this.Lst_LOPDetails[0].TimeCardId)[0] : answer.TimeCardList[0];
      // this._LOPDays = this.Lst_LOPDetails.length > 0 ? this.Lst_LOPDetails.filter(a => a.Type == AttendanceType.LOP).le ngth  : 0;
      // this.TimeCardDetails.AttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList.forEach(element => {
      //   this.Lst_LOPDetails != null && this.Lst_LOPDetails.length > 0 ?  this.Lst_LOPDetails  = this.Lst_LOPDetails.filter(c=>c.TimeCardId != element.ReferencedTimeCardId) : null;

      // }) : null;
      this._LOPDays = this.Lst_LOPDetails != null && this.Lst_LOPDetails.length > 0 ? (this.Lst_LOPDetails.filter(z => z.Type == AttendanceType.LOP).length) - (this.Lst_LOPDetails.filter(x => x.IsFirstDayHalf && x.Type == AttendanceType.LOP).length * 0.5) : 0;
      // alert(this._LOPDays)
      var revokedays = this.TimeCardDetails.AttendanceList.length > 0 ? (this.TimeCardDetails.AttendanceList.filter(z => z.ReferencedTimeCardId == answer.TimeCardList[0].Id && z.Type == AttendanceType.RevokeLOP).length) - (this.TimeCardDetails.AttendanceList.filter(x => x.IsFirstDayHalf && x.ReferencedTimeCardId == answer.TimeCardList[0].Id && x.Type == AttendanceType.RevokeLOP).length * 0.5) : 0;
      this.alreadyRevokedDays = Number(this.alreadyRevokedDays) + Number(this._LOPDays) + Number(revokedays);
      //   var updatedRevokeLOPDays = this.TimeCardDetails.AttendanceList != null && this.TimeCardDetails.AttendanceList.length > 0 ? (this.TimeCardDetails.AttendanceList.filter(z => z.Type == AttendanceType.RevokeLOP).length) - (this.TimeCardDetails.AttendanceList.filter(x => x.IsFirstDayHalf && x.Type == AttendanceType.RevokeLOP).length * 0.5) : 0;
      //  console.log('lop days', this._LOPDays);
      //   updatedRevokeLOPDays > 0 ? this._LOPDays = (this._LOPDays - updatedRevokeLOPDays) : null;
      console.log('TIMECARD DETAILS ::', this.TimeCardDetails);

      var filterLOP_Days = [];
      var filterRevokeLOP_Days = [];
      var filterRevokeLOP_Days1 = [];

      let rebinding_Calender_revoke = undefined;
      var old_revokelop = [];
      // if (this.revokeLOP_calendar_payperiodDetails != null && this.revokeLOP_calendar_payperiodDetails.length > 0) {

      //   rebinding_Calender_revoke = this.revokeLOP_calendar_payperiodDetails.find(a => a.PayPeriodId == event.Id);
      //   console.log('rebinding_Calender_revoke', rebinding_Calender_revoke);
      //   rebinding_Calender_revoke != undefined && (old_revokelop = rebinding_Calender_revoke.RevokeLOPDays_Attendance.filter(x => x.id != 0 && x.color.primary == colors.yellow.primary))

      // }

      this.revokeLOP_calendar_payperiodDetails != null && this.revokeLOP_calendar_payperiodDetails.length > 0 &&
        (rebinding_Calender_revoke = this.revokeLOP_calendar_payperiodDetails.find(a => a.PayPeriodId == event.Id))
      rebinding_Calender_revoke != undefined && (old_revokelop = rebinding_Calender_revoke.RevokeLOPDays_Attendance.filter(x => x.color.primary == colors.yellow.primary))
      this.rewamp_revokelopBuilder(old_revokelop).then((result) => {
        filterRevokeLOP_Days1 = (result) as any;
        console.log('filterRevokeLOP_Days', filterRevokeLOP_Days1);

        answer.AttendanceList.length > 0 ? filterLOP_Days = answer.AttendanceList.filter(a => a.Type == AttendanceType.LOP) : true;
        answer.AttendanceList.length > 0 ? filterRevokeLOP_Days = answer.AttendanceList.filter(a => a.Type == AttendanceType.RevokeLOP) : true;
        filterRevokeLOP_Days1.length > 0 && (filterRevokeLOP_Days = filterRevokeLOP_Days1.concat(filterRevokeLOP_Days));


        // console.log('Lst_L bOPDetails', this.Lst_LOPDetails);
        if (this.Lst_LOPTimeCardDetails != undefined) {
          // FOR REBINDING NO OF LOP DAY (FROM OLD LIST)
          console.log('filterRevokeLOP_Day tttt s', filterRevokeLOP_Days);

          this.selectedPayPeriodId_Revoke = event.Id;
          this.viewDate_revoke = new Date(this.Lst_LOPTimeCardDetails.AttendanceStartDate);
          this.minDate_revoke = new Date(this.Lst_LOPTimeCardDetails.AttendanceStartDate);
          this.maxDate_revoke = new Date(this.Lst_LOPTimeCardDetails.AttendanceEndDate);
          ReferencedTimeCardId = this.Lst_LOPTimeCardDetails.Id;
          this.glbReferencedTimeCardId = this.Lst_LOPTimeCardDetails.Id;
          this._RevokeLOPDays = this.TimeCardDetails.AttendanceList.length > 0 ? (this.TimeCardDetails.AttendanceList.filter(z => z.ReferencedTimeCardId == answer.TimeCardList[0].Id && z.Type == AttendanceType.RevokeLOP).length) - (this.TimeCardDetails.AttendanceList.filter(x => x.IsFirstDayHalf && x.ReferencedTimeCardId == answer.TimeCardList[0].Id && x.Type == AttendanceType.RevokeLOP).length * 0.5) : 0;


          // this.TimeCardDetails.AttendanceList.length > 0 && this.TimeCardDetails.AttendanceList.filter(x => x.Type == 1).length > 0 ?
          //   this.TimeCardDetails.AttendanceList.filter(x => x.Type == 1 && x.ReferencedTimeCardId == ReferencedTimeCardId).length : 0;
          // if(this._RevokeLOPDays > 0){
          //   filterRevokeLOP_Days.length ==  0 && ()
          // }
          console.log('this.TimecardDetails_RevokeLOP', this.TimecardDetails_RevokeLOP);

          this.TimecardDetails_RevokeLOP != null && this.TimecardDetails_RevokeLOP.length > 0 && (filterRevokeLOP_Days = filterRevokeLOP_Days.length > 0 ? filterRevokeLOP_Days.concat(this.TimecardDetails_RevokeLOP.filter(x => x.Type == 1)) : this.TimecardDetails_RevokeLOP.filter(x => x.Type == 1));
          // console.log('minDate_revoke', this.minDate_revoke);
          // console.log('maxDate_revoke', this.maxDate_revoke);
          console.log('_RevokeLOPDays', filterRevokeLOP_Days);

          if (this.revokeLOP_payperiodDetails != null && this.revokeLOP_payperiodDetails.length > 0) {
            let updateRevokeLOP_days = this.revokeLOP_payperiodDetails.find(z => z.PayPeriodId == event.Id)
            updateRevokeLOP_days != undefined && updateRevokeLOP_days.RevokeLOPDays_Attendance != null && updateRevokeLOP_days.RevokeLOPDays_Attendance.length > 0 ? this._RevokeLOPDays = updateRevokeLOP_days.RevokeLOPDays_Attendance.length : null
          }

          this.dateOrViewChanged_revoke();

          // if (this.TeamDetails.IsMustorRollApplicable && this.isattendanceFullMonthLOP) {
          //   this.refreshView_revoke();
          //   alert('vv')
          //   this.isEdited_Revoked = true;
          //   this.enumerateDaysBetweenDates_revoke((new Date(this.Lst_LOPTimeCardDetails.AttendanceStartDate)), new Date(this.Lst_LOPTimeCardDetails.AttendanceEndDate));
          // }
          // else 
          // if (this.TeamDetails.IsMustorRollApplicable && !this.isattendanceFullMonthLOP) {
          if (this.TeamDetails.IsMustorRollApplicable) {
            // alert('ssss')
            console.log('filterLOP_Days', filterLOP_Days);
            this.enumerateDaysBetweenDates_revoke((new Date(this.Lst_LOPTimeCardDetails.AttendanceStartDate)), new Date(this.Lst_LOPTimeCardDetails.AttendanceEndDate));

            filterLOP_Days.length > 0 &&
              filterLOP_Days.forEach((element) => {
                element['customFromDate'] = element.FromDate;
              }), this.updateAttendanceRevokeCalender(filterLOP_Days);
            // while (moment(element.FromDate) <= moment(element.ToDate)) {
            //   const weekEndDays = new Date(element.FromDate);
            //   var isExist = this.events_revoke.find(item => moment(item.start).format('YYYY-MM-DD') == moment(element.FromDate).format('YYYY-MM-DD'))
            //   isExist != undefined && (isExist.start = new Date(element.FromDate),
            //     (isExist.meta = {
            //       IsFirstDayHalf: element.IsFirstDayHalf,
            //     }),
            //     isExist.id = element.Id, isExist.title = '',
            //     (isExist.color = colors.red))

            //   element.FromDate = moment(element.FromDate).add(1, 'days').format('YYYY-MM-DD');
            //   console.log('day el', element);

            // }

            // });


            filterRevokeLOP_Days.length > 0 &&
              filterRevokeLOP_Days.forEach((element) => {
                element['customFromDate'] = element.FromDate;
              }), this.updateAttendanceRevokeCalender(filterRevokeLOP_Days);
            // filterRevokeLOP_Days.forEach((element) => {
            // while (moment(element.FromDate) <= moment(element.ToDate)) {
            //   const weekEndDays = new Date(element.FromDate);
            //   var isExist = this.events_revoke.find(item => moment(item.start).format('YYYY-MM-DD') == moment(element.FromDate).format('YYYY-MM-DD'))
            //   isExist != undefined && (isExist.start = new Date(element.FromDate),
            //     (isExist.meta = {
            //       IsFirstDayHalf: element.IsFirstDayHalf,
            //     }),
            //     isExist.id = element.Id, isExist.title = '',
            //     (isExist.color = colors.yellow))

            //   element.FromDate = moment(element.FromDate).add(1, 'days').format('YYYY-MM-DD');
            //   console.log('day el c', element);

            // }

            // });

            console.log('revoke een', this.events_revoke);

            // this.refreshView_revoke();

            console.log('this.revokeLOP_calendar_payperiodDetails', this.revokeLOP_calendar_payperiodDetails);


            // if (this.TeamDetails.IsMustorRollApplicable) {
            //   if (this.revokeLOP_calendar_payperiodDetails != null && this.revokeLOP_calendar_payperiodDetails.length > 0) {
            //     var isRevokeExist = this.revokeLOP_calendar_payperiodDetails.find(a => a.PayPeriodId == event.Id);
            //     isRevokeExist != undefined && (isRevokeExist.RevokeLOPDays_Attendance = [],  isRevokeExist.TimeCardId= this.Lst_LOPTimeCardDetails.Id,  isRevokeExist.RevokeLOPDays_Attendance = this.events_revoke)
            //     isRevokeExist == undefined &&
            //       (
            //         this.revokeLOP_calendar_payperiodDetails.push({
            //           PayPeriodId: event.Id,
            //           RevokeLOPDays_Attendance: this.events_revoke,
            //           TimeCardId: this.Lst_LOPTimeCardDetails.Id

            //         })
            //       )
            //     // isRevokeExist != undefined && (this._RevokeLOPDays = isRevokeExist.RevokeLOPDays_Attendance.filter(x => x.Type == 1).length),
            //     //   isRevokeExist != undefined && (console.log('isRevokeExist.RevokeLOPDays_Attendance', isRevokeExist.RevokeLOPDays_Attendance))

            //   } else {
            //     this.revokeLOP_calendar_payperiodDetails.push({
            //       PayPeriodId: event.Id,
            //       RevokeLOPDays_Attendance: this.events_revoke,
            //       TimeCardId: this.Lst_LOPTimeCardDetails.Id
            //     })
            //   }
            // }


          } else {
            // if (!this.isFullMonthLOP) {
            //   this.RevokeLOPAttendance = []; 
            //   var startDate = this.Lst_LOPTimeCardDetails.PeriodStartDate;
            //   var endDate = this.Lst_LOPTimeCardDetails.PeriodEndDate
            //   let AttendanceList = [];
            //   let date = [];
            //   while (moment(startDate) <= moment(endDate)) {
            //     var attendance = new Attendance();
            //     attendance.TimeCardId = this.TimeCardDetails.Id;
            //     attendance.Type = AttendanceType.RevokeLOP;
            //     attendance.Id = 0;
            //     attendance.FromDate = moment(startDate).format('YYYY-MM-DD');
            //     attendance.ToDate = moment(startDate).format('YYYY-MM-DD');
            //     attendance.IsFirstDayHalf = false;
            //     attendance.NumberOfDays = 1;
            //     attendance.ReferencedTimeCardId = this.Lst_LOPTimeCardDetails.Id;
            //     attendance.Modetype = UIMode.Edit;
            //     AttendanceList.push(attendance);
            //     date.push(startDate);
            //     startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
            //   }
            //   this.RevokeLOPAttendance = AttendanceList;
            // } else {
            // this.RevokeLOPAttendance = [];
            // }
          }
        }
      })
    });

  }

  onChangeRevokeLOP(event, lstLOP): void {
    var AttendanceList = []
    console.log('Revoke :', this._RevokeLOPDays);
    console.log('alreadyRevokedDays :', this.alreadyRevokedDays);
    // this.revokLopdays_attendanceList = [];
    if ((this._RevokeLOPDays <= this.alreadyRevokedDays)) {

      this.isInt(event) == false ? event = Number(event) + 1 : null;
      console.log('event', event);

      this.isEdited_Revoked = true;
      console.log('No of Days ::', lstLOP);
      var alreadyRevokedAttendanceList = []
      var filterdRevokedDays = [];
      alreadyRevokedAttendanceList = this.TimeCardDetails.AttendanceList.length > 0 ? (this.TimeCardDetails.AttendanceList.filter(z => z.ReferencedTimeCardId == this.current_Payperiod_Details.TimeCardList[0].Id && z.Type == AttendanceType.RevokeLOP)) : [];

      alreadyRevokedAttendanceList.length > 0 && this.Lst_LOPDetails.length > 0 ? filterdRevokedDays = this.Lst_LOPDetails.concat(alreadyRevokedAttendanceList) :
        alreadyRevokedAttendanceList.length > 0 && this.Lst_LOPDetails.length == 0 ? filterdRevokedDays = alreadyRevokedAttendanceList : null;
      alreadyRevokedAttendanceList.length == 0 ? filterdRevokedDays = lstLOP : null;

      let orderby = this.IsAttendanceStampingBasedonLastDate == true ? "desc" : "asc" as any;
      lstLOP = _.orderBy(filterdRevokedDays, function (o) { return moment(o.FromDate); }, [orderby]);
      console.log('Lst_LOPDetails', lstLOP);
      lstLOP = _.take(lstLOP, event);
      console.log('Lst_LOPDetails take', lstLOP);
      var presents = _.intersectionWith(lstLOP, this.Lst_LOPDetails, _.isEqual);
      console.log('presents', lstLOP);
      var roundOff = event;
      roundOff = Math.round(roundOff);
      roundOff = roundOff - 1;
      var startDate, endDate;

      lstLOP.forEach(element => {
        var attendance = new Attendance();
        attendance.TimeCardId = this.TimeCardDetails.Id;
        attendance.Type = AttendanceType.RevokeLOP;
        attendance.Id = 0;
        attendance.FromDate = moment(element.FromDate).format('YYYY-MM-DD');
        attendance.ToDate = moment(element.ToDate).format('YYYY-MM-DD');
        attendance.IsFirstDayHalf = false;
        attendance.NumberOfDays = 1;
        attendance.ReferencedTimeCardId = this.Lst_LOPTimeCardDetails.Id;
        attendance.Modetype = UIMode.Edit;
        AttendanceList.push(attendance);
      });

      // filterdRevokedDays = _.orderBy(alreadyRevokedAttendanceList, function (o) { return moment(o.FromDate); }, [orderby]);
      //   if(presents.length == 0 && filterdRevokedDays.length > 0){
      //     filterdRevokedDays = _.take(filterdRevokedDays, event);
      //     console.log('Lst_filterdRevokedDays ', filterdRevokedDays);
      //     var presents1 = _.intersectionWith(filterdRevokedDays, this.Lst_LOPDetails, _.isEqual);
      //     console.log('presents1', presents1);
      //   if((this.Lst_LOPTimeCardDetails.IsFullMonthLOP == true && this.Lst_LOPTimeCardDetails.IsLOPBasedOnPayrollMonth == false) ||
      //   (this.Lst_LOPTimeCardDetails.IsFullMonthLOP == false && this.Lst_LOPTimeCardDetails.IsLOPBasedOnPayrollMonth == true)
      //   ){
      //     startDate = this.Lst_LOPTimeCardDetails.AttendanceStartDate;
      //     endDate = moment(this.Lst_LOPTimeCardDetails.AttendanceStartDate).add(  this.isInt(event) == false ? (roundOff -1) : this._RevokeLOPDays -1, 'days').format('YYYY-MM-DD');
      //   }else if((this.Lst_LOPTimeCardDetails.IsFullMonthLOP == false && this.Lst_LOPTimeCardDetails.IsLOPBasedOnPayrollMonth == false)){
      //     startDate =moment(this.Lst_LOPTimeCardDetails.PeriodStartDate).format('YYYY-MM-DD');
      //     endDate = moment(this.Lst_LOPTimeCardDetails.PeriodStartDate).add(this.isInt(event) == false ? (roundOff -1): this._RevokeLOPDays -1, 'days').format('YYYY-MM-DD');
      //   }

      //   console.log('start date',startDate );
      //   console.log('endDate date',endDate );

      //   var AttendanceList = [];
      //   this.events = [];
      //   while (moment(startDate) <= moment(endDate)) {
      //     var attendance = new Attendance();
      //     attendance.TimeCardId = this.TimeCardDetails.Id;
      //     attendance.Type = AttendanceType.RevokeLOP;
      //     attendance.Id = 0;
      //     attendance.FromDate = moment(startDate).format('YYYY-MM-DD');
      //     attendance.ToDate = moment(startDate).format('YYYY-MM-DD');
      //     attendance.IsFirstDayHalf = false;
      //     attendance.NumberOfDays = 1;
      //     attendance.ReferencedTimeCardId = this.Lst_LOPTimeCardDetails.Id;
      //     attendance.Modetype = UIMode.Edit;  
      //     AttendanceList.push(attendance);
      //     startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

      //   }
      // }

    }

    console.log('atten', AttendanceList);

    if (this.isInt(event) == false && AttendanceList.length > 0) {
      var last: any = AttendanceList[AttendanceList.length - 1];
      last.IsFirstDayHalf = true;
      last.NumberOfDays = 0.5;
    }

    if (this.remove_RevokeLOPAttendanceList != null && this.remove_RevokeLOPAttendanceList.length > 0) {
      this.remove_RevokeLOPAttendanceList.forEach(element => {
        // var isexists = this.remove_RevokeLOPAttendanceList.find(x => x.ReferencedTimeCardId == this.current_Payperiod_Details.TimeCardList[0].Id && x.Id > 0);
        // isexists != undefined && ();
        if (element.ReferencedTimeCardId == this.current_Payperiod_Details.TimeCardList[0].Id && element.Id > 0) {
          element.Modetype = UIMode.Delete;
          // this.remove_RevokeLOPAttendanceList.splice(this.remove_RevokeLOPAttendanceList.indexOf(element), 1);
        }
      });
    }

    console.log('remove_RevokeLOPAttendanceList', this.remove_RevokeLOPAttendanceList);


    // this.isattendanceFullMonthLOP ==1&& this.TeamDetails.IsMustorRollApplicable && this.calculatePADays();
    // let orderby = this.IsAttendanceStampingBasedonLastDate == true ? "desc" : "asc" as any;
    // AttendanceList = _.orderBy(AttendanceList, function (o) { return moment(o.FromDate); }, [orderby]);
    // (this.isattendanceFullMonthLOP == 2 || this.isattendanceFullMonthLOP == 3 )&& (AttendanceList = _.take(AttendanceList, lopdays));
    // if (this.isInt(lopdays) == false) {
    //   var last: any = AttendanceList[AttendanceList.length - 1];
    //   last.IsFirstDayHalf = true;
    //   last.NumberOfDays = 0.5;
    // }

    if (this.revokeLOP_payperiodDetails != null && this.revokeLOP_payperiodDetails.length > 0) {
      var isRevokeExist = this.revokeLOP_payperiodDetails.find(a => a.PayPeriodId == this.selectedPayPeriodId_Revoke);
      isRevokeExist != undefined && (isRevokeExist.RevokeLOPDays_Attendance = [], isRevokeExist.RevokeLOPDays_Attendance = AttendanceList)
      isRevokeExist == undefined &&
        (
          this.revokeLOP_payperiodDetails.push({
            PayPeriodId: this.selectedPayPeriodId_Revoke,
            RevokeLOPDays_Attendance: AttendanceList,
            TimeCardId: this.glbReferencedTimeCardId
          })
        )
    } else {
      this.revokeLOP_payperiodDetails.push({
        PayPeriodId: this.selectedPayPeriodId_Revoke,
        RevokeLOPDays_Attendance: AttendanceList,
        TimeCardId: this.glbReferencedTimeCardId
      })
    }
    console.log('revokeLOP_payperiodDetails', this.revokeLOP_payperiodDetails);
    // this.RevokeLOPAttendance = this.revokLopdays_attendanceList ;
    console.log('RevokeLOPAttendance', this.RevokeLOPAttendance);


  }


  ngOnDestroy() {

  }



  // SME AND OUTSOURCING

  do_Create_PayRun() {
    if (this.selectedItems1.length === 0) {
      this.alertService.showWarning("No Employee record(s) have been selected. Kindly first select");
      return;
    }

    // if (this.selectedItems1.filter(a => Number(Math.sign(a.NetPay)) == -1 || Number(Math.sign(a.NetPay)) == 0).length > 0) {
    //   this.alertService.showWarning("Note: It is not possible to confirm that some employees do not have net compensation details.");
    //   return;
    // }

    let isAvaliable = [];
    isAvaliable = this.selectedItems1.filter(r => environment.environment.IsApplicableStatusForInitiatePayrun.indexOf(Number(r.StatusCode)) >= 0);
    if (isAvaliable.length != this.selectedItems1.length) {
      this.alertService.showWarning('Error : One or more Employee records cannot be initiated because the status is in an invalid state. Please contact your support admin.');
      return;
    }

    this.alertService.confirmSwal1("Confirm Stage?", "Are you sure you want to initiate these employees to the Payrun?", "OK", "Cancel").then((result) => {
      let LstPayRunDetails = [];
      this.loadingScreenService.startLoading();
      let PayRunId = 0;
      this.selectedItems1.forEach(event => {
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
      submitObject.Code = `${this.TeamName}_${this.PayPeriodName}`;
      submitObject.Name = `${this.TeamName}_${this.PayPeriodName}`;
      submitObject.CompanyId = this.sessionDetails.Company.Id;
      submitObject.ClientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
      submitObject.ClientId = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      submitObject.PayPeriodId = this.BehaviourObject_Data.payperiodId;
      submitObject.TeamIds = [];
      this.selectedItems1.forEach(function (item) { submitObject.TeamIds.push(item.teamId) })
      submitObject.TeamIds = _.union(submitObject.TeamIds);
      submitObject.NumberOfEmpoyees = this.selectedItems1.length;
      submitObject.NoOfSaleOrders = 0;
      submitObject.PayRunStatus = PayRunStatus.Intitated;
      submitObject.Id = 0;
      submitObject.LstPayrunDetails = LstPayRunDetails;
      submitObject.ModeType = UIMode.Edit;
      submitObject.ProcessCategory = ProcessCategory.Salary;
      this.payRunModel = _PayRun;
      this.payRunModel.NewDetails = submitObject;
      console.log('PAYRUN MODEL : ', this.payRunModel);
      this.payrollService.PUT_UpsertPayRun(JSON.stringify(this.payRunModel))
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
    this.rowDataService.dataInterface.RowData = this.BehaviourObject_Data;
    this.rowDataService.dataInterface.SearchElementValuesList = [{
      "InputFieldName": "PayRunIds",
      "OutputFieldName": "@PayRunIds",
      "Value": PayRunId,
      "ReadOnly": false
    }];
    console.log('initiate pay urn', this.rowDataService.dataInterface);

    this.BusinessType == 1 ? this.router.navigateByUrl('app/payroll/payrolltransaction/managePayRun') : this.router.navigateByUrl('app/payroll/payrolltransaction/editPayRun')

  }

  /**tax details related popups */
  close_taxDetailsRemarkshistory() {
    $('#popup_TaxDetailsRemarkshistory').modal('hide');
  }

  viewTaxDetialsRemarks() {
    alert("sucess")
    $('#popup_TaxDetailsRemarkshistory').modal('show');
  }

}


