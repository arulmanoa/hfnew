import { Component, OnInit, EventEmitter, Input, Output, ViewChild, TemplateRef, ElementRef, ChangeDetectionStrategy } from '@angular/core';

import { FormGroup, FormBuilder, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import * as moment from 'moment';
import * as _ from 'lodash';
import { NgxSpinnerService } from "ngx-spinner";

import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';

import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { LoginResponses } from 'src/app/_services/model';
import { EmployeeModel } from 'src/app/_services/model/Employee/EmployeeModel';
import { AlertService, ClientService, EmployeeService, HeaderService, PagelayoutService, SessionStorage } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { ESSService } from 'src/app/_services/service/ess.service';
import { Gender, PaymentType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { AddressDetails, CommunicationCategoryType } from 'src/app/_services/model/Communication/CommunicationType';
import { EmployeeDetails, EmployeeMenuData } from 'src/app/_services/model/Employee/EmployeeDetails';
import { ClientContractList, OnEmploymentInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { ClientLocationList, IndustryList, OfferInfo, PayGroupList, SkillCategoryList, ZoneList } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { ManagerList, LeaveGroupList, CostCodeList } from './../../../../_services/model/OnBoarding/MigrationInfo';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { OnboardingService } from '../../../../_services/service/onboarding.service';
import { apiResult } from '../../../../_services/model/apiResult';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ControlElement } from 'src/app/views/generic-form/form-models';
import { DynamicFieldDetails, DynamicFieldsValue, FieldValues } from 'src/app/_services/model/OnBoarding/DynamicFIeldDetails';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { ClientList } from 'src/app/_services/model/ClientLocationAllList';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { ELCTRANSACTIONTYPE } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { AdditionalPaymentProducts, RateType } from 'src/app/_services/model/Candidates/CandidateRateSet';
import { PaygroupProductOverrides } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SalarybreakupmodalComponent } from '../../shared/salarybreakupmodal/salarybreakupmodal.component';
import { DynamicfieldformComponent } from 'src/app/views/generic-form/dynamicfieldform/dynamicfieldform.component';
@Component({
  selector: 'app-additionaldetails',
  templateUrl: './additionaldetails.component.html',
  styleUrls: ['./additionaldetails.component.css']
})
export class AdditionaldetailsComponent implements OnInit {

  @ViewChild('validateChildComponentForm') private DynamicfieldformComponent: DynamicfieldformComponent;

  @Input() employeedetails: EmployeeDetails;
  @Input() OfficialTabMaster_DynamicFieldDetails: DynamicFieldDetails;
  @Input() OfficialTabMaster_Dynamicfieldvalue: DynamicFieldsValue;
  @Output() additionalDetailsChangeHandler = new EventEmitter();
  @Output()
  toggle = new EventEmitter<Object>();
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
  employeeModel: EmployeeModel = new EmployeeModel();

  // EMPLOYMENT

  isESICapplicable: boolean = false;
  IsESICApplicableForKeyIn: boolean = false;
  ClientLocationList: ClientLocationList[] = [];
  ClientContractList: ClientContractList[] = [];
  ClientList: any[] = [];
  TeamList: any;
  EmploymentTypeList: any[] = [];

  ManagerList: ManagerList[] = [];
  LeaveGroupList: LeaveGroupList[] = [];
  CostCodeList: CostCodeList[] = [];
  NoticePeriodDaysList = [];
  MigrationInfoGrp: MigrationInfo;
  PayCycleDetails: any;
  StateList2: any[] = [];
  CountryList: any[] = [];

  Current_RateSetList: any = [];
  EffectiveDate_POP: Date = new Date();
  AnnualSalary_POP: number = 0;
  MenuId: any;

  DynamicFieldDetails: DynamicFieldDetails = null;
  Dynamicfieldvalue: DynamicFieldsValue = null;

  ngselectLoader: boolean = false;

  //PREVIEW CTC 

  isRecalculate: boolean = true;
  IsRateSetValue: boolean = false;
  isMinimumwageAdhered: boolean = false;
  isDailyOrHourlyWages: boolean = false;


  additionalApplicableProducts: AdditionalPaymentProducts = null;
  baseDaysForAddlApplicableProduct: number = 0;
  baseHoursForAddlApplicableProduct: number = 1;
  showDailyOrHourlyWageTable: boolean = false;
  wageType: string = '';
  isOverrideMonthlyValue: boolean = false;
  minimumWagesApplicableProductsList = [];
  Label_PFLogic: string = '';
  lstOfPaygroupOverrideProducts = [];
  reviewCancelled: boolean = false;

  SalaryBreakupType: any = [];
  PayGroupList: PayGroupList[] = [];
  IndustryList: IndustryList[] = [];
  SkillCategoryList: any[] = [];
  // {
  //   "Id": 177,
  //   "Code": "Unskilled Messenger",
  //   "Name": "Unskilled Messenger"
  // },
  // {
  //   "Id": 195,
  //   "Code": "Semi-skilled Bill Collector",
  //   "Name": "Semi-skilled Bill Collector"
  // },
  // {
  //   "Id": 214,
  //   "Code": "Semi-skilled Painter",
  //   "Name": "Semi-skilled Painter"
  // }];
  ZoneList: ZoneList[] = [];
  EffectivePayPeriodList: any = [];

  IndustryId: number | string = 0;
  StateId: number | string = 0;
  CityId: number | string = 0;

  OfferSkillZoneInfo: OfferInfo;


  // DEFAULT ITEMS 
  contractObject: any = null;
  locationObject: any = null;
  teamObject: any = null;

  ActualDOJminDate: Date;
  ActualDOJmaxDate: Date;
  wageTypeString: string = 'Daily';

  payCyleId: number = 0;
  IsReportingManagerRequired: boolean = false;
  modalOption: NgbModalOptions = {};

  IsDFDLoaded: boolean = false;
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
    public onboardingService: OnboardingService,
    private Customloadingspinner: NgxSpinnerService,
    private pageLayoutService: PagelayoutService,
    private UIBuilderService: UIBuilderService,
    private clientService: ClientService,
    private modalService: NgbModal,

  ) { }

  ngOnInit() {
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
    this.isESSLogin = false;
    console.log('employeedetails', this.employeedetails);

    this.EmployeeId = this.employeedetails != null && this.employeedetails.Id > 0 ? this.employeedetails.Id : 0;

    // if (this.employeedetails.Id == 0) {
      console.log('this.DynamicFieldDetails', this.OfficialTabMaster_DynamicFieldDetails);

      this.DynamicFieldDetails = this.OfficialTabMaster_DynamicFieldDetails;
      this.Dynamicfieldvalue = this.OfficialTabMaster_Dynamicfieldvalue;

      if (this.OfficialTabMaster_DynamicFieldDetails != null && !_.isEmpty(this.DynamicFieldDetails)) {
        this.isEmptyObject(this.OfficialTabMaster_DynamicFieldDetails);
        this.DynamicFieldDetails = this.OfficialTabMaster_DynamicFieldDetails;
      }

    // }else {

    // }

    if (this.employeedetails.Id == 0 && (this.DynamicFieldDetails == null || _.isEmpty(this.DynamicFieldDetails))) {
      this.getDynamicFieldDetailsConfig(this.CompanyId, (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientId : this.employeedetails.EmploymentContracts[0].ClientId), (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientContractId : this.employeedetails.EmploymentContracts[0].ClientContractId)).then(() => console.log("Task Complete!"));
    } else if (this.DynamicFieldDetails == null || _.isEmpty(this.DynamicFieldDetails)) {
      this.getDynamicFieldDetailsConfig(this.CompanyId, (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientId : this.employeedetails.EmploymentContracts[0].ClientId), (this.employeedetails.Id == 0 ? this.employeedetails.EmploymentContracts[0].ClientContractId : this.employeedetails.EmploymentContracts[0].ClientContractId)).then(() => console.log("Task Complete!"));
    }

    this.employeeService.getActiveTab(false);

    this.spinner = false;
  }


  getDynamicFieldDetailsConfig(_companyId, _clientId, _clientContractId) {
    this.IsDFDLoaded = false;
    var promise = new Promise((resolve, reject) => {
      this.spinner = true;
      this.onboardingService.getDynamicFieldDetails(_companyId, _clientId, _clientContractId, null)
        .subscribe((response) => {
          console.log('DFD RES ::', response);
          this.IsDFDLoaded = true;
          console.log('IsDFDLoaded', this.IsDFDLoaded);

          let apiresult: apiResult = response;
          try {


            if (apiresult.Status && apiresult.Result != null) {
              this.DynamicFieldDetails = apiresult.Result as any;
              var filteredItems = [];
              filteredItems = this.DynamicFieldDetails.ControlElemetsList.filter(z => z.ExtraProperities.ViewableRoleCodes.includes(this.RoleCode) == true);
              this.DynamicFieldDetails.ControlElemetsList = filteredItems;
              this.DynamicFieldDetails.ControlElemetsList.forEach(ele => {
                ele.LoadDataOnPageLoad == true ? this.getDropDownList(ele) : true;
              });
              console.log('DFD ::', filteredItems);

              if (filteredItems.length > 0 && this.Dynamicfieldvalue != null && this.Dynamicfieldvalue.FieldValues != null && this.Dynamicfieldvalue.FieldValues.length > 0) {
                this.Dynamicfieldvalue.FieldValues.forEach(ee => {
                  var isexsit = this.DynamicFieldDetails.ControlElemetsList.find(a => a.FieldName == ee.FieldName)
                  isexsit != null && isexsit != undefined && (isexsit.Value = ee.Value != null ? isexsit.InputControlType == 3 ? (ee.Value) as any : ee.Value : null);
                });
                console.log('UPD DFD VAL :', this.Dynamicfieldvalue);
              }


              this.Dynamicfieldvalue == null && this.EmployeeId != 0 && this.onboardingService.GetDynamicFieldsValue(this.EmployeeId, 6)
                .subscribe((getValue) => {
                  console.log('DFD VALUES ::', getValue);
                  let apires: apiResult = getValue;
                  if (apires.Status && apires.Result != null) {
                    this.Dynamicfieldvalue = apires.Result as any;
                    if (filteredItems.length > 0 && this.Dynamicfieldvalue != null && this.Dynamicfieldvalue.FieldValues != null && this.Dynamicfieldvalue.FieldValues.length > 0) {
                      this.Dynamicfieldvalue.FieldValues.forEach(ee => {
                        var isexsit = this.DynamicFieldDetails.ControlElemetsList.find(a => a.FieldName == ee.FieldName)
                        isexsit != null && isexsit != undefined && (isexsit.Value = ee.Value != null ? isexsit.InputControlType == 3 ? (ee.Value) as any : ee.Value : null);
                      });
                      console.log('UPD DFD VAL :', this.Dynamicfieldvalue);
                    }
                    this.spinner = false;

                  } else {
                    this.spinner = false;
                  }
                })
              this.spinner = false;
            }
            else {
              this.spinner = false;
            }
          } catch (error) {
            console.log(
              "DFD EXC ::", error
            );

          }

        }, error => {
          this.spinner = false;
        })
    });
    return promise;
  }

  isDynamicAccordionAvailable(AccordionName) {

    return this.DynamicFieldDetails.ControlElemetsList.find(item => item.TabName == AccordionName) != undefined ? true : false;
  }

  isEmptyObject(obj) {

    return (obj && (Object.keys(obj).length === 0));
  }

  getDynamicAccordionFields(AccordionName) {
    return this.DynamicFieldDetails.ControlElemetsList;

  }


  getDropDownList(controlElement: ControlElement) {
    controlElement.DropDownList = null;
    let parentElementList: any[] = null;
    this.pageLayoutService.getDataset(controlElement.DataSource, parentElementList).subscribe(dropDownList => {
      if (dropDownList.Status == true && dropDownList.dynamicObject !== null && dropDownList.dynamicObject !== '')
        controlElement.DropDownList = JSON.parse(dropDownList.dynamicObject);
      controlElement.DropDownList = _.orderBy(controlElement.DropDownList, [controlElement.DisplayField], ["asc"]);
      if (controlElement.DropDownList == null || controlElement.DropDownList.length <= 0) {
        controlElement.DropDownList = [];
      }
    }, error => {
      console.log(error);
      controlElement.DropDownList = [];
    })
  }
  EmitHandler() {
    console.log('ssss', this.DynamicFieldDetails);

    var obj = { Dynamicfieldvalue: this.Dynamicfieldvalue, DynamicFieldDetails: this.DynamicFieldDetails, employeedetails: this.employeedetails, OfferSkillZoneInfo: this.OfferSkillZoneInfo, MigrationInfoGrp: this.MigrationInfoGrp };
    this.additionalDetailsChangeHandler.emit(obj);

  }

  subscribeEmitter() {

    console.log('ssss', this.DynamicFieldDetails);
    // this.EmitHandler();
    var obj = { Dynamicfieldvalue: this.Dynamicfieldvalue, DynamicFieldDetails: this.DynamicFieldDetails };
    this.additionalDetailsChangeHandler.emit(obj);

  }



  ngOnDestroy() {
    this.subscribeEmitter();

  }

}
