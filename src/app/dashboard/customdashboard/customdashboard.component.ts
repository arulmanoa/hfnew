import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { HeaderService } from '../../_services/service/header.service';
import { AlertService } from '../../_services/service/alert.service';
import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label, MultiDataSet, Color } from 'ng2-charts';
import { SearchService } from '../../_services/service/search.service';
import { SessionKeys } from '../../_services/configs/app.config';
import { SessionStorage } from '../../_services/service/session-storage.service';
import { LoginResponses } from '../../_services/model';
import { apiResult } from '../../_services/model/apiResult';
import { from } from 'rxjs';
import { DashboardDetails } from '../../_services/model/Dashboard/Dashboard';
import * as _ from 'lodash';
import { Title } from '@angular/platform-browser';
import { data } from 'jquery';
import { LoadingScreenService } from '../../shared/components/loading-screen/loading-screen.service';
import { EmployeeService, CommonService } from '../../_services/service';
import * as moment from 'moment';
import { environment } from 'src/environments/environment';
import { AttendanceService } from '../../_services/service/attendnace.service';
import { AttendanceConfiguration } from '../../_services/model/Attendance/AttendanceConfiguration';
import { letProto } from 'rxjs-compat/operator/let';
import { EmployeeAttendanceBreakUpDetails, EmployeeAttendancePunchInDetails } from '../../_services/model/Attendance/EmployeeAttendanceDetails';
import { AttendanceBreakUpDetailsStatus, AttendanceBreakUpDetailsType } from '../../_services/model/Attendance/AttendanceEnum';
import { AttendanceType } from '../../_services/model/Payroll/Attendance';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { apiResponse } from '../../_services/model/apiResponse';
import { EmployeeLookUp } from '../../_services/model/Employee/EmployeeLookup';

import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ImagecaptureModalComponent } from '../../shared/modals/attendance/imagecapture-modal/imagecapture-modal.component';
import { PunchAttendanceModel } from '../../_services/model/Attendance/PunchAttendanceModel';

@Component({
  selector: 'app-customdashboard',
  templateUrl: './customdashboard.component.html',
  styleUrls: ['./customdashboard.component.scss']
})
export class CustomdashboardComponent implements OnInit {
  isEmployeeLogin: boolean = false;
  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  EmployeeName: any;
  shouldHide: boolean = true;
  greet: string = '';
  public barChartOptions: ChartOptions = {
    responsive: true,
  };
  public barChartLabels: Label[] = ['2006', '2007', '2008', '2009', '2010', '2011', '2012'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [];

  public barChartData: ChartDataSets[] = [
    { data: [65, 59, 80, 81, 56, 55, 40], label: 'Series A' },
    { data: [28, 48, 40, 19, 86, 27, 90], label: 'Series B' }
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

  spinner: boolean = true;

  // ESS PORTAL DASHBOARD

  _ESSDashboardDetails: any;

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
  _attenConfig: AttendanceConfiguration = new AttendanceConfiguration();
  PunchInOutText: any = 'Punch In';
  time = new Date();
  preferredDate = new Date();
  intervalId;
  ShouldShowPunchInBtn: boolean = false;
  LstEmployeeAttendanceBreakUpDetails: EmployeeAttendanceBreakUpDetails[] = [];
  lstlookUpDetails: EmployeeLookUp;

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
    private modalService : NgbModal

    // public _http : HttpClient


  ) {
    // this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    // this.router.onSameUrlNavigation = 'reload';

    // this.activatedroute.params.subscribe(val => {
    //   // put the code from `ngOnInit` here
    //   this.onRefresh();
    // });
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;


    this.shouldHide = true;
    this.filterSeletedValue = "TODAY";
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

    // this.router.routeReuseStrategy.shouldReuseRoute = function () {
    //   // alert('sss')
    //   return false;
    // };

    this.onRefresh();


  }

  onRefresh() {
    // OLD
    this.spinner = true;

    this.intervalId = setInterval(() => {
      this.time = new Date();
    }, 1000);


    this.HRRoleCode = environment.environment.HRRoleCode;

    if (sessionStorage.getItem('isEmployee') != null && sessionStorage.getItem('isEmployee') == 'true') {
      this.isEmployeeLogin = true;
    } else {
      this.isEmployeeLogin = false;
    }
    this.sessionService.watchStorage().subscribe((data: any) => {
      console.log('data ::::', data,);

      if (data == 'true') {
        this.isEmployeeLogin = true;
      } else {
        this.isEmployeeLogin = false;
      }
    })


   

    history.pushState(null, null, document.URL);
    window.addEventListener('popstate', function () {

      history.pushState(null, null, document.URL);
    });

    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // get session storage
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    // this.EmployeeName = this._loginSessionDetails.UserSession.PersonName; wrongly mapped 
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.isManager = this.RoleCode == "Manager" ? true : false;
    this.businessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.companyId = this._loginSessionDetails.Company.Id; // bind Logged user id may be change baed on dashboard 
    if (this.businessType == 3) {
      this.clientId = 0;
      this.clientContractId = 0;
    } else {
      this.clientId = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.clientContractId = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
    }
    this.headerService.setTitle('Dashboard');
    this.titleService.setTitle('Dashboard');
    if (this.RoleCode == 'Employee') {
      this.spinner = true;
      this.visitorsDayFunction();
      this.getWeekOff().then(() => {
        this.isCheckCurrentDate = true;
        this.GetISTServerTime().then(() => console.log("GET IST TIME - Task Complete!"));

      });


    }

    this.onChangeFilter("TODAY");
    // location.reload();
  }

  GetISTServerTime() {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetISTServerTime()
        .subscribe((ress) => {
          console.log('IST TIME ::', ress);
          let apiR: apiResult = ress;
          if (apiR.Status) {
            let UILocalTime = new Date();
            this.preferredDate = new Date(apiR.Result);
            this.time = new Date(apiR.Result);
            if (moment(UILocalTime).format('YYYY-MM-DD') == moment(this.preferredDate).format('YYYY-MM-DD')) {
              this.isCheckCurrentDate = true;
            } else {
              this.isCheckCurrentDate = false;
            }

            if (this.isCheckCurrentDate && this.weekOffs.includes(this.preferredDate.getDay()) == false) {
              this.isCheckCurrentDate = true;
            } else {
              this.isCheckCurrentDate = false;
            }
          }
          res(true);

        })
    });
    return promise;
  }



  getWeekOff() {
    this.weekOffs = [];
    const _employeeCode = sessionStorage.getItem('loginUserId');
    var promise = new Promise((resolve, reject) => {
      this.attendanceService.getWeekOff(_employeeCode)
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
            this.sessionService.setSesstionStorage('weekOffs', JSON.stringify(this.weekOffs));


            resolve(true);
          } else {
            resolve(false);

          }

        })
    });
    return promise;
  }

  onChangeFilter(event) {

    this.spinner = true;
    let fromDate = "2020-01-01";
    let toDate = "2020-02-25";
    let filterValue = event;

    let req_params_Uri = `${this.RoleId}/${fromDate}/${toDate}/${this.companyId}/${this.clientId}/${this.clientContractId}/${this.businessType}/${filterValue}`;

    this.searchService.getDashboardDetails(req_params_Uri).subscribe((result) => {
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
        let items: any;

        items = this.BarchartDate.ChartData

        items.forEach(element => {


          var i = element.data,
            j = i.replace(/([a-zA-Z0-9]+?):/g, '"$1":').replace(/'/g, '"'),
            k = JSON.parse(j);
          element.data = k
          console.log(k)


        });
        this.barChartData = items;


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





  // ESS PORTAL

  visitorsDayFunction() {
    this.spinner = true;
    var myDate = new Date();
    var hrs = myDate.getHours();

    if (hrs < 12)
      this.greet = 'Good Morning';
    else if (hrs >= 12 && hrs <= 16)
      this.greet = 'Good Afternoon';
    else if (hrs >= 16 && hrs <= 24)
      this.greet = 'Good Evening';
    this.GetESSDashboardDetails();
  }

  GetESSDashboardDetails() {
    this.ShouldShowPunchInBtn = false;
    const req_params_Uri = `${sessionStorage.getItem('loginUserId')}`;
    this.searchService.getESSDashboardDetails(req_params_Uri).subscribe((result) => {
      let apiResult: apiResult = result;
      this.SalaryBreakup = [];
      this.LstEmployeeAttendanceBreakUpDetails = [];
      if (apiResult.Status) {
        var jsonObj = JSON.parse(apiResult.Result);
        console.log('DASHBOARD JSON OBJECT ::', jsonObj);

        this.GetAttendanceConfiguration(req_params_Uri).then((configResponse) => {
          console.log('ATTEN CONFIG :: ', configResponse);
          var jString: apiResult = configResponse as any;
          if (jString.Status && jString.Result != null) {
            this._attenConfig = jString.Result as any;
            this.ShouldShowPunchInBtn = this._attenConfig.IsPresentByDefault == false ? true : false;
            console.log('sss', this._attenConfig)
          }
        });
               jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0 ? this.sessionService.setSesstionStorage('employeeBasicDetails', jsonObj.EmployeeBasicDetails.find(a => a.EmployeeCode.toUpperCase() == req_params_Uri.toUpperCase())) : true;
        this.EmployeeBasicDetails = jsonObj.EmployeeBasicDetails != null && jsonObj.EmployeeBasicDetails.length > 0 ? jsonObj.EmployeeBasicDetails : [];
        this.EmployeeName = jsonObj.EmployeeBasicDetails.find(a => a.EmployeeCode.toUpperCase() == req_params_Uri.toUpperCase()).EmployeeName;
        this._ESSDashboardDetails = jsonObj;
        this._EmployeeEntitlement = jsonObj.EmployeeEntitlement;
        var _BarCharSalaryBreaupData = this._ESSDashboardDetails.SalaryTrend;
        this.AttendancePeriod = jsonObj.AttendancePeriod;
        jsonObj.LstEmployeeAttendanceBreakUpDetails != null && jsonObj.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.remappingDailyAttendanceDetails(jsonObj.LstEmployeeAttendanceBreakUpDetails);
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

  async GetAttendanceConfiguration(obj) {
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetAttendanceConfigurationByEmployeeCode(obj)
        .subscribe((response) => {
          res(response);
        })
    })
    return promise;
  }


  changeBreakup(index, item) {
    this.selectedIndex = index;
    this.onChangePayPeriod_donutChart();
    // var i;
    // this.doughnutChartData = [];
    // if (index == 2) {

    //   this.doughnutChartData = ["23456", '3411', "6789", '6666'] as any;
    // } else if (index == 3) { this.doughnutChartData = ["34540", '2500', "3400", '200'] as any; } else { this.doughnutChartData = [24569, 13450, 2000, 1245] as any; };


  }

  onChangePayPeriod_donutChart() {
    this.onInvestmentDecl_HRA();
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
    this.employeeService.downloadPaySlip(this.ActiveSalaryBreakupTransactionId)
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

  onInvestmentDecl_HRA() {

    if (this._ESSDashboardDetails.SalaryBreakup != null && this._ESSDashboardDetails.SalaryBreakup.length > 0 && this._ESSDashboardDetails.SalaryBreakup[0].hasOwnProperty('Taxitemdata')
    ) {
      this._ESSDashboardDetails.SalaryBreakup[0].Taxitemdata != null && this._ESSDashboardDetails.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'Basic') != undefined && this.sessionService.setSesstionStorage('HRA_Annual_Basic', (this._ESSDashboardDetails.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'Basic').Amount));
      this._ESSDashboardDetails.SalaryBreakup[0].Taxitemdata != null && this._ESSDashboardDetails.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'HRA') != undefined && this.sessionService.setSesstionStorage('HRA_Annual_HRA', (this._ESSDashboardDetails.SalaryBreakup[0].Taxitemdata.find(a => a.ProductCode == 'HRA').Amount));

    } else {
      this.sessionService.setSesstionStorage('HRA_Annual_Basic', 0);
      this.sessionService.setSesstionStorage('HRA_Annual_HRA', 0);
    }



  }

  remappingDailyAttendanceDetails(LstEABDetails) {
    this.tobeHidden = false;
    console.log('Lst EA BDetails', LstEABDetails);
    if (LstEABDetails != null && LstEABDetails.length > 0 &&
      LstEABDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined) {

      this.FSI = LstEABDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).FirstCheckIn != undefined ? LstEABDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).FirstCheckIn : '--:--'
      this.LSO = LstEABDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).LastCheckedOut != undefined ? LstEABDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).LastCheckedOut : '--:--'
      if (this.FSI != '--:--') {
        this.PunchInOutText = 'Punch Out';
      }
      if (this.FSI != '--:--' && this.LSO != '--:--') {
        this.PunchInOutText = 'Punch In';
      }
      if (LstEABDetails[0].FirstCheckIn != null && LstEABDetails[0].LastCheckedOut != null) {
        this.tobeHidden = true;
      }
    }
    this.LstEmployeeAttendanceBreakUpDetails = [];
    this.LstEmployeeAttendanceBreakUpDetails = LstEABDetails;
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

    if (this._attenConfig.IsGeoFenceRequired) {
      this.commonService.getPosition().then(pos => {
        this.position = pos;
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
        if(err.message =='User denied Geolocation'){
          return;
        }
      });
    }
    this.PhotoId = 0;
    this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng }) : null;
  
    this.punchInSpinner = true;

    if (this.PunchInOutText === 'Punch In' && this._attenConfig.IsImageCaptureRequiredWhilePunchIn) {
      this.triggerImageCapture_modalPopup().then((result) => {
        if (result != null && result != 'Cannot read UserMedia from MediaDevices.' && result != 'Permission denied') {
          this.PunchInImageId = result;
          this.PhotoId = result;
          this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng }) : null;
          if (this.PunchInImageId == null || this.PunchInImageId == undefined || this.PunchInImageId == 0) {
            this.punchInSpinner = false;
            this.alertService.showInfo('Note: For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
          this.callbacktoggelTimer();
          return;
        }  else if(result == 'Cannot read UserMedia from MediaDevices.') {
          this.PunchInImageId = 0;
          this.PhotoId = 0;
          this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0 });;
         
          // this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          this.callbacktoggelTimer();
          // return;
          // this.alertService.showWarning("Action required : Please update your image.");
          // return;
        }
        else if(result == 'Permission denied'){
          this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          return;
        }
        else {
          this.punchInSpinner = false;
          // this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          return;
        }
      });
    }
    else if (this.PunchInOutText === 'Punch Out' && this._attenConfig.IsImageCaptureRequiredWhilePunchOut) {
      this.triggerImageCapture_modalPopup().then((result) => {
        if (result != null && result != 'Cannot read UserMedia from MediaDevices.' && result != 'Permission denied') {
          this.PunchOutImageId = result;
          this.PhotoId = result;
          this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng }) : null;

          if (this.PunchOutImageId == null || this.PunchOutImageId == undefined || this.PunchOutImageId == 0) {
            this.punchInSpinner = false;
            this.alertService.showInfo('Note: For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
            return;
          }
          this.callbacktoggelTimer();
          return;
        } else if(result == 'Cannot read UserMedia from MediaDevices.') {
          this.PunchOutImageId = 0;
          this.PhotoId = 0;
          this.Coordinates = this._attenConfig.IsGeoFenceRequired && this.position != null ? JSON.stringify({ "Altitude": 0.0, "Latitude": this.position.lat, "Longitude": this.position.lng }) : JSON.stringify({ "Altitude": 0.0, "Latitude": 0.0, "Longitude": 0.0 });

          // this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          this.callbacktoggelTimer();
          // return;
          // this.alertService.showWarning("Action required : Please update your image.");
          // return;
        }
        else if(result == 'Permission denied'){
          this.punchInSpinner = false;
          this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          return;
        }
        else {
          this.punchInSpinner = false;
          // this.alertService.showInfo('Action required : For your security, we need permission to access the camera to enter attendance. Without it, this application will not be in a position to discover.');
          return;
        }
      });
    }

   else {
     this.callbacktoggelTimer();
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


  callbacktoggelTimer(){
    
  
  var runningAPId = this.AttendancePeriod.find(a => (moment(a.EndDate).format('M')) == this.EmployeeBasicDetails[0].PayrollMonth && new Date(a.EndDate).getFullYear() == this.EmployeeBasicDetails[0].PayrollYear).Id;
  var runningAPCycle = this.AttendancePeriod.find(a => (moment(a.EndDate).format('M')) == this.EmployeeBasicDetails[0].PayrollMonth && new Date(a.EndDate).getFullYear() == this.EmployeeBasicDetails[0].PayrollYear).AttendanceCycleId;

  this.PunchInOutText === 'Punch In' ? this.FSI = moment().format('HH:mm:ss') : this.LSO = moment().format('HH:mm:ss');

  (this.PunchInOutText === 'Punch In' && !this._attenConfig.IsAutoPunchOutEnabled) ? this.PunchInOutText = 'Punch Out' : this.PunchInOutText = 'Punch In';
  // this.tobeHidden = this._attenConfig.IsAutoPunchOutEnabled == true ? true : false;
  let AttendanceStartDateTime: Date;
  AttendanceStartDateTime = new Date();

  let AttendanceEndDateTime: Date;
  AttendanceEndDateTime = new Date();

  var totalHrs: number = 0;
  var patternedDate = moment(AttendanceStartDateTime).format('YYYY-MM-DD');
  var timeStart = new Date(`${patternedDate} ` + this.FSI);
  var j = this.LSO != '--:--' ? moment(AttendanceEndDateTime + ' ' + this.LSO) : null;
  if (j != null) {
    var timeEnd = new Date(`${patternedDate} ` + this.LSO);
    var fromhrs = moment(timeStart, 'HH:mm');
    var tillhrs = moment(timeEnd, 'HH:mm');
    totalHrs = tillhrs.diff(fromhrs, 'hour');
    var totalMinutes = tillhrs.diff(fromhrs, 'minutes');
    totalHrs = Number(this.parseHours(totalMinutes));
  }
  if (Number.isNaN(totalHrs)) {
    totalHrs = 0
  }

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


  var TotalTimes: number = 0;
  var TotalMinutes: number = 0;

  var empAttendancePunchInDetails = [];
  var empAttendanceBreakupList = [];

  if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0) {

    for (let i = 0; i < this.LstEmployeeAttendanceBreakUpDetails.length; i++) {
      const eles = this.LstEmployeeAttendanceBreakUpDetails[i];

      if (eles.LstEmployeeAttendancePunchInDetails != null && eles.LstEmployeeAttendancePunchInDetails.length > 0) {
        empAttendancePunchInDetails = eles.LstEmployeeAttendancePunchInDetails;
        if (eles.LstEmployeeAttendancePunchInDetails.find(a => a.Starttime != null && a.FinishTime != null) != undefined) {

          var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
          employeeAttendancePunchInDetails.Id = 0;
          employeeAttendancePunchInDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
          employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.LstEmployeeAttendanceBreakUpDetails[0].Id;
          employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
          employeeAttendancePunchInDetails.Starttime = this.FSI;
          employeeAttendancePunchInDetails.FinishTime = null;
          employeeAttendancePunchInDetails.SubmittedHours = 0;
          employeeAttendancePunchInDetails.ApprovedHours = 0;
          employeeAttendancePunchInDetails.RequesterRemarks = '';
          employeeAttendancePunchInDetails.ApproverRemarks = '';
          employeeAttendancePunchInDetails.Status = 1;
          employeeAttendancePunchInDetails.PunchInRemarks = '';
          employeeAttendancePunchInDetails.PunchOutRemarks = '';
          employeeAttendancePunchInDetails.PunchInPhotoId = this.PhotoId // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn ? ele.PunchInImageId : 0;
          employeeAttendancePunchInDetails.PunchOutPhotoId = 0 // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchOut ? ele.PunchOutImageId : 0;
          employeeAttendancePunchInDetails.PunchInCoordinates =  this._attenConfig.IsGeoFenceRequired ? this.Coordinates != null ? JSON.parse(this.Coordinates) : null : null;
          employeeAttendancePunchInDetails.PunchOutCoordinates = null  //this._attendanceConfiguration.IsGeoFenceRequired ? ele.PunchOutCoordinates != null ? JSON.parse(ele.PunchOutCoordinates) : null : null; // ele.PunchOutCoordinates;
         
          empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);

        }
        else if (eles.LstEmployeeAttendancePunchInDetails.find(a => a.Starttime != null && a.FinishTime == null) != undefined) {
          var isnullTime = eles.LstEmployeeAttendancePunchInDetails.find(a => a.FinishTime == null);
          isnullTime.FinishTime = this.LSO;
          isnullTime.SubmittedHours = totalHrs;
          eles.LstEmployeeAttendancePunchInDetails.forEach(ele => {


            if (ele.SubmittedHours != 0) {

              if ((ele.SubmittedHours - Math.floor(ele.SubmittedHours)) !== 0) {
              }
              else {
                ele.SubmittedHours = ele.SubmittedHours.toFixed(2) as any;
              }

              var timeParts = String(ele.SubmittedHours).split(".");
              if (timeParts[1].length == 1) {

                // Too many numbers after decimal.
                timeParts[1] = '0' + timeParts[1];
              }
              var converted = (timeParts[0]) + '.' + (timeParts[1]);

              ele.SubmittedHours = Number(converted);
            }
            var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
            employeeAttendancePunchInDetails.Id = this.commonService.isGuid(ele.Id) == true ? 0 : ele.Id;
            employeeAttendancePunchInDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
            employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.LstEmployeeAttendanceBreakUpDetails[0].Id;
            employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
            employeeAttendancePunchInDetails.Starttime = ele.Starttime;
            employeeAttendancePunchInDetails.FinishTime = ele.FinishTime;
            employeeAttendancePunchInDetails.SubmittedHours = ele.SubmittedHours;
            employeeAttendancePunchInDetails.ApprovedHours = 0;
            employeeAttendancePunchInDetails.RequesterRemarks = '';
            employeeAttendancePunchInDetails.ApproverRemarks = '';
            employeeAttendancePunchInDetails.Status = 1;
            employeeAttendancePunchInDetails.PunchInRemarks = ele.PunchInRemarks;
            employeeAttendancePunchInDetails.PunchOutRemarks = ele.PunchOutRemarks;
            employeeAttendancePunchInDetails.PunchInPhotoId = ele.PunchInPhotoId // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn ? ele.PunchInImageId : 0;
            employeeAttendancePunchInDetails.PunchOutPhotoId = this.PhotoId // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchOut ? ele.PunchOutImageId : 0;
            employeeAttendancePunchInDetails.PunchInCoordinates =  this._attenConfig.IsGeoFenceRequired ? (ele.PunchInCoordinates != null && ele.PunchInCoordinates != undefined) ? JSON.parse(ele.PunchInCoordinates as any): null : null;
            employeeAttendancePunchInDetails.PunchOutCoordinates =  this._attenConfig.IsGeoFenceRequired ? this.Coordinates != null ? JSON.parse(this.Coordinates) : null : null;  //this._attendanceConfiguration.IsGeoFenceRequired ? ele.PunchOutCoordinates != null ? JSON.parse(ele.PunchOutCoordinates) : null : null; // ele.PunchOutCoordinates;
           
            empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);


          });
        }

      }

    }
  }

  else {

    var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
    employeeAttendancePunchInDetails.Id = 0;
    employeeAttendancePunchInDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
    employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = 0;
    employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
    employeeAttendancePunchInDetails.Starttime = this.FSI;
    employeeAttendancePunchInDetails.FinishTime = null;
    employeeAttendancePunchInDetails.SubmittedHours = totalHrs;
    employeeAttendancePunchInDetails.ApprovedHours = 0;
    employeeAttendancePunchInDetails.RequesterRemarks = '';
    employeeAttendancePunchInDetails.ApproverRemarks = '';
    employeeAttendancePunchInDetails.Status = 1;
    employeeAttendancePunchInDetails.PunchInRemarks = '';
    employeeAttendancePunchInDetails.PunchOutRemarks = '';
    employeeAttendancePunchInDetails.PunchInPhotoId = this.PhotoId // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchIn ? ele.PunchInImageId : 0;
    employeeAttendancePunchInDetails.PunchOutPhotoId = 0 // this._attendanceConfiguration.IsImageCaptureRequiredWhilePunchOut ? ele.PunchOutImageId : 0;
    employeeAttendancePunchInDetails.PunchInCoordinates =  this._attenConfig.IsGeoFenceRequired ? (this.Coordinates != null && this.Coordinates != undefined) ? JSON.parse(this.Coordinates) : null : null;
    employeeAttendancePunchInDetails.PunchOutCoordinates = null  //this._attendanceConfiguration.IsGeoFenceRequired ? ele.PunchOutCoordinates != null ? JSON.parse(ele.PunchOutCoordinates) : null : null; // ele.PunchOutCoordinates;
   
    empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);

  }

  var TotalMinutes: number = 0;
  if (empAttendancePunchInDetails != null && empAttendancePunchInDetails.length > 0) {
    empAttendancePunchInDetails.forEach(ee => {
      // TotalMinutes += this.convertH2M(ee.TotalHours);
      ee.SubmittedHours = Number(ee.SubmittedHours);

      if ((ee.SubmittedHours - Math.floor(ee.SubmittedHours)) !== 0) {
        TotalMinutes += this.convertH2M(ee.SubmittedHours);
      }
      else {
        TotalMinutes += this.convertH2M(ee.SubmittedHours.toFixed(2));

      }

    });

  }
  TotalTimes = Number(this.parseHours(TotalMinutes));
  if (Number.isNaN(TotalTimes)) {
    TotalTimes = 0
  }


  if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0) {
    let lastIndex1 = this.LstEmployeeAttendanceBreakUpDetails[0].LstEmployeeAttendancePunchInDetails.length - 1;
    let atlastitem = lastIndex1 == 0 ? 0 : (lastIndex1 - 1);
    let _st1 = this.LstEmployeeAttendanceBreakUpDetails[0].LstEmployeeAttendancePunchInDetails[0].Starttime;
    let _et1 = this.LstEmployeeAttendanceBreakUpDetails[0].LstEmployeeAttendancePunchInDetails[lastIndex1].FinishTime != null ? this.LstEmployeeAttendanceBreakUpDetails[0].LstEmployeeAttendancePunchInDetails[lastIndex1].FinishTime : this.LstEmployeeAttendanceBreakUpDetails[0].LstEmployeeAttendancePunchInDetails[atlastitem].FinishTime;

    if (TotalTimes != 0) {

      if ((TotalTimes - Math.floor(TotalTimes)) !== 0) {
      }
      else {
        TotalTimes = TotalTimes.toFixed(2) as any;
      }

      var timeParts = String(TotalTimes).split(".");
      if (timeParts[1].length == 1) {
        // Too many numbers after decimal.
        timeParts[1] = '0' + timeParts[1];
      }
      var converted = (timeParts[0]) + '.' + (timeParts[1]);

      TotalTimes = Number(converted);
    }



    var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
    employeeAttendanceBreakUpDetails.Id = this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
      this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).Id : 0;
    employeeAttendanceBreakUpDetails.RequesterRemarks = '';
    employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
    employeeAttendanceBreakUpDetails.PayableDay = 9 >= TotalTimes ? 1 : 0;
    employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
    employeeAttendanceBreakUpDetails.AttendanceCode = 'present'; //this.LstAttendanceType.find(a => a.name == 'Present').name;
    employeeAttendanceBreakUpDetails.IsFullDayPresent = 9 >= TotalTimes ? true : false;;
    employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
    employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
    employeeAttendanceBreakUpDetails.LastCheckedOut = _et1 == null || _et1 == undefined ? null : _et1;
    employeeAttendanceBreakUpDetails.FirstCheckIn = _st1 == null ? null : _st1;
    employeeAttendanceBreakUpDetails.AttendanceBreakUpDetailsType = AttendanceBreakUpDetailsType.FullDayPresent;
    employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date()).format('YYYY-MM-DD');
    employeeAttendanceBreakUpDetails.YADId = 0;
    employeeAttendanceBreakUpDetails.AttendancePeriodId = runningAPId;
    employeeAttendanceBreakUpDetails.AttendanceCycleId = runningAPCycle;
    employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
    employeeAttendanceBreakUpDetails.PISId = '0';
    employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
    employeeAttendanceBreakUpDetails.ApproverRemarks = '';
    employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails;
    empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);

  }
  else {

    var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
    employeeAttendanceBreakUpDetails.Id = this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
      this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).Id : 0;
    employeeAttendanceBreakUpDetails.RequesterRemarks = '';
    employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
    employeeAttendanceBreakUpDetails.PayableDay = 9 >= totalHrs ? 1 : 0;
    employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
    employeeAttendanceBreakUpDetails.AttendanceCode = 'present'; //this.LstAttendanceType.find(a => a.name == 'Present').name;
    employeeAttendanceBreakUpDetails.IsFullDayPresent = 9 >= totalHrs ? true : false;;
    employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
    employeeAttendanceBreakUpDetails.TotalSubmittedHours = totalHrs;
    employeeAttendanceBreakUpDetails.LastCheckedOut = this.LSO == '--:--' ? null : this.LSO as any;
    employeeAttendanceBreakUpDetails.FirstCheckIn = this.FSI as any;
    employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date()).format('YYYY-MM-DD');
    employeeAttendanceBreakUpDetails.AttendanceBreakUpDetailsType = AttendanceBreakUpDetailsType.FullDayPresent;
    employeeAttendanceBreakUpDetails.YADId = 0;
    employeeAttendanceBreakUpDetails.AttendancePeriodId = runningAPId;
    employeeAttendanceBreakUpDetails.AttendanceCycleId = runningAPCycle;
    employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
    employeeAttendanceBreakUpDetails.PISId = '0';
    employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
    employeeAttendanceBreakUpDetails.ApproverRemarks = '';
    employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails
    empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);
  }


  // var empAttendancePunchInDetails = [];
  // if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0) {


  //   for (let i = 0; i < this.LstEmployeeAttendanceBreakUpDetails.length; i++) {
  //     const ele = this.LstEmployeeAttendanceBreakUpDetails[i];
  //     if (i > 0) {
  //       var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
  //       employeeAttendancePunchInDetails.Id = this.commonService.isGuid(ele.Id) == true ? 0 : ele.Id;
  //       employeeAttendancePunchInDetails.EmployeeId = this.EmployeeObject.Id;
  //       employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0;
  //       employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
  //       employeeAttendancePunchInDetails.Starttime = ele.StartTime;
  //       employeeAttendancePunchInDetails.FinishTime = ele.EndTime == null ? null : ele.EndTime;
  //       employeeAttendancePunchInDetails.SubmittedHours = ele.TotalHours;
  //       employeeAttendancePunchInDetails.ApprovedHours = 0;
  //       employeeAttendancePunchInDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
  //       employeeAttendancePunchInDetails.ApproverRemarks = '';
  //       employeeAttendancePunchInDetails.Status = 1;
  //       empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);
  //     }
  //   }
  // }

  // if (this.LstPunchInDetails != null && this.LstPunchInDetails.length > 0) {
  //   let lastIndex = this.LstPunchInDetails.length - 1;
  //   var empAttendanceBreakupList = [];
  //   var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
  //   employeeAttendanceBreakUpDetails.Id = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0; // need to change
  //   employeeAttendanceBreakUpDetails.RequesterRemarks = this.attendanceForm.get('remarks').value;
  //   employeeAttendanceBreakUpDetails.Status = 1 // need to change
  //   employeeAttendanceBreakUpDetails.PayableDay = this.actualWorkingHours >= TotalTimes ? 0 : 1;
  //   employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
  //   employeeAttendanceBreakUpDetails.AttendanceCode = this.LstattendanceType.find(a => a.name == 'Present').name;
  //   employeeAttendanceBreakUpDetails.IsFullDayPresent = this.actualWorkingHours >= TotalTimes ? false : true;
  //   employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
  //   employeeAttendanceBreakUpDetails.TotalSubmittedHours = TotalTimes;
  //   employeeAttendanceBreakUpDetails.LastCheckedOut = this.LstPunchInDetails[lastIndex].EndTime == null ?null : this.LstPunchInDetails[lastIndex].EndTime;
  //   employeeAttendanceBreakUpDetails.FirstCheckIn = this.LstPunchInDetails[0].StartTime == null ? null : this.LstPunchInDetails[0].StartTime;
  //   employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
  //   employeeAttendanceBreakUpDetails.YADId = 0;
  //   employeeAttendanceBreakUpDetails.AttendancePeriodId = this.JObject.AttendancePeriod.Id;
  //   employeeAttendanceBreakUpDetails.AttendanceCycleId = this.JObject.AttendancePeriod.AttendanceCycleId;
  //   employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
  //   employeeAttendanceBreakUpDetails.PISId = '0';
  //   employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeObject.Id;
  //   employeeAttendanceBreakUpDetails.ApproverRemarks = '';
  //   employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = empAttendancePunchInDetails;
  //   empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);
  //   console.log('EMPLOYEE BREAKUP DETAILS ::', empAttendanceBreakupList);



  // var empAttendancePunchInOutDetails = [];
  // if (this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 && this.LstEmployeeAttendanceBreakUpDetails.find(a=>a.FirstCheckIn != null && a.LastCheckedOut != null) != undefined) {

  //   var employeeAttendancePunchInDetails = new EmployeeAttendancePunchInDetails();
  //   employeeAttendancePunchInDetails.Id = this.commonService.isGuid(ele.Id) == true ? 0 : ele.Id;
  //   employeeAttendancePunchInDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
  //   employeeAttendancePunchInDetails.EmployeeAttendanceBreakUpDetailsId = this.CalendarObject != null ? this.attendanceForm.get('Id').value : 0;
  //   employeeAttendancePunchInDetails.Attendancedate = moment(new Date(this.preferredDate)).format('YYYY-MM-DD');
  //   employeeAttendancePunchInDetails.Starttime = this.FSI as any;
  //   employeeAttendancePunchInDetails.FinishTime = this.LSO == '--:--' ? null : this.LSO as any;
  //   employeeAttendancePunchInDetails.SubmittedHours = totalHrs;
  //   employeeAttendancePunchInDetails.ApprovedHours = 0;
  //   employeeAttendancePunchInDetails.RequesterRemarks = '';
  //   employeeAttendancePunchInDetails.ApproverRemarks = '';
  //   employeeAttendancePunchInDetails.Status = 1;
  //   empAttendancePunchInDetails.push(employeeAttendancePunchInDetails);


  // }


  // var empAttendanceBreakupList = [];
  // var employeeAttendanceBreakUpDetails = new EmployeeAttendanceBreakUpDetails();
  // employeeAttendanceBreakUpDetails.Id = this.LstEmployeeAttendanceBreakUpDetails != null && this.LstEmployeeAttendanceBreakUpDetails.length > 0 &&
  //   this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')) != undefined ? this.LstEmployeeAttendanceBreakUpDetails.find(x => moment(x.AttendanceDate).format('YYYY-MM-DD') == moment(new Date()).format('YYYY-MM-DD')).Id : 0;
  // employeeAttendanceBreakUpDetails.RequesterRemarks = '';
  // employeeAttendanceBreakUpDetails.Status = AttendanceBreakUpDetailsStatus.EmployeeSaved // need to change
  // employeeAttendanceBreakUpDetails.PayableDay = 9 >= totalHrs ? 1 : 0;
  // employeeAttendanceBreakUpDetails.AttendanceType = AttendanceType.Present;
  // employeeAttendanceBreakUpDetails.AttendanceCode = 'present'; //this.LstAttendanceType.find(a => a.name == 'Present').name;
  // employeeAttendanceBreakUpDetails.IsFullDayPresent = 9 >= totalHrs ? true : false;;
  // employeeAttendanceBreakUpDetails.TotalApprovedHours = 0;
  // employeeAttendanceBreakUpDetails.TotalSubmittedHours = totalHrs;
  // employeeAttendanceBreakUpDetails.LastCheckedOut = this.LSO == '--:--' ? null : this.LSO as any;
  // employeeAttendanceBreakUpDetails.FirstCheckIn = this.FSI as any;
  // employeeAttendanceBreakUpDetails.AttendanceDate = moment(new Date()).format('YYYY-MM-DD');
  // employeeAttendanceBreakUpDetails.YADId = 0;
  // employeeAttendanceBreakUpDetails.AttendancePeriodId = runningAPId;
  // employeeAttendanceBreakUpDetails.AttendanceCycleId = runningAPCycle;
  // employeeAttendanceBreakUpDetails.EADetailsId = 0; // need to change
  // employeeAttendanceBreakUpDetails.PISId = '0';
  // employeeAttendanceBreakUpDetails.EmployeeId = this.EmployeeBasicDetails[0].Id;
  // employeeAttendanceBreakUpDetails.ApproverRemarks = '';
  // employeeAttendanceBreakUpDetails.LstEmployeeAttendancePunchInDetails = []
  // empAttendanceBreakupList.push(employeeAttendanceBreakUpDetails);

  // var punchAttendanceModel = new PunchAttendanceModel();
  // punchAttendanceModel.EmployeeId = this.EmployeeBasicDetails[0].Id;
  // punchAttendanceModel.PhotoId = this.PhotoId;
  // punchAttendanceModel.Coordinates = this._attenConfig.IsGeoFenceRequired ? JSON.parse(this.Coordinates) : null;
  // punchAttendanceModel.Remarks = '';
  // console.log('punchAttendanceModel', punchAttendanceModel);

  // this.attendanceService.PunchAttendance(JSON.stringify(punchAttendanceModel))
  //   .subscribe((result) => {
  //     console.log(result);
  //     let apiresult: apiResult = result;
  //     if (apiresult.Status) {
  //       this.remappingDailyAttendanceDetails(apiresult.Result);
  //       this.punchInSpinner = false;
  //       // this.onRefreshModal(); // lastly commented code , can be used want to stay back the same page
  //       // this.alertService.showSuccess(apiresult.Message);
  //       // this.activeModal.close('Success');
  //     }
  //     else {
  //       this.punchInSpinner = false; this.alertService.showWarning(apiresult.Message);
  //     }

  //   })

  // console.log('empAttendanceBreakupList', empAttendanceBreakupList);
  // // this.punchInSpinner = false;
  // // return;
  this.attendanceService.UpsertEmployeeAttendanceBreakUpDetails(JSON.stringify(empAttendanceBreakupList))
    .subscribe((result) => {
      console.log(result);
      let apiresult: apiResult = result;
      if (apiresult.Status) {
        this.remappingDailyAttendanceDetails(apiresult.Result);
        this.punchInSpinner = false;

        // this.alertService.showSuccess(apiresult.Message);       

      }
      else {
        if (this.PunchInOutText == 'Punch Out') {
          this.PunchInOutText = 'Punch In';
          this.FSI = '--:--';
        } else {
          this.PunchInOutText = 'Punch Out';
          this.LSO = '--:--';
        }
        this.punchInSpinner = false;
        this.alertService.showWarning(apiresult.Message);
      }

    })
  }


  convertH2M(timeInHour) {
    console.log('timeInHour', timeInHour);

    if (timeInHour != null && timeInHour != 0) {
      // timeInHour = Number(timeInHour).toFixed(2);
      var timeParts = String(timeInHour).split(".");

      if (timeParts[1].length == 1) {
        // Too many numbers after decimal.
        timeParts[1] = `0${timeParts[1]}`;
      }

      return Number(timeParts[0]) * 60 + Number(timeParts[1]);
    } else {
      return 0;
    }

  }

  _loadEmpUILookUpDetails() {
    return new Promise((res, rej) => {
      this.employeeService.get_LoadEmployeeUILookUpDetails(this.EmployeeBasicDetails[0].Id)
        .subscribe((result) => {
          let apiResponse: apiResponse = result;
          if (apiResponse.Status) {
            this.lstlookUpDetails = JSON.parse(apiResponse.dynamicObject) as any;
            this.LstInvestmentSubmissionSlot = this.lstlookUpDetails.InvestmentSubmissionSlotList != null && this.lstlookUpDetails.InvestmentSubmissionSlotList.length > 0 ?
              this.lstlookUpDetails.InvestmentSubmissionSlotList : [];
            res(true);
          }

        }, err => {
          rej();
        })
    });
  }

  navigateMyAttendance() {
    this.router.navigate(['app/attendance/employeeattendance']);

  }
 
}
