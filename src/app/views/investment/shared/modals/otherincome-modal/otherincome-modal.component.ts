import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import Swal from 'sweetalert2';

import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { AlertService, EmployeeService, ESSService } from 'src/app/_services/service';
import { environment } from 'src/environments/environment';
import moment from 'moment';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { UIMode } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { EmployeeInvestmentDeductions, EmployeeInvestmentDocuments, InvestmentLogHistory } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';
import { E, I, X, Z } from '@angular/cdk/keycodes';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { apiResult } from 'src/app/_services/model/apiResult';
import _ from 'lodash';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { EmployeeExemptionDetails } from 'src/app/_services/model/Employee/EmployeeExcemptions';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { EmployeeExemptionBillDetails, EmployeeTaxExemptionDetails } from 'src/app/_services/model/Employee/EmployeeTaxExemptionDetails';
import { EmployeePerquisitesDetails } from 'src/app/_services/model/Employee/EmployeePerquisitesDetails';
import { EmployeeOtherIncomeSources, InterestIncomeType } from 'src/app/_services/model/Employee/EmployeeOtherIncomeSources';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';

@Component({
  selector: 'app-otherincome-modal',
  templateUrl: './otherincome-modal.component.html',
  styleUrls: ['./otherincome-modal.component.scss']
})
export class OtherincomeModalComponent implements OnInit {

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

  EmployeeId: any = 0;
  employeeModel: EmployeeModel = new EmployeeModel();

  DeclarationItems = [];
  selectedUploadIndex: number;
  interestIncomeType: any = [];
  LstemployeeOtherIncomeSources: EmployeeOtherIncomeSources[] = [];

  IsApiTriggered: boolean = false;
  IsFailedToValidate: boolean = false;

  TotalDeclaredAmount: number = 0;
  TotalApprovedAmount: number = 0;

  isLoading: boolean = true;
  docSpinnerText: string = "Uploading";
  unsavedDocumentLst = [];
  modalOption: NgbModalOptions = {};
  InvestmentWarningMessage = environment.environment.InvestmentWarningMessage;
  
  constructor(
    private alertService: AlertService,
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private loadingScreenService: LoadingScreenService,
    private essService: ESSService,
    private employeeService: EmployeeService,
    private investmentService: InvestmentService,
    private utilityService: UtilityService,
    private modalService: NgbModal,
    private utilsHelper: enumHelper
  ) { }

  ngOnInit() {
    this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
    if (this.EmployeeId == 0) {
      this.close_slider_otherincome();
      return;
    }

    this.interestIncomeType = this.utilsHelper.transform(InterestIncomeType);
    this.onRefresh();
  }

  onRefresh() {
    this.DeclarationItems = [];
    this.doPushOldDeclarationData();
  }


  doPushOldDeclarationData() {

    this.employeedetails.LstemployeeOtherIncomeSources != null && this.employeedetails.LstemployeeOtherIncomeSources.length > 0 &&
      this.employeedetails.LstemployeeOtherIncomeSources.forEach(elem => {

        if (elem.FinancialYearId == this.selectedFinYear) {

          this.DeclarationItems.push({
            Declarations: null,
            DeclaredAmount: elem.InterestIncomeType == 3 ? elem.OtherIncomeAmount : elem.TotalInterestAmount,
            DeclaredAmountRemarks: elem.InputsRemarks,
            DeclarationAttachments: elem.DocumentId > 0 ? [{
              FileName: elem.FileName,
              DocumentId: elem.DocumentId,
              Status: 0,
              ApprovedAmount: 0
            }] : [],
            Id: elem.Id,
            ApprovedAmount: elem.InterestIncomeType == 3 ? elem.ApprovedOtherIncomeAmount : elem.TotalApprovedInterestAmount,
            Status: elem.Status,
            IsError: false,
            Modetype: UIMode.None,
            IsDeleted: false,
            IsProposed: elem.IsProposed,
            ApproverRemarks: elem.ApproverRemarks,
            ActualStatus: elem.Status,
            InterestIncomeType: elem.InterestIncomeType
          })

        }
      });

    console.log('DeclarationItems >>>>>>>>>>>', this.DeclarationItems);

    this.TotalDeclaredAmount = 0;
    for (let k = 0; k < this.DeclarationItems.length; k++) {
      const element = this.DeclarationItems[k];
      if (element.IsDeleted == false && (element.Modetype == UIMode.Edit || element.Modetype == UIMode.None)) {
        this.TotalDeclaredAmount = Number(this.TotalDeclaredAmount) + Number(element.DeclaredAmount);
      }

    }

  }


  addItem(item): void {

    this.DeclarationItems.push({
      Declarations: item,
      DeclaredAmount: 0,
      DeclaredAmountRemarks: "",
      DeclarationAttachments: [],
      Id: UUID.UUID(),
      ApprovedAmount: 0, // INITIAL AMOUNT 
      Status: 0, // PENDING,
      IsError: false,
      Modetype: UIMode.Edit,
      IsDeleted: false,
      IsProposed: this.currentTaxMode == 1 ? true : false,
      ApproverRemarks: "",
      ActualStatus: 1,
      InterestIncomeType: null
    })
  }

  onChangeInterestIncomeType(event, item) {
    item.Modetype = UIMode.Edit;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
  }
  onChangeDeclaredAmount(item) {

    item.Modetype = UIMode.Edit;
    this.TotalDeclaredAmount = 0;
    for (let k = 0; k < this.DeclarationItems.length; k++) {
      const element = this.DeclarationItems[k];
      if (element.IsDeleted == false && (element.Modetype == UIMode.Edit || element.Modetype == UIMode.None)) {
        this.TotalDeclaredAmount = Number(this.TotalDeclaredAmount) + Number(element.DeclaredAmount);
      }

    }
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
  }

  onChangeApprovedAmount(item) {

    item.Modetype = UIMode.Edit;   
    item.Status = 1;
  }

  OnChangeInvestmentProducts(item) {
    item.Modetype = UIMode.Edit;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.Status = 0 : true;
    !this.investmentService.PermissibleRoles(this.RoleCode) ? item.ApprovedAmount = 0 : true;
  }

  deleteInvestmentProduct(item) {


    if (this.essService.isGuid(item.Id)) {
      var index = this.DeclarationItems.indexOf(item);
      if (index !== -1) {
        this.DeclarationItems.splice(index, 1);
      }
    } else {
      this.alertService.confirmSwal("Are you sure?", "This item will be deleted immediately. You can't undo this record.", "Ok").then((result) => {

        item.IsDeleted = true;
        item.Modetype = UIMode.Delete;
        console.log('DeclarationItems :::::::::::', this.DeclarationItems);
        this.TotalDeclaredAmount = this.TotalDeclaredAmount > 0 ? Number(this.TotalDeclaredAmount) - Number(item.DeclaredAmount) : 0

      }).catch(cancel => {

      });
    }


  }



  doMapInvestmentLogHistory(item, Amount, Remarks, ApprovedAmount, ApproverRemarks, sectionName) {
    let LstLogHistory = [];
    let isNewRecord: boolean = false;
    if (item.Id == 0) {
      isNewRecord = true;
    } else {
      isNewRecord = false;
      if (sectionName == 'OTHER') {
        LstLogHistory = this.employeedetails.LstemployeeOtherIncomeSources != null &&
          this.employeedetails.LstemployeeOtherIncomeSources.length > 0 &&
          this.employeedetails.LstemployeeOtherIncomeSources.filter(z => z.Id == item.Id).length > 0 &&
          this.employeedetails.LstemployeeOtherIncomeSources.find(z => z.Id == item.Id).LstInvestmentLogHistory != null ? this.employeedetails.LstemployeeOtherIncomeSources.find(z => z.Id == item.Id).LstInvestmentLogHistory : [];

      }
    }
    LstLogHistory = LstLogHistory == null ? [] : LstLogHistory;
    var investmentLogHistory = new InvestmentLogHistory();
    investmentLogHistory.DeclaredAmount = Amount;
    investmentLogHistory.DeclaredRemarks = Remarks;
    investmentLogHistory.DeclaredBy = this.UserId;
    investmentLogHistory.DeclaredOn = moment(new Date()).format('YYYY-MM-DD');
    investmentLogHistory.ApprovedAmount = ApprovedAmount == null ? 0 : ApprovedAmount;
    investmentLogHistory.ApproverRemarks = ApproverRemarks == null ? "" : ApproverRemarks;
    investmentLogHistory.ApprovedBy = this.investmentService.PermissibleRoles(this.RoleCode) ? this.UserId : 0;
    investmentLogHistory.ApprovedOn = this.investmentService.PermissibleRoles(this.RoleCode) ? moment(new Date()).format('YYYY-MM-DD HH:mm:ss') : null;

    LstLogHistory.push(investmentLogHistory);
    return LstLogHistory;
  }


  doPushNewDeclarationData() {
    try {

      this.LstemployeeOtherIncomeSources = [];
      this.DeclarationItems.forEach(item => {
        var empInvestmentDeduction = new EmployeeOtherIncomeSources();
        empInvestmentDeduction.EmployeeId = this.EmployeeId;
        empInvestmentDeduction.FinancialYearId = this.selectedFinYear;
        empInvestmentDeduction.TotalInterestAmount = item.InterestIncomeType == 3 ? 0 : item.DeclaredAmount;
        empInvestmentDeduction.OtherIncomeAmount = item.InterestIncomeType == 3 ? item.DeclaredAmount : 0;
        empInvestmentDeduction.InterestIncomeType = item.InterestIncomeType;
        empInvestmentDeduction.TotalApprovedInterestAmount =  item.DeclarationAttachments.length > 0 && item.DeclarationAttachments[0].DocumentId > 0 ? (this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? item.DeclaredAmount : item.InterestIncomeType == 3 ? 0 : item.ApprovedAmount) : 0;
        empInvestmentDeduction.ApprovedOtherIncomeAmount = item.DeclarationAttachments.length > 0 && item.DeclarationAttachments[0].DocumentId > 0 ?(this.essService.isGuid(item.Id) && this.investmentService.PermissibleRoles(this.RoleCode) ? item.DeclaredAmount : item.InterestIncomeType == 3 ? item.ApprovedAmount : 0) : 0;
        empInvestmentDeduction.InputsRemarks = item.DeclaredAmountRemarks;
        empInvestmentDeduction.ApproverRemarks = item.ApproverRemarks;
        empInvestmentDeduction.IsProposed = item.DeclarationAttachments.length > 0 && item.DeclarationAttachments[0].DocumentId > 0 ? false : true;

        empInvestmentDeduction.Status = this.investmentService.PermissibleRoles(this.RoleCode) ? 1 : 0;
        empInvestmentDeduction.DocumentId =  item.DeclarationAttachments.length > 0 ? item.DeclarationAttachments[0].DocumentId : 0;
        empInvestmentDeduction.FileName = item.DeclarationAttachments.length > 0 ? item.DeclarationAttachments[0].FileName : "";
        empInvestmentDeduction.Modetype = item.Modetype;
        empInvestmentDeduction.Id = this.essService.isGuid(item.Id) == true ? 0 : item.Id;
        empInvestmentDeduction.LstInvestmentLogHistory = this.doMapInvestmentLogHistory(item, (item.InterestIncomeType == 3 ? item.DeclaredAmount : item.DeclaredAmount), item.DeclaredAmountRemarks,  item.ApprovedAmount, item.ApproverRemarks, 'OTHER');

        this.LstemployeeOtherIncomeSources.push(empInvestmentDeduction)
      });

      this.employeedetails.LstemployeeOtherIncomeSources = this.LstemployeeOtherIncomeSources;
      this.finalSave();

    } catch (err) {
      console.log('INVESTMENT EXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
      this.loadingScreenService.stopLoading();
    }

  }

  saveDeclarations() {

    let DoesErrorOccurred: boolean = false;
    this.IsFailedToValidate = false;

    if (this.DeclarationItems.length == 0) {
      this.alertService.showInfo(`To continue, please add at least one item. `);
      return;
    }

    this.DeclarationItems.forEach(obj => {
      if (!obj.IsDeleted) {
        if (obj.DeclaredAmount == 0 || obj.DeclaredAmount == null || obj.DeclaredAmount == undefined || obj.DeclaredAmount == '') {
          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        if (obj.InterestIncomeType == 0 || obj.InterestIncomeType == null || obj.InterestIncomeType == undefined || obj.InterestIncomeType == '') {
          obj.IsError = true;
          DoesErrorOccurred = true;
        }
        if (!obj.IsProposed && obj.DeclarationAttachments.length == 0) {
          obj.IsError = true;
          DoesErrorOccurred = true;
        }
      }
    });

    if (DoesErrorOccurred) {
      this.IsFailedToValidate = true;
      return;
    }

    this.loadingScreenService.startLoading();
    this.doPushNewDeclarationData();


  }

  finalSave() {
    try {

      this.employeedetails.EmploymentContracts[0].IsNewTaxRegimeOpted = this.IsNewTaxRegimeOpted;


      this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.oldobj = this.employeedetails;
      this.employeeModel.newobj = this.employeedetails;
      console.log('Employee Details ::', this.employeedetails);
      // this.loadingScreenService.stopLoading();
      // return;
      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.UpsertEmployeeInvestmentDetails(Employee_request_param).subscribe((data: any) => {
          console.log('RESULT >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.', data);
          this.IsApiTriggered = true;

          if (data.Status) {
            this.close_slider_otherincome();
          }
          else {
            this.alertService.showWarning(data.Message);
          }

          this.loadingScreenService.stopLoading();
        },
          (err) => {

            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          });

      }

    } catch (err) {
      console.log('SAVEVEXCEPTION ERROR ::', err);
      this.alertService.showWarning(`Something doesn't add up. ${err}`);
    }
  }

  close_slider_otherincome() {
    if (this.IsApiTriggered) {
      this.activeModal.close('Done');
    } else {
      this.activeModal.close('Modal Closed');
    }
  }
  /* #region  Document Upload/Delete */

  onFileUpload(e, item, layout) {
    // for (var i = 0; i < e.files.length; i++) {
    this.isLoading = false;
    item.Modetype = UIMode.Edit;
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
      this.selectedUploadIndex = item.Id;
      let FileUrl = (reader.result as string).split(",")[1];
      // this.doAsyncUpload(FileUrl, file.name, item);
      this.investmentService.doAsyncUpload(FileUrl, file.name, item, this.employeedetails.Id).then((s3DocumentId) => {
        if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
          console.log('item', item);

          let LstAttachments = [{
            FileName: file.name,
            DocumentId: s3DocumentId,
            Status: 0,
            ApprovedAmount: 0
          }];

          item.Status = 0;
          item.Modetype = UIMode.Edit;
          item.DeclarationAttachments = item.DeclarationAttachments.concat(LstAttachments);
          item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
            e1.Status = 0;
            e1.ApprovedAmount = 0;
          });

          item.Status = 0;
          item.ApprovedAmount = 0;

          this.unsavedDocumentLst.push({
            Id: s3DocumentId
          })
          this.isLoading = true;
          this.alertService.showSuccess("You have successfully uploaded this file!")
          this.selectedUploadIndex = null;
        }
        else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! ");

        }
      });
    };

  }

  doDeleteFile(item, photo, layout) {

    // if (photo.Status == 1) {
    //   this.alertService.showWarning("Attention : This action was blocked. One or more attachement cannot be deleted because the status is in an invalid state.");
    //   return;
    // }

    this.alertService.confirmSwal("Are you sure you want to delete?", "This item will be deleted immediately. You can't undo this file.", "Yes, Delete").then(result => {
      this.isLoading = false;


      this.docSpinnerText = "Deleting";
      this.selectedUploadIndex = item.Id;
      item.Modetype = UIMode.Edit;

      if (!this.essService.isGuid(item.Id)) {
        var index = this.unsavedDocumentLst.map(function (el) {
          return el.Id
        }).indexOf(photo.DocumentId)
        this.unsavedDocumentLst.splice(index, 1);

        var index1 = item.DeclarationAttachments.map(function (el) {
          return el.DocumentId
        }).indexOf(photo.DocumentId)
        item.DeclarationAttachments.splice(index1, 1)
        item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
          e1.Status = 0;
          e1.ApprovedAmount = 0;
        });

        item.Status = 0;
        item.ApprovedAmount = 0;
        this.selectedUploadIndex = null;
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

            var index1 = item.DeclarationAttachments.map(function (el) {
              return el.DocumentId
            }).indexOf(photo.DocumentId)
            item.DeclarationAttachments.splice(index1, 1)
            item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
              e1.Status = 0;
              e1.ApprovedAmount = 0;
            });

            item.Status = 0;
            item.ApprovedAmount = 0;
            this.selectedUploadIndex = null;
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

  doViewFile(item, photo, layout) {

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
    return this.investmentService.PermissibleRoles(this.RoleCode) ? true : false;
  }
}
