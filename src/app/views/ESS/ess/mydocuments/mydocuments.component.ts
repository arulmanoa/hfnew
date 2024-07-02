import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import * as JSZip from 'jszip'; //JSZip

import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, DownloadService, EmployeeService, ESSService, FileUploadService, HeaderService, OnboardingService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { FamilyDocumentCategoryist, FamilyInfo } from 'src/app/_services/model/OnBoarding/FamilyInfo';
import { LoginResponses } from 'src/app/_services/model';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ApprovalStatus } from 'src/app/_services/model/OnBoarding/QC';
import { ClaimType } from 'src/app/_services/model/Candidates/CandidateFamilyDetails';
import { Relationship } from 'src/app/_services/model/Base/HRSuiteEnums';
import { FamilyDetails } from 'src/app/_services/model/Employee/FamilyDetails';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { CandidateDocuments } from 'src/app/_services/model/Candidates/CandidateDocuments';
import * as moment from 'moment';
import { UUID } from 'angular2-uuid';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import Swal from 'sweetalert2';
import { DatePipe } from '@angular/common';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { DocumentsModalComponent } from 'src/app/shared/modals/documents-modal/documents-modal.component';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { DomSanitizer } from '@angular/platform-browser';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { NgxSpinnerService } from "ngx-spinner";
import { NoPanDeclarationModelComponent } from 'src/app/shared/modals/no-pan-declaration-model/no-pan-declaration-model.component';
import { environment } from 'src/environments/environment';
import { arrayJoin } from 'src/app/utility-methods/utils';
@Component({
  selector: 'app-mydocuments',
  templateUrl: './mydocuments.component.html',
  styleUrls: ['./mydocuments.component.css']
})
export class MydocumentsComponent implements OnInit {
  // DATA COMMUNICATION B/W TWO COMPONENTS
  @Input() employeedetails: EmployeeDetails;
  @Input() DocumentInfoListGrp: any;
  @Input() lstlookUpDetails: EmployeeLookUp;
  @Output() mydocumentsChangeHandler = new EventEmitter();

  // ** forms on submit validation ** //
  submitted = false;
  disableBtn = false;
  spinner: boolean = true;
  isEnbleNomineeBtn: boolean = true;
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
  // documents
  documentTbl = [];
  duplicateDocumentTbl = [];
  DocumentList: any[] = [];
  DocumentCategoryist = [];
  lstDocumentDetails: CandidateDocuments[] = [];
  edit_document_lst = [];
  deleted_DocumentIds_List = [];
  _OldEmployeeDetails: any;
  employeeLetterTransactions: any[] = [];
  documentURL: any = null; // end
  DocumentTypeList = [];
  labelMobileNumber: any;
  labelEmail: any;
  modalOption: NgbModalOptions = {};
  documentURLId: any;
  contentmodalurl: any;
  rejectedLst = [];

  zipFileUrl: any;//JSZIP
  downLoadFileName: any;//JSZIP
  docList: any[];//jszip
  allowedToSave: boolean = true;
  arrayJoin = arrayJoin;
  constructor(
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    private onboardingService: OnboardingService,
    private datePipe: DatePipe,
    private modalService: NgbModal,
    private loadingScreenService: LoadingScreenService,
    private sanitizer: DomSanitizer,
    private employeeService: EmployeeService,
    private Customloadingspinner: NgxSpinnerService,
    private downloadService: DownloadService


  ) {
    this.createReactiveForm();
  }

  get g() { return this.employeeForm.controls; } // reactive forms validation 


  createReactiveForm() {
    this.isESSLogin = true;
    this.employeeForm = this.formBuilder.group({


    });
  }


  ngOnInit() {
    console.log('in Doc comp')
    this.doRefresh();
    this.employeeForm.valueChanges.subscribe((changedObj: any) => {
      this.subscribeEmitter();
    });
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

    this.allowedToSave = environment.environment.AllowedRolesToSaveEmployeeDetails &&
      environment.environment.AllowedRolesToSaveEmployeeDetails.includes(this.RoleCode) ? true : false;

    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;
      this.GetEmployeeRequiredDocumentetails().then((obj) => {
        this.Common_GetEmployeeAccordionDetails('isDocumentInfo').then((obj1) => {
          this._loadEmpUILookUpDetails().then((obj2) => {
            // this.onDocumentClick().then((obj3) => {
            this.patchEmployeeForm();
            return;
            // })
          })

        });

      });

    } else {
      this.isESSLogin = false;
      this.EmployeeId = this.employeedetails != null ? this.employeedetails.Id : 0;
      console.log(this.DocumentInfoListGrp)
      if (this.employeedetails.Id == null) {
        this.Common_GetEmployeeAccordionDetails('isDocumentInfo').then((obj1) => {
          this.patchEmployeeForm();
          return;
        })
      } else {
        this.spinner = false;
        this.patchEmployeeForm();
        return;
      }
    }


  }
  patchEmployeeForm() {

    // For Candidate Documents accordion (Edit)
    this.lstDocumentDetails = []
    this.DocumentCategoryist = this.DocumentInfoListGrp != null ? this.DocumentInfoListGrp.DocumentCategoryist : [];;
    console.log('d', this.DocumentCategoryist);
    console.log('e', this.employeedetails)
    this.employeeService.getActiveTab(false);
    if (this.employeedetails.CandidateDocuments != null && this.employeedetails.CandidateDocuments.length > 0) {
      this.employeedetails.CandidateDocuments.forEach(element => {

        console.log(element.DocumentTypeId);
        // console.log(this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id);
        // console.log(element.DocumentTypeId == this.DocumentTypeList.find(a => a.Code == 'ProfileAvatar').Id);

        if (element.IsSelfDocument == true) {
          this.lstDocumentDetails.push(element);
          this.edit_document_lst.push(
            {
              CandidateId: element.CandidateId,
              DocumentId: element.DocumentId,
              DocumentTypeId: element.DocumentTypeId,
              DocumentNumber: element.DocumentNumber,
              FileName: element.FileName,
              ValidFrom: element.ValidFrom,
              ValidTill: element.ValidTill,
              Id: element.Id,
              Status: element.Status,
              Modetype: element.Modetype,
              DocumentCategoryId: element.DocumentCategoryId
            }
          )

          console.log('sdfd', this.lstDocumentDetails);
          console.log('edit_document_lst', this.edit_document_lst);

          element.Status == ApprovalStatus.Rejected && this.rejectedDocs_init(element, "Document_Details");

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
                      console.log(this.contentmodalurl);
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
    if (this.employeedetails.LstEmployeeLetterTransactions != null && this.employeedetails.LstEmployeeLetterTransactions.length > 0) {
      this.employeeLetterTransactions = this.employeedetails.LstEmployeeLetterTransactions;
      this.employeeLetterTransactions.forEach(e => {
        e['TemplateCategroyDescription'] = this.lstlookUpDetails != null && this.lstlookUpDetails.TemplatecategoryList.find(a => a.Id == e.TemplateCategoryId).Description;
        e['TemplateCategroyCode'] = this.lstlookUpDetails != null && this.lstlookUpDetails.TemplatecategoryList.find(a => a.Id == e.TemplateCategoryId).Code;
      });
    }
    this.onDocumentClick()

  }

  rejectedDocs_init(element, AccordionName) {
    this.rejectedLst.push({
      CandidateId: AccordionName == "Client_Approvals" ? element.EntityId : element.CandidateId,
      FileName: element.DocumentName,
      Remarks: AccordionName == "Client_Approvals" ? element.RejectionRemarks : element.Remarks,
      Accordion: AccordionName
    });
  }

  // FOR DOCUMENT UPLOAD, EDIT AND WORKFLOW

  onDocumentClick() {

    const pro = new Promise((res, rej) => {
      this.onboardingService.getDocumentList(this.employeedetails.EmploymentContracts[0].CandidateId, this.CompanyId, this.employeedetails.EmploymentContracts[0].ClientId, this.employeedetails.EmploymentContracts[0].ClientContractId, 0, false, 6)
        .subscribe(authorized => {

          let apiResult: apiResult = (authorized);
          try {
            this.DocumentList = JSON.parse(apiResult.Result);
            let isConsultant: boolean = false;
            if (this.BusinessType == 1 && this.employeedetails.EmploymentContracts[0].ClientId == environment.environment.ACID) {

              isConsultant = this.employeedetails && this.employeedetails.EmploymentContracts != null && this.employeedetails.EmploymentContracts.length > 0 &&
                this.employeedetails.EmploymentContracts[0].EmploymentType != null && this.employeedetails.EmploymentContracts[0].EmploymentType > 0 && this.employeedetails.EmploymentContracts[0].EmploymentType == environment.environment.ConsultantEmploymentTypeId ? true : false;

            }

        

            this.DocumentList.forEach(element => {

              if (isConsultant && environment.environment.OtherMandatoryDocumentTypeForEmployee.includes(element.DocumentTypeCode)) {
                element.IsMandatory = 'False';
              }

              element['DocumentId'] = null;
              element['CategoryType'] = null;
              element['FileName'] = null;
              // element['Id'] = 0;
              element['DeletedIds'] = null;

            });

            this.documentTbl = [];
            this.DocumentList.forEach(element => {

              this.documentTbl.push(element);

            });







            this.documentTbl.forEach(element_new => {


              //   element_new.CategoryType =  element_new.CategoryType.filter(
              //   (obj, index, self) =>
              //     index === self.findIndex((o) => o.Id === obj.Id)
              // );


              let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == element_new.DocumentTypeId)).ApplicableCategories;

              (Object.keys(element_new).forEach(key => {

                let i = tem_c.find(a => a.Name == key);
                if (i != undefined) {
                  i['isChecked'] = element_new[key] == 1 ? true : false;
                }

              }));

              element_new.CategoryType = tem_c;


            });


            if (this.EmployeeId != 0 || this.EmployeeId == 0) {

              this.documentTbl.forEach(element_new => {


                this.edit_document_lst.forEach(ele_edit => {

               

                  if (Number(element_new.DocumentTypeId).toString() == Number(ele_edit.DocumentTypeId).toString()) {

                    let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == ele_edit.DocumentTypeId)).ApplicableCategories;

                    if (tem_c.length > 0) {
                      tem_c = tem_c.filter(
                        (obj, index, self) =>
                          index == self.findIndex((o) => o.Id == obj.Id)
                      );
                      console.log('tem_c', tem_c);
                    }

                    (Object.keys(element_new).forEach(key => {

                      tem_c.forEach(e3 => {
                        if (e3.Id == ele_edit.DocumentCategoryId) {
                          e3.isChecked = true;
                        } else {
                          if (element_new.CategoryType != undefined && element_new.CategoryType != null && element_new.CategoryType.length > 0 && element_new.CategoryType.find(a => a.Id == e3.Id) != undefined && element_new.CategoryType.find(a => a.Id == e3.Id).isChecked) {
                            e3.isChecked = true;
                          }
                        }
                      });
                      // let i = tem_c.find(a => a.Name == key);
                      // if (i != undefined) {
                      //   i['isChecked'] = element_new[key] == 1 ? true : false;
                      // }

                    }));

                    element_new.DocumentId = ele_edit.DocumentId
                    element_new.DocumentNumber = ele_edit.DocumentNumber
                    element_new.CandidateId = ele_edit.CandidateId
                    element_new.FileName = ele_edit.FileName
                    element_new.ValidFrom = (this.datePipe.transform(ele_edit.ValidFrom, "yyyy-MM-dd"))
                    element_new.ValidTill = (this.datePipe.transform(ele_edit.ValidTill, "yyyy-MM-dd"))
                    // element_new.Id = ele_edit.Id
                    element_new.Status = ele_edit.Status
                    element_new.CategoryType = tem_c;// element_new[tem_c.find(d=>d.Name)]

                  }

                });


              });
              this.documentTbl = _.orderBy(this.documentTbl, ["DocumentNumber"], ["asc"]);
              console.log('sdddsdfdsaf', this.edit_document_lst);

            }

            console.log('documentTbl', this.documentTbl);

            if (this.documentTbl.length > 0) {
              if (this.employeedetails.Gender == 1 as any) {
                this.documentTbl = this.documentTbl.filter(item =>
                  item.DocumentTypeCode != 'UniformGuidelinesForFemale'
                );
              } else if (this.employeedetails.Gender == 2 as any) {
                this.documentTbl = this.documentTbl.filter(item =>
                  item.DocumentTypeCode != 'UniformGuidelinesForMale'
                );
              }
              else {
                this.documentTbl = this.documentTbl.filter(item =>
                  item.DocumentTypeCode != 'UniformGuidelinesForMale' && item.DocumentTypeCode != 'UniformGuidelinesForFemale'
                );
              }
            }

            res(true);

            this.spinner = false;
            // this.should_spin_onboarding = false;
          } catch (error) {
            this.spinner = false;
            // this.should_spin_onboarding = false;
          }



        }), ((err) => {

        });
    });
    return pro;



  }

  document_file_edit(item) {

    this.document_file_upload(item);

  }

  document_file_delete(item) {

    console.log('item', item);
    console.log();

    this.alertService.confirmSwal("Are you sure you want to delete this document?", "Do you really want to delete these document?  After you delete this item you will not able to get this!", "Yes, Delete").then(result => {

      try {
        item.CategoryType.forEach(element_doc => {

          var doc = this.lstDocumentDetails.find(a => Number(a.DocumentTypeId) == Number(item.DocumentTypeId) && Number(a.DocumentCategoryId) == Number(element_doc.Id));

          if (doc != undefined && doc.Id != 0) {

            doc.Modetype = UIMode.Delete;
          }
          else {
            const index = this.lstDocumentDetails.indexOf(doc);
            this.lstDocumentDetails.splice(index, 1);
          }
        });

        let OldDocumentDetails = this._OldEmployeeDetails != null && this._OldEmployeeDetails.CandidateDocuments != null && this._OldEmployeeDetails.CandidateDocuments.length > 0 ? this._OldEmployeeDetails.CandidateDocuments : null;
        if (OldDocumentDetails != null) {

          let alreadyExists = OldDocumentDetails.find(a => a.DocumentId == item.DocumentId) != null ? true : false;
          if (alreadyExists == false) {
            this.deleted_DocumentIds_List.push({ Id: item.DocumentId });
          }
        }

        var table_doc = this.documentTbl.find(a => a.CandidateDocumentId == item.CandidateDocumentId && a.DocumentTypeId == item.DocumentTypeId);

        table_doc.DocumentId = null;
        table_doc.CandidateId = null;
        table_doc.CandidateDocumentId = null;
        table_doc.DeletedIds = null;
        table_doc.FileName = null;
        table_doc.DocumentNumber = null;
        table_doc.ValidFrom = null;
        table_doc.ValidTill = null;
        table_doc.Status = null;
        table_doc.ValidTill = null;
        table_doc.CategoryType.forEach(element => {
          element.isChecked = false;
        });

      } catch (error) {

        console.log('exceptions ', error);

      }
      this.subscribeEmitter();

    }).catch(error => {

    });



  }



  document_file_upload(item) {
    console.log('clicked doc is--->', item);
    if (item.DocumentName == 'Non PAN holder') {
      let OldDocumentDetails = this._OldEmployeeDetails != null && this._OldEmployeeDetails.CandidateDocuments != null && this._OldEmployeeDetails.CandidateDocuments.length > 0 ? this._OldEmployeeDetails.CandidateDocuments : null;
      const modalRef = this.modalService.open(NoPanDeclarationModelComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.jsonObj = item;
      modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;

      var objStorageJson = JSON.stringify({ IsCandidate: false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {

        if (result != "Modal Closed") {



          item.Status = result.Status;
          item.DocumentNumber = result.DocumentNumber;
          item.CategoryType = result.CategoryType;
          item.FileName = result.FileName;
          item.DocumentId = result.DocumentId;
          item.ValidTill = result.ValidTill;
          item.ValidFrom = result.ValidFrom;



          result.CategoryType.forEach(element_doc => {


            var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete);

            if (doc == null && element_doc.isChecked == true) {

              this.add_edit_document_details(result, element_doc, item, true)
            }
            if (doc != null && element_doc.isChecked == true) {

              // doc.Id = result.Id;
              doc.DocumentId = result.DocumentId;
              doc.DocumentNumber = result.DocumentNumber;
              doc.FileName = result.FileName;
              doc.ValidTill = result.ValidTill;
              doc.ValidFrom = result.ValidFrom;
              doc.Modetype = UIMode.Edit;
              doc.Status = doc.Status != ApprovalStatus.Approved ? ApprovalStatus.Pending : doc.Status;

            }
            if (doc != null && element_doc.isChecked == false) {

              let alreadyExists = OldDocumentDetails != undefined && OldDocumentDetails != null && OldDocumentDetails.find(a => a.DocumentId == result.DocumentId) != null ? true : false;
              if (alreadyExists) {
                doc.Modetype = UIMode.Delete;
              }
              else {
                const index = this.lstDocumentDetails.indexOf(doc);
                this.lstDocumentDetails.splice(index, 1);
              }

            }

          });

          this.subscribeEmitter();

        }
      }).catch((error) => {
        console.log(error);
      });
    } else {
      let OldDocumentDetails = this._OldEmployeeDetails != null && this._OldEmployeeDetails.CandidateDocuments != null && this._OldEmployeeDetails.CandidateDocuments.length > 0 ? this._OldEmployeeDetails.CandidateDocuments : null;
      const modalRef = this.modalService.open(DocumentsModalComponent, this.modalOption);
      modalRef.componentInstance.UserId = this.UserId;
      modalRef.componentInstance.jsonObj = item;
      modalRef.componentInstance.OldDocumentDetails = OldDocumentDetails;
      modalRef.componentInstance.DocumentNumber = item.DocumentTypeId == environment.environment.AadhaarDocumentTypeId ? this.employeedetails.Aadhaar : item.DocumentTypeId == environment.environment.PANDocumentTypeId ? this.employeedetails.PAN : null;

      var objStorageJson = JSON.stringify({ IsCandidate: false, EmployeeId: this.employeedetails.EmploymentContracts[0].EmployeeId, CompanyId: this.CompanyId, ClientId: this.employeedetails.EmploymentContracts[0].ClientId, ClientContractId: this.employeedetails.EmploymentContracts[0].ClientContractId })
      modalRef.componentInstance.objStorageJson = objStorageJson;
      modalRef.result.then((result) => {

        if (result != "Modal Closed") {

          if (item.DocumentTypeId == environment.environment.AadhaarDocumentTypeId) {
            this.employeedetails.Aadhaar = result.DocumentNumber
          }

          if (item.DocumentTypeId == environment.environment.PANDocumentTypeId) {
            this.employeedetails.PAN = result.DocumentNumber
          }

          item.Status = result.Status;
          item.DocumentNumber = result.DocumentNumber;
          item.CategoryType = result.CategoryType;
          item.FileName = result.FileName;
          item.DocumentId = result.DocumentId;
          item.ValidTill = result.ValidTill;
          item.ValidFrom = result.ValidFrom;



          result.CategoryType.forEach(element_doc => {


            var doc = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == element_doc.Id && a.Modetype != UIMode.Delete);

            if (doc == null && element_doc.isChecked == true) {

              this.add_edit_document_details(result, element_doc, item, true)
            }
            if (doc != null && element_doc.isChecked == true) {

              // doc.Id = result.Id;
              doc.DocumentId = result.DocumentId;
              doc.DocumentNumber = result.DocumentNumber;
              doc.FileName = result.FileName;
              doc.ValidTill = result.ValidTill;
              doc.ValidFrom = result.ValidFrom;
              doc.Modetype = UIMode.Edit;
              doc.Status = doc.Status != ApprovalStatus.Approved ? ApprovalStatus.Pending : doc.Status;

            }
            if (doc != null && element_doc.isChecked == false) {

              let alreadyExists = OldDocumentDetails != undefined && OldDocumentDetails != null && OldDocumentDetails.find(a => a.DocumentId == result.DocumentId) != null ? true : false;
              if (alreadyExists) {
                doc.Modetype = UIMode.Delete;
              }
              else {
                const index = this.lstDocumentDetails.indexOf(doc);
                this.lstDocumentDetails.splice(index, 1);
              }

            }

          });

          this.subscribeEmitter();

        }
      }).catch((error) => {
        console.log(error);
      });
    }

  }
  // Candidate information details ** region begin **

  add_edit_document_details(result, element_doc, item, area: any) {

    if (area) {

      let ListDocumentList: CandidateDocuments = new CandidateDocuments();
      ListDocumentList.Id = 0;
      ListDocumentList.CandidateId = this.EmployeeId != 0 ? this.employeedetails.EmploymentContracts[0].CandidateId : 0;
      ListDocumentList.IsSelfDocument = true;
      ListDocumentList.DocumentId = result.DocumentId;
      ListDocumentList.DocumentCategoryId = element_doc.Id;
      ListDocumentList.DocumentTypeId = item.DocumentTypeId;
      ListDocumentList.DocumentNumber = result.DocumentNumber;
      ListDocumentList.FileName = result.FileName;
      ListDocumentList.ValidFrom = result.ValidFrom;
      ListDocumentList.ValidTill = result.ValidTill;
      ListDocumentList.Status = ApprovalStatus.Pending;
      ListDocumentList.IsOtherDocument = false;
      ListDocumentList.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
      ListDocumentList.DocumentCategoryName = "";
      ListDocumentList.StorageDetails = null;
      this.addCandidateDocumentList(ListDocumentList);

    }
    else {

      if (this.essService.isGuid(result.Id) && !area) {

        let already_exists = this.lstDocumentDetails.find(a => a.DocumentTypeId == item.DocumentTypeId) != null ? true : false;
        if (already_exists == false) {
        } else {

          let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)


          if (isexists != null) {
            const index = this.lstDocumentDetails.indexOf(isexists);
            this.lstDocumentDetails.splice(index, 1);
          }



        }

      }
      else {

        let isexists = this.lstDocumentDetails.find(x => x.Id == result.Id && x.DocumentTypeId == item.DocumentTypeId && x.DocumentCategoryId == element_doc.Id)

        if (isexists != null) {


          isexists.Modetype = area == true ? UIMode.Edit : UIMode.Delete;
          isexists.DocumentId = result.DocumentId;

        }
      }

    }
    this.subscribeEmitter();

  }
  public async addCandidateDocumentList(listDocs) {
    await this.lstDocumentDetails.push(listDocs);
  }

  downloadDocs(item, whichdocs) {
    this.loadingScreenService.startLoading();
    this.fileuploadService.downloadObjectAsBlob(item.DocumentId)
      .subscribe(res => {
        if (res == null || res == undefined) {
          this.alertService.showWarning('Sorry, unable to get the document. Please get in touch with the support team');
          return;
        }
        saveAs(res, whichdocs == 'official' ? item.TemplateCategroyCode : item.DocumentTypeName);
        this.loadingScreenService.stopLoading();
      });
  }

  viewDocs(item, whichdocs) {
    $("#popup_viewDocs1").modal('show');
    const isOnlineKitSelected = item.TemplateCategroyCode == 'JoiningKit' ? true : false;
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.DocumentId;
    console.log('this.documentURLId', this.documentURLId);
    var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
    if (!isOnlineKitSelected && (contentType === 'application/pdf' || contentType.includes('image'))) {
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
    } else if (isOnlineKitSelected || contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }
  }

  injectThis() {
    window.print();
  }

  modal_dismiss_docs() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs1").modal('hide');
  }

  // ess call

  GetEmployeeRequiredDocumentetails() {

    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.EmployeeDocuments).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let employmentObject: EmployeeDetails = apiR.Result as any;
            console.log('LETTER TRANS ::', employmentObject);

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


  Common_GetEmployeeAccordionDetails(accordionName) {
    const promise = new Promise((resolve, reject) => {
      this.spinner = true;
      this.essService.Common_GetEmployeeAccordionDetails(this.employeedetails, accordionName).then((Result) => {
        try {
          this.DocumentInfoListGrp = Result as any;
          this.spinner = false;
          resolve(true);
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

  _loadEmpUILookUpDetails() {
    this.spinner = true;
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
      this.lstDocumentDetails.forEach(element => {
        element.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id;
      });
      this.employeedetails.CandidateDocuments = this.lstDocumentDetails;
      this.employeedetails.Gender = (this.employeedetails.Gender == null ? 0 : this.employeedetails.Gender) as any;

      this.employeeModel.newobj = this.employeedetails;
      this.employeeModel.oldobj = this.employeedetails;

      var Employee_request_param = JSON.stringify(this.employeeModel);
      if (this.employeedetails.Id > 0) {
        this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
          this.loadingScreenService.stopLoading();
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

    this.lstDocumentDetails.forEach(element => {
      element.Id = this.essService.isGuid(element.Id) == true ? 0 : element.Id;
    });
    this.employeedetails.CandidateDocuments = this.lstDocumentDetails;

  }

  ngOnDestroy() {
    this.subscribeEmitter();
  }


  subscribeEmitter() {
    if (this.isESSLogin == false) {
      this.EmitHandler();
      this.mydocumentsChangeHandler.emit(this.employeedetails);
    }
  }

  //NEW Change

  getFilteredCatType(catArr) {
    return catArr.filter((ele) => ele.isChecked);
  }

  checkIsZipFile(item, whicharea) {
    whicharea == 'ClientApproval' ? item['DocumentId'] = item.ObjectStorageId : true;
    whicharea == 'ClientApproval' ? item['FileName'] = item.DocumentName : true;

    var fileNameSplitsArray = item.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      return true;
    } else {
      return false;
    }
  }

  getFileList(item, whicharea) {

    console.log('item', item);

    let DocId = whicharea == 'ClientApproval' ? item.ObjectStorageId : item.DocumentId;

    this.documentURLId = DocId;
    this.docList = [];
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
              this.docList.push(contents.files[filename]);
            }
          });
        });
      })


  }


  document_file_view(item, whichdocs) {

    console.log('item', item);
    $("#popup_viewDocs1").modal('show');

    this.downLoadFileName = item.name;
    var contentType = this.fileuploadService.getContentType(item.name);
    var blob = new Blob([item._data.compressedContent]);
    var file = new File([blob], item.name, {
      type: typeof item,
      lastModified: Date.now()
    });
    console.log(file);
    var reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      var base64String = (reader.result as string).split(",")[1];
      console.log(reader.result);
      if (file !== null) {
        var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(base64String);
        this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);
        console.log(' DOCUMENT URL :', this.documentURL);

      }
    }

  }


  downloadTemplateForm(item) {
    this.loadingScreenService.startLoading();
    let inputValue: any = item.DownloadDocumentId;
    let numericValue: any = 0;
    if (typeof inputValue === 'string') {
      numericValue = Number(inputValue);
    }
    this.downloadService.downloadFile(numericValue);
    this.loadingScreenService.stopLoading();

  }

}
