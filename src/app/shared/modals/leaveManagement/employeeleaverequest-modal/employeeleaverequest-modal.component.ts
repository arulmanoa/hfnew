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
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model/Common/LoginResponses';
import { Subject, Observable } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, EmployeeService, FileUploadService, PayrollService, SearchService } from 'src/app/_services/service';
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
import { EmployeeAttendanceDetails, SubmitAttendanceUIModel, SubmitRegularizedAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { EntitlementRequestStatus } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import Swal from 'sweetalert2';
// import { AttendanceBreakUpDetailsStatus, EmployeeAttendancModuleProcessStatus } from 'src/app/_services/model/Attendance/AttendanceEnum';
// import { EmployeeAttendanceDetails, SubmitAttendanceUIModel, SubmitRegularizedAttendanceUIModel } from 'src/app/_services/model/Attendance/EmployeeAttendanceDetails';
import { isGuid } from 'src/app/utility-methods/utils';
import { ObjectStorageDetails } from '@services/model/Candidates/ObjectStorageDetails';
import FileSaver from 'file-saver';

@Component({
  selector: 'app-employeeleaverequest-modal',
  templateUrl: './employeeleaverequest-modal.component.html',
  styleUrls: ['./employeeleaverequest-modal.component.css']
})
export class EmployeeleaverequestModalComponent implements OnInit {

  @Input() EmployeeObject: any;
  @Input() JObject: any;

  LstEntitlementAvailmentRequestDetails: any[] = []
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  AttendForm: FormGroup;
  submitted = false;
  isValidDates = true;
  radioItems: Array<string>;
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
  _entitlementAvailmentRequestsApprovals: EntitlementAvailmentRequest[] = [];
  isrendering_spinner: boolean = false;
  _entitlementAvailmentRequests: EntitlementAvailmentRequest[] = [];
  EmploymentContracts: any;
  LstHolidays: any[] = [];
  LstNonPayabledays: any[] = [];
  _employeeId: any;
  _employeeDOJ: any = null;
  CurrentDateTime: any = null;
  EvtReqId: any = 0;
  isSameDate: boolean = false;
  isDatesArecontinuity: boolean = true;
  tobeDisabledCheckbox: boolean = false;
  IsNegativeUnitAllowed: boolean = false;
  MaxAllowedNegativeBalance: any = 0;
  weekOffs: any[] = [];
  _employeeBasicDetails: EmployeeDetails;

  employeeEntitlement: EmployeeEntitlement = null;
  optionalHolidayList = [];
  isLoading: boolean = false;
  unsavedDocumentLst = [];

  CompanyId: number = 0;
  BusinessType: number = 0;

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
    private employeeService: EmployeeService,
    private searchService: SearchService,
    private fileUploadService: FileUploadService
  ) {
    this.createForm();
  }

  ngOnInit() {
    this._employeeDOJ = null;
    this.isrendering_spinner = true;
    this.JObject = JSON.parse(this.JObject);
    console.log('JObject', this.JObject);
    console.log('LEAVE EMP OBJ :: ', this.EmployeeObject);

    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    this.LstEntitlementAvailmentRequestDetails = [];
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this._employeeId = this.EmployeeObject.Id;
    this.BusinessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.sessionDetails.Company.Id;

    this.getWeekOff().then(() => console.log("Week Off Task Complete!"));
    this.GetOptionalHolidaysForAnEmployee();
    this.get_EmployeeEntitlementList(this.EmployeeObject.Id).then((result) => {
      if (result == true) {
        this.employeeService.GetEmployeeRequiredDetailsById(this.EmployeeObject.Id, EmployeeMenuData.Profile).subscribe((result) => {
          var apiresult1 = result as apiResult;
          if (apiresult1.Status && apiresult1.Result != null) {
            let empObject: EmployeeDetails = apiresult1.Result as any;
            this.EmployeeObject = empObject;

            // this.employeeService.FetchEmployeeDetailsByEmployeeCode(this.EmployeeObject.EmployeeCode)
            //   .subscribe((employeeObj) => {
            //     const apiResponse: apiResult = employeeObj;
            //     if (apiResponse.Status && apiResponse.Result != null) {
            //       const Object: EmployeeDetails = apiResponse.Result as any;

            // Object.EmploymentContracts != null && Object.EmploymentContracts.length > 0 ? this._employeeDOJ = Object.EmploymentContracts[0].StartDate : true
            // this.EmploymentContracts = (Object.EmploymentContracts[0]);
            this.GetHolidayCalendarBasedOnApplicability();
            this.AttendForm.patchValue({
              AppliedFrom: this.JObject.isEmployee == false ? new Date(this.JObject.StartDate) : new Date(this.JObject.preferredDate),
              AppliedTill: this.JObject.isEmployee == false ? new Date(this.JObject.EndDate) : new Date(this.JObject.preferredDate),
              Entitlement: null,
              AttendanceType: null
            });

            //   }
            // })
          }

        })

      } else {
        this.isrendering_spinner = false;
        this.alertService.showWarning('Employee Entitlement not found');
        return;
      }
    });
  }


  async GetOptionalHolidaysForAnEmployee() {
    this.optionalHolidayList = [];
    await this.employeeService.GetOptionalHolidaysForAnEmployee(this._employeeId).subscribe((result: apiResult) => {
      // let apiResult: apiResult = result;
      console.log('HOLIDAY LIST ::', result)
      if (result.Status && result.Result) {
        this.optionalHolidayList = JSON.parse(result.Result);
      }

    }, err => {

    });

  }


  getWeekOff() {
    this.weekOffs = [];

    var promise = new Promise((resolve, reject) => {
      var _woff = JSON.parse(this.sessionService.getSessionStorage('weekOffs'));
      console.log('_woff', (_woff));
      if (_woff == null || _woff == undefined) {

        this.attendanceService.GetWeekOffByEmployeeId(this.EmployeeObject.Id)
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



  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._entitlementList = this._entitlementList != null && this._entitlementList.length > 0 && this.JObject.isEmployee == true ? this._entitlementList.filter(a => a.IsLossOfPay == false) : this._entitlementList;
          // this.isrendering_spinner = false;
          res(this._entitlementList != null && this._entitlementList.length > 0 ? true : false);
        } else {
          res(false);
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
      IsAppliedTillFirstHalf: [false],
      IsAppliedTillSecondHalf: [false],
      IsAppliedForFirstHalf: [false],
      IsAppliedFromSecondHalf: [false],
      ApplierRemarks: ['', Validators.required],
      EligibleUnits: [null],
      EntitlementType: [null],
      Entitlement: [null, Validators.required],
      AppliedUnits: [0, Validators.required],
      OptinalHoliday: [null],
      AdditionalDateInput: [null],
      AdditionalDocumentId: [null],
      AdditionalDocumentName: [""]
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

  onChangeHolidays(event) {
    if (this.employeeEntitlement.Entitlement.IsOptionalHoliday) {
      this.AttendForm.patchValue({
        AppliedFrom: new Date(event.Date),
        AppliedTill: new Date(event.Date),
      });
      this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    }
  }

  onChange_FromDate(event) {

    if (this.AttendForm.get('AppliedFrom').value != null || this.AttendForm.get('AppliedFrom').value != undefined) {
      var appliedfromDate = new Date(event);
      this._till_minDate = appliedfromDate;
      // this._till_minDate.setMonth(appliedfromDate.getMonth());
      // this._till_minDate.setDate(appliedfromDate.getDate());
      // this._till_minDate.setFullYear(appliedfromDate.getFullYear());
      this.AttendForm.controls['AppliedTill'].setValue(null);
      this.resetAttendForm();
      this.requestedDays = 0;
      this.calculateNoOfDays(new Date(event), (this.AttendForm.get('AppliedTill').value));
      this.isSameDateCheck(new Date(event), this.AttendForm.get('AppliedTill').value);
      this.isDatesArecontinuityCheck(new Date(event), this.AttendForm.get('AppliedTill').value);
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
    else {
      this._till_minDate = new Date();
      this._till_minDate = new Date(event);
    }
  }

  onChange_TillDate(event) {

    if (this.AttendForm.get('AppliedFrom').value != null || this.AttendForm.get('AppliedFrom').value != undefined) {
      this.resetAttendForm();
      this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, new Date(event));
      this.isSameDateCheck(this.AttendForm.get('AppliedFrom').value, new Date(event));
      this.isDatesArecontinuityCheck(this.AttendForm.get('AppliedFrom').value, new Date(event));
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

    // var i = `'${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}'`;
    // var j = `'${b.getMonth() + 1}/${b.getDate()}/${b.getFullYear()}'`;
    // console.log('start : ', i);
    // console.log('end : ', j);
    // var future = moment(j);
    // var start = moment(i);
    // var diff = future.diff(start, 'days');
    // console.log('diff in a day : ', diff);

    var diff = this.workingDaysBetweenDates(a, b);
    console.log('diff in a day : ', diff);

    // var oneDay = 24 * 60 * 60 * 1000;
    // var diffDays = Math.abs((a.getTime() - a.getTime()) / (oneDay));
    // console.log('DIFF DAYS ::', diffDays);

    this.requestedDays = 0;
    this.preRequestedDays = 0;
    // var Difference_In_Time = a.getTime() - b.getTime();
    // let currentPeriodDays = Difference_In_Time / (1000 * 3600 * 24);
    // console.log('currentPeriodDays', currentPeriodDays);
    // this.requestedDays = Math.abs(currentPeriodDays);
    this.requestedDays = Math.round(diff);
    // if (this.requestedDays == 0) {
    //   this.requestedDays = this.requestedDays + 1;
    // }

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

    // if (this.AttendForm.get('Id').value > 0) {
    //   this.preRequestedDays = Number(this.AttendForm.get('AppliedUnits').value)
    //   if (this.preRequestedDays == 0) {
    //     this.preRequestedDays = this.requestedDays;
    //   }
    //   this.remainingDays = (Number(this.eligibaleDays) - Number(this.requestedDays)) + Number(this.preRequestedDays);
    //   this.remainingDays = Number(this.remainingDays).toFixed(1);

    // } else {
    this.remainingDays = Number(this.eligibaleDays) - Number(this.requestedDays);
    this.remainingDays = Number(this.remainingDays).toFixed(1);

    // }

    console.log('REMIN ::', this.remainingDays);

  }
  onChange_Entitlement(event) {
    console.log('event', event);
    this.IsShowBalanceInUI = event.ShowBalanceInUI;
    this.IsLossOfPay = event.IsLossOfPay;
    this.employeeEntitlement = event;
    event != undefined ? this.AttendForm.controls['EligibleUnits'].setValue(event.EligibleUnits) : this.AttendForm.controls['EligibleUnits'].setValue(0);
    event != undefined ? this.selectedEntitlement = event : this.selectedEntitlement = null;
    if (event != undefined) {

      if (!this.IsLossOfPay && event.Definition.IsNegativeBalanceAllowed == false && event.AvailableUnits <= 0) {
        this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try again.');
        return;
      } else if (!this.IsLossOfPay && event.Definition.IsNegativeBalanceAllowed == true && event.Definition.MaxNegativeBalanceAllowed == 0 && event.AvailableUnits <= 0) {
        this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try again.');
        return;
      } else {

        if (event.Definition.IsNegativeBalanceAllowed == true) {
          this.IsNegativeUnitAllowed = true;
          this.MaxAllowedNegativeBalance = event.Definition.MaxNegativeBalanceAllowed;
        }

        this.leaveTypeName = event.DisplayName;
        this.remainingDays = event.EligibleUnits;
        this.eligibaleDays = event.EligibleUnits;
        // this.availableDays = event.AvailableUnits;
        this.availableDays = event.EligibleUnits;


        this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
      }

    }



  }


  isSameDateCheck(from, till) {
    this.tobeDisabledCheckbox = false;
    this.AttendForm.controls['IsAppliedForFirstHalf'].enable();
    this.AttendForm.controls['IsAppliedTillSecondHalf'].enable();
    if (moment(from).format('YYYY-MM-DD') == moment(till).format('YYYY-MM-DD')) {
      this.isSameDate = true;
      this.tobeDisabledCheckbox = false;
      this.AttendForm.controls['IsAppliedForFirstHalf'].enable();
      this.AttendForm.controls['IsAppliedTillSecondHalf'].enable();
    } else {
      this.isSameDate = false;
      this.tobeDisabledCheckbox = true;
      this.AttendForm.controls['IsAppliedForFirstHalf'].disable();
      this.AttendForm.controls['IsAppliedTillSecondHalf'].disable();

    }
  }

  isDatesArecontinuityCheck(from, till) {
    this.isDatesArecontinuity = true;
    if (this.isSameDate) {
      this.isDatesArecontinuity = true;
    }
    else if (!this.isSameDate && (this.AttendForm.get('IsAppliedForFirstHalf').value == true || this.AttendForm.get('IsAppliedTillSecondHalf').value == true)) {
      this.isDatesArecontinuity = false;
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
    this.isSameDateCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

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
    this.isSameDateCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

  }
  onChange_tillfirstHalf(item) {

    if (item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(true);
      this.isDisabledTillDate = true;

    }
    else if (!item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {

      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(false);
    }

    this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    this.isSameDateCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
  }

  onChange_tillSecondHalf(item) {

    if (item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {
      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(true);
      this.isDisabledTillDate = true;

    }
    else if (!item.target.checked && this.AttendForm.get('AppliedTill').value != null && (moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD') == moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD'))) {

      this.AttendForm.controls['IsAppliedForFirstHalf'].setValue(false);
    }


    this.calculateNoOfDays(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    this.isSameDateCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);
    this.isDatesArecontinuityCheck(this.AttendForm.get('AppliedFrom').value, this.AttendForm.get('AppliedTill').value);

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


  saveEntitlementRequest() {

    this.submitted = true;
    this.AttendForm.controls['AppliedUnits'].setValue(this.requestedDays);

    if (this.employeeEntitlement.Entitlement.IsOptionalHoliday) {
      this.updateValidation(true, this.AttendForm.get('OptinalHoliday'));
    } else {
      this.updateValidation(false, this.AttendForm.get('OptinalHoliday'));
    }

    if (this.employeeEntitlement.Definition.IsAdditionalDateInputRequired) {
      this.updateValidation(true, this.AttendForm.get('AdditionalDateInput'));
    } else {
      this.updateValidation(false, this.AttendForm.get('AdditionalDateInput'));
    }

    if (this.employeeEntitlement.Definition.IsOptionRequiredToUploadDocuments && this.employeeEntitlement.Definition.AreSupportingDocumentsMandatory) {
      this.updateValidation(true, this.AttendForm.get('AdditionalDocumentId'));
    } else {
      this.updateValidation(false, this.AttendForm.get('AdditionalDocumentId'));
    }

    if (this.AttendForm.invalid) {
      this.alertService.showWarning("Unfortunately, your leave request cannot be submitted. Please fill in a valid value for all required(*) fields.");
      return;
    }
    else if (Number(Math.sign(this.requestedDays)) == -1) {
      this.alertService.showWarning('you cannot apply for 0 days or less than of leave.');
      return;
    }
    else if (this.AttendForm.controls.AppliedUnits.value == 0) {
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
    
    // ! Commenting because the validation will happen on the API side.
    // else if (this.IsNegativeUnitAllowed && parseFloat(this.MaxAllowedNegativeBalance) > parseFloat(this.remainingDays)) {
    //   this.alertService.showWarning("Maximum allowed leave balance is currently insufficient");
    //   return;
    // }


    // else if (!this.IsNegativeUnitAllowed && !this.IsLossOfPay && (this.AttendForm.controls.AppliedUnits.value == 0 || (this.AttendForm.controls.AppliedUnits.value > this.AttendForm.controls.EligibleUnits.value))) {
    //   this.alertService.showWarning("you cannot apply for 0 days of leave or Reason: Please check if you have selected the from and to dates on holiday(s) or Another leave request exists for the date range you selected");
    //   return;
    // }
    else {
      this.loadingScreenService.startLoading();
      this.validateIsExitsOnDay().then((res) => {

        console.log('VALIDATION CEHCK ::', res);
        if (res) {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning("You have entered dates that already exists in this request List. Only Unique dates are allowed.")
          return;
        }
        else {
          // if (this.EvtReqId != null && this.EvtReqId != 0) {
          //   this.ValidateLeaveRequestIsValidToUpdate().then((validatedResponse) => {
          //     this.loadingScreenService.stopLoading();
          //     if (validatedResponse) {
          //       this.tiggerApiCall_LeaveRequest();
          //     }
          //   })
          // } else {
          //   this.tiggerApiCall_LeaveRequest();

          // }

          this.tiggerApiCall_LeaveRequest();

        }

      })
    }



  }

  tiggerApiCall_LeaveRequest() {
    this.loadingScreenService.stopLoading();
    this.alertService.confirmSwal1("Confirmation!", `Are you sure you want to apply leave from ${moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('DD-MM-YYYY')} to ${moment(new Date(this.AttendForm.get('AppliedTill').value)).format('DD-MM-YYYY')}?`, "Yes, Confirm", "No, Cancel").then((result) => {
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
        entitlementAvailmentRequest.ValidatedBy = this.JObject.isEmployee == false ? this.UserId : 0;
        entitlementAvailmentRequest.ApplierRemarks = this.JObject.isEmployee == false ? '' : this.AttendForm.get('ApplierRemarks').value;
        entitlementAvailmentRequest.CancellationRemarks = '';
        entitlementAvailmentRequest.ValidatorRemarks = this.JObject.isEmployee == false ? this.AttendForm.get('ApplierRemarks').value : '';
        entitlementAvailmentRequest.Status = this.JObject.isEmployee == false ? EntitlementRequestStatus.Approved : EntitlementRequestStatus.Applied;
        entitlementAvailmentRequest.AppliedBy = this.JObject.isEmployee == false ? 0 : this.UserId;
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
        entitlementAvailmentRequest.LastUpdatedOn = this.CurrentDateTime;
        entitlementAvailmentRequest.ApprovalStatus = EntitlementRequestStatus.Applied;
        entitlementAvailmentRequest.ValidatedUserName = this.JObject.isEmployee == false ? this.UserName : 0;
        this.AttendForm.get('AdditionalDateInput').value != null ? entitlementAvailmentRequest.AdditionalDate = moment(new Date(this.AttendForm.get('AdditionalDateInput').value)).format('YYYY-MM-DD') : true;
        this.AttendForm.get('AdditionalDocumentId').value != null && this.AttendForm.get('AdditionalDocumentId').value > 0 ? entitlementAvailmentRequest.DocumentId = this.AttendForm.get('AdditionalDocumentId').value : true;
        this.AttendForm.get('AdditionalDocumentName').value != null && this.AttendForm.get('AdditionalDocumentName').value != '' ? entitlementAvailmentRequest.DocumentName = this.AttendForm.get('AdditionalDocumentName').value : true;
        console.log('ENTILMENT REQUEST :: ', entitlementAvailmentRequest);
        // this.loadingScreenService.stopLoading();
        // return ;
        this.attendanceService.PostEntitlementAvailmentRequest(entitlementAvailmentRequest)
          .subscribe((result) => {
            let apiResult: apiResult = result;
            console.log('SUBMITTED RES ::', result);
            if (apiResult.Status) {
              this.alertService.showSuccess(apiResult.Message);
              this.loadingScreenService.stopLoading();
              this.close();
              // this.modal_dismiss_edit_attendance();
              // this.GetEmployeeAttendanceDetails(this.employeeAttendance, this._payrollInputSubmission)
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

              if (this.LstEntitlementAvailmentRequestDetails != null && this.LstEntitlementAvailmentRequestDetails.length > 0 && this.LstEntitlementAvailmentRequestDetails.find(aa => aa.EARId == index.Id && moment(aa.AttendanceDate).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD') && aa.Status == 1) != undefined) {

                // startDate
                console.log('index :', index);
                console.log('form value : ', this.AttendForm.value);
                console.log('startDate :', startDate);
                console.log(_appliedListofDates.filter(a => moment(a.date).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')).length);

                // isExists == false ? _appliedListofDates.length > 0 && _appliedListofDates.filter(a => moment(a.date).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')).length > 0 ? isExists = true : isExists = false : null;
                // console.log('isExists', isExists);
                let appliedfrom = moment(new Date(this.AttendForm.get('AppliedFrom').value)).format('YYYY-MM-DD')
                let appliedtill = moment(new Date(this.AttendForm.get('AppliedTill').value)).format('YYYY-MM-DD')
                while (moment(appliedfrom) <= moment(appliedtill)) {
                  if (moment(appliedfrom).format('YYYY-MM-DD') == moment(startDate).format('YYYY-MM-DD')) {
                    // if(index.IsAppliedForFirstHalf == true && this.AttendForm.get('IsAppliedForFirstHalf').value == true){
                    //   console.log('sssxxxx');

                    // }else if( index.IsAppliedFromSecondHalf == true && this.AttendForm.get('IsAppliedFromSecondHalf').value == true){
                    //   console.log('aaaasss');
                    // }
                    // else if( index.IsAppliedTillFirstHalf == true && this.AttendForm.get('IsAppliedTillFirstHalf').value == true){
                    //   console.log('ssssssggg');
                    // }
                    // else if( index.IsAppliedTillSecondHalf == true && this.AttendForm.get('IsAppliedTillSecondHalf').value == true){
                    //   console.log('scccss');
                    // }
                    isExists = true;
                    res(isExists);
                    break;
                  }
                  appliedfrom = moment(appliedfrom).add(1, 'days').format("YYYY-MM-DD");
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

  getAttendanceRecord() {
    this.attendanceService.GetAttendanceDataByEmployeeId(this.EmployeeObject.Id, (new Date(this.JObject.preferredDate).getMonth() + 1), new Date(this.JObject.preferredDate).getFullYear())
      .subscribe((response) => {
        let apiResult: apiResult = response;
        if (apiResult.Status) {
          var _employeeBasicAttendanceDefinition = JSON.parse(apiResult.Result);

          this.LstEntitlementAvailmentRequestDetails = _employeeBasicAttendanceDefinition.LstEntitlementAvailmentRequestDetails;

        } else {
          // this.loadingScreenService.stopLoading();
          console.error('EXECEPTION ERROR LINE NO : 312');
        }


      })

  }
  GetEntitlementAvailmentRequests() {
    this.isrendering_spinner = true
    this.attendanceService.GetEntitlementAvailmentRequests(this.EmployeeObject.Id).subscribe((result) => {
      console.log('RES ENTITLEMENT AVAILMENT ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        try {
          this.isrendering_spinner = false
          this._entitlementAvailmentRequests = apiResult.Result as any;
          var _statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;

        } catch (error) {
          this.isrendering_spinner = false
          this.alertService.showWarning(error);

        }
      } else {
        this.isrendering_spinner = false

        // this.alertService.showWarning('There are no records left.');

      }
    }, err => {
      console.warn('ERR ::', err);

    })
  }

  close() {
    this.activeModal.close('Modal Closed');
  }



  GetHolidayCalendarBasedOnApplicability() {
    (async () => {
      try {


        // this.searchService.getESSDashboardDetails(this.EmployeeObject.EmployeeCode).subscribe((result) => {
        //   let apiResult: apiResult = result;
        //   if (apiResult.Status) {
        // var jsonObj = JSON.parse(apiResult.Result);

        this.getAttendanceRecord();

        this._employeeDOJ = this.EmployeeObject.EmploymentContracts[0].StartDate;
        this._from_minDate = new Date(this._employeeDOJ);
        this._from_minDate.setMonth(this._from_minDate.getMonth());
        this._from_minDate.setDate(this._from_minDate.getDate());
        this._from_minDate.setFullYear(this._from_minDate.getFullYear());
        this.GetEntitlementAvailmentRequests();

        this.attendanceService.GetHolidayCalendarBasedOnApplicability(1, this.EmployeeObject.EmploymentContracts[0].ClientId, this.EmployeeObject.EmploymentContracts[0].ClientContractId, this.EmployeeObject.EmploymentContracts[0].TeamId, 0, 0, this.EmployeeObject.Id)
          // await this.attendanceService.GetHolidayCalendarBasedOnApplicability(0, this.EmploymentContracts.ClientId, this.EmploymentContracts.ClientContractId, this.EmploymentContracts.TeamId, 0, 0, this.EmploymentContracts.EmployeeId)
          .subscribe((result) => {
            let apiresult: apiResult = result;
            if (apiresult.Status) {
              var data = apiresult.Result as any;
              console.log('HOLIDAY LIST ::', data);
              try {
                if (data != null) {
                  this.LstHolidays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 1 || a.Type == 2) : []
                  // this.LstNonPayabledays = data.HolidayList != null && data.HolidayList.length > 0 ? data.HolidayList.filter(a => a.Type == 2) : []


                }

              } catch (error) {
                console.log('HOLIDAY EXE :', error);

              }
            }

          })
        //   }
        // }, err => {

        // });
      } catch (error) {
        this.alertService.showWarning('Holiday calendar list not found. ' + error);
        return;
      }

    })();
  }


  workingDaysBetweenDates = (d0, d1) => {
    /* Two working days and an sunday (not working day) */
    var holidays = ['2021-07-03', '2021-07-05', '2021-07-07'];
    var startDate = new Date(d0);
    var endDate = new Date(d1);

    var s1 = new Date(startDate);
    var e1 = new Date(endDate);

    // Validate input
    if (endDate < startDate) {
      return 0;
    }

    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1);  // Start just after midnight
    endDate.setHours(23, 59, 59, 999);  // End just before midnight
    var diff = ((endDate as any) - (startDate as any));  // Milliseconds between datetime objects    
    var days = Math.ceil(diff / millisecondsPerDay);

    // Subtract two weekend days for every week in between
    // var weeks = Math.floor(days / 7);
    // days -= weeks * 2;

    // Handle special cases
    // var startDay = startDate.getDay();
    // var endDay = endDate.getDay();
    // Remove weekend not previously removed.   
    // if (startDay - endDay > 1) {
    //   days -= 2;
    // }
    // Remove start day if span starts on Sunday but ends before Saturday
    // if (startDay == 0 && endDay != 6) {
    //   days--;  
    // }
    // // Remove end day if span ends on Saturday but starts after Sunday
    // if (endDay == 6 && startDay != 0) {
    //   days--;
    // }
    if (!this.employeeEntitlement.Definition.IsHolidayInclusive) {
      /* Here is the code */
      this.LstHolidays != null && this.LstHolidays.length > 0 && this.LstHolidays.forEach(day => {

        if ((moment(day.Date).format('YYYY-MM-DD') >= moment(d0).format('YYYY-MM-DD')) && (moment(day.Date).format('YYYY-MM-DD') <= moment(d1).format('YYYY-MM-DD'))) {
          //  var  day1 = new Date(day);
          /* If it is not saturday (6) or sunday (0), substract it */
          // if ((day1.getDay() % 6) != 0) {
          days--;
          // }
        }
      });

      while (moment(s1) <= moment(e1)) {
        const weekEndDays = new Date(s1);
        if (this.weekOffs.includes(weekEndDays.getDay()) == true) {
          days--;
        }
        s1 = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD') as any;

      }
    }
    return days;
  }

  ValidateLeaveRequestIsValidToUpdate() {
    const promse = new Promise((res, rej) => {
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
      this.attendanceService.ValidateLeaveRequestIsValidToUpdate(this.EvtReqId, this.CurrentDateTime)
        .subscribe((result) => {
          console.log('validateion respn', result);
          let apiresult: apiResult = result;
          if (apiresult.Status && apiresult.Result != null) {
            var validatedResult = JSON.parse(apiresult.Result);
            if (validatedResult[0].IsValidForUpdate == false) {
              this.alertService.showWarning(validatedResult[0].Remarks);
              res(false);
              return;
            } else {
              res(true);
            }
          } else {

          }



        })
    })
    return promse;
  }


  onFileUpload(e) {
    this.isLoading = true;
    const file = e.target.files[0];
    this.onFileReader(e, this._employeeId).then((s3DocumentId) => {
      this.isLoading = false;
      if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
        this.AttendForm.controls['AdditionalDocumentName'].setValue(file.name);
        this.AttendForm.controls['AdditionalDocumentId'].setValue(s3DocumentId);
      } else {

      }
    })
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
        if (isGuid(this.AttendForm.value.Id) || this.AttendForm.value.Id == 0) {
          this.deleteAsync(this.AttendForm.value.AdditionalDocumentId);
        }
        // else if (this.firstTimeDocumentId != this.DocumentId) {
        //   this.deleteAsync();
        // }
        else {
          this.unsavedDocumentLst.push(this.AttendForm.value.AdditionalDocumentId);
          this.AttendForm.controls['AdditionalDocumentName'].setValue(null);
          this.AttendForm.controls['AdditionalDocumentId'].setValue(null);
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



  deleteAsync(DocumentId) {

    const promise = new Promise((resolve, reject) => {
      this.isLoading = true;
      this.fileUploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          this.isLoading = false;
          if (apiResult.Status) {
            var index = this.unsavedDocumentLst.map(function (el) {
              return el.Id
            }).indexOf(DocumentId)
            this.unsavedDocumentLst.splice(index, 1);
            this.AttendForm.controls['AdditionalDocumentName'].setValue(null);
            this.AttendForm.controls['AdditionalDocumentId'].setValue(null);
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            resolve(true);
          } else {
            this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message);
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
  unsavedDeleteFile(_DocumentId) {
    this.fileUploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(_DocumentId)
          this.unsavedDocumentLst.splice(index, 1)
        } else {
        }
      } catch (error) {
      }
    }), ((err) => {
    })
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

}
