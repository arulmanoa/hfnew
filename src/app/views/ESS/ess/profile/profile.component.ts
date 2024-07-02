import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';

import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { LoginResponses } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { AlertService, EmployeeService, FileUploadService, HeaderService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ESSService } from 'src/app/_services/service/ess.service';
import { Gender, Relationship, BloodGroup, MaritalStatus, Nationality } from 'src/app/_services/model/Base/HRSuiteEnums';
import { CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ApprovalStatus, CandidateDocuments, DocumentVerificationMode } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { environment } from "../../../../../environments/environment";
import { MycommunicationsComponent } from '../mycommunications/mycommunications.component';
import { DomSanitizer } from '@angular/platform-browser';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { panNumberValidator } from 'src/app/_validators/panNumberValidator';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';
import { CookieService } from 'ngx-cookie-service';
import { OnboardingAdditionalInfo } from '@services/model/OnBoarding/OnBoardingInfo';
import { UtilityService } from '@services/service/utitlity.service';
import { DuplicateCandidateDetails } from '@services/model/Candidates/CandidateDetails';
import { EntityType } from '@services/model/Base/EntityType';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})

export class ProfileComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: any;
  @Output() profileChangeHandler = new EventEmitter();
  @ViewChild('myprofileTemplate') template: TemplateRef<any>;
  @ViewChild('communication') communication: MycommunicationsComponent;
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

  clientLogoLink: any;
  clientminiLogoLink: any;
  // MY PROFILE DECL. 
  employeeModel: EmployeeModel = new EmployeeModel();
  gender: any = [];
  relationType: any = [];
  DOB: any;
  countryCode: any = '91';
  DOBmaxDate: Date;
  _OriginalAadhaarNumber: any;
  _OrginalPanNo: any;
  icontoggle: boolean = true;
  icontogglepan: boolean = true;
  IsESICApplicableForKeyIn: boolean = false;

  delete_ProfileAvatarDocument: any[] = [];
  new_ProfileAvatarDocument: any[] = [];
  isAadhaarNotEditable: boolean = null;
  isPANNotEditable: boolean = null;

  spinnerText: string = "Uploading";
  isLoading: boolean = true;
  FileName: any;
  profileImageDocumentId: any;
  contentmodalurl: any;
  lstlookUpDetails: EmployeeLookUp;
  DocumentTypeList: any[] = [];
  unsavedDocumentLst: any[] = [];
  DocumentId: any;
  officialEmailCannotEdit: any;
  MenuId: any;
  // ELC 
  ELCTransactions: any[] = [];
  Current_RateSetList: any[] = [];
  Old_RateSetList: any[] = [];
  EffectiveDate_POP: Date = new Date();
  AnnualSalary_POP: number = 0;
  visible1 = false;
  showCurrentRateSet: boolean = true;
  relationName: any;
  bloodGroup: any = [];
  maritalStatus: any = [];
  isInfoBtnVisible: boolean;
  info: string = "Upload Disability Proof Document";
  popUpData: any = {
    modalComponent: DocumentsModalComponent
  }
  objStorageJson: string;
  disabilityDoc: any[] = [];
  isAllenDigital: boolean = false;

  onboardingAdditionalInfo: OnboardingAdditionalInfo = {
    LstEmployeeDivision: [],
    LstEmployeeDepartment: [],
    LstEmployeeDesignation: [],
    LstEmployeeLevel: [],
    LstEmployeeCategory: [],
    LstReligion: [],
    LstSubEmploymentType: [],
    LstSubEmploymentCategory: [],
    LstCostCityCenter: [],
    LstBuildings: [],
    LstJobProfile: [],
    LstClientZone: []
  };

  essInfo = {
    DOJ: null,
    Department: null,
    Division: null,
    EmploymentType: null,
    Religion: null,
  }

  RequiredToShowCustomFieldsOnESS = environment.environment.RequiredToShowCustomFieldsOnESS
  nationality: any = [];
  isInvalidCandidateInformation: boolean = false;
  DuplicateCheckMessage: string = "";
  isValidateCandidate: boolean = true;
  currentDate  = new Date()

  constructor(
    private element: ElementRef,
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private alertService: AlertService,
    public essService: ESSService,
    private fileuploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private UIBuilderService: UIBuilderService,
    private cookieService: CookieService,
    private onboardingService: OnboardingService,
    private utitlityService: UtilityService,
    private datePipe: DatePipe,
  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 
  get disabilityDocConfig() { return this.DocumentTypeList.filter(document => document.DocumentTypeName === "Disability Proof"); }



  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({

      //GENERAL
      Name: ['', Validators.required],
      mobile: ['', Validators.required],
      gender: [null, Validators.required],
      email: ['', Validators.required],
      officialEmail: [''],
      dateOfBirth: ['', Validators.required],
      Status: [true],
      bloodGroup: [null],
      MaritalStatus: [null],
      // fatherName: ['', Validators.required],
      adhaarnumber: [''],
      PANNO: ['', panNumberValidator()],
      UAN: [''],
      ESIC: [''],
      PFNumber: [''],

      //CURRENT EMPLOYMENT
      employername: [''],
      jobtype: [''],
      companyname: [''],
      employeecode: [''],
      teamname: [''],
      contractname: ['', !this.isESSLogin ? Validators.required : null],
      clientname: ['', !this.isESSLogin ? Validators.required : null],
      employmentType: [null],
      reportingmanager: [''],
      // dateofjoining: ['', Validators.required],
      employementstartdate: ['', !this.isESSLogin ? Validators.required : null],
      employementenddate: [''],
      Designation: ['', !this.isESSLogin ? Validators.required : null],
      LWD: [''],
      Department: [''],
      Grade: [''],
      Location: ['', !this.isESSLogin ? Validators.required : null],
      statename: ['', !this.isESSLogin ? Validators.required : null],
      Country: ['', !this.isESSLogin ? Validators.required : null],
      costcode: [''],
      IsESSRequired: [true],

      _relationTypeId: ['', !this.isESSLogin ? Validators.required : null],
      _relationName: ['', !this.isESSLogin ? Validators.required : null],
      emergencyContactnumber: [''],
      emergencyContactPersonName: [''],
      IsDifferentlyabled: [false],
      DisabilityPercentage: ['', [Validators.max(100), Validators.min(0)]],
      CustomData1: [''],
      CustomData2: [''],
      CustomData3: [''],
      CustomData4: [''],
      nationality: [1],

    });
  }

  ngOnInit() {

    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    this.isAllenDigital = (cookieValue.toUpperCase() == 'ALLEN' && (businessType === 1 || businessType === 2)) ? true : false;

    this.doRefresh();
    this.employeeForm.controls['DisabilityPercentage'].valueChanges.subscribe((val: any) => this.isInfoBtnVisible = val > environment.environment.AmountOfDifferentlyabled);
    this.objStorageJson = JSON.stringify({ IsCandidate: false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId, CandidateName: this.employeedetails.FirstName });


    this.employeeForm.get('IsDifferentlyabled').valueChanges.subscribe((value: boolean) => {
      if (!value) {
        this.employeeForm.get('DisabilityPercentage').setValue(0);
      }
    });
  }

  doRefresh() {
    this.template.createEmbeddedView(this.element);
    this.spinner = true;
    this.headerService.setTitle('My Profile');
    this.titleService.setTitle('My Profile');

    this.countryCode = "91";
    this.gender = this.utilsHelper.transform(Gender);
    this.relationType = this.utilsHelper.transform(Relationship);
    this.bloodGroup = this.utilsHelper.transform(BloodGroup)
    this.maritalStatus = this.utilsHelper.transform(MaritalStatus);
    this.nationality = this.utilsHelper.transform(Nationality);
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.clientLogoLink = 'logo.png';
    this.officialEmailCannotEdit = environment.environment.officialEmailEditRole.whoCannotEdit
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    let mode = 2; // add-1, edit-2, view, 3   
    if (this.RoleCode == 'Employee') {
      this.isValidateCandidate = false;
    }
    this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    try {
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (error) {
      console.log('UI BUILDER ::', error);

    }
    var disableFields = ["Name", "gender", "dateOfBirth"];
    if (this.employeedetails && this.employeedetails.Id > 0) {
      this.reactiveFormDisableEnable(disableFields, true);
    }
    this.pre_Defined_Activities();
    if (this.employeedetails) {
      this._OriginalAadhaarNumber = this.employeedetails.Aadhaar;
      this._OrginalPanNo = this.employeedetails.PAN;
    }


    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");
      console.log('this.employeedetails', this.employeedetails);
      console.log(this.employeedetails, 'Profile is refreshed here')
      if (this.employeedetails == null || this.employeedetails == undefined) {
        this.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).then((res) => {
          res == true ?
            this._loadEmpUILookUpDetails().then((r) => {
              this.GetEmployeeRequiredDocumentetails().then((obj2) => {
                this.patchEmployeeForm()
              })

            })
            : true;
        })
      } else {
        this.patchEmployeeForm()
      }



    } else {
     
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;

      if (this.employeedetails.Id == 0) {
        this.getAdditionalInfo();
        this.icontoggle = false;
        this.patchEmployeeForm();
        return;
      }
      this._loadEmpUILookUpDetails().then((r) => {
        this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
        if (this.employeedetails.Id == 0) {
          this.GetEmployeeRequiredDocumentetails().then((obj2) => {
            this.patchEmployeeForm();

          });
        } else {
          this.getAdditionalInfo();
          this.spinner = false;
          this.patchEmployeeForm();
        }
      })

    }
    if (this.officialEmailCannotEdit == this.RoleCode) {
      this.employeeForm.controls['officialEmail'].disable();
    }
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.employeeForm.controls['MaritalStatus'].disable();
      this.employeeForm.controls['gender'].disable();
    }
  }

  reactiveFormDisableEnable(disableFields, controlMode) {
    for (let form = 0; form < disableFields.length; form++) {
      const element = disableFields[form];
      console.log('element', element);

      this.employeeForm.controls[element].disable();
    }
  }

  getAdditionalInfo() {
    const clientId = this.employeedetails.EmploymentContracts[0].ClientId;
    const clientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
    this.spinner = true;
    this.onboardingService.GetOnboardingAdditionalInfo(clientId, clientContractId).subscribe((response: apiResult) => {
      if (response.Status) {
        this.onboardingAdditionalInfo = JSON.parse(response.Result);
        this.spinner = false;
      }
    }, (error) => {

    });

  }

  AfterSaveCommitted() {
    this.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Profile).then((res) => {
      this.icontoggle = true;
      this.patchEmployeeForm();
    })
  }
  pre_Defined_Activities() {
    // set dob max date 
    this.DOBmaxDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);

  }

  GetEmployeeRequiredDetailsById(employeeId, ctrlActivity) {
    const promise = new Promise((resolve, reject) => {

      this.employeeService
        .GetEmployeeRequiredDetailsById(employeeId, ctrlActivity)
        .subscribe((result) => {
          try {
            let apiresult: apiResult = result;
            if (apiresult.Status && apiresult.Result != null) {
              this.employeedetails = apiresult.Result as any;

              this._OriginalAadhaarNumber = this.employeedetails.Aadhaar;
              this._OrginalPanNo = this.employeedetails.PAN;
              console.log('PRO EMPLOYEE REQUIRED DETAILS ::', this.employeedetails);
              this.getAdditionalInfo();
              // if (this.RoleCode == 'Employee') {
              //   this.getAdditionalInfo();
              // }


              if (this.RoleCode == 'Employee') {
                this.getEmployeeConfiguration(this.employeedetails.EmploymentContracts[0].ClientContractId);
              } 

              resolve(true);


            } else {
              console.info('AN ERROR OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', apiresult);
              resolve(false);
            }

          } catch (error) {
            console.info('AN EXCEPTION OCCURRED WHILE GETTING EMPLOYEE REQUIRED DATA ::', error);
            resolve(false);
          }
        }, err => {
          reject(true);
        });

    });

    return promise;
  }
  _loadEmpUILookUpDetails() {
    return new Promise((res, rej) => {
      this.employeeService.get_LoadEmployeeUILookUpDetails(this.EmployeeId)
        .subscribe((result) => {
          let apiResponse: apiResponse = result;
          if (apiResponse.Status) {
            this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
            if (this.lstlookUpDetails.DocumentTypeList) {
              this.DocumentTypeList = this.lstlookUpDetails.DocumentTypeList;
            }
            if (this.lstlookUpDetails.DocumentCategoryist && this.lstlookUpDetails.DocumentTypeList == undefined) {
              this.DocumentTypeList = this.lstlookUpDetails.DocumentCategoryist;
            }
            res(true);
          }

        }, err => {
          rej();
        })
    });
  }

  patchEmployeeForm() {

    this.employeeService.getActiveTab(false);
    try {

      console.log('Profile Initial ::', this.employeedetails);

      if (this.employeedetails.Id == 0) {
        this.employeedetails.DateOfBirth == "1970-01-01" ? this.employeedetails.DateOfBirth = null : true
      }

      this.employeedetails.DateOfBirth == 'Invalid Date' ? this.employeedetails.DateOfBirth = null : true;

      if (this.employeedetails != null) {
        this.employeeForm.controls['Name'].setValue(this.employeedetails.FirstName);
        this.employeeForm.controls['Status'].setValue(this.employeedetails.Status);
        this.employeeForm.controls['gender'].setValue(this.employeedetails.Gender);
        this.employeeForm.controls['bloodGroup'].setValue(this.employeedetails.BloodGroup == 0 ? null :
          this.employeedetails.BloodGroup);
          this.employeeForm.controls['nationality'].setValue(this.employeedetails.Nationality == 0 ? 1 :
            this.employeedetails.Nationality);
        this.employeeForm.controls['MaritalStatus'].setValue(this.employeedetails.MaritalStatus == 0 ? null : this.employeedetails.MaritalStatus);

        this.employeeForm.controls['dateOfBirth'].setValue(this.employeedetails.DateOfBirth == '1970-01-01' ? null : new Date(this.employeedetails.DateOfBirth));
        this.employeeForm.controls['PANNO'].setValue((this.employeedetails.PAN == null || this.employeedetails.PAN == 'NULL') ? '' : this.employeedetails.PAN);
        this.employeeForm.controls['UAN'].setValue((this.employeedetails.UAN == null || this.employeedetails.UAN == 'NULL') ? '' : this.employeedetails.UAN);
        this.employeeForm.controls['ESIC'].setValue((this.employeedetails.ESIC == null || this.employeedetails.ESIC == 'NULL') ? '' : this.employeedetails.ESIC);
        this.employeeForm.controls['PFNumber'].setValue((this.employeedetails.EmploymentContracts[0]['PFNumber'] == null) ? '' : this.employeedetails.EmploymentContracts[0]['PFNumber']);
        this.employeeForm.controls['employeecode'].setValue(this.employeedetails.Code);
        this.employeeForm.controls['IsDifferentlyabled'].setValue(this.employeedetails.IsDifferentlyabled);
        this.employeeForm.controls['DisabilityPercentage'].setValue(this.employeedetails.DisabilityPercentage);
        console.log(this.employeedetails)
        this.employeeForm.controls['CustomData1'].setValue(this.employeedetails.CustomData1);
        this.employeeForm.controls['CustomData2'].setValue(this.employeedetails.CustomData2);
        this.employeeForm.controls['CustomData3'].setValue(this.employeedetails.CustomData3);
        this.employeeForm.controls['CustomData4'].setValue(this.employeedetails.CustomData4);

        this.employeeForm.controls['adhaarnumber'].setValue(this.employeedetails.Aadhaar != null ? this._aadhaar_inputMask(this.employeedetails.Aadhaar) : null);
        if (this.employeedetails.EmployeeCommunicationDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
          let emergencyObj = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(item => item.CommunicationCategoryTypeId == 4)
          if (emergencyObj != undefined && emergencyObj != null) {
            this.employeeForm.controls['emergencyContactPersonName'].setValue(this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(item => item.CommunicationCategoryTypeId == 4).EmergencyContactPersonName);
            this.employeeForm.controls['emergencyContactnumber'].setValue(this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(item => item.CommunicationCategoryTypeId == 4).EmergencyContactNo);
          }
          let primaryObj = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(item => item.CommunicationCategoryTypeId == 3)
          if (primaryObj != undefined && primaryObj != null) {
            this.employeeForm.controls['email'].setValue(this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(item => item.CommunicationCategoryTypeId == 3).PrimaryEmail);
            this.employeeForm.controls['mobile'].setValue(this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(item => item.CommunicationCategoryTypeId == 3).PrimaryMobile);
          }
        }

        if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
          let officialmailId = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2);
          if (officialmailId) {
            this.employeeForm.controls['officialEmail'].setValue(officialmailId.PrimaryEmail);
          }

        }

        const marriageDate = this.employeedetails.MarriageDate == null || this.employeedetails.MarriageDate == '0001-01-01T00:00:00' ? null : new Date(this.employeedetails.MarriageDate)
        this.employeedetails.MarriageDate = new Date(marriageDate);

        // -- setting up the default value 
        // this.employeedetails.EmploymentContracts[0].Category = this.employeedetails.EmploymentContracts[0].Category == 0 ? null : this.employeedetails.EmploymentContracts[0].Category;
        this.employeedetails.EmploymentContracts[0].DepartmentId = this.employeedetails.EmploymentContracts[0].DepartmentId == 0 ? null : this.employeedetails.EmploymentContracts[0].DepartmentId
        this.employeedetails.EmploymentContracts[0].Division = this.employeedetails.EmploymentContracts[0].Division == 0 ? null : this.employeedetails.EmploymentContracts[0].Division
        this.employeedetails.EmploymentContracts[0].Level = this.employeedetails.EmploymentContracts[0].Level == 0 ? null : this.employeedetails.EmploymentContracts[0].Level
        this.employeedetails.EmploymentContracts[0].SubEmploymentType = this.employeedetails.EmploymentContracts[0].SubEmploymentType == 0 ? null : this.employeedetails.EmploymentContracts[0].SubEmploymentType
        // this.employeedetails.EmploymentContracts[0].Category = this.employeedetails.EmploymentContracts[0].Category == 0 ? null : this.employeedetails.EmploymentContracts[0].Category
        this.employeedetails.EmploymentContracts[0].SubEmploymentCategory = this.employeedetails.EmploymentContracts[0].SubEmploymentCategory == 0 ? null : this.employeedetails.EmploymentContracts[0].SubEmploymentCategory



        this.employeeForm.controls['_relationTypeId'].setValue((this.employeedetails.RelationshipId == null || this.employeedetails.RelationshipId == 'NULL') ? '' : this.employeedetails.RelationshipId);
        this.employeeForm.controls['_relationName'].setValue((this.employeedetails.RelationshipName == null || this.employeedetails.RelationshipName == 'NULL') ? '' : this.employeedetails.RelationshipName);
        this.relationName = (this.employeedetails.RelationshipId != null && this.employeedetails.RelationshipId != 0) ? this.relationType.find(item => item.id == this.employeedetails.RelationshipId).name : "";
        // EMPLOYMENT DETAILS 
        this.employeeForm.controls['IsESSRequired'].setValue(this.employeedetails.EmploymentContracts[0].IsESSRequired == null ? true : this.employeedetails.EmploymentContracts[0].IsESSRequired);

        this.IsESICApplicableForKeyIn = this.employeedetails.EmploymentContracts[0].IsESICApplicable;
        this.ELCTransactions = this.employeedetails.ELCTransactions.length > 0 ? this.employeedetails.ELCTransactions.filter(a => a.Status == 2) : [];
        var tst = this.ELCTransactions != null && this.ELCTransactions.length > 0 &&
          this.ELCTransactions.find(a => a.IsLatest == true);
        this.spinner = false;
        this.doAppendProfileAvatar();
        this.disableFormControls();
        this.EmitHandler()

      }
      this.spinner = false;
    } catch (error) {
      this.spinner = false;
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY PROFILE DETAILS :', error);

    }



  }

  // POST-DEFINED ACTIVITY
  onChangeDOB(dobDate) {
    this.DOB = dobDate;
  }
  _aadhaar_inputMask(inputstring) {
    let reg = /.{1,7}/
    let string = (inputstring).toString();
    let maskedAadhaarNumber = string.replace(reg, (m) => "X".repeat(m.length));
    return maskedAadhaarNumber;
  }
  _aadhaar_removeinputMask(_OriginalAadhaarNumber) {
    return _OriginalAadhaarNumber;
  }

  onChangeAadhaarNumber(event) {
    this._OriginalAadhaarNumber = event.target.value;
  }
  onChangePanNo(event) {
    this._OrginalPanNo = event.target.value.toUpperCase();
  }

  onChangeMaritalStatus(eventItem) {
    // if (![2, 3].includes(eventItem.id)) {
      this.employeedetails.MarriageDate = null;
      return;
    // }
  }
  icontogglechange() {
    this.icontoggle = !this.icontoggle;
    if (this.icontoggle) {
      this.employeeForm.controls['adhaarnumber'].setValue(this._aadhaar_inputMask(this._OriginalAadhaarNumber));
    } else {
      this.employeeForm.controls['adhaarnumber'].setValue(this._aadhaar_removeinputMask(this._OriginalAadhaarNumber));
    }
  }


  readURL(input) {

    if (input.target.files && input.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.target.files[0]);
      reader.onloadend = (e) => {
        const FileName = input.target.files[0].name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, FileName, 'Profile')
        this.contentmodalurl = reader.result;
        $('#imagePreview').hide();
        $('#imagePreview').fadeIn(650);

      }
    }
  }

  onFileUpload(e) {

    this.loadingScreenService.startLoading();
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

  onChangeGender(genderEvent) {
    this.employeeForm.controls['MaritalStatus'].setValue(null);
    this.maritalStatus = this.utilsHelper.transform(MaritalStatus);
    this.maritalStatus = genderEvent.id == 1
      ? this.maritalStatus.filter(a => a.id != 5)
      : this.maritalStatus.filter(a => a.id != 6);
  }

  doAsyncUpload(filebytes, filename, whichSection) {

    try {

      this.loadingScreenService.startLoading();
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.EmployeeId = this.employeedetails.Id;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.CompanyId;
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

            this.profileImageDocumentId = apiResult.Result;
            if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
              this.employeedetails.CandidateDocuments.forEach(element => {
                // check if lookupDetails has DocumentCategoryist or DocumentTypeList
                if (this.lstlookUpDetails.DocumentCategoryist && this.lstlookUpDetails.DocumentTypeList == undefined) {
                  console.log(this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar'));
                  if (element.DocumentTypeId == this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar').DocumentTypeId) {
                    element.Modetype = UIMode.Delete;
                    if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
                      const index1 = this.new_ProfileAvatarDocument.findIndex(item => item.DocumentId === element.DocumentId);
                      this.new_ProfileAvatarDocument.splice(index1, 1)
                    };
                  }
                } else {
                  if (element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id) {
                    element.Modetype = UIMode.Delete;
                    if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
                      const index1 = this.new_ProfileAvatarDocument.findIndex(item => item.DocumentId === element.DocumentId);
                      this.new_ProfileAvatarDocument.splice(index1, 1)
                    };
                  }
                }
              });
            }
            if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
              if (this.lstlookUpDetails.DocumentCategoryist && this.lstlookUpDetails.DocumentTypeList == undefined &&
                this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar').DocumentTypeId) == true) {
                this.unsavedDocumentLst.push(this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentTypeList.find(a => a.DocumentTypeName == 'ProfileAvatar').DocumentTypeId).DocumentId);
              } else if (this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id) == true) {
                this.unsavedDocumentLst.push(this.new_ProfileAvatarDocument.find(a => a.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id).DocumentId);
              } else {

                let ListDocumentList: CandidateDocuments = new CandidateDocuments();
                ListDocumentList.Id = 0;
                ListDocumentList.CandidateId = this.employeedetails.CandidateId;
                ListDocumentList.IsSelfDocument = false;
                ListDocumentList.DocumentId = this.profileImageDocumentId;
                ListDocumentList.DocumentCategoryId = 0;
                if (this.lstlookUpDetails.DocumentCategoryist && this.lstlookUpDetails.DocumentTypeList == undefined) {
                  ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar').DocumentTypeId;
                } else {
                  ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id;
                }
                ListDocumentList.DocumentNumber = '';
                ListDocumentList.FileName = `profileavatar_${this.employeedetails.FirstName}.png`;
                ListDocumentList.ValidFrom = null;
                ListDocumentList.ValidTill = null;
                ListDocumentList.Status = ApprovalStatus.Approved;
                ListDocumentList.IsOtherDocument = true;
                ListDocumentList.Modetype = UIMode.Edit;
                ListDocumentList.DocumentCategoryName = "";
                ListDocumentList.StorageDetails = null;
                ListDocumentList.EmployeeId = this.employeedetails.Id;
                this.new_ProfileAvatarDocument.push(ListDocumentList);
              }
            } else {
              let ListDocumentList: CandidateDocuments = new CandidateDocuments();
              ListDocumentList.Id = 0;
              ListDocumentList.CandidateId = this.employeedetails.CandidateId;
              ListDocumentList.IsSelfDocument = false;
              ListDocumentList.DocumentId = this.profileImageDocumentId;
              ListDocumentList.DocumentCategoryId = 0;
              if (this.lstlookUpDetails.DocumentCategoryist && this.lstlookUpDetails.DocumentTypeList == undefined) {
                ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar').DocumentTypeId;
              } else {
                ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id;
              }
              ListDocumentList.DocumentNumber = '';
              ListDocumentList.FileName = `profileavatar_${this.employeedetails.FirstName}.png`;
              ListDocumentList.ValidFrom = null;
              ListDocumentList.ValidTill = null;
              ListDocumentList.Status = ApprovalStatus.Approved;
              ListDocumentList.IsOtherDocument = true;
              ListDocumentList.Modetype = UIMode.Edit;
              ListDocumentList.DocumentCategoryName = "";
              ListDocumentList.StorageDetails = null;
              ListDocumentList.EmployeeId = this.employeedetails.Id;
              this.new_ProfileAvatarDocument.push(ListDocumentList);
            }



            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file")
            this.isLoading = true;

          }
          else {

            this.loadingScreenService.stopLoading();
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message)
          }
        } catch (error) {

          this.loadingScreenService.stopLoading();
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to upload! " + error)
        }

      }), ((err) => {

      })

    } catch (error) {

      this.loadingScreenService.stopLoading();
      this.FileName = null;
      this.alertService.showWarning("An error occurred while trying to upload! " + error)
      this.isLoading = true;
    }

  }

  deleteProfileImgFile() {

    this.fileuploadService.deleteObjectStorage((this.profileImageDocumentId)).subscribe((res) => {
      var index = this.unsavedDocumentLst.map(function (el) {
        return el.Id
      }).indexOf(this.DocumentId);
      this.unsavedDocumentLst.splice(index, 1);
      this.profileImageDocumentId = null;
    });

  }


  GetEmployeeRequiredDocumentetails() {

    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.EmployeeDocuments).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let employmentObject: EmployeeDetails = apiR.Result as any;
            this.employeedetails.CandidateDocuments = employmentObject.CandidateDocuments;

            console.log('sss', this.DocumentTypeList, this.employeedetails);

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

  doAppendProfileAvatar() {
    if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
      this.employeedetails.CandidateDocuments.forEach(element => {
        if (this.lstlookUpDetails && this.lstlookUpDetails.DocumentCategoryist != undefined && this.lstlookUpDetails.DocumentCategoryist && this.lstlookUpDetails.DocumentTypeList == undefined) {
          if (this.DocumentTypeList != null && this.DocumentTypeList.length > 0 &&
            element.IsSelfDocument == false && this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar') != undefined && (element.DocumentTypeId == this.DocumentTypeList.find(a => a.DocumentTypeName == 'Profile Avatar').DocumentTypeId) == true) {
            const contentType = this.fileuploadService.getContentType(element.FileName);
            if (contentType === 'application/pdf' || contentType.includes('image')) {
              try {

                this.fileuploadService.getObjectById(element.DocumentId)
                  .subscribe(dataRes => {

                    try {


                      console.log('S3 BUKCKET DATA ::', dataRes);

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
                        this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                        console.log('contentmodalurl', this.contentmodalurl);
                      }
                    } catch (error) {
                      alert(error)
                    }
                  });
              } catch (error) {

                alert('ERROR :: ' + error)
              }

            }
          }
        } else if (this.DocumentTypeList != null && this.DocumentTypeList.length > 0 && element.IsSelfDocument == false && this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar') != undefined && (element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id) == true) {

          var contentType = this.fileuploadService.getContentType(element.FileName);
          if (contentType === 'application/pdf' || contentType.includes('image')) {
            try {

              this.fileuploadService.getObjectById(element.DocumentId)
                .subscribe(dataRes => {

                  try {


                    console.log('S3 BUKCKET DATA ::', dataRes);

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
                      this.contentmodalurl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                      console.log('contentmodalurl', this.contentmodalurl);
                    }
                  } catch (error) {
                    alert(error)
                  }
                });
            } catch (error) {

              alert('ERROR :: ' + error)
            }

          }
        }


      });
    }
  }


  doSaveOrSubmit(isSubmit) {

    try {
      if (this.RoleCode == 'Employee' && this.employeedetails.IsDifferentlyabled && this.employeedetails.DisabilityPercentage >= environment.environment.AmountOfDifferentlyabled && !(this.employeedetails.CandidateDocuments.length > 0 && this.employeedetails.CandidateDocuments.find(a => a.IsDisablityProof))) {
        this.alertService.showWarning("You are required to upload a document for people with other abilities.");
        return;
      }
      if (this._OriginalAadhaarNumber != null && this._OriginalAadhaarNumber != '' && this._OriginalAadhaarNumber != 'NULL') {
        let isnum = /^([0-9X]){12}?$/.test(this._OriginalAadhaarNumber);
        if (isnum == false) {
          return this.alertService.showWarning("Aadhaar Number is invalid or Please match the requested format. (Ex: 1012 3456 7891)");
        }
      }
      if (this._OrginalPanNo != null && this._OrginalPanNo != '' && this._OrginalPanNo != 'NULL') {
        let isValidPan = /[a-zA-Z]{3}[pPcCHhaAbBgGlLfFTtjJ]{1}[a-zA-Z]{1}[0-9]{4}[a-zA-Z]{1}$/.test(this._OrginalPanNo);
        if (!isValidPan) {
          this.alertService.showWarning("PAN Number is invalid or Please match the requested format. (Ex: ABCPD1234E)");
          return;
        }
      }

      this.loadingScreenService.startLoading();

      this.employeedetails.FirstName = this.employeeForm.get('Name').value;
      this.employeedetails.Status = this.employeeForm.get('Status').value;
      this.employeedetails.Gender = this.employeeForm.get('gender').value;
      this.employeedetails.BloodGroup = this.employeeForm.get('bloodGroup').value;
      this.employeedetails.Nationality = this.employeeForm.get('nationality').value;
      this.employeedetails.MaritalStatus = this.employeeForm.get('MaritalStatus').value;
      var dob = new Date(this.employeeForm.get('dateOfBirth').value);

      this.employeedetails.DateOfBirth = moment(dob).format('YYYY-MM-DD');


      if (this.employeedetails.DateOfBirth != null) {
        var birth = new Date(this.employeedetails.DateOfBirth).toLocaleDateString();
        var today = new Date();
        today = new Date(today);
        console.log('today', today);
        var years = moment(birth).diff(today, 'years');
        console.log('years', years.toString());;
        years = Math.abs(years)
        if (years.toString() < '18' || years.toString() == '0' || years < 18 || years == 0) {
          this.alertService.showWarning("The action was blocked. We require candidate to be 18 years old or over. Please confirm your DOJ/DOB")
          return;
        }
      }

      this.employeedetails.Aadhaar = this._OriginalAadhaarNumber == 'NULL' ? null : this._OriginalAadhaarNumber;
      this.employeedetails.PAN = (this.employeeForm.get('PANNO').value).toUpperCase();
      this.employeedetails.UAN = this.employeeForm.get('UAN').value;
      this.employeedetails.ESIC = this.employeeForm.get('ESIC').value;
      this.employeedetails.EmploymentContracts[0]['PFNumber'] = this.employeeForm.get('PFNumber').value;
      this.employeedetails.EmploymentContracts[0].IsESSRequired = this.employeeForm.get('IsESSRequired').value;
      this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail = this.employeeForm.get('email').value;
      this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.employeedetails.IsDifferentlyabled = this.employeeForm.get('IsDifferentlyabled').value;
      this.employeedetails.DisabilityPercentage = this.employeeForm.get('DisabilityPercentage').value;
      if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
        let officialmailId = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2);
        if (officialmailId == undefined && this.employeeForm.get('officialEmail').value) {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.push({
            PrimaryMobile: '',
            PrimaryEmail: this.employeeForm.get('officialEmail').value,
            CommunicationCategoryTypeId: CommunicationCategoryType.Official,
            PrimaryMobileCountryCode: "91",
            AlternateMobile: '',
            AlternateMobileCountryCode: '',
            AlternateEmail: '',
            EmergencyContactNo: '',
            LandlineStd: '',
            LandLine: '',
            LandLineExtension: '',
            PrimaryFax: '',
            AlternateFax: '',
            IsDefault: false
          })
        }
        else {

          // if(this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.filter(i=>i.CommunicationCategoryTypeId == null).length == 0 && this.employeeForm.get('email').value == ""){

          //   var nullObject = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(a=>a.CommunicationCategoryTypeId == null);
          //   nullObject.PrimaryMobile = this.employeeForm.get('mobile').value,
          //   nullObject.PrimaryEmail = this.employeeForm.get('email').value,
          //   nullObject.CommunicationCategoryTypeId = CommunicationCategoryType.Personal,
          //   nullObject.PrimaryMobileCountryCode = "+91",
          //   nullObject.AlternateMobile ='',
          //   nullObject.AlternateMobileCountryCode = '',
          //   nullObject.AlternateEmail = '',
          //   nullObject.EmergencyContactNo = '',
          //   nullObject.LandlineStd= '',
          //   nullObject.LandLine = '',
          //   nullObject.LandLineExtension = '',
          //   nullObject.PrimaryFax = '',
          //   nullObject.AlternateFax = '',
          //   nullObject.IsDefault = true

          // }        


          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2 ? val.PrimaryEmail = this.employeeForm.get('officialEmail').value : null);
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2 ? val.PrimaryMobile = this.employeeForm.get('mobile').value : null);
        }

        let emergencyObj = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 4);
        if (emergencyObj == undefined && (this.employeeForm.get('emergencyContactPersonName').value || this.employeeForm.get('emergencyContactnumber').value)) {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.push({
            CommunicationCategoryTypeId: CommunicationCategoryType.Emergency,
            PrimaryMobile: null,
            PrimaryMobileCountryCode: null,
            AlternateMobile: null,
            AlternateMobileCountryCode: null,
            PrimaryEmail: null,
            AlternateEmail: null,
            EmergencyContactNo: this.employeeForm.get('emergencyContactnumber').value,
            EmergencyContactNoCountryCode: "91",
            EmergencyContactPersonName: this.employeeForm.get('emergencyContactPersonName').value,
            LandlineStd: null,
            LandLine: null,
            LandLineExtension: null,
            PrimaryFax: null,
            AlternateFax: null,
            IsDefault: false
          })
        }
        else {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 4 ? val.EmergencyContactPersonName = this.employeeForm.get('emergencyContactPersonName').value : null);
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 4 ? val.EmergencyContactNo = this.employeeForm.get('emergencyContactnumber').value : null);
        }
      }
      if (this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
        let isExists = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(z => z.CommunicationCategoryTypeId == CommunicationCategoryType.Personal);
        console.log('isExists', isExists);

        if (isExists != undefined) {
          isExists.IsDefault = true;
          isExists.EmergencyContactNoCountryCode = "91",
            isExists.PrimaryMobile = this.employeeForm.get('mobile').value
          isExists.PrimaryEmail = this.employeeForm.get('email').value
        }
      }

      this.employeedetails.EmployeeCommunicationDetails.Modetype = UIMode.Edit;
      console.log('snew_ProfileAvatarDocument', this.new_ProfileAvatarDocument);

      // Profile avatar document objet updation happening here..
      if (this.employeedetails.CandidateDocuments == null || this.employeedetails.CandidateDocuments.length == 0) {
        this.employeedetails.CandidateDocuments = [];
      }
      if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
        this.employeedetails.CandidateDocuments = this.employeedetails.CandidateDocuments.concat(this.new_ProfileAvatarDocument);
      }
      if (this.delete_ProfileAvatarDocument != null && this.delete_ProfileAvatarDocument.length > 0) {
        this.employeedetails.CandidateDocuments = this.employeedetails.CandidateDocuments.concat(this.delete_ProfileAvatarDocument);
      }
      if (this.disabilityDoc != null && this.disabilityDoc.length > 0) {
        this.employeedetails.CandidateDocuments = this.employeedetails.CandidateDocuments.concat(this.disabilityDoc);
      }

      if (this.employeedetails.RelationshipId == 1) {
        this.employeedetails.FatherName = this.employeeForm.get('_relationName').value;
      }

      this.employeedetails.BloodGroup = this.employeedetails.BloodGroup == null ? 0 : this.employeedetails.BloodGroup;
      this.employeedetails.Nationality = this.employeedetails.Nationality == null ? 0 : this.employeedetails.Nationality;
      this.employeedetails.MaritalStatus = this.employeedetails.MaritalStatus == null ? 0 : this.employeedetails.MaritalStatus;


      this.employeedetails.RelationshipName = this.employeeForm.get('_relationName').value;
      this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;


      console.log('test', this.employeedetails);
      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
          console.log('ST ::', data.Status)
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            this.AfterSaveCommitted();
          }
          else {
            this.alertService.showWarning(data.Message);
            return;
          }
        });
      }
    }
    catch (e) {
      console.log('e', e);

    }

  }

  EmitHandler() {

    if (this.employeedetails != null && this.employeedetails != undefined) {
      this.employeedetails.FirstName = this.employeeForm.get('Name').value;
      this.employeedetails.Status = this.employeeForm.get('Status').value;
      this.employeedetails.Gender = this.employeeForm.get('gender').value;
      this.employeedetails.BloodGroup = this.employeeForm.get('bloodGroup').value;
      this.employeedetails.Nationality = this.employeeForm.get('nationality').value;
      this.employeedetails.MaritalStatus = this.employeeForm.get('MaritalStatus').value;

      this.employeedetails.RelationshipName = this.employeeForm.get('_relationName').value;
      var dob = this.employeeForm.get('dateOfBirth').value == null ? null : new Date(this.employeeForm.get('dateOfBirth').value);

      this.employeedetails.DateOfBirth = dob as any == "Invalid Date" ? null : (dob != null ? moment(dob).format('YYYY-MM-DD') : null);
      this.employeedetails.Aadhaar = this._OriginalAadhaarNumber == 'NULL' ? null : this._OriginalAadhaarNumber;
      this.employeedetails.PAN = (this.employeeForm.get('PANNO').value).toUpperCase();
      this.employeedetails.UAN = this.employeeForm.get('UAN').value;
      this.employeedetails.ESIC = this.employeeForm.get('ESIC').value;
      this.employeedetails.EmploymentContracts[0]['PFNumber'] = this.employeeForm.get('PFNumber').value;
      this.employeedetails.EmploymentContracts[0].IsESSRequired = this.employeeForm.get('IsESSRequired').value;
      this.employeedetails.EmployeeCommunicationDetails.LstContactDetails[0].PrimaryEmail = this.employeeForm.get('email').value;
      this.employeedetails.EmploymentContracts[0].Modetype = UIMode.Edit;
      this.employeedetails.IsDifferentlyabled = this.employeeForm.get('IsDifferentlyabled').value;
      this.employeedetails.DisabilityPercentage = this.employeeForm.get('DisabilityPercentage').value;
      this.employeedetails.CustomData1 = this.employeeForm.get('CustomData1').value;
      this.employeedetails.CustomData2 = this.employeeForm.get('CustomData2').value;
      this.employeedetails.CustomData3 = this.employeeForm.get('CustomData3').value;
      this.employeedetails.CustomData4 = this.employeeForm.get('CustomData4').value;
      this.employeedetails.Religion = this.employeedetails.Religion;

      if (this.employeedetails && this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
        let officialmailId = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2);
        if (officialmailId == undefined && this.employeeForm.get('officialEmail').value) {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.push({
            PrimaryMobile: this.employeeForm.get('mobile').value,
            PrimaryEmail: this.employeeForm.get('officialEmail').value,
            CommunicationCategoryTypeId: CommunicationCategoryType.Official,
            PrimaryMobileCountryCode: "91",
            AlternateMobile: '',
            AlternateMobileCountryCode: '',
            AlternateEmail: '',
            EmergencyContactNo: '',
            LandlineStd: '',
            LandLine: '',
            LandLineExtension: '',
            PrimaryFax: '',
            AlternateFax: '',
            IsDefault: true

          })
        }
        else {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2 ? val.PrimaryEmail = this.employeeForm.get('officialEmail').value : null);
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 2 ? val.PrimaryMobile = this.employeeForm.get('mobile').value : null);
        }
        let emergencyObj = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 4);
        if (emergencyObj == undefined && (this.employeeForm.get('emergencyContactPersonName').value || this.employeeForm.get('emergencyContactnumber').value)) {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.push({
            CommunicationCategoryTypeId: CommunicationCategoryType.Emergency,
            PrimaryMobile: null,
            PrimaryMobileCountryCode: null,
            AlternateMobile: null,
            AlternateMobileCountryCode: null,
            PrimaryEmail: null,
            AlternateEmail: null,
            EmergencyContactNo: this.employeeForm.get('emergencyContactnumber').value,
            EmergencyContactNoCountryCode: "91",
            EmergencyContactPersonName: this.employeeForm.get('emergencyContactPersonName').value,
            LandlineStd: null,
            LandLine: null,
            LandLineExtension: null,
            PrimaryFax: null,
            AlternateFax: null,
            IsDefault: false
          })
        }
        else {
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 4 ? val.EmergencyContactPersonName = this.employeeForm.get('emergencyContactPersonName').value : null);
          this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(val => val.CommunicationCategoryTypeId === 4 ? val.EmergencyContactNo = this.employeeForm.get('emergencyContactnumber').value : null);
        }

      }

      if (this.employeedetails.EmployeeCommunicationDetails.LstContactDetails != null && this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.length > 0) {
        let isExists = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails.find(z => z.CommunicationCategoryTypeId == CommunicationCategoryType.Personal);
        console.log('isExists', isExists);

        if (isExists != undefined) {
          isExists.IsDefault = true;
          isExists.EmergencyContactNoCountryCode = "91",
            isExists.PrimaryMobile = this.employeeForm.get('mobile').value
          isExists.PrimaryEmail = this.employeeForm.get('email').value
        }
      }

      // Profile avatar document objet updation happening here..
      if (this.employeedetails.CandidateDocuments == null || this.employeedetails.CandidateDocuments.length == 0) {
        this.employeedetails.CandidateDocuments = [];
      }
      if (this.new_ProfileAvatarDocument != null && this.new_ProfileAvatarDocument.length > 0) {
        this.employeedetails.CandidateDocuments = this.employeedetails.CandidateDocuments.concat(this.new_ProfileAvatarDocument);
      }
      if (this.delete_ProfileAvatarDocument != null && this.delete_ProfileAvatarDocument.length > 0) {
        this.employeedetails.CandidateDocuments = this.employeedetails.CandidateDocuments.concat(this.delete_ProfileAvatarDocument);
      }
      if (this.disabilityDoc != null && this.disabilityDoc.length > 0 && !this.disabilityDoc.some(item => this.employeedetails.CandidateDocuments.includes(item))) {
        this.employeedetails.CandidateDocuments = this.employeedetails.CandidateDocuments.concat(this.disabilityDoc);
      }

      this.employeedetails.EmployeeCommunicationDetails.Modetype = UIMode.Edit;


      // this.employeedetails.EmploymentContracts[0].Category = this.employeedetails.EmploymentContracts[0].Category == null ? 0 : this.employeedetails.EmploymentContracts[0].Category;
      this.employeedetails.EmploymentContracts[0].DepartmentId = this.employeedetails.EmploymentContracts[0].DepartmentId == null ? 0 : this.employeedetails.EmploymentContracts[0].DepartmentId
      this.employeedetails.EmploymentContracts[0].Division = this.employeedetails.EmploymentContracts[0].Division == null ? 0 : this.employeedetails.EmploymentContracts[0].Division
      this.employeedetails.EmploymentContracts[0].Level = this.employeedetails.EmploymentContracts[0].Level == null ? 0 : this.employeedetails.EmploymentContracts[0].Level
      this.employeedetails.EmploymentContracts[0].SubEmploymentType = this.employeedetails.EmploymentContracts[0].SubEmploymentType == null ? 0 : this.employeedetails.EmploymentContracts[0].SubEmploymentType
      // this.employeedetails.EmploymentContracts[0].Category = this.employeedetails.EmploymentContracts[0].Category == null ? 0 : this.employeedetails.EmploymentContracts[0].Category
      this.employeedetails.EmploymentContracts[0].SubEmploymentCategory = this.employeedetails.EmploymentContracts[0].SubEmploymentCategory == null ? 0 : this.employeedetails.EmploymentContracts[0].SubEmploymentCategory;

    }

  }

  communicationChangeHandler(employeeD: EmployeeDetails) {
    console.log("communicationChangeHandler", employeeD)
    this.employeedetails.EmployeeCommunicationDetails = employeeD.EmployeeCommunicationDetails;
  }

  subscribeEmitter() {
    this.EmitHandler();
    this.profileChangeHandler.emit(this.employeedetails);
  }


  ViewRateset(item) {
    if (item.EmployeeRatesets == null || item.EmployeeRatesets.length === 0) {
      this.alertService.showInfo("There is no rateset involved in this transaction!");
      return;
    }
    this.showCurrentRateSet = true;
    this.Current_RateSetList = null;
    // when FBP is updated, show both old and new ratesets
    this.Old_RateSetList = null;
    let isLatestELC = JSON.parse(JSON.stringify(item.EmployeeRatesets.find(a => a.Status == 1)));
    this.Current_RateSetList = isLatestELC && isLatestELC.RatesetProducts ? JSON.parse(JSON.stringify(isLatestELC.RatesetProducts)) : null;
    console.log('VIEW CTC-old/new', this.Old_RateSetList, this.Current_RateSetList);

    this.EffectiveDate_POP = isLatestELC.EffectiveDate as Date;
    this.AnnualSalary_POP = isLatestELC.AnnualSalary;

    if (this.Current_RateSetList == null || this.Current_RateSetList.length == 0) {
      this.alertService.showWarning(">. There seems to be no data available to show");
      return;
    }
    this.visible1 = true;
  }

  close1() {
    this.visible1 = false;
  }

  handleDocUpload(event: any) {
    let ListDocumentList: CandidateDocuments = {} as CandidateDocuments;
    ListDocumentList.Id = 0;
    ListDocumentList.CandidateId = this.employeedetails.CandidateId;
    ListDocumentList.IsSelfDocument = true;
    ListDocumentList.DocumentId = event.DocumentId;
    ListDocumentList.DocumentCategoryId = event.CategoryType[0].Id;
    ListDocumentList.DocumentTypeId = this.DocumentTypeList.find(document => document.DocumentTypeName == "Disability Proof").DocumentTypeId;
    ListDocumentList.DocumentNumber = event.DocumentNumber;
    ListDocumentList.FileName = event.FileName;
    ListDocumentList.ValidFrom = null;
    ListDocumentList.ValidTill = null;
    ListDocumentList.Status = ApprovalStatus.Pending;
    ListDocumentList.IsOtherDocument = true;
    ListDocumentList.Modetype = UIMode.Edit;
    ListDocumentList.DocumentCategoryName = "";
    ListDocumentList.StorageDetails = null;
    ListDocumentList.EmployeeId = this.employeedetails.Id;
    ListDocumentList.IsDisablityProof = true;
    this.disabilityDoc.push(ListDocumentList);
  }

  duplicateCheck() {
    console.log('sss');
    const aadhaarNumber = this.employeeForm.controls['adhaarnumber'].value;

    if (this.utitlityService.isNullOrUndefined(this.employeeForm.get('Name').value) == true) {
      this.alertService.showWarning('Name cannot be left blank. Please provide your name to proceed');
      return;
    }

    if (this.utitlityService.isNullOrUndefined(this.employeeForm.get('gender').value) == true) {
      this.alertService.showWarning('Gender selection is required. Please select your gender to proceed.');
      return;
    }

    else if (this.utitlityService.isNullOrUndefined(this.employeeForm.get('dateOfBirth').value) == true) {
      this.alertService.showWarning('Please enter the Date of Birth');
      return;
    }

    else if (this.utitlityService.isNullOrUndefined(this.employeeForm.get('mobile').value) == true) {
      this.alertService.showWarning('Please enter the Candidate Mobile No.');
      return;
    }
    else if (this.employeeForm.get('mobile').valid == false) {
      this.alertService.showWarning('Mobile No should be minimum 10 characters');
      return;
    }

    else if (this.utitlityService.isNullOrUndefined(this.employeeForm.get('email').value) == true) {
      this.alertService.showWarning('Candidate E-Mail is required');
      return;
    }
    else if (this.employeeForm.get('email').valid == false) {
      this.alertService.showWarning('Please enter valid email (pattern mismatch)');
      return;
    }


    else if (this.isAllenDigital && this.utitlityService.isNullOrUndefined(this.employeeForm.get('adhaarnumber').value) == true) {
      this.alertService.showWarning('Kindly provide the Aadhaar number to proceed.');
      return;
    }

    else if (this.isAllenDigital && typeof aadhaarNumber === 'string' && aadhaarNumber.trim().length !== 12) {
      this.alertService.showWarning('Aadhaar: Please match the requested format (e.g., 2XXX XXXX 1111)');
      return;
    }


    else if (this.isAllenDigital && this.utitlityService.isNullOrUndefined(this.employeeForm.get('PANNO').value) == true) {
      this.alertService.showWarning('Kindly provide the PAN to proceed.');
      return;
    }
    else if (this.isAllenDigital && this.employeeForm.get('PANNO').valid == false) {
      this.alertService.showWarning('PAN : Please match the requested format (e.g., ABCPD1234E)');
      return;
    }

    var date = moment(this.employeeForm.get('dateOfBirth').value);
    if (!date.isValid) {
      this.alertService.showWarning('Please enter valid Date of Birth (DD-MM-YYYY)');
      return;
    } else if (moment(date).isAfter(moment(this.DOBmaxDate), 'day')) {
      this.alertService.showWarning('Please enter valid Date of Birth (DD-MM-YYYY)');
      return;
    }



    try {
      this.loadingScreenService.startLoading();
      this.isInvalidCandidateInformation = false; //
      this.DuplicateCheckMessage = '';
      var duplicateCandidateDetails = new DuplicateCandidateDetails();
      duplicateCandidateDetails.CandidateId = this.EmployeeId == 0 ? 0 : this.EmployeeId;
      duplicateCandidateDetails.EntityId = this.EmployeeId == 0 ? 0 : this.EmployeeId;
      duplicateCandidateDetails.EntityType = EntityType.Employee;

      this.employeeForm.controls['Name'] != null ? duplicateCandidateDetails.FirstName = this.employeeForm.get('Name').value == null || this.employeeForm.get('Name').value == "" ? "" : this.employeeForm.get('Name').value : null;


      this.employeeForm.controls['dateOfBirth'] != null ? duplicateCandidateDetails.dateOfBirth = this.employeeForm.get('dateOfBirth').value == null ? null : this.datePipe.transform(new Date(this.DOB).toString(), "yyyy-MM-dd") : null;
      this.employeeForm.controls['mobile'] != null ? duplicateCandidateDetails.PrimaryMobile = this.employeeForm.get('mobile').value == null || this.employeeForm.get('mobile').value == "" ? "" : this.employeeForm.get('mobile').value : null;
      this.employeeForm.controls['email'] != null ? duplicateCandidateDetails.PrimaryEmail = this.employeeForm.get('email').value == null || this.employeeForm.get('email').value == "" ? "" : this.employeeForm.get('email').value : null;
      this.employeeForm.controls['adhaarnumber'] != null ? duplicateCandidateDetails.Aadhaar = this.employeeForm.get('adhaarnumber').value == null || this.employeeForm.get('adhaarnumber').value == "" ? "" : this.employeeForm.get('adhaarnumber').value : null;
      this.employeeForm.controls['PANNO'] != null ? duplicateCandidateDetails.PAN = this.employeeForm.get('PANNO').value == null || this.employeeForm.get('PANNO').value == "" ? "" : this.employeeForm.get('PANNO').value : null;

      console.log('DUPLICATE DETAILS PYD #009 ::', duplicateCandidateDetails);

      this.onboardingService.ValidateCandidateInformation(duplicateCandidateDetails).subscribe((result) => {
        console.log('result', result);

        let apiResult: apiResult = (result);
        this.alertService.showSuccess("The record was successfully validated.");
        if (apiResult.Status && apiResult.Result != null) {
          this.loadingScreenService.stopLoading();
        } else if (!apiResult.Status && apiResult.Message != null && apiResult.Message != '') {
          this.isInvalidCandidateInformation = true;
          if (apiResult.Message.includes('Record updation failed:')) {
            apiResult.Message = apiResult.Message.replace('Record updation failed:', '');
          }
          this.DuplicateCheckMessage = apiResult.Message;
          this.loadingScreenService.stopLoading();
        } else {
          this.loadingScreenService.stopLoading();
        }
      }, err => {
        this.loadingScreenService.stopLoading();
      })
    } catch (error) {
      this.loadingScreenService.stopLoading();
      console.log('ex error :', error);

    }
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

      if (this.employeeForm.get(field)) {
        this.employeeForm.get(field).disable();
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

  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || window['clipboardData'];
    const pastedText = clipboardData.getData('text');
    if (isNaN(pastedText)) {
      event.preventDefault();
    }
  }

  // reactiveFormDisableEnable(disableFields, controlMode) {
  //   for (let form = 0; form < disableFields.length; form++) {
  //     const element = disableFields[form];
  //     console.log('element', element);

  //     this.employeeForm.controls[element].disable();
  //   }
  // }


  ngOnDestroy() {
    this.subscribeEmitter();
    console.log("communicationChangeHandle employeedetails r", this.employeedetails)
  }


}
