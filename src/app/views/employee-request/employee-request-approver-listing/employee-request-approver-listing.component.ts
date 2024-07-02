import { Component, HostListener, OnInit, Type } from '@angular/core';
import * as _ from 'lodash';
//import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from "sweetalert2";
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { DataSource, PageLayout } from '../../personalised-display/models';
import { DataSourceType, SearchPanelType } from '../../personalised-display/enums';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, BsDropDownService, FieldType, Filters, OnEventArgs, FileType } from 'angular-slickgrid';
import { AlertService, EmployeeService, ExcelService, HeaderService, PagelayoutService, PayrollService } from 'src/app/_services/service';
import { EntitlementAvailmentRequest, EntitlementRequestStatus, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { elementAt } from 'rxjs-compat/operator/elementAt';
import { EmployeeRequest } from 'src/app/_services/model/Attendance/EmployeeRequest';
import { EmployeeRequestStatus, CompensationDetailsStatus } from 'src/app/_services/model/Attendance/enums'
import { I } from '@angular/cdk/keycodes';
import { NzLayoutComponent } from 'ng-zorro-antd';
import { angularEditorConfig } from '@kolkov/angular-editor/lib/config';
@Component({
  selector: 'app-employee-request-approver-listing',
  templateUrl: './employee-request-approver-listing.component.html',
  styleUrls: ['./employee-request-approver-listing.component.css']
})
export class EmployeeRequestApproverListingComponent implements OnInit {
  cardslenght: string;
  cardsArr: any[] = [];
  SelectedWoWObj: any;
  SelectedOdObj: any;
  SelectedWfhObj: any;
  SelectedPermissionObj: any;
  submitType: any;
  bulkSubmitArry: any[] = [];
  SelectedObj: any;
  DisplayName: any;
  CheckdVal: any;
  sessionDetails: LoginResponses;
  code: string;
  spinner: boolean = false;
  dummyLeaveArr: any = [];
  selectedLeaveType: any;
  selectedItems: any[];
  PermissionArr: any = [];
  OdArr: any[] = [];
  WfhArr: any[] = [];
  WeekOffArr: any = [];
  viewHistoryText: string = 'View History';
  IsAdvancedView: boolean = false;
  isEnabled: any;
  _entitlementList: any[] = [];
  _limitedEntitlementList: any[] = [];
  inEmployeesInitiateSelectedItems: any[];
  ActualReamingDayIfNegativeAllowed: any = 0;
  inEmployeesInitiateDataView: any;
  EntitlementDefinitionList: any[] = [];
  CurrentDateTime: any = null;
  isLOP: boolean = false;
  EvtReqId: any = 0;
  leaveForm: FormGroup;
  remainingDays: any = 0;
  count_applied: any = 0;
  count_approved: any = 0;
  count_rejected: any = 0;
  count_totalDays: any = 0;
  seemoreTxt: any = 'view other leave balances';
  showOtherEntitlment: boolean = false;
  isManagerIdBased: boolean = false;
  MaxAllowedNegativeBalance: any = 0;
  _entitlementAvailmentRequestsApprovals: EntitlementAvailmentRequest[] = [];
  inEmployeesInitiateColumnDefinitions: Column[];
  rowData: EntitlementAvailmentRequest = new EntitlementAvailmentRequest();
  IsNegativeUnitAllowed: boolean = false;
  isZeroEligibleDays: boolean = false;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  isOpened: boolean = false;
  selectedProxyUserId: any = -2;
  inEmployeesInitiateList = [];
  _proxyUserList: any[] = [];
  IsProxyAvailable: boolean = false;
  selectedYearId: any;
  selectedMonthId: any;
  NameofMonth: any;
  NameofYear: any;
  monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  _leaveRequestStatusList: any[] = [];
  _requestMonthList: any[] = [];
  _employeeId: any;
  _employeeName: any;
  pageLayout: PageLayout = null;
  WowClimeTypeArr: any[] = [];
  // FILTER 
  _employeeList: any[] = [];
  LastHistoryReqArr: any[] = [];
  cardType: any;
  _from_minDate: any;
  isMobileResolution: boolean;

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }
  selectedAttributes: any = 0;

  constructor(
    private alertService: AlertService,
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private attendanceService: AttendanceService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private formBuilder: FormBuilder,
    private pageLayoutService: PagelayoutService,
    private headerService: HeaderService,


  ) {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
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

  Get_EntitlementAvailmentRequestsForApproval() {
    this.spinner = true;
    this.attendanceService.GetEntitlementAvailmentRequestsForApproval().subscribe((result) => {
      this.spinner = false;
      console.log('RES ENTITLEMENTLIST REQ APPROVALS ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this._entitlementAvailmentRequestsApprovals = apiResult.Result as any;

        var _statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
        this._entitlementAvailmentRequestsApprovals.length > 0 && this._entitlementAvailmentRequestsApprovals.forEach(ele => {
          // ele['EntitlementTypeName'] = "Leave"
          // ele['EntitlementName'] = this._entitlementList.length > 0 ? this._entitlementList.find(a => a.Id == ele.EntitlementId).DisplayName : '---';
          ele['StatusName'] = _statusList.find(z => z.id == ele.Status).name
          ele['isSelected'] = false;
        });
        // this._entitlementAvailmentRequestsApprovals = this._entitlementAvailmentRequestsApprovals
        //   .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
        // // this.collectionSize = this._entitlementAvailmentRequestsApprovals.length;
        // this._entitlementAvailmentRequestsApprovals = _.orderBy(this._entitlementAvailmentRequestsApprovals, ["AppliedOn"], ["asc"]);;
        console.log('ENTI ::', this._entitlementAvailmentRequestsApprovals);
        if (this.sessionService.getSessionStorage('selectedLeaveProxyId') != null && this.sessionService.getSessionStorage('selectedLeaveProxyId') != undefined && this.sessionService.getSessionStorage('selectedLeaveProxyId') == '') {
          this.selectedProxyUserId = (this.sessionService.getSessionStorage('selectedLeaveProxyId') == '' || this.sessionService.getSessionStorage('selectedLeaveProxyId') == undefined) ? null : this.sessionService.getSessionStorage('selectedLeaveProxyId')
        } else {
          this.selectedProxyUserId = -2;
        }

        this.onChange_filter(null, null);
        this.spinner = false;
      }
      else {
        this.alertService.showWarning('There are no records left.');
        this.spinner = false;

      }

    }, err => {
      console.warn('  ERR ::', err);
    })
  }
  ngOnInit() {
    //debugger;
    this.cardType = 'Leave';
    this.titleService.setTitle("employeerequest");
    this.LastHistoryReqArr = [];
    this.cardslenght = `grid sm:grid-cols-1 gap-6`;
    this.attendanceService.GetInitManagerCardsSrvc().subscribe((result) => {
      // debugger;
      console.log('GET InitCard Result ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this.cardsArr = JSON.parse(apiResult.Result);
        this.cardsArr = this.cardsArr.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        this.cardslenght = `grid sm:grid-cols-${this.cardsArr.length} gap-6`;

        console.log('cardsArr ::', this.cardsArr);
        this.cardsArr != null && this.cardsArr.length > 0 && this.cardsArr.forEach(ele => {
          ele["CombiledDisplayNameCount"] = `${ele.DisplayName} (${ele.Count})`;
        });
        this.selectedAttributes = 1;
        this.isEnabled = 1;
        this.initCardsGetFn();
      }
      else {
        this.alertService.showWarning('Error occured');
        this.loadingScreenService.stopLoading();
        result = [];
      }
      // this.cardsArr.forEach(element => {
      // });
      // this.cardslenght = `grid sm:grid-cols-${this.cardsArr.length} gap-6`;
    })
  }
  initCardsGetFn() {
    this._leaveRequestStatusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
    this.WowClimeTypeArr = [{ id: 1, ClimeType_Name: 'None', ClimeType_Val: 0, Clime_ModelVal: "" }, { id: 2, ClimeType_Name: 'Leave', ClimeType_Val: 300, Clime_ModelVal: "" }, { id: 3, ClimeType_Name: 'Decide later', ClimeType_Val: 100, Clime_ModelVal: "" }];
    var obj2 = [200, 500];
    this._leaveRequestStatusList = this._leaveRequestStatusList.filter(i => !obj2.includes(i.id));
    this.makeMonthList();
    this.onRefresh();
  }

  onRefresh() {
    //this.PermissionArr = [{ EntitlementId: 2, EmployeeId: 15001, EntitlementCode: 'CL', Id: '1', Status: 600, empcode: 101, empname: "Rahul", noOfRequests: 2, Date: "2021-09-29T12:35:37", StartTime: "12:35", EndTime: "14:36", TotalSubmitHours: '1' }, { empcode: 102, empname: "Rahul", noOfRequests: 2, Date: "2021-09-29T12:35:37", StartTime: "12:35", EndTime: "14:36", TotalSubmitHours: '1' }, { empcode: 103, empname: "Rahul", noOfRequests: 2, Date: "2021-09-29T12:35:37", StartTime: "12:35", EndTime: "14:36", TotalSubmitHours: '1' }, { empcode: 104, empname: "Rahul", noOfRequests: 2, Date: "2021-09-29T12:35:37", StartTime: "12:35", EndTime: "14:36", TotalSubmitHours: '1' }]
    this.inEmployeesInitiateList = [];
    this.CheckdVal = false;
    this.spinner = true;
    this.isEnabled = '1';
    this.inEmployeesInitiateSelectedItems = [];
    this.inEmployeesInitiateList = [];
    this.createForm();
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.Get_EntitlementAvailmentRequestsForApproval();

    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        this.isManagerIdBased = true;
        this.get_pagelayout().then((result) => {
          this.Get_EntitlementAvailmentRequestsForApprovalByManagerId(encodedIdx);
        });
      } else {
        this.isManagerIdBased = false;
        this.get_pagelayout().then((result) => {
          this.Get_EntitlementAvailmentRequestsForApproval();
        });
      }
    });
    this.getEntitlementDefinitionDataset();
    // this.permissionReqGridGetFn();
    // this.GetWOWGridGetFn();
  }
  /*work on week off grid date field mindate set*/
  mindateFn(data) {
    for (var i in this.WeekOffArr) {
      if (this.WeekOffArr[i].Id == data.Id) {
        this._from_minDate = this.WeekOffArr[i].Date
        break;
      }
    }
    // if (!this._from_minDate) {
    //   // this._from_minDate = moment(data, "DD-MM-YYYY").add(1, 'days');
    //   this._from_minDate = data;
    // }
    return new Date(this._from_minDate);
  }
  async makeMonthList() {
    var today = new Date();
    let _requestMonthList_local = [];
    _requestMonthList_local = [
      {
        id: -1,
        name: 'Allday'
      }
    ]
    this.selectedYearId = today.getFullYear();
    this.selectedMonthId = (today.getMonth() + 1)
    this.monthNames.forEach(function (value, i) {
      _requestMonthList_local.push({
        id: i + 1,
        name: `${value}`
      })
    });

    this._requestMonthList = _requestMonthList_local;

  }
  bulk_approve_reject(whichaction, type) {
    this.cardType = type;
    if (whichaction == true && this.inEmployeesInitiateSelectedItems.filter(a => a.Status == 400).length > 0) {
      this.alertService.showWarning('Action was blocked : Invalid Leave request - that leave request is already approved.')
      return;
    }

    if (this.cardType != 'Leave' && this.inEmployeesInitiateSelectedItems.filter(a => a.CancelStatus != 100 && a.Status != 100 && a.Status != 600).length > 0) {
      this.alertService.showWarning('Action was blocked : Invalid Leave request - that leave request is already rejected/cancelled.')
      return;
    }


    var IsAllowToCancel: boolean = false;
    for (let index = 0; index < this.EntitlementDefinitionList.length; index++) {
      const e = this.EntitlementDefinitionList[index];
      for (let j = 0; j < this.inEmployeesInitiateSelectedItems.length; j++) {
        const ee = this.inEmployeesInitiateSelectedItems[j];
        if (e.EntitlementId == ee.EntitlementId) {
          let formattedADOJ = moment(ee.AppliedFrom).format('YYYY-MM-DD')
          var currentDate = moment().format('YYYY-MM-DD');
          var diff = this.workingDaysBetweenDates1(currentDate, formattedADOJ);
          console.log('DIFF :: ', diff);
          console.log('e', e);

          if (e.IsAllowToCancelPastDayRequest == true && e.MaximumAllowedPastDays > 0 && e.MaximumAllowedPastDays > diff) {
          }
          else {
            IsAllowToCancel = true;
            break;
          }
        }

      }
    }

    if (IsAllowToCancel == true && this.inEmployeesInitiateSelectedItems.filter(a => a.Status == 300 || a.Status == 400).length > 0) {
      var textmsg = whichaction == true ? 'Approved' : 'Rejected';
      this.alertService.showWarning(`Action blocked: Request for Leave Not Valid - one or more requests for leave have no authority to cancel the ${textmsg}  leave.`);
      return;
    }


    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
    this.common_approve_reject('Multiple', whichaction, '', 'parent', 'none');

  }

  onSelectedEmployeeChange(typ, data, value: boolean) {
    // this.inEmployeesInitiateSelectedItems = [];
    if (typ == 'M') {
      if (value == true) {
        this.CheckdVal = true;
        data.forEach(element => { element.Select_Val = true; });
        this.inEmployeesInitiateSelectedItems = [];
        this.inEmployeesInitiateSelectedItems = data;
      }
      else if (value == false) {
        this.CheckdVal = false;
        data.forEach(element => { element.Select_Val = false; });
        this.inEmployeesInitiateSelectedItems = [];
      }
    }
    else if (typ == 'S') {
      if (value == true) {
        //data.Select_Val = true;
        this.inEmployeesInitiateSelectedItems = [];
        data.forEach((obj, idx) => {
          if (obj.Select_Val == true) {
            this.inEmployeesInitiateSelectedItems.push(obj);
          }
        })
      }
      else if (value == false) {
        // data.Select_Val = false;
        this.inEmployeesInitiateSelectedItems = [];
        data.forEach((obj, idx) => {
          if (obj.Select_Val == true) {
            this.inEmployeesInitiateSelectedItems.push(obj);
          }
        })
      }
    }

    console.log('SELECTED ITEMS ::', this.inEmployeesInitiateSelectedItems);

  }
  workingDaysBetweenDates1 = (d0, d1) => {

    console.log('d', d0);
    console.log('d1', d1);

    /* Two working days and an sunday (not working day) */
    var holidays = ['2021-07-03', '2021-07-05', '2021-07-07'];
    var startDate = new Date(d0);
    var endDate = new Date(d1);

    var s1 = new Date(startDate);
    var e1 = new Date(endDate);
    // Validate input
    if (moment(endDate).format('YYYY-MM-DD') > moment(startDate).format('YYYY-MM-DD')) {
      return 0;
    }
    // Calculate days between dates
    var millisecondsPerDay = 86400 * 1000; // Day in milliseconds
    startDate.setHours(0, 0, 0, 1);  // Start just after midnight
    endDate.setHours(23, 59, 59, 999);  // End just before midnight
    var diff = ((endDate as any) - (startDate as any));  // Milliseconds between datetime objects    
    var days = Math.ceil(diff / millisecondsPerDay);


    while (moment(s1) <= moment(e1)) {
      const weekEndDays = new Date(s1);
      s1 = moment(weekEndDays).add(1, 'days').format('YYYY-MM-DD') as any;

    }

    return Math.abs(days);
  }
  common_approve_reject(_index, whichaction, item, whicharea, requestType) {
    this.SelectedObj = [];
    this.SelectedObj = item;
    console.log(parseFloat(this.leaveForm.get('AppliedUnits').value) > parseFloat(this.remainingDays));
    console.log(parseFloat(this.leaveForm.get('AppliedUnits').value));
    console.log(parseFloat(this.remainingDays));

    if (_index != 'Multiple' && this.rowData.Status != 600 && !this.IsNegativeUnitAllowed && this.isZeroEligibleDays) {
      this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
      return;
    }

    else if (_index != 'Multiple' && this.rowData.Status != 600 && this.IsNegativeUnitAllowed && parseFloat(this.leaveForm.get('AppliedUnits').value) > parseFloat(this.remainingDays)) {
      this.alertService.showWarning("Maximum allowed leave balance is currently insufficient");
      return;
    }




    // return;

    this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea, requestType);

    // this.loadingScreenService.startLoading();
    // if (this.EvtReqId != null && this.EvtReqId != 0) {
    //   this.ValidateLeaveRequestIsValidToUpdate().then((validatedResponse) => {
    //     this.loadingScreenService.stopLoading();
    //     if (validatedResponse) {
    //       this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea);
    //     }
    //   })
    // } else {
    //   this.tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea);
    // }

  }
  tiggerApiCall_LeaveRequest(_index, whichaction, item, whicharea, requestType) {

    // this.loadingScreenService.stopLoading();

    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      $('#popup_edit_attendance').modal('hide');
      $('#popup_WOW').modal('hide');
      $('#popup_editRequest').modal('hide');
      $('#popup_Permission').modal('hide');


      if (!whichaction && requestType != 'permission') {
        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true
        })
        swalWithBootstrapButtons.fire({
          title: 'Rejection Comments',
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
            _index == 'single' ? this.Bulk_validateEAR(item, jsonStr, whichaction, 'single', requestType) : _index == 'edit' ?
              this.validateEAR(jsonStr, whichaction, whicharea, requestType) : this.callMultipleFuction(whichaction, jsonStr, requestType);

          } else if (
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }
      else {
        _index == 'single' ? this.Bulk_validateEAR(item, '', whichaction, 'single', requestType) : _index == 'edit' ?
          this.validateEAR('', whichaction, whicharea, requestType) : this.callMultipleFuction(whichaction, '', requestType);
      }

    }).catch(error => {

    });
  }
  Bulk_validateEAR(item, jstring, whichaction, index, requestType) {
    //debugger;
    item = this._entitlementAvailmentRequestsApprovals.find(a => a.Id == item.Id);
    console.log('ITEM ::', item);
    var isCancellationReqest: boolean = false;
    if (item.Status == EntitlementRequestStatus.CancelApplied) {
      isCancellationReqest = true;
      // this.CancelEntitlementAvailmentRequest()
    }

    //this.loadingScreenService.startLoading();
    let currentDate = new Date();
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = whichaction == false ? 0 : item.CalculatedAppliedUnits;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(item.AppliedOn).format('YYYY-MM-DD hh:mm:ss');;
    entitlementAvailmentRequest.ValidatedOn = moment(item.currentDate).format('YYYY-MM-DD hh:mm:ss');
    entitlementAvailmentRequest.ValidatedBy = this.UserId;
    entitlementAvailmentRequest.ApplierRemarks = item.ApplierRemarks;
    entitlementAvailmentRequest.CancellationRemarks =  isCancellationReqest ? jstring : '';
    entitlementAvailmentRequest.ValidatorRemarks =  isCancellationReqest ? '' : jstring;
    entitlementAvailmentRequest.Status = isCancellationReqest ? EntitlementRequestStatus.CancelApplied : (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved);
    entitlementAvailmentRequest.AppliedBy = item.AppliedBy;
    entitlementAvailmentRequest.CalculatedAppliedUnits = item.CalculatedAppliedUnits;;
    entitlementAvailmentRequest.AppliedUnits = item.AppliedUnits;
    entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
    entitlementAvailmentRequest.Id = item.Id;
    entitlementAvailmentRequest.EmployeeId = item.EmployeeId;
    entitlementAvailmentRequest.EmployeeEntitlementId = item.EmployeeEntitlementId;
    entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
    entitlementAvailmentRequest.EntitlementId = item.EntitlementId;
    entitlementAvailmentRequest.EntitlementDefinitionId = item.EntitlementDefinitionId;
    entitlementAvailmentRequest.EntitlementMappingId = item.EntitlementMappingId;
    entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
    entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
    entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
    entitlementAvailmentRequest.AppliedFrom = moment(new Date(item.AppliedFrom)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedFromSecondHalf = item.IsAppliedFromSecondHalf;
    entitlementAvailmentRequest.IsAppliedForFirstHalf = item.IsAppliedForFirstHalf;
    entitlementAvailmentRequest.AppliedTill = moment(new Date(item.AppliedTill)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedTillFirstHalf = item.IsAppliedTillFirstHalf;
    entitlementAvailmentRequest.ActivityList = [];
    entitlementAvailmentRequest.PendingAtUserId = item.AppliedBy;
    entitlementAvailmentRequest.LastUpdatedOn = item.LastUpdatedOn; // this.CurrentDateTime;
    entitlementAvailmentRequest.ValidatedUserName = this.UserName;
    entitlementAvailmentRequest.ApprovalStatus = (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved)
    console.log('ENTILMENT REQUEST APPROVAL 2:: ', entitlementAvailmentRequest);
    //     this.loadingScreenService.stopLoading();
    // return;
    this.spinner = true;
    this.attendanceService.ValidateEntitlementAvailmentRequest(entitlementAvailmentRequest).
      subscribe((result) => {
        this.spinner = false;
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          // whichaction == false ? null : this.callback_upsertAttendance(entitlementAvailmentRequest);
          this.loadingScreenService.stopLoading();
          this.alertService.showSuccess(apiResult.Message);
        } else {
          this.alertService.showWarning(apiResult.Message);
          this.loadingScreenService.stopLoading();
        }

        index != 'Multiple' ? this.close_leaverequest_approval_slider() : null;
        index != 'Multiple' ? this.onRefresh() : null;

      }, err => {
        this.loadingScreenService.stopLoading();

      })
  }
  validateEAR(jstring, whichaction, whicharea, requestType) {
    if (this.cardType == 'Leave') {
      var isCancellationReqest: boolean = false;
      if (this.rowData.Status == EntitlementRequestStatus.CancelApplied) {
        isCancellationReqest = true;
        // this.CancelEntitlementAvailmentRequest()
      }
      // this.loadingScreenService.startLoading();
      let currentDate = new Date();
      var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
      entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
      entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
      entitlementAvailmentRequest.ApprovedTill = null;
      entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
      entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
      entitlementAvailmentRequest.ApprovedUnits = whichaction == false ? 0 : this.rowData.CalculatedAppliedUnits;
      entitlementAvailmentRequest.ApprovedFrom = null;
      entitlementAvailmentRequest.AppliedOn = moment(this.rowData.AppliedOn).format('YYYY-MM-DD hh:mm:ss');;
      entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD hh:mm:ss');
      entitlementAvailmentRequest.ValidatedBy = this.UserId;
      entitlementAvailmentRequest.ApplierRemarks = this.rowData.ApplierRemarks;
      entitlementAvailmentRequest.CancellationRemarks = '';
      entitlementAvailmentRequest.ValidatorRemarks = jstring;
      entitlementAvailmentRequest.Status = isCancellationReqest ? EntitlementRequestStatus.CancelApplied : (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved);
      entitlementAvailmentRequest.AppliedBy = this.rowData.AppliedBy;
      entitlementAvailmentRequest.CalculatedAppliedUnits = this.rowData.CalculatedAppliedUnits;
      entitlementAvailmentRequest.AppliedUnits = this.rowData.AppliedUnits;
      entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
      entitlementAvailmentRequest.Id = this.rowData.Id;
      entitlementAvailmentRequest.EmployeeId = this.rowData.EmployeeId;
      entitlementAvailmentRequest.EmployeeEntitlementId = whicharea == 'parent' ? this.rowData.EmployeeEntitlementId : this.leaveForm.get('EmployeeEntitlement').value; //;  this.rowData.EmployeeEntitlementId;
      entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
      entitlementAvailmentRequest.EntitlementId = whicharea == 'parent' ? this.rowData.EntitlementId : this.leaveForm.get('Entitlement').value; //;
      entitlementAvailmentRequest.EntitlementDefinitionId = this.rowData.EntitlementDefinitionId;
      entitlementAvailmentRequest.EntitlementMappingId = this.rowData.EntitlementMappingId;
      entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
      entitlementAvailmentRequest.ApplicablePayPeriodId = 0;
      entitlementAvailmentRequest.ApplicableAttendancePeriodId = 0;
      entitlementAvailmentRequest.AppliedFrom = moment(new Date(this.rowData.AppliedFrom)).format('YYYY-MM-DD');
      entitlementAvailmentRequest.IsAppliedFromSecondHalf = this.rowData.IsAppliedFromSecondHalf;
      entitlementAvailmentRequest.IsAppliedForFirstHalf = this.rowData.IsAppliedForFirstHalf;
      entitlementAvailmentRequest.AppliedTill = moment(new Date(this.rowData.AppliedTill)).format('YYYY-MM-DD');
      entitlementAvailmentRequest.IsAppliedTillFirstHalf = this.rowData.IsAppliedTillFirstHalf;
      entitlementAvailmentRequest.ActivityList = [];
      entitlementAvailmentRequest.PendingAtUserId = this.rowData.AppliedBy;
      entitlementAvailmentRequest.LastUpdatedOn = this.rowData.LastUpdatedOn; // this.CurrentDateTime;
      entitlementAvailmentRequest.ApprovalStatus = (whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved)
      entitlementAvailmentRequest.ValidatedUserName = this.UserName;

      console.log('ENTILMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);
      // this.loadingScreenService.stopLoading();
      // return; 
    }
    else {
      // this.loadingScreenService.stopLoading();
      var EmployeeRequestlist = new EmployeeRequest();
      EmployeeRequestlist.Id = this.SelectedObj.Id;
      EmployeeRequestlist.EmployeeId = this.SelectedObj.EmployeeId
      EmployeeRequestlist.Type = this.SelectedObj.Type;/*no explination*/
      EmployeeRequestlist.TotalTime = this.SelectedObj.TotalTime;
      EmployeeRequestlist.TotalApprovedTime = this.SelectedObj.TotalApprovedTime;
      EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = this.SelectedObj.EmployeeAttendanceBreakUpDetailsId;
      EmployeeRequestlist.Date = this.SelectedObj.Date;
      EmployeeRequestlist.StartTime = this.SelectedObj.StartTime;
      EmployeeRequestlist.EndTime = this.SelectedObj.EndTime;
      EmployeeRequestlist.ApprovedStartTime = this.SelectedObj.ApprovedStartTime;
      EmployeeRequestlist.ApprovedEndTime = this.SelectedObj.ApprovedEndTime;
      EmployeeRequestlist.IsPermissionAllowed = this.SelectedObj.IsPermissionAllowed;
      EmployeeRequestlist.IncludeInCalculation = this.SelectedObj.IncludeInCalculation;
      EmployeeRequestlist.RequestedClaimType = this.SelectedObj.RequestedClaimType;
      EmployeeRequestlist.ApprovedClaimType = this.SelectedObj.ApprovedClaimType;
      EmployeeRequestlist.IsCompOffApplicable = this.SelectedObj.IsCompOffApplicable;
      EmployeeRequestlist.ModuleProcessTransactionId = this.SelectedObj.ModuleProcessTransactionId;
      EmployeeRequestlist.EmployeeRemarks = this.SelectedObj.EmployeeRemarks;
      EmployeeRequestlist.ApproverRemarks = requestType == 'decline' ? jstring : (this.SelectedObj.ApproverRemarks || this.rowData.ApplierRemarks);
      EmployeeRequestlist.Status = this.SelectedObj.CancelStatus != 100 ? (whichaction == true ? EmployeeRequestStatus.Approved : EmployeeRequestStatus.Rejected) : this.SelectedObj.Status;/*Dynamic*/
      EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
      EmployeeRequestlist.Message = "";/*no eplination*/
      EmployeeRequestlist.ExpireOn = this.SelectedObj.ExpireOn ? moment(this.SelectedObj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';/*no explination*/
      EmployeeRequestlist.ApprovedExpireOn = this.SelectedObj.ApprovedExpireOn ? moment(this.SelectedObj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.FromDate = this.SelectedObj.dateRange ? moment(this.SelectedObj.dateRange[0]).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.TillDate = this.SelectedObj.dateRange ? moment(this.SelectedObj.dateRange[1]).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.CancelStatus = (whichaction == true && this.SelectedObj.CancelStatus == 100) ? 300 : ((whichaction == false && this.SelectedObj.CancelStatus == 100) ? 200 : 0);
      console.log('submitedObj', EmployeeRequestlist);
    }


    if (this.cardType == 'Leave') {
      this.spinner = true;
      this.attendanceService.ValidateEntitlementAvailmentRequest(entitlementAvailmentRequest).
        subscribe((result) => {
          this.spinner = false;
          let apiResult: apiResult = result;
          if (apiResult.Status) {
            // whichaction == true ? this.callback_upsertAttendance(entitlementAvailmentRequest) : null;
            this.alertService.showSuccess(apiResult.Message);
            this.loadingScreenService.stopLoading();

          } else {
            this.alertService.showWarning(apiResult.Message);
            this.loadingScreenService.stopLoading();

          }
          this.close_leaverequest_approval_slider();
          // whichaction == false ? this.onRefresh() : null;
          this.onRefresh()
          this.Get_EntitlementAvailmentRequestsForApproval();
        }, error => {
          this.spinner = false;
          console.log(error);
          this.alertService.showInfo('Submission Failed');
        });
    }
    if (this.submitType == 'single') {
      if (this.cardType == 'Permission') {
        this.bulkSubmitArry = [];
        this.bulkSubmitArry.push(EmployeeRequestlist);
        this.spinner = true;
        this.loadingScreenService.startLoading();
        this.attendanceService.Post_Per_Aprove_Reject_Request(this.bulkSubmitArry).subscribe((result) => {
          //debugger;
          this.spinner = false;
          this.loadingScreenService.stopLoading();
          if (whichaction == true && result.Status) {
            this.alertService.showSuccess(result.Message);
            this.permissionReqGridGetFn();
            this.closePermissionPopup();
          }
          else if (whichaction == false && result.Status) {
            this.alertService.showSuccess(result.Message);
            this.permissionReqGridGetFn();
          }
          this.loadingScreenService.stopLoading();
          this.close_leaverequest_approval_slider();
        }, error => {
          this.spinner = false;
          console.log(error);
          this.alertService.showInfo('Submission Failed');
          this.loadingScreenService.stopLoading();
        });
      }
      else if (this.cardType == 'WeakOff') {
        this.bulkSubmitArry = [];
        this.bulkSubmitArry.push(EmployeeRequestlist);
        this.spinner = true;
        this.loadingScreenService.startLoading();
        // if (this.bulkSubmitArry) {
        //   for (var i in this.bulkSubmitArry) {
        //     if (this.bulkSubmitArry[i].ExpireOn) {

        //     }
        //     else {
        //       this.loadingScreenService.stopLoading();
        //       this.spinner = false;
        //       this.alertService.showWarning('Expiry date is invalid.');
        //       return;
        //     }
        //   }

        // }
        this.attendanceService.Post_WOW_Aprove_Reject_Request(this.bulkSubmitArry).subscribe((result) => {
          this.spinner = false;
          this.loadingScreenService.stopLoading();
          //debugger;
          if (whichaction == true && result.Status) {
            this.alertService.showSuccess(result.Message);
            $('#popup_WOW').modal('hide');
            this.GetWOWGridGetFn();
          }
          else if (whichaction == false && result.Status) {
            this.alertService.showSuccess(result.Message);
            $('#popup_WOW').modal('hide');
            this.GetWOWGridGetFn();
          }
          //this.loadingScreenService.stopLoading();
          this.close_leaverequest_approval_slider();
        }, error => {
          // this.spinner = false;
          console.log(error);
          this.alertService.showInfo('Submission Failed');
          this.loadingScreenService.stopLoading();
        });
      }
      else if (this.cardType == 'Od') {
        this.bulkSubmitArry = [];
        this.bulkSubmitArry.push(EmployeeRequestlist);
        // this.bulkSubmitArry.forEach(obj => {
        //   obj.FromDate = obj.dateRange[0];
        //   obj.TillDate = obj.dateRange[1];
        //   delete obj.dateRange;
        // });
        this.spinner = true;
        this.loadingScreenService.startLoading();
        //debugger;
        console.log('OdsubmitedObj', this.bulkSubmitArry);
        this.attendanceService.postManagerOdAproveReject(this.bulkSubmitArry).subscribe((result) => {
          this.spinner = false;
          this.loadingScreenService.stopLoading();
          //debugger;
          if (whichaction == true && result.Status) {
            this.alertService.showSuccess(result.Message);
            $('#popup_Od').modal('hide');
            this.GetOdGridGetFn();
          }
          else if (whichaction == false && result.Status) {
            this.alertService.showSuccess(result.Message);
            $('#popup_Od').modal('hide');
            this.GetOdGridGetFn();
          }
          //this.loadingScreenService.stopLoading();
          this.close_leaverequest_approval_slider();
        }, error => {
          // this.spinner = false;
          console.log(error);
          this.alertService.showInfo('Submission Failed');
          this.loadingScreenService.stopLoading();
        });
      }
      else if (this.cardType == 'Wfh') {
        this.bulkSubmitArry = [];
        this.bulkSubmitArry.push(EmployeeRequestlist);
        // this.bulkSubmitArry.forEach(obj => {
        //   obj.FromDate = obj.dateRange[0];
        //   obj.TillDate = obj.dateRange[1];
        //   delete obj.dateRange;
        // });
        this.spinner = true;
        this.loadingScreenService.startLoading();
        console.log('WfhsubmitedObj', this.bulkSubmitArry);
        //debugger;
        this.attendanceService.postManagerWfhAproveReject(this.bulkSubmitArry).subscribe((result) => {
          this.spinner = false;
          this.loadingScreenService.stopLoading();
          //debugger;
          if (whichaction == true && result.Status) {
            this.alertService.showSuccess(result.Message);
            $('#popup_Wfh').modal('hide');
            this.GetWfhGridGetFn();
          }
          else if (whichaction == false && result.Status) {
            this.alertService.showSuccess(result.Message);
            $('#popup_Wfh').modal('hide');
            this.GetWfhGridGetFn();
          }
          //this.loadingScreenService.stopLoading();
          this.close_leaverequest_approval_slider();
        }, error => {
          // this.spinner = false;
          console.log(error);
          this.alertService.showInfo('Submission Failed');
          this.loadingScreenService.stopLoading();
        });
      }
    }
  }
  callMultipleFuction(whichaction, jsonStr, requestType) {

    // this.loadingScreenService.startLoading();
    let count = 0;
    this.bulkSubmitArry = [];
    this.inEmployeesInitiateSelectedItems.length > 0 && this.inEmployeesInitiateSelectedItems.forEach(item => {
      count = count + 1;
      console.log('count :', count);
      if (this.cardType == 'Permission') {
        this.Bulk_Approve_Reject_Permission(whichaction, item, jsonStr);
      }
      else if (this.cardType == 'WeakOff') {
        this.Bulk_Approve_Reject_WeekOff(whichaction, item, jsonStr);
      }
      else if (this.cardType == 'Od') {
        this.Bulk_Approve_Reject_Od(whichaction, item, jsonStr);
      }
      else if (this.cardType == 'Wfh') {
        this.Bulk_Approve_Reject_Wfh(whichaction, item, jsonStr);
      }
      else {
        this.Bulk_validateEAR(item, '', whichaction, 'Multiple', requestType);
      }
    });
    //debugger;
    console.log('submitedObj', this.bulkSubmitArry);
    if (this.cardType == 'Permission') {
      this.spinner = true;
      this.attendanceService.Post_Per_Aprove_Reject_Request(this.bulkSubmitArry).subscribe((result) => {
        //debugger;
        if (whichaction == true && result.Status) {
          this.alertService.showSuccess(result.Message);
          this.permissionReqGridGetFn();
        }
        else if (whichaction == false && result.Status) {
          this.alertService.showSuccess(result.Message);
          this.permissionReqGridGetFn();
        }
        this.loadingScreenService.stopLoading();
        this.close_leaverequest_approval_slider();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      });;

    }
    else if (this.cardType == 'WeakOff') {
      // if (this.bulkSubmitArry) {
      //   for (var i in this.bulkSubmitArry) {
      //     if (this.bulkSubmitArry[i].ExpireOn) {

      //     }
      //     else {
      //       this.loadingScreenService.stopLoading();
      //       this.spinner = false;
      //       this.alertService.showWarning('Expiry date is invalid.');
      //       return;
      //     }
      //   }

      // }
      this.spinner = true;
      this.attendanceService.Post_WOW_Aprove_Reject_Request(this.bulkSubmitArry).subscribe((result) => {
        //debugger;
        if (whichaction == true) {
          this.alertService.showSuccess(result.Message);
          this.GetWOWGridGetFn();
        }
        else {
          this.alertService.showSuccess(result.Message);
          this.GetWOWGridGetFn();
        }
        this.loadingScreenService.stopLoading();
        this.close_leaverequest_approval_slider();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      });

    }
    else if (this.cardType == 'Od') {
      this.spinner = true;
      //debugger;
      this.attendanceService.postManagerOdAproveReject(this.bulkSubmitArry).subscribe((result) => {
        //debugger;
        if (whichaction == true) {
          this.alertService.showSuccess(result.Message);
          this.GetOdGridGetFn();
        }
        else {
          this.alertService.showSuccess(result.Message);
          this.GetOdGridGetFn();
        }
        this.loadingScreenService.stopLoading();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      });

    }
    else if (this.cardType == 'Wfh') {
      this.spinner = true;
      //debugger;
      this.attendanceService.postManagerWfhAproveReject(this.bulkSubmitArry).subscribe((result) => {
        //debugger;
        if (whichaction == true) {
          this.alertService.showSuccess(result.Message);
          this.GetWfhGridGetFn();
        }
        else {
          this.alertService.showSuccess(result.Message);
          this.GetWfhGridGetFn();
        }
        this.loadingScreenService.stopLoading();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      });

    }

    if (count == this.inEmployeesInitiateSelectedItems.length) {
      if (this.cardType == 'Leave' || this.cardType == undefined) {

        this.Get_EntitlementAvailmentRequestsForApproval();
        this.onRefresh();
        this.close_leaverequest_approval_slider();
      }

    }

  }
  Bulk_Approve_Reject_Permission(aprovReject, obj, jsonRemarks) {
    obj = this.inEmployeesInitiateSelectedItems.find(a => a.Id == obj.Id);
    console.log('ITEM ::', obj);
    //this.loadingScreenService.startLoading();
    var EmployeeRequestlist = new EmployeeRequest();
    EmployeeRequestlist.Id = obj.Id;
    EmployeeRequestlist.EmployeeId = obj.EmployeeId;
    EmployeeRequestlist.Type = obj.Type;/*no explination*/
    EmployeeRequestlist.TotalTime = obj.TotalTime;
    EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
    EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
    EmployeeRequestlist.Date = obj.Date;
    EmployeeRequestlist.StartTime = obj.StartTime;
    EmployeeRequestlist.EndTime = obj.EndTime;
    EmployeeRequestlist.ApprovedStartTime = obj.ApprovedStartTime;
    EmployeeRequestlist.ApprovedEndTime = obj.ApprovedEndTime;
    EmployeeRequestlist.IsPermissionAllowed = obj.IsPermissionAllowed;
    EmployeeRequestlist.IncludeInCalculation = obj.IncludeInCalculation;
    EmployeeRequestlist.RequestedClaimType = obj.RequestedClaimType;
    EmployeeRequestlist.ApprovedClaimType = obj.ApprovedClaimType;
    EmployeeRequestlist.IsCompOffApplicable = obj.IsCompOffApplicable;
    EmployeeRequestlist.ModuleProcessTransactionId = obj.ModuleProcessTransactionId;
    EmployeeRequestlist.EmployeeRemarks = obj.EmployeeRemarks;
    EmployeeRequestlist.ApproverRemarks = obj.ApproverRemarks || jsonRemarks;
    EmployeeRequestlist.Status = obj.CancelStatus != 100 ? (aprovReject ? EmployeeRequestStatus.Approved : EmployeeRequestStatus.Rejected) : obj.Status;/*Dynamic*/
    EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
    EmployeeRequestlist.Message = "";/*no eplination*/
    EmployeeRequestlist.ExpireOn = obj.ExpireOn ? moment(obj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';/*no explination*/
    EmployeeRequestlist.ApprovedExpireOn = obj.ApprovedExpireOn ? moment(obj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01';
    // EmployeeRequestlist.FromDate = obj.dateRange ? moment(obj.dateRange[0]).format('YYYY-MM-DD') : '1900-01-01';
    // EmployeeRequestlist.TillDate = obj.dateRange ? moment(obj.dateRange[1]).format('YYYY-MM-DD') : '1900-01-01';
    EmployeeRequestlist.CancelStatus = (aprovReject && obj.CancelStatus == 100) ? 300 : ((!aprovReject && obj.CancelStatus == 100) ? 200 : 0);
    console.log('submitedObj', EmployeeRequestlist);
    this.bulkSubmitArry.push(EmployeeRequestlist);
  };
  Bulk_Approve_Reject_WeekOff(aprovReject, obj, jsonRemarks) {

    obj = this.inEmployeesInitiateSelectedItems.find(a => a.Id == obj.Id);
    console.log('ITEM ::', obj);
    //this.loadingScreenService.startLoading();
    var EmployeeRequestlist = new EmployeeRequest();
    EmployeeRequestlist.Id = obj.Id;
    EmployeeRequestlist.EmployeeId = obj.EmployeeId;
    EmployeeRequestlist.Type = obj.Type;/*no explination*/
    EmployeeRequestlist.TotalTime = obj.TotalTime;
    EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
    EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
    EmployeeRequestlist.Date = obj.Date;
    EmployeeRequestlist.StartTime = obj.StartTime;
    EmployeeRequestlist.EndTime = obj.EndTime;
    EmployeeRequestlist.ApprovedStartTime = obj.ApprovedStartTime;
    EmployeeRequestlist.ApprovedEndTime = obj.ApprovedEndTime;
    EmployeeRequestlist.IsPermissionAllowed = obj.IsPermissionAllowed;
    EmployeeRequestlist.IncludeInCalculation = obj.IncludeInCalculation;
    EmployeeRequestlist.RequestedClaimType = obj.RequestedClaimType;
    EmployeeRequestlist.ApprovedClaimType = obj.ApprovedClaimType;
    EmployeeRequestlist.IsCompOffApplicable = obj.IsCompOffApplicable;
    EmployeeRequestlist.ModuleProcessTransactionId = obj.ModuleProcessTransactionId;
    EmployeeRequestlist.EmployeeRemarks = obj.EmployeeRemarks;
    EmployeeRequestlist.ApproverRemarks = obj.ApproverRemarks || jsonRemarks;
    EmployeeRequestlist.Status = obj.CancelStatus != 100 ? (aprovReject ? EmployeeRequestStatus.Approved : EmployeeRequestStatus.Rejected) : obj.Status;/*Dynamic*/
    EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
    EmployeeRequestlist.Message = "";/*no eplination*/
    EmployeeRequestlist.ExpireOn = obj.ExpireOn ? moment(obj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';/*no explination*/
    EmployeeRequestlist.ApprovedExpireOn = obj.ApprovedExpireOn ? moment(obj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01'/*no eplination*/
    // EmployeeRequestlist.FromDate = obj.dateRange ? moment(obj.dateRange[0]).format('YYYY-MM-DD') : '1900-01-01';
    // EmployeeRequestlist.TillDate = obj.dateRange ? moment(obj.dateRange[1]).format('YYYY-MM-DD') : '1900-01-01';
    EmployeeRequestlist.CancelStatus = (aprovReject && obj.CancelStatus == 100) ? 300 : ((!aprovReject && obj.CancelStatus == 100) ? 200 : 0);
    this.bulkSubmitArry.push(EmployeeRequestlist);
  };
  Bulk_Approve_Reject_Od(aprovReject, obj, jsonRemarks) {
    obj = this.inEmployeesInitiateSelectedItems.find(a => a.Id == obj.Id);
    console.log('ITEM ::', obj);
    //this.loadingScreenService.startLoading();
    var EmployeeRequestlist = new EmployeeRequest();
    EmployeeRequestlist.Id = obj.Id;
    EmployeeRequestlist.EmployeeId = obj.EmployeeId;
    EmployeeRequestlist.Type = obj.Type;/*no explination*/
    EmployeeRequestlist.TotalTime = obj.TotalTime;
    EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
    EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
    // EmployeeRequestlist.Date = obj.Date;
    EmployeeRequestlist.StartTime = obj.StartTime;
    EmployeeRequestlist.EndTime = obj.EndTime;
    EmployeeRequestlist.ApprovedStartTime = obj.ApprovedStartTime;
    EmployeeRequestlist.ApprovedEndTime = obj.ApprovedEndTime;
    EmployeeRequestlist.IsPermissionAllowed = obj.IsPermissionAllowed;
    EmployeeRequestlist.IncludeInCalculation = obj.IncludeInCalculation;
    EmployeeRequestlist.RequestedClaimType = obj.RequestedClaimType;
    EmployeeRequestlist.ApprovedClaimType = obj.ApprovedClaimType;
    EmployeeRequestlist.IsCompOffApplicable = obj.IsCompOffApplicable;
    EmployeeRequestlist.ModuleProcessTransactionId = obj.ModuleProcessTransactionId;
    EmployeeRequestlist.EmployeeRemarks = obj.EmployeeRemarks;
    EmployeeRequestlist.ApproverRemarks = jsonRemarks;
    EmployeeRequestlist.Status = obj.CancelStatus != 100 ? (aprovReject ? EmployeeRequestStatus.Approved : EmployeeRequestStatus.Rejected) : obj.Status;/*Dynamic*/
    EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
    EmployeeRequestlist.Message = "";/*no eplination*/
    EmployeeRequestlist.FromDate = obj.dateRange ? moment(obj.dateRange[0]).format('YYYY-MM-DD') : '1900-01-01';
    EmployeeRequestlist.TillDate = obj.dateRange ? moment(obj.dateRange[1]).format('YYYY-MM-DD') : '1900-01-01';
    EmployeeRequestlist.CancelStatus = (aprovReject && obj.CancelStatus == 100) ? 300 : ((!aprovReject && obj.CancelStatus == 100) ? 200 : 0);
    this.bulkSubmitArry.push(EmployeeRequestlist);
  }
  Bulk_Approve_Reject_Wfh(aprovReject, obj, jsonRemarks) {
    obj = this.inEmployeesInitiateSelectedItems.find(a => a.Id == obj.Id);
    console.log('ITEM ::', obj);
    //this.loadingScreenService.startLoading();
    var EmployeeRequestlist = new EmployeeRequest();
    EmployeeRequestlist.Id = obj.Id;
    EmployeeRequestlist.EmployeeId = obj.EmployeeId;
    EmployeeRequestlist.Type = obj.Type;/*no explination*/
    EmployeeRequestlist.TotalTime = obj.TotalTime;
    EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
    EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
    //EmployeeRequestlist.Date = obj.Date;
    EmployeeRequestlist.StartTime = obj.StartTime;
    EmployeeRequestlist.EndTime = obj.EndTime;
    EmployeeRequestlist.ApprovedStartTime = obj.ApprovedStartTime;
    EmployeeRequestlist.ApprovedEndTime = obj.ApprovedEndTime;
    EmployeeRequestlist.IsPermissionAllowed = obj.IsPermissionAllowed;
    EmployeeRequestlist.IncludeInCalculation = obj.IncludeInCalculation;
    EmployeeRequestlist.RequestedClaimType = obj.RequestedClaimType;
    EmployeeRequestlist.ApprovedClaimType = obj.ApprovedClaimType;
    EmployeeRequestlist.IsCompOffApplicable = obj.IsCompOffApplicable;
    EmployeeRequestlist.ModuleProcessTransactionId = obj.ModuleProcessTransactionId;
    EmployeeRequestlist.EmployeeRemarks = obj.EmployeeRemarks;
    EmployeeRequestlist.ApproverRemarks = jsonRemarks;
    EmployeeRequestlist.Status = obj.CancelStatus != 100 ? (aprovReject ? EmployeeRequestStatus.Approved : EmployeeRequestStatus.Rejected) : obj.Status;/*Dynamic*/
    EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
    EmployeeRequestlist.Message = "";/*no eplination*/
    EmployeeRequestlist.FromDate = obj.dateRange ? moment(obj.dateRange[0]).format('YYYY-MM-DD') : '1900-01-01';
    EmployeeRequestlist.TillDate = obj.dateRange ? moment(obj.dateRange[1]).format('YYYY-MM-DD') : '1900-01-01';
    EmployeeRequestlist.CancelStatus = (aprovReject && obj.CancelStatus == 100) ? 300 : ((!aprovReject && obj.CancelStatus == 100) ? 200 : 0);
    this.bulkSubmitArry.push(EmployeeRequestlist);
  }
  close_leaverequest_approval_slider() {

    this.isOpened = false;
    $('#popup_edit_attendance').modal('hide');
  }

  async onChange_filter(whichdp, event) {
    let localCountList = [];
    if (this.isManagerIdBased == true) {

      this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals;

    }
    else {
      this._proxyUserList = [
        {
          proxyUserId: -1,
          proxyUserName: `All (${this._entitlementAvailmentRequestsApprovals.length})`,
          amountOfRequests: this._entitlementAvailmentRequestsApprovals.length

        },
        {
          proxyUserId: -2,
          proxyUserName: `My Requests (${this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.UserId).length})`,
          amountOfRequests: this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.UserId).length

        }
      ]


      this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals;
      this.inEmployeesInitiateList.forEach(obj => {
        obj.Select_Val = false;
      })
      this._entitlementAvailmentRequestsApprovals.forEach(ele => {
        if (ele.PendingAtUserId != this.UserId && ele.PendingAtUserId != 0) {
          this._proxyUserList.push({
            proxyUserId: ele.PendingAtUserId,
            proxyUserName: `${ele.PendingAtUserName} (${this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId && item.PendingAtUserId == ele.PendingAtUserId).length})`,
            amountOfRequests: this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId && item.PendingAtUserId == ele.PendingAtUserId).length
          })
        }
      });
      this._proxyUserList = _.uniqBy(this._proxyUserList, 'proxyUserId'); //removed if had duplicate proxyuserid
      this._proxyUserList = this._proxyUserList.filter(a => a.amountOfRequests > 0);
      console.log(' PROXY USER LIST : ', this._proxyUserList);
      this.selectedProxyUserId = this.inEmployeesInitiateList.length == 0 ? -1 : this.selectedProxyUserId;

      // PROXY SHOULD BE ENABLED HERE 
      if (this._entitlementAvailmentRequestsApprovals.length > 0 && this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId != 0 && item.PendingAtUserId != this.UserId).length > 0) {
        this.IsProxyAvailable = true;
        this.selectedProxyUserId == -2 ? (this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.UserId)) : this.selectedProxyUserId == -1 ? (this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals) :
          (this.inEmployeesInitiateList = this._entitlementAvailmentRequestsApprovals.filter(item => item.PendingAtUserId == this.selectedProxyUserId));
        this.selectedProxyUserId = this.inEmployeesInitiateList.length == 0 ? -1 : this.selectedProxyUserId;
      }

    }
    // await this.inEmployeesInitiateList.length > 0 && this.makeanEmployeeList();
    console.log('ENTITLEMNT REQUEST LIST :::  ', this.inEmployeesInitiateList);
    var date = new Date(), y = this.selectedYearId, m = this.selectedMonthId;
    this.NameofMonth = this.monthNames[date.getMonth()];
    this.NameofYear = date.getFullYear();
    var firstDay = new Date(date.getFullYear(), date.getMonth() - 1, 1);
    var lastDay = new Date(date.getFullYear(), (date.getMonth() + 1) - 1, 0);

    // console.log(' this.inEmployeesInitiateList', this.inEmployeesInitiateList);
    // console.log('this.selectedEmployeeId', firstDay);
    // console.log('this.selectedStatusId', lastDay);
    this.inEmployeesInitiateList = this.inEmployeesInitiateList.filter(a =>
    (moment(a.AppliedFrom).format('YYYY-MM-DD') >= moment(firstDay).format('YYYY-MM-DD') ||
      moment(a.AppliedTill).format('YYYY-MM-DD') <= moment(lastDay).format('YYYY-MM-DD')));
    localCountList = this.inEmployeesInitiateList;
    this.findCountValueFn(localCountList);
    // this.inEmployeesInitiateList = (this.selectedEmployeeId != -1 && this.selectedMonthId != -1) ?

    //   this.inEmployeesInitiateList.filter(a => a.EmployeeId == this.selectedEmployeeId && a.Status == this.selectedStatusId &&
    //     (moment(a.AppliedFrom).format('YYYY-MM-DD') >= moment(firstDay).format('YYYY-MM-DD') &&
    //       moment(a.AppliedTill).format('YYYY-MM-DD') <= moment(lastDay).format('YYYY-MM-DD')))

    //   : (this.selectedEmployeeId != -1 && this.selectedMonthId == -1) ?

    //     this.inEmployeesInitiateList.filter(a => a.EmployeeId == this.selectedEmployeeId && a.Status == this.selectedStatusId) :

    //     (this.selectedEmployeeId == -1 && this.selectedMonthId == -1) ?

    //       this.inEmployeesInitiateList.filter(a => a.Status == this.selectedStatusId) :

    //       (this.selectedEmployeeId == -1 && this.selectedMonthId != -1) ?
    //         this.inEmployeesInitiateList.filter(a => a.Status == this.selectedStatusId &&
    //           (moment(a.AppliedFrom).format('YYYY-MM-DD') >= moment(firstDay).format('YYYY-MM-DD') &&
    //             moment(a.AppliedTill).format('YYYY-MM-DD') <= moment(lastDay).format('YYYY-MM-DD'))) : this.inEmployeesInitiateList;

    // console.log(' this.inEmployeesInitiateList', this.inEmployeesInitiateList);

    let sum = 0;
    this.count_applied = 0;
    this.count_approved = 0;
    this.count_rejected = 0;
    this.count_totalDays = 0;
    localCountList.forEach(element => {
      if (element.Status == 100) {
        this.count_applied += 1;
      }
      if (element.Status == 400) {
        this.count_approved += 1;
      }
      if (element.Status == 300) {
        this.count_rejected += 1;
      }
      sum += 1;
    });
    this.count_totalDays = sum;
    // this.inEmployeesInitiateList = this.inEmployeesInitiateList.filter(a => a.Status == 100 || a.Status == 400); 
    this.sessionService.setSesstionStorage('selectedLeaveProxyId', this.selectedProxyUserId);

  }
  get g() { return this.leaveForm.controls; } // reactive forms validation 
  createForm() {
    this.leaveForm = this.formBuilder.group({
      Id: [0],
      AppliedFrom: [null, Validators.required],
      AppliedTill: [null, Validators.required],
      IsAppliedForFirstHalf: [false],
      IsAppliedFromSecondHalf: [false],
      IsAppliedTillFirstHalf: [false],
      IsAppliedTillSecondHalf: [false],
      EntitlementType: [null],
      Entitlement: [null, Validators.required],
      AppliedUnits: [0, Validators.required],
      EligibleUnits: [0],
      ApplierRemarks: [''],
      AppliedOn: [null],
      EmployeeEntitlement: [null]
      // ValidatorRemarks: ['',, Validators.required]
    });
  }
  onCellClicked_decline(val, typ, cardTyp, SubmitType) {
    //const metadata = obj
    this.submitType = SubmitType;
    this.cardType = cardTyp;
    this.rowData = null;
    this.EvtReqId = null;
    this.CurrentDateTime = null;
    if (typ === 'decline_req' && (val.Status == 100 || val.Status == 600 || val.CancelStatus == 100)) {
      this.rowData = val;
      this.DisplayName = val.EntitlementCode;
      this.EvtReqId = val.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);

      //  if(val.ApproverRemarks == null || val.ApproverRemarks == undefined || val.ApproverRemarks == ''){
      //    this.alertService.showWarning("Operation Cancelled : Please provide a rejection reason!");
      //    return;
      //  }

      this.common_approve_reject('edit', false, (val), 'parent', 'decline');
      return;
    }
    else if (typ === 'approve_req' && (val.Status == 100 || val.Status == 600 || val.CancelStatus == 100)) {
      this.rowData = val;
      this.DisplayName = val.EntitlementCode;
      this.EvtReqId = val.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);
      this.common_approve_reject('edit', true, (val), 'parent', 'decline');
      return;
    }
    else if (typ === 'regularize_req' && (val.Status == 100 || val.Status == 600 || val.CancelStatus == 100)) {
      this.selectedLeaveType = val.EntitlementId;
      this.DisplayName = val.EntitlementCode;
      this.EvtReqId = val.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);
      this.do_revise(val);
      // this.bsDropdown.render({
      //   component: CustomActionFormatterComponent,
      //   args,
      //   offsetLeft: 92,
      //   offsetDropupBottom: 15,
      //   parent: this, // provide this object to the child component so we can call a method from here if we wish
      // });
      return;
    }
    else {
      return;
      // this.alertService.showWarning('Action was blocked : Invalid Leave request - that  leave request is already approved/rejected.')
    }

  }

  onCellClicked(val, typ, cardTyp, SubmitType) {
    //const metadata = obj
    this.submitType = SubmitType;
    this.cardType = cardTyp;
    this.rowData = null;
    this.EvtReqId = null;
    this.CurrentDateTime = null;
    if (typ === 'decline_req' && (val.Status == 100 || val.Status == 600 || val.CancelStatus == 100)) {
      this.rowData = val;
      this.DisplayName = val.EntitlementCode;
      this.EvtReqId = val.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);

      if (val.ApproverRemarks == null || val.ApproverRemarks == undefined || val.ApproverRemarks == '') {
        this.alertService.showWarning("Operation Cancelled : Please provide a rejection reason!");
        return;
      }
      this.common_approve_reject('edit', false, (val), 'parent', 'permission');
      return;
    }
    else if (typ === 'approve_req' && (val.Status == 100 || val.Status == 600 || val.CancelStatus == 100)) {
      this.rowData = val;
      this.DisplayName = val.EntitlementCode;
      this.EvtReqId = val.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);
      this.common_approve_reject('edit', true, (val), 'parent', 'permission');
      return;
    }
    else if (typ === 'regularize_req' && (val.Status == 100 || val.Status == 600 || val.CancelStatus == 100)) {
      this.selectedLeaveType = val.EntitlementId;
      this.DisplayName = val.EntitlementCode;
      this.EvtReqId = val.Id;
      this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss.SSS')
      console.log('Crurent time : ', this.CurrentDateTime);
      this.do_revise(val);
      // this.bsDropdown.render({
      //   component: CustomActionFormatterComponent,
      //   args,
      //   offsetLeft: 92,
      //   offsetDropupBottom: 15,
      //   parent: this, // provide this object to the child component so we can call a method from here if we wish
      // });
      return;
    }
    else {
      return;
      // this.alertService.showWarning('Action was blocked : Invalid Leave request - that  leave request is already approved/rejected.')
    }
  }
  getEntitlementDefinitionDataset() {
    this.EntitlementDefinitionList = [];
    let datasource: DataSource = {
      Name: "GetEntitlementDefinition",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    var searchConfiguration = {
      SearchElementList: [

      ],
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: true,
      SaveSearchElementsLocally: false
    }

    this.pageLayoutService.getDataset(datasource, searchConfiguration as any).subscribe(dataset => {
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        this.EntitlementDefinitionList = JSON.parse(dataset.dynamicObject);
        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }
  /* #region EVERTHING THAT WORKS PAGELAYOUT IS WRITTERN HERE  */

  get_pagelayout() {


    const promise = new Promise((res, rej) => {


      this.pageLayout = null;
      this.spinner = true;
      this.titleService.setTitle('Loading...');
      this.headerService.setTitle('');
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          this.pageLayout = data.dynamicObject;
          console.log('LEAVE REQUEST LIST ::', this.pageLayout);
          this.titleService.setTitle(this.pageLayout.PageProperties.PageTitle);
          this.headerService.setTitle(this.pageLayout.PageProperties.BannerText);
          this.setGridConfiguration();
          if (this.pageLayout.GridConfiguration.ShowDataOnLoad) {
            this.getDataset();
          }
          res(true)
        }
        else {
          res(true)
          this.titleService.setTitle('HR Suite');
        }

      }, error => {
        console.log(error);
        this.spinner = false;
        this.titleService.setTitle('HR Suite');
      }
      );
    })
    return promise;
  }
  Get_EntitlementAvailmentRequestsForApprovalByManagerId(managerId) {
    this.spinner = true;
    this.attendanceService.GetEntitlementAvailmentRequestsForApprovalByManagerId(managerId).subscribe((result) => {
      this.spinner = false;
      console.log('RES ENTITLEMENTLIST REQ APPROVALS ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this._entitlementAvailmentRequestsApprovals = apiResult.Result as any;
        var _statusList = this.utilsHelper.transform(EntitlementRequestStatus) as any;
        this._entitlementAvailmentRequestsApprovals.length > 0 && this._entitlementAvailmentRequestsApprovals.forEach(ele => {
          // ele['EntitlementTypeName'] = "Leave"
          // ele['EntitlementName'] = this._entitlementList.length > 0 ? this._entitlementList.find(a => a.Id == ele.EntitlementId).DisplayName : '---';
          ele['StatusName'] = _statusList.find(z => z.id == ele.Status).name
          ele['isSelected'] = false;
        });
        // this._entitlementAvailmentRequestsApprovals = this._entitlementAvailmentRequestsApprovals
        //   .slice((this.page - 1) * this.pageSize, (this.page - 1) * this.pageSize + this.pageSize);
        // this.collectionSize = this._entitlementAvailmentRequestsApprovals.length;
        // this._entitlementAvailmentRequestsApprovals = _.orderBy(this._entitlementAvailmentRequestsApprovals, ["AppliedOn"], ["asc"]);;
        console.log('ENTI ::', this._entitlementAvailmentRequestsApprovals);
        this.selectedProxyUserId = -2;


        this.onChange_filter(null, null);
        this.spinner = false;
      }
      else {
        this.alertService.showWarning('There are no records left.');
        this.spinner = false;

      }

    }, err => {
      console.warn('  ERR ::', err);
    })
  }
  setGridConfiguration() {
    if (!this.pageLayout.GridConfiguration.IsDynamicColumns) {
      // let  collection: [{ value: '', label: 'All' }, { value: "Submitted", label: 'Submitted' }, { value: "Not Submitted", label: 'Not Submitted' }];
      this.inEmployeesInitiateColumnDefinitions = this.pageLayoutService.setColumns(this.pageLayout.GridConfiguration.ColumnDefinitionList);
    }
    //this.inEmployeesInitiateGridOptions = this.pageLayoutService.setGridOptions(this.pageLayout.GridConfiguration);
    //this.inEmployeesInitiateGridOptions.draggableGrouping = {
    //  dropPlaceHolderText: 'Drop a column header here to group by the column',
    // groupIconCssClass: 'fa fa-outdent',
    // deleteIconCssClass: 'fa fa-times',
    // onGroupChanged: (e, args) => this.onGroupChange(),
    // onExtensionRegistered: (extension) => this.draggableGroupingPlugin = extension,
    // }

  }
  getDataset() {
    this.selectedItems = [];
    this.inEmployeesInitiateList = [];
    this.pageLayoutService.getDataset(this.pageLayout.GridConfiguration.DataSource, this.pageLayout.SearchConfiguration.SearchElementList).subscribe(dataset => {
      this.spinner = false;
      if (dataset.Status == true && dataset.dynamicObject !== null && dataset.dynamicObject !== '') {
        // this.inEmployeesInitiateList = JSON.parse(dataset.dynamicObject);
        try {

        } catch (error) {

        }

      }
      else {
        console.log('Sorry! Could not Fetch Data|', dataset);
      }
    }, error => {
      this.spinner = false;
      console.log(error);
    })
  }
  /* #endregion */
  viewAdvancedHistory() {
    this.viewHistoryText == '>> Advanced History' ? this.IsAdvancedView = true : this.IsAdvancedView = false;
    if (this.IsAdvancedView == true) {
      this.viewHistoryText = '<< My Request View';
    } else {
      this.viewHistoryText = '>> Advanced History';
    }
  }
  do_revise(rowData) {
    console.log('ROW DATA ::', rowData);
    this.rowData = null;
    this.rowData = rowData;
    this._employeeName = rowData.EmployeeName;
    //this.loadingScreenService.startLoading();
    this.get_EmployeeEntitlementList(rowData.EmployeeId).then((result) => {
      if (result) {
        console.log('et', this._entitlementList);
        this._limitedEntitlementList = this._entitlementList;
        this._limitedEntitlementList = this._limitedEntitlementList.filter(i => i.EntitlementId == rowData.EntitlementId);
        if (this._limitedEntitlementList.length > 0) {
          this.createForm();
          this.onChange_Entitlement(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId));
          this.IsNegativeUnitAllowed = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).Definition.IsNegativeBalanceAllowed;
          this.MaxAllowedNegativeBalance = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).Definition.MaxNegativeBalanceAllowed;
          this.leaveForm.patchValue({
            Id: rowData.Id,
            AppliedFrom: new Date(rowData.AppliedFrom),
            AppliedTill: new Date(rowData.AppliedTill),
            IsAppliedForFirstHalf: rowData.IsAppliedForFirstHalf,
            IsAppliedFromSecondHalf: rowData.IsAppliedFromSecondHalf,
            IsAppliedTillFirstHalf: rowData.IsAppliedTillFirstHalf,
            IsAppliedTillSecondHalf: rowData.IsAppliedTillSecondHalf,
            EntitlementType: rowData.EntitlementType,
            Entitlement: rowData.EntitlementId,
            AppliedUnits: rowData.AppliedUnits,
            ApplierRemarks: rowData.ApplierRemarks,
            AppliedOn: rowData.AppliedOn,
            EmployeeEntitlement: rowData.EmployeeEntitlementId,
            EligibleUnits: this._entitlementList.length > 0 ? this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits : 0
            // ValidatorRemarks: rowData.ValidatorRemarks
          });

          if (!isNaN(Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits)) && Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits) <= 0)
          // this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits);
          {
            this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).AvailableUnits));
            this.remainingDays = (parseInt(this.remainingDays) - parseInt(this.MaxAllowedNegativeBalance));
            // alert((parseInt(this.remainingDays) - parseInt(this.MaxAllowedNegativeBalance)));
            // alert(this.remainingDays)          
            this.ActualReamingDayIfNegativeAllowed = (parseInt(this.remainingDays) + parseInt(this.MaxAllowedNegativeBalance));

            this.remainingDays = Math.abs(this.remainingDays);

          }
          else {
            // this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits) + Number(this.leaveForm.get('AppliedUnits').value));
            this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).AvailableUnits);
          }


          this.isOpened = true;
          this.selectedLeaveType = rowData.EntitlementId;
          this.loadingScreenService.stopLoading();
          $('#popup_edit_attendance').modal('show');
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning('No records found!');
        }
      }
      else {
        this.alertService.showWarning('No Data found!');
        this.loadingScreenService.stopLoading();
      }
    })
  }
  /*View WOW Popup*/
  ViewWOWPop(obj, typ, cardTyp, aubmitTyp) {
    // debugger;
    this.SelectedWoWObj = null;
    this.SelectedWoWObj = obj;


    $('#popup_WOW').modal('show');
  }
  /*View Od Popup*/
  ViewOdPop(obj, typ, cardTyp, aubmitTyp) {
    // this.SelectedOdObj = null;
    this.SelectedOdObj = obj;
    $('#popup_Od').modal('show');
  }
  /*View Wfh Popup*/
  ViewWfhPop(obj, typ, cardTyp, aubmitTyp) {
    this.SelectedWfhObj = null;
    this.SelectedWfhObj = obj;
    $('#popup_Wfh').modal('show');
  }
  permissionReqGridGetFn() {
    this.spinner = true;
    this.PermissionArr = [];
    this.attendanceService.GetManagerApprovePermReq().subscribe((result) => {
      //debugger;
      console.log('GET PERMISSION REQ ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this.PermissionArr = JSON.parse(apiResult.Result);
        console.log('GET PERMISSION REQ ::', this.PermissionArr);
        this.inEmployeesInitiateSelectedItems = [];
        this.PermissionArr.forEach(element => { element.Select_Val = false; });
        this.CheckdVal = false;
      }
      this.spinner = false;
      this.findCountValueFn(this.PermissionArr);
      result = [];
    })
  }
  GetOdGridGetFn() {
    this.spinner = true;
    this.OdArr = [];
    // this.OdArr = [{ ApprovedClaimType: 0, ApprovedEndTime: "00:00:00", ApprovedStartTime: "00:00:00", ApproverRemarks: "", CreatedBy: "14941", CreatedOn: "2021-12-24T05:17:32.547", Date: "2021-12-25", EmployeeAttendanceBreakUpDetailsId: 22753, EmployeeCode: "15001", EmployeeId: 15001, EmployeeName: "ROSHAN KARTHIK ", EmployeeRemarks: "test", EndTime: "14:47:00", Id: 41, IncludeInCalculation: false, IsCompOffApplicable: false, IsPermissionAllowed: true, LastUpdatedBy: "14941", LastUpdatedOn: "2021-12-24T05:17:33.377", ModuleProcessTransactionId: 123, RequestedClaimType: 0, StartTime: "12:47:00", Status: 100, Type: 100 }, { ApprovedClaimType: 0, ApprovedEndTime: "00:00:00", ApprovedStartTime: "00:00:00", ApproverRemarks: "", CreatedBy: "14941", CreatedOn: "2021-12-24T05:17:32.547", Date: "2021-12-25", EmployeeAttendanceBreakUpDetailsId: 22753, EmployeeCode: "15001", EmployeeId: 15001, EmployeeName: "ROSHAN KARTHIK ", EmployeeRemarks: "test", EndTime: "14:47:00", Id: 42, IncludeInCalculation: false, IsCompOffApplicable: false, IsPermissionAllowed: true, LastUpdatedBy: "14941", LastUpdatedOn: "2021-12-24T05:17:33.377", ModuleProcessTransactionId: 123, RequestedClaimType: 0, StartTime: "12:47:00", Status: 100, Type: 100 }];
    this.inEmployeesInitiateSelectedItems = [];
    this.CheckdVal = false;
    /*Od Tbl Get Api Here*/
    this.attendanceService.GetManagerOdGridSrvc().subscribe((result) => {
      //debugger;
      console.log('GET Od Result ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this.OdArr = JSON.parse(apiResult.Result);
        console.log('GET Od Result ::', this.OdArr);
        this.OdArr.forEach(obj => {
          obj.dateRange = [obj.FromDate, obj.TillDate];
        });
        console.log('OdArr ::', this.OdArr);
      }
      this.OdArr.forEach(element => { element.Select_Val = false; });
      this.findCountValueFn(this.OdArr);
      this.spinner = false;
      result = [];
    })
  }
  GetWfhGridGetFn() {
    this.spinner = true;
    this.WfhArr = [];
    //this.WfhArr = [{ ApprovedClaimType: 0, ApprovedEndTime: "00:00:00", ApprovedStartTime: "00:00:00", ApproverRemarks: "", CreatedBy: "14941", CreatedOn: "2021-12-24T05:17:32.547", Date: "2021-12-25", EmployeeAttendanceBreakUpDetailsId: 22753, EmployeeCode: "15001", EmployeeId: 15001, EmployeeName: "ROSHAN KARTHIK ", EmployeeRemarks: "test", EndTime: "14:47:00", Id: 41, IncludeInCalculation: false, IsCompOffApplicable: false, IsPermissionAllowed: true, LastUpdatedBy: "14941", LastUpdatedOn: "2021-12-24T05:17:33.377", ModuleProcessTransactionId: 123, RequestedClaimType: 0, StartTime: "12:47:00", Status: 100, Type: 100 }, { ApprovedClaimType: 0, ApprovedEndTime: "00:00:00", ApprovedStartTime: "00:00:00", ApproverRemarks: "", CreatedBy: "14941", CreatedOn: "2021-12-24T05:17:32.547", Date: "2021-12-25", EmployeeAttendanceBreakUpDetailsId: 22753, EmployeeCode: "15001", EmployeeId: 15001, EmployeeName: "ROSHAN KARTHIK ", EmployeeRemarks: "test", EndTime: "14:47:00", Id: 42, IncludeInCalculation: false, IsCompOffApplicable: false, IsPermissionAllowed: true, LastUpdatedBy: "14941", LastUpdatedOn: "2021-12-24T05:17:33.377", ModuleProcessTransactionId: 123, RequestedClaimType: 0, StartTime: "12:47:00", Status: 100, Type: 100 }];
    this.inEmployeesInitiateSelectedItems = [];
    this.CheckdVal = false;
    /*Wfh Tbl Get Api Here*/
    this.attendanceService.GetManagerWfhGridSrvc().subscribe((result) => {
      //debugger;
      console.log('GET Wfh Result ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this.WfhArr = JSON.parse(apiResult.Result);
        this.WfhArr.forEach(obj => {
          obj.dateRange = [obj.FromDate, obj.TillDate];
        });
        console.log('WfhArr ::', this.WfhArr);
      }
      this.WfhArr.forEach(element => { element.Select_Val = false; });
      this.findCountValueFn(this.WfhArr);
      this.spinner = false;
      result = [];
    })
  }
  GetWOWGridGetFn() {
    this.spinner = true;
    this.WeekOffArr = [];
    this.attendanceService.GetManagerApproveWOWReq().subscribe((result) => {
      // debugger;
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this.WeekOffArr = JSON.parse(apiResult.Result);
        console.log('GET WOW REQ ::', this.WeekOffArr);
        this.WeekOffArr.length > 0 && this.WeekOffArr.forEach(e => {
          if (e.ApprovedExpireOn == "00:00:00" || e.ApprovedExpireOn == undefined) {
            e.ApprovedExpireOn = new Date(moment('1900-01-01').format('YYYY-MM-DD'))
          }
          else {
            e.ApprovedExpireOn = new Date(e.ApprovedExpireOn);
          }
          //e.ApprovedExpireOn = e.ApprovedExpireOn == ("00:00:00" || undefined) ? new Date(moment('1900-01-01').format('YYYY-MM-DD')) : new Date(e.ApprovedExpireOn);
        });
        console.log('GET WOW REQ ::', this.WeekOffArr);
      }
      this.spinner = false;
      this.findCountValueFn(this.WeekOffArr);
      result = [];
    })
  }

  seeClientDetails() {
    this._limitedEntitlementList = this._entitlementList;
    this.seemoreTxt == "Less other leave balances" ? this.showOtherEntitlment = false : this.seemoreTxt == "view other leave balances" ? this.showOtherEntitlment = true : null;

    if (this.showOtherEntitlment == true) {
      this.seemoreTxt = "Less other leave balances"
      this._limitedEntitlementList = this._entitlementList;
    } else {
      this.seemoreTxt = "view other leave balances";
      this._limitedEntitlementList = this._entitlementList;
      console.log(' this._limitedEntitlementList', this._limitedEntitlementList);
      console.log('this.leaveF', this.leaveForm.get('Entitlement').value);


      this._limitedEntitlementList = this._limitedEntitlementList.filter(i => i.EntitlementId == this.leaveForm.get('Entitlement').value);
      console.log(' this._limitedEntitlementList', this._limitedEntitlementList);

    }
  }
  getLeaveType(entitlmentleavetypeId) {
    return this._entitlementList.find(a => a.EntitlementId == entitlmentleavetypeId).DisplayName;
  }
  viewEntitlement() {
    // this.loadingScreenService.startLoading();
    this.get_EmployeeEntitlementList(this.inEmployeesInitiateSelectedItems[0].EmployeeId).then((result) => {
      console.log('ENTIT :', this._entitlementList);
      this.loadingScreenService.stopLoading();
      $('#popup_viewEntitlement').modal('show');
    })
  }
  close_entitlementbalance() {
    $('#popup_viewEntitlement').modal('hide');

  }
  do_approve_reject(whichaction) {

    this.common_approve_reject('edit', whichaction, '', 'child', 'none');

  }
  do_approve_decline(item, whichaction) {
    this.common_approve_reject('single', whichaction, item, 'parent', 'none');
  }

  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {

      this._entitlementList = [];
      // this.employeeService.FetchEmployeeDetailsByEmployeeCode(_employeeId)
      //   .subscribe((employeeObj) => {
      //     const apiResponse: apiResult = employeeObj;
      //     if (apiResponse.Status && apiResponse.Result != null) {
      //       const Object: EmployeeDetails = apiResponse.Result as any;
      //       this._employeeId = Object.Id;
      //       console.log('EMPLOYEE OBJECT :: ', apiResponse);
      this.spinner = true;
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, EntitlementType.Leave).subscribe((result) => {
        this.spinner = false;
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._limitedEntitlementList = this._entitlementList;

          res(true);
        } else {
          res(false);
        }
      }, err => {
        this.spinner = false;
        console.warn('ERR ::', err);
      });
      // }
      // })
    });
    return promise;



  }
  exportToExcel() {


    // let exportExcelDate = [];

    // console.log('this.columnDefinition', this.inEmployeesInitiateColumnDefinitions);
    // console.log('sele', this.selectedItems);
    // var objects = new Array();
    // this.inEmployeesInitiateColumnDefinitions.forEach(e => {
    //   objects[e.name] = ;
    //   exportExcelDate.push(objects);
    // });

    // console.log('test', exportExcelDate);

    // this.columnDefinition DisplayName, Id,
    //   this.selectedItems.forEach(element => {

    //     exportExcelDate.push({
    //       ProductCode: element.ProductCode,
    //       ProductName: element.DisplayName,
    //       Monthly: element.Value,
    //       Annually: (Number(element.Value) * 12)
    //     })


    //   });


    // var howmany = 10;

    // for (var i = 0; i < this.columnDefinition.length; i++) {
    //   let index = this.columnDefinition[i];
    //   objects[index.field] = null;

    // }



    // this.inEmployeesInitiateGridInstance.excelExportService!.exportToExcel({
    //   filename: `LeaveEntries${this.NameofMonth}${this.NameofYear}`,
    //   format: FileType.xlsx
    // });
  }
  onCellClickedPerPopDis() {
    $('#popup_editRequest').modal('hide');
  }
  onChange_Entitlement(event) {
    console.log('event', event);

    //program that checks if the number is positive, negative or zero

    this.isLOP = false;
    if (event != undefined && event.DisplayName != 'LOP' && event.AvailableUnits <= 0 && event.Definition.IsNegativeBalanceAllowed == false) {

      this.isZeroEligibleDays = true;
      this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
      return;
    }

    else {
      this.IsNegativeUnitAllowed = this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).Definition.IsNegativeBalanceAllowed;
      this.MaxAllowedNegativeBalance = this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).Definition.MaxNegativeBalanceAllowed;

      if (event.AvailableUnits <= 0 && event.Definition.IsNegativeBalanceAllowed == true && event.Definition.MaxNegativeBalanceAllowed < 0) {
        this.isZeroEligibleDays = true;
        this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
        return;
      }

      else if (!isNaN(event.AvailableUnits) && event.AvailableUnits < 0 && event.Definition.IsNegativeBalanceAllowed == true && event.Definition.MaxNegativeBalanceAllowed != 0) {
        // this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).EligibleUnits) + Number(this.leaveForm.get('AppliedUnits').value));
        // alert(this.remainingDays);
        // alert(event.Definition.MaxNegativeBalanceAllowed);
        // this.remainingDays = (parseInt(this.remainingDays) + parseInt(event.Definition.MaxNegativeBalanceAllowed));
        this.remainingDays = (Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).AvailableUnits));
        this.ActualReamingDayIfNegativeAllowed = (parseInt(this.remainingDays) + parseInt(event.Definition.MaxNegativeBalanceAllowed));
        this.remainingDays = (parseInt(this.remainingDays) - parseInt(event.Definition.MaxNegativeBalanceAllowed));
        this.remainingDays = Math.abs(this.remainingDays)



      } else {

      }
      this.DisplayName = event.DisplayName;
      this.isZeroEligibleDays = false;
      this.selectedLeaveType = event.EntitlementId;
      this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits);
      this.leaveForm.controls['Entitlement'].setValue(event.EntitlementId);
      this.leaveForm.controls['EmployeeEntitlement'].setValue(event.Id);
      // if (!isNaN(event.EligibleUnits) && event.EligibleUnits >= 0) {
      //   this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).EligibleUnits);
      // }
      this.isLOP = event.DisplayName == 'LOP' ? true : false;

    }
    // event != undefined ? this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits) : this.leaveForm.controls['EligibleUnits'].setValue(0);
    // event != undefined ? this.selectedLeaveType = event : this.selectedLeaveType = null
  }
  onChangeExpenseDate() {

  }
  onChangeExpenseDateWow() {

  }
  closeWOWPopup() {
    $('#popup_WOW').modal('hide');
  }
  closeOdPopup() {
    $('#popup_Od').modal('hide');
  }
  closeWfhPopup() {
    $('#popup_Wfh').modal('hide');
  }
  /*Permission Request Approve*/

  onClickRefreshButton() {
    this.alertService.showWarning("refresh working");
  }
  editRequest(item, index) {

    this.router.navigate(['app/leaves/employeerequest'], {
      queryParams: {
        "Idx": btoa('101'),
      }
      // "IsE" : this.isESSLogin
    });
    this.alertService.showWarning("edit request");
  }
  approveRequest(item, index) {
    this.alertService.showSuccess("approve request")
  }
  rejectRequest(item, index) {
    this.alertService.showWarning("reject request");
  }
  onChangeRequestType(event, value) {
    this.RefreshSepFn(event.CardValue, '');
  }

  RefreshSepFn(value, typ) {
    this.isEnabled = value;
    this.CheckdVal = false;
    this.inEmployeesInitiateSelectedItems = [];
    if (this.isEnabled == 1) {
      this.inEmployeesInitiateList.forEach(element => { element.Select_Val = false; });
      if (this.inEmployeesInitiateList.length == 0 || typ == 'R') {
        this.Get_EntitlementAvailmentRequestsForApproval();
      }
    }
    else if (this.isEnabled == 2) {
      this.PermissionArr.forEach(element => { element.Select_Val = false; });
      if (this.PermissionArr.length == 0 || typ == 'R') {
        this.permissionReqGridGetFn();
      }
    }
    else if (this.isEnabled == 3) {
      this.WeekOffArr.forEach(element => { element.Select_Val = false; });
      if (this.WeekOffArr.length == 0 || typ == 'R') {
        this.GetWOWGridGetFn();
      }
    }
    else if (this.isEnabled == 4) {
      this.OdArr.forEach(element => { element.Select_Val = false; });
      if (this.OdArr.length == 0 || typ == 'R') {
        this.GetOdGridGetFn();
      }
    }
    else if (this.isEnabled == 5) {
      this.WfhArr.forEach(element => { element.Select_Val = false; });
      if (this.WfhArr.length == 0 || typ == 'R') {
        this.GetWfhGridGetFn();
      }
    }
    // this.titleService.setTitle(value == 1 ? "Leaves" : value == 2 ? "Permissions" : "Week-Offs");
  }
  WeekOffClickFn() {
    this.inEmployeesInitiateSelectedItems = [];
    this.WeekOffArr.forEach(element => { element.Select_Val = false; });
    this.CheckdVal = false;
  }
  PermissionsClickFn() {
    this.inEmployeesInitiateSelectedItems = [];
    this.PermissionArr.forEach(element => { element.Select_Val = false; });
    this.CheckdVal = false;
  }
  LeavesClickFn() {
    this.inEmployeesInitiateSelectedItems = [];
    this.inEmployeesInitiateList.forEach(element => { element.Select_Val = false; });
    this.CheckdVal = false;
  }
  findCountValueFn(Arr) {
    this.cardsArr.forEach(ele => {
      if (ele.CardValue == this.isEnabled) {
        ele.Count = 0;
        ele.Count = Arr.length;
        ele.CombiledDisplayNameCount = `${ele.DisplayName} (${ele.Count})`;

      }
    })
  }
  viewPermissionPop(obj, typ, cardTyp, aubmitTyp) {
    this.SelectedPermissionObj = obj;
    $('#popup_Permission').modal('show');
  }
  closePermissionPopup() {
    $('#popup_Permission').modal('hide');
    // this.SelectedPermissionObj = null;
  }
  /*date raneg change wfh*/
  onChange_DateRangeWfh(evnt, dates, obj) {
    if (evnt && dates) {
      obj.FromDate = dates[0];
      obj.TillDate = dates[1];
    }
  }
  onChange_DateRangeOd(evnt, dates, obj) {
    if (evnt && dates) {
      obj.FromDate = dates[0];
      obj.TillDate = dates[1];
    }
  }
}
