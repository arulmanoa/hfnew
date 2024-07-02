import { Component, OnInit, Input, Output, EventEmitter, Injectable } from '@angular/core';
import { forEach, result } from 'lodash';
import * as moment from 'moment';
import Swal from "sweetalert2";
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

import { formatDate } from '@angular/common';
// formatDate(new Date(), 'yyyy/MM/dd', 'en');
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
declare let $: any;
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { EmployeeService } from 'src/app/_services/service/index';

import {
  subMonths, addMonths, addDays, addWeeks, subDays, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay,
  endOfDay,
} from 'date-fns';
import {
  CalendarEvent,
  CalendarEventAction,
  CalendarEventTimesChangedEvent, CalendarMonthViewDay,
  CalendarView, CalendarUtils
} from 'angular-calendar';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { Subject, Observable } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, PayrollService, ExcelService } from 'src/app/_services/service';
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
import { Title } from '@angular/platform-browser';
import { ExportAsService, ExportAsConfig } from 'ngx-export-as';
import { environment } from 'src/environments/environment';
import { EntitlementAvailmentRequest, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { AttendanceBreakUpDetailsStatus, AttendanceBreakUpDetailsType, EmployeeAttendancModuleProcessStatus } from 'src/app/_services/model/Attendance/AttendanceEnum';
import { EmployeeAttendanceDetails, RegularizeAttendanceEmployeeUIModel, SubmitAttendanceUIModel, SubmitRegularizedAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { EntitlementRequestStatus } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
// import { AttendanceBreakUpDetailsStatus, EmployeeAttendancModuleProcessStatus } from 'src/app/_services/model/Attendance/AttendanceEnum';
// import { EmployeeAttendanceDetails, SubmitAttendanceUIModel, SubmitRegularizedAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { GetMonthViewArgs, MonthView } from 'calendar-utils';
import { EmployeebulkattendanceModalComponent } from 'src/app/shared/modals/attendance/employeebulkattendance-modal/employeebulkattendance-modal.component';
import { AttendanceConfiguration } from 'src/app/_services/model/Attendance/AttendanceConfiguration';
import { LeaveregularizeComponent } from 'src/app/shared/modals/leaveManagement/leaveregularize/leaveregularize.component';
import { EmployeeleaverequestModalComponent } from 'src/app/shared/modals/leaveManagement/employeeleaverequest-modal/employeeleaverequest-modal.component';
import { RegularizeleaverequestModalComponent } from 'src/app/shared/modals/attendance/regularizeleaverequest-modal/regularizeleaverequest-modal.component';
import { ImageviewerComponent } from 'src/app/shared/modals/imageviewer/imageviewer.component';
import { isObjectEmpty } from 'ngx-bootstrap/chronos/utils/type-checks';
import { RegularizeAttendanceModalComponent } from 'src/app/shared/modals/attendance/regularize-attendance-modal/regularize-attendance-modal.component';
@Injectable()
export class MyCalendarUtils extends CalendarUtils {
  getMonthView(args: GetMonthViewArgs): MonthView {
    args.viewStart = subWeeks(startOfMonth(args.viewDate), 1);
    args.viewEnd = addWeeks(endOfMonth(args.viewDate), 1);
    return super.getMonthView(args);
  }
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
  },
  gray: {
    primary: '#3BBD72',
    secondary: '#3BBD72'
  },
  // ! : 16.2 for panasonic
  empty: {
    primary: '#ffffff',
    secondary: '#ffffff',
  }
};

type CalendarPeriod = 'day' | 'week' | 'month';
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

const exportAsConfig: ExportAsConfig = {
  type: 'xlsx', // the type you want to download
  elementIdOrContent: 'myTableIdElementId1', // the id of html/table element,
  options: { // html-docx-js document options
    orientation: 'landscape',
    margins: {
      top: '20'
    }
  }
}
@Component({
  selector: 'app-attendanceentries',
  templateUrl: './attendanceentries.component.html',
  styleUrls: ['./attendanceentries.component.scss']
})
export class AttendanceentriesComponent implements OnInit {

  // static data
  AttendanceCycleList: any[] = [];
  IsMusterroll: boolean = true;
  dates: any[] = [];
  globalDates: any[] = [];
  attendances: any[] = [];
  currentDate = new Date();
  iconVisible: boolean = false;
  toShown: boolean = false;
  // popup
  visible_attendReview: boolean = false;
  spinner: boolean = false;
  // actual implementation
  activeTabName: any;
  leavetype: any[] = [];
  reviewData: any;
  employeeObject: any;
  EmployeeObject: any;
  isBulkView: boolean = false;
  expandIcon = 'right';
  expandIcon_tooltip = "expand more"
  isRejected: boolean = false;
  isAbsent: boolean = false;
  indxOfWeek: any = 0;
  selectedWeek_period: any;
  isweekBased: boolean = false
  render_spinner: boolean = false;
  LstHolidays: any[] = [];

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
  weeks: any[] = [];
  weeksList: any[] = [
    {
      id: 1,
      name: 'Filter By : All weeks'
    },
    {
      id: 2,
      name: "Filter By : One week"
    }
  ]
  selectedWeekType: any = 1;
  monthNames = ["Jan", "Feb", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;

  _payrollInputSubmission: PayrollInputsSubmission = new PayrollInputsSubmission();
  _attendancePeriods: AttendancePeriod[] = [];
  openAttendancePeriodId: number;
  currentPeriodName: any;
  currentPeriodCycle: any;
  currentPeriodDays: any;
  //ATTENDANCE SLIDER
  attendance_slider: boolean = false;
  attendance_slider_activeTabName: any = 'attendanceInputs';
  _EntitlementBalances: any;
  _attendanceDetailsOfEmployee: any;
  _AttendanceType: any[] = [];
  LstTimeCardAllowanceProducts: any[] = [];
  TimeCardDetails = new TimeCard();
  attendance_header: any[] = [];
  attendance_actualData: any = [];
  //  Calendar
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
  searchText: any = null;
  // POPUP MODAL
  AttendForm: FormGroup;
  submitted = false;
  isValidDates = true;
  radioItems: Array<string>;
  isOpen: boolean = false;
  mm: any[] = [];
  _TeamId: any;
  _ManagerId: any;
  _IsPayrollSubmitted: boolean = false;
  isSameDate: boolean = true;
  isProxyAction: any;
  HRRoleCode: any;
  RoleCode: any;
  // NEW IMPLEMENTATIONS 
  regularize_attendance_slider: boolean = false;
  regularize_attendance_review_slider: boolean = false;
  EADetails: any // any[] = [];
  LstEntitlement = [];
  LstEntitlementAvailmentRequest = [];
  LstLeaveStatus: any;
  LstEmployeeLeaveRequest: any;

  attendanceObject: any;
  LstPunchInDetails: any[] = [];
  isInvalidTablePunchInOutTime: boolean = false;
  ApproverRemarks: any;
  regularizationData: any;
  dayClicked_event: any;
  // EMPLOYEE ATTENDANCE DETAILS
  employeeAttendanceDetails: EmployeeAttendanceDetails = new EmployeeAttendanceDetails();
  _entitlementList: any[] = [];
  _requestEntitlementList: any[] = [];

  remainingDays: any = 0;
  requestedDays: any = 0;
  leaveTypeName: any;
  eligibaleDays: any = 0;
  availableDays: any = 0;
  preRequestedDays: any = 0

  _from_minDate: Date;
  _till_minDate: Date;
  isDisabledTillDate: boolean = false;
  isDisabledTillFirstHalf: boolean = false;
  isDisabledFromSecondHalf: boolean = false;
  isinvalidDate: boolean = false;
  IsShowBalanceInUI: boolean = true;
  IsLossOfPay: boolean = false;
  selectedEntitlement: EmployeeEntitlement = new EmployeeEntitlement();
  employeeAttendance: any = null;
  _entitlementAvailmentRequestsApprovals: EntitlementAvailmentRequest[] = [];
  selectedEmployeeAttendanceObject: any[] = [];

  _entitlementAvailmentRequests: EntitlementAvailmentRequest[] = [];
  _attendanceConfiguration: AttendanceConfiguration = new AttendanceConfiguration();
  IsRegularizeBtnRequired: boolean = false;
  modalOption: NgbModalOptions = {};
  weekOffs: any[] = [];
  excludeDays: number[] = [];
  _clientId: any;
  _permissionConfigClientBased: any;
  _employeePermissionList: any = [];
  _calenderPermisssionList: any = [];
  // MARK LWD
  markfnf_Reason: any;
  markfnf_minDate = new Date();
  markFnf_LastWorkingDate: any;
  selectedEmplolyeesForMarkLWD = [];
  // ! : 16.2 for panasonic
  IsAllowedToEditInOutTime: boolean = false;
  AllowedRolesForRegularizeAttendance: string;
  IsOpenAttendancePeriod: boolean = false;
  PresentAttendancePeriodId: number = 0;
  refreshing_table_spinner: boolean = false;
  IsEmptyEmployeeList: boolean = false;

  regularizePending: boolean = false;
  isShiftSpanAcrossDays: boolean = false;
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
    private exportAsService: ExportAsService,
    private router: Router,
    private drawerService: NzDrawerService,
    private modalService: NgbModal,
    private employeeService: EmployeeService,
    private excelService: ExcelService


  ) {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("cond");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });


  }

  onRefresh() {
    this.selectedEmplolyeesForMarkLWD = [];
    this.HRRoleCode = environment.environment.HRRoleCode;
    this.AllowedRolesForRegularizeAttendance = environment.environment.AllowedRoleForRegularizeEmployeessAttendance;
    this.IsOpenAttendancePeriod = false;
    this.IsEmptyEmployeeList = false;
    this.spinner = true;
    this.titleService.setTitle('Employee Attendance Entries');
    this.LstLeaveStatus = this.utilsHelper.transform(EntitlementRequestStatus) as any[];
    this.selectedEmployeeAttendanceObject = [];
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        var encodedMdx = atob(params["Mdx"]);

        this._TeamId = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this._ManagerId = Number(encodedMdx) == undefined ? 0 : Number(encodedMdx);

        // this.GetPayrollInputSubmissionUIData().then((resu) => {
        // });

        this.searchText = null;
        this.attendance_header = [];
        var attendanceType = []
        attendanceType = this.utilsHelper.transform(AttendanceType) as any;
        const filterArray = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10];
        this._AttendanceType = attendanceType.filter(({ id }) => filterArray.includes(id));
        this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
        this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
        this.UserId = this.sessionDetails.UserSession.UserId;
        this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
        this.UserName = this.sessionDetails.UserSession.PersonName;
        this.isProxyAction = (sessionStorage.getItem('IsProxy')) as any;
        this.GetRegularizationAttendanceData().then((result) => {
          if (result != null) {
            console.log('PROMISE RESOLVE ::', result);
          }
        })

      } else {
        this.spinner = false;
        sessionStorage.removeItem('IsProxy');
        this.router.navigateByUrl('app/attendance/teamattendance')
        alert('No records found!');
        return;
      }
    });


  }
  onClose() {
    sessionStorage.removeItem('IsProxy');
    if (sessionStorage.getItem('isattendance_redirection') == 'true') {
      sessionStorage.removeItem('isattendance_redirection');
      this.router.navigateByUrl('app/listing/ui/teamAttendanceList');
    } else {
      this.router.navigateByUrl('app/attendance/teamattendance')

    }
  }



  ngOnInit() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.onRefresh();
  }

  getDaysInMonth(startDate, endDate) {

    this.dates = []
    while (moment(startDate) <= moment(endDate)) {
      var formDate = new Date(startDate)
      this.dates.push({ date: (formDate) });
      startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
    }

  }



  /* #region  Attendance slider - Dev */
  /* #region  calendar module dependencies */


  eventClicked({ event }: { event: CalendarEvent }): void {
    // console.log(event);
  }
  dayClicked({ date,
    events,
  }: {
    date: Date;
    events: CalendarEvent<{}>[];
  }): void {

    // let jsobj = events[0] as any;
    // this.isValidDates = true;
    // this.radioItems = ['Present', 'Absent'];
    // this.createForm();
    // this.isOpen = true
    // this.AttendForm.patchValue({
    //   StartDate: (jsobj.start),
    //   EndDate: (jsobj.end),
    //   // Action : 'Present'
    //   isHalfDay: jsobj.meta.IsFirstDayHalf,
    //   AttendanceType: jsobj.meta.AttendanceType,
    //   IsFirstHalf: jsobj.meta.IsFirstHalf,
    //   IsSecondHalf: jsobj.meta.IsSecondHalf,
    //   AttendanceType_SecondHalf: jsobj.meta.AttendanceType_SecondHalf,
    //   Action: jsobj.color.primary === "#3BBD72" ? 'Present' : jsobj.color.primary === "#ad2121" ? 'Absent' : 'Others'
    // });
    if (!this.IsOpenAttendancePeriod) {
      return;
    }
    this.dayClicked_event = events[0] as any;
    this.attendanceObject = null;

    // $('#popup_edit_attendance').modal('show');
    console.log('this.EADetails', this.EADetails);
    console.log('this.events', events);
    console.log('this.dayClicked_event', this.dayClicked_event);
    // ! : 16.2 for panasonic
    if (this.dayClicked_event.meta.IsWeekOff) {

      return;
    }

    this.loadingScreenService.startLoading();
    // ! : 16.2 for panasonic
    this.IsAllowedToEditInOutTime = false;

    if(this.RoleCode == 'Manager') {
      this.checkManagerAllowedToRegularize(events[0].start).then((result) => {
        this.callRegularizeModal(events);
      });
    }  else {
      this.callRegularizeModal(events);
    }
  }

  checkManagerAllowedToRegularize(date) {
    // to check if manager allowed to regularize for the selected date
    let attendanceObj = this.EADetails.find(a => moment(a.AttendanceDate).format('YYYY-MM-DD') == moment(date).format('YYYY-MM-DD'));
    const selectedAttendanceDate = moment(attendanceObj.AttendanceDate).format('MM-DD-YYYY');
    console.log(attendanceObj, date);
    return new Promise((resolve, reject) => {
      this.attendanceService.isManagerAllowedToRegularise(attendanceObj.EmployeeId, selectedAttendanceDate, selectedAttendanceDate).subscribe(result => {
        console.log('*****isMgrAllowedToRegularise******', result);
        if (result.Status && result.Result) {
          this.regularizePending = result.Result == '1' ? true : false;
          resolve(true);
        } else {
          this.regularizePending = false;
          resolve(false);
        }
      });
    });
  }

  callRegularizeModal(events: any) {
    const regularizationType = this._attendanceConfiguration.RegularizationType;
    this.attendanceObject = this.EADetails.find(a => moment(a.AttendanceDate).format('YYYY-MM-DD') == moment(events[0].start).format('YYYY-MM-DD'));
      console.log('aaa', this.attendanceObject);

      if (this.dayClicked_event.meta.leaveObject != null && this.dayClicked_event.meta.leaveObject.Status == 100 && this.dayClicked_event.meta.IsFirstHalf == true || this.dayClicked_event.meta.IsSecondHalf == true) {

      } else if (this.dayClicked_event.meta.leaveObject != null && this.dayClicked_event.meta.leaveObject.Status == 100 && !this.dayClicked_event.meta.IsFirstHalf && !this.dayClicked_event.meta.IsSecondHalf) {
        this.loadingScreenService.stopLoading();
        this.onClickRegularize(this.dayClicked_event.meta.leaveObject);
        // this.alertService.showWarning('You have already taken a leave on the date you specified.')
        return;
      } else {
  
      }
  
      if (this.attendanceObject == undefined || this.attendanceObject == null) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('Employee attendance information is not available');
        return;
      }
      if (this.attendanceObject.Status > 300) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning('The employee attendance information has already been submitted');
        return;
      }
      // ! : 16.2 for panasonic  
      this.IsAllowedToEditInOutTime = (this._attendanceConfiguration != null && this._attendanceConfiguration.IsManagerAllowToEditEmployeesInOutTime) || (this.AllowedRolesForRegularizeAttendance.includes(this.RoleCode) == true) ? true : false;
  
      // show detail type modal 
      // ! used for allen
      if (regularizationType == 2) {
        this.loadingScreenService.stopLoading();
        this.dayClicked_event.meta.breakupObject = this.attendanceObject;
        const _empBasicDetails = {
          Id: this.employeeAttendance.EmployeeId,
          Code:  this.employeeAttendance.EmployeeCode
        };
        const modalRef = this.modalService.open(RegularizeAttendanceModalComponent, this.modalOption);
        modalRef.componentInstance.employeeAttendanceDetails = this.dayClicked_event;
        modalRef.componentInstance.AttendanceConfig = this._attendanceConfiguration;
        modalRef.componentInstance.attendanceDate = moment(events[0].start).format('YYYY-MM-DD');
        modalRef.componentInstance.shiftDetails = [];
        modalRef.componentInstance.employeeBasicDetails = _empBasicDetails;
        modalRef.result.then((result) => {
          console.log(result);
        }).catch((error) => {
          console.log(error);
        });
      } else {
        // ! for others
        // if (this._attendanceConfiguration.IsPresentByDefault  == true) {
        if (this._attendanceConfiguration.IsDailyPunchRequired == false) {
          this.loadingScreenService.stopLoading();
          this.onClickMarkAsAbsent();
        } else {
          this.loadingScreenService.stopLoading();
          this.updateAttendaceReviewSlider();
          this.ApproverRemarks = null;
          this.regularize_attendance_review_slider = true;
        }
      }
  }

  onClickRegularize(rowData) {

    console.log('object :', result);
    const modalRef = this.modalService.open(LeaveregularizeComponent, this.modalOption);
    modalRef.componentInstance.rowData = JSON.stringify(rowData);
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('RESULT OF EDITED SO DETAILS :', result);
        this.regularize_attendance_review_slider = false;
        this.getLeaveandOtherDetailsofEmployee(this.employeeAttendance, this._payrollInputSubmission);
      }
      else {
        // this.onRefresh();


      }
    }).catch((error) => {
      console.log(error);
    });

  }


  updateAttendaceReviewSlider() {

    console.log('dayClicked_event.meta', this.dayClicked_event.meta.leaveObject);

    this.LstPunchInDetails = [];
    this.attendanceObject.FirstHalfEntitlementId == null && (this.attendanceObject.FirstHalfEntitlementId = 0);
    this.attendanceObject.SecondHalfEntitlementId == null && (this.attendanceObject.SecondHalfEntitlementId = 0);

    console.log('attendanceObject', this.attendanceObject);

    this.attendanceObject.TotalSubmittedHours = Number(this.attendanceObject.TotalSubmittedHours).toFixed(2);

    this.LstPunchInDetails.push({
      Id: this.attendanceObject.Id,
      AttendanceDate: this.attendanceObject.AttendanceDate,
      StartTime: this.attendanceObject.FirstCheckIn,
      EndTime: this.attendanceObject.LastCheckedOut,
      TotalHours: this.attendanceObject.PayableDay == 1 ? Number(9.00) : Number(this.attendanceObject.TotalSubmittedHours).toFixed(2),
      ApprovedTotalHours: this.attendanceObject.PayableDay == 1 ? Number(9.00) : Number(this.attendanceObject.TotalSubmittedHours).toFixed(2),
      ChildTableRow: 1,
      Iserror: false,
      PunchInPhotoId: this.attendanceObject.PunchInPhotoId,
      PunchOutPhotoId: this.attendanceObject.PunchOutPhotoId,
      PunchInCoordinates: this.attendanceObject.PunchInCoordinates,
      PunchOutCoordinates: this.attendanceObject.PunchOutCoordinates,
      PunchInRemarks: this.attendanceObject.PunchInRemarks,
      PunchOutRemarks: this.attendanceObject.PunchOutRemarks,

    })

    this.attendanceObject.LstEmployeeAttendancePunchInDetails != null && this.attendanceObject.LstEmployeeAttendancePunchInDetails.length > 0 && this.attendanceObject.LstEmployeeAttendancePunchInDetails.forEach(item => {
      this.LstPunchInDetails.push({
        Id: item.Id,
        AttendanceDate: item.Attendancedate,
        StartTime: item.Starttime,
        EndTime: item.FinishTime,
        TotalHours: Number(item.SubmittedHours).toFixed(2),
        ApprovedTotalHours: Number(item.SubmittedHours).toFixed(2),
        ChildTableRow: 2,
        Iserror: false,
        PunchInPhotoId: item.PunchInPhotoId,
        PunchOutPhotoId: item.PunchOutPhotoId,
        PunchInCoordinates: item.PunchInCoordinates,
        PunchOutCoordinates: item.PunchOutCoordinates,
        PunchInRemarks: item.PunchInRemarks,
        PunchOutRemarks: item.PunchOutRemarks,
      })
    });
    this.LstPunchInDetails = this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0 ? _.orderBy(this.LstPunchInDetails, ["ChildTableRow"], ["asc"]) : [];
    console.log('LstPunchInDetails', this.LstPunchInDetails)
    this.loadingScreenService.stopLoading();
  }

  Get_EntitlementAvailmentRequestsForApproval() {
    this.attendanceService.GetEntitlementAvailmentRequestsForApproval().subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {

        this._entitlementAvailmentRequestsApprovals = apiResult.Result as any;
      }
    }, err => {
      console.warn('  ERR ::', err);
    })
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
  nextMonth(): void {
    this.changeDate(this.addPeriod(this.view, this.viewDate, 1));
  }
  prevMonth(): void {
    this.changeDate(this.subPeriod(this.view, this.viewDate, 1));
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

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    body.forEach((day) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  /* #endregion */

  attendance_slider_tabset(event: any): void {

  }
  close_attendance_slider() {
    this.attendance_slider = false;
  }



  lookupDetailsTimeCardUI(Id) {
    // console.log('item', item);

    return new Promise((resolve, reject) => {
      this.payrollService.getTimeCardUILookUpDetails(Id).subscribe((result) => {
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
  enumerateDaysBetweenDates1(startDate, endDate) {
    this.attendance_header = []
    while (moment(startDate) <= moment(endDate)) {
      this.attendance_header.push({ date: (startDate) });
      startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
    }
    console.log('da', this.attendance_header);

    return this.attendance_header;
  }

  GetPayrollInputSubmissionUIData() {
    const promise = new Promise((res, rej) => {
      let _Id = 1;
      this.attendanceService.GetPayrollInputsSubmissionUIDatabyTeamandManagerId(this._TeamId, this._ManagerId)
        .subscribe((result) => {
          console.log('RESULT API ::', result);
          let apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result != null) {
            this._payrollInputSubmission = apiResult.Result as any;
            console.log('PAYROLL SUBMISSION ::', this._payrollInputSubmission);

            this._attendancePeriods = this._payrollInputSubmission.AttendanceCycle.AttendancePeriods;
            var records = this._attendancePeriods.find(a => a.Id == this._payrollInputSubmission.AttendancePeriodId);
            this._IsPayrollSubmitted = this._payrollInputSubmission.IsPayrollSubmitted;
            // if (this.RoleCode == this.HRRoleCode) {
            if (environment.environment.HRRoleCode.includes(this.RoleCode) == true) {
              this._IsPayrollSubmitted = this._payrollInputSubmission.IsMigrated;
            }
            var startDate = new Date(records.StartDate);
            var endDate = new Date(records.EndDate);

            this.enumerateDaysBetweenDates1(startDate, endDate)
            this.do_click_AttendancePeriod(this._attendancePeriods.find(a => a.Id == this._payrollInputSubmission.AttendancePeriodId))

            this._payrollInputSubmission.MasterData = _.uniqBy(this._payrollInputSubmission.MasterData, 'EmployeeId'); //removed if had duplicate id
            this._payrollInputSubmission.dtAttendanceData = _.uniqBy(this._payrollInputSubmission.dtAttendanceData, 'EmployeeId'); //removed if had duplicate id


            this._payrollInputSubmission.MasterData.forEach(element => {
              let isExists: any;
              isExists = this._payrollInputSubmission.EmployeeWiseAttendanceList.find(z => z.EmployeeId == element.EmployeeId);
              isExists != undefined && (element['AttendanceList'] = isExists.AttendanceList)
            });

            console.log('Master Data :: ', this._payrollInputSubmission.MasterData);
            this.attendance_header = [];
            this.attendance_header.length = 0;
            this.attendance_header = this._payrollInputSubmission.EmployeeWiseAttendanceList[0].AttendanceList;
            this.attendance_actualData = [];
            this.attendance_actualData.length = 0;
            this.attendance_actualData = this._payrollInputSubmission.MasterData;
            console.log('TABLE DATA ::', this.attendance_actualData);

            // this.attendance_actualData = this.attendance_actualData.concat(this.attendance_actualData);
            // this.attendance_actualData = this.attendance_actualData.concat(this.attendance_actualData);

            this.toShown = true;
            this.spinner = false;
            res(true)
          }
          else {
            this.alertService.showWarning('No records found!');
            res(true)
            return;
          }
        }, err => {
          this.spinner = true;
          console.error('ERR ::', err);

        })
    })
    return promise;

  }

  exportToExcel() {
    let exportExcelDate = [];


  }
  export() {

    // let exportExcelDate = [];
    // var temp = this.attendance_actualData[0].AttendanceList as any;
    // console.log('te', temp);

    // var objs = this.attendance_actualData.map(function (arr) {
    //   return arr.reduce(function (res, curr) {
    //     var [key, value] = curr;
    //     res[key] = value;
    //     return res;
    //   }, {});
    // });

    // console.log(objs);

    // console.log('exportExcelDate', exportExcelDate);

    // download the file using old school javascript method
    var string = `${this.regularizationData.TeamList.Name}_${this.currentPeriodName}`;
    var length = 30;
    var trimmedString = string.substring(0, length);

    let exportExcelDate = [];
    const excelArray = JSON.parse(JSON.stringify(this.attendance_actualData));
    excelArray.forEach(element => {

      let my_obj = {};
      element.Attendance.forEach((elem) => {
        if ((elem.FirstHalf == undefined || elem.FirstHalf == 'EMPTY')) {
          elem.FirstHalf = '';
        } 
        if ((elem.SecondHalf == undefined || elem.SecondHalf == 'EMPTY')) {
          elem.SecondHalf = '';
        }
        
        if (elem.IsHoliday && !elem.IsWeekOff) {
          my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = `  
        
          ${elem.IsHoliday && elem.FirstHalf && elem.FirstHalf == elem.SecondHalf && elem.FirstHalf !== '' 
          && elem.FirstHalf != null ? ` H | ${elem.FirstHalf}` : `H`}`;

        } else  if (elem.IsWeekOff && !elem.IsHoliday) {
          my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = `  
        
          ${elem.IsWeekOff && elem.FirstHalf && elem.FirstHalf == elem.SecondHalf && elem.FirstHalf !== '' 
          && elem.FirstHalf != null ? ` WO | ${elem.FirstHalf}` : `WO`}`;

        } else  if (elem.IsWeekOff && elem.IsHoliday) {
          my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = `  
        
          ${elem.IsWeekOff && elem.IsHoliday && elem.FirstHalf && elem.FirstHalf == elem.SecondHalf
             && elem.FirstHalf !== '' && elem.FirstHalf != null ? ` WO | H | ${elem.FirstHalf}` : `WO | H`}`;
        } else {
          my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = elem.IsWeekOff == true ? 'WO' : `${elem.FirstHalf}  
        
          ${elem.SecondHalf != elem.FirstHalf && elem.SecondHalf != null ? ` | ${elem.SecondHalf}` : ``}`;
        }

        // to remove white space, line breaks
        my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] =   my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')].replace(/(?:\r\n\s|\r|\n|\s)/g, '');
      });
       
      // console.log('my_obj', my_obj);
      exportExcelDate.push({
        EmployeeCode: element.EmployeeCode,
        EmployeeName: element.EmployeeName,
        DOJ: element.DOJ,
        Location: element.LocationName,
        PayableDays: element.PayableDays,
        ...my_obj,
      })

    });

    console.log('my object', exportExcelDate, excelArray);

    this.excelService.exportAsExcelFile(exportExcelDate, trimmedString);


  }

  getAttendanceDateFormat(date) {
    // date = new Date(date);
    return moment(date).format('DD-MM-YYYY');
  }

  deleteProperty(object, property) {
    var clonedObject = JSON.parse(JSON.stringify(object));
    property.forEach(e => {
      delete clonedObject[e];
    });
    return clonedObject;
  }


  do_click_AttendancePeriod(item): void {
    let isCurrentPeriod: AttendancePeriod = this._attendancePeriods.find(a => a.Id == item.Id)
    console.log('isCurrentPeriod', isCurrentPeriod);

    if (isCurrentPeriod != undefined && isCurrentPeriod != null && isCurrentPeriod.Id == this._payrollInputSubmission.AttendancePeriodId) {
      this.currentPeriodName = isCurrentPeriod.AttendancePeriodName;
      this.currentPeriodCycle = `${moment(isCurrentPeriod.StartDate).format('MMM D')} - ${moment(isCurrentPeriod.EndDate).format('MMM D')}`;
      let a = new Date(isCurrentPeriod.StartDate);
      let b = new Date(isCurrentPeriod.EndDate);
      var Difference_In_Time = a.getTime() - b.getTime();
      this.currentPeriodDays = Difference_In_Time / (1000 * 3600 * 24);
      this.currentPeriodDays = Math.abs(this.currentPeriodDays);
      this.currentPeriodDays = Number(this.currentPeriodDays) + 1;

    } else {
      this.do_GetAttendancePeriodBasedEmployeeList(isCurrentPeriod.Id);
      // this.alertService.showWarning('Info : Attendance Periods may not be avaiable currently. Please try after sometimes');
      return;
    }
  }

  do_GetAttendancePeriodBasedEmployeeList(AttendacePeriodId) {

    this.refreshing_table_spinner = true;

    this.attendanceService.GetAttendancePeriodBasedEmployeeList(this._ManagerId, this.RoleId, this._TeamId, AttendacePeriodId)
      .subscribe((result) => {

        try {
          let apiresult: apiResult = result;
          if (apiresult.Status && apiresult.Result != null) {

            this.mapAttendacePeriodData(apiresult.Result);
            // this.regularizationData = JSON.parse(apiresult.Result);
            // console.log('regularizationData', this.regularizationData);

            // this.attendance_actualData = [];
            // this.attendance_actualData.length = 0;
            // this.attendance_actualData = this.regularizationData.EmployeeDetails;
            // console.log('TABLE DATA ::', this.attendance_actualData);
            // console.log('TABLE HEADER DATA ::', this.attendance_header);
            // this.getmissingday(this.attendance_actualData);
            // this.attendance_actualData.forEach(element => {
            //   element['LocationName'] = element.WorkLocation != null && element.WorkLocation.length > 0 ? element.WorkLocation[0].LocationName : null;
            //   element['isSelected'] = false;
            // });


          } else {

          }

        } catch (error) {

        }


      });
  }

  GetAttendanceBreakUpDetailsByAttendancePeriodId(EmployeeCode, AttendancePeriodId) {
    const promise = new Promise((res, rej) => {

      this.attendanceService.GetAttendanceBreakUpDetailsByAttendancePeriodId(EmployeeCode, AttendancePeriodId)
        .subscribe((response) => {
          try {
            let apiresult: apiResult = response;
            console.log('response', response);
            console.log('apiresult', apiresult);

          } catch (error) {

          }
        })
    })
    return promise;
  }



  getWeekOff(_employeeCode) {
    this.weekOffs = [];
    var promise = new Promise((resolve, reject) => {
      this.attendanceService.getWeekOff(_employeeCode)
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
            // this.excludeDays = this.weekOffs;
            resolve(true);
          } else {
            resolve(false);

          }

        })
    });
    return promise;
  }


  async onClickEmployeeCode(attendance, payrollInputSubmission) {

    if (this._IsPayrollSubmitted && this.IsOpenAttendancePeriod) {
      this.alertService.showWarning("Please note : The payroll attendance is already submitted.");
      return;
    }


    this._attendanceDetailsOfEmployee = attendance;

    this.LstTimeCardAllowanceProducts = [];
    this.attendance_slider_activeTabName = "attendanceInputs";
    this.events = [];
    this.employeeAttendance = null;
    this.attendanceObject = null;

    this.getLeaveandOtherDetailsofEmployee(attendance, payrollInputSubmission);
    // 



    //regularizationData.PayrollInputsSubmission.AttendancePeriodId
    // this.GetAttendanceBreakUpDetailsByAttendancePeriodId(attendance.EmployeeCode, payrollInputSubmission.AttendancePeriodId).then((result) => {


    // }, err => {
    //   console.error('ERROR WHILE GETTING ATTENDNACE DETAILS :: ', err);

    // })


    // let _TimecardId = this._payrollInputSubmission.TimeCards.find(z => z.EmployeeId == attendance.EmployeeId).Id;
    // this.timecardEditDOJ = moment(attendance.DOJ, 'DD/MM/YYYY').format('YYYY-MM-DD');
    // await this.lookupDetailsTimeCardUI(this._payrollInputSubmission.TeamId).then((response: any) => {
    //   const response_lookup = response;
    //   let LstTimeCardProducts = (JSON.parse(response_lookup));
    //   console.log('TIMECARD DETAILS ::', LstTimeCardProducts);
    //   LstTimeCardProducts.AllowanceProducts != null && LstTimeCardProducts.AllowanceProducts.forEach(element => {
    //     element["Id"] = 0;
    //     element['ExistingAmount'] = 0;
    //     element['NewAmount'] = 0;

    //   });
    //   this.LstTimeCardAllowanceProducts = LstTimeCardProducts.AllowanceProducts;
    //   this.payrollService.getTimeCardDetailsById(_TimecardId)
    //     .subscribe((result) => {
    //       let apiResult: apiResult = result;
    //       if (apiResult.Status) {
    //         this.loadingScreenService.stopLoading();
    //         this.TimeCardDetails = apiResult.Result as any;
    //         let LstEntitlement = JSON.parse(this._payrollInputSubmission.EntitlementBalances);
    //         this._EntitlementBalances = LstEntitlement.filter(a => a.EmployeeId == attendance.EmployeeId);
    //         console.log('LSTENTITLEMENT :: ', this._EntitlementBalances);
    //         this._attendanceDetailsOfEmployee = attendance;
    //         console.log('ATTENDNACE :', this._attendanceDetailsOfEmployee);
    //         // for (let i = 0; i < this._payrollInputSubmission.AttendanceTypes.length; i++) {
    //         //   const element = this._payrollInputSubmission.AttendanceTypes[i];
    //         //   // this._AttendanceType.push({
    //         //   //   id: i + 1,
    //         //   //   name: element
    //         //   // })
    //         // }
    //         console.log('ATTENDNACE TYPE:', this._AttendanceType);
    //         this.viewDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
    //         this.events = [];
    //         this.minDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
    //         this.maxDate = new Date(this._payrollInputSubmission.AttendanceEndDate);


    //         this.dateOrViewChanged();

    //         this.timecardEditDOJ = new Date(this.timecardEditDOJ);
    //         this.timecardEditDOJ = new Date(this.timecardEditDOJ.getFullYear(), this.timecardEditDOJ.getMonth(), this.timecardEditDOJ.getDate());

    //         var attStart = moment(this._payrollInputSubmission.AttendanceStartDate).format('YYYY-MM-DD');
    //         var isAfterDOJ = moment(this.timecardEditDOJ).isAfter(attStart);
    //         this.viewDate = new Date(this.TimeCardDetails.AttendanceStartDate);
    //         isAfterDOJ == true ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
    //         isAfterDOJ == true ? this.viewDate = new Date(this.timecardEditDOJ) : this.viewDate = new Date(this._payrollInputSubmission.AttendanceStartDate);

    //         console.log('attttt', attendance);
    //         console.log(' new Date(this.timecardEditDOJ) ', new Date(this.timecardEditDOJ));


    //         this.TimeCardDetails.IsNewJoiner == true ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
    //         this.TimeCardDetails.IsNewJoiner == true ? this.viewDate = new Date(this.timecardEditDOJ) : this.viewDate = new Date(this._payrollInputSubmission.AttendanceStartDate);


    //         const output = this.enumerateDaysBetweenDates(this.TimeCardDetails.IsNewJoiner == true ? new Date(this.timecardEditDOJ) : new Date(this._payrollInputSubmission.AttendanceStartDate), new Date(this._payrollInputSubmission.AttendanceEndDate));

    //         var templist = [];
    //         templist = this.TimeCardDetails.AttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList : [];
    //         templist.length > 0 && templist.forEach(element => {
    //           element['customFromDate'] = this.TimeCardDetails.IsNewJoiner == true ? new Date(this.timecardEditDOJ) : element.FromDate
    //         }), this.updateAttendanceEvents(templist);

    //         this.TimeCardDetails.AllowanceList.forEach(e => {
    //           var _reUpdateAmt = this.LstTimeCardAllowanceProducts.find(a => a.ProductId === e.ProductId);
    //           _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id, _reUpdateAmt.NewAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
    //         });


    //         this.loadingScreenService.stopLoading();
    //         // this.attendance_slider = true;
    //         this.regularize_attendance_slider = true;
    //       }
    //     }, err => {

    //     })

    // }, err => {

    // })
  }

  getLeaveandOtherDetailsofEmployee(attendance, payrollInputSubmission) {

    this.loadingScreenService.startLoading();
    this.getWeekOff(attendance.EmployeeCode).then(() => console.log("Week Off Task Complete!"));
    this.attendanceService.GetAttendanceConfigurationByEmployeeCode(attendance.EmployeeCode)
      .subscribe((response) => {
        console.log('config', response);
        var apiresult = response as apiResult;
        if (apiresult.Status && apiresult.Result != null) {
          this._attendanceConfiguration = (apiresult.Result) as any;
          console.log(' ATTENDNACE CONFIG RESULT ::', this._attendanceConfiguration);
        }

        this.get_EmployeeEntitlementList(attendance.EmployeeId).then((result) => {
          // this.loadingScreenService.stopLoading();
          this.employeeAttendance = attendance;
          this.GetEmployeeAttendanceDetails(attendance, payrollInputSubmission);

        })
      })

  }



  GetEmployeeAttendanceDetails(attendance, payrollInputSubmission) {
    console.log('att', attendance)
    console.log('payrollInputSubmission', payrollInputSubmission)
    this.loadingScreenService.startLoading();
    this.attendanceService.GetEmployeeAttendanceDetails(attendance.EmployeeId, payrollInputSubmission.AttendancePeriodId)
      .subscribe((response) => {
        try {

          let apiresult: apiResult = response;
          if (apiresult.Status && apiresult.Result != null) {
            this.EADetails = [];
            this.employeeAttendanceDetails = apiresult.Result as any;
            //this._employeePermissionList=this.employeeAttendanceDetails.Permissions
            this.EADetails = this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails != null && this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails.length > 0 ? this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails : [];
            console.log('EADs :: ', this.employeeAttendanceDetails);
            this.timecardEditDOJ = moment(attendance.DOJ, 'DD/MM/YYYY').format('YYYY-MM-DD');

            this.LstTimeCardAllowanceProducts = [];
            this._EntitlementBalances = [];

            this.viewDate = new Date(payrollInputSubmission.AttendanceStartDate);
            this.events = [];
            this.minDate = new Date(payrollInputSubmission.AttendanceStartDate);
            this.maxDate = new Date(payrollInputSubmission.AttendanceEndDate);

            this.dateOrViewChanged();

            this.timecardEditDOJ = new Date(this.timecardEditDOJ);
            this.timecardEditDOJ = new Date(this.timecardEditDOJ.getFullYear(), this.timecardEditDOJ.getMonth(), this.timecardEditDOJ.getDate());

            var attStart = moment(payrollInputSubmission.AttendanceStartDate).format('YYYY-MM-DD');
            var isAfterDOJ = moment(this.timecardEditDOJ).isAfter(attStart);
            // this.viewDate = new Date(this.TimeCardDetails.AttendanceStartDate);
            isAfterDOJ == true ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = new Date(payrollInputSubmission.AttendanceStartDate);
            isAfterDOJ == true ? this.viewDate = new Date(this.timecardEditDOJ) : this.viewDate = new Date(payrollInputSubmission.AttendanceStartDate);

            const output = this.enumerateDaysBetweenDates(new Date(payrollInputSubmission.AttendanceStartDate), new Date(payrollInputSubmission.AttendanceEndDate));

            if (this.regularize_attendance_slider == true && this.employeeAttendanceDetails != null && this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails != null && this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails.length > 0) {
              this.attendanceObject = this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails.find(a => moment(a.AttendanceDate).format('YYYY-MM-DD') == moment(this.dayClicked_event.start).format('YYYY-MM-DD'));
              this.attendanceObject != undefined && this.attendanceObject != null && this.updateAttendaceReviewSlider(), this.Get_EntitlementAvailmentRequestsForApproval();

            }
            this.handle_employeeAttendanceBreakupDetails();
            this.getHolidayList(payrollInputSubmission.ClientId, payrollInputSubmission.ClientContractId, payrollInputSubmission.TeamId, attendance.EmployeeId);

            this.loadingScreenService.stopLoading();
            console.log(' this.attendanceObject',  this.attendanceObject);
            console.log('EVENT ttttt ::', this.events);


            this.regularize_attendance_slider = true;

          } else {
            this.alertService.showWarning("No attendance history available. please attempt after some time.");
            this.loadingScreenService.stopLoading();

          }
        } catch (error) {
          this.alertService.showWarning('ERR ::' + error);
          this.loadingScreenService.stopLoading();
        }



      }, error => {
        console.error('ERROR WHILE GETTING ATTENDNACE DETAILS :: ', error);
      })

  }
  updateAttendanceEvents(templist) {
    templist.forEach(element => {

      while (moment(element.customFromDate) <= moment(element.ToDate)) {
        const weekEndDays = new Date(element.customFromDate);
        // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
        var isExist = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(weekEndDays).format('YYYY-MM-DD'))
        isExist != undefined && console.log('isExist', element);
        isExist != undefined && (isExist.start = new Date(weekEndDays),
          (isExist.meta = {
            IsFirstDayHalf: isExist.meta.IsFirstDayHalf == true ? true : element.IsFirstDayHalf,
            IsFirstHalf: isExist.meta.IsFirstHalf == true ? true : element.IsFirstDayHalf,
            IsSecondHalf: isExist.meta.IsSecondHalf == true ? true : (element.IsFirstDayHalf == false && element.NumberOfDays == 0.5) ? true : false,
            AttendanceType: isExist.meta.AttendanceType != null ? isExist.meta.AttendanceType : element.Type,
            AttendanceType_SecondHalf: element.Type
          }),
          isExist.id = element.Id, isExist.title = '',
          (isExist.color = colors.red))
        // isExist != undefined &&  console.log('EVENTS 4::', this.events);

        // }
        element.customFromDate = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD');

      }
    });

    console.log('EVENTS ::', this.events);

  }

  enumerateDaysBetweenDates(startDate, endDate) {
    let date = [];
    while (moment(startDate) <= moment(endDate)) {
      const weekEndDays = new Date(startDate);
      // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
      var _sd = new Date(startDate);
      this.events.push({
        start: _sd as any,
        id: 0,
        end: _sd as any,
        title: '',
        color: colors.green,
        // title: (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-04') || (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-08') ? 'Absent' : 'Present',
        // color: (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-04') || (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-08') ? colors.red : colors.green,
        meta: {
          IsFirstDayHalf: false,
          IsFirstHalf: false,
          IsSecondHalf: false,
          AttendanceType: null,
          AttendanceType_SecondHalf: null,
          // new 
          isLeaveRequested: false,
          leaveObject: null,
          LeaveattendanceType: null,
          TotalSubmittedHours: 0,
          TotalApprovedHours: 0,
          isEADAvailable: false,
          WFHStatus: 0,
          ODStatus: 0,
          // ! : 16.2 for panasonic
          IsWeekOff: false,
          IsAutoPunchedOut: false,
          IsPresentMarkedByEmployee: false,
          isHoliday: false,
          IsMultipleEntitlement: false,
        },

      })
      // }
      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
      // }
    }
    return date;
  }



  confirmattendance() {
    this.submitted = true;
    if (this.AttendForm.invalid) {
      this.alertService.showWarning("Please fill the required items!");
      return;
    }
    // if (this.AttendForm.controls.isHalfDay.value == false) {
    //   this.SOForm.controls['isHalfDay'].setValue(false);
    // }
    if (this.AttendForm.controls.Action.value == 'Absent' && this.AttendForm.controls.AttendanceType.value == null) {
      this.AttendForm.controls['AttendanceType'].setErrors({ 'incorrect': true });
      this.alertService.showWarning("Choose your preferred Attendance type");
      return;
    } else if (this.AttendForm.controls.Action.value == 'Absent' && this.AttendForm.controls.isHalfDay.value == true && (this.AttendForm.controls.IsFirstHalf.value == false && this.AttendForm.controls.IsSecondHalf.value == false)) {
      this.alertService.showWarning("Please select your leave plan timestamp");
      return;
    }
    else if (this.AttendForm.controls.Action.value == 'Absent' && this.AttendForm.controls.isHalfDay.value == true && this.AttendForm.controls.IsFirstHalf.value == true && (this.AttendForm.controls.IsSecondHalf.value == true && this.AttendForm.controls.AttendanceType_SecondHalf.value == null)) {
      this.alertService.showWarning("Choose your preferred Attendance type (Second half)");
      return;
    }

    else {
      // if (this.AttendForm.controls.Action.value == 'Absent' && this.AttendForm.controls.AttendanceType.value != null && this.AttendForm.controls.isHalfDay.value == false) {
      //   this.AttendForm.get('isHalfDay').setValue(true);
      //   this.AttendForm.get('IsFirstHalf').setValue(true)
      //   this.AttendForm.get('IsSecondHalf').setValue(true)
      //   this.AttendForm.get('AttendanceType_SecondHalf').setValue(this.AttendForm.get('AttendanceType').value)

      // }

      // step 1 : insert record in leave request table
      // step 2 : reupdate recod, first you should get the 


      console.log('ev', this.AttendForm.value);
      this.refill_attendanceDetails();
      this.modal_dismiss_edit_attendance();
    }
  }

  // onChangestartDate(e) {
  //   (this.AttendForm.controls.StartDate.value != null && this.AttendForm.controls.EndDate.value != null ? (this.isValidDates = (new Date(Date.parse(this.AttendForm.controls.StartDate.value)) <= new Date(Date.parse(this.AttendForm.controls.EndDate.value)) || new Date(Date.parse(this.AttendForm.controls.StartDate.value)) <= new Date(Date.parse(this.AttendForm.controls.EndDate.value))) ? false : true) : this.isValidDates = false);
  //   this.isCheckSameDate();
  // }
  // onChangeendDate(e) {
  //   (this.AttendForm.controls.StartDate.value != null && this.AttendForm.controls.EndDate.value != null ? (this.isValidDates = (new Date(Date.parse(this.AttendForm.controls.StartDate.value)) !== new Date(Date.parse(this.AttendForm.controls.EndDate.value))) ? false : true) : this.isValidDates = false);
  //   this.isCheckSameDate();
  // }
  // onChangeSecondHalf(eventValue) {
  //   this.AttendForm.get('AttendanceType_SecondHalf').setValue(this.AttendForm.get('AttendanceType_SecondHalf').value)
  // }

  isCheckSameDate() {
    var startDate = moment(this.AttendForm.controls.StartDate.value).format('YYYY-MM-DD');
    var endDate = moment(this.AttendForm.controls.EndDate.value).format('YYYY-MM-DD');
    this.isSameDate = moment(startDate).isSame(endDate); // true
    // alert(this.isSameDate)


  }
  modal_dismiss_edit_attendance() {
    this.isOpen = false;
    $('#popup_edit_attendance').modal('hide');
    // this.getLeaveandOtherDetailsofEmployee(this.employeeAttendance, this._payrollInputSubmission)

  }

  refill_attendanceDetails() {

    let result = this.AttendForm.value;
    while (moment(result.StartDate) <= moment(result.EndDate)) {
      const weekEndDays = new Date(result.StartDate);
      var existingValue = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(result.StartDate).format('YYYY-MM-DD'));
      console.log('existingValue', existingValue);
      existingValue != undefined && (existingValue.start = new Date(result.StartDate), (existingValue.title = ""),
        existingValue.meta = {
          IsFirstDayHalf: result.isHalfDay,
          IsFirstHalf: result.IsFirstHalf,
          IsSecondHalf: result.IsSecondHalf,
          AttendanceType: result.AttendanceType,
          AttendanceType_SecondHalf: result.AttendanceType_SecondHalf
        },
        (existingValue.color = result.Action == 'Present' ? colors.green : result.Action == 'Absent' ? colors.red : colors.yellow))

      result.StartDate = moment(result.StartDate).add(1, 'days').format('YYYY-MM-DD');
    }
  }

  getAttendanceTypeName(event) {
    return this._AttendanceType.find(a => a.id == event.meta.AttendanceType).name
  }
  getAttendanceTypeName_multiple(event, area) {

    if (area == 'firstHalf') {
      return this._AttendanceType.find(a => a.id == event.meta.AttendanceType).name

    } else if (area == 'secondHalf') {
      return this._AttendanceType.find(a => a.id == event.meta.AttendanceType_SecondHalf).name

    }
  }

  saveTimeCardDetails() {


    this.loadingScreenService.startLoading();
    var AllowanceList = [];
    var AttendanceList = [];
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
    this.events.length > 0 && this.events.forEach((element: any) => {
      // console.log('lop element', element);

      if (element.color == colors.red) {

        if (element.meta.IsFirstHalf && element.meta.IsSecondHalf) {
          var attendance = new Attendance();
          attendance.TimeCardId = this.TimeCardDetails.Id;
          attendance.Type = element.meta.AttendanceType // AttendanceType.LOP; 
          attendance.Id = element.id as number;
          attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance.IsFirstDayHalf = element.meta.IsFirstDayHalf;
          attendance.IsSecondDayHalf = false;
          attendance.NumberOfDays = element.meta.IsFirstDayHalf == true ? 0.5 : 1;
          attendance.ReferencedTimeCardId = 0;
          attendance.Modetype = UIMode.Edit;
          AttendanceList.push(attendance);
          var attendance1 = new Attendance();
          attendance1.TimeCardId = this.TimeCardDetails.Id;
          attendance1.Type = element.meta.AttendanceType_SecondHalf // AttendanceType.LOP; 
          attendance1.Id = element.id as number;
          attendance1.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance1.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance1.IsFirstDayHalf = false; // element.meta.IsFirstDayHalf;
          attendance1.IsSecondDayHalf = true;
          attendance1.NumberOfDays = 0.5;
          attendance1.ReferencedTimeCardId = 0;
          attendance1.Modetype = UIMode.Edit;
          AttendanceList.push(attendance1);

        } else if (element.meta.IsFirstHalf && !element.meta.IsSecondHalf) {
          var attendance = new Attendance();
          attendance.TimeCardId = this.TimeCardDetails.Id;
          attendance.Type = element.meta.AttendanceType // AttendanceType.LOP; 
          attendance.Id = element.id as number;
          attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance.IsFirstDayHalf = element.meta.IsFirstDayHalf;
          attendance.IsSecondDayHalf = false;
          attendance.NumberOfDays = element.meta.IsFirstDayHalf == true ? 0.5 : 1;
          attendance.ReferencedTimeCardId = 0;
          attendance.Modetype = UIMode.Edit;
          AttendanceList.push(attendance);

        }
        else if (!element.meta.IsFirstHalf && element.meta.IsSecondHalf) {
          var attendance = new Attendance();
          attendance.TimeCardId = this.TimeCardDetails.Id;
          attendance.Type = element.meta.AttendanceType // AttendanceType.LOP; 
          attendance.Id = element.id as number;
          attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance.IsFirstDayHalf = false // element.meta.IsFirstDayHalf;
          attendance.IsSecondDayHalf = true;
          attendance.NumberOfDays = 0.5;
          attendance.ReferencedTimeCardId = 0;
          attendance.Modetype = UIMode.Edit;
          AttendanceList.push(attendance);

        }
        else if (!element.meta.IsFirstHalf && !element.meta.IsSecondHalf) {
          var attendance = new Attendance();
          attendance.TimeCardId = this.TimeCardDetails.Id;
          attendance.Type = element.meta.AttendanceType // AttendanceType.LOP; 
          attendance.Id = element.id as number;
          attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance.IsFirstDayHalf = false;
          attendance.IsSecondDayHalf = false;
          attendance.NumberOfDays = 1;
          attendance.ReferencedTimeCardId = 0;
          attendance.Modetype = UIMode.Edit;
          AttendanceList.push(attendance);

        }
        // var attendance = new Attendance();
        // attendance.TimeCardId = this.TimeCardDetails.Id;
        // attendance.Type = AttendanceType.LOP; 
        // attendance.Id = element.id as number;
        // attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
        // attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
        // attendance.IsFirstDayHalf = element.meta.IsFirstDayHalf;
        // attendance.NumberOfDays = element.meta.IsFirstDayHalf == true ? 0.5 : 1;
        // attendance.ReferencedTimeCardId = 0;
        // attendance.Modetype = UIMode.Edit;
        // AttendanceList.push(attendance);
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
    AllowanceList.length > 0 && (this.TimeCardDetails.AllowanceList = AllowanceList);
    AttendanceList.length > 0 && (this.TimeCardDetails.AttendanceList = AttendanceList);
    this.TimeCardDetails.Modetype = UIMode.Edit;
    this.TimeCardDetails.Status = TimeCardStatus.Initiated;

    this.SaveTimeCard_hitting()
  }

  SaveTimeCard_hitting() {

    let timecardModel: TimeCardModel;
    timecardModel = _TimeCardModel;
    timecardModel.NewDetails = this.TimeCardDetails;
    timecardModel.OldDetails = "";
    console.log(' this.TimeCardModel', timecardModel);
    this.attendanceService.put_UpsertTimeCard(timecardModel)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.updateTableData_byEmployee()

        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.modal_dismiss_edit_attendance();


        }
      }, err => {

      })
  }

  updateTableData_byEmployee() {

    console.log('ATTENDNACE :', this._attendanceDetailsOfEmployee);


    this._attendanceDetailsOfEmployee.AttendanceList.forEach(ele => {
      let formattedDate = new Date(ele.Date) as any;
      formattedDate = moment(formattedDate).format('YYYY-MM-DD');

      let isExist_attendance = this.TimeCardDetails.AttendanceList.filter(a => a.FromDate == formattedDate);

      if (isExist_attendance.length > 0) {

        isExist_attendance.forEach(item => {


          if (item.IsSecondDayHalf == true && item.IsFirstDayHalf == false) {
            (ele.FirstHalf = 'P');
            ele.SecondHalf = this._AttendanceType.find(a => a.id == item.Type).name
          }
          if (item.IsSecondDayHalf == false && item.IsFirstDayHalf == true) {
            (ele.FirstHalf = this._AttendanceType.find(a => a.id == item.Type).name);
            (ele.SecondHalf = 'P');
          }
          if (item.IsSecondDayHalf == true && item.IsFirstDayHalf == true) {
            (ele.FirstHalf = this._AttendanceType.find(a => a.id == item.Type).name);
            (ele.SecondHalf = this._AttendanceType.find(a => a.id == item.Type).name);
          }
          if (item.IsSecondDayHalf == false && item.IsFirstDayHalf == false) {
            (ele.FirstHalf = this._AttendanceType.find(a => a.id == item.Type).name);
            (ele.SecondHalf = this._AttendanceType.find(a => a.id == item.Type).name);
          }
          if (item.Modetype == UIMode.Delete) {
            (ele.FirstHalf = 'P');
            (ele.SecondHalf = 'P');
          }

        });
      }

    });
    console.log('ATTENDNACE 1:', this._attendanceDetailsOfEmployee);
    this.attendance_slider = false;

  }

  submitPayroll() {
    this.alertService.confirmSwal1("Are you sure you want to Submit", "WARNING:  Once submitted, you cannot edit the input data again. ", "Yes, Confirm", "No, Cancel").then((result) => {
      this.loadingScreenService.startLoading();
      var payrollInputSubmission = new PayrollInputsSubmission();
      this._payrollInputSubmission.MasterData.forEach(element => {
        let update_attendanceList = this._payrollInputSubmission.EmployeeWiseAttendanceList.find(a => a.EmployeeId == element.EmployeeId);
        update_attendanceList != undefined && (update_attendanceList.AttendanceList = [], update_attendanceList.AttendanceList = element.AttendanceList)
        this.deleteProperty(element, ['AttendanceList']);
      });
      this._payrollInputSubmission.IsProxy = this.isProxyAction == 'true' ? true : false;
      this._payrollInputSubmission.ProxyRemarks = this.isProxyAction == 'true' ? '' : '';
      this._payrollInputSubmission.ProxyUserId = this.isProxyAction == 'true' ? this.UserId : 0;
      this._payrollInputSubmission.ProxyUserName = this.isProxyAction == 'true' ? this.UserName : '';
      this._payrollInputSubmission.IsPayrollSubmitted = ((environment.environment.HRRoleCode.includes(this.RoleCode) == true) ? true : false);
      this._payrollInputSubmission.IsMigrated == false ? this._payrollInputSubmission.IsMigrated = (this.HRRoleCode != this.RoleCode ? true : false) : null;
      this._payrollInputSubmission.IsMigrated = ((environment.environment.HRRoleCode.includes(this.RoleCode) == true) ? true : false);

      // this._payrollInputSubmission.CreatedBy = Number(this._payrollInputSubmission.CreatedBy) as any;
      // this._payrollInputSubmission.LastUpdatedBy = Number(this._payrollInputSubmission.LastUpdatedBy) as any;
      console.log('this._payrollInputSubmission', this._payrollInputSubmission);
      this.attendanceService.SubmitPayrollInputsSubmission(this._payrollInputSubmission)
        .subscribe((result) => {
          this.alertService.showSuccess("Payroll input record saved successfully")
          this.loadingScreenService.stopLoading();
          this.onRefresh();
        }, err => {
          this.loadingScreenService.stopLoading();
        })
    }).catch(error => {

    });
  }

  submitRegularizedAttendance() {
    let employeeIds: number[] = [];


    console.log('attendance_actualData', this.attendance_actualData);
    let invalidEmployees = [];
    if (this.attendance_actualData === undefined || this.attendance_actualData === null || this.attendance_actualData.length <= 0) {
      this.alertService.showWarning("No Employee Exist to submit");
      return;
    }


    var isAppliedLeaveExists: boolean = false;
    for (let index = 0; index < this.attendance_actualData.length; index++) {
      const attdObject = this.attendance_actualData[index];
      var isExistsLength = [];
      console.log('yes', attdObject);
      if (attdObject.Attendance != null && attdObject.Attendance.length > 0) {
        isExistsLength = attdObject.Attendance.filter(a => (a.FirstHalfApplied != 'null' || a.SecondHalfApplied != 'null') && (a.FirstHalfApplied != 'EMPTY' && a.SecondHalfApplied != 'EMPTY'));
        if (isExistsLength.length > 0) {
          invalidEmployees.push(attdObject.EmployeeCode);
          isAppliedLeaveExists = true;
          break;
        }
      }
    }

    if (isAppliedLeaveExists) {
      this.alertService.showWarning(`One or more leave requests which have not been approved. Please approve and attempt again. Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      return;
    }

    // let io = []; 
    // io =  this.attendance_actualData;
    // io.forEach(element => {
    //   // element.forEach(el => {
    //     element.Attendance = element.Attendance.filter(a=> a.FirstHalfApplied != 'EMPTY' && a.SecondHalfApplied != 'EMPTY');

    //   // });

    // });

    // console.log('io', io);

    this.alertService.confirmSwal1("Are you sure you want to Submit", "WARNING:  Once submitted, you cannot edit the input data again. ", "Yes, Confirm", "No, Cancel").then((result) => {
      this.loadingScreenService.startLoading();

      let employeeIds: number[] = [];

      for (let employeeDetails of this.attendance_actualData) {
        employeeIds.push(employeeDetails.EmployeeId);
      }

      let submitRegularizedAttendanceUIModel = new SubmitRegularizedAttendanceUIModel();
      submitRegularizedAttendanceUIModel.EmployeeIds = employeeIds;
      submitRegularizedAttendanceUIModel.AttendancePeriodId = this.openAttendancePeriodId;
      submitRegularizedAttendanceUIModel.ModuleProcessAction = 30;
      submitRegularizedAttendanceUIModel.TeamId = this._TeamId;
      submitRegularizedAttendanceUIModel.Role = {
        IsCompanyHierarchy: false,
        RoleId: this.RoleId
      }

      console.log("Submit Ui model ::", submitRegularizedAttendanceUIModel);
      this.attendanceService.SubmitRegularizedAttendance(submitRegularizedAttendanceUIModel).subscribe((result) => {
        this.loadingScreenService.stopLoading();

        if (result != undefined && result != null && result.Status) {
          if (result.Status) {
            this.alertService.showSuccess("Submit Successfull");
            try {
              this.loadingScreenService.startLoading();
              this.callSendEmialForRegularizedLog(submitRegularizedAttendanceUIModel.EmployeeIds)

            } catch (error) {
              // this.getmissingday(this.attendance_actualData);
              this.loadingScreenService.startLoading();

            }
            this.onRefresh();
          }
          else {
            this.alertService.showWarning(result.Message);
            console.log(result);
          }

        }
        else {
          this.alertService.showWarning(result.Message);
        }

      }, err => {
        this.loadingScreenService.stopLoading();
      })

    }).catch(error => {

    });






  }


  callSendEmialForRegularizedLog(EmployeeIds) {

    var regularizeAttendanceEmployeeUIModel = new RegularizeAttendanceEmployeeUIModel();
    regularizeAttendanceEmployeeUIModel.EmployeeIds = EmployeeIds;
    regularizeAttendanceEmployeeUIModel.FromDate = this._payrollInputSubmission.AttendanceStartDate;
    regularizeAttendanceEmployeeUIModel.ToDate = this._payrollInputSubmission.AttendanceEndDate;
    regularizeAttendanceEmployeeUIModel.TeamId = this._payrollInputSubmission.TeamId;
    regularizeAttendanceEmployeeUIModel.ManagerId = this.UserId;
    this.attendanceService.SendMailForRegularizeAttendanceEmployees(regularizeAttendanceEmployeeUIModel).subscribe((result) => {
      this.loadingScreenService.stopLoading();
      console.log('result', result);

      if (result != undefined && result != null && result.Status) {
        if (result.Status) {

        }
        else {

          console.log(result);
        }
      }
      else {
        this.alertService.showWarning(result.Message);
      }

    }, err => {
      this.loadingScreenService.stopLoading();
    })

  }



  // NEW IMPLEMENTATION OF ATTENDANCE SLIDER

  reUpdateAttendanceRegularizeData() {
    this.attendanceService.GetRegularizationAttendanceData(this._ManagerId, this.RoleId, this._TeamId)
      .subscribe((result) => {
        try {
          let apiresult: apiResult = result;
          if (apiresult.Status && apiresult.Result != null) {
            this.regularizationData = JSON.parse(apiresult.Result);
            // this.attendance_header = [];
            // this.attendance_header.length = 0;
            // this.attendance_header = this.regularizationData.EmployeeDetails[0].Attendance == null ? this.regularizationData.EmployeeDetails[1].Attendance : this.regularizationData.EmployeeDetails[0].Attendance;
            this.attendance_actualData = [];
            this.attendance_actualData.length = 0;
            this.attendance_actualData = this.regularizationData.EmployeeDetails;
            console.log('TABLE DATA ::', this.attendance_actualData);
            console.log('TABLE HEADER DATA ::', this.attendance_header);
            this.getmissingday(this.attendance_actualData);
            this.attendance_actualData.forEach(element => {
              element['LocationName'] = element.WorkLocation != null && element.WorkLocation.length > 0 ? element.WorkLocation[0].LocationName : null;
              element['isSelected'] = false;
              // element['IsSubmitted'] = 
              // element['IsApproved'] = 
              // element['PayableDays'] = 
            });


          } else {

          }

        } catch (error) {

        }
      }, err => {
        console.error('ERROR ::', err);

      })
  }

  private GetRegularizationAttendanceData() {
    const promise = new Promise((res, rej) => {
      this.refreshing_table_spinner = true;
      this.attendanceService.GetRegularizationAttendanceData(this._ManagerId, this.RoleId, this._TeamId)
        .subscribe((result) => {
          try {
            let apiresult: apiResult = result;

            if (apiresult.Status && apiresult.Result != null) {

              let LocalregularizationData = JSON.parse(apiresult.Result);
              this.PresentAttendancePeriodId = LocalregularizationData.AttendancePeriods.find(x => x.IsOpenPeriod == true).Id;
              this.mapAttendacePeriodData(apiresult.Result);

              res(true);
            } else {
              res(null);
              this.alertService.showWarning(apiresult.Message);
            }

          } catch (error) {

          }
        }, err => {
          console.error('ERROR ::', err);

        })
    });
    return promise;
  }


  mapAttendacePeriodData(Result) {
    this.IsEmptyEmployeeList = false;
    this.regularizationData = JSON.parse(Result);
    console.log('REGULARIZATION DATA ::', this.regularizationData);

    if (this.regularizationData.EmployeeDetails == null) {
      this.IsEmptyEmployeeList = true;
      this.refreshing_table_spinner = false;
      this.toShown = true;
      this.spinner = false;
      this.alertService.confirmSwal1("Are you sure?", "Information:  The selected attendance period there are no records this time! Click the 'Confirm' button to load the On-going Attendance Period data.", "Yes, Confirm", "No, Close").then((result) => {
        this.GetRegularizationAttendanceData();
      }).catch(error => {
        this.onClose();
        return;
      });
      // this.alertService.showInfo("");
      // this.onClose();
      return;
    }

    this._payrollInputSubmission = this.regularizationData.PayrollInputsSubmission;
    this._attendancePeriods = this.regularizationData.AttendancePeriods;
    this._clientId = this.regularizationData.TeamList.ClientId
    this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId));

    if (!this._permissionConfigClientBased) {
      this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == 0));
    }
    console.log("this._permissionConfigClientBased", this._permissionConfigClientBased)

    var records = this._attendancePeriods.find(a => a.Id == this._payrollInputSubmission.AttendancePeriodId);
    this.IsOpenAttendancePeriod = records != undefined && records != null ? records.IsOpenPeriod : false;
    this.openAttendancePeriodId = this.regularizationData.AttendancePeriods.find(x => x.IsOpenPeriod == true).Id;
    if (this.openAttendancePeriodId == this.PresentAttendancePeriodId) {
      this.IsOpenAttendancePeriod = true;
    } else {
      this.IsOpenAttendancePeriod = false;
    }

    this._IsPayrollSubmitted = this._payrollInputSubmission.IsPayrollSubmitted;

    // if (this.RoleCode == this.HRRoleCode) {
    if ((environment.environment.HRRoleCode.includes(this.RoleCode) == true)) {
      this._IsPayrollSubmitted = this._payrollInputSubmission.IsMigrated;
    }
    var startDate = new Date(records.StartDate);
    var endDate = new Date(records.EndDate);

    this.enumerateDaysBetweenDates1(startDate, endDate)
    this.do_click_AttendancePeriod(this._attendancePeriods.find(a => a.Id == this._payrollInputSubmission.AttendancePeriodId))

    // this.attendance_header = [];
    // this.attendance_header.length = 0;
    // this.attendance_header = this.regularizationData.EmployeeDetails[0].Attendance == null ? this.regularizationData.EmployeeDetails[1].Attendance : this.regularizationData.EmployeeDetails[0].Attendance;
    this.attendance_actualData = [];
    this.attendance_actualData.length = 0;
    this.attendance_actualData = this.regularizationData.EmployeeDetails;
    console.log('TABLE DATA ::', this.attendance_actualData);
    console.log('TABLE HEADER DATA ::', this.attendance_header);
    this.getmissingday(this.attendance_actualData);
    this.attendance_actualData.forEach(element => {
      element['LocationName'] = element.WorkLocation != null && element.WorkLocation.length > 0 ? element.WorkLocation[0].LocationName : null;
      element['isSelected'] = false;
      // element['IsSubmitted'] = 
      // element['IsApproved'] = 
      // element['PayableDays'] = 
    });




    this.toShown = true;
    this.spinner = false;
    this.refreshing_table_spinner = false;
  }

  getmissingday(emparray) {
    emparray.forEach(e => {
      if (e.Attendance != null) {
        var tempitems = [];
        this.attendance_header.forEach(el => {

          var test = e.Attendance.find(a => moment(a.AttendanceDate).format('YYYY-MM-DD') == moment(el.date).format('YYYY-MM-DD'));
          if (test == undefined) {
            var obj = {
              AttendanceDate: moment(el.date).format(),
              FirstHalf: "EMPTY",
              FirstHalfApplied: "EMPTY",
              IsWeekOff: false,
              SecondHalf: "EMPTY",
              SecondHalfApplied: "EMPTY",
              Status: 50,
              isHoliday: false,
              IsHoliday: 0
            }
            tempitems.push(obj);
          }

        });

        e.Attendance = e.Attendance.concat(tempitems);

        e.Attendance = _.orderBy(_.filter(e.Attendance), ["AttendanceDate"], ["asc"]);

      }

    });
    console.log('emparray', emparray);
  }


  change(obj, indx, event) {

    console.log('obj', obj);
    console.log('indx', indx);
    console.log('event', event);
    this.selectedEmployeeAttendanceObject = [];
    this.selectedEmplolyeesForMarkLWD = [];
    this.doSelectEmployeeForLWD(obj);
    this.loadingScreenService.startLoading();
    this.IsRegularizeBtnRequired = false;
    this.GetAttendanceConfiguration(obj).then((result) => {
      var apiresult = result as apiResult;
      if (apiresult.Status && apiresult.Result != null) {

        var tempResult = (apiresult.Result) as any
        // this.IsRegularizeBtnRequired = tempResult.IsPresentByDefault == true ? false : true;
        this.IsRegularizeBtnRequired = tempResult.IsDailyPunchRequired == true ? true : false;
        let updateItem = this.attendance_actualData.find(i => i.Id == obj.Id);
        let index = this.selectedEmployeeAttendanceObject.indexOf(updateItem);

        if (index > -1) {
          this.selectedEmployeeAttendanceObject.splice(index, 1);
          this.attendance_actualData.forEach(element => {
            if (element.Id != obj.Id) {
              element.isSelected = false;
            }
          });
        }
        else {
          this.selectedEmployeeAttendanceObject.push(obj);
          this.attendance_actualData.forEach(element => {
            if (element.Id != obj.Id) {
              element.isSelected = false;
            }
          });
        }
        if (event.target.checked) {

        } else {
          this.IsRegularizeBtnRequired = false;
        }
        this.loadingScreenService.stopLoading();
        console.log('chosenEmployeeObject', this.selectedEmployeeAttendanceObject);
      } else {
        this.attendance_actualData.forEach(element => {
          if (element.Id != obj.Id) {
            element.isSelected = false;
          }
        });
        this.loadingScreenService.stopLoading();
      }
    })



    // this.attendance_actualData.forEach(element => {
    //   if (obj.Id != element.Id) {
    //     element.isSelected = false
    //   }
    // });
    // let chosenEmployeeObject = null;
    // if (event.target.checked) {
    //   chosenEmployeeObject = obj;
    //   this.selectedEmployeeAttendanceObject.push(obj)
    // }
    // 
    // chosenEmployeeObject = null ? this.openDrawer(chosenEmployeeObject) : true;
  }
  doSelectEmployeeForLWD = (item): void => {
    let object = this.selectedEmplolyeesForMarkLWD.find(i => i.Id == item.Id);
    let index = this.selectedEmplolyeesForMarkLWD.indexOf(object);
    if (index > -1) {
      this.selectedEmplolyeesForMarkLWD.splice(index, 1);
    }
    else {
      this.selectedEmplolyeesForMarkLWD.push(item);
    }

    console.log('this.selectedEmplolyeesForMarkLWD', this.selectedEmplolyeesForMarkLWD);

  }
  do_MarkLWD = (item): void => {

    if (this.selectedEmplolyeesForMarkLWD.length == 0) {
      this.alertService.showWarning("Oh ho! As per the Mark LWD requirement, You must make a selection(s) from the list.")
      return;
    }
    if (this.selectedEmplolyeesForMarkLWD.length > 1) {
      this.alertService.showWarning("Please select only one employee at a time of process.");
      return;
    }

    if (this._IsPayrollSubmitted) {
      this.alertService.showWarning("Please note : The payroll attendance is already submitted.");
      return;
    }

    this.markfnf_minDate = new Date();

    this.markFnf_LastWorkingDate = null;
    this.markfnf_Reason = null;

    $('#popup_contractSeparation').modal('show');

  }

  confirmMarkFnF() {

    if (this.markFnf_LastWorkingDate == null || this.markFnf_LastWorkingDate == '' || this.markFnf_LastWorkingDate == undefined) {
      this.alertService.showWarning("Please enter last working date")
      return;
    }
    else if (this.markfnf_Reason == null || this.markfnf_Reason == '' || this.markfnf_Reason == undefined) {
      this.alertService.showWarning("Reason is required!. You need to write something!")
      return;
    } else {

      this.loadingScreenService.startLoading();
      var lstEmpContract = []
      this.selectedEmplolyeesForMarkLWD.forEach(event => {
        lstEmpContract.push({
          EmploymentContractId: event.EmploymentContractId,
          LWD: moment(new Date(this.markFnf_LastWorkingDate)).format('YYYY-MM-DD'),
          Reason: this.markfnf_Reason
        })

      });
      console.log('lstEmpContract', lstEmpContract);

      this.employeeService.MarkEmploymentContractsLWD(JSON.stringify(lstEmpContract))
        .subscribe((result) => {
          let apiResult: apiResult = result;
          $('#popup_contractSeparation').modal('hide');
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            this.selectedEmplolyeesForMarkLWD = [];
            lstEmpContract = [];
            this.loadingScreenService.stopLoading();
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

  async GetAttendanceConfiguration(obj) {

    const promise = new Promise((res, rej) => {

      this.attendanceService.GetAttendanceConfigurationByEmployeeCode(obj.EmployeeCode)
        .subscribe((response) => {
          res(response);
        })


    })

    return promise;

  }
  onClickSubmitPermission() {

  }

  regularizeAttendance() {

    if (this._IsPayrollSubmitted) {
      this.alertService.showWarning("Please note : The payroll attendance is already submitted.");
      return;
    }

    this.openDrawer(this.selectedEmployeeAttendanceObject)
  }

  openDrawer(chosenEmployeeObject) {
    const drawerRef = this.drawerService.create<EmployeebulkattendanceModalComponent, { chosenEmployeeObject: any, AttendancePeriodId: any, RoleId: any, _payrollInputsSubmission: any, IsSubmitted: any, }, string>({
      nzTitle: 'Regularize : Employee Punch In/Out Review',
      nzContent: EmployeebulkattendanceModalComponent,
      nzWidth: 940,
      nzClosable: false,
      nzMaskClosable: false,
      nzContentParams: {

        chosenEmployeeObject: (chosenEmployeeObject[0]),
        AttendancePeriodId: this._payrollInputSubmission.AttendancePeriodId,
        RoleId: this.RoleId,
        _payrollInputsSubmission: this._payrollInputSubmission,
        IsSubmitted: 0
      }
    });

    drawerRef.afterOpen.subscribe(() => {
    });

    drawerRef.afterClose.subscribe(data => {

      var modalResult = (data) as any;
      console.log('data', data);
      this.GetRegularizationAttendanceData();
      if (data != undefined) {

      }

    });
  }


  close_regularize_attendance_slider() {
    this.regularize_attendance_slider = false;
  }
  close_regularize_attendance_review_slider() {
    this.regularize_attendance_review_slider = false;
  }
  handle_employeeAttendanceBreakupDetails() {
    this.LstEmployeeLeaveRequest = [];
    console.log("this.EADetails", this.EADetails)
    this.EADetails.length > 0 && this.EADetails.forEach(ele => {

      let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(ele.AttendanceDate).format('YYYY-MM-DD'));
      if (renovate != undefined && renovate != null) {
        renovate.meta.TotalSubmittedHours = Number(ele.TotalSubmittedHours).toFixed(2);
        renovate.meta.TotalApprovedHours = ele.TotalApprovedHours;
        // ! : 16.2 for panasonic
        renovate.color = colors.empty;
        renovate.meta.isEADAvailable = true;
        renovate.meta['permissions'] = ele.Permissions;
        renovate.meta.WFHStatus = ele.WFHStatus;
        renovate.meta.ODStatus = ele.ODStatus;

        // FirstHalfLeave = 200,
        // SecondHalfLeave = 300,
        // FullDayLeave = 400
        // ! : 16.2 for panasonic
        renovate.meta.IsAutoPunchedOut = ele.hasOwnProperty('IsAutoPunchedOut') == true ? ele.IsAutoPunchedOut : false;
        renovate.meta.IsPresentMarkedByEmployee = ele.hasOwnProperty('IsPresentMarkedByEmployee') == true ? ele.IsPresentMarkedByEmployee : false;
        // ! : 16.2 for panasonic
        if (ele.IsWeekOff == true) {
          renovate.meta.IsWeekOff = true;
          renovate.color = colors.gray;
          return;
        }
        // ! : 16.2 for panasonic
        if (ele.AttendanceBreakUpDetailsType == 100) {
          renovate.color = colors.green;
        }


        if (ele.AttendanceBreakUpDetailsType == 200) {

          renovate.meta.isLeaveRequested = true;
          renovate.meta.LeaveattendanceType = this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId) != undefined ? this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId).DisplayName : 'LOP';
          renovate.color = colors.red;
          renovate.meta.IsFirstHalf = true;
          renovate.meta.AttendanceType = this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId) != undefined ? this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId).DisplayName : 'LOP';
        }
        if (ele.AttendanceBreakUpDetailsType == 300) {
          renovate.meta.isLeaveRequested = true;
          renovate.meta.LeaveattendanceType = this._entitlementList.find(z => z.EntitlementId == ele.SecondHalfEntitlementId) != undefined ? this._entitlementList.find(z => z.EntitlementId == ele.SecondHalfEntitlementId).DisplayName : 'LOP';
          renovate.color = colors.red;
          renovate.meta.IsSecondHalf = true;
          renovate.meta.AttendanceType_SecondHalf = this._entitlementList.find(z => z.EntitlementId == ele.SecondHalfEntitlementId) != undefined ? this._entitlementList.find(z => z.EntitlementId == ele.SecondHalfEntitlementId).DisplayName : 'LOP';

        }
        if (ele.AttendanceBreakUpDetailsType == 400) {
          renovate.meta.isLeaveRequested = true;
          renovate.meta.IsMultipleEntitlement = ele.FirstHalfEntitlementId != 0 && ele.FirstHalfEntitlementId != null && ele.SecondHalfEntitlementId != 0 && ele.SecondHalfEntitlementId != null && ele.FirstHalfEntitlementId != ele.SecondHalfEntitlementId ? true : false;
          renovate.meta.LeaveattendanceType = this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId) != undefined ?
            this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId).DisplayName : 'LOP';
          renovate.color = colors.red;
          renovate.meta.IsFirstHalf = true;
          renovate.meta.IsSecondHalf = true;
          renovate.meta.AttendanceType = this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId) != undefined ? this._entitlementList.find(z => z.EntitlementId == ele.FirstHalfEntitlementId).DisplayName : 'LOP';
          renovate.meta.AttendanceType_SecondHalf = this._entitlementList.find(z => z.EntitlementId == ele.SecondHalfEntitlementId) != undefined ? this._entitlementList.find(z => z.EntitlementId == ele.SecondHalfEntitlementId).DisplayName : 'LOP';

        }
      }
    });



    this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {
      w['startDate'] = w.AppliedFrom;
      w['endDate'] = w.AppliedTill;
    });
    console.log(' this.LstEntitlementAvailmentRequest', this.LstEntitlementAvailmentRequest);

    this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {

      if ((w.Status == 400 || w.Status == 100)) {
        // if (w.Status == 100)  {   && !w.IsRegularized
        while (moment(w.startDate).format('YYYY-MM-DD') <= moment(w.endDate).format('YYYY-MM-DD')) {
          if (moment(w.startDate).format('YYYY-MM-DD') >= moment(this.minDate).format('YYYY-MM-DD') ||
            moment(w.startDate).format('YYYY-MM-DD') <= moment(this.maxDate).format('YYYY-MM-DD')) {

            // this.LstEmployeeLeaveRequest.push({
            //   LeaveDate: w.startDate,
            //   EntitlementId: w.EntitlementId,
            //   AppliedUnits: w.AppliedUnits,
            //   Status: w.Status,
            //   ApprovedUnits: w.ApprovedUnits,
            //   EntitlmentName: 'SL',  // this.LstEntitlement.find(a => a.Id == w.EntitlementId).Description,
            //   StatusName: this.LstLeaveStatus.find(a => a.id == w.Status).name,
            //   Id: w.Id

            // });
            let renovate = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(w.startDate).format('YYYY-MM-DD'));
            console.log('reno', renovate);
            // ! : 16.2 for panasonic
            if (renovate != undefined && renovate != null) {
              // if(renovate.meta.isLeaveRequested == false) {
              renovate.meta.isLeaveRequested = true;
              renovate.meta.LeaveattendanceType = this._entitlementList.find(z => z.EntitlementId == w.EntitlementId).DisplayName;
              renovate.color = w.Status == 100 ? colors.yellow : colors.red;
              // }   
              // renovate.meta.isLeaveRequested = true,
              // renovate.meta.LeaveattendanceType = this._entitlementList.find(z => z.EntitlementId == w.EntitlementId).DisplayName,
              // renovate.color = w.Status == 100 ? colors.yellow : colors.red;
              renovate.meta.leaveObject = w;
              renovate.meta.WFHStatus = w.WFHStatus;
              renovate.meta.ODStatus = w.ODStatus;

              // renovate.meta.IsFirstDayHalf = (w.IsAppliedForFirstHalf || w.IsAppliedTillFirstHalf) ? true : false;
              // renovate.meta.IsSecondHalf = (w.IsAppliedFromSecondHalf || w.IsAppliedTillSecondHalf) ? true : false;
              // renovate.meta.IsFirstHalf = (w.IsAppliedForFirstHalf || w.IsAppliedTillFirstHalf) ? true : false;

              // this.LstAttendanceType.find(z => z.id == calendarObject.meta.breakupObject.AttendanceType).name;
            }

          }
          w.startDate = moment(w.startDate).add(1, 'days').format('YYYY-MM-DD');
        }
      }
    });

    console.log('event', this.events);

  }
  getnoOfHours(calendarObject) {

    if (calendarObject.meta.breakupObject != null) {
      var startTime = moment(calendarObject.meta.breakupObject.FirstCheckIn, 'HH:mm');
      var endTime = moment(calendarObject.meta.breakupObject.LastCheckedOut, 'HH:mm');
      var totalHrs = endTime.diff(startTime, 'hour');
      var totalMinutes = endTime.diff(startTime, 'minutes');
      totalHrs = Number(this.parseHours(totalMinutes));
      return Number.isNaN(totalHrs) == true ? null : `${totalHrs} Hrs`;

    } else {
      return null;
    }
  }



  onChangeApprovedHours(event, item, index) {
    console.log(event.target.value);
    var hours = Math.floor(event.target.value / 60);
    var minutes = event.target.value % 60;
    console.log('hr', hours);
    console.log('minutes', minutes);

    // moment(). add(11, 'minutes'). ...
  }
  public parseHours = (n) => Math.round((n / 60) * 100) / 100;

  OnChangePunchInTime(event, item, i) {
    item.Iserror = false,
      this.isInvalidTablePunchInOutTime = false;
    let formattedDate = moment(event.AttendanceDate).format('YYYY-MM-DD');
    var actualStartTime = moment(formattedDate + ' ' + event.target.value);
    var actualEndTime = item.EndTime != null ? moment(formattedDate + ' ' + item.EndTime) : null;

    let eaDetailsObj = this.EADetails.find(a => moment(a.AttendanceDate).format('YYYY-MM-DD') ==  moment(item.AttendanceDate).format('YYYY-MM-DD'));
    console.log('eaDetailsObj', eaDetailsObj);
    this.isShiftSpanAcrossDays = eaDetailsObj && eaDetailsObj.IsIsShiftSpanAcrossDays ?  eaDetailsObj.IsIsShiftSpanAcrossDays : false;
    
     /**
     * This code block checks if a shift spans across multiple days, such as night shifts 
     * that start in one day and end in the next.
     * If the shift does span across multiple days, this code adds the next day to the end time,
     *  which leads to improved calculation accuracy.
    */
    if (this.isShiftSpanAcrossDays && (actualEndTime && actualEndTime.isBefore(actualStartTime))) {
      actualEndTime = actualEndTime.add(1, 'd');
    }
    var fromhrs = moment(actualStartTime, 'HH:mm:ss');
    var tillhrs = moment(actualEndTime, 'HH:mm:ss');
    var totalHrs = tillhrs.diff(fromhrs, 'hour');
    var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
    totalHrs = Number(this.parseHours(totalMinutes));
    if (Number.isNaN(totalHrs)) {
      totalHrs = 0
    }
    if (fromhrs > tillhrs) {
      item.Iserror = true,
        this.isInvalidTablePunchInOutTime = true;
    }
    if (Math.sign(totalHrs) == -1) {
      item.Iserror = true,
        this.isInvalidTablePunchInOutTime = true;
    }
    item.ApprovedTotalHours = totalHrs;

    if (this.LstPunchInDetails.length > 1) {
      if (i == 0) {
        for (let k = 0; k < this.LstPunchInDetails.length; k++) {
          const element = this.LstPunchInDetails[k];

          if (element.Id == item.Id) {
            if (item.Starttime <= item.FinishTime) {
              console.log('ue s2s');
              item.Iserror = true
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          } else {
            if (item.Starttime >= element.FinishTime || item.Starttime >= element.Starttime) {
              console.log('ue ss22');
              item.Iserror = true
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          }

        }
      } else {

        for (let j = 0; j < this.LstPunchInDetails.length; j++) {
          const element = this.LstPunchInDetails[j];
          if (element.ChildTableRow == 2 && j < i) {
            if (item.StartTime <= element.StarTime || item.StartTime <= element.EndTime) {
              item.Iserror = true;
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          }

        }
      }

    }
  }
  OnChangePunchOutTime(event, item, i) {
    item.Iserror = false,
      this.isInvalidTablePunchInOutTime = false;
    let formattedDate = moment(event.AttendanceDate).format('YYYY-MM-DD');
    var actualStartTime = item.StartTime != null ? moment(formattedDate + ' ' + item.StartTime) : null;
    var actualEndTime = moment(formattedDate + ' ' + event.target.value);
    /**
     * This code block checks if a shift spans across multiple days, such as night shifts 
     * that start in one day and end in the next.
     * If the shift does span across multiple days, this code adds the next day to the end time,
     *  which leads to improved calculation accuracy.
    */
    if (actualEndTime.isBefore(actualStartTime) && this.isShiftSpanAcrossDays) {
      actualEndTime.add(1, 'd');
    }
    console.log('actualEndTime', actualEndTime);
    console.log('actualStartTime', actualStartTime);

    var fromhrs = moment(actualStartTime, 'HH:mm:ss');
    var tillhrs = moment(actualEndTime, 'HH:mm:ss');
    var totalHrs = tillhrs.diff(fromhrs, 'hour');
    var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
    totalHrs = Number(this.parseHours(totalMinutes));
    if (Number.isNaN(totalHrs)) {
      totalHrs = 0
    }
    console.log('totalHrs', totalHrs);
    if (fromhrs > tillhrs) {
      item.Iserror = true,
        this.isInvalidTablePunchInOutTime = true;
    }
    if (Math.sign(totalHrs) == -1) {
      item.Iserror = true,
        this.isInvalidTablePunchInOutTime = true;
    }
    item.ApprovedTotalHours = totalHrs;

    if (this.LstPunchInDetails.length > 1) {
      if (i == 0) {
        for (let k = 0; k < this.LstPunchInDetails.length; k++) {
          const element = this.LstPunchInDetails[k];

          if (element.Id == item.Id) {

            if (item.FinishTime <= item.Starttime) {
              console.log('ue ss');
              item.Iserror = true
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          } else {
            if (item.FinishTime >= element.Starttime || item.FinishTime >= element.FinishTime) {
              console.log('ue ss 2');
              item.Iserror = true
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          }

        }
      } else {

        for (let j = 0; j < this.LstPunchInDetails.length; j++) {
          const element = this.LstPunchInDetails[j];
          if (element.ChildTableRow == 2 && j < i) {
            if (item.StartTime <= element.StarTime || item.StartTime <= element.EndTime) {
              item.Iserror = true;
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          }

        }
      }

    }

  }

  onClickApproveRejectAction(item, whichAction) {

  }

  convertH2M(timeInHour) {
    console.log('timeInHour', timeInHour);

    if (timeInHour != null && timeInHour != 0) {
      // timeInHour = Number(timeInHour).toFixed(2);
      var timeParts = String(timeInHour).split(".");

      if (timeParts[1].length == 1) {
        // Too many numbers after decimal.
        timeParts[1] = `0${timeParts[1]}`;
      }
      return (Number(timeInHour) * 60);

      // return Number(timeParts[0]) * 60 + Number(timeParts[1]);
    } else {
      return 0;
    }

  }


  savePunchInOutDetails() {

    if (this.ApproverRemarks == null || this.ApproverRemarks == undefined || this.ApproverRemarks == '') {
      this.alertService.showWarning('Please enter a comments');
      return;
    }

    if (this.isInvalidTablePunchInOutTime == true) {
      this.alertService.showWarning('Please specified punch in/out time is invalid or the time is out of valid range');
      return;
    }

    this.loadingScreenService.startLoading();

    this.LstPunchInDetails.forEach(element => {

      this.EADetails != null && this.EADetails.length > 0 && this.EADetails.forEach(item => {
        item.LstEmployeeAttendancePunchInDetails != null && item.LstEmployeeAttendancePunchInDetails.length > 0 && item.LstEmployeeAttendancePunchInDetails.forEach(subitem => {
          if (subitem.Id == element.Id) {

            if (element.ApprovedTotalHours != 0) {
              element.ApprovedTotalHours = Number(element.ApprovedTotalHours);
              if ((element.ApprovedTotalHours - Math.floor(element.ApprovedTotalHours)) !== 0) {

              }
              else {
                element.ApprovedTotalHours = element.ApprovedTotalHours.toFixed(2) as any;
              }


              var timeParts = String(element.ApprovedTotalHours).split(".");
              if (timeParts[1].length == 1) {

                // Too many numbers after decimal.
                timeParts[1] = '0' + timeParts[1];
              }
              var converted = (timeParts[0]) + '.' + (timeParts[1]);

              element.ApprovedTotalHours = Number(converted);
            }



            subitem.ApproverRemarks = this.ApproverRemarks;
            subitem.ApprovedHours = (element.ApprovedTotalHours);
            subitem.Starttime = (element.StartTime);
            subitem.FinishTime = (element.EndTime);
          }
        });
      });

    });

    // this.LstPunchInDetails.forEach(element => {


    var TotalTimes: number = 0;
    var TotalMinutes: number = 0;

    if (this.LstPunchInDetails.find(z => z.ChildTableRow == 2) != undefined) {
      this.LstPunchInDetails.forEach(em => {
        if (em.ChildTableRow == 2) {
          em.ApprovedTotalHours = Number(em.ApprovedTotalHours);
          if ((em.ApprovedTotalHours - Math.floor(em.ApprovedTotalHours)) !== 0) {
            TotalMinutes += this.convertH2M(em.ApprovedTotalHours);

          }
          else {
            TotalMinutes += this.convertH2M(em.ApprovedTotalHours.toFixed(2)) as any;
          }


        }
      });

    }
    else if ((this.LstPunchInDetails.find(z => z.ChildTableRow == 2) == undefined && this.LstPunchInDetails.find(z => z.ChildTableRow == 1) != undefined)) {
      this.LstPunchInDetails.forEach(em => {
        if (em.ChildTableRow == 1) {
          em.ApprovedTotalHours = Number(em.ApprovedTotalHours);

          if ((em.ApprovedTotalHours - Math.floor(em.ApprovedTotalHours)) !== 0) {
            TotalMinutes += this.convertH2M(em.ApprovedTotalHours);

          }
          else {
            TotalMinutes += this.convertH2M(em.ApprovedTotalHours.toFixed(2)) as any;

          }

        }
      });

      // TotalMinutes += this.convertH2M(element.TotalHours);

    }

    TotalTimes += Number(this.parseHours(TotalMinutes));
    // TotalTimes += TotalTimes;
    if (Number.isNaN(TotalTimes)) {
      TotalTimes = 0
    }
    var numberofrecords = [];
    if (this.LstPunchInDetails.find(z => z.ChildTableRow == 2) != undefined) {
      numberofrecords = this.LstPunchInDetails.filter(a => a.ChildTableRow == 2);

    } else {
      numberofrecords = this.LstPunchInDetails.filter(a => a.ChildTableRow == 1);
    }

    let lastIndex1 = numberofrecords.length - 1;
    let atlastitem = lastIndex1 == 0 ? 0 : (lastIndex1 - 1);
    let _st1 = numberofrecords[0].StartTime;
    let _et1 = numberofrecords[lastIndex1].EndTime != null ? numberofrecords[lastIndex1].EndTime : numberofrecords[atlastitem].EndTime;

    if (TotalTimes != 0) {

      if ((TotalTimes - Math.floor(TotalTimes) !== 0)) {

      }
      else {
        TotalTimes = TotalTimes.toFixed(2) as any;

      }


      var timeParts = String(TotalTimes).split(".");
      if (timeParts[1].length == 1) {
        // Too many numbers after decimal.
        timeParts[1] = '0' + timeParts[1];
      }
      var converted = (timeParts[0]) + '.' + (timeParts[1]);

      TotalTimes = Number(converted);
    }

    var mainId = this.LstPunchInDetails.find(s => s.ChildTableRow == 1).Id;

    let isExists = this.EADetails.find(a => a.Id == mainId);



    isExists != null && isExists != undefined ? isExists.ApproverRemarks = this.ApproverRemarks : true;
    // isExists != null && isExists != undefined ? isExists.TotalApprovedHours += TotalTimes : true;;
    isExists.TotalApprovedHours = Number(TotalTimes);
    isExists != null && isExists != undefined ? isExists.FirstCheckIn = (_st1) : true;
    isExists != null && isExists != undefined ? isExists.LastCheckedOut = (_et1) : true;
    isExists != null && isExists != undefined ? isExists.PayableDay = (isExists.TotalApprovedHours >= 9 ? 1 : (isExists.TotalApprovedHours <= 9 && isExists.TotalApprovedHours >= 4.5) ? 0.5 : 0) : true;
    isExists != null && isExists != undefined ? isExists.IsFullDayPresent = (isExists.TotalApprovedHours >= 9 ? true : false) : true;
    isExists != null && isExists != undefined ? isExists.Status = AttendanceBreakUpDetailsStatus.ManagerSubmitted : true;

    // });


    console.log('LS', this.LstPunchInDetails);
    console.log('LS EA', this.EADetails);

    this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails = this.EADetails;

    this.attendanceService.UpsertEmployeeAttendanceDetails(this.employeeAttendanceDetails)
      .subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.regularize_attendance_review_slider = false;
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiresult.Message);
          // this.triggerfinalSubmit(this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails);
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiresult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something bad has happened : ${error}`);
      })




  }

  submitEABreakup() {

    this.loadingScreenService.startLoading();

    var lstEmpAttendanceBreakupList = [];
    if (this.EADetails != null && this.EADetails.length > 0) {
      this.EADetails.forEach(element => {
        if (element.Status == AttendanceBreakUpDetailsStatus.EmployeeSaved) {
          element.Status = AttendanceBreakUpDetailsStatus.ManagerSubmitted
          lstEmpAttendanceBreakupList.push(element)
        }
      });
    }

    this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails = this.EADetails;
    this.attendanceService.UpsertEmployeeAttendanceDetails(this.employeeAttendanceDetails)
      .subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.loadingScreenService.stopLoading();
          // this.alertService.showSuccess(apiresult.Message);
          this.triggerfinalSubmit(this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails);
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiresult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something bad has happened : ${error}`);
      })


  }
  triggerfinalSubmit(lstEmpAttendanceBreakupList) {

    this.loadingScreenService.startLoading();
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
          this.alertService.showSuccess(apiresult.Message);
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



  onClickMarkAsAbsent() {

    let jsobj = this.dayClicked_event as any;

    const modalRef = this.modalService.open(EmployeeleaverequestModalComponent, this.modalOption);
    modalRef.componentInstance.EmployeeObject = { Id: this.employeeAttendance.EmployeeId, Code: this.employeeAttendance.EmployeeCode };
    modalRef.componentInstance.JObject = JSON.stringify({
      preferredDate: new Date(jsobj.start),
      isEmployee: false,
      StartDate: (jsobj.start),
      EndDate: (jsobj.end)

    });
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
      } else {
        this.getLeaveandOtherDetailsofEmployee(this.employeeAttendance, this._payrollInputSubmission);
        this.reUpdateAttendanceRegularizeData();
        this.regularize_attendance_review_slider = false;
      }
    }).catch((error) => {
      console.log(error);
    });
  }


  onClickMarkAsPresent(event, attendanceObject) {
    console.log('Day Object ::', event);

    event  = this.events.find(item => moment(item.start).format('YYYY-MM-DD') ==  moment(event.start).format('YYYY-MM-DD'));
    console.log('Day Object ::', event);

    var dateof = new Date(event.start);
    event.start = moment(event.start).format('YYYY-MM-DD');
    event.end = moment(event.end).format('YYYY-MM-DD');


    // if (event.meta.leaveObject != null) {
    const modalRef = this.modalService.open(RegularizeleaverequestModalComponent, this.modalOption);
    modalRef.componentInstance.EmployeeObject = { Id: this.employeeAttendance.EmployeeId, EmployeeCode: this.employeeAttendance.EmployeeCode };
    modalRef.componentInstance.JObject = JSON.stringify({
      preferredDate: moment(dateof).format('YYYY-MM-DD'),
      isEmployee: false,
      StartDate: moment(event.start).format('YYYY-MM-DD'),
      EndDate: moment(event.end).format('YYYY-MM-DD'),
      LeaveRequestId: event.meta.leaveObject != null ? event.meta.leaveObject.Id : 0,
      EmployeeEntitlementId: event.meta.leaveObject != null ? event.meta.leaveObject.EmployeeEntitlementId : 0,
      leaveObject: event.meta.leaveObject,
      UserId: this.UserId,
      meta: event.meta,
      event: event,
      attendanceObject: attendanceObject

    });
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
      } else {
        this.getLeaveandOtherDetailsofEmployee(this.employeeAttendance, this._payrollInputSubmission);
        this.reUpdateAttendanceRegularizeData();
      }
    }).catch((error) => {
      console.log(error);
    });

    // }

  }



  // onClickMarkAsAbsent() {



  //   this.loadingScreenService.startLoading();

  //   // this.get_EmployeeEntitlementList(this.employeeAttendance.EmployeeId).then((result) => {
  //   //   if (result == true) {
  //   let jsobj = this.dayClicked_event as any;
  //   this.isValidDates = true;
  //   this.radioItems = ['Present', 'Absent'];
  //   this.createForm();
  //   this.isOpen = true
  //   this.AttendForm.patchValue({
  //     AppliedFrom: (jsobj.start),
  //     AppliedTill: (jsobj.end),
  //     Entitlement: null,
  //     // Action : 'Present'      
  //     isHalfDay: jsobj.meta.IsFirstDayHalf,
  //     AttendanceType: jsobj.meta.AttendanceType,
  //     IsFirstHalf: jsobj.meta.IsFirstHalf,
  //     IsSecondHalf: jsobj.meta.IsSecondHalf,
  //     AttendanceType_SecondHalf: jsobj.meta.AttendanceType_SecondHalf,
  //     Action: jsobj.color.primary === "#3BBD72" ? 'Present' : jsobj.color.primary === "#ad2121" ? 'Absent' : 'Others'
  //   });
  //   this.loadingScreenService.stopLoading();
  //   $('#popup_edit_attendance').modal('show');
  //   // } else {
  //   // this.loadingScreenService.stopLoading();
  //   //     this.alertService.showWarning('Employee entitilement not found.');
  //   //     return;
  //   //   }
  //   // });


  // }

  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this._requestEntitlementList = [];
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._requestEntitlementList = apiResult.Result as any;
          this._requestEntitlementList = this._requestEntitlementList.filter(a => a.IsLossOfPay == false);
          this.GetEntitlementAvailmentRequests(_employeeId).then((result) => {
            res(this._entitlementList != null && this._entitlementList.length > 0 ? true : false);
          });
        } else {
          this.GetEntitlementAvailmentRequests(_employeeId).then((result) => {
            ;
            res(true);
          });
        }
      }, err => {
        console.warn('ERR ::', err);
      });
    });
    return promise;
  }


  get g() { return this.AttendForm.controls; } // reactive forms validation 

  createForm() {
    this.AttendForm = this.formBuilder.group({
      Id: [0],
      AppliedFrom: [null, Validators.required],
      AppliedTill: [null, Validators.required],
      // isHalfDay: [false],
      // AttendanceType: [null],
      // AttendanceType_SecondHalf: [null],
      // IsFirstHalf: [false],
      // IsSecondHalf: [false],
      Action: [''],

      IsAppliedTillFirstHalf: [false],
      IsAppliedTillSecondHalf: [false],
      IsAppliedForFirstHalf: [false],
      IsAppliedFromSecondHalf: [false],
      ApplierRemarks: ['', Validators.required],
      EligibleUnits: [null],
      EntitlementType: [null],
      Entitlement: [{ value: null }, Validators.required],
      AppliedUnits: [0, Validators.required],
    });
  }



  resetAttendForm() {
    this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(false);
    this.AttendForm.controls['IsAppliedTillFirstHalf'].setValue(false);
    this.AttendForm.controls['IsAppliedFromSecondHalf'].setValue(false);
    this.AttendForm.controls['IsAppliedTillSecondHalf'].setValue(false);
    this.isDisabledTillDate = false;
    this.AttendForm.controls['IsAppliedForFirstHalf'].enable();
    this.AttendForm.controls['IsAppliedTillFirstHalf'].enable();
    this.AttendForm.controls['IsAppliedFromSecondHalf'].enable();
    this.AttendForm.controls['IsAppliedTillSecondHalf'].enable();

  }
  onChange_FromDate(event) {

    if (this.AttendForm.get('AppliedFrom').value != null || this.AttendForm.get('AppliedFrom').value != undefined) {
      var appliedfromDate = new Date(event);
      this._till_minDate = new Date();
      this._till_minDate.setMonth(appliedfromDate.getMonth());
      this._till_minDate.setDate(appliedfromDate.getDate());
      this._till_minDate.setFullYear(appliedfromDate.getFullYear());
      // this.AttendForm.controls['AppliedTill'].setValue(null);
      this.resetAttendForm();
      this.requestedDays = 0;
      this.calculateNoOfDays(new Date(event), (this.AttendForm.get('AppliedTill').value));

      let _fromdate = new Date(event);
      let _todate = this.AttendForm.get('AppliedTill').value;
      let A = moment(_fromdate).format('YYYY-MM-DD');
      let B = moment(_todate).format('YYYY-MM-DD');

      this.isinvalidDate = false;
      console.log('A1', A);
      console.log('B1', B);

      if (A != 'Invalid date' && B != 'Invalid date' && B != '1970-01-01' && B != A && B < A) {
        this.isinvalidDate = true;

        // this.alertService.showWarning("Note: The till date has to be greater than or equal to the from date.");
        // return;
      }
      //Note: The start date has to be greater than or equal to the start date.


    }
  }

  onChange_TillDate(event) {

    if (this.AttendForm.get('AppliedFrom').value != null || this.AttendForm.get('AppliedFrom').value != undefined) {
      this.resetAttendForm();
      this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, new Date(event));
    }

    let _fromdate = this.AttendForm.get('AppliedFrom').value
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
  }



  calculateNoOfDays(startDate, endDate) {



    let a = new Date(startDate);
    let b = new Date(endDate);
    var i = `'${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}'`;
    var j = `'${b.getMonth() + 1}/${b.getDate()}/${b.getFullYear()}'`;

    var future = moment(j);
    var start = moment(i);
    var diff = future.diff(start, 'days');
    console.log('diff in a day : ', diff);

    this.requestedDays = 0;
    this.preRequestedDays = 0;;
    this.requestedDays = Math.round(diff);
    this.requestedDays = this.requestedDays + 1;
    console.log(this.AttendForm.value);

    if (this.AttendForm.get('IsAppliedForFirstHalf').value == true || this.AttendForm.get('IsAppliedTillSecondHalf').value == true ||
      this.AttendForm.get('IsAppliedTillFirstHalf').value == true || this.AttendForm.get('IsAppliedFromSecondHalf').value == true) {
      this.requestedDays = this.requestedDays - 0.5;
    }

    if (this.AttendForm.get('IsAppliedForFirstHalf').value == false && this.AttendForm.get('IsAppliedFromSecondHalf').value == true && this.AttendForm.get('IsAppliedTillFirstHalf').value == true) {
      this.requestedDays = this.requestedDays - 0.5;
    }

    console.log('REG ::', this.requestedDays);
    console.log('ELG ::', this.eligibaleDays);
    console.log('PRE ::', this.preRequestedDays);

    if (this.AttendForm.get('Id').value > 0) {
      this.preRequestedDays = Number(this.AttendForm.get('AppliedUnits').value)
      if (this.preRequestedDays == 0) {
        this.preRequestedDays = this.requestedDays;
      }
      this.remainingDays = (Number(this.eligibaleDays) - Number(this.requestedDays)) + Number(this.preRequestedDays);
      this.remainingDays = Number(this.remainingDays).toFixed(1);

    } else {
      this.remainingDays = Number(this.eligibaleDays) - Number(this.requestedDays);
      this.remainingDays = Number(this.remainingDays).toFixed(1);

    }

    console.log('REMIN ::', this.remainingDays);

  }
  onChange_Entitlement(event) {
    console.log('event', event);
    event != undefined ? this.AttendForm.controls['EligibleUnits'].setValue(event.EligibleUnits) : this.AttendForm.controls['EligibleUnits'].setValue(0);
    event != undefined ? this.selectedEntitlement = event : this.selectedEntitlement = null;
    if (event != undefined) {
      this.leaveTypeName = event.DisplayName;
      this.remainingDays = event.EligibleUnits;
      this.eligibaleDays = event.EligibleUnits;
      this.availableDays = event.AvailableUnits;
      this.IsShowBalanceInUI = event.ShowBalanceInUI;
      this.IsLossOfPay = event.IsLossOfPay;
      this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

    }
  }


  onChange_firstHalf(item) {

    if (item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.AttendForm.controls['IsAppliedTillFirstHalf'].setValue(true);
      this.AttendForm.controls['IsAppliedTillFirstHalf'].disable();
      this.AttendForm.controls['IsAppliedFromSecondHalf'].setValue(false);

      this.isDisabledTillDate = true;

    }
    else if (item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') != moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      // this.AttendForm.controls['IsAppliedTillFirstHalf'].setValue(false)
      // this.AttendForm.controls['IsAppliedTillFirstHalf'].enable();
      // this.AttendForm.controls['IsAppliedFromSecondHalf'].setValue(false);
      // this.AttendForm.controls['IsAppliedFromSecondHalf'].disable();

      this.AttendForm.controls['IsAppliedTillFirstHalf'].setValue(false)
      this.AttendForm.controls['IsAppliedTillFirstHalf'].disable();
      this.AttendForm.controls['IsAppliedFromSecondHalf'].setValue(false);
      this.AttendForm.controls['IsAppliedFromSecondHalf'].disable();

      // this.AttendForm.controls['AppliedTill'].setValue(this.AttendForm.get('AppliedFrom').value); 
      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(true)

      this.isDisabledTillDate = false;

    }
    else {
      this.AttendForm.controls['IsAppliedTillFirstHalf'].setValue(false)
      this.AttendForm.controls['IsAppliedTillFirstHalf'].enable();
      this.AttendForm.controls['IsAppliedFromSecondHalf'].setValue(false);
      this.AttendForm.controls['IsAppliedFromSecondHalf'].enable();

      this.isDisabledTillDate = false;
    }


    this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

  }
  onChange_secondHalf(item) {

    if (this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      if (item.target.checked) {
        this.AttendForm.controls['IsAppliedTillSecondHalf'].setValue(true);
        this.AttendForm.controls['IsAppliedTillFirstHalf'].disable();
        this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(false);

        this.AttendForm.controls['IsAppliedTillFirstHalf'].setValue(false);


        this.isDisabledTillFirstHalf = true;

      } else {
        this.AttendForm.controls['IsAppliedTillSecondHalf'].setValue(false)
        this.AttendForm.controls['IsAppliedTillFirstHalf'].enable();
        this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(false);

        this.isDisabledTillFirstHalf = false;
      }
    }
    this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

  }
  onChange_tillfirstHalf(item) {

    if (item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(true);
      // this.AttendForm.controls['IsAppliedTillFirstHalf'].disable();
      // this.AttendForm.controls['IsAppliedFromSecondHalf'].setValue(false);

      this.isDisabledTillDate = true;

    }
    else if (!item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {

      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(false);
    }


    this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

  }


  saveEntitlementRequest() {
    this.submitted = true;
    this.AttendForm.controls['AppliedUnits'].setValue(this.requestedDays);

    if (this.AttendForm.invalid) {
      this.alertService.showWarning("Unfortunately, your leave request cannot be submitted. Please fill in a valid value for all required(*) fields.");
      return;
    }
    else if (this.isinvalidDate == true) {

      this.alertService.showWarning("Note: The till date has to be greater than or equal to the from date.");
      return;
    }
    else if (!this.IsLossOfPay && (this.AttendForm.controls.AppliedUnits.value == 0 || (this.AttendForm.controls.AppliedUnits.value > this.AttendForm.controls.EligibleUnits.value))) {
      this.alertService.showWarning("The date you selected is not a valid : please ensure that the from/till date and try again | You cannot exceed your eligible limit of days");
      return;
    } else {

      this.validateIsExitsOnDay().then((res) => {

        console.log('VALIDATION CEHCK ::', res);
        if (res) {
          this.alertService.showWarning("Overlaps : You have entered dates that already exists in this request List. Only Unique dates are allowed.")
          return;
        }
        else {

          this.alertService.confirmSwal1("Confirmation!", `To apply for ${this.requestedDays} day(s) leave from ${moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('DD-MM-YYYY')} to ${moment(new Date(this.AttendForm.get('AppliedTill').value)).format('DD-MM-YYYY')}. Are you sure you want to Submit?`, "Yes, Confirm", "No, Cancel").then((result) => {
            try {


              this.loadingScreenService.startLoading();

              let currentDate = new Date();
              var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
              entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
              entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
              entitlementAvailmentRequest.ApprovedTill = null;
              entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
              entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
              entitlementAvailmentRequest.ApprovedUnits = this.AttendForm.get('AppliedUnits').value;
              entitlementAvailmentRequest.ApprovedFrom = null;
              entitlementAvailmentRequest.AppliedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');;
              entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');
              entitlementAvailmentRequest.ValidatedBy = this.UserId;
              entitlementAvailmentRequest.ApplierRemarks = '';
              entitlementAvailmentRequest.CancellationRemarks = '';
              entitlementAvailmentRequest.ValidatorRemarks = this.AttendForm.get('ApplierRemarks').value;
              entitlementAvailmentRequest.Status = EntitlementRequestStatus.Approved;
              entitlementAvailmentRequest.AppliedBy = 0;
              entitlementAvailmentRequest.CalculatedAppliedUnits = 0;
              entitlementAvailmentRequest.AppliedUnits = this.AttendForm.get('AppliedUnits').value;
              entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
              entitlementAvailmentRequest.Id = this.AttendForm.get('Id').value;
              entitlementAvailmentRequest.EmployeeId = this.selectedEntitlement.EmployeeId;
              entitlementAvailmentRequest.EmployeeEntitlementId = this.selectedEntitlement.Id;
              entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
              entitlementAvailmentRequest.EntitlementId = this.AttendForm.get('Entitlement').value;
              entitlementAvailmentRequest.EntitlementDefinitionId = this.selectedEntitlement.EntitlementDefinitionId;
              entitlementAvailmentRequest.EntitlementMappingId = this.selectedEntitlement.EntitlementMappingId;
              entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
              entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
              entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
              entitlementAvailmentRequest.AppliedFrom = moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD');
              entitlementAvailmentRequest.IsAppliedFromSecondHalf = this.AttendForm.get('IsAppliedFromSecondHalf').value;
              entitlementAvailmentRequest.IsAppliedForFirstHalf = this.AttendForm.get('IsAppliedForFirstHalf').value;
              entitlementAvailmentRequest.AppliedTill = moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD');
              entitlementAvailmentRequest.IsAppliedTillFirstHalf = this.AttendForm.get('IsAppliedTillFirstHalf').value;
              entitlementAvailmentRequest.ActivityList = [];
              entitlementAvailmentRequest.PendingAtUserId = 0;
              entitlementAvailmentRequest.PendingAtUserName = '';
              entitlementAvailmentRequest.ValidatedUserName = this.UserName;

              console.log('ENTILMENT REQUEST :: ', entitlementAvailmentRequest);
              this.attendanceService.PostEntitlementAvailmentRequest(entitlementAvailmentRequest)
                .subscribe((result) => {
                  let apiResult: apiResult = result;
                  console.log('SUBMITTED RES ::', result);
                  if (apiResult.Status) {
                    this.alertService.showSuccess(apiResult.Message);
                    this.loadingScreenService.stopLoading();
                    this.modal_dismiss_edit_attendance();
                    this.getLeaveandOtherDetailsofEmployee(this.employeeAttendance, this._payrollInputSubmission);
                    this.reUpdateAttendanceRegularizeData();

                  } else {
                    this.alertService.showWarning(apiResult.Message);
                    this.loadingScreenService.stopLoading();
                  }

                }, err => {

                })
            } catch (error) {
              this.alertService.showWarning('Something went wrong! ' + error);
              this.loadingScreenService.stopLoading();
            }
          }).catch(error => {

          });
        }

      })
    }
  }


  validateIsExitsOnDay() {

    const promise = new Promise((res, rej) => {
      let isExists: boolean = false;
      let _appliedListofDates = [];
      let _stDate = moment(new Date(this.AttendForm.get('AppliedFrom').value)) as any;
      let _edDate = moment(new Date(this.AttendForm.get('AppliedTill').value));
      console.log('_stDate', _stDate);
      console.log('_edDate', _edDate);

      while (moment(_stDate) <= moment(_edDate)) {
        _appliedListofDates.push({ date: (_stDate) });
        _stDate = moment(_stDate).add(1, 'days').format("YYYY-MM-DD");
      }
      console.log('_appliedListofDates', _appliedListofDates);

      if (this._entitlementAvailmentRequests.length > 0) {

        for (let i = 0; i < this._entitlementAvailmentRequests.length; i++) {
          const index = this._entitlementAvailmentRequests[i];
          if (index.Status != EntitlementRequestStatus.Rejected && index.Status != EntitlementRequestStatus.Cancelled && index.Id != this.AttendForm.get('Id').value) {
            let startDate = index.AppliedFrom;
            while (moment(startDate) <= moment(index.AppliedTill)) {
              // startDate
              console.log('index :', index);
              console.log('form value : ', this.AttendForm.value);
              console.log('startDate :', startDate);
              console.log(_appliedListofDates.filter(a => moment(a.date).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')).length);

              // isExists == false ? _appliedListofDates.length > 0 && _appliedListofDates.filter(a => moment(a.date).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')).length > 0 ? isExists = true : isExists = false : null;
              // console.log('isExists', isExists);

              startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
            }

            if (moment(index.AppliedFrom).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD')) {
              isExists = (index.IsAppliedForFirstHalf == this.AttendForm.get('IsAppliedForFirstHalf').value && index.IsAppliedFromSecondHalf == this.AttendForm.get('IsAppliedFromSecondHalf').value
                && index.IsAppliedTillFirstHalf == this.AttendForm.get('IsAppliedTillFirstHalf').value && index.IsAppliedTillSecondHalf == this.AttendForm.get('IsAppliedTillSecondHalf').value) ? true : false;
              isExists == false ? (isExists = index.IsAppliedForFirstHalf == this.AttendForm.get('IsAppliedForFirstHalf').value ? true : false) : null
              isExists == false ? (isExists = index.IsAppliedFromSecondHalf == this.AttendForm.get('IsAppliedFromSecondHalf').value ? true : false) : null
              isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.AttendForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
              isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.AttendForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
              console.log('isex', isExists);
            }
            if (moment(index.AppliedFrom).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD')) {
              isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.AttendForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
              isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.AttendForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
              console.log('isex 2', isExists);

            }
            if (moment(index.AppliedTill).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD')) {
              isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.AttendForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
              isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.AttendForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
              console.log('isex 4', isExists);

            }
            if (moment(index.AppliedTill).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD')) {
              isExists == false ? (isExists = index.IsAppliedForFirstHalf == this.AttendForm.get('IsAppliedForFirstHalf').value ? true : false) : null
              console.log('isex1 5', isExists);
              isExists == false ? (isExists = index.IsAppliedFromSecondHalf == this.AttendForm.get('IsAppliedFromSecondHalf').value ? true : false) : null
              console.log('isex2 5', isExists);
              isExists == false ? (isExists = index.IsAppliedTillFirstHalf == this.AttendForm.get('IsAppliedTillFirstHalf').value ? true : false) : null
              console.log('isex3 5', isExists);
              isExists == false ? (isExists = index.IsAppliedTillSecondHalf == this.AttendForm.get('IsAppliedTillSecondHalf').value ? true : false) : null
              console.log('isex 5', isExists);


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


  GetEntitlementAvailmentRequests(_employeeId) {
    const promise = new Promise((res, rej) => {


      this.LstEntitlementAvailmentRequest = [];
      this.attendanceService.GetEntitlementAvailmentRequests(_employeeId).subscribe((result) => {
        console.log('RES ENTITLEMENT AVAILMENT ::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          try {
            this.LstEntitlementAvailmentRequest = apiResult.Result as any;
            this._entitlementAvailmentRequests = apiResult.Result as any;
            var _statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
            res(true)
          } catch (error) {
            // this.alertService.showWarning(error);

          }
        } else {
          res(true)
          // this.alertService.showWarning('There are no records left.');

        }
      }, err => {
        console.warn('ERR ::', err);

      })
    })
    return promise;
  }



  onEditAttendanceRequest() {
    console.log('attendance edit', this.attendanceObject);
    console.log('attendance edit', this._entitlementAvailmentRequestsApprovals);
    alert('coming soon');
  }

  Approve_RejectAll(whichaction) {
    if (this.selectedEmployeeAttendanceObject.length == 0) {
      this.alertService.showWarning('Note : Select a minimum of one record to continue.');
      return;
    }
    let invalidEmployees = [];
    this.selectedEmployeeAttendanceObject.forEach(x => {
      if (x.EmployeeAttendanceBreakUpDetails == null) {
        invalidEmployees.push(x.EmployeeCode);
      }
    });
    if (this.selectedEmployeeAttendanceObject.length > 0 && this.selectedEmployeeAttendanceObject.filter(z => z.EmployeeAttendanceBreakUpDetails == null).length > 0) {
      this.alertService.showInfo(`One of the employees has no details regarding the attendance breakdown... Employee Codes : ${_.union(invalidEmployees).join(",")}`);
      return;
    }

    let actionName = whichaction == true ? 'Approve' : "Reject";

    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: `${actionName} Comments`,
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


          let LstEmployeeBreakupDetails = [];
          this.loadingScreenService.startLoading();
          this.selectedEmployeeAttendanceObject.forEach(element => {
            if (element.EmployeeAttendanceBreakUpDetails != null && element.EmployeeAttendanceBreakUpDetails.length > 0) {
              element.EmployeeAttendanceBreakUpDetails.forEach(item => {
                if (item.EmployeeAttendancePunchInDetails != null && item.EmployeeAttendancePunchInDetails.length > 0) {
                  item.EmployeeAttendancePunchInDetails.forEach(subitem => {
                    subitem.ApproverRemarks = jsonStr;
                    subitem.ApprovedHours = subitem.SubmittedHours.toFixed(2);
                  });
                }
                item.Status = whichaction == true ? AttendanceBreakUpDetailsStatus.ManagerApproved : AttendanceBreakUpDetailsStatus.ManagerRejected;
                item.TotalApprovedHours = item.TotalSubmittedHours.toFixed(2);
                item.ApproverRemarks = jsonStr;
                LstEmployeeBreakupDetails.push(item);

              });
            }

          });


          let submitAttendanceUIModel = new SubmitAttendanceUIModel();
          submitAttendanceUIModel.LstEmployeeAttendanceBreakUpDetails = LstEmployeeBreakupDetails;
          submitAttendanceUIModel.ModuleProcessAction = EmployeeAttendancModuleProcessStatus.ManagerSubmitAttendance;
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
                // this.alertService.showSuccess(apiresult.Message);       
              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiresult.Message);
              }

            })



        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {

        }
      })


    }).catch(error => {

    });
  }



  viewPunchInOutImage(item) {
    console.log('i', item);

    const modalRef = this.modalService.open(ImageviewerComponent, this.modalOption);
    modalRef.componentInstance.PunchInOutDetails = item;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('RESULT OF EDITED SO DETAILS :', result);
      }
      else {
        // this.onRefresh();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  permissionTimecaluculation(requestList) {
    let _totalMin = 0;
    let _totalTime = ""
    let _splitTime = []
    for (let reqObj of requestList) {

      _totalMin = moment.duration(reqObj['EndTime']).asMinutes() - moment.duration(reqObj['StartTime']).asMinutes()
      _totalTime = moment.utc(moment.duration(_totalMin, "minutes").asMilliseconds()).format("hh:mm")
      _splitTime = _totalTime.split(":");
      reqObj['totalTime'] = `${_splitTime[0]} Hr ${_splitTime[1]} Min`
      reqObj.StartTime = moment(reqObj.StartTime, "HH:mm:ss").format("hh:mm A");
      reqObj.EndTime = moment(reqObj.EndTime, "HH:mm:ss").format("hh:mm A");
      reqObj.Date = moment(reqObj.Date).format("YYYY-MM-DD");
    }
    return requestList
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

  HasFirstHalfProp(item) {
    return (item.hasOwnProperty('FirstHalf') == true && item.hasOwnProperty('SecondHalf') == true) ? true : false
  }

  getHolidayList(ClientId, ClientContractId, TeamId, EmployeeId) {
    (async () => {
      await this.attendanceService.GetHolidayCalendarBasedOnApplicability(0, ClientId, ClientContractId, TeamId, 0, 0, EmployeeId)
        .subscribe((result) => {
          let apiresult: apiResult = result;
          if (apiresult.Status) {
            var data = apiresult.Result as any;
            console.log('HOLIDAY LIST ::', data);
            console.log('EVENT ::', this.events);
            try {

              if (data != null) {
                this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 
                ? data.HolidayList.filter(a => a.Type == 1 || a.Type == 2) : []
                this.LstHolidays != null && this.LstHolidays.length > 0 && this.LstHolidays.forEach(el => {
                  let doUpdateHoliday = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(el.Date).format('YYYY-MM-DD'));
                  if (doUpdateHoliday != undefined && doUpdateHoliday != null) {
                    doUpdateHoliday.meta.isHoliday = true;
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
  }
}
