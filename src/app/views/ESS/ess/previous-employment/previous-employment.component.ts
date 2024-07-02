import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { DomSanitizer, Title } from '@angular/platform-browser';
import * as moment from 'moment';
import * as _ from 'lodash';

import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { NgxSpinnerService } from "ngx-spinner";

import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { LoginResponses } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { AlertService, EmployeeService, HeaderService, SessionStorage, FileUploadService } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ESSService } from 'src/app/_services/service/ess.service';
import { Gender } from 'src/app/_services/model/Base/HRSuiteEnums';
import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ClientContractList, OnEmploymentInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { ClientLocationList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { ManagerList, LeaveGroupList, CostCodeList } from './../../../../_services/model/OnBoarding/MigrationInfo';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { OnboardingService } from '../../../../_services/service/onboarding.service';
import { apiResult } from '../../../../_services/model/apiResult';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { UUID } from 'angular2-uuid';
import { EmploymentDetails } from 'src/app/_services/model/Employee/EmploymentDetails';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { InvestmentInfo } from 'src/app/_services/model/Employee/EmployeeExcemptions';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import Swal from 'sweetalert2';
import { ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-previous-employment',
  templateUrl: './previous-employment.component.html',
  styleUrls: ['./previous-employment.component.css']
})
export class PreviousEmploymentComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() lstlookUpDetails: EmployeeLookUp;
  @Output() employmentChangeHandler = new EventEmitter();
  @Input() InvestmetnListGrp: InvestmentInfo;


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
  isEnbleBankBtn: boolean = true;
  clientLogoLink: any;
  clientminiLogoLink: any;
  employeeModel: EmployeeModel = new EmployeeModel();
  // PREVIOUS EMPLOYMENT

  LstemploymentDetails = [];
  previousemployment_slidervisible = false;
  FicalYearList = [];
  TaxDeclaration: any;
  EnddateminDate: Date;
  Addressdetails: any = [];
  MenuId: any;
  // ATTACHMENT
  FileName: any;
  DocumentId: any;
  spinnerText: string = "Uploading";
  isLoading: boolean = true;
  unsavedDocumentLst = [];
  popupId: any;
  firstTimeDocumentId: any;
  documentURL = null;
  documentURLId = null;
  FINID : any;
  isInvestmentUnderQC: boolean = false;
  allowedToSave: boolean = true;

  constructor(private element: ElementRef,
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    public essService: ESSService,
    public onboardingService: OnboardingService,
    private Customloadingspinner: NgxSpinnerService,
    private UIBuilderService: UIBuilderService,
    public fileuploadService: FileUploadService,
    private sanitizer: DomSanitizer,

  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 

  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({

      // PREVIOUS EMPLOYMENT
      previousemploymentId: [''],
      companyName: [''],
      startdate: [''],
      enddate: [''],
      grossSalary: [''],
      previousPT: [''],
      previousPF: [''],
      taxDeducted: [''],
      IsESSRequired: [true],
      prevEmpfinancialYear: [null],
      prevEmpIsProposedMode: [false],
      Prev_DocumentId: [null,],
      Prev_FileName: [null],
      Prev_Status: [''],
      InputsRemarks: ['']
    });
  }


  ngOnInit() {
    this.FINID = 0;
    this.doRefresh();
    this.employeeForm.valueChanges.subscribe((changedObj: any) => {
      this.subscribeEmitter();
    });
  }

  doRefresh() {
    this.isInvestmentUnderQC = false;
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
      this.GetEmployeeRequiredEmploymentDetails().then((obj) => {
        this.EmployeeLookUpDetailsByEmployeeId().then((obj1) => {
          this._loadEmpUILookUpDetails().then((obj2) => {
            this.patchEmployeeForm();
          });
        });
      })

    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
      this.patchEmployeeForm();
    }

  }

  patchEmployeeForm() {
    
    this.employeeService.getActiveTab(false);
    try {
      this.EnddateminDate = new Date();
      if (this.employeedetails != null) {
        console.log('sdsd',this.employeedetails);
        
        this.FicalYearList = this.lstlookUpDetails.FicalYearList;
        this.TaxDeclaration = this.InvestmetnListGrp.TaxDeclaration as any;
        this.InvestmetnListGrp.FinancialDetails != null && this.InvestmetnListGrp.FinancialDetails.length > 0 ? this.FINID =  this.InvestmetnListGrp.FinancialDetails[0].Id : true;

        this.LstemploymentDetails = this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0 && this.employeedetails.LstemploymentDetails;
        this.LstemploymentDetails != null && this.LstemploymentDetails.length > 0 && this.LstemploymentDetails.forEach(element => {
          element['FinancialYearName'] = this.FicalYearList.find(a => a.Id == element.FinancialYearId).code;
          element.ApprovedGrossSalary = element.ApprovedGrossSalary == null ? 0 : element.ApprovedGrossSalary,
            element.ApprovedPreviousPF = element.ApprovedPreviousPF == null ? 0 : element.ApprovedPreviousPF,
            element.ApprovedPreviousPT = element.ApprovedPreviousPT == null ? 0 : element.ApprovedPreviousPT,
            element.ApprovedStandardDeduction = element.ApprovedStandardDeduction == null ? 0 : element.ApprovedStandardDeduction,
            element.ApprovedTaxDeducted = element.ApprovedTaxDeducted == null ? 0 : element.ApprovedTaxDeducted
        });

        this.LstemploymentDetails != null && this.LstemploymentDetails.length > 0 ? this.LstemploymentDetails = _.orderBy(this.LstemploymentDetails, ['FinancialYearId', 'StartDate'],
          ['desc', 'asc']) : true;

        if (this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.FinancialYearId == this.FINID) {
          this.isInvestmentUnderQC = this.employeedetails.EmployeeInvestmentMaster != null && this.employeedetails.EmployeeInvestmentMaster.ModuleProcessTransactionId > 0 && this.employeedetails.EmployeeInvestmentMaster.Status == ApprovalStatus.Pending ? true : false;

        }
      }

      this.spinner = false;
    } catch (error) {
      this.spinner = false;
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY EMPLOYMENT DETAILS :', error);

    }
  }




  addPreviousEmployment() {
    this.employeeForm.controls['previousemploymentId'].reset();
    this.employeeForm.controls['companyName'].reset();
    this.employeeForm.controls['startdate'].reset();
    this.employeeForm.controls['enddate'].reset();
    this.employeeForm.controls['grossSalary'].reset();
    this.employeeForm.controls['Prev_Status'].reset();
    this.employeeForm.controls['InputsRemarks'].reset();

    this.employeeForm.controls['previousPT'].reset();
    this.employeeForm.controls['previousPF'].reset();
    this.employeeForm.controls['taxDeducted'].reset();
    this.employeeForm.controls['prevEmpIsProposedMode'].reset();
    this.employeeForm.controls['prevEmpfinancialYear'].reset();
    this.employeeForm.controls['Prev_FileName'].reset();
    this.employeeForm.controls['Prev_DocumentId'].reset();
    this.DocumentId = null;
    this.FileName = null;

    // this.isESSLogin && this.employeeForm.enable();
    // this.employeeForm.controls['employeecode'].disable();
    this.previousemployment_slidervisible = true;

  }
  editPreviousEmployment(item) {
    this.popupId = item.Id;
    this.firstTimeDocumentId = item.DocumentId;

    this.employeeForm.controls['previousemploymentId'].setValue(item.Id);
    this.employeeForm.controls['companyName'].setValue(item.CompanyName);
    this.employeeForm.controls['startdate'].setValue(new Date(item.StartDate));
    this.employeeForm.controls['enddate'].setValue(new Date(item.EndDate));
    this.employeeForm.controls['grossSalary'].setValue(item.GrossSalary);
    this.employeeForm.controls['Prev_Status'].setValue(item.status);
    this.employeeForm.controls['InputsRemarks'].setValue(item.InputsRemarks);

    this.employeeForm.controls['previousPT'].setValue(item.PreviousPT);
    this.employeeForm.controls['previousPF'].setValue(item.PreviousPF);
    this.employeeForm.controls['taxDeducted'].setValue(item.TaxDeducted);
    this.employeeForm.controls['Prev_FileName'].setValue(item.FileName);
    this.employeeForm.controls['Prev_DocumentId'].setValue(item.DocumentId);
    // this.employeeForm.controls['employeecode'].disable();
    this.employeeForm.controls['prevEmpIsProposedMode'].setValue(item.IsProposed);
    this.employeeForm.controls['prevEmpfinancialYear'].setValue(item.FinancialYearId);
    if (item.DocumentId) {
      this.FileName = item.FileName;
      this.DocumentId = item.DocumentId;
    }


    this.previousemployment_slidervisible = true;
  }
  updatePreviousEmplyment() {
    this.submitted = true;

    if (this.employeeForm.get('prevEmpfinancialYear').value == null || this.employeeForm.get('prevEmpfinancialYear').value == undefined) {
      this.employeeForm.controls['prevEmpfinancialYear'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('companyName').value == null || this.employeeForm.get('companyName').value == '' || this.employeeForm.get('companyName').value == undefined) {
      this.employeeForm.controls['companyName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('startdate').value == null || this.employeeForm.get('startdate').value == undefined) {
      this.employeeForm.controls['startdate'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('enddate').value == null || this.employeeForm.get('enddate').value == undefined) {
      this.employeeForm.controls['enddate'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('grossSalary').value == null || this.employeeForm.get('grossSalary').value == undefined) {
      this.employeeForm.controls['grossSalary'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('previousPT').value == null || this.employeeForm.get('previousPT').value == undefined) {
      this.employeeForm.controls['previousPT'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('previousPF').value == null || this.employeeForm.get('previousPF').value == undefined) {
      this.employeeForm.controls['previousPF'].setErrors({ 'incorrect': true });
    }

    else if ((this.employeeForm.get('taxDeducted').value == null)) {
      this.employeeForm.controls['taxDeducted'].setErrors({ 'incorrect': true });
    }
    else if ((this.FileName == null)) {
      this.employeeForm.controls['Prev_DocumentId'].setErrors({ 'incorrect': true });
    }
    else {
      // var mode: boolean = this.TaxDeclaration == 1 ? false : true;
      var mode : boolean =  true as any;

      var foundIndex = this.employeedetails.LstemploymentDetails.find(z => z.Id == (this.employeeForm.get('previousemploymentId').value));
      if (foundIndex != undefined && foundIndex != null) {
        foundIndex.FinancialYearId = this.employeeForm.get('prevEmpfinancialYear').value;
        foundIndex.CompanyName = (this.employeeForm.get('companyName').value);
        foundIndex.StartDate = (this.employeeForm.get('startdate').value);
        foundIndex.EndDate = (this.employeeForm.get('enddate').value);
        foundIndex.GrossSalary = (this.employeeForm.get('grossSalary').value) || 0;
        foundIndex.ApprovalStatus = ApprovalStatus.Pending;
        foundIndex.PreviousPT = (this.employeeForm.get('previousPT').value) || 0;
        foundIndex.PreviousPF = (this.employeeForm.get('previousPF').value) || 0;
        foundIndex.TaxDeducted = (this.employeeForm.get('taxDeducted').value) || 0;
      // (this.employeeForm.get('prevEmpIsProposedMode').value);
        foundIndex.Modetype = UIMode.Edit;
        foundIndex.Status = 1;
        foundIndex.InputsRemarks = (this.employeeForm.get('InputsRemarks').value); 

        foundIndex.FileName = (this.employeeForm.get('Prev_FileName').value);
        foundIndex.DocumentId = (this.employeeForm.get('Prev_DocumentId').value) == null ? 0 : (this.employeeForm.get('Prev_DocumentId').value);
        foundIndex.IsProposed = foundIndex.DocumentId > 0 ? false : true ;
        foundIndex['FinancialYearName'] = this.FicalYearList.find(a => a.Id == this.employeeForm.get('prevEmpfinancialYear').value).code;
      } else {
        var employmentDetails = new EmploymentDetails();
        employmentDetails.Id = UUID.UUID() as any;
        employmentDetails.FinancialYearId = this.employeeForm.get('prevEmpfinancialYear').value;
        employmentDetails.CompanyName = (this.employeeForm.get('companyName').value);
        employmentDetails.StartDate = (this.employeeForm.get('startdate').value);
        employmentDetails.EndDate = (this.employeeForm.get('enddate').value);
        employmentDetails.GrossSalary = (this.employeeForm.get('grossSalary').value) || 0;
        employmentDetails.ApprovalStatus = ApprovalStatus.Pending;
        employmentDetails.PreviousPT = (this.employeeForm.get('previousPT').value) || 0;
        employmentDetails.PreviousPF = (this.employeeForm.get('previousPF').value) || 0;
        employmentDetails.TaxDeducted = (this.employeeForm.get('taxDeducted').value) || 0;
        employmentDetails.FileName = (this.employeeForm.get('Prev_FileName').value);
        employmentDetails.DocumentId = (this.employeeForm.get('Prev_DocumentId').value) == null ? 0 : (this.employeeForm.get('Prev_DocumentId').value);
        employmentDetails.IsProposed =  employmentDetails.DocumentId > 0 ? false : true ;// mode == false ? true : false;
        employmentDetails.Status = 1;
        employmentDetails.InputsRemarks = (this.employeeForm.get('InputsRemarks').value); 

        employmentDetails['FinancialYearName'] = this.FicalYearList.find(a => a.Id == this.employeeForm.get('prevEmpfinancialYear').value).code;

        employmentDetails.Modetype = UIMode.Edit;
        this.employeedetails.LstemploymentDetails.push(employmentDetails);
      }

      this.LstemploymentDetails = this.employeedetails.LstemploymentDetails;
      this.employeeForm.controls['companyName'].reset();
      this.employeeForm.controls['startdate'].reset();
      this.employeeForm.controls['enddate'].reset();
      this.employeeForm.controls['grossSalary'].reset();
      this.employeeForm.controls['Prev_Status'].reset();
      this.employeeForm.controls['InputsRemarks'].reset();

      this.employeeForm.controls['previousPT'].reset();
      this.employeeForm.controls['previousPF'].reset();
      this.employeeForm.controls['taxDeducted'].reset();
      this.employeeForm.controls['prevEmpfinancialYear'].reset();
      this.employeeForm.controls['prevEmpIsProposedMode'].reset();
      this.employeeForm.controls['Prev_FileName'].reset();
      this.employeeForm.controls['Prev_DocumentId'].reset();
      this.FileName = null;
      this.DocumentId = null;
      this.LstemploymentDetails != null && this.LstemploymentDetails.length > 0 ? this.LstemploymentDetails = _.orderBy(this.LstemploymentDetails, ['FinancialYearId', 'StartDate'],
        ['desc', 'asc']) : true;
      this.previousemployment_slidervisible = false;
      this.submitted = false;

    }
  }


  onChangeStartDate(event) {

    if (this.employeeForm.get('startdate').value != null || this.employeeForm.get('startdate').value != undefined || event != null || event != undefined) {
      this.employeeForm.controls['enddate'].setValue(null);
      var StartDate = new Date(event);
      this.EnddateminDate = new Date();
      this.EnddateminDate.setMonth(StartDate.getMonth());
      this.EnddateminDate.setDate(StartDate.getDate() + 1);
      this.EnddateminDate.setFullYear(StartDate.getFullYear());

    }

  }
  close_preEmploymentSlider() {
    this.previousemployment_slidervisible = false;
  }



  onFileUpload(e) {
    this.loadingScreenService.startLoading();
    //this.Customloadingspinner.show();
    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      var FileSize = e.target.files[0].size / 1024 / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      // if (!file.type.match(pattern)) {
      //   this.isLoading = true;
      //   alert('You are trying to upload not Image. Please choose image.');
      //   return;
      // }

      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";
        this.FileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, this.FileName, 'Bank')

      };

    }

  }

  doAsyncUpload(filebytes, filename, whichSection) {
    try {
      this.loadingScreenService.startLoading();
      //this.Customloadingspinner.show();
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.EmployeeId = this.employeedetails.Id;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" :this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? ""  : this.sessionService.getSessionStorage("CompanyCode").toString();
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
            this.employeeForm.controls['Prev_DocumentId'].setValue(apiResult.Result);
            this.employeeForm.controls['Prev_FileName'].setValue(this.FileName);
            this.DocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.DocumentId = apiResult.Result;
            this.loadingScreenService.stopLoading();
            //this.Customloadingspinner.hide();
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file")
            this.isLoading = true;

          }
          else {
            this.loadingScreenService.stopLoading();
           // this.Customloadingspinner.hide();
            this.FileName = null;
            this.DocumentId = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
         // this.Customloadingspinner.hide();
          this.FileName = null;
          this.DocumentId = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to upload! " + error)
        }

      }), ((err) => {

      })

    } catch (error) {
      this.loadingScreenService.stopLoading();
      //this.Customloadingspinner.hide();
      this.FileName = null;
      this.DocumentId = null;
      this.alertService.showWarning("An error occurred while trying to upload! " + error)
      this.isLoading = true;
    }

  }

  doDeleteFile() {
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

      if (result.value) {
        if (this.essService.isGuid(this.popupId)) {

          this.deleteAsync();
        }
        else if (this.firstTimeDocumentId != this.DocumentId) {

          this.deleteAsync();

        }

        else {
          this.isLoading = true
          this.FileName = null;
          this.DocumentId = null;
          this.employeeForm.controls['Prev_FileName'].setValue(null);
          this.employeeForm.controls['Prev_DocumentId'].setValue(null);

        }
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


    this.isLoading = false;
    this.spinnerText = "Deleting";

    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {
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
          this.FileName = null;
          this.DocumentId = null;
          this.employeeForm.controls['IsDocumentDelete'].setValue(false);
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to delete! " + apiResult.Message)
        }
      } catch (error) {
        this.isLoading = true
        this.alertService.showWarning("An error occurred while  trying to delete! " + error)
      }

    }), ((err) => {

    })

  }



  document_file_view(item) {

    $("#popup_viewDocs").modal('show');
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

  modal_dismiss4() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs").modal('hide');
  }


  // ESS

  GetEmployeeRequiredEmploymentDetails() {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.PreviousEmploymentDetails).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let employmentObject: EmployeeDetails = apiR.Result as any;
            this.employeedetails = employmentObject;
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

  EmployeeLookUpDetailsByEmployeeId() {

    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .EmployeeLookUpDetailsByEmployeeId(this.EmployeeId).subscribe((result) => {
          let apiR: apiResult = result;

          if (apiR.Status == true) {

            var lookupObject = JSON.parse(apiR.Result) as any;
            console.log('lookup', lookupObject);

            this.InvestmetnListGrp = lookupObject;
            // this.InvestmetnListGrp = lookupObject.TaxDeclaration;
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


  _loadEmpUILookUpDetails() {

    return new Promise((res, rej) => {
      this.employeeService.get_LoadEmployeeUILookUpDetails(this.EmployeeId)
        .subscribe((result) => {

          let apiResponse: apiResponse = result;
          if (apiResponse.Status) {
            this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
            this.spinner = false;
            res(true);
          } else {
            this.spinner = false;
          }
        }, err => {
          rej();
        })
    });
  }


  doSaveOrSubmit(isSubmit) {

    try {
      this.loadingScreenService.startLoading();
     // this.Customloadingspinner.show();

      if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0) {
        this.employeedetails.LstemploymentDetails.forEach(element => {
          element.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id
        });
      }
      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;

      // this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;
      console.log('PUT', this.employeedetails);

      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            this.doRefresh();
          } else {
            this.alertService.showWarning(data.Message);
          }
        });
      }
    }
    catch (e) {
      console.log('e', e);

    }

  }


  /// FINAL HANDLER 

  EmitHandler() {

    if (this.employeedetails.LstemploymentDetails != null && this.employeedetails.LstemploymentDetails.length > 0) {
      this.employeedetails.LstemploymentDetails.forEach(element => {
        element.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id
      });
    }

    // if (this.employeedetails.EmployeeCommunicationDetails == null) {
    //   var _Communication = {
    //     Id: 0,
    //     EmployeeId: this.EmployeeId,
    //     CandidateId: 0,
    //     EntityType: { Id: 0, Name: '' },
    //     EntityId: 0,
    //     AddressDetails: '',
    //     ContactDetails: '',
    //     LstAddressdetails: [],
    //     LstContactDetails: [],
    //     IsEditable: true,
    //     Modetype: UIMode.Edit,
    //   }
    //   this.employeedetails.EmployeeCommunicationDetails = _Communication;
    //   this.employeedetails.EmployeeCommunicationDetails.LstContactDetails = [];
    //   this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.push({
    //     PrimaryMobile: this.employeeForm.get('mobile').value,
    //     PrimaryEmail: this.employeeForm.get('email').value,
    //     CommunicationCategoryTypeId: CommunicationCategoryType.Personal,
    //     PrimaryMobileCountryCode: "+91",
    //     AlternateMobile: '',
    //     AlternateMobileCountryCode: '',
    //     AlternateEmail: '',
    //     EmergencyContactNo: '',
    //     LandlineStd: '',
    //     LandLine: '',
    //     LandLineExtension: '',
    //     PrimaryFax: '',
    //     AlternateFax: '',
    //     IsDefault: true
    //   })

    // } else {

    //   this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryMobile = this.employeeForm.get('mobile').value;
    //   this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail = this.employeeForm.get('email').value;

    // }
    // this.employeedetails.EmployeeCommunicationDetails.Modetype = UIMode.Edit;
    // this.Addressdetails.push({
    //   CommunicationCategoryTypeId: CommunicationCategoryType.Present,
    //   Address1: this.employeeForm.get('presentAddressdetails').value,
    //   Address2: this.employeeForm.get('presentAddressdetails1').value,
    //   Address3: this.employeeForm.get('presentAddressdetails2').value,
    //   CountryName: this.employeeForm.get('presentCountryName').value,
    //   StateName: this.employeeForm.get('presentStateName').value,
    //   City: this.employeeForm.get('presentCity').value,
    //   PinCode: this.employeeForm.get('presentPincode').value,
    //   CountryId: 0,
    //   CityId: 0,
    //   StateId: 0,
    //   DistrictId: 0,

    // })
    // this.Addressdetails.push({
    //   CommunicationCategoryTypeId: CommunicationCategoryType.Permanent,
    //   Address1: this.employeeForm.get('permanentAddressdetails').value,
    //   Address2: this.employeeForm.get('permanentAddressdetails1').value,
    //   Address3: this.employeeForm.get('permanentAddressdetails2').value,
    //   CountryName: this.employeeForm.get('permanentCountryName').value,
    //   StateName: this.employeeForm.get('permanentStateName').value,
    //   City: this.employeeForm.get('permanentCity').value,
    //   PinCode: this.employeeForm.get('permanentPincode').value,
    //   CountryId: 0,
    //   CityId: 0,
    //   StateId: 0,
    //   DistrictId: 0,

    // });
    // this.employeedetails.EmployeeCommunicationDetails.LstAddressdetails = this.Addressdetails;

  }

  ngOnDestroy() {
    this.subscribeEmitter();


  }

  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      this.employmentChangeHandler.emit(this.employeedetails);
    }
  }
} 