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
import { GraduationType, } from '../../../../_services/model/Base/HRSuiteEnums';
import { AcademicModalComponent } from 'src/app/shared/modals/academic-modal/academic-modal.component';
import { Qualification, WorkExperience } from 'src/app/_services/model/Candidates/CandidateCareerDetails';
import { CandidateStatus } from 'src/app/_services/model/Candidates/CandidateDetails';
import { NgxSpinnerService } from "ngx-spinner";
import { DatePipe } from '@angular/common';
import { WorkexperienceModalComponent } from 'src/app/shared/modals/workexperience-modal/workexperience-modal.component';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';

@Component({
  selector: 'app-myexperience',
  templateUrl: './myexperience.component.html',
  styleUrls: ['./myexperience.component.css']
})
export class MyexperienceComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() BankInfoListGrp: BankInfo;

  @Output() experienceChangeHandler = new EventEmitter();

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
  modalOption: NgbModalOptions = {};

  // EXPERIECE
  lstExperienceDetails: WorkExperience[] = [];
  deletedLstExperience = [];
  LstExperience: any[] = [];
  rejectedLst = [];
  unsavedDocumentLst = [];
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
    private datePipe: DatePipe,
    private UIBuilderService : UIBuilderService
  ) { }

  ngOnInit() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;

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
    // this.graduationLst = this.utilsHelper.transform(GraduationType) as any;

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
      this.GetEmployeeRequiredExperienceDetails().then((obj) => {
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


        // For Candidate Experience Information accordion (Edit)
        if (this.employeedetails.WorkExperiences != null) {
          this.LstExperience = [];
          this.employeedetails.WorkExperiences.forEach(element => {
            if (element.CandidateDocument != null) {
              element.CandidateDocument.Modetype = UIMode.Edit;
            } this.LstExperience.push({
              Id: element.Id,
              id: element.Id,
              companyName: element.CompanyName,
              enddate: element.EndDate,
              fucntionalArea: null,
              isCurrentCompany: element.IsCurrentCompany,
              isFresher: false,
              lastDrawnSalary: element.LastDrawnSalary,
              noticePeriod: element.NoticePeriod == 0 ? null : element.NoticePeriod,
              rolesAndResponsiabilities: element.ResponsibleFor,
              startdate: element.StartDate,
              title: element.DesignationHeld,
              workLocation: element.WorkLocation,
              CandidateDocument: element.CandidateDocument,
              DocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status == 0 ? 'Pending' : element.CandidateDocument.Status == 1 ? "Approved" : element.CandidateDocument.Status == 2 ? "Rejected" : null,
              isDocumentStatus: element.CandidateDocument == null ? null : element.CandidateDocument.Status,
              Modetype: UIMode.Edit,
              StartDate: this.datePipe.transform(element.StartDate, "dd-MM-yyyy"),
              EndDate: this.datePipe.transform(element.EndDate, "dd-MM-yyyy")
            })

            element.CandidateDocument != null && element.CandidateDocument.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element.CandidateDocument, "Experience_Details");

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

  addExperience(json_edit_object) {

    if (json_edit_object != undefined && json_edit_object.CandidateDocument != null) {
      json_edit_object.DocumentId = json_edit_object.CandidateDocument.DocumentId;
      json_edit_object.FileName = json_edit_object.CandidateDocument.FileName;
    }
    const modalRef = this.modalService.open(WorkexperienceModalComponent, this.modalOption);

    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.id = json_edit_object == undefined ? 0 : json_edit_object.Id;
    modalRef.componentInstance.jsonObj = json_edit_object;
    modalRef.componentInstance.LstExperience = this.LstExperience;
    var objStorageJson = JSON.stringify({ IsCandidate : false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
    modalRef.componentInstance.objStorageJson = objStorageJson;

    modalRef.result.then((result) => {

      if (result != "Modal Closed") {

        result.StartDate = this.datePipe.transform(result.startdate, "dd-MM-yyyy");
        result.EndDate = this.datePipe.transform(result.enddate, "dd-MM-yyyy");

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
          result.isDocumentStatus = ApprovalStatus.Pending;
          result.DocumentStatus = "Pending";

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
          result.isDocumentStatus = ApprovalStatus.Pending;
          result.DocumentStatus = "Pending";
        }

        else {

          result.CandidateDocument = null;
          result.Modetype = this.essService.isGuid(result.Id) == true ? UIMode.Edit : UIMode.Edit;
          result.isDocumentStatus = null;
          result.DocumentStatus = null;
        }
       
        result.id = result.Id
        let isAlreadyExists = false;
        let isSameResult = false;
        isSameResult = _.find(this.LstExperience, (a) => a.Id == result.Id) != null ? true : false;
        if (isSameResult) {
          var foundIndex = this.LstExperience.findIndex(x => x.Id == result.id);
          this.LstExperience[foundIndex] = result;
          // this.angularGrid_Experience.gridService.updateDataGridItemById(result.Id, result, true, true);
        } else {
          this.LstExperience = this.LstExperience.concat(result) as any;

          // this.angularGrid_Experience.gridService.addItemToDatagrid(result);
        }
        this.subscribeEmitter();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  experience_file_edit(item) {
    this.addExperience(item);

  }
  experience_file_delete(item) {
    this.removeSelectedRow(item, "Experience").then((result) => {
    });
    const index: number = this.LstExperience.indexOf(item);
    if (index !== -1) {
      this.LstExperience.splice(index, 1);
    }
    this.subscribeEmitter();


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

        this.deletedLstExperience.push(args);

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
  // ESS


  GetEmployeeRequiredExperienceDetails() {
    const promise = new Promise((resolve, reject) => {
      if (this.employeedetails.WorkExperiences == null || this.employeedetails.WorkExperiences.length == 0) {
        this.employeeService
          .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.Experience).subscribe((result) => {
            console.log('re', result);
            let apiR: apiResult = result;
            if (apiR.Status == true) {
              let expObject: EmployeeDetails = apiR.Result as any;
              this.employeedetails = expObject;
              resolve(true);
            } else {
              resolve(false);
              this.alertService.showWarning(`An error occurred while getting employee details`);
              return;
            }

          }, err => {
            resolve(false);
          })
      }
      else {
        resolve(true);
      }
    })
    return promise;
  }

  doSaveOrSubmit(isSubmit) {

    try {
      this.loadingScreenService.startLoading();
      //this.Customloadingspinner.show();
      this.lstExperienceDetails = [];
      this.LstExperience.forEach(element => {
        var candidateExperienceDetails = new WorkExperience();
        candidateExperienceDetails.CompanyName = element.companyName;
        candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
        candidateExperienceDetails.DesignationHeld = element.title;
        candidateExperienceDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateExperienceDetails.WorkLocation = element.workLocation;
        candidateExperienceDetails.StartDate = element.startdate;
        candidateExperienceDetails.EndDate = element.enddate;
        candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
        candidateExperienceDetails.FunctionalArea = null;
        candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
        candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
        // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
        candidateExperienceDetails.Modetype = element.Modetype,
          candidateExperienceDetails.EmployeeId = this.EmployeeId
        candidateExperienceDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          candidateExperienceDetails.CandidateDocument = element.CandidateDocument
        this.lstExperienceDetails.push(
          candidateExperienceDetails
        )
      });
      this.deletedLstExperience.forEach(element => {
        var candidateExperienceDetails = new WorkExperience();
        candidateExperienceDetails.CompanyName = element.companyName;
        candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
        candidateExperienceDetails.DesignationHeld = element.title;
        candidateExperienceDetails.WorkLocation = element.workLocation;
        candidateExperienceDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
        candidateExperienceDetails.StartDate = element.startdate;
        candidateExperienceDetails.EndDate = element.enddate;
        candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
        candidateExperienceDetails.FunctionalArea = null;
        candidateExperienceDetails.EmployeeId = this.EmployeeId
        candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
        candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
        // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
        candidateExperienceDetails.Modetype = element.Modetype,
          candidateExperienceDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
          candidateExperienceDetails.CandidateDocument = element.CandidateDocument
        this.lstExperienceDetails.push(
          candidateExperienceDetails
        )
      });
  
      this.employeedetails.WorkExperiences = this.lstExperienceDetails;
      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;

      // this.employeedetails.Modetype = UIMode.Edit;
      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;

      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
          //this.Customloadingspinner.hide();
          if (data.Status) {
            this.alertService.showSuccess(data.Message);
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


  /// FINAL HANDLER 

  EmitHandler() {
    this.lstExperienceDetails = [];
    this.LstExperience.forEach(element => {
      var candidateExperienceDetails = new WorkExperience();
      candidateExperienceDetails.CompanyName = element.companyName;
      candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
      candidateExperienceDetails.DesignationHeld = element.title;
      candidateExperienceDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
      candidateExperienceDetails.WorkLocation = element.workLocation;
      candidateExperienceDetails.StartDate = element.startdate;
      candidateExperienceDetails.EndDate = element.enddate;
      candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
      candidateExperienceDetails.FunctionalArea = null;
      candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
      candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
      // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
      candidateExperienceDetails.Modetype = element.Modetype,
        candidateExperienceDetails.EmployeeId = this.EmployeeId
      candidateExperienceDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
        candidateExperienceDetails.CandidateDocument = element.CandidateDocument
      this.lstExperienceDetails.push(
        candidateExperienceDetails
      )
    });
    this.deletedLstExperience.forEach(element => {
      var candidateExperienceDetails = new WorkExperience();
      candidateExperienceDetails.CompanyName = element.companyName;
      candidateExperienceDetails.IsCurrentCompany = element.isCurrentCompany;
      candidateExperienceDetails.DesignationHeld = element.title;
      candidateExperienceDetails.WorkLocation = element.workLocation;
      candidateExperienceDetails.CandidateId = this.employeedetails.EmploymentContracts[0].CandidateId;
      candidateExperienceDetails.StartDate = element.startdate;
      candidateExperienceDetails.EndDate = element.enddate;
      candidateExperienceDetails.ResponsibleFor = element.rolesAndResponsiabilities;
      candidateExperienceDetails.FunctionalArea = null;
      candidateExperienceDetails.EmployeeId = this.EmployeeId
      candidateExperienceDetails.LastDrawnSalary = element.lastDrawnSalary;
      candidateExperienceDetails.NoticePeriod = element.noticePeriod == null ? 0 : element.noticePeriod;
      // this.candidateExperienceDetails.Modetype =  UIMode.Edit;;
      candidateExperienceDetails.Modetype = element.Modetype,
        candidateExperienceDetails.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id,
        candidateExperienceDetails.CandidateDocument = element.CandidateDocument
      this.lstExperienceDetails.push(
        candidateExperienceDetails
      )
    });

    this.employeedetails.WorkExperiences = this.lstExperienceDetails;

  }

  ngOnDestroy() {
    this.subscribeEmitter();

  }
  OnchangeTable() {
    this.subscribeEmitter();
  }

  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      this.experienceChangeHandler.emit(this.employeedetails);
    }
  }

}