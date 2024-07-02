import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import moment from 'moment';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, FileUploadService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import * as JSZip from 'jszip';
import Swal from 'sweetalert2';
import { ApprovalFor, Approvals, ApproverType } from 'src/app/_services/model/Candidates/CandidateDetails';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';

@Component({
  selector: 'app-onboarding-extended-details',
  templateUrl: './onboarding-extended-details.component.html',
  styleUrls: ['./onboarding-extended-details.component.scss']
})
export class OnboardingExtendedDetailsComponent implements OnInit, OnDestroy {

  spinner: boolean = false;
  @Input() currentRowObject: any;

  DOJMaxDate: Date = new Date();
  DOJMinDate: Date = new Date();
  payperiodEndDate: Date;
  submitted: boolean = false;

  extendedDOJ: Date = null;
  remarks: string = null;
  fileName: string = null;

  BusinessType: number = 0;
  CompanyId: number = 0;
  loginSessionDetails: LoginResponses;

  hasFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];

  isUploadingSpinner: boolean = false;
  uploadingSpinnerText: string = "...";
  supportingDocumentName: string = "";
  private subscriptions = new Subscription();

  approvalsObject: any;
  constructor(
    private fileUploadService: FileUploadService,
    private alertService: AlertService,
    private sessionService: SessionStorage,
    private activeModal: NgbActiveModal,
    private onboardingService: OnboardingService
  ) { }

  // ngOnInit() {

  //   this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
  //   this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
  //   this.CompanyId = this.loginSessionDetails.Company.Id;
  //   if (this.currentRowObject) {
  //     this.GettingExistingCandidateHistory();
  //   }

  // }

  async ngOnInit() {
    this.loginSessionDetails = JSON.parse(await this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    const { Company } = this.loginSessionDetails;
    this.BusinessType = Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == Company.Id) != undefined ? Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == Company.Id).BusinessType || 0 : 0;
    this.CompanyId = Company.Id;
    this.remarks = null;
    if (this.currentRowObject) {
      await this.GettingExistingCandidateHistory();
    }
  }

  async GettingExistingCandidateHistory() {
    this.spinner = true;

    const _candidateId = this.currentRowObject.CandidateId;
    try {
      this.subscriptions = await this.onboardingService.GetCandidateNewDOJRequestHistorybyCandidateId(_candidateId).subscribe((data) => {
        const apiR: apiResult = data
        if (apiR.Status && apiR.Result) {
          console.log('HISTORY RESULT ::', apiR.Result);
          const apiResult: any = JSON.parse(apiR.Result);
          this.payperiodEndDate = apiResult.LstPayperiod.EndDate;
          this.approvalsObject = apiResult.LstApprovals != null && apiResult.LstApprovals.length > 0 &&
            apiResult.LstApprovals.find(a => a.ApprovalFor == ApprovalFor.RequestForNewDOJ) != undefined
            ? apiResult.LstApprovals.find(a => a.ApprovalFor == ApprovalFor.RequestForNewDOJ) : null;
          if (this.approvalsObject) {

            this.generateZipFile(this.approvalsObject);
          }

          if (this.payperiodEndDate) {
            // const new_date = moment(this.payperiodEndDate).add(environment.environment.MaximumExtendedDOJDays, 'days').format("YYYY-MM-DD");
            // this.DOJMaxDate = new Date(new_date.toString());
            const new_date = moment().add(environment.environment.MaximumExtendedDOJDays, 'days').format("YYYY-MM-DD");
            this.DOJMaxDate = new Date(new_date.toString());
            if (moment(new_date).format('YYYY-MM-DD') >= moment(this.payperiodEndDate).format('YYYY-MM-DD')) {
              this.DOJMaxDate = new Date(this.payperiodEndDate);
            }
            console.log('DOJMaxDate', this.DOJMaxDate);
            const new_mindate = moment(this.payperiodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days').format("YYYY-MM-DD");
            this.DOJMinDate = new Date(new_mindate.toString());
            console.log('DOJMinDate', this.DOJMinDate);
          }
          this.spinner = false;
        } else {
          this.spinner = false;
        }


      }, err => {

      });
    } catch (err) {
      console.error(err);
    }
  }

  generateZipFile(approvalsObject) {
    const initialDocumentId = approvalsObject.ObjectStorageId;
    /* #region  AFTER JSZIP */
    if (initialDocumentId) {
      this.uploadingSpinnerText = "Loading";
      try {


        this.fileUploadService.getObjectById(initialDocumentId)
          .subscribe((dataRes) => {
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              return;
            }
            var objDtls = dataRes.Result;
            this.fileList = [];
            this.fileObject = [];
            var fileNameSplitsArray = approvalsObject.DocumentName.split('.');
            var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
            if (ext.toUpperCase().toString() != "ZIP") {
              this.urltoFile(`data:${objDtls.Attribute1};base64,${objDtls.Content}`, objDtls.ObjectName, objDtls.Attribute1)
                .then((file) => {
                  console.log(file);
                  try {
                    this.fileList.push(file)
                    this.hasFileChange = false;
                  } catch (error) {
                    alert((error))
                    console.log('push ex', error);
                  }
                });
            }
            if (ext.toUpperCase().toString() == "ZIP") {
              var zip = new JSZip();
              zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
                Object.keys(contents.files).forEach((filename) => {
                  if (filename) {
                    this.fileList.push(contents.files[filename]);
                    zip.files[filename].async('blob').then((fileData) => {
                      this.fileObject.push(new File([fileData], filename));
                      console.log('fileObject', this.fileObject);
                    });
                  }
                });
              });
            }
          });
      } catch (error) {
        console.log('EDX', error);

      }
    }
  }

  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }



  onAddingFile(e) {

    let files = e.target.files;
    let fileSize: any = 0;
    for (let i = 0; i < files.length; i++) {
      fileSize += files[i].size;
    }
    var compressedFileSize = fileSize / 1024 / 1024;
    if ((compressedFileSize > 2)) {
      this.alertService.showWarning('The attachment size exceeds the allowable limit.');
      return;
    }
    this.fileList.push(...files);
    this.hasFileChange = true;

  }


  doAsyncUpload(filebytes, filename, item, IsCandidate, entityId, objStorageJson) {

    const promise = new Promise((resolve, reject) => {

      try {
        let objStorage = new ObjectStorageDetails();
        objStorage.Id = 0;
        IsCandidate == true ? objStorage.CandidateId = entityId :
          objStorage.EmployeeId = entityId;

        objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
        objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
        objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

        objStorage.ClientContractId = objStorageJson.ClientContractId;
        objStorage.ClientId = objStorageJson.ClientId;
        objStorage.CompanyId = objStorageJson.CompanyId;

        objStorage.Status = true;
        objStorage.Content = filebytes;
        objStorage.SizeInKB = 12;
        objStorage.ObjectName = filename;
        objStorage.OriginalObjectName = filename;
        objStorage.Type = 0;
        objStorage.ObjectCategoryName = "Proofs";



        this.fileUploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
          let apiResult: apiResult = (res);
          try {
            if (apiResult.Status && apiResult.Result != "") {

              resolve(apiResult.Result);
            }
            else {

              this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
              resolve(0);
            }
          } catch (error) {
            this.alertService.showWarning("An error occurred while  trying to upload! " + error);
            resolve(0);
          }
        }), ((err) => {

        })

      } catch (error) {
        this.alertService.showWarning("An error occurred while  trying to upload! " + error);
        resolve(0);
      }
    });
    return promise;

  }



  deleteAsync(DocumentId) {

    const promise = new Promise((resolve, reject) => {
      this.fileUploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status) {
            this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            resolve(true);
          } else {
            this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message);
            resolve(false);
          }
        } catch (error) {

          this.alertService.showWarning("An error occurred while  trying to delete! " + error)
          resolve(false);
        }

      }), ((err) => {

      })
    });
    return promise;

  }

  unsavedDeleteFile(DocumentId) {
    this.fileUploadService.deleteObjectStorage((DocumentId)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {

      } catch (error) {
      }
    }), ((err) => {
    })
  }


  doDeleteFile(file) {

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
      reverseButtons: true
    }).then((result) => {
      if (result.value) {
        this.fileList.splice(this.fileList.indexOf(file), 1);
        this.hasFileChange = true;
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }

  doChangeExtendedDOJ(event) {
    console.log('DOJ NEW :', event);
    this.extendedDOJ = new Date(event);
  }

  onFileUpload() {

    try {


      let fileSize = 0;
      for (let i = 0; i < this.fileList.length; i++) {
        fileSize = Number(fileSize) + this.fileList[i].size
      }
      var FileSize = fileSize / 1024 / 1024;
      var maxfilesize = fileSize / 1024;
      if ((FileSize > 2)) {
        this.isUploadingSpinner = false;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      this.isUploadingSpinner = true;
      this.spinner = true;
      this.uploadingSpinnerText = "Confirming...";

      if (this.hasFileChange && this.fileList.length > 0) {
        var zip = new JSZip();
        var files = this.fileList;
        this.supportingDocumentName = `${this.currentRowObject.CandidateId}_supportingDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
        if (files && files[0]) {
          for (let i = 0; i < files.length; i++) {
            let b: any;
            if (files[i].type) {
              b = new Blob([files[i]], { type: '' + files[i].type + '' });
            } else {
              this.fileObject.forEach(el => {
                if (el.name == files[i].name) {
                  files[i] = el;
                  b = new Blob([files[i]], { type: '' + files[i].type + '' });
                }
              });
            }
            zip.file(files[i].name, b, { base64: true });
          }

          zip.generateAsync({
            type: "base64",
          }).then((_content) => {
            if (_content && this.supportingDocumentName) {
              const objStorageJson = JSON.stringify({ IsCandidate: true, CompanyId: this.CompanyId, ClientId: this.currentRowObject.ClientId, ClientContractId: this.currentRowObject.ClientContractId })
              this.doAsyncUpload(_content, this.supportingDocumentName, this.currentRowObject, true, this.currentRowObject.CandidateId, objStorageJson).then((result) => {

                const approval: Approvals = new Approvals();
                approval.ApprovalFor = ApprovalFor.RequestForNewDOJ;
                approval.Id = 0;
                approval.ApprovalType = ApproverType.Internal;
                approval.DocumentName = this.supportingDocumentName;
                approval.Modetype = UIMode.Edit;
                approval.EntityId = this.currentRowObject.CandidateId;
                approval.EntityType = EntityType.CandidateDetails;
                approval.Remarks = this.remarks;
                approval.ObjectStorageId = Number(result);
                approval.Status = ApprovalStatus.Pending;

                const payload = JSON.stringify(
                  {
                    CandidateId: this.currentRowObject.CandidateId,
                    MPId: this.currentRowObject.Id,
                    FieldName: "PropsedDOJ",
                    ProposedDOJ: moment(this.extendedDOJ).format('YYYY-MM-DD'),
                    Approvals: JSON.stringify(approval),
                    Remarks: this.remarks,

                  })

                console.log('payload :: ', payload);
                // this.spinner = false;
                // return;
                this.onboardingService.UpdateCandidateOfferNewDOJ(payload).subscribe((data) => {
                  console.log('apires :::', data);
                  this.spinner = false;
                  this.activeModal.close('Success');
                }, err => {

                })


                this.isUploadingSpinner = false;
              });
            } else {

            }
          });
        }

      } else {

        console.log('ste', this.approvalsObject);

        const approval: Approvals = new Approvals();
        approval.ApprovalFor = ApprovalFor.RequestForNewDOJ;
        approval.Id = this.approvalsObject.Id;
        approval.ApprovalType = ApproverType.Internal;
        approval.DocumentName = this.approvalsObject.DocumentName;
        approval.Modetype = UIMode.Edit;
        approval.EntityId = this.currentRowObject.CandidateId;
        approval.EntityType = EntityType.CandidateDetails;
        approval.Remarks = this.remarks;
        approval.ObjectStorageId = Number(this.approvalsObject.ObjectStorageId);
        approval.Status = ApprovalStatus.Pending;

        const payload = JSON.stringify(
          {
            CandidateId: this.currentRowObject.CandidateId,
            MPId: this.currentRowObject.Id,
            FieldName: "PropsedDOJ",
            ProposedDOJ:  moment(this.extendedDOJ).format('YYYY-MM-DD'),
            Approvals: JSON.stringify(approval),
            Remarks: this.remarks,

          })

        console.log('payload :: ', payload);
        // this.spinner = false;
        // return;
        this.onboardingService.UpdateCandidateOfferNewDOJ(payload).subscribe((data) => {
          console.log('apires :::', data);
          this.spinner = false;
          this.activeModal.close('Success');
        }, err => {

        })
      }

    }
    catch (error) {
      console.log('confirm button error details : ', error);

    }

  }


  doConfirm_ExtendedDOJ() {
    this.submitted = true;
    if (this.remarks == null || this.remarks == '' || this.fileList.length == 0) {
      return;
    }
    this.onFileUpload();
  }

  doCancel() {
    this.activeModal.close('Modal Closed');
  }

  ngOnDestroy(): void {
    this.currentRowObject = null;
    this.subscriptions.unsubscribe();
  }


}
