import { Component, OnInit, Input } from '@angular/core';
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";

import { SessionStorage } from '../../../../_services/service/session-storage.service';
import { AlertService } from '../../../../_services/service/alert.service';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { ReimbursementService } from 'src/app/_services/service/reimbursement.service';
import { ExpenseClaimRequest, ExpenseClaimRequestStatus, ExpenseEligibilityCriteria, ReimbursementProductConfiguration, SubmitExpenseClaimRequestModel, ValidateExpenseAmountModel } from 'src/app/_services/model/Expense/ExpenseEligibilityCriteria';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { apiResult } from 'src/app/_services/model/apiResult';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Role, UserHierarchyRole } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import moment from 'moment';
export interface multipleDocsObject {
  FileName: any;
  DocumentId: any;
  Status: number;
  ApprovedAmount?: any;
  Category?: any
}


@Component({
  selector: 'app-addexpense-modal',
  templateUrl: './addexpense-modal.component.html',
  styleUrls: ['./addexpense-modal.component.css']
})

export class AddexpenseModalComponent implements OnInit {
  @Input() CategoryList;
  @Input() editObject;
  @Input() objStorageJson;
  @Input() Role;
  submitted: boolean = false;
  expenseClaimRequestForm: FormGroup;
  LstProduct: any[] = [];
  // RECEIPT ONLY
  LstmultipleDocs: multipleDocsObject[] = [];
  uploadingSpinnerText: any = "Uploading...";
  unsavedDocumentLst = [];

  DocumentId: any;
  firstTimeDocumentId: any;
  FileName: any;
  spinnerText: string = "Uploading";
  isLoading: boolean = true;
  popupId: any;
  reimbursementConfiguration: ReimbursementProductConfiguration;
  ExpenseToDate: Date;
  ExpenseMinDate: Date;
  amountSpinner: boolean = false;
  isInvalidAmount: boolean = false;
  maxAmountMessage: any = '';
  _loginSessionDetails: LoginResponses;
  BusinessType: number;
  IsNewExpenseAdded: boolean = false;
  constructor(
    private drawerRef: NzDrawerRef<string>,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    public sessionService: SessionStorage,
    private reimbursementService: ReimbursementService,
    private loadingScreenService: LoadingScreenService,

  ) {
    this.createForm();
  }
  get g() { return this.expenseClaimRequestForm.controls; } // reactive forms validation 

  createForm() {

    this.expenseClaimRequestForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      ExpenseBatchId: [null],
      ProductId: [null, Validators.required],
      RequestedAmount: [0, Validators.required],
      ApprovedAmount: [0, Validators.required],
      ExpenseIncurredDate: ['', Validators.required],
      ExpenseFromDate: [null],
      ExpenseToDate: [null],
      DocumentId: [null],
      DocumentNumber: [null],
      DocumentDate: [null],
      InputRemarks: [''],
      TravelRequestReferenceId: [null],
      Status: [''],
      ProductName: [''],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop

    });

  }


  ngOnInit() {

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.init();
  }

  init() {
    this.ExpenseToDate = new Date();
    this.ExpenseMinDate = new Date();
    this.LstmultipleDocs = [];
    this.LstProduct = [];

    this.popupId = (this.expenseClaimRequestForm.get('Id').value);
    if (this.editObject != null) {
      this.DocumentId = this.editObject.DocumentId;
      this.FileName = `${this.editObject.DocumentName}`;
      this.firstTimeDocumentId = this.editObject.DocumentId;
      this.popupId = this.editObject.Id;
      this.editObject.ExpenseIncurredDate = new Date(this.editObject.ExpenseIncurredDate);
      this.editObject.ExpenseFromDate = new Date(this.editObject.ExpenseFromDate);
      this.editObject.ExpenseToDate = new Date(this.editObject.ExpenseToDate);
      this.editObject.DocumentDate = new Date(this.editObject.DocumentDate);
      this.expenseClaimRequestForm.patchValue(this.editObject);
      this.reimbursementConfiguration = this.CategoryList.find(a => a.ProductId == this.editObject.ProductId) != undefined ? this.CategoryList.find(a => a.ProductId == this.editObject.ProductId) : null;

      if (this.reimbursementConfiguration != null) {
        this.updateFormValidationAsConfiguration();
      }
    }

  }


  onChangeExpenseStartDate(event) {

    if (this.expenseClaimRequestForm.get('ExpenseFromDate').value != null || this.expenseClaimRequestForm.get('ExpenseFromDate').value != undefined) {
      var StartDate = new Date(event);

      this.ExpenseToDate = new Date();
      this.ExpenseToDate.setMonth(StartDate.getMonth());
      this.ExpenseToDate.setDate(StartDate.getDate() + 1);
      this.ExpenseToDate.setFullYear(StartDate.getFullYear());

    }
  }

  //TODO:To update formgroup validation
  updateValidation(value, control: AbstractControl) {


    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  updateFormValidationAsConfiguration() {
    // this.expenseClaimRequestForm.controls['RequestedAmount'].setValue(null);

    if (this.reimbursementConfiguration.EligibilityCriteria != null) {
      // expense from and to date 
      if (this.reimbursementConfiguration.EligibilityCriteria.IsFromAndToDateFieldsRequired) {
        this.updateValidation(true, this.expenseClaimRequestForm.get('ExpenseFromDate'));
        this.updateValidation(true, this.expenseClaimRequestForm.get('ExpenseToDate'));
      }
      else {
        this.updateValidation(false, this.expenseClaimRequestForm.get('ExpenseFromDate'));
        this.updateValidation(false, this.expenseClaimRequestForm.get('ExpenseToDate'));
      }
      // expense bill date
      if (this.reimbursementConfiguration.EligibilityCriteria.IsBillDataRequired) {
        this.updateValidation(true, this.expenseClaimRequestForm.get('DocumentDate'));
        this.updateValidation(true, this.expenseClaimRequestForm.get('DocumentNumber'));

      } else {
        this.updateValidation(false, this.expenseClaimRequestForm.get('DocumentDate'));
        this.updateValidation(false, this.expenseClaimRequestForm.get('DocumentNumber'));

      }
      // expense bill 
      if (this.reimbursementConfiguration.EligibilityCriteria.IsBillRequired) {
        this.updateValidation(true, this.expenseClaimRequestForm.get('DocumentId'));

      } else {
        this.updateValidation(false, this.expenseClaimRequestForm.get('DocumentId'));

      }

    } else {

      this.updateValidation(false, this.expenseClaimRequestForm.get('ExpenseFromDate'));
      this.updateValidation(false, this.expenseClaimRequestForm.get('ExpenseToDate'));
      this.updateValidation(false, this.expenseClaimRequestForm.get('DocumentDate'));
      this.updateValidation(false, this.expenseClaimRequestForm.get('DocumentNumber'));
      this.updateValidation(false, this.expenseClaimRequestForm.get('DocumentId'));


    }
  }

  onChangeCategory(categoryObject: any) {
    console.log('categoryObject', categoryObject);
    this.reimbursementConfiguration = null;
    this.reimbursementConfiguration = categoryObject;
    this.updateFormValidationAsConfiguration();

    if (this.expenseClaimRequestForm.get('RequestedAmount').value > 0 && (this.expenseClaimRequestForm.get('ExpenseIncurredDate').value == null || this.expenseClaimRequestForm.get('ExpenseIncurredDate').value == '')) {
      // this.validateAmount(this.expenseClaimRequestForm.get('RequestedAmount').value);
    }

  }

  onChangeExpenseDate(event) {
    if (this.expenseClaimRequestForm.get('ProductId').value != null && this.expenseClaimRequestForm.get('RequestedAmount').value > 0) {
      // this.validateAmount(this.expenseClaimRequestForm.get('RequestedAmount').value);
    }
  }

  cancel() {
    let returnObject = { StandardAPICall: this.IsNewExpenseAdded, StandardAPICallValue: null };
    this.drawerRef.close(JSON.stringify(returnObject));
  }

  validateAmount(amount) {
    const promise = new Promise((res, rej) => {


      this.maxAmountMessage = '';
      this.isInvalidAmount = false;

      if (this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsAllowedToSubmitRequestPostMaxLimit == false) {
        // var maxAmount = 0;
        // if (this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.ExpenseCycleConfigurationList != null && this.reimbursementConfiguration.EligibilityCriteria.ExpenseCycleConfigurationList.length > 0) {
        //   maxAmount = this.reimbursementConfiguration.EligibilityCriteria.ExpenseCycleConfigurationList[0].MaxAmount;

        //   if (amount > maxAmount) {
        //     this.alertService.showWarning(`You cannot exceed your budget limit of ${maxAmount}`);
        //     this.expenseClaimRequestForm.controls['RequestedAmount'].setValue(0);
        //     return;
        //   }
        // }


        if (this.expenseClaimRequestForm.get('ProductId').value == null) {
          this.alertService.showWarning("Please specify your category name.");
          this.expenseClaimRequestForm.controls['RequestedAmount'].setValue(0);
          return;
        }

        if (this.expenseClaimRequestForm.get('ExpenseIncurredDate').value == null || this.expenseClaimRequestForm.get('ExpenseIncurredDate').value == '') {
          this.alertService.showWarning("Enter the date of the expenses incurred.");
          this.expenseClaimRequestForm.controls['RequestedAmount'].setValue(0);
          return;
        }
        this.amountSpinner = true;

        var validateExpenseAmountModel = new ValidateExpenseAmountModel();
        validateExpenseAmountModel.EmployeeId = this.objStorageJson.EmployeeId;
        validateExpenseAmountModel.Amount = amount;
        validateExpenseAmountModel.ProductId = this.expenseClaimRequestForm.get('ProductId').value;
        validateExpenseAmountModel.ExpenseIncurredDate = moment(this.expenseClaimRequestForm.get('ExpenseIncurredDate').value).format('YYYY-MM-DD');
        validateExpenseAmountModel.Id = this.editObject == null ? 0 : this.editObject.Id;
        this.isInvalidAmount = false;
        console.log('VALIDATE API :', validateExpenseAmountModel)
        this.reimbursementService.ValidateExpenseAmount(validateExpenseAmountModel)
          .subscribe((expenseAmountObj) => {
            try {
              console.log('UPSERT EXPENSE AMOUNT ::', expenseAmountObj);
              let resultObj: apiResult = expenseAmountObj;
              if (resultObj.Status && resultObj.Result != null) {
                this.loadingScreenService.stopLoading();
                this.amountSpinner = false;
                var validatedAmountObject = resultObj.Result as any;
                if (validatedAmountObject.IsApproved == false && this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsAllowedToSubmitRequestPostMaxLimit) {
                  res(true)
                } else if (validatedAmountObject.IsApproved == false && this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsAllowedToSubmitRequestPostMaxLimit == false) {
                  this.alertService.showWarning(validatedAmountObject.Message);
                  this.maxAmountMessage = validatedAmountObject.Message
                  // this.expenseClaimRequestForm.controls['RequestedAmount'].setValue(0);
                  this.isInvalidAmount = true;
                  res(false);
                  return;
                }
                else {
                  res(true)
                }
                // this.alertService.showSuccess(resultObj.Message);
              }
              else {
                this.amountSpinner = false;
                res(false)
                // this.loadingScreenService.stopLoading();
                // this.alertService.showWarning('An error occcurred : ' + resultObj.Message);
              }
            } catch (Exception) {
              this.amountSpinner = false;
              res(false)
              // this.loadingScreenService.stopLoading();
              this.alertService.showWarning('Expense Amount Request : Something bad has happend ! ' + Exception);
            }

          }, err => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Expense Amount Request : Something bas has happend ! ' + err);

          })
      }
      else {
        res(true);
      }
    })
    return promise;

  }
  saveExpense(isNewExpenseRequired) {

    this.submitted = true;
    console.log('this.expenseClaimRequestForm', this.expenseClaimRequestForm.value);

    if (this.expenseClaimRequestForm.invalid) {
      this.alertService.showInfo("Please fill in all the values");
      return;
    }

    if (this.expenseClaimRequestForm.get('RequestedAmount').value == 0 || this.expenseClaimRequestForm.get('RequestedAmount').value == '' || this.expenseClaimRequestForm.get('RequestedAmount').value == null || this.expenseClaimRequestForm.get('RequestedAmount').value == undefined) {
      this.alertService.showInfo("Please enter the claim amount which must be greater than zero.");
      return;
    }

    // if (this.isInvalidAmount == true) {
    //   this.alertService.showWarning(this.maxAmountMessage);
    //   return;
    // }

    this.validateAmount(this.expenseClaimRequestForm.get('RequestedAmount').value).then((result) => {

      if (result) {



        this.loadingScreenService.startLoading();

        console.log('DF :', this.expenseClaimRequestForm.value);

        // return;
        // this.expenseClaimRequestForm.controls['ProductName'].setValue(this.LstProduct.find(a => a.Id == this.expenseClaimRequestForm.get('ProductId').value).Name);
        var LstExpenseClaimRequest = [];
        var claimRequest = new ExpenseClaimRequest();
        claimRequest.Id = this.editObject == null ? 0 : this.editObject.Id;
        claimRequest.EmployeeId = this.objStorageJson.EmployeeId;
        claimRequest.ExpenseBatchId = this.editObject == null ? 0 : this.editObject.ExpenseBatchId;
        claimRequest.ProductId = this.expenseClaimRequestForm.get('ProductId').value;
        claimRequest.RequestedAmount = this.expenseClaimRequestForm.get('RequestedAmount').value;
        claimRequest.ApprovedAmount = this.editObject == null ? 0 : this.editObject.ApprovedAmount;
        claimRequest.ExpenseIncurredDate = moment(this.expenseClaimRequestForm.get('ExpenseIncurredDate').value).format('YYYY-MM-DD');
        claimRequest.ExpenseFromDate = this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsFromAndToDateFieldsRequired ? moment(this.expenseClaimRequestForm.get('ExpenseFromDate').value).format('YYYY-MM-DD') : moment(this.expenseClaimRequestForm.get('ExpenseIncurredDate').value).format('YYYY-MM-DD');
        claimRequest.ExpenseToDate = this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsFromAndToDateFieldsRequired ? moment(this.expenseClaimRequestForm.get('ExpenseToDate').value).format('YYYY-MM-DD') : moment(this.expenseClaimRequestForm.get('ExpenseIncurredDate').value).format('YYYY-MM-DD');
        claimRequest.DocumentId = this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsBillRequired ? this.expenseClaimRequestForm.get('DocumentId').value == null ? 0 : this.expenseClaimRequestForm.get('DocumentId').value : 0;
        claimRequest.DocumentNumber = this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsBillDataRequired ? this.expenseClaimRequestForm.get('DocumentNumber').value == null ? null : this.expenseClaimRequestForm.get('DocumentNumber').value : '';
        claimRequest.DocumentDate = this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsBillDataRequired ? moment(this.expenseClaimRequestForm.get('DocumentDate').value).format('YYYY-MM-DD') : moment(this.expenseClaimRequestForm.get('ExpenseIncurredDate').value).format('YYYY-MM-DD');
        claimRequest.DocumentName = this.reimbursementConfiguration.EligibilityCriteria != null && this.reimbursementConfiguration.EligibilityCriteria.IsBillRequired ? this.FileName : '';
        claimRequest.TravelRequestReferenceId = 0;
        claimRequest.Status = this.editObject == null ? ExpenseClaimRequestStatus.Saved : ExpenseClaimRequestStatus.Saved;
        claimRequest.ModeType = UIMode.Edit;
        claimRequest.Remarks = this.expenseClaimRequestForm.get('InputRemarks').value;
        claimRequest.TimeCardId = 0;
        claimRequest.ModuleProcessTransactionId = 0;
        claimRequest.ApproverUserId = 0;

        LstExpenseClaimRequest.push(claimRequest);

        var role = new UserHierarchyRole();
        role.IsCompanyHierarchy = false;
        role.RoleCode = this.Role.Code;
        role.RoleId = this.Role.Id;

        var submitExpenseClaimRequestModel = new SubmitExpenseClaimRequestModel();
        submitExpenseClaimRequestModel.ExpenseClaimRequestList = LstExpenseClaimRequest;
        submitExpenseClaimRequestModel.ModuleProcessAction = 0;
        submitExpenseClaimRequestModel.Role = role;
        submitExpenseClaimRequestModel.ActionProcessingStatus = 0;
        submitExpenseClaimRequestModel.Remarks = ''
        submitExpenseClaimRequestModel.ClientId = this.objStorageJson.ClientId;
        submitExpenseClaimRequestModel.ClientContractId = this.objStorageJson.ClientContractId;
        submitExpenseClaimRequestModel.CompanyId = this.objStorageJson.CompanyId;
        console.log('REQUEST LIST ::', submitExpenseClaimRequestModel);

        // return;
        this.reimbursementService.SubmitExpenseClaimRequest(submitExpenseClaimRequestModel)
          .subscribe((expenseClaimReqgObj) => {
            try {

              console.log('UPSERT EXPENSE CLAIM REQUEST ::', expenseClaimReqgObj);
              let resultObj: apiResult = expenseClaimReqgObj;
              if (resultObj.Status && resultObj.Result != null) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(resultObj.Message);

                if (isNewExpenseRequired == 'false') {
                  let returnObject = { StandardAPICall: this.IsNewExpenseAdded, StandardAPICallValue: resultObj.Result[0] };
                  this.drawerRef.close(JSON.stringify(returnObject));
                } else {
                  this.IsNewExpenseAdded = true;
                  this.editObject = null;
                  this.init();
                  this.resetExpenseClaimForm();
                }

              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning('An error occurred : ' + resultObj.Message);
              }
            } catch (Exception) {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + Exception);
            }

          }, err => {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning('Expense Claim Request : Something bas has happend ! ' + err);

          })
      }
    });




  }

  resetExpenseClaimForm() {

    this.expenseClaimRequestForm.controls['ExpenseBatchId'].setValue(null);
    this.expenseClaimRequestForm.controls['Id'].setValue(UUID.UUID());
    this.expenseClaimRequestForm.controls['ProductId'].setValue(null);
    this.expenseClaimRequestForm.controls['RequestedAmount'].setValue(0);
    this.expenseClaimRequestForm.controls['ApprovedAmount'].setValue(0);
    this.expenseClaimRequestForm.controls['ExpenseIncurredDate'].setValue(null);
    this.expenseClaimRequestForm.controls['ExpenseFromDate'].setValue(null);
    this.expenseClaimRequestForm.controls['ExpenseToDate'].setValue(null);
    this.expenseClaimRequestForm.controls['DocumentId'].setValue(0);
    this.expenseClaimRequestForm.controls['DocumentNumber'].setValue('');
    this.expenseClaimRequestForm.controls['DocumentDate'].setValue(null);
    this.expenseClaimRequestForm.controls['InputRemarks'].setValue('');
    this.expenseClaimRequestForm.controls['TravelRequestReferenceId'].setValue(null);
    this.expenseClaimRequestForm.controls['Status'].setValue('');
    this.expenseClaimRequestForm.controls['ProductName'].setValue('');
    this.expenseClaimRequestForm.controls['FileName'].setValue(null);
    this.expenseClaimRequestForm.controls['IsDocumentDelete'].setValue(false);
    this.FileName = null;
    this.popupId = null;
    this.DocumentId = null;


  }

  // ADD A RECEIPT
  onFileUpload(e) {
    this.spinnerText = "Uploading";

    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";
        this.FileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, file.name)
      };
    }
  }


  doAsyncUpload(filebytes, filename) {
    try {

      // this.LstmultipleDocs.push({
      //   FileName: filename,
      //   DocumentId: this.LstmultipleDocs.length + 1,
      //   Status: 0,
      //   ApprovedAmount: 0
      // })

      this.isLoading = false;
      // return;

      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.EmployeeId = this.objStorageJson.EmployeeId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.objStorageJson.ClientContractId;
      objStorage.ClientId = this.objStorageJson.ClientId;
      objStorage.CompanyId = this.objStorageJson.CompanyId;

      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "EmpTransactions";
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);

        try {

          if (apiResult.Status && apiResult.Result != "") {
            this.DocumentId = apiResult.Result;
            this.LstmultipleDocs.push({
              FileName: filename,
              DocumentId: apiResult.Result,
              Status: 0,
              ApprovedAmount: 0
            })
            this.expenseClaimRequestForm.controls['DocumentId'].setValue(apiResult.Result);
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file!")

          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {

          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }
      }), ((err) => {

      })


      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }


  doDeleteFile() {
    // this.spinnerStarOver();
    console.log(this.popupId);

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
      console.log(result);

      if (result.value) {
        if (this.isGuid(this.popupId)) {

          this.deleteAsync();
        }
        else if (this.firstTimeDocumentId != this.DocumentId) {

          this.deleteAsync();

        }

        else {

          this.FileName = null;
          this.expenseClaimRequestForm.controls['IsDocumentDelete'].setValue(true);
          this.expenseClaimRequestForm.controls['FileName'].setValue(null);
          this.expenseClaimRequestForm.controls['DocumentId'].setValue(null);
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

  deleteAsync() {


    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {

      console.log(res);
      let apiResult: apiResult = (res);

      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.expenseClaimRequestForm.controls['DocumentId'].setValue(null);
          this.expenseClaimRequestForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.expenseClaimRequestForm.controls['IsDocumentDelete'].setValue(false);
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")

        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)

        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }


    }), ((err) => {

    })



  }

  unsavedDeleteFile(_DocumentId) {

    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {

      console.log(res);
      let apiResult: apiResult = (res);

      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.expenseClaimRequestForm.controls['DocumentId'].setValue(null);
          this.expenseClaimRequestForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.expenseClaimRequestForm.controls['IsDocumentDelete'].setValue(false);


        } else {

        }
      } catch (error) {


      }


    }), ((err) => {

    })
  }

  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }

  saveAndEditExpense() {

  }


}
