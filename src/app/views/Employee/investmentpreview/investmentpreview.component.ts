import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { NgxSpinnerService } from "ngx-spinner";
import { NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import * as _ from 'lodash';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { CommunicationInfo, CountryList, StateList } from 'src/app/_services/model/OnBoarding/CommunicationInfo';
import { AlertService, EmployeeService, ESSService, FileUploadService, HeaderService, SessionStorage } from 'src/app/_services/service';
import { EmployeeDetails, EmployeeInvestmentMaster, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
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
import { EmployeeLookUp } from 'src/app/_services/model/Employee/EmployeeLookup';
import { environment } from 'src/environments/environment';
import { TaxCodeType } from 'src/app/_services/model/Employee/TaxCodeType';
import { CustomdrawerModalComponent } from 'src/app/shared/modals/investment/customdrawer-modal/customdrawer-modal.component';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { EmployeeHouseRentDetails } from 'src/app/_services/model/Employee/EmployeeHouseRentDetails';
import { EmployeeInvestmentDeductions, EmployeeInvesmentDependentDetails, EmployeeInvestmentDocuments } from 'src/app/_services/model/Employee/EmployeeInvestmentDeductions';

import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { EmployeeHousePropertyDetails } from 'src/app/_services/model/Employee/EmployeeHousePropertyDetails';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { InvestmentInfo } from 'src/app/_services/model/Employee/EmployeeExcemptions';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { RemarksModalComponent } from 'src/app/shared/modals/remarks-modal/remarks-modal.component';
import { PreviewdocsModalComponent } from 'src/app/shared/modals/previewdocs-modal/previewdocs-modal.component';
@Component({
  selector: 'app-investmentpreview',
  templateUrl: './investmentpreview.component.html',
  styleUrls: ['./investmentpreview.component.css']
})
export class InvestmentpreviewComponent implements OnInit {
  spinner: boolean = true;

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
  // INV
  employeedetails: EmployeeDetails;
  lstlookUpDetails: EmployeeLookUp;
  FinId: any;
  documentURL = null;
  documentURLId = null;

  TaxationCategory_Investment = [];
  TaxationOtherCategory_Investment = [];
  TaxationCategory = [];
  TaxationOtherCategory = [];
  TaxationOtherCategory_Exemption = [];
  collection = [];

  Lstinvestment = [];
  Lstdeduction_Exemption = [];
  dynamicExeptions = [];
  popupTaxBills: any = [];
  modalOption: NgbModalOptions = {};

  FinancialYearList = [];

  @Input() employeeId: any;
  @Input() clientId: any;
  @Input() finId: any;

  constructor(
    
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    private headerService: HeaderService,
    private titleService: Title,
    public essService: ESSService,
    private sessionService: SessionStorage,
    private alertService: AlertService,
    public fileuploadService: FileUploadService,
    private router: Router,
    private drawerService: NzDrawerService,
    private loadingScreenService: LoadingScreenService,
    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer,
    private Customloadingspinner: NgxSpinnerService,
    private objectApi: FileUploadService,
    private drawerRef: NzDrawerRef<string>,
    private modalService: NgbModal,

  ) { }

  ngOnInit() {
    this.spinner = true;
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.EmployeeId = this.employeeId;
    this.FinId = this.finId;
    this.doRefresh();
    this.FinancialYearList = [];

  }


  doRefresh() {


    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.CompanyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.ImplementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    // this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.clientLogoLink = 'logo.png';
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    // let companyLogos = this.essService.GetCompanyLogoByBusinessType(this._loginSessionDetails, this.BusinessType);
    // this.clientLogoLink = companyLogos.clientLogoLink;
    // this.clientminiLogoLink = companyLogos.clientminiLogoLink;
    if (this.RoleCode.toUpperCase() == 'EMPLOYEE') {
      this.isESSLogin = true;


    } else {
      this.isESSLogin = false;

      // this.EmployeeLookUpDetailsByEmployeeId().then((obj1) => {
      this._loadEmpUILookUpDetails().then((obj2) => {
        this.GetEmployeeRequiredInvestmentDetails().then((obj) => {
          this.load_preinsertedRecords();
          this.spinner = false;
        });
        // });
      })

    }

  }




  GetEmployeeRequiredInvestmentDetails() {
    this.spinner = true;
    const promise = new Promise((resolve, reject) => {
      this.employeeService
        .GetEmployeeRequiredDetailsById(this.EmployeeId, EmployeeMenuData.MyInvestments).subscribe((result) => {
          let apiR: apiResult = result;
          if (apiR.Status == true) {
            let investmentObject: EmployeeDetails = apiR.Result as any;
            this.employeedetails = investmentObject;
            console.log('emp', this.employeedetails);

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
            console.log('tete', this.lstlookUpDetails);
            this.FinancialYearList = this.lstlookUpDetails.FicalYearList
            this.collection = this.lstlookUpDetails.InvesmentProductList;
            this.TaxationCategory = [];
            this.TaxationCategory = environment.environment.HousePropertyDetails_Static;
            this.collection = [...this.TaxationCategory, ...this.collection];
            let hra = [];
            hra = _.filter(this.collection, item => item.ProductId == environment.environment.HRA_DynamicProductId);
            this.TaxationCategory = [...this.TaxationCategory, ...hra];
            const collections = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
              return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Investment });
            });
            this.TaxationOtherCategory = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
              return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Deductions });
            });
            this.TaxationOtherCategory_Exemption = _.filter(this.lstlookUpDetails.InvesmentProductList, function (post) {
              return _.some(post.b, { TaxCodeTypeId: TaxCodeType.Exemptions });
            });
            this.TaxationOtherCategory = this.TaxationOtherCategory.filter(pro => pro.ProductCode.toUpperCase() != 'PT');
            this.TaxationCategory_Investment = _(collections)
              .keyBy('ProductId')
              .at(environment.environment.CommonlyUsedItemsForInvestment)
              .value();
            this.TaxationOtherCategory_Investment = _.filter(collections, item => environment.environment.CommonlyUsedItemsForInvestment.indexOf(item.ProductId) === -1);
            this.TaxationOtherCategory_Investment = this.TaxationOtherCategory_Investment.filter(pro => pro.ProductCode.toUpperCase() != 'PF');

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

  getLetterSpace(string) {
    return string != null ? string.replace(/([a-z])([A-Z])/g, '$1 $2') : '';
  }
  GetProductName(productId) {
    return this.lstlookUpDetails.InvesmentProductList.find(a => a.ProductId == productId) != undefined ? this.lstlookUpDetails.InvesmentProductList.find(a => a.ProductId == productId).ProductName : '---';
  }

  load_preinsertedRecords() {
    this.spinner = true;

    this.Lstinvestment = [];
    this.Lstdeduction_Exemption = [];
    this.dynamicExeptions = [];
    var additinalLstForHRA = [];

    this.employeedetails.LstemployeeHouseRentDetails.forEach(e => {
      if (e.FinancialYearId == this.FinId) {
        additinalLstForHRA.push({
          EndDate: new Date(e.EndDate),
          Id: e.Id,
          // UIData: e.UIData,
          isChecked: e.IsMetro == true ? true : false,
          // LandlordAddress: e.LandLordDetails.AddressDetails,
          NameofCity: e.LandLordDetails != null && (e.LandLordDetails.AddressDetails != null && (JSON.parse(e.LandLordDetails.AddressDetails).NameofCity)),
          NameofLandlord: e.LandLordDetails != null && e.LandLordDetails.Name,
          ObjectStorageId: e.DocumentId,
          PANofLandlord: e.LandLordDetails != null && e.LandLordDetails.PAN,
          RentAmountPaid: e.RentAmount,
          RentalHouseAddress: e.AddressDetails,
          StartDate: new Date(e.StartDate),
          ApprovedAmount: e.ApprovedAmount
        })
      }

    });
    if (this.employeedetails.LstemployeeHouseRentDetails.length > 0 && additinalLstForHRA.length > 0) {
      var sum = 0
      this.employeedetails.LstemployeeHouseRentDetails.forEach(e => {
        if (e.FinancialYearId == this.FinId) {

          sum += (e.RentAmount)
        }
      });
      var sum1 = 0
      this.employeedetails.LstemployeeHouseRentDetails.forEach(e => {
        if (e.FinancialYearId == this.FinId) {
          sum1 += (e.ApprovedAmount)
        }
      });

      var isValidToPush3 = false;
      if (this.Lstdeduction_Exemption.find(a => this.FinId && a.ProductId == this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductId)) {
        isValidToPush3 = true;
      }



      if (isValidToPush3 == false) {

        let _definedObject = this.employeedetails.LstemployeeHouseRentDetails.length > 0 &&

          this.employeedetails.LstemployeeHouseRentDetails.find(a => a.FinancialYearId == this.FinId) != undefined ?
          this.employeedetails.LstemployeeHouseRentDetails.find(a => a.FinancialYearId == this.FinId) : null

        this.Lstdeduction_Exemption.push(
          {
            Id: UUID.UUID(),
            ProductId: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductId,
            Name: this.collection.find(z => z.ProductId === environment.environment.HRA_DynamicProductId).ProductName,
            AmtInvested: sum,
            AmtApproved: sum1,
            Section: "Sec10",
            Remarks: _definedObject == null ? '' : _definedObject.InputsRemarks,
            ApproverRemarks: _definedObject == null ? '' : _definedObject.ApproverRemarks,
            Status: "Pending",
            DocumentId: _definedObject == null ? 0 : _definedObject.DocumentId,
            AdditionalList: _definedObject == null ? [] : additinalLstForHRA,
            DocumentDetails: _definedObject == null ? [] : _definedObject.LstEmployeeInvestmentDocuments,
            IsProposed : _definedObject.IsProposed
            // UIData : additinalLstForHRA[0].UIData,
          });
      }
    }


    this.employeedetails.LstemployeeInvestmentDeductions.forEach(e => {
      if (this.collection.find(z => z.ProductId === e.ProductID).ProductName.toUpperCase() != 'PF') {
        if (e.FinancialYearId == this.FinId && e.Modetype != 2) {
          var areaOfBinding = this.collection.find(z => z.ProductId === e.ProductID).b[0].TaxCodeTypeId === TaxCodeType.Deductions;
          if (areaOfBinding == true) {
            var additionalList = [];
            e.LstEmpInvDepDetails.forEach(child => {
              additionalList.push({
                AgeofDependent: null,
                Amount: child.Amount,
                DOB: new Date(child.DependentDateOfBirth),
                DependentTypes: child.DependentType,
                DisabilityPercentage: child.DisabilityPercentage,
                Id: child.Id,
                NameofDependent: child.DependentName,
                relationship: child.Relationship,
                EmpInvestmentDeductionId: child.EmpInvestmentDeductionId,
                EmployeeId: child.EmployeeId,
                DocumentId: child.DocumentId
              });

            });

            var isValidToPush1 = false;


            if (this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0) {
              if (this.Lstdeduction_Exemption.find(a => a.Id == e.Id) != undefined) {
                isValidToPush1 = true;
              }
            }


            if (isValidToPush1 == false) {

              this.Lstdeduction_Exemption.push(
                {
                  Id: e.Id,
                  ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
                  Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
                  AmtInvested: e.Amount,
                  AmtApproved: e.ApprovedAmount,
                  Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
                  Remarks: e.InputsRemarks,
                  ApproverRemarks: e.ApproverRemarks,
                  Status: "Pending",
                  DocumentId: e.DocumentId,
                  AdditionalList: additionalList,
                  DocumentDetails: e.LstEmployeeInvestmentDocuments,
                  IsProposed : e.IsProposed

                })
            }

          } else {

            var isValidToPush = false;

            if (this.Lstinvestment != null && this.Lstinvestment.length > 0) {
              if (this.Lstinvestment.find(a => a.Id == e.Id) != undefined) {
                isValidToPush = true;
              }
            }

            if (isValidToPush == false) {

              this.Lstinvestment.push(
                {
                  Id: e.Id,
                  ProductId: this.collection.find(z => z.ProductId === e.ProductID).ProductId,
                  Name: this.collection.find(z => z.ProductId === e.ProductID).ProductName,
                  AmtInvested: e.Amount,
                  AmtApproved: e.ApprovedAmount,
                  Section: this.collection.find(z => z.ProductId === e.ProductID).b[0].Code,
                  Remarks: e.InputsRemarks,
                  ApproverRemarks: e.ApproverRemarks,
                  Status: "Pending",
                  DocumentId: e.DocumentId,
                  DocumentDetails: e.LstEmployeeInvestmentDocuments,
                  IsProposed : e.IsProposed

                });
            }

          }
        }
      }
    });

    //// -=========================-


    this.employeedetails.LstEmployeeHousePropertyDetails.forEach(e => {
      if (e.FinancialYearId == this.FinId && e.Modetype != 2) {

        var isValidToPush11 = false;

        if (this.Lstdeduction_Exemption != null && this.Lstdeduction_Exemption.length > 0) {
          if (this.Lstdeduction_Exemption.find(a => a.Id == e.Id) != undefined) {
            isValidToPush11 = true;
          }
        }

        if (isValidToPush11 == false) {

          this.Lstdeduction_Exemption.push(
            {
              AdditionalDetailsObject: {
                AnnualRent: e.GrossAnnualValue,
                Id: e.Id,
                InstallmentNumber: e.InstallmentNumber,
                InterestPaid: e.InterestAmount,
                LoanAvailedDate: e.LoanDate,
                MunicipalTaxesPaid: e.MunicipalTax,
                NameOfLender: e.NameOfLender,
                PANofLender: e.LenderPANNO,
                Pre_ConstructionInterest: e.PreConstructionInterestAmount,
                PrincipalAmount: e.PrincipalAmount,
                PropertyPossessionDate: e.PossessionDate,
                addressOfLender: e.AddressOfLender,
                addressOfProperty: e.AddressDetails,
                isFirstTime: e.FirstTimeHomeOwner,
                occupanyType: e.LetOut == true ? "rentedOut" : "selfOccupied",
                ownership: e.OwnershipPercentage,
                DocumentId: e.DocumentId,
                GrossAnnualValueApprovedAmount: e.GrossAnnualValueApprovedAmount,
                InterestAmountApprovedAmount: e.InterestAmountApprovedAmount,
                MunicipalTaxApprovedAmount: e.MunicipalTaxApprovedAmount,
                PreConstructionInterestApprovedAmount: e.PreConstructionInterestApprovedAmount

              },
              AmtApproved: e.LetOut == true ? e.GrossAnnualValueApprovedAmount : e.InterestAmountApprovedAmount,
              AmtInvested: e.LetOut == true ? e.GrossAnnualValue : e.InterestAmount,
              DocumentId: 0,
              Id: e.Id,
              Name: this.collection.find(z => z.ProductId === -100).ProductName,
              ProductId: -100,
              Remarks: e.InputsRemarks,
              ApproverRemarks: e.ApproverRemarks,
              Section: "Sec24",
              Status: "Pending",
              DocumentDetails: e.LstEmployeeInvestmentDocuments,
              IsProposed : e.IsProposed

            });
        }
      }
    });


    this.employeedetails.LstEmployeeTaxExemptionDetails != null && this.employeedetails.LstEmployeeTaxExemptionDetails.length > 0 && this.employeedetails.LstEmployeeTaxExemptionDetails.forEach(e => {

      if (e.FinancialYearId == this.FinId) {
        this.dynamicExeptions.push(e)
      }
    });
    for (let obj of this.dynamicExeptions) {
      let eObj = this.TaxationOtherCategory_Exemption.find(e => e.ProductId == obj.ProductId)
      if (eObj && eObj.ProductCode != null) {
        obj['ProductName'] = eObj.ProductName
      }
    }

    console.log('INV', this.Lstinvestment);
    console.log('DEC', this.Lstdeduction_Exemption);
    console.log('EXC', this.dynamicExeptions);
    this.spinner = false;

  }

  onChangeFinancialYear(event){
    
    this.finId = event.Id;
    this.load_preinsertedRecords();
    
  }



  document_file_view(item, whichdocs) {


    const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.docsObject = item;
    modalRef.componentInstance.whichdocs = whichdocs;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });

    // $("#popup_viewDocs").modal('show');
    // this.documentURL = null;
    // this.documentURLId = null;
    // this.documentURLId = item.DocumentId;
    // var contentType = this.fileuploadService.getContentType(item.FileName);
    // if (contentType === 'application/pdf' || contentType.includes('image')) {
    //   this.fileuploadService.getObjectById(item.DocumentId)
    //     .subscribe(dataRes => {

    //       if (dataRes.Status == false || dataRes.Result == null || dataRes.Result == undefined) {
    //         return;
    //       }
    //       let file = null;
    //       var objDtls = dataRes.Result;
    //       const byteArray = atob(objDtls.Content);
    //       const blob = new Blob([byteArray], { type: contentType });
    //       file = new File([blob], objDtls.ObjectName, {
    //         type: contentType,
    //         lastModified: Date.now()
    //       });
    //       if (file !== null) {
    //         var urll = 'data:' + contentType + ';base64,' + encodeURIComponent(objDtls.Content);
    //         this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(urll);

    //       }
    //     });
    // } else if (contentType === 'application/msword' ||
    //   contentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    //   var appUrl = this.fileuploadService.getUrlToGetObject(item.DocumentId);
    //   var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
    //   this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    // }

  }

  modal_dismiss4() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs").modal('hide');
  }


  document_file_view1(item, whichdocs) {

    const modalRef = this.modalService.open(PreviewdocsModalComponent, this.modalOption);
    modalRef.componentInstance.docsObject = item;
    modalRef.componentInstance.employeedetails = this.employeedetails;
    modalRef.result.then((result) => {
      if (result != "Model Closed") {

      }
    }).catch((error) => {
      console.log(error);
    });
    return;
    $("#popup_viewDocs").modal('show');
    this.documentURL = null;
    this.documentURLId = null;
    this.documentURLId = item.BillId;
    var contentType = whichdocs != 'official' ? this.fileuploadService.getContentType(item.FileName) : 'application/pdf';
    if (contentType === 'application/pdf' || contentType.includes('image')) {
      this.fileuploadService.getObjectById(item.BillId)
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
      var appUrl = this.fileuploadService.getUrlToGetObject(item.BillId);
      var unsurl = "https://docs.google.com/gview?url=" + appUrl + "&embedded=true";
      this.documentURL = this.sanitizer.bypassSecurityTrustResourceUrl(unsurl);
    }

  }

  modal_dismiss_docs() {
    this.documentURL = null;
    this.documentURLId = null;
    $("#popup_viewDocs1").modal('hide');
  }

  close() {
    this.drawerRef.close();
  }


}

