import { Component, OnInit, Input, SimpleChange, ViewChild, ElementRef, HostListener } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';
import { AttendanceRequestComponent } from 'src/app/shared/modals/attendance/attendance-request/attendance-request.component';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { timer } from "rxjs";
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SubmitPermissionModel } from 'src/app/_services/model/Attendance/SubmitPermissionModel'
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
import { WebcamImage, WebcamInitError, WebcamUtil } from 'ngx-webcam';
import { HttpClient } from '@angular/common/http';


import { Subject, Observable } from 'rxjs';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent, CalendarMonthViewDay,
  CalendarView,
} from 'angular-calendar';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { ApiResponse } from 'src/app/_services/model/Common/BaseModel';
import { AttendanceConfiguration, ModeOfInput } from 'src/app/_services/model/Attendance/AttendanceConfiguration';
import { AttendanceBreakUpDetailsType, EmployeeAttendanceBreakUpDetails, EmployeeAttendanceDetails, SubmitAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { Title } from '@angular/platform-browser';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { EntitlementRequestStatus } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { AlertService, CommonService, EmployeeService, ESSService, SearchService } from 'src/app/_services/service';
import { Router } from '@angular/router';
import { ImagecaptureModalComponent } from 'src/app/shared/modals/attendance/imagecapture-modal/imagecapture-modal.component';
import { AttendanceBreakUpDetailsStatus, EmployeeAttendancModuleProcessStatus, EntitlementType } from 'src/app/_services/model/Attendance/AttendanceEnum';
import Swal from 'sweetalert2';
import { EmployeeleaverequestModalComponent } from 'src/app/shared/modals/leaveManagement/employeeleaverequest-modal/employeeleaverequest-modal.component';
import { CompensationConfiguration, CompensationClaimType } from 'src/app/_services/model/Attendance/CompensationConfiguration';
import { Nationality } from 'src/app/_services/model/Base/HRSuiteEnums';
import { find } from 'lodash';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { el } from 'date-fns/locale';
import { NzDrawerService } from 'ng-zorro-antd';
import { ViewShiftsByEmployeeComponent } from '../view-shifts-by-employee/view-shifts-by-employee.component';
import { RegularizeAttendanceModalComponent } from 'src/app/shared/modals/attendance/regularize-attendance-modal/regularize-attendance-modal.component';

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
  selector: 'app-employee-attendance',
  templateUrl: './employee-attendance.component.html',
  styleUrls: ['./employee-attendance.component.css']
})
export class EmployeeAttendanceComponent implements OnInit {
  _dateRangeOd: any;
  _dateRangeWfh: any;
  OdLastHistoryReqArr: any[] = [];
  WfhLastHistoryReqArr: any[] = [];
  _OddateFromDate: any;
  _OddateToDate: any;
  _Odremarks: any;
  _WfhdateFromDate: any;
  _WfhdateToDate: any;
  _Wfhremarks: any;
  ClaimChecked: any;
  CompensationClaimType: CompensationClaimType
  HolidayListArr: any[] = [];
  IsWeekHalf: any;
  IsHolidayForWOH: any;
  TodayWeekNo: any;
  _CompensationConfiguration: CompensationConfiguration = new CompensationConfiguration();
  IsMusterroll: boolean = false;
  AttendanceCycleList: any[] = [];
  spinner: boolean = false;
  dates: any[] = [];
  globalDates: any[] = [];
  attendances: any[] = [];
  employeeObject: any;
  modalOption: NgbModalOptions = {};
  WowClimeTypeArr: any[] = [];
  WowClimeTypeArr_list: any[] = [];
  LastHistoryReqArr: any[] = [];
  _WOWremarks: any;
  _ChkdClaimTyp: any;
  _WOWdate: any;
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
  }

  FSI: any = '--:--';
  LSO: any = '--:--';
  isRunning: boolean = false;
  punchInSpinner: boolean = false;

  clock: any;
  minutes: any = '00';
  seconds: any = '00';
  milliseconds: any = '00';
  hours: any = '00';
  time: any;
  PunchInOutText: any = 'Punch In';
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
  noOfP = 0; noOfA = 0;
  timecardEditDOJ: any;
  refresh: Subject<any> = new Subject();
  dayClickEvent_date: any;
  dayClcikEvent_events: any[] = [];
  // GENERAL DETAILS
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  CompanyId: any;
  BusinessType: any;
  LstAttendanceType: any[] = [];
  _EmployeeEntitlement: any[] = [];
  _attendanceConfiguration: AttendanceConfiguration = new AttendanceConfiguration();
  _employeeBasicDetails: EmployeeDetails;
  _employeeBasicAttendanceDefinition: EmployeeAttendanceDefinition = new EmployeeAttendanceDefinition();
  LstattendancePeriod: any;
  LstworkShiftMapping: any;
  LstEmployeeWorkingDaysMapping: any
  LstAttendanceGeoFenceCoordinatesMapping: any;
  LstEntitlement: any;
  LstEntitlementAvailmentRequest: any;
  LstEntitlementAvailmentRequestDetails: any;
  LstEmployeeAttendanceBreakUpDetails: any;
  LstEmployeeLeaveRequest: any;
  EmploymentContract: any;
  LstLeaveStatus: any;
  LstHolidays: any[] = [];
  LstNonPayabledays: any[] = [];
  _PayableDay: number = 0;
  // ATTENDANCE CONFIG
  isLocationRequired: boolean = false;
  isLocationAccessed: boolean = false;
  isIpAddressRequired: boolean = false;
  isIpAddressAccessed: boolean = false;
  deviceInfo = null;
  tobeHidden: boolean = false;
  CapturedBase64Image: any = null;
  IPDetails: any;
  actualWorkingHours: number = 0;
  weekOffs: any[] = [];
  excludeDays: number[] = [];
  attendanceEntry : boolean = false;
  _date: any;
  _startTime: any;
  _endTime: any;
  _remarks: any;
  _MaxDate: any;
  _MinDate: any;
  _minTime: any;
  disbleKey: boolean = true
  _employeeId: any;
  // disbleKey: boolean = true
  _permissionConfig: any;
  recentRequests: any = [];
  _submittedHours: any;
  _calenderPermisssionList: any = [];
  _permissionConfigClientBased: any;
  _clientId: any;
  isPastDateAllowed: boolean = true;
  //REFACTOR
  EmployeeId: any;
  // MARK AS PRESENT
  selectedMonthViewDay: CalendarMonthViewDay;
  selectedDayViewDate: Date;
  selectedDays: any = [];

  presentMonth: number = 0;
  presentYear: number = 0;

  isMobileResolution: boolean;
  serverDateTime : any;
  isholiday:boolean=false;
  isAttendanceEntry:boolean=false;

  showTotalHours: boolean = false;


  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }

  constructor(
    private modalService: NgbModal,
    private attendanceService: AttendanceService,
    public sessionService: SessionStorage,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private utilsHelper: enumHelper,
    private router: Router,
    private searchService: SearchService,
    private commonService: CommonService,
    private deviceService: DeviceDetectorService,
    private http: HttpClient,
    private alertService: AlertService,
    private employeeService: EmployeeService,
    private drawerService: NzDrawerService,


  ) {


    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }


    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("RELOAD CONTENT INITIATED");
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
    } else {
      this.isMobileResolution = false;
    }
  }
  public parseHours = (n) => Math.round((n / 60) * 100) / 100;


  public ngOnInit(): void {

    this.WowClimeTypeArr_list = [{ id: 1, ClimeType_Name: 'None', ClimeType_Val: CompensationClaimType.None, Clime_ModelVal: "" }, { id: 2, ClimeType_Name: 'Leave', ClimeType_Val: CompensationClaimType.Leave, Clime_ModelVal: "" }, { id: 3, ClimeType_Name: 'Decide later', ClimeType_Val: CompensationClaimType.DecideLater, Clime_ModelVal: "" }, { id: 4, ClimeType_Name: 'Encash', ClimeType_Val: CompensationClaimType.Encash, Clime_ModelVal: "" }];
    this.onRefresh();
    this.attendanceService.GetISTServerTime().subscribe((ress) => {
      console.log('IST TIME ::', ress);
      let apiR: apiResult = ress;
      if (apiR.Status) {
        this.serverDateTime = new Date(apiR.Result);
       
      }
    })

    // this.attendanceService.PunchAttendance({
    //   EmployeeId : 15001,
    //   Coordinates : {
    //     Latitude : 13.08290 ,
    //     Longitude : 80.270718,
    //     Altitude : 0
    //   },
    //   PhotoId : 555,
    //   Remarks : 'Ui remarks'
    // }).subscribe(data => {
    //   console.log("Punch Attendance ::" , data)
    // } , error => {console.error(error);})

  }

  // getUserLocation() {
  //   navigator.geolocation.getCurrentPosition(function (position) {
  //     this.isLocationAccessed = true;
  //     console.log(
  //       "Latitude: " + position.coords.latitude +
  //       "Longitude: " + position.coords.longitude);
  //     // this.lat = position.coords.latitude;
  //     // this.lng = position.coords.longitude;
  //     // console.log(this.lat);
  //     // console.log(this.lat);
  //   }, function () {
  //     this.isLocationAccessed = false;
  //     console.warn('USER NOT ALLOWED : LOCATION PERMISSION');
  //     this.alertService.showWarning('Note: For your security, we need permission to access the location to enter attendance. Without it, this application will not be in a position to discover.');
  //     return;
  //   }, { timeout: 10000 });

  // }

  getUserAgentConnection() {
    this.deviceInfo = this.deviceService.getDeviceInfo();
    const isMobile = this.deviceService.isMobile();
    const isTablet = this.deviceService.isTablet();
    const isDesktopDevice = this.deviceService.isDesktop();
    // console.log(this.deviceInfo);
    // console.log(isMobile);  // returns if the device is a mobile device (android / iPhone / windows-phone etc)
    // console.log(isTablet);  // returns if the device us a tablet (iPad etc)
    // console.log(isDesktopDevice); // returns if the app is running on a Desktop browser.
    if (this._attendanceConfiguration.ModeOfInput == 1 && !isMobile) {
      this.alertService.showWarning('Note: For your security, Mobile device only allowed');
      return;
    }
    if (this._attendanceConfiguration.ModeOfInput == 2 && !isDesktopDevice) {
      this.alertService.showWarning('Note: For your security, Desktop device only allowed');
      return;
    }
    if (this._attendanceConfiguration.ModeOfInput == 3 && !isDesktopDevice) {
      this.alertService.showWarning('Note: For your security, Thrid Pary device only allowed');
      return;
    }
  }

  getDeviceDetails() {
    let err: any = null;
    this.commonService.getIP()
      .subscribe(
        IPDetails => this.IPDetails,
        error => err = <any>error
      );
  }


  getWeekOff() {
    this.weekOffs = [];

    var promise = new Promise((resolve, reject) => {
      var _woff = JSON.parse(this.sessionService.getSessionStorage('weekOffs'));
      console.log('_woff', (_woff));
      if (_woff == null || _woff == undefined) {

        this.attendanceService.GetWeekOffByEmployeeId(this.EmployeeId)
          .subscribe((ress) => {
            console.log('WEEK OFF RESP ::', ress);
            let apiR: apiResult = ress;
            if (apiR.Status && apiR.Result != null) {

              var weekOff = apiR.Result[0] as any;
              // if (weekOff.EffectiveDate >= new Date()) {
              if (weekOff.Monday) {
                this.weekOffs.push(1)
              }
              if (weekOff.Tuesday) {
                this.weekOffs.push(2)
              }
              if (weekOff.Wednesday) {
                this.weekOffs.push(3)
              }
              if (weekOff.Thursday) {
                this.weekOffs.push(4)
              }
              if (weekOff.Friday) {
                this.weekOffs.push(5)
              }
              if (weekOff.Saturday) {
                this.weekOffs.push(6)
              }
              if (weekOff.Sunday) {
                this.weekOffs.push(0)
              }
              // }
              console.log('WEEKOFF DAYS ::', this.weekOffs);
              this.sessionService.delSessionStorage('weekOffs');
              this.sessionService.setSesstionStorage('weekOffs', (this.weekOffs));
              // this.excludeDays = this.weekOffs;
              resolve(true);
            } else {
              resolve(false);

            }

          })
      } else {
        this.weekOffs = _woff;
      }
    });
    return promise;



  }

  onRefresh() {
    this.selectedDays = [];
    this.IsWeekHalf = false;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.titleService.setTitle('Employee Attendance');
    this.CapturedBase64Image = null;
    this.dayClickEvent_date = null;
    this.dayClcikEvent_events = null;
    this.events = [];
    this._EmployeeEntitlement = [];
    // this.loadingScreenService.startLoading();
    this.spinner = true;
    this.currentDate = new Date();

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.CompanyId = this.sessionDetails.Company.Id;
    this._employeeId = this.sessionDetails.EmployeeId
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null && this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.LstAttendanceType = this.utilsHelper.transform(AttendanceType) as any[];
    this.LstLeaveStatus = this.utilsHelper.transform(EntitlementRequestStatus) as any[];
    this.EmployeeId = this.sessionDetails.EmployeeId;

    this.getWeekOff().then(() => console.log("Week Off Task Complete!"));

    this.employeeService.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).subscribe((result) => {
      var apiresult1 = result as apiResult;
      console.log('test', apiresult1);

      if (apiresult1.Status && apiresult1.Result != null) {
        let empObject: EmployeeDetails = apiresult1.Result as any;
        this._employeeBasicDetails = empObject;

        // this.getEmployeeBasicDetails(req_params_Uri).then((apiresponse) => {
        //   if (apiresponse != null) {

        //     var apiresult1 = apiresponse as apiResult;
        //     let jsonObj = JSON.parse(apiresult1.Result);
        //     console.log('JSON OBJ ::', jsonObj);
        //     this._EmployeeEntitlement = jsonObj.EmployeeEntitlement != null && jsonObj.EmployeeEntitlement.length > 0 ? jsonObj.EmployeeEntitlement : []
        //     this._employeeBasicDetails = jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0 ? jsonObj.EmployeeBasicDetails.find(a => a.EmployeeCode.toUpperCase() == req_params_Uri.toUpperCase()) : null;
        //     this.events = [];
        try {
          console.log('EMPLOYEE BASIC DETAILS ::', this._employeeBasicDetails);
          // this._employeeBasicDetails != undefined && this._employeeBasicDetails != null && this.GetAttendanceConfiguration().then((result) => {
          this._employeeBasicDetails != undefined && this._employeeBasicDetails != null && this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId).then((result) => {
            var apiresult = result as apiResult;
            try {
              if (apiresult.Status && apiresult.Result != null) {
                this._attendanceConfiguration = (apiresult.Result) as any;
                console.log('ATTENDNACE CONFIG RESULT ::', this._attendanceConfiguration);
                this._permissionConfig = this._attendanceConfiguration['PermissionConfiguration']
                // Part of the configuration upgrade takes place here.
                this.isLocationRequired = this._attendanceConfiguration.IsGeoFenceRequired == true ? true : false;
                this.isIpAddressRequired = this._attendanceConfiguration.IsNetworkRestrictionRequired == true ? true : false;
                // this.isLocationRequired == true ? this.getUserLocation() : null;
                this.isIpAddressRequired == true ? this.getDeviceDetails() : null;
                (this._attendanceConfiguration.ModeOfInput == ModeOfInput.Web || this._attendanceConfiguration.ModeOfInput == ModeOfInput.Mobile || this._attendanceConfiguration.ModeOfInput == ModeOfInput.Swiping) ? this.getUserAgentConnection() : null;
                this.LastRecentWOWHistory();
              }
              else {
                this.spinner = true;
                this.alertService.showWarning("Unable to find attendance configuration. Please give it a shot after a while.")
                console.error('LINE NO : 232 : COULD NOT FIND THE RESULT AT ATTENANCE CONFIG');
                return;

              }
            } catch (err) {
              // this.loadingScreenService.stopLoading();
              console.error('LINE NO : 241 EXECPTION ERR :', err);
            }

          });
        } catch (error) {
          this.alertService.showWarning("An error occurred while getting employee details. please contact support admin.");
          console.error('ERROR WHILE GETTING BASIC DETAILS OF ATTENDANCE ::', error);
          return;
        }

      }

    })
    //   }
    //   else {
    //     console.error('LINE NO :248 : COULD NOT FIND THE RESULT AT EMPLOYEE DETAILS');

    //   }
    // });
    //this.getWeekOff();
    //   timer(0, 1000).subscribe(ellapsedCycles => {
    //     if(this.isRunning) {
    //       this.FSI--;
    //     }
    //   });

    //   var update = function() {
    //     document.getElementById("datetime")
    //     .innerHTML = `${moment().format('HH:mm:ss')}`
    // }
    // setInterval(update, 1000);

  }
  LastRecentWOWHistory() {
    this.LastHistoryReqArr = [];
    var parms = this.EmployeeId + '/' + environment.environment.DisplayCountsForRecentWOWHistory;
    this.searchService._GetRecentWOWRequests(parms).subscribe((result) => {
      if (result.Status == true) {
        var _data = JSON.parse(result.Result);
        this.LastHistoryReqArr = _data;
        _data = [];
      }
      else {
        console.error('Last # Records Claim History Get Error Line No -- 481');
      }
    })
  }
  LastRecentOdHistory() {
    // When you implement this functionality, please make sure the employeeid as per the login session is
    var parms = `${sessionStorage.getItem('loginUserId')}` + '/' + 2;
    // this.searchService._GetRecentWOWRequests(parms).subscribe((result) => {
    //   if (result.Status == true) {
    //     var _data = JSON.parse(result.Result);
    //     this.OdLastHistoryReqArr = _data;
    //     _data = [];
    //   }
    //   else {
    //     console.error('Last # Records Claim History Get Error Line No -- 481');
    //   }
    // })
  }
  LastRecentWfhHistory() {
    // When you implement this functionality, please make sure the employeeid as per the login session is, dont use emp code/loginuser id
    var parms = `${sessionStorage.getItem('loginUserId')}` + '/' + 2;
    // this.searchService._GetRecentWOWRequests(parms).subscribe((result) => {
    //   if (result.Status == true) {
    //     var _data = JSON.parse(result.Result);
    //     this.WfhLastHistoryReqArr = _data;
    //     _data = [];
    //   }
    //   else {
    //     console.error('Last # Records Claim History Get Error Line No -- 481');
    //   }
    // })
  }
  // unused code 
  // getEmployeeBasicDetails(req_params_Uri) {
  //   const promise = new Promise((res, rej) => {
  //     this.searchService.getESSDashboardDetails(req_params_Uri).subscribe((result) => {
  //       let apiResult: apiResult = result;
  //       console.log('tt', result);
  //       if (apiResult.Status) {
  //         res(result);
  //       } else {
  //         rej(null);
  //       }
  //     }, err => {
  //       rej(null)
  //     });
  //   })

  //   return promise;
  // }

  // unused code
  // async GetAttendanceConfiguration() {

  //   const promise = new Promise((res, rej) => {
  //     this.GetEmployeeEntitlementList(this.EmployeeId);
  //     // this.attendanceService.GetIpAddress().subscribe((d)=> {
  //     //   console.log('dd', d);        
  //     // })
  //     this.getAttendanceRecord();

  //     // ATTENDANCE CONFIGURATION 
  //     // this.attendanceService.GetAttendanceConfiguration(this.CompanyId, 0, 0, 0, 0)
  //     //   .subscribe((response) => {
  //     //     res(response);
  //     //     // this.loadingScreenService.stopLoading();
  //     //   })
  //     this.attendanceService.GetAttendanceConfigurationByEmployeeCode(this._employeeBasicDetails.EmployeeCode)
  //       .subscribe((response) => {
  //         res(response);
  //       })

  //   })

  //   return promise;

  // }

  GetEmployeeEntitlementList(employeeId) {
    const promise = new Promise((resolve, reject) => {
      this._EmployeeEntitlement = [];
      this.attendanceService.GetEmployeeEntitlementList(employeeId, EntitlementType.Leave).subscribe((result) => {
        let apiResult: apiResult = result;
        console.log('RES ENTITLEMENTLIST::', apiResult);
        if (apiResult.Status && apiResult.Result != null) {
          this._EmployeeEntitlement = apiResult.Result as any;
          resolve(true);
        } else {
          reject(false);
        }

      }, err => {
        reject(false);
        console.warn('ERR ::', err);
      });
    })
    return promise;

  }


  getAttendanceRecord(month, year) {
    this.attendanceService.GetAttendanceDataByEmployeeId(this.EmployeeId, month, year)
      .subscribe((response) => {
        let apiResult: apiResult = response;
        if (apiResult.Status) {
          this._employeeBasicAttendanceDefinition = JSON.parse(apiResult.Result);
          console.log('ATTENDANCE DATA ::', this._employeeBasicAttendanceDefinition);
          this.LstattendancePeriod = this._employeeBasicAttendanceDefinition.AttendancePeriod != null ? this._employeeBasicAttendanceDefinition.AttendancePeriod : null;
          this.LstworkShiftMapping = this._employeeBasicAttendanceDefinition.WorkShiftDefinition != null ? this._employeeBasicAttendanceDefinition.WorkShiftDefinition : null;
          this.LstEmployeeWorkingDaysMapping = this._employeeBasicAttendanceDefinition.LstEmployeeWorkingDaysMapping != null ? this._employeeBasicAttendanceDefinition.LstEmployeeWorkingDaysMapping : null;
          this.LstEntitlement = this._employeeBasicAttendanceDefinition.LstEntitlement;
          this.LstEntitlementAvailmentRequest = this._employeeBasicAttendanceDefinition.LstEntitlementAvailmentRequest;
          this.LstEntitlementAvailmentRequestDetails = this._employeeBasicAttendanceDefinition.LstEntitlementAvailmentRequestDetails;
          this.LstEmployeeAttendanceBreakUpDetails = this._employeeBasicAttendanceDefinition.LstEmployeeAttendanceBreakUpDetails;
          this.EmploymentContract = this._employeeBasicAttendanceDefinition.EmploymentContract;
          this.LstAttendanceGeoFenceCoordinatesMapping = this._employeeBasicAttendanceDefinition.LstAttendanceGeoFenceCoordinatesMapping != null ? this._employeeBasicAttendanceDefinition.LstAttendanceGeoFenceCoordinatesMapping : null;
          this._clientId = this.EmploymentContract.ClientId
          this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId));
          this._permissionConfigClientBased = null;
          environment.environment.AttendanceUIPermissionText != null ? this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId) != undefined ? environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId) : environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == 0)) : true;
        
          this.LstEmployeeAttendanceBreakUpDetails != null &&  this.LstEmployeeAttendanceBreakUpDetails.length > 0 > this.LstEmployeeAttendanceBreakUpDetails.forEach(element => {

            if (element.LstEmployeeAttendancePunchInDetails != null && element.LstEmployeeAttendancePunchInDetails.length > 0) {
              element.LstEmployeeAttendancePunchInDetails.forEach(e => {
                if(e.PunchInCoordinates != null && e.PunchInCoordinates != ''){
                  e.PunchInCoordinates = JSON.parse( e.PunchInCoordinates)
                }
                if(e.PunchOutCoordinates != null && e.PunchOutCoordinates != ''){
                  e.PunchOutCoordinates = JSON.parse( e.PunchOutCoordinates)
                }
              });
            }
          });

          this.showTotalHours = environment.environment.ClientsNotAllowedToViewAttendanceHoursInCalendar && 
          environment.environment.ClientsNotAllowedToViewAttendanceHoursInCalendar.includes(this._clientId) ? false : true;

          
          if (this._permissionConfigClientBased == null) {
            this._permissionConfigClientBased = {
              "ClientId": 0,
              "IsIcon": true,
              "IconCSS": "fa fa-clock-o",
              "Text": "PN"
            }
          }


          if (this.LstworkShiftMapping == null) {
            this.alertService.showWarning("Unable to find employee shift definition. Please give it a shot after a while or contact support admin.");
            return;
          }

          var userAccess = null;
          (async () => {
            // 26-Oct-2023:  holidayCalendarType changing to 1 (previously 0) after Ram asked to pass 1 for all clients 
            await this.attendanceService.GetHolidayCalendarBasedOnApplicability(1, this.EmploymentContract.ClientId, this.EmploymentContract.ClientContractId, this.EmploymentContract.TeamId, 0, 0, this.EmploymentContract.EmployeeId)
              .subscribe((result) => {
                let apiresult: apiResult = result;
                if (apiresult.Status) {
                  var data = apiresult.Result as any;
                  // var leavesArry = [{
                  //   BillQuantity: 1, "BillUnitType": 1, BillUnitValue: 1, CreatedBy: "12", CreatedOn: "2021-06-16T10:32:37.467", Date: "2021-12-11T00:00:00", DayType: 0, HolidayCalendarId: 3,
                  //   Id: 173, IsOverridable: false, IsRestrictedToWork: false, LastUpdatedBy: "12", LastUpdatedOn: "2021-06-16T10:32:37.467", PayQuantity: 1, PayUnitType: 1, PayUnitValue: 1,
                  //   Remarks: "December -11th Satuerday", Status: true, Type: 1
                  // }, {
                  //   BillQuantity: 1, "BillUnitType": 1, BillUnitValue: 1, CreatedBy: "12", CreatedOn: "2021-06-16T10:32:37.467", Date: "2021-12-25T00:00:00", DayType: 0, HolidayCalendarId: 3,
                  //   Id: 174, IsOverridable: false, IsRestrictedToWork: false, LastUpdatedBy: "12", LastUpdatedOn: "2021-06-16T10:32:37.467", PayQuantity: 1, PayUnitType: 1, PayUnitValue: 1,
                  //   Remarks: "December -25th Satuerday", Status: true, Type: 1
                  // }, {
                  //   BillQuantity: 1, "BillUnitType": 1, BillUnitValue: 1, CreatedBy: "12", CreatedOn: "2021-06-16T10:32:37.467", Date: "2021-12-26T00:00:00", DayType: 0, HolidayCalendarId: 3,
                  //   Id: 175, IsOverridable: false, IsRestrictedToWork: false, LastUpdatedBy: "12", LastUpdatedOn: "2021-06-16T10:32:37.467", PayQuantity: 1, PayUnitType: 1, PayUnitValue: 1,
                  //   Remarks: "December -26th Sunday", Status: true, Type: 1
                  // }, {
                  //   BillQuantity: 1, "BillUnitType": 1, BillUnitValue: 1, CreatedBy: "12", CreatedOn: "2021-06-16T10:32:37.467", Date: "2021-12-25T00:00:00", DayType: 0, HolidayCalendarId: 3,
                  //   Id: 176, IsOverridable: false, IsRestrictedToWork: false, LastUpdatedBy: "12", LastUpdatedOn: "2021-06-16T10:32:37.467", PayQuantity: 1, PayUnitType: 1, PayUnitValue: 1,
                  //   Remarks: "December -25th Satuerday", Status: true, Type: 1
                  // }, {
                  //   BillQuantity: 1, "BillUnitType": 1, BillUnitValue: 1, CreatedBy: "12", CreatedOn: "2021-06-16T10:32:37.467", Date: "2022-01-01T00:00:00", DayType: 0, HolidayCalendarId: 3,
                  //   Id: 177, IsOverridable: false, IsRestrictedToWork: false, LastUpdatedBy: "12", LastUpdatedOn: "2021-06-16T10:32:37.467", PayQuantity: 1, PayUnitType: 1, PayUnitValue: 1,
                  //   Remarks: "January -01st Satuerday", Status: true, Type: 1
                  // }, {
                  //   BillQuantity: 1, "BillUnitType": 1, BillUnitValue: 1, CreatedBy: "12", CreatedOn: "2021-06-16T10:32:37.467", Date: "2022-01-02T00:00:00", DayType: 0, HolidayCalendarId: 3,
                  //   Id: 178, IsOverridable: false, IsRestrictedToWork: false, LastUpdatedBy: "12", LastUpdatedOn: "2021-06-16T10:32:37.467", PayQuantity: 1, PayUnitType: 1, PayUnitValue: 1,
                  //   Remarks: "January -02st Sunday", Status: true, Type: 1
                  // }
                  // ];
                  // for (var i in leavesArry) {
                  //   data.HolidayList.push(leavesArry[i]);
                  // }
                  console.log('HOLIDAY LIST ::', data);
                  console.log('EVENT ::', this.events);
                  try {

                    if (data != null) {
                      this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 1 || a.Type == 2) : []
                      this.LstNonPayabledays = data.HolidayList != null && data.HolidayList.length > 0 
                      ? data.HolidayList.filter(a => a.Type == 2) : []
                      // Some of the configuration update takes place here. : Holidays
                      this.LstHolidays != null && this.LstHolidays.length > 0 && this.LstHolidays.forEach(el => {
                        let doUpdateHoliday = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(el.Date).format('YYYY-MM-DD'));
                        if (doUpdateHoliday != undefined && doUpdateHoliday != null) {
                          doUpdateHoliday.meta.isHoliday = true;
                        }
                      });

                      // Some of the configuration update takes place here. : NonPayabledays
                      this.LstNonPayabledays != null && this.LstNonPayabledays.length > 0 && this.LstNonPayabledays.forEach(el => {
                        let doUpdateNonPayabledays = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(el.Date).format('YYYY-MM-DD'));
                        if (doUpdateNonPayabledays != undefined && doUpdateNonPayabledays != null) {
                        //  doUpdateNonPayabledays.meta.isNonPayableday = true;
                        }
                      });
                    }
                  } catch (error) {
                    this.alertService.showWarning("An error occurred while getting holiday calendar. Please try again.");
                    console.error('HOLIDAY EXE :', error);
                    return;
                  }
                }
              })
          })();

          if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
            this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) != undefined) {
            this.FSI = this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')).FirstCheckIn != null ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).FirstCheckIn : '--:--'
            this.LSO = this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')).LastCheckedOut != null ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).LastCheckedOut : '--:--'
            if (this.FSI != '--:--') {
              this.PunchInOutText = 'Punch Out';
            }
          }
          this.dateOrViewChanged();
          // const startOfMonth = moment().clone().startOf('months').subtract(6, 'months').format('YYYY-MM-DD hh:mm');
          // const endOfMonth = moment().clone().endOf('months').add(5, 'months').format('YYYY-MM-DD hh:mm');


          // this.enumerateDaysBetweenDates(new Date(this.LstattendancePeriod.StartDate), new Date(this.LstattendancePeriod.EndDate))

          if (this.LstattendancePeriod != null) {

            const startOfMonth = moment().clone().startOf('months').subtract(6, 'months').format('YYYY-MM-DD hh:mm');
            const endOfMonth = moment().clone().endOf('months').add(5, 'months').format('YYYY-MM-DD hh:mm');
            this.enumerateDaysBetweenDates(new Date(startOfMonth), new Date(endOfMonth));


            this.minDate = new Date(startOfMonth);
            this.maxDate = new Date(endOfMonth);

            if (this.LstworkShiftMapping != null) {


              var startTime = moment(this.LstworkShiftMapping.StartTime, 'hh:mm');
              var endTime = moment(this.LstworkShiftMapping.EndTime, 'hh:mm');
              var totalHrs = endTime.diff(startTime, 'hour');
              var totalMinutes = endTime.diff(startTime, 'minutes');
              totalHrs = Number(this.parseHours(totalMinutes));
            }
            this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.LstEmployeeAttendanceBreakUpDetails.forEach(e => {

              let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(e.AttendanceDate).format('YYYY-MM-DD'));
              // if (renovate != undefined && renovate != null) {
              //   renovate.meta.breakupObject = e;
              //   renovate.meta.attendanceType = this.commonService.getUpperCaseLetterAtFirst(this.LstAttendanceType.find(z => z.id == e.AttendanceType).name)
              //   e.AttendanceType == 3 ? renovate.color = colors.green : renovate.color = colors.red;
              //   // this.LstAttendanceType.find(z => z.id == calendarObject.meta.breakupObject.AttendanceType).name;
              // }



              if (renovate != undefined && renovate != null) {
                renovate.meta.breakupObject = e;
                renovate.meta.ODStatus = e.ODStatus;
                renovate.meta.WFHStatus = e.WFHStatus;
                if (e.AttendanceBreakUpDetailsType == 400 && renovate.meta) {
                  renovate.meta.attendanceType = e.hasOwnProperty('FirstHalfEntitlementId') == true ? e.FirstHalfEntitlementId == 0 ? 'LOP' : this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).Code : '';// this.commonService.getUpperCaseLetterAtFirst(this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).DisplayName);
                  renovate.color = colors.red;
                  renovate.meta.isFirstHalf = true;
                  renovate.meta.isSecondHalf = true;

                } else if (e.AttendanceBreakUpDetailsType == 200 && renovate.meta) {
                  renovate.meta.attendanceType = e.hasOwnProperty('FirstHalfEntitlementId') == true ? e.FirstHalfEntitlementId == 0 ? 'LOP' : this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).Code : '' // this.commonService.getUpperCaseLetterAtFirst(this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).DisplayName);
                  renovate.color = colors.red;
                  renovate.meta.isFirstHalf = true;
                  renovate.meta.isSecondHalf = false;
                }
                else if (e.AttendanceBreakUpDetailsType == 300 && renovate.meta) {
                  renovate.meta.attendanceType = e.hasOwnProperty('SecondHalfEntitlementId') == true ? e.SecondHalfEntitlementId == 0 ? 'LOP' : this.LstEntitlement.find(z => z.Id == e.SecondHalfEntitlementId).Code : '' // this.commonService.getUpperCaseLetterAtFirst(this.LstEntitlement.find(z => z.Id == e.SecondHalfEntitlementId).DisplayName);
                  renovate.color = colors.red;
                  renovate.meta.isFirstHalf = false;
                  renovate.meta.isSecondHalf = true;

                } else {
                  renovate.color = colors.green
                  renovate.meta ? renovate.meta.attendanceType = 'P' : '';
                }
                // e.AttendanceType == 3 ? renovate.color = colors.green : renovate.color = colors.red;
                // this.LstAttendanceType.find(z => z.id == calendarObject.meta.breakupObject.AttendanceType).name;
              }

            });

            // Some of the configuration update takes place here. : IsPresentByDefault
            // let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(new Date).format('YYYY-MM-DD'));
            // if (this._attendanceConfiguration.IsPresentByDefault && renovate != undefined && renovate != null) {

            //   renovate.meta.attendanceType =  renovate.meta.attendanceType == null ? this.commonService.getUpperCaseLetterAtFirst(this.LstAttendanceType.find(z => z.id == 3).name) :  renovate.meta.attendanceType;
            //   renovate.color = colors.green;
            // }



            this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {
              w['startDate'] = w.AppliedFrom;
              w['endDate'] = w.AppliedTill;
            });

            this.getallLeaveRequest();
            // reupdate it
            this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {
              w['startDate'] = w.AppliedFrom;
              w['endDate'] = w.AppliedTill;
            });
            this.LstEmployeeLeaveRequest.length > 0 ? this.LstEmployeeLeaveRequest = _(this.LstEmployeeLeaveRequest)
              .groupBy(x => x.EntitlmentName)
              .map((value, key) => ({ EntitlmentName: key, list: value }))
              .value() : true;
            console.log('this.LstEmployeeLeaveRequest', this.LstEmployeeLeaveRequest)

            console.log('EVENT ::', this.events);
            this.spinner = false;
            // this.loadingScreenService.stopLoading();

          } else {
            // this.loadingScreenService.stopLoading();
            // it is a choice of dev if empty attendance period
            const startOfMonth = moment().clone().startOf('months').subtract(6, 'months').format('YYYY-MM-DD hh:mm');
            const endOfMonth = moment().clone().endOf('months').add(5, 'months').format('YYYY-MM-DD hh:mm');


            this.enumerateDaysBetweenDates(new Date(startOfMonth), new Date(endOfMonth));
            this.spinner = false;

          }


        } else {
          // this.loadingScreenService.stopLoading();
          console.error('EXECEPTION ERROR LINE NO : 312');
        }


      })
  }
  getCountApproved(list) {
    return list != null && list.length > 0 ? list.filter(x => x.Status == EntitlementRequestStatus.Approved).length : 0;
  }
  getCountApplied(list) {
    return list != null && list.length > 0 ? list.filter(x => x.Status == EntitlementRequestStatus.Applied).length : 0;
  }
  getCountRejected(list) {
    return list != null && list.length > 0 ? list.filter(x => x.Status == EntitlementRequestStatus.Rejected).length : 0;
  }

  convertH2M(timeInHour) {
    if (timeInHour != null && timeInHour != 0) {
      timeInHour = timeInHour.toFixed(2);
      var timeParts = timeInHour.split(".");
      return (Number(timeInHour) * 60);

      // return Number(timeParts[0]) * 60 + Number(timeParts[1]);
    } else {
      return 0;
    }

  }


  getnoOfHours(calendarObject) {
    var totalcalculatedHours = 0;
    if (calendarObject.meta.breakupObject != null && calendarObject.meta.breakupObject.AttendanceBreakUpDetailsType != 400) {


      // totalcalculatedHours += this.convertH2M(calendarObject.meta.breakupObject.TotalSubmittedHours);
      // if (calendarObject.meta.breakupObject.LstEmployeeAttendancePunchInDetails && calendarObject.meta.breakupObject.LstEmployeeAttendancePunchInDetails.length > 0) {

      //   calendarObject.meta.breakupObject.LstEmployeeAttendancePunchInDetails.forEach(element => {
      //     totalcalculatedHours += this.convertH2M(element.SubmittedHours);
      //   });
      // }
      // var startTime = moment(calendarObject.meta.breakupObject.FirstCheckIn, 'HH:mm');
      // var endTime = moment(calendarObject.meta.breakupObject.LastCheckedOut, 'HH:mm');
      // var totalHrs = endTime.diff(startTime, 'hour');
      // var totalMinutes = endTime.diff(startTime, 'minutes');
      //  var  totalHrs = Number(this.parseHours(parseFloat(totalcalculatedHours.toFixed(2).toString().split(".")[1])));
      totalcalculatedHours = calendarObject.meta.breakupObject.TotalSubmittedHours != null && calendarObject.meta.breakupObject.TotalSubmittedHours != undefined ? calendarObject.meta.breakupObject.TotalSubmittedHours.toFixed(2) : 0;
      return Number.isNaN(totalcalculatedHours) == true ? null : totalcalculatedHours == 0 ? null : `${totalcalculatedHours} Hrs`;

    } else {
      return null;
    }
  }
  getnoOfHours1(calendarObject) {
    var totalcalculatedHours = 0;
    if (calendarObject.meta.breakupObject != null && calendarObject.meta.breakupObject.AttendanceBreakUpDetailsType != 400) {


      // totalcalculatedHours += this.convertH2M(calendarObject.meta.breakupObject.TotalSubmittedHours);
      // if (calendarObject.meta.breakupObject.LstEmployeeAttendancePunchInDetails && calendarObject.meta.breakupObject.LstEmployeeAttendancePunchInDetails.length > 0) {

      //   calendarObject.meta.breakupObject.LstEmployeeAttendancePunchInDetails.forEach(element => {
      //     totalcalculatedHours += this.convertH2M(element.SubmittedHours);
      //   });
      // }
      // var startTime = moment(calendarObject.meta.breakupObject.FirstCheckIn, 'HH:mm');
      // var endTime = moment(calendarObject.meta.breakupObject.LastCheckedOut, 'HH:mm');
      // var totalHrs = endTime.diff(startTime, 'hour');
      // var totalMinutes = endTime.diff(startTime, 'minutes');
      //  var  totalHrs = Number(this.parseHours(parseFloat(totalcalculatedHours.toFixed(2).toString().split(".")[1])));
      totalcalculatedHours = calendarObject.meta.breakupObject.TotalApprovedHours != null && calendarObject.meta.breakupObject.TotalApprovedHours != undefined ? calendarObject.meta.breakupObject.TotalApprovedHours.toFixed(2) : 0;
      return Number.isNaN(totalcalculatedHours) == true ? null : totalcalculatedHours == 0 ? null : `/${totalcalculatedHours} Hrs`;

    } else {
      return null;
    }
  }
  getDayHoursConsidered(calendarObject) {
    var dayHrsConsidered = 0;
    if (calendarObject.meta.breakupObject != null && calendarObject.meta.breakupObject.AttendanceBreakUpDetailsType != 400) {
      dayHrsConsidered = calendarObject.meta.breakupObject.DayHoursConsidered != null ? calendarObject.meta.breakupObject.DayHoursConsidered.toFixed(2) : 0;
      return Number.isNaN(dayHrsConsidered) == true ? null : `${dayHrsConsidered} Hrs`;
    } else {
      return null;
    }
  }
  getallLeaveRequest() {
    this.LstEmployeeLeaveRequest = [];

    this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {

      // if(w.Status == 100){
      while (moment(w.startDate) <= moment(w.endDate)) {
        if (moment(w.startDate).format('YYYY-MM-DD') >= moment(this.minDate).format('YYYY-MM-DD') || moment(w.startDate).format('YYYY-MM-DD') <= moment(this.maxDate).format('YYYY-MM-DD')) {
          if (this.LstEntitlementAvailmentRequestDetails != undefined && this.LstEntitlementAvailmentRequestDetails.length > 0 && this.LstEntitlementAvailmentRequestDetails.find(aa => aa.EARId == w.Id && moment(aa.AttendanceDate).format('YYYY-MM-DD') == moment(w.startDate).format('YYYY-MM-DD') && aa.Status == 1) != undefined) {

            this.LstEmployeeLeaveRequest.push({
              LeaveDate: w.startDate,
              EntitlementId: w.EntitlementId,
              AppliedUnits: w.AppliedUnits,
              Status: w.Status,
              ApprovedUnits: w.ApprovedUnits,
              EntitlmentName: this.LstEntitlement.find(a => a.Id == w.EntitlementId).Description,
              StatusName: this.LstLeaveStatus.find(a => a.id == w.Status).name,
              Id: w.Id

            });

            let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(w.startDate).format('YYYY-MM-DD'));

            if (renovate != undefined && renovate != null && w.Status != 200 && w.Status != 300) {



              renovate.meta.isLeaveRequested = true,
                renovate.meta.LeaveattendanceType = this.LstEntitlement.find(z => z.Id == w.EntitlementId).Code,
                renovate.color = w.Status == 100 ? colors.yellow : colors.red;

              renovate.meta.leaveObject = w;
              if (w.IsAppliedForFirstHalf || w.IsAppliedTillFirstHalf) {
                renovate.meta.isFirstHalf = true;
                renovate.meta.isHalfDay = true;
              }
              else if (w.IsAppliedFromSecondHalf || w.IsAppliedTillSecondHalf) {

                renovate.meta.isSecondHalf = true;
                renovate.meta.isHalfDay = true;
              }
              else if (w.IsAppliedFromSecondHalf && w.IsAppliedTillFirstHalf) {

                renovate.meta.isFirstHalf = true;
                renovate.meta.isSecondHalf = true;
                renovate.meta.isHalfDay = true;

              }
              else if (!w.IsAppliedForFirstHalf && w.IsAppliedFromSecondHalf) {
                renovate.meta.isSecondHalf = true;
                renovate.meta.isHalfDay = true;

              }
              else if (!w.IsAppliedForFirstHalf && !w.IsAppliedFromSecondHalf && !w.IsAppliedTillFirstHalf && !w.IsAppliedTillSecondHalf) {
                renovate.meta.isFirstHalf = false;
                renovate.meta.isSecondHalf = false
                renovate.meta.isHalfDay = false;
              }
              else if (w.IsAppliedForFirstHalf && w.IsAppliedFromSecondHalf && w.IsAppliedTillFirstHalf && w.IsAppliedTillSecondHalf) {
                renovate.meta.isFirstHalf = true;
                renovate.meta.isSecondHalf = true;
                renovate.meta.isHalfDay = true;
              }
              // this.LstAttendanceType.find(z => z.id == calendarObject.meta.breakupObject.AttendanceType).name;
            }
          }


        }
        w.startDate = moment(w.startDate).add(1, 'days').format('YYYY-MM-DD');
      }
      // }
    });


    console.log('ee ::', this.events);


  }

  eventClicked({ event }: { event: CalendarEvent }): void {
  }

  modal_dismiss() {
    $('#popup_donext').modal('hide');
  }


  dayClicked({
    date,
    events,

  }: {
    date: Date;
    events: CalendarEvent<{}>[];


  }): void {

    if(environment.environment.ClientsNotAllowedToClickOnDayInAttendance && environment.environment.ClientsNotAllowedToClickOnDayInAttendance.includes(this._clientId)) {
      return;
    }

    try {


      this.dayClickEvent_date = date;
      if (new Date(date).getMonth() < new Date (this.serverDateTime).getMonth()) {
        this.isPastMonth = true;
      }
      else {
        this.isPastMonth = false;
      }

      if (new Date(date).getMonth() <= new Date (this.serverDateTime).getMonth()) {
        this.isNextMonth = false;
      }
      else {
        this.isNextMonth = true;
      }
      this.dayClcikEvent_events = events;
      console.log(this.dayClcikEvent_events);
      if (this._permissionConfig) {
        let pastDate = new Date().setDate(new Date().getDate() - this._permissionConfig.MaxNoOfPastDaysAllowed);

        let finalpastDate = moment(pastDate).format('YYYY-MM-DD');
        let finalcurrentCode = moment(date).format('YYYY-MM-DD');
        if (finalcurrentCode >= finalpastDate) {
          this.isPastDateAllowed = true
        }
        else {
          this.isPastDateAllowed = false
        }
      }
      console.log('this._attendanceConfiguration', this._attendanceConfiguration);
     
      

      this._CompensationConfiguration = this._attendanceConfiguration.CompensationConfiguration;
      this.WowClimeTypeArr = [];
      this._CompensationConfiguration.AllowedClaimTypes.forEach(item => {
        this.WowClimeTypeArr_list.forEach(obj => {
          if (item == obj.ClimeType_Val) {
            this.WowClimeTypeArr.push(obj);
          }
        })
      });


      this.TodayWeekNo = moment(this.dayClickEvent_date, 'DD-MM-YYYY').format('d');
      this.IsWeekHalf = false;
      this.IsHolidayForWOH = false;
      this.weekOffs.forEach(element => {
        // if (this.TodayWeekNo == element && this._attendanceConfiguration.IsAllowedToRequestForWOW == true) {
        if (this.TodayWeekNo == element) {
          this.IsWeekHalf = true;
        }
      });
      //this.HolidayListArr;
      if (this.HolidayListArr.length == 0) {
        this.HolidayListArr = this.LstHolidays;
      }
      this.HolidayListArr.forEach(ele => {
        //console.log(moment(ele.Date, 'DD-MM-YYYY'));
        //console.log(moment(this.dayClickEvent_date, 'DD-MM-YYYY'));
        if (moment(new Date(ele.Date), 'DD-MM-YYYY').format('D') == moment(new Date(this.dayClickEvent_date), 'DD-MM-YYYY').format('D') &&
          moment(new Date(ele.Date), 'DD-MM-YYYY').format('M') == moment(new Date(this.dayClickEvent_date), 'DD-MM-YYYY').format('M') &&
          moment(new Date(ele.Date), 'DD-MM-YYYY').format('YYYY') == moment(new Date(this.dayClickEvent_date), 'DD-MM-YYYY').format('YYYY')) {
          this.IsHolidayForWOH = true;
        }
      })
      if (!this._attendanceConfiguration.IsUseDefaultWorkingHoursFromShiftDefinition) {

        this.LstHolidays = [];
        if (!this._attendanceConfiguration.IsAllowToPunchOnNonPayableDay) {
          this.LstHolidays != null && this.LstNonPayabledays.length > 0 && this.LstHolidays.forEach(element => {
            if (moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(element.Date).format('YYYY-MM-DD') == true) {
              this.alertService.showWarning("Note : You are not allowed to visit.");
              return;
            }
          });
        }

        if (!this._attendanceConfiguration.IsAllowToPunchOnHoliday) {
          this.LstHolidays != null && this.LstHolidays.length > 0 && this.LstHolidays.forEach(element => {
            if (moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(element.Date).format('YYYY-MM-DD') == true) {
              this.alertService.showWarning("Note : You are not allowed to visit during the holidays.");
              return;
            }
          });
          this.openButtonChooserModal();

        } if (!this._attendanceConfiguration.IsAllowToPunchOnHoliday) {

          if (this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays && moment(this.currentDate).format('YYYY-MM-DD') > moment(this.dayClickEvent_date).format('YYYY-MM-DD')) {
            this.alertService.showWarning("You are not permitted to revert to the expiration date and create or modify your new entries.");
            return;
          }

          if (this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays && this._attendanceConfiguration.MaxPastDaysThatCanBeEdited != 0) {

            let a = new Date(this.currentDate);
            let b = new Date(this.dayClickEvent_date);
            var i = `'${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}'`;
            var j = `'${b.getMonth() + 1}/${b.getDate()}/${b.getFullYear()}'`;
            var future = moment(j);
            var start = moment(i);
            var diff = future.diff(start, 'days');
            const days = Math.round(diff) + 1;
            if (this._attendanceConfiguration.MaxPastDaysThatCanBeEdited >= days) {
              // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
              //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
              //   return;
              // }
              // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
              //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
              //   return;
              // }
              //else
              if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
                this.alertService.showWarning("You have already taken a leave on the date you specified.");
                return;
              }
              else {
                // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
                //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
                //   return;
                // }
                // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
                //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
                //   return;
                // }
                // else 
                if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
                  this.alertService.showWarning("You have already taken a leave on the date you specified.");
                  return;
                }
                else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
                  this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
                  return;
                }
                // else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
                //   this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
                //   return;
                // }
                else {
                  $('#popup_donext').modal('show');
                }
              }

            } else {
              this.alertService.showWarning("Please note: It is incorrect to attempt to change or create a new entry beyond the days you have been granted.");
              return;
            }

          }
          if (this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays && this._attendanceConfiguration.MaxPastDaysThatCanBeEdited == 0) {
            // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
            //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
            //   return;
            // }
            // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
            //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
            //   return;
            // }
            // else 
            if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
              this.alertService.showWarning("You have already taken a leave on the date you specified.");
              return;
            }
            else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
              this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
              return;
            }
            else {
              $('#popup_donext').modal('show');
            }
          }
          // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
          //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
          //   return;
          // }
          // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
          //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
          //   return;
          // }
          // else 
          if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
            this.alertService.showWarning("You have already taken a leave on the date you specified.");
            return;
          }
          else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
            this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
            return;
          }
          else {
            $('#popup_donext').modal('show');
          }
        }
        else {
          // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
          //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
          //   return;
          // }
          // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
          //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
          //   return;
          // }
          // else 
          if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
            this.alertService.showWarning("You have already taken a leave on the date you specified.");
            return;
          }
          else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
            this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
            return;
          }
          else {
            $('#popup_donext').modal('show');
          }
        }
      }
      else {
        // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
        //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
        //   return;
        // }
        // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
        //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
        //   return;
        // }
        // else
        if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
          this.alertService.showWarning("You have already taken a leave on the date you specified.");
          return;
        }
        else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
          this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
          return;
        }
        else {
          $('#popup_donext').modal('show');
        }
      }
      if(this._attendanceConfiguration.IsDailyPunchRequired ){
        this.isAttendanceEntry=true
        this.isholiday=false
        for(var i in this.HolidayListArr){
          if(moment(new Date(this.HolidayListArr[i].Date)).format('DD-MM-YYYY') == moment(new Date(this.dayClickEvent_date)).format('DD-MM-YYYY')){
             this.isholiday=true
          }
        }
        if(this.isholiday&&!this._attendanceConfiguration.IsAllowToPunchOnHoliday){
           this.isAttendanceEntry=false
        
          } 
        }
    } catch (error) {
      console.log('EXCEPTION : ', error);

    }

  }

  openButtonChooserModal() {

    if (this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays && moment(this.currentDate).format('YYYY-MM-DD') > moment(this.dayClickEvent_date).format('YYYY-MM-DD')) {
      this.alertService.showWarning("You are not permitted to revert to the expiration date and create or modify your new entries.");
      return;
    }
    if (this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays && this._attendanceConfiguration.MaxPastDaysThatCanBeEdited != 0) {

      let a = new Date(this.currentDate);
      let b = new Date(this.dayClickEvent_date);
      var i = `'${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}'`;
      var j = `'${b.getMonth() + 1}/${b.getDate()}/${b.getFullYear()}'`;
      var future = moment(j);
      var start = moment(i);
      var diff = future.diff(start, 'days');
      const days = Math.round(diff) + 1;
      if (this._attendanceConfiguration.MaxPastDaysThatCanBeEdited >= days) {
        // if (this.dayClcikEvent_events[0].meta && this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
        //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
        //   return;
        // }
        // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
        //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
        //   return;
        // }
        // else 
        if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
          this.alertService.showWarning("You have already taken a leave on the date you specified.");
          return;
        }
        else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
          this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType} on the date you specified.`);
          return;
        }
        else {
          $('#popup_donext').modal('show');
        }
      } else {
        this.alertService.showWarning("Please note: It is incorrect to attempt to change or create a new entry beyond the days you have been granted.");
        return;
      }

    }
    if (this._attendanceConfiguration.IsAllowToEditInAndOutTimesForPastDays && this._attendanceConfiguration.MaxPastDaysThatCanBeEdited == 0) {
      // if (this.dayClcikEvent_events[0].meta.ODStatus != 0 && this.dayClcikEvent_events[0].meta.ODStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
      //   this.alertService.showWarning("You have already taken an OD on the date you specified.");
      //   return;
      // }
      // else if (this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
      //   this.alertService.showWarning("You have already taken a WFH on the date you specified.");
      //   return;
      // }
      // else 
      if ((this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true) && this.dayClcikEvent_events[0].meta.breakupObject.Status != 50) {
        this.alertService.showWarning("You have already taken a leave on the date you specified.");
        return;
      }
      else if (this.dayClcikEvent_events[0].meta.attendanceType && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP' && this.dayClcikEvent_events[0].meta.WFHStatus != 0 && this.dayClcikEvent_events[0].meta.WFHStatus != 200 && (this.dayClcikEvent_events[0].meta.isFirstHalf == true || this.dayClcikEvent_events[0].meta.isSecondHalf == true)) {
        this.alertService.showWarning(`You have already taken a ${this.dayClcikEvent_events[0].meta.attendanceType}  on the date you specified.`);
        return;
      }
      else {
        $('#popup_donext').modal('show');
      }
    }
  }

  onClickAttendanceEntry() {

    console.log('dayClcikEvent_events', this.dayClcikEvent_events);
    // if(this._attendanceConfiguration.IsEmployeeAllowToRegularizeAttendance == false){
    //   this.alertService.showWarning('You have no permission to punchin in out. please contact support admin ');
    //     return; 
    // }

    this.modal_dismiss();
    let isNotValidForUpdate: boolean = false;
    if (this.dayClcikEvent_events[0].meta.breakupObject != null && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {
      let breakupObject = this.dayClcikEvent_events[0].meta.breakupObject;
      if (breakupObject != null && breakupObject.AttendanceBreakUpDetailsType == 400) {
        isNotValidForUpdate = true;
        this.alertService.showWarning('You have already taken a leave on the date you specified.');
        return;
      }
      if (breakupObject != null && (breakupObject.Status != 50 && breakupObject.Status != 100 && breakupObject.Status != 500)) {
        this.alertService.showWarning('The date of your choice has already been submitted.');
        return;
      }

    }

    if (this.dayClcikEvent_events[0].meta.leaveObject != null && this.dayClcikEvent_events[0].meta.attendanceType != 'LOP') {

      // let breakupObject = this.dayClcikEvent_events[0].meta.breakupObject;
      // if (breakupObject != null && breakupObject.AttendanceBreakUpDetailsType == 400) {
      //   isNotValidForUpdate = true;
      //   this.alertService.showWarning('You have already taken a leave on the date you specified.');
      //   return;
      // }

      // if (breakupObject != null && (breakupObject.Status != 50 && breakupObject.Status != 100 && breakupObject.Status != 500)) {
      //   this.alertService.showWarning('The date of your choice has already been submitted.');
      //   return;
      // }

      let leaveObject = this.dayClcikEvent_events[0].meta.leaveObject;
      // if (leaveObject.Status != 50 || leaveObject.Status != 100 || leaveObject.Status != 500) {
      //   this.alertService.showWarning('The date of your choice has already been submitted.');
      //   return;
      // }
      while (moment(leaveObject.startDate) <= moment(leaveObject.endDate)) {

        if (moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(leaveObject.startDate).format('YYYY-MM-DD') && moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(leaveObject.endDate).format('YYYY-MM-DD')) {
          if (leaveObject.IsAppliedForFirstHalf || leaveObject.IsAppliedFromSecondHalf || leaveObject.IsAppliedTillFirstHalf || leaveObject.IsAppliedTillSecondHalf) {
            // allow to proceeed
            isNotValidForUpdate = false;
            this.dayClcikEvent_events[0].meta.isFirstHalf = (leaveObject.IsAppliedForFirstHalf || leaveObject.IsAppliedTillFirstHalf) ? true : false;
            this.dayClcikEvent_events[0].meta.isSecondHalf = (leaveObject.IsAppliedFromSecondHalf || leaveObject.IsAppliedTillSecondHalf) ? true : false;
            this.dayClcikEvent_events[0].meta.isHalfDay = this.dayClcikEvent_events[0].meta.isFirstHalf || this.dayClcikEvent_events[0].meta.isSecondHalf ? true : false
          } else {
            isNotValidForUpdate = true;
            this.alertService.showWarning('You have already taken a leave on the date you specified.')
            break;
            // not allow 
          }
        }
        else if (moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(leaveObject.startDate).format('YYYY-MM-DD') && moment(this.dayClickEvent_date).format('YYYY-MM-DD') != moment(leaveObject.endDate).format('YYYY-MM-DD')) {

          if (leaveObject.IsAppliedForFirstHalf || leaveObject.IsAppliedFromSecondHalf) {
            // alert('allow to processs')
            isNotValidForUpdate = false;
            this.dayClcikEvent_events[0].meta.isFirstHalf = leaveObject.IsAppliedForFirstHalf
            this.dayClcikEvent_events[0].meta.isSecondHalf = leaveObject.IsAppliedFromSecondHalf
            this.dayClcikEvent_events[0].meta.isHalfDay = this.dayClcikEvent_events[0].meta.isFirstHalf || this.dayClcikEvent_events[0].meta.isSecondHalf ? true : false
          } else {

            isNotValidForUpdate = true;
            this.alertService.showWarning('You have already taken a leave on the date you specified.')
            break;
          }

        }

        leaveObject.startDate = moment(leaveObject.startDate).add(1, 'days').format('YYYY-MM-DD');
      }

      if (leaveObject != null && this.dayClcikEvent_events[0].meta.isHalfDay == false && this.dayClcikEvent_events[0].meta.leaveObject.Status == 100) {
        this.alertService.showWarning('Would you like to register for attendance, please cancel your leave request, then enter your details.')
        return;
      }
      else if (leaveObject != null && this.dayClcikEvent_events[0].meta.isHalfDay == false) {
        this.alertService.showWarning('You have already taken a leave on the date you specified.')
        return;
      }

      if (isNotValidForUpdate == false) {
        this.handleAttenanceRequestModal();
      }

    } else {
      this.handleAttenanceRequestModal()
    }
  }



  handleAttenanceRequestModal() {
    if (moment(this.currentDate).format('YYYY-MM-DD') < moment(this.dayClickEvent_date).format('YYYY-MM-DD')) {
      this.alertService.showWarning("Please Note: You cannot specify punchin/punchout in the upcoming dates or the upcoming attendance periods.");
      return;
    }

    const modalRef = this.modalService.open(AttendanceRequestComponent, this.modalOption);
    modalRef.componentInstance.EmployeeObject = this._employeeBasicDetails;
    modalRef.componentInstance.JObject = JSON.stringify({
      preferredDate: new Date(this.dayClcikEvent_events[0].start),
      AttendancePeriod: this._employeeBasicAttendanceDefinition.AttendancePeriod,
      WorkShiftDefinition: this._employeeBasicAttendanceDefinition.WorkShiftDefinition,
      CalendarObject: this.dayClcikEvent_events[0].meta,
      AttendanceConfiguration: this._attendanceConfiguration,
      LstAttendanceGeoFenceCoordinatesMapping: this.LstAttendanceGeoFenceCoordinatesMapping,
      CompanyId: this.CompanyId
    });
    modalRef.componentInstance.AttendanceConfig = this._attendanceConfiguration;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.onRefresh();
      } else {
        this.onRefreshModal()
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  onRefreshModal() {
    this.attendanceService.GetAttendanceDataByEmployeeId(this.EmployeeId, this.presentMonth, this.presentYear)
      .subscribe((response) => {
        let apiResult: apiResult = response;
        if (apiResult.Status) {
          let res = JSON.parse(apiResult.Result);
          console.log('GetAttendanceData ::', res);

          this.LstEmployeeAttendanceBreakUpDetails = res.LstEmployeeAttendanceBreakUpDetails;

          if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
            this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')) != undefined) {
            this.FSI = this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')).FirstCheckIn != null ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).FirstCheckIn : '--:--'
            this.LSO = this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment().format('YYYY-MM-DD')).LastCheckedOut != null ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).LastCheckedOut : '--:--'
            if (this.FSI != '--:--') {
              this.PunchInOutText = 'Punch Out';
            }
          }

          this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.LstEmployeeAttendanceBreakUpDetails.forEach(e => {
            let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(e.AttendanceDate).format('YYYY-MM-DD'));

            if (renovate != undefined && renovate != null) {
              renovate.meta.breakupObject = e;
              renovate.meta.ODStatus = e.ODStatus;
              renovate.meta.WFHStatus = e.WFHStatus;
              if (e.AttendanceBreakUpDetailsType == 400) {
                renovate.meta.attendanceType = e.FirstHalfEntitlementId == 0 ? 'LOP' : this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).Code  // this.commonService.getUpperCaseLetterAtFirst(this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).DisplayName);
                renovate.color = colors.red;
                renovate.meta.isFirstHalf = true;
                renovate.meta.isSecondHalf = true;

              } else if (e.AttendanceBreakUpDetailsType == 200) {
                renovate.meta.attendanceType = e.FirstHalfEntitlementId == 0 ? 'LOP' : this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).Code  //this.commonService.getUpperCaseLetterAtFirst(this.LstEntitlement.find(z => z.Id == e.FirstHalfEntitlementId).DisplayName);
                renovate.color = colors.red;
                renovate.meta.isFirstHalf = true;
                renovate.meta.isSecondHalf = false;
              }
              else if (e.AttendanceBreakUpDetailsType == 300) {
                renovate.meta.attendanceType = e.SecondHalfEntitlementId == 0 ? 'LOP' : this.LstEntitlement.find(z => z.Id == e.SecondHalfEntitlementId).Code  //this.commonService.getUpperCaseLetterAtFirst(this.LstEntitlement.find(z => z.Id == e.SecondHalfEntitlementId).DisplayName);
                renovate.color = colors.red;
                renovate.meta.isFirstHalf = false;
                renovate.meta.isSecondHalf = true;

              } else {
                renovate.color = colors.green;
                renovate.meta.attendanceType = 'P';
                // renovate.meta.attendanceType = 'P';
              }
              // e.AttendanceType == 3 ? renovate.color = colors.green : renovate.color = colors.red;
              // this.LstAttendanceType.find(z => z.id == calendarObject.meta.breakupObject.AttendanceType).name;
            }

          });

          this.getallLeaveRequest();

          console.log('EVENTS ::', this.events);


        } else {
          console.error('EXECEPTION ERROR LINE NO : 312');
        }

      }, err => {

      }

      )
  }


  onClickLeaveRequest() {
    console.log('dayClcikEvent_events', this.dayClcikEvent_events);
    let isNotValidForUpdate: boolean = false;
    if(this.dayClcikEvent_events[0].meta.ODStatus == 100 || this.dayClcikEvent_events[0].meta.ODStatus == 300){
      this.alertService.showWarning('You have already taken OD on the date you specified. Please Cancel that and apply it.')
        return;
    }
    if(this.dayClcikEvent_events[0].meta.WFHStatus == 100 || this.dayClcikEvent_events[0].meta.WFHStatus == 300){
      this.alertService.showWarning('You have already taken WFH on the date you specified. Please Cancel that and apply it.')
        return;
    }
    if (this.dayClcikEvent_events[0].meta.leaveObject != null) {

      if (this.dayClcikEvent_events[0].meta.leaveObject != null) {
        this.alertService.showWarning('You have already taken a leave on the date you specified.')
        return;
      }


      // let leaveObject = this.dayClcikEvent_events[0].meta.leaveObject;     
      // while (moment(leaveObject.startDate) <= moment(leaveObject.endDate)) {

      //   if (moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(leaveObject.startDate).format('YYYY-MM-DD') && moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(leaveObject.endDate).format('YYYY-MM-DD')) {
      //     if (leaveObject.IsAppliedForFirstHalf || leaveObject.IsAppliedFromSecondHalf || leaveObject.IsAppliedTillFirstHalf || leaveObject.IsAppliedTillSecondHalf) {
      //       // allow to proceeed
      //       isNotValidForUpdate = false;
      //       this.dayClcikEvent_events[0].meta.isFirstHalf = (leaveObject.IsAppliedForFirstHalf || leaveObject.IsAppliedTillFirstHalf) ? true : false;
      //       this.dayClcikEvent_events[0].meta.isSecondHalf = (leaveObject.IsAppliedFromSecondHalf || leaveObject.IsAppliedTillSecondHalf) ? true : false;
      //       this.dayClcikEvent_events[0].meta.isHalfDay = this.dayClcikEvent_events[0].meta.isFirstHalf || this.dayClcikEvent_events[0].meta.isSecondHalf ? true : false
      //     } else {
      //       isNotValidForUpdate = true;
      //       this.alertService.showWarning('You have already taken a leave on the date you specified.')
      //       break;
      //       // not allow 
      //     }
      //   }
      //   else if (moment(this.dayClickEvent_date).format('YYYY-MM-DD') == moment(leaveObject.startDate).format('YYYY-MM-DD') && moment(this.dayClickEvent_date).format('YYYY-MM-DD') != moment(leaveObject.endDate).format('YYYY-MM-DD')) {

      //     if (leaveObject.IsAppliedForFirstHalf || leaveObject.IsAppliedFromSecondHalf) {
      //       // alert('allow to processs')
      //       isNotValidForUpdate = false;
      //       this.dayClcikEvent_events[0].meta.isFirstHalf = leaveObject.IsAppliedForFirstHalf
      //       this.dayClcikEvent_events[0].meta.isSecondHalf = leaveObject.IsAppliedFromSecondHalf
      //       this.dayClcikEvent_events[0].meta.isHalfDay = this.dayClcikEvent_events[0].meta.isFirstHalf || this.dayClcikEvent_events[0].meta.isSecondHalf ? true : false
      //     } else {

      //       isNotValidForUpdate = true;
      //       this.alertService.showWarning('You have already taken a leave on the date you specified.')
      //       break;
      //     }

      //   }

      //   leaveObject.startDate = moment(leaveObject.startDate).add(1, 'days').format('YYYY-MM-DD');
      // }



    } else {

      this.modal_dismiss();

      this.presentYear = new Date(this.dayClcikEvent_events[0].start).getFullYear();
      this.presentMonth = (new Date(this.dayClcikEvent_events[0].start).getMonth() + 1)
      const modalRef = this.modalService.open(EmployeeleaverequestModalComponent, this.modalOption);
      modalRef.componentInstance.EmployeeObject = this._employeeBasicDetails;
      modalRef.componentInstance.JObject = JSON.stringify({
        preferredDate: new Date(this.dayClcikEvent_events[0].start),
        isEmployee: true

      });
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          this.onRefresh();
        } else {
          this.onRefreshModal();
          this.getAttendanceRecord(this.presentMonth, this.presentYear);
        }
      }).catch((error) => {
        console.log(error);
      });

    }


    // this.router.navigate(['/app/leaves/employeeleaveentries']);
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
    this.presentMonth = (new Date(this.viewDate).getMonth() + 1);
    this.presentYear = new Date(this.viewDate).getFullYear();
    this.getAttendanceRecord(this.presentMonth, this.presentYear);
  }

  decrement(): void {
    this.changeDate(this.subPeriod(this.view, this.viewDate, 1));
    this.presentMonth = (new Date(this.viewDate).getMonth() + 1);
    this.presentYear = new Date(this.viewDate).getFullYear();
    this.getAttendanceRecord(this.presentMonth, this.presentYear);

    // this.getAttendanceRecord()
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
        color: colors.blue,

        meta: {
          breakupObject: null,
          isLeaveRequested: false,
          leaveObject: null,
          isHalfDay: false,
          isFirstHalf: false,
          isSecondHalf: false,
          isHoliday: false,
          isNonPayableday: false,
          WFHStatus: 0,
          ODStatus: 0,
          isChecked: false,
          attendanceType: null
        }
      })
      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');

    }
    console.log('EE', this.events);

    return date;
  }

  getDataDiff(startDate, endDate) {
    var diff = endDate.getTime() - startDate.getTime();
    var days = Math.floor(diff / (60 * 60 * 24 * 1000));
    var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
    var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
    var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
    return { day: days, hour: hours, minute: minutes, second: seconds };
  }


  checkIsCurrentDate(calandarEvent) {
    return (moment(calandarEvent.start).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) == true ? true : false;
  }

  triggerImageCapture_modalPopup() {
    const promise = new Promise((res, rej) => {
      const modalRef = this.modalService.open(ImagecaptureModalComponent, this.modalOption);
      modalRef.componentInstance.employeeDetails = { EmployeeName: this._employeeBasicDetails.FirstName, EmployeeCode: this._employeeBasicDetails.Code, AttendanceDate: new Date(this.dayClcikEvent_events[0].start) };

      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          console.log('result', result);
          res(result);
        }
        else {
          res(null);
        }
      }).catch((error) => {
        console.log(error);
      });
    })
    return promise;

  }

  toggleTimer() {

    this.punchInSpinner = true;
    this.currentDate = new Date();

    if (this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn) {
      this.triggerImageCapture_modalPopup().then((result) => {
        if (result != null) {
          this.callbacktoggelTimer();
          return;
        } else {
          this.alertService.showWarning("Action required : Please update your image.");
          return;
        }
      });
    }
    else if (this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchOut) {
      this.triggerImageCapture_modalPopup().then((result) => {
        if (result != null) {
          this.callbacktoggelTimer();
          return;
        } else {
          this.alertService.showWarning("Action required : Please update your image.");
          return;
        }
      });
    }
    else
      this.callbacktoggelTimer();

  }


  calculatedTotalHours(punchInTime, punchOutTime) {
    var totalHrs = 0;
    var currentAttendanceDate: Date = new Date(this.currentDate);
    var patternedDate = moment(currentAttendanceDate).format('YYYY-MM-DD');
    var i = new Date(`${patternedDate} ` + punchInTime);
    var j = new Date(`${patternedDate} ` + punchOutTime);
    if (j != null && i != null) {
      var fromhrs = moment(i, 'HH:mm');
      var tillhrs = moment(j, 'HH:mm');
      totalHrs = tillhrs.diff(fromhrs, 'hour');
      var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
      totalHrs = Number(this.parseHours(totalMinutes));
    }
    return totalHrs;
  }


  callbacktoggelTimer() {

    this.PunchInOutText === 'Punch In' ? this.FSI = moment().format('HH:mm:ss') : this.LSO = moment().format('HH:mm:ss');
    (this.PunchInOutText === 'Punch In' && !this._attendanceConfiguration.IsAutoPunchOutEnabled) ? this.PunchInOutText = 'Punch Out' : this.PunchInOutText = 'Punch In';
    this.tobeHidden = this._attendanceConfiguration.IsAutoPunchOutEnabled == true ? true : false;
    console.log('this.FSI', this.FSI);
    console.log('this.LSO', this.LSO);

    // this.PunchInOutText = this.FSI == '--:--'  ? 'Sign In ' : 'Sign Out ';
    // this.loadingScreenService.startLoading();

    this.actualWorkingHours += this.calculatedTotalHours(this._employeeBasicAttendanceDefinition.WorkShiftDefinition, this._employeeBasicAttendanceDefinition.WorkShiftDefinition);

    let AttendanceStartDateTime: Date;
    AttendanceStartDateTime = new Date();

    let AttendanceEndDateTime: Date;
    AttendanceEndDateTime = new Date();

    var totalHrs: number = 0;
    var patternedDate = moment(AttendanceStartDateTime).format('YYYY-MM-DD');
    var timeStart = new Date(`${patternedDate} ` + this.FSI);
    var j = this.LSO != '--:--' ? moment(AttendanceEndDateTime + ' ' + this.LSO) : null;
    if (j != null) {
      var timeEnd = new Date(`${patternedDate} ` + this.LSO);
      var fromhrs = moment(timeStart, 'HH:mm');
      var tillhrs = moment(timeEnd, 'HH:mm');
      totalHrs = tillhrs.diff(fromhrs, 'hour');
      var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
      totalHrs = Number(this.parseHours(totalMinutes));
      var diff = this.getDataDiff(timeStart, timeEnd);
    }
    if (Number.isNaN(totalHrs)) {
      totalHrs = 0
    }
    var empAttendanceBreakupList = [];
    var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
    employeeAttendanceBreakUpDetails.Id = this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
      this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).Id : 0;
    employeeAttendanceBreakUpDetails.RequesterRemarks = '';
    employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
    employeeAttendanceBreakUpDetails.PayableDay = this.actualWorkingHours >= totalHrs ? 1 : 0;;
    employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
    employeeAttendanceBreakUpDetails.AttendanceCode = this.LstAttendanceType.find(a => a.name == 'Present').name;
    employeeAttendanceBreakUpDetails.IsFullDayPresent = this.actualWorkingHours >= totalHrs ? true : false;;
    employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
    employeeAttendanceBreakUpDetails.TotalSubmittedHours = totalHrs;
    employeeAttendanceBreakUpDetails.LastCheckedOut = this.LSO == '--:--' ? null : this.LSO as any;
    employeeAttendanceBreakUpDetails.FirstCheckIn = this.FSI as any;
    employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date()).format('YYYY-MM-DD');
    employeeAttendanceBreakUpDetails.YADId = 0;
    employeeAttendanceBreakUpDetails.AttendancePeriodId = this._employeeBasicAttendanceDefinition.AttendancePeriod.Id;
    employeeAttendanceBreakUpDetails.AttendanceCycleId = this._employeeBasicAttendanceDefinition.AttendancePeriod.AttendanceCycleId;
    employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
    employeeAttendanceBreakUpDetails.PISId = '0';
    employeeAttendanceBreakUpDetails.AttendanceBreakUpDetailsType = AttendanceBreakUpDetailsType.FullDayPresent;
    employeeAttendanceBreakUpDetails.EmployeeId = this._employeeBasicDetails.Id;
    employeeAttendanceBreakUpDetails.ApproverRemarks = '';
    employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = [] // this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
    // this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).Id : [];
    empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);

    console.log('empAttendanceBreakupList', empAttendanceBreakupList);



    // let submitAttendanceUIModel = new SubmitAttendanceUIModel();
    // submitAttendanceUIModel.LstEmployeeAttendanceBreakUpDetails = empAttendanceBreakupList;
    // submitAttendanceUIModel.ModuleProcessAction = 30;
    // submitAttendanceUIModel.Role = {
    //   IsCompanyHierarchy: false,
    //   RoleId: this.RoleId
    // }

    // this.attendanceService.SubmitEmployeeAttendanceBreakUpDetails(submitAttendanceUIModel)
    //   .subscribe((result) => {
    //     console.log(result);
    //     let apiresult: apiResult = result;
    //     if (apiresult.Status) {
    //       this.punchInSpinner = false;
    //       // this.alertService.showSuccess(apiresult.Message);       
    //       this.onRefresh();


    //     }
    //     else {
    //       this.alertService.showWarning(apiresult.Message);
    //     }

    //   })


    this.attendanceService.UpsertEmployeeAttendanceBreakUpDetails(JSON.stringify(empAttendanceBreakupList))
      .subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.punchInSpinner = false;
          // this.alertService.showSuccess(apiresult.Message);       
          this.onRefresh();

        }
        else {
          this.alertService.showWarning(apiresult.Message);
        }

      })
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
                this.punchInSpinner = false;
                this.loadingScreenService.stopLoading();
                // this.alertService.showSuccess(apiresult.Message);       
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
  // selectTime(){
  //   $('#input_starttime').pickatime({
  //     // 12 or 24 hour
  //     twelvehour: true,
  //     });
  // }

  onClickSubmitPermission() {
    this.loadingScreenService.startLoading();
    if (this._date && this._startTime && this._endTime && this._remarks) {
      let data = new SubmitPermissionModel()
      data.EmployeeId = this._employeeId;
      data.Date = moment(this._date).format("YYYY-MM-DD");
      data.StartTime = this._startTime;
      data.EndTime = this._endTime
      data.Reason = this._remarks
      this.attendanceService.insertRequestPermission(data).subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        this.loadingScreenService.stopLoading();
        if (apiresult.Status) {
          this._submittedHours = null
          this.alertService.showSuccess(apiresult.Message);
          //debugger;
          // this.getAttendanceRecord();
          this.onRefresh();
          this.closePermissionPopup()
        }
        else {
          // ! 16.2 Panasonic 
          this.alertService.showWarning("An error occurred :  You cannot specify a new request in the upcoming attendance period or You have already availed permission for that particular date.");

        }

      })

    } else {
      this.spinner = false;
      this.alertService.showWarning('Please provide required fields');

    }
  }
  onChangeExpenseDate(i) {

  }
  onSearchStartChange(i) {
    this._endTime = null
    this._submittedHours = null
  }
  onSearchChange(searchValue: string): void {

    var takenTime = searchValue;
    var curtime = moment.duration(this._permissionConfig.MinTimeInterval).asMinutes();
    let totalMin = moment.duration(takenTime).asMinutes() - moment.duration(this._startTime).asMinutes()
    let totalTime = moment.utc(moment.duration(totalMin, "minutes").asMilliseconds()).format("HH:mm")

    let maxTimeInterval = moment.duration(this._permissionConfig.MaxTimeInterval).asMinutes();
    let maxAllowedTime = moment(this._startTime, 'HH:mm:ss').add(maxTimeInterval, 'minutes').format('HH:mm');
    let Final_time = moment(this._startTime, 'HH:mm:ss').add(curtime, 'minutes').format('HH:mm');
    if (totalTime >= this._permissionConfig.MinTimeInterval && totalTime <= this._permissionConfig.MaxTimeInterval && takenTime <= "23:59:00") {

      this._submittedHours = moment.duration(takenTime).asMinutes() - moment.duration(this._startTime).asMinutes()
      var totalTimeInMin = this._submittedHours;
      // this._submittedHours=(Math.floor(totalTimeInMin / 60) + ':' + totalTimeInMin % 60)
      this._submittedHours = moment.utc(moment.duration(totalTimeInMin, "minutes").asMilliseconds()).format("h:mm")
      console.log("this._submittedHours", this._submittedHours);
    }
    else if (this._startTime > this._endTime) {
      this._endTime = null
      this._submittedHours = null
      this.alertService.showWarning(`Start time is lesser than end time.`);

    }
    else if (takenTime > maxAllowedTime) {
      this._endTime = null
      this._submittedHours = null
      this.alertService.showWarning(`Maximum time allowed for permission: ${this._permissionConfig.MaxTimeInterval}.`);

    }
    else if (takenTime < this._startTime) {
      this._endTime = null
      this._submittedHours = null
      this.alertService.showWarning('Please enter valid time....');
    }
    else if (Final_time > takenTime) {
      this.alertService.showWarning(`Minimum time allowed for permission: ${this._permissionConfig.MinTimeInterval}.`);
      this._endTime = null
      this._submittedHours = null
    }
    else {
      this._submittedHours = moment.duration(takenTime).asMinutes() - moment.duration(this._startTime).asMinutes()
      var totalTimeInMin = this._submittedHours;
      // this._submittedHours=(Math.floor(totalTimeInMin / 60) + ':' + totalTimeInMin % 60)
      this._submittedHours = moment.utc(moment.duration(totalTimeInMin, "minutes").asMilliseconds()).format("h:mm")
      console.log("this._submittedHours", this._submittedHours);

    }
  }
  permissionTimecaluculation(requestList) {
    let _totalMin = 0;
    let _totalTime = ""
    let _splitTime = []
    if (requestList && requestList.length > 0) {
      for (let reqObj of requestList) {

        _totalMin = moment.duration(reqObj['EndTime']).asMinutes() - moment.duration(reqObj['StartTime']).asMinutes()
        _totalTime = moment.utc(moment.duration(_totalMin, "minutes").asMilliseconds()).format("hh:mm")
        _splitTime = _totalTime.split(":");
        reqObj['totalTime'] = `${_splitTime[0]} Hr ${_splitTime[1]} Min`
        reqObj.StartTime = moment(reqObj.StartTime, "HH:mm:ss").format("hh:mm A");
        reqObj.EndTime = moment(reqObj.EndTime, "HH:mm:ss").format("hh:mm A");
      }
      return requestList
    }

    else {
      return requestList = []
    }
  }

  onClickPermission() {
    this.loadingScreenService.startLoading();
    this.modal_dismiss()
    $('#calenderPermissionList_popup').modal('hide');


    let count = 2
    this.attendanceService.getPermissionRequest(this._employeeId, count)
      .subscribe((result) => {
        console.log(result);
        this.loadingScreenService.stopLoading();
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.recentRequests = JSON.parse(result.Result)
          this.recentRequests = this.permissionTimecaluculation(this.recentRequests)
          console.log(" this.recentRequests", this.recentRequests)


        }
        else {
          this.alertService.showWarning(apiresult.Message);
        }
      })
    this._minTime = moment().format("HH:mm")
    let minDate = new Date().setDate(new Date().getDate() - this._permissionConfig.MaxNoOfPastDaysAllowed);
    this._MinDate = new Date(minDate)
    let maxDate = new Date().setMonth(new Date().getMonth() + 1 + 3);//this is for 3 months
    this._MaxDate = new Date(maxDate)


    // this._MaxDate=new Date()

    this._date = this.dayClickEvent_date
    console.log("date in permission popup", this._date)
    if (this._permissionConfig.IsAllowedToRequestPermission) {
      $('#popup_permission').modal('show');
    }
    else {
      //alert('You have no permission to take request')
      this.alertService.showWarning('Not allowed to request for permission')
    }

  }
  onClickWoWFn() {
    $('#popup_donext').modal('hide');
    this._WOWdate = this.dayClickEvent_date;
    let minDate = new Date().setDate(new Date().getDate() - this._permissionConfig.MaxNoOfPastDaysAllowed);
    this._MinDate = new Date(minDate)
    let maxDate = new Date().setMonth(new Date().getMonth() + 1 + 3);//this is for 3 months
    this._MaxDate = new Date(maxDate)
    // this.LastHistoryReqArr = [{ id: 1, Clime_Type: 'None', Clime_Val: 'NONE' }, { id: 2, Clime_Type: 'Leave', Clime_Val: 'LEAVE' }, { id: 3, Clime_Type: 'Decide later', Clime_Val: 'DECIDELATER' },]
    //this.LastHistoryReqArr =[];
    // if (this._dummyObj.IsAllowedToRequestPermission) {
    if (this._attendanceConfiguration.IsAllowedToRequestForWOW) {
      $('#popup_WOW').modal('show');
    }
    else {
      //alert('You have no permission to take request')
      this.alertService.showWarning('Not allowed to request for permission')
    }
  };
  onClickOdFn() {
    $('#popup_donext').modal('hide');
    this._dateRangeOd = [this.dayClickEvent_date, this.dayClickEvent_date];
    if (this._permissionConfig.IsAllowedToRequestPermission) {
      $('#popup_Od').modal('show');
      this.LastRecentOdHistory();
    }
    else {
      this.alertService.showWarning('Not allowed to request for permission')
    }
  };
  onClickWfhFn() {
    $('#popup_donext').modal('hide');
    this._dateRangeWfh = [this.dayClickEvent_date, this.dayClickEvent_date];
    if (this._permissionConfig.IsAllowedToRequestPermission) {
      $('#popup_Wfh').modal('show');
      this.LastRecentWfhHistory();
    }
    else {
      this.alertService.showWarning('Not allowed to request for permission')
    }
  };
  onChange_WOWChkFn(event, obj) {
    for (var i in this.WowClimeTypeArr) {
      if (this.WowClimeTypeArr[i].id == obj.id) {
        this.WowClimeTypeArr[i].Clime_ModelVal = true;
      }
      else {
        this.WowClimeTypeArr[i].Clime_ModelVal = false;
      }
    }
  }
  /*Wor on -Week Off and Leave Request Fn*/
  onClickSubmitWOWFn() {
    var parms = {
      Date: '',
      ClaimType: '',
      Remarks: ''
    };
    for (var i in this.WowClimeTypeArr) {
      if (this.WowClimeTypeArr[i].Clime_ModelVal == true) {
        parms.ClaimType = this.WowClimeTypeArr[i].ClimeType_Val;
        break;
      }
    }
    parms.Date = moment(this._WOWdate).format('YYYY-MM-DD');
    parms.Remarks = this._WOWremarks;
    console.log('sentObj', parms);
    /*API*/
    //debugger;
    this.loadingScreenService.startLoading();
    this.attendanceService.Post_ClaimType(parms).subscribe((ress) => {
      console.log('Post_ClaimType_responce', ress);
      this.loadingScreenService.stopLoading();
      if (ress && ress.Status == true) {
        this.alertService.showSuccess(ress.Message);
        this.LastRecentWOWHistory();
        this.closeWOWPopup();
      }
      else if (ress && ress.Status == false) {
        this.alertService.showWarning(ress.Message);
      }
    }, err => {
      console.error('Submit API Error');
    })
  }
  closeWOWPopup() {
    this._WOWdate = null
    this._WOWremarks = null;
    this.WowClimeTypeArr.forEach(element => {
      element.Clime_ModelVal = false;
    });
    //this.WowClimeTypeArr =
    $('#popup_WOW').modal('hide');
  }
  /*API Submit OD Fn*/
  onClickSubmitOdFn() {
    var parms = {
      FromDate: '',
      TillDate: '',
      Remarks: ''
    };
    parms.FromDate = this._OddateFromDate ? this._OddateFromDate.format('YYYY-MM-DD') : '';
    parms.TillDate = this._OddateToDate ? this._OddateToDate.format('YYYY-MM-DD') : '';
    parms.Remarks = this._Odremarks;
    console.log('sentOdObj', parms);
    //debugger;
    /*API*/
    //debugger;
    if (parms.FromDate && parms.TillDate && parms.Remarks) {
      this.loadingScreenService.startLoading();
      this.attendanceService.postRequestOd(parms).subscribe((ress) => {
        console.log('Post_OD_responce', ress);
        this.loadingScreenService.stopLoading();
        if (ress && ress.Status == true) {
          this.alertService.showSuccess(ress.Message);
          // this.LastRecentOdHistory();
          this.onRefresh();
          this.closeOdPopup();
        }
        else if (ress && ress.Status == false) {
          this.alertService.showWarning(ress.Message);
        }
      }, err => {
        this.loadingScreenService.stopLoading();
        console.error('Submit API Error');
      })
    }
    else {
      this.alertService.showWarning('Please Enter Required Fields');
    }
  }
  closeOdPopup() {
    this._OddateFromDate = null
    this._OddateToDate = null
    this._Odremarks = null;
    this._dateRangeOd = null;
    //this.WowClimeTypeArr =
    $('#popup_Od').modal('hide');
  }
  /*API submit Wfh Request*/
  onClickSubmitWfhFn() {
    // this.spinner = true;
    if (this._WfhdateFromDate && this._WfhdateToDate && this._Wfhremarks) {
      var parms = {
        FromDate: '',
        TillDate: '',
        Remarks: ''
      };
      parms.FromDate = this._WfhdateFromDate ? this._WfhdateFromDate.format('YYYY-MM-DD') : '';
      parms.TillDate = this._WfhdateToDate ? this._WfhdateToDate.format('YYYY-MM-DD') : '';
      parms.Remarks = this._Wfhremarks;
      console.log('sentWfhObj', parms);
      this.loadingScreenService.startLoading();
      this.attendanceService.postRequestWfh(parms).subscribe((result) => {
        console.log(result);
        this.loadingScreenService.stopLoading();
        let apiresult: apiResult = result;
        this.spinner = false;
        if (apiresult && apiresult.Status == true) {
          this._submittedHours = null
          this.alertService.showSuccess(apiresult.Message);
          // this.LastRecentWfhHistory();
          this.onRefresh();
          this.closeWfhPopup();
        }
        else if (apiresult && apiresult.Status == false) {
          this.alertService.showWarning(apiresult.Message);
        }
      }, err => {
        this.loadingScreenService.stopLoading();
        console.error('Submit API Error');
      });

    } else {
      this.spinner = false;
      this.alertService.showWarning('Please provide required fields');

    }
  }
  closeWfhPopup() {
    this._WfhdateFromDate = null
    this._WfhdateToDate = null
    this._Wfhremarks = null;
    this._dateRangeWfh = null;
    //this.WowClimeTypeArr =
    $('#popup_Wfh').modal('hide');
  }
  closePermissionPopup() {
    this._date = null
    this._startTime = null
    this._endTime = null
    this._remarks = null
    $('#popup_permission').modal('hide');
  }
  DisabledFn() {
    this.ClaimChecked = false;
    this.WowClimeTypeArr.forEach(item => {
      if (item.Clime_ModelVal == true) {
        this.ClaimChecked = true;
      }
    })
    if (this._WOWdate && this._WOWremarks && this.ClaimChecked) {
      return true;
    }
    else {
      return false;
    }
  }
  DisabledOdFn() {
    if (this._dateRangeOd && this._Odremarks) {
      return true;
    }
    else {
      return false;
    }
  }
  DisabledWfhFn() {
    if (this._dateRangeWfh && this._Wfhremarks) {
      return true;
    }
    else {
      return false;
    }
  }
  DisabledPerFn() {
    if (this._date && this._startTime && this._endTime && this._remarks) {
      return true;
    }
    else {
      return false;
    }
  }
  calenderPermissionList(event, list) {
    event.preventDefault();
    event.stopPropagation();
    list = this.permissionTimecaluculation(list)
    this._calenderPermisssionList = list
    $('#calenderPermissionList_popup').modal('show');
  }
  closePermissionRequestListPopup() {

    $('#calenderPermissionList_popup').modal('hide');
  }
  /*Date Od Range Change Fn*/
  onChange_DateRangeOd(searchValue: string): void {
    if (searchValue && searchValue.length > 1) {
      this._OddateFromDate = moment(searchValue[0], 'DD-MM-YYYY');
      this._OddateToDate = moment(searchValue[1], 'DD-MM-YYYY');

    };
  }
  /*Date Wfh Range Change Fn*/
  onChange_DateRangeWfh(searchValue: string): void {
    if (searchValue && searchValue.length > 1) {
      this._WfhdateFromDate = moment(searchValue[0], 'DD-MM-YYYY');
      this._WfhdateToDate = moment(searchValue[1], 'DD-MM-YYYY');
    };
  }
  dabbadisable(obj) {
    debugger;
    if (obj.ODStatus == 300 || obj.WFHStatus == 300) {
      return true;
    }
    else {
      return false;
    }
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
          const data = this.events.find(a => a.meta.isChecked);
          // console.log('***', data);
          const modalRef = this.modalService.open(RegularizeAttendanceModalComponent, this.modalOption);
          modalRef.componentInstance.employeeAttendanceDetails = data;
          modalRef.componentInstance.AttendanceConfig = this._attendanceConfiguration;
          modalRef.componentInstance.attendanceDate = this.selectedDays[0];
          modalRef.componentInstance.shiftDetails = this.LstworkShiftMapping;
          modalRef.componentInstance.employeeBasicDetails = this._employeeBasicDetails;
          modalRef.result.then((result) => {
            this.selectedDays = [];
            this.events.forEach(a => {
              a.meta.isChecked = false;
            });
            if (result != "Modal Closed") {
              this.onRefresh();
            } else {
              this.onRefreshModal()
            }
          }).catch((error) => {
            console.log(error);
          });
        } else {
          this.selectedDays = [];
          this.events.forEach(a => {
            a.meta.isChecked = false;
          });
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(parsedRes.Message);
        }
      } else {
        this.selectedDays = [];
        this.events.forEach(a => {
          a.meta.isChecked = false;
        });
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


  // REFACTOR
  async GetAttendanceConfigurationByEmployeeId(employeeId) {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetAttendanceConfigurationByEmployeeId(employeeId)
        .subscribe((configResponse) => {
          console.log('ATTEN CONFIG :: ', configResponse);
          this.GetEmployeeEntitlementList(this.EmployeeId);
          this.presentMonth = (new Date().getMonth() + 1);
          this.presentYear = new Date().getFullYear();
          this.getAttendanceRecord(this.presentMonth, this.presentYear);
          res(configResponse);
        });

    });

    return promise;
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
      this.onRefresh();
    });
  }

  

  

}
