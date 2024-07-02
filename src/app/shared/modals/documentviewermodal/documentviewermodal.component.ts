import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ApprovalStatus } from 'src/app/_services/model/OnBoarding/QC';
import { FileUploadService } from 'src/app/_services/service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-documentviewermodal',
  templateUrl: './documentviewermodal.component.html',
  styleUrls: ['./documentviewermodal.component.scss']
})
export class DocumentviewermodalComponent implements OnInit {
  @Input() item: any;
  @Input() type: any;
  @Input() format: any;
  @Input() IsKYCVerified: boolean = false;

  SafeURL: any;
  currentModalItem: any;
  currentModalHeading: any;
  currentModalDetailsFormat: any;
  ApprovalStatusEnumValues: typeof ApprovalStatus = ApprovalStatus;
  
  constructor(
    private activeModal: NgbActiveModal,
    private objectApi: FileUploadService,
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {

    this.currentModalItem = this.item;
    this.currentModalHeading = this.type;
    this.currentModalDetailsFormat = this.format;

    this.SafeURL = null
    var contentType = this.objectApi.getContentType(this.item.DocumentName);
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.objectApi.getObjectById(this.item.ObjectStorageId)
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
            this.SafeURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          }
        });
    }
    else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.objectApi.getUrlToGetObject(this.item.ObjectStorageId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.SafeURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);

    }

  }

  closeModal() {
    this.activeModal.close("Modal Closed");
  }

  validateDocument(requestprocess: boolean) {

    if (requestprocess == false) {
      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: "Rejection Remarks",
        animation: false,
        showCancelButton: false, // There won't be any cancel button
        input: 'textarea',
        inputValue: this.currentModalItem.RejectionRemarks,
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
          this.activeModal.close({ remarks: jsonStr, isApproval: requestprocess });

        } else if (
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {

        }
      })
    }
    else {
      this.activeModal.close({ remarks: "", isApproval: requestprocess });
    }

  }

}
