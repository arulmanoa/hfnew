import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { AlertService, SessionStorage } from '@services/service';
import { SessionKeys } from '@services/configs/app.config';
import { LoginResponses } from '@services/model';
import { AttendanceService } from '@services/service/attendnace.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import moment from 'moment';
import { AttendanceCode, BiometricData, ShiftType } from '@services/model/Attendance/BioMetricEnum';
import { Router } from '@angular/router';

@Component({
  selector: 'app-approve-reject-employee-regularization-modal',
  templateUrl: './approve-reject-employee-regularization-modal.component.html',
  styleUrls: ['./approve-reject-employee-regularization-modal.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ApproveRejectEmployeeRegularizationModalComponent implements OnInit {
  
  @Input() data: any;
  modalSpinner: boolean = false;
  attendanceDate: any;
  sessionDetails: LoginResponses;
  roleId: number = 0;
  userId: any = 0;
  employeeId: any = 0;
  roleCode: any;
  existingAttendanceData: any[] = [];
  regularizedAttendanceData: any[] = [];
  existingPunchDetails: BiometricData[] = [];
  regularizedPunchDetails: BiometricData[] = [];
  isBreakShift: boolean = false;
  existingDontShowSplitStatus: boolean = false;
  regularizedDontShowSplitStatus: boolean = false;

  constructor(
    private datePipe: DatePipe,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private attendanceService: AttendanceService,
    private loadingScreenService: LoadingScreenService,
    private router: Router
  ) { }

  ngOnInit() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.userId = this.sessionDetails.UserSession.UserId;
    if (this.data && Object.keys(this.data).length > 0) {
      this.modalSpinner = true;
      this.employeeId = this.data.EmployeeId;
      this.attendanceDate = this.datePipe.transform(this.data.AttendanceDate, 'yyyy-MM-dd');
      this.isBreakShift = this.data.IsBreakShift;
      this.existingDontShowSplitStatus = this.data.OldDontShowSplitStatus == 1 ? true : false;
      this.regularizedDontShowSplitStatus = this.data.NewDontShowSplitStatus == 1 ? true : false;
      this.doFetchData();
    }
  }

  doFetchData() {
    this.attendanceService.get_DetailedTypeRegularizedData(this.employeeId, this.attendanceDate).subscribe(res => {
      if (res.Status && res.Result && res.Result != "" && res.Result.length > 0) {
        this.existingAttendanceData = res.Result.filter(item => item.IsActive === false);
        this.regularizedAttendanceData = res.Result.filter(item => item.IsActive === true);
        this.isBreakShift = this.existingAttendanceData[0].ShiftType == ShiftType.BreakShift ? true : false;
        this.existingAttendanceData.forEach(el => {
          el.AttendanceCode = el.AttendanceCode != null ? el.AttendanceCode : 'Absent';
          el.LstTempEmployeeAttendancePunchInDetails && el.LstTempEmployeeAttendancePunchInDetails.forEach(e => {
            e.PunchInType = e.PunchInType === 0 ? 1 : e.PunchInType;
            e.PunchOutType = e.PunchOutType === 0 ? 2 : e.PunchOutType;
            const punchInObject = e.Starttime ? this.createPunchObject(e.EmployeeId,e.PunchInHalf, e.PunchInType, new Date(e.StartDate), e.Starttime, e.PunchInLocationId, e.PunchInLocationName, e.PunchInDeviceId, e.PunchInDeviceName, e.PunchInRemarks) : {} as any;
            const punchOutObject = e.FinishTime ? this.createPunchObject(e.EmployeeId,e.PunchOutHalf, e.PunchOutType, new Date(e.FinishDate), e.FinishTime, e.PunchOutLocationId, e.PunchOutLocationName, e.PunchOutDeviceId, e.PunchOutDeviceName, e.PunchOutRemarks) : {} as any;
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
            const punchInObject = e.Starttime ? this.createPunchObject(e.EmployeeId,e.PunchInHalf, e.PunchInType, new Date(e.StartDate), e.Starttime, e.PunchInLocationId, e.PunchInLocationName, e.PunchInDeviceId, e.PunchInDeviceName, e.PunchInRemarks) : {} as any;
            const punchOutObject = e.FinishTime ? this.createPunchObject(e.EmployeeId,e.PunchOutHalf, e.PunchOutType, new Date(e.FinishDate), e.FinishTime, e.PunchOutLocationId, e.PunchOutLocationName, e.PunchOutDeviceId, e.PunchOutDeviceName, e.PunchOutRemarks) : {} as any;
            if (punchInObject && Object.keys(punchInObject).length) {
              this.regularizedPunchDetails.push(punchInObject);
            }
            if (punchOutObject && Object.keys(punchOutObject).length) {
              this.regularizedPunchDetails.push(punchOutObject);
            }
          });
        });
        console.log('table--->', this.regularizedPunchDetails, this.existingPunchDetails);
        this.modalSpinner = false;
      } else {
        this.modalSpinner = false;
        this.existingPunchDetails =  [];
        this.regularizedPunchDetails = [];
      }
    }, error => {
      this.modalSpinner = false;
      this.existingPunchDetails =  [];
      this.regularizedPunchDetails = [];
      console.log(error);
      return this.alertService.showWarning(error);
    });
  }

  createPunchObject = (employeeId: any, halfType: number, type: number, date: any, time: any, locationId: any, locationName: any, deviceId: any, deviceName: any, remarks: any)=> {
    const dummyDate = new Date("1970-01-01 " + time);
    let halfTypeString = '';
    if (type == 1) {
      halfTypeString = halfType === 1 ? '1st Half' : halfType === 2 ? '2nd Half' : '';
    } else if (type == 2) {
      halfTypeString = halfType === 1 ? '1st Half' : halfType === 2 ? '2nd Half' : '';
    }
    return {
      EmployeeCode: "0",
      EmployeeId: employeeId,
      AttendanceDate: date,
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

  getShortName(fullName) {
    let name = fullName.replace(/\s/g, "")
    return name.split(' ').map(n => n[0] + n[1]).join('');
  }

  approveRejectRegularizationDetailedType(approvalType: string) {
    const reqIds = this.data.Id.toString();
    const status = approvalType != 'Approve' ? 3 : 2;
    console.log(':::select:::', this.data, reqIds, status);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: approvalType != 'Approve' ? 'btn btn-danger' : 'btn btn-success',
        cancelButton: 'btn btn-default'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: `Are you sure, you want to ${approvalType} ?`,
      text: `you won't be able to revert this action !`,
      type: 'warning',
      animation: false,
      showCancelButton: true, // There won't be any cancel button
      confirmButtonText: approvalType,
      input: 'textarea',
      inputPlaceholder: 'Type your message here...',
      allowEscapeKey: false,
      inputAttributes: {
        autocorrect: 'off',
        autocapitalize: 'on',
        maxlength: '200',
      },
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value.length >= 200) {
          return 'Maximum 200 characters allowed.'
        }
        if (!value && approvalType === "Reject") {
          return 'You need to write something!'
        }
      },

    }).then((inputValue) => {
      if (inputValue.value && inputValue.value != "") {
        this.loadingScreenService.startLoading();
        if (this.router.url.includes('pendingRequestsForApproval')) {
          this.processApprovalForHR(reqIds, this.userId, inputValue.value, status);
        } else {
          this.processApprovalForManager(reqIds, this.userId, inputValue.value, status);
        }
      } else if (inputValue.value == "" && approvalType === "Approve") {
        this.loadingScreenService.startLoading();
        if (this.router.url.includes('pendingRequestsForApproval')) {
          this.processApprovalForHR(reqIds, this.userId, inputValue.value, status);
        } else {
          this.processApprovalForManager(reqIds, this.userId, inputValue.value, status);
        }
      } else if (inputValue.dismiss === Swal.DismissReason.cancel) { }
    });
  }

  processApprovalForManager(reqIds: any, userId: any, inputValue: any, status: number) {
    this.attendanceService.approveRejectRegularation_DetailedType(reqIds, userId, inputValue, status).subscribe(res => {
      this.loadingScreenService.stopLoading();
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.closeModal();
      } else {
        this.alertService.showWarning(res.Message);
        this.closeModal();
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log(error);
      return this.alertService.showWarning(error);
    });
  }

  processApprovalForHR(reqIds: any, userId: any, message: string, status: number) {
    this.loadingScreenService.startLoading();
    this.attendanceService.ApproveRejectRegularizationDetailTypeByHR(reqIds, userId, message, status).subscribe(res => {
      this.loadingScreenService.stopLoading();
      if (res.Status) {
        this.alertService.showSuccess(res.Message);
        this.closeModal();
      } else {
        this.closeModal();
        this.alertService.showWarning(res.Message);
      }
    }, error => {
      this.loadingScreenService.stopLoading();
      console.log(error);
      return this.alertService.showWarning(error);
    });
  }

  formatTimeRange() {
    const formatTime = (timeStr) => {
      const timeArr = timeStr.split(':');
      const date = new Date().setHours(timeArr[0], timeArr[1], timeArr[2]);
      return moment(date).format("h:mm A");
    }

    const start = formatTime(this.data.StartTime);
    const end = formatTime(this.data.EndTime);

    if (this.data.IsBreakShift) {
      const firstHalfEndTime = formatTime(this.data.FirstHalfEndTime);
      const secondHalfStartTime = formatTime(this.data.SecondHalfStartTime);
      return `${start} - ${firstHalfEndTime}, ${secondHalfStartTime} - ${end}`;
    } else {
      return `${start} - ${end}`;
    }
  }

  closeModal() {
    console.log('APPROVE/REJECT DETAIL TYPE REGULARIZATION CLOSED');
    this.activeModal.close('Modal Closed');
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
