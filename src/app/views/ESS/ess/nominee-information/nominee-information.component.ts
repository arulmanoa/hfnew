import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import { NgxSpinnerService } from "ngx-spinner";
import * as JSZip from 'jszip';

import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeMenuData, _EmployeeDetails } from 'src/app/_services/model/Employee/EmployeeDetails';
import { FamilyDocumentCategoryist, FamilyInfo } from 'src/app/_services/model/OnBoarding/FamilyInfo';
import { LoginResponses } from 'src/app/_services/model';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ApprovalStatus } from 'src/app/_services/model/OnBoarding/QC';
import { CandidateFamilyDetails, ClaimType } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { Relationship,Salutation,Occupation } from 'src/app/_services/model/Base/HRSuiteEnums';
import { FamilyDetails } from 'src/app/_services/model/Employee/FamilyDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
import * as moment from 'moment';
import { UUID } from 'angular2-uuid';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import Swal from 'sweetalert2';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { environment } from 'src/environments/environment';
import { EntityType } from '@services/model/Base/EntityType';

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
  selector: 'app-nominee-information',
  templateUrl: './nominee-information.component.html',
  styleUrls: ['./nominee-information.component.css']
})
export class NomineeInformationComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() FamilyInofListGrp: FamilyInfo;
  @Output() familyChangeHandler = new EventEmitter();
  @Input() NotAccessibleFields = [];
  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  spinner: boolean = true;
  isEnbleNomineeBtn: boolean = true;
  // REACTIVE FORM
  employeeForm: FormGroup;
  maxDate: Date;

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
  employeeModel: EmployeeModel = new EmployeeModel();

  // FAMILY
  relationship: any = [];
  FamilyDocumentCategoryList: FamilyDocumentCategoryist;
  spinnerText: string = "Uploading";
  isLoading: boolean = true;
  familyFileName: any;
  familyDocumentId: any;

  FamilyDetails: FamilyDetails[] = [];
  Claim: any = [];
  LstNominees = [];
  rejectedLst = [];

  popupId: any;
  firstTimeDocumentId: any;
  nominee_sliderVisible: boolean = false;
  nomineeSubmitted: boolean = false;
  isESICapplicable: boolean = false;
  unsavedDocumentLst = [];
  FileName: any;
  deletedLstNominee = [];

  MaxSize: any = 0;
  // JSZip
  isFileChange: boolean = false;
  fileList: any[] = [];
  // Multiple File Upload
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  docList: any[];//jszip
  bankDocList: any[] = [];//jszip
  contentmodalurl: any;
  allowedToSave: boolean = true;
  AccessibleButtons = [];
  dobAge = 0;
  empClientContractName = '';
  showIsDependentForRelationShipTypeValues = environment.environment.ShowIsDependentForRelationShipTypeValues;
  occupationDropDownValues = this.utilsHelper.transform(Occupation)
  allRelationShips = this.utilsHelper.transform(Relationship)
  salutation = this.utilsHelper.transform(Salutation)
  isAllenDigital: boolean = false;
  ACID = environment.environment.ACID;
  isValidFamilyEmployeeId = false;
  showOccupation = true;
  isEditMode: boolean = false;
  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private Customloadingspinner: NgxSpinnerService

  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation



  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({

      //NOMINEE DETAILS
      nomineeId: [null],
      nomineeName: ['',],
      relationship: [null,],
      DOB: [null],
      // FamilyaAdhar: [''],
      idProoftype: [null],
      FamilyisEmployed: [false],
      FamilyPF: ['', [mixmaxcheck]],
      FamilyESIC: ['', [mixmaxcheck]],
      FamilyGratuity: ['', [mixmaxcheck]],
      mediclaim: [false],
      familyDocumentId: [null],
      familyFileName: [null],
      IsFamilyDocumentDelete: [false], // extra prop
      FamilyEmployeeID: [null],
      IsDependent: [false],
      IsNominee: [false],
      Occupation: [null],
      Salutation: [null]
    });
  }

 
  ngOnInit() {
    this.doRefresh();
    // this.employeeForm.valueChanges.subscribe((changedObj: any) => {
    //   this.subscribeEmitter();
    // });    
  }

  filterRelationships() {
    var filteredRelationships: any = [];
    const forbiddenRelationships = ['Son', 'Spouse', 'Daughter', 'Father_in_law', 'Mother_in_law', 'Guardian'];
    const forbiddenRelationships2 = ['Guardian'];

    filteredRelationships = this.utilsHelper.transform(Relationship);
    if (this.employeedetails.MaritalStatus === 0) {
      this.relationship = filteredRelationships.filter(relationship => !forbiddenRelationships.includes(relationship.name))
    } else {
      this.relationship = filteredRelationships.filter(relationship => !forbiddenRelationships2.includes(relationship.name))
    }
  }


  onChangeRelationship() {
    const forbiddenRelationshipsForMaleGender = [1, 4, 7];//'Father','Son', 'Spouse','Father_in_law'
    const forbiddenRelationshipsForFemaleGender = [1, 4, 3, 7];
    const forbiddenOccupations = ['Housewife'];
    let filteredOccupations: any = [];
    filteredOccupations = this.utilsHelper.transform(Occupation);
    if ((this.employeedetails.Gender) as any == 1 && forbiddenRelationshipsForMaleGender.includes(this.employeeForm.get('relationship').value)) {
      this.occupationDropDownValues = filteredOccupations.filter(occupation => !forbiddenOccupations.includes(occupation.name))
    } else if ((this.employeedetails.Gender) as any == 2 && forbiddenRelationshipsForFemaleGender.includes(this.employeeForm.get('relationship').value)) {
      this.occupationDropDownValues = filteredOccupations.filter(occupation => !forbiddenOccupations.includes(occupation.name))
    } else {
      this.occupationDropDownValues = filteredOccupations
    }
  }
  doRefresh() { 
    this.spinner = true;
    this.isLoading = true;
    this.deletedLstNominee = [];
    this.LstNominees = [];

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.isAllenDigital = (Number(this.ACID) === 1988 && ( this.BusinessType === 1 ||  this.BusinessType === 2)) ? true : false;


    this.allowedToSave = environment.environment.AllowedRolesToSaveEmployeeDetails &&
      environment.environment.AllowedRolesToSaveEmployeeDetails.includes(this.RoleCode) ? true : false;
    this.maxDate = new Date();
    this.maxDate.setDate(this.maxDate.getDate() - 1);    
    // this.RoleCode = "Test";
    // let companyLogos = this.essService.GetCompanyLogoByBusinessType(this._loginSessionDetails, this.BusinessType);
    // this.clientLogoLink = companyLogos.clientLogoLink;
    // this.clientminiLogoLink = companyLogos.clientminiLogoLink;
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      this.employeeModel = new EmployeeModel();
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");
      this.GetEmployeeRequiredFamilyDetails().then((obj) => {
        this.Common_GetEmployeeAccordionDetails('isFamilydetails').then((obj1) => {
          this.patchEmployeeForm();
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
    this.LstNominees = [];
    try {

      if (this.employeedetails != null) {
        console.log('this.employeedetails', this.employeedetails);
        this.filterRelationships();
        // For Family Details accordion (Edit)
        if (this.employeedetails.EmpFamilyDtls != null && this.employeedetails.EmpFamilyDtls.length > 0) {

          this.employeedetails.EmpFamilyDtls.forEach(element => {
            if (element.CandidateDocument != null) {
              element.CandidateDocument.Modetype = UIMode.Edit;
            }
            this.LstNominees.push({
              Id: element.Id,
              id: element.Id,
              nomineeName: (element.Name),
              RelationShip: (this.allRelationShips as any[]).find(a => a.id === element.RelationshipId).name,
              DOB: (element.DOB == "1900-01-01T00:00:00" || element.DOB == "1900-01-01") ? null : element.DOB,
              IDProof: "",
              FamilyPF: element.LstClaims.find(a => a.ClaimType == ClaimType.PF) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.PF).Percentage : null,
              FamilyGratuity: element.LstClaims.find(a => a.ClaimType == ClaimType.Gratuity) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.Gratuity).Percentage : null,
              FamilyESIC: element.LstClaims.find(a => a.ClaimType == ClaimType.ESIC) != null ? element.LstClaims.find(a => a.ClaimType == ClaimType.ESIC).Percentage : null,
              FamilyaAdhar: "",
              FamilyisEmployed: element.IsEmployed,
              mediclaim: false,
              idProoftype: "",
              relationship: element.RelationshipId,
              Age: 0,
              CandidateDocument: element.CandidateDocument,
              DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
              isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
              Modetype: UIMode.Edit,
              DateofBirth: (element.DOB == "1900-01-01T00:00:00" || element.DOB == "1900-01-01") ? null : element.DOB,
              IsNominee: element.IsNominee,
              IsDependent: element.IsDependent,
              FamilyEmployeeID: element.FamilyEmployeeID,
              Occupation: element.Occupation,
              Salutation: element.Salutation

            })
            element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Family_Details");
          });
        }        
        console.log('OfferInfoListGrp', this.FamilyInofListGrp);
        
        if (this.FamilyInofListGrp == undefined) {

          this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, 'isFamilydetails').then((Result) => {

            this.FamilyInofListGrp = Result as any;
            try {
              this.dataMapping();
            } catch (error) {
              console.log('EX GET EMPLOYMENT INFO :', error);

            }

          });
        } else {
          this.dataMapping();
        }
      }      
      this.setClientContractName();

      this.spinner = false;
    } catch (error) {
      this.spinner = false;
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY EMPLOYMENT DETAILS :', error);

    }
  }

  setClientContractName() {
    if(this.BusinessType == 1 || this.BusinessType == 2 ){
      if (this._loginSessionDetails.ClientContractList) {
        this._loginSessionDetails.ClientContractList.map((client) => {
          if (this.employeedetails && this.employeedetails.EmploymentContracts[0]) {
            if (client.Id == this.employeedetails.EmploymentContracts[0].ClientContractId) {
              this.empClientContractName = client.Name
            }
          }
        })
      }
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
    this.FamilyDocumentCategoryList = this.FamilyInofListGrp.FamilyDocumentCategoryist;
    this.spinner = false;
  }






  addNominee(nominee_json_edit_object) {

    if (nominee_json_edit_object != undefined && nominee_json_edit_object.CandidateDocument != null) {

      nominee_json_edit_object.DocumentId = nominee_json_edit_object.CandidateDocument.DocumentId;
      nominee_json_edit_object.FileName = nominee_json_edit_object.CandidateDocument.FileName;
      nominee_json_edit_object.idProoftype = nominee_json_edit_object.CandidateDocument.DocumentTypeId;
    }
    console.log('nominee_json_edit_object', nominee_json_edit_object);

    this.fileList = [];
    this.fileList.length = 0;
    this.isLoading = true;
    this.isFileChange = true;
    this.popupId = nominee_json_edit_object.Id;
    this.employeeForm.controls['nomineeId'].setValue(nominee_json_edit_object.Id);
    this.employeeForm.controls['nomineeName'].setValue(nominee_json_edit_object.nomineeName);
    this.employeeForm.controls['relationship'].setValue(nominee_json_edit_object.relationship == 0 ? null : nominee_json_edit_object.relationship);
    this.employeeForm.controls['DOB'].setValue(nominee_json_edit_object.DOB == null ? null : (nominee_json_edit_object.DOB == '1900-01-01' || nominee_json_edit_object.DOB == '1970-01-01T00:00:00') ? null : new Date(nominee_json_edit_object.DOB));
    this.employeeForm.controls['idProoftype'].setValue(nominee_json_edit_object.idProoftype);
    this.employeeForm.controls['FamilyisEmployed'].setValue(nominee_json_edit_object.FamilyisEmployed);
    this.employeeForm.controls['mediclaim'].setValue(nominee_json_edit_object.mediclaim);
    this.employeeForm.controls['FamilyPF'].setValue(nominee_json_edit_object.FamilyPF);
    this.employeeForm.controls['FamilyESIC'].setValue(nominee_json_edit_object.FamilyESIC);
    this.employeeForm.controls['FamilyGratuity'].setValue(nominee_json_edit_object.FamilyGratuity);
    this.employeeForm.controls['FamilyEmployeeID'].setValue(nominee_json_edit_object.FamilyEmployeeID);
    this.employeeForm.controls['IsDependent'].setValue(nominee_json_edit_object.IsDependent);
    this.employeeForm.controls['IsNominee'].setValue(nominee_json_edit_object.IsNominee);
    this.employeeForm.controls['Occupation'].setValue(nominee_json_edit_object.Occupation);
    this.employeeForm.controls['Salutation'].setValue(nominee_json_edit_object.Salutation);
    if(nominee_json_edit_object.FamilyisEmployed && this.isAllenDigital) {
      this.showOccupation = false;
      this.isValidFamilyEmployeeId = true;
      this.employeeForm.controls['nomineeName'].disable()
      this.employeeForm.controls['DOB'].disable()
    }

    if (nominee_json_edit_object.DocumentId && nominee_json_edit_object.FileName) {
      this.firstTimeDocumentId = nominee_json_edit_object.DocumentId;
      this.familyFileName = nominee_json_edit_object.FileName;
      this.familyDocumentId = nominee_json_edit_object.DocumentId;

    }
    if (nominee_json_edit_object.familyDocumentId == null && nominee_json_edit_object.DocumentId != null) {
      nominee_json_edit_object.familyDocumentId = nominee_json_edit_object.DocumentId;
      nominee_json_edit_object.familyFileName = nominee_json_edit_object.FileName;
    } else if (nominee_json_edit_object.familyDocumentId != null && nominee_json_edit_object.DocumentId == null) {
      nominee_json_edit_object.DocumentId = nominee_json_edit_object.familyDocumentId;
      nominee_json_edit_object.FileName = nominee_json_edit_object.familyFileName;
    }
    if (nominee_json_edit_object.familyDocumentId) {

      this.isFileChange = false;
      /* #region  after jszip */
      this.spinnerText = "Loading";
      this.fileuploadService.getObjectById(nominee_json_edit_object.familyDocumentId)
        .subscribe((dataRes) => {
          if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
            this.fileList = [];
            this.isFileChange = true;
            this.alertService.showWarning(dataRes.Message);
            return;
          }
          var objDtls = dataRes.Result;
          this.fileList = [];

          var fileNameSplitsArray = nominee_json_edit_object.familyFileName.split('.');
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



    this.nominee_sliderVisible = true;


  }
  close_nominee() {
    // this.isESSLogin && this.employeeForm.disable();
    this.nominee_sliderVisible = false;
  }
  openNomineeSlider() {
    this.isEditMode = false;
    this.fileList = [];
    this.employeeForm.controls['nomineeId'].reset();
    this.employeeForm.controls['nomineeName'].reset();
    this.employeeForm.controls['relationship'].reset();
    this.employeeForm.controls['DOB'].reset();
    this.employeeForm.controls['FamilyPF'].reset();
    this.employeeForm.controls['FamilyESIC'].reset();
    this.employeeForm.controls['FamilyGratuity'].reset();
    this.employeeForm.controls['FamilyisEmployed'].reset();
    this.employeeForm.controls['mediclaim'].reset();
    this.employeeForm.controls['idProoftype'].reset();
    this.employeeForm.controls['familyDocumentId'].reset();
    this.employeeForm.controls['IsFamilyDocumentDelete'].reset();
    this.employeeForm.controls['FamilyEmployeeID'].reset();
    this.employeeForm.controls['IsDependent'].reset();
    this.employeeForm.controls['IsNominee'].reset();
    this.employeeForm.controls['Occupation'].reset();
    this.employeeForm.controls['Salutation'].reset();
    this.employeeForm.controls['nomineeName'].enable();
    this.employeeForm.controls['DOB'].enable();
    this.familyDocumentId = null;
    this.familyFileName = null;
    this.isFileChange = false;
    this.firstTimeDocumentId = null;
    this.fileList.length = 0;
    this.fileList = [];
    this.isLoading = true;
    // this.isESSLogin && this.employeeForm.enable();
    this.nominee_sliderVisible = true;

  }
  urltoFile(url, filename, mimeType) {
    return (fetch(url)
      .then(function (res) { return res.arrayBuffer(); })
      .then(function (buf) { return new File([buf], filename, { type: mimeType }); })
    );
  }

  validate_nominee_formControl() {
    this.nomineeSubmitted = true;
    console.log('dsfd', this.employeeForm.get('DOB').value);
    if ((this.employeeForm.get('Salutation').value == null || this.employeeForm.get('Salutation').value == '' || this.employeeForm.get('Salutation').value == undefined)) {
      this.employeeForm.controls['Salutation'].setErrors({ 'incorrect': true });
      return;
    
    }else if (this.employeeForm.get('nomineeName').value == null || this.employeeForm.get('nomineeName').value == '' || this.employeeForm.get('nomineeName').value == undefined) {
      this.employeeForm.controls['nomineeName'].setErrors({ 'incorrect': true });
      return;
    }
    else if (this.employeeForm.get('relationship').value == null || this.employeeForm.get('relationship').value == '' || this.employeeForm.get('relationship').value == undefined) {
      this.employeeForm.controls['relationship'].setErrors({ 'incorrect': true });
      return;
    }
    else if (this.employeeForm.get('DOB').value == null || this.employeeForm.get('DOB').value == '' || this.employeeForm.get('DOB').value == undefined) {

      this.employeeForm.controls['DOB'].setErrors({ 'incorrect': true });
      return;

    }
    // else if (this.employeeForm.get('IsNominee').value == true && (this.employeeForm.get('FamilyPF').value == null || this.employeeForm.get('FamilyPF').value == '' || this.employeeForm.get('FamilyPF').value == undefined)) {
    //   this.employeeForm.controls['FamilyPF'].setErrors({ 'incorrect': true });
    //   return;
    // }

    // else if (this.employeeForm.get('IsNominee').value == true &&  this.isESICapplicable === true && (this.employeeForm.get('FamilyESIC').value == null || this.employeeForm.get('FamilyESIC').value == '' || this.employeeForm.get('FamilyESIC').value == undefined)) {
    //   this.alertService.showWarning("ESIC Coverage is required");
    //   return;
    // }

    // else if (this.employeeForm.get('IsNominee').value == true &&  (this.employeeForm.get('FamilyGratuity').value == null || this.employeeForm.get('FamilyGratuity').value == '' || this.employeeForm.get('FamilyGratuity').value == undefined)) {
    //   this.employeeForm.controls['FamilyGratuity'].setErrors({ 'incorrect': true });
    //   return;
    // }

    else if (this.familyFileName != null && (this.employeeForm.get('idProoftype').value == null || this.employeeForm.get('idProoftype').value == '')) {
      this.employeeForm.controls['idProoftype'].setErrors({ 'incorrect': true });
      return;
    }
    else if (this.employeeForm.get('FamilyisEmployed').value == true && this.isAllenDigital && (this.employeeForm.get('FamilyEmployeeID').value == null || this.employeeForm.get('FamilyEmployeeID').value == '' || this.employeeForm.get('FamilyEmployeeID').value == undefined)) {
      this.employeeForm.controls['FamilyEmployeeID'].setErrors({ 'incorrect': true });
      return;
    }
    else if (this.showOccupation && (this.employeeForm.get('Occupation').value == null || this.employeeForm.get('Occupation').value == '' || this.employeeForm.get('Occupation').value == undefined)) {
      this.employeeForm.controls['Occupation'].setErrors({ 'incorrect': true });
      return;
    }
    
    const nomineeId = this.employeeForm.get('nomineeId').value;
    const nomineeName = this.employeeForm.controls.nomineeName.value;
    const dob = this.employeeForm.controls.DOB.value;
    const relationship = this.employeeForm.controls.relationship.value;
    if(this.isAllenDigital && this.employeeForm.get('FamilyisEmployed').value == true &&  !this.isValidFamilyEmployeeId) {
      this.alertService.showWarning("The specified Employee ID does not exists");
      return;
    }
    try {
      const isAlreadyExists = this.LstNominees.find(a =>
        a.id != nomineeId &&
        a.nomineeName.toLowerCase().trim() == nomineeName.toLowerCase().trim() &&
        moment(a.DOB).format('YYYY-MM-DD') == moment(dob).format('YYYY-MM-DD') &&
        a.relationship == relationship
      ) !== undefined;
      if (isAlreadyExists) {
        this.isLoading = true;
        this.alertService.showWarning("The specified Family detail already exists");
        return;
      }


    } catch (error) {
      console.log('eer', error);

    }


    let totalPF = 0;
    let totalESIC = 0;
    let totalGratuity = 0;


    const FamilyPF = this.employeeForm.get('FamilyPF').value;
    const FamilyESIC = this.employeeForm.get('FamilyESIC').value;
    const FamilyGratuity = this.employeeForm.get('FamilyGratuity').value;

    this.LstNominees.forEach(element => {
      console.log('element', element);

      if (element.Id !== nomineeId) {
        totalPF += Number(element.FamilyPF);
        totalESIC += Number(element.FamilyESIC);
        totalGratuity += Number(element.FamilyGratuity);
      }
    });

    console.log(totalPF);

    if (totalPF + Number(FamilyPF) > 100) {
      this.alertService.showWarning("Heads Up!. You cannot exceed your PF coverage of 100%");
      return;
    } else if (totalESIC + Number(FamilyESIC) > 100) {
      this.alertService.showWarning("You cannot exceed your ESIC coverage of 100%");
      return;
    } else if (totalGratuity + Number(FamilyGratuity) > 100) {
      this.alertService.showWarning("You cannot exceed your Gratuity coverage of 100%");
      return;
    }
    else {
      this.onFileUpload();
    }
  }

  addNewNominee() {

    this.nomineeSubmitted = true;
    if (this.employeeForm.get('nomineeName').value == null || this.employeeForm.get('nomineeName').value == '' || this.employeeForm.get('nomineeName').value == undefined) {
      this.employeeForm.controls['nomineeName'].setErrors({ 'incorrect': true });

    }
    else if (this.employeeForm.get('relationship').value == null || this.employeeForm.get('relationship').value == '' || this.employeeForm.get('relationship').value == undefined) {
      this.employeeForm.controls['relationship'].setErrors({ 'incorrect': true });

    }
    // else if (this.employeeForm.get('IsNominee').value == true && (this.employeeForm.get('FamilyPF').value == null || this.employeeForm.get('FamilyPF').value == '' || this.employeeForm.get('FamilyPF').value == undefined)) {
    //   this.employeeForm.controls['FamilyPF'].setErrors({ 'incorrect': true });

    // }

    // else if (this.employeeForm.get('IsNominee').value == true && this.isESICapplicable === true && (this.employeeForm.get('FamilyESIC').value == null || this.employeeForm.get('FamilyESIC').value == '' || this.employeeForm.get('FamilyESIC').value == undefined)) {
    //   this.alertService.showWarning("ESIC Coverage is required");
    //   return;
    // }

    // else if (this.employeeForm.get('IsNominee').value == true && (this.employeeForm.get('FamilyGratuity').value == null || this.employeeForm.get('FamilyGratuity').value == '' || this.employeeForm.get('FamilyGratuity').value == undefined)) {
    //   this.employeeForm.controls['FamilyGratuity'].setErrors({ 'incorrect': true });

    // }

    else if (this.familyFileName != null && (this.employeeForm.get('idProoftype').value == null || this.employeeForm.get('idProoftype').value == '')) {
      this.employeeForm.controls['idProoftype'].setErrors({ 'incorrect': true });
    }
    else {
      this.validate_and_binding_nominee_info();
    }

    // this.employeeForm.reset()
    // this.angularGrid.gridService.addItem(newItem);

  }

  validate_and_binding_nominee_info() {
    // this.nomineeSubmitted = false;
    //first nomineeid = null
    //if nomineeid == null ? uuid : nomineeId
    
    var db = moment(this.employeeForm.get('DOB').value, 'DD-MM-YYYY').format('YYYY-MM-DD');
    const newItem = {
      Id: this.employeeForm.get('nomineeId').value == null ? UUID.UUID() : this.employeeForm.get('nomineeId').value,
      id: 0,
      nomineeName: this.employeeForm.get('nomineeName').value,
      RelationShip: this.relationship.find(a => a.id == this.employeeForm.get('relationship').value).name,
      DOB: this.employeeForm.get('DOB').value == 'Invalid date' ? '1900-01-01' : new Date(this.employeeForm.get('DOB').value),
      IDProof: "",
      FamilyPF: this.employeeForm.get('IsNominee').value == true ? this.employeeForm.get('FamilyPF').value : '',
      FamilyGratuity: this.employeeForm.get('IsNominee').value == true ? this.employeeForm.get('FamilyGratuity').value : '',
      FamilyaAdhar: "",
      FamilyESIC: this.employeeForm.get('IsNominee').value == true ? this.employeeForm.get('FamilyESIC').value : '',
      FamilyisEmployed: this.employeeForm.get('FamilyisEmployed').value,
      mediclaim: this.employeeForm.get('mediclaim').value,
      idProoftype: this.employeeForm.get('idProoftype').value,
      relationship: this.employeeForm.get('relationship').value,
      familyDocumentId: this.familyDocumentId,
      familyFileName: this.familyFileName,
      FileName: this.familyFileName,
      IsFamilyDocumentDelete: this.employeeForm.get('IsFamilyDocumentDelete').value,
      Age: 0,
      CandidateDocument: null,
      DocumentStatus: null,
      isDocumentStatus: null,
      Modetype: UIMode.Edit,
      DateofBirth: db == 'Invalid date' ? '1900-01-01' : db,
      FamilyEmployeeID: this.employeeForm.get('FamilyEmployeeID').value,
      IsDependent: this.employeeForm.get('IsDependent').value == null ? 0 : this.employeeForm.get('IsDependent').value,
      IsNominee: this.employeeForm.get('IsNominee').value == null ? 0 : this.employeeForm.get('IsNominee').value,
      Occupation: this.employeeForm.get('Occupation').value,
      Salutation: this.employeeForm.get('Salutation').value

    };

    if (newItem != null) {

      if (newItem.familyDocumentId != null && newItem.familyDocumentId != 0 && (newItem.IsFamilyDocumentDelete == false || newItem.IsFamilyDocumentDelete == null)) {
        var candidateDets = new CandidateDocuments();
        candidateDets.Id = this.essService.isGuid(newItem.Id) == true ? 0 : newItem.CandidateDocument == null ? 0 : newItem.CandidateDocument.Id;
        candidateDets.CandidateId = this.employeedetails.Id;
        candidateDets.IsSelfDocument = false;
        candidateDets.DocumentId = newItem.familyDocumentId;
        candidateDets.DocumentCategoryId = 0;
        candidateDets.DocumentTypeId = newItem.idProoftype;
        candidateDets.DocumentNumber = "0";
        candidateDets.FileName = newItem.familyFileName;
        candidateDets.ValidFrom = null;
        candidateDets.ValidTill = null;
        candidateDets.Status = ApprovalStatus.Approved //
        candidateDets.IsOtherDocument = true;
        candidateDets.Modetype = UIMode.Edit;
        candidateDets.DocumentCategoryName = "";
        candidateDets.StorageDetails = null;
        newItem.CandidateDocument = candidateDets;
        newItem.Modetype = UIMode.Edit;


      }
      else if (newItem.IsFamilyDocumentDelete == true && !this.essService.isGuid(newItem.Id)) {


        var candidateDets = new CandidateDocuments();


        candidateDets.Id = this.employeedetails.EmpFamilyDtls.length > 0 &&
          this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.Id
        candidateDets.CandidateId = this.employeedetails.Id;
        candidateDets.IsSelfDocument = false;
        candidateDets.DocumentId = newItem.familyFileName == null ? 0 : this.employeedetails.EmpFamilyDtls.length > 0 &&
          this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.DocumentId;
        candidateDets.DocumentCategoryId = 0;
        candidateDets.DocumentTypeId = this.employeedetails.EmpFamilyDtls.length > 0 &&
          this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.DocumentTypeId
        candidateDets.DocumentNumber = "0";
        candidateDets.FileName = this.employeedetails.EmpFamilyDtls.length > 0 &&
          this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument.FileName;
        candidateDets.ValidFrom = null;
        candidateDets.ValidTill = null;
        candidateDets.Status = ApprovalStatus.Approved //
        candidateDets.IsOtherDocument = true;
        candidateDets.Modetype = UIMode.Edit;
        candidateDets.DocumentCategoryName = "";
        candidateDets.StorageDetails = null;
        newItem.CandidateDocument = candidateDets;
        newItem.Modetype = UIMode.Edit;


      }

      else {

        newItem.CandidateDocument = null;

        newItem.Modetype = this.essService.isGuid(newItem.Id) == true ? UIMode.Edit : UIMode.Edit;
        newItem.isDocumentStatus = null;
        newItem.DocumentStatus = null;

      }

      newItem.isDocumentStatus = ApprovalStatus.Approved;
      newItem.DocumentStatus = "Approved";
      newItem.id = newItem.Id
      newItem.Age = 0;
    }

    let isAlreadyExists = false;
    let isFamilyEmployeeIdAlreadyExists = false;
    let totalPF = 0;
    let totalESIC = 0;
    let totalGratuity = 0;

    isAlreadyExists = _.find(this.LstNominees, (a) => a.Id != newItem.Id && a.relationship == newItem.relationship && ![Relationship['Son'], Relationship['Daughter']].includes(newItem.relationship)) != null ? true : false;
    isFamilyEmployeeIdAlreadyExists = _.find(this.LstNominees, (a) => a.Id != newItem.Id && a.FamilyEmployeeID != null && newItem.FamilyEmployeeID != null && a.FamilyEmployeeID == newItem.FamilyEmployeeID) != null ? true : false;

    if (isAlreadyExists) {
      this.isLoading = true;
      this.alertService.showWarning("The specified Family detail already exists");
      return;
    } else if (isFamilyEmployeeIdAlreadyExists) {
      this.isLoading = true;
      this.alertService.showWarning("The specified Employee Id already exists");
      return;
    } else {

      let isSameResult = false;

      if ((newItem.familyDocumentId != null) && (newItem.idProoftype == null || newItem.idProoftype == '')) {
        this.isLoading = false;
        this.alertService.showWarning("ID Proof Type is required");
        // this.employeeForm.controls['idProoftype'].setErrors({ 'incorrect': true });
        return;
      }
      else if ((newItem.familyDocumentId == null) && (newItem.idProoftype != null && newItem.idProoftype != "")) {
        // this.employeeForm.controls['familyDocumentId'].setErrors({ 'incorrect': true });
        this.alertService.showWarning("Attachment is required");
        return;
      }



      this.LstNominees.length > 0 && this.LstNominees.forEach(element => {

        if (element.Id != (newItem.Id)) {
          totalPF = +Number(element.FamilyPF);
          totalESIC = +Number(element.FamilyESIC);
          totalGratuity = +Number(element.FamilyGratuity);
        }

      });


      if (totalPF + Number(newItem.FamilyPF) > 100) {
        this.isLoading = true;
        this.alertService.showWarning("Heads Up!. You cannot exceed your PF coverage of  100%");
        return;

      } else if (totalESIC + Number(newItem.FamilyESIC) > 100) {
        this.isLoading = true;
        this.alertService.showWarning("You cannot exceed your ESIC coverage of  100%");
        return;
      }
      else if (totalGratuity + Number(newItem.FamilyGratuity) > 100) {
        this.isLoading = true;
        this.alertService.showWarning("You cannot exceed your Gratuity coverage of  100%");
        return;
      }
      else if (newItem.familyDocumentId != null) {
        if (newItem.idProoftype == null) {
          this.isLoading = true;
          this.alertService.showWarning("Oh... Snap! This alert needs your attention, because ID Proof type is required.");
          return;
        }
      }


      isSameResult = _.find(this.LstNominees, (a) => a.Id == newItem.Id) != null ? true : false;
      if (isSameResult) {
        var foundIndex = this.LstNominees.findIndex(x => x.Id == newItem.id);
        this.LstNominees[foundIndex] = newItem;

        // var updateItemById = _.find(this.LstNominees, (a) => a.Id == newItem.Id);
        // updateItemById[] = newItem;
        // this.angularGrid.gridService.updateDataGridItemById(newItem.Id, newItem, true, true);

      } else {
        this.LstNominees = this.LstNominees.concat(newItem) as any;
        // this.angularGrid.gridService.addItemToDatagrid(newItem);
      }

    }

    this.employeeForm.controls['nomineeId'].reset();
    this.employeeForm.controls['nomineeName'].reset();
    this.employeeForm.controls['relationship'].reset();
    this.employeeForm.controls['relationship'].reset();
    this.employeeForm.controls['DOB'].reset();
    this.employeeForm.controls['idProoftype'].reset();
    this.employeeForm.controls['FamilyisEmployed'].reset();
    this.employeeForm.controls['FamilyPF'].reset();
    this.employeeForm.controls['FamilyESIC'].reset();
    this.employeeForm.controls['FamilyGratuity'].reset();
    this.employeeForm.controls['mediclaim'].reset();
    this.employeeForm.controls['familyDocumentId'].reset();
    this.employeeForm.controls['familyFileName'].reset();
    this.employeeForm.controls['IsFamilyDocumentDelete'].reset();
    this.employeeForm.controls['FamilyEmployeeID'].reset();
    this.employeeForm.controls['IsDependent'].reset();
    this.employeeForm.controls['IsNominee'].reset();
    this.employeeForm.controls['Occupation'].reset();
    this.employeeForm.controls['Salutation'].reset();
    
    this.familyDocumentId = null;
    this.familyFileName = null;
    console.log('this.LstNominees', this.LstNominees);
    this.nominee_sliderVisible = false;


  }
  family_file_delete(item) {

    var x = confirm("Are you sure you want to delete?");
    if (x) {
      this.removeSelectedRow(item, "Nominee").then((result) => {
        this.deleteMsg(item);
        console.log('f', this.LstNominees);
        console.log('f deletedLstNominee', this.deletedLstNominee);
      });

      return true;
    }
    else
      return false;

  }

  deleteMsg(item: any) {
    const index: number = this.LstNominees.indexOf(item);
    if (index !== -1) {
      this.LstNominees.splice(index, 1);
    }
  }

  removeSelectedRow(args, whicharea) {
    return new Promise((resolve, reject) => {
      const isCheck = this.essService.isGuid(args.Id);
      if (isCheck && args.DocumentId != null) {
        this.doDeleteFileNominee(args.DocumentId, null).then(() => {
          resolve(true);
        });
      }
      else {
        args.Modetype = UIMode.Delete;
        if (args.CandidateDocument != null && args.CandidateDocument.DocumentId != null) {
          args.CandidateDocument.Modetype = UIMode.Delete;
        }

        if (whicharea == "Nominee") {
          this.deletedLstNominee.push(args);
        }
        else if (whicharea == "Education") {
          // this.deletedLstEducation.push(args);
        }
        else if (whicharea == "Experience") {
          // this.deletedLstExperience.push(args);
        }
        resolve(true);
      }
    });
  }



  doDeleteFileNominee(Id, element) {


    return new Promise((resolve, reject) => {
      setTimeout(() => {
        var candidateDocumentDelete = [];

        this.fileuploadService.deleteObjectStorage((Id)).subscribe((res) => {
          if (res.Status) {
            if (this.unsavedDocumentLst.length > 0) {
              var index = this.unsavedDocumentLst.map(function (el) {
                return el.Id
              }).indexOf(Id);

              // Delete  the item by index.
              this.unsavedDocumentLst.splice(index, 1);
            }

            resolve(true);
          } else {
            reject();
          }
          console.log('aysnc funciond delte');

        }), ((err) => {
          reject();
        })


      }, 1000);
    });
  }



  family_file_edit(item) {
    this.isEditMode = true;
    this.addNominee(item);
  }

  onfamilyFileUpload(e) {

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
        this.familyFileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.familydocumentdoAsyncUpload(FileUrl, this.familyFileName)

      };

    }

  }

  familydocumentdoAsyncUpload(filebytes, filename) {
    try {
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


            this.employeeForm.controls['familyDocumentId'].setValue(apiResult.Result);
            this.employeeForm.controls['familyFileName'].setValue(this.FileName);
            this.familyDocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            });
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")
          }
          else {
            this.FileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }

        } catch (error) {
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }


      }), ((err) => {

      })

    } catch (error) {
      this.FileName = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }


  }


  doDeleteFamilyFile() {
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

      if (result.value) {
        if (this.employeedetails.EmpFamilyDtls.find(z => z.Id == this.employeeForm.get('nomineeId').value).CandidateDocument != null) {
          this.familyFileName = null;
          this.employeeForm.controls['IsFamilyDocumentDelete'].setValue(true);
          this.employeeForm.controls['familyFileName'].setValue(null);
        }
        else if (this.employeeForm.get('nomineeId').value != null || this.essService.isGuid(this.employeeForm.get('nomineeId').value)) {
          this.familydocumentdeleteAsync();
        }
        else if (this.employeeForm.get('nomineeId').value == null) {
          this.familydocumentdeleteAsync();
        }
        else if (this.firstTimeDocumentId != this.familyDocumentId) {
          this.familydocumentdeleteAsync();
        }
        else {


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


  familydocumentdeleteAsync() {


    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((this.familyDocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.familyDocumentId)
          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.employeeForm.controls['familyDocumentId'].setValue(null);
          this.employeeForm.controls['familyFileName'].setValue(null);
          this.familyFileName = null;
          this.familyDocumentId = null;
          this.employeeForm.controls['IsFamilyDocumentDelete'].setValue(false);
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


  // ess

  GetEmployeeRequiredFamilyDetails() {

    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.FamilyDetails).subscribe((result) => {
          console.log('re', result);
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            this.employeedetails = _EmployeeDetails;
            let familyObject: EmployeeDetails = apiR.Result as any;
            this.employeeModel.oldobj = Object.assign({}, result.Result);
            this.employeedetails = familyObject;
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
          this.FamilyInofListGrp = Result as any;
          resolve(true);
          this.spinner = false;
          return true;

        } catch (error) {
          this.spinner = false;
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
      //this.Customloadingspinner.show();
      //nominee details
      this.FamilyDetails = [];
      if (this.LstNominees.length > 0) {
        this.LstNominees.forEach(element => {
          element["lstClaim"] = []
          if (element.FamilyPF) {
            element.lstClaim.push({ ClaimType: ClaimType.PF, Percentage: element.FamilyPF, Remarks: '' })
          }
          if (element.FamilyESIC) {
            element.lstClaim.push({ ClaimType: ClaimType.ESIC, Percentage: element.FamilyESIC, Remarks: '' })
          }
          if (element.FamilyGratuity) {
            element.lstClaim.push({ ClaimType: ClaimType.Gratuity, Percentage: element.FamilyGratuity, Remarks: '' })
          }
        });
        console.log(' this.LstNominees sddfds', this.LstNominees);

        this.LstNominees.forEach(element => {
          var familyDets = new FamilyDetails();
          console.log('eme', element);

          familyDets.Name = element.nomineeName,
            familyDets.RelationshipId = element.relationship,
            familyDets.DOB = element.DateofBirth == null || element.DateofBirth == '' ? "1900-01-01" : moment(new Date(element.DateofBirth)).format('YYYY-MM-DD'),
            familyDets.LstClaims = element.lstClaim,
            familyDets.IsEmployed = element.FamilyisEmployed == null ? false : element.FamilyisEmployed,
            familyDets.EmployeeId = this.employeedetails.Id,
            familyDets.Modetype = element.Modetype,
            familyDets.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
            familyDets.CandidateDocument = element.CandidateDocument
            familyDets.FamilyEmployeeID = element.FamilyEmployeeID
            familyDets.IsDependent = element.IsDependent
            familyDets.IsNominee = element.IsNominee
            familyDets.Occupation = element.Occupation
            familyDets.Salutation = element.Salutation,

          this.FamilyDetails.push(familyDets)
        });
        // this.employeedetails.EmpFamilyDtls = this.FamilyDetails;
      }

      if (this.deletedLstNominee.length > 0) {
        var lstFamilyDetails = [];
        this.deletedLstNominee.forEach(element => {
          if (!this.essService.isGuid(element.Id)) {
            var familyDets = new CandidateFamilyDetails();
            familyDets.Name = element.nomineeName,
              familyDets.RelationshipId = element.relationship,
              familyDets.DOB = element.DateofBirth == null || element.DateofBirth == '' ? "1900-01-01" : element.DateofBirth,
              familyDets.LstClaims = element.lstClaim,
              familyDets.IsEmployed = element.FamilyisEmployed,
              familyDets.Modetype = element.Modetype,
              familyDets.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
              familyDets.CandidateDocument = element.CandidateDocument;
              familyDets.FamilyEmployeeID = element.FamilyEmployeeID
              familyDets.IsDependent = element.IsDependent
              familyDets.IsNominee = element.IsNominee
              familyDets.Occupation = element.Occupation
              familyDets.Salutation = element.Salutation,
              lstFamilyDetails.push(familyDets);
          }
        });
        this.FamilyDetails = lstFamilyDetails.length > 0 ?
          this.FamilyDetails.concat(lstFamilyDetails) :
          this.FamilyDetails;
        // lstFamilyDetails.length > 0 && this.employeedetails.EmpFamilyDtls != null && this.employeedetails.EmpFamilyDtls.length > 0 ? this.employeedetails.EmpFamilyDtls.concat(lstFamilyDetails) : this.employeedetails.EmpFamilyDtls;
      }
      this.employeedetails.EmpFamilyDtls =
        this.FamilyDetails;

      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;

      // this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.newobj = this.employeedetails;
      // this.employeeModel.oldobj = this.employeedetails;

      console.log('PYD #0011 :', this.employeeModel)

      var Employee_request_param = JSON.stringify(this.employeeModel);      
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
          // this.Customloadingspinner.hide();
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
    this.FamilyDetails = [];
    //nominee details
    if (this.LstNominees.length > 0) {
      this.LstNominees.forEach(element => {
        element["lstClaim"] = []
        if (element.FamilyPF) {
          element.lstClaim.push({ ClaimType: ClaimType.PF, Percentage: element.FamilyPF, Remarks: '' })
        }
        if (element.FamilyESIC) {
          element.lstClaim.push({ ClaimType: ClaimType.ESIC, Percentage: element.FamilyESIC, Remarks: '' })
        }
        if (element.FamilyGratuity) {
          element.lstClaim.push({ ClaimType: ClaimType.Gratuity, Percentage: element.FamilyGratuity, Remarks: '' })
        }
      });
      this.LstNominees.forEach(element => {
        var familyDets = new FamilyDetails();
        console.log('eme', element);

        familyDets.Name = element.nomineeName,
          familyDets.RelationshipId = element.relationship,
          familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01" : moment(new Date(element.DOB)).format('YYYY-MM-DD'),
          familyDets.LstClaims = element.lstClaim,
          familyDets.IsEmployed = element.FamilyisEmployed == null ? false : element.FamilyisEmployed,
          familyDets.EmployeeId = this.employeedetails.Id,
          familyDets.Modetype = element.Modetype,
          familyDets.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          familyDets.CandidateDocument = element.CandidateDocument
          familyDets.FamilyEmployeeID = element.FamilyEmployeeID
          familyDets.IsDependent = element.IsDependent
          familyDets.IsNominee = element.IsNominee
          familyDets.Occupation = element.Occupation
          familyDets.Salutation = element.Salutation

          
        this.FamilyDetails.push(familyDets)
      });
      // this.employeedetails.EmpFamilyDtls = this.FamilyDetails;
    }

    if (this.deletedLstNominee.length > 0) {
      var lstFamilyDetails = [];
      this.deletedLstNominee.forEach(element => {
        if (!this.essService.isGuid(element.Id)) {
          var familyDets = new CandidateFamilyDetails();
          familyDets.Name = element.nomineeName,
            familyDets.RelationshipId = element.relationship,
            familyDets.DOB = element.DOB == null || element.DOB == '' ? "1900-01-01" : element.DOB,
            familyDets.LstClaims = element.lstClaim,
            familyDets.IsEmployed = element.FamilyisEmployed,
            familyDets.Modetype = element.Modetype,
            familyDets.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
            familyDets.CandidateDocument = element.CandidateDocument;
            familyDets.FamilyEmployeeID = element.FamilyEmployeeID
            familyDets.IsDependent = element.IsDependent
            familyDets.IsNominee = element.IsNominee
            familyDets.Occupation = element.Occupation
            familyDets.Salutation = element.Salutation
          lstFamilyDetails.push(familyDets);
        }
      });

      this.FamilyDetails = lstFamilyDetails.length > 0 ?
      this.FamilyDetails.concat(lstFamilyDetails) :
      this.FamilyDetails;
    }

    this.employeedetails.EmpFamilyDtls =
    this.FamilyDetails;


  }

  ngOnDestroy() {
    this.subscribeEmitter();

  }

  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      this.familyChangeHandler.emit(this.employeedetails);
    }
  }

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
    let proofType = this.employeeForm.get('idProoftype').value;
    if (proofType && this.fileList.length > 0) {

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

        this.familyFileName = ` ${this.employeedetails.FirstName == null ? '' : this.employeedetails.FirstName.replace(/\s/g, "")}_nomineeDocs${new Date().getTime().toString()}.zip`;  //files[0].name;

        if (files && files[0]) {
          for (let i = 0; i < files.length; i++) {
            let b: any = new Blob([files[i]], { type: '' + files[i].type + '' });
            zip.file(files[i].name, b, { base64: true });
          }

          zip.generateAsync({
            type: "base64",
          }).then((_content) => {
            if (_content && this.familyFileName) {
              if (this.familyDocumentId) {
                if (this.essService.isGuid(this.popupId)) {

                  this.deleteAsync();
                }
                this.doAsyncUpload(_content, this.familyFileName);
              }
              else {
                this.doAsyncUpload(_content, this.familyFileName);
              }

            }
          });
        }

      } else {
        this.validate_and_binding_nominee_info();
      }
    }
    else if (this.fileList.length == 0 && proofType == null) {
      this.addNewNominee();
    } else if (this.fileList.length == 0 && proofType !== null) {
      this.alertService.showWarning('Attachment is required')
    }
    else if (this.fileList.length == 0) {
      this.addNewNominee();
    }
    else {
      this.alertService.showWarning("Please select Id proof.");
    }
  }

  doDeleteFile(file) {
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
        this.familyFileName = null;
        this.familyDocumentId = null;
        this.employeeForm.controls['IsFamilyDocumentDelete'].setValue(true);
        this.employeeForm.controls['familyDocumentId'].setValue(null);
        this.employeeForm.controls['familyFileName'].setValue(null);
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

    this.fileuploadService.deleteObjectStorage((this.familyDocumentId)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.familyDocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.employeeForm.controls['DocumentId'].setValue(null);
          this.employeeForm.controls['FileName'].setValue(null);
          this.FileName = null;
          this.employeeForm.controls['I sDocumentDelete'].setValue(false);
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

            this.employeeForm.controls['familyDocumentId'].setValue(apiResult.Result);
            this.employeeForm.controls['familyFileName'].setValue(this.familyFileName);
            if (this.popupId && this.essService.isGuid(this.popupId)) {
              this.employeeForm.controls['IsFamilyDocumentDelete'].setValue(false);
            }


            this.familyDocumentId = apiResult.Result;
            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("Awesome..., You have successfully uploaded this file");
            this.isFileChange = false;
            this.validate_and_binding_nominee_info();

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

  calculateAge() {
    if(this.employeeForm.controls.DOB.value) {
      let birthDate = moment(this.employeeForm.controls.DOB.value);
      let currentDate = moment();
      this.dobAge = currentDate.diff(birthDate, 'years');
    }    
  }

  calculateAgeForList(birthDate) {   
    if(birthDate) {
      birthDate = moment(birthDate) 
      let currentDate = moment();
      let age = currentDate.diff(birthDate, 'years');      
      return '(' + age + ' years)'
    } else {
      return '-'
    }
  }
   async fetchFamilyEmployeeDetails() {
     if (this.employeedetails.Code === this.employeeForm.get('FamilyEmployeeID').value) {
       this.alertService.showWarning("The entered employee ID cannot be the same as your ID");
     } else {
      this.loadingScreenService.startLoading();

      const data = await this.employeeService.validateEmployeeAndGetDetailsById(this.employeeForm.get('FamilyEmployeeID').value, 1).subscribe(response => {
        try {
          console.log('response', response);
          if (response.Result == '') {
            this.isValidFamilyEmployeeId = false
          }
          let res = JSON.parse(response.Result)
          if (res.length > 0) {
            this.employeeForm.controls['nomineeName'].setValue(res[0].FirstName)
            this.employeeForm.controls['DOB'].setValue(new Date(res[0].DateOFBirth))
            this.isValidFamilyEmployeeId = true
          }
          this.loadingScreenService.stopLoading();
  
        } catch (error) {
          this.alertService.showWarning("The specified Employee ID does not exists")
          this.loadingScreenService.stopLoading();
        }
      })
    }
  }

  isFamilyEmployeedToggle() {
    if (this.employeeForm.get('FamilyisEmployed').value) {
      if (this.isAllenDigital) {
        this.showOccupation = false
        this.employeeForm.controls['nomineeName'].disable()
        this.employeeForm.controls['DOB'].disable()
        this.employeeForm.controls['Occupation'].reset();
      }
    } else {
      this.employeeForm.controls['FamilyEmployeeID'].reset();
      if (this.isAllenDigital) {
        this.showOccupation = true
        this.employeeForm.controls['nomineeName'].enable()
        this.employeeForm.controls['DOB'].enable()
        this.employeeForm.controls['nomineeName'].setValue(null);
        this.employeeForm.controls['DOB'].setValue(null);
        this.dobAge = 0;
      }
      this.isValidFamilyEmployeeId = true
    }
  }

  /* #endregion */
}