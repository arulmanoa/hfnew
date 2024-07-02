import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { AlertService, EmployeeService, ESSService, FileUploadService, SessionStorage, OnboardingService } from 'src/app/_services/service';
import { Gender, Relationship, BloodGroup, MaritalStatus, GraduationType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { LoginResponses, UIMode } from 'src/app/_services/model';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { UtilityService } from 'src/app/_services/service/utitlity.service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { DatePipe } from '@angular/common';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { DomSanitizer } from '@angular/platform-browser';
import { apiResult } from 'src/app/_services/model/apiResult';
import moment from 'moment';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import * as _ from 'lodash';
import { CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { JoiningKitStatus } from 'src/app/_services/model/Employee/online-joining-kit-model';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as JSZip from 'jszip'; //JSZip

@Component({
  selector: 'app-online-joining-kit',
  templateUrl: './online-joining-kit.component.html',
  styleUrls: ['./online-joining-kit.component.css']
})
export class OnlineJoiningKitComponent implements OnInit {

  spinner: boolean = false;
  index = 0;
  gender: any = [];
  degree: any = [];
  bloodGroup: any = [];
  relationType: any = [];
  maritalStatus: any = [];
  isSameAddress = false;
  isEmployedDropdown: any[] = ['YES', 'NO'];
  clientName: string;
  candidateId: string | number;
  candidateName: string;
  countryCode: any = '91';
  employeedetails: any;
  //form
  personalInformation: FormGroup;
  educationAndWorkFrmGrp: FormGroup;
  panAndAadharFrmGrp: FormGroup;
  familyDetails: FormArray;
  educationDetailsFrmArr: FormArray;
  workexperienceDetailsFrmArr: FormArray;
  formF: FormGroup;
  declarationForm: FormGroup;
  form11PF: FormGroup;
  formNominee1: FormGroup;
  formNominee2: FormGroup;
  govtFormDeclaration: FormGroup;
  govtFormInstruction: FormGroup;
  // session
  _loginSessionDetails: LoginResponses;
  lstlookUpDetails: EmployeeLookUp;
  CompanyId: any = 0;
  UserId: any = 0;
  RoleId: any = 0;
  RoleCode: any;
  ImplementationCompanyId: any = 0;
  BusinessType: any = 0;
  EmployeeId: number = 0;
  FileName: any;
  profileImageDocumentId: any;
  onlineKitDocumentId: any;
  clientLogoLink: any;
  clientminiLogoLink: any;
  // documents
  DocumentTypeList: any[] = [];
  documentTbl = [];
  duplicateDocumentTbl = [];
  DocumentList: any[] = [];
  DocumentCategoryist = [];
  edit_document_lst = [];
  lstDocumentDetails: CandidateDocuments[] = [];
  profileImageUrl = null;
  PANdocumentURL: any;
  PassBookBankdocumentURL: any;
  aadharDocumentURL: any;
  otherDocumentURL: any;
  candidateSignature: any;
  onlinePdfDocumentURL: any;
  isFormEditAllowed: boolean = false;
  innerHtmlContent: any;
  isEmployeeLoggedIn = false;
  joiningKitApproved = false;
  docListImages = [];
  constructor(
    private fb: FormBuilder,
    private alertService: AlertService,
    public sessionService: SessionStorage,
    private utilsHelper: enumHelper,
    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer,
    public essService: ESSService,
    private datePipe: DatePipe,
    private UtilityService: UtilityService,
    private fileuploadService: FileUploadService,
    private onboardingService: OnboardingService,
    private loadingScreenService: LoadingScreenService,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    this.createForm();
  }

  ngOnInit() {
    this.spinner = true;
    this.gender = this.utilsHelper.transform(Gender);
    this.bloodGroup = this.utilsHelper.transform(BloodGroup);
    this.maritalStatus = this.utilsHelper.transform(MaritalStatus);
    this.relationType = this.utilsHelper.transform(Relationship);
    this.degree = this.utilsHelper.transform(GraduationType);
    this.onlineKitDocumentId = 0;
    // get details from session
    this.countryCode = "91";
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.clientLogoLink = 'logo.png';
    if (this._loginSessionDetails.CompanyLogoLink != "" && this._loginSessionDetails.CompanyLogoLink != null && this.BusinessType == 3) {
      let jsonObject = JSON.parse(this._loginSessionDetails.CompanyLogoLink)
      this.clientLogoLink = jsonObject.logo;
      this.clientminiLogoLink = jsonObject.minilogo;
    } else if (this._loginSessionDetails.ClientList != null && this._loginSessionDetails.ClientList.length > 0 && (this.BusinessType == 1 || this.BusinessType == 2)) {
      let isDefualtExist = (this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))));
      if (isDefualtExist != null && isDefualtExist != undefined) {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList.find(a => a.Id == Number(this.sessionService.getSessionStorage("default_SME_ClientId"))).ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      } else {
        let jsonObject = JSON.parse(this._loginSessionDetails.ClientList[0].ClientLogoURL);
        this.clientLogoLink = jsonObject.logo;
        this.clientminiLogoLink = jsonObject.minilogo;
      }
    }
    // to hide extra spaces added for PDF download
    setTimeout(() => {
      $('.showForPrint').hide();
    }, 0);
    // For use in url path implementing
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        var encodedCdx = atob(params["Cdx"]);
        var encodedStatus = atob(params["status"]);
        this.candidateName = '';
        this.clientName = '';
        this.EmployeeId = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.candidateId = Number(encodedCdx) == undefined ? 0 : Number(encodedCdx);
        this.joiningKitApproved = encodedStatus == 'Active' ? false : true;
        this.isFormEditAllowed = false; // form submitted by employee
        this.isEmployeeLoggedIn = false;
        this.employeeService.getJoiningKitDetails(Number(this.candidateId)).subscribe((response) => {
          console.log('getJoiningKitDetails-OPS::', response);
          this.spinner = false;
          if (response.Status && response.Result !== '') {
            const decodeResponse = (JSON.parse(response.Result)); // atob(response.Result);
            this.employeedetails = [];
            this.employeedetails = JSON.parse(decodeResponse[0].JoiningKitHtml)[0];
            this.candidateName = this.employeedetails.FirstName;
            if (this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.clientName) {
              this.clientName = this.employeedetails.EmployeeCommunicationDetails.clientName;
            }
            if (this.employeedetails.EmpFamilyDtls && this.employeedetails.EmpFamilyDtls.length) {
              // calculate age of the family memebers and Gratuity percentage
              this.employeedetails.EmpFamilyDtls.forEach(item => {
                if (item.LstClaims && item.LstClaims.length) {
                  item.PFgratuity = item.LstClaims.find(a => a.ClaimType == 1).Percentage;
                  item.nomineeGratuity = item.LstClaims.find(a => a.ClaimType == 4).Percentage;
                }
                if (item.DOB && item.DOB != "1900-01-01T00:00:00") {
                  const dob = new Date(item.DOB);
                  const timeDiff = Math.abs(Date.now() - dob.getTime());
                  const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
  
                  item.age = moment().diff(new Date(item.DOB), 'years', false);
                  // console.log('AGE/moment', age, item.age);
                }
              });
            }
            this._loadEmpUILookUpDetails().then((r) => {
              this.spinner = false;
              console.log('employee details', this.employeedetails);
              this.loadingScreenService.startLoading();
              this.patchInitialDetailsInForm();

              if (this.employeedetails.EmpFamilyDtls && this.employeedetails.EmpFamilyDtls.length) {
                this.patchFamilyDetailsFrmArr();
              }
              if (this.employeedetails.Qualifications && this.employeedetails.Qualifications.length) {
                this.patchEducationDetailsFrmArr();
              } else {
                this.addEducationDetails();
              }
              if (this.employeedetails.WorkExperiences && this.employeedetails.WorkExperiences.length) {
                this.patchExperienceDetailsFrmArr();
              } else {
                this.addExperienceDetails();
              }
              if (this.employeedetails.CandidateDocuments && this.employeedetails.CandidateDocuments.length) {
                console.log('this.employeedetails.CandidateDocuments', this.employeedetails.CandidateDocuments);
                this.loadDocuments();
              }
              console.log(this.personalInformation.controls);
              console.log(this.govtFormDeclaration.controls);
              this.loadingScreenService.stopLoading();
              this.disableFormControl();
            });
          }
        }, err => {
          this.spinner = false;
          this.loadingScreenService.stopLoading();
          console.log('getJoiningKitDetails ::', err);
        });
      } else {
        this.isEmployeeLoggedIn = true;
        // call apis
        this.loadDataForEmployee();
      }
    });
  }
  // function to load required data for employee login
  loadDataForEmployee() {
    this.spinner = true;
    // remove session items
    sessionStorage.removeItem('_StoreLstinvestment');
    sessionStorage.removeItem('_StoreLstDeductions');
    sessionStorage.removeItem("_StoreLstinvestment_Deleted");
    sessionStorage.removeItem("_StoreLstDeductions_Deleted");
    this.loadingScreenService.startLoading();
    // check status
    this.employeeService.isEmployeeAllowedToEditJoiningKit(this.EmployeeId).subscribe((result) => {
      console.log('result::isEmployeeAllowedToEditJoiningKit::', result);
      this.isFormEditAllowed = false;
      this.spinner = true;
      if (result.Status && result.Result) {
        this.isFormEditAllowed = result.Result == '1' ? true : false;
        this.loadingScreenService.startLoading();
        this.GetEmployeeRequiredDetailsById().then((res) => {
          res == true ?
            this._loadEmpUILookUpDetails().then((r) => {
              this.spinner = false;
              console.log('employee details', this.employeedetails);
              this.loadingScreenService.startLoading();
              this.patchInitialDetailsInForm();

              if (this.employeedetails.EmpFamilyDtls && this.employeedetails.EmpFamilyDtls.length) {
                this.patchFamilyDetailsFrmArr();
              }
              if (this.employeedetails.Qualifications && this.employeedetails.Qualifications.length) {
                this.patchEducationDetailsFrmArr();
              } else {
                this.addEducationDetails();
              }
              if (this.employeedetails.WorkExperiences && this.employeedetails.WorkExperiences.length) {
                this.patchExperienceDetailsFrmArr();
              } else {
                this.addExperienceDetails();
              }
              if (this.employeedetails.CandidateDocuments && this.employeedetails.CandidateDocuments.length) {
                console.log('this.employeedetails.CandidateDocuments', this.employeedetails.CandidateDocuments);
                this.loadDocuments();
              }
              console.log(this.formNominee1.controls);
              console.log(this.formNominee2.controls);
              console.log(this.personalInformation.controls);
              console.log(this.govtFormDeclaration.controls);
              this.disableFormControl();
              this.loadingScreenService.stopLoading();
            })
            : true;
        });
      }
    }, err => {
      this.spinner = false;
      this.loadingScreenService.stopLoading();
      console.log('isEmployeeAllowedToEditJoiningKit ::', err);
    });

  }
  // function to get employee details
  GetEmployeeRequiredDetailsById() {
    this.spinner = true;
    this.loadingScreenService.startLoading();
    const promise = new Promise((resolve, reject) => {
      this.employeeService.getEmployeeDetailsById(this.EmployeeId).subscribe((result) => {
        let apiR: apiResult = result;
        if (apiR.Status == true) {
          if (this.isFormEditAllowed) {
            let empObj: EmployeeDetails = apiR.Result as any;
            this.employeedetails = empObj;
            this.clientName = '';
            this.candidateId = this.employeedetails.CandidateId;
            this.candidateName = this.employeedetails.FirstName;
            this.employeeService.GetEmployeeAddressDetailsById(this.EmployeeId).subscribe((res) => {
              console.log('RES ADDRESS-1', res);
              const addressDetails = JSON.parse(res.Result) as any;
              this.clientName = addressDetails[0].Name;
              this.employeedetails.EmployeeCommunicationDetails.fullAddress = addressDetails[0].Address1 + ',' + addressDetails[0].Address2 + ','
                + addressDetails[0].Address3 + ',' + addressDetails[0].City + ',' + addressDetails[0].StateName + ',' + addressDetails[0].CountryName + ',' + addressDetails[0].Pincode;
              console.log('RES ADDRESS', addressDetails);
              if (this.employeedetails.EmpFamilyDtls && this.employeedetails.EmpFamilyDtls.length) {
                this.employeedetails.EmpFamilyDtls.forEach(item => {
                  // get gratuity percentage
                  if (item.LstClaims && item.LstClaims.length) {
                    item.PFgratuity = item.LstClaims.find(a => a.ClaimType == 1).Percentage;
                    item.nomineeGratuity = item.LstClaims.find(a => a.ClaimType == 4).Percentage;
                  }
                  // calculate age of the family memebers
                  if (item.DOB && item.DOB != "1900-01-01T00:00:00") {
                    const dob = new Date(item.DOB);
                    const timeDiff = Math.abs(Date.now() - dob.getTime());
                    const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);

                    item.age = moment().diff(new Date(item.DOB), 'years', false);
                    // console.log('AGE/moment', age, item.age);
                  }
                });
              }
              resolve(true);
            }, error => {
              resolve(true);
              console.log('ERROR GETTING EMP.ADDRESS DETAILS API: GetEmployeeAddressDetailsForJoiningKit ::', error);
            });
          } else {
            let empObj: EmployeeDetails = apiR.Result as any;
            this.candidateId = empObj.CandidateId;
            this.employeeService.getJoiningKitDetails(Number(this.candidateId)).subscribe((response) => {
              console.log('getJoiningKitDetails ::', response);
              this.candidateName = '';
              this.clientName = '';
              this.spinner = false;
              this.loadingScreenService.stopLoading();
              if (response.Status && response.Result !== '') {
                const data = JSON.parse(response.Result);
                this.employeedetails = [];
                this.employeedetails = JSON.parse(data[0].JoiningKitHtml)[0];
                this.candidateName = this.employeedetails.FirstName;
                if (this.employeedetails.EmployeeCommunicationDetails && this.employeedetails.EmployeeCommunicationDetails.clientName) {
                  this.clientName = this.employeedetails.EmployeeCommunicationDetails.clientName;
                }
                if (this.employeedetails.EmpFamilyDtls && this.employeedetails.EmpFamilyDtls.length) {
                  // calculate age of the family memebers
                  this.employeedetails.EmpFamilyDtls.forEach(item => {
                    // get gratuity percentage
                    if (item.LstClaims && item.LstClaims.length) {
                      item.PFgratuity = item.LstClaims.find(a => a.ClaimType == 1).Percentage;
                      item.nomineeGratuity = item.LstClaims.find(a => a.ClaimType == 4).Percentage;
                    }
                    if (item.DOB && item.DOB != "1900-01-01T00:00:00") {
                      const dob = new Date(item.DOB);
                      const timeDiff = Math.abs(Date.now() - dob.getTime());
                      const age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);

                      item.age = moment().diff(new Date(item.DOB), 'years', false);
                      // console.log('AGE/moment', age, item.age);
                    }
                  });
                }
                resolve(true);
              }
            }, err => {
              this.spinner = false;
              resolve(false);
              this.loadingScreenService.stopLoading();
              console.log('getJoiningKitDetails ::', err);
            });
          }

        } else {
          this.employeedetails = [];
          this.clientName = '';
          this.candidateId = '';
          this.candidateName = '';
          this.alertService.showWarning(`An error occurred while getting employee details`);
          resolve(false);
          return;
        }
      }, err => {
        this.alertService.showWarning(err);
        console.log('ERROR GETTING EMP.DETAILS API: GetEmployeeRequiredDetailsById ::', err);
        reject();
      });
    });
    this.loadingScreenService.stopLoading();
    return promise;
  }
  // function to call lookup details API
  _loadEmpUILookUpDetails() {
    return new Promise((res, rej) => {
      this.loadingScreenService.startLoading();
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
            this.loadingScreenService.stopLoading();
            res(true);
          }
        }, err => {
          this.loadingScreenService.stopLoading();
          rej();
        })
    });
  }
  // function set value for Formcontrol
  patchInitialDetailsInForm() {

    try {
      if (this.employeedetails != null) {
        let status = 'Unmarried';
        if (this.employeedetails.MaritalStatus && this.employeedetails.MaritalStatus !== 0) {
          status = this.maritalStatus.find(a => a.id == this.employeedetails.MaritalStatus).name;
          if (status == 'Single') {
            status = 'Unmarried'
          }
        }
        let relationname = '';
        if (this.employeedetails.FatherName == '' || this.employeedetails.FatherName == null || this.employeedetails.FatherName == 'NULL') {
          if (this.employeedetails.RelationshipId == 3) {
            relationname = this.employeedetails.RelationshipName;
            this.govtFormDeclaration.controls['maritalM'].setValue(true);
            this.govtFormDeclaration.controls['maritalU'].setValue(false);
            this.govtFormDeclaration.controls['maritalW'].setValue(false);

            this.form11PF.controls['spouseNameCheckbox'].setValue(true);
            this.form11PF.controls['fatherNameCheckbox'].setValue(false);
          }
        } else {
          relationname = this.employeedetails.FatherName;
          this.govtFormDeclaration.controls['maritalM'].setValue(false);
          this.govtFormDeclaration.controls['maritalU'].setValue(true);
          this.govtFormDeclaration.controls['maritalW'].setValue(false);

          this.form11PF.controls['spouseNameCheckbox'].setValue(false);
          this.form11PF.controls['fatherNameCheckbox'].setValue(true);
        }
        this.personalInformation.controls['fullName'].setValue(this.employeedetails.FirstName);
        this.personalInformation.controls['maritalStatus'].setValue(this.employeedetails.MaritalStatus !== 0 ? this.employeedetails.MaritalStatus : '');
        this.personalInformation.controls['gender'].setValue(this.employeedetails.Gender);
        this.personalInformation.controls['bloodGroup'].setValue(this.employeedetails.BloodGroup !== 0 ? this.employeedetails.BloodGroup : '');
        this.personalInformation.controls['dateOfBirth'].setValue(new Date(this.employeedetails.DateOfBirth));
        this.personalInformation.controls['fatherName'].setValue((this.employeedetails.FatherName == null || this.employeedetails.FatherName == 'NULL') ? '' : this.employeedetails.FatherName);
        this.personalInformation.controls['employeeCode'].setValue(this.employeedetails.Code);
        this.personalInformation.controls['clientName'].setValue(this.clientName);
        var DOJ = this.employeedetails.EmploymentContracts && this.employeedetails.EmploymentContracts[0] != null && this.employeedetails.EmploymentContracts[0].StartDate && this.employeedetails.EmploymentContracts[0].StartDate != '' ? this.employeedetails.EmploymentContracts[0].StartDate : '';
        this.personalInformation.controls['dateOfJoining'].setValue(new Date(DOJ));

        this.declarationForm.controls['dateOfJoining'].setValue(moment(new Date(DOJ)).format("DD/MM/YYYY"));

        this.govtFormDeclaration.controls['nameInBlock'].setValue(this.employeedetails.FirstName);
        this.govtFormDeclaration.controls['status'].setValue(status);
        this.govtFormDeclaration.controls['genderForGovtForm'].setValue(this.employeedetails.Gender == 2 ? 'F' : 'M');
        this.govtFormDeclaration.controls['DOB'].setValue(moment(new Date(this.employeedetails.DateOfBirth)).format("DD  MM  YY"));
        this.govtFormDeclaration.controls['relationName'].setValue(relationname);
        this.govtFormDeclaration.controls['empCode'].setValue(this.employeedetails.Code);
        this.govtFormDeclaration.controls['DOJ'].setValue(moment(new Date(DOJ)).format("DD  MM  YY"));

        if (this.employeedetails.EmployeeCommunicationDetails) {
          const contactDetails = this.employeedetails.EmployeeCommunicationDetails.LstContactDetails;
          const addressDetails = this.employeedetails.EmployeeCommunicationDetails.fullAddress;
          console.log('communication details', contactDetails, addressDetails);
          if (contactDetails) {
            contactDetails.forEach(el => {
              // set alternate contact number
              if (el.EmergencyContactNo || Number(el.EmergencyContactNo) != Number(0)) {
                this.personalInformation.controls['alternateContactNo'].setValue((Number(el.EmergencyContactNo)));
              }

              // set email value
              if (el.PrimaryEmail) {
                this.personalInformation.controls['email'].setValue(el.PrimaryEmail);
                this.form11PF.controls['emailId'].setValue(el.PrimaryEmail);
                this.govtFormDeclaration.controls['email'].setValue(el.PrimaryEmail);
              }
              // set mobile number
              if (el.PrimaryMobile || Number(el.PrimaryMobile) != Number(0)) {
                this.personalInformation.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
                this.formF.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
                this.declarationForm.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
                this.form11PF.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
                this.formNominee1.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
              }
            });
          } else {
            const el = this.employeedetails.EmployeeCommunicationDetails;
            // set email
            if (el.PrimaryEmail) {
              this.personalInformation.controls['email'].setValue(el.PrimaryEmail);
              this.form11PF.controls['emailId'].setValue(el.PrimaryEmail);
              this.govtFormDeclaration.controls['email'].setValue(el.PrimaryEmail);
            }
            // set mobile number
            if (el.PrimaryMobile || Number(el.PrimaryMobile) != Number(0)) {
              this.personalInformation.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
              this.formF.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
              this.declarationForm.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
              this.form11PF.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
              this.formNominee1.controls['mobileNo'].setValue((Number(el.PrimaryMobile)));
            }
          }
          try {
            if (addressDetails) {

              // present address
              this.personalInformation.controls['presentAddress'] != null ? this.personalInformation.controls['presentAddress'].setValue(addressDetails) : null;
              this.formNominee1.controls['temporaryAddress'] != null ? this.formNominee1.controls['temporaryAddress'].setValue(addressDetails) : null;
              this.govtFormDeclaration.controls['presentAddress'] != null ? this.govtFormDeclaration.controls['presentAddress'].setValue(addressDetails) : null;
              // permanent address
              this.personalInformation.controls['permanantAddress'] != null ? this.personalInformation.controls['permanantAddress'].setValue(addressDetails) : null;
              this.declarationForm.controls['address'] != null ? this.declarationForm.controls['address'].setValue(addressDetails) : '';
              this.govtFormDeclaration.controls['permanentAddress'] != null ? this.govtFormDeclaration.controls['permanentAddress'].setValue(addressDetails) : null;
              this.formNominee1.controls['permanentAddress'] != null ? this.formNominee1.controls['permanentAddress'].setValue(addressDetails) : '';

              this.isSameAddress = true;
            }


          }
          catch (error) { }
        }

        this.panAndAadharFrmGrp.controls['nameInAadhar'].setValue(this.employeedetails.FirstName);
        this.panAndAadharFrmGrp.controls['aadharNumber'].setValue(this.employeedetails.Aadhaar);
        this.panAndAadharFrmGrp.controls['panNo'].setValue((this.employeedetails.PAN == null || this.employeedetails.PAN == 'NULL') ? '' : this.employeedetails.PAN);
        this.panAndAadharFrmGrp.controls['UAN'].setValue((this.employeedetails.UAN == null || this.employeedetails.UAN == 'NULL') ? '' : this.employeedetails.UAN);
        this.panAndAadharFrmGrp.controls['ESI'].setValue((this.employeedetails.ESIC == null || this.employeedetails.ESIC == 'NULL') ? '' : this.employeedetails.ESIC);
        if (this.employeedetails.EmploymentContracts && this.employeedetails.EmploymentContracts.length) {
          this.panAndAadharFrmGrp.controls['PF'].setValue((this.employeedetails.EmploymentContracts[0]['PFNumber'] == null) ? '' : this.employeedetails.EmploymentContracts[0]['PFNumber']);
          this.formNominee1.controls['EPF'].setValue((this.employeedetails.EmploymentContracts[0]['PFNumber'] == null) ? '' : this.employeedetails.EmploymentContracts[0]['PFNumber']);
        }


        if (this.employeedetails.lstEmployeeBankDetails && this.employeedetails.lstEmployeeBankDetails.length) {
          const defaultBankDetails = this.employeedetails.lstEmployeeBankDetails.filter(a => a.IsDefault)[0];
          this.panAndAadharFrmGrp.controls['bankAccountNo'].setValue(defaultBankDetails.AccountNumber);
          this.panAndAadharFrmGrp.controls['bankIfscCode'].setValue(defaultBankDetails.IdentifierValue);
          this.panAndAadharFrmGrp.controls['bankName'].setValue(defaultBankDetails.BankName);
          this.panAndAadharFrmGrp.controls['bankBranch'].setValue(defaultBankDetails.BankBranchName);

          this.form11PF.controls['bankAcctNo'].setValue(defaultBankDetails.AccountNumber);
          this.form11PF.controls['bankIfsc'].setValue(defaultBankDetails.IdentifierValue);

          this.formNominee1.controls['accountNo'].setValue(defaultBankDetails.AccountNumber);

          this.formNominee1.controls['empCode'].setValue(this.employeedetails.Code);

        }

        this.formF.controls['empCode'].setValue(this.employeedetails.Code);
        this.formF.controls['empName'].setValue(this.employeedetails.FirstName);

        this.formNominee2.controls['declarationName'].setValue(this.employeedetails.FirstName);

        this.declarationForm.controls['fullName'].setValue(this.employeedetails.FirstName);
        this.declarationForm.controls['status'].setValue(status);
        this.declarationForm.controls['gender'].setValue(this.gender.find(a => a.id == this.employeedetails.Gender).name);
        this.declarationForm.controls['empCode'].setValue(this.employeedetails.Code);


        this.form11PF.controls['empName'].setValue(this.employeedetails.FirstName);
        this.form11PF.controls['relationName'].setValue(relationname);
        this.form11PF.controls['status'].setValue(status);
        this.form11PF.controls['DOJCurrent'].setValue(moment(DOJ).format('DD/MM/YYYY'));
        this.form11PF.controls['gender'].setValue(this.gender.find(a => a.id == this.employeedetails.Gender).name);
        this.form11PF.controls['DOB'].setValue(moment(this.employeedetails.DateOfBirth).format('DD/MM/YYYY'));
        this.form11PF.controls['PANnumber'].setValue((this.employeedetails.PAN == null || this.employeedetails.PAN == 'NULL') ? '' : this.employeedetails.PAN);
        this.form11PF.controls['aadharNumber'].setValue(this.employeedetails.Aadhaar);

        this.formNominee1.controls['fullName'].setValue(this.employeedetails.FirstName);
        this.formNominee1.controls['relationName'].setValue(relationname);
        this.formNominee1.controls['status'].setValue(status);
        this.formNominee1.controls['DOJ'].setValue(moment(DOJ).format('DD/MM/YYYY'));
        this.formNominee1.controls['gender'].setValue(this.gender.find(a => a.id == this.employeedetails.Gender).name);
        this.formNominee1.controls['DOB'].setValue(moment(this.employeedetails.DateOfBirth).format('DD/MM/YYYY'));

        if (this.isFormEditAllowed && this.employeedetails.EmpFamilyDtls && this.employeedetails.EmpFamilyDtls.length) {
          this.employeedetails.EmpFamilyDtls.forEach((item, idx) => {
            if (idx === 4) {
              this.formF.controls['nominee5Name'].setValue(item.Name);
              this.formF.controls['nominee5Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
              this.formF.controls['nominee5Age'].setValue(item.age);
              this.formF.controls['nominee5Gratuity'].setValue(item.nomineeGratuity);

              this.formNominee2.controls['familyMember5Name'].setValue(item.Name);
              this.formNominee2.controls['familyMember5Address'].setValue('');
              this.formNominee2.controls['familyMember5DOB'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee2.controls['familyMember5Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
            } else if (idx === 3) {
              this.formF.controls['nominee4Name'].setValue(item.Name);
              this.formF.controls['nominee4Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
              this.formF.controls['nominee4Age'].setValue(item.age);
              this.formF.controls['nominee4Gratuity'].setValue(item.nomineeGratuity);

              this.formNominee2.controls['familyMember4Name'].setValue(item.Name);
              this.formNominee2.controls['familyMember4Address'].setValue('');
              this.formNominee2.controls['familyMember4DOB'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee2.controls['familyMember4Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
            } else if (idx === 2) {
              this.formF.controls['nominee3Name'].setValue(item.Name);
              this.formF.controls['nominee3Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
              this.formF.controls['nominee3Age'].setValue(item.age);
              this.formF.controls['nominee3Gratuity'].setValue(item.nomineeGratuity);

              this.formNominee2.controls['familyMember3Name'].setValue(item.Name);
              this.formNominee2.controls['familyMember3Address'].setValue('');
              this.formNominee2.controls['familyMember3DOB'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee2.controls['familyMember3Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
            } if (idx === 1) {
              this.formF.controls['nominee2Name'].setValue(item.Name);
              this.formF.controls['nominee2Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
              this.formF.controls['nominee2Age'].setValue(item.age);
              this.formF.controls['nominee2Gratuity'].setValue(item.nomineeGratuity);

              this.formNominee2.controls['familyMember2Name'].setValue(item.Name);
              this.formNominee2.controls['familyMember2Address'].setValue('');
              this.formNominee2.controls['familyMember2DOB'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee2.controls['familyMember2Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
            } else {
              this.formF.controls['nominee1Name'].setValue(item.Name);
              this.formF.controls['nominee1Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
              this.formF.controls['nominee1Age'].setValue(item.age);
              this.formF.controls['nominee1Gratuity'].setValue(item.nomineeGratuity);

              this.formNominee1.controls['nomineeNameAddress'].setValue(item.Name);
              this.formNominee1.controls['nomineeRelationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);
              this.formNominee1.controls['nomineeDob'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee1.controls['nomineeAmt'].setValue(item.PFgratuity);
              this.formNominee1.controls['nomineeGuardian'].setValue('');

              this.formNominee2.controls['familyMember1Name'].setValue(item.Name);
              this.formNominee2.controls['familyMember1Address'].setValue('');
              this.formNominee2.controls['familyMember1DOB'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee2.controls['familyMember1Relationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);

              this.formNominee2.controls['EPSNomineeNameAddress'].setValue(item.Name);
              this.formNominee2.controls['EPSNomineeDob'].setValue(item.DOB == "1900-01-01T00:00:00" ? '' : moment(item.DOB).format('DD-MM-YYYY'));
              this.formNominee2.controls['EPSNomineeRelationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);

              this.govtFormDeclaration.controls['nomineeName'].setValue(item.Name);
              this.govtFormDeclaration.controls['nomineeRelationship'].setValue(this.relationType.find(a => a.id == item.RelationshipId).name);

            }
          });
        } 
        
        if ( this.employeedetails.formDetails &&  this.employeedetails.formDetails.length) {
          const formDetailsTemp = this.employeedetails.formDetails[0];
          if (formDetailsTemp && formDetailsTemp.formF) {
            this.formF.controls['nominee5Name'].setValue(formDetailsTemp.formF.nominee5Name);
            this.formF.controls['nominee5Relationship'].setValue(formDetailsTemp.formF.nominee5Relationship);
            this.formF.controls['nominee5Age'].setValue(formDetailsTemp.formF.nominee5Age);
            this.formF.controls['nominee5Gratuity'].setValue(formDetailsTemp.formF.nominee5Gratuity);

            this.formF.controls['nominee4Name'].setValue(formDetailsTemp.formF.nominee4Name);
            this.formF.controls['nominee4Relationship'].setValue(formDetailsTemp.formF.nominee4Name);
            this.formF.controls['nominee4Age'].setValue(formDetailsTemp.formF.nominee4Name);
            this.formF.controls['nominee4Gratuity'].setValue(formDetailsTemp.formF.nominee4Gratuity);

            this.formF.controls['nominee3Name'].setValue(formDetailsTemp.formF.nominee3Name);
            this.formF.controls['nominee3Relationship'].setValue(formDetailsTemp.formF.nominee3Relationship);
            this.formF.controls['nominee3Age'].setValue(formDetailsTemp.formF.nominee3Age);
            this.formF.controls['nominee3Gratuity'].setValue(formDetailsTemp.formF.nominee3Gratuity);

            this.formF.controls['nominee2Name'].setValue(formDetailsTemp.formF.nominee2Name);
            this.formF.controls['nominee2Relationship'].setValue(formDetailsTemp.formF.nominee2Relationship);
            this.formF.controls['nominee2Age'].setValue(formDetailsTemp.formF.nominee2Age);
            this.formF.controls['nominee2Gratuity'].setValue(formDetailsTemp.formF.nominee2Gratuity);

            this.formF.controls['nominee1Name'].setValue(formDetailsTemp.formF.nominee1Name);
            this.formF.controls['nominee1Relationship'].setValue(formDetailsTemp.formF.nominee1Relationship);
            this.formF.controls['nominee1Age'].setValue(formDetailsTemp.formF.nominee1Age);
            this.formF.controls['nominee1Gratuity'].setValue(formDetailsTemp.formF.nominee1Gratuity);
          }

          if (formDetailsTemp && formDetailsTemp.formNominee2) {
            this.formNominee2.controls['familyMember5Name'].setValue(formDetailsTemp.formNominee2.familyMember5Name);
            this.formNominee2.controls['familyMember5Address'].setValue(formDetailsTemp.formNominee2.familyMember5Address);
            this.formNominee2.controls['familyMember5DOB'].setValue(formDetailsTemp.formNominee2.familyMember5DOB);
            this.formNominee2.controls['familyMember5Relationship'].setValue(formDetailsTemp.formNominee2.familyMember5Relationship);
          
            
  
            this.formNominee2.controls['familyMember4Name'].setValue(formDetailsTemp.formNominee2.familyMember4Name);
            this.formNominee2.controls['familyMember4Address'].setValue(formDetailsTemp.formNominee2.familyMember4Address);
            this.formNominee2.controls['familyMember4DOB'].setValue(formDetailsTemp.formNominee2.familyMember4DOB);
            this.formNominee2.controls['familyMember4Relationship'].setValue(formDetailsTemp.formNominee2.familyMember4Relationship);
          
            
  
            this.formNominee2.controls['familyMember3Name'].setValue(formDetailsTemp.formNominee2.familyMember3Name);
            this.formNominee2.controls['familyMember3Address'].setValue(formDetailsTemp.formNominee2.familyMember3Address);
            this.formNominee2.controls['familyMember3DOB'].setValue(formDetailsTemp.formNominee2.familyMember3DOB);
            this.formNominee2.controls['familyMember3Relationship'].setValue(formDetailsTemp.formNominee2.familyMember3Relationship);
          
            
  
            this.formNominee2.controls['familyMember2Name'].setValue(formDetailsTemp.formNominee2.familyMember2Name);
            this.formNominee2.controls['familyMember2Address'].setValue(formDetailsTemp.formNominee2.familyMember2Address);
            this.formNominee2.controls['familyMember2DOB'].setValue(formDetailsTemp.formNominee2.familyMember2DOB);
            this.formNominee2.controls['familyMember2Relationship'].setValue(formDetailsTemp.formNominee2.familyMember2Relationship);
            
            this.formNominee2.controls['familyMember1Name'].setValue(formDetailsTemp.formNominee2.familyMember1Name);
            this.formNominee2.controls['familyMember1Address'].setValue(formDetailsTemp.formNominee2.familyMember1Address);
            this.formNominee2.controls['familyMember1DOB'].setValue(formDetailsTemp.formNominee2.familyMember1DOB);
            this.formNominee2.controls['familyMember1Relationship'].setValue(formDetailsTemp.formNominee2.familyMember1Relationship);
  
            this.formNominee2.controls['EPSNomineeNameAddress'].setValue(formDetailsTemp.formNominee2.EPSNomineeNameAddress);
            this.formNominee2.controls['EPSNomineeDob'].setValue(formDetailsTemp.formNominee2.EPSNomineeDob);
            this.formNominee2.controls['EPSNomineeRelationship'].setValue(formDetailsTemp.formNominee2.EPSNomineeRelationship);

            this.formNominee2.controls['declarationPlace'].setValue(formDetailsTemp.formNominee2.declarationPlace);
            
          }

          if (formDetailsTemp && formDetailsTemp.formNominee1) {
            this.formNominee1.controls['relationName'].setValue(formDetailsTemp.formNominee1.relationName);
            this.formNominee1.controls['EPS'].setValue(formDetailsTemp.formNominee1.EPS);
            this.formNominee1.controls['nomineeNameAddress'].setValue(formDetailsTemp.formNominee1.nomineeNameAddress);
            this.formNominee1.controls['nomineeRelationship'].setValue(formDetailsTemp.formNominee1.nomineeRelationship);
            this.formNominee1.controls['nomineeDob'].setValue(formDetailsTemp.formNominee1.nomineeDob);
            this.formNominee1.controls['nomineeAmt'].setValue(formDetailsTemp.formNominee1.nomineeAmt);
            this.formNominee1.controls['nomineeGuardian'].setValue(formDetailsTemp.formNominee1.nomineeGuardian);
          }

          if (formDetailsTemp && formDetailsTemp.declarationForm) {
            this.declarationForm.controls['religion'].setValue(formDetailsTemp.declarationForm.religion);
            this.declarationForm.controls['department'].setValue(formDetailsTemp.declarationForm.department);
            this.declarationForm.controls['designation'].setValue(formDetailsTemp.declarationForm.designation);
            this.declarationForm.controls['village'].setValue(formDetailsTemp.declarationForm.village);
            this.declarationForm.controls['thana'].setValue(formDetailsTemp.declarationForm.thana);
            this.declarationForm.controls['subDivision'].setValue(formDetailsTemp.declarationForm.subDivision);
            this.declarationForm.controls['postOffice'].setValue(formDetailsTemp.declarationForm.postOffice);
            this.declarationForm.controls['state'].setValue(formDetailsTemp.declarationForm.state);
            this.declarationForm.controls['district'].setValue(formDetailsTemp.declarationForm.district);
            this.declarationForm.controls['witness1Name'].setValue(formDetailsTemp.declarationForm.witness1Name);
            this.declarationForm.controls['witness2Name'].setValue(formDetailsTemp.declarationForm.witness2Name);
            this.declarationForm.controls['employerDesignataion'].setValue(formDetailsTemp.declarationForm.employerDesignataion);
            this.declarationForm.controls['employerReferenceNo'].setValue(formDetailsTemp.declarationForm.employerReferenceNo);
            this.declarationForm.controls['place'].setValue(formDetailsTemp.declarationForm.place);
          }

          if (formDetailsTemp && formDetailsTemp.form11PF) {
            this.form11PF.controls['earlierPF'].setValue(formDetailsTemp.form11PF.earlierPF);
            this.form11PF.controls['earlierPension'].setValue(formDetailsTemp.form11PF.earlierPension);
            this.form11PF.controls['previousCompanyNameUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyNameUnExempted);
            this.form11PF.controls['previousCompanyUANUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyUANUnExempted);
            this.form11PF.controls['previousCompanyPFUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyPFUnExempted);
            this.form11PF.controls['previousCompanyDOJUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyDOJUnExempted);
            this.form11PF.controls['previousCompanyDOLUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyDOLUnExempted);
            this.form11PF.controls['previousCompanySchemeUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanySchemeUnExempted);
            this.form11PF.controls['previousCompanyPPOUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyPPOUnExempted);
            this.form11PF.controls['previousCompanyNCPUnExempted'].setValue(formDetailsTemp.form11PF.previousCompanyNCPUnExempted);

            this.form11PF.controls['previousCompanyNameExempted'].setValue(formDetailsTemp.form11PF.previousCompanyNameExempted);
            this.form11PF.controls['previousCompanyUANExempted'].setValue(formDetailsTemp.form11PF.previousCompanyUANExempted);
            this.form11PF.controls['previousCompanyPFExempted'].setValue(formDetailsTemp.form11PF.previousCompanyPFExempted);
            this.form11PF.controls['previousCompanyDOJExempted'].setValue(formDetailsTemp.form11PF.previousCompanyDOJExempted);
            this.form11PF.controls['previousCompanyDOLExempted'].setValue(formDetailsTemp.form11PF.previousCompanyDOLExempted);
            this.form11PF.controls['previousCompanySchemeExempted'].setValue(formDetailsTemp.form11PF.previousCompanySchemeExempted);

            this.form11PF.controls['internationState'].setValue(formDetailsTemp.form11PF.internationState);
            this.form11PF.controls['passportNumber'].setValue(formDetailsTemp.form11PF.passportNumber);
            this.form11PF.controls['passportValidity'].setValue(formDetailsTemp.form11PF.passportValidity);
            this.form11PF.controls['relationName'].setValue(formDetailsTemp.form11PF.relationName);
            this.form11PF.controls['fatherNameCheckbox'].setValue(formDetailsTemp.form11PF.fatherNameCheckbox ? formDetailsTemp.form11PF.fatherNameCheckbox : true);
            this.form11PF.controls['spouseNameCheckbox'].setValue(formDetailsTemp.form11PF.spouseNameCheckbox ? formDetailsTemp.form11PF.spouseNameCheckbox : false);
          }

          if (formDetailsTemp && formDetailsTemp.govtFormDeclaration) {
            this.govtFormDeclaration.controls['insuranceNo'].setValue(formDetailsTemp.govtFormDeclaration.insuranceNo);
            this.govtFormDeclaration.controls['maritalM'].setValue(formDetailsTemp.govtFormDeclaration.maritalM ? formDetailsTemp.govtFormDeclaration.maritalM : true);
            this.govtFormDeclaration.controls['maritalU'].setValue(formDetailsTemp.govtFormDeclaration.maritalU ? formDetailsTemp.govtFormDeclaration.maritalU : false);
            this.govtFormDeclaration.controls['maritalW'].setValue(formDetailsTemp.govtFormDeclaration.maritalW ? formDetailsTemp.govtFormDeclaration.maritalW : false);
            this.govtFormDeclaration.controls['employerNameaddress'].setValue(formDetailsTemp.govtFormDeclaration.employerNameaddress);
            this.govtFormDeclaration.controls['previousInsuranceNo'].setValue(formDetailsTemp.govtFormDeclaration.previousInsuranceNo);
            this.govtFormDeclaration.controls['previousEmployerNameAddr'].setValue(formDetailsTemp.govtFormDeclaration.previousEmployerNameAddr);
            this.govtFormDeclaration.controls['branchOffice'].setValue(formDetailsTemp.govtFormDeclaration.branchOffice);
            this.govtFormDeclaration.controls['dispensary'].setValue(formDetailsTemp.govtFormDeclaration.dispensary);
            this.govtFormDeclaration.controls['nomineeName'].setValue(formDetailsTemp.govtFormDeclaration.nomineeName);
            this.govtFormDeclaration.controls['nomineeRelationship'].setValue(formDetailsTemp.govtFormDeclaration.nomineeRelationship);
            this.govtFormDeclaration.controls['nomineeAddress'].setValue(formDetailsTemp.govtFormDeclaration.nomineeAddress);

            this.govtFormDeclaration.controls['familyMember1Sno'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1Sno);
            this.govtFormDeclaration.controls['familyMember1Name'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1Name);
            this.govtFormDeclaration.controls['familyMember1DOB'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1DOB);
            this.govtFormDeclaration.controls['familyMember1Relationship'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1Relationship);
            this.govtFormDeclaration.controls['familyMember1ResidingYes'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1ResidingYes);
            this.govtFormDeclaration.controls['familyMember1ResidingNo'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1ResidingNo);
            this.govtFormDeclaration.controls['familyMember1ResidenceTown'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1ResidenceTown);
            this.govtFormDeclaration.controls['familyMember1ResidenceState'].setValue(formDetailsTemp.govtFormDeclaration.familyMember1ResidenceState);

            this.govtFormDeclaration.controls['familyMember2Sno'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2Sno);
            this.govtFormDeclaration.controls['familyMember2Name'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2Name);
            this.govtFormDeclaration.controls['familyMember2DOB'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2DOB);
            this.govtFormDeclaration.controls['familyMember2Relationship'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2Relationship);
            this.govtFormDeclaration.controls['familyMember2ResidingYes'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2ResidingYes);
            this.govtFormDeclaration.controls['familyMember2ResidingNo'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2ResidingNo);
            this.govtFormDeclaration.controls['familyMember2ResidenceTown'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2ResidenceTown);
            this.govtFormDeclaration.controls['familyMember2ResidenceState'].setValue(formDetailsTemp.govtFormDeclaration.familyMember2ResidenceState);

            this.govtFormDeclaration.controls['familyMember3Sno'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3Sno);
            this.govtFormDeclaration.controls['familyMember3Name'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3Name);
            this.govtFormDeclaration.controls['familyMember3DOB'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3DOB);
            this.govtFormDeclaration.controls['familyMember3Relationship'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3Relationship);
            this.govtFormDeclaration.controls['familyMember3ResidingYes'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3ResidingYes);
            this.govtFormDeclaration.controls['familyMember3ResidingNo'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3ResidingNo);
            this.govtFormDeclaration.controls['familyMember3ResidenceTown'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3ResidenceTown);
            this.govtFormDeclaration.controls['familyMember3ResidenceState'].setValue(formDetailsTemp.govtFormDeclaration.familyMember3ResidenceState);

            this.govtFormDeclaration.controls['esiName'].setValue(formDetailsTemp.govtFormDeclaration.esiName);
            this.govtFormDeclaration.controls['esiInsuranceNo'].setValue(formDetailsTemp.govtFormDeclaration.esiInsuranceNo);
            this.govtFormDeclaration.controls['esiDOJ'].setValue(formDetailsTemp.govtFormDeclaration.esiDOJ);
            this.govtFormDeclaration.controls['esiBranchOffice'].setValue(formDetailsTemp.govtFormDeclaration.esiBranchOffice);
            this.govtFormDeclaration.controls['esiDispensary'].setValue(formDetailsTemp.govtFormDeclaration.esiDispensary);

          }
        }

      }
      this.loadingScreenService.stopLoading();
    } catch (error) {
      this.loadingScreenService.stopLoading();
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY PROFILE DETAILS :', error);
    }

  }

  get g() { return this.personalInformation.controls; }

  get e() { return this.educationAndWorkFrmGrp.get('educationDetailsFrmArr') as FormArray; }

  get w() { return this.educationAndWorkFrmGrp.get('workexperienceDetailsFrmArr') as FormArray; }

  get f() { return this.panAndAadharFrmGrp.controls; }

  createForm() {
    this.personalInformation = this.fb.group({
      fullName: [''],
      fatherName: [''],
      employeeCode: [null],
      clientName: [''],
      email: [''],
      mobileNo: [null],
      alternateContactNo: [null],
      dateOfBirth: [null],
      dateOfJoining: [null],
      bloodGroup: [''],
      gender: [''],
      maritalStatus: [''],
      presentAddress: [null],
      permanantAddress: [null],
      familyDetails: this.fb.array([])
    });

    this.educationAndWorkFrmGrp = this.fb.group({
      educationDetailsFrmArr: this.fb.array([]),
      workexperienceDetailsFrmArr: this.fb.array([])
    });

    this.panAndAadharFrmGrp = this.fb.group({
      nameInAadhar: [''],
      aadharNumber: [''],
      panNo: [null],
      bankAccountNo: [''],
      bankIfscCode: [''],
      bankName: [null],
      bankBranch: [null],
      UAN: [null],
      PF: [null],
      ESI: ['']
    });

    this.formF = this.fb.group({
      empCode: [''],
      mobileNo: [''],
      to: [''],
      empName: [''],
      nominee1Name: [''],
      nominee1Relationship: [''],
      nominee1Age: [''],
      nominee1Gratuity: [''],
      nominee2Name: [''],
      nominee2Relationship: [''],
      nominee2Age: [''],
      nominee2Gratuity: [''],
      nominee3Name: [''],
      nominee3Relationship: [''],
      nominee3Age: [''],
      nominee3Gratuity: [''],
      nominee4Name: [''],
      nominee4Relationship: [''],
      nominee4Age: [''],
      nominee4Gratuity: [''],
      nominee5Name: [''],
      nominee5Relationship: [''],
      nominee5Age: [''],
      nominee5Gratuity: [''],
    });

    this.declarationForm = this.fb.group({
      empCode: [''],
      mobileNo: [''],
      fullName: [''],
      gender: [''],
      religion: [''],
      status: [''],
      department: [''],
      designation: [''],
      dateOfJoining: [''],
      address: [''],
      village: [''],
      thana: [''],
      subDivision: [''],
      postOffice: [''],
      district: [''],
      state: [''],
      witnessCommonSign: [''],
      witness1Name: [''],
      witness1Sign: [''],
      witness2Name: [''],
      witness2Sign: [''],
      place:[''],
      employerReferenceNo: [''],
      employerDesignataion: [''],
      date: [moment(new Date()).format('DD-MM-YYYY')],
    });

    this.form11PF = this.fb.group({
      empName: [''],
      fatherNameCheckbox: [true],
      spouseNameCheckbox: [false],
      relationName: [''],
      DOB: [''],
      gender: [''],
      status: [''],
      emailId: [''],
      mobileNo: [''],
      DOJCurrent: [''],
      bankAcctNo: [''],
      bankIfsc: [''],
      aadharNumber: [''],
      PANnumber: [''],
      earlierPF:[''],
      earlierPension:[''],
      previousCompanyNameUnExempted: [''],
      previousCompanyUANUnExempted: [''],
      previousCompanyPFUnExempted: [''],
      previousCompanyDOJUnExempted: [''],
      previousCompanyDOLUnExempted: [''],
      previousCompanySchemeUnExempted: [''],
      previousCompanyPPOUnExempted: [''],
      previousCompanyNCPUnExempted: [''],
      previousCompanyNameExempted: [''],
      previousCompanyUANExempted: [''],
      previousCompanyPFExempted: [''],
      previousCompanyDOJExempted: [''],
      previousCompanyDOLExempted: [''],
      previousCompanySchemeExempted: [''],
      previousCompanyNCPExempted: [''],
      internationalWorker: [''],
      internationState: [''],
      passportNumber: [''],
      passportValidity: ['']
    });

    this.formNominee1 = this.fb.group({
      fullName: [''],
      empCode: [''],
      mobileNo: [''],
      relationName: [''],
      DOB: [''],
      DOJ: [''],
      gender: [''],
      status: [''],
      accountNo: [''],
      permanentAddress: [''],
      temporaryAddress: [''],
      EPS: [''],
      EPF: [''],
      nomineeNameAddress: [''],
      nomineeRelationship: [''],
      nomineeDob: [''],
      nomineeAmt: [''],
      nomineeGuardian: ['']
    });
    this.formNominee2 = this.fb.group({
      familyMember1Name: [''],
      familyMember1Address: [''],
      familyMember1DOB: [''],
      familyMember1Relationship: [''],
      familyMember2Name: [''],
      familyMember2Address: [''],
      familyMember2DOB: [''],
      familyMember2Relationship: [''],
      familyMember3Name: [''],
      familyMember3Address: [''],
      familyMember3DOB: [''],
      familyMember3Relationship: [''],
      familyMember4Name: [''],
      familyMember4Address: [''],
      familyMember4DOB: [''],
      familyMember4Relationship: [''],
      familyMember5Name: [''],
      familyMember5Address: [''],
      familyMember5DOB: [''],
      familyMember5Relationship: [''],
      EPSNomineeNameAddress: [''],
      EPSNomineeRelationship: [''],
      EPSNomineeDob: [''],
      date: [moment(new Date()).format('DD-MM-YYYY')],
      declarationName: [''],
      declarationPlace: ['']
    });
    this.govtFormDeclaration = this.fb.group({
      insuranceNo: [''],
      nameInBlock: [''],
      relationName: [''],
      DOB: [''],
      status: [''],
      maritalM:[true],
      maritalU:[false],
      maritalW:[false],
      genderForGovtForm: [''],
      presentAddress: [''],
      permanentAddress: [''],
      branchOffice: [''],
      dispensary: [''],
      empCode: [''],
      DOJ: [''],
      employerNameaddress: [''],
      previousInsuranceNo: [''],
      previousEmployeeCode: [''],
      previousEmployerNameAddr: [''],
      email: [''],
      nomineeName: [''],
      nomineeRelationship: [''],
      nomineeAddress: [''],
      familyMember1Sno: [''],
      familyMember1Name: [''],
      familyMember1DOB: [''],
      familyMember1Relationship: [''],
      familyMember1ResidingYes: [''],
      familyMember1ResidingNo: [''],
      familyMember1ResidenceTown: [''],
      familyMember1ResidenceState: [''],
      familyMember2Sno: [''],
      familyMember2Name: [''],
      familyMember2DOB: [''],
      familyMember2Relationship: [''],
      familyMember2ResidingYes: [''],
      familyMember2ResidingNo: [''],
      familyMember2ResidenceTown: [''],
      familyMember2ResidenceState: [''],
      familyMember3Sno: [''],
      familyMember3Name: [''],
      familyMember3DOB: [''],
      familyMember3Relationship: [''],
      familyMember3ResidingYes: [''],
      familyMember3ResidingNo: [''],
      familyMember3ResidenceTown: [''],
      familyMember3ResidenceState: [''],
      esiName: [''],
      esiInsuranceNo: [''],
      esiDOJ: [''],
      esiBranchOffice: [''],
      esiDispensary: [''],
      validity: [''],
      date: [moment(new Date()).format('DD-MM-YYYY')],
    });
    this.govtFormInstruction = this.fb.group({

    });
  }

  onIndexChange(event: number): void {
    this.index = event;
  }

  onCheckedRelation(e, comingFrom) {
    if (comingFrom == 'spouse') {
      this.form11PF.controls['spouseNameCheckbox'].setValue(true);
      this.form11PF.controls['fatherNameCheckbox'].setValue(false);
    } else {
      this.form11PF.controls['spouseNameCheckbox'].setValue(false);
      this.form11PF.controls['fatherNameCheckbox'].setValue(true);
    }
    console.log('<-- change spouse/father-->', comingFrom, this.form11PF.controls['spouseNameCheckbox'].value, this.form11PF.controls['fatherNameCheckbox'].value);
  }

  onCheckedMaritalStatus(e, comingFrom) {
    if (comingFrom == 'U') {
      this.govtFormDeclaration.controls['maritalU'].setValue(true);
      this.govtFormDeclaration.controls['maritalM'].setValue(false);
      this.govtFormDeclaration.controls['maritalW'].setValue(false);
    } else if (comingFrom == 'W') {
      this.govtFormDeclaration.controls['maritalW'].setValue(true);
      this.govtFormDeclaration.controls['maritalU'].setValue(false);
      this.govtFormDeclaration.controls['maritalM'].setValue(false);
    } else {
      this.govtFormDeclaration.controls['maritalW'].setValue(false);
      this.govtFormDeclaration.controls['maritalU'].setValue(false);
      this.govtFormDeclaration.controls['maritalM'].setValue(true);
    }
    console.log('<-- on change W/M/U-->', comingFrom, this.govtFormDeclaration.controls['maritalW'].value, this.govtFormDeclaration.controls['maritalM'].value, this.govtFormDeclaration.controls['maritalU'].value);
  }

  pre(): void {
    this.index -= 1;
  }

  next(): void {
    // this.downloadAsPDF();
    this.index += 1;
  }

  getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  onChangeRelationship(e) {}

  // Function to submit online kit by employee
  submitOnlineForm(): void {
    this.isFormEditAllowed = false;
    this.loadingScreenService.startLoading();
    try {
      this.updateOnlineJoiningKitAPI(JoiningKitStatus.Submitted, '', '', 0);
    } catch (err) {
      this.loadingScreenService.stopLoading();
      console.log('error in submitOnlineForm API::', err);
    }
  }
  // Function to create JSON required to save data
  createEmployeeDetailsJson() {
    const empDetailsArr = [];
    try {
      const EmployeeCommunicationDetails = {
        EmergencyContactNo: this.personalInformation.get('alternateContactNo').value,
        PrimaryEmail: this.personalInformation.get('email').value,
        PrimaryMobile: this.personalInformation.get('mobileNo').value,
        clientName: this.clientName,
        fullAddress: this.personalInformation.get('permanantAddress').value,
      };

      const otherDetailArr = [];
      const otherDetail = {
        PFNumber: this.panAndAadharFrmGrp.get('PF').value,
        StartDate: this.personalInformation.controls['dateOfJoining'].value
      }
      otherDetailArr.push(otherDetail);

      let bankDetails = [];
      const bankObj = {
        AccountNumber: this.panAndAadharFrmGrp.get('bankAccountNo').value,
        IdentifierValue: this.panAndAadharFrmGrp.get('bankIfscCode').value,
        BankName: this.panAndAadharFrmGrp.get('bankName').value,
        BankBranchName: this.panAndAadharFrmGrp.get('bankBranch').value,
        IsDefault: true
      }
      bankDetails.push(bankObj);

      let familyDetails = [];
      for (let val of this.personalInformation.get('familyDetails').value) {
        const famDetObj = {
          Name: val.relationName,
          DOB: val.relationDOB,
          RelationshipId: val.relationship,
        }
        familyDetails.push(famDetObj);
      }

      let qualification = [];
      for (let val of this.educationAndWorkFrmGrp.get('educationDetailsFrmArr').value) {
        const eduObj = {
          EducationDegree: val.degree,
          InstitutionName: val.institutionName,
          YearOfPassing: val.passYear,
          ScoringValue: val.score,
          majorSubject: val.majorSubject
        }
        qualification.push(eduObj);
      }

      let workExperience = [];
      for (let val of this.educationAndWorkFrmGrp.get('workexperienceDetailsFrmArr').value) {
        const expObj = {
          CompanyName: val.orgName,
          StartDate: val.periodfrom != '' ? new Date(val.periodfrom) : null,
          EndDate: val.periodTo != '' ? new Date(val.periodTo) : null,
          DesignationHeld: val.designationDOJ,
          designationLast: val.designationLast,
          reportingTo: val.reportingTo,
          WorkLocation: val.location,
          totalYear: val.totalYear
        }
        workExperience.push(expObj);
      }

      let formDetails = [];
      const formF = {
        nominee1Name: this.formF.get('nominee1Name').value,
        nominee1Relationship: this.formF.get('nominee1Relationship').value,
        nominee1Age: this.formF.get('nominee1Age').value,
        nominee1Gratuity: this.formF.get('nominee1Gratuity').value,

        nominee2Name: this.formF.get('nominee2Name').value,
        nominee2Relationship: this.formF.get('nominee2Relationship').value,
        nominee2Age: this.formF.get('nominee2Age').value,
        nominee2Gratuity: this.formF.get('nominee2Gratuity').value,

        nominee3Name: this.formF.get('nominee3Name').value,
        nominee3Relationship: this.formF.get('nominee3Relationship').value,
        nominee3Age: this.formF.get('nominee3Age').value,
        nominee3Gratuity: this.formF.get('nominee3Gratuity').value,

        nominee4Name: this.formF.get('nominee4Name').value,
        nominee4Relationship: this.formF.get('nominee4Relationship').value,
        nominee4Age: this.formF.get('nominee4Age').value,
        nominee4Gratuity: this.formF.get('nominee4Gratuity').value,

        nominee5Name: this.formF.get('nominee5Name').value,
        nominee5Relationship: this.formF.get('nominee5Relationship').value,
        nominee5Age: this.formF.get('nominee5Age').value,
        nominee5Gratuity: this.formF.get('nominee5Gratuity').value
      };
      const declarationForm = {
        religion: this.declarationForm.get('religion').value,
        department: this.declarationForm.get('department').value,
        designation: this.declarationForm.get('designation').value,
        village: this.declarationForm.get('village').value,
        thana: this.declarationForm.get('thana').value,
        subDivision: this.declarationForm.get('subDivision').value,
        postOffice: this.declarationForm.get('postOffice').value,
        state: this.declarationForm.get('state').value,
        district: this.declarationForm.get('district').value,
        place: this.declarationForm.get('place').value,
        witness1Name: this.declarationForm.get('witness1Name').value,
        witness2Name: this.declarationForm.get('witness2Name').value,
        employerReferenceNo: this.declarationForm.get('employerReferenceNo').value,
        employerDesignataion: this.declarationForm.get('employerDesignataion').value
      };
      const form11PF = {
        relationName: this.form11PF.get('relationName').value,
        fatherNameCheckbox: this.form11PF.get('fatherNameCheckbox').value,
        earlierPF: this.form11PF.get('earlierPF').value,
        spouseNameCheckbox: this.form11PF.get('spouseNameCheckbox').value,
        earlierPension: this.form11PF.get('earlierPension').value,
        previousCompanyNameUnExempted: this.form11PF.get('previousCompanyNameUnExempted').value,
        previousCompanyUANUnExempted: this.form11PF.get('previousCompanyUANUnExempted').value,
        previousCompanyPFUnExempted: this.form11PF.get('previousCompanyPFUnExempted').value,
        previousCompanyDOJUnExempted: this.form11PF.get('previousCompanyDOJUnExempted').value,
        previousCompanyDOLUnExempted: this.form11PF.get('previousCompanyDOLUnExempted').value,
        previousCompanySchemeUnExempted: this.form11PF.get('previousCompanySchemeUnExempted').value,
        previousCompanyPPOUnExempted: this.form11PF.get('previousCompanyPPOUnExempted').value,
        previousCompanyNCPUnExempted: this.form11PF.get('previousCompanyNCPUnExempted').value,

        previousCompanyNameExempted: this.form11PF.get('previousCompanyNameExempted').value,
        previousCompanyUANExempted: this.form11PF.get('previousCompanyUANExempted').value,
        previousCompanyPFExempted: this.form11PF.get('previousCompanyPFExempted').value,
        previousCompanyDOJExempted: this.form11PF.get('previousCompanyDOJExempted').value,
        previousCompanyDOLExempted: this.form11PF.get('previousCompanyDOLExempted').value,
        previousCompanySchemeExempted: this.form11PF.get('previousCompanySchemeExempted').value,
        previousCompanyNCPExempted: this.form11PF.get('previousCompanyNCPExempted').value,

        internationState: this.form11PF.get('internationState').value,
        passportNumber: this.form11PF.get('passportNumber').value,
        passportValidity: this.form11PF.get('passportValidity').value
      }
      const formNominee1 = {
        relationName : this.formNominee1.get('relationName').value,
        EPS : this.formNominee1.get('EPS').value,
        nomineeNameAddress: this.formNominee1.get('nomineeNameAddress').value,
        nomineeRelationship: this.formNominee1.get('nomineeRelationship').value,
        nomineeDob: this.formNominee1.get('nomineeDob').value,
        nomineeAmt: this.formNominee1.get('nomineeAmt').value,
        nomineeGuardian: this.formNominee1.get('nomineeGuardian').value,
      };

      const formNominee2 = {
        familyMember1Name: this.formNominee2.get('familyMember1Name').value,
        familyMember1Address: this.formNominee2.get('familyMember1Address').value,
        familyMember1DOB: this.formNominee2.get('familyMember1DOB').value,
        familyMember1Relationship: this.formNominee2.get('familyMember1Relationship').value,

        familyMember2Name: this.formNominee2.get('familyMember2Name').value,
        familyMember2Address: this.formNominee2.get('familyMember2Address').value,
        familyMember2DOB: this.formNominee2.get('familyMember2DOB').value,
        familyMember2Relationship: this.formNominee2.get('familyMember2Relationship').value,
        
        familyMember3Name: this.formNominee2.get('familyMember3Name').value,
        familyMember3Address: this.formNominee2.get('familyMember3Address').value,
        familyMember3DOB: this.formNominee2.get('familyMember3DOB').value,
        familyMember3Relationship: this.formNominee2.get('familyMember3Relationship').value,

        familyMember4Name: this.formNominee2.get('familyMember4Name').value,
        familyMember4Address: this.formNominee2.get('familyMember4Address').value,
        familyMember4DOB: this.formNominee2.get('familyMember4DOB').value,
        familyMember4Relationship: this.formNominee2.get('familyMember4Relationship').value,

        familyMember5Name: this.formNominee2.get('familyMember5Name').value,
        familyMember5Address: this.formNominee2.get('familyMember5Address').value,
        familyMember5DOB: this.formNominee2.get('familyMember5DOB').value,
        familyMember5Relationship: this.formNominee2.get('familyMember5Relationship').value,

        EPSNomineeNameAddress : this.formNominee2.get('EPSNomineeNameAddress').value,
        EPSNomineeDob: this.formNominee2.get('EPSNomineeDob').value,
        EPSNomineeRelationship: this.formNominee2.get('EPSNomineeRelationship').value,
        declarationName: this.formNominee2.get('declarationName').value,
        declarationPlace: this.formNominee2.get('declarationPlace').value
      };

      const govtFormDeclaration = {
        insuranceNo: this.govtFormDeclaration.get('insuranceNo').value,
        maritalM: this.govtFormDeclaration.get('maritalM').value,
        maritalU: this.govtFormDeclaration.get('maritalU').value,
        maritalW: this.govtFormDeclaration.get('maritalW').value,
        employerNameaddress: this.govtFormDeclaration.get('employerNameaddress').value,
        previousInsuranceNo: this.govtFormDeclaration.get('previousInsuranceNo').value,
        previousEmployerNameAddr: this.govtFormDeclaration.get('previousEmployerNameAddr').value,
        branchOffice:  this.govtFormDeclaration.get('branchOffice').value,
        dispensary: this.govtFormDeclaration.get('dispensary').value,
        nomineeName: this.govtFormDeclaration.get('nomineeName').value,
        nomineeRelationship: this.govtFormDeclaration.get('nomineeRelationship').value,
        nomineeAddress: this.govtFormDeclaration.get('nomineeAddress').value,

        familyMember1Sno: this.govtFormDeclaration.get('familyMember1Sno').value,
        familyMember1Name: this.govtFormDeclaration.get('familyMember1Name').value,
        familyMember1DOB: this.govtFormDeclaration.get('familyMember1DOB').value,
        familyMember1Relationship: this.govtFormDeclaration.get('familyMember1Relationship').value,
        familyMember1ResidingYes: this.govtFormDeclaration.get('familyMember1ResidingYes').value,
        familyMember1ResidingNo: this.govtFormDeclaration.get('familyMember1ResidingNo').value,
        familyMember1ResidenceTown: this.govtFormDeclaration.get('familyMember1ResidenceTown').value,
        familyMember1ResidenceState: this.govtFormDeclaration.get('familyMember1ResidenceState').value,
        
        familyMember2Sno: this.govtFormDeclaration.get('familyMember2Sno').value,
        familyMember2Name: this.govtFormDeclaration.get('familyMember2Name').value,
        familyMember2DOB: this.govtFormDeclaration.get('familyMember2DOB').value,
        familyMember2Relationship: this.govtFormDeclaration.get('familyMember2Relationship').value,
        familyMember2ResidingYes: this.govtFormDeclaration.get('familyMember2ResidingYes').value,
        familyMember2ResidingNo: this.govtFormDeclaration.get('familyMember2ResidingNo').value,
        familyMember2ResidenceTown: this.govtFormDeclaration.get('familyMember2ResidenceTown').value,
        familyMember2ResidenceState: this.govtFormDeclaration.get('familyMember2ResidenceState').value,

        familyMember3Sno: this.govtFormDeclaration.get('familyMember3Sno').value,
        familyMember3Name: this.govtFormDeclaration.get('familyMember3Name').value,
        familyMember3DOB: this.govtFormDeclaration.get('familyMember3DOB').value,
        familyMember3Relationship: this.govtFormDeclaration.get('familyMember3Relationship').value,
        familyMember3ResidingYes: this.govtFormDeclaration.get('familyMember3ResidingYes').value,
        familyMember3ResidingNo: this.govtFormDeclaration.get('familyMember3ResidingNo').value,
        familyMember3ResidenceTown: this.govtFormDeclaration.get('familyMember3ResidenceTown').value,
        familyMember3ResidenceState: this.govtFormDeclaration.get('familyMember3ResidenceState').value,

        esiName: this.govtFormDeclaration.get('esiName').value,
        esiInsuranceNo: this.govtFormDeclaration.get('esiInsuranceNo').value,
        esiDOJ: this.govtFormDeclaration.get('esiDOJ').value,
        esiBranchOffice: this.govtFormDeclaration.get('esiBranchOffice').value,
        esiDispensary: this.govtFormDeclaration.get('esiDispensary').value
      };

      formDetails.push({
        formF: formF,
        declarationForm: declarationForm,
        form11PF: form11PF,
        formNominee1: formNominee1,
        formNominee2: formNominee2,
        govtFormDeclaration: govtFormDeclaration
      });

      let getRelationName = '';
      if (this.personalInformation.get('fatherName').value != this.form11PF.controls['relationName'].value) {
        getRelationName = '';
      } else {
        this.relationType.find(a => a.name == 'Father').id;
      }
      const employeeObj = {
        Id: this.employeedetails.Id,
        FirstName: this.personalInformation.get('fullName').value,
        LastName: this.employeedetails.LastName,
        PhotoStorage: this.employeedetails.PhotoStorage,
        DateOfBirth: new Date(this.personalInformation.get('dateOfBirth').value),
        Gender: this.personalInformation.controls['gender'].value,
        Nationality: this.employeedetails.Nationality,
        CountryOfOrigin: this.employeedetails.CountryOfOrigin,
        MaritalStatus: this.personalInformation.get('maritalStatus').value,
        BloodGroup: this.personalInformation.get('bloodGroup').value,
        IsDifferentlyabled: this.employeedetails.IsDifferentlyabled,
        DisabilityPercentage: this.employeedetails.DisabilityPercentage,
        Status: this.employeedetails.Status,
        CandidateId: this.employeedetails.CandidateId,
        PersonId: this.employeedetails.PersonId,
        Code: this.personalInformation.get('employeeCode').value,
        ClientEmployeeCode: this.employeedetails.ClientEmployeeCode,
        TransitionId: this.employeedetails.TransitionId,
        EmployeeObjectData: this.employeedetails.EmployeeObjectData,
        ELCTransactions: [],
        EmpFamilyDtls: familyDetails,
        Modetype: this.employeedetails.Modetype,
        PersonDetails: this.employeedetails.PersonDetails,
        lstEmployeeBankDetails: bankDetails,
        EmploymentContracts: otherDetailArr,
        CandidateDocuments: this.employeedetails.CandidateDocuments,
        LstEmployeeHousePropertyDetails: [],
        LstemployeeHouseRentDetails: [],
        LstemployeeInvestmentDeductions: [],
        LstemployeeOtherIncomeSources: [],
        LstemploymentDetails: this.employeedetails.LstemploymentDetails,
        FatherName: this.personalInformation.get('fatherName').value,
        PAN: this.panAndAadharFrmGrp.get('panNo').value,
        UAN: this.panAndAadharFrmGrp.get('UAN').value,
        ESIC: this.panAndAadharFrmGrp.get('ESI').value,
        Aadhaar: this.panAndAadharFrmGrp.get('aadharNumber').value,
        EmployeeCommunicationDetails: EmployeeCommunicationDetails,
        LstEmployeeLetterTransactions: [],
        Qualifications: qualification,
        WorkExperiences: workExperience,
        EmployeeInvestmentMaster: [],
        LstEmployeeTaxExemptionDetails: [],
        EmployeeRatesets: [],
        RelationshipName: getRelationName,
        RelationshipId: this.employeedetails.RelationshipId,
        formDetails: formDetails
      };
      empDetailsArr.push(employeeObj);
      console.log('TEMP OBJ', empDetailsArr);
      return empDetailsArr;
    } catch (error) {
      console.log('ERROR WHILE SAVING --->', error);
    }
  }
  // Function to approve or reject online kit by OPS
  approvalRejectionFn(action) {
    console.log(action);
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: '<p>Remarks</p>',
      animation: false,
      allowEscapeKey: false,
      showCancelButton: true,
      input: 'textarea',
      inputPlaceholder: 'Type your comments here...',
      inputAttributes: {
        autocorrect: 'off',
        autocapitalize: 'on',
        maxlength: '200',
        'aria-label': 'Type your comment here',
      },
      allowOutsideClick: false,
      inputValidator: (value) => {
        if (value.length >= 200) {
          return 'Maximum 200 characters allowed.'
        }
        if (!value && action == 'REJECT') {
          return 'You need to write something!'
        }
      },

    }).then((inputValue) => {
      if (inputValue.value) {
        this.loadingScreenService.startLoading();
        if (action === 'APPROVE') {
          this.savePdfDocument().then((res) => {
            console.log('calling update api for approval');
            this.updateOnlineJoiningKitAPI(JoiningKitStatus.Approved, this.UserId, inputValue.value, this.onlineKitDocumentId);
          });
        } else {
          this.updateOnlineJoiningKitAPI(JoiningKitStatus.Rejected, '', '', 0);
        }
      }
    });
  }
  // API call to update joining kit status in DB
  updateOnlineJoiningKitAPI(kitStatus: JoiningKitStatus, reviewedBy: any, remarks: string, documentId: number) {
    const data = this.createEmployeeDetailsJson();
    const jsonString = JSON.stringify(data, this.getCircularReplacer());
    const payloadData = {
      CandidateId: Number(this.candidateId),
      HTML: jsonString, // btoa(html),
      status: kitStatus,
      ReviewedBy: reviewedBy,
      Remarks: remarks,
      DocumentId: documentId
    };
    console.log('::: *update payload* :::', Number(this.candidateId), data);
    this.employeeService.updateOnlineJoiningKit(payloadData).subscribe((response) => {
      console.log('::: *updateOnlineJoiningKit response* :::', response);
      this.loadingScreenService.stopLoading();
      if (response.Status) {
        this.alertService.showSuccess('Submitted successfully !');
        if (kitStatus != JoiningKitStatus.Submitted) {
          this.redirectToMainOJKPageLayout();
        }
      } else {
        this.alertService.showWarning('There is some issue . Please try again later !');
        if (kitStatus != JoiningKitStatus.Submitted) {
          this.redirectToMainOJKPageLayout();
        }
      }
    }, err => {
      this.alertService.showWarning(err);
      this.loadingScreenService.stopLoading();
      console.log('error in updateOnlineJoiningKit API::', err);
    });
  }

  onSectionChange(sectionId: number) {
    this.index = sectionId;
  }

  scrollTo(section) {
    document.querySelector('#' + section).scrollIntoView();
  }

  redirectToMainOJKPageLayout() {
    this.router.navigateByUrl('app/listing/ui/getJoiningKits');
  }


  // Function to read profile image file 
  readURL(input) {
    if (input.target.files && input.target.files[0]) {
      const reader = new FileReader();
      reader.readAsDataURL(input.target.files[0]);
      reader.onloadend = (e) => {
        const FileName = input.target.files[0].name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, FileName, 'Profile').then((res) => {
          console.log('base 64', FileUrl);
          this.profileImageUrl = reader.result;
        });
        console.log('profileImageUrl', this.profileImageUrl);

      }
    }
  }

  // Function to load documents and show in last part
  loadDocuments() {
    this.PANdocumentURL = null;
    this.PassBookBankdocumentURL = null;
    this.aadharDocumentURL = null;
    this.otherDocumentURL = null;
    this.onlinePdfDocumentURL = null;
    const requiredDocumentsToShow = ['Aadhaar(Front and Back Copy need to be attached)', 'Cancelled Cheque', 'PAN'];
    this.employeedetails.CandidateDocuments.forEach(item => {
      const DocId = item.DocumentId;
      this.docListImages = [];
     
      if (requiredDocumentsToShow.includes(item.DocumentTypeName)) {
        this.fileuploadService.getObjectById(DocId).subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            return;
          }
          var objDtls = dataRes.Result;
          console.log(objDtls);
          var zip = new JSZip();
          let urll = 'data:application/zip;base64,' + encodeURIComponent(objDtls.Content);
          const zipFileUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          zip.loadAsync(objDtls.Content, { base64: true }).then((contents) => {
            Object.keys(contents.files).forEach((filename) => {
              if (filename) {
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  obj2['DocumentTypeName'] = item.DocumentTypeName;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docListImages.push(obj3);
                  if (item.DocumentTypeName == 'CandidateSignature' || item.DocumentTypeName == 'Signature') {
                    this.candidateSignature = this.sanitizer.bypassSecurityTrustResourceUrl(result['ImageURL']);
                  }
                  console.log('docList ::::', this.docListImages);
                 
                  this.loadingScreenService.stopLoading();
                });
              }
            });
          });
        });
      } else {
        console.log('CandidateDocuments-ITEM', item);
        const contentType = this.fileuploadService.getContentType(item.FileName);
        if (item.DocumentTypeName == 'CandidateSignature' || item.DocumentTypeName == 'Signature') {
          this.fileuploadService.getObjectById(item.DocumentId).subscribe(dataRes => {
            try {
              console.log('candidateSignature DATA::', dataRes);
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
                this.candidateSignature = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                console.log('candidateSignature', this.candidateSignature);
              }
            } catch (error) {
              console.log(error)
            }
          });
        } else if (item.DocumentTypeName == 'Profile Avatar' || item.DocumentTypeName == 'Profile') {
          this.fileuploadService.getObjectById(item.DocumentId).subscribe(dataRes => {
            try {
              console.log('PROFILE BUKCKET DATA ::', dataRes);
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
                this.profileImageUrl = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
                console.log('profileImageUrl', this.profileImageUrl);
              }
            } catch (error) {
              console.log(error);
            }
          });
        }
      }
    });

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
          let contentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
          console.log(' DOCUMENT URL :', contentURL);
          res({ ContentType: contentType, ImageURL: contentURL })
        }
      }
    })


    return promise;
  }

  // Function to upload file
  doAsyncUpload(filebytes, filename, whichSection) {
    const promise = new Promise((resolve, reject) => {
      try {
        this.loadingScreenService.startLoading();
        let objStorage = new ObjectStorageDetails();
        objStorage.Id = 0;
        objStorage.CandidateId = Number(this.candidateId);
        objStorage.EmployeeId = Number(this.EmployeeId);
        objStorage.ClientContractCode = "";
        objStorage.ClientCode = "";
        objStorage.CompanyCode = this.CompanyId;
        objStorage.ClientContractId = this.employeedetails.EmploymentContracts[0].ClientContractId;
        objStorage.ClientId = this.employeedetails.EmploymentContracts[0].ClientId;
        objStorage.CompanyId = this.CompanyId;
        objStorage.Status = true;
        objStorage.Content = filebytes;
        objStorage.SizeInKB = 12;
        objStorage.ObjectName = filename;
        objStorage.OriginalObjectName = filename;
        objStorage.Type = 0;
        objStorage.ObjectCategoryName = whichSection == 'ONLINE JOINING KIT' ? "EmpTransactions" : "Proofs";

        this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
          let apiResult: apiResult = (res);
          console.log('UPLOAD ObjectStorage API:::', apiResult);
          try {
            if (apiResult.Status && apiResult.Result != "") {
              whichSection == 'ONLINE JOINING KIT' ? this.onlineKitDocumentId = apiResult.Result : this.profileImageDocumentId = apiResult.Result;
              // if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
              //   this.employeedetails.CandidateDocuments.forEach(element => {
              //     if (element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').DocumentTypeId) {
              //       element.Modetype = UIMode.Delete;
              //     }
              //   });
              // }
              resolve(true);
              this.loadingScreenService.stopLoading();
              console.log("Awesome..., You have successfully uploaded this file");
              // this.alertService.showSuccess("Awesome..., You have successfully uploaded this file");
            } else {
              this.loadingScreenService.stopLoading();
              this.FileName = null;
              reject();
              this.alertService.showWarning("An error occurred while trying to upload! " + apiResult.Message);
            }
          } catch (error) {
            this.loadingScreenService.stopLoading();
            this.FileName = null;
            reject();
            this.alertService.showWarning("An error occurred while trying to upload! " + error);
          }
        }), ((err) => {
          reject();
          this.alertService.showWarning("An error occurred while trying to upload! " + err);
        })
      } catch (error) {
        reject();
        this.loadingScreenService.stopLoading();
        this.FileName = null;
        this.alertService.showWarning("An error occurred while trying to upload! " + error);
      }
    })
    return promise;
  }

  onChangeDOB(e) {
    if(e) {
      console.log('DOB', e);
    }
  }

  onChangeDOJ(e) {
    if(e) {
      console.log('DOJ', e);
    }
  }

  onChangeRelationDOB(e) {
    if(e) {
      console.log('relation-DOB', e);
    }
  }

  onChangeYearOfPassing(e) {
    if(e) {
      console.log('passing-year', e);
    }
  }

  onChangeToPeriodExperience(e) {
    if(e) {
      console.log('period to', e);
    }
  }

  onChangeFromPeriodExperience(e) {
    if(e) {
      console.log('period-from', e);
    }
  }

  onChangePanNo(evt) {
    if(evt) {
      console.log('pan no', evt);
    }
  }

  onSameAddressPresentChanged(value: boolean) {
    this.isSameAddress = value;

    if (this.isSameAddress) {
      this.personalInformation.controls['permanantAddress'] != null ? this.personalInformation.controls['permanantAddress'].setValue(this.personalInformation.get('presentAddress').value) : null;
    } else {
      this.personalInformation.controls['permanantAddress'] != null ? this.personalInformation.controls['permanantAddress'].setValue(null) : null;
    }
  }

  createFamilyDetailsFormArray(): FormGroup {
    return this.fb.group({
      relationName: '',
      relationship: '',
      relationDOB: null,
      relationAge: '',
      relationAadharNo: '',
      relationEmployed: 'NO'
    });
  }

  addFamilyDetails(): void {
    this.familyDetails = this.personalInformation.get('familyDetails') as FormArray;
    this.familyDetails.push(this.createFamilyDetailsFormArray());
  }

  patchFamilyDetailsFrmArr() {
    this.familyDetails = this.personalInformation.get('familyDetails') as FormArray;
    this.employeedetails.EmpFamilyDtls.map((item: any) => {
      const familyForm = this.fb.group({
        relationName: item.Name,
        relationship: item.RelationshipId,
        relationDOB: item.DOB == null || item.DOB == "" || item.DOB == "1900-01-01T00:00:00" ? null : moment(item.DOB).format('DD-MM-YYYY'),
        relationAge: item.age,
        relationAadharNo: '',
        relationEmployed: item.IsEmployed === false ? 'NO' : 'YES'
      });
      this.familyDetails.push(familyForm);
    });
    // this.employeedetails.EmpFamilyDtls.forEach((item: any) => {
    //   this.familyDetails.push(this.fb.group({
    //     relationName: item.Name,
    //     relationship: item.RelationshipId,
    //     relationDOB: item.DOB == "" || item.DOB == "1900-01-01T00:00:00" ? null : moment(item.DOB).format('DD-MM-YYYY'),
    //     relationAge: item.age,
    //     relationAadharNo: '',
    //     relationEmployed: item.IsEmployed === false ? 'NO' : 'YES'
    //   }));
    // });
  }

  createExperienceFormArray(): FormGroup {
    return this.fb.group({
      orgName: '',
      periodfrom: null,
      periodTo: null,
      totalYear: '',
      designationDOJ: '',
      designationLast: '',
      reportingTo: '',
      location: ''
    });
  }

  addExperienceDetails(): void {
    this.workexperienceDetailsFrmArr = this.educationAndWorkFrmGrp.get('workexperienceDetailsFrmArr') as FormArray;
    this.workexperienceDetailsFrmArr.push(this.createExperienceFormArray());
  }

  patchExperienceDetailsFrmArr() {
    this.employeedetails.WorkExperiences.map((item: any) => {
      const start = new Date(item.StartDate).getTime();
      const end = new Date(item.EndDate).getTime();
      const timeDiff = Math.abs(start - end);
      const years = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
      const expForm = this.fb.group({
        orgName: item.CompanyName,
        periodfrom: item.StartDate && item.StartDate != '' ? new Date(item.StartDate) : null,
        periodTo: item.EndDate && item.EndDate != '' ? new Date(item.EndDate) : null,
        totalYear: item.totalYear ? item.totalYear : years,
        designationDOJ: item.DesignationHeld,
        designationLast: item.designationLast ? item.designationLast : item.DesignationHeld,
        reportingTo: item.reportingTo,
        location: item.WorkLocation
      });
      this.w.push(expForm);
    });
    // this.employeedetails.WorkExperiences.forEach((item: any) => {
    //   this.w.setValue([{
    //     orgName: item.CompanyName,
    //     periodfrom: item.StartDate != '' ? new Date(item.StartDate) : new Date(),
    //     periodTo: item.EndDate != '' ? new Date(item.EndDate) : new Date(),
    //     totalYear: '',
    //     designationDOJ: item.DesignationHeld,
    //     designationLast: item.designationLast ? item.designationLast : item.DesignationHeld,
    //     reportingTo: item.reportingTo,
    //     location: item.WorkLocation
    //   }]);
    // });
  }

  createEducationDetailsFormArray(): FormGroup {
    return this.fb.group({
      degree: '',
      institutionName: '',
      passYear: null,
      score: '',
      majorSubject: ''
    });
  }


  addEducationDetails(): void {
    this.educationDetailsFrmArr = this.educationAndWorkFrmGrp.get('educationDetailsFrmArr') as FormArray;
    this.educationDetailsFrmArr.push(this.createEducationDetailsFormArray());
  }

  patchEducationDetailsFrmArr() {
    this.employeedetails.Qualifications.map((item: any) => {
      const eduForm = this.fb.group({
        degree: item.EducationDegree,
        institutionName: item.InstitutionName,
        passYear: item.YearOfPassing && item.YearOfPassing != '' ? new Date(item.YearOfPassing) : null,
        score: item.ScoringValue,
        majorSubject: item.majorSubject
      });
      this.e.push(eduForm);
    });
    // this.employeedetails.Qualifications.forEach((item: any, idx: number) => {
    //   this.e.setValue([{
    //     degree: item.EducationDegree,
    //     institutionName: item.InstitutionName,
    //     passYear: item.YearOfPassing != '' ? new Date(item.YearOfPassing) : new Date(),
    //     score: item.ScoringValue,
    //     majorSubject: ''
    //   }]);
    // });
  }

  deleteSelectedFrmArray(index, comingFrom){
    if (comingFrom == 'Family Details') {
      this.familyDetails.removeAt(index);
    }
    if (comingFrom == 'Education') {
      this.educationDetailsFrmArr.removeAt(index);
    }
    if (comingFrom == 'Experience') {
      this.workexperienceDetailsFrmArr.removeAt(index);
    }
  }

  disableAllFields() {
    this.personalInformation.disable();
    this.educationAndWorkFrmGrp.disable();
    this.panAndAadharFrmGrp.disable();
    this.formF.disable();
    this.declarationForm.disable();
    this.form11PF.disable();
    this.formNominee1.disable();
    this.formNominee2.disable();
    this.govtFormDeclaration.disable();
  }

  disableFormControl() {
    // disable employee code
    this.govtFormDeclaration.controls['empCode'].disable();
    this.personalInformation.controls['employeeCode'].disable();
    this.formNominee1.controls['empCode'].disable();
    this.formF.controls['empCode'].disable();
    this.declarationForm.controls['empCode'].disable();
    // disable clientName
    this.personalInformation.controls['clientName'].disable();
    // pan and aadhar section
    this.panAndAadharFrmGrp.controls['nameInAadhar'].value != null && this.panAndAadharFrmGrp.controls['nameInAadhar'].value != '' ? this.panAndAadharFrmGrp.controls['nameInAadhar'].disable() : this.panAndAadharFrmGrp.controls['nameInAadhar'].setValue('');

    this.panAndAadharFrmGrp.controls['aadharNumber'].value != null && this.panAndAadharFrmGrp.controls['aadharNumber'].value != '' ? this.panAndAadharFrmGrp.controls['aadharNumber'].disable() : this.panAndAadharFrmGrp.controls['aadharNumber'].setValue('');

    this.panAndAadharFrmGrp.controls['panNo'].value != null && this.panAndAadharFrmGrp.controls['panNo'].value != '' ? this.panAndAadharFrmGrp.controls['panNo'].disable() : this.panAndAadharFrmGrp.controls['panNo'].setValue('');
    this.panAndAadharFrmGrp.controls['bankAccountNo'].value != null && this.panAndAadharFrmGrp.controls['bankAccountNo'].value != '' ? this.panAndAadharFrmGrp.controls['bankAccountNo'].disable() : this.panAndAadharFrmGrp.controls['bankAccountNo'].setValue('');
    this.panAndAadharFrmGrp.controls['bankIfscCode'].value != null && this.panAndAadharFrmGrp.controls['bankIfscCode'].value != '' ? this.panAndAadharFrmGrp.controls['bankIfscCode'].disable() : this.panAndAadharFrmGrp.controls['bankIfscCode'].setValue('');
    this.panAndAadharFrmGrp.controls['bankBranch'].value != null && this.panAndAadharFrmGrp.controls['bankBranch'].value != '' ? this.panAndAadharFrmGrp.controls['bankBranch'].disable() : this.panAndAadharFrmGrp.controls['bankBranch'].setValue('');
    this.panAndAadharFrmGrp.controls['bankName'].value != null && this.panAndAadharFrmGrp.controls['bankName'].value != '' ? this.panAndAadharFrmGrp.controls['bankName'].disable() : this.panAndAadharFrmGrp.controls['bankName'].setValue('');
    this.panAndAadharFrmGrp.controls['UAN'].value != null && this.panAndAadharFrmGrp.controls['UAN'].value != '' ? this.panAndAadharFrmGrp.controls['UAN'].disable() : this.panAndAadharFrmGrp.controls['UAN'].setValue('');
    this.panAndAadharFrmGrp.controls['PF'].value != null && this.panAndAadharFrmGrp.controls['PF'].value != '' ? this.panAndAadharFrmGrp.controls['PF'].disable() : this.panAndAadharFrmGrp.controls['PF'].setValue('');
    this.panAndAadharFrmGrp.controls['ESI'].value != null && this.panAndAadharFrmGrp.controls['ESI'].value != '' ? this.panAndAadharFrmGrp.controls['ESI'].disable() : this.panAndAadharFrmGrp.controls['ESI'].setValue('');

    this.formNominee1.controls['EPF'].value != null && this.formNominee1.controls['EPF'].value != '' ? this.formNominee1.controls['EPF'].disable() : this.formNominee1.controls['EPF'].setValue('');
    // disable date of joining
    this.personalInformation.controls['dateOfJoining'].value != null && this.personalInformation.controls['dateOfJoining'].value != '' ? 
      this.personalInformation.controls['dateOfJoining'].disable() : this.personalInformation.controls['dateOfJoining'].setValue('');

    this.declarationForm.controls['dateOfJoining'].value != null && this.declarationForm.controls['dateOfJoining'].value != '' ? 
      this.declarationForm.controls['dateOfJoining'].disable() : this.declarationForm.controls['dateOfJoining'].setValue('');

    this.govtFormDeclaration.controls['DOJ'].value != null && this.govtFormDeclaration.controls['DOJ'].value != '' ? 
      this.govtFormDeclaration.controls['DOJ'].disable() : this.govtFormDeclaration.controls['DOJ'].setValue('');
    
    this.formNominee1.controls['DOJ'].value != null && this.formNominee1.controls['DOJ'].value != '' ? 
      this.formNominee1.controls['DOJ'].disable() : this.formNominee1.controls['DOJ'].setValue('');
    
    this.form11PF.controls['DOJCurrent'].value != null && this.form11PF.controls['DOJCurrent'].value != '' ? 
      this.form11PF.controls['DOJCurrent'].disable() : this.form11PF.controls['DOJCurrent'].setValue('');
  }
  // Function to call download pdf
  savePdfDocument() {
    const promise = new Promise((resolve, reject) => {
      // hide items not necessary in PDF
      $('#ignoreForPrint').hide();
      $('.ignoreBtnForPrint').hide();
      $('.btnAddMore').hide();
      $('.showForPrint').show();
      // function to download PDF
      this.downloadAsPDF().then((res) => {
        resolve(true);
      });
      // show hidden items
      setTimeout(function () {
        $(".ignoreBtnForPrint").show();
        $('#ignoreForPrint').show();
        $('.btnAddMore').show();
        $('.showForPrint').hide();
      }, 2500);
    });
    return promise;
  }
  // Function to downlaod pdf
  downloadAsPDF() {
    window.scrollTo(0, 0);
    const promise = new Promise((resolve, reject) => {
      let filename = 'online-joining-kit.pdf';

      if (this.candidateName != undefined && this.candidateName != null && this.candidateName != '') {
        filename = `${this.candidateName.replace(/\s/g, "")}_onlineJoiningKit_${new Date().getTime().toString()}.pdf`;
      }
      setTimeout(() => {
        this.loadingScreenService.startLoading();
      }, 0);

      var HTML_Width = $(".print").width();
      var HTML_Height = $(".print").height();
      var top_left_margin = 25;
      var PDF_Width = HTML_Width + (top_left_margin * 3) as any;
      var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 3) as any;
      var canvas_image_width = HTML_Width as any;
      var canvas_image_height = HTML_Height as any;

      var totalPDFPages = Math.ceil(HTML_Height / PDF_Height);

      html2canvas($(".print")[0], {
        allowTaint: true,
        useCORS: true,
        logger: true,
        scale: 1
      }).then((canvas) => {
        console.log('canvas rendered - inside then');
        var imgData = canvas.toDataURL("image/jpeg", 1.0);
        var pdf = new jspdf('p', 'pt', [PDF_Width, PDF_Height]);
        console.log('js pdf initialised');
        pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
        console.log('js pdf initialised - add image first called');
        pdf.setFont("Helvetica");
        pdf.setFontSize(15);
        pdf.setTextColor("gray");
        console.log('js pdf initialised - font styles set');
        for (var i = 1; i <= totalPDFPages; i++) {
          pdf.setPage(i);
          // Header
          const header = `${this.clientName}/${this.candidateId}/${this.candidateName}/Pg No: ${i}`;
          pdf.text(header, 60, 15, { baseline: 'top' });
          console.log('js pdf initialised - headers set');
          // add page
          pdf.addPage(PDF_Width, PDF_Height);
          console.log('js pdf initialised - add page called');
          pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height, '', 'FAST');
          console.log('js pdf initialised - add image loop called');
        }
        let base = pdf.output('datauristring'); // base64 string
        let FileUrl = (base as string).split(",")[1];
        this.doAsyncUpload(FileUrl, filename, 'ONLINE JOINING KIT').then((res) => {
          // console.log('base 64', FileUrl);
          this.loadingScreenService.stopLoading();
          if (res) {
            console.log('OBJ STORAGE API RESULT SUCCESS- PDF document saved in DB');
            resolve(true);
          } else {
            console.log('OBJ STORAGE API RESULT ERROR- PDF document NOT saved in DB');
            reject();
          }
        });

      });
    });

    return promise;
  }

  sampleDownload() {
     // hide items not necessary in PDF
     $('.ignoreForPrint').hide();
     $('#ignoreBtnForPrint').hide();
     $('.btnAddMore').hide();
     $('.showForPrint').show();
     // function to download PDF
    let filename = 'online-joining-kit.pdf';
    var HTML_Width = $(".print").width();
    var HTML_Height = $(".print").height();
    var top_left_margin = 25;
    var PDF_Width = HTML_Width + (top_left_margin * 3) as any;
    var PDF_Height = (PDF_Width * 1.5) + (top_left_margin * 3) as any;
    var canvas_image_width = HTML_Width as any;
    var canvas_image_height = HTML_Height as any;
    var totalPDFPages = Math.ceil(HTML_Height / PDF_Height);
    html2canvas($(".print")[0], {
      allowTaint: true,
      useCORS: true,
      logger: true,
      scale: 1
    }).then((canvas) => {
      console.log('canvas rendered - inside then');
      var imgData = canvas.toDataURL("image/jpeg", 1.0);
      var pdf = new jspdf('p', 'pt', [PDF_Width, PDF_Height]);
      console.log('js pdf initialised');
      pdf.addImage(imgData, 'JPG', top_left_margin, top_left_margin, canvas_image_width, canvas_image_height);
      console.log('js pdf initialised - add image first called');
      pdf.setFont("Helvetica");
      pdf.setFontSize(15);
      pdf.setTextColor("gray");
      console.log('js pdf initialised - font styles set');
      for (var i = 1; i <= totalPDFPages; i++) {
        pdf.setPage(i);
        // Header
        const header = `${this.clientName}/${this.candidateId}/${this.candidateName}/Pg No: ${i}`;
        pdf.text(header, 60, 15, { baseline: 'top' });
        console.log('js pdf initialised - headers set');
        // add page
        pdf.addPage(PDF_Width, PDF_Height);
        console.log('js pdf initialised - add page called');
        pdf.addImage(imgData, 'JPG', top_left_margin, -(PDF_Height * i) + (top_left_margin * 4), canvas_image_width, canvas_image_height, '', 'FAST');
        console.log('js pdf initialised - add image loop called');
      }
      // let base = pdf.output('datauristring'); // base64 string
      // let FileUrl = (base as string).split(",")[1];
      pdf.save(filename);

    });

    // show hidden items
    setTimeout(function () {
      $(".ignoreBtnForPrint").show();
      $('#ignoreForPrint').show();
      $('.btnAddMore').show();
      $('.showForPrint').hide();
    }, 2500);
  }

}
