import { Component, HostListener, OnInit } from '@angular/core';
import { AlertService, ExcelService, HeaderService, PagelayoutService } from 'src/app/_services/service';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { SessionStorage } from '../../../_services/service//session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import * as _ from 'lodash';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ImageviewerComponent } from 'src/app/shared/modals/imageviewer/imageviewer.component';
import moment from 'moment';

@Component({
  selector: 'app-attendance-report-for-itc',
  templateUrl: './attendance-report-for-itc.component.html',
  styleUrls: ['./attendance-report-for-itc.component.css']
})
export class AttendanceReportForItcComponent implements OnInit {

  spinner: boolean = false;
  spinner_table: boolean = false;
  // Session Details
  // ** Access control base prop desc
  _loginSessionDetails: LoginResponses;
  MenuId: any;
  UserId: any;
  UserName: any;
  RoleId: any;
  RoleCode: any;
  // COMMON PROPERTIES 
  BusinessType: any;
  LstEmployee: any[] = [];
  employeeList = [];
  payPeriodList = [];
  clientList = [];
  managerList = [];

  empId: string;
  attendanceDate: any;
  payperiodId: string;
  managerId: string;
  clientId: string;
  payperiodName: string;
  payperiodIndex: number = 0;
  PayPeriodtoBeHidden: boolean = false;
  searchText: any = null;
  modalOption: NgbModalOptions = {};
  employeeName: string;
  PunchedInOutCount: number = 0;
  NotPunchedOutCount: number = 0;
  LeaveRequestCount: number = 0;
  LeaveWeekOffCount: number = 0;
  totalCount: number = 0;
  ClonedEmployeeList: any[] = [];
  dataForExcel = [];
  selectedBoxAttr: string = '1';


  isMobileResolution: boolean;

  districtList = [];
  branchList = [];
  distributorList = [];

  districtId: string;
  branchId: string;
  distributorId: string;
  selectedUserId: any = 0;

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }


  constructor(
    private headerService: HeaderService,
    private alertService: AlertService,
    public pageLayoutService: PagelayoutService,
    public sessionService: SessionStorage,
    private router: Router,
    private titleService: Title,
    private excelService: ExcelService,
    private modalService: NgbModal,

  ) {

    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }


  }

  ngAfterViewInit() {
    this.detectScreenSize();
  }
  private detectScreenSize() {
    if (window.innerWidth < 768) {
      this.isMobileResolution = true;
    } else {
      this.isMobileResolution = false;
    }
  }

  ngOnInit() {
    this.modalOption.backdrop = 'static';
    this.modalOption.keyboard = false;
    this.onRefresh();
  }
  onRefresh() {
    this.selectedBoxAttr = '1';
    this.searchText = null;
    this.clientList = [];
    this.attendanceDate = new Date();
    this.PayPeriodtoBeHidden = false;
    this.LstEmployee = [];
    this.employeeList = [];
    this.payPeriodList = [];
    this.clientId = '0';
    this.spinner = true;
    this.headerService.setTitle('Attendance Report');
    this.titleService.setTitle('Attendance Report');
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId; // Return just the one element from the set - userid
    this.UserName = this._loginSessionDetails.UserSession.PersonName; // Return just the one element from the set - username
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.RoleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.empId = this.UserId;

    if (this.BusinessType != 3) {

      if (this.RoleCode != 'Manager') {
        this.empId = null;
        this.clientId = this.sessionService.getSessionStorage("default_SME_ClientId");
        this.GetDistrictData();
      } else {
        this.GetDirectReportingEmployee();
      }
    }
    else {
      if (this.RoleCode == 'Manager') {
        this.GetDirectReportingEmployee();
      }
      else if (this.RoleCode == 'Client' || this.RoleCode == 'HO_ITC' || this.RoleCode == 'Branch_ITC' || this.RoleCode == 'District_ITC') {
        this.clientId = this._loginSessionDetails.ClientList.length > 0 ? this._loginSessionDetails.ClientList[0].Id as any : 0;
        this.empId = null;
        this.GetDistrictData();
      }
      else {
        this.empId = null;
        this.GetDistrictData();

      }
    }
  }

  OnChangeEmpName(event) {
    this.resetPage();
    if (Number(event.EmployeeId) === 0) {
      this.PayPeriodtoBeHidden = false;
      this.empId = event.EmployeeId;
    } else {
      this.selectedUserId = event.UserId;
      this.empId = event.EmployeeId;
      this.employeeName = event.Name;
      this.PayPeriodtoBeHidden = true;
      this.GetPayPeriodsByManagerId();

    }
  }

  GetClientMappingList() {

    let datasource: DataSource = {
      Name: "GetUserMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [

      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      }

    ];
    console.log(searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      console.log('result', result);

      this.clientList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client List ::', apiResult);
        this.clientList = apiResult;
        this.clientList.length > 0 && this.clientList.length == 1 ? this.OnChangeClient(this.clientList[0]) : true;
        this.spinner = false
      } else {
        this.spinner = false

      }
    });

  }
  OnChangeClient(item) {
    this.clientId = item.Id;
    this.GetManagerMappedClientList();
  }

  OnChangeDistrict(e) {
    let datasource: DataSource = {
      Name: "GetAllBranchDetails",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@DistrictId",
        Value: this.districtId
      }, {
        FieldName: "@userId",
        Value: this.UserId
      },  {
        FieldName: "@roleId",
        Value: this.RoleId
      }
    ];
    console.log(searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      console.log('result.dynamicObject 1', result.dynamicObject);
      this.branchList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Manager List ::', apiResult);
        this.branchList = apiResult;
        this.spinner = false
      } else {
        this.spinner = false

      }
    });
  }

  GetDistrictData() {
    let datasource: DataSource = {
      Name: "GetAllDistrictDetails",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@userId",
        Value: this.UserId
      },
      {
        FieldName: "@roleId",
        Value: this.RoleId
      }

    ];
    console.log(searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      console.log('Result District List ::', result);
      this.districtList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        this.districtList = apiResult;
        this.spinner = false
      } else {
        this.spinner = false
        this.districtList = [];
      }
    });
  }

  OnChangeBranch(e) {
    let datasource: DataSource = {
      Name: "GetAllDistributorDetails",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@BranchId",
        Value: this.branchId
      }, {
        FieldName: "@userId",
        Value: this.UserId
      }, {
        FieldName: "@roleId",
        Value: this.RoleId
      },  {
        FieldName: "@DistrictId",
        Value: this.districtId
      }
    ];
    console.log(searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      console.log('result.dynamicObject 1', result.dynamicObject);
      this.distributorList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Manager List ::', apiResult);
        this.distributorList = apiResult.filter(o => o.DistributorId !== 0 && o.DistributorName.toLowerCase() !== 'all');
        // this.distributorList = apiResult;
        this.spinner = false;
      } else {
        this.spinner = false;
        this.distributorList = [];

      }
    });
  }

  OnChangeDistributor(e) {
   // this.GetManagerMappedClientList();
   this.employeeName = '';
   this.empId = null;
   this.GetDirectReportingEmployee();
  }    

  GetManagerMappedClientList() {

    let datasource: DataSource = {
      Name: "GetManagerMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@userId",
        Value: this.UserId
      },
      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@clientId",
        Value: this.clientId
      }

    ];
    console.log(searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      console.log('result.dynamicObject 1', result.dynamicObject);
      this.managerList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        let LstAllAttribute = [{
          Id: -100,
          Name: 'All'
        }]
        console.log('Result Manager List ::', apiResult);
        this.managerList = apiResult;
        this.managerList.length > 0 ? this.managerList = LstAllAttribute.concat(this.managerList) : true;
        this.spinner = false
      } else {
        this.spinner = false;
        this.managerList = [];
      }
    });

  }
  OnChangeManager(managerItem) {
    this.empId = null;
    this.employeeName = '';
    this.GetDirectReportingEmployee();
  }

  GetDirectReportingEmployee() {
    this.empId = null;
    let datasource: DataSource = {
      Name: "GetEmployeesForADistributor",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@distributorId ",
        Value: this.distributorId
      },
      // {
      //   FieldName: "@roleId",
      //   Value: this.RoleId
      // },
      // {
      //   FieldName: "@clientId",
      //   Value: this.clientId
      // }
    ]

    console.log(searctElements);
    this.employeeList = [];
    let LstAllAttributes = [{
      EmployeeId: 0,
      Name: 'All'
    }]
    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {

      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('apiResult', apiResult);
        this.employeeList = apiResult;
        this.employeeList = LstAllAttributes.concat(this.employeeList);
       // this.GetPayPeriodsByManagerId();
        // this.doSearch();
        this.spinner = false
      } else {
        this.spinner = false;
        this.employeeList = [];
      }
    });
  }

  GetPayPeriodsByManagerId() {

    let datasource: DataSource = {
      Name: "PayperiodView_ITC",
      Type: DataSourceType.View,
      IsCoreEntity: false
    }

    let searctElements: SearchElement[] = [
      {
        FieldName: "@userId",
        Value: this.RoleCode != "Manager" ? this.selectedUserId : this.UserId
      },
      {
        FieldName: "@clientId",
        Value: this.clientId
      },
    ]
    console.log('payperiod', searctElements);

    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      console.log('sdfsd', result);

      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('apiResult 1', apiResult);
        this.payPeriodList = apiResult == null || apiResult == "" ? [] : apiResult;
        this.spinner = false;
      } else {
        this.spinner = false;
        this.payPeriodList = [];
      }
    });
  }
  resetPage() {
    this.PunchedInOutCount = 0;
    this.NotPunchedOutCount = 0;
    this.LeaveRequestCount = 0;
    this.LeaveWeekOffCount = 0;
    this.totalCount = 0;
    this.LstEmployee = [];
    this.ClonedEmployeeList = [];
  }

  doSearch() {
    this.selectedBoxAttr = '1';
    this.resetPage()
    let spName = "";
    let parameterObject = [];
    if (this.districtId == null || this.branchId == null || this.distributorId == null || this.empId == null) {
      return this.alertService.showWarning('Please fill required fields !');
    }
    if (this.RoleCode == 'Manager' && (this.empId == null || this.empId == undefined)) {
      this.alertService.showWarning("Please select employee name");
      return;
    } else if (this.RoleCode == 'Manager' && this.empId != this.UserId && (this.payperiodId == null || this.payperiodId == undefined)) {
      this.alertService.showWarning("Please select pay period");
      return;
    }
    let _empId = '-200';
    if (this.RoleCode == 'Manager' || (this.empId != null)) {
      _empId = this.empId;
    } else if (this.RoleCode == 'HO_ITC' || this.RoleCode == 'District_ITC' || this.RoleCode == 'Branch_ITC') {
      _empId = this.empId;
    } else {
      this.empId = this.UserId;
    }

    this.LstEmployee = [];
    this.ClonedEmployeeList = [];
    if (_empId == '-200' || Number(_empId) === 0) {
      this.PayPeriodtoBeHidden = false;
      spName = "GetAttendanceReportByUserAndDate_ITC";
      parameterObject = [{
        FieldName: "@distributorId",
        Value: this.distributorId
      },
      {
        FieldName: "@date",
        Value: moment(this.attendanceDate).format('YYYY-MM-DD')
      },
      {
        FieldName: "@clientId",
        Value: this.clientId
      }
      ]
    } else {
      spName = "GetAttendanceReportByEmployeeAndPayPeriod";

      parameterObject = [{
        FieldName: "@employeeId",
        Value: this.empId
      },
      {
        FieldName: "@payPeriodId",
        Value: this.payperiodId
      }];
    }

    let datasource: DataSource = {
      Name: spName,
      Type: DataSourceType.SP,
      IsCoreEntity: false,
      EntityType: 120
    }
    let searctElements: SearchElement[] = parameterObject;
    console.log(searctElements);
    console.log(datasource);
    this.spinner_table = true;
    this.pageLayoutService.getDataset(datasource, searctElements).subscribe((result) => {
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('apiResult 2', apiResult);

        this.LstEmployee = apiResult;
        this.setCount();
        this.ClonedEmployeeList = apiResult;
        this.spinner_table = false
      } else {
        this.spinner_table = false

      }
    });


  }
  setCount() {
    if (this.PayPeriodtoBeHidden) {
      this.totalCount = this.LstEmployee.length;
      let count = 0;
      let count1 = 0;
      this.LstEmployee.forEach(element => {

        if ((element.FirstHalfEntitlementId > 0 || element.SecondHalfEntitlementId > 0) &&
          element.FirstHalfEntitlementCode != 'WeekOff'
          && element.SecondHalfEntitlementCode != 'WeekOff' && element.FirstHalfEntitlementCode != 'WO'
          && element.SecondHalfEntitlementCode != 'WO') {
          count = Number(count) + Number(1);
        }


        // } else if (element.FirstHalfEntitlementId > 0 && element.SecondHalfEntitlementId == 0) {
        //   count = Number(count) + Number(0.5);
        // }
        // else if (element.FirstHalfEntitlementId == 0 && element.SecondHalfEntitlementId > 0) {
        //   count = Number(count) + Number(0.5);
        // }
      });
      this.LeaveRequestCount = count;
      this.NotPunchedOutCount = this.LstEmployee.filter(a => (a.PunchInTime == null || a.PunchInTime == '00:00:00') && a.FirstHalfEntitlementId == 0 && a.SecondHalfEntitlementId == 0
        && a.FirstHalfEntitlementCode == '' && a.IsHoliday == 0 && !a.IsWeekOff).length;
      this.PunchedInOutCount = this.LstEmployee.filter(a => a.PunchInTime != null && a.PunchInTime != '00:00:00' && a.IsHoliday != 1 && !a.IsWeekOff && a.FirstHalfEntitlementId == 0
        && a.FirstHalfEntitlementCode != 'WeekOff'
        && a.SecondHalfEntitlementCode != 'WeekOff' && a.FirstHalfEntitlementCode != 'WO'
        && a.SecondHalfEntitlementCode != 'WO'
      ).length;

      this.LeaveWeekOffCount = this.LstEmployee.filter(a => a.IsWeekOff == true || a.FirstHalfEntitlementCode == 'WeekOff'
        || a.SecondHalfEntitlementCode == 'WeekOff' || a.FirstHalfEntitlementCode == 'WO'
        || a.SecondHalfEntitlementCode == 'WO').length;

    } else {
      this.totalCount = this.LstEmployee.length;
      let count = 0;
      this.LstEmployee.forEach(element => {

        if ((element.FirstHalfEntitlementId > 0 || element.SecondHalfEntitlementId > 0) &&
          element.FirstHalfEntitlementCode != 'WeekOff'
          && element.SecondHalfEntitlementCode != 'WeekOff' && element.FirstHalfEntitlementCode != 'WO'
          && element.SecondHalfEntitlementCode != 'WO') {
          count = Number(count) + Number(1);
        }
        // } else if (element.FirstHalfEntitlementId > 0 && element.SecondHalfEntitlementId == 0) {
        //   count = Number(count) + Number(0.5);
        // }
        // else if (element.FirstHalfEntitlementId == 0 && element.SecondHalfEntitlementId > 0) {
        //   count = Number(count) + Number(0.5);
        // }
      });
      this.LeaveRequestCount = count;
      this.NotPunchedOutCount = this.LstEmployee.filter(a => (a.PunchInTime == null || a.PunchInTime == '00:00:00') && a.FirstHalfEntitlementId == 0 && a.SecondHalfEntitlementId == 0
        && a.FirstHalfEntitlementCode == '' && a.IsHoliday == 0 && !a.IsWeekOff).length;

      this.PunchedInOutCount = this.LstEmployee.filter(a => a.PunchInTime != null && a.PunchInTime != '00:00:00' && a.IsHoliday != 1 && !a.IsWeekOff && a.FirstHalfEntitlementId == 0
        && a.FirstHalfEntitlementCode != 'WeekOff'
        && a.SecondHalfEntitlementCode != 'WeekOff' && a.FirstHalfEntitlementCode != 'WO'
        && a.SecondHalfEntitlementCode != 'WO').length;
      this.LeaveWeekOffCount = this.LstEmployee.filter(a => a.IsWeekOff == true || a.FirstHalfEntitlementCode == 'WeekOff'
        || a.SecondHalfEntitlementCode == 'WeekOff' || a.FirstHalfEntitlementCode == 'WO'
        || a.SecondHalfEntitlementCode == 'WO').length;

    }
  }
  onChangeAttendanceDate(event) {
    console.log('event', event);

    this.attendanceDate = event;
  }
  prevDate() {
    var startdate = moment(this.attendanceDate, "DD-MM-YYYY").subtract(1, 'days');
    this.attendanceDate = new Date(moment(startdate).toDate());
    this.doSearch();
  }


  nextDate() {
    var startdate1 = moment(this.attendanceDate, "DD-MM-YYYY").add(1, 'days');
    this.attendanceDate = new Date(moment(startdate1).toDate());
    this.doSearch();
  }

  prevperiod() {
    let totalCount = this.payPeriodList.length;
    if (totalCount == this.payperiodIndex - 1) {
      return;
    }
    if (totalCount < 0) {
      return;
    }
    let currentIndex = this.payperiodIndex - 1;
    let object = this.payPeriodList[currentIndex];
    this.payperiodId = object.Id;
    this.payperiodName = object.Name;
    this.payperiodIndex = currentIndex;
    this.doSearch();
  }

  nextperiod() {
    let totalCount = this.payPeriodList.length;
    if (totalCount == this.payperiodIndex - 1) {
      return;
    }
    if (totalCount < 0) {
      return;
    }
    let currentIndex = this.payperiodIndex + 1;
    let object = this.payPeriodList[currentIndex];
    this.payperiodId = object.Id;
    this.payperiodName = object.Name;
    this.payperiodIndex = currentIndex;
    this.doSearch();

  }

  OnChangePayPeriod(event) {
    this.payperiodIndex = this.payPeriodList.findIndex(x => x.Id == event.Id);
    this.payperiodName = event.Name;
  }


  viewPunchInOutImage(item) {
    console.log('i', item);

    let PunchInOutDetails = {
      PunchInPhotoId: 0,
      PunchOutPhotoId: 0,
      PunchInRemarks: '',
      PunchOutRemarks: ''
    };


    PunchInOutDetails.PunchInPhotoId = item.PunchInPhotoId;
    PunchInOutDetails.PunchOutPhotoId = item.PunchOutPhotoId;
    PunchInOutDetails.PunchInRemarks = item.PunchInRemarks;
    PunchInOutDetails.PunchOutRemarks = item.PunchOutRemarks;
    const modalRef = this.modalService.open(ImageviewerComponent, this.modalOption);
    modalRef.componentInstance.PunchInOutDetails = item;
    modalRef.result.then((result) => {
      if (result != "Modal Closed") {
        console.log('RESULT OF EDITED SO DETAILS :', result);
      }
      else {
        // this.onRefresh();
      }
    }).catch((error) => {
      console.log(error);
    });
  }

  doExport() {
    if (this.LstEmployee.length == 0) {
      this.alertService.showWarning("no records found!");
      return;
    }
    var string = this.PayPeriodtoBeHidden ? `AttendanceFor${this.employeeName}_${this.payperiodName}` :
      `AttendanceForAll${moment(this.attendanceDate).format('DD-MM-YYYY')}`;
    var length = 30;
    var trimmedString = string.substring(0, length);

    let exportExcelDate = [];
    this.LstEmployee.forEach(item => {
      item.attendanceStatus = '';
      if ((item.FirstHalf == undefined || item.FirstHalf == 'EMPTY')) {
        item.FirstHalf = '';
      }
      if ((item.SecondHalf == undefined || item.SecondHalf == 'EMPTY')) {
        item.SecondHalf = '';
      }

      if (item.IsHoliday == 1 && !item.IsWeekOff) {
        item.attendanceStatus = ` ${item.IsHoliday == 1 && item.FirstHalf &&
          item.FirstHalf == item.SecondHalf && item.FirstHalf !== '' &&
          item.FirstHalf != null ? ` H | ${item.FirstHalf}` : `H`}`;

      } else if (item.IsWeekOff && item.IsHoliday == 0) {
        item.attendanceStatus = `
        ${item.IsWeekOff && item.FirstHalf && item.FirstHalf !== '' && item.FirstHalf == item.SecondHalf
            && item.FirstHalf != null && item.FirstHalf !== 'WeekOff' ? ` WO | ${item.FirstHalf}` : `WO`}`;

      } else if (item.IsWeekOff && item.IsHoliday == 1) {
        item.attendanceStatus = `
        ${item.IsWeekOff && item.IsHoliday == 1 && item.FirstHalf && item.FirstHalf == item.SecondHalf
            && item.FirstHalf !== '' && item.FirstHalf != null && item.FirstHalf !== 'WeekOff' ? ` WO | H | ${item.FirstHalf}` : `WO | H`}`;
      } else {
        item.attendanceStatus = item.IsWeekOff == true && item.FirstHalf && item.FirstHalf !== ''
          && item.FirstHalf != null && item.FirstHalf !== 'WeekOff' ? 'WO' : `${item.FirstHalf}  
      
        ${item.SecondHalf != item.FirstHalf && item.SecondHalf != null ? ` | ${item.SecondHalf}` : ``}`;
      }

      exportExcelDate.push({
        EmployeeCode: item.EmployeeCode,
        EmployeeName: item.EmployeeName,
        ManagerName: item.ManagerName,
        AttendanceDate: moment(item.AttendanceDate).format('DD-MM-YYYY'),
        Type: item.attendanceStatus.replace(/(?:\r\n\s|\r|\n|\s)/g, ''),
        PunchInTime: item.PunchInTime,
        PunchInAddress: item.PunchInAddress,
        PunchInRemarks: item.PunchInRemarks,
        PunchOutTime: item.PunchOutTime,
        PunchOutAddress: item.PunchOutAddress,
        PunchOutRemarks: item.PunchOutRemarks,
      });

    });
    this.dataForExcel = [];
    exportExcelDate.forEach((row: any) => {
      this.dataForExcel.push(Object.values(row))
    })
    this.dataForExcel = _.orderBy(this.dataForExcel, ["ManagerId"], ["asc"]);


    let reportData = {
      title: 'Employee Attendance Report',
      data: this.dataForExcel,
      headers: Object.keys(exportExcelDate[0])
    }
    console.log('keys', Object.keys(exportExcelDate[0]));

    this.excelService.exportExcel(reportData);

    // this.excelService.exportAsExcelFile(exportExcelDate, trimmedString);
  }

  onClickBox(whichbox) {
    if (whichbox == 1) {
      this.selectedBoxAttr = '1';
      this.LstEmployee = this.ClonedEmployeeList;
    } else if (whichbox == 2) {
      this.selectedBoxAttr = '2';
      this.LstEmployee = this.ClonedEmployeeList;
      this.LstEmployee = this.LstEmployee.filter(a => a.PunchInTime != null && a.PunchInTime != '00:00:00');
    }
    else if (whichbox == 3) {
      this.selectedBoxAttr = '3';
      this.LstEmployee = this.ClonedEmployeeList;
      this.LstEmployee = this.LstEmployee.filter(a => (a.PunchInTime == null || a.PunchInTime == '00:00:00') && a.FirstHalfEntitlementId == 0 && a.SecondHalfEntitlementId == 0
        && a.FirstHalfEntitlementCode == '' && a.IsHoliday == 0 && !a.IsWeekOff
      );
    }
    else if (whichbox == 4) {
      this.selectedBoxAttr = '4';
      this.LstEmployee = this.ClonedEmployeeList;
      this.LstEmployee = this.LstEmployee.filter(a => (a.FirstHalfEntitlementId > 0 || a.SecondHalfEntitlementId > 0) && (a.FirstHalfEntitlementCode != 'WeekOff'
        && a.SecondHalfEntitlementCode != 'WeekOff' && a.FirstHalfEntitlementCode != 'WO'
        && a.SecondHalfEntitlementCode != 'WO'));
    }
    else if (whichbox == 5) {
      this.selectedBoxAttr = '5';
      this.LstEmployee = this.ClonedEmployeeList;
      this.LstEmployee = this.LstEmployee.filter(a => a.IsWeekOff == true || a.FirstHalfEntitlementCode == 'WeekOff'
        || a.SecondHalfEntitlementCode == 'WeekOff' || a.FirstHalfEntitlementCode == 'WO'
        || a.SecondHalfEntitlementCode == 'WO'
      );
    }
  }
  ngOnDestroy() {
  }

}
