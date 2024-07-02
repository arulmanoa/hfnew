import { Component, OnInit, Injectable } from '@angular/core';
import { result } from 'lodash';
import * as moment from 'moment';
import Swal from "sweetalert2";
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
// formatDate(new Date(), 'yyyy/MM/dd', 'en');
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
declare let $: any;
import { ActivatedRoute, Router } from '@angular/router';
import { EmployeeService } from 'src/app/_services/service/index';

import {
  subMonths, addMonths, addDays, addWeeks, subDays, subWeeks, startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay,
  endOfDay,
} from 'date-fns';
import { CalendarEvent, CalendarMonthViewDay, CalendarView, CalendarUtils } from 'angular-calendar';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { Subject, Observable } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, PayrollService, ExcelService } from 'src/app/_services/service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Allowance } from 'src/app/_services/model/Payroll/Allowance';
import { BaseModel, UIMode } from 'src/app/_services/model/Common/BaseModel';
import { TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { Attendance, AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
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
  selector: 'app-attendance-monthly-report',
  templateUrl: './attendance-monthly-report.component.html',
  styleUrls: ['./attendance-monthly-report.component.scss']
})

export class AttendanceMonthlyReportComponent implements OnInit {


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

  clientID: any;
  clientContractId : number = 0;
  attendancePeriodId: any;
  isOnlyPanasonic: boolean = false;

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private payrollService: PayrollService,
    private loadingScreenService: LoadingScreenService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
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




  ngOnInit() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.onRefresh();
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
        var encodedIdx = atob(params["Idx"]);  // client id
        var encodedCdx = atob(params["Cdx"]);  // client contract id
        var encodedMdx = atob(params["Mdx"]);  // attendance id 

        this.clientID = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.clientContractId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
        this.attendancePeriodId = Number(encodedMdx) == undefined ? 0 : Number(encodedMdx);

        if (this.clientID == 1905) {
          this.isOnlyPanasonic = true;
        }

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
        this.router.navigateByUrl('app/listing/ui/MonthlyATReport')
        alert('No records found!');
        return;
      }
    });


  }
  
  onClose() {
    sessionStorage.removeItem('IsProxy');
    this.router.navigateByUrl('app/listing/ui/MonthlyATReport')
  }

  
  export() {
    // download the file using old school javascript method
    // var string = `${this.regularizationData.TeamList.Name}_${this.currentPeriodName}`;
    var string = 'AttendanceMonthlyReport_';
    var length = 30;
    var trimmedString = string.substring(0, length);

    let exportExcelDate = [];
    const excelArray = JSON.parse(JSON.stringify(this.attendance_actualData));
    excelArray.forEach(element => {

      let my_obj = {};
      if (element.Attendance) {
        element.Attendance.forEach((elem) => {
          if ((elem.FirstHalf == undefined || elem.FirstHalf == 'EMPTY')) {
            elem.FirstHalf = '';
          } 
          if ((elem.SecondHalf == undefined || elem.SecondHalf == 'EMPTY')) {
            elem.SecondHalf = '';
          }

          if (elem.IsHoliday && !elem.IsWeekOff) {
            my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = ` ${elem.IsHoliday && elem.FirstHalf && 
            elem.FirstHalf == elem.SecondHalf && elem.FirstHalf !== '' && 
            elem.FirstHalf != null ? ` H | ${elem.FirstHalf}` : `H`}`;

          } else  if (elem.IsWeekOff && !elem.IsHoliday) {
            my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = `
            ${elem.IsWeekOff && elem.FirstHalf && elem.FirstHalf !== '' && elem.FirstHalf == elem.SecondHalf 
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
          my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] =  my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')].replace(/(?:\r\n\s|\r|\n|\s)/g, '');

        });
      }
      // console.log('my_obj', my_obj);
      if (Number(this.clientID) == 1905) {
        exportExcelDate.push({
          EmployeeCode: element.EmployeeCode,
          EmployeeName: element.EmployeeName,
          DOJ: element.DOJ,
          LWD: element.LWD,
          Location: element.LocationName,
          DealerName: element.Department,
          Designation: element.Designation,
          ReportingTo: element.ManagerName,
          Present: element.Present,
          WeekOff: element.WeeklyOff,
          Holiday: element.Holiday,
          ApprovedLeave: element.ApprovedLeave,
          LOP: element.LOP,
          TotalDays: element.TotalDays,
          PayableDays: element.PayableDays,
          AdditionalPayableDays : element.AdditionalPayableDays,
          ...my_obj,
        })
      } else {
        exportExcelDate.push({
          EmployeeCode: element.EmployeeCode,
          EmployeeName: element.EmployeeName,
          DOJ: element.DOJ,
          LWD: element.LWD,
          Location: element.LocationName,
          Department: element.Department,
          Designation: element.Designation,
          ReportingTo: element.ManagerName,
          Present: element.Present,
          WeekOff: element.WeeklyOff,
          Holiday: element.Holiday,
          ApprovedLeave: element.ApprovedLeave,
          LOP: element.LOP,
          TotalDays: element.TotalDays,
          PayableDays: element.PayableDays,
          AdditionalPayableDays : element.AdditionalPayableDays,
          ...my_obj,
        })
      }

    });

    console.log('my object', exportExcelDate);

    this.excelService.exportAsExcelFile(exportExcelDate, trimmedString);


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
            // this.attendance_actualData = this.regularizationData;
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
          this.GetEmployeeAttendanceDetails(attendance, this.attendancePeriodId);

        })
      })

  }



  GetEmployeeAttendanceDetails(attendance, attendancePeriodId) {
    console.log('att', attendance)
    console.log('payrollInputSubmission', attendancePeriodId)
    this.loadingScreenService.startLoading();
    this.attendanceService.GetEmployeeAttendanceDetails(attendance.EmployeeId, attendancePeriodId)
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

           
          
            
          
            this.loadingScreenService.stopLoading();


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
        },

      })
      // }
      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
      // }
    }
    return date;
  }

  private GetRegularizationAttendanceData() {
    const promise = new Promise((res, rej) => {
      this.refreshing_table_spinner = true;
      this.attendanceService.GetMonthlyAttendanceReport(this.clientID, this.clientContractId, this.attendancePeriodId, this.UserId, this.RoleId)
        .subscribe((result) => {
          try {
            let apiresult: apiResult = result;

            if (apiresult.Status && apiresult.Result != null) {

              let LocalregularizationData = JSON.parse(apiresult.Result);
              // this.PresentAttendancePeriodId = LocalregularizationData.AttendancePeriods.find(x => x.IsOpenPeriod == true);
              this.mapAttendacePeriodData(apiresult.Result);

              res(true);
            } else {
              res(null);
              this.alertService.showWarning(apiresult.Message);
            }

          } catch (error) {
            this.alertService.showWarning('Error: ' + error);
          }
        }, err => {
          console.error('ERROR ::', err);
          this.alertService.showWarning('Error: ' + err);
        })
    });
    return promise;
  }


  mapAttendacePeriodData(Result) {
    this.IsEmptyEmployeeList = false;
    this.regularizationData = JSON.parse(Result);
    console.log('REGULARIZATION DATA ::', this.regularizationData);

    if (this.regularizationData == null) {
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

    
    this._attendancePeriods = this.regularizationData;
    this._clientId = this.clientID;
    this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == this._clientId));

    if (!this._permissionConfigClientBased) {
      this._permissionConfigClientBased = (environment.environment.AttendanceUIPermissionText.find(x => x.ClientId == 0));
    }
    console.log("this._permissionConfigClientBased", this._permissionConfigClientBased, this.attendancePeriodId);

    // var records = this._attendancePeriods.find(a => a.Id == this.attendancePeriodId);
    // this.IsOpenAttendancePeriod = records != undefined && records != null ? records.IsOpenPeriod : false;
    // this.openAttendancePeriodId = this.regularizationData.find(x => x.IsOpenPeriod == true).Id;
    // if (this.openAttendancePeriodId == this.PresentAttendancePeriodId) {
    //   this.IsOpenAttendancePeriod = true;
    // } else {
    //   this.IsOpenAttendancePeriod = false;
    // }

    
    // var startDate = new Date(records.StartDate);
    // var endDate = new Date(records.EndDate);

    // this.enumerateDaysBetweenDates1(startDate, endDate);

    this.attendance_header = [];
    this.attendance_header.length = 0;
     // Find object with maximum attendance length and its index in this.regularizationData array
     const maxAttendance = this.regularizationData.reduce((acc, curr, index) => {
      if (curr.Attendance.length > acc.length) {             
        return { length: curr.Attendance.length, index };   // Return an object with length and index of current object
      }
      return acc; // Otherwise, return the previous object
    }, { length: 0, index: 0 });  // Start with an initial object of length 0 and index 0                        
    
    // Get attendance header from object with maximum attendance length
    const header = this.regularizationData[maxAttendance.index].Attendance;
    
    this.attendance_header = header.map(a => ({ date: a.AttendanceDate }));
    //old one
    // const header = this.regularizationData[0].Attendance == null ? this.regularizationData[1].Attendance : this.regularizationData[0].Attendance;
    // var result = header.map(a => {
    //   const tempObj = {
    //     'date' : a.AttendanceDate
    //   }
    //   this.attendance_header.push(tempObj);
    // });
    this.attendance_actualData = [];
    this.attendance_actualData.length = 0;
    this.attendance_actualData = this.regularizationData;
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

  enumerateDaysBetweenDates1(startDate, endDate) {
    this.attendance_header = []
    while (moment(startDate) <= moment(endDate)) {
      this.attendance_header.push({ date: (startDate) });
      startDate = moment(startDate).add(1, 'days').format("YYYY-MM-DD");
    }
    console.log('da', this.attendance_header);

    return this.attendance_header;
  }


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
                this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 1) : []
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
