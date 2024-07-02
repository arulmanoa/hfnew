import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { forEach } from 'lodash';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
// formatDate(new Date(), 'yyyy/MM/dd', 'en');
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
declare let $: any;
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';

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
import { AlertService, PayrollService } from 'src/app/_services/service';
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
  elementIdOrContent: 'myTableIdElementId', // the id of html/table element,
  options: { // html-docx-js document options
    orientation: 'landscape',
    margins: {
      top: '20'
    }
  }
}
@Component({
  selector: 'app-hrattendanceentries',
  templateUrl: './hrattendanceentries.component.html',
  styleUrls: ['./hrattendanceentries.component.scss']
})
export class HrattendanceentriesComponent implements OnInit {

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
  isBulkView: boolean = false;
  expandIcon = 'right';
  expandIcon_tooltip = "expand more"
  isRejected: boolean = false;
  isAbsent: boolean = false;
  indxOfWeek: any = 0;
  selectedWeek_period: any;
  isweekBased: boolean = false
  render_spinner: boolean = false;

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
  TeamList: any[] = [];
  selectedTeamId: any[] = [];;
  TeamName: any;
  MasterDataLength: any = 0;
  spinnerTeamChange: boolean = false;
  isBulkAction: any = 'false';
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
    this.HRRoleCode = environment.environment.HRRoleCode;
    this.spinner = true;
    this.titleService.setTitle('Employee Attendance Entries');
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        var encodedMdx = atob(params["Mdx"]);
        var encodedIsBulk = atob(params["IsBulk"]);
        this.isBulkAction = encodedIsBulk as any;
        this._TeamId = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this._ManagerId = Number(encodedMdx) == undefined ? 0 : Number(encodedMdx);
        if (encodedIdx == '0' && encodedIsBulk != 'false') {
          this.GetPayrollInputsSubmissionUIDatabyManagerId().then((resu) => {
          });
        }
        else if (encodedIsBulk == 'false') {
          this.GetPayrollInputSubmissionUIData().then((resu) => {
          });
        } else {
          this.GetPayrollInputsSubmissionUIDatabyclientId().then((resu) => {
          });
        }


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
    this.router.navigateByUrl('app/attendance/teamattendance')
  }



  ngOnInit() {

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
    let jsobj = events[0] as any;
    this.isValidDates = true;
    this.radioItems = ['Present', 'Absent'];
    this.createForm();
    this.isOpen = true
    this.AttendForm.patchValue({
      StartDate: (jsobj.start),
      EndDate: (jsobj.end),
      // Action : 'Present'
      isHalfDay: jsobj.meta.IsFirstDayHalf,
      AttendanceType: jsobj.meta.AttendanceType,
      IsFirstHalf: jsobj.meta.IsFirstHalf,
      IsSecondHalf: jsobj.meta.IsSecondHalf,
      AttendanceType_SecondHalf: jsobj.meta.AttendanceType_SecondHalf,
      Action: jsobj.color.primary === "#3BBD72" ? 'Present' : jsobj.color.primary === "#ad2121" ? 'Absent' : 'Others'
    });

    $('#popup_edit_attendance').modal('show');

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

    return this.attendance_header;
  }
  onChange_teamfilter(event) {
    console.log('EVENT TEAM FILTER ::', event);
    console.log(this.selectedTeamId);

    this.spinnerTeamChange = true;
    if (event.length > 0) {
      this.attendance_header = [];
      this.attendance_header.length = 0;
      this.attendance_header = this._payrollInputSubmission.EmployeeWiseAttendanceList[0].AttendanceList;
      this.attendance_actualData = [];
      this.attendance_actualData.length = 0;

      this.updateListlog(event);
    } else {
      this.attendance_header = [];
      this.attendance_header.length = 0;
      this.attendance_header = this._payrollInputSubmission.EmployeeWiseAttendanceList[0].AttendanceList;
      this.attendance_actualData = [];
      this.attendance_actualData.length = 0;
      this.attendance_actualData = this._payrollInputSubmission.MasterData;
      this.TeamName = '';
      this.MasterDataLength = this.attendance_actualData.length;
      this.spinnerTeamChange = false;

    }
  }

  updateListlog(event) {
    let emplist = [];
    event.forEach(element => {
      emplist.push(element.TeamId);
    });

    var selection = _.filter(this._payrollInputSubmission.MasterData, a => event.some(d => d.TeamId == a.TeamId));
    console.log('selection', selection);


    // this.attendance_actualData = [];
    // for (let index = 0; index < this._payrollInputSubmission.MasterData.length; index++) {
    //   const element = this._payrollInputSubmission.MasterData[index];
    //   if (element.TeamId._.includes(event, TeamId)) {
    //     this.attendance_actualData.push(element);
    //   }
    // }
    // this.attendance_actualData = this._payrollInputSubmission.MasterData != null && this._payrollInputSubmission.MasterData.length > 0 ? this._payrollInputSubmission.MasterData.filter(a => event.some(d => d.TeamId == a.TeamId)) : [];
    this.attendance_actualData = selection;
    this.TeamName = event.TeamName;
    this.MasterDataLength = this.attendance_actualData.length;
    this.spinnerTeamChange = false;

  }

  GetPayrollInputsSubmissionUIDatabyManagerId() {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetPayrollInputsSubmissionUIDatabyManagerId(this._ManagerId)
        .subscribe((result) => {
          console.log('RESULT API ::', result);
          let apiResult: apiResult = result;
          if (apiResult.Status && apiResult.Result != null) {
            this._payrollInputSubmission = apiResult.Result as any;
            console.log('PAYROLL SUBMISSION ::', this._payrollInputSubmission);
            this._attendancePeriods = this._payrollInputSubmission.AttendanceCycle.AttendancePeriods;
            var records = this._attendancePeriods.find(a => a.Id == this._payrollInputSubmission.AttendancePeriodId);
            this._IsPayrollSubmitted = this._payrollInputSubmission.IsPayrollSubmitted;
            if (environment.environment.HRRoleCode.includes(this.RoleCode) == true) {
              // if (this.RoleCode == this.HRRoleCode) {
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

            console.log('MASTER DATA :: ', this._payrollInputSubmission.MasterData);
            if (this._payrollInputSubmission.MasterData != null && this._payrollInputSubmission.MasterData.length > 0) {
              this.TeamList = _.chain(this._payrollInputSubmission.MasterData)
                .groupBy("TeamId")
                .map((element, id) => ({
                  TeamId: id,
                  TeamName: element[0].TeamName,
                }))
                .value();
              console.log('GROUP OF TEAM ::', this.TeamList);
            }

            this.TeamList.forEach(e => {
              this.selectedTeamId.push(e.TeamId);
            });

            this.attendance_header = [];
            this.attendance_header.length = 0;
            this.attendance_header = this._payrollInputSubmission.EmployeeWiseAttendanceList[0].AttendanceList;
            this.attendance_actualData = [];
            this.attendance_actualData.length = 0;
            this.attendance_actualData = this._payrollInputSubmission.MasterData;
            console.log('TABLE DATA ::', this.attendance_actualData);
            if (this.isBulkAction == 'false') {
              this.TeamName = this._payrollInputSubmission.TeamName;
            } else {
              this.TeamName = ''; // this._payrollInputSubmission.TeamName;
            }
            this.MasterDataLength = this._payrollInputSubmission.MasterData.length;
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




  GetPayrollInputsSubmissionUIDatabyclientId() {
    const promise = new Promise((res, rej) => {
      // THE MANAGER ID WILL BE CONVERTED INTO CLIENT ID HERE (HR ADMIN LOGIN)
      this.attendanceService.GetPayrollInputsSubmissionUIDatabyclientId(this._ManagerId)
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
              if(environment.environment.HRRoleCode.includes(this.RoleCode) == true){
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

            console.log('MASTER DATA :: ', this._payrollInputSubmission.MasterData);
            if (this._payrollInputSubmission.MasterData != null && this._payrollInputSubmission.MasterData.length > 0) {
              this.TeamList = _.chain(this._payrollInputSubmission.MasterData)
                .groupBy("TeamId")
                .map((element, id) => ({
                  TeamId: id,
                  TeamName: element[0].TeamName,
                }))
                .value();
              console.log('GROUP OF TEAM ::', this.TeamList);
            }

            this.TeamList.forEach(e => {
              this.selectedTeamId.push(e.TeamId);
            });

            this.attendance_header = [];
            this.attendance_header.length = 0;
            this.attendance_header = this._payrollInputSubmission.EmployeeWiseAttendanceList[0].AttendanceList;
            this.attendance_actualData = [];
            this.attendance_actualData.length = 0;
            this.attendance_actualData = this._payrollInputSubmission.MasterData;
            console.log('TABLE DATA ::', this.attendance_actualData);
            if (this.isBulkAction == 'false') {
              this.TeamName = this._payrollInputSubmission.TeamName;
            } else {
              this.TeamName = ''; // this._payrollInputSubmission.TeamName;
            } this.MasterDataLength = this._payrollInputSubmission.MasterData.length;
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


  GetPayrollInputSubmissionUIData() {
    const promise = new Promise((res, rej) => {
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
                if(environment.environment.HRRoleCode.includes(this.RoleCode) == true){
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
            this.TeamName = this._payrollInputSubmission.TeamName;
            this.MasterDataLength = this.attendance_actualData.length;
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
    this.exportAsService.save(exportAsConfig, `${this._payrollInputSubmission.TeamName}_${this.currentPeriodName}`).subscribe(() => {
      // save started
    });
    // get the data as base64 or json object for json type - this will be helpful in ionic or SSR

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
      this.alertService.showWarning('Info : Attendance Periods may not be avaiable currently. Please try after sometimes');
      return;
    }
  }



  async onClickEmployeeCode(attendance, payrollInputSubmission) {
    console.log('test', attendance);
    console.log('payrollInputSubmission', payrollInputSubmission);
    console.log('payrollInputSubmission', this._payrollInputSubmission);

    if (this._IsPayrollSubmitted) {
      this.alertService.showWarning("Info : The payroll attendance is already submitted.");
      return;
    }

    this.loadingScreenService.startLoading();
    this.LstTimeCardAllowanceProducts = [];
    this.attendance_slider_activeTabName = "attendanceInputs";
    this.events = [];
    let _TimecardId = this._payrollInputSubmission.TimeCards.find(z => z.EmployeeId == attendance.EmployeeId).Id;
    this.timecardEditDOJ = moment(attendance.DOJ, 'DD/MM/YYYY').format('YYYY-MM-DD');
    await this.lookupDetailsTimeCardUI(this._payrollInputSubmission.TeamId).then((response: any) => {
      const response_lookup = response;
      let LstTimeCardProducts = (JSON.parse(response_lookup));
      console.log('TIMECARD DETAILS ::', LstTimeCardProducts);
      LstTimeCardProducts.AllowanceProducts != null && LstTimeCardProducts.AllowanceProducts.forEach(element => {
        element["Id"] = 0;
        element['ExistingAmount'] = 0;
        element['NewAmount'] = 0;

      });
      this.LstTimeCardAllowanceProducts = LstTimeCardProducts.AllowanceProducts;
      this.payrollService.getTimeCardDetailsById(_TimecardId)
        .subscribe((result) => {
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.TimeCardDetails = apiResult.Result as any;
            let LstEntitlement = JSON.parse(this._payrollInputSubmission.EntitlementBalances);
            this._EntitlementBalances = LstEntitlement.filter(a => a.EmployeeId == attendance.EmployeeId);
            console.log('LSTENTITLEMENT :: ', this._EntitlementBalances);
            this._attendanceDetailsOfEmployee = attendance;
            console.log('ATTENDNACE :', this._attendanceDetailsOfEmployee);
            // for (let i = 0; i < this._payrollInputSubmission.AttendanceTypes.length; i++) {
            //   const element = this._payrollInputSubmission.AttendanceTypes[i];
            //   // this._AttendanceType.push({
            //   //   id: i + 1,
            //   //   name: element
            //   // })
            // }
            console.log('ATTENDNACE TYPE:', this._AttendanceType);
            this.viewDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
            this.events = [];
            this.minDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
            this.maxDate = new Date(this._payrollInputSubmission.AttendanceEndDate);
            this.dateOrViewChanged();

            this.timecardEditDOJ = new Date(this.timecardEditDOJ);
            this.timecardEditDOJ = new Date(this.timecardEditDOJ.getFullYear(), this.timecardEditDOJ.getMonth(), this.timecardEditDOJ.getDate());

            var attStart = moment(this._payrollInputSubmission.AttendanceStartDate).format('YYYY-MM-DD');
            var isAfterDOJ = moment(this.timecardEditDOJ).isAfter(attStart);
            this.viewDate = new Date(this.TimeCardDetails.AttendanceStartDate);
            isAfterDOJ == true ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
            isAfterDOJ == true ? this.viewDate = new Date(this.timecardEditDOJ) : this.viewDate = new Date(this._payrollInputSubmission.AttendanceStartDate);

            console.log('attttt', attendance);
            console.log(' new Date(this.timecardEditDOJ) ', new Date(this.timecardEditDOJ));


            this.TimeCardDetails.IsNewJoiner == true ? this.minDate = new Date(this.timecardEditDOJ) : this.minDate = new Date(this._payrollInputSubmission.AttendanceStartDate);
            this.TimeCardDetails.IsNewJoiner == true ? this.viewDate = new Date(this.timecardEditDOJ) : this.viewDate = new Date(this._payrollInputSubmission.AttendanceStartDate);

            const output = this.enumerateDaysBetweenDates(this.TimeCardDetails.IsNewJoiner == true ? new Date(this.timecardEditDOJ) : new Date(this._payrollInputSubmission.AttendanceStartDate), new Date(this._payrollInputSubmission.AttendanceEndDate));

            var templist = [];
            templist = this.TimeCardDetails.AttendanceList.length > 0 ? this.TimeCardDetails.AttendanceList : [];
            templist.length > 0 && templist.forEach(element => {
              element['customFromDate'] = this.TimeCardDetails.IsNewJoiner == true ? new Date(this.timecardEditDOJ) : element.FromDate
            }), this.updateAttendanceEvents(templist);


            this.TimeCardDetails.AllowanceList.forEach(e => {
              var _reUpdateAmt = this.LstTimeCardAllowanceProducts.find(a => a.ProductId === e.ProductId);
              _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id, _reUpdateAmt.NewAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
            });

            this.loadingScreenService.stopLoading();
            this.attendance_slider = true;
          }
        }, err => {

        })

    }, err => {

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
          WFHStatus: 0,
        ODStatus: 0,
        },
      })
      // }
      date.push(startDate);
      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
      // }
    }
    return date;
  }


  get g() { return this.AttendForm.controls; } // reactive forms validation 

  createForm() {
    this.AttendForm = this.formBuilder.group({
      Id: [],
      StartDate: [null, Validators.required],
      EndDate: [null, Validators.required],
      isHalfDay: [false],
      AttendanceType: [null],
      AttendanceType_SecondHalf: [null],
      IsFirstHalf: [false],
      IsSecondHalf: [false],
      Action: [''],
    });
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
      console.log('ev', this.AttendForm.value);
      this.refill_attendanceDetails();
      this.modal_dismiss_edit_attendance();
    }
  }

  onChangestartDate(e) {
    (this.AttendForm.controls.StartDate.value != null && this.AttendForm.controls.EndDate.value != null ? (this.isValidDates = (new Date(Date.parse(this.AttendForm.controls.StartDate.value)) <= new Date(Date.parse(this.AttendForm.controls.EndDate.value)) || new Date(Date.parse(this.AttendForm.controls.StartDate.value)) <= new Date(Date.parse(this.AttendForm.controls.EndDate.value))) ? false : true) : this.isValidDates = false);
    this.isCheckSameDate();
  }
  onChangeendDate(e) {
    (this.AttendForm.controls.StartDate.value != null && this.AttendForm.controls.EndDate.value != null ? (this.isValidDates = (new Date(Date.parse(this.AttendForm.controls.StartDate.value)) !== new Date(Date.parse(this.AttendForm.controls.EndDate.value))) ? false : true) : this.isValidDates = false);
    this.isCheckSameDate();
  }
  onChangeSecondHalf(eventValue) {
    this.AttendForm.get('AttendanceType_SecondHalf').setValue(this.AttendForm.get('AttendanceType_SecondHalf').value)
  }

  isCheckSameDate() {
    var startDate = moment(this.AttendForm.controls.StartDate.value).format('YYYY-MM-DD');
    var endDate = moment(this.AttendForm.controls.EndDate.value).format('YYYY-MM-DD');
    this.isSameDate = moment(startDate).isSame(endDate); // true
    // alert(this.isSameDate)


  }
  modal_dismiss_edit_attendance() {
    this.isOpen = false;
    $('#popup_edit_attendance').modal('hide');

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
    this.events.length > 0 && this.events.forEach(element => {
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

          // item.IsSecondDayHalf == false && (ele.FirstHalf = this._AttendanceType.find(a => a.id == item.Type).name);
          // item.IsSecondDayHalf == true && (ele.SecondHalf = this._AttendanceType.find(a => a.id == item.Type).name);

        });
      }


    });
    console.log('ATTENDNACE 1:', this._attendanceDetailsOfEmployee);
    this.attendance_slider = false;

  }

  submitPayroll() {

    if (this.isBulkAction == 'true') {
      this.alertService.confirmSwalWithClose("Are you sure you want to Submit Payroll?", "Submit all list data, including unselected team names", "Yes, Confirm", "No, Marked Team Only").then((result) => {
        // this.loadingScreenService.startLoading();   
        let empObj = [];
        this.TeamList.forEach(element => {
          empObj.push({
            TeamId: element.TeamId
          });
        });
        this.attendanceService.SubmitPayrollInputsSubmissionByTeamId(JSON.stringify(empObj))
          .subscribe((result) => {
            this.alertService.showSuccess("Payroll input record saved successfully")
            this.loadingScreenService.stopLoading();
            // this.onRefresh();
          }, err => {
            this.loadingScreenService.stopLoading();
          })
      }).catch(error => {

        if (this.selectedTeamId == null || this.selectedTeamId.length == 0) {
          this.alertService.showWarning("You have not selected any team name. Please select first.")
          return;
        } else {
          let empObj = [];
          this.selectedTeamId.forEach(element => {
            empObj.push({
              TeamId: element
            });
          });
          this.attendanceService.SubmitPayrollInputsSubmissionByTeamId(JSON.stringify(empObj))
            .subscribe((result) => {
              this.alertService.showSuccess("Payroll input record saved successfully")
              this.loadingScreenService.stopLoading();
              // this.onRefresh();
            }, err => {
              this.loadingScreenService.stopLoading();
            })

        }


      });
    } else {
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
        this._payrollInputSubmission.IsPayrollSubmitted = true;
        this._payrollInputSubmission.IsMigrated == false ? this._payrollInputSubmission.IsMigrated = ((environment.environment.HRRoleCode.includes(this.RoleCode) == true) ? true : false) : null;
        this._payrollInputSubmission.IsMigrated = ((environment.environment.HRRoleCode.includes(this.RoleCode) == true) ? true : false);

        // this._payrollInputSubmission.CreatedBy = Number(this._payrollInputSubmission.CreatedBy) as any;
        // this._payrollInputSubmission.LastUpdatedBy = Number(this._payrollInputSubmission.LastUpdatedBy) as any;
        console.log('this._payrollInputSubmission', this._payrollInputSubmission);
        this.attendanceService.SubmitPayrollInputsSubmission(this._payrollInputSubmission)
          .subscribe((result) => {
            this.alertService.showSuccess("Payroll input record saved successfully");
            this.loadingScreenService.stopLoading();
            this.onRefresh();
          }, err => {
            this.loadingScreenService.stopLoading();
          })
      }).catch(error => {

      });
    }




  }

  // GENERATE PIS BASED SELECTIONS ITEMS FROM THE LIST

  // do_generate_PIS_PostConfirmation() {
  //   this.selectedItems.forEach(i => {
  //     if (i.PVRId == -1) {
  //       i.PVRId = 0;
  //     }
  //   });
  //   console.log(this.selectedItems);
  //   var LstGeneratePIS = [];
  //   this.loadingScreenService.startLoading();
  //   const jobj = new GeneratePIS();
  //   jobj.ClientId = this._payrollInputSubmission.ClientId;
  //   jobj.ClientContractId = this._payrollInputSubmission.ClientContractId;
  //   jobj.EmployeeIds = null;
  //   jobj.TeamIds = [];
  //   jobj.TeamIds.push(this._payrollInputSubmission.TeamId)
  //   jobj.PayPeriodId = 0;
  //   jobj.PISId = 0;
  //   jobj.PVRIds = [];
  //   // this.selectedItems.forEach(function (item) { jobj.PVRIds.push(item.PVRId) });
  //   // jobj.PVRIds = _.union(jobj.PVRIds)
  //   jobj.IsDownloadExcelRequired = true;
  //   jobj.ObjectStorageId = 0;
  //   jobj.RequestedBy = this.UserId;
  //   jobj.RequestedOn = 0;
  //   jobj.GeneratedRecords = 0;
  //   jobj.IsPushrequired = true;
  //   LstGeneratePIS.push(jobj);
  //   var payperiodName = this.selectedItems[0].PayPeriod.substring(0, 3)
  //   const teamNames = [];

  //   var dynoFileName = `PIS_${this.selectedItems[0].ClientName}_${this._payrollInputSubmission.TeamName.join(',')}_${payperiodName}`;
  //   this.payrollService.post_generatePIS(JSON.stringify(this.LstGeneratePIS))
  //     .subscribe((result) => {
  //       console.log('GENERATE PIS RESPONSE ::', result);
  //       const apiResult: apiResult = result;
  //       if (apiResult.Status && apiResult.Result) {
  //         const jsonobj = JSON.stringify(apiResult.Result)
  //         const docsBytes = JSON.parse(jsonobj);
  //         docsBytes[0].docbytes != null && docsBytes[0].docbytes != undefined && this.base64ToBlob(docsBytes[0].docbytes as String, dynoFileName)
  //         docsBytes[0].docbytes != null && docsBytes[0].docbytes != undefined && this.alertService.showSuccess1("PIS generated successfully. (Please note that any employee(s) who are added in payrun will not be included in the PIS)");
  //         docsBytes[0].docbytes == null && this.alertService.showWarning("Data Generation Failed!. Unable to generate the PIS file. Please try again")
  //         this.gridObj.getSelectionModel().setSelectedRows([]);
  //         this.getDataset();
  //         this.selectedItems = [];
  //         this.loadingScreenService.stopLoading();
  //       } else {
  //         this.loadingScreenService.stopLoading();
  //         this.alertService.showWarning(apiResult.Message);
  //       }
  //     });
  // }
  // do_generate_PIS() {
  //   this.LstGeneratePIS = [];
  //   if (this.selectedItems.length > 0) {
  //     var EmployeeCount = [];
  //     EmployeeCount = this.selectedItems.filter(z => z.EmployeeCount == 0);
  //     if (EmployeeCount.length > 0) {
  //       this.alertService.showWarning("There are no active employee list for selected record!");
  //       return;
  //     }
  //     // if (this.dataset.length > 1) {
  //     //   $('#popup_confirmationAlert').modal({
  //     //     backdrop: 'static',
  //     //     keyboard: false,
  //     //     show: true
  //     //   });
  //     // } else {
  //     var isInitiatedRecord = this.selectedItems.find(z => z.PVRStatus == 'Initiated');
  //     if (isInitiatedRecord != undefined) {
  //       this.alertService.showWarning("This request cannot be processed because the PVR Status of one or more selected records is 'Initiated'");
  //       return;
  //     }
  //     this.do_generate_PIS_PostConfirmation();
  //     // }


  //   } else {
  //     this.alertService.showWarning("Cannot proceed to generate PIS action due to empty items. Please select at least one item");
  //     return;
  //   }

  // }

  /* #endregion */
}
