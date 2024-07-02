import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
import { ActivatedRoute, Router } from '@angular/router';;
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { Subject } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, ExcelService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { environment } from 'src/environments/environment';
import { EntitlementAvailmentRequest } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { EmployeeAttendanceDetails } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { EntitlementRequestStatus } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { AttendanceConfiguration } from 'src/app/_services/model/Attendance/AttendanceConfiguration';
import { RowDataService } from '../../personalised-display/row-data.service';


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
  empty: {
    primary: '#ffffff',
    secondary: '#ffffff',
  }
};

export enum EmailNotification {
  threeDaysNotification = 1,
  sixDaysNotification = 2,
  pendingNotification = 3
}

@Component({
  selector: 'app-attendance-base-report',
  templateUrl: './attendance-base-report.component.html',
  styleUrls: ['./attendance-base-report.component.scss']
})
export class AttendanceBaseReportComponent implements OnInit {

  // static data
  AttendanceCycleList: any[] = [];
  IsMusterroll: boolean = true;
  toShown: boolean = false;
  spinner: boolean = false;
  emailNotification = EmailNotification;

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  employeeId: any;
  RoleCode: any;

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
  attendance_header: any[] = [];
  attendance_actualData: any = [];
  attendanceObject: any;
  employeeAttendanceDetails: EmployeeAttendanceDetails = new EmployeeAttendanceDetails();

  weekOffs: any[] = [];
  excludeDays: number[] = [];
  IsOpenAttendancePeriod: boolean = false;
  PresentAttendancePeriodId: number = 0;
  refreshing_table_spinner: boolean = false;
  IsEmptyEmployeeList: boolean = false;
  _clientId: any;
  clientID: any;
  clientContractId: number = 0;
  attendancePeriodId: any;
  searchText: string = '';
  regularizationData: any;
  selectedValues : any;


  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private excelService: ExcelService,
    private rowDataService: RowDataService
  ) { }


  ngOnInit() {
    this.onRefresh();
  }

  onRefresh() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.employeeId = this.sessionDetails.EmployeeId;
    this.clientID = this.sessionDetails.ClientList.length > 0 ? this.sessionDetails.ClientList[0].Id as any : 0;
        
    this.IsOpenAttendancePeriod = false;
    this.IsEmptyEmployeeList = false;
    this.spinner = true;
    this.titleService.setTitle('Employee Attendance Entries');
    const rowdata = this.rowDataService.dataInterface.RowData;
    
    if (rowdata) {
      this.selectedValues = rowdata.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
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
      this.GetRegularizationAttendanceData().then((result) => {
        if (result != null) {
          console.log('PROMISE RESOLVE ::', result);
        }
      })

    } else {
      this.spinner = false;
      this.loadingScreenService.stopLoading();
      this.alertService.showInfo('No records found!');
      return this.onClose();
    }
  }

  private GetRegularizationAttendanceData() {
    const promise = new Promise((res, rej) => {
      this.refreshing_table_spinner = true;
      const { '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@StartDate': startDate, '@EndDate': endDate} = this.selectedValues;
      this.attendanceService.GetMonthlyAttendanceReportForITCClient( this.UserId, this.RoleId, districtId, branchId, distributorId, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'))
        .subscribe((result) => {
          console.log('result', result);
          try {
            let apiresult: apiResult = result;

            if (apiresult.Status && apiresult.Result != null) {
              this.mapAttendacePeriodData(apiresult.Result);
              res(true);
            } else {
              res(null);
              this.alertService.showWarning(apiresult.Message);
              this.onClose();
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
      this.loadingScreenService.stopLoading();
      this.alertService.showInfo('No records found!');
      return this.onClose();
    }


    this._attendancePeriods = this.regularizationData;
    this._clientId = this.clientID;

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
    
    this.attendance_actualData = [];
    this.attendance_actualData.length = 0;
    this.attendance_actualData = this.regularizationData.map(e => {
      const attendances = e.Attendance || [];
      // ! FOR ITC
      const updatedAttendances = attendances.filter(a => a.ARD_ID > 0 && a.ARD_Status === 1)
      .map(a => ({...a, FirstHalf: "R", SecondHalf: "R"}));
      return {...e, Attendance: updatedAttendances};
    });
   

    this.attendance_actualData = this.regularizationData;
    console.log('TABLE DATA ::', this.attendance_actualData);
    console.log('TABLE HEADER DATA ::', this.attendance_header);
    this.getmissingday(this.attendance_actualData);
    this.attendance_actualData.forEach(element => {
      if (element.Attendance && element.Attendance.length) {
        element.Attendance.forEach(a => {
          if (a.ARD_ID > 0 && a.ARD_Status === 1) {
            a.FirstHalf= "R";
            a.SecondHalf = "R";
          }
        });
      }
      element['LocationName'] = element.WorkLocation != null && element.WorkLocation.length > 0 ? element.WorkLocation[0].LocationName : null;
      element['isSelected'] = false;
    });
    this.toShown = true;
    this.spinner = false;
    this.refreshing_table_spinner = false;
  }

  getmissingday(emparray) {
    for (const e of emparray) {
      if (e.Attendance !== null) {
        const tempitems = [];
        const formattedDates = this.attendance_header.map(el => moment(el.date).format('YYYY-MM-DD'));
    
        for (const date of formattedDates) {
          if (!e.Attendance.some(a => moment(a.AttendanceDate).format('YYYY-MM-DD') === date)) {
            const obj = {
              AttendanceDate: moment(date).format(),
              FirstHalf: "EMPTY",
              FirstHalfApplied: "EMPTY",
              IsWeekOff: false,
              SecondHalf: "EMPTY",
              SecondHalfApplied: "EMPTY",
              Status: 50,
              isHoliday: false,
              IsHoliday: 0
            };
            tempitems.push(obj);
          }
        }
    
        e.Attendance = e.Attendance.concat(tempitems).sort((a, b) => {
          return moment(a.AttendanceDate).valueOf() - moment(b.AttendanceDate).valueOf();
        });
      }
    }
    
    console.log('emparray', emparray);
    
  }

  onClose() {
    this.rowDataService.dataInterface.RowData = null;
    this.router.navigateByUrl('app/listing/ui/attendanceBaseReport');
  }

  export() {
    var string = 'AttendanceBaseReport_';
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

          } else if (elem.IsWeekOff && !elem.IsHoliday) {
            my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = `
            ${elem.IsWeekOff && elem.FirstHalf && elem.FirstHalf !== '' && elem.FirstHalf == elem.SecondHalf
                && elem.FirstHalf != null ? ` WO | ${elem.FirstHalf}` : `WO`}`;

          } else if (elem.IsWeekOff && elem.IsHoliday) {
            my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = `
            ${elem.IsWeekOff && elem.IsHoliday && elem.FirstHalf && elem.FirstHalf == elem.SecondHalf
                && elem.FirstHalf !== '' && elem.FirstHalf != null ? ` WO | H | ${elem.FirstHalf}` : `WO | H`}`;
          } else {
            my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = elem.IsWeekOff == true ? 'WO' : `${elem.FirstHalf}  
          
            ${elem.SecondHalf != elem.FirstHalf && elem.SecondHalf != null ? ` | ${elem.SecondHalf}` : ``}`;
          }

          // to remove white space, line breaks
          my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')] = my_obj[moment(elem.AttendanceDate).format('DD-MM-YYYY')].replace(/(?:\r\n\s|\r|\n|\s)/g, '');

        });
      }

      exportExcelDate.push({
        DistrictCode: element.DistrictCode,
        BranchCode: element.BranchCode,
        DistributorCode: element.DistributorCode,
        PSRId: element.PSRId,
        EmployeeName: element.EmployeeName,
        DOJ: element.DOJ,
        Manager: element.ManagerName,
        ManagerEmailId: element.LocationName,
        ActiveStatus: element.EmployeeStatus,
        LeaveBalance: element.LeaveBalance,
        ...my_obj,
        TotalDays: element.TotalDays,
        WeekOff: element.WeeklyOff,
        Holiday: element.Holiday,
        TotalWorkingDays: element.TotalWorkingDays,
        TotalDaysPresent: element.Present,
        TotalDaysAbsent: element.LOP,
        DaysLeaveApplied: element.LeaveDays,
        DaysRegularized: element.RegularizationDays,
        TotalPayableDays: element.TotalPayableDays,
        percentagePresent: element.PresentPercentage,
        DSStatus: element.Status
      });
    });
    console.log('my object', exportExcelDate);
    this.excelService.exportAsExcelFile(exportExcelDate, trimmedString);
  }

  getUniqueListBy(arr, key) {
    const map = new Map();
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];
      map.set(item[key], item);
    }
    return Array.from(map.values());
  }

  exportDynamicDataToExcel() {
    let string = 'AttendanceBaseReport_';
    const length = 30;
    const trimmedString = string.substring(0, length);

    let exportArr = [];
    let exportObj = {};
    const excelArray = JSON.parse(JSON.stringify(this.attendance_actualData));
    const excelHeaders: string[] = excelArray.flatMap(x => Object.keys(x));
    let excelValues: any = excelArray.flatMap(o => Object.keys(o).map(k => o[k]));


    for (let i = 0; i < excelHeaders.length; i++) {
      exportObj[excelHeaders[i]] = excelValues[i];
      exportArr.push(exportObj);
    }


    console.log('UNIQ', this.getUniqueListBy(exportArr, 'Id'));
    const exportExcelDate = this.getUniqueListBy(exportArr, 'Id').map(element => {
      const my_obj = {};

      if (element.Attendance) {
        element.Attendance.forEach((elem) => {
          if (!elem.FirstHalf || elem.FirstHalf === 'EMPTY') {
            elem.FirstHalf = '';
          }
          if (!elem.SecondHalf || elem.SecondHalf === 'EMPTY') {
            elem.SecondHalf = '';
          }

          const attendanceDate = moment(elem.AttendanceDate).format('DD-MM-YYYY');
          const isFirstHalfSameAsSecondHalf = elem.FirstHalf === elem.SecondHalf && elem.FirstHalf !== '' && elem.FirstHalf != null;

          if (elem.IsHoliday && !elem.IsWeekOff) {
            my_obj[attendanceDate] = ` ${elem.IsHoliday && isFirstHalfSameAsSecondHalf ? ` H | ${elem.FirstHalf}` : `H`}`;
          } else if (elem.IsWeekOff) {
            if (elem.IsHoliday) {
              my_obj[attendanceDate] = `${isFirstHalfSameAsSecondHalf ? ` WO | H | ${elem.FirstHalf}` : `WO | H`}`;
            } else {
              my_obj[attendanceDate] = `${isFirstHalfSameAsSecondHalf ? ` WO | ${elem.FirstHalf}` : `WO`}`;
            }
          } else {
            const secondHalfString = elem.SecondHalf !== elem.FirstHalf && elem.SecondHalf != null ? ` | ${elem.SecondHalf}` : ``;
            my_obj[attendanceDate] = elem.IsWeekOff ? 'WO' : `${elem.FirstHalf}${secondHalfString}`;
          }

          // to remove white space, line breaks
          my_obj[attendanceDate] = my_obj[attendanceDate].replace(/(?:\r\n\s|\r|\n|\s)/g, '');
        });
      }

      return {
        element,
        ...my_obj,
      };
    });
    console.log('my object', exportExcelDate);
    this.excelService.exportAsExcelFile(exportExcelDate, trimmedString);
  }

  HasFirstHalfProp(item) {
    return (item.hasOwnProperty('FirstHalf') == true && item.hasOwnProperty('SecondHalf') == true) ? true : false
  }

  // FOR ITC
  doTriggerNotification(type: EmailNotification) {
    console.log('inside trigger email fn', type);
    this.loadingScreenService.startLoading();
    this.attendanceService.sendAttendanceReminderMails(this.UserId, type).subscribe((result: any) => {
      console.log('sendAttendanceReminderMails API', result);
      this.loadingScreenService.stopLoading();
      if (result.Status) {
        this.alertService.showSuccess('Email Notification Sent !');
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log('error in sendAttendanceReminderMails API', error);
    });
  }
}
