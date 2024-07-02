import { DatePipe } from '@angular/common';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionKeys } from '@services/configs/app.config';
import { LoginResponses } from '@services/model';
import { AttendanceConfiguration } from '@services/model/Attendance/AttendanceConfiguration';
import { AttendanceCode, BiometricData, SubmissionType } from '@services/model/Attendance/BioMetricEnum';
import { AlertService, SessionStorage } from '@services/service';
import { AttendanceService } from '@services/service/attendnace.service';
import moment from 'moment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-regularize-attendance-modal',
  templateUrl: './regularize-attendance-modal.component.html',
  styleUrls: ['./regularize-attendance-modal.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class RegularizeAttendanceModalComponent implements OnInit {

  @Input() employeeAttendanceDetails: any;
  @Input() AttendanceConfig: AttendanceConfiguration = new AttendanceConfiguration();
  @Input() attendanceDate: any;
  @Input() shiftDetails: any;
  @Input() employeeBasicDetails: any; // need employee's ID and Code

  sessionDetails: LoginResponses;
  roleId: number = 0;
  userId: any = 0;
  roleCode: any;

  isModalSpinner: boolean = false;
  minDate: Date;
  maxDate: Date;
  calculateAPICalled: boolean = false;
  isBreakShift: boolean = false;
  isShiftSpanAcrossDays: boolean = false;

  shiftPeriodDropDown: any[] = [{
    Id: 1,
    Name: '1st Half'
  }, {
    Id: 2,
    Name: '2nd Half'
  }];
  typeDropDown: any[] = [{
    Id: 1,
    Name: 'Punch in'
  }, {
    Id: 2,
    Name: 'Punch out'
  }];

  dropdownData: any[] = [];
  datesDropdown: any[] = [];

  tableDataForRegularize: BiometricData[] = [];
  employeeId: any;
  totalWorkingHours: number | string = "0.00";
  regularizedWorkingHours: number | string = "0.00";
  employeeOverallRemarks: string = " ";
  attendanceStatus: string | number = "";
  regularizedAttendanceStatus: string | number = "";
  firstHalfAttendanceStatus: string | number = "";
  secondHalfAttendanceStatus: string | number = "";
  firstHalfRegAttendanceStatus: string | number = "";
  secondHalfRegAttendanceStatus: string | number = "";
  firstHalfWorkingHrs: string | number = "";
  secondHalfWorkingHrs: string | number = "";
  firstHalfRegWorkingHrs: string | number = "";
  secondHalfRegWorkingHrs: string | number = "";
  punchInOutDetails = [];
  existingData: any;
  regularizedData: any;
  dontShowSplitStatus: boolean = false;
  
  constructor(
    public sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private loadingScreenService: LoadingScreenService,
    private datePipe: DatePipe
  ) { }

  ngOnInit() {
    this.isModalSpinner = true;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.userId = this.sessionDetails.UserSession.UserId;
    console.log("----INSIDE REGULARIZE MODAL----", this);
    this.minDate = new Date(this.attendanceDate);
    this.maxDate = new Date(this.attendanceDate);
    this.maxDate.setDate(this.maxDate.getDate() + 1);
    this.datesDropdown = [{
      Id: this.datePipe.transform(this.minDate, 'yyyy-MM-dd'),
      Name: this.datePipe.transform(this.minDate, 'dd MMM yyyy')
    }, {
      Id: this.datePipe.transform(this.maxDate, 'yyyy-MM-dd'),
      Name: this.datePipe.transform(this.maxDate, 'dd MMM yyyy')
    }];
    this.employeeId = this.employeeBasicDetails ? this.employeeBasicDetails.Id : 0;
    this.isBreakShift = this.shiftDetails ? this.shiftDetails.IsBreakShift : false;
    this.isShiftSpanAcrossDays = this.shiftDetails ? this.shiftDetails.IsShiftSpanAcrossDays : false;
    // load location data if exists
    if (this.AttendanceConfig.IsLocationToBeDisplayed) {
      this.loadLocationData();
    }
    // load shifts details when there is no data
    if (this.shiftDetails && this.shiftDetails.length == 0) {
      this.getShiftDetailsForEmployee(this.attendanceDate, this.attendanceDate);
    }
    // get total working hours
    if (this.employeeAttendanceDetails.meta.breakupObject) {
      this.existingData = this.employeeAttendanceDetails.meta.breakupObject;
      this.dontShowSplitStatus = this.employeeAttendanceDetails.meta.breakupObject.DontShowSplitStatus ? this.employeeAttendanceDetails.meta.breakupObject.DontShowSplitStatus : false;
      this.totalWorkingHours = this.employeeAttendanceDetails.meta.breakupObject.DayHoursConsidered ? 
        this.getTotalWorkingHoursInHoursMinuteFormat(this.employeeAttendanceDetails.meta.breakupObject.DayHoursConsidered) : "0:00";
      this.attendanceStatus = this.employeeAttendanceDetails.meta.breakupObject.AttendanceCode ? this.employeeAttendanceDetails.meta.breakupObject.AttendanceCode : "Absent";
      if (this.employeeAttendanceDetails.meta.breakupObject.IsHoliday && this.employeeAttendanceDetails.meta.breakupObject.AttendanceCode == AttendanceCode.Absent) {
        this.regularizedAttendanceStatus = 'Holiday';
      } else if (this.employeeAttendanceDetails.meta.breakupObject.IsWeekOff && this.employeeAttendanceDetails.meta.breakupObject.AttendanceCode == AttendanceCode.Absent) {
        this.regularizedAttendanceStatus = 'WeekOff';
      }

      if (this.isBreakShift)  {
        this.firstHalfAttendanceStatus = Number(this.employeeAttendanceDetails.meta.breakupObject.FirstHalfAttendanceCode) != 0 ? AttendanceCode[this.employeeAttendanceDetails.meta.breakupObject.FirstHalfAttendanceCode] : "Absent";
        this.secondHalfAttendanceStatus = Number(this.employeeAttendanceDetails.meta.breakupObject.SecondHalfAttendanceCode) != 0 ? AttendanceCode[this.employeeAttendanceDetails.meta.breakupObject.SecondHalfAttendanceCode] : "Absent";
        if (this.employeeAttendanceDetails.meta.breakupObject.IsHoliday && this.employeeAttendanceDetails.meta.breakupObject.FirstHalfAttendanceCode == AttendanceCode.Absent) {
          this.firstHalfAttendanceStatus = 'Holiday';
        } else if (this.employeeAttendanceDetails.meta.breakupObject.IsWeekOff && this.employeeAttendanceDetails.meta.breakupObject.FirstHalfAttendanceCode == AttendanceCode.Absent) {
          this.firstHalfAttendanceStatus = 'WeekOff';
        }
        if (this.employeeAttendanceDetails.meta.breakupObject.IsHoliday && this.employeeAttendanceDetails.meta.breakupObject.SecondHalfAttendanceCode == AttendanceCode.Absent) {
          this.secondHalfAttendanceStatus = 'Holiday';
        } else if (this.employeeAttendanceDetails.meta.breakupObject.IsWeekOff && this.employeeAttendanceDetails.meta.breakupObject.SecondHalfAttendanceCode == AttendanceCode.Absent) {
          this.secondHalfAttendanceStatus = 'WeekOff';
        }
        this.firstHalfWorkingHrs = this.employeeAttendanceDetails.meta.breakupObject.FirstHalfHoursConsidered ? 
        this.getTotalWorkingHoursInHoursMinuteFormat(this.employeeAttendanceDetails.meta.breakupObject.FirstHalfHoursConsidered) : "0:00";
        this.secondHalfWorkingHrs = this.employeeAttendanceDetails.meta.breakupObject.SecondHalfHoursConsidered ? 
        this.getTotalWorkingHoursInHoursMinuteFormat(this.employeeAttendanceDetails.meta.breakupObject.SecondHalfHoursConsidered) : "0:00";
      }
    }
    
    this.loadDataForEmployee();
  }

  loadDataForEmployee() {
    // to check if delete option punch is required for the loggedin client
    const isShowDeleteBtn = environment.environment.ClientsNotRequiredDeleteForBiometricPunchesInRegularize && environment.environment.ClientsNotRequiredDeleteForBiometricPunchesInRegularize.includes(this.shiftDetails.ClientId) ? false : true;
    // get existing data
    const generatePunchObject = (halfType: number, type: number, date: any, time: any, locationId: any, deviceId: any, deviceName: any, remarks: any) => {
      try {
        const dummyDate = new Date("1970-01-01 " + time);
        return {
          EmployeeCode: this.employeeBasicDetails.Code,
          EmployeeId: this.employeeBasicDetails.Id,
          AttendanceDate: date ? `${this.datePipe.transform(date, 'yyyy-MM-dd')}` : this.attendanceDate,
          Type: type,
          Half_Type: halfType ? halfType : 0,
          Time: this.datePipe.transform(dummyDate, 'HH:mm:ss.SSS'),
          In_Time: time,
          LocationId: this.AttendanceConfig.IsLocationToBeDisplayed ? (locationId ? locationId : 0) : 0,
          BiometricDeviceId: this.AttendanceConfig.IsMachineNameToBeDisplayed ? (deviceId ? deviceId : '0') : '0',
          BioMetricDeviceName: deviceName ? deviceName : '',
          Remarks: this.AttendanceConfig.IsRemarksToBeDisplayedForEachEntry ? (remarks ? remarks : '') : '',
          isPunchInOutEditable: false,
          isDeleteAllowed: isShowDeleteBtn ? this.isTimeBeforeAndAfterShift(time, this.shiftDetails, halfType) : false
        };
      } catch (error) {
        console.log(error);
      }
    };

    const processPunchInOutDetails = (punchInOutDetails) => {
      punchInOutDetails.forEach(e => {
        e.PunchInType = e.PunchInType === 0 ? 1 : e.PunchInType;
        e.PunchOutType = e.PunchOutType === 0 ? 2 : e.PunchOutType;
        const punchInObject = e.Starttime ? generatePunchObject(e.PunchInHalf, e.PunchInType, new Date(e.StartDate), e.Starttime, e.PunchInLocationId, e.PunchInDeviceId, e.PunchInDeviceName, e.PunchInRemarks) : {} as any;
        const punchOutObject = e.FinishTime ? generatePunchObject(e.PunchOutHalf, e.PunchOutType, new Date(e.FinishDate), e.FinishTime, e.PunchOutLocationId, e.PunchOutDeviceId, e.PunchOutDeviceName, e.PunchOutRemarks) : {} as any;
        if (Object.keys(punchInObject).length) this.tableDataForRegularize.push(punchInObject);
        if (Object.keys(punchOutObject).length) this.tableDataForRegularize.push(punchOutObject);
      });
      this.punchInOutDetails = JSON.parse(JSON.stringify(this.tableDataForRegularize));
      if (this.tableDataForRegularize && this.tableDataForRegularize.length == 0) {
        this.addRowInTable();
      }
      this.isModalSpinner = false;
      console.log('TABLE DATA', this.punchInOutDetails, this.tableDataForRegularize);
    };
    if (this.employeeAttendanceDetails.meta.breakupObject) {
      if (this.employeeAttendanceDetails.meta.breakupObject.LstEmployeeAttendancePunchInDetails && this.employeeAttendanceDetails.meta.breakupObject.LstEmployeeAttendancePunchInDetails.length) {
        processPunchInOutDetails([...this.employeeAttendanceDetails.meta.breakupObject.LstEmployeeAttendancePunchInDetails]);
      } else if (this.employeeAttendanceDetails.meta.breakupObject.LstPunches && this.employeeAttendanceDetails.meta.breakupObject.LstPunches.length) {
        processPunchInOutDetails([...this.employeeAttendanceDetails.meta.breakupObject.LstPunches]);
      } else {
        this.addRowInTable();
        this.isModalSpinner = false;
      }
    } else {
      this.addRowInTable();
      this.isModalSpinner = false;
    }
  }

  loadDataForManagers() {

  }

  loadLocationData() {
    this.dropdownData = [];
    this.attendanceService.getClientLocationByEmployeeId(this.employeeId).subscribe((response) => {
      if (response.Status && response.Result != null && response.Result != "") {
        const parsedResult = JSON.parse(response.Result);
        this.dropdownData = [...parsedResult];
      } else {
        console.error('ERROR IN getClientLocationByEmployeeId API -->', response);
      }
    }, err => {
      console.error('ERROR IN getClientLocationByEmployeeId API -->', err);
    });
  }

  addRowInTable() {
    this.tableDataForRegularize.push({
      EmployeeCode: this.employeeBasicDetails.Code,
      EmployeeId: this.employeeBasicDetails.Id,
      AttendanceDate: this.attendanceDate,
      Time: '',
      In_Time: '',
      LocationId: 0,
      BiometricDeviceId: '0',
      BioMetricDeviceName: '',
      Type: 1,
      Half_Type: this.isBreakShift ? 1 : 0,
      Remarks: '',
      isPunchInOutEditable: true,
      isDeleteAllowed: true
    });
  }

  editInTable(idx: number) {}

  deleteInTable(index: number) {
    this.tableDataForRegularize.splice(index, 1);
  }

  closeEmployeeRegularizePopup(data: any) {
    this.activeModal.close(data);
  }

  cancelConfirmModal() {
    this.isModalSpinner = true;
    this.calculateAPICalled = false;
    this.isModalSpinner = false;
  }

 async confirmEmployeeRegularize() {
    this.isModalSpinner = true;
    try {
      if (this.calculateAPICalled) {
        await this.doConfirmRegularize();
      } else {
        await this.doCalculateRegularizeData();
      }
    } catch (error) {
      console.error('Error in doSubmitRegularizedAttendance -->', error);
      this.isModalSpinner = false;
    }
  }
  
  async doConfirmRegularize() {
    let submissionType = this.AttendanceConfig.IsApprovalRequiredForEmployeeRegularization ? SubmissionType.RegularizationByEmployeeWithApprovalRequired : SubmissionType.RegularizationByEmployee;
    if (this.roleCode != 'Employee') {
      submissionType = SubmissionType.RegularizationByHRWithNoApprovalRequired;
    }
    await this.doSubmitRegularizedAttendance(submissionType, this.employeeOverallRemarks);
    return this.closeEmployeeRegularizePopup(this.tableDataForRegularize);
  }
  
  async doCalculateRegularizeData() {
    // check mandatory data is present
    const data = this.checkDataHasValue();
  
    if (data && data.length > 0) {
      this.isModalSpinner = false;
      return this.alertService.showWarning("Please enter time and/or location !");
    }
    // check for changes
    const arraysAreSame = this.compareArrays(this.punchInOutDetails, this.tableDataForRegularize);
  
    if (arraysAreSame) {
      this.isModalSpinner = false;
      return this.alertService.showWarning("No changes made !");
    }
    // check punch in /punch out
    console.log('$$$$', this.tableDataForRegularize);
    // to check if corresponding punch out check is required for the loggedin client
    const isCheckNeededForPunchOut = environment.environment.ClientsNotAllowedToCheckCorrespondingPunchOutInRegularize && environment.environment.ClientsNotAllowedToCheckCorrespondingPunchOutInRegularize.includes(this.shiftDetails.ClientId) ? false : true;
    let hasCorrespondingCheckout = this.hasCorrespondingPunchOut(this.tableDataForRegularize);
    
    if (isCheckNeededForPunchOut && !hasCorrespondingCheckout.status) {
      this.isModalSpinner = false;
      return this.alertService.showWarning(hasCorrespondingCheckout.message);
    }
  
    
  
    this.tableDataForRegularize.forEach(el => {
      const timestamp = new Date(el.AttendanceDate);
      let [hours, minutes, seconds] = el.Time.split(':').map(Number);
      if (isNaN(seconds)) {
        seconds = 0;
      }
      timestamp.setHours(hours, minutes, seconds, 0);
      const date = new Date(timestamp);
      el.In_Time = moment(date).format("YYYY-MM-DD HH:mm:ss");
      el.BiometricDeviceId = el.BiometricDeviceId.toString();
      el.LocationId = Number(el.LocationId);
    });
    await this.doSubmitRegularizedAttendance(SubmissionType.CalculateWorkingHoursAndAttendanceStatus, "");
    this.isModalSpinner = false;
  }

  doSubmitRegularizedAttendance = async (submissionType: SubmissionType, remarks: string) => {
    const breakUpDetails = JSON.stringify(this.employeeAttendanceDetails.meta.breakupObject);
    // Iterate over each object to trim whitespace
    this.tableDataForRegularize.forEach((item) => {
      item.Remarks = item.Remarks.trim();
    });
    const biometricData = [...this.tableDataForRegularize];
    try {
      const res = await this.attendanceService.regularizeAttendanceForDetailedType(biometricData, submissionType, remarks.trim(), this.userId, this.employeeId, this.attendanceDate).toPromise();
      console.log(res);
      if (res.Status && res.Result != null && res.Result != "") {
        this.calculateAPICalled = true;
        this.regularizedData = res.Result;
        this.regularizedAttendanceStatus = res.Result.DayTempAttendanceCode ? AttendanceCode[res.Result.DayTempAttendanceCode] : "Absent";
        if (res.Result.IsHoliday && res.Result.DayTempAttendanceCode == AttendanceCode.Absent) {
          this.regularizedAttendanceStatus = 'Holiday';
        } else if (res.Result.IsWeekOff && res.Result.DayTempAttendanceCode == AttendanceCode.Absent) {
          this.regularizedAttendanceStatus = 'WeekOff';
        }
        this.regularizedWorkingHours = res.Result.DayHoursConsidered ? this.getTotalWorkingHoursInHoursMinuteFormat(res.Result.DayHoursConsidered) : "0.00";
        if (this.isBreakShift)  {
          this.firstHalfRegAttendanceStatus = AttendanceCode[res.Result.FirstHalfTempAttendanceCode];
          this.secondHalfRegAttendanceStatus = AttendanceCode[res.Result.SecondHalfTempAttendanceCode];

          if (res.Result.IsHoliday && res.Result.FirstHalfTempAttendanceCode == AttendanceCode.Absent) {
            this.firstHalfRegAttendanceStatus = 'Holiday';
          } else if (res.Result.IsWeekOff && res.Result.FirstHalfTempAttendanceCode == AttendanceCode.Absent) {
            this.firstHalfRegAttendanceStatus = 'WeekOff';
          } 
          if (res.Result.IsHoliday && res.Result.SecondHalfTempAttendanceCode == AttendanceCode.Absent) {
            this.secondHalfRegAttendanceStatus = 'Holiday';
          } else if (res.Result.IsWeekOff && res.Result.SecondHalfTempAttendanceCode == AttendanceCode.Absent) {
            this.secondHalfRegAttendanceStatus = 'WeekOff';
          }

          this.firstHalfRegWorkingHrs = res.Result.FirstHalfHoursConsidered ? this.getTotalWorkingHoursInHoursMinuteFormat(res.Result.FirstHalfHoursConsidered) : "0:00";
          this.secondHalfRegWorkingHrs = res.Result.SecondHalfHoursConsidered ? this.getTotalWorkingHoursInHoursMinuteFormat(res.Result.SecondHalfHoursConsidered) : "0:00";
        }
      } else {
        this.calculateAPICalled = false;
        if (!res.Status && res.Message == 'Regularisation request already exists for the selected date') {
          this.closeEmployeeRegularizePopup('Modal Closed');
        }
        res.Status ? this.alertService.showSuccess(res.Message) : this.alertService.showWarning(res.Message);
        console.log('ERROR IN regularizeAttendanceForDetailedType API -->', res);
      }
    } catch (err) {
      this.calculateAPICalled = false;
      console.error('ERROR IN regularizeAttendanceForDetailedType API -->', err);
    }
  }

  // Function to check if a "punchin" has a corresponding "punchout"
  hasCorrespondingPunchOut(entryList: BiometricData[]) {
    // const checkInEntries = [];
    // for (const entry of entryList) {
    //   const datetimeString = `${entry.AttendanceDate }T${entry.Time}`;
    //   entry.In_Time = new Date(datetimeString);
    //   if (entry.Type === 1) {
    //     checkInEntries.push(entry);
    //   } else if (entry.Type === 2) {
    //     if (checkInEntries.length === 0) {
    //       const errorMessage = `No corresponding Punch in entry found for ${this.datePipe.transform(entry.AttendanceDate, 'dd MMM yyyy')} - ${entry.Time}`;
    //       return { status: false, message: errorMessage }; // No corresponding "punchin" found for "punchout"
    //     }
    //     const lastCheckIn = checkInEntries.pop();
    //     if (new Date(entry.In_Time) < new Date(lastCheckIn.In_Time)) {
    //       const errorMessage = `Punchout timestamp is earlier than Punchin timestamp for ${this.datePipe.transform(entry.AttendanceDate, 'dd MMM yyyy')} - ${entry.Time}`;
    //       return { status: false, message: errorMessage }; // "punchout" timestamp is earlier than "punchin" timestamp
    //     }
    //   }
    // }
     // return { status: checkInEntries.length === 0, message: 'No corresponding Punch out entry found' } // All "punchin" entries have corresponding "punchout"

    const punchInEntries = entryList.filter(entry => entry.Type === 1);
    const punchOutEntries = entryList.filter(entry => entry.Type === 2);

    if (punchInEntries.length < punchOutEntries.length) {
      return { status: false, message: 'No corresponding Punch in entry found' }
    } else if (punchInEntries.length > punchOutEntries.length) {
      return { status: false, message: 'No corresponding Punch out entry found' }
    } 
    return { status: punchInEntries.length === punchOutEntries.length, message: 'No corresponding Punch in / Punch out entry found' }
  }

  formatTimeRange() {
    const formatTime = (timeStr: any) => {
      const timeArr = timeStr.split(':');
      const date = new Date().setHours(timeArr[0], timeArr[1], timeArr[2]);
      return moment(date).format("h:mm A");
    }

    const start = formatTime(this.shiftDetails.StartTime);
    const end = formatTime(this.shiftDetails.EndTime);

    if (this.shiftDetails.IsBreakShift) {
      const firstHalfEndTime = formatTime(this.shiftDetails.FirstHalfEndTime);
      const secondHalfStartTime = formatTime(this.shiftDetails.SecondHalfStartTime);
      return `${start} - ${firstHalfEndTime}, ${secondHalfStartTime} - ${end}`;
    } else {
      return `${start} - ${end}`;
    }
  }

  onChangeAttdDate(e: any) {
    console.log('date --->' , e);
  }

  compareArrays(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      return false; // Arrays have different lengths
    }
  
    for (let i = 0; i < arr1.length; i++) {
      const obj1 = arr1[i];
      const obj2 = arr2[i];
  
      // Compare the properties of the two objects
      for (const key in obj1) {
        if (obj1[key] !== obj2[key]) {
          return false; // Objects have different values
        }
      }
    }
  
    return true; // Arrays are the same
  }

  isTimeBeforeAndAfterShift(time: any, shiftDetails: any, halfType? : number | string): boolean {
    const shiftStartTime = new Date(`1970-01-01T${shiftDetails.StartTime}`);
    const shiftEndTime = new Date(`1970-01-01T${shiftDetails.EndTime}`);
    const firsthalfEndTime = new Date(`1970-01-01T${shiftDetails.FirstHalfEndTime}`);
    const secondHalfStartTime = new Date(`1970-01-01T${shiftDetails.SecondHalfStartTime}`);
    const checkTime = new Date(`1970-01-01T${time}`);

    if (shiftDetails.IsShiftSpanAcrossDays) {
      return checkTime < shiftStartTime && checkTime > shiftEndTime
    } else {
      return checkTime < shiftStartTime || checkTime > shiftEndTime;
    }
    // if (this.isBreakShift) {
    //   if (halfType == 1) {
    //     return checkTime < shiftStartTime || checkTime > firsthalfEndTime
    //   }
  
    //   if (halfType == 2) {
    //     return checkTime < secondHalfStartTime || checkTime > shiftEndTime;
    //   }

    // } else {
    //   if (shiftDetails.IsShiftSpanAcrossDays) {
    //     return checkTime < shiftStartTime && checkTime > shiftEndTime
    //   } else {
    //     return checkTime < shiftStartTime || checkTime > shiftEndTime;
    //   }
    // }
  }

  checkDataHasValue() {
    return this.tableDataForRegularize.filter(item => {
      return (item.isPunchInOutEditable === true && (item.Time == "" || (Number(item.BiometricDeviceId) == 0 && item.LocationId == 0)));
    });
  }

  checkAttendanceStatus(data: any, str: string) {
    // const searchTerm = "Present";
    const searchTerms = ["Present", "SHP", "FHP", "HP", "POW", "HPOW", "Half Day Present", "HalfADayPresent", "HalfDayPresent"];
    if (str && searchTerms.some(term => str.indexOf(term) !== -1)) {
      return 'Present';
    } else if (data.IsHoliday && str == 'Absent') {
      return 'Holiday';
    } else if (data.IsWeekOff && str == 'Absent') {
      return 'WeekOff'
    } else if (str === '') {
      return 'Absent';
    } else {
      return str;
    }
  }

  getShiftDetailsForEmployee(periodFrom, periodTo) {
    const startPeriod = moment(periodFrom).format('MM-DD-YYYY');
    const endPeriod = moment(periodTo).format('MM-DD-YYYY'); 
    this.attendanceService.GetShiftDetailsForEmployee(this.employeeId, startPeriod, endPeriod).subscribe((response) => {
      if (response.Status && response.Result != null && response.Result != "") {
        const parsedResult = JSON.parse(response.Result);
        const { TDate, ShiftId, WSD } = parsedResult[0];
        const newObj = {
          TDate,
          ShiftId,
          ...WSD[0] 
        };
        this.shiftDetails = newObj;
      } else {
        console.error('ERROR IN GetShiftDetailsForEmployee API -->', response);
      }
    }, err => {
      console.error('ERROR IN GetShiftDetailsForEmployee API -->', err);
    });
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
