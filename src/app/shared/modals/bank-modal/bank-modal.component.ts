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
import { BankInfo, BankList, BankDocumentCategoryList } from '../../../_services/model/OnBoarding/BankInfo';
import { apiResponse } from 'src/app/_services/model/apiResponse';


import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from 'src/app/_services/model';
import { PayrollService } from 'src/app/_services/service';
import { DomesticPayment } from 'src/app/_services/model/Payroll/DomesticPayment';

import { BankBranchIdentifierType, CandidateBankDetails, VerificationMode } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { CandidateModel, _CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import { CandidateDetails, CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { environment } from 'src/environments/environment';
import * as JSZip from 'jszip';
import { isGuid } from 'src/app/utility-methods/utils';

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
  selector: 'app-bank-modal',
  templateUrl: './bank-modal.component.html',
  styleUrls: ['./bank-modal.component.scss']
})
export class BankModalComponent implements OnInit {

  @Input() id: number;
  @Input() UserId: number;
  @Input() jsonObj: any;
  @Input() objStorageJson: any;
  @Input() candidateDetailsBasic: any;
  @Input() area: any;
  @Input() DocumentList: any;
  @Input() ActionName: any;

  bankForm: FormGroup;
  acceptOnlyImageFile: boolean = false;

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  MenuId: any;

  BankInfoListGrp: BankInfo;
  BankList: BankList[] = [];
  BranchList = [];
  BankDocumentCategoryList: BankDocumentCategoryList[] = [];

  FileName: any;
  unsavedDocumentLst = [];
  DocumentId: any;

  firstTimeDocumentId: any;
  popupId: any;

  isExists: boolean = false; // for country - is already exists 

  isLoading: boolean = true;
  spinnerText: string = "Uploading";
  pennydropLoading: boolean = false;
  pennydropspinnerText: string = "Checking..."

  BankBranchId: any;
  _loginSessionDetails: LoginResponses;
  userAccessControl;
  is_spinner_ifsc: boolean = false;
  isrendering_spinner: boolean = false;
  BusinessType: any;
  internalRefId: any;
  IsPennyDropCheckRequired: boolean = false;

  textSpin: any = "Finished";
  status: any = "finish";
  loadingicon: any = "check";
  desciption: any = "Initiating Process"

  textSpin1: any = "Finished";
  status1: any = "process";
  loadingicon1: any = "loading";
  desciption1: any = "Connecting with Bank Server"



  textSpin2: any = "Waiting";
  status2: any = "wait";
  loadingicon2: any = "question";
  desciption2: any = "Completed Process"

  payoutLogId: any;
  isFailedInitiateProcess: boolean = false;
  isSuccessInitiateProcess: boolean = false;
  FailedInitiateProcessMessage: any = '';

  VerificationAttempts: any = 0;
  count: any = 0;
  count1: any = 0;
  IsInitiatingPennyDropDone: boolean = false;
  IsYBStatus: boolean = false;
  initiatingObject: any = null;
  NameAsPerBank = '';
  manuallVerification: any;
  IsMultipleAttempts: boolean = false;
  IsManualModeEnabled: boolean = false;
  RoleCode: string;
  candidateModel: CandidateModel = new CandidateModel();
  candidateDetails: CandidateDetails = new CandidateDetails;
  IsPaymentFailed: boolean = false;
  disableSelect: boolean = false;
  IsNameMisMatched: boolean = false;
  ActualAccountHolderName: any;
  mismatch: boolean = false;
  MaxSize: any = 0;
  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];
  fileObject: any[] = [];
  nameMismatchVerificationCount: number = 0;
  showDisabledManualMode: boolean = false;

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    private UIBuilderService: UIBuilderService,
    public sessionService: SessionStorage,
    private onboardingService: OnboardingService,
    public fileuploadService: FileUploadService,
    private payrollService: PayrollService,

  ) {
    this.createForm();
  }

  get g() { return this.bankForm.controls; } // reactive forms validation 

  createForm() {


    this.bankForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      bankName: [null, Validators.required],
      IFSCCode: [null, Validators.required],
      accountHolderName: ['', Validators.required],
      accountNumber: ['', Validators.required],
      // confirmAccountNumber: ['', Validators.required],
      allocation: ['100', [mixmaxcheck, Validators.required]],
      status: [true],
      proofType: ['', Validators.required],
      bankBranchId: [''],
      DocumentId: [null, Validators.required],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop
      VerificationMode: [null],
      VerificationAttempts: [0],
      PayoutLogId: [null],
      Remarks: ['']
    });


  }

  ngOnInit() {
    this.mismatch = false;
    this.ActualAccountHolderName = null;
    this.IsManualModeEnabled = true;
    this.IsMultipleAttempts = false;
    this.NameAsPerBank = '';
    this.IsInitiatingPennyDropDone = false;
    this.IsYBStatus = false;
    this.initiatingObject = null;
    this.count = 0;
    this.count1 = 0;
    this.nameMismatchVerificationCount = 0;
    this.isFailedInitiateProcess = false;
    this.isSuccessInitiateProcess = false;
    this.IsPennyDropCheckRequired = false;
    this.FailedInitiateProcessMessage = '';
    this.internalRefId = null;
    this.isrendering_spinner = true;
    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    console.log('this.objStorageJson', this.objStorageJson);
    this.payoutLogId = 0
    this.objStorageJson != null ? this.objStorageJson = JSON.parse(this.objStorageJson) : null;

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    console.log('sss', this.jsonObj);
    console.log('CANDI OBJECT :', this.candidateDetailsBasic);
    this.showDisabledManualMode = false;


    this.bankForm.valueChanges

      .subscribe((changedObj: any) => {
        this.disableBtn = true;
      });
    // this.UIBuilderService.doApply(this, this.MenuId, componentName);
    let unwantedCntrNames = [];
    if (this.RoleCode == 'Recruiter' && this.ActionName == "StaticMode") {
      unwantedCntrNames = ["bankName", "IFSCCode", "accountHolderName", "accountNumber", "allocation", "status",
        "bankBranchId",];
    }


    unwantedCntrNames.forEach(element => {
      this.bankForm.removeControl(element);
    });

    this.popupId = (this.bankForm.get('Id').value);
    this.VerificationAttempts = 0;

    if (this.RoleCode != 'Recruiter' && this.ActionName == "NormalMode" && this.jsonObj != null && this.jsonObj != undefined) {
      this.jsonObj.bankBranchId = (this.jsonObj.bankBranchId == 0 || this.jsonObj.bankBranchId == '') ? '' : this.jsonObj.bankBranchId;
      this.jsonObj.DocumentId = this.jsonObj.DocumentId == 0 ? null : this.jsonObj.DocumentId;
      // this.jsonObj.accountHolderName =    this.jsonObj.accountHolderName == ''  ? null  : this.jsonObj.accountHolderName;
      this.jsonObj.IFSCCode = this.jsonObj.IFSCCode == 0 ? null : this.jsonObj.IFSCCode;
      // this.jsonObj.accountNumber =    this.jsonObj.accountNumber == ''  ? null  : this.jsonObj.accountNumber;
      this.jsonObj.allocation = (this.jsonObj.allocation == '0' || this.jsonObj.allocation == '') ? '100' : this.jsonObj.allocation;
      this.jsonObj.bankName = this.jsonObj.bankName == 0 ? null : this.jsonObj.bankName;
      this.jsonObj.Status = true;
    }

    this.bankForm.controls.accountHolderName.setValue(this.candidateDetailsBasic.CandidateName);

    if (this.jsonObj) {
      this.payoutLogId = this.jsonObj.PayoutLogId;
      this.VerificationAttempts = this.jsonObj.VerificationAttempts;
      this.popupId = this.jsonObj.Id;
      this.firstTimeDocumentId = this.jsonObj.DocumentId;
      this.BankBranchId = this.jsonObj.bankBranchId;
      this.bankForm.patchValue(this.jsonObj);
      if (this.jsonObj.DocumentId && this.jsonObj.FileName) {

        this.FileName = this.jsonObj.FileName;
        this.DocumentId = this.jsonObj.DocumentId;
        /* #region  after jszip */
        this.spinnerText = "Loading";
        this.fileuploadService.getObjectById(this.DocumentId)
          .subscribe((dataRes) => {
            if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
              const errorMessage = dataRes.Message && dataRes.Message !== '' ? dataRes.Message : 'Error while fetching image';
              this.alertService.showWarning(errorMessage);
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
        /* #endregion */
      }
      this.initiatingObject = {

        AccountHolderName: "",
        AccountNumber: "",
        AcknowledgmentDetail: "",
        Amount: 1,
        BankRefId: "",
        CompanyBankAccountId: 1,
        CreditorReferenceInformation: "",
        EmailId: "",
        ErrorMessage: null,
        ExternalRefId: "",
        IFSCCode: "",
        Identification: "",
        InternalRefId: "",
        IsPaymentDone: false,
        MobileNumber: "",
        NameAsPerBank: "",
        PayoutStatus: 7800,
        SchemeName: "",
        Status: "",
      };

      this.initiatingObject.AccountNumber = this.jsonObj.accountNumber;
      this.initiatingObject.IFSCCode = this.jsonObj.bankBranchId;
      this.initiatingObject.NameAsPerBank = this.jsonObj.accountHolderName;

      if (this.jsonObj.VerificationMode == VerificationMode.PennyDrop) {

        this.IsInitiatingPennyDropDone = true;
        this.IsYBStatus = true;
      }

    }
    try {
      let mode = this.id == 0 ? 1 : 2; // add-1, edit-2, view, 3   
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");
    } catch (error) {

    }
    this.doCheckAccordion();

    try {


      if (this.bankForm.value.DocumentId == 0 || this.bankForm.value.DocumentId == null || this.bankForm.value.DocumentId == '') {
        this.GetCompanySettings(this.objStorageJson.CompanyId, this.objStorageJson.ClientId, this.objStorageJson.ClientContractId).then(() => console.log("GET COMPANY SETTINGS- Task Complete!"));
      }
      else {
        this.IsPennyDropCheckRequired = false;
      }
    } catch (error) {
      console.log('EX Company Settings ::', error);

    }
  }

  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
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


  GetCompanySettings(_companyId, _clientId, _clientContractId) {
    const promise = new Promise((res, rej) => {
      this.payrollService.GetCompanySettings(_companyId, _clientId, _clientContractId, 'IsPennyDropCheckRequired')
        .subscribe((result) => {
          try {


            let apiR: apiResult = result;
            if (apiR.Status && apiR.Result != null) {
              var jobject = apiR.Result as any;
              var jSettingValue = JSON.parse(jobject.SettingValue);
              console.log('Setting Value : ', jSettingValue);
              // this.IsPennyDropCheckRequired = jSettingValue == '1' ? true : false;
              // this.IsPennyDropCheckRequired = environment.environment.IsPennyDropCheckRequired;
              this.IsPennyDropCheckRequired = false;  // environment.environment.IsPennyDropCheckRequired;
              if (jSettingValue == '1' && environment.environment.IsPennyDropCheckRequired) {
                this.IsPennyDropCheckRequired = true;
              }


              if (!this.candidateDetailsBasic.CandidateName.toUpperCase().toString()) {
                this.alertService.showWarning('Please fill out the candidates name and continue to verify the bank account.');
                this.activeModal.close('Modal Closed');
                return;
              }
              this.updateValidation(false, this.bankForm.get('DocumentId'));
              this.updateValidation(false, this.bankForm.get('proofType'));
              this.is_spinner_ifsc = false;

            }
          } catch (error) {
            console.log('EX :', error);

          }

        })
    })
    return promise;
  }

  public doCheckAccordion(): void {


    this.is_spinner_ifsc = true;
    this.onboardingService.getOnboardingInfo("isBankInfo", this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? (this.objStorageJson.ClientId == null ? 0 : this.objStorageJson.ClientId) : 0)
      .subscribe(authorized => {

        console.log(authorized);

        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {

          this.BankInfoListGrp = JSON.parse(apiResult.Result);
          this.BankList = this.BankInfoListGrp.BankList;

          if (isGuid(this.bankForm.get('Id').value)) {
            const defaultbank = this.BankList.length > 0 &&
              this.BankList.find(a => a.Code == environment.environment.DefaultBankReferenceCode);
            defaultbank != undefined ? this.bankForm.controls['bankName'].setValue(defaultbank.Id) : true;
            // defaultbank != undefined ? this.onChangeBank(defaultbank) : true;
          }
          this.BankDocumentCategoryList = this.BankInfoListGrp.BankDocumentCategoryList;
          for (var i in this.BankDocumentCategoryList) {
            for (var j in this.DocumentList.DocumentCategoryist) {
              if (this.BankDocumentCategoryList[i].DocumentTypeId == this.DocumentList.DocumentCategoryist[j].DocumentTypeId) {
                this.BankDocumentCategoryList[i]['MaxSize'] = this.DocumentList.DocumentCategoryist[j].MaxSize;
              }
            }
          }

          this.isrendering_spinner = false;

          if (this.bankForm.controls['bankName'] != null) {
            let BankName = this.bankForm.get('bankName').value;
            this.is_spinner_ifsc = false;
            console.log('Bank', BankName);
            this.isrendering_spinner = false;

            if (BankName != null) {
              this.isrendering_spinner = true;
              this.is_spinner_ifsc = true;
              let bankId = (this.BankList.find(z => z.Id == BankName)).Id;
              this.onboardingService.getBankBranchByBankId(bankId)
                .subscribe(authorized => {
                  const apiResponse: apiResponse = authorized;
                  this.BranchList = apiResponse.dynamicObject;
                  this.is_spinner_ifsc = false;
                  this.isrendering_spinner = false;
                }), ((err) => {

                });
            }
          }

          else {
            this.isrendering_spinner = false;
          }


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



  savebutton(): void {
    this.showDisabledManualMode = false;
    console.log(this.bankForm.value);
    this.nameMismatchVerificationCount = this.nameMismatchVerificationCount + 1;

    if (this.bankForm.value.FileName == null || this.bankForm.value.FileName == undefined) {
      this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_bankDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
      this.bankForm.value.FileName = this.FileName;
    }

    this.submitted = true;

    // if (this.bankForm.invalid || (!this.IsPennyDropCheckRequired && this.fileList && this.fileList.length == 0)) {
    //   this.isLoading = true;
    //   return this.alertService.showWarning('Please fill all the required fields !');
    // }

    if (!this.IsPennyDropCheckRequired && this.fileList && this.fileList.length == 0) {
      this.isLoading = true;
      return this.alertService.showWarning('Please fill all the required fields !');
    }

    console.log(this.IsInitiatingPennyDropDone);
    console.log(this.NameAsPerBank);

    var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
    var rplStr_accountholdername = this.bankForm.controls['bankName'] != null ? this.bankForm.value.accountHolderName.toUpperCase() : '';
    rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
    rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

    console.log('ss', rplStr_NameAsPerBank);
    console.log('ss rplStr_accountholdername', rplStr_accountholdername);
    this.isLoading = true;
    var _pennydropRemarks = null;

    if (this.bankForm.controls['bankName'] != null && this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && this.NameAsPerBank != '' && rplStr_NameAsPerBank != rplStr_accountholdername) {
      this.mismatch = true;
      this.IsNameMisMatched = true;

      // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
      if (this.IsNameMisMatched) {

        this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
        this.IsMultipleAttempts = true;
        this.manuallVerification = true;
        this.showDisabledManualMode = true;
        this.IsPennyDropCheckRequired = false;
        this.IsManualModeEnabled = true;
        this.updateValidation(true, this.bankForm.get('DocumentId'));
        this.updateValidation(true, this.bankForm.get('proofType'));

      }

      // if (this.nameMismatchVerificationCount > 3) {
      //   this.IsMultipleAttempts = true;
      //   this.IsPennyDropCheckRequired = false;
      //   this.updateValidation(true, this.bankForm.get('DocumentId'));
      //   this.updateValidation(true, this.bankForm.get('proofType'));
      // }


      _pennydropRemarks = `The bank details were checked using the penny drop mode. ${`The account holder name entered by user, does not match with name as per bank. `} ${this.bankForm.value.Remarks}`;
      // this.alertService.showWarning(`${this.bankForm.value.accountHolderName} : The Account holder name/Candidate name is mismatched. Re-Enter the account holder name/Candidate name as per bank and try again`);
      return;
    }

    this.isFailedInitiateProcess = false;
    this.isSuccessInitiateProcess = false;
    if (this.jsonObj != undefined && this.jsonObj.CandidateDocument != null) {
      this.bankForm.addControl('CandidateDocument', new FormControl(this.jsonObj.CandidateDocument));

    }
    // this.spinnerStarOver();
    this.VerificationAttempts = this.VerificationAttempts + 1;
    this.bankForm.controls['bankName'] != null ? this.bankForm.controls['bankBranchId'].setValue(this.BankBranchId) : true;
    this.bankForm.controls['VerificationMode'].setValue(this.IsPennyDropCheckRequired == true ? VerificationMode.PennyDrop : VerificationMode.QcVerification);
    this.bankForm.controls['VerificationAttempts'].setValue(this.VerificationAttempts);
    this.bankForm.controls['PayoutLogId'].setValue(this.payoutLogId);
    console.log('t', this.initiatingObject);

    if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.AccountNumber != '' && this.initiatingObject.AccountNumber != null && (this.initiatingObject.AccountNumber.toString() != this.bankForm.value.accountNumber.toString() || this.initiatingObject.IFSCCode != this.bankForm.value.bankBranchId)) {
      this.count = 0;
      this.count1 = 0;
      this.IsInitiatingPennyDropDone = false;
    }
    if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.NameAsPerBank != '' && this.initiatingObject.NameAsPerBank != null) {
      var rplStr_NameAsPerBank1 = this.initiatingObject.NameAsPerBank.toUpperCase().toString();
      var rplStr_accountholdername1 = this.bankForm.controls['bankName'] != null ? this.bankForm.value.accountHolderName.toUpperCase().toString() : '';
      rplStr_NameAsPerBank1 = rplStr_NameAsPerBank1.replace(/\s/g, "");
      rplStr_accountholdername1 = rplStr_accountholdername1.replace(/\s/g, "");

      if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && rplStr_NameAsPerBank1 != '' && rplStr_NameAsPerBank1 != null && (rplStr_NameAsPerBank1 != rplStr_accountholdername1)) {
        this.IsYBStatus = false;
      }

    }
    // if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.NameAsPerBank != '' && this.initiatingObject.NameAsPerBank != null && (this.initiatingObject.NameAsPerBank.toString() != this.bankForm.value.accountHolderName.toString())) {
    //   // this.count1 = 0;
    //   this.IsYBStatus = false;
    // }


    if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == false) {
      // start region : checks for account holder name is blank
      if (this.bankForm.get('accountHolderName').value == '') {
        this.alertService.showWarning('Account holder name cannot be blank');
        return;
      }
      //end region
      this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"));
      return;
    }
    if (this.IsPennyDropCheckRequired == true && this.IsPaymentFailed) {
      // start region : checks for account holder name is blank
      if (this.bankForm.get('accountHolderName').value == '') {
        this.alertService.showWarning('Account holder name cannot be blank');
        return;
      }
      //end region
      this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"));
      return;
    }
    else if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && (this.IsYBStatus == false)) {
      this.GetYBPennyDropStatus(this.initiatingObject);
      return;
    } else {

      if (this.bankForm.get('PayoutLogId').value == null || this.bankForm.get('PayoutLogId').value == '' || this.bankForm.get('PayoutLogId').value == undefined) {
        this.bankForm.controls['PayoutLogId'].setValue(0);
      }

      var rplStr_NameAsPerBank2 = this.candidateDetailsBasic.CandidateName.toUpperCase().toString();
      var rplStr_accountholdername2 = this.bankForm.controls['bankName'] != null ? this.bankForm.value.accountHolderName.toUpperCase().toString() : '';
      rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");
      rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

      var percentageOfSimilarity = 0;

      percentageOfSimilarity = this.similarity(rplStr_NameAsPerBank2, rplStr_accountholdername2)



      if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilarity < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
        this.pennydropLoading = false;
        this.isFailedInitiateProcess = true;
        this.mismatch = true;
        this.IsNameMisMatched = true;

        this.FailedInitiateProcessMessage = "Candidate name/Account Holder Name is mismatched;" // apiR.Message;
        // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
        if (this.IsNameMisMatched) {
          this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
          this.IsMultipleAttempts = true;
          this.manuallVerification = true;
          this.IsManualModeEnabled = true;
          this.showDisabledManualMode = true;
          this.IsPennyDropCheckRequired = false;
          this.updateValidation(true, this.bankForm.get('DocumentId'));
          this.updateValidation(true, this.bankForm.get('proofType'));
          this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
        }
        return;
      }

      if (!environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && rplStr_NameAsPerBank2 != rplStr_accountholdername2)
      // if(this.mismatch  == true)
      {
        this.confirmationPennydrop();
        return;
      }

      this.bankForm.value.Remarks = _pennydropRemarks;

      if (this.bankForm.value.FileName == null || this.bankForm.value.FileName == undefined) {
        this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_bankDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
        this.bankForm.value.FileName = this.FileName;
      }

      console.log('this.bankForm.value', this.bankForm.value);

      this.activeModal.close(this.bankForm.value);
      this.alertService.showSuccess("Great! Bank details has been added.");
      return;
    }
    // this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == false ? this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!")) : this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && (this.IsYBStatus == false) ? this.GetYBPennyDropStatus(this.initiatingObject) : this.activeModal.close(this.bankForm.value);
    // return;
    // this.activeModal.close(this.bankForm.value);

  }

  confirmationPennydrop() {
    var inputElement1 = null
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })
    swalWithBootstrapButtons.fire({
      title: `The account holder name entered by user, does not match with ${this.area == 'Candidate' ? 'Candidate' : 'Vendor'} name. Do you want to Continue. `,
      html: "<div class='b'></div><div class='b'><label style='color: #464646 !important;display: block !important;font-size: 13px !important;font-weight: 500;float: left;margin-top: 12px;'>Enter a Reason </label></div><textarea class='form-control' rows='2' placeholder='Type your message here...' style='margin-bottom:5px !important' spellcheck='false'id='swal-textarea'></textarea>",
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      allowEscapeKey: false,
      showCancelButton: true,
      preConfirm: () => {
        // this.inputElement = document.getElementById('swal-input2') as HTMLInputElement
        inputElement1 = document.getElementById('swal-textarea') as HTMLInputElement



        if (inputElement1.value.length >= 120) {
          Swal.showValidationMessage(
            `Maximum 120 characters allowed.`
          )

        } else if ((inputElement1.value == "") || (inputElement1.value == '') || ((inputElement1.value == null))) {
          Swal.showValidationMessage(
            `Reason is required. You need to write something!`
          )

        }
      }
    }).then((result) => {
      if (result.value) {
        this.bankForm.value.Remarks = inputElement1.value;
        this.activeModal.close(this.bankForm.value);
        this.alertService.showSuccess("Great! Bank details has been added.");
        return;
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });


  }


  initiatePennyDropPayment() {
    this.IsNameMisMatched = false;
    this.mismatch = false;
    this.bankForm.controls['bankName'].disable();
    this.bankForm.controls['IFSCCode'].disable();

    this.disableSelect = true;
    this.count1 = this.count1 + 1;

    this.IsManualModeEnabled = false;
    this.pennydropLoading = true;
    this.isFailedInitiateProcess = false;
    this.IsPaymentFailed = false;
    this.FailedInitiateProcessMessage = '';
    this.textSpin = "In Progress";
    this.status = "process";
    this.loadingicon = "loading";
    this.desciption = "Initiating Process"


    this.textSpin1 = "Awaiting";
    this.status1 = "wait";
    this.loadingicon1 = "question";
    this.desciption1 = "Waiting in the queue for bank server"


    this.textSpin2 = "Pending";
    this.status2 = "wait";
    this.loadingicon2 = "question";
    this.desciption2 = "Waiting for bank status"


    this.bankForm.controls['VerificationMode'].setValue(this.IsPennyDropCheckRequired == true ? VerificationMode.PennyDrop : VerificationMode.QcVerification)

    this.pennydropspinnerText = "Initiating...";
    const promise = new Promise((res, rej) => {
      this.internalRefId = `${this.objStorageJson.CandidateId}${this.bankForm.get('accountHolderName').value.substring(0, 3).toUpperCase()}${new Date().getTime()}`;
      this.internalRefId = this.internalRefId.replace(/\./g, ' ')
      var domesticPayment = new DomesticPayment();
      domesticPayment.Status = '';
      domesticPayment.NameAsPerBank = '';
      domesticPayment.Identification = '';
      domesticPayment.SchemeName = '';
      domesticPayment.CompanyBankAccountId = 0;
      domesticPayment.IsPaymentDone = false;
      domesticPayment.AcknowledgmentDetail = '';
      domesticPayment.MobileNumber = (this.candidateDetailsBasic.MobileNumber == null || this.candidateDetailsBasic.MobileNumber == '' || this.candidateDetailsBasic.MobileNumber == undefined) ? "1234567890" : this.candidateDetailsBasic.MobileNumber;
      domesticPayment.ErrorMessage = '';
      domesticPayment.EmailId = (this.candidateDetailsBasic.EmailId == null || this.candidateDetailsBasic.EmailId == '' || this.candidateDetailsBasic.EmailId == undefined) ? 'test@gmail.com' : this.candidateDetailsBasic.EmailId;
      domesticPayment.CreditorReferenceInformation = 'Initiating Penny Drop';
      domesticPayment.AccountHolderName = this.bankForm.get('accountHolderName').value; //  this.bankForm.value.accountHolderName;
      domesticPayment.Amount = 0;
      domesticPayment.IFSCCode = this.bankForm.get('bankBranchId').value;//  this.bankForm.value.bankBranchId;
      domesticPayment.AccountNumber = this.bankForm.value.accountNumber;
      domesticPayment.ExternalRefId = '';
      domesticPayment.BankRefId = '';
      domesticPayment.InternalRefId = this.internalRefId;
      domesticPayment.PayoutStatus = 7500;
      domesticPayment.payoutlogs = [];
      domesticPayment.CandidateId = this.objStorageJson.CandidateId;
      domesticPayment.EmployeeId = 0;
      domesticPayment.ClientId = this.objStorageJson.ClientId;
      console.log('DOM :: ', domesticPayment);


      this.payrollService.initiatePennyDropPayment(domesticPayment)
        .subscribe((resObject) => {
          console.log('INIT PENNY DROP AMOUNT ::', resObject);

          let apiR: apiResult = resObject;

          if (!apiR.Status && apiR.Result != null) {
            let _obj = apiR.Result as any
            if (_obj.IsPaymentDone || _obj.PayoutStatus == 10000) {
              this.disableSelect = false;
              this.bankForm.controls['bankName'].enable();
              this.bankForm.controls['IFSCCode'].enable();
              this.bankForm.value.bankName = this.bankForm.get('bankName').value;
              this.bankForm.value.IFSCCode = this.bankForm.get('IFSCCode').value;

              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = _obj;
              this.IsYBStatus = true;
              this.isSuccessInitiateProcess = true;
              this.NameAsPerBank = _obj.NameAsPerBank;
              let _rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
              let _rplStr_accountholdername = this.bankForm.value.accountHolderName.toUpperCase();
              _rplStr_NameAsPerBank = _rplStr_NameAsPerBank.replace(/\s/g, "");
              _rplStr_accountholdername = _rplStr_accountholdername.replace(/\s/g, "");
              var percentageOfSimilarity = 0;
              var percentageOfSimilaritybyCandidateName = 0;

              // if the candidate bank account holder name is not exists then take the name from candi infor accod

              var rplStr_NameAsPerBank2 = this.candidateDetailsBasic.CandidateName.toUpperCase().toString();
              rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");

              percentageOfSimilaritybyCandidateName = this.similarity(rplStr_NameAsPerBank2, _rplStr_accountholdername)

              percentageOfSimilarity = this.similarity(_rplStr_NameAsPerBank, _rplStr_accountholdername)


              console.log('percentageOfSimilarity :', percentageOfSimilarity);

              if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilarity < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched;" // apiR.Message;
                // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 

                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                }
                return;
              }

              if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilaritybyCandidateName < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "The candidate's name and account holder's name are mismatched." // apiR.Message;
                // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                }
                return;
              }

              if (!environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && _rplStr_accountholdername != '' && _rplStr_NameAsPerBank.toUpperCase() != _rplStr_accountholdername.toUpperCase()) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched;" // apiR.Message;
                // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                }
                return;
              }
              else if (!environment.environment.IsSimilartyCheckRequired) {
                this.pennydropLoading = false;
                var rplStr_accountholdername2 = this.bankForm.value.accountHolderName.toUpperCase().toString();
                rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                console.log('PERC ::', percentageOfSimilarity);

                if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)

                // if(this.mismatch  == true)
                {
                  this.confirmationPennydrop();
                  return;
                }

                this.IsPennyDropCheckRequired = false;

                this.activeModal.close(this.bankForm.value);
                this.alertService.showSuccess("Great! Bank details has been added.");

              }

              this.disableSelect = false;
              this.bankForm.controls['bankName'].enable();
              this.bankForm.controls['IFSCCode'].enable();
              this.bankForm.value.bankName = this.bankForm.get('bankName').value;
              this.bankForm.value.IFSCCode = this.bankForm.get('IFSCCode').value;

              if (this.count1 > 2) {
                this.IsMultipleAttempts = true;
                this.IsPennyDropCheckRequired = false;
                this.updateValidation(true, this.bankForm.get('DocumentId'));
                this.updateValidation(true, this.bankForm.get('proofType'));
              }
              this.textSpin = "Failed";
              this.status = "error";
              this.desciption = "Initiation failed"

              // this.loadingicon = "warning";

              this.textSpin1 = "Awaiting";
              this.status1 = "wait";
              this.loadingicon1 = "question";

              this.textSpin2 = "Pending";
              this.status2 = "wait";
              this.loadingicon2 = "question";

              this.pennydropLoading = false;

              // this.isFailedInitiateProcess = true;

              this.FailedInitiateProcessMessage = apiR.Message;
              // this.IsInitiatingPennyDropDone = false;
              // this.IsYBStatus = false;
              // this.initiatingObject = null;

              if (apiR.Message == 'Requested data has been validated for penny drop integration.') {
                this.IsYBStatus = true;
                this.isSuccessInitiateProcess = true;
                this.activeModal.close(this.bankForm.value);
                this.alertService.showSuccess("Great! Bank details has been added.");

              }


              return;

            }
          }

          if (apiR.Status && apiR.Result != null) {


            this.textSpin = "initialization  Done";
            this.status = "finish";
            this.loadingicon = "check";
            this.desciption = "Initiation phase carried out"


            this.textSpin1 = "In Progress";
            this.status1 = "process";
            this.loadingicon1 = "loading";
            this.desciption1 = "Accessing the Bank Server."


            this.textSpin2 = "Awaiting";
            this.status2 = "wait";
            this.loadingicon2 = "question";
            this.desciption2 = "Waiting for Bank status"


            var res = apiR.Result as any;
            this.payoutLogId = res.payoutlogs != null && res.payoutlogs.length > 0 ? res.payoutlogs[0].Id : 0;
            this.bankForm.controls['PayoutLogId'].setValue(this.payoutLogId);
            this.pennydropspinnerText = "Checking with Bank Account";
            setTimeout(() => {

              var jObject = apiR.Result as any;
              jObject.InternalRefId = jObject.BankRefId as any;
              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = jObject;
              this.GetYBPennyDropStatus(jObject);
            }, 15000);
          } else {

            this.disableSelect = false;
            this.bankForm.controls['bankName'].enable();
            this.bankForm.controls['IFSCCode'].enable();
            this.bankForm.value.bankName = this.bankForm.get('bankName').value;
            this.bankForm.value.IFSCCode = this.bankForm.get('IFSCCode').value;

            if (this.count1 > 2) {
              this.IsMultipleAttempts = true;
              this.IsPennyDropCheckRequired = false;
              this.updateValidation(true, this.bankForm.get('DocumentId'));
              this.updateValidation(true, this.bankForm.get('proofType'));
            }
            this.textSpin = "Failed";
            this.status = "error";
            this.desciption = "Initiation failed"

            // this.loadingicon = "warning";

            this.textSpin1 = "Awaiting";
            this.status1 = "wait";
            this.loadingicon1 = "question";

            this.textSpin2 = "Pending";
            this.status2 = "wait";
            this.loadingicon2 = "question";

            this.pennydropLoading = false;

            this.isFailedInitiateProcess = true;

            this.FailedInitiateProcessMessage = apiR.Message;
            this.IsInitiatingPennyDropDone = false;
            this.IsYBStatus = false;
            this.initiatingObject = null;
            return;

          }
          // res(true);

        })
    });
    return promise;
  }

  GetYBPennyDropStatus(domesticPayment) {
    this.bankForm.controls['bankName'].disable();
    this.bankForm.controls['IFSCCode'].disable();
    // this.bankForm.controls['accountNumber'].disable();
    // this.bankForm.controls['accountHolderName'].disable();
    this.mismatch = false;
    this.disableSelect = true;
    this.IsNameMisMatched = false;
    this.IsManualModeEnabled = false;
    this.pennydropLoading = true;
    this.isFailedInitiateProcess = false;
    this.FailedInitiateProcessMessage = '';
    this.IsPaymentFailed = false;
    this.count = this.count + 1;
    this.textSpin = "initialization  Done";
    this.status = "finish";
    this.loadingicon = "check";
    this.desciption = "Initiation phase carried out"

    this.textSpin1 = "In Progress";
    this.status1 = "process";
    this.loadingicon1 = "loading";
    this.desciption1 = "Accessing the Bank Server."

    this.textSpin2 = "Awaiting";
    this.status2 = "wait";
    this.loadingicon2 = "question";
    this.desciption2 = "Waiting for Bank status"


    const promise = new Promise((res, rej) => {
      console.log('DOMESTIC ::', domesticPayment);

      this.payrollService.GetYBPennyDropStatus(domesticPayment)
        .subscribe((resObject) => {
          console.log('STATUS PENNY DROP AMOUNT ::', resObject);

          let apiR: apiResult = resObject;
          // apiR.Status = false;
          // apiR.Result = {
          //   "InternalRefId": "IntegrumPennyDropTest2",
          //   "BankRefId": "TIMPSIntegrumPennyDropTest2",
          //   "ExternalRefId": null,
          //   "AccountNumber": "602701514756",
          //   "IFSCCode": "ICIC0006027",
          //   "Amount": 1.0,
          //   "AccountHolderName": "Balaji",
          //   "CreditorReferenceInformation": "Penny Drop Payment testing",
          //   "PayoutStatus": 10000,
          //   "EmailId": "test@gmail.com",
          //   "MobileNumber": "9840419175",
          //   "AcknowledgmentDetail": "128314662224",
          //   "IsPaymentDone": true,
          //   "CompanyBankAccountId": 5,
          //   "SchemeName": "ICIC0000009",
          //   "Identification": "000901523569",
          //   "NameAsPerBank": "KIRAN KUMAR SHETTY",
          //   "Status": "Payment Done",
          //   "ErrorMessage": "string",
          //   "payoutlogs": [
          //     {
          //       "Id": 354884,
          //       "PayoutRequestIds": null,
          //       "PaytransactionIds": null,
          //       "ObjectStorageId": 0,
          //       "NoOfRecords": 1,
          //       "LastUpdatedBy": null,
          //       "LastUpdatedOn": "0001-01-01T00:00:00",
          //       "SourceData": "{\"Data\":{\"ConsentId\":\"11861849\",\"InstrId\":\"TIMPSIntegrumPennyDropTest2\",\"SecondaryIdentification\":\"11861849\"}}",
          //       "LogData": "{\"Data\":{\"ConsentId\":\"11861849\",\"TransactionIdentification\":\"f67eb23429a511eca9e40a0047330000\",\"Status\":\"SettlementCompleted\",\"CreationDateTime\":\"2021-10-10T14:12:11.000+05:30\",\"StatusUpdateDateTime\":\"2021-10-10T14:12:12.000+05:30\",\"Initiation\":{\"InstructionIdentification\":\"TIMPSIntegrumPennyDropTest2\",\"EndToEndIdentification\":\"128314662224\",\"InstructedAmount\":{\"Amount\":1E+0,\"Currency\":\"INR\"},\"DebtorAccount\":{\"Identification\":\"065363300001791\",\"SecondaryIdentification\":\"11861849\"},\"CreditorAccount\":{\"SchemeName\":\"ICIC0000009\",\"Identification\":\"000901523569\",\"Name\":\"KIRAN KUMAR SHETTY\",\"BeneficiaryCode\":null,\"Unstructured\":{\"ContactInformation\":{\"EmailAddress\":\"test@gmail.com\",\"MobileNumber\":\"9840419175\"}},\"RemittanceInformation\":{\"Unstructured\":{\"CreditorReferenceInformation\":\"Penny Drop Payment testing\"}},\"ClearingSystemIdentification\":\"IMPS\"}}},\"Risk\":{\"PaymentContextCode\":null,\"DeliveryAddress\":{\"AddressLine\":\"Flat 7,Acacia Lodge\",\"StreetName\":\"Acacia Avenue\",\"BuildingNumber\":\"27\",\"PostCode\":\"600524\",\"TownName\":\"MUM\",\"CountySubDivision\":\"MH\",\"Country\":\"IN\"}},\"Links\":{\"Self\":\"https:\/\/esbtrans.yesbank.com:7085\/api-banking\/v2.0\/domestic-payments\/payment-details\"}}",
          //       "IsSuccess": true,
          //       "PayTransactionId": 0,
          //       "PayoutInformationDetailsId": 0,
          //       "APIType": 2,
          //       "APIName": "OutBound | Penny Drop | Payment Status",
          //       "InternalRefId": "TIMPSIntegrumPennyDropTest2",
          //       "ExternalRefId": "f67eb23429a511eca9e40a0047330000",
          //       "ResponseStatus": "SettlementCompleted",
          //       "CreationDateTime": "2021-10-10T14:12:11+05:30",
          //       "StatusUpdateDateTime": "2021-10-10T14:12:12+05:30",
          //       "ErrorMessage": null,
          //       "UserMessage": null
          //     }
          //   ]
          // } as any;
          // apiR.Message = "Account Holder Name mismatched;Penny drop has been paid sucessfully";

          var jObject = apiR.Result as any;
          this.NameAsPerBank = jObject.NameAsPerBank;
          this.IsYBStatus = true;


          if (apiR.Result != null) {

            this.disableSelect = false;
            if (jObject.IsPaymentDone == false || jObject.PayoutStatus == 7849) {

              if (this.count > 2) {
                this.IsMultipleAttempts = true;
                this.IsPennyDropCheckRequired = false;
                this.updateValidation(true, this.bankForm.get('DocumentId'));
                this.updateValidation(true, this.bankForm.get('proofType'));
              }
              this.textSpin = "Finished";
              this.status = "finish";
              this.loadingicon = "check";

              this.textSpin1 = "Failed";
              this.status1 = "error";
              // this.loadingicon1 = "warning";

              this.textSpin2 = "Awaiting";
              this.status2 = "wait";
              this.loadingicon2 = "question";
              this.IsPaymentFailed = true;
              // this.IsYBStatus = false;
              this.pennydropLoading = false;
              this.isFailedInitiateProcess = true;
              this.FailedInitiateProcessMessage = jObject.ErrorMessage == null ? "Invalid Account Number | Invalid Benificiary MMID" : jObject.ErrorMessage;
              return;

            }

            if (jObject.IsPaymentDone || jObject.PayoutStatus == 10000) {
              this.disableSelect = false;
              this.bankForm.controls['bankName'].enable();
              this.bankForm.controls['IFSCCode'].enable();
              this.bankForm.value.bankName = this.bankForm.get('bankName').value;
              this.bankForm.value.IFSCCode = this.bankForm.get('IFSCCode').value;

              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = jObject;
              this.IsYBStatus = true;
              this.isSuccessInitiateProcess = true;
              this.NameAsPerBank = jObject.NameAsPerBank;

              let _rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
              let _rplStr_accountholdername = this.bankForm.value.accountHolderName.toUpperCase();
              _rplStr_NameAsPerBank = _rplStr_NameAsPerBank.replace(/\s/g, "");
              _rplStr_accountholdername = _rplStr_accountholdername.replace(/\s/g, "");

              var percentageOfSimilarity = 0;
              var percentageOfSimilaritybyCandidateName = 0;

              // if the candidate bank account holder name is not exists then take the name from candi infor accod
              var rplStr_NameAsPerBank2 = this.candidateDetailsBasic.CandidateName.toUpperCase().toString();
              rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");

              percentageOfSimilaritybyCandidateName = this.similarity(rplStr_NameAsPerBank2, _rplStr_accountholdername)

              percentageOfSimilarity = this.similarity(_rplStr_NameAsPerBank, _rplStr_accountholdername)

              if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilarity < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched;" // apiR.Message;
                // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                }
                return;
              }
              if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilaritybyCandidateName < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "The candidate's name and account holder's name are mismatched." // apiR.Message;
                // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                }
                return;
              }

              if (!environment.environment.IsSimilartyCheckRequired && _rplStr_NameAsPerBank != '' && _rplStr_NameAsPerBank.toUpperCase() != _rplStr_accountholdername.toUpperCase()) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Candidate Name / Account Holder Name is mismatched" // apiR.Message;
                // ! REQUIREMENT: to directly enable manual mode when there is a name mismatch 
                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                }
                return;
              }
              else if (!environment.environment.IsSimilartyCheckRequired) {
                this.pennydropLoading = false;
                var rplStr_accountholdername2 = this.bankForm.value.accountHolderName.toUpperCase().toString();
                rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                // if(this.mismatch  == true)
                {
                  this.confirmationPennydrop();
                  return;
                }
                this.IsPennyDropCheckRequired = false;

                this.activeModal.close(this.bankForm.value);
                this.alertService.showSuccess("Great! Bank details has been added.");

              }

              if (apiR.Message == 'Account Holder Name mismatched;Please check and resubmit the Account information') {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "The candidate's name and account holder's name are mismatched." // apiR.Message;
                if (this.IsNameMisMatched) {
                  this.bankForm.controls.accountHolderName.setValue(this.NameAsPerBank);
                  this.IsMultipleAttempts = true;
                  this.manuallVerification = true;
                  this.IsManualModeEnabled = true;
                  this.showDisabledManualMode = true;
                  this.IsPennyDropCheckRequired = false;
                  this.updateValidation(true, this.bankForm.get('DocumentId'));
                  this.updateValidation(true, this.bankForm.get('proofType'));
                  this.alertService.showWarning(`The Account holder name/Candidate name is mismatched. Please use manual mode`);
                  return;
                }
              }



            }


            this.IsYBStatus = true;
            this.isSuccessInitiateProcess = true;
            this.textSpin = "initialization Done";
            this.status = "finish";
            this.loadingicon = "check";
            this.desciption = "Initiation phase done"


            this.textSpin1 = "Completed";
            this.status1 = "finish";
            this.loadingicon1 = "check";
            this.desciption1 = "Bank responded"


            this.textSpin2 = "In Progress";
            this.status2 = "process";
            this.loadingicon2 = "loading";
            this.desciption2 = "Finalizing status"


            setTimeout(() => {

              this.textSpin = "initialization  Done";
              this.status = "finish";
              this.loadingicon = "check";

              this.textSpin1 = "Completed";
              this.status1 = "finish";
              this.loadingicon1 = "check";

              this.textSpin2 = "Finished";
              this.status2 = "finish";
              this.loadingicon2 = "check";
              this.desciption2 = "Process Completed"


              setTimeout(() => {

                this.bankForm.controls['bankName'].enable();
                this.bankForm.controls['IFSCCode'].enable();

                this.bankForm.value.bankName = this.bankForm.get('bankName').value;
                this.bankForm.value.IFSCCode = this.bankForm.get('IFSCCode').value;
                let _rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
                let _rplStr_accountholdername = this.bankForm.value.accountHolderName.toUpperCase();
                _rplStr_NameAsPerBank = _rplStr_NameAsPerBank.replace(/\s/g, "");
                _rplStr_accountholdername = _rplStr_accountholdername.replace(/\s/g, "");

                var percentageOfSimilarity = 0;
                var percentageOfSimilaritybyCandidateName = 0;

                // if the candidate bank account holder name is not exists then take the name from candi infor accod

                var rplStr_NameAsPerBank2 = this.candidateDetailsBasic.CandidateName.toUpperCase().toString();
                rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");

                percentageOfSimilaritybyCandidateName = this.similarity(rplStr_NameAsPerBank2, _rplStr_accountholdername)

                percentageOfSimilarity = this.similarity(_rplStr_NameAsPerBank, _rplStr_accountholdername)

                if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilarity < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
                  this.pennydropLoading = false;
                  this.isFailedInitiateProcess = true;
                  this.mismatch = true;
                  this.IsNameMisMatched = true;
                  this.FailedInitiateProcessMessage = "Account Holder Name is mismatched;" // apiR.Message;
                  return;
                }

                if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilaritybyCandidateName < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
                  this.pennydropLoading = false;
                  this.isFailedInitiateProcess = true;
                  this.mismatch = true;
                  this.IsNameMisMatched = true;
                  this.FailedInitiateProcessMessage = "The candidate's name and account holder's name are mismatched." // apiR.Message;
                  return;
                }

                if (!environment.environment.IsSimilartyCheckRequired && _rplStr_NameAsPerBank != '' && _rplStr_NameAsPerBank.toUpperCase() != _rplStr_accountholdername.toUpperCase()) {
                  this.pennydropLoading = false;
                  this.isFailedInitiateProcess = true;
                  this.mismatch = true;
                  this.IsNameMisMatched = true;
                  this.FailedInitiateProcessMessage = apiR.Message;
                  return;
                }
                else if (!environment.environment.IsSimilartyCheckRequired) {
                  this.pennydropLoading = false;

                  var rplStr_accountholdername2 = this.bankForm.value.accountHolderName.toUpperCase().toString();
                  rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");



                  if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                  // if(this.mismatch  == true)
                  {
                    this.confirmationPennydrop();
                    return;
                  }
                  this.IsPennyDropCheckRequired = false;
                  this.activeModal.close(this.bankForm.value);
                  this.alertService.showSuccess("Great! Bank details has been added.");

                } else {
                  this.disableSelect = false;
                  this.bankForm.controls['bankName'].enable();
                  this.bankForm.controls['IFSCCode'].enable();
                  this.bankForm.value.bankName = this.bankForm.get('bankName').value;
                  this.bankForm.value.IFSCCode = this.bankForm.get('IFSCCode').value;

                  if (this.count1 > 2) {
                    this.IsMultipleAttempts = true;
                    this.IsPennyDropCheckRequired = false;
                    this.updateValidation(true, this.bankForm.get('DocumentId'));
                    this.updateValidation(true, this.bankForm.get('proofType'));
                  }
                  this.textSpin = "Failed";
                  this.status = "error";
                  this.desciption = "Initiation failed"

                  // this.loadingicon = "warning";

                  this.textSpin1 = "Awaiting";
                  this.status1 = "wait";
                  this.loadingicon1 = "question";

                  this.textSpin2 = "Pending";
                  this.status2 = "wait";
                  this.loadingicon2 = "question";

                  this.pennydropLoading = false;

                  // this.isFailedInitiateProcess = true;

                  this.FailedInitiateProcessMessage = apiR.Message;
                  // this.IsInitiatingPennyDropDone = false;
                  // this.IsYBStatus = false;
                  // this.initiatingObject = null;
                  return;
                }

              }, 500);



            }, 10000);




          }

          // else {

          //   if (this.count > 2) {
          //     this.IsMultipleAttempts = true;
          //     this.IsPennyDropCheckRequired = false;
          //     this.updateValidation(true, this.bankForm.get('DocumentId'));
          //     this.updateValidation(true, this.bankForm.get('proofType'));
          //   }
          //   this.textSpin = "Finished";
          //   this.status = "finish";
          //   this.loadingicon = "check";

          //   this.textSpin1 = "Failed";
          //   this.status1 = "error";
          //   // this.loadingicon1 = "warning";

          //   this.textSpin2 = "Awaiting";
          //   this.status2 = "wait";
          //   this.loadingicon2 = "question";

          //   // this.IsYBStatus = false;
          //   this.pennydropLoading = false;
          //   this.isFailedInitiateProcess = true;
          //   this.IsPaymentFailed = true;
          //   this.FailedInitiateProcessMessage = apiR.Message;
          //   return;

          // }
          res(true);

        })

    });
    return promise;
  }


  onChangeBank(bank) {

    this.is_spinner_ifsc = true;
    console.log(bank);

    this.bankForm.controls['IFSCCode'].setValue(null);
    this.BranchList = [];
    this.onboardingService.getBankBranchByBankId(bank.Id)
      .subscribe(authorized => {

        console.log(authorized);

        const apiResponse: apiResponse = authorized;
        this.BranchList = apiResponse.dynamicObject;
        this.is_spinner_ifsc = false;

      }), ((err) => {

      });

  }

  onChangeIFSC(event) {
    console.log(event);


    this.BankBranchId = event.FinancialSystemCode;


  }
  ProofChangeFn(evnt, list, type) {
    // check if Cancelled Cheque is selected. 
    // If yes, only image file should be uploaded (for online joining kit purpose)
    const checkProofType = list.filter(a => a.DocumentTypeId == parseInt(this.bankForm.get('proofType').value))[0];
    this.acceptOnlyImageFile = false;
    if (checkProofType.Name.includes('Cancelled Cheque')) {
      this.acceptOnlyImageFile = true;
    }
    if (evnt) {
      for (var i in list) {
        if (parseInt(this.bankForm.get('proofType').value) == list[i].DocumentTypeId) {
          this.MaxSize = list[i].MaxSize;
        }
      }
    }
    else {
      this.MaxSize = 0;
    }
  }
  /* #region  before jszip */

  // onFileUpload(e) {
  //   let proofType = this.bankForm.get('proofType').value;
  //   if (proofType) {
  //     this.isLoading = false;
  //     if (e.target.files && e.target.files[0]) {

  //       const file = e.target.files[0];
  //       const pattern = /image-*/;
  //       var type = e.target.files[0].type;
  //       var size = e.target.files[0].size;
  //       var maxSize = (Math.round(size / 1024) + " KB");
  //       console.log('maxsize', maxSize);
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
  //     text: "Once deleted, you cannot undo this action.",
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
  //         this.bankForm.controls['IsDocumentDelete'].setValue(true);
  //         this.bankForm.controls['FileName'].setValue(null);

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
  //         this.bankForm.controls['DocumentId'].setValue(null);
  //         this.bankForm.controls['FileName'].setValue(null);
  //         this.FileName = null;
  //         this.DocumentId = null;
  //         this.bankForm.controls['IsDocumentDelete'].setValue(false);
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

  //           this.bankForm.controls['DocumentId'].setValue(apiResult.Result);
  //           this.bankForm.controls['FileName'].setValue(this.FileName);
  //           this.DocumentId = apiResult.Result;
  //           this.unsavedDocumentLst.push({
  //             Id: apiResult.Result
  //           })
  //           this.isLoading = true;
  //           this.alertService.showSuccess("Awesome..., You have successfully uploaded this file")

  //         }
  //         else {
  //           this.FileName = null;
  //           this.isLoading = true;
  //           this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message)
  //         }
  //       } catch (error) {
  //         this.FileName = null;
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while trying to upload! " + error)
  //       }

  //     }), ((err) => {

  //     })

  //     console.log(objStorage);
  //   } catch (error) {
  //     this.FileName = null;
  //     this.alertService.showWarning("An error occurred while trying to upload! " + error)
  //     this.isLoading = true;
  //   }

  // }


  /* #endregion */

  /* #region  after jszip */

  onAddingFile(e) {
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
    let proofType = this.bankForm.get('proofType').value;
    if (proofType) {

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

        this.FileName = `${this.objStorageJson.CandidateName == undefined || this.objStorageJson.CandidateName == null ? '' : this.objStorageJson.CandidateName.replace(/\s/g, "")}_bankDocs${new Date().getTime().toString()}.zip`;  //files[0].name;

        if (files && files[0]) {

          // for (let i = 0; i < files.length; i++) {
          //  let b: any = new Blob([files[i]], { type: '' + files[i].type + '' });
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
                //   this.bankForm.controls['IsDocumentDelete'].setValue(true);
                //   this.bankForm.controls['FileName'].setValue(null);
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
      this.alertService.showWarning("Please select Id proof.");
    }

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
      text: "Once deleted, you cannot undo this action.",
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
        //   this.bankForm.controls['IsDocumentDelete'].setValue(true);
        //   this.bankForm.controls['FileName'].setValue(null);

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
          this.bankForm.controls['DocumentId'].setValue(null);
          this.bankForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.bankForm.controls['IsDocumentDelete'].setValue(false);
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

            this.bankForm.controls['DocumentId'].setValue(apiResult.Result);
            this.bankForm.controls['FileName'].setValue(this.FileName);
            this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file");
            this.isFileChange = false;
            this.savebutton();

          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message);
            this.isFileChange = true;
          }
        } catch (error) {
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to upload! " + error)
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.alertService.showWarning("An error occurred while trying to upload! " + error)
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
          this.bankForm.controls['DocumentId'].setValue(null);
          this.bankForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.DocumentId = null;
          this.bankForm.controls['IsDocumentDelete'].setValue(false);


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

  onChangeManual(event) {
    if (event.target.checked) {

      this.IsManualModeEnabled = true;
    } else {

      this.IsManualModeEnabled = false;
    }
  }

  checkduplicateBankDetails() {

    // var lstBankDetails = [];

    // var candidateDets = new CandidateDocuments();
    // candidateDets.Id = result.CandidateDocument.Id;
    // candidateDets.CandidateId = result.CandidateDocument.CandidateId;
    // candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
    // candidateDets.DocumentId = result.DocumentId;
    // candidateDets.DocumentCategoryId = 0;
    // candidateDets.DocumentTypeId = result.proofType
    // candidateDets.DocumentNumber = "0";
    // candidateDets.FileName = result.FileName;
    // candidateDets.ValidFrom = null;
    // candidateDets.ValidTill = null;
    // candidateDets.Status = result.VerificationMode == 2 ? ApprovalStatus.Approved : ApprovalStatus.Pending; //  
    // candidateDets.IsOtherDocument = true;
    // candidateDets.Modetype = UIMode.Edit;
    // candidateDets.DocumentCategoryName = "";
    // candidateDets.StorageDetails = null;
    // result.CandidateDocument = candidateDets;
    // result.Modetype = UIMode.Edit;


    // var candidateBankDetails = new CandidateBankDetails();
    // candidateBankDetails.BankId = this.bankForm.value.bankName;
    // candidateBankDetails.BankBranchId = this.bankForm.value.IFSCCode;
    // candidateBankDetails.AccountNumber = this.bankForm.value.accountNumber;
    // candidateBankDetails.AccountHolderName = this.bankForm.value.accountHolderName;
    // candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
    // candidateBankDetails.IdentifierValue = this.bankForm.value.bankBranchId;
    // candidateBankDetails.SalaryContributionPercentage = 100;
    // candidateBankDetails.IsDefault = true;
    // candidateBankDetails.Status =  CandidateStatus.Active ;
    // // this.candidateBankDetails.Modetype =  UIMode.Edit;;
    // candidateBankDetails.Modetype = UIMode.Edit;
    // candidateBankDetails.Id = this.isGuid(this.bankForm.value.id) == true ? 0 : this.bankForm.value.id,
    // candidateBankDetails.CandidateDocument =  element.CandidateDocument
    // candidateBankDetails.VerificationMode = this.bankForm.value.VerificationMode;
    // candidateBankDetails.VerificationAttempts = this.bankForm.value.VerificationAttempts;
    // candidateBankDetails.PayoutLogId = this.payoutLogId
    // candidateBankDetails.Remarks = ''

    // lstBankDetails.push(

    //   candidateBankDetails
    // )


    // this.candidateDetails.LstCandidateBankDetails = this.lstBankDetails;


    // this.candidateModel = _CandidateModel;
    // this.candidateModel.NewCandidateDetails = this.candidateDetails;

    // let candidate_req_json = this.candidateModel;
    // // this.loadingScreenService.stopLoading();
    // this.onboardingService.putCandidate(JSON.stringify(candidate_req_json)).subscribe((data: any) => {

    //   let apiResponse: apiResponse = data;
    //   try {
    //     if (apiResponse.Status) {

    //     }
    //     else {

    //       this.alertService.showWarning("Failed!   Candidate save wasn't completed " + apiResponse.Message != null ? apiResponse.Message : ''), this.loadingScreenService.stopLoading()
    //     };
    //   } catch (error) {

    //     { this.alertService.showWarning(error + " Failed!   Candidate save wasn't completed "), this.loadingScreenService.stopLoading() };
    //   }

    // },
    //   (err) => {


    //   });
  }


  // levenshtein(a, b) {
  //   "use strict";
  //   var i = 0,
  //     j = 0,
  //     cost = 1,
  //     d = [],
  //     x = a.length,
  //     y = b.length,
  //     ai = "",
  //     bj = "",
  //     xx = x + 1,
  //     yy = y + 1;
  //   if (x === 0) {
  //     return y;
  //   }
  //   if (y === 0) {
  //     return x;
  //   }
  //   for (i = 0; i < xx; i += 1) {
  //     d[i] = [];
  //     d[i][0] = i;
  //   }
  //   for (j = 0; j < yy; j += 1) {
  //     d[0][j] = j;
  //   }
  //   for (i = 1; i < xx; i += 1) {
  //     for (j = 1; j < yy; j += 1) {
  //       ai = a.charAt(i - 1);
  //       bj = b.charAt(j - 1);
  //       if (ai === bj) {
  //         cost = 0;
  //       } else {
  //         cost = 1;
  //       }
  //       d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
  //       if (i > 1 && j > 1 && ai === b.charAt(j - 2) && a.charAt(i - 2) === bj) {
  //         d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost);
  //       }
  //     }
  //   }
  //   return d[x][y];
  // };

  // suggests(suggWord) {
  //   var words = "arulmano";
  //   var sArray = [];
  //   for (var z = words.length; --z;) {
  //     if (Math.abs(suggWord.length - words[z].length) < 2) {
  //       if (this.levenshtein(words[z], suggWord) < 2) {
  //         sArray.push(words[z]);
  //         console.log('sArray', sArray);

  //       }
  //     }
  //   }
  // }

  similarity(s1, s2) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (longerLength - this.editDistance(longer, shorter)) / parseFloat(longerLength);
  }

  editDistance(s1, s2) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0)
          costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue),
                costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0)
        costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }
}

