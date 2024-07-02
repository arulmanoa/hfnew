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
import Swal from 'sweetalert2';
@Component({
  selector: 'app-employee-compensation-ui',
  templateUrl: './employee-compensation-ui.component.html',
  styleUrls: ['./employee-compensation-ui.component.css']
})

export class EmployeeCompensationUiComponent implements OnInit {
  StatusListWOW: any[] = []
  PostWOWArr: any;
  DateIdWOW: any;
  StatusIdWOW: any;
  tableArrayWOW: any[] = [];
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
  CompensationRemarks : any;
  resubmitedRemarks : any;
  _AvailCompensationModel: AvailCompensationModel = new AvailCompensationModel()
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
  CheckAllFn(val) {

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
    for (var i in this.tableArray) {
      if (this.tableArray[i].Select_Val == true && this.tableArray[i].Status != 100) {
        this.alertService.showWarning("please Select Available Status Records Only.");
        return;
      }
    }

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
    this._dateRange = null;
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
    this.StatusId ? parms.status = this.StatusId : parms.status = 0;
    console.log(parms);
    this.getGritFilterDataFn(parms);
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
    this.StatusIdWOW ? parms.status = this.StatusIdWOW : parms.status = 0;
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
            CompensationIds: [],
            Remarks: this.CompensationRemarks
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
          // this.AttendanceService.Post_Avail_Multy_Compensation(ParmsMulty).subscribe((ress) => {
          //   this.loadingScreenService.stopLoading();
          //   this.spinner = false;
          //   console.log('Post_Multiple_Avail_responce', ress);
             this.loadingScreenService.stopLoading();
          //   if (ress && ress.Status == true) {
          //     this.alertService.showSuccess(ress.Message);
          //     $('#popup_Comp').modal('hide');
          //     this.ReFreshFn();
          //   }
          //   else if (ress && ress.Status == false) {
          //     this.alertService.showWarning(ress.Message);
          //   }
          // }, err => {
          //   console.error('Post_Multiple_Avail API Error');
          // })
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
            Remarks:''
          }
          submitedArr.forEach(element => {
            initparms.CompensationId = element.Id;
            initparms.ClaimType = 300;
            initparms.EmployeeEntitlementId = 0;
            initparms.LeaveDate = moment(element.Select_Date).format('YYYY-MM-DD');
            initparms.Remarks = this.CompensationRemarks;
            SplitDatesParms.push(initparms);
          });
          //this._AvailCompensationModel.EmployeeEntitlementId = 1;
          /*API Split Dates in multy*/
          this.spinner = true;
          this.loadingScreenService.startLoading();
          console.log('insertParms', SplitDatesParms);
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
        LeaveDate: moment(new Date(this._IndividualDate)).format('YYYY-MM-DD'),
        Remarks : this.CompensationRemarks
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
  claimEnabled(val) {
    this.isEnabled = val;
  }
  ngOnInit() {
    this.isEnabled = 1;
    let maxDate = new Date().setMonth(new Date().getMonth() + 1 + 3);//this is for 3 months
    this._MaxDate = new Date(maxDate);
    let minDate = new Date('01-01-1990');
    this._MinDate = new Date(minDate)
    this.AvailDisable = true;
    this._IndividualDateShow = false;
    this._from_minDate = new Date();
    this.LeaveTypSliderVal = false;
    this.StatusList = [{ id: 100, Name: 'Available' }, { id: 200, Name: 'Blocked' }, { id: 300, Name: 'Expired' }, { id: 400, Name: 'Availment Requested' }, { id: 500, Name: 'Availed' }];
    this.StatusListWOW = [{ id: 200, Name: 'Rejected' }, { id: 100, Name: 'Applied' }, { id: 300, Name: 'Approved' }];

    //this.Years = [{ id: 2019, name: '2019' }, { id: 2020, name: "2020" }, { id: 2021, name: "2021" }];
    //this.tableArray = [{ Id: 1, Select_Val: false, Select_Date: '', Date: '17-12-2021', Expire_On: '25-12-2021', Status: 'Active', Action: 'Avail', compDate: '' }, { Id: 2, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 3, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 4, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 5, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 6, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 7, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 8, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }];
    // this.CompensationDates = [{ Id: 1, _date: '' }, { Id: 2, _date: '' }, { Id: 3, _date: '' }];
    //this.getGritDataFn();
    this.ReFreshFn();
    this.ReFreshFnWOW();
  };
  ReFreshFn() {
    this.StatusId = null;
    this.DateId = null;
    this._dateRange = null;
    var parms = {
      FromDate: '',
      TillDate: '',
      status: 0
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
      status: 0
    };
    parms.FromDate = moment('1900-01-01').format('YYYY-MM-DD');
    parms.TillDate = moment('1900-01-01').format('YYYY-MM-DD');
    console.log(parms);
    // debugger;
    this.getGritFilterDataWOWFn(parms);
  }


  submitWOWFn() {
    if (this.tableArrayWOW.length == 0) {
      this.alertService.showWarning('At least one record have to be selected.');
      return;
    }

    console.log('this.tableArrayWOW', this.tableArrayWOW);

    if (this.tableArrayWOW.filter(a => a.Status == 200 && a.Status != 100).length > 0) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Re-submit remarks',
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
          this.tableArrayWOW.forEach(ee => {
            //ee.EmployeeRemarks = jsonStr;
            this.resubmitedRemarks = jsonStr;
          });

          this.triggerSubmitCall();

        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {

        }
      })

    } else {
      this.triggerSubmitCall();
    }

  }



  triggerSubmitCall() {
    this.PostWOWArr = []
    this.loadingScreenService.startLoading();
    //this.tableArrayWOW.forEach(element => {
    for (var e in this.tableArrayWOW) {
      if (this.tableArrayWOW[e].Select_Val == true) {
        if (this.tableArrayWOW[e].Status != 200) {
          this.loadingScreenService.stopLoading();
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
        EmployeeRequestlist.EmployeeRemarks = this.resubmitedRemarks //this.tableArrayWOW[e].EmployeeRemarks;
        EmployeeRequestlist.ApproverRemarks = this.tableArrayWOW[e].ApplieRemarks;
        EmployeeRequestlist.Status = 100;
        EmployeeRequestlist.ModuleProcessStatus = 0;/*no explination*/
        EmployeeRequestlist.Message = "";/*no eplination*/
        EmployeeRequestlist.ExpireOn = this.tableArrayWOW[e].ExpireOn ? moment(this.tableArrayWOW[e].ExpireOn).format('YYYY-MM-DD') : null;
        EmployeeRequestlist.ApprovedExpireOn = this.tableArrayWOW[e].ApprovedExpireOn ? moment(this.tableArrayWOW[e].ApprovedExpireOn).format('YYYY-MM-DD') : null;
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
          this.loadingScreenService.stopLoading();
          this.SearchSubFnWOW();
        }
        else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.spinner = false;
        console.log(error);
        this.loadingScreenService.stopLoading();
        this.alertService.showInfo('Submission Failed');
      });
    }
    else {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('Please Select The Records.');
    }

  }
  onChange_DateSearch() { }
  onChange_DateSearchWOW() { }

  getGritFilterDataWOWFn(Data) {
    this.spinner = true;
    this.tableArrayWOW = [];
    this.AttendanceService.getEmployeeWOWReq(Data).subscribe((result) => {
      //debugger;
      this.spinner = false;
      console.log('RES WOW ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        var Arr = JSON.parse(apiResult.Result);
        Arr.forEach(el => {
          el.Select_Val = false;
          el.Select_Date = ''
        });
        this.tableArrayWOW = Arr;
        Arr = [];
      }
      else {

      }
    })
  }

  getGritFilterDataFn(Data) {
    this.spinner = true;
    this.tableArray = [];
    this.AttendanceService.GetComensationUI(Data).subscribe((result) => {
      //debugger;
      this.spinner = false;
      console.log('RES Compensation ::', result);
      let apiResult: apiResult = result;
      if (apiResult.Status && apiResult.Result != null) {
        var Arr = JSON.parse(apiResult.Result);
        Arr.forEach(el => {
          el.Select_Val = false;
          el.Select_Date = ''
        });
        this.tableArray = Arr;
        Arr = [];
      }
      else {
        // this.tableArray = [{ Id: 1, Select_Val: false, Select_Date: '', Date: '17-12-2021', Expire_On: '25-12-2021', Status: 'Active', Action: 'Avail', compDate: '' }, { Id: 2, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 3, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 4, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 5, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 6, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 7, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }, { Id: 8, Select_Val: false, Select_Date: '', Date: '18-12-2021', Expire_On: '26-12-2021', Status: 'InActive', Action: 'UnAvail', compDate: '' }];
      }
    })
  }
}
