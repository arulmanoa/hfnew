import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NzDrawerRef } from 'ng-zorro-antd';
import { LoginResponses } from 'src/app/_services/model';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { AlertService, ClientService, ExcelService } from 'src/app/_services/service';
import moment from 'moment';
@Component({
  selector: 'app-view-employee-in-salary-credit-report',
  templateUrl: './view-employee-in-salary-credit-report.component.html',
  styleUrls: ['./view-employee-in-salary-credit-report.component.css']
})
export class ViewEmployeeInSalaryCreditReportComponent implements OnInit {

  @ViewChild('tabletoExcel') table: ElementRef;

  @Input() rowData: any;
  @Input() params: any;

  loginSessionDetails: LoginResponses;
  loggedInUserId: string = '';
  spinner: boolean = false;
  roleId: any = 0;

  tableHeaders = [];
  tableData = [];
  tableFields = [];

  constructor(
    private drawerRef: NzDrawerRef<string>,
    private alertService: AlertService,
    private clientService: ClientService,
    public sessionService: SessionStorage,
    private excelService: ExcelService
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.loggedInUserId = this.loginSessionDetails.UserSession.UserId.toString();
    this.roleId = this.loginSessionDetails.UIRoles[0].Role.Id;
    console.log('rowData', this.rowData);
    const { distributorId, payPeriodId, type } = this.params;
    this.clientService.loadPayOutLookUpDetailsForITC(this.loggedInUserId, this.roleId, distributorId, payPeriodId, type).subscribe((result: any) => {
      console.log('RESPONSE loadPayOutLookUpDetailsForITC API ::', result);
      if (result.Status && result.dynamicObject != '') {
        this.tableData = result.dynamicObject;
        this.tableFields = Object.keys(this.tableData[0]);
        this.tableHeaders = this.tableFields.map((key) => key.replace(/([A-Z])/g, " $1"));
        this.spinner = false;
      } else {
        this.spinner = false;
        result.Status ? this.alertService.showSuccess('No Data Available') : this.alertService.showWarning(result.Message);
      }
      
    }, err => {
      console.log('ERROR IN loadPayOutLookUpDetailsForITC API ::', err);
      this.spinner = false;
    });
  }

  exportAsXLSX() {
    this.excelService.exportToExcelFromTable(this.table, 'salary_credit_report_');
  }

}
