import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AttendanceService } from '@services/service/attendnace.service';
import * as moment from 'moment';
import * as _ from 'lodash';
import { AlertService, EmployeeService, FileUploadService, SessionStorage } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResult } from 'src/app/_services/model/apiResult';
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
} from 'date-fns';
import { CalendarDateFormatter, CalendarEvent, CalendarMonthViewDay, CalendarView } from 'angular-calendar';
import { CustomDateFormatter } from '../employee-attendance-view/custom-date-formatter.provider';
import { DatePipe } from '@angular/common';
import { EntitlementRequestStatus, EntitlementType } from '@services/model/Attendance/AttendanceEnum';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { environment } from 'src/environments/environment';
import { Subject, of } from 'rxjs';
import { AttendanceConfiguration, RegularizationType } from '@services/model/Attendance/AttendanceConfiguration';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RegularizeAttendanceModalComponent } from 'src/app/shared/modals/attendance/regularize-attendance-modal/regularize-attendance-modal.component';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { EntitlementAvailmentRequest, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { DomSanitizer, SafeResourceUrl, Title } from '@angular/platform-browser';
import { catchError, takeUntil } from 'rxjs/operators';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import FileSaver from 'file-saver';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { ObjectStorageDetails } from '@services/model/Candidates/ObjectStorageDetails';
import { isGuid } from 'src/app/utility-methods/utils';
import Swal from 'sweetalert2';

export function calculateDiff(dateSent) {
  let currentDate = new Date();
  dateSent = new Date(dateSent);
  return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
}


export class EmployeeAttendanceDefinitionNew {
  HolidaysCount: number;
  LeavesCount: number;
  WeekOffsCount: number;
  WorkedDays: number;
  WorkingDays: number;
  AreMultipleClockInsAllowed: boolean;
  IsClockInRemarksMandatory: boolean;
  IsClockOutRemarksMandatory: boolean;
  IsGeoFencingRequired: boolean;
  IsGeoTaggingRequired: boolean;
  IsPhotoCaptureRequiredOnClockIn: boolean;
  IsPhotoCaptureRequiredOnClockOut: boolean;
  WorkShiftList: any;
  LstDates: any;
}

const colors: any = {
  absent: {
    primary: '#FF5555',
    secondary: '#FAE3E3',
  },
  holiday: {
    primary: '#8E44AD',
    secondary: '#D1E8FF',
  },
  leave: {
    primary: '#F39C12',
    secondary: '#FDF1BA',
  },
  present: {
    primary: '#3BBD72',
    secondary: '#3BBD72'
  },
  weekoff: {
    primary: '#FFE79A',
    secondary: '#C9C3B2'
  },
  workonweekoff: {
    primary: '#F368E0',
    secondary: '#C9C3B2'
  },
  permission: {
    primary: '#365879',
    secondary: '#C9C3B2'
  },
  od: {
    primary: '#2506E2',
    secondary: '#C9C3B2'
  },
  wfh: {
    primary: '#00A8FF',
    secondary: '#C9C3B2'
  },
  leaveApproval: {
    primary: '#F39C12',
    secondary: '#F39C12'
  }
};

type CalendarPeriod = 'day' | 'week' | 'month';

@Component({
  selector: 'app-employee-attendance-manager-view',
  templateUrl: './employee-attendance-manager-view.component.html',
  styleUrls: ['./employee-attendance-manager-view.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ]
})
export class EmployeeAttendanceManagerViewComponent implements OnInit {
  private destroy$ = new Subject<void>();

  spinner: boolean = false;
  clientId: any;
  clientContractId: any;
  employeeList: any[] = [];
  selectedEmployee: any;
  showCalendar: boolean = false;
  calendarSpinner: boolean = false;
  userId: any = 0;
  sessionDetails: LoginResponses;

  customOptions: OwlOptions = {
    loop: false,
    // margin: 10,
    nav: true,

    navText: [
      "<i class='mdi mdi-arrow-left-drop-circle'></i>",
      "<i class='mdi mdi-arrow-right-drop-circle'></i>"
    ],
    autoplay: false,
    autoplayHoverPause: false,
    responsive: {
      0: {
        items: 1
      },
      400: {
        items: 2
      },
      740: {
        items: 2
      },
      940: {
        items: 4
      }
    },
  };

  @Input() start: boolean;
  @Input() showTimerControls: boolean;
  @ViewChild('datetime') myDiv: ElementRef;
  currentDate: Date = new Date();
  isNextMonth: boolean = false;
  isPastMonth: boolean = false;

  // LOP Calendar
  view: CalendarView | CalendarPeriod = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  minDate: Date = subMonths(new Date(), 1);
  maxDate: Date = addMonths(new Date(), 1);
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;
  refresh: Subject<any> = new Subject();

  _attendanceConfiguration: AttendanceConfiguration = new AttendanceConfiguration();
  _employeeBasicDetails: EmployeeDetails;
  _employeeBasicAttendanceDefinition: EmployeeAttendanceDefinitionNew = new EmployeeAttendanceDefinitionNew();
  LstattendancePeriod: any;
  LstworkShiftMapping: any;
  LstEmployeeWorkingDaysMapping: any
  LstAttendanceGeoFenceCoordinatesMapping: any;
  LstEntitlement: any;
  LstEntitlementAvailmentRequest: any;
  LstEntitlementAvailmentRequestDetails: any;
  LstEmployeeAttendanceBreakUpDetails: any;
  EmploymentContract: any;
  // ATTENDANCE CONFIG
  isLocationRequired: boolean = false;
  isLocationAccessed: boolean = false;
  isIpAddressRequired: boolean = false;
  isIpAddressAccessed: boolean = false;
  deviceInfo = null;
  IPDetails: any;
  _permissionConfig: any;
  _submittedHours: any;
  _permissionConfigClientBased: any;
  _clientId: any;
  lstHolidays: any = [];
  // MARK AS PRESENT
  selectedMonthViewDay: CalendarMonthViewDay;
  selectedDayViewDate: Date;
  selectedDays: any = [];

  presentMonth: number = 0;
  presentYear: number = 0;

  showTotalHours: boolean = false;
  selectedMonthName: any = '';
  entitlementCards = [];

  showSliderForWeb: boolean = false;
  sliderTitle: string = '';
  lstPunches: any[] = [];
  selectedCalendarObj: any;
  selectedBreakUpObject: any;
  isMobileResolution: boolean;
  modalOption: NgbModalOptions = {};
  leaveForm: FormGroup;
  _Entitlement: FormControl = new FormControl({ value: '', disabled: true });
  employeeEntitlement: EmployeeEntitlement = null;
  private unsubscribe$ = new Subject<void>();

  weekOffDays = [0, 2];
  _entitlementAvailmentRequests: EntitlementAvailmentRequest[] = [];

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
  lstRelation: any[] = [];

  _from_minDate: Date;
  _till_minDate: Date;
  _from_maxDate: Date;
  appliedTillMaxDate = new Date();
  selectedEntitlement: EmployeeEntitlement = new EmployeeEntitlement();
  minDateForAdditionalDateInput: Date = new Date();
  isDisabledTillDate: boolean = false;
  isDisabledTillFirstHalf: boolean = false;
  isDisabledFromSecondHalf: boolean = false;
  IsShowBalanceInUI: boolean = false;
  IsLossOfPay: boolean = false;
  tabName: any;
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
  _employeeDOJ: any = null;
  isLoading: boolean = false;
  unsavedDocumentLst = [];
  _entitlementList: any[] = [];
  leaveEntitlementList: any[] = [];
  odEntitlementList: any[] = [];
  popupTitle = 'Leave';
  submitted: boolean = false;

  BusinessType: any;
  CompanyId: any;
  showRegularizeBtn: boolean = false;
  regularizedPunchDetails = [];
  existingPunchDetails = [];
  regularizedAttendanceData = [];
  existingAttendanceData = [];

  constructor(
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private employeeService: EmployeeService,
    private loadingScreen: LoadingScreenService,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private fileUploadService: FileUploadService,
    public utilsHelper: enumHelper
  ) { }

  ngOnInit() {
    this.clientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    this.clientContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userId = this.sessionDetails.UserSession.UserId;

    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.sessionDetails.Company.Id;
    this.loadingScreen.startLoading();
    this.spinner = true;
    this.createForm();
    let hasWarningShown = false;
    this.employeeService.getApplicableEmployeeDetails(this.clientId).subscribe((result) => {
      console.log('getApplicableEmployeeDetails', result);
      this.employeeList = [];
      if (result.Status && result.Result && result.Result != '') {
        const parsedResponse = JSON.parse(result.Result);
        parsedResponse.map(element => {
          element.LabelName = `${element.Name} (${element.Code})`;
        });
        this.employeeList = parsedResponse;
        setTimeout(() => {
          this.spinner = false;
          this.loadingScreen.stopLoading();
        }, 1000);
      } else {
        this.spinner = false;
        this.loadingScreen.stopLoading();
        if (!hasWarningShown) {
          result.Message ? this.alertService.showWarning(result.Message) : this.alertService.showWarning(`Please try again later !`);
          hasWarningShown = true;
        }
      }
    }, err => {
      this.loadingScreen.stopLoading();
      console.log('ERROR IN getApplicableEmployeeDetails API -->', err);
    })
  }

  onChangeEmpDropdown(evt) {

  }

  onSearchEmpAttendance() {
    console.log(this.selectedEmployee);
    this.showCalendar = false;
    this.calendarSpinner = true;
    this.GetAttendanceConfigurationByEmployeeId(this.selectedEmployee).then((result) => {
      const apiresult = result as apiResult;
      this.calendarSpinner = false;
      this.getEmployeeDetails();
      this.getEmployeeODEntitlementList();
      try {
        if (apiresult.Status && apiresult.Result != null) {
          this.showCalendar = true; 
          this._attendanceConfiguration = (apiresult.Result) as any;
        } else {
          this.spinner = true;
          this.alertService.showWarning("Unable to find attendance configuration. Please give it a shot after a while.")
          console.error('ELSE PART ERR : COULD NOT FIND THE RESULT AT ATTENANCE CONFIG');
        }
      } catch (err) {
        console.error('CATCH EXECPTION IN GetAttendanceConfigurationByEmployeeId API :', err);
      }
    });
  }

  async GetAttendanceConfigurationByEmployeeId(employeeId) {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetAttendanceConfigurationByEmployeeId(employeeId).subscribe((configResponse) => {
        console.log('ATTEN CONFIG :: ', configResponse);
        this.getEmployeeEntitlementList(employeeId);
        this.viewDate = new Date();
        this.presentMonth = (new Date().getMonth() + 1);
        this.presentYear = new Date().getFullYear();
        this.getAttendanceRecord(this.presentMonth, this.presentYear);
        res(configResponse);
      });
    });
    return promise;
  }

  getEmployeeEntitlementList(employeeId) {
    this.entitlementCards = [];
    this.attendanceService
    .GetEmployeeEntitlementListForProxy(employeeId, EntitlementType.Leave)
    .pipe(
      catchError(err => {
        console.error('Error fetching entitlement list:', err);
        return of(null);
      })
    )
    .subscribe((result: apiResult) => {
      if (result && result.Status && result.Result != null) {
        this.processEntitlementList(result.Result);
      }
    });
  }

  private processEntitlementList(entitlements: any) {
    console.log('RES ENTITLEMENTLIST::', entitlements);
    this.entitlementCards = entitlements.filter(entitlement => entitlement.ShowBalanceInUI);
    this.leaveEntitlementList = entitlements;
    this._entitlementList = [...this.leaveEntitlementList];
    console.log('Processed Entitlement List:', { 
      entitlementCards: this.entitlementCards,
      leaveEntitlementList: this.leaveEntitlementList,
      _entitlementList: this._entitlementList
    });
  }

  async getEmployeeODEntitlementList() {
    const entitlementListResult = await this.attendanceService.getEmployeeODList(this.selectedEmployee, EntitlementType.Leave)
      .toPromise();
    console.log('RES OD ENTITLEMENTLIST::', entitlementListResult);
    const apiResultEntitlementList: apiResult = entitlementListResult;
    if (apiResultEntitlementList.Status && apiResultEntitlementList.Result != null) {
      this.odEntitlementList = apiResultEntitlementList.Result as any;
    }
  }

  enumerateDaysBetweenDates(startDate, endDate) {
    let date = []
    this.events = [];
    while (moment(startDate) <= moment(endDate)) {
      const weekEndDays = new Date(startDate);
      this.events.push({
        start: new Date(startDate),
        id: 0,
        end: new Date(startDate),
        title: '',
        color: colors.od,
        cssClass: '',
        meta: {
          breakupObject: null,
          isNonPayableday: false,
          FirstHalfCode: '',
          SecondHalfCode: '',
          FirstHalfType: '',
          SecondHalfType: '',
          attendanceType: null,
          isFirstHalfAndSecondHalfSame: true,
          StatusInUI: '',
          FirstIn: '--:--',
          LastOut: '--:--'
        }
      })
      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

    }
    console.log('enumerate dates', this.events);

    return date;
  }

  getAttendanceRecord(month, year) {
    const { startDate, endDate } = this.getMonthStartAndEndDatesFormatted(year, month);
    this.selectedMonthName = moment.months()[this.presentMonth - 1];
    this.enumerateDaysBetweenDates(new Date(startDate), new Date(endDate));

    const startOfMonth = moment().clone().startOf('months').subtract(6, 'months').format('YYYY-MM-DD hh:mm');
    const endOfMonth = moment().clone().endOf('months').add(5, 'months').format('YYYY-MM-DD hh:mm');

    this.minDate = new Date(startOfMonth);
    this.maxDate = new Date(endOfMonth);
    this._employeeBasicAttendanceDefinition = null;
    this.lstHolidays = [];
    this.attendanceService.GetEmployeeAttendanceDetailsByFromTodate(this.selectedEmployee, startDate, endDate).subscribe((result) => {
      console.log('result', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != '') {
        const response = apiResult.Result as any;
        this._employeeBasicAttendanceDefinition = JSON.parse(JSON.stringify(response));
        console.log('this._employeeBasicAttendanceDefinition', this._employeeBasicAttendanceDefinition);
        this.LstworkShiftMapping = this._employeeBasicAttendanceDefinition.WorkShiftList && this._employeeBasicAttendanceDefinition.WorkShiftList.length > 0 ? this._employeeBasicAttendanceDefinition.WorkShiftList[0] : null;
        this._clientId = response.WorkShiftList && response.WorkShiftList.length > 0 ? response.WorkShiftList[0].ClientId : 0;

        this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId));
        this._permissionConfigClientBased = null;
        environment.environment.AttendanceUIPermissionText != null ? this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId) != undefined ? environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId) : environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == 0)) : true;

        this.LstEmployeeAttendanceBreakUpDetails = response.LstDates ? response.LstDates : [];

        this.LstEmployeeAttendanceBreakUpDetails && this.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.LstEmployeeAttendanceBreakUpDetails.forEach(e => {
          try {
            // get Holidays list
            if (e.IsHoliday) {
              this.lstHolidays.push({ date: moment(e.Date).format("DD MMM YYYY"), holidayName: e.HolidayInfo });
            }
            // map calendar data
            let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(e.Date).format('YYYY-MM-DD'));
            if (renovate) {
              renovate.meta.breakupObject = e;
              renovate.meta.isWeekAndHoliday = false;
              renovate.meta.isNonPayableday = e.isNonPayableday ? e.isNonPayableday : false;
              renovate.meta.FirstHalfCode = e.FirstHalfCode ? e.FirstHalfCode : '';
              renovate.meta.SecondHalfCode = e.SecondHalfCode ? e.SecondHalfCode : '';
              renovate.meta.attendanceType = e.AttendanceCode;
              renovate.meta.FirstHalfType = e.FirstHalfType ? e.FirstHalfType : '';
              renovate.meta.SecondHalfType = e.SecondHalfType ? e.SecondHalfType : '';
              renovate.meta.isFirstHalfAndSecondHalfSame = e.FirstHalfType === e.SecondHalfType;
              renovate.meta.StatusInUI = e.FirstHalfType && e.SecondHalfType && e.FirstHalfType === e.SecondHalfType ? this.getAttendanceType(e) : '';
              renovate.meta.FirstIn = e.FirstClockIn ? e.FirstClockIn : '--:--';
              renovate.meta.LastOut = e.LastClockOut && e.LastClockOut !== e.FirstClockIn ? e.LastClockOut : '--:--';
              if (e.FirstHalfType && e.FirstHalfType === e.SecondHalfType) {
                // when first half and second half are same
                if (e.FirstHalfCode.toLowerCase() === 'on duty' && e.FirstHalfType.toLowerCase() === 'leave') {
                  renovate.color = this.getColorForAttendanceType(e.FirstHalfCode);  // OD color
                } else if (e.FirstHalfType.toLowerCase() === 'leave' && e.FirstHalfRequestStatus == EntitlementRequestStatus.Applied) {
                  renovate.color = this.getColorForAttendanceType('LEAVE_APPROVAL');  // applied leave color code
                } else {
                  renovate.color = this.getColorForAttendanceType(e.FirstHalfType);
                }
              } else {
                // when first half and second half are different
                if (e.FirstHalfType) {
                  if (e.FirstHalfCode.toLowerCase() === 'on duty' && e.FirstHalfType.toLowerCase() === 'leave') {
                    renovate.meta.firstHalfColor = this.getColorForAttendanceType(e.FirstHalfCode);  // OD color
                  } else if (e.FirstHalfType.toLowerCase() === 'leave' && e.FirstHalfRequestStatus == EntitlementRequestStatus.Applied) {
                    renovate.meta.firstHalfColor  = this.getColorForAttendanceType('LEAVE_APPROVAL');  // applied leave color code
                  } else {
                    renovate.meta.firstHalfColor = this.getColorForAttendanceType(e.FirstHalfType);
                  }
                }
                if (e.SecondHalfType) {
                  if (e.SecondHalfCode.toLowerCase() === 'on duty' && e.SecondHalfType.toLowerCase() === 'leave') {
                    renovate.meta.secondHalfColor = this.getColorForAttendanceType(e.SecondHalfCode);  // OD color
                  } else if (e.SecondHalfType.toLowerCase() === 'leave' && e.SecondHalfRequestStatus == EntitlementRequestStatus.Applied) {
                    renovate.meta.secondHalfColor  = this.getColorForAttendanceType('LEAVE_APPROVAL'); // applied leave color code
                  } else {
                    renovate.meta.secondHalfColor = this.getColorForAttendanceType(e.SecondHalfType);
                  }
                }
              }
            }
          } catch (error) {
            console.log('error in try catch line number 514 ---', e, error);
          }
        });
        console.log('--- holiday / this.events ---', this.lstHolidays, this.events);
        this.spinner = false;
        this.loadingScreen.stopLoading();
      } else {
        this.dateOrViewChanged();
        this.alertService.showWarning(apiResult.Message + ": " + apiResult.Result);
        this.spinner = false;
        this.loadingScreen.stopLoading();
      }
    });
  }

  getAttendanceType(event) {
    if (event.FirstHalfType != "" && event.SecondHalfType != "" && event.FirstHalfType === event.SecondHalfType) return `${event.FirstHalfType}`;
    if (event.PermissionList && event.PermissionList.length > 0 && event.FirstHalfType === '' && event.SecondHalfType === '') return 'Permission';
    if (event.IsHoliday || (event.FirstHalfType.toUpperCase() === 'HOLIDAY' && event.SecondHalfType.toUpperCase() === 'HOLIDAY')) return `${event.FirstHalfType}`;
    if (event.IsWeekOff || (event.FirstHalfType.toUpperCase() === 'WEEKOFF' && event.SecondHalfType.toUpperCase() === 'WEEKOFF')) return `${event.FirstHalfType}`;
    // if ((event.FirstHalfType != "" || event.SecondHalfType != "") && event.FirstHalfType !== event.SecondHalfType) return `${event.FirstHalfType} ${event.SecondHalfType}`;
    return '';
  }

  getColorForAttendanceType(type: string) {
    switch (type.toUpperCase()) {
      case 'PRESENT':
        return colors.present;
      case 'ABSENT':
        return colors.absent;
      case 'LOP':
        return colors.absent;
      case 'LEAVE_APPROVAL':
        return colors.leaveApproval;
      case 'LEAVE':
        return colors.leave;
      case 'HOLIDAY':
        return colors.holiday;
      case 'WO':
        return colors.weekoff;
      case 'WEEKOFF':
        return colors.weekoff;
      case 'WORKONWEEKOFF':
        return colors.workonweekoff;
      case 'WORKFROMHOME':
        return colors.wfh;
      case 'PERMISSION':
        return colors.permission;
        case 'ONDUTY':
          case 'ON DUTY':
          case 'OD':
            return colors.od;
      default:
        return colors.leave;
    }
  }

  getnoOfHours(calendarObject) {
    var totalcalculatedHours = 0;
    if (calendarObject.meta.breakupObject != null && calendarObject.meta.breakupObject.AttendanceBreakUpDetailsType != 400) {
      totalcalculatedHours = calendarObject.meta.breakupObject.TotalSubmittedHours != null && calendarObject.meta.breakupObject.TotalSubmittedHours != undefined ? calendarObject.meta.breakupObject.TotalSubmittedHours.toFixed(2) : 0;
      return Number.isNaN(totalcalculatedHours) == true ? null : totalcalculatedHours == 0 ? null : `${totalcalculatedHours} Hrs`;
    } else {
      return null;
    }
  }

  getnoOfHours1(calendarObject) {
    var totalcalculatedHours = 0;
    if (calendarObject.meta.breakupObject != null && calendarObject.meta.breakupObject.AttendanceBreakUpDetailsType != 400) {
      totalcalculatedHours = calendarObject.meta.breakupObject.TotalApprovedHours != null && calendarObject.meta.breakupObject.TotalApprovedHours != undefined ? calendarObject.meta.breakupObject.TotalApprovedHours.toFixed(2) : 0;
      return Number.isNaN(totalcalculatedHours) == true ? null : totalcalculatedHours == 0 ? null : `/${totalcalculatedHours} Hrs`;

    } else {
      return null;
    }
  }

  getDayHoursConsidered(breakupObject) {

    if (breakupObject && breakupObject.DayHoursConsidered != null) {
      let dayHrsConsidered = parseFloat(breakupObject.DayHoursConsidered.toFixed(2));

      if (!isNaN(dayHrsConsidered) && dayHrsConsidered !== 0) {
        const hours = Math.floor(dayHrsConsidered);
        const minutes = Math.round((dayHrsConsidered - hours) * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
      }
    }
    return null;
  }

  checkIsCurrentDate(calendarEvent) {
    return moment(calendarEvent.start).isSame(moment(), 'day');
  }

  formatOneTimeRange(timeStr) {
    const timeArr = timeStr.split(':');
    const date = new Date().setHours(timeArr[0], timeArr[1], timeArr[2]);
    return moment(date).format("h:mm A");
  }

  getMonthStartAndEndDatesFormatted(year, month) {
    // Create a Date object for the first day of the month
    const startDate = new Date(year, month - 1, 1);

    // Get the last day of the month by moving to the next month's first day and subtracting one day
    const endDate = new Date(year, month, 0);

    // Format the dates to "MM-DD-YYYY" format
    const formatDateToMMDDYYYY = (date) => {
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Months are zero-based
      const day = date.getDate().toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    };

    const startDateFormatted = formatDateToMMDDYYYY(startDate);
    const endDateFormatted = formatDateToMMDDYYYY(endDate);

    return { startDate: startDateFormatted, endDate: endDateFormatted };
  }

  onRefreshModal() {
    this.getAttendanceRecord(this.presentMonth, this.presentYear);
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
    this.loadingScreen.startLoading();
    this.changeDate(this.addPeriod(this.view, this.viewDate, 1));
    this.presentMonth = (new Date(this.viewDate).getMonth() + 1);
    this.presentYear = new Date(this.viewDate).getFullYear();
    this.getAttendanceRecord(this.presentMonth, this.presentYear);
  }

  decrement(): void {
    this.loadingScreen.startLoading();
    this.changeDate(this.subPeriod(this.view, this.viewDate, 1));
    this.presentMonth = (new Date(this.viewDate).getMonth() + 1);
    this.presentYear = new Date(this.viewDate).getFullYear();
    this.getAttendanceRecord(this.presentMonth, this.presentYear);
  }

  today(): void {
    this.changeDate(new Date());
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
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


  isCurrentDay(date: Date): boolean {
    return moment(date).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD');
  }

  async dayClicked({ date, events }: { date: Date; events: CalendarEvent<{}>[]; }) {
    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    console.log(events);
    this.selectedDays = [];
    this.selectedCalendarObj = events && events.length ? events[0] : null;
    this.lstPunches = [];
    this.showRegularizeBtn = true;
    if (events && events.length) {
      this.selectedDays.push(moment(events[0].start).format('YYYY-MM-DD'));
    }
    // if (moment(this.selectedDays, "YYYY-MM-DD").isAfter(moment(currentDate, "YYYY-MM-DD"))) {
    //   this.loadingScreen.stopLoading();
    //   this.alertService.showWarning_withTimeOut("Cannot select future date !", 3500);
    //   return;
    // }
    if (this._attendanceConfiguration.RegularizationType == RegularizationType.Detailed) {
      this.sliderTitle = moment(date).format("DD MMM YYYY");
      if (events[0].meta['breakupObject'] && events[0].meta['breakupObject'].LstPunches && events[0].meta['breakupObject'].LstPunches.length) {
        this.selectedBreakUpObject = JSON.parse(JSON.stringify(events[0].meta['breakupObject']));
        // get Shift details for the selected day
        const shift = this._employeeBasicAttendanceDefinition.WorkShiftList.filter(s => s.Id === this.selectedBreakUpObject.WorkShiftDefinitionId);
        this.LstworkShiftMapping = shift && shift.length > 0 ? shift[0] : this.LstworkShiftMapping;
        if (this.selectedBreakUpObject.IsRegularizationSubmitted == 1) {
          this.showRegularizeBtn = false;
          this.loadingScreen.startLoading();
          await this.getRegularizedPunchDetails(this.selectedEmployee, this.selectedDays[0]);
          
          this.showSliderForWeb = this.isMobileResolution ? false : true;
          this.loadingScreen.stopLoading();
        } else {
          this.selectedBreakUpObject.LstPunches.forEach(e => {
            e.PunchInType = e.PunchInType === 0 ? 1 : e.PunchInType;
            e.PunchOutType = e.PunchOutType === 0 ? 2 : e.PunchOutType;
            const punchInObject = e.Starttime ? this.createPunchObject(e.PunchInHalf, e.PunchInType, e.Starttime, e.PunchInLocationId, e.PunchInLocationName, e.PunchInDeviceId, e.PunchInDeviceName, e.PunchInRemarks) : {} as any;
            const punchOutObject = e.FinishTime ? this.createPunchObject(e.PunchOutHalf, e.PunchOutType, e.FinishTime, e.PunchOutLocationId, e.PunchOutLocationName, e.PunchOutDeviceId, e.PunchOutDeviceName, e.PunchOutRemarks) : {} as any;
            if (punchInObject && Object.keys(punchInObject).length) {
              this.lstPunches.push(punchInObject);
            }
            if (punchOutObject && Object.keys(punchOutObject).length) {
              this.lstPunches.push(punchOutObject);
            }
          });
          this.showSliderForWeb = true;
        }
      } else {
        console.log('No Punches data found !');
        this.selectedBreakUpObject = events && events.length ? events[0].meta['breakupObject'] : null;
        if(this.selectedBreakUpObject && this.selectedBreakUpObject.WorkShiftDefinitionId) {
          const shift = this._employeeBasicAttendanceDefinition.WorkShiftList.filter(s => s.Id === this.selectedBreakUpObject.WorkShiftDefinitionId);
          this.LstworkShiftMapping = shift && shift.length > 0 ? shift[0] : this.LstworkShiftMapping;
        }
        if (this.selectedBreakUpObject && this.selectedBreakUpObject.IsRegularizationSubmitted == 1) {
          this.showRegularizeBtn = false;
          this.loadingScreen.startLoading();
          await this.getRegularizedPunchDetails(this.selectedEmployee, this.selectedDays[0]);
          this.showSliderForWeb = true;
          this.loadingScreen.stopLoading();
        } else {
          this.showSliderForWeb = true;
        }
      }
    }
  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      if (this.isCurrentDay(day.date)) {
        day.cssClass = 'highlight_currentDay';
      }
    });
    body.forEach((day) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  ngAfterViewInit(): void {
    this.setMobileResolution();
  }
  
  private setMobileResolution(): void {
    this.isMobileResolution = window.innerWidth < 767;
  }

  createPunchObject = (halfType: number, type: number, time: any, locationId: any, locationName: any, deviceId: any, deviceName: any, remarks: any)=> {
    const dummyDate = new Date("1970-01-01 " + time);
    let halfTypeString = '';
    if (type == 1) {
      halfTypeString = halfType === 1 ? '1st Half' : halfType === 2 ? '2nd Half' : '';
    } else if (type == 2) {
      halfTypeString = halfType === 1 ? '1st Half' : halfType === 2 ? '2nd Half' : '';
    }
    return {
      Type: type == 1 ? "In" : "Out",
      Half_Type: halfTypeString,
      Time: this.datePipe.transform(dummyDate, 'h:mm:ss a'),
      In_Time: time,
      LocationId: locationId ? locationId : 0,
      LocationName: locationName ? locationName : '',
      BiometricDeviceId: deviceId ? deviceId : '0',
      BioMetricDeviceName: deviceName ? deviceName : '',
      Remarks: remarks ? remarks : '',
      isPunchInOutEditable: false
    };
  }

  closeDetailedViewSlider() {
    this.showSliderForWeb = false;
  }

  formatTimeRange() {
    const formatTime = (timeStr: any) => {
      const timeArr = timeStr.split(':');
      const date = new Date().setHours(timeArr[0], timeArr[1], timeArr[2]);
      return moment(date).format("h:mm A");
    }

    const start = formatTime(this.LstworkShiftMapping.StartTime);
    const end = formatTime(this.LstworkShiftMapping.EndTime);

    if (this.LstworkShiftMapping.IsBreakShift) {
      const firstHalfEndTime = formatTime(this.LstworkShiftMapping.FirstHalfEndTime);
      const secondHalfStartTime = formatTime(this.LstworkShiftMapping.SecondHalfStartTime);
      return `${start} - ${firstHalfEndTime}, ${secondHalfStartTime} - ${end}`;
    } else {
      return `${start} - ${end}`;
    }
  }

  doRegularizeDetailType() {
    this.closeDetailedViewSlider();
    this.loadingScreen.startLoading();
    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    if (this.selectedDays.length !== 1) {
      this.loadingScreen.stopLoading();
      this.alertService.showWarning("Please select only one date");
      return;
    }
    if (moment(this.selectedDays[0], "YYYY-MM-DD").isSameOrAfter(moment(currentDate, "YYYY-MM-DD"))) {
      this.loadingScreen.stopLoading();
      this.alertService.showWarning("Cannot regularize for the selected date !");
      return;
    }

    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.openRegularizeAttendanceModal();
  }

  private getEmployeeDetails() {
    this.employeeService.GetEmployeeRequiredDetailsById(this.selectedEmployee, EmployeeMenuData.Profile).subscribe(
    (result) => {
      const apiResult: apiResult = result as apiResult;
      if (apiResult.Status && apiResult.Result != null) {
        const empObject: EmployeeDetails = (apiResult.Result) as any;
        this._employeeBasicDetails = empObject;
      }
    },
    (err) => {
      this.handleWarning(err);
    });
  }

  openRegularizeAttendanceModal() {
    const data = this.events.find(i => moment(i.start).format('YYYY-MM-DD') == moment(this.selectedDays[0]).format('YYYY-MM-DD'));
    console.log('***', data);
    this.loadingScreen.stopLoading();
    const modalRef = this.modalService.open(RegularizeAttendanceModalComponent, this.modalOption);
    modalRef.componentInstance.employeeAttendanceDetails = data;
    modalRef.componentInstance.AttendanceConfig = this._attendanceConfiguration;
    modalRef.componentInstance.attendanceDate = this.selectedDays[0];
    modalRef.componentInstance.shiftDetails = this.LstworkShiftMapping;
    modalRef.componentInstance.employeeBasicDetails = this._employeeBasicDetails;
    
    modalRef.result.then((result) => {
      this.selectedDays = [];
      this.onRefreshModal();
    }).catch((error) => {
      console.log(error);
    });
  }
  
  private handleWarning(message: string) {
    this.selectedDays = [];
    this.loadingScreen.stopLoading();
    this.alertService.showWarning(message);
  }

  doApplyLeave() {
    this.closeDetailedViewSlider();
    this._entitlementList = this.leaveEntitlementList;
    this.GetEntitlementAvailmentRequests();
    console.log(this._entitlementList);
    for (var control in this.leaveForm.controls) {
      this.leaveForm.controls[control].enable();
    }

    this.popupTitle = 'Leave';
    //console.log('ENT ::', this.entit);
    this.employeeEntitlement = null;
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
      AppliedFrom: new Date(),
      AppliedTill: new Date(),
    });

    // Enable the '_Entitlement' control (assuming '_Entitlement' is a FormControl)
    this._Entitlement.enable();

    // Set the 'CurrentDateTime' using moment.js
   // this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS');

    // Check if the date is the same
    this.isSameDateCheck(new Date(), new Date());

    $('#popup_edit_leave').modal('show');
  }

  onChange_Entitlement(event) {
    console.log('event', event);
    this.leaveDaysApplied  = '';
    this.appliedTillMaxDate = null;
    if (event === undefined) {
      this.selectedEntitlement = null;
      this.leaveForm.controls['EligibleUnits'].setValue(0);
    } else {

      this.leaveForm.controls['AppliedTill'].setValue(null);
      this.leaveForm.controls['AppliedFrom'].setValue(null);
      
      this.leaveForm.controls['AppliedTill'].enable();
      this.leaveForm.controls['AppliedTill'].setValue(null);
      
     if (this.popupTitle == 'On Duty') {
      this.leaveForm.controls['AppliedTill'].setValue(new Date(this.selectedDays[0]));
      this.leaveForm.controls['AppliedFrom'].setValue(new Date(this.selectedDays[0]));
      this._till_minDate = new Date(this.selectedDays[0]);
      this.onChange_FromDate(this._till_minDate);
     }

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

      // set maxDate
      this._from_maxDate = undefined;

      this.minDateForAdditionalDateInput = new Date(this._employeeDOJ);
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

      if (this.employeeEntitlement && this.employeeEntitlement.Definition && this.employeeEntitlement.Definition.IsBereavementLeave) {
        this.getAllRelationshipNames();
        this._from_maxDate = new Date();
        this._from_maxDate.setMonth(this._from_maxDate.getMonth());
        this._from_maxDate.setDate(this._from_maxDate.getDate());
        this._from_maxDate.setFullYear(this._from_maxDate.getFullYear());
      }
    }
  }

  fetchAvailableDatesForCompOffForAnEmployee() {
    const defaultClientId = this.sessionService.getSessionStorage("default_SME_ClientId");
    const defaultContractId = this.sessionService.getSessionStorage("default_SME_ContractId");
    this.attendanceService.getAvailableDatesForCompOffForAnEmployee(defaultClientId, defaultContractId, this.selectedEmployee)
    .pipe(takeUntil(this.unsubscribe$))
    .subscribe((response) => {
      console.log('COMP OFF RESP ::', response);
      this.availableCompOffDates = response.Status && response.Result && response.Result != '' ? JSON.parse(response.Result).map((element, idx) => ({...element, Id: idx + 1 })) : [];
    }, (error) => {
      this.loadingScreen.stopLoading();
      this.alertService.showWarning("An error occurred while fetching comp off dates.");
      console.error('Error', error);
    })
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

  doApplyOnDuty() {
    this.closeDetailedViewSlider();
    this.getOnDutyRequests();
    if (this.odEntitlementList && this.odEntitlementList.length) {
      this.loadingScreen.startLoading();
      this.popupTitle = 'On Duty';
      this.createForm();
      this._entitlementList = this.odEntitlementList;
      this.leaveForm.controls['Entitlement'].setValue(this.odEntitlementList[0].EntitlementId);
      this.selectedEntitlement = this.odEntitlementList[0];
      this._Entitlement.disable();
      this.onChange_Entitlement( this.selectedEntitlement);
      $('#popup_edit_leave').modal('show');
      this.loadingScreen.stopLoading();
    } else {
      this._entitlementList = this.odEntitlementList;
      this.alertService.showWarning('On Duty is not applicable for this employee');
    }
    
  }

  close_leaverequest_slider() {
    for (var control in this.leaveForm.controls) {
      this.leaveForm.controls[control].enable();
    }

    this.IsShowBalanceInUI = false;
    this.IsLossOfPay = false;
    this.remainingDays = 0;
    this.employeeEntitlement = null;
    $('#popup_edit_leave').modal('hide');
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
        // this.getAttendanceRecord();
      }

      var appliedfromDate = new Date(event);
      // this.presentMonth = newEventMonth;
      // this.presentYear = newEventYear;

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

    if (event && this.leaveForm.get('AppliedFrom').value) {
      // API call to get number of days 
      this.callNumberOfDaysForAppliedLeaveAPI();
    }
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
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value) {
      this.callNumberOfDaysForAppliedLeaveAPI();
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
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value) {
      this.callNumberOfDaysForAppliedLeaveAPI();
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
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value) {
      this.callNumberOfDaysForAppliedLeaveAPI();
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
    if (this.leaveForm.get('AppliedTill').value && this.leaveForm.get('AppliedFrom').value) {
      this.callNumberOfDaysForAppliedLeaveAPI();
    }

    this.calculateNoOfDays(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isSameDateCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.leaveForm.get('AppliedFrom').value, this.leaveForm.get('AppliedTill').value);

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

  shouldAllowtoEdit() {
    return this.employeeEntitlement && this.employeeEntitlement.Definition && this.employeeEntitlement.Definition.IsAutoCalcEndDateEditable ? this.leaveForm.controls['AppliedTill'].enable() : this.isDisabledTillDate;
  }

  resetLeaveForm() {

    const fields2 = ['IsAppliedForFirstHalf', 'IsAppliedTillFirstHalf', 'IsAppliedFromSecondHalf', 'IsAppliedTillSecondHalf'];
    fields2.forEach(field => {
      this.leaveForm.controls[field].setValue(false),
        this.leaveForm.controls[field].enable()
    }
    );
    const fields = ['ApplierRemarks', 'AppliedFrom', 'AppliedUnits', 'Entitlement', 'AppliedTill'];
    fields.forEach(field => this.updateValidation(false, this.leaveForm.get(field)));

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

  GetEntitlementRequestEndDate(fromDate) {
    console.log('fromdate', fromDate);

    if (fromDate != null && moment(fromDate).format('YYYY-MM-DD') != '1970-01-01') {
      this.leaveForm.controls['AppliedTill'].setValue(null);
      this.attendanceService.GetEntitlementRequestEndDate(this.selectedEmployee, this.employeeEntitlement.Id, moment(fromDate).format('YYYY-MM-DD'))
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe(
          (result: apiResult) => {
            console.log('Result', result);
            if (result.Status) {
              console.log('Applied From', this.leaveForm.get('AppliedFrom').value);
              if (this.leaveForm.get('AppliedFrom').value != null) {
                this.leaveForm.controls['AppliedTill'].setValue(new Date(result.Result));
                this.leaveForm.controls['AppliedTill'].disable();
                this.appliedTillMaxDate = new Date(result.Result);
              }
            }
          },
          (error) => {
            this.loadingScreen.stopLoading();
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

    this.loadingScreen.startLoading();
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
          this.loadingScreen.stopLoading();
        }
      );
  }

  private handleDownloadError() {
    this.loadingScreen.stopLoading();
    this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
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
    return days;
  }

  isHalfDaySelected() {
    return (
      this.leaveForm.get('IsAppliedForFirstHalf').value ||
      this.leaveForm.get('IsAppliedTillSecondHalf').value ||
      this.leaveForm.get('IsAppliedTillFirstHalf').value ||
      this.leaveForm.get('IsAppliedFromSecondHalf').value
    );
  }

  callNumberOfDaysForAppliedLeaveAPI() {
    const currentDate = new Date();
    this.leaveDaysApplied = '';
    const entitlementAvailmentRequest = {
      IsApprovedFromSecondHalf: false,
      IsApprovedForFirstHalf: false,
      ApprovedTill: null,
      IsApprovedTillFirstHalf: false,
      IsApprovedTillSecondHalf: false,
      ApprovedUnits: 0,
      ApprovedFrom: null,
      AppliedOn: moment(currentDate).format('YYYY-MM-DD hh:mm:ss'),
      ValidatedOn: moment(currentDate).format('YYYY-MM-DD hh:mm:ss'),
      ValidatedBy: 0,
      ApplierRemarks: this.leaveForm.get('ApplierRemarks').value,
      CancellationRemarks: '',
      ValidatorRemarks: '',
      Status: EntitlementRequestStatus.Applied,
      AppliedBy: this.userId,
      CalculatedAppliedUnits: this.leaveForm.get('CalculatedAppliedUnits').value == null ? 0 : this.leaveForm.get('CalculatedAppliedUnits').value,
      AppliedUnits: this.leaveForm.get('AppliedUnits').value,
      IsAppliedTillSecondHalf: false,
      Id: this.leaveForm.get('Id').value,
      EmployeeId: this.selectedEntitlement.EmployeeId,
      EmployeeEntitlementId: this.selectedEntitlement.Id,
      EntitlementType: EntitlementType.Leave,
      EntitlementId: this.leaveForm.get('Entitlement').value,
      EntitlementDefinitionId: this.selectedEntitlement.EntitlementDefinitionId,
      EntitlementMappingId: this.selectedEntitlement.EntitlementMappingId,
      UtilizationUnitType: EntitlementUnitType.Day,
      ApplicablePayPeriodId: 0,
      ApplicableAttendancePeriodId: 0,
      AppliedFrom: moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD'),
      IsAppliedFromSecondHalf: this.leaveForm.get('IsAppliedFromSecondHalf').value,
      IsAppliedForFirstHalf: this.leaveForm.get('IsAppliedForFirstHalf').value,
      AppliedTill: moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD'),
      IsAppliedTillFirstHalf: this.leaveForm.get('IsAppliedTillFirstHalf').value,
      ActivityList: [],
      PendingAtUserId: 0,
      PendingAtUserName: '',
      ApprovalStatus: EntitlementRequestStatus.Applied,
      CompensationDates: null
    };

    if (this.leaveForm.get('compOffDates').value && this.employeeEntitlement && this.employeeEntitlement.Definition.IsCompOff) {
      const datesArr = this.leaveForm.get('compOffDates').value.map(el => ({
        UtilizationDate: moment(new Date(el.AttendanceDate)).format('YYYY-MM-DD'),
        UtilizedUnits: this.leaveForm.get('AppliedUnits').value
      }));
      entitlementAvailmentRequest.CompensationDates = datesArr;
    }

    this.leaveForm.get('AdditionalDateInput').value != null ? entitlementAvailmentRequest['AdditionalDate'] = moment(new Date(this.leaveForm.get('AdditionalDateInput').value)).format('YYYY-MM-DD') : true;
    this.leaveForm.get('AdditionalDocumentId').value != null && this.leaveForm.get('AdditionalDocumentId').value > 0 ? entitlementAvailmentRequest['DocumentId'] = this.leaveForm.get('AdditionalDocumentId').value : true;
    this.leaveForm.get('AdditionalDocumentName').value != null && this.leaveForm.get('AdditionalDocumentName').value != '' ? entitlementAvailmentRequest['DocumentName'] = this.leaveForm.get('AdditionalDocumentName').value : true;
    console.log('ENTITLEMENT REQUEST :: ', entitlementAvailmentRequest);

    const apiService = this.popupTitle == 'Leave' ? this.attendanceService.putNumberOfDaysForAppliedLeave : this.attendanceService.getNumberOfOnDutyDaysApplied;

    apiService.call(this.attendanceService, entitlementAvailmentRequest).subscribe((result) => {
      const apiResult = result;
      console.log('API Result ::', result);
      if (apiResult.Status && apiResult.Message && apiResult.Message !== '') {
        this.leaveDaysApplied = apiResult.Message;
      } else {
        this.alertService.showWarning(apiResult.Message);
        this.leaveDaysApplied = '';
      }
    }, err => {
      console.warn('Error while calling API', err);
    });
  }
  

  getAllRelationshipNames() {
    this.attendanceService.getRelationshipDetails().pipe(takeUntil(this.unsubscribe$)).subscribe((response) => {
      console.log('RELATION RESPONSE ::', response);
      this.lstRelation = response.Status && response.Result && response.Result != '' ? JSON.parse(response.Result) : [];
    }, (error) => {
      this.loadingScreen.stopLoading();
      this.alertService.showWarning("An error occurred while fetching relation names.");
      console.error('Error', error);
    })
  }
  
  onChangeRelationshipForBL(evt) {
    console.log(evt);
  }

  saveEntitlementRequest() {
    this.submitted = true;
    this.leaveForm.controls['AppliedUnits'].setValue(this.requestedDays);
    console.log(this.leaveForm.value);
    this.updateValidation(true, this.leaveForm.get('ApplierRemarks'));
    this.updateValidation(true, this.leaveForm.get('AppliedFrom'));
    this.updateValidation(true, this.leaveForm.get('AppliedUnits'));
    this.updateValidation(true, this.leaveForm.get('Entitlement'));
    this.updateValidation(true, this.leaveForm.get('AppliedTill'));
    
    if (this.employeeEntitlement.Definition.IsBereavementLeave) {
      this.updateValidation(true, this.leaveForm.get('relationshipId'));
    } else {
      this.updateValidation(false, this.leaveForm.get('relationshipId'));
    }

    if (this.employeeEntitlement.Definition.IsCompOff) {
      this.updateValidation(true, this.leaveForm.get('compOffDates'));
    } else {
      this.updateValidation(false, this.leaveForm.get('compOffDates'));
    }

    if (this.employeeEntitlement.Entitlement.IsOptionalHoliday) {
      this.updateValidation(true, this.leaveForm.get('OptinalHoliday'));
    } else {
      this.updateValidation(false, this.leaveForm.get('OptinalHoliday'));
    }

    if (this.employeeEntitlement.Definition.IsAdditionalDateInputRequired) {
      this.updateValidation(true, this.leaveForm.get('AdditionalDateInput'));
    } else {
      this.updateValidation(false, this.leaveForm.get('AdditionalDateInput'));
    }


    if (this.employeeEntitlement.Definition.IsOptionRequiredToUploadDocuments && this.employeeEntitlement.Definition.AreSupportingDocumentsMandatory) {
      this.updateValidation(true, this.leaveForm.get('AdditionalDocumentId'));
    } else {
      this.updateValidation(false, this.leaveForm.get('AdditionalDocumentId'));
    }


    // if (this.employeeEntitlement.Definition.IsAdditionalDateInputRequired && this.employeeEntitlement.Definition.IsAdditionalDatePartOfRequest) {
    //   const additionalDate = moment(this.leaveForm.get('AdditionalDateInput').value, 'YYYY-MM-DD');

    //   if (additionalDate.isSameOrAfter(moment(this.leaveForm.get('AppliedFrom').value).format('YYYY-MM-DD')) && additionalDate.isSameOrBefore(moment(this.leaveForm.get('AppliedTill').value).format('YYYY-MM-DD'))) {

    //   } else {
    //     this.alertService.showWarning(`${this.employeeEntitlement.Definition.AdditionalDateLabelName} should be between the Applying leave dates.`);
    //     return;
    //   }
    // }

    if (this.leaveForm.controls['ApplierRemarks'] && this.leaveForm.get('ApplierRemarks').value && this.leaveForm.get('ApplierRemarks').value.trim() === '') {
      this.alertService.showWarning("Please enter remarks");
      return;
    }

    if (this.leaveForm.invalid) {
      this.alertService.showWarning("Unfortunately, your leave request cannot be submitted. Please fill in a valid value for all required(*) fields.");
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
    else if (this.employeeEntitlement.Definition.IsCompOff && this.employeeEntitlement && !this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff
      && this.leaveForm.controls.compOffDates.value && this.leaveForm.controls.AppliedUnits.value == 1 && this.leaveForm.controls.compOffDates.value.ApplicableUnits < 1) {
        this.alertService.showWarning(`You are eligible for ${this.availableUnitsForCompOff} day. Please select either first half or second half`);
    } else if (this.employeeEntitlement.Definition.IsCompOff && this.employeeEntitlement && this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff
      && this.leaveForm.controls.compOffDates.value && this.leaveForm.controls.AppliedUnits.value > this.availableUnitsForCompOff) {
        this.alertService.showWarning(`You are eligible for ${this.availableUnitsForCompOff} day(s), but your leave request is for ${this.leaveForm.controls.AppliedUnits.value} day(s)`);
    }
    // else if (!this.IsNegativeUnitAllowed && this.leaveForm.controls.Id.value <= 0 && (this.leaveForm.controls.AppliedUnits.value == 0 || (this.leaveForm.controls.AppliedUnits.value > this.leaveForm.controls.EligibleUnits.value))) {
    //   this.alertService.showWarning("you cannot apply for 0 days of leave or Reason: Please check if you have selected the from and to dates on holiday(s) or Another leave request exists for the date range you selected");
    //   return;
    // }
     // ! Commenting because the validation will happen on the API side.
    // else if (this.IsNegativeUnitAllowed && parseFloat(this.MaxAllowedNegativeBalance) > parseFloat(this.remainingDays)) {
    //   this.alertService.showWarning("Maximum allowed leave balance is currently insufficient");
    //   return;
    // }

    else {
      this.loadingScreen.startLoading();
      this.validateIsExitsOnDay().then((res) => {

        console.log('VALIDATION CEHCK ::', res);
        if (res) {
          this.loadingScreen.stopLoading();
          this.alertService.showWarning("You have entered dates that already exists in this request List. Only Unique dates are allowed.")
          return;
        }
        else {
          this.loadingScreen.stopLoading();
          this.tiggerApiCall_LeaveRequest();


        }

      })
    }
  }

  tiggerApiCall_LeaveRequest() {

    this.alertService.confirmSwal1("Confirmation!", `Are you sure you want to apply leave from ${moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('DD-MM-YYYY')} to ${moment(new Date(this.leaveForm.get('AppliedTill').value)).format('DD-MM-YYYY')}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      try {


        this.loadingScreen.startLoading();
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
        entitlementAvailmentRequest.AppliedBy = this.userId;
        entitlementAvailmentRequest.CalculatedAppliedUnits = this.leaveForm.get('CalculatedAppliedUnits').value == null ? 0 : this.leaveForm.get('CalculatedAppliedUnits').value;
        entitlementAvailmentRequest.AppliedUnits = this.leaveForm.get('AppliedUnits').value;
        entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
        entitlementAvailmentRequest.Id = this.leaveForm.get('Id').value;
        entitlementAvailmentRequest.EmployeeId = this.selectedEntitlement.EmployeeId;
        entitlementAvailmentRequest.EmployeeEntitlementId = this.selectedEntitlement.Id;
        entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
        entitlementAvailmentRequest.EntitlementId = this.leaveForm.get('Entitlement').value;
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
        entitlementAvailmentRequest.RelationshipId = this.leaveForm.get('relationshipId').value ? this.leaveForm.get('relationshipId').value : 0;
        entitlementAvailmentRequest.CompensationDates = null;
       if (this.leaveForm.get('compOffDates').value && this.employeeEntitlement && this.employeeEntitlement.Definition.IsCompOff) {
        if (!this.employeeEntitlement.Definition.IsMultiSelectAllowedForCompOff) {
          const datesArr = [this.leaveForm.get('compOffDates').value].map(el => ({
            UtilizationDate: moment(el.AttendanceDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            UtilizedUnits: this.leaveForm.get('AppliedUnits').value
          }));
          entitlementAvailmentRequest.CompensationDates = datesArr as any;
        } else {
          const datesArr = this.leaveForm.get('compOffDates').value.map(el => ({
            UtilizationDate: moment(el.AttendanceDate, 'DD-MM-YYYY').format('YYYY-MM-DD'),
            UtilizedUnits: this.leaveForm.get('AppliedUnits').value
          }));
          entitlementAvailmentRequest.CompensationDates = datesArr;
        } 
        
        }
        
        this.leaveForm.get('AdditionalDateInput').value != null ? entitlementAvailmentRequest.AdditionalDate = moment(new Date(this.leaveForm.get('AdditionalDateInput').value)).format('YYYY-MM-DD') : true;
        this.leaveForm.get('AdditionalDocumentId').value != null && this.leaveForm.get('AdditionalDocumentId').value > 0 ? entitlementAvailmentRequest.DocumentId = this.leaveForm.get('AdditionalDocumentId').value : true;
        this.leaveForm.get('AdditionalDocumentName').value != null && this.leaveForm.get('AdditionalDocumentName').value != '' ? entitlementAvailmentRequest.DocumentName = this.leaveForm.get('AdditionalDocumentName').value : true;

        console.log('ENTILMENT REQUEST :: ', this.leaveForm.get('relationshipId').value, entitlementAvailmentRequest);
        // this.loadingScreen.stopLoading();
        // return;
        if (this.popupTitle == 'On Duty') {
          this.attendanceService.PostOnDutyRequestForProxy(entitlementAvailmentRequest)
          .subscribe((result) => {
            let apiResult: apiResult = result;
            console.log('SUBMITTED RES ::', result);
            if (apiResult.Status) {
              this.alertService.showSuccess(apiResult.Message);
              this.loadingScreen.stopLoading();
              this.close_leaverequest_slider();
              this.onRefreshModal();
              this.updateValidation(false, this.leaveForm.get('ApplierRemarks'));
              this.updateValidation(false, this.leaveForm.get('AppliedFrom'));
              this.updateValidation(false, this.leaveForm.get('AppliedUnits'));
              this.updateValidation(false, this.leaveForm.get('AppliedTill'));
            } else {
              this.handleWarningMessage(apiResult.Message);
            }
          }, err => {
            //debugger;
          })
        }
        if (this.popupTitle == 'Leave') {
          this.attendanceService.PostEntitlementAvailmentRequestForProxy(entitlementAvailmentRequest)
          .subscribe((result) => {
            let apiResult: apiResult = result;
            console.log('SUBMITTED RES ::', result);
            if (apiResult.Status) {
              this.alertService.showSuccess(apiResult.Message);
              this.loadingScreen.stopLoading();
              this.close_leaverequest_slider();
              this.onRefreshModal();
              this.updateValidation(false, this.leaveForm.get('ApplierRemarks'));
              this.updateValidation(false, this.leaveForm.get('AppliedFrom'));
              this.updateValidation(false, this.leaveForm.get('AppliedUnits'));
              this.updateValidation(false, this.leaveForm.get('Entitlement'));
              this.updateValidation(false, this.leaveForm.get('AppliedTill'));
              this.updateValidation(false, this.leaveForm.get('compOffDates'));
              this.updateValidation(false, this.leaveForm.get('relationshipId'));
            } else {
              this.handleWarningMessage(apiResult.Message);
            }
          }, err => {
            //debugger;
          })
        }
      } catch (error) {
        this.handleWarningMessage('Something went wrong! ' + error);
      }
    }).catch(error => {
      this.updateValidation(false, this.leaveForm.get('ApplierRemarks'));
      this.updateValidation(false, this.leaveForm.get('AppliedFrom'));
      this.updateValidation(false, this.leaveForm.get('AppliedUnits'));
      this.updateValidation(false, this.leaveForm.get('Entitlement'));
      this.updateValidation(false, this.leaveForm.get('AppliedTill'));
      this.updateValidation(false, this.leaveForm.get('compOffDates'));
      this.updateValidation(false, this.leaveForm.get('relationshipId'));
    });
  }

  getEntitlementDefintionCode(tabName) {
    return tabName != null ? tabName.toUpperCase().toString() : '---';

  }

  handleWarningMessage(errorMessage) {
    this.alertService.showWarning(errorMessage);
    this.loadingScreen.stopLoading();
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
                let appliedfrom = moment(new Date(this.leaveForm.get('AppliedFrom').value)).format('YYYY-MM-DD')
                let appliedtill = moment(new Date(this.leaveForm.get('AppliedTill').value)).format('YYYY-MM-DD')
                while (moment(appliedfrom) <= moment(appliedtill)) {
                  if (moment(appliedfrom).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')) {
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

  async getOnDutyRequests() {
    try {
      const result = await this.attendanceService.getOnDutyRequests(this.selectedEmployee)
        .pipe(takeUntil(this.destroy$))
        .toPromise();

      this.handleEntitlementRequests(result);
    } catch (error) {
      console.error('Error fetching entitlement availment requests:', error);
      this.alertService.showWarning('Something went wrong! ' + error);
      this.spinner = false;
    }
  }

  async GetEntitlementAvailmentRequests() {
    try {
      const result = await this.attendanceService.GetEntitlementAvailmentRequests(this.selectedEmployee)
        .pipe(takeUntil(this.destroy$)).toPromise();
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
      this.spinner = false;
    }
  }

  private processEntitlementRequests(entitlementRequests: any[]): void {
    try {
      console.log('this._entitlementList', this.leaveEntitlementList);

      this._entitlementAvailmentRequests = entitlementRequests;
      const _statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;

      if (this._entitlementAvailmentRequests.length > 0) {
        this._entitlementAvailmentRequests.forEach(ele => {
          ele['EntitlementTypeName'] = "Leave";
          ele['EntitlementName'] = this._entitlementList.length > 0 ?
            (this._entitlementList.find(a => a.EntitlementId == ele.EntitlementId) ?
              this._entitlementList.find(a => a.EntitlementId == ele.EntitlementId).DisplayName : '---') : '---';
          ele['StatusName'] = _statusList.find(z => z.id == ele.Status).name;

        });

        // this.calculateCounts();

        // this.inEmployeesInitiateList = this._entitlementAvailmentRequests;
        // if (this.inEmployeesInitiateList.length > 0) {
        //   this.inEmployeesInitiateList.forEach(element => {
        //     element['isSelected'] = false;
        //     if (element.Status == 200) {
        //       element.ApplierRemarks = element.CancellationRemarks;
        //     }
        //   });
        // }
      }

      this.spinner = false;
    } catch (error) {
      console.error('Error processing entitlement requests:', error);
      this.alertService.showWarning('Something went wrong! ' + error);
      this.spinner = false;
    }
  }

  onFileUpload(e) {
    this.isLoading = true;
    const file = e.target.files[0];
    this.onFileReader(e, this.selectedEmployee).then((s3DocumentId) => {
      this.isLoading = false;
      if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
        this.leaveForm.controls['AdditionalDocumentName'].setValue(file.name);
        this.leaveForm.controls['AdditionalDocumentId'].setValue(s3DocumentId);
      } else {

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

  getRegularizedPunchDetails(employeeId, attendanceDate) {
    const promise = new Promise((resolve, reject) => {
      this.attendanceService.get_DetailedTypeRegularizedData(employeeId, attendanceDate).subscribe(res => {
        console.log('REGGG', res);
        if (res.Status && res.Result && res.Result != "" && res.Result.length > 0) {
          this.existingAttendanceData = res.Result.filter(item => item.IsActive === false);
          this.regularizedAttendanceData = res.Result.filter(item => item.IsActive === true);
          this.existingAttendanceData.forEach(el => {
            el.AttendanceCode = el.AttendanceCode != null ? el.AttendanceCode : 'Absent';
            el.LstTempEmployeeAttendancePunchInDetails && el.LstTempEmployeeAttendancePunchInDetails.forEach(e => {
              e.PunchInType = e.PunchInType === 0 ? 1 : e.PunchInType;
              e.PunchOutType = e.PunchOutType === 0 ? 2 : e.PunchOutType;
              const punchInObject = e.Starttime ? this.createPunchObject(e.PunchInHalf, e.PunchInType, e.Starttime, e.PunchInLocationId, e.PunchInLocationName, e.PunchInDeviceId, e.PunchInDeviceName, e.PunchInRemarks) : {} as any;
              const punchOutObject = e.FinishTime ? this.createPunchObject(e.PunchOutHalf, e.PunchOutType, e.FinishTime, e.PunchOutLocationId, e.PunchOutLocationName, e.PunchOutDeviceId, e.PunchOutDeviceName, e.PunchOutRemarks) : {} as any;
              if (punchInObject && Object.keys(punchInObject).length) {
                this.existingPunchDetails.push(punchInObject);
              }
              if (punchOutObject && Object.keys(punchOutObject).length) {
               this.existingPunchDetails.push(punchOutObject);
              }
            });
          });
          this.regularizedAttendanceData.forEach(el => {
            el.AttendanceCode = el.AttendanceCode != null ? el.AttendanceCode : 'Absent';
            el.LstTempEmployeeAttendancePunchInDetails && el.LstTempEmployeeAttendancePunchInDetails.forEach(e => {
              e.PunchInType = e.PunchInType === 0 ? 1 : e.PunchInType;
              e.PunchOutType = e.PunchOutType === 0 ? 2 : e.PunchOutType;
              const punchInObject = e.Starttime ? this.createPunchObject(e.PunchInHalf, e.PunchInType, e.Starttime, e.PunchInLocationId, e.PunchInLocationName, e.PunchInDeviceId, e.PunchInDeviceName, e.PunchInRemarks) : {} as any;
              const punchOutObject = e.FinishTime ? this.createPunchObject(e.PunchOutHalf, e.PunchOutType, e.FinishTime, e.PunchOutLocationId, e.PunchOutLocationName, e.PunchOutDeviceId, e.PunchOutDeviceName, e.PunchOutRemarks) : {} as any;
              if (punchInObject && Object.keys(punchInObject).length) {
                this.regularizedPunchDetails.push(punchInObject);
              }
              if (punchOutObject && Object.keys(punchOutObject).length) {
                this.regularizedPunchDetails.push(punchOutObject);
              }
            });
          });
          console.log('****',this.regularizedAttendanceData ,   this.existingAttendanceData, this.existingPunchDetails, this.regularizedPunchDetails);
        } else {
          this.existingPunchDetails =  [];
          this.regularizedPunchDetails = [];
        }
        resolve(true);
      }, error => {
        this.existingPunchDetails =  [];
        this.regularizedPunchDetails = [];
        console.log(error);
        resolve(true);
        return this.alertService.showWarning(error);
      });
       
      });
    return promise;
  }
  
  checkAttendanceStatus(str: string = '', data: any): string {
    const searchTerms = ["Present", "SHP", "FHP", "HP", "Half Day Present", "HalfADayPresent", "HalfDayPresent"];
    switch (true) {
      case searchTerms.some(term => str.includes(term)):
        return 'Present';
      case str === 'Holiday' || (data.IsHoliday && str === 'Absent'):
        return 'Holiday';
      case str === 'WeekOff' || (data.IsWeekOff && str === 'Absent'):
        return 'WeekOff';
      case str === 'Absent' || str.trim() === '':
        return 'Absent';
      default:
        return 'default';
    }
  }
  
  getAttendanceStatusCode(status: any, item:any) {
    let statusText = 'Absent';
    if(item[0].IsHoliday && Number(status) === 2) {
      statusText ='Holiday'
    } else if(item[0].IsWeekOff && Number(status) === 2) {
      statusText ='WeekOff'
    } else if(Number(status) === 1) {
      statusText ='Present'
    } else if(Number(status) === 3) {
      statusText ='HalfADayPresent'
    } else {
      statusText = 'Absent';
    }
    return statusText.trim();
  }

  getTotalWorkingHoursInHoursMinuteFormat(dayHrsConsidered) {
    if (!isNaN(dayHrsConsidered) && dayHrsConsidered !== 0) {
      const hours = Math.floor(dayHrsConsidered);
      const minutes = Math.round((dayHrsConsidered - hours) * 60);
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }
    return '0:00';
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }


}
