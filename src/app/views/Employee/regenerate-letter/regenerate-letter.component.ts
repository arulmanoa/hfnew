import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UUID } from 'angular2-uuid';
import * as _ from 'lodash';
import Swal from "sweetalert2";
import { DatePipe, CurrencyPipe } from '@angular/common';
import { SalaryBreakUpType } from 'src/app/_services/model/PayGroup/PayGroup';
import { CountryList, StateList, CityList, ClientLocationModel } from 'src/app/_services/model/ClientLocationAllList';
import { find, get, pull } from 'lodash';
import * as moment from 'moment';

import { AlertService } from '../../../_services/service/alert.service';
import { ClientLocationService } from 'src/app/_services/service/clientlocation.service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { OnboardingService } from 'src/app/_services/service/onboarding.service';
import { apiResponse } from 'src/app/_services/model/apiResponse';
import { CandidateModel } from 'src/app/_services/model/Candidates/CandidateModel';
import { CandidateDetails, ApprovalFor, Approvals, ApproverType } from 'src/app/_services/model/Candidates/CandidateDetails';
import { apiResult } from 'src/app/_services/model/apiResult';
import { LetterTemplateList, IndustryList, ZoneList, SkillCategoryList, PayGroupList, ClientLocationList, OfferInfo } from 'src/app/_services/model/OnBoarding/OfferInfo';
import { MigrationInfo } from 'src/app/_services/model/OnBoarding/MigrationInfo';
import { ObjectStorageDetails } from 'src/app/_services/model/Candidates/ObjectStorageDetails';
import { FileUploadService } from 'src/app/_services/service/fileUpload.service';
import { UIMode } from 'src/app/_services/model/UIMode';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { EmployeeService } from 'src/app/_services/service/employee.service';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { LoginResponses, ProfileAccessControl, AccessControlType, AccessControl } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service/session-storage.service'; // session storage
import { SessionKeys } from '../../../_services/configs/app.config'; // app config 
import { HeaderService } from '../../../_services/service/header.service';
import { environment } from "../../../../environments/environment";
import { Location, PlatformLocation } from '@angular/common';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { PreviewCtcModalComponent } from 'src/app/shared/modals/preview-ctc-modal/preview-ctc-modal.component';
import { SourceType, TenureType, CandidateOfferDetails, RequestType, OnBoardingType, IsClientApprovedBasedOn, OfferStatus } from 'src/app/_services/model/Candidates/CandidateOfferDetails';
import { OnBoardingInfo } from 'src/app/_services/model/OnBoarding/OnBoardingInfo';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-regenerate-letter',
  templateUrl: './regenerate-letter.component.html',
  styleUrls: ['./regenerate-letter.component.scss']
})
export class RegenerateLetterComponent implements OnInit {


  UserId: any;
  CandidateId: any;
  CompanyId: any;
  IndustryId: any;
  StateId: any;
  CityId: any;
  UserName: any;
  ClientContractId: any;
  _loginSessionDetails: LoginResponses;
  RoleId: any;
  candidateModel: CandidateModel = new CandidateModel();
  _NewCandidateDetails: CandidateDetails = new CandidateDetails();
  _OldCandidateDetails: CandidateDetails = new CandidateDetails();
  salaryType: any = [];
  LetterTemplateList: LetterTemplateList[] = [];
  LetterTemplateListAL: LetterTemplateList[] = [];
  OfferInfoListGrp1: OfferInfo;
  IndustryList: IndustryList[] = [];
  PayGroupList: PayGroupList[] = [];
  OfferInfoListGrp: OfferInfo;
  offerdetaisllist: OfferInfo;
  //ClientLocationList:ClientLocationList[] = [];
  SkillCategoryList: SkillCategoryList[] = [];
  ZoneList: ZoneList[] = [];
  MigrationInfoGrp: MigrationInfo;
  TeamList: any;
  isRateSetValid: boolean = false;
  IsMinimumwageAdhere: boolean = true;
  _LstRateSet: any[] = [];
  SalaryFormat: any;
  MonthlySalaryFormat: any;
  salaryInwords: any;
  ClientLocationList: ClientLocationModel[] = [];

  DOB: any;
  DOBmaxDate: Date;
  ActualDOJmaxDate: Date;
  ActualDOJminDate: Date;
  TenureminDate: Date;
  Remarks: any;
  isLoading: boolean = true;
  spinnerText: string = "Uploading";
  DocumentId: any;
  FileName: any;
  unsavedDocumentLst = [];
  ADOJ: Date;
  modalOption: NgbModalOptions = {};

  isrendering_spinner: boolean = false;
  disableBtn: boolean = false;
  isESICapplicable: boolean = false;
  previewCTC_OfferDetails: CandidateOfferDetails = new CandidateOfferDetails();

  OnBoardingInfoListGrp: OnBoardingInfo;
  ClientList = [];
  ClientName: any;

  // only for CC email address book input ccmailtags
  @ViewChild('tagInput') tagInputRef: ElementRef;
  ccmailtags: string[] = [];
  CCemailMismatch: boolean = false;
  ccemail: any;
  BusinessType: any;
  ClientId: any = 0;

  NoticePeriodDaysList: any[] = [];
  InsuranceList: any[] = [];
  EffectivePayPeriodList: any[] = [];

  payperiodEndDate: Date;
  private subscriptions = new Subscription();

  DesignationList: any[] = [];
  constructor(

    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private alertService: AlertService,
    public locationService: ClientLocationService,
    private loadingScreenService: LoadingScreenService,
    private onboardingService: OnboardingService,
    public fileuploadService: FileUploadService,
    public datePipe: DatePipe,
    public employeeService: EmployeeService,
    private route: ActivatedRoute,
    public sessionService: SessionStorage,
    private headerService: HeaderService,
    private _location: Location,
    private utilsHelper: enumHelper,
    public modalService: NgbModal,


  ) {


  }

  ngOnInit() {

    this.headerService.setTitle('Employee Non-Payroll');
    this.isrendering_spinner = true;
    this.disableBtn = true;
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this.sessionService.getSessionStorage("RoleId"); // bind Logged user id may be change baed on dashboard 
    if (this.RoleId === undefined || this.RoleId === null || this.RoleId == 0) {
      this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    }
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this.sessionService.getSessionStorage("RoleId"); // bind Logged user id may be change baed on dashboard 
    if (this.RoleId === undefined || this.RoleId === null || this.RoleId == 0) {
      this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    }

    this.CompanyId = this._loginSessionDetails.Company.Id;
    this.salaryType = this.utilsHelper.transform(SalaryBreakUpType);
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;

    this.route.queryParams.subscribe(params => {

      if (JSON.stringify(params) != JSON.stringify({})) {

        var encodedIdx = atob(params["Idx"]);
        this.CandidateId = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);

      }
    });
    this.Get_CandidateRecord();



  }

  Get_CandidateRecord() {

    let req_param_uri = `Id=${this.CandidateId}&userId=${this.UserId}&UserName=${this.UserName}`;
    this.onboardingService.getCandidate(req_param_uri).subscribe((data: any) => {

      let apiResponse: apiResponse = data;
      if (apiResponse.Status) {
        this.candidateModel = (apiResponse.dynamicObject);
        this.candidateModel.NewCandidateDetails.LstCandidateOfferDetails = this.candidateModel.NewCandidateDetails.LstCandidateOfferDetails.filter(a => a.Status == 1);
        this.candidateModel.OldCandidateDetails.LstCandidateOfferDetails = this.candidateModel.OldCandidateDetails.LstCandidateOfferDetails.filter(a => a.Status == 1);

        this._NewCandidateDetails = this.candidateModel.NewCandidateDetails;
        this._OldCandidateDetails = this.candidateModel.OldCandidateDetails;

        this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null;
        this.ADOJ = new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining);
        this.isESICapplicable = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;
        this.ClientContractId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId
        this.ClientId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId;
        var temp = new Array();
        temp = this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != "" && this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC != undefined ? this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC.split(",") : [];
        this.ccmailtags = temp;

        this.doletterTemplate(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId, this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId)
        this.getTeamList(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId);
        this.GetOnboardingInfoForRegenerateAL();
        this.getClientLocation(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId);
        this.onChangeOfferLocation(null);
        this.onClientList(this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId);
        console.log('Response', this._NewCandidateDetails);





        this.isrendering_spinner = false;
        this.disableBtn = false;

        // this.datepickerValidation();
      }
      else {
        this.isrendering_spinner = false;
        this.disableBtn = false;
        this.alertService.showWarning(`Something is wrong!  ${apiResponse.Message}`);
      }
    },
      (err) => {
        this.isrendering_spinner = false;
        this.disableBtn = false;
        this.alertService.showWarning(`Something is wrong!  ${err}`);
      });
  }

  GetOnboardingInfoForRegenerateAL() {

    this.onboardingService.GetOnboardingInfoForRegenerateAL().subscribe(authorized => {
      const apiResult: apiResult = authorized;

      this.offerdetaisllist = JSON.parse(apiResult.Result);

      console.log('GetOnboardingInfoForRegenerateAL :', this.offerdetaisllist);
      // if (this.offerdetaisllist.PayGroupList && this.offerdetaisllist.PayGroupList.length) {
      //   let paygroupList = _.uniqBy(this.offerdetaisllist.PayGroupList, "PayGroupId");
      //   this.offerdetaisllist.PayGroupList =paygroupList;
      // }
      console.log('offerdetaisllist', this.offerdetaisllist);
      console.log('offerdetaisllist', this.OfferInfoListGrp)
      console.log('offerInfolist', this.offerdetaisllist);

      if (apiResult.Status) {
        this.PayGroupList = this.offerdetaisllist.PayGroupList;
        this.IndustryList = this.offerdetaisllist.IndustryList;

        if (this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId != null) {
          this.PayGroupList = this.offerdetaisllist.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
          this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType);
        }


      }



      // if (apiResult.Status && apiResult.Result != "") {       -- paystrcutre data are not appearing completely   
      //  this.PayGroupList = this.OfferInfoListGrp.PayGroupList;
      //  this.IndustryList=this.OfferInfoListGrp.IndustryList;
      //  }

    }, (error) => {
    });
  }


  onClientList(ClientId: any) {

    this.onboardingService.getOnboardingInfo("isOnboardingInfo", this.UserId, (this.BusinessType == 1 || this.BusinessType == 2) ? this.ClientId : 0)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;

        if (apiResult.Status && apiResult.Result != "") {

          this.OnBoardingInfoListGrp = JSON.parse(apiResult.Result);
          this.ClientList = _.orderBy(this.OnBoardingInfoListGrp.ClientList, ["Name"], ["asc"]);
          this.ClientName = this.ClientList.find(a => a.Id == ClientId).Name;
        }

      });

  }
  datepickerValidation() {

    this.DOBmaxDate = new Date();

    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);


    this.ActualDOJminDate = new Date();
    this.ActualDOJmaxDate = new Date();

    this.TenureminDate = new Date();

    this.ActualDOJminDate.setDate(this.ActualDOJminDate.getDate() - (!this.isESICapplicable ? environment.environment.ActualDOJminDate : environment.environment.MinExtendedDOJDays));
    this.ActualDOJminDate.setMonth(this.ActualDOJminDate.getMonth());
    this.ActualDOJminDate.setFullYear(this.ActualDOJminDate.getFullYear());


    this.ActualDOJmaxDate.setDate(this.ActualDOJmaxDate.getDate() + environment.environment.ActualDOJmaxDate);
    this.ActualDOJmaxDate.setMonth(this.ActualDOJmaxDate.getMonth());
    this.ActualDOJmaxDate.setFullYear(this.ActualDOJmaxDate.getFullYear());

    this.TenureminDate.setDate(this.ADOJ.getDate() + 1);
    this.TenureminDate.setMonth(this.ADOJ.getMonth());
    this.TenureminDate.setFullYear(this.ADOJ.getFullYear());

  }

  async GettingExistingCandidateHistory() {
    this.DOBmaxDate = new Date();
    this.DOBmaxDate.setFullYear(this.DOBmaxDate.getFullYear() - 18);
    this.TenureminDate = new Date();
    try {
      this.subscriptions = await this.onboardingService.GetCandidateNewDOJRequestHistorybyCandidateId(this.CandidateId).subscribe((data) => {
        const apiR: apiResult = data
        if (apiR.Status && apiR.Result) {
          console.log('HISTORY RESULT ::', apiR.Result);
          const apiResult: any = JSON.parse(apiR.Result);
          this.payperiodEndDate = apiResult.LstPayperiod.EndDate;
          console.log('this._NewCandidateDetails', this._NewCandidateDetails);

          if (apiResult.LstPayperiod.Id != this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId) {
            // alert('ssdfsdfds')
            this.payperiodEndDate = this.EffectivePayPeriodList.find(a => a.Id == this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId) != undefined ?
              this.EffectivePayPeriodList.find(a => a.Id == this._NewCandidateDetails.LstCandidateOfferDetails[0].EffectivePayPeriodId).EndDate : apiResult.LstPayperiod.EndDate;
          }

          if (this.payperiodEndDate) {
            const new_date = moment().add(environment.environment.ActualDOJmaxDate, 'days').format("YYYY-MM-DD"); // 3 days
            this.ActualDOJmaxDate = new Date(new_date.toString());
            if (moment(new_date).format('YYYY-MM-DD') >= moment(this.payperiodEndDate).format('YYYY-MM-DD')) {
              this.ActualDOJmaxDate = new Date(this.payperiodEndDate);
            }
            console.log('DOJMaxDate', this.ActualDOJmaxDate);

            var new_mindate = moment(this.payperiodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days').format("YYYY-MM-DD"); // 45 days
            if (this.isESICapplicable) {
              new_mindate = moment(this.payperiodEndDate).subtract(environment.environment.MinExtendedDOJDays, 'days').format("YYYY-MM-DD"); // 7 days
            }
            this.ActualDOJminDate = new Date(new_mindate.toString());
            console.log('DOJMinDate', this.ActualDOJminDate);
          } else {
            this.datepickerValidation();
          }
        } else {
          this.datepickerValidation();
        }


        this.TenureminDate.setDate(this.ADOJ.getDate() + 1);
        this.TenureminDate.setMonth(this.ADOJ.getMonth());
        this.TenureminDate.setFullYear(this.ADOJ.getFullYear());

      }, err => {

      });
    } catch (err) {
      console.error(err);
    }
  }

  doletterTemplate(ClientId, ClientContractId) {

    this.onboardingService.getLetterTemplate(this.CompanyId, ClientId, ClientContractId)
      .subscribe(authorized => {
        const apiResult: apiResult = authorized;
        if (apiResult.Status && apiResult.Result != "") {
          this.LetterTemplateList = JSON.parse(apiResult.Result);
          this.LetterTemplateListAL = this.LetterTemplateList.filter(a => a.RequestType == ApprovalFor.AL);
        }
      }), ((err) => {

      })
  }

  getTeamList(ClientContractId) {

    this.onboardingService.getMigrationMasterInfo(ClientContractId).subscribe((result) => {

      let apiResult: apiResult = (result);
      console.log(apiResult);

      if (apiResult.Status && apiResult.Result != null) {
        this.MigrationInfoGrp = JSON.parse(apiResult.Result);
        this.TeamList = this.MigrationInfoGrp;

        this.NoticePeriodDaysList = _.filter(this.MigrationInfoGrp[0].NoticePeriodDaysList, (v) => _.includes(this.MigrationInfoGrp[0].ClientContractOperationList[0].ApplicableNoticePeriodDays, v.Id))
        this.NoticePeriodDaysList.forEach(element => {
          element.Description = Number(element.Description);
        });
        this.InsuranceList = this.MigrationInfoGrp[0].InsuranceList;
        this.DesignationList = this.MigrationInfoGrp[0].LstEmployeeDesignation;;
        this.EffectivePayPeriodList = this.MigrationInfoGrp[0].PayPeriodList;

        if (this._NewCandidateDetails.LstCandidateOfferDetails[0].hasOwnProperty('IsRevisedDOJ') && this._NewCandidateDetails.LstCandidateOfferDetails[0].hasOwnProperty('ProposedDOJ') && this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRevisedDOJ && this._NewCandidateDetails.LstCandidateOfferDetails[0].ProposedDOJ && moment(this._NewCandidateDetails.LstCandidateOfferDetails[0].ProposedDOJ).format('YYYY-MM-DD') != moment(new Date("1900-01-01")).format('YYYY-MM-DD')) {
          this.GettingExistingCandidateHistory();
        }
        else {
          this.GettingExistingCandidateHistory();
        }
        console.log(this.TeamList);

      }

    }), ((error) => {

    })
  }


  onChangeEffectivePP(event) {
    console.log('event', event);


    let isESICApplicable = this.isESICapplicable;
    let currentDate = moment();
    let startDate_nonEsic = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
    let endDate = moment(event.EndDate);
    let startDate_Esic = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

    var Non_EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days
    var EsicDate_backward = moment().subtract(environment.environment.MinExtendedDOJDays, 'days'); // 7 days

    var EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days
    var Non_EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 or 45 days

    if (moment(Non_EsicDate_forward).format('YYYY-MM-DD') >= moment(event.EndDate).format('YYYY-MM-DD')) {
      Non_EsicDate_forward = moment(event.EndDate);
    }
    if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(event.EndDate).format('YYYY-MM-DD')) {
      EsicDate_forward = moment(event.EndDate);
    }

    if (moment(Non_EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_nonEsic).format('YYYY-MM-DD')) {
      Non_EsicDate_backward = moment(startDate_nonEsic);
    }
    if (moment(EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_Esic).format('YYYY-MM-DD')) {
      EsicDate_backward = moment(startDate_Esic);
    }

    // if (moment(Non_EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_nonEsic).format('YYYY-MM-DD')) {
    //   Non_EsicDate_backward = moment(startDate_nonEsic);
    // }
    // if (moment(EsicDate_backward).format('YYYY-MM-DD') <= moment(startDate_Esic).format('YYYY-MM-DD')) {
    //   EsicDate_backward = moment(startDate_Esic);
    // }


    // var EsicDate_forward = moment().add(environment.environment.MaximumExtendedDOJDays, 'days'); // 3 days
    // var EsicDate_backward = moment();
    // EsicDate_backward = moment(event.EndDate).subtract(environment.environment.MinExtendedDOJDays, 'days'); // 45 days

    // if (this.isESICapplicable) {
    //   EsicDate_backward = moment(event.EndDate).subtract(environment.environment.ActualDOJminDate_withESIC, 'days'); // 7 days
    // }

    // if (moment(EsicDate_forward).format('YYYY-MM-DD') >= moment(event.EndDate).format('YYYY-MM-DD')) {
    //   EsicDate_forward = moment(event.EndDate);
    // }

    if (this.isESICapplicable) {
      this.ActualDOJminDate = new Date(moment(EsicDate_backward).format('YYYY-MM-DD'));
      this.ActualDOJmaxDate = new Date(moment(EsicDate_forward).format('YYYY-MM-DD'));
    } else {
      this.ActualDOJminDate = new Date(moment(Non_EsicDate_backward).format('YYYY-MM-DD'));
      this.ActualDOJmaxDate = new Date(moment(Non_EsicDate_forward).format('YYYY-MM-DD'));
    }
    
    this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining = null;


  }


  getClientLocation(ClientId) {
    this.onboardingService.getClientLocationByClientId(ClientId).subscribe((res) => {

      this.ClientLocationList = res.dynamicObject;
      console.log('loccc', this.ClientLocationList)
      this.ClientLocationList = _.orderBy(this.ClientLocationList, ["LocationName"], ["asc"]);

    });
    ((err) => {

    });
  }

  onChangeInsurancePlan(item) {
    console.log('item', item);

    this._NewCandidateDetails.LstCandidateOfferDetails[0].OnCostInsurance = item.InsuranceAmount;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].FixedInsuranceDeduction = item.InsuranceDeductionAmount;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount = item.GPA;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount = item.GMC

  }

  onChangeOfferLocation(event: ClientLocationModel) {
    console.log('eventdet', event)
    if (event != null) {
      this.StateId = event.ClientLocationAddressdetails.StateId;
      this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory = null;
      this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone = null;
      this.CityId = event.ClientLocationAddressdetails.CityId;

    }
    else {
      this.StateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].State;
      this.CityId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CityId;
    }
    this.IndustryId = this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId;

    if (this.IndustryId && this.StateId) {
      this.onboardingService.getSkillaAndZoneByStateAndIndustry(this.IndustryId, this.StateId)
        .subscribe(response => {
          const apiResult: apiResult = response;
          if (apiResult.Status && apiResult.Result != "") {
            this.OfferInfoListGrp1 = JSON.parse(apiResult.Result);
            console.log('offerlist11111', this.OfferInfoListGrp1);
            this.SkillCategoryList = this.OfferInfoListGrp1.SkillCategoryList;
            this.ZoneList = this.OfferInfoListGrp1.ZoneList;
          }
        },
          ((err) => {

          }));
    }

    event != null ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].Location), 'location') : null;


  }

  onChangePayGroup(event) {
    event != null ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId), 'paystructure') : null;

  }

  onChangeSalary(event) {
    if (event != undefined) {

      console.log('pay ::', event);

      this.PayGroupList = [];
      //this.candidatesForm.controls['paystructure'].setValue(null);
      if (this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length > 0) {
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId = null;
      }

      this.PayGroupList = this.offerdetaisllist.PayGroupList.filter(z => z.ClientContractId == this.ClientContractId);
      this.PayGroupList = _.filter(this.PayGroupList, (item) => item.SalaryBreakupType == event.id);
      event != null ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType), 'salaryType') : null;

    }
  }

  public a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
  public b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
  inWords(num) {
    // if ((num = num).length > 9) return 'overflow';
    let n: any = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (this.a[Number(n[1])] || this.b[n[1][0]] + ' ' + this.a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (this.a[Number(n[2])] || this.b[n[2][0]] + ' ' + this.a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (this.a[Number(n[3])] || this.b[n[3][0]] + ' ' + this.a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (this.a[Number(n[4])] || this.b[n[4][0]] + ' ' + this.a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (this.a[Number(n[5])] || this.b[n[5][0]] + ' ' + this.a[n[5][1]]) + 'only ' : '';
    return str;
  }


  onChangeAnnaulSalary(event) {
    console.log('eventsalary', event)
    this.salaryInwords = this.inWords(this.SalaryFormat);
    this.SalaryFormat = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary = (Math.floor(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary / 12))
    event != null ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary), 'annualSalary') : null;

  }

  onChangeMonthlySalary(event) {

    this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary = (Math.floor(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary * 12))
    event != null ? this.onFocus_OfferAccordion((this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary), 'MonthlySalary') : null;

  }

  onFocus_OfferAccordion(newValue, Formindex) {


    return new Promise((resolve, reject) => {

      if (this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet.length != 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
        this._LstRateSet = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      }


      if (this._LstRateSet != null && this._LstRateSet.length > 0) {

        const swalWithBootstrapButtons = Swal.mixin({
          customClass: {
            confirmButton: 'btn btn-primary',
            cancelButton: 'btn btn-danger'
          },
          buttonsStyling: true,
        })

        swalWithBootstrapButtons.fire({
          title: 'Confirmation!',
          text: "The change you made as an impact on the salary calculation hence please re-calculate the salary by clicking  'View Salary Breakup' button ",
          type: 'warning',
          showCancelButton: false,
          confirmButtonText: 'Ok!',
          cancelButtonText: 'No, cancel!',
          allowOutsideClick: false,
          reverseButtons: true
        }).then((result) => {

          this._LstRateSet = null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = null;
          this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = [];

        })


      }

    });




  }



  updateDate_DOB(e) {
    this._NewCandidateDetails.DateOfBirth = this.datePipe.transform(e, "yyyy-MM-dd");
  }
  updateDate_Enddate(e) {
    this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate = this.datePipe.transform(e, "yyyy-MM-dd");
  }
  updateDate_DOJ(e) {
    this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining = this.datePipe.transform(e, "yyyy-MM-dd");

  }


  onChangeDOB(dobDate) {

    this.DOB = dobDate;

  }

  onChangeTeam(event: any) {

  }

  onChangeDesignation(event){
    this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation = event.Name;
  }

  /* #region  File upload using object stroage (S3) */

  onFileUpload(e) {


    this.isLoading = false;
    if (e.target.files && e.target.files[0]) {

      const file = e.target.files[0];
      const pattern = /image-*/;
      var type = e.target.files[0].type;
      var size = e.target.files[0].size;
      var maxSize = (Math.round(size / 1024) + " KB");
      console.log(maxSize);
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
        this.doAsyncUpload(FileUrl, this.FileName)

      };
    }
  }

  doAsyncUpload(filebytes, filename) {
    try {
      let objStorage = new ObjectStorageDetails();
      objStorage.Id = 0;
      objStorage.CandidateId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId;
      objStorage.ClientContractCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ContractCode") == null ? "" : this.sessionService.getSessionStorage("default_ContractCode").toString();
      objStorage.ClientCode = this.BusinessType == 3 ? "" : this.sessionService.getSessionStorage("default_ClientCode") == null ? "" : this.sessionService.getSessionStorage("default_ClientCode").toString();
      objStorage.CompanyCode = this.sessionService.getSessionStorage("CompanyCode") == null ? "" : this.sessionService.getSessionStorage("CompanyCode").toString();

      objStorage.ClientContractId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientContractId;
      objStorage.ClientId = this._NewCandidateDetails.LstCandidateOfferDetails[0].ClientId;
      objStorage.CompanyId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CompanyId;
      objStorage.Status = true;
      objStorage.Content = filebytes;
      objStorage.SizeInKB = 12;
      objStorage.ObjectName = filename;
      objStorage.OriginalObjectName = filename;
      objStorage.Type = 0;
      objStorage.ObjectCategoryName = "Proofs";

      this.fileuploadService.postObjectStorage(JSON.stringify(objStorage)).subscribe((res) => {
        let apiResult: apiResult = (res);
        try {
          if (apiResult.Status && apiResult.Result != "") {

            this.DocumentId = apiResult.Result;

            this.unsavedDocumentLst.push({
              Id: apiResult.Result
            })
            this.isLoading = true;
            this.alertService.showSuccess("You have successfully uploaded this file")

          }
          else {
            this.FileName = null;
            this.DocumentId = null;
            this.isLoading = true;
            this.alertService.showWarning("An error occurred while  trying to upload! " + apiResult.Message)
          }
        } catch (error) {
          this.FileName = null;
          this.DocumentId = null;
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while  trying to upload! " + error)
        }

      }), ((err) => {

      })

      console.log(objStorage);
    } catch (error) {
      this.FileName = null;
      this.DocumentId = null;
      this.alertService.showWarning("An error occurred while  trying to upload! " + error)
      this.isLoading = true;
    }

  }
  /* #endregion */

  /* #region  File delete object stroage (S3) */

  doDeleteFile() {

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
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        // if (this.isGuid(this.popupId)) {

        //   this.deleteAsync();
        // }
        // else if (this.firstTimeDocumentId != this.approvalForm.get('ObjectStorageId').value) {


        this.deleteAsync();

        // }

        // else {


        //   this.FileName = null;
        //   this.approvalForm.controls['IsDocumentDelete'].setValue(true);
        //   this.approvalForm.controls['DocumentName'].setValue(null);

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


    this.isLoading = false;
    this.spinnerText = "Deleting";


    this.fileuploadService.deleteObjectStorage((this.DocumentId)).subscribe((res) => {
      console.log(res);
      let apiResult: apiResult = (res);
      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.DocumentId = null;
          this.FileName = null;
          this.isLoading = true;
          this.alertService.showSuccess("Awesome!...  Your file is deleted successfully!")
        } else {
          this.isLoading = true;
          this.alertService.showWarning("An error occurred while trying to delete! " + apiResult.Message)
        }
      } catch (error) {

        this.alertService.showWarning("An error occurred while trying to delete! " + error)
      }

    }), ((err) => {

    })

  }


  /* #endregion */

  /* #region  Unsaved Documents delete from object storage (S3) */

  unsavedDeleteFile(_DocumentId) {

    this.fileuploadService.deleteObjectStorage((_DocumentId)).subscribe((res) => {

      console.log(res);
      let apiResult: apiResult = (res);

      try {
        if (apiResult.Status) {

          //search for the index.
          var index = this.unsavedDocumentLst.map(function (el) {
            return el.Id
          }).indexOf(this.DocumentId)

          // Delete  the item by index.
          this.unsavedDocumentLst.splice(index, 1)
          this.DocumentId = null;
          this.FileName = null;

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

  /* #region  Close modal */

  confirmExit() {

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true
    })

    swalWithBootstrapButtons.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, Exit!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        try {
          this.loadingScreenService.startLoading();
          if (this.unsavedDocumentLst.length > 0) {

            this.unsavedDocumentLst.forEach(e => {

              this.unsavedDeleteFile(e.Id);
            });

          }
        } catch (error) {
          this.loadingScreenService.stopLoading();
        }

        this.loadingScreenService.stopLoading();
        this._location.back();

      } else if (

        result.dismiss === Swal.DismissReason.cancel
      ) {

      }
    })


  }

  /* #endregion */


  reGenerate() {


    console.log('this._NewCandidateDetails',this._NewCandidateDetails);
    



    if (this._NewCandidateDetails &&
      !this._NewCandidateDetails.DateOfBirth ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining ||
      this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount == null ||
      (this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount).toString() == '' ||
      this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount == null ||
      (this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount).toString() == '' ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId ||
      !this.Remarks
    ) {

      this.alertService.showWarning("Oops! Fill in all required entry fields Confirm again.");
      return;

    } else if ((this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType != 0 && !this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate)
    ) {
      this.alertService.showWarning("Oops! Fill in all required entry fields and Confirm again.");
      return;
    }
    else if (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null) {
      this.alertService.showWarning("Oops! Please re-calculate the salary breakup.");
      return;
    }
    
    // const designationId : any = this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation;
    // this._NewCandidateDetails.LstCandidateOfferDetails[0].DesignationId = designationId
    
    // this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation = 
    // this.DesignationList.length > 0 && this.DesignationList.find(a => a.Id == this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation) != undefined ? this.DesignationList.find(a => a.Id == this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation).Name : "" ;



    if (this.ccemail != null && this.ccemail != '' && this.ccemail != undefined) {

      const matches = this.ccemail.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (matches) {
        this.ccmailtags.push(this.ccemail)
        this.ccemail = null;
      }
      else {
        this.CCemailMismatch = true;
        this.alertService.showWarning("This alert says that, Please type your CC e-mail address in the format example@domain.com");
        return;
      }

    }
    // old code it was not checking 18 years dob 
    // if (this._NewCandidateDetails.DateOfBirth != null) {
    //   var birth = new Date(this._NewCandidateDetails.DateOfBirth).toLocaleDateString();
    //   var today = new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining).toString();
    //   today = new Date(today).toString();
    //   console.log('today', today);
    //   var years = moment(birth).diff(today, 'years');
    //   console.log('years', years);;

    //   if (years.toString() < '-18') {
    //     this.alertService.showWarning("The action was blocked. We require candidate to be 18 years old or over. Please confirm your DOJ")
    //     return;
    //   }

    // }

    if (this._NewCandidateDetails.DateOfBirth != null) {
      var birth = new Date(this._NewCandidateDetails.DateOfBirth).toLocaleDateString();
      var today = new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining).toString();

      today = new Date(today).toString();;
      console.log('today', today);
      var years = moment(birth).diff(today, 'years');
      console.log('years', years.toString());
      years = Math.abs(years)
      if (years.toString() < '18' || years.toString() == '0' || years < 18 || years == 0) {
        this.alertService.showWarning("The action was blocked. We require candidate to be 18 years old or over. Please confirm your DOJ/DOB")
        return;
      }

    }


    console.log(this._NewCandidateDetails);

    console.log(this._OldCandidateDetails);

    const actualDOJ = moment(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining);
    const validActulDOJ = actualDOJ.isBetween(this.ActualDOJminDate, this.ActualDOJmaxDate, 'days', '[]');

    if (!validActulDOJ) {
      this.alertService.showWarning("Please update actual DOJ.");
      return;
    }

    if (((this.datePipe.transform(new Date(this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining), 'yyyy-MM-dd')) != this.datePipe.transform((this._OldCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining).toString(), 'yyyy-MM-dd') ||
      (this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation) != this._OldCandidateDetails.LstCandidateOfferDetails[0].Designation)
    ) {
      if (this.FileName == null || this.FileName == undefined) {
        this.alertService.showWarning("Problem were detected during data validation. No attachment found. Please add required attachments for Client approval :)");
        return;
      }
    }
    if (this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate == null) {
      this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate = '1900-01-01'
    }

    this.loadingScreenService.startLoading();
    this._NewCandidateDetails.LstCandidateOfferDetails[0].Modetype = UIMode.Edit;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].Modetype = UIMode.Edit;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : 0;
    this._NewCandidateDetails.Modetype = UIMode.Edit;

    this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining = this._OldCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].OLCCMailIdCC = _.union(this.ccmailtags).join(",");
    this._NewCandidateDetails.LstCandidateOfferDetails[0].ALCCMailIdCC = _.union(this.ccmailtags).join(",");

    if (this.FileName != null && this.FileName != undefined) {

      var Lstapproval = new Approvals();

      Lstapproval.Id = 0,
        Lstapproval.EntityType = EntityType.CandidateDetails,
        Lstapproval.EntityId = this._NewCandidateDetails.LstCandidateOfferDetails[0].CandidateId,
        Lstapproval.ApprovalFor = ApprovalFor.Others,
        Lstapproval.ApprovalType = ApproverType.External,
        Lstapproval.Remarks = this.Remarks,
        Lstapproval.DocumentName = this.FileName,
        Lstapproval.ObjectStorageId = this.DocumentId,
        Lstapproval.Status = 0,
        Lstapproval.Modetype = UIMode.Edit

      this._NewCandidateDetails.ExternalApprovals.push(Lstapproval)

    }


    let RegenerateModel = JSON.stringify({

      Remarks: this.Remarks,
      OldCandidateDetails: this._OldCandidateDetails,
      NewCandidateDetails: this._NewCandidateDetails,
      RoleId: this.RoleId
    })

    console.log(RegenerateModel);
    this.employeeService.Regenerate_AL(RegenerateModel).subscribe((result) => {

      console.log('res', result);


      let apiResult: apiResult = result;
      if (apiResult.Status) {
        this.loadingScreenService.stopLoading();
        this.alertService.showSuccess(apiResult.Message);
        this._location.back();
      } else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
        this.FileName != null && this.FileName != undefined && this._NewCandidateDetails.ExternalApprovals.length > 0 && this.remove_item_approvals();
        this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null;

      }

    })

  }

  remove_item_approvals() {

    this._NewCandidateDetails.ExternalApprovals.forEach(element => {

      if (element.Id == 0) {

        var index = this._NewCandidateDetails.ExternalApprovals.map(function (element) {
          return element.Id
        }).indexOf(element.Id);

        this._NewCandidateDetails.ExternalApprovals.splice(index, 1)

      }

    });

  }

  previewLetter() {

    if (this._NewCandidateDetails &&
      !this._NewCandidateDetails.DateOfBirth ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].FatherName ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].Designation ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining ||
      this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount == null ||
      (this._NewCandidateDetails.LstCandidateOfferDetails[0].GMCAmount).toString() == '' ||
      this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount == null ||
      (this._NewCandidateDetails.LstCandidateOfferDetails[0].GPAAmount).toString() == '' ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].NoticePeriodDays ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].AppointmentLetterTemplateId ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].Location ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary ||
      !this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].MonthlySalary

    ) {

      this.alertService.showWarning("Oops! Fill in all required entry fields Confirm again.");
      return;

    } else if ((this._NewCandidateDetails.LstCandidateOfferDetails[0].TenureType != 0 && !this._NewCandidateDetails.LstCandidateOfferDetails[0].EndDate)
    ) {
      this.alertService.showWarning("Oops! Fill in all required entry fields and Confirm again.");
      return;
    }

    this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : 0;
    this._NewCandidateDetails.LstCandidateOfferDetails[0].Modetype = UIMode.Edit;
    this._NewCandidateDetails.Modetype = UIMode.Edit;
    this.loadingScreenService.startLoading();
    this.employeeService.previewLetter_AL(JSON.stringify({ CandidateDetails: this._NewCandidateDetails })).subscribe((result) => {

      let apiResult: apiResult = result;

      if (apiResult.Status && apiResult.Result != null || apiResult.Result != "") {

        this.loadingScreenService.stopLoading();

        console.log(apiResult.Result);
        let base64 = apiResult.Result;
        let contentType = 'application/pdf';
        let fileName = "integrum_previewLetter";
        // let file = null;

        const byteArray = atob(base64);
        const blob = new Blob([byteArray], { type: contentType });
        let file = new File([blob], fileName, {
          type: contentType,
          lastModified: Date.now()
        });
        if (file !== null) {
          let fileURL = null;

          const newPdfWindow = window.open('', '');

          const content = encodeURIComponent(base64);

          // tslint:disable-next-line:max-line-length
          const iframeStart = '<div> <img src=\'assets/Images/logo.png\'>&nbsp; </div><\iframe width=\'100%\' height=\'100%\' src=\'data:application/pdf;base64, ';

          const iframeEnd = '\'><\/iframe>';

          newPdfWindow.document.write(iframeStart + content + iframeEnd);
          newPdfWindow.document.title = fileName;
          // fileURL = this.domSanitizer.bypassSecurityTrustResourceUrl(window.URL.createObjectURL(file));

          this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null;

        }
      }
      else {
        this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : null;

        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message)
      }
    });

  }

  PreviewCTC(): void {

    if (
      this._NewCandidateDetails &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].IndustryId &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].Location &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].SkillCategory &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].Zone &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].SalaryBreakUpType &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].AnnualSalary &&
      this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId

    ) {
      //this._NewCandidateDetails.Id = 0;
      // this._NewCandidateDetails.LstCandidateOfferDetails = []
      if (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet == null && (this.FileName == undefined || null)) {
        this.alertService.showWarning("This alert says that, Please add required attachments for Client approval :)");
        return;
      }
      else {
        this._NewCandidateDetails != null && this._NewCandidateDetails != undefined && this._NewCandidateDetails.DateOfBirth != undefined && this._NewCandidateDetails.DateOfBirth != null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].DOB = moment(this._NewCandidateDetails.DateOfBirth).format('YYYY-MM-DD').toString() : true;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].State = Number(this.StateId)
        this._NewCandidateDetails.LstCandidateOfferDetails[0].CityId = Number(this.CityId)
        this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining = this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining == null ? this._NewCandidateDetails.LstCandidateOfferDetails[0].ActualDateOfJoining : this._NewCandidateDetails.LstCandidateOfferDetails[0].DateOfJoining
        this.previewCTC_OfferDetails = this._NewCandidateDetails.LstCandidateOfferDetails[0];
        this.previewCTC_OfferDetails.LstPayGroupProductOverrRides =
          this._NewCandidateDetails.Id == undefined ? [] : this._NewCandidateDetails.Id != undefined && this._NewCandidateDetails.LstCandidateOfferDetails != null &&
            this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 &&
            this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides;
        this.loadingScreenService.startLoading();
        this.confirmPrevieCTC();
      }
    }

    else {

      this.alertService.showWarning("Oops! Fill in all required entry fields Confirm again.");
      return;
    }

  }

  confirmPrevieCTC() {


    this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId = this._NewCandidateDetails.LstCandidateOfferDetails != null && this._NewCandidateDetails.LstCandidateOfferDetails.length > 0 && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != null && this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId != 0 ? this._NewCandidateDetails.LstCandidateOfferDetails[0].TeamId : 0;
    if (this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet != null) {
      let baseDaysForAddlApplicableProduct = 0;
      if (this.MigrationInfoGrp && this.MigrationInfoGrp[0].ClientContractOperationList
        && this.MigrationInfoGrp[0].ClientContractOperationList.length > 0) {
        const clientContractOperationObj = this.MigrationInfoGrp[0].ClientContractOperationList[0];
        baseDaysForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasedays') ?
          clientContractOperationObj.BreakupBasedays : 0;
      }
      sessionStorage.removeItem('LstRateSet');
      sessionStorage.setItem('LstRateSet', JSON.stringify(this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet));
      this.loadingScreenService.stopLoading();
      const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
      modalRef.componentInstance.id = 0;
      modalRef.componentInstance.baseDaysForAddlApplicableProduct = Number(baseDaysForAddlApplicableProduct);
      modalRef.componentInstance.PayGroupId = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId;
      modalRef.componentInstance.ClientContractId = this.ClientContractId;
      modalRef.componentInstance.jsonObj = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet;
      modalRef.componentInstance.newCandidateOfferObj = this._NewCandidateDetails.LstCandidateOfferDetails[0];
      // if (modalRef.componentInstance.newCandidateOfferObj.IsRateSetValid==false) {

      //   this.alertService.showInfo("Hi there!, Changes you made may not be valid, please recalcute");

      // }
      modalRef.componentInstance.newCandidateOfferObj.IsRateSetValid = true;
      modalRef.result.then((result) => {

        console.log('ss', result);
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks = result.CalculationRemarks;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = result.RequestType;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = result.LetterTemplateId;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = result.IsRateSetValid;
        this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        // this._NewCandidateDetails.LstCandidateOfferDetails[0] =(result);
        this._LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
        this.isRateSetValid = result.IsRateSetValid;
        this.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
        this.isESICapplicable = result.LstCandidateRateSet[0].LstRateSet != null && result.LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;

        console.log(this._NewCandidateDetails, 'ddd');

      }).catch((error) => {
        console.log(error);
      });

    }

    else {

      this.getPaygroupProductOverrideItems().then((result) => {
        console.log('rsult', result);
        if (result != null) {
          this.previewCTC_OfferDetails.LstPayGroupProductOverrRides = result as any;
        } else {
          this.previewCTC_OfferDetails.LstPayGroupProductOverrRides = null
        }

        this.onboardingService.postCalculateSalaryBreakUp((JSON.stringify(this.previewCTC_OfferDetails))).subscribe((res) => {
          let apiResult: apiResult = res;

          try {

            if (apiResult.Status && apiResult.Result != null) {
              let baseDaysForAddlApplicableProduct = 0;
              if (this.MigrationInfoGrp && this.MigrationInfoGrp[0].ClientContractOperationList
                && this.MigrationInfoGrp[0].ClientContractOperationList.length > 0) {
                const clientContractOperationObj = this.MigrationInfoGrp[0].ClientContractOperationList[0];
                baseDaysForAddlApplicableProduct = clientContractOperationObj.hasOwnProperty('BreakupBasedays') ?
                  clientContractOperationObj.BreakupBasedays : 0;
              }
              var _LstSalaryBreakUp: any;
              _LstSalaryBreakUp = (apiResult.Result)
              let LstRateSet = _LstSalaryBreakUp.LstCandidateRateSet[0].LstRateSet;
              sessionStorage.removeItem('LstRateSet');
              sessionStorage.setItem('LstRateSet', JSON.stringify(LstRateSet));
              this.loadingScreenService.stopLoading();
              const modalRef = this.modalService.open(PreviewCtcModalComponent, this.modalOption);
              modalRef.componentInstance.id = 0;
              modalRef.componentInstance.baseDaysForAddlApplicableProduct = Number(baseDaysForAddlApplicableProduct);
              modalRef.componentInstance.PayGroupId = this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId;
              modalRef.componentInstance.ClientContractId = this.ClientContractId;
              modalRef.componentInstance.jsonObj = LstRateSet;
              modalRef.componentInstance.newCandidateOfferObj = apiResult.Result;

              modalRef.result.then((result) => {

                console.log('ss', result);
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstPayGroupProductOverrRides = result.LstPayGroupProductOverrRides;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].IsMinimumwageAdhere = result.IsMinimumwageAdhere;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].CalculationRemarks = result.CalculationRemarks;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].RequestType = result.RequestType;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LetterTemplateId = result.LetterTemplateId;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].IsRateSetValid = result.IsRateSetValid;
                this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
                // this._NewCandidateDetails.LstCandidateOfferDetails[0] = (result);
                // this._LstRateSet = result.LstCandidateRateSet[0].LstRateSet;
                this.isRateSetValid = result.IsRateSetValid;
                this.IsMinimumwageAdhere = result.IsMinimumwageAdhere;
                this.isESICapplicable = result.LstCandidateRateSet[0].LstRateSet != null && result.LstCandidateRateSet[0].LstRateSet.find(a => a.ProductCode == "ESIC" && a.Value > 0) != null ? true : false;

                console.log(this._NewCandidateDetails, 'testet');

              }).catch((error) => {
                console.log(error);
              });


            } else {
              this.loadingScreenService.stopLoading();
              this.alertService.showWarning(apiResult.Message);
              this._LstRateSet = null;
              this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].LstRateSet = null;
            }
          } catch (error) {

            this.loadingScreenService.stopLoading();
            this.alertService.showWarning(error);
          }

          console.log(apiResult.Result);


        }), ((err) => {

        })
      }
      )
    };

  }

  getPaygroupProductOverrideItems() {
    return new Promise((resolve, reject) => {
      this.onboardingService.getMigrationMasterInfo(this.ClientContractId).subscribe((result) => {
        let apiResult: apiResult = (result);
        console.log(apiResult);
        var lstOfPaygroupOverrideProducts = [];
        if (apiResult.Status && apiResult.Result != null) {
          var offerMasterInfo = JSON.parse(apiResult.Result);
          var MigrationInfoGrp = offerMasterInfo[0];
          var lstOfPaygroupOverrideProducts = [];

          if (MigrationInfoGrp.PaygroupProductOverridesList != null && MigrationInfoGrp.PaygroupProductOverridesList.length > 0) {
            lstOfPaygroupOverrideProducts = MigrationInfoGrp.PaygroupProductOverridesList;
            var lstOfPaygroupOverrideProducts = lstOfPaygroupOverrideProducts.filter(item => item.PayGroupId == this._NewCandidateDetails.LstCandidateOfferDetails[0].LstCandidateRateSet[0].PayGroupdId);
            lstOfPaygroupOverrideProducts = lstOfPaygroupOverrideProducts.filter(a => a.IsDefault == true);
          }
          resolve(lstOfPaygroupOverrideProducts);
        } else {
          resolve(lstOfPaygroupOverrideProducts);
        }

      }), ((error) => {
      })
    });
  }

  /* #region  CC Email address book input ccmailtags function */

  focusTagInput(): void {
    this.tagInputRef.nativeElement.focus();
  }

  onKeyUp(event: KeyboardEvent): void {
    const inputValue: string = this.ccemail;
    if (event.code === 'Backspace' && !inputValue) {
      this.removeTag();
      return;
    } else {
      if (event.code === 'Comma' || event.code === 'Space') {
        this.addTag(inputValue);
        this.ccemail = '';
      }
    }
  }

  addTag(tag: any): void {
    console.log((tag));


    if (tag) {
      const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
      if (matches) {
        this.CCemailMismatch = false;
        if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
          tag = tag.slice(0, -1);
        }
        if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
          this.ccmailtags.push(tag);
        }
      } else {
        this.CCemailMismatch = true;
      }
      // return matches ? null : { 'invalidEmail': true };
    } else {

      return null;
    }


  }

  removeTag(tag?: string): void {
    if (!!tag) {
      pull(this.ccmailtags, tag); // lodash 
    } else {
      this.ccmailtags.splice(-1);
    }
  }


  onchangeCC(event) {

    let tag = event.target.value;
    const matches = tag.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/);
    if (matches) {
      this.CCemailMismatch = false;
      if (tag[tag.length - 1] === ',' || tag[tag.length - 1] === ' ') {
        tag = tag.slice(0, -1);
      }
      if (tag.length > 0 && !find(this.ccmailtags, tag)) { // lodash
        this.ccmailtags.push(tag);
        event.target.value = null;
      }
    } else {
      this.CCemailMismatch = true;
    }
  }
  /* #endregion */

}
