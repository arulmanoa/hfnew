import { Component, OnInit } from '@angular/core';
import { tr } from 'date-fns/locale';
import moment from 'moment';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, CommonService, SearchService } from 'src/app/_services/service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { HttpClient } from '@angular/common/http';
import { AvailCompensationModel } from 'src/app/_services/model/Attendance/AvailCompensationModel';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { data } from 'jquery';
import { EmployeeRequest } from 'src/app/_services/model/Attendance/EmployeeRequest'
import { async } from '@angular/core/testing';
@Component({
  selector: 'app-employee-myrequests-ui',
  templateUrl: './employee-myrequests-ui.component.html',
  styleUrls: ['./employee-myrequests-ui.component.css']
})

export class EmployeeMyRequestsUiComponent implements OnInit {
  cardsArr: any[] = [];
  StatusListWOW: any[] = [];
  StatusListOd: any[] = [];
  StatusListWfh: any = [];
  PostWOWArr: any;
  PostOdArr: any;
  PostWfhArr: any;
  DateIdWOW: any;
  DateIdOd: any;
  DateIdWfh: any;
  StatusIdWOW: any;
  StatusIdOd: any;
  StatusIdWfh: any;
  tableArrayWOW: any[] = [];
  tableArrayOd: any[] = [];
  tableArrayWfh: any[] = [];
  isEnabled: any;
  selectedObj: any;
  submitType: any;
  spinner: boolean = false;
  _MaxDate: any;
  _MinDate: any;
  StatusList: any[] = [];
  StatusId: any;
  Years: any;
  YearId: any;
  SearchId: any;
  DateId: any;
  tableArray: any[] = [];
  CompensationDates: any;
  LeaveTypSliderVal: any;
  _dateRange: any;
  _from_minDate: any;
  _IndividualDateShow: any;
  _IndividualDate: any;
  AvailDisable: any;
  _AvailCompensationModel: AvailCompensationModel = new AvailCompensationModel();
  cardslenght: any;
  SelectedCancellationObj: any;
  SelectedCancellationWowObj: any;
  SelectedCancellationOdObj: any;
  SelectedCancellationWfhObj: any;
  constructor(
    private alertService: AlertService,
    private searchService: SearchService,
    private commonService: CommonService,
    private AttendanceService: AttendanceService,
    private http: HttpClient,
    private loadingScreenService: LoadingScreenService,

  ) {
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      console.log("RELOAD CONTENT INITIATED");
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+ 
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });
  }
  CheckAllFnPer(val) {

    for (var i in this.tableArray) {
      if (val == true) {
        this.tableArray[i].Select_Val = true;
      }
      else {
        this.tableArray[i].Select_Val = false;
      }
    }

  };
  CheckAllFnWOW(val) {

    for (var i in this.tableArrayWOW) {
      if (val == true) {
        this.tableArrayWOW[i].Select_Val = true;
      }
      else {
        this.tableArrayWOW[i].Select_Val = false;
      }
    }

  };
  CheckAllFnOd(val) {

    for (var i in this.tableArrayOd) {
      if (val == true) {
        this.tableArrayOd[i].Select_Val = true;
      }
      else {
        this.tableArrayOd[i].Select_Val = false;
      }
    }

  };
  CheckAllFnWfh(val) {

    for (var i in this.tableArrayWfh) {
      if (val == true) {
        this.tableArrayWfh[i].Select_Val = true;
      }
      else {
        this.tableArrayWfh[i].Select_Val = false;
      }
    }

  };
  /*Slider Button Change Fn*/
  SliderChngFn(val) {
    var submitedArr = [];
    if (val == true) {
      this._dateRange = null;
    }
    else if (val == false) {
      for (var i in this.tableArray) {
        this.tableArray[i].Select_Date = null;
      }
    }
  }
  /*Action Edit icon Click Function*/
  submitFn(typ, dat) {
    this.selectedObj = dat;
    $('#popup_Comp').modal('show');
    if (typ == 'I') {
      this.submitType = 'Single';
      this._IndividualDateShow = true;
      this._IndividualDate = null;
    }
    else {
      this.submitType = 'Multiple';
      this._IndividualDateShow = false;
      this._IndividualDate = null;
    }
  };
  modal_dismiss() {
    $('#popup_Comp').modal('hide');
    this._IndividualDateShow = false;
    this.LeaveTypSliderVal = false;
  }
  onChange_SelDate(value) {
    //debugger;
  }
  onChange_SearchDate(value) {
    //debugger;
  }
  AvailDisableFn() {
    var returnval = false;
    for (var i in this.tableArray) {
      if (this.tableArray[i].Select_Val == true) {
        //this.AvailDisable =false;
        returnval = false;
        break;
      }
      else {
        returnval = true;
      }
    }
    if (this.tableArray.length == 0) {
      returnval = true;
    }
    return returnval;
  }
  SubmitDisableFn() {
    var returnval = false;
    for (var i in this.tableArrayWOW) {
      if (this.tableArrayWOW[i].Select_Val == true) {
        //this.AvailDisable =false;
        returnval = false;
        break;
      }
      else {
        returnval = true;
      }
    }
    if (this.tableArrayWOW.length == 0) {
      returnval = true;
    }
    return returnval;
  }
  SubmitDisableFnOd() {
    var returnval = false;
    for (var i in this.tableArrayOd) {
      if (this.tableArrayOd[i].Select_Val == true) {
        //this.AvailDisable =false;
        returnval = false;
        break;
      }
      else {
        returnval = true;
      }
    }
    if (this.tableArrayOd.length == 0) {
      returnval = true;
    }
    return returnval;
  }
  SubmitDisableFnWfh() {
    var returnval = false;
    for (var i in this.tableArrayWfh) {
      if (this.tableArrayWfh[i].Select_Val == true) {
        //this.AvailDisable =false;
        returnval = false;
        break;
      }
      else {
        returnval = true;
      }
    }
    if (this.tableArrayWfh.length == 0) {
      returnval = true;
    }
    return returnval;
  }
  /*Search Sumbit Fn*/
  SearchSubFn() {
    //debugger;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: this.StatusId
    }
    if (this.DateId) {
      parms.FromDate = moment(new Date(this.DateId[0])).format('YYYY-MM-DD');
      parms.TillDate = moment(new Date(this.DateId[1])).format('YYYY-MM-DD');
    }
    else {
      parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
      parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    }
    this.StatusId || this.StatusId == 0 ? parms.status = this.StatusId : parms.status = -1;
    console.log(parms);
    this.getGritFilterDataFn(parms);
  }
  /*Search Od Fn*/
  SearchSubFnOd() {
    //debugger;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: this.StatusIdOd
    }
    if (this.DateIdOd) {
      parms.FromDate = moment(new Date(this.DateIdOd[0])).format('YYYY-MM-DD');
      parms.TillDate = moment(new Date(this.DateIdOd[1])).format('YYYY-MM-DD');
    }
    else {
      parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
      parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    }
    this.StatusIdOd || this.StatusIdOd == 0 ? parms.status = this.StatusIdOd : parms.status = -1;
    console.log(parms);
    this.getGritFilterDataOdFn(parms);
  }
  /*Search Wfh Fn*/
  SearchSubFnWfh() {
    //debugger;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: this.StatusIdWfh
    }
    if (this.DateIdWfh) {
      parms.FromDate = moment(new Date(this.DateIdWfh[0])).format('YYYY-MM-DD');
      parms.TillDate = moment(new Date(this.DateIdWfh[1])).format('YYYY-MM-DD');
    }
    else {
      parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
      parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    }
    this.StatusIdWfh || this.StatusIdWfh == 0 ? parms.status = this.StatusIdWfh : parms.status = -1;
    console.log(parms);
    this.getGritFilterDataWfhFn(parms);
  }
  /*Search WOW Function*/
  SearchSubFnWOW() {
    //debugger;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: this.StatusIdWOW
    }
    if (this.DateIdWOW) {
      parms.FromDate = moment(new Date(this.DateIdWOW[0])).format('YYYY-MM-DD');
      parms.TillDate = moment(new Date(this.DateIdWOW[1])).format('YYYY-MM-DD');
    }
    else {
      parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
      parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    }
    this.StatusIdWOW || this.StatusIdWOW == 0 ? parms.status = this.StatusIdWOW : parms.status = -1;
    console.log(parms);
    this.getGritFilterDataWOWFn(parms);
  }
  /*submit compof*/
  saveEntitlementRequest() {
    // debugger;
    if (this.submitType == 'Multiple') {
      var submitedArr = [];
      var selectedLength = 0;
      for (var i in this.tableArray) {
        if (this.tableArray[i].Select_Val == true) {
          submitedArr.push(this.tableArray[i]);
          if (this.tableArray[i].Select_Date) {
            selectedLength += 1;
          }

        }
      }

      if (this.LeaveTypSliderVal == false) {
        this._dateRange;
        if (this._dateRange && this._dateRange.length > 1) {
          var FromDate = moment(this._dateRange[0], 'DD-MM-YYYY');
          var ToDate = moment(this._dateRange[1], 'DD-MM-YYYY');
          var DateRangeLengt = ToDate.diff(FromDate, 'days');
        }
        if (submitedArr.length != DateRangeLengt + 1 || this._dateRange == null || this._dateRange == undefined) {
          this.alertService.showWarning("please Enter Date Range Correctly...");
        }
        else {
          var ParmsMulty = {
            EmployeeEntitlementId: 0,
            AppliedFrom: moment(this._dateRange[0]).format('YYYY-MM-DD'),
            IsAppliedFromSecondHalf: false,
            IsAppliedForFirstHalf: false,
            AppliedTill: moment(this._dateRange[1]).format('YYYY-MM-DD'),
            IsAppliedTillFirstHalf: false,
            IsAppliedTillSecondHalf: false,
            CompensationIds: []
          };
          this.tableArray.forEach(element => {
            if (element.Select_Val == true) {
              ParmsMulty.CompensationIds.push(element.Id);
            }
          });
          /*API multy date range*/
          console.log('datarange post parms', ParmsMulty);
          this._AvailCompensationModel.EmployeeEntitlementId = 1
          //AppliedFrom
          this.spinner = true;
          this.loadingScreenService.startLoading();
          this.AttendanceService.Post_Avail_Multy_Compensation(ParmsMulty).subscribe((ress) => {
            this.loadingScreenService.stopLoading();
            this.spinner = false;
            console.log('Post_Multiple_Avail_responce', ress);
            this.loadingScreenService.stopLoading();
            if (ress && ress.Status == true) {
              this.alertService.showSuccess(ress.Message);
              $('#popup_Comp').modal('hide');
              this.ReFreshFn();
            }
            else if (ress && ress.Status == false) {
              this.alertService.showWarning(ress.Message);
            }
          }, err => {
            console.error('Post_Multiple_Avail API Error');
          })
        }
      }
      else {
        if (selectedLength != submitedArr.length) {
          this.alertService.showWarning("please Enter Dates...");
        }
        else {
          var parms = { submitedArr };
          var SplitDatesParms = [];
          var initparms = {
            CompensationId: 0,
            ClaimType: 0,
            EmployeeEntitlementId: 0,
            LeaveDate: "",
          }
          submitedArr.forEach(element => {
            initparms.CompensationId = element.Id;
            initparms.ClaimType = 300;
            initparms.EmployeeEntitlementId = 0;
            initparms.LeaveDate = moment(element.Select_Date).format('YYYY-MM-DD');
            SplitDatesParms.push(initparms);
          });
          //this._AvailCompensationModel.EmployeeEntitlementId = 1;
          /*API Split Dates in multy*/
          this.spinner = true;
          this.loadingScreenService.startLoading();
          this.AttendanceService.Post_Avail_Multy_Compensation(SplitDatesParms).subscribe((ress) => {
            this.spinner = false;
            console.log('Post_Multiple_Avail_responce', ress);
            this.loadingScreenService.stopLoading();
            if (ress && ress.Status == true) {
              this.alertService.showSuccess(ress.Message);
              $('#popup_Comp').modal('hide');
              this.ReFreshFn();
            }
            else if (ress && ress.Status == false) {
              this.alertService.showWarning(ress.Message);
            }
          }, err => {
            console.error('Post_Multiple_Avail API Error');
          })
        }
      }
    }
    else if (this.submitType == 'Single') {
      var initSingleParm = [];
      var parmssinglepost = {
        CompensationId: this.selectedObj.Id, //from get list
        ClaimType: 300,
        EmployeeEntitlementId: 0,//from get list
        LeaveDate: moment(new Date(this._IndividualDate)).format('YYYY-MM-DD')
      }
      initSingleParm.push(parmssinglepost);
      //parmssinglepost = null;
      this.spinner = true;
      this.loadingScreenService.startLoading();
      this.AttendanceService.Post_Avail_Individual_Compensation(initSingleParm).subscribe((ress) => {
        this.loadingScreenService.stopLoading();
        this.spinner = false;
        console.log('Post_Individual_Avail_responce', ress);
        this.loadingScreenService.stopLoading();
        if (ress && ress.Status == true) {
          this.alertService.showSuccess(ress.Message);
          $('#popup_Comp').modal('hide');
          this.ReFreshFn();
        }
        else if (ress && ress.Status == false) {
          this.alertService.showWarning(ress.Message);
        }
      }, err => {
        console.error('Post_Individual_Avail API Error');
      })
    }
  }
  /*Date Range Change Fn*/
  onChange_DateRange(searchValue: string): void {
    if (searchValue && searchValue.length > 1) {
      if (this.LeaveTypSliderVal == false) {
        var submitedArr = [];
        var selectedLength = 0;
        for (var i in this.tableArray) {
          if (this.tableArray[i].Select_Val == true) {
            submitedArr.push(this.tableArray[i]);
            selectedLength += 1;
          }
        }
        //this._dateRange;
        var FromDate = moment(searchValue[0], 'DD-MM-YYYY');
        var ToDate = moment(searchValue[1], 'DD-MM-YYYY');
        var DateRangeLengt = ToDate.diff(FromDate, 'days');
        if (submitedArr.length != DateRangeLengt + 1) {
          this.alertService.showWarning("please Enter Date Range Correctly...");
          setTimeout(() => {
            this._dateRange = null;
          }, 100);

        }
      }
    };
  }
  RefreshSepFn(val) {
    this.isEnabled = val;
    if (this.isEnabled == 2 && this.tableArray.length == 0) {
      this.ReFreshFn();
    }
    else if (this.isEnabled == 3 && this.tableArrayWOW.length == 0) {
      this.ReFreshFnWOW();
    }
    else if (this.isEnabled == 4 && this.tableArrayOd.length == 0) {
      this.ReFreshFnOd();
    }
    else if (this.isEnabled == 5 && this.tableArrayWfh.length == 0) {
      this.ReFreshFnWfh();
    }
    // else if (this.isEnabled == 1 && this.tableArrayWOW.length == 0) {
    //   this.ReFreshFnWOW();
    // }
  }
  ngOnInit() {
    let maxDate = new Date().setMonth(new Date().getMonth() + 1 + 3);//this is for 3 months
    this._MaxDate = new Date(maxDate);
    let minDate = new Date('01-01-1990');
    this._MinDate = new Date(minDate)
    this.AvailDisable = true;
    this._IndividualDateShow = false;
    this._from_minDate = new Date();
    this.LeaveTypSliderVal = false;
    this.StatusList = [{ id: 100, Name: 'Applied' }, { id: 200, Name: 'Rejected' }, { id: 300, Name: 'Approved' }, { id: 0, Name: 'Cancelled' }];
    this.StatusListWOW = [{ id: 200, Name: 'Rejected' }, { id: 100, Name: 'Applied' }, { id: 300, Name: 'Approved' }, { id: 0, Name: 'Cancelled' }];
    this.StatusListOd = [{ id: 200, Name: 'Rejected' }, { id: 100, Name: 'Applied' }, { id: 300, Name: 'Approved' }, { id: 0, Name: 'Cancelled' }];
    this.StatusListWfh = [{ id: 200, Name: 'Rejected' }, { id: 100, Name: 'Applied' }, { id: 300, Name: 'Approved' }, { id: 0, Name: 'Cancelled' }];
    //this.cardsArr = [{ id: 1, cardName: 'Permissions', CountValue: 0, labelValue: 'Permission(s)', isEnabledValue: 1, IconName: 'fa fa-address-card fa-2x', Color: '#d88' }, { id: 2, cardName: 'Work On Week-Off', CountValue: 0, labelValue: 'Week-Off Request(s)', isEnabledValue: 2, IconName: 'fa fa-university fa-2x', Color: '#88ddd1' }, { id: 3, cardName: 'On Duty', CountValue: 0, labelValue: 'On Duty Request(s)', isEnabledValue: 3, IconName: 'fa fa-briefcase fa-2x', Color: '#8d88dd' }, { id: 4, cardName: 'Work From Home', CountValue: 0, labelValue: 'Work From Home Request(s)', isEnabledValue: 4, IconName: 'fa fa-home fa-2x', Color: '#88dd8f' }];
    this.loadingScreenService.startLoading();
    this.cardslenght = `grid sm:grid-cols-1 gap-6`;
    this.AttendanceService.GetInitEmployeeCardsSrvc().subscribe((result) => {
      // debugger;
      console.log('GET InitCard Result ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        this.cardsArr = JSON.parse(apiResult.Result);
        for (var i in this.cardsArr) {
          if (this.cardsArr[i].Code == 'Leave') {
            this.cardsArr.splice(parseInt(i), 1);
          }
        }
        this.cardsArr = this.cardsArr.sort((a, b) => a.DisplayOrder - b.DisplayOrder);
        console.log('cardsArr ::', this.cardsArr);
        this.cardslenght = `grid sm:grid-cols-${this.cardsArr.length} gap-6`;
        this.isEnabled = 2;
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
    this.ReFreshFn();
    // this.ReFreshFnWOW();
  };
  ReFreshFn() {
    this.StatusId = null;
    this.DateId = null;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: -1
    };
    parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
    parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    console.log(parms);
    // debugger;
    this.getGritFilterDataFn(parms);
  };
  ReFreshFnWOW() {
    this.StatusIdWOW = null;
    this.DateIdWOW = null;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: -1
    };
    parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
    parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    console.log(parms);
    // debugger;
    this.getGritFilterDataWOWFn(parms);
  }
  ReFreshFnOd() {
    this.StatusIdOd = null;
    this.DateIdOd = null;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: -1
    };
    parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
    parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    console.log(parms);
    // debugger;
    this.getGritFilterDataOdFn(parms);
  }
  ReFreshFnWfh() {
    this.StatusIdWfh = null;
    this.DateIdWfh = null;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: -1
    };
    parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
    parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    console.log(parms);
    // debugger;
    this.getGritFilterDataWfhFn(parms);
  }
  submitWOWFn() {
    this.PostWOWArr = []
    //this.tableArrayWOW.forEach(element => {
    for (var e in this.tableArrayWOW) {
      if (this.tableArrayWOW[e].Select_Val == true) {
        if (this.tableArrayWOW[e].Status != 200) {
          this.alertService.showWarning('Please Select Rejected Records Only.');
          return;
        }
        var EmployeeRequestlist = new EmployeeRequest();
        EmployeeRequestlist.Id = this.tableArrayWOW[e].Id;
        EmployeeRequestlist.EmployeeId = this.tableArrayWOW[e].EmployeeId
        EmployeeRequestlist.Type = this.tableArrayWOW[e].Type;/*no explination*/
        EmployeeRequestlist.TotalTime = this.tableArrayWOW[e].TotalTime;
        EmployeeRequestlist.TotalApprovedTime = this.tableArrayWOW[e].TotalApprovedTime;
        EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = this.tableArrayWOW[e].EmployeeAttendanceBreakUpDetailsId;
        EmployeeRequestlist.Date = moment(new Date(this.tableArrayWOW[e].Date)).format('YYYY-MM-DD');
        EmployeeRequestlist.StartTime = this.tableArrayWOW[e].StartTime;
        EmployeeRequestlist.EndTime = this.tableArrayWOW[e].EndTime;
        EmployeeRequestlist.ApprovedStartTime = this.tableArrayWOW[e].ApprovedStartTime;
        EmployeeRequestlist.ApprovedEndTime = this.tableArrayWOW[e].ApprovedEndTime;
        EmployeeRequestlist.IsPermissionAllowed = this.tableArrayWOW[e].IsPermissionAllowed;
        EmployeeRequestlist.IncludeInCalculation = this.tableArrayWOW[e].IncludeInCalculation;
        EmployeeRequestlist.RequestedClaimType = this.tableArrayWOW[e].RequestedClaimType;
        EmployeeRequestlist.ApprovedClaimType = this.tableArrayWOW[e].ApprovedClaimType;
        EmployeeRequestlist.IsCompOffApplicable = this.tableArrayWOW[e].IsCompOffApplicable;
        EmployeeRequestlist.ModuleProcessTransactionId = this.tableArrayWOW[e].ModuleProcessTransactionId;
        EmployeeRequestlist.EmployeeRemarks = this.tableArrayWOW[e].EmployeeRemarks;
        EmployeeRequestlist.ApproverRemarks = this.tableArrayWOW[e].ApplieRemarks;
        EmployeeRequestlist.Status = 100;
        EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
        EmployeeRequestlist.Message = "";/*no eplination*/
        this.PostWOWArr.push(EmployeeRequestlist);
      }
    };
    //});
    console.log('submitedObj', this.PostWOWArr);
    if (this.PostWOWArr.length > 0) {
      this.spinner = true;
      this.AttendanceService.Post_WOW_Aprove_Reject_Request(this.PostWOWArr).subscribe((result) => {
        this.spinner = false;
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.SearchSubFnWOW();
        }
        else {
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.spinner = false;
        console.log(error);
        this.alertService.showInfo('Submission Failed');
      });
    }
    else {
      this.alertService.showWarning('Please Select The Records.');
    }

  }
  submitOdFn() {
    this.PostOdArr = []
    //this.tableArrayOd.forEach(element => {
    for (var e in this.tableArrayOd) {
      if (this.tableArrayOd[e].Select_Val == true) {
        if (this.tableArrayOd[e].Status != 200) {
          this.alertService.showWarning('Please Select Rejected Records Only.');
          return;
        }
        var EmployeeRequestlist = new EmployeeRequest();
        EmployeeRequestlist.Id = this.tableArrayOd[e].Id;
        EmployeeRequestlist.EmployeeId = this.tableArrayOd[e].EmployeeId
        EmployeeRequestlist.Type = this.tableArrayOd[e].Type;/*no explination*/
        EmployeeRequestlist.TotalTime = this.tableArrayOd[e].TotalTime;
        EmployeeRequestlist.TotalApprovedTime = this.tableArrayOd[e].TotalApprovedTime;
        EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = this.tableArrayOd[e].EmployeeAttendanceBreakUpDetailsId;
        EmployeeRequestlist.Date = moment(new Date(this.tableArrayOd[e].Date)).format('YYYY-MM-DD');
        EmployeeRequestlist.StartTime = this.tableArrayOd[e].StartTime;
        EmployeeRequestlist.EndTime = this.tableArrayOd[e].EndTime;
        EmployeeRequestlist.ApprovedStartTime = this.tableArrayOd[e].ApprovedStartTime;
        EmployeeRequestlist.ApprovedEndTime = this.tableArrayOd[e].ApprovedEndTime;
        EmployeeRequestlist.IsPermissionAllowed = this.tableArrayOd[e].IsPermissionAllowed;
        EmployeeRequestlist.IncludeInCalculation = this.tableArrayOd[e].IncludeInCalculation;
        EmployeeRequestlist.RequestedClaimType = this.tableArrayOd[e].RequestedClaimType;
        EmployeeRequestlist.ApprovedClaimType = this.tableArrayOd[e].ApprovedClaimType;
        EmployeeRequestlist.IsCompOffApplicable = this.tableArrayOd[e].IsCompOffApplicable;
        EmployeeRequestlist.ModuleProcessTransactionId = this.tableArrayOd[e].ModuleProcessTransactionId;
        EmployeeRequestlist.EmployeeRemarks = this.tableArrayOd[e].EmployeeRemarks;
        EmployeeRequestlist.ApproverRemarks = this.tableArrayOd[e].ApplieRemarks;
        EmployeeRequestlist.Status = 100;
        EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
        EmployeeRequestlist.Message = "";/*no eplination*/
        this.PostOdArr.push(EmployeeRequestlist);
      }
    };
    //});
    console.log('submitedObj', this.PostOdArr);
    if (this.PostOdArr.length > 0) {
      //this.spinner = true;
      /*Submit Api For Od*/
      // this.AttendanceService.Post_Od_Aprove_Reject_Request(this.PostOdArr).subscribe((result) => {
      //   this.spinner = false;
      //   let apiResult: apiResult = result;
      //   if (apiResult.Status) {
      //     this.alertService.showSuccess(apiResult.Message);
      //     this.SearchSubFnOd();
      //   }
      //   else {
      //     this.alertService.showWarning(apiResult.Message);
      //   }
      // }, error => {
      //   this.spinner = false;
      //   console.log(error);
      //   this.alertService.showInfo('Submission Failed');
      // });
    }
    else {
      this.alertService.showWarning('Please Select The Records.');
    }

  }
  submitWfhFn() {
    this.PostWfhArr = []
    //this.tableArrayWfh.forEach(element => {
    for (var e in this.tableArrayWfh) {
      if (this.tableArrayWfh[e].Select_Val == true) {
        if (this.tableArrayWfh[e].Status != 200) {
          this.alertService.showWarning('Please Select Rejected Records Only.');
          return;
        }
        var EmployeeRequestlist = new EmployeeRequest();
        EmployeeRequestlist.Id = this.tableArrayWfh[e].Id;
        EmployeeRequestlist.EmployeeId = this.tableArrayWfh[e].EmployeeId
        EmployeeRequestlist.Type = this.tableArrayWfh[e].Type;/*no explination*/
        EmployeeRequestlist.TotalTime = this.tableArrayWfh[e].TotalTime;
        EmployeeRequestlist.TotalApprovedTime = this.tableArrayWfh[e].TotalApprovedTime;
        EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = this.tableArrayWfh[e].EmployeeAttendanceBreakUpDetailsId;
        EmployeeRequestlist.Date = moment(new Date(this.tableArrayWfh[e].Date)).format('YYYY-MM-DD');
        EmployeeRequestlist.StartTime = this.tableArrayWfh[e].StartTime;
        EmployeeRequestlist.EndTime = this.tableArrayWfh[e].EndTime;
        EmployeeRequestlist.ApprovedStartTime = this.tableArrayWfh[e].ApprovedStartTime;
        EmployeeRequestlist.ApprovedEndTime = this.tableArrayWfh[e].ApprovedEndTime;
        EmployeeRequestlist.IsPermissionAllowed = this.tableArrayWfh[e].IsPermissionAllowed;
        EmployeeRequestlist.IncludeInCalculation = this.tableArrayWfh[e].IncludeInCalculation;
        EmployeeRequestlist.RequestedClaimType = this.tableArrayWfh[e].RequestedClaimType;
        EmployeeRequestlist.ApprovedClaimType = this.tableArrayWfh[e].ApprovedClaimType;
        EmployeeRequestlist.IsCompOffApplicable = this.tableArrayWfh[e].IsCompOffApplicable;
        EmployeeRequestlist.ModuleProcessTransactionId = this.tableArrayWfh[e].ModuleProcessTransactionId;
        EmployeeRequestlist.EmployeeRemarks = this.tableArrayWfh[e].EmployeeRemarks;
        EmployeeRequestlist.ApproverRemarks = this.tableArrayWfh[e].ApplieRemarks;
        EmployeeRequestlist.Status = 100;
        EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
        EmployeeRequestlist.Message = "";/*no eplination*/
        this.PostWfhArr.push(EmployeeRequestlist);
      }
    };
    //});
    console.log('submitedObj', this.PostWfhArr);
    if (this.PostWfhArr.length > 0) {
      //this.spinner = true;
      /*Submit Api For Wfh*/
      // this.AttendanceService.Post_Wfh_Aprove_Reject_Request(this.PostWfhArr).subscribe((result) => {
      //   this.spinner = false;
      //   let apiResult: apiResult = result;
      //   if (apiResult.Status) {
      //     this.alertService.showSuccess(apiResult.Message);
      //     this.SearchSubFnWfh();
      //   }
      //   else {
      //     this.alertService.showWarning(apiResult.Message);
      //   }
      // }, error => {
      //   this.spinner = false;
      //   console.log(error);
      //   this.alertService.showInfo('Submission Failed');
      // });
    }
    else {
      this.alertService.showWarning('Please Select The Records.');
    }

  }
  onChange_DateSearch() { };
  onChange_DateSearchWOW() { };
  onChange_DateSearchOd() { };
  onChange_DateSearchWfh() { };

  async getGritFilterDataWOWFn(Data) {
    this.spinner = true;
    this.tableArrayWOW = [];
    await this.AttendanceService.getEmployeeWOWReq(Data).subscribe((result) => {
      //debugger;
      this.spinner = false;
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        var Arr = JSON.parse(apiResult.Result);
        Arr.forEach(el => {
          el.Select_Val = false;
          el.Select_Date = ''
        });
        this.tableArrayWOW = Arr;
        console.log('RES WOW ::', this.tableArrayWOW);
        this.findCountValueFn(this.tableArrayWOW);
        Arr = [];
      }
      else {

      }
    });
  }
  async getGritFilterDataOdFn(Data) {
    this.spinner = true;
    this.tableArrayOd = [];
    /*Search Od Fn API*/
    await this.AttendanceService.GetODRequestsForEmployeeUISrvcMethod(Data).subscribe((result) => {
      //debugger;
      this.spinner = false;
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        var Arr = JSON.parse(apiResult.Result);
        //console.log('RES OD ::', Arr);
        Arr.forEach(el => {
          el.Select_Val = false;
          el.Select_Date = ''
        });
        this.tableArrayOd = Arr;
        console.log('RES OD ::', this.tableArrayOd);
        this.findCountValueFn(this.tableArrayOd);
        Arr = [];
      }
      else {

      }
    });
  }
  async getGritFilterDataWfhFn(Data) {
    this.spinner = true;
    this.tableArrayWfh = [];
    /*Search API For Wfh */
    await this.AttendanceService.GetWFHRequestsForEmployeeUISrvcMethod(Data).subscribe((result) => {
      //debugger;
      this.spinner = false;
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        var Arr = JSON.parse(apiResult.Result);
        Arr.forEach(el => {
          el.Select_Val = false;
          el.Select_Date = ''
        });
        this.tableArrayWfh = Arr;
        console.log('RES WFH ::', this.tableArrayWfh);
        this.findCountValueFn(this.tableArrayWfh);
        Arr = [];
      }
      else {

      }
    });
  }

  async getGritFilterDataFn(Data) {
    this.spinner = true;
    this.tableArray = [];
    await this.AttendanceService.getPermissionsForEmployeeUI(Data.status, Data.FromDate, Data.TillDate).subscribe((result) => {
      //debugger;
      this.spinner = false;
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        var Arr = JSON.parse(apiResult.Result);
        Arr.forEach(el => {
          el.Select_Val = false;
          el.Select_Date = ''
        });
        this.tableArray = Arr;
        if (this.tableArray && this.tableArray.length > 0) {
          this.tableArray = this.timeCalulation(this.tableArray);
          for (let item of this.tableArray) {
            item['isSelect'] = false
          }
        }
        console.log('RES Permission ::', this.tableArray);
        this.findCountValueFn(this.tableArray);
        Arr = [];
      }
      else {
        // this.tableArray = [{ Id: 1, Select_Val: false, Select_Date: '', Date: '17-12-2021', Expire_On: '25-12-2021', Status: 'Active', Action: 'Avail', compDate: '' }, { Id: 2, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 3, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 4, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 5, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 6, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 7, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 8, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }];
      }
    });
  }
  findCountValueFn(Arr) {
    this.cardsArr.forEach(ele => {
      if (ele.CardValue == this.isEnabled) {
        ele.Count = null;
        ele.Count = Arr.length;
      }
    })
  }
  timeCalulation(requestList) {
    let _splitTime = []
    if (requestList && requestList.length > 0) {
      for (let reqObj of requestList) {
        reqObj.CreatedOn = moment(reqObj.CreatedOn).format('YYYY-MM-DD')


        let totalMin = moment.duration(reqObj.EndTime).asMinutes() - moment.duration(reqObj.StartTime).asMinutes();

        let diffTime = moment.utc(moment.duration(totalMin, "minutes").asMilliseconds()).format("HH:mm")
        _splitTime = diffTime.split(":");
        reqObj['totalTime'] = `${_splitTime[0]} Hr ${_splitTime[1]} Min`


        reqObj['requestedTime'] = `${_splitTime[0]} Hr ${_splitTime[1]} Min`
        reqObj.StartTimeorg = reqObj.StartTime;
        reqObj.EndTimeorg = reqObj.EndTime;
        reqObj.StartTime = moment(reqObj.StartTime, "HH:mm:ss").format("hh:mm A");
        reqObj.EndTime = moment(reqObj.EndTime, "HH:mm:ss").format("hh:mm A");

      }
      return requestList
    }
    else {
      return requestList = []
    }
  }
  cancellationShowPopup(obj) {
    $('#popup_CancelReuestPermission').modal('show');
    this.SelectedCancellationObj = obj;
  }
  cancellationhidePopup() {
    $('#popup_CancelReuestPermission').modal('hide');
    this.SelectedCancellationObj = null;
  }
  cancellationShowWow(obj) {
    $('#popup_CancelRequestWOW').modal('show');
    this.SelectedCancellationWowObj = obj;
  }
  cancellationHideWow() {
    $('#popup_CancelRequestWOW').modal('hide');
    this.SelectedCancellationWowObj = null;
  }
  cancellationShowOd(obj) {
    $('#popup_CancelRequestOd').modal('show');
    this.SelectedCancellationOdObj = obj;
  }
  cancellationHideOd() {
    $('#popup_CancelRequestOd').modal('hide');
    this.SelectedCancellationOdObj = null;
  }
  cancellationShowWfh(obj) {
    $('#popup_CancelRequestWfh').modal('show');
    this.SelectedCancellationWfhObj = obj;
  }
  cancellationHidewWfh() {
    $('#popup_CancelRequestWfh').modal('hide');
    this.SelectedCancellationWfhObj = null;
  }
  cancelrequest(typ, obj) {
    if (typ == 'Permission') {
      var EmployeeRequestlist = new EmployeeRequest();
      EmployeeRequestlist.Id = obj.Id;
      EmployeeRequestlist.EmployeeId = obj.EmployeeId
      EmployeeRequestlist.Type = obj.Type;
      EmployeeRequestlist.TotalTime = obj.TotalTime;
      EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
      EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
      EmployeeRequestlist.Date = moment(obj.Date).format('YYYY-MM-DD');
      EmployeeRequestlist.StartTime = obj.StartTimeorg
      EmployeeRequestlist.EndTime = obj.EndTimeorg
      EmployeeRequestlist.ApprovedStartTime = obj.ApprovedStartTime;
      EmployeeRequestlist.ApprovedEndTime = obj.ApprovedEndTime;
      EmployeeRequestlist.IsPermissionAllowed = obj.IsPermissionAllowed;
      EmployeeRequestlist.IncludeInCalculation = obj.IncludeInCalculation;
      EmployeeRequestlist.RequestedClaimType = obj.RequestedClaimType;
      EmployeeRequestlist.ApprovedClaimType = obj.ApprovedClaimType;
      EmployeeRequestlist.IsCompOffApplicable = obj.IsCompOffApplicable;
      EmployeeRequestlist.ModuleProcessTransactionId = obj.ModuleProcessTransactionId;
      EmployeeRequestlist.EmployeeRemarks = obj.EmployeeRemarks;
      EmployeeRequestlist.ApproverRemarks = obj.ApproverRemarks;
      EmployeeRequestlist.Status = obj.Status;
      EmployeeRequestlist.ModuleProcessStatus = 0;
      EmployeeRequestlist.Message = "";
      EmployeeRequestlist.ExpireOn = obj.ExpireOn ? moment(obj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.ApprovedExpireOn = obj.ApprovedExpireOn ? moment(obj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.FromDate = obj.FromDate || '1900-01-01';
      EmployeeRequestlist.TillDate = obj.TillDate || '1900-01-01';
      EmployeeRequestlist.CancelStatus = 100

      this.spinner = true;
      this.loadingScreenService.startLoading();
      var submitArr = [];
      submitArr.push(EmployeeRequestlist);
      console.log('cancellation permission', submitArr);
      this.AttendanceService.Post_Per_Aprove_Reject_Request(submitArr).subscribe((result) => {
        //debugger;
        if (result.Status) {
          this.ReFreshFn();
          this.alertService.showSuccess(result.Message);
          this.cancellationhidePopup();
        }
        this.spinner = false;
        this.loadingScreenService.stopLoading();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.ReFreshFn();
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      })
    }
    else if (typ == 'wow') {
      var EmployeeRequestlist = new EmployeeRequest();
      EmployeeRequestlist.Id = obj.Id;
      EmployeeRequestlist.EmployeeId = obj.EmployeeId
      EmployeeRequestlist.Type = obj.Type;
      EmployeeRequestlist.TotalTime = obj.TotalTime;
      EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
      EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
      EmployeeRequestlist.Date = moment(obj.Date).format('YYYY-MM-DD');
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
      EmployeeRequestlist.ApproverRemarks = obj.ApproverRemarks;
      EmployeeRequestlist.Status = obj.Status;
      EmployeeRequestlist.ModuleProcessStatus = 0;
      EmployeeRequestlist.Message = "";
      EmployeeRequestlist.ExpireOn = obj.ExpireOn ? moment(obj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.ApprovedExpireOn = obj.ApprovedExpireOn ? moment(obj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.FromDate = obj.FromDate;
      EmployeeRequestlist.TillDate = obj.TillDate;
      EmployeeRequestlist.CancelStatus = 100

      this.spinner = true;
      this.loadingScreenService.startLoading();
      var submitArr = [];
      submitArr.push(EmployeeRequestlist);
      console.log('cancellation WOW', submitArr);
      this.AttendanceService.Post_WOW_Aprove_Reject_Request(submitArr).subscribe((result) => {
        //debugger;
        if (result.Status) {
          this.ReFreshFnWOW();
          this.alertService.showSuccess(result.Message);
          this.cancellationHideWow();
        }
        this.spinner = false;
        this.loadingScreenService.stopLoading();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.ReFreshFnWOW();
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      })
    }
    else if (typ == 'od') {
      var EmployeeRequestlist = new EmployeeRequest();
      EmployeeRequestlist.Id = obj.Id;
      EmployeeRequestlist.EmployeeId = obj.EmployeeId
      EmployeeRequestlist.Type = obj.Type;
      EmployeeRequestlist.TotalTime = obj.TotalTime;
      EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
      EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
      EmployeeRequestlist.Date = moment(obj.Date).format('YYYY-MM-DD');
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
      EmployeeRequestlist.ApproverRemarks = obj.ApproverRemarks;
      EmployeeRequestlist.Status = obj.Status;
      EmployeeRequestlist.ModuleProcessStatus = 0;
      EmployeeRequestlist.Message = "";
      EmployeeRequestlist.ExpireOn = obj.ExpireOn ? moment(obj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.ApprovedExpireOn = obj.ApprovedExpireOn ? moment(obj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.FromDate = obj.FromDate;
      EmployeeRequestlist.TillDate = obj.TillDate;
      EmployeeRequestlist.CancelStatus = 100

      this.spinner = true;
      this.loadingScreenService.startLoading();
      var submitArr = [];
      submitArr.push(EmployeeRequestlist);
      console.log('cancellation OD', submitArr);
      this.AttendanceService.postManagerOdAproveReject(submitArr).subscribe((result) => {

        if (result.Status) {
          this.ReFreshFnOd();
          this.alertService.showSuccess(result.Message);
          $('#popup_CancelRequestOd').modal('hide');
        }
        this.spinner = false;
        this.loadingScreenService.stopLoading();
      }, error => {
        this.spinner = false;
        console.log(error);
        this.ReFreshFnOd();
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      })
    }
    else if (typ == 'wfh') {
      var EmployeeRequestlist = new EmployeeRequest();
      EmployeeRequestlist.Id = obj.Id;
      EmployeeRequestlist.EmployeeId = obj.EmployeeId
      EmployeeRequestlist.Type = obj.Type;
      EmployeeRequestlist.TotalTime = obj.TotalTime;
      EmployeeRequestlist.TotalApprovedTime = obj.TotalApprovedTime;
      EmployeeRequestlist.EmployeeAttendanceBreakUpDetailsId = obj.EmployeeAttendanceBreakUpDetailsId;
      EmployeeRequestlist.Date = moment(obj.Date).format('YYYY-MM-DD');
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
      EmployeeRequestlist.ApproverRemarks = obj.ApproverRemarks;
      EmployeeRequestlist.Status = obj.Status;
      EmployeeRequestlist.ModuleProcessStatus = 0;
      EmployeeRequestlist.Message = "";
      EmployeeRequestlist.ExpireOn = obj.ExpireOn ? moment(obj.ExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.ApprovedExpireOn = obj.ApprovedExpireOn ? moment(obj.ApprovedExpireOn).format('YYYY-MM-DD') : '1900-01-01';
      EmployeeRequestlist.FromDate = obj.FromDate;
      EmployeeRequestlist.TillDate = obj.TillDate;
      EmployeeRequestlist.CancelStatus = 100

      this.spinner = true;
      this.loadingScreenService.startLoading();
      var submitArr = [];
      submitArr.push(EmployeeRequestlist);
      console.log('cancellation WFH', submitArr);
      this.AttendanceService.postManagerWfhAproveReject(submitArr).subscribe((result) => {
        //debugger;
        if (result.Status) {
          this.ReFreshFnWfh();
          this.alertService.showSuccess(result.Message);
          this.cancellationHidewWfh();
        }
        this.spinner = false;
        this.loadingScreenService.stopLoading();
      }, error => {
        this.spinner = false;
        this.ReFreshFnWfh();
        console.log(error);
        this.alertService.showInfo('Submission Failed');
        this.loadingScreenService.stopLoading();
      })
    }
  }
}
