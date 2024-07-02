import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { UIMode } from '@services/model';
import { ApprovalStatus } from '@services/model/Candidates/CandidateDocuments';
import { EmployeeDetails, EmployeeMenuData } from '@services/model/Employee/EmployeeDetails';
import { EmployeeLookUp } from '@services/model/Employee/EmployeeLookup';
import { EmployeeModel } from '@services/model/Employee/EmployeeModel';
import { EmploymentDetails } from '@services/model/Employee/EmploymentDetails';
import { apiResponse } from '@services/model/apiResponse';
import { apiResult } from '@services/model/apiResult';
import { AlertService, ESSService, EmployeeService } from '@services/service';
import { InvestmentService } from '@services/service/investments.service';
import { UUID } from 'angular2-uuid';
import _ from 'lodash';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';

import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-previous-employment-modal',
  templateUrl: './previous-employment-modal.component.html',
  styleUrls: ['./previous-employment-modal.component.scss']
})
export class PreviousEmploymentModalComponent implements OnInit {
  @ViewChild('myInput')
  myInputVariable: ElementRef;
  @Input() employeedetails: EmployeeDetails;
  @Input() currentTaxMode: number;
  @Input() LstAllDeclarationProducts: any[] = [];
  @Input() selectedFinYear: any;
  @Input() IsNewTaxRegimeOpted: boolean;
  @Input() LstEmployeeInvestmentLookup: EmployeeLookUp;
  @Input() UserId: number;
  @Input() RoleCode: string;

  private destroy$: Subject<void> = new Subject<void>();

  EmployeeId: any = 0;
  employeeModel: EmployeeModel = new EmployeeModel();

  submitted = false;
  disableBtn = false;
  spinner: boolean = true;
  employeeForm: FormGroup;
  EnddateminDate: Date;

  LstemploymentDetails = [];
  FicalYearList = [];

  IsApiTriggered: boolean = false;


  isLoading: boolean = true;
  docSpinnerText: string = "Uploading";
  unsavedDocumentLst = [];
  modalOption: NgbModalOptions = {};

  IsEditMode: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private modalService: NgbModal,
    private investmentService: InvestmentService,
    private essService: ESSService,
    private employeeService: EmployeeService
  ) {
    this.createReactiveForm();
  }
  get g() { return this.employeeForm.controls; }

  createReactiveForm() {
    this.employeeForm = this.formBuilder.group({

      // PREVIOUS EMPLOYMENT
      Id: [UUID.UUID()],
      previousemploymentId: [''],
      companyName: [''],
      startdate: [''],
      enddate: [''],
      grossSalary: [''],
      previousPT: [''],
      previousPF: [''],
      taxDeducted: [''],
      IsESSRequired: [true],
      prevEmpfinancialYear: [null],
      prevEmpIsProposedMode: [false],
      Prev_DocumentId: [null,],
      Prev_FileName: [null],
      Prev_Status: [''],
      InputsRemarks: [''],
      Modetype: [UIMode.None]
    });
  }
  ngOnInit() {
    this.EmployeeId = this.employeedetails.Id;
    this.doRefresh();
  }

  doRefresh() {
    this.spinner = true;
    this.LstemploymentDetails = [];


    this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 ? this.employeedetails.LstemploymentDetails = this.employeedetails.LstemploymentDetails.filter(a => a.Status != 0) : true;

    console.log('ghghg', this.employeedetails.LstemploymentDetails);

    this.FicalYearList = this.LstEmployeeInvestmentLookup.FicalYearList;
    this.FicalYearList.length > 0 ? this.FicalYearList = this.FicalYearList.filter(a=>a.Id == this.selectedFinYear) : true;
    
    this.LstemploymentDetails = this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 ? this.employeedetails.LstemploymentDetails : [];

    if (this.LstemploymentDetails.length > 0) {
      this.LstemploymentDetails.forEach(element => {
        element['FinancialYearName'] = this.LstEmployeeInvestmentLookup.FicalYearList.find(a => a.Id == element.FinancialYearId).code;
        element.ApprovedGrossSalary = element.ApprovedGrossSalary == null ? 0 : element.ApprovedGrossSalary,
          element.ApprovedPreviousPF = element.ApprovedPreviousPF == null ? 0 : element.ApprovedPreviousPF,
          element.ApprovedPreviousPT = element.ApprovedPreviousPT == null ? 0 : element.ApprovedPreviousPT,
          element.ApprovedStandardDeduction = element.ApprovedStandardDeduction == null ? 0 : element.ApprovedStandardDeduction,
          element.ApprovedTaxDeducted = element.ApprovedTaxDeducted == null ? 0 : element.ApprovedTaxDeducted
      });

      this.LstemploymentDetails = _.orderBy(this.LstemploymentDetails, ['FinancialYearId', 'StartDate'], ['desc', 'asc']);
    }

    this.spinner = false;
  }




  onChangeStartDate(event) {

    const startDateValue = this.employeeForm.get('startdate').value;
    if (startDateValue !== null && startDateValue !== undefined || event !== null && event !== undefined) {
      this.employeeForm.controls['enddate'].setValue(null);
      const startDate = new Date(event || startDateValue);
      if (!isNaN(startDate.getTime())) {
        this.EnddateminDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1);
      }
    }
  }


  updatePreviousEmplyment() {
    this.submitted = true;

    const getFormValue = (controlName: string) => this.employeeForm.get(controlName).value;

    const prevEmpfinancialYear = getFormValue('prevEmpfinancialYear');
    const companyName = getFormValue('companyName');
    const startDate = getFormValue('startdate');
    const endDate = getFormValue('enddate');
    const grossSalary = getFormValue('grossSalary');
    const previousPT = getFormValue('previousPT');
    const previousPF = getFormValue('previousPF');
    const taxDeducted = getFormValue('taxDeducted');
    const prevStatus = getFormValue('Prev_Status');
    const inputsRemarks = getFormValue('InputsRemarks');
    const prevEmpIsProposedMode = getFormValue('prevEmpIsProposedMode');
    const prevFileName = getFormValue('Prev_FileName');
    const prevDocumentId = getFormValue('Prev_DocumentId');
    const prevEmploymentId = getFormValue('previousemploymentId');

    console.log('prevFileName',prevFileName);
    const mode = true as any;

    if (
      prevEmpfinancialYear == null || companyName == null || companyName == '' || startDate == null || endDate == null ||
      grossSalary == null || previousPT == null || previousPF == null || taxDeducted == null
    ) {
      this.setFormErrors();
    } else if (this.currentTaxMode == 2 && (prevFileName == '' || prevFileName == null)) {
      this.employeeForm.controls['Prev_DocumentId'].setErrors({ 'incorrect': true });
    } else {

      let foundIndex = this.employeedetails.LstemploymentDetails.find(z => z.Id == (this.employeeForm.get('previousemploymentId').value));
      if (foundIndex != undefined && foundIndex != null) {
        foundIndex.FinancialYearId = this.employeeForm.get('prevEmpfinancialYear').value;
        foundIndex.CompanyName = (this.employeeForm.get('companyName').value);
        foundIndex.StartDate = (this.employeeForm.get('startdate').value);
        foundIndex.EndDate = (this.employeeForm.get('enddate').value);
        foundIndex.GrossSalary = (this.employeeForm.get('grossSalary').value) || 0;
        foundIndex.PreviousPT = (this.employeeForm.get('previousPT').value) || 0;
        foundIndex.PreviousPF = (this.employeeForm.get('previousPF').value) || 0;
        foundIndex.TaxDeducted = (this.employeeForm.get('taxDeducted').value) || 0;
        foundIndex.Modetype = UIMode.Edit;
        foundIndex.Status = 1;
        foundIndex.InputsRemarks = (this.employeeForm.get('InputsRemarks').value);

        foundIndex.FileName = (this.employeeForm.get('Prev_FileName').value);
        foundIndex.DocumentId = (this.employeeForm.get('Prev_DocumentId').value) == null ? 0 : (this.employeeForm.get('Prev_DocumentId').value);
        foundIndex.IsProposed = this.currentTaxMode == 1 ? true : false; // foundIndex.DocumentId > 0 ? false : true;
        foundIndex.ApprovalStatus = this.PermissibleRoles() ? foundIndex.ApprovalStatus : 0;

        foundIndex['FinancialYearName'] = this.FicalYearList.find(a => a.Id == this.employeeForm.get('prevEmpfinancialYear').value).code;
      } else {
        var employmentDetails = new EmploymentDetails();
        employmentDetails.Id = UUID.UUID() as any;
        employmentDetails.FinancialYearId = this.employeeForm.get('prevEmpfinancialYear').value;
        employmentDetails.CompanyName = (this.employeeForm.get('companyName').value);
        employmentDetails.StartDate = (this.employeeForm.get('startdate').value);
        employmentDetails.EndDate = (this.employeeForm.get('enddate').value);
        employmentDetails.GrossSalary = (this.employeeForm.get('grossSalary').value) || 0;
        employmentDetails.PreviousPT = (this.employeeForm.get('previousPT').value) || 0;
        employmentDetails.PreviousPF = (this.employeeForm.get('previousPF').value) || 0;
        employmentDetails.TaxDeducted = (this.employeeForm.get('taxDeducted').value) || 0;
        employmentDetails.FileName = (this.employeeForm.get('Prev_FileName').value);
        employmentDetails.DocumentId = (this.employeeForm.get('Prev_DocumentId').value) == null ? 0 : (this.employeeForm.get('Prev_DocumentId').value);
        employmentDetails.IsProposed = this.currentTaxMode == 1 ? true : false; // employmentDetails.DocumentId > 0 ? false : true;// mode == false ? true : false;
        employmentDetails.Status = 1;
        employmentDetails.InputsRemarks = (this.employeeForm.get('InputsRemarks').value);
        employmentDetails.ApprovalStatus = this.PermissibleRoles() ? ApprovalStatus.Approved : ApprovalStatus.Pending;
        employmentDetails['FinancialYearName'] = this.FicalYearList.find(a => a.Id == this.employeeForm.get('prevEmpfinancialYear').value).code;

        employmentDetails.Modetype = UIMode.Edit;
        this.employeedetails.LstemploymentDetails.push(employmentDetails);
      }

      this.resetFormControls();
      this.orderAndSaveDetails();
    }
  }


  setFormErrors() {
    const controlsToCheck = ['prevEmpfinancialYear', 'companyName', 'startdate', 'enddate', 'grossSalary', 'previousPT', 'previousPF', 'taxDeducted'];
    controlsToCheck.forEach(controlName => {
      const controlValue = this.employeeForm.get(controlName).value;
      if (controlValue == null || controlValue == '') {
        this.employeeForm.controls[controlName].setErrors({ 'incorrect': true });
      }
    });
  }

  // updateEmploymentDetails(foundIndex) {
  //   const { prevEmpfinancialYear, companyName, startDate, endDate, grossSalary, previousPT, previousPF, taxDeducted, Prev_FileName, Prev_DocumentId, prevEmpIsProposedMode, InputsRemarks } = this.employeeForm.value;

  //   foundIndex.FinancialYearId = prevEmpfinancialYear;
  //   foundIndex.CompanyName = companyName;
  //   foundIndex.StartDate = startDate;
  //   foundIndex.EndDate = endDate;
  //   foundIndex.GrossSalary = grossSalary || 0;
  //   foundIndex.ApprovalStatus = ApprovalStatus.Pending;
  //   foundIndex.PreviousPT = previousPT || 0;
  //   foundIndex.PreviousPF = previousPF || 0;
  //   foundIndex.TaxDeducted = taxDeducted || 0;
  //   foundIndex.Modetype = UIMode.Edit;
  //   foundIndex.Status = 1;
  //   foundIndex.InputsRemarks = InputsRemarks;
  //   foundIndex.FileName = Prev_FileName;
  //   foundIndex.DocumentId = Prev_DocumentId == null ? 0 : Prev_DocumentId;
  //   foundIndex.IsProposed = this.currentTaxMode == 1 ? true : false;
  //   foundIndex['FinancialYearName'] = this.FicalYearList.find(a => a.Id == prevEmpfinancialYear).code;
  // }

  // createNewEmploymentDetails() {
  //   const { prevEmpfinancialYear, companyName, startDate, endDate, grossSalary, previousPT, previousPF, taxDeducted, Prev_FileName, Prev_DocumentId, prevEmpIsProposedMode, InputsRemarks } = this.employeeForm.value;

  //   const employmentDetails = new EmploymentDetails();
  //   employmentDetails.Id = UUID.UUID() as any;
  //   employmentDetails.FinancialYearId = prevEmpfinancialYear;
  //   employmentDetails.CompanyName = companyName;
  //   employmentDetails.StartDate = startDate;
  //   employmentDetails.EndDate = endDate;
  //   employmentDetails.GrossSalary = grossSalary || 0;
  //   employmentDetails.ApprovalStatus = ApprovalStatus.Pending;
  //   employmentDetails.PreviousPT = previousPT || 0;
  //   employmentDetails.PreviousPF = previousPF || 0;
  //   employmentDetails.TaxDeducted = taxDeducted || 0;
  //   employmentDetails.FileName = Prev_FileName;
  //   employmentDetails.DocumentId = Prev_DocumentId == null ? 0 : Prev_DocumentId;
  //   employmentDetails.IsProposed = this.currentTaxMode == 1 ? true : false;
  //   employmentDetails.Status = 1;
  //   employmentDetails.InputsRemarks = InputsRemarks;

  //   employmentDetails['FinancialYearName'] = this.FicalYearList.find(a => a.Id == prevEmpfinancialYear).code;
  //   employmentDetails.Modetype = UIMode.Edit;

  //   return employmentDetails;
  // }

  resetFormControls() {
    const controlNamesToReset = [
      'companyName', 'startdate', 'enddate', 'grossSalary', 'Prev_Status', 'InputsRemarks',
      'previousPT', 'previousPF', 'taxDeducted', 'prevEmpfinancialYear', 'prevEmpIsProposedMode', 'Prev_FileName', 'Prev_DocumentId'
    ];
    controlNamesToReset.forEach(controlName => this.employeeForm.controls[controlName].reset());
  }


  orderAndSaveDetails() {
    if (this.employeedetails.LstemploymentDetails && this.employeedetails.LstemploymentDetails.length > 0) {
      this.employeedetails.LstemploymentDetails = _.orderBy(this.employeedetails.LstemploymentDetails, ['FinancialYearId', 'StartDate'], ['desc', 'asc']);
    }

    this.submitted = false;
    this.IsEditMode = false;
    this.doSaveOrSubmit();
    console.log('sdfdasf', this.employeedetails.LstemploymentDetails);
  }


  doSaveOrSubmit(isSubmit = ""): void {
    try {
      this.loadingScreenService.startLoading();

      if (this.employeedetails.LstemploymentDetails && this.employeedetails.LstemploymentDetails.length > 0) {
        this.employeedetails.LstemploymentDetails.forEach(element => {
          element.Id = this.essService.isGuid(element.Id) ? 0 : element.Id;
        });
      }

      this.employeedetails.Gender = this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender as any;

      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;
      console.log('PUT', this.employeedetails);

      if (this.employeedetails.Id > 0) {
        this.saveOrUpdateEmployee();
      }
    } catch (error) {
      console.log('Error:', error);
    }
  }

  saveOrUpdateEmployee(): void {
    const employeeRequestParams = JSON.stringify(this.employeeModel);

    this.employeeService.putEmployeeDetails(employeeRequestParams)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: apiResponse) => {
        this.loadingScreenService.stopLoading();
        if (data.Status) {
          this.SuccessResponse(data);
        } else {
          this.ErrorResponse(data);
        }
      });
  }

  SuccessResponse(data: apiResponse): void {
    this.IsApiTriggered = true;
    this.alertService.showSuccess(data.Message);
    this.GetEmployeeRequiredDetailsById(this.selectedFinYear);
  }

  ErrorResponse(data: apiResponse): void {
    this.alertService.showWarning(data.Message);
  }



  GetEmployeeRequiredDetailsById(currentFinYear) {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments, currentFinYear).subscribe((result) => {
          this.spinner = false;
          const apiR: apiResult = result;
          if (apiR.Status == true) {
            try {
              this.employeedetails = apiR.Result as any;
              this.doRefresh();
            } catch (error) {
              console.log('EXE GET EMP REQUIRED DETAILS (PRV EMP) ::::', error);
            }
          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting an employee details`);
            return;
          }
        }, err => {
          resolve(false);
        });
    });
    return promise;
  }

  close_slider_prevEmp() {
    if (this.IsApiTriggered) {
      this.activeModal.close(this.employeedetails.LstemploymentDetails);
    } else {
      this.activeModal.close('Modal Closed');
    }
  }

  editPreviousEmployment(item): void {
    console.log('item', item);

    const controls = this.employeeForm.controls;
    controls['Id'].setValue(item.Id);
    controls['previousemploymentId'].setValue(item.Id);
    controls['companyName'].setValue(item.CompanyName);
    controls['startdate'].setValue(new Date(item.StartDate));
    controls['enddate'].setValue(new Date(item.EndDate));
    controls['grossSalary'].setValue(item.GrossSalary);
    controls['Prev_Status'].setValue(item.status);
    controls['InputsRemarks'].setValue(item.InputsRemarks);

    controls['previousPT'].setValue(item.PreviousPT);
    controls['previousPF'].setValue(item.PreviousPF);
    controls['taxDeducted'].setValue(item.TaxDeducted);
    controls['Prev_FileName'].setValue(item.FileName);
    controls['Prev_DocumentId'].setValue(item.DocumentId);

    controls['prevEmpIsProposedMode'].setValue(item.IsProposed);
    controls['prevEmpfinancialYear'].setValue(item.FinancialYearId);

    this.IsEditMode = true;
  }

  deletePreviousEmployment(item) {


    if (this.essService.isGuid(item.Id)) {
      var index = this.LstemploymentDetails.indexOf(item);
      if (index !== -1) {
        this.LstemploymentDetails.splice(index, 1);
      }
    } else {
      this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {

        var index = this.LstemploymentDetails.indexOf(item);
        if (index !== -1) {
          const deletingObject = this.employeedetails.LstemploymentDetails.find(a => a.Id == item.Id);
          deletingObject.Modetype = UIMode.Edit;
          deletingObject.Status = 0;
          this.employeedetails.LstemploymentDetails = [];
          this.employeedetails.LstemploymentDetails.push(deletingObject);
          this.doSaveOrSubmit();
        }

      }).catch(cancel => {

      });
    }


  }

  addNewPED() {

    this.createReactiveForm();
    this.IsEditMode = true;

  }
  /* #region  Document Upload/Delete */

  onFileUpload(e, item, layout) {
    // for (var i = 0; i < e.files.length; i++) {
    try {


      this.isLoading = false;
      this.employeeForm.controls['Modetype'].setValue(UIMode.Edit);
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;


      var maxSize = (Math.round(size / 1024) + " KB");
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.docSpinnerText = "Uploading";
        // this.selectedUploadIndex = item.Id;
        let FileUrl = (reader.result as string).split(",")[1];
        // this.doAsyncUpload(FileUrl, file.name, item);
        this.investmentService.doAsyncUpload(FileUrl, file.name, item, this.employeedetails.Id).then((s3DocumentId) => {
          if (typeof s3DocumentId == 'number' && s3DocumentId > 0) {
            console.log('item', item);


            this.employeeForm.controls['Prev_FileName'].setValue(file.name);
            this.employeeForm.controls['Prev_DocumentId'].setValue(s3DocumentId);
            this.employeeForm.controls['Modetype'].setValue(UIMode.Edit);

            this.unsavedDocumentLst.push({
              Id: s3DocumentId
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file!")
          }
          else {
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to delete! ");

          }
        });
      };
    } catch (error) {
      console.log('UPLOAD EXP ::', error);
    }

  }

  doDeleteFile() {
    let photo = {
      DocumentId: this.employeeForm.controls.Prev_DocumentId.value,
      FileName: this.employeeForm.controls.Prev_FileName.value
    }

    // if (photo.Status == 1) {
    //   this.alertService.showWarning("Attention : This action was blocked. One or more attachement cannot be deleted because the status is in an invalid state.");
    //   return;
    // }

    this.alertService.confirmSwal("Are you sure you want to delete?", "This item will be deleted immediately. You can't undo this file.", "Yes, Delete").then(result => {
      this.isLoading = false;

      this.docSpinnerText = "Deleting";
      this.employeeForm.controls['Modetype'].setValue(UIMode.Edit);

      if (!this.essService.isGuid(this.employeeForm.controls.Id.value)) {
        var index = this.unsavedDocumentLst.map(function (el) {
          return el.Id
        }).indexOf(photo.DocumentId)
        this.unsavedDocumentLst.splice(index, 1);

        this.employeeForm.controls['Prev_FileName'].setValue("");
        this.employeeForm.controls['Prev_DocumentId'].setValue(null);
        this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
        this.isLoading = true;
      }
      else {

        this.investmentService.deleteAsync(photo.DocumentId).then((s3DeleteObjectResult) => {

          if (s3DeleteObjectResult == true) {
            var index = this.unsavedDocumentLst.map(function (el) {
              return el.Id
            }).indexOf(photo.DocumentId)
            this.unsavedDocumentLst.splice(index, 1);


            this.employeeForm.controls['Prev_FileName'].setValue("");
            this.employeeForm.controls['Prev_DocumentId'].setValue(null);

            this.isLoading = true;
            this.myInputVariable.nativeElement.value = "";

            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
          } else {
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to delete! ")
          }
        });
      }

    })
      .catch(error => { });

  }

  doViewFile(photo) {

    const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.docsObject = photo;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
    return;
  }

  PermissibleRoles() {
    const authorizedRoles = environment.environment['AuthorizedRolesToAdjustApprovedAmount'];
    return authorizedRoles && authorizedRoles.includes(this.RoleCode) ? true : false;
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
