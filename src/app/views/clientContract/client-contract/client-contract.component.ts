import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { HeaderService } from "src/app/_services/service/header.service";
import { enumHelper } from "../../../shared/directives/_enumhelper";
import {
  FormGroup,
  FormBuilder,
  FormControl,
  Validators,
  AbstractControl,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
// import { AccountManagerComponent } from 'src/app/shared/modals/account-manager/account-manager.component';
import { ActivatedRoute, Router } from "@angular/router";
import { RowDataService } from "../../personalised-display/row-data.service";
import { apiResult } from "../../../_services/model/apiResult";
import { LoadingScreenService } from "../../../shared/components/loading-screen/loading-screen.service";
import Swal from "sweetalert2";

import { AlertService } from "../../../_services/service/alert.service";
import { apiResponse } from "src/app/_services/model/apiResponse";
import {
  ClientList,
} from "src/app/_services/model/ClientLocationAllList";
import { UIMode } from "../../../_services/model/Common/BaseModel";
import * as _ from "lodash";
import { resolve } from "url";
import { LoginResponses } from "src/app/_services/model/Common/LoginResponses";
import { ClientContractService } from "src/app/_services/service/clientContract.service";
import { StatutoryType } from "src/app/_services/model/Client/ClientContract";
import { BaseDaysTypeForLOPRevokal, BaseDaysTypeForNewJoinerArrears, BaseDaysTypeForNonOpenPeriodLOP, ClientContractOperations, RateType, TaxCalculationBasedOn } from "src/app/_services/model/Client/ClientContractOperations";

import { _ClientContractModel } from "src/app/_services/model/Client/ClientContractModel";
import { ClientContract } from "src/app/_services/model/Client/ClientContract";
import {
  CommonService,
  FileUploadService,
  ProductService,
  SessionStorage,
} from "src/app/_services/service";
import { SessionKeys } from "src/app/_services/configs/app.config";
import { Title } from "@angular/platform-browser";
import * as moment from "moment";
import { ServicefeeComponent } from "src/app/shared/components/clientContract/servicefee/servicefee.component";
import { BillingproductComponent } from "src/app/shared/components/clientContract/billingproduct/billingproduct.component";
import { ClientSaleOrderGrouping } from "src/app/_services/model/Client/ClientSaleOrderGrouping";
import { DatePipe } from "@angular/common";
import { UIBuilderService } from "src/app/_services/service/UIBuilder.service";
import { ClientContractDocuments } from "src/app/_services/model/Client/ClientContractDocuments";
import { UUID } from "angular2-uuid";
import { ObjectStorageDetails } from "src/app/_services/model/Candidates/ObjectStorageDetails";
import { ClientDetails } from "src/app/_services/model/Client/ClientDetails";
import { ProductBillingGroup } from "src/app/_services/model/Client/ProductBillingGroup";
import { StatuatoryRuleComponent } from "src/app/shared/modals/statutory-rule/statuatory-rule.component";
import { ProductStatuatoryDetailsComponent } from "src/app/shared/modals/product-statuatory-details/product-statuatory-details.component";
import { AdditionalAppProductsComponent } from "src/app/shared/modals/additional-app-products/additional-app-products.component";

export enum ClientServiceChosen {
  Staffing = 1,
  PermPlacement = 2,
  RPO = 3,
  PEO = 4,
  OutSourcing = 5,
}

export enum ContractType {
  none = 0,
  OpenEnded = 1,
  Month = 2,
  Custom = 3,
}

export enum GenericMasterType {
  Zone = 1,
  WageCategory = 2,
  RelationshipType = 3,
  GraduationType = 4,
  CourseType = 5,
  LineOfBusiness = 6,
}

export enum NapsOnboardingType {
  Client = 1,
  CIEL = 2,
  Agencies = 3,
  Other = 4,
}

export const ClientTypes: any = [
  {
    ValueMember: 1,
    DisplayMember: "Collect & Pay",
    icon: "mdi-google-nearby",
    checked: false,
  },
  {
    ValueMember: 2,
    DisplayMember: "Pay & Collect",
    icon: "mdi-arrow-up-bold-box",
    checked: false,
  },
];

@Component({
  selector: "app-client-contract",
  templateUrl: "./client-contract.component.html",
  styleUrls: ["./client-contract.component.scss"],
})
export class ClientContractComponent implements OnInit {
  spinner: boolean = true;
  slider = false;
  slider2 = false;
  @Input() Id: number;
  ClientId: any;
  ContractCode: any;
  UserId: any;
  roleId: any;
  submitted = false;
  clientcontractForm: FormGroup;
  activeTabName: string;

  InternaloperationListGrp: any = [];
  ContractTermsListGrp: any = [];

  listOfclient: ClientList[] = [];
  clientcontractdetails: ClientContract = {} as any;
  // clientcontractModel : ClientContractModel = new ClientContractModel();

  genericMasterType = 6;
  selctedservices: any = [];
  StatutoryType: any = [];

  //general
  clientservices: any = [];
  serviceslist: any = [];
  contacttypes: any = [];
  genericmastertypes: any = [];
  napsOnBoardingTypes: any = [];
  contactTypename: any;
  FileName: any;
  DocumentId: any;

  listOfClientType = ClientTypes;

  //internal operations

  selectionAray = [];
  array = [];

  isSummary_panel: boolean = false;

  contractbase: any = {};

  ClientContractOperations: any = [];

  internalAccountManagers: any = [];
  ExternalClientContacts: any = [];
  paycyclesList: any = [];
  AttendanceCycleList: any = [];
  LeaveGroupList: any = [];
  HolidayCalendarList: any = [];
  NoticePeriodDaysList: any = [];
  PaygroupList: any = [];
  StatutoryDetailsList: any = [];
  InsurancePlanList: any = [];

  selectedManagers: any = [];
  selectedKeyMembers: any = [];
  selectedConsultantDetails: any = [];
  selectedPayCycles: any = [];
  selectedClientContacts: any = [];
  selectedAttendanceCycle: any = [];
  selectedLeaveGroups: any = [];
  selecteHolidayCalender: any = [];
  selectedNoticePeriods: any = [];
  selectedPayGroups: any = [];
  selectedInsurancePlan: any = [];
  selectedStatutory: any = [];

  keyStakeHoldersList: any = [];

  paycycles: any = [];
  attendancecycles: any = [];
  leavegroups: any = [];
  holidaycalenders: any = [];
  noticeperioddays: any = [];
  Paygroups: any = [];
  insuranceplans: any = [];
  statutorydetails: any = [];

  ClientContractId = 0;
  keyStakeHolderId = 0;
  clientcontractoperationsId = 0;

  ApplicablePaygroups: any = [];
  ContractminDate: Date;

  managers: any = [];
  clientcontacts: any = [];
  keyMembers: any = [];
  consultDetails: any = [];

  statutorytypename: any;
  ProductApplicabilityCodes: any = [];
  ProductApplicabulitys: any = [];
  ProductApplicabulity: any = [];

  coreObject: any;
  _loginSessionDetails: LoginResponses;
  CompanyId: any;
  searchText = null;
  searchText1 = null;

  deletedManagersLst = [];
  deletedClientContactLst = [];
  deletedKeyMembersLst = []
  deleteConsLst = [];

  nameOfOperationsTxt: string = "";
  nameOfOperationsPlaceholderTxt: string = "";
  nameOfOperationsIndex: string = null;
  operationList = [];
  searchText_operations: string = null;

  @ViewChild(ServicefeeComponent) servicefeeComponent: ServicefeeComponent;
  @ViewChild(BillingproductComponent) billingproductComponent;

  //ACCESS CONTROL
  MenuId: any;
  isSave: boolean = true;
  isClose: boolean = true;

  // Client Contract Documents

  LstClientContractDocuments: ClientContractDocuments[] = [];
  documentForm: FormGroup;
  DocumentMappingList: any = [];
  CompanyBranchList: any = [];

  isLoading: boolean = true;
  spinnerText: string;
  BusinessType: any;
  unsavedDocumentLst: any[] = [];
  visible_documentUpload: boolean = false;

  IsNewActivity: boolean = false;
  MarkupList = [];
  ClientDetails: ClientDetails;
  productList = [];
  ExistingProductBillingGroup: ProductBillingGroup
  isAccountManager = false;
  isKeyMember = false;
  isAddConsDetails = false;
  statuatoryRuleInfo: any = [];
  productStatuatoryInfo: any = [];
  wageTypes: any = [];
  scaleList: any = [];
  minWageAppProdForm: FormGroup;
  applicableProductList: any = [];
  minimumWagesAppProdList = [];
  taxBasedOnList: any = [];
  minWageAppInfo;
  applicableProductInfo: any = [];
  onMinWageSubmit = false;
  productFBPCalList = [];
  nonOpenPeriodLOPList: any;
  lopRevokalList: any = [];
  newJoinerArrearsList: any = [];
  RateTypeEnum = RateType;
  accountManagersList = [];

  constructor(
    private headerService: HeaderService,
    private formBuilder: FormBuilder,
    private utilsHelper: enumHelper,
    public modalService: NgbModal,
    private route: ActivatedRoute,
    private rowDataService: RowDataService,
    private router: Router,
    public clientcontractService: ClientContractService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    private sessionService: SessionStorage,
    private titleService: Title,
    private clientContractService: ClientContractService,
    private datePipe: DatePipe,
    public UIBuilderService: UIBuilderService,
    private fileuploadService: FileUploadService,
    private commonService: CommonService,
    private productService: ProductService,
    private activatedroute: ActivatedRoute
  ) {
    this.createPlatform();
    this.createForm();
    this.createMinWageAppProdForm();
    this.Get_ProductListLooup();
    this.getAllMarkuMappingList();
  }

  get h() {
    return this.documentForm.controls;
  } // reactive forms validation
  get g() {
    return this.clientcontractForm.controls;
  } // reactive forms validation

  createPlatform() {
    this.clientcontractForm = this.formBuilder.group({
      //general tab
      Client: [null],
      Code: [""],
      Name: ["", Validators.required],
      Description: [""],
      servicechosen: [null, Validators.required],
      ContractType: [null, Validators.required],
      Value: [""],
      ValidFrom: [""],
      ValidTo: [""],
      ClientType: ["", Validators.required],

      Status: [true],
      PayrollInputMode: [false],
      isHalfYearlyPTApplicable: [false],
      isAdminChargesNotInBillableAmount: [false],
      breakupBasedays: [''],
      breakupBaseHours: [''],
      wageType: [null],
      applicableProductId: [null],
      taxBasedOn: [null],
      isTimeSheetApplicable: [false],
      isEssActiveLoginRequired: [false],
      isFBPApprovalRequired: [true],
      isFBPApplicable: [false, Validators.required],
      productIdForFBPCalculation: [null],
      percentageForFBPCalculation: [],
      nonOpenPeriodLOP: [],
      lopRevokal: [],
      newJoinerArrears: [],
      isDefaultMinimumWageFromMaster: [false, Validators.required],
      isCTCBasicAmountValidationNotRequired: [false, Validators.required],
      isNapBased: [false],
      napsOnBoardType: [],
      napsLocation: [],
      napsPlantName: [],
    });
  }

  createForm() {
    this.documentForm = this.formBuilder.group({
      Id: [UUID.UUID()],
      DocumentId: ["", Validators.required],
      FileName: [null, Validators.required],
      CategoryType: [null, Validators.required],
      DocumentType: [null, Validators.required],
      SignedOn: [null, Validators.required],
      SignedBy: [[], Validators.required],
      SignUpCenter: [null, Validators.required],
      Remarks: [""],
      Status: [1],
      IsDocumentDelete: [false], // extra prop
      DeletedIds: [""],
    });
  }

  createMinWageAppProdForm() {
    this.minWageAppProdForm = this.formBuilder.group({
      Code: ['', Validators.required],
      Name: ['', Validators.required],
      ApplicableProducts: [null, Validators.required],
      IsIndividualbased: [false, Validators.required]
    })
  }

  ngOnInit() {
    this.IsNewActivity = false;
    this.spinner = true;
    this._loginSessionDetails = JSON.parse(
      this.sessionService.getSessionStorage(SessionKeys.LoginResponses)
    ); // Get the whole matched session element set as a clean json(array) via an session object
    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.roleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.BusinessType =
      this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null
        ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(
          (item) => item.CompanyId == this._loginSessionDetails.Company.Id
        ).BusinessType
        : 0;

    this.titleService.setTitle("Client Contract");
    this.headerService.setTitle("Client Contract");
    this.activeTabName = "General";

    //GENERIC ENUM SELECT VALUES PIPE
    this.StatutoryType = this.utilsHelper.transform(StatutoryType);
    this.contacttypes = this.utilsHelper.transform(ContractType);
    this.genericmastertypes = this.utilsHelper.transform(GenericMasterType);
    this.napsOnBoardingTypes = this.utilsHelper.transform(NapsOnboardingType);
    this.wageTypes = this.utilsHelper.transform(RateType);
    console.log("napsOnBoardingTypes ", this.napsOnBoardingTypes);
    this.taxBasedOnList = this.utilsHelper.transform(TaxCalculationBasedOn);

    this.nonOpenPeriodLOPList = this.utilsHelper.transform(BaseDaysTypeForNonOpenPeriodLOP);
    this.lopRevokalList = this.utilsHelper.transform(BaseDaysTypeForLOPRevokal);
    this.newJoinerArrearsList = this.utilsHelper.transform(BaseDaysTypeForNewJoinerArrears);

    // DATA TRANSFORMATION PARENT TO CHILD COMP.

    // INVOKED METHOD - DATA TO BE RESOLVED BEFORE ROUTE IS FINISH (RETERIVES THE DATA)
    let isAdd = false;
    this.route.data.subscribe((data) => {
      if (data.DataInterface.RowData) {
        console.log(data.DataInterface.RowData);
        if (data.DataInterface.RowData == 'isAdd') {
          isAdd = true;
        }
        this.Id = data.DataInterface.RowData.Id;
        this.ClientId = data.DataInterface.RowData.ClientId;
        this.ContractCode = data.DataInterface.RowData.Code;
      }
      this.rowDataService.dataInterface = {
        SearchElementValuesList: [],
        RowData: null,
      };
    });

    // this.Id = 8;
    if ((this.Id == null || this.Id == undefined) && isAdd) {
      this.IsNewActivity = true;
      this.spinner = false;
      // this.router.navigate(['/app/listing/ui/clientContract']); 
      // return;
    }
    if ((this.Id == null || this.Id == undefined) && !isAdd) {
      this.spinner = false;
      this.router.navigate(['/app/listing/ui/clientContract']);
      return;
    }
    this.fetchClientContractDetails();
    this.ContractminDate = new Date();

    let mode = 2; // add-1, edit-2, view, 3
    this.MenuId = this.sessionService.getSessionStorage("MenuId"); // need to implement it in feature
    this.UIBuilderService.doApply(mode, this, this.MenuId, "");

    this.clientcontractForm.controls['isFBPApplicable'].valueChanges.subscribe((res) => {
      if (res) {
        this.clientcontractForm.controls['productIdForFBPCalculation'].setValidators(Validators.required);
        this.clientcontractForm.controls['productIdForFBPCalculation'].updateValueAndValidity();
        this.clientcontractForm.controls['productIdForFBPCalculation'].markAsUntouched();
        this.clientcontractForm.controls['percentageForFBPCalculation'].setValidators(Validators.required);
        this.clientcontractForm.controls['percentageForFBPCalculation'].updateValueAndValidity();
        this.clientcontractForm.controls['percentageForFBPCalculation'].markAsUntouched();
      } else {
        this.clientcontractForm.controls['productIdForFBPCalculation'].setValue('');
        this.clientcontractForm.controls['productIdForFBPCalculation'].setValidators(null);
        this.clientcontractForm.controls['productIdForFBPCalculation'].updateValueAndValidity();
        this.clientcontractForm.controls['productIdForFBPCalculation'].markAsUntouched();
        this.clientcontractForm.controls['percentageForFBPCalculation'].setValue('');
        this.clientcontractForm.controls['percentageForFBPCalculation'].setValidators(null);
        this.clientcontractForm.controls['percentageForFBPCalculation'].updateValueAndValidity();
        this.clientcontractForm.controls['percentageForFBPCalculation'].markAsUntouched();
      }
    })
  }

  // get all markuplist
  getAllMarkuMappingList() {
    this.clientContractService.get_AllMarkupMappingList()
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.MarkupList = apiResult.Result as any;
        }
      })
  }

  // markupdetails
  getMarkuMappingDetails() {
    this.clientContractService.Get_MarkupMappingDetails(this.coreObject.ContractId).
      subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.ClientDetails = apiResult.Result as any;
        }
      })
  }
  
  Get_ProductListLooup() {
    this.productList = [];
    // this.LstbillableProduct = [];
    this.productService.Get_LoadProductLooupDetails()
      .subscribe((result) => {
        const apiResult: apiResult = result;
        const LooupList = JSON.parse(apiResult.Result);
        console.log('LooupList', LooupList);
        this.productList = LooupList[0].ProductList;
        this.productFBPCalList = this.productList.filter((pl) => pl.ProductTypeId == 1);
        console.log('product fbp call list ', this.productFBPCalList);
        this.scaleList = LooupList[0].ScaleList;
        this.applicableProductList = LooupList[0].ProductTypeList;
        console.log('Products', this.productList);
        console.log('scale list', this.scaleList);
        var tempBillableItems = []
        var billingProducts = [];
        this.productList.forEach(element => {
          billingProducts = [];
          billingProducts = LooupList[0].ProductList.filter(a => a.ProductTypeId === 5);
          tempBillableItems = []
          // element.ProductTypeId === 5 &&  tempBillableItems.push(element);
          // tempBillableItems.push(element)
          tempBillableItems.length = 0;
          tempBillableItems = billingProducts;
          var isExist = billingProducts.find(a => a.Id === element.Id);
          if (isExist === undefined) {
            tempBillableItems.push(element)
          }

          element['ProductId'] = element.Id;
          element['isBillable'] = false;
          element['isBillableOnActual'] = false;
          element['billableProductName'] = null;
          element['isMarkupApplicable'] = false;
          element['isProductWiseMarkup'] = false;
          element['markupType'] = null;
          element['markupValue'] = '';
          element['billableProductList'] = tempBillableItems;
          element['Id'] = 0;
        });
        console.log('this.LstbillableProduct', this.productList);
      });
  }




  isNapChecked(event) {
    const isNapChecked = event.target.checked;
    if (isNapChecked) {
      this.clientcontractForm.controls["napsOnBoardType"].setValidators([
        Validators.required,
      ]);
      this.clientcontractForm.controls["napsLocation"].setValidators([
        Validators.required,
      ]);
      this.clientcontractForm.controls["napsPlantName"].setValidators([
        Validators.required,
      ]);
      this.clientcontractForm.updateValueAndValidity();
    } else {
      this.clientcontractForm.controls["napsOnBoardType"].setValidators(null);
      this.clientcontractForm.controls["napsOnBoardType"].setValue("");
      this.clientcontractForm.controls["napsLocation"].setValidators(null);
      this.clientcontractForm.controls["napsLocation"].setValue("");
      this.clientcontractForm.controls["napsPlantName"].setValidators(null);
      this.clientcontractForm.controls["napsPlantName"].setValue("");
      this.clientcontractForm.updateValueAndValidity();
    }
  }

  async fetchClientContractDetails() {
    try {
      this.loadingScreenService.startLoading();

      // this.Id = 3;
      this.coreObject = JSON.stringify({
        CompanyId: this.CompanyId,
        ContractId:
          this.Id == null && this.IsNewActivity ? (this.Id = 0) : this.Id, // Ananth changes
        UserId: this.UserId,
        ClientId:
          this.ClientId == null && this.IsNewActivity
            ? (this.ClientId = 0)
            : this.ClientId, // Ananth changes
        ContractCode:
          this.ContractCode == null && this.IsNewActivity
            ? (this.ContractCode = 0)
            : this.ContractCode, // Ananth changes
        ClientDetails: null,
      });
      console.log("core", this.coreObject);

      const data = await this.getClientContractLookupDetails().then((res) => {
        this.genericmastertype();
        if (typeof this.Id !== "undefined" && this.Id !== null) {
          // Contract ID is more than safe to be used.
          setTimeout(() => {
            if (!this.IsNewActivity) {
              // Ananth changes
              this.edit_ClientContractDetails();
            } // Ananth changes
          }, 3500);
        } else {
          this.clientcontractdetails.Id = 0;
        }
      });
      console.log(data);
    } catch (err) {
      console.log(err); // you might not actually want to eat this exception.
    }
  }

  onChangeStartDate(event) {
    if (
      this.clientcontractForm.get("ValidFrom").value != null ||
      this.clientcontractForm.get("ValidFrom").value != undefined
    ) {
      var StartDate = new Date(event);
      this.ContractminDate = new Date();
      this.ContractminDate.setMonth(StartDate.getMonth());
      this.ContractminDate.setDate(StartDate.getDate() + 1);
      this.ContractminDate.setFullYear(StartDate.getFullYear());
    }
  }

  getClientContractLookupDetails() {
    return new Promise((resolve) => {
      this.clientcontractService
        .getclientcontractlookupDetails()
        .subscribe((response) => {
          console.log("contact list", response);
          this.listOfclient = response.dynamicObject.ClientList;
          if (this.BusinessType != 3) {
            let sme_clientContract = JSON.parse(this.sessionService.getSessionStorage('sme_clientcontract'));
            console.log('sme_clientContract ', sme_clientContract);
            this.clientcontractForm.controls['Client'].patchValue(sme_clientContract.ClientId);
          }
          this.internalAccountManagers = response.dynamicObject.ConsultantList;
          this.accountManagersList = response.dynamicObject.AccountManagerList
          console.log("internalAccountmanagers", this.internalAccountManagers);
          this.ExternalClientContacts =
            response.dynamicObject.ClientContactList != null &&
            response.dynamicObject.ClientContactList.length > 0 &&
            response.dynamicObject.ClientContactList.filter(
              (x) => x.ClientId == this.ClientId
            );
          console.log("externalAccountmanagers", this.ExternalClientContacts);
          this.paycyclesList = response.dynamicObject.PayCycleList;
          console.log("paycyclesList", this.paycyclesList);
          this.AttendanceCycleList = response.dynamicObject.AttendanceCycleList;
          console.log("AttendanceCycleList", this.AttendanceCycleList);
          this.LeaveGroupList = response.dynamicObject.LeaveGroupList;
          console.log("LeaveGroupList", this.LeaveGroupList);
          this.HolidayCalendarList = response.dynamicObject.HolidayCalendarList;
          console.log("HolidayCalendarList", this.HolidayCalendarList);
          this.NoticePeriodDaysList =
            response.dynamicObject.NoticePeriodDaysList;
          console.log("NoticePeriodDaysList", this.NoticePeriodDaysList);
          this.PaygroupList = response.dynamicObject.PaygroupList;
          console.log("PaygroupList", this.PaygroupList);
          this.StatutoryDetailsList =
            response.dynamicObject.StatutoryDetailsList;
          console.log("StatutoryDetailsList", this.StatutoryDetailsList);
          this.InsurancePlanList = response.dynamicObject.InsuranceList;
          // Client contract documents

          this.CompanyBranchList = response.dynamicObject.CompanyBranchList;
          this.DocumentMappingList = response.dynamicObject.DocumentMappingList;

          this.StatutoryDetailsList.forEach((element) => {
            let statutorytyppeid = element.StatutoryType;
            if (
              element.ProductAppliciability != null &&
              element.ProductAppliciability != ""
            ) {
              this.ProductApplicabulitys = JSON.parse(
                element.ProductAppliciability
              );
              console.log(this.ProductApplicabulitys);
              element["ProductApplicabulityCodes"] = this.ProductApplicabulitys;
            }
            this.StatutoryType.forEach((element) => {
              if (element.id == statutorytyppeid) {
                this.statutorytypename = element.name;
              }
            });
            element["StatutoryTypeName"] = this.statutorytypename;
          });

          console.log("StatutoryDetailsList2", this.StatutoryDetailsList);
          resolve(true);
        });
    });
  }

  genericmastertype() {
    this.clientcontractService
      .GetGenericMasterListByMasterType(this.genericMasterType)
      .subscribe((result) => {
        this.clientservices = result;
      });
  }

  getStatuatoryName(statuatoryRuleInfo, productList) {
    statuatoryRuleInfo.map((item) => {
      productList.find((pitem) => {
        if (pitem.ProductId == item.ProductId) {
          // item.StatutoryName = pitem.Name
          item.EffectiveDate = moment(item.EffectiveDate).format('YYYY-MM-DD');
        }
      })
    })
    return statuatoryRuleInfo;
  }

  getStatuatoryTypeName(statuatoryRuleInfo, statutoryType) {
    statuatoryRuleInfo.map((item) => {
      statutoryType.find((pitem) => {
        if (pitem.id == item.StatutoryType) {
          // item.StatutoryName = pitem.Name
          // item.EffectiveDate = moment(item.EffectiveDate).format('YYYY-MM-DD');
          item.StatutoryTypeName = pitem.name;
        }
      })
    })
    return statuatoryRuleInfo;
  }

  getApplicableProdName(applicableProdInfo, productList) {
    applicableProdInfo.map((item) => {
      productList.find((pitem) => {
        if (pitem.ProductId == item.ProductId) {
          item.ProductName = pitem.Name
        }
      })
    })
    return applicableProdInfo;
  }


  getProductStatuatoryName(productStatuatoryInfo, productList) {
    productStatuatoryInfo.map((item) => {
      productList.find((pitem) => {
        if (pitem.ProductId == item.ProductId) {
          item.ProductName = pitem.Name;
          item.EffectiveDate = moment(item.EffectiveDate).format('YYYY-MM-DD');
        }
      })
    })
    return productStatuatoryInfo;
  }

  onHalfYealyPTChange(event) {
    console.log(event);
    console.log(event.checked);
  }

  edit_ClientContractDetails() {
    try {
      this.loadingScreenService.startLoading();
      this.clientcontractService
        .getClientContractById(this.Id)
        .subscribe(async (result) => {
          if (result.dynamicObject !== null) {
            let apiResponse: apiResponse = result;
            this.coreObject = JSON.parse(this.coreObject);
            this.coreObject.ClientDetails = apiResponse.dynamicObject;
            await this.getMarkuMappingDetails();
            this.coreObject = JSON.stringify(this.coreObject);
            console.log(apiResponse.dynamicObject);
            this.clientcontractdetails = apiResponse.dynamicObject;
            let lstClientContractOperation = this.clientcontractdetails.LstClientContractOperations[0];
            this.statuatoryRuleInfo = lstClientContractOperation.LstStatutoryRulesDetails;
            const productList = this.productList;
            if (this.statuatoryRuleInfo !== null && this.statuatoryRuleInfo.length > 0) {
              this.getStatuatoryName(this.statuatoryRuleInfo, productList);
              this.getStatuatoryTypeName(this.statuatoryRuleInfo, this.StatutoryType);
            } else {
              this.statuatoryRuleInfo = [];
            }
            this.productStatuatoryInfo = lstClientContractOperation.ProductStatutoryScaleDetails != undefined ? lstClientContractOperation.ProductStatutoryScaleDetails : [];
            if (this.productStatuatoryInfo !== null && this.productStatuatoryInfo.length > 0) {
              this.getProductStatuatoryName(this.productStatuatoryInfo, productList);
            } else {
              this.productStatuatoryInfo = [];
            }
            let olddetils = this.clientcontractdetails;
            _ClientContractModel.oldobj = Object.assign({}, olddetils);
            console.log("client contract details", this.clientcontractdetails);
            console.log(
              "old client contract details",
              _ClientContractModel.oldobj
            );
            if (result.dynamicObject != null) {
              //GENERAL (TAB 1)
              this.selectionAray = this.clientcontractdetails.LinesOfBusiness;
              this.clientcontractForm.patchValue(this.clientcontractdetails);
              this.clientcontractForm.controls["Client"].setValue(
                this.clientcontractdetails.ClientId
              );
              this.clientcontractForm.controls["Client"].disable();
              this.clientcontractForm.controls["Code"].setValue(
                this.clientcontractdetails.Code
              );
              this.clientcontractForm.controls["Code"].disable();
              this.clientcontractForm.controls["Name"].setValue(
                this.clientcontractdetails.Name
              );
              this.clientcontractForm.controls["Description"].setValue(
                this.clientcontractdetails.Description
              );
              this.clientcontractForm.controls["ContractType"].setValue(
                this.clientcontractdetails.ContractType
              );
              this.clientcontractForm.controls["ClientType"].setValue(
                this.clientcontractdetails.ClientType
              );
              this.clientcontractForm.controls["Status"].setValue(
                this.clientcontractdetails.Status
              );
              this.clientcontractForm.controls["servicechosen"].setValue(
                this.selectionAray
              );
              this.clientcontractForm.controls["Value"].setValue(
                this.clientcontractdetails.Value
              );
              this.clientcontractForm.controls["ValidFrom"].setValue(
                this.datePipe.transform(
                  this.clientcontractdetails.ValidFrom,
                  "dd-MM-yyyy"
                )
              );
              this.clientcontractForm.controls["ValidTo"].setValue(
                this.datePipe.transform(
                  this.clientcontractdetails.ValidTo,
                  "dd-MM-yyyy"
                )
              );
              this.contactTypename = this.clientcontractdetails.ContractType;
              this.clientcontractForm.controls["isNapBased"].setValue(
                this.clientcontractdetails.IsNapBased
              );
              if (this.clientcontractdetails.IsNapBased) {
                this.clientcontractForm.controls["napsOnBoardType"].setValue(
                  this.clientcontractdetails.NapsOnboardingType
                );
                this.clientcontractForm.controls["napsLocation"].setValue(
                  this.clientcontractdetails.NAPSLocation
                );
                this.clientcontractForm.controls["napsPlantName"].setValue(
                  this.clientcontractdetails.NAPSPlantName
                );
              }
              this.Update_clientContractType_valitation(
                this.clientcontractdetails.ContractType
              );
              // KEY STAKEHOLDERS	(TAB 2)
              // this.selectedManagers.push(this.clientcontractdetails.LstClientContractStakeHolders.filter(a=>a.ConsultantId != 0));
              this.clientcontractdetails.LstClientContractStakeHolders.forEach(
                (element) => {
                  if (element.ConsultantId != 0) {
                    this.keyMembers.push(element);
                    this.selectedKeyMembers.push(
                      this.internalAccountManagers.find(
                        (a) => a.Id == element.ConsultantId
                      )
                    );
                  }
                }
              );
              if (lstClientContractOperation.AccountManagerUserId != null) {
                this.selectedManagers = this.accountManagersList.filter((accManage) => accManage.Id == lstClientContractOperation.AccountManagerUserId);
              } else {
                this.selectedManagers = [];
              }

              if (lstClientContractOperation.AdditionalConsultantsDetails != null) {
                const addConsultantData = JSON.parse(lstClientContractOperation.AdditionalConsultantsDetails);
                if (addConsultantData.length > 0) {
                  addConsultantData.forEach((ele) => {
                    let found = this.internalAccountManagers.find((acManage) => {
                      if (acManage.Id == ele.UserId) {
                        return acManage;
                      }
                    })
                    if (found && !this.selectedConsultantDetails.includes(found)) {
                      this.selectedConsultantDetails.push(found);
                    }
                  })
                }
              }

              if (lstClientContractOperation.AccountManagerUserId != null) {
                let found = this.accountManagersList.find((amanager) => amanager.Id == lstClientContractOperation.AccountManagerUserId);
                if (found != undefined && !this.selectedManagers.includes(found)) {
                  this.selectedManagers.push(found);
                }
              }

              this.LstClientContractDocuments =
                this.clientcontractdetails.LstClientContractDocuments;

              this.clientcontractdetails.LstClientContractOperations.forEach(
                (element: any) => {
                  this.clientcontractoperationsId = element.Id;
                  this.paycycles = element.ApplicablePayCycles;
                  this.attendancecycles = element.ApplicableAttendanceCycles;
                  this.leavegroups = element.ApplicableLeaveGroups;
                  this.holidaycalenders = element.ApplicableHolidayCalendars;
                  this.noticeperioddays = element.ApplicableNoticePeriodDays;
                  this.Paygroups = element.ApplicablePaygroups;
                  this.insuranceplans = element.ApplicableInsurancePlans;
                  this.statutorydetails = element.LstStatutoryRulesDetails;
                  this.applicableProductInfo = element.AdditionalApplicableProducts != null ? element.AdditionalApplicableProducts : [];
                  if (this.applicableProductInfo !== null && this.applicableProductInfo.length > 0) {
                    this.getApplicableProdName(this.applicableProductInfo, productList);
                  }
                  this.clientcontractForm.controls["PayrollInputMode"].setValue(
                    element.PayrollInputMode == 1 ? true : false
                  );
                  this.clientcontractForm.controls['isHalfYearlyPTApplicable'].setValue(element.IsHalfYearlyPTApplicable);
                  this.clientcontractForm.controls['isAdminChargesNotInBillableAmount'].setValue(element.IsAdminChargesNotInBillableAmount);
                  if (element.BreakupBasedays != 0) {
                    this.clientcontractForm.controls["breakupBasedays"].setValue(
                      element.BreakupBasedays
                    );
                  }
                  if (element.BreakUpBaseHours != 0) {
                    this.clientcontractForm.controls["breakupBaseHours"].setValue(
                      element.BreakUpBaseHours
                    );
                  }
                  let wageInfo: RateType | number = element.WageType;
                  if (wageInfo == 0) {
                    this.clientcontractForm.controls['wageType'].setValue(null);
                  } else {
                    this.clientcontractForm.controls['wageType'].setValue(wageInfo);
                  }
                  this.minimumWagesAppProdList = element.MinimumWagesApplicableProducts == undefined ? [] : element.MinimumWagesApplicableProducts;
                  if (element.ApplicableOneTimeTaxableProduct !== null) {
                    this.clientcontractForm.controls['applicableProductId'].setValue(element.ApplicableOneTimeTaxableProduct.ApplicableProducts);
                    let taxBaseInfo: TaxCalculationBasedOn | number = element.ApplicableOneTimeTaxableProduct.TaxCalculationBasedOn || 0;
                    if (taxBaseInfo != 0) {
                      this.clientcontractForm.controls['taxBasedOn'].setValue(taxBaseInfo);
                    } else {
                      this.clientcontractForm.controls['taxBasedOn'].setValue(null);
                    }
                  } else {
                    this.clientcontractForm.controls['applicableProductId'].setValue(null);
                    this.clientcontractForm.controls['taxBasedOn'].setValue(null);
                  }
                  this.clientcontractForm.controls['isTimeSheetApplicable'].setValue(element.IsTimesheetApplicable == undefined ? false : element.IsTimesheetApplicable); // IsTimeSheetAppicable
                  this.clientcontractForm.controls['isEssActiveLoginRequired'].setValue(element.IsESSActiveLoginRequired == undefined ? false : element.IsESSActiveLoginRequired); //IsESSActiveLoginRequired
                  this.clientcontractForm.controls['isFBPApprovalRequired'].setValue(element.IsFBPApprovalRequired == undefined ? false : element.IsFBPApprovalRequired) // IsFBPApprovalReqiuired
                  this.clientcontractForm.controls['isFBPApplicable'].setValue(element.IsFBPApplicable == undefined ? false : element.IsFBPApprovalRequired); // IsFBPApplicable
                  this.clientcontractForm.controls['productIdForFBPCalculation'].setValue(element.ProductIdForFBPCalculation); // ProductIdForFBPCalculation
                  this.clientcontractForm.controls['percentageForFBPCalculation'].setValue(element.PercentageForFBPCalculation); // PercentageForFBPCalculation
                  this.clientcontractForm.controls['nonOpenPeriodLOP'].setValue(element.BaseDaysTypeForNonOpenPeriodLOP == 0 ? null : element.BaseDaysTypeForNonOpenPeriodLOP); // BaseDaysTypeForNonOpenPeriodLOP
                  this.clientcontractForm.controls['lopRevokal'].setValue(element.BaseDaysTypeForLOPRevokal == 0 ? null : element.BaseDaysTypeForLOPRevokal) // BaseDaysTypeForLOPRevokal
                  this.clientcontractForm.controls['newJoinerArrears'].setValue(element.BaseDaysTypeForNewJoinerArrears == 0 ? null : element.BaseDaysTypeForNewJoinerArrears); // BaseDaysTypeForNewJoinerArrears
                  this.clientcontractForm.controls['isDefaultMinimumWageFromMaster'].setValue(element.IsDefaultMinimumWageFromMaster == undefined ? false : element.IsDefaultMinimumWageFromMaster); // IsDefaultMinimumWageFromMaster
                  this.clientcontractForm.controls['isCTCBasicAmountValidationNotRequired'].setValue(element.IsCTCBasicAmountValidationNotRequired == undefined ? false : element.IsCTCBasicAmountValidationNotRequired); //IsCTCBasicAmountValidationNotRequired 
                }
              );

              if (this.paycycles != null) {
                this.paycycles.forEach((element) => {
                  let payInfo = this.paycyclesList.find((a) => a.Id == element)
                  console.log(payInfo);
                  if (!this.selectedPayCycles.includes(payInfo)) {
                    this.selectedPayCycles.push(payInfo);
                  }
                  this.selectedPayCycles.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }
              if (this.attendancecycles != null) {
                this.attendancecycles.forEach((element) => {
                  let attendanceInfo = this.AttendanceCycleList.find((a) => a.Id == element)
                  console.log(attendanceInfo);
                  if (!this.selectedAttendanceCycle.includes(attendanceInfo)) {
                    this.selectedAttendanceCycle.push(attendanceInfo);
                  }
                  this.selectedAttendanceCycle.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }

              if (this.leavegroups != null) {
                this.leavegroups.forEach((element) => {
                  let leaveInfo = this.LeaveGroupList.find((a) => a.Id == element);
                  console.log(leaveInfo);
                  if (!this.selectedLeaveGroups.includes(leaveInfo)) {
                    this.selectedLeaveGroups.push(leaveInfo);
                  }
                  this.selectedLeaveGroups.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }

              if (this.holidaycalenders != null) {
                this.holidaycalenders.forEach((element) => {
                  let holidayInfo = this.HolidayCalendarList.find((a) => a.Id == element);
                  console.log(holidayInfo);
                  if (!this.selecteHolidayCalender.includes(holidayInfo)) {
                    this.selecteHolidayCalender.push(holidayInfo);
                  }
                  this.selecteHolidayCalender.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }

              if (this.noticeperioddays != null) {
                this.noticeperioddays.forEach((element) => {
                  let noticeInfo = this.NoticePeriodDaysList.find((a) => a.Id == element);
                  if (!this.selectedNoticePeriods.includes(noticeInfo)) {
                    this.selectedNoticePeriods.push(noticeInfo);
                  }
                  this.selectedNoticePeriods.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }

              if (this.Paygroups != null) {
                this.Paygroups.forEach((element) => {
                  let payInfo = this.PaygroupList.find((a) => a.Id == element.PayGroupId);
                  if (!this.selectedPayGroups.includes(payInfo)) {
                    this.selectedPayGroups.push(payInfo);
                  }
                  this.selectedPayGroups.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }

              if (this.insuranceplans != null) {
                this.insuranceplans.forEach((element) => {
                  let insuranceInfo = this.InsurancePlanList.find((a) => a.Id == element);
                  if (!this.selectedInsurancePlan.includes(insuranceInfo)) {
                    this.selectedInsurancePlan.push(insuranceInfo);
                  }
                  this.selectedInsurancePlan.forEach((element) => {
                    if (element.Id != null) {
                      element.checked = true;
                    }
                  });
                });
              }

              console.log(this.clientcontractForm.value);
              this.spinner = false;
              this.loadingScreenService.stopLoading();
            }
          } else {
            this.spinner = false;
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(
              "A problem occurred while fetching records please contact support team"
            );
            setTimeout(() => {
              this.router.navigate(['/app/listing/ui/clientContract']);
            }, 5000)
            return
          }
        });
    } catch (ex) {
      console.log("EXCP :: ", ex);
    }
  }
  /* #region  Account Manager & key Members */
  addAccountManagerORKeyMember(type) {
    if (type == 'isAccountManager') {
      this.isAccountManager = true;
      this.isKeyMember = false;
    }
    if (type == 'isKeyMember') {
      this.isKeyMember = true;
      this.isAccountManager = false;
    }
    if (type == 'isAddConsDetails') {
      this.isAddConsDetails = true;
      this.isAccountManager = false;
      this.isKeyMember = false;
    }
    $("#popup_chooseAccountManager").modal("show");
  }
  modal_dismiss1() {
    $("#popup_chooseAccountManager").modal("hide");
  }
  /* #endregion */

  /* #region  external Account Manager & key Members */
  addExternalAccountManagerORKeyMember() {

    $("#popup_chooseExternalAccountManager").modal("show");
  }
  modal_dismiss5() {
    $("#popup_chooseExternalAccountManager").modal("hide");
  }
  /* #endregion */

  public findInvalidControls() {
    // this.invaid_fields = [];
    const invalid = [];
    const controls = this.clientcontractForm.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
        // this.invaid_fields.push(name)
      }
    }
    console.log("invalid", invalid);

    return invalid;
  }

  async doSave() {

    if (!this.IsNewActivity) {
      this.clientcontractForm.controls['nonOpenPeriodLOP'].setValidators(Validators.required);
      this.clientcontractForm.controls['nonOpenPeriodLOP'].updateValueAndValidity();
      this.clientcontractForm.controls['lopRevokal'].setValidators(Validators.required);
      this.clientcontractForm.controls['lopRevokal'].updateValueAndValidity();
      this.clientcontractForm.controls['newJoinerArrears'].setValidators(Validators.required);
      this.clientcontractForm.controls['newJoinerArrears'].updateValueAndValidity();

      this.clientcontractForm.controls['applicableProductId'].setValidators(Validators.required);
      this.clientcontractForm.controls['applicableProductId'].updateValueAndValidity();
      this.clientcontractForm.controls['taxBasedOn'].setValidators(Validators.required);
      this.clientcontractForm.controls['taxBasedOn'].updateValueAndValidity();

      if (this.selectedNoticePeriods.length == 0) {
        this.alertService.showWarning(
          "Please select Applicable Notice Period Days"
        );
        return;
      }

      if (this.selectedInsurancePlan.length == 0) {
        this.alertService.showWarning(
          "Please select Applicable Insurance Plans"
        );
        return;
      }

      if (this.selectedPayGroups.length == 0) {
        this.alertService.showWarning(
          "Please select Applicable PayGroups"
        );
        return;
      }

      if (this.statuatoryRuleInfo.length == 0) {
        this.alertService.showWarning(
          "Please select Statuatory Rules Details"
        );
        return;
      }
      if (this.selectedConsultantDetails.length == 0) {
        this.alertService.showWarning(
          'Please select Additional Consultant Details');
      }
    }
    this.findInvalidControls();
    this.submitted = true;
    if (this.clientcontractForm.invalid) {
      this.alertService.showWarning(
        "Attention: The action was blocked. Please fill in all required fields "
      );
      return;
    }


    this.keyStakeHoldersList.length = 0;
    this.loadingScreenService.startLoading();
    if (
      this.clientcontractdetails &&
      Object.keys(this.clientcontractdetails).length > 0
    ) {
      this.ClientContractId = this.clientcontractdetails.Id !== undefined ? this.clientcontractdetails.Id : 0;  // on edit
    } else {
      this.ClientContractId = 0; // on add
    }

    // selectedKeymembers
    this.selectedKeyMembers.forEach((element) => {
      this.keyStakeHolderId = 0;
      if (
        this.keyMembers.find((a) => a.ConsultantId == element.Id) != undefined
      ) {
        this.keyStakeHolderId = this.keyMembers.find(
          (a) => a.ConsultantId == element.Id
        ).Id;
      }
      this.keyStakeHoldersList.push({
        Id: this.keyStakeHolderId,
        ClientContractId: this.ClientContractId,
        ConsultantId: element.Id,
        ClientContactId: 0,
        IsDefault: false,
        EffectiveFrom: new Date(),
        Status: 1,
        Modetype: this.keyStakeHolderId > 0 ? UIMode.None : UIMode.Edit,
      });
    });
    // deletedKeymembers
    this.deletedKeyMembersLst.forEach((element) => {
      this.keyStakeHolderId = 0;
      if (
        this.keyMembers.find((a) => a.ConsultantId == element.Id) != undefined
      ) {
        this.keyStakeHolderId = this.keyMembers.find(
          (a) => a.ConsultantId == element.Id
        ).Id;
      }
      this.keyStakeHoldersList.push({
        Id: this.keyStakeHolderId,
        ClientContractId: this.ClientContractId,
        ConsultantId: element.Id,
        ClientContactId: 0,
        IsDefault: false,
        EffectiveFrom: new Date(),
        Status: 1,
        Modetype: UIMode.Delete,
      });
    });

    // this.selectedClientContacts.forEach((element) => {
    //   this.keyStakeHolderId = 0;
    //   if (
    //     this.clientcontacts.find((a) => a.ClientContactId == element.Id) !=
    //     undefined
    //   ) {
    //     this.keyStakeHolderId = this.clientcontacts.find(
    //       (a) => a.ClientContactId == element.Id
    //     ).Id;
    //   }
    //   this.keyStakeHoldersList.push({
    //     Id: this.keyStakeHolderId,
    //     ClientContractId: this.ClientContractId,
    //     ConsultantId: 0,
    //     // roleId: null,
    //     ClientContactId: element.Id,
    //     IsDefault: false,
    //     EffectiveFrom: new Date(),
    //     Status: 1,
    //     Modetype: this.keyStakeHolderId > 0 ? UIMode.None : UIMode.Edit,
    //   });
    // });



    // this.deletedClientContactLst.forEach((element) => {
    //   this.keyStakeHolderId = 0;
    //   if (
    //     this.clientcontacts.find((a) => a.ClientContactId == element.Id) !=
    //     undefined
    //   ) {
    //     this.keyStakeHolderId = this.clientcontacts.find(
    //       (a) => a.ClientContactId == element.Id
    //     ).Id;
    //   }
    //   console.log("keystakeholder", this.keyStakeHolderId);
    //   this.keyStakeHoldersList.push({
    //     Id: this.keyStakeHolderId,
    //     ClientContractId: this.ClientContractId,
    //     ConsultantId: 0,
    //     ClientContactId: element.Id,
    //     IsDefault: false,
    //     EffectiveFrom: new Date(),
    //     Status: 1,
    //     Modetype: UIMode.Delete,
    //   });
    // });

    this.paycycles = [];
    this.attendancecycles = [];
    this.leavegroups = [];
    this.holidaycalenders = [];
    this.noticeperioddays = [];
    this.Paygroups = [];
    this.insuranceplans = [];
    this.statutorydetails = [];

    this.selectedPayCycles.forEach((element) => {
      this.paycycles.push(element.Id);
    });
    this.selectedAttendanceCycle.forEach((element) => {
      this.attendancecycles.push(element.Id);
    });

    this.selectedLeaveGroups.forEach((element) => {
      this.leavegroups.push(element.Id);
    });
    this.selecteHolidayCalender.forEach((element) => {
      this.holidaycalenders.push(element.Id);
    });

    this.selectedNoticePeriods.forEach((element) => {
      this.noticeperioddays.push(element.Id);
    });
    this.selectedInsurancePlan.forEach((element) => {
      this.insuranceplans.push(element.Id);
    });

    this.selectedPayGroups.forEach((element) => {
      this.Paygroups.push({ PayGroupId: element.Id });
    });
    let CCoperation = new ClientContractOperations();
    if (
      this.clientcontractdetails.LstClientContractOperations &&
      this.clientcontractdetails.LstClientContractOperations.length > 0 && !this.IsNewActivity
    ) {
      // editing info
      CCoperation = this.clientcontractdetails.LstClientContractOperations[0];
      console.log('list client contract operations ', this.clientcontractdetails.LstClientContractOperations[0])
      CCoperation.ClientContractId = this.ClientContractId;
      this.Paygroups.length > 0
        ? (CCoperation.ApplicablePaygroups = this.Paygroups)
        : true;
      this.paycycles.length > 0
        ? (CCoperation.ApplicablePayCycles = this.paycycles)
        : true;
      this.attendancecycles.length > 0
        ? (CCoperation.ApplicableAttendanceCycles = this.attendancecycles)
        : true;
      this.leavegroups.length > 0
        ? (CCoperation.ApplicableLeaveGroups = this.leavegroups)
        : true;
      this.holidaycalenders.length > 0
        ? (CCoperation.ApplicableHolidayCalendars = this.holidaycalenders)
        : true;
      this.noticeperioddays.length > 0
        ? (CCoperation.ApplicableNoticePeriodDays = this.noticeperioddays)
        : true;
      CCoperation.PayrollInputMode =
        this.clientcontractForm.get("PayrollInputMode").value == true ? 1 : 0;

      CCoperation.LstStatutoryRulesDetails = this.statuatoryRuleInfo;
      this.insuranceplans.length > 0
        ? (CCoperation.ApplicableInsurancePlans = this.insuranceplans)
        : true;
      CCoperation.Status = 1;
      CCoperation.MinimumWagesApplicableProducts = this.minimumWagesAppProdList// MinimumWagesApplicableProducts - not getting 
      CCoperation.ProductStatutoryScaleDetails = this.productStatuatoryInfo// ProductStatutoryScaleDetails
      let AppOneTimeTaxPro: any = {};
      AppOneTimeTaxPro['ApplicableProducts'] = this.clientcontractForm.controls['applicableProductId'].value != null ? this.clientcontractForm.controls['applicableProductId'].value : [];
      AppOneTimeTaxPro['TaxCalculationBasedOn'] = this.clientcontractForm.controls['taxBasedOn'].value;
      console.log('ApplicableOneTimeTaxableProduct ', AppOneTimeTaxPro);
      CCoperation.ApplicableOneTimeTaxableProduct = AppOneTimeTaxPro; // ApplicableOneTimeTaxableProduct
      CCoperation.IsAdminChargesNotInBillableAmount = this.clientcontractForm.controls['isAdminChargesNotInBillableAmount'].value // IsAdminChargesNotInBillableAmount - its boolean
      CCoperation.CustomData3 = ''
      CCoperation.CustomData4 = ''
      CCoperation.IsHalfYearlyPTApplicable = this.clientcontractForm.controls['isHalfYearlyPTApplicable'].value
      CCoperation.AdditionalApplicableProducts = this.applicableProductInfo // AdditionalApplicableProducts 
      CCoperation.BreakupBasedays = Number(this.clientcontractForm.controls['breakupBasedays'].value)
      CCoperation.BreakUpBaseHours = Number(this.clientcontractForm.controls['breakupBaseHours'].value);
      CCoperation.WageType = this.clientcontractForm.controls['wageType'].value | 0  // WageType - dropdown
      CCoperation.IsTimesheetApplicable = this.clientcontractForm.controls['isTimeSheetApplicable'].value; // IsTimeSheetAppicable
      CCoperation.IsESSActiveLoginRequired = this.clientcontractForm.controls['isEssActiveLoginRequired'].value; //IsESSActiveLoginRequired
      CCoperation.IsFBPApprovalRequired = this.clientcontractForm.controls['isFBPApprovalRequired'].value // IsFBPApprovalReqiuired
      CCoperation.IsFBPApplicable = this.clientcontractForm.controls['isFBPApplicable'].value; // IsFBPApplicable
      CCoperation.ProductIdForFBPCalculation = this.clientcontractForm.controls['productIdForFBPCalculation'].value; // ProductIdForFBPCalculation
      CCoperation.PercentageForFBPCalculation = this.clientcontractForm.controls['percentageForFBPCalculation'].value; // PercentageForFBPCalculation
      CCoperation.BaseDaysTypeForNonOpenPeriodLOP = this.clientcontractForm.controls['nonOpenPeriodLOP'].value; // BaseDaysTypeForNonOpenPeriodLOP
      CCoperation.BaseDaysTypeForLOPRevokal = this.clientcontractForm.controls['lopRevokal'].value // BaseDaysTypeForLOPRevokal
      CCoperation.BaseDaysTypeForNewJoinerArrears = this.clientcontractForm.controls['newJoinerArrears'].value; // BaseDaysTypeForNewJoinerArrears
      CCoperation.IsDefaultMinimumWageFromMaster = this.clientcontractForm.controls['isDefaultMinimumWageFromMaster'].value; // IsDefaultMinimumWageFromMaster
      CCoperation.IsCTCBasicAmountValidationNotRequired = this.clientcontractForm.controls['isCTCBasicAmountValidationNotRequired'].value; //IsCTCBasicAmountValidationNotRequired 

      CCoperation.Modetype = UIMode.Edit;
      if (this.selectedManagers.length == 1) {
        CCoperation.AccountManagerUserId = this.selectedManagers[0].Id;
      }
      if (this.selectedConsultantDetails.length > 0) {
        let consJsonArr = [];
        this.selectedConsultantDetails.forEach((consData) => {
          const addConsJson = {};
          addConsJson['UserId'] = consData.Id;
          consJsonArr.push(addConsJson);
        })
        console.log('consJsonArr ', consJsonArr);
        let roleIdList = [2, 8];
        for (let i = 0; i < consJsonArr.length; i++) {
          if (i % 2 == 0) {
            consJsonArr[i].RoleId = roleIdList[0];
          } else {
            consJsonArr[i].RoleId = roleIdList[1];
          }
        }
        console.log('consJsonArr ', consJsonArr);
        CCoperation.AdditionalConsultantsDetails = JSON.stringify(consJsonArr);
      }

      this.clientcontractdetails.LastUpdatedBy = String(this._loginSessionDetails.UserSession.UserId);
      this.clientcontractdetails.LastUpdatedOn = new Date().toISOString();
    } else {
      // adding info
      CCoperation.ClientContractId = 0;
      CCoperation.ApplicablePaygroups = this.Paygroups;
      CCoperation.ApplicablePayCycles = this.paycycles;
      CCoperation.ApplicableAttendanceCycles = this.attendancecycles;
      CCoperation.ApplicableLeaveGroups = this.leavegroups;
      CCoperation.ApplicableHolidayCalendars = this.holidaycalenders;
      CCoperation.ApplicableNoticePeriodDays = this.noticeperioddays;
      CCoperation.PayrollInputMode =
        this.clientcontractForm.get("PayrollInputMode").value == true ? 1 : 0;
      CCoperation.ApplicableInsurancePlans = this.insuranceplans;
      CCoperation.Status = 0;
      CCoperation.Modetype = UIMode.None;
      CCoperation.IsTimesheetApplicable = this.clientcontractForm.controls['isTimeSheetApplicable'].value == null ? false : this.clientcontractForm.controls['isTimeSheetApplicable'].value;
      this.clientcontractdetails.CreatedBy = String(this._loginSessionDetails.UserSession.UserId);
      this.clientcontractdetails.LastUpdatedBy = String(this._loginSessionDetails.UserSession.UserId);
      this.clientcontractdetails.CreatedOn = new Date().toISOString();
      this.clientcontractdetails.LastUpdatedOn = new Date().toISOString();
    }

    // DATA RE-BINDING GENERAL
    this.clientcontractdetails.ClientId = this.clientcontractForm.get("Client").value;
    this.clientcontractdetails.Name = this.clientcontractForm.get("Name").value;
    this.clientcontractdetails.Code = this.clientcontractForm.get("Code").value;
    this.clientcontractdetails.Description = this.clientcontractForm.get("Description").value;
    this.clientcontractdetails.ContractType = this.clientcontractForm.get("ContractType").value;
    this.clientcontractdetails.ClientType = this.clientcontractForm.get("ClientType").value;
    this.clientcontractdetails.LinesOfBusiness = this.clientcontractForm.get("servicechosen").value;
    this.clientcontractdetails.Status = this.clientcontractForm.get("Status").value;
    this.clientcontractdetails.Status = Boolean(this.clientcontractdetails.Status) == false ? 0 : 1;
    this.clientcontractdetails.IsNapBased = this.clientcontractForm.get("isNapBased").value;
    if (this.clientcontractForm.get("isNapBased").value) {
      this.clientcontractdetails.NapsOnboardingType = this.clientcontractForm.get("napsOnBoardType").value;
      this.clientcontractdetails.NAPSLocation = this.clientcontractForm.get("napsLocation").value;
      this.clientcontractdetails.NAPSPlantName = this.clientcontractForm.get("napsPlantName").value;
    }
    if (this.clientcontractForm.get('ContractType').value == 3) {
      this.clientcontractForm.controls['ValidFrom'] != null ? this.clientcontractdetails.ValidFrom = moment(this.clientcontractForm.get('ValidFrom').value, 'DD-MM-YYYY').format('YYYY-MM-DD') : true;
      this.clientcontractForm.controls['ValidTo'] != null ? this.clientcontractdetails.ValidTo = moment(this.clientcontractForm.get('ValidTo').value, 'DD-MM-YYYY').format('YYYY-MM-DD') : true;
    }
    if (this.clientcontractForm.get('ContractType').value == 2) {
      this.clientcontractForm.controls["Value"] != null
        ? (this.clientcontractdetails.Value =
          this.clientcontractForm.get("Value").value)
        : true;
    }

    if (
      this.clientcontractdetails.ContractType == 2 &&
      this.clientcontractdetails.ValidFrom != null
    ) {
      if (Number(this.clientcontractForm.get("Value").value) == 0) {
        this.clientcontractdetails.ValidTo =
          this.clientcontractdetails.ValidFrom;
      } else {
        var myDate = new Date(this.clientcontractdetails.ValidFrom);
        var newDate = moment(myDate);
        let nextMonth = newDate.add(
          "month",
          Number(this.clientcontractForm.get("Value").value)
        );
        nextMonth.subtract(1, "days");
        this.clientcontractdetails.ValidTo =
          moment(nextMonth).format("YYYY-MM-DD");
      }
    }

    if (
      this.LstClientContractDocuments &&
      this.LstClientContractDocuments.length > 0
    ) {
      this.LstClientContractDocuments.forEach((e3) => {
        e3.Id = this.isGuid(e3.Id) == true ? 0 : e3.Id;
        e3.SignedOn = moment(e3.SignedOn).format("YYYY-MM-DD");
      });
    }

    this.clientcontractdetails.LstClientContractDocuments =
      this.LstClientContractDocuments;

    this.clientcontractdetails.Modetype = UIMode.Edit;
    this.clientcontractdetails.LstClientContractStakeHolders =
      this.keyStakeHoldersList.length > 0 ? this.keyStakeHoldersList : [];
    this.clientcontractdetails.LstClientContractOperations = [];
    this.clientcontractdetails.LstClientContractOperations.push(CCoperation);
    let serviceFee_Data =
      this.sessionService.getSessionStorage("serviceFee_data");
    if (serviceFee_Data) {
      console.log(JSON.parse(JSON.parse(serviceFee_Data)));
      this.clientcontractdetails.LstMarkupMappingDetails = JSON.parse(
        JSON.parse(serviceFee_Data)
      );
    }

    console.log("form", this.clientcontractForm.value.servicechosen);

    var currentDate = new Date();
    console.log(currentDate);
    console.log(this.clientcontractdetails);
    if (this.ClientContractId == 0) {
      this.contractbase = {
        Code: this.clientcontractdetails.Code,
        Name: this.clientcontractdetails.Name,
        ClientId: this.clientcontractdetails.ClientId,
      };
      this.clientcontractdetails.ClientContractBase = this.contractbase;
      if (this.clientcontractdetails.ContractType != 3) {
        this.clientcontractdetails.ValidFrom =
          moment(currentDate).format("YYYY-MM-DD");
        this.clientcontractdetails.ValidTo =
          moment(currentDate).format("YYYY-MM-DD");
      }
      this.clientcontractdetails.SignedOn =
        moment(currentDate).format("YYYY-MM-DD");
    }



    console.log("NEW", this.clientcontractdetails);
    _ClientContractModel.newobj = this.clientcontractdetails;
    var ClientContract_request_param = JSON.stringify(_ClientContractModel);
    var ClientContract_request_paramnew = JSON.stringify(
      _ClientContractModel.newobj
    );
    if (this.clientcontractdetails.Id > 0) {
      // on edit
      this.clientcontractService
        .putClientContractdetils(ClientContract_request_param)
        .subscribe(
          (data: any) => {
            // this.spinnerEnd();
            if (data.Status) {
              this.submitted = false;
              this.edit_ClientContractDetails();
              var productBillingGroup = JSON.parse(
                JSON.parse(
                  this.sessionService.getSessionStorage("billing_data")
                )
              );
              var invoice_productwise_data = JSON.parse(
                JSON.parse(
                  this.sessionService.getSessionStorage(
                    "invoice_productwise_data"
                  )
                )
              );
              var GroupingText =
                this.sessionService.getSessionStorage("GroupingText");
              var invoice_saleOrder_data = JSON.parse(
                JSON.parse(
                  this.sessionService.getSessionStorage(
                    "invoice_saleOrder_data"
                  )
                )
              );

              console.log("invoice_saleOrder_data", invoice_saleOrder_data);
              console.log("invoice_productwise_data", invoice_productwise_data);
              console.log("productBillingGroup", productBillingGroup);
              console.log("grouping text ", GroupingText);
              if (
                invoice_saleOrder_data == null &&
                (invoice_productwise_data == null ||
                  invoice_productwise_data.length == 0) &&
                productBillingGroup == null
              ) {
                this.alertService.showSuccess(data.Message);
                this.loadingScreenService.stopLoading();
                // this.router.navigate(['/app/listing/ui/clientContract']); // Ananth changes
                return;
              }
              (invoice_productwise_data != null ||
                invoice_saleOrder_data != null) &&
                productBillingGroup != null
                ? this.upsertProductBillingGroup().then((res) => {
                  if (
                    (invoice_productwise_data == null ||
                      invoice_productwise_data.length == 0) &&
                    invoice_saleOrder_data == null
                  ) {
                    this.loadingScreenService.stopLoading();
                    // this.router.navigate(['/app/listing/ui/clientContract']); // Ananth changes
                    return;
                  }

                  GroupingText != "Advanced Grouping"
                    ? invoice_productwise_data != null &&
                    this.upsertProductwiseGroup(invoice_productwise_data)
                    : invoice_saleOrder_data != null &&
                    this.upsertSaleOrderGroup(invoice_saleOrder_data);
                })
                : (invoice_productwise_data == null ||
                  invoice_saleOrder_data == null) &&
                  productBillingGroup != null
                  ? this.upsertProductBillingGroup().then((res) => {
                    this.loadingScreenService.stopLoading();
                  })
                  : invoice_productwise_data != null &&
                    invoice_saleOrder_data != null &&
                    productBillingGroup == null
                    ? this.upsertProductwiseGroup1(invoice_productwise_data)
                    : (invoice_productwise_data != null ||
                      invoice_saleOrder_data != null) &&
                      productBillingGroup == null
                      ? GroupingText != "Advanced Grouping"
                        ? this.upsertProductwiseGroup(invoice_productwise_data)
                        : this.upsertSaleOrderGroup(invoice_saleOrder_data)
                      : (this.alertService.showSuccess(data.Message),
                        this.loadingScreenService.stopLoading());
            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(data.Message);
            }
          },
          (err) => {
            // this.spinnerEnd();
            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          }
        );
    } else {
      console.log('ClientContract_request_paramnew', ClientContract_request_paramnew);

      // on add
      this.clientcontractService
        .postClientContractdetils(ClientContract_request_paramnew)
        .subscribe(
          (data: any) => {
            console.log(data);

            // this.spinnerEnd();
            if (data.Status) {
              this.alertService.showSuccess(data.Message);
              this.IsNewActivity = false;
              this.loadingScreenService.stopLoading();
              if (data.dynamicObject) {
                let dynamicObject = data.dynamicObject;
                this.Id = dynamicObject.Id;
                this.ClientContractId = dynamicObject.Id;
                this.ClientId = dynamicObject.ClientId;
                this.ContractCode = dynamicObject.Code;
                this.clientcontractdetails = dynamicObject;

                this.coreObject = JSON.stringify({
                  CompanyId: this.CompanyId,
                  ContractId: this.Id,
                  UserId: this.UserId,
                  ClientId:
                    this.ClientId,
                  ContractCode:
                    this.ContractCode,
                  ClientDetails: null,
                });
                this.edit_ClientContractDetails();
              }

            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(data.Message);
          
              return
            }
          },
          (err) => {
            // this.spinnerEnd();
            this.alertService.showWarning(`Something is wrong!  ${err}`);
            console.log("Something is wrong! : ", err);
          }
        );
    }
  }

  upsertProductwiseGroup1(_LstProductWiseInvoiceGroup) {
    console.log("_LstProductWiseInvoiceGroup", _LstProductWiseInvoiceGroup);

    this.clientContractService
      .Put_Put_UpsertProductWiseInvoiceGroup(_LstProductWiseInvoiceGroup)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();

          var invoice_saleOrder_data1 = JSON.parse(
            JSON.parse(
              this.sessionService.getSessionStorage("invoice_saleOrder_data")
            )
          );
          if (invoice_saleOrder_data1 != undefined && invoice_saleOrder_data1.LstGroupingItems.length > 0) {
            this.upsertSaleOrderGroup(invoice_saleOrder_data1);
          }
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      });
  }

  upsertProductwiseGroup(_LstProductWiseInvoiceGroup) {
    console.log("_LstProductWiseInvoiceGroup", _LstProductWiseInvoiceGroup);

    this.clientContractService
      .Put_Put_UpsertProductWiseInvoiceGroup(_LstProductWiseInvoiceGroup)
      .subscribe((result) => {
        const apiResult: apiResult = result;
        if (apiResult.Status) {
          this.loadingScreenService.stopLoading();

          var invoice_productwise_data = JSON.parse(
            JSON.parse(
              this.sessionService.getSessionStorage("invoice_productwise_data")
            )
          );
          var GroupingText =
            this.sessionService.getSessionStorage("GroupingText");
          var invoice_saleOrder_data = JSON.parse(
            JSON.parse(
              this.sessionService.getSessionStorage("invoice_saleOrder_data")
            )
          );

          this.alertService.showSuccess(
            "Client Contract Details has been updated successfully"
          );
          // this.router.navigate(['/app/listing/ui/clientContract']) // Ananth Changes
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      });
  }
  public isGuid(stringToTest) {
    if (stringToTest[0] === "{") {
      stringToTest = stringToTest.substring(1, stringToTest.length - 1);
    }
    var regexGuid =
      /^(\{){0,1}[0-9a-fA-F]{8}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{4}\-[0-9a-fA-F]{12}(\}){0,1}$/gi;
    return regexGuid.test(stringToTest);
  }

  upsertSaleOrderGroup(clientSaleOrderGrouping) {
    console.log("clientSaleO   rderGrouping", clientSaleOrderGrouping);
    if (clientSaleOrderGrouping != null) {
      // if (clientSaleOrderGrouping.LstGroupingItems.length > 0) { for remove if the invoice of length is zero or save and delte purpose
      clientSaleOrderGrouping.LstGroupingItems.forEach((e) => {
        console.log("e", e);

        e.forEach((element) => {
          var i = [];
          console.log("element", element);
          delete element.Id;
          let isarray = element.FieldValues instanceof Array; // Will be true
          if (isarray == false) {
            i.push(element.FieldValues);
            if (
              element.FieldValues.length == 0 &&
              element.FieldValues != null
            ) {
              element.FieldValues = i;
            }
          }
        });

        // const usingSplit = string.split('-');
      });
      let lstGroupingItems = clientSaleOrderGrouping.LstGroupingItems[0];
      for (let i = 0; i < lstGroupingItems.length; i++) {
        lstGroupingItems[i].FieldValues = [parseInt(lstGroupingItems[i].FieldValues)]
      }
      clientSaleOrderGrouping.LstGroupingItems[0] = lstGroupingItems;
      var cc = new ClientSaleOrderGrouping();
      cc.ClientId = this.ClientId;
      cc.Id = clientSaleOrderGrouping.Id;
      cc.ClientContractId = this.Id;
      cc.CompanyId = this.CompanyId;
      cc.ProcessCategory = 1;
      cc.ContainerType = 1;
      cc.MaxBillAmountPerSaleOrder = 0;
      cc.ListOfGroupingFieldList = clientSaleOrderGrouping.LstGroupingItems;
      console.log("clientSaleOrderGrouping", cc);

      console.log("clientSaleOrderGrouping", cc);

      this.clientContractService
        .Put_UpsertClientSaleOrderGrouping(cc)
        .subscribe((result) => {
          const apiResult: apiResult = result;
          if (apiResult.Status) {
            this.loadingScreenService.stopLoading();
            this.alertService.showSuccess(
              "Client Contract Details has been updated successfully"
            );
            // this.router.navigate(['/app/listing/ui/clientContract'])  //Ananth changes
          } else {
            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(apiResult.Message);
          }
        });
      // }
    }
  }

  upsertProductBillingGroup() {
    return new Promise((resolve, reject) => {
      var productBillingGroup = JSON.parse(
        JSON.parse(this.sessionService.getSessionStorage("billing_data"))
      );
      console.log('product billing group ', productBillingGroup);
      this.clientContractService
        .Put_UpsertBillingProductGroup(JSON.stringify(productBillingGroup))
        .subscribe((result) => {
          const apiResult: apiResult = result;
          this.loadingScreenService.stopLoading();
          if (apiResult.Status) {
            this.alertService.showSuccess(apiResult.Message);
            resolve(true);
          } else {
            this.alertService.showWarning(apiResult.Message);
            reject(false);
          }
        });
    });
  }

  updateValidation(value, control: AbstractControl) {
    if (value) {
      control.setValidators([Validators.required]);
    } else {
      control.clearValidators();
      control.setErrors(null);
    }
    control.updateValueAndValidity();
  }

  // ON CONTRCT TYPE ONCHANGE FUNCTION AND VALIDATION
  oncontractTypechange(event) {
    console.log("CONTRACT TYPE : ", event);
    if (event != undefined) {
      this.contactTypename = event.id;
    }
    this.Update_clientContractType_valitation(event.id);
  }
  Update_clientContractType_valitation(cctypeId) {
    if (cctypeId == 2) {
      this.updateValidation(true, this.clientcontractForm.get("Value"));
      this.updateValidation(false, this.clientcontractForm.get("ValidFrom"));
      this.updateValidation(false, this.clientcontractForm.get("ValidTo"));
    } else if (cctypeId == 3) {
      this.updateValidation(true, this.clientcontractForm.get("ValidFrom"));
      this.updateValidation(true, this.clientcontractForm.get("ValidTo"));
      this.updateValidation(false, this.clientcontractForm.get("Value"));
    } else {
      this.updateValidation(false, this.clientcontractForm.get("Value"));
      this.updateValidation(false, this.clientcontractForm.get("ValidFrom"));
      this.updateValidation(false, this.clientcontractForm.get("ValidTo"));
    }
  }

  contractservicechange(event) {
    this.selectionAray.length = 0;
    console.log(event);
    event.forEach((element) => {
      this.selectionAray.push(element.Id);
    });
    console.log(this.selectionAray);
  }

  loadData(event) {
    if (event.nextId == "InternalOperations") {
      // accordion_Name == "isCommunicationdetails"
      // alert(event.nextId )
      this.isSummary_panel = true;
      this.InternaloperationListGrp == undefined
        ? this.doAccordionLoading(event.nextId)
        : undefined;
    } else if (event.nextId == "ContractTerms") {
      this.isSummary_panel = true;
      this.ContractTermsListGrp == undefined
        ? this.doAccordionLoading(event.nextId)
        : undefined;
    } else if (event.nextId == "keydates") {
      this.ContractTermsListGrp == undefined
        ? this.doAccordionLoading(event.nextId)
        : undefined;
    } else if (event.nextId == "contractDocuments") {
      // this.ContractTermsListGrp == undefined ? this.doAccordionLoading(event.nextId) : undefined;
    }

    this.activeTabName = event.nextId;
  }

  public doAccordionLoading(accordion_Name: any) { }

  // add_Account_Manager() {
  //   const modalRef = this.modalService.open(AccountManagerComponent);
  //   modalRef.result.then((result) => {
  //     console.log('result', result);
  //   }).catch((error) => {
  //     console.log(error);
  //   });
  // }

  /* #region  INVESTMENT AND DEDUCTION PROOF */
  addInvestmentCategory() {
    $("#popup_chooseCategory").modal("show");
  }
  modal_dismiss2() {
    $("#popup_chooseCategory").modal("hide");
  }
  /* #endregion */

  // LeaveGroups, HolidayCalendars,NoticePeriodDays,InsurancePlans,PayGroups,StatutoryRules,MinimumWages

  /* #region  paycycle */
  addOperations(index) {
    this.nameOfOperationsIndex = index;
    this.nameOfOperationsTxt =
      index == "PayCycle"
        ? "Applicable Pay Cycles"
        : index == "AttendanceCycle"
          ? "Applicable Attendance Cycles"
          : index == "LeaveGroups"
            ? "Applicable Leave Groups"
            : index == "HolidayCalendars"
              ? "Applicable Holiday Calendars"
              : index == "NoticePeriodDays"
                ? "Applicable Notice Period Days"
                : index == "InsurancePlans"
                  ? "Applicable Insurence Plans"
                  : index == "PayGroups"
                    ? " Applicable PayGroups"
                    : index == "StatutoryRules"
                      ? "Statutory Rule Details"
                      : index == "MinimumWages"
                        ? " MinimumWages Applicable Products"
                        : "";
    this.nameOfOperationsPlaceholderTxt = `Start searching for ${this.nameOfOperationsTxt}`;
    this.operationList = [];
    this.operationList =
      index == "PayCycle"
        ? this.paycyclesList
        : index == "AttendanceCycle"
          ? this.AttendanceCycleList
          : index == "LeaveGroups"
            ? this.LeaveGroupList
            : index == "HolidayCalendars"
              ? this.HolidayCalendarList
              : index == "NoticePeriodDays"
                ? this.NoticePeriodDaysList
                : index == "InsurancePlans"
                  ? this.InsurancePlanList
                  : index == "PayGroups"
                    ? this.PaygroupList
                    : index == "StatutoryRules"
                      ? this.StatutoryDetailsList
                      : index == "MinimumWages"
                        ? []
                        : [];

    $("#popup_choosePayCycle").modal("show");
  }

  addMinAppProd(index) {
    this.nameOfOperationsIndex = index;
    this.nameOfOperationsTxt = 'MinimumWages Applicable Products';
    this.nameOfOperationsPlaceholderTxt = `Start searching for ${this.nameOfOperationsTxt}`;
    this.createMinWageAppProdForm();
    this.onMinWageSubmit = false;
    $("#popup_minimumWages").modal('show');
  }

  editMinAppProd(minWageAppInfo, index) {
    this.minWageAppInfo = minWageAppInfo;
    this.minWageAppInfo.onEdit = true;
    this.minWageAppInfo.index = index;
    this.nameOfOperationsIndex = index;
    this.nameOfOperationsTxt = 'Edit MinimumWages Applicable Products';
    this.nameOfOperationsPlaceholderTxt = `Start searching for ${this.nameOfOperationsTxt}`;
    this.minWageAppProdForm.controls['Code'].patchValue(this.minWageAppInfo.Code);
    this.minWageAppProdForm.controls['Name'].patchValue(this.minWageAppInfo.Name);
    this.minWageAppProdForm.controls['ApplicableProducts'].patchValue(this.minWageAppInfo.ApplicableProducts);
    this.minWageAppProdForm.controls['IsIndividualbased'].patchValue(this.minWageAppInfo.IsIndividualbased);
    $("#popup_minimumWages").modal('show');
  }

  deleteMinAppProd(index) {
    this.alertService.confirmSwal("Are you sure you want to delete? ", "This item will be deleted immediately. You can't undo", "Yes").then((res) => {
      this.minimumWagesAppProdList.splice(index, 1);
    });
  }

  closeMinWageAppProd() {
    $("#popup_minimumWages").modal("hide");
  }

  saveMinWageAppProd() {
    console.log('on submit');
    if (this.minWageAppProdForm.invalid) {
      this.onMinWageSubmit = true
      this.alertService.showWarning(
        "Attention: The action was blocked. Please fill in all required fields "
      );
      return;
    }

    if (this.minWageAppInfo == undefined) {
      this.minimumWagesAppProdList.push(this.minWageAppProdForm.value);
      this.minWageAppProdForm.reset('');
    } else if (this.minWageAppInfo.onEdit == true) {
      this.minimumWagesAppProdList[this.minWageAppInfo.index] = this.minWageAppProdForm.value;
    }
    $('#popup_minimumWages').modal('hide');
  }

  addStatutoryRules() {
    const modalRef = this.modalService.open(StatuatoryRuleComponent);
    modalRef.componentInstance.productList = this.productList;
    modalRef.componentInstance.scaleList = this.scaleList;
    // const modalRef = this.modalService.open(StatuatoryModalComponent);
    modalRef.result.then((result) => {
      console.log(result);

      if (result != 'Modal Closed') {
        this.statuatoryRuleInfo.push(result);
        return;
      }

    }).catch((error) => {
      console.log(error);
    });
  }

  editStatuatory(statuatoryInfo, index) {
    const modalRef = this.modalService.open(StatuatoryRuleComponent);
    modalRef.componentInstance.productList = this.productList;
    modalRef.componentInstance.scaleList = this.scaleList;
    modalRef.componentInstance.statuatoryInfo = statuatoryInfo;
    modalRef.componentInstance.onEdit = true;
    modalRef.result.then((result) => {
      console.log(result);

      if (result != 'Modal Closed') {
        this.statuatoryRuleInfo[index] = result;

        return;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  deleteStatuatory(index) {
    this.alertService.confirmSwal("Are you sure you want to delete? ", "This item will be deleted immediately. You can't undo", "Yes").then((res) => {
      this.statuatoryRuleInfo.splice(index, 1);
    });
  }

  addProductStatuatory() {
    const modalRef = this.modalService.open(ProductStatuatoryDetailsComponent);
    modalRef.componentInstance.productList = this.productList;
    modalRef.componentInstance.scaleList = this.scaleList;
    // const modalRef = this.modalService.open(StatuatoryModalComponent);
    modalRef.result.then((result) => {
      console.log(result);

      if (result != 'Modal Closed') {
        this.productStatuatoryInfo.push(result);
        return;
      }

    }).catch((error) => {
      console.log(error);
    });
  }

  editProductStatuatory(productStatInfo, index) {
    const modalRef = this.modalService.open(ProductStatuatoryDetailsComponent);
    modalRef.componentInstance.productList = this.productList;
    modalRef.componentInstance.scaleList = this.scaleList;
    modalRef.componentInstance.produtStatInfo = productStatInfo;
    modalRef.componentInstance.onEdit = true;
    modalRef.result.then((result) => {
      console.log(result);

      if (result != 'Modal Closed') {
        if (result != 'Modal Closed') {
          this.productStatuatoryInfo[index] = result;
        }
        return;
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  deleteProductStatuatory(index) {
    this.alertService.confirmSwal("Are you sure you want to delete? ", "This item will be deleted immediately. You can't undo", "Yes").then((res) => {
      this.productStatuatoryInfo.splice(index, 1);
    });
  }

  addApplicableProduct() {
    const modalRef = this.modalService.open(AdditionalAppProductsComponent);
    modalRef.componentInstance.productList = this.productList;
    // const modalRef = this.modalService.open(StatuatoryModalComponent);
    modalRef.result.then((result) => {
      console.log(result);

      if (result != 'Modal Closed') {
        this.applicableProductInfo.push(result);
        return;
      }

    }).catch((error) => {
      console.log(error);
    });
  }

  editAdditionalProduct(applicableProdInfo, index) {
    const modalRef = this.modalService.open(AdditionalAppProductsComponent);
    modalRef.componentInstance.productList = this.productList;
    modalRef.componentInstance.applicableProdInfo = applicableProdInfo;
    modalRef.componentInstance.onEdit = true;
    modalRef.result.then((result) => {
      console.log(result);

      if (result != 'Modal Closed') {
        this.applicableProductInfo[index] = result;
      }
      return;
    }).catch((error) => {
      console.log(error);
    });
  }

  cloe_modal_operations() {
    this.nameOfOperationsIndex = null;
    this.operationList = [];
    $("#popup_choosePayCycle").modal("hide");
  }
  selectedOperation(event, item) {
    console.log("ind", this.nameOfOperationsIndex);
    let dummyItems = [];
    dummyItems =
      this.nameOfOperationsIndex == "PayCycle"
        ? this.selectedPayCycles
        : this.nameOfOperationsIndex == "AttendanceCycle"
          ? this.selectedAttendanceCycle
          : this.nameOfOperationsIndex == "LeaveGroups"
            ? this.selectedLeaveGroups
            : this.nameOfOperationsIndex == "HolidayCalendars"
              ? this.selecteHolidayCalender
              : this.nameOfOperationsIndex == "NoticePeriodDays"
                ? this.selectedNoticePeriods
                : this.nameOfOperationsIndex == "InsurancePlans"
                  ? this.selectedInsurancePlan
                  : this.nameOfOperationsIndex == "PayGroups"
                    ? this.selectedPayGroups
                    : this.nameOfOperationsIndex == "StatutoryRules"
                      ? this.selectedStatutory
                      : this.nameOfOperationsIndex == "MinimumWages"
                        ? []
                        : [];
    if (event.target.checked) {
      dummyItems.push(item);
    } else {
      const index = dummyItems.indexOf(item);
      if (index > -1) {
        dummyItems.splice(index, 1);
      }
    }
    console.log("dummyItems", dummyItems);

    this.nameOfOperationsIndex == "PayCycle"
      ? (this.selectedPayCycles = dummyItems)
      : this.nameOfOperationsIndex == "AttendanceCycle"
        ? (this.selectedAttendanceCycle = dummyItems)
        : this.nameOfOperationsIndex == "LeaveGroups"
          ? (this.selectedLeaveGroups = dummyItems)
          : this.nameOfOperationsIndex == "HolidayCalendars"
            ? (this.selecteHolidayCalender = dummyItems)
            : this.nameOfOperationsIndex == "NoticePeriodDays"
              ? (this.selectedNoticePeriods = dummyItems)
              : this.nameOfOperationsIndex == "InsurancePlans"
                ? (this.selectedInsurancePlan = dummyItems)
                : this.nameOfOperationsIndex == "PayGroups"
                  ? (this.selectedPayGroups = dummyItems)
                  : this.nameOfOperationsIndex == "StatutoryRules"
                    ? (this.selectedStatutory = dummyItems)
                    : this.nameOfOperationsIndex == "MinimumWages"
                      ? ([] = dummyItems)
                      : [];
  }
  /* #endregion */

  // Ananth Changes start here
  getCheckedOperationList(item) {
    // Ananth changes
    if (this.nameOfOperationsIndex == "PayCycle") {
      return this.selectedPayCycles.includes(item);
    }
    if (this.nameOfOperationsIndex == "AttendanceCycle") {
      return this.selectedAttendanceCycle.includes(item);
    }
    if (this.nameOfOperationsIndex == "LeaveGroups") {
      return this.selectedLeaveGroups.includes(item);
    }
    if (this.nameOfOperationsIndex == "HolidayCalendars") {
      return this.selecteHolidayCalender.includes(item);
    }
    if (this.nameOfOperationsIndex == "NoticePeriodDays") {
      return this.selectedNoticePeriods.includes(item);
    }
    if (this.nameOfOperationsIndex == "InsurancePlans") {
      return this.selectedInsurancePlan.includes(item);
    }
    if (this.nameOfOperationsIndex == "PayGroups") {
      return this.selectedPayGroups.includes(item);
    }
    if (this.nameOfOperationsIndex == "StatutoryRules") {
      return this.selectedStatutory.includes(item);
    }
  } // ananth Changes end here

  /* #region  Attendancwe cycyle */
  AddAttendanceCycle() {
    $("#popup_chooseAttendanceCycle").modal("show");
  }
  modal_dismiss4() {
    $("#popup_chooseAttendanceCycle").modal("hide");
  }
  /* #endregion */

  /* #region  Leave Group */
  AddLeaveGroup() {
    $("#popup_chooseLeaveGroup").modal("show");
  }
  modal_dismiss6() {
    $("#popup_chooseLeaveGroup").modal("hide");
  }
  /* #endregion */

  /* #region  Holiday Calender */
  AddHolidayCalender() {
    $("#popup_chooseHolidayCalender").modal("show");
  }
  modal_dismiss7() {
    $("#popup_chooseHolidayCalender").modal("hide");
  }
  /* #endregion */

  /* #region  Notice Period Days */
  AddNoticePeriodDays() {
    $("#popup_chooseNoticePeriodDays").modal("show");
  }
  modal_dismiss10() {
    $("#popup_chooseNoticePeriodDays").modal("hide");
  }
  /* #endregion */

  /* #region  Pay Group */
  AddPayGroup() {
    $("#popup_choosePayGroups").modal("show");
  }
  modal_dismiss8() {
    $("#popup_choosePayGroups").modal("hide");
  }
  /* #endregion */

  /* #region  Statutory Rule */
  AddStatutoryRule() {
    $("#popup_chooseStatutoryRule").modal("show");
  }
  modal_dismiss9() {
    $("#popup_chooseStatutoryRule").modal("hide");
  }
  /* #endregion */

  confirmExit() {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: "btn btn-primary",
        cancelButton: "btn btn-danger",
      },
      buttonsStyling: true,
    });

    swalWithBootstrapButtons
      .fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        type: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, Exit!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true,
      })
      .then((result) => {
        if (result.value) {
          this.router.navigate(["/app/listing/ui/clientContract"]);
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
        }
      });
  }

  spinnerStarOver() {
    (<HTMLInputElement>document.getElementById("overlay")).style.display =
      "flex";
  }

  spinnerEnd() {
    (<HTMLInputElement>document.getElementById("overlay")).style.display =
      "none";
  }

  findIndexToUpdate(obj) {
    return obj.Id === this;
  }
  // ACCOUNT MANAGER AND KEY MEMEBERS POPUP
  selectAccountManagers(event, item) {
    console.log("item", item);
    let isAlready = false;
    let updateItem = this.selectedManagers.find(
      this.findIndexToUpdate,
      item.Id
    );
    let index = this.selectedManagers.indexOf(updateItem);
    console.log("index", index);
    if (index > -1) {
      this.selectedManagers.splice(index, 1);
      const isExists = this.managers.find((a) => a.ConsultantId == item.Id);
      isExists != undefined && this.deletedManagersLst.push(item);
    } else {
      this.selectedManagers.push(item);
    }
    console.log("this.selectedManagers", this.selectedManagers);
  }

  // CLIENT CONTACT SPOC POPUP LIST
  selectedClientContact(event, item) {
    let updateItem = this.selectedClientContacts.find(
      this.findIndexToUpdate,
      item.Id
    );
    let index = this.selectedClientContacts.indexOf(updateItem);
    if (index > -1) {
      this.selectedClientContacts.splice(index, 1);
      const isExists = this.clientcontacts.find(
        (a) => a.ClientContactId == item.Id
      );
      isExists != undefined && this.deletedClientContactLst.push(item);
    } else {
      this.selectedClientContacts.push(item);
    }
  }

  selectKeyMembers(event, item) {
    console.log("item", item);
    let updateItem = this.selectedKeyMembers.find(
      this.findIndexToUpdate,
      item.Id
    );
    let index = this.selectedKeyMembers.indexOf(updateItem);
    console.log("index", index);
    if (index > -1) {
      this.selectedKeyMembers.splice(index, 1);
      const isExists = this.keyMembers.find((a) => a.ConsultantId == item.Id);
      isExists != undefined && this.deletedKeyMembersLst.push(item);
    } else {
      this.selectedKeyMembers.push(item);
    }
    console.log("this.selectedKeyMembers", this.selectedKeyMembers);

  }

  selectConsDetails(event, item) {
    console.log('item ', item);
    let updateItem = this.selectedConsultantDetails.find(
      this.findIndexToUpdate,
      item.Id
    );
    let index = this.selectedConsultantDetails.indexOf(updateItem);
    console.log("index", index);
    if (index > -1) {
      this.selectedConsultantDetails.splice(index, 1);
      const isExists = this.consultDetails.find((a) => a.ConsultantId == item.Id);
      isExists != undefined && this.deleteConsLst.push(item);
    } else {
      this.selectedConsultantDetails.push(item);
    }
    console.log("this.selectedConsultantDetails", this.selectedConsultantDetails);

  }

  doCheckItemExist(item, content) {
    if (content == 'Account') {
      return this.selectedManagers.length > 0 && this.selectedManagers.find((i) => i.Id == item.Id) ? true : false;
    } else if (content == 'Keymember') {
      return this.selectedKeyMembers.length > 0 && this.selectedKeyMembers.find((i) => i.Id == item.Id) ? true : false;
    } else if (content == 'ConsDetails') {
      return this.selectedConsultantDetails.length > 0 && this.selectedConsultantDetails.find((i) => i.Id == item.Id) ? true : false;
    } else {
      return this.selectedClientContacts.length > 0 && this.selectedClientContacts.find((i) => i.Id == item.Id) ? true : false
    }
  }

  SelectedPayCycle(event, item) {
    let dummyItems = [];
    dummyItems =
      this.nameOfOperationsIndex == "PayCycle" ? this.selectedPayCycles : [];
    if (event.target.checked) {
      dummyItems.push(item);
    } else {
      const index = dummyItems.indexOf(item);
      if (index > -1) {
        dummyItems.splice(index, 1);
      }
    }
    this.nameOfOperationsIndex == "PayCycle"
      ? (this.selectedPayCycles = dummyItems)
      : [];

    console.log(this.selectedPayCycles);
  }

  selectedPayCycledefult(event, item) {
    console.log(item);
  }

  savepaycycles() {
    if (this.selectedPayCycles.length != 0) {
      // this.modal_dismiss3()
    } else {
      this.alertService.showWarning("At Least Choose One Pay Cycle");
    }
  }

  selectedAttendance(event, item) {
    console.log(item);

    if (event.target.checked) {
      this.selectedAttendanceCycle.push(item);
    } else {
      const index = this.selectedAttendanceCycle.indexOf(item);
      if (index > -1) {
        this.selectedAttendanceCycle.splice(index, 1);
      }
    }
    console.log(this.selectedAttendanceCycle);
  }

  saveattendancecycles() {
    if (this.selectedAttendanceCycle.length != 0) {
      this.modal_dismiss4();
    } else {
      this.alertService.showWarning("At Least Choose One Attendance Cycle");
    }
  }

  selectedLeaveGroup(event, item) {
    console.log(item);

    if (event.target.checked) {
      this.selectedLeaveGroups.push(item);
    } else {
      const index = this.selectedLeaveGroups.indexOf(item);
      if (index > -1) {
        this.selectedLeaveGroups.splice(index, 1);
      }
    }
    console.log(this.selectedLeaveGroups);
  }

  saveLeaveGroup() {
    if (this.selectedLeaveGroups.length != 0) {
      this.modal_dismiss6();
    } else {
      this.alertService.showWarning("At Least Choose One Leave Group");
    }
  }

  selectedHolidayCalender(event, item) {
    console.log(item);

    if (event.target.checked) {
      this.selecteHolidayCalender.push(item);
    } else {
      const index = this.selecteHolidayCalender.indexOf(item);
      if (index > -1) {
        this.selecteHolidayCalender.splice(index, 1);
      }
    }
    console.log(this.selecteHolidayCalender);
  }

  saveHolidayCalender() {
    if (this.selecteHolidayCalender.length != 0) {
      this.modal_dismiss7();
    } else {
      this.alertService.showWarning("At Least Choose One Holiday Calender");
    }
  }

  selectedNoticePeriodDays(event, item) {
    console.log(item);

    if (event.target.checked) {
      this.selectedNoticePeriods.push(item);
    } else {
      const index = this.selectedNoticePeriods.indexOf(item);
      if (index > -1) {
        this.selectedNoticePeriods.splice(index, 1);
      }
    }
    console.log(this.selectedNoticePeriods);
  }

  saveNoticePeriodDays() {
    if (this.selectedNoticePeriods.length != 0) {
      this.modal_dismiss10();
    } else {
      this.alertService.showWarning("At Least Choose One Notice Period");
    }
  }

  selectedPayGroup(event, item) {
    console.log(item);

    if (event.target.checked) {
      this.selectedPayGroups.push(item);
    } else {
      const index = this.selectedPayGroups.indexOf(item);
      if (index > -1) {
        this.selectedPayGroups.splice(index, 1);
      }
    }
    console.log(this.selectedPayGroups);
  }

  savePayGroup() {
    if (this.selectedPayGroups.length != 0) {
      this.modal_dismiss8();
    } else {
      this.alertService.showWarning("At Least Choose One Pay Group");
    }
  }

  saveStatutoryRules() { }

  slider1() {
    this.slider = true;
  }

  close_invoiceSliderVisible() {
    this.slider = false;
  }

  slider3() {
    this.slider2 = true;
  }

  close_invoiceSliderVisible2() {
    this.slider2 = false;
  }

  discardchanges() { }

  uploadDocs() {
    this.visible_documentUpload = true;
  }

  onChangeDocumentName(event) {
    console.log("DOCS :", event);
    this.documentForm.controls["CategoryType"].setValue(
      event.DocumentCategoryId
    );
  }
  onSignedByChange(event) {
    console.log("onSignedByChange :", event);
  }
  onSignUpCenterChange(event) {
    console.log("onSignedByChange :", event);
  }

  /* #region  File upload using object stroage (S3) */
  onFileUpload(e) {
    debugger;
    this.documentForm.get("DocumentId").valid;

    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = Math.round(size / 1024) + " KB";
      console.log(maxSize);
      var FileSize = e.target.files[0].size / 1024 / 1024;
      var maxfilesize = e.target.files[0].size / 1024;
      if (FileSize > 2) {
        this.isLoading = true;
        this.alertService.showWarning(
          "The attachment size exceeds the allowable limit."
        );
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.spinnerText = "Uploading";
        let FileUrl = (reader.result as string).split(",")[1];
        this.doAsyncUpload(FileUrl, file.name);
      };
    }
  }

  doAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this.Id;
      objStorage.ClientContractCode =
        this.BusinessType == 3
          ? ""
          : this.sessionService.getSessionStorage("default_ContractCode") ==
            null
            ? ""
            : this.sessionService
              .getSessionStorage("default_ContractCode")
              .toString();
      objStorage.ClientCode =
        this.BusinessType == 3
          ? ""
          : this.sessionService.getSessionStorage("default_ClientCode") == null
            ? ""
            : this.sessionService
              .getSessionStorage("default_ClientCode")
              .toString();
      objStorage.CompanyCode =
        this.sessionService.getSessionStorage("CompanyCode") == null
          ? ""
          : this.sessionService.getSessionStorage("CompanyCode").toString();
      objStorage.ClientContractId = this.Id;
      objStorage.ClientId = this.ClientId;
      objStorage.CompanyId = this._loginSessionDetails.Company.Id;

      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";
      this.fileuploadService
        .postObjectStorage(JSON.stringify(objStorage))
        .subscribe((res) => {
          let apiResult: apiResult = res;
          try {
            if (apiResult.Status && apiResult.Result != "") {
              this.documentForm.controls["DocumentId"].setValue(
                apiResult.Result
              );
              this.documentForm.controls["FileName"].setValue(filename);

              this.unsavedDocumentLst.push({
                Id: apiResult.Result,
              });

              this.isLoading = true;
              this.alertService.showSuccess(
                "You have successfully uploaded this file"
              );
            } else {
              this.isLoading = true;
              this.alertService.showWarning(
                "An error occurred while  trying to upload! " +
                apiResult.Message
              );
            }
          } catch (error) {
            this.isLoading = true;
            this.alertService.showWarning(
              "An error occurred while  trying to upload! " + error
            );
          }
        }),
        (err) => { };

      console.log(objStorage);
    } catch (error) {
      this.alertService.showWarning(
        "An error occurred while  trying to upload! " + error
      );
      this.isLoading = true;
    }
  }
  /* #endregion */

  /* #region  File delete object stroage (S3) */

  doDeleteFile() {
    this.alertService
      .confirmSwal(
        "Are you sure you want to delete?",
        "Once deleted,  you cannot undo this action.",
        "OK, Delete"
      )
      .then((result) => {
        // if (this.OldDocumentDetails != null) {
        //   let alreadyExists = this.OldDocumentDetails.find(a => a.DocumentId == this.documentForm.get('DocumentId').value) != null ? true : false;
        //   if (alreadyExists) {
        //     this.Lst_deleted_documentId.push({
        //       Id: this.documentForm.get('DocumentId').value
        //     })
        //     this.documentForm.controls['DocumentId'].setValue(null);
        //     this.documentForm.controls['IsDocumentDelete'].setValue(true);
        //     this.documentForm.controls['FileName'].setValue(null);
        //     this.documentFileName = null;
        //   }
        //   else {
        //     this.deleteAsync();
        //   }
        // } else {
        this.deleteAsync();
        // }
      })
      .catch((error) => { });
  }

  deleteAsync() {
    this.isLoading = false;
    this.spinnerText = "Deleting";
    this.fileuploadService
      .deleteObjectStorage(this.documentForm.get("DocumentId").value)
      .subscribe((res) => {
        console.log(res);
        let apiResult: apiResult = res;
        try {
          if (apiResult.Status) {
            //search for the index.
            var index = this.unsavedDocumentLst
              .map(function (el) {
                return el.Id;
              })
              .indexOf(this.documentForm.get("DocumentId").value);

            // Delete  the item by index.
            this.unsavedDocumentLst.splice(index, 1);
            this.documentForm.controls["DocumentId"].setValue(null);
            this.documentForm.controls["FileName"].setValue(null);
            this.documentForm.controls["IsDocumentDelete"].setValue(false);
            this.isLoading = true;
            this.alertService.showSuccess(
              "Awesome!...  Your file is deleted successfully!"
            );
          } else {
            this.isLoading = true;
            this.alertService.showWarning(
              "An error occurred while  trying to delete! " + apiResult.Message
            );
          }
        } catch (error) {
          this.alertService.showWarning(
            "An error occurred while  trying to delete! " + error
          );
        }
      }),
      (err) => { };
  }

  /* #endregion */

  /* #region  Unsaved file delete object storage (S3) */

  unsavedDeleteFile(_DocumentId) {
    this.fileuploadService.deleteObjectStorage(_DocumentId).subscribe((res) => {
      let apiResult: apiResult = res;
      try {
        if (apiResult.Status) {
          //search for the index.
          var index = this.unsavedDocumentLst
            .map(function (el) {
              return el.Id;
            })
            .indexOf(this.documentForm.get("DocumentId").value);

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1);
          this.documentForm.controls["DocumentId"].setValue(null);
          this.documentForm.controls["FileName"].setValue(null);
          this.documentForm.controls["IsDocumentDelete"].setValue(false);
        } else {
        }
      } catch (error) { }
    }),
      (err) => { };
  }

  directDeleteS3Documents(docId) {
    this.fileuploadService.deleteObjectStorage(docId).subscribe((res) => {
      let apiResult: apiResult = res;
      try {
        if (apiResult.Status) {
        } else {
        }
      } catch (error) { }
    }),
      (err) => { };
  }
  /* #endregion */

  close_documentUpload() {
    if (this.unsavedDocumentLst.length > 0) {
      this.unsavedDocumentLst.forEach((element) => {
        try {
          this.unsavedDeleteFile(element.Id);
        } catch (error) { }
        this.visible_documentUpload = false;
      });
    } else {
      this.visible_documentUpload = false;
    }
  }

  saveDocumentDetails() {
    this.submitted = true;
    console.log(this.documentForm.value);

    this.commonService.findInvalidControls(this.documentForm).then((result) => {
      console.log("FORM VALIDATOR RESULT :", result);
    });
    if (this.documentForm.invalid) {
      return;
    }

    var contractDocuments = new ClientContractDocuments();
    contractDocuments.Id = this.documentForm.value.Id;
    contractDocuments.ClientContractId = this.Id;
    contractDocuments.DocumentId = this.documentForm.value.DocumentId;
    contractDocuments.FileName = this.documentForm.value.FileName;
    contractDocuments.DocumentCategory = this.documentForm.value.CategoryType;
    contractDocuments.DocumentType = this.documentForm.value.DocumentType;
    contractDocuments.Status = this.documentForm.value.Status;
    contractDocuments.Remarks = this.documentForm.value.Remarks;
    contractDocuments.SignedOn = this.documentForm.value.SignedOn;
    contractDocuments.SignedBy = this.documentForm.value.SignedBy;
    contractDocuments.SignUpCenter = this.documentForm.value.SignUpCenter;
    contractDocuments.CreatedBy = this.UserId;
    this.LstClientContractDocuments.push(contractDocuments);

    console.log(
      "this.LstClientContractDocuments",
      this.LstClientContractDocuments
    );

    this.visible_documentUpload = false;
    this.documentForm.reset();
    this.documentForm.controls["Id"].setValue(UUID.UUID());
    this.documentForm.controls["Status"].setValue(1);
  }

  GetDocumentTypeName(DocTypeId) {
    return this.DocumentMappingList.length > 0 &&
      this.DocumentMappingList.find((a) => a.DocumentTypeId == DocTypeId) !=
      undefined
      ? this.DocumentMappingList.find((a) => a.DocumentTypeId == DocTypeId)
        .DocumentTypeName
      : "---";
  }

  GetSignUpCenter(item) {
    return this.CompanyBranchList.length > 0 &&
      this.CompanyBranchList.find((a) => a.Id == item.SignUpCenter) != undefined
      ? this.CompanyBranchList.find((a) => a.Id == item.SignUpCenter).BranchName
      : "---";
  }

  GetConsultantName(item, PropName) {
    if (PropName == "CreatedBy") {
      return this.internalAccountManagers &&
        this.internalAccountManagers.length > 0 &&
        this.internalAccountManagers.find((a) => a.Id == item.CreatedBy) !=
        undefined
        ? this.internalAccountManagers.find((a) => a.Id == item.CreatedBy).Name
        : "---";
    } else if (PropName == "SignedBy") {
      let NameConcat = "";

      item.SignedBy &&
        item.SignedBy.length > 0 &&
        item.SignedBy.forEach((e2) => {
          if (
            this.internalAccountManagers &&
            this.internalAccountManagers.length > 0 &&
            this.internalAccountManagers.find((a) => a.Id == e2) != undefined
          ) {
            NameConcat =
              NameConcat +
              this.internalAccountManagers.find((a) => a.Id == e2).Name +
              ", ";
          }
        });
      return NameConcat;
    }
  }

  downloadFile(item) {
    this.loadingScreenService.startLoading();
    this.fileuploadService
      .downloadObjectAsBlob(item.DocumentId)
      .subscribe((res) => {
        if (res == null || res == undefined) {
          this.alertService.showWarning(
            "Sorry, unable to get the document. Please get in touch with the support team"
          );
          return;
        }
        saveAs(res, item.FileName);
        this.loadingScreenService.stopLoading();
      });
  }

  deleteFile(item) {
    this.alertService
      .confirmSwal(
        "Are you sure you want to delete?",
        "Once deleted,  you cannot undo this action.",
        "OK, Delete"
      )
      .then((result) => {
        let index = this.LstClientContractDocuments.findIndex(
          (i) => i.Id === item.Id
        );
        this.LstClientContractDocuments.splice(index, 1);
      })
      .catch((error) => { });
  }

  MarkAsInActive(item, Action) {
    this.alertService
      .confirmSwal(
        `Are you sure you want to ${Action == 0 ? "Inactive?" : "Active?"}`,
        "Once modified,  you cannot undo this action.",
        "Confirm"
      )
      .then((result) => {
        let isExist = this.LstClientContractDocuments.find(
          (a) => a.Id == item.Id
        );
        isExist.Status = Action;
      })
      .catch((error) => { });
  }

  ngOnDestroy() {
    this.sessionService.delSessionStorage("invoice_saleOrder_data");
  }

}
