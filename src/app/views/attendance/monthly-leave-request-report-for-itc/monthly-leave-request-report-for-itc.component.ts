import { Component, OnInit,HostListener } from '@angular/core';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
declare let $: any;
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { Title } from '@angular/platform-browser';
import { Column, AngularGridInstance, GridOption, GridService,} from 'angular-slickgrid';
import { AlertService, ExcelService } from 'src/app/_services/service';
import { PageLayout } from '../../personalised-display/models';
import { RowDataService } from '../../personalised-display/row-data.service';
import moment from 'moment';


@Component({
  selector: 'app-monthly-leave-request-report-for-itc',
  templateUrl: './monthly-leave-request-report-for-itc.component.html',
  styleUrls: ['./monthly-leave-request-report-for-itc.component.css']
})
export class MonthlyLeaveRequestReportForITCComponent implements OnInit {

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName : any;
  spinner: boolean = false;
  pageTitle: any;
  // grid options
  mlReportGridInstance: AngularGridInstance;
  mlReportGrid: any;
  mlReportGridService: GridService;
  mlReportDataView: any;
  mlReportColumn: Column[] = [];
  mlReportGridOptions: GridOption = {};
  mlReportData: any;
  mlReportPagination = {
    pageSizes: [10, 15, 20, 25, 50, 75],
    pageSize: 15,
  };
  //General
  pageLayout: PageLayout = null;
  tempColumn: Column;
  columnName: string;
  code: string;
  clientId: number;
  attendancePeriodId: number;
  reportType: number;
  managerId: number;
  
  constructor(
    private attendanceService: AttendanceService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private excelService: ExcelService,
    private router: Router,
    private rowDataService: RowDataService,
    private alertservice: AlertService
  ) { }

  
  ngOnInit() {
    this.spinner = true;
    this.pageTitle = 'Leave Request Report';
    this.titleService.setTitle('Leave Request Report');
    console.log('INSIDE', this.rowDataService.dataInterface.RowData);
    this.spinner = false;
    if (this.rowDataService.dataInterface.RowData) {
      this.onRefresh();
    } else {
      this.alertservice.showInfo('No records found!');
      return this.onClose();
    }
  }

  onRefresh() {
    this.spinner = true;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change based on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.mlReportData = [];
    this.initialiseSlickGrid();
    this.getAttendanceLeaveRequestReportData();
    this.spinner = false;
  }

  getAttendanceLeaveRequestReportData() {
    this.loadingScreenService.startLoading();
    const rowdata = this.rowDataService.dataInterface.RowData;
    const values = rowdata.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
    const { '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@StartDate': startDate, '@EndDate': endDate, '@UserId': userId, '@RoleId': roleId} = values;
    this.attendanceService.getMLReportForITC(this.UserId, this.RoleId, districtId, branchId, distributorId, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD')).subscribe((result) => {
      let apiResponse: apiResult = result;
      this.mlReportData = [];
      try {
        if (apiResponse.Status && apiResponse.Result) {
          let jsonObj = JSON.parse(apiResponse.Result) as any;
          
          jsonObj.forEach(function(row, index) {
            row.Id = index + 1;
          });
          this.mlReportData = jsonObj;
          console.log('ATTENDANCE LEAVE REPORT SUCCESS -->',this.mlReportData);
          this.loadingScreenService.stopLoading();
          this.spinner = false;
        } else { 
          console.log('ATTENDANCE LEAVE REPORT ERROR -->', apiResponse);
          this.loadingScreenService.stopLoading();
          this.alertservice.showInfo('No Data Available !');
          this.mlReportData = [];
          this.spinner = false;
        }
      } catch (error) {
        this.mlReportData = [];
        this.loadingScreenService.stopLoading();
        this.spinner = false;
        console.log('ATTENDANCE LEAVE REPORT ERROR -->', error);
      } 
    }), ((err: any) => {
      this.loadingScreenService.stopLoading();
      this.spinner = false;
      console.log('ATTENDANCE LEAVE REPORT ERROR -->', err);
    });
  }

  initialiseSlickGrid() {
    this.mlReportColumn = [{
      id: "DistrictCode",
      name: "District Code",
      field: "DistrictCode",
      sortable: true,
    }, {
      id: "BranchCode",
      name: "Branch Code",
      field: "BranchCode",
      sortable: true,
    }, {
      id: "DistributorCode",
      name: "Distributor Code",
      field: "DistributorCode",
      sortable: true,
    }, {
      id: "PSRId",
      name: "PSR Id",
      field: "PSRId",
      sortable: true,
    }, {
      id: "FirstName",
      name: "Employee Name",
      field: "FirstName",
      sortable: true
    }, {
    //   id: "ReportingManagerName",
    //   name: "Reporting Manager Name",
    //   field: "ReportingManagerName",
    //   sortable: true,
    // }, {
    //   id: "NextLevelManagerName",
    //   name: "Next Level Manager Name",
    //   field: "NextLevelManagerName",
    //   sortable: true,
    // }, {
      id: "AppliedFrom",
      name: "Leave From",
      field: "AppliedFrom",
      sortable: true,
    }, {
      id: "AppliedTill",
      name: "Leave To",
      field: "AppliedTill",
      sortable: true,
    }, {
      id: "AppliedOn",
      name: "Applied On",
      field: "AppliedOn",
      sortable: true,
    }, {
      id: "LeaveType",
      name: "Leave Type",
      field: "LeaveType",
      sortable: true,
    }, {
      id: "LeaveDescription",
      name: "Leave Description",
      field: "LeaveDescription",
      sortable: true,
    }, {
      id: "Status",
      name: "Status",
      field: "Status",
      sortable: true,
    }, {
      id: "ValidatedOn",
      name: "Approved / Rejected On",
      field: "ValidatedOn",
      sortable: true,
    }, {
      id: "LastUpdatedBy",
      name: "Status Updated By",
      field: "LastUpdatedBy",
      sortable: true,
    }, {
      id: "LastUpdatedOn",
      name: "Status Updated On",
      field: "LastUpdatedOn",
      sortable: true,
    }, {
      id: "ApplierRemarks",
      name: "Applier Remarks",
      field: "ApplierRemarks",
      sortable: true,
    }, {
      id: "CancellationRemarks",
      name: "Cancellation Remarks",
      field: "CancellationRemarks",
      sortable: true,
    }, {
      id: "ValidatorRemarks",
      name: "Validator Remarks",
      field: "ValidatorRemarks",
      sortable: true,
    }
    ];

    this.mlReportGridOptions = {
      enableAutoResize: true, 
      datasetIdPropertyName: "Id",
      forceFitColumns: true,
      enableGridMenu: true
    };
    this.mlReportGridOptions.enablePagination = true;
    this.mlReportGridOptions.pagination = this.mlReportPagination;
    
    
   
  }

  initiateManagerLevelReportGridReady(angularGrid: AngularGridInstance) {
    this.mlReportGridInstance = angularGrid;
    // this.mlReportGridOptions = angularGrid && angularGrid.slickGrid || {};
  }

  exportToExcel() {
    // download the file using old school javascript method
    var string = 'LeaveRequestReport_';
    var length = 30;
    var trimmedString = string.substring(0, length);
    console.log('export data -->', this.mlReportData);
    let exportExcelDate = [];
    const excelArray =  this.mlReportData;
    excelArray.forEach(element => {
      exportExcelDate.push({
        DistrictCode: element.DistrictCode,
        BranchCode: element.BranchCode,
        DistributorCode: element.DistributorCode,
        PSRID: element.PSRId,
        EmployeeName: element.FirstName,
       // ReportingManagerName: element.ReportingManagerName,
       // NextLevelManagerName: element.NextLevelManagerName,
        LeaveFrom: element.AppliedFrom,
        LeaveTo: element.AppliedTill,
        AppliedOn: element.AppliedOn,
        LeaveType: element.LeaveType,
        LeaveDescription: element.LeaveDescription,
        Status: element.Status,
        ApprovedOrRejectedOn: element.ValidatedOn,
        StatusUpdatedBy: element.LastUpdatedBy,
        StatusUpdatedOn: element.LastUpdatedOn,
        ApplierRemarks: element.ApplierRemarks,
        CancellationRemarks: element.CancellationRemarks,
        ValidatorRemarks: element.ValidatorRemarks
      })
    });

    console.log('Exported Excel Data', exportExcelDate);

    this.excelService.exportAsExcelFile(exportExcelDate, trimmedString);
  }

  onClose() {
    this.rowDataService.dataInterface.RowData = null;
    this.router.navigateByUrl('app/listing/ui/MLReportITC')
  }

}
