import { Component, EventEmitter, Input, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SessionKeys } from '@services/configs/app.config';
import { LoginResponses } from '@services/model';
import { ObjectStorageDetails } from '@services/model/Candidates/ObjectStorageDetails';
import { AlertService, ClientContactService, ClientService, EmployeeService, FileUploadService, SessionStorage } from '@services/service';
import { takeUntil } from 'rxjs/operators';
import { isObjectEmpty, validateAllFormFields } from 'src/app/utility-methods/utils';
import Swal from 'sweetalert2';
import { switchMap } from 'rxjs/operators';
import { ClientDocumentService } from '@services/service/client-document.service';
import { ClientDocuments, TriggeringActionType } from '@services/model/Document/DocumentCategory';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { CandidateListingScreenType } from '@services/model/OnBoarding/CandidateListingScreenType';
import { forkJoin } from 'rxjs';
import { apiResponse } from '@services/model/apiResponse';
import { UIMode } from '@services/model/UIMode';
import { environment } from 'src/environments/environment';
import { ThemeService } from 'ng2-charts';

@Component({
  selector: "app-upload-hr-docs",
  templateUrl: "./upload-hr-docs.component.html",
  styleUrls: ["./upload-hr-docs.component.scss"],
})
export class UploadHrDocsComponent implements OnInit, OnDestroy {
  @Input() documentId: number;
  private stopper: EventEmitter<any> = new EventEmitter();
  clientDocumentSettingForm: FormGroup;
  clientDocumentFormGroup: FormGroup;
  isDownloadAdvancedOptionVisible: boolean = false;
  isViewAdvancedOptionVisible: boolean = false;
  BusinessType: number = 0;
  CompanyId: number = 0;
  loginSessionDetails: LoginResponses;
  documentFileObj: any = {};
  documentLogoFileObj: any = {};
  isObjectEmpty = isObjectEmpty;
  clientDocumentSavedData: any;
  triggeringActionTypeList: Object;
  _loginSessionDetails: any;
  RoleId: any;
  spinner: boolean;
  index: number = 0;
  clientsList: any;
  documentCategoryList: any = [];
  ClientDocumentsFolder: any = [];
  groupsList: any;
  employeeList: any;
  documentDetailsObj: any;
  Id: number = 0;
  clientId: number;
  extensionsList: Array<any> = environment.environment.AllowedFileTypesTobeUploadedForHRDocuments || [];
  minDate: Date = new Date();
  editMode:boolean=false;

  constructor(
    private formBuilder: FormBuilder,
    private activeModal: NgbActiveModal,
    private fileuploadService: FileUploadService,
    private sessionService: SessionStorage,
    public modalService: NgbModal,
    private clientDocumentService: ClientDocumentService,
    private utilsHelper: enumHelper,
    public employeeService: EmployeeService,
    public clientService: ClientService,
    private clientContactService: ClientContactService,
    private alertService: AlertService
  ) {
    this.loginSessionDetails = JSON.parse(
      this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    );
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null
      ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(
        (item) => item.CompanyId == this.loginSessionDetails.Company.Id
      ).BusinessType
      : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
    this.clientDocumentSettingForm = this.formBuilder.group({
      ClientDocumentId: [null],
      VersionNo: [null, Validators.required],
      DisplayName: [null, Validators.required],
      EffectiveDate: [null, Validators.required],
      AllowedGroups: [null],
      ExcludeGroupIds: [null],
      ExcludeEmployeeIds: [null],
      ValidTill: [null, Validators.required],
      DisplayOrder: [null, Validators.required],
      TriggeringActionType: [null, Validators.required],
      Id: [0]
    });

    this.clientDocumentFormGroup = this.formBuilder.group({
      clientId: [null],
      Code: ["", Validators.required],
      Name: ["", Validators.required],
      DisplayName: ["", Validators.required],
      DocumentCategoryId: [null, Validators.required], //call existing document category api
      FolderId: [null],
      Extension: [null,Validators.required],
      IsDowloadApplicable: [false],
      IsMandatorytoView: [false],
      IsSkipAllowable: [false],
      IsVisible: [false],
      Id: [0]
    });
  }

  ngOnInit() {
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(
      this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    );
    this.clientId = this.BusinessType == 3 ? 0 : this.sessionService.getSessionStorage("default_SME_ClientId") || 0;

    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.triggeringActionTypeList =
      this.utilsHelper.transform(TriggeringActionType);
    console.log(this.documentId);
    this.loademployeeRecords();
    this.getMasterData();
    this.clientDocumentFormGroup.controls['clientId'].valueChanges.subscribe((val: any) => {
      console.log(val)
      if (val) {
        this.clientId = val;
        this.getGroupsListByClientId(val)
      }
    });
    console.log(this.documentId)
    if(this.documentId){
      this.Id = this.documentId;
      this.patchDocumentOnEdit();
    }
  }

  onFileUpload(file: { base64: string; filename: string }[], type: string) {
    this.editMode=false;
    this.documentFileObj = file[0];
  }

  loademployeeRecords() {
    let ScreenType = CandidateListingScreenType.Payroll;
    let searchParam = "Payroll";
    this.employeeService
      .getEmployeeList(ScreenType, this.RoleId, searchParam)
      .subscribe((data) => {
        console.log(data);
        let apiResult = data;

        if (apiResult.Result != "")
          this.employeeList = JSON.parse(apiResult.Result);
        console.log('PAYROLL EMPS ::', this.employeeList);
        this.spinner = false;
      }),
      (err) => {
        this.spinner = false;
      };
  }

  patchDocumentOnEdit() {
    this.spinner=true;
    this.editMode=true;
    this.clientDocumentService.getClientDocumentsById(this.documentId).subscribe((data: any) => {
      if (data.Status) {
        this.documentDetailsObj = data.dynamicObject;
        if(data.dynamicObject.FolderId==0){
          data.dynamicObject.FolderId=null;
        }
        this.clientDocumentFormGroup.patchValue(data.dynamicObject);
        this.spinner=false;
        if (data.dynamicObject.LstClientDocumentSettings != null && data.dynamicObject.LstClientDocumentSettings.length)
          this.clientDocumentSettingForm.patchValue(data.dynamicObject.LstClientDocumentSettings[0]);
        this.clientDocumentSettingForm.controls['EffectiveDate'].patchValue(new Date(data.dynamicObject.LstClientDocumentSettings[0].EffectiveDate));
        this.clientDocumentSettingForm.controls['ValidTill'].patchValue(new Date(data.dynamicObject.LstClientDocumentSettings[0].ValidTill));
      } else {
        this.alertService.showWarning(data.Message)
      }
    })
  };
  deleteEditFile(){
    this.editMode=false;
  }

  getGroupsListByClientId(clientId) {
    this.clientService.GetGroupByClientId(clientId)
      .subscribe((data: apiResponse) => {
        console.log(data);
        if (data.Status) {
          this.groupsList = data.dynamicObject;
        }

      }, (err) => {
        this.spinner = false;
      })

  };

  getMasterData() {
    this.spinner = true;
    let req1 = this.clientContactService
      .getclientList()
      .pipe(takeUntil(this.stopper));
    let req2 = this.clientDocumentService
      .getClientDocumentsLookupDetails()
      .pipe(takeUntil(this.stopper));

    forkJoin([req1, req2]).subscribe(
      (results: any) => {
        this.spinner = false;
        if (results[0].Status) {
          this.clientsList = results[0].dynamicObject;
        }
        if (results[1].Status) {
          this.documentCategoryList =
            results[1].dynamicObject &&
            results[1].dynamicObject.documentcategoryList;
            this.ClientDocumentsFolder =
            results[1].dynamicObject &&
            results[1].dynamicObject.ClientDocumentsFolder;
            this.extensionsList = results[1].dynamicObject &&
            results[1].dynamicObject.ExtensionList;
        }
      },
      (err: any) => {
        this.spinner = false;
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      }
    );
  };

  doDeleteFile(objName: string) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure you want to delete?",
        text: "This item will be deleted immediately. You can't undo this file.",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Ok!",
        cancelButtonText: "No, cancel!",
        allowOutsideClick: false,
        reverseButtons: true,
      })
      .then((result) => {
        console.log(result);

        if (result.value) {
          if (objName === "document") {
            this.documentFileObj = {};
          } else if (objName === "documentLogo") {
            this.documentLogoFileObj = {};
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalWithBootstrapButtons.fire(
            "Cancelled",
            "Your request has been cancelled",
            "error"
          );
        }
      });
  }

  handleDocUpload() {
    let clientDocumentObj = new ClientDocuments();
    let folderId = this.clientDocumentFormGroup.value.FolderId != null ? this.clientDocumentFormGroup.value.FolderId : 0;
    this.clientDocumentFormGroup.patchValue({ FolderId: folderId });
    clientDocumentObj = {
      ...this.clientDocumentFormGroup.value,
      lstClientDocumentSettings: [{ ...this.clientDocumentSettingForm.value, ...((this.clientDocumentSettingForm.value.Id != null && this.clientDocumentSettingForm.value.Id > 0) && { Id: this.clientDocumentSettingForm.value.Id, modetype: UIMode.Edit, ObjectStorageId: this.documentDetailsObj.LstClientDocumentSettings[0].ObjectStorageId }), status: 1 }],
      ...((this.clientDocumentFormGroup.value.Id != null && this.clientDocumentFormGroup.value.Id > 0) && { Id: this.documentDetailsObj.Id, modetype: UIMode.Edit }),
      clientId: Number(this.clientId),
      status: 1
    };
    let docObjStorage = new ObjectStorageDetails();
    if (!isObjectEmpty(this.documentFileObj) && clientDocumentObj.Id == 0) {
      //map the properties
      docObjStorage.Id = 0;
      docObjStorage.ClientContractCode =
        this.BusinessType == 3
          ? ""
          : this.sessionService.getSessionStorage("default_ContractCode") ==
            null
            ? ""
            : this.sessionService
              .getSessionStorage("default_ContractCode")
              .toString();

      docObjStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_clientcode") || "";
      docObjStorage.CompanyCode =
        this.sessionService.getSessionStorage("CompanyCode") == null
          ? ""
          : this.sessionService.getSessionStorage("CompanyCode").toString();
      docObjStorage.ClientContractId = 0;
      docObjStorage.CandidateId = 0;
      docObjStorage.ClientId = clientDocumentObj.clientId;
      docObjStorage.CompanyId = this.CompanyId;
      docObjStorage.Status = true;
      docObjStorage.Content = this.documentFileObj.base64;
      docObjStorage.SizeInKB = 12;
      docObjStorage.ObjectName = this.documentFileObj.filename || "";
      docObjStorage.OriginalObjectName = this.documentFileObj.filename || "";
      docObjStorage.Type = 0;
      docObjStorage.ObjectCategoryName = "Proofs";
    } else if (clientDocumentObj.Id > 0) {
      // if (this.documentFileObj.hasOwnProperty('base64')) {
      if (!isObjectEmpty(this.documentFileObj)) {
        docObjStorage.Id = 0;
        docObjStorage.ClientContractCode =
          this.BusinessType == 3
            ? ""
            : this.sessionService.getSessionStorage("default_ContractCode") ==
              null
              ? ""
              : this.sessionService
                .getSessionStorage("default_ContractCode")
                .toString();
        docObjStorage.ClientCode = this.sessionService.getSessionStorage("default_clientcode") || "";
        docObjStorage.CompanyCode =
          this.sessionService.getSessionStorage("CompanyCode") == null
            ? ""
            : this.sessionService.getSessionStorage("CompanyCode").toString();
        docObjStorage.ClientContractId = 0;
        docObjStorage.CandidateId = 0;
        docObjStorage.ClientId = clientDocumentObj.clientId;
        docObjStorage.CompanyId = this.CompanyId;
        docObjStorage.Status = true;
        docObjStorage.Content = this.documentFileObj.base64;
        docObjStorage.SizeInKB = 12;
        docObjStorage.ObjectName = this.documentFileObj.filename || "";
        docObjStorage.OriginalObjectName = this.documentFileObj.filename || "";
        docObjStorage.Type = 0;
        docObjStorage.ObjectCategoryName = "Proofs";
        this.fileuploadService
          .postObjectStorage(docObjStorage)
          .pipe(takeUntil(this.stopper)).subscribe((resp: any) => {
            if (resp.Result) {
              clientDocumentObj.lstClientDocumentSettings[0].objectStorageId = resp.Result;
              clientDocumentObj.lstClientDocumentSettings[0].effectiveDate =
              this.clientDocumentSettingForm.controls["EffectiveDate"].value.toISOString();
              clientDocumentObj.lstClientDocumentSettings[0].validTill =
              this.clientDocumentSettingForm.controls["ValidTill"].value.toISOString();
              this.handleEditDocument(clientDocumentObj);
              return;
            }
          })
      } else {
        if(this.clientDocumentSettingForm.controls['EffectiveDate'].value > this.clientDocumentSettingForm.controls['ValidTill'].value){
          this.alertService.showWarning("Valid Till Date should be greater than Effective Date");
          return;
        }
        this.handleEditDocument(clientDocumentObj);
        return;
      }
    };

    if(!docObjStorage.hasOwnProperty("ObjectName")){
      this.alertService.showWarning("Kindly upload a document.");
      return;
    }
    if(this.clientDocumentSettingForm.controls['EffectiveDate'].value > this.clientDocumentSettingForm.controls['ValidTill'].value){
      this.alertService.showWarning("Valid Till Date should be greater than Effective Date");
      return;
    }
    this.spinner = true;
    this.fileuploadService
      .postObjectStorage(docObjStorage)
      .pipe(
        takeUntil(this.stopper),
        switchMap((response: any) => {
          console.log(response);
          if (response.Result) {
            clientDocumentObj.lstClientDocumentSettings[0].ClientDocumentId = 0;
            clientDocumentObj.lstClientDocumentSettings[0].storageDetails = {} as ObjectStorageDetails;
            clientDocumentObj.lstClientDocumentSettings[0].objectStorageId = response.Result;
            clientDocumentObj.lstClientDocumentSettings[0].effectiveDate =
              this.clientDocumentSettingForm.controls["EffectiveDate"].value.toISOString();
            clientDocumentObj.lstClientDocumentSettings[0].validTill =
              this.clientDocumentSettingForm.controls["ValidTill"].value.toISOString();
            console.log(clientDocumentObj);
            return this.clientDocumentService
              .upsertClientDocuments(clientDocumentObj)
              .pipe(takeUntil(this.stopper));
          } else {
            this.alertService.showWarning(response.Message);
          }

        })
      )
      .subscribe((data: any) => {
        console.log(data, "upsert client document");
        this.spinner = false;

        if (data.Status) {

          this.closeModal();
          this.alertService.showSuccess('Document Successfully Uploaded.');
        } else {
          this.alertService.showWarning(data.Message);
        }

      }, (err) => this.alertService.showWarning(err));
  };


  handleEditDocument(data: any) {
    this.spinner = true;
    this.clientDocumentService.upsertClientDocuments(data).pipe(takeUntil(this.stopper)).subscribe((data: any) => {
      this.spinner = false;
      this.closeModal();
      if (data.Status) {
        this.alertService.showSuccess('Document Successfully Modified.');
      } else {
        this.alertService.showWarning(data.Message);
      }
    }, (err) => this.alertService.showWarning(err))
  };

  uploadDocument() {
    if (this.clientDocumentSettingForm.invalid && this.clientDocumentFormGroup.invalid) {
      validateAllFormFields(this.clientDocumentSettingForm);
      validateAllFormFields(this.clientDocumentFormGroup);
      return;
    }
    this.handleDocUpload();
  };

  closeModal() {

    this.clientDocumentFormGroup.reset();
    this.clientDocumentSettingForm.reset();
    this.activeModal.close(false);
  };

  previous() {
    this.index -= 1;
  };

  next() {
    if (this.clientDocumentFormGroup.invalid) {
      validateAllFormFields(this.clientDocumentFormGroup);
      return;
    }
    this.index += 1;
  };

  onChangeDate(event) {
    // this.clientDocumentSettingForm.controls['ValidTill'].setValue(null);
    this.minDate = new Date(event);
    this.minDate.setDate(this.minDate.getDate() + 1);
    console.log(this.minDate)
  };

  getAllowedFileTypes(){
    const type = this.clientDocumentFormGroup.controls['Extension'].value;
    const fileType = this.extensionsList.find((file) => file.Value === type);
    return fileType ? fileType.acceptTypes : [];
  }

  get getMaxFileSizeToUpload(){
    const type = this.clientDocumentFormGroup.controls['Extension'].value;
    const fileType = this.extensionsList.find((file) => file.Value === type);
    return fileType ? fileType.MaxFileSize : [];
  }

  ngOnDestroy() {
    this.stopper.next();
    this.stopper.complete();
  }
}
