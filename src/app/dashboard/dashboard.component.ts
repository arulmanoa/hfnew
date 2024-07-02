import { Component, EventEmitter, OnInit, ViewEncapsulation } from '@angular/core';
import { HeaderService } from '../_services/service/header.service';
import { AlertService } from '../_services/service/alert.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet, Color } from 'ng2-charts';
import { SearchService } from '../_services/service/search.service';
import { SessionKeys } from '../_services/configs/app.config';
import { SessionStorage } from '../_services/service/session-storage.service';
import { LoginResponses } from '../_services/model';
import { apiResult } from '../_services/model/apiResult';
import * as _ from 'lodash';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { LoadingScreenService } from '../shared/components/loading-screen/loading-screen.service';
import { EmployeeService, CommonService, MenuServices } from '../_services/service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AttendanceService } from '../_services/service/attendnace.service';
import { AttendanceConfiguration } from '../_services/model/Attendance/AttendanceConfiguration';
import { EmployeeAttendanceBreakUpDetails } from '../_services/model/Attendance/EmployeeAttendanceDetails';
import { EntitlementType } from '../_services/model/Attendance/AttendanceEnum';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { EmployeeLookUp } from '../_services/model/Employee/EmployeeLookup';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ImagecaptureModalComponent } from '../shared/modals/attendance/imagecapture-modal/imagecapture-modal.component';
import { PunchAttendanceModel } from '../_services/model/Attendance/PunchAttendanceModel';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { CookieService } from 'ngx-cookie-service';
import Chart from 'chart.js';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  // encapsulation : ViewEncapsulation.None

})
export class DashboardComponent implements OnInit {
  isEmployeeLogin: boolean = false;
  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  EmployeeName: any;
  EmployeeCode: string = "";
  shouldHide: boolean = true;
  greet: string = '';
  showThisScreen: boolean = false;

  public barChartOptions: ChartOptions = {
    responsive: true,
    hover: {
      animationDuration: 0,
    },
    legend: {
      position: 'bottom',
      labels: {
        padding: 10,
        fontSize: 12,
        boxWidth: 12,
        fontFamily: 'Roboto',
        fontColor: '#808080'
      }
    },
    maintainAspectRatio: false,
    layout: {
      padding: {
        top: 5,
        right: 5,
        left: 5,
        bottom: 5
      }
    },
    scales: {
      xAxes: [
        {
          display: true,
          ticks: {
            fontSize: 11,
            fontFamily: 'Roboto',
            fontColor: '#808080'
          },
          gridLines: {
            // display: false
          },
        }
      ],
      yAxes: [
        {
          display: true,
          ticks: {
            suggestedMin: 0,
            beginAtZero: true,
            fontSize: 11,
            fontFamily: 'Roboto',
            fontColor: '#808080'
          },
          gridLines: {
            // display: false // true,
          },
        }
      ],
    },
    elements: {
      rectangle: {
        borderWidth: 0,
      }
    }
  };
  public barChartLabels: string[] = [];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    {
      maxBarThickness: 20,
      data: []
    }
  ];

  candidateList = [];
  filterValue = [];
  filterValues: any;

  // Barchart Labels and Data

  BarchartDate: any;
  CandidateData: any;
  TaskListData: any;
  InfoBoardData: any;

  filterSeletedValue: any;
  istask_NoDataAvailable: boolean = false;
  isCandidate_NoDataAvailable: boolean = false;
  ClientInfoBox: any;
  spinner: boolean = true;
  selectedMonth: number = (new Date().getMonth() + 1);
  selectedYear: any = new Date().getFullYear();
  selectedMonthName: any;
  attendanceMessage: string = '';

  monthList = [{ id: 1, name: 'January' }, { id: 2, name: "February" }, { id: 3, name: "March" },
  { id: 4, name: "April" }, { id: 5, name: "May" }, { id: 6, name: "June" }, { id: 7, name: "July" }, { id: 8, name: "August" },
  { id: 9, name: "September" }, { id: 10, name: "October" }, { id: 11, name: "November" }, { id: 12, name: "December" }];
  yearList = [{ id: 2019, name: '2019' }, { id: 2020, name: "2020" }, { id: 2021, name: "2021" }]
  ClientDashboardData: any;
  // ESS PORTAL DASHBOARD

  _ESSDashboardDetails: any;

  AppliedLeaveType: string;
  RequiredDashboardCards = ["ProfileCard", "ShiftCard", "AttendanceCard", "EntitlementCard", "HolidayCard",
    "BirthDayCard", "NotificationCard"];

  public barChartSalaryOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{
        stacked: false
      }],
      yAxes: [{
        stacked: false
      }]
    }
  };
  public barChartSalaryLabels: Label[] = [];
  public barChartSalaryType: ChartType = 'bar';
  public barChartSalaryLegend = true;
  public barChartSalaryPlugins = [this.barChartSalaryOptions];
  public barChartSalaryColors: Color[] = [
    // { backgroundColor: '#2c7be5' },

  ]

  public barChartSalaryData: ChartDataSets[] = [
    {
      data: [],
      label: 'Net Pay',
      // stack: 'a',

    },
    {
      data: [],
      label: 'Gross Earning',
      //  stack: 'a'
    },
    {
      data: [],
      label: 'Income Tax',
      //  stack: 'a'
    },
    {
      data: [],
      label: 'Total Deductions'
      // , stack: 'a'
    }
  ];

  private isFirstLoad: boolean = true;
  isNgOninitCalled: boolean = false;


  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public randomize(): void {
    // Only Change 3 values
    const data = [
      Math.round(Math.random() * 100),
      59,
      80,
      (Math.random() * 100),
      56,
      (Math.random() * 100),
      40];
    this.barChartData[0].data = data;
  }
  public doughnutChartPlugins: any[] = [{
    afterDraw(chart) {
      const ctx = chart.ctx;
      var txt1 = '';
      var txt2 = '';

      try {
        var check = chart.active ? chart.tooltip._active[0]._datasetIndex : "None";
        if (check !== "None") {
          txt1 = chart.tooltip._data.labels[chart.tooltip._active[0]._index];
          txt2 = chart.tooltip._data.datasets[0].data[chart.tooltip._active[0]._index];
        } else {
          txt1 = chart.tooltip._data.labels[0];
          txt2 = chart.tooltip._data.datasets[0].data[0];
        }
      }
      catch (err) {
        txt1 = chart.tooltip._data.labels[0]
        txt2 = chart.tooltip._data.datasets[0].data[0];
      }
      //Get options from the center object in options
      const sidePadding = 60;
      const sidePaddingCalculated = (sidePadding / 100) * (chart.innerRadius * 2)

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const centerX = ((chart.chartArea.left + chart.chartArea.right) / 2);
      const centerY = ((chart.chartArea.top + chart.chartArea.bottom) / 2);

      //Get the width of the string and also the width of the element minus 10 to give it 5px side padding

      const stringWidth = ctx.measureText(txt1).width;
      const elementWidth = (chart.innerRadius * 2) - sidePaddingCalculated;

      // Find out how much the font can grow in width.
      const widthRatio = elementWidth / stringWidth;
      const newFontSize = Math.floor(30 * widthRatio);
      const elementHeight = (chart.innerRadius * 2);

      // Pick a new font size so it will not be larger than the height of label.
      const fontSizeToUse = 24;
      ctx.font = fontSizeToUse + 'px Arial';
      ctx.fillStyle = 'black';

      // Draw text in center
      ctx.fillText(txt2, centerX, centerY - 10);
      var fontSizeToUse1 = 14;
      ctx.font = fontSizeToUse1 + 'px Arial';
      ctx.fillText(txt1, centerX, centerY + 10);
    }
  }];
  public doughnutChartLabels: Label[] = [];
  public doughnutChartLegend = false;
  public doughnutChartData: MultiDataSet = [


  ];
  public doughnutChartType: ChartType = 'doughnut';
  private donutColors = [
    {
      backgroundColor: [
        '#86c7f3',
        '#ffa1b5',
        '#ffe29a',
        '#b4efa9',
      ]
    }
  ];

  public barChartColors: Array<any> = [{
    backgroundColor: 'rgba(253, 203, 110, 1)',
    borderColor: 'rgba(253, 203, 110, 1)'
  }, {
    backgroundColor: 'rgba(89, 216, 213, 1)',
    borderColor: 'rgba(89, 216, 213, 1)'
  }, {
    backgroundColor: 'rgba(162, 155, 254, 1)',
    borderColor: 'rgba(162, 155, 254, 1)'
  }, {
    backgroundColor: 'rgba(255, 153, 153, 1)',
    borderColor: 'rgba(255, 153, 153, 1)'
  }];

  donutChartBreakupLabel = [];
  donutChartBreakupPayitems = [];
  ActiveSalaryBreakupTransactionId = 0;
  SalaryBreakup = [];
  PayperiodStartDate; PayperiodEndDate;
  EmployeeEntitlement: any;
  selectedIndex: number = 0;
  FinancialDetails = [];
  isManager: boolean = false;
  HRRoleCode: any;
  RoleCode: any;
  _EmployeeEntitlement: any[] = [];
  _EmployeeEntitlementAvailmentRequest: any[] = [];
  _attenConfig: AttendanceConfiguration = new AttendanceConfiguration();
  PunchInOutText: any = 'Punch In';
  time = new Date();
  preferredDate = new Date();
  intervalId;
  ShouldShowPunchInBtn: boolean = false;
  LstEmployeeAttendanceBreakUpDetails: EmployeeAttendanceBreakUpDetails[] = [];
  lstlookUpDetails: EmployeeLookUp;
  IsHoliday: number = 0;
  FSI: any = '--:--';
  LSO: any = '--:--';
  AttendancePeriod: any[] = [];
  EmployeeBasicDetails: any[] = [];
  punchInSpinner: boolean = false;
  tobeHidden: boolean = false;
  isCheckCurrentDate: boolean = false;
  weekOffs: any[] = [];
  LstInvestmentSubmissionSlot = [];
  clientId: any;
  clientContractId: any;
  companyId: any;
  businessType: any;

  // Coordinates/ Image base 64
  PunchInImageId: any;
  PunchOutImageId: any;
  isLocationAccessed: boolean = false;
  position: any;
  isInvalidGeoFenceCoordinates: boolean = false;
  PhotoId: any;
  Coordinates: any;
  modalOption: NgbModalOptions = {};

  // ESS
  EmployeeId: any;
  randomText: any;
  IsEssAPIError: boolean = false;
  ESS_EmployeeBasicDetails: any = null;
  _UpComingBirthdayList = [];
  HolidayList = [];
  DashboardNotificationList = [];
  empContentSpin: boolean = true;
  attendContentSpin: boolean = true;
  leaveContentSpin: boolean = true;
  TotalBalance: any = 0;
  TotalUsed: any = 0;

  UpcomingBirthdaySpin: boolean = true;
  NotificationSpin: boolean = true;
  WorkShiftDefinition: any = null;
  TotalPresent: any = 0;
  TotalAbsent: any = 0;
  TotalPresent_percentage: any = 0;
  TotalAbsent_percentage: any = 0;
  IsNotificationPanelVisible: boolean = true;
  startOfMonth: any;
  endOfMonth: any;
  spinner_client: boolean = false;
  isAttendanceAllowed: boolean = false;
  private stopper: EventEmitter<any> = new EventEmitter();

  completeGeoLocationAddress: string = "";
  UnknowUser: boolean = false;
  isAllenDigital: boolean = false;
  showManagerDashboard: boolean = false;
  truncateTextLength: number = 20;

  constructor(
    private headerService: HeaderService,
    public alertService: AlertService,
    public searchService: SearchService,
    public sessionService: SessionStorage,
    private titleService: Title,
    private loadingScreenService: LoadingScreenService,
    private employeeService: EmployeeService,
    private commonService: CommonService,
    private attendanceService: AttendanceService,
    private router: Router,
    private activatedroute: ActivatedRoute,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private menuService: MenuServices,
    private cookieService: CookieService,
    // public _http : HttpClient


  ) {

    this.menuService.changedClientContractdata$.pipe(takeUntil(this.stopper),debounceTime(1000)).subscribe((data: any) => {
      console.log("client Contract Chnaged", data, this.isFirstLoad);
      this.spinner_client = true;
      this.isFirstLoad = this.isNgOninitCalled ? this.isFirstLoad : false;
      this.loadingScreenService.stopLoading();
      if (data == "contractChanged" && !this.isFirstLoad) {
        this.initialize();
      } else {
        this.isFirstLoad = false;
      }

    });

    const cookieValue = this.cookieService.get('clientCode');
    const businessType = environment.environment.BusinessType;
    this.isAllenDigital = (cookieValue.toUpperCase() == "ALLEN" && (businessType === 1 || businessType === 2)) ? true : false
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;


    this.shouldHide = true;
    this.filterSeletedValue = "LAST 7 DAYS";
    // throwError(undefined).subscribe(() => {});

    this.filterValue = [
      {
        id: "TODAY",
        name: "TODAY"
      },
      {
        id: "YESTERDAY",
        name: "YESTERDAY"
      },
      {
        id: "LAST 7 DAYS",
        name: "LAST 7 DAYS"
      },
      {
        id: "THIS MONTH",
        name: "THIS MONTH"
      },
      {
        id: "LAST MONTH",
        name: "LAST MONTH"
      },
      {
        id: "LAST 3 MONTHS",
        name: "LAST 3 MONTHS"
      },
      {
        id: "LAST 6 MONTHS",
        name: "LAST 6 MONTHS"
      },
      // {
      //   id: "CUSTOM",
      //   name: "CUSTOM"
      // },
    ]
  }



  ngOnInit() {
    if (this.isFirstLoad) {
      this.isNgOninitCalled = true;
      this.initialize();
    }
  }

  private initialize(): void {
    this.initializeRefresh();
    this.clearSessionStorageItems();
    this.initializeYearList();
    this.roundedCornerBarChart();
  }

  initializeRefresh() {
    this.onRefresh();
  }

  clearSessionStorageItems() {
    sessionStorage.removeItem('_StoreLstinvestment');
    sessionStorage.removeItem('_StoreLstDeductions');
  }

  initializeYearList() {
    this.yearList = this.generateYearList();
  }

  generateYearList(): { id: number; name: string }[] {
    const dojYear = new Date('2019-01-01');
    const currentYear = new Date().getFullYear();
    const earliestYear = dojYear.getFullYear();

    return Array.from({ length: currentYear - earliestYear + 1 }, (_, index) => ({
      id: currentYear - index,
      name: String(currentYear - index),
    }));
  }

  initializeSessionDetails() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.isManager = this.RoleCode === 'Manager' || this.RoleCode === 'LevelManager';
    this.businessType = this.getBusinessType();
    this.companyId = this._loginSessionDetails.Company.Id;
  }


  initializeDateParameters() {
    const startDate = moment([this.selectedYear, this.selectedMonth - 1]);
    const endDate = moment(startDate).endOf('month');
    this.startOfMonth = moment(startDate).format('YYYY-MM-DD');
    this.endOfMonth = moment(endDate).format('YYYY-MM-DD');
    this.selectedMonthName = this.monthList.find(a => a.id === this.selectedMonth).name;
  }

  initializeClientDetails() {
    this.clientId = this.businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ClientId'));
    this.clientContractId = this.businessType === 3 ? 0 : Number(this.sessionService.getSessionStorage('default_SME_ContractId'));

    if (this.RoleCode === 'Client') {
      this.getClientDashboardDetails();
    }

    this.IsNotificationPanelVisible = environment.environment.NotificationPanelNotRequiredClientIds.includes(Number(this.clientId)) ? false : true;

  }

  getBusinessType() {
    return this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ?
      this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId === this._loginSessionDetails.Company.Id).BusinessType :
      0;
  }

  setupTimeUpdater() {
    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);
  }

  initializeEmployeeLogin() {
    this.HRRoleCode = environment.environment.HRRoleCode;

    const isEmployee = sessionStorage.getItem('isEmployee') === 'true';
    this.isEmployeeLogin = isEmployee;

    this.sessionService.watchStorage().pipe(takeUntil(this.stopper)).subscribe((data: any) => {
      this.isEmployeeLogin = data === 'true';
    });
  }

  onRefresh() {
    // OLD
    this.spinner = true;
    this.setupTimeUpdater();
    this.initializeEmployeeLogin();

    this.IsNotificationPanelVisible = true;


    // history.pushState(null, null, document.URL);
    // window.addEventListener('popstate', function () {

    //   history.pushState(null, null, document.URL);
    // });

    this.initializeSessionDetails();
    this.initializeDateParameters();
    this.initializeClientDetails();

    // this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    // this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    // this.UserId = this._loginSessionDetails.UserSession.UserId;
    // // this.EmployeeName = this._loginSessionDetails.UserSession.PersonName; wrongly mapped 
    // this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    // this.isManager = this.RoleCode == "Manager" || this.RoleCode == "LevelManager" ? true : false;
    // this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    // this.companyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    // var startDate = moment([this.selectedYear, this.selectedMonth - 1]);
    // var endDate = moment(startDate).endOf('month');
    // this.startOfMonth = moment(startDate).format('YYYY-MM-DD');
    // this.endOfMonth = moment(endDate).format('YYYY-MM-DD');
    // this.selectedMonthName = this.monthList.find(a => a.id == this.selectedMonth).name;
    // if (this.businessType == 3) {

    //   this.clientId = 0;
    //   this.clientContractId = 0;

    //   if (this.RoleCode == 'Client') {
    //     this.clientId = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
    //     this.clientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
    //     this.getClientDashboardDetails();
    //   }
    //   this.IsNotificationPanelVisible = environment.environment.NotificationPanelNotRequiredClientIds.includes(Number(this.clientId)) ? false : true;

    // } else {
    //   this.clientId = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
    //   this.clientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
    //   this.IsNotificationPanelVisible = environment.environment.NotificationPanelNotRequiredClientIds.includes(Number(this.clientId)) ? false : true;
    //   if (this.RoleCode == 'Client') {
    //     this.getClientDashboardDetails();
    //   }
    // }


    this.headerService.setTitle('Dashboard');
    this.titleService.setTitle('Dashboard');

    if (this.RoleCode.toUpperCase() === 'EMPLOYEE') {
      this.empContentSpin = true;
      this.attendContentSpin = true;
      this.leaveContentSpin = true;
      this.WorkShiftDefinition = null;

      // Clear sessionStorage items
      ['_StoreLstinvestment', '_StoreLstDeductions', '_StoreLstinvestment_Deleted', '_StoreLstDeductions_Deleted']
        .forEach(item => sessionStorage.removeItem(item));

      this.GetESSRequiredDetails();

    } else {
      // ! temp solution : show manager welcome dashboard for Allen
      this.showManagerDashboard = environment.environment.RolesToShowsManagerDashboard && environment.environment.RolesToShowsManagerDashboard.includes(this.RoleCode) ? true : false;

      if (this.RoleCode == 'Manager') {
        this.GetDashboardDetailsByRoleCodeAndUserId();
              } else if (this.RoleCode === 'PayrollOps' || this.RoleCode === 'OpsMember' || this.RoleCode === 'CorporateHR' || this.RoleCode === 'RegionalHR') {
this.filterSeletedValue = "LAST 7 DAYS";

        this.onChangeFilter(this.filterSeletedValue);
      } else {
        this.UnknowUser = true;
        this.spinner = true;
      }
    }

  }

  async GetESSRequiredDetails() {
    try {
      this.IsEssAPIError = false;
      this.spinner = true;
      this.EmployeeId = this._loginSessionDetails.EmployeeId;
      this.ShouldShowPunchInBtn = false;
      this.randomlyUpdateQuotes();
      await this.visitorsDayFunction();
      await this.GetESSDashboardDetailsByEmployeeId(this.EmployeeId);
      console.log('ESS COMPLETED');
      
      await this.GetEmployeeShiftAndAttendanceDetailsForToday(this.EmployeeId);
      await this.getWeekOffByEmployeeId(this.EmployeeId);
      this.isCheckCurrentDate = true;
      await this.GetISTServerTime();
      await this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId);
      await this.GetEmployeeBreakupDetailsByCurrentDate(this.EmployeeId, 'initialStage');
      console.log('Tasks Complete');
      await this.GetDashboardDetailsByRoleCodeAndUserId();
      console.log('All tasks completed.');
      await this.GetEmployeeEntitlementList(this.EmployeeId);
      console.log('EMP ENTITLEMENT COMPLETED');
     

      this.spinner = false;
    } catch (error) {
      this.empContentSpin = false;
      console.error('Error:', error);
      console.warn('EX ON DASHBOARD ESS :: ', error);
      this.spinner = false;
    }
  }


  async GetESSRequiredDetailsOldFunction() {

    try {

      this.IsEssAPIError = false;
      this.spinner = true;
      this.EmployeeId = this._loginSessionDetails.EmployeeId;
      this.ShouldShowPunchInBtn = false;
      this.randomlyUpdateQuotes();
      await this.visitorsDayFunction();

      this.GetEmployeeShiftAndAttendanceDetailsForToday(this.EmployeeId)
        .then(() => this.getWeekOffByEmployeeId(this.EmployeeId))
        .then(() => {
          this.isCheckCurrentDate = true;
          return this.GetISTServerTime();
        })
        .then(() => this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId))
        .then(() => this.GetEmployeeBreakupDetailsByCurrentDate(this.EmployeeId, 'initialStage'))
        .then(value => {
          console.log('Task Complete:', value);
          return this.GetDashboardDetailsByRoleCodeAndUserId();
        })
        .then(() => {
          console.log('All tasks completed.');
        })
        .catch(error => {
          console.error('Error:', error);
        });
      // (async () => {
      //   try {
      //     await this.loadEmployeeDetails(this.EmployeeId);
      //     await this.loadDashboardDetails();
      //   } catch (error) {
      //     console.error('Error:', error);
      //   }
      // })();

      // this.GetEmployeeShiftAndAttendanceDetailsForToday(this.EmployeeId).then(() => {
      //   forkJoin([
      //     this.getWeekOffByEmployeeId(this.EmployeeId).then(() => {
      //       this.isCheckCurrentDate = true;
      //       this.GetISTServerTime().then(() => console.log("GET IST TIME - Task Complete!"));

      //     }),
      //     this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId),
      //     this.GetEmployeeBreakupDetailsByCurrentDate(this.EmployeeId, 'initialStage')
      //   ])
      //     .subscribe(value => {

      //       console.log('FORK JOIN OUTPUT :: ', value);
      //       // this.mappingpunchinoutdetails(value[2]); // old one now using getEmployeeShiftAndAttendanceDetailsForToday() API

      //     });

      //   this.GetDashboardDetailsByRoleCodeAndUserId().then((result) => {

      //   });

      // });



      // Promise.all([
      //   this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId),
      //   this.storage.remove(key2),
      //   this.storage.remove(key3),
      // ]).then(value => doSomething());

      // await this.GetAttendanceConfigurationByEmployeeId(this.EmployeeId).then((configResponse) => {
      //   console.log('ATTEN CONFIG :: ', configResponse);
      //   var jString: apiResult = configResponse as any;
      //   if (jString.Status && jString.Result != null) {
      //     this._attenConfig = jString.Result as any;
      //     this.ShouldShowPunchInBtn = this._attenConfig.IsPresentByDefault == false ? true : false;
      //   }
      // });
      // await this.GetEmployeeBreeakupDetailsByCurrentDate(this.EmployeeId).then((re => { console.log('BREAKUP DETAILS COMPLETED') }))
      await this.GetESSDashboardDetailsByEmployeeId(this.EmployeeId).then((re => { console.log('ESS COMPLETED') }))
      await this.GetEmployeeEntitlementList(this.EmployeeId).then((re => { console.log('BREAKUP DETAILS COMPLETED') }));


      this.spinner = false;
    }
    catch (error) {
      console.warn('EX ON DASHBOARD ESS :: ', error);
      this.spinner = false;
    }

  }

  // async loadEmployeeDetails(employeeId: string): Promise<any> {
  //   await this.GetEmployeeShiftAndAttendanceDetailsForToday(employeeId);

  //   const [weekOffDetails, attendanceConfig, breakupDetails] = await Promise.all([
  //     this.getWeekOffByEmployeeId(employeeId),
  //     this.GetAttendanceConfigurationByEmployeeId(employeeId),
  //     this.GetEmployeeBreakupDetailsByCurrentDate(employeeId, 'initialStage')
  //   ]);

  //   console.log('FORK JOIN OUTPUT :: ', [weekOffDetails, attendanceConfig, breakupDetails]);

  //   this.isCheckCurrentDate = true;
  //   await this.GetISTServerTime();
  // }

  async loadDashboardDetails() {
    await this.GetDashboardDetailsByRoleCodeAndUserId();
  }



  GetEmployeeShiftAndAttendanceDetailsForToday(employeeId) {
    const promise = new Promise((resolve, reject) => {
      this.attendanceService.getEmployeeShiftAndAttendanceDetailsForToday(employeeId).pipe(takeUntil(this.stopper)).subscribe((response) => {
        console.log('getEmployeeShiftAndAttendanceDetailsForToday', response);
        let apiResult: apiResult = response;
        if (apiResult.Status) {
          const parsedResult = JSON.parse(apiResult.Result);
          console.log('getEmployeeShiftAndAttendanceDetailsForToday-response', parsedResult);
          this.mappingpunchinoutdetails(parsedResult);
          this.attendanceMessage = parsedResult.Message;
          this.IsHoliday = parsedResult.IsHoliday;
          this.isAttendanceAllowed = parsedResult.IsAttendanceAllowed;
          this.ShouldShowPunchInBtn = parsedResult.IsAttendanceAllowed;
          this.WorkShiftDefinition = parsedResult.ShiftDetails[0];
          if (this.WorkShiftDefinition != null) {
            let patternedDate = moment().format('YYYY-MM-DD');
            this.WorkShiftDefinition.StartTime = new Date(`${patternedDate} ` + this.WorkShiftDefinition.ShiftStartTime);
            this.WorkShiftDefinition.EndTime = new Date(`${patternedDate} ` + this.WorkShiftDefinition.ShiftEndTime);
          }
        }
        resolve(true);
      });
    });
    return promise;
  }

  GetISTServerTime() {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetISTServerTime().pipe(takeUntil(this.stopper))
        .subscribe((ress) => {
          console.log('IST TIME ::', ress);
          let apiR: apiResult = ress;
          if (apiR.Status) {
            let UILocalTime = new Date();
            this.preferredDate = new Date(apiR.Result);
            this.time = new Date(apiR.Result);
            // if (moment(UILocalTime).format('YYYY-MM-DD') == moment(this.preferredDate).format('YYYY-MM-DD')) {
            //   this.isCheckCurrentDate = true;
            // } else {
            //   this.isCheckCurrentDate = false;
            // }

            // if (this.isCheckCurrentDate && this.weekOffs.includes(this.preferredDate.getDay()) == false) {
            //   this.isCheckCurrentDate = true;
            // } else {
            //   this.isCheckCurrentDate = false;
            // }
          }
          res(true);

        })
    });
    return promise;
  }




  getWeekOffByEmployeeId(employeeId) {
    this.weekOffs = [];
    var promise = new Promise((resolve, reject) => {
      this.attendanceService.GetWeekOffByEmployeeId(employeeId).pipe(takeUntil(this.stopper))
        .subscribe((ress) => {
          console.log('WEEK OFF RESP ::', ress);
          let apiR: apiResult = ress;
          if (apiR.Status && apiR.Result != null) {

            var weekOff = apiR.Result[0] as any;
            // if (weekOff.EffectiveDate >= new Date()) {
            if (weekOff.Monday) {
              this.weekOffs.push(1)
            }
            if (weekOff.Tuesday) {
              this.weekOffs.push(2)
            }
            if (weekOff.Wednesday) {
              this.weekOffs.push(3)
            }
            if (weekOff.Thursday) {
              this.weekOffs.push(4)
            }
            if (weekOff.Friday) {
              this.weekOffs.push(5)
            }
            if (weekOff.Saturday) {
              this.weekOffs.push(6)
            }
            if (weekOff.Sunday) {
              this.weekOffs.push(0)
            }
            // }
            console.log('WEEKOFF DAYS ::', this.weekOffs);
            this.sessionService.delSessionStorage('weekOffs');
            this.sessionService.setSesstionStorage('weekOffs', (this.weekOffs));


            resolve(true);
          } else {
            resolve(false);

          }

        })
    });
    return promise;
  }

  // PAYROLL OPS DASHBOARD 

  onChangeFilter(event) {

    this.spinner = true;
    let fromDate = "2020-01-01";
    let toDate = "2020-02-25";
    let filterValue = event;
    this.businessType = 3;
    let req_params_Uri = `${this.RoleId}/${fromDate}/${toDate}/${this.companyId}/${this.clientId}/${this.clientContractId}/${this.businessType}/${filterValue}`;

    this.searchService.getDashboardDetails(req_params_Uri).pipe(takeUntil(this.stopper)).subscribe((result) => {
      let apiResult: apiResult = result;
      if (apiResult.Status) {

        var jsonObj = JSON.parse(apiResult.Result);

        this.InfoBoardData = JSON.parse(jsonObj.InfoBoardData);


        this.BarchartDate = JSON.parse(jsonObj.BarChartData);
        let getLabels = this.BarchartDate.Labels;
        var replace = getLabels.replace("[", "");
        var replace1 = replace.replace("]", "");
        var temp = new Array();
        temp = (replace1.split(","));
        this.barChartLabels = temp;

        console.log(' this.barChartLabels', this.barChartLabels);
        
        let items: any;

        items = this.BarchartDate.ChartData

        items.forEach(element => {


          var i = element.data,
            j = i.replace(/([a-zA-Z0-9]+?):/g, '"$1":').replace(/'/g, '"'),
            k = JSON.parse(j);
          element.data = k
          console.log(k)

          if (element.label === "Offered") {
            element.hoverBackgroundColor = 'rgba(253, 203, 110, 0.9)',
              element.hoverBorderColor = 'rgba(253, 203, 110, 0.9)',
              element.pointHoverBackgroundColor = 'rgba(253, 203, 110, 0.8)',
              element.pointHoverBorderColor = 'rgba(253, 203, 110, 0.8)',
              element.backgroundColor = 'rgba(253, 203, 110, 1)',
              element.borderColor = 'rgba(253, 203, 110, 1)'
          }
          if (element.label === "NewJoiners") {
            element.hoverBackgroundColor = 'rgba(89, 216, 213, 0.9)',
              element.hoverBorderColor = 'rgba(89, 216, 213, 0.9)',
              element.pointHoverBackgroundColor = 'rgba(89, 216, 213, 0.9)',
              element.pointHoverBorderColor = 'rgba(89, 216, 213, 0.9)',
              element.backgroundColor = 'rgba(89, 216, 213, 1)',
              element.borderColor = 'rgba(89, 216, 213, 1)'
          }
          if (element.label === "SalaryRevisions") {
            element.hoverBackgroundColor = 'rgba(162, 155, 254, 0.9)',
              element.hoverBorderColor = 'rgba(162, 155, 254, 0.9)',
              element.pointHoverBackgroundColor = 'rgba(162, 155, 254, 0.9)',
              element.pointHoverBorderColor = 'rgba(162, 155, 254, 0.9)',
              element.backgroundColor = 'rgba(162, 155, 254, 1)',
              element.borderColor = 'rgba(162, 155, 254, 1)'
          }
          if (element.label === "Exits") {
            element.hoverBackgroundColor = 'rgba(255, 153, 153, 0.9)',
              element.hoverBorderColor = 'rgba(255, 153, 153, 0.9)',
              element.pointHoverBackgroundColor = 'rgba(255, 153, 153, 0.9)',
              element.pointHoverBorderColor = 'rgba(255, 153, 153, 0.9)',
              element.backgroundColor = 'rgba(255, 153, 153, 1)',
              element.borderColor = 'rgba(255, 153, 153, 1)'
          }
        });

        items.forEach(e3 => {
          if (e3.label === "Offered") {
            e3.label = "TotalEmployees";
          }
          if (e3.label === "NewJoiners") {
            e3.label = "NewHires";
          }
          if (e3.label === "SalaryRevisions") {
            e3.label = "PendingRequests";
          }
          if (e3.label === "Exits") {
            e3.label = "ApprovedRequests";
          }
        });

        this.barChartData = items;


        // console.log('bar', this.barChartData);
        let taskdata = (jsonObj.TaskListData);
        this.TaskListData = _(taskdata)
          .groupBy(x => x.TASKGROUP)
          .map((value, key) => ({ TASKGROUP: key, TASKS: value }))
          .value();


        this.CandidateData = (jsonObj.CandidateData);

        this.TaskListData.length == 0 ? this.istask_NoDataAvailable = true : this.istask_NoDataAvailable = false;
        this.CandidateData.length == 0 ? this.isCandidate_NoDataAvailable = true : this.isCandidate_NoDataAvailable = false;

        this.CandidateData.length > 0 && this.CandidateData.forEach(element => {
          element['CONVERTED_UNIT'] = element.PROGRESS_UNITS;
          element['TOOLTIP'] = `PROGRESS UNIT IS  ${element.PROGRESS_UNITS} OUT OF ${element.TOTAL_UNITS}`;
          element['PERCENTAGE'] = element.CONVERTED_UNIT == 0 ? element.CONVERTED_UNIT : (element.CONVERTED_UNIT + 95)

          element.CONVERTED_UNIT = element.CONVERTED_UNIT == 0 ? element.CONVERTED_UNIT : (element.CONVERTED_UNIT + 75)
        });


        this.spinner = false;

      }
    });

  }





  // ESS PORTAL DASHBOARD

  visitorsDayFunction() {
    const hrs = new Date().getHours();

    if (hrs < 12)
      this.greet = 'Good Morning';
    else if (hrs < 17)
      this.greet = 'Good Afternoon';
    else
      this.greet = 'Good Evening';

  }

  // unused code 
  GetESSDashboardDetails() {

    const req_params_Uri = `${sessionStorage.getItem('loginUserId')}`;
    this.searchService.getESSDashboardDetails(req_params_Uri).pipe(takeUntil(this.stopper)).subscribe((result) => {
      let apiResult: apiResult = result;
      this.SalaryBreakup = [];
      this.LstEmployeeAttendanceBreakUpDetails = [];
      if (apiResult.Status) {
        var jsonObj = JSON.parse(apiResult.Result);
        console.log('DASHBOARD JSON OBJECT ::', jsonObj);


        jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0 ? this.sessionService.setSesstionStorage('employeeBasicDetails', jsonObj.EmployeeBasicDetails.find(a => a.EmployeeCode.toUpperCase() == req_params_Uri.toUpperCase())) : true;
        this.EmployeeBasicDetails = jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0 ? jsonObj.EmployeeBasicDetails : [];
        this.EmployeeName = jsonObj.EmployeeBasicDetails.find(a => a.EmployeeCode.toUpperCase() == req_params_Uri.toUpperCase()).EmployeeName;

        this.EmployeeCode = jsonObj.EmployeeBasicDetails.find(a => a.EmployeeCode.toUpperCase() == req_params_Uri.toUpperCase()).EmployeeCode;
        this._ESSDashboardDetails = jsonObj;
        // this._EmployeeEntitlement = jsonObj.EmployeeEntitlement;
        var _BarCharSalaryBreaupData = this._ESSDashboardDetails.SalaryTrend;
        this.AttendancePeriod = jsonObj.AttendancePeriod;
        // jsonObj.LstEmployeeAttendanceBreakUpDetails != null && jsonObj.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.remappingDailyAttendanceDetails(jsonObj.LstEmployeeAttendanceBreakUpDetails);
        var dataset = [{
          data: [],
          label: 'Gross Earning',
          // stack: 'a',
          backgroundColor: '#86c7f3',
          borderColor: '#86c7f3',
          hoverBackgroundColor: '#86c7f3',
          hoverBorderColor: '#86c7f3'
        }, {
          data: [],
          label: 'Gross Deduction',
          // stack: 'a',
          backgroundColor: '#ffa1b5',// FAAFBA
          borderColor: '#ffa1b5',
          hoverBackgroundColor: '#ffa1b5',
          hoverBorderColor: '#ffa1b5'
        },
        {
          data: [],
          label: 'Income Tax',
          // stack: 'a',
          backgroundColor: '#ffe29a',
          borderColor: '#ffe29a',
          hoverBackgroundColor: '#ffe29a',
          hoverBorderColor: '#ffe29a'
        }, {
          data: [],
          label: 'Net Pay',
          // stack: 'a',
          backgroundColor: '#b4efa9',
          borderColor: '#b4efa9',
          hoverBackgroundColor: '#b4efa9',
          hoverBorderColor: '#b4efa9'
        }]
        this.barChartSalaryLabels = [];
        for (let i = 0; i < _BarCharSalaryBreaupData.length; i++) {
          const e = _BarCharSalaryBreaupData[i];
          this.barChartSalaryLabels.push(e.PayCyclePeriodName);
          // e.GrossEarn && dataset[0].data.push(e.GrossEarn); old code
          // e.GrossDedn && dataset[1].data.push(e.GrossDedn);
          // e.TDS && dataset[2].data.push(e.TDS);
          // e.NetPay && dataset[3].data.push(e.NetPay);
          dataset[0].data.push(e.GrossEarn);
          dataset[1].data.push(e.GrossDedn);
          dataset[2].data.push(e.TDS);
          dataset[3].data.push(e.NetPay);

        }
        this.barChartSalaryData = dataset;

        this.sessionService.delSessionStorage('DefaultFinancialYearId');
        this.FinancialDetails = this._ESSDashboardDetails.FinancialDetails;
        this.FinancialDetails != null && this.FinancialDetails.length > 0 && this.sessionService.setSesstionStorage('DefaultFinancialYearId', this.FinancialDetails[0].Id);
        this.sessionService.setSesstionStorage('TaxDeclaration', this._ESSDashboardDetails.TaxDeclaration);

        // this.SalaryBreakup = SalaryBreakup;
        this._ESSDashboardDetails.SalaryBreakup.length > 0 ? this.SalaryBreakup = _.orderBy(this._ESSDashboardDetails.SalaryBreakup, ['PayperiodId'], ['desc']) : null;
        // var index = this.SalaryBreakup[0];
        // console.log('index', index);

        this.EmployeeEntitlement = this._ESSDashboardDetails.EmployeeEntitlement.length > 0 ? this._ESSDashboardDetails.EmployeeEntitlement[0] : null;

        this._ESSDashboardDetails.SalaryBreakup.length > 0 && this.onChangePayPeriod_donutChart();
        this.spinner = false;
        // for (let k = 0; k < this._ESSDashboardDetails.SalaryBreakup.length; k++) {
        //   const e = this._ESSDashboardDetails.SalaryBreakup[k];
        //   this.doughnutChartLabels.push();
        //   this.doughnutChartData.push()

        // }
      }
    }, err => {

    });
  }



  changeBreakup(index, item) {
    this.selectedIndex = index;
    this.onChangePayPeriod_donutChart();
  }

  onChangePayPeriod_donutChart() {

    this.doughnutChartLabels = [];
    this.doughnutChartData = [];
    this.donutChartBreakupLabel = [];
    this.donutChartBreakupPayitems = [];
    this.ActiveSalaryBreakupTransactionId = null;

    var _SalaryBreakup = [];

    _SalaryBreakup.push(this.SalaryBreakup[this.selectedIndex]);
    _SalaryBreakup.forEach(element => {

      const dt = new Date();
      this.PayperiodStartDate = moment(dt).startOf('month').format('MMM DD, YYYY');
      this.PayperiodEndDate = moment(dt).endOf('month').format('MMM DD, YYYY');
      // this.PayperiodStartDate = moment(dt).format('MMM DD, YYYY');
      // this.PayperiodEndDate = moment(dt).format('MMM DD, YYYY');

      (Object.keys(element).forEach(key => {
        this.donutChartBreakupPayitems = element.Payitem;
        if (this.donutChartBreakupPayitems != null && this.donutChartBreakupPayitems.length > 0) {
          this.donutChartBreakupPayitems = this.donutChartBreakupPayitems.filter(a => a.PayTotal != 0 && a.ProductTypeId != 4 && a.ProductTypeId != 20);

        }
        this.ActiveSalaryBreakupTransactionId = element.Id;
        if (key == 'GrossEarn') {
          this.doughnutChartLabels.push('Gross Earning');
          this.doughnutChartData.push(element.GrossEarn);
          this.donutChartBreakupLabel.push({
            label: 'Gross Earning',
            value: element.GrossEarn,
            colorCode: '#86c7f3'
          })
        }
        if (key == 'GrossDedn') {
          this.doughnutChartLabels.push('Gross Deduction');
          this.doughnutChartData.push(element.GrossDedn);
          this.donutChartBreakupLabel.push({
            label: 'Gross Deduction',
            value: element.GrossDedn,
            colorCode: '#ffa1b5'
          })
        }
        if (key == 'TDS') {
          this.doughnutChartLabels.push('Income Tax');
          this.doughnutChartData.push(element.TDS);
          this.donutChartBreakupLabel.push({
            label: 'Income Tax',
            value: element.TDS,
            colorCode: '#b4efa9'
          })
        }
        if (key == 'NetPay') {
          this.doughnutChartLabels.push('Net Pay');
          this.doughnutChartData.push(element.NetPay);
          this.donutChartBreakupLabel.push({
            label: 'Net Pay',
            value: element.NetPay,
            colorCode: '#ffe29a'
          })
        }


      }));
    });

    function array_move(arr, old_index, new_index) {
      if (new_index >= arr.length) {
        var k = new_index - arr.length + 1;
        while (k--) {
          arr.push(undefined);
        }
      }
      arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
      return arr; // for testing
    };

    console.log(array_move(this.donutChartBreakupLabel, 2, 3));
  }

  downloadPayslip() {

    this.loadingScreenService.startLoading();
    this.employeeService.downloadPaySlip(this.ActiveSalaryBreakupTransactionId).pipe(takeUntil(this.stopper))
      .subscribe((result) => {
        let apiResult: apiResult = result;
        if (apiResult.Status) {
          this.alertService.showSuccess(apiResult.Message);
          this.loadingScreenService.stopLoading();
          this.commonService.openNewtab(apiResult.Result, `PaySlip_${this.EmployeeName}`);
        } else {
          this.loadingScreenService.stopLoading();
          this.alertService.showWarning(apiResult.Message);
        }
      }, err => {

      });
  }


  public parseHours = (n) => `${n / 60 ^ 0}.` + n % 60;

  calcCrow(lat1, lon1, lat2, lon2) {
    var R = 6371; // km
    var dLat = this.toRad(lat2 - lat1);
    var dLon = this.toRad(lon2 - lon1);
    var lat1 = this.toRad(lat1) as any;
    var lat2 = this.toRad(lat2) as any;
    var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    return d;
  }
  // Converts numeric degrees to radians
  toRad(Value) {
    return Value * Math.PI / 180;
  }

  toggleTimer() {
    if (this.AppliedLeaveType && this.AppliedLeaveType.length > 0) {
      return this.alertService.showWarning(`${this.AppliedLeaveType} is already applied for today. You should cancel this leave request if you want to log your attendance.`);
    }
    try {
      if (this._attenConfig.IsGeoFenceRequired) {
        this.commonService.getPosition().then(pos => {
          this.position = pos;
          var url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${this.position.lat}&lon=${this.position.lng}`;
          this.commonService.getGeoCoding(url).pipe(takeUntil(this.stopper)).subscribe((data: any) => {
            console.log('Geo Coding :: ', data);
            this.completeGeoLocationAddress = data.display_name;
          });


          if (this._attenConfig.GeoFenceCoordinatesMapping == null) {
            this.isInvalidGeoFenceCoordinates = true;
          } else {
            this._attenConfig.GeoFenceCoordinatesMapping.Locations = JSON.parse(this._attenConfig.GeoFenceCoordinatesMapping.Locations);

            if (!this._attenConfig.GeoFenceCoordinatesMapping.Locations.find(a => this.calcCrow(a.Coordinates.Latitude, a.Coordinates.Longitude, this.position.lat, this.position.lng) <= a.Radius)) {
              this.isInvalidGeoFenceCoordinates = true;
            } else {
            }
          }
          console.log(`Positon: ${pos.lng} ${pos.lat}`);
        }, err => {
          console.warn('USER NOT ALLOWED : LOCATION PERMISSION');
          this.alertService.showInfo('Note: For your security, we need permission to access the location to enter attendance. Without it, this application will not be in a position to discover.');
          if (err.message == 'User denied Geolocation') {
            return;
          }
        });
      }
      this.PhotoId = 0;
      this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : null;

      this.punchInSpinner = true;

      if (this.PunchInOutText === 'Punch In' && this._attenConfig.IsImageCaptureRequiredWhilePunchIn) {
        this.triggerImageCapture_modalPopup().then((result) => {
          if (result != null && result != 'Cannot read UserMedia from MediaDevices.' && result != 'Permission denied') {
            this.PunchInImageId = result;
            this.PhotoId = result;
            this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : null;
            if (this.PunchInImageId == null || this.PunchInImageId == undefined || this.PunchInImageId == 0) {
              this.punchInSpinner = false;
              this.alertService.showInfo('Note: For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
              return;
            }
            this.callbacktoggelTimer();
            return;
          } else if (result == 'Cannot read UserMedia from MediaDevices.') {
            this.PunchInImageId = 0;
            this.PhotoId = 0;
            this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });;

            // this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            this.callbacktoggelTimer();
            // return;
            // this.alertService.showWarning("Action required : Please update your image.");
            // return;
          }
          else if (result == 'Permission denied') {
            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
          else {
            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
        });
      }
      else if (this.PunchInOutText === 'Punch Out' && this._attenConfig.IsImageCaptureRequiredWhilePunchOut) {
        // const dateToCheck = moment(this.FSI).minute(1);
        // const checkPunchInTime = moment().isAfter(dateToCheck);
        // if (checkPunchInTime) {
        this.triggerImageCapture_modalPopup().then((result) => {
          if (result != null && result != 'Cannot read UserMedia from MediaDevices.' && result != 'Permission denied') {
            this.PunchOutImageId = result;
            this.PhotoId = result;
            this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : null;

            if (this.PunchOutImageId == null || this.PunchOutImageId == undefined || this.PunchOutImageId == 0) {
              this.punchInSpinner = false;
              this.alertService.showInfo('Note: For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
              return;
            }
            this.callbacktoggelTimer();
            return;
          } else if (result == 'Cannot read UserMedia from MediaDevices.') {
            this.PunchOutImageId = 0;
            this.PhotoId = 0;
            this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng, "Address": this.completeGeoLocationAddress }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0, "Address": "" });

            // this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            this.callbacktoggelTimer();
            // return;
            // this.alertService.showWarning("Action required : Please update your image.");
            // return;
          }
          else if (result == 'Permission denied') {
            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
          else {
            this.punchInSpinner = false;
            this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
        });
        // } else {
        //   this.alertService.showWarning('Please try after')
        // }

      }

      else {
        this.callbacktoggelTimer();
      }

    } catch (error) {

      console.log('TOGGLE PUNCH : ', error);

    }

  }


  triggerImageCapture_modalPopup() {
    const promise = new Promise((res, rej) => {

      const modalRef = this.modalService.open(ImagecaptureModalComponent, this.modalOption);
      modalRef.componentInstance.objStorageJson = { EmployeeId: this.EmployeeBasicDetails[0].Id, CompanyId: this.companyId, ClientId: this.EmployeeBasicDetails[0].ClientId, ClientContractId: this.EmployeeBasicDetails[0].ClientContractId };
      modalRef.result.then((result) => {
        if (result != "Modal Closed") {
          console.log('result', result);
          res(result);
        }
        else {
          res(null);
        }
      }).catch((error) => {
        console.log(error);
      });
    })
    return promise;

  }


  callbacktoggelTimer() {

    this.PunchInOutText === 'Punch In' ? this.FSI = moment().format('HH:mm:ss') : this.LSO = moment().format('HH:mm:ss');
    (this.PunchInOutText === 'Punch In' && !this._attenConfig.IsAutoPunchOutEnabled) ? this.PunchInOutText = 'Punch Out' : this.PunchInOutText = 'Punch In';
    // this.tobeHidden = this._attenConfig.IsAutoPunchOutEnabled == true ? true : false;
    let AttendanceStartDateTime: Date;
    AttendanceStartDateTime = new Date();

    let AttendanceEndDateTime: Date;
    AttendanceEndDateTime = new Date();

    var totalHrs: number = 0;
    var patternedDate = moment(AttendanceStartDateTime).format('YYYY/MM/DD');
    var timeStart = new Date(`${patternedDate} ` + this.FSI);

    console.log('patternedDate', patternedDate)

    var j = this.LSO != '--:--' ? moment(AttendanceEndDateTime + ' ' + this.LSO) : null;
    console.log('LSO', this.LSO)
    console.log('FSI', this.FSI)

    var inputJSON = {
      "created_date": `${patternedDate} ` + this.FSI,
      "current_time": `${patternedDate} ` + this.LSO
    };

    console.log('inputJSON', inputJSON);


    function getDataDiff(startDate, endDate) {
      console.log('startDate', startDate);
      console.log('endDate', endDate);

      var diff = endDate.getTime() - startDate.getTime();
      var days = Math.floor(diff / (60 * 60 * 24 * 1000));
      var hours = Math.floor(diff / (60 * 60 * 1000)) - (days * 24);
      var minutes = Math.floor(diff / (60 * 1000)) - ((days * 24 * 60) + (hours * 60));
      var seconds = Math.floor(diff / 1000) - ((days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60));
      return { day: days, hour: hours, minute: minutes, second: seconds };
    }
    var diff = getDataDiff(new Date(inputJSON.created_date.replace(/-/g, "/")), new Date(inputJSON.current_time.replace(/-/g, "/")));
    console.log(diff);

    if (j != null) {
      totalHrs = diff.minute;
    }

    // if (j != null) {
    //   var timeEnd = new Date(`${patternedDate} ` + this.LSO);
    //   var fromhrs = moment(timeStart, 'HH:mm');
    //   console.log('fromhrs', fromhrs)

    //   var tillhrs = moment(timeEnd, 'HH:mm');
    //   console.log('tillhrs', tillhrs)

    //   totalHrs = tillhrs.diff(fromhrs, 'hour');
    //   console.log('totalHrs', totalHrs)

    //   var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
    //   console.log('totalMinutes', totalMinutes)

    //   totalHrs = Number(this.parseHours(totalMinutes));
    //  

    // }

    console.log('totalHrs', totalHrs)

    if (Number.isNaN(totalHrs)) {
      totalHrs = 0
    }




    var punchAttendanceModel = new PunchAttendanceModel();
    punchAttendanceModel.EmployeeId = this.EmployeeBasicDetails[0].Id;
    punchAttendanceModel.PhotoId = this.PhotoId;
    punchAttendanceModel.Coordinates = this._attenConfig.IsGeoFenceRequired ? JSON.parse(this.Coordinates) : null;
    punchAttendanceModel.Remarks = '';
    console.log('punchAttendanceModel', punchAttendanceModel);

    if (totalHrs == 0 && this.LSO != '--:--') {
      if (this.PunchInOutText == 'Punch In') {
        this.PunchInOutText = 'Punch Out';

      } else {
        this.PunchInOutText = 'Punch In';
      }
      this.LSO = '--:--';
      this.punchInSpinner = false;
      this.alertService.showInfo("There exists a total invalid number of hours of work. Please provide a minimum of hours and then proceed");
      return;
    }

    this.attendanceService.PunchAttendance(JSON.stringify(punchAttendanceModel)).pipe(takeUntil(this.stopper))
      .subscribe((result) => {
        console.log(result);
        let apiresult: apiResult = result;
        if (apiresult.Status) {
          // this.GetEmployeeBreakupDetailsByCurrentDate(this.EmployeeId, 'ProcessingStage').then((re => { console.log('BREAKUP DETAILS COMPLETED') }))
          this.GetEmployeeShiftAndAttendanceDetailsForToday(this.EmployeeId);
          this.punchInSpinner = false;
        }
        else {
          this.punchInSpinner = false;
          if (this.PunchInOutText === 'Punch Out') {
            this.FSI = '--:--';
            this.PunchInOutText = 'Punch In';
          } else {
            this.PunchInOutText = 'Punch Out';
            this.LSO = '--:--';
          }
          this.alertService.showWarning(apiresult.Message);
        }

      })

  }


  // EMPLOYEE SELF SERVICE

  // getESSDashboardDetailsByEmployeeId(employeeId): Promise<any> {
  //   return new Promise((resolve, reject) => {
  //     this.searchService.GetESSDashboardDetailsByEmployeeId(employeeId)
  //       .subscribe(
  //         (result) => {
  //           const apiResult: apiResult = result;

  //           if (apiResult.Status && apiResult.Result != null) {
  //             const jsonObj = JSON.parse(apiResult.Result);

  //             this.AppliedLeaveType = jsonObj.AppliedLeaveType;
  //             this.ESS_EmployeeBasicDetails = jsonObj.EmployeeBasicDetails[0];

  //             this.TotalPresent = 0;
  //             this.TotalAbsent = 0;

  //             if (jsonObj.AttendanceTrend != null && jsonObj.AttendanceTrend.length > 0) {
  //               jsonObj.AttendanceTrend.forEach(el => {
  //                 if (el.AttendanceBreakUpDetailsType === 100) {
  //                   this.TotalPresent += 1;
  //                 } else if (el.AttendanceBreakUpDetailsType === 200 || el.AttendanceBreakUpDetailsType === 300) {
  //                   this.TotalAbsent += 0.5;
  //                   this.TotalPresent += 0.5;
  //                 } else if (el.AttendanceBreakUpDetailsType === 400) {
  //                   this.TotalAbsent += 1;
  //                 }
  //               });
  //             }

  //             this.TotalPresent_percentage = Math.round((100 * this.TotalPresent) / 7);
  //             this.TotalAbsent_percentage = Math.round((100 * this.TotalAbsent) / 7);

  //             this.empContentSpin = false;

  //             if (jsonObj != null) {
  //               this.doDashboardChartDetails(jsonObj); // not needed in the dashboard screen
  //             }

  //             resolve(jsonObj);
  //           } else {
  //             this.IsEssAPIError = true;
  //             reject('API Error');
  //           }
  //         },
  //         (error) => {
  //           console.error('Error in getESSDashboardDetailsByEmployeeId:', error);
  //           reject('HTTP Request Error');
  //         }
  //       );
  //   });
  // }

  GetESSDashboardDetailsByEmployeeId(employeeId) {
    const promise = new Promise((res, rej) => {
      // this._UpComingBirthdayList = [];
      this.searchService.GetESSDashboardDetailsByEmployeeId(employeeId).pipe(takeUntil(this.stopper)).subscribe((result) => {
        let apiResult: apiResult = result;
        this.empContentSpin = false;
        this.TotalPresent = 0;
        this.TotalAbsent = 0;

        try {


          if (apiResult.Status && apiResult.Result != null) {

            var jsonObj = JSON.parse(apiResult.Result);

            this.AppliedLeaveType = jsonObj.AppliedLeaveType;
            if (jsonObj.hasOwnProperty("RequiredDashboardCards")) {
              this.RequiredDashboardCards = [];
              this.RequiredDashboardCards = JSON.parse(jsonObj.RequiredDashboardCards);
            }
            console.log('ESS DASHBOARD BY EMPLOYEE ', jsonObj)
            if (jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0) {
              this.ESS_EmployeeBasicDetails = jsonObj.EmployeeBasicDetails[0];
            }

            // this._UpComingBirthdayList = jsonObj.UpcomingBirthdayList;
            // this.WorkShiftDefinition = jsonObj.WorkShiftDefinition; old one

            if (jsonObj.AttendanceTrend == "[]") {
              jsonObj.AttendanceTrend = [];
            }

            jsonObj.AttendanceTrend != null && jsonObj.AttendanceTrend.length > 0 && jsonObj.AttendanceTrend.forEach(el => {
              if (el.AttendanceBreakUpDetailsType == 100) {
                this.TotalPresent = Number(this.TotalPresent) + Number(1);
              } else if (el.AttendanceBreakUpDetailsType == 200) {
                this.TotalAbsent = Number(this.TotalAbsent) + Number(0.5);
                this.TotalPresent = Number(this.TotalPresent) + Number(0.5);
              }
              else if (el.AttendanceBreakUpDetailsType == 300) {
                this.TotalAbsent = Number(this.TotalAbsent) + Number(0.5);
                this.TotalPresent = Number(this.TotalPresent) + Number(0.5);
              }
              else if (el.AttendanceBreakUpDetailsType == 400) {
                this.TotalAbsent = Number(this.TotalAbsent) + Number(1);
              }
            });

            this.TotalPresent_percentage = Math.round((100 * this.TotalPresent) / 7);
            this.TotalAbsent_percentage = Math.round((100 * this.TotalAbsent) / 7);

            // if (this.WorkShiftDefinition != null) { old one
            //   // this.WorkShiftDefinition.StartTime=  moment(new Date() + ' ' + this.WorkShiftDefinition.StartTime);
            //   let patternedDate = moment().format('YYYY-MM-DD');
            //   this.WorkShiftDefinition.StartTime = new Date(`${patternedDate} ` + this.WorkShiftDefinition.StartTime);
            //   this.WorkShiftDefinition.EndTime = new Date(`${patternedDate} ` + this.WorkShiftDefinition.EndTime);

            // }


            jsonObj != null && this.doDashboardChartDetails(jsonObj); //not needed in dashboard screen
            res(jsonObj)
          } else {
            rej(false);
            this.IsEssAPIError = true;
          }
        } catch (error) {
          this.IsEssAPIError = true;
          res(true);
        }
      });
    })
    return promise;

  }
  getItem() {
    return 11;
  }

  doDashboardChartDetails(jsonObj) {

    try {

      if (jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0) {
        this.EmployeeBasicDetails = jsonObj.EmployeeBasicDetails;
        this.EmployeeName = jsonObj.EmployeeBasicDetails[0].EmployeeName;
        this.EmployeeCode = jsonObj.EmployeeBasicDetails[0].EmployeeCode;
        this._ESSDashboardDetails = jsonObj;
      }

    } catch (error) {
      console.error('ESS EXECPTION ::', error);
    }
  }


  // EMPLOYEE ATTENDANCE

  async GetAttendanceConfigurationByEmployeeId(employeeId) {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetAttendanceConfigurationByEmployeeId(employeeId).pipe(takeUntil(this.stopper))
        .subscribe((configResponse) => {
          console.log('ATTEN CONFIG :: ', configResponse);
          var jString: apiResult = configResponse as any;
          if (jString.Status && jString.Result != null) {
            this._attenConfig = jString.Result as any;
            this.ShouldShowPunchInBtn = this._attenConfig.IsPresentByDefault == false ? this.isAttendanceAllowed : false;
            res(configResponse);
          } else {
            res(false);
          }
        });
    })
    return promise;
  }


  GetEmployeeBreakupDetailsByCurrentDate(employeeId: any, activity: any): any {

    const promise = new Promise((resolve, reject) => {
      this.attendanceService.GetEmployeeBreakupDetailsByCurrentDate(employeeId).pipe(takeUntil(this.stopper))
        .subscribe((data) => {

          try {
            let apiR: apiResult = data;
            this.attendContentSpin = false;
            if (apiR.Status && apiR.Result != null) {
              console.log('EABREAK UP BY CURRENT DATE ::', JSON.parse(apiR.Result));
              let respons = JSON.parse(apiR.Result);
              // this.IsHoliday = respons.IsHoliday;
              // if (!this._attenConfig.IsAllowToPunchOnHoliday && this.IsHoliday == 1) {
              //   this.ShouldShowPunchInBtn = false;
              // } else if (this._attenConfig.IsAllowToPunchOnHoliday && this.IsHoliday == 1) {
              //   this.ShouldShowPunchInBtn = true;
              // }

              if (activity != 'initialStage') { // when punch in/out trigger
                this.mappingpunchinoutdetails(respons);
              }
              resolve(respons);
            } else {
              reject(false);
            }

          } catch (error) {
            this.attendContentSpin = false;
            reject(false);
          }

        }, err => {

        })
    });

    return promise;

  }

  mappingpunchinoutdetails(respons) {
    this.tobeHidden = false;
    let LstBreakupDetails = [];
    LstBreakupDetails = respons.LstEmployeeAttendanceBreakUpDetails != null && respons.LstEmployeeAttendanceBreakUpDetails.length > 0 ? respons.LstEmployeeAttendanceBreakUpDetails : [];
    if (LstBreakupDetails.length > 0 && LstBreakupDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined) {

      this.FSI = LstBreakupDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).FirstCheckIn != undefined ? LstBreakupDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).FirstCheckIn : '--:--'
      this.LSO = LstBreakupDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).LastCheckedOut != undefined ? LstBreakupDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).LastCheckedOut : '--:--'
      if (LstBreakupDetails.find(z => z.hasOwnProperty('LstEmployeeAttendancePunchInDetails') == false)) {
        this.PunchInOutText = 'Punch In';
      }
      if (LstBreakupDetails.find(z => z.hasOwnProperty('LstEmployeeAttendancePunchInDetails') == true && z.LstEmployeeAttendancePunchInDetails.find(c => c.hasOwnProperty("FinishTime") == false))) {
        this.PunchInOutText = 'Punch Out';
      }
      if (LstBreakupDetails.find(z => z.hasOwnProperty('LstEmployeeAttendancePunchInDetails') == true && z.LstEmployeeAttendancePunchInDetails.find(c => c.hasOwnProperty("FinishTime") == true && c.FinishTime == null))) {
        this.PunchInOutText = 'Punch Out';
      }
      if (this.FSI != '--:--' && this.LSO != '--:--' && this._attenConfig.IsAllowMultiplePunches == false) {
        this.tobeHidden = true;
      }

      // if (this.FSI != '--:--') {
      var timeStart = new Date(`${this.preferredDate} ` + this.FSI);
      // alert(this._attenConfig.IsAllowMultiplePunches);
      // let k = moment(timeStart, 'DD-MMM-YYYY HH:mm:ss a', true).isValid()
      // alert(k)



      //   // this.FSI = moment(timeStart, 'HH:mm:ss:');
      //   this.PunchInOutText = 'Punch Out';
      // }
      // if (this.FSI != '--:--' && this.LSO != '--:--') {
      //   // var timeStart = new Date(`${_curtdate} ` + this.FSI);
      //   // this.FSI = moment(timeStart, 'HH:mm:ss');
      //   // var timeStart1 = new Date(`${_curtdate} ` + this.LSO);
      //   // this.LSO = moment(timeStart1, 'HH:mm:ss');

      //   this.PunchInOutText = 'Punch In';
      // }
      // if (LstBreakupDetails[0].FirstCheckIn != null && LstBreakupDetails[0].LastCheckedOut != null) {
      //   this.tobeHidden = true;
      // }
    }
  }

  GetEmployeeEntitlementList(employeeId) {
    const promise = new Promise((resolve, reject) => {
      this._EmployeeEntitlement = [];
      this.attendanceService.GetEmployeeEntitlementList(employeeId, EntitlementType.Leave).pipe(takeUntil(this.stopper)).subscribe((result) => {
        let apiResult: apiResult = result;
        console.log('RES ENTITLEMENTLIST::', apiResult);
        this.TotalBalance = 0;
        this.TotalUsed = 0;
        this.leaveContentSpin = false;
        if (apiResult.Status && apiResult.Result != null) {
          // this.GetUpcomingLeaveRequestByEmployeeId(employeeId);
          this._EmployeeEntitlement = apiResult.Result as any;
          this._EmployeeEntitlement != null && this._EmployeeEntitlement.length > 0 && this._EmployeeEntitlement.forEach(element => {
            if (element.ShowBalanceInUI) {
              this.TotalBalance = Number(this.TotalBalance) + Number(element.AvailableUnits);
              this.TotalUsed = Number(this.TotalUsed) + Number(element.EligibleUnits);
            }
          });
          this.TotalBalance = Math.round(this.TotalBalance);
          resolve(true);
        } else {
          reject(false);
        }
        resolve(true);

      }, err => {
        reject(false);
        console.warn('ERR ::', err);
      });
    })
    return promise;

  }

  getTwoLetter(str) {
    return str != null ? str.substring(0, 3) : '.';
  }

  GetUpcomingLeaveRequestByEmployeeId(employeeId) {
    const promise = new Promise((resolve, reject) => {
      this._EmployeeEntitlementAvailmentRequest = [];
      this.attendanceService.GetUpcomingLeaveRequestByEmployeeId(employeeId).pipe(takeUntil(this.stopper)).subscribe((result) => {
        let apiResult: apiResult = result;
        console.log('RES ENTITLEMENTLIST REQUEST::', apiResult);
        // this.leaveContentSpin = false;
        if (apiResult.Status && apiResult.Result != null) {
          console.log('dsaf', JSON.parse(apiResult.Result));
          let ii = JSON.parse(apiResult.Result)
          this._EmployeeEntitlementAvailmentRequest = ii.LstEntitlementAvailmentRequest as any;
          this._EmployeeEntitlementAvailmentRequest.length > 0 ? this._EmployeeEntitlementAvailmentRequest = this._EmployeeEntitlementAvailmentRequest.filter(a => a.Status == 100 || a.Status == 400) : true;
          this._EmployeeEntitlementAvailmentRequest != null && this._EmployeeEntitlementAvailmentRequest.length > 0 && this._EmployeeEntitlementAvailmentRequest.forEach(element => {
            element['LeaveTypeName'] = this._EmployeeEntitlement.find(a => a.Id == element.EmployeeEntitlementId) == undefined ? '---' : this._EmployeeEntitlement.find(a => a.Id == element.EmployeeEntitlementId).DisplayName;
          });
          resolve(true);
        } else {
          reject(false);
        }

      }, err => {
        reject(false);
        console.warn('ERR ::', err);
      });
    })
    return promise;

  }
  onChangeMonth(month) {
    console.log(month);
    this.selectedMonth = month;
    this.selectedMonthName = this.monthList.find(a => a.id == this.selectedMonth).name;
    var startDate = moment([this.selectedYear, month - 1]);
    var endDate = moment(startDate).endOf('month');
    this.startOfMonth = moment(startDate).format('YYYY-MM-DD');
    this.endOfMonth = moment(endDate).format('YYYY-MM-DD');
    this.getClientDashboardDetails();

  }
  onChangeYear(year) {
    this.selectedYear = year;
    var startDate = moment([year, this.selectedMonth - 1]);
    var endDate = moment(startDate).endOf('month');
    this.startOfMonth = moment(startDate).format('YYYY-MM-DD');
    this.endOfMonth = moment(endDate).format('YYYY-MM-DD');
    this.getClientDashboardDetails();

  }
  getClientDashboardDetails() {
    this.spinner_client = true;
    const promise = new Promise((resolve, reject) => {
      this.attendanceService.getClientDashboardDetails(this.companyId, this.clientId, this.clientContractId, 0, this.startOfMonth, this.endOfMonth).pipe(takeUntil(this.stopper)).subscribe((result) => {
        let apiResult: apiResult = result;
        console.log('DASHBOARD MANAG', apiResult);
        if (apiResult.Status && apiResult.Result != null) {
          this.ClientDashboardData = JSON.parse(apiResult.Result);
          this.ClientInfoBox = Object.assign({}, this.ClientDashboardData.InfoBarData[0]);
          console.log('Client Dashboard :  ', JSON.parse(apiResult.Result));
          this.spinner_client = false;
          resolve(true);
        } else {
          this.spinner_client = false;
          reject(false);
        }
      }, err => {
        this.spinner_client = false;
        reject(false);
        console.warn('ERR ::', err);
      });
    });
    return promise;
  }


  GetDashboardDetailsByRoleCodeAndUserId() {
    const promise = new Promise((resolve, reject) => {
      this.DashboardNotificationList = [];
      this._UpComingBirthdayList = [];
      this.HolidayList = [];
      var i1 = this.businessType != 3 ? this.sessionService.getSessionStorage('default_SME_ClientId') == null ? 0 : this.sessionService.getSessionStorage('default_SME_ClientId') : 0;
      var i2 = this.businessType != 3 ? this.sessionService.getSessionStorage('default_SME_ContractId') == null ? 0 : this.sessionService.getSessionStorage('default_SME_ContractId') : 0;
      var _userId = this.businessType != 3 ? this.UserId : this.UserId;
      this.attendanceService.GetDashboardDetailsByRoleCodeAndUserId(i1, i2, 0, _userId, this.RoleCode).pipe(takeUntil(this.stopper)).subscribe((result) => {
        let apiResult: apiResult = result;
        console.log('DASHBOARD DETAILS BY ROLE&USER :: ', apiResult);
        this.UpcomingBirthdaySpin = false;
        this.NotificationSpin = false;
        if (apiResult.Status && apiResult.Result != null) {
          var obj = JSON.parse(apiResult.Result);
          this._UpComingBirthdayList = obj.UpcomingBirthdayList;
          this.DashboardNotificationList = obj.DashboardNotificationList as any;
          this.HolidayList = obj.HolidayList;
          resolve(true);
        } else {
          reject(false);
        }

      }, err => {
        reject(false);
        console.warn('ERR ::', err);
      });
    });
    return promise;

  }

  randomlyUpdateQuotes() {
    const arr = ["Have a pleasant day", "Have a Good Day", "Have a safe day", "Make good choices", "Enjoy your new day", "Today is a new day.", ""];
    // var arr = ["Have a pleasant day"];
    this.randomText = arr[Math.floor(Math.random() * arr.length)]; //Pluck a random Text
  }

  shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  getFlexipleEmployeeName(str) {
    if (str != null) {
      str = str.toLowerCase().toString();
      const arr = str.split(" ");
      for (var i = 0; i < arr.length; i++) {
        arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].slice(1);
      }
      const str2 = arr.join(" ");
      return str2;
    }
  }


  navigateMyAttendance() {
    this.router.navigate(['app/attendance/employeeattendance']);
  }

  getNotificationContent(content) {
    // this.data = this.sanitizer.sanitize(res);
    /* OR */
    return this.sanitizer.bypassSecurityTrustHtml(content);
  }


  // events
  // public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
  //   console.log(event, active);
  // }

  // public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
  //   console.log(event, active);
  // }

  // public randomize(): void {
  //   // Only Change 3 values
  //   const data = [
  //     Math.round(Math.random() * 100),
  //     59,
  //     80,
  //     (Math.random() * 100),
  //     56,
  //     (Math.random() * 100),
  //     40];
  //   this.barChartData[0].data = data;
  // }


  roundedCornerBarChart() {
    Chart['elements'].Rectangle.prototype.draw = function () {

      var ctx = this._chart.ctx;
      var vm = this._view;
      var left, right, top, bottom, signX, signY, borderSkipped, radius;
      var borderWidth = vm.borderWidth;
      // Set Radius Here
      // If radius is large enough to cause drawing errors a max radius is imposed
      var cornerRadius = 20;

      if (!vm.horizontal) {
        // bar
        left = vm.x - vm.width / 2;
        right = vm.x + vm.width / 2;
        top = vm.y;
        bottom = vm.base;
        signX = 1;
        signY = bottom > top ? 1 : -1;
        borderSkipped = vm.borderSkipped || 'bottom';
      }

      // Canvas doesn't allow us to stroke inside the width so we can
      // adjust the sizes to fit if we're setting a stroke on the line
      if (borderWidth) {
        // borderWidth shold be less than bar width and bar height.
        var barSize = Math.min(Math.abs(left - right), Math.abs(top - bottom));
        borderWidth = borderWidth > barSize ? barSize : borderWidth;
        var halfStroke = borderWidth / 2;
        // Adjust borderWidth when bar top position is near vm.base(zero).
        var borderLeft = left + (borderSkipped !== 'left' ? halfStroke * signX : 0);
        var borderRight = right + (borderSkipped !== 'right' ? -halfStroke * signX : 0);
        var borderTop = top + (borderSkipped !== 'top' ? halfStroke * signY : 0);
        var borderBottom = bottom + (borderSkipped !== 'bottom' ? -halfStroke * signY : 0);
        // not become a vertical line?
        if (borderLeft !== borderRight) {
          top = borderTop;
          bottom = borderBottom;
        }
        // not become a horizontal line?
        if (borderTop !== borderBottom) {
          left = borderLeft;
          right = borderRight;
        }
      }

      ctx.beginPath();
      ctx.fillStyle = vm.backgroundColor;
      ctx.strokeStyle = vm.borderColor;
      ctx.lineWidth = borderWidth;

      // Corner points, from bottom-left to bottom-right clockwise
      // | 1 2 |
      // | 0 3 |
      var corners = [
        [left, bottom],
        [left, top],
        [right, top],
        [right, bottom]
      ];

      // Find first (starting) corner with fallback to 'bottom'
      var borders = ['bottom', 'left', 'top', 'right'];
      var startCorner = borders.indexOf(borderSkipped, 0);
      if (startCorner === -1) {
        startCorner = 0;
      }

      function cornerAt(index, isTop) {
        return isTop ? corners[(startCorner + index) % 4] : corners[(startCorner + 3 - index) % 4];
      }

      // Draw rectangle from 'startCorner'
      var corner = cornerAt(0, true);
      var width, height, x, y, nextCorner, nextCornerId;
      ctx.moveTo(corner[0], corner[1]);

      for (var i = 1; i < 4; i++) {
        corner = cornerAt(i, true);
        nextCornerId = i + 1;
        if (nextCornerId == 4) {
          nextCornerId = 0
        }

        nextCorner = cornerAt(nextCornerId, true);

        width = corners[2][0] - corners[1][0];
        height = corners[0][1] - corners[1][1];
        x = corners[1][0];
        y = corners[1][1];

        radius = cornerRadius;
        // Fix radius being too large        
        if (radius > Math.abs(height) / 2) {
          radius = Math.floor(Math.abs(height) / 2);
        }
        if (radius > Math.abs(width) / 2) {
          radius = Math.floor(Math.abs(width) / 2);
        }
        // draw corners
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);

        ctx.lineTo(x + width, y + height);
        ctx.lineTo(x, y + height);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
      }

      ctx.fill();
      if (borderWidth) {
        ctx.stroke();
      }
    };
  }

  ngOnDestroy() {
    this.stopper.next();
    this.stopper.complete();
  }
} 
