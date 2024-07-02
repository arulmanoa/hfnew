import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { EmployeeLifeCycleTransaction, ELCTRANSACTIONTYPE, _EmployeeLifeCycleTransaction } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransaction';
import { PagelayoutService, AlertService, SessionStorage, EmployeeService, PayrollService } from 'src/app/_services/service';
import { DataSource, SearchElement } from '../../personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { FnFDetails } from 'src/app/_services/model/Employee/FnFDetails';
import { EmploymentContract } from 'src/app/_services/model/Employee/EmployementContract';
import _ from 'lodash';
import { UIBuilderService } from 'src/app/_services/service/UIBuilder.service';
import { TransactionStatus, EmployeeFnFTransaction, FnFType } from 'src/app/_services/model/Employee/EmployeeFFTransaction';
import { EmployeeLifeCycleTransactionModel } from 'src/app/_services/model/Employee/EmployeeLifeCycleTransactionModel';
import { UIMode } from 'src/app/_services/model/Common/BaseModel';
import { ELCTransactionType } from 'src/app/_services/model/Base/HRSuiteEnums';
import { apiResult } from '../../../_services/model/apiResult';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { WorkFlowInitiation } from 'src/app/_services/model/OnBoarding/WorkFlowInitiation';
import { EntityType } from 'src/app/_services/model/Base/EntityType';
import { Role, LoginResponses } from 'src/app/_services/model';
import { Router, ActivatedRoute } from '@angular/router';

import { SessionKeys } from 'src/app/_services/configs/app.config';
import Swal from 'sweetalert2';
import { data } from 'jquery';
import { Allowance } from 'src/app/_services/model/Payroll/Allowance';
import { TimeCard } from 'src/app/_services/model/Payroll/TimeCard';
import { Adjustment } from 'src/app/_services/model/Payroll/Adjustment';
import { TimeCardStatus } from 'src/app/_services/model/Payroll/TimecardStatus';
import { tr } from 'date-fns/locale';
import { TimeCardModel } from '../../payroll/payrollinputtransaction/payrollinputtransaction.component';
import { _TimeCardModel } from 'src/app/_services/model/Payroll/TimeCardModel';
import { PayrollQueueMessage } from 'src/app/_services/model/Payroll/PayrollQueueMessage';
import { PayrollVerificationRequestDetails, PayrollVerificationRequest, PVRStatus } from 'src/app/_services/model/Payroll/PayrollVerificationRequest';
import * as moment from 'moment';
import { PayrollModel, _PayrollModel } from 'src/app/_services/model/Payroll/ParollModel';
import { RowDataService } from '../../personalised-display/row-data.service';
import { CalendarView, CalendarEvent, CalendarMonthViewDay } from 'angular-calendar';
import { subMonths, addMonths, addDays, addWeeks, subDays, subWeeks, startOfDay, startOfWeek, startOfMonth, endOfDay, endOfWeek, endOfMonth } from 'date-fns';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AttendancelogModalComponent } from 'src/app/shared/modals/payroll/attendancelog-modal/attendancelog-modal.component';
import { Attendance } from 'src/app/_services/model/Payroll/Attendance';
import { Person } from 'src/app/_services/model/Migrations/Transition';
import { searchObject } from 'src/app/_services/model/Common/SearchObject';
import { PayPeriod } from 'src/app/_services/model/Payroll/RollOverLog';
import { PayoutInformationDetails } from 'src/app/_services/model/Payroll/PayOut';
import { EmployeeRateset } from 'src/app/_services/model/Employee/EmployeeRateset';
import { environment } from 'src/environments/environment';

const colors: any = {
  red: {
    primary: '#ad2121',
    secondary: '#FAE3E3',
  },
  blue: {
    primary: '#1e90ff',
    secondary: '#D1E8FF',
  },
  yellow: {
    primary: '#e3bc08',
    secondary: '#FDF1BA',
  },
  green: {
    primary: '#3BBD72',
    secondary: '#3BBD72'
  }
};

type CalendarPeriod = 'day' | 'week' | 'month';

@Component({
  selector: 'app-finalsettlement',
  templateUrl: './finalsettlement.component.html',
  styleUrls: ['./finalsettlement.component.scss']
})
export class FinalsettlementComponent implements OnInit {

  //General
  spinner: boolean = false;
  MenuId: number;
  submitted: boolean = false;
  isResignation: boolean = true;
  employeeId: number;
  index: number = 0;
  ff_Form: FormGroup;
  EmployeeObject: any = null;
  gotFromUser: boolean = false;
  processStatusId: number;
  approveRequestedLWD: boolean = false;
  lwdBeforeLastPayDate: boolean = false;
  lastPayDate: string = " ";
  recoveryDays: number;
  isNillCase: boolean = false;

  eLCTransaction: EmployeeLifeCycleTransaction;
  newELCTransaction: EmployeeLifeCycleTransaction;
  newFnfTransaction: EmployeeFnFTransaction;
  elcMOdel: EmployeeLifeCycleTransactionModel;
  workFlowInitiation: WorkFlowInitiation;
  newObj: FnFDetails;
  noticePeriod: number = 0;
  fnfPayPeriodId: number = 0;
  fnfPayPeriodStartDate: Date;


  //Time Card Processing
  timeCardDetails: TimeCard = null;
  oldTimeCard: TimeCard = null;
  openPayPeriodId: number = 0;
  payPeriods: any[] = [];
  payPeriod: any;
  payPeriodName: string;
  lastPaymentPeriod: PayPeriod;
  teamOpenPayPeriodId: number = 0;
  teamPayPeriod: any;
  teamPayPeriodName: string;

  //Salary TimeCard
  salaryTimeCard: TimeCard = null;

  //Slider
  variableInput_Slider: boolean = false;
  _slider_activeTabName: string = 'salaryInput';
  slider_salaryActiveTabName: string = 'Allowance';
  events: CalendarEvent[] = [];
  view: CalendarView | CalendarPeriod = CalendarView.Month;
  viewDate: Date = new Date();
  minDate: Date = subMonths(new Date(), 1);
  maxDate: Date = addMonths(new Date(), 1);
  noOfP: number;
  noOfA: number;
  modalOption: NgbModalOptions = {};

  //Session Details
  _loginSessionDetails: LoginResponses;
  companyId: number;
  clientId: number;
  clientContractId: number;
  teamId: number;
  implementationCompanyId: number;
  userId: number;
  userName: string = '';
  currentRole: Role;
  isChanged: boolean;
  roleCode: string;

  employmentContract: EmploymentContract;
  employeeRateset: EmployeeRateset;
  managerPersonDetails: Person;
  companySetting: any;
  getAttendanceStartDateFromUser: boolean = false;
  minAttendanceStartDate: Date | string;
  AttendanceStartDate: Date | string;
  lastWorkingDate: Date | string;

  //Labels 
  label_EmployeeCode: string = '';
  label_EmployeeName: string = '';
  label_ManagerName: string = '';
  label_Designation: string = '';
  label_SalaryStartDate: string = '';
  label_SalaryEndDate: string = '';
  label_ClientName: string = '';

  //DropDown Data
  gratuityRules: any[];
  noticePaymentRules: any[];
  recoveryRules: any[];
  leaveEncashmentRules: any[];
  resignationReasons: any[];
  letterTemplates: any[];

  // ACCESS CONTROL VALIDATION - INITIALIZATION
  isEmployee: boolean = true;
  isManager: boolean = true;
  isClientSPOC: boolean = true;
  stepper: boolean = true;
  footer: boolean = true;

  // STATIC DATA
  lst_ResignationReason: any[] = [{ id: 1, name: 'Health Issue' }, { id: 2, name: 'Deported' }];
  lst_LeaveEncashment: any[] // = [{ Id: 1, LeaveType: "SL", Balance: 12, Encash: 0 }, { Id: 2, LeaveType: "AL", Balance: 4, Encash: 0 }, { Id: 3, LeaveType: "Others", Balance: 4, Encash: 0 }];
  lst_VariableInputs: any[] = [{ Id: 1, Component: "Cmp 1", Type: 'Earning', Amount: 0 }, { Id: 2, Component: "Cmp 2", Type: 'Deduction', Amount: 0 }, { Id: 3, Component: "Cmp 3", Type: 'Earning', Amount: 0 }];
  lst_StaticValidationKeys: any[] = [];
  LstTimeCardAllowanceProducts: any[] = [];
  LstTimeCardAdjustmentProducts: any[] = [];
  public mask = [/\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]

  visible_previewFnF: boolean = false;
  dateOfJoining: any;
  otherDeductionproductCode: string = environment.environment.OtherDeductionProductCode || 'OtherDedn';
  fnfEditAttendanceAccess: String[] = environment.environment.FnfEditAttendanceAccess || ['RegionalHR'];
  isAllenClient: boolean = environment.environment.IsAllenClient;


  constructor(
    private formBuilder: FormBuilder,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private alertService: AlertService,
    private uiBuilderService: UIBuilderService,
    private sessionService: SessionStorage,
    private employeeService: EmployeeService,
    private loadingScreenService: LoadingScreenService,
    private router: Router,
    private route: ActivatedRoute,
    private payrollService: PayrollService,
    private rowDataService: RowDataService,
    private modalService: NgbModal,
  ) {
    this.createReactiveForm();
    // this.employeeId = 42487;
  }
  get g() { return this.ff_Form.controls; } // reactive forms validation 

  createReactiveForm() {
    this.ff_Form = this.formBuilder.group({
      Id: [0],
      FnFTransactionType: [],
      EmployeeId: [0],

      TerminationStartDate: [new Date()],
      TerminationReason: [null],
      TerminationEndDate: [''],
      TerminationRemarks: [''],// validation required

      ResignationDate: [new Date()],
      ResignationReason: [null],
      CalculatedLastWorkingDate: [{ value: '', disabled: true }],
      RequestedLastWorkingDate: [new Date()],
      ResignationRemarks: [''], // validation required
      approveRequestedLWD: [false],

      NoticePeriodDays: [0, [Validators.pattern(/^\d*(?:[.,]\d{1,2})?$/)]],
      NoticePeriodRuleId: [0],
      RecoveryDays: [0, Validators.pattern(/^\d*\.?\d+$/)],
      RecoveryRuleId: [0],
      RecoveryRemarks: [''],
      IsSystemBasedRecovery: [true],
      EnterRecoveryManuaaly: [false],
      RecoveryAmount: [0],

      LeaveEncashmentDays: [0],
      LeaveEncashRuleId: [0],
      IsSystemBasedLeaveEncash: [true],
      EnterLeaveEncashManually: [false],
      LeaveEncashmentAmount: [0],

      GratuityPeriod: [0],
      GratuityRuleId: [0],
      IsSystemBasedGratuity: [true],
      EnterGratuityManually: [false],
      GratuityAmount: [0],

      PayProcessType: [0],
      LetterTemplate: [null],
      LoanRecoveryAmount: [0],

      TimeCardId: [0],
      AttendanceStartDate: [''],
      IsNillCase: [false],

      VariableInputs: [[]],
      AttendanceInputs: [[]],
      AdjustmentInputs: [[]]

    });

    Object.keys(this.ff_Form.controls).forEach(key => {

    });
    this.lst_StaticValidationKeys = [
      { index: 0, control: 'ResignationDate', Type: 'Resignation' },
      { index: 0, control: 'ResignationReason', Type: 'Resignation' },
      { index: 0, control: 'CalculatedLastWorkingDate', Type: 'Resignation' },
      //{ index: 0, control: 'RequestedLastWorkingDate' , Type: 'Resignation' },
      { index: 0, control: 'TerminationStartDate', Type: 'Termination' },
      { index: 0, control: 'TerminationReason', Type: 'Termination' },
      { index: 0, control: 'CalculatedLastWorkingDate', Type: 'Termination' },
      //{ index: 1, control: 'NoticePeriodDays' }, { index: 1, control: 'noticeRule' }, { index: 1, control: 'noticePeriodLastWorkingDate' }, { index: 1, control: 'recoveryDays' }, { index: 1, control: 'recoveryRule' },
      { index: 0, control: 'TerminationRemarks', Type: 'Termination' },
      { index: 1, control: 'RecoveryRemarks', Type: 'Termination' },
      { index: 0, control: 'ResignationRemarks', Type: 'Resignation' },
      { index: 1, control: 'RecoveryRemarks', Type: 'Resignation' }

    ]
  }

  ngOnInit() {
    //debugger;
    this.titleService.setTitle('Full & Final Settlement');

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.userId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.userName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.companyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    this.implementationCompanyId = this._loginSessionDetails.ImplementationCompanyId; // bind Logged user id may be change baed on dashboard 
    //this.userAccessControl = this._loginSessionDetails.UIRoles[0].UserInterfaceControls;
    this.MenuId = (this.sessionService.getSessionStorage("MenuId"));
    let businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType;
    if (sessionStorage.getItem('activeRoleId') != null) {
      const selectedRoleDetails = this._loginSessionDetails.UIRoles.find(a => a.Role.Id == (sessionStorage.getItem('activeRoleId') as any));
      this.currentRole = selectedRoleDetails.Role as any;

    }
    else {
      const selectedRoleDetails = this._loginSessionDetails.UIRoles[0];
      this.currentRole = selectedRoleDetails.Role as any;
    }

    this.roleCode = this.currentRole.Code;
    console.log("Role", this.roleCode);

    if (this.currentRole.Code == 'Manager') {
      this.isManager = true;
      this.isEmployee = false;
    }
    else if (this.currentRole.Code == 'Employee') {
      this.isEmployee = true;
      this.isManager = false;
    }
    else {
      this.isManager = false;
      this.isEmployee = false;
    }



    if (this.roleCode == 'PayrollAdmin' || this.roleCode == 'OpsMember' || this.roleCode == 'PayrollOps' || this.roleCode == 'RegionalHR') {
      this.ff_Form.get('CalculatedLastWorkingDate').enable();
      if ((this.newObj && this.newObj["IsLWdEditAllowed"] && this.newObj["IsLWdEditAllowed"]) == 0) {
        this.ff_Form.get('CalculatedLastWorkingDate').disable();
      }
    }
    else {
      this.ff_Form.get('CalculatedLastWorkingDate').disable();
    }

    console.log("Current Role ::", this.currentRole);

    this.route.queryParams.subscribe(params => {
      console.log("Params ::", params)
      if (params["Odx"] != undefined && params["Odx"] != null && params["Odx"] != "") {
        this.EmployeeObject = atob(params["Odx"]);
        this.EmployeeObject = JSON.parse(this.EmployeeObject);

      }
      else {
        this.EmployeeObject = null;

      }

    })

    if (this.EmployeeObject == undefined || this.EmployeeObject == null) {

      this.route.data.subscribe(data => {

        if (data.DataInterface.RowData != null) {
          this.EmployeeObject = data.DataInterface.RowData
          if (this.EmployeeObject.EmployeeId != undefined) {
            this.employeeId = this.EmployeeObject.EmployeeId;
            this.get_employeeDetailsById(this.EmployeeObject.EmployeeId);
          }
        }
        else {
          this.getEmployeeObjectByUserId();
        }

        this.rowDataService.dataInterface = {
          SearchElementValuesList: [],
          RowData: null
        }

      });

    } else {
      this.employeeId = this.EmployeeObject.EmployeeId;
      // if (this.EmployeeObject.isResignation !== undefined && this.EmployeeObject.isResignation != null) {

      this.isResignation = 'isResignation' in this.EmployeeObject ? this.EmployeeObject.isResignation :
        'FnFTransactionType' in this.EmployeeObject ?
          (this.EmployeeObject.FnFTransactionType == 1 ? false : true) : true;
      // } 
      this.get_employeeDetailsById(this.employeeId);
    }

    if (this.isResignation) {
      this.ff_Form.get('FnFTransactionType').setValue(FnFType.Resignation);
    }
    else {
      this.ff_Form.get('FnFTransactionType').setValue(FnFType.Termination);
    }

    this.elcMOdel = new EmployeeLifeCycleTransactionModel();

    this.updateAccessControls();

    //On Resignation Date Change
    this.ff_Form.get("ResignationDate").valueChanges.subscribe(val => {

      let resigDateString: string = val //this.ff_Form.get('ResignationDate').value;

      // console.log(this.ff_Form.value["ResignationDate"]);
      // console.log(new Date(resigDateString).getDate());

      let resigDate: Date = new Date(resigDateString);

      //console.log(new Date(resigDateString).setDate(new Date(resigDateString).getDate() + this.employmentContract.NoticePeriodDays))
      // console.log("Resig Date ::" , resigDate , this.ff_Form.get('NoticePeriodDays').value);  

      if (this.roleCode != 'PayrollAdmin' && this.roleCode != 'OpsMember' && this.roleCode != 'PayrollOps' && this.roleCode != 'RegionalHR') {
        console.log("Changing calculated last working date for resignation date");
        if (this.employmentContract != null) {
          this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment(resigDate).add((this.noticePeriod - 1), 'day').format('YYYY-MM-DD'));
        }
      }



      // console.log( "LWD ::" , this.ff_Form.get('CalculatedLastWorkingDate').value)

      // this.onLWDChange();

    });

    //On Termination Date Change
    this.ff_Form.get("TerminationStartDate").valueChanges.subscribe(val => {
      console.log("Changing calculated last working date");

      let termDateString: string = val //this.ff_Form.get('ResignationDate').value;

      // console.log(this.ff_Form.value["ResignationDate"]);
      // console.log(new Date(resigDateString).getDate());

      let resigDate: Date = new Date(termDateString);

      console.log(moment(termDateString).add((this.ff_Form.get('NoticePeriodDays').value - 1), 'days'));

      if (this.roleCode != 'PayrollAdmin' && this.roleCode != 'OpsMember' && this.roleCode != 'PayrollOps' && this.roleCode != 'RegionalHR') {
        if (this.employmentContract != null) {
          this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment(termDateString).add(this.noticePeriod, 'days').format('YYYY-MM-DD'));
          //this.ff_Form.get('CalculatedLastWorkingDate').setValue( new Date(new Date(termDateString).setDate(new Date(termDateString).getDate() + this.ff_Form.get('NoticePeriodDays').value)));
        }
      }

      // this.onLWDChange();
    });

    //On Approving Requested LWD
    this.ff_Form.get("approveRequestedLWD").valueChanges.subscribe(val => {
      if (val) {
        let requestLWD = this.ff_Form.get('RequestedLastWorkingDate').value;
        this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment(requestLWD).format('YYYY-MM-DD'));
        // this.onLWDChange();
      } else {
        let resigDate = this.ff_Form.get('ResignationDate').value;
        if (this.employmentContract != null || this.noticePeriod != 0) {

          this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment(resigDate).add((this.noticePeriod - 1), 'day').format('YYYY-MM-DD'));
        }
        else {
          this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment(resigDate).format('YYYY-MM-DD'));
        }
        // this.onLWDChange();
      }
    })

    //On Attendace Start Date changed
    this.ff_Form.get('AttendanceStartDate').valueChanges.subscribe(val => {
      // console.log("Event Fired :: Attendance");
      if (this.lwdBeforeLastPayDate) {
        if (this.timeCardDetails != undefined && this.timeCardDetails != null) {
          this.timeCardDetails.AttendanceStartDate = moment(val).format();
        }
        // this.timeCardDetails.PeriodStartDate = moment(val).format('YYYY-MM-DD');
      }
      // this.setNoticePayDays();
    })

    //On Last Working  Date changed
    this.ff_Form.get('CalculatedLastWorkingDate').valueChanges.subscribe(val => {
      console.log("Event Fired :: LWDChange");
      this.onLWDChange();
      // this.setNoticePayDays();

    })

    //On Notice Period Change
    // this.ff_Form.get('NoticePeriodDays').valueChanges.subscribe(val => {
    //   if(!this.ff_Form.get('approveRequestedLWD').value){
    //     let resigDate = this.ff_Form.get('ResignationDate').value;
    //     this.ff_Form.get('CalculatedLastWorkingDate').setValue( moment(resigDate).add((val - 1)  , 'day').format('YYYY-MM-DD'));
    //     this.onLWDChange();
    //   }

    // })

    //On Enter Amount Manually Change
    this.ff_Form.get('EnterRecoveryManuaaly').valueChanges.subscribe(val => {
      this.ff_Form.get('IsSystemBasedRecovery').setValue(!val);
    })

    this.ff_Form.get('EnterLeaveEncashManually').valueChanges.subscribe(val => {
      this.ff_Form.get('IsSystemBasedLeaveEncash').setValue(!val);

    })

    this.ff_Form.get('EnterGratuityManually').valueChanges.subscribe(val => {
      this.ff_Form.get('IsSystemBasedGratuity').setValue(!val);

    })

    this.ff_Form.get('IsNillCase').valueChanges.subscribe(val => {
      this.isNillCase = val;
      this.checkAndUpdateAttendanceStartDate();

    })
  }

  getEmployeeObjectByUserId() {
    console.log("Getting Employee Object By User Id");

    let datasource: DataSource = {
      Name: "EmployeeUserView",
      Type: DataSourceType.View,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "UserId",
        Value: this.userId
      }
    ]

    this.spinner = true;
    this.gotFromUser = true;
    this.isResignation = true;
    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      //let apiResult: apiResult = (result);
      this.spinner = false;
      console.log(result);
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        this.EmployeeObject = JSON.parse(result.dynamicObject)[0];
        this.employeeId = this.EmployeeObject.EmployeeId;
        this.get_employeeDetailsById(this.employeeId);
      }
      else {
        this.alertService.showWarning("Something went wrong! Couldn't Get Employee Details.")
      }
    }, (error) => {
      this.spinner = false;
      console.error(error);

    })
  }

  get_employeeDetailsById(EmployeeId) {

    //this.employeeService.getEmployeeDetailsById(EmployeeId).subscribe(data=> {console.log("data" , data)});

    let datasource: DataSource = {
      Name: "GetDataForFnF",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@employeeId",
        Value: EmployeeId
      }
    ]

    this.spinner = true;
    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      //let apiResult: apiResult = (result);
      console.log("FnFDetails ::", result);
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {

        // let apiResult = result.Result;
        // let oldapiResult = result.Result;

        let apiResult = JSON.parse(result.dynamicObject)[0];
        let oldapiResult = JSON.parse(result.dynamicObject)[0];

        this.newObj = apiResult;
        // check if edit LWD allowed : 0-false, 1: true
        if ((this.newObj && this.newObj["IsLWdEditAllowed"] && this.newObj["IsLWdEditAllowed"] == 0) || (oldapiResult && oldapiResult.IsLWdEditAllowed == 0)) {
          this.ff_Form.get('CalculatedLastWorkingDate').disable();
        }
        console.log("new obj ::", this.newObj);

        //Set the Rules
        this.gratuityRules = this.newObj.GratuityRules;
        this.noticePaymentRules = this.newObj.NoticePaymentRules;
        this.recoveryRules = this.newObj.RecoveryRules;
        this.leaveEncashmentRules = this.newObj.LeaveEncashmentRules;
        this.resignationReasons = this.newObj.ResignationReasons;
        this.letterTemplates = this.newObj.LetterTemplates;

        //Set Employment Contract
        this.employmentContract = this.newObj.EmploymentContracts != undefined && this.newObj.EmploymentContracts != null
          && this.newObj.EmploymentContracts.length > 0 ? _.orderBy(this.newObj.EmploymentContracts, ["Id"], ["desc"])
            .find(x => x.Status == 1 || x.Status == 2) : null;

        //Set Employee Ratestet
        this.employeeRateset = this.newObj.EmployeeRateset != undefined && this.newObj.EmployeeRateset != null ?
          this.newObj.EmployeeRateset : null;


        //Set Client / Contract / Team 
        if (this.employmentContract != null && this.employmentContract != undefined) {
          this.clientId = this.employmentContract.ClientId;
          this.clientContractId = this.employmentContract.ClientContractId;
          this.teamId = this.employmentContract.TeamId;
          this.noticePeriod = this.employmentContract.NoticePeriodDays;
        }

        console.log("Employment Contract ::", this.employmentContract);
        console.log("CCC ::", this.companyId, this.clientId, this.clientContractId);

        //Set ELC Transaction
        this.eLCTransaction = this.newObj.ELCTransactions != undefined && this.newObj.ELCTransactions != null
          && this.newObj.ELCTransactions.length > 0 ? _.orderBy(this.newObj.ELCTransactions, ["Id"], ["desc"]).find(x =>
            (x.ELCTransactionTypeId == ELCTRANSACTIONTYPE.Resignation || x.ELCTransactionTypeId == ELCTRANSACTIONTYPE.Termination)
            && (x.EmployeeFnFTransaction.Status !== TransactionStatus.Voided)) : null;

        console.log("elcTransaction ::", this.eLCTransaction);

        //#region  Set Open Pay period
        if (this.newObj.PayPeriods != undefined && this.newObj.PayPeriods != null && this.newObj.PayPeriods.length > 0) {
          this.payPeriods = this.newObj.PayPeriods;
        }

        //Employment Contract
        this.payPeriod = this.payPeriods.find(x => x.Id == this.employmentContract.OpenPayPeriodId);

        if (this.payPeriod != undefined && this.payPeriod != null) {
          this.openPayPeriodId = this.payPeriod.Id;
          this.payPeriodName = this.payPeriod.PayCyclePeriodName;
        }

        // Team
        this.teamPayPeriod = this.payPeriods.find(x => x.Id == ((this.newObj.TeamOpenPayPeriodId !== undefined && this.newObj.TeamOpenPayPeriodId !== null) ? this.newObj.TeamOpenPayPeriodId : this.employmentContract.OpenPayPeriodId));
        console.log("Team Open Pay Period ::", this.teamPayPeriod);

        if (this.teamPayPeriod != undefined && this.teamPayPeriod != null) {
          this.teamOpenPayPeriodId = this.teamPayPeriod.Id;
          this.teamPayPeriodName = this.teamPayPeriod.PayCyclePeriodName;
        }


        //#endregion

        //Get Last Payment Period
        this.lastPaymentPeriod = this.payPeriods.find(x => x.Id == this.employmentContract.LastPaymentPeriodId);
        console.log("Last Payment period ::", this.lastPaymentPeriod);

        if (this.lastPaymentPeriod != undefined && this.lastPaymentPeriod != null) {
          this.lastPayDate = moment(this.lastPaymentPeriod.EndDate).format('YYYY-MM-DD');


        }

        //get DOJ date
        if (this.employmentContract) {
          this.dateOfJoining = moment(this.employmentContract.StartDate).format('YYYY-MM-DD');
        }


        //Set Attendance Start date
        this.minAttendanceStartDate = this.newObj.AttendanceStartDate != undefined && this.newObj.AttendanceStartDate != null ? moment(this.newObj.AttendanceStartDate).format() : moment(this.teamPayPeriod.StartDate).format();
        // this.AttendanceStartDate = new Date();

        //Get Company Settings
        if (this.newObj.CompanySettings != undefined && this.newObj.CompanySettings != null) {
          this.companySetting = this.newObj.CompanySettings;
          let settingVal = Number(this.companySetting.SettingValue);
          this.getAttendanceStartDateFromUser = settingVal == 1 ? true : false;
        }

        //Handle New FnF
        if (this.eLCTransaction != undefined && this.eLCTransaction != null) {
          if (this.gotFromUser && (this.eLCTransaction.EmployeeFnFTransaction.Status >= 2)) { //Required only for Employee trying to raise another revision request ! for manager listing page can take care
            this.alertService.showWarning("A settlement request is already under process!");
            this.router.navigate(["app/dashboard"]);
          }
          this.patchForm();
        }
        else {
          if (this.employmentContract != undefined && this.employmentContract != null) {
            // console.log(new Date(). + 20);
            console.log("Handle New FnF");

            if (this.employmentContract.LWD != null && this.employmentContract.LWD != undefined) {
              this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment(this.employmentContract.LWD).format('YYYY-MM-DD'));
            }

            if (this.teamPayPeriod != undefined && this.teamPayPeriod != null) {
              this.ff_Form.get('ResignationDate').setValue(moment(this.teamPayPeriod.StartDate).format('YYYY-MM-DD'));
              this.ff_Form.get('RequestedLastWorkingDate').setValue(moment(this.ff_Form.get('ResignationDate').value).add(this.noticePeriod - 1, 'day').format('YYYY-MM-DD'));

            }
            else {
              this.ff_Form.get('CalculatedLastWorkingDate').setValue(moment().add(this.noticePeriod, 'day').format('YYYY-MM-DD'));
            }

            if (this.minAttendanceStartDate) {
              this.ff_Form.get('AttendanceStartDate').setValue(moment(this.minAttendanceStartDate).format('YYYY-MM-DD'));
            }
            this.ff_Form.get('GratuityPeriod').setValue(Math.floor(moment().diff(moment(this.employmentContract.StartDate), 'years', true) + 0.5))

            console.log("Gratuity ::", moment().diff(moment(this.employmentContract.StartDate), 'years', true))
            // this.setNoticePayDays();
            // this.ff_Form.get('CalculatedLastWorkingDate').setValue(new Date(new Date().setDate(new Date().getDate() + this.employmentContract.NoticePeriodDays )));
          }
        }



        console.log("isResgignation ::", this.isResignation);

        //Check For Salary Time Card of current open pay period
        if (this.newObj.SalaryTimeCards != undefined && this.newObj.SalaryTimeCards != null &&
          this.newObj.SalaryTimeCards.length > 0) {
          let salaryTimeCard = this.newObj.SalaryTimeCards.find(x => x.Status != 401 && x.Status != 10000);
          if (salaryTimeCard != undefined && salaryTimeCard != null) {
            this.salaryTimeCard = salaryTimeCard;
          }
          else {
            this.salaryTimeCard = null;
          }
        }

        this.checkForOldTimeCard();

        this.patchNoticePeriodAndRecoveryRules();

        this.fillUpStaticDetails();

        this.setupSalaryInputs();

        this.spinner = false;
      }
      else {
        this.spinner = false;
        this.alertService.showWarning("Sorry Something went wrong, Could not get Settlement Details!");
        this.router.navigate(["app/dashboard"]);

      }
    }, error => {
      this.spinner = false;
      console.error(error);
      this.alertService.showWarning("Something went wrong!");
    })
  }

  setupSalaryInputs() {

    this.ff_Form.get('VariableInputs').value.forEach(e => {
      var _reUpdateAmt = this.LstTimeCardAllowanceProducts.find(a => a.ProductId === e.ProductId);
      _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue,
        _reUpdateAmt.NewAmount = e.PayUnitValue,
        _reUpdateAmt.Id = e.Id);
    });
    this.ff_Form.get('AdjustmentInputs').value.forEach(e => {
      var _reUpdateAmt = this.LstTimeCardAdjustmentProducts.find(a => a.ProductId === e.ProductId)
      _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue,
        _reUpdateAmt.NewAmount = e.PayUnitValue,
        _reUpdateAmt.Id = e.Id);
    });
  }

  checkForOldTimeCard() {
    let timeCardsList: TimeCard[] = this.newObj.FnFTimeCards;
    let oldTimeCard: TimeCard = null;

    if (timeCardsList != undefined && timeCardsList != null) {
      oldTimeCard = timeCardsList.find(x => x.Status != 401);
    }

    // if no time card found then create a new one
    // if(oldTimeCard == null){
    //   let newTimeCard : TimeCard = new TimeCard();

    //   newTimeCard.Id = 0;
    //   newTimeCard.CompanyId = this.employmentContract.CompanyId;
    //   newTimeCard.ClientId = this.clientId ;
    //   newTimeCard.ClientContractId = this.clientContractId;
    //   newTimeCard.TeamId = this.teamId;
    //   newTimeCard.EmployeeId = this.newObj.EmployeeId;
    //   newTimeCard.PersonId = this.newObj.PersonId; 
    //   newTimeCard.EmployeeName = this.newObj.FirstName + ' ' + this.newObj.LastName;


    //   newTimeCard.PayCycleId = this.openPayPeriod.PayCycleId;
    //   newTimeCard.PayPeriodId = this.openPayPeriod.Id;   // ! get from serach bar
    //   newTimeCard.PeriodStartDate = this.openPayPeriod.PeriodStartDate;
    //   newTimeCard.PeriodEndDate = this.openPayPeriod.PeriodEndDate;
    //   newTimeCard.ProcessPeriodId = this.openPayPeriod.Id ;
    //   newTimeCard.ProcessCategory = ProcessCategory.Termination;

    //   newTimeCard.Status = 1000;
    //   newTimeCard.IsTaxBasedOnProof = true;
    //   newTimeCard.IsNewJoiner = !this.employmentContract.IsFirstMonthPayoutdone;
    //   newTimeCard.IsSalaryRevised = false;
    //   newTimeCard.FinancialYearId = this.openPayPeriod.FinancialYearId;
    //   newTimeCard.PayGroupId = this.employeeRateset.PayGroupdId;
    //   newTimeCard.EmploymentContractId = this.employmentContract.Id;
    //   newTimeCard.CostCode = this.newObj.CostCode;

    //   newTimeCard.AllowanceList = [];
    //   newTimeCard.AdjustmentList = [];
    //   newTimeCard.AttendanceList = []
    //   newTimeCard.ExpenseList = [];     

    //   this.timeCardDetails = newTimeCard;
    //   this.oldTimeCard = null;
    // }

    if (oldTimeCard != undefined && oldTimeCard != null) {
      this.timeCardDetails = oldTimeCard;
      this.oldTimeCard = _.cloneDeep(oldTimeCard);

      if (this.timeCardDetails.AllowanceList != undefined && this.timeCardDetails.AllowanceList != null
        && this.timeCardDetails.AllowanceList.length >= 0) {
        this.ff_Form.get('VariableInputs').setValue(this.timeCardDetails.AllowanceList);
        this.ff_Form.get('VariableInputs').updateValueAndValidity();
      }

      if (this.timeCardDetails.AdjustmentList != undefined && this.timeCardDetails.AdjustmentList != null
        && this.timeCardDetails.AdjustmentList.length >= 0) {
        this.ff_Form.get('AdjustmentInputs').setValue(this.timeCardDetails.AdjustmentList);
        this.ff_Form.get('AdjustmentInputs').updateValueAndValidity();
      }

      if (this.timeCardDetails.AttendanceList != undefined && this.timeCardDetails.AttendanceList != null
        && this.timeCardDetails.AttendanceList.length >= 0) {
        this.ff_Form.get('AttendanceInputs').setValue(this.timeCardDetails.AttendanceList);
        this.ff_Form.get('AttendanceInputs').updateValueAndValidity();
      }

      console.log("FF form After old timecard check::", this.ff_Form);

      this.timeCardDetails.AllowanceList.forEach(e => {
        var _reUpdateAmt = this.LstTimeCardAllowanceProducts.find(a => a.ProductId === e.ProductId);
        _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
      });
      this.timeCardDetails.AdjustmentList.forEach(e => {
        var _reUpdateAmt = this.LstTimeCardAdjustmentProducts.find(a => a.ProductId === e.ProductId)
        _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
      });


      if (this.getAttendanceStartDateFromUser) {
        this.timeCardDetails.AttendanceStartDate = moment(this.ff_Form.get('AttendanceStartDate').value).format();
      }
      else {
        this.timeCardDetails.AttendanceStartDate = this.minAttendanceStartDate;
      }



      this.onLWDChange();
    }



  }

  onLWDChange() {

    //Get Last Working Datw
    let lwd = this.ff_Form.get('CalculatedLastWorkingDate').value;
    this.lastWorkingDate = new Date(this.ff_Form.get('CalculatedLastWorkingDate').value);
    console.log("LWD", this.lastWorkingDate, lwd);


    //Set recover days based on lwd
    if (this.lastPaymentPeriod != undefined && this.lastPaymentPeriod != null) {
      if (moment(lwd) <= moment(this.lastPaymentPeriod.EndDate)) {
        this.lwdBeforeLastPayDate = true;
        this.recoveryDays = moment(this.lastPaymentPeriod.EndDate).diff(moment(lwd), "days");
        console.log("Recover ::", this.recoveryDays);
      }
      else {
        this.lwdBeforeLastPayDate = false;
      }
    }



    this.checkAndUpdateAttendanceStartDate();

    //Diable/Enable Attendace input based on lwd
    // if(this.lwdBeforeLastPayDate){
    //   this.ff_Form.get('AttendanceStartDate').disable();
    // }
    // else{
    //   this.ff_Form.get('AttendanceStartDate').enable();
    // }
    // this.ff_Form.get('AttendanceStartDate').updateValueAndValidity();

    // console.log("Attendance control ::" , this.ff_Form.get('AttendanceStartDate'));

    //Change Is nill case to false if lwd > last pay date
    // if(!this.lwdBeforeLastPayDate){
    //   this.ff_Form.get('IsNillCase').setValue(false);
    // }

    //Set Fnf PayPeriodId
    // let fnfPayPeriod = this.payPeriods.find(x => 
    //   ( moment(x.StartDate).isSameOrBefore(moment(lwd),'day') )  && 
    //   moment(lwd) <= moment(x.EndDate) );
    let fnfPayPeriod = this.payPeriods.find(x =>
      (moment(lwd).isBetween(moment(x.StartDate), moment(x.EndDate), 'day', '[]')));
    console.log("FnF Period ::", fnfPayPeriod);

    if (fnfPayPeriod != undefined && fnfPayPeriod != null) {
      this.fnfPayPeriodId = fnfPayPeriod.Id;
      this.fnfPayPeriodStartDate = fnfPayPeriod.StartDate;
    }
    else {
      this.fnfPayPeriodId = 0;
    }

    if (this.fnfPayPeriodId < this.teamOpenPayPeriodId) {
      this.fnfPayPeriodId = this.teamOpenPayPeriodId;
      this.fnfPayPeriodStartDate = this.teamPayPeriod.StartDate;
    }

    console.log("FnF Pay PeriodId ::", this.fnfPayPeriodId);

    //Set Termination End date same as last working date 
    this.ff_Form.get('TerminationEndDate').setValue(this.ff_Form.get('CalculatedLastWorkingDate').value);


    //Update Time Card Details
    if (this.timeCardDetails != undefined && this.timeCardDetails != null) {

      //Set Attendance Start Date (it changes based on lwd)
      if (this.getAttendanceStartDateFromUser) {
        this.timeCardDetails.AttendanceStartDate = moment(this.ff_Form.get('AttendanceStartDate').value).format('YYYY-MM-DD');
        this.timeCardDetails.PeriodStartDate = moment(this.ff_Form.get('AttendanceStartDate').value).format('YYYY-MM-DD');
      }
      else {
        this.timeCardDetails.AttendanceStartDate = this.minAttendanceStartDate;
        this.timeCardDetails.PeriodStartDate = this.minAttendanceStartDate;
        // this.timeCardDetails.PeriodStartDate = moment(this.ff_Form.get('ResignationDate').value).format('YYYY-MM-DD');
      }

      this.timeCardDetails.AttendanceEndDate = moment(lwd).format('YYYY-MM-DD');
      this.timeCardDetails.PeriodEndDate = moment(lwd).format('YYYY-MM-DD');
      console.log(this.timeCardDetails);

      // let AttendanceEndDate = this.timeCardDetails.AttendanceEndDate;
      // let payPeriod = this.payPeriods.find(x => moment(x.StartDate) <= moment(AttendanceEndDate) && 
      //   moment(AttendanceEndDate) <= moment(x.EndDate) );

      this.timeCardDetails.PayPeriodId = this.fnfPayPeriodId;

      //Dont understand this logic
      if (!this.lwdBeforeLastPayDate) {
        this.timeCardDetails.PeriodStartDate = moment(this.timeCardDetails.AttendanceStartDate).format('YYYY-MM-DD');
      }
      else {
        this.timeCardDetails.PeriodStartDate = moment(this.ff_Form.get('ResignationDate').value).format('YYYY-MM-DD');
      }


    }

  }

  setNoticePayDays() {
    // console.log("Notice Pay ::" , moment(this.ff_Form.get('CalculatedLastWorkingDate').value) , moment(this.ff_Form.get('AttendanceStartDate').value)); 
    if (this.getAttendanceStartDateFromUser) {
      this.ff_Form.get('NoticePeriodDays').setValue(moment(this.ff_Form.get('CalculatedLastWorkingDate').value).diff(
        moment(this.ff_Form.get('AttendanceStartDate').value), 'days') + 1)
    }
    else {
      this.ff_Form.get('NoticePeriodDays').setValue(moment(this.ff_Form.get('CalculatedLastWorkingDate').value).diff(
        moment(this.minAttendanceStartDate), 'days') + 1)
    }
  }

  patchForm() {
    console.log("Patching Form", this.eLCTransaction.EmployeeFnFTransaction);

    let fnfTrans = _.cloneDeep(this.eLCTransaction.EmployeeFnFTransaction);

    if (fnfTrans.AttendanceInputs != undefined && fnfTrans.AttendanceInputs != null) {
      fnfTrans.AttendanceInputs = JSON.parse(fnfTrans.AttendanceInputs as string);
    }
    if (fnfTrans.VariableInputs != undefined && fnfTrans.VariableInputs != null) {
      fnfTrans.VariableInputs = JSON.parse(fnfTrans.VariableInputs as string);
    }
    if (fnfTrans.AdjustmentInputs != undefined && fnfTrans.AdjustmentInputs != null) {
      fnfTrans.AdjustmentInputs = JSON.parse(fnfTrans.AdjustmentInputs as string);
    }

    this.isAllenClient ? fnfTrans.NoticePeriodDays = 0 : true;
    this.ff_Form.patchValue(fnfTrans);

    this.ff_Form.get('EnterRecoveryManuaaly').setValue(!fnfTrans.IsSystemBasedRecovery);
    this.ff_Form.get('EnterLeaveEncashManually').setValue(!fnfTrans.IsSystemBasedLeaveEncash);
    this.ff_Form.get('EnterGratuityManually').setValue(!fnfTrans.IsSystemBasedGratuity);

    if (this.isResignation) {
      this.ff_Form.get('FnFTransactionType').setValue(FnFType.Resignation);
    }
    else {
      this.ff_Form.get('FnFTransactionType').setValue(FnFType.Termination);
    }

    this.patchNoticePeriodAndRecoveryRules()


    let fnFTransactionType: FnFType = this.ff_Form.get('FnFTransactionType').value;

    if (fnFTransactionType == FnFType.Resignation) {
      this.isResignation = true;
    }
    else {
      this.isResignation = false;
    }

    this.checkAndUpdateAttendanceStartDate();

    // this.onLWDChange();
  }

  patchNoticePeriodAndRecoveryRules() {
    console.log('notice paymentRules ', this.noticePaymentRules);
    console.log('recovery rules ', this.recoveryRules);
    let payrollRuleId = this.noticePaymentRules.filter((noticePay) => noticePay.IsDefault == 1);
    let recoveryRuleId = this.recoveryRules.filter((recoveryRule) => recoveryRule.IsDefault == 1);
    if (payrollRuleId.length >= 1) {
      this.ff_Form.controls['NoticePeriodRuleId'].setValue(payrollRuleId[0].PayrollRuleId);
      this.ff_Form.controls['NoticePeriodRuleId'].disable()
    }
    if (recoveryRuleId.length >= 1) {
      this.ff_Form.controls['RecoveryRuleId'].setValue(recoveryRuleId[0].PayrollRuleId);
      this.ff_Form.controls['RecoveryRuleId'].disable();
    }
  }

  checkAndUpdateAttendanceStartDate() {

    console.log("Updating Attendance start date");

    //Get Atten start date and last working date
    let attDate = this.ff_Form.get('AttendanceStartDate').value;
    let lwd = this.ff_Form.get('CalculatedLastWorkingDate').value;

    if (attDate == undefined || attDate == null || attDate == "") {
      this.ff_Form.get('AttendanceStartDate').setValue(moment(this.minAttendanceStartDate).format('YYYY-MM-DD'));
    }

    //Diable/Enable Attendace input based on lwd
    if (this.isNillCase) {
      this.ff_Form.get('AttendanceStartDate').disable();
      this.ff_Form.get('AttendanceStartDate').setValue(moment(lwd).format('YYYY-MM-DD'));
    }
    else {
      if (this.lwdBeforeLastPayDate) {
        this.ff_Form.get('AttendanceStartDate').disable();
        this.ff_Form.get('AttendanceStartDate').setValue(moment(lwd).format('YYYY-MM-DD'));
      }
      else {

        if (moment(attDate).isBefore(moment(this.minAttendanceStartDate), 'day')) {
          this.ff_Form.get('AttendanceStartDate').setValue(moment(this.minAttendanceStartDate).format('YYYY-MM-DD'));
        }

        else if (moment(this.ff_Form.get('AttendanceStartDate').value).isAfter(moment(lwd))) {
          this.ff_Form.get('AttendanceStartDate').setValue(moment(lwd).format('YYYY-MM-DD'));
        }
        this.ff_Form.get('AttendanceStartDate').enable();

      }
    }





    // //If lwd is after last pay date , then attendance start date should not be lesser than minimum allowed attendance start date.
    // if(attDate == undefined || attDate == null || attDate == "" || ((moment(attDate)) < moment(this.minAttendanceStartDate)) && !this.lwdBeforeLastPayDate){
    //   this.ff_Form.get('AttendanceStartDate').setValue(moment(this.minAttendanceStartDate).format('YYYY-MM-DD'));  
    // }
    // // if lwd is before last pay date then make attendance start date as lwd.
    // else if((moment(attDate)) < moment(this.minAttendanceStartDate) && this.lwdBeforeLastPayDate){
    //   this.ff_Form.get('AttendanceStartDate').setValue(moment(lwd).format('YYYY-MM-DD'));
    // }

    // //If Attendace start date is greater than last working date then make attendance start date same as lwd.
    // if(moment(this.ff_Form.get('AttendanceStartDate').value) > moment(lwd)){
    //   this.ff_Form.get('AttendanceStartDate').setValue(moment(lwd).format('YYYY-MM-DD'));
    // }

    this.ff_Form.get('AttendanceStartDate').updateValueAndValidity();

  }

  fillUpStaticDetails() {
    this.patchLabels();
    if (this.newObj != undefined && this.newObj != null) {
      if (this.newObj.LeaveBalances != undefined && this.newObj.LeaveBalances != null &&
        this.newObj.LeaveBalances.length > 0) {
        this.lst_LeaveEncashment = this.newObj.LeaveBalances;
      }
      else {
        this.lst_LeaveEncashment = [];
      }
      let sumOfRecoveryAmt = 0;
      let ndcTransactionLst = this.newObj != undefined && this.newObj.NDCTransactions != undefined && this.newObj.NDCTransactions.length > 0 ? this.newObj.NDCTransactions : [];
      ndcTransactionLst.map((ndc) => {
        sumOfRecoveryAmt += ndc.RecoveryAmount
      })
      console.log('sum of recovery amt ', sumOfRecoveryAmt);

      if (this.newObj.AllowanceProducts != undefined && this.newObj.AllowanceProducts != null &&
        this.newObj.AllowanceProducts.length > 0) {
        this.LstTimeCardAllowanceProducts = this.newObj.AllowanceProducts;
      }
      else {
        this.LstTimeCardAllowanceProducts = [];
      }
      if (this.newObj.AdjustmentProducts != undefined && this.newObj.AdjustmentProducts != null &&
        this.newObj.AdjustmentProducts.length > 0) {
        this.LstTimeCardAdjustmentProducts = this.newObj.AdjustmentProducts;
      }
      else {
        this.LstTimeCardAdjustmentProducts = [];
      }

      this.LstTimeCardAllowanceProducts.forEach(element => {
        element["Id"] = 0;
        element['ExistingAmount'] = 0;
        element['NewAmount'] = 0;
        if (element.Code == this.otherDeductionproductCode) {
          element['NewAmount'] = sumOfRecoveryAmt;
        }
      });

      this.LstTimeCardAdjustmentProducts.forEach(element => {
        element["Id"] = 0;
        //element['ExistingAmount'] = 0;
        element['NewAmount'] = 0;

      });

      this.lst_LeaveEncashment.forEach(element => {
        element["Encash"] = 0;
      })


    }
  }

  patchLabels() {
    if (this.newObj != undefined && this.newObj != null) {
      this.label_EmployeeCode = this.newObj.EmployeeCode;
      this.label_EmployeeName = (this.newObj.FirstName != undefined && this.newObj.FirstName != null ? this.newObj.FirstName.trim() : "")
        + " " +
        (this.newObj.LastName != undefined && this.newObj.LastName != null ? this.newObj.LastName.trim() : "");
      if (this.newObj.ManagerPersonDetails != undefined && this.newObj.ManagerPersonDetails != null) {
        this.managerPersonDetails = this.newObj.ManagerPersonDetails;
        this.label_ManagerName =
          (this.managerPersonDetails.FirstName != undefined && this.managerPersonDetails.FirstName != null ?
            this.managerPersonDetails.FirstName.trim() : "")
          + " " +
          (this.managerPersonDetails.LastName != undefined && this.managerPersonDetails.LastName != null ?
            this.managerPersonDetails.LastName.trim() : "");
      }

      this.label_Designation = this.employmentContract != undefined && this.employmentContract != null ? this.employmentContract.Designation : '';
      this.label_ClientName = this.newObj.ClientName;
    }

  }

  updateAccessControls() {
    console.log("updating access controls");
    console.log("MenuId", this.MenuId);
    console.log(localStorage);
    console.log("Active ROle Id", sessionStorage.getItem('activeRoleId'));
    try {
      let mode = 1; // add-1, edit-2, view, 3   
      //this.isEditMode = this.Id == 0 ? true : false;
      //var isExistsGroupControl = false;
      //isExistsGroupControl = this.userAccessControl.find(x => x.GroupControlName == "Detailed" || x.GroupControlName == "Flash") != null ? true : false;
      //this.GroupControlName = this._NewCandidateDetails.LstCandidateOfferDetails[0].OnBoardingType == 2 ? "Detailed" : "Flash";
      this.uiBuilderService.doApply(mode, this, this.MenuId, "");

    } catch (Exception) {

      console.log("exception ", Exception);

    }
  }

  getNewFnFTransactionFromForm() {
    //* Set New FnF Transaction Variable
    this.newFnfTransaction = this.deepClone(this.ff_Form.getRawValue());
    this.newFnfTransaction.Status = TransactionStatus.Submitted;
    this.newFnfTransaction.EmployeeId = this.employeeId;
    this.newFnfTransaction.PayPeriodId = this.fnfPayPeriodId;

    // console.log(moment(this.newFnfTransaction.ResignationDate).format());
    // *Format the Dates to sql format
    if (this.newFnfTransaction.AttendanceStartDate != 'Invalid date') {
      this.newFnfTransaction.AttendanceStartDate = moment(this.newFnfTransaction.AttendanceStartDate).format();
    }

    this.newFnfTransaction.ResignationDate = moment(this.newFnfTransaction.ResignationDate).format();
    this.newFnfTransaction.CalculatedLastWorkingDate = moment(this.newFnfTransaction.CalculatedLastWorkingDate).format();
    this.newFnfTransaction.RequestedLastWorkingDate = moment(this.newFnfTransaction.RequestedLastWorkingDate).format();
    this.newFnfTransaction.TerminationStartDate = moment(this.newFnfTransaction.TerminationStartDate).format('YYYY-MM-DD');
    this.newFnfTransaction.TerminationEndDate = moment(this.newFnfTransaction.TerminationEndDate).format('YYYY-MM-DD');
    // this.newFnfTransaction.ResignationDate = 

    // *Serialize Variable Inputs 
    this.newFnfTransaction.AttendanceInputs = JSON.stringify(this.newFnfTransaction.AttendanceInputs);
    this.newFnfTransaction.VariableInputs = JSON.stringify(this.newFnfTransaction.VariableInputs);
    this.newFnfTransaction.AdjustmentInputs = JSON.stringify(this.newFnfTransaction.AdjustmentInputs);
  }

  submit(isApproved: boolean, postWorkflowRequest: boolean, saveTimeCard: boolean, createTimeCard: boolean = false, updateContractStatus: boolean = false) {
    console.log(this.ff_Form);
    this.submitted = true;

    if (this.ff_Form.invalid) {
      this.alertService.showWarning("Oops! Please fill in all required fields ")
      return;
    }


    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed?",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ok!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.uploadELCModel(isApproved, postWorkflowRequest, saveTimeCard, createTimeCard, updateContractStatus);

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })


  }

  uploadELCModel(isApproved: boolean, postWorkflow: boolean, saveTimeCard: boolean, createTimeCard: boolean = false, updateContractStatus: boolean = false) {
    this.loadingScreenService.startLoading();


    if (this.isNillCase) {
      let AttendanceList: any[] = [];
      if (environment.environment.InsertLOPForNillCaseTermination == undefined || environment.environment.InsertLOPForNillCaseTermination == true) {
        var attendance = new Attendance();
        attendance.TimeCardId = this.timeCardDetails != undefined && this.timeCardDetails != null ? this.timeCardDetails.Id : 0;
        attendance.Type = 0;
        attendance.Id = 0;
        attendance.FromDate = moment(this.ff_Form.get('CalculatedLastWorkingDate').value).format('YYYY-MM-DD');
        attendance.ToDate = moment(this.ff_Form.get('CalculatedLastWorkingDate').value).format('YYYY-MM-DD');
        attendance.IsFirstDayHalf = false;
        attendance.NumberOfDays = 1;
        attendance.ReferencedTimeCardId = 0;

        attendance.Modetype = UIMode.Edit;
        AttendanceList.push(attendance);
      }
      for (let oldAttendance of this.ff_Form.get('AttendanceInputs').value) {
        if (oldAttendance.Id > 0) {
          let newAttendance = AttendanceList.find(x => oldAttendance.Id == x.Id);

          if (newAttendance == undefined || newAttendance == null) {
            oldAttendance.Modetype = UIMode.Delete;
            AttendanceList.push(oldAttendance);
          }
        }
      }

      this.ff_Form.get('AttendanceInputs').setValue(AttendanceList);

    }

    this.getNewFnFTransactionFromForm();


    if (this.roleCode == 'PayrollAdmin' || this.roleCode == 'OpsMember' || this.roleCode == 'PayrollOps' && saveTimeCard) {
      this.newFnfTransaction.Status = TransactionStatus.SentForTimeCardProcess;
    }
    console.log("New FnF Transaction", this.newFnfTransaction);

    this.newFnfTransaction.TerminationReason == null ? this.newFnfTransaction.TerminationReason = 0 : true;
    // this.newFnfTransaction.ResignationReason == null ? this.newFnfTransaction.ResignationReason = 0 : true;

    if (this.eLCTransaction == undefined || this.eLCTransaction == null) {
      this.newELCTransaction = new EmployeeLifeCycleTransaction();
      this.newELCTransaction = Object.assign({}, _EmployeeLifeCycleTransaction);
      this.newELCTransaction.Modetype = UIMode.Edit;
      this.newELCTransaction.EmployeeId = this.employeeId;
      this.newELCTransaction.ELCTransactionTypeId = this.isResignation ? ELCTRANSACTIONTYPE.Resignation : ELCTRANSACTIONTYPE.Termination;
      this.newELCTransaction.EmployeeFnFTransaction = this.newFnfTransaction;
      this.newELCTransaction.EmploymentContractId = this.employmentContract.Id;
      this.newELCTransaction.CompanyId = this.companyId;
      this.newELCTransaction.ClientId = this.clientId;
      this.newELCTransaction.ClientContractId = this.clientContractId;
      this.newELCTransaction.Designation = this.employmentContract.Designation;
    }
    else {
      this.newELCTransaction = this.eLCTransaction;
      this.eLCTransaction.EmployeeFnFTransaction = this.newFnfTransaction;
    }

    this.newELCTransaction.Modetype = UIMode.Edit;

    delete this.newELCTransaction.DOB;

    this.elcMOdel.newELCobj = this.newELCTransaction;
    this.elcMOdel.Id = 0,
      this.elcMOdel.oldELCobj = null;
    this.elcMOdel.OldELCId = 0;
    this.elcMOdel.OldRateSetId = 0;
    this.elcMOdel.UpdateContractStatus = false;
    //this.elcMOdel = new EmployeeLifeCycleTransactionModel();

    console.log("ELC Model", this.elcMOdel);

    // if(updateContractStatus){
    //   this.elcMOdel.UpdateContractStatus = true;
    //   if(this.employmentContract != undefined && this.employmentContract != null){
    //     this.elcMOdel.newELCobj.EmploymentContractId =  this.employmentContract.Id;
    //   }
    // }
    this.employeeService.put_ELCTransaction(this.elcMOdel).subscribe((response) => {

      this.loadingScreenService.stopLoading();
      let apiResult: apiResult = response;
      var _NewELCTransaction: EmployeeLifeCycleTransaction = apiResult.Result as any;
      console.log('NEW ELC OBJECT FROM API RESPONSE ::', _NewELCTransaction);

      if (this.ff_Form.get('Id').value == 0) {
        const id = _NewELCTransaction && _NewELCTransaction.EmployeeFnFTransaction ?
          _NewELCTransaction.EmployeeFnFTransaction.Id : this.ff_Form.get('Id').value;
        this.ff_Form.get('Id').setValue(id);
      }
      if (this.eLCTransaction == undefined && this.eLCTransaction == null) {
        this.eLCTransaction = _NewELCTransaction;
      }

      console.log(apiResult);


      if (apiResult.Status) {

        // IF THE USER CLICK ON SUBMIT WE CALL THE WORKFLOW ACTION
        if (postWorkflow) {

          let employeeUserId: number = null;

          if (this.EmployeeObject != null && this.EmployeeObject != undefined && this.EmployeeObject.UserId != undefined &&
            this.EmployeeObject.UserId != null) {
            employeeUserId = this.EmployeeObject.UserId;
          }

          let jsonDependentObj = {
            "CompanyId": this.companyId,
            "ClientId": this.clientId,
            "ClientContractId": this.clientContractId,
            "RoleCode": this.currentRole.Code,
            "UserId": employeeUserId != null ? employeeUserId : this.userId,
            "MoveDirection": isApproved ? 'Forward' : 'Backward',
            "EmployeeLifeCycleTransaction": _NewELCTransaction
          }

          this.setProcessStatusIds();

          this.workFlowInitiation = new WorkFlowInitiation();

          this.workFlowInitiation.Remarks = "";
          this.workFlowInitiation.EntityId = this.newELCTransaction.EmployeeId;
          this.workFlowInitiation.EntityType = EntityType.Employee;
          this.workFlowInitiation.CompanyId = this.companyId;
          this.workFlowInitiation.ClientContractId = this.clientContractId;
          this.workFlowInitiation.ClientId = this.clientId;

          this.workFlowInitiation.ActionProcessingStatus = this.processStatusId;
          this.workFlowInitiation.ImplementationCompanyId = this.implementationCompanyId;
          this.workFlowInitiation.WorkFlowAction = this.newELCTransaction.Id == 0 ? 17 : 18;
          this.workFlowInitiation.RoleId = this.currentRole.Id;
          this.workFlowInitiation.DependentObject = jsonDependentObj;
          this.workFlowInitiation.UserInterfaceControlLst = {
            AccessControlId: 0, AccessControlTypeName: null, AccessControlTypePropertyId
              : 0, AddValue: null, ControlName: null, EditValue: null, MenuId: 0, ParentControlId: 0, PropertyName: null, PropertyType: 0,
            ViewValue: null
          };

          this.finalSubmit(this.workFlowInitiation);
        }
        if (createTimeCard) {
          // this.createTimeCard(this.employeeId);
        }
        if (saveTimeCard) {

          if (updateContractStatus && this.timeCardDetails != null) {
            this.loadingScreenService.startLoading();
            this.employeeService.MarkEmployeeForSeparation(this.newFnfTransaction).subscribe(result => {
              this.loadingScreenService.stopLoading();
              if (result.Status) {
                console.log("Employee marked for separation ", result);
                this.saveTimeCardDetails();
              }
              else {
                this.alertService.showWarning("Error Occured while marking employee for separation. Error ->" + result.Message);
              }
            }, error => {
              this.loadingScreenService.stopLoading();
            })
          }
          else if (updateContractStatus) {
            console.log("Updating contract alone");
            this.loadingScreenService.startLoading();
            this.employeeService.MarkEmployeeForSeparation(this.newFnfTransaction).subscribe(result => {
              this.loadingScreenService.stopLoading();
              if (result.Status) {
                console.log("Employee marked for separation ", result);
                if (this.roleCode == 'PayrollAdmin' || this.roleCode == 'OpsMember' || this.roleCode == 'PayrollOps' || this.roleCode == 'RegionalHR') {

                  let searchObject: searchObject = {
                    ClientName: this.newObj.ClientName,
                    ContractName: this.newObj.ClientContractName,
                    TeamName: this.newObj.TeamName,
                    PayPeriodName: this.teamPayPeriodName
                  }

                  this.rowDataService.dataInterface.SearchElementValuesList = [
                    {
                      InputFieldName: "",
                      OutputFieldName: "@clientId",
                      Value: this.clientId.toString()
                    },
                    {
                      InputFieldName: "",
                      OutputFieldName: "@clientcontractId",
                      Value: this.clientContractId.toString()
                    },
                    {
                      InputFieldName: "",
                      OutputFieldName: "@teamId",
                      Value: this.teamId.toString()
                    },
                    {
                      InputFieldName: "",
                      OutputFieldName: "@payperiodId",
                      Value: this.teamOpenPayPeriodId.toString()
                    },
                  ]

                  this.rowDataService.dataInterface.SearchObject = searchObject;

                  this.router.navigate(["app/fnf/fnftransaction"]);
                }
              }
              else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning("Error Occured while marking employee for separation. Error ->" + result.Message);
              }
            }, error => {

            })
          }
          else if (this.timeCardDetails != null) {
            this.saveTimeCardDetails();
          }
          else {
            this.alertService.showSuccess(apiResult.Message);
            if (this.roleCode == 'PayrollAdmin' || this.roleCode == 'OpsMember' || this.roleCode == 'PayrollOps' || this.roleCode == 'RegionalHR') {

              let searchObject: searchObject = {
                ClientName: this.newObj.ClientName,
                ContractName: this.newObj.ClientContractName,
                TeamName: this.newObj.TeamName,
                PayPeriodName: this.teamPayPeriodName
              }

              this.rowDataService.dataInterface.SearchElementValuesList = [
                {
                  InputFieldName: "",
                  OutputFieldName: "@clientId",
                  Value: this.clientId.toString()
                },
                {
                  InputFieldName: "",
                  OutputFieldName: "@clientcontractId",
                  Value: this.clientContractId.toString()
                },
                {
                  InputFieldName: "",
                  OutputFieldName: "@teamId",
                  Value: this.teamId.toString()
                },
                {
                  InputFieldName: "",
                  OutputFieldName: "@payperiodId",
                  Value: this.teamOpenPayPeriodId.toString()
                },
              ]

              this.rowDataService.dataInterface.SearchObject = searchObject;

              this.router.navigate(["app/fnf/fnftransaction"]);
            }
          }



        }
        if (!postWorkflow && !saveTimeCard && !createTimeCard) {
          this.alertService.showSuccess(apiResult.Message);
        }
        if (!postWorkflow && saveTimeCard && !createTimeCard) {
          this.alertService.showSuccess(apiResult.Message);
        }
      }
      else {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(apiResult.Message);
        this.router.navigate(["app/fnf/fnftransaction"]);
      }


    },
      (err) => {
        console.error(err);
        this.loadingScreenService.stopLoading();
      });
  }

  finalSubmit(workFlowJsonObj: WorkFlowInitiation): void {

    console.log(workFlowJsonObj);
    this.loadingScreenService.startLoading();
    this.employeeService.post_FnFWorkflow(JSON.stringify(workFlowJsonObj)).subscribe((response) => {
      this.loadingScreenService.stopLoading();
      console.log(response);

      try {

        let apiResult: apiResult = response;
        if (apiResult.Status && apiResult.Result != null) {

          this.loadingScreenService.stopLoading();
          this.router.navigate(['/app/dashboard']);
          this.alertService.showSuccess(`Your request has been submitted successfully! ` + apiResult.Message != null ? apiResult.Message : '');


        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(`An error occurred while trying to submit!  ` + apiResult.Message != null ? apiResult.Message : '');
          this.router.navigate(["app/fnf/fnftransaction"]);

        }

      } catch (error) {
        this.loadingScreenService.stopLoading();
        this.alertService.showWarning(`An error occurred while trying to submit!` + error);
        this.router.navigate(["app/fnf/fnftransaction"]);

      }


    }), ((error) => {

    });


  }

  markEmployeeForSeparation() {

    //Validate salary timecard
    if (this.salaryTimeCard.PayRunId > 0) {
      this.alertService.showInfo("Employee has beem added to salary payrun. Please remove the employee from payrun and try again.");
      return;
    }

    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: true,
    })

    swalWithBootstrapButtons.fire({
      title: 'Confirm?',
      text: "Are you sure you want to proceed? By proceeding employee will be marked for separation.",
      type: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes!',
      cancelButtonText: 'No, cancel!',
      allowOutsideClick: false,
      reverseButtons: true
    }).then((result) => {
      console.log(result);

      if (result.value) {

        this.loadingScreenService.startLoading();
        let employeefnfTransaction: EmployeeFnFTransaction;
        employeefnfTransaction = this.deepClone(this.ff_Form.getRawValue());
        employeefnfTransaction.EmployeeId = this.employeeId;
        employeefnfTransaction.CalculatedLastWorkingDate = moment(employeefnfTransaction.CalculatedLastWorkingDate).format();

        // *Serialize Variable Inputs 
        employeefnfTransaction.AttendanceInputs = JSON.stringify(employeefnfTransaction.AttendanceInputs);
        employeefnfTransaction.VariableInputs = JSON.stringify(employeefnfTransaction.VariableInputs);
        employeefnfTransaction.AdjustmentInputs = JSON.stringify(employeefnfTransaction.AdjustmentInputs);

        this.employeeService.MarkEmployeeForSeparation(employeefnfTransaction).subscribe(result => {
          this.loadingScreenService.stopLoading();
          if (result.Status) {
            // console.log("Employee marked for separation and salary payment is cancelled successfully" , result);
            this.alertService.showSuccess("Employee has been marked for separation and salary payment is cancelled successfully");
          }
          else {
            this.alertService.showWarning("Error Occured while marking employee for separation. Error ->" + result.Message);
            console.log(result);
          }
        }, error => {
          this.alertService.showWarning("Error Occured! Something went wrong");
          console.error(error);
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {

        swalWithBootstrapButtons.fire(
          'Cancelled',
          'Your request has been cancelled',
          'error'
        )
      }
    })


  }

  voidSalaryTimeCard() {
    let fnftransaction: EmployeeFnFTransaction = _.cloneDeep(this.newFnfTransaction);
    fnftransaction.IsStopSalaryforAll = false;
    fnftransaction.StopSalaryDetails = [];
    fnftransaction.StopSalaryDetails.push(new PayoutInformationDetails());
    fnftransaction.StopSalaryDetails[0].PayTransactionId = this.salaryTimeCard.PayTransactionId;
    fnftransaction.StopSalaryDetails[0].PayPeriodId = this.salaryTimeCard.PayPeriodId;
    fnftransaction.StopSalaryDetails[0].AcknowledgmentDetail = "";

    console.log("FF ::", fnftransaction);

    this.payrollService.VoidSalaryTimeCard(fnftransaction).subscribe(
      data => {
        if (data.Status) {
          this.alertService.showSuccess("Timecard voided for Pay Period ::" + this.teamPayPeriodName);
        }
        else {
          this.alertService.showWarning(data.Message);
        }
        console.log(data);
      },
      error => {
        this.alertService.showWarning("Unexpected error occured! Please try again.")
      }
    )
  }


  setProcessStatusIds() {

    if (this.currentRole.Code == 'Employee') {
      //this.processStatusIds = ["21000"]
      this.processStatusId = 20000
    }
    if (this.currentRole.Code == 'Manager') {
      //this.processStatusIds = ["21000"]
      this.processStatusId = 20500
    }
    else if (this.currentRole.Code == 'LocationHR') {
      this.processStatusId = 21200;
    }
    else if (this.currentRole.Code == 'ClientSpoc') {

      this.processStatusId = 22600;
    }
    else if (this.currentRole.Code == 'PayrollAdmin' || this.currentRole.Code == 'OpsMember' ||
      this.currentRole.Code == 'PayrollOps') {

      this.processStatusId = 23300;
    }

    console.log("Process Id :: ", this.processStatusId);
  }

  deepClone(value: any) {
    let clonedValue = _.cloneDeep(value);
    return clonedValue;
  }

  onIndexChange(index: any): void {
    console.log("Changing index");
    this.index = index.target.textContent == "Resignation Details" ? 0 : index.target.textContent == "Notice Period" ? 1 :
      index.target.textContent == "Leave Encashment" ? 2 : index.target.textContent == "Variable and gratuity" ? 3 : index.target.textContent == "Pay Process" ? 4 : 0
  }
  //1, 2,  

  onChangeEncash(event: any, item: any): void {
    console.log('event', event);
    console.log('item', item);
    if (Number(event) > item.ClosingBalance) {

      this.ff_Form.get('LeaveEncashmentDays').setValue(0);
      this.alertService.showWarning('Note : Please verify that the encash units do not exceed the balance.')
      return;
    }
    this.lst_LeaveEncashment.find(a => a.Id == item.Id).Encash = Number(event);
    console.log(this.lst_LeaveEncashment);

    let sum = 0;
    this.lst_LeaveEncashment.forEach(e => { sum += parseInt(e.Encash) })
    this.ff_Form.get('LeaveEncashmentDays').setValue(sum);

  }

  getTotalCount() {
    let sum = 0;
    this.lst_LeaveEncashment.forEach(e => { sum += parseInt(e.Encash) })
    this.ff_Form.get('Leave')

    return sum;
  }

  onChangeAmount(event: any, item: any) {

  }


  async next() {
    // this.index += 1;
    let valid: boolean = await this.field_validate(false);



    if (valid) {

      // if(this.index == 1){
      //   if(this.timeCardDetails == null){

      //     const swalWithBootstrapButtons = Swal.mixin({
      //       customClass: {
      //         confirmButton: 'btn btn-primary',
      //         cancelButton: 'btn btn-danger'
      //       },
      //       buttonsStyling: true,
      //     })

      //     swalWithBootstrapButtons.fire({
      //       title: 'Confirm?',
      //       text: "Going Forward will mark the employee as FnF! Are you sure you want to proceed?",
      //       type: 'warning',
      //       showCancelButton: true,
      //       confirmButtonText: 'Yes!',
      //       cancelButtonText: 'No, cancel!',
      //       allowOutsideClick: false,
      //       reverseButtons: true
      //     }).then((result) => {
      //       console.log(result);
      //       if (result.value) {
      //         this.uploadELCModel(false,false,false,true,true);
      //       } else if (result.dismiss === Swal.DismissReason.cancel) {
      //       }
      //     })

      //   }
      //   else{
      //     this.index += 1 ;
      //   }
      // }
      // else {
      //   this.index += 1 ;
      // }
      this.index += 1;
      this.submitted = false;
    }
  }

  async prev() {
    // this.index -= 1;
    let valid: boolean = await this.field_validate(true);
    if (valid) {
      this.index -= 1;
      this.submitted = false;
    }
  }

  field_validate(isPrev?) {
    this.submitted = true;
    if (this.isResignation) {
      if (this.index == 0) {
        console.log('ffdf', this.ff_Form.value);

        this.lst_StaticValidationKeys.forEach(key => {
          this.index == 0 && key.index == 0 && key.Type == 'Resignation' ? (this.ff_Form.controls[key.control].setValidators([Validators.required]), this.ff_Form.controls[key.control].updateValueAndValidity()) :
            (this.ff_Form.controls[key.control].clearValidators(),
              this.ff_Form.controls[key.control].setErrors(null))
        });
      }
      if (this.index == 1) {
        this.lst_StaticValidationKeys.forEach(key => {
          this.index == 1 && key.index == 1 && key.Type == 'Resignation' && !isPrev ? (this.ff_Form.controls[key.control].setValidators([Validators.required]), this.ff_Form.controls[key.control].updateValueAndValidity()) :
            (this.ff_Form.controls[key.control].clearValidators(),
              this.ff_Form.controls[key.control].setErrors(null))
        });
      }
    }
    else {
      if (this.index == 0) {
        this.lst_StaticValidationKeys.forEach(key => {
          this.index == 0 && key.index == 0 && key.Type == 'Termination' ? (this.ff_Form.controls[key.control].setValidators([Validators.required]), this.ff_Form.controls[key.control].updateValueAndValidity()) :
            (this.ff_Form.controls[key.control].clearValidators(),
              this.ff_Form.controls[key.control].setErrors(null))
        });
      }
      if (this.index == 1) {
        this.lst_StaticValidationKeys.forEach(key => {
          this.index == 1 && key.index == 1 && key.Type == 'Termination' && !isPrev ? (this.ff_Form.controls[key.control].setValidators([Validators.required]), this.ff_Form.controls[key.control].updateValueAndValidity()) :
            (this.ff_Form.controls[key.control].clearValidators(),
              this.ff_Form.controls[key.control].setErrors(null))
        });
      }
    }

    if (this.index == 0) {
      const today = new Date();
      const dateToCheck = new Date(this.ff_Form.get('CalculatedLastWorkingDate').value);
      if (dateToCheck.toString() == ('Invalid Date').toString()) {
        this.alertService.showWarning("Last Working Date is required");
        return;
      }
    }

    console.log('validate', this.ff_Form.get('RecoveryDays').valid);

    if (this.ff_Form.invalid) {
      this.alertService.showWarning("Oops! Please fill in all required fields ")
      console.log(this.ff_Form);
      return false
    } else {
      return true;
    };

  }

  public findInvalidControls() {
    const invalid = [];
    const controls = this.ff_Form.controls;
    for (const name in controls) {
      if (controls[name].invalid) {
        invalid.push(name);
      }
    }
    console.log('INVALID FORMS FIELDS', invalid);
    return invalid;
  }

  createTimeCard(employeeId: number) {

    console.log("Creating time card");
    this.loadingScreenService.startLoading();
    this.payrollService.get_TerminationTimeCardDetails(employeeId).subscribe((data) => {
      console.log("Termination time card ::", data);
      this.loadingScreenService.stopLoading();
      if (data.Status == true && data.Result != undefined && data.Result != null) {
        this.timeCardDetails = data.Result;
        this.oldTimeCard = this.deepClone(data.Result);



        this.timeCardDetails.AllowanceList.forEach(e => {
          var _reUpdateAmt = this.LstTimeCardAllowanceProducts.find(a => a.ProductId === e.ProductId);
          _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
        });
        this.timeCardDetails.AdjustmentList.forEach(e => {
          var _reUpdateAmt = this.LstTimeCardAdjustmentProducts.find(a => a.ProductId === e.ProductId)
          _reUpdateAmt != undefined && (_reUpdateAmt.ExistingAmount = e.PayUnitValue, _reUpdateAmt.Id = e.Id);
        });


        if (this.getAttendanceStartDateFromUser) {
          this.timeCardDetails.AttendanceStartDate = moment(this.ff_Form.get('AttendanceStartDate').value).format();
        }
        else {
          this.timeCardDetails.AttendanceStartDate = this.minAttendanceStartDate;
        }


        this.onLWDChange();

        // this.timeCardDetails.AttendanceEndDate = this.ff_Form.get('CalculatedLastWorkingDate').value;  
        // this.timeCardDetails.PeriodEndDate = this.ff_Form.get('CalculatedLastWorkingDate').value;

        // let AttendanceEndDate = this.timeCardDetails.AttendanceEndDate;

        // let payPeriod = this.payPeriods.find(x => moment(x.StartDate) <= moment(AttendanceEndDate) && 
        //   moment(AttendanceEndDate) <= moment(x.EndDate) );

        // console.log("PayPeriod" , payPeriod)  

        // if(payPeriod != undefined && payPeriod != null)  {
        //   this.payPeriodId = payPeriod.Id;
        //   this.timeCardDetails.PayPeriodId = this.payPeriodId;
        //   this.timeCardDetails.PeriodStartDate = payPeriod.StartDate;
        // }


        this.viewDate = new Date(this.timeCardDetails.AttendanceStartDate);
        this.minDate = new Date(this.timeCardDetails.AttendanceStartDate);
        this.maxDate = new Date(this.timeCardDetails.AttendanceEndDate);

        if (this.index == 1) {
          this.index += 1;
        }
      }
      else {
        this.timeCardDetails = null
        this.alertService.showWarning("Sorry Could not get Time card details! Try Again");
      }

    }, error => {
      this.loadingScreenService.stopLoading();
      console.error(error);
    })



  }



  saveTimeCardDetails() {
    this.loadingScreenService.startLoading();
    // var AllowanceList = [];
    // var AdjustmentList = [];
    // var AttendanceList = [];

    // this.LstTimeCardAllowanceProducts != null && 
    // this.LstTimeCardAllowanceProducts.length > 0 && 
    // this.LstTimeCardAllowanceProducts.forEach(element => {

    //   if (element.NewAmount > 0) {
    //     var allowance = new Allowance();
    //     allowance.TimeCardId = this.timeCardDetails != null ? this.timeCardDetails.Id : 0;
    //     allowance.Type = 0;
    //     allowance.Id = element.Id != 0 ? element.Id : 0,
    //     allowance.ProductCode = element.Code;
    //     allowance.ProductId = element.ProductId;
    //     allowance.PayQuantity = 1;
    //     allowance.PayUnitType = 1;
    //     allowance.PayUnitValue = element.NewAmount;
    //     allowance.Status = true;
    //     allowance.Remarks = '';
    //     allowance.Modetype = UIMode.Edit;
    //     AllowanceList.push(allowance)
    //   }
    // });


    // this.LstTimeCardAdjustmentProducts != null && 
    // this.LstTimeCardAdjustmentProducts.length > 0 && 
    // this.LstTimeCardAdjustmentProducts.forEach(element => {
    //   if (element.NewAmount > 0) {
    //     var adjustment = new Adjustment();
    //     adjustment.TimeCardId = this.timeCardDetails.Id;
    //     adjustment.Type = 0;
    //     adjustment.Id = element.Id != 0 ? element.Id : 0;
    //     adjustment.PayQuantity = 1;
    //     adjustment.PayUnitType = 1;
    //     adjustment.PayUnitValue = element.NewAmount;
    //     adjustment.ProductId = element.ProductId;
    //     adjustment.BillQuantity = 0;
    //     adjustment.BillUnitType = 1;
    //     adjustment.BillUnitValue = 0;
    //     adjustment.ImpingeOnRevision = false;
    //     adjustment.Remarks = '';
    //     adjustment.Status = true;
    //     adjustment.ProductTypeId = 0.;
    //     adjustment.Modetype = UIMode.Edit;
    //     AdjustmentList.push(adjustment);
    //   }
    // });

    this.timeCardDetails.AttendanceList = this.ff_Form.get('AttendanceInputs').value;
    this.timeCardDetails.AllowanceList = this.ff_Form.get('VariableInputs').value;
    this.timeCardDetails.AdjustmentList = this.ff_Form.get('AdjustmentInputs').value;


    if (this.isNillCase) {
      this.timeCardDetails.IsNilCasePayment = true;
      this.timeCardDetails.PeriodStartDate = this.timeCardDetails.AttendanceStartDate;
      this.timeCardDetails.PeriodEndDate = this.timeCardDetails.AttendanceStartDate;
    }
    else {
      this.timeCardDetails.IsNilCasePayment = false;

    }

    // AllowanceList.length > 0 && (this.timeCardDetails.AllowanceList = AllowanceList);
    // AdjustmentList.length > 0 && (this.timeCardDetails.AdjustmentList = AdjustmentList);
    // AttendanceList.length > 0 && (this.timeCardDetails.AttendanceList = AttendanceList);



    this.timeCardDetails.Modetype = UIMode.Edit;
    this.timeCardDetails.Status = TimeCardStatus.Initiated;

    let timecardModel: TimeCardModel;
    timecardModel = _TimeCardModel;
    timecardModel.NewDetails = this.timeCardDetails;
    timecardModel.OldDetails = this.oldTimeCard != undefined || this.oldTimeCard != null ? this.oldTimeCard : {};
    // console.log("Time Card" , JSON.stringify(timecardModel));



    console.log(' this.TimeCardModel', timecardModel);

    this.payrollService.put_SaveTimeCardDetails(timecardModel)
      .subscribe((result) => {
        console.log("Time Card save result", result);
        const apiResult: apiResult = result;
        this.loadingScreenService.stopLoading();
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          if (this.roleCode == 'PayrollAdmin' || this.roleCode == 'OpsMember' || this.roleCode == 'PayrollOps') {

            let searchObject: searchObject = {
              ClientName: this.newObj.ClientName,
              ContractName: this.newObj.ClientContractName,
              TeamName: this.newObj.TeamName,
              PayPeriodName: this.teamPayPeriodName
            }

            this.rowDataService.dataInterface.SearchElementValuesList = [
              {
                InputFieldName: "",
                OutputFieldName: "@clientId",
                Value: this.clientId.toString()
              },
              {
                InputFieldName: "",
                OutputFieldName: "@clientcontractId",
                Value: this.clientContractId.toString()
              },
              {
                InputFieldName: "",
                OutputFieldName: "@teamId",
                Value: this.teamId.toString()
              },
              {
                InputFieldName: "",
                OutputFieldName: "@payperiodId",
                Value: this.teamOpenPayPeriodId.toString()
              },
            ]

            this.rowDataService.dataInterface.SearchObject = searchObject;

            this.router.navigate(["app/fnf/fnftransaction"]);
          }
        } else {
          this.alertService.showWarning("Could not save time card details! Error -" + apiResult.Message);
        }
      }, err => {
        this.loadingScreenService.stopLoading();
      })

  }

  saveVariableSliderDetails() {

    try {


      var AttendanceList = [];
      var AllowanceList = [];
      var AdjustmentList = [];

      this.LstTimeCardAllowanceProducts != null &&
        this.LstTimeCardAllowanceProducts.length > 0 &&
        this.LstTimeCardAllowanceProducts.forEach(element => {

          if (element.NewAmount > 0) {
            var allowance = new Allowance();
            allowance.TimeCardId = this.timeCardDetails != null && this.timeCardDetails != undefined ? this.timeCardDetails.Id : 0;
            allowance.Type = 0;
            allowance.Id = element.Id != 0 ? element.Id : 0,
              allowance.ProductCode = element.Code;
            allowance.ProductId = element.ProductId;
            allowance.PayQuantity = 1;
            allowance.PayUnitType = 1;
            allowance.PayUnitValue = element.NewAmount;
            allowance.Status = true;
            allowance.Remarks = '';
            allowance.Modetype = UIMode.Edit;
            AllowanceList.push(allowance)
          }
        });

      for (let oldAllowance of this.ff_Form.get('VariableInputs').value) {
        if (oldAllowance.Id > 0) {
          let newAllowance = AllowanceList.find(x => oldAllowance.Id == x.Id);

          if (newAllowance == undefined || newAllowance == null) {
            oldAllowance.Modetype = UIMode.Delete;
            AllowanceList.push(oldAllowance);
          }
        }
      }

      this.LstTimeCardAdjustmentProducts != null &&
        this.LstTimeCardAdjustmentProducts.length > 0 &&
        this.LstTimeCardAdjustmentProducts.forEach(element => {
          if (element.NewAmount !== 0) {
            var adjustment = new Adjustment();
            adjustment.TimeCardId = this.timeCardDetails != null && this.timeCardDetails != undefined ? this.timeCardDetails.Id : 0;
            adjustment.Type = 0;
            adjustment.Id = element.Id != 0 ? element.Id : 0;
            adjustment.PayQuantity = 1;
            adjustment.PayUnitType = 1;
            adjustment.PayUnitValue = element.NewAmount;
            adjustment.ProductId = element.ProductId;
            adjustment.BillQuantity = 0;
            adjustment.BillUnitType = 1;
            adjustment.BillUnitValue = 0;
            adjustment.ImpingeOnRevision = false;
            adjustment.Remarks = '';
            adjustment.Status = true;
            adjustment.ProductTypeId = element.ProductTypeId;
            adjustment.Modetype = UIMode.Edit;
            AdjustmentList.push(adjustment);
          }
        });

      for (let oldAdjustment of this.ff_Form.get('AdjustmentInputs').value) {
        if (oldAdjustment.Id > 0) {
          let newAdjustment = AdjustmentList.find(x => oldAdjustment.Id == x.Id);

          if (newAdjustment == undefined || newAdjustment == null) {
            oldAdjustment.Modetype = UIMode.Delete;
            AdjustmentList.push(oldAdjustment);
          }
        }
      }

      console.log("Events ::", this.events);
      this.events != null && this.events.length > 0 && this.events.forEach((element: any) => {

        if (element.color === colors.red) {
          var attendance = new Attendance();
          attendance.TimeCardId = this.timeCardDetails != null && this.timeCardDetails != undefined ? this.timeCardDetails.Id : 0;
          attendance.Type = 0;
          attendance.Id = element.id as number;
          attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance.IsFirstDayHalf = element.meta.IsFirstDayHalf;
          attendance.NumberOfDays = element.meta.IsFirstDayHalf == true ? 0.5 : 1;
          attendance.ReferencedTimeCardId = 0;

          attendance.Modetype = UIMode.Edit;
          AttendanceList.push(attendance);
        } else if (element.id > 0) {
          var attendance = new Attendance();
          attendance.TimeCardId = this.timeCardDetails != null && this.timeCardDetails != undefined ? this.timeCardDetails.Id : 0;
          attendance.Type = 0;
          attendance.Id = element.id as number;
          attendance.FromDate = moment(element.start).format('YYYY-MM-DD');
          attendance.ToDate = moment(element.end).format('YYYY-MM-DD');
          attendance.IsFirstDayHalf = false;
          attendance.NumberOfDays = 1;
          attendance.ReferencedTimeCardId = 0;
          attendance.Modetype = UIMode.Delete;
          AttendanceList.push(attendance);
        }

      });


      for (let oldAttendance of this.ff_Form.get('AttendanceInputs').value) {
        if (oldAttendance.Id > 0) {
          let newAttendance = AttendanceList.find(x => oldAttendance.Id == x.Id);

          if (newAttendance == undefined || newAttendance == null) {
            oldAttendance.Modetype = UIMode.Delete;
            AttendanceList.push(oldAttendance);
          }
        }
      }

      // for(let oldAttendance of this.timeCardDetails.AttendanceList){
      //   let newAttendance  = AttendanceList.find(x => oldAttendance.Id == x.Id);

      //   if(newAttendance == undefined || newAttendance == null){
      //     oldAttendance.Modetype = UIMode.Delete;
      //     AttendanceList.push(oldAttendance);
      //   }

      // }
      // if(this.timeCardDetails != undefined && this.timeCardDetails != null){
      //   AttendanceList.length > 0 && (this.timeCardDetails.AttendanceList = AttendanceList);
      // }
      AllowanceList.length > 0 && (this.ff_Form.get('VariableInputs').setValue(AllowanceList));
      AdjustmentList.length > 0 && (this.ff_Form.get('AdjustmentInputs').setValue(AdjustmentList));
      AttendanceList.length > 0 && (this.ff_Form.get('AttendanceInputs').setValue(AttendanceList));

      this.events = null;

      this._slider_activeTabName = "salaryInput";
      this.variableInput_Slider = false;

      console.log("Saved TimeCard ::", this.timeCardDetails);
      console.log("Saved FnF ::", this.ff_Form.getRawValue());
    }
    catch (error) {
      console.log('ERR ::', error);

    }

  }

  calculatePayroll() {
    this.do_process_TimeCard();
  }

  do_process_TimeCard(): void {
    let LstProceeTimeCards = [];
    let processedEMP = [];

    if (this.timeCardDetails != null) {

      this.loadingScreenService.startLoading();

      console.log("Time Card", this.timeCardDetails);

      const processObj = new PayrollQueueMessage();
      processObj.EmployeeName = this.timeCardDetails.EmployeeName,
        processObj.TimeCardId = this.timeCardDetails.Id,
        processObj.IsPushedToQueue = true,
        processObj.MessageObject = null,
        processObj.OldMessageObject = null,
        processObj.Remarks = "",
        processObj.RuleSetCode = null;
      processObj.SessionDetails = null;
      LstProceeTimeCards.push(processObj);

      this.payrollService.post_processTimeCard(JSON.stringify(LstProceeTimeCards)).subscribe((result) => {
        console.log('PROCESS TIME CARD RESPONSE :: ', result);
        this.loadingScreenService.stopLoading();
        const apiResult: apiResult = result;
        if (apiResult.Status && apiResult.Result) {
          //this.processedEMP = apiResult.Result as any;
          this.alertService.showSuccess(apiResult.Message);
          //this.getDataset();
          // $('#popup_chooseCategory').modal('show');

        } else {
          this.alertService.showWarning(apiResult.Message);
        }
      }, error => {
        this.loadingScreenService.stopLoading();
      });
    } else {
      this.alertService.showWarning("No Employee record(s) have been selected! Please first select");
      return;
    }
  }

  submitForVerification() {
    let LstSubmitForVerifcation = [];
    var currentDate = new Date();
    let payrollModel: PayrollModel;

    if (this.timeCardDetails != null) {


      if (this.timeCardDetails.Status != TimeCardStatus.PayrollCalculated) {
        this.alertService.showWarning("Please Calculate Payroll First!");
        return;
      }

      const swalWithBootstrapButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn btn-primary',
          cancelButton: 'btn btn-danger'
        },
        buttonsStyling: true
      })
      swalWithBootstrapButtons.fire({
        title: 'Overall Request Remarks',
        animation: false,
        showCancelButton: true, // There won't be any cancel button
        input: 'textarea',
        // inputValue:  result.ApproverRemarks ,
        inputPlaceholder: 'Type your message here...',
        allowEscapeKey: false,
        inputAttributes: {
          autocorrect: 'off',
          autocapitalize: 'on',
          maxlength: '120',
          'aria-label': 'Type your message here',
        },
        allowOutsideClick: false,
        inputValidator: (value) => {
          if (value.length >= 120) {
            return 'Maximum 120 characters allowed.'
          }
          if (!value) {
            return 'You need to write something!'
          }
        },

      }).then((inputValue) => {
        if (inputValue.value) {
          let jsonObj = inputValue;
          let jsonStr = jsonObj.value;
          this.loadingScreenService.startLoading();
          var PVRId = 0;

          PVRId = this.timeCardDetails.PVRId;
          var submitListObject = new PayrollVerificationRequestDetails();
          submitListObject.Id = 0;
          submitListObject.PVRId = this.timeCardDetails.PVRId;
          submitListObject.TimeCardId = this.timeCardDetails.Id;
          submitListObject.EmployeeId = this.timeCardDetails.EmployeeId;
          submitListObject.EmployeeName = this.timeCardDetails.EmployeeName;
          submitListObject.IsActive = true;
          submitListObject.LastUpdatedBy = this.userId.toString();
          submitListObject.LastUpdatedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
          submitListObject.RequestRemarks = jsonStr;
          submitListObject.ApproverRemarks = "";
          submitListObject.Status = TimeCardStatus.SentForQc;
          submitListObject.ModeType = UIMode.Edit;

          LstSubmitForVerifcation.push(submitListObject);

          var submitObject = new PayrollVerificationRequest();
          submitObject.Id = PVRId == -1 ? 0 : PVRId;
          submitObject.CompanyId = this._loginSessionDetails.Company.Id;
          submitObject.ClientContractId = this.timeCardDetails.ClientContractId;
          submitObject.ClientId = this.timeCardDetails.ClientId;
          submitObject.PayPeriodId = this.timeCardDetails.PayPeriodId;
          submitObject.PayPeriodName = ''; // ! Change
          submitObject.AttdanceStartDate = this.timeCardDetails.AttendanceStartDate;
          submitObject.AttdanceEndDate = this.timeCardDetails.AttendanceEndDate;
          submitObject.ClientContactId = 0;
          submitObject.TeamIds = [];
          submitObject.ClientContactDetails = "";
          // submitObject.TeamIds.push(this.header_items.teamId)
          submitObject.TeamIds.push(this.timeCardDetails.TeamId);
          submitObject.TeamIds = _.union(submitObject.TeamIds)

          submitObject.RequestedBy = this.userId.toString();
          submitObject.RequestedOn = moment(new Date()).format('YYYY-MM-DD hh:mm:ss');
          submitObject.ApproverId = null;
          submitObject.ApproverLogOn = '1900-01-01 00:00:00'
          submitObject.RequestRemarks = jsonStr;
          submitObject.ApproverRemarks = "";
          submitObject.ObjectStorageId = 0;
          submitObject.Status = PVRStatus.Initiated;
          submitObject.LstPVRDetails = LstSubmitForVerifcation;
          payrollModel = _PayrollModel;
          payrollModel.NewDetails = submitObject;
          payrollModel.OldDetails = "";
          console.log('Payroll Model', payrollModel);

          this.payrollService.put_PVRSubmission(JSON.stringify(payrollModel))
            .subscribe((result) => {
              console.log('SUBMIT FOR VERIFICATION RESPONSE :: ', result);
              const apiResult: apiResult = result;
              if (apiResult.Status && apiResult.Result) {
                this.loadingScreenService.stopLoading();
                this.alertService.showSuccess(apiResult.Message);
                this.router.navigateByUrl('app/fnf/resignationlist')
              } else {
                this.loadingScreenService.stopLoading();
                this.alertService.showWarning(apiResult.Message);
              }
            }, error => {
              this.loadingScreenService.stopLoading();
            });
        } else if (
          /* Read more about handling dismissals below */
          inputValue.dismiss === Swal.DismissReason.cancel

        ) {
        }
      });

    }
    else {
      this.alertService.showWarning("At least one checkbox must be selected.");
      return;
    }
  }

  loadData_slider(event) {
    console.log("TImecard ::", this.timeCardDetails, event);
    console.log("Nill Case", this.isNillCase, event);
    if (event.nextId === 'attendanceDetails') {
      if (this.isNillCase) {
        this.alertService.showInfo("For Nill Case Termination , Attendance is not required");
        event.preventDefault();
        return;
      }
      if (this.events == undefined || this.events == null || this.events.length <= 0) {
        // if(moment(this.timeCardDetails.AttendanceEndDate) < moment(this.timeCardDetails.AttendanceStartDate)){
        // if(this.isNillCase){  
        //   this.alertService.showInfo("For Nill Case Termination , Attendance is not required");
        //   event.preventDefault();
        //   return;
        // }
        this.load_AttendanceLog();
      }
    }
    this._slider_activeTabName = event.nextId;
  }

  beforeSalaryTabChange(event) {
    if (event.nextId == 'Allowance') {
    }
    this.slider_salaryActiveTabName = event.nextId;
  }

  editAttendance() {
    this.variableInput_Slider = true;
    if ((this.events == undefined || this.events == null || this.events.length <= 0) && !this.isNillCase) {
      // if(moment(this.timeCardDetails.AttendanceEndDate) < moment(this.timeCardDetails.AttendanceStartDate)){
      this.load_AttendanceLog();
    }
  }

  close_variableInput_Slider() {
    this.events = null;
    this._slider_activeTabName = "salaryInput";
    this.variableInput_Slider = false;
  }

  load_AttendanceLog() {

    let attendance = this.ff_Form.get('AttendanceInputs').value;
    let attendanceStartDate = moment(this.ff_Form.get('AttendanceStartDate').value).format('YYYY-MM-DDTHH:mm:ss');
    let lwd = moment(this.ff_Form.get('CalculatedLastWorkingDate').value).format('YYYY-MM-DDTHH:mm:ss')


    this.viewDate = new Date(attendanceStartDate);
    this.events = [];
    this.minDate = new Date(attendanceStartDate);
    this.maxDate = new Date(lwd);
    // this.dateOrViewChanged(); 

    console.log("Attendance log ::", attendance, this.viewDate, this.maxDate);

    this.enumerateDaysBetweenDates(new Date(attendanceStartDate), new Date(lwd));

    attendance.length > 0 &&
      attendance.forEach((element) => {
        let fromDate = element.FromDate;
        while (moment(fromDate) <= moment(element.ToDate)) {
          //const weekEndDays = new Date(element.FromDate);
          // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
          var isExist = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(fromDate).format('YYYY-MM-DD'))
          isExist != undefined && (isExist.start = new Date(fromDate),
            (isExist.meta = {
              IsFirstDayHalf: element.IsFirstDayHalf,
            }),
            isExist.id = element.Id, isExist.title = '',
            (isExist.color = colors.red))

          // }
          fromDate = moment(fromDate).add(1, 'days').format('YYYY-MM-DD');
        }

      });

    this.calculatePADays();
  }



  enumerateDaysBetweenDates(startDate, endDate) {
    let date = []
    while (moment(startDate).isSameOrBefore(moment(endDate), 'day')) {
      const weekEndDays = new Date(startDate);
      // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
      this.events.push({
        start: new Date(startDate),
        id: 0,
        end: new Date(startDate),
        title: (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-04') || (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-08') ? 'Absent' : 'Present',
        color: (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-04') || (moment(startDate).format('YYYY-MM-DD')) == ('2020-06-08') ? colors.red : colors.green,
        meta: {
          IsFirstDayHalf: false,
          WFHStatus: 0,
          ODStatus: 0,
        }

      })
      // }
      date.push(startDate);

      startDate = moment(startDate).add(1, 'days').format('YYYY-MM-DD');
      // }
    }
    console.log('exm f', date);
    console.log('events', this.events);
    // this.events.push({
    //   start: new Date('2020-06-15'),
    //   end: new Date('2020-06-15'),
    //   title: 'Absent',
    //   color: colors.red
    // })
    this.calculatePADays();
    return date;
  }

  calculatePADays() {
    this.noOfP = 0;
    this.noOfA = 0;
    console.log('th', this.events);

    this.events.forEach(e => { (e.color === colors.red && e.meta.IsFirstDayHalf ? this.noOfA += 0.5 : e.color === colors.red ? this.noOfA += 1 : null) })
    this.events.forEach(e => { (e.color === colors.green ? this.noOfP += 1 : null) })
  }

  previewFnF() {
    this.visible_previewFnF = true;
  }
  close_previewFnF() {
    this.visible_previewFnF = false;
  }

  eventClicked({ event }: { event: CalendarEvent }): void {
    console.log(event);
  }

  dayClicked({ date, events, }: { date: Date; events: CalendarEvent<{}>[]; }): void {

    console.log('events', events);;

    const modalRef = this.modalService.open(AttendancelogModalComponent, this.modalOption);
    modalRef.componentInstance.objJson = events[0];
    modalRef.componentInstance.IsLOP = true;

    modalRef.result.then((result) => {
      if (result != 'Modal Closed') {
        console.log(result);;
        while (moment(result.StartDate).isSameOrBefore(moment(result.EndDate), 'day')) {
          const weekEndDays = new Date(result.StartDate);
          // if (weekEndDays.getDay() !== 6 && weekEndDays.getDay() !== 0) {
          console.log(this.events);
          console.log('test', moment(result.StartDate).format('YYYY-MM-DD'));
          //  this.events.forEach(element => {
          //     console.log( moment(element.start).format('YYYY-MM-DD'));

          //  });
          var existingValue = this.events.find(item => moment(item.start).format('YYYY-MM-DD') == moment(result.StartDate).format('YYYY-MM-DD'));
          console.log('existingValue', existingValue);

          existingValue != undefined && (existingValue.start = new Date(result.StartDate), (existingValue.title = ""),
            existingValue.meta = {
              IsFirstDayHalf: result.isHalfDay,
            },
            (existingValue.color = result.Action == 'Present' ? colors.green : result.Action == 'Absent' ? colors.red : colors.yellow))

          // }
          result.StartDate = moment(result.StartDate).add(1, 'days').format('YYYY-MM-DD');

        }

        // if (result.isHalfDay) {
        //   this.events.push({
        //     start: new Date(result.StartDate),
        //     end: new Date(result.StartDate),
        //     title: result.NameofTitle,
        //     color: colors.red,
        //     meta: {
        //       IsFirstDayHalf: result.isHalfDay,
        //     },
        //   })
        // }
        this.calculatePADays();
      }
    }).catch((error) => {
      console.log(error);
    });

  }

  beforeMonthViewRender({ body }: { body: CalendarMonthViewDay[] }): void {
    // console.log("Before render body ::" , body);
    body.forEach((day) => {
      if (!this.dateIsValid(day.date)) {
        day.cssClass = 'cal-disabled';
      }
    });
  }

  dateIsValid(date: Date): boolean {
    return date >= this.minDate && date <= this.maxDate;
  }

  increment(): void {
    this.changeDate(this.addPeriod(this.view, this.viewDate, 1));
  }

  decrement(): void {
    this.changeDate(this.subPeriod(this.view, this.viewDate, 1));
  }

  changeDate(date: Date): void {
    this.viewDate = date;
    this.dateOrViewChanged();
  }

  addPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
    return {
      day: addDays,
      week: addWeeks,
      month: addMonths,
    }[period](date, amount);
  }

  subPeriod(period: CalendarPeriod, date: Date, amount: number): Date {
    return {
      day: subDays,
      week: subWeeks,
      month: subMonths,
    }[period](date, amount);
  }

  dateOrViewChanged(): void {
    // this.prevBtnDisabled = !this.dateIsValid(
    //   this.endOfPeriod(this.view, this.subPeriod(this.view, this.viewDate, 1))
    //  );
    // this.nextBtnDisabled = !this.dateIsValid(
    //   this.startOfPeriod(this.view, this.addPeriod(this.view, this.viewDate, 1))
    // );
    if (this.viewDate < this.minDate) {
      this.changeDate(this.minDate);
    } else if (this.viewDate > this.maxDate) {
      this.changeDate(this.maxDate);
    }
  }

  startOfPeriod(period: CalendarPeriod, date: Date): Date {
    return {
      day: startOfDay,
      week: startOfWeek,
      month: startOfMonth,
    }[period](date);
  }

  endOfPeriod(period: CalendarPeriod, date: Date): Date {
    return {
      day: endOfDay,
      week: endOfWeek,
      month: endOfMonth,
    }[period](date);
  }

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
      reverseButtons: true
    }).then((result) => {
      if (result.value) {

        this.router.navigate(['app/fnf/fnftransaction']);
        // swalWithBootstrapButtons.fire(
        //   'Deleted!',
        //   'Your file has been deleted.',
        //   'success'
        // )
      } else if (
        /* Read more about handling dismissals below */
        result.dismiss === Swal.DismissReason.cancel
      ) {
        // swalWithBootstrapButtons.fire(
        //   'Cancelled',
        //   'Your imaginary file is safe :)',
        //   'error'
        // )
      }
    })

  }


}
