import { Component, OnInit } from '@angular/core';
import { AngularGridInstance } from 'angular-slickgrid';
import * as moment from 'moment';
import { AlertService, CommonService, SearchService } from 'src/app/_services/service';
import { PermissionConfiguration } from 'src/app/_services/model/Attendance/PermissionConfiguration'
import Swal from "sweetalert2";

import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SubmitPermissionModel } from 'src/app/_services/model/Attendance/SubmitPermissionModel'
import { EmployeeRequestStatus } from 'src/app/_services/model/Attendance/enums'
import { EmployeeRequest } from 'src/app/_services/model/Attendance/EmployeeRequest'
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
@Component({
  selector: 'app-employee-permission',
  templateUrl: './employee-permission.component.html',
  styleUrls: ['./employee-permission.component.css']
})
export class EmployeePermissionComponent implements OnInit {
  dummyPending: any = []
  dummyHistory: any = []
  grid: AngularGridInstance;
  _date: any
  _fromDate: any
  _todate: any
  _startTime: any
  _endTime: any
  _remarks: any
  _MaxDate: any;
  _MinDate: any;
  _minTime: any;
  _dateRange: any = [];
  _submittedHours: any;
  _employeeId: any;
  recentRequests: any = [];
  sessionDetails: any;
  _permissionConfig: any;
  _attendenceConfiguration: any;
  pendingRequests: any = [];
  approvedRequests: any = [];
  historyRequests: any = [];
  spinner: boolean = true;
  LstPermisssionRequests: any = [];
  activeTabName: any;
  permission: any;
  StatusArr: any = [];
  StatusId: any;
  constructor(
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    public sessionService: SessionStorage,
    private loadingScreenService: LoadingScreenService,
  ) { }

  ngOnInit() {
    //this.loadingScreenService.startLoading();
    this.StatusArr = [{ Id: 1, DisplayName: 'Applied', DisplayId: 100 }, { Id: 1, DisplayName: 'Reject', DisplayId: 200 }, { Id: 1, DisplayName: 'Approved', DisplayId: 300 }];
    this.activeTabName = 'pendingTab';
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this._employeeId = this.sessionDetails.EmployeeId
    // const _employeeCode = sessionStorage.getItem('loginUserId');

    this.attendanceService.GetAttendanceConfigurationByEmployeeId(this._employeeId)
      .subscribe((result) => {
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this._attendenceConfiguration = apiresult.Result

          this._permissionConfig = this._attendenceConfiguration.PermissionConfiguration
        }
      });
    this.attendanceService.getPermissionsForEmployeeUI(0, "1900-01-01", "1900-01-01")
      .subscribe((result) => {
        //this.loadingScreenService.stopLoading();
        this.spinner = false;
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.pendingRequests = JSON.parse(result.Result);
          this.pendingRequests = this.timeCalulation(this.pendingRequests);
          console.log(" this.pendingRequests", this.pendingRequests)
        }
      });




  }

  onClickNewPermission() {
    let count = 2
    this.attendanceService.getPermissionRequest(this._employeeId, count)
      .subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.recentRequests = JSON.parse(result.Result)
          this.recentRequests = this.timeCalulation(this.recentRequests)
          console.log(" this.recentRequests", this.recentRequests)
        }
        else {
          this.alertService.showWarning(apiresult.Message);
        }

      })

    this._minTime = moment().format("HH:mm")
    let minDate = new Date().setDate(new Date().getDate() - this._permissionConfig.MaxNoOfPastDaysAllowed);
    this._MinDate = new Date(minDate)
    let maxDate = new Date().setMonth(new Date().getMonth() + 1 + 3);//this is for 3 months
    this._MaxDate = new Date(maxDate)


    // this._MaxDate=new Date()


    console.log("date in permission popup", this._date)
    if (this._permissionConfig.IsAllowedToRequestPermission) {
      $('#popup_permission').modal('show');
    }
    else {
      //alert('You have no permission to take request')
      this.alertService.showWarning('Not allowed to request for permission')
    }

  }
  onClickSubmitPermission() {
    this.loadingScreenService.startLoading();
    if (this._date && this._startTime && this._endTime && this._remarks) {
      let data = new SubmitPermissionModel()
      data.EmployeeId = this._employeeId;
      data.Date = moment(this._date).format("YYYY-MM-DD");
      data.StartTime = this._startTime;
      data.EndTime = this._endTime
      data.Reason = this._remarks
      this.attendanceService.insertRequestPermission(data).subscribe((result) => {
        this.loadingScreenService.stopLoading();
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this._submittedHours = null
          this.alertService.showSuccess(apiresult.Message);
          this.closePermissionPopup()
          this.LstPermisssionRequests = [];
          this.pendingTabRequests('R');
        }
        else {
          // ! 16.2 Panasonic 
          this.alertService.showWarning("An error occurred :  You may not specify a new request in the upcoming attendance period or You have already obtained permission for that particular date.");
        }

      })

    } else {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning('Please provide required fields');
      //alert('please provide required fields')
    }
  }
  onChangeExpenseDate(i) {

  }
  // onSearchChange(searchValue: string): void { 

  //   var takenTime = searchValue;

  //   var curtime = moment.duration(this._permissionConfig.MinTimeInterval).asMinutes();

  //   let totalMin=moment.duration(takenTime).asMinutes()-moment.duration(this._startTime).asMinutes()
  //   let totalTime=moment.utc( moment.duration(totalMin, "minutes") .asMilliseconds()).format("HH:mm")
  //   let Final_time=moment(this._startTime, 'HH:mm:ss').add(curtime, 'minutes').format('HH:mm');
  //   if(totalTime>=this._permissionConfig.MinTimeInterval&&takenTime<="23:59:00")
  //   if(takenTime < this._startTime){
  //     this.alertService.showWarning('Please enter valid time....');
  //     this._endTime=null
  //     this._submittedHours=null

  //   }
  //   else if(Final_time>takenTime){
  //     this.alertService.showWarning(`Minimum time allowed for permission: ${this._permissionConfig.MinTimeInterval}.`);
  //     this._endTime=null
  //     this._submittedHours=null
  //   }
  //   else{
  //     this._submittedHours= moment.duration(takenTime).asMinutes()-moment.duration(this._startTime).asMinutes()
  //     var totalTimeInMin = this._submittedHours;
  //    // this._submittedHours=(Math.floor(totalTimeInMin / 60) + ':' + totalTimeInMin % 60)
  //    this._submittedHours=moment.utc( moment.duration(totalTimeInMin, "minutes") .asMilliseconds()).format("HH:mm")
  //     console.log("this._submittedHours",this._submittedHours);

  //   }
  // }
  onSearchChange(searchValue: string): void {

    var takenTime = searchValue;
    var curtime = moment.duration(this._permissionConfig.MinTimeInterval).asMinutes();
    let totalMin = moment.duration(takenTime).asMinutes() - moment.duration(this._startTime).asMinutes()
    let totalTime = moment.utc(moment.duration(totalMin, "minutes").asMilliseconds()).format("HH:mm")



    let maxTimeInterval = moment.duration(this._permissionConfig.MaxTimeInterval).asMinutes();
    let maxAllowedTime = moment(this._startTime, 'HH:mm:ss').add(maxTimeInterval, 'minutes').format('HH:mm');
    let Final_time = moment(this._startTime, 'HH:mm:ss').add(curtime, 'minutes').format('HH:mm');


    if (totalTime >= this._permissionConfig.MinTimeInterval && totalTime <= this._permissionConfig.MaxTimeInterval && takenTime <= "23:59:00") {

      this._submittedHours = moment.duration(takenTime).asMinutes() - moment.duration(this._startTime).asMinutes()
      var totalTimeInMin = this._submittedHours;
      // this._submittedHours=(Math.floor(totalTimeInMin / 60) + ':' + totalTimeInMin % 60)
      this._submittedHours = moment.utc(moment.duration(totalTimeInMin, "minutes").asMilliseconds()).format("h:mm")
      console.log("this._submittedHours", this._submittedHours);
    }
    else if (this._startTime > this._endTime) {
      this._endTime = null
      this._submittedHours = null
      this.alertService.showWarning(`Start time is lesser than end time.`);
    }
    else if (takenTime > maxAllowedTime) {
      this._endTime = null
      this._submittedHours = null
      this.alertService.showWarning(`Maximum time allowed for permission: ${this._permissionConfig.MaxTimeInterval}.`);

    }
    else if (takenTime < this._startTime) {
      this._endTime = null
      this._submittedHours = null
      this.alertService.showWarning('Please enter valid time....');
    }
    else if (Final_time > takenTime) {
      this.alertService.showWarning(`Minimum time allowed for permission: ${this._permissionConfig.MinTimeInterval}.`);
      this._endTime = null
      this._submittedHours = null
    }
    else {
      this._submittedHours = moment.duration(takenTime).asMinutes() - moment.duration(this._startTime).asMinutes()
      var totalTimeInMin = this._submittedHours;
      // this._submittedHours=(Math.floor(totalTimeInMin / 60) + ':' + totalTimeInMin % 60)
      this._submittedHours = moment.utc(moment.duration(totalTimeInMin, "minutes").asMilliseconds()).format("h:mm")
      console.log("this._submittedHours", this._submittedHours);

    }
  }

  closePermissionPopup() {
    this._date = null
    this._startTime = null
    this._endTime = null
    this._remarks = null
    this._submittedHours = null
    $('#popup_permission').modal('hide');
  }
  dateRangeSearch() {
    this.loadingScreenService.startLoading();
    if (this._dateRange && this._dateRange.length > 0) {
      this._fromDate = moment(this._dateRange[0]).format("YYYY-MM-DD")
      this._todate = moment(this._dateRange[1]).format("YYYY-MM-DD")
      this.historyTabRequests('S')
    }
    else {
      // this._fromDate=moment().startOf('month').format('YYYY-MM-DD');
      // this._todate=moment().endOf('month').format('YYYY-MM-DD');

      // this._dateRange.push(new Date(this._fromDate));
      // this._dateRange.push(new Date(this._todate));
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(`Please enter valid date...`);
    }
  }

  onTabChange(event) {
    this.activeTabName = event.nextId;
    if (event && event.nextId == "pendingTab") {
      this.LstPermisssionRequests = [];
      this.pendingTabRequests('R')
    }
    else if (event && event.nextId == "approvedTab") {
      this.ApprovedTabRequests('R')
    }
    else if (event && event.nextId == "historyTab") {

    }
    // this.historyTabRequests('R')
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
        reqObj.StartTime = moment(reqObj.StartTime, "HH:mm:ss").format("hh:mm A");
        reqObj.EndTime = moment(reqObj.EndTime, "HH:mm:ss").format("hh:mm A");
      }
      return requestList
    }
    else {
      return requestList = []
    }
  }
  pendingTabRequests(btnTyp) {
    this.loadingScreenService.startLoading();
    let status = 0; // including applied and rejected items should come in this bucket   EmployeeRequestStatus.Submitted
    let fromDate = "1900-01-01"
    let tillDate = "1900-01-01"
    this.attendanceService.getPermissionsForEmployeeUI(status, fromDate, tillDate).subscribe((result) => {
      console.log(result);
      this.loadingScreenService.stopLoading();
      let apiresult: apiResult = result;
      if (apiresult.Status) {
        this.pendingRequests = JSON.parse(result.Result);
        if (this.pendingRequests && this.pendingRequests.length > 0) {
          this.pendingRequests = this.timeCalulation(this.pendingRequests);
          for (let item of this.pendingRequests) {
            item['isSelect'] = false
          }
        }
        else {
          this.pendingRequests = []
        }
        console.log(" this.pendingRequests", this.pendingRequests)
      }
      else {
        this.alertService.showWarning(apiresult.Message);
      }

    });
  }
  ApprovedTabRequests(btnTyp) {
    this.loadingScreenService.startLoading();
    let status = EmployeeRequestStatus.Approved
    let fromDate = "1900-01-01"
    let tillDate = "1900-01-01"
    this.attendanceService.getPermissionsForEmployeeUI(status, fromDate, tillDate).subscribe((result) => {
      console.log(result);
      this.loadingScreenService.stopLoading();
      let apiresult: apiResult = result;
      if (apiresult.Status) {
        this.approvedRequests = JSON.parse(result.Result);
        if (this.approvedRequests && this.approvedRequests.length > 0) {
          this.approvedRequests = this.timeCalulation(this.approvedRequests);
          for (let item of this.approvedRequests) {
            item['isSelect'] = false
          }
        }
        else {
          this.approvedRequests = []
        }
        console.log(" this.approvedRequests", this.approvedRequests)
      }
      else {
        this.alertService.showWarning(apiresult.Message);
      }

    });
  }
  onSearchStartChange(i) {
    this._endTime = null
    this._submittedHours = null
  }
  historyTabRequests(btnTyp) {
    this.loadingScreenService.startLoading();
    //let status = EmployeeRequestStatus.Approved
    let Searchstatus = this.StatusId;
    Searchstatus ? Searchstatus : Searchstatus = 0;
    if (!this._fromDate && !this._todate || btnTyp == 'R') {
      this._dateRange = null;
      this.StatusId = null;
      this._fromDate = "1900-01-01"
      this._todate = "1900-01-01"
    }

    this.attendanceService.getPermissionsForEmployeeUI(Searchstatus, this._fromDate, this._todate).subscribe((result) => {
      console.log(result);
      this.loadingScreenService.stopLoading();
      let apiresult: apiResult = result;
      if (apiresult.Status) {
        this.historyRequests = JSON.parse(result.Result)
        if (this.historyRequests && this.historyRequests.length > 0) {
          this.historyRequests = this.timeCalulation(this.historyRequests);
        }
        else {
          this.historyRequests = [];
        }
        console.log(" this.historyRequests", this.historyRequests)
      }
      else {
        this.alertService.showWarning(apiresult.Message);
      }

    });
  }


  selectPermissionRecords(obj, isSelectd) {

    console.log('Object ', obj)

    let updateItem = this.LstPermisssionRequests.find(i => i.Id == obj.Id);
    let index = this.LstPermisssionRequests.indexOf(updateItem);
    if (index > -1) {
      this.LstPermisssionRequests.splice(index, 1);
    }
    else {
      this.LstPermisssionRequests.push(obj);
    }
  }





  clickOnRefresh(btnTyp) {
    if (this.activeTabName == 'pendingTab') {
      this.LstPermisssionRequests = [];
      this.pendingTabRequests(btnTyp);
    }
    else if (this.activeTabName == 'approvedTab') {
      this.ApprovedTabRequests(btnTyp);
    }
    else if (this.activeTabName == 'historyTab') {
      this.StatusId = null;
      this.historyTabRequests(btnTyp);
    }
  }
  clickOnSubmit() {
    if (this.LstPermisssionRequests.length == 0) {
      this.alertService.showWarning('At least one record have to be selected.');
      return;
    }

    console.log('this.LstPermisssionRequests', this.LstPermisssionRequests);

    if (this.LstPermisssionRequests.filter(a => a.Status == 200 && a.Status != 100).length > 0) {
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
          this.LstPermisssionRequests.forEach(ee => {
            ee.EmployeeRemarks = jsonStr;
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

    let submitdata = []
    this.loadingScreenService.startLoading();

    for (let item of this.LstPermisssionRequests) {

      if (item.Status != 200) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning("Please select rejected records only");
        return false;
      }

      else {


        let employeeRejectObj = new EmployeeRequest();
        employeeRejectObj.Id = item.Id;
        employeeRejectObj.EmployeeId = item.EmployeeId;
        employeeRejectObj.Type = item.Type;
        employeeRejectObj.EmployeeAttendanceBreakUpDetailsId = item.EmployeeAttendanceBreakUpDetailsId;
        employeeRejectObj.Date = item.Date;
        employeeRejectObj.StartTime = moment(item.StartTime, ["h:mm A"]).format("HH:mm:ss");
        employeeRejectObj.EndTime = moment(item.EndTime, ["h:mm A"]).format("HH:mm:ss");
        employeeRejectObj.TotalTime = item.TotalTime;
        employeeRejectObj.ApprovedStartTime = item.ApprovedStartTime;
        employeeRejectObj.ApprovedEndTime = item.ApprovedEndTime;
        employeeRejectObj.IsPermissionAllowed = item.IsPermissionAllowed;
        employeeRejectObj.IncludeInCalculation = item.IncludeInCalculation;
        employeeRejectObj.RequestedClaimType = item.IsCompOffApplicable;
        employeeRejectObj.ApprovedClaimType = item.ApprovedClaimType;
        employeeRejectObj.IsCompOffApplicable = item.IsCompOffApplicable;
        employeeRejectObj.ModuleProcessTransactionId = item.ModuleProcessTransactionId;
        employeeRejectObj.EmployeeRemarks = item.EmployeeRemarks;
        employeeRejectObj.ApproverRemarks = item.ApproverRemarks ? item.ApproverRemarks : null;
        employeeRejectObj.Status = EmployeeRequestStatus.Submitted;
        employeeRejectObj.ModuleProcessStatus = item.ModuleProcessStatus ? item.ModuleProcessStatus : 0;
        employeeRejectObj.Message = item.Message ? item.Message : null;
        submitdata.push(employeeRejectObj);
      }

    }

    console.log('ss', submitdata);
    if (submitdata && submitdata.length > 0) {
      this.attendanceService.Post_Per_Aprove_Reject_Request(submitdata).subscribe((result) => {
        this.loadingScreenService.stopLoading();
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.alertService.showSuccess(apiresult.Message);
          this.LstPermisssionRequests = [];
          this.pendingTabRequests('R');
        }
        else {
          this.alertService.showWarning(apiresult.Message);
        }

      })

    }
    else {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning("Please select a record");
    }
  }


  selectAllPermissionRequests(event: any) {
    // this.LstExpenseBillRequests = [];
    this.pendingRequests.forEach(e => {
      event.target.checked == true ? e.isSelected = true : e.isSelected = false
    });
    if (event.target.checked) {
      this.pendingRequests.forEach(e => {
        this.LstPermisssionRequests.push(e);
      });
    } else {
      this.LstPermisssionRequests = [];
    }
  }

}
