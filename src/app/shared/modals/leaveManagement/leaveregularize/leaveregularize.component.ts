import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { forEach } from 'lodash';
import * as moment from 'moment';
import { formatDate } from '@angular/common';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
declare let $: any;
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import Swal from "sweetalert2";

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
import { SessionStorage } from '../../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../../_services/model/Common/LoginResponses';
import { Subject, Observable } from 'rxjs';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AttendancePeriod, PayrollInputsSubmission } from 'src/app/_services/model/Attendance/PayrollInputsSubmission';
import { AlertService, EmployeeService, FileUploadService, HeaderService, PagelayoutService, PayrollService } from 'src/app/_services/service';
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
import { DomSanitizer, Title } from '@angular/platform-browser';
import { EntitlementAvailmentRequestActivity } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequestActivity';
import { EntitlementAvailmentRequest, EntitlementRequestStatus, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, BsDropDownService, FieldType, Filters, OnEventArgs } from 'angular-slickgrid';
import * as JSZip from 'jszip'; //JSZip
import { takeUntil } from 'rxjs/operators';


@Component({
  selector: 'app-leaveregularize',
  templateUrl: './leaveregularize.component.html',
  styleUrls: ['./leaveregularize.component.css']
})

export class LeaveregularizeComponent implements OnInit {
  @Input() rowData: any;
  @Input() isReviseRequest : boolean = false;
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  spinner: boolean = false;
  _entitlementList: any[] = [];
  _limitedEntitlementList: any[] = [];
  _entitlementAvailmentRequestsApprovals: EntitlementAvailmentRequest[] = [];
  leaveForm: FormGroup;
  selectedEntitlement: EmployeeEntitlement = new EmployeeEntitlement();
  isOpened: boolean = false;
  _employeeName: any;
  remainingDays: any = 0;
  seemoreTxt: any = 'view other leave balances';
  showOtherEntitlment: boolean = false;
  _employeeId: any;
  isrendering_spinner: boolean = false;
  selectedLeaveType: any;
  isZeroEligibleDays: boolean = false;
  attendanceTypeList: any[] = [];
  DisplayName: any;
  isManagerIdBased: boolean = false;
  isLOP: boolean = false;
  CurrentDateTime: any = null;
  EvtReqId: any = 0;

  employeeEntitlement: EmployeeEntitlement = null;
  contentmodalurl: any;

  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  documentURL: any;
  RoleCode: string = "";
  isAllowedToViewDocument: boolean = true;
  requiredToEdit: boolean = false;

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
    private employeeService: EmployeeService,
    private headerService: HeaderService,
    private pageLayoutService: PagelayoutService,
    private bsDropdown: BsDropDownService,
    private sanitizer: DomSanitizer,
    private objectApi: FileUploadService,
  ) { }

  ngOnInit() {
    this.isrendering_spinner = true;
    this.rowData = JSON.parse(this.rowData);
    console.log('rowData', this.rowData);;
    this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss')
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.createForm();
    this.rowData.hasOwnProperty('EmployeeId') ? this.do_revise(this.rowData) :
      this.GetEntitlementAvailmentRequestById(this.rowData);
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
      CalculatedAppliedUnits: [0, Validators.required],
      EligibleUnits: [0],
      ApplierRemarks: [''],
      AppliedOn: [null],
      EmployeeEntitlement: [null],
      OptinalHoliday: [null],
      AdditionalDateInput: [null],
      AdditionalDocumentId: [0],
      AdditionalDocumentName: [""]
      // ValidatorRemarks: ['',, Validators.required]
    });
  }



  GetEntitlementAvailmentRequestById(rowData) {
    this.isrendering_spinner = true;
    this.attendanceService.GetEntitlementAvailmentRequestById(rowData.Id).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status && apiR.Result) {
        const entitlementAvailmentRequest: EntitlementAvailmentRequest = JSON.parse(apiR.Result);
        console.log('EAR >>>>>>>>', JSON.parse(apiR.Result));
        rowData.EmployeeName = rowData['Emp Name'];
        rowData.EmployeeId = entitlementAvailmentRequest.EmployeeId;
        rowData.Id = entitlementAvailmentRequest.Id;
        rowData.AppliedFrom = entitlementAvailmentRequest.AppliedFrom;
        rowData.AppliedTill = entitlementAvailmentRequest.AppliedTill;
        rowData.IsAppliedForFirstHalf = entitlementAvailmentRequest.IsAppliedForFirstHalf;
        rowData.IsAppliedFromSecondHalf = entitlementAvailmentRequest.IsAppliedFromSecondHalf;
        rowData.IsAppliedTillFirstHalf = entitlementAvailmentRequest.IsAppliedTillFirstHalf;
        rowData.IsAppliedTillSecondHalf = entitlementAvailmentRequest.IsAppliedTillSecondHalf;
        rowData.EntitlementType = entitlementAvailmentRequest.EntitlementType;
        rowData.EntitlementId = entitlementAvailmentRequest.EntitlementId;
        rowData.CalculatedAppliedUnits = entitlementAvailmentRequest.CalculatedAppliedUnits;
        rowData.ApplierRemarks = entitlementAvailmentRequest.ApplierRemarks;
        rowData.AppliedOn = entitlementAvailmentRequest.AppliedOn;
        rowData.EmployeeEntitlementId = entitlementAvailmentRequest.EmployeeEntitlementId;
        rowData.AdditionalDate = entitlementAvailmentRequest.AdditionalDate;
        rowData.DocumentId = entitlementAvailmentRequest.DocumentId;
        rowData.DocumentName = entitlementAvailmentRequest.DocumentName;
        this.do_revise(rowData);
      }
      else {

      }
    })
  }

  do_revise(rowData) {

    console.log('row', rowData);

    this._employeeName = rowData.EmployeeName;
    try {
      this.isrendering_spinner = true;
      this.get_EmployeeEntitlementList(rowData.EmployeeId).then((result) => {
        if (result) {

          this._limitedEntitlementList = this._entitlementList;
          this._limitedEntitlementList = this._limitedEntitlementList.filter(i => i.EntitlementId == rowData.EntitlementId);
          this.createForm();
          this.onChange_Entitlement(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId))

          const roles = this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).Definition.ProofDisplayRoleCodes;
          this.isAllowedToViewDocument = roles && roles.length > 0 ? roles.includes(this.RoleCode) : true;

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
            CalculatedAppliedUnits: rowData.CalculatedAppliedUnits,
            ApplierRemarks: rowData.ApplierRemarks,
            AppliedOn: rowData.AppliedOn,
            EligibleUnits: this._entitlementList.length > 0 ? this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).EligibleUnits : 0,
            EmployeeEntitlement: rowData.EmployeeEntitlementId,
            AdditionalDateInput: rowData.AdditionalDate,
            AdditionalDocumentId: rowData.DocumentId,
            AdditionalDocumentName: rowData.DocumentName,

            // ValidatorRemarks: rowData.ValidatorRemarks
          });
          this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == rowData.EntitlementId).AvailableUnits) - Number(rowData.CalculatedAppliedUnits);
          this.isOpened = true;
          this.isrendering_spinner = false;
        } else {
          this.isrendering_spinner = false;
          this.alertService.showWarning('No records found!');
        }
      })
    } catch (error) {
      this.isrendering_spinner = false;
      this.alertService.showWarning('No records found!');
    }
  }


  onChange_Entitlement(event) {
    console.log('event', event);
    this.employeeEntitlement = event;
    this.isLOP = false;
    if (event != undefined && event.DisplayName != 'LOP' && event.AvailableUnits <= 0) {
      // ! fix for bug #5447
      if (event.Definition && !event.Definition.IsNegativeBalanceAllowed) {
        this.isZeroEligibleDays = true;
        this.alertService.showInfo('Not enough leave Balance : The Leave type does not have enough balance to take. Please try any other leave type.');
        return;
      }
    } else {
      this.DisplayName = event.DisplayName;
      this.isZeroEligibleDays = false;
      this.selectedLeaveType = event.EntitlementId;

      this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits);
      this.leaveForm.controls['Entitlement'].setValue(event.EntitlementId);
      this.leaveForm.controls['EmployeeEntitlement'].setValue(event.Id);

      this.remainingDays = Number(this._entitlementList.find(a => a.EntitlementId == event.EntitlementId).AvailableUnits) - Number(this.leaveForm.get('CalculatedAppliedUnits').value);
      this.isLOP = event.DisplayName == 'LOP' ? true : false;

    }
    event != undefined ? this.selectedEntitlement = event : this.selectedEntitlement = null;
    // event != undefined ? this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits) : this.leaveForm.controls['EligibleUnits'].setValue(0);
    // event != undefined ? this.selectedLeaveType = event : this.selectedLeaveType = null
  }


  // onChange_Entitlement(event) {
  //   console.log('event', event);
  //   event != undefined ? this.leaveForm.controls['EligibleUnits'].setValue(event.EligibleUnits) : this.leaveForm.controls['EligibleUnits'].setValue(0);
  //   event != undefined ? this.selectedEntitlement = event : this.selectedEntitlement = null
  // }



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

  closeModal() {
    this.isOpened = false;
    this.activeModal.close('Modal Closed');
  }

  do_approve_reject(whichaction) {
    this.common_approve_reject('edit', whichaction, '');
  }

  getLeaveType(entitlmentleavetypeId) {
    return this._entitlementList.find(a => a.EntitlementId == entitlmentleavetypeId).DisplayName;
  }

  get_EmployeeEntitlementList(_employeeId) {
    const promise = new Promise((res, rej) => {
      this._entitlementList = [];
      this.attendanceService.GetEmployeeEntitlementList(_employeeId, EntitlementType.Leave).subscribe((result) => {
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
        console.warn('ERR ::', err);
      });
      // }
      // })
    });
    return promise;



  }

  viewEntitlement() {
    this.loadingScreenService.startLoading();
    this.get_EmployeeEntitlementList(2323).then((result) => {
      console.log('ENTIT :', this._entitlementList);
      this.loadingScreenService.stopLoading();
      $('#popup_viewEntitlement').modal('show');
    })
  }
  close_entitlementbalance() {
    $('#popup_viewEntitlement').modal('hide');

  }

  common_approve_reject(_index, whichaction, item) {

    // this.EvtReqId = this.rowData.Id;
    // this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    // this.loadingScreenService.startLoading();
    // if (this.EvtReqId != null && this.EvtReqId != 0) {
    //   this.ValidateLeaveRequestIsValidToUpdate().then((validatedResponse) => {
    //     this.loadingScreenService.stopLoading();
    //     if (validatedResponse) {
    //       this.tiggerApiCall_LeaveRequest(_index, whichaction, item);
    //     }
    //   }) 
    // } else {
    this.tiggerApiCall_LeaveRequest(_index, whichaction, item);
    // }

  }

  tiggerApiCall_LeaveRequest(_index, whichaction, item) {

    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
      $('#popup_edit_attendance').modal('hide');
      if (!whichaction) {
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
            // _index == 'edit' ?
            this.validateEAR(jsonStr, whichaction);

          } else if (

            inputValue.dismiss === Swal.DismissReason.cancel
          ) {

          }
        })

      }
      else {
        this.validateEAR('', whichaction);
      }

    }).catch(error => {

    });

  }


  validateEAR(jstring, whichaction) {


    this.loadingScreenService.startLoading();
    let currentDate = new Date();
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = this.rowData.CalculatedAppliedUnits;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(this.rowData.AppliedOn).format('YYYY-MM-DD');;
    entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD');
    entitlementAvailmentRequest.ValidatedBy = this.UserId;
    entitlementAvailmentRequest.ApplierRemarks = this.rowData.ApplierRemarks;
    entitlementAvailmentRequest.CancellationRemarks = '';
    entitlementAvailmentRequest.ValidatorRemarks = jstring;
    entitlementAvailmentRequest.Status = whichaction == false ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved;
    entitlementAvailmentRequest.AppliedBy = this.rowData.AppliedBy;
    entitlementAvailmentRequest.CalculatedAppliedUnits = this.rowData.CalculatedAppliedUnits;
    entitlementAvailmentRequest.AppliedUnits = this.rowData.AppliedUnits;
    entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
    entitlementAvailmentRequest.Id = this.rowData.Id;
    entitlementAvailmentRequest.EmployeeId = this.selectedEntitlement.EmployeeId;
    entitlementAvailmentRequest.EmployeeEntitlementId = this.leaveForm.get('EmployeeEntitlement').value;;
    entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
    entitlementAvailmentRequest.EntitlementId = this.rowData.EntitlementId;
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
    entitlementAvailmentRequest.ValidatedUserName = this.UserName;

    console.log('ENTILMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);

    this.attendanceService.ValidateEntitlementAvailmentRequest(entitlementAvailmentRequest).
      subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
        } else {
          this.alertService.showWarning(apiResult.Message);
        }

        this.loadingScreenService.stopLoading();
        // this.closeModal();
        this.isOpened = false;
        this.activeModal.close('Success');



      }, err => {
        this.loadingScreenService.stopLoading();

      })
  }

  ValidateLeaveRequestIsValidToUpdate() {
    const promse = new Promise((res, rej) => {
      // this.CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss');
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


  isZipFile() {
    const documentName = this.leaveForm.get('AdditionalDocumentName').value;
    const ext = documentName.split('.').pop().toUpperCase();
    return ext === "ZIP";
  }

  downloadAttachments() {
    const documentName = this.leaveForm.get('AdditionalDocumentName').value;
    const documentId = this.leaveForm.get('AdditionalDocumentId').value;

    this.loadingScreenService.startLoading();

    this.objectApi.downloadObjectAsBlob(documentId)
      .pipe(takeUntil(this.destroy$))
      .subscribe(
        (res) => {
          if (!res) {
            this.handleDownloadError();
            return;
          }

          console.log('res', res);
          saveAs(res);
        },
        (error) => {
          this.handleDownloadError();
        },
        () => {
          this.loadingScreenService.stopLoading();
        }
      );
  }

  private handleDownloadError() {
    this.loadingScreenService.stopLoading();
    this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
  }

  private destroy$ = new Subject<void>();

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }


  viewAttachments() {

    var fileNameSplitsArray = this.leaveForm.get('AdditionalDocumentName').value.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    console.log('fileNameSplitsArray', fileNameSplitsArray);
    console.log('ext', ext);

    if (ext.toUpperCase().toString() == "ZIP") {
      this.getFileList();
      return;
    } else {

      this.loadingScreenService.startLoading();
      const documentName = this.leaveForm.get('AdditionalDocumentName').value;
      const documentId = this.leaveForm.get('AdditionalDocumentId').value;
      var contentType = this.objectApi.getContentType(documentName);
      if (contentType === 'application/pdf' || contentType.includes('image')) {

        return this.objectApi.getObjectById(documentId).subscribe(
          (dataRes: apiResult) => {
            this.loadingScreenService.stopLoading();
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              const Message = dataRes.Message ? dataRes.Message : 'Couldn\'t fetch data !'
              return this.alertService.showWarning(Message);
            }
            let file = null;
            var objDtls = dataRes.Result as any;
            const byteArray = atob(objDtls.Content);
            const blob = new Blob([byteArray], { type: contentType });
            file = new File([blob], objDtls.ObjectName, {
              type: contentType,
              lastModified: Date.now()
            });
            if (file !== null) {

              var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);

              if (contentType.includes('image')) {
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              } else {
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              }

              var modalDiv = $('#documentviewer2');
              modalDiv.modal({ backdrop: false, show: true });

            }
          },
          (err) => {
            this.loadingScreenService.stopLoading();

          }
        );


      }
      else if (contentType === 'application/msword' ||
        contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        var appUrl = this.objectApi.getUrlToGetObject(documentId);
        var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
        this.loadingScreenService.stopLoading();
        var modalDiv = $('#documentviewer2');
        modalDiv.modal({ backdrop: false, show: true });

      }

    }

  }


  close_documentviewer2() {
    this.contentmodalurl = null;
    $("#documentviewer2").modal('hide');

  }



  getFileList() {
    console.log('coming');


    this.loadingScreenService.startLoading();

    let DocId = this.leaveForm.get('AdditionalDocumentId').value;
    this.docList = [];
    try {


      this.objectApi.getObjectById(DocId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.loadingScreenService.stopLoading();
            const Message = dataRes.Message ? dataRes.Message : 'Couldn\'t fetch data !'
            return this.alertService.showWarning(Message);
          }
          this.docList = [];
          var objDtls = dataRes.Result;
          console.log(objDtls);
          var zip = new JSZip();
          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);

          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);
                  this.loadingScreenService.stopLoading();
                  var modalDiv = $('#documentviewer');
                  modalDiv.modal({ backdrop: false, show: true });


                  $('#carouselExampleCaptions').carousel()

                });
              }
            });
          });


        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }

  close_documentviewer3() {

    $("#documentviewer").modal('hide');

  }


  getTargetOffSetImage(item: any) {

    const promise = new Promise((res, rej) => {
      var contentType = this.objectApi.getContentType(item.name);
      var blob = new Blob([item._data.compressedContent]);
      var file = new File([blob], item.name, {
        type: typeof item,
        lastModified: Date.now()
      });
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64String = (reader.result as string).split(",")[1];
        if (file !== null) {
          var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(' DOCUMENT URL :', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl })
        }
      }
    })


    return promise;
  }

  editTillDate() {
    this.requiredToEdit = true;
  }

}
