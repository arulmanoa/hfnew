import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { AlertService, ExcelService, PagelayoutService } from 'src/app/_services/service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { SearchElement } from 'src/app/views/personalised-display/models';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { SearchConfiguration } from 'src/app/views/personalised-display/models';
import { AttendanceService } from '@services/service/attendnace.service';
import { Column, GridOption, AngularGridInstance } from 'angular-slickgrid';

@Component({
  selector: 'app-generic-leave-reports',
  templateUrl: './generic-leave-reports.component.html',
  styleUrls: ['./generic-leave-reports.component.css']
})
export class GenericLeaveReportsComponent implements OnInit {

  noData: boolean = false;
  spinner: boolean = false;
  refreshing_table_spinner: boolean = false;
  clientList: any[] = [];

  sessionDetails: LoginResponses;
  roleId: number = 0;
  roleCode: string = '';
  userId: any = 0;
  userName: any;
  companyId: any;
  businessType: any;
  employeeId: any;

  searchElementConfiguration: SearchConfiguration;
  searchElementList: SearchElement[];
  selectedValues: SearchElement[] = [];

  dataset: any =[];
  columnDefinition: Column[];
  gridOptions: GridOption;
  angularGrid: AngularGridInstance;
  gridObj: any;
  dataviewObj: any;
  code: string = 'leaveRequestReport';

  constructor(
    private alertService: AlertService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private titleService: Title,
    private pageLayoutService: PagelayoutService,
    private loadingScreenService: LoadingScreenService,
    private excelService: ExcelService,
    private attendanceService: AttendanceService
  ) { }

  ngOnInit() {
    this.noData = false;
    this.spinner = true;
    this.titleService.setTitle('Leave Report');

    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.userId = this.sessionDetails.UserSession.UserId;
    this.userName = this.sessionDetails.UserSession.PersonName;
    this.roleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.roleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.businessType = this.sessionDetails.Company.LstCompanyBusinessTypeMapping != null ? this.sessionDetails.Company.LstCompanyBusinessTypeMapping.find(item => item.CompanyId == this.sessionDetails.Company.Id).BusinessType : 0;

    this.doRefresh();
  }

  doRefresh() {
    this.dataset = [];
    // this.columnDefinition = [
    //   {
    //     id: 'EmployeeCode',
    //     field: "EmployeeCode",
    //     filterable: true,
    //     name: "Employee Code"
    //   },
    //   {
    //     id: 'EmployeeName',
    //     field: "EmployeeName",
    //     filterable: true,
    //     name: 'Employee Name'
    //   },
    //   {
    //     id: 'DOJ',
    //     field: 'DOJ',
    //     filterable: true,
    //     name: 'DOJ'
    //   },
    //   {
    //     id: 'Department',
    //     field: 'Department',
    //     filterable: true,
    //     name: 'Department'
    //   },
    //   {
    //     id: 'Division',
    //     field: 'Division',
    //     filterable: true,
    //     name: 'Division'
    //   },
    //   {
    //     id: 'City',
    //     field: 'City',
    //     filterable: true,
    //     name: 'City'
    //   },
    //   {
    //     id: "SubEmploymentType",
    //     field: "SubEmploymentType",
    //     filterable: true,
    //     name: "Sub Employment Type"
    //   },
    //   {
    //     id: "LeaveType",
    //     field: "LeaveType",
    //     filterable: true,
    //     name: "LeaveType"
    //   },
    //   {
    //     id: "UtilizationDate",
    //     field: "UtilizationDate",
    //     name: "Utilization Date",
    //     filterable: true,
    //   },
    //   {
    //     id: "UtilizedOnDate",
    //     field: "UtilizedOnDate",
    //     filterable: true,
    //     name: "Utilized On Date"
    //   },
    //   {
    //     id: "ValidatorName",
    //     field: "ValidatorName",
    //     name: 'Approved By',
    //     filterable: true,

    //   },
    //   {
    //     id: 'Status',
    //     field: 'Status',
    //     filterable: true,
    //     name: 'Status'
    //   }
    // ];
    this.gridOptions = {
      enableAutoResize: true,      
      autoResize: {
        containerId: 'grid-container',
      },
      enableCellNavigation: true,
      datasetIdPropertyName: "Id",
      editable: true,
      forceFitColumns: true,
      enableHeaderMenu: false,
      enableGridMenu: true,  
      enableFiltering: true,
      enablePagination: true
    };

    this.searchElementConfiguration = null;
    this.getPageLayOut().then((result) => { this.spinner = false; });
  }

  getPageLayOut() {
    const promise = new Promise((res, rej) => {
      this.spinner = true;
      this.pageLayoutService.getPageLayout(this.code).subscribe(data => {
        if (data.Status === true && data.dynamicObject != null) {
          if (this.businessType !== 3) {
            this.pageLayoutService.fillSearchElementsForSME(data.dynamicObject.SearchConfiguration.SearchElementList);
            this.pageLayoutService.fillSearchElementsForSecurityKeys(data.dynamicObject.SearchConfiguration.SearchElementList);
          }
          this.searchElementConfiguration = data.dynamicObject.SearchConfiguration;
          // console.log('data.dynamicObject', data.dynamicObject);
          res(true);
        }
        else {
          res(true);
        }
      }, error => {
        console.log(error);
      });
    });
    return promise;
  }

  onSearchBtnClickedEvent(data) {
    // console.log('clicked', data);
    this.refreshing_table_spinner = true;
    this.loadingScreenService.startLoading();
    this.selectedValues = data;
    this.dataset = [];
    if (this.selectedValues && this.selectedValues.length) {
      this.doSearch();
    }
  }

  doSearch() {
    const filterObject = this.selectedValues.filter(item => item.IsIncludedInDefaultSearch === true).reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
    const values = this.selectedValues.filter(item => item.IsIncludedInDefaultSearch === false).reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
    const clientId = values['@clientId'];
    const clientcontractIdSME = this.sessionService.getSessionStorage("default_SME_ContractId");
    let dataObj = {};
    const filterKeysMapping = {
      '@departmentId': 'DepartmentId',
      '@divisionId': 'DivisionId',
      '@cityId': 'CityId',
      '@empCodes': 'EmployeeCodes'
    };
    
    for (const key in filterObject) {
      if (filterObject.hasOwnProperty(key)) {
        const newKey = filterKeysMapping[key];
        if (newKey && filterObject[key] !== null) {
          dataObj[newKey] = filterObject[key];
          if (newKey == 'EmployeeCodes') {
            dataObj[newKey] = JSON.parse (filterObject[key]);
          }
        }
      }
    }    
    const filterStr = Object.keys(dataObj).length ? JSON.stringify(dataObj) : '';
    console.log(filterStr, values);
    // this.loadingScreenService.stopLoading();
    // return;
    this.attendanceService.getCompensationReport(filterObject['@periodFrom'], filterObject['@periodTo'],clientId,clientcontractIdSME, filterStr).subscribe((response: any) => {
      this.loadingScreenService.stopLoading();
      if (response.Status && response.Result && response.Result != '') { 
        this.noData = false;
        this.dataset = JSON.parse(response.Result);
        this.setTable();
        this.refreshing_table_spinner = false;
      } else {
        this.noData = true;
        this.dataset = [];
        this.alertService.showWarning(response.Message);
        this.refreshing_table_spinner = false;
      }
    }, err => {
      console.log('ERROR IN GetBranchGapReport API ::', err);
    });
  }

  angularGridReady(angularGrid: AngularGridInstance) {
    this.angularGrid = angularGrid;
    this.gridObj = angularGrid && angularGrid.slickGrid || {};
  }

  setTable() {
    console.log("Creating Dynamic Columns");
    let keys = Object.keys(this.dataset[0]);
    keys = keys.filter(x => x !== 'ID' && x !== 'Id' && x !== 'id');
    this.columnDefinition = this.pageLayoutService.setDynamicColumns(keys);
    console.log("Dynamic Columns :: ", this.columnDefinition);
  }

  exportAsExcel() {
    const fileNameForDownloadExcel = 'CompensationOff_Report_'; // this needs to changed according to selected leave report
    if (this.dataset && this.dataset.length) {
      const exportDataWithoutId = this.dataset.map(({ Id, id, ID, ...rest }) => rest);
      console.log(`:::: EXPORT ${fileNameForDownloadExcel}::::`, exportDataWithoutId);
      this.excelService.exportAsExcelFile(exportDataWithoutId, fileNameForDownloadExcel);
    }
  }

}
