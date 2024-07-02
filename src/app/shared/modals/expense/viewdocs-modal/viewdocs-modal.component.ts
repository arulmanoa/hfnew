import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { DomSanitizer } from '@angular/platform-browser';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";

import { SessionStorage } from '../../../../_services/service/session-storage.service';
import { AlertService } from '../../../../_services/service/alert.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { ReimbursementService } from 'src/app/_services/service/reimbursement.service';
import { ExpenseClaimRequest, ExpenseClaimRequestStatus, SubmitExpenseClaimRequestModel } from 'src/app/_services/model/Expense/ExpenseEligibilityCriteria';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { apiResult } from 'src/app/_services/model/apiResult';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Role, UserHierarchyRole } from 'src/app/_services/model';
@Component({
  selector: 'app-viewdocs-modal',
  templateUrl: './viewdocs-modal.component.html',
  styleUrls: ['./viewdocs-modal.component.css']
})
export class ViewdocsModalComponent implements OnInit {
  @Input() editObject: any;
  @Input() objStorageJson;
  @Input() Role;
  @Input() IsVerification: boolean;

  approvedAmount: any;
  submitted: boolean = false;
  contentmodalurl: any;
  constructor(
    private activeModal: NgbActiveModal,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    public sessionService: SessionStorage,
    private reimbursementService: ReimbursementService,
    private loadingScreenService: LoadingScreenService,
  ) { }

  ngOnInit() {

    console.log('editObject', this.editObject);

    this.contentmodalurl = null;
    this.viewer();

    if (this.editObject.ApprovedAmount == 0) {
      this.approvedAmount = this.editObject.RequestedAmount;
    } else {
      this.approvedAmount = this.editObject.ApprovedAmount;
    }

  }



  confirmExit() {
    this.activeModal.close('Modal Closed');
  }

  viewer() {

    var contentType = this.objectApi.getContentType(this.editObject.DocumentName);
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.objectApi.getObjectById(this.editObject.DocumentId)
        .subscribe(dataRes => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
          }
          let file = null;
          var objDtls = dataRes.Result;
          const byteArray = atob(objDtls.Content);
          const blob = new Blob([byteArray], { type: contentType });
          file = new File([blob], objDtls.ObjectName, {
            type: contentType,
            lastModified: Date.now()
          });
          if (file !== null) {

            var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);

            if (contentType.includes('image')) {
              this.compressImage(urll, 200, 200).then((compressed) => {
                urll = compressed as any;
                console.log('URL CODE ::', urll);
                this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
              });
            } else {
              this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
            }



          }
        });
    }
    else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.objectApi.getUrlToGetObject(this.editObject.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);

    }
    // var contentType = 'image/png';
    // this.objectApi.getObjectById(this.editObject.DocumentId)
    //   .subscribe(dataRes => {
    //     console.log('dataRes', dataRes);

    //     if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
    //       return;
    //       //handle error
    //     }
    //     let file = null;
    //     var objDtls = dataRes.Result;

    //     const byteArray = atob(objDtls.Content);
    //     const blob = new Blob([byteArray], { type: contentType });
    //     file = new File([blob], objDtls.ObjectName, {
    //       type: contentType,
    //       lastModified: Date.now()
    //     });

    //     if (file !== null) {
    //       var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
    //       this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
    //       console.log(this.contentmodalurl);
    //     }

    //   });
  }


  compressImage(src, newX, newY) {
    return new Promise((res, rej) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        const elem = document.createElement('canvas');
        elem.width = newX;
        elem.height = newY;
        const ctx = elem.getContext('2d');
        ctx.drawImage(img, 0, 0, newX, newY);
        const data = ctx.canvas.toDataURL();
        res(data);
      };
      img.onerror = (error) => rej(error);
    });
  }


  onRefresh() {

  }

  onClose() {

  }




  tiggerApiCall_expenseBatch(whichaction) {

    if (whichaction == true && (this.approvedAmount == null || this.approvedAmount == '' || this.approvedAmount == undefined)) {
      this.alertService.showWarning("Please enter approved amount and try again");
      return;

    }
    if (whichaction == true && (this.approvedAmount != null) && this.approvedAmount > this.editObject.RequestedAmount) {
      this.alertService.showWarning("Approved amount should not be greater than requested amount. ");
      return;

    }

    let actionName = whichaction == true ? 'Approve' : "Reject";
    this.alertService.confirmSwal1("Confirmation", `Are you sure you want to ${actionName}?`, "Yes, Confirm", "No, Cancel").then((result) => {
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

            this.saveExpense(jsonStr, whichaction);

          } else if (
            inputValue.dismiss === Swal.DismissReason.cancel

          ) {

          }
        })

      }
      else {
        this.saveExpense('', whichaction);

      }

    }).catch(error => {

    });
  }



  saveExpense(jsonObj, whichaction) {

    // this.expenseClaimRequestForm.controls['ProductName'].setValue(this.LstProduct.find(a => a.Id == this.expenseClaimRequestForm.get('ProductId').value).Name);
    // this.loadingScreenService.startLoading();
    var LstExpenseClaimRequest = [];
    var claimRequest = new ExpenseClaimRequest();
    claimRequest = this.editObject;
    // claimRequest.Id = this.editObject == null ? 0 : this.editObject.Id;
    // claimRequest.EmployeeId =  this.editObject == null ? 0 : this.editObject.Id;
    // claimRequest.ExpenseBatchId = this.editObject == null ? 0 : this.editObject.ExpenseBatchId;
    // claimRequest.ProductId =  this.editObject == null ? 0 : this.editObject.Id;
    // claimRequest.RequestedAmount =  this.editObject == null ? 0 : this.editObject.Id;
    // claimRequest.ApprovedAmount =  this.editObject == null ? 0 : this.editObject.Id;
    // claimRequest.ExpenseIncurredDate =  this.editObject == null ? 0 : this.editObject.ExpenseIncurredDate;
    // claimRequest.ExpenseFromDate =  this.editObject == null ? 0 : this.editObject.ExpenseFromDate;
    // claimRequest.ExpenseToDate = this.editObject == null ? 0 : this.editObject.ExpenseToDate;
    // claimRequest.DocumentId =  this.editObject == null ? 0 : this.editObject.DocumentId;
    // claimRequest.DocumentNumber =  this.editObject == null ? 0 : this.editObject.DocumentNumber;
    // claimRequest.DocumentDate =  this.editObject == null ? 0 : this.editObject.DocumentDate;
    // claimRequest.TravelRequestReferenceId = 0;
    claimRequest.ApprovedAmount = whichaction == true ? this.approvedAmount : 0;
    claimRequest.Status = whichaction == true ? ExpenseClaimRequestStatus.Approved : ExpenseClaimRequestStatus.Rejected;
    claimRequest.ModeType = UIMode.Edit;
    claimRequest.Remarks = jsonObj;
    // claimRequest.TimeCardId =  this.editObject == null ? 0 : this.editObject.TimeCardId;;
    // claimRequest.ModuleProcessTransactionId =  this.editObject == null ? 0 : this.editObject.ModuleProcessTransactionId;;
    // claimRequest.ApproverUserId = this.editObject == null ? 0 : this.editObject.ApproverUserId;;
    this.editObject = claimRequest;
    this.activeModal.close(this.editObject);

    // LstExpenseClaimRequest.push(claimRequest);

    // var role = new UserHierarchyRole();
    // role.IsCompanyHierarchy = false;
    // role.RoleCode = this.Role.Code;
    // role.RoleId = this.Role.Id;

    // var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
    // submitExpenseClaimRequestModel.ExpenseClaimRequestList = LstExpenseClaimRequest;
    // submitExpenseClaimRequestModel.ModuleProcessAction = 0;
    // submitExpenseClaimRequestModel.Role = role;
    // submitExpenseClaimRequestModel.ActionProcessingStatus = 0;
    // submitExpenseClaimRequestModel.Remarks = ''
    // submitExpenseClaimRequestModel.ClientId = this.objStorageJson.ClientId;
    // submitExpenseClaimRequestModel.ClientContractId = this.objStorageJson.ClientContractId;
    // submitExpenseClaimRequestModel.CompanyId = this.objStorageJson.CompanyId;
    // console.log('REQUEST LIST ::', submitExpenseClaimRequestModel);
    // this.loadingScreenService.stopLoading();
    // return;
    // this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
    //   .subscribe((expenseClaimReqgObj) => {
    //     try {
    //       console.log('UPSERT EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
    //       let resultObj: apiResult = expenseClaimReqgObj;
    //       if (resultObj.Status && resultObj.Result != null) {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showSuccess(resultObj.Message);

    //       }
    //       else {
    //         this.loadingScreenService.stopLoading();
    //         this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
    //       }
    //     } catch (Exception) {
    //       this.loadingScreenService.stopLoading();
    //       this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
    //     }

    //   }, err => {
    //     this.loadingScreenService.stopLoading();
    //     this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

    //   })
  }

}
