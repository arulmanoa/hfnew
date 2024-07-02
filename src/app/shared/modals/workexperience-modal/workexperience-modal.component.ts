import { Component, OnInit, Input, ElementRef, ViewChild } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import Swal from "sweetalert2";
import * as JSZip from 'jszip';


import * as _ from 'lodash';
// services 
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';
import { ExperienceInfo, FunctionalAreaList } from '../../../_services/model/OnBoarding/ExperienceInfo';
import { apiResult } from '../../../_services/model/apiResult';

import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';

export class NoticePeriod {
  Id: number;
  Name: string;
}
export const _NoticePeriod: NoticePeriod[] = [{ Id: 1, Name: 'Immediate Joiners' }, { Id: 2, Name: 'Less Than 7 days' },
{ Id: 3, Name: 'Less Than 15 days' }, { Id: 4, Name: '30 days' }, { Id: 5, Name: '60 days' }, { Id: 6, Name: 'More than 60 days' },
{ Id: 7, Name: 'None' }];

@Component({
  selector: 'app-workexperience-modal',
  templateUrl: './workexperience-modal.component.html',
  styleUrls: ['./workexperience-modal.component.scss']
})
export class WorkexperienceModalComponent implements OnInit {


  @Input() id: number;
  @Input() UserId: number;
  @Input() jsonObj: any;
  @Input() objStorageJson: any;
  @Input() LstExperience: any;
  @Input() LstWorkExperienceDocumentTypes : any;

  workExpForm: FormGroup;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  MenuId: any;
  noticePeriod = _NoticePeriod;
  FileName: any;
  unsavedDocumentLst = [];
  DocumentId: any;

  isExists: boolean = false; // for country - is already exists 

  ExperienceInfoListGrp: ExperienceInfo;
  FunctionalAreaList: FunctionalAreaList[] = [];

  firstTimeDocumentId: any;
  popupId: any;

  EnddateminDate: Date;
  isLoading: boolean = true;
  spinnerText: string = "Uploading";
  _loginSessionDetails: LoginResponses;
  userAccessControl;
  BusinessType: any;

  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];

  @ViewChild('tagInput') tagInputRef: ElementRef;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;

  MaxSize: any = 0;
  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    public onboardingService: OnboardingService,
    public fileuploadService: FileUploadService

  ) {
    this.createForm();
  }

  get g() { return this.workExpForm.controls; } // reactive forms validation 

  createForm() {


    this.workExpForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      isFresher: [false],
      companyName: ['', Validators.required],
      isCurrentCompany: [false],
      title: ['', Validators.required],
      workLocation: ['', Validators.required],
      startdate: ['', Validators.required],
      enddate: ['', Validators.required],
      // fucntionalArea: [''],
      lastDrawnSalary: ['', Validators.required],
      noticePeriod: [null],
      rolesAndResponsiabilities: [''],
      DocumentId: [null,Validators.required],
      FileName: [null,Validators.required],
      IsDocumentDelete: [false], // extra prop

      OldEmployeeId: [null],
      HREmailID: [""],
      ManagerName: [""],
      ManagerEmailID: ["",[Validators.email]],
      ManagerContactNumber: ["", [Validators.pattern('[0-9]*'),Validators.minLength(10),Validators.maxLength(10)]],
      ManagerDesignation: [""],
      idProoftype: [null,Validators.required],
    });


  }


  ngOnInit() {
    
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;

    this.EnddateminDate = new Date();

    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    this.objStorageJson = JSON.parse(this.objStorageJson);
    console.log(this.objStorageJson.ClientId);
    this.workExpForm.valueChanges

      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

    this.popupId = (this.workExpForm.get('Id').value);


    try {
      let mode = this.id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");
    } catch (error) {

    }


    if (this.jsonObj) {

      console.log('this.jsonObj', this.jsonObj);

      this.popupId = this.jsonObj.Id;
      this.firstTimeDocumentId = this.jsonObj.DocumentId;

      this.jsonObj.idProoftype = this.jsonObj.idProoftype == null || this.jsonObj.idProoftype == '' ? null : this.jsonObj.idProoftype;

      // var a = this.jsonObj.fucntionalArea;

      // var b = a.split(',').map(function (item) {
      //   return parseInt(item, 10);
      // });

      // console.log('b', b);

      // this.jsonObj.fucntionalArea = b;
      this.jsonObj.startdate = new Date(this.jsonObj.startdate);
      this.jsonObj.enddate = new Date(this.jsonObj.enddate)

      var temp = new Array();
      // this will return an array with strings "1", "2", etc.
      temp = this.jsonObj.HREmailID != null && this.jsonObj.HREmailID != "" && this.jsonObj.HREmailID != undefined ? this.jsonObj.HREmailID.split(",") : [];
      this.ccmailtags = temp;

      this.jsonObj.HREmailID = '';

      this.workExpForm.patchValue(this.jsonObj);



      if (this.jsonObj.DocumentId && this.jsonObj.FileName) {

        this.FileName = this.jsonObj.FileName;
        this.DocumentId = this.jsonObj.DocumentId;

        /* #region  AFTER JSZIP */
        this.spinnerText = "Loading";
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
                      console.log('fileObject', this.fileObject);
                    });
                  }
                });
              });
            }
          })
        /* #endregion */
      }
      if (this.jsonObj && this.jsonObj.isCurrentCompany == true) {
        this.workExpForm.get('HREmailID').setErrors(null);
        this.updateValidation(true, this.workExpForm.get('noticePeriod'))
        this.updateValidation(true, this.workExpForm.get('OldEmployeeId'))
        this.updateValidation(true, this.workExpForm.get('ManagerName'))
        this.updateValidation(true, this.workExpForm.get('ManagerEmailID'))
        this.updateValidation(true, this.workExpForm.get('ManagerContactNumber'))
        this.updateValidation(true, this.workExpForm.get('ManagerDesignation'))
      } 
    }
    this.doCheckAccordion();


  }

  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
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


  public doCheckAccordion(): void {


    this.onboardingService.getOnboardingInfo("isEmploymentInfo", this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.objStorageJson.ClientId == null ? 0 : this.objStorageJson.ClientId) : 0)
      .subscribe(authorized => {

        console.log(authorized);

        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {

          this.ExperienceInfoListGrp = JSON.parse(apiResult.Result);
          this.FunctionalAreaList = this.ExperienceInfoListGrp.FunctionalAreaList;

        }

      }), ((err) => {

      });

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


  onChangeStartDate(event) {

    // this.workExpForm.controls['enddate'].setValue(null);
    if (this.workExpForm.get('startdate').value != null || this.workExpForm.get('startdate').value != undefined) {
      var StartDate = new Date(event);

      this.EnddateminDate = new Date();

      this.EnddateminDate.setMonth(StartDate.getMonth());
      this.EnddateminDate.setDate(StartDate.getDate() + 1);
      this.EnddateminDate.setFullYear(StartDate.getFullYear());

    }
  }
  onChangeCurrentFlag(e: any) {

    let isCurrentCompany = this.workExpForm.get('isCurrentCompany').value;
    if (isCurrentCompany == true) {
      this.updateValidation(true, this.workExpForm.get('noticePeriod'))
      this.updateValidation(true, this.workExpForm.get('OldEmployeeId'))
      this.updateValidation(true, this.workExpForm.get('HREmailID'))
      this.updateValidation(true, this.workExpForm.get('ManagerName'))
      this.updateValidation(true, this.workExpForm.get('ManagerEmailID'))
      this.updateValidation(true, this.workExpForm.get('ManagerContactNumber'))
      this.updateValidation(true, this.workExpForm.get('ManagerDesignation'))
    } else {
      this.updateValidation(false, this.workExpForm.get('noticePeriod'))
      this.updateValidation(false, this.workExpForm.get('OldEmployeeId'))
      this.updateValidation(false, this.workExpForm.get('HREmailID'))
      this.updateValidation(false, this.workExpForm.get('ManagerName'))
      this.updateValidation(false, this.workExpForm.get('ManagerEmailID'))
      this.updateValidation(false, this.workExpForm.get('ManagerContactNumber'))
      this.updateValidation(false, this.workExpForm.get('ManagerDesignation'))
    }

  }

  IdFroofChange(evnt) {
    if (evnt) {
      this.MaxSize = evnt.MaxSize;
    }
    else {
      this.MaxSize = 0;
      this.fileList = [];
      this.isFileChange = true;
    }
  }

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }


  onKeyUp(event: KeyboardEvent): void {
    this.CCemailMismatch = false;
    const inputValue: string = this.workExpForm.controls.HREmailID.value;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue);
        this.workExpForm.controls.HREmailID.setValue('');
      }
    }
  }

  addTag(tag: any): void {
    console.log((tag));
    if (tag) {
      const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (matches) {
        this.CCemailMismatch = false;
        if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
          tag = tag.slice(0, -1);
        }
        if (tag.length > 0 && !_.find(this.ccmailtags, tag)) { // lodash
          this.ccmailtags.push(tag);
        }
      } else {
        this.CCemailMismatch = true;
      }
      // return matches ? null : { 'invalidEmail': true };
    } else {

      return null;
    }

  }

  removeTag(tag?: string): void {
    if (!!tag) {
      _.pull(this.ccmailtags, tag); // lodash
    } else {
      this.ccmailtags.splice(-1);
    }
  }


  onchangeCC(event) {
    let tag = event.target.value;
    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      this.CCemailMismatch = false;
      if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
        tag = tag.slice(0, -1);
      }
      if (tag.length > 0 && !_.find(this.ccmailtags, tag)) { // lodash
        this.ccmailtags.push(tag);
        event.target.value = null;
      }
    } else {
      this.CCemailMismatch = true;
    }
  }


  savebutton(): void {

    this.submitted = true;
    if(this.ccmailtags.length <= 0) {
      this.isLoading = true;
      return;
    }
    if (this.workExpForm.invalid) {
      this.isLoading = true;
      return;
    }
    
    this.updateValidation(false, this.workExpForm.get('idProoftype'));
    this.updateValidation(false, this.workExpForm.get('DocumentId'));

    if (this.workExpForm.value.FileName == null || this.workExpForm.value.FileName == undefined) {
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.workExpForm.value.FileName = this.FileName;
    }

   

    if (this.jsonObj != undefined && this.jsonObj.CandidateDocument != null) {
      this.workExpForm.addControl('CandidateDocument', new FormControl(this.jsonObj.CandidateDocument));
      this.isLoading = true;
    }

    // if (this.workExpForm.get('HREmailID').value != null && this.workExpForm.get('HREmailID').value != '' && this.workExpForm.get('HREmailID').value != undefined) {

    //   const matches = this.workExpForm.get('HREmailID').value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    //   if (matches) {
    //     this.ccmailtags.push(this.workExpForm.get('HREmailID').value)
    //   }
    //   else {
    //     this.CCemailMismatch = true;
    //     this.alertService.showWarning("This alert says that, Please type your HR Email address in the format example@domain.com");
    //     return;
    //   }



    // }
    if (this.ccmailtags.length > 0) {
      this.workExpForm.controls['HREmailID'].setValue(_.union(this.ccmailtags).join(","));
    }

    let DocumentId = this.workExpForm.get('DocumentId').value;
    let IdProofType = this.workExpForm.get('idProoftype').value;

    if ((this.fileList && this.fileList.length == 0) && (IdProofType != null)) {
      this.workExpForm.get('DocumentId').setValue(null);
      return this.alertService.showWarning('Attachment is required !');
    }


    if (DocumentId != null && IdProofType == null) {

      this.updateValidation(true, this.workExpForm.get('idProoftype'));
      return;
    }
    else if (DocumentId == null && IdProofType != null) {
      this.updateValidation(true, this.workExpForm.get('DocumentId'));
      return;
    }
    if (DocumentId != null) {
      if (IdProofType == null) {
        this.alertService.showWarning("Oh... Snap! This alert needs your attention, because attachment type is required.");
        return;
      }
    }
    // this.spinnerStarOver();

    this.activeModal.close(this.workExpForm.value);


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
  //         this.workExpForm.controls['IsDocumentDelete'].setValue(true);
  //         this.workExpForm.controls['FileName'].setValue(null);

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
  //         this.workExpForm.controls['DocumentId'].setValue(null);
  //         this.workExpForm.controls['FileName'].setValue(null);
  //         this.FileName = null;
  //         this.DocumentId = null;
  //         this.workExpForm.controls['IsDocumentDelete'].setValue(false);
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

  //           this.workExpForm.controls['DocumentId'].setValue(apiResult.Result);
  //           this.workExpForm.controls['FileName'].setValue(this.FileName);
  //           this.DocumentId = apiResult.Result;
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

   

    if (this.fileList && this.fileList.length == 0) {
      this.workExpForm.controls['DocumentId'].setValue(null);
      this.workExpForm.controls['FileName'].setValue(null);
      this.FileName = null;
      this.DocumentId = null;
    }

    let IdProofType = this.workExpForm.get('idProoftype').value;
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
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_workexperienceDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
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
              //   this.workExpForm.controls['IsDocumentDelete'].setValue(true);
              //   this.workExpForm.controls['FileName'].setValue(null);
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
        //   this.workExpForm.controls['IsDocumentDelete'].setValue(true);
        //   this.workExpForm.controls['FileName'].setValue(null);

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
          this.workExpForm.controls['DocumentId'].setValue(null);
          this.workExpForm.controls['FileName'].setValue(null);
          // this.FileName = null;
          // this.DocumentId = null;
          this.workExpForm.controls['IsDocumentDelete'].setValue(false);
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

            this.workExpForm.controls['DocumentId'].setValue(apiResult.Result);
            this.workExpForm.controls['FileName'].setValue(this.FileName);
            this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file");
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
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
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
          this.workExpForm.controls['DocumentId'].setValue(null);
          this.workExpForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.workExpForm.controls['IsDocumentDelete'].setValue(false);


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

