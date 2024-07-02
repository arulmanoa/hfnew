import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import * as moment from 'moment';
import { AttendanceService } from 'src/app/_services/service/attendnace.service';
import { ActivatedRoute, Router } from '@angular/router';;
import * as _ from 'lodash';
import { SessionStorage } from '../../../_services/service/session-storage.service';
import { SessionKeys } from 'src/app/_services/configs/app.config';
import { LoginResponses } from '../../../_services/model/Common/LoginResponses';
import { AlertService, ExcelService } from 'src/app/_services/service';
import { LoadingScreenService } from 'src/app/shared/components/loading-screen/loading-screen.service';
import { enumHelper } from 'src/app/shared/directives/_enumhelper';
import { Title } from '@angular/platform-browser';
import { apiResult } from 'src/app/_services/model/apiResult';
import { DataSourceType, InputControlType, SearchPanelType } from '../../personalised-display/enums';
import { SearchConfiguration, SearchElement } from '../../personalised-display/models';

@Component({
  selector: 'app-attendance-summary-daily-view-report',
  templateUrl: './attendance-summary-daily-view-report.component.html',
  styleUrls: ['./attendance-summary-daily-view-report.component.css']
})
export class AttendanceSummaryDailyViewReportComponent implements OnInit {

  @ViewChild('tabletoExcel') table: ElementRef;

  refreshing_table_spinner: boolean = false;
  spinner: boolean = false;
  noData: boolean = false;
  attendanceSummaryDailyReportData = [];

  sessionDetails: LoginResponses;
  RoleId: number = 0;
  UserId: any = 0;
  UserName: any;
  employeeId: any;
  RoleCode: any;

  clientID: any;
  clientContractId: number = 0;
  attendancePeriodId: any;
  branchId: any;
  searchText: string = '';

  searchElementConfiguration: SearchConfiguration;
  searchElementList: SearchElement[];
  selectedValues: SearchElement[] = [];
  showTable: boolean = false;

  keys = [
    '01 May 2023',
    '02 May 2023',
    '03 May 2023'
  ];

  rows = [
    { 'firstColumn': 'Total Active DS', '01 May 2023': '500', '02 May 2023': '500', col3: '500' },
    { firstColumn: 'Current Day Attendance', col1: '250', col2: '400', col3: '300' },
    { firstColumn: 'DS Present in last 1 Week (Single Day)', col1: '200', col2: '300', col3: '400' },
    { firstColumn: 'Issue 1 ( leave)', col1: '0', col2: '10', col3: '2' },
    { firstColumn: 'Issue 2 ( Regularization)', col1: '2', col2: '5', col3: '7' },
    { firstColumn: 'Issue 3 (Attrition Check DS)', col1: '0', col2: '1', col3: '1' },
    { firstColumn: 'Issue 4 (Inactive DS)', col1: '2', col2: '0', col3: '7' }
  ];

  constructor(
    private attendanceService: AttendanceService,
    private alertService: AlertService,
    private loadingScreenService: LoadingScreenService,
    public utilsHelper: enumHelper,
    public sessionService: SessionStorage,
    private route: ActivatedRoute,
    private titleService: Title,
    private router: Router,
    private excelService: ExcelService
  ) { }

  ngOnInit() {
    this.spinner = true;
    this.sessionDetails = JSON.parse(this.sessionService.getSessionStorage(SessionKeys.LoginResponses));
    this.RoleId = this.sessionDetails.UIRoles[0].Role.Id;
    this.UserId = this.sessionDetails.UserSession.UserId;
    this.RoleCode = this.sessionDetails.UIRoles[0].Role.Code;
    this.UserName = this.sessionDetails.UserSession.PersonName;
    this.titleService.setTitle('Attendance Summary Report');
    console.log('Inside Daily Basis Attendance Summary Report');
    this.searchElementList  = [
      { 
        DataSource : {
          IsCoreEntity : false,
          Name : "",
          Type : 0
        },
        DefaultValue : this.UserId,
        DisplayFieldInDataset : "Name",
        FieldName : "@UserId",
        DisplayName : "User Id",
        ForeignKeyColumnNameInDataset : "",
        IsIncludedInDefaultSearch : false,
        InputControlType : InputControlType.TextBox,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : [],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: false,
        Value: this.UserId
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "",
          Type : 0
        },
        DefaultValue : this.RoleId,
        DisplayFieldInDataset : "Name",
        FieldName : "@RoleId",
        DisplayName : "Role Id",
        ForeignKeyColumnNameInDataset : "",
        IsIncludedInDefaultSearch : false,
        InputControlType : InputControlType.TextBox,
        Value : this.RoleId,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : [],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: false
      }, 
     { 
        DataSource : {
          IsCoreEntity : false,
          Name : "GetAllDistrictDetails",
          Type : 0
        },
        DefaultValue : 0,
        DisplayFieldInDataset : "DistrictName",
        FieldName : "@DistrictId",
        DisplayName : "District Name",
        ForeignKeyColumnNameInDataset : "DistrictId",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@UserId", "@RoleId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "GetAllBranchDetails",
          Type : 0
        },
        DefaultValue : 0,
        DisplayFieldInDataset : 'BranchName',
        FieldName : "@BranchId",
        DisplayName : 'Branch Name',
        ForeignKeyColumnNameInDataset : "BranchId",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@DistrictId", "@UserId", "@RoleId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }, { 
        DataSource : {
          IsCoreEntity : false,
          Name : "GetAllDistributorDetails",
          Type : 0
        },
        DefaultValue : 0,
        DisplayFieldInDataset : 'DistributorName',
        FieldName : "@DistributorId",
        DisplayName : 'Distributor Name',
        ForeignKeyColumnNameInDataset : "DistributorId",
        IsIncludedInDefaultSearch : true,
        InputControlType : InputControlType.AutoFillTextBox,
        Value : null,
        TriggerSearchOnChange : false,
        ReadOnly : false,
        DropDownList : [],
        ParentHasValue : [],
        ParentFields : ["@BranchId", "@UserId", "@RoleId", "@DistrictId"],
        MultipleValues : null,
        GetValueFromUser : false,
        SendElementToGridDataSource : true,
        IsFieldMandatory: true
      }, {
        DisplayName : "Start Date",
        FieldName : "@startDate",
        Value : null,
        MultipleValues : null,
        DropDownList : [],
        InputControlType : InputControlType.DatePicker,
        DataSource : {
          Name : "",
          Type : 0,
          IsCoreEntity : false,
          EntityType : 0
        },
        ForeignKeyColumnNameInDataset : '',
        DisplayFieldInDataset : '',
        IsIncludedInDefaultSearch : true,
        SendElementToGridDataSource : false,
        ParentFields : [],
        IsFieldMandatory: true
      }, {
        DisplayName : "End Date",
        FieldName : "@endDate",
        Value : null,
        MultipleValues : null,
        DropDownList : [],
        InputControlType : InputControlType.DatePicker,
        DataSource : {
          Name : "",
          Type : 0,
          IsCoreEntity : false,
          EntityType : 0
        },
        ForeignKeyColumnNameInDataset : '',
        DisplayFieldInDataset : '',
        IsIncludedInDefaultSearch : true,
        SendElementToGridDataSource : false,
        ParentFields : ["@startDate"],
        IsFieldMandatory: true
      }
    ];
    this.doRefresh();
  }

  doRefresh() {
    this.showTable = false;
    this.searchElementConfiguration = {
      IsDataLevelSecurityRequired: true,
      SecurityKeys: [['UserId'], ['RoleId']],
      SearchElementList: _.cloneDeep(this.searchElementList),
      SearchPanelType: SearchPanelType.Panel,
      SearchButtonRequired: true,
      ClearButtonRequired: false
    };
    this.spinner = false;
  }

  private getAttendanceSummaryReportData() {
    const promise = new Promise((res, rej) => {
      this.refreshing_table_spinner = true;
      const values = this.selectedValues.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
      const { '@UserId': userId, '@RoleId': roleId, '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@startDate': startDate, '@endDate': endDate } = values;
      this.attendanceService.GetAttendanceSummaryReportDailyBasis(roleId, userId, districtId, branchId, distributorId, moment(startDate).format('YYYY-MM-DD'), moment(endDate).format('YYYY-MM-DD'))
        .subscribe((result) => {
          console.log('GetAttendanceSummaryReportDailyBasis ::', result);
          try {
            let apiresult: apiResult = result;
            if (apiresult.Status && apiresult.Result != null) {
              console.log(':: RESULT ::', JSON.parse(apiresult.Result));
              this.attendanceSummaryDailyReportData = JSON.parse(apiresult.Result);
              if (this.attendanceSummaryDailyReportData && this.attendanceSummaryDailyReportData.length) {
                this.keys = this.attendanceSummaryDailyReportData.map(({ DisplayDate }) => DisplayDate);
                this.rows = Object.keys(this.attendanceSummaryDailyReportData[0])
                  .filter((key) => key !== "TDate" && key !== "DisplayDate") // exclude TDate and DisplayDate properties
                  .map((key) => {
                    const firstColumn = key.replace(/([A-Z])/g, " $1");
                    // reduce to an object with DisplayDate as keys and current property value as values
                    const dataByDisplayDate = this.attendanceSummaryDailyReportData.reduce(
                      (acc, item) => ({
                        ...acc,
                        [item.DisplayDate]: String(item[key]),
                      }),{}
                    );
                    return { firstColumn, ...dataByDisplayDate };
                  });
                console.log(this.rows, this.keys);
              } else {
                this.noData = true;
              }
              
              this.showTable = true;
              res(true);
            } else {
              res(null);
              this.noData = true;
              this.refreshing_table_spinner = false;
              this.alertService.showWarning(apiresult.Message);
            }

          } catch (error) {
            this.refreshing_table_spinner = false;
            this.noData = true;
            this.alertService.showWarning('GetAttendanceSummaryDailyReport Error: ' + error);
          }
        }, err => {
          console.error('GETATTENDANCESUMMARYDAILYREPORT ERROR ::', err);
          this.refreshing_table_spinner = false;
          this.alertService.showWarning('Error: ' + err);
        });
    });
    return promise;
  }

  onSearchBtnClickedEvent(data) {
    console.log('clicked', data);
    this.refreshing_table_spinner = true;
    this.noData = false;
    this.showTable = false;
    this.loadingScreenService.startLoading();
    this.selectedValues = data;
    if (this.selectedValues && this.selectedValues.length) {
      const values = this.selectedValues.reduce((obj, item) => (obj[item.FieldName] = item.Value, obj), {}) as any;
      const { '@DistrictId': districtId, '@BranchId': branchId, '@DistributorId': distributorId, '@attendancePeriod': attendancePeriod, } = values;
      // this.clientID = clientId;
      // this.clientContractId = clientContractId;
      this.branchId = branchId;
      this.attendancePeriodId = attendancePeriod;
      this.getAttendanceSummaryReportData().then((result) => {
        this.loadingScreenService.stopLoading();
        if (result != null) {
          this.refreshing_table_spinner = false;
          console.log('PROMISE RESOLVE ::', result);
        }
      });
    }
  }

  exportExcel() {
    this.excelService.exportToExcelFromTable(this.table, 'Attendance_Summary_Daily_Report');
  }

}
