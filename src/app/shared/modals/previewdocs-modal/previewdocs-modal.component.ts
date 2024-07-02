import { Component, OnInit, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, SessionStorage } from 'src/app/_services/service';

@Component({
  selector: 'app-previewdocs-modal',
  templateUrl: './previewdocs-modal.component.html',
  styleUrls: ['./previewdocs-modal.component.css']
})
export class PreviewdocsModalComponent implements OnInit {
  @Input() docsObject: any;
  @Input() employeedetails: EmployeeDetails;
  documentURL = null;
  documentURLId = null;
  constructor(
    public fileuploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private activeModal: NgbActiveModal,

  ) { }

  ngOnInit() {
    console.log('docsObject',this.docsObject);
    try {
      
    
    var item = this.docsObject;
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.DocumentId;
    var contentType = this.fileuploadService.getContentType(item.FileName)
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileuploadService.getObjectById(item.DocumentId)
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
            this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);

          }
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    } else if (contentType === 'application/vnd.ms-powerpoint' || contentType === 'application/vnd.openxmlformats-officedocument.presentationml.presentation'){
      let appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
      let unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      console.log(appUrl, unsurl)
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }
  } catch (error) {

  }
  }

  closeModal() {
    this.activeModal.close('Modal Closed');
  }

}
