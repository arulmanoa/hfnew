import { Component, OnInit,HostListener } from '@angular/core';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { EntitlementType } from 'src/app/_services/model/Attendance/EntitlementType';
declare let $: any;
import { ActivatedRoute, Router } from '@angular/router';
import Swal from "sweetalert2";
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { apiResult } from 'src/app/_services/model/apiResult';
import { AlertService, EmployeeService, ExcelService, HeaderService, PagelayoutService, PayrollService } from 'src/app/_services/service';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { BaseModel, UIMode } from 'src/app/_services/model/Common/BaseModel';
import { Attendance, AttendanceType } from 'src/app/_services/model/Payroll/Attendance';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { EntitlementAvailmentRequest, EntitlementRequestStatus, EntitlementUnitType } from 'src/app/_services/model/Attendance/EntitlementAvailmentRequest';
import { EmployeeEntitlement } from 'src/app/_services/model/Attendance/AttendanceEntitlment';
import { Column, AngularGridInstance, GridOption, Formatter, GridService, BsDropDownService, Filters, FileType, Formatters, FieldType, OnEventArgs } from 'angular-slickgrid';
import { DataSource, PageLayout } from '../../personalised-display/models';
import { RowDataService } from '../../personalised-display/row-data.service';
import { environment } from "../../../../environments/environment";
import { DataSourceType, SearchPanelType } from '../../personalised-display/enums';

@Component({
  selector: 'app-managerleaverequest',
  templateUrl: './managerleaverequest.component.html',
  styleUrls: ['./managerleaverequest.component.css']
})
export class ManagerleaverequestComponent implements OnInit {
  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName : any;
  spinner: boolean = false;
  pageTitle: any;
  // grid options
  managerLevelLeaveReportGridInstance: AngularGridInstance;
  managerLevelLeaveReportGrid: any;
  managerLevelLeaveReportGridService: GridService;
  managerLevelLeaveReportDataView: any;
  managerLevelLeaveReportColumn: Column[] = [];
  managerLevelLeaveReportGridOptions: GridOption = {};
  managerLevelLeaveReportData: any;
  managerLevelLeaveReportPagination = {
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
  isMobileResolution: boolean;
  // remove later
  managerLeaveRequestReportData: any;

  @HostListener("window:resize", [])
  private onResize() {
    this.detectScreenSize();
  }
  
  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private payrollService: PayrollService,
    private loadingScreenService: LoadingScreenService,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private employeeService: EmployeeService,
    private pageLayoutService: PagelayoutService,
    private rowDataService: RowDataService,
    private excelService: ExcelService,
    private router: Router,

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
    this.pageTitle = 'Leave Request Report';
    this.titleService.setTitle('Leave Request Report');
    console.log('INSIDE');
    this.spinner = false;
    this.onRefresh();
  }

  onRefresh() {
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses)); // Get the whole matched session element set as a clean json(array) via an session object
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id; // bind Logged user id may be change baed on dashboard 
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.managerLeaveRequestReportData = [];
    // this.clientId = 0;
    // this.attendancePeriodId = 0;
    this.reportType = 1;
    this.managerId =0;
    this.route.queryParams.subscribe(params => {
      if (JSON.stringify(params) != JSON.stringify({})) {
        var encodedIdx = atob(params["Idx"]);
        var encodedMdx = atob(params["Mdx"]);
        this.clientId = Number(encodedIdx) == undefined ? 0 : Number(encodedIdx);
        this.attendancePeriodId = Number(encodedMdx) == undefined ? 0 : Number(encodedMdx);
        this.initialiseSlickGrid();
        this.getAttendanceLeaveRequestReportData();

      } else {
        this.spinner = false;
        alert('No records found!');
        this.onClose();
        return;
      }
    });
  }

  getAttendanceLeaveRequestReportData() {
    this.spinner = true;
    this.loadingScreenService.startLoading();
    // this.RoleId= 8;
    this.attendanceService.GetAttendanceLeaveRequestsReport(this.clientId, this.attendancePeriodId, this.UserId, this.reportType, this.managerId, this.RoleId).subscribe((result) => {
      let apiResponse: apiResult = result;
      this.managerLevelLeaveReportData = [];
      try {
        if (apiResponse.Status && apiResponse.Result) {
          let jsonObj = JSON.parse(apiResponse.Result) as any;
          this.managerLeaveRequestReportData = jsonObj;
          jsonObj.forEach(function(row, index) {
            row.Id = index;
          });
          this.managerLevelLeaveReportData = jsonObj;

          console.log('ATTENDANCE LEAVE REPORT SUCCESS -->',this.managerLevelLeaveReportData);
          this.loadingScreenService.stopLoading();
          this.spinner = false;
        } else { 
          console.log('ATTENDANCE LEAVE REPORT ERROR -->', apiResponse);
          this.loadingScreenService.stopLoading();
          this.spinner = false;
        }
      } catch (error) {
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
    this.managerLevelLeaveReportColumn = [{
      id: "EmployeeCode",
      name: "Employee Code",
      field: "EmployeeCode",
      sortable: true,
    }, {
      id: "FirstName",
      name: "Employee Name",
      field: "FirstName",
      sortable: true
    }, {
      id: "ReportingManagerName",
      name: "Reporting Manager Name",
      field: "ReportingManagerName",
      sortable: true,
    }, {
      id: "NextLevelManagerName",
      name: "Next Level Manager Name",
      field: "NextLevelManagerName",
      sortable: true,
    }, {
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
    },  {
      id: "Status",
      name: "Status",
      field: "Status",
      sortable: true,
    }, {
      id: "LeaveDescription",
      name: "Leave Description",
      field: "LeaveDescription",
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

    this.managerLevelLeaveReportGridOptions = {
      enableAutoResize: true, 
      datasetIdPropertyName: "Id",
      forceFitColumns: true,
      enableGridMenu: true,   // <<-- this will automatically add extra custom commands
      presets: {
        // the column position in the array is very important and represent
        // the position that will show in the grid
        // if a column is omitted from the array, it will be hidden from grid
        // columns: [
        //   { columnId: 'EmployeeCode' },
        //   { columnId: 'FirstName' },
        //   { columnId: 'ReportingManagerName' },
        //   { columnId: 'NextLevelManagerName' },
        //   { columnId: 'AppliedFrom' },
        //   { columnId: 'AppliedTill' },
        //   { columnId: 'AppliedOn' },
        //   { columnId: 'LeaveType' },
        //   { columnId: 'Status' },
        //   { columnId: 'LastUpdatedBy' },
        //   { columnId: 'LastUpdatedOn' }
        // ],
      }
    };
    this.managerLevelLeaveReportGridOptions.enablePagination = true;
    this.managerLevelLeaveReportGridOptions.pagination = this.managerLevelLeaveReportPagination;
    
    
   
  }

  initiateManagerLevelReportGridReady(angularGrid: AngularGridInstance) {
    this.managerLevelLeaveReportGridInstance = angularGrid;
    // this.managerLevelLeaveReportGridOptions = angularGrid && angularGrid.slickGrid || {};
  }

  exportToExcel() {
    // download the file using old school javascript method
    var string = 'LeaveRequestReport_';
    var length = 30;
    var trimmedString = string.substring(0, length);
    console.log('export data -->', this.managerLeaveRequestReportData);
    let exportExcelDate = [];
    const excelArray =  this.managerLeaveRequestReportData;
    excelArray.forEach(element => {
      exportExcelDate.push({
        EmployeeCode: element.EmployeeCode,
        EmployeeName: element.FirstName,
        ReportingManagerName: element.ReportingManagerName,
        NextLevelManagerName: element.NextLevelManagerName,
        LeaveFrom: element.AppliedFrom,
        LeaveTo: element.AppliedTill,
        AppliedOn: element.AppliedOn,
        LeaveType: element.LeaveType,
        Status: element.Status,
        LeaveDescription: element.LeaveDescription,
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
    this.router.navigateByUrl('app/listing/ui/MLReport')
  }

}
