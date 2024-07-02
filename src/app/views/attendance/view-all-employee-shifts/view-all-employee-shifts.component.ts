import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, ExcelService, PagelayoutService } from 'src/app/_services/service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { DataSource, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';



@Component({
  selector: 'app-view-all-employee-shifts',
  templateUrl: './view-all-employee-shifts.component.html',
  styleUrls: ['./view-all-employee-shifts.component.css']
})
export class ViewAllEmployeeShiftsComponent implements OnInit {

  noData: boolean = false;
  spinner: boolean = false;
  refreshing_table_spinner: boolean = false;
  clientList: any[] = [];
  managerList: any[] = [];

  clientId: any;
  managerId: any;

  shiftDetailsView: any = [];
  shiftView_header = [];
  shiftView_actualData: any;
  selectedPeriodFrom: any;
  selectedPeriodTo: any;
  maxDate: any;

  sessionDetails: LoginResponses;
  roleId: number = 0;
  roleCode: string = '';
  userId: any = 0;
  userName: any;
  companyId: any;
  businessType: any;
  employeeId: any;
  searchText: string = '';

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private excelService: ExcelService
  ) { }

  ngOnInit() {
    this.shiftDetailsView = [];
    this.shiftView_header = [];
    this.shiftView_actualData = [];
    this.onRefresh();
  }

  onRefresh() {
    this.searchText = null;
    this.noData = false;
    this.spinner = true;
    this.titleService.setTitle('View Employee Shifts');
    this.selectedPeriodFrom = new Date();
    this.selectedPeriodTo = new Date();
    // this.maxDate = new Date();
    this.setMaxDate(new Date());
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userId = this.sessionDetails.UserSession.UserId;
    this.userName = this.sessionDetails.UserSession.PersonName;
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;

    if (this.businessType !== 3) {
      // SME
      if (this.roleCode !== 'Manager') {
        this.clientId = this.sessionService.getSessionStorage("default_SME_clientId");
        this.GetManagerMappedClientList();
      } else {
        this.loadShiftDetails(this.userId, this.selectedPeriodFrom, this.selectedPeriodTo);
      }
    } else {
      // STF
      switch (this.roleCode) {
        case 'Manager':
          this.loadShiftDetails(this.userId, this.selectedPeriodFrom, this.selectedPeriodTo);
          break;
        case 'Client':
          this.clientId = this.sessionDetails.ClientList.length > 0 ? this.sessionDetails.ClientList[0].Id as any : 0;
          this.GetManagerMappedClientList();
          break;
        default:
          this.GetClientMappingList();
          break;
      }
    }
    this.spinner = false;
  }

  async getEmployeeShiftDetailsByPeriod(userId: any, periodFrom: moment.MomentInput, periodTo: moment.MomentInput) {
    const formattedPeriodFrom = moment(periodFrom).format('MM-DD-YYYY');
    const formattedPeriodTo = moment(periodTo).format('MM-DD-YYYY');
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetShiftDetailsForManager(userId, formattedPeriodFrom, formattedPeriodTo).subscribe((response) => {
        // console.log(':::: SHIFT DETAILS API RESPONSE :::: ', response);
        res(response);
      });
    });

    return promise;
  }

  loadShiftDetails(userId: any, periodFrom: any, periodTo: any) {
    this.refreshing_table_spinner = true;
    this.getEmployeeShiftDetailsByPeriod(userId, periodFrom, periodTo).then((result: apiResult) => {
      const apiresult: apiResult = result;
      this.shiftDetailsView = [];
      this.shiftView_header = [];
      this.shiftView_actualData = [];
      if (apiresult.Status && apiresult.Result !== '') {
        const parsedResult = JSON.parse(apiresult.Result);
        parsedResult.forEach(el => {
          // sort by Attendance Date
          el.S.sort((a, b) => new Date(a.AttendanceDate).getTime() - new Date(b.AttendanceDate).getTime());
        });
        this.shiftDetailsView = parsedResult;
        this.shiftView_actualData = _.cloneDeep(this.shiftDetailsView);
        const headerItems = new Map<string, any>();
        
        this.shiftView_actualData.forEach((el: any) => {
          el.formattedDOJ = el.DOJ && el.DOJ != '' ? moment.utc(el.DOJ, 'DD/MM/YYYY').format('DD MMM YYYY') : el.DOJ;
          el.formattedLWD = el.LWd && el.LWd != '' ? moment.utc(el.LWd, 'DD/MM/YYYY').format('DD MMM YYYY') : el.LWd;
          el.S.forEach((s: any) => {
            const attendanceDate = moment.utc(s.AttendanceDate);
            const formattedStartTime = attendanceDate.format('hh:mm A');
            const formattedEndTime = moment.utc(s.EndTime, 'HH:mm').format('hh:mm A');
            const momentDate = attendanceDate.format('DD MMM YYYY');
            
            let itemInHeader = headerItems.get(momentDate);
            if (!itemInHeader) {
              itemInHeader = { day: attendanceDate.format('ddd'), date: momentDate };
              this.shiftView_header.push(itemInHeader);
              headerItems.set(momentDate, itemInHeader);
            }
            s.Shift = (s.Name && formattedStartTime && formattedEndTime) ? `${s.Name} (${formattedStartTime}-${formattedEndTime})` : '';
          });
        });

        console.log(':::: SHIFT DETAILS :::: ', JSON.parse(apiresult.Result));
      } else {
        this.noData = true;
        apiresult.Status ? this.alertService.showSuccess('No Data Available !') : this.alertService.showWarning(apiresult.Message);
      }
      console.log(':::: SHIFT HEADER :::: ', this.shiftView_header);
      console.log(':::: SHIFT DATA :::: ', this.shiftView_actualData);
      this.refreshing_table_spinner = false;
    });
  }

  OnChangeClientFn(item: { Id: any; }) {
    this.clientId = item.Id;
    this.GetManagerMappedClientList();
  }

  GetManagerMappedClientList() {
    this.managerList = [];
    const datasource: DataSource = {
      Name: "GetManagerMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    };

    const searchElements: SearchElement[] = [
      { FieldName: '@userId', Value: this.userId },
      { FieldName: '@roleId', Value: this.roleId },
      { FieldName: '@clientId', Value: this.clientId }
    ];
    console.log(searchElements);

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe(result => {
      // console.log('GetManagerMappedClientList : Result ::', result);
      if (result.Status && result.dynamicObject && result.dynamicObject !== '') {
        this.managerList = JSON.parse(result.dynamicObject);
      } else {
        result.Status ? this.alertService.showSuccess('No Data Found !') : this.alertService.showWarning(result.Message);
      }
      this.spinner = false;
    });
  }
  OnChangeManagerFn(managerItem: { Id: any; }) {
    this.managerId = managerItem.Id;
    // this.loadShiftDetails(managerItem.Id, this.selectedPeriodFrom, this.selectedPeriodTo);
  }

  GetClientMappingList() {
    const datasource: DataSource = {
      Name: 'GetUserMappedClientList',
      Type: DataSourceType.SP,
      IsCoreEntity: false
    };

    const searchElements: SearchElement[] = [
      { FieldName: '@roleId', Value: this.roleId },
      { FieldName: '@userId', Value: this.userId }
    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe(result => {
      console.log('result', result);
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        const apiResult = JSON.parse(result.dynamicObject);
        console.log('GetUserMappedClientList : Result ::', apiResult);
        this.clientList = [];
        this.clientList = apiResult;
        if(this.clientList.length == 1) {
          this.OnChangeClientFn(this.clientList[0]);
        }
      } else {
        result.Status ? this.alertService.showSuccess('No Data Found !') : this.alertService.showWarning(result.Message);
      }
      this.spinner = false;
    });
  }

  doSearch() {
    this.noData = false;
    if (this.roleCode !== 'Manager') {
      this.loadShiftDetails(this.managerId, this.selectedPeriodFrom, this.selectedPeriodTo);
    } else {
      this.loadShiftDetails(this.userId, this.selectedPeriodFrom, this.selectedPeriodTo);
    }
    
  }

  onClose() { }

  onChangePeriodFromDate(e: any) {
    console.log(e);
    if(e) {
      this.setMaxDate(e);
    }
  }

  onChangePeriodToDate(e: any) {
    console.log(e);
  }

  setMaxDate(selectedDate) {
    const dateString = moment(selectedDate).add(30, 'days').format('DD-MM-YYYY');
    const [day, month, year] = dateString.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    this.maxDate = new Date(date);
   // this.maxDate.setDate(this.maxDate.getDate() + 30);
    this.selectedPeriodTo = new Date(this.maxDate);
    console.log('Max Date', this.maxDate);
  }

  exportShiftsInExcel() {

    const fileName = 'EmployeeShiftDetails_';
    
    const exportExcelData = this.shiftView_actualData.map((element: any) => {
      const my_obj = {};
      if (element.S) {
        element.S.forEach((s: { AttendanceDate: moment.MomentInput; Shift: any; }) => {
          my_obj[moment(s.AttendanceDate).format('DD-MM-YYYY')] = s.Shift;
        });
      }
      return {
        EmployeeCode: element.EmployeeCode,
        EmployeeName: element.EmployeeName,
        DOJ: element.formattedDOJ,
        LWD: element.formattedLWD,
        ...my_obj,
      };
    });
    
    console.log('Export object:', exportExcelData);
    this.excelService.exportAsExcelFile(exportExcelData, fileName);
  }

}
