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

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
// directives 

import { enumHelper } from '../../../shared/directives/_enumhelper';

// enum
import * as _ from 'lodash';
import { GraduationType, ScoringType } from '../../../_services/model/Base/HRSuiteEnums';
import { CourseType } from '../../../_services/model/Candidates/CandidateCareerDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { environment } from "../../../../environments/environment";

let previousValue = 0;
export function mixmaxcheck(control: FormControl): { [key: string]: boolean } {
  if (control.value > 100) {
    control.setValue(previousValue);
    return { invalid: true };
  } else if (control.value < 0) {
    control.setValue(previousValue);
    return { invalid: true };
  } else {
    previousValue = control.value;
    return null;
  }
}
export function mixmaxcheckgpa(control: FormControl): { [key: string]: boolean } {
  if (control.value > 10) {
    control.setValue(previousValue);
    return { invalid: true };
  } else if (control.value < 0) {
    control.setValue(previousValue);
    return { invalid: true };
  } else if (isNaN(control.value)) {
    control.setValue(previousValue);
  }
  else {
    previousValue = control.value;
    return null;
  }

}
@Component({
  selector: 'app-academic-modal',
  templateUrl: './academic-modal.component.html',
  styleUrls: ['./academic-modal.component.scss']
})
export class AcademicModalComponent implements OnInit {
  @Input() id: number;
  @Input() jsonObj: any;
  @Input() objStorageJson: any;
  @Input() LstEducation: any;
  @Input() LstEducationDocumentTypes: any;

  academicForm: FormGroup;
  FileName: any;
  unsavedDocumentLst = [];
  DocumentId: any;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  MenuId: any;

  graduationType: any = [];
  courseType: any = [];
  scoringType: any = [];
  yearArray = [];

  firstTimeDocumentId: any;
  popupId: any;

  isExists: boolean = false; // for country - is already exists 

  isLoading: boolean = true;
  spinnerText: string = "Uploading";

  _loginSessionDetails: LoginResponses;
  userAccessControl;
  BusinessType: number;
  scrTypCGPA: boolean = false;

  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];
  isAllenDigital: boolean = false;
  ACID = environment.environment.ACID;
  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private utilsHelper: enumHelper,
    public fileuploadService: FileUploadService,

  ) {
    this.createForm();
  }

  get g() { return this.academicForm.controls; } // reactive forms validation 

  createForm() {


    this.academicForm = this.formBuilder.group({

      Id: [UUID.UUID()],
      graduationType: [null, Validators.required],
      educationDegree: [''],
      courseType: [null, Validators.required],
      institutaion: [''],
      universityName: [''],
      yearOfPassing: ['', Validators.required],
      scoringType: [null, Validators.required,],
      scoringValue: ['', [Validators.required]],


      DocumentId: [null, Validators.required],
      FileName: [null, Validators.required],
      IsDocumentDelete: [false], // extra prop
      idProoftype: [null],
    });


  }


  ngOnInit() {

    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    this.objStorageJson = JSON.parse(this.objStorageJson);
    console.log('object ::', this.objStorageJson)
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.academicForm.valueChanges

      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });


    this.popupId = (this.academicForm.get('Id').value);
    this.isAllenDigital = (Number(this.ACID) === 1988 && ( this.BusinessType === 1 ||  this.BusinessType === 2)) ? true : false;
    // this.UIBuilderService.doApply(this, this.MenuId, componentName);


    this.graduationType = this.utilsHelper.transform(GraduationType);
    if (this.isAllenDigital) {
      this.graduationType = this.graduationType.filter(item => item.id !== 1 && item.id !== 5)
    }    
    this.courseType = this.utilsHelper.transform(CourseType);
    this.scoringType = this.utilsHelper.transform(ScoringType);

    if (this.jsonObj) {

      this.popupId = this.jsonObj.Id;
      this.firstTimeDocumentId = this.jsonObj.DocumentId;


      this.academicForm.patchValue(this.jsonObj);
      if (this.jsonObj.DocumentId && this.jsonObj.FileName) {

        this.jsonObj.idProoftype = this.jsonObj.idProoftype == null || this.jsonObj.idProoftype == '' ? null : this.jsonObj.idProoftype;

        this.FileName = this.jsonObj.FileName;
        this.DocumentId = this.jsonObj.DocumentId;
        /* #region  AFTER JSZIP */
        this.spinnerText = "Loading";
        this.fileuploadService.getObjectById(this.DocumentId)
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
                      console.log('fileObject', this.fileObject);
                    });
                  }
                });
              });
            }
          })
        /* #endregion */
      }
    }

    try {
      let mode = this.id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");
    } catch (error) {

    }

    this.passingYear_dropdown();



  }

  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }


  passingYear_dropdown() {

    var date = new Date();
    var year = date.getFullYear();
    for (var i = year - 40; i <= year + 1; i++) {
      this.yearArray.push({
        Text: i,
        Value: i
      })
    }
  }

  closeModal() {

    if (this.unsavedDocumentLst.length != 0) {

      this.unsavedDocumentLst.forEach(element => {

        this.DocumentId = element.Id;

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

  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }


  savebutton(): void {

    this.submitted = true;
    if (this.academicForm.invalid) {
      this.isLoading = true; // JSZIP
      return;
    }


    let isAlreadyExists = false;

    // this.updateValidation(false, this.academicForm.get('idProoftype'));
    this.updateValidation(false, this.academicForm.get('DocumentId'));

    if (this.academicForm.value.FileName == null || this.academicForm.value.FileName == undefined) {
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_educationDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.academicForm.value.FileName = this.FileName;
    }


    this.submitted = true;

    if (this.academicForm.invalid) {
      this.isLoading = true; // JSZIP
      return;
    }

    if (this.jsonObj != undefined && this.jsonObj.CandidateDocument != null) {
      this.isLoading = true; // JSZIP
      this.academicForm.addControl('CandidateDocument', new FormControl(this.jsonObj.CandidateDocument));

    }

    let Id = this.academicForm.get('Id').value;
    let graduationType = this.academicForm.get('graduationType').value;

    let DocumentId = this.academicForm.get('DocumentId').value;
    let IdProofType = this.academicForm.get('idProoftype').value;

    isAlreadyExists = _.find(this.LstEducation, (a) => a.Id != Id && a.graduationType == graduationType) != null ? true : false;

    if (isAlreadyExists) {
      this.isLoading = true; // JSZIP
      this.alertService.showWarning("You have entered a Graduation Type that already passed in this education part. ");
      return;
    }

    if ((this.fileList && this.fileList.length == 0) && (IdProofType != null)) {
      this.academicForm.get('DocumentId').setValue(null);
      return this.alertService.showWarning('Attachment is required !');
    }

    if (DocumentId != null && IdProofType == null && !this.isAllenDigital) {

      this.updateValidation(true, this.academicForm.get('idProoftype'));
      return;
    }
    else if (DocumentId == null && IdProofType != null) {
      this.updateValidation(true, this.academicForm.get('DocumentId'));
      return;
    }

    if (DocumentId != null && !this.isAllenDigital) {
      if (IdProofType == null) {
        this.alertService.showWarning("Oh... Snap! This alert needs your attention, because ID Proof type is required.");
        return;
      }
    }

    this.activeModal.close(this.academicForm.value);



  }



  /* #region  BEFORE JSZIP */


  // onFileUpload(e) {

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
  //     // if (!file.type.match(pattern)) {
  //     //   this.isLoading = true;
  //     //   alert('You are trying to upload not Image. Please choose image.');
  //     //   return;
  //     // }


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

  // doDeleteFile() {
  //   // this.spinnerStarOver();

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
  //     allowOutsideClick: false,
  //     reverseButtons: true
  //   }).then((result) => {
  //     console.log(result);

  //     if (result.value) {
  //       if (this.isGuid(this.popupId)) {

  //         this.deleteAsync();
  //       }
  //       else if (this.firstTimeDocumentId != this.DocumentId) {

  //         this.deleteAsync();

  //       }

  //       else {
  //         this.FileName = null;
  //         this.academicForm.controls['IsDocumentDelete'].setValue(true);
  //         this.academicForm.controls['FileName'].setValue(null);

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



  //   this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {


  //     console.log(res);
  //     let apiResult: apiResult = (res);
  //     try {
  //       if (apiResult.Status) {

  //         //search for the index.
  //         var index = this.unsavedDocumentLst.map(function (el) {
  //           return el.Id
  //         }).indexOf(this.DocumentId)

  //         // Delete  the item by index.
  //         this.unsavedDocumentLst.splice(index, 1)
  //         this.academicForm.controls['DocumentId'].setValue(null);
  //         this.academicForm.controls['FileName'].setValue(null);
  //         this.FileName = null;
  //         this.DocumentId = null;
  //         this.academicForm.controls['IsDocumentDelete'].setValue(false);
  //         this.isLoading = true;
  //         this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")

  //       } else {
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
  //       }
  //     } catch (error) {

  //       this.alertService.showWarning("An error occurred while  trying to delete! " + error)
  //     }

  //   }), ((err) => {

  //   })

  // }




  // doAsyncUpload(filebytes, filename) {


  //   try {
  //     let objStorage = new ObjectStorageDetails();
  //     objStorage.Id = 0;
  //     this.objStorageJson.IsCandidate == true ? objStorage.CandidateId = this.objStorageJson.CandidateId :
  //       objStorage.EmployeeId = this.objStorageJson.EmployeeId;

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

  //           this.academicForm.controls['DocumentId'].setValue(apiResult.Result);
  //           this.academicForm.controls['FileName'].setValue(this.FileName);
  //           this.DocumentId = apiResult.Result;
  //           this.unsavedDocumentLst.push({
  //             Id: apiResult.Result
  //           })
  //           this.isLoading = true;
  //           this.alertService.showSuccess("You have successfully uploaded this file!")

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

  /* #endregion */

  /* #region   AFTER JSZIP */


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


    if (this.fileList && this.fileList.length == 0) {
      this.academicForm.controls['DocumentId'].setValue(null);
      this.academicForm.controls['FileName'].setValue(null);
      this.FileName = null;
      this.DocumentId = null;
    }

    let IdProofType = this.academicForm.get('idProoftype').value;
    if (IdProofType !== null && this.fileList.length == 0) {
      this.alertService.showWarning('Kindly please provide attachment for selected Id Proof');
      return;
    }

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
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_educationDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
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
            if (this.DocumentId) {
              if (this.isGuid(this.popupId)) {

                this.deleteAsync();
              }
              // else if (this.DocumentId) {

              //   this.deleteAsync();

              // }

              // else {

              //   this.FileName = null;
              //   this.academicForm.controls['IsDocumentDelete'].setValue(true);
              //   this.academicForm.controls['FileName'].setValue(null);
              // }
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
    //   // if (!file.type.match(pattern)) {
    //   //   this.isLoading = true;
    //   //   alert('You are trying to upload not Image. Please choose image.');
    //   //   return;
    //   // }


    //   const reader = new FileReader();
    //   reader.readAsDataURL(file);
    //   reader.onloadend = () => {

    //     this.spinnerText = "Uploading";
    //     this.FileName = file.name;
    //     let FileUrl = (reader.result as string).split(",")[1];
    //     this.doAsyncUpload(FileUrl, this.FileName)

    //   };

    // }

  }

  doDeleteFile(file) {
    // this.spinnerStarOver();

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
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {
        this.fileList.splice(this.fileList.indexOf(file), 1);
        this.isFileChange = true;
        // if (this.isGuid(this.popupId)) {

        //   this.deleteAsync();
        // }
        // else if (this.firstTimeDocumentId != this.DocumentId) {

        //   this.deleteAsync();

        // }

        // else {
        //   this.FileName = null;
        //   this.academicForm.controls['IsDocumentDelete'].setValue(true);
        //   this.academicForm.controls['FileName'].setValue(null);

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



    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {


      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.academicForm.controls['DocumentId'].setValue(null);
          this.academicForm.controls['FileName'].setValue(null);
          // this.FileName = null;
          // this.DocumentId = null;
          this.academicForm.controls['IsDocumentDelete'].setValue(false);
          // this.isLoading = true;
          // this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
          console.log("Your file is deleted successfully!");

        } else {
          // this.isLoading = true;
          // this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
          console.log("An error occurred while  trying to delete! " + apiResult.Message);
        }
      } catch (error) {
        console.log("An error occurred while  trying to delete! " + error);
        // this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }

    }), ((err) => {

    })

  }




  doAsyncUpload(filebytes, filename) {


    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      this.objStorageJson.IsCandidate == true ? objStorage.CandidateId = this.objStorageJson.CandidateId :
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
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = this.objStorageJson.IsCandidate == true ? "Proofs" : "EmpTransactions";



      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {



        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.academicForm.controls['DocumentId'].setValue(apiResult.Result);
            this.academicForm.controls['FileName'].setValue(this.FileName);
            this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file!");
            this.isFileChange = false;
            this.savebutton();

          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
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
      allowOutsideClick: false,
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

  unsavedDeleteFile(_DocumentId) {

    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {

      console.log(res);
      let apiResult: apiResult = (res);

      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.academicForm.controls['DocumentId'].setValue(null);
          this.academicForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.academicForm.controls['IsDocumentDelete'].setValue(false);


        } else {

        }
      } catch (error) {


      }


    }), ((err) => {

    })

  }

  public isGuid(stringToTest) {

    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }

  onChangescoringType(selected: any) {
    let control: AbstractControl;
    control = this.academicForm.controls['scoringValue'];
    control.setValue('');
    if (selected.id == 2) {
      this.scrTypCGPA = true;
      control.clearValidators();
      control.setValidators([Validators.required, mixmaxcheckgpa]);
    }
    if (selected.id == 1) {
      this.scrTypCGPA = false;
      control.clearValidators();
      control.setValidators([Validators.required, mixmaxcheck]);
    }
  }

  getRequired(controlName) {

    this.userAccessControl = this.userAccessControl.filter(z => z.PropertyName === "required" && z.PropertyName != "div" && z.PropertyName != "button" && z.PropertyName != "accordion");
    var _filter = this.userAccessControl.find(a => (a.ControlName == controlName));
    if (_filter != undefined) {

      return _filter.EditValue != "false" && _filter.EditValue != null && _filter.EditValue == "true" ? "*" : "";
    } else {
      return "";
    }
  }


}
