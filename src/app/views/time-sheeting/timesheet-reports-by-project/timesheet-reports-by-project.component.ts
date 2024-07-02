import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { LoginResponses } from 'src/app/_services/model';
import { forkJoin } from 'rxjs';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SessionStorage } from 'src/app/_services/service/session-storage.service';
import * as _ from 'lodash';
import { ExcelService, PagelayoutService } from 'src/app/_services/service';
import { DataSource, SearchConfiguration, SearchElement } from 'src/app/views/personalised-display/models';
import { DataSourceType, InputControlType } from '../../personalised-display/enums';
import { TimesheetService } from 'src/app/_services/service/time-sheet.service';
import moment from 'moment';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { AngularGridInstance, Column, GridOption } from 'angular-slickgrid';

@Component({
  selector: 'app-timesheet-reports-by-project',
  templateUrl: './timesheet-reports-by-project.component.html',
  styleUrls: ['./timesheet-reports-by-project.component.css']
})
export class TimesheetReportsByProjectComponent implements OnInit {

  @ViewChild('tabletoExcel') table: ElementRef;

  spinner: boolean = false;
  tableSpinner; boolean = false;
  clientList: any[] = [];
  clientContractList: any[] = [];
  projectList: any[] = [];
  selectedPeriodFrom: any;
  selectedPeriodTo: any;
  selectedClient: any;
  selectedClientContract: any;
  selectedProject: any;

  _loginSessionDetails: LoginResponses;
  UserId: any;
  RoleId: any;
  BusinessType: any;
  maxDate: any;
  timesheetReport: any[] = [];

  angularGrid: AngularGridInstance;
  gridObj: any;
  columnDefinitions: Column[];
  gridOptions: GridOption;

  searchElementConfiguration: SearchConfiguration;
  searchElementList : SearchElement[];
  selectedValues: SearchElement[] = [];

  constructor(
    private sessionService: SessionStorage,
    private timesheetservice: TimesheetService,
    public pageLayoutService: PagelayoutService,
    private excelService: ExcelService,
    private loadingScreenService: LoadingScreenService
  ) { }

  ngOnInit() {
    this._loginSessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.UserId = this._loginSessionDetails.UserSession.UserId;
    this.RoleId = this._loginSessionDetails.UIRoles[0].Role.Id;
    this.BusinessType = this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this._loginSessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this._loginSessionDetails.Company.Id).BusinessType : 0;

    let date = new Date(), y = date.getFullYear(), m = date.getMonth();
    let firstDay = new Date(y, m, 1);
    let lastDay = new Date(y, m + 1, 0);
    this.selectedPeriodFrom = new Date(firstDay);
    this.selectedPeriodTo = new Date(lastDay);
    this.maxDate = new Date(lastDay);
    this.setTableGrid();

    this.doRefresh();
  }

  doRefresh() {
    this.spinner = true;
    if (this.BusinessType != 3) {
      this.selectedClient = Number(this.sessionService.getSessionStorage("default_SME_ClientId"));
      this.selectedClientContract = Number(this.sessionService.getSessionStorage("default_SME_ContractId"));
      this.getProjectsList();
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
    this.loadingScreenService.startLoading();
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
      this.loadingScreenService.stopLoading();
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Client Contract List ::', apiResult);
        this.clientContractList = apiResult;
      } else {
        this.spinner = false;
      }
    });
  }

  getProjectsList() {
    this.loadingScreenService.startLoading();
    let datasource: DataSource = {
      Name: "GetProjectsForAClient",
      Type: DataSourceType.SP,
      IsCoreEntity: false
    }

    let searchElements: SearchElement[] = [

      {
        FieldName: "@clientId",
        Value: this.selectedClient
      },
      {
        FieldName: "@clientcontractId",
        Value: this.selectedClientContract
      }

    ];

    this.pageLayoutService.getDataset(datasource, searchElements).subscribe((result) => {
      console.log('result', result);
      this.projectList = [];
      this.loadingScreenService.stopLoading();
      if (result.Status && result.dynamicObject != null && result.dynamicObject != '') {
        let apiResult = JSON.parse(result.dynamicObject);
        console.log('Result Project List ::', apiResult);
        this.projectList = apiResult;
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
    if (e) {
      this.getProjectsList();
    }
  }

  onProjectChange(e) {
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
      this.timesheetservice.GetProjectWiseTimesheetReport(this.selectedClient, this.selectedClientContract, 
        moment(this.selectedPeriodFrom).format('YYYY-MM-DD'), moment(this.selectedPeriodTo).format('YYYY-MM-DD'), this.selectedProject).subscribe((result) => {
        if (result.Status && result.Result !== '') {
          const response = JSON.parse(result.Result);
          response.forEach((e, idx) => {
            e.Id = idx;
          });
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
    this.excelService.exportAsExcelFile(exportExcelData, 'Projectwise_Timesheet_Report');
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid && angularGrid.slickGrid || {};
  }

  DateFormatter(rowIndex, cell, value, columnDef, grid, dataProvider) {
    if (value == null || value === "") { return "---"; }
    return moment.utc(value, "DD-MM-YYYY").format('ddd, D MMM YYYY');
  }

  setTableGrid() {
    this.columnDefinitions = [
      { id: 'ProjectCode', name: 'Project Code', field: 'ProjectCode', sortable: true, filterable:true},
      { id: 'ProjectName', name: 'Project Name', field: 'ProjectName', sortable: true, filterable:true},
      { id: 'ActivityName', name: 'Activity Name', field: 'ActivityName', sortable: true, filterable:true},
      { id: 'TransactionDate', name: 'Date', field: 'TransactionDate', sortable: true, filterable:true, formatter: this.DateFormatter},
      { id: 'WorkingHours', name: 'Working Hours', field: 'WorkingHours', sortable: true, filterable:true}
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

}
