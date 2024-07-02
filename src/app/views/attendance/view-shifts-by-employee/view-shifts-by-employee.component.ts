import { Component, Input, OnInit } from '@angular/core';
import { NzDrawerRef } from 'ng-zorro-antd';
import { ExcelService } from 'src/app/_services/service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import moment from 'moment';
import { apiResult } from 'src/app/_services/model/apiResult';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-view-shifts-by-employee',
  templateUrl: './view-shifts-by-employee.component.html',
  styleUrls: ['./view-shifts-by-employee.component.css']
})

export class ViewShiftsByEmployeeComponent implements OnInit {

  @Input() month: any;
  @Input() year: any;
  @Input() clientId: any;

  sessionDetails: LoginResponses;
  roleId: number = 0;
  userId: any = 0;
  userName: any;
  companyId: any;
  businessType: any;
  employeeId: any;
  spinner: boolean = false;
  noDataFound: boolean = false;
  selectedPeriodFrom: any;
  selectedPeriodTo: any;
  shiftDetailsForEmp: any[] = [];
  maxDate: any;
  showShiftChangeRequestsBtn: boolean = false;

  constructor(
    private router: Router,
    private excelService: ExcelService,
    public sessionService: SessionStorage,
    private drawerRef: NzDrawerRef<string>,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.showShiftChangeRequestsBtn = environment.environment.IsShiftChangeRequestsNotAllowedForEmployee && environment.environment.IsShiftChangeRequestsNotAllowedForEmployee.includes(this.clientId) ? false : true;
    this.onRefresh();
  }

  onRefresh() {
    this.spinner = true;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.userId = this.sessionDetails.UserSession.UserId;
    this.companyId = this.sessionDetails.Company.Id;
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null && this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType;
    this.employeeId = this.sessionDetails.EmployeeId;
    this.shiftDetailsForEmp = [];
    let date = new Date(), y = date.getFullYear(), m = date.getMonth();
    let firstDay = new Date(this.year, this.month - 1, 1); // new Date(y, m, 1);
    let lastDay = new Date(this.year, this.month, 0);  // new Date(y, m + 1, 0);
    this.selectedPeriodFrom = new Date(firstDay);
    this.selectedPeriodTo = new Date(lastDay);
    this.maxDate = new Date(lastDay);
    this.getShiftDetailsForEmployee(this.selectedPeriodFrom, this.selectedPeriodTo);
  }

  async getEmployeeShiftDetailsByPeriod(periodFrom, periodTo) {
    const formattedPeriodFrom = moment(periodFrom).format('MM-DD-YYYY');
    const formattedPeriodTo = moment(periodTo).format('MM-DD-YYYY'); 
    const promise = new Promise((res, rej) => {
      this.attendanceService.GetShiftDetailsForEmployee(this.employeeId, formattedPeriodFrom, formattedPeriodTo).subscribe((response) => {
        // console.log(':::: EMP SHIFT DETAILS API RESPONSE :::: ', response);
        res(response);
      });
    });

    return promise;
  }

  clickedSearch() {
    this.getShiftDetailsForEmployee(this.selectedPeriodFrom, this.selectedPeriodTo);
  }

  getShiftDetailsForEmployee(periodFrom, periodTo) {
    this.spinner = true;
    this.noDataFound = false;
    this.shiftDetailsForEmp = [];
    this.getEmployeeShiftDetailsByPeriod(periodFrom, periodTo).then((result: apiResult) => {
      const apiresult: apiResult = result;
      if (apiresult.Status && apiresult.Result != '') {
        const parsedArr = JSON.parse(apiresult.Result);
        if (parsedArr && parsedArr.length) {
          this.shiftDetailsForEmp = parsedArr.map(el => {
            el.formattedDate = moment(new Date(el.TDate), "YYYY-MM-DD").format("DD MMM YYYY");
            if (el.WSD && el.WSD.length) {
              el.formattedStartTime = moment(el.WSD[0].StartTime, "HH:mm").format("hh:mm A");
              el.formattedEndTime = moment(el.WSD[0].EndTime, "HH:mm").format("hh:mm A")
            }
            return el;
          });
        }
        console.log(':::: EMP SHIFT DETAILS :::: ', this.shiftDetailsForEmp);
      } else {
        this.noDataFound = true;
      }

      this.spinner = false;
    });
  }

  onChangePeriodFromDate(e) {
    console.log(e);
    if (e) {
      this.maxDate = new Date(this.selectedPeriodFrom);
      this.maxDate.setDate(this.maxDate.getDate() + 30);
      this.selectedPeriodTo = new Date(this.maxDate);
      console.log('Max Date', this.maxDate);
    }
  }

  onChangePeriodToDate(e) {
    console.log(e);
  }

  onClose() {
    this.drawerRef.close();
  }

  redirectToShiftChangeRequest() {
    this.drawerRef.close();
    this.router.navigate(['/app/masters/shiftChangeRequest']);
  }

  export() {}

}
