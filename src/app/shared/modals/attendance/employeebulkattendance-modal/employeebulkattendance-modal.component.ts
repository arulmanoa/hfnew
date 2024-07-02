import { Component, OnInit, Input } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { AlertService, PayrollService } from 'src/app/_services/service';
import { apiResult } from 'src/app/_services/model/apiResult';
import * as _ from 'lodash';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EmployeeAttendanceDetails, SubmitAttendanceUIModel, SubmitRegularizedAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AttendanceBreakUpDetailsStatus, EmployeeAttendancModuleProcessStatus } from 'src/app/_services/model/Attendance/AttendanceEnum';
import { EntitlementType } from 'src/app/_services/model/Attendance/LeaveEnum';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeleaverequestModalComponent } from '../../leaveManagement/employeeleaverequest-modal/employeeleaverequest-modal.component';
import { LeaveregularizeComponent } from '../../leaveManagement/leaveregularize/leaveregularize.component';
import { ImageviewerComponent } from '../../imageviewer/imageviewer.component';
import { forEach } from 'lodash';

@Component({
  selector: 'app-employeebulkattendance-modal',
  templateUrl: './employeebulkattendance-modal.component.html',
  styleUrls: ['./employeebulkattendance-modal.component.css']
})
export class EmployeebulkattendanceModalComponent implements OnInit {
  @Input() chosenEmployeeObject: any;
  @Input() AttendancePeriodId: any;
  @Input() RoleId: any;
  @Input() IsSubmitted: any;
  @Input() _payrollInputsSubmission: any;
  modalOption: NgbModalOptions = {};

  isrendering_spinner: boolean = false;
  isInvalidTablePunchInOutTime: boolean = false;
  isInvalidTablePunchInOutTimeChild: boolean = false;
  employeeAttendanceDetails: EmployeeAttendanceDetails = new EmployeeAttendanceDetails();
  EADetails: any[] = [];
  LstEADetails: any[];
  _entitlementList: any[] = [];
  LstEntitlementAvailmentRequest: any[] = [];
  LstAttendanceBreakupStatus: any[] = [];
  selectedAttendanceObject: any[] = [];
  selectAll: boolean = false;
  LstHolidays = [];
  isShiftSpanAcrossDays: boolean = false;
  regularizePending: boolean = false;
  constructor(
    private drawerRef: NzDrawerRef<string>,
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    public utilsHelper: enumHelper,
    private modalService: NgbModal,

  ) { }

  ngOnInit() {
    this.LstHolidays = [];
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.LstAttendanceBreakupStatus = this.utilsHelper.transform(AttendanceBreakUpDetailsStatus) as any;
    this.gettingRecommnededDetails();

  }
  gettingRecommnededDetails() {
    this.isrendering_spinner = true;
    console.log('_payrollInputsSubmission', this._payrollInputsSubmission);
    this.get_EmployeeEntitlementList(this.chosenEmployeeObject.EmployeeId).then((result) => {
      this.GetEmployeeAttendanceDetails(this.chosenEmployeeObject, this.AttendancePeriodId)

    })
  }
  GetEmployeeAttendanceDetails(attendance, AttendancePeriodId) {
    console.log('att', attendance)
    console.log('payrollInputSubmission', AttendancePeriodId)
    this.attendanceService.GetEmployeeAttendanceDetails(attendance.EmployeeId, AttendancePeriodId)
      .subscribe((response) => {
        try {
          let apiresult: apiResult = response;
          if (apiresult.Status && apiresult.Result != null) {
            this.EADetails = [];
            this.LstEADetails = [];
            var _eaDeatils = [];
            var item = apiresult.Result as any;
            this.employeeAttendanceDetails = apiresult.Result as any;
            this.LstEADetails = item.LstEmployeeAttendanceBreakUpDetails as any != null && item.LstEmployeeAttendanceBreakUpDetails.length > 0 ? item.LstEmployeeAttendanceBreakUpDetails : [];
            _eaDeatils = this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails != null && this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails.length > 0 ? this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails : [];
            _eaDeatils != null && _eaDeatils.length > 0 && _eaDeatils.forEach(element => {
              element['Iserror'] = false;
              element['Expandable'] = false;
              element.TotalSubmittedHours = Number(element.TotalSubmittedHours).toFixed(2);
              element.TotalApprovedHours = (element.TotalApprovedHours == null || element.TotalApprovedHours == 0) ? Number(element.TotalSubmittedHours).toFixed(2) : Number(element.TotalApprovedHours).toFixed(2);
              element.IsLeaveRequest = false;
              element.EntitlementType = null;
              element.isSelected = false;
              element.LeaveStatus = null;
              element.LeaveObject = null;
              element.IsHalfDay = false;
              element.IsHoliday = false;

              element.LstEmployeeAttendancePunchInDetails != null && element.LstEmployeeAttendancePunchInDetails.length > 0 && element.LstEmployeeAttendancePunchInDetails.forEach(q => {
                q.ApprovedHours = q.SubmittedHours
              });
            });

            this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {
              w['startDate'] = w.AppliedFrom;
              w['endDate'] = w.AppliedTill;
            });
            this.LstEntitlementAvailmentRequest.length > 0 && this.LstEntitlementAvailmentRequest.forEach(w => {
              if (w.Status == 400 || w.Status == 100) {
                while (moment(w.startDate).format('YYYY-MM-DD') <= moment(w.endDate).format('YYYY-MM-DD')) {
                  console.log('w', w);

                  var isext = _eaDeatils.find(item => moment(item.AttendanceDate).format('YYYY-MM-DD') == moment(w.startDate).format('YYYY-MM-DD'));
                  console.log('iss', isext);
                  var ishalf = false;
                  ishalf = (w.IsAppliedForFirstHalf || w.IsAppliedFromSecondHalf || w.IsAppliedTillFirstHalf || w.IsAppliedTillSecondHalf) ? true : false;
                  console.log('ishalf', ishalf);

                  if (isext != undefined && isext != null) {

                    isext.TotalSubmittedHours = (w.Status == 400 && ishalf == false) ? 0.00 : isext.TotalSubmittedHours,
                      isext.TotalApprovedHours = (w.Status == 400 && ishalf == false) ? 0.00 : isext.TotalApprovedHours,
                      isext.FirstCheckIn = (w.Status == 400 && ishalf == false) ? '00:00:00' : isext.FirstCheckIn,
                      isext.LastCheckedOut = (w.Status == 400 && ishalf == false) ? '00:00:00' : isext.LastCheckedOut,
                      isext.IsLeaveRequest = true,
                      isext.LeaveStatus = w.Status,
                      isext.LeaveObject = w,
                      isext.IsHalfDay = (w.IsAppliedForFirstHalf || w.IsAppliedFromSecondHalf || w.IsAppliedTillFirstHalf || w.IsAppliedTillSecondHalf) ? true : false,
                      isext.EntitlementType = this._entitlementList != null && this._entitlementList.length > 0 ? this._entitlementList.find(z => z.EntitlementId == w.EntitlementId).DisplayName : null

                    console.log('isext', isext);

                  }
                  w.startDate = moment(w.startDate).add(1, 'days').format('YYYY-MM-DD');
                }
              }
            });

            console.log('  this.EADetails', _eaDeatils);
            this.EADetails = _eaDeatils;
            this.EADetails.forEach(obj => {
              if (obj.FirstCheckIn) {
                var orgTime = obj.FirstCheckIn;
                var splitTime = orgTime.split(':');
                var msec = splitTime[2] ? Math.floor(splitTime[2]) : '00';
                var msecsingle = msec.toString();
                msecsingle.length == 1 ? (msec = 0 + msecsingle) : msec;
                var updtTime = splitTime[0] + ':' + splitTime[1] + ':' + msec;

                obj.FirstCheckIn = updtTime;
              }
              if (obj.LastCheckedOut) {
                var orgTime1 = obj.LastCheckedOut;
                var splitTime1 = orgTime1.split(':');
                var msec1 = splitTime1[2] ? Math.floor(splitTime1[2]) : '00';
                var msecsingle1 = msec1.toString();
                msecsingle1.length == 1 ? (msec1 = 0 + msecsingle1) : msec1;
                var updtTime1 = splitTime1[0] + ':' + splitTime1[1] + ':' + msec1;
                obj.LastCheckedOut = updtTime1;
              }
            })
            this.EADetails = _.orderBy(this.EADetails, ["AttendanceDate"], ["asc"]);
            this.getHolidayList(this._payrollInputsSubmission.ClientId,this._payrollInputsSubmission.ClientContractId, this._payrollInputsSubmission.TeamId, this.chosenEmployeeObject.EmployeeId);

            this.isrendering_spinner = false;
          } else {
            this.alertService.showWarning('There is no attendance in/out log');
            this.isrendering_spinner = false;

          }
        } catch (error) {
          this.alertService.showWarning(error);
          this.isrendering_spinner = false;
        }



      }, error => {
        console.error('ERROR WHILE GETTING ATTENDNACE DETAILS :: ', error);
      })

  }


  //   var i =  `${239 / 60 ^ 0}.` + 239 % 60;
  // undefined
  // var i =  239 % 60;
  // undefined
  // var i =  239 / 60;
  // undefined
  // var j = Math.round(i * 100) /100


  // public parseHours = (n) => `${n / 60 ^ 0}.` + n % 60; 
  public parseHours = (n) => Math.round((n / 60) * 100) / 100;

  OnChangePunchInTime(event, item, i) {
    item.Iserror = false,
    this.isInvalidTablePunchInOutTime = false;
    let formattedDate = moment(item.AttendanceDate).format('YYYY-MM-DD');
    var actualStartTime = moment(formattedDate + ' ' + event.target.value);
    var actualEndTime = item.LastCheckedOut != null ? moment(formattedDate + ' ' + item.LastCheckedOut) : null;
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
    item.TotalApprovedHours = totalHrs;
  }
  OnChangePunchOutTime(event, item, i) {
    item.Iserror = false,
      this.isInvalidTablePunchInOutTime = false;
    let formattedDate = moment(item.AttendanceDate).format('YYYY-MM-DD');
    var actualStartTime = item.FirstCheckIn != null ? moment(formattedDate + ' ' + item.FirstCheckIn) : null;
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
    item.TotalApprovedHours = totalHrs;

  }


  OnChangePunchInTimeChild(event, item, indx, parent) {
    item.Iserror = false;
    this.isShiftSpanAcrossDays = parent.IsIsShiftSpanAcrossDays ?  parent.IsIsShiftSpanAcrossDays : false;
    this.isInvalidTablePunchInOutTimeChild = false;
    let formattedDate = moment(item.AttendanceDate).format('YYYY-MM-DD');
    var actualStartTime = moment(formattedDate + ' ' + event.target.value);
    var actualEndTime = item.FinishTime != null ? moment(formattedDate + ' ' + item.FinishTime) : null;
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
      // item.Iserror = true,
      this.isInvalidTablePunchInOutTimeChild = true;
    }
    if (Math.sign(totalHrs) == -1) {
      // item.Iserror = true,
      this.isInvalidTablePunchInOutTimeChild = true;
    }
    item.ApprovedHours = totalHrs;
    var localItems: any = null;
    localItems = this.EADetails.find(a => a.Id == parent.Id);
    console.log('parent', parent);
    
    if (parent.LstEmployeeAttendancePunchInDetails.length > 0) {
      var totallen = 0;
      if (indx == 0) {
        for (let k = 0; k < parent.LstEmployeeAttendancePunchInDetails.length; k++) {
          const element = parent.LstEmployeeAttendancePunchInDetails[k];
          console.log('item', item);
          console.log('element', element);
          element.Iserror = false;
          // if (item.Starttime <= element.FinishTime || item.Starttime <= item.FinishTime) {
          //   console.log('ue ss');
          //   item.Iserror = true
          //   this.isInvalidTablePunchInOutTimeChild = true;
          //   break;
          // }


          if (element.Id == item.Id) {

            if (item.Starttime < item.FinishTime) {
              console.log('ue s2s');
              item.Iserror = true
              this.isInvalidTablePunchInOutTimeChild = true;
              break;
            }
          } else {
            if (item.Starttime >= element.FinishTime || item.Starttime >= element.Starttime) {
              console.log('ue ss22');
              item.Iserror = true
              this.isInvalidTablePunchInOutTimeChild = true;
              break;
            }
          }

        }
      } else {

        for (let j = 0; j < parent.LstEmployeeAttendancePunchInDetails.length; j++) {
          const element = parent.LstEmployeeAttendancePunchInDetails[j];
          console.log('j', j);


          if (j < indx) {
            if (item.FinishTime <= item.Starttime || item.Starttime <= element.Starttime || item.Starttime <= element.FinishTime) {
              console.log('ues fx2');
              item.Iserror = true;
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          }
          // console.log('indx', indx);
          // if (j < indx) {
          //   console.log('item', item);
          //   console.log('element', element);
          //   if (item.FinishTime <= item.Starttime || item.Starttime <= element.Starttime || item.Starttime <= element.FinishTime) {
          //     console.log('ues');  
          //     item.Iserror = true          
          //     this.isInvalidTablePunchInOutTimeChild = true;
          //     break;
          //   }
          // }

        }

      }
      var lastIndex = parent.LstEmployeeAttendancePunchInDetails.length - 1;
      let atlast = lastIndex == 0 ? 0 : (lastIndex - 1);
      parent.FirstCheckIn = parent.LstEmployeeAttendancePunchInDetails[0].Starttime;
      parent.LastCheckedOut = parent.LstEmployeeAttendancePunchInDetails[atlast].FinishTime;
      parent.TotalApprovedHours = this.calculateTotalApprovedHrs(parent.LstEmployeeAttendancePunchInDetails);

    }

    console.log('  this.EADetails', this.EADetails);



  }
  OnChangePunchOutTimeChild(event, item, indx, parent) {
    item.Iserror = false
    this.isInvalidTablePunchInOutTimeChild = false;
    this.isShiftSpanAcrossDays = parent.IsIsShiftSpanAcrossDays ?  parent.IsIsShiftSpanAcrossDays : false;
    let formattedDate = moment(item.AttendanceDate).format('YYYY-MM-DD');
    var actualStartTime = item.Starttime != null ? moment(formattedDate + ' ' + item.Starttime) : null;
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
      // item.Iserror = true,
      this.isInvalidTablePunchInOutTimeChild = true;
    }
    if (Math.sign(totalHrs) == -1) {
      // item.Iserror = true,
      this.isInvalidTablePunchInOutTimeChild = true;
    }
    item.ApprovedHours = totalHrs;
    var localItems: any = null;
    localItems = this.EADetails.find(a => a.Id == parent.Id);

    console.log('parent', parent);

    if (parent.LstEmployeeAttendancePunchInDetails.length > 0) {
      if (indx == 0) {
        for (let k = 0; k < parent.LstEmployeeAttendancePunchInDetails.length; k++) {
          const element = parent.LstEmployeeAttendancePunchInDetails[k];
          console.log('item', item);
          console.log('element', element);
          element.Iserror = false;
          if (element.Id == item.Id) {

            if (item.FinishTime <= item.Starttime) {
              console.log('ue ss');
              item.Iserror = this.isShiftSpanAcrossDays ? false: true;
              this.isInvalidTablePunchInOutTimeChild = true;
              break;
            }
          } else {
            if (item.FinishTime >= element.Starttime || item.FinishTime >= element.FinishTime) {
              console.log('ue ss 2');
              item.Iserror = this.isShiftSpanAcrossDays ? false: true;
              this.isInvalidTablePunchInOutTimeChild = true;
              break;
            }
          }


        }

      }
      else {

        for (let j = 0; j < parent.LstEmployeeAttendancePunchInDetails.length; j++) {
          const element = parent.LstEmployeeAttendancePunchInDetails[j];
          console.log('element2', element);
          console.log('item2 ', item);

          console.log('j 2', j);
          console.log('indx 2', indx);

          if (j < indx) {
            if (item.Starttime <= element.Starttime || item.Starttime <= element.FinishTime) {
              console.log('ues f');
              item.Iserror = true;
              this.isInvalidTablePunchInOutTime = true;
              break;
            }
          }



          // if (j < indx) {
          //   if (item.FinishTime <= item.Starttime || item.FinishTime <= element.Starttime || item.FinishTime <= element.FinishTime) {
          //     console.log('ues f');
          //     item.Iserror = true
          //     this.isInvalidTablePunchInOutTimeChild = true;
          //     break;
          //   }
          // }

          // ft : 14 : el : 13, 12, 11 , 

          // if (indx == 0) {
          //   if (item.FinishTime <= element.Starttime || item.FinishTime <= item.Starttime) {
          //     console.log('ue ss');
          //     item.Iserror = true
          //     this.isInvalidTablePunchInOutTimeChild = true;
          //     break;
          //   }
          // }
        }

      }
      var lastIndex = parent.LstEmployeeAttendancePunchInDetails.length - 1;
      let atlast = lastIndex == 0 ? 0 : (lastIndex - 1);
      parent.FirstCheckIn = parent.LstEmployeeAttendancePunchInDetails[0].Starttime;
      parent.LastCheckedOut = parent.LstEmployeeAttendancePunchInDetails[atlast].FinishTime;
      parent.TotalApprovedHours = this.calculateTotalApprovedHrs(parent.LstEmployeeAttendancePunchInDetails);
    }
    console.log('  this.EADetails', this.EADetails);


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

      return Number(timeParts[0]) * 60 + Number(timeParts[1]);
    } else {
      return 0;
    }

  }


  calculateTotalApprovedHrs(LstEmployeeAttendancePunchInDetails) {
    var TotalTimes: number = 0;
    var TotalMinutes: number = 0;

    LstEmployeeAttendancePunchInDetails.forEach(em => {
      em.ApprovedHours = Number(em.ApprovedHours);

      if ((TotalTimes - Math.floor(TotalTimes)) !== 0) {
        TotalMinutes += this.convertH2M(em.ApprovedHours);
      }
      else {

        TotalMinutes += this.convertH2M(em.ApprovedHours.toFixed(2)) as any;
      }

    });


    TotalTimes += Number(this.parseHours(TotalMinutes));
    // TotalTimes += TotalTimes;
    if (Number.isNaN(TotalTimes)) {
      TotalTimes = 0
    }

    if (TotalTimes != 0) {
      if ((TotalTimes - Math.floor(TotalTimes)) !== 0) {

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

    return TotalTimes;
  }


  expandPunches(item, action) {

    for (let i = 0; i < this.EADetails.length; i++) {
      const element = this.EADetails[i];
      if (item.Id == element.Id) {
        element.Expandable = true;
        // item.IsOpened = true;
      }
      else {
        element.Expandable = false;
        // item.IsOpened = false;
      }
    }
    // this.EADetails.find(a=>a.Id == item.Id).Expandable  = true;
    // this.EADetails.forEach(element => {
    // //   if (item.Id == element.Id && element.IsOpened == true) {
    // //     element.IsOpened = false;
    // //     item.IsOpened = false;
    // //   }
    // //  else
    //   if (item.Id == element.Id) {
    //     element.Expandable = true;
    //     // item.IsOpened = true;
    //   }
    //   else {
    //     element.Expandable = false;
    //     // item.IsOpened = false;
    //   }
    // });
    console.log('ifccc', item);
  }

  submitEmployeeAttendance() {

  }

  cancel() {
    this.drawerRef.close();
  }


  submitEABreakup() {

    if (this.isInvalidTablePunchInOutTimeChild == true) {
      const errorMessage = 'Please check if specified punch in/out time is invalid or the time is out of valid range';
      if (this.isShiftSpanAcrossDays) {
        this.alertService.confirmSwalWithCancelAction('Confirmation!', 'Are you sure you want to update time across days ?', "Yes, Continue", "No, Cancel").then((result) => {
          if (result) {
            this.doSubmitEABreakUp();
          } else {
            this.alertService.showWarning(errorMessage);
            return;
          }
        });
      } else {
        this.alertService.showWarning(errorMessage);
        this.loadingScreenService.stopLoading();
        return;
      }
    } else if (this.EADetails.filter(a => a.LeaveStatus == 100).length > 0) {
      this.alertService.showWarning('One or more leave requests which have not been approved. Please approve and attempt again.');
      return;
    } else {
      this.doSubmitEABreakUp();
    }

    
    // this.loadingScreenService.startLoading();

    // try {


    //   var lstEmpAttendanceBreakupList = [];
    //   if (this.EADetails != null && this.EADetails.length > 0) {
    //     this.EADetails.forEach(element => {
    //       if (element.Status == AttendanceBreakUpDetailsStatus.EmployeeSaved) {
    //         element.Status = AttendanceBreakUpDetailsStatus.ManagerSubmitted
    //         lstEmpAttendanceBreakupList.push(element)
    //       }
    //     });
    //   }

    //   this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails = this.EADetails;

    //   console.log('employeeAttendanceDetails', this.employeeAttendanceDetails);
    //   // this.loadingScreenService.stopLoading();

    //   //  return;

    //   this.triggerfinalSubmit(this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails);

    //   // this.attendanceService.UpsertEmployeeAttendanceDetails(this.employeeAttendanceDetails)
    //   //   .subscribe((result) => {
    //   //     console.log(result);
    //   //     let apiresult: apiResult = result;
    //   //     if (apiresult.Status) {
    //   //       this.loadingScreenService.stopLoading();
    //   //       this.alertService.showSuccess(apiresult.Message);
    //   //       this.cancel();
    //   //       // this.triggerfinalSubmit(this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails);
    //   //     }
    //   //     else {
    //   //       this.loadingScreenService.stopLoading();
    //   //       this.alertService.showWarning(apiresult.Message);
    //   //     }
    //   //   }, error => {
    //   //     this.loadingScreenService.stopLoading();
    //   //     this.alertService.showWarning(`Something bad has happened : ${error}`);
    //   //   })
    // }
    // catch (error) {
    //   this.loadingScreenService.stopLoading();
    //   this.alertService.showWarning(`Something bad has happened : ${error}`);

    // }

  }

  doSubmitEABreakUp() {
    try {
      var lstEmpAttendanceBreakupList = [];
      if (this.EADetails != null && this.EADetails.length > 0) {
        this.EADetails.forEach(element => {
          if (element.Status == AttendanceBreakUpDetailsStatus.EmployeeSaved) {
            element.Status = AttendanceBreakUpDetailsStatus.ManagerSubmitted;
            lstEmpAttendanceBreakupList.push(element);
          }
        });
      }
      const firstAndLastDateObjects =  this.EADetails && this.EADetails.length > 0 ? [this.EADetails[0], this.EADetails[this.EADetails.length - 1]] : [];

     if (firstAndLastDateObjects.length == 2) {
        const attendanceStartDate = moment(firstAndLastDateObjects[0].AttendanceDate).format('MM-DD-YYYY');
        const attendanceEndDate = moment(firstAndLastDateObjects[1].AttendanceDate).format('MM-DD-YYYY');
        this.attendanceService.isManagerAllowedToRegularise(firstAndLastDateObjects[0].EmployeeId, attendanceStartDate, attendanceEndDate).subscribe((result) => {
          console.log('*****isMgrAllowedToRegularise******', result);
          this.regularizePending = result.Status && result.Result == '1' ? true : false;
          if (this.regularizePending) {
            this.alertService.showWarning('The regularization by the employee is pending for your approval for the selected date.');
            return;
          }
        });
      }

      this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails = this.EADetails;
  
      console.log('employeeAttendanceDetails', this.employeeAttendanceDetails);
      
      this.loadingScreenService.startLoading();
      this.triggerfinalSubmit(this.employeeAttendanceDetails.LstEmployeeAttendanceBreakUpDetails);
  
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(`Something bad has happened : ${error}`);
    }
  }

  triggerfinalSubmit(lstEmpAttendanceBreakupList) {

    this.loadingScreenService.startLoading();
    let submitAttendanceUIModel = new SubmitAttendanceUIModel();
    submitAttendanceUIModel.LstEmployeeAttendanceBreakUpDetails = lstEmpAttendanceBreakupList;
    submitAttendanceUIModel.ModuleProcessAction = 0; //EmployeeAttendancModuleProcessStatus.EmployeeSubmitAttendance;
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
          this.cancel();
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


  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
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

  getStatusName(statusCode) {
    var StatusName = null;
    try {
      StatusName = this.LstAttendanceBreakupStatus.find(a => a.id == statusCode).name;
    } catch (error) {
      return StatusName;
    }
    return StatusName;
  }

  onClickMarkAsAbsent() {
    var arrangedObject = [];
    arrangedObject = _.orderBy(this.selectedAttendanceObject, ["AttendanceDate"], ["asc"]);
    var lastindex = arrangedObject.length - 1;
    console.log('arrangedObject', arrangedObject);

    const modalRef = this.modalService.open(EmployeeleaverequestModalComponent, this.modalOption);
    modalRef.componentInstance.EmployeeObject = { Id: this.chosenEmployeeObject.EmployeeId, Code: this.chosenEmployeeObject.EmployeeCode };
    modalRef.componentInstance.JObject = JSON.stringify({
      preferredDate: new Date(this.EADetails[0].AttendanceDate),
      isEmployee: false,
      StartDate: arrangedObject[0].AttendanceDate,
      EndDate: arrangedObject[lastindex].AttendanceDate

    });
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        this.selectedAttendanceObject = [];
      } else {
        this.selectedAttendanceObject = [];
        this.gettingRecommnededDetails();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  change(obj, indx, event) {

    console.log('obj', obj);
    console.log('indx', indx);
    console.log('event', event);
    this.loadingScreenService.startLoading();
    let updateItem = this.EADetails.find(i => i.Id == obj.Id);
    let index = this.selectedAttendanceObject.indexOf(updateItem);

    if (index > -1) {
      this.selectedAttendanceObject.splice(index, 1);
    }
    else {
      this.selectedAttendanceObject.push(obj);

    }
    this.loadingScreenService.stopLoading();
    console.log('chosenEmployeeObject', this.selectedAttendanceObject);

    var totalLength = 0;
    this.EADetails.forEach(e => {
      if (e.IsLeaveRequest == false) {
        totalLength = totalLength + 1;;
      }
    });
    if (totalLength === this.selectedAttendanceObject.length) {
      this.selectAll = true;
    }
    else {
      this.selectAll = false;
    }

  }

  selectAllEADetails(event: any) {
    console.log('event', event);
    this.selectedAttendanceObject = [];

    this.EADetails.forEach(e => {
      if (e.IsLeaveRequest == false) {

        event.target.checked == true ? e.isSelected = true : e.isSelected = false

      }
    });

    if (event.target.checked) {
      this.EADetails.forEach(e => {
        if (e.IsLeaveRequest == false) {
          this.selectedAttendanceObject.push(e);
        }
      });
    } else {
      this.selectedAttendanceObject = [];
    }
  }



  onClickRegularize(rowData) {

    console.log('object :', rowData);
    const modalRef = this.modalService.open(LeaveregularizeComponent, this.modalOption);
    modalRef.componentInstance.rowData = JSON.stringify(rowData);
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('RESULT OF EDITED SO DETAILS :', result);
        this.gettingRecommnededDetails();
      }
      else {
        // this.onRefresh();


      }
    }).catch((error) => {
      console.log(error);
    });

  }

  clickexpand(item) {

    if (item.Status > 300) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('The employee attendance information has already been submitted');
      return;
    }
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

  
  getHolidayList(ClientId,ClientContractId, TeamId,EmployeeId ) {
    (async () => {
      await this.attendanceService.GetHolidayCalendarBasedOnApplicability(0, ClientId, ClientContractId, TeamId, 0, 0, EmployeeId)
        .subscribe((result) => {
          let apiresult: apiResult = result;
          if (apiresult.Status) {
            var data = apiresult.Result as any;
            console.log('HOLIDAY LIST ::', data);
            try {

              if (data != null) {
                this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 1) : []
                this.LstHolidays != null && this.LstHolidays.length > 0 && this.LstHolidays.forEach(el => {
                  let doUpdateHoliday = this.EADetails.find(item => moment(item.AttendanceDate).format('YYYY-MM-DD') == moment(el.Date).format('YYYY-MM-DD'));
                console.log('doUpdateHoliday',doUpdateHoliday);
                
                  if (doUpdateHoliday != undefined && doUpdateHoliday != null) {
                    doUpdateHoliday.IsHoliday = true;
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
