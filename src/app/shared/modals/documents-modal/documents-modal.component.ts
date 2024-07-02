import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";

// services 
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';

import * as _ from 'lodash';
import { apiResult } from '../../../_services/model/apiResult';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { ApprovalFor, ApproverType } from 'src/app/_services/model/Candidates/CandidateDetails';
import { enumHelper } from '../../directives/_enumhelper';
import { DocumentService } from '../../../_services/service/document.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { environment } from 'src/environments/environment';
import * as JSZip from 'jszip';
import { test } from 'src/app/_services/model/Attendance/AttendanceConfiguration';

import { indexOf, zip } from 'lodash';

@Component({
  selector: 'app-documents-modal',
  templateUrl: './documents-modal.component.html',
  styleUrls: ['./documents-modal.component.scss']
})
export class DocumentsModalComponent implements OnInit {
  @Input() id: number;
  @Input() UserId: number;
  @Input() jsonObj: any;
  @Input() objStorageJson: any;
  @Input() OldDocumentDetails: any;
  @Input() DocumentNumber: string = "";
  @Input() IsNAPS: boolean = false;
  documentForm: FormGroup;
  isCategoryType: any;

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
  tblminDate: Date;
  selected_CategoryLst = [];
  Lst_deleted_documentId = [];
  previous_DocumentId: any;

  isDuplicate: boolean = false;

  public mask = []
  public isAadhaarMask: boolean = false;
  _loginSessionDetails: LoginResponses;
  BusinessType: number;
  acceptOnlyImageFile: boolean = false;

  // JSZip 
  /* #region  After JsZip */
  fileList: any[] = [];
  isFileChange: boolean = false;
  DocList = [];
  fileObject: any[] = [];
  /* #endregion */

  IsDocumentNumberRequired: boolean = false;

  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private onboardingService: OnboardingService,
    public fileuploadService: FileUploadService,
    private utilsHelper: enumHelper,
    public documentService: DocumentService

  ) {
    this.createForm();
  }

  get g() { return this.documentForm.controls; } // reactive forms validation 

  createForm() {

    this.documentForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      DocumentName: [null, Validators.required],
      DocumentNumber: [null, Validators.required],
      CategoryType: [null, Validators.required],
      ValidFrom: [null],
      ValidTill: [null],
      DocumentId: ['', Validators.required],
      Status: [0],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop
      DeletedIds: ['']
    });
  }


  /* #region  ngOnInit Initialization - PRE Loading */
  ngOnInit() {
    console.log(this.id, this.UserId, this.jsonObj, this.objStorageJson, this.OldDocumentDetails)

    try {
      console.log('jsonob', this.jsonObj);
      this.IsDocumentNumberRequired = this.jsonObj.hasOwnProperty("IsDocumentNumberRequired") &&
        this.jsonObj.IsDocumentNumberRequired == 'False' ? false : true;
      if (!this.IsDocumentNumberRequired) {
        this.updateValidation(false, this.documentForm.get('DocumentNumber'));
      }

      this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
      this.objStorageJson = this.objStorageJson ? JSON.parse(this.objStorageJson) : null;
      this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
      this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
      this.documentForm.valueChanges.subscribe((changedObj: any) => {
        this.disableBtn = true;
      });
      // checks for duplicate category type
      if (this.jsonObj.CategoryType && this.jsonObj.CategoryType.length) {
        let categoryArray = _.uniqBy(this.jsonObj.CategoryType, "Id");
        this.jsonObj.CategoryType = categoryArray;
      }
      // check if pan , signature or aadhar is selected. 
      // If yes, only image file should be uploaded (for online joining kit purpose)
      this.acceptOnlyImageFile = false;
      if (this.jsonObj.DocumentName.toLowerCase() === 'profile avatar' || this.jsonObj.DocumentName.toLowerCase() === 'pan' || this.jsonObj.DocumentName.toLowerCase() === 'signature' || this.jsonObj.DocumentName.includes('Aadhaar')) {
        this.acceptOnlyImageFile = true;
      }

      this.tblminDate = new Date();

      if (this.jsonObj) {
        this.DocList = [];
        // var fileNameSplitsArray = this.jsonObj.FileName.split('.');
        // var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
        // if (ext.toUpperCase().toString() == "ZIP") {
        /* #region  After JsZip */

        try {

          if (this.jsonObj.FileName && this.jsonObj.DocumentId) {
            this.spinnerText = "Loading";
            this.documentForm.controls['DocumentId'].setValue(this.jsonObj.DocumentId);
            this.fileuploadService.getObjectById(this.jsonObj.DocumentId)
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
                          console.log('fileObject', this.fileObject); // These are your file contents      
                        });
                      }
                    });
                  });
                }
              })
          }

        }
        catch (e) {
          console.log('mapping ex', e);
        }
        // } 
        /* #endregion */


        this.jsonObj.ValidTill = this.jsonObj.ValidTill == null ? null : new Date(this.jsonObj.ValidTill)
        this.jsonObj.ValidFrom = this.jsonObj.ValidFrom == null ? null : new Date(this.jsonObj.ValidFrom)

        this.previous_DocumentId = this.jsonObj.DocumentId;
        this.jsonObj.Id = this.jsonObj.Id == 0 ? UUID.UUID() : this.jsonObj.Id;
        // this.popupId = this.jsonObj.DocumentName;
        // this.firstTimeDocumentId = this.jsonObj.DocumentId;
        // this.FileName = this.jsonObj.DocumentName; 
        // this.fileuploadService.getObjectStorage(this.jsonObj.DocumentId).subscribe((res)=> {

        //   console.log(res);

        // })

        this.documentForm.patchValue(this.jsonObj);
        this.selected_CategoryLst = this.jsonObj.CategoryType != null && this.jsonObj.CategoryType.length > 0 ? this.jsonObj.CategoryType : [];

        // console.log('temp_Cat_List', this.temp_Cat_List);
        console.log('jsonobj', this.jsonObj);

        // let localList = [];
        // this.temp_Cat_List.forEach(element => {

        //   if (element.DocumentTypeId == this.jsonObj.DocumentTypeId) {

        //     localList.push(element.ApplicableCategories)
        //   }

        // });
        // this.CategoryList = localList[0];
      }

      // this.CategoryList.forEach(element => {

      //   element['isChecked'] = false;

      // });


      // console.log('ths', this.selected_CategoryLst);


      // if(this.selected_CategoryLst.length >  0){
      //   alert(this.selected_CategoryLst.length)
      //   this.CategoryList.forEach(element => {
      //     element.isChecked = this.selected_CategoryLst.find(z=>z.Id == element.Id) != null ? true : false;

      //   });
      // }

      // console.log(this.CategoryList);

      // console.log('end', this.jsonObj);
      this.FileName = this.jsonObj.FileName;


      if (this.jsonObj.IsDateValidationRequired == 'True') {

        this.updateValidation(true, this.documentForm.get('ValidFrom'));
        this.updateValidation(true, this.documentForm.get('ValidTill'));

      }

      if (this.jsonObj.DocumentTypeId == environment.environment.AadhaarDocumentTypeId) {
        this.isAadhaarMask = true;
        this.mask = [/\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];
        // if (this.IsNAPS) {
          this.documentForm.controls['DocumentNumber'].setValue(this.DocumentNumber);
        // }
      }
      if (this.jsonObj.DocumentTypeId == environment.environment.PANDocumentTypeId) {
        // if (this.IsNAPS) {
          this.documentForm.controls['DocumentNumber'].setValue(this.DocumentNumber);
        // }
      }

    } catch (error) {
      console.log('EXE ERR ::', error);

    }


  }


  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }

  /* #endregion */

  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }



  onChangetblDate(event) {

    //  if(this.documentForm.get('ValidFrom').value == null) {

    //   this.documentForm.controls['ValidTill'].setValue(null);

    //  }
    //  else {
    //    alert('sdf')
    var validFrom = new Date(event);
    this.tblminDate.setDate(validFrom.getDate() + 1);
    //  }

  }


  /* #region  File upload using object stroage (S3) */

  /* #region  After Jszip */

  onAddingFile(e) {
    this.documentForm.get('DocumentId').valid;
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
    if (this.isFileChange && this.fileList.length > 0) {
      console.log(this.fileList)
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

      var zip = new JSZip();
      this.documentForm.get('DocumentId').valid;
      this.isLoading = false;
      const files = this.fileList;
      // this.FileName = this.jsonObj.DocumentName.replace(/\s/g, '');  // files[0].name; 
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_officialDoc${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.FileName = `${this.FileName}.zip`;
      console.log(this.FileName)
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
            if (this.jsonObj.DocumentId || this.documentForm.get('DocumentId').value) {
              if (this.OldDocumentDetails != null) {
                let alreadyExists = this.OldDocumentDetails.find(a => a.DocumentId == this.documentForm.get('DocumentId').value) != null ? true : false;
                if (alreadyExists) {

                  this.Lst_deleted_documentId.push({
                    Id: this.documentForm.get('DocumentId').value
                  })
                  this.documentForm.controls['DocumentId'].setValue(null);
                  this.documentForm.controls['IsDocumentDelete'].setValue(true);
                  this.documentForm.controls['FileName'].setValue(null);
                  this.FileName = null;

                  if (this.jsonObj != null) {
                    this.jsonObj.DocumentId = 0;
                    this.jsonObj.FileName = null;
                  }
                }
                else {
                  this.deleteAsync();
                }
              } else {
                this.deleteAsync();
              }

              this.doAsyncUpload(_content, this.FileName);

            } else {
              this.doAsyncUpload(_content, this.FileName);
            }

          }

        });
      }

    } else {
      this.savebutton();
    }

  }

  doAsyncUpload(filebytes, filename) {
    try {
      if (filename == null) {
        filename = ` ${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_officialDoc${new Date().getTime().toString()}.zip`;
        this.FileName = filename;
      }
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      this.objStorageJson.IsCandidate == true ? objStorage.CandidateId = this.objStorageJson.CandidateId :
        objStorage.EmployeeId = this.objStorageJson.EmployeeId;

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
      objStorage.ObjectName = filename == null ? `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_officialDoc${new Date().getTime().toString()}.zip` : filename;
      objStorage.OriginalObjectName = filename == null ? `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_officialDoc${new Date().getTime().toString()}.zip` : filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = this.objStorageJson.IsCandidate == true ? "Proofs" : "EmpTransactions";
      console.log(objStorage)
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.documentForm.controls['DocumentId'].setValue(apiResult.Result);
            this.documentForm.controls['FileName'].setValue(this.FileName);
            // if (this.jsonObj != null) {
            //   this.jsonObj.DocumentId = apiResult.Result;
            //   this.jsonObj.FileName = this.FileName;
            // }

            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")
            this.isFileChange = false;
            this.savebutton();
          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
            this.isFileChange = true;
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
  /* #endregion */

  /* #region  File delete object stroage (S3) */

  doDeleteFile(file) {

    this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted,  you cannot undo this action.", "OK, Delete").then(result => {
      this.fileList.splice(this.fileList.indexOf(file), 1);
      this.isFileChange = true;
      this.disableBtn = true;
      // if (this.OldDocumentDetails != null) {
      //   let alreadyExists = this.OldDocumentDetails.find(a => a.DocumentId == this.documentForm.get('DocumentId').value) != null ? true : false;
      //   if (alreadyExists) {

      //     this.Lst_deleted_documentId.push({
      //       Id: this.documentForm.get('DocumentId').value
      //     })
      this.documentForm.controls['DocumentId'].setValue(null);
      this.documentForm.controls['IsDocumentDelete'].setValue(true);
      this.documentForm.controls['FileName'].setValue(null);
      this.FileName = null;

      //     if (this.jsonObj != null) {
      //       this.jsonObj.DocumentId = 0;
      //       this.jsonObj.FileName = null;
      //     }
      //   }
      //   else {
      //     this.deleteAsync();
      //   }
      // } else {
      //   this.deleteAsync();
      // }

    })
      .catch(error => { });
  }
  /* #endregion */

  /* #region Before JsZip  */


  // onFileUpload(e) {

  //   this.documentForm.get('DocumentId').valid;

  //   this.isLoading = false;
  //   if (e.target.files && e.target.files[0]) {

  //     const file = e.target.files[0];
  //     const pattern = /image-*/;
  //     var type = e.target.files[0].type;
  //     var size = e.target.files[0].size;
  //     var maxSize = (Math.round(size / 1024) + " KB");
  //     console.log(maxSize);
  //     var FileSize = e.target.files[0].size / 1024 / 1024;
  //     var maxfilesize = e.target.files[0].size / 1024;
  //     //if (FileSize > 2) {
  //     if (maxfilesize > parseFloat(this.jsonObj.MaxSize)) {
  //       this.isLoading = true;
  //       this.alertService.showWarning('The attachment size exceeds the allowable limit.');
  //       return;
  //     }
  //     const reader = new FileReader();
  //     reader.readAsDataURL(file);
  //     reader.onloadend = () => {
  //       this.spinnerText = "Uploading";
  //       this.FileName = file.name;
  //       let FileUrl = (reader.result as string).split(",")[1];
  //       this.doAsyncUpload(FileUrl, this.FileName)

  //     };
  //   }
  // }


  // doAsyncUpload(filebytes, filename) {
  //   try {
  //     let objStorage = new ObjectStorageDetails();
  //     objStorage.Id = 0;
  //     this.objStorageJson.IsCandidate == true ? objStorage.CandidateId = this.objStorageJson.CandidateId :
  //       objStorage.EmployeeId = this.objStorageJson.EmployeeId;

  //     objStorage.EmployeeId = this.objStorageJson.EmployeeId;
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
  //     objStorage.ObjectCategoryName = this.objStorageJson.IsCandidate == true ? "Proofs" : "EmpTransactions";

  //     this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
  //       let apiResult: apiResult = (res);
  //       try {
  //         if (apiResult.Status && apiResult.Result != "") {

  //           this.documentForm.controls['DocumentId'].setValue(apiResult.Result);
  //           this.documentForm.controls['FileName'].setValue(this.FileName);

  //           // if (this.jsonObj != null) {
  //           //   this.jsonObj.DocumentId = apiResult.Result;
  //           //   this.jsonObj.FileName = this.FileName;
  //           // }

  //           this.unsavedDocumentLst.push({
  //             Id: apiResult.Result
  //           })
  //           this.isLoading = true;
  //           this.alertService.showSuccess("You have successfully uploaded this file")

  //         }
  //         else {
  //           this.FileName = null;
  //           this.isLoading = true;
  //           this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
  //         }
  //       } catch (error) {
  //         this.FileName = null;
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while  trying to upload! " + error)
  //       }

  //     }), ((err) => {

  //     })

  //     console.log(objStorage);
  //   } catch (error) {
  //     this.FileName = null;
  //     this.alertService.showWarning("An error occurred while  trying to upload! " + error)
  //     this.isLoading = true;
  //   }

  // }
  // /* #endregion */

  // /* #region  File delete object stroage (S3) */

  // doDeleteFile() {

  //   this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted,  you cannot undo this action.", "OK, Delete").then(result => {

  //     if (this.OldDocumentDetails != null) {
  //       let alreadyExists = this.OldDocumentDetails.find(a => a.DocumentId == this.documentForm.get('DocumentId').value) != null ? true : false;
  //       if (alreadyExists) {

  //         this.Lst_deleted_documentId.push({
  //           Id: this.documentForm.get('DocumentId').value
  //         })
  //         this.documentForm.controls['DocumentId'].setValue(null);
  //         this.documentForm.controls['IsDocumentDelete'].setValue(true);
  //         this.documentForm.controls['FileName'].setValue(null);
  //         this.FileName = null;

  //         if (this.jsonObj != null) {
  //           this.jsonObj.DocumentId = 0;
  //           this.jsonObj.FileName = null;
  //         }
  //       }
  //       else {
  //         this.deleteAsync();
  //       }
  //     } else {
  //       this.deleteAsync();
  //     }

  //   })
  //     .catch(error => { });






  // }

  /* #endregion */

  deleteAsync() {

    // const swalWithBootstrapButtons = Swal.mixin({
    //   customClass: {
    //     confirmButton: 'btn btn-primary',
    //     cancelButton: 'btn btn-danger'
    //   },
    //   buttonsStyling: true,
    // })

    // swalWithBootstrapButtons.fire({
    //   title: 'Are you sure you want to delete?',
    //   text: "This item will be deleted immediately. You can't undo this file.",
    //   type: 'warning',
    //   showCancelButton: true,
    //   confirmButtonText: 'Ok!',
    //   cancelButtonText: 'No, cancel!',
    //   reverseButtons: true
    // }).then((result) => {
    //   console.log(result);

    //   if (result.value) {
    this.isLoading = false;
    this.spinnerText = "Uploading";

    if (this.documentForm.get('DocumentId').value !== null) {
      this.fileuploadService.deleteObjectStorage((this.documentForm.get('DocumentId').value)).subscribe((res) => {
        console.log('DELETE DOC -->', res);
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status) {

            //search for the index.
            var index = this.unsavedDocumentLst.map(function (el) {
              return el.Id
            }).indexOf(this.documentForm.get('DocumentId').value)

            // Delete  the item by index.
            /* #region  Before Jszip */
            // this.unsavedDocumentLst.splice(index, 1)
            // this.documentForm.controls['DocumentId'].setValue(null);
            // this.documentForm.controls['FileName'].setValue(null);
            // this.documentForm.controls['IsDocumentDelete'].setValue(false);
            // this.FileName = null;
            // this.isLoading = true;

            // if (this.jsonObj != null) {
            //   this.jsonObj.DocumentId = 0;
            //   this.jsonObj.FileName = null;
            // }
            // this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
            /* #endregion */

            /* #region  After Jszip */
            this.unsavedDocumentLst.splice(index, 1)
            if (this.fileList.length == 0) {
              this.documentForm.controls['DocumentId'].setValue(null);
              this.documentForm.controls['FileName'].setValue(null);
              this.FileName = null;
            }
            this.documentForm.controls['IsDocumentDelete'].setValue(false);
            this.isLoading = true;

            if (this.jsonObj != null) {
              this.jsonObj.DocumentId = 0;
              this.jsonObj.FileName = null;
            }
            if (this.fileList.length == 0) {
              this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!");
            }

            /* #endregion */
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
    //   } else if (result.dismiss === Swal.DismissReason.cancel) {

    //     swalWithBootstrapButtons.fire(
    //       'Cancelled',
    //       'Your request has been cancelled',
    //       'error'
    //     )
    //   }
    // })
  }


  /* #endregion */

  /* #region  Unsaved file delete object storage (S3) */

  unsavedDeleteFile(_DocumentId) {

    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {

      console.log(res);
      let apiResult: apiResult = (res);

      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.documentForm.get('DocumentId').value)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.documentForm.controls['DocumentId'].setValue(null);
          this.documentForm.controls['FileName'].setValue(null);
          this.documentForm.controls['IsDocumentDelete'].setValue(false);

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

  /* #region  Confirm Exit with Unsaved Document delete object storage (S3) */
  confirmExit() {

    if (this.jsonObj != null && (this.jsonObj.CandidateId != undefined && this.jsonObj.CandidateId != null) && this.jsonObj.DocumentId == "0") {
      this.alertService.showWarning("The file attachment is required or Please remember to save your modifications.");
      return;
    }


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

          if (this.jsonObj != null && (this.jsonObj.CandidateId == undefined || this.jsonObj.CandidateId == null) && this.jsonObj.DocumentId == "0") {
            this.activeModal.close(this.jsonObj);
            return;
          }

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

  /* #region  Save and Before Jszip */
  // savebutton(): void {
  //   this.submitted = true;
  //   this.isCategoryType = this.jsonObj.CategoryType.find(a => a.isChecked) != null ? true : false;
  //   if (!this.isCategoryType) {
  //     return;
  //   }
  //   if (this.documentForm.invalid) {
  //     return;
  //   }

  //   let documentNumber = this.documentForm.get('DocumentNumber').value;
  //   documentNumber = documentNumber.split('_').join("");
  //   documentNumber = documentNumber.split('/').join("");

  //   if (this.isAadhaarMask && documentNumber.length < 12) {
  //     this.alertService.showWarning("You have entered an invalid aadhaar number. Please match the requested format. (1234/1234/1234)")
  //     return;
  //   }
  //   this.objStorageJson.CandidateId == undefined ? this.objStorageJson.CandidateId = 0 : true;
  //   let req_param_uri = `CandidateId=${this.objStorageJson.CandidateId}&DocumentTypeId=${this.jsonObj.DocumentTypeId}&Documentnumber=${(documentNumber)}`;

  //   this.documentService.getDocumentDuplicate(req_param_uri).subscribe((response) => {
  //     this.isLoading = false;
  //     this.spinnerText = "Updating..."
  //     let apiResponse: apiResponse = response;
  //     if (apiResponse.Status == true) {
  //       this.documentForm.controls['DocumentNumber'].setValue(documentNumber);
  //       this.documentForm.controls['DeletedIds'].setValue(this.Lst_deleted_documentId);
  //       this.documentForm.controls['Status'].setValue(0)
  //       this.isLoading = true;
  //       this.activeModal.close(this.documentForm.value);

  //     } else {
  //       this.isLoading = true;
  //       this.alertService.showWarning("An error has occurred : The specified document number already exists.");

  //     }
  //     console.log(response);

  //   })


  // }
  /* #endregion */

  /* #region  After Jszip */
  savebutton(): void {

    console.log(this.documentForm.value)
    if (this.documentForm.value.FileName == null || this.documentForm.value.FileName == undefined) {
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.documentForm.value.FileName = this.FileName;
    }


    this.submitted = true;
    this.isCategoryType = this.jsonObj.CategoryType.find(a => a.isChecked) != null ? true : false;
    if (!this.isCategoryType) {
      return;
    }
    if (this.documentForm.invalid) {
      return;
    }

    let documentNumber = this.documentForm.get('DocumentNumber').value;


    if (!["", null, undefined].includes(documentNumber) && typeof documentNumber === 'string' && (documentNumber.includes('-') || documentNumber.includes('/'))) {
      documentNumber = documentNumber.split(/-|\//).join("");
    }

    if (this.isAadhaarMask && !["", null, undefined].includes(documentNumber) && documentNumber.length < 12) {
      this.alertService.showWarning("You have entered an invalid aadhaar number. Please match the requested format. (1234/1234/1234)")
      return;
    }
    this.objStorageJson.CandidateId == undefined ? this.objStorageJson.CandidateId = 0 : true;
    if (!["", null, undefined].includes(documentNumber)) {
      let req_param_uri = `CandidateId=${this.objStorageJson.CandidateId}&DocumentTypeId=${this.jsonObj.DocumentTypeId}&Documentnumber=${(documentNumber)}`;
      console.log(req_param_uri);
      this.documentService.getDocumentDuplicate(req_param_uri).subscribe((response) => {
        this.isLoading = false;
        this.spinnerText = "Updating..."
        let apiResponse: apiResponse = response;
        if (apiResponse.Status == true) {
          this.documentForm.controls['DocumentNumber'].setValue(documentNumber);
          this.documentForm.controls['DeletedIds'].setValue(this.Lst_deleted_documentId);
          this.documentForm.controls['Status'].setValue(0)
          this.isLoading = true;
          this.activeModal.close(this.documentForm.value);

        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error has occurred : The specified document number already exists.");

        }
        console.log(response);

      })

    }else {
      this.documentForm.controls['DocumentNumber'].setValue(documentNumber);
      this.documentForm.controls['DeletedIds'].setValue(this.Lst_deleted_documentId);
      this.documentForm.controls['Status'].setValue(0);
      this.activeModal.close(this.documentForm.value);
      return;
    }


  }
  /* #endregion */

  onChangeCategory(item, event) {

    // console.log(item);


    // var i = this.jsonObj.CategoryType.find(i=>i.Id == item.Id);
    // console.log(i);

    // if (event.target.checked) {


    //   this.selected_CategoryLst.push(item);

    // } else {

    //   var index = this.selected_CategoryLst.map(function (el) {
    //     return el.Id
    //   }).indexOf(item.Id)
    //   this.selected_CategoryLst.splice(index, 1)


    // }

  }

  // getVal(item)
  // {
  //   //alert(item['isChecked']);
  //   return item['isChecked'];
  // }
}
