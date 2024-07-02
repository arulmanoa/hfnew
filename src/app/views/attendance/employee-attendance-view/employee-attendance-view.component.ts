import { Component, OnInit, Input, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { OwlOptions } from 'ngx-owl-carousel-o';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { environment } from "src/environments/environment";
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
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subject } from 'rxjs';
import { CalendarDateFormatter, CalendarEvent,CalendarMonthViewDay,CalendarView} from 'angular-calendar';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { AttendanceConfiguration, ModeOfInput, RegularizationType } from 'src/app/_services/model/Attendance/AttendanceConfiguration';
import { SubmitAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { Title } from '@angular/platform-browser';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { EntitlementRequestStatus } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { AlertService, CommonService, EmployeeService } from 'src/app/_services/service';
import { AttendanceBreakUpDetailsStatus, EmployeeAttendancModuleProcessStatus, EntitlementType } from 'src/app/_services/model/Attendance/AttendanceEnum';
import Swal from 'sweetalert2';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { NzDrawerService } from 'ng-zorro-antd';
import { ViewShiftsByEmployeeComponent } from '../view-shifts-by-employee/view-shifts-by-employee.component';
import { RegularizeAttendanceModalComponent } from 'src/app/shared/modals/attendance/regularize-attendance-modal/regularize-attendance-modal.component';

import { CustomDateFormatter } from './custom-date-formatter.provider';
import { DatePipe } from '@angular/common';

export function calculateDiff(dateSent) {
  let currentDate = new Date();
  dateSent = new Date(dateSent);
  return Math.floor((Date.UTC(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate()) - Date.UTC(dateSent.getFullYear(), dateSent.getMonth(), dateSent.getDate())) / (1000 * 60 * 60 * 24));
}

export class EmployeeAttendanceDefinition {
  AttendancePeriod: any;
  WorkShiftDefinition: any;
  LstEntitlement: any;
  LstEntitlementAvailmentRequest: any;
  LstEmployeeAttendanceBreakUpDetails: any;
  EmploymentContract: any;
  LstEntitlementAvailmentRequestDetails: any;
  LstAttendanceGeoFenceCoordinatesMapping: any;
  LstEmployeeWorkingDaysMapping: any;
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
  selector: 'app-employee-attendance-view',
  templateUrl: './employee-attendance-view.component.html',
  styleUrls: ['./employee-attendance-view.component.css'],
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
  ],
})
export class EmployeeAttendanceViewComponent implements OnInit {
  spinner: boolean = false;
  dates: any[] = [];
  attendances: any[] = [];
  modalOption: NgbModalOptions = {};
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
  isPastMonth : boolean = false;
  // LOP Calendar
  view: CalendarView | CalendarPeriod = CalendarView.Month;
  viewDate: Date = new Date();
  events: CalendarEvent[] = [];
  minDate: Date = subMonths(new Date(), 1);
  maxDate: Date = addMonths(new Date(), 1);
  prevBtnDisabled: boolean = false;
  nextBtnDisabled: boolean = false;
  refresh: Subject<any> = new Subject();
  
  // GENERAL DETAILS
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  CompanyId: any;
  BusinessType: any;
  LstAttendanceType: any[] = [];
  
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
  _employeeId: any;
  _permissionConfig: any;
  _submittedHours: any;
  _permissionConfigClientBased: any;
  _clientId: any;
  lstHolidays: any = [];
  
  //REFACTOR
  EmployeeId: any;
  // MARK AS PRESENT
  selectedMonthViewDay: CalendarMonthViewDay;
  selectedDayViewDate: Date;
  selectedDays: any = [];

  presentMonth: number = 0;
  presentYear: number = 0;
  
  showSliderForWeb: boolean = false;
  sliderTitle: string = '';
  lstPunches: any[] = [];
  selectedCalendarObj: any;
  selectedBreakUpObject: any;

  isMobileResolution: boolean;
  showTotalHours: boolean = false;
  isEmployeeAllowedToSubmitAttendance: boolean = true;
  selectedMonthName: any = '';
  showSliderForMobile: boolean = false;
  showRegularizeBtn: boolean = true;
  regularizedPunchDetails = [];
  existingPunchDetails = [];
  regularizedAttendanceData = [];
  existingAttendanceData = [];

  @HostListener('window:resize', [])

  onResize() {
    this.setMobileResolution();
  }

  constructor(
    private modalService: NgbModal,
    private attendanceService: AttendanceService,
    public sessionService: SessionStorage,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private utilsHelper: enumHelper,
    private commonService: CommonService,
    private deviceService: DeviceDetectorService,
    private alertService: AlertService,
    private employeeService: EmployeeService,
    private drawerService: NzDrawerService,
    private datePipe: DatePipe
  ) {
    this.setMobileResolution();
    window.addEventListener("beforeunload", this.handleBeforeUnload);
  }

  private handleBeforeUnload(e: BeforeUnloadEvent) {
    const confirmationMessage = "\o/";
    console.log("RELOAD CONTENT INITIATED");
    e.returnValue = confirmationMessage;
    return confirmationMessage;
  }
  
  ngAfterViewInit(): void {
    this.setMobileResolution();
  }
  
  private setMobileResolution(): void {
    this.isMobileResolution = window.innerWidth < 767;
  }
  
  public parseHours(n: number): number {
    return Math.round((n / 60) * 100) / 100;
  }
  
  public ngOnInit(): void {
    this.onRefresh();
  }
  
  getUserAgentConnection() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const deviceType = this.getDeviceType();
  
    if (this._attendanceConfiguration.ModeOfInput !== deviceType) {
      this.alertService.showWarning(`Note: For your security, ${this.getDeviceTypeName(deviceType)} device only allowed`);
      return;
    }
  }
  
  getDeviceType() {
    if (this.deviceService.isMobile()) {
      return 1;
    } else if (this.deviceService.isDesktop()) {
      return 2;
    } else if (this.deviceService.isTablet()) {
      return 3;
    }
    return 0;
  }
  
  getDeviceTypeName(deviceType) {
    switch (deviceType) {
      case 1:
        return 'Mobile';
      case 2:
        return 'Desktop';
      case 3:
        return 'Third Party';
      default:
        return 'Unknown';
    }
  }

  getDeviceDetails() {
    let err: any = null;
    this.commonService.getIP().subscribe(IPDetails => this.IPDetails,error => err = <any>error);
  }

  onRefresh() {
    this.resetValues();
    this.setSessionDetails();
    this.getEmployeeDetails();
  }
  
  resetValues() {
    this.selectedDays = [];
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.titleService.setTitle('Employee Attendance');
    this.events = [];
    
    this.spinner = true;
    this.currentDate = new Date();
  }
  
  setSessionDetails() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.CompanyId = this.sessionDetails.Company.Id;
    this._employeeId = this.sessionDetails.EmployeeId
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null && this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.LstAttendanceType = this.utilsHelper.transform(AttendanceType) as any[];
    this.EmployeeId = this.sessionDetails.EmployeeId;
  }
  
  getEmployeeDetails() {
    this.employeeService.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).subscribe((result) => {
      var apiresult1 = result as apiResult;
      console.log('test', apiresult1);

      if (apiresult1.Status && apiresult1.Result != null) {
        let empObject: EmployeeDetails = apiresult1.Result as any;
        this._employeeBasicDetails = empObject;
        this.processEmployeeDetails(apiresult1);
      }
    }, err => {
      console.log('ERROR IN GetEmployeeRequiredDetailsById API -->', err);
    })
  }
  
  getAttendanceConfiguration() {
    this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId).then((result) => {
      var apiresult = result as apiResult;
      try {
        if (apiresult.Status && apiresult.Result != null) {
          this.processAttendanceConfiguration(apiresult);
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
  
  processAttendanceConfiguration(apiresult) {
    this._attendanceConfiguration = (apiresult.Result) as any;
    console.log('ATTENDNACE CONFIG RESULT ::', this._attendanceConfiguration);
    this._permissionConfig = this._attendanceConfiguration['PermissionConfiguration'];
    this.isLocationRequired = this._attendanceConfiguration.IsGeoFenceRequired == true ? true : false;
    this.isIpAddressRequired = this._attendanceConfiguration.IsNetworkRestrictionRequired == true ? true : false;
    this.isIpAddressRequired == true ? this.getDeviceDetails() : null;
    (this._attendanceConfiguration.ModeOfInput == ModeOfInput.Web || this._attendanceConfiguration.ModeOfInput == ModeOfInput.Mobile || this._attendanceConfiguration.ModeOfInput == ModeOfInput.Swiping) ? this.getUserAgentConnection() : null;
  }

  processEmployeeDetails(apiresult1) {
    let empObject: EmployeeDetails = apiresult1.Result as any;
    this._employeeBasicDetails = empObject;
    try {
      console.log('EMPLOYEE BASIC DETAILS ::', this._employeeBasicDetails);
      if (this._employeeBasicDetails != undefined && this._employeeBasicDetails != null) {
        this.getAttendanceConfiguration();
      }
    } catch (error) {
      this.alertService.showWarning("An error occurred while getting employee details. please contact support admin.");
      console.error('ERROR WHILE GETTING BASIC DETAILS OF ATTENDANCE ::', error);
    }
  }

  // REFACTOR
  async GetAttendanceConfigurationByEmployeeId(employeeId) {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetAttendanceConfigurationByEmployeeId(employeeId).subscribe((configResponse) => {
        console.log('ATTEN CONFIG :: ', configResponse);
        this.presentMonth = (new Date().getMonth() + 1);
        this.presentYear = new Date().getFullYear();
        this.getAttendanceRecord(this.presentMonth, this.presentYear);
        res(configResponse);
      });
    });

    return promise;
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
    this.attendanceService.GetEmployeeAttendanceDetailsByFromTodate(this.EmployeeId, startDate, endDate).subscribe((result) => {
      console.log('result', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != '') {
        const response = apiResult.Result as any;
        this._employeeBasicAttendanceDefinition = JSON.parse(JSON.stringify(response));
        console.log('this._employeeBasicAttendanceDefinition', this._employeeBasicAttendanceDefinition);
        this.LstworkShiftMapping = this._employeeBasicAttendanceDefinition.WorkShiftList && this._employeeBasicAttendanceDefinition.WorkShiftList.length > 0 ? this._employeeBasicAttendanceDefinition.WorkShiftList[0] : null;
        // if (this.LstworkShiftMapping != null) {
        //   var startTime = moment(this.LstworkShiftMapping.StartTime, 'hh:mm');
        //   var endTime = moment(this.LstworkShiftMapping.EndTime, 'hh:mm');
        //   var totalHrs = endTime.diff(startTime, 'hour');
        //   var totalMinutes = endTime.diff(startTime, 'minutes');
        //   totalHrs = Number(this.parseHours(totalMinutes));
        // }
        this._clientId = response.WorkShiftList && response.WorkShiftList.length > 0 ? response.WorkShiftList[0].ClientId : 0;

        this.isEmployeeAllowedToSubmitAttendance = environment.environment.ClientsNotAllowedToClickOnDayInAttendance && 
        environment.environment.ClientsNotAllowedToClickOnDayInAttendance.includes(this._clientId) ? false : true;
        
        this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId));
        this._permissionConfigClientBased = null;
        environment.environment.AttendanceUIPermissionText != null ? this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId) != undefined ? environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId) : environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == 0)) : true;
      
        this.LstEmployeeAttendanceBreakUpDetails = response.LstDates ? response.LstDates : [];
        
        this.LstEmployeeAttendanceBreakUpDetails && this.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.LstEmployeeAttendanceBreakUpDetails.forEach(e => {
          try {
            // get Holidays list
            if(e.IsHoliday) {
              this.lstHolidays.push({date: moment(e.Date).format("DD MMM YYYY"), holidayName: e.HolidayInfo});
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
        this.loadingScreenService.stopLoading();
      } else {
       this.dateOrViewChanged();
        this.alertService.showWarning(apiResult.Message + ": " + apiResult.Result);
        this.spinner = false;
        this.loadingScreenService.stopLoading();
      }
    });
  }

  getAttendanceType(event) {
    if (event.FirstHalfType != "" && event.SecondHalfType != "" && event.FirstHalfType === event.SecondHalfType) return `${event.FirstHalfType}`;
    if (event.PermissionList && event.PermissionList.length > 0 && event.FirstHalfType === '' && event.SecondHalfType === '') return 'Permission';
    if(event.IsHoliday || (event.FirstHalfType.toUpperCase() === 'HOLIDAY' && event.SecondHalfType.toUpperCase() === 'HOLIDAY')) return `${event.FirstHalfType}`;
    if(event.IsWeekOff || (event.FirstHalfType.toUpperCase() === 'WEEKOFF' && event.SecondHalfType.toUpperCase() === 'WEEKOFF')) return `${event.FirstHalfType}`;
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
      case 'WORK ON WEEKOFF':
        return colors.workonweekoff;
      case 'WORKONWEEKOFF':
        return colors.workonweekoff;
      case 'WORK FROM HOME':
        return colors.wfh;
      case 'WORKFROMHOME':
        return colors.wfh;
      case 'PERMISSION':
        return colors.permission;
      case 'ONDUTY':
        return colors.od;
      case 'ON DUTY':
        return colors.od;
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
    this.loadingScreenService.startLoading();
    this.changeDate(this.addPeriod(this.view, this.viewDate, 1));
    this.presentMonth = (new Date(this.viewDate).getMonth() + 1);
    this.presentYear = new Date(this.viewDate).getFullYear();
    this.getAttendanceRecord(this.presentMonth, this.presentYear);
  }

  decrement(): void {
    this.loadingScreenService.startLoading();
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

  async dayClicked({date,events}: {date: Date;events: CalendarEvent<{}>[];}) {
    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    console.log(events);
    this.selectedDays = [];
    this.selectedCalendarObj = events && events.length ? events[0] : null;
    this.lstPunches = [];
    this.regularizedPunchDetails = [];
    this.existingPunchDetails = [];
    this.showRegularizeBtn = true;
    if (events && events.length) {
      this.selectedDays.push(moment(events[0].start).format('YYYY-MM-DD'));
    }
    if (moment(this.selectedDays, "YYYY-MM-DD").isAfter(moment(currentDate, "YYYY-MM-DD"))) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning_withTimeOut("Cannot select future date !", 3500);
      return;
    }
    if (this._attendanceConfiguration.RegularizationType == RegularizationType.Detailed) {
      this.sliderTitle = moment(date).format("DD MMM YYYY");
      if (events[0].meta['breakupObject'] && events[0].meta['breakupObject'].LstPunches && events[0].meta['breakupObject'].LstPunches.length) {
        this.selectedBreakUpObject = JSON.parse(JSON.stringify(events[0].meta['breakupObject']));
        // get Shift details for the selected day
        const shift = this._employeeBasicAttendanceDefinition.WorkShiftList.filter(s => s.Id === this.selectedBreakUpObject.WorkShiftDefinitionId);
        this.LstworkShiftMapping = shift && shift.length > 0 ? shift[0] : this.LstworkShiftMapping;
        if (this.selectedBreakUpObject.IsRegularizationSubmitted == 1) {
          this.showRegularizeBtn = false;
          this.loadingScreenService.startLoading();
          await this.getRegularizedPunchDetails(this.EmployeeId, this.selectedDays[0]);
          this.showSliderForMobile = this.isMobileResolution ? true : false;
          this.showSliderForWeb = this.isMobileResolution ? false : true;
          this.loadingScreenService.stopLoading();
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
          this.showSliderForMobile = this.isMobileResolution ? true : false;
          this.showSliderForWeb = this.isMobileResolution ? false : true;
        }
      } else {
        console.log('No Punches data found !');
        this.selectedBreakUpObject = events && events.length ? JSON.parse(JSON.stringify(events[0].meta['breakupObject'])) : null;
        if(this.selectedBreakUpObject && this.selectedBreakUpObject.WorkShiftDefinitionId) {
          const shift = this._employeeBasicAttendanceDefinition.WorkShiftList.filter(s => s.Id === this.selectedBreakUpObject.WorkShiftDefinitionId);
          this.LstworkShiftMapping = shift && shift.length > 0 ? shift[0] : this.LstworkShiftMapping;
        }
        if (this.selectedBreakUpObject && this.selectedBreakUpObject.IsRegularizationSubmitted == 1) {
          this.showRegularizeBtn = false;
          this.loadingScreenService.startLoading();
          await this.getRegularizedPunchDetails(this.EmployeeId, this.selectedDays[0]);
          this.showSliderForMobile = this.isMobileResolution ? true : false;
          this.showSliderForWeb = this.isMobileResolution ? false : true;
          this.loadingScreenService.stopLoading();
        } else {
          this.showSliderForMobile = this.isMobileResolution ? true : false;
          this.showSliderForWeb = this.isMobileResolution ? false : true;
        }
      }
    }
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


  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      // const dayOfMonth = day.date.getDate();
      // if (dayOfMonth > 5 && dayOfMonth < 10 && day.inMonth) {
      //   day.cssClass = 'bg-pink';
      // }
      // const weekEndDays = new Date(day.date);
      // if (weekEndDays.getDay() == 6 || weekEndDays.getDay() == 0) {
      //   day.cssClass = 'weekend-cell';
      // }

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
          isNonPayableday : false,
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

  onSubmit() {

    if (this.LstEmployeeAttendanceBreakUpDetails == null || this.LstEmployeeAttendanceBreakUpDetails.length == 0) {
      this.alertService.showWarning('No Attendance details were located. Please try it after awhile.');
      return;
    }

    console.log("lst ::", this.LstEmployeeAttendanceBreakUpDetails);


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
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.loadingScreenService.startLoading();
        var lstEmpAttendanceBreakupList = [];
        if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0) {
          this.LstEmployeeAttendanceBreakUpDetails.forEach(element => {

            if (element.Status == AttendanceBreakUpDetailsStatus.EmployeeSaved) {
              element.AttendanceBreakUpDetailsType = 100;
              element.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved
              lstEmpAttendanceBreakupList.push(element)
            }
          });
          if (lstEmpAttendanceBreakupList.length == 0) {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('No Attendance details were located. Please try it after awhile.');
            return;
          }

          let submitAttendanceUIModel = new SubmitAttendanceUIModel();
          submitAttendanceUIModel.LstEmployeeAttendanceBreakUpDetails = lstEmpAttendanceBreakupList;
          submitAttendanceUIModel.ModuleProcessAction = EmployeeAttendancModuleProcessStatus.EmployeeSubmitAttendance;
          submitAttendanceUIModel.Role = {
            IsCompanyHierarchy: false,
            RoleId: this.RoleId
          }

          this.attendanceService.SubmitEmployeeAttendanceBreakUpDetails(submitAttendanceUIModel)
            .subscribe((result) => {
              console.log(result);
              let apiresult: apiResult = result;
              if (apiresult.Status) {
                this.loadingScreenService.stopLoading();    
                this.onRefresh();
              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiresult.Message);
              }

            }, err => {
              this.alertService.showWarning(`Something bad has happened : ${err}`);

              this.loadingScreenService.stopLoading();
            })

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




  // MARK AS PRESENT

  doMarkAsPresent() {

    if (this.selectedDays.length == 0) {
      this.alertService.showWarning("At least one checkbox must be selected.");
      return;
    }
    this.loadingScreenService.startLoading();
    this.attendanceService.MarkAttendanceAsPresentByEmployee(JSON.stringify(this.selectedDays)).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status) {
        this.selectedDays = [];
        this.events.forEach(a => {
          a.meta.isChecked = false;
        });
        this.getAttendanceRecord(this.presentMonth, this.presentYear);
        this.alertService.showSuccess(apiResult.Message);
        this.loadingScreenService.stopLoading();
      } else {
        this.alertService.showWarning(apiResult.Message);
        this.loadingScreenService.stopLoading();
      }
    })
  }

  doRegularizeDetailType() {
    this.closeDetailedViewSlider();
    this.loadingScreenService.startLoading();
    const currentDate = moment(new Date()).format("YYYY-MM-DD");
    if (this.selectedDays.length !== 1) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Please select only one date");
      return;
    }
    if (moment(this.selectedDays[0], "YYYY-MM-DD").isSameOrAfter(moment(currentDate, "YYYY-MM-DD"))) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Cannot regularize for the selected date !");
      return;
    }
    this.attendanceService.get_IsEmployeeAllowedToRegularize(this.EmployeeId, this.selectedDays[0]).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status == true && apiResult.Result != '') {
        const parsedRes = JSON.parse(apiResult.Result);
        this.loadingScreenService.stopLoading();
        if (parsedRes.Status == true) {
          const data = this.events.find(i => moment(i.start).format('YYYY-MM-DD') == moment(this.selectedDays[0]).format('YYYY-MM-DD'));
          console.log('***', data);
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
        } else {
          this.selectedDays = [];
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(parsedRes.Message);
        }
      } else {
        this.selectedDays = [];
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
      }
    });
    
  }

  selectDay(e, CalendarObjevent) {
    e.preventDefault();
    e.stopPropagation();
    let updateItem = this.selectedDays.find(i => moment(i).format('YYYY-MM-DD') == moment(CalendarObjevent.start).format('YYYY-MM-DD'));
    let index = this.selectedDays.indexOf(updateItem);
    if (index > -1) {
      CalendarObjevent.meta.isChecked = false;
      this.selectedDays.splice(index, 1);
    }
    else {
      CalendarObjevent.meta.isChecked = true;
      this.selectedDays.push(moment(CalendarObjevent.start).format('YYYY-MM-DD'));

    }
  }

  viewShiftsByEmployee() {
    const drawerRef = this.drawerService.create<ViewShiftsByEmployeeComponent, { clientId: any, month: any, year: any }, string>({
      nzTitle: 'My Shift',
      nzContent: ViewShiftsByEmployeeComponent,
      nzWidth: 800,
      nzClosable: true,
      nzMaskClosable: false,
      nzContentParams: {
        clientId: this._clientId,
        month: this.presentMonth,
        year: this.presentYear
      }
    });

    drawerRef.afterOpen.subscribe(() => {
      console.log('view shifts by employee opened ! ');
    });
    drawerRef.afterClose.subscribe(data => {
      // this.onRefreshModal();
    });
  }

  closeDetailedViewSlider() {
    this.showSliderForMobile = false;
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
    // console.log('item', item);
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

}
