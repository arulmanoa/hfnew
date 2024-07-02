import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
import * as JSZip from 'jszip';

// services 
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';

import * as _ from 'lodash';
import { apiResult } from '../../../_services/model/apiResult';
import { BankInfo, BankList } from '../../../_services/model/OnBoarding/BankInfo';
import { apiResponse } from 'src/app/_services/model/apiResponse';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { ApprovalFor, ApproverType } from 'src/app/_services/model/Candidates/CandidateDetails';
import { enumHelper } from '../../directives/_enumhelper';
import { MigrationInfo, ManagerList, LeaveGroupList, CostCodeList } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { LetterTemplateList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { CommonService } from '@services/service';
@Component({
  selector: 'app-approval-modal',
  templateUrl: './approval-modal.component.html',
  styleUrls: ['./approval-modal.component.scss']
})
export class ApprovalModalComponent implements OnInit {

  @Input() id: number;
  @Input() UserId: number;
  @Input() RequestType: any;
  @Input() objStorageJson: any;
  @Input() jsonObj: any;
  @Input() LstClientApproval: any;
  @Input() OnboardingMode: number = 1;
  @Input() ContractCode: any;


  approvalForm: FormGroup;

  submitted = false;
  disableBtn = false;
  MenuId: any;

  ApprovalForList: any = [];
  Global_ApprovalList: any = [];
  ApprovalTypeList: any = [];


  FileName: any;
  unsavedDocumentLst = [];

  isLoading: boolean = true;
  spinnerText: string = "Uploading";

  firstTimeDocumentId: any;
  popupId: any;
  _loginSessionDetails: LoginResponses;
  BusinessType: number;
  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];

  RoleCode: string = "";
  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private onboardingService: OnboardingService,
    public fileuploadService: FileUploadService,
    private utilsHelper: enumHelper,
    private commonService: CommonService

  ) {
    this.createForm();
  }

  get g() { return this.approvalForm.controls; } // reactive forms validation 

  createForm() {

    this.approvalForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      ApprovalFor: [null, Validators.required],
      ApprovalType: [null, Validators.required],
      DocumentName: ['', Validators.required],
      ObjectStorageId: ['', Validators.required],
      IsApproved: [true],
      Status: [0],
      Remarks: [''],
      IsDocumentDelete: [false], // extra prop
      ApprovalForName: [''],
      ApprovalTypeName: [''],
      ContractCode: ['']

    });
  }


  /* #region  ngOnInit Initialization -PRE Loading */
  ngOnInit() {

    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.RoleCode == 'RegionalHR' ?
      this.commonService.updateValidation(true, this.approvalForm.get('Remarks')) :
      this.commonService.updateValidation(false, this.approvalForm.get('Remarks'));

    this.objStorageJson = JSON.parse(this.objStorageJson);
    this.approvalForm.valueChanges
      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });
    try {
      let mode = this.id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (error) {

    }

    console.log(this.jsonObj, 'sdfds');


    this.ApprovalForList = this.utilsHelper.transform(ApprovalFor);
    this.Global_ApprovalList = this.utilsHelper.transform(ApprovalFor);
    // this.ApprovalForList = this.ApprovalForList.filter(a => a.id != 2);
    this.ApprovalTypeList = this.utilsHelper.transform(ApproverType);

    this.ApprovalForList = this.RequestType == 1 ? this.ApprovalForList.filter(a => a.id != 2) : this.RequestType == 2 ? this.ApprovalForList.filter(a => a.id != 1 && a.id != 2) : this.ApprovalForList;

    console.log('approval For', this.ApprovalForList);

    this.popupId = (this.approvalForm.get('Id').value);
    if (this.jsonObj) {

      this.popupId = this.jsonObj.Id;
      this.firstTimeDocumentId = this.jsonObj.ObjectStorageId;
      /* #region  AFTER JSZIP */
      if (this.firstTimeDocumentId) {
        this.spinnerText = "Loading";
        try {


          this.fileuploadService.getObjectById(this.firstTimeDocumentId)
            .subscribe((dataRes) => {
              if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
                return;
              }
              var objDtls = dataRes.Result;
              this.fileList = [];
              this.fileObject = [];
              var fileNameSplitsArray = this.jsonObj.FileName.split('.');
              var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
              if (ext.toUpperCase().toString() != "ZIP") {
                this.urltoFile(`data:${objDtls.Attribute1};base64,${objDtls.Content}`, objDtls.ObjectName, objDtls.Attribute1)
                  .then((file) => {
                    console.log(file);
                    try {
                      this.fileList.push(file)
                      this.isFileChange = false;
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
      /* #endregion */
      this.FileName = this.jsonObj.DocumentName;


      this.approvalForm.patchValue(this.jsonObj);

    }

  }


  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }

  /* #endregion */


  /* #region  File upload using object stroage (S3) */
  /* #region  BEFORE JSZIP */

  // onFileUpload(e) {

  //   this.approvalForm.get('ObjectStorageId').valid;

  //   this.isLoading = false;
  //   if (e.target.files && e.target.files[0]) {

  //     const file = e.target.files[0];
  //     const pattern = /image-*/;
  //     var type = e.target.files[0].type;
  //     var size = e.target.files[0].size;
  //     var maxSize = (Math.round(size / 1024) + " KB");
  //     console.log(maxSize);
  //     var FileSize = e.target.files[0].size / 1024 / 1024;
  //     if (FileSize > 2) {
  //       this.isLoading = true;
  //       this.alertService.showWarning('The attachment size exceeds the allowable limit.');
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       this.spinnerText = "Uploading";
  //       this.FileName = file.name;
  //       this.approvalForm.controls['DocumentName'].setValue(file.name);
  //       let FileUrl = (reader.result as string).split(",")[1];
  //       this.doAsyncUpload(FileUrl, this.FileName)

  //     };
  //   }
  // }

  // doAsyncUpload(filebytes, filename) {


  //   try {
  //     let objStorage = new ObjectStorageDetails();
  //     objStorage.Id = 0;
  //     objStorage.CandidateId = this.objStorageJson.CandidateId;
  //     objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
  //     objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
  //     objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
  //     objStorage.ClientContractId = this.objStorageJson.ClientContractId;
  //     objStorage.ClientId = this.objStorageJson.ClientId;
  //     objStorage.CompanyId = this.objStorageJson.CompanyId;

  //     objStorage.Status = true;
  //     objStorage.Content = filebytes;
  //     objStorage.SizeInKB = 12;
  //     objStorage.ObjectName = filename;
  //     objStorage.OriginalObjectName = filename;
  //     objStorage.Type = 0;
  //     objStorage.ObjectCategoryName = "Proofs";

  //     this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
  //       let apiResult: apiResult = (res);
  //       try {
  //         if (apiResult.Status && apiResult.Result != "") {

  //           this.approvalForm.controls['ObjectStorageId'].setValue(apiResult.Result);
  //           this.approvalForm.controls['IsDocumentDelete'].setValue(false);
  //           this.unsavedDocumentLst.push({
  //             Id: apiResult.Result
  //           })
  //           this.isLoading = true;
  //           this.alertService.showSuccess("You have successfully uploaded this file")

  //         }
  //         else {
  //           this.FileName = null;
  //           this.approvalForm.controls['DocumentName'].setValue(null);
  //           this.isLoading = true;
  //           this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
  //         }
  //       } catch (error) {
  //         this.FileName = null;
  //         this.approvalForm.controls['DocumentName'].setValue(null);
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while  trying to upload! " + error)
  //       }

  //     }), ((err) => {

  //     })

  //     console.log(objStorage);
  //   } catch (error) {
  //     this.FileName = null;
  //     this.approvalForm.controls['DocumentName'].setValue(null);
  //     this.alertService.showWarning("An error occurred while  trying to upload! " + error)
  //     this.isLoading = true;
  //   }

  // }
  // /* #endregion */

  // /* #region  File delete object stroage (S3) */

  // doDeleteFile() {

  //   const swalWithBootstrapButtons = Swal.mixin({
  //     customClass: {
  //       confirmButton: 'btn btn-primary',
  //       cancelButton: 'btn btn-danger'
  //     },
  //     buttonsStyling: true,
  //   })

  //   swalWithBootstrapButtons.fire({
  //     title: 'Are you sure you want to delete?',
  //     text: "This item will be deleted immediately. You can't undo this file.",
  //     type: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'Ok!',
  //     cancelButtonText: 'No, cancel!',
  //     reverseButtons: true
  //   }).then((result) => {
  //     console.log(result);

  //     if (result.value) {

  //       if (this.isGuid(this.popupId)) {

  //         this.deleteAsync();
  //       }
  //       else if (this.firstTimeDocumentId != this.approvalForm.get('ObjectStorageId').value) {


  //         this.deleteAsync();

  //       }

  //       else {


  //         this.FileName = null;
  //         this.approvalForm.controls['IsDocumentDelete'].setValue(true);
  //         this.approvalForm.controls['DocumentName'].setValue(null);

  //       }
  //     } else if (result.dismiss === Swal.DismissReason.cancel) {

  //       swalWithBootstrapButtons.fire(
  //         'Cancelled',
  //         'Your request has been cancelled',
  //         'error'
  //       )
  //     }
  //   })

  // }

  // deleteAsync() {


  //   this.isLoading = false;
  //   this.spinnerText = "Deleting";


  //   this.fileuploadService.deleteObjectStorage((this.approvalForm.get('ObjectStorageId').value)).subscribe((res) => {
  //     console.log(res);
  //     let apiResult: apiResult = (res);
  //     try {
  //       if (apiResult.Status) {

  //         //search for the index.
  //         var index = this.unsavedDocumentLst.map(function (el) {
  //           return el.Id
  //         }).indexOf(this.approvalForm.get('ObjectStorageId').value)

  //         // Delete  the item by index.
  //         this.unsavedDocumentLst.splice(index, 1)
  //         this.approvalForm.controls['ObjectStorageId'].setValue(null);
  //         this.approvalForm.controls['DocumentName'].setValue(null);
  //         this.FileName = null;
  //         this.isLoading = true;
  //         this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
  //       } else {
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
  //       }
  //     } catch (error) {

  //       this.alertService.showWarning("An error occurred while trying to delete! " + error)
  //     }

  //   }), ((err) => {

  //   })

  // }


  /* #endregion */
  /* #endregion */

  /* #region  AFTER JSZIP */

  onAddingFile(e) {
    let files = e.target.files;
    let fileSize = 0;
    for (let i = 0; i < files.length; i++) {
      fileSize = Number(fileSize) + files[i].size
    }
    var FileSize = fileSize / 1024 / 1024;
    var maxfilesize = fileSize / 1024;
    if ((FileSize > 2)) {
      this.isLoading = true;
      this.alertService.showWarning('The attachment size exceeds the allowable limit.');
      return;
    }

    for (let i = 0; i < files.length; i++) {
      this.fileList.push(files[i]);
    }
    this.isFileChange = true;
  }

  onFileUpload() {

    if (this.OnboardingMode == 2 && (this.ContractCode == null || this.ContractCode == "" || this.ContractCode == undefined)) {
      this.alertService.showWarning("Please enter the NAPS contract code and Continue.")
      return;
    }

    this.approvalForm.get('ObjectStorageId').valid;
    let fileSize = 0;
    for (let i = 0; i < this.fileList.length; i++) {
      fileSize = Number(fileSize) + this.fileList[i].size
    }
    var FileSize = fileSize / 1024 / 1024;
    var maxfilesize = fileSize / 1024;
    if ((FileSize > 2)) {
      this.isLoading = true;
      this.alertService.showWarning('The attachment size exceeds the allowable limit.');
      return;
    }
    this.isLoading = false;
    this.spinnerText = "Uploading";
    if (this.isFileChange && this.fileList.length > 0) {
      var zip = new JSZip();
      var files = this.fileList;
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;  //files[0].name;

      if (files && files[0]) {
        // for (let i = 0; i < files.length; i++) {
        //   let b: any = new Blob([files[i]], { type: '' + files[i].type + '' });
        //   zip.file(files[i].name, b, { base64: true });
        // }
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
        console.log('FILE ZIP ----> ', zip, files);
        zip.generateAsync({
          type: "base64",
        }).then((_content) => {
          if (_content && this.FileName) {
            if (this.firstTimeDocumentId || this.approvalForm.get('ObjectStorageId').value) {
              if (this.isGuid(this.popupId)) {

                this.deleteAsync();
              }
              else if (this.firstTimeDocumentId != this.approvalForm.get('ObjectStorageId').value) {

                this.deleteAsync();

              }

              else {

                this.FileName = null;
                this.approvalForm.controls['IsDocumentDelete'].setValue(true);
                this.approvalForm.controls['DocumentName'].setValue(null);
              }
              this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;
              this.approvalForm.get('DocumentName').setValue(`${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`);

              this.doAsyncUpload(_content, this.FileName);
            }
            else {
              this.doAsyncUpload(_content, this.FileName);
            }

          }
        });
      }

    } else {


      this.savebutton();
    }
    // if (e.target.files && e.target.files[0]) {

    //   const file = e.target.files[0];
    //   const pattern = /image-*/;
    //   var type = e.target.files[0].type;
    //   var size = e.target.files[0].size;
    //   var maxSize = (Math.round(size / 1024) + " KB");
    //   console.log(maxSize);
    //   var FileSize = e.target.files[0].size / 1024 / 1024;
    //   if (FileSize > 2) {
    //     this.isLoading = true;
    //     this.alertService.showWarning('The attachment size exceeds the allowable limit.');
    //     return;
    //   }
    //   const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   reader.onloadend = () => {
    //     this.spinnerText = "Uploading";
    //     this.FileName = file.name;
    //     this.approvalForm.controls['DocumentName'].setValue(file.name);
    //     let FileUrl = (reader.result as string).split(",")[1];
    //     this.doAsyncUpload(FileUrl, this.FileName)

    //   };
    // }
  }

  doAsyncUpload(filebytes, filename) {


    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this.objStorageJson.CandidateId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.objStorageJson.ClientContractId;
      objStorage.ClientId = this.objStorageJson.ClientId;
      objStorage.CompanyId = this.objStorageJson.CompanyId;

      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename == null ? `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip` : filename;
      objStorage.OriginalObjectName = filename == null ? `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip` : filename;;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;
      this.approvalForm.get('DocumentName').setValue(`${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`);
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.approvalForm.controls['ObjectStorageId'].setValue(apiResult.Result);
            this.approvalForm.controls['IsDocumentDelete'].setValue(false);
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;
            this.approvalForm.get('DocumentName').setValue(`${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`);
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")
            this.isFileChange = false;
            this.savebutton();

          }
          else {
            this.FileName = null;
            this.approvalForm.controls['DocumentName'].setValue(null);
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
            this.isFileChange = true;
          }
        } catch (error) {
          this.FileName = null;
          this.approvalForm.controls['DocumentName'].setValue(null);
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.approvalForm.controls['DocumentName'].setValue(null);
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }
  /* #endregion */

  /* #region  File delete object stroage (S3) */

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
      console.log(result);

      if (result.value) {
        this.fileList.splice(this.fileList.indexOf(file), 1);
        this.isFileChange = true;
        // if (this.isGuid(this.popupId)) {

        //   this.deleteAsync();
        // }
        // else if (this.firstTimeDocumentId != this.approvalForm.get('ObjectStorageId').value) {


        //   this.deleteAsync();

        // }

        // else {


        //   this.FileName = null;
        //   this.approvalForm.controls['IsDocumentDelete'].setValue(true);
        //   this.approvalForm.controls['DocumentName'].setValue(null);

        // }
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


    // this.isLoading = false;
    // this.spinnerText = "Deleting";


    this.fileuploadService.deleteObjectStorage((this.approvalForm.get('ObjectStorageId').value)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.approvalForm.get('ObjectStorageId').value)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.approvalForm.controls['ObjectStorageId'].setValue(null);
          this.approvalForm.controls['DocumentName'].setValue(null);
          this.FileName = null;
          // this.isLoading = true;
          // this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
          console.log("Your file is deleted successfully!");
        } else {
          // this.isLoading = true;
          // this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
          console.log("An error occurred while trying to delete! " + apiResult.Message);
        }
      } catch (error) {

        // this.alertService.showWarning("An error occurred while trying to delete! " + error)
        console.log("An error occurred while trying to delete! " + error);
      }

    }), ((err) => {

    })

  }

  /* #endregion */

  /* #region  Unsaved Documents delete from object storage (S3) */

  unsavedDeleteFile(_DocumentId) {

    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {

      console.log(res);
      let apiResult: apiResult = (res);

      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.approvalForm.get('ObjectStorageId').value)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.approvalForm.controls['ObjectStorageId'].setValue(null);
          this.approvalForm.controls['IsDocumentDelete'].setValue(false);
          this.approvalForm.controls['DocumentName'].setValue(null);

          this.FileName = null;

        } else {
        }
      } catch (error) {
      }
    }), ((err) => {

    })

  }

  /* #endregion */

  /* #region  GUID checking */
  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }
  /* #endregion */

  /* #region  Confirm Exit with Unsaved Documents are deleting from object storage (S3) */
  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: this.disableBtn == true ? "You won't be able to revert this!" : "Are you sure you want to exit?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        try {

          this.closeModal();

        } catch (error) {

        }



      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }
  /* #endregion */

  /* #region  Close modal */

  closeModal() {

    if (this.unsavedDocumentLst.length > 0) {

      this.unsavedDocumentLst.forEach(element => {


        try {
          this.unsavedDeleteFile(element.Id);

        } catch (error) {

        }

        this.activeModal.close('Modal Closed');
      });
    }
    else {

      this.activeModal.close('Modal Closed');
    }


  }
  /* #endregion */

  /* #region  Save  BEFORE JSZIP */
  // savebutton(): void {

  //   let isAlreadyExists = false;
  //   this.submitted = true;
  //   if (this.approvalForm.invalid || this.FileName == null) {

  //     return;
  //   }

  //   let Id = this.approvalForm.get('Id').value;
  //   let ApprovalFor = this.approvalForm.get('ApprovalFor').value;
  //   let ApprovalType = this.approvalForm.get('ApprovalType').value;

  //   isAlreadyExists = _.find(this.LstClientApproval, (a) => a.Id != Id && a.ApprovalFor == ApprovalFor && ApprovalFor != 5) != null ? true : false;
  //   if (isAlreadyExists) {

  //     this.alertService.showWarning("You have entered a Approval For/Approver Type that already passed in this Approval Documents part. ");
  //     return;
  //   }

  //   console.log('appp', this.ApprovalForList);

  //   this.approvalForm.controls['ApprovalForName'].setValue(this.approvalForm.get('ApprovalFor').value == '2' || this.approvalForm.get('ApprovalFor').value == '4' ? this.Global_ApprovalList.find(z => z.id == 2).name : this.ApprovalForList.find(z => z.id == this.approvalForm.get('ApprovalFor').value).name)
  //   this.approvalForm.controls['ApprovalTypeName'].setValue(this.ApprovalTypeList.find(z => z.id == this.approvalForm.get('ApprovalType').value).name);

  //   this.activeModal.close(this.approvalForm.value);

  // }

  /* #region  AFTER JSZIP */

  savebutton(): void {

    let isAlreadyExists = false;
    this.submitted = true;
    console.log('this.approvalForm', this.approvalForm.value);



    if (this.OnboardingMode == 2 && (this.ContractCode != null && this.ContractCode != "" && this.ContractCode != undefined)) {
      this.approvalForm.controls['ContractCode'].setValue(this.ContractCode);
    }



    if (this.approvalForm.value.DocumentName == null || this.approvalForm.value.DocumentName == undefined) {
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.approvalForm.value.DocumentName = this.FileName;
    }


    if (this.approvalForm.invalid || this.FileName == null || (this.fileList && this.fileList.length == 0)) {
      this.isLoading = true;
      return;
    }

    let Id = this.approvalForm.get('Id').value;
    let ApprovalFor = this.approvalForm.get('ApprovalFor').value;
    let ApprovalType = this.approvalForm.get('ApprovalType').value;

    isAlreadyExists = _.find(this.LstClientApproval, (a) => a.Id != Id && a.ApprovalFor == ApprovalFor && ApprovalFor != 5 && ApprovalFor != 8) != null ? true : false;
    if (isAlreadyExists) {
      this.isLoading = true;
      this.alertService.showWarning("You have entered a Approval For/Approver Type that already passed in this Approval Documents part. ");
      return;
    }

    console.log('appp', this.ApprovalForList);

    this.approvalForm.controls['ApprovalForName'].setValue(this.approvalForm.get('ApprovalFor').value == '2' || this.approvalForm.get('ApprovalFor').value == '4' ? this.Global_ApprovalList.find(z => z.id == 2).name : this.ApprovalForList.find(z => z.id == this.approvalForm.get('ApprovalFor').value).name)
    this.approvalForm.controls['ApprovalTypeName'].setValue(this.ApprovalTypeList.find(z => z.id == this.approvalForm.get('ApprovalType').value).name);

    this.activeModal.close(this.approvalForm.value);

  }
  /* #endregion */
  /* #endregion */

}
