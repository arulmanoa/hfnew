import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbActiveModal, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
import { UIMode } from 'src/app/_services/model';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { AlertService, ESSService } from 'src/app/_services/service';
import { InvestmentService } from 'src/app/_services/service/investments.service';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-manageinvestment',
  templateUrl: './manageinvestment.component.html',
  styleUrls: ['./manageinvestment.component.scss']
})
export class ManageinvestmentComponent implements OnInit {

  @ViewChild('myInput')
  myInputVariable: ElementRef;


  @Input() item: any;
  @Input() employeedetails: EmployeeDetails;
  @Input() currentTaxMode: number;
  @Input() TotalDeclaredAmount: number;
  @Input() isPanMandatoryForHRA: boolean;
  @Input() RoleCode : string;
  // DeclarationAttachments = [];
  // RentalHouseAddress : string = "";
  // AddressOfLandlord : string ="";
  // NameOfLandlord : string ="";
  // PANOfLandlord : string ="";

  isLoading: boolean = true;
  docSpinnerText: string = "Uploading";
  selectedUploadIndex: number;
  unsavedDocumentLst = [];

  DoesValidatioFailed: boolean = false;
  ValidationFailedMessage: string = "";

  isEditable: boolean = false;
  StatusNumber: number = 0;

  modalOption: NgbModalOptions = {};

  constructor(
    private investmentService: InvestmentService,
    private alertService: AlertService,
    private activeModal: NgbActiveModal,
    private utilityService: UtilityService,
    private essService: ESSService,
    private modalService: NgbModal


  ) { }

  ngOnInit() {
    console.log('item', this.item);
    if (this.item.PANOfLandlord) {
      this.item.PANOfLandlord = this.item.PANOfLandlord.toUpperCase();
    }

    this.StatusNumber = this.getDocumentStatus(this.item.DeclarationAttachments);
    this.isEditable = (this.StatusNumber == 3 || this.StatusNumber == 1) ? true : false

  }

  getDocumentStatus(lstDocument) {
    return lstDocument != null && lstDocument.length > 0 && (lstDocument.filter(a => a.Status == 1 && a.Status == 2).length > 0)
      ? 3 : (lstDocument.filter(a => a.Status == 1).length > 0) ? 1 : (lstDocument.filter(a => a.Status == 2).length > 0) ? 2 : 0

  }

  onChangePAN(event, item) {
    item.Modetype = UIMode.Edit;
  }

  UpdateLandlordDetails() {

    if (this.item.PANOfLandlord) {
      const panRegex = /^([a-zA-Z]){3}([pPcCHhaAbBgGlLfFTtjJ]){1}([a-zA-Z]){1}([0-9]){4}([a-zA-Z]){1}?$/;
      const checkPanValid = panRegex.test(this.item.PANOfLandlord);
      console.log('vvv', checkPanValid);
      if (!checkPanValid) {
        return this.alertService.showWarning("Please match the requested format. (Ex: ABCPD1234E)");
      }
    }

    if (this.TotalDeclaredAmount >= environment.environment.HRAMaximumAmountForValidation && (this.item.PANOfLandlord == null || this.item.PANOfLandlord == '' || this.item.PANOfLandlord == undefined)) {
      this.DoesValidatioFailed = true;
      this.ValidationFailedMessage = "According to a government notification, Reporing Landlord's PAN is mandatory. If rent paid exceeds. Rs." + environment.environment.HRAMaximumAmountForValidation + " pa."
      return;
    }

    console.log('dddd', this.item.PANOfLandlord);

    if(this.item.DeclarationAttachments != null && this.item.DeclarationAttachments.length > 0){
      this.item.DeclarationAttachments.forEach(e1 => {
        // if(e1.Status == 2){
          !this.investmentService.PermissibleRoles(this.RoleCode) ? e1.Status = 0 : e1.Status = 1;
          !this.investmentService.PermissibleRoles(this.RoleCode) ?    this.item.Status = 0 : this.item.Status = 1;
        // }        
      });
    }
   !this.investmentService.PermissibleRoles(this.RoleCode) ?  this.item.ApprovedAmount = 0 : true;
    this.item.Modetype = UIMode.Edit;
    this.activeModal.close(this.item);
  }

  doFieldValidation(column) {

    return this.DoesValidatioFailed && (column == null || column == '' || column == undefined) ? true : false;
  }

  confirmExit() {
    this.activeModal.close('Modal Closed');
  }

  isGuidId(Id){
    return this.essService.isGuid(Id);
  }
 

  PermissibleRoles() {
    const authorizedRoles = environment.environment['AuthorizedRolesToAdjustApprovedAmount'];
    return authorizedRoles && authorizedRoles.includes(this.RoleCode) ? true : false;
  }



  onFileUpload(e, item) {
    console.log('item HR', item);
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
        this.docSpinnerText = "Uploading";
        this.selectedUploadIndex = item.Id;
        let FileUrl = (reader.result as string).split(",")[1];
        // this.doAsyncUpload(FileUrl, file.name, item);
        this.investmentService.doAsyncUpload(FileUrl, file.name, item, this.employeedetails.Id).then((s3DocumentId) => {
          if (typeof s3DocumentId === 'number' && s3DocumentId > 0) {
            let LstAttachments = [{
              FileName: file.name,
              DocumentId: s3DocumentId,
              Status: 0,
              ApprovedAmount: 0
            }];
            item.DeclarationAttachments = item.DeclarationAttachments.concat(LstAttachments);
            this.unsavedDocumentLst.push({
              Id: s3DocumentId
            });
            item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
              e1.Status = 0;
              e1.ApprovedAmount = 0;
            });
            item.Modetype = UIMode.Edit;
            console.log('item HR 5', item);
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
      // item.Modetype = UIMode.Edit;
      if (!this.essService.isGuid(item.Id)) {
        // var index = this.unsavedDocumentLst.map(function (el) {
        //   return el.Id
        // }).indexOf(photo.DocumentId)
        // this.unsavedDocumentLst.splice(index, 1);

        var index1 = item.DeclarationAttachments.map(function (el) {
          return el.DocumentId
        }).indexOf(photo.DocumentId)
        item.DeclarationAttachments.splice(index1, 1);

        item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
          e1.Status = 0;
          e1.ApprovedAmount = 0;
        });

        this.selectedUploadIndex = null;
        this.isLoading = true;
        this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
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
            item.DeclarationAttachments.splice(index1, 1);
            item.DeclarationAttachments != null && item.DeclarationAttachments.length > 0 && item.DeclarationAttachments.forEach(e1 => {
              e1.Status = 0;
              e1.ApprovedAmount = 0;
            });

            this.selectedUploadIndex = null;
            this.isLoading = true;
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
            this.myInputVariable.nativeElement.value = "";
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
    // return;
  }


}
