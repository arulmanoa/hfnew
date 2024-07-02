import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-info-pop-up",
  templateUrl: "./info-pop-up.component.html",
})
export class InfoPopUpComponent implements OnInit {
  @Input() popUpData: any;
  @Input() UserId: number;
  @Input() objStorageJson: any;
  @Input() docConfig: any;
  @Output() docUploadChange = new EventEmitter();
  tooltipText: string = "Upload a Disability Proof as the Percentage is higher than 60";

  constructor(private modalService: NgbModal) {}

  ngOnInit() {}

  action() {
    let modalRef = this.modalService.open(this.popUpData.modalComponent);
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.jsonObj = {
      DocumentName: this.docConfig[0].DocumentTypeName,
      DocumentTypeId: this.docConfig[0].DocumentTypeId,
      IsMandatory: "False",
      IsVerificationRequired: "True",
      IsDateValidationRequired: "False",
      CandidateDocumentId: "0",
      CandidateId: null,
      MaxSize: "2048.00",
      IsAdditionalDocuments: -1,
      IsTaxProof: -1,
      IsIdentity: -1,
      IsAddress: -1,
      IsDisablityProof: 0,
      DocumentId: null,
      CategoryType: this.docConfig[0].ApplicableCategories,
      FileName: null,
      DeletedIds: null,
      ValidTill: null,
      ValidFrom: null,
    };
    modalRef.componentInstance.objStorageJson = this.objStorageJson;
    modalRef.result.then((result) => this.docUploadChange.emit(result));
  }
}
