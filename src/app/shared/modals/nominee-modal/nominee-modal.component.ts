import { Component, OnInit, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import Swal from "sweetalert2";
import * as JSZip from 'jszip';

// services
import { AlertService } from '../../../_services/service/alert.service';
import { UIBuilderService } from '../../../_services/service/UIBuilder.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { OnboardingService } from '../../../_services/service/onboarding.service';

// directives

import { enumHelper } from '../../directives/_enumhelper';

import * as _ from 'lodash';
import { Relationship,Occupation } from '../../../_services/model/Base/HRSuiteEnums';
import { UUID } from 'angular2-uuid';
import { apiResult } from 'src/app/_services/model/apiResult';
import { FamilyInfo, FamilyDocumentCategoryist } from 'src/app/_services/model/OnBoarding/FamilyInfo';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';

import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { DatePipe } from '@angular/common';
import { FloatLabelType } from '@angular/material';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
// import {mixmaxcheck} from '../../../shared/directives/minMaxCheck';

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

@Component({
  selector: 'app-nominee-modal',
  templateUrl: './nominee-modal.component.html',
  styleUrls: ['./nominee-modal.component.scss']
})
export class NomineeModalComponent implements OnInit {

  @Input() id: number = 0;
  @Input() UserId: number;
  @Input() jsonObj: any;
  @Input() objStorageJson: any;
  @Input() LstNominees: any[] = [];
  @Input() OT: any;
  @Input() isESICapplicable: any;
  @Input() DocumentsList: any;
  @Input() maritialStatus: any = 0;
  candidatesForm: FormGroup;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  MenuId: any;

  FamilyInofListGrp: FamilyInfo;
  FamilyDocumentCategoryList: FamilyDocumentCategoryist;


  relationship: any = [];
  FileName: any;
  unsavedDocumentLst = [];
  DocumentId: any;

  firstTimeDocumentId: any;
  popupId: any;

  isExists: boolean = false; // for country - is already exists

  minDate: Date;
  maxDate: Date;

  isLoading: boolean = true;
  spinnerText: string = "Uploading";

  _loginSessionDetails: LoginResponses;
  userAccessControl;
  BusinessType: any;
  MaxSize: any = 0;
  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];
  dobAge = 0;
  empClientContractName = '';
  showIsDependentForRelationShipTypeValues = environment.environment.ShowIsDependentForRelationShipTypeValues;
  occupationDropDownValues = this.utilsHelper.transform(Occupation)
  isAllenDigital: boolean = false;
  ACID = environment.environment.ACID;
  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private utilsHelper: enumHelper,
    public onboardingService: OnboardingService,
    public fileuploadService: FileUploadService,
    public datePipe: DatePipe
  ) {
    this.createForm();
  }

  get g() { return this.candidatesForm.controls; } // reactive forms validation

  createForm() {


    this.candidatesForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      nomineeName: ['', Validators.required],
      relationship: [null, Validators.required],
      DOB: ['', Validators.required],
      // FamilyaAdhar: [''],
      idProoftype: [null],
      FamilyisEmployed: [false],
      FamilyPF: ['', [mixmaxcheck]],
      FamilyESIC: ['', [mixmaxcheck]],
      FamilyGratuity: ['', [mixmaxcheck]],
      mediclaim: [false],
      DocumentId: [null],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop,

      IsNominee: [false],
      IsDependent: [false],
      WeddingDate: [null],
      IsAlive: [true],
      FamilyEmployeeID: [null],
      Occupation: [null,Validators.required]

    });


  }


  ngOnInit() {

    this.spinnerStarOver();
    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    this.relationship = this.utilsHelper.transform(Relationship);
    this.objStorageJson = JSON.parse(this.objStorageJson);    
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.isAllenDigital = (Number(this.ACID) === 1988 && ( this.BusinessType === 1 ||  this.BusinessType === 2)) ? true : false;
    
    console.log('LstNominees', this.LstNominees);

    if (this.LstNominees.length > 0 && this.LstNominees.filter(a => a.relationship == 1 || a.relationship == 2).length > 0 && this.LstNominees.find(a => a.relationship == 1 || a.relationship == 2).WeddingDate != null) {
      this.candidatesForm.controls['WeddingDate'].setValue(new Date(this.LstNominees.find(a => a.relationship == 1 || a.relationship == 2).WeddingDate))
    }

    if (this.isESICapplicable) {
      this.updateValidation(true, this.candidatesForm.get('FamilyESIC'));
    }

    console.log(this.objStorageJson.ClientId);
    console.log('json', this.jsonObj);

    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);
    this.popupId = (this.candidatesForm.get('Id').value);

    if (this.jsonObj) {
      this.disableBtn = true;
      this.jsonObj.DOB = this.datePipe.transform(this.jsonObj.DateofBirth, "dd-MM-yyyy");
      this.jsonObj.idProoftype = this.jsonObj.idProoftype == null || this.jsonObj.idProoftype == '' ? null : this.jsonObj.idProoftype;
      this.popupId = this.jsonObj.Id;
      this.firstTimeDocumentId = this.jsonObj.DocumentId;
      this.jsonObj.WeddingDate = this.jsonObj.WeddingDate != null && this.jsonObj.WeddingDate != '0001-01-01T00:00:00' ? new Date(this.jsonObj.WeddingDate) : null
      this.candidatesForm.patchValue(this.jsonObj);
      // JSzip
      this.candidatesForm.get('DocumentId').setValue(this.jsonObj.DocumentId);

      if (this.jsonObj.DocumentId && this.jsonObj.FileName) {

        this.FileName = this.jsonObj.FileName;
        this.DocumentId = this.jsonObj.DocumentId;
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
      }

    }

    this.candidatesForm.valueChanges

      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });

    // alert(this.OT)
    try {
      let mode = 2; // add-1, edit-2, view, 3
      let groupControlName = this.OT == 'proxy' ? "Flash" : "Detailed";
      this.UIBuilderService.doApply(mode, this, this.MenuId, groupControlName);

    } catch (Exception) {

      console.log("exception ", Exception);

    }



    this.doCheckAccordion();
    this.setClientContractName();
    this.filterRelationships()
  }
  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }

  filterRelationships() {
    var filteredRelationships: any = [];
    let forbiddenRelationshipsForAllen = ["Guardian"]
    filteredRelationships = this.utilsHelper.transform(Relationship);
  
    if(this.isAllenDigital) {
      this.relationship = this.relationship.filter(relationship => !forbiddenRelationshipsForAllen.includes(relationship.name))
    }
  }

  onChangeRelationShip(event) {
    if((event.id != 1 && event.id != 2)) {
      this.candidatesForm.controls['IsDependent'].setValue(null)
    }
    if ((event.target.value == 1 || event.target.value == 2) && (this.LstNominees.length > 0 && this.LstNominees.filter(a => a.relationship == 1 || a.relationship == 2).length > 0 && this.LstNominees.find(a => a.relationship == 1 || a.relationship == 2).WeddingDate != null)) {
      this.candidatesForm.controls['WeddingDate'].setValue(new Date(this.LstNominees.find(a => a.relationship == 1 || a.relationship == 2).WeddingDate))
    } else {
      this.candidatesForm.controls['WeddingDate'].setValue(null);
    }
  
  }

  onChangeNomineeToggle(event) {
    if(!this.isAllenDigital) {
      const { candidatesForm } = this;
      const controlsToUpdate = ['FamilyPF', 'FamilyGratuity'];
      controlsToUpdate.forEach(controlName => {
        const control = candidatesForm.get(controlName);
        control.setValue(event.target.checked ? '' : 0);
        this.updateValidation(event.target.checked, control);
      });
    }
  }

  onChangeFamilyIsEmployeedToggle(event) {
    const { candidatesForm } = this;
    this.candidatesForm.controls['FamilyEmployeeID'].setValue(null);
    this.candidatesForm.controls['Occupation'].setValue(null);
    this.updateValidation(event.target.checked, candidatesForm.get('FamilyEmployeeID'));
    if(event.target.checked) {
      this.updateValidation(false, candidatesForm.get('Occupation'));

    } else {
      this.updateValidation(true, candidatesForm.get('Occupation'));

    }

  }
  public doCheckAccordion(): void {

    this.onboardingService.getOnboardingInfo("isFamilydetails", this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.objStorageJson.ClientId == null ? 0 : this.objStorageJson.ClientId) : 0)
      .subscribe(authorized => {

        console.log(authorized);

        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {

          this.FamilyInofListGrp = JSON.parse(apiResult.Result);
          this.FamilyDocumentCategoryList = this.FamilyInofListGrp.FamilyDocumentCategoryist;
          for (var i in this.FamilyDocumentCategoryList) {
            for (var j in this.DocumentsList.DocumentCategoryist) {
              if (this.FamilyDocumentCategoryList[i].DocumentTypeId == this.DocumentsList.DocumentCategoryist[j].DocumentTypeId) {
                this.FamilyDocumentCategoryList[i]['MaxSize'] = this.DocumentsList.DocumentCategoryist[j].MaxSize;
              }
            }
          }
          console.log(this.FamilyDocumentCategoryList);


        }

      }), ((err) => {

      });

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

  public findInvalidControls() {
    const invalid = [];
    const controls = this.candidatesForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);

      }
    }
    console.log('invalid', invalid);

    return invalid;
  }


  savebutton(): void {

    this.updateValidation(false, this.candidatesForm.get('idProoftype'));
    this.updateValidation(false, this.candidatesForm.get('DocumentId'));
    if(this.candidatesForm.get('FamilyisEmployed').value) {
      this.updateValidation(false, this.candidatesForm.get('Occupation'));
    }
    if (this.candidatesForm.value.FileName == null || this.candidatesForm.value.FileName == undefined) {
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_approvalDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.candidatesForm.value.FileName = this.FileName;
    }


    let isAlreadyExists = false;
    let totalPF = 0;
    let totalESIC = 0;
    let totalGratuity = 0;
    this.submitted = true;
    this.findInvalidControls();
    // jszip
    this.isLoading = true;
    if (this.candidatesForm.invalid) {
      return;
    }

    if (this.jsonObj != undefined && this.jsonObj.CandidateDocument != null) {
      this.candidatesForm.addControl('CandidateDocument', new FormControl(this.jsonObj.CandidateDocument));

    }

    let Id = this.candidatesForm.get('Id').value;
    let relationship = this.candidatesForm.get('relationship').value;
    let FamilyPF = this.candidatesForm.get('IsNominee').value ? this.candidatesForm.get('FamilyPF').value : 0;
    let FamilyESIC = this.candidatesForm.get('IsNominee').value ? this.candidatesForm.get('FamilyESIC').value : 0;
    let FamilyGratuity = this.candidatesForm.get('IsNominee').value ? this.candidatesForm.get('FamilyGratuity').value : 0;
    let DocumentId = this.candidatesForm.get('DocumentId').value;
    let IdProofType = this.candidatesForm.get('idProoftype').value;

    isAlreadyExists = _.find(this.LstNominees, (a) => a.Id != Id && a.relationship == relationship && ![Relationship['Son'], Relationship['Daughter']].includes(relationship)) != null ? true : false;
    if (isAlreadyExists) {

      this.alertService.showWarning("You have entered a relationship that already passed in this nomiee part. ");
      return;
    }


    if (this.maritialStatus === 1) {
      this.relationship = this.relationship.filter((result) => {
        if ([Relationship['Son'], Relationship['Daughter'], Relationship['Spouse'], Relationship['Father_in_law'], Relationship['Mother_in_law']].includes(result.id)) {
          return this.alertService.showWarning("You cannot choose an unrelated relationship since your marital status is single. Please try again with a different option.");

        }
      });
    }

    if(!this.isAllenDigital) {
      if ((this.fileList && this.fileList.length == 0) && (IdProofType != null)) {
        this.candidatesForm.get('DocumentId').setValue(null);
        return this.alertService.showWarning('Attachment is required !');
      }
  
      if (DocumentId != null && IdProofType == null) {
  
        this.updateValidation(true, this.candidatesForm.get('idProoftype'));
        return;
      }
      else if (DocumentId == null && IdProofType != null) {
        this.updateValidation(true, this.candidatesForm.get('DocumentId'));
        return;
      }  
    }

    this.LstNominees.forEach(element => {

      if (element.Id != Id) {
        totalPF = +Number(element.FamilyPF);
        totalESIC = +Number(element.FamilyESIC);
        totalGratuity = +Number(element.FamilyGratuity);
      }

    });

    console.log(totalPF);

    if (totalPF + Number(FamilyPF) > 100) {
      this.alertService.showWarning("Heads Up!. You cannot exceed your PF coverage of  100%");
      return;

    } else if (totalESIC + Number(FamilyESIC) > 100) {
      this.alertService.showWarning("You cannot exceed your ESIC coverage of  100%");
      return;
    }
    else if (totalGratuity + Number(FamilyGratuity) > 100) {
      this.alertService.showWarning("You cannot exceed your Gratuity coverage of  100%");
      return;
    }
    else if (DocumentId != null) {
      if(!this.isAllenDigital) {
        if (IdProofType == null) {
          this.alertService.showWarning("Oh... Snap! This alert needs your attention, because Proof type is required.");
          return;
        }
      }
    }


    this.activeModal.close(this.candidatesForm.value);
    //  var totalCoverage = Number(this.candidatesForm.get('FamilyPF').value) + Number(this.candidatesForm.get('FamilyESIC').value) + Number(this.candidatesForm.get('FamilyGratuity').value);

    // var totalCoverage = Number(this.candidatesForm.get('FamilyPF').value) + Number(this.candidatesForm.get('FamilyESIC').value) + Number(this.candidatesForm.get('FamilyGratuity').value);

    // if (totalCoverage > 100) {
    //   this.alertService.showWarning("Total coverage is exceed")
    //   return;
    // }


    // this.spinnerStarOver();




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


  spinnerStarOver() {
    // var element = (<HTMLInputElement>document.getElementById('spinner'));
    //    element.style.setProperty("display", "flex", "important");

    // (<HTMLInputElement>document.getElementById('spinner')).style.display = "flex !important";

  }

  spinnerEnd() {

    // var element = document.getElementById('spinner');
    // element.style.setProperty("display", "none", "important");

    // (<HTMLInputElement>document.getElementById('spinner')).style.display = "none";

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

  // before jszip
  // onFileUpload(e) {
  //   let IdProofType = this.candidatesForm.get('idProoftype').value;
  //   if (IdProofType) {
  //     this.isLoading = false;
  //     if (e.target.files && e.target.files[0]) {

  //       const file = e.target.files[0];
  //       const pattern = /image-*/;
  //       var type = e.target.files[0].type;
  //       var size = e.target.files[0].size;
  //       var maxSize = (Math.round(size / 1024) + " KB");
  //       console.log('maxsize',maxSize);
  //       var FileSize = e.target.files[0].size / 1024 / 1024;
  //       var maxfilesize = e.target.files[0].size / 1024;
  //       if ((this.MaxSize && maxfilesize > parseFloat(this.MaxSize)) || (this.MaxSize == 0 && FileSize > 2)) {
  //         this.isLoading = true;
  //         this.alertService.showWarning('The attachment size exceeds the allowable limit.');
  //         return;
  //       }

  //       // if (!file.type.match(pattern)) {
  //       //   this.isLoading = true;
  //       //   alert('You are trying to upload not Image. Please choose image.');
  //       //   return;
  //       // }


  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       reader.onloadend = () => {

  //         this.spinnerText = "Uploading";
  //         this.FileName = file.name;
  //         let FileUrl = (reader.result as string).split(",")[1];
  //         this.doAsyncUpload(FileUrl, this.FileName)

  //       };

  //     }
  //   }
  //   else {
  //     this.alertService.showWarning("Please select Id proof.");
  //   }
  // }


  /* #region  after jszip */

  onAddingFile(e) {
    if (!this.isAllenDigital && this.candidatesForm.controls['idProoftype'].value == null) {
      this.alertService.showWarning('Please select Proof type before uploading attachment');
      return;
    }
    let files = e.target.files;
    let fileSize = 0;
    for (let i = 0; i < files.length; i++) {
      fileSize = Number(fileSize) + files[i].size
    }
    var FileSize = fileSize / 1024 / 1024;
    var maxfilesize = fileSize / 1024;
    if ((this.MaxSize && maxfilesize > parseFloat(this.MaxSize)) || (this.MaxSize == 0 && FileSize > 2)) {
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

    console.log(this.candidatesForm.value);

    this.updateValidation(false, this.candidatesForm.get('WeddingDate'));

    if (this.fileList && this.fileList.length == 0) {
      this.candidatesForm.controls['DocumentId'].setValue(null);
      this.candidatesForm.controls['FileName'].setValue(null);
      this.FileName = null;
      this.DocumentId = null;
    }
    let IdProofType = this.candidatesForm.get('idProoftype').value;
    if (IdProofType !== null && this.fileList.length == 0) {
      this.alertService.showWarning('Kindly please provide attachment for selected Id Proof');
      return;
    }
    if (this.candidatesForm.get('relationship').value == 1 || this.candidatesForm.get('relationship').value == 3 || this.candidatesForm.get('relationship').value == 2) {
      // this.updateValidation(true, this.candidatesForm.get('WeddingDate'));
      // if (!this.candidatesForm.get('WeddingDate').value) {
      //   this.alertService.showWarning('Wedding date is required for relationship father/mother/spouse. Please fill it.');
      //   return;
      // }
    }
    else {
      this.candidatesForm.controls['WeddingDate'].setValue(null);
    }
    if(!this.isAllenDigital) {
      if (IdProofType) {

        let fileSize = 0;
        for (let i = 0; i < this.fileList.length; i++) {
          fileSize = Number(fileSize) + this.fileList[i].size
        }
        var FileSize = fileSize / 1024 / 1024;
        var maxfilesize = fileSize / 1024;
        if ((this.MaxSize && maxfilesize > parseFloat(this.MaxSize)) || (this.MaxSize == 0 && FileSize > 2)) {
          this.isLoading = true;
          this.alertService.showWarning('The attachment size exceeds the allowable limit.');
          return;
        }
  
        this.isLoading = false;
        this.spinnerText = "Uploading";
        if (this.isFileChange && this.fileList.length > 0) {
          var zip = new JSZip();
          var files = this.fileList;
          this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_familyDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
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
                  //   this.candidatesForm.controls['IsDocumentDelete'].setValue(true);
                  //   this.candidatesForm.controls['FileName'].setValue(null);
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
        //   console.log('maxsize',maxSize);
        //   var FileSize = e.target.files[0].size / 1024 / 1024;
        //   var maxfilesize = e.target.files[0].size / 1024;
        //   if ((this.MaxSize && maxfilesize > parseFloat(this.MaxSize)) || (this.MaxSize == 0 && FileSize > 2)) {
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
      else {
        // this.alertService.showWarning("Please select Id proof.");
        this.savebutton();
      }
    } else {
      if (this.fileList.length > 0) {

        let fileSize = 0;
        for (let i = 0; i < this.fileList.length; i++) {
          fileSize = Number(fileSize) + this.fileList[i].size
        }
        var FileSize = fileSize / 1024 / 1024;
        var maxfilesize = fileSize / 1024;
        if ((this.MaxSize && maxfilesize > parseFloat(this.MaxSize)) || (this.MaxSize == 0 && FileSize > 2)) {
          this.isLoading = true;
          this.alertService.showWarning('The attachment size exceeds the allowable limit.');
          return;
        }
  
        this.isLoading = false;
        this.spinnerText = "Uploading";
        if (this.isFileChange && this.fileList.length > 0) {
          var zip = new JSZip();
          var files = this.fileList;
          this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_familyDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
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
            console.log('FILE ZIP ----> ', zip, files);
            zip.generateAsync({
              type: "base64",
            }).then((_content) => {
              if (_content && this.FileName) {
                if (this.DocumentId) {
                  if (this.isGuid(this.popupId)) {
                    this.deleteAsync();
                  }
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
      }
      else {
        this.savebutton();
      }
    }

  }
  /* #endregion */

  /* #region  before jszip */

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
  //         this.candidatesForm.controls['IsDocumentDelete'].setValue(true);
  //         this.candidatesForm.controls['FileName'].setValue(null);
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

  /* #endregion */
  /* #region  after jszip */
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
        //   if (this.isGuid(this.popupId)) {

        //     this.deleteAsync();
        //   }
        //   else if (this.firstTimeDocumentId != this.DocumentId) {

        //     this.deleteAsync();

        //   }

        //   else {

        //     this.FileName = null;
        //     this.candidatesForm.controls['IsDocumentDelete'].setValue(true);
        //     this.candidatesForm.controls['FileName'].setValue(null);
        //   }
      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })
  }
  /* #endregion */

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
          this.candidatesForm.controls['DocumentId'].setValue(null);
          this.candidatesForm.controls['FileName'].setValue(null);
          // this.FileName = null;
          // this.DocumentId = null;
          this.candidatesForm.controls['IsDocumentDelete'].setValue(false);
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")

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
          this.candidatesForm.controls['DocumentId'].setValue(null);
          this.candidatesForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.candidatesForm.controls['IsDocumentDelete'].setValue(false);


        } else {

        }
      } catch (error) {


      }


    }), ((err) => {

    })
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
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";



      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {



        let apiResult: apiResult = (res);
        try {

          if (apiResult.Status && apiResult.Result != "") {

            this.candidatesForm.controls['DocumentId'].setValue(apiResult.Result);
            this.candidatesForm.controls['FileName'].setValue(this.FileName);
            this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            });

            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")
            this.isFileChange = false;
            this.savebutton();
          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.isFileChange = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message);
            this.FileName = true;
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




  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;

    return regexGuid.test(stringToTest);
  }


  getRequired(controlName) {

    // console.log(this.userAccessControl);
    // console.log(controlName);
    this.userAccessControl = this.userAccessControl.filter(z => z.PropertyName == "required" && z.PropertyName != "div" && z.PropertyName != "button" && z.PropertyName != "accordion");
    // console.log(this.userAccessControl);
    var _filter = this.userAccessControl.find(a => (a.ControlName == controlName));
    // console.log('tst', _filter);

    if (_filter != undefined) {

      return _filter.EditValue != "false" && _filter.EditValue != null && _filter.EditValue == "true" ? "*" : "";
    } else {
      return "";
    }
  }

  calculateAge() {
    if(this.candidatesForm.controls.DOB.value) {
      let birthDate = moment(this.candidatesForm.controls.DOB.value);
      let currentDate = moment();
      this.dobAge = currentDate.diff(birthDate, 'years');
    }    
  }

  setClientContractName() {
    if(this.BusinessType == 1 || this.BusinessType == 2 ){
      if (this._loginSessionDetails.ClientContractList) {
        this._loginSessionDetails.ClientContractList.map((client) => {
          if (this.objStorageJson && this.objStorageJson.ClientContractId) {
            if (client.Id == this.objStorageJson.ClientContractId) {
              this.empClientContractName = client.Name
            }
          }
        })
      }
    }
  }
}

