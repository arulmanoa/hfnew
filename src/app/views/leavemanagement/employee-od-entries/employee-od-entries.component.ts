import { Component, OnInit, Input, Output, EventEmitter, ViewChild, HostListener, OnDestroy } from '@angular/core';
import { forEach } from 'lodash';
import * as moment from 'moment';
import { DatePipe } from '@angular/common';
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
import { Subject, Observable, Subscription } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, CommonService, EmployeeService, FileUploadService, PayrollService, SearchService } from 'src/app/_services/service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl, NgForm } from '@angular/forms';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Allowance } from 'src/app/_services/model/Payroll/Allowance';
import { ApiResponse, BaseModel, UIMode } from 'src/app/_services/model/Common/BaseModel';
import { TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { Attendance, AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { element, elementStyleProp } from '@angular/core/src/render3';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { GeneratePIS } from 'src/app/_services/model/Payroll/generatePIS';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { EntitlementAvailmentRequestActivity } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequestActivity';
import { EntitlementAvailmentRequest, EntitlementRequestStatus, EntitlementRequestStatusForAllen, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, FieldType, Filters, OnEventArgs } from 'angular-slickgrid';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import FileSaver from 'file-saver';
import { isGuid } from 'src/app/utility-methods/utils';
import { takeUntil } from 'rxjs/operators';
import * as JSZip from 'jszip'; //JSZip
import { switchMap, finalize, catchError, tap, mergeMap } from 'rxjs/operators';
import { of } from 'rxjs';
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
    else if (dataContext.Status == 600) {
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
    }
  }
};

@Component({
  selector: 'app-employee-od-entries',
  templateUrl: './employee-od-entries.component.html',
  styleUrls: ['./employee-od-entries.component.scss']
})
export class EmployeeOdEntriesComponent implements OnInit {

  @ViewChild('formDirective') private formDirective: NgForm;
  private destroy$ = new Subject<void>();

  leaverequest_slider: boolean = false;
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any = null;
  spinner: boolean = false;
  _entitlementList: any[] = [];
  _entitlementAvailmentRequests: EntitlementAvailmentRequest[] = [];
  _employeeId: any;
  _employeeDOJ: any = null;

  leaveForm: FormGroup;
  selectedEntitlement: EmployeeEntitlement = new EmployeeEntitlement();
  _from_minDate: Date;
  _till_minDate: Date;
  minDateForAdditionalDateInput: Date = new Date();
  isDisabledTillDate: boolean = false;
  isDisabledTillFirstHalf: boolean = false;
  isDisabledFromSecondHalf: boolean = false;

  submitted: boolean = false;
  searchText: any = null;

  IsShowBalanceInUI: boolean = false;
  IsLossOfPay: boolean = false;

  count_applied: any = 0;
  count_approved: any = 0;
  count_rejected: any = 0;
  count_totalDays: any = 0;

  approveFormatter: Formatter;
  rejectFormatter: Formatter;
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

  remainingDays: any = 0;
  requestedDays: any = 0;
  leaveTypeName: any;
  eligibaleDays: any = 0;
  IsMusterroll: boolean = false;
  preRequestedDays: any = 0
  availableDays: any = 0;
  isinvalidDate: boolean = false;
  EmploymentContracts: any;
  LstHolidays: any[] = [];
  LstNonPayabledays: any[] = [];
  CurrentDateTime: any = null;
  EvtReqId: any = 0;
  isSameDate: boolean = false;
  isDatesArecontinuity: boolean = true;
  tobeDisabledCheckbox: boolean = false;
  IsNegativeUnitAllowed: boolean = false;
  MaxAllowedNegativeBalance: any = 0;
  weekOffs: any[] = [];
  weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  tabName: any;

  _employeeBasicDetails: any;
  LstEntitlementAvailmentRequestDetails: any[] = []
  _Session_EmployeeId: any = 0;
  selectedApprovedLeaveRequests: any[] = [];
  isMobileResolution: boolean;
  presentMonth: number = 0;
  presentYear: number = 0;
  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }
  _Entitlement: FormControl = new FormControl({ value: '', disabled: true });

  employeeEntitlement: EmployeeEntitlement = null; // new EmployeeEntitlement();
  optionalHolidayList = [
    // { "Id": 1853, "HolidayName": "KOTA_Diwali - Nov 11, 2023" }, { "Id": 1854, "HolidayName": "KOTA_Diwali - Nov 12, 2023" }, { "Id": 1855, "HolidayName": "KOTA_Diwali - Nov 13, 2023" }
  ];

  CompanyId: number = 0;
  BusinessType: number = 0;
  isLoading: boolean = false;
  unsavedDocumentLst = [];

  private EntitlementEndDateSubscription: Subscription;
  private unsubscribe$ = new Subject<void>();

  weekOffDays = [0, 2];


  contentmodalurl: any;

  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  documentURL: any;

  zipFileContent: ArrayBuffer;
  pdfSrc: SafeResourceUrl;

  availableCompOffDates: any[] = [];
  availableUnitsForCompOff: number = 0;
  leaveDaysApplied: string = '';
  isAllenDigital: boolean = false;

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
    private searchService: SearchService,
    private utilityService: UtilityService,
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private datePipe: DatePipe,
    private cookieService: CookieService
  ) {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
      this.IsMusterroll = true;
    } else {
      this.isMobileResolution = false;
      this.IsMusterroll = false;
    }
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
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

    this.selectedApprovedLeaveRequests = [];
    this.weekOffs = [];
    this._employeeDOJ = null;
    this.titleService.setTitle('Employee Leave Entries');
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    if (this.sessionDetails.UIRoles[0].Role.Code.toUpperCase() == "EMPLOYEE") {
      this._Session_EmployeeId = this.sessionDetails.EmployeeId;
    }
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.sessionDetails.Company.Id;
    this.searchText = null;

    const cookieValue = this.cookieService.get('clientCode');
    this.isAllenDigital = (cookieValue.toUpperCase() == "ALLEN" && (this.BusinessType === 1 || this.BusinessType === 2)) ? true : false
    
    this.approveFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;
    font-weight: 800 !important;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
    text-align: center;
    vertical-align: middle;
" title="View">
      <i class="fa fa-eye" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>` : '<i class="mdi mdi-checkbox-multiple-marked-outline" style="cursor:pointer"></i>';
    this.rejectFormatter = (row: number, cell: number, value: any, columnDef: Column, dataContext: any, grid?: any) =>
      value && dataContext.Status != 600 ? `<a href="javascript:;" class="btn action-edit" style="margin-right: 5px;font-size: 12px;
      font-weight: 800 !important;background: #F5F5F5;
      min-width: 32px;
      min-height: 32px;
      padding: 4px;
      border-radius: 50%;display: inline-block;color: #212529;user-select: none;border: 1px solid transparent;line-height: 1.5;    transition: color .15s ease-in-out, background-color .15s ease-in-out, border-color .15s ease-in-out, box-shadow .15s ease-in-out;
      text-align: center;
      vertical-align: middle;margin-right :5px
  " title="Cancel">
      <i class="fa fa-ban" aria-hidden="true" style="font-size: 16px;color: #838383;"></i>
    </a>
` : '---';

    this.loadinEmployeesInitiateRecords1();
    this.createForm();
    this.onRefresh();
  }
  onRefresh() {
    this.resetValues();
    this.spinner = true;
    this.setupDateMinValues();
    this.updateValidationForFormFields();
    this.fetchOptionalHolidays();
    this.fetchWeekOffRecords();
    this.fetchEmployeeEntitlementList();
  }

  private resetValues() {
    this.presentMonth = new Date().getMonth() + 1;
    this.presentYear = new Date().getFullYear();
    this.LstEntitlementAvailmentRequestDetails = [];
    this.inEmployeesInitiateSelectedItems = [];
    this.EmploymentContracts = null;
    this._entitlementList = [];
    this.inEmployeesInitiateList = [];
    this._entitlementAvailmentRequests = [];
    this.leaveDaysApplied  = '';
  }

  private setupDateMinValues() {
    this._from_minDate = new Date();
    this._till_minDate = new Date();
  }

  private updateValidationForFormFields() {
    const fields = ['ApplierRemarks', 'AppliedFrom', 'AppliedUnits', 'AppliedTill'];
    fields.forEach(field => this.updateValidation(false, this.leaveForm.get(field)));
  }

  private fetchOptionalHolidays() {
    this.GetOptionalHolidaysForAnEmployee();
  }

  private fetchWeekOffRecords() {
    this.getWeekOff().then(() => console.log('Week Off Task Complete!'));
  }

  private fetchEmployeeEntitlementList() {
    this.get_EmployeeEntitlementList();
  }

  fetchAvailableDatesForCompOffForAnEmployee() {
    const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.attendanceService.getAvailableDatesForCompOffForAnEmployee(defaultClientId, defaultContractId, this._Session_EmployeeId)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((response) => {
      console.log('COMP OFF RESP ::', response);
      this.availableCompOffDates = response.Status && response.Result && response.Result != '' ? JSON.parse(response.Result).map((element, idx) => ({...element, Id: idx + 1 })) : [];
    }, (error) => {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("An error occurred while fetching comp off dates.");
      console.error('Error', error);
    })
  }

  getWeekOff() {
    this.weekOffs = [];

    const storedWeekOffs = this.sessionService.getSessionStorage('weekOffs');

    if (storedWeekOffs == null || storedWeekOffs == undefined) {
      return new Promise<boolean>((resolve, reject) => {
        this.attendanceService.GetWeekOffByEmployeeId(this._Session_EmployeeId)
          .subscribe((response) => {
            console.log('WEEK OFF RESP ::', response);
            const apiResult: apiResult = response;

            if (apiResult.Status && apiResult.Result != null) {
              const weekOff = apiResult.Result[0] as any;

              this.processWeekOffDays(weekOff);

              this.sessionService.delSessionStorage('weekOffs');
              this.sessionService.setSesstionStorage('weekOffs', this.weekOffs);

              console.log('WEEKOFF DAYS ::', this.weekOffs);
              resolve(true);
            } else {
              resolve(false);
            }
          });
      });
    } else {
      this.weekOffs = JSON.parse(storedWeekOffs);
      return Promise.resolve(true);
    }
  }

  private processWeekOffDays(weekOff: any) {
    const daysMapping = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    daysMapping.forEach((day, index) => {
      if (weekOff[day]) {
        this.weekOffs.push(index);
      }
    });
  }


  async GetOptionalHolidaysForAnEmployee() {
    this.optionalHolidayList = [];
    try {
      const result = await this.employeeService.GetOptionalHolidaysForAnEmployee(this._Session_EmployeeId)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      console.log('HOLIDAY LIST ::', result);

      if (result.Status && result.Result) {
        this.optionalHolidayList = JSON.parse(result.Result);
      }
    } catch (error) {
      console.error('Error fetching optional holidays:', error);
    }
  }
  // async get_EmployeeEntitlementList() {
  //   try {
  //     const employeeDetailsResult = await this.employeeService.GetEmployeeRequiredDetailsById(this._Session_EmployeeId, EmployeeMenuData.Profile)
  //       .pipe(takeUntil(this.destroy$))
  //       .toPromise();

  //     const apiResult: apiResult = employeeDetailsResult;
  //     console.log('EMP REQUIRED DATA PROFILE ::', apiResult);

  //     if (apiResult.Status && apiResult.Result != null) {
  //       const jsonObj: EmployeeDetails = apiResult.Result as any;
  //       this.processEmployeeDetails(jsonObj);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching employee details:', error);
  //   }
  // }

  async get_EmployeeEntitlementList() {
    try {
      const profileResult = await this.employeeService.GetEmployeeRequiredDetailsById(this._Session_EmployeeId, EmployeeMenuData.Profile)
        .toPromise();

      console.log('EMP REQUIRED DATA PROFILE ::', profileResult);

      const apiResultProfile: apiResult = profileResult;
      if (apiResultProfile.Status && apiResultProfile.Result != null) {
        const employeeDetails: EmployeeDetails = apiResultProfile.Result as any;

        this._employeeId = employeeDetails.Id;
        this._employeeDOJ = employeeDetails.EmploymentContracts[0].StartDate;

        this._from_minDate = new Date(this._employeeDOJ);
        this._from_minDate.setMonth(this._from_minDate.getMonth());
        this._from_minDate.setDate(this._from_minDate.getDate());
        this._from_minDate.setFullYear(this._from_minDate.getFullYear());

        const entitlementListResult = await this.attendanceService.getEmployeeODList(this._employeeId, EntitlementType.Leave)
          .toPromise();

        console.log('RES OD ENTITLEMENTLIST::', entitlementListResult);

        const apiResultEntitlementList: apiResult = entitlementListResult;
        if (apiResultEntitlementList.Status && apiResultEntitlementList.Result && apiResultEntitlementList.Result.length) {
          this._entitlementList = apiResultEntitlementList.Result as any;
          this.leaveForm.controls['Entitlement'].setValue(this._entitlementList[0].Id);
          this.selectedEntitlement = this._entitlementList[0];
          this.getOnDutyRequests();
        } else {
          this.spinner = false
          if (apiResultEntitlementList.Status) {
            return this.alertService.showWarning('On Duty Entitlement not found !')
          } else {
            return this.alertService.showWarning(apiResultEntitlementList.Message);
          }
        }

        this.GetHolidayCalendarBasedOnApplicability(employeeDetails);
      }
    } catch (error) {
      console.error('Error fetching employee entitlement details:', error);
    }
  }
  async getOnDutyRequests() {
    try {
      const result = await this.attendanceService.getOnDutyRequests(this._employeeId)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.handleEntitlementRequests(result);
    } catch (error) {
      console.error('Error fetching entitlement availment requests:', error);
      this.alertService.showWarning('Something went wrong! ' + error);
      this.spinner = false;
    }
  }

  private handleEntitlementRequests(result: any): void {
    console.log('RES ENTITLEMENT AVAILMENT ::', result);
    const apiResult: apiResult = result;

    if (apiResult.Status && apiResult.Result != null) {
      this.processEntitlementRequests(apiResult.Result as any);
    } else {
      // this.alertService.showWarning('There are no records left.');
      this.spinner = false;
    }
  }

  private processEntitlementRequests(entitlementRequests: any[]): void {
    try {
      console.log('this._entitlementList', this._entitlementList);

      this._entitlementAvailmentRequests = entitlementRequests;
      let _statusList = this.utilsHelper.transform(this.isAllenDigital ? EntitlementRequestStatusForAllen : EntitlementRequestStatus) as any;
      if (this._entitlementAvailmentRequests.length > 0) {
        this._entitlementAvailmentRequests.forEach(ele => {
          ele['EntitlementTypeName'] = "Leave";
          ele['EntitlementName'] = this._entitlementList.length > 0 ?
            (this._entitlementList.find(a => a.EntitlementId == ele.EntitlementId) ?
              this._entitlementList.find(a => a.EntitlementId == ele.EntitlementId).DisplayName : '---') : '---';
          ele['StatusName'] = _statusList.find(z => z.id == ele.Status).name;

        });

        this.calculateCounts();

        this.inEmployeesInitiateList = this._entitlementAvailmentRequests;
        if (this.inEmployeesInitiateList.length > 0) {
          this.inEmployeesInitiateList.forEach(element => {
            element['isSelected'] = false;
            if (element.Status == 200) {
              element.ApplierRemarks = element.CancellationRemarks;
            }
          });
        }
      }

      this.spinner = false;
    } catch (error) {
      console.error('Error processing entitlement requests:', error);
      this.alertService.showWarning('Something went wrong! ' + error);
      this.spinner = false;
    }
  }


  private calculateCounts(): void {
    let sum = 0;
    this.count_applied = 0;
    this.count_approved = 0;
    this.count_rejected = 0;
    this.count_totalDays = 0;

    this._entitlementAvailmentRequests.forEach(element => {
      if (element.Status == 100) {
        this.count_applied += 1;
      }
      if (element.Status == 400) {
        this.count_approved += 1;
      }
      if (element.Status == 300) {
        this.count_rejected += 1;
      }

      if (element.Status == 100 || element.Status == 400) {
        sum += 1;
      }
    });

    this.count_totalDays = sum;
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
  getEntitlementDefintionCode(tabName) {
    return tabName != null ? tabName.toUpperCase().toString() : '---';

  }

  loadinEmployeesInitiateRecords1() {

    this.inEmployeesInitiateGridOptions = {
      alwaysShowVerticalScroll: false,
      autoEdit: true,
      createFooterRow: true,
      createPreHeaderPanel: true,
      datasetIdPropertyName: "Id",
      editable: true,
      enableAddRow: false,
      enableAutoResize: true,
      enableAutoSizeColumns: true,
      enableAutoTooltip: true,
      enableCellNavigation: true,
      enableCheckboxSelector: true,
      enableColumnPicker: false,
      enableColumnReorder: true,
      enableFiltering: true,
      enableGridMenu: true,
      enablePagination: false,
      enableRowSelection: true,
      enableSorting: true,
      footerRowHeight: 30,
      frozenBottom: false,
      frozenColumn: -1,
      frozenRow: -1,
      leaveSpaceForNewRows: true,
      preHeaderPanelHeight: 40,
      presets: {},
      rowSelectionOptions: {
        selectActiveRow: false,
      },
      showFooterRow: false,
      showHeaderRow: true,
      showPreHeaderPanel: false
    };


    this.inEmployeesInitiateColumnDefinitions = [
      // {
      //   id: 'EntitlementName', name: 'Leave Type', field: 'EntitlementName',
      //   sortable: true,
      //   filterable: true,
      //   type: FieldType.string,
      // },
      {
        id: 'AppliedFrom', name: 'Applied From', field: "AppliedFrom",
        sortable: true,
        filterable: true,
        type: FieldType.string,
        formatter: this.DateFormatter


      },
      {
        id: 'AppliedTill', name: 'Applied Till', field: 'AppliedTill',
        sortable: true,
        filterable: true,
        type: FieldType.string,
        formatter: this.DateFormatter
      },

      {
        id: 'AppliedUnits', name: 'No Of Day(s)', field: 'CalculatedAppliedUnits',
        sortable: true,
        type: FieldType.string,
        filterable: true,
        toolTip: "No of days"
        // minWidth: 80,
        // maxWidth: 80,
      },
      {
        id: 'AppliedOn', name: 'Applied On', field: "AppliedOn",
        sortable: true,
        filterable: true,
        type: FieldType.string,
        formatter: this.DateFormatter


      },
      {
        id: 'ApplierRemarks', name: 'Remarks', field: "ApplierRemarks",
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      {
        id: 'PendingAtUserName', name: 'Pending At', field: "PendingAtUserName",
        sortable: true,
        filterable: true,
        type: FieldType.string,
      },
      {
        id: 'ValidatedUserName', name: 'Approved By', field: "ValidatedUserName",
        sortable: true,
        filterable: true,
        type: FieldType.string,

      },
      {
        id: 'StatusName', name: 'Status', field: 'StatusName',
        sortable: true,
        type: FieldType.string,
        formatter: highlightingFormatter,
        filterable: true,
        filter: {
          model: Filters.singleSelect,
          collection: [{ value: '', label: 'All' }, { value: "Applied", label: 'Applied' }, { value: "Cancelled", label: 'Cancelled' }, { value: "Rejected", label: 'Rejected' },
          { value: "Approved", label: 'Approved' }, { value: 'CancellationInProgress', label: 'CancellationInProgress' }],
        },
        // minWidth: 90, 
        // maxWidth: 90,  Applied = 100,

      },
      {
        id: 'edit',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.approveFormatter,
        minWidth: 40,
        maxWidth: 40,
        onCellClick: (e: Event, args: OnEventArgs) => {
          this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
          this.EvtReqId = args.dataContext.Id;
          console.log('Crurent time : ', this.CurrentDateTime);
          this.do_editAppliedRequest(args.dataContext);
        }
      },
      {
        id: 'cancel',
        field: 'Id',
        excludeFromHeaderMenu: true,
        formatter: this.rejectFormatter,
        minWidth: 40,
        maxWidth: 40,
        onCellClick: (e: Event, args: OnEventArgs) => {
          if (args.dataContext.Status == 600) {
            return;
          }
          this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');
          this.EvtReqId = args.dataContext.Id;
          console.log(args);
          const selectedItems = [];
          if (args.dataContext.Status == 400) {

            selectedItems.push(args.dataContext);
            this.cancelApprovedRequest(selectedItems);
            return;
          }
          this.do_cancelAppliedRequest(args.dataContext);

        }
      },

    ];

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


  get g() { return this.leaveForm.controls; } // reactive forms validation 

  createForm() {
    this.leaveForm = this.formBuilder.group({
      Id: [0],
      AppliedFrom: [new Date()],
      AppliedTill: [new Date()],
      IsAppliedForFirstHalf: [false],
      IsAppliedFromSecondHalf: [false],
      IsAppliedTillFirstHalf: [false],
      IsAppliedTillSecondHalf: [false],
      EntitlementType: [null],
      Entitlement: this._Entitlement.value == "" ? null : this._Entitlement,
      AppliedUnits: [0],
      EligibleUnits: [0],
      ApplierRemarks: [''],
      CalculatedAppliedUnits: [0],
      OptinalHoliday: [null],
      AdditionalDateInput: [null],
      AdditionalDocumentId: [null],
      AdditionalDocumentName: [""],
      compOffDates: [null],
      relationshipId: [null]
    });
  }

  getMinMaxRangeAdditionalDateInput(rangeType) {
    let currentDate = new Date();
    rangeType == 'minDate' ? (currentDate.setDate(currentDate.getDate() - this.employeeEntitlement.Definition.MaxDaysBeforeAdditionalDate)) : (currentDate.setDate(currentDate.getDate() + this.employeeEntitlement.Definition.MaxDaysAfterAdditionalDate));
    return currentDate;
  }
  do_applyLeave() {

    for (var control in this.leaveForm.controls) {
      this.leaveForm.controls[control].enable();
    }


    console.log('ENT ::', this._entitlementList);
    this.employeeEntitlement = JSON.parse(JSON.stringify(this._entitlementList[0]));
    this.tabName = this.tabName ? this.tabName : this._entitlementList[0].Definition.Code;
    // Clear validators and errors for 'ApplierRemarks'
    const applierRemarksControl = this.leaveForm.get('ApplierRemarks');
    applierRemarksControl.clearValidators();
    applierRemarksControl.setErrors(null);
    applierRemarksControl.updateValueAndValidity();
    this.leaveDaysApplied  = '';

    // Create a new form and reset it
    this.createForm();

    // Patch values to the form
    this.leaveForm.patchValue({
      AppliedFrom: null,
      AppliedTill: null,
    });

    // Enable the '_Entitlement' control (assuming '_Entitlement' is a FormControl)
    this._Entitlement.enable();

    // Set the 'CurrentDateTime' using moment.js
    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');

    // Check if the date is the same
    // this.isSameDateCheck(new Date(), new Date());

    this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    if (this.leaveForm.get('AppliedFrom').value && this.leaveForm.get('AppliedTill').value) {
      // API call to get number of days 
      this.callNumberOfDaysForODAppliedAPI();
    }

    $('#popup_edit_attendance').modal('show');
  }

  ontab_applyLeave(item) {
    console.log('ITEM ::', item);
    this.tabName = item.Definition.Code;
    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
    console.log('Crurent time : ', this.CurrentDateTime);
    this.EvtReqId = 0;
    this.availableDays = 0;
    // if (item.Definition.IsNegativeBalanceAllowed == false && item.EligibleUnits <= 0) {
    //   this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try again.');
    //   return;
    // } else if (item.Definition.IsNegativeBalanceAllowed == true && item.Definition.MaxNegativeBalanceAllowed == 0 && item.EligibleUnits <= 0) {
    //   this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try again.');
    //   return;
    // }

    // else {

    //   if (item.Definition.IsNegativeBalanceAllowed == true) {
    //     this.IsNegativeUnitAllowed = true;
    //     this.MaxAllowedNegativeBalance = item.Definition.MaxNegativeBalanceAllowed;
    //   }

    //   this.open_modalpopup_leaverequest(item);
    // }
    this.open_modalpopup_leaverequest(item);

  }
  open_modalpopup_leaverequest(item) {
    this.isinvalidDate = false;
    this.availableDays = item.EligibleUnits;

    this.createForm();
    this.leaveForm.reset();
    // this.leaveForm.markAsPristine();
    // this.leaveForm.markAsUntouched();
    // this.leaveForm.updateValueAndValidity();
    this.leaveForm.clearValidators();

    const currentDate = new Date();
    const nextDay = new Date(currentDate.setDate(currentDate.getDate() + (this.weekOffs.includes(currentDate.getDay()) ? 1 : 0)));

    this.leaveForm.patchValue({
      AppliedFrom: nextDay,
      AppliedTill: nextDay,
      Entitlement: item.EntitlementId,
      EligibleUnits: item.EligibleUnits,
      AppliedUnits: item.AppliedUnits || 0,
      Id: 0,
      ApplierRemarks: ''
    });

    this._Entitlement.disable();

    this.eligibaleDays = item.EligibleUnits;
    this.remainingDays = item.EligibleUnits;

    this.onChange_Entitlement(item);

    $('#popup_edit_attendance').modal('show');
    Object.keys(this.leaveForm.controls).forEach(key => {
      this.leaveForm.get(key).setErrors(null);
    });

    this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
  }

  isSameDateCheck(from, till) {

    this.tobeDisabledCheckbox = false;
    const isSameDate = moment(from).format('YYYY-MM-DD') == moment(till).format('YYYY-MM-DD');
    this.tobeDisabledCheckbox = !isSameDate;
    if (isSameDate) {
      this.leaveForm.controls['IsAppliedForFirstHalf'].enable();
      this.leaveForm.controls['IsAppliedTillSecondHalf'].enable();
    } else {
      this.leaveForm.controls['IsAppliedForFirstHalf'].disable();
      this.leaveForm.controls['IsAppliedTillSecondHalf'].disable();
    }

    this.isSameDate = isSameDate;
  }

  isDatesArecontinuityCheck(from, till) {
    this.isDatesArecontinuity = true;
    if (this.isSameDate) {
      this.isDatesArecontinuity = true;
    }
    else if (!this.isSameDate && (this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true)) {
      this.isDatesArecontinuity = false;
    }
  }

  onChange_AdditionalDate(event) {

    this.leaveForm.controls['AppliedFrom'].setValue(null);
    this.leaveForm.controls['AppliedTill'].setValue(null);
    var startdate = moment(new Date(event));
    // set min date based on additional input
    if (this.employeeEntitlement && (this.employeeEntitlement.Entitlement.IsPaternity)) {
      this._from_minDate = new Date(event);
      this._from_minDate.setMonth(this._from_minDate.getMonth());
      this._from_minDate.setDate(this._from_minDate.getDate());
      this._from_minDate.setFullYear(this._from_minDate.getFullYear());
    }

    if (this.employeeEntitlement && this.employeeEntitlement.Definition.IsAdditionalDateInputRequired && this.employeeEntitlement.Definition.MaxDaysBeforeAdditionalDate > 0 && this.leaveForm.get('AdditionalDateInput').value != null) {

      var newAppliedFrom = moment(startdate, "DD-MM-YYYY").subtract(this.employeeEntitlement.Definition.MaxDaysBeforeAdditionalDate, 'days');

      this.leaveForm.controls['AppliedFrom'].setValue(new Date(moment(newAppliedFrom).toDate()))

    }

  }

  onChange_FromDate(event) {

    // if(this.employeeEntitlement && this.employeeEntitlement.Definition.IsAdditionalDateInputRequired && this.leaveForm.get('AdditionalDateInput').value == null){

    // }
    console.log('FD Date :', event);
    const newEventDate = new Date(event);
    let existingSelectedDate: Date;

    if (this.leaveForm.get('AppliedFrom').value != null || this.leaveForm.get('AppliedFrom').value != undefined) {

      const newEventMonth = new Date(event).getMonth() + 1;
      const newEventYear = new Date(event).getFullYear();


      if (newEventMonth === this.presentMonth && newEventYear === this.presentYear) {
        console.log('New event is in the present month. Skipping getAttendanceRecord.');
      } else {
        this.getAttendanceRecord();
      }

      var appliedfromDate = new Date(event);
      this.presentMonth = newEventMonth;
      this.presentYear = newEventYear;

      this._till_minDate = new Date();
      this._till_minDate = new Date(appliedfromDate);
      // appliedfromDate.getMonth() > 0 ? this._till_minDate.setMonth(appliedfromDate.getMonth() - 1)
      //   : this._till_minDate.setMonth(appliedfromDate.getMonth());
      // this._till_minDate.setDate(appliedfromDate.getDate());
      // this._till_minDate.setFullYear(appliedfromDate.getFullYear());
      /**
      ! FIX FOR BUG #3564 -
      ** COULD NOT APPLY LEAVE FOR FUTURE DATES
      */
      const nextYear = new Date().getFullYear() + 1;
      const selectedYear = new Date(event).getFullYear();
      if (selectedYear >= nextYear) {
        console.log('*** IS NEXT YEAR ***', nextYear, selectedYear);
        this._till_minDate = new Date();
        this._till_minDate.setMonth(appliedfromDate.getMonth());
        this._till_minDate.setDate(appliedfromDate.getDate());
        this._till_minDate.setFullYear(appliedfromDate.getFullYear());
      }
      // this.leaveForm.controls['AppliedTill'].setValue(null);
      this.resetLeaveForm();
      this.requestedDays = 0;
      this.calculateNoOfDays(new Date(event), (this.leaveForm.get('AppliedTill').value));
      this.isSameDateCheck(new Date(event), this.leaveForm.get('AppliedTill').value);
      this.isDatesArecontinuityCheck(new Date(event), this.leaveForm.get('AppliedTill').value);

      let _fromdate = new Date(event);
      let _todate = this.leaveForm.get('AppliedTill').value;
      let A = moment(_fromdate).format('YYYY-MM-DD');
      let B = moment(_todate).format('YYYY-MM-DD');

      this.isinvalidDate = false;
      console.log('A1', A);
      console.log('B1', B);

      if (A != 'Invalid date' && B != 'Invalid date' && B != '1970-01-01' && B != A && B < A) {
        this.isinvalidDate = true;
      }
      //Note: The start date has to be greater than or equal to the start date.


    } else {
      this._till_minDate = new Date();
      this._till_minDate = new Date(event);
    }

    if (this.employeeEntitlement != null && (this.employeeEntitlement.Definition.AutoCalculateEndDate)) {
      // if (newEventDate.getTime() != existingSelectedDate.getTime()) {
      this.GetEntitlementRequestEndDate(newEventDate);
      // }
    }

    if (this.employeeEntitlement && this.employeeEntitlement.Definition.IsCompOff && !this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff) {
      this.leaveForm.controls['AppliedTill'].setValue(newEventDate);
      this.leaveForm.get('AppliedTill').disable();
    }

    existingSelectedDate = newEventDate;
    

  }

  onChange_TillDate(event) {

    if (this.leaveForm.get('AppliedFrom').value != null && this.leaveForm.get('AppliedFrom').value != undefined) {
      this.resetLeaveForm();
      this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, new Date(event));
      this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, new Date(event));
      this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, new Date(event));

    }

    let _fromdate = this.leaveForm.get('AppliedFrom').value
    let _todate = new Date(event);
    let A = moment(_fromdate).format('YYYY-MM-DD');
    let B = moment(_todate).format('YYYY-MM-DD');

    this.isinvalidDate = false;
    console.log('A', A);
    console.log('B', B);
    if (A != 'Invalid date' && B != 'Invalid date' && B != '1970-01-01' && B != A && B < A) {
      this.isinvalidDate = true;
      // this.alertService.showWarning("Note: The till date has to be greater than or equal to the from date.");
      // return;
    }

    if (event && this.leaveForm.get('AppliedFrom').value && this.leaveForm.get('Id').value == 0) {
      // API call to get number of days 
      this.callNumberOfDaysForODAppliedAPI();
    }
  }
  onClickMode(title) {
    title == "MusterRoll" ? this.IsMusterroll = true : this.IsMusterroll = false;

  }

  resetLeaveForm() {

    const fields2 = ['IsAppliedForFirstHalf', 'IsAppliedTillFirstHalf', 'IsAppliedFromSecondHalf', 'IsAppliedTillSecondHalf'];
    fields2.forEach(field => {
      this.leaveForm.controls[field].setValue(false),
        this.leaveForm.controls[field].enable()
    }
    );
    const fields = ['ApplierRemarks', 'AppliedFrom', 'AppliedUnits', 'AppliedTill'];
    fields.forEach(field => this.updateValidation(false, this.leaveForm.get(field)));

  }
  onChange_firstHalf(item) {

    if (item.target.checked && this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.leaveForm.controls['IsAppliedTillFirstHalf'].setValue(true);
      this.leaveForm.controls['IsAppliedTillFirstHalf'].disable();
      this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(false);

      this.isDisabledTillDate = true;

    }
    else if (item.target.checked && this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') != moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      // this.leaveForm.controls['IsAppliedTillFirstHalf'].setValue(false)
      // this.leaveForm.controls['IsAppliedTillFirstHalf'].enable();
      // this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(false);
      // this.leaveForm.controls['IsAppliedFromSecondHalf'].disable();

      this.leaveForm.controls['IsAppliedTillFirstHalf'].setValue(false)
      this.leaveForm.controls['IsAppliedTillFirstHalf'].disable();
      this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(false);
      this.leaveForm.controls['IsAppliedFromSecondHalf'].disable();

      // this.leaveForm.controls['AppliedTill'].setValue(this.leaveForm.get('AppliedFrom').value); 
      this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(true)

      this.isDisabledTillDate = false;

    }
    else {
      this.leaveForm.controls['IsAppliedTillFirstHalf'].setValue(false)
      this.leaveForm.controls['IsAppliedTillFirstHalf'].enable();
      this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(false);
      this.leaveForm.controls['IsAppliedFromSecondHalf'].enable();

      this.isDisabledTillDate = false;
    }
    // API call to get number of days 
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value && this.leaveForm.get('Id').value == 0) {
      this.callNumberOfDaysForODAppliedAPI();
    }
    this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);

  }
  onChange_secondHalf(item) {

    if (this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      if (item.target.checked) {
        this.leaveForm.controls['IsAppliedTillSecondHalf'].setValue(true);
        this.leaveForm.controls['IsAppliedTillFirstHalf'].disable();
        this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(false);

        this.leaveForm.controls['IsAppliedTillFirstHalf'].setValue(false);


        this.isDisabledTillFirstHalf = true;

      } else {
        this.leaveForm.controls['IsAppliedTillSecondHalf'].setValue(false)
        this.leaveForm.controls['IsAppliedTillFirstHalf'].enable();
        this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(false);

        this.isDisabledTillFirstHalf = false;
      }
    }
    // API call to get number of days 
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value && this.leaveForm.get('Id').value == 0) {
      this.callNumberOfDaysForODAppliedAPI();
    }
    this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);

  }
  onChange_tillfirstHalf(item) {

    if (item.target.checked && this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(true);
      // this.leaveForm.controls['IsAppliedTillFirstHalf'].disable();
      // this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(false);

      this.isDisabledTillDate = true;

    }
    else if (!item.target.checked && this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {

      this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(false);
    }
  
    // API call to get number of days 
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value && this.leaveForm.get('Id').value == 0) {
      this.callNumberOfDaysForODAppliedAPI();
    }
    this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);

  }

  onChange_tillSecondHalf(item) {

    if (item.target.checked && this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(true);
      // this.leaveForm.controls['IsAppliedTillFirstHalf'].disable();
      // this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(false);

      this.isDisabledTillDate = true;

    }
    else if (!item.target.checked && this.leaveForm.get('AppliedTill').value != null && (moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {

      this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(false);
    }
    // API call to get number of days 
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value && this.leaveForm.get('Id').value == 0) {
      this.callNumberOfDaysForODAppliedAPI();
    }
    this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);

  }

  parseDate(str) {

    var mdy = str.split('/');
    return new Date(mdy[2], mdy[0] - 1, mdy[1]);
  }

  datediff(first, second) {
    // Take the difference between the dates and divide by milliseconds per day.
    // Round to nearest whole number to deal with DST.
    return Math.round((second - first) / (1000 * 60 * 60 * 24));
  }

  calculateNoOfDays(startDate, endDate) {
    const a = new Date(startDate);
    const b = new Date(endDate);

    this.requestedDays = 0;
    this.preRequestedDays = 0;
    const diff = this.workingDaysBetweenDates(a, b);

    this.requestedDays = Math.round(diff);

    if (this.isHalfDaySelected()) {
      this.requestedDays -= 0.5;
    }

    if (
      !this.leaveForm.get('IsAppliedForFirstHalf').value &&
      this.leaveForm.get('IsAppliedFromSecondHalf').value &&
      this.leaveForm.get('IsAppliedTillFirstHalf').value
    ) {
      this.requestedDays -= 0.5;
    }

    this.remainingDays = (Number(this.eligibaleDays) - Number(this.requestedDays)).toFixed(1);

    console.log('REG ::', this.requestedDays);
    console.log('ELG ::', this.eligibaleDays);
    console.log('REMIN ::', this.remainingDays);
  }

  isHalfDaySelected() {
    return (
      this.leaveForm.get('IsAppliedForFirstHalf').value ||
      this.leaveForm.get('IsAppliedTillSecondHalf').value ||
      this.leaveForm.get('IsAppliedTillFirstHalf').value ||
      this.leaveForm.get('IsAppliedFromSecondHalf').value
    );
  }

  // calculateNoOfDays(startDate, endDate) {



  //   let a = new Date(startDate);
  //   let b = new Date(endDate);

  //   // var i = `'${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}'`;
  //   // var j = `'${b.getMonth() + 1}/${b.getDate()}/${b.getFullYear()}'`;
  //   // console.log('start : ', i);
  //   // console.log('end : ', j);
  //   // var future = moment(j);
  //   // var start = moment(i);
  //   // var diff = future.diff(start, 'days');
  //   // console.log('diff in a day : ', diff);

  //   var diff = this.workingDaysBetweenDates(a, b);
  //   console.log('diff in a day : ', diff);

  //   // var oneDay = 24 * 60 * 60 * 1000;
  //   // var diffDays = Math.abs((a.getTime() - a.getTime()) / (oneDay));
  //   // console.log('DIFF DAYS ::', diffDays);

  //   this.requestedDays = 0;
  //   this.preRequestedDays = 0;
  //   // var Difference_In_Time = a.getTime() - b.getTime();
  //   // let currentPeriodDays = Difference_In_Time / (1000 * 3600 * 24);
  //   // console.log('currentPeriodDays', currentPeriodDays);
  //   // this.requestedDays = Math.abs(currentPeriodDays);
  //   this.requestedDays = Math.round(diff);
  //   // if (this.requestedDays == 0) {
  //   //   this.requestedDays = this.requestedDays + 1;
  //   // }


  //   if (this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true ||
  //     this.leaveForm.get('IsAppliedTillFirstHalf').value == true || this.leaveForm.get('IsAppliedFromSecondHalf').value == true) {
  //     this.requestedDays = this.requestedDays - 0.5;
  //   }

  //   if (this.leaveForm.get('IsAppliedForFirstHalf').value == false && this.leaveForm.get('IsAppliedFromSecondHalf').value == true && this.leaveForm.get('IsAppliedTillFirstHalf').value == true) {
  //     this.requestedDays = this.requestedDays - 0.5;
  //   }




  //   console.log('REG ::', this.requestedDays);
  //   console.log('ELG ::', this.eligibaleDays);
  //   console.log('PRE ::', this.preRequestedDays);

  //   // if (this.leaveForm.get('Id').value > 0) {
  //   //   this.preRequestedDays = Number(this.leaveForm.get('AppliedUnits').value)
  //   // var result = (this.preRequestedDays - Math.floor(this.preRequestedDays)) !== 0;   
  //   // if (result){
  //   // }
  //   // if (this.preRequestedDays == 0) {
  //   //   this.preRequestedDays = this.requestedDays;
  //   // }
  //   // this.remainingDays = (Number(this.eligibaleDays) - Number(this.requestedDays)) + Number(this.preRequestedDays);
  //   //   this.remainingDays = (Number(this.eligibaleDays) - Number(this.requestedDays));
  //   //   this.remainingDays = Number(this.remainingDays).toFixed(1);

  //   // } else {
  //   this.remainingDays = Number(this.eligibaleDays) - Number(this.requestedDays);
  //   this.remainingDays = Number(this.remainingDays).toFixed(1);

  //   // }

  //   console.log('REMIN ::', this.remainingDays);



  //   // alert(this.leaveForm.get('IsAppliedForFirstHalf').value)
  //   // this.requestedDays = this.requestedDays <= 0 && (
  //   //   this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true ||
  //   //   this.leaveForm.get('IsAppliedTillFirstHalf').value == true || this.leaveForm.get('IsAppliedFromSecondHalf').value == true) ? 0.5 : (
  //   //     this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true ||
  //   //     this.leaveForm.get('IsAppliedTillFirstHalf').value == true || this.leaveForm.get('IsAppliedFromSecondHalf').value == true) ? this.requestedDays + 0.5 : this.requestedDays + 1;
  //   // this.requestedDays = Math.round(this.requestedDays);
  //   // this.leaveForm.get('IsAppliedForFirstHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) :
  //   //   this.leaveForm.get('IsAppliedTillSecondHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) :
  //   //     this.leaveForm.get('IsAppliedTillFirstHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) :
  //   //       this.leaveForm.get('IsAppliedFromSecondHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) : null;
  //   // this.remainingDays = 0;
  //   // alert(this.requestedDays);
  // }

  onChange_Entitlement(event) {
    console.log('event', event);
    this.leaveDaysApplied  = '';
    if (event === undefined) {
      this.selectedEntitlement = null;
      this.leaveForm.controls['EligibleUnits'].setValue(0);
    } else {

      this.leaveForm.controls['AppliedTill'].setValue(null);
      this.leaveForm.controls['AppliedFrom'].setValue(null);
      
      this.leaveForm.controls['AppliedTill'].enable();
      this.leaveForm.controls['AppliedTill'].setValue(null);

      this.employeeEntitlement = null;
      this.employeeEntitlement = event;

      if (this.employeeEntitlement.Definition.IsHolidayInclusive) {
        this.weekOffs = [];
      }

      // reset min date 
      this._from_minDate = new Date(this._employeeDOJ);
      this._from_minDate.setMonth(this._from_minDate.getMonth());
      this._from_minDate.setDate(this._from_minDate.getDate());
      this._from_minDate.setFullYear(this._from_minDate.getFullYear());

      this.minDateForAdditionalDateInput =
        new Date(this._employeeDOJ);
      this.IsShowBalanceInUI = false;
      this.IsLossOfPay = false;

      this.IsShowBalanceInUI = event.ShowBalanceInUI;
      this.IsLossOfPay = event.IsLossOfPay;
      this.tabName = event.Definition.Code;
      this.leaveTypeName = event.DisplayName;

      const appliedUnits = this.leaveForm.get('AppliedUnits').value;
      const eligibleUnits = Number(event.EligibleUnits);

      this.remainingDays = this.leaveForm.get('Id').value > 0 ? (eligibleUnits + Number(appliedUnits)) : eligibleUnits;
      this.eligibaleDays = this.remainingDays;
      this.availableDays = this.eligibaleDays;

      this.leaveForm.controls['EligibleUnits'].setValue(eligibleUnits);
      this.selectedEntitlement = event;

      this.leaveForm.controls['AdditionalDateInput'].setValue(null);

      const fields = ['IsAppliedTillFirstHalf', 'IsAppliedForFirstHalf', 'IsAppliedFromSecondHalf', 'IsAppliedTillSecondHalf'];
      fields.forEach(field => this.leaveForm.controls[field].setValue(false));

      if (this.leaveForm.get('AdditionalDocumentId').value != null &&
        this.leaveForm.get('AdditionalDocumentId').value != 0 &&
        this.leaveForm.get('AdditionalDocumentId').value != undefined) {
        this.deleteAsync(this.leaveForm.value.AdditionalDocumentId, 'onChange');
      }


      if (this.leaveForm.get('AppliedFrom').value != null && moment(this.leaveForm.get('AppliedFrom').value).format('YYYY-MM-DD') < moment(this.minDateForAdditionalDateInput).format('YYYY-MM-DD')) {
        this.leaveForm.controls['AppliedFrom'].setValue(null);
      }



      if (this.employeeEntitlement != null && (this.employeeEntitlement.Definition.AutoCalculateEndDate)) {
        this.GetEntitlementRequestEndDate(new Date(this.leaveForm.get('AppliedFrom').value));
      }

      if (this.employeeEntitlement && this.employeeEntitlement.Definition && this.employeeEntitlement.Definition.IsCompOff) {
        this.fetchAvailableDatesForCompOffForAnEmployee();
      }
    }
  }

  onChangeHolidays(event) {
    if (this.employeeEntitlement.Entitlement.IsOptionalHoliday) {
      this.leaveForm.patchValue({
        AppliedFrom: new Date(event.Date),
        AppliedTill: new Date(event.Date),
      });
      this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    }
  }

  onChange_RequestedDays(event) {
    this.requestedDays = 0;
    this.requestedDays = event.target.value;
  }

  do_editAppliedRequest(rowData) {
    console.log('rowData', rowData);
    this.leaveForm.patchValue({
      Id: rowData.Id,
      AppliedFrom: new Date(rowData.AppliedFrom),
      AppliedTill: new Date(rowData.AppliedTill),
      EntitlementType: rowData.EntitlementType,
      Entitlement: rowData.EntitlementId,
      AppliedUnits: rowData.AppliedUnits,
      ApplierRemarks: rowData.ApplierRemarks,
      CalculatedAppliedUnits: rowData.CalculatedAppliedUnits,
      AdditionalDateInput: null, // rowData.hasOwnProperty('AdditionalDate') ? new Date(rowData.AdditionalDate) : null,
      AdditionalDocumentId: rowData.DocumentId,
      AdditionalDocumentName: rowData.DocumentName,
      compOffDates: null,
      relationshipId: 0,
      IsAppliedForFirstHalf: rowData.IsAppliedForFirstHalf,
      IsAppliedFromSecondHalf: rowData.IsAppliedFromSecondHalf,
      IsAppliedTillFirstHalf: rowData.IsAppliedTillFirstHalf,
      IsAppliedTillSecondHalf: rowData.IsAppliedTillSecondHalf
    });

    console.log('leaveForm leaveForm ;', this.leaveForm.value);
    this.employeeEntitlement = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId);
    // this.onChange_Entitlement(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId))
    // console.log('ROW DATA ::', rowData);
    // this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    // this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    // this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);

    // this.leaveForm.controls['IsAppliedForFirstHalf'].setValue(rowData.IsAppliedForFirstHalf);
    // this.leaveForm.controls['IsAppliedFromSecondHalf'].setValue(rowData.IsAppliedFromSecondHalf);
    // this.leaveForm.controls['IsAppliedTillFirstHalf'].setValue(rowData.IsAppliedTillFirstHalf);
    // this.leaveForm.controls['IsAppliedTillSecondHalf'].setValue(rowData.IsAppliedTillSecondHalf);
    // this.requestedDays = rowData.AppliedUnits;
    this.isDisabledTillFirstHalf = true;
    this.tobeDisabledCheckbox = true;
    this.tobeDisabledCheckbox = true;
    this.isDisabledFromSecondHalf = true;
    for (var control in this.leaveForm.controls) {
      this.leaveForm.controls[control].disable();
    }

    // alert(this.requestedDays)
    // if (this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true ||
    //   this.leaveForm.get('IsAppliedTillFirstHalf').value == true || this.leaveForm.get('IsAppliedFromSecondHalf').value == true) {
    //     this.requestedDays = this.requestedDays - 0.5;
    // }
    // this.requestedDays = this.requestedDays <= 0 && (
    //   this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true ||
    //   this.leaveForm.get('IsAppliedTillFirstHalf').value == true || this.leaveForm.get('IsAppliedFromSecondHalf').value == true) ? 0.5 : (
    //     this.leaveForm.get('IsAppliedForFirstHalf').value == true || this.leaveForm.get('IsAppliedTillSecondHalf').value == true ||
    //     this.leaveForm.get('IsAppliedTillFirstHalf').value == true || this.leaveForm.get('IsAppliedFromSecondHalf').value == true) ? this.requestedDays + 0.5 : this.requestedDays + 1;
    // this.requestedDays = Math.round(this.requestedDays);
    // this.leaveForm.get('IsAppliedForFirstHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) :
    //   this.leaveForm.get('IsAppliedTillSecondHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) :
    //     this.leaveForm.get('IsAppliedTillFirstHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) :
    //       this.leaveForm.get('IsAppliedFromSecondHalf').value == true ? this.requestedDays = Number(this.requestedDays) + Number(0.5) : null;

    // this.leaverequest_slider = true;
    $('#popup_edit_attendance').modal('show');

    // }
    // else {
    //   this.alertService.showWarning('Action was blocked : Invalid request - that request is already approved/rejected.')
    //   return;
    // }
  }

  saveEntitlementRequest() {
    this.submitted = true;
    this.leaveForm.controls['AppliedUnits'].setValue(this.requestedDays);
    console.log(this.leaveForm.value);
    this.updateValidation(true, this.leaveForm.get('ApplierRemarks'));
    this.updateValidation(true, this.leaveForm.get('AppliedFrom'));
    this.updateValidation(true, this.leaveForm.get('AppliedUnits'));
    this.updateValidation(true, this.leaveForm.get('AppliedTill'));


    if (this.leaveForm.invalid) {
      this.alertService.showWarning("Unfortunately, your request cannot be submitted. Please fill in a valid value for all required(*) fields.");
      return;
    }
    // else if (Number(Math.sign(this.requestedDays)) == -1) {
    //   this.alertService.showWarning('you cannot apply for 0 days or less than of leave.');
    //   return;
    // }
    else if (this.leaveForm.controls.AppliedUnits.value == 0) {
      this.alertService.showWarning('you cannot apply for 0 days or less than of leave.');
      return;
    }
    else if (this.isinvalidDate == true) {
      this.alertService.showWarning("Note: The till date has to be greater than or equal to the from date.");
      return;
    }
    else if (!this.isDatesArecontinuity) {
      this.alertService.showWarning("There must be continuity in the dates");
      return;
    }

    else {
      this.loadingScreenService.startLoading();
      this.validateIsExitsOnDay().then((res) => {

        console.log('VALIDATION CEHCK ::', res);
        if (res) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("You have entered dates that already exists in this request List. Only Unique dates are allowed.")
          return;
        }
        else {
          this.loadingScreenService.stopLoading();
          this.tiggerApiCall_LeaveRequest();
          // if (this.EvtReqId != null && this.EvtReqId != 0) {
          //   this.ValidateLeaveRequestIsValidToUpdate().then((validatedResponse) => {
          //     this.loadingScreenService.stopLoading();
          //     if(validatedResponse){
          //       this.tiggerApiCall_LeaveRequest();
          //     }            
          //   })
          // } else {
          //   this.tiggerApiCall_LeaveRequest();

          // }



        }

      })
    }
  }

  tiggerApiCall_LeaveRequest() {

    this.alertService.confirmSwal1("Confirmation!", `Are you sure you want to apply On Duty from ${moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('DD-MM-YYYY')} to ${moment(new Date(this.leaveForm.get('AppliedTill').value)).format('DD-MM-YYYY')}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      try {


        this.loadingScreenService.startLoading();
        let currentDate = new Date();
        var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
        entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
        entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
        entitlementAvailmentRequest.ApprovedTill = null;
        entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
        entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
        entitlementAvailmentRequest.ApprovedUnits = 0;
        entitlementAvailmentRequest.ApprovedFrom = null;
        entitlementAvailmentRequest.AppliedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');;
        entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');
        // validated on should be updated when leave gets approved not when requested
        // entitlementAvailmentRequest.ValidatedOn = null;
        entitlementAvailmentRequest.ValidatedBy = 0;
        entitlementAvailmentRequest.ApplierRemarks = this.leaveForm.get('ApplierRemarks').value;
        entitlementAvailmentRequest.CancellationRemarks = '';
        entitlementAvailmentRequest.ValidatorRemarks = '';
        entitlementAvailmentRequest.Status = EntitlementRequestStatus.Applied;
        entitlementAvailmentRequest.AppliedBy = this.UserId;
        entitlementAvailmentRequest.CalculatedAppliedUnits = this.leaveForm.get('CalculatedAppliedUnits').value == null ? 0 : this.leaveForm.get('CalculatedAppliedUnits').value;
        entitlementAvailmentRequest.AppliedUnits = this.leaveForm.get('AppliedUnits').value;
        entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
        entitlementAvailmentRequest.Id = this.leaveForm.get('Id').value;
        entitlementAvailmentRequest.EmployeeId = this.selectedEntitlement.EmployeeId;
        entitlementAvailmentRequest.EmployeeEntitlementId = this.selectedEntitlement.Id;
        entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
        entitlementAvailmentRequest.EntitlementId =  this.selectedEntitlement.Entitlement.Id; //this.leaveForm.get('Entitlement').value;
        entitlementAvailmentRequest.EntitlementDefinitionId = this.selectedEntitlement.EntitlementDefinitionId;
        entitlementAvailmentRequest.EntitlementMappingId = this.selectedEntitlement.EntitlementMappingId;
        entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
        entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
        entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
        entitlementAvailmentRequest.AppliedFrom = moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD');
        entitlementAvailmentRequest.IsAppliedFromSecondHalf = this.leaveForm.get('IsAppliedFromSecondHalf').value;
        entitlementAvailmentRequest.IsAppliedForFirstHalf = this.leaveForm.get('IsAppliedForFirstHalf').value;
        entitlementAvailmentRequest.AppliedTill = moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD');
        entitlementAvailmentRequest.IsAppliedTillFirstHalf = this.leaveForm.get('IsAppliedTillFirstHalf').value;
        entitlementAvailmentRequest.ActivityList = [];
        entitlementAvailmentRequest.PendingAtUserId = 0;
        entitlementAvailmentRequest.PendingAtUserName = '';
        // entitlementAvailmentRequest.LastUpdatedOn = this.CurrentDateTime;
        entitlementAvailmentRequest.ApprovalStatus = EntitlementRequestStatus.Applied;
        entitlementAvailmentRequest.RelationshipId = this.leaveForm.get('relationshipId').value ? this.leaveForm.get('relationshipId').value.Id : 0;
        entitlementAvailmentRequest.CompensationDates = null;
        
        this.leaveForm.get('AdditionalDateInput').value != null ? entitlementAvailmentRequest.AdditionalDate = moment(new Date(this.leaveForm.get('AdditionalDateInput').value)).format('YYYY-MM-DD') : true;
        this.leaveForm.get('AdditionalDocumentId').value != null && this.leaveForm.get('AdditionalDocumentId').value > 0 ? entitlementAvailmentRequest.DocumentId = this.leaveForm.get('AdditionalDocumentId').value : true;
        this.leaveForm.get('AdditionalDocumentName').value != null && this.leaveForm.get('AdditionalDocumentName').value != '' ? entitlementAvailmentRequest.DocumentName = this.leaveForm.get('AdditionalDocumentName').value : true;

        console.log('ENTILMENT REQUEST :: ', entitlementAvailmentRequest);
        // this.loadingScreenService.stopLoading();
        // return;
        this.attendanceService.PostOdRequest(entitlementAvailmentRequest)
          .subscribe((result) => {
            let apiResult: apiResult = result;
            console.log('SUBMITTED RES ::', result);
            if (apiResult.Status) {
              this.alertService.showSuccess(apiResult.Message);
              this.loadingScreenService.stopLoading();
              this.close_leaverequest_slider();
              this.onRefresh();
              this.updateValidation(false, this.leaveForm.get('ApplierRemarks'));
              this.updateValidation(false, this.leaveForm.get('AppliedFrom'));
              this.updateValidation(false, this.leaveForm.get('AppliedUnits'));
              this.updateValidation(false, this.leaveForm.get('AppliedTill'));

            } else {
              this.alertService.showWarning(apiResult.Message);
              this.loadingScreenService.stopLoading();
            }

          }, err => {
            //debugger;
          })
      } catch (error) {
        this.alertService.showWarning('Something went wrong! ' + error);
        this.loadingScreenService.stopLoading();
      }
    }).catch(error => {
      this.updateValidation(false, this.leaveForm.get('ApplierRemarks'));
      this.updateValidation(false, this.leaveForm.get('AppliedFrom'));
      this.updateValidation(false, this.leaveForm.get('AppliedUnits'));
      this.updateValidation(false, this.leaveForm.get('AppliedTill'));
    });
  }

  updateValidation(value, control: AbstractControl) {


    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  close_leaverequest_slider() {
    for (var control in this.leaveForm.controls) {
      this.leaveForm.controls[control].enable();
    }

    this.IsShowBalanceInUI = false;
    this.IsLossOfPay = false;
    this.remainingDays = 0;
    this.employeeEntitlement = null;
    // this.leaverequest_slider = false;
    $('#popup_edit_attendance').modal('hide');

  }

  validateIsExitsOnDay() {

    const promise = new Promise((res, rej) => {
      let isExists: boolean = false;
      let _appliedListofDates = [];
      let _stDate = moment(new Date(this.leaveForm.get('AppliedFrom').value)) as any;
      let _edDate = moment(new Date(this.leaveForm.get('AppliedTill').value));
      console.log('_stDate', _stDate);
      console.log('_edDate', _edDate);

      while (moment(_stDate) <= moment(_edDate)) {
        _appliedListofDates.push({ date: (_stDate) });
        _stDate = moment(_stDate).add(1, 'days').format("YYYY-MM-DD");
      }
      console.log('_appliedListofDates', _appliedListofDates);
      console.log('_appliedListofDates', this._entitlementAvailmentRequests);
      console.log('_appliedListofDates', this.LstEntitlementAvailmentRequestDetails);

      if (this._entitlementAvailmentRequests.length > 0) {

        for (let i = 0; i < this._entitlementAvailmentRequests.length; i++) {
          const index = this._entitlementAvailmentRequests[i];
          console.log('ssss', index);

          if (index.Status != EntitlementRequestStatus.Rejected && index.Status != EntitlementRequestStatus.Cancelled && index.Id != this.leaveForm.get('Id').value) {
            let startDate = index.AppliedFrom;
            while (moment(startDate) <= moment(index.AppliedTill)) {

              if (this.LstEntitlementAvailmentRequestDetails != undefined && this.LstEntitlementAvailmentRequestDetails.length > 0 && this.LstEntitlementAvailmentRequestDetails.find(aa => aa.EARId == index.Id && moment(aa.AttendanceDate).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD') && aa.Status == 1) != undefined) {

                // startDate
                console.log('index :', index);
                console.log('form value : ', this.leaveForm.value);
                console.log('startDate :', startDate);
                console.log(_appliedListofDates.filter(a => moment(a.date).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')).length);

                // isExists == false ? _appliedListofDates.length > 0 && _appliedListofDates.filter(a => moment(a.date).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')).length > 0 ? isExists = true : isExists = false : null;
                // console.log('isExists', isExists);
                let appliedfrom = moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD')
                let appliedtill = moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD')
                while (moment(appliedfrom) <= moment(appliedtill)) {
                  if (moment(appliedfrom).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')) {
                    // if(index.IsAppliedForFirstHalf == true && this.leaveForm.get('IsAppliedForFirstHalf').value == true){
                    //   console.log('sssxxxx');

                    // }else if( index.IsAppliedFromSecondHalf == true && this.leaveForm.get('IsAppliedFromSecondHalf').value == true){
                    //   console.log('aaaasss');
                    // }
                    // else if( index.IsAppliedTillFirstHalf == true && this.leaveForm.get('IsAppliedTillFirstHalf').value == true){
                    //   console.log('ssssssggg');
                    // }
                    // else if( index.IsAppliedTillSecondHalf == true && this.leaveForm.get('IsAppliedTillSecondHalf').value == true){
                    //   console.log('scccss');
                    // }
                    isExists = true;
                    res(isExists);
                    break;
                  }
                  appliedfrom = moment(appliedfrom).add(1, 'days').format("YYYY-MM-DD");
                }

                if (moment(index.AppliedFrom).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD')) {
                  isExists = (index.IsAppliedForFirstHalf == this.leaveForm.get('IsAppliedForFirstHalf').value && index.IsAppliedFromSecondHalf == this.leaveForm.get('IsAppliedFromSecondHalf').value
                    && index.IsAppliedTillFirstHalf == this.leaveForm.get('IsAppliedTillFirstHalf').value && index.IsAppliedTillSecondHalf == this.leaveForm.get('IsAppliedTillSecondHalf').value) ? true : false;
                  isExists == false ? (isExists = index.IsAppliedForFirstHalf == this.leaveForm.get('IsAppliedForFirstHalf').value ? true : false) : null
                  isExists == false ? (isExists = index.IsAppliedFromSecondHalf == this.leaveForm.get('IsAppliedFromSecondHalf').value ? true : false) : null
                  isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.leaveForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
                  isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.leaveForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
                  console.log('isex', isExists);
                }
                if (moment(index.AppliedFrom).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD')) {
                  isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.leaveForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
                  isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.leaveForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
                  console.log('isex 2', isExists);

                }
                if (moment(index.AppliedTill).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD')) {
                  isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.leaveForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
                  isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.leaveForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
                  console.log('isex 4', isExists);

                }
                if (moment(index.AppliedTill).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD')) {
                  isExists == false ? (isExists = index.IsAppliedForFirstHalf == this.leaveForm.get('IsAppliedForFirstHalf').value ? true : false) : null
                  console.log('isex1 5', isExists);
                  isExists == false ? (isExists = index.IsAppliedFromSecondHalf == this.leaveForm.get('IsAppliedFromSecondHalf').value ? true : false) : null
                  console.log('isex2 5', isExists);
                  isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.leaveForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
                  console.log('isex3 5', isExists);
                  isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.leaveForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
                  console.log('isex 5', isExists);


                }
                if (isExists == true) {
                  res(isExists);
                  break;
                }
              }
              startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
            }
            // open/known issue is there
            // if (moment(index.AppliedTill).format('YYYY-MM-DD') == moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD')) {

            //   isExists == false ? (isExists = ( index.IsAppliedForFirstHalf == true && index.IsAppliedForFirstHalf == this.leaveForm.get('IsAppliedForFirstHalf').value)? true : false) : null
            //   console.log('isex1 5', isExists);
            //   isExists == false ? (isExists = ( index.IsAppliedFromSecondHalf == true && index.IsAppliedFromSecondHalf == this.leaveForm.get('IsAppliedFromSecondHalf').value) ? true : false) : null
            //   console.log('isex2 5', isExists);
            //   isExists == false ? (isExists =( index.IsAppliedTillFirstHalf == true && index.IsAppliedTillFirstHalf == this.leaveForm.get('IsAppliedTillFirstHalf').value) ? true : false) : null
            //   console.log('isex3 5', isExists);
            //   isExists == false ? (isExists = (index.IsAppliedTillSecondHalf == true &&  index.IsAppliedTillSecondHalf == this.leaveForm.get('IsAppliedTillSecondHalf').value) ? true : false) : null
            //   console.log('isex 5', isExists);


            // }
          }
        }
        res(isExists)

      }
      else {
        res(false);
      }
    });
    return promise;
  }
  do_popup_cancelAppliedRequest(Id) {

    this.do_cancelAppliedRequest(this.inEmployeesInitiateList.find(a => a.Id == Id));

  }

  do_cancelAppliedRequest(item: EntitlementAvailmentRequest) {

    if (item.Status != EntitlementRequestStatus.Rejected && item.Status != EntitlementRequestStatus.Cancelled && item.Status != EntitlementRequestStatus.Approved) {
      $('#popup_edit_attendance').modal('hide');
      this.alertService.confirmSwal1("Confirmation", `You have applied for ${item.AppliedUnits} day(s) from ${moment(new Date(item.AppliedFrom)).format('DD-MM-YYYY')} to ${moment(new Date(item.AppliedTill)).format('DD-MM-YYYY')}. Are you sure you want to Cancel?`, "Yes, Cancel Now", "No, Abort").then((result) => {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })
        swalWithBootstrapButtons.fire({
          title: 'Cancellation Comments',
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
            try {
              this.loadingScreenService.startLoading();
              let currentDate = new Date();
              var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
              entitlementAvailmentRequest.IsApprovedFromSecondHalf = item.IsApprovedFromSecondHalf;
              entitlementAvailmentRequest.IsApprovedForFirstHalf = item.IsApprovedForFirstHalf;
              entitlementAvailmentRequest.ApprovedTill = item.ApprovedTill;
              entitlementAvailmentRequest.IsApprovedTillFirstHalf = item.IsApprovedTillFirstHalf;
              entitlementAvailmentRequest.IsApprovedTillSecondHalf = item.IsApprovedTillSecondHalf;
              entitlementAvailmentRequest.ApprovedUnits = item.ApprovedUnits;
              entitlementAvailmentRequest.ApprovedFrom = item.ApprovedFrom;
              entitlementAvailmentRequest.AppliedOn = moment(item.AppliedOn).format('YYYY-MM-DD hh:mm:ss');;
              entitlementAvailmentRequest.ValidatedOn = moment(item.ValidatedOn).format('YYYY-MM-DD hh:mm:ss');
              entitlementAvailmentRequest.ValidatedBy = item.ValidatedBy;
              entitlementAvailmentRequest.ApplierRemarks = item.ApplierRemarks;
              entitlementAvailmentRequest.CancellationRemarks = jsonStr;
              entitlementAvailmentRequest.ValidatorRemarks = item.ValidatorRemarks;
              entitlementAvailmentRequest.Status = EntitlementRequestStatus.Cancelled;
              entitlementAvailmentRequest.AppliedBy = item.AppliedBy;
              entitlementAvailmentRequest.CalculatedAppliedUnits = item.CalculatedAppliedUnits;
              entitlementAvailmentRequest.AppliedUnits = item.AppliedUnits;
              entitlementAvailmentRequest.IsAppliedTillSecondHalf = item.IsAppliedTillSecondHalf;
              entitlementAvailmentRequest.Id = item.Id;
              entitlementAvailmentRequest.EmployeeId = item.EmployeeId;
              entitlementAvailmentRequest.EmployeeEntitlementId = item.EmployeeEntitlementId;
              entitlementAvailmentRequest.EntitlementType = item.EntitlementType;
              entitlementAvailmentRequest.EntitlementId = item.EntitlementId;
              entitlementAvailmentRequest.EntitlementDefinitionId = item.EntitlementDefinitionId;
              entitlementAvailmentRequest.EntitlementMappingId = item.EntitlementMappingId;
              entitlementAvailmentRequest.UtilizationUnitType = item.UtilizationUnitType;
              entitlementAvailmentRequest.ApplicablePayPeriodId = item.ApplicablePayPeriodId;
              entitlementAvailmentRequest.ApplicableAttendancePeriodId = item.ApplicableAttendancePeriodId;
              entitlementAvailmentRequest.AppliedFrom = moment(item.AppliedFrom).format('YYYY-MM-DD');
              entitlementAvailmentRequest.IsAppliedFromSecondHalf = item.IsAppliedFromSecondHalf;
              entitlementAvailmentRequest.IsAppliedForFirstHalf = item.IsAppliedForFirstHalf;
              entitlementAvailmentRequest.AppliedTill = moment(item.AppliedTill).format('YYYY-MM-DD');
              entitlementAvailmentRequest.IsAppliedTillFirstHalf = item.IsAppliedTillFirstHalf;
              entitlementAvailmentRequest.ActivityList = [];
              entitlementAvailmentRequest.PendingAtUserId = item.AppliedBy;
              entitlementAvailmentRequest.PendingAtUserName = this.UserName;
              entitlementAvailmentRequest.LastUpdatedOn = item.LastUpdatedOn; // this.CurrentDateTime;
              entitlementAvailmentRequest.ApprovalStatus = EntitlementRequestStatus.Applied;
              entitlementAvailmentRequest.ValidatedUserName = item.ValidatedUserName;

              console.log('ENTILMENT REQUEST :: ', entitlementAvailmentRequest);
              this.attendanceService.CancelOnDutyRequestRequest(entitlementAvailmentRequest)
                .subscribe((result) => {

                  let apiResult: apiResult = result;
                  console.log('SUBMITTED RES ::', result);
                  if (apiResult.Status) {
                    this.alertService.showSuccess('Your request has been cancelled successfully!');
                    this.inEmployeesInitiateGridInstance.gridService.updateDataGridItemById(item.Id, item, true, true);
                    this.loadingScreenService.stopLoading();
                    this.close_leaverequest_slider();
                    this.onRefresh();
                  } else {
                    this.alertService.showWarning('Something went wrong! ' + apiResult.Message);
                    this.loadingScreenService.stopLoading();
                  }

                }, err => {

                })


            } catch (error) {
              this.alertService.showWarning('Something went wrong! ' + error);
              this.loadingScreenService.stopLoading();
            }
          } else if (
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }).catch(error => {

      });

    }
    else {
      // this.alertService.showWarning('Action was blocked : Invalid  request - that the  request is already approved/rejected.')
      this.alertService.showWarning(`This request has already been ${EntitlementRequestStatus[item.Status].toLowerCase()}`)
      return;
    }

  }



  GetHolidayCalendarBasedOnApplicability(jsonObj) {
    (async () => {
      try {

        //  this.employeeService.GetEmployeeRequiredDetailsById(this._Session_EmployeeId, EmployeeMenuData.Profile).subscribe((result) => {
        //   let apiResult: apiResult = result;
        //   console.log('EMP REQUIRED DATA PROFILE ::', apiResult)
        //   if (apiResult.Status && apiResult.Result != null) {
        //     var jsonObj: EmployeeDetails = apiResult.Result as any;
        //     this._employeeDOJ = jsonObj.EmploymentContracts[0].StartDate;
        //     this._from_minDate = new Date(this._employeeDOJ);
        //     this._from_minDate.setMonth(this._from_minDate.getMonth());
        //     this._from_minDate.setDate(this._from_minDate.getDate());
        //     this._from_minDate.setFullYear(this._from_minDate.getFullYear());


        //   }

        // }, err => {

        // });

        // await this.attendanceService.GetHolidayCalendarBasedOnApplicability(1, jsonObj.EmploymentContracts[0].ClientId, jsonObj.EmploymentContracts[0].ClientContractId, jsonObj.EmploymentContracts[0].TeamId, 0, 0, jsonObj.EmploymentContracts[0].EmployeeId)
        //   // await this.attendanceService.GetHolidayCalendarBasedOnApplicability(0, this.EmploymentContracts.ClientId, this.EmploymentContracts.ClientContractId, this.EmploymentContracts.TeamId, 0, 0, this.EmploymentContracts.EmployeeId)
        //   .subscribe((result) => {
        //     let apiresult: apiResult = result;
        //     if (apiresult.Status) {
        //       var data = apiresult.Result as any;
        //       console.log('HOLIDAY LIST ::', data);
        //       try {
        //         if (data != null) {
        //           this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList : [];
        //           // this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 1 || a.Type == 2) : [] // whatever is coming from api response keep it in the lst holidays sandeep confiremd, based on the holiday type.
        //         }

        //       } catch (error) {
        //         console.log('HOLIDAY EXE :', error);

        //       }
        //     }


        //   }, err => {

        //   });


        // await this.searchService.getESSDashboardDetails(_employeeCode).subscribe((result) => {
        //   let apiResult: apiResult = result;
        //   if (apiResult.Status) {
        //     var jsonObj1 = JSON.parse(apiResult.Result);
        //     this._employeeBasicDetails = jsonObj1.EmployeeBasicDetails[0];
        await this.getAttendanceRecord();


        //   }
        // }, err => {

        // });
      } catch (error) {
        this.alertService.showWarning('Holiday calendar list not found. ' + error);
        return;
      }

    })();
  }



  // GetHolidayCalendarBasedOnApplicability() {
  //   (async () => {
  //     await this.attendanceService.GetHolidayCalendarBasedOnApplicability(0, this.EmploymentContracts.ClientId, this.EmploymentContracts.ClientContractId, this.EmploymentContracts.TeamId, 0, 0, this.EmploymentContracts.EmployeeId)
  //       .subscribe((result) => {
  //         let apiresult: apiResult = result;
  //         if (apiresult.Status) {
  //           var data = apiresult.Result as any;
  //           console.log('HOLIDAY LIST ::', data);
  //           try {
  //             if (data != null) {
  //               this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 1 || a.Type == 2) : []
  //               // this.LstNonPayabledays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 2) : []


  //             }

  //           } catch (error) {
  //             console.log('HOLIDAY EXE :', error);

  //           }
  //         }

  //       })
  //   })();
  // }

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

    console.log('days', days);

    return Math.abs(days);
  }

  workingDaysBetweenDates = (d0, d1) => {
    /* Two working days and an sunday (not working day) */
    var holidays = ['2021-07-03', '2021-07-05', '2021-07-07'];
    var startDate = new Date(d0);
    var endDate = new Date(d1);

    var s1 = new Date(startDate);
    var e1 = new Date(endDate);
    // Validate input
    if (moment(endDate).format('YYYY-MM-DD') < moment(startDate).format('YYYY-MM-DD')) {
      return 0;
    }
    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1);  // Start just after midnight
    endDate.setHours(23, 59, 59, 999);  // End just before midnight
    var diff = ((endDate as any) - (startDate as any));  // Milliseconds between datetime objects    
    var days = Math.ceil(diff / millisecondsPerDay);
    // Subtract two weekend days for every week in between
    // var weeks = Math.floor(days / 7);
    // days -= weeks * 2;

    // Handle special cases
    var startDay = startDate.getDay();
    var endDay = endDate.getDay();
    // Remove weekend not previously removed.   
    // if (startDay - endDay > 1) {
    //   days -= 2;
    // }
    // Remove start day if span starts on Sunday but ends before Saturday


    // if (startDay == 0 && endDay != 6) {
    //   days--;  
    // }
    // Remove end day if span ends on Saturday but starts after Sunday
    // if (endDay == 6 && startDay != 0) {
    //   days--;
    // }
    /* Here is the code */

    // if(days == 0){
    //   days = Number(days) + 1;
    // }


    // if (this.employeeEntitlement != null && !this.employeeEntitlement.Definition.IsHolidayInclusive) {
    //   console.log('Holidays 0', this.LstHolidays);

    //   this.LstHolidays != null && this.LstHolidays.length > 0 && this.LstHolidays.forEach(day => {

    //     if ((moment(day.Date).format('YYYY-MM-DD') >= moment(d0).format('YYYY-MM-DD')) && (moment(day.Date).format('YYYY-MM-DD') <= moment(d1).format('YYYY-MM-DD'))) {
    //       console.log('days', days);

    //       //  var  day1 = new Date(day);
    //       /* If it is not saturday (6) or sunday (0), substract it */
    //       // if ((day1.getDay() % 6) != 0) {
    //       days--;
    //       // }
    //     }
    //   });

    //   while (moment(s1) <= moment(e1)) {
    //     const weekEndDays = new Date(s1);
    //     if (this.weekOffs.includes(weekEndDays.getDay()) == true) {
    //       days--;
    //     }
    //     s1 = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD') as any;

    //   }
    // }

    return days;
  }

  // parseDateMethod(input) {
  //     // Transform date from text to date
  //   var parts = input;
  //   // new Date(year, month [, date [, hours[, minutes[, seconds[, ms]]]]])
  //   return new Date(parts[0], parts[1]-1, parts[2]); // months are 0-based
  // }

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

  cancelApprovedRequest(selectedItems = []) {
    console.log('selected item ::', selectedItems);


    if (selectedItems.length == 0) {
      this.alertService.showWarning('Please select at least one record and try again')
      return;
    }

    if (selectedItems.filter(a => a.Status != 400).length > 0) {
      // this.alertService.showWarning('Action was blocked : Invalid request - that request is not in approved status');
      this.alertService.showWarning('This request is not in an approved status');
      return;
    }

    var IsAllowToCancel: boolean = false;
    for (let index = 0; index < this._entitlementList.length; index++) {
      const e = this._entitlementList[index];
      for (let j = 0; j < selectedItems.length; j++) {
        const ee = selectedItems[j];

        if (e.EntitlementId == ee.EntitlementId) {
          console.log('ss', ee);

          let formattedADOJ = moment(ee.AppliedFrom).format('YYYY-MM-DD')
          var currentDate = moment().format('YYYY-MM-DD');
          var diff = this.workingDaysBetweenDates1(currentDate, formattedADOJ);
          console.log('formattedADOJ', diff);

          if ((e.Definition.IsAllowToCancelPastDayRequest == true && e.Definition.MaximumAllowedPastDays > 0 && e.Definition.MaximumAllowedPastDays > diff) || diff == 0) {
          }
          else {
            IsAllowToCancel = true;
            break;
          }


        }

      }

    }
    // if (IsAllowToCancel == true) {
    //   this.alertService.showWarning('Action blocked: Request for Leave Not Valid - one or more requests for leave have no authority to cancel the approved leave.');
    //   return;
    // }


    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to Cancel?`, "Yes, Confirm", "No").then((result) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Cancellation Comments',
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

          this.loadingScreenService.startLoading();
          let count = 0;
          selectedItems.length > 0 && selectedItems.forEach(item => {
            count = count + 1;

            this.Bulk_validateEAR(item, jsonStr)

          });

          if (count == selectedItems.length) {
            this.onRefresh();
          }



        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {

        }
      })

    }).catch(error => {

    });

  }



  Bulk_validateEAR(item, jsonStr) {

    console.log('ITEM ::', item);

    this.loadingScreenService.startLoading();
    let currentDate = new Date();
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = item.ApprovedUnits;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(item.AppliedOn).format('YYYY-MM-DD hh:mm:ss');;
    entitlementAvailmentRequest.ValidatedOn = moment(item.currentDate).format('YYYY-MM-DD hh:mm:ss');
    entitlementAvailmentRequest.ValidatedBy = item.ValidatedBy;
    entitlementAvailmentRequest.ApplierRemarks = item.ApplierRemarks;
    entitlementAvailmentRequest.CancellationRemarks = jsonStr;
    entitlementAvailmentRequest.ValidatorRemarks = '';
    entitlementAvailmentRequest.Status = EntitlementRequestStatus.CancelApplied
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
    entitlementAvailmentRequest.LastUpdatedOn = item.LastUpdatedOn; // this.CurrentDateTime;
    entitlementAvailmentRequest.ApprovalStatus = EntitlementRequestStatus.Applied;
    entitlementAvailmentRequest.ValidatedUserName = item.ValidatedUserName;

    console.log('ENTILMENT REQUEST APPROVAL 2:: ', entitlementAvailmentRequest);
    // this.loadingScreenService.stopLoading();
    // return;
    this.attendanceService.ValidateEntitlementAvailmentRequest(entitlementAvailmentRequest).
      subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();
        }

      }, err => {
        this.loadingScreenService.stopLoading();

      })
  }



  getAttendanceRecord() {
    this.attendanceService.GetAttendanceDataByEmployeeId(this._Session_EmployeeId, this.presentMonth, this.presentYear)
      .subscribe((response) => {
        let apiResult: apiResult = response;
        if (apiResult.Status) {
          var _employeeBasicAttendanceDefinition = JSON.parse(apiResult.Result);
          console.log('_employeeBasicAttendanceDefinition', _employeeBasicAttendanceDefinition);

          this.LstEntitlementAvailmentRequestDetails = _employeeBasicAttendanceDefinition.LstEntitlementAvailmentRequestDetails;

         
          // let finalList = [];
          // if (this.LstEntitlementAvailmentRequestDetails.length > 0) {
          //   for (let requestDetail of this.LstEntitlementAvailmentRequestDetails) {
          //     let matchingEntitlement = this._entitlementList.find(entitlement => entitlement.Id === requestDetail.EntitlementId);

          //     if (matchingEntitlement) {
          //       finalList.push(
          //         requestDetail,
          //       );
          //     }
          //   }

          //   this.LstEntitlementAvailmentRequestDetails = finalList;
          // }


          if (this.LstEntitlementAvailmentRequestDetails.length > 0) {
            this.LstEntitlementAvailmentRequestDetails = this.LstEntitlementAvailmentRequestDetails
              .filter(requestDetail => {
                const matchingEntitlement = this._entitlementList.find(entitlement => entitlement.Id === requestDetail.EntitlementId);
                return matchingEntitlement;
              })
              .map(requestDetail => ({ ...requestDetail }));
          }

        } else {
          // this.loadingScreenService.stopLoading();
          console.error('EXECEPTION ERROR LINE NO : 312');
        }


      })

  }


  // only for mobile app 



  selectClaimRequest(obj) {

    console.log('Object ', obj);

    let updateItem = this.inEmployeesInitiateList.find(i => i.Id == obj.Id);
    let index = this.inEmployeesInitiateSelectedItems.indexOf(updateItem);

    console.log(index);

    if (index > -1) {
      this.inEmployeesInitiateSelectedItems.splice(index, 1);
    }
    else {
      this.inEmployeesInitiateSelectedItems.push(obj);
    }

  }

  onFileUpload(e) {
    this.isLoading = true;
    const file = e.target.files[0];
    this.onFileReader(e, this._employeeId).then((s3DocumentId) => {
      this.isLoading = false;
      if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
        this.leaveForm.controls['AdditionalDocumentName'].setValue(file.name);
        this.leaveForm.controls['AdditionalDocumentId'].setValue(s3DocumentId);
      } else {

      }
    })
  }

  doDeleteFile() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure you want to delete?',
      text: "This item will be deleted immediately. You can't undo this file.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {

      if (result.value) {
        if (isGuid(this.leaveForm.value.Id) || this.leaveForm.value.Id == 0) {
          this.deleteAsync(this.leaveForm.value.AdditionalDocumentId, 'file');
        }
        // else if (this.firstTimeDocumentId != this.DocumentId) {
        //   this.deleteAsync();
        // }
        else {
          this.unsavedDocumentLst.push(this.leaveForm.value.AdditionalDocumentId);
          this.leaveForm.controls['AdditionalDocumentName'].setValue(null);
          this.leaveForm.controls['AdditionalDocumentId'].setValue(null);
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }

  onFileReader(e, entityId) {

    const promise = new Promise((resolve, reject) => {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;

      var maxSize = (Math.round(size / 1024) + " KB");
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        resolve(0);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, file.name, null, entityId).then((s3DocumentId) => {
          if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
            resolve(s3DocumentId);
          }
          else {
            resolve(0);
          }
        });
      };
    });
    return promise;
  }

  doAsyncUpload(filebytes, filename, item, EmployeeId) {

    const promise = new Promise((resolve, reject) => {

      try {
        let objStorage = new ObjectStorageDetails();
        objStorage.Id = 0;
        objStorage.EmployeeId = EmployeeId;
        objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
        objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
        objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
        objStorage.ClientContractId = 0;
        objStorage.ClientId = 0;
        objStorage.CompanyId = this.CompanyId;
        objStorage.Status = true;
        objStorage.Content = filebytes;
        objStorage.SizeInKB = 12;
        objStorage.ObjectName = filename;
        objStorage.OriginalObjectName = filename;
        objStorage.Type = 0;
        objStorage.ObjectCategoryName = "EmpTransactions";
        this.fileUploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
          let apiResult: apiResult = (res);
          try {
            if (apiResult.Status && apiResult.Result != "") {
              resolve(apiResult.Result);
            }
            else {
              this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
              resolve(0);
            }
          } catch (error) {
            this.alertService.showWarning("An error occurred while  trying to upload! " + error);
            resolve(0);
          }
        }), ((err) => {

        })

      } catch (error) {
        this.alertService.showWarning("An error occurred while  trying to upload! " + error);
        resolve(0);
      }
    });
    return promise;

  }



  deleteAsync(DocumentId, activity) {

    const promise = new Promise((resolve, reject) => {
      activity == 'file' ? this.isLoading = true : true;
      this.fileUploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          activity == 'file' ? this.isLoading = false : true;
          if (apiResult.Status) {
            var index = this.unsavedDocumentLst.map(function (el) {
              return el.Id
            }).indexOf(DocumentId)
            this.unsavedDocumentLst.splice(index, 1);
            this.leaveForm.controls['AdditionalDocumentName'].setValue(null);
            this.leaveForm.controls['AdditionalDocumentId'].setValue(null);
            activity == 'file' ? this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!") : true;
            resolve(true);
          } else {
            activity == 'file' ? this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message) : true;
            resolve(false);
          }
        } catch (error) {
          this.isLoading = false;
          this.alertService.showWarning("An error occurred while  trying to delete! " + error)
          resolve(false);
        }

      }), ((err) => {

      })
    });
    return promise;

  }
  unsavedDeleteFile(_DocumentId) {
    this.fileUploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(_DocumentId)
          this.unsavedDocumentLst.splice(index, 1)
        } else {
        }
      } catch (error) {
      }
    }), ((err) => {
    })
  }

  downloadFile() {
    this.fileUploadService.getFileBlob(this.employeeEntitlement.Definition.DownloadDocPath).subscribe(
      blob => {
        const filePath = this.employeeEntitlement.Definition.DownloadDocPath;
        const fileName = filePath.split('/').pop();
        FileSaver.saveAs(blob, fileName)
      },
      error => {
        this.alertService.showInfo("The file is not found. Please contact the support team for further assistance.");
        console.log(error);
        return;
      }
    );

  }

  GetEntitlementRequestEndDate(fromDate) {
    console.log('fromdate', fromDate);

    if (fromDate != null && moment(fromDate).format('YYYY-MM-DD') != '1970-01-01') {
      this.leaveForm.controls['AppliedTill'].setValue(null);
      this.attendanceService.GetEntitlementRequestEndDate(this._employeeId, this.employeeEntitlement.Id, moment(fromDate).format('YYYY-MM-DD'))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (result: apiResult) => {
            console.log('Result', result);
            if (result.Status) {
              console.log('Applied From', this.leaveForm.get('AppliedFrom').value);
              if (this.leaveForm.get('AppliedFrom').value != null) {
                this.leaveForm.controls['AppliedTill'].setValue(new Date(result.Result));
                this.leaveForm.controls['AppliedTill'].disable();
              }
            }
          },
          (error) => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning("An error occurred while fetching the entitlement end date.");
            console.error('Error', error);
          }
        );
    }
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
    this.fileUploadService.downloadObjectAsBlob(documentId)
      .pipe(takeUntil(this.unsubscribe$))
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
      var contentType = this.fileUploadService.getContentType(documentName);
      if (contentType === 'application/pdf' || contentType.includes('image')) {

        return this.fileUploadService.getObjectById(documentId).subscribe(
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
        var appUrl = this.fileUploadService.getUrlToGetObject(documentId);
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        this.loadingScreenService.stopLoading();
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
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


      this.fileUploadService.getObjectById(DocId)
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
            const promises = [];
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                promises.push(this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);
                }));
              }
            });
            Promise.all(promises).then(() => {
              this.loadingScreenService.stopLoading();
              var modalDiv = $('#documentviewer');
              modalDiv.modal({ backdrop: false, show: true });
              $('#carouselExampleCaptions').carousel();
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
      const contentType = this.fileUploadService.getContentType(item.name);
      const blob = new Blob([item._data.compressedContent], { type: contentType });

      const reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = () => {
        const base64String = (reader.result as string).split(",")[1];
        if (blob !== null) {
          const urll = 'data:' + contentType + ';base64,' + base64String;
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log('DOCUMENT URL:', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl });
        }
      };
    });

    return promise;
  }

  displayPDFsFromZip(zipFileContent) {
    const zip = new JSZip();

    zip.loadAsync(zipFileContent, { base64: true }).then((contents) => {
      const pdfPromises = [];

      Object.keys(contents.files).forEach((filename) => {
        if (filename.toLowerCase().endsWith('.pdf')) {
          const pdfPromise = contents.files[filename].async('blob').then((blob) => {
            const url = URL.createObjectURL(blob);
            console.log('url', url);

            return this.sanitizer.bypassSecurityTrustResourceUrl(url);
          });
          pdfPromises.push(pdfPromise);
        }
      });

      Promise.all(pdfPromises).then((pdfUrls) => {
        // Assuming you want to display the first PDF in the iframe
        if (pdfUrls.length > 0) {
          this.pdfSrc = pdfUrls[0];
        }
      });
    });
  }

  onChangeCompOffDates(evt) {
    console.log(evt);
    if (evt) {
      this.leaveForm.controls['AppliedFrom'].setValue(null);
      this.leaveForm.controls['AppliedTill'].setValue(null);
      if (this.employeeEntitlement && !this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff) {
        this.availableUnitsForCompOff = evt.ApplicableUnits;
        this._from_minDate = this.parseInputDate(evt.AttendanceDate);
        this._from_minDate.setMonth(this._from_minDate.getMonth());
        this._from_minDate.setDate(this._from_minDate.getDate() + 1);
        this._from_minDate.setFullYear(this._from_minDate.getFullYear());
      } else if (this.employeeEntitlement && this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff) {
        this.availableUnitsForCompOff = evt.reduce((acc, curr) => acc + curr.ApplicableUnits, 0);
        const dateObjects = evt.map(item => this.parseInputDate(item.AttendanceDate));
        const minDate = new Date(Math.min(...dateObjects));
        this._from_minDate = new Date(minDate);
        this._from_minDate.setMonth(this._from_minDate.getMonth());
        this._from_minDate.setDate(this._from_minDate.getDate() + 1);
        this._from_minDate.setFullYear(this._from_minDate.getFullYear());
      }
      
    }
  }

  parseInputDate(dateStr) {
    const [day, month, year] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  callNumberOfDaysForODAppliedAPI() {
    const currentDate = new Date();
    this.leaveDaysApplied  = '';
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = 0;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');;
    entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');
    entitlementAvailmentRequest.ValidatedBy = 0;
    entitlementAvailmentRequest.ApplierRemarks = this.leaveForm.get('ApplierRemarks').value;
    entitlementAvailmentRequest.CancellationRemarks = '';
    entitlementAvailmentRequest.ValidatorRemarks = '';
    entitlementAvailmentRequest.Status = EntitlementRequestStatus.Applied;
    entitlementAvailmentRequest.AppliedBy = this.UserId;
    entitlementAvailmentRequest.CalculatedAppliedUnits = this.leaveForm.get('CalculatedAppliedUnits').value == null ? 0 : this.leaveForm.get('CalculatedAppliedUnits').value;
    entitlementAvailmentRequest.AppliedUnits = this.leaveForm.get('AppliedUnits').value;
    entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
    entitlementAvailmentRequest.Id = this.leaveForm.get('Id').value;
    entitlementAvailmentRequest.EmployeeId = this.selectedEntitlement.EmployeeId;
    entitlementAvailmentRequest.EmployeeEntitlementId = this.selectedEntitlement.Id;
    entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
    entitlementAvailmentRequest.EntitlementId = this.selectedEntitlement.Entitlement.Id;// this.leaveForm.get('Entitlement').value;
    entitlementAvailmentRequest.EntitlementDefinitionId = this.selectedEntitlement.EntitlementDefinitionId;
    entitlementAvailmentRequest.EntitlementMappingId = this.selectedEntitlement.EntitlementMappingId;
    entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
    entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
    entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
    entitlementAvailmentRequest.AppliedFrom = moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedFromSecondHalf = this.leaveForm.get('IsAppliedFromSecondHalf').value;
    entitlementAvailmentRequest.IsAppliedForFirstHalf = this.leaveForm.get('IsAppliedForFirstHalf').value;
    entitlementAvailmentRequest.AppliedTill = moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedTillFirstHalf = this.leaveForm.get('IsAppliedTillFirstHalf').value;
    entitlementAvailmentRequest.ActivityList = [];
    entitlementAvailmentRequest.PendingAtUserId = 0;
    entitlementAvailmentRequest.PendingAtUserName = '';
    entitlementAvailmentRequest.ApprovalStatus = EntitlementRequestStatus.Applied;
    entitlementAvailmentRequest.CompensationDates = null;
   if (this.leaveForm.get('compOffDates').value && this.employeeEntitlement && this.employeeEntitlement.Definition.IsCompOff) {
      if (!this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff) {
        const datesArr = [this.leaveForm.get('compOffDates').value].map(el => ({
          UtilizationDate: moment(new Date(el.AttendanceDate)).format('YYYY-MM-DD'),
          UtilizedUnits: this.leaveForm.get('AppliedUnits').value
        }));
        entitlementAvailmentRequest.CompensationDates = datesArr as any;
      } else {
        const datesArr = this.leaveForm.get('compOffDates').value.map(el => ({
          UtilizationDate: moment(new Date(el.AttendanceDate)).format('YYYY-MM-DD'),
          UtilizedUnits: this.leaveForm.get('AppliedUnits').value
        }));
        entitlementAvailmentRequest.CompensationDates = datesArr;
      }
    }
    
    this.leaveForm.get('AdditionalDateInput').value != null ? entitlementAvailmentRequest.AdditionalDate = moment(new Date(this.leaveForm.get('AdditionalDateInput').value)).format('YYYY-MM-DD') : true;
    this.leaveForm.get('AdditionalDocumentId').value != null && this.leaveForm.get('AdditionalDocumentId').value > 0 ? entitlementAvailmentRequest.DocumentId = this.leaveForm.get('AdditionalDocumentId').value : true;
    this.leaveForm.get('AdditionalDocumentName').value != null && this.leaveForm.get('AdditionalDocumentName').value != '' ? entitlementAvailmentRequest.DocumentName = this.leaveForm.get('AdditionalDocumentName').value : true;

    console.log('ENTILMENT REQUEST :: ', entitlementAvailmentRequest);
    this.attendanceService.getNumberOfOnDutyDaysApplied(entitlementAvailmentRequest).subscribe((result) => {
      let apiResult: apiResult = result;
      console.log('putNumberOfDaysForAppliedLeave RES ::', result);
      if (apiResult.Status && apiResult.Message && apiResult.Message != '') {
        this.leaveDaysApplied = apiResult.Message;
      } else {
        this.alertService.showWarning(apiResult.Message);
        this.leaveDaysApplied  = '';
      }
    }, err => {
      console.warn('error while calling putNumberOfDaysForAppliedLeave API', err);
    });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}

