import { T } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import moment from 'moment';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { apiResult } from 'src/app/_services/model/apiResult';
import { EntitlementRequestStatus, EntitlementType, EntitlementUnitType } from 'src/app/_services/model/Attendance/AttendanceEnum';
import { EntitlementAvailmentRequest } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { AlertService, EmployeeService, EncrDecrService, FileUploadService, SessionStorage } from 'src/app/_services/service';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { DynamicuiService } from '../services/dynamicui.service';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import * as JSZip from 'jszip'; //JSZip
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';


export interface VerificatinLogs {
  LogKey: string,
  TenantId: string,
  VisitorRandId: number,
  Xos: string,
  Uid: string,
  Zck: string,
  AuthCode: string,
  channel: string,
  EventCode: string,
  Format: string,
  Token: string,
  Session: string
}

@Component({
  selector: 'app-dynamicui',
  templateUrl: './dynamicui.component.html',
  styleUrls: ['./dynamicui.component.scss']
})


export class DynamicuiComponent implements OnInit {

  isAuthorized: boolean = true;
  SpinnerShouldhide: boolean = false;
  isVerified: boolean = false;

  OTP: any;
  shouldHide: boolean = false;
  encodedRequest: string;
  encodedId: number;
  encodedRequestType: string;

  verificationLog: VerificatinLogs;
  verifiedRequestLog: any;
  masterData: any;

  // Resignation 
  ResignationRelievingDate: any;
  ResignationComments: string;

  // Attendance Regularization
  RegularizationComments: string;
  shouldHide_Approve: boolean = false;
  shouldHide_Reject: boolean = false;

  // Leave
  leaveRejectionComments: string = "";
  isAlreadyVerified: boolean = false;
  contentmodalurl: any;

  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  documentURL: any;

  RoleCode: string = "";
  isAllowedToViewDocument: boolean = true;

  resignationminDate = new Date();
  resignationminRemarksLength: number = 10;
  resignationmaxDate = new Date();
  dateError: string | null = null;

  errormessaga : string = "";

  constructor(
    private route: ActivatedRoute,
    private dynamicuiService: DynamicuiService,
    private router: Router,
    private alertService: AlertService,
    private encdecService: EncrDecrService,
    private session: SessionStorage,
    private employeeService: EmployeeService,
    private attendanceService: AttendanceService,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
    private loadingScreenService: LoadingScreenService,


  ) { }


  ngAfterViewInit() {

    (<HTMLInputElement>document.getElementById('overlay')).style.display = "flex";


  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {

      if (JSON.stringify(params) != JSON.stringify({})) {

        this.encodedRequest = (params["request"]);
        this.encodedId = (params["id"]);
        this.encodedRequestType = (params["requestType"]);

        // if(this.encodedRequestType != 'Resignation' && this.encodedRequestType != 'Regularization'){
        //   this.router.navigate(['/unauthorized']);
        // }
        this.SendVerificationOTP();

      }
    });
  }


  SendVerificationOTP(): Promise<any> {
    return new Promise((resolve, reject) => {

      let payload =
      {
        "Id": this.encodedId,
        "Request": this.encodedRequest
      }

      this.dynamicuiService.SendVerificationOTP(JSON.stringify(payload)).subscribe((res) => {
        let apiResult: apiResult = res;
        console.log('RRRR :::::', res);

        if (apiResult.Status && apiResult.Result != "") {
          this.encodedRequest = apiResult.Result;

          this.alertService.showSuccess(apiResult.Message);


          (<HTMLInputElement>document.getElementById('overlay')).style.display = "none";


          resolve(apiResult.Status);
        }
        else {
          // 
        }
      }), ((error) => {
      });
    })

  }

  get sessionDetails() {
    return JSON.parse(this.session.getSessionStorage(SessionKeys.LoginResponses));
  }


  VerifyOTP() {
    console.log('ss');

    // return new Promise((resolve, reject) => {

    if (this.OTP == null || this.OTP == undefined || this.OTP == "") {
      this.alertService.showInfo("Please enter OTP to Unlock it");
      return;
    }

    this.SpinnerShouldhide = true;
    let payload =
    {
      "Id": this.encodedId,
      "Request": this.encodedRequest,
      "OTP": this.OTP
    }

    this.dynamicuiService.VerifyRequestOTP(JSON.stringify(payload)).subscribe((res) => {
      let apiResult: apiResult = res;
      console.log('RRRR ^^^^^^^^^^^^^^^ :::::', res);

      if (apiResult.Status && apiResult.Result != "") {

        try {
          this.verificationLog = JSON.parse(apiResult.Result);
          console.log('RRRR ^^^^^^^^^^^^^^^ :::::', this.verificationLog);
          this.dynamicuiService.EncryptDecryptHelper(this.verificationLog);
          this.verifiedRequestLog = this.encdecService.DecryptWithAES(this.sessionDetails, this.encodedRequest);
          console.log('verificationRequestLog', this.verifiedRequestLog);
          this.RoleCode = this.verifiedRequestLog.RoleCode;;
          if (this.encodedRequestType == 'Resignation') {
            this.GetMasterInfoForResignation()
          } else if (this.encodedRequestType == 'Regularization') {
            this.GetAttendanceRegularizationRequestDetails();
          } else if (this.encodedRequestType == 'Regularization_Detail') {
            this.GetAttendanceRegularizationRequestDetailsForDetailType();
          }
          else if (this.encodedRequestType == 'Leave' || this.encodedRequestType == 'OnDuty') {
            this.GetEntitlementAvailmentRequestById();
          }
        } catch (error) {
          this.SpinnerShouldhide = false;
        }

        const overlayElement = document.getElementById('overlay');
        if (overlayElement) {
          (<HTMLInputElement>overlayElement).style.display = "none";
        }
      }
      else {
        this.SpinnerShouldhide = false;
        alert(apiResult.Message);
        this.alertService.showInfo(apiResult.Message);
        // this.router.navigate(['/unauthorized']);
      }
    }), ((error) => {
    });
    // })

  }

  getResignationReasonName(Id) {

    return this.masterData != null ? this.masterData.ResignationReasons.find(a => a.Id == Id).Name : '';
  }

  GetMasterInfoForResignation(): void {

    this.employeeService.GetMasterInfoForResignation(this.verifiedRequestLog.EmployeeId).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status && apiR.Result) {
        this.isVerified = true;
        this.SpinnerShouldhide = false;
        this.masterData = JSON.parse(apiR.Result);
        this.masterData != null && this.masterData.length > 0 && this.masterData.forEach(element => {
          element.AttendanceDate = moment(element.AttendanceDate).format('DD-MM-YYYY')
        });
      } else {
        this.SpinnerShouldhide = false;
      }

    })
  }

  ValidateResignation(ActionName) {

    console.log(this.ResignationRelievingDate);
    this.errormessaga = '';
    if (ActionName == 'APPROVE' && (this.ResignationRelievingDate == null || this.ResignationRelievingDate == '' || this.ResignationRelievingDate == undefined)) {
      this.errormessaga = 'Please select an approving relieving date';
      this.alertService.showInfo("Action blocked : Please select an approving relieving date");
      return;

    }
    if (ActionName == 'REJECT' && (this.ResignationComments == null || this.ResignationComments == '' || this.ResignationComments == undefined)) {
      this.errormessaga = 'Please enter the rejection remarks';
      this.alertService.showInfo("Action blocked : Please enter the rejection remarks ");
      return;
    }

    if (ActionName == 'REJECT' && (this.ResignationComments.length < this.resignationminRemarksLength)) {
      this.errormessaga = 'Please enter the rejection remarks (minimum 10 characters)';
      return;
    }

    
    if (ActionName == 'REJECT') {
      this.shouldHide_Approve = false;
      this.shouldHide_Reject = true;
    } else {
      this.shouldHide_Approve = true;
      this.shouldHide_Reject = false;
    }

     this.shouldHide = true;
    var payload_resignation = {
      "Comments": this.ResignationComments,
      "RelievingDate": moment(this.ResignationRelievingDate).format('DD MMM YYYY'),
      "ResigId": this.masterData.ResignationId, // this is the RequestIds field
      "Button": ActionName // "APPROVE" OR "REJECT"
    };
    console.log("PAYLOAD :::::::::::::: ", payload_resignation);

    this.employeeService.ValidateResignation(JSON.stringify(payload_resignation)).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status) {
        this.alertService.showSuccess(apiR.Message)
        this.shouldHide = false;
        this.shouldHide_Approve == true ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;
        this.router.navigate(['/successscreen'], {
          queryParams: {
            "Sdx": btoa(ActionName),
          }
        });
      } else {

        this.alertService.showWarning(apiR.Message);
        this.shouldHide_Approve == true ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;
        this.shouldHide = false;
      }

    })

  }

  GetAttendanceRegularizationRequestDetails() {

    var jString = this.verifiedRequestLog.RequestIds;
    var arrayString = jString.split(',');
    const finalpayload = arrayString.map(Number);

    this.attendanceService.GetAttendanceRegularizationRequestDetails(JSON.stringify(finalpayload)).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status && apiR.Result) {
        this.isVerified = true;
        this.SpinnerShouldhide = false;
        this.masterData = JSON.parse(apiR.Result);
      } else {
        this.SpinnerShouldhide = false;
      }

    })
  }

  ValidateRegularization(ActionName) {


    if (ActionName == 'REJECT' && (this.RegularizationComments == null || this.RegularizationComments == '' || this.RegularizationComments == undefined)) {
      this.alertService.showInfo("Action blocked : Please enter the rejection remarks ");
      return;

    }
    this.shouldHide = true;
    if (ActionName == 'REJECT') {
      this.shouldHide_Approve = false;
      this.shouldHide_Reject = true;
    } else {
      this.shouldHide_Approve = true;
      this.shouldHide_Reject = false;
    }
    var payload_regularization = {
      "Comments": this.RegularizationComments,
      "RegId": this.verifiedRequestLog.RequestIds,
      "Button": ActionName, // "APPROVE" OR "REJECT"
      "ManagerId": this.verifiedRequestLog.UserId, // this is the RequestIds field
    };

    console.log("PAYLOAD :::::", payload_regularization);

    this.attendanceService.ValidateRegularization(JSON.stringify(payload_regularization)).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status) {
        this.alertService.showSuccess(apiR.Message)
        this.shouldHide = false;
        this.shouldHide_Approve == true ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;

        this.router.navigate(['/successscreen'], {
          queryParams: {
            "Sdx": btoa(ActionName),
          }
        });
      } else {

        this.alertService.showWarning(apiR.Result)
        this.shouldHide = false;
        this.shouldHide_Approve == true ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;
      }

    })

  }

  calculateNoticePeriodDay(masterdate) {
    return moment(masterdate.ResignationDate, "DD-MM-YYYY").add(masterdate.NoticePeriodDays, 'days').format('DD-MM-YYYY');
  }

  isRemarksValid(): boolean {
    console.log('sfds',(this.shouldHide || this.ResignationComments.length >= this.resignationminRemarksLength));    
    return (this.shouldHide || this.ResignationComments.length > this.resignationminRemarksLength);
  }

  validateDate(): void {
    const date = moment(this.ResignationRelievingDate, 'YYYY-MM-DD', true);
    const min = moment(this.masterData.ResignationDate, 'YYYY-MM-DD', true);
    const max = moment(this.calculateNoticePeriodDay(this.masterData), 'YYYY-MM-DD', true);
    const formatDate = moment(date).format('DD-MM-YYYY');

    let date1 = new Date(this.masterData.ResignationDate);
    let date2 = new Date(this.calculateNoticePeriodDay(this.masterData));

    let dateString = this.masterData.ResignationDate;
    var formattedDate = moment(dateString, 'DD-MM-YYYY')

    let dateString1 =this.calculateNoticePeriodDay(this.masterData);
    var formattedDate1 = moment(dateString1, 'DD-MM-YYYY')

    if (!date.isValid()) {
      this.dateError = 'Invalid date format. Please enter a valid date (YYYY-MM-DD).';
      this.ResignationRelievingDate = null; // Clear the input value
    } else if (date.isBefore(formattedDate)) {
      this.dateError = `Date cannot be earlier than ${this.masterData.ResignationDate}.`;
      this.ResignationRelievingDate = null; // Clear the input value
    } else if (date.isAfter(formattedDate1)) {
      this.dateError = `Date cannot be later than ${this.calculateNoticePeriodDay(this.masterData)}.`;
      this.ResignationRelievingDate = null; // Clear the input value
    } else {
      this.dateError = null;
    }
  }

  GetEntitlementAvailmentRequestById() {
    this.isAlreadyVerified = false;
    var jString = this.verifiedRequestLog.RequestIds;
    this.attendanceService.GetEntitlementAvailmentRequestById(jString).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status && apiR.Result) {
        this.isVerified = true;
        this.SpinnerShouldhide = false;
        this.masterData = JSON.parse(apiR.Result);
        console.log('EAR >>>>>>>>', this.masterData);
        const roles = this.masterData.hasOwnProperty('ProofDisplayRoleCodes') && this.masterData.ProofDisplayRoleCodes != null && this.masterData.ProofDisplayRoleCodes.length > 0 ? this.masterData.ProofDisplayRoleCodes : [];
        this.isAllowedToViewDocument = roles && roles.length > 0 ? roles.includes(this.RoleCode) : true;


        if (this.masterData.Status == 400 || this.masterData.Status == 300 || this.masterData.Status == 200) {
          this.isAlreadyVerified = true;
        }

      }
      else {
        this.SpinnerShouldhide = false;
      }
    })
  }

  validateEAR(ActionName) {

    if (ActionName == 'REJECT' && (this.leaveRejectionComments == null || this.leaveRejectionComments == '' || this.leaveRejectionComments == undefined)) {
      this.alertService.showInfo("Action blocked : Please enter the rejection remarks ");
      return;

    }
    if (ActionName == 'REJECT') {
      this.shouldHide_Approve = false;
      this.shouldHide_Reject = true;
    } else {
      this.shouldHide_Approve = true;
      this.shouldHide_Reject = false;
    }

    this.shouldHide = true;
    var isCancellationReqest: boolean = false;
    if (this.masterData.Status == EntitlementRequestStatus.CancelApplied) {
      isCancellationReqest = true;
    }
    let CurrentDateTime = moment.utc().format('YYYY-MM-DD HH:mm:ss')
    let currentDate = new Date();
    var entitlementAvailmentRequest = new EntitlementAvailmentRequest();
    entitlementAvailmentRequest.IsApprovedFromSecondHalf = false;
    entitlementAvailmentRequest.IsApprovedForFirstHalf = false;
    entitlementAvailmentRequest.ApprovedTill = null;
    entitlementAvailmentRequest.IsApprovedTillFirstHalf = false;
    entitlementAvailmentRequest.IsApprovedTillSecondHalf = false;
    entitlementAvailmentRequest.ApprovedUnits = this.masterData.CalculatedAppliedUnits;
    entitlementAvailmentRequest.ApprovedFrom = null;
    entitlementAvailmentRequest.AppliedOn = moment(this.masterData.AppliedOn).format('YYYY-MM-DD');;
    entitlementAvailmentRequest.ValidatedOn = moment(currentDate).format('YYYY-MM-DD');
    entitlementAvailmentRequest.ValidatedBy = this.verifiedRequestLog.UserId;
    entitlementAvailmentRequest.ApplierRemarks = this.masterData.ApplierRemarks;

    entitlementAvailmentRequest.CancellationRemarks = isCancellationReqest ? this.leaveRejectionComments : '';
    entitlementAvailmentRequest.ValidatorRemarks = isCancellationReqest ? '' : this.leaveRejectionComments;
    entitlementAvailmentRequest.Status = isCancellationReqest ? EntitlementRequestStatus.CancelApplied : (ActionName == 'REJECT' ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved);

    entitlementAvailmentRequest.AppliedBy = this.masterData.AppliedBy;
    entitlementAvailmentRequest.CalculatedAppliedUnits = this.masterData.CalculatedAppliedUnits;
    entitlementAvailmentRequest.AppliedUnits = this.masterData.AppliedUnits;
    entitlementAvailmentRequest.IsAppliedTillSecondHalf = false;
    entitlementAvailmentRequest.Id = this.masterData.Id;
    entitlementAvailmentRequest.EmployeeId = this.masterData.EmployeeId;
    entitlementAvailmentRequest.EmployeeEntitlementId = this.masterData.EmployeeEntitlementId;
    entitlementAvailmentRequest.EntitlementType = EntitlementType.Leave;
    entitlementAvailmentRequest.EntitlementId = this.masterData.EntitlementId;
    entitlementAvailmentRequest.EntitlementDefinitionId = this.masterData.EntitlementDefinitionId;
    entitlementAvailmentRequest.EntitlementMappingId = this.masterData.EntitlementMappingId;
    entitlementAvailmentRequest.UtilizationUnitType = EntitlementUnitType.Day;
    entitlementAvailmentRequest.ApplicablePayPeriodId = this.masterData.ApplicablePayPeriodId;
    entitlementAvailmentRequest.ApplicableAttendancePeriodId = this.masterData.ApplicableAttendancePeriodId;
    entitlementAvailmentRequest.AppliedFrom = moment(new Date(this.masterData.AppliedFrom)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedFromSecondHalf = this.masterData.IsAppliedFromSecondHalf;
    entitlementAvailmentRequest.IsAppliedForFirstHalf = this.masterData.IsAppliedForFirstHalf;
    entitlementAvailmentRequest.AppliedTill = moment(new Date(this.masterData.AppliedTill)).format('YYYY-MM-DD');
    entitlementAvailmentRequest.IsAppliedTillFirstHalf = this.masterData.IsAppliedTillFirstHalf;
    entitlementAvailmentRequest.ActivityList = [];
    entitlementAvailmentRequest.PendingAtUserId = this.masterData.PendingAtUserId;
    entitlementAvailmentRequest.PendingAtRoleId = this.masterData.PendingAtRoleId;
    entitlementAvailmentRequest.ApprovalLevel = this.masterData.ApprovalLevel;
    entitlementAvailmentRequest.PendingAtUserName = this.masterData.PendingAtUserName;
    entitlementAvailmentRequest.LastUpdatedOn = this.masterData.LastUpdatedOn; // CurrentDateTime;
    entitlementAvailmentRequest.ValidatedUserName = this.verifiedRequestLog.UserName;
    entitlementAvailmentRequest.ApprovalStatus = (ActionName == 'REJECT' ? EntitlementRequestStatus.Rejected : EntitlementRequestStatus.Approved)

    console.log('ENTILMENT REQUEST APPROVAL :: ', entitlementAvailmentRequest);

    this.attendanceService.ValidateEntitlementAvailmentRequest(entitlementAvailmentRequest).
      subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message)
          this.shouldHide = false;
          this.shouldHide_Approve == true ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;

          this.router.navigate(['/successscreen'], {
            queryParams: {
              "Sdx": btoa(ActionName),
            }
          });
        } else {
          this.alertService.showWarning(apiResult.Message)
          this.shouldHide = false;
          this.shouldHide_Approve == true ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;
        }

      }, err => {

      })
  }


  isZipFile() {
    const ext = this.masterData.DocumentName.split('.').pop().toUpperCase();
    return ext === "ZIP";
  }

  downloadAttachments() {
    const documentName = this.masterData.DocumentName;
    const documentId = this.masterData.DocumentId;

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
    console.log('masterda', this.masterData);
    var fileNameSplitsArray = this.masterData.DocumentName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    console.log('fileNameSplitsArray', fileNameSplitsArray);
    console.log('ext', ext);

    if (ext.toUpperCase().toString() == "ZIP") {
      this.getFileList();
      return;
    } else {

      this.loadingScreenService.startLoading();
      const documentName = this.masterData.DocumentName
      const documentId = this.masterData.DocumentId
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

    let DocId = this.masterData.DocumentId
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

  // Used only to validate Regularization Detail Type 
  validateRegularizationDetailType(actionName: string) {
    if (actionName == 'REJECT' && (this.RegularizationComments == null || this.RegularizationComments == undefined || this.RegularizationComments.trim() === '')) {
      this.alertService.showInfo("Action blocked: Please enter the rejection remarks");
      return;
    }

    this.shouldHide = true;
    this.shouldHide_Approve = actionName === 'REJECT' ? false : true;
    this.shouldHide_Reject = actionName === 'REJECT' ? true : false;

    const payloadRegularization = {
      Comments: this.RegularizationComments,
      RegId: this.verifiedRequestLog.RequestIds,
      Button: actionName, // "APPROVE" OR "REJECT"
      ManagerId: this.verifiedRequestLog.UserId,
    };

    console.log("PAYLOAD :::::", payloadRegularization);

    this.attendanceService.ValidateRegularizationDetailType(JSON.stringify(payloadRegularization)).subscribe((result: apiResult) => {
      if (result.Status) {
        this.alertService.showSuccess(result.Message);
        this.shouldHide = false;
        this.shouldHide_Approve ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;

        this.router.navigate(['/successscreen'], {
          queryParams: {
            "Sdx": btoa(actionName),
          }
        });
      } else {
        this.alertService.showWarning(result.Result);
        this.shouldHide = false;
        this.shouldHide_Approve ? this.shouldHide_Approve = false : this.shouldHide_Reject = false;
      }
    });
  }

  GetAttendanceRegularizationRequestDetailsForDetailType() {
    const finalpayload = Number(this.verifiedRequestLog.RequestIds);

    this.attendanceService.GetAttendanceRegularizationRequestDetailsDetailType(JSON.stringify(finalpayload)).subscribe((result) => {
      let apiR: apiResult = result;
      if (apiR.Status && apiR.Result) {
        this.isVerified = true;
        this.SpinnerShouldhide = false;
        this.masterData = JSON.parse(apiR.Result);
      } else {
        this.SpinnerShouldhide = false;
      }

    });
  }

}
