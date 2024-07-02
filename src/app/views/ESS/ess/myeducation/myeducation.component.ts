import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import { EmployeeBankDetails } from 'src/app/_services/model/Employee/EmployeeBankDetails';
import { CandidateBankDetails, BankBranchIdentifierType } from 'src/app/_services/model/Candidates/CandidateBankDetails';
import { DomSanitizer } from '@angular/platform-browser';

import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { BankDocumentCategoryList, BankInfo, BankList } from 'src/app/_services/model/OnBoarding/BankInfo';
import { ApprovalStatus, CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
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
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { GraduationType,  } from '../../../../_services/model/Base/HRSuiteEnums';
import { AcademicModalComponent } from 'src/app/shared/modals/academic-modal/academic-modal.component';
import { Qualification } from 'src/app/_services/model/Candidates/CandidateCareerDetails';
import { CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
import { NgxSpinnerService } from "ngx-spinner";
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';



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
  selector: 'app-myeducation',
  templateUrl: './myeducation.component.html',
  styleUrls: ['./myeducation.component.css']
})
export class MyeducationComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() BankInfoListGrp: BankInfo;

  @Output() educationChangeHandler = new EventEmitter();

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

  // EDUCATION
  LstEducation: any[] = [];
  deletedLstEducation = [];
  unsavedDocumentLst = [];
  modalOption: NgbModalOptions = {};
  graduationLst : any[] = [];
  rejectedLst = [];
  lstQualificationDetails: Qualification[] = [];
  MenuId: any;
  allowedToSave: boolean = true;
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
    private modalService: NgbModal,
    private Customloadingspinner: NgxSpinnerService,
    private UIBuilderService : UIBuilderService
  ) {  this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 


  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({


    });
  }

  ngOnInit() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
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
    this.graduationLst = this.utilsHelper.transform(GraduationType) as any;
    let mode = 2; // add-1, edit-2, view, 3   
    this.MenuId = (this.sessionService.getSessionStorage("MenuId")); // need to implement it in feature
    try {
      this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (error) {
      console.log('UI BUILDER ::', error);

    }
    // this.RoleCode = "Test";
    // let companyLogos = this.essService.GetCompanyLogoByBusinessType(this._loginSessionDetails, this.BusinessType);
    // this.clientLogoLink = companyLogos.clientLogoLink;
    // this.clientminiLogoLink = companyLogos.clientminiLogoLink;
    this.allowedToSave = environment.environment.AllowedRolesToSaveEmployeeDetails && 
    environment.environment.AllowedRolesToSaveEmployeeDetails.includes(this.RoleCode) ? true : false;
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      sessionStorage.removeItem('_StoreLstinvestment');
      sessionStorage.removeItem('_StoreLstDeductions');
      sessionStorage.removeItem("_StoreLstinvestment_Deleted");
      sessionStorage.removeItem("_StoreLstDeductions_Deleted");
      this.GetEmployeeRequiredEducationDetails().then((obj) => {
      //   this.Common_GetEmployeeAccordionDetails('isBankInfo').then((obj1) => {
      //     this.GetCompanySettings(this.employeedetails.EmploymentContracts[0].CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId).then((obj3) => {
            this.patchEmployeeForm();

      //     });
      //   });
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

      if (this.employeedetails != null) {
        console.log('this.employeedetails', this.employeedetails);

        // For Candidate Education Information accordion (Edit)
        this.LstEducation = [];
        if (this.employeedetails.Qualifications != null) {
          this.LstEducation = [];
          this.employeedetails.Qualifications.forEach(element => {
            if (element.CandidateDocument != null) {
              element.CandidateDocument.Modetype = UIMode.Edit;
            }

            this.LstEducation.push({
              Id: element.Id,
              id: element.Id,
              GraduationType: this.graduationLst.find(a => a.id == element.GraduationType).name,
              educationDegree: element.EducationDegree,
              yearOfPassing: element.YearOfPassing,
              scoringValue: element.ScoringValue,
              courseType: element.CourseType,
              graduationType: element.GraduationType,
              institutaion: element.InstitutionName,
              scoringType: element.ScoringType,
              universityName: element.UniversityName,
              CandidateDocument: element.CandidateDocument,
              DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
              isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
              Modetype: UIMode.Edit
            })
            element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Education_Details");

          });
        }
       
      }
      this.spinner = false;
    } catch (error) {
      this.spinner = false;
      
      console.log('AN EXCEPTION OCCURRED WHILE GETTING MY EMPLOYMENT DETAILS :', error);

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

  education_file_edit(item)
  {
    this.addEducation(item);
  }
  education_file_delete(item){
    this.removeSelectedRow(item, "Education").then((result) => {
    });
    const index: number = this.LstEducation.indexOf(item);
    if (index !== -1) {
      this.LstEducation.splice(index, 1);
    }
    this.subscribeEmitter();
  }

  addEducation(json_edit_object) {
    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {
      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
    }
    const modalRef = this.modalService.open(AcademicModalComponent, this.modalOption);
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    var objStorageJson = JSON.stringify({ IsCandidate : false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;
    modalRef.componentInstance.LstEducation = this.LstEducation;

    modalRef.result.then((result) => {
      if (result != "Modal Closed") {

        if (result.DocumentId != null && result.DocumentId != 0 && result.IsDocumentDelete == false) {


          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.essService.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = this.essService.isGuid(result.Id) == true ? 0 : result.CandidateDocument == null ? 0 : result.CandidateDocument.Id;
          candidateDets.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
          candidateDets.IsSelfDocument = true;
          candidateDets.DocumentId = result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending;
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;


        }
        else if (result.IsDocumentDelete == true && !this.essService.isGuid(result.Id)) {

          var candidateDets = new CandidateDocuments();
          candidateDets.Id = result.CandidateDocument.Id;
          candidateDets.CandidateId = result.CandidateDocument.CandidateId;
          candidateDets.IsSelfDocument = result.CandidateDocument.IsSelfDocument;
          candidateDets.DocumentId = result.FileName == null ? 0 : result.DocumentId;
          candidateDets.DocumentCategoryId = 0;
          candidateDets.DocumentTypeId = result.idProoftype
          candidateDets.DocumentNumber = "0";
          candidateDets.FileName = result.FileName;
          candidateDets.ValidFrom = null;
          candidateDets.ValidTill = null;
          candidateDets.Status = ApprovalStatus.Pending // 
          candidateDets.IsOtherDocument = true;
          candidateDets.Modetype = UIMode.Edit;
          candidateDets.DocumentCategoryName = "";
          candidateDets.StorageDetails = null;
          result.CandidateDocument = candidateDets;
          result.Modetype = UIMode.Edit;

        }

        else {
          result.CandidateDocument = null;

          result.Modetype = this.essService.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
          result.isDocumentStatus = null;
          result.DocumentStatus = null;
        }
        if(result.CandidateDocument != null){
        result.isDocumentStatus = ApprovalStatus.Pending;
        result.DocumentStatus = "Pending";
        }
        result.id = result.Id
        let isAlreadyExists = false;
        let graduationLst: any;

        graduationLst = this.utilsHelper.transform(GraduationType);
        result.GraduationType = graduationLst.find(a => a.id == result.graduationType).name;


        isAlreadyExists = _.find(this.LstEducation, (a) => a.Id != result.Id && a.graduationType == result.graduationType) != null ? true : false; // not working

        if (isAlreadyExists) {

          this.alertService.showWarning("The specified Education detail already exists");

        } else {

          let isSameResult = false;
          isSameResult = _.find(this.LstEducation, (a) => a.Id == result.Id) != null ? true : false;

          if (isSameResult) {

            var foundIndex = this.LstEducation.findIndex(x => x.Id == result.id);
            this.LstEducation[foundIndex] = result;
            // this.angularGrid_Education.gridService.updateDataGridItemById(result.Id, result, true, true);

          } else {
            this.LstEducation = this.LstEducation.concat(result) as any;

            // this.angularGrid_Education.gridService.addItemToDatagrid(result);
          }

        }
        this.subscribeEmitter();
      }

    }).catch((error) => {
      console.log(error);
    });
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

        this.deletedLstEducation.push(args);

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


  // ESS GET/PUT
  
  GetEmployeeRequiredEducationDetails() {
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Education).subscribe((result) => {
          console.log('re', result);
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let educationObject: EmployeeDetails = apiR.Result as any;
            this.employeedetails = educationObject;
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


  doSaveOrSubmit(isSubmit) {

    try {
      this.loadingScreenService.startLoading();
     // this.Customloadingspinner.show();
      //nominee details
      this.lstQualificationDetails = [];
      this.LstEducation.forEach(element => {
        var candidateQualificationDetails = new Qualification();
        candidateQualificationDetails.GraduationType = element.graduationType;
        candidateQualificationDetails.EducationDegree = element.educationDegree;
        candidateQualificationDetails.CourseType = element.courseType;
        candidateQualificationDetails.InstitutionName = element.institutaion;
        candidateQualificationDetails.UniversityName = element.universityName;
        candidateQualificationDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
        candidateQualificationDetails.ScoringType = element.scoringType;
        candidateQualificationDetails.ScoringValue = element.scoringValue;
        candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
        // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
        candidateQualificationDetails.EmployeeId = this.EmployeeId;
        candidateQualificationDetails.Modetype = element.Modetype,
          candidateQualificationDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          candidateQualificationDetails.CandidateDocument = element.CandidateDocument
        this.lstQualificationDetails.push(
          candidateQualificationDetails
        )
      });
      this.deletedLstEducation.forEach(element => {
        var candidateQualificationDetails = new Qualification();
        candidateQualificationDetails.GraduationType = element.graduationType;
        candidateQualificationDetails.EducationDegree = element.educationDegree;
        candidateQualificationDetails.CourseType = element.courseType;
        candidateQualificationDetails.InstitutionName = element.institutaion;
        candidateQualificationDetails.UniversityName = element.universityName;
        candidateQualificationDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
        candidateQualificationDetails.ScoringType = element.scoringType;
        candidateQualificationDetails.ScoringValue = element.scoringValue;
        candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
        // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
        candidateQualificationDetails.Modetype = element.Modetype,
          candidateQualificationDetails.EmployeeId = this.EmployeeId;
        candidateQualificationDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          candidateQualificationDetails.CandidateDocument = element.CandidateDocument
        this.lstQualificationDetails.push(
          candidateQualificationDetails
        )
      });

      this.employeedetails.Qualifications = this.lstQualificationDetails;
      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;

      // this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;

      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
            this.doRefresh();
          }  else {
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
    this.lstQualificationDetails = [];
    this.LstEducation !=null && this.LstEducation.length > 0 && this.LstEducation.forEach(element => {
      var candidateQualificationDetails = new Qualification();
      candidateQualificationDetails.GraduationType = element.graduationType;
      candidateQualificationDetails.EducationDegree = element.educationDegree;
      candidateQualificationDetails.CourseType = element.courseType;
      candidateQualificationDetails.InstitutionName = element.institutaion;
      candidateQualificationDetails.UniversityName = element.universityName;
      candidateQualificationDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
      candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
      candidateQualificationDetails.ScoringType = element.scoringType;
      candidateQualificationDetails.ScoringValue = element.scoringValue;
      candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
      // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
      candidateQualificationDetails.EmployeeId = this.EmployeeId;
      candidateQualificationDetails.Modetype = element.Modetype,
        candidateQualificationDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
        candidateQualificationDetails.CandidateDocument = element.CandidateDocument
      this.lstQualificationDetails.push(
        candidateQualificationDetails
      )
    });
    this.deletedLstEducation.forEach(element => {
      var candidateQualificationDetails = new Qualification();
      candidateQualificationDetails.GraduationType = element.graduationType;
      candidateQualificationDetails.EducationDegree = element.educationDegree;
      candidateQualificationDetails.CourseType = element.courseType;
      candidateQualificationDetails.InstitutionName = element.institutaion;
      candidateQualificationDetails.UniversityName = element.universityName;
      candidateQualificationDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
      candidateQualificationDetails.YearOfPassing = element.yearOfPassing;
      candidateQualificationDetails.ScoringType = element.scoringType;
      candidateQualificationDetails.ScoringValue = element.scoringValue;
      candidateQualificationDetails.Status = element.status == true ? CandidateStatus.Active : CandidateStatus.InaAtive;;
      // this.candidateQualificationDetails.Modetype =  UIMode.Edit;;
      candidateQualificationDetails.Modetype = element.Modetype,
        candidateQualificationDetails.EmployeeId = this.EmployeeId;
      candidateQualificationDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
        candidateQualificationDetails.CandidateDocument = element.CandidateDocument
      this.lstQualificationDetails.push(
        candidateQualificationDetails
      )
    });

    this.employeedetails.Qualifications = this.lstQualificationDetails;

  }

  ngOnDestroy() {
    this.subscribeEmitter();

  }
  OnchangeTable(){
    this.subscribeEmitter();
  }

  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      this.educationChangeHandler.emit(this.employeedetails);
    }
  }
  
}
