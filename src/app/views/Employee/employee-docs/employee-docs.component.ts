import { Component, OnInit } from '@angular/core';
import { CommonService, AlertService, HeaderService, FileUploadService, OnboardingService, DocumentService, EmployeeService, DownloadService, ESSService } from 'src/app/_services/service';
import { Title } from '@angular/platform-browser';
import { DomSanitizer } from '@angular/platform-browser';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { CandidateDocuments, ApprovalStatus } from 'src/app/_services/model/Candidates/CandidateDocuments';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { apiResult } from 'src/app/_services/model/apiResult';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { UUID } from 'angular2-uuid';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { result } from 'lodash';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { environment } from 'src/environments/environment';
import * as FileSaver from 'file-saver';
import { RequestOptions, ResponseContentType, Http } from '@angular/http';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SearchConfiguration, SearchElement } from '../../personalised-display/models';
import { DataSourceType, InputControlType } from '../../personalised-display/enums';
import * as JSZip from 'jszip'; //JSZip

import { EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { EntityType } from '@services/model/Base/EntityType';
@Component({
  selector: 'app-employee-docs',
  templateUrl: './employee-docs.component.html',
  styleUrls: ['./employee-docs.component.scss']
})
export class EmployeeDocsComponent implements OnInit {
  spinner: boolean = true;
  lsttemplateCategory: any[] = [];
  employeeDetails: any;
  candidateDocuments: any[] = [];
  employeeLetterTransactions: any[] = [];
  documentURL: any = null;
  employeeModel: EmployeeModel = new EmployeeModel();

  //Search Bar
  searchConfiguration: SearchConfiguration;
  monthSearchElement: SearchElement;
  yearSearchElement: SearchElement;
  financialYearSearchElement: SearchElement;


  // DOCUMENT DRAWER
  submitted: boolean = false;
  visible_documentUpload: boolean = false;
  documentForm: FormGroup;
  lstDocument: any[] = [];
  DocumentCategoryist: any[] = [];
  documentCategoryType: any[] = [];
  documentFileName: any = null;
  doctblminDate: Date;
  IsDateRequired: boolean = false;
  isLoading: boolean = true;
  spinnerText: string;
  unsavedDocumentLst: any[] = [];
  filteredDocs: any[] = [];
  newDocumentList: any[] = [];
  isValidCategoryType: boolean = false;
  _loginSessionDetails: LoginResponses;
  clientLogoLink: any;
  clientminiLogoLink: any;
  BusinessType: any;
  selectedDocument: any;
  EmployeeId: number = 0;
  docList: any[];//jszip
  zipFileUrl: any;//JSZIP
  downLoadFileName: any;// jszip

  // JSZip 
  /* #region  After JsZip */
  fileList: any[] = [];
  isFileChange: boolean = false;
  DocList = [];
  acceptOnlyImageFile: boolean = false;
  /* #endregion */

  RoleCode: string = "";
  RoleId: number = 0;
  isESIC: boolean = false;
  DownloadDocumentId: number = 0;
  IsDocumentNumberRequired: boolean = false;
  AccessibleButtons = [];
  NotAccessibleFields = [];
  constructor(
    private headerService: HeaderService,
    private titleService: Title,
    private commonService: CommonService,
    private alertService: AlertService,
    private sanitizer: DomSanitizer,
    private objectApi: FileUploadService,
    private loadingScreenService: LoadingScreenService,
    private onboardingService: OnboardingService,
    private formBuilder: FormBuilder,
    private fileuploadService: FileUploadService,
    private documentService: DocumentService,
    private employeeService: EmployeeService,
    private http: Http,
    public sessionService: SessionStorage,
    private downloadService: DownloadService,
    public essService: ESSService,

  ) {
    this.createForm();
  }
  get g() { return this.documentForm.controls; } // reactive forms validation 

  createForm() {

    this.documentForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      DocumentName: [null, Validators.required],
      DocumentNumber: [null, Validators.required],
      CategoryType: [null],
      ValidFrom: [null],
      ValidTill: [null],
      DocumentId: ['', Validators.required],
      Status: [0],
      FileName: [null],
      IsDocumentDelete: [false], // extra prop
      DeletedIds: ['']
    });



  }

  ngOnInit() {
    this.headerService.setTitle('Employee Details');
    this.titleService.setTitle('Employee Docs');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.clientLogoLink = 'logo.png';
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
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

    this.init();
    this.defineSearchElements();
  }

  init() {
    this.spinner = true;
    this.doctblminDate = new Date();
    this.candidateDocuments = [];
    this.newDocumentList = [];
    this.getEmployeLookUpDetails().then((result) => {
      if (result) {
        this.getEmployeeDetails();
      }
      else {
        this.alertService.showWarning('Exception : An error occurred while getting emplyee document details');
        return;
      }
    });

  }

  defineSearchElements() {
    this.financialYearSearchElement = {
      DisplayName: "Financial Year",
      FieldName: "@financialYearId",
      Value: null,
      MultipleValues: null,
      DropDownList: [],
      InputControlType: InputControlType.AutoFillTextBox,
      DataSource: {
        Name: "GetFinancialYearsForEmployee",
        Type: DataSourceType.SP,
        IsCoreEntity: false,
        EntityType: 0
      },
      ForeignKeyColumnNameInDataset: 'Id',
      DisplayFieldInDataset: 'Code',
      IsIncludedInDefaultSearch: true,
      SendElementToGridDataSource: false,
      ParentFields: ["@employeeId"],
    };

    this.monthSearchElement = {
      DisplayName: "Month",
      FieldName: "@month",
      Value: null,
      MultipleValues: null,
      DropDownList: [],
      InputControlType: InputControlType.AutoFillTextBox,
      DataSource: {
        Name: "MonthView",
        Type: DataSourceType.View,
        IsCoreEntity: false,
        EntityType: 0
      },
      ForeignKeyColumnNameInDataset: 'Id',
      DisplayFieldInDataset: 'MName',
      IsIncludedInDefaultSearch: true,
      SendElementToGridDataSource: false,
      ParentFields: [],
    };

    this.yearSearchElement = {
      DisplayName: "Year",
      FieldName: "@year",
      Value: null,
      MultipleValues: null,
      DropDownList: [],
      InputControlType: InputControlType.AutoFillTextBox,
      DataSource: {
        Name: "YearView",
        Type: DataSourceType.View,
        IsCoreEntity: false,
        EntityType: 0
      },
      ForeignKeyColumnNameInDataset: 'Year',
      DisplayFieldInDataset: 'Year',
      IsIncludedInDefaultSearch: true,
      SendElementToGridDataSource: false,
      ParentFields: [],
    };
  }

  createSearchConfiguration() {
    this.searchConfiguration = new SearchConfiguration();
    this.searchConfiguration.SearchButtonRequired = true;
    this.searchConfiguration.ClearButtonRequired = false;
    this.searchConfiguration.SearchElementList = [
      {
        FieldName: "@employeeId",
        Value: this.employeeDetails.Id,
        MultipleValues: null,
        ParentFields: [],
        IsIncludedInDefaultSearch: false,
        SendElementToGridDataSource: false
      },
      {
        DisplayName: "Type",
        FieldName: "@reportType",
        Value: null,
        MultipleValues: null,
        DropDownList: [],
        InputControlType: InputControlType.AutoFillTextBox,
        DataSource: {
          Name: "GetReportTypesForEmployeeDocuments",
          Type: DataSourceType.SP,
          IsCoreEntity: false,
          EntityType: 0
        },
        ForeignKeyColumnNameInDataset: 'Id',
        DisplayFieldInDataset: 'Name',
        IsIncludedInDefaultSearch: true,
        ParentFields: [],
        FireEventOnChange: true

      }
    ];
  }

  getEmployeLookUpDetails() {
    const promise = new Promise((res, rej) => {
      this.lsttemplateCategory = [];
      this.DocumentCategoryist = [];
      this.commonService.getEmployeeUILookUpDetails(this.EmployeeId).then((result) => {
        if (result != null) {
          console.log('EMPLOYEE LOOK UP DETAILS : ', result);
          const response = result as any;
          this.lsttemplateCategory = response.TemplatecategoryList != null && response.TemplatecategoryList.length > 0 ? response.TemplatecategoryList : [];
          this.DocumentCategoryist = response.DocumentCategoryist;
          res(true)
        } else {
          res(false)
          this.spinner = false;
          this.alertService.showWarning("No records found!.");
        }
      });
    })
    return promise;
  }
  getEmployeeDetails() {
    this.employeeDetails = null;
    this.candidateDocuments = [];
    this.employeeLetterTransactions = [];//sessionStorage.getItem('loginUserId')

    this.employeeService.GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.EmployeeDocuments).subscribe((result) => {
      let apiResult: apiResult = result;
      console.log('EMP REQUIRED DATA PROFILE ::', apiResult)
      if (apiResult.Status && apiResult.Result != null) {
        this.employeeDetails = apiResult.Result as any;
        this.employeeModel.oldobj = Object.assign({}, apiResult.Result as any);

        this.candidateDocuments = this.employeeDetails != null && this.employeeDetails.CandidateDocuments != null && this.employeeDetails.CandidateDocuments.length > 0 ?
          this.employeeDetails.CandidateDocuments : [];
        this.employeeLetterTransactions.length > 0 && this.employeeLetterTransactions.forEach(e => {
          e['TemplateCategroyDescription'] = this.lsttemplateCategory.find(a => a.Id == e.TemplateCategoryId).Description;
          e['TemplateCategroyCode'] = this.lsttemplateCategory.find(a => a.Id == e.TemplateCategoryId).Code;
        });

        if (this.RoleCode == 'Employee') {
          this.getEmployeeConfiguration(this.employeeDetails.EmploymentContracts[0].ClientContractId);
        }

        this.getDocumentList();
        this.createSearchConfiguration();
        this.spinner = false;
      }
      else {
        this.spinner = false;
        this.alertService.showWarning("No records found!.");
      }

    }, err => {

    });
    // this.commonService.getEmployeeDetailsByEmployeeCode(sessionStorage.getItem('loginUserId')).then((result) => {
    //   if (result != null) {
    //     console.log('EMPLOYEE DETAILS : ', result);
    //     this.employeeDetails = result;
    //     this.employeeModel.oldobj = Object.assign({}, result as any);
    //     this.candidateDocuments = this.employeeDetails != null && this.employeeDetails.CandidateDocuments != null && this.employeeDetails.CandidateDocuments.length > 0 ?
    //       this.employeeDetails.CandidateDocuments : [];
    //     // this.employeeLetterTransactions = this.employeeDetails != null && this.employeeDetails.LstEmployeeLetterTransactions != null && this.employeeDetails.LstEmployeeLetterTransactions.length > 0 ?
    //     //   this.employeeDetails.LstEmployeeLetterTransactions : [];
    //     this.employeeLetterTransactions.length > 0 && this.employeeLetterTransactions.forEach(e => {
    //       e['TemplateCategroyDescription'] = this.lsttemplateCategory.find(a => a.Id == e.TemplateCategoryId).Description;
    //       e['TemplateCategroyCode'] = this.lsttemplateCategory.find(a => a.Id == e.TemplateCategoryId).Code;
    //     });
    //     this.getDocumentList();
    //     this.createSearchConfiguration();
    //     this.spinner = false;
    //   } else {
    //     this.spinner = false;
    //     this.alertService.showWarning("No records found!.");
    //   }
    // });
  }



  getFileNameExts(fileName: any) {
    const extenstion = fileName.split('.').pop();
    return extenstion == 'png' || extenstion == 'jpg' ? 'assets/Images/jpeg.png' : extenstion == 'pdf' ? 'assets/Images/pdf.png' : 'assets/Images/copy.png';
  }

  downloadDocs(item, whichdocs) {
    this.loadingScreenService.startLoading();
    this.objectApi.downloadObjectAsBlob(item.DocumentId)
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
    console.log('item', item)
    $("#popup_viewDocs").modal('show');
    this.documentURL = null;
    var contentType = whichdocs != 'official' ? this.objectApi.getContentType(item.FileName) : 'application/pdf';
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.objectApi.getObjectById(item.DocumentId)
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
            console.log(' DOCUMENT URL :', this.documentURL);

          }
        });
    } else if (contentType === 'application/msword' ||
      contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      //   var appUrl = this.objectApi.getUrlToGetObject(item.DocumentId);
      var appUrl = this.objectApi.getUrlToGetObject(item.DocumentId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }

  }

  modal_dismiss() {
    this.documentURL = null;
    $("#popup_viewDocs").modal('hide');
  }

  deleteDocs(item, whichdocs) {

    this.alertService.confirmSwal("Are you sure you want to delete?", "Do you really want to delete these document? After you delete this item you will not able to get this.", "OK, Delete Now").then((result) => {
      if (whichdocs == 'official') {
        var letter = this.employeeLetterTransactions.find(a => a.Id == item.Id)
        if (letter != undefined && letter.Id != 0) {
          letter.Modetype = UIMode.Edit;
          // letter.Status = 0;
        }
        else {
          const index = this.candidateDocuments.indexOf(letter);
        }
      } else {
        var doc = this.candidateDocuments.find(a => a.DocumentTypeId == item.DocumentTypeId && a.DocumentCategoryId == item.DocumentCategoryId && a.Id == item.Id)
        if (doc != undefined && doc.Id != 0) {
          doc.Modetype = UIMode.Delete;
        }
        else {
          console.log('docs', doc);
          console.log('nwq soc', this.newDocumentList
          );

          const index = this.newDocumentList.indexOf(item);
          this.newDocumentList.splice(index, 1);
          this.directDeleteS3Documents(doc.DocumentId);

        }
      }

      console.log('DELETE DOCS : ', this.candidateDocuments);
      console.log('DELETE DOCS : ', this.employeeDetails);

    }).catch(cancel => {

    });
  }
  getDocumentList() {
    this.onboardingService.getDocumentList(this.employeeDetails.EmploymentContracts[0].CandidateId, this.employeeDetails.EmploymentContracts[0].CompanyId, this.employeeDetails.EmploymentContracts[0].ClientId, this.employeeDetails.EmploymentContracts[0].ClientContractId, this.RoleId, false, 6)
      .subscribe(authorized => {
        let apiResult: apiResult = (authorized);
        try {
          if (apiResult.Status) {
            console.log('DOCUMENT LIST :', JSON.parse(apiResult.Result));
            this.lstDocument = JSON.parse(apiResult.Result);

            this.lstDocument.forEach(element => {
              element['CategoryType'] = null;
            });

            this.lstDocument.forEach(element_new => {
              let tem_c = (this.DocumentCategoryist.find(a => a.DocumentTypeId == element_new.DocumentTypeId)).ApplicableCategories;
              (Object.keys(element_new).forEach(key => {
                let i = tem_c.find(a => a.Name == key);
                if (i != undefined) {
                  // i['isChecked'] = element_new[key] == 1 ? true : false;
                  i['isChecked'] = false;
                }
              }));
              element_new.CategoryType = tem_c;
            });
          }
        } catch (error) {
        }
      }), ((err) => {

      });
  }



  onChangeDocumentName(event) {
    this.isESIC = false;
    this.DownloadDocumentId = 0;
    this.IsDocumentNumberRequired = false;

    console.log('DOCS :', event);
    this.selectedDocument = event;
    this.DownloadDocumentId = event.hasOwnProperty("DownloadDocumentId") ? Number(event.DownloadDocumentId) : 0;
    this.IsDocumentNumberRequired = event.hasOwnProperty("IsDocumentNumberRequired") && event.IsDocumentNumberRequired == "False" ? false : true;

    if (!this.IsDocumentNumberRequired) {
      this.essService.updateValidation(false, this.documentForm.get('DocumentNumber'));
    } else {
      this.essService.updateValidation(true, this.documentForm.get('DocumentNumber'));
    }

    const uniqueArr = event.CategoryType.reduce((unique, o) => {
      if (!unique.some(obj => obj.Id === o.Id && obj.Code === o.Code)) {
        unique.push(o);
      }
      return unique;
    }, []);
    this.documentCategoryType = uniqueArr;
    // check if pan , signature or aadhar is selected. 
    // If yes, only image file should be uploaded (for online joining kit purpose)
    this.acceptOnlyImageFile = false;
    if (event.DocumentName.toLowerCase() === 'pan' || event.DocumentName.toLowerCase() === 'profile avatar' ||
      event.DocumentName.toLowerCase() === 'signature' || event.DocumentName.includes('Aadhaar')) {
      this.acceptOnlyImageFile = true;
    }

    if (event.DocumentName.toLowerCase() === 'esic form 1' || event.DocumentName.toLowerCase() === 'esic form' || event.DocumentName.toLowerCase() === 'esic') {
      this.isESIC = true;
    }
    this.getIsDateValidationRequired(event);
  }



  getIsDateValidationRequired(item) {
    return this.IsDateRequired = item != undefined && item != null ? item.IsDateValidationRequired == "True" ? true : false : false;
  }
  onChangetblDate(event) {
    var validFrom = new Date(event);
    this.doctblminDate.setDate(validFrom.getDate() + 1);
  }

  uploadDocs() {
    this.documentForm.controls['Id'].reset();
    this.documentForm.controls['DocumentName'].reset();
    this.documentForm.controls['DocumentNumber'].reset();
    this.documentForm.controls['CategoryType'].reset();
    this.documentForm.controls['ValidFrom'].reset();
    this.documentForm.controls['ValidTill'].reset();
    this.documentForm.controls['DocumentId'].reset();
    this.documentForm.controls['FileName'].reset();
    this.documentForm.controls['IsDocumentDelete'].reset();
    this.documentForm.controls['DeletedIds'].reset();
    this.documentForm.controls['IsDocumentDelete'].reset();
    this.documentCategoryType = [];
    this.documentFileName = null;
    this.isLoading = true;
    this.IsDateRequired = false;
    // console.log('this.employeeDetails.CandidateDocuments', this.employeeDetails.CandidateDocuments);
    console.log('this.lstDocument', this.lstDocument);

    if (this.lstDocument.length > 0) {
      if (this.employeeDetails.Gender == 1) {
        this.lstDocument = this.lstDocument.filter(item =>
          item.DocumentTypeCode != 'UniformGuidelinesForFemale'
        );
      } else if (this.employeeDetails.Gender == 2) {
        this.lstDocument = this.lstDocument.filter(item =>
          item.DocumentTypeCode != 'UniformGuidelinesForMale'
        );
      }
      else {
        this.lstDocument = this.lstDocument.filter(item =>
          item.DocumentTypeCode != 'UniformGuidelinesForMale' && item.DocumentTypeCode != 'UniformGuidelinesForFemale'
        );
      }
    }
    this.filteredDocs = [];
    // var res = this.lstDocument.filter(item1 =>
    //   !this.employeeDetails.CandidateDocuments != null && this.employeeDetails.CandidateDocuments.length > 0 && this.employeeDetails.CandidateDocuments.some(item2 => (Number(item2.DocumentTypeId) === Number(item1.DocumentTypeId) && item2.IsSelfDocument && item2.Modetype != UIMode.Delete)))
    // console.log(res);
    this.filteredDocs = this.lstDocument;
    this.isESIC = false;
    this.visible_documentUpload = true;

  }

  saveDocumentDetails() {
    this.submitted = true;
    // this.isCategoryType = this.jsonObj.CategoryType.find(a => a.isChecked) != null ? true : false;
    // if(!this.isCategoryType){
    //   return;
    // }
    this.isValidCategoryType = this.documentCategoryType.find(a => a.isChecked) != null ? true : false;
    if (!this.isValidCategoryType) {
      return;
    }
    this.commonService.findInvalidControls(this.documentForm).then((result) => {
      console.log('FORM VALIDATOR RESULT :', result);

    })
    if (this.documentForm.invalid) {
      return;
    }
    this.updateCandidateDocumentList()

    let req_param_uri = `CandidateId=${this.employeeDetails.EmploymentContracts[0].CandidateId}&DocumentTypeId=${this.documentForm.get('DocumentName').value}&Documentnumber=${(this.documentForm.get('DocumentNumber').value)}`;
    this.documentService.getDocumentDuplicate(req_param_uri).subscribe((response) => {
      let apiResponse: apiResponse = response;
      if (apiResponse.Status == true) {
        // this.documentForm.controls['DeletedIds'].setValue(this.Lst_deleted_documentId);
        this.documentForm.controls['Status'].setValue(0)

      } else {
        this.alertService.showWarning("An error has occurred : The specified document number already exists.");
      }
      console.log(response);
    })
  }

  updateCandidateDocumentList() {
    console.log('documentCategoryType', this.documentForm.get('Id').value);


    var res1 = this.documentCategoryType.filter(item1 => item1.isChecked &&
      this.candidateDocuments.some(item2 => (Number(item2.DocumentTypeId) == this.documentForm.get('DocumentName').value && item2.IsSelfDocument && item2.DocumentCategoryId == item1.Id)))
    if (res1.length > 0) {
      this.alertService.showWarning('Document Name / Category Type already exists on document sheet. Try another?')
      return;
    } else {
      var isexts = this.candidateDocuments.filter(v => v.DocumentTypeId == this.documentForm.get('DocumentName').value && v.IsSelfDocument && v.DocumentNumber != this.documentForm.get('DocumentNumber').value);
      if (isexts.length > 0) {
        this.alertService.showWarning('You have entered Document Number is not matching with seleted Document Name. Try again!')
        return;
      }
    }

    this.documentCategoryType.forEach(ev => {
      if (ev.isChecked) {
        var candidateDocuments = new CandidateDocuments();
        (candidateDocuments.Id as any) = UUID.UUID(); // this.documentForm.get('Id').value;
        candidateDocuments.CandidateId = this.employeeDetails.EmploymentContracts[0].CandidateId;
        candidateDocuments.IsSelfDocument = true;
        candidateDocuments.DocumentId = this.documentForm.get('DocumentId').value;
        candidateDocuments.DocumentCategoryId = ev.Id;
        candidateDocuments.DocumentTypeId = this.documentForm.get('DocumentName').value;
        candidateDocuments.DocumentNumber = this.documentForm.get('DocumentNumber').value;
        candidateDocuments.FileName = this.documentFileName;
        candidateDocuments.ValidFrom = this.documentForm.get('ValidFrom').value;
        candidateDocuments.ValidTill = this.documentForm.get('ValidTill').value;
        candidateDocuments.Status = ApprovalStatus.Pending;
        candidateDocuments.IsOtherDocument = false;
        candidateDocuments.Modetype = UIMode.Edit;
        candidateDocuments.DocumentCategoryName = this.DocumentCategoryist.find(a => a.DocumentTypeId == Number(candidateDocuments.DocumentTypeId)).DocumentTypeName;
        candidateDocuments.StorageDetails = null;
        candidateDocuments.EmployeeId = this.employeeDetails.Id;
        this.newDocumentList.push(candidateDocuments);
        console.log(this.newDocumentList);

        // this.candidateDocuments.push(candidateDocuments);
      }
    });


    this.visible_documentUpload = false;
  }

  close_documentUpload() {
    if (this.unsavedDocumentLst.length > 0) {
      this.unsavedDocumentLst.forEach(element => {
        try {
          this.unsavedDeleteFile(element.Id);
        } catch (error) {
        }
        this.visible_documentUpload = false;
      });
    } else {
      this.visible_documentUpload = false;
    }
  }


  /* #region  File upload using object stroage (S3) */
  onFileUpload(e) {
    debugger;
    this.documentForm.get('DocumentId').valid;

    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      var maxfilesize = e.target.files[0].size / 1024;
      // if (FileSize > 2) {
      console.log('maxfilesize', maxfilesize);
      console.log('selectedDocument', this.selectedDocument.MaxSize);
      if (maxfilesize > parseFloat(this.selectedDocument.MaxSize)) {
        this.isLoading = true;
        this.alertService.showWarning('The attachment size exceeds the allowable limit.');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";
        this.documentFileName = file.name;
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, this.documentFileName)

      };
    }
  }

  doAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;

      objStorage.EmployeeId = this.employeeDetails.EmploymentContracts[0].EmployeeId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.employeeDetails.EmploymentContracts[0].ClientContractId;
      objStorage.ClientId = this.employeeDetails.EmploymentContracts[0].ClientId;
      objStorage.CompanyId = this.employeeDetails.EmploymentContracts[0].CompanyId;

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

            this.documentForm.controls['DocumentId'].setValue(apiResult.Result);
            this.documentForm.controls['FileName'].setValue(this.documentFileName);

            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")

          }
          else {
            this.documentFileName = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.documentFileName = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.documentFileName = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }
  /* #endregion */

  /* #region  File delete object stroage (S3) */

  doDeleteFile() {

    this.alertService.confirmSwal("Are you sure you want to delete?", "Once deleted,  you cannot undo this action.", "OK, Delete").then(result => {

      // if (this.OldDocumentDetails != null) {
      //   let alreadyExists = this.OldDocumentDetails.find(a => a.DocumentId == this.documentForm.get('DocumentId').value) != null ? true : false;
      //   if (alreadyExists) {
      //     this.Lst_deleted_documentId.push({
      //       Id: this.documentForm.get('DocumentId').value
      //     })
      //     this.documentForm.controls['DocumentId'].setValue(null);
      //     this.documentForm.controls['IsDocumentDelete'].setValue(true);
      //     this.documentForm.controls['FileName'].setValue(null);
      //     this.documentFileName = null;
      //   }
      //   else {
      //     this.deleteAsync();
      //   }
      // } else {
      this.deleteAsync();
      // }

    })
      .catch(error => { });
  }

  deleteAsync() {
    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService.deleteObjectStorage((this.documentForm.get('DocumentId').value)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.documentForm.get('DocumentId').value)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.documentForm.controls['DocumentId'].setValue(null);
          this.documentForm.controls['FileName'].setValue(null);
          this.documentForm.controls['IsDocumentDelete'].setValue(false);
          this.documentFileName = null;
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
  /* #endregion */
  /* #region  Unsaved file delete object storage (S3) */

  unsavedDeleteFile(_DocumentId) {
    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {
          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.documentForm.get('DocumentId').value)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.documentForm.controls['DocumentId'].setValue(null);
          this.documentForm.controls['FileName'].setValue(null);
          this.documentForm.controls['IsDocumentDelete'].setValue(false);
          this.documentFileName = null;
        } else {
        }
      } catch (error) {
      }
    }), ((err) => {
    })
  }

  directDeleteS3Documents(docId) {
    this.fileuploadService.deleteObjectStorage((docId)).subscribe((res) => {
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

        } else {
        }
      } catch (error) {
      }
    }), ((err) => {
    })
  }
  /* #endregion */
  /* #region  GUID checking */
  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid = /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }
  /* #endregion */


  doSaveEmployeeDocuments() {
    this.loadingScreenService.startLoading();
    this.employeeDetails.CandidateDocuments == null ? this.employeeDetails.CandidateDocuments = [] : true;
    this.newDocumentList.length > 0 && this.newDocumentList.forEach(element => {
      element.Id = this.isGuid(element.Id) == true ? 0 : element.Id
      this.employeeDetails.CandidateDocuments.push(element);

    });
    // this.employeeDetails.Modetype = UIMode.Edit;
    this.employeeDetails.Aadhaar = (this.employeeDetails.Aadhaar as any) == 'NULL' ? null : this.employeeDetails.Aadhaar;
    this.employeeModel.newobj = this.employeeDetails;
    var Employee_request_param = JSON.stringify(this.employeeModel);
    this.employeeService.putEmployeeDetails(Employee_request_param).subscribe((data: any) => {
      console.log(data);
      if (data.Status) {
        this.loadingScreenService.stopLoading();
        this.alertService.showSuccess(data.Message);
        this.init();
      }
      else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(data.Message);
        this.init();
      }
    },
      (err) => {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`Something is wrong!  ${err}`);
        console.log("Something is wrong! : ", err);
      });
    console.log('ON SUBMISSION EMPLOYEE DOCS : ', this.employeeDetails);

  }


  getImageSrc(img_url): Observable<any> {
    console.log('GET IMGAGE SRC :: ', img_url);
    let options = new RequestOptions({ responseType: ResponseContentType.Blob });
    return this.http.get(`assets/file/${img_url}`, options)
      .pipe(map(res => res.blob()))

  }

  download_template() {
    environment.environment.EmployeeForms.forEach(element => {
      this.getImageSrc(element).subscribe(
        blob => {
          var fileName = element;
          FileSaver.saveAs(blob, fileName)
        },
        error => {
          console.log(error);
        }
      );
    });
  }

  onSearchElementValueChange(searchElement: SearchElement) {
    console.log("SearchElement value changed  ::", searchElement);

    if (searchElement.FieldName == '@reportType') {

      let reportType = searchElement.DropDownList.find(x => x.Id === searchElement.Value);
      console.log("Report type ::", reportType);

      this.checkForAdditionalSearchCriteria(reportType);
      // if(reportType.Name.toLowerCase() == 'payslip'){
      //   this.searchConfiguration.SearchElementList.push()
      // }
      // else{
      //   this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.filter(x => x.FieldName !== '@financialYear');
      // }
    }


  }

  checkForAdditionalSearchCriteria(reportConfiguration: any) {

    this.searchConfiguration.SearchElementList = this.searchConfiguration.SearchElementList.filter(x =>
      x.FieldName != '@month' && x.FieldName != '@year' && x.FieldName !== '@financialYearId'
    );

    if (reportConfiguration.AdditionalSearchCriteria != undefined && reportConfiguration.AdditionalSearchCriteria != null) {
      let additionalSearchCriteria = reportConfiguration.AdditionalSearchCriteria;

      additionalSearchCriteria.forEach(x => {
        if (x == "Month") {
          this.searchConfiguration.SearchElementList.push(this.monthSearchElement);
        }
        else if (x == "Year") {
          this.searchConfiguration.SearchElementList.push(this.yearSearchElement);
        }
        else if (x == "FinancialYear") {
          this.searchConfiguration.SearchElementList.push(this.financialYearSearchElement);
        }
      })

      console.log("SearchElementlist ::", this.searchConfiguration.SearchElementList);

    }
  }

  onClickingSearchButton(event: any) {
    this.getEmployeeLetterTransaction();
  }

  getEmployeeLetterTransaction() {

    let reportTypeSE: SearchElement = this.searchConfiguration.SearchElementList.find(x => x.FieldName == '@reportType');
    let reportType = reportTypeSE.DropDownList.find(x => x.Id === reportTypeSE.Value);
    let searchParams = {};

    if (reportType.Name.toLowerCase() == 'payslip') {
      let month = this.searchConfiguration.SearchElementList.find(x => x.FieldName == '@month').Value;
      let year = this.searchConfiguration.SearchElementList.find(x => x.FieldName == '@year').Value;

      searchParams["Month"] = month;
      searchParams["Year"] = year;
    }
    else if (reportType.Name.toLowerCase() == 'form16') {
      let financialYear = this.searchConfiguration.SearchElementList.find(x => x.FieldName == '@financialYearId').Value;

      searchParams["FinancialYear"] = financialYear;

    }

    this.employeeService.GetEmployeeOfficialDocuments(this.employeeDetails.Id, reportType.Id, JSON.stringify(searchParams))
      .subscribe(data => {
        console.log(data);
        if (data != undefined && data.Status && data.Result != null && data.Result != '') {

          let result = JSON.parse(data.Result);

          this.employeeLetterTransactions = result;

          this.employeeLetterTransactions.length > 0 && this.employeeLetterTransactions.forEach(e => {
            e['TemplateCategroyDescription'] = this.lsttemplateCategory.find(a => a.Id == e.TemplateCategoryId).Description;
            e['TemplateCategroyCode'] = this.lsttemplateCategory.find(a => a.Id == e.TemplateCategoryId).Code;
          });
        }
        else {
          this.employeeLetterTransactions = [];
        }

      })

  }

  checkIsZipFile(item) {

    var fileNameSplitsArray = item.FileName.split('.');
    var ext = fileNameSplitsArray[fileNameSplitsArray.length - 1];
    if (ext.toUpperCase().toString() == "ZIP") {
      return true;
    } else {
      return false;
    }
  }


  //NEW Change
  getFileList(type: string, item: any, format: string) {
    try {
      this.loadingScreenService.startLoading();
      console.log('item', item);
      let DocId = item.DocumentId;
      this.downLoadFileName = item.FileName;
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
                this.getTargetOffSetImage(contents.files[filename]).then((result) => {
                  var obj1 = contents.files[filename];
                  var obj2 = result;
                  var obj3 = Object.assign({}, obj1, obj2);
                  this.docList.push(obj3);

                  console.log('this.docList 1', this.docList);
                  this.loadingScreenService.stopLoading();
                  $("#documentviewer").modal('show');

                });


                // let TempList = [];
                // TempList.push({
                //     contentType : 
                // })
              }
            });
          });


        })
    } catch (error) {
      this.loadingScreenService.stopLoading();

    }

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

  close_documentviewer() {
    $("#documentviewer").modal('hide');

  }


  downloadTemplateForm() {
    this.loadingScreenService.startLoading();
    this.downloadService.downloadFile(this.DownloadDocumentId);
    this.loadingScreenService.stopLoading();
  }

  async getEmployeeConfiguration(clientContractId: number) {
    try {

      const data = await this.essService.GetEmployeeConfiguration(clientContractId, EntityType.Employee, this.employeeDetails.Id == 0 ? 'Add' : 'Update').toPromise();
      console.log('CONFI', data);

      if (data.Status) {
        let AccessControlConfiguration = data.Result && data.Result.AccessControlConfiguration;
        console.log('Access Control Configuration :: ', AccessControlConfiguration);
        this.AccessibleButtons = JSON.parse(AccessControlConfiguration.AccessibleButtons);
        this.NotAccessibleFields = JSON.parse(AccessControlConfiguration.NotAccessibleFields);       
      }
      this.loadingScreenService.stopLoading();
    } catch (error) {
      this.loadingScreenService.stopLoading();
      this.alertService.showWarning(error);
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
