import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { NgbModalOptions, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionKeys } from '@services/configs/app.config';
import moment from 'moment';
import { NzDrawerRef } from 'ng-zorro-antd';
import { AlertService, SessionStorage, EmployeeService, PagelayoutService, FileUploadService } from 'src/app/_services/service';
import { DataSourceType } from 'src/app/views/personalised-display/enums';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { PreviewdocsModalComponent } from '../previewdocs-modal/previewdocs-modal.component';
import { LoadingScreenService } from '../../components/loading-screen/loading-screen.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { HttpErrorResponse } from '@angular/common/http';
import { isZipFile } from 'src/app/utility-methods/utils';
@Component({
  selector: 'app-resignation-list-details',
  templateUrl: './resignation-list-details.component.html',
  styleUrls: ['./resignation-list-details.component.css']
})
export class ResignationListDetailsComponent implements OnInit, OnDestroy {

  @Input() rowData: any;

  modalOption: NgbModalOptions = {};
  userName: string;
  oldCopyData: any;
  sessionDetails;
  companyId: number;
  userId;
  roleId;
  roleCode;
  empObj;
  ndcDocuments = [];
  imgSrc = '';

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private pageLayoutService: PagelayoutService,
    private fileUploadService: FileUploadService,
    private loadingScreenService: LoadingScreenService
  ) { }

  ngOnInit() {
    
    this.oldCopyData = this.rowData;
    console.log(this.rowData);
    this.rowData.isOpenApproveDrawer = false;
    this.rowData.isOpenRejectDrawer = false;
    this.userName = this.getShortName(this.rowData.EmployeeName);
    this.sessionDetails = JSON.parse(
      this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    ); //
    this.companyId = this.sessionDetails.Company.Id;
    this.userId = this.sessionDetails.UserSession.UserId;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    console.log('rolecode ', this.roleCode);

    if (this.rowData.ResignedOn) {
      this.rowData.ResignedOn = moment(new Date(this.oldCopyData.ResignedOn)).format("DD MMM YYYY");
    }

    if (this.rowData.RequestedRelievingDate) {
      this.rowData.RequestedRelievingDate = moment(new Date(this.oldCopyData.RequestedRelievingDate)).format("DD MMM YYYY");
    }

    if (this.rowData.ValidatedOn) {
      this.rowData.ValidatedOn = moment(new Date(this.oldCopyData.ValidatedOn)).format("DD MMM YYYY");
    }

    if (this.rowData.ApprovedRelievingDate) {
      this.rowData.ApprovedRelievingDate = moment(new Date(this.rowData.ApprovedRelievingDate)).format("DD MMM YYYY");
    }

    if (this.rowData.DOJ) {
      this.rowData.DOJ = moment(new Date(this.rowData.DOJ)).format("DD MMM YYYY");
    }

    if (this.rowData.NDCDocuments != undefined && JSON.parse(this.rowData.NDCDocuments).length > 0) {
      this.ndcDocuments = JSON.parse(this.rowData.NDCDocuments);
    }


  }

  previewImage(documentId, documentName) {
    this.loadingScreenService.startLoading();
    let docId = documentId;
    this.fileUploadService.getObjectById(docId).subscribe((res) => {
      console.log('res ', res);
      
      if (res.Status && res.Result) {
        let imgType = res.Result.Attribute1;
        this.imgSrc = 'data:' + imgType + ';base64,' + res.Result.Content;
        console.log('image src ', this.imgSrc);
        // $('#previewAttachment').modal('show');

        const modalRef = this.modalService.open(PreviewdocsModalComponent)
        modalRef.componentInstance.docsObject = { DocumentId: documentId, FileName: documentName };
        modalRef.componentInstance.employeedetails = { FirstName: this.rowData.EmployeeName, Code: this.rowData.EmployeeCode };
        modalRef.result.then((result) => {
          if (result != "Model Closed") {

          }
        }).catch((error) => {
          console.log(error);
        });
      }
      this.loadingScreenService.stopLoading();
    })
  }

  getShortName(fullName) {
    let name = fullName.replace(/\s/g, "")
    return name.split(' ').map(n => n[0] + n[1]).join('');
  }

  approveResignation() {
    this.rowData.isOpenApproveDrawer = true;
    this.rowData.isOpenRejectDrawer = false;
    this.drawerRef.close(this.rowData);
  }
 
  rejectResignation() {
    this.rowData.isOpenApproveDrawer = false;
    this.rowData.isOpenRejectDrawer = true;
    this.drawerRef.close(this.rowData);
  }

  isZipFile(documentName){
    return isZipFile(documentName);
  }
  

  downloadAttachments(DocumentId, DocumentName) {
    const documentName = DocumentName;
    const documentId = DocumentId;

    this.loadingScreenService.startLoading();
    this.fileUploadService.downloadObjectAsBlob(documentId)
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

          console.log('error',error);
          
          this.loadingScreenService.stopLoading();

          if (error instanceof HttpErrorResponse && error.status === 500) {

          } else {
            this.handleDownloadError();
          }
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


}
