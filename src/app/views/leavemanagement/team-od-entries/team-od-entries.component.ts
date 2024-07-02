import { Component, OnInit, Input, Output, EventEmitter, HostListener, OnDestroy } from '@angular/core';
import { forEach } from 'lodash';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
// formatDate(new Date(), 'yyyy/MM/dd', 'en');
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
declare let $: any;
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import Swal from "sweetalert2";

import {
  subMonths, addMonths, addDays, addWeeks, subDays, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay,
  endOfDay,
} from 'date-fns';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent, CalendarMonthViewDay,
  CalendarView,
} from 'angular-calendar';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { Subject, Observable } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, EmployeeService, FileUploadService, HeaderService, PagelayoutService, PayrollService } from 'src/app/_services/service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Allowance } from 'src/app/_services/model/Payroll/Allowance';
import { BaseModel, UIMode } from 'src/app/_services/model/Common/BaseModel';
import { TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { Attendance, AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { element } from '@angular/core/src/render3';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { GeneratePIS } from 'src/app/_services/model/Payroll/generatePIS';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { EntitlementAvailmentRequestActivity } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequestActivity';
import { EntitlementAvailmentRequest, EntitlementRequestStatus, EntitlementRequestStatusForAllen, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, BsDropDownService, FieldType, Filters, OnEventArgs, FileType } from 'angular-slickgrid';
import { DataSource, PageLayout } from '../../personalised-display/models';
import { RowDataService } from '../../personalised-display/row-data.service';
import { CustomActionFormatterComponent } from 'src/app/shared/modals/customactionformatter/customactionformatter.component';
import { environment } from "../../../../environments/environment";
import { DataSourceType, SearchPanelType } from '../../personalised-display/enums';
import * as JSZip from 'jszip'; //JSZip
import { takeUntil } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';

const highlightingFormatter = (row, cell, value, columnDef, dataContext) => {
  if (value) {
    if (dataContext.Status == 100) {
      return `<span style=" display: inline-block;
          padding: .55em .8em;
          font-size: 90%;
          font-weight: 400;
          line-height: 1;
          text-align: center;
          white-space: nowrap;
          vertical-align: baseline;
          border-radius: .375rem;
          transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #dd9f04;background-color: #fdf3d9;">${dataContext.StatusName}</span>`;
    } else if (dataContext.Status == 400) {
      return `<span style=" display: inline-block;
       padding: .55em .8em;
       font-size: 90%;
        font-weight: 400;
        line-height: 1;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: .375rem;
        transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out; color: #00d97e;
        background-color: #ccf7e5;">${dataContext.StatusName}</span>`;
    }
    else if (dataContext.Status == 200 || dataContext.Status == 300) {
      return `<span style=" display: inline-block;
      padding: .55em .8em;
      font-size: 90%;
      font-weight: 400;
      line-height: 1;
      text-align: center;
      white-space: nowrap;
      vertical-align: baseline;
      border-radius: .375rem;
      transition: color .15s ease-in-out,background-color .15s ease-in-out,border-color .15s ease-in-out,box-shadow .15s ease-in-out;color: #e63757;
      background-color: #fad7dd;">${dataContext.StatusName}</span>`;
    }

  }
};

@Component({
  selector: 'app-team-od-entries',
  templateUrl: './team-od-entries.component.html',
  styleUrls: ['./team-od-entries.component.scss']
})
export class TeamOdEntriesComponent implements OnInit, OnDestroy {

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  spinner: boolean = false;
  _entitlementList: any[] = [];
  _limitedEntitlementList: any[] = [];
  _entitlementAvailmentRequestsApprovals: EntitlementAvailmentRequest[] = [];
  leaveForm: FormGroup;
  selectedEntitlement: EmployeeEntitlement = new EmployeeEntitlement();
  searchText: any = null;
  isOpened: boolean = false;
  page = 1;
  pageSize = 8;
  collectionSize = 0;
  rowData: EntitlementAvailmentRequest = new EntitlementAvailmentRequest();
  selected_LeaveItems: any[] = [];
  selectAll: boolean = false;
  _employeeId: any;
  _employeeName: any;
  // FILTER 

  _employeeList: any[] = [

  ];
  selectedEmployeeId: any = -1;
  _leaveRequestStatusList: any[] = [];
  selectedStatusId: any = 100;
  _requestMonthList: any[] = [];
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  selectedMonthId: any;
  selectedViewId: any = 1;;
  _viewList = [{ id: 1, name: 'List' }, { id: 2, name: 'Card' }];
  _requestYearList: any[] = [{ id: 2020, name: 2020 }, { id: 2021, name: 2021 }, { id: 2022, name: 2022 }];
  selectedYearId: any;
  editbtnFormatter: Formatter;
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
  inEmployeesInitiateList1 = [];
  inEmployeesInitiateList = [];

  inEmployeesInitiateSelectedItems: any[];
  //General
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  code: string;
  columnDefinition: Column[];
  gridOptions: GridOption;
  pagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };
  remainingDays: any = 0;
  count_applied: any = 0;
  count_approved: any = 0;
  count_rejected: any = 0;
  count_totalDays: any = 0;

  IsMusterroll: boolean = false;
  seemoreTxt: any = 'view other OD balances';
  showOtherEntitlment: boolean = false;

  // COMPONENT FILTER LIKE MY REQUEST AND PROXY
  _componentList: any[] = [];
  selectedComponentId: any = 1;
  IsProxyAvailable: boolean = false;
  _proxyUserList: any[] = [];
  selectedProxyUserId: any = -2;
  NameofMonth: any; NameofYear: any;
  // advanced history tab
  viewHistoryText: string = 'View History';
  IsAdvancedView: boolean = false;
  pageTitle: any;
  selectedLeaveType: any;
  isZeroEligibleDays: boolean = false;
  attendanceTypeList: any[] = [];
  DisplayName: any;
  isManagerIdBased: boolean = false;
  isLOP: boolean = false;
  CurrentDateTime: any = null;
  EvtReqId: any = 0;
  IsNegativeUnitAllowed: boolean = false;
  MaxAllowedNegativeBalance: any = 0;
  ActualReamingDayIfNegativeAllowed: any = 0;
  EntitlementDefinitionList: any[] = [];
  isMobileResolution: boolean;
  isAllowedToViewDocument: boolean = true;
  RoleCode: any;

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }

  employeeEntitlement: EmployeeEntitlement = null;
  contentmodalurl: any;

  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  documentURL: any;
  isAllenDigital = false;

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private payrollService: PayrollService,
    private loadingScreenService: LoadingScreenService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private employeeService: EmployeeService,
    private headerService: HeaderService,
    private pageLayoutService: PagelayoutService,
    private rowDataService: RowDataService,
    private bsDropdown: BsDropDownService,
    private router: Router,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
    private cookieService: CookieService

  ) {

    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
      this.IsMusterroll = true;
    } else {
      this.isMobileResolution = false;
      this.IsMusterroll = false;
    }

  }
  ngAfterViewInit() {
    this.detectScreenSize();
  }

  private detectScreenSize() {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
      this.IsMusterroll = true;
    } else {
      this.isMobileResolution = false;
      this.IsMusterroll = false;
    }
  }

  ngOnInit() {
    this.pageTitle =  environment.environment.PageTitleList.find(a => a.Id == -1).Name;
    this.titleService.setTitle('Employee OD Entries');
    this._leaveRequestStatusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
    var obj2 = [200, 500];
    this._leaveRequestStatusList = this._leaveRequestStatusList.filter(i => !obj2.includes(i.id));
    this.makeMonthList();
    this.onRefresh();

  }
  onRefresh() {
    this.attendanceTypeList = this.utilsHelper.transform(AttendanceType) as any;
    this.inEmployeesInitiateList = [];
    this._entitlementAvailmentRequestsApprovals = [];
    this.searchText = null;
    this.selected_LeaveItems = [];
    this.inEmployeesInitiateSelectedItems = [];
    this.selectAll = false;
    this.isOpened = false;
    this.spinner = true;
    this.createForm();
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;

    const BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    const cookieValue = this.cookieService.get('clientCode');
    this.isAllenDigital = (cookieValue.toUpperCase() == "ALLEN" && (BusinessType === 1 || BusinessType === 2)) ? true : false
    
   
    this.selectedComponentId = 1;
    this.selectedProxyUserId = null;
    this.editbtnFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;
      font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center;
      vertical-align: middle;"title="Edit">
      <i class="fa fa-pencil-square-o" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';
    this.code = 'onDutyRequest';

    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        this.isManagerIdBased = true;
        this.get_pagelayout().then((result) => {
          this.Get_EntitlementAvailmentRequestsForApprovalByManagerId(encodedIdx);
        });
      } else {
        this.isManagerIdBased = false;
        this.get_pagelayout().then((result) => {
          this.Get_EntitlementAvailmentRequestsForApproval();
        });
      }
    });


    this.getEntitlementDefinitionDataset();
  }


  inEmployeesInitiateGridReady(angularGrid: AngularGridInstance) {
    this.inEmployeesInitiateGridInstance = angularGrid;
    this.inEmployeesInitiateDataView = angularGrid.dataView;
    this.inEmployeesInitiateGrid = angularGrid.slickGrid;
    this.inEmployeesInitiateGridService = angularGrid.gridService;
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
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
    console.log('SELECTED ITEMS ::', this.inEmployeesInitiateSelectedItems);

  }


  Get_EntitlementAvailmentRequestsForApprovalByManagerId(managerId) {
    this.attendanceService.GetEntitlementAvailmentRequestsForApprovalByManagerId(managerId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result) => {
          console.log('RES ENTITLEMENTLIST REQ APPROVALS MGR ID::', result);
  
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result != null) {
            this._entitlementAvailmentRequestsApprovals = apiResult.Result as any;
  
            let _statusList = this.utilsHelper.transform(this.isAllenDigital ? EntitlementRequestStatusForAllen : EntitlementRequestStatus) as any;
  
            if (this._entitlementAvailmentRequestsApprovals.length > 0) {
              this._entitlementAvailmentRequestsApprovals.forEach(ele => {
                ele['StatusName'] = _statusList.find(z => z.id == ele.Status) != undefined ? _statusList.find(z => z.id == ele.Status).name : '';
                ele['LeaveRequestStatus'] = ele.Status;
                ele['isSelected'] = false;
              });
            }
  
            this._entitlementAvailmentRequestsApprovals = _.orderBy(this._entitlementAvailmentRequestsApprovals, ["AppliedOn"], ["asc"]);
  
            console.log('ENTI ::', this._entitlementAvailmentRequestsApprovals);
            this.selectedProxyUserId = -2;
  
            this.onChange_filter(null, null);
            this.spinner = false;
          } else {
            this.alertService.showWarning('There are no records left.');
            this.spinner = false;
          }
        },
        (err) => {
          console.warn('  ERR ::', err);
        }
      );
  }
  Get_EntitlementAvailmentRequestsForApproval() {
    this.attendanceService.GetOnDutyRequestsForApproval()
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (result) => {
          console.log('RES ENTITLEMENTLIST REQ APPROVALS ::', result);
          
          const apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result != null) {
            this._entitlementAvailmentRequestsApprovals = apiResult.Result as any;
  
            let _statusList = this.utilsHelper.transform(this.isAllenDigital ? EntitlementRequestStatusForAllen : EntitlementRequestStatus) as any;
  
            if (this._entitlementAvailmentRequestsApprovals.length > 0) {
              this._entitlementAvailmentRequestsApprovals.forEach(ele => {
                ele['StatusName'] = _statusList.find(z => z.id == ele.Status) != undefined ? _statusList.find(z => z.id == ele.Status).name : '';
                ele['LeaveRequestStatus'] = ele.Status;
                ele['isSelected'] = false;
              });
            }
  
            this._entitlementAvailmentRequestsApprovals = _.orderBy(this._entitlementAvailmentRequestsApprovals, ["AppliedOn"], ["asc"]);
  
            console.log('ENTI ::', this._entitlementAvailmentRequestsApprovals);
  
            this.selectedProxyUserId = (this.sessionService.getSessionStorage('selectedLeaveProxyId') || this.sessionService.getSessionStorage('selectedLeaveProxyId') == '') ?
              null : this.sessionService.getSessionStorage('selectedLeaveProxyId');
  
            this.selectedProxyUserId = this.selectedProxyUserId ? -2 : null;
  
            this.onChange_filter(null, null);
            this.spinner = false;
          } else {
            this.alertService.showWarning('There are no records left.');
            this.spinner = false;
          }
        },
        (err) => {
          console.warn('  ERR ::', err);
        }
      );
  }
  // PROXY ONCHANGE METHOLOGY WILL HAPPENING 
  async onChange_component(value) {
    this._proxyUserList = [];
    console.log('PROXY :', value);
    if (value.componentId == 2) {
      this._entitlementAvailmentRequestsApprovals.forEach(ele => {
        if (ele.PendingAtUserId != this.UserId && ele.PendingAtUserId != 0) {
          this._proxyUserList.push({
            proxyUserId: ele.PendingAtUserId,
            proxyUserName: ele.PendingAtUserName,
            amountOfRequests: this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId && item.PendingAtUserId == ele.PendingAtUserId).length
          })
        }
      });
      this._proxyUserList = _.uniqBy(this._proxyUserList, 'proxyUserId'); //removed if had duplicate proxyuserid
      this._proxyUserList = this._proxyUserList.filter(a => a.amountOfRequests > 0);
      console.log(' PROXY USER LIST : ', this._proxyUserList);

    } else {
      this.selectedComponentId = value.componentId;
      this.onChange_filter(null, null);
    }
  }
  
  async onChange_proxy(value) {
    if (value.proxyUserId != null && value.proxyUserId != 0) {
      this.selectedProxyUserId = value.proxyUserId;
      this.sessionService.setSesstionStorage('selectedLeaveProxyId', this.selectedProxyUserId);

      this.onChange_filter(null, null);
    }
  }

  async makeanEmployeeList() {
    this._employeeList = [];
    this._employeeList = [{
      employeeId: -1,
      employeeName: 'Everyone'
    }]
    let _requestedEmployees = [];
    await this.inEmployeesInitiateList.forEach(element => {
      _requestedEmployees.push({
        employeeId: element.EmployeeId,
        employeeName: element.EmployeeName
      })
    });
    _requestedEmployees = _.uniqBy(_requestedEmployees, 'employeeId'); //removed if had duplicate employeeid
    this._employeeList = this._employeeList.concat(_requestedEmployees);
    this._employeeList = _.uniqBy(this._employeeList, 'employeeId'); //removed if had duplicate employeeid

  }
  async makeMonthList() {
    var today = new Date();
    let _requestMonthList_local = [];
    _requestMonthList_local = [
      {
        id: -1,
        name: 'Allday'
      }
    ]
    this.selectedYearId = today.getFullYear();
    this.selectedMonthId = (today.getMonth() + 1)
    this.monthNames.forEach(function (value, i) {
      _requestMonthList_local.push({
        id: i + 1,
        name: `${value}`
      })
    });
    this._requestMonthList = _requestMonthList_local;

  }

  async onChange_filter(whichdp, event) {
    let localCountList = [];
    if (this.isManagerIdBased == true) {

      this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals;

    }
    else {
      this._proxyUserList = [
        {
          proxyUserId: -1,
          proxyUserName: `All (${this._entitlementAvailmentRequestsApprovals.length})`,
          amountOfRequests: this._entitlementAvailmentRequestsApprovals.length

        },
        {
          proxyUserId: -2,
          proxyUserName: `My Requests (${this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.UserId).length})`,
          amountOfRequests: this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.UserId).length

        }
      ]


      this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals;
      this._entitlementAvailmentRequestsApprovals.forEach(ele => {
        if (ele.PendingAtUserId != this.UserId && ele.PendingAtUserId != 0) {
          this._proxyUserList.push({
            proxyUserId: ele.PendingAtUserId,
            proxyUserName: `${ele.PendingAtUserName} (${this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId && item.PendingAtUserId == ele.PendingAtUserId).length})`,
            amountOfRequests: this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId && item.PendingAtUserId == ele.PendingAtUserId).length
          })
        }
      });
      this._proxyUserList = _.uniqBy(this._proxyUserList, 'proxyUserId'); //removed if had duplicate proxyuserid
      this._proxyUserList = this._proxyUserList.filter(a => a.amountOfRequests > 0);
      console.log(' PROXY USER LIST : ', this._proxyUserList);
      this.selectedProxyUserId = this.selectedProxyUserId == null || this.inEmployeesInitiateList.length == 0 ? -1 : this.selectedProxyUserId;

      // PROXY SHOULD BE ENABLED HERE 
      if (this._entitlementAvailmentRequestsApprovals.length > 0 && this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId).length > 0) {
        this.IsProxyAvailable = true;
        this.selectedProxyUserId == -2 ? (this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.UserId)) : this.selectedProxyUserId == -1 ? (this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals) :
          (this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.selectedProxyUserId));
        this.selectedProxyUserId = this.inEmployeesInitiateList.length == 0 ? -1 : this.selectedProxyUserId;
      }

    }
    // await this.inEmployeesInitiateList.length > 0 && this.makeanEmployeeList();
    console.log('ENTITLEMNT REQUEST LIST :::  ', this.inEmployeesInitiateList);
    var date = new Date(), y = this.selectedYearId, m = this.selectedMonthId;
    this.NameofMonth = this.monthNames[date.getMonth()];
    this.NameofYear = date.getFullYear();
    var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    var lastDay = new Date(date.getFullYear(), (date.getMonth() + 1) - 1, 0);

    // console.log(' this.inEmployeesInitiateList', this.inEmployeesInitiateList);
    // console.log('this.selectedEmployeeId', firstDay);
    // console.log('this.selectedStatusId', lastDay);
    this.inEmployeesInitiateList = this.inEmployeesInitiateList.filter(a =>
    (moment(a.AppliedFrom).format('YYYY-MM-DD') >= moment(firstDay).format('YYYY-MM-DD') ||
      moment(a.AppliedTill).format('YYYY-MM-DD') <= moment(lastDay).format('YYYY-MM-DD')));
    localCountList = this.inEmployeesInitiateList;
    // this.inEmployeesInitiateList = (this.selectedEmployeeId != -1 && this.selectedMonthId != -1) ?

    //   this.inEmployeesInitiateList.filter(a => a.EmployeeId == this.selectedEmployeeId && a.Status == this.selectedStatusId &&
    //     (moment(a.AppliedFrom).format('YYYY-MM-DD') >= moment(firstDay).format('YYYY-MM-DD') &&
    //       moment(a.AppliedTill).format('YYYY-MM-DD') <= moment(lastDay).format('YYYY-MM-DD')))

    //   : (this.selectedEmployeeId != -1 && this.selectedMonthId == -1) ?

    //     this.inEmployeesInitiateList.filter(a => a.EmployeeId == this.selectedEmployeeId && a.Status == this.selectedStatusId) :

    //     (this.selectedEmployeeId == -1 && this.selectedMonthId == -1) ?

    //       this.inEmployeesInitiateList.filter(a => a.Status == this.selectedStatusId) :

    //       (this.selectedEmployeeId == -1 && this.selectedMonthId != -1) ?
    //         this.inEmployeesInitiateList.filter(a => a.Status == this.selectedStatusId &&
    //           (moment(a.AppliedFrom).format('YYYY-MM-DD') >= moment(firstDay).format('YYYY-MM-DD') &&
    //             moment(a.AppliedTill).format('YYYY-MM-DD') <= moment(lastDay).format('YYYY-MM-DD'))) : this.inEmployeesInitiateList;

    // console.log(' this.inEmployeesInitiateList', this.inEmployeesInitiateList);

    let sum = 0;
    this.count_applied = 0;
    this.count_approved = 0;
    this.count_rejected = 0;
    this.count_totalDays = 0;
    localCountList.forEach(element => {
      if (element.Status == 100) {
        this.count_applied += 1;
      }
      if (element.Status == 400) {
        this.count_approved += 1;
      }
      if (element.Status == 300) {
        this.count_rejected += 1;
      }
      sum += 1;
    });
    this.count_totalDays = sum;
    // this.inEmployeesInitiateList = this.inEmployeesInitiateList.filter(a => a.Status == 100 || a.Status == 400); 
    this.sessionService.setSesstionStorage('selectedLeaveProxyId', this.selectedProxyUserId);

  }

  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {

      this._entitlementList = [];
      // this.employeeService.FetchEmployeeDetailsByEmployeeCode(_employeeId)
      //   .subscribe((employeeObj) => {
      //     const apiResponse: apiResult = employeeObj;
      //     if (apiResponse.Status && apiResponse.Result != null) {
      //       const Object: EmployeeDetails = apiResponse.Result as any;
      //       this._employeeId = Object.Id;
      //       console.log('EMPLOYEE OBJECT :: ', apiResponse);
      this.attendanceService.getEmployeeODList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._limitedEntitlementList = this._entitlementList;

          res(true);
        } else {
          res(false);
        }
      }, err => {
        console.warn('ERR ::', err);
      });
      // }
      // })
    });
    return promise;



  }

  get g() { return this.leaveForm.controls; } // reactive forms validation 

  createForm() {
    this.leaveForm = this.formBuilder.group({
      Id: [0],
      AppliedFrom: [null, Validators.required],
      AppliedTill: [null, Validators.required],
      IsAppliedForFirstHalf: [false],
      IsAppliedFromSecondHalf: [false],
      IsAppliedTillFirstHalf: [false],
      IsAppliedTillSecondHalf: [false],
      EntitlementType: [null],
      Entitlement: [null, Validators.required],
      CalculatedAppliedUnits: [0, Validators.required],
      EligibleUnits: [0],
      ApplierRemarks: [''],
      AppliedOn: [null],
      EmployeeEntitlement: [null],
      OptinalHoliday: [null],
      AdditionalDateInput: [null],
      AdditionalDocumentId: [0],
      AdditionalDocumentName: [""],
      compOffDates: [null],
      relationshipId:[null]
      // ValidatorRemarks: ['',, Validators.required]
    });
  }

  onChange_Entitlement(event) {
    console.log('event', event);

    //program that checks if the number is positive, negative or zero
    this.employeeEntitlement = event;
    this.isLOP = false;
    if (event != undefined && event.DisplayName != 'LOP' && event.AvailableUnits <= 0 && event.Definition.IsNegativeBalanceAllowed == false) {

      this.isZeroEligibleDays = true;
      this.alertService.showWarning('There is no enough balance to apply for On Duty');
      return;
    }

    else {
      this.IsNegativeUnitAllowed = this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).Definition.IsNegativeBalanceAllowed;
      this.MaxAllowedNegativeBalance = this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).Definition.MaxNegativeBalanceAllowed;

      if (event.AvailableUnits <= 0 && event.Definition.IsNegativeBalanceAllowed == true && event.Definition.MaxNegativeBalanceAllowed < 0) {
        this.isZeroEligibleDays = true;
        this.alertService.showWarning('There is no enough balance to apply for On Duty');
        return;
      }

      else if (!isNaN(event.AvailableUnits) && event.AvailableUnits < 0 && event.Definition.IsNegativeBalanceAllowed == true && event.Definition.MaxNegativeBalanceAllowed != 0) {
        // this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).EligibleUnits) + Number(this.leaveForm.get('AppliedUnits').value));
        // alert(this.remainingDays);
        // alert(event.Definition.MaxNegativeBalanceAllowed);
        // this.remainingDays = (parseInt(this.remainingDays) + parseInt(event.Definition.MaxNegativeBalanceAllowed));
        this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).AvailableUnits));
        this.ActualReamingDayIfNegativeAllowed = (parseInt(this.remainingDays) + parseInt(event.Definition.MaxNegativeBalanceAllowed));
        this.remainingDays = (parseInt(this.remainingDays) - parseInt(event.Definition.MaxNegativeBalanceAllowed));
        this.remainingDays = Math.abs(this.remainingDays)


      } else {

      }


      this.DisplayName = event.DisplayName;
      this.isZeroEligibleDays = false;
      this.selectedLeaveType = event.EntitlementId;
      this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits);
      this.leaveForm.controls['Entitlement'].setValue(event.EntitlementId);
      this.leaveForm.controls['EmployeeEntitlement'].setValue(event.Id);
      // if (!isNaN(event.EligibleUnits) && event.EligibleUnits >= 0) {
      //   this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).AvailableUnits);
      // }
      this.isLOP = event.DisplayName == 'LOP' ? true : false;

    }
    // event != undefined ? this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits) : this.leaveForm.controls['EligibleUnits'].setValue(0);
    // event != undefined ? this.selectedLeaveType = event : this.selectedLeaveType = null
  }

  do_revise(rowData) {
    console.log('ROW DATA ::', rowData);
    this.rowData = null;
    this.rowData = rowData;
    this._employeeName = rowData.EmployeeName;
    this.loadingScreenService.startLoading();
    this.get_EmployeeEntitlementList(rowData.EmployeeId).then((result) => {
      if (result) {
        console.log('et', this._entitlementList);
        this._limitedEntitlementList = this._entitlementList;
        this._limitedEntitlementList = this._limitedEntitlementList.filter(i => i.EntitlementId == rowData.EntitlementId);
        this.createForm();
        this.onChange_Entitlement(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId));
        this.IsNegativeUnitAllowed = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).Definition.IsNegativeBalanceAllowed;
        this.MaxAllowedNegativeBalance = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).Definition.MaxNegativeBalanceAllowed;
        // view doc check
        const roles = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).Definition.ProofDisplayRoleCodes;
        this.isAllowedToViewDocument = roles && roles.length > 0 ? roles.includes(this.RoleCode) : true;
        // for compoff
        let utilizationDatesFormattedString = null;
        if (rowData.CompensationDates && rowData.CompensationDates.length) {
          const utilizationDates = rowData.CompensationDates.map(date => date.UtilizationDate);
          utilizationDatesFormattedString = utilizationDates.map(dateString => {
            const date = moment(dateString, "YYYY-MM-DD");
            const formattedDate = date.format("DD-MM-YYYY");
            return formattedDate;
          });
        }
        

        this.leaveForm.patchValue({
          Id: rowData.Id,
          AppliedFrom: new Date(rowData.AppliedFrom),
          AppliedTill: new Date(rowData.AppliedTill),
          IsAppliedForFirstHalf: rowData.IsAppliedForFirstHalf,
          IsAppliedFromSecondHalf: rowData.IsAppliedFromSecondHalf,
          IsAppliedTillFirstHalf: rowData.IsAppliedTillFirstHalf,
          IsAppliedTillSecondHalf: rowData.IsAppliedTillSecondHalf,
          EntitlementType: rowData.EntitlementType,
          Entitlement: rowData.EntitlementId,
          CalculatedAppliedUnits: rowData.CalculatedAppliedUnits,
          ApplierRemarks: rowData.ApplierRemarks,
          AppliedOn: rowData.AppliedOn,
          EmployeeEntitlement: rowData.EmployeeEntitlementId,
          AdditionalDateInput: rowData.AdditionalDate,
          AdditionalDocumentId: rowData.DocumentId,
          AdditionalDocumentName: rowData.DocumentName,
          EligibleUnits: this._entitlementList.length > 0 ? this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits : 0,
          // ValidatorRemarks: rowData.ValidatorRemarks
          compOffDates: utilizationDatesFormattedString,
          relationshipId: rowData.RelationshipName
        });

        if (!isNaN(Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits)) && Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits) <= 0)
        // this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits);
        {
          this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).AvailableUnits));
          this.remainingDays = (parseInt(this.remainingDays) - parseInt(this.MaxAllowedNegativeBalance));
          // alert((parseInt(this.remainingDays) - parseInt(this.MaxAllowedNegativeBalance)));
          // alert(this.remainingDays)          
          this.ActualReamingDayIfNegativeAllowed = (parseInt(this.remainingDays) + parseInt(this.MaxAllowedNegativeBalance));

          this.remainingDays = Math.abs(this.remainingDays);

        }
        else {
          // this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits) + Number(this.leaveForm.get('AppliedUnits').value));
          this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).AvailableUnits);
        }


        this.isOpened = true;
        this.selectedLeaveType = rowData.EntitlementId;
        this.loadingScreenService.stopLoading();
        $('#popup_edit_attendance').modal('show');

      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('No records found!');
      }
    })
  }

  seeClientDetails() {
    this._limitedEntitlementList = this._entitlementList;
    this.seemoreTxt == "Less other leave balances" ? this.showOtherEntitlment = false : this.seemoreTxt == "view other leave balances" ? this.showOtherEntitlment = true : null;

    if (this.showOtherEntitlment == true) {
      this.seemoreTxt = "Less other leave balances"
      this._limitedEntitlementList = this._entitlementList;
    } else {
      this.seemoreTxt = "view other leave balances";
      this._limitedEntitlementList = this._entitlementList;
      console.log(' this._limitedEntitlementList', this._limitedEntitlementList);
      console.log('this.leaveF', this.leaveForm.get('Entitlement').value);


      this._limitedEntitlementList = this._limitedEntitlementList.filter(i => i.EntitlementId == this.leaveForm.get('Entitlement').value);
      console.log(' this._limitedEntitlementList', this._limitedEntitlementList);

    }
  }


  onClickMode(title) {
    title == "MusterRoll" ? this.IsMusterroll = true : this.IsMusterroll = false;

  }

  close_leaverequest_approval_slider() {

    this.isOpened = false;
    $('#popup_edit_attendance').modal('hide');


  }
  getLeaveType(entitlmentleavetypeId) {
    return this._entitlementList.length > 0 ? this._entitlementList.find(a => a.EntitlementId == entitlmentleavetypeId).DisplayName : '';
  }

  do_approve_reject(whichaction) {

    this.common_approve_reject('edit', whichaction, '', 'child');

  }

  do_approve_decline(item, whichaction) {
    this.common_approve_reject('single', whichaction, item, 'parent');
  }

  bulk_approve_reject(whichaction) {

    if (whichaction == true && this.inEmployeesInitiateSelectedItems.filter(a => a.Status == 400).length > 0) {
      this.alertService.showWarning('On Duty request cannot be processed as it has already been approved.')
      return;
    }

    if (whichaction == false && this.inEmployeesInitiateSelectedItems.filter(a => a.Status == 300).length > 0) {
      this.alertService.showWarning('On Duty request cannot be processed as it has already been rejected.')
      return;
    }


    var IsAllowToCancel: boolean = false;
    for (let index = 0; index < this.EntitlementDefinitionList.length; index++) {
      const e = this.EntitlementDefinitionList[index];
      for (let j = 0; j < this.inEmployeesInitiateSelectedItems.length; j++) {
        const ee = this.inEmployeesInitiateSelectedItems[j];
        if (e.EntitlementId == ee.EntitlementId) {
          let formattedADOJ = moment(ee.AppliedFrom).format('YYYY-MM-DD')
          var currentDate = moment().format('YYYY-MM-DD');
          var diff = this.workingDaysBetweenDates1(currentDate, formattedADOJ);
          console.log('DIFF :: ', diff);
          console.log('e', e);

          if (e.IsAllowToCancelPastDayRequest == true && e.MaximumAllowedPastDays > 0 && e.MaximumAllowedPastDays > diff) {
          }
          else {
            IsAllowToCancel = true;
            break;
          }
        }

      }
    }

    if (IsAllowToCancel == true && this.inEmployeesInitiateSelectedItems.filter(a => a.Status == 300 || a.Status == 400).length > 0) {
      var textmsg = whichaction == true ? 'Approved' : 'Rejected';
      this.alertService.showWarning(`On Duty request cannot be canceled - one or more requests, have no authority to cancel the ${textmsg}  OD.`);
      return;
    }


    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
    this.common_approve_reject('Multiple', whichaction, '', 'parent');

  }


  workingDaysBetweenDates1 = (d0, d1) => {

    console.log('d', d0);
    console.log('d1', d1);

    /* Two working days and an sunday (not working day) */
    var holidays = ['2021-07-03', '2021-07-05', '2021-07-07'];
    var startDate = new Date(d0);
    var endDate = new Date(d1);

    var s1 = new Date(startDate);
    var e1 = new Date(endDate);
    // Validate input
    if (moment(endDate).format('YYYY-MM-DD') > moment(startDate).format('YYYY-MM-DD')) {
      return 0;
    }
    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1);  // Start just after midnight
    endDate.setHours(23, 59, 59, 999);  // End just before midnight
    var diff = ((endDate as any) - (startDate as any));  // Milliseconds between datetime objects    
    var days = Math.ceil(diff / millisecondsPerDay);


    while (moment(s1) <= moment(e1)) {
      const weekEndDays = new Date(s1);
      s1 = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD') as any;

    }

    return Math.abs(days);
  }


  validateEAR(jstring, whichaction, whicharea) {

    var isCancellationReqest: boolean = false;
    if (this.rowData.Status == EntitlementRequestStatus.CancelApplied) {
      isCancellationReqest = true;
      // this.CancelEntitlementAvailmentRequest()
    }
    this.loadingScreenService.startLoading();
    let currentDate = new Date();
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = whichaction == false ? 0 : this.rowData.CalculatedAppliedUnits;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(this.rowData.AppliedOn).format('YYYY-MM-DD hh:mm:ss');;
    entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');
    entitlementAvailmentRequest.ValidatedBy = this.UserId;
    entitlementAvailmentRequest.ApplierRemarks = this.rowData.ApplierRemarks;
    entitlementAvailmentRequest.CancellationRemarks = isCancellationReqest ? jstring : '';
    entitlementAvailmentRequest.ValidatorRemarks = isCancellationReqest ? '' : jstring;
    entitlementAvailmentRequest.Status = isCancellationReqest ? EntitlementRequestStatus.CancelApplied : (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved);
    entitlementAvailmentRequest.AppliedBy = this.rowData.AppliedBy;
    entitlementAvailmentRequest.CalculatedAppliedUnits = this.rowData.CalculatedAppliedUnits;
    entitlementAvailmentRequest.AppliedUnits = this.rowData.AppliedUnits;
    entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
    entitlementAvailmentRequest.Id = this.rowData.Id;
    entitlementAvailmentRequest.EmployeeId = this.rowData.EmployeeId;
    entitlementAvailmentRequest.EmployeeEntitlementId = whicharea == 'parent' ? this.rowData.EmployeeEntitlementId : this.leaveForm.get('EmployeeEntitlement').value; //;  this.rowData.EmployeeEntitlementId;
    entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
    entitlementAvailmentRequest.EntitlementId = whicharea == 'parent' ? this.rowData.EntitlementId : this.leaveForm.get('Entitlement').value; //;
    entitlementAvailmentRequest.EntitlementDefinitionId = this.rowData.EntitlementDefinitionId;
    entitlementAvailmentRequest.EntitlementMappingId = this.rowData.EntitlementMappingId;
    entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
    entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
    entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
    entitlementAvailmentRequest.AppliedFrom = moment(new Date(this.rowData.AppliedFrom)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedFromSecondHalf = this.rowData.IsAppliedFromSecondHalf;
    entitlementAvailmentRequest.IsAppliedForFirstHalf = this.rowData.IsAppliedForFirstHalf;
    entitlementAvailmentRequest.AppliedTill = moment(new Date(this.rowData.AppliedTill)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedTillFirstHalf = this.rowData.IsAppliedTillFirstHalf;
    entitlementAvailmentRequest.ActivityList = [];
    entitlementAvailmentRequest.PendingAtUserId = this.rowData.AppliedBy;
    entitlementAvailmentRequest.LastUpdatedOn = this.rowData.LastUpdatedOn; // this.CurrentDateTime ? this.CurrentDateTime : moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
    entitlementAvailmentRequest.ApprovalStatus = (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved)
    entitlementAvailmentRequest.ValidatedUserName = this.UserName;

    console.log('ENTILMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);
    // this.loadingScreenService.stopLoading();
    // return; 
    this.attendanceService.ValidateOnDutyRequest(entitlementAvailmentRequest).
      subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          // whichaction == true ? this.callback_upsertAttendance(entitlementAvailmentRequest) : null;
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();

        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();

        }
        this.close_leaverequest_approval_slider();
        // whichaction == false ? this.onRefresh() : null;
        this.onRefresh()

      }, err => {
        this.loadingScreenService.stopLoading();

      })
  }


  Bulk_validateEAR(item, jstring, whichaction, index): Promise <void> {
    return new Promise((resolve, reject) => {
      item = this._entitlementAvailmentRequestsApprovals.find(a => a.Id == item.Id);
      console.log('ITEM ::', item);
      var isCancellationReqest: boolean = false;
      if (item.Status == EntitlementRequestStatus.CancelApplied) {
        isCancellationReqest = true;
        // this.CancelEntitlementAvailmentRequest()
      }
      this.loadingScreenService.startLoading();
      let currentDate = new Date();
      var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
      entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
      entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
      entitlementAvailmentRequest.ApprovedTill = null;
      entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
      entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
      entitlementAvailmentRequest.ApprovedUnits = whichaction == false ? 0 : item.CalculatedAppliedUnits;
      entitlementAvailmentRequest.ApprovedFrom = null;
      entitlementAvailmentRequest.AppliedOn = moment(item.AppliedOn).format('YYYY-MM-DD hh:mm:ss');;
      entitlementAvailmentRequest.ValidatedOn = moment(item.currentDate).format('YYYY-MM-DD hh:mm:ss');
      entitlementAvailmentRequest.ValidatedBy = this.UserId;
      entitlementAvailmentRequest.ApplierRemarks = item.ApplierRemarks;
      entitlementAvailmentRequest.CancellationRemarks = '';
      entitlementAvailmentRequest.ValidatorRemarks = jstring;
      entitlementAvailmentRequest.Status = isCancellationReqest ? EntitlementRequestStatus.CancelApplied : (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved);
      entitlementAvailmentRequest.AppliedBy = item.AppliedBy;
      entitlementAvailmentRequest.CalculatedAppliedUnits = item.CalculatedAppliedUnits;;
      entitlementAvailmentRequest.AppliedUnits = item.AppliedUnits;
      entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
      entitlementAvailmentRequest.Id = item.Id;
      entitlementAvailmentRequest.EmployeeId = item.EmployeeId;
      entitlementAvailmentRequest.EmployeeEntitlementId = item.EmployeeEntitlementId;
      entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
      entitlementAvailmentRequest.EntitlementId = item.EntitlementId;
      entitlementAvailmentRequest.EntitlementDefinitionId = item.EntitlementDefinitionId;
      entitlementAvailmentRequest.EntitlementMappingId = item.EntitlementMappingId;
      entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
      entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
      entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
      entitlementAvailmentRequest.AppliedFrom = moment(new Date(item.AppliedFrom)).format('YYYY-MM-DD');
      entitlementAvailmentRequest.IsAppliedFromSecondHalf = item.IsAppliedFromSecondHalf;
      entitlementAvailmentRequest.IsAppliedForFirstHalf = item.IsAppliedForFirstHalf;
      entitlementAvailmentRequest.AppliedTill = moment(new Date(item.AppliedTill)).format('YYYY-MM-DD');
      entitlementAvailmentRequest.IsAppliedTillFirstHalf = item.IsAppliedTillFirstHalf;
      entitlementAvailmentRequest.ActivityList = [];
      entitlementAvailmentRequest.PendingAtUserId = item.AppliedBy;
      entitlementAvailmentRequest.LastUpdatedOn = item.LastUpdatedOn; // this.CurrentDateTime ? this.CurrentDateTime : moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
      entitlementAvailmentRequest.ValidatedUserName = this.UserName;
      entitlementAvailmentRequest.ApprovalStatus = (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved)
      console.log('ENTILMENT REQUEST APPROVAL 2:: ', entitlementAvailmentRequest);
      //     this.loadingScreenService.stopLoading();
      // return;
      this.attendanceService.ValidateOnDutyRequest(entitlementAvailmentRequest).
        subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            // whichaction == false ? null : this.callback_upsertAttendance(entitlementAvailmentRequest);
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(apiResult.Message);
            resolve();
          } else {
            this.alertService.showWarning(apiResult.Message);
            this.loadingScreenService.stopLoading();
            resolve();
          }
  
          index != 'Multiple' ? this.close_leaverequest_approval_slider() : null;
          index != 'Multiple' ? this.onRefresh() : null;
  
        }, err => {
          this.loadingScreenService.stopLoading();
          reject(err);
        })
      })
  }




  // selectAll_Leave(event: any) {
  //   this.selected_LeaveItems = [];
  //   this._entitlementAvailmentRequestsApprovals.forEach(e => {
  //     event.target.checked == true ? e.isSelected = true : e.isSelected = false
  //   });
  //   if (event.target.checked) {
  //     this._entitlementAvailmentRequestsApprovals.forEach(e => {
  //       this.selected_LeaveItems.push(e);
  //     });
  //   } else {
  //     this.selected_LeaveItems = [];
  //   }
  // }


  // onChangeCheckbox(obj, event) {
  //   let updateItem = this._entitlementAvailmentRequestsApprovals.find(i => i.Id == obj.Id);
  //   let index = this.selected_LeaveItems.indexOf(updateItem);
  //   if (index > -1) {
  //     this.selected_LeaveItems.splice(index, 1);
  //   }
  //   else {
  //     this.selected_LeaveItems.push(obj);
  //   }
  //   var totalLength = 0;
  //   this._entitlementAvailmentRequestsApprovals.forEach(e => {
  //     totalLength = totalLength + 1;;
  //   });
  //   if (totalLength === this.selected_LeaveItems.length) {
  //     this.selectAll = true;
  //   }
  //   else {
  //     this.selectAll = false;
  //   }

  // }

  viewEntitlement() {
    this.loadingScreenService.startLoading();
    this.get_EmployeeEntitlementList(this.inEmployeesInitiateSelectedItems[0].EmployeeId).then((result) => {
      console.log('ENTIT :', this._entitlementList);
      this.loadingScreenService.stopLoading();
      $('#popup_viewEntitlement').modal('show');
    })
  }
  close_entitlementbalance() {
    $('#popup_viewEntitlement').modal('hide');

  }

  common_approve_reject(_index, whichaction, item, whicharea) {

    console.log(parseFloat(this.leaveForm.get('CalculatedAppliedUnits').value) > parseFloat(this.remainingDays));
    console.log(parseFloat(this.leaveForm.get('CalculatedAppliedUnits').value));
    console.log(parseFloat(this.remainingDays));

    // ! Commenting because the validation will happen on the API side.
    // if (_index != 'Multiple' && this.rowData.Status != 600 && !this.IsNegativeUnitAllowed && this.isZeroEligibleDays) {
    //   this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
    //   return;
    // }

    // else if (_index != 'Multiple' && this.rowData.Status != 600 && this.IsNegativeUnitAllowed && parseFloat(this.leaveForm.get('CalculatedAppliedUnits').value) > parseFloat(this.remainingDays)) {
    //   this.alertService.showWarning("Maximum allowed leave balance is currently insufficient");
    //   return;
    // }

    // return;

    this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea);

    // this.loadingScreenService.startLoading();
    // if (this.EvtReqId != null && this.EvtReqId != 0) {
    //   this.ValidateLeaveRequestIsValidToUpdate().then((validatedResponse) => {
    //     this.loadingScreenService.stopLoading();
    //     if (validatedResponse) {
    //       this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea);
    //     }
    //   })
    // } else {
    //   this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea);
    // }

  }



  tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea) {

    // this.loadingScreenService.stopLoading();


    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      $('#popup_edit_attendance').modal('hide');
      if (!whichaction) {
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
            _index == 'single' ? this.Bulk_validateEAR(item, jsonStr, whichaction, 'single') : _index == 'edit' ?
              this.validateEAR(jsonStr, whichaction, whicharea) : this.callMultipleFuction(whichaction, jsonStr);

          } else if (
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }
      else {
        _index == 'single' ? this.Bulk_validateEAR(item, '', whichaction, 'single') : _index == 'edit' ?
          this.validateEAR('', whichaction, whicharea) : this.callMultipleFuction(whichaction, '');
      }

    }).catch(error => {

    });
  }

  async callMultipleFuction(whichaction, jsonStr) {

    this.loadingScreenService.startLoading();
    let count = 0;
    // this.inEmployeesInitiateSelectedItems.length > 0 && this.inEmployeesInitiateSelectedItems.forEach(item => {
    //   count = count + 1;
    //   console.log('count :', count);

    //   this.Bulk_validateEAR(item, '', whichaction, 'Multiple')

    // });

    for (let i = 0; i < this.inEmployeesInitiateSelectedItems.length; i++) {
      count = count + 1;
      console.log('count :', count);
      await this.Bulk_validateEAR(this.inEmployeesInitiateSelectedItems[i], '', whichaction, 'Multiple');
    }

    if (count == this.inEmployeesInitiateSelectedItems.length) {
      this.onRefresh();
      this.close_leaverequest_approval_slider();

    }

  }


  /* #region EVERTHING THAT WORKS PAGELAYOUT IS WRITTERN HERE  */

  get_pagelayout() {


    const promise = new Promise((res, rej) => {


      this.pageLayout = null;
      this.spinner = true;
      this.titleService.setTitle('Loading...');
      this.headerService.setTitle('');
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.pageLayout = data.dynamicObject;
          console.log('OD REQUEST LIST ::', this.pageLayout);
          this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
          this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
          this.setGridConfiguration();
          if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
          res(true)
        }
        else {
          res(true)
          this.titleService.setTitle('HR Suite');
        }

      }, error => {
        console.log(error);
        this.spinner = false;
        this.titleService.setTitle('HR Suite');
      }
      );
    })
    return promise;
  }


  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      // let  collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }];
      this.inEmployeesInitiateColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    this.inEmployeesInitiateGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    this.inEmployeesInitiateColumnDefinitions.forEach(ele => {
      if (ele.id == 'LeaveRequestStatus') {
        ele.filter = {
          collection: [{ value: '', label: 'select' }, { value: 100, label: 'Applied' }, { value: 200, label: 'Cancelled' }, { value: 300, label: 'Rejected' }, { value: 400, label: 'Approved' }, { value: 500, label: 'Availed' }, { value: 600, label: 'CancellationInProgress' }],
          model: Filters.singleSelect,
        }
      }
    });
    this.inEmployeesInitiateGridOptions.draggableGrouping = {
      dropPlaceHolderText: 'Drop a column header here to group by the column',
      // groupIconCssClass: 'fa fa-outdent',
      deleteIconCssClass: 'fa fa-times',
      // onGroupChanged: (e, args) => this.onGroupChange(),
      // onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    }

  }


  getDataset() {
    this.selectedItems = [];
    this.inEmployeesInitiateList = [];
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        // this.inEmployeesInitiateList = JSON.parse(dataset.dynamicObject);
        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }

  getEntitlementDefinitionDataset() {
    this.EntitlementDefinitionList = [];
    let datasource: DataSource = {
      Name: "GetEntitlementDefinition",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    var searchConfiguration = {
      SearchElementList: [

      ],
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: true,
      SaveSearchElementsLocally: false
    }

    this.pageLayoutService.getDataset(datasource, searchConfiguration as any).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.EntitlementDefinitionList = JSON.parse(dataset.dynamicObject);
        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }


  onCellClicked(e, args) {
    const metadata = this.inEmployeesInitiateGridInstance.gridService.getColumnFromEventArguments(args);
    this.rowData = null;
    this.EvtReqId = null;
    this.CurrentDateTime = null;
    if (metadata.columnDef.id === 'decline_req' && (metadata.dataContext.Status == 100 || metadata.dataContext.Status == 600)) {
      this.rowData = metadata.dataContext;
      this.DisplayName = metadata.dataContext.EntitlementCode;
      this.EvtReqId = metadata.dataContext.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);

      this.common_approve_reject('edit', false, (metadata.dataContext), 'parent');
      return;
    }
    else if (metadata.columnDef.id === 'approve_req' && (metadata.dataContext.Status == 100 || metadata.dataContext.Status == 600)) {
      this.rowData = metadata.dataContext;
      this.DisplayName = metadata.dataContext.EntitlementCode;
      this.EvtReqId = metadata.dataContext.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);
      this.common_approve_reject('edit', true, (metadata.dataContext), 'parent');
      return;
    }
    else if (metadata.columnDef.id === 'regularize_req' && (metadata.dataContext.Status == 100 || metadata.dataContext.Status == 600)) {
      this.selectedLeaveType = metadata.dataContext.EntitlementId;
      this.DisplayName = metadata.dataContext.EntitlementCode;
      this.EvtReqId = metadata.dataContext.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);
      this.do_revise(metadata.dataContext);
      // this.bsDropdown.render({
      //   component: CustomActionFormatterComponent,
      //   args,
      //   offsetLeft: 92,
      //   offsetDropupBottom: 15,
      //   parent: this, // provide this object to the child component so we can call a method from here if we wish
      // });
      return;
    }
    else {
      return;
      // this.alertService.showWarning('Action was blocked : Invalid Leave request - that  leave request is already approved/rejected.')
    }
  }

  /* #endregion */

  viewAdvancedHistory() {
    this.viewHistoryText == '>> Advanced History' ? this.IsAdvancedView = true : this.IsAdvancedView = false;
    if (this.IsAdvancedView == true) {
      this.viewHistoryText = '<< My Request View';
    } else {
      this.viewHistoryText = '>> Advanced History';
    }
  }

  exportToExcel() {


    // let exportExcelDate = [];

    // console.log('this.columnDefinition', this.inEmployeesInitiateColumnDefinitions);
    // console.log('sele', this.selectedItems);
    // var objects = new Array();
    // this.inEmployeesInitiateColumnDefinitions.forEach(e => {
    //   objects[e.name] = ;
    //   exportExcelDate.push(objects);
    // });

    // console.log('test', exportExcelDate);

    // this.columnDefinition DisplayName, Id,
    //   this.selectedItems.forEach(element => {

    //     exportExcelDate.push({
    //       ProductCode: element.ProductCode,
    //       ProductName: element.DisplayName,
    //       Monthly: element.Value,
    //       Annually: (Number(element.Value) * 12)
    //     })


    //   });


    // var howmany = 10;

    // for (var i = 0; i < this.columnDefinition.length; i++) {
    //   let index = this.columnDefinition[i];
    //   objects[index.field] = null;

    // }



    this.inEmployeesInitiateGridInstance.excelExportService.exportToExcel({
      filename: `ODEntries${this.NameofMonth}${this.NameofYear}`,
      format: FileType.xlsx
    });
  }


  enumerateDaysBetweenDates(startDate, endDate) {
    const promise = new Promise((resolve, reject) => {
      let date = [];
      while (moment(startDate) <= moment(endDate)) {
        const weekEndDays = new Date(startDate);
        // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {     
        // }
        date.push(
          {
            _startDate: startDate,
            _endDate: startDate,
            _IsFirstDayHalf: false,
            _IsSecondDayHalf: false,
          });
        startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
        // }
      }
      return resolve(date);

    })
    return promise;
  }



  callback_upsertAttendance(entitlementAvailmentRequest) {
    const promise = new Promise((resolve, reject) => {
      this.enumerateDaysBetweenDates(entitlementAvailmentRequest.AppliedFrom, entitlementAvailmentRequest.AppliedTill).then((result) => {
        let daterangeList = [];
        let attendanceList = [];
        daterangeList = result as any;
        console.log(' BUILD RESULT ::', daterangeList);

        daterangeList.forEach(element => {
          let attendance = new Attendance();
          attendance.Id = 0;
          attendance.TimeCardId = 0;
          attendance.FromDate = moment(element._startDate).format('YYYY-MM-DD'); // moment(new Date(element._startDate)).format('YYYY-DD-MM')
          attendance.ToDate = moment(element._endDate).format('YYYY-MM-DD');// moment(new Date(element._endDate)).format('YYYY-DD-MM')
          attendance.NumberOfDays = 1
          attendance.NumberOfHours = 0
          attendance.IsFirstDayHalf = false
          attendance.IsSecondDayHalf = false
          attendance.Type = this.attendanceTypeList.find(a => a.name == this.DisplayName).id; // AttendanceType.SL;
          attendance.ReferencedTimeCardId = 0
          attendance.Modetype = UIMode.Edit;
          attendance.EmployeeId = entitlementAvailmentRequest.EmployeeId;
          attendance.AttendancePeriodId = entitlementAvailmentRequest.ApplicableAttendancePeriodId;
          attendanceList.push(attendance)
        });

        let lstIndex = attendanceList.length;

        if (entitlementAvailmentRequest.IsApprovedForFirstHalf == true) {
          attendanceList[0].IsFirstHalf = true;
        }
        if (entitlementAvailmentRequest.IsApprovedFromSecondHalf == true) {
          attendanceList[0].IsSecondDayHalf = true;
        }
        if (entitlementAvailmentRequest.IsApprovedTillFirstHalf == true) {
          attendanceList[lstIndex].IsFirstHalf = true;
        }
        if (entitlementAvailmentRequest.IsApprovedTillSecondHalf == true) {
          attendanceList[lstIndex].IsSecondDayHalf = true;
        }

        console.log('Attendance ::', attendanceList);

        this.attendanceService.UpsertTimecardAttendance(attendanceList).
          subscribe((result) => {
            let apiResult: apiResult = result;
            resolve(true);
            if (apiResult.Status) {
              // this.alertService.showSuccess(apiResult.Message);
            } else {
              // this.alertService.showWarning(apiResult.Message);
            }
            this.loadingScreenService.stopLoading();
            // index != 'Multiple' ? this.close_leaverequest_approval_slider() : null;
            // index != 'Multiple' ? this.onRefresh() : null;

          }, err => {
            this.loadingScreenService.stopLoading();

          })
      });
    })
    return promise;
  }

  onClose() {
    sessionStorage.removeItem('IsProxy');
    this.router.navigateByUrl('app/listing/ui/leaveRequestList')
  }

  ValidateLeaveRequestIsValidToUpdate() {
    const promse = new Promise((res, rej) => {
      // this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
      this.attendanceService.ValidateLeaveRequestIsValidToUpdate(this.EvtReqId, this.CurrentDateTime)
        .subscribe((result) => {
          console.log('validateion respn', result);
          let apiresult: apiResult = result;
          if (apiresult.Status && apiresult.Result != null) {
            var validatedResult = JSON.parse(apiresult.Result);
            if (validatedResult[0].IsValidForUpdate == false) {
              this.alertService.showWarning(validatedResult[0].Remarks);
              res(false);
              return;
            } else {
              res(true);
            }
          } else {

          }



        })
    })
    return promse;
  }


  isZipFile() {
    const documentName = this.leaveForm.get('AdditionalDocumentName').value;
    const ext = documentName.split('.').pop().toUpperCase();
    return ext === "ZIP";
  }

  downloadAttachments() {
    const documentName = this.leaveForm.get('AdditionalDocumentName').value;
    const documentId = this.leaveForm.get('AdditionalDocumentId').value;

    this.loadingScreenService.startLoading();

    this.objectApi.downloadObjectAsBlob(documentId)
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
          this.handleDownloadError();
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

  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  viewAttachments() {

    var fileNameSplitsArray = this.leaveForm.get('AdditionalDocumentName').value.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    console.log('fileNameSplitsArray', fileNameSplitsArray);
    console.log('ext', ext);

    if (ext.toUpperCase().toString() == "ZIP") {
      this.getFileList();
      return;
    } else {


      this.loadingScreenService.startLoading();
      const documentName = this.leaveForm.get('AdditionalDocumentName').value;
      const documentId = this.leaveForm.get('AdditionalDocumentId').value;
      var contentType = this.objectApi.getContentType(documentName);
      if (contentType === 'application/pdf' || contentType.includes('image')) {

        return this.objectApi.getObjectById(documentId).subscribe(
          (dataRes: apiResult) => {
            this.loadingScreenService.stopLoading();
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              const Message = dataRes.Message ? dataRes.Message : 'Couldn\'t fetch data !'
              return this.alertService.showWarning(Message);
            }
            let file = null;
            var objDtls = dataRes.Result as any;
            const byteArray = atob(objDtls.Content);
            const blob = new Blob([byteArray], { type: contentType });
            file = new File([blob], objDtls.ObjectName, {
              type: contentType,
              lastModified: Date.now()
            });
            if (file !== null) {

              var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);

              if (contentType.includes('image')) {
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              } else {
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              }

              var modalDiv = $('#documentviewer2');
              modalDiv.modal({ backdrop: false, show: true });

            }
          },
          (err) => {
            this.loadingScreenService.stopLoading();

          }
        );


      }
      else if (contentType === 'application/msword' ||
        contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        var appUrl = this.objectApi.getUrlToGetObject(documentId);
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
        this.loadingScreenService.stopLoading();
        var modalDiv = $('#documentviewer2');
        modalDiv.modal({ backdrop: false, show: true });
      }

    }
  }


  close_documentviewer2() {
    this.contentmodalurl = null;
    $("#documentviewer2").modal('hide');

  }



  getFileList() {
    console.log('coming');


    this.loadingScreenService.startLoading();

    let DocId = this.leaveForm.get('AdditionalDocumentId').value;
    this.docList = [];
    try {


      this.objectApi.getObjectById(DocId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.loadingScreenService.stopLoading();
            const Message = dataRes.Message ? dataRes.Message : 'Couldn\'t fetch data !'
            return this.alertService.showWarning(Message);
          }
          this.docList = [];
          var objDtls = dataRes.Result;
          console.log(objDtls);
          var zip = new JSZip();
          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);
                  this.loadingScreenService.stopLoading();
                  var modalDiv = $('#documentviewer');
                  modalDiv.modal({ backdrop: false, show: true });


                  $('#carouselExampleCaptions').carousel()

                });
              }
            });
          });


        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }

  close_documentviewer3() {

    $("#documentviewer").modal('hide');

  }


  getTargetOffSetImage(item: any) {

    const promise = new Promise((res, rej) => {
      var contentType = this.objectApi.getContentType(item.name);
      var blob = new Blob([item._data.compressedContent]);
      var file = new File([blob], item.name, {
        type: typeof item,
        lastModified: Date.now()
      });
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64String = (reader.result as string).split(",")[1];
        if (file !== null) {
          var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(' DOCUMENT URL :', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl })
        }
      }
    })


    return promise;
  }
}

