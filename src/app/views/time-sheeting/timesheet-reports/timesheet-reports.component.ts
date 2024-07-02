import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginResponses } from 'src/app/_services/model';
import { forkJoin } from 'rxjs';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import * as _ from 'lodash';
import { ExcelService, PagelayoutService } from 'src/app/_services/service';
import { DataSource, PageLayout, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType } from '../../personalised-display/enums';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import moment from 'moment';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { TimesheetDetailedViewComponent } from '../timesheet-detailed-view/timesheet-detailed-view.component';
import { AngularGridInstance, GridService, Column, GridOption } from 'angular-slickgrid';

@Component({
  selector: 'app-timesheet-reports',
  templateUrl: './timesheet-reports.component.html',
  styleUrls: ['./timesheet-reports.component.css']
})
export class TimesheetReportsComponent implements OnInit {

  @ViewChild('tabletoExcel') table: ElementRef;

  spinner: boolean = false;
  tableSpinner; boolean = false;
  clientList: any[] = [];
  clientContractList: any[] = [];
  selectedPeriodFrom: any;
  selectedPeriodTo: any;
  selectedClient: any = 0;
  selectedClientContract: any = 0;

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  BusinessType: any;
  maxDate: any;
  timesheetReport: any[] = [];
  EmployeeId: any;
  roleCode: any;

  angularGrid: AngularGridInstance;
  gridObj1: any;
  columnDefinitions: Column[];
  gridOptions: GridOption;

  constructor(
    private sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    public pageLayoutService: PagelayoutService,
    private excelService: ExcelService,
    private modalService: NgbModal,
  ) { }

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;
    this.EmployeeId = this._loginSessionDetails.EmployeeId;
    this.roleCode = this._loginSessionDetails.UIRoles[0].Role.Code;
    let date = new Date(), y = date.getFullYear(), m = date.getMonth();
    let firstDay = new Date(y, m, 1);
    let lastDay = new Date(y, m + 1, 0);
    this.selectedPeriodFrom = new Date(firstDay);
    this.selectedPeriodTo = new Date(lastDay);
    this.maxDate = new Date(lastDay);
    this.timesheetReport = [];
    this.setTableGrid();
    this.doRefresh();
  }

  setTableGrid() {
    this.columnDefinitions = [
      { id: 'EmployeeCode', name: 'Employee Code', field: 'EmployeeCode', sortable: true, filterable:true},
      { id: 'EmployeeName', name: 'Employee Name', field: 'EmployeeName', sortable: true, filterable:true},
      { id: 'DOJ', name: 'DOJ', field: 'DOJ', sortable: true, filterable:true, formatter: this.DateFormatter},
      { id: 'LWD', name: 'LWD', field: 'LWD', sortable: true, filterable:true, formatter: this.DateFormatter},
      { id: 'ManagerName', name: 'Manager Name', field: 'ManagerName', sortable: true, filterable:true},
      { id: 'PeriodFrom', name: 'Period From', field: 'PeriodFrom', sortable: true, filterable:true, formatter: this.DateFormatter},
      { id: 'PeriodTo', name: 'Period To', field: 'PeriodTo', sortable: true, filterable:true, formatter: this.DateFormatter},
      { id: 'TagName', name: 'Tag Name', field: 'TagName', sortable: true, filterable:true},
      { id: 'PlannedHours', name: 'Planned Hours', field: 'PlannedHours', sortable: true, filterable:true},
      { id: 'TotalHours', name: 'Total Hours', field: 'TotalHours', sortable: true, filterable:true},
      { id: 'StatusName', name: 'Status', field: 'StatusName', sortable: true, filterable:true },
      { id: 'SubmittedOn', name: 'Submitted On', field: 'SubmittedOn', sortable: true, filterable:true, formatter: this.DateFormatterWithDay},
      { id: 'EmployeeRemarks', name: 'Employee Remarks', field: 'EmployeeRemarks', sortable: false, filterable:true},
      { id: 'ApprovedRejectedOn', name: 'Approved/Rejected On', field: 'ApprovedRejectedOn', sortable: true, filterable:true, formatter: this.DateFormatterWithDay},
      { id: 'ApproverRemarks', name: 'Approver Remarks', field: 'ApproverRemarks', sortable: true, filterable:true},
    ];

    this.gridOptions = {
      enableAutoResize: true,    
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,  
      enableFiltering: true,
      enablePagination: true,
      pagination: {
        pageSizes: [10,15,25,50,75,100],
        pageSize: 15,
        pageNumber: 1,
        totalItems: 0,
      }
    };
  }

  doRefresh() {
    this.spinner = true;
    if (this.BusinessType != 3) {
      this.selectedClient = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.selectedClientContract = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
      this.spinner = false;
    } else {
      this.selectedClient = null;
      this.selectedClientContract = null;
      forkJoin([this.getClientList()]).subscribe(value => {
        console.log('FORK JOIN OUTPUT :: ', value);
        this.spinner = false;
      }, error => {
        this.spinner = false;
        console.log('FORK JOIN ERROR:', error);
      });
    }
    
  }

  getClientList() {
    let datasource: DataSource = {
      Name: "GetUserMappedClientList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [

      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      }

    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.clientList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client List ::', apiResult);
        this.clientList = apiResult;
      } else {
        this.spinner = false;
      }
    });
  }

  getClientContractList() {
    let datasource: DataSource = {
      Name: "GetUserMappedClientContractList",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [

      {
        FieldName: "@roleId",
        Value: this.RoleId
      },
      {
        FieldName: "@userId",
        Value: this.UserId
      },
      {
        FieldName: "@clientId",
        Value: this.selectedClient
      }

    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.clientContractList = [];
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client Contract List ::', apiResult);
        this.clientContractList = apiResult;
      } else {
        this.spinner = false;
      }
    });
  }


  onClientChange(e) {
    console.log(e);
    if (e) {
      this.getClientContractList();
    }
  }

  onClientContractChange(e) {
    console.log(e);
  }

  onChangePeriodFrom(e) {
    if (e) {
      this.selectedPeriodFrom = e;
      this.maxDate = new Date(this.selectedPeriodFrom);
      this.maxDate.setDate(this.maxDate.getDate() + 30);
      this.selectedPeriodTo = new Date(this.maxDate);
      console.log('Max Date', this.maxDate);
    }
  }

  onChangePeriodTo(e) {
    if(e) {
      this.selectedPeriodTo = e;
    }
  }
  

  doSearch() {
    this.tableSpinner = true;
    this.timesheetReport = [];
    if (this.selectedClient && this.selectedClientContract) {
      this.timesheetservice.GetTimesheetReport(this.selectedClient, this.selectedClientContract, 
        moment(this.selectedPeriodFrom).format('YYYY-MM-DD'), moment(this.selectedPeriodTo).format('YYYY-MM-DD')).subscribe((result) => {
        if (result.Status && result.Result !== '') {
          const response = JSON.parse(result.Result);
          this.timesheetReport = response;
          this.tableSpinner = false;
          console.log('GetTimesheetReport result', response);
        } else {
          this.tableSpinner = false;
        }
      }), ((err) => {
        console.log('GetTimesheetReport API ERROR ::', err);
        this.tableSpinner = false;
      });
    }
  }

  exportExcel() {
    const exportExcelData = this.timesheetReport.map(({ Id, ...rest }) => rest);

    console.log(exportExcelData);
    this.excelService.exportAsExcelFile(exportExcelData, 'Timesheet_Report');
  }

  onTableRowClicked(rowData) {
    this.showDetailedView(rowData);
  }

  showDetailedView(data) {
    let modalOption: NgbModalOptions = {};
    modalOption.backdrop = 'static';
    
    modalOption.keyboard = false;
    const modalRef = this.modalService.open(TimesheetDetailedViewComponent,modalOption);
    modalRef.componentInstance.roleCode = this.roleCode;
    modalRef.componentInstance.UserId = this.UserId;
    modalRef.componentInstance.EmployeeId = this.EmployeeId;
    modalRef.componentInstance.modalData = data;
    modalRef.componentInstance.modeType = 'MANAGER_VIEW';

    modalRef.result.then((result) => {
      this.doRefresh();
    }).catch((error) => {
      console.log(error);
    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj1 = angularGrid && angularGrid.slickGrid || {};
  }

  DateFormatterWithDay(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value).format('ddd, D MMM YYYY');
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value, "DD-MM-YYYY").format('D MMM YYYY');
  }

}
