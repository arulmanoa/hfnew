import { Component, OnInit, TemplateRef } from '@angular/core';
import { LoginResponses } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertService, ESSService, EmployeeService, FileUploadService, SessionStorage } from 'src/app/_services/service';
import { apiResult } from 'src/app/_services/model/apiResult';
import moment from 'moment';
import { ModalDismissReasons, NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import Swal from 'sweetalert2';
import { ObjectStorageDetails } from '@services/model/Candidates/ObjectStorageDetails';
import { environment } from 'src/environments/environment';
import { ResignationHistoryComponent } from './resignation-history/resignation-history.component';



@Component({
  selector: 'app-employee-resignation',
  templateUrl: './employee-resignation.component.html',
  styleUrls: ['./employee-resignation.component.css']
})
export class EmployeeResignationComponent implements OnInit {

  _loginSessionDetails: LoginResponses;
  loggedInEmployeeId: number;
  noticePeriodInDays: number;
  lastWorkingDay: any;
  spinner: boolean = true;
  isFirstTime: boolean = true;
  masterInfoDetails: any;
  resignationDetails: any;
  relieavingReasons: any;
  selectedReason: any;
  selectedRelievingDate: any;
  minDate = new Date();
  resignationForm: FormGroup;

  fileUploadSpinner: boolean = false;
  BusinessType: any = 0;
  CompanyId: number = 0;
  ResignationDisclaimerText : string = '' ; // environment.environment.ResignationDisclaimerText;
  resignationConfirmationButtonText: string[] = environment.environment.
  ResignationConfirmationButtonText;

  isAllowToKeepPreviousResignDateForRejectionStatus  = environment.environment.AllowedToKeepPreviousResignDateForRejectionStatus;

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private formBuilder: FormBuilder,
    private loadingScreenService: LoadingScreenService,
    private fileuploadService: FileUploadService,
    private essService: ESSService,
    public modalService: NgbModal
  ) {
    this.resignationForm = this.formBuilder.group({
      resignationReason: [null, [Validators.required, Validators.minLength(1), Validators.maxLength(500)]],
      appliedRelievingDate: [null, Validators.required],
      remarks: ['', Validators.required],
      documentId: [0],
      documentName: [''],
      incurredDisclaimer: false
    });
    window.addEventListener("beforeunload", function (e) {
      var confirmationMessage = "\o/";
      e.returnValue = confirmationMessage;
      // e.preventDefault();     // Gecko, Trident, Chrome 34+
      return confirmationMessage;              // Gecko, WebKit, Chrome <34
    });

  }

  ngOnInit() {
    this.minDate =  new Date();
    // Get the whole matched session element set as a clean json(array) via an session object
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInEmployeeId = this._loginSessionDetails.EmployeeId;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this._loginSessionDetails.Company.Id;

    this.GetMasterInfoForResignation();
  }

  formatDateString(dateTo) {
    const newDate = moment(dateTo, 'DD-MM-YYYY').format("DD MMM YYYY");
    return newDate;
  }

  GetMasterInfoForResignation(): void {
    this.spinner = true;
    this.employeeService.GetMasterInfoForResignation(this.loggedInEmployeeId).subscribe((response) => {
      let apiResponse: apiResult = response;
      this.spinner = false;
      if (apiResponse.Status && apiResponse.Result) {
        let result = JSON.parse(apiResponse.Result);
        if (result.ResignationId && result.ResignationId !== 0) {
          this.isFirstTime = false;
          this.resignationDetails = result;
          this.resignationDetails.AppliedRelievingDate = this.formatDateString(result.AppliedRelievingDate);
          this.resignationDetails.ApprovedRelievingDate = this.formatDateString(result.ApprovedRelievingDate);
          this.resignationDetails.appliedResignationReason = result.ResignationReasons.filter((el) => el.Id === result.ResignationReason)[0].Name;
        } else {
          this.isFirstTime = true;
        }

        const currentDate = new Date();
        const appliedRelievingDate = new Date(result.AppliedRelievingDate);
        
        this.minDate = (result.Status == 3 && this.isAllowToKeepPreviousResignDateForRejectionStatus)
    ? (moment(currentDate).isBefore(appliedRelievingDate) ? currentDate : appliedRelievingDate)
    : currentDate;

        this.masterInfoDetails = result;
        this.noticePeriodInDays = result.NoticePeriodDays;
        this.relieavingReasons = result.ResignationReasons;
        this.ResignationDisclaimerText = this.masterInfoDetails.ResignationDisclaimerText;
        this.lastWorkingDay = moment(this.minDate).add(this.noticePeriodInDays, 'days').format("DD MMM YYYY");
        let lwd = moment(this.minDate).add(this.noticePeriodInDays, 'days').format("YYYY-MM-DD");
        this.resignationForm.controls['appliedRelievingDate'].patchValue(new Date(lwd));
        this.onChangeRelievedDate(new Date(lwd));

        // just for Allen (document and disclaimer message)- referenced it from the client contract operation 
        if (this.masterInfoDetails.IsDocumentMandatoryForResignation) {
          this.essService.updateValidation(true, this.resignationForm.get('documentId'));
          this.essService.updateValidation(true, this.resignationForm.get('documentName'));
        }

        if (this.masterInfoDetails.ResignationDisclaimerText) {
          this.essService.updateValidation(true, this.resignationForm.get('incurredDisclaimer'));
        }

        console.log('GetMasterInfoForResignation -->', this.masterInfoDetails);
        console.log('resignationDetails -->', this.resignationDetails);
      }
    });
  }

  onChangeReason(evt: any): void {
    if (evt) {
      this.selectedReason = evt.Id;
    }
    console.log('onChangeReason -->', this.resignationForm.get('resignationReason').value, this.selectedReason);
  }

  onChangeRelievedDate(evt: any): void {
    console.log('onchange reliving date');
    if (evt) {
      this.selectedRelievingDate = moment(evt).format("DD-MM-YYYY");
    }
    console.log('DATE -->', evt, this.selectedRelievingDate);
  }

  cancelResignation() {
    this.resignationForm.reset();
    this.selectedReason = undefined;
    this.selectedRelievingDate = undefined;
    this.GetMasterInfoForResignation();
  }

  validateFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof FormGroup) {
        this.validateFormFields(control);
      } else {
        control.markAsTouched({ onlySelf: true });
        if (control.invalid) {
          let message = '';
          if (control.errors.required) {
            message = `${this.getFieldName(field)} is required`;
          }
          this.alertService.showWarning(message);
        }
      }
    });
  }

  getFieldName(field: string): string {
    return field.charAt(0).toUpperCase() + field.slice(1);
  }

  saveSubmitResignation() {
    // check required fields
    const keys = Object.keys(this.resignationForm.controls);
    console.log('RR Submission :', this.resignationForm.value)
    console.log('Disclaimer :', this.resignationForm.get("incurredDisclaimer").value);
    
    if (this.resignationForm.invalid || !this.resignationForm.get("incurredDisclaimer").value) {
        for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        const control = this.resignationForm.get(key);
        if (key == "incurredDisclaimer" && this.masterInfoDetails.ResignationDisclaimerText && (!control.value || control.invalid && control.errors.required)) {
          this.alertService.showWarning('You must agree to the disclaimer before submitting the form. Please check the box to confirm that you have read and understood the disclaimer.');
          break;
        }
        else if (control.invalid && control.errors.required) {
          let fieldName = key.replace(/([A-Z])/g, ' $1').trim();
          fieldName = fieldName.charAt(0).toUpperCase() + fieldName.slice(1);
          this.alertService.showWarning(`Please enter/select the ${fieldName}. This field is required.`);
          break;
        }
      }

      this.alertService.showWarning(`Please fill out all of the necessary fields on this form and try to submit your resignation request.`);
      return;
    }
    // show alert box
    this.confirmAlertOnSubmitResignation("", "", this.resignationConfirmationButtonText[0], this.resignationConfirmationButtonText[1]).then((res) => {
      if (res) {
        this.loadingScreenService.startLoading();
        const resignationData = {
          Id: 0,
          EmployeeId: this.loggedInEmployeeId,
          ResignationReason: this.selectedReason,
          AppliedRelievingDate: this.selectedRelievingDate,
          EmployeeRemarks: this.resignationForm.get('remarks').value,
          DocumentId: this.resignationForm.get('documentId').value,
          DocumentName: this.resignationForm.get('documentName').value,
        };
        console.log('SUBMIT DATA -->', this.resignationForm, resignationData);
        this.employeeService.upsertEmployeeResignationDetails(resignationData).subscribe((response) => {
          let res: apiResult = response;
          this.loadingScreenService.stopLoading();
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.GetMasterInfoForResignation();
          } else {
            this.alertService.showWarning(res.Message);
            this.cancelResignation();
          }
        });
      } else {
        this.cancelResignation();
      }
    });
  }

  editRejectedResignationRequest() {
    this.isFirstTime = true;
    this.selectedReason = this.resignationDetails.ResignationReason;
    this.resignationForm.controls['resignationReason'].setValue(this.resignationDetails.ResignationReason);
    this.resignationForm.controls['appliedRelievingDate'].setValue(new Date(this.resignationDetails.AppliedRelievingDate));
    this.resignationForm.controls['remarks'].setValue(this.resignationDetails.EmployeeRemarks);
  }

  revokeResignationRequest() {
    // show alert box
    this.getRemarksForRevokeResignation().then((res) => {
      if (res) {
        this.loadingScreenService.startLoading();
        const revokeResignationData = {
          ResignationId: this.resignationDetails.ResignationId,
          Remarks: res,
        };
        console.log('REVOKE DATA -->', revokeResignationData);
        this.employeeService.revokeEmployeeResignationRequest(revokeResignationData).subscribe((response) => {
          let res: apiResult = response;
          this.loadingScreenService.stopLoading();
          if (res.Status) {
            this.alertService.showSuccess(res.Message);
            this.GetMasterInfoForResignation();
          } else {
            this.alertService.showWarning(res.Message);
            this.cancelResignation();
          }
        });
      } else {
        this.cancelResignation();
      }
    });
  }

  getRemarksForRevokeResignation() {
    return new Promise((resolve, reject) => {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary btn-lg-width',
          cancelButton: 'btn btn-light  btn-text-light',
          header: 'align-items-left',
          title: 'align-items-left',
          content: 'align-items-left',
          container: 'align-items-left',
          actions: 'flex-direction-column'
        },
        buttonsStyling: false
      })
      swalWithBootstrapButtons.fire({
        title: "Revoke Resignation",
        text: "Remarks",
        animation: false,
        showCancelButton: true,
        input: 'textarea',
        inputPlaceholder: "Good to know that you want to revoke your resignation",
        allowEscapeKey: false,
        confirmButtonText: "Confirm",
        cancelButtonText: "Cancel",
        inputAttributes: {
          autocorrect: 'off',
          autocapitalize: 'on',
          maxlength: '200'
        },
        showCloseButton: true,
        allowOutsideClick: false,
        inputValidator: (value) => {
          if (value.length >= 200) {
            return 'Maximum 200 characters allowed.'
          }
          if (!value) {
            return 'You need to write something!'
          }
        },

      }).then((inputValue) => {
        if (inputValue.value) {
          resolve(inputValue.value);
        } else if (inputValue.dismiss === Swal.DismissReason.cancel) {
          reject(false);
        }
      });
    });
  }

  confirmAlertOnSubmitResignation(title, text, buttontxt, cancelbtntxt) {
    return new Promise((resolve, reject) => {

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary btn-lg-width',
          cancelButton: 'btn btn-light btn-text-light',
          content: 'sweetalert-content',
          actions: 'flex-direction-column'
        },
        buttonsStyling: false
      })

      swalWithBootstrapButtons.fire({
        title: title,
        html: `<div> ${this.resignationConfirmationButtonText[2]} <br> ${this.resignationConfirmationButtonText[3]}</div>`,
        imageUrl: './assets/Images/warning-outline.png',
        imageHeight: 81,
        imageAlt: 'Warning Icon',
        showCancelButton: true,
        confirmButtonText: buttontxt,
        cancelButtonText: cancelbtntxt,
        showCloseButton: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      }).then((result) => {
        if (result.value) {
          resolve(result.value);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          reject(false);
        }
      })
    });
  }

  getResignationHistory() {
    const modalRef = this.modalService.open(ResignationHistoryComponent);
    modalRef.componentInstance.data = this.resignationDetails;
    modalRef.result.then((result) => {
      if (result) {
        console.log(result);
      }
    });
  }
  // openUploadDocModal(){
  //   const modalRef = this.modalService.open(ResignationHistoryComponent);
  //   modalRef.componentInstance.data = this.resignationDetails;
  //   modalRef.result.then((result) => {
  //     if (result) {
  //       console.log(result);
  //     }
  //   });
  // };


  onAddAttachment(files: { base64: string, filename: string }[]) {
    console.log(files);
    if (files.length > 0) {
      this.fileUploadSpinner = true;
      files.forEach((file: { base64: string, filename: string }) => this.doFnfAsyncUpload(file.base64, file.filename));
    }
  }

  doDeleteAttachment() {
    this.resignationForm.controls['documentId'].setValue(0);
    this.resignationForm.controls['documentName'].setValue("");
  }

  doFnfAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = 0;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = this.masterInfoDetails.ClientContractId;
      objStorage.ClientId = this.masterInfoDetails.ClientId;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        if (apiResult && apiResult.Status) {
          this.fileUploadSpinner = false
          console.log('apiResult ', apiResult);
          this.resignationForm.controls['documentId'].setValue(apiResult.Result);
          this.resignationForm.controls['documentName'].setValue(filename);
          this.alertService.showSuccess('File uploaded successfully !');
        } else {
          this.fileUploadSpinner = false;
        }
      })
    } catch (error) {

    }
  }

}
