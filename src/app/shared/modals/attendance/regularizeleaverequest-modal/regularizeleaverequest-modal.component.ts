
import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { Observable, timer } from 'rxjs';
import { map, share } from 'rxjs/operators';
import { AlertService } from '../../../../_services/service/alert.service';
import { SessionStorage } from '../../../../_services/service/session-storage.service';
import { enumHelper } from '../../../../shared/directives/_enumhelper';
import * as _ from 'lodash';
import { apiResult } from 'src/app/_services/model/apiResult';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { CommonService } from 'src/app/_services/service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import Swal from "sweetalert2";
import { EntitlementAvailmentRequestAsPresentViewModel } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import * as moment from 'moment';

@Component({
  selector: 'app-regularizeleaverequest-modal',
  templateUrl: './regularizeleaverequest-modal.component.html',
  styleUrls: ['./regularizeleaverequest-modal.component.css']
})
export class RegularizeleaverequestModalComponent implements OnInit {

  @Input() JObject: any;
  @Input() EmployeeObject: any;

  appliedFrom: any;
  appliedTill: any;
  isHalfDay: boolean = false;
  isFirstHalf: boolean = false;
  isSecondHalf: boolean = false;
  employeeEntitlementId: any;
  isFullDay: boolean = false;
  comments: any;

  isrendering_spinner: boolean = false;
  _entitlementList: any[] = [];
  isNewLeaveType: boolean = false;
  selectedLeaveType: any;
  newLeaveType: any;
  IsShowBalanceInUI: boolean = false;
  IsLossOfPay: boolean = false;
  availableDays: any;
  IsNegativeUnitAllowed: boolean = false;
  MaxAllowedNegativeBalance: any;
  isHalfDayRepresentation: boolean = false;
  NoOfDays: any;
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private attendanceService: AttendanceService,
    private utilsHelper: enumHelper,
    private loadingScreenService: LoadingScreenService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private sessionService: SessionStorage

  ) { }

  ngOnInit() {
    this.JObject = JSON.parse(this.JObject);
    console.log('JObject', this.JObject);
    console.log('EmployeeObject', this.EmployeeObject);
    this.appliedFrom = new Date(this.JObject.StartDate);
    this.appliedTill = new Date(this.JObject.EndDate);
    this.selectedLeaveType = this.JObject.EmployeeEntitlementId;
    this.newLeaveType = null; 

    if (this.JObject.attendanceObject != null && (this.JObject.attendanceObject.AttendanceBreakUpDetailsType == 200 || this.JObject.attendanceObject.AttendanceBreakUpDetailsType == 300)) {
      this.isHalfDayRepresentation = true;
      this.isFullDay = false;
      this.NoOfDays = 0.5
    }
    if (this.JObject.attendanceObject != null && (this.JObject.attendanceObject.AttendanceBreakUpDetailsType == 400)) {
      this.isHalfDayRepresentation = false;
      this.isFullDay = true;
      this.NoOfDays = 1;
    }
    if (this.JObject.leaveObject != null && (this.JObject.leaveObject.IsAppliedForFirstHalf || this.JObject.leaveObject.IsAppliedTillFirstHalf)) {
      this.isFirstHalf = true;
      // this.isFullDay = false;
    }

    else if (this.JObject.leaveObject != null && (this.JObject.leaveObject.IsApprovedFromSecondHalf || this.JObject.leaveObject.IsAppliedTillSecondHalf)) {
      this.isSecondHalf = true;
      // this.isFullDay = false;
    }

    this.get_EmployeeEntitlementList(this.EmployeeObject.Id).then((result) => {
      if (result == true) {
      } else {
        this.isrendering_spinner = false;
        this.alertService.showWarning('Employee entitilement not found');
        return;
      }
    });
  }

  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, 1).subscribe((result) => {
        console.log('RES ENTITLEMENTLIST::', result);
        let apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result != null) {
          this._entitlementList = apiResult.Result as any;
          this._entitlementList = this._entitlementList != null && this._entitlementList.length > 0 &&
            this.JObject.isEmployee == true &&  this.JObject.meta.IsMultipleEntitlement ? this._entitlementList.filter(a => a.IsLossOfPay == false ) :
            this.JObject.isEmployee == true &&  !this.JObject.meta.IsMultipleEntitlement ? 
            this._entitlementList.filter(a => a.IsLossOfPay == false && a.DisplayName.toUpperCase() != this.JObject.meta.LeaveattendanceType.toUpperCase()) :
            !this.JObject.meta.IsMultipleEntitlement ?
            this._entitlementList.filter(a => a.DisplayName.toUpperCase() != this.JObject.meta.LeaveattendanceType.toUpperCase()) : this._entitlementList.filter(a => a.DisplayName.toUpperCase() != this.JObject.meta.LeaveattendanceType.toUpperCase());
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

  onChangeLeaveTypeCheck(event) {
    if (event.target.checked == false) {
      this.selectedLeaveType = this.JObject.EmployeeEntitlementId;
    }
  }

  onChange_Entitlement(event) {
    console.log('event', event);
    this.IsShowBalanceInUI = event.ShowBalanceInUI;
    this.IsLossOfPay = event.IsLossOfPay;
    this.selectedLeaveType = event.Id;
    this.newLeaveType = event.Id;
    this.availableDays = 0;

    if (event != undefined) {
      if (!this.IsLossOfPay && event.Definition.IsNegativeBalanceAllowed == false && event.EligibleUnits <= 0) {
        this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try again.');
        return;
      }
      else if (!this.IsLossOfPay && event.Definition.IsNegativeBalanceAllowed == true && event.Definition.MaxNegativeBalanceAllowed == 0 && event.EligibleUnits <= 0) {
        this.alertService.showWarning('Not enough leave Balance : The Leave type does not have enough balance to take. Please try again.');
        return;
      }

      else {

        if (event.Definition.IsNegativeBalanceAllowed == true) {
          this.IsNegativeUnitAllowed = true;
          this.MaxAllowedNegativeBalance = event.Definition.MaxNegativeBalanceAllowed;
        }


        this.availableDays = event.EligibleUnits;

      }

    }



  }



  onChange_halfDay(event) {
    console.log(event.target.checked);
  }

  confirmChanges() {

    console.log('this.selectedLeaveType', this.selectedLeaveType);

    if (this.isHalfDay == true && this.isFirstHalf == false && this.isSecondHalf == false) {
      this.alertService.showWarning("Please specify your half day type");
      return;

    }
    if (this.isNewLeaveType == true && (this.newLeaveType == null || this.newLeaveType == '' || this.newLeaveType == undefined)) {
      this.alertService.showWarning("Please select new leave type");
      return;
    }
    if (!this.IsLossOfPay && this.availableDays < this.NoOfDays) {
      this.alertService.showWarning("Maximum allowed leave balance is currently insufficient");
      return;
    }


    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirmation',
      text:  `Present from ${moment(new Date(this.appliedFrom)).format('DD-MM-YYYY')} to ${moment(this.appliedTill).format('DD-MM-YYYY')}. Are you sure you want to Submit?`,
      
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {
        this.loadingScreenService.startLoading();
        this.triggerConfirmChanges()

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    }) 
  }

  triggerConfirmChanges() {
    var regularizeEntitlementDetails = new EntitlementAvailmentRequestAsPresentViewModel();
    regularizeEntitlementDetails.LeaveRequestId = this.JObject.LeaveRequestId;
    regularizeEntitlementDetails.EmployeeEntitlementId = this.selectedLeaveType;
    regularizeEntitlementDetails.IsFullDay = this.isFullDay;
    regularizeEntitlementDetails.FromDate = this.JObject.StartDate;
    regularizeEntitlementDetails.ToDate = this.JObject.StartDate;
    regularizeEntitlementDetails.RegularizedUnits = this.NoOfDays;
    regularizeEntitlementDetails.IsFirstHalf = this.isFirstHalf;
    regularizeEntitlementDetails.IsSecondHalf = this.isSecondHalf 
    regularizeEntitlementDetails.RegularizedBy = this.JObject.UserId;
    regularizeEntitlementDetails.EmployeeId = this.EmployeeObject.Id;
    console.log('regularizeEntitlementDetails', regularizeEntitlementDetails);
   
    this.attendanceService.UpdateEntitlementAvailmentRequestAsPresent(regularizeEntitlementDetails)
      .subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          this.close();
          this.alertService.showSuccess('record successfully updated');
          this.loadingScreenService.stopLoading();
        }
        else {
          this.close();
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiresult.Message);
        }

      })

  }
  close() {

    this.activeModal.close('Modal Closed');

  }
}
