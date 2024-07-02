import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Renderer2, SimpleChanges, ViewChild } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { SessionKeys } from "@services/configs/app.config";
import { ObjectStorageDetails } from "@services/model/Candidates/ObjectStorageDetails";
import { ClientContract } from "@services/model/Client/ClientContract";
import { AlertService, EmployeeService, EventEmiterService, FileUploadService, SessionStorage } from "@services/service";
import { apiResult } from '../../../_services/model/apiResult';
import { NDCStatus, NoDueCertificate } from "@services/model/NoDueCertificate.model";
import { enumHelper } from "../../directives/_enumhelper";
import { FormArray, FormBuilder, FormGroup } from "@angular/forms";
import { LoadingScreenService } from "../../components/loading-screen/loading-screen.service";
import { distinctUntilChanged, takeUntil } from "rxjs/operators";

export interface DefaultSearchInputs {
  ClientId: number;
  ClientContractId: number;
  ClientName: string;
  ClientContractName: string;
  IsNapBased: boolean,
  Client?: any,
  ClientContract?: ClientContract,
  IsReOnboard: boolean;
}

@Component({
  selector: 'app-noDueCertificate',
  templateUrl: './noDueCertificate-modal.component.html',
  styleUrls: ['./noDueCertificate-modal.component.scss']
})

export class NoDueCertificateComponent implements OnInit {

  ndcStatusLst: any;
  loginSessionDetails: any;
  RoleId: number;
  UserId: number;
  BusinessType: number;
  CompanyId
  defaultSearchInputs: DefaultSearchInputs = {
    ClientContractId: 0,
    ClientId: -1,
    ClientName: "",
    ClientContractName: "",
    IsNapBased: false,
    Client: null,
    ClientContract: null,
    IsReOnboard: false
  };
  ndcDocListArr = [];
  ndcInfoArr: NoDueCertificate[] = [];
  @Input() rowData;
  selectedEmpData: any;
  isLoading = true;
  showUploadingSpin = false;
  index: number;
  noDueCertificateForm: FormGroup;
  employeeNDCInfo: any[] = [];
  isNDCComplete = false;
  showNotifySpin = false;
  roleCode: string;
  notifiedArrList = [];
  isDisabled: boolean = false;
  isSaved: boolean = false;
  stopper: EventEmitter<any> = new EventEmitter();
  employeeId: number = 0;

  constructor(
    private activeModal: NgbActiveModal,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private fileuploadService: FileUploadService,
    private renderer: Renderer2,
    private employeeService: EmployeeService,
    private enumHelper: enumHelper,
    private formBuilder: FormBuilder,
    private loadingScreenService: LoadingScreenService,) {
  }

  async ngOnInit() {

    this.initializeForm();
    this.loadLoginSessionDetails();
    await this.getNDCDocumentList(this.employeeId);
    this.ndcStatusLst = this.enumHelper.transform(NDCStatus);
    this.getEmployeeNDCTransaction();

  }

  initializeForm(): void {
    this.noDueCertificateForm = this.formBuilder.group({
      ndcFields: this.formBuilder.array([])
    });
  }

  loadLoginSessionDetails(): void {
    this.selectedEmpData = this.rowData;
    this.employeeId = this.selectedEmpData.EmployeeId;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    this.roleCode = this.loginSessionDetails.UIRoles[0].Role.Code;
    this.UserId = this.loginSessionDetails.UserSession.UserId;
    this.BusinessType = this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.loginSessionDetails.Company.Id).BusinessType : 0;
    this.CompanyId = this.loginSessionDetails.Company.Id;
  }


  getDepartmentName(index) {
    return this.ndcDocListArr.length > 0 && index < this.ndcDocListArr.length && this.ndcDocListArr[index] != undefined && this.ndcDocListArr[index].Name != undefined ? this.ndcDocListArr[index].Name : '';
  }

  async getNDCDocumentList(employeeId): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.employeeService.get_ndcDocumentList(employeeId).pipe(takeUntil(this.stopper)).subscribe(
        response => {
          if (response.Status && response.Result && JSON.parse(response.Result).length > 0) {
            this.ndcDocListArr = JSON.parse(response.Result);
          } else {
            this.alertService.showWarning(response.Message);
          }
          this.isLoading = false;
          resolve();
        },
        error => {
          reject(error);
        }
      );
    });
  }


  async getEmployeeNDCTransaction() {
    try {
      const res1 = await this.getEmployeeNDCTransactionPromise(this.employeeId);
      console.log('get_emp NDC transaction resp', res1);
      if (res1.Status && res1.Result && JSON.parse(res1.Result).length > 0) {
        this.employeeNDCInfo = JSON.parse(res1.Result);
        if (this.employeeNDCInfo.length > 0) {
          this.patchExistingNDCGroup();
        }
      } else if (res1.Status && res1.Result == null) {
        this.createNDCGroup();
      } else {
        this.isLoading = false;
      }
    } catch (error) {
      console.error('Error fetching employee NDC transaction', error);
      this.isLoading = false;
    }
  }

  getEmployeeNDCTransactionPromise(employeeId: number): Promise<any> {
    return new Promise((resolve, reject) => {
      this.employeeService.get_employeeNDCTransaction(employeeId)
        .pipe(takeUntil(this.stopper))
        .subscribe(
          res1 => resolve(res1),
          error => reject(error)
        );
    });
  }

  createNDCGroup() {
    if (this.ndcDocListArr.length > 0) {
      this.ndcDocListArr.forEach((ndcDoc) => {
        let control = this.noDueCertificateForm.get('ndcFields') as FormArray;
        control.push(this.createNDCFieldControls());
        this.notifiedArrList.push({ status: 'Notify ', textClicked: false });
      })
      this.isLoading = false;
    }
  }

  patchExistingNDCGroup() {
    // const expandedEmployeeNDCInfo = this.expandEmployeeNDCInfo(this.ndcDocListArr, this.employeeNDCInfo);
    this.noDueCertificateForm.setControl('ndcFields', this.setNdcFields(this.employeeNDCInfo));
    let ndcFieldsValue = this.noDueCertificateForm.controls['ndcFields'].value;
    this.isLoading = false;
    this.isSaved = true;
    this.checkIsNDCComplete();
  }

  expandEmployeeNDCInfo(ndcDocListArr, employeeNDCInfo) {
    const expandedList = [...employeeNDCInfo];
    while (expandedList.length < ndcDocListArr.length) {
      expandedList.push({
        // NDCChecked: false,
        NDCStatus: 1, // Default or placeholder value
        RecoveryAmount: 0, // Default or placeholder value
        RecoveryRemarks: '', // Default or placeholder value
        // DocumentId: 0, // Default or placeholder value
        // DocumentName : null,
        DocumentId: { DocumentId: 0, DocumentName: '' }

      });
    }
    return expandedList;
  }

  setNdcFields(optionValues): FormArray {
    const formArray = new FormArray([]);
    console.log(optionValues);
    optionValues.forEach((ndcFieldVal) => {
      formArray.push(
        this.formBuilder.group({
          NDCChecked: false,
          NDCStatus: ndcFieldVal.NDCStatus,
          RecoveryAmount: { value: ndcFieldVal.NDCStatus != 1 ? ndcFieldVal.RecoveryAmount : 0, disabled: ndcFieldVal.NDCStatus == 1 ? true : false },
          RecoveryRemarks: { value: ndcFieldVal.NDCStatus != 1 ? ndcFieldVal.RecoveryRemarks : '', disabled: ndcFieldVal.NDCStatus == 1 ? true : false },
          DocumentId: { DocumentId: ndcFieldVal.DocumentId, DocumentName: ndcFieldVal.DocumentName }
        })
      )
      this.notifiedArrList.push({ status: 'Notify', textClicked: false });
    })
    return formArray;
  }

  createNDCFieldControls(): FormGroup {
    return this.formBuilder.group({
      NDCChecked: [],
      NDCStatus: [2],
      RecoveryAmount: [0],
      RecoveryRemarks: [],
      DocumentId: [{ DocumentId: 0, DocumentName: '' }]
    })
  }

  notifyEmployee(index) {
    this.notifiedArrList[index].textClicked = true;
    let ndcData = this.ndcDocListArr[index];
    this.showNotifySpin = true;
    this.index = index;
    let notifyEmpObjArr = [];
    let notifyEmpObj = {
      "NDCDepartmentId": ndcData.Id,
      "NDCDepartmentMappingId": ndcData.MappingId,
      "EmployeeId": this.selectedEmpData.EmployeeId,
      "EmployeeCode": this.selectedEmpData.EmployeeCode
    }
    notifyEmpObjArr.push(notifyEmpObj);
    this.notifyDepartment(JSON.stringify([notifyEmpObj]), '', index);
  }

  notifyDepartment(stringifyArrObj, type, ind) {
    this.employeeService.notifyDepartment(stringifyArrObj).pipe(takeUntil(this.stopper)).subscribe((res) => {
      console.log(res);
      if (res.Status) {
        this.showNotifySpin = false;
        this.alertService.showSuccess('Notified Successfully');
        if (type != 'notifyAll') {
          this.notifiedArrList[ind].status = 'Notified';
        } else {
          this.notifiedArrList = this.notifiedArrList.map((arr: any) => { arr.status = 'Notified'; arr.textClicked = true; return arr; });
          this.isDisabled = true;
        }
        this.loadingScreenService.stopLoading();
      } else {
        this.showNotifySpin = false;
        this.alertService.showWarning(res.Message);
        if (type != 'notifyAll') {
          this.notifiedArrList[ind].status = 'Failed - Retry';
        } else {
          this.isDisabled = true;
          this.notifiedArrList = this.notifiedArrList.map((arr: any) => {
            if (arr.status != 'Notified') {
              arr.status = 'Failed - Retry';
              arr.textClicked = true;
            }
            return arr;
          });
        }
        this.loadingScreenService.stopLoading();
      }
    })
  }

  notifyAll() {

    let formArrayControlVal = this.noDueCertificateForm.get('ndcFields').value;
    console.log(formArrayControlVal);

    if (formArrayControlVal && formArrayControlVal.length > 0) {
      let notifyEmpObjArr = [];
      const processArray = async () => {
        for (let index = 0; index < formArrayControlVal.length; index++) {
          const frmCtrlArr = formArrayControlVal[index];
          if (frmCtrlArr) {
            let ndcData = this.ndcDocListArr[index];
            let notifyEmpObj = {
              "NDCDepartmentId": ndcData.Id,
              "NDCDepartmentMappingId": ndcData.MappingId,
              "EmployeeId": this.selectedEmpData.EmployeeId,
              "EmployeeCode": this.selectedEmpData.EmployeeCode
            };

            let status = this.notifiedArrList[index].status.trim().toUpperCase();

            if (status === 'NOTIFY' || status === 'FAILED - RETRY') {
              notifyEmpObjArr.push(notifyEmpObj);
            }
          }
        }
      };

      processArray().then(() => {
        if (notifyEmpObjArr.length > 0) {
          this.loadingScreenService.startLoading();
          this.notifyDepartment(JSON.stringify(notifyEmpObjArr), 'notifyAll', 0);
        }
      });
    }

    // let formArrayControlVal = this.noDueCertificateForm.controls['ndcFields'].value;
    // console.log(formArrayControlVal);
    // if (formArrayControlVal.length > 0) {
    //   let notifyEmpObjArr = [];
    //   formArrayControlVal.forEach((frmCtrlArr, index) => {
    //     if (frmCtrlArr) {
    //       let ndcData = this.ndcDocListArr[index];
    //       let notifyEmpObj = {
    //         "NDCDepartmentId": ndcData.Id,
    //         "NDCDepartmentMappingId": ndcData.MappingId,
    //         "EmployeeId": this.selectedEmpData.EmployeeId,
    //         "EmployeeCode": this.selectedEmpData.EmployeeCode
    //       }
    //       if (this.notifiedArrList[index].status == 'Notify' || this.notifiedArrList[index].status == 'Failed - Retry') {
    //         notifyEmpObjArr.push(notifyEmpObj);
    //       }
    //     }
    //   })
    //   if (notifyEmpObjArr.length > 0) {
    //     this.loadingScreenService.startLoading();
    //     this.notifyDepartment(JSON.stringify(notifyEmpObjArr), 'notifyAll', 0);
    //   } 
    // }
  }

  onChangeStatus(index) {
    let b = document.getElementsByClassName('ng-select')[index];
    if (b.childNodes[0].nodeType === 1) {
      var elementNode = b.childNodes[0] as HTMLElement;
      if (this.noDueCertificateForm.controls['ndcFields'].value[index].NDCStatus == 1) {
        elementNode.style.color = 'green';
      } else {
        elementNode.style.color = 'black';
      }
    }
    return elementNode.style.color;
  }

  onStatusChange(index) {
    let ndcFieldsCtrl = <FormArray>this.noDueCertificateForm.controls['ndcFields'];
    console.log(ndcFieldsCtrl);
    console.log(console.log(ndcFieldsCtrl.controls[index]));
    console.log(ndcFieldsCtrl.controls[index].get('NDCStatus').value);

    if (ndcFieldsCtrl.controls[index].get('NDCStatus').value == NDCStatus["No Due"]) {
      ndcFieldsCtrl.controls[index].get('RecoveryAmount').setValue(0);
      ndcFieldsCtrl.controls[index].get('RecoveryAmount').disable();
      ndcFieldsCtrl.controls[index].get('RecoveryRemarks').setValue('');
      ndcFieldsCtrl.controls[index].get('RecoveryRemarks').disable();
      ndcFieldsCtrl.controls[index].get('DocumentId').setValue({ DocumentId: 0, DocumentName: "" });
    } else if (ndcFieldsCtrl.controls[index].get('NDCStatus').value == NDCStatus["Recovery Applicable"]) {
      ndcFieldsCtrl.controls[index].get('RecoveryAmount').setValue(0);
      ndcFieldsCtrl.controls[index].get('RecoveryRemarks').setValue('');
      ndcFieldsCtrl.controls[index].get('RecoveryAmount').enable();
      ndcFieldsCtrl.controls[index].get('RecoveryRemarks').enable();
    } else {
      ndcFieldsCtrl.controls[index].get('RecoveryAmount').enable();
      ndcFieldsCtrl.controls[index].get('RecoveryRemarks').enable();
    }
    this.isSaved = false;
    this.checkIsNDCComplete();
  }

  onAddAttachment(files: { base64: string, filename: string }[], index, ndc) {
    console.log(index, ndc);
    this.index = index;
    console.log(files);
    if (files.length > 0) {
      this.showUploadingSpin = true;
      files.forEach((file: { base64: string, filename: string }) => this.doAsyncUpload(file.base64, file.filename, index));
    }
  }

  doAsyncUpload(filebytes, filename, index) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = 0;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = this.defaultSearchInputs.ClientContractId;
      objStorage.ClientId = this.defaultSearchInputs.ClientId;
      objStorage.CompanyId = this.CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";
      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).pipe(takeUntil(this.stopper)).subscribe((res) => {
        let apiResult = (res);
        if (apiResult && apiResult.Status) {
          this.showUploadingSpin = false;
          console.log('apiResult ', apiResult);
          let formArrayControl = <FormArray>this.noDueCertificateForm.controls['ndcFields'];
          console.log(formArrayControl);
          formArrayControl.controls[index].get('DocumentId').setValue({ 'DocumentId': apiResult.Result, 'DocumentName': filename });
          this.alertService.showSuccess('Attachment added successfully !');
        }
      })
    } catch (error) {

    }
  }

  doDeleteAttachment(index) {
    let formArrayControl = <FormArray>this.noDueCertificateForm.controls['ndcFields'];
    console.log(formArrayControl);
    formArrayControl.controls[index].get('DocumentId').setValue(null);
  }

  onSubmitNDC() {
    console.log(this.noDueCertificateForm.get('ndcFields')['controls']);
    this.loadingScreenService.startLoading();
    let ndcFieldsRaw = this.noDueCertificateForm.getRawValue();
    console.log('ndcFieldsRaw ', ndcFieldsRaw);
    let ndcFieldsArr = ndcFieldsRaw.ndcFields;
    console.log(ndcFieldsRaw, ndcFieldsRaw.ndcFields);

    if (ndcFieldsArr.length > 0) {
      let hasError = false;
      for (const ndc of ndcFieldsArr) {
        if (ndc.NDCStatus === 3) {
          if (!ndc.RecoveryRemarks || ndc.RecoveryRemarks === null) {
            hasError = true;
            break;
          }
          if (ndc.RecoveryAmount == undefined || ndc.RecoveryAmount == null || ndc.RecoveryAmount == 0) {
            hasError = true;
            break;
          }
          if (!ndc.DocumentId || ndc.DocumentId.DocumentId === 0 || !ndc.DocumentId.DocumentName) {
            hasError = true;
            break;
          }
        }
      }

      if (hasError) {
        this.alertService.showWarning('Kindly provide recovery remarks, amount, and documents when NDC status is Recovery Applicable');
        this.loadingScreenService.stopLoading();
        return;
      } else {
        try {
          ndcFieldsArr = ndcFieldsArr.map((ndcFld, index) => {
            let ndcObj = new NoDueCertificate();
            ndcObj.Id = this.employeeNDCInfo.length > 0 ? this.employeeNDCInfo[index].Id : 0;
            ndcObj.EmployeeId = this.selectedEmpData.EmployeeId;
            ndcObj.NDCDepartmentId = this.ndcDocListArr[index].Id;
            ndcObj.NDCDepartmentMappingId = this.ndcDocListArr[index].MappingId;
            ndcObj.NDCStatus = ndcFld.NDCStatus;
            ndcObj.RecoveryAmount = (ndcFld.RecoveryAmount == undefined || ndcFld.RecoveryAmount == null) ? 0 : ndcFld.RecoveryAmount;
            ndcObj.RecoveryRemarks = (ndcFld.RecoveryRemarks == undefined || ndcFld.RecoveryRemarks == null) ? '' : ndcFld.RecoveryRemarks;
            ndcObj.DocumentId = ndcFld.DocumentId != undefined && ndcFld.DocumentId != null ? ndcFld.DocumentId.DocumentId : 0;
            ndcObj.DocumentName = ndcFld.DocumentId != undefined && ndcFld.DocumentId != null ? ndcFld.DocumentId.DocumentName : '';
            return ndcObj;
          })
        } catch (error) {
            console.log('MAPPING ERROR :', error);            
        }
        console.log(ndcFieldsArr);
        this.employeeService.upsertNDCDepartmentDetails(ndcFieldsArr).pipe(takeUntil(this.stopper)).subscribe((res) => {
          if (res.Status) {
            this.isSaved = true;
            this.alertService.showSuccess('Saved Successfully');
            this.loadingScreenService.stopLoading();
            this.checkIsNDCComplete();
            this.getEmployeeNDCTransaction()
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(`Failed - ${res.Message}`);
          }
        })
      }
    }
  }

  checkIsNDCComplete() {
    let ndcFieldsValue = this.noDueCertificateForm.controls['ndcFields'].value;
    this.isNDCComplete = ndcFieldsValue.every((ndc) => ((ndc.NDCStatus == 1 || ndc.NDCStatus == 3)));
  }

  closeNDC() {
    this.activeModal.close('Modal Closed');
  }

  onNext() {
    if (this.isNDCComplete) {
      this.activeModal.close('Modal OnNext');
    } else {
      this.alertService.showWarning('NDC Status of all departments should have status of - No Due or Recovery Applicable');
      return;
    }

  }

  ngOnDestroy(): void {
    this.stopper.next();
    this.stopper.complete();
  }
}