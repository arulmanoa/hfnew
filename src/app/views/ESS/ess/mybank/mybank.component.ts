import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import { EmployeeBankDetails } from 'src/app/_services/model/Employee/EmployeeBankDetails';
import { CandidateBankDetails, BankBranchIdentifierType } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { DomSanitizer } from '@angular/platform-browser';
import { NgxSpinnerService } from "ngx-spinner";
import * as JSZip from 'jszip';

import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { BankDocumentCategoryList, BankInfo, BankList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { ApprovalStatus, CandidateDocuments, DocumentVerificationMode } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { PagelayoutService, CommonService, SearchService, PayrollService } from 'src/app/_services/service';
import { environment } from "./../../../../../environments/environment";
import { apiResult } from 'src/app/_services/model/apiResult';
import { DomesticPayment } from 'src/app/_services/model/Payroll/DomesticPayment';
import { UUID } from 'angular2-uuid';
import { VerificationMode } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import Swal from 'sweetalert2';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { LoginResponses } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { CookieService } from 'ngx-cookie-service';



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
  selector: 'app-mybank',
  templateUrl: './mybank.component.html',
  styleUrls: ['./mybank.component.css']
})
export class MybankComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() BankInfoListGrp: BankInfo;

  @Output() bankChangeHandler = new EventEmitter();
  @Input() NotAccessibleFields = [];
  @Input() AccessibleButtons = [];
  
  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  spinner: boolean = true;

  // REACTIVE FORM 
  employeeForm: FormGroup;

  // GENERAL DECL.
  isESSLogin: boolean = false;
  EmployeeId: number = 0;
  _loginSessionDetails: LoginResponses;
  CompanyId: any = 0;
  UserId: any = 0;
  RoleId: any = 0;
  RoleCode: any;
  ImplementationCompanyId: any = 0;
  BusinessType: any = 0;
  employeeModel: EmployeeModel = new EmployeeModel();

  clientLogoLink: any;
  clientminiLogoLink: any;

  // BANK 
  LstBank: any[] = [];
  BankList: BankList[] = [];
  BankDocumentCategoryList: BankDocumentCategoryList[] = [];
  rejectedLst = [];
  isEnbleBankBtn: boolean = true;
  FileName: any;
  DocumentId: any;

  bank_slidervisible = false;
  BankBranchId: any;
  popupId: any;
  firstTimeDocumentId: any;
  IsPennyDropCheckRequired: boolean = false;
  GlbIsPennyDropCheckRequired: boolean = false;
  // START PENNYDROP PAYMENT 
  internalRefId: any;
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
  pennydropLoading: boolean = false;
  pennydropspinnerText: string = "Checking..."
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
  IsPaymentFailed: boolean = false;
  disableSelect: boolean = false;
  IsNameMisMatched: boolean = false;


  ActualAccountHolderName: any;
  mismatch: boolean = false;
  isDuplicateBankInfo: boolean = false;

  spinnerText: string = "Uploading";
  isLoading: boolean = true;
  unsavedDocumentLst = [];

  isBankUnderQC: boolean = false;
  deletedBanks = [];
  lstBankDetails: EmployeeBankDetails[] = [];
  documentURL: any = null; // end
  documentURLId: any = null;
  MenuId: any;
  is_spinner_ifsc: boolean = false;
  isrendering_spinner: boolean = false;
  BranchList = [];
  employeeOldDetials = new EmployeeDetails();
  rejectedRemarks: string = "";
  IsEditAllowedforApprovedBanks: boolean = false
  IsBankDocumentMandatory: boolean = true
  LstBankCopy: [];

  MaxSize: any = 0;
  acceptOnlyImageFile: boolean = false;
  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];

  // Multiple File Upload
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  docList: any[];//jszip
  bankDocList: any[] = [];//jszip
  contentmodalurl: any;
  nameMismatchVerificationCount: number = 0;
  allowedToSave: boolean = true;

  isAllenDigital: boolean = false;
  
  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private payrollService: PayrollService,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    private loadingScreenService: LoadingScreenService,
    private sanitizer: DomSanitizer,
    private onboardingService: OnboardingService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private Customloadingspinner: NgxSpinnerService,
    private UIBuilderService: UIBuilderService,
    private cookieService: CookieService,

  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 


  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({

      //COMMUNICATION
      bankdetailsId: [null],
      bankName: [null],
      IFSCCode: [null],
      accountHolderName: [''],
      accountNumber: [''],
      confirmAccountNumber: [''],
      allocation: ['100', [mixmaxcheck]],
      status: [true],
      proofType: [null],
      bankBranchId: [''],
      DocumentId: [null,],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop
      VerificationMode: [null],
      VerificationAttempts: [0],
      PayoutLogId: [null],
      Remarks: ['']

    });
  }
  ngOnInit() {

    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    this.isAllenDigital = (cookieValue.toUpperCase() == 'ALLEN' && (businessType === 1 || businessType === 2)) ? true : false;

    this.nameMismatchVerificationCount = 0;
    this.bank_slidervisible = false;
    // this.employeeForm.valueChanges.subscribe((changedObj: any) => {
    //   this.subscribeEmitter();
    // });
    this.doRefresh();
  }

  doRefresh() {

    this.spinner = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    // this.RoleCode = "Test";
    // let companyLogos = this.essService.GetCompanyLogoByBusinessType(this._loginSessionDetails, this.BusinessType);
    // this.clientLogoLink = companyLogos.clientLogoLink;
    // this.clientminiLogoLink = companyLogos.clientminiLogoLink;
    let mode = 2; // add-1, edit-2, view, 3   
    this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    try {
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (error) {
      console.log('UI BUILDER ::', error);

    }
    this.allowedToSave = environment.environment.AllowedRolesToSaveEmployeeDetails &&
      environment.environment.AllowedRolesToSaveEmployeeDetails.includes(this.RoleCode) ? true : false;
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");

      this.GetEmployeeRequiredBankDetails().then((obj) => {
        this.Common_GetEmployeeAccordionDetails('isBankInfo').then((obj1) => {
          this.GetCompanyRequiredSettings(this.employeedetails.EmploymentContracts[0].CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId, 'IsEditAllowedforApprovedBanks,IsBankDocumentMandatory').then((result) => {

          })

          this.GetCompanySettings(this.employeedetails.EmploymentContracts[0].CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId).then((obj3) => {
            this.patchEmployeeForm();


          });
        });
      })

    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
      if (this.EmployeeId == 0) {
        this.patchEmployeeForm();
        return;
      }
      this.GetCompanyRequiredSettings(this.employeedetails.EmploymentContracts[0].CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId, 'IsEditAllowedforApprovedBanks,IsBankDocumentMandatory').then((result) => {
        // console.log("result",result)
        this.patchEmployeeForm();
      })

    }


  }
  patchEmployeeForm() {
    this.LstBank = [];
    this.lstBankDetails = [];
    try {

      if (this.employeedetails != null) {



        if (this.BankInfoListGrp == undefined) {

          this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, 'isBankInfo').then((Result) => {
            console.log('re ter', Result)
            this.BankInfoListGrp = Result as any;
            try {
              this.dataMapping();
              // this.GetCompanySettings(this.employeedetails.EmploymentContracts[0].CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId);

            } catch (error) {
              console.log('EX GET COMMUNICATION INFO :', error);

            }

          });
        } else {
          this.dataMapping();
        }
        this.employeeService.getActiveTab(false);
        // For Candidate Communication accordion  (Edit)
        try {
          // For Bank Information accordion (Edit)
          if (this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
            this.LstBank = [];
            this.employeedetails.lstEmployeeBankDetails.forEach(element => {
              if (element.CandidateDocument != null) {
                element.CandidateDocument.Modetype = UIMode.Edit;
              }
              console.log('sss', element);
              console.log('this.BankList', this.BankList);

              this.LstBank.push({
                Id: element.Id == 0 ? UUID.UUID : element.Id,
                id: element.Id == 0 ? UUID.UUID : element.Id,
                bankDetailsId: element.Id,
                bankName: (element.BankId),
                accountNumber: element.AccountNumber,
                IFSCCode: element.BankBranchId,
                allocation: element.SalaryContributionPercentage,
                accountHolderName: element.AccountHolderName,
                bankBranchId: element.IdentifierValue,
                status: element.Status,
                StatusName: element.Status == 0 ? 'Pending' : element.Status == 1 ? 'Approved' : element.Status == 2 ? "Rejected" : 'Pending',
                proofType: "",
                CandidateDocument: element.CandidateDocument,
                DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
                isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
                Modetype: UIMode.None,
                bankFullName: element.BankName,
                IsDefault: element.IsDefault,
                IsDefaultText: element.IsDefault == true ? 'Yes' : 'No',
                VerificationMode: element.VerificationMode,
                VerificationAttempts: element.VerificationAttempts,
                PayoutLogId: element.PayoutLogId,
                Remarks: element.Remarks,
                isEditButtonEnable: element.Status == 0 ? true : element.Status == 2 ? true : (this.IsEditAllowedforApprovedBanks == true && element.Status == 1) ? true : false

              })

              element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Bank_Details");

            });
            console.log('this.LstBank', this.LstBank);
            this.LstBankCopy = JSON.parse(JSON.stringify(this.LstBank));

            this.isBankUnderQC = this.employeedetails.lstEmployeeBankDetails.filter(a => a.ModuleProcessTransactionId > 0 && a.Status == 0).length > 0 ? true : false;
          }
        } catch (error) { }
      }
      this.spinner = false;
    } catch (error) {
      this.spinner = false;
      this.employeeService.getActiveTab(false);
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY PROFILE DETAILS :', error);

    }

  }

  rejectedDocs_init(element, AccordionName) {
    this.rejectedLst.push({
      CandidateId: AccordionName == "Client_Approvals" ? element.EntityId : element.CandidateId,
      FileName: element.DocumentName,
      Remarks: AccordionName == "Client_Approvals" ? element.RejectionRemarks : element.Remarks,
      Accordion: AccordionName
    });
  }


  dataMapping() {
    this.BankList = this.BankInfoListGrp.BankList;
    this.BankDocumentCategoryList = this.BankInfoListGrp.BankDocumentCategoryList;
  }

  getBankName(bankId) {
    return this.BankList != null && this.BankList.length > 0 ? this.BankList.find(a => a.Id == bankId).Name : '---';
  }

  /// add new bank information


  openBankSlider() {
    this.IsManualModeEnabled = true;
    this.IsMultipleAttempts = false;
    this.NameAsPerBank = '';
    this.IsInitiatingPennyDropDone = false;
    this.IsYBStatus = false;
    this.initiatingObject = null;
    this.count = 0;
    this.count1 = 0;
    this.isFailedInitiateProcess = false;

    this.IsPennyDropCheckRequired = this.GlbIsPennyDropCheckRequired;
    this.employeeForm.controls['bankdetailsId'].reset();
    this.employeeForm.controls['bankName'].reset();
    this.employeeForm.controls['accountNumber'].reset();
    this.employeeForm.controls['confirmAccountNumber'].reset();
    this.employeeForm.controls['IFSCCode'].reset();
    this.employeeForm.controls['accountHolderName'].reset();
    this.employeeForm.controls['proofType'].reset();
    this.employeeForm.controls['bankBranchId'].reset();
    this.employeeForm.controls['DocumentId'].reset();
    this.employeeForm.controls['FileName'].reset();
    this.employeeForm.controls['IsDocumentDelete'].reset();
    this.employeeForm.controls['VerificationMode'].reset();
    this.employeeForm.controls['PayoutLogId'].reset();
    this.employeeForm.controls['VerificationAttempts'].reset();
    this.employeeForm.controls['Remarks'].reset();
    this.isESSLogin && this.employeeForm.enable();
    this.DocumentId = null;
    this.FileName = null;
    this.fileList = [];
    this.BranchList = [];
    this.isFileChange = false;
    this.firstTimeDocumentId = null;
    this.fileList.length = 0;
    // this.doAccordionLoading("isBankInfo");   // For Bank Information Pre-loading data
    this.bank_slidervisible = true;



  }

  GetCompanySettings(_companyId, _clientId, _clientContractId) {
    const promise = new Promise((res, rej) => {
      this.payrollService.GetCompanySettings(_companyId, _clientId, _clientContractId, 'IsPennyDropCheckRequired')
        .subscribe((result) => {
          let apiR: apiResult = result;
          console.log('PENNY DROP STATUS ::', apiR);

          if (apiR.Status && apiR.Result != null) {
            var jobject = apiR.Result as any;
            var jSettingValue = JSON.parse(jobject.SettingValue);
            console.log('Setting Value : ', jSettingValue);
            this.IsPennyDropCheckRequired = false; // jSettingValue == '1' ? true : false;
            this.GlbIsPennyDropCheckRequired = false; // jSettingValue == '1' ? true : false;

            if (jSettingValue == '1' && environment.environment.IsPennyDropCheckRequired) {
              this.IsPennyDropCheckRequired = true;
              this.GlbIsPennyDropCheckRequired = true;
            }



            this.essService.updateValidation(false, this.employeeForm.get('DocumentId'));
            this.essService.updateValidation(false, this.employeeForm.get('proofType'));
            res(true);


          } else {
            res(true);
          }

        })
    })
    return promise;
  }




  addBank(json_edit_object) {
    console.log('json_edit_object', json_edit_object);
    this.IsNameMisMatched = false;
    this.count = 0;
    this.BankBranchId = null;
    this.isFailedInitiateProcess = false;
    // this.doAccordionLoading("isBankInfo");   // For Bank Information Pre-loading data
    this.pennydropLoading = false;
    this.IsManualModeEnabled = true;
    this.IsMultipleAttempts = false;
    this.NameAsPerBank = '';
    this.IsInitiatingPennyDropDone = false;
    this.IsYBStatus = false;
    this.initiatingObject = null;
    this.count = 0;
    this.count1 = 0;
    this.fileList = [];
    this.isFailedInitiateProcess = false;
    this.BranchList = [];
    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {

      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
      json_edit_object.proofType = json_edit_object.CandidateDocument.DocumentTypeId;
    }


    this.popupId = json_edit_object.Id;
    this.firstTimeDocumentId = json_edit_object.DocumentId;
    this.employeeForm.controls['bankdetailsId'].setValue(json_edit_object.Id);
    this.employeeForm.controls['bankName'].setValue(json_edit_object.bankName);
    this.employeeForm.controls['IFSCCode'].setValue(json_edit_object.IFSCCode);
    this.employeeForm.controls['accountHolderName'].setValue(json_edit_object.accountHolderName);
    this.employeeForm.controls['accountNumber'].setValue(json_edit_object.accountNumber);
    this.employeeForm.controls['confirmAccountNumber'].setValue(json_edit_object.accountNumber);
    this.employeeForm.controls['allocation'].setValue(json_edit_object.allocation);
    this.employeeForm.controls['status'].setValue(json_edit_object.status);
    this.employeeForm.controls['proofType'].setValue(json_edit_object.proofType);
    this.employeeForm.controls['bankBranchId'].setValue(json_edit_object.bankBranchId);
    this.employeeForm.controls['VerificationMode'].setValue(json_edit_object.VerificationMode);
    this.employeeForm.controls['PayoutLogId'].setValue(json_edit_object.PayoutLogId);
    this.employeeForm.controls['VerificationAttempts'].setValue(json_edit_object.VerificationAttempts);
    this.employeeForm.controls['Remarks'].setValue(json_edit_object.Remarks);
    this.rejectedRemarks = json_edit_object.Remarks;
    if (this.BranchList.length == 0) {
      this.toGetBankBranchList(json_edit_object.bankName);
    }

    if (json_edit_object.FileName && json_edit_object.DocumentId) {


      /* #region  after jszip */
      this.spinnerText = "Loading";
      this.fileuploadService.getObjectById(json_edit_object.DocumentId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.fileList = [];
            this.isFileChange = true;
            this.alertService.showWarning(dataRes.Message);
            return;
          }
          var objDtls = dataRes.Result;
          this.fileList = [];

          var fileNameSplitsArray = json_edit_object.FileName.split('.');
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
                }
              });
            });
          }
        })
      /* #endregion */
    }



    this.BankBranchId = json_edit_object.bankBranchId;

    if (json_edit_object.DocumentId) {

      this.FileName = json_edit_object.FileName;
      this.DocumentId = json_edit_object.DocumentId;
    }


    this.IsPennyDropCheckRequired = this.GlbIsPennyDropCheckRequired;
    if (json_edit_object.DocumentId == 0 || json_edit_object.DocumentId == null || json_edit_object.DocumentId == '') {
      if (this.GlbIsPennyDropCheckRequired) {
        this.IsPennyDropCheckRequired = true;
      }
      else {
        this.IsPennyDropCheckRequired = false;
      }

    }
    else {
      this.IsPennyDropCheckRequired = false;
    }

    this.bank_slidervisible = true;

  }

  onProofTypeChange(e) {
    console.log('proof type change -->', e);
    // check if Cancelled Cheque is selected. 
    // If yes, only image file should be uploaded (for online joining kit purpose)
    this.acceptOnlyImageFile = false;
    if (e.Name.includes('Cancelled Cheque')) {
      this.acceptOnlyImageFile = true;
    }
  }

  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }

  onChangeBank(bank) {

    this.is_spinner_ifsc = true;

    this.employeeForm.controls['IFSCCode'].setValue(null);

    this.BranchList = [];
    this.onboardingService.getBankBranchByBankId(bank.Id)
      .subscribe(authorized => {

        const apiResponse: apiResponse = authorized;
        this.BranchList = apiResponse.dynamicObject;
        this.is_spinner_ifsc = false;

      }), ((err) => {

      });

  }

  toGetBankBranchList(BankId) {
    this.is_spinner_ifsc = true;
    this.onboardingService.getBankBranchByBankId(BankId)
      .subscribe(authorized => {

        const apiResponse: apiResponse = authorized;
        this.BranchList = apiResponse.dynamicObject;
        this.is_spinner_ifsc = false;

      }), ((err) => {

      });
  }

  onChangeIFSC(event) {
    this.BankBranchId = event.FinancialSystemCode;
  }

  onChangeManual(event) {
    if (event.target.checked) {

      this.IsManualModeEnabled = true;
    } else {

      this.IsManualModeEnabled = false;
    }
  }

  validate_bank_formControl() {

   
    
    if (this.employeeForm.get('bankName').value == null || this.employeeForm.get('bankName').value == '' || this.employeeForm.get('bankName').value == undefined) {
      this.employeeForm.controls['bankName'].setErrors({ 'incorrect': true });
    }
    else if (this.employeeForm.get('IFSCCode').value == null || this.employeeForm.get('IFSCCode').value == '' || this.employeeForm.get('IFSCCode').value == undefined) {
      this.employeeForm.controls['IFSCCode'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('accountNumber').value == null || this.employeeForm.get('accountNumber').value == '' || this.employeeForm.get('accountNumber').value == undefined) {
      this.employeeForm.controls['accountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('confirmAccountNumber').value == null || this.employeeForm.get('confirmAccountNumber').value == '' || this.employeeForm.get('confirmAccountNumber').value == undefined) {
      this.employeeForm.controls['confirmAccountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('confirmAccountNumber').value != this.employeeForm.get('accountNumber').value) {
      this.employeeForm.controls['confirmAccountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('accountHolderName').value == null || this.employeeForm.get('accountHolderName').value == '' || this.employeeForm.get('accountHolderName').value == undefined) {
      this.employeeForm.controls['accountHolderName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('allocation').value == null || this.employeeForm.get('allocation').value == '' || this.employeeForm.get('allocation').value == undefined) {
      this.employeeForm.controls['allocation'].setErrors({ 'incorrect': true });

    }
    else if ((this.IsPennyDropCheckRequired == false && this.BusinessType == 3 && this.employeeForm.get('proofType').value == null || this.employeeForm.get('proofType').value == '')) {
      this.employeeForm.controls['proofType'].setErrors({ 'incorrect': true });
    }
    else if ((this.IsPennyDropCheckRequired == false && this.BusinessType != 3 && this.IsBankDocumentMandatory == true && this.employeeForm.get('proofType').value == null || this.employeeForm.get('proofType').value == '')) {
      this.employeeForm.controls['proofType'].setErrors({ 'incorrect': true });
    }

    // else if ((this.IsPennyDropCheckRequired == false && this.BusinessType == 3 && this.FileName == null)) {
    //   this.employeeForm.controls['DocumentId'].setErrors({ 'incorrect': true });
    // }
    // else if ((this.IsPennyDropCheckRequired == false && this.BusinessType != 3 && this.IsBankDocumentMandatory == true && this.FileName == null)) {
    //   this.employeeForm.controls['DocumentId'].setErrors({ 'incorrect': true });
    //   this.alertService.showWarning('Attachment is required');
    //   return;
    // }

    else if ((this.IsPennyDropCheckRequired == false && this.BusinessType == 3 && this.fileList.length == 0)) {
      this.alertService.showWarning('Attachment is required');
      return;
    }
    else if ((this.IsPennyDropCheckRequired == false && this.BusinessType != 3 && this.IsBankDocumentMandatory == true && this.fileList.length == 0)) {     
      this.alertService.showWarning('Attachment is required');
      return;
    }
    else {
      this.onFileUpload();
    }
  }

  addnewbankdetails() {


    if (this.employeeForm.get('bankName').value == null || this.employeeForm.get('bankName').value == '' || this.employeeForm.get('bankName').value == undefined) {
      this.employeeForm.controls['bankName'].setErrors({ 'incorrect': true });
    }
    else if (this.employeeForm.get('IFSCCode').value == null || this.employeeForm.get('IFSCCode').value == '' || this.employeeForm.get('IFSCCode').value == undefined) {
      this.employeeForm.controls['IFSCCode'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('accountNumber').value == null || this.employeeForm.get('accountNumber').value == '' || this.employeeForm.get('accountNumber').value == undefined) {
      this.employeeForm.controls['accountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('confirmAccountNumber').value == null || this.employeeForm.get('confirmAccountNumber').value == '' || this.employeeForm.get('confirmAccountNumber').value == undefined) {
      this.employeeForm.controls['confirmAccountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('confirmAccountNumber').value != this.employeeForm.get('accountNumber').value) {
      this.employeeForm.controls['confirmAccountNumber'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('accountHolderName').value == null || this.employeeForm.get('accountHolderName').value == '' || this.employeeForm.get('accountHolderName').value == undefined) {
      this.employeeForm.controls['accountHolderName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('allocation').value == null || this.employeeForm.get('allocation').value == '' || this.employeeForm.get('allocation').value == undefined) {
      this.employeeForm.controls['allocation'].setErrors({ 'incorrect': true });

    }
    else if ((this.IsPennyDropCheckRequired == false && this.BusinessType == 3 && this.employeeForm.get('proofType').value == null || this.employeeForm.get('proofType').value == '')) {
      this.employeeForm.controls['proofType'].setErrors({ 'incorrect': true });
    }
    else if ((this.IsPennyDropCheckRequired == false && this.BusinessType != 3 && this.IsBankDocumentMandatory == true && this.employeeForm.get('proofType').value == null || this.employeeForm.get('proofType').value == '')) {
      this.employeeForm.controls['proofType'].setErrors({ 'incorrect': true });
    }

    // else if ((this.IsPennyDropCheckRequired == false && this.BusinessType == 3 && this.FileName == null)) {
    //   this.employeeForm.controls['DocumentId'].setErrors({ 'incorrect': true });
    // }
    // else if ((this.IsPennyDropCheckRequired == false && this.BusinessType != 3 && this.IsBankDocumentMandatory == true && this.FileName == null)) {
    //   this.employeeForm.controls['DocumentId'].setErrors({ 'incorrect': true });
    // }
    else {

      this.nameMismatchVerificationCount = this.nameMismatchVerificationCount + 1;

      var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
      var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
      rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
      rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

      var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();


      var percentageOfSimilarity1 = 0;
      var percentageOfSimilarity2 = 0;

      percentageOfSimilarity1 = this.similarity(rplStr_NameAsPerBank, rplStr_accountholdername)
      percentageOfSimilarity2 = this.similarity(rplStr_NameAsPerBank2, rplStr_accountholdername)

      if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && percentageOfSimilarity1 < environment.environment.SimilartyPercentageForCandidateBankAccountName) {

        if (this.nameMismatchVerificationCount > 3) {
          this.IsMultipleAttempts = true;
          this.IsPennyDropCheckRequired = false;
          this.essService.updateValidation(true, this.employeeForm.get('DocumentId'));
          this.essService.updateValidation(true, this.employeeForm.get('proofType'));
        }

        this.alertService.showWarning(`${this.employeeForm.value.accountHolderName} : The Account holder name/Employee name is incorrect. Re-enter the account holder name/Employee name as per bank and try again`);
        return;

      }

      if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && percentageOfSimilarity2 < environment.environment.SimilartyPercentageForCandidateBankAccountName) {

        if (this.nameMismatchVerificationCount > 3) {
          this.IsMultipleAttempts = true;
          this.IsPennyDropCheckRequired = false;
          this.essService.updateValidation(true, this.employeeForm.get('DocumentId'));
          this.essService.updateValidation(true, this.employeeForm.get('proofType'));
        }

        this.alertService.showWarning(`${this.employeeForm.value.accountHolderName} : The Account holder name/Employee name is incorrect. Re-enter the account holder name/Employee name as per bank and try again`);
        return;

      }

      if (!environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {

        if (this.nameMismatchVerificationCount > 3) {
          this.IsMultipleAttempts = true;
          this.IsPennyDropCheckRequired = false;
          this.essService.updateValidation(true, this.employeeForm.get('DocumentId'));
          this.essService.updateValidation(true, this.employeeForm.get('proofType'));

        }

        this.alertService.showWarning(`${this.employeeForm.value.accountHolderName} : The Account holder name/Employee name is incorrect. Re-enter the account holder name/Employee name as per bank and try again`);
        return;
      }


      this.isFailedInitiateProcess = false;
      this.isSuccessInitiateProcess = false;

      if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.AccountNumber != '' && this.initiatingObject.AccountNumber != null && (this.initiatingObject.AccountNumber.toString() != this.employeeForm.value.accountNumber.toString() || this.initiatingObject.IFSCCode != this.BankBranchId)) {
        this.count = 0;
        this.count1 = 0;
        this.IsInitiatingPennyDropDone = false;
      }

      if (this.IsPennyDropCheckRequired == true && this.initiatingObject != null && this.initiatingObject.NameAsPerBank != '' && this.initiatingObject.NameAsPerBank != null) {
        var rplStr_NameAsPerBank1 = this.initiatingObject.NameAsPerBank.toUpperCase().toString();
        var rplStr_accountholdername1 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
        rplStr_NameAsPerBank1 = rplStr_NameAsPerBank1.replace(/\s/g, "");
        rplStr_accountholdername1 = rplStr_accountholdername1.replace(/\s/g, "");

        if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && this.similarity(rplStr_NameAsPerBank1, rplStr_accountholdername1) < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
          this.IsYBStatus = false;
        }

        if (!environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && this.initiatingObject != null && rplStr_NameAsPerBank1 != '' && rplStr_NameAsPerBank1 != null && (rplStr_NameAsPerBank1 != rplStr_accountholdername1)) {
          this.IsYBStatus = false;
        }

      }

      if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == false) {
        this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"));
        return;
      }
      if (this.IsPennyDropCheckRequired == true && this.IsPaymentFailed) {
        this.initiatePennyDropPayment().then(() => console.log("INIITIATE PENNY DROP - Task Complete!"));
        return;
      }
      else if (this.IsPennyDropCheckRequired == true && this.IsInitiatingPennyDropDone == true && (this.IsYBStatus == false)) {
        this.GetYBPennyDropStatus(this.initiatingObject);
        return;
      } else {

        var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
        var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
        rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");
        rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

        var percentageOfSimilarity = 0;
        percentageOfSimilarity = this.similarity(rplStr_NameAsPerBank2, rplStr_accountholdername2)

        console.log('percentageOfSimilarity', percentageOfSimilarity);

        if (environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && percentageOfSimilarity < environment.environment.SimilartyPercentageForCandidateBankAccountName) {
          this.pennydropLoading = false;
          this.isFailedInitiateProcess = true;
          this.mismatch = true;
          this.IsNameMisMatched = true;

          this.FailedInitiateProcessMessage = "Employee name/Account Holder Name is mismatched;" // apiR.Message;
          return;
        }

        if (!environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && rplStr_NameAsPerBank2 != rplStr_accountholdername2) {
          this.confirmationPennydrop();
          return;
        }

        if (this.employeeForm.value.FileName == null || this.employeeForm.value.FileName == undefined) {
          this.FileName = ` ${this.employeedetails.FirstName == null ? '' : this.employeedetails.FirstName.replace(/\s/g, "")}_bankDocs${new Date().getTime().toString()}.zip`;  //files[0].name;
          this.employeeForm.value.FileName = this.FileName;
        }
        this.updateBankGridTable();
        return;
      }

    }

  }


  initiatePennyDropPayment() {
    this.employeeForm.controls['bankName'].disable();
    this.employeeForm.controls['IFSCCode'].disable();
    this.IsNameMisMatched = false;

    this.count1 = this.count1 + 1;
    this.IsManualModeEnabled = false;
    this.pennydropLoading = true;

    this.IsPaymentFailed = false;
    this.disableSelect = true;
    this.isFailedInitiateProcess = false;
    this.FailedInitiateProcessMessage = '';
    this.textSpin = "In Progress";
    this.status = "process";
    this.loadingicon = "loading";
    this.desciption = "Initiating Process"


    this.textSpin1 = "Waiting";
    this.status1 = "wait";
    this.loadingicon1 = "question";
    this.desciption1 = "Waiting to Connect Bank"


    this.textSpin2 = "Waiting";
    this.status2 = "wait";
    this.loadingicon2 = "question";
    this.desciption2 = "Waiting to Responding Bank"





    this.employeeForm.controls['VerificationMode'].setValue(this.IsPennyDropCheckRequired == true ? VerificationMode.PennyDrop : VerificationMode.QcVerification)


    this.pennydropspinnerText = "Initiating...";
    const promise = new Promise((res, rej) => {
      this.internalRefId = `${this.employeeForm.value.accountHolderName.substring(0, 4).toUpperCase()}${this.employeeForm.value.accountNumber.substring(0, 5)}${new Date().getTime()}`;
      this.internalRefId = this.internalRefId.replace(/\./g, ' ');
      var domesticPayment = new DomesticPayment();
      domesticPayment.Status = '';
      domesticPayment.NameAsPerBank = '';
      domesticPayment.Identification = '';
      domesticPayment.SchemeName = '';
      domesticPayment.CompanyBankAccountId = 0;
      domesticPayment.IsPaymentDone = false;
      domesticPayment.AcknowledgmentDetail = '';
      domesticPayment.MobileNumber = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile : '1234567890';
      domesticPayment.ErrorMessage = '';
      domesticPayment.EmailId = this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0 ? this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail : 'test@gmail.com';
      domesticPayment.CreditorReferenceInformation = 'Initiating Penny Drop';
      domesticPayment.AccountHolderName = this.employeeForm.value.accountHolderName;
      domesticPayment.Amount = 0;
      domesticPayment.IFSCCode = this.BankBranchId;
      domesticPayment.AccountNumber = this.employeeForm.value.accountNumber;
      domesticPayment.ExternalRefId = '';
      domesticPayment.BankRefId = '';
      domesticPayment.InternalRefId = this.internalRefId;
      domesticPayment.PayoutStatus = 7500;
      domesticPayment.payoutlogs = [];
      domesticPayment.CandidateId = 0;
      domesticPayment.EmployeeId = this.employeedetails.Id;
      domesticPayment.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;

      console.log('test', domesticPayment);

      this.payrollService.initiatePennyDropPayment(domesticPayment)
        .subscribe((resObject) => {
          console.log('INIT PENNY DROP AMOUNT ::', resObject);

          let apiR: apiResult = resObject;
          // apiR.Status = true;
          // apiR.Result = {
          //   "InternalRefId": "IntegrumPennyDropTest2",
          //   "BankRefId": "TIMPSIntegrumPennyDropTest2",
          //   "ExternalRefId": "f394b26c29a511eca9e40a0047330000",
          //   "AccountNumber": "000901523569",
          //   "IFSCCode": "ICIC0000009",
          //   "Amount": 1.0,
          //   "AccountHolderName": "Kiran",
          //   "CreditorReferenceInformation": "Penny Drop Payment testing",
          //   "PayoutStatus": 7800,
          //   "EmailId": "test@gmail.com",
          //   "MobileNumber": "9840419175",
          //   "AcknowledgmentDetail": "",
          //   "IsPaymentDone": true,
          //   "CompanyBankAccountId": 5,
          //   "SchemeName": "string",
          //   "Identification": "string",
          //   "NameAsPerBank": null,
          //   "Status": "string",
          //   "ErrorMessage": null,
          //   "payoutlogs": [
          //     {
          //       "Id": 354883,
          //       "PayoutRequestIds": null,
          //       "PaytransactionIds": null,
          //       "ObjectStorageId": 0,
          //       "NoOfRecords": 1,
          //       "LastUpdatedBy": null,
          //       "LastUpdatedOn": "0001-01-01T00:00:00",
          //       "SourceData": "{\"Data\":{\"ConsentId\":\"11861849\",\"Initiation\":{\"InstructionIdentification\":\"TIMPSIntegrumPennyDropTest2\",\"EndToEndIdentification\":\"\",\"InstructedAmount\":{\"Amount\":\"1\",\"Currency\":\"INR\"},\"DebtorAccount\":{\"Identification\":\"065363300001791\",\"SecondaryIdentification\":\"11861849\"},\"CreditorAccount\":{\"SchemeName\":\"ICIC0000009\",\"Identification\":\"000901523569\",\"Name\":\"Kiran\",\"Unstructured\":{\"ContactInformation\":{\"EmailAddress\":\"test@gmail.com\",\"MobileNumber\":\"9840419175\"}}},\"RemittanceInformation\":{\"Reference\":\"Penny Drop Payment testing\",\"Unstructured\":{\"CreditorReferenceInformation\":\"Penny Drop Payment testing\"}},\"ClearingSystemIdentification\":\"IMPS\"}},\"Risk\":{\"DeliveryAddress\":{\"AddressLine\":[\"Flat 7\",\"Acacia Lodge\"],\"StreetName\":\"Acacia Avenue\",\"BuildingNumber\":\"27\",\"PostCode\":\"600524\",\"TownName\":\"MUM\",\"CountySubDivision\":[\"MH\"],\"Country\":\"IN\"}}}",
          //       "LogData": "{\"Data\":{\"ConsentId\":\"11861849\",\"TransactionIdentification\":\"f394b26c29a511eca9e40a0047330000\",\"Status\":\"Received\",\"CreationDateTime\":\"2021-10-10T14:12:07.243+05:30\",\"StatusUpdateDateTime\":\"2021-10-10T14:12:07.243+05:30\",\"Initiation\":{\"InstructionIdentification\":\"TIMPSIntegrumPennyDropTest2\",\"EndToEndIdentification\":\"\",\"InstructedAmount\":{\"Amount\":\"1\",\"Currency\":\"INR\"},\"DebtorAccount\":{\"Identification\":\"065363300001791\",\"SecondaryIdentification\":\"11861849\"},\"CreditorAccount\":{\"SchemeName\":\"ICIC0000009\",\"Identification\":\"000901523569\",\"Name\":\"Kiran\",\"Unstructured\":{\"ContactInformation\":{\"EmailAddress\":\"test@gmail.com\",\"MobileNumber\":\"9840419175\"}}},\"RemittanceInformation\":{\"Reference\":\"Penny Drop Payment testing\",\"Unstructured\":{\"CreditorReferenceInformation\":\"Penny Drop Payment testing\"}},\"ClearingSystemIdentification\":\"IMPS\"}},\"Risk\":{\"DeliveryAddress\":{\"AddressLine\":[\"Flat 7\",\"Acacia Lodge\"],\"StreetName\":\"Acacia Avenue\",\"BuildingNumber\":\"27\",\"PostCode\":\"600524\",\"TownName\":\"MUM\",\"CountySubDivision\":[\"MH\"],\"Country\":\"IN\"}},\"Links\":{\"Self\":\"https:\/\/esbtrans.yesbank.com:7085\/api-banking\/v2.0\/domestic-payments\/payment-details\"}}",
          //       "IsSuccess": true,
          //       "PayTransactionId": 0,
          //       "PayoutInformationDetailsId": 0,
          //       "APIType": 1,
          //       "APIName": "OutBound | Penny Drop | Domestic Payment",
          //       "InternalRefId": "TIMPSIntegrumPennyDropTest2",
          //       "ExternalRefId": "f394b26c29a511eca9e40a0047330000",
          //       "ResponseStatus": "Received",
          //       "CreationDateTime": "2021-10-10T14:12:07.243+05:30",
          //       "StatusUpdateDateTime": "2021-10-10T14:12:07.243+05:30",
          //       "ErrorMessage": null,
          //       "UserMessage": null
          //     }
          //   ]
          // } as any;
          // apiR.Message = "Requested data has been submitted for penny drop integration";

          if (!apiR.Status && apiR.Result != null) {
            let _obj = apiR.Result as any
            if (_obj.IsPaymentDone || _obj.PayoutStatus == 10000) {
              this.disableSelect = false;
              this.employeeForm.controls['bankName'].enable();
              this.employeeForm.controls['IFSCCode'].enable();
              this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
              this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = _obj;
              this.IsYBStatus = true;
              this.isSuccessInitiateProcess = true;
              this.NameAsPerBank = _obj.NameAsPerBank;

              var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
              var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
              rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
              rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

              var percentageOfSimilarity = 0;
              var percentageOfSimilaritybyCandidateName = 0;

              // if the employee bank account holder name is not exists then take the name from candi infor accod

              var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
              rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");

              percentageOfSimilaritybyCandidateName = this.similarity(rplStr_NameAsPerBank2, rplStr_accountholdername)

              percentageOfSimilarity = this.similarity(rplStr_NameAsPerBank, rplStr_accountholdername)


              console.log('percentageOfSimilarity :', percentageOfSimilarity);

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
                this.FailedInitiateProcessMessage = "The employee's name and account holder's name are mismatched." // apiR.Message;
                return;
              }


              if (!environment.environment.IsSimilartyCheckRequired && this.IsPennyDropCheckRequired == true && rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched;"; // apiR.Message;
                return;
              }
              else if (!environment.environment.IsSimilartyCheckRequired) {
                this.pennydropLoading = false;

                var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
                rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                // if(this.mismatch  == true)
                {
                  this.confirmationPennydrop();
                  return;
                }
                // this.IsPennyDropCheckRequired = false;
                this.updateBankGridTable();
                // this.alertService.showSuccess("Great! Bank details has been added.");

              }


            }
          }

          if (apiR.Status && apiR.Result != null) {

            this.textSpin = "Initialiation Done";
            this.status = "finish";
            this.loadingicon = "check";
            this.desciption = "Initiation phase carried out"


            this.textSpin1 = "In Progress";
            this.status1 = "process";
            this.loadingicon1 = "loading";
            this.desciption1 = "Accessing the Bank Server."


            this.textSpin2 = "Waiting";
            this.status2 = "wait";
            this.loadingicon2 = "question";
            this.desciption2 = "Waiting for bank response"


            var res = apiR.Result as any;
            this.payoutLogId = res.payoutlogs != null && res.payoutlogs.length > 0 ? res.payoutlogs[0].Id : 0;
            this.employeeForm.controls['PayoutLogId'].setValue(this.payoutLogId);
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
            this.employeeForm.controls['bankName'].enable();
            this.employeeForm.controls['IFSCCode'].enable();
            this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
            this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

            if (this.count1 > 2) {
              this.IsMultipleAttempts = true;
              this.IsPennyDropCheckRequired = false;
              this.essService.updateValidation(true, this.employeeForm.get('DocumentId'));
              this.essService.updateValidation(true, this.employeeForm.get('proofType'));
            }

            this.textSpin = "Failed";
            this.status = "error";
            this.desciption = "Initiation failed"

            // this.loadingicon = "warning";

            this.textSpin1 = "Waiting";
            this.status1 = "wait";
            this.loadingicon1 = "question";

            this.textSpin2 = "Waiting";
            this.status2 = "wait";
            this.loadingicon2 = "question";

            this.pennydropLoading = false;
            this.isFailedInitiateProcess = true;
            this.FailedInitiateProcessMessage = apiR.Message;
            this.IsInitiatingPennyDropDone = false;
            this.IsYBStatus = false;
            this.initiatingObject = null;
            // this.alertService.showWarning(apiR.Message);
            return;

          }
          // res(true);

        })
    });
    return promise;
  }

  GetYBPennyDropStatus(domesticPayment) {
    this.employeeForm.controls['bankName'].disable();
    this.employeeForm.controls['IFSCCode'].disable();
    // this.bankForm.controls['accountNumber'].disable();
    // this.bankForm.controls['accountHolderName'].disable();
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

      this.payrollService.GetYBPennyDropStatus(domesticPayment)
        .subscribe((resObject) => {
          console.log('STATUS PENNY DROP AMOUNT ::', resObject);

          let apiR: apiResult = resObject;
          // apiR.Status = true;
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
            if (jObject.IsPaymentDone == false || jObject.PayoutStatus == 7849) {

              if (this.count > 2) {
                this.IsMultipleAttempts = true;
                this.IsPennyDropCheckRequired = false;
                this.essService.updateValidation(true, this.employeeForm.get('DocumentId'));
                this.essService.updateValidation(true, this.employeeForm.get('proofType'));
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
              this.employeeForm.controls['bankName'].enable();
              this.employeeForm.controls['IFSCCode'].enable();
              this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
              this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

              this.IsInitiatingPennyDropDone = true;
              this.initiatingObject = jObject;
              this.IsYBStatus = true;
              this.isSuccessInitiateProcess = true;
              this.NameAsPerBank = jObject.NameAsPerBank;
              var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
              var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
              rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
              rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

              var percentageOfSimilarity = 0;
              var percentageOfSimilaritybyCandidateName = 0;

              // if the employee bank account holder name is not exists then take the name from candi infor accod
              var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
              rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");

              percentageOfSimilaritybyCandidateName = this.similarity(rplStr_NameAsPerBank2, rplStr_accountholdername)

              percentageOfSimilarity = this.similarity(rplStr_NameAsPerBank, rplStr_accountholdername)


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
                this.FailedInitiateProcessMessage = "The employee's name and account holder's name are mismatched." // apiR.Message;
                return;
              }


              if (!environment.environment.IsSimilartyCheckRequired && rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
                this.pennydropLoading = false;
                this.isFailedInitiateProcess = true;
                this.mismatch = true;
                this.IsNameMisMatched = true;
                this.FailedInitiateProcessMessage = "Account Holder Name is mismatched"// apiR.Message;
                return;
              }
              else if (!environment.environment.IsSimilartyCheckRequired) {
                this.pennydropLoading = false;
                var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
                rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                if (rplStr_NameAsPerBank2 != rplStr_accountholdername2)
                // if(this.mismatch  == true)
                {
                  this.confirmationPennydrop();
                  return;
                }
                // this.IsPennyDropCheckRequired = false;
                this.updateBankGridTable();
                // this.alertService.showSuccess("Great! Bank details has been added.");

              }

            }



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

                this.disableSelect = false;
                this.employeeForm.controls['bankName'].enable();
                this.employeeForm.controls['IFSCCode'].enable();
                this.employeeForm.value.bankName = this.employeeForm.get('bankName').value;
                this.employeeForm.value.IFSCCode = this.employeeForm.get('IFSCCode').value;

                var rplStr_NameAsPerBank = this.NameAsPerBank.toUpperCase();
                var rplStr_accountholdername = this.employeeForm.value.accountHolderName.toUpperCase();
                rplStr_NameAsPerBank = rplStr_NameAsPerBank.replace(/\s/g, "");
                rplStr_accountholdername = rplStr_accountholdername.replace(/\s/g, "");

                var percentageOfSimilarity = 0;
                var percentageOfSimilaritybyCandidateName = 0;

                // if the employee bank account holder name is not exists then take the name from candi infor accod

                var rplStr_NameAsPerBank2 = this.employeedetails.FirstName.toUpperCase().toString();
                rplStr_NameAsPerBank2 = rplStr_NameAsPerBank2.replace(/\s/g, "");

                percentageOfSimilaritybyCandidateName = this.similarity(rplStr_NameAsPerBank2, rplStr_accountholdername)

                percentageOfSimilarity = this.similarity(rplStr_NameAsPerBank, rplStr_accountholdername)

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
                  this.FailedInitiateProcessMessage = "The employee's name and account holder's name are mismatched." // apiR.Message;
                  return;
                }


                if (!environment.environment.IsSimilartyCheckRequired && rplStr_NameAsPerBank != '' && rplStr_NameAsPerBank.toUpperCase() != rplStr_accountholdername.toUpperCase()) {
                  this.pennydropLoading = false;
                  this.isFailedInitiateProcess = true;
                  this.IsNameMisMatched = true;
                  this.FailedInitiateProcessMessage = apiR.Message;
                  return;

                }
                else if (!environment.environment.IsSimilartyCheckRequired) {
                  this.pennydropLoading = false;
                  this.bank_slidervisible = false;
                  var rplStr_accountholdername2 = this.employeeForm.value.accountHolderName.toUpperCase().toString();
                  rplStr_accountholdername2 = rplStr_accountholdername2.replace(/\s/g, "");

                  if (rplStr_NameAsPerBank2 != rplStr_accountholdername2) {
                    this.confirmationPennydrop();
                    return;
                  }
                  this.updateBankGridTable();
                }


              }, 500);



            }, 10000);

          }
          //  else {
          //   if (this.count > 2) {
          //     this.IsMultipleAttempts = true;
          //     this.IsPennyDropCheckRequired = false;
          //     this.updateValidation(true, this.employeeForm.get('DocumentId'));
          //     this.updateValidation(true, this.employeeForm.get('proofType'));
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


          //   this.pennydropLoading = false;
          //   this.isFailedInitiateProcess = true;
          //   this.FailedInitiateProcessMessage = apiR.Message;
          //   return;

          // }
          res(true);

        })

    });
    return promise;
  }

  close_BankSlider() {
    if (this.pennydropLoading == false) {
      this.isESSLogin && this.employeeForm.disable();
      this.isLoading = true;
      this.bank_slidervisible = false;
    }

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
      title: `The account holder name entered by user, does not match with Employee name. Do you want to Continue. `,
      html: "<div class='b'></div><div class='b'><label style='color: #464646 !important;display: block !important;font-size: 13px !important;font-weight: 500;float: left;margin-top: 12px;'>Enter a Reason </label></div><textarea class='form-control' rows='2' placeholder='Type your message here...' style='margin-bottom:5px !important' spellcheck='false'id='swal-textarea'></textarea>",
      confirmButtonText: 'Confirm',
      cancelButtonText: 'Cancel',
      allowEscapeKey: false,
      showCancelButton: true,
      preConfirm: () => {
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
        this.employeeForm.value.Remarks = inputElement1.value;
        this.employeeForm.controls['Remarks'].setValue(inputElement1.value);
        this.updateBankGridTable();
        return;
      } else if (
        result.dismiss === Swal.DismissReason.cancel
      ) {
      }
    });


  }
  updateBankGridTable() {

    var candidateDets = new CandidateDocuments();
    candidateDets.Id = 0;
    candidateDets.EmployeeId = 0; // ; this.Id;
    candidateDets.IsSelfDocument = true;
    candidateDets.DocumentId = this.DocumentId == null ? 0 : this.DocumentId;
    candidateDets.DocumentCategoryId = 0;
    candidateDets.DocumentTypeId = this.employeeForm.get('proofType').value,
      candidateDets.DocumentNumber = "0";
    candidateDets.FileName = this.FileName;
    candidateDets.ValidFrom = null;
    candidateDets.ValidTill = null;
    candidateDets.Status = this.IsPennyDropCheckRequired == true ? ApprovalStatus.Approved : ApprovalStatus.Pending;
    candidateDets.IsOtherDocument = true;
    candidateDets.Modetype = UIMode.Edit;
    candidateDets.DocumentCategoryName = "";
    candidateDets.StorageDetails = null;
    candidateDets.DocumentVerificationMode = DocumentVerificationMode.QcVerification;

    const newbankItem = {
      Id: this.employeeForm.get('bankdetailsId').value == null ? UUID.UUID() : this.employeeForm.get('bankdetailsId').value,
      id: 0,
      bankName: this.employeeForm.get('bankName').value,
      accountNumber: this.employeeForm.get('accountNumber').value,
      IFSCCode: this.employeeForm.get('IFSCCode').value,
      allocation: this.employeeForm.get('allocation').value,
      accountHolderName: this.employeeForm.get('accountHolderName').value,
      bankBranchId: this.BankBranchId,
      status: 0,
      IsDefault: false, // this.employeeForm.get('status').value == true ? true : false, // this.employeeForm.get('status').value,
      IsDefaultText: 'No', // this.employeeForm.get('status').value == true ? 'Yes' : 'No',
      proofType: this.employeeForm.get('proofType').value,
      CandidateDocument: this.IsPennyDropCheckRequired == true ? null : candidateDets,
      DocumentStatus: this.IsPennyDropCheckRequired == true ? "Approved" : 'Pending',
      StatusName: this.IsPennyDropCheckRequired == true ? "Approved" : 'Pending',
      isDocumentStatus: this.IsPennyDropCheckRequired == true ? ApprovalStatus.Approved : ApprovalStatus.Pending,
      Modetype: UIMode.Edit,
      bankFullName: this.BankList.find(a => a.Id == this.employeeForm.get('bankName').value).Name,
      VerificationMode: this.IsPennyDropCheckRequired == true ? VerificationMode.PennyDrop : VerificationMode.QcVerification,
      VerificationAttempts: this.count1, // this.employeeForm.get('VerificationAttempts').value == null ? this.cou,
      PayoutLogId: this.employeeForm.get('PayoutLogId').value,
      Remarks: this.employeeForm.get('Remarks').value
    }
    console.log('newbankItem', newbankItem);

    if (newbankItem != null) {
      newbankItem.id = newbankItem.Id;
    }

    let isAlreadyExists = false;
    isAlreadyExists = _.find(this.LstBank, (a) => a.Id != this.employeeForm.get('bankdetailsId').value && a.accountNumber == this.employeeForm.get('accountNumber').value && a.IFSCCode == this.employeeForm.get('IFSCCode').value) != null ? true : false;
    if (this.LstBank.length >= 1 && this.LstBank.filter(z => z.status == ApprovalStatus.Pending).length > 1) {
      this.alertService.showWarning("You are only allowed to enter one item");
      return;

    } else {
      if (isAlreadyExists) {
        this.alertService.showWarning("The specified Bank detail already exists");
        return;
      }
      else {
        let isSameResult = false;
        isSameResult = _.find(this.LstBank, (a) => a.Id == newbankItem.Id) != null ? true : false;
        if (isSameResult) {
          if (newbankItem.VerificationMode == VerificationMode.PennyDrop) {
            newbankItem.IsDefault = true;
            newbankItem.IsDefaultText = 'Yes';
          }
          // var updateItemById = _.find(this.LstBank, (a) => a.Id == newbankItem.Id);
          // updateItemById = newbankItem;

          var foundIndex = this.LstBank.findIndex(x => x.Id == newbankItem.id);
          this.LstBank[foundIndex] = newbankItem;

          // this.angularGrid_Bank.gridService.updateDataGridItemById(newbankItem.Id, newbankItem, true, true);

        } else {
          if (newbankItem.VerificationMode == VerificationMode.PennyDrop) {
            this.LstBank.forEach(element => {
              element.IsDefault = false;
              element.IsDefaultText = 'No';
            });
          }
          this.LstBank = this.LstBank.concat(newbankItem) as any;
          // this.angularGrid_Bank.gridService.addItemToDatagrid(newbankItem);
        }

      }
    }
    this.alertService.showSuccess("Great! Bank details has been added.");

    this.isDuplicateBankInfo = false;
    this.employeeForm.controls['bankdetailsId'].reset();
    this.employeeForm.controls['bankName'].reset();
    this.employeeForm.controls['accountNumber'].reset();
    this.employeeForm.controls['confirmAccountNumber'].reset();
    this.employeeForm.controls['IFSCCode'].reset();
    this.employeeForm.controls['accountHolderName'].reset();
    this.employeeForm.controls['proofType'].reset();
    this.employeeForm.controls['bankBranchId'].reset();
    this.employeeForm.controls['DocumentId'].reset();
    this.employeeForm.controls['FileName'].reset();
    this.employeeForm.controls['IsDocumentDelete'].reset();
    this.employeeForm.controls['VerificationMode'].reset();
    this.employeeForm.controls['VerificationAttempts'].reset();
    this.employeeForm.controls['PayoutLogId'].reset();
    this.employeeForm.controls['Remarks'].reset();
    this.bank_slidervisible = false;

  }




  // onFileUpload(e) {
  //   // unknown fact i have commented this condition
  //   // if (this.DocumentTypeList == null || this.DocumentTypeList.length == 0) {
  //   //   this.alertService.showWarning("An error occurred during the attempt to upload the profile avatar!.  Please get in touch with administrative support.")
  //   //   return;
  //   // }
  //   // else 
  //   // if (this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar') == undefined || this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar') == null) {
  //   //   this.alertService.showWarning("An error occurred during the attempt to upload the profile avatar!.  Please get in touch with administrative support.")
  //   //   return;
  //   // }
  //   this.loadingScreenService.startLoading();
  //   //this.Customloadingspinner.show();
  //   this.isLoading = false;
  //   if (e.target.files && e.target.files[0]) {

  //     const file = e.target.files[0];
  //     const pattern = /image-*/;
  //     var type = e.target.files[0].type;
  //     var size = e.target.files[0].size;
  //     var maxSize = (Math.round(size / 1024) + " KB");
  //     var FileSize = e.target.files[0].size / 1024 / 1024;
  //     if (FileSize > 2) {
  //       this.isLoading = true;
  //       this.alertService.showWarning('The attachment size exceeds the allowable limit.');
  //       this.loadingScreenService.stopLoading();
  //       //this.Customloadingspinner.hide();
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
  //       this.doAsyncUpload(FileUrl, this.FileName, 'Bank')

  //     };

  //   }

  // }

  // doAsyncUpload(filebytes, filename, whichSection) {
  //   try {
  //     this.loadingScreenService.stopLoading();
  //     //this.Customloadingspinner.show();
  //     let objStorage = new ObjectStorageDetails();
  //     objStorage.Id = 0;

  //     objStorage.EmployeeId = this.employeedetails.Id;
  //     objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
  //     objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
  //     objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

  //     objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
  //     objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
  //     objStorage.CompanyId = this.employeedetails.EmploymentContracts[0].CompanyId;
  //     objStorage.Status = true;
  //     objStorage.Content = filebytes;
  //     objStorage.SizeInKB = 12;
  //     objStorage.ObjectName = filename;
  //     objStorage.OriginalObjectName = filename;
  //     objStorage.Type = 0;
  //     objStorage.ObjectCategoryName = "EmpTransactions";

  //     this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
  //       let apiResult: apiResult = (res);
  //       try {
  //         if (apiResult.Status && apiResult.Result != "") {
  //           if (whichSection == 'Bank') {
  //             this.employeeForm.controls['DocumentId'].setValue(apiResult.Result);
  //             this.employeeForm.controls['FileName'].setValue(this.FileName);
  //             this.DocumentId = apiResult.Result;
  //             this.unsavedDocumentLst.push({
  //               Id: apiResult.Result
  //             })
  //           }
  //           this.loadingScreenService.stopLoading();
  //           // this.Customloadingspinner.hide();
  //           this.alertService.showSuccess("Awesome..., You have successfully uploaded this file")
  //           this.isLoading = true;

  //         }
  //         else {
  //           this.loadingScreenService.stopLoading();
  //           //this.Customloadingspinner.hide();
  //           this.FileName = null;
  //           this.isLoading = true;
  //           this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message)
  //         }
  //       } catch (error) {
  //         this.loadingScreenService.stopLoading();
  //         // this.Customloadingspinner.hide();
  //         this.FileName = null;
  //         this.isLoading = true;
  //         this.alertService.showWarning("An error occurred while trying to upload! " + error)
  //       }

  //     }), ((err) => {

  //     })

  //   } catch (error) {
  //     this.loadingScreenService.stopLoading();
  //     // this.Customloadingspinner.hide();
  //     this.FileName = null;
  //     this.alertService.showWarning("An error occurred while trying to upload! " + error)
  //     this.isLoading = true;
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

  //     if (result.value) {
  //       if (this.essService.isGuid(this.popupId)) {

  //         this.deleteAsync();
  //       }
  //       else if (this.firstTimeDocumentId != this.DocumentId) {

  //         this.deleteAsync();

  //       }

  //       else {
  //         this.FileName = null;
  //         this.employeeForm.controls['IsDocumentDelete'].setValue(true);
  //         this.employeeForm.controls['FileName'].setValue(null);

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
  //     let apiResult: apiResult = (res);
  //     try {
  //       if (apiResult.Status) {

  //         //search for the index.
  //         var index = this.unsavedDocumentLst.map(function (el) {
  //           return el.Id
  //         }).indexOf(this.DocumentId)

  //         // Delete  the item by index.
  //         this.unsavedDocumentLst.splice(index, 1)
  //         this.employeeForm.controls['DocumentId'].setValue(null);
  //         this.employeeForm.controls['FileName'].setValue(null);
  //         this.FileName = null;
  //         this.DocumentId = null;
  //         this.employeeForm.controls['IsDocumentDelete'].setValue(false);
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
    let proofType = this.employeeForm.get('proofType').value;
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

        this.FileName = ` ${this.employeedetails.FirstName == null ? '' : this.employeedetails.FirstName.replace(/\s/g, "")}_bankDocs${new Date().getTime().toString()}.zip`;  //files[0].name;

        if (files && files[0]) {
          for (let i = 0; i < files.length; i++) {
            let b: any = new Blob([files[i]], { type: '' + files[i].type + '' });
            zip.file(files[i].name, b, { base64: true });
          }

          zip.generateAsync({
            type: "base64",
          }).then((_content) => {
            if (_content && this.FileName) {
              if (this.DocumentId) {
                if (this.essService.isGuid(this.popupId)) {

                  this.deleteAsync();
                }
                // else if (this.DocumentId) {

                //   this.deleteAsync();

                // }

                // else {

                //   this.FileName = null;
                //   this.employeeForm.controls['IsDocumentDelete'].setValue(true);
                //   this.employeeForm.controls['FileName'].setValue(null);
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
        this.updateBankGridTable();
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
        this.FileName = null;
        this.employeeForm.controls['DocumentId'].setValue(null);
        this.employeeForm.controls['IsDocumentDelete'].setValue(true);
        this.employeeForm.controls['FileName'].setValue(null);

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
          this.employeeForm.controls['DocumentId'].setValue(null);
          this.employeeForm.controls['FileName'].setValue(null);
          // this.FileName = null;
          // this.DocumentId = null;
          this.employeeForm.controls['IsDocumentDelete'].setValue(false);
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

      objStorage.EmployeeId = this.employeedetails.Id;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.employeedetails.EmploymentContracts[0].CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "EmpTransactions";



      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {



        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.employeeForm.controls['DocumentId'].setValue(apiResult.Result);
            this.employeeForm.controls['FileName'].setValue(this.FileName);
            this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file");
            this.isFileChange = false;
            this.updateBankGridTable();

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

  bank_file_view(item) {
    if (item.CandidateDocument == null) {
      this.alertService.showInfo('Note: Preview of document not available.');
      return;
    }

    var fileNameSplitsArray = item.CandidateDocument.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      this.GetBankZipFile(item.CandidateDocument)
    } else {
      this.viewDocs(item.CandidateDocument, 'Bank');

    }


  }


  bank_file_edit(item) {
    // if (this.isESSLogin && !this.isLoading) { this.alertService.showWarning("Do you want to keep editing, please activate edit mode on your screen?"); return; }
    if (item.StatusName == 'Approved' && this.BusinessType != 3 && this.IsEditAllowedforApprovedBanks == true && !this.isDuplicateBankInfo) {
      this.addBank(item);
      this.employeeForm.enable(), this.isLoading = true;
      // this.employeeForm.controls['allocation'].disable();
      return;
    }


    if (item.StatusName == 'Approved' && !this.isDuplicateBankInfo) {
      this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
      return;
    }

    if (item.StatusName == 'Approved' && this.isDuplicateBankInfo && this.essService.isGuid(item.Id) == false) {
      this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
      return;
    }

    if (this.isDuplicateBankInfo && this.essService.isGuid(item.Id) == true) {
      this.addBank(item);
      this.employeeForm.enable(), this.isLoading = true;

    }


    this.addBank(item);
    this.employeeForm.enable(), this.isLoading = true;
  }


  bank_file_delete(item, index) {

    // if (this.isESSLogin && !this.isLoading) { this.alertService.showWarning("Do you want to keep editing, please activate edit mode on your screen?"); return; }
    if (item.StatusName == 'Approved' && this.BusinessType == 3) {
      this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
      return;
    }
    let bankItem = {}
    bankItem = this.LstBankCopy[index]

    if (this.BusinessType != 3 && bankItem != null && bankItem != undefined && bankItem['StatusName'] == 'Approved') {
      console.log("bankitem,bankItem", bankItem)
      this.alertService.showInfo('Please note: The operation has been blocked.  For additional information, please consult our Knowledge Base.');
      return;
    }

    this.alertService.confirmSwal("Are you sure you would like to remove that Record?", "After deleting this item, you will not be in a position to get this!", "Yes, Delete").then(result => {

      if (this.essService.isGuid(item.Id) == false) {
        var candidateBankDetails = new EmployeeBankDetails();
        candidateBankDetails.BankId = item.bankName;
        candidateBankDetails.BankBranchId = item.IFSCCode;
        candidateBankDetails.AccountNumber = item.accountNumber;
        candidateBankDetails.AccountHolderName = item.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
        candidateBankDetails.IdentifierValue = item.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = item.allocation;
        candidateBankDetails.IsDefault = true;
        candidateBankDetails.Status = ApprovalStatus.Pending;
        // this.candidateBankDetails.Modetype =  UIMode.Edit;;
        candidateBankDetails.Modetype = UIMode.Delete,
          candidateBankDetails.Id = item.Id,
          candidateBankDetails.CandidateDocument = item.CandidateDocument
        this.deletedBanks.push(candidateBankDetails)
      }
      const index: number = this.LstBank.indexOf(item);
      if (index !== -1) {
        this.LstBank.splice(index, 1);
      }

    }).catch(error => {

    });
  }


  viewDocs(item, whichdocs) {
    $("#popup_viewDocs1").modal('show');
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.DocumentId;

    var contentType = this.fileuploadService.getContentType(item.FileName);
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileuploadService.getObjectById(item.DocumentId)
        .subscribe(dataRes => {

          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
          }
          let file = null;
          var objDtls = dataRes.Result;
          const byteArray = atob(objDtls.Content);
          const blob = new Blob([byteArray], { type: contentType });
          file = new File([blob], objDtls.ObjectName, {
            type: contentType,
            lastModified: Date.now()
          });
          if (file !== null) {
            var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
            this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);

          }
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }
  }

  modal_dismiss_docs() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs1").modal('hide');
  }




  // ESS SAVE AND SUBMIT  AND GET


  GetEmployeeRequiredBankDetails() {
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.BankAccounts).subscribe((result) => {
          console.log('re', result);
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let bankObject: EmployeeDetails = apiR.Result as any;
            this.employeedetails = bankObject;
            this.employeeOldDetials = { ...apiR.Result as any }
            this.employeeModel.oldobj = this.employeeOldDetials;
            if (this.RoleCode == 'Employee') {
              this.getEmployeeConfiguration(this.employeedetails.EmploymentContracts[0].ClientContractId);
            }
            resolve(true);
          } else {
            resolve(false);
            this.alertService.showWarning(`An error occurred while getting employee details`);
            return;
          }

        }, err => {
          resolve(false);
        })
    })
    return promise;
  }
  Common_GetEmployeeAccordionDetails(accordionName) {
    const promise = new Promise((resolve, reject) => {
      this.spinner = true;
      this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, accordionName).then((Result) => {
        try {
          this.BankInfoListGrp = Result as any;
          console.log('BankInfoListGrp', this.BankInfoListGrp);
          this.spinner = false;
          resolve(true);
          return true;

        } catch (error) {
          resolve(false);
          console.log(`EX GET ${accordionName} ACCORDION INFO :`, error);
        }

      });
    })
    return promise;
  }


  doSaveOrSubmit(isSubmit) {

    try {
      this.loadingScreenService.startLoading();
      // this.Customloadingspinner.show();
      //bankdetails
      this.lstBankDetails = [];
      this.LstBank.forEach(element => {
        element.CandidateDocument != null && element.CandidateDocument.DocumentId == null ? element.CandidateDocument.DocumentId = 0 : true;
        var candidateBankDetails = new EmployeeBankDetails();
        candidateBankDetails.BankId = element.bankName;
        candidateBankDetails.BankBranchId = element.IFSCCode;
        candidateBankDetails.AccountNumber = element.accountNumber;
        candidateBankDetails.AccountHolderName = element.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
        candidateBankDetails.IdentifierValue = element.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = element.allocation;
        candidateBankDetails.IsDefault = element.status != 1 && element.CandidateDocument != null && element.CandidateDocument.Status == 0 ? false : element.IsDefault;
        candidateBankDetails.Status = element.status;
        // this.candidateBankDetails.Modetype =  UIMode.Edit;;
        // candidateBankDetails.Modetype = element.Modetype,
        candidateBankDetails.Modetype = UIMode.Edit;  // element.Modetype,
        candidateBankDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          candidateBankDetails.CandidateDocument = element.CandidateDocument,
          candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
          element.PayoutLogId = 0
        }
        candidateBankDetails.PayoutLogId = element.PayoutLogId
        candidateBankDetails.Remarks = element.Remarks

        this.lstBankDetails.push(candidateBankDetails)
      });
      console.log('lstBankDetails', this.lstBankDetails);
      this.deletedBanks.forEach(element => {
        var candidateBankDetails = new EmployeeBankDetails();
        candidateBankDetails.BankId = element.bankName;
        candidateBankDetails.BankBranchId = element.IFSCCode;
        candidateBankDetails.AccountNumber = element.accountNumber;
        candidateBankDetails.AccountHolderName = element.accountHolderName;
        candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
        candidateBankDetails.IdentifierValue = element.bankBranchId;
        candidateBankDetails.SalaryContributionPercentage = element.allocation;
        candidateBankDetails.IsDefault = true;
        candidateBankDetails.Status = element.status,
          // this.candidateBankDetails.Modetype =  UIMode.Edit;;
          candidateBankDetails.Modetype = element.Modetype,
          candidateBankDetails.Id = element.Id,
          candidateBankDetails.CandidateDocument = element.CandidateDocument,
          candidateBankDetails.VerificationMode = element.VerificationMode
        candidateBankDetails.VerificationAttempts = element.VerificationAttempts
        if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
          element.PayoutLogId = 0
        }
        candidateBankDetails.PayoutLogId = element.PayoutLogId
        this.lstBankDetails.push(candidateBankDetails)
      });

      // ONLY FOR POS AND SME - BANK WORKFLOW HAS BEEN SUSPENDED HERE
      if (this.isESSLogin == false && this.BusinessType != 3 && this.lstBankDetails.length > 0 && this.lstBankDetails.filter(a => a.Id == 0).length > 0) {
        this.lstBankDetails.forEach(e => {

          if (e.Status == 0) {
            e.IsDefault = true;
            e.Status = 1;
            e.Modetype = UIMode.Edit;
          }
          else {
            e.IsDefault = false;
            e.Status = 1;
            e.Modetype = UIMode.Edit;
          }
        });
      }
      this.employeedetails.lstEmployeeBankDetails = this.lstBankDetails;
      // if verification mode is penny drop the bank details default status value has been updated 

      if (this.isESSLogin == true && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
        this.employeedetails.lstEmployeeBankDetails.forEach(e => {
          if (e.Status == 0) {
            e.Modetype = UIMode.Edit;
          }
          if (e.VerificationMode == 2) {
            if (e.Status == 0) {

              e.IsDefault = true;
            } else {
              e.IsDefault = false;
            }
          }
        });
      }
      else if (this.isESSLogin == false && this.BusinessType == 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
        this.employeedetails.lstEmployeeBankDetails.forEach(e => {
          if (e.Status == 0) {
            e.Modetype = UIMode.Edit;
          }
          if (e.VerificationMode == 2) {
            if (e.Status == 0) {
              e.IsDefault = true;
            } else {
              e.IsDefault = false;
            }
          }
        });
      }

      if (this.BusinessType == 3 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
        this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.forEach(em => {
          if (em.VerificationMode == 2) {
            em.Status = 1
          }
        });
      }

      if (this.BusinessType != 3) {
        this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.forEach(em => {
          if (em.VerificationMode == 2) {
            em.Status = 1
          }
        });

      }
      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;


      // this.employeedetails.Modetype = UIMode.Edit; not requried this edit for my bank save 
      this.employeeModel.newobj = this.employeedetails;
      console.log(' BANK SAVE & SUBMIT ::', this.employeeModel);

      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.isDuplicateBankInfo = false;
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          if (data.Status == false && data.Message == "Account number already exists") {
            this.isDuplicateBankInfo = true;
          }
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            if (this.isESSLogin == true && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
              this.employeedetails.lstEmployeeBankDetails.forEach(e => {
                if (e.Status == 0) {
                  data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
                }

              });
            }
            else if (this.isESSLogin == false && this.BusinessType == 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
              this.employeedetails.lstEmployeeBankDetails.forEach(e => {
                if (e.Status == 0) {
                  data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
                }
              });
            }
            else if (this.isESSLogin == false && this.BusinessType != 3 && this.employeedetails.lstEmployeeBankDetails != null && this.employeedetails.lstEmployeeBankDetails.length > 0) {
              this.employeedetails.lstEmployeeBankDetails.forEach(e => {
                if (e.Status == 0) {
                  data.dynamicObject.newobj.lstEmployeeBankDetails.find(z => z.BankBranchId == e.BankBranchId && z.AccountHolderName == e.AccountHolderName && z.AccountNumber == e.AccountNumber).Modetype = UIMode.Edit;
                }
              });
            }
            if (this.isESSLogin == true && data.dynamicObject.newobj.lstEmployeeBankDetails != null && data.dynamicObject.newobj.lstEmployeeBankDetails.length > 0 && data.dynamicObject.newobj.lstEmployeeBankDetails.find(a => a.Status == 0 && a.ModuleProcessTransactionId == 0) != undefined) {
              this.triggerWorkFlowProcess(data.dynamicObject.newobj);
            }
            else if (this.isESSLogin == false && this.BusinessType == 3 && data.dynamicObject.newobj.lstEmployeeBankDetails != null && data.dynamicObject.newobj.lstEmployeeBankDetails.length > 0 && data.dynamicObject.newobj.lstEmployeeBankDetails.find(a => a.Status == 0 && a.ModuleProcessTransactionId == 0) != undefined) {
              this.triggerWorkFlowProcess(data.dynamicObject.newobj);

            }

            this.doRefresh();

          }
          else {
            this.alertService.showWarning(data.Message);
          }

        });
      }
    }
    catch (e) {
      console.log('e', e);

    }

  }


  triggerWorkFlowProcess(newObject: any) {
    if (newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit) != undefined) {

      let _editItem = newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit);
      if (_editItem.VerificationMode == 1) {
        this.callbankWorkflow(newObject);
      } else if (this.BusinessType == 3 && _editItem.VerificationMode == 2 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried) {
        this.callbankWorkflow(newObject);
      }
      else {

      }


    }
  }

  callbankWorkflow(newObject) {
    let entityId = newObject.lstEmployeeBankDetails.find(a => a.Modetype == UIMode.Edit).Id;
    var accessControl_submit = {
      AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
        : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
      ViewValue: null
    };
    var workFlowInitiation = new WorkFlowInitiation()
    workFlowInitiation.Remarks = "";
    workFlowInitiation.EntityId = entityId; // newObject.Id;
    workFlowInitiation.EntityType = EntityType.EmployeeBankDetails;
    workFlowInitiation.CompanyId = this.CompanyId;
    workFlowInitiation.ClientContractId = newObject.EmploymentContracts[0].ClientContractId;
    workFlowInitiation.ClientId = newObject.EmploymentContracts[0].ClientId;
    workFlowInitiation.ActionProcessingStatus = 25000; // BankDetailsRequestSubmitted
    workFlowInitiation.ImplementationCompanyId = this.ImplementationCompanyId;
    workFlowInitiation.WorkFlowAction = 20;
    workFlowInitiation.RoleId = this.RoleId;
    workFlowInitiation.DependentObject = (newObject);
    workFlowInitiation.UserInterfaceControlLst = accessControl_submit;

    this.employeeService.post_BankDetailsWorkFlow(JSON.stringify(workFlowInitiation)).subscribe((response) => {


      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {
          this.loadingScreenService.stopLoading();
          this.deletedBanks = []
          //this.Customloadingspinner.hide();
          this.alertService.showSuccess(`Your employee has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');

        } else {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          this.alertService.showWarning(`An error occurred while trying to submission!  ` + apiResult.Message != null ? apiResult.Message : '');

        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        // this.Customloadingspinner.hide();
        this.alertService.showWarning(`An error occurred while trying to submission}!` + error);

      }


    }), ((error) => {

    });

  }

  EmitHandler() {
    console.log('thislst', this.LstBank);
    console.log('this.lstBankDetails', this.lstBankDetails);
    this.lstBankDetails = [];
    this.LstBank.forEach(element => {
      console.log('el', element);

      var candidateBankDetails = new EmployeeBankDetails();
      candidateBankDetails.BankId = element.bankName;
      candidateBankDetails.BankBranchId = element.IFSCCode;
      candidateBankDetails.AccountNumber = element.accountNumber;
      candidateBankDetails.AccountHolderName = element.accountHolderName;
      candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
      candidateBankDetails.IdentifierValue = element.bankBranchId;
      candidateBankDetails.SalaryContributionPercentage = element.allocation;
      candidateBankDetails.IsDefault = element.IsDefault,//  element.CandidateDocument != null && element.CandidateDocument.Status == 0 ? false : element.IsDefault;
        candidateBankDetails.Status = element.status;
      candidateBankDetails['BankName'] = element.bankFullName;
      // this.candidateBankDetails.Modetype =  UIMode.Edit;;
      // candidateBankDetails.Modetype = element.Modetype,
      candidateBankDetails.Modetype = UIMode.Edit;  // element.Modetype,
      candidateBankDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
        candidateBankDetails.CandidateDocument = element.CandidateDocument,
        candidateBankDetails.VerificationMode = element.VerificationMode
      candidateBankDetails.VerificationAttempts = element.VerificationAttempts
      if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
        element.PayoutLogId = 0
      }
      candidateBankDetails.PayoutLogId = element.PayoutLogId
      candidateBankDetails.Remarks = element.Remarks;
      this.lstBankDetails.push(candidateBankDetails);

    });

    this.deletedBanks.forEach(element => {
      var candidateBankDetails = new EmployeeBankDetails();
      candidateBankDetails.BankId = element.bankName;
      candidateBankDetails.BankBranchId = element.IFSCCode;
      candidateBankDetails.AccountNumber = element.accountNumber;
      candidateBankDetails.AccountHolderName = element.accountHolderName;
      candidateBankDetails.BankBranchIdentifierType = BankBranchIdentifierType.IFSC;
      candidateBankDetails.IdentifierValue = element.bankBranchId;
      candidateBankDetails.SalaryContributionPercentage = element.allocation;
      candidateBankDetails.IsDefault = true;
      candidateBankDetails.Status = element.status,
        // this.candidateBankDetails.Modetype =  UIMode.Edit;;
        candidateBankDetails.Modetype = element.Modetype,
        candidateBankDetails.Id = element.Id,
        candidateBankDetails.CandidateDocument = element.CandidateDocument,
        candidateBankDetails.VerificationMode = element.VerificationMode
      candidateBankDetails.VerificationAttempts = element.VerificationAttempts
      if (element.PayoutLogId == null || element.PayoutLogId == '' || element.PayoutLogId == undefined) {
        element.PayoutLogId = 0
      }
      candidateBankDetails.PayoutLogId = element.PayoutLogId
      this.lstBankDetails.push(candidateBankDetails)
    });

    // // ONLY FOR POS AND SME - BANK WORKFLOW HAS BEEN SUSPENDED HERE
    // if (this.isESSLogin == false && this.BusinessType != 3 && this.lstBankDetails.length > 0 && this.lstBankDetails.filter(a => a.Id == 0).length > 0) {
    //   this.lstBankDetails.forEach(e => {

    //     if (e.Status == 0) {
    //       e.IsDefault = true;
    //       e.Status = 1;
    //       e.Modetype = UIMode.Edit;
    //     }
    //     else {
    //       e.IsDefault = false;
    //       e.Status = 1;
    //       e.Modetype = UIMode.Edit;
    //     }
    //   });
    // }

    // // if verification mode is penny drop the bank details default status value has been updated 

    // if (this.isESSLogin == true && this.employeedetails.lstEmployeeBankDetails.length > 0) {
    //   this.employeedetails.lstEmployeeBankDetails.forEach(e => {
    //     if (e.Status == 0) {
    //       e.Modetype = UIMode.Edit;
    //     }
    //     if (e.VerificationMode == 2) {
    //       if (e.Status == 0) {

    //         e.IsDefault = true;
    //       } else {
    //         e.IsDefault = false;
    //       }
    //     }
    //   });
    // }
    // else if (this.isESSLogin == false && this.BusinessType == 3 && this.employeedetails.lstEmployeeBankDetails.length > 0 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
    //   this.employeedetails.lstEmployeeBankDetails.forEach(e => {
    //     if (e.Status == 0) {
    //       e.Modetype = UIMode.Edit;
    //     }
    //     if (e.VerificationMode == 2) {
    //       if (e.Status == 0) {
    //         e.IsDefault = true;
    //       } else {
    //         e.IsDefault = false;
    //       }
    //     }
    //   });
    // }

    // if (this.BusinessType == 3 && environment.environment.IsStaffingOpsPennyDropQcCheckRequried == false) {
    //   this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.forEach(em => {
    //     if (em.VerificationMode == 2) {
    //       em.Status = 1
    //     }
    //   });
    // }

    // if (this.BusinessType != 3) {
    //   this.employeedetails.lstEmployeeBankDetails.length > 0 && this.employeedetails.lstEmployeeBankDetails.forEach(em => {
    //     if (em.VerificationMode == 2) {
    //       em.Status = 1
    //     }
    //   });

    // }
    // console.log('dfadsf ', this.lstBankDetails);

    this.employeedetails.lstEmployeeBankDetails = this.lstBankDetails;
  }

  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      this.employeedetails.lstEmployeeBankDetails = this.employeedetails.lstEmployeeBankDetails;
      this.bankChangeHandler.emit(this.employeedetails);
    }
  }


  ngOnDestroy() {

    this.subscribeEmitter();
  }

  GetCompanyRequiredSettings(companyid, clientid, ClientContractId, settingNames) {
    const promise = new Promise((res, rej) => {
      this.payrollService.GetCompanyRequiredSettings(companyid, clientid, ClientContractId, settingNames)
        .subscribe((result) => {
          let apiResult: apiResult = result;

          if (apiResult.Status && this.BusinessType != 3) {
            let companySettings = result.dynamicObject
            if (companySettings && companySettings.length > 0) {
              let approvedObj = companySettings.find(a => a.SettingName == "IsEditAllowedforApprovedBanks")
              if (approvedObj != null && approvedObj != undefined) {
                approvedObj.SettingValue == 1 ? this.IsEditAllowedforApprovedBanks = true : this.IsEditAllowedforApprovedBanks = false
              }
              let bankdocumentObj = companySettings.find(a => a.SettingName == "IsBankDocumentMandatory")
              if (bankdocumentObj != null && bankdocumentObj != undefined) {
                this.IsBankDocumentMandatory =  bankdocumentObj.SettingValue == 1 ? true : false;
              }
            }

            res(true);

          } else {
            res(true);
          }

        })
    })
    return promise;
  }

  //NEW Change
  GetBankZipFile(item: any) {


    this.loadingScreenService.startLoading();
    console.log('item', item);
    this.documentURLId = item.DocumentId;
    this.downLoadFileName = item.FileName;
    let DocId = item.DocumentId;
    this.docList = [];
    try {


      this.fileuploadService.getObjectById(DocId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
          }
          var objDtls = dataRes.Result;
          console.log(objDtls);
          var zip = new JSZip();
          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          this.zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);

                  console.log('this.docList 1', this.docList);
                  this.loadingScreenService.stopLoading();
                  $("#documentviewer").modal('show');

                });

              }
            });
          });


        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

  }

  close_documentviewer() {
    this.documentURLId = null;
    this.downLoadFileName = null;
    $("#documentviewer").modal('hide');

  }

  getTargetOffSetImage(item: any) {

    const promise = new Promise((res, rej) => {
      var contentType = this.fileuploadService.getContentType(item.name);
      var blob = new Blob([item._data.compressedContent]);
      var file = new File([blob], item.name, {
        type: typeof item,
        lastModified: Date.now()
      });
      var reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        var base64String = (reader.result as string).split(",")[1];
        if (file !== null) {
          var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
          this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(' DOCUMENT URL :', this.contentmodalurl);
          res({ ContentType: contentType, ImageURL: this.contentmodalurl })
        }
      }
    })


    return promise;
  }


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

  async getEmployeeConfiguration(clientContractId: number) {
    try {

      const data = await this.essService.GetEmployeeConfiguration(clientContractId, EntityType.Employee, this.employeedetails.Id == 0 ? 'Add' : 'Update').toPromise();
      console.log('CONFI', data);

      if (data.Status) {
        let AccessControlConfiguration = data.Result && data.Result.AccessControlConfiguration;
        console.log('Access Control Configuration :: ', AccessControlConfiguration);
        this.AccessibleButtons = JSON.parse(AccessControlConfiguration.AccessibleButtons);
        this.NotAccessibleFields = JSON.parse(AccessControlConfiguration.NotAccessibleFields);
        this.disableFormControls();
      }
      this.loadingScreenService.stopLoading();
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(error);
    }
  }

  disableFormControls() {
       for (const field of this.NotAccessibleFields) {
        if(field == "bankStatus"){
          if (this.employeeForm.get('status')) {
            this.employeeForm.get('status').disable();
          }
        }else{
          if (this.employeeForm.get(field)) {
            this.employeeForm.get(field).disable();
          }
        }      
    }
  }

  shouldShowActionButtons(btnName) {
    if (this.AccessibleButtons.includes(btnName)) {
      return true;
    } else {
      return false;
    }
  }

}
